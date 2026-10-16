'use strict';
/*
 * Coal (src/coal.ts): swamps with dense cover bury peat, swamp forests of
 * giant clubmosses the most; peat matures over millions of years, so the
 * civilization and technology time scales form practically none. Cities
 * from the Industrial age on mine the reserve without touching the CO₂
 * model. The optional save field keeps it, and is estimated when missing.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSE, makeSim } = require('./helpers');

const SE = loadSE();
const F = SE.Flora;
const L = SE.Landscape;
const CLUB = 1 << F.Clubmosses;
const CONIFER = 1 << F.Conifers;

/** A planet of sea with `n` land tiles of one landscape, plant groups and cover, in the Carboniferous. */
function swamps(n, landscape, groups, cover = 0.8) {
  const s = makeSim(5);
  const w = s.world;
  for (let i = 0; i < SE.TILE_COUNT; i++) {
    w.elevation[i] = i < n ? 0.05 : -0.3;
    w.landscape[i] = i < n ? landscape : 0;
    w.flora[i] = i < n ? groups : 0;
    w.vegetation[i] = i < n ? cover : 0;
  }
  w.timeScale = SE.TimeScale.Evolution;
  w.absoluteYears = SE.PLANET_AGE - 320e6;
  return s;
}

/** Peat one Carboniferous tick buries. */
function buried(s) {
  const before = s.world.coalPeat + s.world.coal;
  SE.CoalSystem.step(s.world);
  return s.world.coalPeat + s.world.coal - before;
}

test('giant clubmoss swamp forests bury the most peat, later swamps a tenth, dry land none', () => {
  const giants = buried(swamps(100, L.Swampforest, CLUB));
  assert.ok(giants > 0);
  const d = SE.CoalSystem.lastDeposit;
  assert.ok(d.lycopsid > 0 && d.other === 0, 'all of it from giant clubmosses');

  const later = buried(swamps(100, L.Swampforest, CLUB | CONIFER));
  assert.ok(Math.abs(later / giants - SE.COAL_LATER) < 1e-9, `conifers in the swamp: ${later / giants}`);
  const gone = swamps(100, L.Swampforest, CLUB);
  gone.world.lycopsidsGone = true;
  assert.ok(Math.abs(buried(gone) / giants - SE.COAL_LATER) < 1e-9, 'small clubmosses make no hard coal');

  assert.ok(Math.abs(buried(swamps(100, L.Marsh, CLUB)) / giants - SE.COAL_MARSH) < 1e-9, 'a marsh lays down less');
  assert.equal(buried(swamps(100, L.Swampforest, CLUB, SE.COAL_MIN_COVER / 2)), 0, 'sparse cover lays down nothing');
  assert.equal(buried(swamps(100, L.Forest, CLUB)), 0, 'dry forest lays down nothing');
  assert.ok(Math.abs(buried(swamps(200, L.Swampforest, CLUB)) / giants - 2) < 1e-9, 'it grows with the swamp area');
});

test('peat matures into coal over millions of years', () => {
  const s = swamps(100, L.Swampforest, CLUB);
  const w = s.world;
  SE.CoalSystem.step(w);
  assert.ok(w.coal === 0 && w.coalPeat > 0, 'freshly buried peat is no coal yet');
  for (let k = 0; k < 4; k++) SE.CoalSystem.step(w);
  assert.ok(w.coal < 0.1 * (w.coal + w.coalPeat), `after half a million years: ${w.coal} of ${w.coal + w.coalPeat}`);

  // Two half-lives without new peat: a quarter of the peat is left.
  w.vegetation.fill(0);
  const total = w.coal + w.coalPeat;
  const peat = w.coalPeat;
  const ticks = Math.round(2 * SE.COAL_HALF_LIFE / w.yearsPerTick);
  for (let k = 0; k < ticks; k++) SE.CoalSystem.step(w);
  assert.ok(Math.abs(w.coal + w.coalPeat - total) < 1e-6 * total, 'maturing keeps the mass');
  assert.ok(Math.abs(w.coalPeat / peat - 0.25) < 1e-6, `peat left ${w.coalPeat / peat}`);
});

test('the civilization and technology time scales form practically no coal', () => {
  const geo = swamps(100, L.Swampforest, CLUB);
  geo.world.coalPeat = 1000;
  const perGeoTick = buried(geo);
  const geoMatured = geo.world.coal;
  for (const scale of [SE.TimeScale.Civilized, SE.TimeScale.Technology]) {
    const s = swamps(100, L.Swampforest, CLUB);
    s.world.timeScale = scale;
    s.world.coalPeat = 1000;
    assert.ok(buried(s) < perGeoTick * 1e-3, `${SE.TIMESCALE_NAMES[scale]}: peat`);
    assert.ok(s.world.coal < geoMatured * 1e-3, `${SE.TIMESCALE_NAMES[scale]}: coal`);
  }
});

test('mined coal is gone and the reserve never goes below zero', () => {
  const w = makeSim(5).world;
  w.coal = 100;
  assert.equal(SE.coalReserve(w), 100);
  assert.equal(SE.mineCoal(w, 30), 30);
  assert.equal(SE.mineCoal(w, -5), 0);
  assert.equal(SE.mineCoal(w, 500), 70);
  assert.equal(SE.coalReserve(w), 0);
  assert.equal(w.coalMined, 100);
});

/** A planet of sea with one meadow island; mammals think, cities on the given tech levels. */
function civ(techs, seed = 7) {
  const s = makeSim(seed);
  const w = s.world;
  for (let i = 0; i < SE.TILE_COUNT; i++) {
    w.elevation[i] = -0.3;
    w.landscape[i] = L.Meadow;
    w.substrate[i] = SE.Substrate.Soil;
    w.soil[i] = 200;
    w.temperature[i] = 15;
    w.riverLevel[i] = 0;
    w.landscapeZone[i] = SE.ZONE_NONE;
    w.tech[i] = 0;
    w.cityPop[i] = 0;
  }
  for (let y = 20; y < 60; y++) for (let x = 20; x < 100; x++) w.elevation[y * SE.GRID_W + x] = 0.1;
  techs.forEach((t, k) => {
    const i = 40 * SE.GRID_W + 24 + k * 10;
    w.tech[i] = t;
    w.cityPop[i] = 0.5;
  });
  w.sentientClass = SE.Life.Mammal;
  w.timeScale = SE.TimeScale.Technology;
  w.civ.clear();
  s.civ.sync(w, s.params);
  return s;
}

test('cities burn coal from the Industrial age on, by the fossil share of their energy', () => {
  const T = SE.Tech;
  assert.equal(SE.coalDemand(civ([T.Stone, T.Bronze, T.Iron]).world, civ([]).params), 0, 'no coal before industry');
  const one = civ([T.Industrial]);
  assert.equal(one.world.civ.cities.length, 1);
  const demand = SE.coalDemand(one.world, one.params);
  assert.ok(demand > 0);
  const two = civ([T.Industrial, T.Iron, T.Industrial]);
  assert.ok(Math.abs(SE.coalDemand(two.world, two.params) / demand - 2) < 1e-9, 'every industrial city counts');
  one.params.civEnergy.fossilFuel = 0;
  assert.equal(SE.coalDemand(one.world, one.params), 0, 'without fossil energy no coal');
});

test('mining coal leaves the CO₂ model exactly as it was', () => {
  const run = (reserve) => {
    const s = civ([SE.Tech.Industrial, SE.Tech.Atomic]);
    s.world.coal = reserve;
    for (let k = 0; k < 20; k++) {
      s.civ.step(s.world, s.params, s.atmo);
      s.world.ticks++;
    }
    return s;
  };
  const full = run(1000);
  const empty = run(0);
  assert.ok(full.world.coalMined > 0 && full.world.coal < 1000, 'the full reserve was mined');
  assert.equal(empty.world.coalMined, 0);
  for (const k of ['co2Delta', 'o2Delta', 'dustDelta']) assert.equal(full.atmo[k], empty.atmo[k], k);
  assert.equal(full.world.rng.getState(), empty.world.rng.getState(), 'coal draws no random numbers');
});

const ctx = (s) => ({ world: s.world, params: s.params, geo: s.geo, history: s.history });

test('the save keeps the coal; without the field it is estimated from the tree and the forests', () => {
  const a = makeSim(3);
  Object.assign(a.world, { coal: 12345.5, coalPeat: 321.25, coalMined: 99, lycopsidsGone: true });
  const doc = SE.SaveSystem.serialize(ctx(a));
  const b = makeSim(1);
  SE.SaveSystem.load(JSON.parse(JSON.stringify(doc)), ctx(b), b.life, b.flora);
  assert.deepEqual([b.world.coal, b.world.coalPeat, b.world.coalMined, b.world.lycopsidsGone], [12345.5, 321.25, 99, true]);

  // An older save: clubmosses 100 Myr before conifers, conifers 150 Myr before now; no forests.
  a.world.absoluteYears = SE.PLANET_AGE - 20e6;
  const now = a.world.absoluteYears;
  const develop = (id, years) => {
    for (let n = SE.evoNode(id); n; n = n.parent ? SE.evoNode(n.parent) : null) {
      if (!a.world.evo.developed.has(n.id)) a.world.evo.developed.set(n.id, { tick: 1, years });
    }
  };
  develop('clubmosses', now - 250e6);
  develop('conifers', now - 150e6);
  const old = SE.SaveSystem.serialize(ctx(a));
  delete old.coal;
  const c = makeSim(1);
  SE.SaveSystem.load(JSON.parse(JSON.stringify(old)), ctx(c), c.life, c.flora);
  const expect = 100e6 * SE.COAL_EST_LYCOPSID_YEAR + 150e6 * SE.COAL_EST_LATER_YEAR;
  assert.ok(Math.abs(c.world.coal - expect) < 1e-6 * expect, `estimated ${c.world.coal}, expected ${expect}`);
  assert.equal(c.world.coalPeat, 0);
  assert.equal(c.world.coalMined, 0);
  assert.equal(c.world.lycopsidsGone, false, 'no conifer forests yet');

  // A damaged field counts as missing.
  const bad = JSON.parse(JSON.stringify(doc));
  bad.coal.reserve = -1;
  const d = makeSim(1);
  SE.SaveSystem.load(bad, ctx(d), d.life, d.flora);
  assert.equal(d.world.coal, 0, 'a planet without clubmosses has no coal');
});

test('a missing field with conifer forests on the planet ends the giants quietly', () => {
  const a = makeSim(3);
  const w = a.world;
  let land = 0;
  for (let i = 0; i < SE.TILE_COUNT; i++) {
    if (w.elevation[i] < 0) continue;
    if (land++ % 5 === 0) {
      w.landscape[i] = L.Taiga;
      w.flora[i] |= CONIFER;
    }
  }
  const doc = SE.SaveSystem.serialize(ctx(a));
  delete doc.coal;
  const b = makeSim(1);
  SE.SaveSystem.load(JSON.parse(JSON.stringify(doc)), ctx(b), b.life, b.flora);
  assert.equal(b.world.lycopsidsGone, true);
  const note = b.world.evo.chronicle.find((e) => e.key === 'lycopsids:gone');
  assert.ok(note && b.world.evo.reported.has(note.key), 'in the chronicle, not as news');
});

test('the history graphs the coal reserve', () => {
  const s = makeSim(5);
  const series = s.history.series.find((x) => x.label === 'Kohlevorrat');
  assert.ok(series);
  s.world.coal = 4321;
  s.world.ticks = 0;
  s.history.sample(s.world);
  assert.equal(series.data[series.data.length - 1], 4321);
});
