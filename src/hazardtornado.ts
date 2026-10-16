/* =============================================================================
 * SimEarth 2.0 — tornadoes spun off a hurricane at landfall
 * -----------------------------------------------------------------------------
 * docs/ereignisse-spec.md §3.4 (stage 2). Making landfall at strength
 * TORNADO_MIN_STRENGTH or more, a hurricane sets down one or two funnels
 * (by hash) near its eye. Each runs straight inland one tile a tick for
 * TORNADO_RUN_MIN..TORNADO_RUN_MAX tiles, roughly the way the storm came
 * ashore, and lifts over water or at the end of its run. On every tile it
 * crosses it throws trees, kills some life and damages cities. Tornadoes
 * belong to their hurricane's hazard (StormTrack.tornadoes in hazardwater.ts).
 * ========================================================================== */

namespace SE {
  export interface Tornado {
    /** Tiles it has crossed, the current one last. */
    readonly path: number[];
    /** Direction of travel, an index into HAZARD_NX / HAZARD_NY. */
    readonly dir: number;
    /** Tiles it still runs; at 0 it lifts on the next tick. */
    left: number;
  }

  /** HAZARD_NX / HAZARD_NY indices in clockwise order, from north. */
  const CLOCKWISE: readonly number[] = [1, 2, 4, 7, 6, 5, 3, 0];

  /** The direction index of a step (dx, dy), each −1..1; -1 for no step. */
  function directionOf(dx: number, dy: number): number {
    for (let k = 0; k < 8; k++) if (HAZARD_NX[k] === dx && HAZARD_NY[k] === dy) return k;
    return -1;
  }

  /** The funnel tears across tile i. */
  function strike(world: WorldState, i: number): void {
    hazardKillLife(world, i, TORNADO_LIFE_LOSS);
    hazardHitCity(world, i, TORNADO_CITY_LOSS);
    if (LANDSCAPE_LEVEL[world.landscape[i]] >= TORNADO_WINDTHROW_LEVEL && world.hazards.scar[i] === ScarKind.None) {
      setScar(world, i, ScarKind.Windthrow);
      world.vegetation[i] *= TORNADO_VEGETATION_KEEP;
    }
  }

  /**
   * Landfall: the storm stepped from sea tile `from` onto land tile `eye`.
   * One or two funnels touch down on land within TORNADO_SPAWN_RING of the
   * eye and head inland, veering at most one direction step from the storm.
   */
  export function hazardSpawnTornadoes(world: WorldState, h: Hazard, list: Tornado[], from: number, eye: number): void {
    const seed = world.seed ^ h.id;
    let dx = (eye % GRID_W) - (from % GRID_W);
    if (dx > GRID_W / 2) dx -= GRID_W;
    else if (dx < -GRID_W / 2) dx += GRID_W;
    const heading = directionOf(Math.sign(dx), Math.sign(((eye / GRID_W) | 0) - ((from / GRID_W) | 0)));
    if (heading < 0) return;
    const land: number[] = [];
    const ex = eye % GRID_W;
    const ey = (eye / GRID_W) | 0;
    for (let oy = -TORNADO_SPAWN_RING; oy <= TORNADO_SPAWN_RING; oy++) {
      const y = ey + oy;
      if (y < 0 || y >= GRID_H) continue;
      for (let ox = -TORNADO_SPAWN_RING; ox <= TORNADO_SPAWN_RING; ox++) {
        const i = idx(wrapX(ex + ox), y);
        if ((ox !== 0 || oy !== 0) && world.elevation[i] >= 0) land.push(i);
      }
    }
    if (land.length === 0) land.push(eye);
    const count = hazardRoll(seed, eye, 0x70a1) < TORNADO_SECOND_CHANCE ? 2 : 1;
    for (let n = 0; n < count && land.length > 0; n++) {
      const at = land.splice(Math.floor(hazardRoll(seed, eye, 0x70a2 + n) * land.length), 1)[0];
      const veer = Math.floor(hazardRoll(seed, at, 0x70a3) * 3) - 1;
      const dir = CLOCKWISE[(CLOCKWISE.indexOf(heading) + veer + 8) % 8];
      const run = TORNADO_RUN_MIN + Math.floor(hazardRoll(seed, at, 0x70a4) * (TORNADO_RUN_MAX - TORNADO_RUN_MIN + 1));
      list.push({ path: [at], dir, left: run });
      strike(world, at);
    }
  }

  /** One tick of every funnel: a tile on, or lifting at the end of its run or over water. */
  export function hazardStepTornadoes(world: WorldState, list: Tornado[]): void {
    let n = 0;
    for (const t of list) {
      if (t.left <= 0) continue;
      const next = hazardNeighbour(t.path[t.path.length - 1], t.dir);
      if (next < 0 || world.elevation[next] < 0) continue;
      t.path.push(next);
      t.left--;
      strike(world, next);
      list[n++] = t;
    }
    list.length = n;
  }
}
