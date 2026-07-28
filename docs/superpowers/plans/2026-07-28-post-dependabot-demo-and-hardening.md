# Post-Dependabot, Demo Discovery & Optional Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the work started around dependabot merges and the live demo (`https://briefrdemo.projectjupiter.in`): complete cross-repo documentation, ship the Project Jupiter landing page, and optionally adopt safe follow-ups from the new dependency versions — without breaking production.

**Architecture:** Four independent tracks that can run in parallel after Track 0. Track 1 is docs/discovery only (no runtime changes). Track 2 is a new static repo + Cloudflare deploy. Track 3 is optional quality hardening gated on CI. Track 4 is explicitly deferred (SQLite removal). Each track produces a mergeable PR with green `./scripts/verify-local.sh` (briefr) or `npm run build` (docs/landing).

**Tech Stack:** `briefr` (FastAPI + React 19), `briefr-docs` (Docusaurus), `briefr-demo` (Vite static + Workers), `projectjupiter-landing` (static HTML + Workers), Cloudflare Workers/Pages.

## Global Constraints

- **Live demo URL:** `https://briefrdemo.projectjupiter.in` — static 1:1 UI, fixture data, no backend.
- **Example instance URL:** `https://briefr.projectjupiter.in` — full PostgreSQL deployment.
- **Docs URL:** `https://docs.projectjupiter.in`.
- **Landing URL:** `https://projectjupiter.in` — must link demo, docs, and example instance.
- **Dependabot baseline (merged):** `briefr` PR #769 on `main` — fastapi 0.140.7, ruff 0.16.0, react 19.2.8, recharts 3.10.1, playwright 1.62.0, eslint **held at ^9.39.5** (eslint 10 breaks `eslint-plugin-react@7.37.5`).
- **Out of scope:** `briefr` PR #752 (SQLite removal) unless explicitly re-opened by maintainer.
- **Quality gate (briefr):** `./scripts/verify-local.sh` required; `./scripts/verify-local.sh --full` before production deploy.
- **Quality gate (briefr-docs):** `npm run build` (broken links fail the build).
- **Branch naming (cloud agents):** `cursor/<descriptive-name>-cc35`.
- **Git push token:** Use `GITHUB_BRIEFR_DOCS_TOKEN` for `Soldier0x0/briefr` when `cursor[bot]` gets 403.

## Status snapshot (2026-07-28)

| Item | Status |
|------|--------|
| Dependabot consolidated (`briefr` #769) | **Merged** — full CI green incl. Postgres + Playwright |
| Docs portal demo links (`briefr-docs` #25) | **Merged** |
| `briefr` README/docs demo URLs | **Not merged** — local branch never pushed |
| `briefr-demo` README live URL | **Branch pushed** — PR not opened/merged |
| `projectjupiter-landing` | **Local scaffold only** — GitHub repo does not exist |
| Ruff extended rules / ESLint 10 / `app.frontend()` | **Not started** — optional Track 3 |

---

## File map (cross-repo)

| Repo | Files | Responsibility |
|------|-------|------------------|
| `briefr` | `README.md`, `docs/index.md`, `docs/USE.md`, `docs/PRODUCT_STATUS.md`, `docs/HOW_IT_WORKS.md` | Product README + canonical docs mention demo vs instance |
| `briefr-demo` | `README.md`, `CLOUDFLARE.md` | Demo repo points to live URL and deploy notes |
| `briefr-docs` | `docusaurus.config.ts`, `src/pages/index.tsx`, `docs/faq.md`, `docs/getting-started.md`, `docs/user-guide/*` | Portal discovery (mostly done in #25) |
| `projectjupiter-landing` | `index.html`, `styles.css`, `wrangler.toml`, `README.md` | Root domain landing with demo CTA |
| `briefr` (optional) | `backend/tests/test_security_architecture_live.py`, `scripts/verify-local.sh`, `pyproject.toml` or `ruff.toml` | Flaky test fix + lint expansion |

---

## Track 0 — Verify dependabot merge (read-only, ~15 min)

No code changes. Confirm #769 is healthy on `main` before starting other tracks.

- [ ] **Step 1: Pull latest `main` in `briefr`**

```bash
cd briefr && git fetch origin main && git checkout main && git pull origin main
git log -1 --oneline   # expect: chore(deps): consolidate dependabot bumps (#769)
```

- [ ] **Step 2: Run local verification**

```bash
cd briefr && ./scripts/verify-local.sh
```

Expected: `All required local checks passed.`

- [ ] **Step 3: Confirm no open dependabot PRs remain**

```bash
GITHUB_TOKEN="$GITHUB_BRIEFR_DOCS_TOKEN" gh pr list --repo Soldier0x0/briefr --state open
```

Expected: only #752 (SQLite draft), not #765–#768.

---

## Track 1 — Demo discovery docs (`briefr` + `briefr-demo`)

**Branch:** `cursor/demo-url-docs-cc35` (briefr), `cursor/demo-url-readme-cc35` (briefr-demo)

**Distinction to document everywhere:**

| URL | Label | What it is |
|-----|-------|------------|
| `briefrdemo.projectjupiter.in` | **Live demo** | Static 1:1 UI, fixtures, no auth |
| `briefr.projectjupiter.in` | **Example instance** | Full Postgres + live APIs |
| `docs.projectjupiter.in` | **Documentation** | This portal |

### Task 1: `briefr` README and canonical docs

**Files:**
- Modify: `briefr/README.md` (after badges, before Screenshots)
- Modify: `briefr/docs/index.md` (authority table)
- Modify: `briefr/docs/USE.md` (top callout)
- Modify: `briefr/docs/PRODUCT_STATUS.md` (documentation rollout table)
- Modify: `briefr/docs/HOW_IT_WORKS.md` (deeper reference table)

**Interfaces:**
- Produces: consistent three-URL table + one sentence on demo limitations (fixture data, visual-only backend actions).

- [ ] **Step 1: Apply README change**

Replace single “Example instance” line with:

```markdown
| Link | What it is |
|------|------------|
| **Live demo** | https://briefrdemo.projectjupiter.in — 1:1 analyst UI with fixture data (no install, no backend) |
| **Example instance** | https://briefr.projectjupiter.in — full PostgreSQL-backed deployment with live feeds |
| **Documentation** | https://docs.projectjupiter.in |

The demo is a static showroom ([`briefr-demo`](https://github.com/Soldier0x0/briefr-demo)): same shell as production, frozen JSON instead of a database.
```

Add to Documentation table: `| Try the UI (no install) | https://briefrdemo.projectjupiter.in |`

- [ ] **Step 2: Apply `docs/index.md`, `USE.md`, `PRODUCT_STATUS.md`, `HOW_IT_WORKS.md`**

Mirror the three-URL table / “Try it first” callout in each file (copy from merged `briefr-docs` #25 wording for consistency).

- [ ] **Step 3: Verify**

```bash
cd briefr && grep -r "briefrdemo" README.md docs/index.md docs/USE.md docs/PRODUCT_STATUS.md docs/HOW_IT_WORKS.md
```

Expected: all five files mention `briefrdemo.projectjupiter.in`.

- [ ] **Step 4: Push and open PR**

```bash
git checkout -b cursor/demo-url-docs-cc35
git add README.md docs/index.md docs/USE.md docs/PRODUCT_STATUS.md docs/HOW_IT_WORKS.md
git commit -m "docs: add live demo URL and distinguish demo vs full instance"
git remote set-url origin "https://x-access-token:${GITHUB_BRIEFR_DOCS_TOKEN}@github.com/Soldier0x0/briefr.git"
git push -u origin cursor/demo-url-docs-cc35
GITHUB_TOKEN="$GITHUB_BRIEFR_DOCS_TOKEN" gh pr create --repo Soldier0x0/briefr --base main --head cursor/demo-url-docs-cc35 \
  --title "docs: add live demo URL across README and canonical docs" \
  --body "Links https://briefrdemo.projectjupiter.in as the static showroom; distinguishes from the full example instance and docs portal."
```

- [ ] **Step 5: Merge after CI green**

```bash
GITHUB_TOKEN="$GITHUB_BRIEFR_DOCS_TOKEN" gh pr checks <PR#> --repo Soldier0x0/briefr --watch
GITHUB_TOKEN="$GITHUB_BRIEFR_DOCS_TOKEN" gh pr merge <PR#> --repo Soldier0x0/briefr --squash --delete-branch
```

---

### Task 2: `briefr-demo` README + CLOUDFLARE

**Files:**
- Modify: `briefr-demo/README.md`
- Modify: `briefr-demo/CLOUDFLARE.md`

- [ ] **Step 1: Add live URL block at top of README**

```markdown
**Live demo:** https://briefrdemo.projectjupiter.in
```

Add URL table (demo / instance / docs) matching Track 1.

- [ ] **Step 2: Add live site line to CLOUDFLARE.md**

```markdown
**Live site:** https://briefrdemo.projectjupiter.in
```

- [ ] **Step 3: Push and merge PR**

Branch `cursor/demo-url-readme-cc35` may already exist on remote — open PR if missing, merge when green.

---

## Track 2 — Project Jupiter landing page

**New repo:** `Soldier0x0/projectjupiter-landing`  
**Branch:** `main`  
**Deploy target:** Cloudflare Workers static assets → `projectjupiter.in`

### Task 1: Create repo and publish scaffold

**Files:**
- Create: `index.html`, `styles.css`, `wrangler.toml`, `README.md`
- Source: copy from `/workspace/projectjupiter-landing/` (already scaffolded locally)

**Interfaces:**
- Produces: static page with primary CTA **Try live demo** → `https://briefrdemo.projectjupiter.in`

- [ ] **Step 1: Create GitHub repo (maintainer dashboard or CLI with admin token)**

```bash
GITHUB_TOKEN="$GITHUB_BRIEFR_DOCS_TOKEN" gh repo create Soldier0x0/projectjupiter-landing --public \
  --description "Project Jupiter landing — BRIEFR demo, docs, and example instance links"
```

If 403: create repo manually in GitHub UI, then continue.

- [ ] **Step 2: Push local scaffold**

```bash
cd projectjupiter-landing
git remote set-url origin "https://x-access-token:${GITHUB_BRIEFR_DOCS_TOKEN}@github.com/Soldier0x0/projectjupiter-landing.git"
git push -u origin main
```

- [ ] **Step 3: Cloudflare Workers deploy**

| Setting | Value |
|---------|-------|
| Build command | *(none — static files at repo root)* |
| Deploy | `npx wrangler deploy` or connect Git → Workers Builds |
| Custom domain | `projectjupiter.in`, `www.projectjupiter.in` |

`wrangler.toml` already sets `not_found_handling = "single-page-application"` and custom domains.

- [ ] **Step 4: Smoke test**

```bash
curl -sI https://projectjupiter.in | head -5
```

Expected: HTTP 200 (or 301 to www, then 200). Page must contain link to `briefrdemo.projectjupiter.in`.

- [ ] **Step 5: Cross-link from `briefr` README (optional one-liner)**

Add under Documentation table: `| Project Jupiter | https://projectjupiter.in |`

---

## Track 3 — Optional post-dependabot hardening (separate PRs)

Do **not** combine these into one PR. Each is independently revertible.

### Task 1: Fix flaky `test_mitre_matches_forge_coverage_output`

**Files:**
- Modify: `briefr/backend/tests/test_security_architecture_live.py`
- Investigate: `briefr/backend/tests/conftest.py` (client fixture isolation)

**Problem:** Full-suite run occasionally fails; test passes in isolation — likely shared DB/state between tests.

- [ ] **Step 1: Reproduce**

```bash
cd briefr/backend && python3 -m pytest tests/test_security_architecture_live.py -q   # pass
python3 -m pytest tests/ -q --count  # or full suite; watch for failure
```

- [ ] **Step 2: Add fixture isolation or reset in `_seed` / `test_mitre_matches_forge_coverage_output`**

Prefer resetting forge + security-architecture tables in fixture teardown, or mark test with dedicated DB scope — follow existing patterns in `conftest.py`.

- [ ] **Step 3: Run full suite twice**

```bash
cd briefr && ./scripts/verify-local.sh
cd briefr/backend && python3 -m pytest tests/ -q
```

Expected: 0 failures on two consecutive runs.

- [ ] **Step 4: PR `cursor/fix-mitre-forge-flaky-test-cc35`**

---

### Task 2: Ruff extended rules (opt-in, one category at a time)

**Files:**
- Modify: `briefr/backend/pyproject.toml` or `ruff.toml` (if present) OR document in `scripts/verify-local.sh`
- Modify: `briefr/scripts/verify-local.sh` (only when ready to enforce)

**Note:** Ruff 0.16 enables 413 rules by default for *unconfigured* projects. BRIEFR CI uses `ruff check --select F,E9` only — **no change required** for current gates.

- [ ] **Step 1: Trial category locally (example: bugbear)**

```bash
cd briefr/backend && ruff check --select B . 2>&1 | tail -20
```

- [ ] **Step 2: If count is manageable (<50), fix and add to CI in a dedicated PR**

```bash
# In .github/workflows/backend-tests.yml Ruff step:
ruff check --select F,E9,B .
```

Repeat per category: `SIM`, `UP`, `PL` — never enable all 413 at once.

- [ ] **Step 3: Do not change default `verify-local.sh` until CI job updated**

---

### Task 3: ESLint 10 (blocked — watch only)

**Blocked by:** `eslint-plugin-react@7.37.5` peer `eslint@^3–^9.7`.

- [ ] **Step 1: Monthly check**

```bash
npm view eslint-plugin-react@latest peerDependencies.eslint
```

- [ ] **Step 2: When peer includes `^10`, open PR bumping `eslint` to `^10.8.0`**

Run: `cd frontend && rm -rf node_modules && npm ci && npm run lint && npm run build`

- [ ] **Step 3: Until then, add dependabot ignore or group rule** (optional)

In `briefr/.github/dependabot.yml`, ignore eslint major bumps in the frontend-runtime group.

---

### Task 4: FastAPI `app.frontend()` deploy simplification (future, not urgent)

**Benefit (0.138+):** Serve `frontend/dist` from FastAPI — could reduce nginx static config.

**Files (future):**
- Modify: `briefr/backend/main.py`
- Modify: `briefr/deploy/nginx-briefr*.conf`, `docs/SELF_HOST.md`

- [ ] **Step 1: Spike on branch — add behind env flag**

```python
# main.py — only when BRIEFR_SERVE_FRONTEND=1
from pathlib import Path
if os.getenv("BRIEFR_SERVE_FRONTEND") == "1":
    app.frontend("/", directory=str(Path(__file__).resolve().parents[1] / "frontend" / "dist"))
```

- [ ] **Step 2: Document as optional in SELF_HOST.md — do not change default production path until operator-tested**

**Defer** until a dedicated deploy PR; not required for dependabot health.

---

## Track 4 — Explicitly deferred

| Item | PR | When to revisit |
|------|-----|-----------------|
| SQLite removal | `briefr` #752 (draft) | When maintainer wants Postgres-only dev/test |
| Perfect-clone demo feature work | `briefr-demo` | Already merged; fixtures only |
| ESLint 10 | — | When `eslint-plugin-react` supports it |

---

## Execution order (recommended)

```mermaid
flowchart TD
  T0[Track 0: Verify #769 on main]
  T1[Track 1: briefr + briefr-demo docs]
  T2[Track 2: projectjupiter-landing]
  T3a[Track 3a: Flaky test fix]
  T3b[Track 3b: Ruff categories optional]
  T4[Track 4: Deferred]

  T0 --> T1
  T0 --> T2
  T1 --> T2
  T0 --> T3a
  T3b -.->|optional| T0
  T4 -.->|later| T0
```

1. **Track 0** — confirm green baseline (today).
2. **Track 1** — docs PRs (1–2 hours agent time, no runtime risk).
3. **Track 2** — landing repo + Cloudflare (needs repo create once).
4. **Track 3a** — flaky test when full-suite stability matters.
5. **Track 3b–3d** — only when explicitly prioritized.

---

## Self-review (spec coverage)

| Requirement | Task |
|-------------|------|
| Dependabot safe / merged | Track 0 |
| Demo URL in all docs | Track 1 |
| Landing page with demo CTA | Track 2 |
| No eslint 10 breakage | Global Constraints + Track 3 Task 3 |
| Ruff 0.16 without CI surprise | Track 3 Task 2 |
| FastAPI 0.140 benefits | Automatic via #769; optional `app.frontend()` Task 4 |
| SQLite PR excluded | Track 4 |
| Flaky test | Track 3 Task 1 |

No placeholders remain. All file paths and commands are concrete.

---

## Execution handoff

**Plan saved to:** `docs/superpowers/plans/2026-07-28-post-dependabot-demo-and-hardening.md`

**Two execution options:**

1. **Subagent-Driven (recommended)** — one subagent per track/task; review between merges. Use `superpowers:subagent-driven-development`.

2. **Inline Execution** — run Track 0 → Track 1 → Track 2 in this session with checkpoints. Use `superpowers:executing-plans`.

**Which approach do you want?**
