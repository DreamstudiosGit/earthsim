#!/usr/bin/env node
/*
 * Writes the version from package.json into the built simulation.js, in place
 * of `APP_VERSION` (src/titledecor.ts). Runs after every `npm run build`, and npm
 * runs that build again after `npm version`, so a release carries its own
 * number. A browser on file:// cannot read package.json itself.
 *
 *   node tools/stamp-version.js [bundle]   (default: simulation.js)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const bundle = path.resolve(process.argv[2] || path.join(ROOT, 'simulation.js'));
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`stamp-version: package.json version "${version}" is not <major>.<minor>.<patch>`);
  process.exit(1);
}

const LINE = /^(\s*SE\.APP_VERSION = )(['"])[^'"]*\2;$/gm;
const src = fs.readFileSync(bundle, 'utf8');
const hits = src.match(LINE) || [];
if (hits.length !== 1) {
  console.error(`stamp-version: expected one APP_VERSION line in ${bundle}, found ${hits.length}`);
  process.exit(1);
}
const out = src.replace(LINE, (_, head) => `${head}'${version}';`);
if (out !== src) fs.writeFileSync(bundle, out);
