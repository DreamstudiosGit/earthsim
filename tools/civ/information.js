/* =============================================================================
 * SimEarth 2.0 — Information Age city blocks
 * -----------------------------------------------------------------------------
 * Blue glass and white frames: a glass-fronted villa, a glass block and a
 * glass tower with a sky reflection running across it, a low pavilion under
 * a white roof, a radio tower with its pod, a wind turbine and solar panels,
 * on a light plaza. Style: docs/landschaft-2026-10/stil.md · contract:
 * tools/civ/catalog.js.
 * ========================================================================== */
'use strict';

const S = require('./shapes');
const { yard } = require('./yard');

const GLASS = { R: 'white0', T: 'white0', S: 'rock4', O: 'rock2', w: 'ice2', v: 'ice1', u: 'ice0', n: 'water2', L: 'ice4', d: 'rock1', b: 'white0' };
const TOWER = { R: 'white0', T: 'rock4', O: 'rock2', b: 'rock3', k: 'rock1', e: 'red1', g: 'ice2' };
const ENERGY = { W: 'white0', h: 'rock4', k: 'rock2', n: 'water2', g: 'ice2', b: 'rock3' };

/** Mullions every other column and a diagonal glint of sky across the glass. */
function curtain(g, top) {
  for (let y = top; y < g.length; y++) {
    for (let x = 0; x < g[y].length - 2; x++) {
      if (g[y][x] === 'd') continue;
      g[y][x] = x % 2 === 1 ? 'n' : 'w';
      if ((x + y) % 7 === 0 && x % 2 === 0) g[y][x] = 'L';
    }
  }
  return g;
}

function glass(size) {
  if (size === 's') {
    const g = S.flat(5, 2, 4, { door: 1 });
    for (let x = 2; x <= 2; x++) { g[3][x] = 'n'; g[4][x] = 'n'; }
    for (let x = 0; x < 5; x++) if (g[2][x] !== '.') g[2][x] = 'b';
    return g;
  }
  if (size === 'm') return curtain(S.flat(6, 2, 8, { door: 2 }), 2);
  return curtain(S.flat(6, 2, 15, { door: 2 }), 2);
}

/** A low glass hall under a wide, softly curved white roof. */
function pavilion() {
  const g = S.canvas(10, 6);
  S.stamp(g, S.pitched(10, 2, 4, { inset: 1, overhang: 1, shadowRow: false }), 0, 0);
  for (let y = 2; y < 6; y++) for (let x = 1; x < 8; x++) g[y][x] = x % 3 === 0 ? 'b' : y === 2 ? 'v' : 'w';
  g[4][4] = 'd';
  g[5][4] = 'd';
  return g;
}

const RADIO = [
  '..e..',
  '..R..',
  '..T..',
  '..T..',
  '.RTO.',
  'RgggO',
  'kkkkk',
  '.RTO.',
  '..T..',
  '..T..',
  '..T..',
  '..T..',
  '..T..',
  '.RTO.',
  '.RTO.',
  '.RTO.',
  'RTTTO',
  'kkkkk',
];

const ENERGY_GRIDS = [
  [
    '..W..',
    '..W..',
    'WWhkk',
    '..h..',
    '..h..',
    '..h..',
    '..h..',
    '..h..',
    '..h..',
    '..h..',
    '..h..',
    '.khk.',
  ],
  [
    'gnngnn',
    'nnnnnn',
    'bbbbbb',
  ],
];

const blocks = {
  glass: (v) => S.sprite(glass(v.size), GLASS),
  pavilion: () => S.sprite(pavilion(), { ...GLASS, w: 'ice2', v: 'ice1' }),
  radio_tower: () => S.sprite(RADIO, TOWER),
  turbine: (v) => S.sprite(ENERGY_GRIDS[v.index], ENERGY),
  yard_information: (v) => yard(v.index, 'paving', ['rock3', 'rock4', 'lichen1'], 61),
};

module.exports = { blocks };
