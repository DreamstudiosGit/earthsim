/* =============================================================================
 * SimEarth 2.0 — plant art: Laubbäume (broadleaf)
 * -----------------------------------------------------------------------------
 * Round, lobed crowns in leaf green on a short bark trunk, each lobe lit from
 * the upper left with a dark rim at its lower right. Specialists: mangroves on
 * stilt roots in the swamp, umbrella acacias in open land, dwarf birches
 * creeping over the tundra.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;

  /** Crown lobes [x, y, radius], painted back to front: a dark disc, then its lit face shifted up-left. */
  function crown(lobes: readonly (readonly [number, number, number])[], lit: PaletteKey, shade: PaletteKey): ArtShape[] {
    const out: ArtShape[] = [];
    for (const [x, y, rad] of lobes) {
      out.push({ f: shade, d: artCircle(x, y, rad) });
      out.push({ f: lit, d: artCircle(r(x - 0.9), r(y - 1), r(rad - 1.6)) });
    }
    return out;
  }

  /** A trunk flaring at the foot, from the ground at y up to `top`. */
  function trunk(x: number, y: number, top: number, w: number): ArtShape {
    return { f: 'bark', d: `M${r(x - w * 0.9)} ${y} Q${r(x - w * 0.5)} ${r(y - 2)} ${r(x - w * 0.5)} ${top} L${r(x + w * 0.5)} ${top} Q${r(x + w * 0.5)} ${r(y - 2)} ${r(x + w * 0.9)} ${y} Z` };
  }

  /** A sprig of three tiny round leaves with a darker one at its lower right. */
  function sprig(x: number, y: number, leaf: PaletteKey, shade: PaletteKey): ArtShape[] {
    return [
      { f: leaf, d: `${artCircle(x, r(y - 1.1), 2.2)} ${artCircle(r(x - 1.7), r(y + 0.6), 2)} ${artCircle(r(x + 1.7), r(y + 0.6), 2)}` },
      { f: shade, d: artCircle(r(x + 1.9), r(y + 0.9), 1.3), o: 0.6 },
    ];
  }

  /** A grey-brown acacia limb: bark with a grey sheen. */
  function limb(d: string, w: number): ArtShape[] {
    return [{ s: 'bark', w, d }, { s: 'grey', w, d, o: 0.35 }];
  }

  FLORA_ART[Flora.Broadleaf] = {
    // spärlich: One rounded deciduous tree with a lobed crown.
    sparse: [
      trunk(16, 29.5, 18, 3),
      ...crown([[16, 9, 6.5], [10, 13, 5.5], [22, 12.5, 5.5], [12.5, 17.5, 5.2], [20, 17.5, 5.5]], 'leaf', 'forest'),
    ],
    // dicht: Several overlapping round crowns forming a closed canopy. Farben: leaf green, brown
    //   trunk; optional autumn orange.
    dense: [
      trunk(6.5, 26.5, 14, 2.4),
      trunk(25.5, 26, 14, 2.4),
      ...crown([[9, 9, 5.5], [5, 13, 3.5], [13, 12, 4.5]], 'leaf', 'forest'),
      ...crown([[23, 8, 5.5], [27, 12.5, 3.5], [19, 11.5, 4.5]], 'leaf', 'forest'),
      trunk(16, 30, 22, 2.8),
      ...crown([[16, 16.5, 6], [10.5, 20.5, 5], [21.5, 20.5, 5]], 'leaf', 'forest'),
    ],
    specialists: [
      // Mangroven — Sumpf (Rhizophora (mangroves), tropical coastal swamps). A tree standing on
      //   arching stilt roots above shallow water. Farben: dark glossy green, brown roots,
      //   blue-green water.
      {
        name: 'Mangroven', biome: Biome.Swamp, art: [
          { s: 'bark', w: 1.8, d: 'M15.4 16.5 C10 16 5.5 19 4.5 27.5' },
          { s: 'bark', w: 1.8, d: 'M15.6 18 C12.5 18.5 11 22 10.5 27.5' },
          { s: 'bark', w: 1.8, d: 'M16.4 18 C19.5 18.5 21 22 21.5 27.5' },
          { s: 'bark', w: 1.8, d: 'M16.6 16.5 C22 16 26.5 19 27.5 27.5' },
          trunk(16, 19.5, 12, 2.6),
          ...crown([[16, 8.5, 6], [9, 11.5, 5], [23, 11.5, 5]], 'jungle', 'forest'),
          { f: 'teal', d: artEllipse(16, 27.6, 13.5, 2.3), o: 0.7 },
        ],
      },
      // Schirmakazien — Offenland (Vachellia tortilis (umbrella thorn acacia), savanna). A
      //   flat-topped umbrella-shaped tree crown on a thin forked trunk. Farben: olive green crown,
      //   grey-brown trunk.
      {
        name: 'Schirmakazien', biome: Biome.Grass, art: [
          ...limb('M14.8 29 C15.4 26 15 24 15.8 21.5', 2.6),
          ...limb('M15.8 22 C13.5 18 11 15 8 12', 1.8),
          ...limb('M15.8 22 C18.5 18 21 15 24.5 11.5', 1.8),
          { f: 'forest', d: `${artEllipse(9, 10.5, 7, 3)} ${artEllipse(16.5, 8.8, 8.5, 3.6)} ${artEllipse(23.5, 10.3, 6.5, 3)}` },
          { f: 'olive', d: `${artEllipse(8.6, 9.7, 6.4, 2.4)} ${artEllipse(16, 8, 7.9, 3)} ${artEllipse(23, 9.5, 6, 2.4)}` },
          { f: 'scale', d: `${artEllipse(8, 9, 4, 1.4)} ${artEllipse(14.5, 7, 4.5, 1.6)}`, o: 0.8 },
        ],
      },
      // Zwergbirken — Tundra (Betula nana (dwarf birch)). A knee-high, low creeping shrub with
      //   tiny round leaves. Farben: green to red-orange leaves, dark twigs.
      {
        name: 'Zwergbirken', biome: Biome.Tundra, art: [
          { s: 'bark', w: 1.8, d: 'M4.5 28 C8 26.5 12 28.5 16 26.5 C20 24.5 24 27.5 28.5 25.5' },
          { s: 'bark', w: 1.6, d: 'M9 27.3 L10.5 22' },
          { s: 'bark', w: 1.6, d: 'M16 26.5 L16.5 20.5' },
          { s: 'bark', w: 1.6, d: 'M22.5 25.8 L22 21' },
          ...sprig(6, 24.5, 'leaf', 'forest'),
          ...sprig(11, 20.5, 'leaf', 'forest'),
          ...sprig(17, 18.5, 'olive', 'forest'),
          ...sprig(22.5, 20, 'orange', 'rust'),
          ...sprig(26.5, 23, 'rust', 'furDark'),
        ],
      },
    ],
  };
}
