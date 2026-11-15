/**
 * HTML-in-Canvas compatibility shim.
 *
 * liquid-dom 0.1.1 was written against the 2025 draft of the WICG HTML-in-Canvas API:
 *   <canvas layoutsubtree>, queue.copyElementImageToTexture(el, w, h, { texture })
 * Chrome 157 ships the current draft instead:
 *   <canvas content="drawable"> + a `drawable` attribute on each child,
 *   queue.drawElementImageToTexture({ source }, { texture, size })
 * This maps the old calls onto the new ones, so the library runs unmodified.
 */

type NewQueue = GPUQueue & {
  drawElementImageToTexture?: (
    source: { source: Element },
    destination: { texture: GPUTexture; size: [number, number] },
  ) => void
  copyElementImageToTexture?: unknown
}

export const hic = {
  webgpu: typeof navigator !== "undefined" && "gpu" in navigator,
  drawable: typeof HTMLCanvasElement !== "undefined" && "requestPaint" in HTMLCanvasElement.prototype,
}

if (typeof window !== "undefined" && typeof GPUQueue !== "undefined") {
  const q = GPUQueue.prototype as NewQueue
  if (!q.copyElementImageToTexture && q.drawElementImageToTexture) {
    Object.defineProperty(q, "copyElementImageToTexture", {
      configurable: true,
      value(this: NewQueue, el: Element, w: number, h: number, dest: { texture: GPUTexture }) {
        this.drawElementImageToTexture!({ source: el }, { texture: dest.texture, size: [w, h] })
      },
    })
  }
}

if (typeof window !== "undefined" && hic.drawable) {
  // <canvas layoutsubtree> → <canvas content="drawable">
  const setAttr = Element.prototype.setAttribute
  Element.prototype.setAttribute = function (name: string, value: string) {
    if (this instanceof HTMLCanvasElement && name === "layoutsubtree") setAttr.call(this, "content", "drawable")
    return setAttr.call(this, name, value)
  }
  // Every direct child the library appends to the canvas must be marked drawable.
  const append = Element.prototype.append
  Element.prototype.append = function (...nodes: (Node | string)[]) {
    if (this instanceof HTMLCanvasElement && this.hasAttribute("layoutsubtree")) {
      for (const n of nodes) if (n instanceof Element) n.setAttribute("drawable", "")
    }
    return append.apply(this, nodes)
  }
}
