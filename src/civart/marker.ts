/* =============================================================================
 * SimEarth 2.0 — the city marker for the zoomed-out map
 * -----------------------------------------------------------------------------
 * Below 16 px per tile a city's buildings shrink to a few pixels, so the map
 * adds this pennant at a fixed screen size (spec §3.5): a pole on a small
 * mound with a swallow-tailed flag in the tribe's colour. Pure data.
 * ========================================================================== */

namespace SE {
  export function cityMarkerArt(flag: PaletteKey): Art {
    return [
      { f: 'greyDark', d: artEllipse(11, 27.6, 7.4, 2.6) },
      { s: 'bark', w: 3, d: 'M11 27 L11 4.2' },
      { f: flag, d: 'M12.4 3.6 L28.6 3.6 L24.2 9.4 L28.6 15.2 L12.4 15.2 Z' },
      { f: 'gold', d: artCircle(11, 3.4, 1.9) },
    ];
  }
}
