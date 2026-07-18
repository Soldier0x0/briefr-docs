# BRIEFR docs portal upgrade — design spec

**Date:** 2026-07-19 · **Status:** approved (content-first sequencing, "B")
**Repos:** `briefr-docs` (this repo, portal) · `briefr-main` (canonical docs + code)

## Goal

Take the portal from "shell with honest DRAFTs" to content-complete,
self-refreshing, and ship-ready — while the product repo stays private.
Definition of done: every DRAFT page replaced with real content, real product
screenshots in the User Guide, automated sync from briefr-main, and a deploy
workflow that goes live the moment the repo is flipped public (Phase 4 is
gated on the user's explicit go).

## Non-goals

- Docs versioning (no public releases exist yet)
- Interactive API explorer
- Custom domain (Pages default URL first; DNS later)
- Rewriting canonical briefr-main docs beyond what content requires

## Phasing and checkpoints

Each phase ends at a **checkpoint**: acceptance criteria verified, work
committed, short report to the user. Phases 1–3 proceed without waiting;
Phase 4 (publishing) is a **hard stop** requiring explicit user approval.

### Phase 1 — Baseline refresh

Fast-forward local briefr-main `main` to origin (6 commits), re-run
`scripts/migrate.cjs`, rebuild.
**Checkpoint 1:** strict-link build green on freshly synced content.

### Phase 2 — Content

All new pages follow the existing voice: plain verbs, audience-first,
no marketing, no commercial framing (see roadmap precedent).

1. **Security Guide** (portal-native `docs/security-guide.md`) — written
   from code and ADRs, not imagination: auth/session model, encrypted app
   settings (ADR-006), log redaction (`*_KEY/_TOKEN/_SECRET/_PASSWORD`
   extra-field rule), network exposure + reverse proxy guidance from
   deploy docs, ordered hardening checklist, private vulnerability
   reporting via GitHub Security Advisories.
2. **Integrations** (portal-native `docs/integrations.md`) — per-provider
   entries derived from SYSTEM_DESIGN's external-services table: what it
   adds, key env var, free-tier/quota reality, failure behavior. Plus
   outbound (webhooks). Table stays in sync manually; the page states its
   source of truth.
3. **Release Notes** (`docs/release-notes.md`) — one "Pre-release" entry
   describing current capability honestly; per-release entries start with
   the first tagged release. Policy stated on the page.
4. **User Guide screenshots** — see image pipeline below. Captured from a
   locally running seeded instance (≥10 CVEs seeded or scheduler quieted —
   known SQLite login-lock). Shots follow `briefr-main/docs/IMAGE_BRIEFS.md`
   §1.x briefs (feed, brief tab, detail drawer, IOC lookup, admin security).
   Canonical placement in briefr-main via PR (docs rule: canonical docs
   change through the main repo).

**Checkpoint 2:** zero DRAFT badges left; screenshots render on the portal;
build green.

### Phase 3 — Sync automation + deploy workflow

- `.github/workflows/sync.yml` in briefr-docs: weekly cron + manual
  dispatch → checkout briefr-main (fine-grained PAT secret
  `BRIEFR_MAIN_READ_TOKEN`, contents:read — **user must create this**,
  agents never handle the token value) → `node scripts/migrate.cjs` →
  if diff: commit + push. Build (strict links) is the merge gate.
- `.github/workflows/deploy.yml`: build on every push; deploy step to
  GitHub Pages activates when Pages is enabled (public repo). Until then
  it serves as CI.

**Checkpoint 3:** both workflows green in Actions (sync via manual
dispatch once the PAT secret exists; deploy in build-only mode).

### Phase 4 — Ship (HARD GATE: user says go)

Flip repo public → enable Pages → verify live URL → social card meta.
Waits for the product's own open-sourcing; not started without explicit
user instruction.

## Image pipeline (easy replacement is a first-class requirement)

- **Stable names, forever:** screenshots live in
  `briefr-main/docs/assets/screenshots/` named after their IMAGE_BRIEFS
  anchor: `ui-feed-tab.png`, `ui-brief-tab.png`, `ui-detail-drawer.png`,
  `ui-ioc-lookup.png`, `ui-admin-security.png`. Docs reference these
  paths and never rename them.
- **Replacement procedure (the whole point):** drop a new file with the
  same name → run `node scripts/migrate.cjs` (or let the sync workflow do
  it) → done. No doc edits, no link updates, ever.
- `scripts/migrate.cjs` extends its asset mirror from `*.svg` to
  `*.{svg,png,webp}` including the `screenshots/` subfolder.
- A `README.md` in the screenshots folder lists each filename, what it
  must show, and the capture setup (viewport, theme), so future
  replacements match without asking.

## Design/UX work

Any visual changes ride the existing identity (product tokens, DM Serif
Display / DM Sans / IBM Plex Mono, severity spine). The frontend-design
skill is loaded for any new UI surface; screenshots get a consistent
hairline-border presentation on doc pages.

## Testing / verification

- Every phase: `npm run build` with `onBrokenLinks: 'throw'` (existing gate)
- New pages: browser-verified via preview + read_page, mobile 375px spot check
- Screenshots: visually verified in-page before checkpoint
- Workflows: run once for real (dispatch) before calling Checkpoint 3 done

## Risks

- SQLite login lock during screenshot capture → mitigate by seeding, per
  docs/memory guidance
- Private-repo sync needs the user-created PAT; until then sync is manual
  (`node scripts/migrate.cjs`) — acceptable, it's one command
- IMAGE_BRIEFS anchors in USE.md currently link to briefs, not images;
  the briefr-main PR updates those spots to embed the real screenshots
