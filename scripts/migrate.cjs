// Pulls canonical docs from the briefr repo into the portal, prepending
// Docusaurus front matter. Re-runnable: overwrites the migrated copies, so
// briefr/docs stays the single source of truth for these files.
// The per-file copyright paragraph is dropped — the license notice
// lives once in the site footer instead of atop every page.
const fs = require('fs');
const path = require('path');

const SRC =
  process.env.BRIEFR_MAIN_DOCS || path.resolve(__dirname, '../../docs');
const DST = path.resolve(__dirname, '../docs');

const FILES = [
  ['USE.md', 'user-guide/using-briefr.md', 'Using BRIEFR', 1],
  ['HOW_IT_WORKS.md', 'user-guide/how-it-works.md', 'How it works', 2],
  ['TROUBLESHOOTING.md', 'user-guide/troubleshooting.md', 'Troubleshooting', 3],
  ['SELF_HOST.md', 'admin-guide/self-host.md', 'Self-host BRIEFR', 1],
  ['OPERATIONS.md', 'admin-guide/operations.md', 'Operations', 2],
  ['POSTGRES.md', 'admin-guide/postgres.md', 'PostgreSQL', 3],
  ['SYSTEM_DESIGN.md', 'developer-guide/system-design.md', 'System design', 1],
  ['ONBOARDING.md', 'developer-guide/onboarding.md', 'Contributor onboarding', 2],
  ['API_REFERENCE.md', 'api-reference.md', 'API Reference', 61],
  // planning/ROADMAP.md is deliberately NOT migrated: it's an internal
  // planning index (version bookkeeping, spec links, phasing labels). The
  // portal ships a curated public docs/roadmap.md instead.
];

// Guides reference diagrams as relative `assets/...` paths; mirror the SVGs
// next to each guide folder so those links resolve unchanged.
const ASSET_DEST_DIRS = ['user-guide/assets', 'admin-guide/assets'];

const COPYRIGHT_RE =
  /^Copyright © \d{4} Sai Harsha Vardhan\..*(?:\r?\n(?!\r?\n).*)*\r?\n?/m;

// Cross-doc links in the sources use briefr/docs filenames. Links to
// docs that were migrated become relative links into the new tree; links to
// everything else in the repo fall back to GitHub.
const MIGRATED = new Map(FILES.map(([src, dst]) => [src, dst]));
const GH = 'https://github.com/Soldier0x0/briefr';

function rewriteLinks(body, srcDocPath, dstDocPath) {
  const srcDir = path.posix.dirname(path.posix.join('docs', srcDocPath));
  const fromDir = path.posix.dirname(dstDocPath);
  return body.replace(/\]\(([^)\s]+)\)/g, (whole, target) => {
    if (/^(https?:|mailto:|#)/.test(target)) return whole;
    const [file, anchor = ''] = target.split(/(?=#)/);
    // Local images are mirrored next to the guides by the asset copy below.
    if (/\.(svg|png|jpe?g|gif|webp)$/i.test(file)) return whole;
    const abs = path.posix.normalize(path.posix.join(srcDir, file));
    if (file.endsWith('.md') && abs.startsWith('docs/')) {
      const dst = MIGRATED.get(abs.slice('docs/'.length));
      if (dst) {
        let rel = path.posix.relative(fromDir, dst);
        if (!rel.startsWith('.')) rel = './' + rel;
        return `](${rel}${anchor})`;
      }
    }
    const kind = /\.[a-z0-9]+$/i.test(abs) ? 'blob' : 'tree';
    return `](${GH}/${kind}/main/${abs}${anchor})`;
  });
}

/** Strip maintainer-only references before publishing on the docs portal. */
function scrubForPublicPortal(body, dst) {
  let out = body;

  out = out.replace(
    /Screenshots are not committed yet\. Use \[`IMAGE_BRIEFS\.md`\]\([^)]+\) for capture prompts\.\s*/g,
    '',
  );

  out = out.replace(
    /\(see `AGENTS\.md`\)/g,
    '(see [Contributor onboarding](/docs/developer-guide/onboarding))',
  );

  out = out.replace(
    /\*\*Source of truth:\*\* `\/workspace` codebase/g,
    '**Source of truth:** the BRIEFR repository on GitHub',
  );

  out = out.replace(
    /— CLAUDE\.md danger zone 6, never on the request path\)/g,
    '— heavy work never runs on the request path)',
  );

  out = out.replace(
    /\| 4 \| \*\*Local verify green\*\* — `\.\/scripts\/verify-local\.sh` \(and `--full` when Postgres\/tools available\)\. \|/,
    '| 4 | **Release CI green** on the tagged commit (GitHub Actions or your release pipeline). |',
  );

  out = out.replace(
    /Near-future engineering and product intent lives in \[`docs\/planning\/SPRINT_2026-07\.md`\]\([^)]+\), \[`docs\/planning\/BACKLOG\.md`\]\([^)]+\), and active specs under \[`docs\/planning\/specs\/`\]\([^)]+\)\. Historical beta docs remain in `docs\/archive\/` and are not current system truth\./,
    'Product direction and shipped scope are summarized in the [public roadmap](/docs/roadmap) and [release notes](/docs/release-notes).',
  );

  out = out.replace(
    /See \[`planning\/BACKLOG\.md`\]\([^)]+\) §6 for optional layout tails\./,
    'Optional layout tails are documented in the product repository when needed.',
  );

  if (dst === 'admin-guide/postgres.md') {
    out = out.replace(
      '`./scripts/verify-local.sh --full` auto-starts `briefr-pg-test` when `DATABASE_URL` is unset and compose on `:5432` is not running.',
      'Contributors can start a disposable Postgres test container with `./scripts/postgres-dev.sh start` (see [Contributor onboarding](/docs/developer-guide/onboarding)).',
    );
  }

  out = out.replace(
    /\(cloud\/bare VM; see `AGENTS\.md`\)/g,
    '(cloud/bare VM; see [Contributor onboarding](/docs/developer-guide/onboarding))',
  );

  out = out.replace(
    /Fixed in #731: shared `refreshAccessToken\(\)` \+ AuthContext uses `fetchMe\(\)` only\. Retry \/ re-login recovers; multi-tab concurrent refresh can still hit reuse detection by design/,
    'Retry or re-login recovers; multi-tab concurrent refresh can still hit session reuse detection by design.',
  );

  return out;
}

for (const [src, dst, label, position] of FILES) {
  const srcPath = path.join(SRC, src);
  const dstPath = path.join(DST, dst);
  let body = fs.readFileSync(srcPath, 'utf8');
  body = body.replace(COPYRIGHT_RE, '');
  body = rewriteLinks(body, src, dst);
  body = scrubForPublicPortal(body, dst);
  const fm = [
    '---',
    `sidebar_label: ${label}`,
    `sidebar_position: ${position}`,
    '---',
    '',
    '',
  ].join('\n');
  fs.mkdirSync(path.dirname(dstPath), {recursive: true});
  fs.writeFileSync(dstPath, fm + body.trimStart());
  console.log(`${src} -> ${dst}`);
}

// Portal-only rewrites after migrate (briefr canonical files may link maintainer
// study content that is not part of the public docs site).
const PORTAL_PATCHES = {
  'user-guide/how-it-works.md': (body) =>
    body.replace(
      /\| \[`study-guide\/`\][^\n]+\n\| \[`STUDY_GUIDE\.html`\][^\n]+\n/,
      '',
    ).replace(
      /\| \[`ONBOARDING\.md`\]\(\.\.\/developer-guide\/onboarding\.md\)/,
      '| [Contributor onboarding](/docs/developer-guide/onboarding)',
    ).replace(
      /\| \[`API_REFERENCE\.md`\]\(\.\.\/api-reference\.md\)/,
      '| [API Reference](/docs/api-reference)',
    ).replace(
      /\| \[`SYSTEM_DESIGN\.md`\]\(\.\.\/developer-guide\/system-design\.md\)/,
      '| [System design](/docs/developer-guide/system-design)',
    ).replace(
      '## Deeper reference\n\n| Doc | When |\n|-----|------|\n',
      `## Deeper reference\n\n| Doc | When |\n|-----|------|\n| [Pathways](/docs/pathways) | Pick Analyst, Architect, or System Design learning track |\n| [How BRIEFR Works](/docs/how-briefr-works) | Full learning section — intel lifecycle + how it's built |\n`,
    ),
  'admin-guide/operations.md': (body) =>
    body.replace(
      '## Purpose\n\nDefines how BRIEFR runs in production',
      `## Purpose\n\n> **Day-to-day:** BRIEFR runs under **systemd** (\`briefr-backend.service\`). Routine operation does not require running any update script — systemd keeps the backend and nginx serving the built frontend.\n>\n> **Upgrades:** Run \`briefr-update.sh\` only when installing a new release (pull, Alembic, frontend build, health gate). This is not a development hot-reload workflow.\n\nDefines how BRIEFR runs in production`,
    ),
};

for (const [rel, patch] of Object.entries(PORTAL_PATCHES)) {
  const p = path.join(DST, rel);
  if (fs.existsSync(p)) {
    fs.writeFileSync(p, patch(fs.readFileSync(p, 'utf8')));
    console.log(`patched ${rel}`);
  }
}

const ASSET_RE = /\.(svg|png|webp)$/i;
const assets = fs
  .readdirSync(path.join(SRC, 'assets'))
  .filter((f) => ASSET_RE.test(f));
for (const dir of ASSET_DEST_DIRS) {
  fs.mkdirSync(path.join(DST, dir), {recursive: true});
  for (const f of assets) {
    fs.copyFileSync(path.join(SRC, 'assets', f), path.join(DST, dir, f));
  }
  console.log(`assets/* -> ${dir}/ (${assets.length} files)`);
}

// Screenshots use permanent filenames (see briefr docs/assets/screenshots/
// README): replacing one = dropping a same-named file there and re-running this.
const shotSrc = path.join(SRC, 'assets', 'screenshots');
if (fs.existsSync(shotSrc)) {
  const shots = fs.readdirSync(shotSrc).filter((f) => ASSET_RE.test(f));
  for (const dir of ASSET_DEST_DIRS) {
    fs.mkdirSync(path.join(DST, dir, 'screenshots'), {recursive: true});
    for (const f of shots) {
      fs.copyFileSync(path.join(shotSrc, f), path.join(DST, dir, 'screenshots', f));
    }
  }
  console.log(`assets/screenshots/* -> {guides}/assets/screenshots/ (${shots.length} files)`);
}

// Study-guide / learn mirrors are maintainer-only; excluded from Docusaurus routes.
// Skip copying to keep the public repo lean.
console.log('skip study-guide/ + learn/ mirrors (portal-native Learn section)');
