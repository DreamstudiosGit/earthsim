/* =============================================================================
 * SimEarth 2.0 — the giant clubmosses
 * -----------------------------------------------------------------------------
 * Tree-sized clubmosses (Lepidodendron, Sigillaria) made the coal swamps of the
 * Carboniferous. Their spores drift over the whole planet, so while the giants
 * live they reach every warm wetland, not only the one they were founded in.
 *
 * Conifers and broadleaf trees outgrow them: on a tile where those grow the
 * clubmosses die back, except in a wetland, their last niche, where they stay
 * without leading the tile. Once conifers and broadleaf trees lead a tenth of
 * the land the giants are gone for good. The group lives on as the small,
 * herbaceous clubmosses of today: no longer woody, low cover, not drawn on
 * the map, still listed in the Examine window.
 * ========================================================================== */

namespace SE {
  const CLUBMOSS = floraBit(Flora.Clubmosses);
  /** Seed-plant trees that outgrow the clubmosses. Seed ferns and cycads shared the coal swamps with them. */
  export const CLUBMOSS_RIVALS = floraBit(Flora.Conifers) | floraBit(Flora.Broadleaf);
  const HERB_WOODY_MASK = WOODY_FLORA_MASK & ~CLUBMOSS;
  const ERA_KEY = 'lycopsids:gone';

  /**
   * Factor on the clubmosses' suitability of tile i: 1 without rivals there,
   * else their wet niche or next to nothing. The rivals never finish them
   * off: while few are left, river banks count as a niche as well.
   */
  export function clubmossCompetition(world: WorldState, i: number): number {
    if ((world.flora[i] & CLUBMOSS_RIVALS) === 0) return 1;
    if (FloraSystem.isWetland(world, i)) return CLUBMOSS_NICHE;
    const refuge = world.floraCounts[Flora.Clubmosses] < CLUBMOSS_REFUGE_TILES &&
      (world.riverLevel[i] > 0 || world.riparian[i] > 0);
    return refuge ? CLUBMOSS_NICHE : CLUBMOSS_OUTCOMPETED;
  }

  /** Do giant clubmosses grow on tile i without rivals? */
  export function isLycopsidSwamp(world: WorldState, i: number): boolean {
    return !world.lycopsidsGone && (world.flora[i] & (CLUBMOSS | CLUBMOSS_RIVALS)) === CLUBMOSS;
  }

  /** The densest cover group g sustains on this planet: the clubmosses stay low once the giants are gone. */
  export function floraStature(world: WorldState, g: Flora): number {
    return g === Flora.Clubmosses && world.lycopsidsGone ? CLUBMOSS_HERB_STATURE : FLORA[g].stature;
  }

  /** Groups that form woodland on this planet: the clubmosses only while the giants live. */
  export function woodyFloraMask(world: WorldState): number {
    return world.lycopsidsGone ? HERB_WOODY_MASK : WOODY_FLORA_MASK;
  }

  /** Plant groups the map draws: no clubmosses once only the small ones are left. */
  export function mapFloraMask(world: WorldState): number {
    return world.lycopsidsGone ? ~CLUBMOSS : ~0;
  }

  /** Spores on the wind: while the giants live, a suitable tile anywhere on the planet may catch them. */
  export function clubmossSpores(world: WorldState, flora: FloraSystem, present: number): void {
    if (world.lycopsidsGone || (present & CLUBMOSS) === 0) return;
    const rng = world.rng;
    for (let n = 0; n < CLUBMOSS_SPORE_SAMPLES; n++) {
      const j = rng.int(TILE_COUNT);
      if ((world.flora[j] & CLUBMOSS) !== 0 || !rng.chance(CLUBMOSS_SPORE_CHANCE)) continue;
      if (flora.suit(world, Flora.Clubmosses, j) < CLUBMOSS_SPORE_SUIT) continue;
      world.flora[j] |= CLUBMOSS;
      if (world.vegetation[j] < 0.02) world.vegetation[j] = 0.02;
    }
  }

  /** Share of the land tiles that conifers or broadleaf trees lead. */
  export function rivalForestShare(world: WorldState): number {
    let land = 0;
    let led = 0;
    for (let i = 0; i < TILE_COUNT; i++) {
      if (world.elevation[i] < 0) continue;
      land++;
      const top = world.floraTop[i];
      if (top === Flora.Conifers || top === Flora.Broadleaf) led++;
    }
    return land > 0 ? led / land : 0;
  }

  /** End the giants' era for good once the rivals' forests lead enough of the land. */
  export function updateLycopsidEra(world: WorldState, present: number): void {
    if (world.lycopsidsGone || (present & CLUBMOSS_RIVALS) === 0) return;
    if (rivalForestShare(world) >= LYCOPSID_END_FOREST_SHARE) world.lycopsidsGone = true;
  }

  /** The chronicle entry for the end of the giants, once. */
  export function lycopsidMilestones(world: WorldState): ChronicleEntry[] {
    if (!world.lycopsidsGone || world.evo.chronicle.some((e) => e.key === ERA_KEY)) return [];
    return [{
      key: ERA_KEY, kind: 'milestone', title: 'Die Schuppenbäume verschwinden',
      text: 'Nadel- und Laubwälder haben die baumhohen Bärlappe verdrängt. Ihre Verwandten überleben als kleine, krautige Bärlappe in feuchten Nischen.',
      change: 'Bärlappe wachsen nur noch als niedrige Kräuter in Feuchtgebieten. Neue Sümpfe bilden viel weniger Kohle.',
      icon: evoIcon('clubmosses'), tick: world.ticks, years: world.absoluteYears, major: false,
    }];
  }
}
