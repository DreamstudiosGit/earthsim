/* =============================================================================
 * SimEarth 2.0 — the toolkit for the evolution films
 * -----------------------------------------------------------------------------
 * Every evolution step has a short animated scene, shown when it arises: a
 * twelve-second film in four beats that shows how the step came about —
 * 0–3 s the world before, 3–6 s the change under way, 6–9 s the
 * breakthrough itself (marked with `sparkle()`), 9–12 s what it leads to —
 * then rests on its last frame, still gently alive.
 *
 * Scenes are SVG markup. Motion comes from one shared vocabulary of CSS
 * animations (css/scenes.css), switched on per element with `mo()` (loops)
 * and `once()` (one-shot entrances), so all films move alike. A transform
 * animation replaces any transform attribute on the same element: position
 * with an outer <g transform="…">, animate an inner <g>.
 * ========================================================================== */

namespace SE {
  /** ViewBox of every film: 16:9. */
  export const FILM_W = 480;
  export const FILM_H = 270;
  /** One playthrough, in seconds; the beats start at 0, 3, 6 and 9. */
  export const FILM_SECONDS = 12;
  /** When the breakthrough beat starts; its caption is marked as such. */
  export const FILM_KEY_BEAT = 2;

  export type EvoFilm = () => string;
  /** Every step's film, by node id. Filled in by the files under src/films/. */
  export const EVO_FILMS: Record<string, EvoFilm> = {};

  /** The game's palette, for scenes that should sit with the rest of the UI. */
  export const PAL = {
    ink: '#0c1a14',
    cream: '#f6f1df',
    origin: '#5ccfd0',
    plant: '#8ad16f',
    plantDeep: '#2f6b36',
    animal: '#f2a35c',
    animalDeep: '#8a4a1c',
    gold: '#f6c453',
    violet: '#b48cff',
    coral: '#ff7a6b',
    shallow: '#58bcc6',
    deep: '#0f3550',
    sand: '#e0c68e',
    mud: '#6f5438',
    leaf: '#4f9a4a',
  } as const;

  /** Units of the animation variables; anything else is passed through as is. */
  const UNITS: Readonly<Record<string, string>> = {
    dur: 's', delay: 's', dx: 'px', dy: 'px', amp: 'px', rot: 'deg',
  };

  export type MotionVars = Readonly<Record<string, number | string>>;

  function styleOf(vars: MotionVars): string {
    const parts = Object.entries(vars).map(([k, v]) => {
      const numeric = typeof v === 'number' || /^-?\d+(\.\d+)?$/.test(v);
      return `--${k}:${v}${numeric ? UNITS[k] ?? '' : ''}`;
    });
    return parts.length ? ` style="${parts.join(';')}"` : '';
  }

  /**
   * A looping motion: float, sway, drift, swim, rise, pulse, spin, flap,
   * twinkle, wave, blink. Variables: dur, delay (s), amp, dx, dy (px), rot
   * (deg), s (scale), o (opacity), n (repeat count, default infinite),
   * origin (transform origin, e.g. "50% 100%"). A finite loop snaps back to
   * its start when it ends; for a move that should stay, use `once()`.
   */
  export function mo(name: string, vars: MotionVars = {}, extraClass = ''): string {
    return ` class="m m-${name}${extraClass ? ` ${extraClass}` : ''}"${styleOf(vars)}`;
  }

  /**
   * A one-shot entrance, held at its end: grow, pop, fade, fadeout, move,
   * enter, draw (needs `len`), burst, unfurl. Before its delay the element
   * shows its starting state, so a `grow` with delay 3 is invisible until 3 s.
   */
  export function once(name: string, vars: MotionVars = {}, extraClass = ''): string {
    return ` class="o o-${name}${extraClass ? ` ${extraClass}` : ''}"${styleOf(vars)}`;
  }

  /** Deterministic decoration: the same scatter every time a film plays. */
  export function seeded(seed: number): () => number {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = Math.imul(s ^ (s >>> 15), s | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const f = (v: number): string => v.toFixed(1);

  /* ------------------------------------------------------------ the frame -- */

  /** Wrap a film: viewBox, the slow camera push-in, and its own defs. */
  export function film(id: string, defs: string, body: string): string {
    return `<svg class="evo-film" data-film="${id}" viewBox="0 0 ${FILM_W} ${FILM_H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">` +
      `<defs>${defs}</defs><g class="cam">${body}</g></svg>`;
  }

  /** A vertical gradient as a def. */
  export function vgrad(id: string, stops: readonly (readonly [number, string])[]): string {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  }

  /** A radial glow as a def: colour in the middle, transparent at the edge. */
  export function glowGrad(id: string, color: string, alpha = 0.8): string {
    return `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${alpha}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
  }

  /* ------------------------------------------------------------ backdrops -- */

  /** Sky from `top` to `bottom` colour over the whole frame (use as first layer). */
  export function sky(id: string, top: string, bottom: string): { defs: string; body: string } {
    return { defs: vgrad(`${id}-sky`, [[0, top], [1, bottom]]), body: `<rect width="${FILM_W}" height="${FILM_H}" fill="url(#${id}-sky)"/>` };
  }

  /** A soft sun or light source. */
  export function sun(id: string, x: number, y: number, r: number, color: string = PAL.gold): { defs: string; body: string } {
    return {
      defs: glowGrad(`${id}-sun`, color, 0.9),
      body: `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="url(#${id}-sun)"${mo('pulse', { dur: 5, s: 1.06 })}/>` +
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.95"/>`,
    };
  }

  /**
   * The whole frame under water: depth gradient, slanting light rays from
   * the surface, drifting marine snow. `depth` 0 = sunlit shallows, 1 = dim.
   */
  export function underwater(id: string, depth = 0.2): { defs: string; body: string } {
    const top = depth < 0.5 ? '#6fd0cf' : '#2f7f9a';
    const defs = vgrad(`${id}-water`, [[0, top], [0.55, '#1f6f8c'], [1, PAL.deep]]) +
      `<linearGradient id="${id}-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="${f(0.35 - depth * 0.2)}"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>`;
    let body = `<rect width="${FILM_W}" height="${FILM_H}" fill="url(#${id}-water)"/>`;
    for (const [x, w, rot, d] of [[70, 34, -14, 6], [170, 22, -10, 7.5], [260, 40, -16, 5.5], [370, 26, -12, 8]] as const) {
      body += `<g${mo('sway', { rot: 3, dur: d, origin: '50% 0%' })}><path d="M${x} -10L${x + w} -10L${x + w + 70} ${FILM_H}L${x + 30} ${FILM_H}Z" fill="url(#${id}-ray)"/></g>`;
    }
    body += motes(`${id}-snow`, 26, 'rgba(230,250,250,0.5)', 0, FILM_W, 0, FILM_H, 3);
    return { defs, body };
  }

  /**
   * Open water from `y` down, seen side-on from above the surface: a depth
   * gradient and a moving glint line on the surface. `x0..x1` limits it.
   */
  export function sea(id: string, y: number, x0 = 0, x1 = FILM_W): { defs: string; body: string } {
    const defs = vgrad(`${id}-sea`, [[0, PAL.shallow], [1, PAL.deep]]);
    let body = `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${FILM_H - y}" fill="url(#${id}-sea)"/>`;
    body += `<g${mo('wave', { dx: -40, dur: 3 })}><path d="${wavePath(x0 - 40, x1 + 40, y + 1.5, 3)}" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.6"/></g>`;
    return { defs, body };
  }

  /** A gently wavy line from x0 to x1 at height y, period 40, for water surfaces. */
  export function wavePath(x0: number, x1: number, y: number, amp: number): string {
    let d = `M${f(x0)} ${f(y)}`;
    for (let x = x0; x < x1; x += 40) d += `q10 ${-amp} 20 0t20 0`;
    return d;
  }

  /** Rolling ground or hills: a silhouette from y with bumps of height amp. */
  export function hills(y: number, amp: number, color: string, seed: number, opacity = 1): string {
    const r = seeded(seed);
    let d = `M0 ${FILM_H}L0 ${f(y)}`;
    for (let x = 0; x < FILM_W; x += 60) {
      const h = y - r() * amp;
      d += `Q${f(x + 30)} ${f(h - amp * 0.6)} ${f(x + 60)} ${f(y - r() * amp * 0.4)}`;
    }
    d += `L${FILM_W} ${FILM_H}Z`;
    return `<path d="${d}" fill="${color}" opacity="${opacity}"/>`;
  }

  /* ----------------------------------------------------------- particles -- */

  /** Small drifting particles over an area: spores, marine snow, pollen, dust. */
  export function motes(_id: string, n: number, color: string, x0: number, x1: number, y0: number, y1: number, seed: number, r = 1.4): string {
    const rnd = seeded(seed);
    let out = '';
    for (let k = 0; k < n; k++) {
      const x = x0 + rnd() * (x1 - x0);
      const y = y0 + rnd() * (y1 - y0);
      out += `<g${mo('drift', { dx: f(10 + rnd() * 30), dy: f(-10 - rnd() * 25), dur: f(6 + rnd() * 6), delay: f(-rnd() * 8), ease: 'ease-in-out' })}>` +
        `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * (0.5 + rnd()))}" fill="${color}"${mo('twinkle', { dur: f(2 + rnd() * 3), delay: f(-rnd() * 3), o: 0.2 })}/></g>`;
    }
    return out;
  }

  /** Bubbles rising from points near (x, y), staggered, starting at `start` s. */
  export function bubbles(n: number, x: number, y: number, spread: number, rise: number, start: number, seed: number, color = 'rgba(220,250,255,0.85)'): string {
    const rnd = seeded(seed);
    let out = '';
    for (let k = 0; k < n; k++) {
      const bx = x + (rnd() - 0.5) * spread;
      out += `<circle cx="${f(bx)}" cy="${f(y)}" r="${f(1.6 + rnd() * 2.4)}" fill="none" stroke="${color}" stroke-width="1.2"` +
        `${mo('rise', { dy: -rise, dur: f(2.4 + rnd() * 2), delay: f(start + rnd() * 2.5), o: 0.9 })}/>`;
    }
    return out;
  }

  /**
   * The moment of the film: an expanding ring and a starburst at (x, y),
   * at `delay` seconds. Every film should have one, at its key event.
   */
  export function sparkle(x: number, y: number, color: string, delay: number, size = 1): string {
    let rays = '';
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const r0 = 6 * size;
      const r1 = (k % 2 ? 16 : 26) * size;
      rays += `<path d="M${f(Math.cos(a) * r0)} ${f(Math.sin(a) * r0)}L${f(Math.cos(a) * r1)} ${f(Math.sin(a) * r1)}" stroke="${color}" stroke-width="${f(2 * size)}" stroke-linecap="round"/>`;
    }
    return `<g transform="translate(${f(x)} ${f(y)})">` +
      `<circle r="${f(14 * size)}" fill="none" stroke="${color}" stroke-width="2.5"${once('burst', { delay, s: 3.2 })}/>` +
      `<g${once('burst', { delay: delay + 0.05, s: 1.6, dur: 1.1 })}>${rays}</g>` +
      `<circle r="${f(5 * size)}" fill="#ffffff"${once('burst', { delay, s: 2, dur: 0.9 })}/></g>`;
  }

  /* -------------------------------------------------------------- time -- */

  /**
   * `body` only from `t1` to `t2` seconds, fading in and out over `fade`.
   * A `t1` of 0 or less shows it from the start, an infinite `t2` keeps it.
   */
  export function during(t1: number, t2: number, body: string, fade = 0.6): string {
    let out = body;
    if (t1 > 0) out = `<g${once('fade', { delay: t1, dur: fade })}>${out}</g>`;
    if (Number.isFinite(t2)) out = `<g${once('fadeout', { delay: t2, dur: fade })}>${out}</g>`;
    return out;
  }

  /**
   * A change over many generations, as one figure turning into the next:
   * `forms[k]` (k ≥ 1) fades in on top of its predecessor at `at[k - 1]`,
   * which then fades away; the last form stays. Draw every form around the
   * same anchor and move the whole group, so the change reads as one body.
   */
  export function morph(forms: readonly string[], at: readonly number[], fade = 0.8): string {
    return forms.map((form, k) => during(k === 0 ? 0 : at[k - 1], k < at.length ? at[k] + fade * 0.6 : Infinity, form, fade)).join('');
  }

  /**
   * The time-lapse badge: a small pill at (x, y) with a turning hourglass
   * that says how much time passes, e.g. ["vor 50 Mio. J.", "vor 45 Mio. J."].
   * Label k shows from `at[k]`; the badge leaves at `end`. Keep it clear of
   * the top-left corner, where the showcase puts its date stamp.
   */
  export function timelapse(x: number, y: number, labels: readonly string[], at: readonly number[], end = Infinity): string {
    const w = Math.max(...labels.map((l) => l.length)) * 6.2 + 34;
    let body = `<rect x="${f(x - w / 2)}" y="${f(y - 11)}" width="${f(w)}" height="22" rx="11" fill="rgba(8,20,18,0.62)" stroke="rgba(255,255,255,0.25)"/>` +
      `<g transform="translate(${f(x - w / 2 + 14)} ${f(y)})"><g${mo('spin', { dur: 2.4 })}>` +
      `<path d="M-4 -6H4L0 0L4 6H-4L0 0Z" fill="none" stroke="${PAL.gold}" stroke-width="1.6" stroke-linejoin="round"/></g></g>`;
    labels.forEach((label, k) => {
      const until = k + 1 < labels.length ? at[k + 1] - 0.3 : Infinity;
      body += during(k === 0 ? 0 : at[k], until, `<text x="${f(x - w / 2 + 26)}" y="${f(y + 4)}" font-size="11" fill="${PAL.cream}">${label}</text>`, 0.3);
    });
    return during(at[0], end, body, 0.5);
  }

  /* -------------------------------------------------------- explaining -- */

  /**
   * A small label naming a part worth learning ("Zellkern", "Kiefer"),
   * fading in at `at` seconds. Use sparingly: two or three per film.
   */
  export function tag(x: number, y: number, text: string, at: number, anchor: 'start' | 'middle' | 'end' = 'middle'): string {
    return `<g${once('fade', { delay: at, dur: 0.5 })}><text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-size="10.5" fill="${PAL.cream}" ` +
      `stroke="rgba(6,16,14,0.85)" stroke-width="3" stroke-linejoin="round" paint-order="stroke">${text}</text></g>`;
  }

  /**
   * A magnifying glass at (x, y) with radius r that pops up at `at` seconds
   * and shows `inner` — markup drawn in the glass's own coordinates around
   * (0, 0), already enlarged. Use it for what is too small to see: a cell's
   * insides, an eye's lenses, a tooth. `id` must start with the film id.
   */
  export function lens(id: string, x: number, y: number, r: number, inner: string, at: number, until = Infinity): { defs: string; body: string } {
    const defs = `<clipPath id="${id}-clip"><circle r="${f(r)}"/></clipPath>`;
    const glass = `<g transform="translate(${f(x)} ${f(y)})"><g${once('pop', { delay: at, dur: 0.6 })}>` +
      `<path d="M${f(r * 0.7)} ${f(r * 0.7)}L${f(r * 1.15)} ${f(r * 1.15)}" stroke="${PAL.cream}" stroke-width="5" stroke-linecap="round" opacity="0.85"/>` +
      `<circle r="${f(r)}" fill="#0b1d1a"/><g clip-path="url(#${id}-clip)">${inner}</g>` +
      `<circle r="${f(r)}" fill="none" stroke="${PAL.cream}" stroke-width="2.5"/>` +
      `<path d="M${f(-r * 0.62)} ${f(-r * 0.3)}A${f(r * 0.7)} ${f(r * 0.7)} 0 0 1 ${f(-r * 0.2)} ${f(-r * 0.66)}" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.5"/></g></g>`;
    return { defs, body: during(0, until, glass, 0.5) };
  }

  /* ------------------------------------------------------------- eyes -- */

  /** An eye with a highlight that blinks now and then. */
  export function eye(x: number, y: number, r: number, delay = 0): string {
    return `<g${mo('blink', { dur: 4.5, delay: -delay })}><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${PAL.ink}"/>` +
      `<circle cx="${f(x - r * 0.35)}" cy="${f(y - r * 0.35)}" r="${f(r * 0.35)}" fill="#ffffff"/></g>`;
  }
}
