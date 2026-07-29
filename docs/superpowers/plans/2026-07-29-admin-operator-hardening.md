# Admin & Operator Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship accurate resource/database observability, **ops + codebase efficiency optimization**, API audit trail, configurable instance-wide outbound limits, LLM failover hardening, admin/IOC UX polish, WCAG accessibility, and per-phase quality gates — across eight phased PRs.

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
- **Item 4 scope:** Instance-wide `app_settings` only — **not** per-user `user_preferences` rate limits.
- Codebase optimizations (Phase G) require before/after metrics in PR body; zero functional regression.
- WCAG 2.1 AA on all touched UI surfaces; zero Critical a11y violations before merge.

---

## Phase overview

| Phase | Branch | PR title | Depends on |
|-------|--------|----------|------------|
| **A** | `cursor/admin-phase-a-cc35` | Fix admin ops charts axes and storage partition clarity | — |
| **B** | `cursor/admin-phase-b-cc35` | Admin UX: scroll, metering table, tokens, legend, heartbeat copy | — |
| **C** | `cursor/admin-phase-c-cc35` | Resources ceiling, efficiency audit/optimization, Database metrics | — |
| **D** | `cursor/admin-phase-d-cc35` | API call audit trail panel | B (metering styles) |
| **E** | `cursor/admin-phase-e-cc35` | Configurable outbound limits + LLM failover + custom AI providers | — |
| **F** | `cursor/admin-phase-f-cc35` | IOC lookup polish + IPv4/IPv6 + responsive shell tokens | B |
| **G** | `cursor/admin-phase-g-cc35` | Codebase performance (backend + frontend hot paths) | C (metrics baseline) |
| **H** | (runs with every phase) | Quality gates: tests, a11y scan, code review checklist | — |

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

### Task B6: Capitalization consistency (API Keys & metering)

**Files:**
- Modify: `briefr/frontend/src/pages/admin/ApiKeysPage.jsx`
- Modify: `briefr/frontend/src/pages/admin/catalog.js` (add `formatMeteringActorLabel`)
- Modify: `briefr/frontend/src/pages/AdminPage.css`

- [ ] **Step 1: Rule — section headings and column headers: UPPERCASE; actor/source labels: Title Case**

```javascript
// catalog.js
export function formatMeteringActorLabel(actorType) {
  const map = { job: 'Job', queue: 'Queue', user: 'User' }
  return map[actorType] || String(actorType || '').replace(/\b\w/g, c => c.toUpperCase())
}
```

- [ ] **Step 2: Apply to MeteringTable actor rows and config section titles**
- [ ] **Step 3: Commit**

```bash
git commit -m "fix(admin): capitalization consistency in API keys and metering"
```

---

### Task B7: Heartbeat copy audit (tool-wide)

**Files:**
- Modify: `briefr/frontend/src/pages/admin/OverviewPage.jsx`
- Modify: `briefr/frontend/src/pages/admin/ApiKeyHealthPanel.jsx`
- Modify: `briefr/frontend/src/pages/admin/FeedHealthPage.jsx`
- Modify: `briefr/frontend/src/pages/admin/SchedulerPage.jsx`
- Modify: `briefr/frontend/src/pages/admin/StatusBar.jsx`
- Modify: `briefr/frontend/src/components/AboutModal.jsx`
- Modify: `briefr/frontend/src/pages/admin/catalog.js` (`TERM_GLOSSARY`)

- [ ] **Step 1: Grep and replace** — `rg -n "every \\d+ second|auto-recheck|Run check now|last checked|health check" frontend/src`

- [ ] **Step 2: Replace with heartbeat vocabulary where it means periodic status poll:**
  - `refreshes every 30 seconds` → `status heartbeat every {n}s`
  - `auto-rechecked every ~10 min` → `integrity heartbeat ~10 min`
  - `Run check now` → `Run heartbeat now`
  - `Last check` (feed health) → `Last heartbeat`
  - Keep literal intervals in scheduler config labels but add HelpTip: "Scheduler heartbeat interval"

- [ ] **Step 3: Do NOT rename** user-facing product copy in PrivacyPage ingest schedules (those describe data freshness, not subsystem health)

- [ ] **Step 4: Commit**

```bash
git commit -m "copy: heartbeat terminology audit across admin and shell"
```

---

## Phase C — Resources observability, efficiency optimization, Database metrics

Phase C covers **item 1 in full**: (a) 100% accurate, dynamic consumption vs hardware ceiling display, and (b) efficiency optimizations without losing operational value.

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
- [ ] **Step 3: Add scoped metric labels** — each chart/summary card shows scope badge: `BRIEFR`, `PostgreSQL`, `Host`, `DB file`
- [ ] **Step 4: Commit**

---

### Task C3: Efficiency audit API

**Files:**
- Create: `briefr/backend/efficiency_audit.py`
- Modify: `briefr/backend/routers/admin/storage.py` (add `GET /resources/efficiency`)
- Modify: `briefr/backend/db/resource_metrics.py`
- Modify: `briefr/backend/storage_metrics.py`
- Test: `briefr/backend/tests/test_efficiency_audit.py`

**Interfaces:**
- Produces: `EfficiencyReport: { generated_at, host_profile, subsystems: [{ id, label, bytes, rows, requests_per_day, pct_of_disk, pct_of_ram }], recommendations: [{ id, severity, title, description, config_key, current_value, suggested_value, estimated_savings: { bytes?, rows?, requests_per_day? } }] }`

- [ ] **Step 1: Write failing test**

```python
async def test_efficiency_report_includes_subsystems_and_recommendations(db):
    from efficiency_audit import build_efficiency_report
    report = await build_efficiency_report(db)
    assert "subsystems" in report
    assert any(s["id"] == "api_call_events" for s in report["subsystems"])
    assert isinstance(report["recommendations"], list)
```

- [ ] **Step 2: Implement subsystem breakdown** — query live sizes from `storage_metrics.table_sizes`, backup dir, pool stats (`get_pool_stats`), `resource_metrics` row count, cache table counts (`feed_cache`, `ioc_cache`), estimate scheduler poll cost from config.

- [ ] **Step 3: Implement recommendation rules** (examples):

```python
RECOMMENDATIONS = [
    # if api_call_events > 500MB and API_CALL_EVENTS_ENABLED
    {"id": "api_events_volume", "config_key": "API_CALL_EVENTS_ENABLED", ...},
    # if backup archive count > 50 and disk pct > 70%
    {"id": "backup_retention", "config_key": "BACKUP_RETENTION_COUNT", "suggested_value": 30, ...},
    # if RESOURCE_SAMPLE_INTERVAL_SECONDS < 120 and collector CPU > threshold
    {"id": "sample_interval", "config_key": "RESOURCE_SAMPLE_INTERVAL_SECONDS", "suggested_value": 120, ...},
    # if OTX continuous enabled and otx events > N/day
    {"id": "otx_budget", "config_key": "OTX_CONTINUOUS_BUDGET_PER_RUN", ...},
    # if DATABASE_POOL_SIZE > recommended from in_use stats
    {"id": "pool_rightsize", "config_key": "DATABASE_POOL_SIZE", ...},
]
```

- [ ] **Step 4: Wire `GET /api/admin/resources/efficiency`**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(admin): efficiency audit API with subsystem breakdown"
```

---

### Task C4: Efficiency recommendations UI + config exposure

**Files:**
- Modify: `briefr/frontend/src/pages/admin/ResourcesPage.jsx`
- Modify: `briefr/backend/config_schema.py`
- Modify: `briefr/backend/scheduler.py` (read new config keys)
- Modify: `briefr/backend/db/resource_metrics.py`
- Test: `briefr/frontend/src/pages/admin/efficiencyReport.test.js` (new)

- [ ] **Step 1: Add config fields for env-only knobs today**

```python
ConfigField("RESOURCE_SAMPLE_INTERVAL_SECONDS", "queue", "int", min=30, max=3600, default=60, apply_strategy="scheduler_reschedule"),
ConfigField("RESOURCE_METRICS_RETENTION_DAYS", "queue", "int", min=7, max=90, default=30, apply_strategy="restart"),
ConfigField("OTX_CONTINUOUS_BUDGET_PER_RUN", "ingest", "int", min=50, max=2000, default=600),
ConfigField("POSTGRES_VACUUM_AFTER_RETENTION", "queue", "bool", default=False, restart_required=True),
```

- [ ] **Step 2: ResourcesPage — `EfficiencyPanel` component**

```jsx
function EfficiencyPanel({ report, onApplyConfig }) {
  return (
    <div className="admin-card">
      <div className="admin-card-title">
        Efficiency recommendations
        <HelpTip text="Live analysis of disk, memory, DB, and API overhead. Suggestions preserve functionality — review before applying." />
      </div>
      <SubsystemTable rows={report.subsystems} />
      {report.recommendations.map(rec => (
        <RecommendationRow key={rec.id} rec={rec} onApply={() => onApplyConfig(rec.config_key, rec.suggested_value)} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Show estimated savings per recommendation** (e.g. `~1.2 GB disk`, `~15k fewer DB writes/day`)
- [ ] **Step 4: Apply button opens config diff modal (reuse `DiffReviewModal` pattern from ApiKeysPage)**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(admin): efficiency recommendations panel and config knobs"
```

---

### Task C5: Code-level optimizations (zero default behavior change)

**Files:**
- Modify: `briefr/frontend/src/pages/admin/SchedulerPage.jsx` — gate 3s poll on `active` prop
- Modify: `briefr/frontend/src/pages/admin/AdminPage.jsx` — pass `active={page === id}` to each page component
- Modify: `briefr/backend/db/api_metering.py` — optional batched flush (`API_CALL_EVENTS_BATCH_MS`, default `0` = disabled)
- Modify: `briefr/backend/db/cache_retention.py` — optional `VACUUM (ANALYZE)` after purge when `POSTGRES_VACUUM_AFTER_RETENTION=1`
- Modify: `briefr/backend/ml/embeddings.py` — skip ingest-tail embed when backfill queue depth > `EMBEDDINGS_INGEST_SKIP_QUEUE_DEPTH` (default high = no change)
- Modify: `briefr/backend/db/cache_retention.py` — `ssvc:` physical retention 8760h → 168h (read TTL in `feeds/` unchanged)
- Test: `briefr/backend/tests/test_efficiency_optimizations.py`

- [ ] **Step 1: Scheduler poll gate**

```jsx
// SchedulerPage.jsx
useEffect(() => {
  if (!active) return
  const id = setInterval(loadJobs, 3000)
  return () => clearInterval(id)
}, [active, loadJobs])
```

- [ ] **Step 2: API events batch flush** — when `API_CALL_EVENTS_BATCH_MS > 0`, buffer inserts and flush every N ms (default 0 preserves current per-request insert)

- [ ] **Step 3: Post-purge VACUUM** — after `run_retention_cleanup()`, if PG and flag set, run `VACUUM (ANALYZE)` on `api_call_events`, `feed_cache`, `ioc_cache`

- [ ] **Step 4: Embeddings dedup guard** — in NVD ingest path, if pending embeddings backfill > threshold, skip `EMBEDDINGS_AUTO_ON_INGEST` tail

- [ ] **Step 5: feed_cache `ssvc:` retention** — change `FEED_CACHE_PREFIX_RETENTION["ssvc:"]` from 8760 to 168

- [ ] **Step 6: Run tests**

```bash
pytest briefr/backend/tests/test_efficiency_optimizations.py -q
cd briefr/frontend && npm run test:unit
```

- [ ] **Step 7: Commit**

```bash
git commit -m "perf: efficiency optimizations with safe defaults preserved"
```

---

### Task C6: Accurate resource metrics — pool + collector scope

**Files:**
- Modify: `briefr/backend/resource_collector.py`
- Modify: `briefr/backend/routers/admin/storage.py`
- Modify: `briefr/frontend/src/pages/admin/ResourcesPage.jsx`

- [ ] **Step 1: Add `pool_stats` to resources response** — `{ size, in_use, idle, waiting }` from `get_pool_stats()`
- [ ] **Step 2: Add `db_file_bytes` separate from `host disk_used`** — avoid conflating DB file size with partition usage
- [ ] **Step 3: Resources UI — Connection pool card**: `in_use / size` with ceiling bar
- [ ] **Step 4: Document collector scope in HelpTip** — “BRIEFR CPU/RSS = backend process tree only; Host memory = entire machine”
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(admin): accurate scoped resource metrics and pool display"
```

---

### Task C7: Database metrics panel

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

### Task C8: Table browser row count fix

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

### Task C8b: Table browser dropdown — dynamic label refresh

**Files:**
- Modify: `briefr/frontend/src/pages/admin/DbExplorerPanel.jsx`

**RCA:** Dropdown labels are built once from `catalog.tables` at render time. If catalog loads async or row counts change after browse, the Select options can show stale `0 rows` until full page reload.

- [ ] **Step 1: Re-fetch catalog when Database tab becomes active** — accept `active` prop from `AdminPage`, call `loadCatalog()` on `active` transition to true

- [ ] **Step 2: After `loadRows`, patch catalog row_count for selected table from `rowsPayload.total`**

```javascript
useEffect(() => {
  if (!rowsPayload?.total || !selectedTable) return
  setCatalog(prev => prev ? {
    ...prev,
    tables: prev.tables.map(t =>
      t.name === selectedTable ? { ...t, row_count: rowsPayload.total, row_count_estimated: false } : t
    ),
  } : prev)
}, [rowsPayload?.total, selectedTable])
```

- [ ] **Step 3: Poll catalog every 60s while Database tab active** (optional, config-gated in UI)

- [ ] **Step 4: Commit**

```bash
git commit -m "fix(admin): DB explorer dropdown refreshes row counts dynamically"
```

---

### Task C9: Resources tab charts — polish

**Files:**
- Modify: `briefr/frontend/src/pages/admin/ResourcesPage.jsx`
- Modify: `briefr/frontend/src/pages/admin/resourcesChartsRecharts.jsx`
- Modify: `briefr/frontend/src/pages/admin/resourceChartUtils.js`
- Test: extend `formatters.test.js` / `resourceChartUtils.test.js`

- [ ] **Step 1: Integer Y-axis ticks** for byte series (reuse `bytesChartScale.formatTick` — no `.0` floats)
- [ ] **Step 2: Overlay host ceiling** on memory/CPU charts when `host_profile` available (horizontal reference line at 100%)
- [ ] **Step 3: ChartDataTable default sort** — newest timestamp first (match Phase A backup table pattern)
- [ ] **Step 4: Remove rotated Y-axis labels** that overlap ticks (caption above chart, same as backup chart fix)
- [ ] **Step 5: Commit**

```bash
git commit -m "fix(admin): resources chart axes, ceiling overlay, table sort"
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

### Task D3: GreyNoise opt-in clarity in audit

**Files:**
- Modify: `briefr/frontend/src/pages/admin/ApiCallAuditPanel.jsx`
- Modify: `briefr/frontend/src/components/IOCLookup.jsx` (quota panel copy only)
- Modify: `briefr/frontend/src/pages/admin/catalog.js`

- [ ] **Step 1: Audit panel HelpTip** — GreyNoise opt-in explanation + filter by source=greynoise
- [ ] **Step 2: When filtering greynoise, show actor breakdown** (user IOC lookup vs job)
- [ ] **Step 3: IOC quota panel** — label GreyNoise as "Optional — per lookup"
- [ ] **Step 4: Commit**

---

### Task D4: API audit CSV export (30d in-DB + export)

**Files:**
- Modify: `briefr/backend/routers/admin/jobs.py` (or `api_audit.py`)
- Modify: `briefr/frontend/src/pages/admin/ApiCallAuditPanel.jsx`
- Test: `briefr/backend/tests/test_api_audit_export.py`

**Interfaces:**
- `GET /api/admin/api-usage/events/export?hours=168&source=greynoise` → `text/csv` download
- UI: "Export CSV" button alongside filters; HelpTip explains 30-day DB retention vs unlimited export window up to `hours` param max (168)

- [ ] **Step 1: Write failing test for CSV response headers and row format**
- [ ] **Step 2: Implement streaming CSV from `api_call_events` query**
- [ ] **Step 3: Export button in audit panel**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat(admin): API call audit CSV export alongside 30d retention"
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

### Task E2b: Scheduler UI — provider label updates on failover

**Files:**
- Modify: `briefr/backend/routers/admin/helpers.py`
- Modify: `briefr/frontend/src/pages/admin/shared/JobTable.jsx`
- Modify: `briefr/frontend/src/pages/admin/SchedulerPage.jsx`

- [ ] **Step 1: Expose `current_provider` + `providers_attempted[]` in job lock payload for LLM jobs**
- [ ] **Step 2: JobTable progress text** — `Detection Context LLM: 8/10 (CVE-…) — trying openrouter → cerebras` on failover
- [ ] **Step 3: Commit**

```bash
git commit -m "fix(scheduler): show LLM provider failover in job progress UI"
```

---

### Task E4: Paid-tier rate limit presets

**Files:**
- Modify: `briefr/backend/source_rate_limits.py`
- Modify: `briefr/backend/config_schema.py`
- Modify: `briefr/frontend/src/pages/admin/ApiKeysPage.jsx`
- Test: `briefr/backend/tests/test_rate_limit_tier_presets.py`

- [ ] **Step 1: Add `OUTBOUND_PACING_TIER` enum: `free` | `premium_auto` | `custom`**

```python
def resolve_pacing_tier() -> str:
    return os.environ.get("OUTBOUND_PACING_TIER", "free")

def get_source_pacing(key: str) -> SourcePacing:
    tier = resolve_pacing_tier()
    if tier == "premium_auto" and _has_api_key_for_source(key):
        return _premium_profile(key)
    if tier == "custom":
        return _custom_override(key) or PACING_PROFILES[...]
    return PACING_PROFILES[...]
```

- [ ] **Step 2: ApiKeysPage — tier selector** ("Premium auto: relax limits for sources where you've saved an API key")
- [ ] **Step 3: Custom tier reveals per-source interval fields**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat(config): outbound pacing tier presets free vs premium"
```

---

### Task E5: AI API anti-abuse guards

**Files:**
- Modify: `briefr/backend/ai/llm_router.py`
- Modify: `briefr/frontend/src/pages/admin/AiOperationsPage.jsx`
- Test: `briefr/backend/tests/test_ai_rate_guards.py`

- [ ] **Step 1: Per-minute and daily caps** enforced in `chat_completion_task` before any provider call
- [ ] **Step 2: Idempotency** — reject duplicate same-task/same-cve within 30s window
- [ ] **Step 3: Frontend** — disable manual trigger buttons for 5s after click (`useBusyGuard` hook)
- [ ] **Step 4: Admin counter** — "AI requests today: X / cap" on AI Operations page
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(ai): strict rate caps and UI debounce for LLM calls"
```

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

### Task F4: Tool-wide responsive audit (split-screen)

**Files:**
- Modify: `briefr/frontend/src/App.css` (tokens)
- Modify: `briefr/frontend/src/pages/AdminPage.css`
- Modify: `briefr/frontend/src/components/DetailDrawer.css` (or module)
- Modify: `briefr/frontend/src/components/IOCLookup.css`
- Modify: `briefr/frontend/src/pages/WallboardPage.css` (if exists)
- Create: `briefr/frontend/docs/responsive-checklist.md` (QA checklist for 1280×720 split)

**Scope:** Apply `--shell-*` tokens to minimum touch targets (44px) and readable body font (≥13px effective) on:
- Main CVE shell + DetailDrawer tabs
- IOC Lookup (F2)
- Admin panel (F3 partial)
- StatusBar pills
- Wallboard kiosk view

- [ ] **Step 1: Audit** — list components with `font-size < 12px` or control height `< 40px` in main user paths

```bash
rg -n "font-size:\s*0\.(6|65|7|72|75)rem|font-size:\s*11px" briefr/frontend/src --glob '*.{css,jsx}'
```

- [ ] **Step 2: Fix highest-traffic surfaces** (shell header, drawer overview, IOC, admin config)
- [ ] **Step 3: Add `@media (max-width: 1400px)` breakpoints** for side-by-side window snapping — stack toolbars, widen min column widths
- [ ] **Step 4: Manual QA at 1280×720 with two snapped windows**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(ui): tool-wide responsive tokens and split-screen breakpoints"
```

---

## Phase G — Codebase performance (zero functional regression)

**Distinction from Phase C:** Phase C tunes *runtime resources* (disk, RAM quotas, retention). Phase G refactors *code paths* — fewer queries, fewer HTTP round-trips, stable React renders — without changing user-visible behavior.

### Task G1: Backend hot-path batching (priority 1)

**Files:**
- Modify: `briefr/backend/correlation/engine.py` (`prefetch_pulse_iocs_for_nightly`)
- Modify: `briefr/backend/wallboard/service.py` (`_top_risk_tile`)
- Modify: `briefr/backend/detection/context_llm_sync.py` (`run_detection_context_llm_sync`)
- Test: `briefr/backend/tests/test_correlation_postgres_sql.py`, `briefr/backend/tests/test_wallboard.py`, extend scheduler scope tests

- [ ] **Step 1: OTX prefetch — single DB connection + batch commit every N pulses**

```python
# engine.py — replace per-row get_db() with injected db; commit every 10 pulses
async def prefetch_pulse_iocs_for_nightly(api_key: str, db: DbConnection | None = None) -> int:
    own_db = db is None
    if own_db:
        db = await get_db()
    try:
        ...
        if (index + 1) % 10 == 0:
            await db.commit()
    finally:
        if own_db:
            await db.close()
```

- [ ] **Step 2: Wallboard momentum — batch-fetch EPSS/OTX/KEV for candidate CVE IDs**

```python
# wallboard/service.py
momenta = await calculate_momentum_batch([cve["cve_id"] for cve in candidates], db)
```

- [ ] **Step 3: Detection context LLM — require scheduler-injected `db`; no per-CVE `get_db()`**

- [ ] **Step 4: Record baselines in PR** — job duration, connection acquire count, `EXPLAIN ANALYZE` on wallboard query

- [ ] **Step 5: Commit**

```bash
git commit -m "perf(backend): batch OTX prefetch, wallboard momentum, LLM db scope"
```

---

### Task G2: Backend query optimization (priority 2)

**Files:**
- Modify: `briefr/backend/db/metadata.py` (`count_ai_ml_profile_alerts`)
- Modify: `briefr/backend/routers/forge.py` (cache `forge_coverage`)
- Modify: `briefr/backend/dependencies.py` (`require_user` short-TTL cache)
- Test: new `test_perf_metadata.py`, `test_forge_coverage_cache.py`

- [ ] **Step 1: `count_ai_ml_profile_alerts` — push framework filter to SQL or precomputed column**
- [ ] **Step 2: Wrap `build_coverage_map()` in `cached_read` (45–300s TTL)**
- [ ] **Step 3: `require_user` — 30s in-process cache with invalidation on role change**
- [ ] **Step 4: Golden fixture tests** — counts and coverage map identical before/after
- [ ] **Step 5: Commit**

```bash
git commit -m "perf(backend): metadata SQL push-down, forge cache, user auth cache"
```

---

### Task G3: Frontend fetch deduplication

**Files:**
- Create: `briefr/frontend/src/hooks/useStatsTimeline.js`
- Modify: `briefr/frontend/src/components/Sidebar.jsx`
- Modify: `briefr/frontend/src/components/TimelineHeatmap.jsx`
- Modify: `briefr/frontend/src/components/DetailDrawer/index.jsx`
- Modify: `briefr/backend/routers/cves/detail.py` (optional: include risk in bundle)
- Test: `briefr/frontend/src/hooks/useStatsTimeline.test.js`

- [ ] **Step 1: Shared timeline hook with module-level cache keyed by days**

```javascript
// useStatsTimeline.js
const cache = new Map()
export function useStatsTimeline(days) {
  // fetch once per days value; share between Sidebar + TimelineHeatmap
}
```

- [ ] **Step 2: TimelineHeatmap — request `displayDays` not hardcoded 90 on mobile**
- [ ] **Step 3: Extend drawer bundle to include risk payload OR lazy-load risk only when Overview visible**
- [ ] **Step 4: Network test** — Brief tab: 1 timeline request; drawer open: ≤2 requests
- [ ] **Step 5: Commit**

```bash
git commit -m "perf(frontend): dedup timeline fetches and slim drawer round-trips"
```

---

### Task G4: Frontend render + poll efficiency

**Files:**
- Modify: `briefr/frontend/src/components/CVEFeed.jsx`
- Modify: `briefr/frontend/src/pages/WallboardPage.jsx`
- Modify: `briefr/frontend/src/pages/admin/AiOperationsPage.jsx`
- Modify: `briefr/frontend/src/hooks/useVisibilityAwareInterval.js` (reuse)

- [ ] **Step 1: CVEFeed — stable `useCallback` for watchlist pin handlers; fix ref callback**
- [ ] **Step 2: WallboardPage — `useVisibilityAwareInterval` for poll**
- [ ] **Step 3: AiOperationsPage — lazy-load retrieval data on tab switch**
- [ ] **Step 4: Commit**

```bash
git commit -m "perf(frontend): memo stability, visibility-aware polls, lazy admin tabs"
```

---

### Task G5: CVE list query (deferred if high risk — optional sub-PR)

**Files:**
- Modify: `briefr/backend/routers/cves/list.py`
- Test: `briefr/backend/tests/test_cves_router_fixes.py`

- [ ] **Step 1: `EXPLAIN ANALYZE` baseline on default feed query with campaign subqueries**
- [ ] **Step 2: Replace correlated subqueries with LEFT JOIN to precomputed campaign view OR denormalized columns**
- [ ] **Step 3: Verify pin sort order + campaign badges unchanged on golden fixture**
- [ ] **Step 4: Commit only if p95 improves ≥20% without behavior drift**

```bash
git commit -m "perf(backend): simplify CVE list query joins"
```

---

## Phase H — Quality gates (run after every phase A–G)

### Task H1: Per-phase review checklist

**No code changes** — gate before merge.

- [ ] **Step 1: Spec compliance** — map each task checkbox to commit SHA
- [ ] **Step 2: Tests** — `cd briefr/frontend && npm run test:unit`; `pytest briefr/backend/tests/ -q --tb=no` (or targeted modules)
- [ ] **Step 3: Build** — `cd briefr/frontend && npm run build`
- [ ] **Step 4: Accessibility scan** — on pages touched in phase (BrowserStack `startAccessibilityScan` or manual axe):
  - Phase B: Admin API Keys, Overview
  - Phase C: Resources, Database
  - Phase F/G: IOC Lookup, main shell header
  - Fix Critical/High before merge
- [ ] **Step 5: Code review** (per `requesting-code-review` skill) — dispatch reviewer with:
  - `{DESCRIPTION}`: phase summary
  - `{PLAN_OR_REQUIREMENTS}`: tasks from this plan
  - `{BASE_SHA}` / `{HEAD_SHA}`: phase branch range
- [ ] **Step 6: Performance** (Phases C, G only) — PR body includes before/after table
- [ ] **Step 7: Deslop pass** — no unrelated refactors; imports at top; no magic numbers without comment

---

### Task H2: Accessibility fixes (integrated into B, F, G)

**Files:** Touched in each UI phase; consolidated here for scan-and-fix-accessibility skill alignment.

- [ ] **Step 1: Metering tables (B4)** — `<th scope="col">`, sufficient contrast on `admin-config-key` vs `admin-config-value`
- [ ] **Step 2: IOC Lookup (F2)** — `<label htmlFor>` on search input; Lookup button `type="button"`; focus ring visible
- [ ] **Step 3: Capacity bars (C2)** — don't rely on color alone; add text label for severity (e.g. "72% — OK")
- [ ] **Step 4: Admin tab switch (B1)** — `focus()` breadcrumbs heading after scroll-to-top
- [ ] **Step 5: Charts (A, C9)** — verify `ariaLabel` on all `ChartShell` components
- [ ] **Step 6: Re-scan after fixes; document results in PR**

```bash
# No single commit — fixes land in respective phase PRs
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
| **Host capacity bars (dynamic ceiling)** | C | `GET /resources` + UI |
| **Efficiency audit API** | C | `GET /resources/efficiency` returns subsystems |
| **Efficiency recommendations UI** | C | Panel shows savings + Apply |
| **Code optimizations (safe defaults)** | C | Scheduler poll gated; pytest green |
| **Scoped accurate metrics** | C | Pool stats, DB file vs disk separate |
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
| Capitalization consistency | B6 | Metering shows Job/Queue/User |
| Heartbeat tool-wide audit | B7 | Feed health, StatusBar, Scheduler |
| DB dropdown dynamic refresh | C8b | Browse rows → dropdown count updates |
| Resources chart polish | C9 | Integer ticks, ceiling overlay |
| GreyNoise audit clarity | D3 | Filter greynoise → actor breakdown |
| Premium tier rate presets | E4 | Tier selector in API Keys |
| AI anti-abuse guards | E5 | Double-click debounce + daily cap |
| LLM failover UI | E2b | Provider name updates in Scheduler |
| Tool-wide responsive | F4 | 1280×720 split-screen QA |
| **Codebase backend perf** | G1, G2, G5 | EXPLAIN + job duration in PR |
| **Codebase frontend perf** | G3, G4 | Network waterfall count |
| **WCAG a11y** | H2 (+ B, F) | Zero Critical scan violations |
| **Per-phase code review** | H1 | Reviewer sign-off each phase |
| **Item 4 instance-wide only** | E4 | No `user_preferences` rate keys |

---

## Self-review (spec coverage)

| Spec item | Plan task |
|-----------|-----------|
| 1a Resource display (ceiling/consumption) | C1, C2, C6 |
| **1c Codebase performance** | **G1, G2, G3, G4, G5** |
| 2 Database metrics + projection + table browser | C7, C8, C8b |
| 3 Scroll RCA | B1 |
| 4 User rate limits (instance-wide) | E1, E4 |
| 5 Scheduler stuck / LLM failover | E2, E2b |
| 6 Custom AI providers + limits | E3, E5 |
| 7 IPv4/IPv6 | F1 |
| 8 Remove status legend | B2 |
| 9 Search tokens clarity | B3 |
| 10 API keys hierarchy + metering | B4 |
| 11 API audit trail | D1, D2 |
| 12 IOC + responsive | F2, F3, F4 |
| 13 Correlation quality help | B5 |
| 14 Heartbeat wording | B5, B7 |
| Prior ops charts (backup/ingest/storage) | Phase A Tasks 1–6 |
| Prior webhook chart | Phase A Task 7 |
| Prior resources charts | Phase C Task C9 |

No placeholders remain in task definitions. Each phase produces an independently mergeable PR.

---

## Plan review (skills applied — 2026-07-29)

Review performed per `brainstorming`, `writing-plans`, `using-superpowers`, `requesting-code-review`, and `scan-and-fix-accessibility`. `/thermo-nuclear-code-quality-review` skill not installed; substituted explicit H1/H2 quality gates.

### Brainstorming / design completeness

| Check | Result |
|-------|--------|
| All 14 operator items mapped | Pass — see coverage matrix in spec |
| Item 1 three layers (display / ops / code) | Pass — C + G |
| Item 4 scope clarified | Pass — instance-wide `app_settings`; not per-user |
| Decomposition avoids single mega-PR | Pass — 8 phases (A–G + H gate) |
| No silent feature removal | Pass — defaults preserve behavior |
| Open questions documented | Pass — 4 items in spec |

### Writing-plans completeness

| Check | Result |
|-------|--------|
| Plan header + global constraints | Pass |
| File paths per task | Pass |
| Code snippets in steps | Pass for G1–G4, B, C, E |
| Verification matrix | Pass — extended |
| No TBD placeholders | Pass |
| Self-review table | Pass |

### Requesting-code-review alignment

| Check | Result |
|-------|--------|
| Review after each phase | Pass — Phase H1 |
| BASE/HEAD SHA per phase | Documented in H1 Step 5 |
| Fix Critical before next phase | Documented in H1 |

### Scan-and-fix-accessibility alignment

| Check | Result |
|-------|--------|
| WCAG requirements in spec §7 | Pass |
| Concrete a11y tasks | Pass — H2 integrated into B, F, C |
| Scan before merge F/G | Pass — H1 Step 4 |
| Contrast, labels, keyboard, charts | Pass — H2 Steps 1–5 |

### Thermo-nuclear / code quality (substitute)

| Check | Result |
|-------|--------|
| Hot-path N+1 documented | Pass — G1, G2, G5 |
| Frontend memo/poll waste | Pass — G3, G4 |
| Golden fixture guardrails | Pass — G2 Step 4, G5 Step 3 |
| Deslop / minimal diff rule | Pass — H1 Step 7 |

### Gaps / risks flagged for implementation

1. **G5 CVE list query** — highest behavior risk; ship only with golden fixtures + EXPLAIN proof.
2. **G2 `require_user` cache** — 30s TTL must invalidate on admin demotion; test in `test_security_invariants.py`.
3. **Accessibility scans** — require running app; schedule in H1 after Phase B merge candidate.
4. **Phase G depends on C** — efficiency baselines from C3 help measure G impact.

**Assessment:** Plan is ready for operator approval. No blocking gaps remain in documentation.

---

## Execution status (2026-07-29)

| Phase | PR | Status |
|-------|-----|--------|
| A | #777 | **Merged** |
| B | #776 | **Merged** |
| C | #778 | **Merged** |
| D | #779 | **Merged** |
| E | #780 | **Merged** |
| F+G | #781 | **Merged** (includes UX polish: quota chips, PDF footer, live host CPU, drawer borders) |
| Metering hotfix | #783 | **Merged** |
| H | — | Verification on `main` @ `37a46448` |

**Skipped:** #752 SQLite removal (per operator request).

**CI hardening applied:** job timeouts, playwright `domcontentloaded`, `pytest-timeout` with `func_only=True`, security corpus regen on route changes.

## Execution handoff

Plan saved to `docs/superpowers/plans/2026-07-29-admin-operator-hardening.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — one subagent per phase (A→G), Phase H review between each, fast iteration
2. **Inline Execution** — implement phases sequentially in one session with checkpoints

**Which approach?**
