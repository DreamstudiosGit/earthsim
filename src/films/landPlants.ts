/* =============================================================================
 * SimEarth 2.0 — evolution film: landPlants (wax skin and fungal partners)
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md. A bare rocky coast as a
 * diorama block, hit by violet UV zigzags; oxygen rises from the sea and a
 * bluish ozone veil forms, off which the rays bounce; flat liverwort-like
 * plants creep out of the water onto the rock, a gleam runs over their wax
 * skin, and white fungal threads beneath them trade nutrients (blue dots,
 * up) for sugar (gold hexagons, down); a green fringe spreads, spores fly.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** The hero plant on the rock, and where the fungal threads start beneath it. */
  const HX = 292;
  const HY = 139;
  const UV = '#9a62f0';

  /** Path data of one strap of a liverwort thallus, pointing up, with a notched tip. */
  function strap(len: number, w: number): string {
    return `M${f(-w * 0.6)} 0C${f(-w)} ${f(-len * 0.3)} ${f(-w)} ${f(-len * 0.7)} ${f(-w)} ${f(-len + w)}Q${f(-w)} ${f(-len)} ${f(-w * 0.35)} ${f(-len)}` +
      `L0 ${f(-len + w * 0.8)}L${f(w * 0.35)} ${f(-len)}Q${f(w)} ${f(-len)} ${f(w)} ${f(-len + w)}C${f(w)} ${f(-len * 0.7)} ${f(w)} ${f(-len * 0.3)} ${f(w * 0.6)} 0Z`;
  }

  /** The lobes of a liverwort thallus as flat <path> elements (usable inside a clipPath). */
  function thallusLobes(): string {
    let lobes = '';
    for (const [a, l] of [[-150, 13], [-84, 17], [-20, 14], [46, 16], [112, 13], [176, 11]] as const) {
      lobes += `<path transform="rotate(${a})" d="${strap(l * 0.56, 3.1)}"/>`;
      for (const r of [-26, 26]) lobes += `<path transform="rotate(${a}) translate(0 ${f(-l * 0.42)}) rotate(${r})" d="${strap(l * 0.6, 2.7)}"/>`;
    }
    return lobes;
  }

  /**
   * A liverwort-like thallus seen from above, as a def: flat lobes forking
   * in two, no roots, no stem. Squash it in y to lay it on the ground.
   */
  function thallusDef(defId: string): string {
    const lobes = thallusLobes();
    let ribs = '';
    for (const [a, l] of [[-150, 13], [-84, 17], [-20, 14], [46, 16], [112, 13], [176, 11]] as const) {
      ribs += `<path transform="rotate(${a})" d="M0 -1V${f(-l * 0.44)}l${f(-l * 0.22)} ${f(-l * 0.42)}M0 ${f(-l * 0.44)}l${f(l * 0.22)} ${f(-l * 0.42)}"/>`;
    }
    return `<g id="${defId}"><g fill="#3f8a3e" stroke="#3f8a3e" stroke-width="2">${lobes}</g><g fill="#7cc35e">${lobes}</g>` +
      `<g stroke="#4f9a46" stroke-width="1" fill="none">${ribs}</g><circle r="2.4" fill="#3f8a3e"/></g>`;
  }

  /** A zigzag through the given points; returns path data and its length (for the running dash). */
  function zigzag(pts: readonly (readonly [number, number])[], amp: number, seg: number): { d: string; len: number } {
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    let len = 0;
    let [px, py] = pts[0];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1];
      const [bx, by] = pts[i];
      const l = Math.hypot(bx - ax, by - ay);
      const n = Math.max(2, Math.round(l / seg));
      for (let k = 1; k <= n; k++) {
        const o = k === n ? 0 : (k % 2 ? amp : -amp);
        const x = ax + ((bx - ax) * k) / n - ((by - ay) / l) * o;
        const y = ay + ((by - ay) * k) / n + ((bx - ax) / l) * o;
        len += Math.hypot(x - px, y - py);
        [px, py] = [x, y];
        d += `L${f(x)} ${f(y)}`;
      }
    }
    return { d, len };
  }

  /** A UV ray: a faint zigzag with a bright pulse running down it, again and again. */
  function ray(pts: readonly (readonly [number, number])[], delay: number): string {
    const z = zigzag(pts, 4.5, 11);
    return `<path d="${z.d}" stroke="${UV}" stroke-width="2.2" fill="none" opacity="0.9" stroke-linejoin="round"/>` +
      `<path d="${z.d}" stroke="#fbf6ff" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="30 2000"` +
      `${mo('zap', { dur: 1.1, delay, len: Math.ceil(z.len) + 30 }, 'landPlants-zap')}/>`;
  }

  /** A violet flash where a ray strikes. */
  const flash = (x: number, y: number, delay: number): string =>
    `<path d="M${x} ${y - 7}L${f(x + 1.8)} ${f(y - 1.8)}L${x + 7} ${y}L${f(x + 1.8)} ${f(y + 1.8)}L${x} ${y + 7}L${f(x - 1.8)} ${f(y + 1.8)}L${x - 7} ${y}L${f(x - 1.8)} ${f(y - 1.8)}Z" fill="#ead8ff"${mo('twinkle', { dur: 0.55, delay, o: 0 })}/>`;

  /** A liverwort rosette lying on the rock, popping up at `d`. */
  const rosette = (id: string, x: number, y: number, sc: number, d: number): string =>
    `<g transform="translate(${f(x)} ${f(y)}) scale(${f(sc)} ${f(sc * 0.4)})"><g${once('pop', { delay: f(d), dur: 0.7 })}><use href="#${id}-thallus" transform="rotate(${Math.round(x * 7) % 360})"/></g></g>`;

  EVO_FILMS.landPlants = (): string => {
    const id = 'landPlants';
    const s = sky(id, '#8fb8d2', '#f0e2c6');
    const glow = sun(id, 404, 54, 13);
    const thallus = thallusDef(`${id}-thallus`);
    const defs = s.defs + glow.defs + thallus +
      vgrad(`${id}-veil`, [[0, 'rgba(150,210,255,0)'], [0.5, 'rgba(120,196,255,0.78)'], [1, 'rgba(150,210,255,0)']]) +
      vgrad(`${id}-face`, [[0, '#8e7a6b'], [1, '#5a4a40']]) + vgrad(`${id}-deep`, [[0, '#5fb3c2'], [1, '#2a6a80']]) +
      `<clipPath id="${id}-wax">${thallusLobes()}</clipPath>`;
    let body = s.body + glow.body + hills(110, 20, '#b6a596', 3, 0.55) + hills(122, 10, '#9d8a7a', 6, 0.85);
    // The diorama block: sea and bare rock on top, their cut faces below.
    body += `<path d="M0 126H228L201 150H0Z" fill="#79c0cb"/>`;
    for (const [y, d] of [[132, 3.2], [140, 2.6], [146, 3]] as const) {
      body += `<g${mo('wave', { dx: 40, dur: d })}><path d="${wavePath(-40, 200, y, 1.2)}" stroke="rgba(255,255,255,0.45)" stroke-width="1.2" fill="none"/></g>`;
    }
    body += `<path d="M228 126H480V150H201Z" fill="#c4b094"/><path d="M228 126H480" stroke="#8d7b6c" stroke-width="1.5"/><path d="M201 150H480" stroke="#d8c8ae" stroke-width="2"/>`;
    for (const [x, y, w, h] of [[352, 136, 10, 5], [414, 131, 8, 4], [456, 145, 12, 6], [244, 147, 7, 4], [380, 148, 9, 5]] as const) {
      body += greenRock(x, y, w, h, '#8c7a6c', '#bcae9e');
    }
    body += `<g${mo('float', { amp: 1.2, dur: 2.2 })}><path d="M229 125L201 151" stroke="#f4f8f6" stroke-width="3" stroke-linecap="round"/></g>`;
    body += `<path d="M0 213C80 205 160 182 201 150H0Z" fill="url(#${id}-deep)"/>` +
      `<path d="M0 213C80 205 160 182 201 150H480V270H0Z" fill="url(#${id}-face)"/>` +
      `<path d="M0 238Q120 228 230 236T480 230M210 178Q330 172 480 182" stroke="#4f4038" stroke-width="1.6" fill="none" opacity="0.45"/>`;
    // Beat 1: UV zigzags strike the bare rock.
    let rays = '';
    [[250, 145], [330, 138], [392, 142], [446, 135]].forEach(([x, y], k) => {
      rays += ray([[x + 34, 34], [x, y]], -k * 0.27) + flash(x, y, -k * 0.27 + 0.9);
    });
    body += during(0, 4.1, rays, 0.5);
    // Beat 2: oxygen from the sea rises and a veil forms high up; the rays bounce off it.
    let o2 = '';
    for (let k = 0; k < 9; k++) {
      o2 += `<circle cx="${22 + k * 21}" cy="132" r="${2 + (k % 3) * 0.6}" fill="#e4f7ff"${mo('rise', { dy: -46, dur: 1.4, delay: f(2.9 + (k % 4) * 0.3), n: 2, o: 0.95 })}/>`;
    }
    body += during(2.8, 5.9, o2, 0.3);
    body += during(3.4, Infinity, `<rect y="70" width="${FILM_W}" height="38" fill="url(#${id}-veil)"/>` +
      `<g${mo('wave', { dx: -40, dur: 5 })}><path d="${wavePath(-40, 520, 86, 2)}" stroke="rgba(235,248,255,0.95)" stroke-width="1.8" fill="none"/></g>` +
      `<g${mo('wave', { dx: 40, dur: 7 })}><path d="${wavePath(-40, 520, 93, 1.5)}" stroke="rgba(200,232,255,0.8)" stroke-width="1.2" fill="none"/></g>`, 1.0);
    let bounce = '';
    [264, 326, 388, 450].forEach((x, k) => {
      bounce += ray([[x + 10, 26], [x - 14, 86], [x - 40, 34]], -k * 0.3) + flash(x - 14, 86, -k * 0.3 + 0.5);
    });
    body += during(3.9, Infinity, bounce, 0.5);
    body += during(3.9, 6.2, tag(330, 116, 'Ozonschicht', 3.9), 0.4);
    // Beat 3: flat plants creep out of the water onto the rock.
    body += rosette(id, 206, 147, 0.8, 5.9) + rosette(id, 226, 139, 0.9, 6.1) + rosette(id, 252, 146, 1.1, 6.3);
    const gleam = `<g clip-path="url(#${id}-wax)"><g${mo('drift', { dx: 70, dur: 1.8, delay: 6.9, ease: 'ease-in-out' })}>` +
      `<path d="M-36 -24L-24 -24L-36 24L-48 24Z" fill="#ffffff" opacity="0.8"/></g></g>`;
    // Glints that stay: the skin is glossy with wax.
    let glints = '';
    for (const [x, y, d] of [[-9, -9, 0], [7, -11, 0.4], [12, 5, 0.8], [-12, 6, 1.2], [1, 13, 0.6]] as const) {
      glints += `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="3.4" fill="#fbfff0"${mo('twinkle', { dur: 1.3, delay: 7 + d, o: 0.15 })}/>`;
    }
    body += `<g transform="translate(${HX} ${HY}) scale(2.2 0.84)"><g${once('pop', { delay: 6.5, dur: 0.8 })}><use href="#${id}-thallus"/>${during(6.8, Infinity, glints, 0.5)}${gleam}</g></g>`;
    body += tag(HX, HY - 22, 'Wachshaut', 7.0);
    // The fungal threads branch out beneath it, and goods travel both ways.
    const hyphae: readonly (readonly (readonly [number, number])[])[] = [
      [[HX, 152], [258, 186], [234, 206]], [[HX, 152], [300, 192], [292, 214]], [[HX, 152], [330, 180], [362, 198]],
      [[258, 186], [272, 208]], [[258, 186], [232, 180]], [[300, 192], [318, 210]], [[330, 180], [340, 206]], [[330, 180], [352, 166]],
    ];
    hyphae.forEach((pts, k) => {
      const len = pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
      body += `<path d="M${pts.map((p) => p.join(' ')).join('L')}" stroke="#f6f2e4" stroke-width="${k < 3 ? 2 : 1.4}" fill="none" stroke-linecap="round" stroke-linejoin="round"` +
        `${once('draw', { len: Math.ceil(len) + 2, delay: f(6.6 + (k < 3 ? 0 : 0.45)), dur: 0.8 })}/>`;
    });
    let trade = '';
    for (const [[ax, ay], [bx, by]] of [[[258, 186], [HX, 154]], [[300, 192], [HX, 154]], [[330, 180], [HX, 154]]] as const) {
      const l = Math.hypot(bx - ax, by - ay);
      const [nx, ny] = [(by - ay) / l, -(bx - ax) / l];
      for (let j = 0; j < 2; j++) {
        trade += `<circle cx="${f(ax + nx * 3)}" cy="${f(ay + ny * 3)}" r="3.2" fill="#8fd8ff" stroke="#2f6f96" stroke-width="0.8"` +
          `${mo('travel', { dx: bx - ax, dy: by - ay, dur: 1.7, delay: f(6.9 + j * 0.85 + (ax - 258) / 300) }, 'green-travel')}/>`;
        trade += `<g transform="translate(${f(bx - nx * 3)} ${f(by - ny * 3)})"><path d="M-3.6 0L-1.8 -3.1H1.8L3.6 0L1.8 3.1H-1.8Z" fill="${PAL.gold}" stroke="#8a6a1c" stroke-width="0.7"` +
          `${mo('travel', { dx: ax - bx, dy: ay - by, dur: 1.7, delay: f(7.2 + j * 0.85 + (ax - 258) / 300) }, 'green-travel')}/></g>`;
      }
    }
    body += trade + tag(372, 206, 'Pilzpartner', 7.8, 'start');
    body += sparkle(HX, HY, '#f4ffd0', 6.9);
    // Beat 4: a green fringe spreads along the shore, and spores drift in the wind.
    body += `<path d="M229 126L203 150" stroke="#6fbf52" stroke-width="6" stroke-linecap="round"${once('draw', { len: 40, delay: 9.2, dur: 0.8 })}/>`;
    for (const [x, y, sc, d] of [[214, 132, 0.6, 9.3], [262, 131, 0.7, 9.6], [330, 147, 0.9, 9.9], [344, 131, 0.6, 10.1], [372, 142, 0.85, 10.3],
      [404, 148, 0.8, 10.5], [424, 133, 0.55, 10.7], [450, 141, 0.75, 10.9], [470, 129, 0.45, 11.1], [236, 148, 0.7, 9.4]] as const) {
      body += rosette(id, x, y, sc, d);
    }
    const rnd = seeded(41);
    for (let k = 0; k < 14; k++) {
      const x = 210 + rnd() * 250;
      body += `<circle cx="${f(x)}" cy="${f(134 + rnd() * 10)}" r="2.1" fill="#f6f0d2" stroke="#a89a6a" stroke-width="0.5"${mo('travel', { dx: f(60 + rnd() * 60), dy: f(-40 - rnd() * 40), dur: f(2.2 + rnd()), delay: f(9.5 + rnd() * 1.6), ease: 'ease-out' }, 'green-travel')}/>`;
    }
    return film(id, defs, body);
  };
}
