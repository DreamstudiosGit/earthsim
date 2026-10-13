/* =============================================================================
 * SimEarth 2.0 — geosphere: continental drift, erosion, magma and disasters
 * ========================================================================== */

namespace SE {
  /**
   * Continental drift is modelled as a small number of rigid horizontal plates
   * that shift by whole tiles once their accumulated offset trips, which avoids
   * the numerical smearing a fractional advection would cause. Life, cities and
   * moisture ride along with the crust.
   */
  export class GeoSystem {
    private readonly offsets = new Float32Array(PLATE_COUNT);
    private readonly velocities = new Float32Array(PLATE_COUNT);
    private readonly scratch = new Float32Array(TILE_COUNT);
    private readonly rowF32 = new Float32Array(GRID_W);
    private readonly rowU8 = new Uint8Array(GRID_W);
    /** One row of the per-tile, per-class life matrices. */
    private readonly rowLifeF32 = new Float32Array(GRID_W * LIFE_COUNT);
    private readonly rowLifeU8 = new Uint8Array(GRID_W * LIFE_COUNT);

    constructor() {
      // Alternating directions produce convergent and divergent margins.
      const pattern = [1.0, -0.75, 0.55, -1.0];
      for (let p = 0; p < PLATE_COUNT; p++) {
        this.velocities[p] = pattern[p % pattern.length] * DRIFT_SPEED_BASE;
      }
    }

    /**
     * Forget the accumulated plate offsets. A new planet must not inherit the
     * previous one's half-finished plate step — it decided when the first
     * shift of the new world would happen.
     */
    resetDrift(): void {
      this.offsets.fill(0);
    }

    /** Accumulated sub-tile plate offsets, for the save file. */
    get driftOffsets(): number[] {
      return Array.from(this.offsets);
    }

    set driftOffsets(values: number[]) {
      for (let p = 0; p < PLATE_COUNT; p++) {
        const v = Number(values[p]);
        this.offsets[p] = Number.isFinite(v) ? clamp(v, -1, 1) : 0;
      }
    }

    /** Signed drift velocity of the plate owning a row, for the Drift map. */
    plateVelocity(y: number): number {
      const rows = GRID_H / PLATE_COUNT;
      return this.velocities[Math.min(PLATE_COUNT - 1, Math.floor(y / rows))];
    }

    step(world: WorldState, params: ModelParams): void {
      this.drift(world, mul(params.geo.drift));
      this.erode(world, mul(params.geo.erosion));
      this.uplift(world, mul(params.geo.coreHeat));
      this.updateMagma(world, mul(params.geo.coreHeat));
    }

    /** Advance each plate, rolling its rows by one tile when it trips. */
    private drift(world: WorldState, rate: number): void {
      if (rate <= 0) return;
      const rowsPerPlate = GRID_H / PLATE_COUNT;

      for (let p = 0; p < PLATE_COUNT; p++) {
        this.offsets[p] += this.velocities[p] * rate;
        let shift = 0;
        if (this.offsets[p] >= 1) {
          shift = 1;
          this.offsets[p] -= 1;
        } else if (this.offsets[p] <= -1) {
          shift = -1;
          this.offsets[p] += 1;
        }
        if (shift === 0) continue;

        const yStart = Math.floor(p * rowsPerPlate);
        const yEnd = Math.floor((p + 1) * rowsPerPlate);
        for (let y = yStart; y < yEnd; y++) {
          this.rollF32(world.elevation, y, shift);
          this.rollF32(world.moisture, y, shift);
          this.rollF32(world.vegetation, y, shift);
          this.rollU16(world.flora, y, shift);
          this.rollF32(world.cityPop, y, shift);
          this.rollF32(world.magma, y, shift);
          // The orogenic belt belongs to the crust, not to the latitude: a
          // range has to travel with the continent carrying it.
          this.rollF32(world.uplift, y, shift);
          this.rollU8(world.tech, y, shift);
          this.rollLife(world, y, shift);
        }
        world.terrainDirty = true;
      }
    }

    /**
     * Rotate one row of the life matrices. Each tile owns a contiguous block of
     * LIFE_COUNT entries, so the whole community rides the plate together
     * instead of species being smeared across neighbouring tiles.
     */
    private rollLife(world: WorldState, y: number, shift: number): void {
      const base = y * GRID_W * LIFE_COUNT;
      const den = this.rowLifeF32;
      const stg = this.rowLifeU8;
      den.set(world.lifeDensity.subarray(base, base + den.length));
      stg.set(world.lifeStage.subarray(base, base + stg.length));

      for (let x = 0; x < GRID_W; x++) {
        const from = wrapX(x - shift) * LIFE_COUNT;
        const to = base + x * LIFE_COUNT;
        for (let c = 0; c < LIFE_COUNT; c++) {
          world.lifeDensity[to + c] = den[from + c];
          world.lifeStage[to + c] = stg[from + c];
        }
      }
    }

    /** Rotate one row of a float field by `shift` tiles, wrapping in X. */
    private rollF32(data: Float32Array, y: number, shift: number): void {
      const base = y * GRID_W;
      const buf = this.rowF32;
      for (let x = 0; x < GRID_W; x++) buf[x] = data[base + x];
      for (let x = 0; x < GRID_W; x++) data[base + x] = buf[wrapX(x - shift)];
    }

    private readonly rowU16 = new Uint16Array(GRID_W);

    /** Rotate one row of the flora bitmask, wrapping in X. */
    private rollU16(data: Uint16Array, y: number, shift: number): void {
      const base = y * GRID_W;
      const buf = this.rowU16;
      for (let x = 0; x < GRID_W; x++) buf[x] = data[base + x];
      for (let x = 0; x < GRID_W; x++) data[base + x] = buf[wrapX(x - shift)];
    }

    /** Rotate one row of a byte field by `shift` tiles, wrapping in X. */
    private rollU8(data: Uint8Array, y: number, shift: number): void {
      const base = y * GRID_W;
      const buf = this.rowU8;
      for (let x = 0; x < GRID_W; x++) buf[x] = data[base + x];
      for (let x = 0; x < GRID_W; x++) data[base + x] = buf[wrapX(x - shift)];
    }

    /**
     * Relax land toward the local mean elevation. Wet tiles erode faster, so
     * rainy highlands wear down while deserts keep their relief.
     */
    private erode(world: WorldState, rate: number): void {
      if (rate <= 0) return;
      const { elevation, moisture } = world;
      const scratch = this.scratch;
      scratch.set(elevation);

      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          const i = idx(x, y);
          if (scratch[i] <= 0) continue; // submerged crust is left alone
          const k = EROSION_RATE_BASE * rate * (0.25 + 0.75 * moisture[i]);
          elevation[i] = scratch[i] + (neighborMean(scratch, x, y) - scratch[i]) * k;
        }
      }
      world.terrainDirty = true;
    }

    /**
     * Tectonic uplift along the belts `TerrainGenerator.orogeny` laid down.
     *
     * Erosion alone is a one-way process: left to itself it planes every range
     * flat over geological time, and the rivers lose their headwaters with it.
     * A crest instead settles where uplift and erosion balance, which is what
     * real mountains do. Capped just below 1 so a belt under a summit that has
     * already maxed out cannot keep pressing against the ceiling.
     */
    private uplift(world: WorldState, coreHeat: number): void {
      if (coreHeat <= 0) return;
      const { elevation, uplift } = world;
      const rate = UPLIFT_RATE_BASE * coreHeat;

      for (let i = 0; i < TILE_COUNT; i++) {
        const u = uplift[i];
        if (u <= 0 || elevation[i] <= 0) continue;
        elevation[i] = Math.min(1, elevation[i] + u * rate);
      }
    }

    /** Mantle upwelling drifts slowly and is what volcanoes erupt out of. */
    private updateMagma(world: WorldState, coreHeat: number): void {
      const magma = world.magma;
      // A very slow diffusion keeps the belts coherent while letting them move.
      if (world.ticks % 8 !== 0) return;
      this.scratch.set(magma);
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          const i = idx(x, y);
          const target = neighborMean(this.scratch, x, y);
          magma[i] = clamp(lerp(this.scratch[i], target, 0.05) * (0.5 + 0.5 * coreHeat), 0, 1);
        }
      }
    }
  }

  /* -------------------------------------------------------------------------- */

  /**
   * The eight disasters of the original. Each one both changes the world and
   * leaves a marker so the Edit window's Events layer can draw it.
   */
  export class EventSystem {
    /** How many ticks an event marker stays visible. */
    private static readonly TTL = 12;
    /** Plant groups a fire removes outright. */
    static readonly WOODY_MASK = (() => {
      let m = 0;
      for (let g = 1; g < FLORA_COUNT; g++) if (FLORA[g as Flora].woody) m |= 1 << g;
      return m;
    })();

    /** Tick down the visible markers, and roll for spontaneous disasters. */
    step(world: WorldState, params: ModelParams): void {
      const ttl = world.eventTtl;
      for (let i = 0; i < TILE_COUNT; i++) {
        if (ttl[i] > 0) ttl[i]--;
      }

      // Volcanism follows the magma belts; meteors fall anywhere. These rates
      // are per tick, and a fast planet runs thousands of ticks a minute — at
      // anything higher the climate never stops ringing from volcanic winters.
      const volcanoChance = 0.0004 * mul(params.geo.volcanoes);
      if (world.rng.chance(volcanoChance)) {
        const i = this.pickByMagma(world);
        this.trigger(world, EventKind.Volcano, i % GRID_W, Math.floor(i / GRID_W));
      }

      const meteorChance = 0.00018 * mul(params.geo.meteors);
      if (world.rng.chance(meteorChance)) {
        this.trigger(
          world, EventKind.Meteor,
          world.rng.int(GRID_W), world.rng.int(GRID_H),
        );
      }

      // Plagues stalk dense civilizations; medicine holds them off. The
      // threshold is a share of the planet, not a raw population sum, which on
      // a finer grid would be reached by a far smaller civilization.
      if (world.totalCityPop > scaledCount(8)) {
        const plagueChance = 0.0025 * (1 - params.civAlloc.medicine * 0.8);
        if (world.rng.chance(plagueChance)) {
          const i = this.pickCity(world);
          if (i >= 0) this.trigger(world, EventKind.Plague, i % GRID_W, Math.floor(i / GRID_W));
        }
      }
    }

    /** Weighted pick favouring hot mantle, so volcanoes cluster into arcs. */
    private pickByMagma(world: WorldState): number {
      let best = world.rng.int(TILE_COUNT);
      for (let tries = 0; tries < 12; tries++) {
        const cand = world.rng.int(TILE_COUNT);
        if (world.magma[cand] > world.magma[best]) best = cand;
      }
      return best;
    }

    private pickCity(world: WorldState): number {
      for (let tries = 0; tries < 200; tries++) {
        const cand = world.rng.int(TILE_COUNT);
        if (world.tech[cand] !== Tech.None) return cand;
      }
      return -1;
    }

    /** Apply a disaster at a tile. */
    trigger(world: WorldState, kind: EventKind, cx: number, cy: number): void {
      switch (kind) {
        case EventKind.Volcano: this.volcano(world, cx, cy); break;
        case EventKind.Meteor: this.meteor(world, cx, cy); break;
        case EventKind.Earthquake: this.earthquake(world, cx, cy); break;
        case EventKind.TidalWave: this.tidalWave(world, cx, cy); break;
        case EventKind.Hurricane: this.hurricane(world, cx, cy); break;
        case EventKind.Fire: this.fire(world, cx, cy); break;
        case EventKind.AtomicBomb: this.atomicBomb(world, cx, cy); break;
        case EventKind.Plague: this.plague(world, cx, cy); break;
      }
    }

    /**
     * Run a callback over a square brush, wrapping in X, stopping at the poles.
     *
     * Every radius below is in tiles and so doubled with the grid: a hurricane
     * covers a stretch of coast, not a fixed number of cells.
     */
    private brush(
      cx: number, cy: number, radius: number,
      fn: (tile: number, distance: number) => void,
    ): void {
      for (let dy = -radius; dy <= radius; dy++) {
        const y = cy + dy;
        if (y < 0 || y >= GRID_H) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          const x = wrapX(cx + dx);
          fn(idx(x, y), Math.max(Math.abs(dx), Math.abs(dy)));
        }
      }
    }

    /** Stamp the marker the Events layer draws. */
    private mark(world: WorldState, i: number, kind: EventKind): void {
      world.eventKind[i] = kind;
      world.eventTtl[i] = EventSystem.TTL;
    }

    /**
     * Strip plant cover. The biome is derived from vegetation every tick, so
     * writing the biome label alone (as fire once did) was undone on the very
     * next tick — damage has to land on the plants themselves.
     */
    private scorch(world: WorldState, i: number, keep: number, clearMask: number): void {
      world.vegetation[i] *= keep;
      world.flora[i] &= ~clearMask;
      if (world.vegetation[i] < 0.002) world.vegetation[i] = 0;
    }

    /** A disaster hits every species on the tile, not just the dominant one. */
    private killLife(world: WorldState, i: number, amount: number): void {
      const base = i * LIFE_COUNT;
      for (let c = 1; c < LIFE_COUNT; c++) {
        const d = world.lifeDensity[base + c];
        if (d <= 0) continue;
        const next = d - amount;
        if (next < 0.02) {
          world.lifeDensity[base + c] = 0;
          world.lifeStage[base + c] = 0;
        } else {
          world.lifeDensity[base + c] = next;
        }
      }
    }

    private volcano(world: WorldState, cx: number, cy: number): void {
      this.brush(cx, cy, 4, (i, d) => {
        const lift = d <= 1 ? 0.45 : d <= 2 ? 0.22 : 0.08;
        world.elevation[i] = clamp(world.elevation[i] + lift, -1, 1);
        if (d <= 2) {
          this.scorch(world, i, 0, 0xffff);
          this.killLife(world, i, 1);
          world.tech[i] = Tech.None;
          world.cityPop[i] = 0;
        }
        this.mark(world, i, EventKind.Volcano);
      });
      world.co2 = clamp(world.co2 + 25, 0, 5000);
      world.dust = clamp(world.dust + 0.05, 0, 1);
      world.terrainDirty = true;
    }

    private meteor(world: WorldState, cx: number, cy: number): void {
      this.brush(cx, cy, 6, (i, d) => {
        if (d <= 2) {
          world.elevation[i] = clamp(world.elevation[i] - 0.25, -1, 1);
          this.scorch(world, i, 0, 0xffff);
        } else {
          this.scorch(world, i, 0.5, 0);
        }
        this.killLife(world, i, d <= 2 ? 1 : 0.5);
        if (d <= 2) { world.tech[i] = Tech.None; world.cityPop[i] = 0; }
        this.mark(world, i, EventKind.Meteor);
      });
      // The impact winter is the real killer, not the crater.
      world.dust = clamp(world.dust + 0.18, 0, 1);
      world.co2 = clamp(world.co2 + 40, 0, 5000);
      world.terrainDirty = true;
    }

    private earthquake(world: WorldState, cx: number, cy: number): void {
      this.brush(cx, cy, 6, (i, d) => {
        const jolt = (world.rng.next() - 0.5) * (d <= 1 ? 0.2 : 0.1);
        world.elevation[i] = clamp(world.elevation[i] + jolt, -1, 1);
        if (world.tech[i] !== Tech.None) {
          world.cityPop[i] = Math.max(0, world.cityPop[i] - 0.4);
          if (world.cityPop[i] <= 0.05) world.tech[i] = Tech.None;
        }
        this.mark(world, i, EventKind.Earthquake);
      });
      world.terrainDirty = true;
    }

    private tidalWave(world: WorldState, cx: number, cy: number): void {
      this.brush(cx, cy, 8, (i, d) => {
        // Only low-lying coastal land is scoured.
        if (world.elevation[i] > 0 && world.elevation[i] < 0.18) {
          this.killLife(world, i, 0.8);
          world.moisture[i] = clamp(world.moisture[i] + 0.5, 0, 1);
          if (d <= 4) { world.tech[i] = Tech.None; world.cityPop[i] = 0; }
        }
        this.mark(world, i, EventKind.TidalWave);
      });
    }

    private hurricane(world: WorldState, cx: number, cy: number): void {
      this.brush(cx, cy, 8, (i, d) => {
        world.moisture[i] = clamp(world.moisture[i] + 0.45, 0, 1);
        if (d <= 4) this.killLife(world, i, 0.25);
        this.mark(world, i, EventKind.Hurricane);
      });
    }

    private fire(world: WorldState, cx: number, cy: number): void {
      this.brush(cx, cy, 6, (i) => {
        // Anything with enough plant cover to carry a fire burns: the cover
        // drops to a fifth and the trees go, to return from the unburnt edge.
        if (!world.isWater(i) && world.vegetation[i] >= BiomeSystem.VEGETATION_THRESHOLD) {
          world.co2 = clamp(world.co2 + world.vegetation[i] * 0.8, 0, 5000);
          this.scorch(world, i, 0.2, EventSystem.WOODY_MASK);
          this.killLife(world, i, 0.7);
        }
        this.mark(world, i, EventKind.Fire);
      });
      world.dust = clamp(world.dust + 0.02, 0, 1);
    }

    private atomicBomb(world: WorldState, cx: number, cy: number): void {
      this.brush(cx, cy, 6, (i, d) => {
        this.killLife(world, i, d <= 2 ? 1 : 0.6);
        world.tech[i] = Tech.None;
        world.cityPop[i] = 0;
        this.scorch(world, i, d <= 2 ? 0 : 0.4, d <= 2 ? 0xffff : 0);
        this.mark(world, i, EventKind.AtomicBomb);
      });
      world.dust = clamp(world.dust + 0.15, 0, 1);
    }

    private plague(world: WorldState, cx: number, cy: number): void {
      this.brush(cx, cy, 8, (i) => {
        if (world.tech[i] !== Tech.None) {
          world.cityPop[i] = Math.max(0, world.cityPop[i] - 0.5);
          if (world.cityPop[i] <= 0.05) world.tech[i] = Tech.None;
        }
        this.killLife(world, i, 0.35);
        this.mark(world, i, EventKind.Plague);
      });
    }
  }
}
