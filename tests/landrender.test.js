'use strict';
/*
 * The pixel terrain compositor (docs/biomes-spec.md §4): it composes in
 * palette indices without a DOM, so it runs here on a synthetic planet —
 * bands of landscapes, a coast, rivers. Chunks must join without a seam
 * (also across the date line and across rivers), composition must be
 * deterministic and opaque, every plant group must get objects where it
 * grows, the forest must thin towards its edge, rivers must follow their
 * flow (no ladders, no right-angle stairs), and a chunk's signature must
 * change exactly when something that reaches into it changed.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const zlib = require('zlib');
const { loadSE } = require('./helpers');

const SE = loadSE();
const M = SE.TERRAIN_MANIFEST;
const CHUNK = 16;
const MARGIN = 2;
const SIDE = CHUNK * 16 + 2 * MARGIN;

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
  for (let y = 0; y < M.height; y++) {
    assert.equal(raw[y * (M.width + 1)], 0, 'atlas rows use PNG filter 0');
    px.set(raw.subarray(y * (M.width + 1) + 1, (y + 1) * (M.width + 1)), y * M.width);
  }
  return px;
}

const art = SE.LandArt.fromIndices(atlasIndices());
const L = SE.Landscape;
const BANDS = [L.Desert, L.Semidesert, L.Savanna, L.Rainforest, L.Forest, L.Taiga, L.Tundra, L.Lichen, L.Meadow, L.Steppe,
  L.Shrubland, L.Fernland, L.Moss, L.Marsh, L.Swampforest, L.Snow, L.Rock, L.Ice];

/** A river through tiles [[x, y], …] in flow order, the last draining into whatever lies beyond. */
function addRiver(w, tiles, level = 0.5) {
  tiles.forEach(([x, y], k) => {
    const i = y * SE.GRID_W + x;
    w.riverLevel[i] = Math.min(1, level + k * 0.01);
    w.riverFlow[i] = 60 + k * 10;
    const next = tiles[k + 1];
    if (next) w.riverDown[i] = next[1] * SE.GRID_W + next[0];
  });
}

/** Tiles of a river going `steps` times one left and one up, from (x, y): a 4-neighbour staircase. */
function staircase(x, y, steps) {
  const out = [[x, y]];
  for (let k = 0; k < steps; k++) {
    out.push([--x, y]);
    out.push([x, --y]);
  }
  return out;
}

/** Sea west of x = 40, then landscape bands 12 tiles wide, every plant group everywhere, rivers around y = 60. */
function bandWorld() {
  const w = new SE.WorldState();
  let all = 0;
  for (let g = 1; g < SE.FLORA_COUNT; g++) all |= 1 << g;
  for (let y = 0; y < SE.GRID_H; y++) {
    for (let x = 0; x < SE.GRID_W; x++) {
      const i = y * SE.GRID_W + x;
      if (x < 40 || x >= 252) {
        w.elevation[i] = -0.02 - Math.abs(x < 40 ? 40 - x : x - 252) * 0.03;
        w.biome[i] = w.elevation[i] > SE.COAST_DEPTH ? SE.Biome.Coast : SE.Biome.Ocean;
      } else {
        w.elevation[i] = 0.15 + 0.1 * Math.sin(x / 7) * Math.cos(y / 5);
        w.biome[i] = SE.Biome.Grass;
        const ls = BANDS[Math.floor((x - 40 + ((y * 7) % 3)) / 12) % BANDS.length];
        w.landscape[i] = ls;
        w.substrate[i] = ls === L.Marsh || ls === L.Swampforest ? SE.Substrate.Mire : ls === L.Desert ? SE.Substrate.Sand : SE.Substrate.Soil;
        w.landscapeDensity[i] = (x + y) % SE.LANDSCAPE_DENSITIES[ls];
      }
      w.flora[i] = all;
      w.floraTop[i] = SE.Flora.Broadleaf;
      w.vegetation[i] = 0.7;
    }
  }
  // A river west into the sea along y = 60, and a staircase tributary across chunk borders joining it.
  const main = [];
  for (let x = 120; x >= 40; x--) main.push([x, 60]);
  addRiver(w, main, 0.4);
  w.riverDown[60 * SE.GRID_W + 40] = 60 * SE.GRID_W + 39;
  const side = staircase(104, 70, 9);
  addRiver(w, side, 0.25);
  const [lx, ly] = side[side.length - 1];
  w.riverDown[ly * SE.GRID_W + lx] = 60 * SE.GRID_W + lx;
  return w;
}

const world = bandWorld();
const field = new SE.TerrainField();
field.refresh(world);
const composer = new SE.LandComposer(art);

function chunk(cx, cy) {
  const out = new Uint32Array(SIDE * SIDE);
  composer.compose(field, cx * CHUNK, cy * CHUNK, CHUNK, CHUNK, MARGIN, out, null);
  return out;
}

test('the atlas turns into textures, masks, rivers and sprites', () => {
  for (const id of Object.keys(M.materials)) {
    const mat = M.materials[id];
    assert.equal(art.ground[mat.rank].length, mat.densities.length, id);
    for (const t of art.ground[mat.rank]) assert.ok(t.px.every((v) => v !== 0), `${id}: opaque`);
  }
  assert.equal(art.masks.length, 16);
  assert.ok(art.masks[15].every((vars) => vars.every((v) => v === 1)), 'case 15 is all inside');
  assert.ok(art.masks[0].every((vars) => vars.every((v) => v === 0)), 'case 0 is all outside');
  for (const id of Object.keys(M.objects)) assert.ok(art.sprites[id].length > 0, id);
  // Ramp shifts stay on their ramp and clamp at its ends.
  const water = M.ramps.water;
  assert.equal(art.shift[SE.LAND_SHIFT_MAX + 1][water[2]], water[3]);
  assert.equal(art.shift[SE.LAND_SHIFT_MAX - 2][water[0]], water[0]);
});

test('composition is deterministic and fully opaque', () => {
  const a = chunk(4, 3);
  const b = chunk(4, 3);
  assert.deepEqual(a, b);
  const alpha = new Uint8Array(a.buffer);
  for (let k = 3; k < alpha.length; k += 4) assert.equal(alpha[k], 255, `pixel ${(k - 3) / 4} is opaque`);
});

test('neighbouring chunks join without a seam, across the date line too', () => {
  const pairs = [[[3, 3], [4, 3]], [[15, 2], [0, 2]], [[6, 3], [6, 4]], [[5, 3], [6, 3]], [[2, 1], [3, 1]]];
  for (const [[ax, ay], [bx, by]] of pairs) {
    const a = chunk(ax, ay);
    const b = chunk(bx, by);
    if (ay === by) {
      // A's right margin is B's first columns.
      for (let y = 0; y < SIDE; y++) {
        for (let j = 0; j < 2 * MARGIN; j++) {
          assert.equal(a[y * SIDE + CHUNK * 16 + j], b[y * SIDE + j], `chunk ${ax},${ay} | ${bx},${by} at row ${y}`);
        }
      }
    } else {
      for (let x = 0; x < SIDE; x++) {
        for (let j = 0; j < 2 * MARGIN; j++) {
          assert.equal(a[(CHUNK * 16 + j) * SIDE + x], b[j * SIDE + x], `chunk ${ax},${ay} / ${bx},${by} at column ${x}`);
        }
      }
    }
  }
});

test('every plant group gets objects where it grows', () => {
  const T = SE.LandTables.shared();
  const f = new SE.TerrainField();
  for (let g = 1; g < SE.FLORA_COUNT; g++) {
    const id = SE.FLORA[g].id;
    const group = M.groups[id];
    if (group.objects.length === 0) { assert.ok(group.swatch, `${id} shows in the ground`); continue; }
    const scene = [...T.showable.keys()].find((s) => (T.showable[s] & (1 << g)) !== 0);
    assert.ok(scene !== undefined, `${id} has a scene to show in`);
    for (let y = 10; y < 20; y++) {
      for (let x = 10; x < 20; x++) {
        const i = y * SE.GRID_W + x;
        f.scene[i] = scene;
        f.groups[i] = 1 << g;
        f.top[i] = g;
        f.density[i] = 2;
        f.edge[i] = 2;
      }
    }
    const list = [];
    SE.placeLandObjects(f, art, 10, 10, 19, 19, list);
    const own = new Set(group.objects.map((o) => o.id));
    assert.ok(list.some((p) => own.has(p.sprite.id)), `${id} shows one of its objects in ${scene === SE.LAND_SCENE_SEA ? 'the sea' : SE.LANDSCAPE_IDS[scene]}`);
  }
});

test('the forest thins and stays small towards its edge', () => {
  const f = new SE.TerrainField();
  const count = (edge) => {
    for (let y = 30; y < 50; y++) {
      for (let x = 30; x < 50; x++) {
        const i = y * SE.GRID_W + x;
        f.scene[i] = L.Forest;
        f.groups[i] = 1 << SE.Flora.Broadleaf;
        f.top[i] = SE.Flora.Broadleaf;
        f.density[i] = 1;
        f.edge[i] = edge;
      }
    }
    const list = [];
    SE.placeLandObjects(f, art, 30, 30, 49, 49, list);
    return list;
  };
  const inside = count(2);
  const edge = count(0);
  const trees = (list) => list.filter((p) => p.sprite.size !== '');
  assert.ok(edge.length < inside.length * 0.5, `edge ${edge.length} vs inside ${inside.length}`);
  assert.ok(trees(edge).every((p) => p.sprite.size === 's'), 'edge trees are small');
  assert.ok(trees(inside).some((p) => p.sprite.size === 'l'), 'inside trees grow tall');
  assert.ok(edge.some((p) => p.sprite.size === ''), 'bushes form the mantle');
  // Sorted for drawing: row by row from the top.
  for (let k = 1; k < inside.length; k++) assert.ok(inside[k - 1].fy <= inside[k].fy);
});

test('no objects on rivers and cities; kelp only in coastal water with marine algae', () => {
  assert.equal(field.scene[60 * SE.GRID_W + 80], SE.LAND_SCENE_NONE, 'river tile');
  assert.ok(field.river[60 * SE.GRID_W + 80] > 0);
  assert.equal(field.scene[60 * SE.GRID_W + 38], SE.LAND_SCENE_SEA, 'coastal water');
  assert.equal(field.scene[60 * SE.GRID_W + 5], SE.LAND_SCENE_NONE, 'open ocean');
  const w = bandWorld();
  w.tech[70 * SE.GRID_W + 100] = SE.Tech.Stone;
  const f = new SE.TerrainField();
  f.refresh(w);
  assert.equal(f.scene[70 * SE.GRID_W + 100], SE.LAND_SCENE_NONE, 'city tile');
});

/** Bare sand with the sea west of x = 40: nothing but rivers is drawn in water colours inland. */
function sandWorld() {
  const w = new SE.WorldState();
  for (let y = 0; y < SE.GRID_H; y++) {
    for (let x = 0; x < SE.GRID_W; x++) {
      const i = y * SE.GRID_W + x;
      w.elevation[i] = x < 40 ? -0.1 : 0.1;
      w.biome[i] = x < 40 ? SE.Biome.Coast : SE.Biome.Desert;
      w.landscape[i] = L.Desert;
      w.substrate[i] = SE.Substrate.Sand;
    }
  }
  return w;
}

/** Compose tiles [tx, tx + tw) × [ty, ty + th) and mark the pixels drawn in a water colour. */
function riverPixels(w, tx, ty, tw, th) {
  const f = new SE.TerrainField();
  f.refresh(w);
  const out = new Uint32Array(tw * 16 * th * 16);
  new SE.LandComposer(art).compose(f, tx, ty, tw, th, 0, out, null);
  const blue = new Set(M.ramps.water.map((v) => art.rgba[v]));
  return { w: tw * 16, h: th * 16, wet: out.map((v) => (blue.has(v) ? 1 : 0)) };
}

test('rivers join along their flow only: two side by side stay apart', () => {
  const w = sandWorld();
  const row = (y) => Array.from({ length: 41 }, (_, k) => [80 - k, y]);
  addRiver(w, row(40));
  addRiver(w, row(41));
  w.riverDown[40 * SE.GRID_W + 40] = 40 * SE.GRID_W + 39;
  w.riverDown[41 * SE.GRID_W + 40] = 41 * SE.GRID_W + 39;
  assert.equal(SE.RiverSystem.connectionMask(w, 60, 40), 1 | 2, 'west and east, no rung to the river beside it');
  assert.equal(SE.RiverSystem.connectionMask(w, 40, 41), 1 | 2, 'into the sea and upstream');
  const img = riverPixels(w, 50, 38, 20, 6);
  // Tile rows 40 and 41 meet at pixel row 2·16 of the picture: land between the two rivers.
  for (let x = 0; x < img.w; x++) assert.equal(img.wet[2 * 16 * img.w + x], 0, `dry between the rivers at x ${x}`);
  let wet = 0;
  for (let k = 0; k < img.wet.length; k++) wet += img.wet[k];
  assert.ok(wet > img.w * 4, 'both rivers are drawn');
});

test('a staircase river is drawn as a smooth diagonal, without right-angle steps', () => {
  const w = sandWorld();
  addRiver(w, staircase(90, 70, 12));
  const img = riverPixels(w, 60, 40, 34, 34);
  let last = null;
  for (let y = 4 * 16; y < 30 * 16; y++) {
    let count = 0;
    let run = 0;
    let longest = 0;
    let sum = 0;
    for (let x = 0; x < img.w; x++) {
      if (img.wet[y * img.w + x]) { count++; run++; sum += x; longest = Math.max(longest, run); } else run = 0;
    }
    if (count === 0) continue;
    assert.ok(longest <= 12, `row ${y}: a straight run of ${longest} px is a stair step`);
    const mid = sum / count;
    if (last !== null) assert.ok(Math.abs(mid - last) <= 3, `row ${y}: the river jumps sideways by ${(mid - last).toFixed(1)} px`);
    last = mid;
  }
  assert.ok(last !== null, 'the river is drawn');
});

test('a chunk is recomposed exactly when something reaching into it changed', () => {
  const w = bandWorld();
  const f = new SE.TerrainField();
  f.refresh(w);
  const sig = (cx, cy) => f.signature(cx * CHUNK, cy * CHUNK, CHUNK, CHUNK, 0);
  const before = [sig(5, 3), sig(6, 3), sig(9, 6)];
  // A plant group arrives on a tile at the right border of chunk (5, 3).
  const i = (3 * CHUNK + 4) * SE.GRID_W + 5 * CHUNK + 15;
  w.flora[i] = 1 << SE.Flora.Mosses;
  f.refresh(w);
  assert.notEqual(sig(5, 3), before[0], 'its own chunk');
  assert.notEqual(sig(6, 3), before[1], 'the neighbour its objects reach into');
  assert.equal(sig(9, 6), before[2], 'a far chunk');
  // Same world, same field: nothing changes.
  const again = new SE.TerrainField();
  again.refresh(w);
  assert.equal(again.signature(5 * CHUNK, 3 * CHUNK, CHUNK, CHUNK, 0), sig(5, 3));
});
