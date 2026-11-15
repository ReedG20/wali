/**
 * Deterministic animation helpers. Every composition is a pure function of time `t` (seconds), so a
 * frame renders identically in the preview and in the offline renderer.
 */

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p
/** 0→1 progress of `t` through [start, start + dur]. */
export const prog = (t: number, start: number, dur: number) => (dur <= 0 ? (t >= start ? 1 : 0) : clamp((t - start) / dur))

/** CSS cubic-bezier(x1, y1, x2, y2) as a function of linear progress. */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u
  const sy = (u: number) => ((ay * u + by) * u + cy) * u
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx
  return (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let u = x
    for (let i = 0; i < 8; i++) {
      const e = sx(u) - x
      if (Math.abs(e) < 1e-6) break
      const d = dx(u)
      if (Math.abs(d) < 1e-6) break
      u -= e / d
    }
    return sy(clamp(u))
  }
}

/** The brand's one easing: cubic-bezier(.22, 1, .36, 1). Slow, smooth, physical. */
export const easeOut = bezier(0.22, 1, 0.36, 1)
export const easeInOut = bezier(0.65, 0, 0.35, 1)
export const easeIn = bezier(0.55, 0, 1, 0.45)

/**
 * Step response of a damped spring (mass 1), 0 → 1 with optional overshoot. iOS-feel defaults:
 * stiffness 260 / damping 26 settles in ~0.6s with ~3% overshoot.
 */
export function spring(t: number, stiffness = 260, damping = 26) {
  if (t <= 0) return 0
  const w0 = Math.sqrt(stiffness)
  const zeta = damping / (2 * w0)
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta)
    return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t)
}

/** Spring progress starting at `start`. */
export const springAt = (t: number, start: number, stiffness?: number, damping?: number) =>
  spring(t - start, stiffness, damping)

/** Brand entrance: 24px rise + fade over 0.9s. Returns CSS for an element entering at `start`. */
export function rise(t: number, start: number, { dur = 0.9, dist = 24 } = {}) {
  const p = easeOut(prog(t, start, dur))
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` } as const
}

/** Fade in at `start`, fade out at `end` (exclusive of either when undefined). */
export function fadeWindow(t: number, start: number, end = Infinity, dur = 0.35) {
  return Math.min(easeOut(prog(t, start, dur)), 1 - easeInOut(prog(t, end, dur)))
}

/** A deterministic spinner angle (degrees) for `t`. */
export const spin = (t: number, rps = 1.1) => ((t * rps) % 1) * 360

/** Characters of `text` revealed by `t` when typing starts at `start` at `cps` characters/second. */
export function typed(text: string, t: number, start: number, cps = 18) {
  const n = Math.floor(clamp((t - start) * cps, 0, text.length))
  return text.slice(0, n)
}

/** Seconds needed to type `text` at `cps`. */
export const typeDur = (text: string, cps = 18) => text.length / cps
