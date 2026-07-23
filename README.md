# briefr-docs

Documentation portal for [BRIEFR](https://github.com/Soldier0x0/briefr) — a
self-hosted CVE intelligence and detection-engineering platform. Built with
Docusaurus.

## Editing docs

Every page is a Markdown file under `docs/`. Edit, commit, push — that's the
whole workflow. Folder = sidebar section; `sidebar_position` in the front
matter controls ordering.

- Portal-native pages (Pathways, Security Guide, Integrations, FAQ, Release
  Notes, guide landing pages, How BRIEFR Works) live only here — edit them
  directly.
- Migrated pages (User/Admin/Developer chapters, API Reference) are pulled
  from the main `briefr` repo `docs/`, which stays canonical. Re-sync with:
  `BRIEFR_MAIN_DOCS=/path/to/briefr/docs node scripts/migrate.cjs`
- Internal maintainer notes live in `docs-internal/` — never published to the
  docs site.

## Develop

```bash
npm install
npm start        # http://localhost:3000/ (baseUrl is /)
npm run build    # production build (must pass before pushing)
```

Production is served at `https://docs.projectjupiter.in` (Cloudflare). `baseUrl` is `/`.

## License

Documentation content © Sai Harsha Vardhan. BRIEFR source is licensed under
BUSL-1.1 — see the [product LICENSE](https://github.com/Soldier0x0/briefr/blob/main/LICENSE).
