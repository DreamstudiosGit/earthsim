/* =============================================================================
 * SimEarth 2.0 — hazard state
 * -----------------------------------------------------------------------------
 * What the running disasters and their aftermath leave in the world
 * (docs/ereignisse-spec.md §2.2): per tile the scar (the ground state that
 * heals through succession) and what is happening there now (lava, fire,
 * flood), plus the list of hazards still spreading. Pure data; the rules
 * live in hazards.ts and the hazard*.ts files.
 * ========================================================================== */

namespace SE {
  export type HazardCause = 'player' | 'natural' | 'civ' | 'chain';

  /** A volcano's lava flow. */
  export interface LavaFlow {
    /** Lava tiles still to place. */
    budget: number;
    /** Tiles the flow advances from next tick. */
    front: number[];
    /** Every tile under this flow's lava, vent included, for cooling. */
    tiles: number[];
    /** New land the flow has made from shallow water. */
    land: number;
    /** Where lava met water or the vent lies under the sea: tile and tick, for the steam. */
    steam: { tile: number; tick: number }[];
    /** Ticks an underwater eruption keeps steaming. */
    steamLeft: number;
  }

  export interface Hazard {
    readonly id: number;
    readonly kind: EventKind;
    readonly x: number;
    readonly y: number;
    readonly cause: HazardCause;
    readonly startTick: number;
    /** Ticks of spread so far. */
    age: number;
    done: boolean;
    /** Each hazard may set off one other (spec §3.9). */
    chainUsed: boolean;
    /** How strong it is against a full one (1); a chained tidal wave from a quake is weaker. */
    strength?: number;
    lava?: LavaFlow;
  }

  export class HazardState {
    readonly scar = new Uint8Array(TILE_COUNT);         // ScarKind
    /** Ticks since the scar settled; stays at 255. */
    readonly scarAge = new Uint8Array(TILE_COUNT);
    /** Landscape succession level the tile had before the disaster; the scar heals no further than that. */
    readonly scarFrom = new Uint8Array(TILE_COUNT);
    /** The scar that takes the tile over, at the same age, once this one ends (fallout under ash). */
    readonly scarNext = new Uint8Array(TILE_COUNT);
    readonly tile = new Uint8Array(TILE_COUNT);         // HazardTile
    /** Strength, cooling stage, depth or ticks left, by `tile`. */
    readonly level = new Uint8Array(TILE_COUNT);
    readonly list: Hazard[] = [];
    nextId = 1;
    /** Bumped whenever a tile's scar or hazard state changes, so views know to recompose. */
    revision = 0;
    /** Bumped when the whole state is replaced (new planet, load): staged omens belong to the old one. */
    generation = 0;

    clear(): void {
      this.scar.fill(0);
      this.scarAge.fill(0);
      this.scarFrom.fill(0);
      this.scarNext.fill(0);
      this.tile.fill(0);
      this.level.fill(0);
      this.list.length = 0;
      this.nextId = 1;
      this.revision++;
      this.generation++;
    }

    copyFrom(o: HazardState): void {
      this.scar.set(o.scar);
      this.scarAge.set(o.scarAge);
      this.scarFrom.set(o.scarFrom);
      this.scarNext.set(o.scarNext);
      this.tile.set(o.tile);
      this.level.set(o.level);
      this.list.length = 0;
      for (const h of o.list) this.list.push(structuredClone(h));
      this.nextId = o.nextId;
      this.revision++;
      this.generation++;
    }

    hazard(id: number): Hazard | undefined {
      return this.list.find((h) => h.id === id);
    }
  }
}
