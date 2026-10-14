/* =============================================================================
 * SimEarth 2.0 — species art: Insekten (insects)
 * -----------------------------------------------------------------------------
 * One bold insect per icon, side view facing right with the feet on y ≈ 27.5;
 * the dragonfly, the roach and the leaf insect are seen from above, like other
 * flat creatures. Wings are flat blades in a lighter tone, legs and antennae
 * round-capped lines, the outline is left to the renderer.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;
  /** A leg, antenna or tail filament as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });

  /** Upper edge of a blade() in its own frame: (along, across) for t in 0..1. */
  function bladeEdge(t: number, len: number, half: number): [number, number] {
    const u = 1 - t;
    const along = 3 * u * u * t * 0.35 * len + 3 * u * t * t * len + t * t * t * len;
    const across = u * u * u * 0.4 * half + 3 * u * u * t * 1.25 * half + 3 * u * t * t * half;
    return [along, across];
  }

  /** Half-width of a blade at fraction `a` of its length. */
  function bladeHalf(a: number, len: number, half: number): number {
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2;
      if (bladeEdge(mid, len, half)[0] < a * len) lo = mid; else hi = mid;
    }
    return bladeEdge(lo, len, half)[1];
  }

  /** A wing, flap or femur from its root (bx, by) to a rounded tip (tx, ty), broadest (≈ w) two thirds out. */
  function blade(bx: number, by: number, tx: number, ty: number, w: number): string {
    const len = Math.hypot(tx - bx, ty - by);
    const ux = (tx - bx) / len;
    const uy = (ty - by) / len;
    const h = w / 2;
    const p = (a: number, b: number): string => `${r(bx + ux * a - uy * b)} ${r(by + uy * a + ux * b)}`;
    return `M${p(0, 0.4 * h)} C${p(0.35 * len, 1.25 * h)} ${p(len, h)} ${p(len, 0)} `
      + `C${p(len, -h)} ${p(0.35 * len, -1.25 * h)} ${p(0, -0.4 * h)} Z`;
  }

  /** A stripe across the same blade(), from fraction a0 to a1 of its length, kept inside its edge. */
  function band(bx: number, by: number, tx: number, ty: number, w: number, a0: number, a1: number): string {
    const len = Math.hypot(tx - bx, ty - by);
    const ux = (tx - bx) / len;
    const uy = (ty - by) / len;
    const h = w / 2;
    const p = (a: number, s: number): string => {
      const b = s * 0.92 * bladeHalf(a, len, h);
      return `${r(bx + ux * a * len - uy * b)} ${r(by + uy * a * len + ux * b)}`;
    };
    const am = (a0 + a1) / 2;
    return `M${p(a0, 1)} L${p(am, 1)} L${p(a1, 1)} L${p(a1, -1)} L${p(am, -1)} L${p(a0, -1)} Z`;
  }

  /** A leg in alternating colours, `n` pieces along a polyline. */
  function banded(a: PaletteKey, b: PaletteKey, w: number, pts: readonly [number, number][], n: number): ArtStroke[] {
    const seg: number[] = [];
    let total = 0;
    for (let k = 1; k < pts.length; k++) {
      const s = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      seg.push(s);
      total += s;
    }
    const at = (d: number): [number, number] => {
      for (let k = 0; k < seg.length; k++) {
        if (d <= seg[k] || k === seg.length - 1) {
          const f = Math.min(1, d / seg[k]);
          return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f];
        }
        d -= seg[k];
      }
      return pts[pts.length - 1];
    };
    const out: ArtStroke[] = [];
    for (let k = 0; k < n; k++) {
      const p0 = at((total * k) / n);
      const p1 = at((total * (k + 1)) / n);
      out.push(line(k % 2 === 0 ? a : b, w, `M${r(p0[0])} ${r(p0[1])} L${r(p1[0])} ${r(p1[1])}`));
    }
    return out;
  }

  /** A small locust of the swarm in flight, wing raised, `s` times a 10-unit one, centred on (x, y). */
  function flyer(x: number, y: number, s: number): Art {
    const at = (a: number, b: number): [number, number] => [x + a * s, y + b * s];
    return [
      { f: 'tan', d: blade(...at(0.5, -0.6), ...at(-5, -4.4), 3 * s) },
      { f: 'yellow', d: blade(...at(-6, 0.8), ...at(3, -0.3), 2.6 * s) },
      { f: 'yellow', d: artCircle(r(x + 3.6 * s), r(y - 0.6 * s), r(1.5 * s)) },
    ];
  }

  SPECIES[Life.Insect] = {
    stages: [
      // 1 · Urinsekten — vor 400 Mio. J. (Wingless hexapods; springtail Rhyniella praecursor
      //   (Rhynie Chert ~407 Ma); Rhyniognatha disputed). A tiny wingless insect with short antennae
      //   and a springing fork folded under the belly, crouched as if to jump. Farben: grey-violet,
      //   pale fork.
      {
        name: 'Urinsekten', ma: 400, art: [
          line('greyDark', 1.8, 'M25.2 16.4 C27 14.5 28.8 13.4 30.5 13'),
          line('greyDark', 1.8, 'M24 16 C24.8 13 26.5 10.5 28.5 9'),
          line('greyDark', 2, 'M15 23.2 L14 27.5'),
          line('greyDark', 2, 'M18 23 L18.8 27.5'),
          line('greyDark', 2, 'M21 22 L24.2 27'),
          line('cream', 2.2, 'M4.5 21.5 L8.5 27'),
          { f: 'greyDark', d: 'M3 19.5 C3 15.8 6.5 14.2 11 14.2 C15 14.2 18.5 15 21 16.5 L21.5 22.5 C17 23.8 10.5 24.2 6.5 23.6 C4.3 23.1 3 21.6 3 19.5 Z' },
          { f: 'violet', d: 'M3 19.5 C3 15.8 6.5 14.2 11 14.2 C15 14.2 18.5 15 21 16.5 L21.3 20.5 C17 21.5 9.5 21.8 3.2 20.6 Z', o: 0.5 },
          line('greyDark', 1.6, 'M8 15.8 C8.6 17 8.8 18.2 8.6 19.6'),
          line('greyDark', 1.6, 'M12.4 15.6 C13 16.8 13.2 18.2 13 19.8'),
          line('greyDark', 1.6, 'M16.6 16 C17.2 17.2 17.4 18.6 17.2 20.2'),
          { f: 'greyDark', d: artEllipse(23.2, 19, 3.4, 3.2) },
          { f: 'violet', d: 'M19.8 18.6 C20 16.6 21.4 15.8 23.2 15.8 C25 15.8 26.4 16.9 26.6 18.6 Z', o: 0.5 },
          { f: 'ink', d: artCircle(24.4, 18, 1.2) },
        ],
      },
      // 2 · Urflügler — vor 325 Mio. J. (Palaeodictyoptera, Delitzschala bitterfeldensis (~325 Ma,
      //   Germany), among the oldest winged insects). Two pairs of broad patterned wings spread
      //   flat, small winglet flaps behind the head, a piercing beak and two long tail filaments.
      //   Farben: brown body, wings with dark bands.
      {
        name: 'Urflügler', ma: 325, art: [
          line('furDark', 1.8, 'M8 19.5 C5.5 18 3.5 15 2 11'),
          line('furDark', 1.8, 'M8 20.5 C5.5 21.2 3.5 22.5 2 24.5'),
          line('furDark', 2, 'M13 21.3 L11 27.5'),
          line('furDark', 2, 'M16.5 21.6 L16.5 27.5'),
          line('furDark', 2, 'M20 21.3 L22 27.5'),
          { f: 'tan', d: blade(15.5, 18, 7.5, 4, 7) },
          { f: 'furDark', d: band(15.5, 18, 7.5, 4, 7, 0.5, 0.66) },
          { f: 'furDark', d: band(15.5, 18, 7.5, 4, 7, 0.86, 1) },
          { f: 'bone', d: blade(19, 18, 17.5, 2.5, 7) },
          { f: 'furDark', d: band(19, 18, 17.5, 2.5, 7, 0.5, 0.66) },
          { f: 'furDark', d: band(19, 18, 17.5, 2.5, 7, 0.86, 1) },
          { f: 'fur', d: 'M7 20 C7 18.5 10 17.6 14 17.6 L22 17.5 C23.5 17.6 24 19 23.5 20.5 C23 21.8 21 22.2 18 22 L12 21.8 C9.5 21.6 7 21.3 7 20 Z' },
          { f: 'fur', d: 'M20.5 17.8 L21.4 14.6 L23 17.6 Z' },
          { f: 'furDark', d: 'M24.5 20.5 L27 20.5 L26.6 25.5 Z' },
          { f: 'fur', d: artCircle(25, 18.5, 2.6) },
          { f: 'ink', d: artCircle(25.9, 17.8, 1) },
        ],
      },
      // 3 · Riesenlibellen — vor 318 Mio. J. (Meganisoptera (griffinflies) from ~318 Ma; Meganeura
      //   ~300 Ma, ~70 cm wingspan). A very long slim abdomen with four long narrow clear wings
      //   outstretched and big round eyes. Farben: metallic green-blue body, glassy wings.
      {
        name: 'Riesenlibellen', ma: 318, art: [
          { f: 'cyan', d: blade(18, 14.5, 12, 2.8, 6) },
          { f: 'cyan', d: blade(18, 17.5, 12, 29.2, 6) },
          { f: 'cyan', d: blade(20.2, 14.5, 21.5, 2.5, 5) },
          { f: 'cyan', d: blade(20.2, 17.5, 21.5, 29.5, 5) },
          { f: 'navy', d: artCircle(13.2, 5.5, 1) },
          { f: 'navy', d: artCircle(13.2, 26.5, 1) },
          { f: 'navy', d: artCircle(21.3, 5, 1) },
          { f: 'navy', d: artCircle(21.3, 27, 1) },
          line('teal', 2.8, 'M3 16 L17 16'),
          { f: 'blue', d: artCircle(3.2, 16, 1.5) },
          { f: 'teal', d: artEllipse(19.5, 16, 3.4, 2.8) },
          { f: 'blue', d: artCircle(24.4, 13.7, 2.5) },
          { f: 'blue', d: artCircle(24.4, 18.3, 2.5) },
          { f: 'teal', d: artEllipse(26.8, 16, 1.6, 1.6) },
        ],
      },
      // 4 · Schaben — vor 312 Mio. J. (Roachoids (stem Dictyoptera), Late Carboniferous ~315-310
      //   Ma; modern cockroaches later). A flat oval body with overlapping leathery wings, a head
      //   shield and long whip antennae sweeping forward. Farben: chestnut brown, amber edges.
      {
        name: 'Schaben', ma: 312, art: [
          line('furDark', 1.8, 'M26 14.8 C28.5 13.6 29.8 10.5 30.2 3.5'),
          line('furDark', 1.8, 'M26 17.2 C28.5 18.4 29.8 21.5 30.2 28.5'),
          line('furDark', 2.2, 'M20 11.5 L21.6 8.4'),
          line('furDark', 2.2, 'M14.5 10.6 L13 7.4'),
          line('furDark', 2.2, 'M8.5 11.2 L5.6 8.6'),
          line('furDark', 2.2, 'M20 20.5 L21.6 23.6'),
          line('furDark', 2.2, 'M14.5 21.4 L13 24.6'),
          line('furDark', 2.2, 'M8.5 20.8 L5.6 23.4'),
          { f: 'fur', d: artEllipse(12.5, 16, 10, 5.6) },
          { f: 'furDark', d: 'M20 16.3 C15.5 17.1 9 18.2 3.2 17.3 C4 20 7.8 21.6 12.5 21.6 C16.5 21.6 20 20.3 21.6 18 Z', o: 0.55 },
          { f: 'chitin', d: 'M19 10.9 C23.2 10.7 26.6 13 26.6 16 C26.6 19 23.2 21.3 19 21.1 C20.2 18.8 20.2 13.2 19 10.9 Z' },
          { f: 'fur', d: 'M20.8 12.8 C23.2 13 24.8 14.4 24.8 16 C24.8 17.6 23.2 19 20.8 19.2 C21.4 17.4 21.4 14.6 20.8 12.8 Z' },
        ],
      },
      // 5 · Heuschrecken — vor 300 Mio. J. (Orthoptera, Late Carboniferous ~300 Ma). A long body
      //   with big bent jumping hind legs, long antennae and wings folded along the back. Farben:
      //   leaf green, brown legs.
      {
        name: 'Heuschrecken', ma: 300, art: [
          line('fur', 1.8, 'M26.5 11.8 C28 8.5 29.5 6 30.5 3.5'),
          line('fur', 1.8, 'M25 11.5 C25.4 8.5 26.2 5.5 27 2.8'),
          line('fur', 2, 'M18.5 21.5 L17.5 27.5'),
          line('fur', 2, 'M22 21 L25 27.5'),
          { f: 'leafLight', d: 'M4 19 C4 17 7 15.8 11 15.6 L20 15 C22 15 23 16.5 23 18.5 C23 20.5 21.5 22 19 22 L10 22 C6.5 22 4 21 4 19 Z' },
          { f: 'leaf', d: 'M2.5 16.8 C6 15.2 13 14.4 21 14.6 C21.6 15.4 21.6 16.6 21 17.2 C14 17.2 7 17.8 2.5 17.8 Z' },
          { f: 'leafLight', d: 'M20.5 15.5 C21 12.5 23.5 11 26 11.2 C28 11.4 29 13 29 15.5 C29 18.5 28 21 26.5 21.6 C24.5 22 22.5 21 21.5 19.5 Z' },
          line('furDark', 2, 'M7.5 8.5 L10.8 27.5'),
          { f: 'fur', d: blade(7.5, 8.5, 17.5, 20, 5.5) },
          { f: 'ink', d: artCircle(25.8, 14.4, 1.3) },
        ],
      },
      // 6 · Käfer — vor 295 Mio. J. (Coleoptera, Coleopsis wendlingi (~295 Ma, Germany)). A domed
      //   oval with hard wing covers split down the middle, small head, short antennae, six legs.
      //   Farben: glossy black-blue with metallic sheen.
      {
        name: 'Käfer', ma: 295, art: [
          line('black', 1.8, 'M27.8 17 C28.8 15.2 29.2 13.8 29 12'),
          { f: 'black', d: artCircle(29, 11.6, 1.3) },
          line('black', 2.2, 'M9 22 L6.5 25 L4.5 28'),
          line('black', 2.2, 'M15 22.5 L14.5 28'),
          line('black', 2.2, 'M21 22 L23 25 L25 27.8'),
          { f: 'navy', d: 'M3.5 21.5 C3.5 14 9 8.5 15 8.5 C19.5 8.5 22.5 11.5 23 15 L23 22.5 C17 23.6 9 23.6 3.5 21.5 Z' },
          { f: 'blue', d: 'M3.6 21 C4.5 15 9 11 14.5 10.8 C18.5 10.7 21.5 12.6 22.6 15.6 L22.8 22.2 C17 23.2 9 23.2 3.6 21 Z' },
          line('black', 1.6, 'M4.6 18.5 C6.2 13.5 10.5 10.8 14.8 10.8 C18.5 10.8 21 12.6 22.2 15'),
          { f: 'sky', d: 'M6.5 18 C7.5 15 10 13 13.5 12.8 C11 14 9 15.8 8.3 18.5 Z', o: 0.7 },
          { f: 'black', d: 'M20.5 13.5 C22.5 12 25.5 12.5 26.5 15 C27.2 17.5 26.6 20.5 25 22 L20.5 22.5 Z' },
          { f: 'black', d: artCircle(27.2, 19, 2.3) },
        ],
      },
      // 7 · Gottesanbeterinnen — vor 130 Mio. J. (Mantodea, Early Cretaceous amber and limestone
      //   ~130-110 Ma (Burmantis, Santanmantis)). Upright posture with a long neck, triangular head
      //   and folded spiny raptorial forelegs held up in front. Farben: bright green.
      {
        name: 'Gottesanbeterinnen', ma: 130, art: [
          line('leaf', 1.6, 'M24.5 3.8 C26.5 2.6 28.5 2.4 30.5 3.2'),
          line('leaf', 1.8, 'M13.5 21.5 L10.5 24 L8.5 28'),
          line('leaf', 1.8, 'M15.5 20.5 L19.5 23.5 L20.5 28'),
          { f: 'frog', d: 'M2.5 21.5 C3 19.5 6 18.5 10 18.3 L15.5 18 C17 18.5 17 21 15.5 22 C11 23.5 6.5 23.8 4 23.2 C3 22.9 2.5 22.3 2.5 21.5 Z' },
          { f: 'leaf', d: 'M3 20 C6 18.6 11 17.8 16.2 17.6 L16.4 19.4 C11 19.6 6.5 20.3 3 21.4 Z' },
          { f: 'frog', d: 'M13.5 19.8 L19.8 8.2 L22.4 9.2 L16.8 20.6 Z' },
          { f: 'frog', d: 'M19 6 C19.6 4.2 21.8 3.2 24 3.4 L28 4.6 C27.6 6.6 26.4 9 25 11.2 C22.5 10.6 20.2 9.2 19 6 Z' },
          { f: 'frog', d: blade(19.8, 11, 26.2, 16.5, 3.8) },
          line('leaf', 1.8, 'M26.2 16.5 L23.6 11.5'),
          { f: 'ink', d: artCircle(25, 5.6, 1.3) },
        ],
      },
      // 8 · Ameisen — vor 100 Mio. J. (Formicidae, Cretaceous amber ~100-99 Ma (France, Myanmar)).
      //   Three distinct body beads (head, thorax, abdomen) joined by a narrow waist, elbowed
      //   antennae, six legs, walking. Farben: dark red-brown.
      {
        name: 'Ameisen', ma: 100, art: [
          line('furDark', 1.8, 'M25.5 11.5 L24.5 5.5 L30 8.5'),
          line('furDark', 2, 'M18 19 L14 23 L11.5 28'),
          line('furDark', 2, 'M20 19.5 L19.6 23 L20.5 28'),
          line('furDark', 2, 'M22 18.5 L25 22.5 L27 27.5'),
          { f: 'rust', d: 'M2.5 18.5 C2.5 15 5 13 8.5 13 C11.5 13 13 15 13 17.5 C13 20.5 10.5 22.5 7.5 22.5 C4.5 22.5 2.5 21 2.5 18.5 Z' },
          { f: 'furDark', d: 'M3.2 20.5 C6 21.4 10 21 12.6 19 C12 21 10 22.5 7.5 22.5 C5.5 22.5 4 21.8 3.2 20.5 Z', o: 0.6 },
          { f: 'rust', d: artEllipse(14.6, 17.6, 1.6, 1.9) },
          { f: 'rust', d: 'M16 17.5 C16 15 17.5 13.8 19.5 14 C21 14.2 21.5 15 22.5 14.8 L23.5 15.5 C23.5 17.5 22.5 19 21 19.5 L18 19.8 C16.8 19.8 16 18.8 16 17.5 Z' },
          { f: 'rust', d: artEllipse(25.5, 14.5, 3.5, 3.2) },
          { f: 'furDark', d: 'M28.2 16 L30.5 17.2 L28 18.4 Z' },
          { f: 'coral', d: 'M4.5 16.5 C5 15 6.5 14.2 8.5 14.2 C7 15 6 15.8 5.6 17.2 Z', o: 0.8 },
          { f: 'ink', d: artCircle(26.6, 13.8, 1.1) },
        ],
      },
    ],
    specialists: [
      // Termitenhügel — Offenland, ab Unterart 8 (Mound-building termites (Macrotermitinae);
      //   termites from ~130 Ma, fungus-growing mound builders ~30 Ma). A tall clay mound with a few
      //   chimney spires; tiny pale termites at its base. Farben: red-orange clay, pale termites.
      {
        name: 'Termitenhügel', biome: Biome.Grass, minStage: 7, art: [
          { f: 'chitin', d: 'M3.5 29 C5 27 5.5 24 6 20.5 C6.3 17 6.8 13.5 8.2 11.5 C9.2 10.4 10.4 10.8 10.8 12.5 L11.6 16 C12 11 12.6 6 14 3.6 C15 2 17 2 17.8 3.8 C19 7 19.4 11 19.8 15.5 L20.6 11.5 C21.2 9.6 22.9 9.4 23.5 11.2 C24.5 14.5 25 19 26 23 C26.6 25.5 27.5 27.5 28.5 29 Z' },
          { f: 'rust', d: 'M16 2.5 C17 2.6 17.5 3.2 17.8 3.8 C19 7 19.4 11 19.8 15.5 L20.6 11.5 C21 10.2 22 9.6 22.8 10 C21.6 12 21.5 15.5 21.4 19 C21.2 23 22.5 26.5 24 29 L15.8 29 C16.6 24 16.2 19 16.6 14 C16.9 9 16.7 5 16 2.5 Z', o: 0.55 },
          { f: 'rust', d: 'M23.3 10.8 C24.5 14.5 25 19 26 23 C26.6 25.5 27.5 27.5 28.5 29 L25 29 C24 26 23.6 21 23.6 16.5 C23.6 14 23.4 12 23.3 10.8 Z', o: 0.55 },
          { f: 'furDark', d: artEllipse(15.4, 18.5, 1.3, 1.7) },
          { f: 'furDark', d: artEllipse(9.8, 21.5, 1.1, 1.5) },
          { f: 'cream', d: artEllipse(9.5, 27, 2.2, 1.3) },
          { f: 'cream', d: artCircle(12.2, 26.6, 1.1) },
          { f: 'cream', d: artEllipse(20.2, 27, 2.2, 1.3) },
          { f: 'cream', d: artCircle(22.9, 26.6, 1.1) },
        ],
      },
      // Wüstenheuschrecken — Wüste, ab Unterart 8 (Schistocerca gregaria (desert locust) in its
      //   swarming phase). A dense diagonal swarm of small locusts over sand, one large locust in
      //   front. Farben: yellow-pink locusts, brown swarm haze.
      {
        name: 'Wüstenheuschrecken', biome: Biome.Desert, minStage: 7, art: [
          ...flyer(7, 10.5, 0.8),
          ...flyer(19.5, 6.5, 0.9),
          ...flyer(27.2, 13.5, 0.6),
          line('pink', 1.8, 'M18 25.8 L17.4 29'),
          line('pink', 1.8, 'M21 25.6 L23.6 29'),
          { f: 'yellow', d: 'M3.5 24 C3.5 22.4 6 21.4 9.5 21.2 L17.5 20.8 C19.5 20.8 20.5 22 20.5 23.6 C20.5 25.2 19.1 26.2 17 26.2 L9 26.2 C6 26.2 3.5 25.6 3.5 24 Z' },
          { f: 'tan', d: 'M2 22.4 C5 21 11 20.3 18.5 20.4 C19.1 21.2 19.1 22.2 18.5 22.8 C12 22.8 6 23.3 2 23.4 Z' },
          { f: 'yellow', d: 'M18.3 21.4 C18.7 19 20.7 17.8 22.9 18 C24.7 18.2 25.7 19.6 25.7 21.6 C25.7 24 24.7 26 23.3 26.4 C21.5 26.6 19.9 25.8 19.1 24.6 Z' },
          line('pink', 2, 'M8 15.5 L10.5 29'),
          { f: 'pink', d: blade(8, 15.5, 16, 24.5, 4.6) },
          line('tan', 1.6, 'M24 18.4 C26 17.4 28 17 30.5 17.2'),
          { f: 'ink', d: artCircle(23, 20.6, 1.1) },
        ],
      },
      // Wandelnde Blätter — Regenwald, ab Unterart 8 (Phylliidae; Eophyllium messelensis (Messel
      //   ~47 Ma, Germany)). An insect shaped exactly like a flat green leaf with leaf veins, small
      //   legs with leafy flaps. Farben: leaf green, yellow-brown edges.
      {
        name: 'Wandelnde Blätter', biome: Biome.Jungle, minStage: 7, art: [
          line('leaf', 1.8, 'M23.5 15 L26.5 12 L29.5 11'),
          line('leaf', 1.8, 'M23.5 17 L26.5 20 L29.5 21'),
          line('leaf', 1.8, 'M21 13.5 L22.5 9 L25 6.5'),
          line('leaf', 1.8, 'M21 18.5 L22.5 23 L25 25.5'),
          line('leaf', 1.8, 'M17.5 9 L19 4.5 L21.5 3'),
          line('leaf', 1.8, 'M17.5 23 L19 27.5 L21.5 29'),
          { f: 'leaf', d: blade(23.8, 14.6, 26.8, 11.8, 2.8) },
          { f: 'leaf', d: blade(23.8, 17.4, 26.8, 20.2, 2.8) },
          { f: 'leaf', d: blade(21.2, 12.8, 22.6, 8.6, 3) },
          { f: 'leaf', d: blade(21.2, 19.2, 22.6, 23.4, 3) },
          { f: 'leafLight', d: 'M2.5 16 C5 9.5 10.5 5.8 16.5 7 C19.5 7.8 21.2 11 21.6 14 L21.6 18 C21.2 21 19.5 24.2 16.5 25 C10.5 26.2 5 22.5 2.5 16 Z' },
          { f: 'leaf', d: 'M2.5 16 L21.6 16 L21.6 18 C21.2 21 19.5 24.2 16.5 25 C10.5 26.2 5 22.5 2.5 16 Z', o: 0.55 },
          { f: 'leafLight', d: 'M20.5 14 L25 14.6 L25 17.4 L20.5 18 Z' },
          { f: 'leafLight', d: artCircle(26.4, 16, 2) },
          line('leaf', 1.6, 'M4 16 L24 16'),
          line('leaf', 1.6, 'M9 16 L12.5 10.5'),
          line('leaf', 1.6, 'M14.5 16 L17.5 11'),
          line('leafLight', 1.6, 'M9 16 L12.5 21.5'),
          line('leafLight', 1.6, 'M14.5 16 L17.5 21'),
          { f: 'chitin', d: artEllipse(5.2, 18.2, 1.6, 1.3) },
          { f: 'chitin', d: artEllipse(17.8, 8.6, 1.5, 1.2) },
          { f: 'ink', d: artCircle(27.2, 14.9, 0.8) },
          { f: 'ink', d: artCircle(27.2, 17.1, 0.8) },
        ],
      },
      // Stechmücken — Sumpf, ab Unterart 8 (Culicidae, oldest in amber ~99 Ma). A thin mosquito
      //   with long dangling legs, narrow wings and a long piercing proboscis, hovering over water.
      //   Farben: dark grey, white leg bands.
      {
        name: 'Stechmücken', biome: Biome.Swamp, minStage: 7, art: [
          { f: 'sky', d: artEllipse(16, 28.6, 10, 1.6) },
          ...banded('greyDark', 'white', 1.8, [[19.5, 15], [22.5, 19], [25.5, 24.5]], 5),
          ...banded('greyDark', 'white', 1.8, [[18, 15.5], [17.5, 20], [17.8, 24.8]], 5),
          ...banded('greyDark', 'white', 1.8, [[16.5, 16], [11.5, 20.5], [8, 24.5]], 5),
          { f: 'grey', d: blade(17.5, 11.5, 6.5, 5.5, 3.6) },
          { f: 'greyDark', d: blade(16.5, 14, 4, 20.5, 3.4) },
          { f: 'greyDark', d: artEllipse(18.4, 13.2, 3, 2.6) },
          { f: 'greyDark', d: artCircle(22, 14, 1.9) },
          line('greyDark', 1.6, 'M23.5 15 L30 20.5'),
          { f: 'ink', d: artCircle(22.6, 13.4, 1) },
        ],
      },
    ],
  };
}
