# BRIEFR docs portal — visual polish & responsiveness design spec

**Date:** 2026-07-21 · **Status:** proposed (awaiting maintainer approval of Decision D1)
**Repo:** `briefr-docs` (portal only — no changes to `briefr` / `briefr-main`)
**Skills applied:** superpowers:brainstorming → superpowers:writing-plans; shadcn.

## Goal

Make the documentation portal noticeably **more beautiful and more responsive**
without changing any doc *content* — introducing a small, well-bounded
component layer (shadcn/ui) on the React surfaces we own, and pushing the
responsive/typography wins into the token/CSS layer so they also benefit the
synced Markdown pages.

Definition of done: refreshed landing page and category/index cards using a
real component system; fluid, tested responsive behavior at 390 / 768 / 1440
px; the existing "wire-service terminal briefing" identity preserved; strict
`onBrokenLinks: 'throw'` build stays green; objective before/after screenshots
captured by a repeatable script.

## Non-goals

- Editing migrated/canonical Markdown content (it is synced from `briefr` via
  `scripts/migrate.cjs` and stays CommonMark `.md`; see below).
- A light theme (portal is intentionally dark-only).
- Docs versioning, interactive API explorer, custom domain (owned by the
  prior `2026-07-19-portal-upgrade` spec / out of scope here).
- Any change to the `briefr` product repo.
- Replacing Docusaurus or Infima.

## Current state (verified 2026-07-21)

- Docusaurus **3.10.2**, React 19, dark-only. Theming today is **Infima CSS
  variable overrides + CSS Modules** (`src/css/custom.css`, `src/pages/
  index.tsx` + `index.module.css`). Strong existing identity: product tokens
  (`--brf-*`), DM Serif Display / DM Sans / IBM Plex Mono, orange `#e85533`,
  a CVSS "severity spine", mono kickers, hairline borders.
- shadcn is **not initialized** (`npx shadcn@latest info --json` → `config:
  null`, `tailwindVersion: null`, no `components.json`; framework detected as
  `Manual` — Docusaurus is not a natively supported shadcn target).
- Content pages are **`.md` rendered as CommonMark** (config sets
  `markdown.format: 'detect'` specifically so migrated docs with literal `<`
  and `{` survive). React components therefore **cannot** be embedded in the
  migrated docs; shadcn's reach is limited to: `src/pages/*.tsx`, swizzled
  `@theme/*` components, and any new portal-native `.mdx` page.
- Planning convention: `docs-internal/{specs,plans}/` (NOT the published
  `docs/`). A prior `2026-07-19-portal-upgrade` spec+plan covered
  content-completeness and sync automation — this spec is complementary
  (visual/responsive), not overlapping.

## Decision D1 (KEY — maintainer please confirm): how to use shadcn

shadcn/ui is a Tailwind + React component system. Docusaurus ships Infima and
is flagged `Manual` by the shadcn CLI, so there is no turnkey path. Three
options:

- **A — Scoped shadcn runtime (RECOMMENDED, and what the plan implements).**
  Add Tailwind v4 to Docusaurus via a `configurePostCss` plugin, import only
  Tailwind's `theme` + `utilities` layers (**preflight disabled** so Tailwind's
  reset never fights Infima), bridge shadcn's semantic tokens
  (`--background`, `--primary`, `--border`, `--ring`, `--radius`, …) to the
  existing `--brf-*` values, and use shadcn components **only on the React
  surfaces we own** (landing page, swizzled `DocCard`, future `.mdx` pages).
  Pros: literally uses shadcn as requested; a real, reusable primitive layer;
  contained blast radius. Cons: Tailwind-in-Docusaurus is a manual integration
  with real (but mitigable) conflict risk; adds Tailwind + Radix deps.

- **B — shadcn as reference-only, implemented in Infima/CSS Modules.** Copy
  shadcn's visual patterns (spacing, radii, elevation, variants) but write
  them with the existing token/CSS-module system; no Tailwind runtime. Pros:
  zero framework conflict; matches the *product's* own ADR-005 ("shadcn is
  reference-only, no Tailwind runtime"). Cons: does not literally use the
  shadcn tooling the request named; more hand-written CSS.

- **C — Full Tailwind/shadcn adoption across the whole portal.** Rejected:
  highest churn and highest risk of Infima conflict and brand drift for little
  extra gain, since doc *content* is Markdown and cannot consume components.

**Recommendation:** Option **A**, because the request explicitly invokes
shadcn and A delivers a genuine component layer while confining Tailwind to
custom surfaces. If the maintainer prefers consistency with the product's
ADR-005 (no Tailwind runtime), switch to **B**: Phases 1–3 below become
"implement the same visual patterns in CSS Modules," and Phases 0/4/5 are
unchanged. The plan's Phase 1 is a gate — do not proceed past it without
confirming D1.

## Architecture (Option A)

Layer the change so each piece has one responsibility and a clean interface:

1. **Tooling foundation** — `tailwind.css` (theme+utilities layers, no
   preflight) + a `@theme inline` token bridge to `--brf-*`; a Docusaurus
   inline plugin providing `configurePostCss` (Tailwind) and `configureWebpack`
   (the `@/*` → `src/*` alias); `components.json`; `src/lib/utils.ts` (`cn()`).
   Consumed by every later phase.
2. **Primitives** — shadcn `button`, `card`, `badge`, `separator` under
   `src/components/ui/`, re-skinned to BRIEFR tokens, verified against a
   throwaway probe route before use.
3. **Landing page** — `src/pages/index.tsx` rebuilt on those primitives while
   keeping the masthead, dispatch strip, severity spine, and mono kickers;
   responsiveness upgraded (container queries + fluid clamps).
4. **Docs surfaces** — swizzle `DocCard`/`DocCardList` (category index pages)
   onto the shadcn `Card`; wrapper-swizzle only (no ejection of internals).
5. **Site-wide responsive + type layer** — fluid type, content-width via
   container queries, mobile-scrollable tables, TOC/sidebar/code-block/
   admonition polish — all in `custom.css`, so **migrated Markdown benefits
   without content edits**.

## Verification

- **Build gate (every task):** `npm run build` with `onBrokenLinks: 'throw'`.
- **Responsive gate:** `scripts/shoot.mjs` (Playwright devDep) captures
  `/`, `/docs/user-guide`, `/docs/api-reference`, and a Markdown chapter at
  **390 / 768 / 1440** px against `npm run serve`, written to
  `.artifacts/` for before/after comparison.
- **A11y gate (final):** keyboard focus visible, AA contrast on new surfaces,
  `prefers-reduced-motion` honored (existing global rule kept).

## Risks & mitigations

- *Tailwind preflight vs Infima* → import only `theme`+`utilities` layers;
  never `preflight.css`. Probe route in Phase 1 catches regressions early.
- *`@/*` alias not resolved by Docusaurus webpack* → add it explicitly in the
  same inline plugin (`configureWebpack.resolve.alias`).
- *shadcn CLI `Manual` framework* → `components.json` is authored by hand; if
  `add` cannot resolve paths, fall back to `npx shadcn@latest view <item>` and
  place the source under `src/components/ui/` (documented in the plan).
- *Brand drift* → tokens bridge to `--brf-*`; visual gate screenshots compared
  against baseline each phase.
- *Scope creep into content* → migrated `.md` files are never edited; all
  content-facing wins live in `custom.css`.
