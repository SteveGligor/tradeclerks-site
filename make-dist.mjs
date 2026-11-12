// Copies the published files, and only those, into dist/, which is what Cloudflare serves
// (wrangler.jsonc). No packages. Cloudflare's build command, set in its dashboard, is
//   node --test tests/published-files.test.mjs && node make-dist.mjs
// so a file that is in neither list below fails the build, and the last good site stays up.
//
// A file is published only if it is named in PUBLISHED. Everything else in the repo is
// named in NOT_PUBLISHED, and tests/published-files.test.mjs fails when a file is in
// neither list, so a new file is never published, or left out, by accident.
import { cpSync, existsSync, mkdirSync, readdirSync, realpathSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = realpathSync(dirname(fileURLToPath(import.meta.url)));
const DIST = join(ROOT, 'dist');

// The site, file by file. Paths from the repo's root, served at the same path.
export const PUBLISHED = [
  'index.html',
  'terms.html',
  'privacy.html',
  'style.css',
  'logo.png',
  'v/index.html',
  'connect/google.html',
  'stripe/return.html',
  'stripe/refresh.html',
];

// The repo's own working files: never served. A name ending in "/" is a whole folder.
// GitHub Pages is told the same in _config.yml for as long as it is still set up.
export const NOT_PUBLISHED = [
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'build.py',
  'make-dist.mjs',
  'wrangler.jsonc',
  'CNAME',
  '_config.yml',
  '.gitignore',
  'content/',
  'tests/',
];

// The only folder this ever deletes is the repo's own dist/, a fixed path. Asked to write
// anywhere else (the test's temporary folder), it deletes nothing and refuses a folder that
// already has something in it.
export function makeDist(outDir = DIST) {
  const out = resolve(outDir);
  if (out === DIST) {
    rmSync(DIST, { recursive: true, force: true });
  } else if (existsSync(out) && readdirSync(out).length > 0) {
    throw new Error(`make-dist: ${out} is not empty, and only dist/ is ever emptied`);
  }
  for (const file of PUBLISHED) {
    const from = join(ROOT, file);
    if (!existsSync(from) || !statSync(from).isFile()) {
      throw new Error(`make-dist: ${file} is in PUBLISHED but is not a file in the repo`);
    }
    const to = join(out, file);
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to);
  }
  return out;
}

// Run as a command (`node make-dist.mjs`), not imported by the test. Real paths on both
// sides, so a path through a link still runs it rather than doing nothing without a word.
const runAsCommand = (() => {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
})();

if (runAsCommand) {
  const out = makeDist();
  console.log(`make-dist: ${PUBLISHED.length} files copied to ${out}`);
}
