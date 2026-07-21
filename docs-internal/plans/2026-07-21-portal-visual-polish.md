# BRIEFR docs portal — visual polish & responsiveness implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `briefr-docs` portal more beautiful and more responsive by adding a scoped shadcn/ui component layer on the React surfaces we own and moving responsive/typography wins into the token/CSS layer — with zero changes to doc content or the `briefr` product repo.

**Architecture:** Tailwind v4 is wired into Docusaurus via a `configurePostCss` plugin importing only Tailwind's `theme`+`utilities` layers (preflight disabled so it never resets Infima). shadcn semantic tokens are bridged to the existing `--brf-*` product tokens. shadcn primitives (`button`, `card`, `badge`, `separator`) are used on the landing page and swizzled `DocCard`; site-wide responsive/type improvements live in `custom.css` so migrated Markdown benefits without content edits.

**Tech Stack:** Docusaurus 3.10.2, React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/postcss`), shadcn/ui (base=radix, lucide icons), `class-variance-authority`, `tailwind-merge`, Playwright (visual gate).

## Global Constraints

- Node `>=20` (repo `engines`); use `npm` (package-lock present).
- Docusaurus stays on `3.10.2`; do NOT upgrade it as part of this work.
- `onBrokenLinks: 'throw'` must stay green on every `npm run build`.
- Do NOT edit any file under `docs/` that is produced by `scripts/migrate.cjs` (the 9 migrated guides + assets) — they are canonical and synced from `briefr`. Content wins live only in `src/css/custom.css`.
- Do NOT convert migrated `.md` to `.mdx`; keep `markdown.format: 'detect'`.
- Do NOT modify the `briefr` / `briefr-main` repo.
- Preserve identity: `--brf-*` tokens, DM Serif Display / DM Sans / IBM Plex Mono, orange `#e85533`, severity spine, mono kickers, hairline borders. Dark-only.
- Keep `baseUrl: '/briefr-docs/'`, `trailingSlash: false`.
- Tailwind **preflight must never be imported** (only `theme` + `utilities` layers).
- New components use bridged semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`, …) — no raw hex.
- Respect `prefers-reduced-motion` (existing global rule stays).
- Plans/specs live under `docs-internal/` (never the published `docs/`).
- **Decision D1 gate:** this plan implements Option A (scoped shadcn runtime) from `docs-internal/specs/2026-07-21-portal-visual-polish-design.md`. Confirm D1 before starting Task 2. If the maintainer picks Option B (reference-only, no Tailwind), Tasks 2–5 become "implement the same patterns in CSS Modules" and Tasks 1/6/7 are unchanged.

---

### Task 1: Baseline visual harness

**Files:**
- Create: `scripts/shoot.mjs`
- Modify: `package.json` (add `shoot` script + `playwright` devDep)
- Modify: `.gitignore` (ignore `.artifacts`)

**Interfaces:**
- Produces: `npm run shoot` → writes full-page PNGs to `.artifacts/<LABEL>/<width><route>.png` for routes `/`, `/docs/user-guide`, `/docs/api-reference`, `/docs/user-guide/using-briefr` at widths 390/768/1440. Consumed as the responsive gate in every later task.

- [ ] **Step 1: Add Playwright and the script**

Run: `npm i -D playwright@^1.61.1 && npx playwright install chromium`

Create `scripts/shoot.mjs`:

```js
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000/briefr-docs';
const ROUTES = ['/', '/docs/user-guide', '/docs/api-reference', '/docs/user-guide/using-briefr'];
const WIDTHS = [390, 768, 1440];
const LABEL = process.env.LABEL || 'after';

const outDir = `.artifacts/${LABEL}`;
mkdirSync(outDir, {recursive: true});
const browser = await chromium.launch();
for (const width of WIDTHS) {
  const page = await browser.newPage({viewport: {width, height: 900}});
  for (const route of ROUTES) {
    await page.goto(BASE + route, {waitUntil: 'networkidle'});
    const name = route.replace(/\//g, '_') || '_home';
    await page.screenshot({path: `${outDir}/${width}${name}.png`, fullPage: true});
  }
  await page.close();
}
await browser.close();
console.log(`screenshots → ${outDir}`);
```

Add to `package.json` `scripts`: `"shoot": "node scripts/shoot.mjs"`. Add `.artifacts` on its own line in `.gitignore`.

- [ ] **Step 2: Capture the BEFORE baseline**

Run:
```bash
npm run build
npm run serve -- --port 3000 --host 127.0.0.1 &
sleep 5
LABEL=before npm run shoot
```
Expected: 12 PNGs under `.artifacts/before/`. Keep this server running or restart per task. (Do not commit `.artifacts`.)

- [ ] **Step 3: Commit**

```bash
git add scripts/shoot.mjs package.json package-lock.json .gitignore
git commit -m "chore(docs): add Playwright responsive screenshot harness"
```

---

### Task 2: Tailwind v4 + shadcn foundation (scoped, preflight off)

**Files:**
- Create: `src/css/tailwind.css`
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Modify: `docusaurus.config.ts` (inline plugin + `customCss`)
- Modify: `tsconfig.json` (`@/*` path)
- Create (temporary): `src/pages/probe.tsx` (removed in Step 6)

**Interfaces:**
- Produces: `cn(...inputs)` from `@/lib/utils`; a working `@/*` → `src/*` import + webpack alias; Tailwind utility classes and bridged tokens (`bg-card`, `text-primary`, `border-border`, `rounded-md`, `ring-ring`). Consumed by Tasks 3–5.

- [ ] **Step 1: Install runtime deps**

Run: `npm i tailwindcss@^4 @tailwindcss/postcss@^4 tailwind-merge class-variance-authority lucide-react` (clsx is already a dependency).

- [ ] **Step 2: Add the Tailwind stylesheet (no preflight) + token bridge**

Create `src/css/tailwind.css`:

```css
/* Tailwind v4 — preflight is intentionally omitted so Tailwind's reset never
   fights Infima. Only the theme + utilities layers are imported. */
@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);

/* shadcn semantic tokens → BRIEFR product tokens (defined in custom.css). */
:root,
[data-theme='dark'] {
  --background: var(--brf-ink);
  --foreground: var(--brf-body);
  --card: var(--brf-surface);
  --card-foreground: var(--brf-body);
  --popover: var(--brf-surface);
  --popover-foreground: var(--brf-body);
  --primary: var(--brf-accent);
  --primary-foreground: #ffffff;
  --secondary: var(--brf-raise);
  --secondary-foreground: var(--brf-bright);
  --muted: var(--brf-raise);
  --muted-foreground: var(--brf-dim);
  --accent: var(--brf-accent-dim);
  --accent-foreground: var(--brf-accent-strong);
  --destructive: var(--sev-crit);
  --border: var(--brf-hairline);
  --input: var(--brf-hairline-2);
  --ring: var(--brf-accent);
  --radius: 0.375rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 2px);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 2px);
  --font-sans: var(--ifm-font-family-base);
  --font-mono: var(--brf-font-mono);
}
```

- [ ] **Step 3: Wire Tailwind + the `@/` alias into Docusaurus**

In `docusaurus.config.ts`, add at the top: `import path from 'path';` then define the plugin and register it plus the stylesheet:

```ts
function briefrTailwindPlugin() {
  return {
    name: 'briefr-tailwind',
    configurePostCss(postcssOptions) {
      postcssOptions.plugins.push(require('@tailwindcss/postcss'));
      return postcssOptions;
    },
    configureWebpack() {
      return {resolve: {alias: {'@': path.resolve(__dirname, 'src')}}};
    },
  };
}
```

Add `plugins: [briefrTailwindPlugin],` to the root config object, and change the preset's `theme.customCss` to load Tailwind after the theme:

```ts
customCss: ['./src/css/custom.css', './src/css/tailwind.css'],
```

- [ ] **Step 4: Config files for shadcn + TS path**

Create `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/css/tailwind.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Create `src/lib/utils.ts`:

```ts
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

In `tsconfig.json`, add inside `compilerOptions`: `"paths": {"@/*": ["./src/*"]}`.

- [ ] **Step 5: Add a probe route and verify Tailwind applies without breaking Infima**

Create `src/pages/probe.tsx`:

```tsx
import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import {cn} from '@/lib/utils';

export default function Probe(): ReactNode {
  return (
    <Layout title="probe">
      <main className={cn('mx-auto max-w-2xl p-8 flex flex-col gap-4')}>
        <div className="rounded-md border border-border bg-card p-6 text-card-foreground">
          <p className="text-primary">primary token</p>
          <p className="text-muted-foreground">muted token</p>
        </div>
      </main>
    </Layout>
  );
}
```

Run:
```bash
npm run build
npm run serve -- --port 3000 --host 127.0.0.1 &
sleep 5
node -e "import('playwright').then(async ({chromium})=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto('http://localhost:3000/briefr-docs/probe',{waitUntil:'networkidle'});await p.screenshot({path:'.artifacts/probe.png'});await b.close();})"
```
Expected: build succeeds (strict links); `.artifacts/probe.png` shows a bordered card with orange "primary token" and dim "muted token" text, and the surrounding Docusaurus navbar/footer look **unchanged** (preflight did not reset them). If the navbar/typography look reset, preflight leaked — re-check Step 2 imports.

- [ ] **Step 6: Remove the probe, rebuild, commit**

Run: `rm src/pages/probe.tsx && npm run build`
Expected: build succeeds.

```bash
git add components.json src/css/tailwind.css src/lib/utils.ts docusaurus.config.ts tsconfig.json package.json package-lock.json
git commit -m "feat(docs): scoped Tailwind v4 + shadcn foundation (preflight off, tokens bridged)"
```

---

### Task 3: shadcn primitives

**Files:**
- Create: `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/separator.tsx`

**Interfaces:**
- Produces: `Button` (variants `default|outline|ghost`, sizes `sm|default|lg`), `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`, `Badge` (variants `default|secondary|outline`), `Separator`. All from `@/components/ui/*`. Consumed by Tasks 4–5.

- [ ] **Step 1: Add the components via the shadcn CLI**

Run: `npx shadcn@latest add button card badge separator`

Expected: files created under `src/components/ui/`. If the CLI cannot resolve paths (Docusaurus is a `Manual` framework), fall back per file: `npx shadcn@latest view @shadcn/button` (then `card`, `badge`, `separator`), copy each component's `content` into `src/components/ui/<name>.tsx`, and ensure imports use `@/lib/utils` and `lucide-react`.

- [ ] **Step 2: Review the added files (shadcn Critical Rules)**

Read each file. Verify: imports resolve to `@/lib/utils`; icon imports are `lucide-react`; no `space-y-*`/`space-x-*`; semantic tokens only (no raw hex). Fix any deviations.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds with no type or link errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui
git commit -m "feat(docs): add shadcn primitives (button, card, badge, separator)"
```

---

### Task 4: Rebuild the landing page on the primitives

**Files:**
- Modify: `src/pages/index.tsx`
- Modify: `src/pages/index.module.css` (trim styles now owned by shadcn; keep hero/spine/dispatch/section classes)

**Interfaces:**
- Consumes: `Card*`, `Badge`, `Button` from `@/components/ui/*`; `cn` from `@/lib/utils`.
- Produces: the `/` route, visually equivalent-or-better and more responsive.

- [ ] **Step 1: Keep the data + hero, swap card markup to shadcn**

Preserve the existing `GUIDES`, `REFERENCE`, `PROJECT` arrays and the entire `<header className={styles.hero}>` block (dispatch strip, masthead, sub, CTAs, `SeveritySpine`). Replace the three card/list bodies. Field-guide card becomes:

```tsx
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';

// inside GUIDES.map(g => ...)
<Card key={g.title} className="@container flex flex-col border-border bg-card transition-transform hover:-translate-y-0.5">
  <CardHeader className="gap-2">
    <Badge variant="outline" className="w-fit font-mono tracking-widest text-primary">{g.tag}</Badge>
    <CardTitle className="font-[var(--brf-font-display)] text-2xl font-normal">
      <Link to={g.to}>{g.title}</Link>
    </CardTitle>
    <CardDescription className="text-[0.94rem] leading-relaxed text-muted-foreground">{g.desc}</CardDescription>
  </CardHeader>
  <CardContent className="mt-auto border-t border-border pt-0">
    <ol className="m-0 flex flex-col list-none p-0">
      {g.chapters.map((c, i) => (
        <li key={c.to} className="border-b border-border last:border-0">
          <Link to={c.to} className="flex items-baseline gap-3.5 py-2.5 text-[0.88rem]">
            <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
            {c.label}
          </Link>
        </li>
      ))}
    </ol>
  </CardContent>
</Card>
```

Convert `REFERENCE` cards to `Card` with a `Badge` tag and the arrow, and `PROJECT` rows to a `Card`-backed list using the same tokens. Use `Button asChild` for the hero CTAs (wrap the existing `Link`s) so primary/ghost variants replace `styles.ctaPrimary`/`styles.ctaGhost` — keep `styles.ctaPlain` for the GitHub link. Use Tailwind grid utilities with container queries for responsiveness: `grid gap-5 grid-cols-1 @3xl:grid-cols-3` on the guide/reference grids.

- [ ] **Step 2: Trim superseded CSS**

In `index.module.css`, delete the rules now provided by shadcn (`.guideCard`, `.cardTag`, `.cardTitle`, `.cardDesc`, `.chapters*`, `.refCard`, `.refTag`, `.refBody`, `.refTitle`, `.refDesc`, `.ctaPrimary`, `.ctaGhost`, `.guideGrid`, `.refGrid`, and their `@media` blocks). Keep `.main`, `.hero`, `.dispatch*`, `.masthead`, `.tick`, `.sub`, `.ctas`, `.ctaPlain`, `.spine*`, `.section*`, `.sectionHead`, `.sectionKicker`, `.sectionRule`, `.rowArrow`, `.draft`, and `@keyframes rise`.

- [ ] **Step 3: Build + responsive capture**

Run:
```bash
npm run build
npm run serve -- --port 3000 --host 127.0.0.1 &
sleep 5
LABEL=after npm run shoot
```
Expected: build succeeds; compare `.artifacts/after/*_home.png` at 390/768/1440 against `.artifacts/before/` — cards single-column at 390, three-up at 1440, hero masthead/spine intact, no horizontal scrollbar at 390.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.tsx src/pages/index.module.css
git commit -m "feat(docs): rebuild landing on shadcn Card/Badge/Button; container-query grids"
```

---

### Task 5: Docs category cards via swizzle

**Files:**
- Create (via swizzle): `src/theme/DocCard/index.tsx` (+ any siblings the swizzle emits)

**Interfaces:**
- Consumes: `Card*` from `@/components/ui/card`; the Docusaurus `PropSidebarItem` prop shape (`item`).
- Produces: restyled category/generated index cards (e.g. `/docs/user-guide`, `/docs/admin-guide`, `/docs/developer-guide`).

- [ ] **Step 1: Eject DocCard**

Run: `npm run swizzle @docusaurus/theme-classic DocCard -- --eject --typescript` (accept the "unsafe" prompt; DocCard has a stable public prop `item`).

- [ ] **Step 2: Re-render it with the shadcn Card**

Rewrite `src/theme/DocCard/index.tsx` to keep the same exports and `item` handling but render the link body inside `<Card>`:

```tsx
import {Card, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {cn} from '@/lib/utils';
// keep the existing useDocById / link-resolution logic from the ejected file.

function CardLayout({href, icon, title, description}: {href: string; icon: React.ReactNode; title: string; description?: string}) {
  return (
    <Link href={href} className="no-underline">
      <Card className="h-full border-border bg-card transition-transform hover:-translate-y-0.5">
        <CardHeader className="gap-1.5">
          <CardTitle className="text-lg">{icon} {title}</CardTitle>
          {description && <CardDescription className="text-muted-foreground">{description}</CardDescription>}
        </CardHeader>
      </Card>
    </Link>
  );
}
```
Preserve the two branches from the ejected source (link items vs category items) and pass their resolved `href`/`title`/`description` into `CardLayout`.

- [ ] **Step 3: Build + capture**

Run: `npm run build` then re-serve and `LABEL=after npm run shoot`.
Expected: build succeeds; `/docs/user-guide` index cards render as shadcn cards; single column at 390px.

- [ ] **Step 4: Commit**

```bash
git add src/theme/DocCard
git commit -m "feat(docs): swizzle DocCard onto shadcn Card"
```

---

### Task 6: Site-wide responsive + typography layer (benefits Markdown)

**Files:**
- Modify: `src/css/custom.css` (append a new "Responsive & fluid type" section)

**Interfaces:**
- Produces: fluid headings, mobile-scrollable tables, tighter small-screen spacing across ALL doc pages — no content edits.

- [ ] **Step 1: Append responsive rules**

Append to `src/css/custom.css`:

```css
/* ---------- Responsive & fluid type (content-wide) ---------- */

/* Fluid doc H1: shrinks on phones, caps at the current 2.6rem on desktop. */
.markdown h1,
h1.docTitle,
header h1 {
  font-size: clamp(2rem, 1.5rem + 2.2vw, 2.6rem);
}

.markdown h2 {
  font-size: clamp(1.4rem, 1.15rem + 1.1vw, 1.8rem);
}

/* Wide tables scroll horizontally on small screens instead of overflowing. */
@media (max-width: 48em) {
  .markdown table {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

/* Tighter gutters + comfortable tap targets on phones. */
@media (max-width: 40em) {
  .markdown :is(h2, h3) {
    margin-top: 1.8rem;
  }
  .menu {
    font-size: 0.92rem;
  }
  .menu__link {
    padding-block: 0.55rem;
  }
}

/* Let the article column breathe on ultrawide without going full-bleed. */
@media (min-width: 100em) {
  .theme-doc-markdown {
    max-width: 82ch;
  }
}
```

- [ ] **Step 2: Build + full responsive capture**

Run: `npm run build` then re-serve and `LABEL=after npm run shoot`.
Expected: build succeeds; at 390px `/docs/api-reference` (wide endpoint tables) scrolls its tables horizontally with no page-level horizontal scroll; H1s are smaller on the 390 shots than the 1440 shots.

- [ ] **Step 3: Commit**

```bash
git add src/css/custom.css
git commit -m "feat(docs): fluid type + mobile table scroll + small-screen spacing"
```

---

### Task 7: A11y, README, final verification

**Files:**
- Modify: `README.md` (document the Tailwind/shadcn layer)

**Interfaces:**
- Produces: a documented, verified, ship-ready portal.

- [ ] **Step 1: Accessibility spot-checks**

Re-serve. With Playwright, tab through `/` and confirm every CTA/card link shows a visible focus ring; confirm `[data-theme]` stays dark. Run an axe check:
```bash
node -e "import('playwright').then(async({chromium})=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('http://localhost:3000/briefr-docs/');await p.addScriptTag({url:'https://cdn.jsdelivr.net/npm/axe-core@4/axe.min.js'});const r=await p.evaluate(async()=>await window.axe.run());console.log('violations',r.violations.map(v=>v.id));await b.close();})"
```
Expected: no new `color-contrast` or `link-name` violations vs baseline. Fix any introduced by the new components (adjust token usage in `src/components/ui/*` or `tailwind.css`).

- [ ] **Step 2: Update the README**

In `README.md` under "Develop", add a short subsection: the portal uses scoped Tailwind v4 + shadcn/ui for the landing page and swizzled `DocCard` only; components live in `src/components/ui`; tokens bridge to `--brf-*` in `src/css/tailwind.css`; preflight is intentionally disabled; migrated Markdown is never styled with Tailwind. Note `npm run shoot` for responsive screenshots.

- [ ] **Step 3: Final build + before/after comparison**

Run: `npm run build` then re-serve and `LABEL=after npm run shoot`. Visually diff `.artifacts/before` vs `.artifacts/after` at all three widths for `/`, `/docs/user-guide`, `/docs/api-reference`, `/docs/user-guide/using-briefr`.
Expected: build green; after shots are visibly cleaner/more consistent and correctly responsive; identity preserved.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs(readme): document scoped Tailwind/shadcn layer + shoot harness"
```

## Self-Review

- **Spec coverage:** foundation (T2) ↔ D1/architecture-1; primitives (T3) ↔ architecture-2; landing (T4) ↔ architecture-3; DocCard (T5) ↔ architecture-4; content-wide CSS (T6) ↔ architecture-5; harness (T1) + a11y (T7) ↔ Verification. All spec sections map to a task.
- **Placeholder scan:** every code step has concrete code/commands and expected output; no TBD/TODO.
- **Type/name consistency:** `cn` (T2) used in T2/T4/T5; `@/components/ui/*` produced in T3, consumed in T4/T5; `npm run shoot` produced in T1, used in T4/T5/T6/T7; token names in `tailwind.css` (T2) match the classes used later (`bg-card`, `text-muted-foreground`, `border-border`, `text-primary`).
- **Gate:** Task 2 must not start until Decision D1 is confirmed.
