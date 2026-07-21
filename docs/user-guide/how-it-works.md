---
sidebar_label: How it works
sidebar_position: 2
---

# How BRIEFR works

**Optional** — read this if you want the “why” behind the product. Skip if you only want to use or deploy it.

---

## Architecture

![Production architecture](assets/production-architecture.svg)

> **Asset:** [`assets/production-architecture.svg`](assets/production-architecture.svg) · [IMAGE_BRIEFS §1](https://github.com/Soldier0x0/briefr/blob/main/docs/IMAGE_BRIEFS.md#1-production-architecture)

**Flow:** Browser → (optional Cloudflare/nginx) → FastAPI → PostgreSQL. Schedulers pull external intel **into the DB**; the UI reads precomputed data.

**Auth:** Two independent layers — optional Cloudflare at the edge + built-in app login.

![Auth layers](assets/auth-layers.svg)

> **Asset:** [`assets/auth-layers.svg`](assets/auth-layers.svg) · [IMAGE_BRIEFS §8](https://github.com/Soldier0x0/briefr/blob/main/docs/IMAGE_BRIEFS.md#8-auth-layers)

---

## Ingest

![Ingest pipeline — pending](assets/placeholder-diagram.svg)

> **Add:** `assets/ingest-pipeline.png` · [IMAGE_BRIEFS §6](https://github.com/Soldier0x0/briefr/blob/main/docs/IMAGE_BRIEFS.md#6-ingest-pipeline)

NVD, KEV, EPSS, OTX, MITRE, and others run on **schedulers** — not on every page load. API queue protects outbound quotas.

---

## Correlation

![Correlation pipeline](assets/correlation-pipeline.svg)

> **Asset:** [`assets/correlation-pipeline.svg`](assets/correlation-pipeline.svg) · [IMAGE_BRIEFS §5](https://github.com/Soldier0x0/briefr/blob/main/docs/IMAGE_BRIEFS.md#5-correlation-pipeline)

Four explainable lanes: **Campaigns**, **Infrastructure**, **Actor/sector**, **Temporal**. No black-box ML score. Drawer open does **not** call OTX live.

---

## Rate limits

Inbound token buckets on IOC, refresh, admin, login. Set `RATE_LIMIT_ENABLED=1` in production.

> **Add:** `assets/rate-limits-and-queue.png` · [IMAGE_BRIEFS §9](https://github.com/Soldier0x0/briefr/blob/main/docs/IMAGE_BRIEFS.md#9-rate-limits-and-queue)

---

## Deeper reference (developers)

| Doc | When |
|-----|------|
| [`ONBOARDING.md`](../developer-guide/onboarding.md) | Contributing code |
| [`archive/snapshots/CODEBASE_CONTEXT.md`](https://github.com/Soldier0x0/briefr/blob/main/docs/archive/snapshots/CODEBASE_CONTEXT.md) | AI / dense module map |
| [`API_REFERENCE.md`](../api-reference.md) | Every endpoint |
| [`SYSTEM_DESIGN.md`](../developer-guide/system-design.md) | Full architecture essay |
| [How BRIEFR Works — and Why](/docs/how-briefr-works) | Learning tracks: intel lifecycle + how it's built |

Historical plans: [`archive/`](https://github.com/Soldier0x0/briefr/tree/main/docs/archive/)
