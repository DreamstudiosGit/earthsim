/* =============================================================================
 * SimEarth 2.0 — settler figures on water, Bronze Age to Nanotech
 * -----------------------------------------------------------------------------
 * How a people crosses water after the raft (spec §3.6): a dugout canoe, a
 * sailing ship, a steamship and a container freighter. 32 × 32 art, facing
 * right, the tribe's pennant at the stern or on the mast. Style:
 * docs/oekosystem-2026-10/grafikstil.md. Pure data, Node-safe.
 * ========================================================================== */

namespace SE {
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });
  const box = (x0: number, y0: number, x1: number, y1: number): string => `M${x0} ${y0} L${x1} ${y0} L${x1} ${y1} L${x0} ${y1} Z`;

  /** Bronze Age: a dugout canoe with one paddler, the pennant on a stick at the stern. */
  export function dugoutArt(flag: PaletteKey): Art {
    return [
      { s: 'bark', w: 1.6, d: 'M7 22 L7 9' },
      { f: flag, d: 'M6.6 9 L1.8 11.2 L6.6 13.6 Z' },
      { f: 'fur', d: 'M13 13.6 C14 12.6 17 12.6 18 13.6 L18.4 22 L12.6 22 Z' },
      { f: 'tan', d: artCircle(15.6, 9.8, 2.8) },
      { f: 'furDark', d: 'M12.8 9.6 C12.8 7.4 14.4 6.6 16 6.8 C17.4 7 18 7.8 18 8.6 C16.2 8.2 14.5 8.6 12.8 9.6 Z' },
      line('tan', 2.2, 'M17.2 15 L21.4 17.4'),
      line('bark', 1.6, 'M20.6 12.6 L24.6 27'),
      { f: 'bark', d: artEllipse(24.4, 26, 1.5, 2.6) },
      { f: 'bark', d: 'M2.6 21.4 L29.6 20.6 C29 24.8 25 27 16 27 C8 27 4 25.4 2.6 21.4 Z' },
      { f: 'furDark', d: 'M4.4 21.6 L27.8 20.9 C27 22.6 24 23.2 16 23.2 C9 23.2 5.4 22.8 4.4 21.6 Z' },
    ];
  }

  /** Iron Age: a sailing ship with one square sail, the pennant at the masthead. */
  export function sailingShipArt(flag: PaletteKey): Art {
    return [
      line('bark', 1.8, 'M16 21 L16 3.4'),
      { f: flag, d: 'M15.6 3.4 L9.8 5.4 L15.6 7.4 Z' },
      { f: 'cream', d: 'M9 8.6 L23 8.6 L24 18.4 L8 18.4 Z' },
      { f: 'bone', d: 'M16 8.6 L23 8.6 L24 18.4 L16 18.4 Z', o: 0.6 },
      line('bark', 1.4, 'M8.4 8.6 L23.6 8.6'),
      { f: 'bark', d: 'M2.4 20.4 L29.6 20.4 L26.4 27 L6 27 Z' },
      { f: 'furDark', d: 'M4.2 22.6 L28.2 22.6 L27.6 24 L4.8 24 Z' },
    ];
  }

  /** Industrial Age: a steamship with a funnel and a puff of smoke, the pennant at the stern. */
  export function steamshipArt(flag: PaletteKey): Art {
    return [
      { s: 'greyDark', w: 1.4, d: 'M6.6 20 L6.6 9' },
      { f: flag, d: 'M6.2 9 L1.8 11 L6.2 13 Z' },
      { f: 'grey', d: artCircle(11.6, 5.2, 2.2) },
      { f: 'grey', d: artCircle(8.4, 3.6, 1.7) },
      { f: 'rust', d: box(14, 7.4, 18.2, 15) },
      { f: 'black', d: box(14, 7.4, 18.2, 9.4) },
      { f: 'white', d: box(9, 15, 23, 20) },
      { f: 'navy', d: artCircle(12, 17.4, 0.9) },
      { f: 'navy', d: artCircle(15.6, 17.4, 0.9) },
      { f: 'navy', d: artCircle(19.2, 17.4, 0.9) },
      { f: 'black', d: 'M2 20 L30 20 L27 26.6 L5 26.6 Z' },
      line('red', 1.6, 'M4.6 24.6 L27.6 24.6'),
    ];
  }

  /** Atomic Age on: a container freighter, the bridge aft, the pennant on its mast. */
  export function freighterArt(flag: PaletteKey): Art {
    return [
      { s: 'greyDark', w: 1.4, d: 'M7.6 11 L7.6 3.8' },
      { f: flag, d: 'M7.2 3.8 L2.2 5.8 L7.2 7.8 Z' },
      { f: 'white', d: box(3.6, 11, 8.6, 19.6) },
      line('navy', 1.2, 'M4.4 13.4 L7.8 13.4'),
      { f: 'rust', d: box(9.6, 14.2, 14.6, 19.6) },
      { f: 'teal', d: box(14.6, 14.2, 19.6, 19.6) },
      { f: 'sand', d: box(19.6, 14.2, 24.6, 19.6) },
      { f: 'grey', d: box(14.6, 9.4, 19.6, 14.2) },
      { f: 'navy', d: 'M2 19.6 L30 19.6 L28 26.6 L4.6 26.6 Z' },
      line('rust', 1.6, 'M4 24.8 L28.6 24.8'),
    ];
  }
}
