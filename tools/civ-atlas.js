/* =============================================================================
 * SimEarth 2.0 — city atlas generator
 * -----------------------------------------------------------------------------
 * Builds every city building block and tribe pennant from the recipes in
 * tools/civ/, in the terrain palette (tools/terrain/palette.js, read only),
 * packs them into one indexed PNG and writes the manifest the map reads.
 * Deterministic: the same recipes give the same bytes. The landscape atlas
 * is never touched. Spec: docs/zivilisation-spec.md §3.
 *
 *   node tools/civ-atlas.js [--check] [--sheet [dir]] [--part a,b] [--era id] [--write]
 *
 *     (none)    build in memory and list problems
 *     --check   also verify determinism; exit 1 on any problem
 *     --sheet   write contact sheets to dir (default: <OS temp>/simearth-civ);
 *               parts: blocks, cities (cities needs a current bundle:
 *               SE_BUNDLE or simulation.js)
 *     --era     build and show only one era (stone, bronze, …); the pennants
 *               are always built
 *     --write   write assets/civ/atlas.png and src/civatlas.ts
 * ========================================================================== */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const C = require('./civ/catalog');
const P = require('./terrain/palette');
const { build } = require('./civ/build');
const { assemble, writeOutputs } = require('./civ/atlas');
const { encodeIndexed, encodeRGBA } = require('./terrain/png');
const { PARTS } = require('./civ/sheet');

function parseArgs(argv) {
  const a = { check: false, sheet: null, parts: null, era: null, write: false };
  for (let k = 0; k < argv.length; k++) {
    const v = argv[k];
    if (v === '--check') a.check = true;
    else if (v === '--write') a.write = true;
    else if (v === '--sheet') a.sheet = argv[k + 1] && !argv[k + 1].startsWith('--') ? argv[++k] : path.join(os.tmpdir(), 'simearth-civ');
    else if (v === '--part') a.parts = argv[++k].split(',');
    else if (v === '--era') a.era = argv[++k];
    else throw new Error(`unknown argument ${v}`);
  }
  if (a.era && !C.ERAS.includes(a.era)) throw new Error(`--era must be one of ${C.ERAS.join(', ')}`);
  if (a.era && a.write) throw new Error('--write needs every era');
  return a;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const art = build(args.era);
  const problems = [...art.problems];
  const out = assemble(art);
  if (args.check) {
    const again = assemble(build(args.era));
    const a = encodeIndexed(out.size.w, out.size.h, out.px, P.PALETTE);
    const b = encodeIndexed(again.size.w, again.size.h, again.px, P.PALETTE);
    if (!a.equals(b)) problems.push('determinism: two builds differ — a recipe uses Math.random, Date or shared state');
  }
  for (const p of problems) console.log(`PROBLEM ${p}`);
  console.log(`${problems.length} problem(s); ${Object.keys(art.blocks).length} blocks`);

  if (args.sheet) {
    fs.mkdirSync(args.sheet, { recursive: true });
    for (const name of args.parts || Object.keys(PARTS)) {
      if (!PARTS[name]) throw new Error(`unknown part ${name}`);
      const s = PARTS[name](art);
      const file = path.join(args.sheet, `${name}.png`);
      fs.writeFileSync(file, encodeRGBA(s.w, s.h, s.data));
      console.log(`sheet ${file} (${s.w}×${s.h})`);
    }
  }
  if (args.write) {
    if (problems.length) { console.error('not writing: fix the problems first'); process.exit(1); }
    writeOutputs(encodeIndexed(out.size.w, out.size.h, out.px, P.PALETTE), out.manifest);
  }
  if (args.check && problems.length) process.exit(1);
}

main();
