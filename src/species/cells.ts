/* =============================================================================
 * SimEarth 2.0 — species art: Erste Zellen (cells)
 * -----------------------------------------------------------------------------
 * Microbes and what they build (see docs/oekosystem-2026-10/grafikstil.md):
 * free cells and chains float mid-tile, reefs, mats and stalks stand on the
 * floor at y ≈ 29. Round cells are lit from the upper left — a darker disk
 * under a lighter one shifted up-left — and the outline is left to the renderer.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;
  /** A filament, whip or twig as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });

  /** A round cell lit from the upper left: a dark disk under a lighter one. */
  function ball(cx: number, cy: number, rad: number, dark: PaletteKey, light: PaletteKey): Art {
    return [
      { f: dark, d: artCircle(r(cx), r(cy), r(rad)) },
      { f: light, d: artCircle(r(cx - rad * 0.14), r(cy - rad * 0.14), r(rad * 0.78)) },
    ];
  }

  /**
   * Overlapping circles [x, y, radius] as one lobed shape, optionally shifted
   * and shrunk. Every circle winds the same way, so the fill is their union.
   */
  function lobes(cs: readonly (readonly number[])[], dx = 0, dy = 0, dr = 0): string {
    return cs.map(([x, y, q]) => artCircle(r(x + dx), r(y + dy), r(q - dr))).join(' ');
  }

  /** Points every `step` units along the cubic Bezier [x0 y0 x1 y1 x2 y2 x3 y3]. */
  function along(p: readonly number[], step: number): number[][] {
    const pts: number[][] = [];
    let px = p[0];
    let py = p[1];
    let run = step;
    for (let k = 0; k <= 400; k++) {
      const t = k / 400;
      const u = 1 - t;
      const x = u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6];
      const y = u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7];
      run += Math.hypot(x - px, y - py);
      px = x;
      py = y;
      if (run >= step) {
        pts.push([x, y]);
        run = 0;
      }
    }
    return pts;
  }

  /** A bead-chain filament along a Bezier, ending in a larger pale cell. */
  function filament(p: readonly number[]): Art {
    const ex = p[6];
    const ey = p[7];
    const cells = along(p, 4.4).filter(([x, y]) => Math.hypot(x - ex, y - ey) > 5.1);
    return [
      ...cells.flatMap(([x, y]) => ball(x, y, 2, 'teal', 'clubmoss')),
      { f: 'yellow', d: artCircle(ex, ey, 2.7) },
    ];
  }

  /** A round head on a stem that narrows by `pinch` to the floor at y `base`; crown at y `top`. */
  function column(x0: number, x1: number, base: number, top: number, pinch: number): string {
    const rx = (x1 - x0) / 2;
    const ry = r(rx * 0.8);
    return `M${r(x0 + pinch)} ${base} L${x0} ${r(top + ry)} A${r(rx)} ${ry} 0 0 1 ${x1} ${r(top + ry)} L${r(x1 - pinch)} ${base} Z`;
  }

  /** A stromatolite: a head of stacked arched layers under a green film. */
  function stromatolite(x0: number, x1: number, base: number, top: number): Art {
    const rx = (x1 - x0) / 2;
    const out: ArtShape[] = [
      { f: 'olive', d: column(x0, x1, base, top, 2) },
      { f: 'sand', d: column(x0, x1, base, top + 2.4, 2) },
    ];
    for (let y = top + 2.4 + rx * 0.8 + 1.4, k = 0; y < base - 3; y += 3.6, k++) {
      const inset = 1.2 + k * 0.6;
      out.push(line('chitin', 1.8, `M${r(x0 + inset)} ${r(y)} A${r(rx - inset)} ${r(rx * 0.5)} 0 0 1 ${r(x1 - inset)} ${r(y)}`));
    }
    out.push({ f: 'kelp', d: `M${r(x0 + rx)} ${r(top + 2.4)} A${r(rx)} ${r(rx * 0.8)} 0 0 1 ${x1} ${r(top + 2.4 + rx * 0.8)} L${r(x1 - 2)} ${base} L${r(x0 + rx)} ${base} Z`, o: 0.3 });
    return out;
  }

  /** A twisted iron stalk along a Bezier: a rust core with orange bands winding round it. */
  function stalk(p: readonly number[]): Art {
    const out: ArtShape[] = [line('rust', 4, `M${p[0]} ${p[1]} C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]}`)];
    const pts = along(p, 3.2);
    for (let k = 1; k < pts.length - 1; k++) {
      const [x, y] = pts[k];
      const tl = Math.hypot(pts[k + 1][0] - pts[k - 1][0], pts[k + 1][1] - pts[k - 1][1]);
      const tx = (pts[k + 1][0] - pts[k - 1][0]) / tl;
      const ty = (pts[k + 1][1] - pts[k - 1][1]) / tl;
      const bx = -ty * 1.1 + tx * 0.8;
      const by = tx * 1.1 + ty * 0.8;
      out.push(line('orange', 1.6, `M${r(x - bx)} ${r(y - by)} L${r(x + bx)} ${r(y + by)}`));
    }
    return out;
  }

  const ARCHAEON = [[15.5, 15, 5], [21, 12.5, 4.6], [25, 17.5, 4.6], [20.5, 21.5, 5], [15, 20.5, 4.2], [20, 17, 5]];
  const THROMBOLITE = [[7, 24.5, 4.5], [11.5, 18.5, 5], [18, 15.5, 5.6], [24, 19, 5], [26.5, 24.5, 4], [16, 23.5, 5.5]];
  const SMOKE = [[15.4, 10.4, 2.8], [13.8, 6.4, 3.2], [18.6, 5, 3.4], [23.6, 5.6, 3.1], [27.2, 8.6, 2.3]];

  SPECIES[Life.Prokaryote] = {
    stages: [
      // 1 · Urzellen — vor 3800 Mio. J. (Earliest cells (descendants of LUCA, hypothetical);
      //   oldest putative traces ~3.7 Ga (Isua graphite, contested)). A single round cell with a
      //   thick double membrane ring and one curled strand (RNA) inside; nothing else. Farben: pale
      //   aqua membrane, rose-pink strand, faint glow.
      {
        name: 'Urzellen', ma: 3800, art: [
          { f: 'mint', d: artCircle(16, 16, 14), o: 0.3 },
          { f: 'teal', d: artCircle(16, 16, 11) },
          { f: 'mint', d: artCircle(16, 16, 9.2) },
          { f: 'teal', d: artCircle(16, 16, 7.8) },
          { f: 'cyan', d: artCircle(15.6, 15.6, 6.3) },
          line('shell', 2.4, 'M11.5 18.5 C13.5 19 14.6 17.4 14 15.4 C13.4 13.2 16.4 12 17.6 14 C18.8 16 16.8 18.4 18.6 19.4 C19.8 20 20.8 19 20.6 17.6'),
        ],
      },
      // 2 · Archaeen — vor 3460 Mio. J. (Archaea, e.g. methanogens; microbial methane in 3.46 Ga
      //   fluid inclusions (Ueno et al. 2006, Nature)). An irregular lobed cell (Sulfolobus-like)
      //   with one long wavy whip (archaellum) trailing to the left, plus 2-3 tiny gas bubbles
      //   above. Farben: warm orange cell, rust outline, white bubbles.
      {
        name: 'Archaeen', ma: 3460, art: [
          line('rust', 2.2, 'M12 18.5 C9.5 15.5 7.6 15.4 6.6 17.6 C5.6 19.8 4.2 21.2 2.8 19.4'),
          { f: 'rust', d: lobes(ARCHAEON) },
          { f: 'orange', d: lobes(ARCHAEON, -0.9, -0.9, 1.3) },
          { f: 'white', d: artCircle(11, 5.5, 2.1) },
          { f: 'white', d: artCircle(5.8, 10, 1.6) },
          { f: 'white', d: artCircle(16.2, 3.2, 1.4) },
        ],
      },
      // 3 · Stromatolithen — vor 3430 Mio. J. (Strelley Pool stromatolites, Pilbara, 3.43 Ga
      //   (Allwood et al. 2006, Nature); Dresser Fm. ~3.48 Ga). Two or three low domes rising from
      //   the sea floor, each with 3-4 nested arched layer lines and a thin slimy film on top.
      //   Farben: sand/ochre layers, olive-green top film.
      {
        name: 'Stromatolithen', ma: 3430, art: [
          ...stromatolite(2.2, 12.8, 28, 12),
          ...stromatolite(15.8, 29.8, 28, 5.5),
          { f: 'tan', d: 'M1.5 26.5 L30.5 26.5 L30.5 29.5 L1.5 29.5 Z' },
        ],
      },
      // 4 · Mikrobenmatten — vor 3220 Mio. J. (Microbial mats on land / river banks, Moodies Group
      //   3.22 Ga (Homann et al. 2018, Nature Geoscience)). A flat wrinkled carpet on a shoreline
      //   edge with crinkle ridges, a few drying cracks and gas blisters; almost no height. Farben:
      //   dark green-brown mat, tan sand, white blisters.
      {
        name: 'Mikrobenmatten', ma: 3220, art: [
          { f: 'tan', d: 'M2 18 L26 18 L30 9.5 L30 18 L26 26.5 L2 26.5 Z' },
          { f: 'kelp', d: 'M2 18 L26 18 L30 9.5 L30 13 L26 21.5 L2 21.5 Z' },
          { f: 'black', d: 'M26 18 L30 9.5 L30 18 L26 26.5 Z', o: 0.3 },
          { f: 'olive', d: 'M6 10 C8 8.6 10 11.2 12 9.8 C14 8.6 16 11.2 18 9.8 C20 8.6 22 11.2 24 9.8 C26 8.6 28 10.8 30 9.6 L26 18.6 C24 20 22 17.6 20 19 C18 20.2 16 17.6 14 19 C12 20.2 10 17.6 8 19 C6 20 4 18.2 2 18.8 Z' },
          line('furDark', 1.8, 'M14.6 10.6 L13 14 L11.4 18.4'),
          line('furDark', 1.8, 'M23.2 10.6 L21.6 14.4 L19.8 18.4'),
          line('furDark', 1.8, 'M13 14 L21.6 14.4'),
          line('moss', 1.8, 'M6.4 15.6 C7.6 14 8.8 16.4 10.2 14.6'),
          line('moss', 1.8, 'M23.6 16 C24.6 14.4 25.8 16.6 27 14.8'),
          line('moss', 1.8, 'M15.8 12.2 C16.8 10.8 18 12.8 19.4 11.4'),
          { f: 'white', d: artCircle(9.4, 12.2, 1.9) },
          { f: 'white', d: artCircle(16.6, 16.4, 1.9) },
          { f: 'white', d: artCircle(26.2, 11.8, 1.6) },
        ],
      },
      // 5 · Cyanobakterien — vor 2700 Mio. J. (Oxygenic photosynthesis (Cyanobacteria); oxygen
      //   'whiffs' ~2.7-2.5 Ga, Great Oxidation Event ~2.4 Ga). Two or three curving bead-chain
      //   filaments of many small cells (Nostoc/Oscillatoria-like), one larger pale end cell, tiny
      //   O2 bubbles rising. Farben: blue-green cells, pale yellow end cell, white bubbles.
      {
        name: 'Cyanobakterien', ma: 2700, art: [
          ...filament([3.5, 12.5, 9, 1.5, 17, 22.5, 25.5, 9.5]),
          ...filament([4.5, 25, 11, 16, 19, 31, 27.5, 21.5]),
          { f: 'white', d: artCircle(13.6, 4.4, 1.6) },
          { f: 'white', d: artCircle(28.4, 3.2, 1.4) },
          { f: 'white', d: artCircle(21, 2.8, 1.2) },
        ],
      },
      // 6 · Schwefelbakterien — vor 2520 Mio. J. (Large Thiomargarita-like sulfur-oxidizing
      //   bacteria, 2.52 Ga Gamohaan Fm., South Africa (Czaja et al. 2016, Geology)). A short chain
      //   of 2-3 big glossy spheres sprinkled with bright sulfur granules; clearly fewer, larger and
      //   rounder than the cyanobacteria beads. Farben: pearly white spheres, sulfur-yellow dots,
      //   grey outline.
      {
        name: 'Schwefelbakterien', ma: 2520, art: [
          ...ball(6.8, 19.2, 5, 'grey', 'white'),
          ...ball(16.2, 14.2, 5, 'grey', 'white'),
          ...ball(25.4, 19, 5, 'grey', 'white'),
          { f: 'gold', d: artCircle(5, 18.4, 1.1) },
          { f: 'gold', d: artCircle(8, 20.6, 1.1) },
          { f: 'gold', d: artCircle(7.4, 16.6, 0.9) },
          { f: 'gold', d: artCircle(14.6, 13.4, 1.1) },
          { f: 'gold', d: artCircle(17.6, 15.6, 1.1) },
          { f: 'gold', d: artCircle(17, 11.6, 0.9) },
          { f: 'gold', d: artCircle(23.6, 18.2, 1.1) },
          { f: 'gold', d: artCircle(26.6, 20.4, 1.1) },
          { f: 'gold', d: artCircle(26, 16.4, 0.9) },
        ],
      },
      // 7 · Eisenbakterien — vor 1880 Mio. J. (Iron-oxidizing microbes of the Gunflint Chert, 1.88
      //   Ga (Barghoorn & Tyler 1965; Planavsky et al. 2009)). Two twisted ribbon stalks spiralling
      //   up from the ground like corkscrews, each topped by a small bean-shaped cell. Farben:
      //   rust-red/orange stalks, brown cells.
      {
        name: 'Eisenbakterien', ma: 1880, art: [
          ...stalk([9.5, 28, 7.5, 21, 13.5, 16, 11.2, 9]),
          ...stalk([21.5, 28, 19.5, 22.5, 25, 18.5, 23.2, 13]),
          { f: 'furDark', d: artEllipse(11.6, 6.6, 3.4, 2.5) },
          { f: 'fur', d: artEllipse(11, 6, 2.4, 1.6) },
          { f: 'furDark', d: artEllipse(23.8, 10.6, 3.4, 2.5) },
          { f: 'fur', d: artEllipse(23.2, 10, 2.4, 1.6) },
          { f: 'fur', d: 'M2 29.5 C3.5 26.6 8 26 12.5 27 C17 26.2 22 25.6 26.5 26.8 C28.6 27.4 30 28.4 30.5 29.5 Z' },
        ],
      },
      // 8 · Thrombolithen — vor 540 Mio. J. (Thrombolites (clotted microbialites with calcified
      //   microbes such as Epiphyton, Renalcis), common from latest Ediacaran/Cambrian). A bumpy
      //   cauliflower-like mound with dark clots and no layer lines, small branching microbial
      //   shrubs sprouting on top. Farben: cream-grey limestone, dark brown clots, pale green tips.
      {
        name: 'Thrombolithen', ma: 540, art: [
          line('bone', 1.8, 'M11.5 14 L11.2 9.6 M11.3 11.2 L8.8 8.6 M11.3 11.2 L13.8 8.8'),
          line('bone', 1.8, 'M18.5 10.5 L18.8 5.4 M18.7 7.6 L16.2 4.8 M18.7 7.6 L21.4 5.2'),
          line('bone', 1.8, 'M24.6 14.5 L25.6 10.6 M25.2 12 L27.8 10.4'),
          { f: 'grey', d: `${lobes(THROMBOLITE)} M3 24.5 L2.5 29.5 L29.5 29.5 L29 24.5 Z` },
          { f: 'bone', d: lobes(THROMBOLITE, -0.9, -1, 1.2) },
          { f: 'furDark', d: artCircle(8, 23.5, 1.4), o: 0.85 },
          { f: 'furDark', d: artCircle(13, 19, 1.3), o: 0.85 },
          { f: 'furDark', d: artCircle(19.5, 16.5, 1.3), o: 0.85 },
          { f: 'furDark', d: artCircle(22.5, 22, 1.5), o: 0.85 },
          { f: 'furDark', d: artCircle(15.5, 25.5, 1.4), o: 0.85 },
          { f: 'leafLight', d: artCircle(11.2, 9.4, 1.3) },
          { f: 'leafLight', d: artCircle(8.8, 8.6, 1.3) },
          { f: 'leafLight', d: artCircle(13.8, 8.8, 1.3) },
          { f: 'leafLight', d: artCircle(18.8, 5.2, 1.3) },
          { f: 'leafLight', d: artCircle(16.2, 4.8, 1.3) },
          { f: 'leafLight', d: artCircle(21.4, 5.2, 1.3) },
          { f: 'leafLight', d: artCircle(25.6, 10.4, 1.3) },
          { f: 'leafLight', d: artCircle(27.8, 10.4, 1.3) },
        ],
      },
    ],
    specialists: [
      // Tiefsee-Schlotmikroben — Hochsee, ab Unterart 1 (Chemolithotrophic bacteria and archaea at
      //   hydrothermal vents (black smokers); vent-related filaments ~3.2 Ga (Rasmussen 2000)). A
      //   black chimney puffing a dark smoke plume, its base coated in a white fluffy microbial mat.
      //   Farben: black chimney, dark grey smoke, white/yellow mat.
      {
        name: 'Tiefsee-Schlotmikroben', biome: Biome.Ocean, minStage: 0, art: [
          { f: 'greyDark', d: lobes(SMOKE) },
          { f: 'grey', d: lobes(SMOKE, -0.7, -0.8, 0.9) },
          { f: 'black', d: 'M9.5 29.5 L10.6 25.5 L9.6 23 L11.4 20 L10.8 17 L12.4 15.5 L12.8 13 L17.8 13 L18.4 15.8 L20.2 17.4 L19.4 20.4 L21.4 23 L20.6 25.6 L22 29.5 Z' },
          { f: 'greyDark', d: 'M9.5 29.5 L10.6 25.5 L9.6 23 L11.4 20 L10.8 17 L12.4 15.5 L12.8 13 L14.6 13 L14.2 17 L14.8 21.5 L14 25.5 L14.6 29.5 Z' },
          { f: 'white', d: `${lobes([[7.5, 27.4, 2.4], [10.8, 25.6, 2.2], [20.8, 25.8, 2.2], [24.4, 27.4, 2.4]])} M5.1 27.4 L5.1 29.6 L26.8 29.6 L26.8 27.4 Z` },
          { f: 'yellow', d: artCircle(8.4, 27.6, 1) },
          { f: 'yellow', d: artCircle(22.8, 27.8, 1) },
          { f: 'yellow', d: artCircle(15.8, 28.4, 0.9) },
        ],
      },
    ],
  };
}
