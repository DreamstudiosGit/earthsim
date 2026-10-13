/* =============================================================================
 * SimEarth 2.0 — evolution film: vascular (water pipes in the stem)
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md. A Silurian river bank where
 * everything is flat green mats; a lens shows the inside of a young stem —
 * tubes stiffened with rings, blue water drops rising in them; then the water
 * climbs and Cooksonia grows up, forking, with spore capsules on its tips,
 * several plants at once, breathing out little puffs of vapour; at last the
 * capsules burst and the wind carries the spores far over the low mats.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** The hero plant's base and scale. */
  const HX = 200;
  const HY = 206;
  const SC = 1.2;
  /** Cooksonia, base at the origin: forking stem segments [x0, y0, cx, cy, x1, y1, level]. */
  const COOK: readonly (readonly [number, number, number, number, number, number, number])[] = [
    [-1, -20, -1.8, -40, 0, -62, 0],
    [0, -62, -6, -78, -16, -92, 1], [0, -62, 8, -76, 14, -90, 1],
    [-16, -92, -22, -102, -24, -116, 2], [-16, -92, -12, -104, -8, -118, 2],
    [14, -90, 10, -100, 8, -114, 2], [14, -90, 20, -100, 27, -112, 2],
  ];
  const TIPS: readonly (readonly [number, number])[] = [[-24, -116], [-8, -118], [8, -114], [27, -112]];
  const WIDTH = [4.4, 3.3, 2.5];
  const STUB = 'M0 0Q-1.2 -10 -1 -20';

  /** A sporangium on a stem tip: a kidney-shaped capsule. */
  const capsule = (): string =>
    `<path d="M-1.8 1L-3.4 -2L3.4 -2L1.8 1Z" fill="#6aa850"/><ellipse cy="-4" rx="5.6" ry="4" fill="#d6a640"/><path d="M-4.4 -5.4Q0 -8.6 4.4 -5.4" stroke="#f2cd73" stroke-width="1.2" fill="none"/>`;

  /** A whole Cooksonia, static, as a def for the others along the river. */
  function cooksoniaDef(defId: string): string {
    let out = `<g id="${defId}"><path d="${STUB}" stroke="#5f9e4a" stroke-width="${WIDTH[0]}" fill="none" stroke-linecap="round"/>`;
    for (let lv = 0; lv < 3; lv++) {
      out += `<path d="${COOK.filter((s) => s[6] === lv).map(([x0, y0, cx, cy, x1, y1]) => `M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}`).join('')}" stroke="#5f9e4a" stroke-width="${WIDTH[lv]}" fill="none" stroke-linecap="round"/>`;
    }
    for (const [x, y] of TIPS) out += `<g transform="translate(${x} ${y})">${capsule()}</g>`;
    return out + '</g>';
  }

  /** A low, lumpy green mat on the mud: the liverwort-like plants of the step before. */
  const mat = (x: number, y: number, w: number, h: number): string =>
    `<path d="M${x - w} ${y}Q${f(x - w * 0.7)} ${f(y - h)} ${f(x - w * 0.25)} ${f(y - h * 0.7)}Q${x} ${f(y - h * 1.3)} ${f(x + w * 0.4)} ${f(y - h * 0.7)}Q${x + w} ${f(y - h * 0.8)} ${x + w} ${y}Z" fill="#6fae55"/>` +
    `<path d="M${f(x - w * 0.6)} ${f(y - h * 0.5)}q${f(w * 0.3)} ${f(-h * 0.5)} ${f(w * 0.6)} 0" stroke="#9ad27a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;

  /** The lens: a young stem cut open lengthwise — skin, soft tissue and three ringed tubes with water rising. */
  function stemInside(): string {
    let out = `<rect x="-70" y="-70" width="140" height="140" fill="#d3e9ef"/><rect x="-44" y="-70" width="88" height="140" fill="#a9d382"/>` +
      `<rect x="-44" y="-70" width="8" height="140" fill="#5f9e4a"/><rect x="36" y="-70" width="8" height="140" fill="#5f9e4a"/>` +
      `<path d="M-44 -70V70M44 -70V70" stroke="#3f7a32" stroke-width="1.5"/>`;
    for (const y of [-40, 6, 44]) out += `<ellipse cx="-40" cy="${y}" rx="2" ry="4" fill="#2f5a26"/><ellipse cx="40" cy="${y + 20}" rx="2" ry="4" fill="#2f5a26"/>`;
    [-15, 0, 15].forEach((tx, k) => {
      let rings = '';
      for (let y = -66 + k * 2.6; y < 70; y += 8) rings += `M${tx - 5.5} ${f(y)}h11`;
      out += `<rect x="${tx - 5.5}" y="-70" width="11" height="140" fill="#eaf6fa"/><path d="M${tx - 5.5} -70V70M${tx + 5.5} -70V70" stroke="#a87f34" stroke-width="1.5"/>` +
        `<path d="${rings}" stroke="#b98c3a" stroke-width="2.2"/>`;
      for (let j = 0; j < 3; j++) {
        out += `<circle cx="${tx}" cy="62" r="3.4" fill="#4fa8e8" stroke="#1f5f96" stroke-width="0.8"${mo('travel', { dy: -130, dur: 1.8, delay: f(3.4 + j * 0.6 + k * 0.2), o: 1 }, 'green-travel')}/>`;
      }
    });
    return out;
  }

  EVO_FILMS.vascular = (): string => {
    const id = 'vascular';
    const s = sky(id, '#86b6d4', '#f1e6c8');
    const glow = sun(id, 400, 52, 12);
    const river = sea(id, 150);
    const zoom = lens(`${id}-lens`, 322, 118, 62, stemInside(), 3.2, 6.1);
    const defs = s.defs + glow.defs + river.defs + zoom.defs + vgrad(`${id}-mud`, [[0, '#8a6c4c'], [1, '#5a432e']]) + cooksoniaDef(`${id}-cook`);
    let body = s.body + glow.body + hills(122, 18, '#b0a08a', 4, 0.55) + hills(140, 6, '#8f7d62', 7);
    body += `<path d="M0 146Q60 140 120 144T240 142T360 143T480 142L480 151L0 151Z" fill="#7fb36a" opacity="0.85"/>`;
    body += river.body;
    for (const [y, d] of [[160, 1.8], [170, 2.3]] as const) {
      body += `<g${mo('wave', { dx: 40, dur: d })}><path d="M-40 ${y}H520" stroke="rgba(255,255,255,0.4)" stroke-width="1.3" stroke-dasharray="14 26" stroke-linecap="round"/></g>`;
    }
    body += `<path d="M0 270L0 184Q80 176 160 182T320 178T480 184L480 270Z" fill="url(#${id}-mud)"/>` +
      `<path d="M0 184Q80 176 160 182T320 178T480 184" stroke="#a8875e" stroke-width="2.5" fill="none"/>`;
    // Beat 1: flat mats, nothing stands tall.
    body += mat(56, 202, 40, 8) + mat(126, 214, 30, 6) + mat(268, 208, 44, 9) + mat(340, 194, 30, 6) + mat(414, 206, 46, 9) + mat(470, 194, 24, 5) + mat(170, 192, 22, 5);
    // Beat 3: several Cooksonias grow at once; beat 4: new ones sprout far away.
    for (const [x, y, sc, d] of [[118, 210, 0.62, 6.5], [292, 204, 0.72, 6.3], [352, 196, 0.5, 6.8], [58, 202, 0.48, 7.1],
      [418, 146, 0.17, 11.0], [446, 147, 0.2, 11.3], [392, 147, 0.15, 11.5], [436, 200, 0.36, 11.2]] as const) {
      body += `<g transform="translate(${x} ${y}) scale(${sc})"><g${once('grow', { delay: d, dur: 1.4, ease: 'ease-out' })}>` +
        `<g${mo('sway', { rot: 3, dur: f(2.6 + sc * 2), delay: f(-x / 100) })}><use href="#${id}-cook"/></g></g></g>`;
    }
    // The hero: a sprout at first, then the stem climbs with the water inside it.
    let hero = `<path d="${STUB}" stroke="#5f9e4a" stroke-width="${WIDTH[0]}" fill="none" stroke-linecap="round"${once('draw', { len: 24, delay: 2.2, dur: 0.8 })}/>`;
    let water = `<path d="${STUB}" stroke="#7fd0ff" stroke-width="1.6" fill="none" stroke-linecap="round"${once('draw', { len: 24, delay: 3.4, dur: 1 })}/>`;
    for (const [x0, y0, cx, cy, x1, y1, lv] of COOK) {
      const d = `M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}`;
      const [t, dur] = [[6.0, 6.6, 6.95][lv], [0.65, 0.4, 0.35][lv]];
      hero += `<path d="${d}" stroke="#5f9e4a" stroke-width="${WIDTH[lv]}" fill="none" stroke-linecap="round"${once('draw', { len: 50, delay: t, dur })}/>`;
      water += `<path d="${d}" stroke="#7fd0ff" stroke-width="${[1.6, 1.2, 0.9][lv]}" fill="none" stroke-linecap="round"${once('draw', { len: 50, delay: t + 0.1, dur })}/>`;
    }
    hero += `<g${mo('twinkle', { dur: 1.1, o: 0.6 })}>${water}</g>`;
    TIPS.forEach(([x, y], k) => {
      hero += `<g transform="translate(${x} ${y})"><g${once('pop', { delay: f(7.15 + k * 0.06) })}>${capsule()}</g>` +
        `<ellipse cy="-4" rx="7" ry="5" fill="none" stroke="#fff3c4" stroke-width="1.4"${once('burst', { delay: f(9.2 + k * 0.2), s: 1.8 })}/></g>`;
    });
    // Breathing out: little puffs of vapour from the stems.
    let puffs = '';
    for (const [x, y, d] of [[-12, -80, 7.0], [10, -78, 7.4], [-20, -104, 7.7], [20, -100, 7.2], [-2, -48, 8.0]] as const) {
      puffs += `<path d="M${x} ${y}q-3 -3 0 -6t0 -6" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round"${mo('rise', { dy: -22, dur: 1.8, delay: d, o: 0.85, ease: 'ease-out' })}/>`;
    }
    body += `<g transform="translate(${HX} ${HY}) scale(${SC})"><g${mo('sway', { rot: 1.2, dur: 4, delay: 8, origin: '50% 100%' })}><rect x="-30" y="-125" width="62" height="125" fill="none"/>${hero}${puffs}</g></g>`;
    body += sparkle(HX, HY - 132, '#e2fbff', 7.4);
    // Beat 2: the lens shows the inside of the young stem.
    body += during(3.2, 6.1, `<path d="M${HX} ${HY - 22}L293 63L351 173Z" fill="#ffffff" opacity="0.22"/><circle cx="${HX}" cy="${HY - 16}" r="7" fill="none" stroke="${PAL.cream}" stroke-width="1.5"/>`, 0.5);
    body += zoom.body + during(3.6, 6.1, tag(388, 122, 'Leitbündel', 3.6, 'start'), 0.4);
    // Beat 4: the capsules burst and the wind carries the spores far over the mats.
    const rnd = seeded(12);
    let spores = '';
    TIPS.forEach(([tx, ty], k) => {
      const [x, y] = [HX + tx * SC, HY + (ty - 6) * SC];
      for (let j = 0; j < 7; j++) {
        spores += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.5 + rnd())}" fill="#f0d27a" stroke="#9a7a2a" stroke-width="0.5"` +
          `${mo('travel', { dx: f(170 + rnd() * 120), dy: f(-30 + rnd() * 60), dur: f(2.2 + rnd() * 1.2), delay: f(9.3 + k * 0.15 + j * 0.35), ease: 'ease-out' }, 'green-travel')}/>`;
      }
    });
    for (const [x, y, d] of [[150, 70, 9.2], [220, 108, 9.8], [120, 128, 10.4]] as const) {
      spores += `<path d="M${x} ${y}q30 -10 60 0t60 0" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round"${mo('travel', { dx: 140, dy: 0, dur: 2.2, delay: d, o: 0.7 }, 'green-travel')}/>`;
    }
    body += spores;
    return film(id, defs, body);
  };
}
