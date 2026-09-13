---
sidebar_position: 0
description: Install, run, and keep BRIEFR healthy in production — self-hosting, PostgreSQL, backups, and upgrades.
---

# Administrator Guide

For operators running BRIEFR on their own hardware. Production requires
PostgreSQL; SQLite exists only as a zero-config dev/test fallback.

<iframe class="archify-frame" src="/diagrams/production-architecture.html?theme=dark&present=1&embed=1" title="BRIEFR production architecture" height="560" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin"></iframe>
<noscript><img src="/diagrams/production-architecture.svg" alt="BRIEFR production architecture" /></noscript>


| Chapter | What it covers |
| --- | --- |
| [Self-host BRIEFR](./self-host.md) | One guide for installing and running BRIEFR on your server. |
| [Operations](./operations.md) | Deploy compatibility, upgrades, backups, and day-2 care. |
| [PostgreSQL](./postgres.md) | The production database: setup, connection, and maintenance. |
| [Wallboard](./wallboard.md) | Read-only kiosk at `/wallboard` — token, API, and setup. |
| [Webhooks](./webhooks.md) | Discord, Telegram, generic destinations, delivery log, SSRF rules. |
| [Network requirements](./network-requirements.md) | Topology, nginx ports, outbound connectivity. |
| [Intel snapshot](./intel-snapshot.md) | Public intel bundle export/import — operator vs INTEL tables. |
