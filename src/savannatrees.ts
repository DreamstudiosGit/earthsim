/* =============================================================================
 * SimEarth 2.0 — savanna trees, the flowering plants' savanna form
 * -----------------------------------------------------------------------------
 * Like the cacti in the desert, savanna trees are no group and no step of
 * the tree: once broadleaf trees have arisen on the planet, the map draws a
 * Schirmbaum (about every eighth a baobab) on some savanna tiles where
 * flowering plants grow — few next to the desert, more towards the forest.
 * Drawing only: the simulation does not know them.
 *
 * Where a savanna tile lies between desert and forest comes from two
 * distance fields over the land, worked out by the terrain field's refresh
 * and only when a landscape changed, never per frame.
 * ========================================================================== */

namespace SE {
  const FOREST: readonly Landscape[] = [Landscape.Forest, Landscape.Rainforest, Landscape.Cloudforest, Landscape.Taiga, Landscape.Swampforest];

  /** Have broadleaf trees arisen on the planet? */
  export function savannaTreesArrived(world: WorldState): boolean {
    return world.evo.developed.has(FLORA[Flora.Broadleaf].id);
  }

  /**
   * The share of savanna tiles that carry a tree, by the distance in tiles
   * to the nearest desert and forest (SAVANNA_TREE_REACH + 1: none near).
   */
  export function savannaTreeShare(toDry: number, toForest: number): number {
    const far = SAVANNA_TREE_REACH;
    const t = toDry > far && toForest > far ? 0.5 : toDry > far ? 1 : toForest > far ? 0 : toDry / (toDry + toForest);
    return SAVANNA_TREE_SHARE_DRY + (SAVANNA_TREE_SHARE_FOREST - SAVANNA_TREE_SHARE_DRY) * t;
  }

  /** Distances from every land tile to the nearest desert and forest, capped at SAVANNA_TREE_REACH + 1. */
  export class SavannaReach {
    readonly toDry = new Uint8Array(TILE_COUNT);
    readonly toForest = new Uint8Array(TILE_COUNT);
    private readonly seen = new Uint8Array(TILE_COUNT);
    private readonly queue = new Int32Array(TILE_COUNT);
    private valid = false;

    /** Recompute when a landscape changed since the last call. */
    update(world: WorldState): void {
      const ls = world.landscape;
      if (this.valid) {
        let same = true;
        for (let i = 0; i < TILE_COUNT && same; i++) same = ls[i] === this.seen[i];
        if (same) return;
      }
      this.seen.set(ls);
      this.valid = true;
      this.spread(world, (l) => isCactusLandscape(l), this.toDry);
      this.spread(world, (l) => FOREST.includes(l), this.toForest);
    }

    private spread(world: WorldState, from: (l: Landscape) => boolean, out: Uint8Array): void {
      const { elevation, landscape } = world;
      const q = this.queue;
      let tail = 0;
      out.fill(SAVANNA_TREE_REACH + 1);
      for (let i = 0; i < TILE_COUNT; i++) {
        if (elevation[i] >= 0 && from(landscape[i])) { out[i] = 0; q[tail++] = i; }
      }
      for (let head = 0; head < tail; head++) {
        const i = q[head];
        const d = out[i] + 1;
        if (d > SAVANNA_TREE_REACH) continue;
        const x = i % GRID_W;
        const y = (i / GRID_W) | 0;
        for (let k = 0; k < 4; k++) {
          const j = k === 0 ? idx(wrapX(x - 1), y) : k === 1 ? idx(wrapX(x + 1), y) : k === 2 ? (y > 0 ? i - GRID_W : -1) : (y < GRID_H - 1 ? i + GRID_W : -1);
          if (j < 0 || elevation[j] < 0 || out[j] <= d) continue;
          out[j] = d;
          q[tail++] = j;
        }
      }
    }
  }

  /** Which tree stands on tile (x, y): a Schirmbaum, about every eighth a baobab (if the atlas has one). */
  export function savannaTreeId(art: LandArt, x: number, y: number): string {
    return art.sprites.baobab && landHash(x, y, 831) < SAVANNA_BAOBAB_SHARE ? 'baobab' : 'acacia';
  }
}
