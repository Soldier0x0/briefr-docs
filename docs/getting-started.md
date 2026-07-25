---
sidebar_position: 1
sidebar_label: Getting started
description: Linear checklist from first read to running BRIEFR in production.
---

# Getting started

A linear path through this documentation portal. Each step links to an existing
page — follow in order or jump to what you need.

---

## 1. Understand the product

- [How it works](/docs/user-guide/how-it-works) — architecture, auth layers, and data flow
- [Using BRIEFR](/docs/user-guide/using-briefr) — analyst shell tabs (BRIEF, FEED, IOC, Forge)
- [FAQ](/docs/faq) — license, requirements, data ownership, scope

## 2. Deploy BRIEFR (production)

**Installing for real use?** Start here — not the Vite dev server.

- [Self-host BRIEFR](/docs/admin-guide/self-host#3-production-debian--systemd--nginx) — **§3 Production**: Postgres + pgvector, `npm run build`, nginx/systemd (`briefr-install.sh`)
- [PostgreSQL](/docs/admin-guide/postgres) — production database setup and maintenance
- [Operations](/docs/admin-guide/operations) — upgrades, backups, day-2 care

### Local development only (not production)

- [§1 Quick dev (SQLite)](/docs/admin-guide/self-host#1-quick-local-development-sqlite) — evaluate with zero DB setup; `npm run dev` on `:5173`
- [§2 Postgres dev](/docs/admin-guide/self-host#2-local-development-with-postgresql--pgvector) — production-like local stack; still uses `npm run dev`, not a permanent install

## 3. Configure networking & integrations

- [Network requirements](/docs/admin-guide/network-requirements) — topology, nginx ports, firewall guidance
- [Integrations](/docs/integrations) — every upstream source and outbound webhook/wallboard behavior
- [Security Guide](/docs/security-guide) — auth model, secret handling, hardening checklist

## 4. Operator features

- [Wallboard](/docs/admin-guide/wallboard) — read-only kiosk at `/wallboard`
- [Webhooks](/docs/admin-guide/webhooks) — Discord, Telegram, generic destinations and delivery log
- [API Reference](/docs/api-reference) — every endpoint when you need request/response detail

## 5. Stay current

- [Product status](/docs/product-status) — digest of what is true in production today
- [Release notes](/docs/release-notes) — version history
- [Roadmap](/docs/roadmap) — shipped vs planned

## 6. Extend or contribute

- [Developer Guide](/docs/developer-guide) — architecture and conventions
- [System design](/docs/developer-guide/system-design) — data flow and trade-offs
- [Contributor onboarding](/docs/developer-guide/onboarding) — dev environment and first change
- [Contributing](/docs/developer-guide/contributing) — PR guidelines (canonical file on GitHub)
- [Architecture decisions](/docs/developer-guide/decisions) — ADR-001 through ADR-006

## 7. When something breaks

- [Troubleshooting](/docs/user-guide/troubleshooting) — common analyst and operator issues
