# Task 4 Review — Ingestion and scheduler

## Findings

1. **Quality issue — incorrect admin module reference in the lock explanation**
   - The chapter says the scheduler shares lock objects with `routers/admin.py` (`docs/how-briefr-works/how-its-built/ingestion-scheduler.mdx:147-149`), but the current vendor tree exposes the shared lock import from `.vendor/briefr/backend/routers/admin/helpers.py:28`, and there is no `.vendor/briefr/backend/routers/admin.py`.
   - This does not break the docs build, but it weakens the "verified from source" standard because the cited implementation location is not real.

2. **Quality issue — `Try it yourself` mixes two different health-response keys**
   - The walkthrough first tells the reader to inspect the `ingest` object and confirms interval data there (`docs/how-briefr-works/how-its-built/ingestion-scheduler.mdx:234-237`), then immediately tells them to compare `ingest_intervals` values (`docs/how-briefr-works/how-its-built/ingestion-scheduler.mdx:240-243`), while the fixture only shows `ingest.intervals` (`docs/how-briefr-works/how-its-built/ingestion-scheduler.mdx:247-263`).
   - The backend currently returns both `ingest` and top-level `ingest_intervals` (`.vendor/briefr/backend/routers/health.py:107-110`), and `ingest` itself already contains `intervals` (`.vendor/briefr/backend/scheduler.py:303-311`). The instructions are therefore confusing even though the underlying payload supports both shapes.

## Checklist

- 7 sections present: ✅
- Outline removed: ✅
- `InTheCode` paths exist under `.vendor/briefr`: ✅ (`backend/scheduler.py`, `backend/scheduler_locks.py`, `backend/feeds/`)
- No invented behavior: ❌ (two source-accuracy issues above)
- `AtEnterpriseScale` is comparative only: ✅
- `TryItYourself` uses no live keys: ✅
- Palette/components used correctly: ✅
- Build claimed green: ✅ (`npm run typecheck && npm run build` re-run locally, both passed)

## Decision

- Spec: ✅
- Quality Approved: ❌
- One-line summary: Chapter structure and build verification pass, but it should not be quality-approved until the admin-module reference and health-payload walkthrough are made source-accurate and internally consistent.
