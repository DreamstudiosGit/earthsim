/* =============================================================================
 * SimEarth 2.0 — the pixel terrain compositor
 * -----------------------------------------------------------------------------
 * Composes a rectangle of tiles at 1× (16 px per tile) in palette indices
 * (docs/biomes-spec.md §4.2–4.5):
 *   1. dual grid: every display cell sits half a tile off the grid and reads
 *      its four corner tiles; the lowest ground fills it, each higher one
 *      draws through the shared frayed edge mask — water is rank 0, so coasts
 *      fray the same way as any other border;
 *   2. water (landwater.ts): depth on the water ramp, dithered, with ripples;
 *   3. ground: the 16×16 window of its seamless texture at the world position,
 *      shifted along its ramp by relief and macro variation (Bayer dither);
 *   4. shore (landwater.ts): foam on the water side, a wet rim on the land side;
 *   5. rivers as smoothed lines (landrivers.ts), then objects row by row
 *      with their shadows.
 * Pure arithmetic on typed arrays — no DOM — so tests run it in Node.
 * ========================================================================== */

namespace SE {
  const PAD = LAND_PAD;
  /** Pixels between an object's foot and river water. */
  const RIVER_CLEARANCE = 2;
  /** Relief dither works on 2×2-pixel cells, so shading never makes single-pixel dots. */
  const RELIEF_DITHER_SHIFT = 1;
  /**
   * Share of each ramp step over which shading blends into the next (the rest
   * is flat): whole steps read as calm ground, only narrow bands are dithered.
   */
  const RELIEF_BAND = 0.3;
  const CENTER = LAND_CENTER;
  const terrace = landTerrace;

  /** Insert a key into the sorted, distinct layer list of a cell; returns the new length. */
  function addLayer(order: Uint8Array, n: number, v: number): number {
    for (let j = 0; j < n; j++) if (order[j] === v) return n;
    let j = n;
    while (j > 0 && order[j - 1] > v) { order[j] = order[j - 1]; j--; }
    order[j] = v;
    return n + 1;
  }

  export class LandComposer {
    private readonly buf: LandBuffer = { px: new Uint8Array(0), water: new Uint8Array(0), w: 0, h: 0 };
    private occupied = new Uint8Array(0);
    private done = new Uint8Array(0);
    /** Buffer offsets of cells where water meets ground. */
    private readonly shores: number[] = [];
    private readonly placements: LandPlacement[] = [];
    private readonly order = new Uint8Array(4);
    private readonly steps = new Uint8Array(16);

    constructor(readonly art: LandArt) {}

    /**
     * Compose tiles [tx0, tx0 + tw) × [ty0, ty0 + th) with `margin` pixels
     * around into `out`, (tw·16 + 2·margin) × (th·16 + 2·margin) RGBA words.
     * `seaColor`, when given, replaces the water by a flat colour per tile
     * (the Oceans layer switched off).
     */
    compose(
      f: TerrainField, tx0: number, ty0: number, tw: number, th: number,
      margin: number, out: Uint32Array, seaColor: Uint32Array | null = null,
    ): void {
      this.alloc(tw * 16 + 2 * PAD, th * 16 + 2 * PAD);
      this.ground(f, tx0, ty0, tw, th);
      const b = this.buf;
      if (!seaColor) {
        paintShore(b, this.art, this.shores, this.done);
        paintRivers(f.paths, b, this.art, tx0 * 16 - PAD, ty0 * 16 - PAD);
      }
      placeLandObjects(f, this.art, tx0 - 1, ty0 - 1, tx0 + tw, ty0 + th, this.placements);
      // Nothing grows in a river, also where its bends reach into a neighbouring tile.
      const placed = this.placements;
      let n = 0;
      for (const p of placed) if (p.water || !f.paths.near(p.fx + 0.5, p.fy + 0.5, RIVER_CLEARANCE)) placed[n++] = p;
      placed.length = n;
      drawLandObjects(this.placements, this.art, b.px, b.water, this.occupied, b.w, b.h, tx0 * 16 - PAD, ty0 * 16 - PAD);
      this.emit(out, margin, tw, th, tx0, ty0, seaColor);
    }

    private alloc(w: number, h: number): void {
      const b = this.buf;
      if (w !== b.w || h !== b.h) {
        b.w = w;
        b.h = h;
        b.px = new Uint8Array(w * h);
        b.water = new Uint8Array(w * h);
        this.occupied = new Uint8Array(w * h);
        this.done = new Uint8Array(w * h);
      } else {
        this.occupied.fill(0);
        this.done.fill(0);
      }
      this.shores.length = 0;
    }

    /* ------------------------------------------------------------ ground -- */

    private ground(f: TerrainField, tx0: number, ty0: number, tw: number, th: number): void {
      const key = f.key;
      const order = this.order;
      for (let l = 0; l <= th; l++) {
        const ty = ty0 + l - 1;
        const ra = clampY(ty) * GRID_W;
        const rb = clampY(ty + 1) * GRID_W;
        for (let k = 0; k <= tw; k++) {
          const tx = tx0 + k - 1;
          const xa = wrapX(tx);
          const xb = wrapX(tx + 1);
          const c0 = ra + xa;
          const c1 = ra + xb;
          const c2 = rb + xa;
          const c3 = rb + xb;
          const k0 = key[c0];
          const k1 = key[c1];
          const k2 = key[c2];
          const k3 = key[c3];
          const base = l * 16 * this.buf.w + k * 16;
          const wx = tx * 16 + 8;
          const wy = ty * 16 + 8;
          // Layers: the distinct corner keys, lowest first.
          const n = addLayer(order, addLayer(order, addLayer(order, addLayer(order, 0, k0), k1), k2), k3);
          const variant = Math.floor(landHash(xa, ty, 77) * this.art.masks[0].length);
          for (let layer = 0; layer < n; layer++) {
            const v = order[layer];
            const mask = layer === 0 ? null : this.art.masks[
              (k0 >= v ? 1 : 0) | (k1 >= v ? 2 : 0) | (k2 >= v ? 4 : 0) | (k3 >= v ? 8 : 0)][variant];
            if (v === 0) paintSea(this.buf, this.art, f.depth, c0, c1, c2, c3, mask, base, wx, wy, this.steps);
            else this.land(v, mask, base, wx, wy, (k0 === v && f.algae[c0]) || (k1 === v && f.algae[c1]) ||
              (k2 === v && f.algae[c2]) || (k3 === v && f.algae[c3]) ? this.art.algae : null);
          }
          if (order[0] === 0 && n > 1) this.shores.push(base);
          if (order[n - 1] !== 0) this.shade(f, c0, c1, c2, c3, base, wx, wy);
        }
      }
    }

    /** Ground through a mask; `film` covers the water in it (mire pools with freshwater algae). */
    private land(key: number, mask: Uint8Array | null, base: number, wx: number, wy: number, film: LandTex | null): void {
      const { px, water, w } = this.buf;
      const tex = this.art.ground[landKeyRank(key)][landKeyDensity(key)];
      const size = tex.size;
      const wrap = size - 1;
      const src = tex.px;
      for (let ly = 0; ly < 16; ly++) {
        const row = ((wy + ly) & wrap) * size;
        let o = base + ly * w;
        if (!mask) {
          for (let lx = 0; lx < 16; lx++, o++) {
            px[o] = src[row + ((wx + lx) & wrap)];
            water[o] = 0;
          }
          continue;
        }
        const m = ly * 16;
        for (let lx = 0; lx < 16; lx++, o++) {
          if (mask[m + lx] === 0) continue;
          px[o] = src[row + ((wx + lx) & wrap)];
          water[o] = 0;
        }
      }
      if (film) this.film(film, mask, base, wx, wy);
    }

    private film(film: LandTex, mask: Uint8Array | null, base: number, wx: number, wy: number): void {
      const { px, w } = this.buf;
      const isWater = this.art.isWater;
      const fw = film.size - 1;
      for (let ly = 0; ly < 16; ly++) {
        const row = ((wy + ly) & fw) * film.size;
        for (let lx = 0, o = base + ly * w; lx < 16; lx++, o++) {
          if ((mask && mask[ly * 16 + lx] === 0) || isWater[px[o]] === 0) continue;
          const v = film.px[row + ((wx + lx) & fw)];
          if (v !== 0) px[o] = v;
        }
      }
    }

    /** Relief and macro variation: the corners' shading, bilinear, terraced, dithered to whole ramp steps. */
    private shade(f: TerrainField, c0: number, c1: number, c2: number, c3: number, base: number, wx: number, wy: number): void {
      const s = f.shade;
      const a = s[c0];
      const b = s[c1] - a;
      const c = s[c2] - a;
      const e = s[c3] - s[c2] - b;
      const lo = terrace(Math.min(a, s[c1], s[c2], s[c3]), RELIEF_BAND);
      const hi = terrace(Math.max(a, s[c1], s[c2], s[c3]), RELIEF_BAND);
      const { px, water, w } = this.buf;
      const shift = this.art.shift;
      // Every pixel of the cell lands on the same step: one table for all.
      if (Math.floor(lo + LAND_BAYER_MIN) === Math.floor(hi + LAND_BAYER_MAX)) {
        const by = Math.floor(lo + LAND_BAYER_MIN);
        if (by === 0) return;
        const t = shift[LAND_SHIFT_MAX + by];
        for (let ly = 0; ly < 16; ly++) {
          let o = base + ly * w;
          for (let lx = 0; lx < 16; lx++, o++) if (water[o] === 0) px[o] = t[px[o]];
        }
        return;
      }
      for (let ly = 0; ly < 16; ly++) {
        const row0 = a + c * CENTER[ly];
        const slope = b + e * CENTER[ly];
        const bay = ((wy + ly) >> RELIEF_DITHER_SHIFT & 3) * 4;
        let o = base + ly * w;
        for (let lx = 0; lx < 16; lx++, o++) {
          if (water[o] !== 0) continue;
          const v = terrace(row0 + slope * CENTER[lx], RELIEF_BAND);
          const by = Math.floor(v + BAYER4[bay + ((wx + lx) >> RELIEF_DITHER_SHIFT & 3)]);
          if (by !== 0) px[o] = shift[LAND_SHIFT_MAX + by][px[o]];
        }
      }
    }

    /* -------------------------------------------------------------- emit -- */

    private emit(out: Uint32Array, margin: number, tw: number, th: number, tx0: number, ty0: number, seaColor: Uint32Array | null): void {
      const { px, water, w } = this.buf;
      const rgba = this.art.rgba;
      const ow = tw * 16 + 2 * margin;
      const oh = th * 16 + 2 * margin;
      let o = 0;
      for (let y = 0; y < oh; y++) {
        const by = PAD - margin + y;
        const ty = clampY(ty0 + Math.floor((by - PAD) / 16));
        let k = by * w + PAD - margin;
        for (let x = 0; x < ow; x++, k++, o++) {
          if (seaColor && water[k] === 1) out[o] = seaColor[ty * GRID_W + wrapX(tx0 + Math.floor((x - margin) / 16))];
          else out[o] = rgba[px[k]];
        }
      }
    }
  }
}
