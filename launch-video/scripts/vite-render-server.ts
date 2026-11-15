/**
 * Dev-server endpoints for the kit:
 *   GET  /__footage         clips you've dropped on the stage (public/footage)
 *   POST /__upload?name=    save a dropped clip + make a 1280px H.264 preview proxy
 *   POST /__render          start an export (runs scripts/render.mjs)
 *   GET  /__render/:id      export progress
 *   GET  /__reveal?path=    show a file in Finder
 *   POST /__install-luts    copy luts/*.cube into DaVinci Resolve's LUT folder
 */
import type { Plugin } from "vite"
import { spawn, execFile } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const FOOTAGE = path.join(ROOT, "public/footage")
const PROXY = path.join(FOOTAGE, "proxy")
const IMAGE = /\.(jpe?g|png|webp|heic|tiff?)$/i

type Job = { id: string; status: "queued" | "running" | "done" | "error"; progress: number; out?: string; error?: string; log: string }
const jobs = new Map<string, Job>()

function json(res: import("node:http").ServerResponse, body: unknown, code = 200) {
  res.statusCode = code
  res.setHeader("content-type", "application/json")
  res.end(JSON.stringify(body))
}

function run(cmd: string, args: string[]) {
  return new Promise<string>((resolve, reject) =>
    execFile(cmd, args, { maxBuffer: 1 << 24 }, (err, stdout, stderr) => (err ? reject(new Error(stderr || err.message)) : resolve(stdout))),
  )
}

async function probe(file: string) {
  const out = await run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate:format=duration", "-of", "json", file])
  const j = JSON.parse(out)
  const s = j.streams?.[0] ?? {}
  const [a, b] = String(s.r_frame_rate ?? "30/1").split("/").map(Number)
  return { width: s.width, height: s.height, fps: b ? a! / b : a, duration: Number(j.format?.duration ?? 0) }
}

export function listFootage() {
  if (!fs.existsSync(PROXY)) return []
  return fs
    .readdirSync(PROXY)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(PROXY, f), "utf8")))
    .sort((a, b) => b.added - a.added)
}

function readBody(req: import("node:http").IncomingMessage) {
  return new Promise<string>((resolve) => {
    let s = ""
    req.on("data", (c) => (s += c))
    req.on("end", () => resolve(s))
  })
}

export function renderServer(): Plugin {
  return {
    name: "wali-render-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://x")
        try {
          if (url.pathname === "/__footage") return json(res, listFootage())

          if (url.pathname === "/__upload" && req.method === "POST") {
            fs.mkdirSync(PROXY, { recursive: true })
            const name = path.basename(url.searchParams.get("name") ?? "clip.mov").replace(/[^\w.\- ]+/g, "_")
            const file = path.join(FOOTAGE, name)
            await new Promise<void>((resolve, reject) => {
              const ws = fs.createWriteStream(file)
              req.pipe(ws)
              ws.on("finish", resolve)
              ws.on("error", reject)
            })
            const base = name.replace(/\.[^.]+$/, "")
            const id = `footage:${base}`
            let meta
            if (IMAGE.test(name)) {
              meta = { id, label: `Your still: ${name}`, src: `/footage/${encodeURIComponent(name)}`, original: file, added: Date.now() }
            } else {
              const info = await probe(file)
              const proxy = path.join(PROXY, `${base}.mp4`)
              await run("ffmpeg", ["-v", "error", "-y", "-i", file, "-vf", "scale=1280:-2,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-g", "15", "-an", proxy])
              meta = { id, label: `Your clip: ${name} (${info.duration.toFixed(1)}s)`, video: `/footage/proxy/${encodeURIComponent(base)}.mp4`, original: file, duration: info.duration, fps: info.fps, added: Date.now() }
            }
            fs.writeFileSync(path.join(PROXY, `${base}.json`), JSON.stringify(meta, null, 2))
            return json(res, meta)
          }

          if (url.pathname === "/__render" && req.method === "POST") {
            const body = JSON.parse(await readBody(req))
            const id = Math.random().toString(36).slice(2, 10)
            const job: Job = { id, status: "running", progress: 0, log: "" }
            jobs.set(id, job)
            const port = server.config.server.port ?? 5190
            const child = spawn(
              process.execPath,
              [path.join(ROOT, "scripts/render.mjs"), body.query, "--format", body.format, "--fps", String(body.fps), "--scale", String(body.scale), "--port", String(port)],
              { cwd: ROOT },
            )
            child.stdout.on("data", (d: Buffer) => {
              for (const line of d.toString().split("\n")) {
                if (line.startsWith("PROGRESS ")) job.progress = Number(line.slice(9))
                else if (line.startsWith("OUT ")) job.out = line.slice(4).trim()
                else if (line.trim()) job.log += line + "\n"
              }
            })
            child.stderr.on("data", (d: Buffer) => (job.log += d.toString()))
            child.on("close", (code) => {
              job.status = code === 0 && job.out ? "done" : "error"
              if (job.status === "error") job.error = job.log.split("\n").filter(Boolean).slice(-6).join("\n") || `render exited with ${code}`
              job.progress = 1
            })
            return json(res, job)
          }

          const m = /^\/__render\/(\w+)$/.exec(url.pathname)
          if (m) {
            const job = jobs.get(m[1]!)
            return job ? json(res, job) : json(res, { error: "no such job" }, 404)
          }

          if (url.pathname === "/__reveal") {
            const p = path.resolve(url.searchParams.get("path") ?? "")
            if (!p.startsWith(ROOT)) return json(res, { error: "outside the project" }, 400)
            spawn("open", ["-R", p])
            return json(res, { ok: true })
          }

          if (url.pathname === "/__install-luts" && req.method === "POST") {
            const resolveDir = path.join(os.homedir(), "Library/Application Support/Blackmagic Design/DaVinci Resolve")
            if (!fs.existsSync(resolveDir)) return json(res, { error: "DaVinci Resolve's support folder wasn't found" })
            const dir = path.join(resolveDir, "LUT/wali")
            fs.mkdirSync(dir, { recursive: true })
            for (const f of fs.readdirSync(path.join(ROOT, "luts")).filter((f) => f.endsWith(".cube"))) fs.copyFileSync(path.join(ROOT, "luts", f), path.join(dir, f))
            return json(res, { dir: dir.replace(os.homedir(), "~") })
          }
        } catch (e) {
          return json(res, { error: e instanceof Error ? e.message : String(e) }, 500)
        }
        next()
      })
    },
  }
}
