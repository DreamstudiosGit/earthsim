/* =============================================================================
 * SimEarth 2.0 — plant art: Meeresalgen (marineAlgae)
 * -----------------------------------------------------------------------------
 * Seaweed seen through the water: wine-red forked fronds next to wavy
 * sea-green blades, anchored on grey stones. Strong colours, because the map
 * draws the set at 45 % opacity. Specialist: pink coralline balls under an
 * ice edge.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;

  /**
   * Maps frond coordinates to the box: `u` units sideways from the stalk,
   * `v` the fraction of the height `h` above the foot (x, y). The tip shifts
   * by `lean`, the middle bows out by `bend`: a frond swaying in the swell.
   */
  function framer(x: number, y: number, h: number, lean: number, bend: number): (u: number, v: number) => string {
    return (u, v) => `${r(x + u + lean * v + bend * 4 * v * (1 - v))} ${r(y - v * h)}`;
  }

  /** A ruffled sea-lettuce blade, `w` its half-width; the right half is shaded. */
  function blade(x: number, y: number, h: number, lean: number, w: number, bend = 0): ArtShape[] {
    const p = framer(x, y, h, lean, bend);
    const right =
      `C${p(1.2, 0.08)} ${p(w * 1.2, 0.14)} ${p(w * 1.05, 0.34)} ` +
      `C${p(w * 0.95, 0.46)} ${p(w * 0.72, 0.5)} ${p(w * 0.86, 0.63)} ` +
      `C${p(w * 1.02, 0.78)} ${p(w * 0.7, 0.94)} ${p(0.2, 1)}`;
    const left =
      `C${p(-w * 0.8, 0.95)} ${p(-w * 1.02, 0.8)} ${p(-w * 0.86, 0.66)} ` +
      `C${p(-w * 0.72, 0.54)} ${p(-w * 0.95, 0.48)} ${p(-w * 1.05, 0.36)} ` +
      `C${p(-w * 1.2, 0.16)} ${p(-1.2, 0.08)} ${p(-0.8, 0)}`;
    return [
      { f: 'leafLight', d: `M${p(0.8, 0)} ${right} ${left} Z` },
      { f: 'leaf', d: `M${p(0.8, 0)} ${right} Q${p(0.4, 0.5)} ${p(0, 0)} Z`, o: 0.6 },
    ];
  }

  /** A red alga that forks into two broad lobes (like dulse), `w` its half-width. */
  function forked(x: number, y: number, h: number, lean: number, w: number, bend = 0): ArtShape[] {
    const p = framer(x, y, h, lean, bend);
    const right =
      `C${p(1.4, 0.18)} ${p(w, 0.3)} ${p(w * 0.95, 0.5)} ` +
      `C${p(w * 0.9, 0.7)} ${p(w * 1.05, 0.92)} ${p(w * 0.55, 0.97)} ` +
      `C${p(w * 0.15, 1)} ${p(0.5, 0.8)} ${p(0.1, 0.68)}`;
    const left =
      `C${p(-0.3, 0.84)} ${p(-w * 0.2, 1.02)} ${p(-w * 0.62, 1)} ` +
      `C${p(-w * 1.08, 0.96)} ${p(-w, 0.72)} ${p(-w * 0.95, 0.5)} ` +
      `C${p(-w, 0.3)} ${p(-1.4, 0.18)} ${p(-0.8, 0)}`;
    return [
      { f: 'red', d: `M${p(0.8, 0)} ${right} ${left} Z` },
      { f: 'rust', d: `M${p(0.8, 0)} ${right} Q${p(0.3, 0.35)} ${p(0, 0)} Z`, o: 0.6 },
    ];
  }

  /** A grey stone lying on the sea floor, `rx` wide and `ry` high, foot at y. */
  function stone(cx: number, y: number, rx: number, ry: number): ArtShape[] {
    return [
      { f: 'grey', d: `M${r(cx - rx)} ${r(y)} C${r(cx - rx)} ${r(y - ry * 1.3)} ${r(cx + rx)} ${r(y - ry * 1.3)} ${r(cx + rx)} ${r(y)} Z` },
      { f: 'greyDark', d: `M${r(cx + rx * 0.15)} ${r(y - ry * 0.95)} C${r(cx + rx * 0.8)} ${r(y - ry * 0.85)} ${r(cx + rx)} ${r(y - ry * 0.4)} ${r(cx + rx)} ${r(y)} L${r(cx + rx * 0.15)} ${r(y)} Z`, o: 0.6 },
    ];
  }

  /** A knobbly coralline ball (rhodolith) of radius `rad`, shaded lower right. */
  function rhodolith(cx: number, cy: number, rad: number): ArtShape[] {
    const n = 7;
    const pt = (a: number, k: number): string => `${r(cx + Math.cos(a) * rad * k)} ${r(cy + Math.sin(a) * rad * k)}`;
    let d = `M${pt(0, 0.92)}`;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      d += ` Q${pt((a0 + a1) / 2, 1.38)} ${pt(a1, 0.92)}`;
    }
    return [
      { f: 'pink', d: `${d} Z` },
      { f: 'shell', d: `M${pt(-Math.PI * 0.3, 1)} A${rad} ${rad} 0 0 1 ${pt(Math.PI * 0.7, 1)} Z`, o: 0.7 },
    ];
  }

  FLORA_ART[Flora.MarineAlgae] = {
    // spärlich: One small seaweed tuft on a stone: a branched red-algal frond next to a single
    //   wavy sea-lettuce blade.
    sparse: [...forked(13, 27, 16, -2.5, 3.8, 0.8), ...blade(19.5, 27, 13, 2.5, 3.4, -0.6), ...stone(16, 29.5, 7, 3.4)],
    // dicht: An underwater meadow of 4-5 swaying fronds of different heights, red and green mixed.
    //   Farben: wine-red and bright sea-green, grey stone.
    dense: [
      ...forked(12, 29, 26, 0.5, 4.4, 1.6),
      ...blade(5.5, 30.5, 21, -1.5, 3.4, 1.2),
      ...blade(19, 30.5, 23, 3, 3.8, -1.4),
      ...forked(26, 30.5, 18, 1, 3.6, 1),
      ...stone(10.5, 30.5, 4.5, 2.6),
    ],
    specialists: [
      // Kalkrotalgen — Eis (coralline red algae, Lithothamnion; rhodolith beds, also off
      //   Svalbard). Pink knobbly balls and crusts on the sea floor under an ice edge. Farben:
      //   pastel pink-violet, white ice.
      {
        name: 'Kalkrotalgen', biome: Biome.Arctic, art: [
          { f: 'white', d: 'M1.5 1.8 L23.5 1.8 L21.5 6 L17.5 7.8 L14 6.8 L10 9.4 L6 7.6 L1.5 9.4 Z' },
          { f: 'cyan', d: 'M1.5 6.6 L6 5.2 L10 6.8 L14 4.6 L17.5 5.6 L22.4 4 L21.5 6 L17.5 7.8 L14 6.8 L10 9.4 L6 7.6 L1.5 9.4 Z' },
          { f: 'shell', d: 'M3.5 29.5 C4.5 26.6 9 26.2 13 26.8 C17 25.8 23 26 27 27.4 C28.4 28 28.6 29 28.6 29.5 Z' },
          ...rhodolith(11.5, 21.2, 4.8),
          ...rhodolith(21.8, 23, 3.8),
          ...rhodolith(5.4, 25.4, 2.5),
        ],
      },
    ],
  };
}
