/* =============================================================================
 * SimEarth 2.0 — Gaia
 * -----------------------------------------------------------------------------
 * The planet's face, as in the original: her expression tracks the health of
 * the biosphere and her eyes follow the pointer. Her face is the planet — the
 * oceans bluer and the continents greener the better she feels — and below
 * it the four things her mood is made of, so the player can see why.
 * ========================================================================== */

namespace SE {
  /** Continents on her face, as polygons in unit-disc coordinates. */
  const CONTINENTS: readonly (readonly number[])[] = [
    [-0.92, -0.18, -0.66, -0.58, -0.28, -0.66, -0.12, -0.46, -0.38, -0.3, -0.58, 0.02, -0.86, 0.12],
    [0.28, -0.82, 0.66, -0.6, 0.86, -0.24, 0.6, -0.12, 0.4, -0.34],
    [-0.62, 0.5, -0.2, 0.62, 0.22, 0.66, 0.1, 0.92, -0.4, 0.86],
    [0.6, 0.24, 0.92, 0.3, 0.82, 0.62, 0.52, 0.56],
  ];

  const FACTORS: readonly { key: 'climate' | 'life' | 'diversity' | 'clean'; label: string; icon: string }[] = [
    { key: 'climate', label: 'Klima', icon: 'temperature' },
    { key: 'life', label: 'Belebtheit', icon: 'biomass' },
    { key: 'diversity', label: 'Vielfalt', icon: 'diversity' },
    { key: 'clean', label: 'Reine Luft', icon: 'co2' },
  ];

  const mix = (a: Rgb, b: Rgb, t: number): string =>
    `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;

  export class GaiaPanel {
    private readonly canvas: HTMLCanvasElement;
    private readonly moodLabel: HTMLElement;
    private readonly moodValue: HTMLElement;
    private readonly moodMark: HTMLElement;
    private readonly rows = new Map<string, { fill: HTMLElement; text: HTMLElement }>();
    private pointer = { x: 0.5, y: 0.5 };
    private sig = '';

    constructor(host: HTMLElement) {
      this.canvas = make('canvas', 'gaia-face');
      const head = make('div', 'gaia-mood');
      this.moodLabel = make('span', 'gaia-mood-label');
      this.moodValue = make('span', 'gaia-mood-value');
      const bar = make('div', 'gaia-mood-bar');
      this.moodMark = make('span', 'gaia-mood-mark');
      bar.appendChild(this.moodMark);
      head.append(this.moodLabel, this.moodValue, bar);
      const list = make('ul', 'gaia-factors');
      for (const f of FACTORS) {
        const li = make('li', 'gaia-factor');
        const meter = make('span', 'gaia-meter');
        const fill = make('span');
        meter.appendChild(fill);
        const text = make('span', 'gaia-factor-text');
        li.append(img(resIcon(f.icon), 'ico'), make('span', 'gaia-factor-label', f.label), text, meter);
        list.appendChild(li);
        this.rows.set(f.key, { fill, text });
      }
      host.append(this.canvas, head, list);
      window.addEventListener('pointermove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width <= 0) return;
        this.pointer.x = clamp((e.clientX - rect.left) / rect.width, -1, 2);
        this.pointer.y = clamp((e.clientY - rect.top) / rect.height, -1, 2);
      });
    }

    static moodLabel(mood: number): string {
      if (mood > 0.85) return 'Glückselig';
      if (mood > 0.68) return 'Zufrieden';
      if (mood > 0.5) return 'Ruhig';
      if (mood > 0.34) return 'Unruhig';
      if (mood > 0.18) return 'Besorgt';
      return 'Entsetzt';
    }

    render(world: WorldState, now: number): void {
      this.drawFace(world.gaiaMood, now);
      const f = world.gaiaFactors();
      const sig = `${Math.round(world.gaiaMood * 100)}|${[f.climate, f.life, f.diversity, f.clean].map((v) => Math.round(v * 50)).join(',')}|` +
        `${fmt.one(world.globalTemp)}|${fmt.int(world.co2)}|${f.groups}`;
      if (sig === this.sig) return;
      this.sig = sig;
      this.moodLabel.textContent = GaiaPanel.moodLabel(world.gaiaMood);
      this.moodValue.textContent = `${Math.round(world.gaiaMood * 100)} %`;
      this.moodMark.style.left = `${Math.round(world.gaiaMood * 1000) / 10}%`;
      const texts: Record<string, string> = {
        climate: `${fmt.one(world.globalTemp)} °C`,
        life: `${fmt.pct(world.lifeCover)} belebt`,
        diversity: `${f.groups} ${f.groups === 1 ? 'Gruppe' : 'Gruppen'}`,
        clean: `${fmt.int(world.co2)} ppm CO₂`,
      };
      for (const def of FACTORS) {
        const r = this.rows.get(def.key);
        if (!r) continue;
        const v = f[def.key];
        r.fill.style.width = `${Math.round(v * 100)}%`;
        r.fill.style.background = v > 0.66 ? 'var(--ok)' : v > 0.33 ? 'var(--amber)' : 'var(--warn)';
        r.text.textContent = texts[def.key];
      }
    }

    private drawFace(mood: number, now: number): void {
      if (!fitCanvas(this.canvas)) return;
      const ctx = this.canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = this.canvas.width / dpr;
      const h = this.canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.38;

      // Her aura: green when well, a sickly red when not.
      const halo = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.45);
      halo.addColorStop(0, `rgba(${Math.round(lerp(255, 110, mood))},${Math.round(lerp(120, 220, mood))},${Math.round(lerp(110, 200, mood))},0.4)`);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // The planet: ocean, continents, then light and shadow over both.
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = mix([110, 112, 124], [42, 132, 196], mood);
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = mix([150, 116, 84], [98, 176, 92], mood);
      ctx.globalAlpha = 0.85;
      for (const poly of CONTINENTS) {
        ctx.beginPath();
        for (let k = 0; k < poly.length; k += 2) {
          const x = cx + poly[k] * r;
          const y = cy + poly[k + 1] * r;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      const light = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.5, r * 0.1, cx, cy, r * 1.05);
      light.addColorStop(0, 'rgba(255,255,255,0.32)');
      light.addColorStop(0.55, 'rgba(255,255,255,0)');
      light.addColorStop(1, 'rgba(0,10,20,0.45)');
      ctx.fillStyle = light;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
      ctx.strokeStyle = `rgba(150,220,255,${0.35 + mood * 0.35})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
      ctx.stroke();

      this.drawFeatures(ctx, cx, cy, r, mood, now);
    }

    private drawFeatures(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, mood: number, now: number): void {
      const ink = '#0c1a14';
      const gaze = Math.min(r * 0.07, 5);
      const gx = clamp((this.pointer.x - 0.5) * 2, -1, 1) * gaze;
      const gy = clamp((this.pointer.y - 0.45) * 2, -1, 1) * gaze;
      // She blinks now and then.
      const blink = now % 4200 < 130;
      const worry = clamp((0.5 - mood) * 2, 0, 1);

      for (const side of [-1, 1]) {
        const ex = cx + side * r * 0.34;
        const ey = cy - r * 0.12;
        const rx = r * 0.15;
        const ry = r * 0.17;
        if (blink) {
          ctx.strokeStyle = ink;
          ctx.lineWidth = Math.max(2, r * 0.05);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(ex - rx, ey);
          ctx.quadraticCurveTo(ex, ey + ry * 0.5, ex + rx, ey);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#f6f1df';
          ctx.beginPath();
          ctx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = ink;
          ctx.beginPath();
          ctx.arc(ex + gx, ey + gy, r * 0.075, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath();
          ctx.arc(ex + gx - r * 0.025, ey + gy - r * 0.03, r * 0.022, 0, Math.PI * 2);
          ctx.fill();
        }
        // Brows rise in the middle when she worries.
        ctx.strokeStyle = ink;
        ctx.lineWidth = Math.max(2, r * 0.045);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ex - side * rx * 1.05, ey - ry * 1.45 + worry * ry * 0.5);
        ctx.lineTo(ex + side * rx * 1.05, ey - ry * 1.45 - worry * ry * 0.35);
        ctx.stroke();
        // A blush when she is happy.
        if (mood > 0.6) {
          ctx.fillStyle = `rgba(255,140,150,${(mood - 0.6) * 0.9})`;
          ctx.beginPath();
          ctx.ellipse(ex + side * rx * 0.4, cy + r * 0.2, rx * 0.8, ry * 0.42, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const my = cy + r * 0.38;
      if (mood < 0.18) {
        // Horror: the mouth falls open.
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.ellipse(cx, my + r * 0.02, r * 0.14, r * 0.17, 0, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      const curve = (mood - 0.5) * 2;
      ctx.strokeStyle = ink;
      ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(2.5, r * 0.075);
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.34, my);
      ctx.quadraticCurveTo(cx, my + curve * r * 0.34, cx + r * 0.34, my);
      ctx.stroke();
    }
  }
}
