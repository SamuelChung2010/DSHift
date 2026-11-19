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
    if (hookIndex >= hookState.length) hookState.push(initial)
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

const bootstrap = {
  version: 1,
  model: { id: 'deepseek-flash', name: 'DeepSeek V4.1 Flash' },
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
const ctx = {
  effect(callback) { callback(); return () => {} },
  locale: {
    register() { return () => {} },
    bind() { return key => key },
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
render('ChatToggle', captured.ChatToggle, { wide: true })

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
console.log('SMOKE_OK')
