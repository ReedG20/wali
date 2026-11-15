# Mind — design draft brief (shared by all 5 directions)

## Product
A wearable pendant that does for your mind what WHOOP/Oura do for your body. It listens (and can optionally look) through the day, transcribes with speaker labels, builds a long-term memory of your people, goals, habits and patterns, and sends timely nudges. It can also take small actions for you through connected apps, either on its own or after you approve, depending on risk. Working name: **Mind** (a placeholder, so treat the wordmark as one).

Use cases to draw copy and UI from: getting out of a doomscroll spiral with one personal first step; acting on your behalf with approvals; relationship energy (who restores you and who drains you); sidequests (small adventures drawn from your interests); habits and routine; conversation notes; anticipation (what you need before you ask).

Hardware reality: a small round/pill pendant on a cord. There's no final casing, so draw it with CSS/SVG and keep it abstract and beautiful.

Design north star from the founder: *warm, grounded, calm, spacious, but unique.* They liked https://www.soma-health.co/ as a vibe and **not** as a template.

## Deliverables (per direction, in your folder)
1. `landing.html`: a marketing landing page that conveys the vibe of the product. Hero, how it works (pendant → understanding → nudges/actions), use cases, privacy/trust, a waitlist CTA and a footer. Make it feel like a real launch, not a wireframe.
2. `app.html`: the web app in the **same design language**. Its core is a **chat interface** with your Mind companion: sidebar/history, conversation, composer, and nudges or action approvals shown inline in the chat. You can also add 1–2 extra views (mood/mind analytics, day timeline, relationship energy, conversation notes, habits), switched with tabs or nav in the same file using plain JS. Write realistic sample content and no lorem ipsum.
3. `NOTES.md`: the direction name, a one-paragraph concept, the type/colour tokens, and a **"Stolen from" list**. Every Mobbin reference you used gets a markdown link to its `mobbin_url` and one line on exactly what you took from it.

## Tech constraints
- Static, self-contained HTML. Use inline `<style>`/`<script>` with no build step, and open the files directly via `file://`.
- Google Fonts are allowed. Libraries come only from pinned-version CDN URLs (cdnjs/jsdelivr/unpkg), though plain CSS/JS is preferred. Don't use Tailwind CDN.
- Don't use external image URLs or stock photos, since Mobbin image URLs expire and we have no rights to them. Build visuals from CSS gradients, SVG and type.
- The page must be responsive down to a 390px phone width without horizontal scrolling.
- Keep motion subtle and purposeful, and respect `prefers-reduced-motion`.

## Mobbin process (this is the point; do it rigorously)
The Mobbin MCP tools are deferred. Load them first with ToolSearch, using the query `select:mcp__claude_ai_Mobbin__search_sections,mcp__claude_ai_Mobbin__search_screens,mcp__claude_ai_Mobbin__search_flows`. Always pass `output_destination: "code"` and `task_intent: "Design landing page and web app drafts for a mind-tracking wearable."`
- **Do not search within our niche.** Skip mental health, meditation and wellness apps. Look at the best-designed products across *all* categories, such as fintech, AI tools, dev tools, hardware, fashion, editorial, travel and productivity. Ask for the best examples of a *pattern* ("hero section", "feature grid", "testimonial section", "footer", "pricing section", "chat screen", "sidebar navigation", "dashboard", "empty state", "settings") and pick the most beautiful results.
- Run **at least 12–15 searches** across sections (landing) and web screens (app). Also check a few iOS screens for chat/insight card patterns. Look closely at the returned images.
- **Steal like an artist, with a high standard for accuracy.** When you pick a reference, copy its spacing rhythm, type scale ratios, grid, corner radii, border weights, colour restraint and component anatomy faithfully, and only reskin it for Mind. Precision is what makes the result look premium. Vague "inspired by" work is what makes AI designs look generic.
- Avoid generic AI-landing-page tells: purple gradients, emoji icons, glassmorphism cards everywhere, "Unlock your potential" copy, and three identical feature cards with icons.

## Quality bar and self-review
Before finishing, screenshot your pages with headless Chrome and look at them yourself:
```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --screenshot=<folder>/shot-landing.png --window-size=1440,5000 "file://<abs path>/landing.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --screenshot=<folder>/shot-app.png --window-size=1440,900 "file://<abs path>/app.html"
```
Also take a 390-wide mobile shot of the landing page. Read the PNGs, fix anything that looks off (alignment, contrast, overflow, awkward wraps, empty space that reads as broken) and re-shoot. Do at least two review passes, and leave the final screenshots in the folder.

Copy tone: quiet, confident and human. Use short sentences and lean on concrete examples, such as "You've been on TikTok for 52 minutes. Want to finish the chapter you started Tuesday?", rather than adjectives.
