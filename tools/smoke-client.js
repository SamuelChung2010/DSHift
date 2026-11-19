/**
 * Non-visual smoke test: loads the built client bundle with a minimal React
 * shim and renders the main tree for several states. This catches reference
 * and shape errors; it is not visual verification.
 */
import fs from 'node:fs'
import vm from 'node:vm'

let captured = null
let hookState = []
let hookIndex = 0
let currentProps = null
let renderCount = 0
let depth = 0

const React = {
  createElement(type, props, ...children) {
    const nextProps = { ...(props ?? {}) }
    if (children.length === 1) nextProps.children = children[0]
    else if (children.length > 1) nextProps.children = children
    return { type, props: nextProps }
  },
  Fragment: Symbol('Fragment'),
  useState(initial) {
    if (hookIndex >= hookState.length) hookState.push(typeof initial === 'function' ? initial() : initial)
    const value = hookState[hookIndex]
    const index = hookIndex
    hookIndex += 1
    return [value, (next) => { hookState[index] = typeof next === 'function' ? next(hookState[index]) : next }]
  },
  useEffect() {},
  useLayoutEffect() {},
  useMemo(factory) { return factory() },
  useCallback(fn) { return fn },
  useRef(initial) { return { current: initial } },
  memo(component) { return component },
}

function renderFunction(Component, props) {
  renderCount += 1
  if (renderCount > 50000) throw new Error(`render runaway at ${Component.name}`)
  if (renderCount % 2000 === 0) console.log('RENDER_COUNT', renderCount, Component.name, 'depth', depth)
  depth += 1
  if (depth > 200) throw new Error(`render depth runaway at ${Component.name}`)
  const savedState = hookState
  const savedIndex = hookIndex
  const savedProps = currentProps
  hookState = []
  hookIndex = 0
  currentProps = props
  try {
    return Component(props ?? {})
  } catch (error) {
    throw new Error(`${Component.name || 'anonymous'}: ${error.stack || error.message}`)
  } finally {
    hookState = savedState
    hookIndex = savedIndex
    currentProps = savedProps
    depth -= 1
  }
}

function renderNode(node) {
  if (node === null || node === undefined || typeof node === 'boolean') return
  if (typeof node === 'string' || typeof node === 'number') return
  if (Array.isArray(node)) {
    for (const child of node) renderNode(child)
    return
  }
  if (typeof node === 'function') {
    renderNode(renderFunction(node, {}))
    return
  }
  if (typeof node !== 'object') return
  if (node.type === React.Fragment) {
    renderNode(node.props?.children)
    return
  }
  if (typeof node.type === 'function') {
    renderNode(renderFunction(node.type, node.props))
    return
  }
  renderNode(node.props?.children)
}

function makeNode(name) {
  return {
    name,
    setAttribute() {},
    remove() {},
    appendChild(child) { this.children?.push(child) },
    addEventListener() {},
    removeEventListener() {},
    style: {},
    textContent: '',
  }
}

function translate(key, vars) {
  const dictionary = captured?.DICTS?.zh ?? {}
  const template = typeof dictionary[key] === 'string' ? dictionary[key] : key
  if (vars === undefined) return template
  return template.replace(/\{(\w+)\}/g, (match, name) => (vars[name] === undefined ? match : String(vars[name])))
}

function collectText(node, out = []) {  if (node === null || node === undefined || typeof node === 'boolean') return out
  if (typeof node === 'string' || typeof node === 'number') {
    out.push(String(node))
    return out
  }
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, out)
    return out
  }
  if (typeof node === 'function') {
    collectText(renderFunction(node, {}), out)
    return out
  }
  if (typeof node !== 'object') return out
  if (node.type === React.Fragment) {
    collectText(node.props?.children, out)
    return out
  }
  if (typeof node.type === 'function') {
    collectText(renderFunction(node.type, node.props), out)
    return out
  }
  collectText(node.props?.children, out)
  return out
}

function classNamesOf(node) {
  const value = node?.props?.className
  return typeof value === 'string' ? value.split(/\s+/).filter(Boolean) : []
}

function collectByClass(node, name, out = []) {
  if (node === null || node === undefined || typeof node === 'boolean') return out
  if (typeof node === 'string' || typeof node === 'number') return out
  if (Array.isArray(node)) {
    for (const child of node) collectByClass(child, name, out)
    return out
  }
  if (typeof node === 'function') {
    collectByClass(renderFunction(node, {}), name, out)
    return out
  }
  if (typeof node !== 'object') return out
  if (node.type === React.Fragment) {
    collectByClass(node.props?.children, name, out)
    return out
  }
  if (typeof node.type === 'function') {
    collectByClass(renderFunction(node.type, node.props), name, out)
    return out
  }
  if (classNamesOf(node).includes(name)) out.push(node)
  collectByClass(node.props?.children, name, out)
  return out
}

function collectionText(node) {
  return collectText(node).join(' ').replace(/\s+/g, ' ').trim()
}

const bootstrap = {
  version: 1,
  model: { id: 'deepseek-flash', name: 'DeepSeek V4.1 Flash' },
  models: [
    {
      id: 'deepseek-flash', name: 'DeepSeek V4.1 Flash', shortName: 'V4.1 Flash',
      descriptionKey: 'modelFlashDesc',
      capabilities: { vision: true, documents: true, search: true, thinking: true, efforts: ['low', 'high', 'max'] },
    },
    {
      id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', shortName: 'V4 Pro',
      descriptionKey: 'modelProDesc',
      capabilities: { vision: false, documents: true, search: true, thinking: true, efforts: ['low', 'high', 'max'] },
    },
  ],
  modelConfig: {
    defaults: { model: 'deepseek-flash', effort: 'high' },
    conversations: { c1: { model: 'deepseek-v4-pro', effort: 'max' } },
  },
  settings: { authMode: 'auto', thinking: true, search: true, systemPrompt: '' },
  conversations: [{ id: 'c1', title: '测试对话', titleAuto: false, createdAt: 1, updatedAt: 2, messageCount: 2 }],
  auth: {
    ready: true, mode: 'auto', source: 'account',
    chatKeyConfigured: false, dshKeyConfigured: false, accountSignedIn: true, canStoreKey: true,
  },
  limits: { maxFiles: 10, maxUploadBytes: 67108864, maxText: 100000 },
  dataDir: 'C:/tmp/deepseek-chat',
}

const storage = new Map([['dsh-deepseek-chat:v1', JSON.stringify({ open: true, activeId: null })]])
const context = {
  console,
  React,
  URL,
  URLSearchParams,
  TextEncoder,
  TextDecoder,
  Response,
  Request,
  Headers,
  FormData,
  Blob,
  ReadableStream,
  AbortController,
  AbortSignal,
  crypto: globalThis.crypto,
  Intl,
  Date,
  Math,
  JSON,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {},
  queueMicrotask,
  Promise,
  Error,
  TypeError,
  String,
  Number,
  Boolean,
  Array,
  Object,
  Map,
  Set,
  RegExp,
  Symbol,
  document: {
    baseURI: 'http://127.0.0.1:52345/',
    head: { appendChild() {} },
    createElement: makeNode,
    addEventListener() {},
    removeEventListener() {},
    body: { appendChild() {} },
  },
  location: { protocol: 'http:', origin: 'http://127.0.0.1:52345' },
  navigator: { language: 'zh-CN', languages: ['zh-CN'] },
  localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  },
  fetch: async (url) => {
    if (String(url).includes('/api/deepseek-chat/bootstrap')) {
      return new Response(JSON.stringify(bootstrap), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    return new Response(JSON.stringify({ error: { message: `unexpected fetch ${url}` } }), { status: 500 })
  },
  addEventListener() {},
  removeEventListener() {},
  innerWidth: 1200,
  __DSC_TEST_HOOK__: (value) => { captured = value },
}
context.window = context
context.globalThis = context
context.window.__ModuleLoader__ = { load: definition => { context.__definition = definition } }

vm.createContext(context)
const source = fs.readFileSync(new URL('../client.js', import.meta.url), 'utf8')
vm.runInContext(source, context, { filename: 'client.js' })
if (context.__definition === null || context.__definition === undefined) throw new Error('module did not register')
const plugin = context.__definition.factory(name => {
  if (name === 'react') return React
  throw new Error(`unexpected require ${name}`)
})
const slots = []
const agentSessions = { rows: {}, panelId: null }
const agentSessionListeners = new Set()
const agentPanelListeners = new Set()
const ctx = {
  effect(callback) { callback(); return () => {} },
  get(name) {
    if (name === 'sessions') {
      return {
        list: {
          getSnapshot() {
            return {
              ids: Object.keys(agentSessions.rows),
              byId: agentSessions.rows,
              phase: agentSessions.phase === 'pending' ? 'pending' : 'ready',
              projectionsBySession: {},
            }
          },
          subscribe(listener) { agentSessionListeners.add(listener); return () => agentSessionListeners.delete(listener) },
        },
      }
    }
    if (name === 'layout') {
      return {
        panelInfo: {
          getSnapshot() { return { activePanelId: agentSessions.panelId } },
          subscribe(listener) { agentPanelListeners.add(listener); return () => agentPanelListeners.delete(listener) },
        },
      }
    }
    return undefined
  },
  locale: {
    register() { return () => {} },
    bind() { return translate },
    subscribe() { return () => {} },
    getSnapshot() { return { active: 'zh' } },
  },
  slots: {
    inject(_name, callback) { slots.push(callback()) },
    register(_options, component) { return component },
  },
}
plugin.apply(ctx)
if (captured === null) throw new Error('test hook was not called')

async function wait(ms = 30) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

function render(name, Component, props) {
  try {
    renderNode(React.createElement(Component, props))
    console.log(`RENDER_OK ${name}`)
  } catch (error) {
    console.error(`RENDER_FAIL ${name}`)
    throw error
  }
}

await wait(50)
console.log('BOOT_STATE', captured.chatStore.state.boot)

render('ChatRoot-ready', captured.ChatRoot)
captured.chatStore.set({ settingsOpen: true })
render('ChatRoot-settings', captured.ChatRoot)
captured.chatStore.set({ settingsOpen: false, confirm: { title: 'Delete', message: 'Sure?', confirmLabel: 'Delete', danger: true, onConfirm: async () => {} } })
render('ChatRoot-confirm', captured.ChatRoot)
captured.chatStore.set({ confirm: null })

const sampleMarkdown = '# 标题\n\n这是**答案**，包含 `代码` 和 [链接](https://example.com)。\n\n- 一\n- 二\n\n| A | B |\n| --- | --- |\n| 1 | 2 |'
console.log('PARSE_START')
const parsed = captured.parseMarkdown(sampleMarkdown)
console.log('PARSE_OK', JSON.stringify(parsed).slice(0, 300))
render('Markdown-simple', captured.Markdown, { text: 'hello' })
render('Markdown-paragraph', captured.Markdown, { text: '这是**答案**和[链接](https://example.com)。' })
render('Markdown', captured.Markdown, { text: sampleMarkdown })

const assistant = {
  id: 'a1', role: 'assistant', createdAt: 1, updatedAt: 2, status: 'done',
  stopReason: 'end_turn', thinking: true, search: true,
  usage: { input_tokens: 120, output_tokens: 30 },
  blocks: [
    { type: 'thinking', thinking: '先分析问题。', signature: '', startedAt: 1, endedAt: 1200 },
    { type: 'server_tool_use', id: 's1', name: 'deepseek_web_search', kind: 'search', input: { action: 'search', queries: ['test'] } },
    { type: 'web_search_tool_result', tool_use_id: 's1', kind: 'search', content: [{ type: 'web_search_result', title: '示例', url: 'https://example.com', snippet: '摘要', site_name: 'Example', site_icon: null, page_age: null }] },
    { type: 'text', text: '# 标题\n\n这是**答案**，包含 `代码` 和 [链接](https://example.com)。\n\n- 一\n- 二\n\n| A | B |\n| --- | --- |\n| 1 | 2 |', citations: [{ type: 'web_search_result_location', url: 'https://example.com', title: '示例', cited_text: '答案', encrypted_index: '' }] },
  ],
}
const userMessage = { id: 'u1', role: 'user', content: '你好', files: [], createdAt: 1 }
captured.chatStore.set({ activeId: 'c1', messages: [userMessage, assistant], conversationLoading: false })
render('ChatRoot-messages', captured.ChatRoot)
captured.chatStore.set({ streaming: { conversationId: 'c1', assistantId: 'a1', userId: 'u1', controller: new AbortController(), startedAt: 1 } })
render('ChatRoot-streaming', captured.ChatRoot)
captured.chatStore.set({ streaming: null })
render('AssistantMessage', captured.AssistantMessage, { message: assistant, streaming: false, isLast: true })
render('SettingsDialog', captured.SettingsDialog)
render('Composer', captured.Composer)
render('ModeSwitch', captured.ModeSwitch)
render('Sidebar', captured.Sidebar)
render('SidebarResizer', captured.SidebarResizer, { onDraggingChange() {} })
render('DeepSeekLockup', captured.DeepSeekLockup, { height: 24 })

// Home: one greeting from the pool, no feature grid and no footnotes.
const readyAuth = {
  ready: true, mode: 'auto', source: 'account', accountSignedIn: true, canStoreKey: true,
  chatKeyConfigured: false, dshKeyConfigured: false,
}
captured.chatStore.set({
  messages: [], activeId: null, userName: '', auth: readyAuth, settingsOpen: false, sidebarOpen: true,
})
const greetingOptions = captured.GREETINGS
if (!Array.isArray(greetingOptions) || greetingOptions.length < 12) throw new Error('the greeting pool is too small')
const zhDict = captured.DICTS.zh
const enDict = captured.DICTS.en
let namedGreetings = 0
for (let index = 0; index < greetingOptions.length; index += 1) {
  const option = greetingOptions[index]
  for (const key of [option.named, option.plain]) {
    if (key === undefined) continue
    if (typeof zhDict[key] !== 'string' || zhDict[key].trim() === '') throw new Error(`missing zh greeting ${key}`)
    if (typeof enDict[key] !== 'string' || enDict[key].trim() === '') throw new Error(`missing en greeting ${key}`)
  }
  captured.chatStore.set({ greetingIndex: index, userName: '' })
  const plainHome = collectText(React.createElement(captured.EmptyState, {})).join(' ').trim()
  if (plainHome === '') throw new Error(`greeting ${index} renders empty`)
  if (/^greeting\d/.test(plainHome)) throw new Error(`greeting ${index} leaked its locale key`)
  if (plainHome.includes('{name}') || plainHome.includes('@')) throw new Error(`greeting ${index} left a dangling name slot: ${plainHome}`)
  if (/深度思考|编写代码|联网搜索|文件问答/.test(plainHome)) throw new Error('feature cards must not render on the home')
  if (option.named !== undefined) {
    namedGreetings += 1
    captured.chatStore.set({ userName: '  烨明  ' })
    const namedHome = collectText(React.createElement(captured.EmptyState, {})).join(' ').trim()
    if (!namedHome.includes('烨明')) throw new Error(`greeting ${index} must use the account display name: ${namedHome}`)
    if (namedHome.includes('{name}')) throw new Error(`greeting ${index} did not interpolate the name`)
    if (namedHome.includes('@')) throw new Error(`greeting ${index} must not print a literal @: ${namedHome}`)
  }
}
if (namedGreetings < 3) throw new Error('the pool needs name-capable greetings')
captured.chatStore.set({ greetingIndex: 2, userName: '烨明' })
const plainWithName = collectText(React.createElement(captured.EmptyState, {})).join(' ')
if (plainWithName.includes('烨明')) throw new Error('a plain greeting must not append the name')
// No immediate repeat, across many rolls and from any starting point.
let previousGreeting = captured.pickGreetingIndex(-1, () => 0)
for (let roll = 0; roll < 200; roll += 1) {
  const next = captured.pickGreetingIndex(previousGreeting)
  if (next === previousGreeting) throw new Error(`greeting repeated consecutively at ${next}`)
  if (!Number.isInteger(next) || next < 0 || next >= greetingOptions.length) throw new Error(`greeting index out of range: ${next}`)
  previousGreeting = next
}
// "New chat" rotates the greeting and starts a fresh blank page.
const beforeNewChat = greetingOptions.length - 1
captured.chatStore.set({
  greetingIndex: beforeNewChat, activeId: 'c1', messages: [{ id: 'u1', role: 'user', content: 'x', files: [], createdAt: 1 }],
  streaming: null, settingsOpen: false, userName: '',
})
await captured.chatActions.newChat()
if (captured.chatStore.state.greetingIndex === beforeNewChat) throw new Error('a new chat must re-roll the greeting')
if (captured.chatStore.state.activeId !== null || captured.chatStore.state.messages.length !== 0) throw new Error('a new chat must return to a blank page')
captured.chatStore.set({ greetingIndex: 0 })
console.log('HOME_GREETING_OK')

// Sidebar width: the native contract, the narrow-window guard, and persistence.
const clamp = captured.clampSidebarWidth
if (clamp(100, 1200) !== captured.SIDEBAR_MIN) throw new Error('sidebar width must clamp at its minimum')
if (clamp(9999, 1200) !== captured.SIDEBAR_MAX) throw new Error('sidebar width must clamp at its maximum')
if (clamp(333, 1200) !== 333) throw new Error('a fitting sidebar width must pass through')
if (clamp(420, 800) !== 340) throw new Error(`a narrow window must keep the chat column usable: ${clamp(420, 800)}`)
if (clamp(420, 600) !== captured.SIDEBAR_MIN) throw new Error('the narrow-window guard must not fall below the floor')
if (captured.greetingUserName('  烨明  ') !== '烨明') throw new Error('the greeting name must be trimmed')
if (captured.greetingUserName('   ') !== '') throw new Error('a blank name is not a display name')
captured.chatActions.setSidebarWidth(333)
if (captured.chatStore.state.sidebarWidth !== 333) throw new Error('the drag width must reach the store')
captured.chatActions.saveSidebarWidth()
const persistedWidth = JSON.parse(storage.get('dsh-deepseek-chat:v1')).sidebarWidth
if (persistedWidth !== 333) throw new Error(`the sidebar width must persist: ${persistedWidth}`)
captured.chatActions.setSidebarWidth(280)
console.log('SIDEBAR_WIDTH_OK')

// Blank-page rule: the shell switch only exists on a new, still-empty page.
const blankChat = {
  open: true, sending: false, streaming: null, activeId: null, messages: [], boot: 'ready', conversations: [],
}
const blank = state => captured.chatPageIsBlank({ ...blankChat, ...state })
if (blank({}) !== true) throw new Error('a new chat must be blank')
if (blank({ sending: true }) !== false) throw new Error('sending must hide the switch at once')
if (blank({ messages: [{ id: 'u' }] }) !== false) throw new Error('messages must hide the switch')
if (blank({ streaming: { assistantId: 'a' } }) !== false) throw new Error('streaming must hide the switch')
if (blank({ activeId: 'c2', conversations: [{ id: 'c2', messageCount: 0 }] }) !== true) throw new Error('an empty conversation is a blank page')
if (blank({ activeId: 'c3', conversations: [{ id: 'c3', messageCount: 4 }] }) !== false) throw new Error('an existing conversation must not flash the switch while loading')
if (blank({ activeId: 'c4', boot: 'idle', conversations: [] }) !== false) throw new Error('a restored session must not flash before bootstrap')
if (blank({ activeId: 'c4', boot: 'ready', conversations: [] }) !== true) throw new Error('a missing conversation is a blank page')
console.log('CHAT_BLANK_RULES_OK')

// Agent side: the native Session list decides, not the DOM.
agentSessions.rows = {}
agentSessions.phase = 'ready'
if (captured.readAgentPageState().blank !== true) throw new Error('no Session on a ready list is a blank Agent page')
agentSessions.phase = 'pending'
if (captured.readAgentPageState().blank !== false) throw new Error('a pending list must not flash the switch')
agentSessions.phase = 'ready'
agentSessions.rows = { s1: { id: 's1', blank: true, running: false, retainedBy: { mainView: 1 } } }
if (captured.readAgentPageState().blank !== true) throw new Error('a blank Session is a blank page')
agentSessions.rows = { s1: { id: 's1', blank: false, running: false, retainedBy: { mainView: 1 } } }
if (captured.readAgentPageState().blank !== false) throw new Error('an existing Session is not blank')
agentSessions.rows = { s1: { id: 's1', blank: true, running: true, retainedBy: { mainView: 1 } } }
if (captured.readAgentPageState().blank !== false) throw new Error('a running Session hides the switch on send')
agentSessions.rows = { s1: { id: 's1', blank: true, running: false, retainedBy: { mainView: 1 } } }
agentSessions.panelId = 'settings'
console.log('AGENT_PANEL_STATE', JSON.stringify(captured.readAgentPageState()))
if (captured.readAgentPageState().panel !== true) throw new Error('a global panel must not show the switch')
agentSessions.panelId = null
console.log('AGENT_BLANK_RULES_OK')

// Thinking duration must come from stored timestamps only: a settled reply
// reports the same value on every render, and an open block is only measured
// against the clock while it is live.
const settled = captured.thinkingSeconds(assistant, false)
await wait(110)
const again = captured.thinkingSeconds(assistant, false)
console.log('THINKING_STABLE', settled, again)
if (settled !== again) throw new Error(`settled thinking duration drifted: ${settled} -> ${again}`)
if (settled !== 1) throw new Error(`unexpected settled thinking duration: ${settled}`)
const openReply = {
  id: 'a2', role: 'assistant', createdAt: Date.now() - 5000, updatedAt: Date.now() - 4000, status: 'stopped',
  blocks: [{ type: 'thinking', thinking: '半截', signature: '', startedAt: Date.now() - 5000 }],
}
const stale = captured.thinkingSeconds(openReply, false)
await wait(110)
const staleAgain = captured.thinkingSeconds(openReply, false)
console.log('THINKING_STALE', stale, staleAgain, 'updatedAt-fallback')
if (stale !== staleAgain) throw new Error('an orphaned thinking block kept counting')
if (stale > 2) throw new Error(`an orphaned thinking block used the wall clock: ${stale}s`)

captured.chatStore.set({
  workspaces: [{ id: 'w1', title: 'dsh-chat', path: 'C:/work/dsh-chat' }],
  handoff: { generating: false, brief: '## 目标\n实现分段导航', generated: true, warning: '', instruction: '', workspaceId: 'w1', busy: false, error: '' },
})
render('HandoffDialog', captured.HandoffDialog)
render('ChatRoot-handoff', captured.ChatRoot)
captured.chatStore.set({ handoff: null })

// End-to-end client state flow against a synthetic NDJSON stream.
console.log('FLOW_START')
const streamLines = [
  { type: 'start', conversationId: 'c1', title: 'Hi', userMessage: { id: 'u-host', role: 'user', content: 'hi', files: [], createdAt: 1 }, assistantMessageId: 'a-host' },
  { type: 'event', event: { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } } },
  { type: 'event', event: { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Hello' } } },
  { type: 'event', event: { type: 'message_delta', delta: { stop_reason: 'end_turn' }, usage: { input_tokens: 2, output_tokens: 1 } } },
  {
    type: 'done',
    message: {
      id: 'a-host', role: 'assistant', createdAt: 1, updatedAt: 2, model: 'deepseek-flash',
      thinking: false, search: false, status: 'done', stopReason: 'end_turn',
      blocks: [{ type: 'text', text: 'Hello', citations: [] }], usage: { input_tokens: 2, output_tokens: 1 },
    },
    conversation: { id: 'c1', title: 'Hi', titleAuto: false, createdAt: 1, updatedAt: 2, messageCount: 2 },
  },
]
context.fetch = async (url) => {
  if (String(url).includes('/api/deepseek-chat/stream')) {
    const encoder = new TextEncoder()
    return new Response(new ReadableStream({
      start(controller) {
        for (const line of streamLines) controller.enqueue(encoder.encode(`${JSON.stringify(line)}\n`))
        controller.close()
      },
    }), { status: 200, headers: { 'content-type': 'application/x-ndjson' } })
  }
  return new Response(JSON.stringify({ error: { message: `unexpected ${url}` } }), { status: 500 })
}
captured.chatStore.set({
  activeId: 'c1', messages: [], draft: 'hi', attachments: [],
  auth: { ready: true, mode: 'auto', source: 'account', accountSignedIn: true, canStoreKey: true, chatKeyConfigured: false, dshKeyConfigured: false },
  settings: { authMode: 'auto', thinking: false, search: false, systemPrompt: '' },
  streaming: null, boot: 'ready', conversationError: '',
})
await captured.chatActions.sendMessage()
const flowState = captured.chatStore.state
const finalAssistant = flowState.messages.find(message => message.role === 'assistant')
console.log('FLOW_STATE', flowState.messages.length, flowState.streaming, finalAssistant?.status, finalAssistant?.blocks?.map(block => block.text).join(''))
if (flowState.messages.length !== 2 || flowState.streaming !== null || finalAssistant?.status !== 'done') {
  throw new Error('client flow did not settle correctly')
}
console.log('FLOW_OK')

// A pre-stream failure must restore the draft instead of losing it.
console.log('ROLLBACK_START')
context.fetch = async (url) => {
  if (String(url).includes('/api/deepseek-chat/stream')) {
    return new Response(JSON.stringify({ error: { message: 'auth', code: 'AUTH_REQUIRED', status: 401 } }), {
      status: 401, headers: { 'content-type': 'application/json' },
    })
  }
  return new Response(JSON.stringify({ error: { message: `unexpected ${url}` } }), { status: 500 })
}
captured.chatStore.set({
  activeId: 'c1', messages: [], draft: 'oops', attachments: [], streaming: null, boot: 'ready',
  settings: { authMode: 'auto', thinking: false, search: false, systemPrompt: '' },
  auth: { ready: true, mode: 'auto', source: 'account', accountSignedIn: true, canStoreKey: true },
})
await captured.chatActions.sendMessage()
const rollbackState = captured.chatStore.state
console.log('ROLLBACK_STATE', rollbackState.messages.length, JSON.stringify(rollbackState.draft), rollbackState.streaming, rollbackState.settingsOpen)
if (rollbackState.messages.length !== 0 || rollbackState.draft !== 'oops' || rollbackState.streaming !== null) {
  throw new Error('pre-stream rollback did not restore the composer')
}
console.log('ROLLBACK_OK')

// ---------------------------------------------------------------------------
// Composer: one rounded container, a bare auto-growing editor, and the + menu.
// ---------------------------------------------------------------------------
console.log('COMPOSER_START')
captured.chatStore.set({
  open: true, boot: 'ready', messages: [], activeId: null, draft: '你好，世界', attachments: [],
  settingsOpen: false, settings: { authMode: 'auto', thinking: true, search: true, systemPrompt: '' },
  sendKey: 'enter', streaming: null, stopping: false, auth: readyAuth,
  modelChoice: { model: 'deepseek-flash', effort: 'high' },
})
let composerTree = React.createElement(captured.Composer)
if (collectByClass(composerTree, 'dsc-editor-field').length !== 1) throw new Error('the composer needs exactly one editor field')
if (collectByClass(composerTree, 'dsc-textarea').length !== 0) throw new Error('the editor must not be the old bordered textarea')
if (collectByClass(composerTree, 'dsc-tool-button').length !== 0) throw new Error('per-tool buttons must move into the + menu')
if (collectByClass(composerTree, 'dsc-tools-trigger').length !== 1) throw new Error('the + menu trigger is missing')
if (collectByClass(composerTree, 'dsc-model-trigger').length !== 1) throw new Error('the model trigger is missing')
if (collectByClass(composerTree, 'dsc-active-tool').length !== 2) throw new Error('active search/thinking tools need chips')
const editor = collectByClass(composerTree, 'dsc-editor-field')[0]
if (typeof editor.props.onKeyDown !== 'function') throw new Error('the editor must own Enter handling')
if (!String(editor.props.value).includes('你好')) throw new Error('the editor must show the draft')
console.log('COMPOSER_STRUCTURE_OK')

// Enter / Shift+Enter / IME / Ctrl+Enter preference.
const key = overrides => ({ key: 'Enter', ...overrides })
if (captured.composerKeySends(key({}), 'enter') !== true) throw new Error('Enter must send in the default mode')
if (captured.composerKeySends(key({ shiftKey: true }), 'enter') !== false) throw new Error('Shift+Enter must insert a newline')
if (captured.composerKeySends(key({ isComposing: true }), 'enter') !== false) throw new Error('an IME composition must never send')
if (captured.composerKeySends(key({ nativeEvent: { isComposing: true } }), 'enter') !== false) throw new Error('a native IME composition must never send')
if (captured.composerKeySends(key({ keyCode: 229 }), 'enter') !== false) throw new Error('keyCode 229 must never send')
if (captured.composerKeySends(key({ ctrlKey: true }), 'ctrl-enter') !== true) throw new Error('Ctrl+Enter must send in the ctrl-enter mode')
if (captured.composerKeySends(key({ metaKey: true }), 'ctrl-enter') !== true) throw new Error('Cmd+Enter must send on macOS')
if (captured.composerKeySends(key({}), 'ctrl-enter') !== false) throw new Error('Enter must insert a newline in the ctrl-enter mode')
if (captured.composerKeySends({ key: 'a' }, 'enter') !== false) throw new Error('other keys must not send')
const eventOrder = []
const dispatch = { key: 'Enter', preventDefault() { eventOrder.push('prevent') }, shiftKey: false }
if (captured.composerKeySends(dispatch, 'enter') !== true) throw new Error('Enter dispatch must send')
console.log('COMPOSER_KEYS_OK')

// Unsupported image input is announced, not silently dropped.
captured.chatStore.set({
  modelChoice: { model: 'deepseek-v4-pro', effort: 'high' },
  attachments: [{ id: 'img1', name: 'cat.png', size: 10, isImage: true, status: 'ready', fileId: 'f1', previewUrl: '' }],
})
composerTree = React.createElement(captured.Composer)
if (collectByClass(composerTree, 'dsc-composer-warning').length !== 1) throw new Error('a model without vision must warn about images')
if (!collectionText(collectByClass(composerTree, 'dsc-composer-warning')[0]).includes('不支持图片')) throw new Error('the image warning must explain the reason')
captured.chatStore.set({
  modelChoice: { model: 'deepseek-flash', effort: 'high' },
  attachments: [{ id: 'img1', name: 'cat.png', size: 10, isImage: true, status: 'ready', fileId: 'f1', previewUrl: '' }],
})
composerTree = React.createElement(captured.Composer)
if (collectByClass(composerTree, 'dsc-composer-warning').length !== 0) throw new Error('flash accepts images without a warning')
captured.chatStore.set({ attachments: [] })
console.log('COMPOSER_VISION_OK')

// The tool registry is the one extension point; no fake entries exist.
const toolIds = captured.chatToolDefinitions().map(tool => tool.id)
if (toolIds.join(',') !== 'upload,web-search,deep-thinking') throw new Error(`unexpected tools: ${toolIds.join(',')}`)
let ranCustomTool = 0
const unregister = captured.registerChatTool({
  id: 'test-tool', kind: 'action', icon: 'spark', labelKey: 'toolsMenu', hintKey: 'toolsMenu',
  order: 5, run: () => { ranCustomTool += 1 },
})
if (captured.chatToolDefinitions()[0].id !== 'test-tool') throw new Error('a custom tool must respect its order')
const customTool = captured.chatToolDefinitions()[0]
customTool.run()
if (ranCustomTool !== 1) throw new Error('a registered tool must run its action')
unregister()
if (captured.chatToolDefinitions().some(tool => tool.id === 'test-tool')) throw new Error('unregister must remove the tool')
if (captured.chatToolDefinitions().length !== 3) throw new Error('only implemented tools may be registered')
console.log('TOOLS_REGISTRY_OK')

// Model helpers read the Host catalog and clamp to real tiers.
if (captured.modelCatalog().length !== 2) throw new Error('the two real models must come from the Host')
if (captured.modelById('deepseek-v4-pro').capabilities.vision !== false) throw new Error('v4-pro must be marked text-only')
if (captured.modelCapability(captured.modelById('deepseek-flash'), 'vision') !== true) throw new Error('flash must be marked vision-capable')
if (captured.modelEfforts(captured.modelById('deepseek-flash')).join(',') !== 'low,high,max') throw new Error('only real effort tiers may be offered')
const chip = captured.modelChipLabel(captured.modelById('deepseek-v4-pro'), true, 'max')
if (!chip.includes('V4 Pro') || !chip.includes('最高')) throw new Error(`unexpected model chip label: ${chip}`)
captured.chatStore.set({ modelChoice: { model: 'deepseek-v4-pro', effort: 'max' }, modelConfig: bootstrap.modelConfig })
const choice = captured.currentModelChoice()
if (choice.model.id !== 'deepseek-v4-pro' || choice.effort !== 'max') throw new Error('the stored model choice must be used')
captured.chatStore.set({ modelChoice: { model: 'retired-model', effort: 'ultra' }, models: [] })
const fallbackChoice = captured.currentModelChoice()
if (fallbackChoice.model.id !== 'deepseek-flash' || fallbackChoice.effort !== 'high') throw new Error('an unavailable model must fall back to the default one')
if (captured.chatStore.state.models.length === 0) captured.chatStore.set({ models: bootstrap.models, modelConfig: bootstrap.modelConfig })
console.log('MODEL_HELPERS_OK')

// A blank chat writes the default; an open conversation writes its override.
context.fetch = async (url, init) => {
  if (String(url).includes('/api/deepseek-chat/model')) {
    const body = JSON.parse(init.body)
    const config = JSON.parse(JSON.stringify(bootstrap.modelConfig))
    if (typeof body.conversationId === 'string') {
      config.conversations[body.conversationId] = { model: body.model, effort: body.effort }
    } else {
      config.defaults = { model: body.model, effort: body.effort }
    }
    return new Response(JSON.stringify({ models: bootstrap.models, modelConfig: config }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })
  }
  return new Response(JSON.stringify({ error: { message: `unexpected ${url}` } }), { status: 500 })
}
captured.chatStore.set({ activeId: null, models: bootstrap.models, modelConfig: bootstrap.modelConfig, modelChoice: { model: 'deepseek-flash', effort: 'high' } })
captured.chatActions.selectModel('deepseek-v4-pro')
await wait(40)
if (captured.chatStore.state.modelChoice.model !== 'deepseek-v4-pro') throw new Error('selecting a model must reach the store')
if (captured.chatStore.state.modelConfig.defaults.model !== 'deepseek-v4-pro') throw new Error('a blank chat must persist the default model')
captured.chatActions.selectEffort('low')
await wait(40)
if (captured.chatStore.state.modelChoice.effort !== 'low') throw new Error('selecting an effort must reach the store')
captured.chatStore.set({ activeId: 'c9', modelConfig: { defaults: { model: 'deepseek-flash', effort: 'high' }, conversations: {} } })
captured.chatActions.selectModel('deepseek-v4-pro')
await wait(40)
if (captured.chatStore.state.modelConfig.conversations.c9?.model !== 'deepseek-v4-pro') throw new Error('an open conversation must persist its own model')
console.log('MODEL_PERSIST_OK')

// Per-conversation drafts survive a switch and a new chat.
context.fetch = async (url) => {
  if (String(url).includes('/api/deepseek-chat/conversation')) {
    return new Response(JSON.stringify({ conversation: { id: 'c1', title: 't', messages: [] } }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })
  }
  return new Response(JSON.stringify({ error: { message: `unexpected ${url}` } }), { status: 500 })
}
captured.chatStore.set({ activeId: 'c1', draft: 'first draft', attachments: [], streaming: null, conversationLoading: false })
await captured.chatActions.newChat()
if (captured.chatStore.state.draft !== '') throw new Error('a new chat starts with its own (empty) draft')
captured.chatStore.set({ draft: 'second draft' })
await captured.chatActions.loadConversation('c1')
if (captured.chatStore.state.draft !== 'first draft') throw new Error(`switching back must restore the draft: ${captured.chatStore.state.draft}`)
await captured.chatActions.newChat()
if (captured.chatStore.state.draft !== 'second draft') throw new Error('new chat must restore its own draft')
captured.chatStore.set({ draft: '', activeId: null })
console.log('DRAFTS_OK')

// A model the API no longer serves is recoverable: revert to the default and
// keep the prompt, so the retry actually works.
context.fetch = async (url) => {
  if (String(url).includes('/api/deepseek-chat/conversation')) {
    return new Response(JSON.stringify({ conversation: { id: 'c-fallback', title: 't', messages: [] } }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })
  }
  if (String(url).includes('/api/deepseek-chat/stream')) {
    return new Response(JSON.stringify({ error: { message: 'unsupported model', code: 'INVALID_MODEL', status: 400 } }), {
      status: 400, headers: { 'content-type': 'application/json' },
    })
  }
  if (String(url).includes('/api/deepseek-chat/model')) {
    return new Response(JSON.stringify({
      models: bootstrap.models,
      modelConfig: { defaults: { model: 'deepseek-flash', effort: 'high' }, conversations: {} },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  return new Response(JSON.stringify({ error: { message: `unexpected ${url}` } }), { status: 500 })
}
captured.chatStore.set({
  activeId: null, messages: [], draft: 'retry me', attachments: [], streaming: null, sending: false,
  boot: 'ready', auth: readyAuth, settings: { authMode: 'auto', thinking: true, search: false, systemPrompt: '' },
  modelChoice: { model: 'deepseek-v4-pro', effort: 'max' }, models: bootstrap.models,
  modelConfig: { defaults: { model: 'deepseek-v4-pro', effort: 'max' }, conversations: {} },
  toasts: [],
})
await captured.chatActions.sendMessage()
await wait(30)
if (captured.chatStore.state.modelChoice.model !== 'deepseek-flash') throw new Error('an unavailable model must fall back to flash')
if (captured.chatStore.state.draft !== 'retry me') throw new Error('a rejected model request must keep the prompt')
if (!captured.chatStore.state.toasts.some(toast => String(toast.message).includes('已切换回'))) throw new Error('the model fallback must be explained')
console.log('MODEL_RECOVERY_OK')

// ---------------------------------------------------------------------------
// Sources: collapsed summary, numbered rows, citations tied to the same URLs.
// ---------------------------------------------------------------------------
console.log('SOURCES_START')
const citation = (url, title) => ({ type: 'web_search_result_location', url, title, cited_text: '', encrypted_index: '' })
const sourcedAssistant = {
  id: 'a-src', role: 'assistant', status: 'done', createdAt: 1, updatedAt: 2, stopReason: 'end_turn',
  blocks: [
    { type: 'text', text: '第一段。', citations: [citation('https://a.test/1', '甲页面')] },
    { type: 'text', text: '第二段。', citations: [citation('https://b.test/2', null)] },
    {
      type: 'web_search_tool_result', tool_use_id: 's1', kind: 'search',
      content: [
        { type: 'web_search_result', title: '丙页面', url: 'https://c.test/3', snippet: '丙摘要', site_name: '丙站' },
        { type: 'web_search_result', title: '甲页面（搜索）', url: 'https://a.test/1', snippet: '甲摘要', site_name: '甲站' },
        { type: 'web_search_result', title: '丁页面', url: 'https://d.test/4', snippet: '', site_name: null },
      ],
    },
  ],
}
const sourceData = captured.collectMessageSources(sourcedAssistant)
if (sourceData.sources.length !== 4) throw new Error(`sources must be deduplicated: ${sourceData.sources.length}`)
if (sourceData.indexByUrl.get('https://a.test/1') !== 1) throw new Error('the first citation must be source 1')
if (sourceData.indexByUrl.get('https://b.test/2') !== 2) throw new Error('the second citation must be source 2')
if (sourceData.indexByUrl.get('https://c.test/3') !== 3) throw new Error('search hits follow the cited pages')
if (sourceData.indexByUrl.get('https://d.test/4') !== 4) throw new Error('deduplication must not renumber later sources')
if (sourceData.sources[0].snippet !== '甲摘要') throw new Error('a cited page must borrow its search snippet')
if (sourceData.sources[1].title !== 'b.test') throw new Error('a missing citation title falls back to the hostname')
const mergedAnswer = captured.answerText(sourcedAssistant, sourceData.indexByUrl)
if (!mergedAnswer.includes(captured.citationMark(1)) || !mergedAnswer.includes(captured.citationMark(2))) throw new Error('answer text must carry the citation markers')
const answerTree = React.createElement(captured.Markdown, { text: mergedAnswer, sources: sourceData.sources })
const citeMarkers = collectByClass(answerTree, 'dsc-cite')
if (citeMarkers.length !== 2) throw new Error(`both citations must render as markers: ${citeMarkers.length}`)
if (citeMarkers[0].props['data-dsc-cite'] !== 1 || citeMarkers[0].props.href !== 'https://a.test/1') throw new Error('a citation marker must point at its own source')
if (citeMarkers[1].props['data-dsc-cite'] !== 2 || citeMarkers[1].props.href !== 'https://b.test/2') throw new Error('citation markers must keep their URL')
const assistantTree = React.createElement(captured.AssistantMessage, { message: sourcedAssistant, streaming: false, isLast: true })
if (collectByClass(assistantTree, 'dsc-sources-toggle').length !== 1) throw new Error('the sources summary must exist')
if (collectByClass(assistantTree, 'dsc-source-list').length !== 0) throw new Error('sources must start collapsed')
const summaryText = collectionText(collectByClass(assistantTree, 'dsc-sources-toggle')[0])
if (!summaryText.includes('来源 · 4')) throw new Error(`unexpected sources summary: ${summaryText}`)
const openPanel = React.createElement(captured.SourcePanel, {
  sources: sourceData.sources, messageId: 'a-src', open: true, activeIndex: 2, onToggle: () => {},
})
const rows = collectByClass(openPanel, 'dsc-source')
if (rows.length !== 4) throw new Error(`expanded sources must list every row: ${rows.length}`)
const listed = rows.map(row => collectionText(row))
if (!listed[2].includes('丙页面')) throw new Error('the expanded list must show titles in order')
if (listed[3].includes('丙摘要')) throw new Error('snippets must stay with their own source')
const links = collectByClass(openPanel, 'dsc-source-link')
if (links[0].props.href !== 'https://a.test/1' || links[3].props.href !== 'https://d.test/4') throw new Error('the expanded list must link the matching URLs')
const emptyPanel = React.createElement(captured.SourcePanel, { sources: [], messageId: 'none', open: true, activeIndex: null, onToggle: () => {} })
if (collectByClass(emptyPanel, 'dsc-sources-toggle').length !== 0) throw new Error('zero sources must render nothing')
console.log('SOURCES_OK')

// ---------------------------------------------------------------------------
// Markdown: code highlighting, math, mermaid, tables, streaming.
// ---------------------------------------------------------------------------
console.log('RENDERING_START')
const jsBlocks = captured.parseMarkdown('```js\nconst x = 1\nfunction f() {}\n```')
if (jsBlocks.length !== 1 || jsBlocks[0].type !== 'code') throw new Error('a fenced block must parse as code')
const codeTree = React.createElement(captured.Markdown, { text: '```js\nconst x = 1\nfunction f() {}\n```' })
if (collectByClass(codeTree, 'dsc-code').length !== 1) throw new Error('a code block must render its surface')
if (collectByClass(codeTree, 'dsc-tok-kw').length < 1) throw new Error('the code block must be syntax highlighted')
if (collectionText(collectByClass(codeTree, 'dsc-code-lang')[0]) !== 'js') throw new Error('the code block must show its language')
if (collectByClass(codeTree, 'dsc-code-copy').length !== 1) throw new Error('the code block must offer one-click copy')
const longCode = '```text\n' + Array.from({ length: 200 }, (_, index) => `line ${index}`).join('\n') + '\n```'
if (collectByClass(React.createElement(captured.Markdown, { text: longCode }), 'dsc-pre').length !== 1) throw new Error('a long block must keep one scroll container')

const mathBlocks = captured.parseMarkdown('$$\\frac{1}{2}$$')
if (mathBlocks.length !== 1 || mathBlocks[0].type !== 'math') throw new Error('display math must parse as a math block')
const maths = [
  '行内公式 $x^2 + y_1$ 结束。',
  '价格 $5 和 $10，不是公式。',
  '公式 \\(a+b\\) 也可以。',
  '$$\n\\sum_{i=1}^{n} i\n$$',
]
const inlineTree = React.createElement(captured.Markdown, { text: maths[0] })
if (collectByClass(inlineTree, 'dsc-math-inline').length !== 1) throw new Error('inline math must render')
const priceTree = React.createElement(captured.Markdown, { text: maths[1] })
if (collectByClass(priceTree, 'dsc-math-inline').length !== 0) throw new Error('currency must not be parsed as math')
const parenTree = React.createElement(captured.Markdown, { text: maths[2] })
if (collectByClass(parenTree, 'dsc-math-inline').length !== 1) throw new Error('\\( \\) math must render')
const displayTree = React.createElement(captured.Markdown, { text: maths[3] })
if (collectByClass(displayTree, 'dsc-math-block').length !== 1) throw new Error('display math must render as a block')
for (const tex of ['\\frac{1}{2}', '\\sqrt[3]{x}', '\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}', '\\unknowncommand{x}', '\\left( \\frac{a}{b} \\right)']) {
  const nodes = captured.latexToNodes(tex, { display: true })
  if (!Array.isArray(nodes) || nodes.length === 0) throw new Error(`math must render: ${tex}`)
}

const mermaidBlocks = captured.parseMarkdown('```mermaid\ngraph TD\n  A[开始] --> B{判断}\n  B --> C[结束]\n```')
if (mermaidBlocks.length !== 1 || mermaidBlocks[0].type !== 'mermaid') throw new Error('a mermaid fence must parse as a diagram')
const diagramTree = React.createElement(captured.Markdown, { text: '```mermaid\ngraph TD\n  A[开始] --> B{判断}\n  B --> C[结束]\n```' })
if (collectByClass(diagramTree, 'dsc-mermaid').length !== 1) throw new Error('a settled mermaid block must render a diagram')
const streamingDiagram = React.createElement(captured.Markdown, {
  text: '```mermaid\ngraph TD\n  A --> B', streaming: true,
})
if (collectByClass(streamingDiagram, 'dsc-diagram').length !== 1) throw new Error('a streaming diagram must render its source')
if (collectByClass(streamingDiagram, 'dsc-mermaid').length !== 0) throw new Error('a streaming diagram must not re-layout on every chunk')
const brokenDiagram = captured.parseMermaid('mindmap\n  root((x))')
if (brokenDiagram.kind !== 'unknown') throw new Error('unsupported diagram syntax must be reported')

const tableTree = React.createElement(captured.Markdown, { text: '| A | B |\n| --- | --- |\n| 1 | 2 |' })
if (collectByClass(tableTree, 'dsc-table').length !== 1) throw new Error('tables must render')
const quoteTree = React.createElement(captured.Markdown, { text: '> 引用 **重点**\n>\n> - 一\n> - 二' })
if (collectByClass(quoteTree, 'dsc-quote').length !== 1) throw new Error('block quotes must render')
if (collectByClass(quoteTree, 'dsc-list').length !== 1) throw new Error('lists inside quotes must render')
console.log('RENDERING_OK')

console.log('SMOKE_OK')
