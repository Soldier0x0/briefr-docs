# Task 5 Report: Detect

**Branch:** `cursor/how-briefr-works-phase2-cc35`
**Status:** Complete
**Build:** `npm run build` - SUCCESS

## Commits

| SHA | Message |
| --- | --- |
| `76ce4a2` | `feat(learn): write Detect chapter (intel lifecycle)` |

## What was delivered

- Replaced the outline stub in
  `docs/how-briefr-works/intel-lifecycle/detect.mdx` with a full chapter.
- Added the required MDX imports:
  - `@site/src/components/learn/InTheCode`
  - `@site/src/components/learn/TryItYourself`
- Filled the seven chapter sections:
  1. What it is
  2. Why we do it
  3. Where it lives in BRIEFR
  4. How it works
  5. What it needs
  6. How industry does it - and why BRIEFR does it this way
  7. Try it yourself
- Covered Sigma generation, SIEM query templates, the drawer Detect tab,
  file-based proof bench behavior, and the KEV detection backlog.
- Used backend-prefixed `InTheCode` paths:
  - `backend/routers/cves.py`
  - `backend/routers/forge.py`
  - `backend/detection/rule_sources.py`
  - `backend/detection/sigma_generator.py`
  - `backend/detection/siem_queries.py`
  - `backend/detection/backlog.py`
  - `backend/notifications/emit.py`
- Added an optional `TryItYourself` walkthrough that stays documentation- and
  sandbox-oriented, with no live SIEM requirement.

## Source grounding

Claims were drawn from the requested source docs and adjacent chapter style:

- `docs/developer-guide/system-design.md`
  - Forge Sigma/SIEM template library, drawer Detect tab lazy fetch, proof bench
    boundary, KEV detection backlog, backlog notifications, and live-SIEM
    boundary
- `docs/api-reference.md`
  - detection endpoint shape, generated Sigma supplement, SIEM queries,
    proof-bench request/response, and detection-backlog/dismiss behavior
- `docs/how-briefr-works/intel-lifecycle/hunt.mdx`
  - sibling tone, Forge boundary, and phrasing around local coverage vs live SIEM
- `docs/how-briefr-works/intel-lifecycle/enrich.mdx`
  - sibling lifecycle structure and restrained "not a full TIP/SIEM" framing

## Verification

```bash
npm run build
# SUCCESS - Generated static files in "build"

# Placeholder / banned-phrase scan against detect.mdx: SUCCESS - no matches
```

## Deviations from brief

- None.

## Concerns / follow-ups

- None.

## Files touched

- `docs/how-briefr-works/intel-lifecycle/detect.mdx`
- `.superpowers/sdd/task-5-report.md`
