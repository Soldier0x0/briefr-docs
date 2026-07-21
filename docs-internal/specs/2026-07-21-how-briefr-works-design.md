# How BRIEFR Works — and Why — design spec

**Date:** 2026-07-21 · **Status:** approved (locked decisions from maintainer discussion)
**Repo:** `briefr-docs` (portal) · canonical deep architecture/study content stays in `briefr` and syncs
**Audience:** security practitioners and builders who want to learn how a real intel data plane works — not a general “cybersecurity zero-to-hero” course

## Goal

Turn the documentation portal into a **multi-purpose reference + learning site**:

1. **Reference** — use / admin / API (already live).
2. **How BRIEFR Works — and Why** — teach fluency in how this tool **collects, shapes, and reasons over security intel**, and how that system is engineered, with the real codebase as the parallel textbook.

Definition of done for the learning section: a reader can follow a clear ordered path through the intel lifecycle and the system-design track, every chapter answers the fixed question set, content is complete without requiring a local deploy, and `npm run build` stays green (`onBrokenLinks: 'throw'`).

## Locked decisions

| Decision | Choice |
| --- | --- |
| Section title | **How BRIEFR Works — and Why** |
| Content location | **Hybrid (C)** — deep architecture / study-guide / learn pathways stay canonical in `briefr` and sync; course scaffolding (landings, glossary, difficulty, chapter wrappers, labs framing) is portal-native in `briefr-docs` |
| Tracks | **Both**, intel-lifecycle first, then system-design |
| System-design framing | **Strictly how BRIEFR is built**, plus short comparative **“At enterprise scale”** side notes (not a distributed-systems course) |
| Hands-on | **Optional**, never mandatory; docs site never holds learner API keys or fires live third-party calls |
| Deploy / DNS | **Out of scope for agents** — maintainer deploys to Cloudflare / `docs.projectjupiter.in` later; keep current `baseUrl` until then |
| Execution | **Always subagent-driven** when implementing |
| Visual polish (shadcn) | Separate workstream (PRs #3/#4); not a gate for curriculum scaffolding |

## Non-goals

- Renaming or marketing the section as “zero to hero”
- Making learners cybersecurity experts in the general sense
- Live API playgrounds on the static docs host
- Cloudflare / subdomain / `baseUrl` / CNAME changes in this phase
- Editing the `briefr` product application code (docs-only PRs in `briefr` only when syncing/extending canonical study content — prefer portal-native first where possible)
- Replacing the existing User / Admin / Developer / API reference pillars

## Three pillars (site IA)

```
Reference (existing)          Learning (new)                         Project (existing)
─────────────────────         ─────────────────────────────          ────────────────
User Guide                    How BRIEFR Works — and Why             Roadmap
Admin Guide                     ├─ Pathways (persona chooser)        Release Notes
Developer Guide                 ├─ Track A: Intel lifecycle          FAQ
API / Security / Integrations   ├─ Track B: How it's built
                                └─ Glossary
```

Navbar gains one entry: **Learn** → `/docs/how-briefr-works`.

## Track A — Intel lifecycle (priority)

Ordered spine (data’s journey):

**Collect → Normalize → Enrich → Correlate → Hunt → Detect → Prioritize / Report**

Each stage is a chapter (or small chapter cluster). Source deep-dives (NVD, KEV, EPSS, OTX, …) hang under **Collect** / **Enrich** using the same template — they teach *how tools use these sources*, not a standalone CERT syllabus.

### Fixed chapter template (every learning chapter)

1. **What it is** — plain definition
2. **Why we do it** — problem solved
3. **Where it lives in BRIEFR** — exact paths (and commit SHA when linking into `briefr`)
4. **How it works** — mechanics, data in → out, diagram when useful
5. **What it needs** — inputs, keys, dependencies
6. **How industry does it — and why BRIEFR does it this way** — comparative layer
7. **Try it yourself** *(optional block)* — annotated fixtures and/or “if you self-host, do X in your instance”; never a docs-side live call

Within each chapter, depth is layered as **Concept → In BRIEFR → (optional) At scale**, not as a beginner→expert ladder for cybersecurity itself.

## Track B — How it’s built (system design)

Teach **pragmatic single-service / single-writer production design** as BRIEFR actually implements it:

Ingestion & scheduler · resilience (circuits, rate limits, quota) · storage (Postgres/pgvector, migrations) · API & auth · background jobs · search/embeddings · webhooks/SSRF · backups/ops · CI/security posture

Each chapter ends (or side-boxes) with **At enterprise scale:** how a large org might do the same job differently, and why BRIEFR intentionally stays scoped (honest, not apologetic). Explicit non-coverage: horizontal sharding, Kafka-class brokers, multi-region consensus — comparative notes only.

## Hands-on / “Try it yourself” policy

| Allowed on docs site | Forbidden on docs site |
| --- | --- |
| Redacted JSON fixtures with field callouts | Storing learner API keys |
| Links into self-hosted BRIEFR admin (reader’s box) | Live calls to VT / AbuseIPDB / etc. from docs |
| “Open this file in the repo” walks | Implying deploy is required to finish the chapter |

## Hybrid sync

Extend `scripts/migrate.cjs` to also mirror:

- `briefr/docs/study-guide/**` → `docs/how-briefr-works/synced/study-guide/**` (or equivalent)
- `briefr/docs/learn/**` → `docs/how-briefr-works/synced/learn/**`

Portal-native wrappers and pathway pages **link into** synced pages; they do not duplicate long architecture essays. If a synced page is missing a template section, the portal wrapper supplies the missing framing (or a follow-up PR in `briefr` updates the canonical page).

## Components (portal-native MDX)

Learning pages that need components are **`.mdx`**. Migrated/synced canonical pages stay **`.md`** (`markdown.format: 'detect'` unchanged).

| Component | Role |
| --- | --- |
| `InTheCode` | File / directory links into `https://github.com/Soldier0x0/briefr` pinned to a documented commit SHA constant |
| `AtEnterpriseScale` | Short comparative callout (Track B + anywhere useful) |
| `TryItYourself` | Optional block; copy states deploy is recommended, not required |
| `ChapterMeta` | Optional front-matter display: track, stage, prerequisites, next |

## Pathways

Reuse the spirit of `briefr/docs/learn/` personas as a portal landing:

- **Analyst** → Track A spine
- **Architect / Builder** → Track B spine (with pointers into Track A where data meets design)

## Phasing

| Phase | Deliverable | Plan |
| --- | --- | --- |
| **1 — Foundation** | IA, nav, landings, components, migrate extension, glossary stub, **one exemplar chapter per track**, outlines for remaining chapters | **This plan’s companion implementation plan** |
| **2 — Track A content** | Full intel-lifecycle + priority source deep-dives | Separate plan after Phase 1 ships |
| **3 — Track B content** | Full system-design chapters with enterprise-scale notes | Separate plan after Phase 2 (or parallel once Phase 1 is stable) |
| **4 — Polish / deploy** | Visual polish, social card, maintainer-owned subdomain cutover | Existing polish PRs + maintainer DNS |

## Voice and identity

- Plain verbs, audience-first, no marketing fluff (match Security Guide / Roadmap voice).
- Preserve BRIEFR visual identity (`--brf-*`, DM fonts, dark-only).
- Do not invent product behavior — every “In BRIEFR” claim traces to code or an existing canonical doc.

## Verification

- Every phase: `npm run build` with `onBrokenLinks: 'throw'`
- Learning landings + exemplar chapters browser-checked at 390 and 1440
- Grep gate: no “zero to hero”; no docs-side live API key forms
- Sync dry-run: `node scripts/migrate.cjs` with `BRIEFR_MAIN_DOCS` pointing at a checkout of `briefr/docs` does not error when `study-guide/` / `learn/` are present or absent

## Risks

| Risk | Mitigation |
| --- | --- |
| `briefr` study-guide corpus huge / uneven quality | Sync as reference; portal wrappers set the learning order; Phase 2 rewrites thin chapters |
| Commit-SHA pin drift | Single `BRIEFR_DOCS_PIN` constant; bump in one place when refreshing “In the code” links |
| Scope explosion into general security course | Template + spine enforced; reject chapters that don’t map to Collect…Report or How it’s built |
| Broken links after migrate expansion | Build gate; rewrite rules extended in migrate.cjs |
