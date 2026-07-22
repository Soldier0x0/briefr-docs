# System Design Pathway + Learn UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a third **System Design** learning pathway (classic SD order; BRIEFR where it maps; honest gap units with externals) and improve Learn chrome with **scoped shadcn** primitives bridged to BRIEFR `--brf-*` tokens.

**Architecture:** Reuse the scoped Tailwind v4 + shadcn foundation already prototyped on `cursor/portal-visual-polish-cc35` (Decision D1 Option A: theme+utilities only, preflight off, tokens → `--brf-*`). Add Learn-only components (`CoverageBadge`, `SystemDesignGap`, pathway cards). New MDX spine under `docs/how-briefr-works/system-design/`. Analyst and Architect pathways stay BRIEFR-complete; only pathways chooser and cross-links change for those tracks.

**Tech Stack:** Docusaurus 3.10.2, React 19, Tailwind v4 (scoped), shadcn/ui (button/card/badge/separator + Learn compositions), existing `src/components/learn/*`.

**Spec:** `docs-internal/specs/2026-07-22-system-design-pathway-design.md`

## Global Constraints

- Node `>=20`; do not upgrade Docusaurus.
- `onBrokenLinks: 'throw'` must stay green on every `npm run build`.
- `url` / `baseUrl` stay as production (`https://docs.projectjupiter.in`, `/`) — do not revert to `/briefr-docs/`.
- Never invent BRIEFR behavior — `briefr`/`partial` claims trace to `.vendor/briefr` or existing portal docs.
- Gap units must include the full eight-part template from the spec.
- Palette only via `--brf-*` / bridged shadcn semantics (accent `#e85533`, neutrals, link `#7eb8f0`).
- Tailwind **preflight must remain disabled**; do not reset Infima.
- Do not dilute Analyst/Architect into generic SD theory.
- Do not commit `.vendor/`, PATs, or `.superpowers/` session reports.
- Commits: one logical commit per task; conventional messages.
- Execution: subagent-driven.

## File map

| Path | Responsibility |
| --- | --- |
| `components.json`, `src/css/tailwind.css`, `src/lib/utils.ts`, PostCSS/webpack alias wiring | Scoped shadcn foundation |
| `src/components/ui/{button,card,badge,separator}.tsx` | Primitives |
| `src/components/learn/CoverageBadge.tsx` | `briefr` \| `partial` \| `gap` |
| `src/components/learn/SystemDesignGap.tsx` | Gap template UI |
| `src/components/learn/PathwayCards.tsx` (or MDX-friendly equivalent) | Three-path chooser cards |
| `docs/how-briefr-works/pathways.mdx` | Three pathways |
| `docs/how-briefr-works/system-design/**` | SD curriculum spine |
| `docs/how-briefr-works/index.mdx` | Mention third pathway |

**Foundation source of truth for Task 1:** cherry-pick or copy from `origin/cursor/portal-visual-polish-cc35` commits `1635555` (foundation) + `ecb93fe` (primitives). Prefer file copy over merging the whole polish branch if landing/DocCard changes cause large conflicts — landing rebuild is **optional** in this plan (can stay for polish PR #4).

---

### Task 1: Scoped Tailwind + shadcn foundation on mainline

**Files:**
- Create/bring: `components.json`, `src/css/tailwind.css`, `src/lib/utils.ts`, `src/components/ui/button.tsx`, `card.tsx`, `badge.tsx`, `separator.tsx`
- Modify: `src/css/custom.css` (import tailwind entry; token bridge), `docusaurus.config.ts` (PostCSS Tailwind plugin + `@` → `src` alias) — match polish branch patterns
- Modify: `package.json` / lockfile for Tailwind v4, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, radix deps as required by those primitives

**Interfaces:**
- Produces: `cn()` from `@/lib/utils`; UI imports from `@/components/ui/*`; CSS variables bridged so `bg-primary` ≈ `--brf-accent`

- [ ] **Step 1: Bring foundation files from polish branch**

```bash
git show origin/cursor/portal-visual-polish-cc35:components.json > components.json
# Likewise for src/css/tailwind.css, src/lib/utils.ts, src/components/ui/*.tsx
# Port docusaurus.config.ts PostCSS/webpack bits and custom.css import/bridge from that branch
```

- [ ] **Step 2: Install deps** (`npm install` as needed until build works)
- [ ] **Step 3: Verify preflight off** — `tailwind.css` must not import Tailwind preflight/base reset
- [ ] **Step 4:** `npm run build` && `npm run typecheck`
- [ ] **Step 5: Commit** `feat(docs): add scoped Tailwind v4 + shadcn foundation for Learn UI`

---

### Task 2: Learn UI primitives — CoverageBadge + SystemDesignGap + pathway cards

**Files:**
- Create: `src/components/learn/CoverageBadge.tsx`
- Create: `src/components/learn/SystemDesignGap.tsx`
- Create: `src/components/learn/PathwayCards.tsx` (three cards; props for title/blurb/to/completeness)
- Modify: `src/components/learn/styles.module.css` only if needed for non-Tailwind bits; prefer shadcn Card/Badge

**Interfaces:**

```tsx
// CoverageBadge
type Coverage = 'briefr' | 'partial' | 'gap';
export function CoverageBadge({coverage}: {coverage: Coverage}): ReactNode;

// SystemDesignGap — children slots or props for the 8 template fields
export type SystemDesignGapProps = {
  topic: string;
  covers: string[];           // bullets
  whyItMatters: string;
  inBriefr: ReactNode;        // text or links
  whyNot: string;
  whenNeeded: string;
  resources: {label: string; href?: string; note?: string}[];
  nextHref: string;
  nextLabel: string;
};
```

- [ ] **Step 1: Implement components using `@/components/ui/card|badge|button|separator`**
- [ ] **Step 2: Smoke-import from a temporary MDX or pathways page**
- [ ] **Step 3:** `npm run build` && `npm run typecheck`
- [ ] **Step 4: Commit** `feat(learn): add CoverageBadge, SystemDesignGap, and PathwayCards`

---

### Task 3: Pathways chooser — three tracks

**Files:**
- Modify: `docs/how-briefr-works/pathways.mdx`
- Modify: `docs/how-briefr-works/index.mdx` (mention System Design)

**Interfaces:**
- Analyst → intel-lifecycle (complete)
- Architect / security builder → how-its-built (complete)
- System Design → `/docs/how-briefr-works/system-design/` (hybrid)

- [ ] **Step 1: Rewrite pathways.mdx** with `PathwayCards` + clear promises (complete vs hybrid)
- [ ] **Step 2: Update index.mdx** one short section for the third path
- [ ] **Step 3:** `npm run build`
- [ ] **Step 4: Commit** `feat(learn): add System Design as third pathway on chooser`

---

### Task 4: System Design spine scaffolding

**Files:**
- Create: `docs/how-briefr-works/system-design/_category_.json` (label System Design, position after how-its-built or as planned in sidebar)
- Create: `docs/how-briefr-works/system-design/index.mdx` (how to use this pathway + coverage legend)
- Create stub MDX files for grouped units (recommended grouping to avoid 18 tiny files):

| File | Units covered |
| --- | --- |
| `00-how-to-use.mdx` | Unit 0 |
| `01-foundations.mdx` | 1 |
| `02-requirements.mdx` | 2 |
| `03-architecture.mdx` | 3 |
| `04-storage.mdx` | 4 |
| `05-scalability.mdx` | 5 |
| `06-reliability.mdx` | 6 |
| `07-distributed.mdx` | 7 (gap) |
| `08-apis.mdx` | 8 |
| `09-async.mdx` | 9 |
| `10-caching.mdx` | 10 |
| `11-search.mdx` | 11 |
| `12-observability.mdx` | 12 |
| `13-security.mdx` | 13 |
| `14-multi-tenancy.mdx` | 14 (gap) |
| `15-case-study.mdx` | 15 |
| `16-tradeoffs.mdx` | 16 (gap) |
| `17-advanced.mdx` | 17 (gap) |
| `18-design-review.mdx` | 18 |

Each stub front matter: `sidebar_position`, `title`, `description`. Body: `CoverageBadge` + outline note “Fill in Task 5/6” **or** minimal headings matching the spec map.

- [ ] **Step 1: Create category + index + stub files with correct positions**
- [ ] **Step 2:** `npm run build` (all routes resolve)
- [ ] **Step 3: Commit** `feat(learn): scaffold System Design curriculum spine`

---

### Task 5: Fill BRIEFR-primary and strong partial units

**Files:** Modify the `briefr` / strong-`partial` stubs:  
`03-architecture`, `04-storage`, `08-apis`, `11-search`, `13-security`, `15-case-study`, plus BRIEFR halves of `01-foundations`, `05-scalability`, `06-reliability`, `09-async`, `10-caching`, `12-observability`, `02-requirements`, `18-design-review`.

**Method:**
- Link heavily to existing `how-its-built/*` and `intel-lifecycle/*` — do not rewrite Track B.
- Use `InTheCode` / `AtEnterpriseScale` where helpful.
- For `partial` units: BRIEFR section first, then `<SystemDesignGap>` (or embedded external block) for the remainder.
- Validate claims against `.vendor/briefr` if present; else existing portal docs only.

- [ ] **Step 1: Write content for listed units**
- [ ] **Step 2:** `npm run build`
- [ ] **Step 3: Commit** `feat(learn): write BRIEFR-anchored System Design units`

---

### Task 6: Fill gap units and remaining partial externals

**Files:** `07-distributed`, `14-multi-tenancy`, `16-tradeoffs`, `17-advanced`, and complete external halves of any unfinished `partial` files.

**Method:**
- Every gap uses full `<SystemDesignGap>` eight fields.
- Resources: prefer DDIA / canonical docs; optional named YouTube channels with topic labels (max 4 resources).
- Reasons must match product constraints (self-host, single-writer, CVE portal) — no fake features.

- [ ] **Step 1: Write gap/partial-external content**
- [ ] **Step 2:** `npm run build`
- [ ] **Step 3: Commit** `feat(learn): add System Design gap units with curated externals`

---

### Task 7: Final gates + polish

**Files:** pathways/index cross-links; glossary entries if new SD terms need BRIEFR-grounded defs (only if used).

- [ ] **Step 1: Ensure every SD page has CoverageBadge and next-unit links**
- [ ] **Step 2: Gates**

```bash
npm run build
npm run typecheck
rg -n -i 'zero to hero' docs/how-briefr-works
# Spot-check: each gap file contains SystemDesignGap usage
rg -l 'SystemDesignGap' docs/how-briefr-works/system-design
```

- [ ] **Step 3: Commit** `docs(learn): System Design pathway final touch-up`
- [ ] **Step 4: CHECKPOINT** — report: foundation landed, three pathways live, unit counts by tag, build status

---

## Self-review (plan author)

| Spec requirement | Task |
| --- | --- |
| Three pathways; Analyst/Architect complete | Task 3 |
| SD classic order | Task 4–6 |
| Coverage tags briefr/partial/gap | Tasks 2, 4–6 |
| Gap eight-part template | Tasks 2, 6 |
| Scoped shadcn + BRIEFR palette | Tasks 1–2 |
| No invented BRIEFR behavior | Tasks 5–6 |
| Learn-first UI (not full portal rewrite) | Tasks 1–3 (landing optional) |

## Execution

Locked: **subagent-driven-development**.  
If polish PR #4 merges first, rebase and skip redundant Task 1 file copies.
