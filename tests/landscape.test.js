'use strict';
/*
 * Landscapes and succession (docs/biomes-spec.md §3): the climax table, the
 * Schmitt triggers, stage-by-stage succession, the majority filter,
 * disturbances, natural neighbours on a played planet, determinism and the
 * format-7 save with its migration from format 6.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSE, makeSim, hash } = require('./helpers');

const SE = loadSE();
const L = SE.Landscape;
const F = SE.Flora;
const B = SE.Biome;
const bit = (...gs) => gs.reduce((m, g) => m | (1 << g), 0);
const ALL_PLANTS = bit(F.LandPlants, F.Mosses, F.Vascular, F.Ferns, F.SeedPlants, F.Conifers, F.Flowering, F.Broadleaf, F.Grasses);

/** Climax landscape for a climate and plant groups, on mature soil unless said otherwise. */
function climax(temp, moist, groups, { elev = 0.1, cover = 0.7, soil = true } = {}) {
  const z = SE.landscapeZone(temp, moist, elev, cover, SE.ZONE_NONE);
  return SE.landscapeTarget(z, groups, soil);
}

/**
 * A real planet's terrain with one uniform climate at sea level (each tile
 * as much colder as its height makes it) and plant cover on all land, every
 * land tile set back to bare rock. Climate and flora are not stepped, so
 * only succession moves.
 */
function uniformPlanet(seed, { temp = 16, moist = 0.45, veg = 0.8, flora = ALL_PLANTS } = {}) {
  const s = makeSim(seed);
  const w = s.world;
  for (let i = 0; i < SE.TILE_COUNT; i++) {
    w.temperature[i] = temp - SE.altitudeCooling(w.elevation[i]);
    w.moisture[i] = w.isWater(i) ? 1 : moist;
    if (w.isWater(i)) continue;
    w.vegetation[i] = veg;
    w.flora[i] = flora;
    w.soil[i] = 0;
    w.landscape[i] = L.Rock;
    w.landscapeNext[i] = L.Rock;
    w.landscapeHold[i] = 0;
    w.landscapeZone[i] = SE.ZONE_NONE;
  }
  SE.BiomeSystem.step(w, false);
  return s;
}

/** One tick of succession alone. */
function advance(w) {
  SE.BiomeSystem.step(w);
  w.ticks++;
}

/** A land tile in flat lowland (below the mountain belts), three tiles from any coast, mountain or wetland. */
function interiorTile(w) {
  for (let y = 10; y < SE.GRID_H - 10; y++) {
    for (let x = 0; x < SE.GRID_W; x++) {
      let ok = true;
      for (let dy = -3; dy <= 3 && ok; dy++) {
        for (let dx = -3; dx <= 3 && ok; dx++) {
          const e = w.elevation[SE.idx(SE.wrapX(x + dx), y + dy)];
          ok = e >= 0.02 && e < SE.ALPINE_MIN_ELEVATION - SE.SCHMITT_ELEVATION;
        }
      }
      if (ok) return SE.idx(x, y);
    }
  }
  return -1;
}

test('climax table: climate × plant groups (spec §3.4)', () => {
  assert.equal(climax(-20, 0.4, ALL_PLANTS), L.Ice);
  assert.equal(climax(SE.SNOW_TEMP - 2, 0.4, ALL_PLANTS, { elev: 0.85 }), L.Snow, 'summit snow');
  assert.equal(climax(SE.TROPICAL_TEMP + 3, 0.6, ALL_PLANTS), L.Rainforest);
  assert.equal(climax(SE.TROPICAL_TEMP - 1, 0.6, ALL_PLANTS, { elev: 0 }), L.Forest, 'warm but not tropical');
  assert.equal(climax(10, 0.45, ALL_PLANTS), L.Forest, 'cool and humid: broadleaf and mixed forest');
  assert.equal(climax(0, 0.45, ALL_PLANTS), L.Taiga, 'cold and humid: conifers');
  assert.equal(climax(0, 0.2, ALL_PLANTS), L.Tundra, 'cold and semi-arid');
  assert.equal(climax(0, 0.28, ALL_PLANTS), L.Taiga, 'cold air carries forest from moderate moisture on');
  assert.equal(climax(10, 0.2, ALL_PLANTS), L.Steppe);
  assert.equal(climax(10, 0.33, ALL_PLANTS), L.Meadow);
  assert.equal(climax(16, 0.3, ALL_PLANTS), L.Savanna);
  assert.equal(climax(16, 0.2, ALL_PLANTS), L.Semidesert);
  assert.equal(climax(16, 0.1, ALL_PLANTS), L.Desert);
  assert.equal(climax(SE.TREELINE_TEMP - 1, 0.45, ALL_PLANTS, { elev: 0.6 }), L.Alpine, 'above the tree line no forest');
  assert.equal(climax(20, 0.8, bit(F.Mosses, F.Ferns), { elev: 0.05 }), L.Marsh);
  assert.equal(climax(20, 0.8, bit(F.Clubmosses, F.Ferns), { elev: 0.05 }), L.Swampforest, 'Carboniferous swamp forest');
  // Bare ground, by soil and dryness.
  assert.equal(climax(10, 0.45, ALL_PLANTS, { cover: 0.02, soil: false }), L.Rock);
  assert.equal(climax(10, 0.45, ALL_PLANTS, { cover: 0.02 }), L.Barren, 'cleared land keeps its soil');
  assert.equal(climax(25, 0.1, 0, { cover: 0 }), L.Desert);
});

test('evolutionary fallback along the chains (spec §3.4/§3.5)', () => {
  const trees = bit(F.Mosses, F.Ferns, F.FirstTrees, F.SeedPlants);
  assert.equal(climax(SE.TROPICAL_TEMP + 3, 0.6, trees), L.Forest, 'wet tropics before the broadleaf trees: forest');
  const z = SE.landscapeZone(SE.TROPICAL_TEMP + 3, 0.6, 0.1, 0.8, SE.ZONE_NONE);
  assert.equal(SE.landscapeHabitat(L.Forest, z), B.Jungle, 'its habitat stays rainforest');
  assert.equal(climax(10, 0.45, bit(F.Mosses, F.Ferns)), L.Fernland, 'cool and humid before trees: Farnflur');
  assert.equal(climax(16, 0.3, bit(F.Mosses, F.Ferns, F.Flowering)), L.Fernland, 'open land before the grasses');
  assert.equal(climax(10, 0.45, bit(F.Mosses)), L.Moss, 'before the vascular plants: moss carpet');
  assert.equal(climax(10, 0.45, bit(F.Mosses), { soil: false }), L.Lichen, 'without soil: lichen and moss on rock');
  assert.equal(climax(10, 0.45, bit(F.Conifers, F.Mosses)), L.Taiga, 'conifers alone make the cool forest a taiga');
  assert.equal(climax(0, 0.2, bit(F.Conifers)), L.Shrubland, 'woody plants with no herbs: scrub, never bare');
  for (const groups of [bit(F.Flowering), bit(F.SeedPlants), bit(F.Mosses), bit(F.Vascular)]) {
    for (const [t, m] of [[0, 0.28], [10, 0.3], [16, 0.45], [25, 0.6]]) {
      const l = climax(t, m, groups);
      assert.ok(SE.LANDSCAPE_LEVEL[l] >= 1, `plants (${groups}) at ${t} °C / ${m} are not drawn as ${SE.LANDSCAPE_IDS[l]}`);
    }
  }
});

test('habitats keep their meaning: forest needs trees, taiga conifers, mosses make tundra', () => {
  const hab = (temp, moist, groups, opts) => {
    const z = SE.landscapeZone(temp, moist, (opts && opts.elev) || 0.1, (opts && opts.cover) || 0.7, SE.ZONE_NONE);
    return SE.landscapeHabitat(climax(temp, moist, groups, opts), z);
  };
  assert.equal(hab(14, 0.45, bit(F.Ferns)), B.Grass, 'ferns alone make open land');
  assert.equal(hab(14, 0.45, bit(F.Broadleaf, F.Ferns)), B.Forest);
  assert.equal(hab(25, 0.6, bit(F.Broadleaf)), B.Jungle);
  assert.equal(hab(8, 0.5, bit(F.Conifers, F.Mosses)), B.Boreal);
  assert.equal(hab(0, 0.4, bit(F.Mosses)), B.Tundra);
  assert.equal(hab(0, 0.45, bit(F.Conifers, F.Mosses)), B.Boreal);
  assert.equal(hab(0, 0.45, bit(F.FirstTrees, F.Mosses)), B.Boreal, 'any cold forest is boreal');
  assert.equal(hab(18, 0.45, 0, { cover: 0.05 }), B.Rock, 'bare ground');
  assert.equal(hab(30, 0.1, 0, { cover: 0.05 }), B.Desert);
  assert.equal(hab(20, 0.8, bit(F.LandPlants), { elev: 0.05 }), B.Swamp);
  assert.equal(SE.landscapeHabitat(L.Ice, 0), B.Arctic);
});

test('Schmitt triggers: an input wavering around a threshold does not flip the class', () => {
  const tLimit = SE.COLD_TEMP;
  let z = SE.landscapeZone(tLimit + 1, 0.4, 0.1, 0.6, SE.ZONE_NONE);
  assert.equal(SE.zoneTemp(z), 2, 'cool');
  for (const t of [tLimit - 1, tLimit + 0.5, tLimit - 1.4, tLimit + 1]) {
    z = SE.landscapeZone(t, 0.4, 0.1, 0.6, z);
    assert.equal(SE.zoneTemp(z), 2, `stays cool at ${t} °C`);
  }
  z = SE.landscapeZone(tLimit - 2, 0.4, 0.1, 0.6, z);
  assert.equal(SE.zoneTemp(z), 1, 'past the band it turns cold');
  z = SE.landscapeZone(tLimit + 1, 0.4, 0.1, 0.6, z);
  assert.equal(SE.zoneTemp(z), 1, 'and stays cold until past the band again');

  let b = SE.landscapeZone(10, 0.4, 0.1, 0.1, SE.ZONE_NONE);
  assert.ok(b & SE.ZONE_BARE);
  b = SE.landscapeZone(10, 0.4, 0.1, 0.15, b);
  assert.ok(b & SE.ZONE_BARE, 'cover has a band too');
  b = SE.landscapeZone(10, 0.4, 0.1, 0.17, b);
  assert.ok(!(b & SE.ZONE_BARE));
});

test('a wavering climate does not make the landscape flicker', { timeout: 120000 }, () => {
  const s = uniformPlanet(4242, { temp: 14, moist: 0.42 });
  const w = s.world;
  for (let k = 0; k < 80; k++) advance(w);
  // Every landscape a tile has held while the climate wavers; holding one again is a flicker.
  const held = Array.from(w.landscape, (l) => [l]);
  let flickers = 0;
  let land = 0;
  for (let i = 0; i < SE.TILE_COUNT; i++) if (!w.isWater(i)) land++;
  for (let k = 0; k < 40; k++) {
    // Moisture around the humid boundary (0.38) and the sea-level temperature around 14 °C, inside the bands.
    const m = k % 2 ? 0.36 : 0.40;
    const t = k % 3 ? 13 : 15;
    for (let i = 0; i < SE.TILE_COUNT; i++) {
      if (!w.isWater(i)) { w.moisture[i] = m; w.temperature[i] = t - SE.altitudeCooling(w.elevation[i]); }
    }
    advance(w);
    for (let i = 0; i < SE.TILE_COUNT; i++) {
      const h = held[i];
      if (w.landscape[i] === h[h.length - 1]) continue;
      if (h.includes(w.landscape[i])) flickers++;
      h.push(w.landscape[i]);
    }
  }
  const changed = held.filter((h) => h.length > 1).length;
  assert.equal(flickers, 0, `${flickers} landscapes went back and forth while the climate wavered inside the bands`);
  // Altitude belts put a class border on every contour line; the few tiles whose swing crosses
  // the far side of a band move on once, as a Schmitt trigger should.
  assert.ok(changed <= land * 0.02, `${changed} of ${land} land tiles changed at all`);
});

test('succession: rock to forest climbs at least four stages, each held for ticks', { timeout: 120000 }, () => {
  const s = uniformPlanet(4242, { temp: 16, moist: 0.45 });
  const w = s.world;
  const i = interiorTile(w);
  assert.ok(i >= 0, 'an interior lowland tile exists');
  const seen = [w.landscape[i]];
  let firstForest = -1;
  for (let k = 0; k < 120 && firstForest < 0; k++) {
    advance(w);
    if (w.landscape[i] !== seen[seen.length - 1]) seen.push(w.landscape[i]);
    if (firstForest < 0) {
      for (let j = 0; j < SE.TILE_COUNT; j++) if (w.landscape[j] === L.Forest) { firstForest = k + 1; break; }
    }
  }
  for (let k = 0; k < 120 && w.landscape[i] !== L.Forest; k++) {
    advance(w);
    if (w.landscape[i] !== seen[seen.length - 1]) seen.push(w.landscape[i]);
  }
  const names = seen.map((l) => SE.LANDSCAPE_IDS[l]).join(' → ');
  assert.equal(w.landscape[i], L.Forest, names);
  assert.ok(seen.length >= 5, `at least four stages: ${names}`);
  assert.equal(seen[0], L.Rock);
  assert.equal(seen[seen.length - 2], L.Shrubland, `scrub comes before the forest: ${names}`);
  for (let k = 1; k < seen.length; k++) {
    assert.ok(Math.abs(SE.LANDSCAPE_LEVEL[seen[k]] - SE.LANDSCAPE_LEVEL[seen[k - 1]]) <= 1 || seen[k - 1] === L.Rock,
      `one level at a time: ${names}`);
  }
  assert.ok(firstForest >= 4 * SE.SUCCESSION_MIN_HOLD, `first forest after ${firstForest} ticks`);
  // Zones grow from their edges: the whole area never switches in one tick.
  assert.ok(w.soil[i] >= Math.ceil(SE.SOIL_EARTH * 255), 'the forest stands on soil');
});

test('majority filter: a lone stage joins its neighbours', { timeout: 120000 }, () => {
  const s = uniformPlanet(4242, { temp: 16, moist: 0.45 });
  const w = s.world;
  for (let k = 0; k < 150; k++) advance(w);
  const i = interiorTile(w);
  assert.equal(w.landscape[i], L.Forest);
  w.landscape[i] = L.Shrubland;
  w.landscapeNext[i] = L.Shrubland;
  w.landscapeHold[i] = 0;
  // A change from outside succession is picked up when the filter sweeps
  // the tile's row (every SUCCESSION_SWEEP_ROWS ticks); make that now.
  const rows = SE.SUCCESSION_SWEEP_ROWS;
  w.ticks += ((Math.floor(i / SE.GRID_W) - w.ticks) % rows + rows) % rows;
  advance(w);
  assert.equal(w.landscape[i], L.Forest, 'a lone scrub tile inside the forest rejoins it at once');
  let lone = 0;
  let land = 0;
  for (let y = 1; y < SE.GRID_H - 1; y++) {
    for (let x = 0; x < SE.GRID_W; x++) {
      const j = SE.idx(x, y);
      if (w.isWater(j)) continue;
      land++;
      let same = 0;
      let summit = true;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const k = SE.idx(SE.wrapX(x + dx), y + dy);
        if (!(dx || dy) || w.isWater(k)) continue;
        if (w.landscape[k] === w.landscape[j]) same++;
        if (w.elevation[k] >= w.elevation[j]) summit = false;
      }
      // A single summit above the tree line stays alone, as it should.
      if (same === 0 && !(summit && w.elevation[j] >= SE.ALPINE_MIN_ELEVATION)) lone++;
    }
  }
  // What stays alone besides single summits are specks of coast.
  assert.ok(lone <= land * 0.002, `${lone} lone tiles of ${land} on a uniform planet`);
});

test('disturbances reset at once and the land regrows stage by stage', { timeout: 120000 }, () => {
  const s = uniformPlanet(4242, { temp: 16, moist: 0.45 });
  const w = s.world;
  for (let k = 0; k < 150; k++) advance(w);
  const i = interiorTile(w);
  const x = i % SE.GRID_W;
  const y = Math.floor(i / SE.GRID_W);
  const soil = w.soil[i];
  assert.equal(w.landscape[i], L.Forest);

  // The clearing brush: bare soil now, forest again only through the stages.
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) s.flora.clear(w, SE.idx(SE.wrapX(x + dx), y + dy));
  assert.equal(w.landscape[i], L.Barren);
  assert.equal(w.soil[i], soil, 'clearing keeps the soil');
  SE.BiomeSystem.step(w);
  assert.equal(w.landscape[i], L.Barren, 'and the cleared land does not jump back');
  const seen = [L.Barren];
  for (let k = 0; k < 200 && w.landscape[i] !== L.Forest; k++) {
    // The plants come back from the edge of the clearing.
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const j = SE.idx(SE.wrapX(x + dx), y + dy);
      w.flora[j] = ALL_PLANTS;
      w.vegetation[j] = Math.min(0.8, w.vegetation[j] + 0.05);
    }
    advance(w);
    if (w.landscape[i] !== seen[seen.length - 1]) seen.push(w.landscape[i]);
  }
  assert.equal(w.landscape[i], L.Forest);
  assert.ok(seen.length >= 4, `regrowth in stages: ${seen.map((l) => SE.LANDSCAPE_IDS[l]).join(' → ')}`);

  // Lava: rock without soil.
  s.events.trigger(w, SE.EventKind.Volcano, x, y);
  if (!w.isWater(i)) {
    assert.equal(w.landscape[i], L.Rock);
    assert.equal(w.soil[i], 0);
  }

  // An ice age arrives with the next refresh of the targets, all at once,
  // and scrapes the soil off.
  const j = SE.idx(SE.wrapX(x + 20), y);
  for (let k = 0; k < SE.TILE_COUNT; k++) if (!w.isWater(k)) w.temperature[k] = -25 - SE.altitudeCooling(w.elevation[k]);
  for (let k = 0; k < SE.SUCCESSION_TARGET_INTERVAL; k++) advance(w);
  if (!w.isWater(j)) assert.equal(w.landscape[j], L.Ice);
  const iced = w.soil[j];
  for (let k = 0; k < 10; k++) advance(w);
  assert.ok(w.soil[j] < iced || iced <= Math.floor(SE.SOIL_REGOLITH * 255), 'ice scours the soil down to the till');
});

test('succession is deterministic', { timeout: 120000 }, () => {
  const run = () => {
    const s = uniformPlanet(99, { temp: 12, moist: 0.4 });
    for (let k = 0; k < 30; k++) advance(s.world);
    return [hash(s.world.landscape), hash(s.world.landscapeNext), hash(s.world.landscapeHold), hash(s.world.soil)].join('|');
  };
  assert.equal(run(), run());
});

test('a played planet: natural neighbours only, and its plants are drawn', { timeout: 600000 }, () => {
  const s = makeSim(2718);
  s.evo.develop(s.world, s.params, 'cells');
  const w = s.world;
  const green = () => {
    let n = 0;
    for (let i = 0; i < SE.TILE_COUNT; i++) if (!w.isWater(i) && w.vegetation[i] >= 0.3 && w.flora[i] !== 0) n++;
    return n;
  };
  // When the land greens varies from run to run (the first shore plants
  // spread by chance): play on until there is enough of it to judge.
  s.play(3000);
  for (let k = 0; k < 8 && green() < 500; k++) s.play(200);
  let clashes = 0;
  let covered = 0;
  let hidden = 0;
  for (let y = 0; y < SE.GRID_H; y++) {
    for (let x = 0; x < SE.GRID_W; x++) {
      const i = SE.idx(x, y);
      if (w.isWater(i)) continue;
      assert.ok(w.landscape[i] < SE.LANDSCAPE_COUNT && w.landscapeNext[i] < SE.LANDSCAPE_COUNT, 'every land tile has a landscape');
      assert.ok(w.landscapeDensity[i] < SE.LANDSCAPE_DENSITIES[w.landscape[i]]);
      for (const [dx, dy] of [[1, 0], [1, 1], [0, 1], [-1, 1]]) {
        if (y + dy >= SE.GRID_H) continue;
        const j = SE.idx(SE.wrapX(x + dx), y + dy);
        if (!w.isWater(j) && (SE.LANDSCAPE_CLASH[w.landscape[i]] & (1 << w.landscape[j]))) clashes++;
      }
      if (w.vegetation[i] >= 0.3 && w.flora[i] !== 0) {
        covered++;
        if (w.landscape[i] === L.Rock || w.landscape[i] === L.Barren) hidden++;
      }
    }
  }
  assert.equal(clashes, 0, 'no unnatural neighbours (desert at ice, rainforest at tundra …)');
  assert.ok(covered > 500, `the planet is green (${covered} tiles with cover >= 0.3)`);
  assert.ok(hidden / covered < 0.02, `vegetated land drawn as bare: ${hidden} of ${covered}`);
});

const ctx = (s) => ({ world: s.world, params: s.params, geo: s.geo, history: s.history });

test('format 7 keeps landscape, next stage, hold and soil exactly', { timeout: 120000 }, async () => {
  const a = uniformPlanet(31, { temp: 16, moist: 0.45 });
  for (let k = 0; k < 9; k++) advance(a.world);
  let holding = 0;
  for (let i = 0; i < SE.TILE_COUNT; i++) if (a.world.landscapeHold[i] > 0) holding++;
  assert.ok(holding > 0, 'some tiles are mid-way through a stage');
  const text = await SE.SaveSystem.encode(SE.SaveSystem.serialize(ctx(a)));
  const doc = await SE.SaveSystem.decode(text);
  assert.equal(doc.version, SE.SAVE_FORMAT);
  const b = makeSim(1);
  SE.SaveSystem.load(doc, ctx(b), b.life, b.flora);
  for (const f of ['landscape', 'landscapeNext', 'landscapeHold', 'soil']) {
    assert.equal(hash(b.world[f]), hash(a.world[f]), `${f} survives the round trip`);
  }
  // A damaged landscape field is refused like any other.
  const bad = JSON.parse(JSON.stringify(doc));
  const bytes = Buffer.from(bad.fields.landscape, 'base64');
  bytes[5] = 200;
  bad.fields.landscape = bytes.toString('base64');
  assert.throws(() => SE.SaveSystem.load(bad, ctx(b), b.life, b.flora), (e) => e instanceof SE.SaveCorrupt);
});

test('a format-6 save starts its landscapes at their targets, with soil from its plants', { timeout: 120000 }, () => {
  const a = uniformPlanet(31, { temp: 16, moist: 0.45 });
  for (let k = 0; k < 40; k++) advance(a.world);
  const doc = SE.SaveSystem.serialize(ctx(a));
  doc.version = 6;
  for (const f of ['landscape', 'landscapeNext', 'landscapeHold', 'soil']) delete doc.fields[f];
  const original = JSON.stringify(doc);
  const b = makeSim(1);
  SE.SaveSystem.load(doc, ctx(b), b.life, b.flora);
  assert.equal(JSON.stringify(doc), original, 'the old document is not modified');
  const w = b.world;
  let land = 0;
  let atTarget = 0;
  let soiled = 0;
  for (let i = 0; i < SE.TILE_COUNT; i++) {
    if (w.isWater(i)) {
      assert.equal(w.landscapeNext[i], SE.LANDSCAPE_UNSET);
      continue;
    }
    land++;
    assert.notEqual(w.landscapeNext[i], SE.LANDSCAPE_UNSET, 'every land tile has started');
    if (w.landscape[i] === SE.SuccessionSystem.targetOf(i)) atTarget++;
    if (w.soil[i] >= Math.ceil(SE.SOIL_EARTH * 255)) soiled++;
  }
  assert.equal(atTarget, land, 'warm start: no hold, straight to the target');
  assert.ok(soiled > land * 0.8, `vegetated land gets soil (${soiled} of ${land})`);
});
