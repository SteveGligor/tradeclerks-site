# tradeclerks-site — Agent Rules

Rules for any AI coding agent working in this repo. **The full rules are the app repo's
`AGENTS.md`** (the `trade-clerks` repo, usually checked out beside this one as
`trade-clerks-app`): read it first. Its hard rules, HIGH-RISK rules, model rules and
AUTOPILOT loop apply here as they do there. This file repeats what is particular to the site
(the website plan, `docs/plans/WEBSITE_PLAN.md` in the app repo, section 4.4). If the two
disagree, or the app repo isn't at hand, stop and ask Steve.

## Hard rules here

- **A merge to `main` is a publish.** It reaches tradeclerks.com within minutes. **Only Steve
  merges in this repo, HIGH-RISK or not.** Never push to `main`. An agent's work ends at a pull
  request and Steve's card.
- **Never hold a Cloudflare sign-in or token, and never run its deploy command**
  (`wrangler deploy`, `wrangler versions upload`, or anything else that changes what Cloudflare
  serves). The site is published only by Steve's merge. `wrangler dev`, which serves the files
  on this Mac and signs in to nothing, is fine for checking: use the version named in
  `wrangler.jsonc`'s first comment (the one Cloudflare's build uses), installed outside this
  repo, with `WRANGLER_SEND_METRICS=false` so it reports nothing.
- **This repo is public until Steve makes it private.** Anyone can read every branch and every
  pull request. Never commit, or write in a pull request, a key, a token, a link token, an
  account id, a checkout link (the sandbox one above all) or an email address other than the
  public `support@` and `privacy@` ones the pages already show.
- **Never touch DNS, the domain, or Cloudflare's dashboard.** Those are Steve's steps, one at a
  time, on a card.

## The customer page is fenced off

`v/index.html` (the invoice or quote a customer opens from an email; every such email sent
since 2026-11-04 points at it), `connect/google.html` (the return address registered at
Google), `style.css` and `logo.png` are **never edited by a redesign or a hosting change**, and
the host is given **no `_headers` and no `_redirects` file** (`tests/published-files.test.mjs`
fails if either is published), so no header of ours is set on the first two and the addresses
in use (`/v/`, `/connect/google`) answer 200 with no redirect. Only their other spellings
(`/v`, `/v/index.html`, `/connect/google.html`) are sent on to those addresses by the host. A change to any of them is its
own HIGH-RISK pull request, tested with a real invoice link, a real quote link and a real
Google connect.

## HIGH-RISK in this repo

The app repo's list applies. Here that means: anything that changes who serves the site or an
address already in use (`wrangler.jsonc`, `make-dist.mjs`, `_config.yml`, `CNAME`); `/v/`,
`/connect/google`, `/stripe/`; the legal text (`content/`, `terms.html`, `privacy.html`);
sign-in, sign-up and payment pages; any security header. Such a pull request says
"HIGH-RISK: <area>" and **"NEEDS FABLE REVIEW BEFORE MERGE"** at the top of its description and
gets a `cold-reviewer` run on Fable (the agent lives in the app repo's `.claude/agents/`), its
findings numbered in the description with what was done about each.

## What is published

- `make-dist.mjs` names every published file (`PUBLISHED`) and every working file that is never
  served (`NOT_PUBLISHED`). Cloudflare's build runs the test and then `node make-dist.mjs`, and
  serves `dist/` as plain files (`wrangler.jsonc`, whose first comment gives the two commands
  set in Cloudflare's dashboard). **A new file goes in one list or the other in the same pull
  request.** If it's in neither, the test fails and so does Cloudflare's build: the page would
  be on GitHub's copy and missing from Cloudflare's.
- **The move's pause (2026-11-12, removed with `_config.yml` at the move's last step):** from
  the day Steve connects this repo to Cloudflare until `tradeclerks.com` is switched over, **no
  pull request is merged here**, whatever it is, so the site checked on Cloudflare is the site
  that's switched. A pull request may be opened and reviewed in that time; its merge step waits.
  Ask Steve where the move stands before putting a merge on a card.
- While GitHub Pages is still set up (until the move's last step), `_config.yml` keeps the same
  working files out of GitHub's copy, and no pull request changes how the site is built.
- An address is a file: `/terms` is `terms.html`, `/v/` is `v/index.html`, and a page that must
  answer with no redirect and no trailing slash is `<name>.html`, never `<name>/index.html`.

## Before a pull request

- `node --test tests/published-files.test.mjs tests/quote-total.test.mjs` passes.
- The legal pages are rebuilt only as `README.md` says, from the app repo's `main`.
- The description says what a visitor will see change (often: nothing), the HIGH-RISK line or
  "Not HIGH-RISK", the review's findings, and what was checked and where.

## After every merge: the site check

An agent checks the public site (website plan 5.1):

- `/`, `/terms`, `/privacy` answer 200 with the right words, and `/terms.html` reaches `/terms`;
- `/v/` answers 200 and is byte for byte the reviewed file;
- `/connect/google?state=x`, `/stripe/return` and `/stripe/refresh` answer 200 with no redirect;
- `/style.css` and `/logo.png` answer 200, unchanged, with the same content type as before;
- no page has a script or a rewritten email address it didn't have before;
- the working files (`README.md`, `AGENTS.md`, `CLAUDE.md`, `build.py`, `make-dist.mjs`,
  `wrangler.jsonc`, `content/`, `tests/`) and a made-up address answer 404.

On the site's default Cloudflare address (`….workers.dev`), send an honest, descriptive
`User-Agent` with each request: Cloudflare refuses some tools' default ones there (error 1010)
and that can't be switched off. **That address holds the Cloudflare account's own name: never
write it in a pull request, a commit or a file here.** What needs an emailed link (a real
invoice or quote) or a sign-in is Steve's to check.
