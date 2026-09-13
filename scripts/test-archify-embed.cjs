'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseViewBox,
  wrapArchifyIframe,
  EMBED_PAD_PX,
} = require('./lib/archify-embed.cjs');

test('parseViewBox reads authored size', () => {
  assert.deepEqual(parseViewBox('<svg viewBox="0 0 770 480">'), [770, 480]);
});

test('wrap uses CSS variables not 560px height', () => {
  const html = wrapArchifyIframe('auth-layers', 'BRIEFR auth layers', 770, 480);
  assert.equal(html.includes('height="560"'), false);
  assert.equal(html.includes('--archify-w:770'), true);
  assert.equal(html.includes('--archify-h:480'), true);
  assert.equal(html.includes('class="archify-embed"'), true);
  assert.equal(EMBED_PAD_PX, 16);
});
