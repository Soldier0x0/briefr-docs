# briefr-docs

Documentation portal for [BRIEFR](https://github.com/Soldier0x0/briefr) — a
self-hosted CVE intelligence and detection-engineering platform. Built with
Docusaurus.

## Editing docs

Every page is a Markdown file under `docs/`. Edit, commit, push — that's the
whole workflow. Folder = sidebar section; `sidebar_position` in the front
matter controls ordering.

- Portal-native pages (Security Guide, Integrations, FAQ, Release Notes,
  guide landing pages) live only here — edit them directly.
- Migrated pages (User/Admin/Developer chapters, API Reference, Roadmap) are
  pulled from `../briefr-main/docs`, which stays canonical. Re-sync with:
  `node scripts/migrate.cjs`

## Develop

```bash
npm install
npm start        # dev server with hot reload
npm run build    # production build (must pass before pushing)
npm run serve    # serve the production build locally
npm run shoot    # Playwright screenshots at 390/768/1440 (needs serve)
```

The landing page and swizzled `DocCard` use a **scoped** Tailwind v4 +
shadcn/ui layer (`src/components/ui/`). Semantic tokens bridge to the existing
`--brf-*` product tokens in `src/css/tailwind.css`. Tailwind **preflight is
disabled** so Infima is never reset. Migrated Markdown is never styled with
Tailwind — content-wide responsive/typography wins live in
`src/css/custom.css` only.

## License

Documentation content © Sai Harsha Vardhan, AGPL-3.0-or-later (same as
BRIEFR itself).
