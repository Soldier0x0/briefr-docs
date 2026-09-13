# Archify relative embed height — design

Date: 2026-09-13  
Repo: `briefr-docs` only.

**Status:** session-settled (crop RCA + user: relative height, no single standard; plan, implement, merge only when green).

## Problem

Docs iframes all use **560px** (`custom.css`, `migrate.cjs`, `ArchifyDiagram`). Archify SVGs use **different viewBoxes** (770×480 auth vs 1080×620 correlation). The iframe is `width: 100%`; the SVG is `width: 100%` with height from aspect ratio. When that height exceeds 560px, `overflow: hidden` on the embed body and diagram container **crops** nodes, region frames, and legends.

This is a class of bug: **fixed viewport + content sized by another axis + clip**.

## Non-goals

- Do not regenerate Archify HTML/IR (no CLI in CI).
- Do not change product UI screenshots or `ZoomableImage` lightbox behavior.
- Do not convert migrated `.md` guides to MDX.
- Do not land this in the `briefr` product repo.

## Approaches

1. **Aspect-ratio shell from committed SVG viewBox (chosen).** Catalog stores `[w, h]`. Wrapper uses `padding-bottom: (h/w)*100% + 16px`; iframe is `position: absolute; inset: 0; height: 100%`. Each diagram’s height follows its own ratio as the article width changes. 16px covers Archify embed `padding: 0.5rem` on `.diagram-container` so the SVG is not clipped inside a correctly sized iframe.
2. **postMessage auto-resize from iframe document.** Accurate inner chrome, extra runtime, sandbox coupling, flicker. Rejected as primary.
3. **Per-id hardcoded pixel heights.** Repeats the 560 class of bug at a new constant. Rejected.

## Contract

- **Source of truth for ratio:** `viewBox` on `static/diagrams/<id>.svg` (`0 0 W H`). Catalog copies it as `"viewBox": [W, H]`.
- **`scripts/check-archify.mjs`** fails if catalog `viewBox` is missing, non-positive, or disagrees with the SVG; if any markdown Archify iframe still has `height="560"` or lacks `--archify-w` / `--archify-h` matching that id; if `custom.css` still sets `.archify-frame` to `560px`.
- **MDX:** `<ArchifyDiagram id title />` looks up catalog; no `height` prop (remove default 560).
- **URL:** `/diagrams/<id>?theme=dark&present=1&embed=1` without `.html`. A `.html?…` src 301s to the clean path and **drops search params**, so embed mode never turns on.
- **CSS:** no global iframe height. `.archify-embed` owns the box.

## Sibling UX scan (same class)

| Surface | Verdict |
|---------|---------|
| Archify iframe 560px + overflow hidden | **Fix this PR** |
| `ArchifyDiagram` figure `overflow: hidden` with mismatched height | **Fix** (box matches ratio) |
| Raster screenshots via `ZoomableImage` | `height: auto`, lightbox `object-fit: contain`, `max-height: 90vh` — contain, not crop. No change. |
| Inline SVG `<img>` | `height: auto; max-width: 100%`. No change. |
| Markdown tables | `overflow-x: auto`. No change. |
| Code blocks `overflow: hidden` | Horizontal clip of long lines is existing theme behavior, not this crop class. Out of scope. |
| Mermaid on GitHub-only system-design links | Not rendered on the portal. Out of scope. |

No other docs embed uses a fixed pixel height on a variable-aspect canvas.

## Errors

- Unknown `id` in `ArchifyDiagram`: checker already fails at build; component still renders with a last-resort `1080 / 560` so the page does not throw.
- Missing SVG viewBox: checker fails.
- Weekly migrate: `archifyIframe` must emit the wrapper so patches do not reintroduce 560px.

## Tests

- Node: parse viewBox; wrapper HTML contains matching CSS variables; reject 560px pattern.
- `npm run check:archify` then `npm run build` / `npm run typecheck`.
- Browser: How it works — architecture, auth, ingest, correlation — SVG canvas fully inside iframe (legend visible; region frames not clipped at the iframe edge).
