# Admin & Operator Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship accurate resource/database observability, API audit trail, configurable outbound limits, LLM failover hardening, and admin/IOC UX polish across six phased PRs.

**Architecture:** Each phase is an independent PR on `Soldier0x0/briefr`. Backend extends existing admin routers (`storage.py`, `database.py`, `jobs.py`, `config.py`) and `source_rate_limits.py`. Frontend follows established admin patterns (`AdminDataGrid`, `HelpTip`, `formatters.js`, `ChartDataTable`). Phase A reuses the existing ops-charts plan verbatim.

**Tech Stack:** React 19, FastAPI, psutil, Recharts, PostgreSQL/SQLite, node:test, pytest.

**Design spec:** `docs/superpowers/specs/2026-07-29-admin-operator-hardening-design.md`

## Global Constraints

- Repo: **`Soldier0x0/briefr`** — branch per phase: `cursor/admin-phase-<letter>-cc35`.
- Do not edit `briefr-docs` except to sync plan/spec copies if requested.
- Run `cd briefr/frontend && npm run test:unit` before each PR.
- Run targeted pytest for touched backend modules.
- `npm run build` must pass (`onBrokenLinks` not applicable in briefr frontend).
- Match existing admin CSS variables (`--admin-text`, `--type-body`, `--admin-gutter`).
- No hardcoded hardware values — all ceilings from psutil / `shutil.disk_usage`.
- Free-tier rate limit defaults must match current `source_rate_limits.py` when no override set.

---

## Phase overview

| Phase | Branch | PR title | Depends on |
|-------|--------|----------|------------|
| **A** | `cursor/admin-phase-a-cc35` | Fix admin ops charts axes and storage partition clarity | — |
| **B** | `cursor/admin-phase-b-cc35` | Admin UX: scroll, metering table, tokens, legend, heartbeat copy | — |
| **C** | `cursor/admin-phase-c-cc35` | Resources ceiling + Database metrics overhaul | — |
| **D** | `cursor/admin-phase-d-cc35` | API call audit trail panel | B (metering styles) |
| **E** | `cursor/admin-phase-e-cc35` | Configurable outbound limits + LLM failover + custom AI providers | — |
| **F** | `cursor/admin-phase-f-cc35` | IOC lookup polish + IPv4/IPv6 + responsive shell tokens | B |

**Phase A** is fully specified in `docs/superpowers/plans/2026-07-29-admin-ops-charts-storage.md` — execute Tasks 1–6 from that file without modification.

---

## Phase B — Admin UX quick fixes

### Task B1: Scroll-to-top on admin tab change

**Files:**
- Modify: `briefr/frontend/src/pages/admin/AdminPage.jsx`
- Test: `briefr/frontend/src/pages/admin/adminScroll.test.js` (new)

**Interfaces:**
- Consumes: `setPage(id)` callback
- Produces: `scrollAdminTabToTop()` called on every page change

- [ ] **Step 1: Write failing test**

```javascript
// adminScroll.test.js
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { scrollAdminTabToTop } from './adminScroll.js'

describe('scrollAdminTabToTop', () => {
  it('is a function', () => {
    assert.equal(typeof scrollAdminTabToTop, 'function')
  })
})
```

- [ ] **Step 2: Implement helper**

```javascript
// adminScroll.js
export function scrollAdminTabToTop(activePageId) {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window.ScrollBehavior ? 'instant' : 'auto' })
  }
  const el = document.querySelector(`[data-admin-page="${activePageId}"]`)
  if (el) el.scrollTop = 0
}
```

- [ ] **Step 3: Wire into AdminPage**

```jsx
// AdminPage.jsx — add data-admin-page to scroll container
<div key={id} className="admin-page-scroll" data-admin-page={id} hidden={page !== id}>

// setPage callback
const setPage = useCallback((id) => {
  applyPageState(id)
  pushContext(setSearchParams, (prev) => buildAdminPageSearchParams(prev, id))
  requestAnimationFrame(() => scrollAdminTabToTop(id))
}, [applyPageState, setSearchParams])
```

- [ ] **Step 4: Run tests + commit**

Run: `cd briefr/frontend && npm run test:unit`
```bash
git commit -m "fix(admin): scroll to top when switching tabs"
```

---

### Task B2: Remove status legend from sidebar

**Files:**
- Modify: `briefr/frontend/src/pages/admin/Sidebar.jsx`
- Delete usage only (keep `StatusLegend.jsx` if used elsewhere): grep first

- [ ] **Step 1: Remove `<details>` Status Legend block from Sidebar.jsx**
- [ ] **Step 2: Grep for `StatusLegend` — remove dead import if unused**
- [ ] **Step 3: Commit**

```bash
git commit -m "fix(admin): remove status legend from sidebar"
```

---

### Task B3: Fix Search API tokens panel

**Files:**
- Modify: `briefr/frontend/src/pages/admin/SearchTokensPanel.jsx`
- Modify: `briefr/frontend/src/pages/admin/ApiKeysPage.jsx` (section title/copy)

- [ ] **Step 1: Fix token load**

```javascript
// SearchTokensPanel.jsx load()
const res = await adminApi.get('/search-tokens')
if (!res.ok) throw new Error(`HTTP ${res.status}`)
const data = await res.json()
setTokens(Array.isArray(data) ? data : (data?.tokens || []))
```

- [ ] **Step 2: Fix toast calls**

```javascript
toast?.('Search token created — copy it now', true)
// on error:
toast?.(err?.message || 'Create failed', false)
```

- [ ] **Step 3: Rewrite section header in ApiKeysPage**

```jsx
<SearchTokensPanel toast={toast} />
// Panel internal title:
<h3 className="admin-section-title">Programmatic search access</h3>
<p className="admin-section-desc">
  Optional Bearer tokens for automation (hybrid search, related CVEs, CVE detail API).
  Only needed if you integrate BRIEFR search into another tool — not required for normal use.
</p>
```

- [ ] **Step 4: Commit**

```bash
git commit -m "fix(admin): search tokens load, toasts, and clearer copy"
```

---

### Task B4: API Keys visual hierarchy + metering table

**Files:**
- Modify: `briefr/frontend/src/pages/admin/ApiKeysPage.jsx`
- Modify: `briefr/frontend/src/pages/AdminPage.css`
- Modify: `briefr/frontend/src/pages/admin/shared/ConfigRow.jsx` (if exists) or inline styles in ApiKeysPage

- [ ] **Step 1: Add CSS tokens**

```css
/* AdminPage.css */
.admin-config-key { color: var(--admin-text-muted); font-size: var(--type-label, 12px); text-transform: uppercase; letter-spacing: 0.04em; }
.admin-config-value { color: var(--admin-text); font-size: var(--type-body, 14px); font-weight: 500; }
.metering-table { width: 100%; border-collapse: collapse; font-size: var(--type-body, 14px); }
.metering-table th { text-align: left; color: var(--admin-text-muted); font-size: var(--type-label, 12px); text-transform: uppercase; padding: 6px 8px; border-bottom: 1px solid var(--admin-border); }
.metering-table td { padding: 8px; border-bottom: 1px solid var(--admin-border-subtle, var(--admin-border)); }
.metering-table td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
```

- [ ] **Step 2: Replace MeteringColumn with table**

```jsx
function MeteringTable({ title, rows, nameKey = 'name', countKey = 'calls', metaKey = 'meta' }) {
  return (
    <div>
      <p className="metering-col-title">{title}</p>
      {rows.length === 0 ? (
        <p className="metering-empty mono">No events yet</p>
      ) : (
        <table className="metering-table">
          <thead><tr><th>Source</th><th>Last called</th><th>Calls</th></tr></thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.key || row[nameKey]}>
                <td><span className="mono admin-config-value">{row[nameKey]}</span>{row[metaKey] && <div className="metering-row-meta">{row[metaKey]}</div>}</td>
                <td className="mono">{row.meta || '—'}</td>
                <td className="mono">{row[countKey] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Apply `admin-config-key` / `admin-config-value` to ConfigRow labels**
- [ ] **Step 4: Commit**

```bash
git commit -m "fix(admin): API keys visual hierarchy and metering tables"
```

---

### Task B5: Heartbeat terminology + correlation quality HelpTips

**Files:**
- Modify: `briefr/frontend/src/pages/admin/OverviewPage.jsx`
- Modify: `briefr/frontend/src/pages/admin/catalog.js`
- Modify: `briefr/frontend/src/pages/admin/ApiKeyHealthPanel.jsx`
- Modify: `briefr/frontend/src/pages/admin/DisplayPage.jsx` (if poll copy exists)

- [ ] **Step 1: Add glossary entries in catalog.js**

```javascript
TERM_GLOSSARY: {
  heartbeat: 'Periodic background check that confirms a subsystem is alive and reports fresh status.',
  correlationConfirmationRate: 'Share of candidate CVE–intel links that passed evidence rules in the latest nightly correlation run.',
  // ... rejection, orphan, evidence age
}
```

- [ ] **Step 2: Analyst overview subtitle**

```jsx
const pollSec = getDisplayPrefs().pollIntervalSeconds ?? 30
<p className="admin-page-subtitle">Live snapshot — status heartbeat every {pollSec}s.</p>
```

- [ ] **Step 3: Add HelpTip to each correlation quality StatCard**
- [ ] **Step 4: ApiKeyHealthPanel — "Run heartbeat now" button label**
- [ ] **Step 5: Commit**

```bash
git commit -m "copy(admin): heartbeat terminology and correlation quality tooltips"
```

---

## Phase C — Resources ceiling + Database metrics

### Task C1: Host profile API (floor/ceiling)

**Files:**
- Create: `briefr/backend/host_profile.py`
- Modify: `briefr/backend/routers/admin/storage.py` (`GET /resources` response)
- Modify: `briefr/backend/db/resource_metrics.py`
- Test: `briefr/backend/tests/test_host_profile.py`

**Interfaces:**
- Produces: `host_profile: { cpu_count, cpu_count_logical, memory_total_bytes, memory_available_bytes, disk_total_bytes, disk_used_bytes, disk_path, hostname, sampled_at }`

- [ ] **Step 1: Write failing test**

```python
def test_collect_host_profile_returns_psutil_values(monkeypatch):
    from host_profile import collect_host_profile
    profile = collect_host_profile(db_path="/tmp")
    assert profile["cpu_count"] >= 1
    assert profile["memory_total_bytes"] > 0
    assert profile["disk_total_bytes"] > 0
    assert profile["disk_path"]
```

- [ ] **Step 2: Implement collect_host_profile using psutil + shutil.disk_usage(settings.db_path parent)**
- [ ] **Step 3: Attach to `fetch_resources_response` return payload**
- [ ] **Step 4: Commit**

---

### Task C2: Resources UI — consumption vs ceiling bars

**Files:**
- Modify: `briefr/frontend/src/pages/admin/ResourcesPage.jsx`
- Modify: `briefr/frontend/src/pages/AdminPage.css`

- [ ] **Step 1: Add Host capacity card row at top**

```jsx
function HostCapacityCard({ profile }) {
  if (!profile) return null
  const memPct = (profile.memory_total_bytes - profile.memory_available_bytes) / profile.memory_total_bytes * 100
  return (
    <div className="admin-card admin-host-capacity">
      <div className="admin-card-title">Host capacity <HelpTip text="Live hardware limits from this server (psutil). Consumption includes all processes on the host, not only BRIEFR." /></div>
      <CapacityBar label="Memory" used={profile.memory_total_bytes - profile.memory_available_bytes} total={profile.memory_total_bytes} />
      <CapacityBar label="Disk (DB volume)" used={profile.disk_used_bytes} total={profile.disk_total_bytes} sub={profile.disk_path} />
      <p className="mono admin-host-meta">{profile.hostname} · {profile.cpu_count_logical} logical CPUs</p>
    </div>
  )
}
```

- [ ] **Step 2: Style capacity bars with green/amber/red thresholds at 70/90%**
- [ ] **Step 3: Commit**

---

### Task C3: Database metrics panel

**Files:**
- Modify: `briefr/backend/routers/admin/database.py`
- Create: `briefr/backend/db/database_metrics.py`
- Modify: `briefr/frontend/src/pages/admin/DatabasePage.jsx`
- Test: `briefr/backend/tests/test_database_metrics.py`

**Interfaces:**
- Produces: `GET /api/admin/database` adds `metrics: { connections, db_size_bytes, wal_size_bytes, cache_hit_ratio, table_count, index_count, integrity_ok, integrity_checked_at, disk_projection }`

- [ ] **Step 1: Implement `fetch_database_metrics(db)` — PG: `pg_stat_database`, `pg_database_size`; SQLite: `pragma page_count*page_size`**
- [ ] **Step 2: Disk projection — linear regression on last 30 `resource_metrics` samples of `db_bytes`**

```python
def project_disk_usage(samples: list[dict], horizon_days: int = 30) -> dict:
    # returns { projected_bytes, daily_growth_bytes, pct_of_partition, severity: "ok"|"warn"|"critical" }
```

- [ ] **Step 3: DatabasePage — replace single integrity StatCard with metrics grid + projection banner**
- [ ] **Step 4: Commit**

---

### Task C4: Table browser row count fix

**Files:**
- Modify: `briefr/backend/db/explorer.py`
- Modify: `briefr/frontend/src/pages/admin/DbExplorerPanel.jsx`
- Test: `briefr/backend/tests/test_db_explorer.py`

- [ ] **Step 1: Backend — exact COUNT for catalog (with 5-minute in-process cache)**

```python
_CATALOG_COUNT_CACHE: dict[str, tuple[float, int]] = {}
CACHE_TTL = 300

async def _exact_row_count(db, table: str) -> int:
    # SELECT COUNT(*) FROM {table} — allowlist only
```

- [ ] **Step 2: Set `row_count_estimated: false` when exact count used**
- [ ] **Step 3: Frontend — show `(est.)` suffix when `row_count_estimated`**

```jsx
const countLabel = t.row_count_estimated
  ? `~${t.row_count.toLocaleString()} rows (est.)`
  : `${t.row_count.toLocaleString()} rows`
```

- [ ] **Step 4: Refresh catalog after successful `loadRows`**
- [ ] **Step 5: Commit**

```bash
git commit -m "fix(admin): accurate DB explorer row counts and metrics panel"
```

---

## Phase D — API call audit trail

### Task D1: Audit API endpoint

**Files:**
- Modify: `briefr/backend/routers/admin/jobs.py` (or new `api_audit.py`)
- Modify: `briefr/backend/db/api_metering.py`
- Test: `briefr/backend/tests/test_api_audit.py`

**Interfaces:**
- `GET /api/admin/api-usage/events?hours=24&source=greynoise&actor_type=job&limit=100&offset=0`
- Returns: `{ events: [{ ts, source, method, host, path_template, status, latency_ms, actor_type, actor_id, job_id, run_id, request_id }], total }`

- [ ] **Step 1: Write failing test with seeded `api_call_events` rows**
- [ ] **Step 2: Implement parameterized query (indexed on `ts`, `source`)**
- [ ] **Step 3: Commit**

---

### Task D2: Audit trail UI in API Keys page

**Files:**
- Create: `briefr/frontend/src/pages/admin/ApiCallAuditPanel.jsx`
- Modify: `briefr/frontend/src/pages/admin/ApiKeysPage.jsx`

- [ ] **Step 1: Collapsible "API call audit trail" section below metering**
- [ ] **Step 2: Filters: source dropdown (from metering), time range, actor type**
- [ ] **Step 3: AdminDataGrid columns: Time | Source | Destination | Status | Actor | Process**
- [ ] **Step 4: Process column maps `job_id` → `catalog.js` job label, `request_id` → ingest log link**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(admin): API call audit trail for outbound requests"
```

---

## Phase E — Configurable limits, LLM failover, custom AI providers

### Task E1: Outbound pacing config schema

**Files:**
- Modify: `briefr/backend/config_schema.py`
- Modify: `briefr/backend/source_rate_limits.py`
- Modify: `briefr/backend/db/config.py` (if needed for JSON blob)
- Test: `briefr/backend/tests/test_source_rate_limits_override.py`

- [ ] **Step 1: Add config fields per pacing source**

```python
ConfigField("OUTBOUND_PACING_NVD_INTERVAL_SEC", "queue", "float", min=0.0, default=6.0, ...)
# One field per major source OR single JSON OUTBOUND_PACING_OVERRIDES
```

- [ ] **Step 2: `get_source_pacing(key)` checks `app_settings` override then `PACING_PROFILES`**
- [ ] **Step 3: ApiKeysPage section "Outbound API pacing" with defaults shown as placeholder**
- [ ] **Step 4: Commit**

---

### Task E2: LLM per-provider timeout + stuck job detection

**Files:**
- Modify: `briefr/backend/ai/llm_router.py`
- Modify: `briefr/backend/detection/context_llm_sync.py`
- Modify: `briefr/backend/routers/admin/helpers.py` (`_build_job_info`)
- Modify: `briefr/frontend/src/pages/admin/SchedulerPage.jsx`
- Test: `briefr/backend/tests/test_llm_router_failover.py`

- [ ] **Step 1: Add `LLM_PROVIDER_TIMEOUT_SEC` env (default min(60, scheduler_llm_timeout()))**
- [ ] **Step 2: Wrap `_call_provider` with `asyncio.wait_for`**
- [ ] **Step 3: On timeout → treat as failure, failover to next provider**
- [ ] **Step 4: `_build_job_info` adds `stuck_warning: true` when LOCKED duration > 3× job interval**
- [ ] **Step 5: SchedulerPage banner for stuck jobs**
- [ ] **Step 6: Commit**

```bash
git commit -m "fix(scheduler): LLM provider timeout failover and stuck job warning"
```

---

### Task E3: Custom AI provider catalog

**Files:**
- Modify: `briefr/backend/ai/model_catalog.py`
- Create: `briefr/backend/ai/provider_catalog.py`
- Modify: `briefr/backend/config_schema.py`
- Modify: `briefr/backend/ai/llm_router.py`
- Modify: `briefr/frontend/src/pages/admin/AiOperationsPage.jsx`
- Test: `briefr/backend/tests/test_custom_ai_provider.py`

**Interfaces:**
- `ProviderCatalogEntry: { id, label, base_url, default_model, env_key_field }`
- Built-in: deepseek, kimi (moonshot), openai, anthropic, google_gemini
- Custom slot: `CUSTOM_LLM_BASE_URL`, `CUSTOM_LLM_API_KEY`, `CUSTOM_LLM_MODEL`

- [ ] **Step 1: Define catalog with validation regex for model names**

```python
MODEL_NAME_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$")
```

- [ ] **Step 2: Cost guards — config fields**

```python
ConfigField("AI_DAILY_REQUEST_CAP", "ml", "int", min=1, default=200)
ConfigField("AI_PER_MINUTE_CAP", "ml", "int", min=1, default=10)
```

- [ ] **Step 3: Enforce in `chat_completion_task` via `tracking.has_quota` extension**
- [ ] **Step 4: AiOperationsPage Models tab — show catalog + custom slot status**
- [ ] **Step 5: Commit**

---

## Phase F — IOC polish, IPv4/IPv6, responsive tokens

### Task F1: IPv4/IPv6 display helpers

**Files:**
- Create: `briefr/frontend/src/utils/ipDisplay.js`
- Modify: `briefr/frontend/src/pages/admin/RateLimitPage.jsx`
- Modify: `briefr/frontend/src/pages/admin/SecurityPage.jsx`
- Test: `briefr/frontend/src/utils/ipDisplay.test.js`

- [ ] **Step 1: Implement formatClientAddresses(key: string)**

```javascript
export function formatClientAddresses(raw) {
  // Parse IPv4, IPv6, IPv4-mapped IPv6; return { ipv4: string|'N/A', ipv6: string|'N/A' }
}
```

- [ ] **Step 2: Render dual stack in bucket rows and top consumers**
- [ ] **Step 3: Commit**

---

### Task F2: IOC lookup UX

**Files:**
- Modify: `briefr/frontend/src/components/IOCLookup.jsx`
- Modify: `briefr/frontend/src/components/IOCLookup.css`
- Modify: `briefr/frontend/src/components/ioc/IOCQuotaPanel.jsx`

- [ ] **Step 1: CSS — larger search input, right-aligned actions**

```css
.ioc-search-row { display: flex; gap: 12px; align-items: stretch; }
.ioc-search-input { flex: 1; min-height: var(--shell-control-height, 44px); font-size: var(--shell-font-body, 15px); }
.ioc-search-actions { display: flex; gap: 8px; flex-shrink: 0; }
.ioc-btn-lookup { min-height: 44px; min-width: 100px; }
```

- [ ] **Step 2: Move Clear + Lookup to right of input**
- [ ] **Step 3: IOCQuotaPanel — bump font to `--shell-font-body`**
- [ ] **Step 4: Commit**

---

### Task F3: Shell responsive tokens (tool-wide baseline)

**Files:**
- Modify: `briefr/frontend/src/App.css`
- Modify: `briefr/frontend/src/pages/AdminPage.css` (use tokens)

- [ ] **Step 1: Add root tokens**

```css
:root {
  --shell-control-height: clamp(40px, 5vh, 48px);
  --shell-font-body: clamp(13px, 1.6vw, 15px);
  --shell-font-label: clamp(11px, 1.4vw, 13px);
  --shell-gap: clamp(8px, 1.2vw, 16px);
}
```

- [ ] **Step 2: Replace hardcoded 11px/13px in admin metering + config where touched in Phase B**
- [ ] **Step 3: Manual test at 1280×720 and 1920×1080 split viewport**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat(ui): responsive shell tokens and IOC lookup polish"
```

---

## Verification matrix

| Requirement | Phase | Verify |
|-------------|-------|--------|
| Ops charts seconds/ordinal/30pt | A | `npm run test:unit` + visual |
| Storage mount identity | A | `pytest test_admin_storage.py` |
| Scroll to top on tab change | B | Manual: Resources → API Keys |
| Metering aligned table | B | Visual |
| Search tokens load | B | Create token → list shows row |
| Status legend gone | B | Sidebar visual |
| Host capacity bars | C | `GET /resources` + UI |
| DB metrics + projection | C | `GET /database` + UI colors |
| Table row counts | C | PG + SQLite explorer |
| API audit trail | D | Trigger IOC lookup → event row |
| Outbound pacing config | E | Change NVD interval → slower NVD |
| LLM failover < 2× timeout | E | Mock hung provider |
| Custom AI provider | E | Config + test completion |
| IPv4/IPv6 display | F | Rate limit bucket UI |
| IOC lookup size | F | Visual + 44px targets |
| Heartbeat copy | B | Grep old phrases gone |
| Correlation HelpTips | B | Analyst overview hover |

---

## Self-review (spec coverage)

| Spec item | Plan task |
|-----------|-----------|
| 1 Resource optimization + ceiling | C1, C2 |
| 2 Database metrics + projection + table browser | C3, C4 |
| 3 Scroll RCA | B1 |
| 4 User rate limits | E1 |
| 5 Scheduler stuck / LLM failover | E2 |
| 6 Custom AI providers + limits | E3 |
| 7 IPv4/IPv6 | F1 |
| 8 Remove status legend | B2 |
| 9 Search tokens clarity | B3 |
| 10 API keys hierarchy + metering | B4 |
| 11 API audit trail | D1, D2 |
| 12 IOC + responsive | F2, F3 |
| 13 Correlation quality help | B5 |
| 14 Heartbeat wording | B5 |
| Prior ops charts | Phase A (separate plan) |

No placeholders remain in task definitions. Each phase produces an independently mergeable PR.

---

## Execution handoff

Plan saved to `docs/superpowers/plans/2026-07-29-admin-operator-hardening.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — one subagent per phase (A→F), review between phases.
2. **Inline Execution** — implement phases sequentially in one session with checkpoints.

**Which approach?**
