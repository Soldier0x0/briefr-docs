// Pulls canonical docs from the briefr-main repo into the portal, prepending
// Docusaurus front matter. Re-runnable: overwrites the migrated copies, so
// briefr-main/docs stays the single source of truth for these files.
// The per-file AGPL copyright paragraph is dropped — the license notice
// lives once in the site footer instead of atop every page.
const fs = require('fs');
const path = require('path');

const SRC =
  process.env.BRIEFR_MAIN_DOCS || path.resolve(__dirname, '../../briefr-main/docs');
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
  ['API_REFERENCE.md', 'api-reference.md', 'API Reference', 5],
  // planning/ROADMAP.md is deliberately NOT migrated: it's an internal
  // planning index (version bookkeeping, spec links, phasing labels). The
  // portal ships a curated public docs/roadmap.md instead.
];

// Guides reference diagrams as relative `assets/...` paths; mirror the SVGs
// next to each guide folder so those links resolve unchanged.
const ASSET_DEST_DIRS = ['user-guide/assets', 'admin-guide/assets'];

const COPYRIGHT_RE =
  /^Copyright © \d{4} Sai Harsha Vardhan\..*(?:\r?\n(?!\r?\n).*)*\r?\n?/m;

// Cross-doc links in the sources use briefr-main/docs filenames. Links to
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

for (const [src, dst, label, position] of FILES) {
  const srcPath = path.join(SRC, src);
  const dstPath = path.join(DST, dst);
  let body = fs.readFileSync(srcPath, 'utf8');
  body = body.replace(COPYRIGHT_RE, '');
  body = rewriteLinks(body, src, dst);
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

// Screenshots use permanent filenames (see briefr-main docs/assets/screenshots/
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
