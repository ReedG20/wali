import { useEffect, useRef } from "react"
import type { Plate } from "../lib/plates"

/**
 * The picture behind a composition. Stills get a slow push-in so the placeholder reads like footage.
 * Dropped clips play from a preview proxy in sync with the timeline; the offline renderer instead
 * swaps in exact frames extracted from the original file (`frameSrc`).
 */
export function Backdrop({
  plate,
  t,
  duration,
  playing,
  frameSrc,
  drift = true,
  offset = 0,
}: {
  plate: Plate | undefined
  t: number
  duration: number
  playing: boolean
  frameSrc?: string
  drift?: boolean
  offset?: number
}) {
  const fill: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }

  if (frameSrc) return <img src={frameSrc} alt="" style={fill} />
  if (!plate || plate.id === "none") return null
  if (plate.color) return <div style={{ ...fill, background: plate.color }} />
  if (plate.video) return <SyncedVideo src={plate.video} t={t + offset} playing={playing} style={fill} />

  const k = (plate.zoom ?? 1) * (drift ? 1.0 + 0.045 * Math.min(1, t / Math.max(duration, 6)) : 1)
  return (
    <img
      src={plate.src}
      alt=""
      style={{ ...fill, transform: `scale(${k})`, transformOrigin: "50% 45%" }}
      decoding="sync"
    />
  )
}

function SyncedVideo({ src, t, playing, style }: { src: string; t: number; playing: boolean; style: React.CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (playing) {
      if (v.paused) void v.play().catch(() => {})
      if (Math.abs(v.currentTime - t) > 0.25) v.currentTime = t
    } else {
      if (!v.paused) v.pause()
      if (Math.abs(v.currentTime - t) > 1 / 60) v.currentTime = t
    }
  }, [t, playing])
  return <video ref={ref} src={src} muted playsInline preload="auto" style={style} />
}
