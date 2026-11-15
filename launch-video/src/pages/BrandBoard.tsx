import { CATCHLINES } from "../comps/brand"
import { C, Wordmark } from "../ui/brand"

const SWATCHES = [
  ["paper", C.paper, "Backgrounds, end card on paper"],
  ["paper-2", C.paper2, "Recessed panels"],
  ["ink", C.ink, "Text, primary buttons, the wordmark on paper"],
  ["ink-2", C.ink2, "Secondary text"],
  ["ink-3", C.ink3, "Time stamps, quiet labels"],
  ["night", C.night, "Dark cards, footer"],
  ["cream", C.cream, "Wordmark and buttons on footage"],
  ["ember", C.ember, "Live states only: the listening dot, the pendant light"],
] as const

export function BrandBoard() {
  return (
    <div className="brand">
      <header className="page-head">
        <h1>
          The brand, <em>in motion.</em>
        </h1>
        <p>
          The rules from the brand kit and the landing page, sized for 1080p video. Everything in the kit’s components follows these, so
          anything you add in Resolve can match.
        </p>
      </header>

      <section className="bb-marks">
        <div className="bb-mark" style={{ backgroundImage: "url(/plates/hill.jpg)" }}>
          <Wordmark width={220} color={C.cream} />
          <span>Cream on footage</span>
        </div>
        <div className="bb-mark" style={{ background: C.night }}>
          <Wordmark width={220} color={C.paper} />
          <span style={{ color: "rgba(246,244,239,0.5)" }}>Paper on night</span>
        </div>
        <div className="bb-mark" style={{ background: C.paper, outline: "1px solid rgba(22,21,19,0.06)" }}>
          <Wordmark width={220} color={C.ink} />
          <span style={{ color: C.ink3 }}>Ink on paper</span>
        </div>
      </section>
      <ul className="bb-rules">
        <li>The name is the mark. All four letters, lowercase, one line. No “w” monogram, ever.</li>
        <li>Place the outlined files from the kit (the components already do). Never retype it in Averia.</li>
        <li>On video keep it at least 160px wide at 1080p; 360–520px for the end card. Clear space is half the x-height.</li>
        <li>One flat colour. Never ember, never a gradient, never a shadow heavier than the photo needs.</li>
      </ul>

      <h2 className="bb-h">Colour</h2>
      <section className="bb-swatches">
        {SWATCHES.map(([name, hex, role]) => (
          <div key={name} className="bb-swatch">
            <div style={{ background: hex, outline: name === "paper" || name === "cream" ? "1px solid rgba(22,21,19,0.08)" : undefined }} />
            <strong>{name}</strong>
            <code>{hex}</code>
            <p>{role}</p>
          </div>
        ))}
      </section>

      <h2 className="bb-h">Type at 1080p</h2>
      <section className="bb-type">
        <div className="bb-type-row">
          <span className="bb-spec">Fraunces 340 · SOFT 100 · −3% · 120px</span>
          <p className="display" style={{ fontSize: 96 }}>
            A Fitbit for your <em>mind.</em>
          </p>
        </div>
        <div className="bb-type-row">
          <span className="bb-spec">Fraunces 340 · 92px · chapter titles</span>
          <p className="display" style={{ fontSize: 64 }}>
            The scroll hole
          </p>
        </div>
        <div className="bb-type-row">
          <span className="bb-spec">Figtree 500 · 40px · captions, white 94%</span>
          <div className="bb-caption" style={{ backgroundImage: "url(/grades/quad__wali-portra.jpg)" }}>
            <span>I keep saying I’ll go climbing with you.</span>
          </div>
        </div>
        <div className="bb-type-row">
          <span className="bb-spec">SF Pro · iOS notification chrome only</span>
          <p style={{ fontFamily: "-apple-system, system-ui", fontSize: 22, margin: 0 }}>
            <strong>wali</strong> · now — system notifications use the iPhone’s own font, everything wali draws uses Figtree and Fraunces.
          </p>
        </div>
      </section>

      <h2 className="bb-h">Catchlines</h2>
      <section className="bb-lines">
        {CATCHLINES.map(([v, label]) => {
          const [a, b] = v.split("|")
          return (
            <div key={v} className="bb-line">
              <p className="display">
                {a} <em>{b}</em>
              </p>
              <span>{label.includes("landing") ? "Current landing hero" : ""}</span>
            </div>
          )
        })}
      </section>

      <h2 className="bb-h">Motion</h2>
      <section className="bb-grid">
        <div>
          <strong>Entrances</strong>
          <p>Rise 24px and fade over 0.9s, cubic-bezier(.22, 1, .36, 1). Stagger words or lines by 60–80ms. Text never bounces.</p>
        </div>
        <div>
          <strong>iOS glass</strong>
          <p>Notifications and the task card move on soft springs (a few percent of overshoot), the way iOS does. That is the only bounce in the film.</p>
        </div>
        <div>
          <strong>Live</strong>
          <p>The ember dot pulses on a 2.2s cycle. Use it only when the pendant is listening or wali is working right now.</p>
        </div>
        <div>
          <strong>Safe areas</strong>
          <p>16:9: keep text inside 90% of the frame. 9:16: leave the top 220px and bottom 420px clear for platform UI.</p>
        </div>
      </section>

      <h2 className="bb-h">Voice</h2>
      <section className="bb-grid">
        <div>
          <strong>Quiet, specific, kind</strong>
          <p>“You’ve been scrolling for 40 minutes. You told Sam you’d climb this week, and the gym’s quiet until 9. Go for an hour?”</p>
        </div>
        <div>
          <strong>Never</strong>
          <p>Hype (“unlock”, “supercharge”, “revolutionary”), guilt, emoji, or anything that sounds like surveillance.</p>
        </div>
      </section>
    </div>
  )
}
