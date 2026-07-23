---
sidebar_label: Contributing
sidebar_position: 3
---

# Contributing

Full guidelines live in the product repository:

**[CONTRIBUTING.md](https://github.com/Soldier0x0/briefr/blob/main/CONTRIBUTING.md)**

---

## Summary

BRIEFR is licensed under the **Business Source License 1.1** — free for
personal, non-commercial use; commercial use requires a one-time license
(contact [harsha@projectjupiter.in](mailto:harsha@projectjupiter.in)). Four
years after publication of a given version, that version converts to Apache-2.0.
Contributions are welcome on `main` via pull request.

### Before you start

1. Read [`docs/ONBOARDING.md`](https://github.com/Soldier0x0/briefr/blob/main/docs/ONBOARDING.md)
   and [`CLAUDE.md`](https://github.com/Soldier0x0/briefr/blob/main/CLAUDE.md)
   (danger zones, SQL conventions, UI rules).
2. Production uses **PostgreSQL** (`DATABASE_URL`). The default test suite runs
   on SQLite; any `db/` change should also be validated against Postgres when
   possible.
3. Do not commit secrets, real API keys, or production `.env` files.

### Development setup

```bash
# Backend (from backend/)
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --port 8000

# Frontend (from frontend/)
npm ci && npm run dev   # proxies /api → :8000
```

Local merge gate (required before opening a PR):

```bash
./scripts/verify-local.sh
```

Use `--full` when Postgres and optional tools are available.

### Pull request guidelines

- **One focused change per PR** — match existing style; minimum diff.
- **Tests:** backend changes need `pytest tests/ -q` green; frontend changes
  need `npm run build` green.
- **Docs:** if runtime behavior or API changes, update `docs/PRODUCT_STATUS.md`
  and `docs/API_REFERENCE.md` in the same PR.
- **Migrations:** Alembic only, forward-only — never edit applied revisions.
- **Security:** do not weaken `require_admin`, webhook SSRF checks, or DB
  explorer allowlists without an explicit design discussion.

### What we especially welcome

- Detection-engineering templates (Sigma / hunt starters) with tests
- Bug fixes with a failing test or clear repro steps
- Documentation corrections against **current** code (`docs/PRODUCT_STATUS.md`
  wins over stale snapshots)

### What to avoid

- Large refactors unrelated to the issue
- New dependencies without strong justification
- Light-theme or component-library rewrites (dark terminal aesthetic is intentional)
- STIX export / V2.0 platform scope (parked per roadmap)

### Security issues

See [`SECURITY.md`](https://github.com/Soldier0x0/briefr/blob/main/SECURITY.md) —
**do not** open public issues for vulnerabilities. Email
**harsha@projectjupiter.in**.

For local setup and reading order, see [Contributor onboarding](./onboarding.md).
