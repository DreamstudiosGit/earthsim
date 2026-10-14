/* =============================================================================
 * SimEarth 2.0 — terrain recipes, family "wet"
 * -----------------------------------------------------------------------------
 * Mud, marsh, swamp-forest floor, the water overlays (coastal and ocean
 * ripples, freshwater algae film) and the river sprites; scale trees, swamp
 * cypresses, liverworts, reed, sundew and kelp. Ids and ranks are fixed in
 * catalog.js.
 *
 *   materials[id](t, d)   paint the seamless texture `t` (Tex, wraps) for density d
 *   overlays[id](t)       paint a seamless overlay; 0 (transparent) where water shows
 *   objects[id](v)        return a sprite; v = { index, size, form } (trees) or { index }
 * ========================================================================== */
'use strict';

const k = require('./kit');

const c = k.c;

/* --------------------------------------------------------------- helpers -- */

/** The value of `f` below which the share `q` of a size×size texture lies. */
function level(f, size, q) {
  const v = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) v.push(f(x, y));
  v.sort((a, b) => a - b);
  return v[Math.min(v.length - 1, Math.floor(q * v.length))];
}

/** A yes/no field over a seamless texture, read with wrap-around; `mark` sets pixels later. */
function field(size, test = () => false) {
  const m = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) m[y * size + x] = test(x, y) ? 1 : 0;
  const idx = (x, y) => (((y % size) + size) % size) * size + (((x % size) + size) % size);
  const f = (x, y) => m[idx(x, y)];
  f.mark = (x, y, v = 1) => { m[idx(x, y)] = v; };
  return f;
}

/** Lone pixels (no same-coloured 4-neighbour) take their most common neighbour: clusters ≥ 2 px. */
function despeckle(t, passes = 3) {
  for (let p = 0; p < passes; p++) {
    const src = Uint8Array.from(t.px);
    const at = (x, y) => src[(((y % t.h) + t.h) % t.h) * t.w + (((x % t.w) + t.w) % t.w)];
    let changed = 0;
    for (let y = 0; y < t.h; y++) {
      for (let x = 0; x < t.w; x++) {
        const v = at(x, y);
        const n = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)];
        if (n.includes(v)) continue;
        let best = n[0];
        let most = 0;
        for (const q of n) {
          const count = n.filter((r) => r === q).length;
          if (count > most) { best = q; most = count; }
        }
        t.px[y * t.w + x] = best;
        changed++;
      }
    }
    if (!changed) break;
  }
  return t;
}

/** One jittered spot per `step`×`step` cell: fn(x, y, roll, pick), all from the hash. */
function scatter(size, step, seed, fn) {
  for (let by = 0; by < size; by += step) {
    for (let bx = 0; bx < size; bx += step) {
      fn(bx + Math.floor(k.hash(bx, by, seed + 1) * step), by + Math.floor(k.hash(bx, by, seed + 2) * step),
        k.hash(bx, by, seed), k.hash(bx, by, seed + 3));
    }
  }
}

/** Character rows -> list of [dx, dy, ch] for every non-'.' cell. */
function cells(rows) {
  const out = [];
  rows.forEach((r, dy) => [...r].forEach((ch, dx) => { if (ch !== '.') out.push([dx, dy, ch]); }));
  return out;
}

/** k.grid with a width check, so a mistyped row fails loudly. */
function art(rows, key) {
  const w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) throw new Error(`wet: row ${i} is ${r.length} wide, expected ${w}`); });
  return k.grid(rows, key);
}

/* ------------------------------------------------------------- materials -- */

/** Pool outlines ('#' = water); several per texture, placed by hash. */
const POOLS = [
  ['.###.', '#####', '.##..'],
  ['###..', '#####', '.####'],
  ['..####..', '.#######', '#######.', '.####...'],
  ['####', '.##.'],
  ['.###...', '#######', '...####'],
  ['..##...', '.#####.', '#######', '.#####.', '...##..'],
];

/**
 * Water pixels of a ground texture: the near (upper-left) bank shades the
 * water's first row, a short glint lies inside, and the rims around are
 * painted by `rim` (dark on the near side, lit on the far side).
 */
function paintPools(t, pool, tones, rim) {
  const S = t.w;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (pool(x, y)) {
        let v = tones.body;
        if (!pool(x, y - 1)) v = tones.shade;
        else if (pool(x - 1, y) && pool(x + 1, y) && pool(x, y + 1) && pool(x, y - 1) && k.hash(x >> 1, y, 409) < 0.45) v = tones.glint;
        t.set(x, y, c(v));
      } else if (pool(x + 1, y) || pool(x, y + 1)) {
        t.set(x, y, c(rim.near));
      } else if (pool(x - 1, y) || pool(x, y - 1)) {
        t.set(x, y, c(rim.far));
      }
    }
  }
}

/** Mark pools from POOLS on a jittered grid; `keep(roll)` decides per spot (same rolls for every density). */
function placePools(S, step, seed, keep, shapes = POOLS) {
  const pool = field(S);
  scatter(S, step, seed, (x, y, roll, pick) => {
    if (!keep(roll)) return;
    for (const [dx, dy] of cells(shapes[Math.floor(pick * shapes.length)])) pool.mark(x + dx, y + dy);
  });
  return pool;
}

/** Dark wet mud: soft wetter patches, small puddles with a shaded near bank and a lit far rim, a few pits. */
function mud(t) {
  const S = t.w;
  const wet = k.fbm(S, 8, 2, 401);
  const soft = field(S, ((l) => (x, y) => wet(x, y) < l)(level(wet, S, 0.34)));
  t.each((x, y) => c(soft(x, y) ? 'mud0' : 'mud1'));
  despeckle(t);
  // Wet sheen: the far (lower-right) lip of a hollow catches the light in short strokes.
  const lip = field(S, (x, y) => !soft(x, y) && soft(x - 1, y - 1) && soft(x, y - 1) && k.hash(x >> 2, y, 405) < 0.5);
  t.each((x, y) => (lip(x, y) && (lip(x - 1, y) || lip(x + 1, y)) ? c('mud2') : undefined));
  // Pits and drag marks: a dark dent with its lit lower lip.
  scatter(S, 8, 404, (x, y, roll) => {
    if (roll > 0.4 || soft(x, y)) return;
    t.set(x, y, c('mud0')); t.set(x + 1, y, c('mud0'));
    t.set(x + 1, y + 1, c('mud2')); t.set(x + 2, y + 1, c('mud2'));
  });
  const pool = placePools(S, 16, 402, (r) => r < 0.8, POOLS.slice(0, 5));
  paintPools(t, pool, { shade: 'water1', body: 'water2', glint: 'water3' }, { near: 'mud0', far: 'mud2' });
  return despeckle(t, 2);
}

/** Sedge tussocks: lit top-left, shaded lower right, a couple of blade tips. '2' light … '0' dark. */
const TUSSOCKS = [
  ['.2.1.', '22211', '21110', '.0000'],
  ['22.1', '2211', '1100'],
  ['..2.1.', '.22211', '222111', '211110', '.00000'],
  ['.2..', '221.', '2111', '1100'],
];

/** Open bog: wet peat with sedge tussocks on a moss carpet and dark pools; denser = more cover, fewer pools. */
function marsh(t, d) {
  const S = t.w;
  const wet = k.fbm(S, 4, 3, 411);
  const veg = k.fbm(S, 8, 3, 412);
  const peat = field(S, ((l) => (x, y) => wet(x, y) < l)(level(wet, S, 0.38)));
  const carpet = field(S, ((l) => (x, y) => veg(x, y) > l)(level(veg, S, 1 - [0.4, 0.62, 0.84][d])));
  t.each((x, y) => {
    if (carpet(x, y)) {
      if (!carpet(x - 1, y) || !carpet(x, y - 1)) return c('moss1');
      // Sedge blades: short upright strokes in the carpet.
      return k.hash(x, y >> 1, 415) < 0.2 ? c('moss1') : c('moss0');
    }
    if (carpet(x - 1, y) || carpet(x, y - 1)) return c('mud0');
    return c(peat(x, y) ? 'mud0' : 'mud1');
  });
  despeckle(t);
  const pool = placePools(S, 13, 416, (r) => r < [0.85, 0.5, 0.2][d]);
  // Standing water between the tussocks: thin dark slivers on the open peat.
  scatter(S, 6, 418, (x, y, roll, pick) => {
    if (roll > [0.5, 0.3, 0.12][d] || carpet(x, y) || carpet(x + 2, y)) return;
    for (let i = 0; i < 2 + Math.floor(pick * 2); i++) pool.mark(x + i, y);
  });
  const tone = { 2: 'moss2', 1: 'moss1', 0: 'moss0' };
  scatter(S, 7, 417, (x, y, roll, pick) => {
    if (roll > [0.35, 0.55, 0.75][d]) return;
    const shape = cells(TUSSOCKS[Math.floor(pick * TUSSOCKS.length)]);
    if (shape.some(([dx, dy]) => pool(x + dx, y + dy) || pool(x + dx + 1, y + dy) || pool(x + dx, y + dy + 1))) return;
    for (const [dx, dy, ch] of shape) t.set(x + dx, y + dy, c(tone[ch]));
  });
  paintPools(t, pool, { shade: 'water1', body: 'water2', glint: 'water3' }, { near: 'mud0', far: 'mud2' });
  return despeckle(t, 2);
}

/** Moss hummocks on the forest floor, leaf ramp: '2' light … '0' dark. */
const HUMMOCKS = [
  ['.22.', '2211', '1100'],
  ['.221.', '22111', '11100', '.000.'],
  ['22.', '210', '.00'],
];

/** Waterlogged forest floor: dark peat, black pools, moss hummocks among the roots, fallen twigs. */
function swampForest(t, d) {
  const S = t.w;
  const wet = k.fbm(S, 8, 2, 421);
  const veg = k.fbm(S, 8, 3, 422);
  const peat = field(S, ((l) => (x, y) => wet(x, y) < l)(level(wet, S, 0.55)));
  const carpet = field(S, ((l) => (x, y) => veg(x, y) > l)(level(veg, S, 1 - [0.3, 0.46][d])));
  t.each((x, y) => {
    if (carpet(x, y)) {
      if (!carpet(x - 1, y) || !carpet(x, y - 1)) return c('leaf1');
      return c('leaf0');
    }
    return c(peat(x, y) ? 'mud0' : 'mud1');
  });
  despeckle(t);
  // Fallen twigs on the open peat, two to three pixels on a diagonal.
  scatter(S, 12, 426, (x, y, roll) => {
    if (roll > 0.5 || carpet(x, y) || carpet(x + 2, y + 1)) return;
    t.set(x, y, c('bark1')); t.set(x + 1, y, c('bark1')); t.set(x + 2, y + 1, c('bark1')); t.set(x + 3, y + 1, c('bark1'));
  });
  const pool = placePools(S, 16, 424, (r) => r < [0.9, 0.6][d], POOLS.slice(2));
  scatter(S, 8, 425, (x, y, roll, pick) => {
    if (roll > [0.35, 0.2][d] || carpet(x, y) || carpet(x + 2, y)) return;
    for (let i = 0; i < 2 + Math.floor(pick * 2); i++) pool.mark(x + i, y);
  });
  const tone = { 2: 'leaf2', 1: 'leaf1', 0: 'leaf0' };
  scatter(S, 8, 427, (x, y, roll, pick) => {
    if (roll > [0.4, 0.6][d]) return;
    const shape = cells(HUMMOCKS[Math.floor(pick * HUMMOCKS.length)]);
    if (shape.some(([dx, dy]) => pool(x + dx, y + dy) || pool(x + dx + 1, y + dy) || pool(x + dx, y + dy + 1))) return;
    for (const [dx, dy, ch] of shape) t.set(x + dx, y + dy, c(tone[ch]));
  });
  paintPools(t, pool, { shade: 'water0', body: 'water1', glint: 'water2' }, { near: 'mud0', far: 'mud1' });
  return despeckle(t, 2);
}

const materials = {
  mud: (t) => mud(t),
  marsh: (t, d) => marsh(t, d),
  swamp_forest: (t, d) => swampForest(t, d),
};

/* -------------------------------------------------------------- overlays -- */

/** Sunlit shallows: short glints, bunched where the sun catches the water. */
function rippleCoast(t) {
  const S = t.w;
  const sun = k.fbm(S, 4, 2, 431);
  scatter(S, 8, 432, (x, y, roll, pick) => {
    if (roll > (sun(x, y) - 0.35) * 1.4) return;
    // A sunlit pair leads, the glint trails off; the longest break into two wavelets.
    const len = [2, 4, 5, 6][Math.floor(pick * 4)];
    for (let i = 0; i < len; i++) t.set(x + i, y, c(i < 2 && len > 2 ? 'water7' : 'water6'));
    if (len === 6) { t.set(x + 4, y, 0); t.set(x + 5, y, 0); t.set(x + 5, y + 1, c('water6')); t.set(x + 6, y + 1, c('water6')); }
  });
  return t;
}

/** Open sea: sparse long swell crests, all running the same way, lit at their left end. */
function rippleOcean(t) {
  const S = t.w;
  for (let by = 0; by < S; by += 10) {
    for (let bx = 0; bx < S; bx += 32) {
      if (k.hash(bx, by, 441) > 0.5) continue;
      const x = bx + Math.floor(k.hash(bx, by, 442) * 16);
      const y = by + Math.floor(k.hash(bx, by, 443) * 4);
      const len = 10 + Math.floor(k.hash(bx, by, 444) * 10);
      const step = 3 + Math.floor(k.hash(bx, by, 445) * (len - 6));
      for (let i = 0; i < len; i++) t.set(x + i, y + (i >= step ? 1 : 0), c(i < 3 ? 'water5' : 'water4'));
    }
  }
  return t;
}

/** Freshwater green algae: floating mats with filament streaks trailing off them, submerged wisps darker. */
function algaeFilm(t) {
  const S = t.w;
  const mat = k.fbm(S, 8, 3, 451);
  const warp = k.fbm(S, 4, 2, 452);
  const core = level(mat, S, 0.97);
  const fringe = level(mat, S, 0.6);
  // Filaments drift on a slight slant; the slope keeps the stripes periodic over the texture.
  const streak = (x, y, w) => {
    const v = (y + x / 4 + warp(x, y) * 12) / 3;
    return v - Math.floor(v) < w;
  };
  const float = field(S, (x, y) => mat(x, y) > core || (mat(x, y) > (core + fringe * 2) / 3 && streak(x, y, 0.4)));
  const sunk = field(S, (x, y) => !float(x, y) && !float(x, y - 1) && mat(x, y) > fringe && streak(x + 1, y + 1, 0.38));
  t.each((x, y) => {
    if (float(x, y)) {
      if (!float(x, y - 1) || !float(x - 1, y)) return c('meadow3');
      if (!float(x, y + 1)) return c('meadow1');
      return c('meadow2');
    }
    return sunk(x, y) ? c('leaf2') : 0;
  });
  return despeckle(t, 2);
}

const overlays = {
  ripple_coast: (t) => rippleCoast(t),
  ripple_ocean: (t) => rippleOcean(t),
  algae_film: (t) => algaeFilm(t),
};

/* --------------------------------------------------------------- objects -- */

/**
 * Scale tree (Lepidodendron): a tall pole with a diamond lattice of leaf
 * cushions, forking at the top into twigs that end in upright leaf brushes.
 * The young tree is still an unbranched pole with one terminal brush (s1).
 */
const LEPIDO_KEY = { d: 'leaf3', c: 'leaf2', b: 'leaf1', a: 'leaf0', z: 'soil2', y: 'bark1', x: 'bark0' };
const LEPIDO = {
  s0: [
    '..d.......',
    '.dca...d..',
    '..cb..dca.',
    '.dba...cb.',
    '..a...dba.',
    '..y....a..',
    '...y...y..',
    '....y.y...',
    '....zx....',
    '....yx....',
    '....zx....',
    '....yx....',
    '...yzxx...',
  ],
  s1: [
    '....dc....',
    '...dca....',
    '..dccba...',
    '...cba....',
    '..dcbba...',
    '...baa....',
    '....yx....',
    '....zx....',
    '....yx....',
    '....zx....',
    '....yx....',
    '....zx....',
    '...yzxx...',
  ],
  m0: [
    '.........dc..',
    '..dc....dcca.',
    '.dcca....cba.',
    '..cba...dcba.',
    '.dcba....aa..',
    '..aa.....y...',
    '...y.....y...',
    '....y...y....',
    '.....y.y.....',
    '.....zyx.....',
    '.....yzx.....',
    '.....zyx.....',
    '.....yzx.....',
    '.....zyx.....',
    '.....yzx.....',
    '.....zyx.....',
    '....yzyxx....',
  ],
  m1: [
    '......d......',
    '.....dca...d.',
    '.d....cb..dca',
    'dca..dba...cb',
    '.cb...a...dba',
    'dba...y....a.',
    '.a....y....y.',
    '.y.....y..y..',
    '..y.....yy...',
    '...y...y.....',
    '....y..y.....',
    '.....zyx.....',
    '.....yzx.....',
    '.....zyx.....',
    '.....yzx.....',
    '.....zyx.....',
    '....yzyxx....',
  ],
  l0: [
    '.....d....d.....',
    '....dca..dca....',
    '.d...cb...cb..d.',
    'dca.dba..dba.dca',
    '.cb..a....a...cb',
    'dba..y....y..dba',
    '.a...y....y...a.',
    '.y..y......y..y.',
    '..yy........yy..',
    '....yy....yy....',
    '......y..y......',
    '.......zyx......',
    '.......yzx......',
    '.......zyx......',
    '.......yzx......',
    '.......zyx......',
    '.......yzx......',
    '.......zyx......',
    '.......yzx......',
    '......yzyxx.....',
  ],
  l1: [
    '......dc........',
    '.....dcca...dc..',
    '......cba..dcca.',
    '.dc..dcba...cba.',
    'dcca..aa...dcba.',
    '.cba..y.....aa..',
    'dcba..y.....y...',
    '.aa..y......y...',
    '..y..y.....y....',
    '...yy.....y.....',
    '.....yy..y......',
    '.......zyx......',
    '.......yzx......',
    '.......zyx......',
    '.......yzx......',
    '.......zyx......',
    '.......yzx......',
    '.......zyx......',
    '.......yzx......',
    '......yzyxx.....',
  ],
};

/**
 * Swamp cypress (Taxodium): a narrow, soft-edged column with a rounded top
 * on a flared, buttressed foot that stands in a pool, knees poking out.
 */
const CYPRESS_KEY = { E: 'leaf3', D: 'pine3', C: 'pine2', B: 'pine1', A: 'pine0', y: 'bark1', x: 'bark0', w: 'water4', v: 'water3' };
const CYPRESS = {
  s0: [
    '....ED....',
    '...EDCB...',
    '...DDCBA..',
    '...BCBBA..',
    '...EDCCA..',
    '...DCCBA..',
    '...BCBBA..',
    '..EDDCCA..',
    '...DCCBA..',
    '...BBBAA..',
    '....yx....',
    '..vyyxxv..',
    '.wvyyxxxw.',
  ],
  s1: [
    '.....E....',
    '....EDB...',
    '...EDCBA..',
    '...BCBBA..',
    '...EDCCBA.',
    '...DDCBA..',
    '...BCBBA..',
    '...EDCCA..',
    '...DCCBA..',
    '....BBA...',
    '....yx....',
    '.wvyyxxv..',
    'wvvyyxxxvw',
  ],
  m0: [
    '.....EDC.....',
    '....EDDCB....',
    '....DDCCBA...',
    '...BCCBBBA...',
    '...EDDCCBA...',
    '...DDCCBBA...',
    '...BCCBBBAA..',
    '..EDDDCCCBA..',
    '...DDCCCBBA..',
    '...BCCBBBAA..',
    '...EDDCCCBA..',
    '...DDCCBBBA..',
    '....BBBBBA...',
    '......yx.....',
    '.....yyxx....',
    '..y.vyyxxvw..',
    '.wxvyyyxxxvw.',
  ],
  m1: [
    '......E......',
    '.....EDB.....',
    '.....DCBA....',
    '....EDCBA....',
    '....BCBBA....',
    '...EDDCCBA...',
    '...DDCCBBA...',
    '...BCCBBBAA..',
    '..EDDCCCCBA..',
    '...DDCCCBBA..',
    '...BCCBBBBA..',
    '...EDDCCBBA..',
    '....BBBBBA...',
    '......yx.....',
    '.....yyxx....',
    '..wvyyyxxv.y.',
    'wvvyyyyxxxvxw',
  ],
  l0: [
    '......EDDC......',
    '.....EDDCCB.....',
    '.....DDCCBBA....',
    '....BCCBBBBA....',
    '....EDDCCCBA....',
    '....DDDCCBBA....',
    '....BCCBBBAA....',
    '...EDDDCCCBA....',
    '....DDCCCBBAA...',
    '....BCCBBBBA....',
    '....EDDCCCBA....',
    '....DDCCCBBA....',
    '....BCCBBBAA....',
    '....BDDCCBBA....',
    '.....BBBBBA.....',
    '.......yx.......',
    '.......yx.......',
    '......yyxx......',
    '..y.wvyyyxxvw...',
    '.wxvvyyyyxxxxvw.',
  ],
  l1: [
    '.......ED.......',
    '......EDCB......',
    '......DCCBA.....',
    '.....EDCCBA.....',
    '.....BCCBBA.....',
    '....EDDCCBBA....',
    '....DDCCCBBA....',
    '....BCCBBBAA....',
    '...EDDDCCCBA....',
    '....DDCCCBBAA...',
    '....BCCBBBBA....',
    '....EDDCCCBA....',
    '....DDCCBBBA....',
    '....BCCBBBAA....',
    '.....BBBBAA.....',
    '.......yx.......',
    '.......yx.......',
    '......yyxx......',
    '...wvyyyyxxvw.y.',
    '.wvvyyyyyxxxxvxw',
  ],
};

/** Liverwort (Marchantia): flat forked thalli with notched tips, the oldest with umbrella-like stalks. */
const LIVERWORT_KEY = { d: 'meadow3', c: 'leaf3', b: 'leaf2', a: 'leaf0', s: 'straw1', t: 'straw2' };
const LIVERWORT = [
  [
    '.dd..dd..',
    'dcbddcbd.',
    'cbbccbbcd',
    '.aabbaab.',
    '..a..aa..',
  ],
  [
    '.dd.dd.......',
    'dcbdcbd..dd..',
    'cbbcbbcddcbd.',
    '.aacbabcbbbcd',
    '...aa.abaabc.',
    '.......aa.a..',
  ],
  [
    '..dcd....dcd..',
    '.dcccb..dcccb.',
    '..a.a....a.a..',
    '...t......t...',
    '.dds..dd..s.d.',
    'dcbsddcbd.sdcd',
    'cbbcbbbbccbbbc',
    '.aaa.aaa.aaaa.',
  ],
];

/** Reed (Phragmites): tall stalks with leaves angled off them and brown plumes nodding in the wind. */
const REED_KEY = { s: 'straw3', r: 'straw2', q: 'straw1', p: 'straw0', g: 'moss2', h: 'moss1', O: 'soil3', o: 'soil2', n: 'soil1' };
const REED = [
  [
    '...O....',
    '..Oo..O.',
    '.Oon.Oo.',
    '.on.Oon.',
    '.r..on..',
    'gr..r...',
    '.g..r.h.',
    '.r.gr.h.',
    '.rg.rh..',
    'hq..q...',
    '.qh.q.h.',
    '.q.hqh..',
    'pqp.qp..',
  ],
  [
    '....O......',
    '...Oo...O..',
    '..Oon..Oo..',
    '..on..Oon..',
    '..r...on...',
    '..r..gr....',
    'g.r.g.r..h.',
    '.gr...r.h..',
    '..r...rh...',
    '..rg..r....',
    '.hq...q.h..',
    '..qh..qh...',
    '..q.h.q....',
    '..qh..qh...',
    '.pqp.pqp...',
  ],
  [
    '...O........O..',
    '..Oo..O....Oo..',
    '.Oon.Oo...Oon..',
    '.on.Oon...on...',
    '.r..on..O.r....',
    '.r..r..Oo.r..h.',
    'gr..r.Oon.r.h..',
    '.g..r.on..rh...',
    '.r.gr.r..gr....',
    '.rg.r.r.g.r....',
    'hq..q.rg..q.h..',
    '.qh.q.q...qh...',
    '.q.hq.qh.hq....',
    '.q..qhq...q....',
    '.qh.q.q..hq....',
    'pqp.pqpq.pqp...',
  ],
];

/** Sundew (Drosera): a small rosette of red, gland-studded leaf pads on green stalks; a dew glint or two. */
const SUNDEW_KEY = { g: 'meadow2', h: 'meadow1', r: 'red1', l: 'laterite1', k: 'red0', p: 'blossom1', w: 'white0' };
const SUNDEW = [
  [
    '.pr.rl.',
    'rlhghlk',
    '.k.h.k.',
    '..rlk..',
  ],
  [
    '..pr.rl..',
    '.rl.h.lk.',
    'rlkhghkrl',
    '.k.ghh.k.',
    '..rl.prk.',
    '..kk.kk..',
  ],
  [
    '......w..',
    '.....wh..',
    '......h..',
    '..pr..hl.',
    '.rl.h.lk.',
    'rlkhghkrl',
    '.k.ghh.k.',
    '..rl.prk.',
    '..kk.kk..',
  ],
];

/** Kelp: wavy olive strands rising from the sea floor, floats at the surface; muted by the water. */
const KELP_KEY = { p: 'pine1', m: 'moss0', n: 'mud2', q: 'moss1', f: 'moss2' };
const KELP = [
  [
    '.ff...',
    '..qn..',
    '..nm.f',
    '.qn.qn',
    '.nm.nm',
    '..nmnm',
    '..pmp.',
    '.pp.pp',
    '..pppp',
  ],
  [
    '.ff....f..',
    '..qn..fqn.',
    '..nm...nm.',
    '.qn...qn..',
    '.nm...nm.f',
    '..nm...nmq',
    '..nm.qnmn.',
    '.qn..nm.nm',
    '.nm...nm.m',
    '..pm..pm.p',
    '..pp.pp.pp',
    '.pp..pp.p.',
    '.ppppppppp',
  ],
  [
    'ff..ff...ff..',
    '.qn..qn...qn.',
    '.nm..nm..qnm.',
    '..nm..nm.nm..',
    '..nm..nm..nm.',
    '.qn..qn...qnm',
    '.nm..nm..qnm.',
    '..nm..nm.nm..',
    '..nm.qnm..nm.',
    '.qn..nm...nm.',
    '.nm...nm.qn..',
    '..pm..pm.pm..',
    '..pp.pp..pp..',
    '.pp..pp...pp.',
    '..pp..pp.pp..',
    '.pppppppppp..',
  ],
];

const objects = {
  lepidodendron: (v) => art(LEPIDO[`${v.size}${v.form}`], LEPIDO_KEY),
  swamp_cypress: (v) => art(CYPRESS[`${v.size}${v.form}`], CYPRESS_KEY),
  liverwort: (v) => art(LIVERWORT[v.index], LIVERWORT_KEY),
  reed: (v) => art(REED[v.index], REED_KEY),
  sundew: (v) => art(SUNDEW[v.index], SUNDEW_KEY),
  kelp: (v) => art(KELP[v.index], KELP_KEY),
};

module.exports = { materials, overlays, objects };
