# Task 4 Report: Exemplar Track A chapter — Collect

**Branch:** `cursor/how-briefr-works-phase1-cc35`  
**Status:** Complete  
**Build:** `npm run build` — SUCCESS

## Commits

| SHA | Message |
| --- | --- |
| Task commit | `feat(learn): write Collect exemplar chapter (intel lifecycle)` |

## What was delivered

- Replaced the outline stub in `docs/how-briefr-works/intel-lifecycle/collect.mdx`
  with a full chapter.
- Added the required MDX imports:
  - `@site/src/components/learn/InTheCode`
  - `@site/src/components/learn/TryItYourself`
- Filled all seven fixed template sections:
  1. What it is
  2. Why we do it
  3. Where it lives in BRIEFR
  4. How it works
  5. What it needs
  6. How industry does it — and why BRIEFR does it this way
  7. Try it yourself
- Covered scheduler-driven collection versus request-path reads, optional keys,
  feed health, soft-fail behavior, and TIP/SIEM comparison.
- Kept the TryItYourself section self-host/fixture based only. It does not ask
  for API keys and does not perform live third-party calls from the docs.

## Source grounding

Claims were drawn from the requested source docs:

- `docs/integrations.md`
  - scheduler-owned feeds
  - optional keys
  - soft-fail behavior by source
- `docs/user-guide/how-it-works.md`
  - scheduler pulls external intel into the DB
  - UI reads precomputed data
- `docs/developer-guide/system-design.md`
  - `scheduler.py`
  - `resilient_client.py`
  - scheduled jobs, health registry, request-path boundaries, and resilient
    outbound behavior

## Verification

```bash
npm run build
# SUCCESS — Generated static files in "build"

rg -n -i 'zero to hero' docs/how-briefr-works src/components/learn; test $? -eq 1
# SUCCESS — no matches
```

## Deviations from brief

- ~~The InTheCode paths use `scheduler.py` and `resilient_client.py`, matching the
  names cited directly in `docs/developer-guide/system-design.md`.~~ **Fixed** — see Post-review fix below.

## Concerns / follow-ups

- ~~None for Task 4.~~ **Fixed** — InTheCode paths corrected in post-review fix.

## Post-review fix (Task 4 review finding)

**Finding:** InTheCode items used bare `scheduler.py` / `resilient_client.py` instead of the brief-specified `backend/` paths.

**Change:** Updated `docs/how-briefr-works/intel-lifecycle/collect.mdx`:

```mdx
<InTheCode
  items={[
    {path: 'backend/scheduler.py'},
    {path: 'backend/resilient_client.py'},
  ]}
/>
```

**Commit:** `fix(learn): use backend/ paths in Collect InTheCode links`

**Build evidence:**

```bash
npm run build
# SUCCESS — Generated static files in "build"
```

## Files touched

- `docs/how-briefr-works/intel-lifecycle/collect.mdx`
- `.superpowers/sdd/task-4-report.md`
