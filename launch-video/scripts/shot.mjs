// Dev helper: screenshot a URL from the dev server with WebGPU on. node scripts/shot.mjs <path> <out.png> [w] [h] [waitMs]
import { chromium } from 'playwright-core'
const [, , path = '/', out = 'shot.png', w = '1280', h = '720', wait = '2500'] = process.argv
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--enable-unsafe-webgpu'] })
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.type(), m.text()) })
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
await p.goto('http://localhost:5190' + path)
await p.waitForTimeout(+wait)
await p.screenshot({ path: out })
await b.close()
