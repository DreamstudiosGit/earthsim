/* =============================================================================
 * SimEarth 2.0 — civilization
 * -----------------------------------------------------------------------------
 * Any of the sentience-capable classes can wake up, so a planet may just as
 * easily end up run by intelligent dinosaurs, molluscs or carniferns as by
 * mammals. Cities burn energy drawn from the four sources on the Civilization
 * Model Control Panel, and a fossil-heavy mix warms the planet that hosts it.
 * ========================================================================== */

namespace SE {
  export class CivSystem {
    /**
     * Density a sentience-capable class needs on a tile before it can wake up.
     *
     * Deliberately well below one: a tile is a community, so its leading class
     * shares the carrying capacity with everything else living there and an
     * equilibrium around a third of the tile already means "these animals run
     * this place". The old 0.75 assumed a tile had a single occupant, and once
     * species began coexisting no tile on the planet ever reached it — no city
     * site was ever found and sentience simply never happened.
     */
    private static readonly SENTIENCE_DENSITY = 0.35;
    /**
     * Planet-wide coverage it needs as well. Kept low on purpose: land classes
     * partition the continents between them, so even a dominant one rarely
     * holds more than a few percent of the whole planet.
     */
    private static readonly SENTIENCE_COVERAGE = 0.02;

    /** Set when a civilization advances or is founded, for the message bar. */
    lastNotice = '';
    /** What kind of thing `lastNotice` reports, for the chronicle. */
    lastKind: 'sentience' | 'tech' | 'war' | '' = '';
    /** Tech level reached when `lastKind` is 'tech'. */
    lastTech = Tech.None;

    step(world: WorldState, params: ModelParams, atmo: AtmosphereSystem): void {
      this.lastNotice = '';
      this.lastKind = '';
      this.emergeSentience(world, params);
      this.growCities(world, params);
      this.advanceTech(world, params);
      this.consumeEnergy(world, params, atmo);
      this.warfare(world, params);
    }

    /* --------------------------------------------------------- sentience -- */

    /**
     * Look for a class that is both widespread and locally dense, then let it
     * cross the threshold into tool use and found its first settlement.
     */
    private emergeSentience(world: WorldState, params: ModelParams): void {
      if (world.sentientClass !== Life.None) return;
      // A mind needs an oxygen-rich atmosphere — but planets settle anywhere
      // between 16% and 20%, and at the old 17 a world at the low end could
      // never produce a civilization however well its mammals were doing.
      if (world.o2 < 14) return;

      const chance = 0.0009 * mul(params.bio.evolutionRate);
      if (!world.rng.chance(chance)) return;

      // Candidates: sentience-capable classes with enough of the planet.
      let best: Life = Life.None;
      let bestBiomass = 0;
      for (let c = 1; c < LIFE_COUNT; c++) {
        const cls = c as Life;
        if (!LIFE[cls].sentient) continue;
        if (world.coverage(cls) < CivSystem.SENTIENCE_COVERAGE) continue;
        if (world.lifeBiomass[cls] > bestBiomass) {
          bestBiomass = world.lifeBiomass[cls];
          best = cls;
        }
      }
      if (best === Life.None) return;

      const buildSite = this.bestCitySite(world, params, best);
      if (buildSite < 0) return; // nowhere worth settling yet — try again later

      world.sentientClass = best;
      world.tech[buildSite] = Tech.Stone;
      world.cityPop[buildSite] = 0.2;
      this.lastNotice = `${LIFE[best].name} entwickeln Intelligenz und gründen eine erste Siedlung.`;
      this.lastKind = 'sentience';
    }

    /**
     * The most habitable spot this species could settle. Sea dwellers build on
     * the shore, land dwellers settle where they stand.
     *
     * Picking merely the *nearest* land instead put whale cities on polar ice
     * with a site quality of 0.004, and the first settlement died on the tick
     * it was founded — every time the sentient species happened to be marine.
     */
    private bestCitySite(
      world: WorldState, params: ModelParams, species: Life,
    ): number {
      let best = -1;
      let bestScore = 0.25; // below this a settlement cannot feed itself

      for (let i = 0; i < TILE_COUNT; i++) {
        // It has to be the tile's leading species, not merely present on it.
        if (world.dominantLife[i] !== species) continue;
        if (world.density(i, species) < CivSystem.SENTIENCE_DENSITY) continue;

        if (!world.isWater(i)) {
          const q = this.siteQuality(world, i, params);
          if (q > bestScore) { bestScore = q; best = i; }
          continue;
        }

        const x = i % GRID_W;
        const y = Math.floor(i / GRID_W);
        for (let dy = -2; dy <= 2; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= GRID_H) continue;
          for (let dx = -2; dx <= 2; dx++) {
            const j = idx(wrapX(x + dx), ny);
            if (world.isWater(j)) continue;
            const q = this.siteQuality(world, j, params);
            if (q > bestScore) { bestScore = q; best = j; }
          }
        }
      }
      return best;
    }

    /* ------------------------------------------------------------ cities -- */

    /** How well a tile can feed a city. */
    private siteQuality(world: WorldState, i: number, params: ModelParams): number {
      if (world.isWater(i)) return 0;
      const b = world.biome[i];
      // Farmland beats jungle; ice and bare rock support almost nobody.
      const base =
        b === Biome.Grass ? 1.0 :
        b === Biome.Forest ? 0.85 :
        b === Biome.Swamp ? 0.6 :
        b === Biome.Jungle ? 0.6 :
        b === Biome.Boreal ? 0.55 :
        b === Biome.Desert ? 0.2 :
        b === Biome.Rock ? 0.15 : 0.05;

      const temp = world.temperature[i];
      const climate = clamp(1 - Math.abs(temp - 16) / 34, 0, 1);
      const farming = 0.5 + mul(params.civAlloc.agriculture) * 0.5;
      return base * climate * clamp(farming, 0, 1.5);
    }

    private growCities(world: WorldState, params: ModelParams): void {
      const health = 0.6 + mul(params.civAlloc.medicine) * 0.4;
      const rng = world.rng;

      for (let i = 0; i < TILE_COUNT; i++) {
        if (world.tech[i] === Tech.None) continue;

        const capacity = this.siteQuality(world, i, params) * clamp(health, 0, 1.6);
        const pop = world.cityPop[i];

        if (capacity > 0.05) {
          // Culture makes a city a place people stay: Art/Media nudges growth.
          const culture = 0.9 + 0.1 * mul(params.civAlloc.artMedia);
          world.cityPop[i] = Math.min(1, pop + pop * 0.05 * culture * (1 - pop / capacity));
        } else {
          world.cityPop[i] = pop - pop * 0.05;
        }

        if (world.cityPop[i] < 0.03) {
          world.cityPop[i] = 0;
          world.tech[i] = Tech.None;
        }
      }

      // Settlers push outward from crowded cities.
      const attempts = Math.floor(TILE_COUNT * 0.05);
      for (let n = 0; n < attempts; n++) {
        const i = rng.int(TILE_COUNT);
        if (world.tech[i] === Tech.None || world.cityPop[i] < 0.55) continue;

        const x = i % GRID_W;
        const y = Math.floor(i / GRID_W);
        const dir = rng.int(4);
        const j = idx(
          dir === 0 ? wrapX(x - 1) : dir === 1 ? wrapX(x + 1) : x,
          dir === 2 ? clampY(y - 1) : dir === 3 ? clampY(y + 1) : y,
        );
        if (j === i || world.tech[j] !== Tech.None) continue;
        if (this.siteQuality(world, j, params) < 0.15) continue;

        world.tech[j] = world.tech[i];
        world.cityPop[j] = 0.08;
      }
    }

    /** Science pushes settlements up the seven technology levels. */
    private advanceTech(world: WorldState, params: ModelParams): void {
      const rate = 0.0009 * mul(params.civAlloc.science);
      const rng = world.rng;
      let advancedTo = Tech.None;

      for (let i = 0; i < TILE_COUNT; i++) {
        const t = world.tech[i];
        if (t === Tech.None || t >= Tech.Nanotech) continue;
        if (world.cityPop[i] < 0.5) continue;
        if (!rng.chance(rate * world.cityPop[i])) continue;

        world.tech[i] = t + 1;
        if (t + 1 > advancedTo) advancedTo = t + 1;
      }

      // Only announce a level the planet has never reached before.
      if (advancedTo !== Tech.None && world.techCounts[advancedTo] === 0) {
        this.lastNotice = `Die Zivilisation erreicht das ${TECH_NAMES[advancedTo]}.`;
        if (advancedTo === Tech.Bronze || advancedTo === Tech.Iron || advancedTo === Tech.Stone) {
          this.lastNotice = `Die Zivilisation erreicht die ${TECH_NAMES[advancedTo]}.`;
        }
        this.lastKind = 'tech';
        this.lastTech = advancedTo;
      }
    }

    /**
     * Cities burn energy. Where that energy comes from decides how much carbon
     * and ash the civilization dumps into its own sky.
     */
    private consumeEnergy(
      world: WorldState, params: ModelParams, atmo: AtmosphereSystem,
    ): void {
      let total = 0;
      for (let i = 0; i < TILE_COUNT; i++) {
        const t = world.tech[i];
        if (t !== Tech.None) total += TECH_ENERGY[t] * world.cityPop[i];
      }
      if (total <= 0) return;

      // The atmosphere belongs to the planet, not to the grid. A civilization
      // covering a given fraction of the world has to emit the same however
      // finely that world is cut up, so the raw tile sum is restated on the
      // grid these coefficients were tuned against — see REFERENCE_TILE_COUNT
      // for what happens when it is not.
      const demand = total / GRID_REFINEMENT;

      const mix = params.energyMix();
      // Fossil fuel is the dirty option; nuclear is clean but leaves fallout
      // risk; solar and hydro cost the atmosphere nothing.
      //
      // Carbon is deliberately the dominant term and soot only a trace. With a
      // heavier soot coefficient an industrial civilization dimmed its own sky
      // faster than it warmed it, so the planet *cooled* as CO2 climbed — which
      // both wiped the biosphere within a few hundred ticks and told the player
      // exactly the wrong story about what their factories were doing.
      atmo.co2Delta += CHEM_RATE * demand * mix.fossilFuel * 0.008;
      atmo.dustDelta += demand * mix.fossilFuel * 0.000008;
      // Combustion does consume oxygen, but a heavier coefficient let industry
      // outpace the entire biosphere's photosynthesis and strip the air to 7%,
      // which is not what burning carbon does to a planet.
      atmo.o2Delta -= CHEM_RATE * demand * mix.fossilFuel * 0.000015;

      // Every city also breathes.
      atmo.co2Delta += CHEM_RATE * (world.totalCityPop / TILE_COUNT) * 0.4;
    }

    /** At or below this aggression a civilization never starts a nuclear war. */
    static readonly PEACEFUL = 0.2;

    /** How warlike the energy budget makes a civilization; see warfare(). */
    static aggression(params: ModelParams): number {
      return mul(params.civAlloc.military) -
        mul(params.civAlloc.philosophy) * 0.6 - mul(params.civAlloc.artMedia) * 0.2;
    }

    /**
     * A heavily militarised, poorly philosophised civilization eventually uses
     * the bomb on itself. This is the original's nuclear-winter failure mode.
     */
    private warfare(world: WorldState, params: ModelParams): void {
      let atomicCities = 0;
      for (let t = Tech.Atomic; t <= Tech.Nanotech; t++) atomicCities += world.techCounts[t];
      // Enough of the planet to hold rival powers — a share, not a headcount,
      // or a finer grid reaches the threshold at a quarter of the settlement.
      if (atomicCities < scaledCount(4)) return;

      const aggression = CivSystem.aggression(params);
      if (aggression <= CivSystem.PEACEFUL) return;

      const chance = 0.00035 * aggression;
      if (!world.rng.chance(chance)) return;

      for (let tries = 0; tries < 200; tries++) {
        const i = world.rng.int(TILE_COUNT);
        if (world.tech[i] < Tech.Atomic) continue;
        this.lastNotice = 'Warnung: Atomschlag! Ein Krieg zerstört Städte und Leben.';
        this.lastKind = 'war';
        SE.civEventSink?.(EventKind.AtomicBomb, i % GRID_W, Math.floor(i / GRID_W));
        return;
      }
    }
  }

  /**
   * Set by the app so civilization can raise disasters without importing the
   * event system directly (which would tangle the dependency order).
   */
  export let civEventSink: ((kind: EventKind, x: number, y: number) => void) | null = null;
}
