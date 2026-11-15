import { Fragment, type CSSProperties, type ReactNode } from "react"
import { clamp, easeOut, prog, typeDur, typed } from "../lib/anim"
import { PlainStage } from "../stage/GlassStage"
import { useStage } from "../stage/context"
import { C, EmberDot, FONT, WaliIcon, Wordmark } from "../ui/brand"
import { ArcSpinner, I, IosSpinner, StatusGlyphs } from "../ui/icons"
import { parseSteps } from "./task"
import { bool, num, str, type Comp, type Props } from "./types"

/* ------------------------------------------------------------------ script */

type ToolState = { label: string; detail: string; state: "running" | "done"; enter: number }

/** Everything the chat shows at time t, derived from the props. Shared by the iPhone and web views. */
function script(p: Props, t: number) {
  const question = str(p.question)
  const typeAt = num(p.typeAt)
  const cps = num(p.cps)
  const sendAt = typeAt + typeDur(question, cps) + 0.4
  const sent = t >= sendAt
  const composer = sent ? "" : typed(question, t, typeAt, cps)
  const tools = parseSteps(str(p.tools))
  const waliAt = sendAt + 0.4
  let c = sendAt + 1.0
  const toolTimes = tools.map(() => {
    const s = c
    c += 0.8
    return { start: s, done: s + 0.62 }
  })
  const streamAt = c + 0.15
  const words = countWords(str(p.answer))
  const wps = num(p.wps)
  const streamEnd = streamAt + words / wps
  const visibleTools: ToolState[] = tools
    .map((tl, i) => ({ tl, tt: toolTimes[i]! }))
    .filter(({ tt }) => t >= tt.start)
    .map(({ tl, tt }) => ({ label: t >= tt.done ? tl.done : tl.run, detail: tl.detail, state: t >= tt.done ? "done" : "running", enter: tt.start }))
  return {
    question,
    composer,
    typing: t >= typeAt && !sent,
    sendAt,
    sent,
    waliAt,
    showWali: t >= waliAt,
    thinking: t >= waliAt && visibleTools.length === 0 && t < streamAt,
    tools: visibleTools,
    revealed: Math.max(0, (t - streamAt) * wps),
    streaming: t >= streamAt && t < streamEnd,
    end: streamEnd,
  }
}

export function chatDuration(p: Props) {
  return script(p, 0).end + num(p.hold)
}

/* ------------------------------------------------------------------ streaming markdown */

type Block = { kind: "p" | "li"; text: string }

function blocks(src: string): Block[] {
  const out: Block[] = []
  let para: string[] = []
  const flush = () => {
    if (para.length) out.push({ kind: "p", text: para.join(" ") })
    para = []
  }
  for (const line of src.split("\n")) {
    const li = /^\s*[-*•]\s+(.*)$/.exec(line)
    if (!line.trim()) flush()
    else if (li) {
      flush()
      out.push({ kind: "li", text: li[1]! })
    } else para.push(line.trim())
  }
  flush()
  return out
}

type Word = { w: string; bold: boolean }
function words(text: string): Word[] {
  const out: Word[] = []
  for (const seg of text.split(/(\*\*[^*]+\*\*)/g)) {
    if (!seg) continue
    const bold = seg.startsWith("**") && seg.endsWith("**")
    for (const w of (bold ? seg.slice(2, -2) : seg).split(/\s+/).filter(Boolean)) out.push({ w, bold })
  }
  return out
}

const countWords = (src: string) => blocks(src).reduce((n, b) => n + words(b.text).length, 0)

/**
 * Renders markdown with the first `revealed` words visible; the newest few fade in, like the app's
 * smooth-text streaming. Unrevealed words take no space, so the reply grows as it streams.
 */
function StreamMd({ src, revealed, size, lh, gap, bullet, color = C.ink, boldWeight = 600 }: { src: string; revealed: number; size: number; lh: number; gap: number; bullet: number; color?: string; boldWeight?: number }) {
  let idx = 0
  const fade = 5
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, fontSize: size, lineHeight: `${lh}px`, color }}>
      {blocks(src).map((b, bi) => {
        const ws = words(b.text)
        const first = idx
        const nodes = ws.map((w, i) => {
          const k = idx++
          if (k >= Math.ceil(revealed)) return null
          const op = clamp((revealed - k) / fade + 0.15)
          return (
            <Fragment key={i}>
              <span style={{ opacity: op, fontWeight: w.bold ? boldWeight : undefined }}>{w.w}</span>{" "}
            </Fragment>
          )
        })
        if (first >= Math.ceil(revealed)) return null
        if (b.kind === "li")
          return (
            <div key={bi} style={{ display: "flex", marginTop: -gap * 0.4 }}>
              <span style={{ width: bullet, flexShrink: 0, color: C.ink2 }}>•</span>
              <span>{nodes}</span>
            </div>
          )
        return <div key={bi}>{nodes}</div>
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ shared message pieces */

type V = "ios" | "web"

function NudgeHistory({ v, k, p }: { v: V; k: number; p: Props }) {
  const ios = v === "ios"
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 22 * k,
        padding: 16 * k,
        maxWidth: ios ? undefined : 460 * k,
        boxShadow: `0 ${1 * k}px ${2 * k}px rgba(0,0,0,0.04), 0 ${18 * k}px ${40 * k}px ${-28 * k}px rgba(0,0,0,0.35)`,
        outline: ios ? undefined : `${1 * k}px solid rgba(22,21,19,0.05)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 * k, fontSize: 12.5 * k, color: C.ink2, whiteSpace: "nowrap" }}>
        <WaliIcon size={(ios ? 18 : 22) * k} />
        <span style={{ fontWeight: ios ? 500 : 500, color: C.ink }}>wali</span>
        <span style={{ color: C.ink3 }}>· Check-in</span>
        <span style={{ marginLeft: "auto", color: C.ink3 }}>{str(p.historyTime)}</span>
      </div>
      <p style={{ margin: `${10 * k}px 0 0`, fontSize: (ios ? 15.5 : 15) * k, lineHeight: 1.5, color: C.ink }}>{str(p.historyText)}</p>
      <div style={{ marginTop: 14 * k, display: "flex", alignItems: "center", gap: 6 * k }}>
        <span style={{ height: 32 * k, display: "inline-flex", alignItems: "center", gap: 6 * k, padding: `0 ${14 * k}px`, borderRadius: 999, background: C.tint, fontSize: 13 * k, fontWeight: 500, color: C.ink }}>
          <I.check size={13 * k} stroke={2.4} /> {str(p.historyChoice)}
        </span>
        {!ios && (
          <span style={{ marginLeft: "auto", display: "flex", gap: 2 * k, color: C.ink3 }}>
            <span style={{ width: 32 * k, height: 32 * k, display: "grid", placeItems: "center", borderRadius: 999, background: C.tint, color: C.ink }}>
              <I.thumbUp size={16 * k} />
            </span>
            <span style={{ width: 32 * k, height: 32 * k, display: "grid", placeItems: "center" }}>
              <I.thumbDown size={16 * k} />
            </span>
          </span>
        )}
      </div>
    </div>
  )
}

function UserBubble({ text, k, v, t, at }: { text: string; k: number; v: V; t: number; at: number }) {
  const e = easeOut(prog(t, at, 0.6))
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", opacity: e, transform: `translateY(${(1 - e) * 10 * k}px)` }}>
      <div
        style={{
          maxWidth: v === "ios" ? "86%" : "85%",
          background: C.bubble,
          borderRadius: `${22 * k}px ${22 * k}px ${8 * k}px ${22 * k}px`,
          padding: v === "ios" ? `${10 * k}px ${16 * k}px` : `${10 * k}px ${16 * k}px`,
          fontSize: (v === "ios" ? 15.5 : 15) * k,
          lineHeight: v === "ios" ? `${22 * k}px` : 1.625,
          color: C.ink,
        }}
      >
        {text}
      </div>
    </div>
  )
}

function ToolChip({ tool, k, v, t }: { tool: ToolState; k: number; v: V; t: number }) {
  const e = easeOut(prog(t, tool.enter, 0.45))
  const ios = v === "ios"
  const Icon = /calendar/i.test(tool.label) ? I.calendar : /read|recent/i.test(tool.label) ? I.textBubble : I.search
  return (
    <div style={{ margin: `${(ios ? 3 : 6) * k}px 0`, opacity: e, transform: `translateY(${(1 - e) * 6 * k}px)` }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: (ios ? 7 : 8) * k,
          maxWidth: "100%",
          padding: ios ? `${7 * k}px ${12 * k}px ${7 * k}px ${10 * k}px` : `${6 * k}px ${12 * k}px ${6 * k}px ${10 * k}px`,
          borderRadius: 999,
          background: ios ? C.tint : "rgba(22,21,19,0.04)",
          color: C.ink2,
          fontSize: 13 * k,
          whiteSpace: "nowrap",
        }}
      >
        {tool.state === "running" ? (
          ios ? <IosSpinner t={t} size={14 * k} color={C.ink3} /> : <ArcSpinner t={t} size={14 * k} />
        ) : (
          <Icon size={(ios ? 14 : 16) * k} stroke={1.8} color={C.ink2} />
        )}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {tool.label}
          {tool.detail && <span style={{ color: C.ink3 }}> · {tool.detail}</span>}
        </span>
        <I.chevronDown size={(ios ? 10 : 14) * k} stroke={2} color={C.ink3} />
      </span>
    </div>
  )
}

function Thread({ p, t, v, k }: { p: Props; t: number; v: V; k: number }) {
  const s = script(p, t)
  const ios = v === "ios"
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: (ios ? 22 : 28) * k }}>
      {bool(p.history) && <NudgeHistory v={v} k={k} p={p} />}
      {s.sent && <UserBubble text={s.question} k={k} v={v} t={t} at={s.sendAt} />}
      {s.showWali && (
        <div style={{ display: "flex", gap: (ios ? 11 : 12) * k, opacity: easeOut(prog(t, s.waliAt, 0.5)) }}>
          <div style={{ paddingTop: (ios ? 2 : 1) * k }}>
            <WaliIcon size={(ios ? 24 : 26) * k} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {s.tools.map((tool, i) => (
              <ToolChip key={i} tool={tool} k={k} v={v} t={t} />
            ))}
            {s.thinking && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 * k, height: (ios ? 26 : 28) * k, color: C.ink3, fontSize: 14 * k }}>
                {ios ? <IosSpinner t={t} size={15 * k} color={C.ink3} /> : <ArcSpinner t={t} size={14 * k} />}
                Thinking
              </div>
            )}
            {s.revealed > 0 && (
              <div style={{ marginTop: s.tools.length ? 8 * k : 0 }}>
                <StreamMd
                  src={str(p.answer)}
                  revealed={s.revealed}
                  size={(ios ? 16 : 15.5) * k}
                  lh={(ios ? 25 : 25) * k}
                  gap={10 * k}
                  bullet={(ios ? 16 : 18) * k}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ iPhone */

const PH = { W: 402, H: 874, R: 58, top: 54, header: 44 }

const iosGlass = (k: number): CSSProperties => ({
  background: "rgba(255,255,255,0.58)",
  backdropFilter: `blur(${14 * k}px) saturate(1.9)`,
  WebkitBackdropFilter: `blur(${14 * k}px) saturate(1.9)`,
  boxShadow: `inset 0 0 0 ${0.6 * k}px rgba(255,255,255,0.85), inset 0 ${1 * k}px ${1.5 * k}px rgba(255,255,255,0.9), 0 ${6 * k}px ${22 * k}px rgba(22,21,19,0.10), 0 0 0 ${0.5 * k}px rgba(22,21,19,0.06)`,
})

function TabIcon({ i, k, on }: { i: number; k: number; on: boolean }) {
  const c = on ? C.ink : C.ink3
  const sz = 23 * k
  if (i === 0) return <I.bubbleFill size={sz} color={c} />
  if (i === 1)
    return (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinejoin="round">
        <path d="M15.5 9.2c0-3.1-2.9-5.7-6.5-5.7S2.5 6.1 2.5 9.2c0 1.6.8 3 2 4.1l-.6 3 3-1.4c.7.2 1.4.3 2.1.3" />
        <path d="M21.5 15c0-2.6-2.5-4.8-5.5-4.8S10.5 12.4 10.5 15s2.5 4.8 5.5 4.8c.6 0 1.2-.1 1.8-.3l2.5 1.2-.5-2.5c1-.8 1.7-2 1.7-3.2Z" />
      </svg>
    )
  if (i === 2) return <I.wave size={sz} color={c} stroke={1.8} />
  if (i === 3) return <I.brain size={sz} color={c} stroke={1.6} />
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.2" />
    </svg>
  )
}

function PhoneScreen({ p, t, k, height }: { p: Props; t: number; k: number; height: number }) {
  const s = script(p, t)
  const hpt = height / k
  const tabTop = hpt - 21 - 62
  const composerTop = tabTop - 10 - 52
  const listBottom = composerTop - 10
  const pressK = 1 - 0.12 * easeOut(prog(t, s.sendAt - 0.08, 0.08)) * (1 - easeOut(prog(t, s.sendAt + 0.04, 0.2)))
  const canSend = s.composer.length > 0
  const caret = s.typing && Math.floor(t * 2) % 2 === 0

  return (
    <div style={{ position: "absolute", inset: 0, background: C.paper, fontFamily: FONT.body, overflow: "hidden", WebkitFontSmoothing: "antialiased" }}>
      {/* messages, bottom-anchored like the app's inverted list */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: listBottom * k, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: `0 ${18 * k}px ${8 * k}px`, boxSizing: "border-box", overflow: "hidden" }}>
        <Thread p={p} t={t} v="ios" k={k} />
      </div>

      {/* scroll-edge fade under the transparent header */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: (PH.top + PH.header + 28) * k,
          background: `linear-gradient(to bottom, rgba(246,244,239,1) 0%, rgba(246,244,239,0.94) 62%, rgba(246,244,239,0) 100%)`,
        }}
      />

      {/* status bar + Dynamic Island */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: PH.top * k, display: "flex", alignItems: "center", padding: `0 ${34 * k}px 0 ${50 * k}px`, boxSizing: "border-box", fontFamily: FONT.ios }}>
        <span style={{ fontSize: 17 * k, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink, paddingTop: 4 * k }}>{str(p.clock)}</span>
        <span style={{ marginLeft: "auto", paddingTop: 4 * k }}>
          <StatusGlyphs color={C.ink} h={12 * k} />
        </span>
      </div>
      <div style={{ position: "absolute", top: 11 * k, left: "50%", width: 124 * k, height: 36 * k, marginLeft: -62 * k, borderRadius: 999, background: "#000" }} />

      {/* header: wordmark + listening, compose button */}
      <div style={{ position: "absolute", top: PH.top * k, left: 0, right: 0, height: PH.header * k }}>
        <div style={{ position: "absolute", left: "50%", top: 2 * k, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Wordmark width={56 * k} />
          <div style={{ display: "flex", alignItems: "center", gap: 5 * k, marginTop: 2 * k, fontSize: 11.5 * k, color: C.ink3 }}>
            <EmberDot t={t} size={6 * k} />
            Listening
          </div>
        </div>
        <div style={{ position: "absolute", right: 16 * k, top: 0, width: 44 * k, height: 44 * k, borderRadius: 999, display: "grid", placeItems: "center", ...iosGlass(k) }}>
          <I.compose size={20 * k} color={C.ink} stroke={1.7} />
        </div>
      </div>

      {/* composer: Liquid Glass capsule */}
      <div style={{ position: "absolute", left: 12 * k, right: 12 * k, top: composerTop * k, minHeight: 52 * k, borderRadius: 26 * k, display: "flex", alignItems: "center", gap: 8 * k, padding: `${6 * k}px ${6 * k}px ${6 * k}px ${18 * k}px`, boxSizing: "border-box", ...iosGlass(k) }}>
        <div style={{ flex: 1, fontSize: 16 * k, lineHeight: `${21 * k}px`, color: canSend ? C.ink : C.ink3, whiteSpace: "nowrap", overflow: "hidden" }}>
          {canSend ? s.composer : "Talk to wali…"}
          {caret && <span style={{ display: "inline-block", width: 2 * k, height: 20 * k, background: C.ember, verticalAlign: "middle", marginLeft: 1 * k, borderRadius: 2 }} />}
        </div>
        <div style={{ width: 40 * k, height: 40 * k, borderRadius: 999, display: "grid", placeItems: "center", background: canSend ? C.ink : "rgba(22,21,19,0.08)", transform: `scale(${pressK})` }}>
          <I.arrowUp size={17 * k} stroke={2.2} color={canSend ? "#fff" : C.ink3} />
        </div>
      </div>

      {/* tab bar: floating Liquid Glass */}
      <div style={{ position: "absolute", left: 16 * k, right: 16 * k, top: tabTop * k, height: 62 * k, borderRadius: 999, display: "flex", alignItems: "center", padding: `0 ${5 * k}px`, ...iosGlass(k) }}>
        {["wali", "Chats", "Transcripts", "Memory", "Pendant"].map((label, i) => (
          <div
            key={label}
            style={{
              flex: 1,
              height: 54 * k,
              borderRadius: 999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2 * k,
              background: i === 0 ? "rgba(22,21,19,0.07)" : undefined,
              color: i === 0 ? C.ink : C.ink3,
              fontSize: 10 * k,
              fontWeight: 500,
            }}
          >
            <TabIcon i={i} k={k} on={i === 0} />
            {label}
          </div>
        ))}
      </div>

      {/* home indicator */}
      <div style={{ position: "absolute", bottom: 8 * k, left: "50%", width: 140 * k, height: 5 * k, marginLeft: -70 * k, borderRadius: 999, background: C.ink }} />
    </div>
  )
}

function ChatPhoneView({ p }: { p: Props }) {
  const { t, w, h, aspect } = useStage()
  const mode = str(p.frame) === "auto" ? (aspect === "9x16" ? "full" : "float") : str(p.frame)
  const enter = bool(p.animateIn) ? easeOut(prog(t, 0, 0.9)) : 1

  if (mode === "full") {
    const k = w / PH.W
    return (
      <PlainStage>
        <div style={{ position: "absolute", inset: 0, opacity: enter }}>
          <PhoneScreen p={p} t={t} k={k} height={h} />
        </div>
      </PlainStage>
    )
  }

  const device = bool(p.device)
  const bezel = device ? 11 : 0
  const totalH = h * num(p.phoneSize)
  const k = totalH / (PH.H + bezel * 2)
  const sw = PH.W * k
  const sh = PH.H * k
  const outerW = sw + bezel * 2 * k
  const pos = str(p.position)
  const left = pos === "left" ? w * 0.28 - outerW / 2 : pos === "right" ? w * 0.72 - outerW / 2 : (w - outerW) / 2
  const top = (h - totalH) / 2

  return (
    <PlainStage>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: outerW,
          height: totalH,
          borderRadius: (PH.R + bezel) * k,
          background: device ? "linear-gradient(145deg, #4a4642, #1c1a18 30%, #0d0c0b 70%, #3a3733)" : undefined,
          padding: bezel * k,
          boxSizing: "border-box",
          boxShadow: `0 ${40 * k}px ${90 * k}px ${-30 * k}px rgba(0,0,0,0.6), 0 ${8 * k}px ${24 * k}px rgba(0,0,0,0.18)`,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 40 * k}px)`,
        }}
      >
        <div style={{ position: "relative", width: sw, height: sh, borderRadius: PH.R * k, overflow: "hidden", background: "#000", boxShadow: device ? `0 0 0 ${1.5 * k}px #000` : undefined }}>
          <PhoneScreen p={p} t={t} k={k} height={sh} />
        </div>
      </div>
    </PlainStage>
  )
}

/* ------------------------------------------------------------------ web app */

const WEB_NAV: [string, (pp: { size?: number; color?: string; stroke?: number }) => ReactNode][] = [
  ["Home", I.home],
  ["Memory", I.brain],
  ["Transcripts", I.note],
  ["Voices", I.users],
  ["Pendant", I.wave],
  ["Connections", I.plug],
  ["Activity", I.activity],
]

function WebWindow({ p, t, k }: { p: Props; t: number; k: number }) {
  const s = script(p, t)
  const canSend = s.composer.length > 0
  const caret = s.typing && Math.floor(t * 2) % 2 === 0
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", background: C.sidebar, fontFamily: FONT.body, WebkitFontSmoothing: "antialiased", color: C.ink }}>
      {/* sidebar */}
      <div style={{ width: 256 * k, flexShrink: 0, padding: `${16 * k}px ${12 * k}px`, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 8 * k, padding: `${2 * k}px ${6 * k}px ${14 * k}px` }}>
          {["#ED6A5E", "#F4BF4F", "#61C554"].map((c) => (
            <span key={c} style={{ width: 12 * k, height: 12 * k, borderRadius: "50%", background: c, boxShadow: `inset 0 0 0 ${0.5 * k}px rgba(0,0,0,0.12)` }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${4 * k}px ${6 * k}px` }}>
          <Wordmark width={50 * k} />
          <span style={{ display: "flex", alignItems: "center", gap: 6 * k, fontSize: 12 * k, color: C.ink3 }}>
            <EmberDot t={t} size={8 * k} /> Listening
          </span>
        </div>
        <div style={{ marginTop: 16 * k, height: 40 * k, borderRadius: 999, background: C.ink, color: "#fff", display: "flex", alignItems: "center", gap: 8 * k, padding: `0 ${16 * k}px`, fontSize: 13.5 * k, fontWeight: 500 }}>
          <I.plus size={16 * k} stroke={2} color="#fff" /> New chat
        </div>
        <div style={{ marginTop: 14 * k, display: "flex", flexDirection: "column", gap: 2 * k }}>
          {WEB_NAV.map(([label, Icon], i) => (
            <div
              key={label}
              style={{
                height: 36 * k,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                gap: 8 * k,
                padding: `0 ${12 * k}px`,
                fontSize: 13.5 * k,
                color: i === 0 ? C.ink : C.ink2,
                background: i === 0 ? "#fff" : undefined,
                boxShadow: i === 0 ? `0 ${1 * k}px ${2 * k}px rgba(0,0,0,0.06)` : undefined,
              }}
            >
              <Icon size={16 * k} stroke={1.7} />
              {label}
            </div>
          ))}
        </div>
        <p style={{ margin: `${18 * k}px 0 ${6 * k}px`, padding: `0 ${12 * k}px`, fontSize: 12 * k, color: C.ink3 }}>Chats</p>
        {["Midterm plan", "Gift for Mom", "Sleep this month"].map((c) => (
          <div key={c} style={{ height: 36 * k, display: "flex", alignItems: "center", padding: `0 ${12 * k}px`, fontSize: 13.5 * k, color: C.ink2 }}>
            {c}
          </div>
        ))}
      </div>

      {/* inset main panel */}
      <div style={{ flex: 1, margin: `${8 * k}px ${8 * k}px ${8 * k}px 0`, borderRadius: 14 * k, background: C.paper, boxShadow: `0 ${1 * k}px ${3 * k}px rgba(0,0,0,0.05)`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 56 * k, flexShrink: 0, display: "flex", alignItems: "center", gap: 10 * k, padding: `0 ${16 * k}px` }}>
          <span style={{ width: 28 * k, height: 28 * k, display: "grid", placeItems: "center", color: C.ink2 }}>
            <I.sidebar size={17 * k} stroke={1.7} />
          </span>
          <span style={{ fontSize: 14 * k, fontWeight: 500 }}>Home</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 * k, fontSize: 12 * k, color: C.ink3 }}>
            <EmberDot t={t} size={8 * k} /> Listening through your pendant
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
          <div style={{ width: 720 * k, margin: "0 auto", padding: `${24 * k}px ${20 * k}px ${40 * k}px`, boxSizing: "border-box" }}>
            <Thread p={p} t={t} v="web" k={k} />
          </div>
        </div>
        <div style={{ width: 720 * k, margin: "0 auto", padding: `0 ${20 * k}px ${20 * k}px`, boxSizing: "border-box" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8 * k,
              borderRadius: 26 * k,
              padding: `${8 * k}px ${8 * k}px ${8 * k}px ${20 * k}px`,
              background: "#fff",
              boxShadow: `0 ${1 * k}px ${2 * k}px rgba(0,0,0,0.04), 0 ${18 * k}px ${40 * k}px ${-28 * k}px rgba(0,0,0,0.35)`,
              outline: `${1 * k}px solid rgba(22,21,19,0.05)`,
            }}
          >
            <div style={{ flex: 1, padding: `${8 * k}px 0`, fontSize: 15.5 * k, lineHeight: `${24 * k}px`, color: canSend ? C.ink : C.ink3, whiteSpace: "nowrap", overflow: "hidden" }}>
              {canSend ? s.composer : "Talk to wali…"}
              {caret && <span style={{ display: "inline-block", width: 2 * k, height: 19 * k, background: C.ink, verticalAlign: "middle", marginLeft: 1 * k }} />}
            </div>
            <div style={{ width: 40 * k, height: 40 * k, borderRadius: 999, display: "grid", placeItems: "center", background: canSend ? C.ink : "rgba(22,21,19,0.15)" }}>
              <I.arrowUp size={18 * k} stroke={2.2} color={canSend ? "#fff" : C.ink3} />
            </div>
          </div>
          <p style={{ margin: `${8 * k}px 0 0`, textAlign: "center", fontSize: 11.5 * k, color: C.ink3 }}>
            wali asks before anything others would see. It can be wrong; check what matters.
          </p>
        </div>
      </div>
    </div>
  )
}

function ChatWebView({ p }: { p: Props }) {
  const { t, w, h, aspect } = useStage()
  const enter = bool(p.animateIn) ? easeOut(prog(t, 0, 0.9)) : 1
  const ww = aspect === "16x9" ? 1280 : 820
  const wh = aspect === "16x9" ? 780 : aspect === "9x16" ? 1240 : 900
  const k = Math.min((w * num(p.windowSize)) / ww, (h * num(p.windowSize)) / wh)
  return (
    <PlainStage>
      <div
        style={{
          position: "absolute",
          left: (w - ww * k) / 2,
          top: (h - wh * k) / 2,
          width: ww * k,
          height: wh * k,
          borderRadius: 16 * k,
          overflow: "hidden",
          boxShadow: `0 ${40 * k}px ${100 * k}px ${-30 * k}px rgba(0,0,0,0.55), 0 0 0 ${1 * k}px rgba(0,0,0,0.12)`,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 40 * k}px)`,
        }}
      >
        <WebWindow p={p} t={t} k={k} />
      </div>
    </PlainStage>
  )
}

/* ------------------------------------------------------------------ comps */

const CHAT_DEFAULTS: Props = {
  question: "Why have I felt so drained this week?",
  tools: ["Searching your conversations | Searched your conversations | “this week”", "Reading recent conversations | Read recent conversations | "].join("\n"),
  answer: [
    "A few things stood out from your week:",
    "",
    "- **Sleep.** You were on your phone past 1 am four nights in a row.",
    "- **People.** You haven’t seen Maya or the climbing crew since Sunday, and you usually sound lighter after both.",
    "- **Chem.** The midterm came up nine times, mostly late at night.",
    "",
    "Want me to block two study sessions before Thursday and keep tonight free for climbing?",
  ].join("\n"),
  history: true,
  historyTime: "11:48 pm",
  historyText: "You’ve been scrolling for 40 minutes. You told Sam you’d climb this week, and the gym’s quiet until 9. Go for an hour?",
  historyChoice: "Book a slot and text Sam",
  typeAt: 0.8,
  cps: 22,
  wps: 15,
  hold: 2.5,
  animateIn: false,
}

const CHAT_CONTROLS: Comp["controls"] = [
  { key: "question", label: "You ask", type: "textarea" },
  { key: "answer", label: "wali answers (markdown)", type: "textarea", hint: "Paragraphs, - bullets and **bold** stream in word by word." },
  { key: "tools", label: "Tools it uses", type: "textarea", hint: "One per line: doing | done | detail" },
  { key: "history", label: "Show the earlier nudge", type: "toggle" },
  { key: "historyText", label: "Earlier nudge", type: "textarea" },
  { key: "historyChoice", label: "What you picked", type: "text" },
  { key: "typeAt", label: "Start typing at (s)", type: "range", min: 0, max: 4, step: 0.05 },
  { key: "cps", label: "Typing speed (chars/s)", type: "range", min: 8, max: 40, step: 1 },
  { key: "wps", label: "Streaming speed (words/s)", type: "range", min: 4, max: 40, step: 1 },
  { key: "hold", label: "Hold at the end (s)", type: "range", min: 0, max: 6, step: 0.1 },
  { key: "animateIn", label: "Rise in at the start", type: "toggle" },
]

export const chatPhone: Comp = {
  id: "chat-ios",
  name: "Chat · iPhone",
  group: "App screens",
  blurb: "The wali iOS app's home thread: you type, wali thinks, uses its tools, and streams the answer back. Full-bleed in 9:16, a floating phone in 16:9.",
  glass: false,
  plate: "library",
  defaults: { ...CHAT_DEFAULTS, clock: "11:52", frame: "auto", device: true, phoneSize: 0.9, position: "center" },
  controls: [
    ...CHAT_CONTROLS,
    { key: "frame", label: "Framing", type: "select", options: [["auto", "Auto (full in 9:16)"], ["float", "Floating phone"], ["full", "Full screen"]] },
    { key: "device", label: "Show the iPhone", type: "toggle" },
    { key: "phoneSize", label: "Phone size", type: "range", min: 0.5, max: 1.6, step: 0.01 },
    { key: "position", label: "Phone position", type: "select", options: [["center", "Centre"], ["left", "Left third"], ["right", "Right third"]] },
    { key: "clock", label: "Status bar time", type: "text" },
  ],
  duration: chatDuration,
  Component: ChatPhoneView,
}

export const chatWeb: Comp = {
  id: "chat-web",
  name: "Chat · Web app",
  group: "App screens",
  blurb: "The same exchange in the wali web app: sidebar, Home thread, tool rows and the streamed reply.",
  glass: false,
  plate: "library",
  defaults: { ...CHAT_DEFAULTS, windowSize: 0.9 },
  controls: [...CHAT_CONTROLS, { key: "windowSize", label: "Window size", type: "range", min: 0.5, max: 1, step: 0.01 }],
  duration: chatDuration,
  Component: ChatWebView,
}


