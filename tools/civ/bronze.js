/* =============================================================================
 * SimEarth 2.0 — Bronze Age city blocks
 * -----------------------------------------------------------------------------
 * Pale mud-brick houses with flat roofs and beam ends under the parapet, a
 * granary of beehive silos, a step temple of fired brick, a well and jars, a
 * mud wall with rounded merlons and a timber bridge, on a yard of packed red
 * clay. Style: docs/landschaft-2026-10/stil.md · contract: tools/civ/catalog.js.
 * ========================================================================== */
'use strict';

const S = require('./shapes');
const { yard } = require('./yard');

/** Mud brick: a light roof, the wall a step darker, beam ends of wood. */
const MUD = {
  R: 'sand4', T: 'sand4', L: 'sand4', S: 'sand2', O: 'sand0',
  w: 'sand3', v: 'sand2', u: 'sand1', d: 'soil0', n: 'soil1', b: 'bark1',
};
/** Fired brick of the temple, its stair of pale mud brick. */
const BRICK = {
  R: 'laterite3', T: 'laterite3', S: 'laterite1', O: 'laterite0',
  w: 'laterite2', v: 'laterite1', u: 'laterite0', L: 'sand3', d: 'soil0',
};
const WELL = { R: 'rock4', T: 'rock3', O: 'rock1', q: 'rock2', Q: 'rock0', x: 'water3', y: 'water5', a: 'laterite3', A: 'laterite2', z: 'laterite0' };
const WOOD = { B: 'bark0', b: 'bark1', c: 'bark2', t: 'soil3' };

/** Beam ends poking out under the roof's front edge, every other column. */
function beams(g, row) {
  for (let x = 1; x < g[row].length - 1; x += 2) if (g[row][x] !== '.') g[row][x] = 'b';
  return g;
}

function mudbrick(size) {
  if (size === 's') return beams(S.flat(5, 2, 3, { door: 1 }), 2);
  if (size === 'm') return beams(S.flat(6, 3, 5, { door: 1, windows: [[1], 3, 9] }), 3);
  // Two storeys: an upper block stands on the roof terrace of the lower one.
  const g = S.canvas(9, 10);
  S.stamp(g, beams(S.flat(9, 3, 5, { door: 2, windows: [[1, 3], 5, 2] }), 3), 0, 2);
  S.stamp(g, beams(S.flat(5, 2, 3, { windows: [[1], 2, 9] }), 2), 1, 0);
  return g;
}

/** Three beehive silos, the middle one tallest, a hatch in its foot. */
function granary() {
  const g = S.canvas(11, 7);
  S.stamp(g, S.dome(4, 4, 2), 0, 1);
  S.stamp(g, S.dome(4, 4, 2), 7, 1);
  S.stamp(g, S.dome(5, 5, 2), 3, 0);
  g[6][5] = 'd';
  g[5][5] = 'd';
  return g;
}

const ZIGGURAT = [
  '....RTO....',
  '....wdu....',
  '...RTLTO...',
  '...wvLvu...',
  '..RTTLTTO..',
  '..wwvLvwu..',
  'RTTTTLTTTTO',
  'wwwwvLvwwvu',
  'wwwwvLvwwvu',
  'uuuuuLuuuuu',
];

const WELLS = [
  [
    '.RTO.',
    'RxyxO',
    'qTTTQ',
    '.qqQ.',
  ],
  [
    '.a...',
    'aAz.a',
    'aAzaA',
    'zzzzz',
  ],
];

/** A straight piece, a piece running into the picture, a long piece; rounded merlons along the top. */
const MUDWALL = [
  [
    'R.R.',
    'TTTO',
    'wwvu',
    'wwvu',
  ],
  [
    'R.',
    'TO',
    'wT',
    'wO',
    'wT',
    'wv',
    'wu',
  ],
  [
    'R.R.R.R.',
    'TTTTTTTO',
    'wwwwwwvu',
    'wwwwwwvu',
  ],
];

/** Planks on piles: across a river running north–south (0) and west–east (1). */
const BRIDGE = [
  [
    'b..b..b..b',
    'cccccccccb',
    'tctctctctb',
    'bbbbbbbbbB',
    '.B..B..B..',
  ],
  [
    'b...B',
    'cttcB',
    'cbbcB',
    'cttcB',
    'cbbcB',
    'cttcB',
    'cbbcB',
    'cttcB',
    'cbbcB',
    'b...B',
  ],
];

const blocks = {
  mudbrick: (v) => S.sprite(mudbrick(v.size), MUD),
  granary: () => S.sprite(granary(), { ...MUD, d: 'soil0' }),
  ziggurat: () => S.sprite(ZIGGURAT, BRICK),
  well: (v) => S.sprite(WELLS[v.index], WELL),
  mudwall: (v) => S.sprite(MUDWALL[v.index], MUD),
  bridge_wood: (v) => S.sprite(BRIDGE[v.index], WOOD),
  yard_bronze: (v) => yard(v.index, 'earth', ['laterite1', 'laterite2', 'laterite3'], 21),
};

module.exports = { blocks };
