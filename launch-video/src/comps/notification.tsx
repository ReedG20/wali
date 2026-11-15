import { clamp, easeIn, easeInOut, easeOut, lerp, prog, springAt } from "../lib/anim"
import { wrap } from "../lib/measure"
import type { AspectId } from "../lib/plates"
import { GlassStage, OverShape, type GlassLook, type GlassShape } from "../stage/GlassStage"
import { useStage } from "../stage/context"
import { C, FONT, WaliIcon } from "../ui/brand"
import { I } from "../ui/icons"
import { bool, num, str, type Comp, type Props } from "./types"

/** iOS 26 banner metrics in points; multiplied by `s` (px per pt) for the frame. */
export const NB = { W: 372, R: 25, padL: 12, padT: 12, padR: 15, padB: 13, icon: 38, gap: 11, title: 20, line: 20, maxLines: 4 }
const MENU = { W: 268, row: 47, R: 24, gap: 10 }

/** px per pt. `u` is 1 at 1080p (smaller in the editor's fitted preview). */
export function notifScale(aspect: AspectId, size: number, u: number) {
  return (aspect === "16x9" ? 2.05 : aspect === "9x16" ? 2.72 : 2.55) * size * u
}
export function notifTop(aspect: AspectId, u: number) {
  return (aspect === "16x9" ? 58 : aspect === "9x16" ? 150 : 84) * u
}

export function bannerHeight(body: string, s: number) {
  const textW = (NB.W - NB.padL - NB.icon - NB.gap - NB.padR) * s
  const lines = Math.min(NB.maxLines, wrap(body, `400 ${15 * s}px ${FONT.ios}`, textW).length)
  return (NB.padT + NB.title + lines * NB.line + NB.padB) * s
}

export type Look = { text: string; sub: string; hair: string; press: string }
export const LOOKS: Record<GlassLook, Look> = {
  light: { text: C.ink, sub: "rgba(22,21,19,0.52)", hair: "rgba(22,21,19,0.12)", press: "rgba(22,21,19,0.08)" },
  clear: { text: "#FFFFFF", sub: "rgba(255,255,255,0.72)", hair: "rgba(255,255,255,0.22)", press: "rgba(255,255,255,0.16)" },
  dark: { text: "#FFFFFF", sub: "rgba(255,255,255,0.62)", hair: "rgba(255,255,255,0.16)", press: "rgba(255,255,255,0.12)" },
}

/** Press feedback: quick dip, springy return. */
export function press(t: number, at: number, depth = 0.035) {
  if (t < at) return 1
  const down = easeOut(prog(t, at, 0.1))
  const up = springAt(t, at + 0.12, 420, 24)
  return 1 - depth * down * (1 - up)
}

/** The banner's inner layout (icon, "wali", time, body), drawn at full size. */
export function BannerContent({
  s,
  title,
  time,
  body,
  look,
  h,
}: {
  s: number
  title: string
  time: string
  body: string
  look: Look
  h: number
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: NB.W * s,
        height: h,
        display: "flex",
        gap: NB.gap * s,
        padding: `${NB.padT * s}px ${NB.padR * s}px ${NB.padB * s}px ${NB.padL * s}px`,
        boxSizing: "border-box",
        fontFamily: FONT.ios,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <WaliIcon size={NB.icon * s} radius={0.235} style={{ marginTop: 1 * s }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", height: NB.title * s }}>
          <span style={{ fontSize: 15 * s, fontWeight: 600, color: look.text, letterSpacing: "-0.012em" }}>{title}</span>
          <span style={{ marginLeft: "auto", fontSize: 13.5 * s, color: look.sub, letterSpacing: "-0.005em" }}>{time}</span>
        </div>
        <div
          style={{
            fontSize: 15 * s,
            lineHeight: `${NB.line * s}px`,
            color: look.text,
            letterSpacing: "-0.012em",
            display: "-webkit-box",
            WebkitLineClamp: NB.maxLines,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {body}
        </div>
      </div>
    </div>
  )
}

export type NotifGeom = { banner: GlassShape; contentScale: number; contentOpacity: number; opacity: number; h: number; s: number }

/**
 * Banner geometry at time t. "island" grows out of a Dynamic-Island-sized pill (iOS 26); "drop"
 * slides down from above the frame. Both settle on a soft spring and leave the way they came.
 */
export function bannerAt(
  t: number,
  o: { w: number; aspect: AspectId; u: number; size: number; body: string; style: string; tin: number; tout: number; align: string },
): NotifGeom {
  const s = notifScale(o.aspect, o.size, o.u)
  const W = NB.W * s
  const H = bannerHeight(o.body, s)
  const top = notifTop(o.aspect, o.u)
  const margin = (o.aspect === "16x9" ? 64 : 36) * o.u
  const cx = o.align === "left" ? margin + W / 2 : o.align === "right" ? o.w - margin - W / 2 : o.w / 2

  if (o.style === "island") {
    const k = springAt(t, o.tin, 230, 23) * (1 - easeInOut(prog(t, o.tout, 0.5)))
    const pw = 126 * s * 0.92
    const ph = 37 * s * 0.92
    const w = lerp(pw, W, k)
    const h = lerp(ph, H, k)
    const r = lerp(ph / 2, NB.R * s, clamp(k))
    const opacity = easeOut(prog(t, o.tin - 0.06, 0.14)) * (1 - prog(t, o.tout + 0.4, 0.12))
    const contentOpacity = easeOut(prog(t, o.tin + 0.14, 0.32)) * (1 - easeOut(prog(t, o.tout, 0.16)))
    return {
      banner: { key: "banner", x: cx - w / 2, y: top, w, h, r },
      contentScale: w / W,
      contentOpacity,
      opacity,
      h: H,
      s,
    }
  }

  const p = springAt(t, o.tin, 190, 21)
  const q = easeIn(prog(t, o.tout, 0.42))
  const off = -H - 40 * o.u
  const y = lerp(lerp(off, top, p), off, q)
  return {
    banner: { key: "banner", x: cx - W / 2, y, w: W, h: H, r: NB.R * s, scale: lerp(0.965, 1, clamp(p)) },
    contentScale: 1,
    contentOpacity: 1,
    opacity: t < o.tin ? 0 : 1,
    h: H,
    s,
  }
}

function NotificationView({ p }: { p: Props }) {
  const { t, w, aspect, u } = useStage()
  const look = (str(p.theme) || "light") as GlassLook
  const L = LOOKS[look]
  const tin = num(p.in)
  const menu = bool(p.menu)
  const menuAt = num(p.menuAt)
  const tapAt = num(p.tapAt)
  const tout = num(p.out)
  const body = str(p.body)

  const g = bannerAt(t, { w, aspect, u, size: num(p.size), body, style: str(p.style), tin, tout, align: str(p.align) })
  const s = g.s
  const shapes: GlassShape[] = []
  const banner = { ...g.banner }

  // Long-press: the banner dips, then an action menu separates from beneath it.
  let menuShape: GlassShape | null = null
  const actions = [str(p.action1), str(p.action2)].filter(Boolean)
  if (menu && actions.length && t >= menuAt - 0.02 && t <= tout + 0.3) {
    banner.scale = (banner.scale ?? 1) * press(t, menuAt - 0.24, 0.03)
    const m = springAt(t, menuAt, 250, 24)
    const mh = actions.length * MENU.row * s
    const mw = MENU.W * s
    const restY = banner.y + g.h + MENU.gap * s
    const hideY = banner.y + g.h - mh
    const leave = easeIn(prog(t, tout - 0.08, 0.32))
    menuShape = {
      key: "menu",
      x: banner.x,
      y: lerp(lerp(hideY, restY, m), hideY, leave),
      w: mw,
      h: mh,
      r: MENU.R * s,
      scale: lerp(0.86, 1, clamp(m)) * press(t, tapAt, 0.025),
    }
  }

  shapes.push(banner)
  if (menuShape) shapes.push(menuShape)

  const tapRow = num(p.tapRow)
  const tapGlow = bool(p.tap) ? easeOut(prog(t, tapAt, 0.08)) * (1 - easeOut(prog(t, tout - 0.1, 0.25))) : 0
  const menuTextOpacity = menuShape ? easeOut(prog(t, menuAt + 0.14, 0.3)) * (1 - easeOut(prog(t, tout - 0.08, 0.18))) : 0

  return (
    <GlassStage shapes={shapes} look={look} opacity={g.opacity}>
      <OverShape s={banner}>
        <div
          style={{
            opacity: g.contentOpacity,
            transform: `scale(${g.contentScale})`,
            transformOrigin: "0 0",
            position: "absolute",
            inset: 0,
          }}
        >
          <BannerContent s={s} title={str(p.title)} time={str(p.time)} body={body} look={L} h={g.h} />
        </div>
      </OverShape>
      {menuShape && (
        <OverShape s={menuShape}>
          <div style={{ opacity: menuTextOpacity, fontFamily: FONT.ios }}>
            {actions.map((a, i) => (
              <div
                key={a}
                style={{
                  height: MENU.row * s,
                  display: "flex",
                  alignItems: "center",
                  padding: `0 ${18 * s}px`,
                  gap: 12 * s,
                  fontSize: 17 * s,
                  letterSpacing: "-0.02em",
                  color: L.text,
                  background: i === tapRow ? `rgba(0,0,0,0)` : undefined,
                  boxShadow: i > 0 ? `inset 0 ${0.5 * s}px 0 ${L.hair}` : undefined,
                  position: "relative",
                }}
              >
                {i === tapRow && tapGlow > 0 && (
                  <div style={{ position: "absolute", inset: 0, background: L.press, opacity: tapGlow }} />
                )}
                <span style={{ position: "relative", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a}</span>
                <span style={{ position: "relative" }}>
                  {i === 0 ? <I.check size={19 * s} stroke={2} color={L.text} /> : <I.clock size={19 * s} stroke={1.8} color={L.text} />}
                </span>
              </div>
            ))}
          </div>
        </OverShape>
      )}
    </GlassStage>
  )
}

export const NOTIF_PRESETS = [
  {
    id: "climb",
    label: "1 · Doomscroll → climbing gym",
    values: {
      body: "You’ve been scrolling for 40 minutes. You told Sam you’d climb this week, and the gym’s quiet until 9. Go for an hour?",
      action1: "Book a slot and text Sam",
      action2: "Not tonight",
    },
  },
  {
    id: "midterm",
    label: "2 · Midterm stress",
    values: {
      body: "Your chem midterm is Thursday. You have two free hours after lunch tomorrow. Want me to block them and pull your notes from Tuesday’s lab?",
      action1: "Block the time",
      action2: "Later",
    },
  },
  {
    id: "sleep",
    label: "3 · 1 am, class at 9",
    values: {
      body: "It’s 1:12 am and your first class is at 9. Call it a night? I’ll save the rest of the reading for the morning.",
      action1: "Good night",
      action2: "Ten more minutes",
    },
  },
  {
    id: "friend",
    label: "4 · Who restores you",
    values: {
      body: "You always sound lighter after time with Maya. It’s been three weeks. Coffee on Saturday?",
      action1: "Text Maya",
      action2: "Later",
    },
  },
  {
    id: "promise",
    label: "5 · What you promised",
    values: {
      body: "You told Professor Lee you’d send the draft by Friday. I pulled your notes from office hours into a doc.",
      action1: "Open the doc",
      action2: "Remind me at 2",
    },
  },
  {
    id: "family",
    label: "6 · Before you ask",
    values: {
      body: "Mom’s birthday is Sunday. She brought up that pottery class twice this month. Want me to find a gift card?",
      action1: "Find one",
      action2: "Remind me",
    },
  },
]

export const notification: Comp = {
  id: "notification",
  name: "iOS notification",
  group: "Overlays",
  blurb: "A Liquid Glass push notification from wali, rendered by liquid-dom so it refracts the shot behind it. Long-press reveals the actions.",
  glass: true,
  plate: "bedroom",
  defaults: {
    title: "wali",
    time: "now",
    ...NOTIF_PRESETS[0]!.values,
    theme: "light",
    style: "island",
    align: "center",
    size: 1,
    in: 0.5,
    menu: true,
    menuAt: 2.6,
    tap: true,
    tapRow: 0,
    tapAt: 4.1,
    out: 4.7,
  },
  presets: NOTIF_PRESETS,
  controls: [
    { key: "body", label: "Message", type: "textarea" },
    { key: "title", label: "App name", type: "text" },
    { key: "time", label: "Time label", type: "text" },
    { key: "theme", label: "Glass", type: "select", options: [["light", "Light (in-app banner)"], ["clear", "Clear (lock screen)"], ["dark", "Dark"]] },
    { key: "style", label: "Arrival", type: "select", options: [["island", "Grows from the Dynamic Island"], ["drop", "Slides down"]] },
    { key: "align", label: "Position", type: "select", options: [["center", "Top centre"], ["left", "Top left"], ["right", "Top right"]] },
    { key: "size", label: "Size", type: "range", min: 0.6, max: 1.5, step: 0.05 },
    { key: "menu", label: "Long-press actions", type: "toggle" },
    { key: "action1", label: "Action 1", type: "text" },
    { key: "action2", label: "Action 2", type: "text" },
    { key: "tap", label: "Tap an action", type: "toggle" },
    { key: "in", label: "Arrives at (s)", type: "range", min: 0, max: 4, step: 0.05 },
    { key: "menuAt", label: "Actions at (s)", type: "range", min: 0.5, max: 8, step: 0.05 },
    { key: "tapAt", label: "Tap at (s)", type: "range", min: 0.5, max: 10, step: 0.05 },
    { key: "out", label: "Leaves at (s)", type: "range", min: 1, max: 12, step: 0.05 },
  ],
  duration: (p) => num(p.out) + 1.0,
  Component: NotificationView,
}
