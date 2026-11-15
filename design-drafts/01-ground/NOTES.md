# 01 · Ground

**Concept.** Mind presented as a premium consumer-hardware launch rather than a wellness app. The palette comes from soil and stone: oat and bone paper, deep moss, a dusty olive landscape, and terracotta used sparingly as the pendant's single "light". An elegant display serif carries the emotional lines ("A quiet companion *for a busy mind.*") and a clean grotesk handles everything functional. The pendant is the hero object: a ceramic disc with a steel rim on a two-strand cord, drawn in SVG. It hangs and sways slowly over a contour-line "ground" and appears again in the specs panel and the app's device card. The app is a calm chat companion. Mind's messages breathe (15.5/1.66 type, 30px rhythm), nudges are quiet notices with one action, and anything that acts for you arrives as a structured approval card. Restraint is the brand: one accent colour, hairline borders, generous whitespace, mono micro-labels, no gradients except the landscape.

## Files
- `landing.html`: hero, statement, how it works, moments (use cases), hardware/specs, privacy, quote, waitlist, footer
- `app.html`: Today (chat with inline nudges, auto-action receipt and approval card, plus a right "Right now" rail) and Your week (mood/energy timeline, stats, relationship energy, patterns). Switch views in the sidebar; `app.html#week` opens the week view directly.
- `shot-landing.png`, `shot-landing-mobile.png` (true 390px via iframe), `shot-app.png`, `shot-app-week.png`

## Tokens

**Type**
- Display: Instrument Serif 400 + italic. Hero is `clamp(54px, 8.4vw, 124px)` / .92 / -0.018em. H2 is `clamp(40px, 5vw, 72px)` / .98. H3 is 32px. In-app headings are 23–32px.
- UI: Geist 300–600. Body is 16–17px marketing and 15–15.5px app, line-height 1.55–1.66. Stat numerals are Geist 300 at 30px.
- Micro-labels: Geist Mono 10.5–11px, uppercase, 0.13–0.14em tracking.
- Ratio: roughly 1.5× steps from 11 → 16 → 24 → 32 → 48 → 72 → 124.

**Colour**
| token | hex | use |
|---|---|---|
| `--oat` | `#F1ECE2` | page background |
| `--bone` | `#F8F5EE` | raised cards, composer |
| `--side` / `--sand` | `#EAE4D8` / `#E5DDCE` | sidebar, user bubbles, hardware panel |
| `--ink` | `#221E19` | warm near-black text |
| `--ink-2` / `--ink-3` | `#5C554B` / `#8D8578` | secondary / tertiary text |
| `--moss` | `#37432D` | primary buttons, privacy block, Mind mark |
| `--moss-2` / `--olive` | `#56664A` / `#7D8762` | charts, "restores" |
| `--sage` | `#DCE0CC` | success, restore tags |
| `--clay` | `#B5603A` | the one accent: pendant LED, "needs your OK", "drains" |
| `--line` | `rgba(40,33,24,.12)` | 1px hairlines everywhere |

**Shape**: radii 24 (sections), 18 (cards), 12 (inner boxes), 999 (buttons and chips). Borders are always 1px hairlines. Shadows appear only on floating or actionable cards (`0 18px 40px -28px`).

## Stolen from
- [Frontify: hero](https://mobbin.com/sites/sections/9dc7cb3d-08cc-4c17-bb89-4373060676f2?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the hero grid, with a 2-line serif headline across about 8 of 12 columns, a short paragraph plus one dark pill button in the right 4 columns, and lots of paper around it.
- [Daylight: hero](https://mobbin.com/sites/sections/a934cc95-697d-4051-8d07-16e8d1a75e34?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): mixing roman and italic serif inside one headline, a tiny eyebrow above it, and the idea of a warm hardware object as the hero.
- [Creative Intelligence Company: hero](https://mobbin.com/sites/sections/9302d47d-224a-4e77-85c7-eec1f3971a94?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): headline on oat, then a full-width rounded image container directly below it that holds the object.
- [Ghost: hero/nav](https://mobbin.com/sites/sections/fd53f470-31bd-415e-8b00-0b01296989f3?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the nav anatomy, with tiny text links left, a centred wordmark and a single coloured text CTA right ("ORDER NOW" became a clay "Join the waitlist →").
- [Norma: how it works](https://mobbin.com/sites/sections/96f4183b-7eb5-437c-90ad-95d1306d320c?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): three equal cards, each with a number in a small outlined circle, a title, one line of copy, a hairline divider, and a visual filling the lower half.
- [Kastle: use cases](https://mobbin.com/sites/sections/90e05d93-3ed0-482a-b8fd-b97884141162?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the three-part use-case layout of a framed visual (outer hairline frame plus inset tinted panel with concentric rings), a serif list where only the active item is full ink and the rest fade, and a short description in a third column. Also the outlined pill section label.
- [Daylight: product specs](https://mobbin.com/sites/sections/5d57fbff-5355-4f3d-91b4-eff403615a2d?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): spec columns with serif headings and dotted-rule rows on a warm background.
- [Campsite: private and secure](https://mobbin.com/sites/sections/7dd8f0d7-cc02-4852-8557-7eaf89de6fa7?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a dark rounded block with a centred small icon, big headline and muted subline. I extended it with a 4-up hairline grid that bleeds to the block's edges.
- [Swap: testimonial](https://mobbin.com/sites/sections/55081658-a203-4eab-817a-becdce00b7c3?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a large light serif quote centred over about 10 columns, a small-caps name and role, and outlined round arrow buttons pinned to the far edges.
- [Grail: waitlist](https://mobbin.com/sites/sections/54ed2f4c-f8b7-4863-acc6-82aa7335da04?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a giant serif email placeholder sitting on a single full-width rule, with a tiny reassurance line under it. Flipped from dark to oat.
- [Structured: footer](https://mobbin.com/sites/sections/cf954a98-4f2e-41d3-b2a1-168e4ba0108d?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a giant serif wordmark across the footer with tiny uppercase links above and below.
- [Perplexity: chat](https://mobbin.com/screens/b16cbdbd-08e2-4281-b334-19f52585ef1c?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): chat anatomy, including a centred ~700px column, user bubbles right in a soft fill, small grey "step" lines with icons above the assistant's answer ("Read your calendar · 6 events"), the composer with + and mic, and the right rail of small cards.
- [Pi: threads](https://mobbin.com/screens/294eacae-d0ec-44b3-aad4-96162df61ddb?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a warm tinted sidebar with a serif title, the active item as a raised light card, and a very quiet conversation canvas.
- [Claude: question card in chat](https://mobbin.com/screens/34aa9592-2138-4be6-95f6-4aa7410e9bb9?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp) and [Unify: confirm setup](https://mobbin.com/screens/eb0a7d62-597b-44ef-a6cc-4807476300ea?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the approval card anatomy, an inline card with a header, hairline-separated rows, and a footer with actions left and context right.
- [Zapier Central: action complete](https://mobbin.com/screens/cb65c41e-e7b6-4bd9-af40-cd92d768e90d?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the compact "Action complete" receipt row, used for things Mind did on its own, with Undo.
- [Airbnb: Trips notices](https://mobbin.com/screens/d3a8ceec-6af8-4f17-8e78-a9526936ac10?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the nudge card, with an icon in a tinted circle, a medium-weight title, a muted body, and one clear action.
- [Clay: home with Reconnect rail](https://mobbin.com/screens/f7cf12b6-2be7-4da4-b3cf-16884e45306e?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): grouping conversation history by Today / This week / Earlier, and the idea of a people list with relationship actions.
- [Apple Health: sleep highlights](https://mobbin.com/screens/6af952f2-8cea-4a40-a3ef-beaac81bf421?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the "highlight" pattern on Your week, a small coloured label with an icon over a single plain-language summary sentence, then the chart.

## Known weaknesses
- Instrument Serif's "1" reads like "l" at display sizes, so stat numerals use Geist instead. Watch for this anywhere numbers go large and serif.
- The use-cases section leaves the description column floating at the far right on wide screens. It's faithful to Kastle but reads a little sparse.
- People and Memory in the app sidebar are placeholders with no view.
- The pendant is one stylised drawing. It shows no depth or thickness, and there are no lifestyle shots on a body.
- The mobile week chart scrolls sideways inside its card rather than being redrawn for narrow screens.
