// Dev helper: node scripts/ui-shot.mjs <path> <out.png> [w h wait scrollY]
import { chromium } from 'playwright-core'
const [, , p = '/', out, w = '1600', h = '1000', wait = '2500', scroll = '0'] = process.argv
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--enable-unsafe-webgpu'] })
const page = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })
page.on('pageerror', (e) => console.log('[pageerror]', e.message))
await page.goto('http://localhost:5190' + p)
await page.waitForTimeout(+wait)
if (+scroll) { await page.evaluate((y) => document.querySelector('.page')?.scrollTo(0, y), +scroll); await page.waitForTimeout(500) }
await page.screenshot({ path: out })
await b.close()
