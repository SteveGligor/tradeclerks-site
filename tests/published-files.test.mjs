// What Cloudflare serves is exactly the files make-dist.mjs names, unchanged, and nothing
// else in the repo. Run: node --test tests/published-files.test.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { makeDist, NOT_PUBLISHED, PUBLISHED } from '../make-dist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Published on purpose although GitHub's builder skips them (a name starting with "." or "_").
const GITHUB_SKIPS_ON_PURPOSE = ['.well-known/apple-app-site-association', '_headers'];

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
  for (const raw of config.split('\n')) {
    if (/^\s*#/.test(raw)) continue; // a comment line, wherever it sits, ends nothing
    const line = raw.replace(/\s+#.*$/, '');
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
    // Password AutoFill file (in .well-known/) and its header rule (_headers) are the two
    // published on purpose that GitHub skips: Cloudflare serves the first and reads the second.
    if (GITHUB_SKIPS_ON_PURPOSE.includes(file)) continue;
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

test('make-dist deletes nothing outside dist/: a folder with something in it is refused, untouched', () => {
  // Only ever a temporary folder made here: a folder that matters is never handed to makeDist.
  const out = mkdtempSync(join(tmpdir(), 'tradeclerks-dist-'));
  try {
    writeFileSync(join(out, 'keep.txt'), 'keep');
    assert.throws(() => makeDist(out), /only dist\/ is ever emptied/);
    assert.deepEqual(filesUnder(out), ['keep.txt']);
    assert.equal(readFileSync(join(out, 'keep.txt'), 'utf8'), 'keep');
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('the githubExcludes reader takes the exclude list and no other', () => {
  assert.deepEqual(githubExcludes('# c\ninclude:\n  - .well-known\nexclude:\n  - a\n# at the margin\n  - b # why\n  # indented\n  - c\nother:\n  - d\n'), ['a', 'b', 'c']);
});

test('no file of redirects is published, and _headers holds one rule, for the site file only', () => {
  // The customer page and the Google return page get no header from the host (website plan
  // 4.2, 6.3), and no address is redirected by a file. Either is its own reviewed change.
  assert.ok(!PUBLISHED.includes('_redirects'), '_redirects must not be published without its own review');
  // Site PR S2: the one exception. Apple's file has no extension, and Cloudflare serves a file
  // with no extension with no content type at all (checked with wrangler dev, 2026-11-18).
  // Every line that isn't blank or a comment, exactly: one address, one header, nothing else.
  const rules = readFileSync(join(ROOT, '_headers'), 'utf8').split('\n').filter((line) => line.trim() && !line.trim().startsWith('#'));
  assert.deepEqual(rules, ['/.well-known/apple-app-site-association', '  Content-Type: application/json']);
});

// ── Site PR S2: the sign-in link's file, /signin and /support ──

const SIGNIN_COMPONENTS = [{ '/': '/signin' }, { '/': '/signin/' }];

test('the Password AutoFill and sign-in link file: /signin only, saved passwords, a real Team ID', () => {
  // The JSON the app expects (trade-clerks #480; app.json: applinks: and webcredentials:
  // tradeclerks.com, bundle id com.tradeclerks.app). A placeholder or a mistyped Team ID fails
  // here, so Cloudflare's build fails and the last good site stays up.
  const text = readFileSync(join(ROOT, '.well-known/apple-app-site-association'), 'utf8');
  const file = JSON.parse(text);
  assert.ok(Buffer.byteLength(text) < 128 * 1024, "Apple reads no more than 128 KB");
  assert.deepEqual(Object.keys(file).sort(), ['applinks', 'webcredentials']);
  assert.deepEqual(Object.keys(file.applinks), ['details']);
  assert.equal(file.applinks.details.length, 1);
  const [entry] = file.applinks.details;
  assert.deepEqual(Object.keys(entry).sort(), ['appIDs', 'components']);
  assert.equal(entry.appIDs.length, 1);
  const [appID] = entry.appIDs;
  assert.match(appID, /^[A-Z0-9]{10}\.com\.tradeclerks\.app$/, `${appID} is not <Team ID>.com.tradeclerks.app (the Team ID is 10 capital letters and digits, from Apple Developer → Membership details)`);
  // Nothing under /v/, /connect/, /stripe/, /start, /thanks, /subscribe, /billing, /support,
  // /terms or /privacy opens the app: only the sign-in link's address.
  assert.deepEqual(entry.components, SIGNIN_COMPONENTS);
  assert.deepEqual(file.webcredentials, { apps: [appID] });
});

const NEW_PAGES = ['signin.html', 'support.html'];
const page = (file) => readFileSync(join(ROOT, file), 'utf8');
const sha256 = (text) => `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;
const inline = (html, tag) => [...html.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g'))].map((m) => m[1]);
const csp = (html) => /<meta http-equiv="Content-Security-Policy" content="([^"]*)">/.exec(html)?.[1];

test('the new pages load nothing from another site and send no referrer', () => {
  for (const file of NEW_PAGES) {
    const html = page(file);
    assert.ok(PUBLISHED.includes(file), `${file} must be published`);
    // Website plan 4.2: no outside scripts, fonts or images, so no Google font either.
    for (const [, attr, value] of html.matchAll(/\b(src|href|action)="([^"]*)"/g)) {
      assert.ok(value.startsWith('/') || value.startsWith('mailto:'), `${file}: ${attr}="${value}" isn't on this site`);
      assert.ok(!value.startsWith('//'), `${file}: ${attr}="${value}" isn't on this site`);
    }
    assert.ok(!/@import|url\(/.test(inline(html, 'style').join('')), `${file}: its style loads something`);
    assert.match(html, /<meta name="referrer" content="no-referrer">/);
  }
});

test('the new pages carry their own security rules, and every inline block is named by its hash', () => {
  // The site-wide security header is S3's; until then each new page says the same in a meta
  // tag: nothing from another site, no form, and only the exact inline blocks written here.
  for (const file of NEW_PAGES) {
    const html = page(file);
    const policy = csp(html);
    assert.ok(policy, `${file} has no Content-Security-Policy`);
    assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<style>'), `${file}: the policy must come before the first block`);
    assert.ok(!/https?:|\*|'unsafe-|data:/.test(policy), `${file}: the policy allows more than this site: ${policy}`);
    const directives = Object.fromEntries(policy.split(';').map((d) => d.trim().split(/\s+/)).map(([k, ...v]) => [k, v]));
    assert.deepEqual(directives['default-src'], ["'none'"]);
    assert.deepEqual(directives['base-uri'], ["'none'"]);
    assert.deepEqual(directives['form-action'], ["'none'"]);
    assert.deepEqual(directives['style-src'], ["'self'", ...inline(html, 'style').map(sha256)]);
    const scripts = inline(html, 'script');
    if (scripts.length) assert.deepEqual(directives['script-src'], scripts.map(sha256));
    else assert.equal(directives['script-src'], undefined, `${file} has no script, so it allows none`);
    assert.ok(!/<script[^>]*\ssrc=/.test(html), `${file} loads a script file`);
  }
});

test('/signin never reads, checks or sends the token: its one script only clears the address bar', () => {
  // Website plan 2.7; trade-clerks #480's notes for S2. An email scanner that opens the link
  // can't use it up, and the #token_hash=… isn't left in history or synced tabs.
  const html = page('signin.html');
  assert.deepEqual(inline(html, 'script'), ["if (location.hash) history.replaceState(null, '', location.pathname + location.search);"]);
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.ok(!/<form|<input|<iframe/i.test(html), '/signin asks for nothing');
});

test('/support has no script and only the reply time the pledge gives', () => {
  const html = page('support.html');
  assert.deepEqual(inline(html, 'script'), []);
  assert.match(html, /A real person replies within two business days\./);
  assert.match(html, /mailto:support@tradeclerks\.com/);
});

test('every address the new pages link to is a published page or file', () => {
  const served = new Set(['/', ...PUBLISHED.map((f) => '/' + f.replace(/index\.html$/, '').replace(/\.html$/, ''))]);
  for (const file of NEW_PAGES) {
    for (const [, value] of page(file).matchAll(/\bhref="(\/[^"#?]*)"/g)) {
      assert.ok(served.has(value), `${file} links to ${value}, which isn't published`);
    }
  }
});

test('no published page says "30 seconds" (website plan 3, finding 7: nothing measures it)', () => {
  for (const file of PUBLISHED.filter((f) => f.endsWith('.html'))) {
    assert.ok(!/30 seconds/i.test(page(file)), `${file} still says "30 seconds"`);
  }
});
