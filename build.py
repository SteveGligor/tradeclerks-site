#!/usr/bin/env python3
"""Builds terms.html and privacy.html from content/*.md (the approved text, copied
from trade-clerks-app/docs/legal). Run after changing the text: python3 build.py

Handles the Markdown the legal docs use: headings, paragraphs, lists, tables,
**bold**, *italic*, and HTML comments (dropped). The "Not legal advice" note at
the top is for the repo copy only and is left out of the pages.
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).parent

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Trade Clerks</title>
<meta name="description" content="{title} for the Trade Clerks app.">
<link rel="icon" href="/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
</head>
<body>
<header class="top"><a href="/"><img src="/logo.png" alt="Trade Clerks" class="logo-small"></a></header>
<main class="doc">
{body}
</main>
<footer class="foot">
  <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="mailto:support@tradeclerks.com">support@tradeclerks.com</a>
</footer>
</body>
</html>
"""


def inline(text: str) -> str:
    text = html.escape(text, quote=False)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)", r"<em>\1</em>", text)
    text = re.sub(r"\b([a-z]+@tradeclerks\.com)\b", r'<a href="mailto:\1">\1</a>', text)
    text = re.sub(r"\bpriv\.gc\.ca\b", r'<a href="https://www.priv.gc.ca">priv.gc.ca</a>', text)
    return text


def convert(md: str) -> tuple[str, str]:
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S)
    lines = md.splitlines()
    out: list[str] = []
    title = ""
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            i += 1
            continue
        if line.startswith("**Not legal advice"):        # repo-only note
            i += 1
            continue
        if line.startswith("# "):
            title = line[2:].strip()
            out.append(f"<h1>{inline(title)}</h1>")
            i += 1
            continue
        if line.startswith("## "):
            out.append(f"<h2>{inline(line[3:].strip())}</h2>")
            i += 1
            continue
        if line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r"-+", c) for c in cells):
                    rows.append(cells)
                i += 1
            head, *body = rows
            out.append('<div class="table-wrap"><table><thead><tr>'
                       + "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr></thead><tbody>"
                       + "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in body)
                       + "</tbody></table></div>")
            continue
        if line.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "):
                items.append(lines[i][2:].strip())
                i += 1
            out.append("<ul>" + "".join(f"<li>{inline(it)}</li>" for it in items) + "</ul>")
            continue
        para = [line.strip()]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"(#|- |\|)", lines[i]):
            para.append(lines[i].strip())
            i += 1
        out.append(f"<p>{inline(' '.join(para))}</p>")
    return title, "\n".join(out)


for name in ("terms", "privacy"):
    title, body = convert((ROOT / "content" / f"{name}.md").read_text())
    title = title.replace("Trade Clerks ", "")
    (ROOT / f"{name}.html").write_text(PAGE.format(title=title, body=body))
    print(f"built {name}.html ({title})")
