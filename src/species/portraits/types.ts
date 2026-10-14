/* =============================================================================
 * SimEarth 2.0 — species portrait registry
 * -----------------------------------------------------------------------------
 * The large pictures of the species lexicon: one portrait per sub-species,
 * drawn in the same language as the map icons (flat colours, one ink outline
 * added by the renderer, light from the top left, facing right) but in a
 * 64x64 box with far more shapes, so the animal reads as a realistic study
 * rather than a symbol. See docs/oekosystem-2026-10/portraitstil.md.
 *
 * Undiscovered entries show the same data as a silhouette, so a portrait
 * needs no second drawing. Pure data: the tests load this file in Node.
 * ========================================================================== */

namespace SE {
  /** Edge length of the portrait box, in portrait units. */
  export const PORTRAIT_SIZE = 64;

  /**
   * The icon palette plus the in-between shades a detailed study needs:
   * a light and a deep tone for each material, so form can be modelled with
   * flat planes instead of gradients.
   */
  export const PORTRAIT_PALETTE = {
    ...ART_PALETTE,
    // fur, hide, skin
    furPale: '#e8c9a0',
    furDeep: '#4a2f1c',
    greyLight: '#c6c2b6',
    greyDeep: '#45443f',
    creamDark: '#d9c9a3',
    boneDark: '#bfb08a',
    skin: '#d9a27c',
    skinDark: '#a8715a',
    skinPink: '#e8a7a0',
    sandDark: '#b0955a',
    rustDark: '#7c2c24',
    orangeLight: '#f4a868',
    yellowPale: '#f8e6a0',
    // scales and wet skin
    scaleLight: '#bcd27a',
    scaleDeep: '#3e5422',
    oliveDark: '#4a5e2a',
    frogDark: '#3f8a3a',
    // water creatures
    mintDark: '#44a894',
    tealLight: '#66c2bc',
    tealDark: '#1c6464',
    fishLight: '#9ccff2',
    fishDark: '#3a7cb4',
    blueLight: '#7fb0e0',
    navyDeep: '#16304c',
    shellLight: '#e08fae',
    shellDark: '#94456a',
    chitinLight: '#e8b06a',
    chitinDark: '#9a5e24',
    coralDark: '#b8503e',
    violetLight: '#c8a0ec',
    violetDark: '#7a48aa',
    // plants and props
    leafDark: '#2c5e2a',
    barkLight: '#8a6440',
    kelpDark: '#5e4822',
    // eyes and gloss
    amber: '#e0a030',
    shine: '#ffffff',
  } as const;

  export type PortraitKey = keyof typeof PORTRAIT_PALETTE;

  /** A filled shape; `o` is its opacity. Below 0.5 it casts no outline. */
  export interface PortraitFill {
    readonly f: PortraitKey;
    readonly d: string;
    readonly o?: number;
  }
  /** A stroked line of width `w` portrait units, with round caps and joins. */
  export interface PortraitStroke {
    readonly s: PortraitKey;
    readonly w: number;
    readonly d: string;
    readonly o?: number;
  }
  export type PortraitShape = PortraitFill | PortraitStroke;

  export interface Portrait {
    /** Must equal SPECIES[c].stages[n].name — the test checks the order. */
    readonly name: string;
    /** Shapes painted in order, in a 64x64 box, facing right. */
    readonly art: readonly PortraitShape[];
  }

  /** Filled in by one file per class in src/species/portraits/. */
  export const SPECIES_PORTRAITS: Partial<Record<Life, readonly Portrait[]>> = {};
}
