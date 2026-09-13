'use strict';

const EMBED_PAD_PX = 16;
const VIEWBOX_RE = /viewBox=["']0 0 (\d+) (\d+)["']/;

function parseViewBox(svgText) {
  const match = String(svgText).match(VIEWBOX_RE);
  if (!match) {
    throw new Error('svg missing viewBox="0 0 W H"');
  }
  return [Number(match[1]), Number(match[2])];
}

function wrapArchifyIframe(id, title, w, h) {
  const width = Number(w);
  const height = Number(h);
  if (!id || !title || !(width > 0) || !(height > 0)) {
    throw new Error(`invalid archify wrap args id=${id} w=${w} h=${h}`);
  }
  const src = `/diagrams/${id}.html?theme=dark&present=1&embed=1`;
  return [
    `<div class="archify-embed" style="--archify-w:${width};--archify-h:${height}">`,
    `<iframe class="archify-frame" src="${src}" title="${title}" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin"></iframe>`,
    `</div>`,
    `<noscript><img src="/diagrams/${id}.svg" alt="${title}" /></noscript>`,
  ].join('\n');
}

function viewBoxFromCatalog(catalog, id) {
  const entry = (catalog.diagrams || []).find((d) => d.id === id);
  const box = entry && entry.viewBox;
  if (!Array.isArray(box) || box.length !== 2) {
    throw new Error(`catalog missing viewBox for ${id}`);
  }
  const w = Number(box[0]);
  const h = Number(box[1]);
  if (!(w > 0) || !(h > 0)) {
    throw new Error(`catalog viewBox invalid for ${id}`);
  }
  return [w, h];
}

module.exports = {
  EMBED_PAD_PX,
  parseViewBox,
  wrapArchifyIframe,
  viewBoxFromCatalog,
};
