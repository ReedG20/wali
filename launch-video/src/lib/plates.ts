/**
 * Background plates: AI stand-ins for tomorrow's footage (public/plates), brand photography from the
 * landing page, flat brand colours, and any clip dropped onto the stage (public/footage).
 */

export type Plate = {
  id: string
  label: string
  src?: string // image
  video?: string // preview proxy (mp4)
  color?: string
  /** Footage that the renderer extracts frame by frame (original file). */
  original?: string
  duration?: number
  /** Extra zoom to hide edge artefacts (e.g. a film-gate vignette). */
  zoom?: number
}

export const PLATES: Plate[] = [
  { id: "bedroom", label: "Dorm room, doomscrolling (AI)", src: "/plates/bedroom.jpg" },
  { id: "door", label: "Walking in, shutting the door (AI)", src: "/plates/door.jpg" },
  { id: "gym", label: "Climbing gym (AI)", src: "/plates/gym.jpg" },
  { id: "quad", label: "Campus quad with a friend (AI)", src: "/plates/quad.jpg" },
  { id: "library", label: "Library, late (AI)", src: "/plates/library.jpg" },
  { id: "hill", label: "Long exposure, hill at blue hour (AI)", src: "/plates/hill.jpg", zoom: 1.05 },
  { id: "street", label: "Long exposure, walking home (AI)", src: "/plates/street.jpg" },
  { id: "lake", label: "Landing: lake at dusk", src: "/plates/lake.jpg" },
  { id: "meadow", label: "Landing: meadow run", src: "/plates/meadow.jpg" },
  { id: "forest", label: "Landing: forest blur", src: "/plates/forest.jpg" },
  { id: "scroll", label: "Landing: late-night scroll", src: "/plates/scroll.jpg" },
  { id: "night", label: "Night (#12110F)", color: "#12110F" },
  { id: "paper", label: "Paper (#F6F4EF)", color: "#F6F4EF" },
  { id: "none", label: "Transparent (alpha export)" },
]

export const ASPECTS = {
  "16x9": { w: 1920, h: 1080, label: "16:9 · 1920×1080" },
  "9x16": { w: 1080, h: 1920, label: "9:16 · 1080×1920" },
  "4x5": { w: 1080, h: 1350, label: "4:5 · 1080×1350" },
} as const
export type AspectId = keyof typeof ASPECTS
