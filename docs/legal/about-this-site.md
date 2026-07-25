---
sidebar_position: 1
sidebar_label: About this site
title: About this documentation
description: How the BRIEFR docs portal is organized — official product reference vs author learning notes.
---

# About this documentation

This site (`docs.projectjupiter.in`) is the **official documentation portal**
for [BRIEFR](https://github.com/Soldier0x0/briefr) — a self-hosted CVE
intelligence and detection-engineering platform. It is maintained alongside the
open-source repository and is the canonical place to read install guides, API
reference, operations runbooks, and troubleshooting.

It is **not** a training provider, certification body, or professional advisory
service.

## Two kinds of content

| Kind | Examples | What it is |
|------|----------|------------|
| **Product reference** | User Guide, Administrator Guide, API Reference, Security Guide, Troubleshooting, Product status | Authoritative documentation for installing, operating, and extending BRIEFR. When this portal disagrees with an older planning doc, prefer [Product status](/docs/product-status) and the reference guides — they track what is true in production. |
| **Learning notes** | [Pathways](/docs/pathways), [How BRIEFR Works](/docs/how-briefr-works), [System Design study path](/docs/how-briefr-works/system-design/) | Structured study material written while learning the product and similar architectures. Shared so others can follow the same map of the codebase — **not** an accredited curriculum, certification prep, or vendor-neutral course. |

Deploying BRIEFR on your own hardware is **recommended** while you read, but never
required to use the learning sections.

## What this is not

- **Not professional security advice.** Intelligence, scoring, and detection
  guidance here and in the product are for research and operational triage —
  not a substitute for qualified counsel, formal training, or your
  organization's policies.
- **Not a vetted course.** No certificate, continuing-education credit, or
  employer endorsement is implied. External links in gap units point to
  third-party resources under their own terms.
- **Not live product access.** This portal does not collect API keys and does
  not call third-party enrichment services on your behalf. Running BRIEFR
  itself is separate — see [Self-host BRIEFR](/docs/admin-guide/self-host).

## Hosted BRIEFR vs this docs site

| Property | URL | Privacy / terms |
|----------|-----|-----------------|
| **Documentation portal** (this site) | `https://docs.projectjupiter.in` | [Privacy Policy](/docs/legal/privacy-policy) · [Terms of Use](/docs/legal/terms-of-use) on this site |
| **Hosted BRIEFR instance** (the application) | `https://projectjupiter.in` (when sign-in is enabled) | In-app [Privacy Policy](https://projectjupiter.in/privacy) · [Terms of Use](https://projectjupiter.in/terms) |
| **Self-hosted BRIEFR** | Your operator's hostname | Your operator is responsible for that instance; the in-app legal pages describe the hosted demo only |

## Accuracy and updates

Reference pages are synced from the `briefr` repository where noted in
[CONTRIBUTING](https://github.com/Soldier0x0/briefr-docs/blob/main/README.md).
Learning chapters are portal-native and may use pedagogical framing ("study
path", "unit") that does not appear in the product UI.

If you find an error, open an issue or PR on
[briefr-docs](https://github.com/Soldier0x0/briefr-docs) for portal content, or
[briefr](https://github.com/Soldier0x0/briefr) for product behavior.

## Contact

Documentation questions and grievances: Sai Harsha Vardhan —
[harsha@projectjupiter.in](mailto:harsha@projectjupiter.in).
