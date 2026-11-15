/**
 * wali brand marks from brand kit v2: the name is the mark (no monogram), always one line, always
 * placed from the outlined files and never retyped. Ember marks only things happening now.
 */
import type { CSSProperties } from "react"

export const C = {
  paper: "#F6F4EF",
  paper2: "#ECE9E2",
  card: "#FFFFFF",
  ink: "#161513",
  ink2: "#5A564E",
  ink3: "#9A958B",
  night: "#12110F",
  cream: "#FBF7EE",
  ember: "#D27A33",
  bubble: "#E9E5DC",
  tint: "rgba(22,21,19,0.06)",
  sidebar: "#EFECE6",
} as const

export const FONT = {
  display: "'Fraunces Variable', Georgia, serif",
  body: "'Figtree Variable', system-ui, sans-serif",
  ios: "-apple-system, 'SF Pro Text', system-ui, sans-serif",
}

/** Fraunces as the brand sets it: weight 340, SOFT 100, tracking −0.03em. */
export function display(size: number, italic = false): CSSProperties {
  return {
    fontFamily: FONT.display,
    fontSize: size,
    fontWeight: 340,
    fontStyle: italic ? "italic" : "normal",
    letterSpacing: "-0.03em",
    lineHeight: 1.0,
    fontVariationSettings: italic ? '"SOFT" 100, "WONK" 1' : '"SOFT" 100, "WONK" 0',
    fontOpticalSizing: "auto",
    textWrap: "balance",
  }
}

const WORDMARK_RATIO = 322.04 / 143.85

/** The wordmark as a CSS mask, so it takes any brand colour (ink, paper, cream). */
export function Wordmark({ width, color = C.ink, style }: { width: number; color?: string; style?: CSSProperties }) {
  return (
    <span
      role="img"
      aria-label="wali"
      style={{
        display: "inline-block",
        flexShrink: 0,
        width,
        height: width / WORDMARK_RATIO,
        background: color,
        WebkitMaskImage: "url(/brand/wali-wordmark-ink.svg)",
        maskImage: "url(/brand/wali-wordmark-ink.svg)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        ...style,
      }}
    />
  )
}

/** The app icon (the word on an ink tile). Under 40px the kit's widened small icon is used. */
export function WaliIcon({ size, radius = 0.225, style }: { size: number; radius?: number; style?: CSSProperties }) {
  return (
    <img
      src={size < 40 ? "/brand/wali-icon-small.svg" : "/brand/wali-app-icon.svg"}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: size * radius, flexShrink: 0, display: "block", ...style }}
      draggable={false}
    />
  )
}

/** The live dot. Pulses with time (2.2s), like the app's ember-pulse. */
export function EmberDot({ t, size = 8, live = true, style }: { t: number; size?: number; live?: boolean; style?: CSSProperties }) {
  const ph = (Math.sin(((t % 2.2) / 2.2) * Math.PI * 2 - Math.PI / 2) + 1) / 2 // 0..1
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: live ? C.ember : "rgba(154,149,139,0.5)",
        opacity: live ? 1 - ph * 0.55 : 1,
        transform: live ? `scale(${1 - ph * 0.18})` : undefined,
        ...style,
      }}
    />
  )
}
