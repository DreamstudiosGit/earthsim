/* =============================================================================
 * SimEarth 2.0 — habitat biomes
 * -----------------------------------------------------------------------------
 * The 11 habitats the animals live in are derived from each land tile's
 * landscape (src/succession.ts) and so inherit its coherence and hysteresis:
 * a forest needs trees, the taiga conifers, mosses make tundra, bare land
 * reads as Rock or Desert (docs/biomes-spec.md §3.3). Water is classified by
 * depth and sea ice, never by plants.
 * ========================================================================== */

namespace SE {
  export class BiomeSystem {
    /** Below this vegetation cover, land is bare ground. */
    static readonly VEGETATION_THRESHOLD = BARE_COVER;

    /** Habitat of a water tile: sea ice, shelf or open ocean. */
    static waterHabitat(elevation: number, temperature: number): Biome {
      if (temperature < -5) return Biome.Arctic;
      return elevation > COAST_DEPTH ? Biome.Coast : Biome.Ocean;
    }

    /**
     * Advance the landscapes and derive every tile's habitat. Call with
     * `advance` false after a load or a new planet: that starts land without
     * a landscape at its target and refreshes the derived fields, but lets
     * no time pass. Succession advances at most once per tick either way.
     */
    static step(world: WorldState, advance = true): void {
      SuccessionSystem.step(world, advance);
      const { elevation, temperature, biome, landscape } = world;
      const zones = world.landscapeZone;
      for (let i = 0; i < TILE_COUNT; i++) {
        const e = elevation[i];
        biome[i] = e < 0
          ? BiomeSystem.waterHabitat(e, temperature[i])
          : landscapeHabitat(landscape[i] as Landscape, zones[i]);
      }
    }
  }
}
