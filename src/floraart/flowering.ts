/* =============================================================================
 * SimEarth 2.0 — plant art: Blütenpflanzen (flowering)
 * -----------------------------------------------------------------------------
 * Low light-green plants carrying round five-petalled blossoms, lit from the
 * upper left: a single flowering herb, a shrub patch full of flowers.
 * Specialists: a saguaro cactus in the desert, water lilies in the swamp,
 * cotton grass in the tundra.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;

  /** A leafy mound of overlapping lobes [x, y, radius]: dark rim lower right, lit face upper left. */
  function mound(lobes: readonly (readonly [number, number, number])[], lit: PaletteKey, shade: PaletteKey): ArtShape[] {
    return [
      { f: shade, d: lobes.map(([x, y, rad]) => artCircle(x, y, rad)).join(' ') },
      { f: lit, d: lobes.map(([x, y, rad]) => artCircle(r(x - 0.9), r(y - 1), r(rad - 1.5))).join(' ') },
    ];
  }

  /** A pointed leaf from its stalk (x0, y0) to its tip (x1, y1), `w` units wide. */
  function blade(x0: number, y0: number, x1: number, y1: number, w: number, f: PaletteKey): ArtShape {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const px = ((y0 - y1) / len) * w;
    const py = ((x1 - x0) / len) * w;
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    return { f, d: `M${x0} ${y0} Q${r(mx + px)} ${r(my + py)} ${x1} ${y1} Q${r(mx - px)} ${r(my - py)} ${x0} ${y0} Z` };
  }

  /** A five-petalled flower seen from above, `size` units in radius. */
  function bloom(x: number, y: number, size: number, petal: PaletteKey, heart: PaletteKey): ArtShape[] {
    const petals: string[] = [];
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      petals.push(artCircle(r(x + Math.cos(a) * size * 0.55), r(y + Math.sin(a) * size * 0.55), r(size * 0.47)));
    }
    return [{ f: petal, d: petals.join(' ') }, { f: heart, d: artCircle(x, y, r(size * 0.34)) }];
  }

  /** A pointed star of `n` petals, flattened by `squash` as if seen at an angle. */
  function star(x: number, y: number, outer: number, inner: number, n: number, squash: number, turn = 0): string {
    const pts: string[] = [];
    for (let k = 0; k < n * 2; k++) {
      const a = -Math.PI / 2 + turn + (k * Math.PI) / n;
      const rad = k % 2 === 0 ? outer : inner;
      pts.push(`${k === 0 ? 'M' : 'L'}${r(x + Math.cos(a) * rad)} ${r(y + Math.sin(a) * rad * squash)}`);
    }
    return `${pts.join(' ')} Z`;
  }

  /** A round floating leaf with its notch cut at angle `notch` (radians, 0 = right). */
  function pad(x: number, y: number, rx: number, ry: number, notch: number): string {
    const at = (a: number): string => `${r(x + Math.cos(a) * rx)} ${r(y + Math.sin(a) * ry)}`;
    return `M${x} ${y} L${at(notch + 0.38)} A${rx} ${ry} 0 1 1 ${at(notch - 0.38)} Z`;
  }

  /** A cotton-grass head: a fluffy white tuft, cream where it turns from the light. */
  function tuft(x: number, y: number): ArtShape[] {
    const puffs = (dx: number, dy: number, dr: number): string =>
      [[0, -0.8, 2.4], [-1.2, 0.7, 2], [1.2, 0.7, 2]]
        .map(([px, py, pr]) => artCircle(r(x + px + dx), r(y + py + dy), r(pr + dr))).join(' ');
    return [{ f: 'bone', d: puffs(0, 0, 0) }, { f: 'white', d: puffs(-0.5, -0.6, -0.6) }];
  }

  FLORA_ART[Flora.Flowering] = {
    // spärlich: A low flowering herb: simple leaves at its foot, three open five-petalled flowers.
    sparse: [
      { s: 'leaf', w: 1.8, d: 'M15.4 27 Q12 21 8.2 16' },
      { s: 'leaf', w: 1.8, d: 'M16 27 L16 10' },
      { s: 'leaf', w: 1.8, d: 'M16.6 27 Q20 21 23.8 16' },
      blade(15.4, 29.5, 4.5, 24.5, 5, 'leafLight'),
      blade(16.6, 29.5, 27.5, 24.5, 5, 'leaf'),
      blade(15.6, 29.5, 11, 21.5, 4.4, 'leafLight'),
      blade(16.4, 29.5, 21, 21.5, 4.4, 'leaf'),
      ...bloom(8, 15.5, 3.6, 'blossom', 'yellow'),
      ...bloom(16, 8.5, 3.8, 'blossom', 'yellow'),
      ...bloom(24, 15.5, 3.6, 'blossom', 'yellow'),
    ],
    // dicht: A flower meadow or shrub patch with many flowers of several colours. Farben: green
    //   leaves, white, yellow and pink flowers.
    dense: [
      ...mound([[8.5, 12.5, 6], [16, 10, 6.5], [24, 12.5, 6], [7.6, 22, 5.8], [15.5, 21.5, 7.5], [24.5, 22.5, 5.8]], 'leafLight', 'leaf'),
      ...bloom(8, 10.5, 3, 'blossom', 'yellow'),
      ...bloom(17.5, 7.5, 3, 'white', 'yellow'),
      ...bloom(24.5, 13.5, 3, 'yellow', 'orange'),
      ...bloom(12.5, 17, 2.8, 'yellow', 'orange'),
      ...bloom(6.8, 22.5, 2.8, 'white', 'yellow'),
      ...bloom(16.5, 24.5, 3, 'blossom', 'yellow'),
      ...bloom(24, 23, 2.8, 'white', 'yellow'),
    ],
    specialists: [
      // Kakteen — Wüste (Cactaceae (saguaro type)). A ribbed columnar cactus with two upturned
      //   arms and fine spines. Farben: blue-green, pale spines, a small pink flower.
      {
        name: 'Kakteen', biome: Biome.Desert, art: [
          { f: 'clubmoss', d: 'M12.6 29.5 L12.6 7.5 A3.4 3.4 0 0 1 19.4 7.5 L19.4 29.5 Z' },
          { f: 'clubmoss', d: 'M12.6 22 L8.3 22 A3.5 3.5 0 0 1 4.8 18.5 L4.8 12.5 A2.3 2.3 0 0 1 9.4 12.5 L9.4 17.4 L12.6 17.4 Z' },
          { f: 'clubmoss', d: 'M19.4 17.5 L23.7 17.5 A3.5 3.5 0 0 0 27.2 14 L27.2 9 A2.3 2.3 0 0 0 22.6 9 L22.6 13 L19.4 13 Z' },
          { f: 'spruce', d: 'M16.4 29.5 L16.4 4.4 A3.4 3.4 0 0 1 19.4 7.5 L19.4 29.5 Z', o: 0.55 },
          { f: 'spruce', d: 'M12.6 22 L8.3 22 A3.5 3.5 0 0 1 5.6 20.7 L12.6 19.6 Z', o: 0.55 },
          { f: 'spruce', d: 'M25 17.4 A3.5 3.5 0 0 0 27.2 14 L27.2 9 A2.3 2.3 0 0 0 25 6.7 Z', o: 0.55 },
          { s: 'mint', w: 1.6, d: 'M14.4 27.5 L14.4 7.5', o: 0.8 },
          { s: 'mint', w: 1.6, d: 'M6.7 18 L6.7 12.6', o: 0.8 },
          { s: 'mint', w: 1.6, d: 'M24.4 13.8 L24.4 9', o: 0.8 },
          ...bloom(16, 4.6, 2.6, 'pink', 'yellow'),
        ],
      },
      // Seerosen — Sumpf (Nymphaea (water lilies, an early-diverging angiosperm lineage)). Round
      //   floating leaves with a notch and one open star-shaped flower on the water. Farben: green
      //   pads, white-pink flower, dark water.
      {
        name: 'Seerosen', biome: Biome.Swamp, art: [
          { f: 'navy', d: artEllipse(16, 22.5, 14, 7), o: 0.6 },
          { f: 'forest', d: pad(9, 22.5, 5.6, 3.2, -0.6) },
          { f: 'jungle', d: pad(8.6, 22, 4.8, 2.6, -0.6) },
          { f: 'forest', d: pad(22, 25, 5.4, 3, -2.4) },
          { f: 'jungle', d: pad(21.6, 24.5, 4.6, 2.4, -2.4) },
          { f: 'forest', d: pad(23.5, 18, 3.6, 2, 2.2) },
          { f: 'jungle', d: pad(23.2, 17.6, 3, 1.6, 2.2) },
          { f: 'white', d: star(15.5, 17.5, 6.8, 2.6, 8, 0.75) },
          { f: 'pink', d: star(15.5, 17.1, 4, 1.7, 6, 0.8, Math.PI / 6) },
          { f: 'yellow', d: artCircle(15.5, 17.1, 1.4) },
        ],
      },
      // Wollgras — Tundra (Eriophorum (cotton grass, a sedge, not a true grass)). Thin stalks
      //   topped by white cotton-wool tufts. Farben: white tufts, olive stalks.
      {
        name: 'Wollgras', biome: Biome.Tundra, art: [
          { s: 'olive', w: 1.8, d: 'M14.6 29 Q11 24 7 17.5' },
          { s: 'olive', w: 1.8, d: 'M15.4 29 Q14.6 18 13.5 9.5' },
          { s: 'olive', w: 1.8, d: 'M16.6 29 Q18.2 20.5 21.5 15' },
          { s: 'olive', w: 1.8, d: 'M17.4 29 Q22 25.5 27 23' },
          blade(15.4, 29.5, 10, 23.5, 2.8, 'olive'),
          blade(16, 29.5, 16.5, 22.5, 2.8, 'olive'),
          blade(16.6, 29.5, 21.5, 24.5, 2.8, 'olive'),
          ...tuft(7, 15),
          ...tuft(13.5, 7),
          ...tuft(21.5, 12.5),
          ...tuft(27, 20.5),
        ],
      },
    ],
  };
}
