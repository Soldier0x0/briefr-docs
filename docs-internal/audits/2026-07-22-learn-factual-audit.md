# Learn factual audit — 2026-07-22
Pin: 04aba1ad17d18c1c45175881ceef56b7112abb36

## Fixes

- **normalize.mdx, enrich.mdx, correlate.mdx, hunt.mdx, detect.mdx, prioritize.mdx, sources/nvd.mdx, sources/kev.mdx, sources/epss.mdx, sources/otx.mdx**: `InTheCode` path `backend/routers/cves.py` → `{path: 'backend/routers/cves', kind: 'tree'}`. The module was refactored from a single file into a package (`backend/routers/cves/` directory with `__init__.py`, `detail.py`, `list.py`, `intel.py`, etc.) at the pinned SHA. All ten files referenced the old `.py` path which no longer exists; changed to the directory path with `kind: 'tree'` so the GitHub link resolves correctly.

- **correlate.mdx, sources/epss.mdx**: `InTheCode` path `frontend/src/components/DetailDrawer.jsx` → `{path: 'frontend/src/components/DetailDrawer', kind: 'tree'}`. The component was refactored from a single JSX file into a directory (`frontend/src/components/DetailDrawer/` with `index.jsx`, `OverviewTab.jsx`, `IntelTab.jsx`, etc.) at the pinned SHA. Changed to the directory path with `kind: 'tree'`.

- **sources/nvd.mdx, sources/kev.mdx, sources/epss.mdx, sources/otx.mdx**: H2 header `## How industry does it - and why BRIEFR does it this way` (hyphen) → `## How industry does it — and why BRIEFR does it this way` (em-dash). Normalized to match the spine chapter style.

- **sources/index.mdx**: "How to read these pages" list item 6 updated from hyphen to em-dash to match the H2 style: `How industry does it — and why BRIEFR does it this way`.

- **intel-lifecycle/index.mdx**: Table and bottom links changed from bare `intel-lifecycle/collect` style (resolves incorrectly from Docusaurus category index URLs) to absolute `/docs/how-briefr-works/intel-lifecycle/...` links. The `./slug` form was considered but resolves to the wrong depth from index page URLs in Docusaurus 3; absolute paths are allowed by the task note and build cleanly.

- **how-its-built/index.mdx**: Chapter links changed from bare `how-its-built/ingestion-scheduler` style to absolute `/docs/how-briefr-works/how-its-built/...` links for the same reason. Bottom cross-read link uses absolute `/docs/how-briefr-works/intel-lifecycle/`.

- **prioritize.mdx**: `InTheCode` list trimmed from 9 items to 6. Removed `frontend/src/components/CveDescriptionClamp.jsx` (not cited in prose), `frontend/src/scoring/riskScore.js` (prose explicitly states it does not compute scores — not a primary backend citation), and `frontend/src/utils/pdfReport.js` (not cited by name in prose). Kept the six items most directly tied to prose citations: `backend/routers/cves` (tree), `backend/scoring/risk.py`, `backend/scoring/asset_match.py`, `frontend/src/components/MorningBrief.jsx`, `frontend/src/components/BriefCharts.jsx`, `backend/ai/summary.py`.

## Verified OK (sample)

- **resilience.mdx**: `CIRCUIT_FAILURE_THRESHOLD` default `3`, `CIRCUIT_COOLDOWN_SECONDS` default `60` — confirmed in `backend/resilient_client.py` lines 51–52. Rate limit defaults (`RATE_LIMIT_IOC_PER_MINUTE=30`, `RATE_LIMIT_REFRESH_PER_MINUTE=10`, `RATE_LIMIT_WALLBOARD_PER_MINUTE=60`) confirmed in `backend/.env.example` lines 32–35, `backend/routers/admin/config.py` lines 153–161 (`_env_int` fallbacks), and `docs/SYSTEM_DESIGN.md` line 475. Runtime Pydantic defaults (`rate_limit_ioc_per_minute=30`, etc.) also live in `backend/settings.py` lines 46–49 and are what `backend/rate_limit.py` imports.

- **resilience.mdx**: `BRIEFR_RATE_LIMIT_STORE=db` env var — confirmed in `backend/rate_limit_store.py` line 20 and `.env.example` line 12.

- **prioritize.mdx**: Risk Score v1.1b weights (asset=0.35, KEV=0.25, EPSS=0.15, exploit=0.10, CVSS=0.10, momentum=0.05) — confirmed in `backend/scoring/risk.py` lines 11–17.

- **prioritize.mdx**: VulnCheck KEV tier contributes `0.72` to KEV component — confirmed in `backend/scoring/risk.py` lines 281–282.

- **enrich.mdx, sources/epss.mdx**: IOC cache "roughly six-hour window" — confirmed: `_IOC_TTL_HOURS = 6` in `backend/db/cache.py` line 16.

- **correlate.mdx**: Correlation cache key `correlation:v2:{cve}:{sector}` — confirmed in `backend/correlation/engine.py` line 436.

- **correlate.mdx**: `CORRELATION_PRECOMPUTE_MAX_PER_RUN` — confirmed in `backend/correlation/config.py` line 80; `CORRELATION_HUB_CVE_PULSE_CAP` — confirmed in `backend/correlation/config.py` line 33.

- **collect.mdx, normalize.mdx, sources/nvd.mdx**: `InTheCode` paths `backend/scheduler.py`, `backend/resilient_client.py`, `backend/feeds/nvd.py`, `backend/db/cve.py`, `backend/database.py` — all confirmed present at pin.

- **sources/kev.mdx**: `backend/webhooks/engine.py` — confirmed present at pin.

- **sources/otx.mdx**: `backend/ioc/retro_match.py` — confirmed present at pin.

- **detect.mdx**: `backend/detection/backlog.py`, `backend/detection/rule_sources.py`, `backend/detection/siem_queries.py`, `backend/detection/sigma_generator.py`, `backend/notifications/emit.py` — all confirmed present at pin.

- **hunt.mdx, detect.mdx**: `backend/routers/forge.py` — confirmed present at pin.

- **enrich.mdx**: `backend/enrichment/ioc.py`, `backend/feeds/osv.py`, `backend/feeds/extended.py`, `backend/feeds/otx.py` — all confirmed present at pin.

- **resilience.mdx**: `backend/resilient_client.py`, `backend/rate_limit.py`, `backend/scheduler.py` — all confirmed present at pin.
