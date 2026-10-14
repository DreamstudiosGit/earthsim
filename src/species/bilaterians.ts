/* =============================================================================
 * SimEarth 2.0 — species art: Frühe Zweiseitentiere (bilaterians)
 * -----------------------------------------------------------------------------
 * Worms and other early bilaterians, each stage with its own body plan so the
 * eight never read as one worm recoloured: a burrow trail, stacked chalk tubes,
 * a spiny proboscis, a finned arrow, legs under back spikes, bristle tufts, a
 * feather crown and plumes on a bone. Sea-floor dwellers sit on a strip of
 * sediment or rock; the swimmers and crawlers float free.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;
  const pt = (x: number, y: number): string => `${r(x)} ${r(y)}`;
  /** A limb, trail or tube as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });
  /** The point `d` units from (x, y) at angle `a` degrees (0 = right, 90 = down). */
  const polar = (x: number, y: number, a: number, d: number): string =>
    pt(x + d * Math.cos((a * Math.PI) / 180), y + d * Math.sin((a * Math.PI) / 180));

  /**
   * A Cloudina tube: `n` funnels stacked cone in cone from its foot (x, y)
   * upwards, each rim `rim` units wide on either side, bending by `bend`.
   */
  function cloudina(x: number, y: number, n: number, h: number, rim: number, bend: number): Art {
    const out: ArtShape[] = [];
    const at = (k: number): number => x + bend * (0.5 * k + 0.15 * k * k);
    out.push({ f: 'pink', d: artEllipse(at(n), y - n * h - 0.6, rim * 0.55, 2.2) });
    for (let k = n - 1; k >= 0; k--) {
      const yb = y - k * h;
      const yt = yb - h - 0.8;
      const xb = at(k);
      const xt = at(k + 1);
      const ym = yb - 0.45 * (h + 0.8);
      const xm = (xb + xt) / 2;
      const wm = 1.7 + 0.45 * (rim - 1.7);
      out.push({ f: 'white', d: `M${pt(xb - 1.7, yb)} L${pt(xt - rim, yt)} L${pt(xt + rim, yt)} L${pt(xb + 1.7, yb)} Z` });
      out.push({ f: 'grey', d: `M${pt(xb - 1.7, yb)} L${pt(xm - wm, ym)} L${pt(xm + wm, ym)} L${pt(xb + 1.7, yb)} Z` });
      out.push({ f: 'grey', d: `M${pt(xb, yb)} L${pt(xt, yt)} L${pt(xt + rim, yt)} L${pt(xb + 1.7, yb)} Z`, o: 0.5 });
    }
    return out;
  }

  /** A cubic Bézier's point at t with its unit normal (pointing left of the direction of travel). */
  function onCurve(p: readonly number[], t: number): { x: number; y: number; nx: number; ny: number } {
    const u = 1 - t;
    const x = u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6];
    const y = u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7];
    const dx = 3 * u * u * (p[2] - p[0]) + 6 * u * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4]);
    const dy = 3 * u * u * (p[3] - p[1]) + 6 * u * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5]);
    const len = Math.hypot(dx, dy);
    return { x, y, nx: dy / len, ny: -dx / len };
  }

  /** The priapulid: a ringed body rising from its burrow, a spiny proboscis on top. */
  function priapulid(): Art {
    const body = [9, 25.5, 9, 20.5, 12.5, 16.5, 18, 14.5];
    const rings = [0.4, 0.55, 0.7, 0.85].map((t) => {
      const c = onCurve(body, t);
      return line('fur', 1.6, `M${pt(c.x + c.nx * 3.4, c.y + c.ny * 3.4)} L${pt(c.x - c.nx * 3.4, c.y - c.ny * 3.4)}`);
    });
    const cx = 21.8;
    const cy = 12.6;
    const spines: ArtShape[] = [-135, -95, -55, -15, 25, 65].map((a) => ({
      f: 'furDark',
      d: `M${polar(cx, cy, a - 20, 3.2)} L${polar(cx, cy, a, 7.6)} L${polar(cx, cy, a + 20, 3.2)} Z`,
    }));
    return [
      line('tan', 8, `M${pt(body[0], body[1])} C${body.slice(2).map(r).join(' ')}`),
      ...rings,
      ...spines,
      { f: 'tan', d: artCircle(cx, cy, 3.8) },
      { f: 'fur', d: `M${polar(cx, cy, -40, 3.8)} A3.8 3.8 0 0 1 ${polar(cx, cy, 140, 3.8)} Z`, o: 0.5 },
      { f: 'greyDark', d: 'M2 29.5 L2 25 C4 23 9 22.5 12.5 24.5 C15.5 26.2 22 26.5 30 26.2 L30 29.5 Z' },
    ];
  }

  /** Centre line of the ragworm: one full undulation, head end rising. */
  const wave = (x: number): number => 16.5 - 2.4 * Math.sin(((x - 3.5) / 22) * 2 * Math.PI);
  function waveNormal(x: number): { x: number; y: number; nx: number; ny: number } {
    const m = -2.4 * ((2 * Math.PI) / 22) * Math.cos(((x - 3.5) / 22) * 2 * Math.PI);
    const len = Math.hypot(1, m);
    return { x, y: wave(x), nx: -m / len, ny: 1 / len };
  }

  /** The ragworm: a wavy segmented body with a bristle tuft on each side of every segment. */
  function ragworm(): Art {
    const spine: string[] = [];
    for (let x = 3.5; x <= 25.55; x += 1) spine.push(pt(x, wave(x)));
    const tufts: ArtShape[] = [];
    for (const x of [6, 10.5, 15, 19.5, 23.5]) {
      const c = waveNormal(x);
      const tx = c.ny;
      const ty = -c.nx;
      for (const side of [1, -1]) {
        const nx = c.nx * side;
        const ny = c.ny * side;
        tufts.push({
          f: 'yellow',
          d: `M${pt(c.x - tx * 1.3 + nx * 1.6, c.y - ty * 1.3 + ny * 1.6)} L${pt(c.x - tx * 0.6 + nx * 5.4, c.y - ty * 0.6 + ny * 5.4)} L${pt(c.x + tx * 1.3 + nx * 1.6, c.y + ty * 1.3 + ny * 1.6)} Z`,
        });
      }
    }
    const bands = [8.25, 12.75, 17.25, 21.5].map((x) => {
      const c = waveNormal(x);
      return line('rust', 1.6, `M${pt(c.x + c.nx * 2.2, c.y + c.ny * 2.2)} L${pt(c.x - c.nx * 2.2, c.y - c.ny * 2.2)}`);
    });
    const head = waveNormal(25.5);
    return [
      ...tufts,
      line('red', 1.6, `M${pt(head.x, head.y)} L${polar(head.x, head.y, -62, 4)}`),
      line('red', 1.6, `M${pt(head.x, head.y)} L${polar(head.x, head.y, -8, 4)}`),
      line('red', 5, `M${spine.join(' L')}`),
      ...bands,
      { f: 'ink', d: artCircle(head.x - 0.2, head.y - 0.9, 0.9) },
    ];
  }

  /** The serpulid's crown: a fan of feathery radioles opening upwards from (x, y). */
  function crown(x: number, y: number): Art {
    const tips = 7;
    const from = -145;
    const to = -35;
    const step = (to - from) / (tips - 1);
    const edge: string[] = [];
    for (let k = 0; k < tips; k++) {
      if (k > 0) edge.push(polar(x, y, from + (k - 0.5) * step, 8.4));
      edge.push(polar(x, y, from + k * step, 13));
    }
    return [
      { f: 'red', d: `M${pt(x, y)} L${edge.join(' L')} Z` },
      { f: 'white', d: `M${polar(x, y, from, 7.4)} A7.4 7.4 0 0 1 ${polar(x, y, to, 7.4)} L${polar(x, y, to, 5)} A5 5 0 0 0 ${polar(x, y, from, 5)} Z` },
    ];
  }

  /** An Osedax plume: narrow where it leaves the bone at (bx, by), round at its tip (tx, ty). */
  function plume(bx: number, by: number, tx: number, ty: number): Art {
    const len = Math.hypot(tx - bx, ty - by);
    const ux = (tx - bx) / len;
    const uy = (ty - by) / len;
    const nx = -uy;
    const ny = ux;
    const at = (along: number, side: number): string => pt(bx + ux * along + nx * side, by + uy * along + ny * side);
    const tipL = pt(tx - nx * 2.4, ty - ny * 2.4);
    const tipR = pt(tx + nx * 2.4, ty + ny * 2.4);
    return [{
      f: 'red',
      d: `M${at(0, -0.9)} C${at(len * 0.45, -2.8)} ${tipL} ${pt(tx, ty)} C${tipR} ${at(len * 0.45, 2.8)} ${at(0, 0.9)} Z`,
    }];
  }

  SPECIES[Life.Bilateria] = {
    stages: [
      // 1 · Urwürmer — vor 560 Mio. J. (Ikaria wariootia (~560-555 Ma; Evans et al. 2020, PNAS)
      //   and its burrows (Helminthoidichnites)). A tiny rice-grain body with a slightly thicker
      //   head end, leaving a wavy burrow trail behind it to the left. Farben: pinkish-beige body,
      //   darker trail in grey sediment.
      {
        name: 'Urwürmer', ma: 560, art: [
          { f: 'grey', d: 'M2 27.2 C2 25.6 3.6 24.6 6.5 24.6 L25.5 24.6 C28.4 24.6 30 25.6 30 27.2 C30 28.7 29 29.5 27 29.5 L5 29.5 C3 29.5 2 28.7 2 27.2 Z' },
          line('black', 2.2, 'M4.6 27.2 C6 25.8 7.8 25.8 9.2 27.2 C10.6 28.6 12.4 28.6 13.8 27.2 C14.6 26.4 15.4 26.2 16.4 26.2'),
          { f: 'blossom', d: 'M13.5 23 C15 19.8 20 18 24.6 18 C28 18 30 19.6 30 21.6 C30 23.6 28.4 24.9 25.6 24.9 C21.6 24.9 18.4 24.8 15.6 25.2 C14.2 25.2 13.5 24.3 13.5 23 Z' },
          { f: 'shell', d: 'M14.2 24 C18 23 24 23.2 29.8 22.6 C29.4 24 28 24.9 25.6 24.9 C21.6 24.9 18.4 24.8 15.6 25.2 C14.8 25.2 14.3 24.7 14.2 24 Z', o: 0.6 },
        ],
      },
      // 2 · Kalkröhrchen — vor 550 Mio. J. (Cloudina (~550 Ma), first widespread skeleton builder;
      //   cloudinomorphs with a through-gut (Schiffbauer et al. 2020, Sci. Adv.)). An upright,
      //   slightly curved tube built of stacked funnels (cone-in-cone) with a soft tip peeking out.
      //   Farben: white chalky tube, grey funnel rims, pink tip.
      { name: 'Kalkröhrchen', ma: 550, art: [...cloudina(6.8, 29.5, 3, 4.6, 3.6, -0.5), ...cloudina(19, 29.5, 4, 5.6, 5, 1)] },
      // 3 · Priapswürmer — vor 538 Mio. J. (Priapulida; burrow Treptichnus pedum defines the base
      //   of the Cambrian (538.8 Ma); body fossils Chengjiang/Burgess (Ottoia)). A plump ringed
      //   sausage half dug into the sediment, a swollen spiny proboscis at the right end. Farben:
      //   pink-tan body, dark spines.
      { name: 'Priapswürmer', ma: 538, art: priapulid() },
      // 4 · Pfeilwürmer — vor 535 Mio. J. (Chaetognatha; grasping spines (protoconodont
      //   Protohertzina) ~535 Ma, body fossils Chengjiang ~518 Ma). A slim transparent arrow with
      //   side fins and a tail fin, a fan of hooked grasping spines at the head. Farben: glassy pale
      //   blue, white spines. Seen from above, like the ray.
      {
        name: 'Pfeilwürmer', ma: 535, art: [
          { f: 'sky', d: 'M6 16 L2.2 12.4 C1.6 14.4 1.6 17.6 2.2 19.6 Z' },
          { f: 'sky', d: 'M15 14.2 L8.6 9.8 L6.4 14.6 Z' },
          { f: 'sky', d: 'M15 17.8 L8.6 22.2 L6.4 17.4 Z' },
          { f: 'sky', d: 'M21.6 14.2 L17 11.2 L16.6 14.4 Z' },
          { f: 'sky', d: 'M21.6 17.8 L17 20.8 L16.6 17.6 Z' },
          line('white', 2.2, 'M25.6 14 C26.2 10.4 28.4 9.2 29.6 10.6'),
          line('white', 2.2, 'M25.6 18 C26.2 21.6 28.4 22.8 29.6 21.4'),
          { f: 'cyan', d: 'M4.5 16 C8 14.8 14 14.1 20.5 14.1 L24 14.2 L24 17.8 L20.5 17.9 C14 17.9 8 17.2 4.5 16 Z' },
          { f: 'cyan', d: artEllipse(26, 16, 2.9, 2.7) },
          { f: 'ink', d: artCircle(26.6, 15, 0.7) },
          { f: 'ink', d: artCircle(26.6, 17, 0.7) },
        ],
      },
      // 5 · Stummelfüßer — vor 518 Mio. J. (Lobopodians, Hallucigenia fortis (Chengjiang ~518 Ma);
      //   relatives of velvet worms and arthropods). A worm on 6-7 pairs of stubby legs with a row
      //   of tall spikes along its back (Hallucigenia). Farben: rust-orange body, dark spines.
      //   Four legs and four spikes are all a 16 px icon keeps apart.
      {
        name: 'Stummelfüßer', ma: 518, art: [
          ...[6.5, 11.8, 17.1, 22.4].map((x, k): ArtShape => ({ f: 'black', d: `M${pt(x - 1.1, 18.5)} L${pt(x - 3.4 + 0.8 * k, 6)} L${pt(x + 1.1, 18.5)} Z` })),
          ...[6, 11.3, 16.6, 21.9].map((x) => line('orange', 2.2, `M${pt(x, 20)} C${pt(x + 0.2, 23)} ${pt(x - 0.4, 25.5)} ${pt(x + 0.6, 27.6)}`)),
          line('orange', 4.2, 'M3.5 18.5 C8 20 17 20.2 23 19 C25 18.6 26.3 17.6 27 16.6'),
          line('rust', 1.6, 'M5 20.2 C9 21.2 17 21.2 22.5 20.4'),
          { f: 'orange', d: artCircle(27.4, 15.8, 2.5) },
          { f: 'ink', d: artCircle(28.2, 15.2, 0.8) },
        ],
      },
      // 6 · Ringelwürmer — vor 508 Mio. J. (Polychaete annelids, Burgess Shale ~508 Ma (Canadia,
      //   Burgessochaeta); Sirius Passet ~518 Ma). A segmented, wavy worm with bristle tufts
      //   (parapodia) along both sides and small head palps. Farben: iridescent red-gold, light gold
      //   bristles.
      { name: 'Ringelwürmer', ma: 508, art: ragworm() },
      // 7 · Röhrenwürmer — vor 244 Mio. J. (Calcareous tubeworms (Serpulidae), unequivocal from
      //   Middle Triassic ~244 Ma; Permian finds tentative). A curved white tube fixed to a rock
      //   with a fan-shaped feathery crown spreading from its open end. Farben: white tube,
      //   red-and-white banded crown.
      {
        name: 'Röhrenwürmer', ma: 244, art: [
          { f: 'greyDark', d: 'M2.5 29.5 C2 27 3.5 25.5 7 25.2 C12 24.8 20 25 25 25.5 C28 25.8 30 27 30 29.5 Z' },
          line('white', 4.4, 'M5.5 24 C10 25.5 15.5 25 18 21.5 C19.5 19.5 19.8 17.5 19.5 15.5'),
          line('grey', 1.6, 'M7.5 25.8 C11 26.8 16 26.4 18.9 23.2 C20.4 21 20.9 18.6 20.8 16.6'),
          ...crown(19.5, 15),
        ],
      },
      // 8 · Knochenfresserwürmer — vor 100 Mio. J. (Osedax (Siboglinidae); borings in Cretaceous
      //   plesiosaur and turtle bones ~100 Ma (Danise & Higgs 2015, Biol. Lett.)). A white bone
      //   lying on the sea floor with a small bush of red feathery plumes sprouting from it. Farben:
      //   ivory bone, bright red plumes, dark sea floor.
      {
        name: 'Knochenfresserwürmer', ma: 100, art: [
          { f: 'greyDark', d: 'M2 29.5 L2.5 27 C6 26 9 27 13 26.4 C18 25.8 24 26.4 29.5 27.2 L30 29.5 Z' },
          ...plume(11.6, 22, 8.4, 11.6),
          ...plume(16.4, 22, 16.6, 8.6),
          ...plume(21.2, 22, 24.6, 12),
          line('bone', 4, 'M7 23.5 L25 23.5'),
          { f: 'bone', d: artCircle(5.4, 21.8, 2.5) },
          { f: 'bone', d: artCircle(5.4, 25.2, 2.5) },
          { f: 'bone', d: artCircle(26.6, 21.8, 2.5) },
          { f: 'bone', d: artCircle(26.6, 25.2, 2.5) },
          { f: 'tan', d: 'M7 24.2 L25 24.2 L25 25.5 L7 25.5 Z', o: 0.6 },
        ],
      },
    ],
    specialists: [
      // Riesenröhrenwürmer — Hochsee, ab Unterart 8 (Riftia pachyptila (Siboglinidae) at
      //   hydrothermal vents; siboglinids at least ~100 Ma (Osedax traces)). A cluster of tall white
      //   tubes with bright red plumes at the tips, next to a small vent chimney. Farben: white
      //   tubes, blood-red plumes, black chimney.
      {
        name: 'Riesenröhrenwürmer', biome: Biome.Ocean, minStage: 7, art: [
          { f: 'black', d: `${artCircle(5.6, 10.4, 2.4)} ${artCircle(7.4, 6.6, 2.8)} ${artCircle(5.2, 3.8, 2)}`, o: 0.45 },
          { f: 'black', d: 'M1.8 29.5 L3.2 24 L2.6 20.5 L4 16.5 L3.8 13 L8.2 13 L8.6 17 L9.6 20.5 L9.2 24 L10.4 29.5 Z' },
          line('white', 3.8, 'M17.4 29 C17 22.5 15.6 17 14.2 12.6'),
          line('white', 3.8, 'M20.4 29 L20.8 9'),
          line('white', 3.8, 'M23.4 29 C24.2 23 25.4 18.5 26.8 15'),
          line('grey', 1.6, 'M18.6 28.6 C18.4 23 17.2 18 15.9 14'),
          line('red', 5, 'M14.2 12.6 L12.8 8.2'),
          line('red', 5, 'M20.8 9 L20.9 4'),
          line('red', 5, 'M26.8 15 L27.9 10.8'),
        ],
      },
    ],
  };
}
