# How BRIEFR Works — Audit, Learn UI, Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fact-check existing Learn chapters against private `briefr`, polish Learn UI on the BRIEFR palette, and fill the six remaining Track B (*How it’s built*) stubs.

**Architecture:** Portal-native MDX under `docs/how-briefr-works/` stays the course spine. Validation uses a local gitignored checkout at `.vendor/briefr` (never committed). `BRIEFR_DOCS_PIN` becomes a real commit SHA. UI polish is limited to `src/components/learn/*` and Learn landings, using only `--brf-*` tokens. Track B chapters reuse the Phase 1/2 seven-section template plus `AtEnterpriseScale`.

**Tech Stack:** Docusaurus 3.10.2, MDX, existing `src/components/learn/*`, impeccable for UI craft.

**Spec:** `docs-internal/specs/2026-07-22-how-briefr-works-audit-phase3-design.md`

## Global Constraints

- Node `>=20`; do not upgrade Docusaurus.
- `onBrokenLinks: 'throw'` must stay green on every `npm run build`.
- Do not change `baseUrl`, `url`, Cloudflare, or subdomain config.
- Do not modify the `briefr` application codebase; do not commit `.vendor/` or PATs.
- Never invent product behavior — every “In BRIEFR” claim traces to a file under `.vendor/briefr` or an existing portal doc that matches that code. **Code wins** on conflicts.
- Never “zero to hero”.
- TryItYourself never collects API keys or fires live third-party calls from the docs site.
- Use `backend/` / `frontend/` prefixes on `InTheCode` paths; every path must exist at the pinned SHA.
- **Palette only:** `--brf-*` (accent `#e85533`, warm neutrals, link `#7eb8f0`, DM Serif Display / DM Sans / IBM Plex Mono). No new brand hues.
- Prefer absolute `/docs/how-briefr-works/...` or `./slug` links on nested category pages.
- Commits: one logical commit per task; conventional messages.
- Execution: subagent-driven.

## File map

| Path | Responsibility |
| --- | --- |
| `src/components/learn/pin.ts` | Pin SHA for GitHub deep links |
| `src/components/learn/styles.module.css` | Learn callout visual polish |
| `src/components/learn/{InTheCode,AtEnterpriseScale,TryItYourself}.tsx` | Callout structure/ARIA as needed |
| `docs/how-briefr-works/index.mdx` | Learning landing polish |
| `docs/how-briefr-works/pathways.mdx` | Pathway copy + Track B readiness |
| `docs/how-briefr-works/glossary.mdx` | Fact fixes only if audit finds drift |
| `docs/how-briefr-works/intel-lifecycle/*.mdx` | Track A factual fixes |
| `docs/how-briefr-works/intel-lifecycle/sources/*.mdx` | Source deep-dive factual fixes + header dash normalize |
| `docs/how-briefr-works/how-its-built/resilience.mdx` | Fact fixes if needed |
| `docs/how-briefr-works/how-its-built/{ingestion-scheduler,storage,api-auth,background-jobs,search-embeddings,webhooks-ops}.mdx` | Full Track B chapters |
| `.gitignore` | Ignore `.vendor/`, `.superpowers/`, `.artifacts/` |

**Validation root (local only):** `.vendor/briefr` @ `04aba1ad17d18c1c45175881ceef56b7112abb36` (confirm with `git -C .vendor/briefr rev-parse HEAD` before Task 1; if missing, stop and restore checkout).

---

### Task 1: Pin SHA + repo hygiene

**Files:**
- Modify: `src/components/learn/pin.ts`
- Modify: `.gitignore` (ensure `.vendor/`, `.superpowers/`, `.artifacts/`)
- Delete from git: `.superpowers/sdd/task-2-report.md`, `task-4-report.md`, `task-5-report.md`

**Interfaces:**
- Produces: `BRIEFR_DOCS_PIN = '04aba1ad17d18c1c45175881ceef56b7112abb36'` (full SHA or unambiguous short form matching current checkout — use **full 40-char SHA**)

- [ ] **Step 1: Confirm checkout**

```bash
test -d .vendor/briefr/.git
git -C .vendor/briefr rev-parse HEAD
# Expected: 04aba1ad17d18c1c45175881ceef56b7112abb36
```

- [ ] **Step 2: Set pin**

In `src/components/learn/pin.ts`, replace:

```ts
export const BRIEFR_DOCS_PIN = 'main';
```

with:

```ts
export const BRIEFR_DOCS_PIN = '04aba1ad17d18c1c45175881ceef56b7112abb36';
```

Keep the comment that the pin is bumped when refreshing deep links.

- [ ] **Step 3: Remove leaked reports + ignore**

```bash
git rm -f .superpowers/sdd/task-2-report.md .superpowers/sdd/task-4-report.md .superpowers/sdd/task-5-report.md
```

Ensure `.gitignore` contains:

```
.vendor/
.superpowers/
.artifacts/
```

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: SUCCESS

- [ ] **Step 5: Commit**

```bash
git add src/components/learn/pin.ts .gitignore
git commit -m "chore(learn): pin briefr SHA and remove session report artifacts"
```

---

### Task 2: Factual audit — Track A spine + sources + Resilience

**Files:**
- Modify as needed under:
  - `docs/how-briefr-works/intel-lifecycle/{collect,normalize,enrich,correlate,hunt,detect,prioritize}.mdx`
  - `docs/how-briefr-works/intel-lifecycle/sources/{nvd,kev,epss,otx,index}.mdx`
  - `docs/how-briefr-works/how-its-built/resilience.mdx`
  - `docs/how-briefr-works/glossary.mdx` (only if product facts are wrong)
- Create: `docs-internal/audits/2026-07-22-learn-factual-audit.md` (short log of checks + fixes)

**Interfaces:**
- Consumes: pinned tree at `.vendor/briefr`
- Produces: corrected MDX; audit log listing each fixed claim

**Method (required):**

1. Extract every `InTheCode` `path` and assert `test -e .vendor/briefr/$path` (for trees, directory exists).
2. For load-bearing numbers/behaviors (weights, lane names, endpoint paths, cache keys, soft-fail rules), open the cited file or `docs/SYSTEM_DESIGN.md` / `docs/HOW_IT_WORKS.md` in the checkout and confirm.
3. Fix wrong paths/claims; remove or hedge unverifiable statements; do not invent replacements.
4. Normalize source deep-dive H2 to em-dash: `## How industry does it — and why BRIEFR does it this way`
5. On `intel-lifecycle/index.mdx` and `how-its-built/index.mdx`, prefer `./collect`-style or absolute `/docs/how-briefr-works/...` links.
6. If `prioritize.mdx` `InTheCode` list exceeds ~6 items, trim to primary backend citations already named in prose.

- [ ] **Step 1: Path existence sweep**

```bash
# Example approach — adapt as needed
rg -o "path=\"[^\"]+\"" docs/how-briefr-works --glob '*.mdx' | sed 's/path="//;s/"$//' | sort -u | while read p; do
  if [ ! -e ".vendor/briefr/$p" ]; then echo "MISSING $p"; fi
done
```

Expected: no MISSING lines (or all MISSING lines fixed in MDX before commit).

- [ ] **Step 2: Apply factual + hygiene edits; write audit log**

Audit log format (minimum):

```md
# Learn factual audit — 2026-07-22
Pin: 04aba1ad17d18c1c45175881ceef56b7112abb36
## Fixes
- file: note
## Verified OK (sample)
- file: note
```

- [ ] **Step 3: Gates**

```bash
npm run build
npm run typecheck
rg -n -i 'zero to hero' docs/how-briefr-works
rg -n 'Outline — Phase 2' docs/how-briefr-works || true
```

Expected: build/typecheck success; zero-to-hero empty.

- [ ] **Step 4: Commit**

```bash
git add docs/how-briefr-works docs-internal/audits/2026-07-22-learn-factual-audit.md
git commit -m "docs(learn): factual audit against briefr pin and hygiene fixes"
```

---

### Task 3: Learn UI polish (BRIEFR palette)

**Files:**
- Modify: `src/components/learn/styles.module.css`
- Modify if needed: `InTheCode.tsx`, `AtEnterpriseScale.tsx`, `TryItYourself.tsx`
- Modify: `docs/how-briefr-works/index.mdx`, `docs/how-briefr-works/pathways.mdx`

**Interfaces:**
- Consumes: `--brf-*` tokens from `src/css/custom.css`
- Produces: clearer Learn callouts + landing hierarchy; optional subtle motion with `prefers-reduced-motion`

**Design rules:**
- Accent kickers stay `--brf-accent` / `--brf-accent-strong`
- Surfaces `--brf-surface` / `--brf-raise`; borders `--brf-hairline`
- No new color tokens; no purple/glow stacks; no off-brand fonts
- Use impeccable craft judgment within those tokens
- Cards only if they aid interaction/scanning; prefer hairline asides consistent with portal

Example CSS direction (implementer may refine, tokens must remain):

```css
.box {
  border: 1px solid var(--brf-hairline);
  border-left: 2px solid var(--brf-accent);
  background: var(--brf-surface);
  padding: 1rem 1.15rem;
  margin: 1.25rem 0;
}

.boxEnterprise {
  border-left-color: var(--brf-link);
}

@media (prefers-reduced-motion: reduce) {
  .box {
    transition: none;
  }
}
```

Differentiate `AtEnterpriseScale` vs `InTheCode` vs `TryItYourself` via kicker color/border only within palette (accent vs link vs dim), not new hues.

- [ ] **Step 1: Implement styles + landing copy/layout tweaks**
- [ ] **Step 2: `npm run build` && `npm run typecheck`**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(learn): polish Learn callouts and landings on BRIEFR palette"
```

---

### Task 4: Track B — Ingestion and scheduler

**Files:**
- Modify: `docs/how-briefr-works/how-its-built/ingestion-scheduler.mdx`
- Read first: `.vendor/briefr/backend/scheduler.py`, `scheduler_locks.py`, `backend/feeds/`, `.vendor/briefr/docs/SYSTEM_DESIGN.md`

**Interfaces:**
- Produces: complete chapter (remove Outline note); ≥1 `InTheCode` with existing `backend/` paths; optional `AtEnterpriseScale` + `TryItYourself`

Required themes (only if true in code/docs):
- APScheduler / single-writer owner model as implemented
- Outbound feed ingest jobs
- Why locking matters on one box

- [ ] **Step 1: Write full chapter from verified sources**
- [ ] **Step 2: `npm run build`**
- [ ] **Step 3: Commit** `feat(learn): write Ingestion and scheduler chapter (how it's built)`

---

### Task 5: Track B — Storage

**Files:**
- Modify: `docs/how-briefr-works/how-its-built/storage.mdx`
- Read first: `.vendor/briefr/backend/database.py`, `backend/db/`, `backend/alembic/`, Postgres docs in checkout / portal `docs/admin-guide/postgres.md`

**Interfaces:**
- Produces: complete Storage chapter; SQLite vs Postgres claims must match product docs/code

- [ ] **Step 1: Write full chapter**
- [ ] **Step 2: `npm run build`**
- [ ] **Step 3: Commit** `feat(learn): write Storage chapter (how it's built)`

---

### Task 6: Track B — API and auth

**Files:**
- Modify: `docs/how-briefr-works/how-its-built/api-auth.mdx`
- Read first: `.vendor/briefr/backend/main.py`, `backend/auth/`, `backend/routers/`, `auth_middleware.py`

**Interfaces:**
- Produces: complete API & auth chapter; session/admin boundaries as implemented

- [ ] **Step 1: Write full chapter**
- [ ] **Step 2: `npm run build`**
- [ ] **Step 3: Commit** `feat(learn): write API and auth chapter (how it's built)`

---

### Task 7: Track B — Background jobs

**Files:**
- Modify: `docs/how-briefr-works/how-its-built/background-jobs.mdx`
- Read first: `.vendor/briefr/backend/jobs/`, correlation/OTX/maintenance entrypoints as they exist

**Interfaces:**
- Produces: complete Background jobs chapter

- [ ] **Step 1: Write full chapter**
- [ ] **Step 2: `npm run build`**
- [ ] **Step 3: Commit** `feat(learn): write Background jobs chapter (how it's built)`

---

### Task 8: Track B — Search and embeddings

**Files:**
- Modify: `docs/how-briefr-works/how-its-built/search-embeddings.mdx`
- Read first: search/embedding/ml modules under `.vendor/briefr/backend/` (**only document what exists**)

**Interfaces:**
- Produces: complete chapter; explicitly omit or hedge anything not in tree

- [ ] **Step 1: Write full chapter**
- [ ] **Step 2: `npm run build`**
- [ ] **Step 3: Commit** `feat(learn): write Search and embeddings chapter (how it's built)`

---

### Task 9: Track B — Webhooks and operations

**Files:**
- Modify: `docs/how-briefr-works/how-its-built/webhooks-ops.mdx`
- Read first: `.vendor/briefr/backend/webhooks/`, backup/monitoring/health modules as they exist; portal admin/ops docs

**Interfaces:**
- Produces: complete Webhooks & operations chapter

- [ ] **Step 1: Write full chapter**
- [ ] **Step 2: `npm run build`**
- [ ] **Step 3: Commit** `feat(learn): write Webhooks and operations chapter (how it's built)`

---

### Task 10: Pathways touch-up + final gate

**Files:**
- Modify: `docs/how-briefr-works/pathways.mdx`, `docs/how-briefr-works/how-its-built/index.mdx` as needed
- Modify: `docs/how-briefr-works/index.mdx` if Track B status copy still says outline-only

**Interfaces:**
- Consumes: completed Track B chapters
- Produces: Architect pathway describes complete spine; no Phase 3 outline notes remain

- [ ] **Step 1: Update pathway/index status copy**
- [ ] **Step 2: Final gates**

```bash
rg -n 'Outline — Phase 3' docs/how-briefr-works
# Expected: no matches
npm run build
npm run typecheck
rg -n -i 'zero to hero' docs/how-briefr-works
# Path sweep again (same as Task 2)
```

- [ ] **Step 3: Commit** `docs(learn): pathways touch-up after Track B fill`
- [ ] **Step 4: CHECKPOINT** — report: audit done, UI polished, six Track B chapters complete, pin SHA, build status

---

## Self-review (plan author)

| Spec requirement | Task |
| --- | --- |
| Pin real SHA | Task 1 |
| Remove `.superpowers` leaks | Task 1 |
| Factual audit Track A + Resilience | Task 2 |
| Hygiene (dashes, links, InTheCode trim) | Task 2 |
| Learn UI on BRIEFR palette | Task 3 |
| Six Track B chapters | Tasks 4–9 |
| Pathways / final gate | Task 10 |
| No deploy/DNS | Global constraints |
| Code wins / no hallucination | Global + Task 2/4–9 methods |

No TBD placeholders in tasks.

## Execution

Locked by design: **subagent-driven-development** (fresh implementer + reviewer per task, final whole-branch review).
