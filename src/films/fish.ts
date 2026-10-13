/* =============================================================================
 * SimEarth 2.0 — evolution film: fish
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * A jawless fish sucks at the floor; the x-ray shows its notochord and a row
 * of gill arches. Over 80 million years the foremost arch moves forward,
 * bends and becomes upper and lower jaw; the jaw snaps shut on prey; then a
 * jawed fish with paired fins hunts and a shoal scatters.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  const BONE = '#fff3c0';
  /** The jaw joint, where the lower jaw hinges. */
  const JX = 50, JY = 3;
  /** A gill arch's two limbs from its bend, and the jaw bones they become (vectors from the joint). */
  const ARCH_UP = [5, -14] as const, ARCH_LOW = [5, 12] as const;
  const JAW_UP = [24, -5] as const, JAW_LOW = [23, 6] as const;

  /** The lower jaw (flesh or bone) swings open about the joint while biting. */
  function biting(inner: string, bites: readonly (readonly [number, number])[]): string {
    let out = seaAt(-JX, -JY, inner);
    for (const [t, n] of bites) out = seaPivot(mo('sway', { rot: 34, dur: 1.1, delay: t, n, origin: '50% 50%' }, 'fish-bite'), out, 130);
    return seaAt(JX, JY, out);
  }

  /** A jawless fish facing right: fin folds, round sucking mouth, gill pores. */
  function jawless(skin: string, back: string): string {
    let pores = '';
    for (let k = 0; k < 6; k++) pores += `<circle cx="${18 + k * 5}" cy="9" r="1.4" fill="${back}"/>`;
    return `<path d="M-96 0L-120 -15Q-113 0 -120 15Z" fill="${back}"/>` +
      `<path d="M-64 -14Q-30 -28 4 -17L4 -14Q-30 -20 -64 -12ZM-70 11Q-50 22 -24 17L-24 14Q-50 16 -70 9Z" fill="${back}"/>` +
      `<path d="M-100 0Q-70 -16 -10 -18Q40 -19 64 -9Q75 -3 76 2Q73 9 64 11Q40 19 -10 18Q-70 16 -100 0Z" fill="${skin}"/>` +
      `<path d="M-96 -2Q-60 -14 -10 -15Q40 -16 62 -8" fill="none" stroke="${back}" stroke-width="4" opacity="0.5"/>` + pores +
      `<circle cx="75" cy="4" r="4.6" fill="#f3d6b0" stroke="${back}" stroke-width="1.4"/><circle cx="76" cy="4" r="2.4" fill="#3a2418"/>`;
  }

  /** A jawed fish facing right: paired fins, gill slits, a mouth whose lower jaw can open. */
  function jawed(skin: string, back: string, belly: string, bites: readonly (readonly [number, number])[]): string {
    let slits = '', teeth = '';
    for (let k = 0; k < 5; k++) slits += `M${22 + k * 5} 2q-2 5 0 10`;
    for (let k = 0; k < 5; k++) teeth += `M${56 + k * 4.4} 2.6l1.4 3.4l1.4 -3.4`;
    const lower = `<path d="M50 3L79 4Q77 12 64 14Q54 14 50 10Z" fill="${belly}"/><path d="M${54} 4.4${'l1.4 -3l1.4 3'.repeat(5)}" fill="#ffffff" stroke="#ffffff" stroke-width="0.6"/>`;
    return `<path d="M-96 -2L-124 -24Q-114 -2 -112 12Z" fill="${back}"/><path d="M-34 -16L-16 -38L-6 -17ZM-78 -9L-68 -24L-60 -12Z" fill="${back}"/>` +
      `<path d="M-38 14L-56 30L-46 14Z" fill="${back}"/>` +
      `<path d="M-100 0Q-70 -16 -10 -18Q40 -20 66 -10Q79 -4 79 2L50 3Q46 10 40 14Q20 18 -10 18Q-70 16 -100 0Z" fill="${skin}"/>` +
      `<path d="M-96 -2Q-60 -14 -10 -15Q40 -17 64 -9" fill="none" stroke="${back}" stroke-width="4" opacity="0.5"/>` +
      `<path d="${slits}" fill="none" stroke="${back}" stroke-width="1.3"/><path d="${teeth}" fill="#ffffff"/>` +
      `<path d="M30 12L10 34L20 14Z" fill="${back}"/>` + biting(lower, bites);
  }

  /** One gill arch: a bent bar, the bend pointing back. */
  function arch(x: number): string {
    return `<path d="M${x + ARCH_UP[0]} ${ARCH_UP[1]}L${x} 0L${x + ARCH_LOW[0]} ${ARCH_LOW[1]}" fill="none" stroke="${BONE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  /** One limb of the foremost arch turning into a jaw bone: it swings forward and lengthens. */
  function jawLimb(from: readonly [number, number], to: readonly [number, number]): string {
    const turn = (Math.atan2(to[1], to[0]) - Math.atan2(from[1], from[0])) * 180 / Math.PI;
    const grow = Math.hypot(to[0], to[1]) / Math.hypot(from[0], from[1]);
    return seaPivot(once('rotate', { rot: f(turn), delay: 3.7, dur: 1.9 }), seaPivot(once('scale', { s: f(grow), delay: 3.7, dur: 1.9 }),
      `<path d="M0 0L${from[0]} ${from[1]}" stroke="${BONE}" stroke-width="2.6" stroke-linecap="round"/>`, 40), 40);
  }

  /** A small jawless fish of the shoal, facing left. */
  function minnow(): string {
    return `<path d="M8 0L15 -5L13 0L15 5Z" fill="#7d9aa8"/><path d="M-10 0Q-6 -4.6 2 -4Q9 -3 9 0Q9 3 2 4Q-6 4.6 -10 0Z" fill="#c9d8dc"/>` +
      `<path d="M-8 -1Q0 -4 8 -1.4" stroke="#7d9aa8" stroke-width="1.6" fill="none"/><circle cx="-6" cy="-0.8" r="1.2" fill="${PAL.ink}"/>`;
  }

  EVO_FILMS.fish = (): string => {
    const id = 'fish';
    const water = underwater(id, 0.4);
    let body = water.body + hills(200, 12, '#1f5f74', 23, 0.5) +
      `<path d="M0 270L0 206Q120 198 240 204T480 202L480 270Z" fill="#7d7258"/><path d="M0 206Q120 198 240 204T480 202" fill="none" stroke="#9a8c68" stroke-width="3"/>`;
    // Beat 1: it sucks up mud through its round mouth.
    let mud = '';
    for (let k = 0; k < 6; k++) mud += seaAt(318 + (k % 3) * 9, 214, `<circle r="1.8" fill="#d8c8a0"${mo('rise', { dy: -24, dur: 0.8, delay: f(k * 0.27), o: 1 })}/>`, ` rotate(${-40 - (k % 3) * 8})`);
    body += during(0, 2.6, mud, 0.4);

    // The skeleton seen by x-ray: the notochord, the gill arches, the foremost becoming the jaws.
    const skeleton = `<path d="M-104 0Q-40 -2 44 -3" fill="none" stroke="${BONE}" stroke-width="7" opacity="0.3"${once('draw', { len: 150, delay: 1.3, dur: 0.8 })}/>` +
      `<path d="M-104 0Q-40 -2 44 -3" fill="none" stroke="${BONE}" stroke-width="3.2" stroke-linecap="round"${once('draw', { len: 150, delay: 1.3, dur: 0.8 })}/>` +
      [4, 12, 20, 28, 36].map(arch).join('') +
      seaAt(44, 0, `<g${once('move', { dx: JX - 44, dy: JY, delay: 3.7, dur: 1.9 })}>${jawLimb(ARCH_UP, JAW_UP)}` +
        seaPivot(mo('sway', { rot: 34, dur: 1.1, delay: 6.25, n: 2, origin: '50% 50%' }, 'fish-bite'), jawLimb(ARCH_LOW, JAW_LOW), 50) + '</g>') +
      seaAt(JX, JY, `<circle r="2.6" fill="${BONE}"${once('pop', { delay: 5.6 })}/>`);
    const jawlessFish = jawless('#cdb88e', '#8a7a58');
    const xrayJawless = `<g opacity="0.8">${jawless('#1e4a62', '#163a4e')}</g>`;
    const jawedFish = jawed('#b9c4b4', '#5f7480', '#e6e2cc', [[6.25, 2], [10.5, 1]]);
    const xrayJawed = `<g opacity="0.8">${jawed('#1e4a62', '#163a4e', '#245470', [[6.25, 2]])}</g>`;
    const fishBody = morph([jawlessFish, jawedFish], [4.6]) + during(1.1, 9, morph([xrayJawless, xrayJawed], [4.6]) + skeleton, 0.6);

    // Small prey in front of the mouth, caught at the second bite.
    body += seaAt(342, 132, during(5.4, 8.05, `<g${mo('float', { amp: 3, dur: 0.9 })}><path d="M-8 0Q-4 -5 4 -4L10 -1L10 2Q2 5 -8 0Z" fill="#f2a888" stroke="#c87358" stroke-width="0.8"/>` +
      `<path d="M-7 -1Q-16 -6 -22 -4M-7 0Q-16 2 -22 5" fill="none" stroke="#c87358" stroke-width="0.8"/><circle cx="-4" cy="-1.5" r="1.1" fill="${PAL.ink}"/></g>`, 0.2));

    // It levels out of the mud, lunges at the prey, then shrinks back to hunt in beat 4.
    const fishGroup = `<g${once('move', { dy: -38, delay: 2.6, dur: 1 })}><g${once('move', { dx: 18, delay: 7.4, dur: 0.6 })}>` +
      `<g${once('move', { dx: -96, dy: 6, delay: 9, dur: 0.9 })}><g${once('move', { dx: 200, dy: -4, delay: 10.15, dur: 0.8, ease: 'cubic-bezier(.4,0,.3,1)' })}>` +
      seaPivot(once('scale', { s: 0.6, delay: 9, dur: 0.9 }), `<g transform="rotate(14)">` +
        seaPivot(once('rotate', { rot: -14, delay: 2.6, dur: 1 }), `<g${mo('float', { amp: 2, dur: 2.2 })}>${seaAt(0, 0, fishBody, ' scale(1.3)')}</g>`, 190) + '</g>', 190) +
      '</g></g></g></g>';
    body += seaAt(210, 168, fishGroup);

    // Beat 4: a shoal of jawless fish scatters before the hunter.
    let shoal = '';
    const rnd = seeded(23);
    for (let k = 0; k < 11; k++) {
      const x = 326 + rnd() * 76, y = 86 + rnd() * 92, a = Math.atan2(y - 134, x - 344), d = 48 + rnd() * 36, t = 10.35 + rnd() * 0.2;
      // Each fish flees head first: those fleeing right turn round.
      const turned = Math.cos(a) > 0 ? `<g${once('scale', { delay: f(t - 0.1), dur: 0.25 }, 'fish-turn')}>${minnow()}</g>` : minnow();
      const fish = seaAt(0, 0, turned, ` scale(${f(1.1 + rnd() * 0.3)})`);
      shoal += seaAt(x, y, `<g${once('move', { dx: f(Math.cos(a) * d), dy: f(Math.sin(a) * d), delay: f(t), dur: 0.7, ease: 'ease-out' })}>` +
        `<g${mo('float', { amp: 1.5, dur: f(0.6 + rnd() * 0.4), delay: f(-rnd()) })}>${fish}</g></g>`);
    }
    body += during(9.1, Infinity, shoal, 0.6);

    body += timelapse(330, 64, ['vor 518 Mio. J.', 'vor 480 Mio. J.', 'vor 440 Mio. J.'], [3.2, 4.2, 5.2], 6.1);
    body += during(0, 2.7, tag(150, 112, 'Rückgrat', 1.3), 0.4) + during(0, 5.9, tag(244, 98, 'Kiemenbögen', 3.4), 0.4) +
      during(0, 8.9, tag(318, 118, 'Kiefer', 6.6, 'start'), 0.4);
    body += sparkle(296, 140, '#fff3b0', 6.4);
    return film(id, water.defs, body);
  };
}
