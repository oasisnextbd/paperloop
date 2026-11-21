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
admin/               Paperloop Admin for the Paperloop team (hand-written; see "Paperloop Admin" below)
p/                   landing pages made in the admin (p/?page=<address>)
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
**স্কুল** (code, ID and 4-digit PIN). The role chosen there is the only dashboard they see. The header scrolls away with the page;
a floating three-line **মেনু** button stays in the corner (with the unread-notice count) and opens a menu with
notices, profile and settings, every section of that dashboard, the Paperloop website and logout; its cross closes
it back to the button. Parents and class teachers also get a floating **মেসেজ** button (with the unread
count): the parent writes to the class teacher (quick replies or a short message; "tomorrow's leave" also goes to
the teacher's attendance list), and the teacher sees a list of parents' threads, opens one and replies. Nobody
replies automatically. In the demo the threads are kept in that browser per school code
(`pl_diary_msgs_<code>`), so a parent and a teacher logged in one after the other, or in two tabs, see the same
conversation; separate phones need the backend. **প্রোফাইল ও সেটিংস** opens their details, settings (text size; absent alerts for parents; another child's
diary) and logout. Notices sit behind the menu's **নোটিশ** (with an unread count): the
principal sends to everyone, parents, teachers or one class; a class teacher sends to her class's parents.
The principal sets each class's routine; parents see it with **ব্যাগে যা দেবেন** (the books and Paperloop
khatas for that day). Teachers: the principal sets each class's class teacher and each subject's
teacher (শিক্ষক ও স্টাফ → শ্রেণি ও বিষয় শিক্ষক); a teacher logs in as themself (the demo login lists the
teachers) and works only on what they teach, in every class they teach. Subject teachers enter exam marks, the
monthly topic checks and a comment per student for their subjects; the class teacher also takes attendance, sends
class notices, answers parents' messages, writes the overall note and prints the counselling report. Results: each
subject teacher enters marks on one screen per subject (the other subjects show who teaches them and how far they
are); the class teacher publishes weekly tests, and checks the whole sheet of a model or term exam and sends it to
the principal, who publishes it (a mark changed after sending means sending again) (Bangladesh primary grading, any F means an
overall F, positions only for students who passed). Weekly tests are practice checks: they show marks only (no
grade, GPA, position or mark sheet) and count towards the monthly progress. Parents see and print the mark sheet; the principal sees
the merit list, tabulation sheet, failed subjects and a summary, and can print the first two. Monthly progress against a common minimum (the parent's
**উন্নতি রিপোর্ট**): the aim is not to be first in class but that every child reaches at least a minimum in each
subject, as in outcome-based assessment. A subject's monthly level is the average of that month's published exam
marks and the subject teacher's monthly skill check. The skill check is built from small topics (e.g. বাংলা:
যুক্তবর্ণ, বানান, জোরে পড়া, হাতের লেখা): Paperloop's common list per class and subject plus any the teacher adds
for the month; the teacher taps one of four steps per student and topic (শুরু হয়েছে / চলছে / অর্জিত / দক্ষ = 25 /
50 / 75 / 100) and the subject's skill check is their average. Topic details appear in the teacher's personal
report (with the change since last month and the topics needing most attention), its printed copy and the
principal's summary (each subject's weakest topic); parents see one bar per subject. Parents see one bar per subject with their
child's level, the minimum line and the class average (shown only when at least five students have a level; no
rank and no other child's marks), the change since last month, each subject teacher's name and comment, the class
teacher's overall note and Paperloop's practice tips (picked automatically from a fixed list for subjects below
the minimum). The **মাসিক মূল্যায়ন ও রিপোর্ট** card lets each teacher enter the skill checks and comments for
their own subjects; the class teacher sees every subject with its teacher's comment, writes the note for the
guardian and prints the counselling report; the principal's results page shows how many students in each class meet the
minimum. The minimum is the same for every partner school (agreed by the schools, moderated by Paperloop); the
demo uses a sample 60%. The grade sheet, GPA and position stay as they are. Student records: the principal sees class-wise counts, searches the class list, opens and edits
a student's profile, admits new students (they join the attendance register at once and every exam created
after) and prints the class list; the class teacher sees her class read-only; parents see their child's
record in the profile panel. Sample records have no phone numbers on purpose. Fees: the principal or office collects fees (tick the months
or fees being paid, method, optional discount or other fee) and prints a money receipt with parent and office
copies; due list, cash book and fee settings per class, with half or full waivers. Parents see what is due and
their receipts. There is no online payment; the method (cash, bKash, Nagad, bank) is only recorded. Printables
(principal): student ID cards (nine per page, blank photo box, no QR or barcode), admit cards and exam seat labels
for model and term exams, testimonial, transfer certificate (warns about unpaid fees) and achievement
certificates (an event, or the top three of an exam). Printed pages carry no demo watermark (on the
owner's decision); `demoMark` in `diary/index.html` can put one back. The login and settings are remembered on that phone until logout (browser storage).

School design (principal, **স্কুলের ডিজাইন** card): each school sets its own letterhead once, with no code
change: Bangla and English name, motto, address, phone, email, EIIN, year founded, logo and the head teacher's
name and signature (photos from the phone, shrunk in the browser), the school's colour, letterhead layout
(logo centred, logo left, name only), a colour of its own for each part if it wants (school name, title strip,
borders, ID-card band, page background, text, table lines, table headings; each left alone follows the school's
colour), certificate border, paper size (A4, Letter or Legal), ID-card fields and
validity, a footer line, and its own wording for the testimonial, transfer certificate and achievement
certificate (`{নাম}`, `{শ্রেণি}`, `{রোল}` and the other placeholders shown under each box are filled in at print
time; unknown ones are flagged). A live preview shows a mark sheet, receipt, testimonial or ID card. Every printout
uses it: mark sheet, merit list, tabulation, class list, receipts, due list, cash book, ID cards, admit cards,
seat labels and all certificates; the app's header shows the school's name and logo too. The same page sets the **app's colours**
for everyone logged in to that school (principal, teachers, parents): a main colour, an accent and a light
background. Each shade keeps Paperloop's lightness and takes only the chosen colour's hue, so text stays readable
and backgrounds stay light whatever is picked; the design page shows the draft at once and drops it if left
unsaved. The palette is CSS variables (`--ink-*`, `--gold-*`, `--paper`, `--page` in `diary.input.css`, used by
`tailwind.config.js`); printouts, their previews and the Paperloop mark always keep Paperloop's own values. Layouts fit inside both
A4 and Letter pages (phones often default to Letter), and the app no longer prints an empty extra page. In the
demo the design is saved in that browser per school code (`pl_diary_brand_<code>`); the real backend keeps it on
the school's record, with the images in file storage.

Each role's dashboard opens on its cards; a card opens its section as its own page with a back button (the
address ends in `#name`, e.g. `#fees`, so the phone's back button and a refresh work).

**Real or demo.** The diary opens clean: a school sees only what it enters itself (the principal adds teachers
and staff, assigns classes and subjects, admits students, sets fees and the school's design). The sample school
KSB with its students, marks, notices, receipts and messages appears only in demo mode, opened from Paperloop Admin
→ Simulator: `diary/?demo=principal`, `classteacher`, `subjectteacher` or `parent` logs straight in as that person;
`diary/?demo=login` keeps the login page (the test scripts use it). In demo every saved value goes to separate
browser storage (keys prefixed `demo:`), so demo use never touches a real school's. Every sample record is behind
`DEMO` in `diary/index.html` (see REAL OR DEMO at the top of its scripts).

Until the Paperloop database is connected, any ID and PIN are accepted and a school's own entries (students,
marks, attendance…) last until the page is reloaded; the design, settings and messages are kept in that browser.
The page asks search engines not to index it.

| File | What it is |
|---|---|
| `diary/index.html` | the app: one page, markup and JavaScript (edit this) |
| `diary/diary.input.css` | fonts, base styles and the floating-card / active-tile styles (edit this) |
| `diary/tailwind.config.js` | the Paperloop palette as Tailwind colours (CSS variables, defaults in `diary.input.css`): `ink-*` (navy neutrals), `gold-*` (accent), `white` = paper |
| `diary/diary.css` | built by Tailwind: never edit by hand |

After changing classes in `diary/index.html` or anything in `diary.input.css`:

```bash
npx --yes tailwindcss@3.4.17 -c diary/tailwind.config.js -i diary/diary.input.css -o diary/diary.css --minify
python3 tools/build.py && python3 scripts/check_links.py   # also refreshes the diary.css?v= fingerprint
```

Commit `diary/index.html` and `diary/diary.css` together. Diary rules: monochrome line icons only (no emoji),
icon above a short label, floating cards, Bangla first, no QR or camera scanning, no made-up contact details.

## Paperloop Admin (`admin/`)

The Paperloop team's own admin at `https://oasisnextbd.github.io/paperloop/admin/`, built after the VenGuard
team dashboard (oasisnextbd/OASIS_official_website → team-dashboard/) but for Paperloop's work. Nothing on the
website links to it and search engines are told not to list it. Plain HTML, CSS and JavaScript modules (no build
step): `admin/index.html`, `admin/admin.css`, `admin/js/app.js` (sign-in, menu), `admin/js/store.js` (data, roles),
`admin/js/ui.js` (helpers), one module per section in `admin/js/views/`.

| Section | What it does |
|---|---|
| Overview | institutions using the app, students, parents active, enquiries per day, enquiry → customer funnel, sources, upazilas, who needs a call, institutions needing attention (7 / 30 / 90 days / all time) |
| Enquiries & orders | smart-diary enquiries and khata, A4 and ring-binder orders from the landing pages, calls, visits and referrals; status, who has it, notes; a diary enquiry becomes an institution in one step |
| Institutions | schools, kindergartens, madrasas, colleges and coaching centres from enquiry to using the app; adding one gives the 3-letter school code (checked unique) and the principal's one-time first PIN, shown once |
| App usage | per institution: attendance days, results published, monthly checks, parents active, last active |
| Landing pages | pages for a campaign, an upazila or a product from a template, without a developer; publish, preview, copy the link; their form saves an enquiry marked with the page (`p/`) |
| Standard & topics | the minimum standard and topic list common to every partner school (Paperloop moderates) |
| Support | problems and requests from institutions, with an owner and notes |
| Website | the website's real settings from `site.json` (launched, prices shown, contacts set) and its pages |
| Simulator | owner only: opens the diary filled with a sample school as principal, class teacher, subject teacher or parent; switches the admin's own demo data on and off |
| Team | owner only: people and roles (Owner: everything; Operations: everything but the team and simulator; Sales: enquiries, institutions, landing pages) and a log of every change |

**Real records and demo data are kept apart.** The admin starts empty (the first visitor sets up the owner);
the made-up records in `admin/js/sample.js` appear only while the founders switch demo data on in Simulator.

**Not connected to a database yet.** Until the Paperloop database (Firebase, like the VenGuard dashboard) is
connected, records, published landing pages and their enquiries are kept in the browser where they were made
(`localStorage`: `pl_admin_live_v1`, demo `pl_admin_demo_v1`), and people sign in by picking their name; the
admin says so in its menu. Connecting it means: a Paperloop Firebase project, Google sign-in for the team list,
database rules per role, and the diary and landing pages reading and writing the same records.

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
