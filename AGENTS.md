# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **BRIEFR documentation portal** — a static
[Docusaurus](https://docusaurus.io) site. There is no backend or database.
Node.js `>=20` is required (the VM ships Node 22).

Standard commands live in `package.json` scripts and `README.md`. Key ones:

- `npm start` — dev server with hot reload. Production uses `baseUrl: '/'`, so
  locally the site is at `http://localhost:3000/` (not `/briefr-docs/`). Add
  `-- --host 0.0.0.0` to expose it.
- `npm run build` — production build. The build enforces `onBrokenLinks: 'throw'`
  (see `docusaurus.config.ts`), so broken internal links fail the build. Treat a
  green `npm run build` as the primary quality gate before pushing.
- `npm run typecheck` — runs `tsc` (this is the closest thing to a lint step;
  there is no ESLint config).
- `npm run serve` — serves the already-built `build/` output locally.
- `npm run deploy` — `npm run build && wrangler deploy` (Cloudflare Workers;
  production URL `https://docs.projectjupiter.in`).

Non-obvious gotchas:

- **Search only works after `npm run build`.** The local search plugin
  (`@easyops-cn/docusaurus-search-local`) only generates its index during a
  production build. Under `npm start` the search box shows "The search index is
  only available when you run docusaurus build!" — this is expected, not a bug.
  To test search, run `npm run build` then `npm run serve`.
- `scripts/migrate.cjs` pulls migrated doc pages from the canonical `briefr` repo
  (`BRIEFR_MAIN_DOCS`, default `../../briefr-main/docs`). Optional unless
  refreshing migrated guides. After migrate, bump `BRIEFR_DOCS_PIN` in
  `src/components/learn/pin.ts` to the validated commit SHA. `PORTAL_PATCHES` in
  `migrate.cjs` applies portal-only transforms (systemd callouts, study-guide
  link removal).
- **Sync workflow:** `.github/workflows/sync.yml` can refresh migrated docs when
  `BRIEFR_MAIN_READ_TOKEN` is configured in repo secrets. Failures usually mean
  an expired token or missing briefr checkout path.
- **Responsive screenshots:** `npm run shoot` (after `npm run build &&
  npm run serve`) captures homepage, getting-started, pathways, and a doc page
  at 390/768/1440px widths. Requires `playwright` and `npx playwright install chromium`.
- **Plans and specs** for multi-step work live under `docs-internal/`. The
  master execution plan is
  `docs-internal/plans/2026-07-23-briefr-docs-completion.md`.
