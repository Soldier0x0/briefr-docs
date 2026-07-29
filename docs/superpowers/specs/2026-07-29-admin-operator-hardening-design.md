# Admin & Operator Hardening — Design Spec

**Date:** 2026-07-29  
**Repos:** `Soldier0x0/briefr` (implementation), `Soldier0x0/briefr-docs` (plans/specs)  
**Status:** Draft — awaiting operator review before implementation

---

## Problem statement

Operators and analysts using the BRIEFR admin panel report inaccurate or opaque resource/database metrics, confusing API metering and token UX, scroll-position bugs when switching tabs, scheduler jobs that appear stuck on a single LLM provider, no audit trail for outbound API calls (e.g. GreyNoise quota drift), and inconsistent terminology (“auto-checked every X” vs heartbeat). IOC lookup and several admin panels need responsive polish and clearer visual hierarchy.

This spec decomposes the work into **six independent sub-projects** that can ship as separate PRs without blocking each other.

---

## Sub-project decomposition

| ID | Sub-project | User items | Primary repo paths |
|----|-------------|------------|-------------------|
| **A** | Ops charts & storage clarity | Prior “all of these” (backup/webhook/resources charts) | `frontend/src/pages/admin/shared/OpsCharts.jsx`, `StoragePage.jsx`, `backend/routers/admin/storage.py` |
| **B** | Admin UX quick fixes | 3, 8, 9, 10, 13, 14 | `AdminPage.jsx`, `ApiKeysPage.jsx`, `SearchTokensPanel.jsx`, `Sidebar.jsx`, `OverviewPage.jsx` |
| **C** | Resources & DB observability | 1, 2 | `ResourcesPage.jsx`, `resource_collector.py`, `DatabasePage.jsx`, `db/explorer.py` |
| **D** | API audit trail & metering | 11 (+ extends 10) | `db/api_metering.py`, `ApiKeysPage.jsx`, new `ApiCallAuditPage` or panel |
| **E** | Configurable limits & AI providers | 4, 5, 6 | `source_rate_limits.py`, `config_schema.py`, `ai/llm_router.py`, `scheduler.py` |
| **F** | Tool-wide responsive & IOC polish | 7, 12 | `IOCLookup.jsx`, `RateLimitPage.jsx`, `SecurityPage.jsx`, shared CSS tokens |

**Recommended ship order:** A → B → C → D → E → F (each phase is independently testable).

---

## Root-cause analysis (confirmed in codebase)

### Scroll position carries across tabs (item 3)

**Symptom:** Scroll down on Resources, switch to API Keys & Config — new tab opens mid-scroll.

**Current design:** `AdminPage.jsx` renders one `.admin-page-scroll` div per visited tab (`hidden={page !== id}`). `AdminPage.css` explicitly documents per-tab scroll isolation.

**Likely RCA (needs verification in browser):**
1. **Window-level scroll** — if content overflows a parent without `overflow: hidden`, the browser window scrolls instead of `.admin-page-scroll`, and tab switches do not reset `window.scrollY`.
2. **First-visit expectation mismatch** — per-tab scroll is *preserved* when revisiting a tab; operators expect **scroll-to-top on every tab change**.
3. **Flex + `hidden` edge case** — multiple `flex: 1` siblings; unlikely but test on deployed build.

**Fix (recommended):** On `setPage(id)`, scroll the active `.admin-page-scroll` to `0` and call `window.scrollTo(0, 0)`. Optionally keep per-tab memory behind a preference later; default = top on switch.

### DB table browser dropdown shows 0 rows (item 2)

**Symptom:** Table list shows tables but dropdown labels show `(0 rows)`.

**RCA:**
- On **PostgreSQL**, `fetch_table_catalog` uses `pg_class.reltuples` (estimates). Stale stats → `0` until `ANALYZE`.
- UI in `DbExplorerPanel.jsx` displays `row_count` as exact: `` `${t.label} (${t.row_count.toLocaleString()} rows)` `` with **no** `row_count_estimated` indicator.
- SQLite path uses `COUNT(*)` and is accurate.

**Fix:** Backend: run `COUNT(*)` for catalog (cached 5 min) or trigger `ANALYZE` on explorer open. Frontend: show `~12,345 rows (est.)` when `row_count_estimated`, refresh counts after row loads.

### Scheduler “stuck” on one LLM provider (item 5)

**Symptom:** `Detection Context LLM Enrichment — openrouter…` visible ~20 min.

**RCA chain:**
1. `chat_completion_task` in `llm_router.py` **does** failover on empty content (`mark_provider_empty_response` → next provider).
2. **Stuck appearance** likely from: (a) long HTTP timeout on hung provider (`scheduler_llm_timeout()`), (b) job lock held for entire CVE batch, (c) `on_provider_attempt` callback updates scheduler UI to current provider name without clearing on failover, (d) queue pacing wait (`api_queue`) blocking without timeout surfacing in admin.
3. `is_provider_skipped_in_job` skips providers that returned empty **earlier in the same job run** — correct for failover but can leave job on last provider if all fail slowly.

**Fix:** Per-provider attempt timeout (≤ job timeout), expose attempt/failover in scheduler job detail, release lock on per-CVE timeout, add “stuck job” detector (LOCKED > N× expected duration).

### GreyNoise quota drift (item 11)

**RCA:** GreyNoise is called from IOC lookup (`feeds/extended.py`), enrichment paths, and possibly background jobs. `api_call_events` already records every `resilient_request` attempt with `source`, `actor_type`, `job_id`, `run_id`, `request_id` — but **no admin UI** exposes per-event audit (only 24h rollups in API Keys).

**Fix:** New audit panel querying `api_call_events` with filters (source, time, actor, destination). GreyNoise remains opt-in on IOC lookup (`includeGreynoise` checkbox).

### Search API tokens confusion (item 9)

**RCA:** Feature is for **programmatic hybrid search** (`briefr_search_*` bearer tokens). Panel copy is jargon-heavy; `SearchTokensPanel.jsx` has bugs: `adminApi.get` not parsed (`res?.data` always empty), toast API mismatch (`toast.success` vs `show(msg, ok)`).

**Fix:** Rename section to “Programmatic search access”, add “When you need this” bullet list, fix load/toast bugs. Hide section when search API disabled.

### Resources “floor/ceiling” (item 1)

**Current:** `resource_collector.py` samples BRIEFR process tree + Postgres PIDs via psutil; charts show peak/avg/low from `resource_metrics` table. **No host hardware ceiling** (total RAM, CPU cores, disk capacity) in API or UI.

**Fix:** Extend `GET /api/admin/resources` with `host_profile` from psutil (`virtual_memory().total`, `cpu_count()`, disk usage for DB path) — all dynamic, never hardcoded. UI: consumption bar = `used / total` with labels.

### Outbound rate limits not user-configurable (item 4)

**Current:** `source_rate_limits.py` defines `PACING_PROFILES` from provider docs; only `OPENROUTER_DAILY_LIMIT` is env-overridable. Inbound limits are in `config_schema.py` (`RATE_LIMIT_*`).

**Fix:** Add `outbound_pacing` section to config schema (per-source `min_interval_seconds`, optional daily caps) stored in `app_settings`, defaults = current free-tier values. `get_source_pacing()` reads DB override then falls back to code defaults.

### Custom AI providers (item 6)

**Current:** Fixed chain in `ai/model_catalog.py` (Groq → Cerebras → OpenRouter → Gemini). No Deepseek, Kimi, OpenAI, Claude as first-class providers.

**Recommended approach:** **Catalog + custom slot**
- Built-in catalog entries for Deepseek, Kimi, OpenAI, Claude, Gemini with known base URLs and default models.
- One “Custom OpenAI-compatible” slot: user supplies `base_url`, `api_key`, `model` (validated regex: `^[a-zA-Z0-9._:/-]+$`).
- Strict guards: per-user daily token cap, per-minute request cap, duplicate-click debounce, admin-visible usage in `ai_operations`.

### IPv4/IPv6 in Security & Inbound limits (item 7)

**Current:** `rate_limit.py` `client_key()` returns raw peer strings; UI renders verbatim.

**Fix:** Parse with `ipaddress`; display dual stack: `IPv4: x.x.x.x | IPv6: y::z` or `N/A`. Show private addresses (operator needs to see LAN clients).

---

## Design decisions (recommended)

### 1. Resource optimization without losing function

| Area | Optimization | Preserves |
|------|--------------|-----------|
| `resource_metrics` retention | Tune sample interval / retention window via config | Full window charts |
| `api_call_events` | Keep 30d; add rollup table for >90d trends | Audit trail |
| Postgres explorer counts | Cache `COUNT(*)` 5 min per table | Accurate dropdown |
| LLM job | Per-CVE timeout + failover | Enrichment quality |

No silent feature removal; all optimizations behind config defaults matching today.

### 2. Database tab metrics (replace “integrity OK” only)

New **Database health** panel:
- Engine, version, connections, cache hit ratio (PG), DB file size, WAL size, index bloat estimate (PG)
- Table count / largest tables (from existing `storage_metrics.py`)
- **Projected disk** — linear regression on `resource_metrics.db_bytes` + backup growth → 30/90 day projection with color: green <70%, amber 70–90%, red >90%
- Integrity check moves to collapsible “Diagnostics” sub-section

### 3. API Keys & Config visual hierarchy (item 10)

- Section titles: `text-transform: uppercase`, `--type-label` size (13px → 14px)
- Keys: `--admin-text-muted`; values: `--admin-text` + `font-weight: 500`
- Metering: replace flex bar list with `AdminDataGrid` 3-column table (`Source | Last called | Calls`) — aligns headers and values

### 4. Terminology — heartbeat (item 14)

| Old | New |
|-----|-----|
| “refreshes every 30 seconds” | “Status heartbeat every {pollInterval}s” (read from `displayPrefs`) |
| “auto-rechecked every ~10 min” | “Integrity heartbeat ~10 min” |
| “Run check now” (API keys) | “Run heartbeat now” |
| Scheduler interval fields | Keep “interval”; add HelpTip “Scheduler heartbeat interval” |

Centralize in `catalog.js` → `TERM_GLOSSARY.heartbeat`.

### 5. Analyst correlation quality (item 13)

Add `HelpTip` on each metric card in `OverviewPage.jsx` `AnalystOverview`:
- **Confirmation rate** — % of candidate correlations confirmed by evidence rules
- **Rejection rate** — % rejected by guardrails
- **Orphan CVE ratio** — CVEs with no linked intel
- **Median evidence age** — freshness of supporting evidence

Link to docs anchor when available.

### 6. Responsive design (item 12 + F)

Introduce `--shell-*` CSS tokens in `App.css`:
- `--shell-control-height: clamp(40px, 5vh, 48px)`
- `--shell-font-body: clamp(13px, 1.6vw, 15px)`
- IOC lookup: search input full width; Clear + Lookup `flex` row right-aligned; Lookup `btn-primary` min-height 44px
- Admin panels: `minmax(280px, 1fr)` grids; test at 1280×720 split-screen

---

## Out of scope (this cycle)

- Multi-tenant per-user rate limits (single-operator self-host assumed; config is instance-wide)
- Billing integration for paid API tiers
- Removing Search API tokens feature entirely (clarify + fix instead)
- `briefr-demo` full admin parity (sync script only)

---

## Success criteria

1. Resources tab shows dynamic host ceiling vs consumption with psutil-sourced totals.
2. Database tab shows ≥8 live metrics + disk projection; table dropdown row counts match reality (± estimate label on PG).
3. Tab switch always opens at scroll top.
4. Outbound pacing editable in Admin → API Keys with free-tier defaults.
5. LLM enrichment job fails over within 2× per-provider timeout; stuck jobs surface warning in Scheduler.
6. API call audit answers “who called GreyNoise when”.
7. IOC lookup controls meet 44px touch target; readable at 1280px half-width.
8. Status legend removed from sidebar; heartbeat terminology consistent.

---

## Open questions for operator

1. **Scroll behavior:** Always scroll to top on tab change, or remember per-tab position? (Spec assumes always top.)
2. **Custom AI provider:** Prefer fixed catalog only, or catalog + one custom OpenAI-compatible endpoint?
3. **API audit retention:** Keep 30 days or add export-to-CSV for longer retention?
