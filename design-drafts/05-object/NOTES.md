# 05 — Object

## Concept
Mind is presented as a piece of hardware you'd actually want to own: a bone-coloured ceramic pebble on a cord, drawn large with a technical-drawing treatment (labelled leader lines, figure numbers, an engraved serial on the rim) and paired with an honest spec sheet (14 g, 1 day, 0 screens). The page sits on a warm bone ground with a visible 12-column hairline grid and `+` registration marks at every section corner. One signal colour, safety orange, marks anything that is live: the LED, nudges, switches that are on, and the main CTA. The humour comes from the spec sheet ("IP54: rain, sweat, and the occasional soup"). Tactility comes from keycap buttons with a hard bottom shadow, toggle switches with grip ridges, LEDs and segmented meters. The app continues the idea as "Mind OS": a modular panel layout where Mind talks in compact labelled blocks (NOTE / NUDGE / ACTION / SIDEQUEST). Approvals are physical: you flip a switch to arm a send, and only then does the SEND key become pressable.

## Tokens
**Type**
- Display and body: **Bricolage Grotesque** (variable; display uses `wdth 88–92`, `opsz 96`, weight 600–620, tracking −0.025 to −0.035em)
- Technical: **IBM Plex Mono** 500/600, set uppercase at 10.5–12px with +0.06–0.08em tracking for labels, tags, keycaps and logs
- Scale (landing): hero 100 / section 62 / waitlist 76 / tile figure 76 / module h3 30 / body 17 / label 11
- Scale (app): page h1 44 / thread h1 22 / block body 15.5 / body 15 / label 10.5

**Colour**
| token | value | use |
|---|---|---|
| `--bone` | `#EBE7DF` | page ground |
| `--paper` | `#F6F3EE` | blocks, cards, keycaps |
| `--panel` | `#E1DCD2` | recessed panels |
| `--ink` | `#1D1C1A` | text, borders, key shadows |
| `--ink-2` / `--ink-3` | `#55514A` / `#8A857B` | secondary / meta |
| `--line` / `--line-2` | ink at 15% / 32% | hairlines / dashed separators |
| `--signal` | `#FF5B1A` | the only accent: LED, live, primary |
| `--signal-deep` | `#E2470B` | orange text on light |

**Shape:** modules and blocks use 4px radii, keycaps 6–7px, switches 5px. Borders are 1px ink on blocks and 1.5px on keycaps, with a hard `0 2–3px 0 ink` key shadow. Hairline grids are 1px at 15%, and dashed rules separate a block's header from its body.

## Stolen from
- [Telepathic Instruments: marquee and feature list](https://mobbin.com/sites/sections/e19b1448-2e4b-4614-b64d-9f2cda0540c5?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the orange mono-caps ticker bar at the very top, and the general mood of a bone ground with a single hot orange.
- [Telepathic Instruments: "More features"](https://mobbin.com/sites/sections/07566f40-60ea-44ae-83fc-7877486b564a?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the cheeky parenthetical tone and the hairline-ruled rows on bone.
- [Rains: jacket with callouts](https://mobbin.com/sites/sections/0c9ca7d4-3523-44f2-93cf-ee3137acc9d7?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the callout anatomy on the hero pendant (tiny grey label over a short bold line, placed around the object). I added leader lines and numbers.
- [Robot.com: spec bento](https://mobbin.com/sites/sections/ad0c9bfe-fff7-4860-a242-a648e0b691d6?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): "The object" bento, with a big figure plus a boxed unit chip (`70 [L]` → `40 [min]`), a segmented battery glyph and a top-left label in each tile.
- [Heron AI: use-case accordion](https://mobbin.com/sites/sections/7fb39024-7787-4326-9985-98fa69c6b46b?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a half-and-half split with a graphic orange-circle-and-bar composition on the left and an uppercase condensed accordion with dashed dividers on the right.
- [Heron AI: dotted frame](https://mobbin.com/sites/sections/a9d85ab3-0d19-447b-b151-40273c241f61?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the dashed inner frame with `+` corner marks on the waitlist block.
- [Cartesia: gridded feature section](https://mobbin.com/sites/sections/048ef43b-a39f-44ad-aa67-0eeacae5391b?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the visible hairline grid with crosshair marks where section rules meet the frame.
- [FREITAG: "How it works" boxes](https://mobbin.com/sites/sections/2b1fed6e-e318-443c-8657-b11037baa0ad?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): module headers as `■ LABEL` in mono, in boxes that share borders. Used for the three How-it-works modules and every app panel header.
- [Rivian: specs](https://mobbin.com/sites/sections/4e15c487-5553-4441-a9d7-29331a22361d?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the label-over-value spec cell rhythm in the six-up spec strip under the hero.
- [In Common With: tech specs table](https://mobbin.com/sites/sections/6c5ddd6d-bd8e-4cbf-9616-8016064f2bdc?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the two-column key/value table with hairlines in the privacy section.
- [MOUTHWASH Studio: footer](https://mobbin.com/sites/sections/082f5fac-4648-4314-aa7d-a06fe0235b77?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the full-bleed giant wordmark footer with small address-style text set against its baseline.
- [Superpower: bracket buttons and mono header](https://mobbin.com/sites/sections/59bd2530-f395-46f0-98ef-2a6632ef6fdf?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the mono "designed & assembled in" voice that runs through the footer and fig labels.
- [Zapier Central: chat with action block](https://mobbin.com/screens/cb65c41e-e7b6-4bd9-af40-cd92d768e90d?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the anatomy of an inline action block in chat (label row, the action, then status), which became the ACTION blocks.
- [Twingate: device profile toggles](https://mobbin.com/screens/e1c88a68-80a6-4a4d-beac-657bba994932?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): rows of title, description and a right-aligned toggle inside bordered cards, used for the privacy switchboards.
- [WHOOP: plan overview](https://mobbin.com/screens/c6c9906c-9389-4654-b801-64f7bad865ae?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the M–S week row of circles (filled, outlined, today, future) and the x/y ring on the habit tiles.
- [hilos: home dashboard](https://mobbin.com/screens/1c593edf-86c0-4da3-9b6d-f5a50637e1ab?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the four-up stat strip above modular tiles in the Sidequests view, reworked from candy colours to bone with one orange tile.
- [Ghost: hero](https://mobbin.com/sites/sections/368430fe-371e-421b-a59e-13b93088ec48?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): proof that a warm grey ground, a small orange "order now" and lots of air can make hardware feel premium. It set the restraint level.
