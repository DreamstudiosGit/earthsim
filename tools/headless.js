/* =============================================================================
 * SimEarth 2.0 — headless probe
 * -----------------------------------------------------------------------------
 * Runs the simulation with no browser at all and prints what the planet turned
 * into. The tuning in this project is empirical — how much of a continent ends
 * up desert, how many rivers reach the sea, whether mountains survive erosion —
 * and none of that is visible from reading the code or from a unit test.
 *
 * It works because `tsc` emits one classic script in which every cross-file
 * reference goes through the `SE` namespace object, and the bootstrap at the
 * end of app.ts is guarded on `typeof document`. Running the bundle therefore
 * defines everything and starts nothing.
 *
 *   node tools/headless.js [ticks] [seed ...] [--life] [--map] [--track]
 *
 *     --life   play the evolution tree greedily (develop the cheapest
 *              available step every few ticks), so the planet grows a
 *              biosphere the way a player's planet does
 *     --map    print an ASCII relief map of the first planet
 *     --track  watch relief and drainage over a long run
 *
 * ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BUNDLE = path.join(__dirname, '..', 'simulation.js');

/**
 * Load into *this* realm's global scope, not a fresh `vm` context.
 *
 * This matters far more than it looks. Every cross-file reference in the bundle
 * is a property read off the `SE` object, and in a separate vm context those
 * reads do not get the inline caching they get in an ordinary global scope:
 * measured 111 ms/tick there against 8.7 ms/tick here, for byte-identical code
 * on the same planet. Timings from a vm context are therefore worthless as a
 * guide to what the browser does — a 13x penalty is easily mistaken for a
 * performance regression that does not exist.
 */
function loadBundle() {
  vm.runInThisContext(fs.readFileSync(BUNDLE, 'utf8'));
  if (!globalThis.SE) throw new Error('simulation.js defined no SE namespace — run `npm run build`');
  return globalThis.SE;
}

/**
 * Every system, wired as App wires them. Without the tree nothing ever lives:
 * life starts when the player develops the first cells, and the plants
 * follow step by step — so `--life` plays the tree greedily.
 */
function makePlanet(SE, seed, withLife) {
  const p = {
    world: new SE.WorldState(),
    params: new SE.ModelParams(),
    geo: new SE.GeoSystem(),
    climate: new SE.ClimateSystem(),
    flora: new SE.FloraSystem(),
    life: new SE.LifeSystem(),
    civ: new SE.CivSystem(),
    events: new SE.EventSystem(),
    atmo: new SE.AtmosphereSystem(),
  };
  p.evo = new SE.EvolutionSystem(p.life, p.flora);
  SE.civEventSink = (k, x, y) => p.events.trigger(p.world, k, x, y);
  p.world.reset(seed);
  if (withLife) p.evo.develop(p.world, p.params, 'cells');
  return p;
}

/** One tick, in exactly the order of `App.tick`, plus the time bookkeeping. */
function step(SE, p, withLife) {
  const { world, params } = p;
  p.geo.step(world, params);
  p.events.step(world, params);
  SE.RiverSystem.maybeRebuild(world);
  p.climate.step(world, params);
  p.flora.step(world, params);
  SE.BiomeSystem.step(world);
  p.life.stepLife(world, params, p.atmo);
  p.evo.step(world, params);
  p.civ.step(world, params, p.atmo);
  p.atmo.step(world, params);
  world.omega = Math.min(SE.OMEGA_MAX, world.omega + SE.OMEGA_REGEN);
  world.ticks++;
  world.absoluteYears += world.yearsPerTick;
  world.scaleYears += world.yearsPerTick;
  if (withLife && world.ticks % 5 === 0) {
    p.evo.refresh(world, params, true);
    const ids = p.evo.availableIds().sort((a, b) => SE.evoNode(a).cost - SE.evoNode(b).cost);
    if (ids.length) p.evo.develop(world, params, ids[0]);
  }
}

/** Drive one planet for `ticks`. */
function simulate(SE, seed, ticks, withLife) {
  const p = makePlanet(SE, seed, withLife);
  const started = Date.now();
  for (let t = 0; t < ticks; t++) step(SE, p, withLife);
  return { world: p.world, msPerTick: (Date.now() - started) / Math.max(1, ticks) };
}

function survey(SE, world) {
  const { TILE_COUNT, GRID_W } = SE;
  const s = {
    land: 0, moisture: 0, vegetation: 0,
    arid: 0, mid: 0, wet: 0,
    hills: 0, mountain: 0, peak: 0,
    river: 0, mouths: 0, orphans: 0, riparian: 0,
    dryRiver: 0, lake: 0,
  };

  for (let i = 0; i < TILE_COUNT; i++) {
    if (world.elevation[i] < 0) continue;
    s.land++;

    const m = world.moisture[i];
    s.moisture += m;
    s.vegetation += world.vegetation[i];
    if (m < 0.16) s.arid++;
    else if (m < 0.50) s.mid++;
    else s.wet++;

    const e = world.elevation[i];
    if (e > 0.30) s.hills++;
    if (e > 0.50) s.mountain++;
    if (e > 0.75) s.peak++;

    const down = world.riverDown[i];
    // Every land tile must have somewhere to send its water. This is the real
    // invariant the depression fill exists to guarantee.
    if (down < 0) s.orphans++;
    // Drainage is chosen on the *filled* surface, so a tile inside a basin
    // sends water toward ground that is higher on the raw terrain — that is
    // the lake surface, and it is correct, not a routing failure.
    else if (world.elevation[down] > e + 1e-4) s.lake++;

    if (world.riparian[i] > 0) s.riparian++;
    if (world.riverLevel[i] > 0) {
      s.river++;
      if (down >= 0 && world.elevation[down] < 0) s.mouths++;
      // The point of the whole feature: a river keeps its own tile green even
      // where the country around it is desert. Frozen ground is exempt — a
      // river under ice waters nothing, and should not.
      if (m < 0.22 && world.temperature[i] > 2) s.dryRiver++;
    }
  }
  return s;
}

/**
 * Share of land under each land biome — water zones are left out, since a
 * share "of land" that counted the oceans was simply wrong.
 */
function biomeLine(SE, world, land) {
  // Counted here rather than read from biomeCounts: Arctic covers sea ice too.
  const counts = new Array(SE.BIOME_COUNT).fill(0);
  for (let i = 0; i < SE.TILE_COUNT; i++) if (world.elevation[i] >= 0) counts[world.biome[i]]++;
  return SE.BIOME_NAMES
    .map((name, b) => [name, (counts[b] / land) * 100])
    .filter(([, share]) => share >= 0.5 && land > 0)
    .map(([name, share]) => `${name} ${share.toFixed(0)}%`)
    .join('  ');
}

function report(SE, seed, ticks, withLife) {
  const { world, msPerTick } = simulate(SE, seed, ticks, withLife);
  const s = survey(SE, world);
  const pct = (n) => `${((n / s.land) * 100).toFixed(1)}%`;

  console.log(
    `seed ${String(seed).padStart(7)}  ${msPerTick.toFixed(1)} ms/tick  ` +
    `T=${world.globalTemp.toFixed(1)}C  O2=${world.o2.toFixed(1)}%  ` +
    `land ${((s.land / SE.TILE_COUNT) * 100).toFixed(0)}% of ${SE.TILE_COUNT}`);
  console.log(
    `    moisture  mean ${(s.moisture / s.land).toFixed(3)}   ` +
    `arid ${pct(s.arid)}  mid ${pct(s.mid)}  wet ${pct(s.wet)}`);
  console.log(
    `    relief    hills ${pct(s.hills)}  mountain ${pct(s.mountain)}  peak ${pct(s.peak)}`);
  console.log(
    `    rivers    ${pct(s.river)} of land, ${s.mouths} reach the sea, ` +
    `banks ${pct(s.riparian)}, lake surface ${pct(s.lake)}`);
  if (withLife) {
    console.log(`    plants    mean cover ${(s.vegetation / s.land).toFixed(3)}`);
    console.log(`    biomes    ${biomeLine(SE, world, s.land)}`);
    console.log(`    tree      ${world.evo.developed.size} of ${SE.EVO_NODES.length} steps developed, ${world.evo.ep.toFixed(0)} EP banked`);
  }

  const problems = [];
  if (s.orphans > 0) problems.push(`${s.orphans} land tiles drain nowhere`);
  if (s.mouths === 0) problems.push('no river reaches the sea');
  if (s.dryRiver > 0) problems.push(`${s.dryRiver} unfrozen river tiles are too dry to grow grass`);
  if (s.river === 0) problems.push('no rivers at all');
  console.log(problems.length ? `    !! ${problems.join('; ')}` : '    ok');
  return s;
}

/**
 * Watch relief and drainage over a long run.
 *
 * Erosion is the only force that ever lowers the crust, so without the uplift
 * belts a planet planes itself flat over geological time and takes the rivers'
 * headwaters with it. That failure is invisible in a short run — it needs tens
 * of thousands of ticks, which is a few minutes here and a whole evening in the
 * browser.
 */
function track(SE, seed, ticks, withLife) {
  const p = makePlanet(SE, seed, withLife);
  const world = p.world;

  const step = Math.max(1, Math.round(ticks / 8));
  let first = null;
  console.log(`seed ${seed}, tracking relief and drainage to ${ticks} ticks`);

  for (let t = 0; t <= ticks; t++) {
    if (t % step === 0) {
      const s = survey(SE, world);
      if (!first) first = s;
      const pct = (n) => ((n / s.land) * 100).toFixed(1).padStart(5);
      console.log(
        `  t=${String(t).padStart(6)}  mountain ${pct(s.mountain)}%  peak ${pct(s.peak)}%  ` +
        `rivers ${pct(s.river)}%  mouths ${String(s.mouths).padStart(3)}  ` +
        `arid ${pct(s.arid)}%`);
    }
    step(SE, p, withLife);
  }

  const last = survey(SE, world);
  const kept = last.mountain / Math.max(1, first.mountain);
  console.log(
    `  mountains retained ${(kept * 100).toFixed(0)}% of the starting extent — ` +
    `${kept >= 0.5 ? 'ok' : '!! uplift is not holding against erosion'}`);
  if (last.mouths < 20) console.log(`  !! only ${last.mouths} rivers still reach the sea`);
}

/** A quick look at the terrain, to check ranges are chains and not blobs. */
function asciiMap(SE, world, x0, y0, w, h) {
  const lines = [];
  for (let y = y0; y < y0 + h; y++) {
    let row = '';
    for (let x = x0; x < x0 + w; x++) {
      const i = SE.idx(SE.wrapX(x), SE.clampY(y));
      const e = world.elevation[i];
      if (e < 0) row += ' ';
      else if (world.riverLevel[i] > 0) row += 'R';
      else if (e > 0.75) row += '#';
      else if (e > 0.50) row += '^';
      else if (e > 0.30) row += '-';
      else row += '.';
    }
    lines.push(row);
  }
  return lines.join('\n');
}

function main() {
  const SE = loadBundle();
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')));

  const ticks = Number(args[0] || 800);
  const seeds = args.slice(1).map(Number);
  const planets = seeds.length ? seeds : [12345, 777, 42];
  const withLife = flags.has('--life');

  console.log(
    `grid ${SE.GRID_W}x${SE.GRID_H} = ${SE.TILE_COUNT} tiles, ${ticks} ticks` +
    `${withLife ? ', evolution tree played greedily' : ''}\n`);

  if (flags.has('--track')) {
    for (const seed of planets) track(SE, seed, ticks, withLife);
    return;
  }

  for (const seed of planets) report(SE, seed, ticks, withLife);

  if (flags.has('--map')) {
    const { world } = simulate(SE, planets[0], ticks, withLife);
    console.log(`\n  ' ' sea   . lowland   - hills   ^ mountain   # peak   R river\n`);
    console.log(asciiMap(SE, world, 40, 26, 110, 46));
  }
}

main();
