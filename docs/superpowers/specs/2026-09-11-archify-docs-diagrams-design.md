# Archify depiction diagrams for the BRIEFR docs portal

Date: 2026-09-11  
Repo: `briefr-docs` only (do not land this spec in `briefr`)

## Goal

Replace architecture / process depiction diagrams on https://docs.projectjupiter.in with [Archify](https://github.com/tt-a1i/archify) artifacts so readers can see how data moves (interactive HTML with route motion). Keep product UI screenshots as the visual source of truth for how the app looks.

## Non-goals

- Do not replace README/gallery/UI screenshots (`ui-*.png`, `assets/screenshots/*`).
- Do not change brand marks, favicon, or OG image via Archify.
- Do not import existing Mermaid or SVG files. Redraw depiction diagrams from typed JSON.
- Do not push this plan or implementation to the `briefr` product repository.
- Do not make the Docusaurus production build depend on the Archify CLI (commit generated HTML).

## Current state

- Depiction SVGs live under `docs/user-guide/assets/` and `docs/admin-guide/assets/` (`production-architecture`, `auth-layers`, `ingest-pipeline`, `correlation-pipeline`). Markdown embeds them as `![...](assets/....svg)`.
- `docs/developer-guide/system-design.md` links to Mermaid files in `briefr` on GitHub; they do not render on the portal.
- Learn MDX (`docs/how-briefr-works/**`) is mostly text + ASCII. “Try it yourself” boxes have no depiction diagrams.
- Raster screenshots already go through `ZoomableImage`. SVGs stay as raw `<img>` (`src/theme/MDXComponents/index.tsx`).
- Docs plugin excludes `**/superpowers/**`. Specs and plans are not site pages.

## Approaches considered

1. **Iframe of committed Archify HTML (chosen).** Same-origin `static/diagrams/*.html`, MDX component, `sandbox="allow-scripts allow-same-origin"`, `animation: "trace"`, `visual_preset: "signal-flow"`. Fallback `<img>` of exported SVG if the iframe fails. GitHub-rendered Markdown (if any) keeps the SVG export. No build-time Archify.
2. **Inline SVG only.** Smaller files, no motion, no route probe. Rejected for the portal (motion was an explicit requirement). SVG remains the fallback and any future GitHub embed.
3. **GIF/WebM loops.** Autoplay, no click-to-trace. Rejected as primary. Optional later for social clips only.

## Architecture

### Diagram library

Canonical sources:

| Path | Role |
|------|------|
| `diagrams/archify/*.json` | Typed Archify IR (edit this) |
| `static/diagrams/*.html` | `archify deliver` output (commit; served at `/diagrams/<id>.html`) |
| `static/diagrams/*.svg` | Static export for fallback and non-HTML surfaces |

IDs are kebab-case: `production-architecture`, `auth-layers`, `ingest-pipeline`, `correlation-pipeline`, `intel-lifecycle`, plus per-chapter maps listed in the catalog.

Regenerate with:

```bash
node vendor/archify/bin/archify.mjs deliver <type> diagrams/archify/<id>.json static/diagrams/<id>.html --quality showcase
```

Pin `vendor/archify` as a documented clone path in the plan (gitignored or documented one-shot); do not vendor the 800KB HTML examples. Operators regenerate locally; CI only checks that committed HTML contains an `<svg` and matches the catalog.

### Embed component

`src/components/ArchifyDiagram.tsx` is the only way MDX pages mount these maps.

Props:

- `id: string` — catalog id; resolves to `/diagrams/${id}.html` and `/diagrams/${id}.svg`
- `title: string` — iframe `title` (required for a11y)
- `height?: number` — default `560`

Behavior:

- Render a `figure` with the iframe, `loading="lazy"`, `referrerPolicy="no-referrer"`.
- `sandbox="allow-scripts allow-same-origin"` so Archify viewer JS runs; no `allow-popups` / `allow-top-navigation`.
- Overlay a visually-hidden / `noscript` fallback image of the SVG.
- If iframe `error`, show the SVG image instead (never raw HTML source).
- Theme: docs site is dark (`--brf-ink`). Archify HTML uses dark theme query `?theme=dark&present=1` so chrome matches.

Register in `src/theme/MDXComponents/index.tsx` as `ArchifyDiagram`.

Do not put Archify HTML inside MDX as a fenced HTML block (that is the “broken HTML text” failure mode).

### Catalog

`diagrams/catalog.json`:

```json
{
  "diagrams": [
    {
      "id": "production-architecture",
      "type": "architecture",
      "title": "Production architecture",
      "pages": ["docs/user-guide/how-it-works.md", "docs/admin-guide/self-host.md"]
    }
  ]
}
```

`scripts/check-archify.mjs` fails if a catalog id is missing JSON, HTML, or SVG; if HTML lacks `<svg`; or if an MDX/MD file contains `ArchifyDiagram` with an unknown `id`.

### Content rules for IR

- Match living docs: PostgreSQL-first production, FastAPI + APScheduler, optional Cloudflare/nginx edge, analyst UI reads DB (schedulers write).
- Do not draw SQLite as the production default. SQLite may appear on the self-host page as a labeled **dev fallback** node only.
- Nodes and edges must name real BRIEFR pieces (NVD, KEV, EPSS, OTX, Postgres, FastAPI). No invented microservices.
- Screenshots stay on user-guide “using BRIEFR” and any screenshot galleries.

## Page placement (phased)

### Wave A — embed rail + four core maps (this implementation)

Replace the four depiction SVGs on:

- `docs/user-guide/how-it-works.md` (architecture, auth, ingest, correlation)
- `docs/admin-guide/self-host.md` (production architecture)

Add the same production map to `docs/how-briefr-works/system-design/03-architecture.mdx` (replace the ASCII box).

Leave `github-social-banner.svg` and screenshot PNGs untouched. Duplicate SVG copies under `docs/*/assets/` may remain unused until a later cleanup; Wave A stops using them on those pages.

### Wave B — intel lifecycle + how-it’s-built

Add Archify maps (dataflow or architecture) immediately after the opening “What it is” section, before “Try it yourself”:

- `intel-lifecycle/index.mdx` — spine dataflow
- `collect`, `normalize`, `enrich`, `correlate`, `detect`, `prioritize`
- `how-its-built/ingestion-scheduler`, `api-auth`, `storage`, `webhooks-ops`

### Wave C — remaining learn + system-design units

ASCII/Mermaid-only pages (`developer-guide/system-design.md` GitHub links, remaining system-design units, remaining how-its-built / sources). Same embed component; no new patterns.

## Error handling

- Missing HTML: iframe `onError` → SVG fallback; `check-archify.mjs` fails in CI/`npm run typecheck` companion script.
- Broken JSON: do not commit; `archify deliver` must exit 0 before HTML is replaced.
- CSP: Docusaurus default allows same-origin iframe scripts. Do not add `frame-src 'none'`.
- Reduced motion: Archify already honors `prefers-reduced-motion`; do not add a second animation layer.

## Testing

- `node scripts/check-archify.mjs` — catalog integrity.
- `npm run build` — `onBrokenLinks: throw`.
- Browser: open each Wave A page, confirm iframe shows an SVG canvas (not HTML source), title visible, no console error from the iframe.
- Regression: screenshot pages still use `ZoomableImage` / PNG.

## Success

A reader on docs.projectjupiter.in sees interactive Archify maps where architecture and pipelines are explained, can watch connection motion, and still sees real product screenshots on usage pages.
