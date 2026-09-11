# Archify diagrams

Typed IR lives in `diagrams/archify/*.json`. Generated artifacts:

- `static/diagrams/<id>.html` — interactive viewer
- `static/diagrams/<id>.svg` — fallback / noscript

Clone Archify once, then deliver:

```bash
git clone --depth 1 https://github.com/tt-a1i/archify.git /tmp/archify
ARCHIFY=/tmp/archify/archify/bin/archify.mjs
id=production-architecture
type=architecture
node "$ARCHIFY" deliver "$type" "diagrams/archify/${id}.json" "static/diagrams/${id}.html" --quality showcase
node scripts/extract-archify-svg.mjs "static/diagrams/${id}.html" "static/diagrams/${id}.svg"
node scripts/check-archify.mjs
```

Do not paste Archify HTML into Markdown. Use `<ArchifyDiagram id="..." title="..." />`.
