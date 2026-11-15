#!/usr/bin/env node
/**
 * Renders a composition to a video file, frame by frame, in headless Chrome (WebGPU on, so the
 * liquid glass is the real thing).
 *
 *   npm run render -- "c=notification&aspect=16x9&plate=bedroom" --format prores422 --fps 30 --scale 1
 *
 * The query string is exactly what the editor shows in its URL (or "Terminal command" in Export).
 * Formats:
 *   prores4444  ProRes 4444 with alpha (no background; not for glass compositions)
 *   prores422   ProRes 422 HQ over the chosen background (plate or your footage)
 *   h264        H.264 MP4 for quick review
 * When the background is a clip you dropped on the stage, its frames are pulled from the original
 * file with ffmpeg so the glass refracts the exact frame underneath.
 */
import { chromium } from "playwright-core"
import { execFile } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

const argv = process.argv.slice(2)
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : def
}
const positional = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"))
const query = new URLSearchParams((positional[0] ?? "").replace(/^\?/, ""))
const format = flag("format", "prores422")
const fps = Number(flag("fps", 30))
const scale = Number(flag("scale", 1))
let port = Number(flag("port", 5190))
const from = Number(flag("from", 0))
const toArg = flag("to")

const run = (cmd, args) =>
  new Promise((resolve, reject) => execFile(cmd, args, { maxBuffer: 1 << 26 }, (err, out, errout) => (err ? reject(new Error(errout || err.message)) : resolve(out))))

async function ensureServer() {
  try {
    const r = await fetch(`http://localhost:${port}/__footage`)
    if (r.ok) return null
  } catch {}
  const { createServer } = await import("vite")
  const server = await createServer({ root: ROOT, configFile: path.join(ROOT, "vite.config.ts"), server: { port: 5191, strictPort: false }, logLevel: "error" })
  await server.listen()
  port = server.config.server.port
  return server
}

async function main() {
  const server = await ensureServer()
  fs.mkdirSync(path.join(ROOT, "renders"), { recursive: true })
  const tmp = fs.mkdtempSync(path.join(ROOT, "renders/.tmp-"))
  const alpha = format === "prores4444"
  if (alpha) query.set("plate", "none")
  query.set("render", "1")
  query.set("dpr", String(scale))

  // Footage background: extract exact frames from the original.
  const plate = query.get("plate") ?? ""
  if (plate.startsWith("footage:")) {
    const metas = await (await fetch(`http://localhost:${port}/__footage`)).json()
    const meta = metas.find((m) => m.id === plate)
    if (!meta) throw new Error(`No footage called ${plate}`)
    if (meta.video) {
      const dir = path.join(ROOT, "public/footage/frames", path.basename(tmp))
      fs.mkdirSync(dir, { recursive: true })
      const offset = Number(query.get("bgOffset") ?? 0)
      await run("ffmpeg", ["-v", "error", "-y", "-ss", String(offset), "-i", meta.original, "-vf", `fps=${fps}`, "-q:v", "2", path.join(dir, "%06d.jpg")])
      query.set("bgFrames", `/footage/frames/${path.basename(tmp)}/%06d.jpg`)
      query.set("bgFps", String(fps))
      query.set("bgStart", String(from))
    }
  }

  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--enable-unsafe-webgpu", "--force-color-profile=srgb"] })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale })

  // Several tabs render interleaved frame ranges in parallel; every frame is a pure function of t.
  async function openTab() {
    const page = await context.newPage()
    page.on("pageerror", (e) => console.error("[page]", e.message))
    await page.goto(`http://localhost:${port}/?${query}`)
    await page.waitForFunction(() => window.__wali, null, { timeout: 30000 })
    const info = await page.evaluate(() => ({ w: window.__wali.w, h: window.__wali.h, duration: window.__wali.duration, glass: window.__wali.glass }))
    await page.setViewportSize({ width: info.w, height: info.h })
    await page.evaluate(() => document.fonts.ready)
    const cdp = await context.newCDPSession(page)
    if (alpha) await cdp.send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } })
    return { page, cdp, info }
  }

  const first = await openTab()
  const info = first.info
  if (alpha && info.glass) throw new Error("Glass compositions can't export with alpha: the glass needs a picture behind it. Use prores422 over your footage.")
  const tabs = [first, ...(await Promise.all(Array.from({ length: Number(flag("workers", 3)) - 1 }, openTab)))]
  await first.page.waitForTimeout(600)

  const to = toArg ? Number(toArg) : info.duration
  const frames = Math.max(1, Math.round((to - from) * fps))
  let doneCount = 0
  const writes = []
  await Promise.all(
    tabs.map(async ({ page, cdp }, w) => {
      let firstFrame = true
      for (let i = w; i < frames; i += tabs.length) {
        const t = from + i / fps
        await page.evaluate((x) => window.__wali.seek(x), t)
        if (firstFrame) {
          await page.evaluate((x) => window.__wali.seek(x), t)
          firstFrame = false
        }
        const { data } = await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true, fromSurface: true })
        writes.push(fs.promises.writeFile(path.join(tmp, `${String(i + 1).padStart(6, "0")}.png`), Buffer.from(data, "base64")))
        if (++doneCount % 6 === 0) console.log(`PROGRESS ${(doneCount / frames).toFixed(3)}`)
      }
    }),
  )
  await Promise.all(writes)
  await browser.close()

  const name = [query.get("c"), query.get("aspect") ?? "16x9", plate.replace("footage:", "") || "bg", new Date().toISOString().slice(11, 19).replace(/:/g, "")].join("-")
  fs.mkdirSync(path.join(ROOT, "renders"), { recursive: true })
  const ext = format === "h264" ? "mp4" : "mov"
  const out = path.join(ROOT, "renders", `${name}.${ext}`)
  const tag = ["-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]
  const enc =
    format === "prores4444"
      ? ["-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-alpha_bits", "16", "-vendor", "apl0"]
      : format === "prores422"
        ? ["-vf", "scale=out_color_matrix=bt709", "-c:v", "prores_ks", "-profile:v", "3", "-pix_fmt", "yuv422p10le", "-vendor", "apl0"]
        : ["-vf", "scale=out_color_matrix=bt709,format=yuv420p", "-c:v", "libx264", "-crf", "15", "-preset", "medium", "-movflags", "+faststart"]
  await run("ffmpeg", ["-v", "error", "-y", "-framerate", String(fps), "-i", path.join(tmp, "%06d.png"), ...enc, ...tag, "-r", String(fps), out])

  fs.rmSync(tmp, { recursive: true, force: true })
  const framesDir = path.join(ROOT, "public/footage/frames", path.basename(tmp))
  if (fs.existsSync(framesDir)) fs.rmSync(framesDir, { recursive: true, force: true })
  console.log("PROGRESS 1")
  console.log(`OUT ${out}`)
  if (server) await server.close()
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})

