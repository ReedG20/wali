import { Fragment, type ReactNode } from "react"
import { Frame, Glass, GlassContainer, Html, LiquidCanvas, Transform, ZStack } from "@liquid-dom/react"
import { hic } from "../lib/hic-shim"
import { useStage } from "./context"

/** One liquid-glass shape, in stage pixels (top-left origin). */
export type GlassShape = {
  key: string
  x: number
  y: number
  w: number
  h: number
  r: number
  /** Scale around the shape's centre (press feedback). */
  scale?: number
}

export type GlassLook = "light" | "clear" | "dark"

type Rgba = { r: number; g: number; b: number; a: number }

/** Optical settings per look, tuned against the dorm-room and climbing-gym plates. */
function containerFor(look: GlassLook, u: number) {
  const shadow: Rgba = { r: 0, g: 0, b: 0, a: look === "light" ? 0.16 : 0.22 }
  const base = {
    blendSupportGating: false,
    spacing: 14 * u,
    bezelWidth: 20 * u,
    shadowColor: shadow,
    shadowOffsetY: 10 * u,
    shadowBlur: 34 * u,
    specularOpacity: 0.55,
  }
  if (look === "light") return { ...base, blur: 18 * u, tint: { r: 0.99, g: 0.985, b: 0.97, a: 0.74 } }
  if (look === "dark") return { ...base, blur: 18 * u, tint: { r: 0.075, g: 0.07, b: 0.065, a: 0.5 } }
  return { ...base, blur: 7 * u, tint: { r: 1, g: 1, b: 1, a: 0.1 }, specularOpacity: 0.75 }
}

/** CSS stand-in when the browser has no WebGPU / HTML-in-Canvas (e.g. Safari). */
const FALLBACK_BG: Record<GlassLook, string> = {
  light: "rgba(250,248,244,0.72)",
  clear: "rgba(255,255,255,0.12)",
  dark: "rgba(20,18,16,0.55)",
}

export const glassAvailable = hic.webgpu && hic.drawable

/**
 * The backdrop and the glass are drawn by liquid-dom on one WebGPU canvas so the glass refracts the
 * real picture behind it. Content (text, icons) is ordinary DOM laid exactly over each shape: crisp,
 * and independent of liquid-dom's in-glass HTML path, which doesn't composite in Chrome 157.
 */
export function GlassStage({
  shapes,
  look,
  opacity = 1,
  children,
}: {
  shapes: GlassShape[]
  look: GlassLook
  opacity?: number
  children?: ReactNode
}) {
  const { w, h, u, backdrop, dpr } = useStage()

  if (!glassAvailable || !backdrop) {
    return (
      <div style={{ position: "absolute", inset: 0 }}>
        {backdrop}
        {shapes.map((s) => (
          <div
            key={s.key}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: s.w,
              height: s.h,
              borderRadius: s.r,
              transform: `scale(${s.scale ?? 1})`,
              opacity,
              background: FALLBACK_BG[look],
              backdropFilter: `blur(${18 * u}px) saturate(1.6)`,
              boxShadow: `0 ${10 * u}px ${34 * u}px rgba(0,0,0,0.18), inset 0 0 0 ${1 * u}px rgba(255,255,255,0.35)`,
            }}
          />
        ))}
        <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      </div>
    )
  }

  const c = containerFor(look, u)
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <LiquidCanvas
        maxDpr={dpr}
        style={{ position: "absolute", inset: 0, width: w, height: h }}
        canvasStyle={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      >
        <ZStack alignment="topLeading">
          <Html zIndex={-2} sizing="fill">
            <div style={{ position: "relative", width: w, height: h, overflow: "hidden" }}>{backdrop}</div>
          </Html>
          <Frame maxWidth={Infinity} maxHeight={Infinity} alignment="topLeading">
            <GlassContainer {...c} opacity={opacity}>
              <ZStack alignment="topLeading">
                {shapes.length === 0 ? (
                  <Fragment />
                ) : (
                  shapes.map((s) => (
                    <Transform
                      key={s.key}
                      x={s.x}
                      y={s.y}
                      scaleX={s.scale ?? 1}
                      scaleY={s.scale ?? 1}
                      origin={{ x: 0.5, y: 0.5 }}
                    >
                      <Glass cornerRadius={Math.min(s.r, s.w / 2, s.h / 2)}>
                        <Frame width={Math.max(1, s.w)} height={Math.max(1, s.h)} />
                      </Glass>
                    </Transform>
                  ))
                )}
              </ZStack>
            </GlassContainer>
          </Frame>
        </ZStack>
      </LiquidCanvas>
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  )
}

/** Non-glass compositions: backdrop as plain DOM, content on top. Transparent when exporting alpha. */
export function PlainStage({ children }: { children?: ReactNode }) {
  const { backdrop } = useStage()
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {backdrop}
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  )
}

/** A DOM box placed exactly over a glass shape (same rect, radius and press scale), clipping its content. */
export function OverShape({ s, children, style }: { s: GlassShape; children?: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        left: s.x,
        top: s.y,
        width: s.w,
        height: s.h,
        borderRadius: s.r,
        overflow: "hidden",
        transform: `scale(${s.scale ?? 1})`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
