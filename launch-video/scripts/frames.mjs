// Dev helper: node scripts/frames.mjs "<query>" out-prefix t1,t2,... [w h]
import { chromium } from 'playwright-core'
const [, , query, prefix, times, w = '1920', h = '1080'] = process.argv
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--enable-unsafe-webgpu'] })
const p = await b.newPage({ viewport: { width: +w, height: +h } })
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
p.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text().slice(0, 300)) })
await p.goto(`http://localhost:5190/?render=1&${query}`)
await p.waitForFunction(() => window.__wali)
await p.waitForTimeout(800)
for (const t of times.split(',').map(Number)) {
  await p.evaluate((t) => window.__wali.seek(t), t)
  await p.evaluate((t) => window.__wali.seek(t), t)
  await p.screenshot({ path: `${prefix}-${t}.png` })
}
await b.close()
