/* =============================================================================
 * SimEarth 2.0 — Nanotech city blocks
 * -----------------------------------------------------------------------------
 * White shells grown over with green: a dome house with a planted roof,
 * rounded towers with garden terraces, a glass dome with a forest inside, a
 * tapering mega spire ringed with green, a garden pod and a hovering orb, on
 * a park. Style: docs/landschaft-2026-10/stil.md · contract:
 * tools/civ/catalog.js.
 * ========================================================================== */
'use strict';

const S = require('./shapes');
const { yard } = require('./yard');

const SHELL = { R: 'ice4', L: 'ice4', T: 'ice3', S: 'ice2', O: 'ice1', w: 'ice3', v: 'ice2', u: 'ice1', n: 'water4', d: 'water2', g: 'leaf3', G: 'leaf2', K: 'leaf1' };
/** A dome whose rim letters turn into planted green. */
const PLANTED = { ...SHELL, R: 'leaf3', L: 'leaf3', T: 'leaf2', S: 'leaf1', O: 'leaf0' };

/** Green terraces every `step` rows of a tower's wall, from row `top`. */
function terraces(g, top, step) {
  for (let y = top; y < g.length - 2; y += step) {
    for (let x = 0; x < g[y].length; x++) if (g[y][x] !== '.') g[y][x] = x % 3 === 2 ? 'K' : x % 2 ? 'G' : 'g';
  }
  return g;
}

/** A tower with a rounded crown, `w` wide and `h` high. */
function tower(w, h) {
  const g = S.canvas(w, h);
  S.stamp(g, S.dome(w, 3), 0, 0);
  S.wall(g, 0, w - 1, 3, h - 1);
  S.windows(g, Array.from({ length: h - 4 }, (_, k) => 4 + k).filter((y) => y % 2 === 0), 1, w - 3, 2);
  g[h - 1][Math.floor(w / 2) - 1] = 'd';
  g[h - 2][Math.floor(w / 2) - 1] = 'd';
  return terraces(g, 5, 4);
}

function biotower(size) {
  if (size === 's') {
    const g = S.canvas(5, 5);
    S.stamp(g, S.dome(5, 3, 2), 0, 0);
    g[4][2] = 'd';
    g[3][2] = 'd';
    return { g, planted: true };
  }
  if (size === 'm') return { g: tower(6, 10), planted: false };
  return { g: tower(6, 16), planted: false };
}

/** A glass dome with green inside, on a white rim. */
function biodome() {
  const g = S.dome(11, 6, 2);
  for (let y = 2; y < 6; y++) for (let x = 2; x < 9; x++) if (g[y][x] === 'T' || g[y][x] === 'S') g[y][x] = (x + y) % 3 === 0 ? 'G' : 'g';
  return g;
}

/** A spire tapering from 7 px to a point, with a green ring every four rows. */
function megatower() {
  const h = 18;
  const g = S.canvas(7, h);
  for (let y = 0; y < h; y++) {
    const half = Math.min(3, Math.floor((y + 1) / 5));
    for (let x = 3 - half; x <= 3 + half; x++) {
      g[y][x] = x === 3 + half ? 'O' : x === 3 - half ? 'R' : x > 3 ? 'S' : 'T';
      if (y % 4 === 3 && y > 2) g[y][x] = x > 3 ? 'G' : 'g';
    }
  }
  g[h - 1][3] = 'd';
  return g;
}

const GARDEN = [
  [
    '.gGK.',
    'gggGK',
    'gGgGK',
    '.KGK.',
    'RTTSO',
    '.uuu.',
  ],
  [
    '.R.',
    'RLO',
    '.O.',
    '...',
    '.T.',
    'RTO',
  ],
];

const blocks = {
  biotower: (v) => {
    const { g, planted } = biotower(v.size);
    return S.sprite(g, planted ? PLANTED : SHELL);
  },
  biodome: () => S.sprite(biodome(), SHELL),
  megatower: () => S.sprite(megatower(), SHELL),
  garden: (v) => S.sprite(GARDEN[v.index], SHELL),
  yard_nanotech: (v) => yard(v.index, 'park', ['leaf0', 'leaf1', 'lichen1'], 71),
};

module.exports = { blocks };
