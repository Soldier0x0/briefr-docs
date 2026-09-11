#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

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
    }
  }
}
walk(path.join(root, 'docs'));

if (failed) process.exit(1);
console.log(`archify catalog ok (${ids.size} diagrams)`);
