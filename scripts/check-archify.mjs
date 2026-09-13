#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const {parseViewBox} = require('./lib/archify-embed.cjs');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, 'diagrams/catalog.json'), 'utf8'),
);
const ids = new Set();
let failed = false;

function fail(msg) {
  console.error(msg);
  failed = true;
}

for (const d of catalog.diagrams) {
  if (!d.id || !d.type || !d.title) {
    fail(`catalog entry missing fields: ${JSON.stringify(d)}`);
    continue;
  }
  if (ids.has(d.id)) fail(`duplicate catalog id: ${d.id}`);
  ids.add(d.id);
  const jsonPath = path.join(root, 'diagrams/archify', `${d.id}.json`);
  const htmlPath = path.join(root, 'static/diagrams', `${d.id}.html`);
  const svgPath = path.join(root, 'static/diagrams', `${d.id}.svg`);
  const pngPath = path.join(root, 'static/diagrams', `${d.id}.png`);
  if (!Array.isArray(d.viewBox) || d.viewBox.length !== 2) {
    fail(`catalog ${d.id} missing viewBox [w, h]`);
  } else {
    const [cw, ch] = d.viewBox.map(Number);
    if (!(cw > 0) || !(ch > 0)) fail(`catalog ${d.id} invalid viewBox`);
  }
  if (!fs.existsSync(jsonPath)) fail(`missing IR ${jsonPath}`);
  if (!fs.existsSync(htmlPath)) fail(`missing HTML ${htmlPath}`);
  else {
    const html = fs.readFileSync(htmlPath, 'utf8');
    if (!html.includes('<svg')) fail(`HTML has no <svg>: ${htmlPath}`);
    if (html.trimStart().startsWith('{')) {
      fail(`HTML looks like JSON, not artifact: ${htmlPath}`);
    }
  }
  if (!fs.existsSync(svgPath)) fail(`missing SVG ${svgPath}`);
  else if (Array.isArray(d.viewBox) && d.viewBox.length === 2) {
    try {
      const [sw, sh] = parseViewBox(fs.readFileSync(svgPath, 'utf8'));
      const [cw, ch] = d.viewBox.map(Number);
      if (sw !== cw || sh !== ch) {
        fail(`catalog ${d.id} viewBox [${cw}, ${ch}] != SVG [${sw}, ${sh}]`);
      }
    } catch (err) {
      fail(`${svgPath}: ${err.message}`);
    }
  }
  if (!fs.existsSync(pngPath)) fail(`missing PNG ${pngPath}`);
}

const css = fs.readFileSync(path.join(root, 'src/css/custom.css'), 'utf8');
if (/iframe\.archify-frame[\s\S]{0,200}height:\s*560px/.test(css)) {
  fail('custom.css still forces archify-frame height 560px');
}

function walk(dir) {
  for (const name of fs.readdirSync(dir, {withFileTypes: true})) {
    if (name.name === 'superpowers') continue;
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p);
    else if (/\.(md|mdx)$/.test(name.name)) {
      const text = fs.readFileSync(p, 'utf8');
      for (const m of text.matchAll(/<ArchifyDiagram[^>]*\bid=["']([^"']+)["']/g)) {
        if (!ids.has(m[1])) {
          fail(`${p} references unknown ArchifyDiagram id=${m[1]}`);
        }
      }
      for (const m of text.matchAll(/src=["']\/diagrams\/([a-z0-9-]+)\.html/g)) {
        if (!ids.has(m[1])) {
          fail(`${p} references unknown diagram iframe id=${m[1]}`);
        }
      }
      if (/class="archify-frame"[^>]*height="560"/.test(text)) {
        fail(`${p} still uses height="560" on Archify iframe`);
      }
      for (const m of text.matchAll(
        /src=["']\/diagrams\/([a-z0-9-]+)\.html[^"']*["']/g,
      )) {
        const id = m[1];
        const entry = catalog.diagrams.find((d) => d.id === id);
        const start = Math.max(0, m.index - 180);
        const window = text.slice(start, m.index + m[0].length);
        if (!entry || !Array.isArray(entry.viewBox)) continue;
        const [w, h] = entry.viewBox;
        if (
          !window.includes(`--archify-w:${w}`) ||
          !window.includes(`--archify-h:${h}`)
        ) {
          fail(`${p} iframe ${id} missing matching --archify-w/--archify-h`);
        }
      }
    }
  }
}
walk(path.join(root, 'docs'));

if (failed) process.exit(1);
console.log(`archify catalog ok (${ids.size} diagrams)`);
