/* =============================================================================
 * SimEarth 2.0 — city and people names in the save
 * -----------------------------------------------------------------------------
 * The optional `civ` field of a save keeps each city's name and people and
 * each people's name and colour, so a load does not rename the world
 * (docs/zivilisation-spec.md §2.11). Settlers, peace, rest and epidemics stay
 * in memory only. A missing or unsound field is ignored as a whole: the
 * records are then derived from the grid, as for an older save.
 * ========================================================================== */

namespace SE {
  interface SavedCity { readonly t: number; readonly n: string; readonly p: number }
  interface SavedTribe { readonly id: number; readonly n: string; readonly c: number; readonly parent: number }
  interface SavedCiv { readonly cities: SavedCity[]; readonly tribes: SavedTribe[] }

  /** Longest name a save may carry. */
  const NAME_MAX = 24;

  /** The records for the save, or undefined while they are not derived yet. */
  export function civToJSON(world: WorldState): SavedCiv | undefined {
    const civ = world.civ;
    if (!civ.synced) return undefined;
    return {
      cities: civ.cities.map((c) => ({ t: c.tile, n: c.name, p: c.tribe })),
      tribes: civ.tribes.map((t) => ({ id: t.id, n: t.name, c: t.color, parent: t.parent })),
    };
  }

  function isInt(v: unknown, lo: number, hi: number): v is number {
    return typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi;
  }

  function isName(v: unknown): v is string {
    return typeof v === 'string' && v.length > 0 && v.length <= NAME_MAX;
  }

  /** The saved records if every entry is sound for this grid, else null. */
  function readCiv(world: WorldState, raw: unknown): SavedCiv | null {
    if (!raw || typeof raw !== 'object') return null;
    const { cities, tribes } = raw as Record<string, unknown>;
    if (!Array.isArray(cities) || !Array.isArray(tribes) || tribes.length > TRIBE_MAX || cities.length > TILE_COUNT) return null;
    const ids = new Set<number>();
    const colours = new Set<number>();
    for (const t of tribes) {
      if (!t || typeof t !== 'object') return null;
      const { id, n, c, parent } = t as Record<string, unknown>;
      if (!isInt(id, 1, Number.MAX_SAFE_INTEGER) || ids.has(id) || !isName(n)) return null;
      if (!isInt(c, 0, TRIBE_MAX - 1) || colours.has(c) || !isInt(parent, -1, Number.MAX_SAFE_INTEGER)) return null;
      ids.add(id);
      colours.add(c);
    }
    const tiles = new Set<number>();
    for (const e of cities) {
      if (!e || typeof e !== 'object') return null;
      const { t, n, p } = e as Record<string, unknown>;
      if (!isInt(t, 0, TILE_COUNT - 1) || tiles.has(t) || world.tech[t] === Tech.None) return null;
      if (!isName(n) || !isInt(p, 1, Number.MAX_SAFE_INTEGER) || !ids.has(p)) return null;
      tiles.add(t);
    }
    return { cities: cities as SavedCity[], tribes: tribes as SavedTribe[] };
  }

  /**
   * Records from a save's `civ` field, after the world itself is loaded. True
   * if the field was sound; otherwise nothing changes and the next sync
   * derives the records from the grid. City tiles the field does not name are
   * adopted as usual.
   */
  export function restoreCiv(world: WorldState, params: ModelParams, raw: unknown): boolean {
    const saved = readCiv(world, raw);
    if (!saved) return false;
    const civ = world.civ;
    civ.clear();
    civ.nextId = 1 + Math.max(0, ...saved.tribes.map((t) => t.id));
    for (const t of saved.tribes) {
      civ.tribes.push({
        id: t.id, color: t.c, name: t.n, parent: t.parent, capital: -1, founded: world.ticks, landShort: false, shortUntil: 0,
      });
    }
    for (const e of saved.cities) {
      const c = addCityRecord(world, params, e.t, e.n);
      c.tribe = e.p;
      c.settleAfter = loadedSettleAfter(world, e.t);
    }
    civ.driftSeen = world.driftShifts;
    civ.calmUntil = world.ticks + CONFLICT_LOAD_CALM;
    civ.synced = true;
    reconcileCities(world, params);
    updateTribes(world);
    return true;
  }
}
