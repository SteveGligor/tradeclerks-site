# tradeclerks.com

Holding page, Terms and Privacy for the Trade Clerks app, served by GitHub Pages.

- The legal text lives in `content/*.md`, copied from `trade-clerks-app/docs/legal/` (the source of truth): `terms.md` and `privacy.md` by name, nothing else from that folder.
- To change it: copy the two files in, set the effective date in the copies only (the source keeps `[publish date]`), run `python3 build.py`, and open a pull request.
- A merge or push to `main` publishes the site straight away through GitHub Pages, so nobody pushes to `main`, and only Steve merges.
