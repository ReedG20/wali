import { clamp, easeIn, easeInOut, easeOut, lerp, prog, springAt } from "../lib/anim"
import { GlassStage, OverShape, type GlassLook, type GlassShape } from "../stage/GlassStage"
import { useStage } from "../stage/context"
import { C, EmberDot, FONT, WaliIcon, display } from "../ui/brand"
import { I, IosSpinner } from "../ui/icons"
import { BannerContent, LOOKS, NB, bannerAt, notifScale, notifTop, press } from "./notification"
import { bool, num, str, type Comp, type Props } from "./types"

/** Card metrics in points (same width as the banner, so the banner can grow into it). */
const K = { W: NB.W, R: 28, pad: 18, head: 22, titleTop: 14, title: 27, listTop: 16, label: 20, detail: 18, rowGap: 10, appr: 92, apprGap: 8 }

type Step = { run: string; done: string; detail: string }

export function parseSteps(text: string): Step[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [run = "", done = "", detail = ""] = l.split("|").map((x) => x.trim())
      return { run, done: done || run, detail }
    })
}

type Sched = { start: number; ask?: number; ok?: number; done: number }

/** When each step starts and finishes. An approval step waits for the tap on Approve. */
function schedule(steps: Step[], t0: number, pace: number, approvalStep: number, hold: number): { rows: Sched[]; end: number } {
  const rows: Sched[] = []
  let c = t0
  steps.forEach((_, i) => {
    const start = c
    if (i + 1 === approvalStep) {
      const ask = start + 0.3
      const ok = ask + hold
      const done = ok + 0.45
      rows.push({ start, ask, ok, done })
      c = done + pace * 0.25
    } else {
      const done = start + pace * 0.75
      rows.push({ start, done })
      c = done + pace * 0.25
    }
  })
  return { rows, end: (rows.at(-1)?.done ?? t0) + 0.25 }
}

function TaskView({ p }: { p: Props }) {
  const { t, w, h: H, aspect, u } = useStage()
  const look = (str(p.theme) || "light") as GlassLook
  const L = LOOKS[look]
  const dark = look !== "light"
  const ink = dark ? "#fff" : C.ink
  const ink2 = dark ? "rgba(255,255,255,0.78)" : C.ink2
  const ink3 = dark ? "rgba(255,255,255,0.6)" : "#7A756C"
  const tint = dark ? "rgba(255,255,255,0.12)" : "rgba(22,21,19,0.06)"

  const s = notifScale(aspect, num(p.size), u)
  const steps = parseSteps(str(p.steps))
  const fromNudge = bool(p.fromNudge)
  const tin = num(p.in)
  const morphAt = fromNudge ? num(p.morphAt) : tin
  const t0 = morphAt + (fromNudge ? 0.55 : 0.5)
  const approvalStep = bool(p.approval) ? num(p.approvalStep) : 0
  const sch = schedule(steps, t0, num(p.pace), approvalStep, num(p.approvalHold))
  const tout = sch.end + num(p.hold)

  // --- card height: grows row by row on a spring (the glass morphs with it)
  const rowH = (i: number) => (K.label + (steps[i]?.detail ? K.detail : 0) + K.rowGap) * s
  let listH = 0
  sch.rows.forEach((r, i) => {
    listH += rowH(i) * clamp(springAt(t, r.start, 300, 27), 0, 1.06)
    if (r.ask !== undefined) {
      const open = springAt(t, r.ask, 280, 26) * (1 - easeInOut(prog(t, r.ok! + 0.1, 0.35)))
      listH += (K.appr + K.apprGap) * s * open
    }
  })
  const baseH = (K.pad + K.head + K.titleTop + K.title + K.listTop + K.pad - K.rowGap) * s
  const cardH = baseH + listH
  const W = K.W * s
  const top = notifTop(aspect, u)
  const margin = (aspect === "16x9" ? 64 : 36) * u
  const align = str(p.align)
  const cx = align === "left" ? margin + W / 2 : align === "right" ? w - margin - W / 2 : w / 2
  const cy = align === "middle" ? Math.max(top, (H - cardH) / 2) : top

  // --- entrance: from the banner (morph) or on its own (drop + fade)
  let card: GlassShape
  let opacity = 1
  let bannerOpacity = 0
  let banner = null as ReturnType<typeof bannerAt> | null
  const leave = easeIn(prog(t, tout, 0.45))
  if (fromNudge) {
    banner = bannerAt(t, { w, aspect, u, size: num(p.size), body: str(p.nudge), style: "drop", tin, tout: 1e9, align: align === "middle" ? "center" : align })
    const m = springAt(t, morphAt, 220, 25)
    const hNow = lerp(banner.h, cardH, clamp(m, 0, 1.03))
    card = {
      key: "card",
      x: banner.banner.x,
      y: lerp(banner.banner.y, top, clamp(m)),
      w: W,
      h: hNow,
      r: lerp(NB.R, K.R, clamp(m)) * s,
      scale: (banner.banner.scale ?? 1) * press(t, morphAt - 0.3, 0.035),
    }
    bannerOpacity = 1 - easeOut(prog(t, morphAt - 0.02, 0.18))
  } else {
    const a = springAt(t, tin, 200, 22)
    card = { key: "card", x: cx - W / 2, y: lerp(cy - 40 * u, cy, clamp(a)), w: W, h: cardH, r: K.R * s, scale: lerp(0.94, 1, clamp(a)) }
    opacity = easeOut(prog(t, tin, 0.3))
  }
  const off = -card.h - 40 * u
  card = { ...card, y: lerp(card.y, off, leave) }

  const contentOpacity = fromNudge ? easeOut(prog(t, morphAt + 0.12, 0.35)) : easeOut(prog(t, tin + 0.1, 0.35))
  const done = t >= sch.end
  const doneP = easeOut(prog(t, sch.end, 0.5))

  return (
    <GlassStage shapes={[card]} look={look} opacity={opacity}>
      <OverShape s={card}>
        {banner && bannerOpacity > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: bannerOpacity }}>
            <BannerContent s={s} title="wali" time="now" body={str(p.nudge)} look={L} h={banner.h} />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: W,
            padding: K.pad * s,
            boxSizing: "border-box",
            opacity: contentOpacity,
            fontFamily: FONT.body,
            color: ink,
          }}
        >
          {/* header: app, state, live dot */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 * s, height: K.head * s, fontSize: 13.5 * s }}>
            <WaliIcon size={22 * s} radius={0.25} />
            <span style={{ fontWeight: 600 }}>wali</span>
            <span style={{ color: ink3, position: "relative", flex: 1, height: 18 * s }}>
              <span style={{ position: "absolute", left: 0, top: 0, opacity: 1 - doneP, whiteSpace: "nowrap" }}>· Working on it</span>
              <span style={{ position: "absolute", left: 0, top: 0, opacity: doneP, whiteSpace: "nowrap" }}>· Done</span>
            </span>
            {!done ? (
              <EmberDot t={t} size={8 * s} />
            ) : (
              <span style={{ width: 18 * s, height: 18 * s, borderRadius: "50%", background: ink, display: "grid", placeItems: "center", opacity: doneP }}>
                <I.check size={12 * s} stroke={2.6} color={dark ? C.ink : "#fff"} />
              </span>
            )}
          </div>

          {/* title, crossfading to the result */}
          <div style={{ position: "relative", marginTop: K.titleTop * s, height: K.title * s }}>
            <div style={{ ...display(24 * s), position: "absolute", inset: 0, opacity: 1 - doneP, whiteSpace: "nowrap", color: ink }}>{str(p.title)}</div>
            <div style={{ ...display(24 * s), position: "absolute", inset: 0, opacity: doneP, transform: `translateY(${(1 - doneP) * 8 * s}px)`, whiteSpace: "nowrap", color: ink }}>
              {str(p.doneTitle)}
            </div>
          </div>

          {/* steps */}
          <div style={{ marginTop: K.listTop * s }}>
            {steps.map((st, i) => {
              const r = sch.rows[i]!
              if (t < r.start) return null
              const isDone = t >= r.done
              const enter = easeOut(prog(t, r.start, 0.45))
              const dp = easeOut(prog(t, r.done, 0.3))
              const approvalOpen = r.ask !== undefined ? springAt(t, r.ask, 280, 26) * (1 - easeInOut(prog(t, r.ok! + 0.1, 0.35))) : 0
              const waiting = r.ask !== undefined && t >= r.ask && t < r.ok!
              return (
                <div key={i} style={{ opacity: enter, transform: `translateY(${(1 - enter) * 10 * s}px)`, paddingBottom: K.rowGap * s }}>
                  <div style={{ display: "flex", gap: 11 * s, alignItems: "flex-start" }}>
                    <span style={{ width: 20 * s, height: 20 * s, display: "grid", placeItems: "center", flexShrink: 0, position: "relative" }}>
                      {!isDone ? (
                        waiting ? (
                          <EmberDot t={t} size={8 * s} />
                        ) : (
                          <IosSpinner t={t} size={17 * s} color={ink2} />
                        )
                      ) : (
                        <span
                          style={{
                            width: 19 * s,
                            height: 19 * s,
                            borderRadius: "50%",
                            background: tint,
                            display: "grid",
                            placeItems: "center",
                            transform: `scale(${0.6 + 0.4 * springAt(t, r.done, 500, 20)})`,
                          }}
                        >
                          <I.check size={12.5 * s} stroke={2.5} color={ink} />
                        </span>
                      )}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ position: "relative", height: K.label * s, fontSize: 15.5 * s, lineHeight: `${K.label * s}px`, whiteSpace: "nowrap" }}>
                        <span style={{ position: "absolute", left: 0, top: 0, opacity: 1 - dp, color: ink }}>
                          {waiting ? `${st.run} · needs your OK` : `${st.run}…`}
                        </span>
                        <span style={{ position: "absolute", left: 0, top: 0, opacity: dp, color: ink2 }}>{st.done}</span>
                      </div>
                      {st.detail && (
                        <div
                          style={{
                            height: K.detail * s,
                            fontSize: 13.5 * s,
                            lineHeight: `${K.detail * s}px`,
                            color: ink3,
                            opacity: dp,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {st.detail}
                        </div>
                      )}
                      {r.ask !== undefined && approvalOpen > 0.01 && (
                        <div style={{ height: (K.appr + K.apprGap) * s * approvalOpen, overflow: "hidden" }}>
                          <Approval s={s} t={t} ok={r.ok!} text={str(p.approvalText)} ink={ink} ink2={ink2} tint={tint} dark={dark} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </OverShape>
    </GlassStage>
  )
}

/** "Needs your OK": what will be sent, then Approve / Edit. Approve is tapped at `ok`. */
function Approval({ s, t, ok, text, ink, ink2, tint, dark }: { s: number; t: number; ok: number; text: string; ink: string; ink2: string; tint: string; dark: boolean }) {
  const k = press(t, ok - 0.12, 0.08)
  const tapped = t >= ok
  return (
    <div style={{ marginTop: K.apprGap * s, height: K.appr * s, boxSizing: "border-box", borderRadius: 18 * s, background: dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.62)", padding: `${11 * s}px ${12 * s}px`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ fontSize: 14 * s, lineHeight: `${19 * s}px`, color: ink2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>“{text}”</div>
      <div style={{ display: "flex", gap: 6 * s }}>
        <span
          style={{
            height: 32 * s,
            padding: `0 ${15 * s}px`,
            borderRadius: 999,
            background: dark ? "#fff" : C.ink,
            color: dark ? C.ink : "#fff",
            display: "inline-flex",
            alignItems: "center",
            gap: 6 * s,
            fontSize: 13 * s,
            fontWeight: 500,
            transform: `scale(${k})`,
          }}
        >
          {tapped && <I.check size={13 * s} stroke={2.4} color={dark ? C.ink : "#fff"} />}
          {tapped ? "Approved" : "Approve"}
        </span>
        <span style={{ height: 32 * s, padding: `0 ${15 * s}px`, borderRadius: 999, background: tint, color: ink, display: "inline-flex", alignItems: "center", fontSize: 13 * s, fontWeight: 500 }}>
          Edit
        </span>
      </div>
    </div>
  )
}

export const TASK_PRESETS = [
  {
    id: "climb",
    label: "1 · Book climbing + text Sam",
    values: {
      title: "Booking your climbing session",
      doneTitle: "You’re booked for 8:00",
      steps: [
        "Checking your calendar | Checked your calendar | Free until 9:30",
        "Finding a slot at the gym | Found a slot | 8:00 pm, 3 spots left",
        "Booking with your membership | Booked with your membership | Confirmation in your inbox",
        "Texting Sam | Texted Sam | “Climbing at 8? I booked us both.”",
        "Adding it to your calendar | Added to your calendar | 8:00–9:30 pm",
      ].join("\n"),
      approvalStep: 4,
      approvalText: "Climbing at 8? I booked us both.",
      nudge: "You’ve been scrolling for 40 minutes. You told Sam you’d climb this week, and the gym’s quiet until 9. Go for an hour?",
    },
  },
  {
    id: "study",
    label: "2 · Set up a study week",
    values: {
      title: "Setting up your study week",
      doneTitle: "Two sessions, notes ready",
      steps: [
        "Reading your calendar | Read your calendar | Two free blocks before Thursday",
        "Blocking Tuesday 1–3 pm | Blocked Tuesday 1–3 pm | Library, 3rd floor",
        "Blocking Wednesday 4–6 pm | Blocked Wednesday 4–6 pm | ",
        "Pulling notes from Tuesday’s lab | Pulled your lab notes | 14 minutes of what Dr. Ortiz said",
        "Making a practice quiz | Made a practice quiz | 12 questions, saved to Notes",
      ].join("\n"),
      approvalStep: 0,
      approvalText: "",
      nudge: "Your chem midterm is Thursday. You have two free hours after lunch tomorrow. Want me to block them and pull your notes from Tuesday’s lab?",
    },
  },
  {
    id: "family",
    label: "3 · Gift for Mom",
    values: {
      title: "Finding Mom a gift",
      doneTitle: "A gift card, there by Sunday",
      steps: [
        "Searching pottery studios near Mom | Found three studios | Clay Corner sells gift cards",
        "Checking your budget | Checked your budget | Keeping it under $60",
        "Buying a $50 gift card | Bought a $50 gift card | From Clay Corner",
        "Scheduling delivery | Scheduled delivery | Sunday, 9:00 am",
      ].join("\n"),
      approvalStep: 3,
      approvalText: "Buy a $50 gift card from Clay Corner",
      nudge: "Mom’s birthday is Sunday. She brought up that pottery class twice this month. Want me to find a gift card?",
    },
  },
]

export const task: Comp = {
  id: "task",
  name: "Agent task",
  group: "Overlays",
  blurb: "wali doing the work: an accelerated list of steps on a Liquid Glass card that grows as it goes. It can grow straight out of the notification, and pause for your OK before anything others would see.",
  glass: true,
  plate: "bedroom",
  defaults: {
    ...TASK_PRESETS[0]!.values,
    approval: true,
    fromNudge: true,
    theme: "light",
    align: "center",
    size: 1,
    in: 0.4,
    morphAt: 2.2,
    pace: 0.75,
    approvalHold: 1.1,
    hold: 1.8,
  },
  presets: TASK_PRESETS,
  controls: [
    { key: "title", label: "Title while working", type: "text" },
    { key: "doneTitle", label: "Title when done", type: "text" },
    { key: "steps", label: "Steps", type: "textarea", hint: "One per line: doing | done | detail" },
    { key: "approval", label: "Ask before a step", type: "toggle" },
    { key: "approvalStep", label: "Which step asks (1-based)", type: "range", min: 1, max: 6, step: 1 },
    { key: "approvalText", label: "What it will send", type: "text" },
    { key: "fromNudge", label: "Grow out of the notification", type: "toggle" },
    { key: "nudge", label: "Notification text", type: "textarea" },
    { key: "theme", label: "Glass", type: "select", options: [["light", "Light"], ["clear", "Clear"], ["dark", "Dark"]] },
    { key: "align", label: "Position", type: "select", options: [["center", "Top centre"], ["middle", "Centre"], ["left", "Top left"], ["right", "Top right"]] },
    { key: "size", label: "Size", type: "range", min: 0.6, max: 1.4, step: 0.05 },
    { key: "pace", label: "Seconds per step", type: "range", min: 0.35, max: 1.6, step: 0.05 },
    { key: "approvalHold", label: "Wait on approval (s)", type: "range", min: 0.4, max: 3, step: 0.05 },
    { key: "in", label: "Arrives at (s)", type: "range", min: 0, max: 3, step: 0.05 },
    { key: "morphAt", label: "Tap + grow at (s)", type: "range", min: 1, max: 5, step: 0.05 },
    { key: "hold", label: "Hold when done (s)", type: "range", min: 0.5, max: 5, step: 0.1 },
  ],
  duration: (p) => {
    const steps = parseSteps(str(p.steps))
    const morphAt = bool(p.fromNudge) ? num(p.morphAt) : num(p.in)
    const t0 = morphAt + (bool(p.fromNudge) ? 0.55 : 0.5)
    const sch = schedule(steps, t0, num(p.pace), bool(p.approval) ? num(p.approvalStep) : 0, num(p.approvalHold))
    return sch.end + num(p.hold) + 0.8
  },
  Component: TaskView,
}


