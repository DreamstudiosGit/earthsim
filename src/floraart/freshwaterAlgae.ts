/* =============================================================================
 * SimEarth 2.0 — plant art: Süßwasseralgen (freshwaterAlgae)
 * -----------------------------------------------------------------------------
 * Bright green algal threads in shallow fresh water: loose filaments on a
 * small pool, a tangled pond-scum mat with oxygen bubbles. Specialists:
 * candelabra-like stoneworts in the swamp, purple-brown speckles on glacier ice.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;

  /** A shallow pool of clear water, lit from the upper left. */
  function pool(cx: number, cy: number, rx: number, ry: number): ArtShape[] {
    return [
      { f: 'sky', d: artEllipse(cx, cy, rx, ry) },
      { f: 'blue', d: `M${r(cx - rx * 0.2)} ${r(cy + ry)} A${rx} ${ry} 0 0 0 ${r(cx + rx)} ${r(cy)} Z`, o: 0.5 },
    ];
  }

  /** An air bubble with a glint. */
  function bubble(cx: number, cy: number, rad: number): ArtShape[] {
    return [
      { f: 'white', d: artCircle(cx, cy, rad) },
      { f: 'cyan', d: `M${r(cx + rad)} ${r(cy)} A${rad} ${rad} 0 0 1 ${r(cx)} ${r(cy + rad)} Z`, o: 0.7 },
    ];
  }

  /**
   * A flat, lumpy mat of tangled filaments centred on (cx, cy), `rx` by `ry`:
   * a lighter lump upper left, shade lower right, dark threads woven through
   * unless the clump is too small to show them.
   */
  function mat(cx: number, cy: number, rx: number, ry: number, threads = true): ArtShape[] {
    const at = (u: number, v: number): string => `${r(cx + u * rx)} ${r(cy + v * ry)}`;
    const lump = (u: number, v: number, a: number, b: number, f: PaletteKey): ArtShape =>
      ({ f, d: artEllipse(r(cx + u * rx), r(cy + v * ry), r(a * rx), r(b * ry)) });
    const lumps: ArtShape[] = threads
      ? [lump(-0.45, -0.3, 0.5, 0.65, 'frog'), lump(0.1, -0.5, 0.36, 0.5, 'frog'), lump(0.55, -0.2, 0.38, 0.55, 'frog')]
      : [lump(-0.3, -0.35, 0.6, 0.65, 'frog')];
    const body: ArtShape[] = [
      { f: 'frog', d: artEllipse(cx, cy + ry * 0.15, rx, ry * 0.85) },
      ...lumps,
      lump(-0.5, -0.45, 0.3, 0.36, 'leafLight'),
      { f: 'jungle', d: `M${at(1, 0.1)} C${at(1, 0.7)} ${at(0.5, 1)} ${at(-0.1, 1)} C${at(0.4, 0.75)} ${at(0.8, 0.45)} ${at(1, 0.1)} Z`, o: 0.55 },
    ];
    if (!threads) return body;
    return [
      ...body,
      { s: 'jungle', w: 1.8, d: `M${at(-0.8, 0.1)} C${at(-0.5, -0.4)} ${at(-0.3, 0.5)} ${at(0, 0.05)} S${at(0.45, -0.45)} ${at(0.75, 0.05)}` },
      { s: 'jungle', w: 1.8, d: `M${at(-0.55, 0.65)} C${at(-0.3, 0.2)} ${at(-0.05, 0.95)} ${at(0.2, 0.55)} S${at(0.5, 0.25)} ${at(0.6, 0.6)}` },
    ];
  }

  /** A stonewort stem with whorls of upturned side branches and chalky nodes. */
  function stonewort(x: number, y: number, top: number, nodes: readonly number[], reach: number, stem: PaletteKey): ArtShape[] {
    const out: ArtShape[] = [{ s: stem, w: 2.4, d: `M${x} ${y} L${x} ${top}` }];
    for (const n of nodes) {
      out.push({ s: stem, w: 2, d: `M${x} ${n} Q${r(x - reach)} ${n} ${r(x - reach - 0.6)} ${r(n - reach)}` });
      out.push({ s: stem, w: 2, d: `M${x} ${n} Q${r(x + reach)} ${n} ${r(x + reach + 0.6)} ${r(n - reach)}` });
    }
    for (const n of nodes) out.push({ f: 'bone', d: artCircle(x, n, 1.6) });
    out.push({ f: 'bone', d: artCircle(x, top, 1.5) });
    return out;
  }

  /** A short chain of algal cells, `n` beads from (x, y) along (dx, dy). */
  function cells(x: number, y: number, dx: number, dy: number, n: number): ArtShape[] {
    const out: ArtShape[] = [];
    for (let k = 0; k < n; k++) out.push({ f: 'furDark', d: artEllipse(r(x + dx * k), r(y + dy * k), 1.3, 1.3) });
    return out;
  }

  FLORA_ART[Flora.FreshwaterAlgae] = {
    // spärlich: A few loose green threads floating with one bubble.
    sparse: [
      ...pool(16, 27, 11, 3),
      { s: 'jungle', w: 2.2, d: 'M8 27.5 C10.5 25 13 28.5 16 26.6 S21 25 24.5 27.2' },
      { s: 'frog', w: 2.2, d: 'M6 24.5 C9 21.5 11 25.5 14 23 S19 20.6 22 23 S26 24.5 27 22' },
      { s: 'leafLight', w: 2.2, d: 'M10 20.5 C12 18 14.5 21.5 17 19.4 S20.5 18 21.5 20' },
      ...bubble(22.5, 15.5, 2.2),
    ],
    // dicht: A tangled mat of green filaments (pond scum) with several bubbles. Farben:
    //   yellow-green to emerald, white bubbles.
    dense: [
      ...pool(6.5, 9.8, 4.6, 1.6),
      ...pool(21.5, 15.5, 8.5, 2.3),
      ...pool(25.5, 28.4, 4.8, 1.6),
      ...pool(12.5, 27.5, 10.5, 2.5),
      ...mat(6.5, 7.6, 4.2, 2.6, false),
      ...mat(21, 11.5, 8, 4.2),
      ...mat(25.5, 26.4, 4.2, 2.6, false),
      ...mat(12, 22.5, 10, 5),
      ...bubble(8.5, 19.5, 1.7),
      ...bubble(17.5, 24.5, 1.5),
      ...bubble(24.5, 10, 1.6),
    ],
    specialists: [
      // Armleuchteralgen — Sumpf (Chara (Charophyceae), streptophyte algae). Upright stems with
      //   whorls of stiff side branches at regular nodes, like a candelabra. Farben: grey-green,
      //   chalky white crust.
      {
        name: 'Armleuchteralgen', biome: Biome.Swamp, art: [
          ...pool(16, 28, 12, 2.6),
          ...stonewort(8, 28, 15, [24, 19], 3.4, 'clubmoss'),
          ...stonewort(24.5, 28, 11.5, [24, 18.5], 3.4, 'spruce'),
          ...stonewort(16, 29, 4.5, [24.5, 18.5, 12.5], 4.2, 'clubmoss'),
        ],
      },
      // Gletscheralgen — Eis (Ancylonema nordenskioeldii (Zygnematophyceae), darkens the Greenland
      //   ice sheet). Dark purple-brown speckles and short cell chains spread over white glacier
      //   ice. Farben: purple-brown on white-blue ice.
      {
        name: 'Gletscheralgen', biome: Biome.Arctic, art: [
          { f: 'white', d: 'M2 29.5 L3.5 20 L9 15.5 L15 17 L21.5 12.5 L28 15.5 L30 21.5 L30 29.5 Z' },
          { f: 'cyan', d: 'M21.5 12.5 L28 15.5 L30 21.5 L30 29.5 L19 29.5 L22.5 20.5 Z', o: 0.6 },
          { s: 'sky', w: 1.6, d: 'M9.4 17.6 L10.4 19.8 L9.8 21.2' },
          { s: 'sky', w: 1.6, d: 'M26.4 17.8 L25.4 20.2 L26 21.6' },
          ...cells(6.5, 24.5, 1.9, -0.8, 3),
          ...cells(13, 23, 2, 0.5, 2),
          ...cells(18.5, 21.5, 1.9, -0.7, 3),
          ...cells(15.5, 26.8, 1.9, -0.2, 2),
          { f: 'furDark', d: artCircle(24.5, 25, 1.2) },
          { f: 'furDark', d: artCircle(10.5, 27.5, 1.1) },
          { f: 'furDark', d: artCircle(25.5, 21.5, 1) },
          { f: 'violet', d: 'M3 25 C5 19.5 10 18 15 19.5 C19.5 17 25 17.5 27.5 21 C26 25.5 21 27 15 26 C10 28 5 28 3 25 Z', o: 0.35 },
        ],
      },
    ],
  };
}
