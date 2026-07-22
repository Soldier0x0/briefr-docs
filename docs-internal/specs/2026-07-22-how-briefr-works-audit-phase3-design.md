# How BRIEFR Works — factual audit, Learn UI polish, Phase 3 (Track B)

**Date:** 2026-07-22 · **Status:** draft pending maintainer review  
**Repo:** `briefr-docs` (portal)  
**Ground truth:** private `briefr` checkout used for validation (local `.vendor/briefr`, never committed)  
**Parent design:** `docs-internal/specs/2026-07-21-how-briefr-works-design.md`  
**Prior delivery:** Phase 1 foundation + Phase 2 Track A (merged via PR #7)

## Goal

1. **Raise factual accuracy** of existing *How BRIEFR Works* content against the real `briefr` codebase.  
2. **Polish the Learn UI** so callouts and landings feel intentional while staying on BRIEFR’s signature palette.  
3. **Complete Phase 3 — Track B** by filling the six remaining *How it’s built* stubs so the Architect/Builder pathway is not outline-only.

Definition of done: audited chapters have no known false product claims; `InTheCode` paths exist at the pinned SHA; Track B chapters use the full template with code-backed claims; Learn UI uses only `--brf-*` tokens; `npm run build` and `npm run typecheck` stay green.

## Locked decisions (this pass)

| Decision | Choice |
| --- | --- |
| Order of work | **Audit + polish first**, then Track B fill |
| Truth source | Prefer **`briefr` code** when portal docs and code disagree; never invent behavior |
| Validation checkout | Agent-local clone under `.vendor/briefr` (gitignored); optional `BRIEFR_MAIN_DOCS` for migrate dry-run |
| Commit pin | Set `BRIEFR_DOCS_PIN` to the **validated commit SHA** (not floating `main`) |
| UI changes | **Allowed** on Learn surface + light nav/home affordances that point at Learn |
| Color / type | **Strict BRIEFR signature palette** only — see below |
| Skills | Use installed **impeccable** (+ documentation skill) for UI craft; SDD for implementation |
| App code | **No** `briefr` application code changes in this pass (docs/portal only) |
| Deploy / DNS / `baseUrl` | Still **out of scope** |
| Execution | Subagent-driven development after the implementation plan is written |

## Signature palette (non-negotiable)

All UI work must use existing portal tokens that mirror the product (`briefr/frontend/src/styles/tokens.css`):

| Role | Token / value |
| --- | --- |
| Accent | `--brf-accent` `#e85533` · strong `#f26b4a` · dim `rgba(232, 85, 51, 0.13)` |
| Surfaces | `--brf-ink` `#0a0a08` · surface `#111110` · raise `#1a1a17` |
| Hairlines | `#2a2a25` / `#333330` |
| Text | body `#e8e6df` · text `#c4c1b8` · dim `#a7a396` · bright `#f2f0ea` |
| Links | `--brf-link` `#7eb8f0` |
| Type | DM Serif Display · DM Sans · IBM Plex Mono |

Forbidden: new brand hues, purple/indigo AI defaults, cream/terracotta “editorial” defaults, glow-stack aesthetics that fight the warm terminal look. Severity ramp (`--sev-*`) may be used only where severity semantics already exist.

## Non-goals

- Phase 4 maintainer subdomain cutover / Cloudflare / `baseUrl` edits  
- General cybersecurity curriculum (“zero to hero”)  
- Docs-site live third-party API calls or learner API key collection  
- Replacing User / Admin / Developer / API pillars  
- Committing `.vendor/`, PATs, or session scratch under `.superpowers/`  
- Broad homepage redesign unrelated to Learn (home may get a restrained Learn CTA polish only)

## Workstream A — Factual audit + hygiene

### Scope

- Track A spine: Collect → Prioritize  
- Source deep-dives: NVD, KEV, EPSS, OTX  
- Track B exemplar: Resilience  
- Pathways + glossary where they assert product facts  
- `InTheCode` / pin usage across `src/components/learn/`

### Method

1. Record validated SHA from `.vendor/briefr` (`git rev-parse HEAD`) into `BRIEFR_DOCS_PIN`.  
2. For each page: extract product claims and code paths → verify file existence and behavior in the checkout → **fix, hedge, or remove**.  
3. Prefer citing paths that already appear in `briefr/docs/SYSTEM_DESIGN.md`, `HOW_IT_WORKS.md`, or matching portal mirrors — but **code wins** on conflicts.  
4. Hygiene bundle:  
   - Remove leaked `.superpowers/sdd/task-*-report.md` from the repo; ignore `.superpowers/`  
   - Normalize “How industry does it — …” em-dash on source pages  
   - Prefer `./slug` or absolute `/docs/how-briefr-works/...` links on category indexes  
   - Trim oversized `InTheCode` lists when paths are already named in prose  

### Exit criteria

- Sampled claims re-checked against code with a written audit note in the implementation plan’s progress ledger (or a short `docs-internal` audit log)  
- No `InTheCode` links to missing paths at the pinned SHA  
- `rg -i 'zero to hero' docs/how-briefr-works` remains empty  

## Workstream B — Learn UI polish

### Scope

- `src/components/learn/*` (InTheCode, AtEnterpriseScale, TryItYourself, styles)  
- Learning landings: `docs/how-briefr-works/index.mdx`, `pathways.mdx` (and light related chrome if needed)  
- Optional `ChapterMeta` **only** if it improves wayfinding without clutter  

### Method

- Drive craft with **impeccable**, preserving identity (warm terminal, orange accent, existing fonts).  
- One composition per landing viewport; brand-consistent; restrained motion with `prefers-reduced-motion`.  
- Callouts: clearer hierarchy, hairline/surface treatment via `--brf-*`, no card clutter for its own sake.  
- Do not introduce a second design system or off-palette accents.

### Exit criteria

- Visual polish is noticeable on Learn landings + callouts at ~390 and ~1440 widths  
- Contrast remains readable (body ≥ 4.5:1 against surfaces used)  
- Build/typecheck green  

## Workstream C — Phase 3 Track B content

### Files to fill (replace “Outline — Phase 3” stubs)

| Page | Intended grounding (verify at write time; do not copy blindly) |
| --- | --- |
| `ingestion-scheduler.mdx` | `backend/scheduler.py`, feeds, scheduler locks, ingest jobs |
| `storage.mdx` | `backend/database.py`, `backend/db/`, alembic, Postgres/SQLite notes as implemented |
| `api-auth.mdx` | `backend/main.py`, `backend/routers/`, `backend/auth/` |
| `background-jobs.mdx` | `backend/jobs/`, correlation / OTX / maintenance paths as implemented |
| `search-embeddings.mdx` | Search / embedding / ML helpers **as they exist** — omit features that are not in tree |
| `webhooks-ops.mdx` | `backend/webhooks/`, backup / monitoring / health as implemented |

`resilience.mdx` stays unless Workstream A finds factual drift.

### Shared chapter requirements

Same seven H2 sections as Track A; imports for `InTheCode`, `TryItYourself`, and `AtEnterpriseScale` when used; `backend/` / `frontend/` path prefixes; TryItYourself = fixture or self-host only; Industry / enterprise notes comparative only — not a distributed-systems course.

### Exit criteria

- Zero remaining `Outline — Phase 3` notes under `how-its-built/`  
- Pathways Architect route points at complete chapters  
- Build green with `onBrokenLinks: 'throw'`  

## Architecture / constraints reminder

- Portal remains static Docusaurus; `baseUrl` `/briefr-docs/` unchanged.  
- Hybrid sync (`study-guide` / `learn` → `synced/`) may be dry-run against `.vendor/briefr/docs` but is not the primary deliverable of this pass.  
- No DNS / Cloudflare / subdomain work.

## Verification

| Gate | Command / check |
| --- | --- |
| Build | `npm run build` |
| Types | `npm run typecheck` |
| Curriculum voice | no “zero to hero” |
| Path existence | every `InTheCode` path exists under pinned tree |
| Palette | no new color tokens outside `--brf-*` / existing severity ramp |
| Secrets | `.vendor/` gitignored; no PAT in git history |

## Risks

| Risk | Mitigation |
| --- | --- |
| Private repo unavailable in future sessions | Document that validation used a local `.vendor` checkout; pin SHA in `pin.ts` |
| Code/docs drift | Code wins; fix learning pages; optionally note portal doc drift for later |
| Scope explosion into full site redesign | UI limited to Learn surface + light Learn CTAs |
| Hallucinated Track B features | Skip or mark unknown; never invent |

## Phasing inside this pass

1. Implementation plan (writing-plans) covering A → B → C  
2. SDD execution with per-task review  
3. PR to `main`  

Phase 4 (maintainer deploy polish) remains separate after this pass.
