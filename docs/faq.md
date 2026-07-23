---
sidebar_position: 9
sidebar_label: FAQ
description: Short answers on licensing, requirements, data ownership, and scope.
---

# FAQ

### What is BRIEFR, in one sentence?

A self-hosted CVE intelligence and detection-engineering platform: it tracks
the vulnerabilities that matter to your stack, enriches them into decisions,
and helps you ship detections.

### What's the license?

**Business Source License 1.1 (BSL-1.1).** You may read, copy, modify, and
self-host BRIEFR **free of charge for personal, non-commercial use**. Use by
or on behalf of a **for-profit organization** requires a **one-time commercial
license** from the Licensor — contact
[harsha@projectjupiter.in](mailto:harsha@projectjupiter.in).

Each published version **automatically converts to Apache License 2.0** four
years after it is first published. BSL is source-available but **not**
OSI-approved open source. Full terms:
[`LICENSE`](https://github.com/Soldier0x0/briefr/blob/main/LICENSE) in the
product repo.

### What do I need to run it?

A box you control with Docker (or Python 3 + Node directly), and PostgreSQL
for production. See [Self-host BRIEFR](/docs/admin-guide/self-host) for the
full walkthrough.

### Can I use SQLite instead of PostgreSQL?

Only for local development and tests. Production is PostgreSQL-only — the
SQL layer is Postgres-native, and SQLite survives purely as the zero-config
dev/test fallback.

### Where does my data live?

On your hardware, in your database. BRIEFR is self-hosted by design; nothing
about your stack or your triage decisions leaves your box. Outbound traffic
is limited to the intelligence sources you configure.

### Does it need internet access?

Yes, for syncing CVE feeds and enrichment providers. The sync jobs run on a
scheduler in the background — the UI itself doesn't block on upstream
services.

### How do I report a security issue?

Privately, via
[GitHub Security Advisories](https://github.com/Soldier0x0/briefr/security/advisories) —
not a public issue. See the [Security Guide](/docs/security-guide).

### Something's broken — where do I start?

[Troubleshooting](/docs/user-guide/troubleshooting) is organized
symptom-first; you don't need to read anything else before it.
