/* =============================================================================
 * SimEarth 2.0 — evolution film: mammals
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * Dimetrodon warms up in the dawn sun; over millions of years its line turns
 * into a whiskered cynodont and then into tiny furry Morganucodon; at night a
 * thermal lens shows it glowing warm beside a cold, sleeping reptile; in its
 * burrow a mother nurses her young.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  /** Dimetrodon, side view facing right, feet on y = 0: sail of long spines, deep head with fangs, sprawling legs. */
  function dimetrodon(skin: string, dark: string, sail: string): string {
    let spines = '';
    for (let k = 0; k < 9; k++) {
      const x = -34 + k * 7.6;
      const top = -38 - 58 * Math.sin(((k + 0.6) / 9.6) * Math.PI);
      spines += `M${f(x)} -36L${f(x + 1.4)} ${f(top)}`;
    }
    const leg = (x: number, col: string): string => `<path d="M${x} -20L${x + 9} -14L${x + 6} 0M${x + 6} 0l5 0" stroke="${col}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    return leg(-36, dark) + leg(16, dark) +
      `<path d="M-38 -34Q-30 -98 -2 -100Q24 -98 32 -34Z" fill="${sail}" opacity="0.92"/><path d="${spines}" stroke="${dark}" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M-40 -26Q-70 -18 -112 -6Q-70 -10 -40 -12Z" fill="${skin}"/>` +
      `<path d="M-46 -24Q-46 -40 -20 -40Q10 -42 30 -36Q42 -32 40 -20Q36 -10 20 -10L-30 -10Q-46 -12 -46 -24Z" fill="${skin}"/>` +
      `<path d="M34 -34Q44 -46 58 -44Q72 -42 74 -30Q74 -22 66 -20L40 -18Q32 -22 34 -34Z" fill="${skin}"/>` +
      `<path d="M44 -24L72 -25" stroke="${PAL.ink}" stroke-width="1" opacity="0.6"/><path d="M50 -24.4l1 2.4l1 -2.4M62 -24.8l1.2 3.4l1.2 -3.4M68 -25l0.8 2l0.8 -2" stroke="#ffffff" stroke-width="0.9" fill="none"/>` +
      `<path d="M-30 -14Q0 -11 30 -16" stroke="${dark}" stroke-width="2" fill="none" opacity="0.5"/>` + eye(58, -35, 2.2) +
      leg(-30, skin) + leg(22, skin);
  }

  /** A cynodont (Thrinaxodon-like), side view facing right, feet on y = 0: low, dog-like, whiskered, legs more under the body. */
  function cynodont(): string {
    const [c, d] = ['#9a7652', '#6a4e34'];
    const leg = (x: number, col: string): string => `<path d="M${x} -14L${x + 3} -7L${x + 1} 0l4 0" stroke="${col}" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    let fur = '';
    for (let k = 0; k < 8; k++) fur += `M${-26 + k * 6} ${f(-25 - Math.sin((k / 7) * Math.PI) * 3)}l2 -2.4`;
    return leg(-22, d) + leg(14, d) +
      `<path d="M-28 -16Q-46 -12 -62 -6Q-46 -8 -28 -10Z" fill="${c}"/>` +
      `<path d="M-32 -16Q-32 -28 -14 -29Q8 -30 22 -24Q30 -20 28 -13Q24 -8 14 -8L-22 -8Q-32 -10 -32 -16Z" fill="${c}"/>` +
      `<path d="M22 -24Q30 -32 40 -30Q50 -27 54 -19Q54 -15 48 -14L28 -12Z" fill="${c}"/><path d="${fur}" stroke="${d}" stroke-width="1" stroke-linecap="round"/>` +
      `<path d="M30 -16L52 -17" stroke="${PAL.ink}" stroke-width="0.8" opacity="0.6"/><path d="M44 -16.6l0.8 2.2l0.8 -2.2" stroke="#ffffff" stroke-width="0.8" fill="none"/>` +
      `<path d="M50 -19l9 -3M50 -18l10 0M50 -17l9 3" stroke="#f2ead6" stroke-width="0.6"/>` + eye(39, -24, 1.8) + `<circle cx="54" cy="-19" r="1.3" fill="#3a2a1a"/>` +
      leg(-18, c) + leg(18, c);
  }

  /** Morganucodon, side view facing right, on y = 0: a furry shrew-sized mammal with whiskers, big night eyes and a round ear. */
  function shrew(fur: string, belly: string, dark: string, rim = ''): string {
    // An optional light rim: the silhouette drawn a little wider underneath.
    const outline = rim ? `<path d="M-20 -6Q-22 -20 -6 -22Q8 -23 12 -14Q14 -6 8 -2Q-4 0 -16 -1Q-20 -2 -20 -6ZM4 -18Q8 -24 14 -22Q20 -20 26 -13Q28 -11 26 -10Q18 -8 10 -9Q4 -11 4 -18Z" fill="${rim}" stroke="${rim}" stroke-width="3.4" stroke-linejoin="round"/>` +
      `<ellipse cx="8" cy="-22" rx="5.2" ry="5.8" fill="${rim}"/><path d="M-18 -4Q-30 -2 -40 -6" stroke="${rim}" stroke-width="4.4" fill="none" stroke-linecap="round"/>` : '';
    return outline + `<path d="M-18 -4Q-30 -2 -40 -6" stroke="${dark}" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="-14" cy="-1.6" rx="5" ry="2" fill="${dark}"/>` +
      `<path d="M-20 -6Q-22 -20 -6 -22Q8 -23 12 -14Q14 -6 8 -2Q-4 0 -16 -1Q-20 -2 -20 -6Z" fill="${fur}"/><path d="M-16 -3Q-2 -1 8 -4Q4 -8 -6 -8Q-14 -7 -16 -3Z" fill="${belly}"/>` +
      `<path d="M-15 -19q2 -2 4 -1M-8 -21q2 -2 4 -1M-1 -21.4q2 -2 4 -1M-18 -12q2 -2 4 -1" stroke="${dark}" stroke-width="1" fill="none"/>` +
      `<ellipse cx="12" cy="-1.4" rx="3" ry="1.6" fill="${dark}"/>` +
      `<path d="M4 -18Q8 -24 14 -22Q20 -20 26 -13Q28 -11 26 -10Q18 -8 10 -9Q4 -11 4 -18Z" fill="${fur}"/>` +
      `<ellipse cx="8" cy="-22" rx="3.6" ry="4.2" fill="${fur}"/><ellipse cx="8.4" cy="-21.6" rx="2" ry="2.6" fill="${belly}"/>` +
      eye(15, -16, 2.4) + `<circle cx="26.4" cy="-11.6" r="1.4" fill="#e48a8a"/>` +
      `<g${mo('sway', { rot: 8, dur: 0.35, origin: '0% 50%' })}><path d="M23 -12l9 -4M23 -11.5l10 -0.5M23 -11l9 3.5" stroke="rgba(245,240,225,0.9)" stroke-width="0.6"/></g>`;
  }

  /** The thermal view: dark cold night, a sleeping reptile in cold blue, the little mammal glowing warm; it scurries and snaps a moth. */
  function thermal(id: string): string {
    let out = `<rect x="-80" y="-80" width="160" height="160" fill="#1c1748"/><rect x="-80" y="30" width="160" height="50" fill="#2a2366"/>` +
      `<path d="M-80 30Q-40 24 0 28Q40 32 80 26" stroke="#3a3488" stroke-width="2" fill="none"/>` +
      `<path d="M-70 30Q-64 4 -50 -6M-62 30Q-50 10 -34 6M50 30Q56 6 72 -2" stroke="#2c2c7a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    out += `<g transform="translate(-30 36)">${landLizard('#4a66e0', '#2c3ea0', null, '#6a80ea')}<ellipse cx="19" cy="-9.4" rx="2" ry="1.8" fill="#4a66e0"/><path d="M17.2 -9.4q1.8 1.2 3.6 0" stroke="#22307a" stroke-width="0.9" fill="none"/></g>` +
      `<path d="M-14 24q3 -2 6 0" stroke="#22307a" stroke-width="1.2" fill="none"/>`;
    // The moth: cold-bodied, flutters until the mammal snaps it.
    out += `<g transform="translate(44 -12) scale(1.7)"><g${once('fadeout', { delay: 7.95, dur: 0.1 })}><g${mo('swim', { dx: 6, amp: 4, dur: 1.6 })}><g${mo('flap', { dur: 0.12, s: 0.25, origin: '50% 100%' })}>` +
      `<path d="M0 0L-6 -6L-1 -2L0 -7L1 -2L6 -6Z" fill="#5a9ae0"/></g><ellipse rx="1.3" ry="2.8" fill="#3f78c0"/></g></g></g>`;
    // The mammal: white-hot core, yellow and orange to the edges, a halo of warmth.
    out += `<g transform="translate(30 30) scale(1.25)"><g${once('move', { dx: -22, dy: 0, delay: 6.4, dur: 0.6 })}><g${once('move', { dx: 14, dy: 0, delay: 7.1, dur: 0.6 })}>` +
      `<g${once('move', { dx: 4, dy: -18, delay: 7.75, dur: 0.22, ease: 'ease-out' })}><g${once('move', { dx: 0, dy: 18, delay: 8.1, dur: 0.3, ease: 'ease-in' })}>` +
      `<ellipse cx="-2" cy="-12" rx="34" ry="22" fill="url(#${id}-halo)"${mo('pulse', { s: 1.1, dur: 1 })}/>` +
      `${shrew(`url(#${id}-heat)`, '#fff6c8', '#ff8a3a')}</g></g></g></g></g>`;
    return out;
  }

  /** The burrow: the mother lies curled on dry fronds, three naked young drink milk at her belly. */
  function burrow(id: string): string {
    let young = '';
    [[-12, 0], [-1, 1.5], [10, 0.5]].forEach(([x, r], k) => {
      young += `<g transform="translate(${x} 4) rotate(${-10 + k * 8})"><g${mo('pulse', { s: 1.08, dur: 0.5, delay: -k * 0.17, origin: '50% 50%' })}>` +
        `<ellipse cx="0" cy="${r}" rx="6" ry="3.6" fill="#f2b8a8"/><circle cx="4" cy="${r - 1.6}" r="2.6" fill="#f2b8a8"/><path d="M5 ${r - 2.6}h1" stroke="#a86a5a" stroke-width="0.8"/></g></g>`;
    });
    let milk = '';
    for (const [x, k] of [[-9, 0], [2, 1], [13, 2]] as const) {
      milk += `<g transform="translate(${x} -1)"><circle r="2.1" fill="#ffffff"${mo('rise', { dy: 6, dur: 0.9, delay: f(9.6 + k * 0.3), o: 1 })}/></g>`;
    }
    return `<ellipse rx="56" ry="27" fill="#2a1a10"/><ellipse rx="56" ry="27" fill="url(#${id}-den)"/>` +
      `<path d="M-48 14Q-20 24 20 22Q44 20 52 12" stroke="#6a5a2a" stroke-width="5" fill="none" stroke-linecap="round"/>` +
      `<g transform="translate(-4 14) scale(1.35)"><g transform="rotate(-6)">${shrew('#a8794c', '#ecd2a8', '#7a5230')}</g>` +
      `<g transform="translate(-2 -2)">${young}${milk}</g></g>`;
  }

  EVO_FILMS.mammals = (): string => {
    const id = 'mammals';
    const s = sky(id, '#304a7a', '#f2b58a');
    const glow = sun(id, 70, 156, 14, '#ffd27a');
    const view = lens(`${id}-lens`, 240, 122, 72, thermal(id), 6.0, 9.0);
    let body = s.body + `<g${once('move', { dy: 80, delay: 3.4, dur: 2.6, ease: 'ease-in' })}>${glow.body}</g>` + hills(170, 16, '#a86a52', 61, 0.55);
    // Morning rays reach the sail: the cold animal warms up.
    body += during(0.3, 3.2, `<path d="M70 150L250 96L262 120L80 160Z" fill="#ffd9a0" opacity="0.28"/><path d="M70 152L242 142L246 160L76 160Z" fill="#ffd9a0" opacity="0.2"/>`, 0.8);
    // The burrow mound on the right, the red Permian ground.
    body += `<path d="M0 198Q100 192 200 196Q260 198 300 196Q340 150 400 140Q450 136 480 146L480 270L0 270Z" fill="url(#${id}-ground)"/>`;
    // Dimetrodon (cold blue, then warm) turns over generations into a cynodont and Morganucodon.
    const dime = `<g transform="scale(1.1)">${dimetrodon('#6f86a8', '#4f6688', '#8aa0c4')}<g${once('fade', { delay: 0.6, dur: 2.2 })}>${dimetrodon('#c0703a', '#8a4a22', '#e08a50')}</g></g>`;
    const forms = [dime, `<g transform="scale(1.15)">${cynodont()}</g>`, `<g transform="scale(1.45)">${shrew('#c4884e', '#f2d6a6', '#7a4a26', '#ffe9c2')}</g>`];
    body += `<g transform="translate(232 199)"><g${once('fadeout', { delay: 6.0, dur: 0.4 })}>${morph(forms, [3.9, 4.6], 0.5)}</g></g>`;
    body += during(0.9, 3.0, tag(318, 134, 'Synapside', 0.9), 0.4);
    body += timelapse(250, 64, ['vor 290 Mio. J.', 'vor 250 Mio. J.', 'vor 200 Mio. J.'], [3.0, 3.9, 4.6], 6.0);
    // Night falls; ferns and the first conifers stand dark.
    let night = `<rect width="480" height="270" fill="#0a1430" opacity="0.72"/>`;
    const rnd = seeded(51);
    for (let k = 0; k < 22; k++) night += `<circle cx="${f(220 + rnd() * 260)}" cy="${f(8 + rnd() * 100)}" r="${f(0.5 + rnd() * 0.9)}" fill="#ffffff"${mo('twinkle', { dur: f(1.2 + rnd() * 2.4), delay: f(-rnd() * 3), o: 0.15 })}/>`;
    night += `<circle cx="402" cy="62" r="11" fill="#f2eed6"/>`;
    body += during(5.6, Infinity, night, 0.7);
    body += during(5.7, Infinity, landFern(20, 200, 50, 46, '#1c3430', 4.2) + landFern(160, 200, -40, 40, '#1c3430', 3.8) + landFern(296, 202, 30, 34, '#1e3a34', 4.6) + `<path d="M110 198V96" stroke="#16241e" stroke-width="3"/><path d="M110 92L98 112H122ZM110 104L94 128H126ZM110 118L90 146H130ZM110 134L88 166H132Z" fill="#16302c"/>` + landFern(84, 200, -34, 30, '#1c3430', 4.4), 1);
    // Beat 3: the thermal lens.
    body += view.body + during(0, 9.0, tag(282, 92, 'warmes Blut', 6.4), 0.5) + sparkle(262, 158, '#ffd27a', 6.6);
    // Beat 4: the mound is cut open: inside, the mother nurses her young.
    let cut = `<path d="M316 202Q350 160 404 151Q448 147 480 155L480 270L310 270Z" fill="url(#${id}-soil)"/>` +
      `<path d="M330 206Q400 196 480 202M326 216Q400 210 480 216" stroke="#7a4a30" stroke-width="1.4" fill="none" opacity="0.6"/>`;
    for (const [x, y, r] of [[336, 212, 3], [452, 172, 2.6], [470, 222, 3.4], [360, 184, 2.2]] as const) cut += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f(r * 0.7)}" fill="#a0745a"/>`;
    cut += `<path d="M344 170Q356 166 372 178L364 184Q354 176 346 178Z" fill="#1a100a"/><g transform="translate(406 196)">${burrow(id)}</g>`;
    body += during(8.8, Infinity, cut, 0.8);
    body += during(9.4, Infinity, tag(404, 160, 'Milch', 9.6), 0.4);
    const defs = s.defs + glow.defs + view.defs + vgrad(`${id}-ground`, [[0, '#b0674a'], [1, '#5e3226']]) +
      `<radialGradient id="${id}-heat" cx="0.55" cy="0.5" r="0.6"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#ffe45a"/><stop offset="0.75" stop-color="#ff8a2a"/><stop offset="1" stop-color="#e0402a"/></radialGradient>` +
      glowGrad(`${id}-halo`, '#ff7a2a', 0.55) + glowGrad(`${id}-den`, '#ffb070', 0.35) + vgrad(`${id}-soil`, [[0, '#9a6646'], [0.55, '#6a3c28'], [1, '#2a1a14']]);
    return film(id, defs, body);
  };
}
