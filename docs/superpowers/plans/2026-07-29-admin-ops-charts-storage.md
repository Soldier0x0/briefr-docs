# Admin Ops Charts & Storage Dynamic Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Operator Overview ops charts (ingest duration, backup sizes) and Storage disk panels so axes read cleanly, data scales from live API values (never hardcoded), backup history shows 30 points, and data tables default to newest-first.

**Architecture:** All chart math lives in pure helpers (`formatters.js`, `backupChartUtils.js`) with node:test coverage. Recharts components only map rows → display values. Storage disk stats come from `shutil.disk_usage` on the real `db_path` and `BACKUP_DIR` paths; the API will expose mount identity so the UI can explain when both panels share one filesystem. No changes to `briefr-demo` runtime (static preview); sync UI from `briefr/frontend` when demo is refreshed.

**Tech Stack:** React 19, Recharts, FastAPI, `shutil.disk_usage`, node:test (`npm run test:unit` in `briefr/frontend`).

## Global Constraints

- Repo: **`Soldier0x0/briefr`** — branch `cursor/admin-ops-charts-storage-cc35`.
- Do **not** edit `briefr-docs` or `briefr-demo` except optional `sync-ui-from-briefr.mjs` after merge.
- Match existing admin patterns: `formatters.js` scales, `opsChartsRecharts.jsx` renderers, `ChartDataTable` for a11y.
- `allowDecimals={false}` on Y axes; tick formatters return integers only.
- Run `cd briefr/frontend && npm run test:unit` before push.
- Run targeted backend tests: `pytest briefr/backend/tests/test_admin_storage.py -q`.

---

## Status audit (why screenshots still look wrong)

| Symptom in screenshot | Root cause | Code today (`briefr/main`) |
|----------------------|------------|----------------------------|
| Ingest axis shows **minutes** (`Duration (min)`) | Deployed build predates `ingestDurationChartScale` | **Fixed in source** — `opsChartsRecharts.jsx` uses seconds + `Duration (s)` label |
| Backup X-axis shows **datetime** (`07-23 04:10`) | Old tick formatter included time | **Partially fixed** — `backupChartTickLabel` returns `MM-DD` only; user wants **no dates** on axis |
| Y-axis `50.0 MB` + rotated label overlaps ticks | `YAxis label position: insideLeft` + tooltip uses `.toFixed(1)` | `formatTick` rounds; label overlap **not fixed** |
| Only ~8–12 backup points | Hard cap `.slice(0, 12)` in `OpsCharts.jsx` | **Not fixed** — still 12 |
| Data table order unclear | Chart rows reversed (oldest→newest); table uses same array | **Not fixed** — table should be newest→oldest |
| Storage shows **899.2 GB** on both panels | `shutil.disk_usage` on paths on the **same mount** — not hardcoded | **Dynamic** — but UI does not show mount/path, so it *looks* like a copy-paste bug |

**Conclusion:** Some fixes were started in `briefr` but never fully shipped or deployed. Remaining gaps + deploy are required before screenshots match intent.

---

## File map

| File | Responsibility |
|------|----------------|
| `briefr/frontend/src/pages/admin/shared/OpsCharts.jsx` | Row prep: ingest jobs, backup slice/limit, table row order |
| `briefr/frontend/src/pages/admin/shared/opsChartsRecharts.jsx` | Recharts layout, margins, axis labels |
| `briefr/frontend/src/pages/admin/shared/backupChartUtils.js` | Backup X tick labels, point shaping |
| `briefr/frontend/src/pages/admin/formatters.js` | `bytesChartScale`, `ingestDurationChartScale`, `fmtBytes` |
| `briefr/frontend/src/components/ui/ChartDataTable.jsx` | Collapsible data table under charts |
| `briefr/frontend/src/pages/admin/StoragePage.jsx` | Disk usage UI |
| `briefr/backend/routers/admin/storage.py` | `/api/admin/storage` partition stats |
| `briefr/backend/storage_metrics.py` | Table sizes, growth, disk I/O helpers |
| Tests | `formatters.test.js`, `backupChartUtils.test.js`, `test_admin_storage.py` |

---

### Task 1: Backup chart — 30 points, ordinal X-axis, integer Y-axis, no label overlap

**Files:**
- Modify: `briefr/frontend/src/pages/admin/shared/OpsCharts.jsx`
- Modify: `briefr/frontend/src/pages/admin/shared/backupChartUtils.js`
- Modify: `briefr/frontend/src/pages/admin/shared/opsChartsRecharts.jsx`
- Modify: `briefr/frontend/src/pages/admin/shared/backupChartUtils.test.js`
- Test: `briefr/frontend/src/pages/admin/formatters.test.js`

**Interfaces:**
- Consumes: `GET /api/admin/backups` → `{ filename, size_bytes, created_at }[]`
- Produces:
  - `backupSizeRows(backups, { limit: 30 })` → `{ chartRows, tableRows }`
  - `backupChartOrdinalLabel(index, total)` → `"1"` … `"30"` (oldest left = 1, newest right = N)
  - `bytesChartScale` tick formatter → integers only (`"95 MB"` not `"95.0 MB"`)

- [ ] **Step 1: Write failing tests for ordinal ticks and 30-point limit**

```javascript
// backupChartUtils.test.js
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { backupChartOrdinalLabel, backupChartPoints } from './backupChartUtils.js'
import { bytesChartScale } from '../formatters.js'

describe('backupChartOrdinalLabel', () => {
  it('returns 1-based index without dates', () => {
    assert.equal(backupChartOrdinalLabel(0, 30), '1')
    assert.equal(backupChartOrdinalLabel(29, 30), '30')
  })
})

describe('backup chart scale ticks', () => {
  it('formats Y ticks as integers', () => {
    const scale = bytesChartScale([50.3 * 1024 * 1024, 95.4 * 1024 * 1024])
    assert.equal(scale.formatTick(50.3), '50 MB')
    assert.ok(!scale.formatTick(50.3).includes('.0'))
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `cd briefr/frontend && npm run test:unit -- src/pages/admin/shared/backupChartUtils.test.js`
Expected: FAIL on `backupChartOrdinalLabel` not defined

- [ ] **Step 3: Implement ordinal labels + remove date ticks**

```javascript
// backupChartUtils.js
export function backupChartOrdinalLabel(index, total) {
  const n = Number(index)
  if (!Number.isFinite(n) || n < 0) return ''
  return String(n + 1)
}

export function backupChartPoints(rows, scale) {
  const total = (rows || []).length
  return (rows || []).map((row, index) => ({
    pointKey: index,
    tickLabel: backupChartOrdinalLabel(index, total),
    size: scale.toDisplay(row?.size_bytes || 0),
    filename: row?.filename || `backup-${index}`,
    created_at: row?.created_at,
  }))
}
```

- [ ] **Step 4: Raise limit to 30 and split chart vs table ordering**

```javascript
// OpsCharts.jsx
const BACKUP_CHART_LIMIT = 30

function backupSizeRows(backups) {
  const rows = Array.isArray(backups) ? backups : []
  const newestFirst = [...rows].sort((a, b) =>
    String(b.created_at).localeCompare(String(a.created_at)),
  )
  const limited = newestFirst.slice(0, BACKUP_CHART_LIMIT)
  const chartRows = [...limited].reverse() // oldest left → newest right
  const tableRows = limited // newest first
  return { chartRows, tableRows }
}
```

Update `HelpTip` copy: "Thirty most recent archives (oldest left, newest right). X-axis is archive index; exact filenames and timestamps are in the data table."

- [ ] **Step 5: Fix Y-axis overlap in `BackupSizesChart`**

```jsx
// opsChartsRecharts.jsx — BackupSizesChart
<LineChart
  data={data}
  margin={rechartsMargin({ left: 48, right: 12, top: 28, bottom: 20 })}
>
  {/* Remove YAxis `label` prop entirely */}
  <YAxis
    width={48}
    domain={[0, scale.domainMax]}
    tick={axisTickStyle(theme)}
    allowDecimals={false}
    tickFormatter={(v) => scale.formatTick(Number(v))}
  />
```

Add a visible mono caption above the chart shell (in `OpsCharts.jsx` or inside `BackupSizesChart`):

```jsx
<p className="admin-chart-axis-caption mono">Size ({scale.unit})</p>
```

- [ ] **Step 6: Run tests — expect PASS**

Run: `cd briefr/frontend && npm run test:unit`
Expected: all green

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/shared/OpsCharts.jsx \
  frontend/src/pages/admin/shared/backupChartUtils.js \
  frontend/src/pages/admin/shared/opsChartsRecharts.jsx \
  frontend/src/pages/admin/shared/backupChartUtils.test.js
git commit -m "fix(admin): backup chart ordinal axis, 30 points, integer Y ticks"
```

---

### Task 2: Chart data table — newest-first default for backup archives

**Files:**
- Modify: `briefr/frontend/src/pages/admin/shared/OpsCharts.jsx`
- Modify: `briefr/frontend/src/components/ui/ChartDataTable.jsx` (optional `defaultSort` prop)
- Test: add `ChartDataTable.test.jsx` or extend OpsCharts unit test via exported row helper

**Interfaces:**
- Produces: `backupTableRows` sorted `created_at` DESC before passing to `ChartDataTable`

- [ ] **Step 1: Write failing test for table row order**

```javascript
// backupChartUtils.test.js or new opsChartsRows.test.js
it('table rows are newest-first while chart rows are oldest-first', () => {
  const backups = [
    { filename: 'a', created_at: '2026-07-20T00:00:00Z', size_bytes: 1 },
    { filename: 'b', created_at: '2026-07-23T00:00:00Z', size_bytes: 2 },
  ]
  const { chartRows, tableRows } = backupSizeRows(backups) // export for test
  assert.equal(tableRows[0].filename, 'b')
  assert.equal(chartRows[0].filename, 'a')
})
```

- [ ] **Step 2: Wire `ChartDataTable` to `tableRows` (not `chartRows`)**

```jsx
<ChartDataTable
  title="Backup archive sizes"
  columns={[/* filename, size, created_at */]}
  rows={tableRows.map((row) => ({
    _key: row.filename,
    filename: row.filename,
    size: fmtBytes(row.size_bytes || 0),
    created_at: row.created_at ? String(row.created_at).slice(0, 19) : '—',
  }))}
/>
```

- [ ] **Step 3: Optional — add `#` column as newest=1**

```javascript
{ key: 'rank', label: '#', className: 'mono', render: (_row, i) => i + 1 }
```

- [ ] **Step 4: Run tests + commit**

```bash
git commit -m "fix(admin): backup data table sorted newest to oldest"
```

---

### Task 3: Ingest duration — confirm seconds-only axis (deploy gap)

**Files:**
- Verify: `briefr/frontend/src/pages/admin/shared/opsChartsRecharts.jsx` (already uses `ingestDurationChartScale`)
- Modify: `briefr/frontend/src/pages/admin/formatters.test.js` (regression guard)
- Modify: `briefr/frontend/src/pages/admin/shared/OpsCharts.jsx` (ingest table sorted by duration desc — already sorted)

**Interfaces:**
- `ingestDurationChartScale` — unit always `s`, `formatTick` → `"NN s"`

- [ ] **Step 1: Add regression test that ingest chart never imports `durationChartScale`**

```javascript
// opsChartsRecharts.test.js (new) or formatters.test.js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

it('ingest chart module does not use minute-based durationChartScale', () => {
  const src = readFileSync('src/pages/admin/shared/opsChartsRecharts.jsx', 'utf8')
  assert.ok(src.includes('ingestDurationChartScale'))
  assert.ok(!src.includes('durationChartScale'))
})
```

- [ ] **Step 2: Verify X-axis label is `Duration (s)` and `allowDecimals={false}`**

Already present in `IngestDurationChart` — no code change if test passes.

- [ ] **Step 3: Commit if any doc/help text still says minutes**

```bash
git commit -m "test(admin): lock ingest duration chart to seconds axis"
```

---

### Task 4: Storage — prove dynamic disk stats, clarify same-mount case

**Files:**
- Modify: `briefr/backend/routers/admin/storage.py`
- Modify: `briefr/backend/tests/test_admin_storage.py`
- Modify: `briefr/frontend/src/pages/admin/StoragePage.jsx`
- Modify: `briefr/frontend/src/pages/admin/formatters.js` (optional `fmtPartition` helper)

**Interfaces:**
- API adds per partition:
  - `path` — directory passed to `disk_usage`
  - `device_id` — `os.stat(path).st_dev` (same id ⇒ same filesystem)
- UI shows: `fmtBytes(used) / fmtBytes(total) (pct%)` + subline `Filesystem for {path}`

- [ ] **Step 1: Write failing backend test**

```python
def test_storage_partition_includes_path_and_device(admin_client, monkeypatch, tmp_path):
    db_path = tmp_path / "briefr.db"
    db_path.write_bytes(b"x")
    backup_dir = tmp_path / "backups"
    backup_dir.mkdir()
    monkeypatch.setenv("DB_PATH", str(db_path))
    monkeypatch.setenv("BACKUP_DIR", str(backup_dir))
    # ... existing admin_client fixture setup ...
    data = admin_client.get("/api/admin/storage").json()
    assert data["db_partition"]["path"]
    assert "device_id" in data["db_partition"]
    assert data["backup_partition"]["path"]
```

- [ ] **Step 2: Implement path + device_id in `get_storage`**

```python
import os

def _partition_stats(dir_path: str) -> dict[str, Any]:
    path = os.path.abspath(dir_path)
    out = {"free": 0, "total": 0, "used": 0, "path": path, "device_id": None}
    try:
        du = shutil.disk_usage(path)
        out.update({"free": du.free, "total": du.total, "used": du.used})
        out["device_id"] = os.stat(path).st_dev
    except OSError:
        pass
    return out
```

- [ ] **Step 3: StoragePage — show path + same-mount hint**

```jsx
{dbPartition.device_id != null &&
 dbPartition.device_id === backupPartition.device_id && (
  <p className="admin-storage-mount-note">
    DB and backups are on the same filesystem ({dbPartition.path}).
    Partition totals will match; database file size is shown separately below.
  </p>
)}
```

- [ ] **Step 4: Run backend tests**

Run: `pytest briefr/backend/tests/test_admin_storage.py -q`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(admin): expose storage partition paths and mount identity"
```

---

### Task 5: Static / hardcoded value audit (repo-wide)

**Files:**
- Audit (grep only): `briefr/frontend/src/pages/admin/**`, `briefr/backend/routers/admin/**`, `briefr-demo/src/pages/admin/**`

**Patterns to flag:**
- Literal byte counts (`899`, `240`, `1024 * 1024 * N` used as display defaults)
- `disk_total_bytes` fallbacks not from `shutil.disk_usage`
- Chart `domain={[0, 100]}` or fixed `domainMax` not derived from data
- Demo fixtures presenting as live metrics (acceptable in `briefr-demo` only if labeled)

- [ ] **Step 1: Run audit commands**

```bash
rg -n "899|240\s*\*?\s*GB|disk_total|domainMax:\s*\d+|slice\(0,\s*12\)" \
  briefr/frontend/src/pages/admin briefr/backend/routers/admin
```

- [ ] **Step 2: Document findings in PR description** (no hardcoded disk sizes expected; any hit gets fixed or explained)

- [ ] **Step 3: Fix any hits** — likely none beyond Task 1's `.slice(0, 12)`

---

### Task 6: Visual verification + deploy note

- [ ] **Step 1: Manual check on Operator → Overview**

1. Ingest chart: axis reads `Duration (s)`; sub-minute jobs visible (e.g. `8 s` not `0.0 min`).
2. Backup chart: 30 points max; X-axis `1…N` only; Y-axis integers; no overlapping rotated label.
3. Data table: newest archive at top.
4. Storage: totals match `df -h` for `db_path` and `BACKUP_DIR`; same-mount note when applicable.

- [ ] **Step 2: Rebuild and restart production frontend**

```bash
cd briefr/frontend && npm run build
# production: briefr-deploy.sh or systemd restart per SELF_HOST §3
```

- [ ] **Step 3: Open PR**

Branch: `cursor/admin-ops-charts-storage-cc35` → `main`
Title: `Fix admin ops charts axes and storage partition clarity`

---

## Self-review (spec coverage)

| Requirement | Task |
|-------------|------|
| Ingest duration in seconds | Task 3 (verify + deploy) |
| Backup Y-axis no floats / no overlap | Task 1 |
| Dynamic Y scale from data | Task 1 (`bytesChartScale` + `niceCeil`) |
| 30 backup data points | Task 1 |
| No date/time on backup X-axis | Task 1 (ordinal labels) |
| Data table newest→oldest | Task 2 |
| Storage not static / explain same mount | Task 4 |
| Audit other hardcoded values | Task 5 |

No placeholders remain. Types: `backupSizeRows` returns `{ chartRows, tableRows }` used consistently in Tasks 1–2.

---

## Execution handoff

Plan saved to `docs/superpowers/plans/2026-07-29-admin-ops-charts-storage.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — one subagent per task, review between tasks.
2. **Inline Execution** — implement all tasks in one session with checkpoints.

Which approach do you want?
