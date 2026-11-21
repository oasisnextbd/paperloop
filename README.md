# Paperloop website

Bilingual (Bangla default, English) site for **Paperloop**: khatas printed in a school's name, A4 paper
for copy shops, and 200-page ring khatas for students. Visitors build an order with live previews and
prices, collect it on an order memo, and send the memo.

**Not launched yet:** while `site.json → launched` is `false` the pages ask search engines not to index
them and no sitemap is written.

```
index.html, en/      the built pages GitHub Pages serves (generated: do not edit by hand)
site.json            brand name, contacts, every price and offer
templates/           base.html, partials/, pages/home.html  ({{ t("বাংলা", "English") }})
assets/              css/khata.css, js/khata.js, fonts/, img/ (published as-is)
assets-source/logo/  the chosen logo artwork (not published)
tools/build.py       renders the page in both languages into _site/ and copies the pages to the root
scripts/check_links.py   fails on any broken internal link
.github/workflows/pages.yml   checks every push: builds, no broken links, built pages are committed
```

## Work on it locally

```bash
pip install -r requirements.txt
python3 tools/build.py && python3 scripts/check_links.py
python3 -m http.server 8000 -d _site     # http://localhost:8000/  (English: /en/)
```

## Publishing

GitHub Pages serves the `main` branch as it is (**Settings → Pages → Deploy from a branch → main, / root**),
at `https://oasisnextbd.github.io/paperloop/`. So a change is live a minute or two after it reaches `main`:

1. Edit the sources (`site.json`, `templates/`, `assets/`).
2. Run `python3 tools/build.py && python3 scripts/check_links.py`.
3. Commit the sources **and** the rebuilt `index.html` and `en/index.html` together, then push.

The check workflow fails if the committed pages do not match the sources. If the site moves to its own
domain, change `site.json → base_url`.

## Smart diary (`diary/`)

A demo of the Paperloop smart diary for schools, at `https://oasisnextbd.github.io/paperloop/diary/`.
It opens on a login page where the person chooses **অভিভাবক** (School Code + Class + Roll), **শিক্ষক** or
**স্কুল** (code, ID and 4-digit PIN). The role chosen there is the only dashboard they see; the header's
**প্রোফাইল** button opens their details, settings (text size; absent alerts for parents; another child's
diary) and logout. Notices sit behind the header's **নোটিশ** button (with an unread count): the
principal sends to everyone, parents, teachers or one class; a class teacher sends to her class's parents.
The principal sets each class's routine; parents see it with **ব্যাগে যা দেবেন** (the books and Paperloop
khatas for that day). Results: the class teacher enters marks on one screen per subject; weekly tests are
published by the teacher, model and term exams by the principal (Bangladesh primary grading, any F means an
overall F, positions only for students who passed). Parents see and print the mark sheet; the principal sees
the merit list, tabulation sheet, failed subjects and a summary, and can print the first two. Student records: the principal sees class-wise counts, searches the class list, opens and edits
a student's profile, admits new students (they join the attendance register at once and every exam created
after) and prints the class list; the class teacher sees her class read-only; parents see their child's
record in the profile panel. Sample records have no phone numbers on purpose. Fees: the principal or office collects fees (tick the months
or fees being paid, method, optional discount or other fee) and prints a money receipt with parent and office
copies; due list, cash book and fee settings per class, with half or full waivers. Parents see what is due and
their receipts. There is no online payment; the method (cash, bKash, Nagad, bank) is only recorded. The login and settings are remembered on that phone until logout (browser storage).

Every name and number is sample data (the page says so), any ID and PIN are accepted, the school's data
resets on reload, and the page asks search engines not to index it.

| File | What it is |
|---|---|
| `diary/index.html` | the app: one page, markup and JavaScript (edit this) |
| `diary/diary.input.css` | fonts, base styles and the floating-card / active-tile styles (edit this) |
| `diary/tailwind.config.js` | the Paperloop palette as Tailwind colours: `ink-*` (navy neutrals), `gold-*` (accent), `white` = paper |
| `diary/diary.css` | built by Tailwind: never edit by hand |

After changing classes in `diary/index.html` or anything in `diary.input.css`:

```bash
npx --yes tailwindcss@3.4.17 -c diary/tailwind.config.js -i diary/diary.input.css -o diary/diary.css --minify
python3 tools/build.py && python3 scripts/check_links.py   # also refreshes the diary.css?v= fingerprint
```

Commit `diary/index.html` and `diary/diary.css` together. Diary rules: monochrome line icons only (no emoji),
icon above a short label, floating cards, Bangla first, no QR or camera scanning, no made-up contact details.

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
  All colours are tokens at the top of `assets/css/khata.css`; the header button switches day and night; with no choice saved, the site follows the device setting.

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
