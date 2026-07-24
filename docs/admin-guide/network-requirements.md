---
sidebar_label: Network requirements
sidebar_position: 6
description: Inbound nginx ports, outbound feed connectivity, and firewall guidance.
---

# Network requirements

How BRIEFR is exposed in production and which ports must be reachable.

---

## Production reference topology

```text
Internet  →  Cloudflare  →  cloudflared-briefr  →  nginx :80  →  uvicorn :8000
LAN       →  nginx :80  →  uvicorn (prefer 127.0.0.1:8000)

systemd:
  briefr-backend.service  (APScheduler `scheduled_backup` inside this unit)
  cloudflared-briefr.service

Paths:
  Code:     /opt/briefr
  Database: PostgreSQL via DATABASE_URL
            (production: Docker Postgres 16 at /opt/infra/postgres, host 127.0.0.1:5432)
  Backups:  /var/lib/briefr/backups
  Secrets:  /opt/briefr/backend/.env
```

---

## Shipped nginx (`deploy/nginx-briefr.conf`)

| Listener | Purpose |
| --- | --- |
| **80** | HTTP — redirects all traffic to HTTPS (`return 301 https://$host$request_uri`) |
| **443** | TLS — serves `frontend/dist` SPA and proxies `/api/` to `http://127.0.0.1:8000` |

The API proxy block sets `proxy_read_timeout` and `proxy_send_timeout` to 60s.
`client_max_body_size` is 1m. A shortcut `location = /health` proxies to
`/api/health/live` for uptime monitors.

nginx `access_log` is off in the shipped config — no request log (and no client
IP) is written at the nginx layer.

**Backend bind:** uvicorn on **127.0.0.1:8000** — not exposed publicly. The
shipped nginx config notes that firewall rules handle blocking direct access to
the uvicorn port.

**Database:** PostgreSQL at host **127.0.0.1:5432** (typical Docker Postgres
layout at `/opt/infra/postgres`).

---

## UFW / network hardening (operator)

Recommended end state (documented, not enforced by app):

| Port | Purpose |
| --- | --- |
| 80 | nginx (LAN + cloudflared origin) |
| 22 | SSH (LAN only if possible) |
| — | No public 8000; uvicorn on 127.0.0.1 |

**cloudflared** requires **outbound HTTPS only** (no inbound ports opened on the
host for tunnel mode).

---

## Outbound connectivity

BRIEFR calls upstream intelligence sources and webhook receivers on the
scheduler and alert paths — not on analyst UI request paths for wallboard
snapshots.

For every outbound source (NVD, KEV, EPSS, optional enrichment APIs, LLM
providers, Discord/Telegram/generic webhooks), see
[Integrations](/docs/integrations) — keys, quotas, and failure behavior.
