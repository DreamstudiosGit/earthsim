/* =============================================================================
 * SimEarth 2.0 — contact sheet of the effect frames
 * -----------------------------------------------------------------------------
 * Every sprite frame at 1× and 4× on a meadow and a dark ground, every
 * texture frame tiled 2 × 2 at 2× — for judging the art before it reaches
 * the map. Returns an RGBA image { w, h, data }.
 * ========================================================================== */
'use strict';

const C = require('./catalog');
const P = require('../terrain/palette');

const GROUNDS = [[120, 168, 62], [29, 43, 36]];
const SCALE = 4;
const GAP = 6;

function sheet(art) {
  const rows = [];
  for (const s of C.SPRITES) if (art.sprites[s.id]) rows.push({ frames: art.sprites[s.id], tile: false });
  for (const t of C.TEXTURES) if (art.textures[t.id]) rows.push({ frames: art.textures[t.id], tile: true });
  const cell = (f, tile) => (tile ? { w: f.w * 4, h: f.h * 4 } : { w: f.w * (SCALE + 1) + GAP, h: f.h * SCALE });
  let w = 0;
  let h = GAP;
  for (const r of rows) {
    const c = cell(r.frames[0], r.tile);
    w = Math.max(w, GAP + r.frames.length * (c.w + GAP));
    h += (r.tile ? c.h : c.h * GROUNDS.length) + GAP;
  }
  const data = new Uint8Array(w * h * 4);
  const put = (x, y, rgb) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const o = (y * w + x) * 4;
    data[o] = rgb[0]; data[o + 1] = rgb[1]; data[o + 2] = rgb[2]; data[o + 3] = 255;
  };
  for (let i = 0; i < w * h; i++) put(i % w, (i / w) | 0, [52, 56, 60]);
  const draw = (t, ox, oy, s, bg, reps = 1) => {
    for (let ry = 0; ry < reps; ry++) {
      for (let rx = 0; rx < reps; rx++) {
        for (let y = 0; y < t.h; y++) {
          for (let x = 0; x < t.w; x++) {
            const v = t.px[y * t.w + x];
            const rgb = v ? P.PALETTE[v] : bg;
            if (!rgb) continue;
            for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) put(ox + (rx * t.w + x) * s + dx, oy + (ry * t.h + y) * s + dy, rgb);
          }
        }
      }
    }
  };
  let y = GAP;
  for (const r of rows) {
    const c = cell(r.frames[0], r.tile);
    if (r.tile) {
      r.frames.forEach((t, f) => draw(t, GAP + f * (c.w + GAP), y, 2, null, 2));
      y += c.h + GAP;
      continue;
    }
    GROUNDS.forEach((bg, g) => {
      r.frames.forEach((t, f) => {
        const ox = GAP + f * (c.w + GAP);
        draw(t, ox, y, 1, bg);
        draw(t, ox + t.w + 2, y, SCALE, bg);
      });
      y += c.h;
    });
    y += GAP;
  }
  return { w, h, data };
}

module.exports = { sheet };
