'use strict';
/*
 * The terrain atlas contract: the simulation's Landscape enum and the art's
 * catalog name the same landscapes in the same order, every plant group has
 * something to show on the map, every reference in the manifest resolves,
 * and the committed atlas is exactly what the recipes produce.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadSE } = require('./helpers');
const { build } = require('../tools/terrain/build');
const { assemble, renderTs } = require('../tools/terrain/atlas');
const { encodeIndexed } = require('../tools/terrain/png');
const P = require('../tools/terrain/palette');

const SE = loadSE();
const M = SE.TERRAIN_MANIFEST;

test('landscape ids match the atlas, in enum order', () => {
  assert.equal(SE.LANDSCAPE_IDS.length, SE.LANDSCAPE_COUNT);
  assert.equal(SE.LANDSCAPE_NAMES.length, SE.LANDSCAPE_COUNT);
  assert.deepEqual([...SE.LANDSCAPE_IDS], [...M.landscapeIds]);
  SE.LANDSCAPE_IDS.forEach((id, k) => {
    const soil = M.materials[M.landscapes[id].materials.soil];
    assert.equal(SE.LANDSCAPE_DENSITIES[k], soil.densities.length, `${id}: density steps`);
  });
});

test('every landscape resolves to materials on every substrate', () => {
  for (const id of M.landscapeIds) {
    for (const sub of SE.SUBSTRATE_IDS) {
      assert.ok(M.materials[M.landscapes[id].materials[sub]], `${id} on ${sub}`);
    }
  }
});

test('every plant group shows on the map, and its objects exist', () => {
  for (let g = 1; g < SE.FLORA_COUNT; g++) {
    const id = SE.FLORA[g].id;
    const group = M.groups[id];
    assert.ok(group, `${id} has a terrain group`);
    assert.ok(group.objects.length > 0 || group.swatch, `${id} has an object or a ground swatch`);
    for (const o of group.objects) {
      assert.ok(M.objects[o.id], `${id}: object ${o.id}`);
      assert.equal(M.objects[o.id].group, id, `${o.id} belongs to ${id}`);
      if (o.where !== '*') for (const w of o.where) assert.ok(w === 'sea' || M.landscapes[w], `${o.id}: where ${w}`);
    }
    if (group.swatch) assert.ok(M.materials[group.swatch.material] || M.overlays[group.swatch.material], `${id}: swatch`);
  }
  for (const a of M.abiotic) {
    assert.ok(M.objects[a.id]);
    for (const w of a.where) assert.ok(M.landscapes[w], `${a.id}: where ${w}`);
  }
});

test('the atlas has all 16 edge-mask cases', () => {
  assert.equal(M.masks.length, 16);
  for (const vars of M.masks) assert.ok(vars.length >= 1);
  assert.ok(SE.TERRAIN_ATLAS_PNG.startsWith('data:image/png;base64,'));
});

test('the committed atlas is what the recipes produce', () => {
  const art = build();
  assert.deepEqual(art.problems, []);
  const out = assemble(art);
  const png = encodeIndexed(out.size.w, out.size.h, out.px, P.PALETTE);
  const committed = fs.readFileSync(path.join(__dirname, '..', 'src', 'terrainatlas.ts'), 'utf8');
  assert.ok(committed === renderTs(png, out.manifest), 'src/terrainatlas.ts is stale: run node tools/terrain-atlas.js --write');
});
