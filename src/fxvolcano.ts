/* =============================================================================
 * SimEarth 2.0 — the eruption on screen
 * -----------------------------------------------------------------------------
 * docs/ereignisse-spec.md §3.1, the reference for every other disaster:
 *   omen   (1 s)  smoke puffs rise from the tile, the ground trembles
 *   main   (3 s)  the column grows out of the crater, a lava fountain
 *                 throws embers and lava splashes, ash clouds break away
 *                 and drift with the wind; at the end the column lifts
 *                 off its vent
 *   spread        the flow itself is ground (fxground.ts); steam where it
 *                 meets the sea
 *   after         the cone stays: glowing while lava sits in the crater,
 *                 dark basalt, then green flanks; now and then it smokes
 * ========================================================================== */

namespace SE {
  const PUFF_MS = 900;
  /** Art pixels per ms a smoke puff rises. */
  const PUFF_RISE = 0.014;
  const GROW_MS = 350;
  const LIFT_MS = 450;
  const ASH_LIFE_MS = 7000;
  /** Art pixels per second the ash drifts with the wind. */
  const ASH_DRIFT = 4.5;
  const EMBER_EVERY_MS = 60;
  /** A lava splash flies from the mouth this often while the fountain plays, cooling as it goes. */
  const SPLASH_EVERY_MS = 220;
  const SPLASH_MS = 700;
  const STEAM_MS = 1100;
  /** Neighbours at open land or more before a resting vent shows green flanks. */
  const VENT_GREEN = 5;

  /** World art pixel of a tile's foot (bottom centre) and of its vent's crater. */
  function foot(x: number, y: number): [number, number] {
    return [x * 16 + 8, y * 16 + 15];
  }
  function mouth(x: number, y: number): [number, number] {
    const cone = FX_MANIFEST.sprites.vent_cone;
    const m = cone?.mouth ?? [12, 7];
    const [fx, fy] = foot(x, y);
    return [fx - (cone?.ax ?? 12) + m[0], fy - (cone?.ay ?? 23) + m[1]];
  }

  function puff(s: FxScene, x: number, y: number, age: number, footY: number): void {
    if (age < 0 || age >= PUFF_MS) return;
    s.add({ id: 'smoke_puff', frame: Math.floor((age / PUFF_MS) * 4), x, y: y - age * PUFF_RISE, foot: footY });
  }

  function ash(s: FxScene, st: FxStarted, x: number, y: number, key: string): void {
    if (!s.once(`${st.id}:${key}`)) return;
    const wind = ClimateSystem.airCurrent(st.y);
    s.spawn({ id: 'ash_cloud', x, y, vx: wind.dx * ASH_DRIFT, vy: wind.dy * ASH_DRIFT * 0.35 - 1.2, life: ASH_LIFE_MS, mode: 'loop' });
  }

  FX_SCRIPTS[EventKind.Volcano] = {
    omen(s: FxScene, x: number, y: number, t: number): void {
      const [fx, fy] = foot(x, y);
      for (let k = 0; k < 3; k++) puff(s, fx + [-2, 3, 0][k], fy - 6, t - k * 300, fy);
      s.shake(x, y, 1, 1);
    },

    main(s: FxScene, st: FxStarted, t: number): void {
      const [mx, my] = mouth(st.x, st.y);
      const footY = st.y * 16 + 15;
      const col = FX_MANIFEST.sprites.volcano_column;
      if (!col) return;
      const end = HAZARD_MAIN_MS[EventKind.Volcano];
      const grown = Math.min(col.h, Math.ceil((col.h * t) / GROW_MS));
      const lifted = t > end - LIFT_MS ? Math.ceil((col.h * (t - (end - LIFT_MS))) / LIFT_MS) : 0;
      s.add({
        id: 'volcano_column', frame: Math.floor(t / 100) % col.frames.length, x: mx, y: my, foot: footY, z: 1,
        rows: [col.h - grown, col.h - lifted],
      });
      if (t > 1400) ash(s, st, mx + 4, my - col.h + 8, 'ash1');
      if (t > end - LIFT_MS) ash(s, st, mx, my - col.h + 14, 'ash2');
      if (t < 700) s.shake(st.x, st.y, 1, 1);
      if (t > GROW_MS && t < end - LIFT_MS) {
        const n = Math.floor(t / EMBER_EVERY_MS) - Math.floor((t - s.dt * 1000) / EMBER_EVERY_MS);
        for (let k = 0; k < n; k++) {
          s.particles.spawn(
            mx + (Math.random() - 0.5) * 4, my - 6 - Math.random() * 10,
            (Math.random() - 0.5) * 56, -35 - Math.random() * 40, 0.8 + Math.random() * 0.6, 80, FX_EMBER,
          );
        }
        const splashes = Math.floor(t / SPLASH_EVERY_MS) - Math.floor((t - s.dt * 1000) / SPLASH_EVERY_MS);
        for (let k = 0; k < splashes; k++) {
          const side = Math.random() < 0.5 ? -1 : 1;
          s.spawn({ id: 'lava_splash', x: mx + side * 2, y: my - 4, vx: side * (10 + Math.random() * 14), vy: 6 + Math.random() * 6, life: SPLASH_MS, mode: 'once' });
        }
      }
    },

    live(s: FxScene, world: WorldState): void {
      const hz = world.hazards;
      for (let y = s.y0; y <= s.y1; y++) {
        for (let xx = s.x0; xx <= s.x1; xx++) {
          const x = wrapX(xx);
          const i = y * GRID_W + x;
          if (hz.scar[i] !== ScarKind.Vent) continue;
          const [fx, fy] = foot(xx, y);
          const active = hz.tile[i] === HazardTile.Lava;
          // Its flanks turn green once its basalt has aged and the land around is open land or more.
          let green = 0;
          for (let k = 0; k < 8; k++) {
            const ny = y + HAZARD_NY[k];
            if (ny >= 0 && ny < GRID_H && LANDSCAPE_LEVEL[world.landscape[idx(wrapX(x + HAZARD_NX[k]), ny)]] >= 2) green++;
          }
          s.add({ id: 'vent_cone', frame: active ? 0 : green >= VENT_GREEN && hz.scarAge[i] >= SCAR_MIN_TICKS[ScarKind.Basalt] ? 2 : 1, x: fx, y: fy, foot: fy, z: 0 });
          if (active) continue;
          // A resting volcano smokes now and then, each on its own beat.
          const period = 20000 + hazardRoll(world.seed, i, 7) * 20000;
          const phase = (s.now + hazardRoll(world.seed, i, 9) * period) % period;
          const [mx, my] = mouth(xx, y);
          puff(s, mx + 1, my - 2, phase, fy);
        }
      }
      for (const h of hz.list) {
        for (const st of h.lava?.steam ?? []) {
          if (world.ticks - st.tick > 2 || !s.once(`${h.id}:steam:${st.tile}:${st.tick}`)) continue;
          const x = st.tile % GRID_W;
          const y = (st.tile / GRID_W) | 0;
          s.spawn({ id: 'steam_puff', x: x * 16 + 8, y: y * 16 + 6, vx: 0, vy: -7, life: STEAM_MS, mode: 'once' });
          s.spawn({ id: 'steam_puff', x: x * 16 + 3, y: y * 16 + 10, vx: -2, vy: -5, life: STEAM_MS * 0.8, mode: 'once' });
        }
      }
    },
  };
}
