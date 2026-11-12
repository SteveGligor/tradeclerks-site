// Copies the published files, and only those, into dist/, which is what Cloudflare serves
// (wrangler.jsonc). Run by Cloudflare's build as `node make-dist.mjs`; no packages.
//
// A file is published only if it is named in PUBLISHED. Everything else in the repo is
// named in NOT_PUBLISHED, and tests/published-files.test.mjs fails when a file is in
// neither list, so a new file is never published, or left out, by accident.
import { cpSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));

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

export function makeDist(outDir = join(ROOT, 'dist')) {
  const out = resolve(outDir);
  if (out === ROOT || ROOT.startsWith(out + '/')) {
    throw new Error(`make-dist: refusing to write to ${out}`);
  }
  rmSync(out, { recursive: true, force: true });
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

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = makeDist();
  console.log(`make-dist: ${PUBLISHED.length} files copied to ${out}`);
}
