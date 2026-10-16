'use strict';
/*
 * Savanna trees, the flowering plants' savanna form (src/savannatrees.ts):
 * drawn only once broadleaf trees have arisen, only on savanna tiles with
 * flowering plants, few next to the desert and more towards the forest,
 * chosen per tile and fixed; about every eighth a baobab. Every other
 * object on the savanna stays where it was.
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
const art = SE.LandArt.fromIndices(atlasIndices());

const tile = (x, y) => y * SE.GRID_W + x;
/** Columns of the strip: desert, savanna, forest; the rest of the planet is meadow. */
const DESERT = [4, 13];
const SAVANNA = [14, 33];
const FOREST = [34, 43];
const ROWS = [10, 49];

/** An all-land planet with the strip in rows ROWS; savanna tiles carry `groups`; broadleaf trees arose if `broadleaf`. */
function strip(groups, broadleaf) {
  const s = makeSim(11);
  const w = s.world;
  for (let i = 0; i < SE.TILE_COUNT; i++) {
    const x = i % SE.GRID_W;
    const y = Math.floor(i / SE.GRID_W);
    const inRows = y >= ROWS[0] && y <= ROWS[1];
    const ls = !inRows ? L.Meadow : x >= DESERT[0] && x <= DESERT[1] ? L.Desert
      : x >= SAVANNA[0] && x <= SAVANNA[1] ? L.Savanna : x >= FOREST[0] && x <= FOREST[1] ? L.Forest : L.Meadow;
    w.elevation[i] = 0.2;
    w.temperature[i] = 24;
    w.moisture[i] = 0.4;
    w.riverLevel[i] = 0;
    w.riparian[i] = 0;
    w.tech[i] = SE.Tech.None;
    w.landscape[i] = ls;
    w.substrate[i] = SE.Substrate.Soil;
    w.landscapeDensity[i] = 1;
    w.flora[i] = ls === L.Savanna ? groups : GRASSES;
    w.vegetation[i] = 0.5;
    w.floraTop[i] = F.Grasses;
  }
  if (broadleaf) w.evo.developed.set('broadleaf', { tick: 0, years: w.absoluteYears });
  const f = new SE.TerrainField();
  f.refresh(w);
  return { s, w, f };
}

function eachSavanna(fn) {
  for (let y = ROWS[0]; y <= ROWS[1]; y++) for (let x = SAVANNA[0]; x <= SAVANNA[1]; x++) fn(tile(x, y), x, y);
}

test('the share of savanna trees grows from the desert towards the forest', () => {
  const near = SE.SAVANNA_TREE_REACH;
  assert.equal(SE.savannaTreeShare(1, near + 1), SE.SAVANNA_TREE_SHARE_DRY, 'only desert near');
  assert.equal(SE.savannaTreeShare(near + 1, 1), SE.SAVANNA_TREE_SHARE_FOREST, 'only forest near');
  const mid = SE.savannaTreeShare(near + 1, near + 1);
  assert.ok(mid > SE.SAVANNA_TREE_SHARE_DRY && mid < SE.SAVANNA_TREE_SHARE_FOREST, 'neither near: halfway');
  let last = 0;
  for (let d = 1; d <= near; d++) {
    const share = SE.savannaTreeShare(d, near + 1 - d);
    assert.ok(share >= last, `rises towards the forest at ${d}`);
    last = share;
  }
});

test('the distances to desert and forest run over the land and are worked out again only when a landscape changes', () => {
  const { w } = strip(FLOWERING, true);
  const reach = new SE.SavannaReach();
  reach.update(w);
  assert.equal(reach.toDry[tile(14, 20)], 1);
  assert.equal(reach.toForest[tile(33, 20)], 1);
  assert.equal(reach.toDry[tile(24, 20)], SE.SAVANNA_TREE_REACH + 1, 'beyond reach');
  const before = Uint8Array.from(reach.toDry);
  reach.update(w);
  assert.deepEqual(reach.toDry, before, 'nothing changed, nothing recomputed');
  w.landscape[tile(22, 20)] = L.Desert;
  reach.update(w);
  assert.equal(reach.toDry[tile(23, 20)], 1, 'a new desert tile counts at once');
});

test('no savanna trees before the broadleaf trees, nor on savanna without flowering plants', () => {
  const before = strip(FLOWERING | GRASSES, false);
  eachSavanna((i) => assert.equal(before.f.savannaTree[i], 0));
  const bare = strip(GRASSES, true);
  eachSavanna((i) => assert.equal(bare.f.savannaTree[i], 0));
  const after = strip(FLOWERING | GRASSES, true);
  for (let i = 0; i < SE.TILE_COUNT; i++) {
    if (after.w.landscape[i] !== L.Savanna) assert.equal(after.f.savannaTree[i], 0, 'only on savanna');
  }
});

test('savanna trees stand singly, denser towards the forest, each tile fixed', () => {
  const { f } = strip(FLOWERING | GRASSES, true);
  let dry = 0; let wet = 0; let all = 0; let tiles = 0;
  eachSavanna((i, x) => {
    tiles++;
    all += f.savannaTree[i];
    if (x <= SAVANNA[0] + 2) dry += f.savannaTree[i];
    if (x >= SAVANNA[1] - 2) wet += f.savannaTree[i];
  });
  assert.ok(wet > 2 * dry, `towards the forest ${wet}, towards the desert ${dry}`);
  assert.ok(all / tiles < 0.3, `singly: ${all} of ${tiles} tiles`);
  const again = strip(FLOWERING | GRASSES, true);
  eachSavanna((i) => assert.equal(again.f.savannaTree[i], f.savannaTree[i]));
});

test('on the map: a Schirmbaum or now and then a baobab, off the grid; every other object stays', () => {
  const before = strip(FLOWERING | GRASSES, false);
  const after = strip(FLOWERING | GRASSES, true);
  const place = (f) => {
    const list = [];
    SE.placeLandObjects(f, art, SAVANNA[0], ROWS[0], SAVANNA[1], ROWS[1], list);
    return list;
  };
  const a = place(before.f);
  const b = place(after.f);
  const key = (p) => `${p.sprite.id}@${p.fx},${p.fy}`;
  const old = new Set(a.map(key));
  const added = b.filter((p) => !old.has(key(p)));
  assert.ok(a.every((p) => b.some((q) => key(q) === key(p))), 'the old objects all stay');
  let marked = 0;
  eachSavanna((i) => { marked += after.f.savannaTree[i]; });
  assert.equal(added.length, marked, 'one tree per marked tile');
  assert.ok(added.every((p) => p.sprite.id === 'acacia' || p.sprite.id === 'baobab'));
  assert.ok(new Set(added.map((p) => `${p.fx % 16},${p.fy % 16}`)).size > 6, 'positions vary within the tile');

  // Over many tiles about every eighth tree is a baobab.
  let baobabs = 0;
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) baobabs += SE.savannaTreeId(art, x, y) === 'baobab' ? 1 : 0;
  const share = baobabs / (64 * 64);
  assert.ok(Math.abs(share - SE.SAVANNA_BAOBAB_SHARE) < 0.03, `baobabs: ${share}`);
});

test('the atlas has the baobab in three sizes and two forms, drawn by no slot', () => {
  const ob = M.objects.baobab;
  assert.ok(ob, 'baobab in the atlas');
  assert.equal(ob.group, 'flowering');
  assert.equal(ob.kind, 'tree');
  assert.equal(ob.variants.length, 6);
  for (const g of Object.values(M.groups)) assert.ok(!g.objects.some((o) => o.id === 'baobab'), 'no group places it in a slot');
});
