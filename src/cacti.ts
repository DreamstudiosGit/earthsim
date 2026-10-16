/* =============================================================================
 * SimEarth 2.0 — cacti, the flowering plants' desert form
 * -----------------------------------------------------------------------------
 * Cacti are no group and no step of the tree: they are how the flowering
 * plants look on desert and semi-desert tiles once the group has existed for
 * CACTUS_DELAY_YEARS. From then on their water-storing stems let the
 * flowering plants into drier desert ground than before (a sparse stand;
 * the hyper-arid core stays bare), the map draws a cactus on some of those
 * tiles and the Examine window names them. Before, the deserts show no
 * flowering plants at all. Derived from the tree's dates, so nothing is saved.
 * ========================================================================== */

namespace SE {
  const ERA_KEY = 'cacti:first';
  const FLOWERING = floraBit(Flora.Flowering);

  /** Have the flowering plants existed long enough for cacti? */
  export function cactiArrived(world: WorldState): boolean {
    const rec = world.evo.developed.get(FLORA[Flora.Flowering].id);
    return rec !== undefined && world.absoluteYears - rec.years >= CACTUS_DELAY_YEARS;
  }

  /** Landscapes where the flowering plants grow as cacti. */
  export function isCactusLandscape(l: Landscape): boolean {
    return l === Landscape.Desert || l === Landscape.Semidesert;
  }

  /**
   * The wetness factor of the flowering plants' suitability on a desert
   * tile, where cacti carry them below their usual dry limit: up to
   * CACTUS_SUIT, 0 at CACTUS_WET_MIN and below.
   */
  export function cactusWetFactor(wetness: number): number {
    const dry = FLORA[Flora.Flowering].wet[0];
    return CACTUS_SUIT * clamp((wetness - CACTUS_WET_MIN) / (dry - CACTUS_WET_MIN), 0, 1);
  }

  /** Do the flowering plants on land tile i grow as cacti? */
  export function growsAsCacti(world: WorldState, i: number, arrived = cactiArrived(world)): boolean {
    return arrived && (world.flora[i] & FLOWERING) !== 0 && isCactusLandscape(world.landscape[i]);
  }

  /** The chronicle entry for the first cacti, once they stand on a desert tile. */
  export function cactusMilestones(world: WorldState): ChronicleEntry[] {
    if (world.evo.chronicle.some((e) => e.key === ERA_KEY) || !cactiArrived(world)) return [];
    let found = false;
    for (let i = 0; i < TILE_COUNT && !found; i++) found = world.elevation[i] >= 0 && growsAsCacti(world, i, true);
    if (!found) return [];
    return [{
      key: ERA_KEY, kind: 'milestone', title: 'In den Wüsten wachsen die ersten Kakteen.',
      text: 'Kakteen sind Blütenpflanzen, die Wasser in dicken, grünen Stämmen speichern und statt Blättern Dornen tragen. Damit kommen sie mit wenig Regen aus.',
      change: 'Blütenpflanzen besiedeln jetzt auch trockene Wüsten und Halbwüsten. Dort stehen vereinzelt Kakteen.',
      icon: evoIcon('flowering'), tick: world.ticks, years: world.absoluteYears, major: false,
    }];
  }
}
