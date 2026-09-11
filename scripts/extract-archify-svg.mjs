#!/usr/bin/env node
import fs from 'node:fs';

const htmlPath = process.argv[2];
const svgPath = process.argv[3];
if (!htmlPath || !svgPath) {
  console.error('usage: extract-archify-svg.mjs <input.html> <output.svg>');
  process.exit(2);
}
const html = fs.readFileSync(htmlPath, 'utf8');
const start = html.indexOf('<svg ');
const end = html.indexOf('</svg>');
if (start < 0 || end < 0) {
  console.error(`no svg in ${htmlPath}`);
  process.exit(1);
}
const svg = html.slice(start, end + '</svg>'.length);
fs.writeFileSync(svgPath, `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`);
