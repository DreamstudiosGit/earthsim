/* =============================================================================
 * SimEarth 2.0 — evolution film: birds
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * Feathers before flight: a downy little theropod warms its clutch; a male
 * with vaned feathers on arms, legs and tail dances for a female; then
 * Archaeopteryx runs, flaps and takes off; at last a flock of birds crosses
 * the land while the big dinosaurs fade away.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  /** A cycad: a stout scaly trunk under a crown of stiff fronds (`bark` is a pattern id). */
  function cycad(x: number, y: number, h: number, d: number, bark: string): string {
    const trunk = `M-8 0Q-10 ${-h / 2} -6 ${-h}L6 ${-h}Q10 ${-h / 2} 8 0Z`;
    return `<g transform="translate(${x} ${y})"><path d="${trunk}" fill="#8a6a42"/><path d="${trunk}" fill="url(#${bark})"/></g>` +
      landFern(x - 2, y - h, -44, 14, '#4f8a45', d) + landFern(x - 2, y - h, -28, 34, '#5a9a4e', d + 0.4) +
      landFern(x + 2, y - h, 26, 36, '#5a9a4e', d + 0.2) + landFern(x + 2, y - h, 44, 12, '#4f8a45', d + 0.6);
  }

  /** A fluffy outline: an ellipse whose edge is a ring of small bumps (down). */
  function fluff(cx: number, cy: number, rx: number, ry: number, col: string, n = 18): string {
    let d = '';
    for (let k = 0; k <= n; k++) {
      const a = (k / n) * Math.PI * 2;
      const [x, y] = [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
      if (k === 0) { d += `M${f(x)} ${f(y)}`; continue; }
      const m = a - Math.PI / n;
      d += `Q${f(cx + Math.cos(m) * (rx + 4))} ${f(cy + Math.sin(m) * (ry + 4))} ${f(x)} ${f(y)}`;
    }
    return `<path d="${d}Z" fill="${col}"/>`;
  }

  /** A small downy theropod brooding, side view facing right, nest centre at the origin: arms spread over the eggs. */
  function brooder(): string {
    let twigs = '';
    for (let k = 0; k < 9; k++) twigs += `M${-34 + k * 8} ${k % 2 ? -10 : -1}l${8} ${k % 2 ? 8 : -9}`;
    return `<ellipse cy="-4" rx="36" ry="9" fill="#7a5a34"/><path d="${twigs}" stroke="#5e4428" stroke-width="1.6" stroke-linecap="round"/>` +
      `<ellipse cx="-24" cy="-9" rx="5.4" ry="6.8" fill="#d6e6da"/><ellipse cx="27" cy="-8" rx="5.4" ry="6.8" fill="#d6e6da"/><ellipse cx="20" cy="-6" rx="5.4" ry="6.8" fill="#c8dccf"/>` +
      fluff(-38, -17, 22, 5, '#b8875a', 12) +
      `<g${mo('pulse', { s: 1.03, dur: 1.4, origin: '50% 100%' })}>${fluff(-2, -21, 26, 15, '#c99a68', 20)}` +
      `<path d="M14 -30Q20 -40 22 -46L30 -44Q28 -36 22 -26Z" fill="#c99a68"/>${fluff(27, -48, 9, 7, '#d4a674', 12)}` +
      `<path d="M34 -51Q43 -50 45 -47Q41 -43 34 -44Z" fill="#d4a674"/><path d="M37 -45.6l1 1.2l1 -1.2l1 1.2" stroke="#ffffff" stroke-width="0.7" fill="none"/>${eye(30, -50, 1.7)}</g>` +
      `<path d="M8 -26Q26 -26 34 -10" stroke="#b8875a" stroke-width="6" fill="none" stroke-linecap="round"/>` +
      `<path d="M14 -24l-2 6M20 -22l-2 7M26 -19l-2 7M31 -14l-3 6" stroke="#a87a4e" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="M-34 -2Q0 6 34 -2" stroke="#6a4c2c" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }

  /** One vaned feather row as a wing: root at the origin, reaching up and back; black with white bands. */
  function bandedWing(len: number): string {
    let bars = '';
    for (let k = 1; k < 5; k++) bars += `M${f(-k * len * 0.07)} ${f(-k * len * 0.19)}l${f(-len * 0.22)} ${f(len * 0.06)}`;
    return `<path d="M3 0Q6 ${f(-len * 0.5)} ${f(-len * 0.3)} ${-len}Q${f(-len * 0.5)} ${f(-len * 0.6)} ${f(-len * 0.34)} ${f(-len * 0.1)}Q-6 0 3 0Z" fill="#26262e"/>` +
      `<path d="${bars}" stroke="#f2f2f2" stroke-width="2" stroke-linecap="round"/>`;
  }

  /** An Anchiornis-like feathered dinosaur, side view facing right, feet on y = 0. `display` raises wings and tail. */
  function anchiornis(display: boolean, body: string, crest: string): string {
    const legs = `<path d="M-2 -22L4 -12L0 0M0 0l5 0M3 -22L8 -12L5 0M5 0l5 0" stroke="#3a3a40" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M3 -14l-9 6M5 -11l-10 5M4 -17l-9 4" stroke="${display ? '#26262e' : body}" stroke-width="2.6" stroke-linecap="round"/>`;
    const tail = `<path d="M-12 -30Q-36 -36 -56 -44Q-40 -26 -12 -24Z" fill="${display ? '#26262e' : body}"/>` +
      (display ? `<path d="M-24 -33l-3 6M-34 -36l-3 7M-44 -40l-3 7" stroke="#f2f2f2" stroke-width="1.8" stroke-linecap="round"/>` : '');
    const wing = display
      ? `<g transform="translate(4 -34) rotate(-20)"><g${once('unfurl', { rot: 100, delay: 3.4, dur: 0.6, origin: '50% 100%' })}><g${mo('sway', { rot: 10, dur: 0.4, delay: 4, origin: '50% 100%' })}>${bandedWing(38)}</g></g></g>`
      : `<path d="M8 -36Q-6 -38 -16 -28Q-4 -26 8 -30Z" fill="#7a6a5a"/>`;
    return legs + (display ? `<g${once('unfurl', { rot: -40, delay: 3.3, dur: 0.6, origin: '100% 100%' })}>${tail}</g>` : tail) +
      `<ellipse cx="0" cy="-30" rx="14" ry="9.6" fill="${body}"/><path d="M8 -34Q14 -42 16 -48L22 -46Q20 -38 14 -28Z" fill="${body}"/>` +
      `<ellipse cx="20" cy="-50" rx="7" ry="5.6" fill="${body}"/><path d="M26 -52Q32 -51 33 -49Q30 -47 26 -47Z" fill="${body}"/>` +
      `<path d="M14 -54Q16 -62 22 -60Q20 -56 24 -55" fill="${crest}"/>` + eye(22, -51, 1.5) + wing;
  }

  /** One Archaeopteryx wing, root at the origin, reaching up with its tip swept back: three clawed fingers at the wrist. */
  function archWing(col: string, coverts: string): string {
    const tips = [[-18, -56], [-24, -48], [-26, -40], [-25, -32], [-22, -25], [-18, -18], [-13, -11], [-8, -5]];
    let edge = '';
    tips.forEach(([x, y], k) => { if (k) edge += `Q${f((tips[k - 1][0] + x) / 2 + 3)} ${f((tips[k - 1][1] + y) / 2)} ${x} ${y}`; });
    return `<path d="M4 0Q8 -18 4 -28Q-2 -42 -18 -56${edge}Q-7 -2 -6 0Z" fill="${col}"/><path d="M4 0Q8 -18 4 -28Q-2 -42 -15 -54Q-7 -44 -5 -32Q-4 -18 -4 0Z" fill="${coverts}"/>` +
      `<path d="M4 -30l7 -4M2 -33l6 -6M0 -36l4 -8" stroke="#d8b07a" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M11 -34q2.4 0 2.6 2.6M8 -39q2.4 0 2.6 2.6M4 -44q2.4 0.2 2.4 2.8" stroke="${PAL.ink}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  }

  /** Archaeopteryx running and flapping, side view facing right, feet on y = 0: teeth, wing claws, a long bony feathered tail. */
  function archaeopteryx(): string {
    let tail = '';
    for (let k = 0; k < 9; k++) {
      const [x, y] = [-14 - k * 5.4, -22 + k * 0.6];
      tail += `<ellipse cx="${f(x - 3)}" cy="${f(y - 3.4)}" rx="5" ry="1.8" fill="#6a3e1e" transform="rotate(-20 ${f(x - 3)} ${f(y - 3.4)})"/><ellipse cx="${f(x - 3)}" cy="${f(y + 3.4)}" rx="5" ry="1.8" fill="#7a4a26" transform="rotate(20 ${f(x - 3)} ${f(y + 3.4)})"/>`;
    }
    const flap = (col: string, cov: string, delay: number): string =>
      `<g transform="translate(4 -28)"><g${mo('flap', { s: -0.55, dur: 0.18, delay, origin: '50% 100%' })}>${archWing(col, cov)}</g></g>`;
    return flap('#4e2e14', '#6a3e1e', 6.05) + `<g transform="translate(0 -16)">${landStride(16, 2.4, '#c49a5a', '#8a6a3a', 0.16, 30)}</g>` +
      tail + `<path d="M-12 -22L-64 -18" stroke="#d8b07a" stroke-width="1.6" stroke-dasharray="2.4 1.4"/>` +
      `<ellipse cx="0" cy="-24" rx="14" ry="8.4" fill="#8a5a30"/><path d="M-8 -20Q2 -16 12 -22" stroke="#e8d2a8" stroke-width="3" fill="none" opacity="0.8"/>` +
      `<path d="M8 -28Q12 -36 16 -40L22 -36Q16 -32 14 -24Z" fill="#8a5a30"/>` +
      `<path d="M14 -38Q16 -47 24 -47Q30 -47 32 -44L40 -42Q40 -38.6 32 -37.6Q24 -36 18 -34Z" fill="#9a6a3a"/>` +
      `<path d="M26 -38.6l1 1.6l1 -1.6l1 1.6l1 -1.6l1 1.6l1 -1.6l1 1.6" stroke="#ffffff" stroke-width="0.8" fill="none"/>${eye(25, -43.4, 1.8)}` +
      flap('#7a4a26', '#a8703e', 6.0);
  }

  /** A small modern bird of the flock, flapping, facing left. */
  function flockBird(k: number): string {
    return `<path d="M2 0l8 2" stroke="#3a2a1e" stroke-width="1.8" stroke-linecap="round"/><ellipse rx="4.4" ry="1.8" fill="#3a2a1e"/><circle cx="-4" cy="-1" r="1.8" fill="#3a2a1e"/>` +
      `<g${mo('flap', { dur: 0.24, s: -0.7, delay: -k * 0.07, origin: '50% 100%' })}><path d="M1 0Q-3 -7 -9 -6M1 0Q4 -7 10 -7" stroke="#3a2a1e" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>`;
  }

  EVO_FILMS.birds = (): string => {
    const id = 'birds';
    const s = sky(id, '#4a9ccc', '#f8e8c8');
    const glow = sun(id, 404, 70, 12, '#ffe7a8');
    const water = sea(id, 176);
    let body = s.body + glow.body + water.body;
    // A Jurassic lagoon: low islands, a sandy shore with cycads and conifers.
    body += `<path d="M230 178Q280 166 330 170Q370 164 420 176L420 180L230 180Z" fill="#8fae8a" opacity="0.7"/>`;
    // Beat 4: a great dinosaur on the far shore, which fades as time runs on.
    body += during(8.9, 10.6, `<g transform="translate(330 186) scale(0.9)" opacity="0.55"><path d="M-30 -24Q-50 -22 -66 -14Q-46 -16 -28 -16ZM-30 -28Q-6 -40 16 -26Q24 -20 18 -14L-24 -14Q-34 -18 -30 -28ZM12 -26Q22 -50 30 -66Q36 -70 40 -66L34 -62Q26 -44 20 -20Z" fill="#5f7468"/>` +
      `<path d="M-20 -16v16M-10 -15v15M6 -15v15M14 -16v16" stroke="#5f7468" stroke-width="5"/></g>`, 0.8);
    body += `<path d="M0 196Q110 190 220 198Q330 206 480 194L480 270L0 270Z" fill="url(#${id}-sand)"/>`;
    body += landAraucaria(44, 198, 120, '#3e6e48') + cycad(150, 206, 18, 4, `${id}-scale`) + cycad(440, 204, 26, 3.6, `${id}-scale`) + landFern(366, 208, 30, 30, '#5a8a48', 4.2);
    // Beat 1: the downy dinosaur warms its eggs.
    body += during(0, 3.0, `<g transform="translate(244 206)"><ellipse cy="-10" rx="52" ry="30" fill="url(#${id}-warm)"${mo('pulse', { s: 1.08, dur: 1.4 })}/></g>` +
      `<g transform="translate(244 206) scale(1.7)">${brooder()}</g>` + tag(236, 150, 'Daunen', 0.9), 0.3);
    // Beat 2: a male with vaned feathers on arms, legs and tail dances for a female.
    body += during(3.1, 6.0, `<g transform="translate(128 206) scale(1.5)">${anchiornis(false, '#8a7660', '#a86a4a')}</g>` +
      `<g transform="translate(296 206) scale(-1.8 1.8)"><g${once('enter', { dx: -60, dy: 0, delay: 3, dur: 0.6 })}><g${mo('float', { amp: 2, dur: 0.4, delay: 3.6 })}>` +
      `<g${mo('sway', { rot: 5, dur: 0.8, delay: 3.6, origin: '50% 100%' })}>${anchiornis(true, '#3a3a44', '#e0482a')}</g></g></g></g>`, 0.5);
    // Beat 3: Archaeopteryx runs, beats its wings and takes off.
    body += `<g transform="translate(50 206) scale(1.6)"><g${once('enter', { dx: -40, dy: 0, delay: 5.9, dur: 0.5, ease: 'linear' })}>` +
      `<g${once('move', { dx: 70, dy: 0, delay: 6.3, dur: 0.5, ease: 'linear' })}><g${once('birds-takeoff', { delay: 6.8, dur: 2.0, ease: 'ease-out' })}>` +
      `<g${once('move', { dx: 200, dy: -60, delay: 8.8, dur: 1.0, ease: 'ease-in' })}><g${once('fadeout', { delay: 9.0, dur: 0.5 })}><g${mo('float', { amp: 1, dur: 0.16 })}>${archaeopteryx()}</g></g></g></g></g></g></g>`;
    body += during(6.9, 8.2, tag(250, 112, 'Flügel', 6.9), 0.4) + sparkle(184, 172, '#fff3c4', 6.9);
    // Beat 4: millions of years on, a flock of birds crosses the land.
    let flock = '';
    for (let k = 0; k < 8; k++) {
      const [x, y] = [520 + Math.abs(k - 3.5) * 22 + (k % 2) * 6, 92 + (k - 3.5) * 9];
      flock += `<g transform="translate(${f(x)} ${f(y)}) scale(1.8)"><g${mo('float', { amp: 2, dur: 0.9, delay: -k * 0.2 })}>${flockBird(k)}</g></g>`;
    }
    body += `<g${mo('drift', { dx: -700, dy: 10, dur: 7, delay: 9.2, ease: 'linear' })}>${flock}</g>`;
    body += timelapse(240, 62, ['vor 150 Mio. J.', 'vor 66 Mio. J.', 'heute'], [9.0, 9.9, 10.9]);
    body += motes(id, 10, 'rgba(255,245,210,0.7)', 200, 470, 60, 170, 41, 1.1);
    const defs = s.defs + glow.defs + water.defs + vgrad(`${id}-sand`, [[0, '#ecdcae'], [1, '#c9b07e']]) + `<pattern id="${id}-scale" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M3 0.5L5.5 3L3 5.5L0.5 3Z" fill="none" stroke="rgba(40,25,10,0.4)" stroke-width="0.8"/></pattern>` + glowGrad(`${id}-warm`, '#ffb060', 0.45);
    return film(id, defs, body);
  };
}
