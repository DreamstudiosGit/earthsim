/* =============================================================================
 * SimEarth 2.0 — evolution film: carnivorous
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * In a poor, acid bog a sundew's tentacles glisten with glue. A fly lands
 * and sticks; the tentacles bend over it and the leaf rolls round it; the
 * nitrogen from the prey flows into the plant, which sends up its flowers.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** The plant: where it stands, its scale; in its own units the fly and the first fold of the long leaf. */
  const [PX, PY, SC] = [104, 214, 1.5];
  const [FLY, FOLD] = [[86, -26], [112, -8]] as const;

  /** A sticky drop on a tentacle tip, glistening. */
  function drop(x: number, y: number, k: number, r = 2.3): string {
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="#eef8ff"${mo('twinkle', { dur: f(0.8 + (k % 3) * 0.4), delay: f(-k * 0.37), o: 0.35 })}/>`;
  }

  /** A tentacle standing on (x, y), leaning `lean` deg, bending by `bend` deg at `at` s. */
  function tentacle(x: number, y: number, len: number, lean: number, bend: number, at: number, k: number): string {
    return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(lean)})"><g${once('rotate', { rot: f(bend), delay: f(at), dur: 1.1, origin: '50% 100%' })}>` +
      `<path d="M0 0Q-1 ${f(-len / 2)} 0 ${f(-len)}" stroke="#d24e3c" stroke-width="1.3" fill="none" stroke-linecap="round"/>${drop(0, -len - 1.4, k)}</g></g>`;
  }

  /** A small round sundew leaf on its stalk, pointing `deg` from the rosette, rimmed with tentacles. */
  function smallLeaf(deg: number, len: number, k0: number): string {
    let [hairs, drops] = ['', ''];
    for (let k = 0; k < 9; k++) {
      const a = ((-150 + k * 37.5) * Math.PI) / 180;
      const [x, y] = [len + Math.cos(a) * 7, Math.sin(a) * 5.5];
      const [ex, ey] = [x + Math.cos(a) * 6, y + Math.sin(a) * 5.5];
      hairs += `M${f(x)} ${f(y)}L${f(ex)} ${f(ey)}`;
      drops += drop(ex, ey, k + k0, 1.5);
    }
    return `<g transform="rotate(${deg})"><path d="M0 0H${len - 6}" stroke="#9aaa58" stroke-width="2"/>` +
      `<ellipse cx="${len}" rx="7.5" ry="6" fill="#b8443a"/><path d="${hairs}" stroke="#d65a43" stroke-width="1.1"/>${drops}</g>`;
  }

  /** A stretch of leaf blade from x0 to x1 along y = 0, with its row of tentacles bending toward `toward` (x). */
  function blade(x0: number, x1: number, toward: number, bendAt: number, k0: number): string {
    let hairs = '';
    for (let x = x0 + 3, k = k0; x < x1 - 1; x += 6, k++) {
      const d = toward - x;
      const bend = Math.sign(d) * Math.min(48, 8 + 900 / (Math.abs(d) + 18));
      hairs += tentacle(x, -3, 11 + (k % 3) * 2, (x - 70) * 0.12, bend, bendAt + Math.abs(d) * 0.006, k);
    }
    return `<path d="M${x0} -4Q${(x0 + x1) / 2} -6 ${x1} -3L${x1} 3Q${(x0 + x1) / 2} 5 ${x0} 4Z" fill="#b8443a"/>${hairs}`;
  }

  EVO_FILMS.carnivorous = (): string => {
    const id = 'carnivorous';
    const s = sky(id, '#86a39a', '#e2e8d8');
    const defs = s.defs + vgrad(`${id}-bog`, [[0, '#7d814e'], [1, '#4e5634']]) + glowGrad(`${id}-mist`, '#ffffff', 0.5);
    let body = s.body;
    // The bog: a dark tree line, peat, pools of brown acid water, mist.
    let line = '';
    for (let k = 0; k < 13; k++) {
      const x = 10 + k * 38 + (k % 3) * 7;
      const h = 18 + (k % 4) * 7;
      line += `M${x - 6} 124L${x} ${124 - h}L${x + 6} 124Z`;
    }
    body += `<path d="${line}" fill="#6a8476" opacity="0.5"/><path d="M0 122Q120 116 240 122T480 119V270H0Z" fill="url(#${id}-bog)"/>`;
    for (const [x, y, rx] of [[70, 140, 80], [330, 134, 100], [470, 158, 60]] as const) {
      body += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f(rx * 0.12)}" fill="#3a2e1c"/><path d="M${f(x - rx * 0.5)} ${y}h${f(rx * 0.4)}M${f(x + rx * 0.1)} ${y + 2}h${f(rx * 0.3)}" stroke="#b7a57a" stroke-width="1" opacity="0.5"/>`;
    }
    body += `<ellipse cx="240" cy="142" rx="300" ry="24" fill="url(#${id}-mist)"${mo('twinkle', { dur: 5, o: 0.45 })}/>`;
    // Sphagnum hummocks in green, ochre and red.
    const rnd = seeded(9);
    for (const [x, y, w, h, c] of [[420, 196, 90, 34, '#a85a3a'], [270, 166, 70, 18, '#b0b45a'], [400, 240, 120, 40, '#86a243'], [96, 234, 110, 30, '#97a64a'], [20, 200, 50, 24, '#c4924a']] as const) {
      let dots = '';
      for (let k = 0; k < 16; k++) dots += `M${f(x + (rnd() - 0.5) * w * 1.6)} ${f(y - rnd() * h * 0.8)}h2.4m-1.2 -1.2v2.4`;
      body += `<path d="M${x - w} ${y}Q${f(x - w * 0.66)} ${y - h} ${f(x - w / 3)} ${f(y - h * 0.75)}Q${x} ${f(y - h * 1.2)} ${f(x + w / 3)} ${f(y - h * 0.75)}Q${f(x + w * 0.66)} ${y - h} ${x + w} ${y}Z" fill="${c}"/>` +
        `<path d="${dots}" stroke="#e6e9b0" stroke-width="1" opacity="0.45"/>`;
    }
    for (const [x, y, h] of [[30, 170, 40], [200, 156, 34], [450, 172, 44], [366, 144, 30]] as const) {
      body += `<g transform="translate(${x} ${y})"><g${mo('sway', { rot: 5, dur: f(2.8 + x / 200) })}><path d="M0 0Q2 ${-h / 2} 1 ${-h}" stroke="#8f9a5a" stroke-width="1.4" fill="none"/><circle cx="1" cy="${-h - 3}" r="4.5" fill="#f4f4ec"/></g></g>`;
    }
    // The sundew, in its own units: a rosette of small leaves, the flowering stalk to come, the long leaf.
    let plant = [196, 222, 248, 272, 160].map((deg, k) => smallLeaf(deg, 22 + (k % 2) * 5, k * 9)).join('');
    plant += `<path d="M0 -4Q-8 -50 2 -72Q8 -86 20 -84" stroke="#7b9a48" stroke-width="1.8" fill="none" stroke-linecap="round"${once('draw', { len: 100, delay: 10.0, dur: 1.0 })}/>`;
    for (const [x, y, k] of [[2, -72, 0], [9, -82, 1], [20, -84, 2]] as const) {
      let petals = '';
      for (let p = 0; p < 5; p++) petals += `<ellipse cy="-3.6" rx="2.6" ry="3.6" fill="#fbf4f6" transform="rotate(${p * 72})"/>`;
      plant += `<g transform="translate(${x} ${y})"><g${once('pop', { delay: 10.9 + k * 0.25 })}>${petals}<circle r="1.6" fill="#f2d26a"/></g></g>`;
    }
    plant += `<path d="M0 0Q20 -2 40 -8" stroke="#9aaa58" stroke-width="2.4" fill="none"/><g transform="translate(0 ${FOLD[1]})">${blade(38, FOLD[0], FLY[0], 5.9, 0)}</g>`;
    // The fly lands at 4, sticks and struggles; then it is digested.
    plant += `<g transform="translate(${FLY[0]} ${FLY[1]}) scale(1.5)"><g${once('enter', { dx: 80, dy: -70, delay: 3.0, dur: 1.0 })}>` +
      during(0, 10.4, `<g${mo('sway', { rot: 14, dur: 0.12, delay: 4.2, n: 20 })}>${bloomFly(4.2, 50)}</g>`, 1.4) +
      during(4.1, 8.0, `<path d="M-6 4l-3 6M-1 4v7M4 4l3 6" stroke="rgba(240,250,255,0.85)" stroke-width="0.8"/>`, 0.3) + `</g></g>`;
    // The tip rolls over the fly in two folds.
    plant += `<g transform="translate(${FOLD[0]} ${FOLD[1]})"><g${once('rotate', { rot: -100, delay: 6.8, dur: 1.4 }, 'bloom-hinge')}>${blade(-1, 27, -40, 6.2, 12)}` +
      `<g transform="translate(26 0)"><g${once('rotate', { rot: -78, delay: 7.3, dur: 1.3 }, 'bloom-hinge')}>${blade(-1, 26, -60, 6.4, 17)}</g></g></g></g>`;
    // Nitrogen keeps flowing from the prey into the plant (a rise turned to point down the leaf).
    const [vx, vy] = [2 - FLY[0], -2 - FLY[1] - 8];
    const ang = (Math.atan2(vx, -vy) * 180) / Math.PI;
    let flow = '';
    for (let k = 0; k < 5; k++) {
      flow += `<g transform="translate(${FLY[0]} ${FLY[1] + 8}) rotate(${f(ang)})"><g${mo('rise', { dy: f(-Math.hypot(vx, vy)), dur: 1.6, delay: f(9.0 + k * 0.32), o: 1, ease: 'ease-in' })}>` +
        `<g transform="rotate(${f(-ang)})"><circle r="4" fill="#5fce6a" stroke="#e4ffd8" stroke-width="0.8"/><path d="M-1.6 2V-2L1.6 2V-2" stroke="#ffffff" stroke-width="1" fill="none" stroke-linejoin="round"/></g></g></g>`;
    }
    plant += during(8.9, Infinity, flow, 0.3);
    body += `<g transform="translate(${PX} ${PY}) scale(${SC})">${plant}</g>`;
    const [fx, fy] = [PX + FLY[0] * SC, PY + FLY[1] * SC];
    body += sparkle(fx, fy, '#fff1c8', 6.5, 1) + during(0, 9.2, tag(fx + 50, fy - 40, 'Klebfalle', 6.9, 'start'), 0.5) + tag(PX + 70, PY - 54, 'Stickstoff', 9.6, 'start');
    return film(id, defs, body);
  };
}
