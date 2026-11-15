import { useRef } from "react"

const tc = (t: number) => {
  const f = Math.floor((t % 1) * 30)
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}:${String(f).padStart(2, "0")}`
}

export function Timeline({
  t,
  duration,
  playing,
  loop,
  guides,
  onSeek,
  onPlay,
  onLoop,
  onGuides,
}: {
  t: number
  duration: number
  playing: boolean
  loop: boolean
  guides: boolean
  onSeek: (t: number) => void
  onPlay: () => void
  onLoop: () => void
  onGuides: () => void
}) {
  const bar = useRef<HTMLDivElement>(null)
  const seekFrom = (clientX: number) => {
    const r = bar.current!.getBoundingClientRect()
    onSeek(Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * duration)
  }
  const ticks = Array.from({ length: Math.floor(duration) + 1 }, (_, i) => i)
  return (
    <div className="timeline">
      <button className="tl-play" onClick={onPlay} aria-label={playing ? "Pause" : "Play"}>
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14"><rect x="2.5" y="2" width="3.2" height="10" rx="1" fill="currentColor" /><rect x="8.3" y="2" width="3.2" height="10" rx="1" fill="currentColor" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3.5 2.2v9.6a.8.8 0 0 0 1.2.7l8-4.8a.8.8 0 0 0 0-1.4l-8-4.8a.8.8 0 0 0-1.2.7Z" fill="currentColor" /></svg>
        )}
      </button>
      <span className="tl-time">{tc(t)}</span>
      <div
        ref={bar}
        className="tl-bar"
        onPointerDown={(e) => {
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
          seekFrom(e.clientX)
        }}
        onPointerMove={(e) => e.buttons === 1 && seekFrom(e.clientX)}
      >
        {ticks.map((i) => (
          <span key={i} className="tl-tick" style={{ left: `${(i / duration) * 100}%` }}>
            {i}
          </span>
        ))}
        <div className="tl-fill" style={{ width: `${(t / duration) * 100}%` }} />
        <div className="tl-head" style={{ left: `${(t / duration) * 100}%` }} />
      </div>
      <span className="tl-time dim">{tc(duration)}</span>
      <button className={`tl-chip ${loop ? "on" : ""}`} onClick={onLoop}>Loop</button>
      <button className={`tl-chip ${guides ? "on" : ""}`} onClick={onGuides}>Safe areas</button>
    </div>
  )
}
