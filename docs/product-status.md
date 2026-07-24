---
sidebar_position: 3
sidebar_label: Product status
description: Digest of what is true in production today — canonical source lives in the BRIEFR repo.
---

# Product status

**Digest of** [`docs/PRODUCT_STATUS.md`](https://github.com/Soldier0x0/briefr/blob/04aba1a/docs/PRODUCT_STATUS.md)
**at pin `04aba1a`** (2026-07-21). When this portal and the product repo
disagree, the canonical file wins.

---

## Release snapshot

| Area | Status |
| --- | --- |
| **Release** | **v1.5.0** — V1.5 phases 1–3 + 5 shipped; Phase 4 STIX excluded |
| **License** | **BSL-1.1** — personal/non-commercial free; commercial requires one-time license; Apache-2.0 after four years per version |
| **Database** | **PostgreSQL required** (`DATABASE_URL`, `BRIEFR_REQUIRE_POSTGRES=1`). SQLite removed from production |
| **Auth** | Session cookies; analyst routes require login; admin/refresh require `admin` role. Wallboard token header-only (`X-BRIEFR-Wallboard-Token`) |
| **Rate limits** | Token buckets; `RATE_LIMIT_ENABLED=1` in production. Multi-worker: `BRIEFR_RATE_LIMIT_STORE=db`; API-only: `BRIEFR_SCHEDULER_ENABLED=0` |
| **Theme** | Dark only |

---

## Scoring & analyst workflow

Overview headline: **Operational Priority (P1–P4)** + **Threat Score (0–100)** +
**Environment Relevance** (ADR-002). Backend `scoring/` is sole engine.
CISA KEV floor 80 only; parallel SSVC annotation on `/risk`. v1.1b blend
retained as `legacy_risk_v11b` only.

---

## Performance, detection, LLM

**Track I Phases 1–3 shipped:** ORJSON responses, keyset feed pagination,
drawer bundle, shared rate-limit store, feed windowing, stack relevance sort.
**Detection D1–D5:** CWE templates, `DetectionContext`, Nuclei enrichment,
class router, Detect tab hunt starters. **LLM K1–K4:** multi-provider router,
`ai_operations` recording, empty-payload guard. **Embeddings E1–E8:** nightly
backfill when `EMBEDDINGS_ENABLED=1`.

---

## Admin & operator

V1.4 operator features largely shipped: config schema with apply strategies,
webhook destinations CRUD (20/kind), read-only DB explorer, AI operations page,
notification center (#439), production posture warnings (Sprint A6), support
pack export, corpus drift check. Secret-typed config encrypted in
`app_settings` when `BRIEFR_SETTINGS_KEY` is set (ADR-006).

---

## Wallboard

**v2 shipped (#430):** session-cookie storage, responsive grid, auto-rotation,
stack-aware KEV tile. Token via `X-BRIEFR-Wallboard-Token` or
`WALLBOARD_TOKEN` (#514). Optional `?density=compact`. Top risk ranked by OP
then Threat (W2).

---

## Data, jobs, integrations

**API queue** serializes outbound NVD/OTX calls. **Procrastinate (Q1)** behind
`PROCRASTINATE_ENABLED` (default off). **API metering (Q2):** `api_call_events`,
30d retention. **CPE catalog (Q3)** and **stack backfill (Q4)** opt-in.
**Retention (C3):** `webhook_delivery_log` and `ai_operations` 30d; `audit_log`
365d.

---

## Auth layers

| Layer | What |
| --- | --- |
| **Edge (optional)** | Cloudflare Tunnel + Zero Trust |
| **Application** | Username/password + sessions; production fails closed without `JWT_SECRET` |

---

## Deployment

| Item | Value |
| --- | --- |
| Code | `/opt/briefr` |
| DB | PostgreSQL 16 (often Docker at `/opt/infra/postgres`) |
| Backups | `/var/lib/briefr/backups` (age-encrypted) |
| Backend | `briefr-backend.service` → uvicorn :8000 |
| Frontend | `frontend/dist` via nginx |

---

## Shipped vs planned

| Shipped | Planned / open |
| --- | --- |
| Postgres, auth, correlation v3, Forge, admin ops, webhooks, wallboard v2, AI ops, Track I, security architecture (PM-3/PM-4), detection composer DC-1…DC-4 | Full `docker-compose.yml` (V2.0), STIX export (excluded), MkDocs site |

Details: [`ROADMAP.md`](https://github.com/Soldier0x0/briefr/blob/04aba1a/docs/planning/ROADMAP.md).
