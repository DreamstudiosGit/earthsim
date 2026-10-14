/* =============================================================================
 * SimEarth 2.0 — toolkit for terrain recipes
 * -----------------------------------------------------------------------------
 * Everything a recipe needs to paint with the palette: an indexed bitmap that
 * can wrap (seamless textures) or clip (sprites), a stable hash, periodic
 * value noise, character grids, and generic shapes lit from the upper left.
 * Deterministic throughout — no Math.random, so the atlas regenerates
 * byte for byte.
 *
 * The generic `ground`, `tree`, `bush`, `tuft` and `rock` shapes are the
 * placeholders the atlas starts with; family recipes may keep, tune or
 * replace them with hand-drawn grids.
 * ========================================================================== */
'use strict';

const P = require('./palette');

/* ------------------------------------------------------------------ bitmap -- */

class Tex {
  /** `wrap`: coordinates wrap around (seamless textures); otherwise they clip. */
  constructor(w, h, wrap = false) {
    this.w = w;
    this.h = h;
    this.wrap = wrap;
    this.px = new Uint8Array(w * h);
  }

  at(x, y) {
    if (this.wrap) {
      x = ((x % this.w) + this.w) % this.w;
      y = ((y % this.h) + this.h) % this.h;
    } else if (x < 0 || y < 0 || x >= this.w || y >= this.h) {
      return -1;
    }
    return y * this.w + x;
  }

  get(x, y) {
    const i = this.at(x, y);
    return i < 0 ? 0 : this.px[i];
  }

  set(x, y, v) {
    const i = this.at(x, y);
    if (i >= 0) this.px[i] = v;
  }

  fill(v) {
    this.px.fill(v);
    return this;
  }

  /** Call fn(x, y) for every pixel; a returned number is written there. */
  each(fn) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const v = fn(x, y);
        if (typeof v === 'number') this.px[y * this.w + x] = v;
      }
    }
    return this;
  }

  /** Copy the non-transparent pixels of `src` with its top-left at (x, y). */
  stamp(src, x, y) {
    for (let sy = 0; sy < src.h; sy++) {
      for (let sx = 0; sx < src.w; sx++) {
        const v = src.px[sy * src.w + sx];
        if (v !== 0) this.set(x + sx, y + sy, v);
      }
    }
    return this;
  }

  /** Mirror left-right. */
  flipped() {
    const out = new Tex(this.w, this.h, this.wrap);
    this.each((x, y) => { out.px[y * this.w + (this.w - 1 - x)] = this.px[y * this.w + x]; });
    return out;
  }
}

/**
 * A sprite from character rows. `key` maps a character to a palette name;
 * '.' (and ' ') are transparent.
 */
function grid(rows, key) {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const t = new Tex(w, h);
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const name = key[ch];
      if (!name) throw new Error(`grid: character '${ch}' has no colour in the key`);
      t.px[y * w + x] = P.c(name);
    }
  });
  return t;
}

/* ------------------------------------------------------------ randomness -- */

/** Stable 0..1 hash of integer coordinates and a seed. */
function hash(x, y, seed = 0) {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(seed | 0, 0x9e3779b1);
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca77);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae3d);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Value noise that tiles over `size` pixels with `cells` lattice cells across,
 * so a texture painted from it is seamless by construction. Returns f(x, y) in 0..1.
 */
function noise(size, cells, seed) {
  const step = size / cells;
  return (x, y) => {
    const fx = ((((x % size) + size) % size) + 0.5) / step;
    const fy = ((((y % size) + size) % size) + 0.5) / step;
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = smooth(fx - x0);
    const ty = smooth(fy - y0);
    const x1 = (x0 + 1) % cells;
    const y1 = (y0 + 1) % cells;
    const a = hash(x0 % cells, y0 % cells, seed);
    const b = hash(x1, y0 % cells, seed);
    const c = hash(x0 % cells, y1, seed);
    const d = hash(x1, y1, seed);
    return lerp(lerp(a, b, tx), lerp(c, d, tx), ty);
  };
}

/** Octaves of periodic noise, normalised to 0..1. */
function fbm(size, cells, octaves, seed, gain = 0.5) {
  const layers = [];
  let amp = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    const n = Math.min(size, cells << o);
    layers.push([noise(size, n, seed + o * 101), amp]);
    total += amp;
    amp *= gain;
  }
  return (x, y) => {
    let v = 0;
    for (const [f, a] of layers) v += f(x, y) * a;
    return v / total;
  };
}

/** 4×4 ordered-dither thresholds, 0..15. Index with [y & 3][x & 3]. */
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/* ---------------------------------------------------------------- ground -- */

/**
 * Generic seamless ground (the placeholder recipe):
 *   base    { ramp, tones: [a, b], cells }      two tones in soft patches
 *   specks  [{ ramp, step, every }]            2-px pebbles or flecks, lit top-left
 *   cover   { ramp, coverage, cells, tones: [dark, mid, light] }  lit clumps of growth
 *   accents [{ color, every }]                 2-px flowers or flecks on the cover
 * `seed` keeps materials apart.
 */
function ground(t, spec) {
  const seed = spec.seed || 1;
  const size = t.w;
  const base = spec.base;
  const r = P.ramp(base.ramp);
  const n = fbm(size, base.cells || size / 16, 3, seed);
  t.each((x, y) => r[n(x, y) < (base.split ?? 0.5) ? base.tones[0] : base.tones[1]]);

  for (const s of spec.specks || []) {
    const sr = P.ramp(s.ramp);
    for (let by = 0; by < size; by += s.every) {
      for (let bx = 0; bx < size; bx += s.every) {
        if (hash(bx, by, seed + 7) > (s.chance ?? 0.6)) continue;
        const x = bx + Math.floor(hash(bx, by, seed + 8) * (s.every - 2));
        const y = by + Math.floor(hash(bx, by, seed + 9) * (s.every - 2));
        const tone = sr[s.step];
        t.set(x, y, P.shift(tone, 1));
        t.set(x + 1, y, tone);
        t.set(x, y + 1, tone);
        t.set(x + 1, y + 1, P.shift(tone, -1));
      }
    }
  }

  if (spec.cover && spec.cover.coverage > 0) {
    const cv = spec.cover;
    const cr = P.ramp(cv.ramp);
    const cn = fbm(size, cv.cells || size / 8, 3, seed + 31);
    const inside = new Uint8Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) inside[y * size + x] = cn(x, y) < cv.coverage ? 1 : 0;
    }
    const at = (x, y) => inside[(((y % size) + size) % size) * size + (((x % size) + size) % size)];
    t.each((x, y) => {
      if (!at(x, y)) return undefined;
      const [dark, mid, light] = cv.tones;
      if (!at(x - 1, y - 1) || !at(x, y - 1)) return cr[light];
      if (!at(x + 1, y + 1) || !at(x, y + 1)) return cr[dark];
      // A little vertical stroke texture inside the clump, like blades or fronds.
      return hash(x, y >> 1, seed + 41) < (cv.stroke ?? 0.25) ? cr[dark] : cr[mid];
    });
  }

  for (const a of spec.accents || []) {
    const col = P.c(a.color);
    for (let by = 0; by < size; by += a.every) {
      for (let bx = 0; bx < size; bx += a.every) {
        if (hash(bx, by, seed + 53) > (a.chance ?? 0.5)) continue;
        const x = bx + Math.floor(hash(bx, by, seed + 54) * (a.every - 2));
        const y = by + Math.floor(hash(bx, by, seed + 55) * (a.every - 1));
        t.set(x, y, col);
        t.set(x + 1, y, col);
      }
    }
  }
  return t;
}

/* ------------------------------------------------------------- shapes ---- */

/**
 * Fill the pixels where `inside(x, y)` holds with a ramp, lit from the upper
 * left: a selective outline from the ramp's dark end on the lower-right rim,
 * one step lighter on the upper-left rim, and a soft gradient between.
 */
function shade(t, inside, rampName, cx, cy, rx, ry, seed = 0) {
  const r = P.ramp(rampName);
  const top = r.length - 1;
  t.each((x, y) => {
    if (!inside(x, y)) return undefined;
    const rim = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
    const nx = (x + 0.5 - cx) / Math.max(1, rx);
    const ny = (y + 0.5 - cy) / Math.max(1, ry);
    const light = -(nx * 0.55 + ny * 0.85) + (hash(x, y, seed) - 0.5) * 0.35;
    if (rim) return light < -0.1 ? r[0] : r[Math.min(top, 1)];
    const step = light > 0.45 ? top : light > 0.0 ? Math.max(1, top - 1) : light > -0.45 ? Math.min(top, 1) : 0;
    return r[step];
  });
  return t;
}

/** Trunk of `width` px from the foot up `height` px, centred, with a lit left edge. */
function trunk(t, cx, footY, width, height) {
  const x0 = Math.round(cx - width / 2);
  for (let y = footY - height + 1; y <= footY; y++) {
    for (let x = x0; x < x0 + width; x++) t.set(x, y, P.c(x === x0 && width > 1 ? 'bark1' : 'bark0'));
  }
}

const TREE_BOX = { s: [10, 13], m: [13, 17], l: [16, 20] };

/**
 * Placeholder tree: `shape` is round · cone · umbrella · palm · scale · giant · column · tiers.
 * `v` = { size: 's'|'m'|'l', form: 0|1 }. Returns a sprite in its size box.
 */
function tree(shape, rampName, v, seed = 0) {
  const [w, h] = TREE_BOX[v.size];
  const t = new Tex(w, h);
  const cx = w / 2 + (v.form ? 0.5 : -0.5) * (w > 10 ? 1 : 0);
  const foot = h - 1;
  const lean = v.form ? 1 : -1;
  let inside;
  let crown;
  switch (shape) {
    case 'cone':
    case 'tiers': {
      const topY = 0;
      const baseY = h - 4;
      trunk(t, cx, foot, w > 12 ? 2 : 1, 4);
      inside = (x, y) => {
        if (y < topY || y > baseY) return false;
        const k = (y - topY) / (baseY - topY);
        let half = 0.6 + k * (w / 2 - 0.6);
        if (shape === 'tiers' && (y - topY) % 4 === 3) half -= 1.2;
        return Math.abs(x + 0.5 - cx) <= half;
      };
      crown = [cx, h * 0.45, w / 2, h / 2];
      break;
    }
    case 'column': {
      trunk(t, cx, foot, 2, 4);
      for (let x = Math.round(cx) - 3; x <= Math.round(cx) + 2; x++) t.set(x, foot, P.c('bark0'));
      inside = (x, y) => {
        const k = y / (h - 4);
        const half = 1 + Math.sin(Math.min(1, k) * Math.PI * 0.85) * (w / 2 - 2.5);
        return y <= h - 4 && Math.abs(x + 0.5 - cx) <= half;
      };
      crown = [cx, h * 0.4, w / 3, h / 2];
      break;
    }
    case 'umbrella': {
      const ry = Math.max(2, Math.round(h * 0.17));
      const cy = ry + 1;
      for (let y = cy; y <= foot; y++) t.set(Math.round(cx + ((foot - y) / (foot - cy)) * lean * 1.5), y, P.c('bark0'));
      inside = (x, y) => ((x + 0.5 - cx) / (w / 2)) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1 && y <= cy + 1;
      crown = [cx, cy, w / 2, ry];
      break;
    }
    case 'palm': {
      const topY = Math.round(h * 0.35);
      trunk(t, cx, foot, w > 12 ? 3 : 2, foot - topY + 1);
      inside = (x, y) => {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - topY;
        const d = Math.hypot(dx, dy * 1.6);
        if (d > w / 2 || dy > 2) return false;
        const a = Math.atan2(dy, dx);
        return Math.abs(Math.sin(a * 3.5)) > 0.35 || d < 2;
      };
      crown = [cx, topY - 1, w / 2, h / 3];
      break;
    }
    case 'scale': {
      const topY = Math.round(h * 0.28);
      trunk(t, cx, foot, 2, foot - topY + 1);
      for (let y = topY + 2; y < foot; y += 2) t.set(Math.round(cx), y, P.c('bark1'));
      inside = (x, y) => {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - topY;
        return dy <= 1 && dy >= -topY && Math.abs(dx) <= w / 2 - 1 && (Math.abs(Math.abs(dx) - (topY + dy) * 0.7) < 1.6 || Math.hypot(dx, dy) < 2.5);
      };
      crown = [cx, topY / 2, w / 2, topY];
      break;
    }
    case 'giant': {
      const cy = Math.round(h * 0.3);
      trunk(t, cx, foot, 2, foot - cy);
      t.set(Math.round(cx) - 2, foot, P.c('bark0'));
      t.set(Math.round(cx) + 1, foot, P.c('bark0'));
      inside = (x, y) => {
        const dx = (x + 0.5 - cx) / (w / 2);
        const dy = (y + 0.5 - cy) / (cy + 0.5);
        const bump = 0.12 * Math.sin((x + seed) * 1.7);
        return dx * dx + dy * dy <= 1 + bump && y <= cy + 2;
      };
      crown = [cx, cy, w / 2, cy];
      break;
    }
    default: { // round
      const cy = Math.round(h * 0.4);
      const ry = cy + 0.5;
      trunk(t, cx, foot, w > 12 ? 2 : 1, foot - cy);
      inside = (x, y) => {
        const dx = (x + 0.5 - cx - lean * 0.5) / (w / 2);
        const dy = (y + 0.5 - cy) / ry;
        return dx * dx + dy * dy <= 1 + 0.15 * Math.sin(x * 2.1 + y * 1.3 + seed);
      };
      crown = [cx, cy, w / 2, ry];
    }
  }
  const c = new Tex(w, h);
  shade(c, (x, y) => x >= 0 && y >= 0 && x < w && y < h && inside(x, y), rampName, crown[0] - crown[2] * 0.3, crown[1] - crown[3] * 0.3, crown[2], crown[3], seed);
  t.stamp(c, 0, 0);
  return t;
}

/** Placeholder bush: a lit mound `w`×`h` at the bottom of a 16×16 box, optionally with flowers. */
function bush(rampName, w, h, seed = 0, flowers = null) {
  const t = new Tex(16, 16);
  const cx = 8;
  const cy = 16 - h / 2;
  const inside = (x, y) => {
    const dx = (x + 0.5 - cx) / (w / 2);
    const dy = (y + 0.5 - cy) / (h / 2);
    return y < 16 && dx * dx + dy * dy <= 1 + 0.2 * Math.sin(x * 2.3 + seed) && y >= 16 - h;
  };
  shade(t, inside, rampName, cx - w * 0.15, cy - h * 0.15, w / 2, h / 2, seed);
  if (flowers) {
    const col = P.c(flowers);
    for (let k = 0; k < 4; k++) {
      const x = Math.round(cx - w / 2 + 2 + hash(k, seed, 3) * (w - 4));
      const y = Math.round(16 - h + 1 + hash(k, seed, 4) * (h - 3));
      if (inside(x, y) && inside(x + 1, y)) { t.set(x, y, col); t.set(x + 1, y, col); }
    }
  }
  return t;
}

/** Placeholder tuft: `blades` strokes up to `h` px tall at the bottom of a 16×16 box. */
function tuft(rampName, blades, h, seed = 0, tip = null) {
  const t = new Tex(16, 16);
  const r = P.ramp(rampName);
  const span = Math.min(12, blades * 2 + 1);
  for (let k = 0; k < blades; k++) {
    const x = Math.round(8 - span / 2 + (k + 0.5) * (span / blades));
    const bh = Math.max(2, Math.round(h * (0.6 + 0.4 * hash(k, seed, 9))));
    const bend = hash(k, seed, 10) < 0.5 ? -1 : 1;
    for (let y = 0; y < bh; y++) {
      const xx = x + (y > bh * 0.6 ? bend : 0);
      t.set(xx, 15 - y, r[y < bh / 2 ? 1 : Math.min(r.length - 1, 2)]);
    }
    if (tip) t.set(x + bend, 15 - bh, P.c(tip));
  }
  return t;
}

/** Placeholder rock: a lit lump `w`×`h` at the bottom of a 16×16 box. */
function rock(rampName, w, h, seed = 0) {
  const t = new Tex(16, 16);
  const cx = 8;
  const cy = 16 - h / 2;
  shade(t, (x, y) => {
    const dx = (x + 0.5 - cx) / (w / 2);
    const dy = (y + 0.5 - cy) / (h / 2);
    return y < 16 && dx * dx + dy * dy <= 1 + 0.15 * Math.sin(x * 3.1 + y + seed);
  }, rampName, cx - w * 0.2, cy - h * 0.25, w / 2, h / 2, seed);
  return t;
}

module.exports = {
  Tex, grid, hash, noise, fbm, BAYER4, smooth, lerp,
  ground, shade, trunk, tree, bush, tuft, rock,
  c: P.c, ramp: P.ramp, shift: P.shift,
};
