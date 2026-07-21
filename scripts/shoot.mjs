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
