# BRIEFR docs portal — completion implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute the approved completion design — accurate content, operator-ready depth, visual/a11y polish, and sync discipline — so `briefr-docs` is production-complete at `https://docs.projectjupiter.in`.

**Architecture:** Phased delivery (A→E). Migrated guides stay canonical via `migrate.cjs` + `PORTAL_PATCHES`; portal-native pages edited directly. UI work reuses scoped Tailwind v4 + shadcn already on `main` (Decision D1-A). No `briefr` code changes from this repo.

**Tech Stack:** Docusaurus 3.10.2, React 19, TypeScript, Tailwind v4 (preflight off), shadcn/ui primitives, `@easyops-cn/docusaurus-search-local`, Cloudflare Wrangler static deploy.

**Spec:** `docs-internal/specs/2026-07-23-briefr-docs-completion-design.md`

## Global Constraints

- Node `>=20` (`package.json` engines).
- Docusaurus **3.10.2** — do not upgrade as part of this plan.
- `onBrokenLinks: 'throw'` must pass on every `npm run build`.
- Production URL: `https://docs.projectjupiter.in`, `baseUrl: '/'` — do not revert to `/briefr-docs/`.
- License on portal: **Apache License 2.0**.
- Never invent BRIEFR behavior — claims trace to `briefr` at pinned SHA or existing portal docs.
- Do not commit `.vendor/briefr`, `.superpowers/`, or `docs/how-briefr-works/synced/**` (gitignored).
- Tailwind **preflight must remain disabled** (`src/css/tailwind.css`).
- Palette via `--brf-*` / bridged shadcn tokens only (`#e85533` accent).
- Migrated file edits: prefer `briefr` canonical source + migrate; use `PORTAL_PATCHES` for portal-only transforms.
- One logical commit per task; conventional messages (`docs:`, `feat(docs):`, `fix(docs):`).
- Close PR **#4** (conflicting polish branch); supersede PR **#1** with corrected `AGENTS.md` on `main`.

## File map (high level)

| Area | Key paths |
|------|-----------|
| Sync | `scripts/migrate.cjs`, `.github/workflows/sync.yml`, `src/components/learn/pin.ts` |
| Portal-native content | `docs/integrations.md`, `docs/faq.md`, `docs/security-guide.md`, `docs/release-notes.md`, `docs/roadmap.md`, new pages under `docs/` |
| Migrated content | `docs/user-guide/*`, `docs/admin-guide/*`, `docs/developer-guide/*`, `docs/api-reference.md` |
| Learn | `docs/how-briefr-works/**/*.mdx` |
| Homepage | `src/pages/index.tsx`, `src/pages/index.module.css` |
| Global CSS | `src/css/custom.css`, `src/css/tailwind.css` |
| UI primitives | `src/components/ui/*`, `src/components/learn/*`, `src/theme/DocCard/*` (to create) |
| Static assets | `static/img/*`, `docs/user-guide/assets/screenshots/*` |
| Agent docs | `AGENTS.md` |
| Config | `docusaurus.config.ts`, `sidebars.ts`, `docs/**/_category_.json` |

---

## Phase A — Accuracy & sync (P0)

### Task A1: Refresh migrated docs from briefr + bump pin

**Files:**
- Modify: `src/components/learn/pin.ts`
- Modify: `docs/user-guide/*`, `docs/admin-guide/*`, `docs/developer-guide/*`, `docs/api-reference.md` (via migrate)
- Modify: `scripts/migrate.cjs` (only if new `PORTAL_PATCHES` needed)

**Prerequisites:**
- Local checkout of `briefr` at desired commit (e.g. `.vendor/briefr` or `../../briefr-main/docs`).

- [ ] **Step 1:** Record validated SHA: `git -C /path/to/briefr rev-parse HEAD`
- [ ] **Step 2:** Run migrate:
  ```bash
  BRIEFR_MAIN_DOCS=/path/to/briefr/docs node scripts/migrate.cjs
  ```
- [ ] **Step 3:** Set `BRIEFR_DOCS_PIN` in `src/components/learn/pin.ts` to the **full 40-char SHA**
- [ ] **Step 4:** Verify `PORTAL_PATCHES` still apply (`how-it-works.md` has no study-guide rows; `operations.md` has systemd callout)
- [ ] **Step 5:** `npm run typecheck && npm run build`
- [ ] **Step 6: Commit** `chore(docs): sync migrated guides from briefr @ <sha>`

---

### Task A2: Fix stale portal-native integrations page

**Files:**
- Modify: `docs/integrations.md` (LLM provider table, ~lines 77–78)

**Source of truth:** `briefr` `docs/PRODUCT_STATUS.md` and `README.md` LLM chain at pinned SHA.

- [ ] **Step 1:** Read LLM section in briefr PRODUCT_STATUS at pin SHA — confirm provider order (Groq → Cerebras → OpenRouter → Gemini; Anthropic removed if absent there)
- [ ] **Step 2:** Update `docs/integrations.md` table to match — remove Anthropic row if not in product docs; fix fallback chain text
- [ ] **Step 3:** `npm run build`
- [ ] **Step 4: Commit** `fix(docs): align integrations LLM table with briefr PRODUCT_STATUS`

---

### Task A3: Embed screenshots + remove stale copy in user guide

**Files:**
- Modify: `docs/user-guide/using-briefr.md`

**Assets (already in repo):** `docs/user-guide/assets/screenshots/` — includes `ui-brief-tab.png`, `ui-incidents-news.png`, `ui-ioc-lookup.png` (verify filenames with `ls` before embedding).

- [ ] **Step 1:** Remove line 10 “Screenshots are not committed yet…”
- [ ] **Step 2:** Embed 3 screenshots in relevant sections (BRIEF/FEED, Incidents/News, IOC lookup) using `![alt](assets/screenshots/<file>.png)`
- [ ] **Step 3:** Add meaningful `alt` text per image
- [ ] **Step 4:** `npm run build` (image paths must resolve)
- [ ] **Step 5: Commit** `docs(user-guide): embed committed screenshots`

---

### Task A4: Fix sidebar category positions + README accuracy

**Files:**
- Modify: `docs/developer-guide/_category_.json` — set `position` to **4** (Learn is 3)
- Modify: `docs/security-guide.md` frontmatter or move — ensure Security sidebar order is **5** (verify after category bump)
- Modify: `README.md` — remove Roadmap from migrated list; clarify portal-native vs migrate

- [ ] **Step 1:** Assign unique positions: User 1, Admin 2, Learn 3, Developer 4, Security 5, API 6, etc.
- [ ] **Step 2:** `npm run build` — confirm sidebar order in dev server
- [ ] **Step 3: Commit** `docs: fix sidebar category ordering and README migrate list`

---

### Task A5: Add corrected AGENTS.md (supersedes PR #1)

**Files:**
- Create: `AGENTS.md`

**Content must reflect current production facts:**
- `baseUrl: '/'` → dev at `http://localhost:3000/` (not `/briefr-docs/`)
- Search index requires `npm run build` then `npm run serve`
- `migrate.cjs` + `BRIEFR_MAIN_DOCS` optional
- Quality gate: `npm run build` (`onBrokenLinks: 'throw'`)

- [ ] **Step 1:** Write `AGENTS.md` (use PR #1 branch as template but fix baseUrl and production URL)
- [ ] **Step 2: Commit** `docs: add AGENTS.md for cloud agent development`

---

**Phase A checkpoint:** `npm run build` green; integrations accurate; screenshots embedded; pin matches briefr SHA; close PR #1 as superseded.

---

## Phase B — Content depth (P1)

### Task B1: PRODUCT_STATUS digest page (portal-native)

**Files:**
- Create: `docs/product-status.md` (or `docs/current-build.md` — pick one name)
- Modify: `docs/release-notes.md` — link to digest
- Modify: `docusaurus.config.ts` footer (optional link)

**Content rules:**
- Summarize **only** facts from `briefr/docs/PRODUCT_STATUS.md` at pinned SHA — version, major capabilities, known gaps.
- State: “If this page disagrees with GitHub PRODUCT_STATUS, GitHub wins.”
- Do not copy internal planning labels or sprint IDs.

- [ ] **Step 1:** Read PRODUCT_STATUS at pin SHA; draft digest (~80–120 lines max)
- [ ] **Step 2:** Add `sidebar_position` under Project section (near Release Notes)
- [ ] **Step 3:** `npm run build`
- [ ] **Step 4: Commit** `docs: add current build status digest from PRODUCT_STATUS`

---

### Task B2: Migrate CONTRIBUTING + ADR index

**Files:**
- Create: `docs/developer-guide/contributing.md` — portal-native wrapper linking to GitHub `CONTRIBUTING.md` **or** migrate if added to `FILES` in migrate.cjs
- Create: `docs/developer-guide/decisions.md` — index linking to `briefr/docs/decisions/ADR-*.md` on GitHub (do not copy full ADR bodies unless migrated intentionally)
- Modify: `docs/developer-guide/index.md` — add table rows

- [ ] **Step 1:** Add CONTRIBUTING to migrate `FILES` array **or** hand-write portal summary with link to canonical file
- [ ] **Step 2:** List ADR-001–006 titles with one-line descriptions (read from briefr at pin SHA)
- [ ] **Step 3:** `npm run build`
- [ ] **Step 4: Commit** `docs(developer): add contributing and ADR index`

---

### Task B3: Operator runbooks (portal-native)

**Files:**
- Create: `docs/admin-guide/wallboard.md`
- Create: `docs/admin-guide/webhooks.md`
- Create: `docs/admin-guide/network-requirements.md` (optional combine with sizing)
- Modify: `docs/admin-guide/index.md`, `docs/admin-guide/_category_.json` positions

**Sources (read at pin SHA, do not invent):**
- `briefr/docs/OPERATIONS.md`, `API_REFERENCE.md` (wallboard, webhooks sections)
- `briefr/deploy/nginx-briefr.conf` for ports

- [ ] **Step 1:** Wallboard — token env var, URL path, polling behavior (from API reference)
- [ ] **Step 2:** Webhooks — Discord/Telegram/generic, SSRF rules summary, delivery log admin routes
- [ ] **Step 3:** Network — inbound 80/443, outbound feed URLs pointer to Integrations page
- [ ] **Step 4:** `npm run build`
- [ ] **Step 5: Commit** `docs(admin): add wallboard and webhook operator guides`

---

### Task B4: Expand user guide (portal-native sections in using-briefr or new pages)

**Files:**
- Modify: `docs/user-guide/using-briefr.md` **or** create `docs/user-guide/features.md`
- Modify: `docs/user-guide/index.md`

**Topics (only if present in briefr USE.md / README at pin SHA):**
- ⌘K command palette
- Notification bell / watchlist
- Five tabs (BRIEF, FEED, IOC, ATLAS, FORGE) — tab-by-tab workflow
- Link to Pathways for learning depth

- [ ] **Step 1:** Cross-check each feature against briefr docs at pin — skip any not found
- [ ] **Step 2:** Write sections with screenshots where assets exist
- [ ] **Step 3:** `npm run build`
- [ ] **Step 4: Commit** `docs(user-guide): expand product walkthrough`

---

### Task B5: Quick-start runbook (single linear page)

**Files:**
- Create: `docs/getting-started.md` **or** extend `docs/admin-guide/self-host.md` with “15-minute path”
- Modify: `src/pages/index.tsx` — primary CTA can link here

**Linear path (factual steps from existing docs only):**
1. Self-host (`self-host.md`)
2. First login / setup
3. Open feed, triage one CVE (`using-briefr.md`)
4. Optional webhook (`webhooks.md` after B3)

- [ ] **Step 1:** Write checklist linking to existing pages (no duplicate prose)
- [ ] **Step 2:** Add to navbar or homepage FIELD GUIDES
- [ ] **Step 3:** `npm run build`
- [ ] **Step 4: Commit** `docs: add getting-started runbook`

---

**Phase B checkpoint:** New operator/user pages build green; all claims traceable to briefr at pin SHA.

---

## Phase C — UI, responsiveness, accessibility (polish plan Tasks 3–7)

**Reference:** `docs-internal/plans/2026-07-21-portal-visual-polish.md` (update `baseUrl` constraint mentally to `/`).

### Task C1: Remove stale DRAFT badges + fix OG image

**Files:**
- Modify: `src/pages/index.tsx` — set `draft: false` for Security, Integrations, Release Notes **after** Phase A/B content is complete
- Modify: `docusaurus.config.ts` — `themeConfig.image` → valid asset (`static/img/og.png` or `favicon.svg`)
- Create: `static/img/og.png` (1200×630) **or** document using SVG until art exists

- [ ] **Step 1:** Generate or add minimal OG image using BRIEFR tokens (accent `#e85533`, dark bg)
- [ ] **Step 2:** Remove DRAFT flags
- [ ] **Step 3:** `npm run build`
- [ ] **Step 4: Commit** `feat(docs): add OG image and clear homepage DRAFT badges`

---

### Task C2: Landing page shadcn card rebuild (polish Task 4)

**Files:**
- Modify: `src/pages/index.tsx` — use `@/components/ui/card`, `badge`, `button` for FIELD GUIDES and REFERENCE grids
- Modify: `src/pages/index.module.css` — remove redundant card styles migrated to shadcn; keep hero/spine/section kickers

- [ ] **Step 1:** Replace `.guideCard` / `.refCard` with shadcn `Card` + `CardHeader` + `CardContent`
- [ ] **Step 2:** Preserve severity spine, dispatch strip, masthead typography
- [ ] **Step 3:** Verify mobile breakpoints (`index.module.css` media queries still apply)
- [ ] **Step 4:** `npm run build && npm run typecheck`
- [ ] **Step 5: Commit** `feat(docs): rebuild homepage cards with shadcn`

---

### Task C3: DocCard swizzle (polish Task 5)

**Files:**
- Create: `src/theme/DocCard/index.tsx`, `styles.module.css` (via `npm run swizzle @theme-original/DocCard`)
- Modify: `src/css/custom.css` — doc card hover/focus if needed

- [ ] **Step 1:** `npm run swizzle @docusaurus/theme-classic DocCard -- --typescript --wrap`
- [ ] **Step 2:** Style with `--brf-*` tokens; match homepage card language
- [ ] **Step 3:** `npm run build`
- [ ] **Step 4: Commit** `feat(docs): swizzle DocCard with BRIEFR tokens`

---

### Task C4: Site-wide responsive + typography CSS (polish Task 6)

**Files:**
- Modify: `src/css/custom.css`

**Targets (from polish plan):**
- Fluid type scale for `.markdown` headings
- Horizontal scroll wrapper for wide tables (`.markdown table`)
- Tighter mobile padding for `.main-wrapper`
- Focus-visible rings on interactive elements (homepage CTAs, PathwayCards links)

- [ ] **Step 1:** Implement table `overflow-x: auto` on mobile
- [ ] **Step 2:** Add `:focus-visible` outlines using `--brf-accent`
- [ ] **Step 3:** Respect `prefers-reduced-motion` (verify existing rule)
- [ ] **Step 4:** `npm run build`
- [ ] **Step 5: Commit** `feat(docs): responsive typography and table scroll`

---

### Task C5: Learn component a11y pass

**Files:**
- Modify: `src/components/learn/PathwayCards.tsx`, `SystemDesignGap.tsx`, `CoverageBadge.tsx`
- Modify: `src/components/learn/styles.module.css` if needed

- [ ] **Step 1:** Ensure PathwayCards links are keyboard-focusable with visible focus ring
- [ ] **Step 2:** `CoverageBadge` — use semantic text, not color alone (include label: “BRIEFR”, “Partial”, “Gap”)
- [ ] **Step 3:** `SystemDesignGap` — heading hierarchy (`h2`/`h3`) for screen readers
- [ ] **Step 4:** Manual keyboard tab through `/docs/how-briefr-works/pathways`
- [ ] **Step 5: Commit** `a11y(learn): focus rings and badge labels`

---

### Task C6: Playwright shoot harness (polish Task 1/7) — optional but recommended

**Files:**
- Create: `scripts/shoot.mjs` (copy from polish branch `origin/cursor/portal-visual-polish-cc35` if available, adapt `baseUrl` to `/`)
- Modify: `package.json` — `"shoot": "node scripts/shoot.mjs"`
- Add devDependency: `@playwright/test` or `playwright` per polish plan

**Viewports:** 390, 768, 1440 — homepage + pathways + one doc page.

- [ ] **Step 1:** Port shoot script; fix URLs for `baseUrl: '/'`
- [ ] **Step 2:** `npm run shoot` after `npm run build && npm run serve`
- [ ] **Step 3:** Document in `AGENTS.md` and `README.md`
- [ ] **Step 4: Commit** `chore(docs): add responsive screenshot harness`

---

**Phase C checkpoint:** Homepage + DocCard polished; DRAFT cleared; a11y spot-check pass; close PR #4.

---

## Phase D — Infra & discoverability

### Task D1: Navbar and footer completeness

**Files:**
- Modify: `docusaurus.config.ts`

- [ ] **Step 1:** Add FAQ to navbar (right side or “More” dropdown if crowded)
- [ ] **Step 2:** Add Security Guide to navbar **or** prominent footer-only with homepage REFERENCE card undrafted
- [ ] **Step 3:** `npm run build`
- [ ] **Step 4: Commit** `docs: improve navbar discoverability for FAQ and Security`

---

### Task D2: Sitemap priorities + per-page descriptions

**Files:**
- Modify: key pages' frontmatter `description:` fields (homepage via Layout `description` prop already set)
- Optional: Docusaurus plugin config for sitemap priority if added

- [ ] **Step 1:** Audit pages missing `description` in frontmatter (`grep -L description docs/**/*.md`)
- [ ] **Step 2:** Add descriptions for new Phase B pages
- [ ] **Step 3: Commit** `docs: add SEO descriptions to key pages`

---

### Task D3: Sync workflow verification

**Files:**
- Read-only: `.github/workflows/sync.yml`

- [ ] **Step 1:** Confirm `BRIEFR_MAIN_READ_TOKEN` secret exists in repo settings (human step — document in AGENTS.md)
- [ ] **Step 2:** `gh workflow run sync.yml` (or manual dispatch) and verify green build
- [ ] **Step 3:** Document failure modes (token expired, briefr path missing) in `AGENTS.md`

---

### Task D4: Deploy path documentation

**Files:**
- Modify: `README.md`, `AGENTS.md`

**Facts to document:**
- Production: Cloudflare Workers (`npm run deploy`, `wrangler.jsonc`)
- CI: `.github/workflows/deploy.yml` builds on push; Pages deploy conditional on public repo

- [ ] **Step 1:** Single “Deploy” section in README — no contradictory instructions
- [ ] **Step 2: Commit** `docs: clarify Cloudflare vs GitHub Pages deploy paths`

---

**Phase D checkpoint:** Contributors know how to sync, build, deploy; FAQ/Security discoverable.

---

## Phase E — Strategic (optional, post–v1)

Execute only when explicitly requested.

### Task E1: API reference landing page

- Create `docs/api-reference/index.md` with grouped links (Auth, CVEs, Admin, Webhooks, Wallboard) pointing to anchors in migrated `api-reference.md` — **or** split file in a later major refactor.

### Task E2: Intel snapshot (`DATA_SNAPSHOT.md`) operator page

- Portal-native summary with link to briefr canonical doc; migrate if added to `FILES`.

### Task E3: Docs versioning

- When BRIEFR tags public releases, add Docusaurus versioning plugin — out of scope until tags exist.

### Task E4: Selective study-guide MDX port

- Pick 5–10 study-guide chapters with highest learner value; convert to MDX under `how-briefr-works/` — requires separate spec (do not bulk-publish HTML).

---

## Final gate (all phases)

- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Homepage: zero DRAFT on complete pages
- [ ] `integrations.md` matches briefr PRODUCT_STATUS at `BRIEFR_DOCS_PIN`
- [ ] Spot-check 5 `InTheCode` links at pin SHA
- [ ] Open PRs: #4 closed; #1 closed
- [ ] Update `docs-internal/audits/` with completion note (optional)

---

## PR disposition checklist (maintainer)

| Action | PR | Command / note |
|--------|-----|----------------|
| Close | #4 | `gh pr close 4 -c "Superseded by completion plan Phase C on main; foundation in #14."` |
| Close | #1 | `gh pr close 1 -c "Superseded by AGENTS.md on main (completion plan A5)."` |

---

## Execution order (recommended)

1. **A1 → A5** (accuracy) — can ship as one PR or five small PRs  
2. **B1 → B3** (operator essentials)  
3. **C1 → C5** (visible polish)  
4. **B4 → B5** (user depth) — can parallel with C after A  
5. **D1 → D4** (infra docs)  
6. **C6, E\*** as capacity allows  

**Estimated scope:** Phase A+C+D ≈ portal “complete v1”; Phase B fills product depth; Phase E is backlog.
