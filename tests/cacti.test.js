'use strict';
/*
 * Cacti, the flowering plants' desert form (src/cacti.ts): they arrive
 * CACTUS_DELAY_YEARS after the flowering plants, then let them onto drier
 * desert ground (never the hyper-arid core, never elsewhere) and make
 * semi-desert there rather than Farnflur; the chronicle says so once, and
 * the map draws a cactus on about half of the desert tiles with flowering
 * plants — before, none of their objects there; outside the deserts
 * nothing changes.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const zlib = require('zlib');
const { loadSE, makeSim } = require('./helpers');

const SE = loadSE();
const F = SE.Flora;
const L = SE.Landscape;
const M = SE.TERRAIN_MANIFEST;
const FLOWERING = 1 << F.Flowering;
const GRASSES = 1 << F.Grasses;

/** The atlas PNG (indexed, filter 0 on every row) as palette indices. */
function atlasIndices() {
  const buf = Buffer.from(SE.TERRAIN_ATLAS_PNG.slice(SE.TERRAIN_ATLAS_PNG.indexOf(',') + 1), 'base64');
  const idat = [];
  for (let p = 8; p < buf.length;) {
    const len = buf.readUInt32BE(p);
    if (buf.toString('ascii', p + 4, p + 8) === 'IDAT') idat.push(buf.subarray(p + 8, p + 8 + len));
    p += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const px = new Uint8Array(M.width * M.height);
  for (let y = 0; y < M.height; y++) px.set(raw.subarray(y * (M.width + 1) + 1, (y + 1) * (M.width + 1)), y * M.width);
  return px;
}

const tile = (x, y) => y * SE.GRID_W + x;
/** Desert in x 10..29, meadow in x 30..49, rows 10..29. */
const DESERT = { x0: 10, x1: 29, y0: 10, y1: 29 };
const MEADOW = { x0: 30, x1: 49, y0: 10, y1: 29 };
function each(r, fn) {
  for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) fn(tile(x, y));
}

/**
 * A warm land block: desert on the west, meadow on the east, every tile at
 * relative wetness `wet`, carrying `groups`. The flowering plants arose at
 * year 0; the clock stands `age` years later.
 */
function block(groups, age, wet = 0.18) {
  const s = makeSim(11);
  const w = s.world;
  const hold = 0.35 + 0.65 * Math.min(1, (25 + 12) / 42);
  const set = (l) => (i) => {
    w.elevation[i] = 0.2;
    w.temperature[i] = 25;
    w.moisture[i] = wet * hold;
    w.riverLevel[i] = 0;
    w.riparian[i] = 0;
    w.tech[i] = SE.Tech.None;
    w.landscape[i] = l;
    w.substrate[i] = SE.Substrate.Sand;
    w.landscapeDensity[i] = 1;
    w.flora[i] = groups;
    w.vegetation[i] = groups ? 0.3 : 0;
    w.floraTop[i] = groups ? F.Grasses : F.None;
  };
  each(DESERT, set(L.Desert));
  each(MEADOW, set(L.Meadow));
  w.absoluteYears = 1e9 + age;
  w.evo.developed.set('flowering', { tick: 0, years: 1e9 });
  s.flora.prepare(w, s.params, true);
  return s;
}

test('cacti arrive CACTUS_DELAY_YEARS after the flowering plants, not before', () => {
  const s = block(FLOWERING, 0);
  const w = s.world;
  assert.equal(SE.cactiArrived(w), false);
  w.absoluteYears = 1e9 + SE.CACTUS_DELAY_YEARS - 1;
  assert.equal(SE.cactiArrived(w), false);
  w.absoluteYears = 1e9 + SE.CACTUS_DELAY_YEARS;
  assert.equal(SE.cactiArrived(w), true);
  w.evo.developed.delete('flowering');
  assert.equal(SE.cactiArrived(w), false, 'no flowering plants, no cacti');
  assert.equal(SE.CACTUS_DELAY_YEARS, 95e6);
});

test('once cacti exist, flowering plants grow on dry desert ground, at most half suitable; nowhere else changes', () => {
  const desert = tile(15, 15);
  const meadow = tile(40, 15);
  const suit = (age, wet, i) => {
    const s = block(FLOWERING, age, wet);
    return { s: s.flora.suit(s.world, F.Flowering, i), problem: s.flora.problem(s.world, F.Flowering, i) };
  };
  const late = SE.CACTUS_DELAY_YEARS;

  assert.equal(suit(0, 0.18, desert).s, 0, 'before: too dry for them');
  assert.equal(suit(0, 0.18, desert).problem, 'es ist dort zu trocken');
  const after = suit(late, 0.18, desert);
  assert.ok(after.s >= 0.15 && after.s <= SE.CACTUS_SUIT, `after: a sparse stand (${after.s})`);
  assert.equal(after.problem, null);
  assert.equal(suit(late, 0.05, desert).s, 0, 'the hyper-arid core stays bare');
  assert.equal(suit(late, 0.05, desert).problem, 'es ist dort zu trocken');
  assert.ok(suit(late, 0.25, desert).s <= SE.CACTUS_SUIT);

  assert.equal(suit(late, 0.18, meadow).s, 0, 'the same dryness elsewhere: unchanged');
  for (const wet of [0.3, 0.45]) {
    const was = suit(0, wet, desert).s;
    assert.equal(suit(late, wet, desert).s, Math.max(was, SE.CACTUS_SUIT), `moist desert ground at ${wet}: at least as good for cacti`);
    assert.equal(suit(late, wet, meadow).s, suit(0, wet, meadow).s, `meadow at ${wet}: unchanged`);
  }
  // Other groups never notice the cacti.
  const a = block(GRASSES, 0);
  const b = block(GRASSES, late);
  assert.equal(b.flora.suit(b.world, F.Grasses, desert), a.flora.suit(a.world, F.Grasses, desert));
});

test('cacti make semi-desert of a desert climate, never Farnflur; before them and elsewhere the ladder is unchanged', () => {
  const target = (temp, moist, groups, cacti) => {
    const z = SE.landscapeZone(temp, moist, 0.1, 0.7, SE.ZONE_NONE);
    const lad = [0, 0, 0, 0, 0];
    return SE.ladderTarget(SE.fillLadder(z, groups, true, lad, SE.WOODY_FLORA_MASK, cacti), lad);
  };
  // Cool and semi-arid: open land would be the next stage.
  assert.equal(target(10, 0.2, FLOWERING, false), L.Fernland, 'before the cacti: flowering herbs');
  assert.equal(target(10, 0.2, FLOWERING, true), L.Semidesert, 'cacti');
  assert.equal(target(10, 0.2, FLOWERING | (1 << F.SeedPlants), true), L.Fernland, 'seed ferns still make Farnflur');
  assert.equal(target(10, 0.2, FLOWERING | GRASSES, true), L.Steppe, 'grasses still make steppe');
  assert.equal(target(22, 0.2, FLOWERING, true), L.Semidesert, 'warm and semi-arid: semi-desert either way');
  assert.equal(target(22, 0.1, FLOWERING, true), L.Desert, 'arid: desert either way');
  assert.equal(target(10, 0.35, FLOWERING, true), target(10, 0.35, FLOWERING, false), 'a moister climate: unchanged');
});

test('the chronicle reports the first cacti once, when they stand on a desert tile', () => {
  const none = block(GRASSES, SE.CACTUS_DELAY_YEARS);
  assert.deepEqual(SE.cactusMilestones(none.world), [], 'no flowering plants in the desert yet');
  assert.deepEqual(SE.cactusMilestones(block(FLOWERING, SE.CACTUS_DELAY_YEARS - 1).world), [], 'too early');

  const s = block(FLOWERING, SE.CACTUS_DELAY_YEARS);
  const [entry, ...rest] = SE.cactusMilestones(s.world);
  assert.equal(rest.length, 0);
  assert.equal(entry.title, 'In den Wüsten wachsen die ersten Kakteen.');
  assert.equal(entry.kind, 'milestone');
  s.evo.step(s.world, s.params);
  s.evo.step(s.world, s.params);
  assert.equal(s.world.evo.chronicle.filter((e) => e.key === entry.key).length, 1, 'recorded once');
  assert.deepEqual(SE.cactusMilestones(s.world), []);
});

test('the Examine window names flowering plants on desert ground as cacti, once they exist', () => {
  const before = block(FLOWERING, 0);
  const after = block(FLOWERING, SE.CACTUS_DELAY_YEARS);
  assert.equal(SE.growsAsCacti(before.world, tile(15, 15)), false);
  assert.equal(SE.growsAsCacti(after.world, tile(15, 15)), true);
  assert.equal(SE.growsAsCacti(after.world, tile(40, 15)), false, 'meadow');
  after.world.landscape[tile(15, 15)] = L.Semidesert;
  assert.equal(SE.growsAsCacti(after.world, tile(15, 15)), true, 'semi-desert');
  const bare = block(GRASSES, SE.CACTUS_DELAY_YEARS);
  assert.equal(SE.growsAsCacti(bare.world, tile(15, 15)), false, 'no flowering plants');
});

test('the atlas holds three cacti, 16×20 at most, standing on their last row', () => {
  const T = SE.LandTables.shared();
  assert.deepEqual([...T.cactusIds].sort(), ['cactus_barrel', 'cactus_column', 'cactus_opuntia']);
  for (const id of T.cactusIds) {
    const ob = M.objects[id];
    assert.equal(ob.group, 'flowering');
    assert.equal(ob.variants.length, 3);
    for (const v of ob.variants) {
      assert.ok(v.rect.w <= 16 && v.rect.h <= 20, `${id}: ${v.rect.w}×${v.rect.h}`);
      assert.equal(v.ay, v.rect.h - 1, `${id} stands on its last row`);
    }
  }
  assert.equal(M.objects.cactus, undefined, 'the old columnar cactus is gone');
  assert.equal(M.objects.succulent, undefined, 'the agave rosette is gone');
});

test('on the map: no flowering objects in the desert before the cacti, then a cactus on about half of those tiles', () => {
  const art = SE.LandArt.fromIndices(atlasIndices());
  const T = SE.LandTables.shared();
  const cacti = new Set(T.cactusIds);
  const flowering = new Set(M.groups.flowering.objects.map((o) => o.id));
  const draw = (age) => {
    const s = block(FLOWERING | GRASSES, age);
    const f = new SE.TerrainField();
    f.refresh(s.world);
    const desert = [];
    const meadow = [];
    SE.placeLandObjects(f, art, DESERT.x0, DESERT.y0, DESERT.x1, DESERT.y1, desert);
    SE.placeLandObjects(f, art, MEADOW.x0, MEADOW.y0, MEADOW.x1, MEADOW.y1, meadow);
    return { f, desert, meadow };
  };
  const before = draw(0);
  const after = draw(SE.CACTUS_DELAY_YEARS);

  each(DESERT, (i) => {
    assert.equal(before.f.groups[i] & FLOWERING, 0, 'flowering plants take no slot on desert ground');
    assert.equal(before.f.cactus[i], 0);
  });
  assert.ok(!before.desert.some((p) => flowering.has(p.sprite.id)), 'before: no flowering objects in the desert');
  assert.ok(before.desert.some((p) => p.sprite.id === 'grass_tuft'), 'the grasses still show');

  let marked = 0;
  let tiles = 0;
  each(DESERT, (i) => { tiles++; marked += after.f.cactus[i]; });
  const share = marked / tiles;
  assert.ok(Math.abs(share - SE.CACTUS_SHARE) < 0.1, `about half the desert tiles carry a cactus: ${share}`);
  const shown = after.desert.filter((p) => cacti.has(p.sprite.id));
  assert.equal(shown.length, marked, 'one cactus per marked tile');
  assert.ok(!after.desert.some((p) => flowering.has(p.sprite.id) && !cacti.has(p.sprite.id)), 'no other flowering objects');
  assert.equal(new Set(shown.map((p) => p.sprite.id)).size, 3, 'all three kinds appear');
  // Not on a grid: the feet spread over the tile.
  assert.ok(new Set(shown.map((p) => `${p.fx % 16},${p.fy % 16}`)).size > 8, 'positions vary within the tile');

  const sig = (list) => list.map((p) => `${p.sprite.id}@${p.fx},${p.fy}`).join(' ');
  assert.equal(sig(after.meadow), sig(before.meadow), 'outside the desert nothing changes');
  assert.ok(after.meadow.some((p) => flowering.has(p.sprite.id)), 'the meadow shows its flowers');

  const again = draw(SE.CACTUS_DELAY_YEARS);
  assert.deepEqual([...again.f.cactus], [...after.f.cactus], 'the choice is fixed per tile');
  each(DESERT, (i) => {
    assert.equal(after.f.sig[i] !== before.f.sig[i], after.f.cactus[i] === 1, 'a tile is redrawn exactly when it gains a cactus');
  });
});
