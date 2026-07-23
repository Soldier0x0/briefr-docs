---
sidebar_position: 63
sidebar_label: Roadmap
description: Where BRIEFR is going, and what is deliberately out of scope.
---

# Roadmap

BRIEFR is an open-source, self-hosted CVE intelligence and
detection-engineering platform. The destination:

> A **self-hosted analyst intelligence pane** — vulnerability and threat
> context (KEV, EPSS, MITRE, IOC) ranked for **your stack**, connected to
> detection engineering and investigation — running entirely on hardware you
> control.

## Current focus

- **Intel depth** — more sources, and better correlation between CVEs, IOCs,
  incidents, and the software you actually run.
- **Detection engineering** — composing detections from intel and exporting
  them into your stack.
- **Search** — hybrid keyword + semantic search across everything BRIEFR
  knows.
- **Operational polish** — smoother self-hosting, upgrades, and backups for
  single-operator deployments.

## Deliberate non-goals

| Not this | Because |
| --- | --- |
| A SIEM or log platform | BRIEFR is an intel / detection-content / investigation pane, not log-scale infrastructure. |
| Multi-tenant SaaS | Single-operator and self-hosted by design; your data stays on your box. |
| A commercial threat-intel subscription | BRIEFR aggregates open sources (NVD, CISA KEV, EPSS, OTX, and more) and makes them usable. |

## Following along

What ships is recorded in the [Release Notes](/docs/release-notes).
Feature requests and bugs:
[GitHub issues](https://github.com/Soldier0x0/briefr/issues).
