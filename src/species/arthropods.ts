/* =============================================================================
 * SimEarth 2.0 — species art: Gliederfüßer des Meeres (arthropods)
 * -----------------------------------------------------------------------------
 * Sea arthropods from the Cambrian to today: the four flat Palaeozoic forms
 * in top view, head to the right, the later ones in side view on the sea floor
 * (the crab from the front). Flat chitin tones, the lower half a shade
 * darker, the outline left to the renderer.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;
  /** A limb, antenna or spike as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });

  /** Path data for an ellipse whose long axis runs from (x1, y1) to (x2, y2), `w` to each side. */
  function blade(x1: number, y1: number, x2: number, y2: number, w: number): string {
    const rx = r(Math.hypot(x2 - x1, y2 - y1) / 2);
    const rot = r((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI);
    return `M${x1} ${y1} A${rx} ${w} ${rot} 1 0 ${x2} ${y2} A${rx} ${w} ${rot} 1 0 ${x1} ${y1} Z`;
  }

  /** A small krill facing right, its eye at (x, y), scaled by `k`. */
  function krill(x: number, y: number, k: number): Art {
    const p = (dx: number, dy: number): string => `${r(x + dx * k)} ${r(y + dy * k)}`;
    return [
      { f: 'coral', d: `M${p(-9.4, 3)} L${p(-12, 5.8)} L${p(-8, 6)} Z` },
      { f: 'coral', d: `M${p(3, 0.6)} C${p(2.8, -1.4)} ${p(0.6, -2.2)} ${p(-2, -2)} C${p(-5, -1.8)} ${p(-8, -1)} ${p(-9.6, 0.8)} C${p(-10.4, 1.8)} ${p(-10.6, 3)} ${p(-10.2, 4.4)} L${p(-8.2, 3.8)} C${p(-7.6, 2.2)} ${p(-6, 1.8)} ${p(-3.6, 2)} C${p(-1, 2.2)} ${p(2, 2.2)} ${p(3, 0.6)} Z` },
      { f: 'pink', d: `M${p(-8.6, 0.2)} C${p(-6, -1.4)} ${p(-3, -1.8)} ${p(0, -1.4)} C${p(-3, -0.8)} ${p(-6, -0.4)} ${p(-8.6, 0.2)} Z` },
      { f: 'ink', d: artCircle(r(x + 0.6 * k), r(y - 0.2 * k), r(1.4 * k)) },
    ];
  }

  SPECIES[Life.Arthropod] = {
    stages: [
      // 1 · Trilobiten — vor 520 Mio. J. (Trilobita, from ~521 Ma (Cambrian Series 2)). Top view
      //   (flat organism), head to the right: three-lobed oval with a semicircular head shield, two
      //   crescent eyes, segmented body, small tail shield. Farben: slate grey-brown, lighter middle
      //   lobe.
      {
        name: 'Trilobiten', ma: 520, art: [
          { f: 'grey', d: 'M19.6 8.6 L5 4.4 L17 11.4 Z' },
          { f: 'greyDark', d: 'M19.6 23.4 L5 27.6 L17 20.6 Z' },
          { f: 'grey', d: 'M18.4 7.6 C23.4 6.8 28.8 10.2 28.8 16 C28.8 21.8 23.4 25.2 18.4 24.4 L9.6 22.2 C5.6 21.4 3.4 19 3.4 16 C3.4 13 5.6 10.6 9.6 9.8 Z' },
          { f: 'bone', d: 'M5.6 16 C5.6 14.8 7 14 9 13.8 L20 13.4 L20 18.6 L9 18.2 C7 18 5.6 17.2 5.6 16 Z' },
          { f: 'bone', d: artEllipse(23.6, 16, 3.6, 3.2) },
          line('greyDark', 1.6, 'M10.4 10.6 L10.4 13.4'),
          line('greyDark', 1.6, 'M13.6 9.8 L13.6 13.2'),
          line('greyDark', 1.6, 'M16.8 9 L16.8 13'),
          line('greyDark', 1.6, 'M10.4 18.6 L10.4 21.4'),
          line('greyDark', 1.6, 'M13.6 18.8 L13.6 22.2'),
          line('greyDark', 1.6, 'M16.8 19 L16.8 23'),
          line('grey', 1.6, 'M10.4 14.4 L10.4 17.6'),
          line('grey', 1.6, 'M13.6 14.2 L13.6 17.8'),
          line('grey', 1.6, 'M16.8 14 L16.8 18'),
          line('greyDark', 1.6, 'M19.8 8.2 C19 12 19 20 19.8 23.8'),
          { f: 'greyDark', d: 'M3.4 16 L28.8 16 C28.8 21.8 23.4 25.2 18.4 24.4 L9.6 22.2 C5.6 21.4 3.4 19 3.4 16 Z', o: 0.5 },
          { f: 'ink', d: artEllipse(22.2, 11.4, 1.6, 1.1) },
          { f: 'ink', d: artEllipse(22.2, 20.6, 1.6, 1.1) },
        ],
      },
      // 2 · Anomalocariden — vor 518 Mio. J. (Radiodonta (Anomalocaris, Chengjiang ~518 Ma),
      //   stem-group arthropods). Top view, head to the right: a long body with a row of
      //   overlapping swimming flaps along each side, two big stalked eyes, two curled grasping arms
      //   at the front, fan tail. Farben: reddish-brown body, salmon flaps with dark ribs.
      {
        name: 'Anomalocariden', ma: 518, art: [
          { f: 'rust', d: 'M8 15.2 L2 10.2 L4.2 15.4 Z' },
          { f: 'rust', d: 'M8 16.8 L2 21.8 L4.2 16.6 Z' },
          { f: 'coral', d: 'M26 14 Q24.8 10.4 22.2 10.6 Q20.8 8 18.2 9.2 Q16.4 7.4 14.2 9.2 Q12 8.4 10.6 10.8 Q8.4 11 7.4 13.6 L8 16 L26 16 Z' },
          { f: 'coral', d: 'M26 18 Q24.8 21.6 22.2 21.4 Q20.8 24 18.2 22.8 Q16.4 24.6 14.2 22.8 Q12 23.6 10.6 21.2 Q8.4 21 7.4 18.4 L8 16 L26 16 Z' },
          line('rust', 1.6, 'M22.2 13.6 L22.2 11.4'),
          line('rust', 1.6, 'M18.2 13.4 L18.2 10.2'),
          line('rust', 1.6, 'M14.2 13.4 L14.2 10.2'),
          line('rust', 1.6, 'M10.6 13.8 L10.6 11.8'),
          line('rust', 1.6, 'M22.2 18.4 L22.2 20.6'),
          line('rust', 1.6, 'M18.2 18.6 L18.2 21.8'),
          line('rust', 1.6, 'M14.2 18.6 L14.2 21.8'),
          line('rust', 1.6, 'M10.6 18.2 L10.6 20.2'),
          { f: 'rust', d: 'M6.6 16 C8 14 13 13.4 18.6 13.4 C23 13.4 26.4 14.4 27.6 16 C26.4 17.6 23 18.6 18.6 18.6 C13 18.6 8 18 6.6 16 Z' },
          { f: 'rust', d: 'M7.4 16 L26 16 L26 18 Q24.8 21.6 22.2 21.4 Q20.8 24 18.2 22.8 Q16.4 24.6 14.2 22.8 Q12 23.6 10.6 21.2 Q8.4 21 7.4 18.4 Z', o: 0.5 },
          line('coral', 2.2, 'M26.6 14.6 C29 12.6 31.2 13.4 30.6 15.4 C30.4 16 29.8 16.2 29.2 15.8'),
          line('coral', 2.2, 'M26.6 17.4 C29 19.4 31.2 18.6 30.6 16.6 C30.4 16 29.8 15.8 29.2 16.2'),
          line('rust', 2, 'M24.4 14 L26.4 9.8'),
          line('rust', 2, 'M24.4 18 L26.4 22.2'),
          { f: 'greyDark', d: artCircle(27, 8.6, 2.1) },
          { f: 'greyDark', d: artCircle(27, 23.4, 2.1) },
          { f: 'ink', d: artCircle(27.6, 8.4, 1.1) },
          { f: 'ink', d: artCircle(27.6, 23.6, 1.1) },
        ],
      },
      // 3 · Seeskorpione — vor 467 Mio. J. (Eurypterida, from ~467 Ma (Pentecopterus; Lamsdell et
      //   al. 2015)). Top view, head to the right: an elongated segmented body tapering to a spike
      //   tail, one pair of big oar-like swimming paddles and small claws at the front. Farben:
      //   olive-brown carapace, darker segment lines.
      {
        name: 'Seeskorpione', ma: 467, art: [
          line('kelp', 2, 'M28.4 14.4 L30.2 13'),
          line('furDark', 2, 'M28.4 17.6 L30.2 19'),
          line('kelp', 1.8, 'M25.2 11.4 L26 7.8'),
          line('furDark', 1.8, 'M25.2 20.6 L26 24.2'),
          line('kelp', 2, 'M22.4 11.8 L20 6.8'),
          line('furDark', 2, 'M22.4 20.2 L20 25.2'),
          { f: 'kelp', d: blade(20.4, 7.4, 14.4, 3.4, 1.9) },
          { f: 'furDark', d: blade(20.4, 24.6, 14.4, 28.6, 1.9) },
          { f: 'furDark', d: 'M6.4 15 L1.6 16 L6.4 17 Z' },
          { f: 'kelp', d: 'M21.8 11.4 C18.8 10.2 15.4 10.2 12.8 11.2 C10.4 12.2 8.4 13.6 6 14.4 L6 17.6 C8.4 18.4 10.4 19.8 12.8 20.8 C15.4 21.8 18.8 21.8 21.8 20.6 Z' },
          { f: 'kelp', d: 'M21 11.6 C22.6 10.8 25.6 10.8 27.6 12.2 C29 13.2 29.6 14.6 29.6 16 C29.6 17.4 29 18.8 27.6 19.8 C25.6 21.2 22.6 21.2 21 20.4 Z' },
          { f: 'tan', d: 'M22 11.6 C23.8 10.9 26 11 27.6 12.2 C28.6 13 29.2 14 29.4 15 C28 13.6 26 12.6 23.6 12.4 C23 12.3 22.4 12 22 11.6 Z' },
          { s: 'furDark', w: 1.6, d: 'M9.4 13.4 L9.4 18.6', o: 0.7 },
          { s: 'furDark', w: 1.6, d: 'M12.6 11.6 L12.6 20.4', o: 0.7 },
          { s: 'furDark', w: 1.6, d: 'M15.8 10.8 L15.8 21.2', o: 0.7 },
          { s: 'furDark', w: 1.6, d: 'M19 10.8 L19 21.2', o: 0.7 },
          { f: 'furDark', d: 'M6 16 L29.6 16 C29.6 17.4 29 18.8 27.6 19.8 C25.6 21.2 22.6 21.2 21 20.4 L21.8 20.6 C18.8 21.8 15.4 21.8 12.8 20.8 C10.4 19.8 8.4 18.4 6 17.6 Z', o: 0.5 },
          { f: 'ink', d: artEllipse(25.4, 13.6, 0.9, 1.1) },
          { f: 'ink', d: artEllipse(25.4, 18.4, 0.9, 1.1) },
        ],
      },
      // 4 · Pfeilschwanzkrebse — vor 445 Mio. J. (Xiphosura, Lunataspis aurora (~445 Ma, Late
      //   Ordovician)). Top view, head to the right: a domed horseshoe shield with a hinged rear
      //   part and a long straight tail spike pointing left. Farben: khaki-brown shield, dark tail.
      {
        name: 'Pfeilschwanzkrebse', ma: 445, art: [
          line('furDark', 2.4, 'M10 16 L1.8 16'),
          { f: 'kelp', d: 'M20 9.2 L12.6 11 L9 16 L12.6 21 L20 22.8 Z' },
          { f: 'kelp', d: 'M15.8 7.2 C19.2 4.2 24.2 3.8 27.2 6.8 C29.6 9.2 30.6 12.6 30.6 16 C30.6 19.4 29.6 22.8 27.2 25.2 C24.2 28.2 19.2 27.8 15.8 24.8 C17.2 23.6 18.6 23 19.8 22.8 L19.8 9.2 C18.6 9 17.2 8.4 15.8 7.2 Z' },
          { f: 'tan', d: 'M18 6.8 C21 5.2 24.6 5.4 26.8 7.6 C28.6 9.4 29.4 12.4 29.4 15 C28.2 12 26 9.6 23 8.6 C21.2 8 19.4 7.6 18 6.8 Z' },
          { s: 'furDark', w: 1.6, d: 'M19.9 10 L19.9 22', o: 0.7 },
          { f: 'furDark', d: 'M9 16 L30.6 16 C30.6 19.4 29.6 22.8 27.2 25.2 C24.2 28.2 19.2 27.8 15.8 24.8 C17.2 23.6 18.6 23 19.8 22.8 L20 22.8 L12.6 21 Z', o: 0.5 },
          { f: 'ink', d: artEllipse(24.2, 10.4, 1.1, 0.8) },
          { f: 'ink', d: artEllipse(24.2, 21.6, 1.1, 0.8) },
        ],
      },
      // 5 · Asselspinnen — vor 425 Mio. J. (Pycnogonida (sea spiders), Haliestes dasos
      //   (Herefordshire, ~425 Ma)). A tiny stick-like body on eight extremely long, jointed spindly
      //   legs, like a stilt walker. Farben: pale coral-red legs, darker joints.
      {
        name: 'Asselspinnen', ma: 425, art: [
          line('coral', 2.2, 'M20.4 14 L25.2 6.4 L29 16 L30.4 28.6'),
          line('coral', 2.2, 'M18 14 L20.6 4.8 L23.8 15.2 L24.4 28.6'),
          line('coral', 2.2, 'M14.6 14 L11.6 4.8 L8.2 15.2 L7.6 28.6'),
          line('coral', 2.2, 'M12.2 14 L6.8 6.4 L3 16 L1.6 28.6'),
          line('coral', 3, 'M11.4 14 L21.4 14'),
          line('coral', 3, 'M21.4 14.2 L27.6 15.6'),
          { f: 'coral', d: artCircle(18.8, 12.6, 1.6) },
          { f: 'rust', d: artCircle(25.2, 6.4, 1.4) },
          { f: 'rust', d: artCircle(20.6, 4.8, 1.4) },
          { f: 'rust', d: artCircle(11.6, 4.8, 1.4) },
          { f: 'rust', d: artCircle(6.8, 6.4, 1.4) },
          { f: 'rust', d: artCircle(29, 16, 1.2) },
          { f: 'rust', d: artCircle(23.8, 15.2, 1.2) },
          { f: 'rust', d: artCircle(8.2, 15.2, 1.2) },
          { f: 'rust', d: artCircle(3, 16, 1.2) },
          { f: 'ink', d: artCircle(19, 12.4, 0.9) },
        ],
      },
      // 6 · Zehnfußkrebse — vor 360 Mio. J. (Decapoda, Palaeopalaemon newberryi (Late Devonian
      //   ~360 Ma)). A lobster/shrimp body with a fan tail on the left, segmented abdomen, small
      //   claws and long antennae sweeping back. Farben: brick red, orange tips.
      {
        name: 'Zehnfußkrebse', ma: 360, art: [
          line('orange', 1.6, 'M26 14 C20 6 13 4 4 5.4'),
          line('orange', 1.6, 'M26.4 14.4 C22 9 18 8 12 9.4'),
          line('rust', 2, 'M17.4 21.6 L16.4 27.6'),
          line('rust', 2, 'M21 22 L20.6 28'),
          line('rust', 2, 'M24.4 21.4 L25 27.4'),
          { f: 'orange', d: 'M6.6 19.4 L2 14.6 L2.6 20.6 L3.4 25 Z' },
          { f: 'rust', d: 'M5.6 20.6 C6 17.6 9 16 13 15.6 L17 15.4 L17 22.2 C13 22.6 9.6 22.6 7.6 21.8 Z' },
          { f: 'rust', d: 'M15.4 15.6 C17.6 13.4 21.6 12.8 25 13.4 C27 13.8 28.6 14.8 30 16.4 C28.6 17 27.6 17.6 27.2 18.6 C26.6 21 23.6 22.4 20 22.6 C17.6 22.6 16 22.2 15.4 21.6 Z' },
          { f: 'coral', d: 'M16.6 15.8 C19 14.2 22.4 13.8 25.4 14.4 C22 14.8 19 15.4 16.6 16.8 Z' },
          line('coral', 1.6, 'M10.6 16.6 L11.2 21.6'),
          line('coral', 1.6, 'M7.8 17.8 L8.6 21.4'),
          line('rust', 2.2, 'M25.6 20.4 L28.4 23.4'),
          { f: 'orange', d: 'M27.4 22 C29 21.2 30.6 22 30.4 24 L28.6 23.8 L30 25.6 C28.6 26.6 26.8 25.6 26.8 24.2 Z' },
          { f: 'ink', d: artCircle(25.6, 15.8, 1.2) },
        ],
      },
      // 7 · Krabben — vor 185 Mio. J. (Brachyura, earliest true crabs Early Jurassic ~185-180 Ma
      //   (Eocarcinus, Eoprosopon)). Front-side view: a wide rounded shell with two big raised
      //   claws, short spiky legs and stalked eyes. Farben: orange-red shell, cream claw tips.
      {
        name: 'Krabben', ma: 185, art: [
          line('rust', 2, 'M8 19.4 L3.6 21 L2 26.4'),
          line('rust', 2, 'M9.4 21.6 L6.6 25 L6.6 29'),
          line('rust', 2, 'M24 19.4 L28.4 21 L30 26.4'),
          line('rust', 2, 'M22.6 21.6 L25.4 25 L25.4 29'),
          line('orange', 2.6, 'M10 15 L7.4 10.6'),
          line('orange', 2.6, 'M22 15 L24.6 10.6'),
          line('orange', 2, 'M14 13 L13.4 9.4'),
          line('orange', 2, 'M18 13 L18.6 9.4'),
          { f: 'orange', d: 'M5.5 18 C5.5 14 10 12.2 16 12.2 C22 12.2 26.5 14 26.5 18 C26.5 21.5 22 23.6 16 23.6 C10 23.6 5.5 21.5 5.5 18 Z' },
          { f: 'rust', d: 'M5.5 18 C9 19.6 23 19.6 26.5 18 C26.5 21.5 22 23.6 16 23.6 C10 23.6 5.5 21.5 5.5 18 Z', o: 0.6 },
          { f: 'orange', d: 'M4 10 C3.4 6.4 4.6 3.6 6.6 2.6 L7.6 6.4 L9.8 3.4 C11.4 5.6 11.2 9.4 9.6 11.2 C8 12.8 5 12.4 4 10 Z' },
          { f: 'orange', d: 'M28 10 C28.6 6.4 27.4 3.6 25.4 2.6 L24.4 6.4 L22.2 3.4 C20.6 5.6 20.8 9.4 22.4 11.2 C24 12.8 27 12.4 28 10 Z' },
          { f: 'cream', d: 'M5.2 4.4 C5.6 3.6 6 3 6.6 2.6 L7.1 4.6 Z' },
          { f: 'cream', d: 'M26.8 4.4 C26.4 3.6 26 3 25.4 2.6 L24.9 4.6 Z' },
          { f: 'cream', d: 'M9.8 3.4 C10.4 4.2 10.8 5 10.9 6 L9 5.4 Z' },
          { f: 'cream', d: 'M22.2 3.4 C21.6 4.2 21.2 5 21.1 6 L23 5.4 Z' },
          { f: 'ink', d: artCircle(13.4, 9.2, 1.4) },
          { f: 'ink', d: artCircle(18.6, 9.2, 1.4) },
        ],
      },
      // 8 · Seepocken — vor 80 Mio. J. (Balanomorpha (acorn barnacles), Late Cretaceous ~80 Ma
      //   (Gale & Sørensen 2014)). Two or three volcano-shaped cones on a rock, the largest sweeping
      //   a feathery fan of legs (cirri) out of its top. Farben: white-grey plates, brown feathery
      //   cirri, dark rock.
      {
        name: 'Seepocken', ma: 80, art: [
          line('fur', 1.8, 'M15 14 C11.4 11.4 9.4 8.4 10 5.6 C10.4 4.6 11.4 4.4 12 5'),
          line('fur', 1.8, 'M15.6 13.6 C14 10.4 14 6.4 16 4 C16.8 3.2 17.8 3.6 17.8 4.6'),
          line('fur', 1.8, 'M16.4 13.6 C17.6 10.6 19.4 8 22 6.8 C23 6.4 23.8 7 23.4 8'),
          line('fur', 1.8, 'M17.2 14 C19.6 12.4 22.6 11.4 25.4 11.8 C26.4 12 26.6 12.8 26 13.4'),
          { f: 'greyDark', d: 'M1.5 30 C2 27 5 25.4 9 25 C14 24.4 20 24.4 25 25 C28 25.4 30.2 27 30.5 30 Z' },
          { f: 'white', d: 'M2.6 26.8 L4.6 21 C5.6 20.2 7.4 20.2 8.4 21 L10.4 26.4 Z' },
          { f: 'white', d: 'M22.4 26.6 L24.6 21.4 C25.6 20.6 27.4 20.6 28.4 21.4 L30.2 26.8 Z' },
          { f: 'white', d: 'M8.6 25.6 L12.2 14.8 C14 13.4 18 13.4 19.8 14.8 L23.4 25.6 Z' },
          { f: 'grey', d: 'M16 14 C17.4 14 18.8 14.2 19.8 14.8 L23.4 25.6 L16 25.6 Z' },
          { f: 'grey', d: 'M6.5 20.4 C7.2 20.4 7.9 20.6 8.4 21 L10.4 26.4 L6.5 26.6 Z' },
          { f: 'grey', d: 'M26.5 20.8 C27.2 20.8 27.9 21 28.4 21.4 L30.2 26.8 L26.5 26.8 Z' },
          line('greyDark', 1.6, 'M13 15.6 L16 14.8 L19 15.6'),
          line('greyDark', 1.6, 'M5.4 21.2 L7.6 21.2'),
          line('greyDark', 1.6, 'M25.4 21.6 L27.6 21.6'),
        ],
      },
    ],
    specialists: [
      // Krill — Eis, ab Unterart 5 (Euphausiacea (e.g. Arctic krill Thysanoessa); Eucarida like
      //   the decapods, no secure fossils). A small swarm of 4-5 tiny translucent shrimp with dark
      //   eye dots beneath an ice edge. Farben: translucent pink-orange, black eyes, white ice.
      {
        name: 'Krill', biome: Biome.Arctic, minStage: 4, art: [
          { f: 'white', d: 'M1.5 2 L30.5 2 L30.5 6 L26 7.5 L21 6 L15 8 L9 6.2 L4 7.6 L1.5 6.5 Z' },
          { f: 'cyan', d: 'M1.5 6.5 L4 7.6 L9 6.2 L15 8 L21 6 L26 7.5 L30.5 6 L30.5 7.6 L26 9 L21 7.6 L15 9.6 L9 7.8 L4 9.2 L1.5 8 Z' },
          ...krill(14.6, 13.4, 0.9),
          ...krill(27.4, 17.6, 0.9),
          ...krill(16.4, 23.4, 0.9),
          ...krill(27, 27, 0.75),
        ],
      },
    ],
  };
}
