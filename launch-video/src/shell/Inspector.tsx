import { useEffect, useState } from "react"
import { frameQuery } from "../App"
import type { Comp, Props } from "../comps/types"
import { ASPECTS, type AspectId, type Plate } from "../lib/plates"

type Job = { id: string; status: "queued" | "running" | "done" | "error"; progress: number; out?: string; error?: string; log?: string }

export function Inspector({
  comp,
  props,
  setProps,
  aspect,
  setAspect,
  plateId,
  setPlateId,
  plates,
}: {
  comp: Comp
  props: Props
  setProps: (p: Props) => void
  aspect: AspectId
  setAspect: (a: AspectId) => void
  plateId: string
  setPlateId: (id: string) => void
  plates: Plate[]
  t: number
}) {
  const set = (k: string, v: Props[string]) => setProps({ ...props, [k]: v })
  const preset = comp.presets?.find((pr) => Object.entries(pr.values).every(([k, v]) => props[k] === v))

  return (
    <aside className="insp">
      <h2>{comp.name}</h2>
      <p className="insp-blurb">{comp.blurb}</p>

      {comp.presets && (
        <Field label="Scene">
          <select
            value={preset?.id ?? ""}
            onChange={(e) => {
              const pr = comp.presets!.find((x) => x.id === e.target.value)
              if (pr) setProps({ ...props, ...pr.values })
            }}
          >
            {!preset && <option value="">Custom</option>}
            {comp.presets.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="insp-row">
        <Field label="Frame">
          <select value={aspect} onChange={(e) => setAspect(e.target.value as AspectId)}>
            {Object.entries(ASPECTS).map(([id, a]) => (
              <option key={id} value={id}>
                {a.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Background" hint="Drop a clip on the stage to add your own footage.">
        <select value={plateId} onChange={(e) => setPlateId(e.target.value)}>
          {plates.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="insp-sep" />

      {comp.controls.map((c) => (
        <Field key={c.key} label={c.label} inline={c.type === "toggle"} hint={"hint" in c ? c.hint : undefined}>
          {c.type === "text" && <input value={String(props[c.key] ?? "")} onChange={(e) => set(c.key, e.target.value)} />}
          {c.type === "textarea" && <textarea rows={4} value={String(props[c.key] ?? "")} onChange={(e) => set(c.key, e.target.value)} />}
          {c.type === "select" && (
            <select value={String(props[c.key])} onChange={(e) => set(c.key, e.target.value)}>
              {c.options.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          )}
          {c.type === "toggle" && (
            <button className={`switch ${props[c.key] ? "on" : ""}`} onClick={() => set(c.key, !props[c.key])} aria-pressed={!!props[c.key]}>
              <span />
            </button>
          )}
          {c.type === "range" && (
            <div className="range">
              <input type="range" min={c.min} max={c.max} step={c.step} value={Number(props[c.key])} onChange={(e) => set(c.key, Number(e.target.value))} />
              <span>{Number(props[c.key]).toFixed(c.step < 1 ? 2 : 0)}</span>
            </div>
          )}
        </Field>
      ))}

      <div className="insp-sep" />
      <Export comp={comp} props={props} aspect={aspect} plateId={plateId} plates={plates} />
      <button className="insp-reset" onClick={() => setProps({ ...comp.defaults })}>
        Reset to defaults
      </button>
    </aside>
  )
}

function Field({ label, hint, inline, children }: { label: string; hint?: string; inline?: boolean; children: React.ReactNode }) {
  return (
    <label className={`field ${inline ? "inline" : ""}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

function Export({ comp, props, aspect, plateId, plates }: { comp: Comp; props: Props; aspect: AspectId; plateId: string; plates: Plate[] }) {
  const plate = plates.find((p) => p.id === plateId)
  const alphaOk = !comp.glass
  const [format, setFormat] = useState<string>(alphaOk && plateId === "none" ? "prores4444" : "prores422")
  const [fps, setFps] = useState(30)
  const [scale, setScale] = useState(1)
  const [job, setJob] = useState<Job | null>(null)

  useEffect(() => {
    if (!alphaOk && format === "prores4444") setFormat("prores422")
  }, [alphaOk, format])

  useEffect(() => {
    if (!job || job.status === "done" || job.status === "error") return
    const id = setInterval(async () => {
      const r = await fetch(`/__render/${job.id}`)
      if (r.ok) setJob(await r.json())
    }, 500)
    return () => clearInterval(id)
  }, [job])

  async function go() {
    const q = frameQuery(comp, props, aspect, plateId)
    const r = await fetch("/__render", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: q.toString(), format, fps, scale }),
    })
    setJob(await r.json())
  }

  const cmd = `npm run render -- "${frameQuery(comp, props, aspect, plateId)}" --format ${format} --fps ${fps} --scale ${scale}`
  const { w, h } = ASPECTS[aspect]

  return (
    <div className="export">
      <h3>Export</h3>
      <Field label="Format">
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="prores4444" disabled={!alphaOk}>
            ProRes 4444 · alpha{alphaOk ? "" : " (not for glass)"}
          </option>
          <option value="prores422">ProRes 422 HQ · over background</option>
          <option value="h264">H.264 MP4 · quick review</option>
        </select>
      </Field>
      <div className="insp-row">
        <Field label="FPS">
          <select value={fps} onChange={(e) => setFps(Number(e.target.value))}>
            {[24, 25, 30, 60].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field label="Size">
          <select value={scale} onChange={(e) => setScale(Number(e.target.value))}>
            <option value={1}>
              {w}×{h}
            </option>
            <option value={2}>
              {w * 2}×{h * 2}
            </option>
          </select>
        </Field>
      </div>
      {format === "prores4444" && plateId !== "none" && <p className="field-hint">Alpha exports ignore the background.</p>}
      {comp.glass && plate?.color && <p className="field-hint">Glass over a flat colour has nothing to refract. Pick footage or a plate.</p>}
      <button className="export-go" onClick={go} disabled={job?.status === "running" || job?.status === "queued"}>
        {job?.status === "running" ? `Rendering ${Math.round(job.progress * 100)}%` : "Render clip"}
      </button>
      {job && (
        <div className="export-job">
          {job.status === "running" && <div className="export-bar"><div style={{ width: `${job.progress * 100}%` }} /></div>}
          {job.status === "done" && (
            <>
              <p>Saved {job.out?.split("/").pop()}</p>
              <button onClick={() => fetch(`/__reveal?path=${encodeURIComponent(job.out!)}`)}>Show in Finder</button>
            </>
          )}
          {job.status === "error" && <p className="err">{job.error}</p>}
        </div>
      )}
      <details className="export-cli">
        <summary>Terminal command</summary>
        <code>{cmd}</code>
      </details>
    </div>
  )
}
