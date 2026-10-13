/* =============================================================================
 * SimEarth 2.0 — ship a change
 * -----------------------------------------------------------------------------
 * The only way changes go to GitHub: run the checks, release a new version,
 * log the change to docs/done.md, commit everything, tag the version, push to
 * origin and, from a branch other than main, open a pull request with the
 * GitHub CLI.
 *
 * Every commit is a new version. The version in package.json is released as
 * is while it has no tag yet (so a hand-set version wins); otherwise the patch
 * number goes up by one.
 *
 *   node scripts/ship.mjs "<type>(<scope>): <summary>" ["<body>" ...] [--minor | --major] [--full] [--dry-run]
 *
 *     --minor    0.6.3 -> 0.7.0 instead of 0.6.4 (--major: -> 1.0.0)
 *     --full     run the whole test suite (~4 min) instead of the quick tests
 *     --dry-run  run the checks, list what would be committed as which version, then stop
 *
 * ========================================================================== */
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DONE_LOG = join(ROOT, 'docs', 'done.md');
const MAIN = 'main';
const SUBJECT = /^(feat|fix|perf|refactor|style|test|docs|build|chore)\([a-z0-9-]+\)!?: \S.{0,70}$/;

function fail(message) {
  console.error(`ship: ${message}`);
  process.exit(1);
}

/** npm is a .cmd shim on Windows and only starts through a shell; its arguments here are fixed. */
function run(cmd, args, { capture = false, shell = false } = {}) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    shell,
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  });
  if (r.error) fail(`${cmd}: ${r.error.message}`);
  if (r.status !== 0) fail(`\`${cmd} ${args.join(' ')}\` failed (exit ${r.status})`);
  return capture ? r.stdout.trim() : '';
}

const npm = (...args) => run('npm', args, { shell: process.platform === 'win32' });
const git = (...args) => run('git', args, { capture: true });

function hasGh() {
  return !spawnSync('gh', ['--version'], { stdio: 'ignore' }).error;
}

function packageVersion() {
  const version = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
  if (!/^\d+\.\d+\.\d+$/.test(version)) fail(`package.json version "${version}" is not <major>.<minor>.<patch>`);
  return version;
}

function nextVersion(level) {
  const current = packageVersion();
  if (!git('tag', '--list', `v${current}`)) return current;
  const [major, minor, patch] = current.split('.').map(Number);
  if (level === 'major') return `${major + 1}.0.0`;
  if (level === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ args -- */

const args = process.argv.slice(2);
const full = args.includes('--full');
const dryRun = args.includes('--dry-run');
const level = args.includes('--major') ? 'major' : args.includes('--minor') ? 'minor' : 'patch';
const [subject, ...body] = args.filter((a) => !a.startsWith('--'));

if (!subject || !SUBJECT.test(subject)) {
  fail('usage: node scripts/ship.mjs "<type>(<scope>): <summary>" ["<body>" ...] [--minor | --major] [--full] [--dry-run]\n'
    + '      type: feat|fix|perf|refactor|style|test|docs|build|chore · scope: lowercase · summary: at most 71 characters');
}

/* ------------------------------------------------------------ repository -- */

if (git('rev-parse', '--is-inside-work-tree') !== 'true') fail('not inside a git repository');
const remote = git('remote', 'get-url', 'origin');
const branch = git('branch', '--show-current');
if (!branch) fail('detached HEAD — check out a branch first');

/* ---------------------------------------------------------------- checks -- */

if (full) {
  npm('test');
} else {
  npm('run', 'build');
  npm('run', 'test:quick');
}

const changes = git('status', '--porcelain');
const version = nextVersion(level);
if (dryRun) {
  console.log(changes ? `ship: would commit v${version} on ${branch}:\n${git('status', '--short')}` : `ship: nothing to commit on ${branch}`);
  process.exit(0);
}

/* ------------------------------------------------- version, commit, push -- */

if (changes) {
  if (version !== packageVersion()) npm('version', version, '--no-git-tag-version');
  if (!existsSync(DONE_LOG)) appendFileSync(DONE_LOG, '# Done\n\nEvery change shipped with `scripts/ship.mjs`, newest last.\n\n');
  appendFileSync(DONE_LOG, `- ${today()} v${version} ${subject}\n`);
  git('add', '--all');
  git('commit', '--quiet', '-m', `${subject} (v${version})`, ...body.flatMap((b) => ['-m', b]));
  git('tag', '--annotate', `v${version}`, '-m', `v${version}`);
  console.log(`ship: committed ${git('rev-parse', '--short', 'HEAD')} as v${version}: ${subject}`);
} else {
  console.log('ship: nothing new to commit, pushing what is there');
}

run('git', ['push', '--follow-tags', '--set-upstream', 'origin', branch]);

/* ---------------------------------------------------------- pull request -- */

if (branch !== MAIN) {
  const compare = `${remote.replace(/\.git$/, '')}/compare/${MAIN}...${branch}`;
  if (!hasGh()) {
    console.log(`ship: GitHub CLI (gh) not found — open the pull request here: ${compare}`);
  } else if (spawnSync('gh', ['pr', 'view', branch], { cwd: ROOT, stdio: 'ignore' }).status === 0) {
    console.log(`ship: pull request for ${branch} updated`);
  } else {
    run('gh', ['pr', 'create', '--base', MAIN, '--head', branch, '--fill']);
  }
}
