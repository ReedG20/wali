/**
 * Line icons drawn to sit with SF Symbols (iOS) and Hugeicons (web): 24-unit grid, round caps.
 */
import type { CSSProperties, ReactNode } from "react"

type P = { size?: number; color?: string; stroke?: number; style?: CSSProperties }

function Svg({ size = 16, color = "currentColor", stroke = 1.7, style, children, fill = "none" }: P & { children: ReactNode; fill?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0, ...style }}
      aria-hidden
    >
      {children}
    </svg>
  )
}

export const I = {
  search: (p: P) => (
    <Svg {...p}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 20 20" />
    </Svg>
  ),
  calendar: (p: P) => (
    <Svg {...p}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </Svg>
  ),
  calendarPlus: (p: P) => (
    <Svg {...p}>
      <path d="M20.5 11V8.5A3.5 3.5 0 0 0 17 5H7a3.5 3.5 0 0 0-3.5 3.5V17A3.5 3.5 0 0 0 7 20.5h5" />
      <path d="M3.5 10h17M8 3v4M16 3v4M18 15v6M15 18h6" />
    </Svg>
  ),
  ticket: (p: P) => (
    <Svg {...p}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v2a2.5 2.5 0 0 0 0 5v2a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-2a2.5 2.5 0 0 0 0-5Z" />
      <path d="M14 5.5v13" strokeDasharray="2 2.4" />
    </Svg>
  ),
  message: (p: P) => (
    <Svg {...p}>
      <path d="M20 11.5c0 4.1-3.6 7.5-8 7.5-1.2 0-2.3-.2-3.3-.6L4 19.5l1.3-3.6A7.1 7.1 0 0 1 4 11.5C4 7.4 7.6 4 12 4s8 3.4 8 7.5Z" />
    </Svg>
  ),
  textBubble: (p: P) => (
    <Svg {...p}>
      <path d="M20 11.5c0 4.1-3.6 7.5-8 7.5-1.2 0-2.3-.2-3.3-.6L4 19.5l1.3-3.6A7.1 7.1 0 0 1 4 11.5C4 7.4 7.6 4 12 4s8 3.4 8 7.5Z" />
      <path d="M8.5 10h7M8.5 13.2h4.5" />
    </Svg>
  ),
  note: (p: P) => (
    <Svg {...p}>
      <path d="M6.5 3.5h7l4.5 4.5v10.5a2 2 0 0 1-2 2h-9.5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" />
      <path d="M13.5 3.5V8H18M8 12.5h7M8 16h5" />
    </Svg>
  ),
  clock: (p: P) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  ),
  pin: (p: P) => (
    <Svg {...p}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </Svg>
  ),
  check: (p: P) => (
    <Svg {...p}>
      <path d="m5 12.5 4.2 4.2L19 7" />
    </Svg>
  ),
  arrowUp: (p: P) => (
    <Svg {...p}>
      <path d="M12 19.5V5M6 11l6-6 6 6" />
    </Svg>
  ),
  chevronDown: (p: P) => (
    <Svg {...p}>
      <path d="m6 9.5 6 6 6-6" />
    </Svg>
  ),
  plus: (p: P) => (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  compose: (p: P) => (
    <Svg {...p}>
      <path d="M11 4.5H7A3.5 3.5 0 0 0 3.5 8v9A3.5 3.5 0 0 0 7 20.5h9a3.5 3.5 0 0 0 3.5-3.5v-4" />
      <path d="M17.6 3.6a1.9 1.9 0 0 1 2.8 2.8L12.5 14.3 9 15l.7-3.5Z" />
    </Svg>
  ),
  thumbUp: (p: P) => (
    <Svg {...p}>
      <path d="M7.5 10.5v9h-3v-9Zm0 0 3.6-6.2a1.7 1.7 0 0 1 3.1 1.2l-.7 3.7h4.6a2 2 0 0 1 2 2.4l-1.3 6.2a2 2 0 0 1-2 1.7H7.5" />
    </Svg>
  ),
  thumbDown: (p: P) => (
    <Svg {...p} style={{ transform: "scaleY(-1)", ...p.style }}>
      <path d="M7.5 10.5v9h-3v-9Zm0 0 3.6-6.2a1.7 1.7 0 0 1 3.1 1.2l-.7 3.7h4.6a2 2 0 0 1 2 2.4l-1.3 6.2a2 2 0 0 1-2 1.7H7.5" />
    </Svg>
  ),
  home: (p: P) => (
    <Svg {...p}>
      <path d="M4 10.5 12 4l8 6.5V18a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18Z" />
      <path d="M9.5 20.5v-5.5h5v5.5" />
    </Svg>
  ),
  brain: (p: P) => (
    <Svg {...p}>
      <path d="M12 5.5a3 3 0 0 0-5.6-1.4A3.3 3.3 0 0 0 4 9.2a3.4 3.4 0 0 0 .4 6A3.2 3.2 0 0 0 8 19.6a3 3 0 0 0 4 .4Zm0 0a3 3 0 0 1 5.6-1.4A3.3 3.3 0 0 1 20 9.2a3.4 3.4 0 0 1-.4 6 3.2 3.2 0 0 1-3.6 4.4 3 3 0 0 1-4 .4Z" />
      <path d="M12 5.5V20" />
    </Svg>
  ),
  users: (p: P) => (
    <Svg {...p}>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5M16 5.2a3.3 3.3 0 0 1 0 6.6M18 14.6c1.6.6 2.7 2.2 3 4.9" />
    </Svg>
  ),
  wave: (p: P) => (
    <Svg {...p}>
      <path d="M3 12h1.5M7 8v8M10.5 5v14M14 9v6M17.5 7v10M21 12h-1" />
    </Svg>
  ),
  plug: (p: P) => (
    <Svg {...p}>
      <path d="M9 3.5V8M15 3.5V8M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0ZM12 17v3.5" />
    </Svg>
  ),
  activity: (p: P) => (
    <Svg {...p}>
      <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
    </Svg>
  ),
  bolt: (p: P) => (
    <Svg {...p}>
      <path d="M13 3 5 13.5h6L10 21l8-10.5h-6Z" />
    </Svg>
  ),
  sidebar: (p: P) => (
    <Svg {...p}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="3.5" />
      <path d="M9.5 4.5v15" />
    </Svg>
  ),
  // Filled glyphs for the iOS tab bar
  bubbleFill: ({ size = 16, color = "currentColor", style }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", ...style }} aria-hidden>
      <path fill={color} d="M12 3.5c-5 0-9 3.5-9 7.9 0 2.3 1.1 4.4 2.9 5.8L5 21l4.3-2.2c.9.2 1.8.3 2.7.3 5 0 9-3.5 9-7.8s-4-7.8-9-7.8Z" />
    </svg>
  ),
}

/** UIActivityIndicator-style spinner: eight fading spokes, driven by `t` so renders are deterministic. */
export function IosSpinner({ t, size = 16, color = "#161513" }: { t: number; size?: number; color?: string }) {
  const step = Math.floor(t * 12) % 8
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }} aria-hidden>
      {Array.from({ length: 8 }, (_, i) => {
        const age = (step - i + 8) % 8
        return (
          <line
            key={i}
            x1="12"
            y1="3.2"
            x2="12"
            y2="7.6"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity={1 - age * 0.11}
            transform={`rotate(${i * 45} 12 12)`}
          />
        )
      })}
    </svg>
  )
}

/** shadcn/lucide-style arc spinner (the web app's Spinner). */
export function ArcSpinner({ t, size = 14, color = "currentColor" }: { t: number; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0, transform: `rotate(${(t * 1.3 * 360) % 360}deg)` }} aria-hidden>
      <path d="M21 12a9 9 0 1 1-6.2-8.6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** iOS status bar glyphs. */
export function StatusGlyphs({ color = "#161513", h = 12 }: { color?: string; h?: number }) {
  const k = h / 12
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 * k }}>
      <svg width={18 * k} height={12 * k} viewBox="0 0 18 12" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 4.8} y={9 - i * 3} width="3.2" height={3 + i * 3} rx="0.9" fill={color} />
        ))}
      </svg>
      <svg width={16 * k} height={12 * k} viewBox="0 0 16 12" aria-hidden>
        <path d="M8 11.3 5.6 8.8a3.4 3.4 0 0 1 4.8 0Z" fill={color} />
        <path d="M3.5 6.7a6.4 6.4 0 0 1 9 0L11.4 7.8a4.9 4.9 0 0 0-6.8 0Z" fill={color} />
        <path d="M1.3 4.5a9.5 9.5 0 0 1 13.4 0L13.6 5.6a8 8 0 0 0-11.2 0Z" fill={color} />
      </svg>
      <svg width={27 * k} height={13 * k} viewBox="0 0 27 13" aria-hidden>
        <rect x="0.6" y="0.6" width="23" height="11.8" rx="3.8" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="1.1" />
        <rect x="2.4" y="2.4" width="17.5" height="8.2" rx="2.3" fill={color} />
        <path d="M25.2 4.4v4.2c.8-.3 1.3-1.1 1.3-2.1s-.5-1.8-1.3-2.1Z" fill={color} fillOpacity="0.45" />
      </svg>
    </div>
  )
}
