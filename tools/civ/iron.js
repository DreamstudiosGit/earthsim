/* =============================================================================
 * SimEarth 2.0 — Iron Age city blocks
 * -----------------------------------------------------------------------------
 * Red tile roofs everywhere: half-timbered houses (pale plaster, dark beams)
 * and grey stone houses, a square keep, a column temple of pale stone, a
 * market stall and a roofed well, a crenellated stone wall and an arched
 * stone bridge, on cobbles. Style: docs/landschaft-2026-10/stil.md ·
 * contract: tools/civ/catalog.js.
 * ========================================================================== */
'use strict';

const S = require('./shapes');
const { yard } = require('./yard');

const TILE = { R: 'laterite3', T: 'laterite2', S: 'laterite1', O: 'laterite0' };
/** Plaster between dark timber. */
const TIMBER = { ...TILE, w: 'sand4', v: 'sand3', u: 'sand1', b: 'bark0', d: 'bark0', n: 'soil0' };
/** Dressed grey stone. */
const MASONRY = { ...TILE, w: 'rock3', v: 'rock2', u: 'rock1', d: 'bark0', n: 'rock0' };
/** Pale stone of the temple and the wall. */
const MARBLE = { R: 'rock4', T: 'rock4', S: 'rock3', O: 'rock1', w: 'rock4', v: 'rock2', u: 'rock1', n: 'rock0' };
const MARKET = { e: 'red1', W: 'white0', b: 'bark0', c: 'bark2', ...TILE, g: 'rock3', h: 'rock2', k: 'rock0', x: 'water3' };

/** Timber frame: corner posts, a beam under the eaves and one across the wall. */
function frame(g, top, x0, x1, mid) {
  for (let y = top; y < g.length; y++) {
    if (g[y][x0] !== 'd') g[y][x0] = 'b';
    if (g[y][x1] !== 'd') g[y][x1] = 'b';
  }
  for (let x = x0; x <= x1; x++) {
    g[top][x] = 'b';
    if (mid !== undefined && g[mid][x] !== 'd' && g[mid][x] !== 'n') g[mid][x] = 'b';
  }
  return g;
}

function timberhouse(size) {
  if (size === 's') return frame(S.pitched(5, 3, 3, { door: 2 }), 3, 1, 3);
  if (size === 'm') return frame(S.pitched(7, 4, 5, { door: 2, windows: [[2], 4, 9] }), 4, 1, 5, 6);
  const g = S.gable(9, 6, { door: 4, windows: [[2, 4], 2, 4] });
  return frame(g, 5, 1, 7, 7);
}

function stonehouse(size) {
  if (size === 's') return S.pitched(5, 3, 3, { door: 2 });
  if (size === 'm') return S.pitched(7, 3, 5, { door: 2, windows: [[1], 4, 9] });
  return S.pitched(10, 4, 5, { door: 4, windows: [[1, 3], 1, 3] });
}

/** A square keep with a pyramid roof, arrow slits and a gate. */
function keep() {
  const g = S.gable(7, 9, { door: 3, doorH: 3 });
  S.windows(g, [5, 8], 2, 4, 2);
  return g;
}

const TEMPLE = [
  '....RTO....',
  '..RTTTTSO..',
  'RTTTTTTTSSO',
  'SSSSSSSSSSO',
  'wnwnwnwnwnu',
  'wnwnwnwnwnu',
  'wnwnwnwnwnu',
  'RTTTTTTTTSO',
  'wwwwwwwwwvu',
];

const MARKETS = [
  [
    'eWeWe',
    'eWeWe',
    'b...b',
    'bcccb',
    'b...b',
  ],
  [
    '..R..',
    '.RTO.',
    'RTTSO',
    'b.x.b',
    'ghhhk',
    '.hhk.',
  ],
];

/** A straight piece, a piece running into the picture, a long piece; crenellated. */
const STONEWALL = [
  [
    'R.R.',
    'TTTO',
    'wwvu',
    'wuwu',
    'wwvu',
  ],
  [
    'R.',
    'TO',
    'wT',
    'wO',
    'wT',
    'wO',
    'wv',
    'wu',
  ],
  [
    'R.R.R.R.',
    'TTTTTTTO',
    'wwwwwwvu',
    'wuwwuwuu',
    'wwwwwwvu',
  ],
];

/** Arches over a river running north–south (0); a paved deck between parapets over one running west–east (1). */
const BRIDGE = [
  [
    'RTTTTTTTTO',
    'wwwwwwwwvu',
    'wv..ww..vu',
    'wv..ww..vu',
    'uu..uu..uu',
  ],
  [
    'RTTTO',
    'wSTSu',
    'wTTSu',
    'wSTSu',
    'wTTSu',
    'wSTSu',
    'wTTSu',
    'wSTSu',
    'wTTSu',
    'wvvvu',
  ],
];

const blocks = {
  timberhouse: (v) => S.sprite(timberhouse(v.size), TIMBER),
  stonehouse: (v) => S.sprite(stonehouse(v.size), MASONRY),
  keep: () => S.sprite(keep(), MASONRY),
  temple: () => S.sprite(TEMPLE, MARBLE),
  market: (v) => S.sprite(MARKETS[v.index], MARKET),
  stonewall: (v) => S.sprite(STONEWALL[v.index], MARBLE),
  bridge_stone: (v) => S.sprite(BRIDGE[v.index], MARBLE),
  yard_iron: (v) => yard(v.index, 'cobble', ['rock1', 'rock2', 'rock3'], 31),
};

module.exports = { blocks };
