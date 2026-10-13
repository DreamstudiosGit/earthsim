/* =============================================================================
 * SimEarth 2.0 — evolution film: clubmosses (giant trees in the swamp)
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md. Small scaly clubmosses at a
 * swamp's edge; over generations (time-lapse badge) their kin shoot up into
 * scale trees with diamond-patterned trunks and forked crowns; a dense swamp
 * forest, 30 m tall; trees fall and sink, the view tilts down into the ground
 * where layers stack on the peat and press it into a glossy black coal seam.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** The swamp's water surface and floor; how far the view tilts down at the end. */
  const WATER = 196;
  const FLOOR = 214;
  const TILT = 130;
  /** Sand and clay laid down on the peat, and the peat's thickness before it is pressed to half. */
  const LAYERS = 40;
  const PEAT = 72;
  /** The hero tree's base and scale. */
  const HX = 300;
  const HS = 0.72;

  /**
   * A scale tree (Lepidodendron) as a def, base at the origin: a tapering
   * trunk covered in diamond leaf cushions, a crown forking in twos with
   * tufts of grass-like leaves and cones at the tips.
   */
  function scaleTreeDef(defId: string): string {
    const H = 150;
    let scars = '';
    let dots = '';
    for (let row = 0, y = -8; y > -H + 6; row++, y -= 8.5) {
      const half = 11 - (4 * -y) / H - 2;
      for (let x = -half + (row % 2 ? 3.4 : 0); x <= half; x += 6.8) {
        scars += `M${f(x)} ${f(y - 4.2)}l3.2 4.2l-3.2 4.2l-3.2 -4.2Z`;
        dots += `M${f(x - 0.7)} ${f(y)}h1.4`;
      }
    }
    const br = ['', '', ''];
    let leaves = '';
    let cones = '';
    const fork = (x: number, y: number, a: number, len: number, d: number): void => {
      const [x2, y2] = [x + Math.sin(a) * len, y - Math.cos(a) * len];
      br[d] += `M${f(x)} ${f(y)}L${f(x2)} ${f(y2)}`;
      if (d < 2) {
        fork(x2, y2, a - 0.42, len * 0.78, d + 1);
        fork(x2, y2, a + 0.42, len * 0.78, d + 1);
        return;
      }
      for (let k = -3; k <= 3; k++) {
        const b = a + k * 0.34;
        leaves += `M${f(x2)} ${f(y2)}q${f(Math.sin(b) * 8 + 2)} ${f(-Math.cos(b) * 8)} ${f(Math.sin(b) * 15)} ${f(-Math.cos(b) * 13)}`;
      }
      for (const t of [0.35, 0.7]) {
        const [px, py] = [x + Math.sin(a) * len * t, y - Math.cos(a) * len * t];
        leaves += `M${f(px)} ${f(py)}l${f(Math.sin(a - 1.1) * 10)} ${f(-Math.cos(a - 1.1) * 10)}M${f(px)} ${f(py)}l${f(Math.sin(a + 1.1) * 10)} ${f(-Math.cos(a + 1.1) * 10)}`;
      }
      if (Math.abs(a) > 0.9) cones += `<ellipse cx="${f(x2)}" cy="${f(y2 + 7)}" rx="3" ry="6" fill="#a58c4c"/>`;
    };
    fork(0, -H, -0.5, 30, 0);
    fork(0, -H, 0.5, 30, 0);
    return `<g id="${defId}"><path d="M-17 0Q-11 -4 -11 -14L-7 ${-H}L7 ${-H}L11 -14Q11 -4 17 0Z" fill="#6f7450"/>` +
      `<path d="${scars}" fill="#8e9466" stroke="#4d5034" stroke-width="0.8"/><path d="${dots}" stroke="#3f4229" stroke-width="1.2"/>` +
      br.map((d, k) => `<path d="${d}" stroke="#666a45" stroke-width="${[7, 5, 3.4][k]}" fill="none" stroke-linecap="round"/>`).join('') +
      `<path d="${leaves}" stroke="#5f9a46" stroke-width="1.7" fill="none" stroke-linecap="round"/>${cones}</g>`;
  }

  /** A sunken trunk lying in the peat, its diamond bark still showing; `coal` draws it pressed into coal. */
  function trunkLog(x: number, y: number, w: number, h: number, coal: boolean): string {
    let scars = '';
    for (let row = 0; row < 3; row++) {
      const cy = y + h * (0.25 + row * 0.25);
      for (let cx = x + 7 + (row % 2) * 4; cx < x + w - 6; cx += 8) scars += `M${f(cx)} ${f(cy - 3.6)}l3.2 3.6l-3.2 3.6l-3.2 -3.6Z`;
    }
    const [fill, line] = coal ? ['#2c2c34', '#62626f'] : ['#4a3a24', '#7d6a45'];
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/><path d="${scars}" fill="none" stroke="${line}" stroke-width="1.4"/>`;
  }

  /** A tree from the def at (x, y), scale sc, shooting up at `d`, gently swaying. */
  const tree = (id: string, x: number, y: number, sc: number, d: number, dur = 2): string =>
    `<g transform="translate(${x} ${y}) scale(${sc})"><g${once('grow', { delay: d, dur, ease: 'cubic-bezier(.3,1.1,.5,1)' })}>` +
    `<g${mo('sway', { rot: 0.7, dur: f(5 + x / 120), origin: '50% 100%' })}><use href="#${id}-tree"/></g></g></g>`;

  /** A tree that falls over its base by `rot` degrees at `d`, splashes and sinks out of sight. */
  const falling = (id: string, x: number, sc: number, d: number, rot: number): string =>
    `<g transform="translate(${x} ${WATER + 4}) scale(${sc})"><g${once('fadeout', { delay: d + 1.6, dur: 0.6 })}><g${once('move', { dy: 70, delay: d + 0.9, dur: 1.2, ease: 'ease-in' })}>` +
    `<g${once('rotate', { rot, delay: d, dur: 0.9, origin: '50% 100%', ease: 'cubic-bezier(.55,0,1,.45)' })}>` +
    `<g${once('grow', { delay: 6.3, dur: 2, ease: 'cubic-bezier(.3,1.1,.5,1)' })}><use href="#${id}-tree"/></g></g></g></g></g>`;

  EVO_FILMS.clubmosses = (): string => {
    const id = 'clubmosses';
    const s = sky(id, '#7d9c94', '#dfe2cc');
    const glow = sun(id, 404, 58, 12, '#f6efc8');
    const defs = s.defs + glow.defs + glowGrad(`${id}-mist`, '#ffffff', 0.55) + scaleTreeDef(`${id}-tree`) +
      vgrad(`${id}-water`, [[0, '#6f8c84'], [1, '#41605a']]) + vgrad(`${id}-rock`, [[0, '#7a6f62'], [1, '#4f4740']]);
    let world = hills(166, 14, '#a3b8aa', 3, 0.6);
    // Beat 3, far away: the swamp forest spreads in the haze.
    for (const [x, sc, d] of [[28, 0.4, 6.2], [92, 0.34, 6.8], [168, 0.38, 6.5], [236, 0.33, 7.1], [380, 0.36, 6.4], [448, 0.4, 6.9]] as const) {
      world += `<g opacity="0.45">${tree(id, x, 190, sc, d, 1.6)}</g>`;
    }
    world += greenMist(`${id}-mist`, 240, 176, 300, 24, 12);
    // Beat 2: over generations, a little clubmoss's kin become trees (one figure, three forms).
    const forms = [
      `<g transform="scale(1.5)">${greenClubmoss(28)}</g>`,
      `<g${once('grow', { delay: 3.9, dur: 1.2, ease: 'ease-out' })}><g transform="scale(1.6)">${greenClubmoss(62)}</g></g>`,
      `<g${once('grow', { delay: 5.1, dur: 1.3, ease: 'cubic-bezier(.3,1.1,.5,1)' })}><g transform="scale(${HS})"><use href="#${id}-tree"/></g></g>`,
    ];
    world += `<g transform="translate(${HX} ${WATER + 2})"><g${mo('sway', { rot: 0.6, dur: 6, origin: '50% 100%' })}>${morph(forms, [3.9, 5.1])}</g></g>`;
    // Beat 3: the forest closes in around it; two trees will fall.
    world += tree(id, 410, WATER + 4, 0.6, 6.3) + tree(id, 456, WATER + 2, 0.52, 6.7) + tree(id, 128, WATER + 4, 0.56, 6.5);
    world += falling(id, 214, 0.6, 8.8, -80) + falling(id, 370, 0.5, 9.2, 78);
    // The swamp water, with the splashes of the falling trunks.
    world += `<rect y="${WATER}" width="${FILM_W}" height="${FLOOR - WATER}" fill="url(#${id}-water)" opacity="0.92"/>` +
      `<g${mo('wave', { dx: -40, dur: 4 })}><path d="${wavePath(-40, 520, WATER + 1, 1.2)}" stroke="rgba(255,255,255,0.5)" stroke-width="1.4" fill="none"/></g>`;
    for (const [x, d] of [[150, 9.7], [420, 10.1]] as const) {
      world += `<g transform="translate(${x} ${WATER})"><ellipse rx="40" ry="5" fill="none" stroke="#ffffff" stroke-width="2"${once('burst', { delay: d, s: 2 })}/></g>`;
    }
    // Banks: the swamp's edge on the left, a mud island under the hero, the far right bank.
    world += `<path d="M0 ${WATER - 6}Q60 ${WATER - 9} 104 ${WATER - 4}Q118 ${WATER + 6} 122 ${FLOOR}H0Z" fill="#6b5a44"/>` +
      `<path d="M262 ${FLOOR}Q268 ${WATER} ${HX} ${WATER - 1}Q332 ${WATER} 338 ${FLOOR}Z" fill="#6b5a44"/>` +
      `<path d="M440 ${FLOOR}Q446 ${WATER - 2} 480 ${WATER - 6}V${FLOOR}Z" fill="#6b5a44"/>`;
    // Beat 1: clubmoss shoots full of scaly leaves at the swamp's edge.
    const rnd = seeded(14);
    for (const [x, h] of [[14, 30], [30, 38], [46, 28], [62, 42], [78, 32], [94, 36], [454, 30], [470, 36]] as const) {
      world += `<g transform="translate(${x} ${WATER - 6}) scale(1.25)"><g${mo('sway', { rot: 3, dur: f(3 + rnd() * 2), delay: f(-rnd() * 3) })}>${greenClubmoss(h)}</g></g>`;
    }
    // Underground: old rock, and the peat in which the fallen trunks end up.
    world += `<rect y="${FLOOR}" width="${FILM_W}" height="200" fill="url(#${id}-rock)"/>` +
      `<path d="M0 310Q120 304 240 310T480 308M0 336Q140 330 280 336T480 334M0 362Q120 356 240 362T480 360" stroke="#3f3832" stroke-width="2" fill="none" opacity="0.6"/>`;
    // Sand and clay stack on the peat as it sinks deeper.
    for (const [y, h, c] of [[FLOOR, 13, '#c9b48c'], [FLOOR + 13, 13, '#a8987a'], [FLOOR + 26, LAYERS - 26, '#bfa47c']] as const) {
      world += `<rect y="${y}" width="${FILM_W}" height="${h}" fill="${c}"/><path d="M0 ${y + h}H480" stroke="#7a6a52" stroke-width="1"/>`;
    }
    // Trunks in the peat: one long buried, then the two that just fell.
    const logs: readonly (readonly [number, number, number, number, number])[] = [[24, 40, 84, 22, 0], [116, 10, 100, 24, 10.4], [372, 16, 82, 22, 10.8]];
    let peat = `<rect y="${FLOOR}" width="${FILM_W}" height="${PEAT}" fill="#5b3f26"/>` +
      `<path d="${[10, 26, 44, 60].map((y) => `M0 ${FLOOR + y}Q120 ${FLOOR + y - 3} 240 ${FLOOR + y + 1}T480 ${FLOOR + y - 1}`).join('')}" stroke="#7a5a38" stroke-width="1.4" fill="none"/>`;
    let coal = `<rect y="${FLOOR}" width="${FILM_W}" height="${PEAT}" fill="#141418"/>`;
    for (const [x, y, w, h, d] of logs) {
      peat += during(d, Infinity, trunkLog(x, FLOOR + y, w, h, false), 0.4);
      coal += trunkLog(x, FLOOR + y, w, h, true);
    }
    // Pressed, the peat turns into glossy black coal; the trunks stay inside it, flattened.
    coal += `<path d="M0 ${FLOOR + 5}H480M0 ${FLOOR + 62}Q240 ${FLOOR + 58} 480 ${FLOOR + 63}" stroke="#c9d2e0" stroke-width="2.4" opacity="0.5"/>` +
      `<g${mo('drift', { dx: 540, dur: 2.2, delay: 11.2 })}><path d="M-60 ${FLOOR}h22l-16 ${PEAT}h-22Z" fill="#ffffff" opacity="0.35"/></g>`;
    for (const [x, y, d] of [[70, 12, 0], [236, 30, 0.5], [330, 56, 0.9], [440, 24, 0.3]] as const) {
      coal += `<g transform="translate(${x} ${FLOOR + y}) scale(1 2)"><path d="M0 -4L1 -1L4 0L1 1L0 4L-1 1L-4 0L-1 -1Z" fill="#ffffff"${mo('twinkle', { dur: 1, delay: 11.3 + d, o: 0 })}/></g>`;
    }
    world += `<g${once('move', { dy: LAYERS, delay: 10.3, dur: 0.9 })}><g${once('squash', { s: 0.5, delay: 10.8, dur: 0.8, origin: '50% 0%' }, 'green-squash')}>` +
      `${peat}${during(10.9, Infinity, coal, 0.6)}</g></g>`;
    // The weight of the layers above presses down.
    world += during(10.2, 11.3, [100, 240, 380].map((x) => `<g transform="translate(${x} ${FLOOR + 6})"><g${mo('float', { amp: 2.5, dur: 0.45 })}>` +
      `<path d="M0 0V20M-7 13L0 21L7 13" stroke="${PAL.cream}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`).join(''), 0.4);
    let body = s.body + glow.body + `<g${once('move', { dy: -TILT, delay: 9.5, dur: 1.3 })}>${world}</g>`;
    body += timelapse(126, 82, ['vor 420 Mio. J.', 'vor 370 Mio. J.', 'vor 320 Mio. J.'], [3.3, 3.9, 5.1], 6.4);
    // Beat 3: how tall — a measuring bar beside the hero.
    const top = WATER - 150;
    body += during(6.1, 9.4, `<path d="M350 ${WATER - 2}V${top}M344 ${WATER - 2}h12M344 ${top}h12" stroke="${PAL.cream}" stroke-width="2" fill="none"${once('draw', { len: 170, delay: 6.1, dur: 0.8 })}/>` +
      tag(356, 124, '30 m', 6.6, 'start'), 0.5);
    body += sparkle(HX, top + 12, '#f4ffd8', 6.7);
    // The end state on screen: the coal seam at y 124–160, the badge on the rock below it.
    body += timelapse(360, 196, ['Millionen Jahre'], [10.4]) + tag(296, 148, 'Kohle', 11.2);
    body += motes(id, 14, 'rgba(255,255,240,0.7)', 0, 480, 40, 190, 6, 1.1);
    return film(id, defs, body);
  };
}
