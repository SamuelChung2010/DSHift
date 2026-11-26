/**
 * Fast checks for the client half of long-term memory: the export prompt and
 * the local parser, loaded from the built client.js with a minimal React shim.
 * Run `node tools/build-client.js` first.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

let captured = null
let definition = null
let hookContext = null

const React = {
  createElement(type, props, ...children) {
    const next = { ...(props ?? {}) }
    if (children.length === 1) next.children = children[0]
    else if (children.length > 1) next.children = children
    return { type, props: next }
  },
  Fragment: Symbol('Fragment'),
  useState(initial) {
    const value = typeof initial === 'function' ? initial() : initial
    if (hookContext === null) return [value, () => {}]
    const injected = hookContext.overrides.has(hookContext.index) ? hookContext.overrides.get(hookContext.index) : value
    hookContext.index += 1
    return [injected, () => {}]
  },
  useEffect() {},
  useLayoutEffect() {},
  useMemo(factory) { return factory() },
  useCallback(fn) { return fn },
  useRef(initial) { return { current: initial } },
  useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot() },
  memo(component) { return component },
}

function fakeNode() {
  return { setAttribute() {}, appendChild() {}, remove() {}, addEventListener() {}, removeEventListener() {}, style: {} }
}

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  document: {
    baseURI: 'http://127.0.0.1:52345/',
    head: { appendChild() {} },
    body: { appendChild() {} },
    createElement: fakeNode,
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return null },
    querySelectorAll() { return [] },
  },
  location: { protocol: 'http:', origin: 'http://127.0.0.1:52345' },
  navigator: { language: 'zh-CN', languages: ['zh-CN'] },
  localStorage: { getItem() { return null }, setItem() {} },
  fetch: async () => new Response(JSON.stringify({ error: { message: 'unexpected fetch' } }), { status: 500 }),
  addEventListener() {},
  removeEventListener() {},
  innerWidth: 1200,
  __DSC_TEST_HOOK__: value => { captured = value },
}
sandbox.window = sandbox
sandbox.globalThis = sandbox
sandbox.window.__ModuleLoader__ = { load: value => { definition = value } }
vm.createContext(sandbox)
vm.runInContext(fs.readFileSync(new URL('../client.js', import.meta.url), 'utf8'), sandbox, { filename: 'client.js' })
if (definition === null) throw new Error('client bundle did not register (run node tools/build-client.js)')
const plugin = definition.factory(name => {
  if (name === 'react') return React
  throw new Error(`unexpected require ${name}`)
})
if (captured === null) throw new Error('test hook was not called')
const hook = captured

const dicts = hook.DICTS
function translate(key, vars) {
  const template = typeof dicts.zh[key] === 'string' ? dicts.zh[key] : key
  if (vars === undefined) return template
  return template.replace(/\{(\w+)\}/g, (match, name) => (vars[name] === undefined ? match : String(vars[name])))
}
plugin.apply({
  effect(callback) { callback(); return () => {} },
  get() { return undefined },
  locale: {
    register() { return () => {} },
    bind() { return translate },
    subscribe() { return () => {} },
    getSnapshot() { return { active: 'zh' } },
  },
  slots: {
    inject(_name, callback) { callback() },
    register(_options, component) { return component },
  },
})

function collect(node, visit) {
  if (node === null || node === undefined || typeof node === 'boolean') return
  if (typeof node === 'string' || typeof node === 'number') { visit(node); return }
  if (Array.isArray(node)) { for (const child of node) collect(child, visit); return }
  if (typeof node === 'function') { collect(node({}), visit); return }
  if (node.type === React.Fragment) { collect(node.props?.children, visit); return }
  if (typeof node.type === 'function') { collect(node.type(node.props ?? {}), visit); return }
  visit(node)
  collect(node.props?.children, visit)
}

function render(Component) {
  const nodes = []
  collect(React.createElement(Component, {}), node => nodes.push(node))
  return nodes
}

/** Render one component with injected useState values, for non-initial steps. */
function renderWith(Component, props, overrides) {
  const entries = Object.entries(overrides ?? {}).map(([index, value]) => [Number(index), value])
  const context = { index: 0, overrides: new Map(entries) }
  const previous = hookContext
  hookContext = context
  let tree
  try {
    tree = Component(props ?? {})
  } finally {
    hookContext = previous
  }
  const nodes = []
  collect(tree, node => nodes.push(node))
  return nodes
}

function textOf(nodes) {
  return nodes.filter(node => typeof node === 'string').join(' ')
}

const symbols = [
  'MemorySettingsPane', 'MemoryImportDialog', 'parseMemoryExport', 'MEMORY_IMPORT_PROMPT',
  'memoryCategoryIds', 'memoryCategoryLabel', 'parseMemoryDate', 'DICTS',
]
for (const name of symbols) assert.ok(name in hook, `test hook is missing ${name}`)

const plain = value => JSON.parse(JSON.stringify(value))
const { parseMemoryExport, MEMORY_IMPORT_PROMPT, memoryCategoryIds, memoryCategoryLabel, parseMemoryDate } = hook

assert.deepEqual(plain(memoryCategoryIds), ['instruction', 'identity', 'career', 'projects', 'preferences'])
assert.equal(memoryCategoryLabel('projects', translate), '项目')

assert.deepEqual(plain(parseMemoryDate('[2024-02-03] - hello')), { date: '2024-02-03', content: 'hello' })
assert.deepEqual(plain(parseMemoryDate('[unknown] - hello')), { date: 'unknown', content: 'hello' })
assert.deepEqual(plain(parseMemoryDate('plain line')), { date: null, content: 'plain line' })

const englishSample = [
  'Here is my memory export:',
  '',
  '```markdown',
  '# Long-Term Memory Export',
  '',
  '## Instructions',
  '[2024-03-01] - Always answer in Chinese unless I ask for English.',
  '[unknown] - Keep code examples short and runnable.',
  '',
  '## Identity',
  '[2024-01-15] - My name is Alex and I live in Singapore.',
  '',
  '## Career',
  '[unknown] - I work as a backend engineer at a fintech company.',
  '',
  '## Projects',
  '[2024-06-20] - I am building **dsh-chat**, a plugin for DeepSeek Harness.',
  '- I maintain a small CLI tool in Rust.',
  '',
  '## Preferences',
  '[unknown] - I prefer dark mode and concise answers.',
  '```',
  '',
  'This is the complete export.',
].join('\n')
const english = parseMemoryExport(englishSample)
assert.equal(english.entries.length, 7)
assert.deepEqual(plain(english.entries.map(entry => entry.category)), [
  'instruction', 'instruction', 'identity', 'career', 'projects', 'projects', 'preferences',
])
assert.deepEqual(plain(english.entries[0]), {
  content: 'Always answer in Chinese unless I ask for English.',
  category: 'instruction',
  date: '2024-03-01',
})
assert.equal(english.entries[1].date, 'unknown')
assert.equal(english.entries[4].content, 'I am building dsh-chat, a plugin for DeepSeek Harness.')
assert.ok(!english.entries.some(entry => /Long-Term Memory Export|complete export|Here is/.test(entry.content)))

const chineseSample = [
  '## 指令',
  '[unknown] - 回答时使用中文，并保持简洁。',
  '## 身份',
  '[2023-05-01] - 我叫小周，住在上海。',
  '## 职业',
  '- 我在一家游戏公司做后端开发。',
  '## 项目',
  '- 正在开发一个名为「星图」的插件。',
  '## 偏好',
  '- 我喜欢深色模式。',
].join('\n')
const chinese = parseMemoryExport(chineseSample)
assert.deepEqual(plain(chinese.entries.map(entry => entry.category)), ['instruction', 'identity', 'career', 'projects', 'preferences'])
assert.equal(chinese.entries[0].content, '回答时使用中文，并保持简洁。')
assert.equal(chinese.entries[1].date, '2023-05-01')

const fenced = parseMemoryExport(['```', '## Preferences', '- I like tea.', '- I like tea.', '```'].join('\n'))
assert.equal(fenced.entries.length, 1)
assert.equal(fenced.skipped, 1)
assert.equal(fenced.entries[0].category, 'preferences')

const unstructured = parseMemoryExport([
  'I prefer dark mode and concise answers.',
  'My name is Alex and I work as a backend engineer.',
  'My project dsh-chat is an early-stage Harness plugin.',
].join('\n'))
assert.equal(unstructured.entries.length, 3)
assert.deepEqual(plain(unstructured.entries.map(entry => entry.category)), ['preferences', 'identity', 'projects'])

const noMemory = parseMemoryExport("I don't have access to any long-term memory.")
assert.equal(noMemory.entries.length, 0)

const long = parseMemoryExport(`## Projects\n- ${'x'.repeat(900)}`).entries[0]
assert.ok(long.content.length <= 600)

for (const phrase of ['Instructions', 'Identity', 'Career', 'Projects', 'Preferences', '[YYYY-MM-DD]', '[unknown]', 'fenced code block']) {
  assert.ok(MEMORY_IMPORT_PROMPT.includes(phrase), `prompt is missing ${phrase}`)
}
assert.ok(!/claude|chatgpt|gemini/i.test(MEMORY_IMPORT_PROMPT), 'the prompt must be provider-agnostic')

const importNodes = render(hook.MemoryImportDialog)
const settingsNodes = render(hook.MemorySettingsPane)
const dialogs = importNodes.filter(node => node.type === 'dialog')
assert.equal(dialogs.length, 1, 'the import dialog must mount a native modal <dialog>')
assert.ok(String(dialogs[0].props.className).includes('dsc-memory-import'), 'the import dialog needs its own class for Escape handling')
assert.ok(settingsNodes.some(node => String(node.props?.className).includes('dsc-memory-state')), 'the memory pane must render before data arrives')

const snapshot = {
  settings: { enabled: true, autoExtract: false },
  memories: [
    {
      id: 'm1', content: 'I prefer dark mode.', category: 'preferences', createdAt: 1, updatedAt: Date.now() - 1000,
      source: { type: 'manual', platform: null, conversationId: null, label: null },
    },
    {
      id: 'm2', content: 'I work as an engineer.', category: 'career', createdAt: 1, updatedAt: Date.now() - 2000,
      source: { type: 'import', platform: 'chatgpt', conversationId: null, label: null },
    },
  ],
  categories: [
    { id: 'instruction', count: 0 }, { id: 'identity', count: 0 },
    { id: 'career', count: 1 }, { id: 'projects', count: 0 }, { id: 'preferences', count: 1 },
  ],
  summary: { text: '## Notes\n- Prefers dark mode.', locale: 'zh', updatedAt: Date.now() - 500, revision: 2 },
  stale: false,
  revision: 2,
  count: 2,
  limits: { maxMemories: 400, maxContent: 600 },
}

const pendingResult = {
  answer: '已更新 1 条记忆。',
  applied: [{ op: 'update', memoryId: 'm1', content: 'I prefer dark mode.' }],
  pending: { id: 'p1', kind: 'delete', memories: [{ id: 'm2', content: 'I work as an engineer.' }] },
}
const paneText = textOf(renderWith(hook.MemorySettingsPane, {}, {
  1: snapshot,
  2: 'ready',
  7: pendingResult,
}))
assert.ok(paneText.includes('记忆概述'), 'the pane must show the summary section')
assert.ok(paneText.includes('确认要删除这些记忆吗？'), 'the pane must show the ambiguous-delete confirmation')
assert.ok(paneText.includes('已更新 1 条'), 'the pane must describe applied operations')
assert.ok(paneText.includes('导入自 ChatGPT'), 'the pane must label imported source platforms')

const editText = textOf(renderWith(hook.MemorySettingsPane, {}, {
  1: snapshot,
  2: 'ready',
  9: 'm1',
  10: 'I prefer dark mode at night.',
}))
assert.ok(editText.includes('保存'), 'inline editing needs a save action')
assert.ok(!editText.includes('I prefer dark mode at night.'), 'the draft belongs in a textarea, not as rendered text')

const previewItems = [
  {
    key: 'a', content: 'I prefer dark mode.', category: 'preferences', date: '2024-01-01', sensitive: false,
    match: { kind: 'duplicate', id: 'm1', content: 'I prefer dark mode.', category: 'preferences', score: 1 },
    selected: false, mode: 'skip',
  },
  {
    key: 'b', content: 'I work at a bank.', category: 'career', date: null, sensitive: true,
    match: { kind: 'conflict', id: 'm2', content: 'I work as an engineer.', category: 'career', score: 0.7 },
    selected: true, mode: 'update',
  },
  {
    key: 'c', content: 'My project is dsh-chat.', category: 'projects', date: 'unknown', sensitive: false,
    match: null, selected: true, mode: 'auto',
  },
]
const previewText = textOf(renderWith(hook.MemoryImportDialog, {}, {
  1: 'preview',
  2: 'other',
  4: previewItems,
  5: { count: 3, skipped: 1 },
}))
assert.ok(previewText.includes('已存在'), 'a duplicate match must be badged as already existing')
assert.ok(previewText.includes('可能重复或冲突'), 'a conflict match must be badged as a possible duplicate or conflict')
assert.ok(previewText.includes('可能包含敏感信息'), 'sensitive entries must be badged')
assert.ok(previewText.includes('导入 2 条记忆'), 'the confirm label must count only selected entries')

const consentText = textOf(renderWith(hook.MemoryImportDialog, {}, {
  1: 'paste',
  3: 'pasted export text',
  5: { count: 2, skipped: 0 },
  8: { text: 'pasted export text' },
}))
assert.ok(consentText.includes('将把粘贴的内容发送到 DeepSeek API 处理，可能产生费用。确认吗？'), 'AI structuring must ask for explicit consent')

const generalTabText = textOf(renderWith(hook.SettingsDialog, {}, {}))
assert.ok(generalTabText.includes('通用') && generalTabText.includes('长期记忆'), 'settings must show both tabs')
assert.ok(!generalTabText.includes('正在加载长期记忆…'), 'General stays the default tab and must not mount the memory pane')
// useChat no longer consumes a useState slot (it is a real store subscription);
// the tab is therefore the fifth useState in this dialog's shim ordering.
const memoryTabText = textOf(renderWith(hook.SettingsDialog, {}, { 5: 'memory' }))
assert.ok(memoryTabText.includes('正在加载长期记忆…'), 'the Memory tab must mount the memory pane')

console.log('MEMORY_CLIENT_OK')
