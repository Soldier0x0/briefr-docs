# Task 9 Report — Webhooks and Operations

## Status

**COMPLETE.**

## Commit

```
a2f723f  feat(learn): write Webhooks and operations chapter (how it's built)
```

Branch: `cursor/how-briefr-works-audit-phase3-impl-cc35`  
File modified: `docs/how-briefr-works/how-its-built/webhooks-ops.mdx`

## Build

`npm run build` — exit code 0. No broken links, no type errors.

## What was written

Full 7-section chapter (plus TryItYourself) at sidebar position 8, covering:

### 1 — What it is
Explains the two concerns: outbound push notifications (webhook engine) and the
self-monitoring operational layer (backups, API key health, log buffer,
notifications center). Describes what events can be sent and what channel kinds
are supported.

### 2 — Why we do it
Makes the case for push notifications over polling: background jobs produce
signals that need a push path, and a self-hosted platform that fails quietly is
less useful than no tool at all.

### 3 — Where it lives in BRIEFR
Code map with verified file paths:
`webhooks/engine.py`, `webhooks/destinations.py`, `webhooks/ssrf.py`,
`webhooks/alerts.py`, `webhooks/sender.py`, `backup/manager.py`,
`monitoring/api_key_health.py`, `monitoring/notifications.py`.
InTheCode component renders links to each file.

### 4 — How it works
Five sub-sections:

**Destinations and configuration** — env-seeded vs DB-override merge, three
channel kinds, per-destination event type filtering, `sync_env_destinations_to_db`.

**Dispatch flow** — `dispatch_event` step-by-step including the claim-before-send
deduplication pattern (IDEM-001), delivery loop, delivery log write, and
failure notification emission.

**Per-channel formatting** — Discord 2 000 char limit, Telegram 4 096 char
limit, generic JSON payload shape. All sourced from `engine.py`.

**SSRF protection** — HTTPS-only requirement, blocked network ranges
(sourced from `ssrf.py`'s `BLOCKED_NETWORKS` tuple), IP pinning with SNI
preservation, redirect blocking, header sanitization with the explicit
`FORBIDDEN_OUTBOUND_HEADERS` set.

**Retries and rate limiting** — `WEBHOOK_RETRIES=2`, 1.5 s exponential
backoff, 5xx-only retries, 429 handling. All values from `ssrf.py`.

**Alert rules** — four scheduler-triggered rules sourced from `alerts.py`:
KEV-on-stack (`kev_alert`), KEV backlog gaps (`kev_backlog`), watchlist
EPSS/PoC/KEV changes (`watchlist_alert`), IOC watchlist hits
(`ioc_watchlist_hit`), backup dead-man (`backup_failure`). Dedupe keys
described precisely.

**Backup system** — archive contents (SQLite vs PostgreSQL manifest version
numbers), age encryption mechanics (X25519 via pyrage, key outside BACKUP_DIR
enforced), scheduling + retention, auto-restore on startup.

**API key health monitoring** — ten providers listed (NVD, Groq, Gemini,
Cerebras, OpenRouter, VirusTotal, GitHub, OTX, GreyNoise, AbuseIPDB);
`ignore_circuit=True` / `record_circuit=False` design rationale; digit-
normalization dedupe for error text.

**Operator notifications center** — three aggregated streams (audit log,
job errors, API key failures), masked targets via `redact`.

**Application log buffer** — 500-line ring buffer, category derivation,
secret redaction.

### 5 — What it needs
Tables for webhook env vars, backup env vars, and operational surfaces to
watch. All env var names and defaults sourced directly from `destinations.py`
and `backup/manager.py`.

### 6 — How industry does it — and why BRIEFR does it this way
AtEnterpriseScale component contrasting external alerting (PagerDuty/OpsGenie),
managed backup services, and metrics stacks against BRIEFR's inlined approach.
Honest about trade-offs: no time-window deduplication, no managed off-site
storage, no escalation policies.

### 7 — Try it yourself
TryItYourself with four steps and a redacted JSON example for API key health.
No invented API shapes — the field names match `monitoring/api_key_health.py`
exactly.

## Sourcing and accuracy

Every claim in the chapter was traced to a source file before writing:

| Claim | Source |
|---|---|
| Event type names and count (6) | `webhooks/destinations.py` ALL_EVENT_TYPES |
| Legacy aliases | `destinations.py` LEGACY_EVENT_ALIASES |
| DISCORD_MAX_CONTENT = 2000 | `engine.py` constant |
| TELEGRAM_MAX_TEXT = 4096 | `engine.py` constant |
| TELEGRAM_API URL | `engine.py` constant |
| WEBHOOK_RETRIES = 2 | `engine.py` and `ssrf.py` constants |
| RETRY_BACKOFF_SECONDS = 1.5 | `ssrf.py` constant |
| RETRYABLE_STATUS = {500, 502, 503, 504} | `ssrf.py` constant |
| WEBHOOK_TIMEOUT = 10.0 | `ssrf.py` constant |
| Blocked networks list | `ssrf.py` BLOCKED_NETWORKS tuple |
| FORBIDDEN_OUTBOUND_HEADERS set | `ssrf.py` frozenset |
| IP-pinning + SNI hostname comment | `ssrf.py` inline comment block |
| Redirect blocking | `ssrf.py` _get_webhook_client() follow_redirects=False |
| Dead-man threshold formula 2× | `alerts.py` get_backup_deadman_threshold() |
| BACKUP_DEADMAN_TARGET = "stale" | `alerts.py` constant |
| WATCHLIST_EPSS_MIN_DELTA = 0.05 | `alerts.py` constant |
| DEFAULT_AGE_KEY_FILE | `backup/manager.py` constant |
| SQLite manifest version 1 | `backup/manager.py` _write_manifest |
| PostgreSQL manifest version 2 | `backup/manager.py` _write_manifest_postgres |
| BACKUP_INTERVAL_HOURS default 6 | `backup/manager.py` BackupConfig.from_env |
| BACKUP_RETENTION_COUNT default 100 | `backup/manager.py` BackupConfig |
| log ring buffer 500 lines | `admin-guide/operations.md` |
| 10 providers in api_key_health | `monitoring/api_key_health.py` PROVIDER_CHECKS |
| ignore_circuit/record_circuit flags | `monitoring/api_key_health.py` _ping_json() |
| Digit normalization for dedupe | `monitoring/api_key_health.py` _normalize_for_dedupe |
| Three notification streams | `monitoring/notifications.py` build_operator_notifications |

## Tests

There is no test suite for the documentation portal. The primary quality gate
is `npm run build` (Docusaurus production build with `onBrokenLinks: 'throw'`),
which passed.

## Concerns

None. All claims are grounded in the vendor source. No SSRF claims were
invented beyond what is documented in `ssrf.py`. No ops claims reference paths
or services that do not exist in the codebase or the `admin-guide/operations.md`
reference.

---

## Task 9 corrections (audit findings)

**Status:** COMPLETE.

### Commit

```
fix(learn): correct webhooks ops chapter SSRF and retention claims
```

### Build

`npm run build` — exit code 0. No broken links, no type errors.

### Fixes applied (verified against `/workspace/.vendor/briefr`)

| Finding | Severity | Correction |
|---|---|---|
| Header sanitization overstated | Important | Documented exact `FORBIDDEN_OUTBOUND_HEADERS` frozenset from `webhooks/ssrf.py` (10 named headers) plus `x-briefr-*` prefix rule; clarified this is not an exhaustive strip of every provider credential header |
| `ensure_db_or_restore` scope | Important | Auto-restore prose now states SQLite-only startup path (`main.py` gated by `not is_postgres()`); PostgreSQL runs Alembic migrations instead |
| Delivery log table / retention | Medium | `webhook_delivery` → `webhook_delivery_log`; ~90-day TTL → 30-day (`WEBHOOK_DELIVERY_LOG_RETENTION_DAYS` in `db/cache_retention.py`) |
| Notifications vs feed health | Medium | Removed claim that open feed circuits from `/api/health` appear in `/api/admin/notifications`; notifications aggregate audit log, job errors, and unhealthy API keys only (`monitoring/notifications.py`) |

### Vendor sources consulted

- `backend/webhooks/ssrf.py` — `FORBIDDEN_OUTBOUND_HEADERS`, `sanitize_outbound_headers`
- `backend/main.py` — `if not is_postgres(): ensure_db_or_restore()`
- `backend/backup/manager.py` — `ensure_db_or_restore` (SQLite integrity + restore)
- `backend/db/cache_retention.py` — `WEBHOOK_DELIVERY_LOG_RETENTION_DAYS = 30`
- `backend/monitoring/notifications.py` — `build_operator_notifications` streams
