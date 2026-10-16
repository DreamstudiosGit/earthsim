/* =============================================================================
 * SimEarth 2.0 — island arcs and trenches
 * -----------------------------------------------------------------------------
 * Where an ocean plate dives under another, a curved chain of small volcanic
 * islands rises off the coast with a trench on its ocean side; in front of a
 * coastal range the sea deepens into a trench too (docs/hoehe-spec.md §3.3).
 * The young Earth raises its own arcs (youngearth.ts); they are typed here.
 * ========================================================================== */

namespace SE {
  /** Island arcs per random planet. */
  const ISLAND_ARCS_MIN = 1;
  const ISLAND_ARCS_MAX = 3;
  /** Open sea between an arc and the coast it fronts, in tiles. */
  const ARC_OFFSHORE_MIN = 4;
  const ARC_OFFSHORE_MAX = 12;
  /** Arc tiles closer to land than this are left out, so the arc stays a chain of islands. */
  const ARC_CLEARANCE = 3;
  /** Radius of an arc's curve and half its length, in tiles. */
  const ARC_RADIUS_MIN = 14;
  const ARC_RADIUS_MAX = 28;
  const ARC_HALF_MIN = 7;
  const ARC_HALF_MAX = 13;
  /** Tiles along the arc between two volcanic islands. */
  const ARC_SPACING_MIN = 4;
  const ARC_SPACING_MAX = 6;
  /** Island height range: about 200 m to 1 km. */
  const ARC_ISLAND_MIN = 0.04;
  const ARC_ISLAND_MAX = 0.22;
  /** The submarine ridge between the islands, drawn as shelf water. */
  const ARC_RIDGE = COAST_DEPTH * 0.6;
  /** Uplift an arc island starts with; `balanceUplift` then sets what holds it against erosion. */
  const ARC_ISLAND_UPLIFT = 0.25;
  /** Young Earth: land patches up to this size over hot mantle are its island arcs. */
  const YOUNG_ARC_TILES = 4;
  const YOUNG_ARC_MAGMA = 0.75;

  /** The trench: tiles seaward of an arc, and the depth of its floor. */
  const TRENCH_OFFSET = 2.5;
  const TRENCH_DEPTH = -0.95;
  /** Sea distance (tiles) of the trench axis in front of a coastal range, and its half width. */
  const TRENCH_AXIS = 4;
  const TRENCH_HALF_WIDTH = 2;


  /**
   * Deepen the sea in front of the coastal ranges into a trench: deep water
   * only, so the shelf where the algae live keeps its size.
   */
  export function deepenTrenches(world: WorldState): void {
    const { elevation, upliftKind, uplift } = world;
    // Coasts backed by an active coastal range within ARC_SHORE tiles inland.
    const reach = new Int32Array(TILE_COUNT).fill(-1);
    const queue = new Int32Array(TILE_COUNT);
    let head = 0;
    let tail = 0;
    for (let i = 0; i < TILE_COUNT; i++) {
      if (upliftKind[i] === UpliftKind.Arc && uplift[i] > 0 && elevation[i] >= 0) { reach[i] = 0; queue[tail++] = i; }
    }
    const coast = new Int32Array(TILE_COUNT).fill(-1);
    let coastTail = 0;
    const coastQueue = new Int32Array(TILE_COUNT);
    while (head < tail) {
      const i = queue[head++];
      const x = i % GRID_W;
      const y = (i / GRID_W) | 0;
      for (const j of [idx(wrapX(x - 1), y), idx(wrapX(x + 1), y), idx(x, clampY(y - 1)), idx(x, clampY(y + 1))]) {
        if (elevation[j] < 0) {
          if (coast[j] < 0) { coast[j] = 1; coastQueue[coastTail++] = j; }
        } else if (reach[j] < 0 && reach[i] < ARC_SHORE) {
          reach[j] = reach[i] + 1;
          queue[tail++] = j;
        }
      }
    }
    // Out to sea from those coasts.
    head = 0;
    while (head < coastTail) {
      const i = coastQueue[head++];
      const d = coast[i];
      const w = 1 - Math.abs(d - TRENCH_AXIS) / TRENCH_HALF_WIDTH;
      if (w > 0 && elevation[i] < COAST_DEPTH) {
        const target = lerp(elevation[i], TRENCH_DEPTH, w);
        if (target < elevation[i]) raiseCrust(world, i, target - elevation[i], UpliftKind.None);
      }
      if (d >= TRENCH_AXIS + TRENCH_HALF_WIDTH) continue;
      const x = i % GRID_W;
      const y = (i / GRID_W) | 0;
      for (const j of [idx(wrapX(x - 1), y), idx(wrapX(x + 1), y), idx(x, clampY(y - 1)), idx(x, clampY(y + 1))]) {
        if (elevation[j] < 0 && coast[j] < 0) { coast[j] = d + 1; coastQueue[coastTail++] = j; }
      }
    }
  }

  /**
   * Curved chains of small volcanic islands off a coast, bowed toward the
   * open ocean with a trench on that side, as where one ocean plate dives
   * under another.
   */
  export function raiseIslandArcs(world: WorldState): void {
    const { elevation } = world;
    const flipped = new Float32Array(TILE_COUNT);
    for (let i = 0; i < TILE_COUNT; i++) flipped[i] = -elevation[i];
    const offshore = TerrainGenerator.distanceToWater(flipped);
    const rng = new Rng(world.seed ^ 0x7f4a7c15);
    const arcs = ISLAND_ARCS_MIN + rng.int(ISLAND_ARCS_MAX - ISLAND_ARCS_MIN + 1);
    const margin = Math.round(GRID_H / 8);

    for (let a = 0; a < arcs; a++) {
      for (let tries = 0; tries < 80; tries++) {
        const x = rng.int(GRID_W);
        const y = margin + rng.int(GRID_H - 2 * margin);
        const off = offshore[idx(x, y)];
        if (off < ARC_OFFSHORE_MIN || off > ARC_OFFSHORE_MAX) continue;
        // Away from land: up the gradient of the distance to it.
        const gx = offshore[idx(wrapX(x + 2), y)] - offshore[idx(wrapX(x - 2), y)];
        const gy = offshore[idx(x, clampY(y + 2))] - offshore[idx(x, clampY(y - 2))];
        const len = Math.hypot(gx, gy);
        if (len < 1) continue;
        const radius = rng.range(ARC_RADIUS_MIN, ARC_RADIUS_MAX);
        const half = rng.range(ARC_HALF_MIN, ARC_HALF_MAX);
        if (layArc(world, offshore, rng, x - (gx / len) * radius, y - (gy / len) * radius, radius, Math.atan2(gy, gx), half / radius)) break;
      }
    }
  }

  /** Lay one arc around (cx, cy); false if too little of it lies in open sea. */
  function layArc(
    world: WorldState, offshore: Int32Array, rng: Rng,
    cx: number, cy: number, radius: number, theta0: number, half: number,
  ): boolean {
    // The mantle field is left alone: it must not depend on where the coasts
    // and so the sea share put the arcs (tests/ocean.test.js).
    const { elevation, uplift } = world;
    const step = 0.5 / radius;
    const tiles: number[] = [];
    for (let t = theta0 - half; t <= theta0 + half; t += step) {
      const ty = Math.round(cy + radius * Math.sin(t));
      if (ty < 1 || ty >= GRID_H - 1) continue;
      const i = idx(wrapX(Math.round(cx + radius * Math.cos(t))), ty);
      if (tiles[tiles.length - 1] === i || tiles.includes(i)) continue;
      if (elevation[i] >= 0 || offshore[i] < ARC_CLEARANCE || world.upliftKind[i] !== UpliftKind.None) continue;
      tiles.push(i);
    }
    if (tiles.length < 2 * half * radius * 0.6) return false;

    let next = 0;
    let islands = 0;
    for (const i of tiles) {
      if (--next <= 0) {
        raiseCrust(world, i, rng.range(ARC_ISLAND_MIN, ARC_ISLAND_MAX) - elevation[i], UpliftKind.IslandArc);
        uplift[i] = ARC_ISLAND_UPLIFT;
        islands++;
        next = Math.round(rng.range(ARC_SPACING_MIN, ARC_SPACING_MAX));
      } else if (elevation[i] < ARC_RIDGE) {
        raiseCrust(world, i, ARC_RIDGE - elevation[i], UpliftKind.IslandArc);
      }
    }
    for (let t = theta0 - half; t <= theta0 + half; t += step) {
      const r = radius + TRENCH_OFFSET;
      const ty = Math.round(cy + r * Math.sin(t));
      if (ty < 1 || ty >= GRID_H - 1) continue;
      const i = idx(wrapX(Math.round(cx + r * Math.cos(t))), ty);
      if (elevation[i] < COAST_DEPTH && elevation[i] > TRENCH_DEPTH) raiseCrust(world, i, TRENCH_DEPTH - elevation[i], UpliftKind.None);
    }
    return islands > 0;
  }

  /**
   * The young Earth raises its own island arcs (youngearth.ts): small islands
   * over hot mantle. Type them, and give them the uplift that keeps an arc
   * above the sea.
   */
  export function typeYoungArcs(world: WorldState): void {
    const { elevation, magma, uplift, upliftKind } = world;
    const mask = new Uint8Array(TILE_COUNT);
    for (let i = 0; i < TILE_COUNT; i++) if (elevation[i] >= 0) mask[i] = 1;
    const order = new Int32Array(TILE_COUNT);
    let start = 0;
    for (const end of runsOf(mask, order)) {
      let hot = false;
      for (let k = start; k < end; k++) if (magma[order[k]] >= YOUNG_ARC_MAGMA) hot = true;
      if (hot && end - start <= YOUNG_ARC_TILES) {
        for (let k = start; k < end; k++) {
          upliftKind[order[k]] = UpliftKind.IslandArc;
          uplift[order[k]] = Math.max(uplift[order[k]], ARC_ISLAND_UPLIFT);
        }
      }
      start = end;
    }
  }
}
