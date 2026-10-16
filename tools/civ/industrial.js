/* =============================================================================
 * SimEarth 2.0 — Industrial Age city blocks
 * -----------------------------------------------------------------------------
 * Red brick under dark slate: terraced houses with chimney stacks, a factory
 * hall with a sawtooth roof of glass and its own smokestack, a station with a
 * glass vault, free-standing smokestacks and a steel truss bridge, on dark
 * cobbles. Smoke is drawn as solid puffs (no translucency).
 * Style: docs/landschaft-2026-10/stil.md · contract: tools/civ/catalog.js.
 * ========================================================================== */
'use strict';

const S = require('./shapes');
const { yard } = require('./yard');

const BRICK = {
  R: 'rock2', T: 'rock1', S: 'rock1', O: 'rock0',
  w: 'laterite2', v: 'laterite1', u: 'laterite0', n: 'ice0', d: 'bark0', c: 'laterite1', k: 'rock0',
};
const FACTORY = { ...BRICK, g: 'ice2', T: 'rock2' };
const STATION = { R: 'laterite3', L: 'laterite3', T: 'laterite2', S: 'laterite1', O: 'laterite0', w: 'laterite2', v: 'laterite1', u: 'laterite0', g: 'ice2', G: 'ice3', W: 'white0', d: 'bark0' };
const STACK = { c: 'laterite2', v: 'laterite1', u: 'laterite0', k: 'rock0', p: 'rock4', W: 'white0' };
const STEEL = { k: 'rock0', T: 'rock3', S: 'rock2', O: 'rock1' };

/** A chimney stack two rows above the roof at column `x`. */
function stack(g, x, h = 2) {
  const out = S.canvas(g[0].length, g.length + h);
  S.stamp(out, g, 0, h);
  out[0][x] = 'k';
  for (let y = 1; y < h + 1; y++) out[y][x] = 'c';
  return out;
}

function terrace(size) {
  if (size === 's') return stack(S.pitched(5, 2, 4, { inset: 1, door: 1 }), 3);
  if (size === 'm') return stack(S.pitched(7, 3, 6, { inset: 1, door: 1, windows: [[1, 3], 3, 2] }), 5);
  const g = stack(S.pitched(9, 3, 8, { inset: 1, door: 1, windows: [[1, 3, 5], 3, 2] }), 2);
  g[0][6] = 'k';
  g[1][6] = 'c';
  return g;
}

const FACTORY_HALL = [
  '.........kk',
  '.........cu',
  'g...g....cu',
  'gT..gT...cu',
  'gTT.gTT..cu',
  'gTTTgTTTTcu',
  'kkkkkkkkkcu',
  'wnnwwnnwvcu',
  'wnnwwnnwvcu',
  'wwwwwwwwvcu',
  'wddwwwwwuuu',
];

function station() {
  const g = S.canvas(11, 10);
  S.stamp(g, S.dome(11, 5), 0, 0);
  // A glass fan in the brick arch, the clock above the entrance.
  for (let y = 2; y < 5; y++) for (let x = 5 - (y - 1); x <= 5 + (y - 1); x++) if (g[y][x] !== '.' && x > 0 && x < 10) g[y][x] = (x + y) % 3 === 0 ? 'G' : 'g';
  g[1][5] = 'W';
  S.wall(g, 0, 10, 5, 9);
  for (const x of [2, 5, 8]) { g[8][x] = 'd'; g[9][x] = 'd'; }
  S.windows(g, [6], 1, 9, 2, 'g');
  return g;
}

/** A tall smokestack and a short one, with a solid puff of smoke. */
const STACKS = [
  [
    '.pW',
    'Wp.',
    'kkk',
    'cvu',
    'cvu',
    'cvu',
    'cvu',
    'cvu',
    'cvu',
    'cvu',
    'cvu',
    'cuu',
  ],
  [
    'Wp',
    'kk',
    'cu',
    'cu',
    'cu',
    'cu',
    'cu',
    'uu',
  ],
];

/** A truss over a river running north–south (0); a deck with steel rails over one running west–east (1). */
const BRIDGE = [
  [
    'kkkkkkkkkk',
    'kk..kk..kk',
    'k.kk..kk.k',
    'TTTTTTTTTS',
    'SSSSSSSSSO',
  ],
  [
    'kTTSk',
    'kSSSk',
    'kTTSk',
    'kTTSk',
    'kSSSk',
    'kTTSk',
    'kTTSk',
    'kSSSk',
    'kTTSk',
    'kOOOk',
  ],
];

const blocks = {
  terrace: (v) => S.sprite(terrace(v.size), BRICK),
  factory: () => S.sprite(FACTORY_HALL, FACTORY),
  station: () => S.sprite(station(), STATION),
  chimney: (v) => S.sprite(STACKS[v.index], STACK),
  bridge_steel: (v) => S.sprite(BRIDGE[v.index], STEEL),
  yard_industrial: (v) => yard(v.index, 'cobble', ['rock0', 'rock1', 'rock2'], 41),
};

module.exports = { blocks };
