/* =============================================================================
 * SimEarth 2.0 — the yard under a city
 * -----------------------------------------------------------------------------
 * The worn ground a settlement stands on: an irregular patch, larger with
 * each size stage, in the ground of its era (trampled earth, packed clay,
 * cobbles, paving, a park). Drawn first in the city layer, so the landscape
 * around it keeps changing on its own; the map leaves out its pixels near a
 * river. Forms are painted in 2 × 2 cells: no single-pixel noise, as on the
 * terrain textures.
 * ========================================================================== */
'use strict';

const k = require('../terrain/kit');

/** Patch size per size stage (village, town, metropolis). */
const YARD_SIZE = [[14, 10], [16, 11], [16, 12]];

/**
 * Ground patterns: each returns the palette name for cell (cx, cy) of 2 × 2
 * pixels and its pixel (x, y), from `tones` = [dark, base, light].
 */
const PATTERNS = {
  /** Trampled earth: soft lighter paths over the base, a few dark clods. */
  earth: (tones, seed) => (x, y) => {
    const n = k.hash(x >> 1, y >> 1, seed);
    return n < 0.12 ? tones[0] : n > 0.62 ? tones[2] : tones[1];
  },
  /** Cobbles: 2 × 2 stones on a staggered grid with dark joints. */
  cobble: (tones, seed) => (x, y) => {
    const row = Math.floor(y / 3);
    const sx = (x + (row % 2) * 2) % 4;
    if (y % 3 === 2 || sx === 3) return tones[0];
    return k.hash((x + (row % 2) * 2) >> 2, row, seed) < 0.4 ? tones[2] : tones[1];
  },
  /** Paving: large flat slabs with fine joints every four pixels. */
  paving: (tones) => (x, y) => (x % 4 === 3 || y % 4 === 3 ? tones[0] : (x >> 2) % 2 === (y >> 2) % 2 ? tones[2] : tones[1]),
  /** A park: lawn with light paths crossing it. */
  park: (tones, seed) => (x, y) => {
    if ((x >> 1) === 3 || (y >> 1) === 2) return tones[2];
    return k.hash(x >> 1, y >> 1, seed) < 0.25 ? tones[0] : tones[1];
  },
};

/**
 * The yard of size stage `stage` (0..2): `tones` are three palette names,
 * dark to light; `pattern` one of PATTERNS.
 */
function yard(stage, pattern, tones, seed) {
  const [w, h] = YARD_SIZE[stage];
  const t = new k.Tex(w, h);
  const paint = PATTERNS[pattern](tones, seed);
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  t.each((x, y) => {
    // The rim frays in 2 × 2 cells, so the patch reads as worn ground, not a stamp.
    const fx = ((x | 1) - 0.5 - cx) / (w / 2);
    const fy = ((y | 1) - 0.5 - cy) / (h / 2);
    const fray = (k.hash(x >> 1, y >> 1, seed + 17) - 0.5) * 0.3;
    if (fx * fx + fy * fy > 0.92 + fray) return undefined;
    return k.c(paint(x, y));
  });
  // Blocks stand on their last row: keep the bottom row of the patch filled in the middle.
  for (let x = Math.floor(w / 2) - 1; x <= Math.floor(w / 2); x++) if (t.get(x, h - 1) === 0) t.set(x, h - 1, k.c(tones[1]));
  return t;
}

module.exports = { yard, YARD_SIZE, PATTERNS };
