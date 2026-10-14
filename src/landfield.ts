/* =============================================================================
 * SimEarth 2.0 — per-tile inputs of the pixel terrain
 * -----------------------------------------------------------------------------
 * Everything the compositor needs from the world, read once per refresh into
 * flat arrays: the ground key of each tile, water depth, relief and macro
 * shading as ramp steps, the river sprite, the distance to a lower ground
 * (forest edges), and the scene, density and plant groups that place
 * objects. Values are quantised here, so a tile's 32-bit signature fixes
 * exactly what is drawn — a chunk whose signatures did not change is
 * reused untouched, and two chunks always agree where they meet.
 * ========================================================================== */

namespace SE {
  /** Stable 0..1 hash of integer coordinates, the same as `hash` in tools/terrain/kit.js. */
  export function landHash(x: number, y: number, seed: number): number {
    let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(seed | 0, 0x9e3779b1);
    h ^= h >>> 15;
    h = Math.imul(h, 0x85ebca77);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae3d);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  /** Ordered-dither thresholds, Bayer 4×4 in world pixels, 0..1. */
  export const BAYER4 = Float32Array.from([0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], (v) => (v + 0.5) / 16);

  /**
   * Relief in ramp steps per unit of cross-tile slope, light from the upper
   * left. Over a planet's land the slope has a median near 0.09 and a 90th
   * percentile near 0.24 (see render.ts); with the dead zone the median tile
   * stays almost clean and a real flank darkens or lightens by a full step.
   */
  const RELIEF_GAIN = 6;
  const RELIEF_DEAD = 0.45;
  const RELIEF_LIMIT = 2;
  /** Highlands a little lighter, lowlands a little darker, in steps per unit of elevation. */
  const ALTITUDE_GAIN = 0.5;
  /** Macro variation: value-noise lattice cells around the planet (8 tiles each). */
  const MACRO_CELLS = 32;
  /** |noise| where a patch starts to shift, and the band over which it reaches one step. */
  const MACRO_START = 0.22;
  const MACRO_BAND = 0.2;
  /** Shading is quantised to this fraction of a step. */
  const QUANT = 8;
  /** The water ramp position of the shallowest water; the last step of the ramp is foam. */
  export const LAND_SHALLOW = TERRAIN_MANIFEST.ramps.water.length - 2;
  /** Water ramp position by elevation (deep → shallow), the knots of DEPTH_RAMP on an 8-step ramp. */
  const DEPTH_KNOTS: readonly (readonly [number, number])[] = [
    [-1, 0], [-0.6, 1], [-0.35, 2], [COAST_DEPTH, 3], [-0.07, 4.5], [0, 6],
  ].map(([e, d]) => [e, (d * LAND_SHALLOW) / 6] as const);
  /** Tiles beyond a chunk whose inputs reach into it: dual grid 1, objects 1, edge distance 2. */
  const SIGNATURE_REACH = 3;

  function depthAt(e: number): number {
    if (e <= -1) return 0;
    for (let k = 1; k < DEPTH_KNOTS.length; k++) {
      const [e1, d1] = DEPTH_KNOTS[k];
      if (e <= e1) {
        const [e0, d0] = DEPTH_KNOTS[k - 1];
        return d0 + ((e - e0) / (e1 - e0)) * (d1 - d0);
      }
    }
    return LAND_SHALLOW;
  }

  /** Sparse light and dark patches, a few tiles across, so textures never show their period. */
  const MACRO: Float32Array = (() => {
    const out = new Float32Array(TILE_COUNT);
    const cell = GRID_W / MACRO_CELLS;
    const rows = Math.ceil(GRID_H / cell) + 1;
    const smooth = (t: number): number => t * t * (3 - 2 * t);
    for (let y = 0; y < GRID_H; y++) {
      const fy = y / cell;
      const y0 = Math.floor(fy);
      const ty = smooth(fy - y0);
      for (let x = 0; x < GRID_W; x++) {
        const fx = x / cell;
        const x0 = Math.floor(fx);
        const tx = smooth(fx - x0);
        const x1 = (x0 + 1) % MACRO_CELLS;
        const at = (a: number, b: number): number => landHash(a, Math.min(b, rows), 4242);
        const top = at(x0, y0) + (at(x1, y0) - at(x0, y0)) * tx;
        const bottom = at(x0, y0 + 1) + (at(x1, y0 + 1) - at(x0, y0 + 1)) * tx;
        const n = (top + (bottom - top) * ty) * 2 - 1;
        const m = Math.abs(n);
        out[y * GRID_W + x] = Math.sign(n) * clamp((m - MACRO_START) / MACRO_BAND, 0, 1);
      }
    }
    return out;
  })();

  export class TerrainField {
    /** 0 water, else landKey(rank, density). */
    readonly key = new Uint8Array(TILE_COUNT);
    /** Water ramp position, 0 deep .. LAND_SHALLOW; land counts as shallowest. */
    readonly depth = new Float32Array(TILE_COUNT);
    /** Ramp shift of the ground from relief and macro variation. */
    readonly shade = new Float32Array(TILE_COUNT);
    /** 1 on a river tile (no objects there), else 0. */
    readonly river = new Uint8Array(TILE_COUNT);
    /** The rivers as drawn lines. */
    readonly paths = new RiverPaths();
    /** 1 where freshwater algae film the open water of the ground (mire pools). */
    readonly algae = new Uint8Array(TILE_COUNT);
    /** Tiles to the nearest lower-ranked ground, 0..2. */
    readonly edge = new Uint8Array(TILE_COUNT);
    /** Landscape (or LAND_SCENE_SEA) whose objects the tile shows, or LAND_SCENE_NONE. */
    readonly scene = new Uint8Array(TILE_COUNT);
    readonly density = new Uint8Array(TILE_COUNT);
    /** Plant groups that can show an object in the tile's scene. */
    readonly groups = new Uint16Array(TILE_COUNT);
    /** The group that shapes the tile. */
    readonly top = new Uint8Array(TILE_COUNT);
    readonly sig = new Uint32Array(TILE_COUNT);
    private readonly rank = new Uint8Array(TILE_COUNT);
    private readonly low = new Uint8Array(TILE_COUNT);
    private readonly wide = new Uint8Array(TILE_COUNT);

    refresh(world: WorldState): void {
      const T = LandTables.shared();
      const { elevation: e, biome, landscape, landscapeDensity, substrate, flora, floraTop, vegetation, riverLevel, tech } = world;
      const algae = floraBit(Flora.FreshwaterAlgae);
      const kelp = floraBit(Flora.MarineAlgae);
      for (let i = 0; i < TILE_COUNT; i++) {
        const h = e[i];
        let key = 0;
        let scene = LAND_SCENE_NONE;
        let density = 0;
        let groups = 0;
        let shade = 0;
        let river = 0;
        if (h < 0) {
          if (biome[i] === Biome.Arctic) key = T.seaIceKey;
          else if (biome[i] === Biome.Coast && (flora[i] & kelp) !== 0) {
            scene = LAND_SCENE_SEA;
            groups = kelp;
            density = vegetation[i] < 0.3 ? 0 : vegetation[i] < 0.6 ? 1 : 2;
          }
          this.depth[i] = Math.round(depthAt(h) * QUANT) / QUANT;
        } else {
          const ls = landscape[i];
          density = Math.min(landscapeDensity[i], T.steps[ls * 4 + substrate[i]] - 1);
          key = T.groundKey(ls, substrate[i], density);
          this.depth[i] = LAND_SHALLOW;
          shade = this.relief(e, i) + MACRO[i];
          if (riverLevel[i] > 0) river = 1;
          if (river === 0 && tech[i] === Tech.None) {
            scene = ls;
            groups = flora[i] & T.showable[ls];
          }
        }
        if (key !== 0 && h < 0) shade = MACRO[i];
        this.key[i] = key;
        this.rank[i] = key === 0 ? 0 : landKeyRank(key);
        this.shade[i] = Math.round(clamp(shade, -LAND_SHIFT_MAX + 1, LAND_SHIFT_MAX - 1) * QUANT) / QUANT;
        this.river[i] = river;
        this.algae[i] = h >= 0 && (flora[i] & algae) !== 0 ? 1 : 0;
        this.scene[i] = scene;
        this.density[i] = density;
        this.groups[i] = groups;
        this.top[i] = floraTop[i];
      }
      this.edges();
      this.paths.build(world);
      const lines = this.paths.sig;
      for (let i = 0; i < TILE_COUNT; i++) {
        let s = Math.imul(this.key[i] ^ (this.river[i] << 8) ^ (this.edge[i] << 16) ^ (this.density[i] << 20) ^ (this.algae[i] << 23) ^ (this.scene[i] << 24), 0x9e3779b1);
        s ^= Math.imul(this.groups[i] ^ (this.top[i] << 16), 0x85ebca77) ^ Math.imul(lines[i], 0x27d4eb2d);
        s ^= Math.imul((this.depth[i] * QUANT) ^ (((this.shade[i] + LAND_SHIFT_MAX) * QUANT) << 8), 0xc2b2ae3d);
        this.sig[i] = (s ^ (s >>> 15)) >>> 0;
      }
    }

    /** Hillshade in ramp steps: light from the upper left, highlands a little paler. */
    private relief(e: Float32Array, i: number): number {
      const x = i % GRID_W;
      const y = (i / GRID_W) | 0;
      const slope = Math.max(0, e[idx(wrapX(x - 1), y)]) - Math.max(0, e[idx(wrapX(x + 1), y)]) +
        Math.max(0, e[idx(x, clampY(y - 1))]) - Math.max(0, e[idx(x, clampY(y + 1))]);
      const raw = slope * RELIEF_GAIN;
      const s = Math.sign(raw) * Math.max(0, Math.abs(raw) - RELIEF_DEAD);
      return clamp(s + (e[i] - 0.3) * ALTITUDE_GAIN, -RELIEF_LIMIT, RELIEF_LIMIT);
    }

    /** Chebyshev distance (0, 1, 2+) to a tile of lower material rank — water counts as rank 0. */
    private edges(): void {
      const { rank, low, edge } = this;
      const min3 = (src: Uint8Array, dst: Uint8Array): void => {
        for (let y = 0; y < GRID_H; y++) {
          const ya = clampY(y - 1) * GRID_W;
          const yb = y * GRID_W;
          const yc = clampY(y + 1) * GRID_W;
          for (let x = 0; x < GRID_W; x++) {
            const xa = wrapX(x - 1);
            const xc = wrapX(x + 1);
            dst[yb + x] = Math.min(src[ya + xa], src[ya + x], src[ya + xc], src[yb + xa], src[yb + x], src[yb + xc],
              src[yc + xa], src[yc + x], src[yc + xc]);
          }
        }
      };
      min3(rank, low);
      min3(low, this.wide);
      for (let i = 0; i < TILE_COUNT; i++) edge[i] = low[i] < rank[i] ? 0 : this.wide[i] < rank[i] ? 1 : 2;
    }

    /** Signature of everything that reaches into tiles [tx0, tx0 + tw) × [ty0, ty0 + th). */
    signature(tx0: number, ty0: number, tw: number, th: number, salt: number): number {
      let h = (0x811c9dc5 ^ salt) >>> 0;
      const r = SIGNATURE_REACH;
      for (let y = Math.max(0, ty0 - r); y < Math.min(GRID_H, ty0 + th + r); y++) {
        const row = y * GRID_W;
        for (let x = tx0 - r; x < tx0 + tw + r; x++) h = Math.imul(h ^ this.sig[row + wrapX(x)], 0x01000193);
      }
      return h >>> 0;
    }
  }
}
