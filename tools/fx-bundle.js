/* =============================================================================
 * SimEarth 2.0 — a bundle with its own effect atlas
 * -----------------------------------------------------------------------------
 * For effect work in parallel: builds the fx atlas from the recipes (all
 * families, or only some) into a folder of one's own and compiles the game
 * with that atlas in place of src/fxatlas.ts. Neither simulation.js nor
 * src/fxatlas.ts is touched; only the lead writes those (fx-atlas --write).
 *
 *   node tools/fx-bundle.js --out <dir> [--family a,b]
 *
 * Prints the bundle path; point SE_BUNDLE at it for tests, the recorder
 * (tools/fx-record.js) and the probes.
 * ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const TSC = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');

function fail(msg) {
  console.error(`fx-bundle: ${msg}`);
  process.exit(1);
}

function main() {
  const argv = process.argv.slice(2);
  let out = null;
  let families = null;
  for (let k = 0; k < argv.length; k++) {
    if (argv[k] === '--out') out = path.resolve(argv[++k]);
    else if (argv[k] === '--family') families = argv[++k];
    else fail(`unknown argument ${argv[k]}`);
  }
  if (!out) fail('--out <dir> is required');
  fs.mkdirSync(out, { recursive: true });
  try {
    execFileSync(process.execPath, [path.join(__dirname, 'fx-atlas.js'), '--out', out, ...(families ? ['--family', families] : [])], { stdio: 'inherit' });
  } catch {
    fail('the effect atlas has problems, see above');
  }
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'tsconfig.json'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, ''));
  const atlas = path.join(out, 'fxatlas.ts');
  const files = config.files.map((f) => (f === 'src/fxatlas.ts' ? atlas : path.join(ROOT, f)));
  const o = config.compilerOptions;
  const bundle = path.join(out, 'simulation.js');
  try {
    execFileSync(process.execPath, [
      TSC, '--outFile', bundle, '--module', o.module, '--target', o.target, '--lib', o.lib.join(','),
      ...(o.strict ? ['--strict'] : []), ...(o.noImplicitOverride ? ['--noImplicitOverride'] : []),
      ...(o.noFallthroughCasesInSwitch ? ['--noFallthroughCasesInSwitch'] : []), ...(o.skipLibCheck ? ['--skipLibCheck'] : []),
      '--forceConsistentCasingInFileNames', '--newLine', o.newLine, ...files,
    ], { cwd: ROOT, stdio: 'pipe' });
  } catch (e) {
    fail(`TypeScript errors:\n${(e.stdout || '').toString()}${(e.stderr || '').toString()}`);
  }
  console.log(bundle);
}

main();
