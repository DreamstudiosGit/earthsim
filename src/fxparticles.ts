/* =============================================================================
 * SimEarth 2.0 — effect particles
 * -----------------------------------------------------------------------------
 * Embers, sparks, ash, dust, debris and rain as single art pixels on the
 * pixel grid of the current zoom (docs/ereignisse-spec.md §2.3). One pool
 * of FX_PARTICLE_MAX slots in flat typed arrays, reused round-robin: when
 * it is full the oldest particle gives way, so a busy planet never
 * allocates or slows down. A particle's colour walks down its ramp as it
 * ages — an ember cools from yellow to dark red.
 * ========================================================================== */

namespace SE {
  export const FX_PARTICLE_MAX = 384;

  /** Glow colours from hottest to coolest. */
  export const FX_EMBER: readonly string[] = [fxColor('yellow', 0), fxColor('orange', 0), fxColor('red', 1), fxColor('red', 0)];

  export class FxParticles {
    /** Position and velocity in world art pixels (16 per tile) and art pixels per second. */
    private readonly x = new Float32Array(FX_PARTICLE_MAX);
    private readonly y = new Float32Array(FX_PARTICLE_MAX);
    private readonly vx = new Float32Array(FX_PARTICLE_MAX);
    private readonly vy = new Float32Array(FX_PARTICLE_MAX);
    private readonly gravity = new Float32Array(FX_PARTICLE_MAX);
    private readonly age = new Float32Array(FX_PARTICLE_MAX);
    /** Seconds to live; 0 is a free slot. */
    private readonly life = new Float32Array(FX_PARTICLE_MAX);
    private readonly top = new Uint8Array(FX_PARTICLE_MAX);
    private readonly ramp: (readonly string[])[] = new Array(FX_PARTICLE_MAX).fill(FX_EMBER);
    private next = 0;

    /** `top`: drawn above the clouds (ash, dust) rather than with the objects (embers, debris). */
    spawn(x: number, y: number, vx: number, vy: number, life: number, gravity: number, ramp: readonly string[], top = false): void {
      const k = this.next;
      this.next = (k + 1) % FX_PARTICLE_MAX;
      this.x[k] = x;
      this.y[k] = y;
      this.vx[k] = vx;
      this.vy[k] = vy;
      this.gravity[k] = gravity;
      this.age[k] = 0;
      this.life[k] = life;
      this.top[k] = top ? 1 : 0;
      this.ramp[k] = ramp;
    }

    update(dt: number): void {
      for (let k = 0; k < FX_PARTICLE_MAX; k++) {
        if (this.life[k] <= 0) continue;
        const a = this.age[k] + dt;
        if (a >= this.life[k]) {
          this.life[k] = 0;
          continue;
        }
        this.age[k] = a;
        this.vy[k] += this.gravity[k] * dt;
        this.x[k] += this.vx[k] * dt;
        this.y[k] += this.vy[k] * dt;
      }
    }

    clear(): void {
      this.life.fill(0);
    }

    /** One art pixel per particle, snapped to the art grid of the zoom; identity transform (device pixels). */
    draw(ctx: CanvasRenderingContext2D, cam: LandCamera, top: boolean): void {
      const s = (cam.tilePx * cam.dpr) / 16;
      const ox = cam.scrollX * 16;
      const oy = cam.scrollY * 16;
      const span = GRID_W * 16;
      const viewW = ctx.canvas.width;
      for (let k = 0; k < FX_PARTICLE_MAX; k++) {
        if (this.life[k] <= 0 || (this.top[k] === 1) !== top) continue;
        const r = this.ramp[k];
        ctx.fillStyle = r[Math.min(r.length - 1, Math.floor((this.age[k] / this.life[k]) * r.length))];
        // The map wraps in x: take the copy of the particle that lands in or just left of the view.
        let ax = ((Math.floor(this.x[k]) - ox) % span + span) % span;
        if (ax * s > viewW) ax -= span;
        const ay = Math.floor(this.y[k]) - oy;
        const x0 = Math.round(ax * s);
        const y0 = Math.round(ay * s);
        ctx.fillRect(x0, y0, Math.max(1, Math.round((ax + 1) * s) - x0), Math.max(1, Math.round((ay + 1) * s) - y0));
      }
    }
  }
}
