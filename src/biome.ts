/* =============================================================================
 * SimEarth 2.0 — biome classification
 * -----------------------------------------------------------------------------
 * Stateless: every tile is re-classified each tick from elevation, climate,
 * plant cover and *which plants* grow there. A biome is a habitat's structure
 * — open, wooded, wet, frozen — so a forest needs trees: a moss-covered plain
 * is Offenland or Tundra, never Wald, and the taiga needs conifers. Bare land
 * reads as Rock or Desert, so a sterile planet genuinely looks sterile.
 * ========================================================================== */

namespace SE {
  export class BiomeSystem {
    /** Below this vegetation cover, land is bare ground. */
    static readonly VEGETATION_THRESHOLD = 0.12;

    static classify(
      elevation: number,
      temperature: number,
      moisture: number,
      vegetation: number,
      top: Flora,
    ): Biome {
      // --- Water: by depth and ice, never by plants ---
      if (elevation < 0) {
        if (temperature < -5) return Biome.Arctic;
        return elevation > COAST_DEPTH ? Biome.Coast : Biome.Ocean;
      }

      // --- Land ---
      if (temperature < -12) return Biome.Arctic;
      // Above the tree line nothing tall takes hold.
      if (elevation > 0.5) return Biome.Rock;

      if (vegetation < BiomeSystem.VEGETATION_THRESHOLD) {
        return moisture < 0.16 ? Biome.Desert : Biome.Rock;
      }

      const woody = FLORA[top].woody;
      if (moisture < 0.16) return Biome.Desert;
      // Standing water on flat ground makes wetland, wooded or not.
      if (moisture >= 0.70 && elevation < 0.14) return Biome.Swamp;

      if (temperature < 4) {
        // Cold: conifers make taiga; without trees it is moss and lichen.
        return woody ? Biome.Boreal : Biome.Tundra;
      }
      if (temperature < 14) {
        if (moisture >= 0.42 && woody) return top === Flora.Conifers ? Biome.Boreal : Biome.Forest;
        return moisture >= 0.18 ? Biome.Grass : Biome.Desert;
      }
      if (temperature >= 21 && moisture >= 0.50) return woody ? Biome.Jungle : Biome.Grass;
      if (moisture >= 0.38) return woody ? Biome.Forest : Biome.Grass;
      return moisture >= 0.22 ? Biome.Grass : Biome.Desert;
    }

    static step(world: WorldState): void {
      const { elevation, temperature, moisture, vegetation, floraTop, biome } = world;
      for (let i = 0; i < TILE_COUNT; i++) {
        biome[i] = BiomeSystem.classify(
          elevation[i], temperature[i], moisture[i], vegetation[i], floraTop[i] as Flora,
        );
      }
    }
  }
}
