# briefr-docs

Documentation portal for [BRIEFR](https://github.com/Soldier0x0/briefr) — a
self-hosted CVE intelligence and detection-engineering platform. Built with
Docusaurus.

## Editing docs

Every page is a Markdown file under `docs/`. Edit, commit, push — that's the
whole workflow. Folder = sidebar section; `sidebar_position` in the front
matter controls ordering.

- Portal-native pages (Security Guide, Integrations, FAQ, Release Notes,
  Roadmap, Product status, Getting started, Learn MDX, guide landings) live
  only here — edit them directly.
- Migrated pages (User/Admin/Developer chapters, API Reference) are pulled
  from the canonical `briefr` repo (`BRIEFR_MAIN_DOCS` or
  `../../briefr-main/docs`). Re-sync with: `node scripts/migrate.cjs`
- Learning section (`docs/how-briefr-works/`) is portal-native. Optional
  mirrors of `briefr` `docs/study-guide/` and `docs/learn/` land under
  `docs/how-briefr-works/synced/` via `migrate.cjs` (excluded from the
  docs plugin routes/sidebar).

## Develop

```bash
npm install
npm start        # http://localhost:3000/ (baseUrl is /)
npm run build    # production build (must pass before pushing)
npm run shoot    # optional responsive screenshots (needs build + serve running)
```

Production is served at `https://docs.projectjupiter.in` via **Cloudflare
Workers** (`npm run deploy`, `wrangler.jsonc`). `baseUrl` is `/`.

CI (`.github/workflows/deploy.yml`) runs `npm run build` on every push.
GitHub Pages deploy is conditional on a public repo; production uses Wrangler.

## License

Documentation content © Sai Harsha Vardhan, **BSL-1.1** (same license family as
BRIEFR itself — see [FAQ](/docs/faq) on the live site).
