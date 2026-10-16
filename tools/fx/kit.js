/* =============================================================================
 * SimEarth 2.0 — toolkit for effect recipes
 * -----------------------------------------------------------------------------
 * Shapes that smoke, steam, ash and fire are made of, on top of the terrain
 * kit (bitmap, hash, periodic noise): a billow of overlapping round puffs
 * lit from the upper left, and two ways of fading without transparency: an
 * ordered-dither dissolve for small puffs, clumps breaking away for large
 * clouds. Deterministic: no Math.random.
 * ========================================================================== */
'use strict';

const k = require('../terrain/kit');
const P = require('../terrain/palette');

/**
 * Fill a billow: the union of `puffs` ({ x, y, r }), each pixel lit from the
 * upper left by the normal of the puff it lies deepest in. `tones` are
 * palette names, darkest first; the lower-right silhouette takes the first,
 * the upper-left silhouette the second-lightest — a light edge, no hard
 * outline. `tint(x, y, nx, ny)` may return a palette name to override a pixel
 * (underglow from lava, embers).
 */
function billow(t, puffs, tones, tint = null) {
  const idx = tones.map((n) => P.c(n));
  const top = idx.length - 1;
  const depth = (x, y) => {
    let best = null;
    let bestD = 0;
    for (const p of puffs) {
      const dx = x + 0.5 - p.x;
      const dy = y + 0.5 - p.y;
      const d = 1 - Math.hypot(dx, dy) / p.r;
      if (d > bestD) { bestD = d; best = { p, dx, dy }; }
    }
    return best;
  };
  const inside = (x, y) => depth(x, y) !== null;
  for (let y = 0; y < t.h; y++) {
    for (let x = 0; x < t.w; x++) {
      const hit = depth(x, y);
      if (!hit) continue;
      const nx = hit.dx / hit.p.r;
      const ny = hit.dy / hit.p.r;
      const custom = tint ? tint(x, y, nx, ny) : null;
      if (custom) { t.set(x, y, P.c(custom)); continue; }
      const lowerRight = !inside(x + 1, y) || !inside(x, y + 1) || !inside(x + 1, y + 1);
      const upperLeft = !inside(x - 1, y) || !inside(x, y - 1);
      if (lowerRight) { t.set(x, y, idx[0]); continue; }
      if (upperLeft) { t.set(x, y, idx[Math.max(1, top - 1)]); continue; }
      const light = -(nx * 0.6 + ny * 0.8) + (k.hash(x, y, 917) - 0.5) * 0.25;
      const step = light > 0.5 ? top : light > 0.15 ? top - 1 : light > -0.3 ? Math.max(1, top - 2) : 1;
      t.set(x, y, idx[Math.min(top, Math.max(0, step))]);
    }
  }
  return t;
}

/** Remove the share `amount` (0..1) of pixels in a 4×4 ordered pattern: fading without alpha. */
function dissolve(t, amount) {
  if (amount <= 0) return t;
  const cut = amount * 16;
  t.each((x, y) => (k.BAYER4[y & 3][x & 3] < cut ? 0 : undefined));
  return t;
}

/**
 * Break the share `amount` (0..1) of pixels away in clumps, by a noise field:
 * a large cloud falls apart into tufts instead of turning into a mesh.
 */
function crumble(t, amount, seed) {
  if (amount <= 0) return t;
  const n = k.fbm(64, 8, 2, seed);
  const values = [];
  t.each((x, y) => { if (t.get(x, y) !== 0) values.push(n(x, y)); });
  if (values.length === 0) return t;
  values.sort((a, b) => a - b);
  const cut = values[Math.min(values.length - 1, Math.floor(values.length * amount))];
  t.each((x, y) => (t.get(x, y) !== 0 && n(x, y) < cut ? 0 : undefined));
  return t;
}

module.exports = { billow, dissolve, crumble };
