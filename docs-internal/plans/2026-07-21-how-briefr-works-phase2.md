# How BRIEFR Works — Phase 2 Track A Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the Track A (intel lifecycle) spine with complete template-shaped chapters and add four priority source deep-dives (NVD, KEV, EPSS, OTX), so a reader can walk Collect→Prioritize without outline stubs.

**Architecture:** Portal-native MDX under `docs/how-briefr-works/intel-lifecycle/` continues to own the spine. Source deep-dives live under `docs/how-briefr-works/intel-lifecycle/sources/`. Reuse existing learn callouts (`InTheCode`, `TryItYourself`). Claims must trace to portal docs already in-repo (`integrations.md`, `how-it-works.md`, `system-design.md`, `using-briefr.md`, `api-reference.md` as needed). No `briefr` application code changes in this phase (docs-only in `briefr-docs`).

**Tech Stack:** Docusaurus 3.10.2, MDX, existing `src/components/learn/*`.

## Global Constraints

- Node `>=20`; do not upgrade Docusaurus.
- `onBrokenLinks: 'throw'` must stay green on every `npm run build`.
- Do not change `baseUrl`, `url`, Cloudflare, or subdomain config.
- Do not modify the `briefr` application codebase in this phase.
- Never invent product behavior — every "In BRIEFR" claim traces to an existing portal doc or a cited path that already appears in those docs.
- Never "zero to hero".
- TryItYourself never collects API keys or fires live third-party calls from the docs site.
- Use `backend/` prefixes on `InTheCode` paths (same rule as Phase 1 Collect fix).
- Prefer absolute `/docs/how-briefr-works/...` links on nested category pages when relative links break under Docusaurus 3.
- Commits: one logical commit per task; conventional messages.
- Execution: subagent-driven.

## File map

| Path | Responsibility |
| --- | --- |
| `docs/how-briefr-works/intel-lifecycle/normalize.mdx` | Full chapter |
| `docs/how-briefr-works/intel-lifecycle/enrich.mdx` | Full chapter |
| `docs/how-briefr-works/intel-lifecycle/correlate.mdx` | Full chapter |
| `docs/how-briefr-works/intel-lifecycle/hunt.mdx` | Full chapter |
| `docs/how-briefr-works/intel-lifecycle/detect.mdx` | Full chapter |
| `docs/how-briefr-works/intel-lifecycle/prioritize.mdx` | Full chapter |
| `docs/how-briefr-works/intel-lifecycle/sources/_category_.json` | Source deep-dives category |
| `docs/how-briefr-works/intel-lifecycle/sources/index.mdx` | Sources landing |
| `docs/how-briefr-works/intel-lifecycle/sources/{nvd,kev,epss,otx}.mdx` | Four priority deep-dives |
| `docs/how-briefr-works/intel-lifecycle/index.mdx` | Add Sources row to spine table |
| `docs/how-briefr-works/intel-lifecycle/collect.mdx` | Optional one-line link to Sources (if missing) |

## Shared chapter requirements (every Task 1–6 page)

Replace the outline stub entirely. Front matter keeps existing `sidebar_position` / `sidebar_label` / `title` / `description` unless improving description. Body must include all seven H2 sections:

1. What it is
2. Why we do it
3. Where it lives in BRIEFR (include `<InTheCode … />` with ≥1 `backend/` path cited in system-design or related portal docs)
4. How it works
5. What it needs
6. How industry does it — and why BRIEFR does it this way
7. Optional: `<TryItYourself>` — self-host or fixture only

Imports when used:

```mdx
import InTheCode from '@site/src/components/learn/InTheCode';
import TryItYourself from '@site/src/components/learn/TryItYourself';
```

After each chapter: `npm run build` must pass; `rg -n -i 'zero to hero' docs/how-briefr-works` must find nothing.

---

### Task 1: Normalize

**Files:**
- Modify: `docs/how-briefr-works/intel-lifecycle/normalize.mdx`
- Read first: `docs/developer-guide/system-design.md` (ingest post-process / CVE fields), `docs/integrations.md`, `docs/user-guide/how-it-works.md`

**Interfaces:**
- Consumes: Collect chapter context; learn callouts
- Produces: complete Normalize chapter

Required sourced themes:
- Many feeds arrive in different shapes; BRIEFR stores a local CVE-centric record (`cves` and related tables named in system-design).
- Post-process / display field backfill / extended enrich steps after NVD ingest (system-design ingest path).
- Why: correlation and ranking need comparable fields.
- Industry: SIEM/TIP raw event retention vs BRIEFR's analyst-facing normalized CVE object.

- [ ] **Step 1: Write full `normalize.mdx`** (remove outline note).
- [ ] **Step 2:** `npm run build`
- [ ] **Step 3:** Commit `feat(learn): write Normalize chapter (intel lifecycle)`

---

### Task 2: Enrich

**Files:**
- Modify: `docs/how-briefr-works/intel-lifecycle/enrich.mdx`
- Read first: `docs/developer-guide/system-design.md` (CVE detail enrich path, IOC lookup), `docs/integrations.md`, `docs/user-guide/using-briefr.md`

**Interfaces:**
- Produces: complete Enrich chapter; may link forward to `/docs/how-briefr-works/intel-lifecycle/sources/` (create stub landing in Task 7 if build requires it — prefer adding a prose link that Task 7 will satisfy, or create minimal `sources/index.mdx` here if build fails)

Required themes:
- Scheduler enrich vs on-demand drawer enrich (`asyncio.gather` for Sploitus/OTX/OSV/CIRCL; GreyNoise on-demand) per system-design.
- IOC lookup path + caches (`ioc_cache`).
- Soft-fail / no-key behavior from Integrations.
- Industry: live pivot tools vs BRIEFR's mix of nightly mirrors + on-demand lookups.

- [ ] **Step 1: Write full `enrich.mdx`**
- [ ] **Step 2:** `npm run build`
- [ ] **Step 3:** Commit `feat(learn): write Enrich chapter (intel lifecycle)`

---

### Task 3: Correlate

**Files:**
- Modify: `docs/how-briefr-works/intel-lifecycle/correlate.mdx`
- Read first: `docs/user-guide/how-it-works.md` (correlation lanes), `docs/developer-guide/system-design.md` (correlation nightly, drawer correlation)

**Interfaces:**
- Produces: complete Correlate chapter

Required themes:
- Four explainable lanes from how-it-works: Campaigns, Infrastructure, Actor/sector, Temporal — no black-box ML score.
- Nightly correlation job + `GET /api/cves/{id}/correlation`.
- Drawer open does not call OTX live for correlation (how-it-works).
- Industry: opaque graph scores vs BRIEFR's explainable lanes.

- [ ] **Step 1: Write full `correlate.mdx`**
- [ ] **Step 2:** `npm run build`
- [ ] **Step 3:** Commit `feat(learn): write Correlate chapter (intel lifecycle)`

---

### Task 4: Hunt

**Files:**
- Modify: `docs/how-briefr-works/intel-lifecycle/hunt.mdx`
- Read first: `docs/developer-guide/system-design.md` (Forge / hunt packs), `docs/user-guide/using-briefr.md` (investigation pivots)

**Interfaces:**
- Produces: complete Hunt chapter

Required themes:
- Forge hunt packs / technique coverage (`hunt_packs`, `GET /api/hunt-packs/...`, generate path) as cited in system-design.
- Investigation pivots CVE → IOC → related CVE (session-only) from using-briefr if still accurate.
- Hunting here means structured follow-up from intel already in BRIEFR, not generic red-team training.
- Industry: dedicated detection-engineering platforms vs BRIEFR's Forge MVP scoped to ATT&CK coverage from local intel.

- [ ] **Step 1: Write full `hunt.mdx`**
- [ ] **Step 2:** `npm run build`
- [ ] **Step 3:** Commit `feat(learn): write Hunt chapter (intel lifecycle)`

---

### Task 5: Detect

**Files:**
- Modify: `docs/how-briefr-works/intel-lifecycle/detect.mdx`
- Read first: `docs/developer-guide/system-design.md` (Forge Sigma/SIEM, detection drawer, proof bench)

**Interfaces:**
- Produces: complete Detect chapter

Required themes:
- Sigma generator + SIEM query templates; drawer Detect tab; optional proof bench (`POST /api/proof/run`) file-based, no live SIEM — as system-design states.
- KEV detection backlog concept if present in system-design.
- Industry: shipping rules to a SIEM/XDR vs generating/proofing locally in BRIEFR.

- [ ] **Step 1: Write full `detect.mdx`**
- [ ] **Step 2:** `npm run build`
- [ ] **Step 3:** Commit `feat(learn): write Detect chapter (intel lifecycle)`

---

### Task 6: Prioritize / report

**Files:**
- Modify: `docs/how-briefr-works/intel-lifecycle/prioritize.mdx`
- Read first: `docs/developer-guide/system-design.md` (BRIEF / MorningBrief / risk scoring / KEV urgency), `docs/user-guide/using-briefr.md`

**Interfaces:**
- Produces: complete Prioritize chapter (sidebar_label may remain `Prioritize / report` or `Prioritize` — keep existing label unless broken)

Required themes:
- BRIEF action queue (`action_queue`), KEV due-date urgency hierarchy, backend-canonical risk scoring references in system-design.
- Stack terms / morning brief workflow.
- PDF/export only if already documented — do not invent.
- Industry: ticket queues / vuln management platforms vs BRIEFR's local brief for a focused team.

- [ ] **Step 1: Write full `prioritize.mdx`**
- [ ] **Step 2:** `npm run build`
- [ ] **Step 3:** Commit `feat(learn): write Prioritize chapter (intel lifecycle)`

---

### Task 7: Priority source deep-dives (NVD, KEV, EPSS, OTX)

**Files:**
- Create: `docs/how-briefr-works/intel-lifecycle/sources/_category_.json`
- Create: `docs/how-briefr-works/intel-lifecycle/sources/index.mdx`
- Create: `docs/how-briefr-works/intel-lifecycle/sources/nvd.mdx`
- Create: `docs/how-briefr-works/intel-lifecycle/sources/kev.mdx`
- Create: `docs/how-briefr-works/intel-lifecycle/sources/epss.mdx`
- Create: `docs/how-briefr-works/intel-lifecycle/sources/otx.mdx`
- Modify: `docs/how-briefr-works/intel-lifecycle/index.mdx` (add Sources link to spine/overview)
- Modify: `docs/how-briefr-works/intel-lifecycle/collect.mdx` and/or `enrich.mdx` — one short "See also" link to sources if not already present

**Interfaces:**
- Consumes: Integrations table facts; system-design scheduler jobs
- Produces: four deep-dives using the same 7-section template, teaching how *tools use* these sources (not a general CVE syllabus)

`_category_.json`:

```json
{
  "label": "Sources",
  "position": 9,
  "collapsed": true,
  "link": {"type": "doc", "id": "how-briefr-works/intel-lifecycle/sources/index"}
}
```

Each deep-dive must include Integrations columns: what it adds, key, free-tier/quota reality, failure behavior — plus Where/How in BRIEFR (scheduler job or on-demand path named in system-design).

- [ ] **Step 1:** Create category + index listing the four sources and pointing back to Collect/Enrich.
- [ ] **Step 2:** Write `nvd.mdx`, `kev.mdx`, `epss.mdx`, `otx.mdx` (full template each).
- [ ] **Step 3:** Update intel-lifecycle `index.mdx` with a Sources row/link.
- [ ] **Step 4:** `npm run build` + zero-to-hero grep.
- [ ] **Step 5:** Commit `feat(learn): add NVD/KEV/EPSS/OTX source deep-dives`

---

### Task 8: Pathways + glossary touch-up + final gate

**Files:**
- Modify: `docs/how-briefr-works/pathways.mdx` — ensure Analyst path still valid; add Sources as optional after Enrich if useful (one line max)
- Modify: `docs/how-briefr-works/glossary.mdx` — add missing terms if chapters introduced them without definitions (e.g. Sigma, Hunt pack) — only if used; keep alphabetical
- No DNS / landing redesign

- [ ] **Step 1:** Pathways/glossary small edits if needed.
- [ ] **Step 2:** Final `npm run typecheck && npm run build` and `rg -n -i 'zero to hero' docs/how-briefr-works src/components/learn; test $? -eq 1`
- [ ] **Step 3:** Confirm no remaining `Outline — Phase 2` notes under `intel-lifecycle/` (except none).
- [ ] **Step 4:** Commit `docs(learn): pathways/glossary touch-up after Track A fill` (skip commit if no file changes beyond verification — still report checkpoint).
- [ ] **Step 5: CHECKPOINT** — report: six spine chapters complete, four sources, build status. Phase 3 (Track B fill) remains separate.

---

## Self-review

- Spec Phase 2 ("Full intel-lifecycle + priority source deep-dives") → Tasks 1–7; checkpoint → Task 8.
- Collect already complete in Phase 1 — not rewritten unless linking Sources.
- No placeholders for required claims; each task names source docs.
- Follow-on Phase 3: remaining how-it's-built chapters (ingestion-scheduler, storage, api-auth, background-jobs, search-embeddings, webhooks-ops).
