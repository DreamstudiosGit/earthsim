/* =============================================================================
 * SimEarth 2.0 — species contact sheet
 * -----------------------------------------------------------------------------
 * Renders the icons of one or more animal classes or plant groups the way the
 * map draws them — at 16 and 24 px on the real ground colours, as a patch of
 * tiles, large, and mirrored — and saves a PNG through headless Chrome.
 *
 * It compiles only the art registry, the renderer and the requested art files
 * into a temp bundle, so a half-finished file elsewhere in src/ cannot break
 * it and it never touches simulation.js. Chrome runs one sheet at a time
 * (a lock directory in the OS temp folder), so many callers can share it.
 * Before the picture it prints a PROBLEM line for every break of the art
 * format that tests/species.test.js would report.
 *
 *   node tools/species-sheet.js <id> [<id> ...] [--file <draft.ts>] [--out <png>]
 *
 *     <id>     an animal node id (mammals, fish, …) or a plant group id
 *              (conifers, flowering, …); "animals" or "plants" for all
 *     --file   compile this draft instead of src/species|floraart/<id>.ts
 *              (exactly one <id> must be given)
 *     --out    where to write the PNG (default: OS temp folder)
 * ========================================================================== */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const { artProblems } = require('./artcheck');

const ROOT = path.join(__dirname, '..');
const TSC = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
const CHROMES = [
  process.env.CHROME,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

function fail(msg) {
  console.error(`species-sheet: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const ids = [];
  let file = null;
  let out = null;
  for (let k = 0; k < argv.length; k++) {
    if (argv[k] === '--file') file = argv[++k];
    else if (argv[k] === '--out') out = argv[++k];
    else ids.push(argv[k]);
  }
  if (ids.length === 0) fail('name at least one class or plant group id');
  if (file && ids.length !== 1) fail('--file needs exactly one id');
  return { ids, file, out };
}

function sourceOf(id) {
  for (const dir of ['species', 'floraart']) {
    const f = path.join(ROOT, 'src', dir, `${id}.ts`);
    if (fs.existsSync(f)) return f;
  }
  return null;
}

function expand(ids) {
  const list = [];
  for (const id of ids) {
    if (id === 'animals' || id === 'plants') {
      const dir = path.join(ROOT, 'src', id === 'animals' ? 'species' : 'floraart');
      for (const f of fs.readdirSync(dir)) if (f.endsWith('.ts') && f !== 'types.ts') list.push(f.slice(0, -3));
    } else list.push(id);
  }
  return list;
}

function compile(files, outFile) {
  const base = ['constants.ts', 'util.ts', 'species/types.ts', 'artdraw.ts'].map((f) => path.join(ROOT, 'src', f));
  try {
    execFileSync(process.execPath, [
      TSC, '--outFile', outFile, '--module', 'none', '--target', 'ES2020',
      '--lib', 'ES2020,DOM,DOM.Iterable', '--strict', '--skipLibCheck', '--removeComments',
      ...base, ...files,
    ], { cwd: ROOT, stdio: 'pipe' });
  } catch (e) {
    fail(`TypeScript errors:\n${(e.stdout || '').toString()}${(e.stderr || '').toString()}`);
  }
}

/**
 * Count the rows the page will draw, to size the window, and list every
 * break of the art format the test would report.
 */
function survey(bundle, ids) {
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(bundle, 'utf8'), ctx);
  const SE = ctx.SE;
  let rows = 0;
  const problems = [];
  for (const id of ids) {
    rows += 1;
    const c = Object.keys(SE.LIFE).find((k) => SE.LIFE[k].id === id);
    const sp = c !== undefined ? SE.SPECIES[c] : undefined;
    if (sp) {
      rows += sp.stages.length + sp.specialists.length;
      if (sp.stages.length !== SE.SUBSPECIES_PER_CLASS) problems.push(`${id}: ${sp.stages.length} stages, need ${SE.SUBSPECIES_PER_CLASS}`);
      sp.stages.forEach((st, s) => {
        if (s > 0 && !(st.ma < sp.stages[s - 1].ma)) problems.push(`${id}[${s}]: must be younger than the stage before`);
        problems.push(...artProblems(SE, st.art, `${id}[${s}] ${st.name}`));
      });
      for (const sx of sp.specialists) problems.push(...artProblems(SE, sx.art, `${id} specialist ${sx.name}`));
      continue;
    }
    const g = Object.keys(SE.FLORA).find((k) => SE.FLORA[k].id === id);
    const fa = g !== undefined ? SE.FLORA_ART[g] : undefined;
    if (!fa) fail(`no art registered for "${id}"`);
    rows += 2 + fa.specialists.length;
    problems.push(...artProblems(SE, fa.sparse, `${id} sparse`), ...artProblems(SE, fa.dense, `${id} dense`));
    for (const sx of fa.specialists) problems.push(...artProblems(SE, sx.art, `${id} specialist ${sx.name}`));
  }
  return { rows, problems };
}

const PAGE = String.raw`<!doctype html>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 12px; background: #0b1d1a; color: #dfe9e3; font: 12px/1.3 system-ui, sans-serif; }
  h2 { margin: 10px 0 6px; font-size: 15px; }
  .row { display: flex; align-items: center; gap: 10px; height: 104px; border-top: 1px solid #1d3a32; }
  .label { width: 190px; flex: 0 0 auto; }
  .label b { display: block; font-size: 13px; }
  .sw { width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; gap: 4px; border-radius: 4px; }
  canvas { display: block; }
  .big { border-radius: 10px; background: radial-gradient(circle at 50% 38%, #24453c, #0a1412 75%); }
</style>
<body>
<script src="sheet.js"></script>
<script>
  const ids = __IDS__;
  const GROUNDS = { 'Hochsee': '#1f5a86', 'Küstenmeer': '#3a8bb2', 'Wüste': '#e0c68e', 'Offenland': '#7ca854',
    'Wald': '#2a6436', 'Tundra': '#7e866a', 'Eis': '#dfeef0', 'Fels': '#8a857a' };
  function put(parent, canvas, cssPx) {
    canvas.style.width = cssPx + 'px';
    canvas.style.height = cssPx + 'px';
    parent.appendChild(canvas);
  }
  function row(label, art, look, patch) {
    const r = document.createElement('div');
    r.className = 'row';
    const l = document.createElement('div');
    l.className = 'label';
    l.innerHTML = label;
    r.appendChild(l);
    const span = look.shadow > 0 ? SE.SHADOW_SPAN : 1;
    for (const [name, color] of Object.entries(GROUNDS)) {
      const sw = document.createElement('div');
      sw.className = 'sw';
      sw.style.background = color;
      sw.title = name;
      put(sw, SE.rasterArt(art, 16, look), 16 * span);
      put(sw, SE.rasterArt(art, 24, look), 24 * span);
      r.appendChild(sw);
    }
    if (patch) {
      const c = document.createElement('canvas');
      c.width = 6 * 16; c.height = 4 * 16;
      const ctx = c.getContext('2d');
      ctx.fillStyle = patch; ctx.fillRect(0, 0, c.width, c.height);
      const tile = SE.rasterArt(art, 16, look);
      for (let y = 0; y < 4; y++) for (let x = 0; x < 6; x++) ctx.drawImage(tile, x * 16, y * 16);
      r.appendChild(c);
    }
    const big = SE.rasterArt(art, 88, look);
    big.className = 'big';
    put(r, big, 88);
    put(r, SE.rasterArt(art, 48, look, true), 48 * span);
    return r;
  }
  for (const id of ids) {
    const h = document.createElement('h2');
    document.body.appendChild(h);
    const c = Object.keys(SE.LIFE).find((k) => SE.LIFE[k].id === id);
    if (c !== undefined && SE.SPECIES[c]) {
      h.textContent = SE.LIFE[c].name + ' (' + id + ')';
      const sp = SE.SPECIES[c];
      sp.stages.forEach((st, s) => document.body.appendChild(row('<b>' + (s + 1) + ' · ' + st.name + '</b>vor ' + st.ma + ' Mio. J.', st.art, SE.CREATURE_LOOK, null)));
      sp.specialists.forEach((st) => document.body.appendChild(row('<b>Spezialist · ' + st.name + '</b>' + SE.BIOME_NAMES[st.biome] + ', ab Stufe ' + (st.minStage + 1), st.art, SE.CREATURE_LOOK, null)));
      continue;
    }
    const g = Object.keys(SE.FLORA).find((k) => SE.FLORA[k].id === id);
    const def = SE.FLORA[g];
    const fa = SE.FLORA_ART[g];
    const look = def.woody ? SE.TREE_LOOK : def.realm === 'sea' ? SE.KELP_LOOK : SE.PLANT_LOOK;
    const ground = def.realm === 'sea' ? '#3a8bb2' : '#7ca854';
    h.textContent = def.name + ' (' + id + ')';
    document.body.appendChild(row('<b>spärlich</b>', fa.sparse, look, ground));
    document.body.appendChild(row('<b>dicht</b>', fa.dense, look, ground));
    fa.specialists.forEach((st) => document.body.appendChild(row('<b>Spezialist · ' + st.name + '</b>' + SE.BIOME_NAMES[st.biome], st.art, look, '#e0c68e')));
  }
  document.title = 'ready';
</script>
`;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function withLock(fn) {
  const lock = path.join(os.tmpdir(), 'simearth-sheet.lock');
  const deadline = Date.now() + 900000;
  for (;;) {
    try {
      fs.mkdirSync(lock);
      break;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      try {
        if (Date.now() - fs.statSync(lock).mtimeMs > 120000) fs.rmSync(lock, { recursive: true, force: true });
      } catch { /* taken over by someone else */ }
      if (Date.now() > deadline) fail('waited fifteen minutes for other sheets to finish');
      sleep(250 + Math.random() * 250);
    }
  }
  try {
    return fn();
  } finally {
    fs.rmSync(lock, { recursive: true, force: true });
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const ids = expand(args.ids);
  const files = ids.map((id) => {
    if (args.file) return path.resolve(args.file);
    const f = sourceOf(id);
    if (!f) fail(`no file src/species/${id}.ts or src/floraart/${id}.ts`);
    return f;
  });
  const chrome = CHROMES.find((c) => fs.existsSync(c));
  if (!chrome) fail('no Chrome or Edge found; set CHROME to its path');

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'simearth-sheet-'));
  const bundle = path.join(work, 'sheet.js');
  compile(files, bundle);
  const { rows, problems } = survey(bundle, ids);
  for (const p of problems) console.log(`PROBLEM ${p}`);
  const html = path.join(work, 'sheet.html');
  fs.writeFileSync(html, PAGE.replace('__IDS__', JSON.stringify(ids)));
  const out = path.resolve(args.out || path.join(os.tmpdir(), `simearth-sheet-${ids.join('-').slice(0, 60)}.png`));
  const height = 40 + rows * 105 + ids.length * 36;

  withLock(() => {
    execFileSync(chrome, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
      '--force-device-scale-factor=1', `--window-size=1240,${height}`, `--user-data-dir=${path.join(work, 'profile')}`,
      '--virtual-time-budget=4000', `--screenshot=${out}`, `file:///${html.replace(/\\/g, '/')}`,
    ], { stdio: 'pipe', timeout: 60000 });
  });
  try { fs.rmSync(work, { recursive: true, force: true }); } catch { /* Chrome may still hold the profile */ }
  if (!fs.existsSync(out)) fail('Chrome wrote no screenshot');
  console.log(out);
}

main();
