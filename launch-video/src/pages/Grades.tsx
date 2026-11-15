import { useEffect, useRef, useState } from "react"

type Look = { id: string; title: string; about: string }
const PLATES = [
  ["bedroom", "Dorm room"],
  ["door", "Door"],
  ["gym", "Climbing gym"],
  ["quad", "Quad"],
  ["library", "Library"],
  ["hill", "Hill"],
] as const

/* ------------------------------------------------------------------ .cube in the browser */

type Cube = { n: number; data: Float32Array }

async function loadCube(id: string): Promise<Cube> {
  const txt = await (await fetch(`/luts/${id}.cube`)).text()
  let n = 0
  const vals: number[] = []
  for (const line of txt.split("\n")) {
    if (line.startsWith("LUT_3D_SIZE")) n = Number(line.split(/\s+/)[1])
    else if (/^[\d.-]/.test(line)) vals.push(...line.trim().split(/\s+/).map(Number))
  }
  return { n, data: new Float32Array(vals) }
}

/** Trilinear lookup over an ImageData, the same mapping Resolve applies. */
function applyCube(src: ImageData, cube: Cube): ImageData {
  const { n, data: L } = cube
  const out = new ImageData(src.width, src.height)
  const s = src.data
  const o = out.data
  const m = n - 1
  const at = (r: number, g: number, b: number, c: number) => L[(r + g * n + b * n * n) * 3 + c]!
  for (let i = 0; i < s.length; i += 4) {
    const fr = (s[i]! / 255) * m, fg = (s[i + 1]! / 255) * m, fb = (s[i + 2]! / 255) * m
    const r0 = Math.floor(fr), g0 = Math.floor(fg), b0 = Math.floor(fb)
    const r1 = Math.min(m, r0 + 1), g1 = Math.min(m, g0 + 1), b1 = Math.min(m, b0 + 1)
    const dr = fr - r0, dg = fg - g0, db = fb - b0
    for (let c = 0; c < 3; c++) {
      const c00 = at(r0, g0, b0, c) * (1 - dr) + at(r1, g0, b0, c) * dr
      const c10 = at(r0, g1, b0, c) * (1 - dr) + at(r1, g1, b0, c) * dr
      const c01 = at(r0, g0, b1, c) * (1 - dr) + at(r1, g0, b1, c) * dr
      const c11 = at(r0, g1, b1, c) * (1 - dr) + at(r1, g1, b1, c) * dr
      const c0 = c00 * (1 - dg) + c10 * dg
      const c1 = c01 * (1 - dg) + c11 * dg
      o[i + c] = Math.round((c0 * (1 - db) + c1 * db) * 255)
    }
    o[i + 3] = 255
  }
  return out
}

async function gradeFile(file: File, looks: Look[]): Promise<Record<string, string>> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / bmp.width)
  const w = Math.round(bmp.width * scale)
  const h = Math.round(bmp.height * scale)
  const cv = document.createElement("canvas")
  cv.width = w
  cv.height = h
  const ctx = cv.getContext("2d")!
  ctx.drawImage(bmp, 0, 0, w, h)
  const src = ctx.getImageData(0, 0, w, h)
  const urls: Record<string, string> = { none: cv.toDataURL("image/jpeg", 0.9) }
  for (const l of looks) {
    ctx.putImageData(applyCube(src, await loadCube(l.id)), 0, 0)
    urls[l.id] = cv.toDataURL("image/jpeg", 0.9)
  }
  return urls
}

/* ------------------------------------------------------------------ page */

export function GradesPage() {
  const [looks, setLooks] = useState<Look[]>([])
  const [plate, setPlate] = useState<string>("gym")
  const [look, setLook] = useState("wali-portra")
  const [split, setSplit] = useState(0.5)
  const [grain, setGrain] = useState(true)
  const [own, setOwn] = useState<Record<string, string> | null>(null)
  const [busy, setBusy] = useState(false)
  const [installed, setInstalled] = useState<string | null>(null)
  const frame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/luts/looks.json").then((r) => r.json()).then(setLooks)
  }, [])

  const src = (p: string, l: string) => (p === "own" ? own?.[l] : `/grades/${p}__${l}.jpg`)
  const current = looks.find((l) => l.id === look)

  async function onDrop(f: File) {
    setBusy(true)
    try {
      setOwn(await gradeFile(f, looks))
      setPlate("own")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f && f.type.startsWith("image/")) void onDrop(f)
      }}
    >
      <header className="page-head">
        <h1>
          Grade <em>tests</em>
        </h1>
        <p>
          Five creative LUTs built from the brand: warm neutrals, Portra-like colour, soft grain, never a cool grey. Each preview is the
          plate run through the actual <code>.cube</code> file, so what you see here is what Resolve will do. Drop a still from tomorrow’s
          footage anywhere on this page to try them on your own frame.
        </p>
      </header>

      <div className="grade-bar">
        <div className="chips">
          {PLATES.map(([id, label]) => (
            <button key={id} className={`pill ${plate === id ? "on" : ""}`} onClick={() => setPlate(id)}>
              {label}
            </button>
          ))}
          {own && (
            <button className={`pill ${plate === "own" ? "on" : ""}`} onClick={() => setPlate("own")}>
              Your frame
            </button>
          )}
          {busy && <span className="pill">Grading your frame…</span>}
        </div>
        <div className="chips">
          <button className={`pill ${grain ? "on" : ""}`} onClick={() => setGrain((g) => !g)}>
            Grain
          </button>
        </div>
      </div>

      <div
        ref={frame}
        className="grade-frame"
        onPointerMove={(e) => {
          if (e.buttons !== 1) return
          const r = frame.current!.getBoundingClientRect()
          setSplit(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)))
        }}
        onPointerDown={(e) => {
          const r = frame.current!.getBoundingClientRect()
          setSplit(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)))
        }}
      >
        <img src={src(plate, "none")} alt="" />
        <img src={src(plate, look)} alt="" style={{ clipPath: `inset(0 0 0 ${split * 100}%)` }} />
        {grain && <div className="grade-grain" />}
        <div className="grade-split" style={{ left: `${split * 100}%` }}>
          <span>Ungraded</span>
          <span>{current?.title}</span>
        </div>
      </div>

      <div className="grade-looks">
        {looks.map((l) => (
          <button key={l.id} className={`grade-look ${look === l.id ? "on" : ""}`} onClick={() => setLook(l.id)}>
            <img src={src(plate, l.id)} alt="" />
            <div>
              <strong>{l.title}</strong>
              <p>{l.about}</p>
              <a href={`/luts/${l.id}.cube`} download onClick={(e) => e.stopPropagation()}>
                {l.id}.cube
              </a>
            </div>
          </button>
        ))}
      </div>

      <section className="grade-arc">
        <div>
          <h2 className="display">
            A grade that <em>warms up.</em>
          </h2>
          <p>
            One idea for the story: keep the doomscroll in <strong>Screen glow</strong>, muted and lit by the phone. The moment wali’s nudge
            lands and he gets up, cut to <strong>Late light</strong> for the climbing gym. Settle into <strong>Portra</strong> for everything
            after, and <strong>Matte</strong> under the end card.
          </p>
        </div>
        <div className="grade-arc-pair">
          <figure>
            <img src="/grades/bedroom__wali-screen-glow.jpg" alt="" />
            <figcaption>Before · Screen glow</figcaption>
          </figure>
          <figure>
            <img src="/grades/gym__wali-late-light.jpg" alt="" />
            <figcaption>After · Late light</figcaption>
          </figure>
        </div>
      </section>

      <section className="grade-how">
        <h3>Using them in Resolve</h3>
        <ol>
          <li>
            <button
              className="pill ink"
              onClick={async () => {
                const r = await fetch("/__install-luts", { method: "POST" })
                const j = await r.json()
                setInstalled(j.dir ?? j.error)
              }}
            >
              Install the LUTs into Resolve
            </button>{" "}
            {installed ? <span className="note">Copied to {installed}. In Resolve: Project Settings → Color Management → Update Lists.</span> : <span className="note">Copies them to Resolve’s LUT folder under “wali”.</span>}
          </li>
          <li>On the Color page, add a node after your balance and correction, right-click → LUTs → wali → pick a look. Pull the node’s Key Output Gain down to taste.</li>
          <li>Shooting Apple Log? Add a Color Space Transform (Apple Log → Rec.709) node first; these LUTs expect Rec.709.</li>
          <li>
            For grain, lay <code>luts/wali-grain-1080p24.mp4</code> on a track above the edit, Composite Mode “Overlay”, opacity 20–30%.
          </li>
        </ol>
      </section>
    </div>
  )
}
