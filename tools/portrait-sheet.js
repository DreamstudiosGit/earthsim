/* =============================================================================
 * SimEarth 2.0 — species portrait contact sheet
 * -----------------------------------------------------------------------------
 * Renders the portraits of one or more animal classes the way the lexicon
 * shows them — large in the info box, as a thumbnail, as the silhouette of an
 * undiscovered entry — next to the class's map icon, and saves a PNG through
 * headless Chrome.
 *
 * Like species-sheet.js it compiles only the registries, the renderers and
 * the requested files into a temp bundle (never touching simulation.js), and
 * shares its lock so only one Chrome runs at a time. Before the picture it
 * prints a PROBLEM line for every break of the format tests/portraits.test.js
 * would report.
 *
 *   node tools/portrait-sheet.js <id> [<id> ...] [--file <draft.ts>] [--out <png>]
 *
 *     <id>     an animal class id (mammals, fish, …); "animals" for all
 *     --file   compile this draft instead of src/species/portraits/<id>.ts
 *              (exactly one <id> must be given)
 *     --out    where to write the PNG (default: OS temp folder)
 * ========================================================================== */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const { portraitProblems } = require('./portraitcheck');

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
  console.error(`portrait-sheet: ${msg}`);
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
  if (ids.length === 0) fail('name at least one class id');
  if (file && ids.length !== 1) fail('--file needs exactly one id');
  return { ids, file, out };
}

function expand(ids) {
  const dir = path.join(ROOT, 'src', 'species', 'portraits');
  const list = [];
  for (const id of ids) {
    if (id === 'animals') {
      for (const f of fs.readdirSync(dir)) if (f.endsWith('.ts') && f !== 'types.ts') list.push(f.slice(0, -3));
    } else list.push(id);
  }
  return list;
}

function compile(ids, files, outFile) {
  const src = (f) => path.join(ROOT, 'src', f);
  const icons = ids.map((id) => src(`species/${id}.ts`)).filter((f) => fs.existsSync(f));
  const list = [
    src('constants.ts'), src('util.ts'), src('species/types.ts'), ...icons,
    src('species/portraits/types.ts'), ...files, src('artdraw.ts'), src('portraitdraw.ts'),
  ];
  try {
    execFileSync(process.execPath, [
      TSC, '--outFile', outFile, '--module', 'none', '--target', 'ES2020',
      '--lib', 'ES2020,DOM,DOM.Iterable', '--strict', '--skipLibCheck', '--removeComments',
      ...list,
    ], { cwd: ROOT, stdio: 'pipe' });
  } catch (e) {
    fail(`TypeScript errors:\n${(e.stdout || '').toString()}${(e.stderr || '').toString()}`);
  }
}

function survey(bundle, ids) {
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(bundle, 'utf8'), ctx);
  const SE = ctx.SE;
  let rows = 0;
  const problems = [];
  for (const id of ids) {
    const c = Object.keys(SE.LIFE).find((k) => SE.LIFE[k].id === id);
    if (c === undefined) fail(`no animal class "${id}"`);
    const list = SE.SPECIES_PORTRAITS[c];
    if (!list) fail(`no portraits registered for "${id}"`);
    const stages = SE.SPECIES[c] ? SE.SPECIES[c].stages : [];
    if (list.length !== SE.SUBSPECIES_PER_CLASS) problems.push(`${id}: ${list.length} portraits, need ${SE.SUBSPECIES_PER_CLASS}`);
    list.forEach((p, s) => {
      if (stages[s] && p.name !== stages[s].name) problems.push(`${id}[${s}]: name "${p.name}", icon says "${stages[s].name}"`);
      problems.push(...portraitProblems(SE, p, `${id}[${s}] ${p.name}`));
    });
    rows += Math.ceil(list.length / 2);
  }
  return { rows, problems };
}

const PAGE = String.raw`<!doctype html>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 12px; background: #0b1d1a; color: #dfe9e3; font: 12px/1.3 system-ui, sans-serif; }
  h2 { margin: 10px 0 6px; font-size: 15px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .cell { display: flex; align-items: center; gap: 10px; height: 268px; padding: 6px; border-top: 1px solid #1d3a32; }
  .label { width: 96px; flex: 0 0 auto; }
  .label b { display: block; font-size: 13px; margin-bottom: 4px; }
  .stack { display: flex; flex-direction: column; gap: 8px; align-items: center; }
  .big { width: 256px; height: 256px; border-radius: 12px; background: radial-gradient(circle at 50% 38%, #24453c, #0a1412 75%); }
  .light { width: 120px; height: 120px; border-radius: 10px; background: #efe8d6; }
  .thumb { width: 72px; height: 72px; border-radius: 8px; background: #16302a; }
  .sil { width: 72px; height: 72px; border-radius: 8px; background: #16302a; color: #335a50; }
  .icon { width: 48px; height: 48px; }
  svg { display: block; width: 100%; height: 100%; }
</style>
<body>
<script src="sheet.js"></script>
<script>
  const ids = __IDS__;
  function box(cls, html) {
    const d = document.createElement('div');
    d.className = cls;
    d.innerHTML = html;
    return d;
  }
  for (const id of ids) {
    const c = Object.keys(SE.LIFE).find((k) => SE.LIFE[k].id === id);
    const h = document.createElement('h2');
    h.textContent = SE.LIFE[c].name + ' (' + id + ')';
    document.body.appendChild(h);
    const grid = document.createElement('div');
    grid.className = 'grid';
    SE.SPECIES_PORTRAITS[c].forEach((p, s) => {
      const st = SE.SPECIES[c] && SE.SPECIES[c].stages[s];
      const cell = document.createElement('div');
      cell.className = 'cell';
      const label = document.createElement('div');
      label.className = 'label';
      label.innerHTML = '<b>' + (s + 1) + ' · ' + p.name + '</b>' + (st ? 'vor ' + st.ma + ' Mio. J.<br>' : '') + p.art.length + ' Formen';
      if (st) label.appendChild(box('icon', SE.artSvg(st.art, SE.CREATURE_LOOK)));
      cell.appendChild(label);
      cell.appendChild(box('big', SE.portraitSvg(p.art, 'full')));
      const stack = document.createElement('div');
      stack.className = 'stack';
      stack.appendChild(box('light', SE.portraitSvg(p.art, 'full')));
      stack.appendChild(box('thumb', SE.portraitSvg(p.art, 'full')));
      stack.appendChild(box('sil', SE.portraitSvg(p.art, 'silhouette')));
      cell.appendChild(stack);
      grid.appendChild(cell);
    });
    document.body.appendChild(grid);
  }
  document.title = 'ready';
</script>
`;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** The same lock as species-sheet.js: one headless Chrome at a time. */
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
    const f = path.join(ROOT, 'src', 'species', 'portraits', `${id}.ts`);
    if (!fs.existsSync(f)) fail(`no file src/species/portraits/${id}.ts`);
    return f;
  });
  const chrome = CHROMES.find((c) => fs.existsSync(c));
  if (!chrome) fail('no Chrome or Edge found; set CHROME to its path');

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'simearth-portraits-'));
  const bundle = path.join(work, 'sheet.js');
  compile(ids, files, bundle);
  const { rows, problems } = survey(bundle, ids);
  for (const p of problems) console.log(`PROBLEM ${p}`);
  const html = path.join(work, 'sheet.html');
  fs.writeFileSync(html, PAGE.replace('__IDS__', JSON.stringify(ids)));
  const out = path.resolve(args.out || path.join(os.tmpdir(), `simearth-portraits-${ids.join('-').slice(0, 60)}.png`));
  const height = 40 + rows * 284 + ids.length * 40;

  withLock(() => {
    execFileSync(chrome, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
      '--force-device-scale-factor=1', `--window-size=1100,${height}`, `--user-data-dir=${path.join(work, 'profile')}`,
      '--virtual-time-budget=4000', `--screenshot=${out}`, `file:///${html.replace(/\\/g, '/')}`,
    ], { stdio: 'pipe', timeout: 60000 });
  });
  try { fs.rmSync(work, { recursive: true, force: true }); } catch { /* Chrome may still hold the profile */ }
  if (!fs.existsSync(out)) fail('Chrome wrote no screenshot');
  console.log(out);
}

main();
