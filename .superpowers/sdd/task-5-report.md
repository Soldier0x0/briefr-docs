# Task 5 Report: Exemplar Track B chapter — Resilience

**Branch:** `cursor/how-briefr-works-phase1-cc35`
**Status:** Complete
**Build:** `npm run build` — SUCCESS

## Commits

| SHA | Message |
| --- | --- |
| Task commit | `feat(learn): write Resilience exemplar chapter (how it's built)` |

## What was delivered

- Replaced the outline stub in
  `docs/how-briefr-works/how-its-built/resilience.mdx` with a full chapter.
- Added the required MDX imports:
  - `@site/src/components/learn/InTheCode`
  - `@site/src/components/learn/AtEnterpriseScale`
  - `@site/src/components/learn/TryItYourself`
- Filled the fixed chapter sections:
  1. What it is
  2. Why we do it
  3. Where it lives in BRIEFR
  4. How it works
  5. What it needs
  6. How industry does it — and why BRIEFR does it this way
  7. Try it yourself
- Covered per-source circuit breakers, retries and `Retry-After`,
  `retries=0` for quota-billed sources, inbound token buckets for IOC lookup /
  refresh / wallboard, and the single scheduler owner rule for multi-worker API
  deployments.
- Used backend-prefixed `InTheCode` paths:
  - `backend/resilient_client.py`
  - `backend/rate_limit.py`
  - `backend/scheduler.py`
- Added an `AtEnterpriseScale` note contrasting gateway/shared-store limiting
  and dedicated enrichment workers with BRIEFR's focused-team, single-box
  default.
- Added an optional `TryItYourself` walkthrough based on self-hosted
  `GET /api/health` `feeds.sources` fields only.

## Source grounding

Claims were drawn from the requested source docs:

- `docs/developer-guide/system-design.md`
  - resilient outbound HTTP, retries, `Retry-After`, circuit breakers, health
    registry, quota-billed `retries=0`, CIRCL negative caching, and inbound
    token-bucket defaults
- `docs/admin-guide/operations.md`
  - multiple uvicorn workers, `BRIEFR_RATE_LIMIT_STORE=db`, and single scheduler
    owner rules
- `docs/security-guide.md`
  - proxy posture and token-bucket protection for IOC lookup and refresh routes

## Verification

```bash
npm run build
# SUCCESS — Generated static files in "build"

# Banned phrase scan against resilience.mdx: SUCCESS — no matches
```

## Deviations from brief

- None.

## Concerns / follow-ups

- None.

## Files touched

- `docs/how-briefr-works/how-its-built/resilience.mdx`
- `.superpowers/sdd/task-5-report.md`
