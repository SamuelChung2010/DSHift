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
  version: 2,
  model: { id: 'deepseek-flash', name: 'DeepSeek V4.1 Flash' },
  models: [
    {
      id: 'deepseek-flash', name: 'DeepSeek V4.1 Flash', displayName: 'DeepSeek-V4.1-Flash', shortName: 'V4.1 Flash',
      descriptionKey: 'modelFlashDesc',
      capabilities: { vision: true, documents: true, search: true, thinking: true, efforts: ['low', 'high', 'max'] },
    },
    {
      id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', displayName: 'DeepSeek-V4-Pro', shortName: 'V4 Pro',
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
  folders: [],
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
// Dialogs must be native modal <dialog> elements: the top layer is what keeps
// the shared Chat | Agent switch behind the mask and inert while one is open.
const settingsModal = collectByClass(React.createElement(captured.SettingsDialog), 'dsc-modal-backdrop')
if (settingsModal.length !== 1 || settingsModal[0].type !== 'dialog') {
  throw new Error('dialogs must mount a native modal <dialog> top layer')
}
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

// ── Handoff workspace creation ───────────────────────────────────────────────
// The end-to-end flow: open the draft from the picker menu, choose where a new
// project folder goes through the native picker, create + register it on the
// Host, then create the Agent session with the edited brief in that workspace.
console.log('WORKSPACE_FLOW_START')
const flowBootstrap = {
  ...bootstrap,
  handoff: { enabled: true, workspaceCreate: true },
  workspaces: [{ id: 'w1', title: 'dsh-chat', path: 'C:/Users/Zhong/Documents/dsh-chat' }],
}
let pickedDirectory = null
let openedAgentSession = null
let workspaceRequest = null
let sendRequest = null
const uiWorkspaceMock = {
  async pickDirectory() { return pickedDirectory },
  openSession(sessionId) { openedAgentSession = sessionId },
}
const baseGet = ctx.get
ctx.get = name => (name === 'uiWorkspace' ? uiWorkspaceMock : baseGet(name))
const json = value => new Response(JSON.stringify(value), {
  status: 200,
  headers: { 'content-type': 'application/json' },
})
context.fetch = async (url, init) => {
  const target = String(url)
  if (target.includes('/api/deepseek-chat/bootstrap')) return json(flowBootstrap)
  if (target.includes('/api/deepseek-chat/workspace')) {
    workspaceRequest = JSON.parse(init.body)
    return json({
      workspace: { id: 'w9', title: workspaceRequest.title, path: workspaceRequest.path },
      created: { directory: true, workspace: true },
    })
  }
  if (target.includes('/api/deepseek-chat/handoff/send')) {
    sendRequest = JSON.parse(init.body)
    return json({ sessionId: 's9', workspaceId: sendRequest.workspaceId })
  }
  if (target.includes('/api/deepseek-chat/handoff')) {
    return json({ brief: '## 目标\n从零实现一个《星露谷物语》Mod。', generated: true })
  }
  return new Response(JSON.stringify({ error: { message: `unexpected ${target}` } }), { status: 500 })
}
const conversationMessages = [
  { id: 'u1', role: 'user', content: '我想做一个星露谷 Mod', files: [], createdAt: 1 },
  { id: 'a1', role: 'assistant', content: '', blocks: [{ type: 'text', text: '好的。', citations: [] }], status: 'done', createdAt: 2, updatedAt: 3 },
]
const flowConversations = [
  { id: 'c1', title: '星露谷物语 Mod 开发', titleAuto: true, createdAt: 1, updatedAt: 3, messageCount: 2 },
]
captured.chatStore.set({
  open: true,
  boot: 'ready',
  bootData: flowBootstrap,
  conversations: flowConversations,
  activeId: 'c1',
  messages: conversationMessages,
  workspaces: flowBootstrap.workspaces,
  handoff: null,
  streaming: null,
})
await captured.chatActions.openHandoff()
let flowHandoff = captured.chatStore.state.handoff
if (flowHandoff === null || flowHandoff.workspaceId !== 'w1') throw new Error('handoff must start on the selected workspace')
if (flowHandoff.workspaceDraft !== null) throw new Error('the creator must stay closed while an existing workspace is selected')

const suggestion = captured.handoffWorkspaceSuggestion({
  title: '星露谷物语 Mod 开发',
  brief: '## 目标\n从零实现一个《星露谷物语》Mod。',
  workspace: { id: 'w1', title: 'dsh-chat', path: 'C:/Users/Zhong/Documents/dsh-chat' },
  fallbackName: '新项目',
})
if (suggestion === null || suggestion.name !== '星露谷物语-Mod-开发') {
  throw new Error(`a new-project discussion must suggest a workspace: ${JSON.stringify(suggestion)}`)
}
if (captured.handoffWorkspaceSuggestion({
  title: 'dsh-chat 工作区交接',
  workspace: { id: 'w1', title: 'dsh-chat', path: 'C:/Users/Zhong/Documents/dsh-chat' },
}) !== null) throw new Error('a related workspace must not suggest a new one')

captured.chatActions.openHandoffWorkspaceDraft()
let draft = captured.chatStore.state.handoff.workspaceDraft
if (draft === null) throw new Error('selecting New workspace must open the creation panel')
if (draft.name !== '星露谷物语-Mod-开发') throw new Error(`unexpected suggested name: ${draft.name}`)
if (draft.path !== 'C:/Users/Zhong/Documents/星露谷物语-Mod-开发') {
  throw new Error(`the project folder must be proposed next to the current workspace: ${draft.path}`)
}
captured.chatActions.setHandoffWorkspaceDraftName('Stardew-Mod')
draft = captured.chatStore.state.handoff.workspaceDraft
if (draft.path !== 'C:/Users/Zhong/Documents/Stardew-Mod') throw new Error(`the name must drive the folder: ${draft.path}`)

// Switching back to an existing workspace closes the creation draft.
captured.chatActions.setHandoffWorkspace('w1')
if (captured.chatStore.state.handoff.workspaceDraft !== null) throw new Error('selecting an existing workspace must close the draft')
captured.chatActions.openHandoffWorkspaceDraft()
captured.chatActions.setHandoffWorkspaceDraftName('Stardew-Mod')
pickedDirectory = 'D:/Projects'
await captured.chatActions.pickHandoffWorkspaceDirectory('parent')
draft = captured.chatStore.state.handoff.workspaceDraft
if (draft.path !== 'D:/Projects/Stardew-Mod') throw new Error(`the picked parent must receive the folder: ${draft.path}`)

// An existing directory picked directly becomes the project folder and its
// name, and does not lose the brief/instruction already written.
captured.chatActions.setHandoffBrief('## 目标\n实现 Stardew-Mod。')
captured.chatActions.setHandoffInstruction('只在这个新项目里改动。')
pickedDirectory = 'D:/Projects/Stardew-Mod'
await captured.chatActions.pickHandoffWorkspaceDirectory('existing')
draft = captured.chatStore.state.handoff.workspaceDraft
if (draft.path !== 'D:/Projects/Stardew-Mod' || draft.name !== 'Stardew-Mod') {
  throw new Error(`picking an existing folder must adopt it: ${draft.path} / ${draft.name}`)
}
if (captured.chatStore.state.handoff.brief !== '## 目标\n实现 Stardew-Mod。') throw new Error('the workspace draft must not touch the brief')
if (captured.chatStore.state.handoff.instruction !== '只在这个新项目里改动。') throw new Error('the workspace draft must not touch the extra requirement')

const editedBrief = '## 目标\n实现 Stardew-Mod 的第一个可玩版本。'
captured.chatActions.setHandoffBrief(editedBrief)
await captured.chatActions.createHandoffWorkspace()
flowHandoff = captured.chatStore.state.handoff
if (flowHandoff === null) throw new Error('creating a workspace must keep the handoff dialog open')
if (flowHandoff.workspaceId !== 'w9') throw new Error(`the created workspace must be selected: ${flowHandoff.workspaceId}`)
if (flowHandoff.workspaceDraft !== null) throw new Error('the creation panel must close after creating')
if (flowHandoff.brief !== editedBrief) throw new Error('creating a workspace must preserve the edited brief')
if (flowHandoff.instruction !== '只在这个新项目里改动。') throw new Error('creating a workspace must preserve the extra requirement')
if (!captured.chatStore.state.workspaces.some(workspace => workspace.id === 'w9')) throw new Error('the created workspace must join the selected list')
if (workspaceRequest === null || workspaceRequest.path !== 'D:/Projects/Stardew-Mod' || workspaceRequest.title !== 'Stardew-Mod') {
  throw new Error(`the Host must receive the confirmed folder and name: ${JSON.stringify(workspaceRequest)}`)
}
console.log('WORKSPACE_CREATE_OK')

render('HandoffDialog-creator', captured.HandoffDialog)
render('HandoffWorkspaceCreator', captured.HandoffWorkspaceCreator, {
  draft: { name: 'Stardew-Mod', path: 'D:/Projects/Stardew-Mod', folderParent: 'D:/Projects', busy: false, error: '' },
})

await captured.chatActions.submitHandoff()
if (sendRequest === null) throw new Error('the handoff must reach the Host')
if (sendRequest.workspaceId !== 'w9') throw new Error(`the session must be created in the new workspace: ${sendRequest.workspaceId}`)
if (sendRequest.prompt !== editedBrief) throw new Error('the session must receive the confirmed brief')
if (openedAgentSession !== 's9') throw new Error(`the created session must be opened: ${openedAgentSession}`)
if (captured.chatStore.state.handoff !== null) throw new Error('a sent handoff must close')
if (captured.chatStore.state.open !== false) throw new Error('a sent handoff must return to Agent mode')

const namingCases = [
  ['星露谷物语 Mod 开发', '星露谷物语-Mod-开发'],
  ['a/b:c*?"<>|', 'a-b-c'],
  ['CON', 'fallback'],
  ['新对话', 'fallback'],
  ['   ', 'fallback'],
]
for (const [title, expected] of namingCases) {
  const value = captured.workspaceNameFromTitle(title, 'fallback')
  if (value !== expected) throw new Error(`workspace name from ${JSON.stringify(title)}: ${value} != ${expected}`)
}
if (captured.pathParent('C:\\Users\\Zhong\\Documents\\dsh-chat') !== 'C:\\Users\\Zhong\\Documents') throw new Error('Windows parent path')
if (captured.pathParent('/home/me/project') !== '/home/me') throw new Error('POSIX parent path')
if (captured.pathBasename('C:\\Projects\\Stardew-Mod\\') !== 'Stardew-Mod') throw new Error('Windows basename')
if (captured.joinWorkspacePath('C:\\Projects', 'Stardew-Mod') !== 'C:\\Projects\\Stardew-Mod') throw new Error('Windows join')
if (captured.joinWorkspacePath('D:/Projects', 'Stardew-Mod') !== 'D:/Projects/Stardew-Mod') throw new Error('POSIX join')
if (captured.isAbsoluteWorkspacePath('relative/path') !== false) throw new Error('relative paths are not absolute')
if (captured.isAbsoluteWorkspacePath('\\\\server\\share') !== true) throw new Error('UNC paths are absolute')
if (captured.isAbsoluteWorkspacePath('/home/me') !== true) throw new Error('POSIX absolute paths are absolute')
console.log('WORKSPACE_FLOW_OK')

// With no workspace at all, opening the handoff lands on the creation panel and
// proposes no folder (there is no sibling project to anchor it to).
context.fetch = async (url) => {
  const target = String(url)
  if (target.includes('/api/deepseek-chat/bootstrap')) return json({ ...flowBootstrap, workspaces: [] })
  if (target.includes('/api/deepseek-chat/handoff')) return json({ brief: '## 目标\n新项目。', generated: true })
  return new Response(JSON.stringify({ error: { message: `unexpected ${target}` } }), { status: 500 })
}
captured.chatStore.set({
  open: true,
  workspaces: [],
  bootData: { ...flowBootstrap, workspaces: [] },
  conversations: flowConversations,
  activeId: 'c1',
  messages: conversationMessages,
  handoff: null,
  streaming: null,
})
await captured.chatActions.openHandoff()
let emptyHandoff = captured.chatStore.state.handoff
if (emptyHandoff === null || emptyHandoff.workspaceDraft === null) throw new Error('no workspace must open the creation panel')
if (emptyHandoff.workspaceDraft.path !== '') throw new Error('there is no directory to propose a new project next to')
if (emptyHandoff.workspaceDraft.name !== '星露谷物语-Mod-开发') throw new Error(`the name suggestion must still apply: ${emptyHandoff.workspaceDraft.name}`)
if (emptyHandoff.workspaceId !== '') throw new Error('no workspace can be selected yet')
captured.chatStore.set({ handoff: null })

// The folder leaf is sanitized while the typed workspace name stays verbatim;
// a pasted quoted path (Explorer's "Copy as path") is accepted.
captured.chatStore.set({
  handoff: {
    generating: false, brief: 'B', generated: false, warning: '', instruction: '', title: 'X',
    workspaceId: 'w1',
    workspaceDraft: { name: 'X', folderParent: 'D:/Projects', path: 'D:/Projects/X', nameEdited: false, busy: false, error: '' },
    busy: false, error: '',
  },
})
captured.chatActions.setHandoffWorkspaceDraftName('A/B')
let leafDraft = captured.chatStore.state.handoff.workspaceDraft
if (leafDraft.path !== 'D:/Projects/A-B' || leafDraft.name !== 'A/B') {
  throw new Error(`the folder leaf must be sanitized without rewriting the name: ${leafDraft.path} / ${leafDraft.name}`)
}
captured.chatActions.setHandoffWorkspaceDraftPath('"D:\\Projects\\A-B"')
if (captured.chatStore.state.handoff.workspaceDraft.path !== 'D:\\Projects\\A-B') throw new Error('a pasted quoted path must drop its quotes')
if (captured.workspaceFolderLeaf('CON') !== 'CON-') throw new Error('reserved Windows names must not become folders')
if (captured.workspaceDraftIssue({ name: '', path: 'C:\\X' }) !== 'name') throw new Error('a blank name must be an issue')
if (captured.workspaceDraftIssue({ name: 'X', path: '' }) !== 'path') throw new Error('a blank path must be an issue')
if (captured.workspaceDraftIssue({ name: 'X', path: 'relative' }) !== 'absolute') throw new Error('a relative path must be an issue')
if (captured.workspaceDraftIssue({ name: 'X', path: '"C:\\X"' }) !== '') throw new Error('a quoted absolute path is usable')
if (captured.workspaceFolderLeaf('.') !== '') throw new Error('a dots-only name has no folder leaf')
if (captured.workspaceDraftIssue({ name: '...', path: 'D:/X', folderParent: 'D:/' }) !== 'folderName') {
  throw new Error('a name that cannot be a folder must be rejected while it drives the path')
}
captured.chatStore.set({ handoff: null })

// A Host that cannot register workspaces reports it without losing the draft.
captured.chatStore.set({
  workspaces: flowBootstrap.workspaces,
  handoff: {
    generating: false,
    brief: '## 尚未提交的任务',
    generated: true,
    warning: '',
    instruction: '保留我',
    title: '星露谷物语 Mod 开发',
    workspaceId: 'w1',
    workspaceDraft: {
      name: 'Stardew-Mod', folderParent: 'D:/Projects', path: 'D:/Projects/Stardew-Mod',
      nameEdited: true, busy: false, error: '',
    },
    busy: false,
    error: '',
  },
})
context.fetch = async () => new Response(JSON.stringify({
  error: { message: '没有可用的工作区服务', code: 'WORKSPACE_UNAVAILABLE', status: 501 },
}), { status: 501, headers: { 'content-type': 'application/json' } })
await captured.chatActions.createHandoffWorkspace()
const failedHandoff = captured.chatStore.state.handoff
if (failedHandoff.workspaceDraft === null || failedHandoff.workspaceDraft.busy !== false) throw new Error('a failed creation must unlock the panel')
if (!failedHandoff.workspaceDraft.error.includes('不支持')) throw new Error(`a failed creation must explain itself: ${failedHandoff.workspaceDraft.error}`)
if (failedHandoff.brief !== '## 尚未提交的任务' || failedHandoff.instruction !== '保留我') throw new Error('a failed creation must preserve the draft content')
if (failedHandoff.workspaceId !== 'w1') throw new Error('a failed creation must keep the previous workspace selected')
captured.chatStore.set({ handoff: null })
console.log('WORKSPACE_FAILURE_OK')

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

// ---- conversation organization: grouping, ordering and continuable answers ----
console.log('ORGANIZE_START')
const sidebarGroups = captured.organizeSidebar([
  { id: 'c1', pinned: true, pinnedAt: 10, archived: false, folderId: null, updatedAt: 10 },
  { id: 'c2', pinned: true, pinnedAt: 20, archived: false, folderId: 'f1', updatedAt: 20 },
  { id: 'c3', pinned: false, archived: false, folderId: 'f1', updatedAt: 30 },
  { id: 'c4', pinned: false, archived: false, folderId: null, updatedAt: 40 },
  { id: 'c5', pinned: false, archived: true, folderId: null, updatedAt: 50 },
], [{ id: 'f1', name: '工作', collapsed: false, createdAt: 1 }])
if (sidebarGroups.pinned.map(item => item.id).join(',') !== 'c2,c1') throw new Error('pinned chats must follow activity order')
if (sidebarGroups.folders[0].conversations.map(item => item.id).join(',') !== 'c3') throw new Error('folder contents are wrong')
if (sidebarGroups.loose.map(item => item.id).join(',') !== 'c4') throw new Error('unfiled contents are wrong')
if (sidebarGroups.archivedCount !== 1) throw new Error('archived chats must leave the list')
const tiedGroups = captured.organizeSidebar([
  { id: 'b', updatedAt: 5, pinned: false, archived: false, folderId: null },
  { id: 'a', updatedAt: 5, pinned: false, archived: false, folderId: null },
], [])
if (tiedGroups.loose.map(item => item.id).join(',') !== 'a,b') throw new Error('equal activity timestamps must stay deterministic')
if (captured.canContinueReply({ role: 'assistant', status: 'stopped', blocks: [{ type: 'text', text: 'half' }] }) !== true) throw new Error('a stopped answer with text must be continuable')
if (captured.canContinueReply({ role: 'assistant', status: 'stopped', blocks: [{ type: 'text', text: '   ' }] }) !== false) throw new Error('an empty answer cannot be continued')
if (captured.canContinueReply({ role: 'assistant', status: 'done', stopReason: 'end_turn', blocks: [{ type: 'text', text: 'full' }] }) !== false) throw new Error('a complete answer is not continuable')
if (captured.canContinueReply({ role: 'assistant', status: 'error', prefix: false, blocks: [{ type: 'text', text: 'x' }] }) !== false) throw new Error('a tool-terminated answer cannot be continued')
console.log('ORGANIZE_OK')

// ---- new surfaces render without a browser ----
captured.chatStore.set({
  conversations: [
    { id: 'c1', title: '测试对话', createdAt: 1, updatedAt: 9, pinned: true, pinnedAt: 5, archived: false, folderId: 'f1', messageCount: 2 },
    { id: 'c2', title: '已归档对话', createdAt: 1, updatedAt: 2, pinned: false, archived: true, archivedAt: 9, folderId: null, messageCount: 4 },
  ],
  folders: [{ id: 'f1', name: '工作', collapsed: false, createdAt: 1 }],
})
const versionedUser = { ...userMessage, version: { index: 1, count: 2 } }
const versionedAssistant = { ...assistant, version: { index: 2, count: 3 } }
render('UserMessage-versioned', captured.UserMessage, { message: versionedUser, canEdit: true })
render('AssistantMessage-versioned', captured.AssistantMessage, { message: versionedAssistant, streaming: false, isLast: true, canRegenerate: true })
render('VersionNav', captured.VersionNav, { message: versionedAssistant })
render('SearchResults', captured.SearchResults, {
  query: 'alpha',
  pending: false,
  results: [{
    id: 'c1', title: 'Alpha chat', snippet: '…an alpha match…', titleMatch: false,
    onActivePath: true, pinned: true, archived: false, updatedAt: 2,
  }],
  error: '',
  activeId: 'c1',
  onOpen() {},
})
render('SearchResults-empty', captured.SearchResults, {
  query: 'x', pending: false, results: [], error: '', activeId: null, onOpen() {},
})
captured.chatStore.set({ editingId: 'u1', editDraft: '你好\n第二行' })
render('UserMessageEditor', captured.UserMessageEditor, { message: userMessage })
captured.chatStore.set({ editingId: null, editDraft: '' })
captured.chatStore.set({ menu: { kind: 'conversation', id: 'c1', x: 120, y: 140 } })
render('ContextMenu-conversation', captured.ContextMenu)
captured.chatStore.set({ menu: { kind: 'folder', id: 'f1', x: 120, y: 140 } })
render('ContextMenu-folder', captured.ContextMenu)
captured.chatStore.set({ menu: null, folderPrompt: { mode: 'create', id: null, draft: '', busy: false } })
render('FolderPromptDialog', captured.FolderPromptDialog)
const folderTree = React.createElement(captured.FolderPromptDialog)
if (collectByClass(folderTree, 'dsc-form-modal').length !== 1) throw new Error('the folder prompt must use the shared form dialog')
if (collectByClass(folderTree, 'dsc-folder-name-input').length !== 1) throw new Error('the folder name field is missing')
const folderSubmit = collectByClass(folderTree, 'dsc-primary-button')[0]
if (folderSubmit === undefined || folderSubmit.props.disabled !== true) throw new Error('an empty folder name must disable Create')
captured.chatStore.set({ folderPrompt: { mode: 'create', id: null, draft: '工作', busy: false } })
const folderReady = React.createElement(captured.FolderPromptDialog)
const folderReadySubmit = collectByClass(folderReady, 'dsc-primary-button')[0]
if (folderReadySubmit.props.disabled !== false) throw new Error('a non-empty folder name must enable Create')
captured.chatStore.set({ folderPrompt: { mode: 'rename', id: 'f1', draft: '工作', busy: false } })
render('FolderPromptDialog-rename', captured.FolderPromptDialog)
captured.chatStore.set({ folderPrompt: null, moveChat: { conversationId: 'c1', folderId: null, busy: false } })
render('MoveChatDialog', captured.MoveChatDialog)
captured.chatStore.set({ moveChat: null, folderAdd: { folderId: 'f1', name: '工作', selected: ['c1'], busy: false } })
render('FolderAddDialog', captured.FolderAddDialog)
captured.chatStore.set({ folderAdd: null, archiveOpen: true })
render('ArchiveDialog', captured.ArchiveDialog)
render('ChatRoot-archive', captured.ChatRoot)
captured.chatStore.set({ archiveOpen: false })
console.log('ORG_SURFACES_OK')

// ---- edit, regenerate, continue, version switch and search jump ----
const flowSettings = { authMode: 'auto', thinking: false, search: false, systemPrompt: '' }
const originalUser = { id: 'u1', role: 'user', content: 'original', files: [], createdAt: 1 }
const originalReply = {
  id: 'a1', role: 'assistant', createdAt: 2, updatedAt: 2, status: 'done',
  blocks: [{ type: 'text', text: 'old answer', citations: [] }], usage: { input_tokens: 1, output_tokens: 1 },
}
let lastStreamBody = null
const ndjsonResponse = (lines) => {
  const encoder = new TextEncoder()
  return new Response(new ReadableStream({
    start(controller) {
      for (const line of lines) controller.enqueue(encoder.encode(`${JSON.stringify(line)}\n`))
      controller.close()
    },
  }), { status: 200, headers: { 'content-type': 'application/x-ndjson' } })
}

console.log('EDIT_FLOW_START')
context.fetch = async (url, init) => {
  if (!String(url).includes('/api/deepseek-chat/stream')) {
    return new Response(JSON.stringify({ error: { message: `unexpected ${url}` } }), { status: 500 })
  }
  lastStreamBody = JSON.parse(init.body)
  const messages = [
    { id: 'u9', role: 'user', content: 'edited question', files: [], createdAt: 5, version: { index: 2, count: 2 } },
    { id: 'a9', role: 'assistant', createdAt: 6, updatedAt: 6, model: 'deepseek-flash', thinking: false, search: false, status: 'streaming', blocks: [], prefix: true },
  ]
  return ndjsonResponse([
    { type: 'start', conversationId: 'c1', userMessageId: 'u9', assistantMessageId: 'a9', title: 'Hi', messages },
    { type: 'event', event: { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } } },
    { type: 'event', event: { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'new answer' } } },
    {
      type: 'done',
      message: { id: 'a9', role: 'assistant', createdAt: 6, updatedAt: 7, model: 'deepseek-flash', thinking: false, search: false, status: 'done', blocks: [{ type: 'text', text: 'new answer', citations: [] }], version: { index: 1, count: 1 } },
      conversation: { id: 'c1', title: 'Hi', titleAuto: false, createdAt: 1, updatedAt: 7, pinned: false, pinnedAt: null, archived: false, archivedAt: null, folderId: null, messageCount: 2 },
    },
  ])
}
captured.chatStore.set({
  activeId: 'c1', messages: [originalUser, originalReply], streaming: null, editingId: 'u1', editDraft: 'edited question',
  boot: 'ready', auth: readyAuth, settings: flowSettings, attachments: [], draft: '',
})
await captured.chatActions.saveEditedMessage()
if (lastStreamBody === null || lastStreamBody.mode !== 'edit' || lastStreamBody.targetMessageId !== 'u1') {
  throw new Error('editing must stream a branch for the edited message')
}
if (captured.chatStore.state.messages.map(item => item.id).join(',') !== 'u9,a9') throw new Error('editing must replace the visible branch')
if (captured.chatStore.state.messages[0].version.count !== 2) throw new Error('the edited question must report its version position')
if (captured.chatStore.state.messages[1].blocks[0].text !== 'new answer') throw new Error('the edited answer did not settle')
if (captured.chatStore.state.editingId !== null) throw new Error('the editor must close after saving')
console.log('EDIT_FLOW_OK')

console.log('REGENERATE_FLOW_START')
context.fetch = async (url, init) => {
  lastStreamBody = JSON.parse(init.body)
  const messages = [
    { id: 'u1', role: 'user', content: 'original', files: [], createdAt: 1 },
    { id: 'a7', role: 'assistant', createdAt: 8, updatedAt: 8, model: 'deepseek-flash', thinking: false, search: false, status: 'streaming', blocks: [], prefix: true, version: { index: 2, count: 2 } },
  ]
  return ndjsonResponse([
    { type: 'start', conversationId: 'c1', userMessageId: 'u1', assistantMessageId: 'a7', title: 'Hi', messages },
    { type: 'event', event: { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } } },
    { type: 'event', event: { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'regenerated' } } },
    {
      type: 'done',
      message: { id: 'a7', role: 'assistant', createdAt: 8, updatedAt: 9, model: 'deepseek-flash', thinking: false, search: false, status: 'done', blocks: [{ type: 'text', text: 'regenerated', citations: [] }], version: { index: 2, count: 2 } },
      conversation: { id: 'c1', title: 'Hi', titleAuto: false, createdAt: 1, updatedAt: 9, pinned: false, pinnedAt: null, archived: false, archivedAt: null, folderId: null, messageCount: 2 },
    },
  ])
}
captured.chatStore.set({ activeId: 'c1', messages: [originalUser, originalReply], streaming: null, editingId: null, editDraft: '', auth: readyAuth })
await captured.chatActions.regenerateMessage(captured.chatStore.state.messages[1])
if (lastStreamBody.mode !== 'regenerate' || lastStreamBody.targetMessageId !== 'a1') throw new Error('regeneration must target the answer')
if (captured.chatStore.state.messages[1].version.count !== 2) throw new Error('the regenerated answer must report both versions')
if (captured.chatStore.state.messages[1].blocks[0].text !== 'regenerated') throw new Error('the regenerated answer did not settle')
console.log('REGENERATE_FLOW_OK')

console.log('CONTINUE_FLOW_START')
const stoppedReply = {
  id: 'a1', role: 'assistant', createdAt: 2, updatedAt: 3, model: 'deepseek-flash', thinking: false, search: false,
  status: 'stopped', stopReason: 'end_turn', blocks: [{ type: 'text', text: '半截', citations: [] }], prefix: true,
}
context.fetch = async (url, init) => {
  lastStreamBody = JSON.parse(init.body)
  if (lastStreamBody.model !== 'deepseek-v4-pro') throw new Error('a continuation must send the selected model')
  if (captured.chatStore.state.messages[1].model !== 'deepseek-v4-pro') {
    throw new Error('a continuation must update the answer model label before streaming')
  }
  const continuedReply = { ...stoppedReply, model: lastStreamBody.model, effort: lastStreamBody.effort }
  return ndjsonResponse([
    { type: 'start', conversationId: 'c1', userMessageId: 'u1', assistantMessageId: 'a1', title: 'Hi', messages: [originalUser, { ...continuedReply, status: 'streaming' }] },
    { type: 'event', event: { type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } } },
    { type: 'event', event: { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: '继续' } } },
    {
      type: 'done',
      message: { ...continuedReply, status: 'done', updatedAt: 9, continueCount: 1, blocks: [{ type: 'text', text: '半截', citations: [] }, { type: 'text', text: '继续', citations: [] }] },
      conversation: { id: 'c1', title: 'Hi', titleAuto: false, createdAt: 1, updatedAt: 9, pinned: false, pinnedAt: null, archived: false, archivedAt: null, folderId: null, messageCount: 2 },
    },
  ])
}
captured.chatStore.set({
  activeId: 'c1', messages: [originalUser, stoppedReply], streaming: null, auth: readyAuth,
  modelChoice: { model: 'deepseek-v4-pro', effort: 'high' },
})
await captured.chatActions.continueMessage(captured.chatStore.state.messages[1])
if (lastStreamBody.mode !== 'continue' || lastStreamBody.targetMessageId !== 'a1') throw new Error('continuation must target the cut-off answer')
if (lastStreamBody.effort !== 'high') throw new Error('continuation must send the selected thinking effort')
if (captured.chatStore.state.messages[1].model !== 'deepseek-v4-pro') throw new Error('the continued answer must keep the selected model label')
if (captured.chatStore.state.messages.length !== 2) throw new Error('continuation must not add a turn')
if (captured.chatStore.state.messages[1].blocks.map(block => block.text).join('') !== '半截继续') throw new Error('the continuation was not appended')
if (captured.chatStore.state.messages[1].status !== 'done') throw new Error('the continued answer did not settle')
console.log('CONTINUE_FLOW_OK')

console.log('VERSION_FLOW_START')
context.fetch = async (url, init) => {
  const body = JSON.parse(init.body)
  if (body.action !== 'version') throw new Error(`unexpected action ${body.action}`)
  return new Response(JSON.stringify({
    conversation: {
      id: 'c1', title: 'Hi',
      messages: [
        { id: 'u2', role: 'user', content: 'older question', files: [], createdAt: 1, version: { index: 1, count: 2 } },
        { id: 'a2', role: 'assistant', createdAt: 2, updatedAt: 2, status: 'done', blocks: [{ type: 'text', text: 'older answer', citations: [] }] },
      ],
    },
    selectedId: 'u2',
    summaries: [{ id: 'c1', title: 'Hi', updatedAt: 9, pinned: false, archived: false, folderId: null, messageCount: 2 }],
    folders: [],
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}
captured.chatStore.set({ activeId: 'c1', messages: [originalUser, originalReply], streaming: null })
await captured.chatActions.selectVersion('u9', -1)
if (captured.chatStore.state.messages.map(item => item.id).join(',') !== 'u2,a2') throw new Error('a version switch must load the other branch')
if (captured.chatStore.state.focusMessage?.id !== 'u2') throw new Error('a version switch must focus the selected message')
console.log('VERSION_FLOW_OK')

console.log('SEARCH_JUMP_START')
context.fetch = async (url, init) => {
  const body = JSON.parse(init.body)
  if (body.action !== 'get' || body.focusMessageId !== 'a2') throw new Error('a search jump must focus the matched message')
  return new Response(JSON.stringify({
    conversation: {
      id: 'c1', title: 'Hi',
      messages: [
        { id: 'u2', role: 'user', content: 'q', files: [], createdAt: 1 },
        { id: 'a2', role: 'assistant', createdAt: 2, updatedAt: 2, status: 'done', blocks: [{ type: 'text', text: 'older answer', citations: [] }] },
      ],
    },
    folders: [],
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}
captured.chatStore.set({ activeId: 'c1', messages: [originalUser, originalReply], streaming: null })
await captured.chatActions.openSearchResult({ id: 'c1', messageId: 'a2', onActivePath: true })
if (captured.chatStore.state.messages.map(item => item.id).join(',') !== 'u2,a2') throw new Error('a search jump must open the matching branch')
if (captured.chatStore.state.focusMessage?.id !== 'a2') throw new Error('a search jump must focus the matching message')
console.log('SEARCH_JUMP_OK')

console.log('ORGANIZE_FLOW_START')
context.fetch = async (url, init) => {
  const body = JSON.parse(init.body)
  if (body.action === 'pin') {
    return new Response(JSON.stringify({
      conversation: { id: 'c1', title: 'Hi', messages: [], pinned: true, pinnedAt: 5, updatedAt: 9, archived: false, folderId: null, messageCount: 1 },
      summaries: [{ id: 'c1', title: 'Hi', updatedAt: 9, pinned: true, pinnedAt: 5, archived: false, folderId: null, messageCount: 1 }],
      folders: [],
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  if (body.action === 'folder.create') {
    return new Response(JSON.stringify({
      folder: { id: 'f9', name: '工作', collapsed: false, createdAt: 5 },
      summaries: [],
      folders: [{ id: 'f9', name: '工作', collapsed: false, createdAt: 5 }],
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  throw new Error(`unexpected action ${body.action}`)
}
captured.chatStore.set({
  conversations: [{ id: 'c1', title: 'Hi', updatedAt: 9, pinned: false, archived: false, folderId: null, messageCount: 1 }],
  folders: [],
  menu: { kind: 'conversation', id: 'c1', x: 10, y: 10 },
})
await captured.chatActions.setPinned('c1', true)
if (captured.chatStore.state.conversations[0].pinned !== true) throw new Error('pinning did not update the summary')
if (captured.chatStore.state.menu !== null) throw new Error('the menu must close after the action')
captured.chatActions.requestFolderPrompt('create')
captured.chatActions.updateFolderPrompt('工作')
await captured.chatActions.submitFolderPrompt()
if (captured.chatStore.state.folders.length !== 1 || captured.chatStore.state.folders[0].name !== '工作') throw new Error('folder creation did not reach the store')
if (captured.chatStore.state.folderPrompt !== null) throw new Error('the folder prompt must close')
console.log('ORGANIZE_FLOW_OK')
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
if (collectByClass(composerTree, 'dsc-tools-trigger').length !== 1) throw new Error('the + menu trigger is missing')
if (collectByClass(composerTree, 'dsc-model-trigger').length !== 1) throw new Error('the model trigger is missing')
const quickTools = collectByClass(composerTree, 'dsc-tool-toggle')
if (quickTools.length !== 2) throw new Error(`search and deep thinking need direct buttons: ${quickTools.length}`)
if (quickTools.map(node => node.props['data-tool']).join(',') !== 'web-search,deep-thinking') throw new Error('the quick toggles must be search then deep thinking')
if (quickTools.some(node => node.props['aria-pressed'] !== true)) throw new Error('both direct toggles must show their on state')
if (collectByClass(composerTree, 'dsc-active-tool').length !== 0) throw new Error('toggles must not become removable chips')
if (collectByClass(composerTree, 'dsc-effort-trigger').length !== 0) throw new Error('effort must live in the model seat, not a second trigger')
const effortSeat = collectByClass(composerTree, 'dsc-model-effort')
if (effortSeat.length !== 1) throw new Error('the model seat must show the current effort')
if (!collectionText(effortSeat[0]).includes('High')) throw new Error('the model seat must carry the current tier')
const modelSeat = collectByClass(composerTree, 'dsc-model-trigger')[0]
if (!collectionText(modelSeat).includes('DeepSeek-V4.1-Flash')) throw new Error('the model seat must use the API-style display name')
const editor = collectByClass(composerTree, 'dsc-editor-field')[0]
if (typeof editor.props.onKeyDown !== 'function') throw new Error('the editor must own Enter handling')
if (!String(editor.props.value).includes('你好')) throw new Error('the editor must show the draft')
console.log('COMPOSER_STRUCTURE_OK')

// The effort value is always present beside the model, showing Off while
// thinking is disabled, so toggling never moves the model seat.
captured.chatStore.set({ settings: { authMode: 'auto', thinking: false, search: true, systemPrompt: '' } })
composerTree = React.createElement(captured.Composer)
const offEffort = collectByClass(composerTree, 'dsc-model-effort')
if (offEffort.length !== 1 || !collectionText(offEffort[0]).includes('Off')) throw new Error('the model seat must show Off while thinking is off')
captured.chatStore.set({ settings: { authMode: 'auto', thinking: true, search: true, systemPrompt: '' } })

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
if (captured.chatMenuTools().map(tool => tool.id).join(',') !== 'upload') throw new Error('the + menu must only contain action tools')
if (captured.composerToolDefinitions().map(tool => tool.id).join(',') !== 'web-search,deep-thinking') throw new Error('the composer must own the two quick toggles')
let ranCustomTool = 0
const unregister = captured.registerChatTool({
  id: 'test-tool', kind: 'action', icon: 'spark', labelKey: 'toolsMenu', hintKey: 'toolsMenu',
  order: 5, run: () => { ranCustomTool += 1 },
})
if (captured.chatToolDefinitions()[0].id !== 'test-tool') throw new Error('a custom tool must respect its order')
if (captured.chatMenuTools()[0].id !== 'test-tool') throw new Error('a menu action must appear in the + menu')
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
if (!chip.includes('V4 Pro') || !chip.includes('Max')) throw new Error(`unexpected model chip label: ${chip}`)
captured.chatStore.set({ modelChoice: { model: 'deepseek-v4-pro', effort: 'max' }, modelConfig: bootstrap.modelConfig })
const choice = captured.currentModelChoice()
if (choice.model.id !== 'deepseek-v4-pro' || choice.effort !== 'max') throw new Error('the stored model choice must be used')
captured.chatStore.set({ modelChoice: { model: 'retired-model', effort: 'ultra' }, models: [] })
const fallbackChoice = captured.currentModelChoice()
if (fallbackChoice.model.id !== 'deepseek-flash' || fallbackChoice.effort !== 'high') throw new Error('an unavailable model must fall back to the default one')
if (captured.chatStore.state.models.length === 0) captured.chatStore.set({ models: bootstrap.models, modelConfig: bootstrap.modelConfig })
captured.chatStore.set({
  models: bootstrap.models,
  modelChoice: { model: 'deepseek-v4-pro', effort: 'max' },
  settings: { authMode: 'auto', thinking: true, search: true, systemPrompt: '' },
})
if (captured.modelTriggerLabel(captured.modelById('deepseek-v4-pro')) !== 'DeepSeek-V4-Pro') throw new Error('the model seat must use the API-style display name')
if (captured.modelDisplayName({ name: 'DeepSeek V4 Pro' }) !== 'DeepSeek V4 Pro') throw new Error('a model without a display name must fall back to its catalog name')
if (captured.modelDisplayName({ name: 'DeepSeek V4 Pro', version: 'DeepSeek-V4-Pro-0813' }) !== 'DeepSeek-V4-Pro') throw new Error('an older Host catalog must derive the native display name from version')
const modelMenuTree = React.createElement(captured.ModelMenu)
const modelTriggerNode = collectByClass(modelMenuTree, 'dsc-model-trigger')[0]
if (modelTriggerNode === undefined) throw new Error('the compact model menu needs a trigger')
const modelTriggerText = collectionText(modelTriggerNode)
if (!modelTriggerText.includes('DeepSeek-V4-Pro') || !modelTriggerText.includes('Max')) throw new Error(`the model seat must carry both values: ${modelTriggerText}`)
if (!captured.modelNotes(captured.modelById('deepseek-v4-pro')).join(' ').includes('不支持图片')) throw new Error('a text-only model must carry its one-line limitation')
if (captured.modelNotes(captured.modelById('deepseek-flash')).length !== 0) throw new Error('flash has no limitation to advertise')
// A model without the capability disables the matching direct button in place.
const textOnly = {
  id: 'text-only', name: 'Text Only', shortName: 'Text',
  capabilities: { vision: false, documents: true, search: false, thinking: false, efforts: [] },
}
captured.chatStore.set({
  models: [textOnly], modelChoice: { model: 'text-only', effort: 'high' },
  settings: { authMode: 'auto', thinking: true, search: true, systemPrompt: '' },
})
composerTree = React.createElement(captured.Composer)
const disabledTools = collectByClass(composerTree, 'dsc-tool-toggle')
if (disabledTools.length !== 2 || disabledTools.some(node => node.props.disabled !== true)) throw new Error('unsupported capabilities must disable the direct buttons')
if (!disabledTools.every(node => String(node.props.title).includes('不支持'))) throw new Error('a disabled tool must explain why')
if (collectByClass(composerTree, 'dsc-model-effort').length !== 0) throw new Error('a model without thinking must not show an effort value')
captured.chatStore.set({
  models: bootstrap.models, modelChoice: { model: 'deepseek-flash', effort: 'high' },
  settings: { authMode: 'auto', thinking: true, search: true, systemPrompt: '' },
})
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

// ---------------------------------------------------------------------------
// Chat history import: every dialog step renders from store state alone.
// ---------------------------------------------------------------------------
console.log('IMPORT_START')
const importRows = [
  { sourceId: 's1', title: '年度计划', messageCount: 8, createdAt: Date.UTC(2026, 9, 1, 4, 0), updatedAt: Date.UTC(2026, 9, 2, 4, 0), imported: false },
  { sourceId: 's2', title: 'Rust 生命周期笔记', messageCount: 2, createdAt: Date.UTC(2026, 8, 20, 4, 0), updatedAt: Date.UTC(2026, 8, 20, 5, 0), imported: true },
  { sourceId: 's3', title: 'Weekly review', messageCount: 14, createdAt: null, updatedAt: null, imported: false },
]
const importView = (patch) => ({
  step: 'pick',
  fileName: '',
  fileSize: 0,
  token: '',
  conversations: [],
  selected: [],
  filter: '',
  stats: { total: 0, imported: 0, importable: 0 },
  progress: { done: 0, total: 0 },
  jobId: '',
  cancelling: false,
  result: null,
  error: '',
  ...patch,
})
if (captured.filterImportRows(importRows, 'rust').length !== 1) throw new Error('the preview filter must match titles case-insensitively')
if (captured.filterImportRows(importRows, '  ').length !== 3) throw new Error('a blank filter must keep every row')
if (captured.importDateLabel(null, captured.DICTS ? key => captured.DICTS.zh[key] ?? key : key => key) !== captured.DICTS.zh.importDateUnknown) {
  throw new Error('a missing export date must be reported as unknown')
}

captured.chatStore.set({ importOpen: true, importView: importView({}) })
const pickTree = captured.ImportDialog()
if (collectByClass(pickTree, 'dsc-import-drop').length !== 1) throw new Error('the pick step must render one drop zone')
const fileInput = collectByClass(pickTree, 'dsc-import-input')[0]
if (fileInput?.props?.type !== 'file' || !String(fileInput?.props?.accept).includes('.zip')) {
  throw new Error('the pick step must offer a ZIP file input')
}
if (!collectionText(pickTree).includes(captured.DICTS.zh.importDropTitle)) throw new Error('the drop zone must name its action')
// The sidebar entry and the mounted dialog are the only ways in.
const importEntries = collectByClass(React.createElement(captured.Sidebar), 'dsc-foot-action')
  .filter(node => collectionText(node).includes(captured.DICTS.zh.importOpen))
if (importEntries.length !== 1) throw new Error('the sidebar must offer one import entry')
const rootWithImport = React.createElement(captured.ChatRoot)
if (collectByClass(rootWithImport, 'dsc-import-modal').length !== 1) throw new Error('ChatRoot must mount the import dialog while it is open')

captured.chatStore.set({
  importView: importView({
    step: 'preview', token: 'tok', fileName: 'deepseek_data.zip', fileSize: 141_850_492,
    conversations: importRows, selected: ['s1', 's3'],
    stats: { total: 3, imported: 1, importable: 2 },
  }),
})
const previewTree = captured.ImportDialog()
const itemRows = collectByClass(previewTree, 'dsc-import-item')
if (itemRows.length !== 3) throw new Error(`the preview must list every conversation: ${itemRows.length}`)
if (itemRows.filter(row => row.props['aria-checked'] === true).length !== 2) throw new Error('selected rows must be checked')
if (itemRows.filter(row => row.props.disabled === true).length !== 1) throw new Error('an imported row must not be selectable again')
if (collectByClass(previewTree, 'dsc-import-badge').length !== 1) throw new Error('an imported row must be badged')
if (!collectionText(previewTree).includes('已选 2 个，可导入 2 个')) throw new Error('the selection count must be shown')
if (collectByClass(previewTree, 'dsc-import-filter-input').length !== 1) throw new Error('the preview must offer a title filter')
const startButton = collectByClass(previewTree, 'dsc-primary-button')[0]
if (startButton?.props?.disabled === true) throw new Error('the import button must be enabled with a selection')

captured.chatStore.set({ importView: importView({ step: 'importing', token: 'tok', jobId: 'job-1', progress: { done: 120, total: 300 } }) })
const importingTree = captured.ImportDialog()
const bar = collectByClass(importingTree, 'dsc-import-bar')[0]
if (bar?.props?.role !== 'progressbar' || bar?.props['aria-valuenow'] !== 40) throw new Error('the progress bar must report its percentage')
if (collectByClass(importingTree, 'dsc-import-bar-fill')[0]?.props?.style?.width !== '40%') throw new Error('the progress fill must follow the count')

captured.chatStore.set({
  importView: importView({
    step: 'done',
    result: {
      id: 'job-1', state: 'done', total: 3, done: 3, imported: 2, skipped: 1, failed: 1,
      media: { restored: 4, bytes: 1024, omitted: 0 },
      failures: [{ sourceId: 's3', title: 'Weekly review', code: 'BAD_SESSION', reason: 'broken' }],
    },
  }),
})
const doneTree = captured.ImportDialog()
const statValues = collectByClass(doneTree, 'dsc-import-stat-value').map(node => collectionText(node))
if (statValues.join(',') !== '2,1,1') throw new Error(`the result must count imported, skipped and failed: ${statValues.join(',')}`)
if (collectByClass(doneTree, 'dsc-import-failure').length !== 1) throw new Error('a failed conversation must be listed')
if (collectByClass(doneTree, 'dsc-import-memory').length !== 1) throw new Error('an imported batch must offer the optional memory pass')

captured.chatStore.set({ importView: importView({ step: 'pick', error: 'NOT_A_ZIP' }) })
if (collectByClass(captured.ImportDialog(), 'dsc-import-error').length !== 1) throw new Error('a read failure must be shown in the dialog')

captured.chatActions.closeImport()
if (captured.chatStore.state.importOpen !== false || captured.chatStore.state.importView !== null) {
  throw new Error('closing the dialog must clear its state')
}
console.log('IMPORT_OK')

// ---------------------------------------------------------------------------
// Long-term memory: parser, prompt contract and the two new UI surfaces.
// ---------------------------------------------------------------------------
console.log('MEMORY_START')
const parsedExport = captured.parseMemoryExport([
  '## Instructions',
  '- [2026-01-02] - Always answer in Chinese.',
  '## Identity',
  '- [unknown] - I am Alex and I live in Singapore.',
].join('\n'))
if (parsedExport.entries.length !== 2) throw new Error(`the memory parser must read both records: ${parsedExport.entries.length}`)
if (parsedExport.entries[0].category !== 'instruction' || parsedExport.entries[1].category !== 'identity') {
  throw new Error('the memory parser must keep the category headings')
}
if (parsedExport.entries[1].date !== 'unknown') throw new Error('the memory parser must keep an unknown date marker')
for (const phrase of ['Instructions', 'Identity', 'Career', 'Projects', 'Preferences', '[YYYY-MM-DD]', '[unknown]', 'fenced code block']) {
  if (!captured.MEMORY_IMPORT_PROMPT.includes(phrase)) throw new Error(`the import prompt is missing ${phrase}`)
}
// The pane paints a loading state before its Host fetch resolves, so rendering
// it here exercises the mount path without a network round trip.
render('MemorySettingsPane', captured.MemorySettingsPane)
render('MemoryImportDialog', captured.MemoryImportDialog, { onClose: () => {}, onImported: () => {} })
const importTree = React.createElement(captured.MemoryImportDialog, { onClose: () => {}, onImported: () => {} })
if (collectByClass(importTree, 'dsc-memory-import').length === 0) throw new Error('the import dialog must mount its own native <dialog>')
if (collectByClass(importTree, 'dsc-memory-prompt').length !== 1) throw new Error('the import dialog must show the copyable prompt')
console.log('MEMORY_OK')

// ---------------------------------------------------------------------------
// Optional memory extraction from imported chats: choosing is separate from
// confirming the model calls, and an analyzed chat is badged, never hidden.
// ---------------------------------------------------------------------------
console.log('IMPORT_MEMORY_START')
captured.chatStore.set({
  importMemoryOpen: true,
  importMemoryBatch: ['conv-imported'],
  conversations: [{
    id: 'conv-imported',
    title: 'Imported project chat',
    messageCount: 6,
    updatedAt: 10,
    source: { kind: 'deepseek', id: 'export-1', importedAt: 5, memoryExtractedAt: null },
  }],
})
const extractTree = React.createElement(captured.ImportMemoryDialog, { onClose: () => {} })
if (collectByClass(extractTree, 'dsc-memory-extract-modal').length !== 1) throw new Error('the extract dialog must mount its own modal')
if (collectByClass(extractTree, 'dsc-import-item').length !== 1) throw new Error('the extract dialog must list the imported conversation')
if (collectByClass(extractTree, 'dsc-import-item').some(row => row.props['aria-checked'] === true)) throw new Error('no imported conversation may be preselected for analysis')
if (!collectionText(extractTree).includes(captured.DICTS.zh.memoryExtractTitle)) throw new Error('the extract dialog must name its purpose')
if (collectByClass(extractTree, 'dsc-memory-consent').length !== 0) throw new Error('no consent may appear before the user asks to analyze')
captured.chatStore.set({
  conversations: [{
    id: 'conv-imported',
    title: 'Imported project chat',
    messageCount: 6,
    updatedAt: 10,
    source: { kind: 'deepseek', id: 'export-1', importedAt: 5, memoryExtractedAt: 9 },
  }],
})
const analyzedTree = React.createElement(captured.ImportMemoryDialog, { onClose: () => {} })
if (collectByClass(analyzedTree, 'dsc-import-badge').length !== 1) throw new Error('an analyzed conversation must be badged')
console.log('IMPORT_MEMORY_OK')

captured.chatStore.set({
  importMemoryOpen: true,
  importMemoryBatch: ['conv-imported'],
  boot: 'ready',
  open: true,
  conversations: [{
    id: 'conv-imported',
    title: 'Imported project chat',
    messageCount: 6,
    updatedAt: 10,
    source: { kind: 'deepseek-export', id: 'export-1', importedAt: 5, memoryExtractedAt: null },
  }],
})
const rootTree = React.createElement(captured.ChatRoot)
if (collectByClass(rootTree, 'dsc-memory-extract-modal').length !== 1) throw new Error('ChatRoot must mount the import-memory dialog while it is open')
captured.chatStore.set({ importMemoryOpen: false, importMemoryBatch: [] })

console.log('SMOKE_OK')
