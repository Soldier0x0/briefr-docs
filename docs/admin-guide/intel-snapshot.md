---
sidebar_label: Intel snapshot
sidebar_position: 7
description: Public intel bundle format — which tables export, verify, and import without operator secrets.
---

# Intel snapshot

**Digest of** [`docs/DATA_SNAPSHOT.md`](https://github.com/Soldier0x0/briefr/blob/04aba1a/docs/DATA_SNAPSHOT.md)
**at pin `04aba1a`**. When this page and the product repo disagree, GitHub wins.

BRIEFR can export a **public intel bundle** — PostgreSQL tables and
`sync_state` keys safe to publish — separate from operator-only production data
(users, sessions, secrets, delivery logs).

---

## Bundle format (v1)

| Field | Value |
| --- | --- |
| Container | `briefr-intel-YYYY-MM.pgdump.gz` |
| Sidecar | `briefr-intel-YYYY-MM.manifest.json` |
| `format_version` | **1** |
| `bundle_kind` | `briefr-intel` |
| Operator rows | **Zero** — export script enforces row-count guards |

Verify before import:

```bash
python scripts/verify_intel_snapshot.py briefr-intel-YYYY-MM.pgdump.gz
```

Import into a greenfield database:

```bash
python scripts/import_intel_snapshot.py --input … --database-url …
```

After restore on a newer BRIEFR release, run `alembic upgrade head` when the
manifest `alembic_head_at_export` is behind your checkout.

Full operator steps: [Operations](./operations.md) (Intel snapshot import and
upgrade).

---

## INTEL tables (included)

Public intelligence and BRIEFR-computed enrichment — safe in the monthly
open-core snapshot:

`cves`, `kev_deadlines`, `epss_history`, `cve_change_history`,
`mitre_techniques`, `cve_technique_map`, `atlas_techniques`,
`atlas_case_studies`, `cve_atlas_map`, `cve_exploits`, `feed_cache`,
`otx_cve_pulses`, `otx_pulse_iocs`, `otx_pulses`, `correlation_actor`,
`correlation_temporal`, `correlation_campaigns`, `correlation_campaign_members`,
`cve_embeddings`, `mitre_groups`, `group_technique_map`.

A filtered subset of `sync_state` keys (scheduler cursors, feed health) is
included; see the canonical spec for the allowlist.

---

## Operator tables (excluded)

Never published in the intel bundle:

- Auth: `users`, `sessions`
- App state: `user_preferences`, `watchlist`, `notifications`, webhook configs
- Secrets and delivery logs

Export and CI smoke tests fail closed if operator tables appear in the dump.

---

## Related

- [ADR-001 — Intel vs app schema split](https://github.com/Soldier0x0/briefr/blob/04aba1a/docs/decisions/ADR-001-intel-app-schema-split.md)
- [Architecture decisions](/docs/developer-guide/decisions)
- [PostgreSQL](./postgres.md) — production database setup
