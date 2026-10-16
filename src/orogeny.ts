/* =============================================================================
 * SimEarth 2.0 — orogeny: the typed mountain belts of a new planet
 * -----------------------------------------------------------------------------
 * Mountain ranges are laid down as long lines with one crest each, not cut
 * out of a noise field, which breaks them into blobs and scattered hills:
 *
 *   coastal ranges  (Arc) run parallel to the coast a few tiles inland,
 *                   along the coasts that face the ocean plates' push;
 *   fold belts      (Fold) follow the zero lines of a coarse noise field
 *                   through the continents' interiors. In the old provinces,
 *                   about half the planet, they are fossil: lower, rounder
 *                   and without uplift, so erosion keeps wearing them down.
 *
 * Island arcs and trenches at sea: islandarcs.ts (docs/hoehe-spec.md §3.3).
 * ========================================================================== */

namespace SE {
  type Octaves = readonly { cx: number; cy: number; amp: number }[];

  /** Crest of a coastal range: this many tiles inland, varying along the coast. */
  const ARC_CREST_MIN = 3;
  const ARC_CREST_MAX = 6;
  /** Half width of a range across its crest, in tiles. */
  const ARC_HALF_WIDTH = 2.5;
  const FOLD_HALF_WIDTH = 3.5;
  /** Exponent of the cross profile of an active range: the higher, the sharper the crest. */
  const BELT_POW = 2.6;
  /** A fossil belt: rounded shoulders and this share of an active belt's height over its base. */
  const FOSSIL_POW = 1.8;
  const FOSSIL_HEIGHT = 0.6;
  /**
   * Active margins: the coasts that face the way the ocean plate pushes, a
   * direction that turns only slowly across the planet. A coast faces it
   * when its seaward normal is within acos(ARC_FACING) of it, so a continent
   * gets its cordillera along one side, as the Americas do, not a rim.
   */
  const ARC_FACING = 0.1;
  const ARC_FACING_EDGE = 0.3;
  /** Radius (tiles) the coast is smoothed over to tell which way it faces: the trend, not the bays. */
  const ARC_TREND = 8;
  /**
   * A coastal range follows the open coast, not every bay: lakes and inland
   * seas smaller than this (tiles) do not count as coast, and the distance to
   * the coast is smoothed over this radius (tiles), twice.
   */
  const ARC_SMALL_WATER = 300;
  const ARC_SMOOTH = 3;
  /** Share of the fold lines that carry a range. */
  const FOLD_LINE_SHARE = 0.85;
  /** Share of the planet that is old crust, where fold belts are fossil. */
  const FOSSIL_SHARE = 0.5;
  /** Where a selecting field crosses zero, a range tapers off over this much of it. */
  const RANGE_TAPER = 0.15;
  /** Fold belts stay this far (tiles) from the coast, out of the coastal ranges' way. */
  const FOLD_INLAND_FROM = 5;
  const FOLD_INLAND_TO = 8;
  /** Crest height of the lowest range, as a share of the highest. */
  const BELT_HEIGHT_MIN = 0.8;
  /** Peaks and saddles: a crest dips by up to this share of its height between its summits. */
  const CREST_RELIEF = 0.3;
  /** Weight of a tile against each neighbour in `soften`, and the crest lift that makes up for what it takes off a crest. */
  const SOFTEN_CENTRE = 4;
  const SOFTEN_LIFT = 1.3;
  /** Profile below which a tile is no longer part of a belt. */
  const BELT_EDGE = 0.03;

  /** Which fold lines carry a range, which provinces are old. */
  const SELECT_OCTAVES: Octaves = [{ cx: 6, cy: 3, amp: 1 }, { cx: 12, cy: 6, amp: 0.4 }];
  /** The direction ocean plates push in. */
  const PUSH_OCTAVES: Octaves = [{ cx: 4, cy: 2, amp: 1 }];
  /** The fold lines: zero lines of this field, long and gently curved. */
  const FOLD_OCTAVES: Octaves = [{ cx: 10, cy: 5, amp: 1 }, { cx: 20, cy: 10, amp: 0.3 }];
  /** How high each range is. */
  const HEIGHT_OCTAVES: Octaves = [{ cx: 8, cy: 4, amp: 1 }];
  /** Summits and saddles along a crest. */
  const SUMMIT_OCTAVES: Octaves = [{ cx: 16, cy: 8, amp: 1 }, { cx: 32, cy: 16, amp: 0.5 }];

  /**
   * Connected runs (8-neighbour) of the tiles `mask` marks. Fills `order`
   * with the tiles run by run and returns the end of each run in it.
   */
  export function runsOf(mask: Uint8Array, order: Int32Array): number[] {
    const seen = new Uint8Array(TILE_COUNT);
    const ends: number[] = [];
    let n = 0;
    for (let s = 0; s < TILE_COUNT; s++) {
      if (!mask[s] || seen[s]) continue;
      seen[s] = 1;
      let head = n;
      order[n++] = s;
      while (head < n) {
        const i = order[head++];
        const x = i % GRID_W;
        const y = (i / GRID_W) | 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= GRID_H) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const j = idx(wrapX(x + dx), yy);
            if (mask[j] && !seen[j]) { seen[j] = 1; order[n++] = j; }
          }
        }
      }
      ends.push(n);
    }
    return ends;
  }

  /**
   * A light blur over the 3×3 neighbourhood. On a grid a range running
   * diagonally would otherwise alternate between tiles on its crest line and
   * tiles half a tile off it, and the altitude zones would break that zigzag
   * up into single tiles.
   */
  function soften(src: Float32Array): Float32Array {
    const row = new Float32Array(TILE_COUNT);
    const out = new Float32Array(TILE_COUNT);
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        row[idx(x, y)] = (src[idx(wrapX(x - 1), y)] + SOFTEN_CENTRE * src[idx(x, y)] + src[idx(wrapX(x + 1), y)]) / (SOFTEN_CENTRE + 2);
      }
    }
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        out[idx(x, y)] = (row[idx(x, clampY(y - 1))] + SOFTEN_CENTRE * row[idx(x, y)] + row[idx(x, clampY(y + 1))]) / (SOFTEN_CENTRE + 2);
      }
    }
    return out;
  }

  /** The coast itself stays low: beaches, not cliffs. */
  function coastBand(d: number): number {
    return d < 1.5 ? 0.25 : d < 2.5 ? 0.7 : 1;
  }

  /** Box blur over a square of side 2r+1, twice, wrapping in X. */
  function blur(src: Float32Array, r: number): Float32Array {
    const a = Float32Array.from(src);
    const b = new Float32Array(TILE_COUNT);
    const n = 2 * r + 1;
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          let sum = 0;
          for (let dx = -r; dx <= r; dx++) sum += a[idx(wrapX(x + dx), y)];
          b[idx(x, y)] = sum / n;
        }
      }
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          let sum = 0;
          for (let dy = -r; dy <= r; dy++) sum += b[idx(x, clampY(y + dy))];
          a[idx(x, y)] = sum / n;
        }
      }
    }
    return a;
  }

  /** Distance to the open coast, with lakes and small inland seas filled. */
  function openCoastDistance(elevation: Float32Array): Float32Array {
    const water = new Uint8Array(TILE_COUNT);
    for (let i = 0; i < TILE_COUNT; i++) if (elevation[i] < 0) water[i] = 1;
    const order = new Int32Array(TILE_COUNT);
    const open = Float32Array.from(elevation);
    let start = 0;
    for (const end of runsOf(water, order)) {
      if (end - start < ARC_SMALL_WATER) for (let k = start; k < end; k++) open[order[k]] = 0;
      start = end;
    }
    return shoreDistance(open);
  }

  /** A seeded noise field in -1..1 that is positive on `share` of the planet. */
  function field(seed: number, share: number, octaves: Octaves): Float32Array {
    const out = new Float32Array(TILE_COUNT);
    TerrainGenerator.generate(seed >>> 0, out, 1 - share, octaves);
    return out;
  }

  /** 0 below -RANGE_TAPER, 1 above +RANGE_TAPER, smooth between. */
  function taper(v: number): number {
    return smoothstep(clamp((v + RANGE_TAPER) / (2 * RANGE_TAPER), 0, 1));
  }

  /**
   * Distance (tiles) from each land tile to the nearest sea tile, measured
   * across diagonals too (chamfer 1/√2), so a range follows a diagonal coast
   * as closely as a straight one. Sea reads 0; a planet without sea, GRID_W.
   */
  export function shoreDistance(elevation: Float32Array): Float32Array {
    const d = new Float32Array(TILE_COUNT);
    let sea = false;
    for (let i = 0; i < TILE_COUNT; i++) {
      d[i] = elevation[i] < 0 ? 0 : GRID_W;
      if (elevation[i] < 0) sea = true;
    }
    if (!sea) return d;
    const r2 = Math.SQRT2;
    // Twice over, so distances carry across the seam of the cylinder.
    for (let round = 0; round < 2; round++) {
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          const i = idx(x, y);
          let v = Math.min(d[i], d[idx(wrapX(x - 1), y)] + 1);
          if (y > 0) {
            v = Math.min(v, d[idx(x, y - 1)] + 1, d[idx(wrapX(x - 1), y - 1)] + r2, d[idx(wrapX(x + 1), y - 1)] + r2);
          }
          d[i] = v;
        }
      }
      for (let y = GRID_H - 1; y >= 0; y--) {
        for (let x = GRID_W - 1; x >= 0; x--) {
          const i = idx(x, y);
          let v = Math.min(d[i], d[idx(wrapX(x + 1), y)] + 1);
          if (y < GRID_H - 1) {
            v = Math.min(v, d[idx(x, y + 1)] + 1, d[idx(wrapX(x - 1), y + 1)] + r2, d[idx(wrapX(x + 1), y + 1)] + r2);
          }
          d[i] = v;
        }
      }
    }
    return d;
  }

  /**
   * Raise the ranges and return each tile's mountain type. A range's cross
   * profile is drawn toward its crest height rather than added on top, so a
   * range on high ground does not pile up into a flat top at the ceiling;
   * `peak` is the crest height of the highest range.
   */
  export function raiseBelts(seed: number, elevation: Float32Array, uplift: Float32Array, peak: number): Uint8Array {
    const kind = new Uint8Array(TILE_COUNT);
    const before = Float32Array.from(elevation);
    const shore = shoreDistance(elevation);
    const open = openCoastDistance(elevation);
    const coast = blur(open, ARC_SMOOTH);
    const trend = blur(open, ARC_TREND);
    const push = field(seed ^ 0x510e527f, 0.5, PUSH_OCTAVES);
    const line = field(seed ^ 0x9b05688c, 0.5, FOLD_OCTAVES);
    const stretch = field(seed ^ 0x1f83d9ab, FOLD_LINE_SHARE, SELECT_OCTAVES);
    const old = field(seed ^ 0x5be0cd19, FOSSIL_SHARE, SELECT_OCTAVES);
    const height = field(seed ^ 0x428a2f98, 0.5, HEIGHT_OCTAVES);
    const summit = field(seed ^ 0x71374491, 0.5, SUMMIT_OCTAVES);

    uplift.fill(0);
    const added = new Float32Array(TILE_COUNT);
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const i = idx(x, y);
        const e0 = elevation[i];
        if (e0 < 0) continue;
        const d = shore[i];
        const h = 0.5 + 0.5 * height[i];

        const arcCrest = lerp(ARC_CREST_MIN, ARC_CREST_MAX, h);
        const arcCross = Math.max(0, 1 - Math.abs(coast[i] - arcCrest) / ARC_HALF_WIDTH);
        const cx = trend[idx(wrapX(x - 1), y)] - trend[idx(wrapX(x + 1), y)];
        const cy = trend[idx(x, clampY(y - 1))] - trend[idx(x, clampY(y + 1))];
        const angle = Math.PI * 2 * push[i];
        const facing = (cx * Math.cos(angle) + cy * Math.sin(angle)) / (Math.hypot(cx, cy) + 1e-6);
        const active = smoothstep(clamp((facing - ARC_FACING) / ARC_FACING_EDGE, 0, 1));
        const arc = Math.pow(arcCross, BELT_POW) * coastBand(d) * active;

        // Distance to the fold line in tiles, so a range is as wide where the field is flat as where it is steep.
        const gx = (line[idx(wrapX(x + 1), y)] - line[idx(wrapX(x - 1), y)]) / 2;
        const gy = (line[idx(x, clampY(y + 1))] - line[idx(x, clampY(y - 1))]) / 2;
        const foldCross = Math.max(0, 1 - Math.abs(line[i]) / (Math.hypot(gx, gy) + 1e-6) / FOLD_HALF_WIDTH);
        const inland = smoothstep(clamp((d - FOLD_INLAND_FROM) / (FOLD_INLAND_TO - FOLD_INLAND_FROM), 0, 1));
        const reach = inland * taper(stretch[i]);
        const fossil = taper(old[i]);
        const young = Math.pow(foldCross, BELT_POW) * reach;
        const fold = lerp(young, Math.pow(foldCross, FOSSIL_POW) * reach * FOSSIL_HEIGHT, fossil);

        const prof = Math.max(arc, fold);
        if (prof < BELT_EDGE) continue;
        if (arc >= fold) {
          kind[i] = UpliftKind.Arc;
          uplift[i] = arc;
        } else {
          kind[i] = UpliftKind.Fold;
          uplift[i] = young * (1 - fossil);
        }
        const crest = peak * (BELT_HEIGHT_MIN + (1 - BELT_HEIGHT_MIN) * h) * (1 - CREST_RELIEF * (0.5 - 0.5 * summit[i]));
        added[i] = Math.max(0, (crest * SOFTEN_LIFT - e0) * prof);
      }
    }
    const smooth = soften(added);
    for (let i = 0; i < TILE_COUNT; i++) if (elevation[i] >= 0) elevation[i] = Math.min(1, elevation[i] + smooth[i]);
    // A range must not dam the land behind it into a lake (breach.ts).
    breachDams(elevation, before);
    return kind;
  }
}
