# Archify Docs Diagrams Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship interactive Archify depiction diagrams on the BRIEFR docs portal, keeping product screenshots unchanged.

**Architecture:** Typed JSON IR in `diagrams/archify/` is compiled with the Archify CLI into self-contained HTML + SVG under `static/diagrams/`. MDX/Markdown mounts them only through `ArchifyDiagram`. A catalog script fails the build helper if files or ids drift.

**Tech Stack:** Docusaurus 3 MDX, React 19, Archify CLI (`node vendor/archify/bin/archify.mjs`), Playwright/browser verification.

## Global Constraints

- Work only in `briefr-docs` (never commit this work to `briefr`).
- Do not replace or delete product UI screenshots (`ui-*.png`, `assets/screenshots/**`).
- Do not embed raw Archify HTML inside Markdown (iframe component only).
- Production diagrams are PostgreSQL-first; SQLite is a labeled dev fallback only.
- Archify `meta.animation` is `"trace"`; `meta.visual_preset` is `"signal-flow"`; iframe URL includes `?theme=dark&present=1`.
- `sandbox="allow-scripts allow-same-origin"` only.
- `npm run build` must stay green (`onBrokenLinks: throw`).
- Spec: `docs/superpowers/specs/2026-09-11-archify-docs-diagrams-design.md`.

---

### Task 1: Catalog + integrity checker

**Files:**
- Create: `diagrams/catalog.json`
- Create: `scripts/check-archify.mjs`
- Modify: `package.json` (add `"check:archify": "node scripts/check-archify.mjs"`)

**Interfaces:**
- Consumes: nothing
- Produces: `catalog.json` shape `{ diagrams: Array<{ id: string, type: "architecture"|"dataflow"|"sequence"|"workflow"|"lifecycle", title: string, pages: string[] }> }`; `check-archify.mjs` exit 0 when every id has `diagrams/archify/<id>.json`, `static/diagrams/<id>.html` containing `<svg`, and `static/diagrams/<id>.svg`; also scans `docs/**/*.{md,mdx}` for `<ArchifyDiagram` `id="..."` / `id={'...'}` and fails on unknown ids.

- [ ] **Step 1: Write catalog (Wave A ids only for now)**

```json
{
  "diagrams": [
    {
      "id": "production-architecture",
      "type": "architecture",
      "title": "Production architecture",
      "pages": [
        "docs/user-guide/how-it-works.md",
        "docs/admin-guide/self-host.md",
        "docs/how-briefr-works/system-design/03-architecture.mdx"
      ]
    },
    {
      "id": "auth-layers",
      "type": "architecture",
      "title": "Auth layers",
      "pages": ["docs/user-guide/how-it-works.md"]
    },
    {
      "id": "ingest-pipeline",
      "type": "dataflow",
      "title": "Ingest pipeline",
      "pages": ["docs/user-guide/how-it-works.md"]
    },
    {
      "id": "correlation-pipeline",
      "type": "dataflow",
      "title": "Correlation pipeline",
      "pages": ["docs/user-guide/how-it-works.md"]
    }
  ]
}
```

- [ ] **Step 2: Write `scripts/check-archify.mjs`**

```javascript
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, 'diagrams/catalog.json'), 'utf8'),
);
const ids = new Set();
let failed = false;

function fail(msg) {
  console.error(msg);
  failed = true;
}

for (const d of catalog.diagrams) {
  if (!d.id || !d.type || !d.title) fail(`catalog entry missing fields: ${JSON.stringify(d)}`);
  if (ids.has(d.id)) fail(`duplicate catalog id: ${d.id}`);
  ids.add(d.id);
  const jsonPath = path.join(root, 'diagrams/archify', `${d.id}.json`);
  const htmlPath = path.join(root, 'static/diagrams', `${d.id}.html`);
  const svgPath = path.join(root, 'static/diagrams', `${d.id}.svg`);
  if (!fs.existsSync(jsonPath)) fail(`missing IR ${jsonPath}`);
  if (!fs.existsSync(htmlPath)) fail(`missing HTML ${htmlPath}`);
  else {
    const html = fs.readFileSync(htmlPath, 'utf8');
    if (!html.includes('<svg')) fail(`HTML has no <svg>: ${htmlPath}`);
    if (html.trimStart().startsWith('{') || html.includes('<ArchifyDiagram')) {
      fail(`HTML looks like source, not artifact: ${htmlPath}`);
    }
  }
  if (!fs.existsSync(svgPath)) fail(`missing SVG ${svgPath}`);
}

function walk(dir) {
  for (const name of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p);
    else if (/\.(md|mdx)$/.test(name.name)) {
      const text = fs.readFileSync(p, 'utf8');
      for (const m of text.matchAll(/<ArchifyDiagram[^>]*\bid=["']([^"']+)["']/g)) {
        if (!ids.has(m[1])) fail(`${p} references unknown ArchifyDiagram id=${m[1]}`);
      }
    }
  }
}
walk(path.join(root, 'docs'));

if (failed) process.exit(1);
console.log(`archify catalog ok (${ids.size} diagrams)`);
```

- [ ] **Step 3: Add npm script `check:archify`**

- [ ] **Step 4: Run checker — expect FAIL (missing files)**

Run: `node scripts/check-archify.mjs`  
Expected: exit 1, missing IR/HTML/SVG

- [ ] **Step 5: Commit**

```bash
git add diagrams/catalog.json scripts/check-archify.mjs package.json
git commit -m "chore(docs): add Archify diagram catalog checker"
```

---

### Task 2: `ArchifyDiagram` component

**Files:**
- Create: `src/components/ArchifyDiagram.tsx`
- Create: `src/components/ArchifyDiagram.module.css`
- Modify: `src/theme/MDXComponents/index.tsx`

**Interfaces:**
- Consumes: `id: string`, `title: string`, optional `height?: number` (default 560)
- Produces: iframe `src={`/diagrams/${id}.html?theme=dark&present=1`}` plus fallback `<img src={`/diagrams/${id}.svg`} alt={title} />`

- [ ] **Step 1: Add CSS module**

```css
.figure {
  margin: 1.25rem 0 1.75rem;
  border: 1px solid var(--brf-hairline);
  border-radius: 10px;
  overflow: hidden;
  background: var(--brf-ink);
}

.frame {
  display: block;
  width: 100%;
  border: 0;
  background: var(--brf-ink);
}

.fallback {
  display: none;
  width: 100%;
  height: auto;
}

.figure[data-failed='true'] .frame {
  display: none;
}

.figure[data-failed='true'] .fallback {
  display: block;
}
```

- [ ] **Step 2: Add component**

```tsx
import {useCallback, useState, type ReactNode} from 'react';
import styles from './ArchifyDiagram.module.css';

type Props = {
  id: string;
  title: string;
  height?: number;
};

export default function ArchifyDiagram({
  id,
  title,
  height = 560,
}: Props): ReactNode {
  const [failed, setFailed] = useState(false);
  const htmlSrc = `/diagrams/${id}.html?theme=dark&present=1`;
  const svgSrc = `/diagrams/${id}.svg`;
  const onError = useCallback(() => setFailed(true), []);

  return (
    <figure className={styles.figure} data-failed={failed ? 'true' : 'false'}>
      {!failed && (
        <iframe
          className={styles.frame}
          src={htmlSrc}
          title={title}
          height={height}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin"
          onError={onError}
        />
      )}
      <img className={styles.fallback} src={svgSrc} alt={title} />
    </figure>
  );
}
```

Always render the fallback `img` (hidden unless failed) so crawlers and `noscript` still have a graphic. Also wrap with `<noscript><img src={svgSrc} alt={title} /></noscript>`.

- [ ] **Step 3: Register in MDXComponents**

```tsx
import ArchifyDiagram from '@site/src/components/ArchifyDiagram';
// in export default:
ArchifyDiagram,
```

- [ ] **Step 4: `npm run typecheck`**

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ArchifyDiagram.tsx src/components/ArchifyDiagram.module.css src/theme/MDXComponents/index.tsx
git commit -m "feat(docs): add ArchifyDiagram iframe embed"
```

---

### Task 3: Clone Archify CLI and generate Wave A artifacts

**Files:**
- Create: `diagrams/archify/production-architecture.json`
- Create: `diagrams/archify/auth-layers.json`
- Create: `diagrams/archify/ingest-pipeline.json`
- Create: `diagrams/archify/correlation-pipeline.json`
- Create: `static/diagrams/*.html` and `*.svg` (generated)
- Create: `diagrams/README.md` (regenerate commands)

**Interfaces:**
- Consumes: Archify schema v1 architecture + dataflow
- Produces: four HTML artifacts containing `<svg`

- [ ] **Step 1: Clone Archify (not committed)**

```bash
git clone --depth 1 https://github.com/tt-a1i/archify.git /tmp/archify
```

Confirm `node /tmp/archify/archify/bin/archify.mjs doctor` or `ls /tmp/archify/bin/archify.mjs`.

- [ ] **Step 2: Author IR**

`production-architecture.json`: grid architecture — Browser (frontend) → nginx/Cloudflare (cloud, optional) → FastAPI (backend) → PostgreSQL 16 (database); APScheduler (backend) → external intel (external). Cards: “UI reads DB; schedulers write.”

`auth-layers.json`: architecture — Edge optional, session cookie analyst, admin role, wallboard token.

`ingest-pipeline.json`: dataflow — NVD/KEV/EPSS/OTX (external) → scheduler jobs → Postgres → FEED UI.

`correlation-pipeline.json`: dataflow — four lanes Campaigns / Infrastructure / Actor / Temporal into drawer.

Every file: `"schema_version": 1`, `"meta": { "animation": "trace", "visual_preset": "signal-flow", "locale": "en", "title": "..." }`.

- [ ] **Step 3: Deliver**

```bash
ARCHIFY=/tmp/archify/bin/archify.mjs
# if binary lives under archify/bin:
ARCHIFY=/tmp/archify/archify/bin/archify.mjs
for spec in production-architecture:architecture auth-layers:architecture ingest-pipeline:dataflow correlation-pipeline:dataflow; do
  id="${spec%%:*}"
  type="${spec##*:}"
  node "$ARCHIFY" deliver "$type" "diagrams/archify/${id}.json" "static/diagrams/${id}.html" --quality showcase
done
```

If SVG export is a viewer action not a CLI flag, copy the inline SVG from the HTML (`<svg ...></svg>` first root) into `static/diagrams/<id>.svg` with a small node extract script, or use Archify export if `deliver` writes SVG. Prefer CLI export when present.

- [ ] **Step 4: Run `node scripts/check-archify.mjs`**

Expected: PASS (`archify catalog ok (4 diagrams)`)

- [ ] **Step 5: Commit JSON + HTML + SVG + README**

```bash
git add diagrams static/diagrams
git commit -m "feat(docs): add Wave A Archify architecture and pipeline maps"
```

---

### Task 4: Mount Wave A on portal pages

**Files:**
- Modify: `docs/user-guide/how-it-works.md` — this file is CommonMark (`.md`). Docusaurus `format: detect` means `.md` cannot import React components. **Convert `how-it-works.md` to `how-it-works.mdx`** (keep slug/sidebar) OR add a thin MDX wrapper. Chosen: rename to `how-it-works.mdx` with the same front matter and replace the four `![...](assets/*.svg)` with `<ArchifyDiagram />`.
- Modify: `docs/admin-guide/self-host.md` → `self-host.mdx` for the production map only (rest of page unchanged).
- Modify: `docs/how-briefr-works/system-design/03-architecture.mdx` — replace ASCII architecture block with `<ArchifyDiagram id="production-architecture" title="BRIEFR production architecture" />`. Fix the “SQLite (default)” sentence to PostgreSQL-first with SQLite as opt-out, matching `docs/product-status.md`.

**Interfaces:**
- Consumes: `ArchifyDiagram`
- Produces: pages that render iframes

- [ ] **Step 1: Convert how-it-works to MDX and embed four diagrams**

```mdx
import ArchifyDiagram from '@site/src/components/ArchifyDiagram';

## Architecture

<ArchifyDiagram id="production-architecture" title="BRIEFR production architecture" />
```

Repeat for auth, ingest, correlation. Keep surrounding prose.

- [ ] **Step 2: Convert self-host At a glance image to ArchifyDiagram**

- [ ] **Step 3: Architecture unit 3**

- [ ] **Step 4: `npm run build`**

Expected: success, no broken links. Confirm `build/diagrams/production-architecture.html` exists.

- [ ] **Step 5: Browser verify**

`npm start -- --host 0.0.0.0` then open `/docs/user-guide/how-it-works`, `/docs/admin-guide/self-host`, `/docs/how-briefr-works/system-design/03-architecture`. Confirm iframe document contains SVG (not plaintext HTML). Screenshot each.

- [ ] **Step 6: Commit**

```bash
git add docs/user-guide/how-it-works.mdx docs/admin-guide/self-host.mdx docs/how-briefr-works/system-design/03-architecture.mdx
git rm docs/user-guide/how-it-works.md docs/admin-guide/self-host.md
git commit -m "feat(docs): embed Wave A Archify maps on how-it-works and self-host"
```

---

### Task 5: Wave B — lifecycle and how-it’s-built maps

**Files:**
- Create: `diagrams/archify/intel-lifecycle.json` (dataflow)
- Create: `diagrams/archify/collect.json`, `normalize.json`, `enrich.json`, `correlate.json`, `detect.json`, `prioritize.json`
- Create: `diagrams/archify/ingestion-scheduler.json`, `api-auth.json`, `storage.json`, `webhooks-ops.json`
- Modify: `diagrams/catalog.json` — append these ids
- Modify: corresponding MDX pages — insert `<ArchifyDiagram />` after “What it is” (or equivalent first section)
- Generate HTML/SVG as in Task 3

**Interfaces:**
- Consumes: Task 2 component + Task 1 checker
- Produces: 11 additional catalog entries

- [ ] **Step 1: Author IR from chapter facts** (scheduler ingest, normalize into `cves`, enrich OTX/ATT&CK, correlate four lanes, detect Sigma/Forge, prioritize OP, auth cookies, Postgres+pgvector, webhook SSRF)

- [ ] **Step 2: Deliver + checker PASS**

- [ ] **Step 3: Embed on pages; do not put diagrams inside screenshot galleries**

- [ ] **Step 4: `npm run build` + browser sample three Wave B pages**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(docs): add Archify maps to intel lifecycle and how-it-is-built"
```

---

### Task 6: Wire check into typecheck/build habit + leftover Mermaid links

**Files:**
- Modify: `package.json` `"typecheck": "tsc && node scripts/check-archify.mjs"`
- Modify: `docs/developer-guide/system-design.md` — for each “Sequence diagram: github mermaid” line, add an Archify diagram if Wave B already covers that flow; otherwise add `cve-feed`, `cve-detail`, `ioc-lookup`, `startup` sequence maps (Wave C minimum: `cve-feed` sequence).

- [ ] **Step 1: typecheck includes checker**

- [ ] **Step 2: Add at least `cve-feed` sequence on system-design.md — convert that file to MDX if embeds are needed, or add a sibling `system-design-diagrams.mdx`. Prefer converting `system-design.md` → `.mdx` only if the file’s `<` characters are safe; if migrate-style HTML exists, keep `.md` and add a new `docs/developer-guide/flows.mdx` that embeds diagrams and link it from system-design.

Chosen if CommonMark conflict: create `docs/developer-guide/flows.mdx` rather than risking `{` in the giant markdown file.

- [ ] **Step 3: Build + browser `/docs/developer-guide/flows`**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(docs): Archify checker in typecheck and developer flow maps"
```

---

## Execution notes

- Screenshots on `docs/user-guide/using-briefr.md` stay.
- After Task 4, Wave A is user-visible. Continue Task 5–6 in the same goal.
- Verify with a real browser, not only `grep`.
