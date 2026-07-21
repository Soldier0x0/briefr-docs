# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single product: the **BRIEFR documentation portal**, a static
[Docusaurus](https://docusaurus.io) site. There is no backend or database — it
is a fully static site. Node.js `>=20` is required (the VM ships Node 22).

Standard commands live in `package.json` scripts and `README.md`. Key ones:

- `npm start` — dev server with hot reload. Docusaurus serves under the
  `baseUrl` `/briefr-docs/`, so the site is at
  `http://localhost:3000/briefr-docs/` (not `/`). Add `-- --host 0.0.0.0` to
  expose it.
- `npm run build` — production build. The build enforces `onBrokenLinks: 'throw'`
  (see `docusaurus.config.ts`), so broken internal links fail the build. Treat a
  green `npm run build` as the primary quality gate before pushing.
- `npm run typecheck` — runs `tsc` (this is the closest thing to a lint step;
  there is no ESLint config).
- `npm run serve` — serves the already-built `build/` output locally.

Non-obvious gotchas:

- **Search only works after `npm run build`.** The local search plugin
  (`@easyops-cn/docusaurus-search-local`) only generates its index during a
  production build. Under `npm start` the search box shows "The search index is
  only available when you run docusaurus build!" — this is expected, not a bug.
  To test search, run `npm run build` then `npm run serve`.
- `scripts/migrate.cjs` pulls "migrated" doc pages from a separate canonical
  `briefr` repo (via `BRIEFR_MAIN_DOCS`, default `../../briefr-main/docs`). It is
  optional and not needed to run/build the portal; skip it unless refreshing
  migrated docs.
