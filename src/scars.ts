/* =============================================================================
 * SimEarth 2.0 — scars: the ground disasters leave behind
 * -----------------------------------------------------------------------------
 * A scar is a ground state on one land tile (docs/ereignisse-spec.md §4):
 * basalt after lava, burnt earth after a fire, mud after a flood. While it is
 * young it holds its tile at the disturbed stage — the disturbance is simply
 * applied again every tick, through the succession's own `scour` and `clear`
 * — and for SCAR_MIN_TICKS nothing grows back. Then succession takes the tile
 * up again as usual, and the scar ends once the landscape has climbed past
 * it, or back to the level it had before (a burnt steppe never grows a
 * forest). Its own ground is drawn only while the landscape is still below
 * `showBelow`; its objects (stumps, driftwood) can outlast that.
 * ========================================================================== */

namespace SE {
  interface ScarRule {
    /** Landscape the young scar holds its tile at, or -1 to leave the landscape alone. */
    readonly hold: Landscape | -1;
    /** Fresh rock: the young scar keeps soil and plants off the tile. */
    readonly bare: boolean;
    /** The scar's own ground shows while the landscape's succession level is below this. */
    readonly showBelow: number;
    /** Once past SCAR_MIN_TICKS the scar ends when the landscape reaches this level, or its level from before. */
    readonly endLevel: number;
    /** Extra ticks over which a scar that never reaches endLevel ends tile by tile (hashed). */
    readonly fade: number;
  }

  const NEVER = 99;
  /** Age (saturated) at which every scar but a vent has weathered away. */
  const WEATHERED = 255;

  /** Indexed by ScarKind. */
  const RULES: readonly ScarRule[] = [
    { hold: -1, bare: false, showBelow: 0, endLevel: 0, fade: 0 },                      // None
    { hold: Landscape.Rock, bare: true, showBelow: 1, endLevel: 1, fade: 0 },          // Basalt
    { hold: Landscape.Rock, bare: true, showBelow: 1, endLevel: NEVER, fade: 0 },      // Vent
    { hold: Landscape.Barren, bare: false, showBelow: 1, endLevel: 3, fade: 0 },       // Burnt
    { hold: Landscape.Barren, bare: false, showBelow: 1, endLevel: 2, fade: 0 },       // Scorched
    { hold: Landscape.Rock, bare: true, showBelow: 1, endLevel: NEVER, fade: 0 },      // Crater
    { hold: Landscape.Barren, bare: false, showBelow: 1, endLevel: 2, fade: 0 },       // Mud
    { hold: -1, bare: false, showBelow: 0, endLevel: NEVER, fade: 4 },                 // Windthrow
    { hold: -1, bare: false, showBelow: 0, endLevel: 2, fade: 0 },                     // FissureH
    { hold: -1, bare: false, showBelow: 0, endLevel: 2, fade: 0 },                     // FissureV
    { hold: -1, bare: false, showBelow: 0, endLevel: 2, fade: 0 },                     // FissureD1
    { hold: -1, bare: false, showBelow: 0, endLevel: 2, fade: 0 },                     // FissureD2
    { hold: Landscape.Rock, bare: false, showBelow: 1, endLevel: 1, fade: 0 },         // Scree
    { hold: Landscape.Barren, bare: false, showBelow: 0, endLevel: 3, fade: 0 },       // Ruins
    { hold: Landscape.Barren, bare: false, showBelow: 1, endLevel: 2, fade: 0 },       // Ash
    { hold: -1, bare: false, showBelow: 0, endLevel: NEVER, fade: 50 },                // Fallout
  ];

  /**
   * Lay a fresh scar on a land tile; its age starts once the hazard on the
   * tile is over. `from` is the succession level the tile had before the
   * disaster: callers that clear the tile first pass the level they read.
   */
  export function setScar(world: WorldState, i: number, kind: ScarKind, from = LANDSCAPE_LEVEL[world.landscape[i]]): void {
    if (world.elevation[i] < 0) return;
    const hz = world.hazards;
    // Fallout stays in its zone under whatever comes next, unless fresh rock buries it.
    const fallout = hz.scar[i] === ScarKind.Fallout || hz.scarNext[i] === ScarKind.Fallout;
    hz.scar[i] = kind;
    hz.scarAge[i] = 0;
    hz.scarFrom[i] = from;
    hz.scarNext[i] = fallout && kind !== ScarKind.Fallout && !RULES[kind].bare ? ScarKind.Fallout : ScarKind.None;
    hz.revision++;
  }

  /** Lay a scar that waits under the tile's present one and takes over when it ends; on a bare tile it lies at once. */
  export function setScarUnder(world: WorldState, i: number, kind: ScarKind): void {
    const s = world.hazards.scar[i];
    if (s === ScarKind.None) setScar(world, i, kind);
    else if (s !== kind && world.elevation[i] >= 0) world.hazards.scarNext[i] = kind;
  }

  /** True while the scar's own ground replaces the landscape's. */
  export function scarShowsGround(world: WorldState, i: number): boolean {
    const s = world.hazards.scar[i];
    return s !== ScarKind.None && LANDSCAPE_LEVEL[world.landscape[i]] < RULES[s].showBelow;
  }

  const TILE_LABELS: readonly string[] = ['', 'Brennt', 'Glühende Lava', 'Überflutet', 'Durchnässt', 'Trümmer'];

  /** What a disaster left on a tile, for the Examine window: "Verbrannte Erde, wächst nach"; empty for none. */
  export function hazardLabel(world: WorldState, i: number): string {
    const hz = world.hazards;
    if (hz.tile[i] !== HazardTile.None) return TILE_LABELS[hz.tile[i]];
    const s = hz.scar[i] as ScarKind;
    if (s === ScarKind.None || s === ScarKind.Vent) return SCAR_NAMES[s];
    return `${SCAR_NAMES[s]}, ${scarYoung(world, i) ? 'frisch' : s === ScarKind.Fallout ? 'klingt ab' : 'wächst nach'}`;
  }

  /** True while the scar still stops succession on its tile. */
  export function scarYoung(world: WorldState, i: number): boolean {
    const s = world.hazards.scar[i];
    return s !== ScarKind.None && world.hazards.scarAge[i] < SCAR_MIN_TICKS[s];
  }

  /** One tick of every scar: age, hold the young ones, end the healed ones. */
  export function stepScars(world: WorldState): void {
    const hz = world.hazards;
    const { scar, scarAge } = hz;
    for (let i = 0; i < TILE_COUNT; i++) {
      const s = scar[i];
      if (s === ScarKind.None) continue;
      if (world.elevation[i] < 0) {
        scar[i] = ScarKind.None;
        hz.scarNext[i] = ScarKind.None;
        hz.revision++;
        continue;
      }
      // A tile still under lava, flood or fire ages only once that is over; wet ground and rubble do not stop it.
      const t = hz.tile[i];
      if (t === HazardTile.Lava || t === HazardTile.Flood || t === HazardTile.Burning) continue;
      const age = scarAge[i];
      if (age < WEATHERED) scarAge[i] = age + 1;
      const rule = RULES[s];
      // A new city on the ruins clears them away.
      const rebuilt = s === ScarKind.Ruins && world.tech[i] !== Tech.None;
      if (age < SCAR_MIN_TICKS[s] && !rebuilt) {
        if (rule.hold === Landscape.Rock) {
          if (rule.bare) {
            SuccessionSystem.scour(world, i);
            world.vegetation[i] = 0;
            world.flora[i] = 0;
          } else {
            world.soil[i] = Math.min(world.soil[i], Math.floor(SOIL_EARTH * 255) - 1);
            SuccessionSystem.clear(world, i);
          }
        } else if (rule.hold === Landscape.Barren) {
          SuccessionSystem.clear(world, i);
        }
        continue;
      }
      if (s === ScarKind.Vent) continue;
      const healed = LANDSCAPE_LEVEL[world.landscape[i]] >= (rule.endLevel === NEVER ? NEVER : Math.min(rule.endLevel, hz.scarFrom[i]));
      const faded = rule.fade > 0 && age >= SCAR_MIN_TICKS[s] + hazardRoll(world.seed, i, s) * rule.fade;
      if (healed || faded || rebuilt || age >= WEATHERED) {
        // The waiting scar keeps the age, so a zone laid at once heals together.
        scar[i] = hz.scarNext[i];
        hz.scarNext[i] = ScarKind.None;
        if (scar[i] === ScarKind.None) scarAge[i] = 0;
        hz.revision++;
      }
    }
  }
}
