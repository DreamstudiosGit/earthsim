/* =============================================================================
 * SimEarth 2.0 — today's Earth on the map grid
 * -----------------------------------------------------------------------------
 * Averages NOAA's ETOPO1 relief model (Ice Surface, public domain) onto the
 * 256 × 128 tile grid and writes src/earthmap.ts, the data behind the epoch
 * "Heute". Each tile stores its mean height (land) or depth (sea) and the
 * spread of the heights inside it, the relief the uplift belts are read from.
 *
 *   node tools/earth-map.js [etopo.asc] [--fetch] [--png file] [--write]
 *
 *     etopo.asc  ETOPO1 in ESRI ASCII, every 10 arc-minutes (12 MB), as served by
 *                ERDDAP_URL below; default: <OS temp>/simearth-etopo10.asc
 *     --fetch    download it first
 *     --png      write a preview of the result (one pixel per tile)
 *     --write    write src/earthmap.ts
 *
 * Rules, all per tile (≈ 156 km at the equator):
 *   - land where at least half of the samples are above sea level, and also
 *     where an isolated island holds a fifth, so archipelagos do not vanish;
 *   - lakes and inland water smaller than MIN_SEA_TILES become land (ETOPO
 *     carries lake-bed bathymetry: the Great Lakes would turn into sea);
 *   - height = mean of the land samples, depth = mean of the sea samples, so a
 *     coastal tile is neither dragged under water nor lifted out of it.
 * ========================================================================== */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { encodeRGBA } = require('./terrain/png');

const ERDDAP_URL = 'https://coastwatch.pfeg.noaa.gov/erddap/griddap/etopo180.esriAscii?altitude%5B(-90.0):10:(90.0)%5D%5B(-180.0):10:(180.0)%5D';
const W = 256;
const H = 128;
const MIN_SEA_TILES = 6;
const ISLAND_SHARE = 0.2;
/** Heights and depths the byte encoding spans, in metres. */
const MAX_HEIGHT = 6000;
const MAX_DEPTH = 11000;
const RELIEF_STEP = 10;
const PREVIEW_SCALE = 4;
const OUT_TS = path.join(__dirname, '..', 'src', 'earthmap.ts');

function parseArgs(argv) {
  const a = { file: path.join(os.tmpdir(), 'simearth-etopo10.asc'), fetch: false, png: null, write: false };
  for (let k = 0; k < argv.length; k++) {
    const v = argv[k];
    if (v === '--fetch') a.fetch = true;
    else if (v === '--write') a.write = true;
    else if (v === '--png') a.png = argv[++k];
    else if (!v.startsWith('--')) a.file = v;
    else throw new Error(`unknown option ${v}`);
  }
  return a;
}

async function fetchEtopo(file) {
  const res = await fetch(ERDDAP_URL);
  if (!res.ok) throw new Error(`ERDDAP answered ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

/** ESRI ASCII grid: a header, then rows from the north. */
function readGrid(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');
  const head = {};
  let k = 0;
  for (; k < lines.length; k++) {
    const m = /^([a-z_]+)\s+(\S+)/i.exec(lines[k]);
    if (!m || !/^(ncols|nrows|xllcenter|yllcenter|cellsize|nodata_value)$/i.test(m[1])) break;
    head[m[1].toLowerCase()] = Number(m[2]);
  }
  const cols = head.ncols;
  const rows = head.nrows;
  if (!(cols > 0 && rows > 0 && head.cellsize > 0)) throw new Error(`${file}: not an ESRI ASCII grid`);
  const data = new Int16Array(cols * rows);
  let n = 0;
  for (; k < lines.length && n < data.length; k++) {
    for (const t of lines[k].trim().split(/\s+/)) if (t) data[n++] = Number(t);
  }
  if (n !== data.length) throw new Error(`${file}: ${n} values, expected ${data.length}`);
  return { cols, rows, x0: head.xllcenter, y0: head.yllcenter, step: head.cellsize, data };
}

/** Per-tile sums over every sample whose centre falls inside the tile. */
function bin(grid) {
  const t = {
    n: new Uint32Array(W * H), land: new Uint32Array(W * H),
    landSum: new Float64Array(W * H), landSq: new Float64Array(W * H), seaSum: new Float64Array(W * H),
  };
  const tile = 360 / W;
  for (let r = 0; r < grid.rows; r++) {
    const lat = grid.y0 + (grid.rows - 1 - r) * grid.step;
    const y = Math.min(H - 1, Math.max(0, Math.floor((90 - lat) / tile)));
    for (let c = 0; c < grid.cols; c++) {
      const lon = grid.x0 + c * grid.step;
      if (lon >= 180) continue; // the -180° column again
      const x = Math.min(W - 1, Math.floor((lon + 180) / tile));
      const i = y * W + x;
      const h = grid.data[r * grid.cols + c];
      t.n[i]++;
      if (h > 0) { t.land[i]++; t.landSum[i] += h; t.landSq[i] += h * h; } else t.seaSum[i] += h;
    }
  }
  return t;
}

function neighbours(i, diagonal) {
  const x = i % W;
  const y = (i - x) / W;
  const out = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if ((dx === 0 && dy === 0) || (!diagonal && dx !== 0 && dy !== 0)) continue;
      const yy = y + dy;
      if (yy < 0 || yy >= H) continue;
      out.push(yy * W + ((x + dx + W) % W));
    }
  }
  return out;
}

function landMask(t) {
  const share = (i) => t.land[i] / Math.max(1, t.n[i]);
  const land = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) land[i] = share(i) >= 0.5 ? 1 : 0;
  // Islands below half a tile: kept where nothing else nearby is land.
  for (let i = 0; i < W * H; i++) {
    if (land[i] || share(i) < ISLAND_SHARE) continue;
    if (neighbours(i, true).every((j) => share(j) < 0.5)) land[i] = 2;
  }
  // Small water bodies (lake beds, fragments) become land.
  const seen = new Uint8Array(W * H);
  let filled = 0;
  for (let s = 0; s < W * H; s++) {
    if (land[s] || seen[s]) continue;
    const comp = [s];
    seen[s] = 1;
    for (let k = 0; k < comp.length; k++) {
      for (const j of neighbours(comp[k], false)) if (!land[j] && !seen[j]) { seen[j] = 1; comp.push(j); }
    }
    if (comp.length < MIN_SEA_TILES) { for (const i of comp) land[i] = 3; filled += comp.length; }
  }
  return { land, filled };
}

/** Heights and relief in metres; land tiles > 0, sea tiles < 0. */
function heights(t, land) {
  const h = new Float32Array(W * H);
  const relief = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    if (land[i]) {
      if (t.land[i] > 0) {
        const mean = t.landSum[i] / t.land[i];
        h[i] = Math.max(1, mean);
        relief[i] = Math.sqrt(Math.max(0, t.landSq[i] / t.land[i] - mean * mean));
      } else h[i] = -1; // a filled lake without dry samples: set from its shores below
    } else {
      const sea = t.n[i] - t.land[i];
      h[i] = Math.min(-1, sea > 0 ? t.seaSum[i] / sea : -1);
    }
  }
  for (let i = 0; i < W * H; i++) {
    if (!land[i] || h[i] > 0) continue;
    const shore = neighbours(i, true).filter((j) => land[j] && h[j] > 0);
    h[i] = shore.length ? shore.reduce((s, j) => s + h[j], 0) / shore.length : 1;
  }
  return { h, relief };
}

/** One byte per tile: square-root steps, fine near sea level where coasts and lowlands are decided. */
function encodeHeight(m) {
  if (m > 0) return Math.max(1, Math.min(127, Math.round(127 * Math.sqrt(Math.min(m, MAX_HEIGHT) / MAX_HEIGHT))));
  return (256 - Math.max(1, Math.min(128, Math.round(128 * Math.sqrt(Math.min(-m, MAX_DEPTH) / MAX_DEPTH))))) & 0xff;
}

function decodeHeight(b) {
  return b < 128 ? MAX_HEIGHT * (b / 127) ** 2 : -MAX_DEPTH * ((256 - b) / 128) ** 2;
}

function renderTs(heightBytes, reliefBytes, stats) {
  const b64 = (bytes) => Buffer.from(bytes).toString('base64');
  return `/* =============================================================================
 * SimEarth 2.0 — today's Earth (GENERATED by tools/earth-map.js, do not edit)
 * -----------------------------------------------------------------------------
 * NOAA ETOPO1 Ice Surface (public domain), sampled every 10 arc-minutes and
 * averaged per tile. Row 0 is the northernmost, column 0 starts at 180° W.
 * ${stats}
 * ========================================================================== */

namespace SE {
  export const EARTH_MAP = {
    width: ${W},
    height: ${H},
    /** Metres a height byte spans: land 1..127 = ${MAX_HEIGHT}·(b/127)², sea 128..255 = −${MAX_DEPTH}·((256−b)/128)². */
    maxHeight: ${MAX_HEIGHT},
    maxDepth: ${MAX_DEPTH},
    /** Metres of relief (spread of the heights inside a land tile) per step. */
    reliefStep: ${RELIEF_STEP},
    heights: '${b64(heightBytes)}',
    relief: '${b64(reliefBytes)}',
  };
}
`;
}

/** Hypsometric colours, PREVIEW_SCALE pixels per tile. */
function preview(file, h) {
  const s = PREVIEW_SCALE;
  const rgba = new Uint8Array(W * H * s * s * 4);
  for (let i = 0; i < W * H; i++) {
    const m = h[i];
    let c;
    if (m < 0) { const d = Math.min(1, -m / 6000); c = [20 + 40 * (1 - d), 60 + 80 * (1 - d), 120 + 100 * (1 - d)]; }
    else if (m < 500) c = [70 + m / 10, 140, 70];
    else if (m < 2000) c = [150, 130 - (m - 500) / 30, 80];
    else { const g = Math.min(255, 150 + (m - 2000) / 20); c = [g, g, g]; }
    const x = i % W;
    const y = (i - x) / W;
    for (let dy = 0; dy < s; dy++) {
      for (let dx = 0; dx < s; dx++) rgba.set([c[0] | 0, c[1] | 0, c[2] | 0, 255], (((y * s + dy) * W * s) + x * s + dx) * 4);
    }
  }
  fs.writeFileSync(file, encodeRGBA(W * s, H * s, rgba));
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  if (a.fetch) await fetchEtopo(a.file);
  if (!fs.existsSync(a.file)) throw new Error(`${a.file} missing: run with --fetch (downloads ${ERDDAP_URL})`);

  const t = bin(readGrid(a.file));
  const { land, filled } = landMask(t);
  const { h, relief } = heights(t, land);

  const heightBytes = new Uint8Array(W * H);
  const reliefBytes = new Uint8Array(W * H);
  let landTiles = 0;
  let islands = 0;
  for (let i = 0; i < W * H; i++) {
    heightBytes[i] = encodeHeight(h[i]);
    reliefBytes[i] = Math.min(255, Math.round(relief[i] / RELIEF_STEP));
    if (land[i]) landTiles++;
    if (land[i] === 2) islands++;
    // The encoding must never flip a tile between land and sea.
    if ((decodeHeight(heightBytes[i]) > 0) !== (land[i] > 0)) throw new Error(`tile ${i}: height ${h[i]} changed sides`);
  }
  const stats = `${landTiles} land tiles (${(landTiles / (W * H) * 100).toFixed(1)} % of the grid), ${islands} kept as islands, ${filled} lake tiles filled.`;
  console.log(stats);

  if (a.png) preview(a.png, h);
  if (a.write) {
    fs.writeFileSync(OUT_TS, renderTs(heightBytes, reliefBytes, stats));
    console.log(`wrote ${path.relative(process.cwd(), OUT_TS)}`);
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
