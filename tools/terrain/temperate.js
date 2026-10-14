/* =============================================================================
 * SimEarth 2.0 — terrain recipes, family "temperate"
 * -----------------------------------------------------------------------------
 * Bare soil, moss carpet, fern prairie, steppe, meadow, shrubland and the
 * broadleaf/mixed forest floor; first trees, broadleaf trees, seed-fern
 * bushes, flowering and leafy shrubs, early vascular stems, fern fronds,
 * horsetails, flowers and grass tufts. Ids and ranks are fixed in catalog.js.
 *
 *   materials[id](t, d)   paint the seamless texture `t` (Tex, wraps) for density d
 *   objects[id](v)        return a sprite; v = { index, size, form } (trees) or { index }
 *
 * Textures: periodic noise for the large patches, hand-drawn micro-motifs
 * stamped with wrap-around on jittered grids. Densities of one material share
 * seeds and only raise thresholds, so a denser step is a superset of the
 * sparser one and the two blend where the renderer frays them together.
 * Objects: hand-drawn character grids, light from the upper left.
 * ========================================================================== */
'use strict';

const k = require('./kit');

const c = k.c;

/* ------------------------------------------------------------- helpers -- */

/** Ordered-dither threshold at a texture pixel, 0..1 (world-fixed: sizes are multiples of 4). */
const bayer = (x, y) => (k.BAYER4[y & 3][x & 3] + 0.5) / 16;

/** One point per cell of an n×n jittered grid over a seamless texture of `size`. */
function scatter(size, n, seed) {
  const step = size / n;
  const pts = [];
  for (let gy = 0; gy < n; gy++) {
    for (let gx = 0; gx < n; gx++) {
      pts.push({
        x: Math.floor((gx + k.hash(gx, gy, seed)) * step) % size,
        y: Math.floor((gy + k.hash(gx, gy, seed + 1)) * step) % size,
        a: k.hash(gx, gy, seed + 2),
        b: k.hash(gx, gy, seed + 3),
      });
    }
  }
  return pts;
}

/** Distances to the nearest and second-nearest point, wrapping at `size`. */
function nearest2(pts, x, y, size) {
  let d1 = Infinity;
  let d2 = Infinity;
  for (const p of pts) {
    let dx = Math.abs(x - p.x);
    let dy = Math.abs(y - p.y);
    dx = Math.min(dx, size - dx);
    dy = Math.min(dy, size - dy);
    const d = Math.hypot(dx, dy);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
  }
  return [d1, d2];
}

/** Periodic value noise with separate lattice counts across and down (streaks). */
function streaks(size, cellsX, cellsY, seed) {
  return (x, y) => {
    const fx = ((((x % size) + size) % size) / size) * cellsX;
    const fy = ((((y % size) + size) % size) / size) * cellsY;
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = k.smooth(fx - x0);
    const ty = k.smooth(fy - y0);
    const x1 = (x0 + 1) % cellsX;
    const y1 = (y0 + 1) % cellsY;
    const h = (a, b) => k.hash(a, b, seed);
    return k.lerp(k.lerp(h(x0, y0), h(x1, y0), tx), k.lerp(h(x0, y1), h(x1, y1), tx), ty);
  };
}

/**
 * Stamp a motif with wrap-around. Characters: '.' skip, '+'/'-' one ramp step
 * lighter/darker than the pixel below, any other character a palette name from `key`.
 */
function motif(t, x, y, rows, key = {}) {
  rows.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) {
      const ch = row[dx];
      if (ch === '.') continue;
      const under = t.get(x + dx, y + dy);
      const v = ch === '+' ? k.shift(under, 1) : ch === '-' ? k.shift(under, -1) : c(key[ch]);
      t.set(x + dx, y + dy, v);
    }
  });
}

/** A lone pixel (no equal 8-neighbour) takes the most common colour of its 4-neighbours. */
function despeckle(t) {
  const src = Uint8Array.from(t.px);
  const at = (x, y) => src[t.at(x, y)];
  t.each((x, y) => {
    const v = at(x, y);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && at(x + dx, y + dy) === v) return undefined;
    }
    const n = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)];
    let best = n[0];
    let most = 0;
    for (const a of n) {
      const m = n.filter((b) => b === a).length;
      if (m > most) { most = m; best = a; }
    }
    return best;
  });
  return t;
}

/** A soft cushion seen from above at 3/4: lit upper left, dark lower-right rim. */
function cushion(t, cx, cy, r, [dark, mid, light], shine = true) {
  const ry = r * 0.8;
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
      const nx = dx / r;
      const ny = dy / ry;
      const e = nx * nx + ny * ny;
      if (e > 1) continue;
      const l = -(nx * 0.6 + ny * 0.8);
      const tone = e > 0.45 && l < -0.2 ? dark : shine && l > 0.35 && e < 0.6 ? light : mid;
      t.set(cx + dx, cy + dy, c(tone));
    }
  }
}

/** A fern seen from above: `n` fronds of `len` px with paired pinnae, lit from the upper left. */
function rosette(t, cx, cy, n, len, rot, [dark, mid, light]) {
  for (let j = 0; j < n; j++) {
    const a = rot + (j * 2 * Math.PI) / n;
    const ux = Math.cos(a);
    const uy = Math.sin(a) * 0.75;
    const lit = -(ux * 0.6 + uy * 0.8);
    const col = c(lit > 0.6 ? light : lit < -0.35 ? dark : mid);
    const side = c(lit > 0.6 ? mid : dark);
    const nl = Math.hypot(ux, uy);
    const px = -uy / nl;
    const py = ux / nl;
    for (let s = 1; s <= len; s++) {
      const x = cx + ux * s;
      const y = cy + uy * s;
      if (s >= 2 && s < len && s % 2 === 0) {
        t.set(Math.round(x + px), Math.round(y + py), side);
        t.set(Math.round(x - px), Math.round(y - py), side);
      }
      t.set(Math.round(x), Math.round(y), col);
    }
  }
  t.set(cx, cy, c(dark));
}

/* ------------------------------------------------------------ materials -- */

/** Clods lit from the upper left, drawn relative to the soil below. */
const CLODS = [
  ['.++', '+.-', '.--'],
  ['++.', '+.-', '.--'],
  ['.++.', '+..-', '.--.'],
];
/** Pebbles with a short shadow on the soil below. */
const PEBBLES = [
  ['GH.', 'HH-', '.--'],
  ['.GG.', 'GHH-', '.HH-', '..--'],
];
const PEBBLE_KEY = { G: 'rock3', H: 'rock2' };

/** Small grass tufts drawn relative to the ground below: '+' blade tips, '-' blades. */
const TUFTS = [
  ['+.+', '-.-', '.-.'],
  ['.+..', '+-.+', '.--.'],
  ['+...+', '.-.-.', '..-..'],
  ['.+.', '+-+', '---'],
];

const materials = {
  barren: (t) => {
    const S = t.w;
    const crust = k.fbm(S, 8, 3, 2011);
    const damp = k.fbm(S, 8, 2, 2017);
    t.each((x, y) => {
      const b = bayer(x, y) - 0.5;
      if (crust(x, y) + b * 0.06 > 0.57) return c('soil3');
      return damp(x, y) + b * 0.06 < 0.28 ? c('soil1') : c('soil2');
    });
    // Drying cracks on the light crust: the borders of a coarse Voronoi pattern.
    const cells = scatter(S, 8, 2021);
    const crustPx = c('soil3');
    t.each((x, y) => {
      if (t.get(x, y) !== crustPx) return undefined;
      const [d1, d2] = nearest2(cells, x, y, S);
      return d2 - d1 < 0.75 ? c('soil2') : undefined;
    });
    const damp1 = c('soil1');
    const dry = (p) => t.get(p.x, p.y) !== damp1 && t.get(p.x + 2, p.y + 2) !== damp1;
    for (const p of scatter(S, 10, 2031)) if (p.a < 0.5 && dry(p)) motif(t, p.x, p.y, CLODS[Math.floor(p.b * CLODS.length)]);
    for (const p of scatter(S, 5, 2041)) if (p.a < 0.4 && dry(p)) motif(t, p.x, p.y, PEBBLES[p.b < 0.6 ? 0 : 1], PEBBLE_KEY);
    return despeckle(t);
  },

  moss: (t, d) => {
    const S = t.w;
    const g = k.fbm(S, 16, 2, 2111);
    t.each((x, y) => (g(x, y) + (bayer(x, y) - 0.5) * 0.08 < 0.3 ? c('soil1') : c('soil2')));
    // A continuous carpet where the patch noise is low; its lower rim shows its thickness.
    const patch = k.fbm(S, 8, 2, 2113);
    const thr = [0.4, 0.52, 0.68][d];
    const carpet = (x, y) => patch(x, y) < thr;
    t.each((x, y) => {
      if (!carpet(x, y)) return undefined;
      return carpet(x, y + 1) ? c('moss1') : c('moss0');
    });
    // Cushions on the carpet, plus a few strays on the bare soil.
    const pts = scatter(S, 14, 2115).filter((p) => patch(p.x, p.y) < thr - 0.04 || p.a < 0.05).sort((p, q) => p.y - q.y);
    for (const p of pts) cushion(t, p.x, p.y, 1.7 + p.b * 1.4, ['moss1', 'moss2', 'moss3'], p.b > 0.55);
    return despeckle(t);
  },

  fern: (t, d) => {
    const S = t.w;
    const g = k.fbm(S, 16, 2, 2211);
    t.each((x, y) => (g(x, y) + (bayer(x, y) - 0.5) * 0.08 < 0.32 ? c('soil1') : c('soil2')));
    // Dead frond litter.
    for (const p of scatter(S, 12, 2212)) if (p.a < 0.3) motif(t, p.x, p.y, p.b < 0.5 ? ['++.', '.++'] : ['.+', '+.', '+.']);
    // Shade under the fronds, then the fronds themselves: a feathery cover, no blades.
    const patch = k.fbm(S, 8, 2, 2213);
    const thr = [0.4, 0.54, 0.84][d];
    t.each((x, y) => (patch(x, y) < thr ? c('leaf1') : undefined));
    const pts = scatter(S, 11, 2215).filter((p) => patch(p.x, p.y) < thr + 0.02).sort((p, q) => p.y - q.y);
    for (const p of pts) rosette(t, p.x, p.y, 4 + Math.floor(p.b * 2.9), 3 + Math.round(p.b * 1.6), p.a * 6.283, ['leaf1', 'leaf2', 'leaf3']);
    return despeckle(t);
  },

  steppe: (t, d) => {
    const S = t.w;
    const patch = k.fbm(S, 8, 3, 2311);
    // Wind sheen: long, slightly wavy streaks, broken up by patchy noise.
    const wind = streaks(S, 6, 20, 2312);
    const warp = (x) => 2 * Math.sin((2 * Math.PI * x * 2) / S + 0.7) + 1.2 * Math.sin((2 * Math.PI * x * 5) / S + 2.1);
    const gust = (x, y) => 0.65 * wind(x, y + warp(x)) + 0.35 * patch(x, y);
    const bare = k.fbm(S, 16, 2, 2313);
    const bareThr = [0.3, 0.2, 0.08][d];
    t.each((x, y) => {
      const b = bayer(x, y) - 0.5;
      if (bare(x, y) + b * 0.05 < bareThr) return c('soil3');
      return gust(x, y) + b * 0.12 < 0.5 ? c('straw1') : c('straw2');
    });
    // Blades bent to the right by the wind; gusts light their tips in drifting bands.
    const keep = [0.55, 0.8, 1][d];
    for (const p of scatter(S, 48, 2315)) {
      if (p.a > keep) continue;
      if (bare(p.x, p.y) < bareThr + 0.03 && p.a > 0.1) continue;
      const lit = gust(p.x, p.y) > 0.56;
      const rows = p.b > 0.55 ? ['.T', '.T', 'M.', 'R.'] : ['.T', 'M.', 'R.'];
      motif(t, p.x, p.y, rows, lit ? { T: 'straw3', M: 'straw2', R: 'straw1' } : { T: 'straw2', M: 'straw1', R: 'straw0' });
    }
    return despeckle(t);
  },

  meadow: (t, d) => {
    const S = t.w;
    const shade = k.fbm(S, 8, 3, 2411);
    t.each((x, y) => (shade(x, y) + (bayer(x, y) - 0.5) * 0.1 < 0.4 ? c('meadow1') : c('meadow2')));
    const keep = [0.45, 0.7, 0.95][d];
    for (const p of scatter(S, 16, 2415)) if (p.a < keep) motif(t, p.x, p.y, TUFTS[Math.floor(p.b * TUFTS.length)]);
    // Flowers grow in drifts.
    const drift = k.fbm(S, 4, 2, 2416);
    const bloom = [0.36, 0.42, 0.48][d];
    for (const p of scatter(S, 12, 2417)) {
      if (drift(p.x, p.y) > bloom || p.a > 0.7) continue;
      const col = p.b < 0.45 ? 'yellow0' : p.b < 0.8 ? 'white0' : 'blossom0';
      motif(t, p.x, p.y, ['FF'], { F: col });
    }
    if (d === 0) {
      const bare = k.fbm(S, 16, 2, 2413);
      t.each((x, y) => (bare(x, y) + (bayer(x, y) - 0.5) * 0.05 < 0.2 ? c('soil2') : undefined));
    }
    return despeckle(t);
  },

  shrub: (t, d) => {
    const S = t.w;
    const shade = k.fbm(S, 8, 3, 2511);
    t.each((x, y) => (shade(x, y) + (bayer(x, y) - 0.5) * 0.1 < 0.42 ? c('moss1') : c('moss2')));
    const keep = [0.4, 0.55, 0.7][d];
    for (const p of scatter(S, 16, 2515)) if (p.a < keep) motif(t, p.x, p.y, TUFTS[Math.floor(p.b * TUFTS.length)]);
    const bare = k.fbm(S, 16, 2, 2513);
    const bareThr = [0.34, 0.24, 0.14][d];
    t.each((x, y) => {
      const v = bare(x, y) + (bayer(x, y) - 0.5) * 0.05;
      if (v >= bareThr) return undefined;
      return v < bareThr - 0.05 ? c('soil2') : c('soil1');
    });
    // Seedlings and herbs between the bushes.
    const herbs = [0.25, 0.35, 0.45][d];
    for (const p of scatter(S, 10, 2517)) {
      if (p.a > herbs || bare(p.x, p.y) < bareThr + 0.04) continue;
      motif(t, p.x, p.y, p.b < 0.5 ? ['.LL.', 'LMMD', '.DD.'] : ['LL.', 'LMD', '.D.'], { L: 'leaf2', M: 'leaf1', D: 'leaf1' });
    }
    return despeckle(t);
  },

  forest: (t, d) => {
    const S = t.w;
    const hollow = k.fbm(S, 16, 2, 2611);
    t.each((x, y) => (hollow(x, y) + (bayer(x, y) - 0.5) * 0.08 < 0.36 ? c('soil0') : c('soil1')));
    // Leaf litter: short flecks in a few orientations.
    for (const p of scatter(S, 20, 2613)) {
      if (p.a > 0.5) continue;
      const col = p.b < 0.15 ? 'soil3' : 'soil2';
      motif(t, p.x, p.y, p.b < 0.5 ? ['LL'] : p.b < 0.75 ? ['L', 'L'] : ['L.', '.L'], { L: col });
    }
    // Moss cushions and young ferns, more of both under the denser canopy.
    const cover = [0.3, 0.44][d];
    for (const p of scatter(S, 8, 2615).filter((q) => q.a < cover).sort((q, r) => q.y - r.y)) {
      cushion(t, p.x, p.y, 1.5 + p.b * 1.3, ['moss1', 'moss1', 'moss2'], p.b > 0.4);
    }
    for (const p of scatter(S, 7, 2617).filter((q) => q.a < cover).sort((q, r) => q.y - r.y)) {
      rosette(t, p.x, p.y, 4 + Math.floor(p.b * 2.9), 2 + Math.round(p.b * 1.4), p.a * 6.283, ['leaf1', 'leaf1', 'leaf2']);
    }
    return despeckle(t);
  },
};

/* -------------------------------------------------------------- objects -- */

const LEAF = { O: 'leaf0', D: 'leaf1', M: 'leaf2', L: 'leaf3', b: 'bark0', B: 'bark1' };

/**
 * Archaeopteris: a straight trunk with flat, pinnate branch sprays in tiers,
 * widest at the bottom; pinnae tick up (lit) and down (shade) along each spray.
 */
const ARCHAEOPTERIS = {
  s0: [
    '....L.....',
    '...LMD....',
    '..L.MD.D..',
    '..DLMMMO..',
    '...DBbO...',
    '.L.LBb.M..',
    '.DLMMMMMO.',
    '..D.BbO.O.',
    'L.L.Bb.M.M',
    'DLMMMMMMDO',
    '.D.DBbD.O.',
    '....Bb....',
    '...BBbb...',
  ],
  s1: [
    '.....L....',
    '....LMD...',
    '...L.MD.D.',
    '...DLMMMO.',
    '....BbDO..',
    'L.L.Bb.M..',
    'DLMMMMMO..',
    '.D.DBbO...',
    '..L.Bb.M.M',
    '..DLMMMMDO',
    '...DBbD.O.',
    '....Bb....',
    '...BBbb...',
  ],
  m0: [
    '......L......',
    '.....LMD.....',
    '....L.MD.D...',
    '...DLMMMMDO..',
    '....D.Bb.O...',
    '...L.LBb.M.M.',
    '..DLLMMMMMMDO',
    '...D.DBbD.O..',
    '..L.L.Bb.M.M.',
    '.DLLMMMMMMMDO',
    '..D.D.BbD.O.O',
    '.L.L.LBb.M.M.',
    'DLLMMMMMMMMDO',
    '.D.D.DBbD.O.O',
    '......Bb.....',
    '......Bb.....',
    '.....BBbb....',
  ],
  m1: [
    '.......L.....',
    '......LMD....',
    '.....L.MD.D..',
    '....DLMMMDO..',
    '.....DBb.O...',
    '.L.L.LBb.M...',
    'DLLMMMMMMDO..',
    '.D.D.DBbO....',
    '....L.Bb.M.M.',
    '...DLMMMMMMDO',
    '....D.BbD.O.O',
    '.L.L.LBb.M.M.',
    'DLLMMMMMMMMDO',
    '.D.D.DBbD.O.O',
    '......Bb.....',
    '......Bb.....',
    '.....BBbb....',
  ],
  l0: [
    '.......L........',
    '......LMD.......',
    '.....L.MD.D.....',
    '....DLMMMMDO....',
    '.....D.Bb.O.....',
    '.....L.L.M.M....',
    '...DLLMMMMMMDO..',
    '....D.DBbD.O....',
    '...L.L.Bb.M.M...',
    '..DLLMMMMMMMMDO.',
    '...D.D.BbD.O.O..',
    '..L.L.LBb.M.M.M.',
    '.DLLMMMMMMMMMMDO',
    '..D.D.DBbD.O.O..',
    '.......Bb.......',
    '.L.L.L.Bb.M.M.M.',
    'DLLMMMMMMMMMMMDO',
    '.D.D.D.BbD.O.O.O',
    '.......Bb.......',
    '......BBbb......',
  ],
  l1: [
    '........L.......',
    '.......LMD......',
    '.....L.LMD.D....',
    '....DLLMMMDO....',
    '.....D.Bb.O.....',
    '..L.L.LBb.M.....',
    '.DLLMMMMMMDO....',
    '..D.D.DBbO......',
    '.....L.Bb.M.M...',
    '....DLLMMMMMMMDO',
    '.....D.BbD.O.O..',
    '.L.L.L.Bb.M.M...',
    'DLLMMMMMMMMMMDO.',
    '.D.D.D.BbD.O.O..',
    '.......Bb.......',
    '..L.L.LBb.M.M.M.',
    '.DLLMMMMMMMMMMDO',
    '..D.D.DBbD.O.O.O',
    '.......Bb.......',
    '......BBbb......',
  ],
};

/** Broadleaf tree: a domed crown of leaf clumps, each lit at its upper left, over a visible trunk. */
const OAK = {
  s0: [
    '...DDD....',
    '..DLLMDD..',
    '.DLLMMLMD.',
    '.DLMMDMMO.',
    'DLMMDLLMDO',
    'DMMDLMMMDO',
    'DMMMMMMDDO',
    '.ODMDDDDO.',
    '..OOBbOO..',
    '....Bb....',
    '....Bb....',
    '....Bb....',
    '...BBbb...',
  ],
  s1: [
    '...DDDD...',
    '..DLLLMD..',
    '.DLLMMMMD.',
    '.DLMMDDMO.',
    'DLMDDLLMDO',
    'DMMLLMMMDO',
    'ODMMMMMDDO',
    '.OODDDDOO.',
    '...OOOO...',
    '....Bb....',
    '....Bb....',
    '....Bb....',
    '...BBbb...',
  ],
  m0: [
    '...DDD.......',
    '..DLLMDDDDD..',
    '.DLMMMLLMMMO.',
    '.DDMMMDDMMDO.',
    '..DLDDLLLMDO.',
    'DDLMMLLMMMD..',
    'DMMMLLMMMDDO.',
    'DMMDDDMMDDDO.',
    'OODLLLMMMMO..',
    '..DMMMMDDDO..',
    '..OMDDDDDDO..',
    '...OOOOOOO...',
    '......Bb.....',
    '......Bb.....',
    '......Bb.....',
    '......Bb.....',
    '.....BBbb....',
  ],
  m1: [
    '.....DDDD....',
    '...DDLLMMO...',
    '...DDMMMDD...',
    '..DLLDMDLLDD.',
    '.DLLMDDLLLMMO',
    'DLMDDLLDDMMDO',
    'DMMLLLMMMDDDO',
    '.DDLMMMMDDDDO',
    '.ODMMDDMMDDO.',
    '..DLLMMMMMD..',
    '..DMMMDDDDDO.',
    '..OOODDDOOO..',
    '.....OOO.....',
    '......Bb.....',
    '......Bb.....',
    '......Bb.....',
    '.....BBbb....',
  ],
  l0: [
    '....DDD..DD.....',
    '..DDLLMDDLLDD...',
    '..DLMMMDLLLMMO..',
    '..DDMMDDDDMMDO..',
    '..DLDDLLLLDDDD..',
    '.DLLMMLLMMDLLLD.',
    'DLMMMDLMMMLLLMMO',
    'DMMMDDDMMDDDDMDO',
    'OMDDLLMDDLLLMDDO',
    '.DLLMMMMLLMMMMDO',
    '.DMMMMDLMMMMDDO.',
    '.OMMDDDMMMDDDDO.',
    '..OODDDOODDDDO..',
    '....OOOBbOOOO...',
    '.......Bb.......',
    '.......Bb.......',
    '.......Bb.......',
    '.......Bb.......',
    '.......Bb.......',
    '......BBbb......',
  ],
  l1: [
    '......DDDD......',
    '.....DLLLMD.....',
    '...DDDLMMMDD....',
    '.DDLMMDMMDLLDDD.',
    'DLLMMDDDDDLLMMMO',
    'DMMMDLLLLMDMMMDO',
    'OMDDLLLMMMMDDDDO',
    '.DLLDDMMMDDDDDO.',
    '.DLMMMMDDDLLLMD.',
    'DMMMDDDDDDDDMMDO',
    'DMMDLLLMMMMMDDDO',
    'ODDDMMMMMDDDDDDO',
    '.OOOMMDDDDDDOOO.',
    '....OOOOOOOO....',
    '........Bb......',
    '........Bb......',
    '........Bb......',
    '........Bb......',
    '........Bb......',
    '.......BBbb.....',
  ],
};

/** Leafy shrub: a low, trunkless dome of leaf clumps, wider than tall. */
const SHRUB = [
  [
    '...D.DDD..',
    '.DDLDMLMD.',
    '.DMMMMMMO.',
    'DLLLLMMMO.',
    '.DMMMMMDO.',
    '.DMDDDDDO.',
    '.OOOOOOOO.',
  ],
  [
    '.......DD...',
    '..DDDDDLLD..',
    '.DLLMMMMMMO.',
    '.DLLMMDMLLD.',
    'DLMLLLLMMMMO',
    'DMLMMMMMMDDO',
    'DMMMMMDDDDDO',
    'OODDDDDOOOOO',
    '..OOOOOOOOO.',
  ],
  [
    '........DDDD...',
    '...DDDDDLLLMD..',
    '..DLLMMLLMMMO..',
    '..DMMLLLMMMMO..',
    '.DLLMLMMMMLLLD.',
    'DLMMMMMMMLLMMMO',
    'DMMMLLLLMMMMMDO',
    'DMLLMMMMMMMDDDO',
    'ODMMMMMDDDDDDOO',
    '.OOODDDDDOOOOO.',
    '....OOOOOOO....',
  ],
];

/** Fern: arching pinnate fronds from one base, tips curling outwards. */
const FERN = [
  [
    '...L....',
    '.LLLM.L.',
    'LM.LMDMM',
    'L.DMDO.M',
    '..DDOO..',
  ],
  [
    '.....L.....',
    '..LL.LM.LL.',
    '.LMMLLMDMML',
    'LM.DDMMDD.M',
    'L.DMDMDOMD.',
    '...DDDMOO..',
  ],
  [
    '......L.......',
    '.....LM.......',
    '..LL.LM..LL...',
    '.LMML.LMDLMML.',
    'LM..DLMMDM..ML',
    'L.DMDLMMDDMD.M',
    '..DMDDMDMODMD.',
    '...D.DMDDO.D..',
    '.....DDMOO....',
  ],
];

/** Rhynia/Cooksonia: leafless, forking green stems with yellow sporangia at the tips. */
const RHYNIA = [
  [
    'y...y',
    'Y...Y',
    'h..G.',
    '.hG..',
    '..G..',
    '.gg..',
  ],
  [
    '.y...y...',
    '.Y...Y.y.',
    '.h..h..Y.',
    '..hG..hG.',
    '...G.hG..',
    '...GhG...',
    '...gg....',
  ],
  [
    '..y......y..',
    '..Y..y...Y..',
    '..h..Y...h.y',
    '...h.G..h..Y',
    '...hG...hGG.',
    '.y..G..h.G..',
    '.Y..G..hG...',
    '..h.G..G....',
    '...hG.Gg....',
    '....gGg.....',
  ],
];

/** Seed fern: a trunkless fountain of feathery fronds, pale seeds hanging at the tips. */
const SEED_FERN = [
  [
    '......M....',
    '..D.LMD.D..',
    '.OD..MD.DO.',
    '..ODMMMDO..',
    'DMMD.MDDMMD',
    'M.DMDMDMD.M',
    '....DOD....',
  ],
  [
    '..S..........',
    '..s....M..D..',
    '.ODM.LMD.MDO.',
    '..OD..MD.DO..',
    '..ODMLMDMDO..',
    'DMMOD.MDDOMMD',
    'M.DMDMMMDMD.M',
    'S..DMDMDMD...',
    's....DOD.....',
  ],
  [
    '..S.........S..',
    '..s.....M...s..',
    '..ODM.LMD.MDO..',
    '..OD...MD..DO..',
    '...ODMLMDMDO...',
    '...OD..MD.DO...',
    'DMMODMLMDMDOMMD',
    'M.DMOD.MDDOMD.M',
    'S..DMDMMMDMD..S',
    's...DMDMDMD...s',
    '......DOD......',
  ],
];

/** Flowering shrub: a vase of arching flowering branches, widest at the top. */
const FLOWER_BUSH = [
  [
    '.Pp..Pp.',
    'DppDDppO',
    'DLMPpMDO',
    'DMMppMDO',
    '.DMMMDO.',
    '..DDOO..',
    '...OO...',
  ],
  [
    '..Pp...Pp..',
    '.DppDDDppD.',
    'DLMMMLMMMMO',
    'DMPpMMMPpDO',
    'DMppMPpppDO',
    '.DMMMppMDO.',
    '..DMMMDDO..',
    '...DDDOO...',
    '....OOO....',
  ],
  [
    '...Pp....Pp...',
    '..DppD..DppD..',
    '.DLMMMDDLMMMO.',
    'PpLMPpMLMMPpMO',
    'ppMMppMMLMppDO',
    '.DMMMMMPpMMMDO',
    '..DMPpMppMMDO.',
    '..DMppMMMMDO..',
    '...DMMMDDDO...',
    '....DDDDOO....',
    '.....OOOO.....',
  ],
];

/** Horsetail: upright jointed stems with whorls of thin branches, a pale cone on the tallest. */
const HORSETAIL = [
  [
    '..c..',
    '..C..',
    '..q..',
    'q.P.q',
    '.qPq.',
    '..p..',
    'q.P.q',
    '.qPq.',
    '..pp.',
  ],
  [
    '.c......',
    '.C...c..',
    '.q...C..',
    'qPq..q..',
    '.p..qPq.',
    '.q...p..',
    'qPq..q..',
    '.p..qPq.',
    '.q...p..',
    'qPq.qPq.',
    '.pp..pp.',
  ],
  [
    '..c......',
    '..C....c.',
    '..q....C.',
    'q.P.q..q.',
    '.qPq..qPq',
    '..p...qPq',
    '..q..q.p.',
    'q.P.q..q.',
    '.qPq.q.P.',
    '..p...qPq',
    '..q....p.',
    '.qPq..qPq',
    '..pp..pp.',
  ],
];

/** Flowers: 2-px blossoms on short stems; pink, yellow and white. */
const FLOWERS = [
  [
    '.Pp...Pp.',
    '.pp.Pp.pp',
    '..G.pp.G.',
    '.lG.G..Gl',
    '..mGmGmG.',
    '...gGg...',
  ],
  [
    '.yy...yy.',
    '.yo.yy.yo',
    '..G.yo.G.',
    '.lG.G..Gl',
    '..mGmGmG.',
    '...gGg...',
  ],
  [
    '.ww...ww.',
    '.wy.ww.wy',
    '..G.wy.G.',
    '.lG.G..Gl',
    '..mGmGmG.',
    '...gGg...',
  ],
];

/** Grass tuft: blades fanning from a dark base; the largest carries ripe seed heads. */
const GRASS = [
  [
    '...l...',
    '.l.m.l.',
    '..mGm..',
    '.mGgGm.',
    '..ggg..',
  ],
  [
    '....l....',
    '.l..m..l.',
    '.m.lG.m..',
    '..mmGgm.l',
    'l.GmgGG.m',
    '.gGgGgGg.',
    '..gggggg.',
  ],
  [
    '...S...S..',
    '...t.l.t..',
    '.l.t.m.t.l',
    '..m.lG.Gm.',
    '.lmGmgGg..',
    '..GgGgGg..',
    '..gggggg..',
  ],
];

const objects = {
  archaeopteris: (v) => k.grid(ARCHAEOPTERIS[`${v.size}${v.form}`], LEAF),
  oak: (v) => k.grid(OAK[`${v.size}${v.form}`], LEAF),
  seed_fern: (v) => k.grid(SEED_FERN[v.index], { ...LEAF, s: 'straw1', S: 'straw3' }),
  flower_bush: (v) => k.grid(FLOWER_BUSH[v.index], { O: 'meadow0', D: 'meadow1', M: 'meadow2', L: 'meadow3', p: 'blossom0', P: 'blossom1' }),
  shrub: (v) => k.grid(SHRUB[v.index], LEAF),
  rhynia: (v) => k.grid(RHYNIA[v.index], { g: 'meadow0', G: 'meadow2', h: 'meadow3', y: 'yellow0', Y: 'straw1' }),
  fern_frond: (v) => k.grid(FERN[v.index], LEAF),
  horsetail: (v) => k.grid(HORSETAIL[v.index], { p: 'pine1', P: 'pine2', q: 'pine3', c: 'straw2', C: 'straw1' }),
  flowers: (v) => k.grid(FLOWERS[v.index], { g: 'meadow0', G: 'meadow1', m: 'meadow2', l: 'meadow3', p: 'blossom0', P: 'blossom1', y: 'yellow0', o: 'orange0', w: 'white0' }),
  grass_tuft: (v) => k.grid(GRASS[v.index], { g: 'meadow0', G: 'meadow1', m: 'meadow2', l: 'meadow3', S: 'straw3', t: 'straw1' }),
};

module.exports = { materials, objects };
