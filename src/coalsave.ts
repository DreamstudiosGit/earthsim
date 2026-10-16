/* =============================================================================
 * SimEarth 2.0 — coal in the save
 * -----------------------------------------------------------------------------
 * The optional `coal` field keeps the reserve, the maturing peat, what has
 * been mined and whether the giant clubmosses are gone, so the format number
 * stays. A save without a sound field (older, or damaged there) gets an
 * estimate instead: the reserve from how long its clubmoss swamps and the
 * later swamps had existed by the tree's dates, the switch from its forests.
 * ========================================================================== */

namespace SE {
  interface SavedCoal {
    readonly reserve: number;
    readonly peat: number;
    readonly mined: number;
    readonly giantsGone: boolean;
  }

  /** Largest amount a sound field may carry, Gt. */
  const COAL_SAVE_MAX = 1e7;

  export function coalToJSON(world: WorldState): SavedCoal {
    return { reserve: world.coal, peat: world.coalPeat, mined: world.coalMined, giantsGone: world.lycopsidsGone };
  }

  function amount(v: unknown): v is number {
    return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= COAL_SAVE_MAX;
  }

  function readCoal(raw: unknown): SavedCoal | null {
    if (!raw || typeof raw !== 'object') return null;
    const { reserve, peat, mined, giantsGone } = raw as Record<string, unknown>;
    if (!amount(reserve) || !amount(peat) || !amount(mined) || typeof giantsGone !== 'boolean') return null;
    return { reserve, peat, mined, giantsGone };
  }

  /** Restore the saved coal field, or estimate it for a save without a sound one. */
  export function restoreCoal(world: WorldState, raw: unknown): void {
    const saved = readCoal(raw);
    world.coal = saved ? saved.reserve : estimateCoal(world);
    world.coalPeat = saved ? saved.peat : 0;
    world.coalMined = saved ? saved.mined : 0;
    world.lycopsidsGone = saved ? saved.giantsGone : estimateLycopsidsGone(world);
    if (saved) return;
    // An end the planet had already passed is history, not news.
    for (const e of lycopsidMilestones(world)) {
      world.evo.chronicle.push(e);
      world.evo.reported.add(e.key);
    }
  }

  /**
   * Coal a reference planet lays down in the years between the clubmosses'
   * arrival and their rivals' (giant clubmoss swamps), and since (later swamps).
   */
  export function estimateCoal(world: WorldState): number {
    const club = world.evo.developed.get('clubmosses');
    if (!club) return 0;
    const now = world.absoluteYears;
    let rivals = now;
    for (const id of ['conifers', 'broadleaf']) {
      const rec = world.evo.developed.get(id);
      if (rec) rivals = Math.min(rivals, rec.years);
    }
    const end = clamp(rivals, club.years, now);
    return (end - club.years) * COAL_EST_LYCOPSID_YEAR + (now - end) * COAL_EST_LATER_YEAR;
  }

  /** Do conifer and broadleaf forests (a forest landscape with those trees) cover the share that ends the giants? */
  export function estimateLycopsidsGone(world: WorldState): boolean {
    let land = 0;
    let forest = 0;
    for (let i = 0; i < TILE_COUNT; i++) {
      if (world.elevation[i] < 0) continue;
      land++;
      if (LANDSCAPE_LEVEL[world.landscape[i]] === 4 && (world.flora[i] & CLUBMOSS_RIVALS) !== 0) forest++;
    }
    return land > 0 && forest / land >= LYCOPSID_END_FOREST_SHARE;
  }
}
