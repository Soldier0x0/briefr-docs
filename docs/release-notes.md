---
sidebar_position: 8
sidebar_label: Release Notes
description: What changed in each release, in plain language.
---

# Release Notes

**Policy:** entries begin with the first public tagged release. Until then,
this single pre-release entry summarizes what the current build does —
sourced from the repo's living
[product status](https://github.com/Soldier0x0/briefr/blob/main/docs/PRODUCT_STATUS.md),
which always wins if the two disagree. Each future release gets a short
entry here: what's new, what changed behavior, and anything an operator
must do before upgrading (migrations are forward-only).

## Pre-release — v1.5.0 (July 2026)

What BRIEFR does today, in one pass:

- **Intel ingest** from 25+ open sources — NVD, CISA KEV, EPSS, MITRE
  ATT&CK/ATLAS, exploit indexes (ExploitDB, Metasploit, Nuclei,
  PoC-in-GitHub), IOC feeds (OTX, ThreatFox, abuse.ch), and pre-NVD CVE
  records (cvelistV5, Vulnrichment) — all on background schedulers with
  per-source health, queueing, and metering.
- **Analyst workflow** built around Operational Priority: every CVE gets a
  P1–P4 priority, a 0–100 threat score with a KEV floor, and an
  environment-relevance tier against *your* stack. Feed, detail drawer,
  IOC lookup, incidents/news with CVE cross-links, and a ⌘K command
  palette.
- **Detection engineering** — generated Sigma rules (ATT&CK-, CWE-, and
  artifact-based), community rule search, SIEM query starters, and a
  detection-backlog view over your stack.
- **Hybrid search** — keyword + semantic (pgvector embeddings) across
  CVEs, techniques, and correlation campaigns, stack-aware.
- **Self-hosted operations** — built-in login with server-side sessions,
  admin console (config, feed health, AI operations, storage explorer,
  audit log), age-encrypted backups with restore, webhooks with delivery
  health, a token-guarded wallboard kiosk, and a production posture
  self-check.
- **PostgreSQL-native** storage; SQLite remains only as the dev/test
  fallback. License: **BSL-1.1** (personal/non-commercial self-host free;
  commercial use requires a one-time license).

Known gaps at this snapshot: no public Docker platform compose yet
(Postgres compose exists), dark theme only.
