# BRIEFR Docs Portal Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every DRAFT page with real content, add real product screenshots with a drop-in replacement pipeline, automate sync + deploy, and be one switch-flip from public.

**Architecture:** Two repos. `briefr-main` stays canonical for migrated docs and all images; `briefr-docs` (Docusaurus 3.10) pulls via `scripts/migrate.cjs` and owns portal-native pages (security-guide, integrations, release-notes, roadmap, faq, landing). Workflows live in briefr-docs.

**Tech Stack:** Docusaurus 3.10 (Rspack), Node 24, GitHub Actions, Playwright MCP for capture/verification.

## Global Constraints

- Voice: plain verbs, audience-first, zero commercial/marketing framing (spec; roadmap precedent)
- Palette/type: product tokens only — orange #e85533, warm neutrals, DM Serif Display / DM Sans / IBM Plex Mono
- `onBrokenLinks: 'throw'` stays; every task ends with a green `npm run build`
- Canonical docs and images change ONLY via briefr-main branch + PR (project docs rule)
- Screenshot filenames are permanent API: `ui-feed-tab.png`, `ui-brief-tab.png`, `ui-detail-drawer.png`, `ui-ioc-lookup.png`, `ui-admin-security.png`
- Phase 4 (anything that makes the repo/site public) is a HARD GATE: explicit user instruction required
- Windows/Git Bash: absolute paths always; briefr-main = `/c/Users/harsh/Documents/briefr-main`, briefr-docs = `/c/Users/harsh/Documents/briefr-docs`
- Commits end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

## Phase 1 — Baseline refresh

### Task 1: Sync portal to latest canonical docs

**Files:**
- Modify (generated): `briefr-docs/docs/**` (migrated pages)

**Interfaces:**
- Produces: portal content equal to briefr-main branch `fix/docs-assets-and-portal-support` merged with `origin/main` (the fix branch holds the SVG repairs — PR #683 — which plain `origin/main` still lacks; migrating from plain main would resurrect the corrupt SVGs).

- [ ] **Step 1: Update the briefr-main working branch**

```bash
cd /c/Users/harsh/Documents/briefr-main
git status --short            # must be clean; stash if not
git fetch origin
git checkout fix/docs-assets-and-portal-support
git merge --no-edit origin/main
git push
```
Expected: merge commits cleanly (docs drift is HANDOVER/sprint files only).

- [ ] **Step 2: Re-migrate and build**

```bash
cd /c/Users/harsh/Documents/briefr-docs
node scripts/migrate.cjs
npm run build
```
Expected: `[SUCCESS] Generated static files in "build".`, zero broken-link output.

- [ ] **Step 3: Commit if content changed**

```bash
cd /c/Users/harsh/Documents/briefr-docs
git add docs && git diff --cached --quiet || git commit -m "sync: refresh migrated docs from briefr-main (origin/main merge)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push
```

- [ ] **Step 4: CHECKPOINT 1 — report** build status + what changed to the user; continue.

---

## Phase 2 — Content

### Task 2: Security Guide (real content)

**Files:**
- Modify: `briefr-docs/docs/security-guide.md` (replace DRAFT stub entirely)
- Read first: `briefr-main/docs/decisions/ADR-006-encrypted-app-settings-secrets.md`, `briefr-main/docs/SYSTEM_DESIGN.md` (auth/session + logging sections), `briefr-main/docs/SELF_HOST.md` (proxy/TLS), `briefr-main/backend/` auth router for session cookie facts

**Interfaces:**
- Produces: page at `/docs/security-guide`, no DRAFT admonition, sections exactly: Threat model · Authentication and sessions · Secret handling · Network exposure · Hardening checklist · Reporting a vulnerability

- [ ] **Step 1: Read the four sources above; collect facts** (cookie name `briefr_at`, session lifetime, encrypted-at-rest app settings per ADR-006, log redaction covers `extra` fields matching `*_KEY/_TOKEN/_SECRET/_PASSWORD` and NOT message strings, recommended nginx/tunnel topology, ports that must stay loopback-only). Every claim in the page must trace to a source file — no invented behavior.
- [ ] **Step 2: Write the page.** Front matter unchanged (`sidebar_position: 4`). Remove the `:::note[Draft]` block. Hardening checklist is an ordered list of ≤8 one-line items, each actionable ("Bind Postgres to 127.0.0.1", not "secure your database"). Reporting section keeps the GitHub Security Advisories link.
- [ ] **Step 3: Verify** — `npm run build` green; preview page in browser at 1440 and 375 (read_page: sections present, no DRAFT).
- [ ] **Step 4: Commit** `docs(security): replace DRAFT with sourced security guide`.

### Task 3: Integrations (real content)

**Files:**
- Modify: `briefr-docs/docs/integrations.md` (replace DRAFT stub entirely)
- Read first: `briefr-main/docs/SYSTEM_DESIGN.md` external-services table (~line 500) and scheduler jobs section

**Interfaces:**
- Produces: page at `/docs/integrations`; per-provider H3 sections under "Feeds in" (NVD, CISA KEV, EPSS, OTX, VirusTotal, AbuseIPDB, GreyNoise, VulnCheck KEV, ThreatFox) each stating: what it adds, env var, quota reality, failure behavior (verbatim-faithful to SYSTEM_DESIGN); "Alerts out" covers webhooks; closing note names SYSTEM_DESIGN as source of truth.

- [ ] **Step 1: Extract the provider table facts** from SYSTEM_DESIGN (do not invent quotas; if the table lacks a value, write "no key required" / omit).
- [ ] **Step 2: Write the page**; keys-in-admin-UI paragraph stays, links to security-guide for storage details.
- [ ] **Step 3: Verify** build + browser (all provider H3s in TOC).
- [ ] **Step 4: Commit** `docs(integrations): replace DRAFT with per-provider reference`.

### Task 4: Release Notes (policy + first entry)

**Files:**
- Modify: `briefr-docs/docs/release-notes.md`

**Interfaces:**
- Produces: page with policy line ("entries begin with the first tagged release; this pre-release entry summarizes current capability") + one "Pre-release (2026-07)" H2 summarizing: CVE feed + enrichment pipeline, stack-ranked scoring, detection/forge features, admin console, Postgres-native storage. Source: `briefr-main/docs/PRODUCT_STATUS.md` — read it first; claims must match.

- [ ] **Step 1: Read PRODUCT_STATUS.md**, list shipped capabilities.
- [ ] **Step 2: Write page** (≤40 lines, plain language, no version-number bookkeeping).
- [ ] **Step 3: Verify + commit** `docs(releases): pre-release summary + policy`.

### Task 5: Screenshot pipeline (code + docs)

**Files:**
- Modify: `briefr-docs/scripts/migrate.cjs` (asset mirror)
- Create: `briefr-main/docs/assets/screenshots/README.md` (on the fix branch)

**Interfaces:**
- Produces: migrate.cjs mirrors `docs/assets/*.{svg,png,webp}` AND `docs/assets/screenshots/*.{png,webp}` into `user-guide/assets/(screenshots/)` + `admin-guide/assets/(screenshots/)`; README documents the five stable names + capture setup (1440×900, dark theme, seeded data).

- [ ] **Step 1: Extend migrate.cjs.** Replace the `.svg`-only filter:

```js
const ASSET_RE = /\.(svg|png|webp)$/i;
const svgs = fs.readdirSync(path.join(SRC, 'assets')).filter((f) => ASSET_RE.test(f));
// after the existing per-dir loop, mirror screenshots/ if it exists:
const shotSrc = path.join(SRC, 'assets', 'screenshots');
if (fs.existsSync(shotSrc)) {
  const shots = fs.readdirSync(shotSrc).filter((f) => ASSET_RE.test(f));
  for (const dir of ASSET_DEST_DIRS) {
    fs.mkdirSync(path.join(DST, dir, 'screenshots'), {recursive: true});
    for (const f of shots) {
      fs.copyFileSync(path.join(shotSrc, f), path.join(DST, dir, 'screenshots', f));
    }
  }
  console.log(`assets/screenshots/* -> {user,admin}-guide/assets/screenshots/ (${shots.length} files)`);
}
```

- [ ] **Step 2: Write the screenshots README** in briefr-main listing each stable filename → required content (from IMAGE_BRIEFS §1.1–1.5) → capture setup. State the replacement procedure: "drop a same-named file here, run `node scripts/migrate.cjs` in briefr-docs — nothing else."
- [ ] **Step 3: Run migrate (no screenshots yet — must not error), build, commit both repos.**

### Task 6: Capture the five screenshots

**Files:**
- Create: `briefr-main/docs/assets/screenshots/ui-{feed-tab,brief-tab,detail-drawer,ioc-lookup,admin-security}.png`
- Read first: `briefr-main/docs/IMAGE_BRIEFS.md` §1.1–1.5 (what each shot must show)

**Interfaces:**
- Consumes: Task 5's mirror + README.

- [ ] **Step 1: Start the app** via preview_start (`backend` then `frontend` launch entries). Before login: seed ≥10 CVEs or quiet the scheduler (known SQLite login lock — check `backend/scripts/` for a seed helper first; if none, run one NVD sync via the admin UI after a scheduler-quiet start).
- [ ] **Step 2: Ask the user to log in** (browser logins are the user's job — guardrail). Hard stop until done.
- [ ] **Step 3: Capture** each screen at 1440×900 dark via Playwright `browser_take_screenshot` per IMAGE_BRIEFS; save under the stable names. Redact nothing manually — admin-security shot must show masked keys only (verify no plaintext secrets visible before saving).
- [ ] **Step 4: Run migrate, verify the five files mirror; commit briefr-main branch + push.**

### Task 7: Embed screenshots in the User Guide (canonical)

**Files:**
- Modify: `briefr-main/docs/USE.md` (fix branch) — replace the IMAGE_BRIEFS placeholder image links (`![...](assets/placeholder-diagram.svg)` + `IMAGE_BRIEFS.md#11...` caption lines) with `![...](assets/screenshots/ui-<name>.png)` at the five planned spots
- Modify (generated): portal `user-guide/using-briefr.md` via migrate

**Interfaces:**
- Consumes: Task 6 files; stable names only.

- [ ] **Step 1: Edit USE.md** — five image swaps, captions kept, no other prose changes.
- [ ] **Step 2: Migrate + build + browser-verify** screenshots render on `/docs/user-guide/using-briefr` (hairline border presentation: add `.markdown img { border: 1px solid var(--brf-hairline); }` to custom.css if absent).
- [ ] **Step 3: Commit + push briefr-main branch** (rides PR #683 or successor PR), commit portal.
- [ ] **Step 4: CHECKPOINT 2 — report:** zero DRAFT badges (`grep -r "Draft" docs/` in briefr-docs returns only release-notes policy wording if any), screenshots visible, build green.

---

## Phase 3 — Automation

### Task 8: Deploy workflow (CI now, Pages later)

**Files:**
- Create: `briefr-docs/.github/workflows/deploy.yml`

```yaml
name: build-and-deploy
on:
  push: {branches: [main]}
  workflow_dispatch: {}
permissions: {contents: read, pages: write, id-token: write}
concurrency: {group: pages, cancel-in-progress: true}
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: 22, cache: npm}
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: {path: build}
  deploy:
    needs: build
    if: github.event.repository.visibility == 'public'
    runs-on: ubuntu-latest
    environment: {name: github-pages, url: ${{ steps.deployment.outputs.page_url }}}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 1: Write the file exactly as above; commit + push.**
- [ ] **Step 2: Verify** `gh run watch` (background task) → build job green; deploy job skipped (private). Note: migrate.cjs is NOT run in CI build — docs are committed, not generated at deploy time; sync is Task 9's job.

### Task 9: Sync workflow (needs user PAT)

**Files:**
- Create: `briefr-docs/.github/workflows/sync.yml`

```yaml
name: sync-canonical-docs
on:
  schedule: [{cron: '0 6 * * 1'}]
  workflow_dispatch: {}
permissions: {contents: write}
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/checkout@v4
        with:
          repository: Soldier0x0/briefr
          token: ${{ secrets.BRIEFR_MAIN_READ_TOKEN }}
          path: briefr-main-src
      - uses: actions/setup-node@v4
        with: {node-version: 22, cache: npm}
      - run: npm ci
      - run: node scripts/migrate.cjs
        env: {BRIEFR_MAIN_DOCS: '${{ github.workspace }}/briefr-main-src/docs'}
      - run: npm run build
      - name: Commit if changed
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add docs
          git diff --cached --quiet || git commit -m "sync: refresh migrated docs from briefr-main" && git push
```

- [ ] **Step 1: Make migrate.cjs honor `BRIEFR_MAIN_DOCS` env override** for SRC (one line: `const SRC = process.env.BRIEFR_MAIN_DOCS || path.resolve(__dirname, '../../briefr-main/docs');`).
- [ ] **Step 2: Commit both files; push.**
- [ ] **Step 3: CHECKPOINT 3 — ask the user** to create a fine-grained PAT (repo: Soldier0x0/briefr, contents: read) and add it as secret `BRIEFR_MAIN_READ_TOKEN` in briefr-docs → then `gh workflow run sync-canonical-docs` and verify green. Until the secret exists, sync stays manual (one command) — not a blocker for Phase 4 readiness.

---

## Phase 4 — Ship (HARD GATE)

### Task 10: Go public (ONLY on explicit user instruction)

- [ ] **Step 1: Confirm the user says "go public" in this or a future session.** No inference.
- [ ] **Step 2:** `gh repo edit Soldier0x0/briefr-docs --visibility public`, enable Pages (Actions source): `gh api repos/Soldier0x0/briefr-docs/pages -X POST -f build_type=workflow` (fallback: Settings UI).
- [ ] **Step 3:** `gh workflow run build-and-deploy`; verify live at `https://soldier0x0.github.io/briefr-docs/` (WebFetch title check + browser screenshot).
- [ ] **Step 4:** Social card: add `image: img/social-card.png` to themeConfig with a generated 1200×630 card in portal identity; commit.
- [ ] **Step 5: Final report** with live URL.

## Self-review notes

- Spec coverage: Phase 1→Task 1; Security→T2; Integrations→T3; Release Notes→T4; image pipeline→T5; screenshots→T6–7; sync/deploy→T8–9; ship→T10. FAQ intentionally untouched (spec lists it nowhere in Phase 2). ✓
- No placeholders; all code/config shown verbatim. ✓
- Names consistent: `BRIEFR_MAIN_READ_TOKEN`, `BRIEFR_MAIN_DOCS`, stable screenshot names identical across T5/T6/T7. ✓
