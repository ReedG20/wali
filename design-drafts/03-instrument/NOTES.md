# 03 — Instrument

## Concept
Mind treats your headspace as a measurable signal, the way performance wearables treat the body, and then makes that signal warm. The page is a dark espresso near-black, not blue-black. A single luminous amber accent marks "now" and "live", and four validated state colours (focus, social, drift, rest) carry the data. Everything is set in a precise grotesk with tabular mono numerals. The hero is a living 24-hour dial: the outer ring is today coloured by state, the inner arc is Clarity (0–100), a hand marks the current minute, and a live waveform scrolls beneath it. The supporting sections read like a spec sheet, a trace viewer and a flight-recorder ledger. In the app, Chat is the core: Mind's replies embed data cards, proposals with risk meters, and auto-action receipts. Today, Patterns and People are dashboards with honest, labelled charts.

## Files
- `landing.html`: marketing page (hero dial, live signal, stat row, stacked traces, how it works, pendant spec, 7 use cases, privacy ledger, waitlist, footer)
- `app.html`: web app. Rail nav plus four views: Chat (default), Today, Patterns, People. Keys T / C / P / E switch views, and hashes `#today`, `#patterns`, `#people` and `#card` deep-link.
- `shot-*.png`: final self-review screenshots at 1440 desktop and 390 mobile. The 390 shots are rendered through a 390px iframe, because headless Chrome clamps its window to 500px.

## Tokens
**Type**
- Sans: Geist 300/400/500. Mono: Geist Mono 400/500, `font-variant-numeric: tabular-nums` on every number.
- Landing: H1 76/0.98, −0.04em, weight 500 · H2 48/1.02, −0.035em · lede 19/1.5 · body 16/1.55 · stat numerals 44 weight 300, −0.04em · hero readout 132 weight 300, −0.06em
- Labels: mono 11.5px, uppercase, +0.08em, ink-3
- App: base 14/1.5 · tile numerals 48 weight 300 · chat text 14.5/1.6 · mono meta 10.5–11.5px

**Colour**
| token | value | use |
|---|---|---|
| `--bg` | `#13100D` | espresso page |
| `--bg-2` | `#181410` | cards, inset areas |
| `--panel` | `#1A1612` / `#1C1814` | app main panel |
| `--raised` | `#231E19` | active nav, user bubble |
| `--line` / `-2` / `-3` | `rgba(240,226,204,.08/.14/.22)` | hairlines |
| `--ink` / `-2` / `-3` / `-4` | `#EFE7DA` `#B3A897` `#7E7468` `#544B42` | text ramp |
| `--accent` | `#F2A649` | luminous amber: now, live, clarity, primary action |
| `--focus` | `#C78428` | state |
| `--social` | `#2E9E86` | state, positive energy |
| `--drift` | `#C2523F` | state, negative energy |
| `--rest` | `#7085D6` | state |

The four state colours were run through the dataviz validator (`validate_palette.js --mode dark --surface #1B1713`) and pass every check: L band, chroma, CVD ΔE 9.5, normal-vision ΔE 19.2 and contrast. The order is fixed at focus, social, drift, rest. The drift heatmap uses one sequential hue ramp from that drift colour.

**Shape**
- Radii: 6 (chips) / 10 (mini cards) / 12 (app cards) / 14 (landing cards) / 999 (pills)
- Borders: 1px warm hairlines everywhere, no shadows except the tooltip.
- App shell: the rail sits on the page bg, and the main panel is inset 8px with a 12px radius (Linear).

## Stolen from
- [Vercel — "Where the modern web and AI run"](https://mobbin.com/sites/sections/a8be34c7-cd94-4d72-8ec3-dc6dfbc7a277?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): stacked live signal lines with mono query chips pinned to points (`WHERE app = "TikTok"`, `PEAK 86`), and the 4-up stat row (light numerals over an uppercase label over a body line). Used in the landing "Signal" traces and the hero stats.
- [Rivian — performance stats](https://mobbin.com/sites/sections/ed9d5be0-1367-4816-b28a-c0f3478a31ff?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): big numerals with a small trailing unit (`2h 14m`, `86 peak`) set directly on a dark ground, with no cards. Used in the hero stat row.
- [My BMW — charging ring](https://mobbin.com/screens/68f8697d-e813-43c5-b62a-7a6f69094b8e?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a ring gauge with a tip dot, the huge numeral with a superscript unit, and a secondary context line under it. This became the hero dial centre (`68/100`, "−9 since 21:00") and the app gauges.
- [Linear — numbered pillars](https://mobbin.com/sites/sections/11fa0cf7-8a9c-41f1-b38f-66918fac01f4?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): `1.0 Intake`-style mono indices, 4 columns split by hairline verticals, title then body. Used for "How it works" (1.0 Listen … 4.0 Act).
- [Linear — app shell](https://mobbin.com/screens/720724d3-f686-457f-8c00-fa7efa409b12?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the sidebar sits flat on the page and content lives in an inset rounded panel with a 1px border. Also its small grouped section labels and dense 32px nav rows.
- [Joby Aviation — spec summary](https://mobbin.com/sites/sections/bf44b5c4-7680-4935-9430-4488a7be61cf?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a stacked tab list (active in ink, the rest dimmed), a "Fig. x.x" caption over a line drawing, and a hairline two-column spec table. Used for the pendant section.
- [Spade — hero](https://mobbin.com/sites/sections/9b6f664a-b824-4de5-9b81-54126c6a391e?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp) and [Spade — industries](https://mobbin.com/sites/sections/24be4dcb-f6d5-4d86-96fb-eac6eb912911?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the grotesk headline with the last phrase in the accent colour ("your *pulse.*"), and the `[ BRACKET ]` mono card labels on use-case cards.
- [Grail — waitlist](https://mobbin.com/sites/sections/54ed2f4c-f8b7-4863-acc6-82aa7335da04?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a giant light placeholder input on a single hairline, corner labels ("Get in early" / "Batch 01"), and the mono fine print under it.
- [Cosmos — footer](https://mobbin.com/sites/sections/277145c1-b152-4185-ba3a-5568988cc33a?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a tagline left, dim uppercase column heads, and a giant low-contrast warm-grey wordmark cropped by the page bottom.
- [Cloudflare — analytics](https://mobbin.com/screens/59f5d9b0-1491-4a8b-a0ea-20a27682dfd5?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp) and [Cloudflare — observability log](https://mobbin.com/screens/cbf28d46-8663-4731-a826-179bc4f0fb16?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): log rows with a coloured left bar, a mono timestamp, a type chip and a message. Used in Today › Moments.
- [Sentry — trace preview](https://mobbin.com/screens/16987d18-5642-44bf-a645-4b326df775a6?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): span bars on a shared time axis with labelled vertical markers. Used in the Today day timeline (state lane, clarity lane, nudge diamonds, NOW marker).
- [Origin — invest](https://mobbin.com/screens/83c3b3ee-ba90-4d81-a860-84c4dbafcfed?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a legend row of dot + label + big value + delta above the chart, right-side axis labels, a dotted benchmark line, and timeframe pills. Used in Patterns.
- [Plain — reporting](https://mobbin.com/screens/e892500e-f820-4e3e-af83-973bf50ed22e?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a value with muted context ("6 in todo right now") and a dashed average reference line inside small charts. Used in the Today tiles (7-day avg lines).
- [Substack — Polymarket embed](https://mobbin.com/screens/cd548805-e0ca-4812-9c5e-4058fc135fa2?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): in-chat data card anatomy, with title, rows of label / value / delta chip, and a footer with the source plus one action button. Used for the "Drift today" card in Chat.
- [Dropbox Dash — chat](https://mobbin.com/screens/f4ca9d48-c17a-40e5-98a2-f3a293483967?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the "worked" step line with source chips above the answer ("✓ Read 15h of your day · pendant · screen time · calendar").
- [Spellbook — proposal card](https://mobbin.com/screens/e64a202c-7ac8-41a2-b595-80a70014797b?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): an inline proposal with a mono status tag top-right, a body, and a footer of Discard / secondary / dark primary. Used for the "Move 1:1 with Sam" approval.
- [Notion — agent settings](https://mobbin.com/screens/39684b6e-3307-402e-bdaf-7a0f3e668673?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the dot-pip meters ("Speed ●●●○○"), reused as the Reversible / Seen by others / Cost risk meters on approvals.
- [Unify — chat](https://mobbin.com/screens/dc504d2e-37e9-47a3-b697-386da8e99cd4?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): a bordered follow-up suggestion list with `↳` rows under the last reply.
- [Attio — people](https://mobbin.com/screens/bf242a4f-6a4e-456f-8653-23bc7aa8dd2a?utm_source=claude&utm_medium=ai-assistant&utm_source_platform=mcp): the "Connection strength" column (coloured dot + word), last-interaction column and count footer. Used as Energy (Restores / Neutral / Drains) in People.
