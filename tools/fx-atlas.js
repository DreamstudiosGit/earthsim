/* =============================================================================
 * SimEarth 2.0 — effect atlas generator
 * -----------------------------------------------------------------------------
 * Builds every disaster effect (sprites and animated ground textures) from
 * the recipes in tools/fx/, in the terrain palette (tools/terrain/palette.js,
 * read only), packs them into one indexed PNG and writes the manifest the
 * map reads. Deterministic: the same recipes give the same bytes.
 * Spec: docs/ereignisse-spec.md §2.4 · style: docs/ereignisse-2026-10/stil.md.
 *
 *   node tools/fx-atlas.js [--check] [--sheet [file]] [--family a,b] [--write | --out dir]
 *
 *     (none)    build in memory and list problems
 *     --check   also verify determinism; exit 1 on any problem
 *     --sheet   write a contact sheet PNG (default: <OS temp>/simearth-fx.png)
 *     --family  build only these families (others count as not drawn yet)
 *     --write   write assets/fx/atlas.png and src/fxatlas.ts (the lead only)
 *     --out     write atlas.png and fxatlas.ts into dir instead, for an
 *               agent's own bundle (tools/fx-bundle.js)
 * ========================================================================== */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const P = require('./terrain/palette');
const { build } = require('./fx/build');
const { assemble, writeOutputs } = require('./fx/atlas');
const { sheet } = require('./fx/sheet');
const { encodeIndexed, encodeRGBA } = require('./terrain/png');

function parseArgs(argv) {
  const a = { check: false, sheet: null, write: false, families: null, out: null };
  for (let k = 0; k < argv.length; k++) {
    const v = argv[k];
    if (v === '--check') a.check = true;
    else if (v === '--write') a.write = true;
    else if (v === '--family') a.families = argv[++k].split(',');
    else if (v === '--out') a.out = argv[++k];
    else if (v === '--sheet') a.sheet = argv[k + 1] && !argv[k + 1].startsWith('--') ? argv[++k] : path.join(os.tmpdir(), 'simearth-fx.png');
    else throw new Error(`unknown argument ${v}`);
  }
  return a;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const art = build(args.families);
  const problems = [...art.problems];
  const out = assemble(art);
  const png = encodeIndexed(out.size.w, out.size.h, out.px, P.PALETTE);
  if (args.check) {
    const again = assemble(build(args.families));
    if (!png.equals(encodeIndexed(again.size.w, again.size.h, again.px, P.PALETTE))) {
      problems.push('determinism: two builds differ — a recipe uses Math.random, Date or shared state');
    }
  }
  for (const p of problems) console.log(`PROBLEM ${p}`);
  console.log(`${problems.length} problem(s); ${Object.keys(art.sprites).length} sprites, ${Object.keys(art.textures).length} textures`);
  if (args.sheet) {
    const s = sheet(art);
    fs.writeFileSync(args.sheet, encodeRGBA(s.w, s.h, s.data));
    console.log(`sheet ${args.sheet} (${s.w}×${s.h})`);
  }
  if (args.write || args.out) {
    if (problems.length) { console.error('not writing: fix the problems first'); process.exit(1); }
    if (args.write && args.families) { console.error('--write needs every family'); process.exit(1); }
    writeOutputs(png, out.manifest, args.out ? path.resolve(args.out) : null);
  }
  if (args.check && problems.length) process.exit(1);
}

main();
