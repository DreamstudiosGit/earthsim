/* =============================================================================
 * SimEarth 2.0 — evolution film: grazers
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * A fox-sized Eohippus browses in the Eocene forest; over 50 million years
 * the forest opens into grassland and the horse grows tall and long-legged;
 * two lenses show four toes becoming one hoof and low cheek teeth becoming
 * high ones; then a herd gallops over the steppe.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  interface HorsePlan { L: number; H: number; leg: number; neck: number; head: number; hoof: boolean; col: string; dark: string; mane: boolean; tail: number }

  /** A horse of any stage, facing left, feet on y = 0, centred between its front and hind feet. */
  function horse(p: HorsePlan): string {
    const top = -(p.leg + p.H);
    const w = p.L * 0.06;
    const [fx, hx] = [-p.L * 0.33, p.L * 0.33];
    const leg = (x: number, col: string, hind: boolean): string => {
      const y0 = -p.leg - p.H * 0.35;
      const k = hind ? w * 1.4 : 0;
      let d = `M${f(x - w)} ${f(y0)}L${f(x + w)} ${f(y0)}L${f(x + k + w * 0.55)} ${f(-p.leg * 0.45)}L${f(x + w * 0.4)} ${f(-p.leg * 0.08)}L${f(x - w * 0.4)} ${f(-p.leg * 0.08)}L${f(x + k - w * 0.55)} ${f(-p.leg * 0.45)}Z`;
      d = `<path d="${d}" fill="${col}"/>`;
      return d + (p.hoof
        ? `<path d="M${f(x - w * 0.5)} ${f(-p.leg * 0.08)}L${f(x + w * 0.5)} ${f(-p.leg * 0.08)}L${f(x + w * 0.75)} 0L${f(x - w * 0.75)} 0Z" fill="${PAL.ink}"/>`
        : `<path d="M${f(x - w * 0.6)} ${f(-p.leg * 0.08)}l-1 ${f(p.leg * 0.08)}M${f(x)} ${f(-p.leg * 0.08)}v${f(p.leg * 0.08)}M${f(x + w * 0.6)} ${f(-p.leg * 0.08)}l1 ${f(p.leg * 0.08)}" stroke="${PAL.ink}" stroke-width="1.3" stroke-linecap="round"/>`);
    };
    // Neck rising up and forward from the chest, head angled down to the muzzle.
    const a = (52 * Math.PI) / 180;
    const [bx, by] = [-p.L * 0.42, top + p.H * 0.25];
    const [nx, ny] = [bx - Math.cos(a) * p.neck, by - Math.sin(a) * p.neck];
    const h = (38 * Math.PI) / 180;
    const [mx, my] = [nx - Math.cos(h) * p.head, ny + Math.sin(h) * p.head];
    const nw = p.H * 0.36;
    const neck = `M${f(bx + nw)} ${f(by - nw * 0.4)}L${f(nx + nw * 0.55)} ${f(ny - nw * 0.2)}L${f(nx - nw * 0.4)} ${f(ny + nw * 0.6)}L${f(bx - nw * 0.9)} ${f(by + nw * 1.4)}Z`;
    const hw = p.head * 0.2;
    const headD = `M${f(nx + hw * 0.6)} ${f(ny - hw * 0.7)}Q${f(nx - hw)} ${f(ny - hw * 1.3)} ${f(mx - hw * 0.1)} ${f(my - hw * 0.5)}Q${f(mx - hw * 0.5)} ${f(my + hw * 0.6)} ${f(mx + hw * 0.4)} ${f(my + hw * 0.5)}Q${f(nx - hw * 0.4)} ${f(ny + hw * 1.6)} ${f(nx + hw * 0.6)} ${f(ny + hw * 0.8)}Z`;
    const tail = p.tail > 0
      ? `<path d="M${f(p.L * 0.47)} ${f(top + p.H * 0.2)}Q${f(p.L * 0.62)} ${f(top + p.tail * 0.4)} ${f(p.L * 0.56)} ${f(top + p.tail)}Q${f(p.L * 0.5)} ${f(top + p.tail * 0.5)} ${f(p.L * 0.44)} ${f(top + p.H * 0.35)}Z" fill="${p.dark}"/>`
      : `<path d="M${f(p.L * 0.47)} ${f(top + p.H * 0.25)}q${f(p.L * 0.12)} 2 ${f(p.L * 0.14)} ${f(p.H * 0.5)}" stroke="${p.col}" stroke-width="${f(w * 0.8)}" fill="none" stroke-linecap="round"/>`;
    return leg(fx + 3, p.dark, false) + leg(hx + 3, p.dark, true) + tail +
      `<path d="M${f(-p.L * 0.5)} ${f(-p.leg - p.H * 0.4)}Q${f(-p.L * 0.5)} ${f(top)} ${f(-p.L * 0.2)} ${f(top + 1)}Q0 ${f(top - p.H * 0.12)} ${f(p.L * 0.3)} ${f(top)}` +
      `Q${f(p.L * 0.52)} ${f(top)} ${f(p.L * 0.5)} ${f(-p.leg - p.H * 0.45)}Q${f(p.L * 0.48)} ${f(-p.leg)} ${f(p.L * 0.3)} ${f(-p.leg + 1)}L${f(-p.L * 0.3)} ${f(-p.leg + 1)}Q${f(-p.L * 0.5)} ${f(-p.leg)} ${f(-p.L * 0.5)} ${f(-p.leg - p.H * 0.4)}Z" fill="${p.col}"/>` +
      `<path d="${neck}" fill="${p.col}"/><path d="${headD}" fill="${p.col}"/>` +
      (p.mane ? `<path d="M${f(bx + nw)} ${f(by - nw * 0.4)}L${f(nx + nw * 0.55)} ${f(ny - nw * 0.2)}L${f(nx + nw * 1.1)} ${f(ny + nw * 0.3)}L${f(bx + nw * 1.6)} ${f(by + nw * 0.2)}Z" fill="${p.dark}"/>` : '') +
      `<path d="M${f(nx + hw * 0.3)} ${f(ny - hw * 0.8)}l${f(hw * 0.2)} ${f(-hw * 1.6)}l${f(hw * 0.7)} ${f(hw * 1.4)}Z" fill="${p.dark}"/>` +
      eye(nx - hw * 0.5, ny - hw * 0.1, Math.max(1, hw * 0.28)) +
      `<path d="M${f(-p.L * 0.3)} ${f(-p.leg + 1)}Q0 ${f(-p.leg + 3)} ${f(p.L * 0.3)} ${f(-p.leg + 1)}" stroke="#f0d8aa" stroke-width="${f(p.H * 0.18)}" fill="none" opacity="0.6"/>` +
      leg(fx, p.col, false) + leg(hx, p.col, true);
  }

  const STAGES: readonly HorsePlan[] = [
    { L: 46, H: 15, leg: 21, neck: 13, head: 15, hoof: false, col: '#9a5a34', dark: '#6e3e20', mane: false, tail: 0 },
    { L: 58, H: 19, leg: 32, neck: 19, head: 20, hoof: false, col: '#a8703e', dark: '#764c28', mane: false, tail: 0 },
    { L: 74, H: 23, leg: 46, neck: 28, head: 26, hoof: false, col: '#b88048', dark: '#6a4424', mane: true, tail: 34 },
    { L: 92, H: 29, leg: 62, neck: 38, head: 34, hoof: true, col: '#c8955a', dark: '#5a3a22', mane: true, tail: 48 },
  ];

  /** The lens on the front foot, bones seen from the front: four toes, then three, then one with a hoof. */
  function foot(): string {
    const bone = (d: string, w: number): string => `<path d="${d}" stroke="#7a6a50" stroke-width="${w + 2.4}" stroke-linecap="round"/><path d="${d}" stroke="#fffaf0" stroke-width="${w}" stroke-linecap="round"/>`;
    const toe = (x: number, top: number, len: number, w: number): string => bone(`M${x} ${top}V${top + len}`, w) + `<ellipse cx="${x}" cy="${top + len + 3}" rx="${f(w * 0.75)}" ry="${f(w * 0.5)}" fill="#2a1c12"/>`;
    const skin = (wd: number): string => `<path d="M${-wd} -60L${wd} -60L${wd * 0.9} 20Q${wd} 30 ${wd * 1.2} 32L${-wd * 1.2} 32Q${-wd} 30 ${-wd * 0.9} 20Z" fill="rgba(170,110,60,0.45)"/>`;
    const forms = [
      skin(28) + bone('M0 -60V-4', 7) + toe(-17, -10, 30, 5) + toe(-6, -2, 28, 6) + toe(6, -2, 28, 6) + toe(17, -8, 28, 5),
      skin(22) + bone('M0 -60V0', 8) + toe(-13, -6, 30, 5) + toe(0, 2, 24, 8) + toe(13, -6, 30, 5),
      skin(16) + bone('M0 -60V4', 10) + bone('M-8 -44V-16M8 -44V-16', 3) + bone('M0 4V18', 9) + `<path d="M-13 32L-9 16Q0 11 9 16L13 32Z" fill="#2a1c12"/>`,
    ];
    return `<rect x="-60" y="-60" width="120" height="120" fill="#c8d4a0"/><rect x="-60" y="32" width="120" height="30" fill="#7a6040"/>` +
      `<path d="M-40 32l-3 -10M-30 32l2 -12M26 32l3 -11M38 32l-2 -9" stroke="#6f8a3e" stroke-width="2" stroke-linecap="round"/>` + morph(forms, [6.6, 7.3], 0.25);
  }

  /** The lens on the cheek teeth, cut through the jaw: low crowns with roots, then high crowns that reach deep into the jaw. */
  function teeth(): string {
    const low = (cx: number): string =>
      `<path d="M${cx - 12} -6L${cx - 12} -13Q${cx - 9} -22 ${cx - 6} -15Q${cx - 3} -23 ${cx} -15Q${cx + 3} -23 ${cx + 6} -15Q${cx + 9} -22 ${cx + 12} -13L${cx + 12} 4L${cx + 9} 26L${cx + 5} 6L${cx - 5} 6L${cx - 9} 26L${cx - 12} 4Z" fill="#fffdf6" stroke="#8a7a60" stroke-width="1.4"/>`;
    const high = (cx: number): string =>
      `<path d="M${cx - 12} -22L${cx + 12} -22L${cx + 12} 44L${cx + 8} 54L${cx + 4} 46L${cx - 4} 46L${cx - 8} 54L${cx - 12} 44Z" fill="#fffdf6" stroke="#8a7a60" stroke-width="1.4"/>` +
      `<path d="M${cx - 6} -21Q${cx - 9} 10 ${cx - 6} 40M${cx + 6} -21Q${cx + 9} 10 ${cx + 6} 40M${cx} -21Q${cx - 3} 10 ${cx} 40" stroke="#d6cbb0" stroke-width="1.4" fill="none"/>`;
    return `<rect x="-60" y="-60" width="120" height="120" fill="#d6ead8"/><rect x="-60" y="-8" width="120" height="70" fill="#d9c49a"/>` +
      `<path d="M-60 -12Q-40 -4 -28 -12Q-14 -4 0 -12Q14 -4 28 -12Q40 -4 60 -12L60 -4L-60 -4Z" fill="#e0a0a0"/>` +
      `<path d="M-52 -30q10 -6 22 -2q10 -8 22 0M10 -32q12 -6 24 0q8 -5 16 0" stroke="#6f9a3e" stroke-width="3.4" fill="none" stroke-linecap="round"/>` +
      `<circle cx="-40" cy="-31" r="1.4" fill="#ffffff"/><circle cx="-18" cy="-31" r="1.4" fill="#ffffff"/><circle cx="24" cy="-33" r="1.4" fill="#ffffff"/>` +
      morph([low(-14) + low(14), high(-14) + high(14)], [6.9], 0.6);
  }

  /** A galloping silhouette facing left: horse or antelope. Legs swing, dust flies. */
  function runner(kind: number, k: number): string {
    const c = ['#7a5838', '#9a7448'][kind];
    const shape = [
      'M-16 -20Q-16 -28 -6 -28Q8 -27 16 -27Q22 -26 21 -19Q20 -14 14 -14L-12 -14Q-16 -15 -16 -20ZM-13 -24L-21 -35L-30 -31L-29 -28L-21 -30L-8 -21ZM20 -25Q28 -24 29 -15L26 -15Q25 -21 19 -21Z',
      'M-12 -20Q-12 -26 -4 -26Q8 -26 13 -25Q17 -23 16 -19Q14 -16 10 -16L-9 -16Q-12 -17 -12 -20ZM-10 -23L-15 -34L-11 -35L-6 -24ZM-15 -34L-22 -30L-21 -28L-12 -31ZM15 -24l4 -1l-1 4Z',
    ][kind];
    const legs = (x: number, d: number): string => `<g transform="translate(${x} -17)"><g${mo('sway', { rot: 28, dur: 0.17, delay: d, origin: '50% 0%' })}>` +
      `<path d="M0 0L-4 16M0 0L4 15" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></g></g>`;
    const horns = kind === 1 ? `<path d="M-13 -34l1 -8M-11 -34l3 -7" stroke="${c}" stroke-width="1.2" stroke-linecap="round"/>` : '';
    return (k % 2 ? '' : `<g transform="translate(14 0)">${landDust(-k * 0.23, 0.8, '#e2cfa6')}</g>`) +
      `<g${mo('float', { amp: 1.2, dur: 0.17, delay: f(-k * 0.05) })}>${legs(-11, -k * 0.05)}${legs(12, -k * 0.05 - 0.09)}<path d="${shape}" fill="${c}"/>${horns}</g>`;
  }

  /** A row of grass tufts growing up from `t0` s, from left to right. */
  function grassRow(y: number, sc: number, step: number, cols: readonly string[], t0: number, seed: number): string {
    const rnd = seeded(seed);
    let out = '';
    for (let x = -10; x < 490; x += step) {
      const h = (12 + rnd() * 8) * sc;
      out += `<g transform="translate(${f(x + rnd() * step * 0.5)} ${y})"><g${once('grow', { delay: f(t0 + (x / 480) * 0.8), dur: 0.7 })}>` +
        `<path d="M0 0Q-3 ${f(-h * 0.6)} -6 ${f(-h)}M0 0Q0 ${f(-h * 0.7)} 1 ${f(-h * 1.1)}M0 0Q3 ${f(-h * 0.6)} 7 ${f(-h * 0.9)}" stroke="${cols[Math.floor(rnd() * cols.length)]}" stroke-width="${f(1.6 * sc)}" fill="none" stroke-linecap="round"/></g></g>`;
    }
    return out;
  }

  EVO_FILMS.grazers = (): string => {
    const id = 'grazers';
    const s = sky(id, '#5a9a9a', '#dce8c8');
    const glow = sun(id, 410, 70, 12);
    const toes = lens(`${id}-foot`, 296, 170, 40, foot(), 6.0, 9.0);
    const jaw = lens(`${id}-teeth`, 184, 104, 42, teeth(), 6.0, 9.0);
    let body = s.body + `<rect width="480" height="190" fill="url(#${id}-dry)"${once('fade', { delay: 3.6, dur: 2.4 })}/>` + glow.body + hills(176, 14, '#93b29a', 51, 0.7);
    body += `<path d="M0 198Q160 192 320 197T480 194L480 270L0 270Z" fill="url(#${id}-ground)"/>`;
    body += `<path d="M0 198Q160 192 320 197T480 194L480 270L0 270Z" fill="#c4b468"${once('fade', { delay: 4.4, dur: 1.2 })}/>`;
    // The Eocene forest: thins out at 35 Mio. years, gone by 15.
    let far = '', near = '';
    const rnd = seeded(12);
    for (let k = 0; k < 10; k++) {
      const [x, y, r] = [k * 50 + rnd() * 16, 120 + rnd() * 24, 32 + rnd() * 12];
      far += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${k % 2 ? '#4a7e4c' : '#56905a'}"/>`;
    }
    far = `<rect y="130" width="480" height="70" fill="#3f6e44"/>${far}`;
    for (const [x, y, r] of [[40, 160, 32], [120, 150, 26], [430, 156, 34], [372, 168, 24]] as const) {
      near += `<path d="M${x - 4} 206L${x - 3} ${y}L${x + 3} ${y}L${x + 4} 206Z" fill="#4b3622"/><circle cx="${x}" cy="${y - r * 0.3}" r="${r}" fill="#36703e"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.55}" r="${f(r * 0.5)}" fill="#4a8a4c"/>`;
    }
    body += during(0, 3.75, far, 0.8) + during(0, 4.5, near, 0.8);
    // The browse: leaves the little horse nibbles, then the forest is gone.
    body += during(0, 3.6, `<g transform="translate(244 170)"><circle r="16" fill="#4a8a4a"/><circle cx="-10" cy="6" r="10" fill="#5a9c55"/>` +
      `<g${once('fadeout', { delay: 1.3, dur: 0.3 })}><ellipse cx="12" cy="4" rx="5" ry="3" fill="#6ab060"/></g><g${once('fadeout', { delay: 2.3, dur: 0.3 })}><ellipse cx="10" cy="10" rx="5" ry="3" fill="#6ab060"/></g></g>` +
      `<path d="M244 186V206" stroke="#5b4330" stroke-width="3"/>`, 0.6);
    // A lone tree of the open plain, and grass spreading from 15 Mio. years ago.
    body += during(4.5, Infinity, `<g transform="translate(424 198)"><path d="M0 0V-34M0 -30l-14 -10M0 -26l12 -12" stroke="#6b5a40" stroke-width="3" fill="none"/><ellipse cx="-2" cy="-44" rx="30" ry="8" fill="#6f9a4a"/></g>`, 0.8);
    body += grassRow(200, 0.5, 60, ['#a9a75a', '#b7b062'], 4.5, 5);
    // The horse: Eohippus → Mesohippus → Merychippus → Equus, bigger and longer-legged.
    const forms = STAGES.map((p) => horse(p));
    body += `<g transform="translate(300 206)"><g${once('fadeout', { delay: 9.0, dur: 0.5 })}><g${mo('float', { amp: 0.4, dur: 2 })}>${morph(forms, [3.75, 4.5, 5.25], 0.6)}</g></g></g>`;
    body += timelapse(320, 62, ['vor 55 Mio. J.', 'vor 35 Mio. J.', 'vor 15 Mio. J.', 'vor 5 Mio. J.'], [3.0, 3.75, 4.5, 5.25], 6.2);
    // Beat 3: lenses on the cheek teeth and on the front foot.
    body += jaw.body + toes.body + during(0, 9.0, tag(184, 162, 'hohe Zähne', 7.0) + tag(354, 200, 'Huf', 7.3, 'start'), 0.5) + sparkle(328, 194, '#fff3c4', 7.8, 0.7);
    // Beat 4: a herd of horses and antelopes gallops over the steppe.
    let herd = '';
    [[510, 206, 1.35, 0], [566, 198, 1.15, 1], [622, 210, 1.4, 0], [680, 200, 1.15, 1], [738, 208, 1.35, 0]].forEach(([x, y, sc, kind], k) => {
      herd += `<g transform="translate(${x} ${y}) scale(${sc})">${runner(kind, k)}</g>`;
    });
    body += during(8.8, Infinity, `<g${mo('drift', { dx: -900, dy: 0, dur: 6.5, delay: 9.0, ease: 'linear' })}><ellipse cx="660" cy="200" rx="220" ry="16" fill="url(#${id}-dust)"/>${herd}</g>`, 0.3);
    body += grassRow(222, 0.85, 52, ['#9aa64e', '#aeb05a'], 4.7, 6);
    const defs = s.defs + glow.defs + toes.defs + jaw.defs + vgrad(`${id}-dry`, [[0, 'rgba(120,180,220,0.5)'], [1, 'rgba(244,224,170,0.9)']]) +
      vgrad(`${id}-ground`, [[0, '#6f9a4a'], [1, '#4a6a30']]) + glowGrad(`${id}-dust`, '#f1e2bd', 0.8);
    return film(id, defs, body);
  };
}
