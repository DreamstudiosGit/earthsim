/* =============================================================================
 * SimEarth 2.0 — plant and rock objects on the pixel terrain
 * -----------------------------------------------------------------------------
 * Every tile expects a number of trees, bushes and low plants by landscape and
 * density (catalog `objects`); each slot goes to one of the plant groups that
 * grow there, the group that shapes the tile weighted up, so a mixed forest
 * shows spruces and broadleaf trees and a marsh reed and sundew. Near a lower
 * ground the cover thins (×0.35 / ×0.7) and trees stay small, at the very edge
 * they give way to bushes — the forest mantle (spec §4.5).
 *
 * Position, jitter, size and variant all come from hashes of the tile, never
 * per frame. Objects are drawn row by row from the top, so crowns overlap into
 * a closed canopy, each over a small ramp-shift shadow on the ground.
 * ========================================================================== */

namespace SE {
  export interface LandPlacement {
    readonly sprite: LandSprite;
    /** Foot in world pixels (x unwrapped, as the caller's tiles were). */
    readonly fx: number;
    readonly fy: number;
    /** Kelp: drawn on sea water only, without a shadow. */
    readonly water: boolean;
    /** World-stable tie-break for objects with the same foot. */
    readonly seq: number;
  }

  /**
   * A slot goes to one of the groups present that has an object of its kind
   * here, weighted: the group that shapes the tile, a group drawn for this
   * landscape in particular, any other. The flora keeps old groups for ever,
   * so without weights a modern forest would be half palm ferns; with them
   * the leading group shapes the picture and every other group still shows.
   */
  const WEIGHT_TOP = 4;
  const WEIGHT_SPECIFIC = 2;
  const WEIGHT_OTHER = 1;
  /** Object density by distance to a lower ground: at the edge, one tile in, inside. */
  const EDGE_FALLOFF = [0.35, 0.7, 1];
  /** Share of edge trees that become bushes. */
  const MANTLE = 0.6;
  /** Shadow: fraction of the sprite width, and ramp steps. */
  const SHADOW_WIDTH = 0.35;
  const SHADOW_SHIFT = -2;

  /** Objects of tiles [x0, x1] × [y0, y1] (inclusive, x unwrapped), sorted for drawing. */
  export function placeLandObjects(f: TerrainField, art: LandArt, x0: number, y0: number, x1: number, y1: number, out: LandPlacement[]): void {
    out.length = 0;
    for (let y = Math.max(0, y0); y <= Math.min(GRID_H - 1, y1); y++) {
      for (let x = x0; x <= x1; x++) placeTile(f, art, x, y, out);
    }
    out.sort((a, b) => a.fy - b.fy || a.fx - b.fx || a.seq - b.seq);
  }

  function placeTile(f: TerrainField, art: LandArt, x: number, y: number, out: LandPlacement[]): void {
    const xw = wrapX(x);
    const i = y * GRID_W + xw;
    const scene = f.scene[i];
    if (scene === LAND_SCENE_NONE) return;
    const T = LandTables.shared();
    const counts = T.counts[scene];
    const edge = f.edge[i];
    const d = f.density[i];
    let slot = 0;
    for (let kind = 0; kind < counts.length; kind++) {
      const c = counts[kind];
      if (!c) continue;
      const expect = c[Math.min(d, c.length - 1)] * EDGE_FALLOFF[edge];
      const n = Math.floor(expect) + (landHash(xw, y, 500 + kind) < expect % 1 ? 1 : 0);
      for (let s = 0; s < n; s++, slot++) {
        const mantle = kind === LAND_KIND_TREE && edge === 0 && landHash(xw, y, 600 + slot) < MANTLE;
        let id = pick(f, T, i, scene, mantle ? LAND_KIND_BUSH : kind, xw, y, slot);
        // No bush grows here: a young tree stands at the edge instead.
        if (!id && mantle) id = pick(f, T, i, scene, kind, xw, y, slot);
        if (id) out.push(spot(art, id, xw, x, y, slot, edge, mantle));
      }
    }
    const rate = T.abioticRate[scene];
    if (rate > 0 && landHash(xw, y, 800) < rate) {
      const ids = T.abioticIds[scene];
      if (ids.length > 0) out.push(spot(art, ids[Math.floor(landHash(xw, y, 801) * ids.length)], xw, x, y, 9, 2, false));
    }
  }

  /** The object a slot shows: a group by weight, then one of its objects for this scene. */
  function pick(f: TerrainField, T: LandTables, i: number, scene: number, kind: number, xw: number, y: number, slot: number): string | null {
    const groups = f.groups[i];
    const top = f.top[i];
    const weight = (g: number): number =>
      g === top ? WEIGHT_TOP : T.isSpecific(scene, g, kind) ? WEIGHT_SPECIFIC : WEIGHT_OTHER;
    let total = 0;
    for (let g = 1; g < FLORA_COUNT; g++) {
      if ((groups & (1 << g)) !== 0 && T.choices(scene, g, kind).length > 0) total += weight(g);
    }
    if (total === 0) return null;
    let roll = landHash(xw, y, 700 + slot) * total;
    for (let g = 1; g < FLORA_COUNT; g++) {
      if ((groups & (1 << g)) === 0) continue;
      const list = T.choices(scene, g, kind);
      if (list.length === 0) continue;
      roll -= weight(g);
      if (roll < 0) return list[Math.floor(landHash(xw, y, 710 + slot) * list.length)];
    }
    return null;
  }

  function spot(art: LandArt, id: string, xw: number, x: number, y: number, slot: number, edge: number, small: boolean): LandPlacement {
    const vars = art.sprites[id];
    let sprite = vars[0];
    if (vars[0].size) {
      const r = landHash(xw, y, 900 + slot);
      const size = small || edge === 0 ? 's' : edge === 1 ? (r < 0.5 ? 's' : 'm') : (r < 0.3 ? 'm' : 'l');
      const form = landHash(xw, y, 910 + slot) < 0.5 ? 0 : 1;
      sprite = vars.find((v) => v.size === size && v.form === form) ?? vars.find((v) => v.size === size) ?? vars[0];
    } else {
      sprite = vars[Math.floor(landHash(xw, y, 920 + slot) * vars.length)];
    }
    // Slots spread over a jittered 2×2 pattern, feet in the lower part of the tile.
    const p = (slot + Math.floor(landHash(xw, y, 930) * 4)) % 4;
    const fx = x * 16 + 4 + (p % 2) * 8 + Math.floor((landHash(xw, y, 940 + slot) - 0.5) * 5);
    const fy = y * 16 + 7 + (p >> 1) * 6 + Math.floor((landHash(xw, y, 950 + slot) - 0.5) * 4);
    const water = art.manifest.objects[id].kind === 'water';
    return { sprite, fx, fy, water, seq: (y * GRID_W + xw) * 16 + slot };
  }

  /**
   * Draw placements into an index buffer of width `w` whose pixel (0, 0) is
   * world pixel (ox, oy): first each shadow on bare ground (never on water,
   * never twice), then the sprite.
   */
  export function drawLandObjects(
    list: readonly LandPlacement[], art: LandArt,
    px: Uint8Array, water: Uint8Array, occupied: Uint8Array, w: number, h: number, ox: number, oy: number,
  ): void {
    const shadow = art.shift[LAND_SHIFT_MAX + SHADOW_SHIFT];
    for (const p of list) {
      const t = p.sprite;
      const fx = p.fx - ox;
      const fy = p.fy - oy;
      if (!p.water) {
        const rx = Math.max(2, t.w * SHADOW_WIDTH);
        const reach = Math.ceil(rx);
        for (let dy = -1; dy <= 1; dy++) {
          const y = fy + dy;
          if (y < 0 || y >= h) continue;
          for (let dx = -reach; dx <= reach; dx++) {
            if ((dx / rx) ** 2 + (dy / 1.5) ** 2 > 1) continue;
            const x = fx + 1 + dx;
            if (x < 0 || x >= w) continue;
            const k = y * w + x;
            if (occupied[k] !== 0 || water[k] !== 0) continue;
            px[k] = shadow[px[k]];
            occupied[k] = 2;
          }
        }
      }
      const left = fx - t.ax;
      const top = fy - t.ay;
      for (let sy = 0; sy < t.h; sy++) {
        const y = top + sy;
        if (y < 0 || y >= h) continue;
        for (let sx = 0; sx < t.w; sx++) {
          const v = t.px[sy * t.w + sx];
          if (v === 0) continue;
          const x = left + sx;
          if (x < 0 || x >= w) continue;
          const k = y * w + x;
          if (p.water && water[k] !== 1) continue;
          px[k] = v;
          occupied[k] = 1;
        }
      }
    }
  }
}
