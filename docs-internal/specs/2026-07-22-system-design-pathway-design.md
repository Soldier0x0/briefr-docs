# System Design pathway + scoped Learn UI — design spec

**Date:** 2026-07-22 · **Status:** draft pending maintainer review  
**Repo:** `briefr-docs` (portal)  
**Ground truth:** private `briefr` for product claims; general SD theory for gap units only  
**Related:**  
- `docs-internal/specs/2026-07-21-how-briefr-works-design.md` (learning portal)  
- `docs-internal/specs/2026-07-21-portal-visual-polish-design.md` (PR #3 — scoped shadcn Decision D1)  
- Existing Track A / Track B content under `docs/how-briefr-works/`

## Goal

1. Add a third learning pathway — **System Design** — that follows a standard basics→advanced system-design curriculum order.
2. Where BRIEFR implements the topic, teach **from the real product** (code + existing How BRIEFR Works chapters).
3. Where BRIEFR does not (or should not) implement the topic, ship an honest **gap unit**: topic name, what it covers, why BRIEFR omits/limits it, curated external resources, then “return and continue.”
4. Improve Learn UI with **scoped shadcn** primitives, locked to the BRIEFR signature palette (`--brf-*`), without turning the portal into a generic shadcn theme.

Definition of done: Pathways page lists three clear tracks; System Design spine is navigable end-to-end; every unit is tagged `briefr` | `partial` | `gap`; gap units use one shared MDX component; Learn landings/pathway chrome use palette-bridged shadcn; Analyst and Architect pathways remain BRIEFR-complete and unchanged in promise; `npm run build` stays green.

## Locked decisions

| Decision | Choice |
| --- | --- |
| Pathway count | **Three:** Analyst · Architect / security builder · System Design |
| Analyst / Architect | Stay **BRIEFR-complete** (intel lifecycle + how-it’s-built / security posture). Do not dilute with generic SD theory. |
| System Design | **Hybrid curriculum** in classic SD order; BRIEFR where it maps; gap units elsewhere |
| Gap pedagogy | Always explain **what / why it matters / why not in BRIEFR / when you’d need it / where to learn / return path** |
| External resources | Curated, few, durable (books/canonical docs/named channels). Not a random link farm. |
| UI approach | **Scoped shadcn runtime (Decision D1 Option A)** from the portal visual-polish design — Tailwind theme+utilities only (no preflight), tokens bridged to `--brf-*`, components only on owned React/MDX surfaces |
| Palette | Non-negotiable BRIEFR identity: accent `#e85533`, warm neutrals, link `#7eb8f0`, DM Serif Display / DM Sans / IBM Plex Mono |
| Truth | Never invent BRIEFR behavior. Gap reasons must match product constraints (self-hosted, single-writer, CVE portal, intentional non-goals). |
| Execution | Spec → implementation plan → subagent-driven development |

## Non-goals

- Claiming BRIEFR is a complete pure system-design university course  
- Implementing fake distributed systems (Kafka, multi-region active-active, consensus labs) inside BRIEFR just to “cover” a chapter  
- Rewriting Analyst / Architect curricula into interview-prep drills  
- Full-portal shadcn adoption that fights Infima / drifts brand (Option C from polish design — rejected)  
- Light theme  
- DNS / Cloudflare config changes in this workstream (already cut over to `baseUrl: '/'`)  
- Editing the `briefr` application codebase  

## Three-pathway IA

```
How BRIEFR Works
├── Pathways (chooser)
│   ├── Analyst          → intel-lifecycle spine (complete)
│   ├── Architect        → how-its-built + security posture (complete)
│   └── System Design    → system-design/ spine (hybrid)
├── Intel lifecycle/     (Track A — unchanged promise)
├── How it's built/      (Track B — unchanged promise)
├── System design/       (NEW — curriculum spine)
└── Glossary
```

**Naming:** Do **not** rename Architect to “System Design.” Architect = how this product is wired. System Design = general curriculum grounded in this product.

---

## System Design curriculum map

Each unit has a coverage tag:

- **`briefr`** — teach primarily from BRIEFR (link Track B / Track A / portal system-design docs).  
- **`partial`** — teach BRIEFR’s slice first, then a short external block for the rest.  
- **`gap`** — curriculum placeholder + rationale + externals; minimal or no product deep-dive.

### Spine order (learner path)

| # | Unit | Tag | BRIEFR anchors (examples) | Gap / external focus |
| --- | --- | --- | --- | --- |
| 0 | How to use this pathway | `briefr` | Pathways chooser, pin, how to return from externals | — |
| 1 | Foundations | `partial` | Latency/availability as they show up in health, rate limits, soft-fail | SLA/SLO/SLI pedagogy, estimation drills (QPS/storage) |
| 2 | Requirements & framing | `partial` | BRIEFR’s locked product brief (self-host CVE portal, non-goals) | Ambiguous-prompt / interview framing drills |
| 3 | High-level architecture | `briefr` | Monolith, sync/async, trust boundaries, `system-design.md`, Track B index | Microservices / service discovery as contrast |
| 4 | Storage & data modeling | `briefr` | Storage chapter, SQLite↔Postgres, schema, backup | Broad NoSQL zoo, graph DBs as survey |
| 5 | Scalability patterns | `partial` | Cache, jobs, rate limits, circuits, single-box limits | Sharding, CDN-scale LB, stream platforms |
| 6 | Consistency, reliability, fault tolerance | `partial` | Retries, timeouts, breakers, degradation, idempotent jobs | Multi-region DR, full CAP case library |
| 7 | Distributed systems basics | `gap` | Local locks / single scheduler owner as *alternative* | Consensus, leader election, exactly-once, clock skew |
| 8 | APIs & service contracts | `briefr` | API & auth chapter, REST surface, webhooks | gRPC/GraphQL survey |
| 9 | Messaging, eventing, async | `partial` | Scheduler, background jobs, Procrastinate-style workers | Kafka/Pulsar, saga/outbox platforms |
| 10 | Caching & performance | `partial` | feed_cache, ioc_cache, TTLs | CDN, stampede, tail-latency at mega-scale |
| 11 | Search & retrieval | `briefr` | Search & embeddings chapter (honesty about fallbacks) | Distributed search clusters |
| 12 | Observability & operations | `partial` | Health, notifications, backups, admin ops | Full tracing/SLO platforms, feature flags at scale |
| 13 | Security & privacy | `briefr` | Auth, secrets posture, SSRF, rate limits, audit surfaces | Enterprise IdP/mTLS deep courses |
| 14 | Multi-tenancy & SaaS | `gap` | Single-deployment self-host model; noisy-neighbor N/A by design | Shared DB tenancy, billing-aware architecture |
| 15 | Case study: BRIEFR | `briefr` | End-to-end walk: constraints → data path → failure → ops | — (this *is* the case study) |
| 16 | Tradeoff-driven design practice | `gap` | Reuse BRIEFR tradeoffs as worked examples | Interview timing, whiteboard structure |
| 17 | Advanced topics | `gap` | Sparse AI use, vector search on one box as *limited* examples | CQRS, event sourcing, active-active, feature stores |
| 18 | Design review & critique | `partial` | Critique BRIEFR’s own boundaries using AtEnterpriseScale notes | Formal review rubrics |

Unit numbers may collapse into fewer MDX files (e.g. one file per major section) as long as the **learner order** and tags stay visible.

---

## Gap unit template (required)

Every `gap` (and the external half of every `partial`) uses the same structure via a Learn MDX component, e.g. `<SystemDesignGap>` / `<ExternalTheory>`:

1. **Topic** — curriculum name  
2. **What it covers** — 3–6 bullets of pure SD scope  
3. **Why it matters** — one short paragraph  
4. **In BRIEFR** — what exists instead (link code/docs) **or** “not implemented”  
5. **Why BRIEFR skips or limits this** — deliberate reasons only, e.g.:
   - single self-hosted deployment / single writer  
   - ops and cognitive cost not justified for CVE portal scope  
   - failure domain is one box by product choice  
   - YAGNI vs enterprise multi-region / multi-tenant SaaS  
6. **When you would need it anyway** — honest triggers  
7. **Learn externally** — 2–4 curated resources (prefer DDIA chapters, official docs, named reputable channels/playlists with topic labels). Avoid undifferentiated “watch YouTube.”  
8. **Return here** — link to the next System Design unit  

Tone: deliberate, not apologetic. Never invent a BRIEFR feature to fill a gap.

---

## Relationship to existing content

| Existing | Role after this work |
| --- | --- |
| `intel-lifecycle/**` | Analyst pathway only (still linked from SD case study where useful) |
| `how-its-built/**` | Architect pathway; also **primary anchors** for `briefr`/`partial` SD units |
| `pathways.mdx` | Three-path chooser with distinct promises |
| `src/components/learn/*` | Keep; extend with gap/pathway UI primitives |
| Portal `system-design.md` / developer guide | Cite, don’t duplicate wholesale |
| `briefr` HTML study-guide / learn pathways | Optional reference links; not required to sync HTML into Docusaurus |

---

## Learn UI — scoped shadcn

### Align with portal visual polish (D1 = A)

Reuse the approach in `2026-07-21-portal-visual-polish-design.md`:

- Tailwind v4 **theme + utilities only** (preflight **off**)  
- Bridge `--background`, `--primary`, … → `--brf-*`  
- shadcn under `src/components/ui/`  
- Consume from owned surfaces only (`src/pages`, Learn MDX components, optional swizzled cards)

**This workstream prioritizes Learn surfaces first** (pathways, system-design spine, gap callouts). Broader homepage/DocCard polish can merge with or follow PR #3/#4 rather than forking a third Tailwind stack.

### Learn-specific components (compose shadcn + existing learn callouts)

| Surface | Purpose |
| --- | --- |
| Pathway chooser cards | Three equal tracks; clear “complete” vs “hybrid” badges |
| Unit coverage badge | `briefr` / `partial` / `gap` |
| `<SystemDesignGap>` | Gap template layout (Alert + Card + resource list) |
| SD spine nav | Ordered list / steps for the curriculum |
| Existing `InTheCode`, `AtEnterpriseScale`, `TryItYourself` | Keep; restyle lightly to match new primitives if needed |

### Palette rules

- Primary / accent = `#e85533` / `#f26b4a`  
- Surfaces = ink / surface / raise  
- Links = `#7eb8f0`  
- No purple default shadcn look, no cream editorial theme, no glow stacks  

---

## File map (planned)

| Path | Responsibility |
| --- | --- |
| `docs/how-briefr-works/pathways.mdx` | Three-path chooser |
| `docs/how-briefr-works/system-design/_category_.json` | Sidebar category |
| `docs/how-briefr-works/system-design/index.mdx` | SD landing + how to use gaps |
| `docs/how-briefr-works/system-design/*.mdx` | Curriculum units (grouped files OK) |
| `src/components/learn/SystemDesignGap.tsx` (+ styles) | Gap template |
| `src/components/learn/CoverageBadge.tsx` | briefr/partial/gap |
| `src/components/ui/*` | shadcn primitives (from polish plan) |
| Token bridge / Tailwind entry | Shared with visual-polish workstream |

---

## Phasing

| Phase | Deliverable |
| --- | --- |
| **0 — Spec** | This document (approved) |
| **1 — Learn UI kit** | Scoped shadcn + BRIEFR token bridge; pathway cards; CoverageBadge; SystemDesignGap |
| **2 — SD spine scaffolding** | Category, index, ordered stubs with tags |
| **3 — BRIEFR-primary units** | Fill `briefr` (+ strong `partial` halves) linking Track B/A |
| **4 — Gap / remaining partial units** | Rationale + curated externals + return links |
| **5 — Pathways polish + gates** | Chooser copy, build/typecheck, screenshot check at 390/1440 |

Analyst/Architect content is not rewritten in these phases except cross-links from the SD pathway.

## Verification

- `npm run build` (`onBrokenLinks: 'throw'`) and `npm run typecheck`  
- No “zero to hero”; no docs-side API key collection  
- Every product claim in `briefr`/`partial` units traces to code or existing portal docs  
- Every `gap` unit includes all eight template sections  
- Visual: Learn pathway pages readable and on-brand at ~390 and ~1440  
- No second color system beside `--brf-*` / bridged shadcn semantics  

## Risks

| Risk | Mitigation |
| --- | --- |
| Gap units become a link farm | Enforce template + max 2–4 resources; prefer durable citations |
| Tailwind vs Infima conflict | Preflight off; Learn-scoped class usage; probe route before wide rollout |
| Duplicate Tailwind stacks vs PR #3/#4 | Prefer one shared foundation; merge or rebase polish work rather than re-init |
| Scope explosion into full SD textbook | Thin gap units; deep only where BRIEFR teaches |
| Stale external links | Prefer books/canonical docs; review links when bumping `BRIEFR_DOCS_PIN` |

## Open questions for maintainer (optional)

1. Confirm Decision D1 remains **Option A** (scoped shadcn runtime) vs product ADR-005-style Option B for this Learn work.  
2. Preferred external resource policy: allow named YouTube channels, or books/docs only?  
3. Should System Design live under `docs/how-briefr-works/system-design/` (recommended) or a top-level `docs/system-design/`?

**Recommendation defaults if unanswered:** D1 = A; allow a short curated YouTube list *plus* books/docs; keep under `how-briefr-works/system-design/`.
