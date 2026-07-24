---
sidebar_label: Architecture decisions
sidebar_position: 4
---

# Architecture decisions (ADRs)

Canonical ADR files live in the product repository under
[`docs/decisions/`](https://github.com/Soldier0x0/briefr/tree/main/docs/decisions/).

---

## ADR index

| ADR | Title | Summary |
| --- | --- | --- |
| [ADR-001](https://github.com/Soldier0x0/briefr/blob/main/docs/decisions/ADR-001-intel-app-schema-split.md) | Intel vs app schema split (open-core data plane) | Separates publishable intel snapshot data from per-instance operator state (accounts, sessions, webhooks, watchlists) via documented export allowlists rather than raw production dumps. |
| [ADR-002](https://github.com/Soldier0x0/briefr/blob/main/docs/decisions/ADR-002-operational-priority.md) | BRIEFR scoring axes and Operational Priority | Replaces the v1.1b single additive blend with distinct Threat, Operational Priority, and Environment Relevance axes — deterministic, explainable, and backend-owned. |
| [ADR-003](https://github.com/Soldier0x0/briefr/blob/main/docs/decisions/ADR-003-ui-design-system.md) | BRIEFR UI design system: semantic tokens + Radix primitives (no Tailwind) | Establishes semantic CSS tokens and Radix-based primitives as the UI architecture all future work follows. |
| [ADR-004](https://github.com/Soldier0x0/briefr/blob/main/docs/decisions/ADR-004-correlation-precompute.md) | Move correlation off the request path (precomputed edges) | Moves per-CVE correlation computation from request time to a scheduler job writing precomputed rows; the request path becomes a cheap indexed read. |
| [ADR-005](https://github.com/Soldier0x0/briefr/blob/main/docs/decisions/ADR-005-component-library-strategy.md) | Component library & UI dependency strategy (approved / conditional / prohibited) | Canonical registry of which UI libraries may be used in BRIEFR and how — operationalizes ADR-003 into an explicit allow/deny list. |
| [ADR-006](https://github.com/Soldier0x0/briefr/blob/main/docs/decisions/ADR-006-encrypted-app-settings-secrets.md) | Encrypted `app_settings` secrets (env still primary) | Fernet-encrypts secret-typed Admin saves in Postgres `app_settings` when `BRIEFR_SETTINGS_KEY` is set; process env and `.env` remain supported with unchanged precedence. |

---

## Where ADRs show up in the portal

- [System design](./system-design.md) — architecture narrative referencing ADR-002, ADR-004, ADR-006
- [Security Guide](/docs/security-guide) — secret handling (ADR-006)
- [Product status](/docs/product-status) — scoring and operator config status
