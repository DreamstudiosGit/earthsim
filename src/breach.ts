/* =============================================================================
 * SimEarth 2.0 — water gaps through new mountain ranges
 * -----------------------------------------------------------------------------
 * A range raised across the drainage of the land behind it dams that land
 * into a lake up to its lowest pass. The river network routes straight lines
 * across such filled lakes, so a planet with long ranges drew long dead-
 * straight rivers. Real ranges that rose across a river were cut by it (a
 * water gap), and that is what `breachDams` does: every basin a range dammed
 * gets a gorge through the range along the way its water would spill.
 * ========================================================================== */

namespace SE {
  /** Lake depth (elevation) from which a lake is breached: about 225 m. Shallower lakes stay, so the ranges are not cut into pieces. */
  const DAM_DEPTH = 0.05;
  /** Rounds of breaching; each one opens the basins the last one left dammed. */
  const BREACH_ROUNDS = 4;
  /** A gorge falls by this much per tile (about 5 m), so its river has a course to follow. */
  const GORGE_FALL = 0.001;
  /** Smallest step the flood raises a basin over its outlet, as in RiverSystem. */
  const FLOOD_EPSILON = 1e-5;

  /** Minimum-key binary heap over (key, tile) pairs, sized for the grid. */
  class FloodHeap {
    private readonly keys = new Float32Array(TILE_COUNT);
    private readonly tiles = new Int32Array(TILE_COUNT);
    size = 0;

    push(key: number, tile: number): void {
      let i = this.size++;
      while (i > 0) {
        const parent = (i - 1) >> 1;
        if (this.keys[parent] <= key) break;
        this.keys[i] = this.keys[parent];
        this.tiles[i] = this.tiles[parent];
        i = parent;
      }
      this.keys[i] = key;
      this.tiles[i] = tile;
    }

    /** Pop the tile with the smallest key; its key is left in `lastKey`. */
    pop(): number {
      const top = this.tiles[0];
      this.lastKey = this.keys[0];
      const key = this.keys[--this.size];
      const tile = this.tiles[this.size];
      let i = 0;
      for (;;) {
        let child = 2 * i + 1;
        if (child >= this.size) break;
        if (child + 1 < this.size && this.keys[child + 1] < this.keys[child]) child++;
        if (this.keys[child] >= key) break;
        this.keys[i] = this.keys[child];
        this.tiles[i] = this.tiles[child];
        i = child;
      }
      this.keys[i] = key;
      this.tiles[i] = tile;
      return top;
    }

    lastKey = 0;
  }

  /**
   * Priority flood from the sea (as `RiverSystem` does): `filled` gets each
   * tile's lake level, `from` the tile the flood reached it from, which is
   * the next step of the way its water leaves.
   */
  function flood(elevation: Float32Array, filled: Float32Array, from: Int32Array, heap: FloodHeap): void {
    const settled = new Uint8Array(TILE_COUNT);
    heap.size = 0;
    from.fill(-1);
    for (let i = 0; i < TILE_COUNT; i++) {
      filled[i] = elevation[i];
      if (elevation[i] < 0) { settled[i] = 1; heap.push(0, i); }
    }
    while (heap.size > 0) {
      const i = heap.pop();
      const level = heap.lastKey;
      const x = i % GRID_W;
      const y = (i / GRID_W) | 0;
      for (let k = 0; k < 4; k++) {
        const j = k === 0 ? idx(wrapX(x - 1), y) : k === 1 ? idx(wrapX(x + 1), y) : k === 2 ? idx(x, clampY(y - 1)) : idx(x, clampY(y + 1));
        if (settled[j]) continue;
        settled[j] = 1;
        filled[j] = Math.max(elevation[j], level + FLOOD_EPSILON);
        from[j] = i;
        heap.push(filled[j], j);
      }
    }
  }

  /**
   * Cut a gorge through the ranges wherever they dam a lake: from the bottom
   * of each lake along the way the water drained before the ranges rose
   * (over `before`), what the ranges added on top of that ground is taken
   * off down to the level the water has come down to. The ground itself is
   * never cut, so a lake the old relief held stays.
   */
  export function breachDams(elevation: Float32Array, before: Float32Array): void {
    const heap = new FloodHeap();
    const filled = new Float32Array(TILE_COUNT);
    const drain = new Int32Array(TILE_COUNT);
    flood(before, filled, drain, heap);
    const from = new Int32Array(TILE_COUNT);
    const dammed: number[] = [];
    for (let round = 0; round < BREACH_ROUNDS; round++) {
      flood(elevation, filled, from, heap);
      dammed.length = 0;
      for (let i = 0; i < TILE_COUNT; i++) {
        if (elevation[i] < 0) continue;
        if (filled[i] - elevation[i] > DAM_DEPTH && elevation[i] >= 0) dammed.push(i);
      }
      if (dammed.length === 0) return;
      dammed.sort((a, b) => elevation[a] - elevation[b]);
      const cut = new Uint8Array(TILE_COUNT);
      for (const start of dammed) {
        if (cut[start]) continue;
        let level = elevation[start];
        for (let t = drain[start]; t >= 0 && elevation[t] >= 0 && !cut[t]; t = drain[t]) {
          cut[t] = 1;
          if (elevation[t] > level) elevation[t] = Math.max(before[t], level - GORGE_FALL);
          level = elevation[t];
        }
      }
    }
  }
}
