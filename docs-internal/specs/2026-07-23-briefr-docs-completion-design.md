# BRIEFR docs portal — completion design spec

**Date:** 2026-07-23  
**Status:** approved (execution deferred to `docs-internal/plans/2026-07-23-briefr-docs-completion.md`)  
**Repos:** `Soldier0x0/briefr-docs` (this portal) · `Soldier0x0/briefr` (canonical product docs + code)

## Goal

Take **briefr-docs** from “structurally complete, production-hosted” to **content-accurate, operator-ready, visually polished, and sync-disciplined** — without inventing product behavior and without publishing maintainer-only material from the `briefr` repo.

**Definition of done (portal completion v1):**

1. No known factual errors in portal-native pages (license, integrations, Learn claims).
2. Migrated guides refreshed from `briefr/docs` on a pinned SHA; `BRIEFR_DOCS_PIN` matches that SHA.
3. Homepage has **zero** `DRAFT` badges on pages with substantive content.
4. User Guide embeds committed screenshots; stale “not committed” copy removed.
5. Visual polish **Tasks 3–7** from `docs-internal/plans/2026-07-21-portal-visual-polish.md` completed on current `main` (foundation already landed via System Design pathway work).
6. `npm run build` and `npm run typecheck` green; `onBrokenLinks: 'throw'` unchanged.

## Current state snapshot (verified on `main` after PR #15, 2026-07-23)

| Area | State |
|------|--------|
| **Production URL** | `https://docs.projectjupiter.in`, `baseUrl: '/'` (`docusaurus.config.ts`) |
| **Deploy** | Cloudflare Workers via `wrangler.jsonc` + `npm run deploy` (merged PR #11) |
| **License on site** | Apache-2.0 in footer, FAQ, homepage dispatch strip |
| **Navbar** | User · Admin · Developer · **Pathways** · Learn · API |
| **Learn section** | 48 MDX pages under `docs/how-briefr-works/` (pathways + intel lifecycle + how-its-built + system-design + glossary) |
| **Code pin** | `BRIEFR_DOCS_PIN = '04aba1ad17d18c1c45175881ceef56b7112abb36'` (`src/components/learn/pin.ts`) |
| **Migrated guides** | 9 files via `scripts/migrate.cjs` from `briefr/docs` |
| **Portal-native pages** | `security-guide.md`, `integrations.md`, `faq.md`, `roadmap.md`, `release-notes.md`, guide index pages |
| **UI foundation** | Tailwind v4 (preflight off) + shadcn primitives in `src/components/ui/`; Learn uses `PathwayCards`, `CoverageBadge`, `SystemDesignGap` |
| **Homepage** | CSS Modules (`src/pages/index.module.css`); **DRAFT** badges still on Security, Integrations, Release Notes (`src/pages/index.tsx`) |
| **Sync automation** | `.github/workflows/sync.yml` exists; requires secret `BRIEFR_MAIN_READ_TOKEN` |
| **CI** | `.github/workflows/deploy.yml` builds on push; deploy job gated on public repo |
| **study-guide mirror** | `docs/how-briefr-works/synced/**` gitignored + Docusaurus-excluded — **not published** |

## Non-goals

- Publishing `briefr/docs/study-guide/` HTML textbook on the portal (maintainer corpus; optional future selective MDX port).
- Docs versioning per BRIEFR release tag (no public tags yet; revisit when v1.5.0+ ships).
- Interactive in-browser API explorer (OpenAPI export is a sync artifact option, not a hosted Swagger UI on the portal).
- Modifying the `briefr` application codebase from this repo (content changes to canonical guides belong in `briefr`, then migrate).
- Full rewrite of `docs/api-reference.md` into multiple routes (optional later; landing page is in scope).

## Known gaps (factual — from repo audit 2026-07-23)

### P0 — incorrect or stale

| Gap | Evidence |
|-----|----------|
| `docs/integrations.md` LLM table lists **Anthropic** | Lines 77–78; `briefr` README / PRODUCT_STATUS use Groq → Cerebras → OpenRouter → Gemini |
| `docs/user-guide/using-briefr.md` says screenshots not committed | Line 10; `docs/user-guide/assets/screenshots/` contains PNGs copied by migrate |
| Homepage `DRAFT` on complete pages | `src/pages/index.tsx` — Security, Integrations, Release Notes |
| Sidebar `_category_.json` position collision | Developer Guide and How BRIEFR Works both `position: 3` |
| `themeConfig.image: 'img/favicon.ico'` | Only `static/img/favicon.svg` exists in repo |
| `README.md` lists Roadmap as migrated | `migrate.cjs` explicitly excludes `planning/ROADMAP.md` |

### P1 — missing operator / user depth

| Gap | briefr source (not fully surfaced on portal) |
|-----|-----------------------------------------------|
| No “what ships today” page | `docs/PRODUCT_STATUS.md` |
| No CONTRIBUTING page | `CONTRIBUTING.md` |
| No ADR index | `docs/decisions/ADR-*.md` |
| Thin user guide vs product surface | README tabs, ⌘K palette, notifications, asset profile, Forge depth |
| No wallboard / webhook cookbooks | API reference endpoints exist; no procedural guides |
| No intel snapshot guide | `docs/DATA_SNAPSHOT.md` |
| No network/firewall / sizing pages | Scattered in OPERATIONS / SYSTEM_DESIGN |

### P2 — UI / a11y / SEO (from `portal-visual-polish` plan)

| Gap | Notes |
|-----|-------|
| Landing not rebuilt with shadcn cards | Plan Task 4 — foundation done, landing still CSS Modules |
| No DocCard swizzle | Plan Task 5 — no `src/theme/DocCard/` |
| No `npm run shoot` harness | Plan Task 1 / 7 — Playwright responsive gate absent |
| No dedicated OG image | `themeConfig.image` points at missing `.ico` |
| API reference not grouped for skimming | Single large `docs/api-reference.md` |

## Architecture decisions

### D1 — Canonical vs portal-native content (unchanged)

- **Migrated:** nine files from `briefr/docs` via `migrate.cjs`; per-file copyright stripped; portal patches applied post-migrate (`PORTAL_PATCHES` in `migrate.cjs`).
- **Portal-native:** Learn MDX, Security, Integrations, FAQ, Roadmap, Release Notes, guide landings.
- **Never publish:** `synced/study-guide`, `synced/learn`, `docs-internal/`, `briefr/docs/planning/`, `briefr/docs/audit/`.

### D2 — Visual polish path (supersedes conflicting PR #4 branch)

**Decision:** Complete remaining work from `docs-internal/plans/2026-07-21-portal-visual-polish.md` **on a fresh branch from `main`**, not by merging PR #4.

**Rationale:** PR #4 (`cursor/portal-visual-polish-cc35`) is **CONFLICTING** with `main`. Tasks 1–2 (Tailwind + shadcn primitives) already landed via System Design pathway PR #14. Rebasing #4 would duplicate `components.json`, `tailwind.css`, and `index.tsx` conflicts.

**Constraint update:** polish plan’s `baseUrl: '/briefr-docs/'` constraint is **obsolete** — production uses `baseUrl: '/'`.

### D3 — Sync discipline

- Weekly + manual `sync.yml` when `BRIEFR_MAIN_READ_TOKEN` is configured.
- After each sync: bump `BRIEFR_DOCS_PIN` to the validated `briefr` commit SHA; re-run Learn factual spot-check on changed paths.
- Local validation: `BRIEFR_MAIN_DOCS=/path/to/briefr/docs node scripts/migrate.cjs`.

### D4 — Public boundary for study-guide

Do **not** mirror HTML study-guide into the published site without an explicit future spec. Learners use portal **Pathways** (Analyst / Architect / System Design). Contributors may use `briefr/docs/study-guide/` in the product repo.

## Open PR disposition (recommended)

| PR | Title | Recommendation | Reason |
|----|-------|----------------|--------|
| **#4** | Portal visual polish implementation | **Close** | Conflicts with `main`; foundation merged via #14; remaining tasks captured in completion plan Phase C |
| **#1** | Cursor Cloud dev environment | **Close (superseded)** | `AGENTS.md` added on `main` via completion plan PR with corrected `baseUrl: '/'` (PR #1 body still references `/briefr-docs/`) |

Previously merged and **not** reopened: #3 (polish plan), #11 (Wrangler), #14 (System Design), #15 (production pass).

## Phasing

| Phase | Focus | Checkpoint |
|-------|--------|------------|
| **A** | Accuracy & sync | No stale portal-native claims; migrate green; pin bumped |
| **B** | Content depth | User/operator runbooks; CONTRIBUTING; PRODUCT_STATUS digest |
| **C** | UI / a11y / responsive | Polish plan Tasks 3–7; DRAFT badges removed; OG image |
| **D** | Infra & discoverability | AGENTS.md; navbar/footer; sitemap; optional shoot gate in CI |
| **E** | Strategic (optional) | API landing split; study-guide selective MDX; docs versioning |

Each phase is independently mergeable. Phases A→C are recommended before calling the portal “complete v1.”

## Success metrics

- `npm run build` + `npm run typecheck` pass on every task commit.
- Zero `DRAFT` homepage badges for pages with full content.
- `integrations.md` LLM chain matches `briefr` PRODUCT_STATUS at pinned SHA.
- At least 3 screenshots embedded in `using-briefr.md` from existing `assets/screenshots/`.
- Learn `InTheCode` links resolve at `BRIEFR_DOCS_PIN` SHA (spot-check 5 paths per sync).

## References

- `docs-internal/specs/2026-07-19-portal-upgrade-design.md` — original portal upgrade phasing
- `docs-internal/plans/2026-07-21-portal-visual-polish.md` — UI tasks (Tasks 3–7 remain)
- `docs-internal/specs/2026-07-22-system-design-pathway-design.md` — Learn pathways (shipped)
- `docs-internal/audits/2026-07-22-learn-factual-audit.md` — Learn factual baseline
- `scripts/migrate.cjs` — canonical sync + `PORTAL_PATCHES`
