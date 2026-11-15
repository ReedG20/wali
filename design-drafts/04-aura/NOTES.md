# 04 — Aura

**Concept.** Colour is mood. Mind is described as *weather for your head*: the paper-light background carries slow, blurred, multiplied colour fields (peach, dusk rose, sage, pale sky) with a fine grain, so it reads like late-afternoon light on a wall rather than a tech gradient. Everything on top stays flat and crisp: cream cards, hairlines, ink pills. One soft serif (Fraunces with the SOFT axis at 100) carries the voice. Mind's own words in the chat are set in it, as on Pi and Perplexity, so the companion sounds human and the UI chrome stays quiet. Each state has a colour (calm = sky, focused = sage, social = peach, drained = rose), and that colour drives the aura behind the chat, the "Now" chip, the history dots, the day band and the people swatches. The pendant is drawn as a ceramic disc with a glowing core that takes the current state colour.

## Files
- `landing.html`: hero (necklace and pendant over the aura), a day told in nudges (lyrics-style, colour follows the active line), how it works (giant numerals), the pendant on a peach plate with window-light shadows, use cases (tabs, an aura panel and a real UI card), privacy, waitlist, and the footer wordmark.
- `app.html`: Chat (forecast header, inline approval card, auto-done card, nudge card, follow-up chips, and a composer with a breathing pendant orb and a pause control) and **Your day in colour** (a painted band with a "Now" line and a hatched forecast after it; hover shows a tooltip, click shows "What happened" and recolours the aura; a legend with totals; and a People list with energy swatches). Plain JS tabs; `app.html#day` opens the second view.
- `shot-landing.png`, `shot-landing-mobile.png` (true 390px via an iframe wrapper), `shot-app.png`, `shot-app-day.png`, `shot-app-mobile.png`

## Tokens
| Token | Value | Use |
|---|---|---|
| `--paper` | `#F6F0E8` | page |
| `--paper-2` | `#FBF7F1` | cards, nav, composer |
| `--paper-3` | `#EFE6DB` | segmented controls, secondary buttons |
| `--ink` / `--ink-2` / `--ink-3` | `#2B2521` / `#5E544D` / `#8C8179` | text, primary buttons |
| `--line` | `rgba(43,37,33,.12)` | hairlines |
| calm / sky | `#A8C5DB` | |
| focused / sage | `#AFC3A0` | |
| social / peach | `#F3B48D` | |
| drained / dusk rose | `#DE9E9A` | |
| gold (sidequests) | `#F0CF93` | |

- Aura recipe: 3–4 blobs of `filter: blur(70–90px)` with `mix-blend-mode: multiply` over cream, drifting slowly on 26–34s alternate keyframes, plus long rotated "brush streak" ellipses and an SVG `feTurbulence` grain at 13–16% opacity. Reduced motion stops all of it.
- Type: **Fraunces** (SOFT 100, weights 200–400) for display, Mind's voice and numerals; **Figtree** 400/500/600 for UI. Hero at 148px/0.92 with -0.035em tracking, section heads 56–88px, app headers 40–48px, Mind's chat text 18.5px/1.5, UI 13–15px.
- Radii: frames 28px, cards 18–22px, buttons and inputs in pill shapes, segmented controls 11/8px.

## Stolen from
- [Microsoft AI hero](https://mobbin.com/sites/sections/057209db-db9a-4f89-9eba-2f4144f1f099?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the whole hero idea, with blurred painterly peach brush-stroke fields, a centred light serif headline with an italic first word, a cream floating nav inset from the edges, and a small pill chip pinned bottom-left (it became the "Now · mostly calm" forecast).
- [Daylight feature section](https://mobbin.com/sites/sections/3ffb34f4-4713-4a4d-a05e-d18961771f0b?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): late-afternoon peach backdrop with diagonal window-light shadows, a product plate with a 6px radius, and a row of three specs (thin line icon, bold title, two grey lines).
- [Inkwell hero](https://mobbin.com/sites/sections/d3d530a1-2a62-4ccf-8fec-ac7f8427f6e4?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the hero as a rounded inset frame with a small page margin, and the peach-to-sky vertical gradient.
- [Apple Music lyrics screen](https://mobbin.com/screens/7879ac4d-8a50-4960-b5a6-506157d7d67b?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): "A Thursday, with Mind", with one line in full ink, the others dimmed and blurred, auto-advancing, and the ambient colour taken from the active line.
- [The Weather Channel home](https://mobbin.com/screens/78c29392-3361-437a-acad-a49557cb5d95?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the sentence-headline "It's 82° and mostly cloudy" became the app's "It's late afternoon and you're *mostly calm*…", followed by an hourly row, rendered as a mood forecast with dashed future states.
- [Trawelt how-it-works](https://mobbin.com/sites/sections/629aae31-4a94-46df-a97f-3180a6ae22e0?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a mixed serif-light/sans headline, large body text, and rows with a 1px ink top rule, a small label bottom-left and a huge numeral bottom-right.
- [Claude "How you can use Claude"](https://mobbin.com/sites/sections/23be18aa-c7f2-4b79-b1b2-80339c15c960?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a centred serif title, a compact segmented tab pill (icon + label, here a colour dot), a big coloured rounded panel and a cream card overlapping it.
- [Acctual use cases](https://mobbin.com/sites/sections/5a7c66af-951e-4d6a-b756-5471190a073a?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the second-person micro-story told in short plain sentences, beside the tabbed card.
- [Shop privacy](https://mobbin.com/sites/sections/a7b1096b-331c-4a63-9a4d-f33edd5d13d6?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a small-caps eyebrow, a huge two-line centred headline, then columns with large headings divided by vertical hairlines.
- [ISO Meet waitlist](https://mobbin.com/sites/sections/c494bf4c-177f-4b26-830f-1168406fd48f?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a centred object above a two-line heading, a grey subline, a pill input with an ink pill button, and an avatar-stack social proof line.
- [Pally waitlist](https://mobbin.com/sites/sections/e896962b-08ae-4b1b-beb9-5dfc0c7c0275?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): colour glowing up from the bottom edge of the waitlist card.
- [Structured footer](https://mobbin.com/sites/sections/cf954a98-4f2e-41d3-b2a1-168e4ba0108d?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a full-width serif wordmark, tiny uppercase legal links underneath and link columns top-right.
- [Pi web chat](https://mobbin.com/screens/294eacae-d0ec-44b3-aad4-96162df61ddb?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): warm cream canvas, the assistant speaking in serif with no bubble in a narrow centred column, and a soft pill composer.
- [Perplexity thread](https://mobbin.com/screens/b16cbdbd-08e2-4281-b334-19f52585ef1c?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): small grey icon step lines between turns ("Heard standup…", "Noticed…"), user turns as a right-aligned light bubble, and a composer with in-line controls.
- [Manus confirmation card](https://mobbin.com/screens/5f1e26ff-a7aa-426a-9510-fa2928315f24?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): approval-card anatomy, with the content to review inside the card, a full-width ink primary and a soft secondary, and a coloured status line underneath ("Mind is waiting for you. Nothing has been sent.").
- [TikTok Tako scheduled task](https://mobbin.com/screens/35a0dbcf-aa3a-4e49-87e3-87e53fdfdf27?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the compact "done" card (small label, bold title) and the follow-up chips with trailing arrows.
- [Attio people table](https://mobbin.com/screens/a4af9ac6-197f-49e0-80d4-f3b8f209616a?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the "Connection strength" pattern of a coloured dot plus a plain label, reworked as relationship energy ("Restores you", "Drains you lately") with recent-interaction swatches.
- [Square workday timeline](https://mobbin.com/screens/9eba6531-f7ba-44e9-b6c0-07ccf28d85c8?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): soft pastel bars on an hour axis, with a legend of small square swatches below.
- [Jomo "Most used"](https://mobbin.com/screens/1e81e6f2-25ef-4787-8471-1fc3448d9688?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): legend items with a label, a duration on the right and a thin proportional bar underneath.
