# How BRIEFR Works — Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the **How BRIEFR Works — and Why** learning section in `briefr-docs`: IA, nav, MDX chapter components, hybrid sync hooks for `study-guide/` + `learn/`, glossary stub, pathway landing, one exemplar chapter per track, and outline stubs for the remaining spine — without DNS/deploy changes and without inventing product behavior.

**Architecture:** Portal-native MDX under `docs/how-briefr-works/` owns landings, pathways, glossary, and template-shaped chapters. Canonical `briefr/docs/study-guide/**` and `briefr/docs/learn/**` are mirrored by an extended `scripts/migrate.cjs` into `docs/how-briefr-works/synced/` (excluded from the docs plugin sidebar). Shared React callouts (`InTheCode`, `AtEnterpriseScale`, `TryItYourself`) live under `src/components/learn/` and are imported only from `.mdx` pages. Existing reference pillars stay untouched.

**Tech Stack:** Docusaurus 3.10.2, React 19, TypeScript, MDX (portal-native only), Node `scripts/migrate.cjs`, existing `--brf-*` theme tokens.

## Global Constraints

- Node `>=20`; use `npm` (lockfile present). Do **not** upgrade Docusaurus.
- `onBrokenLinks: 'throw'` must stay green on every `npm run build`.
- Do **not** change `baseUrl`, `url`, Cloudflare, or subdomain config.
- Do **not** modify the `briefr` application codebase. Reading `briefr/docs` via `BRIEFR_MAIN_DOCS` for migrate is fine; if synced folders are absent, migrate must skip them cleanly.
- Do **not** edit the nine existing migrated reference guides except to add a single cross-link from `user-guide/how-it-works.md` → learning landing (Task 7).
- Learning voice: plain verbs, no marketing, never "zero to hero".
- "Try it yourself" never collects API keys or performs live third-party calls from the docs site.
- Track B comparative notes use the `AtEnterpriseScale` component only — keep BRIEFR-native explanation primary.
- Plans/specs live under `docs-internal/` (not published `docs/`).
- Execution default: **subagent-driven** (one fresh subagent per task + review).
- Commits: clear conventional messages; one logical commit per task.

## File map (Phase 1)

| Path | Responsibility |
| --- | --- |
| `src/components/learn/pin.ts` | Single `BRIEFR_DOCS_PIN` for GitHub deep links |
| `src/components/learn/InTheCode.tsx` | "In the code" link list |
| `src/components/learn/AtEnterpriseScale.tsx` | Comparative callout |
| `src/components/learn/TryItYourself.tsx` | Optional hands-on block |
| `src/components/learn/styles.module.css` | Shared learn-callout styles (tokens only) |
| `docs/how-briefr-works/_category_.json` | Sidebar category |
| `docs/how-briefr-works/index.mdx` | Section landing |
| `docs/how-briefr-works/pathways.mdx` | Persona pathways |
| `docs/how-briefr-works/glossary.mdx` | Glossary stub (seed terms) |
| `docs/how-briefr-works/intel-lifecycle/**` | Track A landing, Collect exemplar, outline stubs |
| `docs/how-briefr-works/how-its-built/**` | Track B landing, Resilience exemplar, outline stubs |
| `docs/how-briefr-works/synced/.gitkeep` | Sync root placeholder |
| `scripts/migrate.cjs` | Mirror `study-guide/` + `learn/` when present |
| `docusaurus.config.ts` | Navbar **Learn** item + synced exclude |
| `docs/user-guide/how-it-works.md` | One outbound link to learning landing |

---

### Task 1: Learn callout components + pin constant

**Files:**
- Create: `src/components/learn/pin.ts`
- Create: `src/components/learn/styles.module.css`
- Create: `src/components/learn/InTheCode.tsx`
- Create: `src/components/learn/AtEnterpriseScale.tsx`
- Create: `src/components/learn/TryItYourself.tsx`
- Test: `npm run typecheck`

**Interfaces:**
- Consumes: CSS variables `--brf-*` from `src/css/custom.css`
- Produces: `BRIEFR_DOCS_PIN`, `briefrBlobUrl(path)`, `briefrTreeUrl(path)`, `<InTheCode />`, `<AtEnterpriseScale />`, `<TryItYourself />`

- [ ] **Step 1: Add the pin helper**

Create `src/components/learn/pin.ts`:

```ts
/** Bump when refreshing "In the code" deep links after a briefr docs/code cut. */
export const BRIEFR_DOCS_PIN = 'main';

const GH = 'https://github.com/Soldier0x0/briefr';

export function briefrBlobUrl(repoPath: string): string {
  const cleaned = repoPath.replace(/^\//, '');
  return `${GH}/blob/${BRIEFR_DOCS_PIN}/${cleaned}`;
}

export function briefrTreeUrl(repoPath: string): string {
  const cleaned = repoPath.replace(/^\//, '');
  return `${GH}/tree/${BRIEFR_DOCS_PIN}/${cleaned}`;
}
```

Phase 1 may keep `BRIEFR_DOCS_PIN = 'main'`. Phase 2 should replace it with a full commit SHA once authors freeze links.

- [ ] **Step 2: Add shared styles**

Create `src/components/learn/styles.module.css`:

```css
.box {
  border: 1px solid var(--brf-hairline);
  background: var(--brf-surface);
  padding: 1rem 1.15rem;
  margin: 1.25rem 0;
}

.kicker {
  font-family: var(--brf-font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brf-accent);
  margin: 0 0 0.55rem;
}

.list {
  margin: 0;
  padding-left: 1.1rem;
}

.list a {
  font-family: var(--brf-font-mono);
  font-size: 0.86rem;
}

.note {
  color: var(--brf-dim);
  font-size: 0.9rem;
  margin: 0.65rem 0 0;
}
```

- [ ] **Step 3: Implement the three components**

Create `src/components/learn/InTheCode.tsx`:

```tsx
import type {ReactNode} from 'react';
import {briefrBlobUrl, briefrTreeUrl} from './pin';
import styles from './styles.module.css';

export type CodeRef = {
  path: string;
  label?: string;
  kind?: 'blob' | 'tree';
};

type Props = {
  items: CodeRef[];
  children?: ReactNode;
};

export default function InTheCode({items, children}: Props): ReactNode {
  return (
    <aside className={styles.box} aria-label="In the code">
      <p className={styles.kicker}>In the code</p>
      {children}
      <ul className={styles.list}>
        {items.map((item) => {
          const href =
            item.kind === 'tree'
              ? briefrTreeUrl(item.path)
              : briefrBlobUrl(item.path);
          return (
            <li key={item.path}>
              <a href={href} target="_blank" rel="noreferrer">
                {item.label ?? item.path}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
```

Create `src/components/learn/AtEnterpriseScale.tsx`:

```tsx
import type {ReactNode} from 'react';
import styles from './styles.module.css';

type Props = {children: ReactNode};

export default function AtEnterpriseScale({children}: Props): ReactNode {
  return (
    <aside className={styles.box} aria-label="At enterprise scale">
      <p className={styles.kicker}>At enterprise scale</p>
      <div>{children}</div>
    </aside>
  );
}
```

Create `src/components/learn/TryItYourself.tsx`:

```tsx
import type {ReactNode} from 'react';
import styles from './styles.module.css';

type Props = {children: ReactNode};

export default function TryItYourself({children}: Props): ReactNode {
  return (
    <aside className={styles.box} aria-label="Try it yourself">
      <p className={styles.kicker}>Try it yourself (optional)</p>
      <p className={styles.note}>
        Recommended if you already self-host BRIEFR. Not required to finish
        this chapter — the docs never ask for your API keys.
      </p>
      <div>{children}</div>
    </aside>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/learn
git commit -m "feat(learn): add InTheCode, AtEnterpriseScale, TryItYourself callouts"
```

---

### Task 2: Category tree, landings, pathways, glossary stub

**Files:**
- Create: `docs/how-briefr-works/_category_.json`
- Create: `docs/how-briefr-works/index.mdx`
- Create: `docs/how-briefr-works/pathways.mdx`
- Create: `docs/how-briefr-works/glossary.mdx`
- Create: `docs/how-briefr-works/intel-lifecycle/_category_.json`
- Create: `docs/how-briefr-works/intel-lifecycle/index.mdx`
- Create: `docs/how-briefr-works/how-its-built/_category_.json`
- Create: `docs/how-briefr-works/how-its-built/index.mdx`
- Create: `docs/how-briefr-works/synced/.gitkeep`
- Modify: `docusaurus.config.ts` (navbar **Learn** item)

**Interfaces:**
- Produces: routes under `/docs/how-briefr-works/**`; navbar label `Learn`

- [ ] **Step 1: Category JSON + sync placeholder**

`docs/how-briefr-works/_category_.json`:

```json
{
  "label": "How BRIEFR Works — and Why",
  "position": 3,
  "collapsed": false,
  "link": {"type": "doc", "id": "how-briefr-works/index"}
}
```

`docs/how-briefr-works/intel-lifecycle/_category_.json`:

```json
{
  "label": "Intel lifecycle",
  "position": 2,
  "collapsed": false,
  "link": {"type": "doc", "id": "how-briefr-works/intel-lifecycle/index"}
}
```

`docs/how-briefr-works/how-its-built/_category_.json`:

```json
{
  "label": "How it's built",
  "position": 3,
  "collapsed": false,
  "link": {"type": "doc", "id": "how-briefr-works/how-its-built/index"}
}
```

Create `docs/how-briefr-works/synced/.gitkeep`.

- [ ] **Step 2: Section landing `docs/how-briefr-works/index.mdx`**

```mdx
---
sidebar_position: 1
sidebar_label: Overview
title: How BRIEFR Works — and Why
description: Learn how BRIEFR collects, shapes, and reasons over security intel — and how that system is built.
---

# How BRIEFR Works — and Why

This section teaches **how a self-hosted intel data plane uses security
data** — collect, normalize, enrich, correlate, hunt, detect, prioritize —
and **how BRIEFR is engineered** to do that on one box. It is not a general
cybersecurity syllabus. You get fluent in *this* tool, with the real repo as
a parallel textbook.

## Two tracks

1. **[Intel lifecycle](./intel-lifecycle/)** — the data's journey (start here).
2. **[How it's built](./how-its-built/)** — system design as BRIEFR implements it, with short notes on how larger orgs differ.

Not sure where to begin? Use **[Pathways](./pathways)**.

## Rules of the road

- Every chapter answers the same questions: what / why / where in BRIEFR / how / what it needs / how industry differs.
- Deploying BRIEFR is **recommended**, never required.
- The docs site never asks for your API keys and never fires live third-party calls.
```

- [ ] **Step 3: Pathways**

Create `docs/how-briefr-works/pathways.mdx`:

```mdx
---
sidebar_position: 2
sidebar_label: Pathways
title: Pathways
description: Pick a starting path — analyst or builder — into How BRIEFR Works.
---

# Pathways

## Analyst

You care about the feed, enrichment, and why a CVE rose in the brief.

1. [Collect](./intel-lifecycle/collect)
2. [Normalize](./intel-lifecycle/normalize)
3. [Enrich](./intel-lifecycle/enrich)
4. [Correlate](./intel-lifecycle/correlate)
5. [Hunt](./intel-lifecycle/hunt)
6. [Detect](./intel-lifecycle/detect)
7. [Prioritize / report](./intel-lifecycle/prioritize)

Then skim [Resilience](./how-its-built/resilience) so quota and rate limits make sense when a source goes quiet.

## Architect / builder

You care about how the machine is wired.

1. [Ingestion and scheduler](./how-its-built/ingestion-scheduler)
2. [Resilience](./how-its-built/resilience)
3. [Storage](./how-its-built/storage)
4. [API and auth](./how-its-built/api-auth)
5. [Background jobs](./how-its-built/background-jobs)
6. [Search and embeddings](./how-its-built/search-embeddings)
7. [Webhooks and operations](./how-its-built/webhooks-ops)

Cross-read the [Intel lifecycle](./intel-lifecycle/) spine so design choices stay tied to the data path.
```

- [ ] **Step 4: Glossary stub**

Create `docs/how-briefr-works/glossary.mdx` with `sidebar_position: 4`, title `Glossary`. Alphabetical `###` terms with 1–3 sentence BRIEFR-grounded definitions for: ATT&CK, Circuit breaker, Correlation, CVE, CVSS, EPSS, IOC, KEV, Normalization, Token bucket, TTP. No "zero to hero" wording.

- [ ] **Step 5: Track landings**

`docs/how-briefr-works/intel-lifecycle/index.mdx` — spine table linking Collect…Prioritize.

`docs/how-briefr-works/how-its-built/index.mdx` — list of seven Track B chapters; state that primary text is how BRIEFR is built and `At enterprise scale` boxes are comparative only.

- [ ] **Step 6: Navbar**

In `docusaurus.config.ts` `themeConfig.navbar.items`, after Developer, add:

```ts
{to: '/docs/how-briefr-works', label: 'Learn', position: 'left'},
```

- [ ] **Step 7: Commit landings** (stubs in Task 3 may be required before build — create stubs next if `onBrokenLinks` fails)

```bash
git add docs/how-briefr-works docusaurus.config.ts
git commit -m "feat(learn): add How BRIEFR Works IA, pathways, glossary, navbar"
```

---

### Task 3: Outline stubs for remaining spine chapters

**Files:**
- Create: `docs/how-briefr-works/intel-lifecycle/{normalize,enrich,correlate,hunt,detect,prioritize}.mdx`
- Create: `docs/how-briefr-works/how-its-built/{ingestion-scheduler,storage,api-auth,background-jobs,search-embeddings,webhooks-ops}.mdx`

**Interfaces:**
- Consumes: links from Task 2 pathways
- Produces: green build with all pathway targets present

- [ ] **Step 1: Write stubs**

Use this shape (Track A example — Normalize):

```mdx
---
sidebar_position: 3
sidebar_label: Normalize
title: Normalize
description: Why BRIEFR normalizes intel records before enrichment and correlation.
---

# Normalize

:::note[Outline — Phase 2]
Full chapter lands in the Track A content plan. Sections below are the required template; fill with sourced claims only.
:::

## What it is

## Why we do it

## Where it lives in BRIEFR

## How it works

## What it needs

## How industry does it — and why BRIEFR does it this way
```

| File | `sidebar_position` | Outline note |
| --- | --- | --- |
| `normalize.mdx` | 3 | Phase 2 |
| `enrich.mdx` | 4 | Phase 2 |
| `correlate.mdx` | 5 | Phase 2 |
| `hunt.mdx` | 6 | Phase 2 |
| `detect.mdx` | 7 | Phase 2 |
| `prioritize.mdx` | 8 | Phase 2 |
| `ingestion-scheduler.mdx` | 2 | Phase 3 |
| `storage.mdx` | 4 | Phase 3 |
| `api-auth.mdx` | 5 | Phase 3 |
| `background-jobs.mdx` | 6 | Phase 3 |
| `search-embeddings.mdx` | 7 | Phase 3 |
| `webhooks-ops.mdx` | 8 | Phase 3 |

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `[SUCCESS] Generated static files in "build".`

- [ ] **Step 3: Commit**

```bash
git add docs/how-briefr-works
git commit -m "feat(learn): add outline stubs for intel lifecycle and how-it's-built spines"
```

---

### Task 4: Exemplar Track A chapter — Collect

**Files:**
- Create: `docs/how-briefr-works/intel-lifecycle/collect.mdx`
- Read first: `docs/integrations.md`, `docs/user-guide/how-it-works.md`, `docs/developer-guide/system-design.md` (scheduler / resilient outbound sections)

**Interfaces:**
- Consumes: `InTheCode`, `TryItYourself` via `@site/src/components/learn/...`
- Produces: complete Collect chapter; claims traceable to those sources

- [ ] **Step 1: Write full `collect.mdx`**

- Front matter: `sidebar_position: 2`, `sidebar_label: Collect`.
- Fill all seven template sections with real prose (no outline note).
- Cover scheduler-driven ingest vs request-path; soft-fail from Integrations; optional keys.
- Use:

```mdx
import InTheCode from '@site/src/components/learn/InTheCode';
import TryItYourself from '@site/src/components/learn/TryItYourself';
```

- `<InTheCode items={[{path:'backend/scheduler.py'},{path:'backend/resilient_client.py'}]} />` — if a path is wrong vs the live repo, correct to names cited in system-design; do not invent modules.
- Industry section: TIP/SIEM on-demand pulls vs BRIEFR batch sync into local DB.
- TryItYourself: self-host Admin feed health + mention a redacted fixture walkthrough; no key forms.

- [ ] **Step 2: Build + grep gate**

```bash
npm run build
rg -n -i 'zero to hero' docs/how-briefr-works src/components/learn; test $? -eq 1
```

Expected: build success; `rg` finds no matches (exit 1).

- [ ] **Step 3: Commit**

```bash
git add docs/how-briefr-works/intel-lifecycle/collect.mdx
git commit -m "feat(learn): write Collect exemplar chapter (intel lifecycle)"
```

---

### Task 5: Exemplar Track B chapter — Resilience

**Files:**
- Create: `docs/how-briefr-works/how-its-built/resilience.mdx`
- Read first: `docs/developer-guide/system-design.md` (Resilient outbound HTTP + Rate limiting), `docs/admin-guide/operations.md` (Multi-worker), `docs/security-guide.md`

**Interfaces:**
- Consumes: `InTheCode`, `AtEnterpriseScale`, `TryItYourself`
- Produces: complete Resilience chapter with enterprise-scale comparative note

- [ ] **Step 1: Write full `resilience.mdx`**

- `sidebar_position: 3`, label `Resilience`.
- Cover: per-source circuit breakers; retries / `Retry-After`; `retries=0` on quota-billed sources; inbound token buckets on IOC/refresh/wallboard; single scheduler owner when using multiple API workers.
- Include `<AtEnterpriseScale>` on gateway-level limiting / dedicated enrichment workers vs BRIEFR's single-box model for a focused team (~dozens of users, not hyperscale).
- Optional TryItYourself: self-hosted `/api/health` `feeds.sources` circuit fields.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add docs/how-briefr-works/how-its-built/resilience.mdx
git commit -m "feat(learn): write Resilience exemplar chapter (how it's built)"
```

---

### Task 6: Extend `migrate.cjs` for study-guide + learn

**Files:**
- Modify: `scripts/migrate.cjs`
- Modify: `docusaurus.config.ts` (exclude synced tree from docs plugin)
- Modify: `README.md`

**Interfaces:**
- Consumes: `BRIEFR_MAIN_DOCS` (existing)
- Produces: optional byte-mirror of `study-guide/` and `learn/` into `docs/how-briefr-works/synced/`; skip cleanly if absent; excluded from sidebar/routes

- [ ] **Step 1: Exclude synced docs from the plugin**

In `docusaurus.config.ts` classic preset `docs` options, add:

```ts
exclude: ['**/how-briefr-works/synced/**'],
```

- [ ] **Step 2: Append mirror helpers to `scripts/migrate.cjs`**

After the screenshots block:

```js
function mirrorTree(relDir) {
  const from = path.join(SRC, relDir);
  const to = path.join(DST, 'how-briefr-works', 'synced', relDir);
  if (!fs.existsSync(from)) {
    console.log(`skip ${relDir}/ (not present under BRIEFR_MAIN_DOCS)`);
    return;
  }
  fs.rmSync(to, {recursive: true, force: true});
  fs.mkdirSync(to, {recursive: true});
  const walk = (dir, outDir) => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const srcPath = path.join(dir, entry.name);
      const dstPath = path.join(outDir, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(dstPath, {recursive: true});
        walk(srcPath, dstPath);
      } else if (/\.(md|mdx|svg|png|webp|json)$/i.test(entry.name)) {
        fs.copyFileSync(srcPath, dstPath);
      }
    }
  };
  walk(from, to);
  console.log(`${relDir}/* -> how-briefr-works/synced/${relDir}/`);
}

mirrorTree('study-guide');
mirrorTree('learn');
```

Phase 1 copies bytes only (no front-matter rewrite). Portal-native pages link to GitHub or to future Phase 2 wrappers.

- [ ] **Step 3: Dry-run**

```bash
node scripts/migrate.cjs
npm run build
```

Expected: `skip study-guide/` / `skip learn/` when absent; build green. If SRC itself is missing, do not weaken the existing nine-file requirement — only the new trees are optional.

- [ ] **Step 4: README**

Under "Editing docs", add:

```markdown
- Learning section (`docs/how-briefr-works/`) is portal-native. Optional
  mirrors of `briefr` `docs/study-guide/` and `docs/learn/` land under
  `docs/how-briefr-works/synced/` via `migrate.cjs` (excluded from the
  docs plugin routes/sidebar).
```

- [ ] **Step 5: Commit**

```bash
git add scripts/migrate.cjs docusaurus.config.ts README.md docs/how-briefr-works/synced
git commit -m "feat(migrate): optional mirror of study-guide and learn into synced/"
```

---

### Task 7: Cross-link + final verification

**Files:**
- Modify: `docs/user-guide/how-it-works.md`

**Interfaces:**
- Produces: discoverability from existing user-guide essay

- [ ] **Step 1: Deeper-reference row**

Append to the "Deeper reference" table in `docs/user-guide/how-it-works.md`:

```markdown
| [How BRIEFR Works — and Why](/docs/how-briefr-works) | Learning tracks: intel lifecycle + how it's built |
```

- [ ] **Step 2: Final gates**

```bash
npm run typecheck
npm run build
rg -n -i 'zero to hero' docs/how-briefr-works src/components/learn; test $? -eq 1
```

Browser-check `/docs/how-briefr-works`, `/docs/how-briefr-works/intel-lifecycle/collect`, `/docs/how-briefr-works/how-its-built/resilience` at 1440 and 390.

- [ ] **Step 3: Commit**

```bash
git add docs/user-guide/how-it-works.md
git commit -m "docs: link user-guide how-it-works to learning section"
```

- [ ] **Step 4: CHECKPOINT — report**

Report routes, exemplar titles, migrate skip/exclude behavior, build status. Do **not** start DNS, subdomain, or Phase 2/3 content without a new plan. Phase 2 = Track A fill; Phase 3 = Track B fill.

---

## Follow-on plans (not this PR)

1. **Phase 2 — Track A content:** fill Normalize…Prioritize + priority source deep-dives (NVD, KEV, EPSS, OTX, …) using the template; pin `BRIEFR_DOCS_PIN` to a SHA.
2. **Phase 3 — Track B content:** fill remaining how-it's-built chapters with `AtEnterpriseScale` notes.
3. **Visual polish / deploy:** existing polish PRs; maintainer-owned Cloudflare cutover.

## Self-review

- **Spec coverage:** IA/nav → T2; components → T1; template → T3–T5; hybrid sync → T6; pathways/glossary → T2; both-track exemplars → T4/T5; no DNS → Global Constraints; optional labs → TryItYourself copy; discoverability → T7.
- **Placeholder scan:** stubs explicitly labeled Phase 2/3; exemplars require full prose.
- **Names:** `how-briefr-works`, `intel-lifecycle`, `how-its-built`, `InTheCode`, `AtEnterpriseScale`, `TryItYourself`, `BRIEFR_DOCS_PIN`, `exclude: ['**/how-briefr-works/synced/**']`.
