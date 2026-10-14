/* =============================================================================
 * SimEarth 2.0 — plant art: Nadelbäume (conifers)
 * -----------------------------------------------------------------------------
 * Reference set for the plant icons: tiered conifers lit from the upper left
 * (the shaded right half is darker), a short bark trunk below. Specialists:
 * snow-laden spruce in the taiga, golden larch at the tree line, low mountain
 * pine on bare rock.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;

  /**
   * A tiered conifer standing on (x, y), `h` units tall: trunk, foliage and
   * shade. `slim` narrows the crown (taiga spruce); `tiers` sets the steps.
   */
  function tiered(x: number, y: number, h: number, foliage: PaletteKey, shade: PaletteKey, slim = 1, tiers = 4): ArtShape[] {
    const top = y - h;
    const crown = h * 0.88;
    const bottoms: number[] = [];
    const halves: number[] = [];
    for (let k = 0; k < tiers; k++) {
      const f = (k + 1) / tiers;
      bottoms.push(top + crown * (0.3 + 0.7 * f) * (k === tiers - 1 ? 1 : 0.97));
      halves.push(h * (0.2 + 0.26 * f) * slim);
    }
    const right: string[] = [];
    const left: string[] = [];
    bottoms.forEach((b, k) => {
      right.push(`L${r(x + halves[k])} ${r(b)}`);
      left.unshift(`L${r(x - halves[k])} ${r(b)}`);
      if (k < bottoms.length - 1) {
        right.push(`L${r(x + halves[k] * 0.55)} ${r(b)}`);
        left.unshift(`L${r(x - halves[k] * 0.55)} ${r(b)}`);
      }
    });
    const base = r(bottoms[tiers - 1]);
    const trunkW = Math.max(1.1, h * 0.06);
    return [
      { f: 'bark', d: `M${r(x - trunkW)} ${r(base - 1)} L${r(x + trunkW)} ${r(base - 1)} L${r(x + trunkW)} ${r(y)} L${r(x - trunkW)} ${r(y)} Z` },
      { f: foliage, d: `M${r(x)} ${r(top)} ${right.join(' ')} ${left.join(' ')} Z` },
      { f: shade, d: `M${r(x)} ${r(top)} ${right.join(' ')} L${r(x)} ${base} Z`, o: 0.55 },
    ];
  }

  /** A hanging cone. */
  const cone = (x: number, y: number): ArtShape => ({ f: 'bark', d: artEllipse(x, y, 0.9, 1.5) });

  FLORA_ART[Flora.Conifers] = {
    // spärlich: A single conical conifer with a few hanging cones.
    sparse: [...tiered(16, 29.5, 25, 'spruce', 'forest'), cone(12.2, 20.6), cone(20.6, 25.4)],
    // dicht: Three overlapping conical conifers of different heights.
    dense: [
      ...tiered(16, 26, 23, 'spruce', 'forest'),
      ...tiered(9.5, 30, 18, 'spruce', 'forest'),
      ...tiered(22.5, 30.5, 18, 'spruce', 'forest'),
    ],
    specialists: [
      // Fichten — Nadelwald (Picea, taiga). A tall narrow spire-shaped spruce with drooping
      //   branches and snow on them. Farben: dark green, white snow.
      {
        name: 'Fichten', biome: Biome.Boreal, art: [
          ...tiered(16, 30, 27, 'forest', 'ink', 0.72, 5),
          { f: 'white', d: 'M16 3 L18.1 7.8 L16 7 L13.9 7.8 Z' },
          { f: 'white', d: 'M13.2 11.6 L16 10.6 L18.8 11.6 L17.6 12.4 L16 11.8 L14.4 12.4 Z' },
          { f: 'white', d: 'M12 16.3 L16 15.2 L20 16.3 L18.6 17.1 L16 16.4 L13.4 17.1 Z' },
          { f: 'white', d: 'M10.8 21 L16 19.8 L21.2 21 L19.6 21.8 L16 21 L12.4 21.8 Z' },
        ],
      },
      // Lärchen — Tundra (Larix, deciduous conifer at the northern tree line). A sparse, thin
      //   conical tree with tufted needles, small and wind-bent. Farben: golden yellow-green.
      {
        name: 'Lärchen', biome: Biome.Tundra, art: [
          ...tiered(15.5, 29.5, 21, 'moss', 'olive', 0.62, 5),
          { f: 'olive', d: artEllipse(12.4, 22.6, 1.6, 0.9) },
          { f: 'olive', d: artEllipse(18.6, 17.4, 1.4, 0.8) },
        ],
      },
      // Latschenkiefern — Fels (Pinus mugo, krummholz on rocky slopes). A low, sprawling,
      //   twisted pine with dense needle tufts growing across a rock. Farben: dark green, grey
      //   rock.
      {
        name: 'Latschenkiefern', biome: Biome.Rock, art: [
          { f: 'grey', d: 'M3 29.5 L6 23.5 L13 21.5 L20 23 L27 22 L29.5 29.5 Z' },
          { f: 'greyDark', d: 'M20 23 L27 22 L29.5 29.5 L18 29.5 Z', o: 0.6 },
          { s: 'bark', w: 2, d: 'M7 27 C10 24 13 25 16 22.5 C19 20 22 21.5 25.5 19' },
          { f: 'spruce', d: artEllipse(7.5, 22.6, 4.2, 2.8) },
          { f: 'spruce', d: artEllipse(15.6, 18.8, 5.2, 3.2) },
          { f: 'spruce', d: artEllipse(24.4, 16.6, 4.6, 3) },
          { f: 'forest', d: artEllipse(17.4, 20, 3.6, 1.8), o: 0.55 },
          { f: 'forest', d: artEllipse(25.8, 17.8, 3, 1.6), o: 0.55 },
        ],
      },
    ],
  };
}
