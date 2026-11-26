import fs from 'node:fs'
import { launchChrome, CdpConnection, attachPage, evaluate, sleep } from './cdp.mjs'

const [url, label, variant = 'default'] = process.argv.slice(2)
const chrome = await launchChrome({ port: 9400, userDataDir: `.tmp/perf/chrome-mountcmp-${label}` })
const connection = await CdpConnection.open(chrome.version.webSocketDebuggerUrl)
const page = await attachPage(connection)
await page.send('Page.addScriptToEvaluateOnNewDocument', {
  source: `localStorage.setItem('dsh-deepseek-chat:v1',JSON.stringify({open:false,sendKey:'enter'}));window.__DSC_TEST_HOOK__=(api)=>{window.__DSC__=api}`,
})
await page.send('Page.navigate', { url })
for (let i = 0; i < 100; i += 1) { await sleep(300); if (await evaluate(page, `!!window.__DSC__`)) break }
for (let i = 0; i < 100; i += 1) {
  const clicked = await evaluate(page, `(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Continue'); if(!b) return false; b.click(); return true })()`)
  if (clicked) break
  await sleep(200)
}
await sleep(900)
await evaluate(page, `document.querySelectorAll('._root_1ytzq_6').forEach(n=>{n.style.display='none';n.style.pointerEvents='none'})`)
await evaluate(page, `window.__DSC__.chatActions.setMode('chat')`)
for (let i = 0; i < 100; i += 1) { await sleep(300); if (await evaluate(page, `!!document.querySelector('.dsc-editor-field')`)) break }
await sleep(500)
await evaluate(page, fs.readFileSync('tools/perf/page-harness.js', 'utf8'))
if (variant === 'nocontain') {
  await evaluate(page, `(() => { const style = document.createElement('style'); style.textContent = '.dsc-msg { contain: none !important; }'; document.head.appendChild(style) })()`)
}
if (variant === 'contain') {
  await evaluate(page, `(() => { const style = document.createElement('style'); style.textContent = '.dsc-msg { contain: layout style !important; }'; document.head.appendChild(style) })()`)
}
if (variant === 'layout') {
  await evaluate(page, `(() => { const style = document.createElement('style'); style.textContent = '.dsc-msg { contain: layout !important; }'; document.head.appendChild(style) })()`)
}
if (variant === 'style') {
  await evaluate(page, `(() => { const style = document.createElement('style'); style.textContent = '.dsc-msg { contain: style !important; }'; document.head.appendChild(style) })()`)
}
if (variant === 'paint') {
  await evaluate(page, `(() => { const style = document.createElement('style'); style.textContent = '.dsc-msg { contain: paint !important; }'; document.head.appendChild(style) })()`)
}

const results = []
const allSpecs = [
  { n: 10, dense: false },
  { n: 100, dense: false },
  { n: 500, dense: false },
  { n: 500, dense: true },
]
const specs = process.argv[4] === 'dense' ? allSpecs.slice(3) : allSpecs
for (const spec of specs) {
  const measured = await evaluate(page, `(async () => {
    const store = window.__DSC__.chatStore
    store.set({ messages: [] })
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    window.__PERF__.clear()
    const started = performance.now()
    window.__PERF__.seed(${spec.n}, { dense: ${spec.dense} })
    await window.__PERF__.waitForMessages(${spec.n})
    return { ms: performance.now() - started, counts: window.__PERF__.counts() }
  })()`, { awaitPromise: true })
  results.push({ messages: spec.n, dense: spec.dense, ms: Number(measured.ms.toFixed(1)), counts: measured.counts })
  if (spec.n === 10) {
    console.log('computed contain:', await evaluate(page, `(() => { const row = document.querySelector('.dsc-msg'); return row ? getComputedStyle(row).contain : 'no-row' })()`))
  }
  console.log(label, spec.n, spec.dense ? 'dense' : 'normal', Number(measured.ms.toFixed(1)) + 'ms')
}
fs.writeFileSync(`.tmp/perf/results/mount-${label}-${variant}.json`, JSON.stringify(results, null, 2))
connection.close()
chrome.child.kill()
