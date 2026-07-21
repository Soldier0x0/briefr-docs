# Task 4 Report: Hunt chapter

**Branch:** `cursor/how-briefr-works-phase2-cc35`
**Status:** Complete
**Build:** `npm run build` — SUCCESS

## Commits

| SHA | Message |
| --- | --- |
| Task commit | `feat(learn): write Hunt chapter (intel lifecycle)` |

## What was delivered

- Replaced the outline stub in
  `docs/how-briefr-works/intel-lifecycle/hunt.mdx` with a full seven-section
  chapter.
- Added the required MDX imports:
  - `@site/src/components/learn/InTheCode`
  - `@site/src/components/learn/TryItYourself`
- Covered the required themes:
  - Forge hunt packs and technique coverage through `hunt_packs`,
    `GET /api/forge/coverage`, `GET /api/hunt-packs/{technique_id}`, and
    `POST /api/hunt-packs/generate`.
  - Investigation pivots as the documented session-only CVE -> IOC -> related
    CVE workflow.
  - Hunting as structured follow-up from BRIEFR intel, not generic red-team
    training.
  - Industry comparison with dedicated detection-engineering platforms versus
    BRIEFR's Forge MVP scope.
- Included `InTheCode` references with `backend/` paths for the documented Forge
  and adjacent pivot code areas.
- Kept the optional TryItYourself section docs/sandbox-oriented and explicit
  about avoiding production pack generation unless intended.

## Source grounding

Claims were drawn from the requested source docs:

- `docs/developer-guide/system-design.md`
  - Forge coverage map over `cve_technique_map`, `cves`, `hunt_packs`, and
    `mitre_techniques`
  - coverage statuses `yours`, `community`, and `gap`
  - `GET /api/hunt-packs/{technique_id}` response contents
  - `POST /api/hunt-packs/generate` pack generation and idempotent upsert
  - Forge boundaries for detection search, proof bench, and KEV backlog
- `docs/user-guide/using-briefr.md`
  - Forge tab as detection coverage and hunt packs
  - CVE -> IOC -> related CVE investigation pivot as session-only browser state
- sibling lifecycle chapters
  - tone, section order, `InTheCode`, and `TryItYourself` pattern

## Verification

```bash
npm run build
# SUCCESS — Generated static files in "build"
```

## Concerns / follow-ups

- The docs portal does not contain the BRIEFR backend source locally. The chapter
  cites backend paths through `InTheCode` based on the requested system-design
  source of truth rather than local backend inspection.

## Files touched

- `docs/how-briefr-works/intel-lifecycle/hunt.mdx`
- `.superpowers/sdd/task-4-report.md`
