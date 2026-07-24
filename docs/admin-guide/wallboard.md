---
sidebar_label: Wallboard
sidebar_position: 4
description: Read-only kiosk at /wallboard — token auth, polling, and nginx setup.
---

# Wallboard kiosk

Read-only TV / SOC display at `/wallboard`. Aggregated intel posture for kiosk
viewers — no admin data or secrets in the response.

---

## API

### `GET /api/wallboard`

Aggregated intel posture payload for the `/wallboard` kiosk view. Built from
existing DB state and cached snapshots (`feed_cache` key `wallboard:snapshot`,
~45s TTL). No outbound HTTP on the request path; no admin data or secrets in
the response.

**Auth:** when `WALLBOARD_TOKEN` is set, require header
`X-BRIEFR-Wallboard-Token` (read-only scope; the `?token=` query param was
removed in Sprint A7 — query strings leak into access logs). When unset, the
endpoint is open (optional gate — read-only kiosk data only).

**Rate limit:** token bucket (`rate_limit_wallboard`) — default
`RATE_LIMIT_WALLBOARD_PER_MINUTE=60` per client IP; 429 + `Retry-After` over
the limit.

**Response tiles include:** `meta`, `kev_on_stack`, `changes_24h`, `top_risk`,
`ingest_health`, `coverage_gaps`, and `headlines`. The `meta.cached` field
indicates whether the payload came from the snapshot cache.

**`top_risk` ranking (W2):** items are ordered by Operational Priority band
(P1 first), then Threat score descending — **not** by legacy v1.1b blend total.
Fields: `threat_score` (ADR-002 Threat 0–100), `op_band` (`P1`–`P4`, wallboard
uses UNKNOWN environment / no profile), `risk_score` (**alias of
`threat_score`** for backward-compatible kiosk clients — no longer the v1.1b
total).

---

## Configuration

`WALLBOARD_TOKEN` is exposed in the admin config schema under section
`security` (kiosk gate — `restart` apply strategy). Save or rotate via Admin →
API keys & config, or set in `.env`. Use `POST /api/admin/config/apply-all` for
keys that require a backend restart (including `WALLBOARD_TOKEN`).

`RATE_LIMIT_WALLBOARD_PER_MINUTE` is under section `app` (kiosk polling limit —
`restart` apply strategy).

When `BRIEFR_ENV=production`, an unset `WALLBOARD_TOKEN` is listed in
`posture_warnings` (startup logs one warning per unsafe flag; Admin → Security
shows the same list).

---

## Product status (shipped)

**v2 shipped (#430):** session-cookie token storage, responsive tile grid,
auto-rotation, stack-aware KEV tile, mono terminal styling. Token via
`X-BRIEFR-Wallboard-Token` header or admin config `WALLBOARD_TOKEN` (#514 —
Security / kiosk section on API keys & config). Optional `?density=compact` URL
mode for denser 4K kiosk layouts.

---

## Kiosk setup

**Do not** bookmark URLs with tokens.

1. Set `WALLBOARD_TOKEN` under Admin → API keys & config (or `.env`).
2. On the display, open `/wallboard` once and enter the token — the app stores a
   signed **httpOnly** session cookie (`briefr_wb`). Prefer header
   `X-BRIEFR-Wallboard-Token` only for scripted probes.
3. Use a **dedicated browser profile** (kiosk mode). Do not log into admin on
   the same profile — wallboard token is read-only but admin cookies would not
   be.
4. If the display is shared or public, rotate `WALLBOARD_TOKEN` after use and add
   Cloudflare Access / VPN on the hostname.
5. Optional: set user stack in the main app — wallboard KEV-on-stack tile reads
   it. `BRIEFR_STACK_TERMS` in admin config overrides the saved user stack for
   KEV-on-stack webhooks and the wallboard tile; when unset, the backend uses
   the most recently updated non-empty `user_preferences.stack_terms` row.
6. Optional: append `?density=compact` for a denser tile layout on large displays
   (4K wall mounts).

The frontend `/wallboard` route is chromeless — 3×2 grid, 90s poll, rotating tile
focus, scrolling ticker. No admin routes, secrets, or write actions exposed.
