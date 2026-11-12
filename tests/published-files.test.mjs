// What Cloudflare serves is exactly the files make-dist.mjs names, unchanged, and nothing
// else in the repo. Run: node --test tests/published-files.test.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { makeDist, NOT_PUBLISHED, PUBLISHED } from '../make-dist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Made on a machine, never committed (.gitignore), so never part of the repo's files.
const LOCAL_ONLY = ['.git', 'dist', '.wrangler', 'node_modules'];

function filesUnder(dir, skip = []) {
  const found = [];
  const walk = (rel) => {
    for (const entry of readdirSync(join(dir, rel), { withFileTypes: true })) {
      const path = rel ? `${rel}/${entry.name}` : entry.name;
      if (!rel && skip.includes(entry.name)) continue;
      if (entry.isDirectory()) walk(path);
      else found.push(path);
    }
  };
  walk('');
  return found.sort();
}

// The repo's files as git sees them: committed, or new and not ignored. A file the Mac
// leaves behind and .gitignore names (.DS_Store) is not one of them. Without git (a copy
// of the folder with no .git), every file in the folder is looked at instead.
function repoFiles() {
  try {
    const out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const files = out.split('\0').filter(Boolean).sort();
    if (files.length > 0) return files;
  } catch {
    // fall through to the folder itself
  }
  return filesUnder(ROOT, LOCAL_ONLY);
}

// The names under `exclude:` in _config.yml, and only those: a list under another key
// (an `include:` list, say) is not read as an exclude.
function githubExcludes(config) {
  const names = [];
  let inExclude = false;
  for (const line of config.split('\n')) {
    if (/^\S/.test(line)) inExclude = /^exclude:\s*$/.test(line);
    else if (inExclude) {
      const name = /^\s+-\s+(\S+)\s*$/.exec(line)?.[1];
      if (name) names.push(name);
    }
  }
  return names;
}

const notPublished = (file) =>
  NOT_PUBLISHED.some((name) => (name.endsWith('/') ? file.startsWith(name) : file === name));

test('dist holds the published files and nothing else, byte for byte', () => {
  const out = mkdtempSync(join(tmpdir(), 'tradeclerks-dist-'));
  try {
    makeDist(out);
    assert.deepEqual(filesUnder(out), [...PUBLISHED].sort());
    for (const file of PUBLISHED) {
      assert.ok(readFileSync(join(out, file)).equals(readFileSync(join(ROOT, file))), `${file} was changed on the way to dist`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('every file in the repo is named as published or as not published, never both', () => {
  const files = repoFiles();
  assert.ok(files.includes('make-dist.mjs'), 'the list of the repo\'s files is wrong');
  for (const file of files) {
    const isPublished = PUBLISHED.includes(file);
    assert.ok(isPublished || notPublished(file), `${file} is in neither list in make-dist.mjs: say whether the site serves it`);
    assert.ok(!(isPublished && notPublished(file)), `${file} is in both lists in make-dist.mjs`);
  }
  assert.equal(new Set(PUBLISHED).size, PUBLISHED.length, 'a file is listed twice in PUBLISHED');
});

test('the addresses already in use are still published', () => {
  // Website plan 1.2: every invoice and quote email, the app, Google and Stripe point here.
  for (const file of ['index.html', 'terms.html', 'privacy.html', 'style.css', 'logo.png', 'v/index.html', 'connect/google.html', 'stripe/return.html', 'stripe/refresh.html']) {
    assert.ok(PUBLISHED.includes(file), `${file} must stay published`);
  }
  // Named google.html and return.html, not folders, so they answer with no redirect.
  assert.ok(!PUBLISHED.some((f) => /^(connect\/google|stripe\/(return|refresh))\/index\.html$/.test(f)));
});

test('GitHub Pages leaves out the same working files, while it is still set up', () => {
  const excluded = githubExcludes(readFileSync(join(ROOT, '_config.yml'), 'utf8'));
  assert.ok(excluded.includes('README.md'), "couldn't read the exclude list in _config.yml");
  for (const name of NOT_PUBLISHED) {
    const top = name.replace(/\/$/, '');
    // GitHub's builder skips names starting with "." or "_" by itself.
    if (/^[._]/.test(top)) continue;
    assert.ok(excluded.includes(top), `${top} is not published by Cloudflare but _config.yml doesn't exclude it`);
  }
  // Its excludes match as prefixes: none of them may swallow a published file.
  for (const file of PUBLISHED) {
    assert.ok(!excluded.some((name) => file.startsWith(name)), `_config.yml would exclude ${file}`);
    // GitHub's builder skips a file or folder whose name starts with "." or "_". S2's
    // Password AutoFill file lives in .well-known/, which GitHub would skip and Cloudflare
    // serves: when it arrives, this is the line to loosen, for that one path, on purpose.
    assert.ok(!file.split('/').some((part) => /^[._]/.test(part)), `GitHub Pages would skip ${file}`);
  }
});

test("Cloudflare's settings: plain files from dist, same addresses, a real 404, no code of ours", () => {
  const text = readFileSync(join(ROOT, 'wrangler.jsonc'), 'utf8');
  const settings = JSON.parse(text.split('\n').filter((line) => !line.trim().startsWith('//')).join('\n'));
  assert.deepEqual(settings, {
    name: 'tradeclerks-site',
    compatibility_date: settings.compatibility_date,
    workers_dev: true,
    preview_urls: false,
    assets: { directory: './dist', html_handling: 'auto-trailing-slash', not_found_handling: 'none' },
  });
  assert.match(settings.compatibility_date, /^\d{4}-\d{2}-\d{2}$/);
});

test('make-dist only ever empties dist/ or a folder outside the repo', () => {
  for (const bad of [ROOT, join(ROOT, '..'), '/', join(ROOT, 'v'), join(ROOT, 'tests'), join(ROOT, 'dist', 'inner'), join(ROOT, 'content', 'x')]) {
    assert.throws(() => makeDist(bad), /refusing to write/, `makeDist(${bad}) should refuse`);
  }
});

test('the githubExcludes reader takes the exclude list and no other', () => {
  assert.deepEqual(githubExcludes('# c\ninclude:\n  - .well-known\nexclude:\n  - a\n  - b\nother: 1\n'), ['a', 'b']);
});

test('no file of headers or redirects is published', () => {
  // The customer page and the Google return page get no header from the host (website plan
  // 4.2, 6.3), and no address is redirected by a file. Either is its own reviewed change.
  for (const name of ['_headers', '_redirects']) {
    assert.ok(!PUBLISHED.includes(name), `${name} must not be published without its own review`);
  }
});
