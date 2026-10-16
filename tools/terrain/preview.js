/* =============================================================================
 * SimEarth 2.0 — preview compositor for contact sheets
 * -----------------------------------------------------------------------------
 * A small Node twin of the map's terrain compositor (spec §4.2–4.5), so asset
 * authors see transitions, shores and object placement without a
 * browser: dual grid by rank with the shared edge masks, a foam line and a
 * wet rim at the water, row-sorted objects with ramp-shift shadows, thinner
 * and smaller towards a lower neighbour. No relief and no macro variation —
 * those belong to the game's renderer.
 * ========================================================================== */
'use strict';

const C = require('./catalog');
const P = require('./palette');
const { Tex, hash } = require('./kit');
const { maskVariant, TL, TR, BL, BR } = require('./masks');

const RANK = Object.fromEntries(C.MATERIALS.map((m, i) => [m.id, i + 1]));
const LANDSCAPE = Object.fromEntries(C.LANDSCAPES.map((l) => [l.id, l]));
const OBJECT = Object.fromEntries(C.OBJECTS.map((o) => [o.id, o]));

/** Sort key of a cell's ground: water lowest, then material rank, then density. */
function key(cell) {
  return cell.mat === 'water' ? 0 : RANK[cell.mat] * 4 + cell.d + 1;
}

/**
 * Compose W×H tiles. `cellAt(x, y)` → { mat: 'water' | material id, d, depth? }.
 * Returns { tex, water } with water[i] = 1 for water pixels.
 */
function composeGround(art, W, H, cellAt) {
  const out = new Tex(W * 16, H * 16);
  const water = new Uint8Array(out.w * out.h);
  const cell = (x, y) => cellAt(Math.max(0, Math.min(W - 1, x)), Math.max(0, Math.min(H - 1, y)));
  const waterRamp = P.ramp('water');
  const ripple = art.overlays.ripple_coast;

  for (let cy = -1; cy < H; cy++) {
    for (let cx = -1; cx < W; cx++) {
      const corners = [cell(cx, cy), cell(cx + 1, cy), cell(cx, cy + 1), cell(cx + 1, cy + 1)];
      const keys = corners.map(key);
      const layers = [...new Set(keys)].sort((a, b) => a - b);
      const variant = maskVariant(cx, cy, C.MASKS.variants);
      layers.forEach((layer, n) => {
        const bits = (keys[0] >= layer ? TL : 0) | (keys[1] >= layer ? TR : 0) | (keys[2] >= layer ? BL : 0) | (keys[3] >= layer ? BR : 0);
        const mask = n === 0 ? null : art.masks[bits][variant];
        const src = corners[keys.indexOf(layer)];
        const tex = src.mat === 'water' ? null : art.materials[src.mat][src.d];
        for (let ly = 0; ly < 16; ly++) {
          const py = cy * 16 + 8 + ly;
          if (py < 0 || py >= out.h) continue;
          for (let lx = 0; lx < 16; lx++) {
            const px = cx * 16 + 8 + lx;
            if (px < 0 || px >= out.w) continue;
            if (mask && !mask[ly * 16 + lx]) continue;
            const i = py * out.w + px;
            if (tex) {
              out.px[i] = tex.get(px, py);
              water[i] = 0;
            } else {
              const ov = (src.depth ?? 4) <= 2 ? art.overlays.ripple_ocean : ripple;
              const r = ov ? ov.get(px, py) : 0;
              out.px[i] = r || waterRamp[src.depth ?? 4];
              water[i] = 1;
            }
          }
        }
      });
    }
  }

  // Shore: a foam line on the water side, a wet rim on the land side.
  const src = Uint8Array.from(out.px);
  for (let y = 0; y < out.h; y++) {
    for (let x = 0; x < out.w; x++) {
      const i = y * out.w + x;
      let landNear = false;
      let waterNear = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= out.w || ny >= out.h) continue;
        if (water[ny * out.w + nx]) waterNear = true; else landNear = true;
      }
      if (water[i] && landNear) out.px[i] = P.c('water7');
      else if (!water[i] && waterNear) out.px[i] = P.shift(src[i], -1);
    }
  }
  return { tex: out, water };
}

/** Landscapes where flowering plants grow as cacti, and the share of those tiles that shows one (src/constants.ts). */
const CACTUS_LANDSCAPES = ['desert', 'semidesert'];
const CACTUS_SHARE = 0.5;
const CACTUS_IDS = C.OBJECTS.filter((o) => o.kind === 'cactus').map((o) => o.id);
/** Savanna trees (src/savannatrees.ts): a Schirmbaum, about every eighth a baobab. */
const BAOBAB_SHARE = 1 / 8;

/**
 * Pick and place objects for every tile. `tileAt(x, y)` → { landscape, d, groups: Set, sea?, cacti? }.
 * `cacti` false or true: before or after the first cacti (src/cacti.ts).
 * Flowering plants take no slot on desert ground; once cacti exist, some of
 * those tiles carry a cactus. `treeShare`: the chance a savanna tile with
 * flowering plants carries a savanna tree (undefined: none yet).
 * Returns placements { sprite, fx, fy, kind } sorted for drawing.
 */
function placeObjects(art, W, H, tileAt, cellAt) {
  const placed = [];
  // Material rank, water 0: a denser patch of the same ground is not an edge.
  const rankAt = (x, y) => {
    const c = cellAt(Math.max(0, Math.min(W - 1, x)), Math.max(0, Math.min(H - 1, y)));
    return c.mat === 'water' ? 0 : RANK[c.mat];
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let tile = tileAt(x, y);
      if (!tile) continue;
      const desert = tile.cacti !== undefined && CACTUS_LANDSCAPES.includes(tile.landscape) && tile.groups.has('flowering');
      if (desert) tile = { ...tile, groups: new Set([...tile.groups].filter((g) => g !== 'flowering')) };
      // Distance in tiles to a lower-ranked neighbour, up to 2.
      const own = rankAt(x, y);
      let edge = 2;
      for (let r = 1; r <= 2 && edge === 2; r++) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) if (rankAt(x + dx, y + dy) < own) edge = Math.min(edge, r - 1);
        }
      }
      const falloff = [0.35, 0.7, 1][edge];
      const kinds = tile.sea ? { water: [0.6] } : (LANDSCAPE[tile.landscape].objects || {});
      for (const [kind0, counts] of Object.entries(kinds)) {
        const expect = counts[Math.min(tile.d, counts.length - 1)] * falloff;
        const n = Math.floor(expect) + (hash(x, y, 500 + kind0.length) < expect % 1 ? 1 : 0);
        for (let s = 0; s < n; s++) {
          // Forest mantle: at the very edge, trees give way to bushes.
          const kind = kind0 === 'tree' && edge === 0 && hash(x, y, 600 + s) < 0.6 ? 'bush' : kind0;
          const pick = choose(tile, kind, hash(x, y, 700 + s));
          if (pick) placed.push(spot(art, pick, kind, x, y, s, edge));
        }
      }
      if (desert && tile.cacti && hash(x, y, 820) < CACTUS_SHARE) {
        placed.push(spot(art, CACTUS_IDS[Math.floor(hash(x, y, 821) * CACTUS_IDS.length)], 'cactus', x, y, 10, 2));
      }
      if (tile.treeShare !== undefined && tile.landscape === 'savanna' && tile.groups.has('flowering') && hash(x, y, 830) < tile.treeShare) {
        const id = OBJECT.baobab && hash(x, y, 831) < BAOBAB_SHARE ? 'baobab' : 'acacia';
        placed.push(spot(art, id, 'tree', x, y, 11, edge));
      }
      const ab = LANDSCAPE[tile.landscape]?.abiotic ?? 0;
      if (ab > 0 && hash(x, y, 800) < ab) {
        const choices = C.ABIOTIC.filter((a) => a.where.includes(tile.landscape));
        if (choices.length) placed.push(spot(art, choices[Math.floor(hash(x, y, 801) * choices.length)].id, 'rock', x, y, 9, 2));
      }
    }
  }
  placed.sort((a, b) => a.fy - b.fy || a.fx - b.fx);
  return placed;
}

/** Slot weights: the tile's leading group, a group drawn for this landscape, any other. */
const WEIGHT_TOP = 4;
const WEIGHT_SPECIFIC = 2;
const WEIGHT_OTHER = 1;

/**
 * The object a slot of `kind` shows on a tile. The slot goes to one of the
 * groups present that has such an object here — weighted, so the leading
 * group shapes the picture and every other group still shows; only within
 * that group does a landscape-specific entry beat '*' — so a bog shows reed
 * *and* sundew. `tile.top` is the leading group (floraTop), if known.
 */
function choose(tile, kind, roll) {
  const here = tile.sea ? 'sea' : tile.landscape;
  const options = [];
  let total = 0;
  for (const g of tile.groups) {
    const fits = (C.GROUPS[g]?.objects ?? []).filter((o) => OBJECT[o.id].kind === kind);
    const specific = fits.filter((o) => o.where !== '*' && o.where.includes(here));
    const list = specific.length ? specific : fits.filter((o) => o.where === '*' && here !== 'sea');
    if (!list.length) continue;
    const w = g === tile.top ? WEIGHT_TOP : specific.length ? WEIGHT_SPECIFIC : WEIGHT_OTHER;
    options.push([list, w]);
    total += w;
  }
  if (!options.length) return null;
  let r = roll * total;
  for (const [list, w] of options) {
    if (r < w) return list[Math.floor((r / w) * list.length)].id;
    r -= w;
  }
  const last = options[options.length - 1][0];
  return last[last.length - 1].id;
}

function spot(art, id, kind, x, y, s, edge) {
  const vars = art.objects[id];
  let v;
  if (OBJECT[id].kind === 'tree') {
    const size = edge === 0 ? 's' : edge === 1 ? (hash(x, y, 900 + s) < 0.5 ? 's' : 'm') : (hash(x, y, 900 + s) < 0.3 ? 'm' : 'l');
    const form = hash(x, y, 910 + s) < 0.5 ? 0 : 1;
    v = vars.find((q) => q.size === size && q.form === form) || vars[0];
  } else {
    v = vars[Math.floor(hash(x, y, 920 + s) * vars.length)];
  }
  // Slots spread over the tile on a jittered 2×2 pattern, feet in the lower part.
  const slot = (s + Math.floor(hash(x, y, 930) * 4)) % 4;
  const fx = x * 16 + 4 + (slot % 2) * 8 + Math.floor((hash(x, y, 940 + s) - 0.5) * 5);
  const fy = y * 16 + 7 + Math.floor(slot / 2) * 6 + Math.floor((hash(x, y, 950 + s) - 0.5) * 4);
  return { sprite: v.tex, fx, fy, kind };
}

/** Draw placements over the ground: shadow first (ground pixels only), then the sprite. */
function drawObjects(ground, placed) {
  const out = ground.tex;
  const occupied = new Uint8Array(out.w * out.h);
  for (const p of placed) {
    const t = p.sprite;
    const left = p.fx - Math.floor(t.w / 2);
    const top = p.fy - (t.h - 1);
    if (p.kind !== 'water') {
      const rx = Math.max(2, t.w * 0.35);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
          if ((dx / rx) ** 2 + (dy / 1.5) ** 2 > 1) continue;
          const x = p.fx + 1 + dx;
          const y = p.fy + dy;
          const i = out.at(x, y);
          if (i < 0 || occupied[i] || ground.water[i]) continue;
          out.px[i] = P.shift(out.px[i], -2);
          occupied[i] = 2;
        }
      }
    }
    for (let sy = 0; sy < t.h; sy++) {
      for (let sx = 0; sx < t.w; sx++) {
        const v = t.px[sy * t.w + sx];
        if (!v) continue;
        const i = out.at(left + sx, top + sy);
        if (i < 0) continue;
        out.px[i] = v;
        occupied[i] = 1;
      }
    }
  }
}

/* ---------------------------------------------------------------- scenes -- */

/**
 * Bands of landscapes across a strip, with frayed borders, like a slice
 * along a climate gradient. `bands` = [[landscape | 'water', widthInTiles, substrate?]];
 * `cacti` as in placeObjects (undefined: no cactus rule); a band's fourth
 * entry fixes its density. `treeShare(dDesert, dForest)`: the savanna-tree
 * chance by the distance in tiles to the nearest desert and forest band.
 */
function bandScene(art, W, H, bands, groups, seed, cacti, treeShare) {
  const starts = [];
  let acc = 0;
  for (const b of bands) { starts.push(acc); acc += b[1]; }
  const bandAt = (x, y) => {
    let k = 0;
    for (let n = 1; n < bands.length; n++) {
      const wobble = Math.round((hash(n, y >> 1, seed) - 0.5) * 3 + (hash(n, y, seed + 1) - 0.5));
      if (x >= starts[n] + wobble) k = n;
    }
    return k;
  };
  const distToBorder = (x, y) => {
    const k = bandAt(x, y);
    for (let r = 1; r <= 2; r++) {
      if (bandAt(x - r, y) !== k || bandAt(x + r, y) !== k) return r - 1;
    }
    return 2;
  };
  const tileAt = (x, y) => {
    const [ls, , substrate, fixed] = bands[bandAt(x, y)];
    if (ls === 'water') return { sea: true, landscape: 'water', d: 0, groups: new Set(groups) };
    const l = LANDSCAPE[ls];
    const mat = l.materials[substrate || 'soil'];
    const max = C.MATERIALS.find((m) => m.id === mat).densities - 1;
    const d = fixed ?? Math.min(max, distToBorder(x, y));
    const reach = (pred) => {
      for (let r = 0; r <= 6; r++) if (pred(bands[bandAt(x - r, y)][0]) || pred(bands[bandAt(x + r, y)][0])) return r;
      return 7;
    };
    const share = treeShare && ls === 'savanna'
      ? treeShare(reach((l) => l === 'desert' || l === 'semidesert'), reach((l) => l === 'forest' || l === 'rainforest'))
      : undefined;
    return { landscape: ls, mat, d: Math.min(max, d), groups: new Set(groups), cacti, treeShare: share };
  };
  const cellAt = (x, y) => {
    const t = tileAt(x, y);
    if (t.sea) return { mat: 'water', d: 0, depth: Math.max(2, Math.min(6, 6 - (bands[0][1] - 1 - x))) };
    return { mat: t.mat, d: t.d };
  };
  const ground = composeGround(art, W, H, cellAt);
  drawObjects(ground, placeObjects(art, W, H, tileAt, cellAt));
  return ground.tex;
}

/** A blob of `a` (material id, density) inside `b` — every mask case appears along its rim. */
function pairPatch(art, a, b, W = 5, H = 4) {
  const cellAt = (x, y) => {
    const inside = ((x - (W - 1) / 2) / (W / 2.6)) ** 2 + ((y - (H - 1) / 2) / (H / 2.6)) ** 2 <= 1 || (x === 1 && y === 0);
    return inside ? a : b;
  };
  return composeGround(art, W, H, cellAt).tex;
}

module.exports = { composeGround, placeObjects, drawObjects, bandScene, pairPatch, key, RANK };
