---
sidebar_label: Webhooks
sidebar_position: 5
description: Discord, Telegram, and generic webhook destinations — SSRF rules and delivery log.
---

# Webhooks

Push notifications for operator alerts. The engine dispatches events to one or
more **destinations** loaded from env vars and the `webhook_destinations` table.
Env seeds are upserted on startup (`sync_env_destinations_to_db`); per-destination
`enabled` and `event_types` can be overridden via admin API.

---

## Destination kinds

| Kind | Env bootstrap | Config |
| --- | --- | --- |
| **Discord** | `DISCORD_WEBHOOK_URL` | Enable/disable via `DISCORD_WEBHOOK_ENABLED`; event subscriptions via `DISCORD_WEBHOOK_EVENTS` |
| **Telegram** | `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | Enable/disable via `TELEGRAM_WEBHOOK_ENABLED`; event subscriptions via `TELEGRAM_WEBHOOK_EVENTS` |
| **Generic** | `WEBHOOK_GENERIC_URL` | Enable/disable via `WEBHOOK_GENERIC_ENABLED`; event subscriptions via `WEBHOOK_GENERIC_EVENTS` |

Each channel can be independently enabled/disabled and subscribed to event types.

**Database-backed destinations:** `POST /api/admin/webhooks/destinations` creates
additional destinations (`source: db`). `kind` is `discord`, `telegram`, or
`generic`. Cap: 20 destinations per kind. Custom ids must match
`^[a-z0-9-]{3,64}$` and cannot use reserved env ids (`discord`, `telegram`,
`generic`). Config URLs validated with SSRF checks on write.

Env bootstrap ids cannot be deleted (disable via `PATCH`); database-backed
destinations can be deleted with `confirm_text=delete`.

---

## Events

The engine dispatches:

- `kev_alert` — newly flagged KEV CVEs matching `BRIEFR_STACK_TERMS` (deduped
  per CVE)
- `backup_failure` — newest archive older than `2 × BACKUP_INTERVAL_HOURS`
- `health`
- `watchlist_alert` — pinned CVEs enter KEV or show EPSS/PoC changes
- `kev_backlog`
- `ioc_watchlist_hit` — local OTX/ThreatFox mirror matches (deduped per
  user/value/source)

**Dedupe:** `webhook_alert_log` stores one row per `(event_type, target)`;
`webhook_delivery_log` records every delivery attempt (destination, status,
error). Event dedupe is per `(destination_id, event_type, dedupe_key)` for
database-backed destinations.

---

## Admin API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/admin/webhooks/destinations` | Merged env + DB config; `config` is **masked** (URLs/tokens never returned in full) |
| `POST /api/admin/webhooks/destinations` | Create database-backed destination |
| `PATCH /api/admin/webhooks/destinations/{destination_id}` | Update enable flag, subscriptions, label; `config` only for `source: db` |
| `DELETE /api/admin/webhooks/destinations/{destination_id}` | Delete database-backed destinations only |
| `GET /api/admin/webhooks/log` | Dedupe log (`event_type`, `limit`, `offset`) |
| `GET /api/admin/webhooks/delivery-log` | Delivery attempts (`destination_id`, `event_type`, `limit`, `offset`); `error` masked on read |
| `GET /api/admin/webhooks/health` | Per-destination delivery health (24h ok/fail counts, latest attempt); `last_error` masked |
| `POST /api/admin/config/webhook-test` | Test message via SSRF-safe client; works on disabled destinations |

Webhook destination URLs/tokens are env-configured; admin config masks secrets.
`/api/health` exposes webhook delivery keys `webhook.discord` /
`webhook.telegram` / `webhook.generic` after the first alert attempt.

`webhook_delivery_log` rows age out after 30 days (operator retention job).

---

## SSRF protection

Outbound webhook HTTP uses `webhooks/ssrf.py`:

- **HTTPS only**
- DNS resolve + block private/reserved ranges (RFC1918, RFC 6598 CGNAT
  `100.64.0.0/10`, 127.0.0.0/8, ::1, 169.254.0.0/16, 0.0.0.0, unique-local IPv6)
- Connect to resolved IP with original `Host` header (DNS-rebinding safe)
- **No redirect following**
- 10s timeout
- No internal API keys on outbound headers

Failures recorded via `resilient_client` health (`webhook.{destination_id}`).

Do not weaken webhook SSRF checks without an explicit design discussion (see
[Contributing](/docs/developer-guide/contributing)).
