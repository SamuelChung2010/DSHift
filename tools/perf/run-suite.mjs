/**
 * Long-chat input benchmark, driven over the Chrome DevTools Protocol with no
 * third-party dependency.
 *
 * Usage:
 *   node tools/perf/run-suite.mjs <web-ui-url> <label> <output.json> [sizes]
 *
 * The page is the real DSH web UI. The harness injects only synthetic data into
 * the plugin's own store, so no user conversation is read or written.
 */
import fs from 'node:fs'
import path from 'node:path'
import { launchChrome, CdpConnection, attachPage, evaluate, sleep } from './cdp.mjs'

const [url, label = 'baseline', output = '.tmp/perf/results/baseline.json', sizesArg] = process.argv.slice(2)
if (!url) throw new Error('usage: node tools/perf/run-suite.mjs <url> <label> <output.json> [sizes]')
const sizes = (sizesArg ? sizesArg.split(',') : ['10', '50', '100', '300', '500']).map(Number)
const harnessSource = fs.readFileSync(path.resolve('tools/perf/page-harness.js'), 'utf8')
const root = '.tmp/perf'
fs.mkdirSync(path.dirname(output), { recursive: true })
fs.mkdirSync(`${root}/downloads`, { recursive: true })

const chrome = await launchChrome({
  port: 9340,
  userDataDir: `${root}/chrome-${label}`,
  headless: true,
  windowSize: '1440,900',
  extraArgs: ['--enable-precise-memory-info'],
})
const connection = await CdpConnection.open(chrome.version.webSocketDebuggerUrl)
const page = await attachPage(connection)
const errors = []
connection.onEvent((message) => {
  if (message.sessionId !== page.sessionId) return
  if (message.method === 'Runtime.exceptionThrown') {
    errors.push(message.params.exceptionDetails?.exception?.description ?? message.params.exceptionDetails?.text ?? 'exception')
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    errors.push((message.params.args ?? []).map((arg) => arg.value ?? arg.description ?? '').join(' '))
  }
})

await page.send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
})
await page.send('Page.addScriptToEvaluateOnNewDocument', {
  source: `try {
    localStorage.setItem('dsh-deepseek-chat:v1', JSON.stringify({ open: false, sendKey: 'enter', sidebarWidth: 280 }));
    window.__DSC_TEST_HOOK__ = (api) => { window.__DSC__ = api; };
  } catch (error) { window.__PERF_INIT_ERROR__ = String(error); }`,
})
await page.send('Page.navigate', { url })

for (let attempt = 0; attempt < 100; attempt += 1) {
  await sleep(300)
  const ready = await evaluate(page, `!!window.__DSC__`)
  if (ready) break
  if (attempt === 99) throw new Error('Chat plugin did not mount')
}

// Dismiss the first-run Preview Notice in this isolated profile, then hide its
// remaining overlay root: it is an aria-hidden pointer-catcher that otherwise
// covers the Chat surface. This touches only the test page, never the profile.
for (let attempt = 0; attempt < 100; attempt += 1) {
  const clicked = await evaluate(page, `(() => {
    const button = [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'Continue')
    if (!button) return false
    button.click()
    return true
  })()`)
  if (clicked) break
  await sleep(200)
}
await sleep(900)
await evaluate(page, `document.querySelectorAll('._root_1ytzq_6').forEach((node) => {
  node.style.display = 'none'
  node.style.pointerEvents = 'none'
})`)
await evaluate(page, `window.__DSC__.chatActions.setMode('chat')`)
for (let attempt = 0; attempt < 100; attempt += 1) {
  await sleep(300)
  if (await evaluate(page, `!!document.querySelector('.dsc-editor-field')`)) break
  if (attempt === 99) throw new Error('Chat composer did not mount')
}
await sleep(600)

await evaluate(page, harnessSource)
await page.send('Performance.enable').catch(() => {})

const metrics = async () => {
  const { metrics: list } = await page.send('Performance.getMetrics')
  const map = {}
  for (const item of list ?? []) map[item.name] = item.value
  return map
}

const diffMetrics = (before, after) => {
  const result = {}
  for (const key of ['ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'TaskDuration', 'JSHeapUsedSize', 'Nodes', 'Documents']) {
    if (before[key] === undefined || after[key] === undefined) continue
    result[key] = Number((after[key] - before[key]).toFixed(4))
  }
  return result
}

async function waitSamples(count, timeoutMs = 15000) {
  const started = Date.now()
  for (;;) {
    const length = await evaluate(page, `window.__PERF__.samples().length`)
    if (length >= count) return length
    if (Date.now() - started > timeoutMs) return length
    await sleep(50)
  }
}

async function pressKey(character) {
  await page.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    text: character,
    unmodifiedText: character,
    key: character,
    code: `Key${character.toUpperCase()}`,
    windowsVirtualKeyCode: character.toUpperCase().charCodeAt(0),
  })
  await page.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: character,
    code: `Key${character.toUpperCase()}`,
    windowsVirtualKeyCode: character.toUpperCase().charCodeAt(0),
  })
}

async function typeKeys(text, gapMs = 120) {
  for (const character of text) {
    await pressKey(character)
    await sleep(gapMs)
  }
}

async function runTyping(size, { heavy = false, dense = false, keys = 'abcdefghijkl' } = {}) {
  const seedCount = heavy ? 20 : size
  const seedStartedAt = Date.now()
  await evaluate(page, `window.__PERF__.clear(); window.__PERF__.seed(${seedCount}, { heavy: ${heavy}, dense: ${dense} })`)
  const seedMs = Date.now() - seedStartedAt
  const mount = await evaluate(page, `window.__PERF__.waitForMessages(${seedCount})`, { awaitPromise: true })
  const mountCounts = await evaluate(page, `window.__PERF__.counts()`)
  const seedApplyMs = await evaluate(page, `window.__PERF_SEED_APPLY_MS__ ?? null`)
  await sleep(700)
  await evaluate(page, `window.__PERF__.attach(); window.__PERF__.focus()`)
  const focused = await evaluate(page, `document.activeElement === document.querySelector('.dsc-editor-field')`)

  // Exact cost of one ordinary keystroke, with no other store activity.
  await evaluate(page, `window.__PERF__.resetSamples(); window.__PERF__.resetCounters()`)
  await pressKey('z')
  await sleep(900)
  const singleKey = {
    counts: await evaluate(page, `window.__PERF__.counts()`),
    samples: await evaluate(page, `window.__PERF__.samples()`),
    draftLength: await evaluate(page, `window.__PERF__.fieldValue()?.length ?? null`),
  }
  await evaluate(page, `window.__PERF__.setDraft(''); window.__PERF__.resetSamples(); window.__PERF__.resetCounters()`)
  await sleep(300)

  const before = await metrics()
  const startedAt = Date.now()
  await typeKeys(keys)
  await waitSamples(keys.length, 120000)
  const after = await metrics()
  const durationMs = Date.now() - startedAt
  const samples = await evaluate(page, `window.__PERF__.samples()`)
  const counts = await evaluate(page, `window.__PERF__.counts()`)
  const longTasks = await evaluate(page, `window.__PERF__.longTasks()`)
  const loafs = await evaluate(page, `window.__PERF__.loafs()`)
  const value = await evaluate(page, `window.__PERF__.fieldValue()`)
  const record = {
    kind: heavy ? 'complex' : dense ? 'dense' : 'size',
    messages: seedCount,
    focused,
    seedMs,
    seedApplyMs,
    mount,
    mountCounts,
    singleKey,
    keys: keys.length,
    durationMs,
    draftLength: value?.length ?? null,
    samples,
    counts,
    longTasks,
    loafs,
    metrics: diffMetrics(before, after),
    heapUsed: after.JSHeapUsedSize ?? null,
  }
  await evaluate(page, `window.__PERF__.setDraft('')`)
  return record
}

async function runStreaming(size, keys = 'abcdefghij') {
  await evaluate(page, `window.__PERF__.clear(); window.__PERF__.seed(${size})`)
  await evaluate(page, `window.__PERF__.waitForMessages(${size})`, { awaitPromise: true })
  await sleep(500)
  const conversationId = await evaluate(page, `window.__DSC__.chatStore.state.activeId`)
  await evaluate(page, `(() => {
    const store = window.__DSC__.chatStore
    const messages = store.state.messages.slice()
    messages.push({
      id: 'perf-streaming-assistant', role: 'assistant', createdAt: Date.now(), updatedAt: Date.now(),
      model: 'deepseek-flash', effort: 'high', status: 'streaming', blocks: [{ type: 'text', text: '' }], prefix: true,
    })
    store.set({ messages })
    window.__PERF_STREAM_ID__ = 'perf-streaming-assistant'
    window.__PERF_STREAM_CONVERSATION__ = store.state.activeId
    return messages.length
  })()`)
  await sleep(300)
  await evaluate(page, `window.__PERF__.attach(); window.__PERF__.focus(); window.__PERF__.resetSamples(); window.__PERF__.resetCounters()`)
  const streamText = '流式输出期间输入必须保持响应，历史消息不应重复渲染。'.repeat(12)
  await evaluate(page, `void window.__PERF__.stream({
    assistantId: 'perf-streaming-assistant',
    conversationId: window.__PERF_STREAM_CONVERSATION__,
    text: ${JSON.stringify(streamText)},
    chunkMs: 50,
    chunkChars: 4,
  })`)
  await typeKeys(keys, 90)
  await waitSamples(keys.length, 60000)
  await sleep(1500)
  const samples = await evaluate(page, `window.__PERF__.samples()`)
  const counts = await evaluate(page, `window.__PERF__.counts()`)
  const longTasks = await evaluate(page, `window.__PERF__.longTasks()`)
  const streaming = await evaluate(page, `window.__DSC__.chatStore.state.streaming !== null`)
  return {
    kind: 'streaming',
    messages: size,
    keys: keys.length,
    samples,
    counts,
    longTasks,
    streamingStillActive: streaming,
    draftLength: await evaluate(page, `window.__PERF__.fieldValue()`),
  }
}

const results = {
  label,
  url: url.replace(/token=[^&]+/, 'token=<redacted>'),
  capturedAt: new Date().toISOString(),
  browser: chrome.version,
  node: process.version,
  platform: process.platform,
  bundleId: await evaluate(page, `window.__PERF__.bundleId()`),
  sizes: [],
  complex: null,
  dense: [],
  streaming: null,
  errors,
}

try {
  for (const size of sizes) {
    console.log(`${label}: size ${size}`)
    results.sizes.push(await runTyping(size))
  }
  console.log(`${label}: complex session`)
  results.complex = await runTyping(0, { heavy: true, keys: 'abcdefghijkl' })
  for (const denseSize of [300, 500]) {
    console.log(`${label}: dense ${denseSize}`)
    results.dense.push(await runTyping(denseSize, { dense: true, keys: 'abcdefgh' }))
  }
  console.log(`${label}: streaming @300`)
  results.streaming = await runStreaming(300)
  results.errors = errors
  results.finalMetrics = await metrics()
} finally {
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, JSON.stringify(results, null, 2))
  console.log(`wrote ${output}`)
  connection.close()
  chrome.child.kill()
}
