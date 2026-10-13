/* =============================================================================
 * SimEarth 2.0 — evolution film: seedPlants
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * Wind carries pollen from one seed fern to the ovule of another; the ovule
 * becomes a seed (embryo, food store, coat — in the lens), drops into the
 * soil, sits out a drought and germinates when the rain comes.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** Ground surface, the pollen source on plant A, the ovule on plant B, and where the seed rests. */
  const [GY, SRC, OV, SEED] = [172, [165, 92], [301, 104], [301, 194]] as const;

  /** A seed fern on (0, 0): a stem and six arching pinnate fronds; `wilt` lets them hang. */
  function seedFern(fill: readonly string[], stem: string, wilt: number): string {
    const fr = ['', '', ''];
    ([[-1, 8, 44], [-1, 38, 52], [-1, 72, 40], [1, 74, 42], [1, 40, 54], [1, 10, 46]] as const).forEach(([sx, deg, len], k) => {
      fr[k % 3] += bloomFrond(len, 7, len * (0.42 + wilt), 0, -46, sx, deg - wilt * 40);
    });
    return `<path d="M0 0Q-3 -24 0 -46" stroke="${stem}" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
      fr.map((d, k) => `<path d="${d}" fill="${fill[k]}"/>`).join('');
  }

  /** A plant green until the drought, then withered and brown. */
  function plant(x: number, mirror: number, extra: string): string {
    const pos = `translate(${x} ${GY}) scale(${1.3 * mirror} 1.3)`;
    return during(0, 6.6, `<g transform="${pos}">${seedFern(['#3f7a45', '#4f8a4a', '#5d9850'], '#5e4a2c', 0)}</g>${extra}`, 1.2) +
      during(6.0, Infinity, `<g transform="${pos}">${seedFern(['#a2834c', '#b08f55', '#977a46'], '#7a5c38', 0.35)}</g>`, 1.2);
  }

  /** The seed in section, much enlarged: coat, food store and the curled embryo. */
  function section(): string {
    const outline = 'M0 -44C26 -44 34 -12 28 12C23 32 9 44 0 48C-9 44 -23 32 -28 12C-34 -12 -26 -44 0 -44Z';
    return `<path d="${outline}" fill="#7a4a22"/><path d="${outline}" fill="#f2deac" transform="scale(0.8)"/>` +
      `<path d="M-14 -24Q-8 -30 2 -30" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>` +
      `<g${mo('pulse', { dur: 1.6, s: 1.06, origin: '50% 50%' })}><path d="M1 30Q-6 14 -1 -6" stroke="#6fae4e" stroke-width="7" fill="none" stroke-linecap="round"/>` +
      `<path d="M-1 -6Q-16 -10 -12 -24Q-3 -20 -1 -6ZM-1 -6Q12 -12 10 -26Q1 -20 -1 -6Z" fill="#86c45e"/></g>`;
  }

  EVO_FILMS.seedPlants = (): string => {
    const id = 'seedPlants';
    const [s, glow] = [sky(id, '#8fb3bf', '#efe2c0'), sun(id, 240, 60, 12, '#ffe3a2')];
    const l = lens(`${id}-l`, 186, 128, 60, section(), 3.6, 6.1);
    const defs = s.defs + glow.defs + l.defs + vgrad(`${id}-soil`, [[0, '#8a6440'], [1, '#553a24']]) + glowGrad(`${id}-heat`, '#ffb24a', 0.9) +
      vgrad(`${id}-cloud`, [[0, '#5d6c78'], [1, 'rgba(93,108,120,0)']]);
    let body = s.body + glow.body;
    // Drought: the sky burns orange; then rain clouds bring grey.
    body += during(0, 8.8, `<rect width="${FILM_W}" height="${FILM_H}" fill="#f08a3c"${once('fade', { delay: 5.8, dur: 1.2, o: 0.32 })}/>` +
      `<circle cx="240" cy="60" r="90" fill="url(#${id}-heat)"${once('fade', { delay: 5.8, dur: 1.2 })}/>`, 0.8);
    body += `<rect width="${FILM_W}" height="${FILM_H}" fill="#56697a"${once('fade', { delay: 8.6, dur: 1, o: 0.38 })}/>` +
      `<g${once('enter', { dx: 0, dy: -80, delay: 8.5, dur: 1.2 })}><rect width="${FILM_W}" height="70" fill="url(#${id}-cloud)"/>` +
      `<path d="${bloomBlobs([[60, 20, 80, 24], [190, 12, 90, 28], [330, 18, 85, 26], [450, 10, 70, 22]])}" fill="#7e8d99"/></g>`;
    // A far Late Devonian landscape: hills, the first trees.
    body += hills(150, 12, '#b5b497', 3, 0.55);
    for (const [x, h] of [[40, 34], [128, 28], [420, 38]] as const) {
      body += `<g transform="translate(${x} 156)" opacity="0.35"><path d="M0 0V${-h}" stroke="#5c5a44" stroke-width="2.4"/><path d="${bloomBlobs([[0, -h + 4, 13, 5], [0, -h - 4, 9, 4.5], [0, -h + 12, 15, 4.5]])}" fill="#5f7350"/></g>`;
    }
    body += hills(164, 5, '#c7ad7c', 7);
    // Wind blows from left to right until the drought.
    body += during(0, 5.6, bloomWind([70, 112, 148], 0.1, 2.2));
    // Plant A releases pollen; plant B carries ovules, each with a sticky drop.
    const sacs = [[165, 92], [126, 84], [190, 120], [58, 104]].map(([x, y]) => bloomBlobs([[x - 4, y + 5, 3, 5], [x + 1, y + 7, 3, 5], [x + 6, y + 4, 2.8, 4.6]])).join('');
    body += plant(92, 1, `<path d="${sacs}" fill="#d8ae48" stroke="#9c7a2a" stroke-width="0.6"/>` +
      `<g transform="translate(${SRC[0]} ${SRC[1] + 6})"><circle r="9" fill="none" stroke="#f7d55c" stroke-width="2"${once('burst', { delay: 0.5, s: 2.6 })}/></g>`);
    let ovules = '';
    for (const [x, y] of [[344, 84], [430, 108], [372, 66]] as const) ovules += `M${x} ${y}v4` + bloomBlobs([[x, y + 10, 4.5, 6.5]]);
    body += plant(372, -1, `<path d="${ovules}" fill="#8fb35a" stroke="#5e4a2c" stroke-width="1.4"/><path d="M${OV[0]} ${OV[1] - 8}v6" stroke="#5e4a2c" stroke-width="1.6"/>`);
    // Pollen on the wind: most of it blows past, a few grains reach the ovule's drop.
    const rnd = seeded(5);
    for (let k = 0; k < 15; k++) {
      const [x0, y0] = [SRC[0] - 4 + rnd() * 10, SRC[1] + rnd() * 12];
      const lands = k % 3 === 0;
      const [x1, y1] = lands ? [OV[0] + (rnd() - 0.5) * 4, OV[1] + 13 + (rnd() - 0.5) * 3] : [470 + rnd() * 40, 50 + rnd() * 110];
      const t0 = 0.6 + k * 0.09;
      const dur = lands ? 2.5 - t0 + rnd() * 0.3 : 2.4 + rnd();
      const grain = `<g transform="translate(${f(x0)} ${f(y0)})"><g${once('move', { dx: f(x1 - x0), dy: f(y1 - y0), delay: f(t0), dur: f(dur), ease: 'ease-in-out' })}>` +
        `<g${mo('float', lands ? { amp: 3, dur: 0.5, n: 4 } : { amp: 4, dur: 0.6 })}><circle r="2.7" fill="#f7d55c" stroke="#b98a22" stroke-width="0.6"/></g></g></g>`;
      body += during(t0 - 0.2, lands ? 3.0 : t0 + dur - 0.4, grain, 0.3);
    }
    // The ovule, fertilised, turns into a brown seed, drops, and is covered by the soil.
    const seed = `<ellipse cy="2" rx="9.5" ry="12.5" fill="#8a5a2c" stroke="#5c3a1a" stroke-width="1.2"/><path d="M-4 -5Q0 -9 4 -8" stroke="#ffffff" stroke-width="1.4" fill="none" opacity="0.5"/>`;
    body += `<g transform="translate(${OV[0]} ${OV[1]})"><g${once('move', { dy: GY - 14 - OV[1], delay: 3.2, dur: 0.55, ease: 'cubic-bezier(.55,0,1,.45)' })}>` +
      `<g${once('move', { dy: SEED[1] - GY + 14, delay: 4.4, dur: 1.4 })}>` +
      during(0, 3.1, `<ellipse cy="2" rx="6" ry="8.5" fill="#9cc062" stroke="#5e4a2c" stroke-width="1.2"/>` +
        `<circle cy="13" r="3" fill="#eef8ff"${mo('twinkle', { dur: 0.8, o: 0.4 })}/><circle cy="2" r="12" fill="#fff3a0"${once('burst', { delay: 2.5, s: 1.8, dur: 0.9 })}/>`, 0.3) +
      `<g${once('fade', { delay: 2.8, dur: 0.4 })}>${seed}</g></g></g></g>`;
    // The ground: a thin dry surface over the soil, seen in section.
    body += `<path d="M0 ${GY + 4}L480 ${GY + 4}L480 270L0 270Z" fill="url(#${id}-soil)"/><path d="M0 ${GY}H480V${GY + 5}H0Z" fill="#d6b67c"/>` +
      `<path d="${bloomBlobs([[40, 200, 5, 3], [120, 214, 4, 2.5], [210, 196, 6, 3.5], [380, 206, 5, 3], [440, 192, 4, 2.5], [250, 222, 5, 3]])}" fill="#3f2b1a" opacity="0.5"/>`;
    for (const [x, y, sc] of [[30, GY, 0.8], [228, GY, 0.7], [452, GY, 0.9]] as const) {
      body += `<path d="M${x} ${y}l-6 -9M${x} ${y}l-1 -12M${x} ${y}l5 -10M${x} ${y}l9 -6" transform="translate(${f(x * (1 - sc))} ${f(y * (1 - sc))}) scale(${sc})" stroke="#6f8a4a" stroke-width="2" stroke-linecap="round"/>`;
    }
    // The seed, now in the soil: drawn again on top of the soil section so it shows there.
    body += during(5.6, Infinity, `<g transform="translate(${SEED[0]} ${SEED[1]})">` +
      during(6.2, 9.6, `<circle r="19" fill="#f6e2a8" opacity="0.35"${mo('pulse', { dur: 1.4, s: 1.25, origin: '50% 50%' })}/>`) +
      `${seed}<path d="M0 -9V13" stroke="#f3e2b8" stroke-width="1.4"${once('fade', { delay: 9.8, dur: 0.4 })}/></g>`, 0.4);
    // Drought: the dry crust cracks, heat shimmers; the rain darkens the soil again.
    body += during(6.1, 9.6, `<path d="M20 ${GY}l6 12l-4 9M96 ${GY}l-5 10l5 12M168 ${GY}l4 14M246 ${GY}l-6 11l3 13M352 ${GY}l5 12l-4 8M420 ${GY}l-4 15M470 ${GY}l3 9"` +
      ` stroke="#3a2614" stroke-width="2.2" fill="none" stroke-linejoin="round"${once('draw', { len: 30, delay: 6.3, dur: 1.4 })}/>` +
      [80, 200, 400].map((x, k) => `<g transform="translate(${x} ${GY - 6})"><path d="M0 0q4 -6 0 -12t0 -12" stroke="#fff1d0" stroke-width="1.4" fill="none"${mo('rise', { dy: -40, dur: 1.8, delay: 6.4 + k * 0.5, o: 0.7 })}/></g>`).join(''), 0.8);
    body += `<path d="M0 ${GY}H480V270H0Z" fill="#1e1a30"${once('fade', { delay: 9.3, dur: 1, o: 0.25 })}/>`;
    for (let k = 0; k < 5; k++) {
      const x = SEED[0] - 30 + k * 15;
      body += during(9.3 + k * 0.1, 9.9 + k * 0.1, `<g transform="translate(${x} ${GY + 3})"><circle r="2.2" fill="#9fd0ea"${once('move', { dx: f((SEED[0] - x) * 0.7), dy: 10, delay: 9.4 + k * 0.1, dur: 0.8 })}/></g>`, 0.3);
    }
    // Germination: a root grows down, a shoot up through the crust, seed leaves, a first frond.
    const [sx, sy] = SEED;
    body += `<path d="M${sx} ${sy + 13}Q${sx + 5} ${sy + 21} ${sx + 2} ${sy + 31}" stroke="#f1e6c8" stroke-width="3" fill="none" stroke-linecap="round"${once('draw', { len: 22, delay: 9.9, dur: 0.8 })}/>` +
      `<path d="M${sx + 3} ${sy + 20}l7 4M${sx + 3} ${sy + 26}l-6 4" stroke="#f1e6c8" stroke-width="1.2" stroke-linecap="round"${once('draw', { len: 9, delay: 10.6, dur: 0.5 })}/>` +
      `<path d="M${sx} ${sy - 10}Q${sx - 4} ${sy - 40} ${sx} ${sy - 72}" stroke="#7fbf5a" stroke-width="3.4" fill="none" stroke-linecap="round"${once('draw', { len: 66, delay: 10.1, dur: 0.9 })}/>` +
      `<g transform="translate(${sx} ${sy - 72})"><g${mo('sway', { rot: 3, dur: 2.4, delay: 11.4 })}>` +
      `<path d="M0 0Q-12 -16 -30 -12Q-15 3 0 0Z" fill="#8fd068"${once('grow', { delay: 10.9, dur: 0.8, origin: '100% 100%' })}/>` +
      `<path d="M0 0Q12 -16 30 -12Q15 3 0 0Z" fill="#7cc25e"${once('grow', { delay: 11, dur: 0.8, origin: '0% 100%' })}/>` +
      `<path d="${bloomFrond(34, 6.5, 10, 0, 0, 1, 80)}" fill="#5d9850"${once('unfurl', { delay: 11.2, dur: 1, rot: -100 })}/></g></g>`;
    body += sparkle(sx, sy + 2, '#fff3c4', 6.6, 1);
    // Rain.
    for (let k = 0; k < 34; k++) {
      body += `<g transform="translate(${f(rnd() * 500)} ${f(-20 + rnd() * 100)})"><path d="M0 0l-2 9" stroke="#e2f0f6" stroke-width="1.4" stroke-linecap="round"` +
        `${mo('rise', { dy: f(170 + rnd() * 50), dur: f(0.8 + rnd() * 0.4), delay: f(8.9 + rnd() * 1), o: 0.85, ease: 'linear' })}/></g>`;
    }
    body += l.body + during(0, 6.1, tag(198, 114, 'Embryo', 3.9, 'start') + tag(186, 164, 'Vorrat', 4.5) + tag(214, 146, 'Hülle', 5.1, 'start'), 0.5);
    body += timelapse(360, 74, ['Monate', 'Jahre'], [6.4, 7.6], 9.0);
    return film(id, defs, body);
  };
}
