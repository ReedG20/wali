/**
 * Synchronous text wrapping with canvas metrics, so glass shapes know their height on the very first
 * frame (no measure-then-render flash, and identical results in the offline renderer).
 */
let ctx: CanvasRenderingContext2D | null = null

export function wrap(text: string, font: string, maxWidth: number): string[] {
  ctx ??= document.createElement("canvas").getContext("2d")!
  ctx.font = font
  const out: string[] = []
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean)
    let line = ""
    for (const w of words) {
      const next = line ? `${line} ${w}` : w
      if (ctx.measureText(next).width <= maxWidth || !line) line = next
      else {
        out.push(line)
        line = w
      }
    }
    out.push(line)
  }
  return out
}

export const lineCount = (text: string, font: string, maxWidth: number, max = Infinity) =>
  Math.min(max, wrap(text, font, maxWidth).length)
