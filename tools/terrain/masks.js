/* =============================================================================
 * SimEarth 2.0 — edge masks for the dual grid
 * -----------------------------------------------------------------------------
 * A display cell sits half a tile off the tile grid, so its four corners are
 * four tiles. A mask says which of its 16×16 pixels belong to the material
 * whose corners are set (bits TL=1 TR=2 BL=4 BR=8). Every material shares
 * these 16 cases, so any material meets any other without a pair tile.
 *
 * The edge is the bilinear blend of the corners, frayed by noise. The noise
 * fades out towards the cell's border and is zero on the outermost pixels:
 * there the blend depends only on the two corners of that side, so two cells
 * meeting at a side always agree, whichever variant either of them uses.
 * ========================================================================== */
'use strict';

const { noise, hash } = require('./kit');

/** Corner bits of a case. */
const TL = 1;
const TR = 2;
const BL = 4;
const BR = 8;

/** Noise amplitude in the cell centre, in units of the 0..1 corner blend. */
const AMPLITUDE = 0.42;
/** Pixels from the border over which the noise fades in. */
const FADE = 4;

function buildMask(kase, variant) {
  const n1 = noise(16, 4, 9001 + variant * 17);
  const n2 = noise(16, 8, 9101 + variant * 17);
  const out = new Uint8Array(256);
  const tl = kase & TL ? 1 : 0;
  const tr = kase & TR ? 1 : 0;
  const bl = kase & BL ? 1 : 0;
  const br = kase & BR ? 1 : 0;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const u = (x + 0.5) / 16;
      const v = (y + 0.5) / 16;
      const blend = (tl * (1 - u) + tr * u) * (1 - v) + (bl * (1 - u) + br * u) * v;
      const edge = Math.min(x, 15 - x, y, 15 - y);
      const fade = Math.min(1, edge / FADE);
      const wobble = (n1(x, y) * 0.65 + n2(x, y) * 0.35 - 0.5) * 2;
      out[y * 16 + x] = blend + wobble * AMPLITUDE * fade > 0.5 ? 1 : 0;
    }
  }
  // No lone pixels: a pixel unlike all four neighbours takes their side.
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 1; y < 15; y++) {
      for (let x = 1; x < 15; x++) {
        const i = y * 16 + x;
        const v = out[i];
        if (out[i - 1] !== v && out[i + 1] !== v && out[i - 16] !== v && out[i + 16] !== v) out[i] = 1 - v;
      }
    }
  }
  return out;
}

/** masks[case][variant] → Uint8Array(256), 1 = inside. */
function buildMasks(variants) {
  const masks = [];
  for (let kase = 0; kase < 16; kase++) {
    masks.push([]);
    for (let v = 0; v < variants; v++) masks[kase].push(buildMask(kase, v));
  }
  return masks;
}

/**
 * The border pixels of a case as the blend alone decides them — what every
 * variant must reproduce for neighbouring cells to join. Returns problems.
 */
function checkMasks(masks) {
  const problems = [];
  masks.forEach((vars, kase) => {
    const ref = buildMaskBorder(kase);
    vars.forEach((mask, v) => {
      for (const [i, want] of ref) {
        if (mask[i] !== want) {
          problems.push(`mask case ${kase} variant ${v}: border pixel ${i % 16},${(i / 16) | 0} breaks the shared edge`);
          break;
        }
      }
    });
  });
  return problems;
}

function buildMaskBorder(kase) {
  const tl = kase & TL ? 1 : 0;
  const tr = kase & TR ? 1 : 0;
  const bl = kase & BL ? 1 : 0;
  const br = kase & BR ? 1 : 0;
  const ref = [];
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (Math.min(x, 15 - x, y, 15 - y) !== 0) continue;
      const u = (x + 0.5) / 16;
      const v = (y + 0.5) / 16;
      const blend = (tl * (1 - u) + tr * u) * (1 - v) + (bl * (1 - u) + br * u) * v;
      ref.push([y * 16 + x, blend > 0.5 ? 1 : 0]);
    }
  }
  return ref;
}

/** Variant a display cell uses: stable per cell. */
function maskVariant(cx, cy, variants) {
  return Math.floor(hash(cx, cy, 77) * variants);
}

module.exports = { buildMasks, checkMasks, maskVariant, TL, TR, BL, BR };
