/**
 * State-layer regression tests for the long-chat input fix.
 *
 * They load the built client bundle through its test hook with a minimal React
 * shim, so they exercise the exact subscription/caching code that ships. Run
 * `node tools/build-client.js` before `node --test`.
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
  useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot() },
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
    documentElement: { dataset: {} },
    createElement() {
      return { setAttribute() {}, appendChild() {}, remove() {}, addEventListener() {}, removeEventListener() {}, style: {} }
    },
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return null },
    querySelectorAll() { return [] },
  },
  location: { protocol: 'http:', origin: 'http://127.0.0.1:52345' },
  navigator: { language: 'en-US', languages: ['en-US'], platform: 'Win32' },
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

const { chatStore, useChat, shallowEqual, createChatSelectorCache, composerKeySends } = captured
const initialState = chatStore.state

function resetStore() {
  chatStore.state = { ...initialState }
}

test('a patch that changes nothing neither emits nor replaces the state object', () => {
  resetStore()
  const before = chatStore.state
  let notifications = 0
  const off = chatStore.subscribe(() => { notifications += 1 })
  try {
    assert.equal(chatStore.set({ draft: before.draft }), false)
    assert.equal(notifications, 0)
    assert.equal(chatStore.state, before, 'a no-op patch must keep every selector snapshot identical')

    assert.equal(chatStore.set({ messages: before.messages, streaming: before.streaming }), false)
    assert.equal(notifications, 0)
    assert.equal(chatStore.state, before)
  } finally {
    off()
  }
})

test('a real patch emits exactly once and only changed fields move', () => {
  resetStore()
  const before = chatStore.state
  let notifications = 0
  const seen = []
  const off = chatStore.subscribe(() => {
    notifications += 1
    seen.push(chatStore.state.draft)
  })
  try {
    assert.equal(chatStore.set({ draft: 'hello' }), true)
    assert.equal(chatStore.state.draft, 'hello')
    assert.equal(chatStore.state.messages, before.messages)
    assert.equal(notifications, 1)
    assert.deepEqual(seen, ['hello'])

    // The same value again is a no-op even when batched with an unchanged key.
    assert.equal(chatStore.set({ draft: 'hello', sidebarWidth: before.sidebarWidth }), false)
    assert.equal(notifications, 1)
  } finally {
    off()
  }
})

test('store listeners are isolated from each other and can unsubscribe', () => {
  resetStore()
  const calls = []
  const offA = chatStore.subscribe(() => { calls.push('a') })
  const offB = chatStore.subscribe(() => { calls.push('b') })
  try {
    chatStore.set({ draft: 'one' })
    offA()
    chatStore.set({ draft: 'two' })
    assert.deepEqual(calls, ['a', 'b', 'b'])
  } finally {
    offA()
    offB()
  }
})

test('a selector cache keeps an unaffected slice stable across draft updates', () => {
  resetStore()
  const messages = [{ id: 'm1' }, { id: 'm2' }]
  chatStore.state = { ...chatStore.state, messages, streaming: null }
  const cache = createChatSelectorCache()
  const selectMessages = state => state.messages
  const selectStreaming = state => state.streaming
  const initial = cache(chatStore.state, selectMessages, Object.is)
  const initialStreaming = cache(chatStore.state, selectStreaming, Object.is)

  for (const draft of ['a', 'ab', 'abc']) {
    chatStore.set({ draft })
    assert.equal(cache(chatStore.state, selectMessages, Object.is), initial, `draft ${draft} must not move the history snapshot`)
    assert.equal(cache(chatStore.state, selectStreaming, Object.is), initialStreaming)
  }

  const nextMessages = [...messages, { id: 'm3' }]
  chatStore.set({ messages: nextMessages })
  assert.equal(cache(chatStore.state, selectMessages, Object.is), nextMessages)
  assert.notEqual(cache(chatStore.state, selectMessages, Object.is), initial)
})

test('derived object selectors only re-slice when the equality says so', () => {
  resetStore()
  chatStore.state = { ...chatStore.state, messages: [{ id: 'm1' }], streaming: null }
  const selectSlice = state => ({ messages: state.messages, streaming: state.streaming })
  const cache = createChatSelectorCache()
  const first = cache(chatStore.state, selectSlice, shallowEqual)
  chatStore.set({ draft: 'x' })
  const second = cache(chatStore.state, selectSlice, shallowEqual)
  assert.equal(second, first, 'a shallow-equal derived object must keep its identity')
  assert.deepEqual(second, first)

  const strictCache = createChatSelectorCache()
  const strictFirst = strictCache(chatStore.state, selectSlice, Object.is)
  chatStore.set({ draft: 'xy' })
  const strictSecond = strictCache(chatStore.state, selectSlice, Object.is)
  assert.notEqual(strictSecond, strictFirst, 'reference equality on a fresh object cannot be stable')

  chatStore.set({ streaming: { assistantId: 'a1' } })
  assert.notEqual(cache(chatStore.state, selectSlice, shallowEqual), first)
})

test('shallowEqual compares one level with reference semantics below it', () => {
  const nested = { value: 1 }
  assert.equal(shallowEqual({ nested }, { nested }), true)
  assert.equal(shallowEqual({ nested }, { nested: { value: 1 } }), false)
  assert.equal(shallowEqual([1, 2], [1, 2]), true)
  assert.equal(shallowEqual([1, 2], [1, 2, 3]), false)
  assert.equal(shallowEqual({ a: 1 }, { b: 1 }), false)
  assert.equal(shallowEqual(null, null), true)
  assert.equal(shallowEqual(null, {}), false)
})

test('IME composition never sends a message', () => {
  const composing = { key: 'Enter', nativeEvent: { isComposing: true } }
  assert.equal(composerKeySends(composing, 'enter'), false)
  assert.equal(composerKeySends({ key: 'Enter', isComposing: true }, 'enter'), false)
  assert.equal(composerKeySends({ key: 'Enter', keyCode: 229 }, 'enter'), false)
  assert.equal(composerKeySends({ key: 'Enter', nativeEvent: { isComposing: true } }, 'ctrl-enter'), false)
  // A committed candidate in Chinese or Japanese text is not an Enter press.
  assert.equal(composerKeySends({ key: 'Process' }, 'enter'), false)
})

test('send-key preferences keep their established behavior', () => {
  assert.equal(composerKeySends({ key: 'Enter' }, 'enter'), true)
  assert.equal(composerKeySends({ key: 'Enter', shiftKey: true }, 'enter'), false)
  assert.equal(composerKeySends({ key: 'Enter', ctrlKey: true }, 'enter'), false)
  assert.equal(composerKeySends({ key: 'Enter', metaKey: true }, 'enter'), false)
  assert.equal(composerKeySends({ key: 'Enter' }, 'ctrl-enter'), false)
  assert.equal(composerKeySends({ key: 'Enter', ctrlKey: true }, 'ctrl-enter'), true)
  assert.equal(composerKeySends({ key: 'Enter', metaKey: true }, 'ctrl-enter'), true)
  assert.equal(composerKeySends({ key: 'Enter', ctrlKey: true, shiftKey: true }, 'ctrl-enter'), false)
})

test('useChat is the shipped hook and exposes the cache contract', () => {
  assert.equal(typeof useChat, 'function')
  assert.equal(typeof createChatSelectorCache, 'function')
  assert.equal(useChat.length, 0, 'both arguments must be optional')
})
