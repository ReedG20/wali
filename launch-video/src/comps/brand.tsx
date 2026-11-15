import { clamp, easeInOut, easeOut, lerp, prog, springAt } from "../lib/anim"
import { PlainStage } from "../stage/GlassStage"
import { useStage } from "../stage/context"
import { C, EmberDot, FONT, Wordmark, display } from "../ui/brand"
import { I } from "../ui/icons"
import { bool, num, str, type Comp, type Props } from "./types"

/* ------------------------------------------------------------------ helpers */

/** Words rise 24px and fade over 0.9s, staggered 70ms (the brand's entrance). */
function RiseWords({ text, t, at, italic, size, color, stagger = 0.07, u }: { text: string; t: number; at: number; italic?: boolean; size: number; color: string; stagger?: number; u: number }) {
  return (
    <>
      {text.split(" ").map((w, i) => {
        const e = easeOut(prog(t, at + i * stagger, 0.9))
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              ...display(size, italic),
              color,
              opacity: e,
              transform: `translateY(${(1 - e) * 24 * u}px)`,
              filter: e < 1 ? `blur(${(1 - e) * 6 * u}px)` : undefined,
              marginRight: "0.24em",
            }}
          >
            {w}
          </span>
        )
      })}
    </>
  )
}

const tones = {
  photo: { text: "rgba(255,255,255,0.94)", sub: "rgba(255,255,255,0.78)", mark: C.cream, pillBg: C.cream, pillText: C.ink },
  night: { text: "rgba(246,244,239,0.94)", sub: "rgba(246,244,239,0.6)", mark: C.paper, pillBg: C.paper, pillText: C.ink },
  paper: { text: C.ink, sub: C.ink2, mark: C.ink, pillBg: C.ink, pillText: "#fff" },
}

/* ------------------------------------------------------------------ end card */

export const CATCHLINES: [string, string][] = [
  ["A Fitbit for your|mind.", "A Fitbit for your mind. (landing hero)"],
  ["Quiet,|until it matters.", "Quiet, until it matters."],
  ["Look up.|wali’s got the rest.", "Look up. wali’s got the rest."],
  ["Get your|evenings back.", "Get your evenings back."],
  ["Start with a|quieter day.", "Start with a quieter day."],
  ["A clearer head,|every day.", "A clearer head, every day."],
]

function EndCardView({ p }: { p: Props }) {
  const { t, u, aspect } = useStage()
  const tone = tones[(str(p.tone) || "photo") as keyof typeof tones]
  const line = str(p.line) === "custom" ? str(p.custom) : str(p.line)
  const [a = "", b = ""] = line.split("|")
  const vertical = aspect === "9x16"
  const size = (vertical ? 118 : 124) * u * num(p.scale)
  const seq = str(p.sequence)
  const beat2 = num(p.beat2)
  const twoBeat = seq === "two-beat"

  const lineOut = twoBeat ? easeInOut(prog(t, beat2 - 0.1, 0.7)) : 0
  const markAt = twoBeat ? beat2 + 0.25 : num(p.markAt)
  const m = easeOut(prog(t, markAt, 1.2))
  const markW = (twoBeat ? (vertical ? 520 : 420) : vertical ? 300 : 230) * u * num(p.scale)
  const ctaAt = markAt + 0.6
  const cta = str(p.cta)
  const url = str(p.url)

  return (
    <PlainStage>
      {tone === tones.photo && (
        <>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0.34), transparent 64%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), transparent 40%, rgba(0,0,0,0.38))" }} />
        </>
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${num(p.vy)}%`,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: `0 ${80 * u}px`,
          textShadow: tone === tones.photo ? `0 ${2 * u}px ${40 * u}px rgba(0,0,0,0.25)` : undefined,
        }}
      >
        <div
          style={{
            opacity: 1 - lineOut,
            transform: `translateY(${-lineOut * 20 * u}px)`,
            filter: lineOut > 0 ? `blur(${lineOut * 10 * u}px)` : undefined,
            maxWidth: vertical ? 900 * u : 1500 * u,
            lineHeight: 1,
          }}
        >
          <div>
            <RiseWords text={a} t={t} at={num(p.in)} size={size} color={tone.text} u={u} />
          </div>
          <div style={{ marginTop: 0.04 * size }}>
            <RiseWords text={b} t={t} at={num(p.in) + 0.32} size={size} color={tone.text} italic u={u} />
          </div>
        </div>

        <div
          style={{
            position: twoBeat ? "absolute" : "relative",
            top: twoBeat ? "50%" : undefined,
            left: twoBeat ? "50%" : undefined,
            transform: twoBeat ? `translate(-50%, -50%) scale(${lerp(0.97, 1, m)})` : `translateY(${(1 - m) * 16 * u}px)`,
            marginTop: twoBeat ? 0 : 64 * u,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: m,
            filter: m < 1 ? `blur(${(1 - m) * 12 * u}px)` : undefined,
          }}
        >
          <Wordmark width={markW} color={tone.mark} />
          {(cta || url) && (
            <div style={{ marginTop: 34 * u, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * u, opacity: easeOut(prog(t, ctaAt, 0.9)) }}>
              {cta && (
                <span style={{ height: 52 * u, padding: `0 ${26 * u}px`, borderRadius: 999, background: tone.pillBg, color: tone.pillText, fontFamily: FONT.body, fontWeight: 500, fontSize: 19 * u, display: "inline-flex", alignItems: "center", textShadow: "none" }}>
                  {cta}
                </span>
              )}
              {url && <span style={{ fontFamily: FONT.body, fontSize: 18 * u, color: tone.sub }}>{url}</span>}
            </div>
          )}
        </div>
      </div>
    </PlainStage>
  )
}

export const endCard: Comp = {
  id: "endcard",
  name: "End card",
  group: "Brand",
  blurb: "The hero shot to close on: a long-exposure plate, one line in Fraunces, then the wordmark. Two beats, or a single lockup.",
  glass: false,
  plate: "hill",
  defaults: { line: CATCHLINES[0]![0], custom: "Your line,|in two parts.", tone: "photo", sequence: "two-beat", in: 0.5, beat2: 3.6, markAt: 2.2, cta: "Join the waitlist", url: "", scale: 1, vy: 36 },
  presets: CATCHLINES.map(([v, l], i) => ({ id: `line${i}`, label: l, values: { line: v } })),
  controls: [
    { key: "line", label: "Catchline", type: "select", options: [...CATCHLINES, ["custom", "Custom…"]] },
    { key: "custom", label: "Custom line", type: "text", hint: "Use | to split the plain part from the italic part." },
    { key: "sequence", label: "Sequence", type: "select", options: [["two-beat", "Line, then wordmark"], ["lockup", "Line and wordmark together"]] },
    { key: "tone", label: "Tone", type: "select", options: [["photo", "On photo (cream)"], ["night", "On night"], ["paper", "On paper"]] },
    { key: "cta", label: "Button", type: "text" },
    { key: "url", label: "URL line", type: "text" },
    { key: "scale", label: "Type scale", type: "range", min: 0.6, max: 1.4, step: 0.05 },
    { key: "vy", label: "Height in frame (%)", type: "range", min: 20, max: 70, step: 1 },
    { key: "in", label: "Line in at (s)", type: "range", min: 0, max: 3, step: 0.05 },
    { key: "beat2", label: "Wordmark beat at (s)", type: "range", min: 1.5, max: 8, step: 0.05 },
    { key: "markAt", label: "Lockup wordmark at (s)", type: "range", min: 0.5, max: 6, step: 0.05 },
  ],
  duration: (p) => (str(p.sequence) === "two-beat" ? num(p.beat2) + 3.6 : num(p.markAt) + 3.6),
  Component: EndCardView,
}

/* ------------------------------------------------------------------ chapter title */

const CHAPTERS = [
  { id: "c1", label: "The scroll hole", values: { kicker: "Tuesday, 11:48 pm", title: "The scroll hole" } },
  { id: "c2", label: "Who restores you", values: { kicker: "Saturday, 10:15 am", title: "Who restores you" } },
  { id: "c3", label: "What you promised", values: { kicker: "Thursday, 9:02 am", title: "What you promised" } },
  { id: "c4", label: "Small adventures", values: { kicker: "Wednesday, 6:30 pm", title: "Small adventures" } },
  { id: "c5", label: "Before you ask", values: { kicker: "Friday, 7:15 pm", title: "Before you ask" } },
]

function TitleView({ p }: { p: Props }) {
  const { t, u, aspect } = useStage()
  const pos = str(p.position)
  const out = num(p.out)
  const fadeOut = easeInOut(prog(t, out, 0.7))
  const vertical = aspect === "9x16"
  const size = (vertical ? 96 : 92) * u * num(p.scale)
  const k = easeOut(prog(t, num(p.in), 0.9))
  const center = pos === "center"
  const dark = str(p.tone) === "paper"
  const text = dark ? C.ink : "rgba(255,255,255,0.94)"
  const sub = dark ? C.ink2 : "rgba(255,255,255,0.78)"
  return (
    <PlainStage>
      {!dark && bool(p.shade) && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - fadeOut, background: center ? "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.35), transparent 60%)" : "linear-gradient(to top, rgba(0,0,0,0.45), transparent 45%)" }} />
      )}
      <div
        style={{
          position: "absolute",
          left: center ? 0 : (vertical ? 72 : 120) * u,
          right: center ? 0 : undefined,
          bottom: center ? undefined : (vertical ? 300 : 112) * u,
          top: center ? "50%" : undefined,
          transform: center ? "translateY(-50%)" : undefined,
          textAlign: center ? "center" : "left",
          opacity: 1 - fadeOut,
          filter: fadeOut > 0 ? `blur(${fadeOut * 8 * u}px)` : undefined,
          textShadow: dark ? undefined : `0 ${2 * u}px ${30 * u}px rgba(0,0,0,0.3)`,
        }}
      >
        {str(p.kicker) && (
          <div style={{ fontFamily: FONT.body, fontSize: 24 * u * num(p.scale), color: sub, marginBottom: 18 * u, opacity: k, transform: `translateY(${(1 - k) * 12 * u}px)`, display: "flex", alignItems: "center", gap: 12 * u, justifyContent: center ? "center" : "flex-start" }}>
            {bool(p.live) && <EmberDot t={t} size={10 * u} />}
            {str(p.kicker)}
          </div>
        )}
        <div style={{ maxWidth: (vertical ? 900 : 1300) * u, margin: center ? "0 auto" : undefined }}>
          <RiseWords text={str(p.title)} t={t} at={num(p.in) + 0.15} size={size} color={text} italic={bool(p.italic)} u={u} />
        </div>
      </div>
    </PlainStage>
  )
}

export const titleCard: Comp = {
  id: "title",
  name: "Chapter title",
  group: "Brand",
  blurb: "A scene opener in the landing page's voice: a small time stamp, then the chapter in Fraunces. Exports with alpha.",
  glass: false,
  plate: "door",
  defaults: { ...CHAPTERS[0]!.values, position: "lower", tone: "photo", italic: false, live: true, shade: true, scale: 1, in: 0.3, out: 3.6 },
  presets: CHAPTERS,
  controls: [
    { key: "title", label: "Title", type: "text" },
    { key: "kicker", label: "Time stamp", type: "text" },
    { key: "position", label: "Position", type: "select", options: [["lower", "Lower left"], ["center", "Centre"]] },
    { key: "tone", label: "Tone", type: "select", options: [["photo", "On footage"], ["paper", "On paper"]] },
    { key: "italic", label: "Italic title", type: "toggle" },
    { key: "live", label: "Ember dot (pendant is listening)", type: "toggle" },
    { key: "shade", label: "Soft shade behind", type: "toggle" },
    { key: "scale", label: "Type scale", type: "range", min: 0.5, max: 1.5, step: 0.05 },
    { key: "in", label: "In at (s)", type: "range", min: 0, max: 3, step: 0.05 },
    { key: "out", label: "Out at (s)", type: "range", min: 1, max: 10, step: 0.05 },
  ],
  duration: (p) => num(p.out) + 1,
  Component: TitleView,
}

/* ------------------------------------------------------------------ listening / noted chip */

function bars(t: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const v = 0.5 + 0.5 * Math.sin(t * (7 + i * 1.7) + i * 2.1) * Math.sin(t * (3.1 + i * 0.6) + i)
    return 0.25 + 0.75 * Math.abs(v)
  })
}

function ListeningView({ p }: { p: Props }) {
  const { t, w, u, aspect } = useStage()
  const s = (aspect === "16x9" ? 1.25 : 1.6) * u * num(p.size)
  const tin = num(p.in)
  const noteAt = num(p.noteAt)
  const out = num(p.out)
  const showNote = bool(p.note) && t >= noteAt
  const a = springAt(t, tin, 240, 24)
  const leave = easeInOut(prog(t, out, 0.45))
  const nm = bool(p.note) ? easeOut(prog(t, noteAt, 0.55)) : 0
  const pillH = 44 * s
  const listenW = 150 * s
  const noteW = Math.min(w * 0.8, (54 + str(p.noteText).length * 8.1) * s)
  const pw = lerp(listenW, noteW, nm)
  const ph = lerp(pillH, 64 * s, nm)
  const pos = str(p.position)
  const margin = (aspect === "16x9" ? 64 : 48) * u
  const x = pos === "left" ? margin : pos === "center" ? (w - pw) / 2 : w - margin - pw
  const y = (aspect === "9x16" ? 150 : 58) * u
  const surface = str(p.surface)
  const light = surface === "light"
  const fg = light ? C.ink : "#fff"
  const fg2 = light ? C.ink2 : "rgba(255,255,255,0.72)"

  return (
    <PlainStage>
      <div
        style={{
          position: "absolute",
          left: x,
          top: lerp(y - 16 * u, y, clamp(a)) - leave * 20 * u,
          width: pw,
          height: ph,
          borderRadius: ph / 2,
          opacity: clamp(a * 1.4) * (1 - leave),
          background: light ? "rgba(255,255,255,0.86)" : "rgba(20,18,16,0.46)",
          backdropFilter: `blur(${18 * s}px) saturate(1.4)`,
          WebkitBackdropFilter: `blur(${18 * s}px) saturate(1.4)`,
          boxShadow: light ? `0 ${18 * u}px ${48 * u}px ${-20 * u}px rgba(0,0,0,0.45)` : `inset 0 0 0 ${1 * s}px rgba(255,255,255,0.22), 0 ${18 * u}px ${48 * u}px ${-20 * u}px rgba(0,0,0,0.5)`,
          overflow: "hidden",
          fontFamily: FONT.body,
          color: fg,
        }}
      >
        {/* listening */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 10 * s, padding: `0 ${18 * s}px`, opacity: 1 - nm }}>
          <EmberDot t={t} size={9 * s} />
          <span style={{ fontSize: 15 * s, fontWeight: 500 }}>Listening</span>
          <span style={{ display: "flex", alignItems: "center", gap: 2.5 * s, height: 18 * s, marginLeft: "auto" }}>
            {bars(t, 5).map((b, i) => (
              <span key={i} style={{ width: 2.6 * s, height: 18 * s * b, borderRadius: 2 * s, background: fg2 }} />
            ))}
          </span>
        </div>
        {/* noted */}
        {showNote && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 12 * s, padding: `0 ${20 * s}px 0 ${14 * s}px`, opacity: nm }}>
            <span style={{ width: 36 * s, height: 36 * s, borderRadius: 999, background: light ? C.tint : "rgba(255,255,255,0.14)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <I.note size={18 * s} stroke={1.8} color={fg} />
            </span>
            <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: 12.5 * s, color: fg2 }}>{str(p.noteLabel)}</span>
              <span style={{ fontSize: 15.5 * s, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{str(p.noteText)}</span>
            </span>
          </div>
        )}
      </div>
    </PlainStage>
  )
}

export const listening: Comp = {
  id: "listening",
  name: "Pendant listening",
  group: "Overlays",
  blurb: "The pendant at work: a small Listening pill with the ember dot, which turns into what wali kept from the conversation. Use it in the scene that sets up a later nudge.",
  glass: false,
  plate: "quad",
  defaults: { surface: "dark", position: "right", size: 1.4, in: 0.3, note: true, noteAt: 2.4, noteLabel: "wali noted", noteText: "You told Sam you’d climb this week", out: 5.4 },
  controls: [
    { key: "note", label: "Turn into a note", type: "toggle" },
    { key: "noteLabel", label: "Note label", type: "text" },
    { key: "noteText", label: "Note", type: "text" },
    { key: "surface", label: "Surface", type: "select", options: [["dark", "Frosted dark"], ["light", "Frosted light"]] },
    { key: "position", label: "Position", type: "select", options: [["right", "Top right"], ["center", "Top centre"], ["left", "Top left"]] },
    { key: "size", label: "Size", type: "range", min: 0.6, max: 1.8, step: 0.05 },
    { key: "in", label: "In at (s)", type: "range", min: 0, max: 3, step: 0.05 },
    { key: "noteAt", label: "Note at (s)", type: "range", min: 0.5, max: 8, step: 0.05 },
    { key: "out", label: "Out at (s)", type: "range", min: 1, max: 12, step: 0.05 },
  ],
  duration: (p) => num(p.out) + 0.8,
  Component: ListeningView,
}
