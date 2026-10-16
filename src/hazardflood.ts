/* =============================================================================
 * SimEarth 2.0 — floods: water running up the land, standing, receding
 * -----------------------------------------------------------------------------
 * docs/ereignisse-spec.md §3.4. Where a tidal wave or a storm surge touches
 * the coast, the water runs up: a breadth-first search only through the
 * tiles it has just flooded, one land step a tick, losing FLOOD_RUNUP_LOSS
 * of height a step from the second land tile on. The water stands, recedes
 * inland first and leaves mud (hazardwater.ts starts the runs).
 * ========================================================================== */

namespace SE {
  /** Water running up the land, then standing, then receding. */
  export interface FloodRun {
    /** Tiles the water reached last step (at first the coast water) and the height left on each. */
    front: number[];
    height: number[];
    /** Land steps taken. */
    steps: number;
    /** Tiles under this run's water, and the land step that reached each. */
    tiles: number[];
    reach: number[];
    /** Ticks the water still stands once it has stopped climbing; -1 while it recedes. */
    hold: number;
  }

  /** Scars a flood washes over with mud; any other (a vent, ruins, a crater) stays. */
  const MUD_OVER: readonly number[] = [ScarKind.None, ScarKind.Mud, ScarKind.Windthrow, ScarKind.Burnt, ScarKind.Scorched, ScarKind.Ash];

  /** The neighbour of tile i in direction k (HAZARD_NX / HAZARD_NY), or -1 past a pole. */
  export function hazardNeighbour(i: number, k: number): number {
    const y = ((i / GRID_W) | 0) + HAZARD_NY[k];
    return y < 0 || y >= GRID_H ? -1 : idx(wrapX((i % GRID_W) + HAZARD_NX[k]), y);
  }

  /** Water over a land tile `depth` deep: life drowns, soft plants wash away, a city loses people. */
  function flood(world: WorldState, i: number, depth: number): void {
    const hz = world.hazards;
    const t = Math.min(1, depth / FLOOD_DEPTH_FULL);
    hazardKillLife(world, i, FLOOD_LIFE_LOSS * (FLOOD_LIFE_SHALLOW + (1 - FLOOD_LIFE_SHALLOW) * t));
    world.flora[i] &= WOODY_FLORA_MASK;
    world.vegetation[i] *= FLOOD_VEGETATION_KEEP;
    world.moisture[i] = Math.min(1, world.moisture[i] + FLOOD_MOISTURE);
    hazardHitCity(world, i, FLOOD_CITY_LOSS + (1 - FLOOD_CITY_LOSS) * t);
    hz.tile[i] = HazardTile.Flood;
    hz.level[i] = clamp(Math.round(depth * 1000), 1, 255);
    hz.revision++;
  }

  /** The water has run off: the tile falls back to raw ground under a layer of mud. */
  function recede(world: WorldState, i: number): void {
    const hz = world.hazards;
    if (hz.tile[i] !== HazardTile.Flood) return;
    hz.tile[i] = HazardTile.None;
    hz.level[i] = 0;
    // The scar first: it heals once the landscape climbs back to where it stood before the flood.
    if (MUD_OVER.includes(hz.scar[i])) setScar(world, i, ScarKind.Mud);
    SuccessionSystem.clear(world, i);
    hz.revision++;
  }

  /** One land step: every tile flooded last step floods its land neighbours lower than the height left. */
  function climb(world: WorldState, run: FloodRun): void {
    const e = world.elevation;
    const hz = world.hazards;
    const reached = new Map<number, number>();
    if (run.steps < FLOOD_RUNUP_STEPS) {
      for (let f = 0; f < run.front.length; f++) {
        // The first land tile takes the wave at full height.
        const left = run.height[f] - (run.steps === 0 ? 0 : FLOOD_RUNUP_LOSS);
        if (left <= 0) continue;
        for (let k = 0; k < 8; k++) {
          const j = hazardNeighbour(run.front[f], k);
          if (j < 0 || e[j] < 0 || e[j] >= left) continue;
          if (hz.tile[j] !== HazardTile.None && hz.tile[j] !== HazardTile.Wet) continue;
          if ((reached.get(j) ?? 0) < left) reached.set(j, left);
        }
      }
    }
    run.steps++;
    run.front = [];
    run.height = [];
    for (const [j, left] of reached) {
      flood(world, j, left - e[j]);
      run.tiles.push(j);
      run.reach.push(run.steps);
      run.front.push(j);
      run.height.push(left);
    }
  }

  /** Climb, stand, or recede inland first (the far half, then the rest); false once the run is over. */
  function stepRun(world: WorldState, run: FloodRun): boolean {
    if (run.front.length > 0) {
      climb(world, run);
      return run.front.length > 0 || run.tiles.length > 0;
    }
    if (run.hold > 0) {
      run.hold--;
      return true;
    }
    let far = 0;
    for (const k of run.reach) far = Math.max(far, k);
    const all = run.hold < 0;
    let n = 0;
    for (let m = 0; m < run.tiles.length; m++) {
      if (all || run.reach[m] > far / 2) {
        recede(world, run.tiles[m]);
      } else {
        run.tiles[n] = run.tiles[m];
        run.reach[n++] = run.reach[m];
      }
    }
    run.tiles.length = n;
    run.reach.length = n;
    run.hold = -1;
    return n > 0;
  }

  /**
   * Start water running up the land from the coast water tiles `coast`,
   * each bringing the wave height in `height`. It takes its first land step
   * at the next hazardStepFloods. Used by the tidal wave and the storm surge.
   */
  export function hazardRunUp(runs: FloodRun[], coast: number[], height: number[]): void {
    if (coast.length > 0) runs.push({ front: coast, height, steps: 0, tiles: [], reach: [], hold: FLOOD_HOLD_TICKS });
  }

  /** One tick of every run; finished runs drop out. */
  export function hazardStepFloods(world: WorldState, runs: FloodRun[]): void {
    let n = 0;
    for (const run of runs) if (stepRun(world, run)) runs[n++] = run;
    runs.length = n;
  }

  /** All the water off the land at once: the aftermath straight away. */
  export function hazardDrainFloods(world: WorldState, runs: FloodRun[]): void {
    for (const run of runs) for (const i of run.tiles) recede(world, i);
    runs.length = 0;
  }
}
