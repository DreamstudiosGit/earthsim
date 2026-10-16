/* =============================================================================
 * SimEarth 2.0 — erosion and deposition
 * -----------------------------------------------------------------------------
 * Every slope steeper than EROSION_SLOPE_MIN hands crust to its lower
 * neighbour, more the steeper, wetter and higher it is. Mountain belts
 * erode at the full rate, so ranges without uplift wear down over geological
 * time; the plains and plateaus between them (crust without a mountain type)
 * at CRATON_EROSION of it, so the generated relief keeps its shape.
 * What a slope loses is not lost: within a belt part settles on the tile
 * below it, and the rivers carry the rest down `riverDown` to the shelf at
 * the mouth. Nothing settles on the plains, where it would pile up at the
 * foot of a range and bury it. A shelf fills only to just below sea level,
 * so deposits never make new land, and erosion never takes land below the sea. Only what overflows a full shelf leaves
 * the map, into the deep sea (docs/hoehe-spec.md §3.4).
 * ========================================================================== */

namespace SE {
  const UNSET = -2;
  /**
   * Passes the river mouths are kept before they are looked up again: the
   * river network itself is rebuilt only every RiverSystem.REBUILD_INTERVAL ticks.
   */
  const SETTLE_REFRESH = 8;

  /** How much faster wet ground erodes than bone-dry ground, 0.25..1. */
  export function erosionWetness(moisture: number): number {
    return 0.25 + 0.75 * moisture;
  }

  export class Erosion {
    private readonly delta = new Float64Array(TILE_COUNT);
    /** Crust each tile hands to the rivers this pass. */
    private readonly load = new Float64Array(TILE_COUNT);
    /** End of the river below each tile, filled lazily and kept for SETTLE_REFRESH passes. */
    private readonly mouth = new Int32Array(TILE_COUNT).fill(UNSET);
    private readonly path = new Int32Array(TILE_COUNT);
    private passes = 0;
    private shifts = -1;
    private lastTicks = -1;
    /** Crust carried past a full shelf into the deep sea, summed over all passes. */
    exported = 0;

    /** One erosion pass worth `rate` calibrated ticks (slider times `geoTimeFactor` times the ticks it stands for). */
    pass(world: WorldState, rate: number): void {
      const { elevation } = world;
      const delta = this.delta;
      this.slopes(elevation, world.moisture, world.upliftKind, rate);
      this.carry(world);

      for (let i = 0; i < TILE_COUNT; i++) {
        if (delta[i] !== 0) elevation[i] = Math.min(1, elevation[i] + delta[i]);
      }
      world.terrainDirty = true;
    }

    /**
     * What the slopes alone would do to each tile in one calibrated tick on
     * ground of the given moisture, before the rivers carry their share off:
     * the loss an active belt's uplift has to make up to hold its shape.
     */
    slopeChange(elevation: Float32Array, moisture: Float32Array, kind: Uint8Array): Float64Array {
      this.slopes(elevation, moisture, kind, 1);
      return this.delta;
    }

    /** Hand crust down every slope, filling `delta` and the river loads. */
    private slopes(e: Float32Array, moisture: Float32Array, kind: Uint8Array, rate: number): void {
      const { delta, load } = this;
      delta.fill(0);
      load.fill(0);
      const k = EROSION_RATE_BASE * rate;
      const deep = COAST_DEPTH;
      const plainSlope = EROSION_SLOPE_MIN;
      const beltSlope = EROSION_SLOPE_MIN_BELT;
      const maxShare = EROSION_MAX_SHARE;
      const altitudeRef = EROSION_ALTITUDE_REF;
      const fluvial = EROSION_FLUVIAL_SHARE;
      const floor = EROSION_LAND_FLOOR;
      const cap = SHELF_FILL_CAP;
      for (let i = 0; i < TILE_COUNT; i++) {
        // Every slope touching the deep sea is skipped below anyway.
        if (e[i] <= deep) continue;
        const east = (i + 1) % GRID_W === 0 ? i + 1 - GRID_W : i + 1;
        for (let side = 0; side < 2; side++) {
          const j = side === 0 ? east : i + GRID_W;
          if (j >= TILE_COUNT) continue;
          // Move crust down the slope between the two: more the steeper and
          // the higher it is, so ranges wear down and lowlands keep their shape.
          let hi = i;
          let lo = j;
          if (e[j] > e[i]) { hi = j; lo = i; }
          const eh = e[hi];
          const el = e[lo];
          // Submerged crust does not erode; the deep sea takes nothing from the slope.
          if (eh < 0 || el <= deep) continue;
          const s = eh - el;
          const plain = kind[hi] === UpliftKind.None;
          const minSlope = plain ? plainSlope : beltSlope;
          if (s <= minSlope) continue;
          const share = k * (plain ? CRATON_EROSION : 1) * erosionWetness(moisture[hi]) * Math.min(1, eh / altitudeRef);
          let flux = Math.min(maxShare, share) * (s - minSlope);
          // A coast gives each of its four neighbours at most a quarter of its height above the floor.
          if (el < 0) flux = Math.min(flux, (eh - floor) * 0.25);
          if (flux <= 0) continue;
          // Only a belt or the shelf takes what slides down a slope; at the
          // foot of a range it would pile up on the plain and bury the range.
          const carried = el < 0 || kind[lo] !== UpliftKind.None ? flux * fluvial : flux;
          let settled = flux - carried;
          if (el < 0) settled = Math.min(settled, Math.max(0, cap - el - delta[lo]));
          delta[lo] += settled;
          delta[hi] -= settled + carried;
          load[hi] += carried;
        }
      }
    }

    /** Hand each tile's river load to the mouth of its river, onto the shelf as far as it has room. */
    private carry(world: WorldState): void {
      const { elevation, riverDown } = world;
      const { delta, load, mouth } = this;
      // Look the rivers up again now and then, after a plate shift, and on a
      // new or loaded planet: whenever this pass does not follow the last one.
      if (this.passes++ % SETTLE_REFRESH === 0 || world.driftShifts !== this.shifts || world.ticks !== this.lastTicks + EROSION_INTERVAL) {
        mouth.fill(UNSET);
        this.shifts = world.driftShifts;
      }
      this.lastTicks = world.ticks;
      for (let i = 0; i < TILE_COUNT; i++) {
        const l = load[i];
        if (l <= 0) continue;
        const down = riverDown[i];
        if (down < 0) { delta[i] += l; continue; }
        if (mouth[down] === UNSET) this.follow(world, down);
        const end = mouth[down];
        if (elevation[end] >= 0) { delta[end] += l; continue; }
        const put = elevation[end] > COAST_DEPTH ? Math.min(l, Math.max(0, SHELF_FILL_CAP - elevation[end] - delta[end])) : 0;
        delta[end] += put;
        this.exported += l - put;
      }
    }

    /**
     * Follow the river down from `j` to its end, the sea or a land tile that
     * drains nowhere, and note that end for every tile on the way.
     */
    private follow(world: WorldState, j: number): void {
      const { elevation, riverDown } = world;
      const { mouth, path } = this;
      let n = 0;
      let k = j;
      let end: number;
      for (;;) {
        if (mouth[k] !== UNSET) { end = mouth[k]; break; }
        const down = elevation[k] < 0 ? -1 : riverDown[k];
        if (down < 0) { end = mouth[k] = k; break; }
        path[n++] = k;
        k = down;
      }
      while (n > 0) mouth[path[--n]] = end;
    }
  }
}
