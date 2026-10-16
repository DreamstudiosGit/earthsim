/* =============================================================================
 * SimEarth 2.0 — building shapes shared by the era recipes
 * -----------------------------------------------------------------------------
 * Character grids for the recurring forms of city blocks in 3/4 view, light
 * from the upper left. Each era maps the letters to its own ramps:
 *   roof   R rim (upper-left, one step lighter than the outline)
 *          T lit top · S shaded part · O outline, the darkest step
 *   wall   w lit · v shaded · u darkest (outline, under the eaves)
 *          d door · n window · b trim (beams, posts, frames)
 * The grids are plain data, so a recipe can still edit single pixels.
 * ========================================================================== */
'use strict';

const k = require('../terrain/kit');

function canvas(w, h) {
  return Array.from({ length: h }, () => Array(w).fill('.'));
}

function text(g) {
  return g.map((r) => r.join(''));
}

/** Front wall rows y0..y1 of columns x0..x1: lit, the last column shaded, the bottom-right corner darkest. */
function wall(g, x0, x1, y0, y1) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) g[y][x] = x === x1 ? 'u' : x === x1 - 1 ? 'v' : 'w';
  }
}

/** Windows `n` on wall rows `rows`, every `step` columns from `x0` to `x1`. */
function windows(g, rows, x0, x1, step, ch = 'n') {
  for (const y of rows) for (let x = x0; x <= x1; x += step) if (g[y][x] !== '.') g[y][x] = ch;
}

/** A door of `h` rows at the bottom, `w` columns wide, from column `x`. */
function door(g, x, w = 1, h = 2) {
  for (let y = g.length - h; y < g.length; y++) for (let dx = 0; dx < w; dx++) g[y][x + dx] = 'd';
}

/**
 * A flat-roofed block `w` wide: `roof` rows of roof seen from above, then
 * `high` rows of front wall. `o.windows`: [rows from the wall's top, x0, step].
 */
function flat(w, roof, high, o = {}) {
  const g = canvas(w, roof + high);
  for (let y = 0; y < roof; y++) {
    for (let x = 0; x < w; x++) {
      const right = x === w - 1;
      g[y][x] = y === roof - 1 ? (right ? 'O' : 'S') : right ? 'O' : y === 0 || x === 0 ? 'R' : x === w - 2 ? 'S' : 'T';
    }
  }
  wall(g, 0, w - 1, roof, roof + high - 1);
  if (o.windows) {
    const [rows, x0, step] = o.windows;
    windows(g, rows.map((r) => roof + r), x0, w - 3, step);
  }
  if (o.door !== undefined && o.door !== null) door(g, o.door, o.doorW || 1, o.doorH || 2);
  return g;
}

/**
 * A roof with its ridge running across: `roof` rows widening by one column a
 * side from an inset ridge to the eave, then `high` rows of wall under it.
 */
function pitched(w, roof, high, o = {}) {
  const g = canvas(w, roof + high);
  const inset = o.inset ?? roof - 1;
  for (let y = 0; y < roof; y++) {
    const a = Math.max(0, inset - y);
    const b = w - 1 - a;
    for (let x = a; x <= b; x++) {
      const eave = y === roof - 1;
      g[y][x] = eave ? (x === b ? 'O' : 'S') : x === b ? 'O' : x === a || y === 0 ? 'R' : x >= b - 1 ? 'S' : 'T';
    }
  }
  const m = o.overhang ?? 1;
  wall(g, m, w - 1 - m, roof, roof + high - 1);
  for (let x = m; x < w - m; x++) if (o.shadowRow !== false) g[roof][x] = 'u';
  if (o.windows) {
    const [rows, x0, step] = o.windows;
    windows(g, rows.map((r) => roof + r), x0, w - 2 - m, step);
  }
  if (o.door !== undefined && o.door !== null) door(g, o.door, o.doorW || 1, o.doorH || 2);
  return g;
}

/** A house with its gable to the front (⌂): a triangle of roof over a block of wall, `w` odd. */
function gable(w, high, o = {}) {
  const half = (w - 1) / 2;
  const roof = half + 1;
  const g = canvas(w, roof + high);
  for (let y = 0; y < roof; y++) {
    for (let x = half - y; x <= half + y; x++) {
      g[y][x] = x === half - y ? 'R' : x === half + y ? 'O' : x < half ? 'T' : x === half ? 'T' : 'S';
    }
  }
  wall(g, 1, w - 2, roof, roof + high - 1);
  if (o.door !== undefined && o.door !== null) door(g, o.door, o.doorW || 1, o.doorH || 2);
  if (o.windows) {
    const [rows, x0, step] = o.windows;
    windows(g, rows.map((r) => roof + r), x0, w - 3, step);
  }
  return g;
}

/** The upper half of an ellipse `w` wide and `h` high as a lit dome, over `base` rows of wall. */
function dome(w, h, base = 0) {
  const g = canvas(w, h + base);
  const cx = (w - 1) / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x - cx) / (w / 2);
      const ny = (h - 0.5 - y) / h;
      if (nx * nx + ny * ny > 1) continue;
      const outside = (xx, yy) => {
        const ax = (xx - cx) / (w / 2);
        const ay = (h - 0.5 - yy) / h;
        return xx < 0 || xx >= w || yy < 0 || ax * ax + ay * ay > 1;
      };
      const rim = outside(x - 1, y) || outside(x + 1, y) || outside(x, y - 1);
      const light = -(nx * 0.7) + ny * 0.5;
      g[y][x] = rim ? (x > cx ? 'O' : 'R') : light > 0.35 ? 'L' : light > -0.15 ? 'T' : 'S';
    }
  }
  if (base > 0) wall(g, 0, w - 1, h, h + base - 1);
  return g;
}

/** Stamp grid `src` into `dst` with its top-left at (x, y); '.' stays transparent. */
function stamp(dst, src, x, y) {
  src.forEach((row, sy) => {
    for (let sx = 0; sx < row.length; sx++) {
      const ch = Array.isArray(row) ? row[sx] : row[sx];
      if (ch !== '.' && dst[y + sy] && x + sx >= 0 && x + sx < dst[0].length) dst[y + sy][x + sx] = ch;
    }
  });
  return dst;
}

/** A grid (array of rows of characters, or of strings) to a sprite, with `key` mapping letters to palette names. */
function sprite(g, key) {
  return k.grid(g.map((r) => (Array.isArray(r) ? r.join('') : r)), key);
}

module.exports = { canvas, text, wall, windows, door, flat, pitched, gable, dome, stamp, sprite };
