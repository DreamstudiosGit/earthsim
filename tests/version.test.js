'use strict';
/*
 * The title screen shows the version from package.json, which
 * tools/stamp-version.js writes into simulation.js after every build.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadSE } = require('./helpers');

// An own bundle for parallel work is a bare `tsc` build unless stamped.
test('the committed bundle carries the version from package.json', { skip: process.env.SE_BUNDLE ? 'SE_BUNDLE: own bundle' : false }, () => {
  const SE = loadSE();
  const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  assert.equal(SE.APP_VERSION, version, 'build with `npm run build`: a bare `tsc` leaves APP_VERSION at "dev"');
});
