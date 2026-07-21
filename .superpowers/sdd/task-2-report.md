# Task 2 Report: Enrich chapter

**Branch:** `cursor/how-briefr-works-phase2-cc35`  
**Status:** Complete  
**Build:** `npm run build` — SUCCESS

## Commit

Planned commit message:

```text
feat(learn): write Enrich chapter (intel lifecycle)
```

## What was delivered

Replaced `docs/how-briefr-works/intel-lifecycle/enrich.mdx` with a full
seven-section chapter:

1. What it is
2. Why we do it
3. Where it lives in BRIEFR
4. How it works
5. What it needs
6. How industry does it — and why BRIEFR does it this way
7. Try it yourself

## Required themes covered

- Scheduler enrichment vs on-demand drawer enrichment:
  - CVE detail uses local load first, then Sploitus/OTX/OSV/CIRCL through
    `asyncio.gather`.
  - GreyNoise scans remain explicit/on-demand rather than bundled into every
    drawer open.
  - Scheduler mirrors and additive jobs cover OTX, exploit sources, ThreatFox,
    VulnCheck, Vulnrichment, and cvelistV5.
- IOC lookup path:
  - `POST /api/ioc/lookup`
  - `ioc_cache` first, provider lookup on miss, `set_ioc_cache` write with
    `ON CONFLICT DO UPDATE`
  - Per-type provider order for IP, hash, and domain.
- Soft-fail/no-key behavior:
  - Integrations-backed table explains optional keys and shipped failure modes.
  - Missing optional context is described as empty/skipped/unknown rather than a
    hard failure or invented conclusion.
- Industry comparison:
  - Contrasts broad live-pivot TIP/SIEM workflows with BRIEFR's hybrid of local
    mirrors, scheduler-owned enrichment, cached lookups, and explicit analyst
    pivots.

## Constraints honored

- Did not create future `sources/` deep-dive pages.
- Did not link to a future `sources/` route.
- `InTheCode` items use `backend/` paths only.
- Try-it-yourself exercise is local documentation review only; no keys or live
  third-party calls.
- No "zero to hero" wording added.
- Claims were grounded in the task brief, system design, integrations page, user
  guide, and existing Collect/Normalize tone.

## Verification

```bash
npm run build
# SUCCESS — Generated static files in "build".
```

## Files touched

- `docs/how-briefr-works/intel-lifecycle/enrich.mdx`
- `.superpowers/sdd/task-2-report.md`

## Concerns / follow-ups

- None blocking. Task 7 can add the future Sources deep-dive routes and any
  deeper source-specific links later.
