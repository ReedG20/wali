import type { ComponentType } from "react"

export type Val = string | number | boolean
export type Props = Record<string, Val>

export type Control =
  | { key: string; label: string; type: "text" | "textarea"; hint?: string }
  | { key: string; label: string; type: "select"; options: [string, string][] }
  | { key: string; label: string; type: "toggle" }
  | { key: string; label: string; type: "range"; min: number; max: number; step: number }

export type Preset = { id: string; label: string; values: Props }

export type Comp = {
  id: string
  name: string
  group: "Overlays" | "App screens" | "Brand"
  blurb: string
  /** Uses the liquid-glass canvas: export it over a background, not as alpha. */
  glass: boolean
  plate: string
  defaults: Props
  controls: Control[]
  presets?: Preset[]
  duration: (p: Props) => number
  Component: ComponentType<{ p: Props }>
}

export const str = (v: Val | undefined) => String(v ?? "")
export const num = (v: Val | undefined) => Number(v ?? 0)
export const bool = (v: Val | undefined) => v === true || v === "true" || v === "1"
