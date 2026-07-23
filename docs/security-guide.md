---
sidebar_position: 60
sidebar_label: Security Guide
description: The auth model, secret handling, network exposure, a hardening checklist, and how to report a vulnerability.
---

# Security Guide

BRIEFR is built for security teams, so its own posture is documented, not
implied. Everything below describes shipped behavior; where a claim comes
from a design decision, the ADR is linked.

## Threat model

BRIEFR is a **single-operator, self-hosted** application. The trust
boundary is your box:

- **Trusted:** the host it runs on, the PostgreSQL instance it connects to,
  and the operator account(s) you create.
- **Untrusted:** everything reaching the HTTP port — which is why the app
  is designed to sit behind a reverse proxy, with the API bound to
  loopback (`127.0.0.1:8000`) and Postgres published only on
  `127.0.0.1:5432`.
- **Outbound:** BRIEFR calls the intelligence sources you configure
  ([Integrations](/docs/integrations)) — nothing else. Your triage
  decisions and stack profile never leave the host.

For where auth sits in the request path, see the architecture diagrams in
[How it works](/docs/user-guide/how-it-works).

## Authentication and sessions

Built-in application login (no external IdP required):

- The access token is a short-lived JWT delivered in the `briefr_at`
  cookie — `HttpOnly`, `SameSite=Strict`, lifetime set by
  `JWT_ACCESS_TOKEN_MINUTES`. JavaScript can never read it.
- The refresh token is stored **hashed** in the `sessions` table. With
  "remember me" it persists for `REFRESH_TOKEN_DAYS`; otherwise it's a
  session cookie. **Token reuse revokes every session for that user** —
  a stolen-then-replayed refresh token locks the thief and the victim out
  together, loudly.
- Expired sessions are rejected and purged; each session records user
  agent and IP so you can audit them.
- **Roles:** admin routes and ingest triggers (`POST /api/refresh*`)
  require an `admin`-role session. There is no shared API key — the legacy
  admin-key header was removed.
- `JWT_SECRET` is **required in production**: with `BRIEFR_ENV=production`
  and no secret set, the app refuses to start rather than falling back to
  a generated value.

## Secret handling

Three layers, in precedence order — process env → `app_settings` (DB) →
`.env` ([ADR-006](https://github.com/Soldier0x0/briefr/blob/main/docs/decisions/ADR-006-encrypted-app-settings-secrets.md)):

- Keys saved through the Admin UI are encrypted at rest in Postgres
  (Fernet, stored as `enc:v1:…`) **when `BRIEFR_SETTINGS_KEY` is set**.
  Without that key, secrets go to `.env` only and are never persisted to
  the database. Back the key up off-host — losing it means those rows
  cannot be decrypted.
- Structured logs redact secret-like fields: any `extra` key matching
  `*_KEY / *_TOKEN / *_SECRET / *_PASSWORD` is stored as `[REDACTED]`,
  including in the admin log viewer's ring buffer.
- Backup archives include `.env`, so archives themselves are
  **age-encrypted** (X25519); the encryption key lives outside the backup
  directory by enforcement, and the manifest records the recipient public
  key.
- The admin Security panel shows a **production posture self-check** —
  every unsafe flag in the current config (`RATE_LIMIT_ENABLED=0`,
  `AUTH_COOKIE_SECURE=0`, `WALLBOARD_TOKEN` unset) is logged at startup
  and rendered as an amber callout.

## Network exposure

The reference production topology
([Self-host guide](/docs/admin-guide/self-host)):

```text
Internet → Cloudflare → cloudflared tunnel → nginx :80 → uvicorn 127.0.0.1:8000
```

- The FastAPI process should never face the internet directly; nginx
  serves the static frontend and proxies `/api`.
- TLS terminates at the tunnel/proxy layer; set `AUTH_COOKIE_SECURE=1` so
  cookies are marked `Secure` behind it.
- Token-bucket rate limiting protects `/api/ioc/lookup` and
  `/api/refresh*`; login and refresh endpoints reject expired or reused
  sessions.
- Every response carries `X-Request-ID`, and admin actions are written to
  an `audit_log` table (actor, action, target, timestamp) you can review
  in the admin pane.

## Hardening checklist

In order, before exposing an instance to real users:

1. Set `BRIEFR_ENV=production` and a generated `JWT_SECRET`
   (`openssl rand -hex 32`).
2. Bind uvicorn and Postgres to `127.0.0.1`; expose only nginx (or the
   tunnel).
3. Set `AUTH_COOKIE_SECURE=1` once TLS is in front.
4. Set `BRIEFR_SETTINGS_KEY` if you want Admin-saved keys in the DB —
   and back it up off-host.
5. Leave `RATE_LIMIT_ENABLED` on (the posture check flags it if off).
6. Configure `BACKUP_AGE_KEY_FILE` and keep an off-host copy of the key.
7. After first boot, open Admin → Security and clear every amber posture
   warning.

## Reporting a vulnerability

Privately, via
[GitHub Security Advisories](https://github.com/Soldier0x0/briefr/security/advisories) —
not a public issue. Include reproduction steps and the version/commit you
tested. You'll get a response before any public disclosure is expected.
