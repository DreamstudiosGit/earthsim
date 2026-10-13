/* =============================================================================
 * SimEarth 2.0 — evolution film: eukaryotes (mitochondria)
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md. An Asgard archaeon reaches
 * around a bacterium with its long protrusions, takes it in, and the guest
 * divides along with it; the guests become glowing mitochondria, and with
 * their energy the cell grows large and wraps its genome in a nucleus.
 * ========================================================================== */

namespace SE {
  const HOST_X = 232;
  const HOST_Y = 138;
  const GUEST = '#f0a872';
  const f = (v: number): string => v.toFixed(1);

  /** A soft, lumpy outline around (cx, cy). */
  function blob(cx: number, cy: number, r: number, wobble: number, seed: number): string {
    const rnd = seeded(seed);
    const n = 9;
    const pts = Array.from({ length: n }, (_, k) => {
      const a = (k / n) * Math.PI * 2;
      const rr = r * (1 + (rnd() - 0.5) * wobble);
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as const;
    });
    const mid = (k: number): readonly [number, number] => {
      const [ax, ay] = pts[k % n];
      const [bx, by] = pts[(k + 1) % n];
      return [(ax + bx) / 2, (ay + by) / 2];
    };
    let d = `M${f(mid(0)[0])} ${f(mid(0)[1])}`;
    for (let k = 1; k <= n; k++) d += `Q${f(pts[k % n][0])} ${f(pts[k % n][1])} ${f(mid(k)[0])} ${f(mid(k)[1])}`;
    return `${d}Z`;
  }

  function rod(len: number, color: string): string {
    return `<rect x="${f(-len / 2)}" y="-4.5" width="${f(len)}" height="9" rx="4.5" fill="${color}"/>` +
      `<rect x="${f(-len / 2 + 2.5)}" y="-2.8" width="${f(len - 5)}" height="2" rx="1" fill="#ffffff" opacity="0.4"/>`;
  }

  /** A mitochondrion: a bean whose inner membrane is folded into cristae. */
  function mitochondrion(): string {
    return `<path d="M-12 -1C-12 -8 -3 -8.5 0 -5.2C3 -8.5 12 -8 12 -1C12 7 -12 7 -12 -1Z" fill="#f4a65e" stroke="#c46e34" stroke-width="1.3"/>` +
      `<path d="M-8 0l2 -3.4l2 6l2 -6l2 6l2 -6l2 6l2 -3.4" fill="none" stroke="#a5521e" stroke-width="1.2" stroke-linejoin="round"/>`;
  }

  /** The archaeon's genome: a loose tangle, later wrapped in the nucleus. */
  function genome(): string {
    return `<path d="M-10 -4c4 -8 12 -2 8 4s-12 4 -8 -4M-6 6c6 -2 10 6 4 8s-10 -4 -4 -8M2 -8c6 0 6 8 0 8" fill="none" stroke="#6f4bc0" stroke-width="1.6" stroke-linecap="round"/>`;
  }

  /** The archaeon's long, finger-like protrusions; two reach around the bacterium. */
  function protrusions(): string {
    let out = '';
    for (const [d, delay] of [['M-50 -18q-22 -16 -30 -38', -1], ['M-54 10q-26 6 -36 26', -2], ['M-30 -30q-6 -24 6 -40', -3], ['M-30 30q4 26 -10 40', -1.5]] as const) {
      out += `<g${mo('sway', { rot: 6, dur: 2.6, delay, origin: '0% 100%' })}><path d="${d}" fill="none" stroke="#c8b0ff" stroke-width="3" stroke-linecap="round"/></g>`;
    }
    for (const [d, delay] of [['M-4 -26C10 -40 40 -36 48 -18', 1.0], ['M-2 22C12 34 42 30 48 4', 1.4]] as const) {
      out += `<path d="${d}" fill="none" stroke="#c8b0ff" stroke-width="3" stroke-linecap="round"${once('draw', { len: 80, delay, dur: 1.4 })}/>`;
    }
    return out;
  }

  /** The guests: the first bacterium, then its offspring; rods turning into mitochondria. */
  function guests(): string {
    const at = (x: number, y: number, rot: number, inner: string): string =>
      `<g transform="translate(${x} ${y}) rotate(${rot})">${inner}</g>`;
    const become = (): string =>
      during(0, 6.2, rod(24, GUEST), 0.6) + during(6.0, Infinity, `<g${mo('pulse', { dur: 1.1, s: 1.1 })}>${mitochondrion()}</g>`, 0.6);
    const glow = `<circle r="22" fill="url(#eukaryotes-power)"${once('fade', { delay: 6.2, dur: 0.6 })}/>`;
    let out = at(38, -6, -20, `<g${once('move', { dx: -6, dy: -8, delay: 3.4, dur: 1 })}>${glow}${become()}</g>`);
    for (const [x, y, rot, born] of [[42, 18, 15, 4.4], [16, 30, -35, 5.1]] as const) {
      out += at(x, y, rot, `<g${once('pop', { delay: born, dur: 0.6 })}>${glow}${become()}</g>`);
    }
    return out;
  }

  /** Energy from the mitochondria, as sparks spreading through the cell. */
  function sparks(rnd: () => number): string {
    let out = '';
    for (let k = 0; k < 14; k++) {
      const [x, y] = [[32, -14], [42, 18], [16, 30]][k % 3];
      const a = rnd() * Math.PI * 2;
      out += `<g transform="translate(${x} ${y})"><g${mo('drift', { dx: f(Math.cos(a) * 40), dy: f(Math.sin(a) * 34), dur: f(1.4 + rnd()), delay: f(6.3 + rnd() * 1.4), ease: 'ease-out' })}>` +
        `<path d="M0 -3.5L1 -1L3.5 0L1 1L0 3.5L-1 1L-3.5 0L-1 -1Z" fill="${PAL.gold}"${mo('twinkle', { dur: 0.5, o: 0.2 })}/></g></g>`;
    }
    return out;
  }

  /** The nucleus: a membrane closing around the genome. */
  function nucleus(): string {
    return `<g transform="translate(-16 6)">` +
      `<circle r="20" fill="${PAL.violet}" fill-opacity="0.45"${once('fade', { delay: 9.7, dur: 0.8 })}/>` +
      `<circle r="20" fill="none" stroke="#e4d6ff" stroke-width="2.2" stroke-dasharray="126"${once('draw', { len: 126, delay: 9.0, dur: 0.9 })}/>` +
      genome() + `<circle cx="5" cy="-5" r="5" fill="#6f4bc0"${once('pop', { delay: 9.9 })}/></g>`;
  }

  function cell(rnd: () => number): string {
    const archaeon = `<path d="${blob(-26, 0, 32, 0.28, 5)}" fill="${PAL.violet}" fill-opacity="0.38" stroke="#d9c6ff" stroke-width="2"/>` + protrusions();
    const engulfing = `<path d="${blob(0, 2, 60, 0.16, 9)}" fill="${PAL.violet}" fill-opacity="0.3" stroke="#d9c6ff" stroke-width="2.2"/>`;
    return `<g transform="translate(${HOST_X} ${HOST_Y})"><g${once('scale', { s: 1.32, delay: 9.0, dur: 1.6, ease: 'cubic-bezier(0.3, 0, 0.2, 1)' })}>` +
      `<g${mo('pulse', { dur: 3, s: 1.025 })}>${morph([archaeon, engulfing], [3.0], 1.2)}</g>` +
      nucleus() + guests() + during(6.2, Infinity, sparks(rnd), 0.3) + '</g></g>';
  }

  EVO_FILMS.eukaryotes = (): string => {
    const id = 'eukaryotes';
    const water = underwater(id, 0.6);
    const rnd = seeded(18);
    let backdrop = water.body + `<rect width="${FILM_W}" height="${FILM_H}" fill="#3a8a3c" opacity="0.28"/>`;
    for (let k = 0; k < 6; k++) {
      backdrop += `<circle cx="${f(rnd() * 480)}" cy="${f(rnd() * 270)}" r="${f(12 + rnd() * 20)}" fill="#d6f2e2" opacity="0.08"${mo('float', { amp: 5, dur: f(5 + rnd() * 4), delay: f(-rnd() * 4) })}/>`;
    }
    // Free bacteria drifting about; the warm ones are kin of the guest.
    for (let k = 0; k < 9; k++) {
      const x = [60, 110, 400, 430, 350, 80, 300, 150, 440][k];
      const y = [80, 210, 70, 190, 225, 140, 60, 60, 120][k];
      backdrop += `<g${mo('drift', { dx: f(-20 + rnd() * 40), dy: f(-12 + rnd() * 24), dur: f(7 + rnd() * 5), delay: f(-rnd() * 6) })}>` +
        `<g transform="translate(${x} ${y}) rotate(${Math.round(rnd() * 180)})"><g${mo('spin', { dur: f(18 + rnd() * 20) })}>${rod(14, k % 3 ? PAL.origin : GUEST)}</g></g></g>`;
    }
    const defs = water.defs + glowGrad(`${id}-power`, PAL.gold, 0.7);
    const body = backdrop + cell(rnd) +
      during(0.8, 3.2, tag(HOST_X - 26, HOST_Y - 46, 'Archaee', 0.8), 0.4) +
      during(1.2, 3.2, tag(HOST_X + 38, HOST_Y + 22, 'Bakterium', 1.2), 0.4) +
      during(6.4, 8.9, tag(HOST_X + 40, HOST_Y - 70, 'Mitochondrium', 6.4), 0.4) +
      tag(HOST_X - 21, HOST_Y + 52, 'Zellkern', 10.0) +
      sparkle(HOST_X + 32, HOST_Y - 14, PAL.gold, 6.3, 1.2) +
      // A free bacterium drifts past the grown cell: ten times smaller.
      `<g transform="translate(392 168)"><g${once('enter', { dx: 60, delay: 10.0, dur: 1.4 })}><g${mo('float', { amp: 3, dur: 3 })}>${rod(14, GUEST)}</g></g></g>`;
    return film(id, defs, body);
  };
}
