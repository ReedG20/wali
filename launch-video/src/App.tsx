import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { COMPS, PAGES } from "./comps"
import type { Comp, Props, Val } from "./comps/types"
import { ASPECTS, PLATES, type AspectId, type Plate } from "./lib/plates"
import { Backdrop } from "./stage/Backdrop"
import { StageContext, type StageInfo } from "./stage/context"
import { glassAvailable } from "./stage/GlassStage"
import { Inspector } from "./shell/Inspector"
import { Timeline } from "./shell/Timeline"
import { Wordmark } from "./ui/brand"

const RESERVED = new Set(["c", "page", "aspect", "plate", "render", "dpr", "bgFrames", "bgFps", "bgStart", "t"])

function coerce(v: string, like: Val | undefined): Val {
  if (typeof like === "number") return Number(v)
  if (typeof like === "boolean") return v === "true" || v === "1"
  return v
}

function readUrl() {
  const q = new URLSearchParams(location.search)
  const page = q.get("page") ?? "comp"
  const comp = COMPS.find((c) => c.id === q.get("c")) ?? COMPS[0]!
  const props: Props = { ...comp.defaults }
  for (const [k, v] of q) if (!RESERVED.has(k)) props[k] = coerce(v, comp.defaults[k])
  return {
    page,
    comp,
    props,
    aspect: ((q.get("aspect") as AspectId) in ASPECTS ? q.get("aspect") : "16x9") as AspectId,
    plate: q.get("plate") ?? comp.plate,
    render: q.get("render") === "1",
    dpr: Number(q.get("dpr") ?? 1),
    t: Number(q.get("t") ?? 0),
    bgFrames: q.get("bgFrames") ?? "",
    bgFps: Number(q.get("bgFps") ?? 30),
    bgStart: Number(q.get("bgStart") ?? 0),
  }
}

/** Serialises everything that defines a frame, so an export reproduces the preview exactly. */
export function frameQuery(comp: Comp, props: Props, aspect: AspectId, plate: string) {
  const q = new URLSearchParams({ c: comp.id, aspect, plate })
  for (const [k, v] of Object.entries(props)) if (comp.defaults[k] !== v) q.set(k, String(v))
  return q
}

export function useFootage() {
  const [footage, setFootage] = useState<Plate[]>([])
  const refresh = useCallback(() => {
    fetch("/__footage")
      .then((r) => (r.ok ? r.json() : []))
      .then(setFootage)
      .catch(() => {})
  }, [])
  useEffect(refresh, [refresh])
  return { footage, refresh }
}

export function App() {
  const init = useMemo(readUrl, [])
  if (init.render) return <RenderView init={init} />
  return <Editor init={init} />
}

function Editor({ init }: { init: ReturnType<typeof readUrl> }) {
  const [page, setPage] = useState(init.page)
  const [comp, setComp] = useState<Comp>(init.comp)
  const [props, setProps] = useState<Props>(init.props)
  const [aspect, setAspect] = useState<AspectId>(init.aspect)
  const [plateId, setPlateId] = useState(init.plate)
  const [t, setT] = useState(init.t)
  const [playing, setPlaying] = useState(false)
  const [loop, setLoop] = useState(true)
  const [guides, setGuides] = useState(false)
  const { footage, refresh } = useFootage()
  const plates = useMemo(() => [...footage, ...PLATES], [footage])
  const plate = plates.find((p) => p.id === plateId) ?? PLATES[0]
  const duration = comp.duration(props)

  // URL mirrors the current setup (shareable, and what an export reproduces).
  useEffect(() => {
    const q = page === "comp" ? frameQuery(comp, props, aspect, plateId) : new URLSearchParams({ page })
    history.replaceState(null, "", `?${q}`)
  }, [page, comp, props, aspect, plateId])

  // Playback clock.
  const tRef = useRef(t)
  tRef.current = t
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      let next = tRef.current + dt
      if (next >= duration) {
        if (loop) next = 0
        else {
          next = duration
          setPlaying(false)
        }
      }
      setT(next)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, duration, loop])

  // Space plays, arrows step a frame (shift: a second).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest("input, textarea, select")) return
      if (e.code === "Space") {
        e.preventDefault()
        setPlaying((p) => !p)
      } else if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
        e.preventDefault()
        setPlaying(false)
        const step = (e.shiftKey ? 1 : 1 / 30) * (e.code === "ArrowRight" ? 1 : -1)
        setT((x) => Math.min(duration, Math.max(0, x + step)))
      } else if (e.key === "Home") setT(0)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [duration])

  function pickComp(c: Comp) {
    setPage("comp")
    if (c.id === comp.id) return
    setComp(c)
    setProps({ ...c.defaults })
    setPlateId(c.plate)
    setT(0)
    setPlaying(true)
  }

  const Page = PAGES.find((x) => x.id === page)?.Component

  return (
    <div className="shell">
      <aside className="side">
        <div className="side-brand">
          <Wordmark width={56} />
          <span>Launch video kit</span>
        </div>
        {(["Overlays", "App screens", "Brand"] as const).map((g) => (
          <nav key={g} className="side-group">
            <p>{g}</p>
            {COMPS.filter((c) => c.group === g).map((c) => (
              <button key={c.id} className={page === "comp" && c.id === comp.id ? "on" : ""} onClick={() => pickComp(c)}>
                {c.name}
                {c.glass && <em title="Liquid glass">glass</em>}
              </button>
            ))}
          </nav>
        ))}
        <nav className="side-group">
          <p>Look</p>
          {PAGES.map((x) => (
            <button key={x.id} className={page === x.id ? "on" : ""} onClick={() => setPage(x.id)}>
              {x.name}
            </button>
          ))}
        </nav>
        {!glassAvailable && (
          <div className="side-warn">
            Liquid glass needs Chrome 157+ with WebGPU. Showing a CSS stand-in.
          </div>
        )}
      </aside>

      {Page ? (
        <main className="page">
          <Page />
        </main>
      ) : (
        <>
          <main className="center">
            <Viewport
              comp={comp}
              props={props}
              aspect={aspect}
              plate={plate}
              t={t}
              duration={duration}
              playing={playing}
              guides={guides}
              onFootage={(id) => {
                refresh()
                setPlateId(id)
              }}
            />
            <Timeline
              t={t}
              duration={duration}
              playing={playing}
              loop={loop}
              guides={guides}
              onSeek={(x) => {
                setPlaying(false)
                setT(x)
              }}
              onPlay={() => setPlaying((p) => !p)}
              onLoop={() => setLoop((l) => !l)}
              onGuides={() => setGuides((g) => !g)}
            />
          </main>
          <Inspector
            comp={comp}
            props={props}
            setProps={(p) => setProps(p)}
            aspect={aspect}
            setAspect={setAspect}
            plateId={plateId}
            setPlateId={setPlateId}
            plates={plates}
            t={t}
          />
        </>
      )}
    </div>
  )
}

function Viewport({
  comp,
  props,
  aspect,
  plate,
  t,
  duration,
  playing,
  guides,
  onFootage,
}: {
  comp: Comp
  props: Props
  aspect: AspectId
  plate: Plate | undefined
  t: number
  duration: number
  playing: boolean
  guides: boolean
  onFootage: (id: string) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(0.5)
  const [drag, setDrag] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const { w, h } = ASPECTS[aspect]

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      setFit(Math.min((r.width - 48) / w, (r.height - 48) / h))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [w, h])

  async function upload(file: File) {
    setUploading(file.name)
    try {
      const r = await fetch(`/__upload?name=${encodeURIComponent(file.name)}`, { method: "POST", body: file })
      const j = await r.json()
      if (j.id) onFootage(j.id)
      else alert(j.error ?? "Upload failed")
    } finally {
      setUploading(null)
    }
  }

  // The preview renders at its on-screen pixel size (no CSS scaling: liquid-dom's HTML-in-Canvas
  // snapshots break under a transformed or zoomed ancestor). Comps size everything from `u`.
  const pw = Math.max(2, Math.round(w * fit))
  const ph = Math.max(2, Math.round(h * fit))
  const stage: StageInfo = {
    t,
    w: pw,
    h: ph,
    aspect,
    u: Math.min(pw, ph) / 1080,
    rendering: false,
    dpr: Math.min(2, devicePixelRatio),
    backdrop: plate?.id === "none" ? null : <Backdrop plate={plate} t={t} duration={duration} playing={playing} />,
  }

  return (
    <div
      ref={box}
      className={`viewport ${drag ? "drag" : ""}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        const f = e.dataTransfer.files[0]
        if (f) void upload(f)
      }}
    >
      <div className="stage-frame" style={{ width: pw, height: ph }}>
        <div className={`stage ${plate?.id === "none" ? "checker" : ""}`} style={{ width: pw, height: ph }}>
          <StageContext.Provider value={stage}>
            <comp.Component key={`${aspect}-${pw}`} p={props} />
          </StageContext.Provider>
          {guides && <SafeGuides />}
        </div>
      </div>
      {(drag || uploading) && (
        <div className="drop-hint">{uploading ? `Uploading ${uploading} and making a preview proxy…` : "Drop a clip or still to use it as the background"}</div>
      )}
    </div>
  )
}

function SafeGuides() {
  return (
    <div className="guides">
      <div style={{ inset: "5%" }} />
      <div style={{ inset: "10%" }} />
    </div>
  )
}

/**
 * ?render=1: just the stage at native size on a transparent page. The exporter drives time through
 * window.__wali.seek(t) and screenshots each frame.
 */
function RenderView({ init }: { init: ReturnType<typeof readUrl> }) {
  const [t, setT] = useState(init.t)
  const { footage } = useFootage()
  const plate = [...footage, ...PLATES].find((p) => p.id === init.plate)
  const { w, h } = ASPECTS[init.aspect]
  const duration = init.comp.duration(init.props)
  const frameIndex = Math.round((t - 0) * init.bgFps) + 1 + Math.round(init.bgStart * init.bgFps)
  const frameSrc = init.bgFrames ? init.bgFrames.replace("%06d", String(frameIndex).padStart(6, "0")) : undefined

  useEffect(() => {
    document.documentElement.classList.add("rendering")
    const raf = () => new Promise((r) => requestAnimationFrame(() => r(null)))
    ;(window as unknown as { __wali: unknown }).__wali = {
      duration,
      w,
      h,
      glass: init.comp.glass,
      async seek(x: number) {
        flushSync(() => setT(x))
        await document.fonts.ready
        await Promise.all([...document.images].map((im) => (im.complete ? im.decode().catch(() => {}) : new Promise((r) => (im.onload = im.onerror = r)))))
        for (let i = 0; i < 4; i++) await raf()
      },
    }
  }, [duration, w, h, init.comp.glass])

  const stage: StageInfo = {
    t,
    w,
    h,
    aspect: init.aspect,
    u: Math.min(w, h) / 1080,
    rendering: true,
    dpr: init.dpr,
    backdrop: init.plate === "none" && !frameSrc ? null : <Backdrop plate={plate} t={t} duration={duration} playing={false} frameSrc={frameSrc} drift={!frameSrc} />,
  }
  return (
    <div className="stage" style={{ width: w, height: h }}>
      <StageContext.Provider value={stage}>
        <init.comp.Component p={init.props} />
      </StageContext.Provider>
    </div>
  )
}
