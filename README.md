# tradeclerks.com

Holding page, Terms and Privacy for the Trade Clerks app, served by GitHub Pages.

- The legal text lives in `content/*.md`, copied from `docs/legal/` on the app repo's `main` (the source of truth): `terms.md` and `privacy.md` by name, nothing else from that folder, never from an unmerged branch.
- To change it: copy the two files in, and set the effective date in the copies only (the source keeps `[publish date]`) to the day Steve will merge. Check each copy differs from the source only on that line and shows the same version as the app's `TERMS_VERSION`. Run `python3 build.py`, then open a pull request. If the merge moves to another day, change the date in both copies and rebuild before merging.
- A merge or push to `main` publishes the site straight away through GitHub Pages, so nobody pushes to `main`, and only Steve merges.
