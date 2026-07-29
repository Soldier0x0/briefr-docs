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
| **C** | Resources observability **+ efficiency optimization** | 1, 2 | `ResourcesPage.jsx`, `resource_collector.py`, `efficiency_audit.py`, `config_schema.py`, `DatabasePage.jsx` |
| **D** | API audit trail & metering | 11 (+ extends 10) | `db/api_metering.py`, `ApiKeysPage.jsx`, new `ApiCallAuditPage` or panel |
| **E** | Configurable limits & AI providers | 4, 5, 6 | `source_rate_limits.py`, `config_schema.py`, `ai/llm_router.py`, `scheduler.py` |
| **F** | Tool-wide responsive & IOC polish | 7, 12 | `IOCLookup.jsx`, `RateLimitPage.jsx`, `SecurityPage.jsx`, shared CSS tokens |

**Recommended ship order:** A → B → C → D → E → F (each phase is independently testable).

---

## Full requirement coverage matrix

Cross-check of every point from the operator review (2026-07-29) against the current plan.

| # | Requirement | Status | Phase / task | Gap notes |
|---|-------------|--------|--------------|-----------|
| **Prior** | Ops charts (ingest seconds, backup ordinal/30pt, data table order) | Covered | A (Tasks 1–3) | Deploy gap documented |
| **Prior** | Storage dynamic data + same-mount explanation | Covered | A (Task 4) | — |
| **Prior** | Static/hardcoded value audit | Covered | A (Task 5) | — |
| **Prior** | **Webhook deliveries chart** polish | **Partial** | **A (Task 7 — added)** | Was named in decomposition but had **no tasks**; Y-axis overlap, 7-day cap from 200-row limit |
| **Prior** | **Resources tab charts** polish | **Partial** | **C (Task C9 — added)** | Tooltip/index fix exists; missing ceiling overlay, integer Y ticks, data table default sort |
| 1a | 100% accurate resource display, floor/ceiling, dynamic H/W | Covered | C1, C2, C6 | — |
| 1b | Optimize RAM/CPU/storage/DB without losing function | Covered | C3, C4, C5 | — |
| 2 | Database metrics (not just integrity OK) | Covered | C7 | — |
| 2 | Projected disk utilization with **color** trend | Covered | C7 | Color thresholds in task |
| 2 | Table browser dropdown 0 rows + **not updated dynamically** | **Partial** | C8 + **C8b** | Row-count fix planned; **dynamic refresh** of Select labels when catalog/rows change needs explicit task |
| 3 | Scroll position carries across admin tabs | Covered | B1 | — |
| 4 | User-configurable rate limits for **all** API calls | **Partial** | E1 + **E4** | Outbound pacing planned; **paid-tier presets** (higher limits when operator has premium keys) not explicit; inbound limits already in config but need UI grouping |
| 4 | Defaults = free tier; overrides in `app_settings` DB | Covered | E1, E4 | Instance-wide (self-host operator model) |
| 5 | Scheduler jobs stuck on one provider; failover | Covered | E2 | — |
| 5 | UI shows provider switch during job | **Partial** | **E2b** | Failover exists in code; scheduler UI must update provider label on failover |
| 6 | Custom AI: Deepseek, Kimi, OpenAI, Claude, Gemini | Covered | E3 | — |
| 6 | Catalog **or** user-pasted model name | Covered | E3 | Custom OpenAI-compatible slot |
| 6 | **Strict limits** — bugs, double-click, malicious use | **Partial** | E3 + **E5** | Caps mentioned; **UI debounce, per-route throttle, idempotency keys** need explicit tasks |
| 7 | Security + Inbound limits: IPv4 **and** IPv6, even private | Covered | F1 | — |
| 7 | Show `N/A` when unavailable | Covered | F1 | — |
| 8 | Remove status legend from admin sidebar | Covered | B2 | — |
| 9 | Search API tokens — clarify purpose | Covered | B3 | — |
| 10 | API keys: key vs value color differentiation | Covered | B4 | — |
| 10 | Font size standardization | **Partial** | B4, F3 | B4 = API Keys page only; **F4** extends tool-wide |
| 10 | **Capitalization consistency** (headings + actor labels) | **Partial** | **B6** | BY ACTOR header uppercase but values `job`/`queue`/`user` lowercase — needs explicit rule |
| 10 | BY SOURCE / BY ACTOR aligned table | Covered | B4 | — |
| 11 | API call audit: when, destination, process | Covered | D1, D2 | — |
| 11 | GreyNoise quota explainability; **optional** where available | **Partial** | D2 + **D3** | RCA in spec; **GreyNoise opt-in** callout in audit + IOC docs needs task |
| 12 | IOC: bigger search bar, Clear/Lookup right, Lookup accent | Covered | F2 | — |
| 12 | Quota info legible font | Covered | F2 | — |
| 12 | Responsive/dynamic for **entire tool** (split-screen) | **Partial** | F3 + **F4** | F3 = tokens only; **F4** = shell, drawer, wallboard, analyst views audit |
| 13 | Analyst: explain correlation quality values | Covered | B5 | — |
| 14 | Heartbeat wording **across tool** where relevant | **Partial** | B5 + **B7** | B5 lists ~5 strings; **B7** = repo-wide copy audit (Feed health, StatusBar, Scheduler, About, etc.) |

**Summary:** 14 numbered items are **addressed** in the plan; **9 sub-requirements** were under-specified and are added below (Tasks A7, B6–B7, C8b, C9, E2b, E4–E5, D3, F4).

---

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

### Resources “floor/ceiling” + efficiency optimization (item 1)

Item 1 has **two halves** that must ship together in Phase C:

#### 1a. Accurate consumption display (floor / ceiling)

**Current:** `resource_collector.py` samples BRIEFR process tree + Postgres PIDs via psutil; charts show peak/avg/low from `resource_metrics` table. **No host hardware ceiling** (total RAM, CPU cores, disk capacity) in API or UI. Some metrics can be `NULL` (Postgres invisible to psutil).

**Fix:**
- Extend `GET /api/admin/resources` with `host_profile` from psutil (`virtual_memory().total`, `cpu_count()`, `shutil.disk_usage` on DB path) — dynamic per host, never hardcoded.
- UI: consumption bars = `used / ceiling` for Memory, CPU (normalized to cores), Disk (DB volume + backup volume separately).
- Label every metric with **scope**: `BRIEFR process tree`, `PostgreSQL`, `Host`, `Database file` so operators know what is included.
- Surface `NULL` metrics as `N/A` with HelpTip explaining why (e.g. Postgres PIDs not visible).

#### 1b. Resource efficiency optimization (without losing function)

**Current gaps (audit findings):**

| Area | Current behavior | Waste / risk | Safe optimization |
|------|------------------|--------------|-------------------|
| `resource_metrics` sampling | Every **60s** (env only, not in admin config); **30d** retention hardcoded | ~43k rows/30d; 50ms `cpu_percent` block per tick | Expose `RESOURCE_SAMPLE_INTERVAL_SECONDS` + `RESOURCE_METRICS_RETENTION_DAYS` in config; default unchanged |
| `api_call_events` | Every HTTP attempt → separate `INSERT` + `commit` + new pool connection | Write amplification during OTX/NVD ingest | Optional batched flush (1s window); rollup table for aggregates; admin toggle already exists (`API_CALL_EVENTS_ENABLED`) |
| `feed_cache` | `ssvc:` prefix retained **8760h** (1 year) | Large JSON blobs on disk | Shorten physical retention to 168h if SSVC re-fetch is cheap; read TTL unchanged |
| OTX continuous | **600 calls / 5 min** default | Dominant API + DB event source | Tunable via `OTX_CONTINUOUS_BUDGET_PER_RUN`; surface in efficiency panel |
| Embeddings on ingest | `EMBEDDINGS_AUTO_ON_INGEST=1` runs **in addition to** periodic backfill | Duplicate CPU/RAM during NVD ingest | Dedup: skip ingest-tail embed when backfill queue depth > threshold |
| Scheduler DB semaphore | `SCHEDULER_DB_CONCURRENCY=3` | Pool pressure when raised | Right-size guidance from live pool stats |
| Admin frontend | Scheduler tab polls **every 3s** even when hidden | Wasted API traffic | Gate poll on `active={page==='scheduler'}` |
| Admin frontend | Visited tabs stay mounted (`hidden`) | DOM + background effects | Unmount inactive tabs OR pause polls (B preserves scroll fix separately) |
| Backups | **100** archives × 6h interval | Disk on small VMs | Expose savings estimate; recommend `BACKUP_RETENTION_COUNT=30–50` on constrained hosts |
| Postgres maintenance | Daily DELETE purges; **no VACUUM** | Table bloat after `api_call_events` / cache purges | Optional `VACUUM (ANALYZE)` after retention job (config-gated) |
| Connection pool | Default **10–20** connections | RAM on small VMs | Display `in_use / max` in Resources; recommend size from workers + scheduler concurrency |

**Approach (audit-first, no silent cuts):**

1. **Baseline snapshot** — new `GET /api/admin/resources/efficiency` returns live consumption breakdown by subsystem (DB tables, caches, backups, collector overhead, scheduler jobs, frontend poll cost estimate).
2. **Recommendations engine** — `efficiency_audit.py` compares live metrics against ceilings and config; returns ranked suggestions with **estimated savings** (bytes, rows, requests/day) and **one-click config key** to apply.
3. **Admin UI panel** — Resources tab section “Efficiency recommendations” with Apply / Learn more links; never auto-applies without operator confirmation.
4. **Code-level optimizations** — implement only changes that preserve defaults (zero behavior change on upgrade) but reduce overhead when operators opt in or when obvious bugs exist (e.g. Scheduler poll when tab hidden).
5. **Verification** — each optimization includes before/after measurement hooks surfaced in Resources tab (same API, compare `baseline_id` snapshots).

**Out of scope for optimization:** disabling features by default, removing OTX/embeddings/correlation entirely, or multi-tenant per-user caps.

### Outbound rate limits not user-configurable (item 4)

**Current:** `source_rate_limits.py` defines `PACING_PROFILES` from provider docs; only `OPENROUTER_DAILY_LIMIT` is env-overridable. Inbound limits are in `config_schema.py` (`RATE_LIMIT_*`).

**Fix:** Add `outbound_pacing` section to config schema (per-source `min_interval_seconds`, optional daily caps) stored in `app_settings`, defaults = current free-tier values. `get_source_pacing()` reads DB override then falls back to code defaults.

**Paid-tier presets (item 4 nuance):** Operators with premium API keys (e.g. VirusTotal premium, NVD API key, OTX key) need one-click **tier profiles** — not billing integration:
- `Free tier (default)` — today's `PACING_PROFILES`
- `Premium / keyed` — auto-relax limits for sources where a valid API key is configured (detect via `config` health / key presence)
- `Custom` — per-source overrides

Stored in `app_settings` alongside other operator config (same DB as API keys).

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

Phase C ships **both** accurate metering **and** an efficiency program. Summary:

| Workstream | Deliverable | Preserves |
|------------|-------------|-----------|
| **Display** | Host ceiling bars, scoped labels, `N/A` for unavailable metrics | Full observability |
| **Audit API** | `GET /api/admin/resources/efficiency` — subsystem breakdown | — |
| **Recommendations** | Ranked suggestions with estimated savings + config key | Operator choice |
| **Config exposure** | `RESOURCE_SAMPLE_INTERVAL_SECONDS`, `RESOURCE_METRICS_RETENTION_DAYS`, OTX budget, backup retention — in `config_schema.py` | Current defaults = today’s behavior |
| **Code fixes** | Scheduler poll gated on active tab; optional `api_call_events` batch flush; post-purge `VACUUM ANALYZE` (PG, config-gated) | No silent feature removal |
| **Embeddings dedup** | Skip ingest-tail embed when backfill queue saturated | Search quality (backfill still runs) |
| **feed_cache `ssvc:`** | Physical retention 8760h → 168h (read TTL unchanged) | SSVC data still cached 6h reads |

No silent feature removal; all optimizations behind config defaults matching today or explicit operator Apply in UI.

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

- Per-end-user rate limits in `user_preferences` (self-host uses instance-wide `app_settings`; tier presets are operator-level)
- Billing integration or payment for paid API tiers (tier presets only adjust pacing when keys are present)
- Removing Search API tokens feature entirely (clarify + fix instead)
- `briefr-demo` full admin parity (sync script only)

---

## Success criteria

1. Resources tab shows **100% dynamic** host ceiling vs consumption (psutil-sourced, per-host unique, never hardcoded).
2. Resources tab labels **what each metric includes** (BRIEFR / Postgres / host / DB file) and shows `N/A` when unavailable.
3. Resources tab includes **Efficiency recommendations** panel with estimated savings and links to config keys; operator must confirm before apply.
4. At least **five code-level optimizations** ship with defaults preserving current behavior (scheduler poll gate, config exposure, optional event batching, optional post-purge VACUUM, embeddings dedup guard).
5. Database tab shows ≥8 live metrics + disk projection; table dropdown row counts match reality (± estimate label on PG).
6. Tab switch always opens at scroll top.
7. Outbound pacing editable in Admin → API Keys with **free-tier defaults + premium-tier presets** when API keys are configured.
8. LLM enrichment job fails over within 2× per-provider timeout; stuck jobs surface warning in Scheduler.
9. API call audit answers “who called GreyNoise when”.
10. IOC lookup controls meet 44px touch target; readable at 1280px half-width.
11. Status legend removed from sidebar; heartbeat terminology consistent.

---

## Open questions for operator

1. **Scroll behavior:** Always scroll to top on tab change, or remember per-tab position? (Spec assumes always top.)
2. **Custom AI provider:** Prefer fixed catalog only, or catalog + one custom OpenAI-compatible endpoint?
3. **API audit retention:** Keep 30 days or add export-to-CSV for longer retention?
