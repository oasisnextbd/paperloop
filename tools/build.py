#!/usr/bin/env python3
"""Build the Paperloop website (Bangla default, English).

    pip install -r requirements.txt
    python3 tools/build.py
    python3 scripts/check_links.py
    python3 -m http.server 8000 -d _site      # preview at http://localhost:8000/

GitHub Pages serves this repository straight from the main branch ("Deploy from a branch", / root),
so the built pages are committed. The build writes the whole site to _site/ (for preview and the link
check) and then copies the pages in PUBLISHED to the repository root, next to assets/. Commit them
together with the source change that produced them.

Sources:
    site.json        settings: brand name, contacts, every price
    templates/       Jinja2 templates; copy is written once with both languages:
                     {{ t("বাংলা লেখা", "English text") }}
    assets/          CSS, JS, fonts, images (copied as-is)
Output:
    <out>/<page>/index.html      Bangla
    <out>/en/<page>/index.html   English
    <out>/sitemap.xml            only once site.json says launched
"""
import json
import pathlib
import shutil
import sys

from jinja2 import Environment, FileSystemLoader, StrictUndefined
from markupsafe import Markup

SRC = pathlib.Path(__file__).resolve().parent.parent          # repository root
OUT = SRC / "_site"
# Built files copied to the repository root, where GitHub Pages serves them.
PUBLISHED = ["index.html", "en/index.html", ".nojekyll", "sitemap.xml"]
SITE = json.loads((SRC / "site.json").read_text(encoding="utf-8"))

# The numbers the calculators need (site.json without its _readme notes).
CALC = {k: {kk: vv for kk, vv in SITE[k].items() if not kk.startswith("_")} for k in ("school", "a4", "ring")}

# slug -> template. "" is the homepage. Order is also the sitemap order.
PAGES = {
    "": "home.html",
}
LANGS = ("bn", "en")

BN_DIGITS = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")


def page_dir(lang, slug):
    parts = (["en"] if lang == "en" else []) + ([slug] if slug else [])
    return OUT.joinpath(*parts)


def rel_root(lang, slug):
    depth = (1 if lang == "en" else 0) + (slug.count("/") + 1 if slug else 0)
    return "../" * depth or "./"


def rate_ranges():
    """Lowest and highest price of each line on the rate sheet, worked out from site.json
    with the same rules as the calculators (assets/js/khata.js)."""
    s, a, r = SITE["school"], SITE["a4"], SITE["ring"]
    top = max(d for _, d in s["qty_discounts"]) if s["qty_discounts"] else 0

    def school(pages, gsm, combo):
        full = s["base_by_pages"][str(pages)] + s["gsm_extra"][str(gsm)] + (s["combo_extra"] if combo else 0)
        return [full - top, full]

    def ream(gsm):
        full = a["base"][str(gsm)]
        off = (max(d for _, d in a["qty_discounts"]) if a["qty_discounts"] else 0) + max(a["plan_discounts"].values())
        return [full - off, full]

    packs = {int(k): v for k, v in r["packs"].items()}
    per_piece = [round(v / k) for k, v in packs.items()]
    return {
        "school_60_70": school(60, 70, False),
        "school_combo_80_70": school(80, 70, True),
        "a4": {g: ream(g) for g in sorted(int(k) for k in a["base"])},
        "ring": [min(per_piece), max(per_piece)],
    }


def render_all():
    env = Environment(
        loader=FileSystemLoader(SRC / "templates"),
        autoescape=True,
        undefined=StrictUndefined,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    built = []
    for lang in LANGS:
        for slug, tpl in PAGES.items():
            root = rel_root(lang, slug)

            def t(bn, en, _lang=lang):
                return Markup(bn if _lang == "bn" else en)

            def n(text, _lang=lang):
                """Bangla digits on Bangla pages: n("500")."""
                s = str(text)
                return s.translate(BN_DIGITS) if _lang == "bn" else s

            def url(target_slug, target_lang=None, _lang=lang, _root=root):
                tl = target_lang or _lang
                path = ("en/" if tl == "en" else "") + (target_slug + "/" if target_slug else "")
                return _root + path

            html = env.get_template("pages/" + tpl).render(
                lang=lang, slug=slug, root=root, site=SITE, t=t, n=n, url=url, rates=rate_ranges(), calc=CALC,
                brand=SITE["brand"]["name_bn" if lang == "bn" else "name_en"],
                canonical=SITE["base_url"] + "/" + ("en/" if lang == "en" else "") + (slug + "/" if slug else ""),
                alt_bn=SITE["base_url"] + "/" + (slug + "/" if slug else ""),
                alt_en=SITE["base_url"] + "/en/" + (slug + "/" if slug else ""),
            )
            d = page_dir(lang, slug)
            d.mkdir(parents=True, exist_ok=True)
            (d / "index.html").write_text(html, encoding="utf-8")
            built.append((lang, slug))
    return built


def write_sitemap():
    rows = []
    for slug in PAGES:
        for lang in LANGS:
            loc = SITE["base_url"] + "/" + ("en/" if lang == "en" else "") + (slug + "/" if slug else "")
            bn = SITE["base_url"] + "/" + (slug + "/" if slug else "")
            en = SITE["base_url"] + "/en/" + (slug + "/" if slug else "")
            rows.append(
                f"  <url><loc>{loc}</loc>"
                f'<xhtml:link rel="alternate" hreflang="bn" href="{bn}"/>'
                f'<xhtml:link rel="alternate" hreflang="en" href="{en}"/></url>'
            )
    (OUT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + "\n".join(rows) + "\n</urlset>\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(SRC / "assets", OUT / "assets", ignore=shutil.ignore_patterns("README.md", ".*"))
    built = render_all()
    if SITE["launched"]:
        write_sitemap()
    (OUT / ".nojekyll").write_text("")  # serve files as-is (no Jekyll processing)
    for name in PUBLISHED:
        src, dest = OUT / name, SRC / name
        if src.exists():
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dest)
        elif dest.exists():
            dest.unlink()
    print(f"Built {len(built)} pages into {OUT} and copied them to the repository root")
