# Archify diagrams

Typed IR lives in `diagrams/archify/*.json`. Generated artifacts:

- `static/diagrams/<id>.html` — interactive viewer (docs site)
- `static/diagrams/<id>.svg` — fallback / noscript / GitHub
- `static/diagrams/<id>.png` — GitHub Markdown raster (when SVG preview is awkward)

Clone Archify once, then deliver:

```bash
git clone --depth 1 https://github.com/tt-a1i/archify.git /tmp/archify
ARCHIFY=/tmp/archify/archify/bin/archify.mjs
id=production-architecture
type=architecture
node "$ARCHIFY" deliver "$type" "diagrams/archify/${id}.json" "static/diagrams/${id}.html" --quality showcase
node scripts/extract-archify-svg.mjs "static/diagrams/${id}.html" "static/diagrams/${id}.svg"
node scripts/extract-archify-png.mjs "$id"
node scripts/check-archify.mjs
```

Do not paste Archify HTML into Markdown. Use `<ArchifyDiagram id="..." title="..." />` on MDX pages. Migrated CommonMark (`.md`) uses a same-origin iframe plus noscript SVG via `scripts/migrate.cjs`.

## GitHub Markdown (this repo)

GitHub does not run the interactive HTML viewer. Use the committed PNG or SVG:

![BRIEFR production architecture](../static/diagrams/production-architecture.png)

![BRIEFR ingest pipeline](../static/diagrams/ingest-pipeline.png)

![BRIEFR intel lifecycle](../static/diagrams/intel-lifecycle.png)
