#!/usr/bin/env node
/** Rasterize committed Archify SVGs to PNG for GitHub Markdown. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'static/diagrams');
const ids = process.argv.slice(2);

async function rasterize(browser, svgPath, pngPath) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const page = await browser.newPage({
    viewport: {width: 1400, height: 900},
    deviceScaleFactor: 2,
  });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:#0b1020">${svg}</body></html>`,
    {waitUntil: 'load'},
  );
  const loc = page.locator('svg').first();
  await loc.waitFor({state: 'visible'});
  const box = await loc.boundingBox();
  if (!box) throw new Error(`no bbox for ${svgPath}`);
  await page.screenshot({
    path: pngPath,
    clip: {
      x: Math.max(0, box.x),
      y: Math.max(0, box.y),
      width: Math.ceil(box.width),
      height: Math.ceil(box.height),
    },
  });
  await page.close();
}

const targets = (ids.length
  ? ids
  : fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.svg'))
      .map((f) => path.basename(f, '.svg'))
).map((id) => ({
  id,
  svg: path.join(dir, `${id}.svg`),
  png: path.join(dir, `${id}.png`),
}));

const browser = await chromium.launch();
try {
  for (const t of targets) {
    if (!fs.existsSync(t.svg)) throw new Error(`missing ${t.svg}`);
    await rasterize(browser, t.svg, t.png);
    console.log('png', t.png);
  }
} finally {
  await browser.close();
}
