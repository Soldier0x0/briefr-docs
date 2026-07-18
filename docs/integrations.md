---
sidebar_position: 6
sidebar_label: Integrations
description: Feeds in, alerts out — the sources BRIEFR pulls from and the systems it pushes to.
---

# Integrations

:::note[Draft]
This page is being assembled. The shape below is the commitment; details
land as they're written.
:::

BRIEFR sits between upstream intelligence sources and your downstream
tooling. This page will document both directions:

## Feeds in (planned)

- **CVE and vulnerability sources** — what BRIEFR syncs, how often, and
  which API keys each source needs.
- **Enrichment providers** — the services used to turn a bare CVE into a
  decision, and what happens when a provider is down or rate-limited.

## Alerts out (planned)

- **Notification channels** — where BRIEFR can push what it finds.
- **Detection engineering** — exporting detections into your stack.

## Configuration

Provider keys are managed in the admin UI (encrypted at rest — see the
[Security Guide](/docs/security-guide)). Key health and quota state are
visible in the admin dashboard.
