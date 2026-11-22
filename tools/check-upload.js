/**
 * Upload gate checks.
 *
 * The ghost picker was caused by a request counter that survived the Chat
 * unmount and replayed `fileRef.current.click()` on the next mount. This check
 * pins down the replacement contract: one live picker per surface, a mode and
 * switch lock in front of it, no queued picker state, and a paired diagnostic
 * listener.
 */
import fs from 'node:fs'
import vm from 'node:vm'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = name => fs.readFileSync(path.join(root, 'client-src', name), 'utf8')

const logs = []
const traces = []
const docAdds = []
const docRemoves = []
const removedClasses = []
let blurCalls = 0
let clock = 1_000_000
const advance = ms => { clock += ms }
class FakeDate extends Date {
  static now() { return clock }
}

const dragNode = { classList: { remove: name => removedClasses.push(`node:${name}`) } }
const document = {
  activeElement: { blur: () => { blurCalls += 1 } },
  documentElement: { classList: { remove: name => removedClasses.push(`html:${name}`) } },
  body: { classList: { remove: name => removedClasses.push(`body:${name}`) } },
  querySelectorAll: selector => (selector.includes('.is-drag') ? [dragNode] : []),
  addEventListener(type, listener, capture) { docAdds.push({ type, listener, capture }) },
  removeEventListener(type, listener, capture) { docRemoves.push({ type, listener, capture }) },
}
const context = {
  console: {
    debug: (...args) => logs.push(args),
    trace: (...args) => traces.push(args),
    log: () => {},
    warn: (...args) => logs.push(['warn', ...args]),
    error: (...args) => logs.push(['error', ...args]),
  },
  document,
  localStorage: { getItem: () => null, setItem: () => {} },
  // Boot is irrelevant to the gate; a forever-pending fetch keeps the check
  // synchronous without relying on a Host half.
  fetch: () => new Promise(() => {}),
  setTimeout,
  clearTimeout,
  Date: FakeDate,
  Map,
  Set,
  Promise,
  URL,
  AbortController,
  TextDecoder,
  Response: globalThis.Response,
  navigator: { language: 'en-US', languages: ['en-US'] },
}
context.window = context
context.globalThis = context
vm.createContext(context)
const storeSource = read('20-store.js')
vm.runInContext(`${storeSource}\n;globalThis.__UPLOAD_CHECK__ = {
  chatStore, chatActions, openFilePicker, acceptFiles, registerFilePicker,
  currentMode, isModeSwitchLocked, installUploadDiagnostics
}`, context, { filename: '20-store.js' })
const app = context.__UPLOAD_CHECK__

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function hasLog(message, source) {
  return logs.some(args => args[0] === message && (source === undefined || args[1] === source))
}

function hasTrace(message) {
  return traces.some(args => args[0] === message)
}

const input = {
  type: 'file',
  disabled: false,
  isConnected: true,
  clicks: 0,
  click() { this.clicks += 1 },
}

const unregister = app.registerFilePicker('composer', input)
const unregisterImport = app.registerFilePicker('import', input)

// No queued picker state may survive a Chat unmount.
assert(!Object.prototype.hasOwnProperty.call(app.chatStore.state, 'filePickRequest'), 'the stale filePickRequest state must be gone')
for (const name of ['20-store.js', '48-tools.js', '50-components.js', '55-dialogs.js']) {
  assert(!read(name).includes('filePickRequest'), `${name} still contains the stale picker request counter`)
}
for (const name of ['48-tools.js', '50-components.js', '55-dialogs.js']) {
  assert(!read(name).includes('requestFilePicker'), `${name} still routes through the old request action`)
}
assert(read('20-store.js').includes('function requestFilePicker('), 'the legacy request action should stay as a guarded alias')

// The composer hidden input is inert for keyboard navigation and diagnostics.
const functionBody = (source, name) => {
  const start = source.indexOf(`function ${name}(`)
  if (start < 0) return ''
  const next = source.indexOf('\nfunction ', start + 1)
  return source.slice(start, next < 0 ? undefined : next)
}
const components = read('50-components.js')
const composer = functionBody(components, 'Composer')
assert(composer.includes("'data-dsc-upload': 'composer'"), 'the composer picker must be marked for diagnostics')
assert(composer.includes("tabIndex: -1"), 'the composer picker must not join the tab order')
assert(composer.includes("'aria-hidden': 'true'"), 'the composer picker must be hidden from assistive tech')
assert(!composer.includes('fileRef.current?.click()'), 'Composer must not click its picker directly')
assert(!composer.includes('autoFocus'), 'the composer must not autofocus anything')

// The import picker follows the same contract, including every entry point.
const dialogs = read('55-dialogs.js')
assert(dialogs.includes("'data-dsc-upload': 'import'"), 'the import picker must be marked for diagnostics')
assert(!dialogs.includes('inputRef.current?.click()'), 'ImportDialog must not click its picker directly')
assert(dialogs.includes("openFilePicker('import-drop', 'import')"), 'the import drop zone must use the gate')
assert(dialogs.includes("openFilePicker('import-drop-key', 'import')"), 'the import drop keyboard path must use the gate')

// Exactly one programmatic picker click exists in the client.
const clientSources = fs.readdirSync(path.join(root, 'client-src')).filter(name => name.endsWith('.js'))
const withoutComments = name => read(name).replace(/\/\*[\s\S]*?\*\//g, '')
const clickSites = clientSources.flatMap(name => {
  const text = withoutComments(name)
  return [...text.matchAll(/\.click\(\)/g)].map(match => ({ name, index: match.index }))
})
assert(clickSites.length === 1 && clickSites[0].name === '20-store.js', `exactly one picker click site may exist: ${JSON.stringify(clickSites)}`)
assert(read('48-tools.js').includes("openFilePicker('tools-menu')"), 'the tools menu must use the gate')
assert(!clientSources.some(name => /showOpenDialog|ipcRenderer|ipcMain/.test(read(name))), 'the client must not open a native IPC picker')

// Every addEventListener in the client has a matching removeEventListener.
const listenerCounts = clientSources.map(name => {
  const text = withoutComments(name)
  return {
    name,
    adds: (text.match(/addEventListener\(/g) ?? []).length,
    removes: (text.match(/removeEventListener\(/g) ?? []).length,
  }
})
const unpaired = listenerCounts.filter(item => item.adds !== item.removes)
assert(unpaired.length === 0, `unpaired listeners: ${JSON.stringify(unpaired)}`)

// Agent mode never opens a picker, even when an old input is still registered.
assert(app.currentMode() === 'agent', 'the check must start in Agent mode')
assert(app.openFilePicker('agent-button') === false, 'Agent mode must reject a picker request')
assert(input.clicks === 0, 'Agent mode must not click a file input')
assert(hasLog('[upload] open', 'agent-button'), 'a blocked opener must still log its source')
assert(hasLog('[upload] blocked', 'agent-button'), 'a blocked opener must say why it was blocked')

// Opening Chat locks uploads for the switch window, and blur/drag cleanup runs.
app.chatActions.setMode('chat')
assert(app.chatStore.state.open === true, 'Chat must open')
assert(app.currentMode() === 'chat', 'the mode must become chat')
assert(app.isModeSwitchLocked() === true, 'opening Chat must lock the switch window')
assert(blurCalls > 0, 'the switch must blur the old active element')
assert(removedClasses.includes('node:is-drag'), 'the switch must clear a drag-painted composer')
assert(app.openFilePicker('during-switch') === false, 'uploads during the switch window must be rejected')
assert(input.clicks === 0, 'a switch-time request must not click a file input')

// A repeated switch during the lock is ignored rather than queueing anything.
app.chatActions.setMode('agent')
assert(app.chatStore.state.open === true, 'a repeated switch must be ignored while locked')

// After the window the composer picker works from Chat.
advance(360)
assert(app.isModeSwitchLocked() === false, 'the switch lock must release')
assert(app.openFilePicker('chat-button') === true, 'Chat must open the registered composer picker')
assert(input.clicks === 1, 'Chat must click the live composer input once')
assert(hasLog('[upload] open', 'chat-button'), 'the successful opener must log its source')

// The import surface resolves its own registered input, not the composer one.
assert(app.openFilePicker('import-button', 'import') === true, 'the import surface must open its own picker')
assert(input.clicks === 2, 'the import picker must be the separately registered input')

// Twenty full Agent -> Chat cycles must not replay a picker request. This is
// the exact regression: a mount-time effect used to see the stale counter.
const clicksBeforeCycles = input.clicks
for (let cycle = 1; cycle <= 20; cycle += 1) {
  advance(400)
  app.chatActions.setMode('agent')
  assert(app.chatStore.state.open === false, `cycle ${cycle}: Agent must close Chat`)
  advance(400)
  app.chatActions.setMode('chat')
  assert(app.chatStore.state.open === true, `cycle ${cycle}: Chat must reopen`)
  assert(input.clicks === clicksBeforeCycles, `cycle ${cycle}: a mount must not replay the picker`)
}
advance(400)

// A detached input is not a live picker.
input.isConnected = false
assert(app.openFilePicker('detached') === false, 'an unmounted input must be rejected')
input.isConnected = true
unregister()
assert(app.openFilePicker('after-unregister') === false, 'an unregistered picker must be rejected')
unregisterImport()

// Dropped or pasted files use the same gate during a switch.
app.chatActions.setMode('agent')
assert(app.chatStore.state.open === false, 'Agent must close Chat')
advance(400)
app.chatActions.setMode('chat')
assert(app.chatStore.state.open === true, 'Chat must reopen after the switch window')
assert(app.acceptFiles('switch-drop', [{}]) === false, 'a switch-time drop must be rejected')
assert(hasLog('[upload] files', 'switch-drop'), 'the rejected file path must log its source')
advance(400)

// The temporary diagnostic is installed in capture phase and removed cleanly.
const removeDiagnostics = app.installUploadDiagnostics()
const added = docAdds.find(item => item.type === 'click' && item.capture === true)
assert(added !== undefined, 'the diagnostic listener must be installed in capture phase')
const diagnosticTarget = {
  closest(selector) {
    return selector === 'input[type="file"]'
      ? { dataset: { dscUpload: 'composer' }, classList: { contains: () => false } }
      : null
  },
}
added.listener({ target: diagnosticTarget, isTrusted: false })
assert(hasTrace('[upload] native file-input click'), 'a native picker click must print a stack trace')
const tracePayload = traces.find(args => args[0] === '[upload] native file-input click')[1]
assert(tracePayload.mode === 'chat' && tracePayload.switching === false, 'the trace must carry the current mode')
removeDiagnostics()
const removed = docRemoves.find(item => item.type === 'click' && item.capture === true)
assert(removed?.listener === added.listener, 'the diagnostic listener must be removable')

console.log(`UPLOAD_OK ${clientSources.length} sources, ${clickSites.length} picker click site, 20 Agent<->Chat cycles`)
