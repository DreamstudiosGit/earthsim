/* =============================================================================
 * SimEarth 2.0 — species art: Komplexe Zellen (eukaryotes)
 * -----------------------------------------------------------------------------
 * Single cells drawn large and centred on y ≈ 16, each told by its outline:
 * pseudopods, spines, collars, a shell, cilia, chambers, needles and a coin.
 * Soft bodies are violet or green, shells sand, chalk or glass.
 * ========================================================================== */

namespace SE {
  const r1 = (v: number): number => Math.round(v * 10) / 10;
  /** A thread, flagellum or needle as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });

  /** The point `len` units from (x, y) towards `deg` (0 = right, clockwise). */
  function toward(x: number, y: number, len: number, deg: number): [number, number] {
    const a = (deg * Math.PI) / 180;
    return [r1(x + len * Math.cos(a)), r1(y + len * Math.sin(a))];
  }

  /** A tapering lobe (pseudopod, spine) from (x, y) out along `deg`, with a round tip. */
  function lobe(x: number, y: number, deg: number, len: number, w0: number, w1: number): string {
    const [tx, ty] = toward(x, y, len, deg);
    const [ax, ay] = toward(x, y, w0 / 2, deg + 90);
    const [bx, by] = toward(tx, ty, w1 / 2, deg + 90);
    const [cx, cy] = toward(tx, ty, w1 / 2, deg - 90);
    const [dx, dy] = toward(x, y, w0 / 2, deg - 90);
    return `M${ax} ${ay} L${bx} ${by} A${w1 / 2} ${w1 / 2} 0 0 0 ${cx} ${cy} L${dx} ${dy} Z`;
  }

  /** An ellipse turned by `deg`. */
  function oval(x: number, y: number, rx: number, ry: number, deg: number): string {
    const [ax, ay] = toward(x, y, rx, deg + 180);
    const [bx, by] = toward(x, y, rx, deg);
    return `M${ax} ${ay} A${rx} ${ry} ${deg} 1 0 ${bx} ${by} A${rx} ${ry} ${deg} 1 0 ${ax} ${ay} Z`;
  }

  /** A line from radius `from` to `to` around (x, y) along `deg`. */
  function ray(x: number, y: number, from: number, to: number, deg: number): string {
    const [ax, ay] = toward(x, y, from, deg);
    const [bx, by] = toward(x, y, to, deg);
    return `M${ax} ${ay} L${bx} ${by}`;
  }

  /** A spiral line growing from radius `from` to `to` over `turns`, squashed to `squash` and turned by `deg`. */
  function spiral(x: number, y: number, from: number, to: number, turns: number, squash: number, deg: number): string {
    const steps = Math.round(turns * 20);
    const a = (deg * Math.PI) / 180;
    const pts: string[] = [];
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const phi = t * turns * 2 * Math.PI;
      const rr = from + (to - from) * t;
      const lx = rr * Math.cos(phi);
      const ly = rr * Math.sin(phi) * squash;
      pts.push(`${r1(x + lx * Math.cos(a) - ly * Math.sin(a))} ${r1(y + lx * Math.sin(a) + ly * Math.cos(a))}`);
    }
    return `M${pts.join(' L')}`;
  }

  /** A four-pointed glint of light. */
  function sparkle(x: number, y: number, r: number): string {
    const k = r1(r * 0.38);
    return `M${x} ${r1(y - r)} L${r1(x + k)} ${r1(y - k)} L${r1(x + r)} ${y} L${r1(x + k)} ${r1(y + k)} L${x} ${r1(y + r)} L${r1(x - k)} ${r1(y + k)} L${r1(x - r)} ${y} L${r1(x - k)} ${r1(y - k)} Z`;
  }

  /** Seven stubby spines around the cyst wall. */
  const cystSpines: Art = [0, 1, 2, 3, 4, 5, 6].map((k): ArtShape => ({ f: 'fur', d: lobe(15.5, 16.5, 25 + k * 47, 12, 3.8, 2.2) }));

  /** Eight silica needles, the diagonal ones a little longer. */
  const radiolarianNeedles: Art = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => line('white', 1.8, ray(16, 16, 6, k % 2 ? 13.4 : 12.8, k * 45 + 22.5)));

  /** Cilia standing out from a slipper of 11 x 5.6 around (16, 16). */
  const ciliateFringe: Art = Array.from({ length: 14 }, (_, k) => {
    const phi = (k / 14) * 2 * Math.PI;
    const [ex, ey] = [16 + 11 * Math.cos(phi), 16 + 5.6 * Math.sin(phi)];
    const n = Math.hypot(Math.cos(phi) / 11, Math.sin(phi) / 5.6);
    const [ux, uy] = [Math.cos(phi) / 11 / n, Math.sin(phi) / 5.6 / n];
    return line('scale', 1.6, `M${r1(ex - ux * 0.8)} ${r1(ey - uy * 0.8)} L${r1(ex + ux * 3)} ${r1(ey + uy * 3)}`);
  });

  /** Three collared cells around (15, 16), each with its funnel and flagellum pointing out. */
  const choanoRosette: Art = [-10, 110, 230].flatMap((deg): ArtShape[] => {
    const [cx, cy] = toward(15, 16, 4.6, deg);
    const [nx, ny] = toward(15, 16, 4.2, deg);
    const [m0x, m0y] = toward(15, 16, 7.6, deg);
    const [m1x, m1y] = toward(15, 16, 11.2, deg);
    const [ax, ay] = toward(m0x, m0y, 1.6, deg + 90);
    const [bx, by] = toward(m1x, m1y, 3.2, deg + 90);
    const [ccx, ccy] = toward(m1x, m1y, 3.2, deg - 90);
    const [dx, dy] = toward(m0x, m0y, 1.6, deg - 90);
    const [f0x, f0y] = toward(15, 16, 10, deg);
    const [f1x, f1y] = toward(15, 16, 12.4, deg + 9);
    const [f2x, f2y] = toward(15, 16, 14.4, deg - 3);
    return [
      line('navy', 1.6, `M${f0x} ${f0y} Q${f1x} ${f1y} ${f2x} ${f2y}`),
      { f: 'sky', d: `M${ax} ${ay} L${bx} ${by} L${ccx} ${ccy} L${dx} ${dy} Z` },
      { f: 'cream', d: oval(cx, cy, 4.2, 3.3, deg) },
      { f: 'bone', d: artCircle(nx, ny, 1.3) },
    ];
  });

  SPECIES[Life.Eukaryote] = {
    stages: [
      // 1 · Amöben — vor 1800 Mio. J. (Early amoeboid eukaryotes; oldest eukaryote microfossils
      //   ~1.75-1.65 Ga (Changcheng, Roper groups)). A soft irregular blob with 3-4 finger-like
      //   pseudopods reaching right, a dark nucleus and a small vacuole. Farben: translucent
      //   grey-violet body, dark violet nucleus.
      {
        name: 'Amöben', ma: 1800, art: [
          { f: 'violet', d: lobe(15, 13, -42, 12.5, 6.5, 3.8) },
          { f: 'violet', d: lobe(17, 16.5, 4, 10.5, 6.5, 4.2) },
          { f: 'violet', d: lobe(14.5, 19.5, 50, 9.5, 6, 3.8) },
          { f: 'violet', d: lobe(7, 20.5, 135, 3.5, 5.5, 4) },
          { f: 'violet', d: artEllipse(12, 16, 8, 7.5) },
          { f: 'violet', d: artEllipse(17, 16, 4, 5.5) },
          { f: 'pink', d: artEllipse(10.5, 12, 4, 2.2), o: 0.55 },
          { f: 'navy', d: artCircle(11, 16.5, 3), o: 0.7 },
          { f: 'cyan', d: artCircle(15.6, 20.4, 1.5) },
        ],
      },
      // 2 · Stachelzysten — vor 1650 Mio. J. (Ornamented acritarchs, resting cysts of early
      //   eukaryotes: Tappania, Shuiyousphaeridium (~1.65-1.6 Ga)). A rigid round cyst with a ring
      //   of short stubby spines and one larger bulge; no pseudopods. Farben: amber-brown wall,
      //   darker spines.
      {
        name: 'Stachelzysten', ma: 1650, art: [
          ...cystSpines,
          { f: 'chitin', d: artCircle(23, 11, 4) },
          { f: 'chitin', d: artCircle(15.5, 16.5, 8) },
          { f: 'yellow', d: 'M9 15 C9.5 11.5 12 9.5 15.5 9.3 C13 10.8 11 12.6 9 15 Z', o: 0.7 },
          { f: 'fur', d: 'M23.5 16.5 C23.5 21 20 24.5 15.5 24.5 C12.5 24.5 10 23 8.8 21 C13 22.5 18.5 21.5 23.5 16.5 Z', o: 0.55 },
        ],
      },
      // 3 · Kragengeißeltierchen — vor 800 Mio. J. (Choanoflagellates, closest living relatives of
      //   animals; no fossils, molecular estimate >=800 Ma). Three small oval cells joined in a
      //   rosette, each with a funnel-shaped collar and one long flagellum. Farben: pale cream
      //   cells, light blue collars, thin dark flagella.
      { name: 'Kragengeißeltierchen', ma: 800, art: choanoRosette },
      // 4 · Vasenamöben — vor 742 Mio. J. (Vase-shaped microfossils = testate amoebae
      //   (Arcellinida), Chuar Group ~742 Ma (Porter & Knoll 2000)). A tilted vase/flask shell with
      //   its mouth to the right and two short pseudopods poking out. Farben: sandy brown shell with
      //   grain dots, grey-violet pseudopods.
      {
        name: 'Vasenamöben', ma: 742, art: [
          { f: 'violet', d: lobe(25.2, 16, -8, 3.8, 3.8, 3) },
          { f: 'violet', d: lobe(24.2, 20, 55, 5, 3.8, 3) },
          { f: 'sand', d: 'M26.4 14 C25.1 14.2 23.8 14.2 22.5 13.9 C21 13.5 20.8 11.4 20.3 10.2 C19.2 7.3 17.1 5.9 14.8 5.2 C10 3.7 5.9 6.5 4.4 11.3 C2.8 16 4.5 20.8 9.2 22.3 C11.5 23.1 14 23.2 16.6 21.6 C17.7 20.9 19.2 19.2 20.5 19.8 C21.8 20.3 22.9 21.1 23.8 22 C25.3 20.2 26.5 16.4 26.4 14 Z' },
          { f: 'fur', d: 'M19.1 16.1 C17.6 20.8 13 23.6 9.2 22.3 C5.9 21.2 3.9 18.5 3.7 15.3 C7.1 19 13 20.4 19.1 16.1 Z', o: 0.35 },
          { f: 'furDark', d: oval(24.9, 18, 3.4, 1.2, 108) },
          { f: 'fur', d: artCircle(10.1, 10, 0.9) },
          { f: 'fur', d: artCircle(15, 9.5, 0.9) },
          { f: 'fur', d: artCircle(11.7, 14.7, 0.9) },
          { f: 'fur', d: artCircle(16.6, 14.2, 0.9) },
          { f: 'fur', d: artCircle(7.3, 15.4, 0.9) },
        ],
      },
      // 5 · Wimpertierchen — vor 580 Mio. J. (Ciliates; ciliate-like microfossils, Doushantuo Fm.
      //   ~580 Ma (Li et al. 2007, PNAS; contested)). A slipper-shaped cell (Paramecium) pointing
      //   right, fringed all round with short hair lines and an oral groove. Farben: pale
      //   green-yellow body, darker fringe.
      {
        name: 'Wimpertierchen', ma: 580, art: [
          ...ciliateFringe,
          { f: 'moss', d: 'M5 16.5 C5 12.5 8 10.5 12 10.5 C17 10.5 22 10.2 25 11.6 C27.3 12.7 28 15 27.4 16.8 C26.6 18.8 24.5 19.6 22.5 19.4 C20.5 19.2 19 18.6 17 19.4 C15 20.6 14.5 21.6 12 21.6 C8 21.6 5 20 5 16.5 Z' },
          { f: 'straw', d: 'M7.5 14.5 C8.5 12.5 11 11.8 14 11.8 C18 11.8 21 11.8 23 12.5 C19 13 13 13.2 7.5 14.5 Z', o: 0.8 },
          line('olive', 1.8, 'M25.5 16.8 C22.5 17.6 19.5 17.2 16.8 15.8'),
        ],
      },
      // 6 · Foraminiferen — vor 530 Mio. J. (Foraminifera; earliest agglutinated forms early
      //   Cambrian ~535-530 Ma). A spiral shell of 4-5 chambers growing in size, a web of very thin
      //   pseudopod threads radiating from the opening. Farben: chalk-white shell, peach chambers,
      //   fine white threads.
      {
        name: 'Foraminiferen', ma: 530, art: [
          line('white', 1.6, 'M21 14 C24 11 26 8 28.5 5'),
          line('white', 1.6, 'M22 15.5 C25 14.5 27.5 13.5 30 13'),
          line('white', 1.6, 'M22 18.5 C25 19.5 27.5 20.5 29.5 21'),
          line('white', 1.6, 'M21 20 C23.5 22.5 25 25 26.5 28'),
          { f: 'white', d: artCircle(12.8, 16.1, 2.0) },
          { f: 'coral', d: artCircle(12.9, 16.3, 1.1), o: 0.6 },
          { f: 'white', d: artCircle(11.6, 18.2, 2.6) },
          { f: 'coral', d: artCircle(11.8, 18.5, 1.6), o: 0.6 },
          { f: 'white', d: artCircle(8.6, 15.4, 3.3) },
          { f: 'coral', d: artCircle(8.8, 15.7, 2.2), o: 0.6 },
          { f: 'white', d: artCircle(12.8, 11.5, 4.2) },
          { f: 'coral', d: artCircle(13, 11.8, 3), o: 0.6 },
          { f: 'white', d: artCircle(17.5, 17, 5.4) },
          { f: 'coral', d: artCircle(17.8, 17.4, 4.1), o: 0.6 },
        ],
      },
      // 7 · Strahlentierchen — vor 510 Mio. J. (Radiolaria (silica skeletons), Cambrian ~515-509
      //   Ma). Radially symmetric: a lace-like lattice sphere with hexagonal holes and 6-8 long
      //   straight needles radiating outward. Farben: glassy pale blue lattice, white needles.
      {
        name: 'Strahlentierchen', ma: 510, art: [
          ...radiolarianNeedles,
          { f: 'cyan', d: artCircle(16, 16, 8) },
          { f: 'sky', d: 'M24 16 C24 20.5 20.5 24 16 24 C13 24 10.5 22.5 9 20 C14 21 20 20 24 16 Z', o: 0.6 },
          { f: 'teal', d: artCircle(16, 16, 1.5), o: 0.8 },
          { f: 'teal', d: artCircle(20, 16, 1.4), o: 0.8 },
          { f: 'teal', d: artCircle(12, 16, 1.4), o: 0.8 },
          { f: 'teal', d: artCircle(18, 12.5, 1.4), o: 0.8 },
          { f: 'teal', d: artCircle(14, 12.5, 1.4), o: 0.8 },
          { f: 'teal', d: artCircle(18, 19.5, 1.4), o: 0.8 },
          { f: 'teal', d: artCircle(14, 19.5, 1.4), o: 0.8 },
        ],
      },
      // 8 · Nummuliten — vor 56 Mio. J. (Nummulites, giant benthic foraminifera from ~58-56 Ma;
      //   nummulitic limestone of the Giza pyramids). A large flat coin/lens, slightly tilted, its
      //   face showing a tight spiral of many small chambers. Farben: sandy beige, brown spiral
      //   lines.
      {
        name: 'Nummuliten', ma: 56, art: [
          { f: 'tan', d: oval(16, 18, 13, 9, -18) },
          { f: 'sand', d: oval(16, 16, 13, 9, -18) },
          line('furDark', 1.6, spiral(16, 16, 1, 10.5, 3, 9 / 13, -18)),
        ],
      },
    ],
    specialists: [
      // Meeresleuchttierchen — Küstenmeer, ab Unterart 8 (Noctiluca scintillans, heterotrophic
      //   dinoflagellate; dinoflagellates from ~240 Ma). A glowing balloon-shaped cell with one
      //   short tentacle, surrounded by blue light sparkles on dark water. Farben: translucent pink
      //   cell, electric blue glow, dark navy water.
      {
        name: 'Meeresleuchttierchen', biome: Biome.Coast, minStage: 7, art: [
          { f: 'navy', d: artCircle(16, 16.5, 11) },
          { f: 'cyan', d: artCircle(15.5, 16, 9.5), o: 0.35 },
          line('shell', 2.2, 'M20.5 21 C22.5 22.5 23 25 22 28'),
          { f: 'pink', d: artCircle(15.5, 16, 7.5) },
          { f: 'shell', d: 'M23 16 C23 20.2 19.6 23.5 15.5 23.5 C12.7 23.5 10.3 22 9 19.8 C13.5 21.2 19.2 20.2 23 16 Z', o: 0.6 },
          { f: 'cyan', d: sparkle(7.6, 9.4, 3.8) },
          { f: 'cyan', d: sparkle(25, 10.2, 3.4) },
          { f: 'cyan', d: sparkle(5.8, 22.5, 2.8) },
        ],
      },
    ],
  };
}
