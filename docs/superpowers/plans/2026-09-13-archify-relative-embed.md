# Archify relative embed height Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Size every Archify docs iframe to that diagram’s SVG viewBox ratio so maps are not cropped by a shared 560px height.

**Architecture:** Catalog copies `[w, h]` from committed SVGs. A shared CJS helper wraps CommonMark iframes. MDX `ArchifyDiagram` sets the same CSS variables. Global `height: 560px` is removed. `check-archify.mjs` is the merge gate for drift.

**Tech Stack:** Docusaurus 3, React 19, Node scripts (`check-archify.mjs`, `migrate.cjs`).

## Global Constraints

- Repo: `briefr-docs` only. Do not edit `briefr`.
- Do not regenerate `static/diagrams/*.html` with the Archify CLI.
- Migrated guides stay `.md`; wrappers come from `migrate.cjs`.
- Embed URL stays `?theme=dark&present=1&embed=1`.
- Extra shell height is exactly `16px` (`EMBED_PAD_PX`) for Archify embed padding `0.5rem` × 2.
- Dark admin tokens do not apply; keep `--brf-ink` embed chrome.

---

### Task 1: Shared embed helper + checker

**Files:**
- Create: `scripts/lib/archify-embed.cjs`
- Create: `scripts/test-archify-embed.cjs`
- Modify: `scripts/check-archify.mjs`
- Modify: `diagrams/catalog.json` (each entry `"viewBox": [W, H]`)
- Modify: `package.json` (script `test:archify`)

**Interfaces:**
- Consumes: SVG `viewBox="0 0 W H"`
- Produces: `parseViewBox(svgText) -> [w,h]`, `wrapArchifyIframe(id, title, w, h) -> html`, `EMBED_PAD_PX = 16`

- [ ] **Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const {parseViewBox, wrapArchifyIframe, EMBED_PAD_PX} = require('./lib/archify-embed.cjs');

test('parseViewBox reads authored size', () => {
  assert.deepEqual(parseViewBox('<svg viewBox="0 0 770 480">'), [770, 480]);
});

test('wrap uses CSS variables not 560px height', () => {
  const html = wrapArchifyIframe('auth-layers', 'BRIEFR auth layers', 770, 480);
  assert.equal(html.includes('height="560"'), false);
  assert.equal(html.includes('--archify-w:770'), true);
  assert.equal(html.includes('--archify-h:480'), true);
  assert.equal(html.includes('class="archify-embed"'), true);
  assert.equal(EMBED_PAD_PX, 16);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /agent/repos/briefr-docs && node --test scripts/test-archify-embed.cjs`

Expected: FAIL (MODULE_NOT_FOUND for `./lib/archify-embed.cjs`).

- [ ] **Step 3: Write minimal implementation**

`scripts/lib/archify-embed.cjs` as in the spec: parse `viewBox="0 0 W H"`, wrap:

```js
function wrapArchifyIframe(id, title, w, h) {
  const src = `/diagrams/${id}.html?theme=dark&present=1&embed=1`;
  return [
    `<div class="archify-embed" style="--archify-w:${w};--archify-h:${h}">`,
    `<iframe class="archify-frame" src="${src}" title="${title}" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin"></iframe>`,
    `</div>`,
    `<noscript><img src="/diagrams/${id}.svg" alt="${title}" /></noscript>`,
  ].join('\n');
}
```

Extend `check-archify.mjs`: require `viewBox`; match SVG; fail `height="560"` on archify iframes; fail iframe without `--archify-w:` / `--archify-h:` matching catalog; fail `height: 560px` in `src/css/custom.css`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/test-archify-embed.cjs && node scripts/check-archify.mjs`

Expected: tests PASS; checker may still FAIL until later tasks rewrite CSS/markdown.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/archify-embed.cjs scripts/test-archify-embed.cjs scripts/check-archify.mjs diagrams/catalog.json package.json
git commit -m "test(docs): gate Archify embeds on viewBox ratio"
```

---

### Task 2: CSS + MDX component + migrate

**Files:**
- Modify: `src/css/custom.css`
- Modify: `src/components/ArchifyDiagram.tsx`
- Modify: `src/components/ArchifyDiagram.module.css`
- Modify: `scripts/migrate.cjs`
- Modify: every `docs/**/*.md` Archify iframe
- Modify: `diagrams/README.md`
- Modify: `docs/superpowers/specs/2026-09-11-archify-docs-diagrams-design.md` (height default)

**Interfaces:**
- Consumes: `catalog.diagrams[].viewBox`
- Produces: `.archify-embed` padding-bottom ratio + 16px; iframe fill

- [ ] **Step 1: CSS shell**

```css
.archify-embed {
  position: relative;
  width: 100%;
  height: 0;
  margin: 1.25rem 0 1.75rem;
  padding-bottom: calc(var(--archify-h) / var(--archify-w) * 100% + 16px);
  border: 1px solid var(--brf-hairline);
  border-radius: 10px;
  overflow: hidden;
  background: var(--brf-ink);
}
.archify-embed .archify-frame,
.markdown iframe.archify-frame {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  border: 0;
  background: var(--brf-ink);
}
```

Delete `.markdown iframe.archify-frame { height: 560px; }`.

`ArchifyDiagram` figure uses the same padding-bottom formula and catalog lookup.

- [ ] **Step 2: migrate.cjs uses wrapArchifyIframe**

`archifyIframe(id, title)` loads catalog viewBox; throws if missing.

- [ ] **Step 3: Rewrite committed Markdown iframes** to the wrapper (same helper).

- [ ] **Step 4: Run checker + typecheck + build**

Run: `npm run test:archify && npm run check:archify && npm run typecheck && npm run build`

Expected: all green.

- [ ] **Step 5: Commit**

```bash
git commit -m "fix(docs): size Archify iframes from SVG viewBox"
```

---

### Task 3: Visual verify How it works

**Files:** none (browser / Playwright against `npm run serve`)

- [ ] **Step 1:** Serve `build/`. Measure each How it works iframe: `iframe.clientHeight` vs `svg.getBoundingClientRect().height` — SVG must not exceed iframe (allow 20px pad). Auth (770×480) must be taller than production (912×476) at the same width.

- [ ] **Step 2:** Confirm in-SVG legend on architecture is visible (not clipped).

- [ ] **Step 3:** Commit only if code changes; otherwise proceed to PR.

---

## Self-review

1. Spec coverage: relative height, checker drift, migrate, MDX, sibling scan, 16px pad.
2. No TBD placeholders.
3. Names: `viewBox`, `archify-embed`, `EMBED_PAD_PX`, `--archify-w`, `--archify-h`.
