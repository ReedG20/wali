import { createContext, useContext, type ReactNode } from "react"
import type { AspectId } from "../lib/plates"

export type StageInfo = {
  /** Composition time in seconds. */
  t: number
  w: number
  h: number
  aspect: AspectId
  /** 1 at 1080p. Use it to size type and UI so 16:9 and 9:16 read the same. */
  u: number
  /** The background (plate or footage) as an element, or null for an alpha export. */
  backdrop: ReactNode
  rendering: boolean
  /** Preview DPR cap for the liquid canvas. */
  dpr: number
}

export const StageContext = createContext<StageInfo | null>(null)

export function useStage() {
  const s = useContext(StageContext)
  if (!s) throw new Error("useStage outside <Stage>")
  return s
}
