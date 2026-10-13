/* =============================================================================
 * SimEarth 2.0 — evolution film: arthropods
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * A Cambrian floor of soft worms. A trilobite walks out of its old shell on
 * jointed legs; the lens shows its compound eye, each six-sided lens focusing
 * light; Anomalocaris glides in, the trilobite sees it and rolls up, and the
 * predator turns away.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  type Shell = readonly [string, string, string, string];
  const SHELL: Shell = ['#cf9459', '#8a5a2e', '#e9b87e', '#4a2e16'];
  const MOULT: Shell = ['#efe2c8', '#c4ab86', '#f8eedc', '#d8c6a4'];

  /** A trilobite's thorax and tail, head end at x 6 (seen from above at a slant). */
  function trunk([shell, dark, light]: Shell): string {
    let thorax = '', rings = '';
    for (let k = 0; k < 9; k++) {
      const x0 = 6 - k * 3, x1 = x0 - 3;
      thorax += `M${x0} -16.2L${x1 - 1.2} -18L${x1} -15.6L${x1} 15.6L${x1 - 1.2} 18L${x0} 16.2Z`;
      rings += `M${x1} ${f(-5.2 + k * 0.1)}L${x1} ${f(5.2 - k * 0.1)}`;
    }
    const line = `stroke="${dark}" stroke-width="0.7"`;
    return `<path d="${thorax}" fill="${shell}" ${line}/><path d="M-21 -15.6Q-32 -13 -34 0Q-32 13 -21 15.6Z" fill="${shell}" ${line}/>` +
      `<path d="M7 -5.4L-21 -4.2L-29 -1.8L-29 1.8L-21 4.2L7 5.4Z" fill="${light}" ${line}/><path d="${rings}" fill="none" ${line}/>`;
  }

  /** A trilobite's head shield with genal spines, crescent eyes and antennae. */
  function head([shell, dark, light, eyes]: Shell, crack = false): string {
    const line = `stroke="${dark}" stroke-width="0.7"`;
    return `<path d="M33 -3Q42 -9 52 -14M33 3Q42 9 52 14" fill="none" stroke="${dark}" stroke-width="0.8" opacity="0.7"/>` +
      `<path d="M6 -18C22 -19 34 -11 34 0C34 11 22 19 6 18L-12 23L3 15L3 -15L-12 -23Z" fill="${shell}" ${line}/>` +
      `<path d="M5 -5.5Q21 -8.5 28 0Q21 8.5 5 5.5Z" fill="${light}" ${line}/>` +
      [-1, 1].map((s) => `<path d="M12 ${s * 7.4}Q15.5 ${s * 11.6} 19.5 ${s * 7.6}" fill="none" stroke="${eyes}" stroke-width="2.4" stroke-linecap="round"/>`).join('') +
      (crack ? `<path d="M10 -16L16 -10L22 -12L28 -6" fill="none" stroke="#9a8462" stroke-width="1.2"/>` : '');
  }

  /** Jointed legs under the near edge, paddling from `walk` s for `n` strokes. */
  function legs(walk: number, n: number): string {
    let out = '';
    for (let k = 0; k < 8; k++) {
      const leg = `<path d="M0 0L2.8 6L1 12.5" fill="none" stroke="#7a4a24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="2.8" cy="6" r="1.1" fill="#5a3418"/>`;
      out += seaAt(5 - k * 3.4, 12, `<g${mo('sway', { rot: 26, dur: 0.3, delay: f(walk + k * 0.06), n, origin: '50% 0%' })}>${leg}</g>`);
    }
    return out;
  }

  /** The trilobite rolled up, as seen from above at a slant: the trunk's segments arch over the body. */
  function rolled([shell, dark, light, eyes]: Shell): string {
    let arcs = '';
    for (let k = 0; k < 6; k++) arcs += `M${-15 + k * 4} -15Q${-24 + k * 4} 0 ${-15 + k * 4} 15`;
    return `<ellipse cx="4" rx="25" ry="18" fill="${shell}" stroke="${dark}" stroke-width="0.9"/>` +
      `<path d="M-17 -5Q-24 0 -17 5L8 5L8 -5Z" fill="${light}" stroke="${dark}" stroke-width="0.7"/><path d="${arcs}" fill="none" stroke="${dark}" stroke-width="0.9"/>` +
      `<path d="M8 -18C22 -18 29 -9 29 0C29 9 22 18 8 18Z" fill="${shell}" stroke="${dark}" stroke-width="0.9"/>` +
      `<path d="M8 -5Q20 -7 25 0Q20 7 8 5Z" fill="${light}" stroke="${dark}" stroke-width="0.7"/>` +
      [-1, 1].map((sd) => `<path d="M12 ${sd * 7.4}Q15.5 ${sd * 11.6} 19.5 ${sd * 7.6}" fill="none" stroke="${eyes}" stroke-width="2.4" stroke-linecap="round"/>`).join('');
  }

  /** A tuft of seaweed blades rooted at (0, 0), `h` tall. */
  function tuft(color: string, h: number): string {
    let blades = '';
    for (const [dx, bend] of [[-4, -8], [-2, -3], [0, 2], [2, 6], [4, 10]] as const) blades += `M${dx} 0Q${dx + bend} ${f(-h * 0.5)} ${f(dx + bend * 0.6)} ${-h}`;
    return `<path d="${blades}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/>`;
  }

  /** A priapulid worm reaching out of its burrow. */
  function priapulid(h: number): string {
    let rings = '';
    for (let y = -4; y > -h + 5; y -= 3.2) rings += `M-3.4 ${f(y)}Q0 ${f(y + 1.2)} 3.4 ${f(y)}`;
    return `<ellipse rx="6.5" ry="2.2" fill="#5e4c34"/><path d="M-4 0L-3.6 ${-h + 6}Q0 ${-h - 2} 3.6 ${-h + 6}L4 0Z" fill="#e9a48c"/>` +
      `<path d="${rings}M-2 ${-h + 1}l-2 -2M0 ${-h - 1}l0 -2.5M2 ${-h + 1}l2 -2" stroke="#c47a62" stroke-width="0.8" fill="none"/>`;
  }

  /** Anomalocaris from above, facing right: grasping arms, stalked eyes, swimming flaps, tail fan. */
  function anomalocaris(): string {
    let flaps = '';
    for (let k = 0; k < 8; k++) {
      const x = 22 - k * 9.2, w = 12 + 8 * Math.sin(Math.PI * (k + 1) / 9);
      for (const s of [-1, 1]) {
        flaps += seaAt(x, s * 7, `<g${mo('sway', { rot: 12, dur: 0.9, delay: f(-k * 0.1), origin: '50% 0%' })}>` +
          `<path d="M-4 0Q-6 ${f(s * w)} 2 ${f(s * w)}Q6 ${f(s * w * 0.5)} 4 0Z" fill="${k % 2 ? '#d97c5c' : '#e38c68'}" stroke="#9a4630" stroke-width="0.8"/></g>`);
      }
    }
    const arm = (s: number): string => {
      let spines = '';
      for (let k = 0; k < 5; k++) spines += `M${f(50 + k * 5.2)} ${f(s * (9.5 + k * 1.2 - (k > 2 ? (k - 2) * 2.5 : 0)))}l${f(1 + k * 0.3)} ${f(s * -4)}`;
      return `<path d="M44 ${s * 4}Q60 ${s * 17} 71 ${s * 14}Q79 ${s * 10} 76 ${s * 4}" fill="none" stroke="#e8a271" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="${spines}" stroke="#a65a36" stroke-width="1.2"/>`;
    };
    return `<path d="M-52 0L-72 -14M-52 0L-76 -5M-52 0L-76 5M-52 0L-72 14" stroke="#c8644a" stroke-width="5" stroke-linecap="round"/>` + flaps +
      `<path d="M-56 0Q-50 -8 0 -9Q30 -9 40 0Q30 9 0 9Q-50 8 -56 0Z" fill="#c8644a"/>` +
      `<path d="M-40 -6v12M-28 -7v14M-16 -8v16M-4 -8v16M8 -8v16M20 -8v16" stroke="#9a4630" stroke-width="0.9"/>` +
      `<g${mo('sway', { rot: 6, dur: 1.6, origin: '0% 50%' })}>${arm(-1)}${arm(1)}</g>` +
      `<ellipse cx="36" rx="11" ry="9" fill="#d97c5c" stroke="#9a4630" stroke-width="1"/>` +
      [-1, 1].map((s) => `<path d="M34 ${s * 6}L42 ${s * 20}" stroke="#c8644a" stroke-width="3.4"/><ellipse cx="43" cy="${s * 22}" rx="6" ry="4.6" fill="${PAL.ink}"/><circle cx="41" cy="${s * 21 - 1.4}" r="1.6" fill="#ffffff"/>`).join('');
  }

  /** Inside the lens: the compound eye's six-sided lenses light up and focus the light. */
  function facets(): string {
    let out = `<rect x="-60" y="-60" width="120" height="120" fill="#3a2414"/>`;
    const cells: (readonly [number, number])[] = [[0, 0]];
    for (let k = 0; k < 6; k++) cells.push([Math.cos(k * Math.PI / 3 + Math.PI / 6) * 27, Math.sin(k * Math.PI / 3 + Math.PI / 6) * 27]);
    for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 6 + (k % 2 ? 0 : Math.PI / 6), r = k % 2 ? 46.8 : 54;
      out += `<path d="${seaHex(Math.cos(a) * r, Math.sin(a) * r, 15)}" fill="#8a5a2e" stroke="#2a180a" stroke-width="2"/>`;
    }
    cells.forEach(([x, y]) => {
      const t = 6.2 + (x + 30) / 60 * 0.6;
      let cone = '';
      for (let k = 0; k < 6; k++) cone += `M${f(x + Math.cos(k * Math.PI / 3) * 12)} ${f(y + Math.sin(k * Math.PI / 3) * 12)}L${f(x)} ${f(y)}`;
      out += `<path d="${seaHex(x, y, 15)}" fill="#a26a34" stroke="#2a180a" stroke-width="2"/><ellipse cx="${f(x - 3)}" cy="${f(y - 4)}" rx="5" ry="3" fill="#f4d9a8" opacity="0.45"/>` +
        `<g${once('fade', { delay: f(t), dur: 0.4 })}><path d="${seaHex(x, y, 13.5)}" fill="#f6c453" opacity="0.55"/>` +
        `<path d="${cone}" stroke="#fff6d0" stroke-width="1.2"/><circle cx="${f(x)}" cy="${f(y)}" r="3.2" fill="#ffffff"${mo('pulse', { dur: 0.8, s: 1.5, delay: t + 0.4 })}/></g>`;
    });
    // Parallel daylight sweeps in from the upper left.
    out += `<g${once('enter', { dx: -60, dy: -60, delay: 6.1, dur: 0.8 })}><g${once('fadeout', { delay: 7.4, dur: 0.8 })}>` +
      `<path d="M-70 -20L-20 -70M-60 10L10 -60M-50 40L40 -50M-30 60L60 -30" stroke="#fff3b0" stroke-width="3" opacity="0.5"/></g></g>`;
    return out;
  }

  EVO_FILMS.arthropods = (): string => {
    const id = 'arthropods';
    const water = underwater(id, 0.55);
    let body = water.body + hills(150, 14, '#2f6f80', 12, 0.45) +
      `<path d="M0 154Q120 144 240 150T480 146L480 270L0 270Z" fill="url(#${id}-floor)"/>`;
    const rnd = seeded(3);
    for (let k = 0; k < 5; k++) body += `<ellipse cx="${f(rnd() * 480)}" cy="${f(160 + rnd() * 100)}" rx="${f(2 + rnd() * 4)}" ry="${f(1 + rnd() * 1.4)}" fill="#6f5a3c" opacity="0.6"/>`;
    // Beat 1: soft worms in the mud.
    for (const [x, y, h, sc] of [[74, 210, 36, 1.7], [150, 176, 30, 1.4], [428, 212, 38, 1.7], [452, 168, 28, 1.3]] as const) {
      body += seaAt(x, y, `<g${mo('sway', { rot: 10, dur: f(2 + rnd()) })}>${priapulid(h)}</g>`, ` scale(${sc})`);
    }
    for (const [x, y, c, h] of [[40, 176, '#5f9f4c', 24], [372, 164, '#b8584e', 20], [118, 222, '#5f9f4c', 18]] as const) {
      body += seaAt(x, y, `<g${mo('sway', { rot: 6, dur: f(2.6 + rnd()) })}>${tuft(c, h)}</g>`);
    }

    // Beat 2: the trilobite walks out of its old shell, which stays behind.
    const s = 1.6, tx = 226, ty = 192, walk = 118;
    body += seaAt(tx, ty, `<g${once('fade', { delay: 2.9, dur: 0.6 })}><g transform="scale(${s} ${s * 0.8})">${trunk(MOULT)}${head(MOULT, true)}</g></g>`);
    // It rolls up: the trunk folds in under the head shield.
    const fold = seaAt(6, 0, seaPivot(once('scale', { delay: 10, dur: 0.5 }, 'arthropods-fold'), seaAt(-6, 0, trunk(SHELL)), 42));
    const trilobite = `<ellipse cy="17" rx="36" ry="5" fill="#000000" opacity="0.18"/>` + during(0, 10.1, legs(3.4, 7), 0.3) +
      during(0, 10.45, `<g transform="scale(1 0.8)">${fold}${head(SHELL)}</g>`, 0.2) +
      during(10.3, Infinity, seaAt(2, 0, rolled(SHELL), ' scale(0.95 0.8)'), 0.25) +
      // Its eye flashes as it spots the predator.
      seaAt(15.5, -8, `<circle r="5" fill="#fff6d0"${once('burst', { delay: 9.7, s: 3, dur: 0.8 })}/>`);
    body += seaAt(tx, ty, `<g${once('fade', { delay: 2.9, dur: 0.6 })}><g${once('move', { dx: walk, delay: 3.4, dur: 2.1, ease: 'linear' })}>${seaAt(0, 0, trilobite, ` scale(${s})`)}</g></g>`);
    body += during(0, 6.1, tag(tx - 4, ty - 36, 'Außenskelett', 4.2), 0.4);

    // Beat 3: the lens on its compound eye.
    const ex = tx + walk + 15.5 * s, ey = ty - 8 * s;
    const glass = lens(`${id}-lens`, ex - 46, 100, 52, facets(), 5.9, 8.9);
    body += glass.body + sparkle(ex, ey, '#fff3c4', 6.4, 0.8) + during(0, 8.9, tag(ex - 104, 92, 'Linsenauge', 6.9, 'end'), 0.4);

    // Beat 4: Anomalocaris glides in; the trilobite sees it and rolls up; it turns away.
    body += seaAt(170, 104, `<g${once('enter', { dx: -280, dy: -20, delay: 8.7, dur: 1.4, ease: 'cubic-bezier(.2,.7,.4,1)' })}><g${once('move', { dx: -300, dy: -10, delay: 10.9, dur: 1.3, ease: 'ease-in' })}>` +
      seaPivot(once('scale', { delay: 10.6, dur: 0.5 }, 'arthropods-turn'), `<g${mo('float', { amp: 3, dur: 1.8 })}>${seaAt(0, 0, anomalocaris(), ' scale(1.35 1.05)')}</g>`, 120) + '</g></g>');

    const defs = water.defs + glass.defs + vgrad(`${id}-floor`, [[0, '#8c7654'], [1, '#b09670']]);
    return film(id, defs, body);
  };
}
