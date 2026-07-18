---
sidebar_position: 4
sidebar_label: Security Guide
description: Hardening, the auth model, secret handling, and how to report a vulnerability.
---

# Security Guide

:::note[Draft]
This guide is being assembled. The outline below is the commitment; sections
land as they're written. Until then, the
[Administrator Guide](/docs/admin-guide) covers deployment-time hardening.
:::

BRIEFR is built for security teams, so its own security posture is
documented, not implied. This guide will cover:

## Planned sections

- **Threat model** — what BRIEFR trusts, what it doesn't, and where the
  boundaries sit for a self-hosted deployment.
- **Authentication and sessions** — the auth model, session lifetime, and
  operator account practices.
- **Secret handling** — how API keys and credentials are stored (encrypted
  app settings), what gets redacted from logs, and what never leaves the box.
- **Network exposure** — recommended reverse-proxy setup, TLS, and which
  ports should never face the internet.
- **Hardening checklist** — a short, ordered list to run through before
  exposing an instance to real users.
- **Reporting a vulnerability** — how to reach the maintainer privately.
  Until this section lands, use
  [GitHub Security Advisories](https://github.com/Soldier0x0/briefr/security/advisories)
  rather than a public issue.
