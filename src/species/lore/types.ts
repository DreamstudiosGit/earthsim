/* =============================================================================
 * SimEarth 2.0 — species lore registry
 * -----------------------------------------------------------------------------
 * The texts of the species lexicon: for every sub-species of every class what
 * sets it apart, what was new in its evolution, and a vague hint for players
 * who have not found it yet. One file per class in src/species/lore/, in the
 * same order as the stages in src/species/<class>.ts.
 *
 * Texts describe the real animals. Game values (habitat, temperature, food)
 * come from LIFE at display time and are the same for all eight sub-species
 * of a class, so no text may claim a game rule of its own.
 * Pure data: the simulation and the tests load this file in Node.
 * ========================================================================== */

namespace SE {
  export interface SubspeciesLore {
    /** Must equal SPECIES[c].stages[n].name — the test checks the order. */
    readonly name: string;
    /** Two to four sentences: what sets this sub-species apart. */
    readonly about: string;
    /** One to three sentences: what was new in its evolution, and what came of it. */
    readonly evolution: string;
    /** A vague hint for the undiscovered entry, without its name. */
    readonly hint: string;
  }

  /** Filled in by one file per class in src/species/lore/. */
  export const SPECIES_LORE: Partial<Record<Life, readonly SubspeciesLore[]>> = {};
}
