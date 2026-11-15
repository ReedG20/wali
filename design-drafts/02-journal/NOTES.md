# 02 — Journal

## Concept
Mind is framed as the memoir of your days. The landing page is laid out like the first issue of a small literary magazine: a dateline and masthead, a cover story with a plate of the pendant (Fig. 1, with lettered annotations), a lead article with a drop cap and footnotes, a pull quote that is a real nudge, numbered sections (§ 1–5), an index of real margin notes (N°01–N°07), privacy written as numbered clauses, letters from beta wearers, and a colophon. The app is a notebook. Each day is a numbered page, and the chat reads as a written dialogue with speaker labels (MIND / YOU) in a left gutter. Insights sit in the right margin as numbered marginalia keyed to superscripts in the text. Nudges and approvals are boxed, typeset "notes" with clear buttons. A second view, Conversation notes, shows the facts of a conversation, the gist, key moments, a transcript excerpt and follow-ups Mind drafted.

## Tokens
| Token | Value | Use |
|---|---|---|
| `--paper` | `#F2EDE3` | Newsprint ground, plus a faint SVG grain |
| `--paper-deep` | `#E8E1D3` | Draft blocks, hover and active rows |
| `--ink` | `#161412` | Text, rules, primary buttons, waitlist ground |
| `--ink-2` / `--ink-3` | ink at 70% / 48% | Secondary text and metadata |
| `--rule` | ink at 20–22% | Hairlines |
| `--accent` | `#CF3A1F` vermilion | The **only** accent: kickers, footnote numerals, drop caps, MIND label, the pendant LED, promises |

| Role | Face | Notes |
|---|---|---|
| Display | **Bodoni Moda** (opsz 6–96), 500 roman and 400 italic | Masthead 84–212px, H1 46–98px, section numerals, notes in quotation. Line-height .82–1.05, tracking −.02 to −.035em |
| Book | **Newsreader** (opsz 6–72) | Body 18–19px / 1.55–1.6. Italic for standfirsts, user lines and quoted nudges |
| Metadata | **IBM Plex Mono** 400/500 | 11px uppercase, +.14em tracking, used for datelines, labels, timestamps and buttons |

Rules: a 3px + 1px double rule for mastheads, a 1px ink rule under section heads, and hairlines between rows. Corners are square everywhere (radius 0). Buttons are mono caps in an ink box: filled for primary, outlined for secondary, plain text for dismiss.

Grid: 12 columns, max width 1320, 28px gutters, 40/24/16px side padding. The app page grid is 96px speaker gutter | text column | 250px margin.

## Stolen from
- [Waka Waka, furniture index](https://mobbin.com/sites/sections/fe089d5d-5adb-4849-a282-ae46d8fd7eac): the `N°0001` numbered index rows with no boxes, only rhythm, and the masthead built from a small left label, a centred comma-separated nav ("Furniture, Index, Studio") and a live location clock with a dot on the right. I used it for the dateline and the N°01–07 use-case index.
- [Ragged Edge, quote](https://mobbin.com/sites/sections/b807baf8-e3c7-4d56-ac7c-fb40b03cfe77): quote marks hung in the outer gutters, a hairline above, a large serif quote and a plain two-line attribution with no avatar. I used it for the TikTok pull quote.
- [Frontify, footer](https://mobbin.com/sites/sections/173c1f1f-52a3-49ab-861b-38d6846d6453): an oversized serif placeholder sitting on a single underline with a small "Submit →" text button on a dark ground. I used it for the waitlist.
- [Typesafe AI, research section](https://mobbin.com/sites/sections/d4099f10-4742-4a2c-871f-b342ff8943b6): columns that each start with a 1px vertical rule on the left and a tiny mono label, with body text below. I used it for the three How-it-works columns.
- [Escape Cafe, steps](https://mobbin.com/sites/sections/68d54554-65f5-4fd2-a974-c30e7c9eaffc) and [Beside, how it works](https://mobbin.com/sites/sections/2cfd3169-f61f-4ca5-bd2a-67627febbc84): a small numeral plus a mono label sitting above a heavier title, under a top rule. I used this for the step labels and the "specimen" blocks.
- [KOBU, stories](https://mobbin.com/sites/sections/f5959421-5ded-4adb-98db-49143db77839): a mono small-caps kicker before a serif title. I used it for "N°02 — On your behalf" and the spread headlines.
- [Framer, legal](https://mobbin.com/sites/sections/f5d87df7-a5fe-4a58-9ea0-34d5fb07b9b1): inline "6.1" clause numbering with a bold lead-in. I used it for the privacy clauses 3.1–3.6.
- [Daylight, hero](https://mobbin.com/sites/sections/a934cc95-697d-4051-8d07-16e8d1a75e34): roman and italic mixed inside one headline. I used it for "Mind *reads it back* to you".
- [Pi, web chat](https://mobbin.com/screens/294eacae-d0ec-44b3-aad4-96162df61ddb): chat as plain serif paragraphs on warm paper with no bubbles, and a thread list set in serif. This is the base of the notebook dialogue.
- [ChatGPT iOS, approval](https://mobbin.com/screens/760a26c6-bcae-480a-8757-7e58d975ea7b): the approval anatomy of a question, the exact payload previewed, then filled primary, outline secondary and quiet deny. I used it for the "For your approval" notes, with the draft text shown verbatim.
- [Amie, transcript](https://mobbin.com/screens/0a4f60ca-2103-4f99-b796-d584637f07cb): key/value metadata rows (Created, Meeting, Audio, Share) above the transcript, and timestamp + speaker label lines. I used it for the When/Where/Speakers/Consent/After facts and the key-moment rows.
- [Descript, transcript](https://mobbin.com/screens/d8890138-6ec9-455a-9a09-271e7a3dcf30): speaker labels set apart from the spoken text, and inline section headings within the transcript. I used it for "III. From the transcript".
- [Fireflies, meeting notes](https://mobbin.com/screens/b7b4cfbb-afd6-49c0-928a-8692e2354ae7): a summary and notes column with a companion column beside it. I used that split for gist and transcript on the left, follow-ups on the right.

## Files
- `landing.html`, `app.html` (Notebook view plus Conversation notes; open `app.html#notes` to land on the second view)
- `shot-landing.png` (1440), `shot-landing-mobile.png` (390), `shot-app.png`, `shot-app-notes.png`, `shot-app-mobile.png`
