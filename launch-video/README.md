# wali launch video kit

UI overlays, brand pieces and grade tests for the launch video, built from the web app, the iOS app and the landing page.

```sh
bun install
bun run dev          # http://localhost:5190 (Chrome 157+; liquid glass needs WebGPU)
```

## What's inside

| Sidebar | What it is |
|---|---|
| iOS notification (glass) | Liquid Glass push banner via liquid-dom. Grows from the Dynamic Island or slides down; the long-press action menu peels out of it. Six scene presets. |
| Agent task (glass) | Live-Activity-style card: steps tick through quickly, can pause on "Needs your OK", and can grow out of the notification. |
| Pendant listening | Ember "Listening" pill that turns into "wali noted · …" (sets up a later nudge). |
| Chat · iPhone / Web app | The app's home thread: typing, Thinking, tool chips, streamed markdown reply. |
| End card / Chapter title | Catchline then wordmark; time-stamped chapter titles. |
| Color grades | 5 LUTs (`luts/*.cube`) previewed on the plates. Drop a still to grade your own frame, or install them into Resolve with one click. Grain plate: `luts/wali-grain-1080p24.mp4`. |
| Brand board | Wordmark, palette, type sizes at 1080p, catchlines, motion and voice rules. |

Space plays, arrow keys step a frame (shift: a second). Every setting lives in the URL.

## Using your footage

Drop a clip on the stage. It's saved to `public/footage/` with a preview proxy. Then hit **Render clip**:
- Glass compositions render **over your clip** (ProRes 422 HQ), frame-accurately, so the glass refracts the real shot.
- Everything else can export **ProRes 4444 with alpha** to stack in Resolve.

Exports go to `renders/`. CLI equivalent: `npm run render -- "<query from the URL>" --format prores422 --fps 30 --scale 1`.

## Notes

- `src/lib/hic-shim.ts` maps liquid-dom 0.1.1's old HTML-in-Canvas calls onto Chrome 157's API. Text sits in DOM over the glass because liquid-dom's in-glass HTML path doesn't composite in Chrome 157.
- Liquid glass can't live inside a CSS-scaled element, so the editor renders the stage at its on-screen size and compositions size everything from the stage's `u` unit.
- `plates-src/` holds the Higgsfield originals (Soul Cinema) used as stand-in footage.
- Regenerate LUTs and previews: `python3 scripts/make_luts.py`.
