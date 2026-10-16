/* =============================================================================
 * SimEarth 2.0 — Atomic Age city blocks
 * -----------------------------------------------------------------------------
 * Grey concrete: a low block, a four-storey block and a high-rise with
 * window grids, a long slab block, a cooling tower under its plume, a water
 * tower and a radio mast, on asphalt slabs. Bridges stay of steel.
 * Style: docs/landschaft-2026-10/stil.md · contract: tools/civ/catalog.js.
 * ========================================================================== */
'use strict';

const S = require('./shapes');
const { yard } = require('./yard');

const CONCRETE = { R: 'rock4', T: 'rock4', S: 'rock3', O: 'rock1', w: 'rock3', v: 'rock2', u: 'rock1', n: 'water1', d: 'rock0' };
const TOWER = { R: 'rock4', L: 'rock4', T: 'rock3', S: 'rock2', O: 'rock1', k: 'rock0', W: 'white0', i: 'ice4', h: 'ice3' };
const MAST = { R: 'rock4', T: 'rock3', O: 'rock1', b: 'rock2', k: 'rock0', e: 'red1' };

function concrete(size) {
  if (size === 's') return S.flat(5, 2, 4, { door: 1, windows: [[1], 3, 9] });
  if (size === 'm') return S.flat(6, 2, 9, { door: 2, windows: [[1, 3, 5, 7], 1, 2] });
  return S.flat(6, 2, 14, { door: 2, windows: [[1, 3, 5, 7, 9, 11], 1, 2] });
}

/** A hyperbolic shell, narrow at the waist, under a solid plume of steam. */
function coolingTower() {
  const w = 9;
  const h = 10;
  const g = S.canvas(w, h + 4);
  S.stamp(g, ['..WiW....', '.iWWWi...', 'WWiWWWW..', '.WWiWW...'], 0, 0);
  for (let y = 0; y < h; y++) {
    const t = y / (h - 1);
    const half = 3.6 - 1.1 * Math.sin(Math.PI * Math.min(1, t * 1.15));
    const a = Math.round(4 - half);
    const b = Math.round(4 + half);
    for (let x = a; x <= b; x++) {
      const row = g[y + 4];
      row[x] = y === 0 ? (x === a ? 'R' : x === b ? 'O' : 'k') : x === b ? 'O' : x === a ? 'R' : x >= b - 1 ? 'S' : x <= a + 1 ? 'L' : 'T';
    }
  }
  return g;
}

const MASTS = [
  [
    '.RTO.',
    'RTTTO',
    'RTTTO',
    '.OOO.',
    '.b.b.',
    '.bbb.',
    '.b.b.',
    '.bbb.',
    '.b.b.',
    'kb.bk',
  ],
  [
    '.e.',
    '.R.',
    '.T.',
    'bTb',
    '.T.',
    '.T.',
    'bTb',
    '.T.',
    '.T.',
    'kOk',
  ],
];

const blocks = {
  concrete: (v) => S.sprite(concrete(v.size), CONCRETE),
  slab: () => S.sprite(S.flat(11, 2, 7, { door: 5, windows: [[1, 3, 5], 1, 2] }), CONCRETE),
  cooling_tower: () => S.sprite(coolingTower(), TOWER),
  water_tower: (v) => S.sprite(MASTS[v.index], MAST),
  yard_atomic: (v) => yard(v.index, 'paving', ['rock0', 'rock1', 'rock2'], 51),
};

module.exports = { blocks };
