/**
 * Parser and prompt tests for the client half of long-term memory. The symbols
 * come from the built client.js through the bundle's test hook, with a minimal
 * React shim; run `node tools/build-client.js` before `node --test`.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const React = {
  createElement(type, props) { return { type, props: { ...(props ?? {}) } } },
  Fragment: Symbol('Fragment'),
  useState(initial) { return [typeof initial === 'function' ? initial() : initial, () => {}] },
  useEffect() {},
  useLayoutEffect() {},
  useMemo(factory) { return factory() },
  useCallback(fn) { return fn },
  useRef(initial) { return { current: initial } },
  memo(component) { return component },
}

let captured = null
let definition = null
const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  document: {
    baseURI: 'http://127.0.0.1:52345/',
    head: { appendChild() {} },
    body: { appendChild() {} },
    createElement() {
      return { setAttribute() {}, appendChild() {}, remove() {}, addEventListener() {}, removeEventListener() {}, style: {} }
    },
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return null },
    querySelectorAll() { return [] },
  },
  location: { protocol: 'http:', origin: 'http://127.0.0.1:52345' },
  navigator: { language: 'en-US', languages: ['en-US'] },
  localStorage: { getItem() { return null }, setItem() {} },
  fetch: async () => new Response('{}', { status: 200 }),
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
if (definition === null) throw new Error('client bundle did not register; run node tools/build-client.js')
const plugin = definition.factory(name => {
  if (name === 'react') return React
  throw new Error(`unexpected require ${name}`)
})
plugin.apply({
  effect(callback) { callback(); return () => {} },
  get() { return undefined },
  locale: {
    register() { return () => {} },
    bind() { return key => key },
    subscribe() { return () => {} },
    getSnapshot() { return { active: 'en' } },
  },
  slots: { inject(_name, callback) { callback() }, register(_options, component) { return component } },
})
if (captured === null) throw new Error('the client bundle did not call the test hook')

const { parseMemoryExport, MEMORY_IMPORT_PROMPT, memoryCategoryIds, memoryCategoryLabel, parseMemoryDate } = captured
const plain = value => JSON.parse(JSON.stringify(value))
const ids = list => plain(list.map(entry => entry.category))

test('parses a Claude-style export with the five English headings and dates', () => {
  const sample = [
    'Here is everything I remember:',
    '',
    '```markdown',
    '## Instructions',
    '[2024-03-01] - Always answer in Chinese unless I ask for English.',
    '[unknown] - Keep code examples short and runnable.',
    '### Identity',
    '[2024-01-15] - My name is Alex and I live in Singapore.',
    '## Career',
    '1. [2020-09-01] - I work as a backend engineer at a fintech company.',
    '## Projects',
    '* [2024-06-20] - I maintain **dsh-chat**, a plugin for DeepSeek Harness.',
    '## Preferences',
    '• I prefer dark mode and concise answers.',
    '```',
    '',
    'This is the complete export.',
  ].join('\n')
  const result = parseMemoryExport(sample)
  assert.equal(result.entries.length, 6)
  assert.deepEqual(ids(result.entries), ['instruction', 'instruction', 'identity', 'career', 'projects', 'preferences'])
  assert.deepEqual(plain(result.entries[0]), {
    content: 'Always answer in Chinese unless I ask for English.',
    category: 'instruction',
    date: '2024-03-01',
  })
  assert.equal(result.entries[1].date, 'unknown')
  assert.equal(result.entries[3].date, '2020-09-01')
  assert.equal(result.entries[4].content, 'I maintain dsh-chat, a plugin for DeepSeek Harness.')
  assert.equal(result.entries[5].content, 'I prefer dark mode and concise answers.')
  assert.equal(result.entries[5].date, null)
  assert.ok(!result.entries.some(entry => /Here is|complete export|Long-Term/i.test(entry.content)))
})

test('parses Chinese headings and bold Markdown headings', () => {
  const sample = [
    '## 指令',
    '[unknown] - 回答时使用中文，并保持简洁。',
    '**身份**',
    '[2021-01-02] - 我叫小周，住在上海。',
    '## 职业',
    '- 我在一家游戏公司做后端开发。',
    '## 项目',
    '- 正在开发一个名为「星图」的插件。',
    '## 偏好',
    '- 我喜欢深色模式。',
  ].join('\n')
  const result = parseMemoryExport(sample)
  assert.deepEqual(ids(result.entries), ['instruction', 'identity', 'career', 'projects', 'preferences'])
  assert.equal(result.entries[0].content, '回答时使用中文，并保持简洁。')
  assert.equal(result.entries[1].date, '2021-01-02')
  assert.equal(result.entries[4].category, 'preferences')
})

test('handles fenced input, duplicate lines and trailing prose', () => {
  const sample = ['Before:', '```', '## Preferences', '- I like tea.', '- I like tea.', '- I like tea.', '```', 'This is the complete set.'].join('\n')
  const result = parseMemoryExport(sample)
  assert.equal(result.entries.length, 1)
  assert.equal(result.entries[0].content, 'I like tea.')
  assert.equal(result.entries[0].category, 'preferences')
  assert.equal(result.skipped, 3)
})

test('infers categories for unstructured input without headings', () => {
  const sample = [
    'Always answer in Chinese unless I ask otherwise.',
    'My name is Alex and I live in Singapore.',
    'I work as a backend engineer at a fintech company.',
    'My project dsh-chat is an early-stage Harness plugin.',
    'I prefer dark mode and concise answers.',
    'Today I met a friend.',
  ].join('\n')
  const result = parseMemoryExport(sample)
  assert.equal(result.entries.length, 6)
  assert.deepEqual(ids(result.entries), [
    'instruction', 'identity', 'career', 'projects', 'preferences', 'preferences',
  ])
})

test('drops prose and empty records and truncates long content', () => {
  assert.equal(parseMemoryExport("I don't have access to any long-term memory.").entries.length, 0)
  assert.equal(parseMemoryExport('This is the complete export.').entries.length, 0)
  assert.equal(parseMemoryExport('').entries.length, 0)
  const result = parseMemoryExport(['```', '## Projects', '- [unknown]', '- ' + 'x'.repeat(900), '```'].join('\n'))
  assert.equal(result.entries.length, 1)
  assert.ok(result.entries[0].content.length <= 600)
  assert.ok(result.entries[0].content.startsWith('xxx'))
})

test('dedupes identical records and accepts inline Markdown', () => {
  const result = parseMemoryExport([
    '## Preferences',
    '- I like `tea` and [dark mode](https://example.com).',
    '- I like `tea` and [dark mode](https://example.com).',
  ].join('\n'))
  assert.equal(result.entries.length, 1)
  assert.equal(result.entries[0].content, 'I like tea and dark mode.')
  assert.equal(result.skipped, 1)
})

test('exposes the fixed category contract and date helper', () => {
  assert.deepEqual(plain(memoryCategoryIds), ['instruction', 'identity', 'career', 'projects', 'preferences'])
  const labels = { memoryCatIdentity: 'Identity' }
  assert.equal(memoryCategoryLabel('identity', key => labels[key] ?? key), 'Identity')
  assert.equal(memoryCategoryLabel('preferences', key => labels[key] ?? key), 'memoryCatPreferences')
  assert.deepEqual(plain(parseMemoryDate('[2024-02-03] - hello')), { date: '2024-02-03', content: 'hello' })
  assert.deepEqual(plain(parseMemoryDate('[unknown] - hello')), { date: 'unknown', content: 'hello' })
  assert.deepEqual(plain(parseMemoryDate('plain line')), { date: null, content: 'plain line' })
})

test('caps a large export at the Host import limit', () => {
  const lines = ['## Preferences']
  for (let index = 0; index < 250; index += 1) lines.push(`- Preference number ${index}.`)
  const result = parseMemoryExport(lines.join('\n'))
  assert.equal(result.entries.length, 200)
  assert.equal(result.skipped, 50)
})

test('the export prompt asks for the five categories, dates and one code block', () => {
  for (const category of ['Instructions', 'Identity', 'Career', 'Projects', 'Preferences']) {
    assert.ok(MEMORY_IMPORT_PROMPT.includes(category), `prompt must mention ${category}`)
  }
  assert.ok(MEMORY_IMPORT_PROMPT.includes('[YYYY-MM-DD]'))
  assert.ok(MEMORY_IMPORT_PROMPT.includes('[unknown]'))
  assert.match(MEMORY_IMPORT_PROMPT, /single fenced code block/i)
  assert.match(MEMORY_IMPORT_PROMPT, /do not reveal/i)
  assert.match(MEMORY_IMPORT_PROMPT, /never invent/i)
  assert.ok(!/claude|chatgpt|gemini/i.test(MEMORY_IMPORT_PROMPT), 'the prompt must be provider-agnostic')
})
