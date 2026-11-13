# Paperloop website

Bilingual (Bangla default, English) site for **Paperloop**: khatas printed in a school's name, A4 paper
for copy shops, and 200-page ring khatas for students. Visitors build an order with live previews and
prices, collect it on an order memo, and send the memo.

**Not launched yet:** while `site.json → launched` is `false` the pages ask search engines not to index
them and no sitemap is written.

```
site.json            brand name, contacts, every price and offer
templates/           base.html, partials/, pages/home.html  ({{ t("বাংলা", "English") }})
assets/              css/khata.css, js/khata.js, fonts/, img/ (published as-is)
assets-source/logo/  the chosen logo artwork (not published)
tools/build.py       renders the page in both languages into _site/
scripts/check_links.py   fails on any broken internal link
.github/workflows/pages.yml   build and check on every push; publish only when run by hand
```

## Work on it locally

```bash
pip install -r requirements.txt
python3 tools/build.py && python3 scripts/check_links.py
python3 -m http.server 8000 -d _site     # http://localhost:8000/  (English: /en/)
```

## Publishing

Pushes and pull requests only build and check. To publish: once, set **Settings → Pages → Build and
deployment → Source: GitHub Actions**; then **Actions → Build and publish site → Run workflow** on `main`.
The site appears at `https://oasisnextbd.github.io/paperloop/`. If it moves to its own domain, change
`site.json → base_url`.

## Common edits

| Task | Where |
|---|---|
| Brand name in text, wordmark, tagline | `site.json → brand` |
| Phone, WhatsApp, Facebook, delivery area | `site.json → contact` (empty = not shown; a WhatsApp number turns on "Send on WhatsApp" in the memo) |
| Any price, minimum order or discount | `site.json → school`, `a4`, `ring` (the calculators and the rate sheet both read them) |
| Hide every price | `site.json → show_prices: false` (the builders then only make a quote request) |
| Offers: free cover design, free delivery, cash on delivery | `site.json → school.free_design_from`, `ring.free_delivery_pack`, `ring.cod` |
| Go live for search engines | `site.json → launched: true` |
| Add a page | `templates/pages/<name>.html` + `PAGES` in `tools/build.py` |

## Brand

- **Logo:** an infinity of two loops whose radii are in the golden ratio (r and φr), small loop navy (white
  on dark), large loop gold, then the wordmark "Paperloop" and the tagline "Write towards infinity".
  The lockup is always in English. Source artwork: `assets-source/logo/`. The site's SVG
  (`templates/partials/logo.html`, `assets/img/favicon.svg`) is redrawn from that artwork and the wordmark
  is set in Jost; replace them with the designer's vector master when there is one.
- **Colours:** navy `#14213d`, gold `#d9ae5a` (`#b8892f` for the loop on light backgrounds), white.
  All colours are tokens at the top of `assets/css/khata.css`; the site follows the device's light or dark setting.

## Rules

- **Real values only.** No placeholder prices or contact details: leave a value empty and it is not shown.
- **Only claims we can stand behind.** No paper-quality claims (brightness, "jam-free", machine brands) and no
  "mill" or "factory" wording until there is a test or a document for them.
- **Drawn, not photographed.** The khatas, ream and memo are drawn in CSS so that what a visitor sees is their
  own order, not a stock picture. Add photographs only of our real products.
- **Keep it bilingual:** every string is written in both Bangla and English.
- The price rules live twice: `assets/js/khata.js` (calculators) and `rate_ranges()` in `tools/build.py`
  (rate sheet). Change them together.
- Templates carry no inline styles; one `<h1>` per page; labels for every form field.
