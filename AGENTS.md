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
  on this Mac and signs in to nothing, is fine for checking.
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
the host sets **no header and no redirect** on the first two (no `_headers`, no `_redirects`;
`tests/published-files.test.mjs` fails if either is published). A change to any of them is its
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
  served (`NOT_PUBLISHED`). Cloudflare's build runs `node make-dist.mjs`, then serves `dist/`
  as plain files (`wrangler.jsonc`). A new file goes in one list or the other in the same pull
  request, or the test fails.
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

An agent checks the public site (website plan 5.1): `/`, `/terms`, `/privacy` answer 200 with
the right words; `/v/` answers 200 and is byte for byte the reviewed file; `/connect/google`
answers 200 with no redirect; no page has a script or a rewritten email address it didn't have
before; and the working files (`README.md`, `AGENTS.md`, `build.py`, `make-dist.mjs`,
`wrangler.jsonc`, `content/`, `tests/`) answer 404. What needs an emailed link (a real invoice
or quote) or a sign-in is Steve's to check.
