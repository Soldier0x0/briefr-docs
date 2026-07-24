---
sidebar_position: 62
sidebar_label: Integrations
description: Every source BRIEFR pulls from — keys, quotas, failure behavior — and what it pushes out.
---

# Integrations

BRIEFR sits between upstream intelligence sources and your downstream
tooling. Everything below runs on the **scheduler**, never on the request
path — a rate-limited or dead upstream degrades a sync job, not the UI.

Provider keys are entered in the Admin UI and encrypted at rest when
`BRIEFR_SETTINGS_KEY` is set (see the
[Security Guide](/docs/security-guide#secret-handling)); plain `.env`
works too. Key health and quota state are visible on the admin dashboard.

**No key, no problem:** most sources below work without any key. Keys
unlock rate-limit headroom (NVD, GitHub) or optional enrichment depth
(VirusTotal, OTX, GreyNoise…). Every source fails soft — the failure
column is the shipped behavior, from the system design's dependency map.

## Feeds in

For a deeper look at how each source is ingested, normalized, and validated,
see [Sources](/docs/how-briefr-works/intel-lifecycle/sources) in the
How BRIEFR Works section.

### Vulnerability core

| Source | Adds | Key | Free tier | On failure |
| --- | --- | --- | --- | --- |
| NVD | CVE records, CVSS, CPE | `NVD_API_KEY` (optional) | 50 req/30s with key | Sync aborts; logs error |
| CISA KEV | Known-exploited catalog | — | Unrestricted | Returns empty batch |
| EPSS | Exploit-prediction scores | — | Unrestricted | Returns empty batch |
| CISA Vulnrichment | ADP CVSS/CWE/CPE gap-fill | `GITHUB_TOKEN` (optional) | 60/hr anonymous | Skips run |
| cvelistV5 | CVE JSON 5.x pre-NVD records | `GITHUB_TOKEN` (optional) | 60/hr anonymous | Watermark retained, retried |
| OSV.dev | Package affected-version ranges | — | Unrestricted | Empty batch |
| CIRCL | Extra references, CAPEC | `CIRCL_API_KEY` (optional) | Rate-limited; 7d hit + 24h miss cache | No merge |

### Exploit intelligence

| Source | Adds | Key | Free tier | On failure |
| --- | --- | --- | --- | --- |
| VulnCheck KEV | Exploited-in-the-wild tier | `VULNCHECK_API_KEY` | Key required | Job no-op; flags unchanged |
| PoC-in-GitHub | GitHub PoC index | `GITHUB_TOKEN` (optional) | GitHub API limits | Skip; prior rows retained |
| ExploitDB | Public exploit CSV | — | Unrestricted | Skip; prior snapshot retained |
| Metasploit | MSF exploit modules | — | Unrestricted | Skip; prior snapshot retained |
| Nuclei | CVE template index | — | Unrestricted | Skip; prior snapshot retained |
| Sploitus | On-demand exploit lookups | — | Unpublished | Empty result |

### Threat & IOC

| Source | Adds | Key | Free tier | On failure |
| --- | --- | --- | --- | --- |
| AlienVault OTX | Pulses, IOCs | `OTX_API_KEY` | 10k/month | Nightly job skipped if unset |
| VirusTotal | IP/hash/domain reputation | `VIRUSTOTAL_API_KEY` | 500/day | Empty VT fields |
| AbuseIPDB | IP abuse score | `ABUSEIPDB_API_KEY` | 1000/day | Skipped without key |
| GreyNoise | IP classification | `GREYNOISE_API_KEY` | 50/week | Unknown-record fallback |
| ThreatFox | IOC mirror for retro-match | `ABUSECH_AUTH_KEY` | Fair use | Skip sync; prior rows retained |
| MalwareBazaar | Hash metadata | `ABUSECH_AUTH_KEY` | Fair use | Empty result |
| URLhaus | Domain malware URLs | `ABUSECH_AUTH_KEY` | Fair use | Empty result |

### Frameworks & context

| Source | Adds | Key | Free tier | On failure |
| --- | --- | --- | --- | --- |
| MITRE ATT&CK (STIX) | Techniques, groups, CVE maps | — | Unrestricted | Weekly job fails; logs |
| MITRE ATLAS | AI/ML techniques, case studies | `ATLAS_YAML_URL` | Unrestricted | Weekly job fails; logs |
| Security news (RSS ×5) | Incident/news cards | — | Per-feed | Per-source error recorded |
| GitHub rule search | Sigma/Elastic detection rules | `GITHUB_TOKEN` (optional) | 60/hr anonymous | Empty rule list |

### AI providers (optional)

| Source | Adds | Key | On failure |
| --- | --- | --- | --- |
| Groq (`llama-3.1-8b-instant`) | Executive summaries, product extraction | `GROQ_API_KEY` | Falls back to Anthropic, then template |
| Anthropic | Executive summaries | `ANTHROPIC_API_KEY` | Falls back to template |

AI is strictly additive: with no AI key configured, summaries render from
templates and nothing else degrades.

## Alerts out

- **Webhooks** — outbound notifications for new intel, with per-webhook
  secrets and a delivery log (purged on a ~90-day TTL). Configured in the
  admin pane; endpoints in the [API Reference](/docs/api-reference).
- **Wallboard** — a read-only kiosk view (`/wallboard`) guarded by
  `WALLBOARD_TOKEN`, built from cached snapshots so it never triggers
  outbound calls.

## Source of truth

This page mirrors the External Dependencies Map in
[System design](/docs/developer-guide/system-design) — if the two ever
disagree, that table (generated alongside the code) wins, and this page
has a bug worth reporting.
