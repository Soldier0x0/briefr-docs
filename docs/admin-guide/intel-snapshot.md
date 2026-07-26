---
sidebar_label: Intel snapshot
sidebar_position: 7
description: Public intel bundle format — intel vs app schemas, export, merge import, and admin UI.
---

# Intel snapshot

**Digest of** [`docs/DATA_SNAPSHOT.md`](https://github.com/Soldier0x0/briefr/blob/main/docs/DATA_SNAPSHOT.md)
**and** [`docs/INTEL_PUBLISH.md`](https://github.com/Soldier0x0/briefr/blob/main/docs/INTEL_PUBLISH.md)
on `main`. When this page and the product repo disagree, GitHub wins.

BRIEFR separates **intel** (publishable CVE/correlation/embedding data) from **app**
(operator credentials, IOC cache, stack terms, webhooks, preferences). After Alembic
revision `036_intel_app_schema_split`, intel tables live in schema **`intel`** and
operator tables in **`app`** (single Postgres database).

---

## Bundle format (v1 and v2)

| Field | Value |
| --- | --- |
| Container | `briefr-intel-YYYY-MM.pgdump.gz` |
| Sidecar | `briefr-intel-YYYY-MM.manifest.json` |
| `format_version` | **1** (legacy `public` tables) or **2** (`intel` schema after `036`) |
| `bundle_kind` | `briefr-intel` |
| Operator rows | **Zero** — export script enforces row-count guards |

Verify before import:

```bash
python scripts/verify_intel_snapshot.py briefr-intel-YYYY-MM.pgdump.gz
```

Import modes:

```bash
# Greenfield / empty operator tables
python scripts/import_intel_snapshot.py --input … --database-url … --mode bootstrap

# Existing operator instance — upserts intel.* only; app.* unchanged
python scripts/import_intel_snapshot.py --input … --database-url … --mode merge
```

After restore on a newer BRIEFR release, run `alembic upgrade head` when the
manifest `alembic_head_at_export` is behind your checkout.

Full operator steps: [Operations](./operations.md) (Intel snapshot import and
upgrade). Production schema migration: [PostgreSQL](./postgres.md) (revision 036).

---

## INTEL tables (included)

Public intelligence and BRIEFR-computed enrichment — safe in the monthly
open-core snapshot (30 tables in schema `intel` after `036`):

`cves`, `kev_deadlines`, `epss_history`, `cve_change_history`,
`mitre_techniques`, `cve_technique_map`, `atlas_techniques`,
`atlas_case_studies`, `cve_atlas_map`, `cve_exploits`, `feed_cache` (publishable
keys only), `otx_cve_pulses`, `otx_pulse_iocs`, `otx_pulses`,
`detection_rules`, `detection_rule_cves`, `detection_rule_techniques`,
`correlation_actor`, `correlation_temporal`, `correlation_campaigns`,
`correlation_campaign_members`, `correlation_cve_snapshot`, `pulse_families`,
`ioc_degree`, `cve_embeddings`, `embeddings`, `software_catalog`,
`mitre_groups`, `group_technique_map`, `sync_state` (ingest watermarks only).

`feed_cache` and `sync_state` use prefix/key allowlists — see the canonical spec.

---

## Operator tables (excluded)

Never published in the intel bundle (schema `app` after `036`):

- Auth: `users`, `sessions`
- App state: `user_preferences`, `watchlist`, `app_settings`, `ioc_cache`
- Webhooks, audit, hunt packs, correlation suppressions/feedback, API telemetry

Export and CI smoke tests fail closed if operator tables appear in the dump.

---

## Admin UI

**Database → Intel snapshot** shows bundle status and supports merge import
(`POST /api/admin/intel-snapshot/import` with confirm word `import`).

---

## Related

- [ADR-001 — Intel vs app schema split](https://github.com/Soldier0x0/briefr/blob/main/docs/decisions/ADR-001-intel-app-schema-split.md)
- [Architecture decisions](/docs/developer-guide/decisions)
- [PostgreSQL](./postgres.md) — production database and revision 036 runbook
