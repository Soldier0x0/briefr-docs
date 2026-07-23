---
sidebar_label: API overview
sidebar_position: 4
description: Grouped index into the BRIEFR REST API — auth, feed, admin, wallboard, and webhooks.
---

# API overview

The full endpoint reference lives in [API Reference](./api-reference.md). Use
this page to jump to the section you need.

| Section | What it covers |
| --- | --- |
| [Authentication](./api-reference.md#authentication) | Setup, login, logout, refresh, session cookies |
| [CVE Feed](./api-reference.md#cve-feed) | Paginated feed, filters, search |
| [Watchlist](./api-reference.md#watchlist-pin--snooze) | Pin, snooze, analyst triage state |
| [User stack](./api-reference.md#user-stack-per-user-preferences) | Per-user product/vendor preferences |
| [CVE Detail & Enrichment](./api-reference.md#cve-detail--enrichment) | Drawer bundle, enrichment payloads |
| [IOC Lookup](./api-reference.md#ioc-lookup) | Hash/domain/IP lookup |
| [ATLAS & Case Studies](./api-reference.md#atlas--case-studies) | ATLAS technique and case study data |
| [Risk & Correlation](./api-reference.md#risk--correlation) | Scoring, correlation, campaigns |
| [Detection](./api-reference.md#detection) | Detection context and rules |
| [Forge](./api-reference.md#forge-v13-mvp) | Detection engineering workspace |
| [Scheduler & Admin](./api-reference.md#scheduler--admin) | Refresh triggers, ingest controls |
| [Admin Dashboard](./api-reference.md#admin-dashboard--apiadmin) | Operator routes under `/api/admin/*` |
| [Wallboard](./api-reference.md#wallboard-read-only-kiosk--v14-theme-4) | Read-only kiosk at `/api/wallboard` |
| [Health & Stats](./api-reference.md#health--stats) | Liveness, readiness, metrics |

**Interactive docs** (non-production only): `GET /api/docs`, `GET /api/redoc`,
`GET /api/openapi.json` — disabled when `BRIEFR_ENV=production`.

For operator webhook and wallboard setup, see
[Webhooks](./admin-guide/webhooks.md) and
[Wallboard](./admin-guide/wallboard.md).
