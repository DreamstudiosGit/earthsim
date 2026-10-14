/* =============================================================================
 * SimEarth 2.0 — water in the pixel terrain: sea and shore
 * -----------------------------------------------------------------------------
 * The compositor's sea and shore passes, on its index buffer (landcompose.ts):
 *   - sea: the depth of the four corners, bilinear, on the water ramp with an
 *     ordered dither between steps and the shelf or open-ocean ripple;
 *   - shore: a foam line and a lighter band on the water side, a wet rim
 *     (one ramp step darker) on the ground side, wherever the dual grid put
 *     water next to ground — coasts, lakes and sea ice alike.
 * Rivers are drawn as lines in landrivers.ts.
 * ========================================================================== */

namespace SE {
  /** The compositor's index buffer: palette indices, and 1 sea / 2 river / 0 ground per pixel. */
  export interface LandBuffer { px: Uint8Array; water: Uint8Array; w: number; h: number }

  /** The dual grid reaches half a tile beyond the composed tiles on every side. */
  export const LAND_PAD = 8;
  /** Pixel centres across a cell, 0..1. */
  export const LAND_CENTER = Float32Array.from({ length: 16 }, (_, k) => (k + 0.5) / 16);
  export const LAND_BAYER_MIN = 0.5 / 16;
  export const LAND_BAYER_MAX = 15.5 / 16;
  /**
   * Share of each step over which water deepens into the next (the rest is
   * flat): calm sea, with the dither only in bands between depth steps.
   */
  const WATER_BAND = 0.6;
  /** Water ramp position of the shelf edge (COAST_DEPTH): deeper water shows the open-ocean ripple. */
  const COAST_RIPPLE_DEPTH = LAND_SHALLOW / 2;

  /** Whole steps stay flat; only the middle `band` of each step blends into the next. */
  export function landTerrace(v: number, band: number): number {
    const n = Math.floor(v);
    const f = v - n - (0.5 - band / 2);
    return n + (f <= 0 ? 0 : f >= band ? 1 : f / band);
  }

  function seaStep(depth: number, bayer: number): number {
    const step = Math.floor(landTerrace(depth, WATER_BAND) + bayer);
    return step < 0 ? 0 : step > LAND_SHALLOW ? LAND_SHALLOW : step;
  }

  /** One display cell of sea (through `mask` when it is not the cell's lowest layer). */
  export function paintSea(
    b: LandBuffer, art: LandArt, depth: Float32Array, c0: number, c1: number, c2: number, c3: number,
    mask: Uint8Array | null, base: number, wx: number, wy: number, steps: Uint8Array,
  ): void {
    const a = depth[c0];
    const dx = depth[c1] - a;
    const dy = depth[c2] - a;
    const dxy = depth[c3] - depth[c2] - dx;
    const lo = Math.min(a, depth[c1], depth[c2], depth[c3]);
    const hi = Math.max(a, depth[c1], depth[c2], depth[c3]);
    // The whole cell dithers to one step — most of the ocean: a table of the 16 Bayer cells.
    const calm = Math.floor(landTerrace(lo, WATER_BAND) + LAND_BAYER_MIN) === Math.floor(landTerrace(hi, WATER_BAND) + LAND_BAYER_MAX);
    if (calm) for (let j = 0; j < 16; j++) steps[j] = seaStep((lo + hi) / 2, BAYER4[j]);
    const { px, water, w } = b;
    const ramp = art.water;
    const top = ramp[ramp.length - 1];
    for (let ly = 0; ly < 16; ly++) {
      const y = wy + ly;
      const row0 = a + dy * LAND_CENTER[ly];
      const slope = dx + dxy * LAND_CENTER[ly];
      const bay = (y & 3) * 4;
      let o = base + ly * w;
      for (let lx = 0; lx < 16; lx++, o++) {
        if (mask && mask[ly * 16 + lx] === 0) continue;
        const x = wx + lx;
        const d = row0 + slope * LAND_CENTER[lx];
        let step = calm ? steps[bay + (x & 3)] : seaStep(d, BAYER4[bay + (x & 3)]);
        const rip = d >= COAST_RIPPLE_DEPTH ? art.rippleCoast : art.rippleOcean;
        const r = rip.px[(y & (rip.size - 1)) * rip.size + (x & (rip.size - 1))];
        if (r !== 0) step = Math.min(LAND_SHALLOW, step + (r === top ? 2 : 1));
        px[o] = ramp[step];
        water[o] = 1;
      }
    }
  }

  /**
   * Foam on the first water pixel, lighter water on the second, a wet rim on
   * the ground, around every cell listed in `shores` (buffer offsets).
   * `done` keeps a pixel from being shaded twice by two neighbouring cells.
   */
  export function paintShore(b: LandBuffer, art: LandArt, shores: readonly number[], done: Uint8Array): void {
    const { px, water, w, h } = b;
    const foam = art.water[art.water.length - 1];
    const lighter = art.shift[LAND_SHIFT_MAX + 1];
    const wet = art.shift[LAND_SHIFT_MAX - 1];
    for (const base of shores) {
      const x0 = Math.max(2, (base % w) - 2);
      const y0 = Math.max(2, ((base / w) | 0) - 2);
      const x1 = Math.min(w - 2, (base % w) + 18);
      const y1 = Math.min(h - 2, ((base / w) | 0) + 18);
      for (let y = y0; y < y1; y++) {
        for (let x = x0, o = y * w + x0; x < x1; x++, o++) {
          if (done[o] !== 0) continue;
          done[o] = 1;
          if (water[o] !== 0) {
            if (!water[o - 1] || !water[o + 1] || !water[o - w] || !water[o + w]) px[o] = foam;
            else if (!water[o - 2] || !water[o + 2] || !water[o - 2 * w] || !water[o + 2 * w] ||
              !water[o - w - 1] || !water[o - w + 1] || !water[o + w - 1] || !water[o + w + 1]) px[o] = lighter[px[o]];
          } else if (water[o - 1] || water[o + 1] || water[o - w] || water[o + w]) {
            px[o] = wet[px[o]];
          }
        }
      }
    }
  }
}
