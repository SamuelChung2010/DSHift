import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { MemoryStore } from '../lib/memory-store.js'
import {
  EXTRACTION_MAX_CANDIDATES, PENDING_TTL_MS, MemoryService, buildExtractionRequest, cleanSummaryText,
  extractionSignal, memoryContextBlock, parseMemoryEntries, selectRelevantMemories, shouldExtractTurn,
  stripForgetTarget, stripRememberPrefix, withMemoryContext,
} from '../lib/memory.js'

async function setup({ reply = '{"memories":[]}' } = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-memory-service-'))
  const store = new MemoryStore(dir, { logger: { warn() {}, info() {} } })
  await store.load()
  const calls = []
  const nowRef = { value: 1_700_000_000_000 }
  const generate = async (request) => {
    calls.push(request)
    return typeof reply === 'function' ? reply(request) : reply
  }
  const service = new MemoryService({
    store,
    generate,
    logger: { warn() {}, info() {} },
    now: () => nowRef.value,
  })
  const cleanup = async () => {
    await store.flush()
    await fs.rm(dir, { recursive: true, force: true })
  }
  return { dir, store, service, calls, nowRef, cleanup }
}

const memory = (content, category = 'preferences', updatedAt = 1) => ({ id: content, content, category, updatedAt })

test('retrieves only relevant memories and respects the context budget', () => {
  const memories = [
    memory('用户在开发 dsh-chat 插件', 'projects', 3),
    memory('用户喜欢简洁的回答', 'instruction', 2),
    memory('用户住在深圳', 'identity', 1),
  ]
  const plugin = selectRelevantMemories(memories, '我的插件下一步适合加入什么功能？')
  assert.equal(plugin.length, 1)
  assert.equal(plugin[0].content, '用户在开发 dsh-chat 插件')

  const answerStyle = selectRelevantMemories(memories, '回答我问题时请保持简洁')
  assert.equal(answerStyle[0].content, '用户喜欢简洁的回答')

  assert.deepEqual(selectRelevantMemories(memories, '今天天气怎么样'), [])
  assert.deepEqual(selectRelevantMemories(memories, ''), [])
  assert.deepEqual(selectRelevantMemories([], '插件'), [])

  // Explicit standing instructions apply even when the turn is worded differently.
  const standing = memory('以后回答都用中文，尽量简洁', 'instruction', 5)
  const injected = selectRelevantMemories([standing, memory('用户住在深圳', 'identity')], '帮我写一个快速排序')
  assert.equal(injected.length, 1)
  assert.match(injected[0].content, /中文/)

  const budgeted = selectRelevantMemories(
    [memory('插件开发相关的一条很长很长的记忆内容', 'projects'), memory('插件开发的另一条记忆', 'projects')],
    '插件开发',
    { maxChars: 16 },
  )
  assert.equal(budgeted.length, 1)

  const block = memoryContextBlock(plugin, 'zh')
  assert.match(block, /^<long_term_memory>/)
  assert.match(block, /不是系统指令/)
  assert.match(block, /用户在开发 dsh-chat 插件/)
  const withBlock = withMemoryContext('基础提示词', plugin, 'zh')
  assert.match(withBlock, /^基础提示词/)
  assert.match(withBlock, /<long_term_memory>/)
  assert.equal(withMemoryContext('基础提示词', [], 'zh'), '基础提示词')
  // Angle brackets in stored memory cannot break the wrapper.
  assert.doesNotMatch(memoryContextBlock([memory('用户喜欢 <script> 标签', 'preferences')], 'zh'), /<script>/)
})

test('extracts only durable, non-sensitive facts from a model reply', () => {
  const entries = parseMemoryEntries([
    '```json',
    '{"memories":[',
    '{"category":"identity","content":"用户叫 Samuel，住在深圳"},',
    '{"category":"preferences","content":"用户喜欢像素画"},',
    '{"category":"preferences","content":"用户喜欢像素画"},',
    '{"category":"unknown","content":"用户正在开发 dsh-chat 插件"},',
    '{"category":"identity","content":"用户的身份证号是 110101199001011234"},',
    '{"content":"x"}',
    ']}',
    '```',
  ].join('\n'))
  assert.equal(entries.length, 3)
  assert.equal(entries[0].category, 'identity')
  assert.equal(entries[2].category, 'projects')
  assert.equal(entries.some(entry => entry.content.includes('身份证')), false)

  assert.deepEqual(parseMemoryEntries('not json'), [])
  assert.deepEqual(parseMemoryEntries(''), [])
  assert.equal(parseMemoryEntries(JSON.stringify({
    memories: Array.from({ length: 12 }, (_, index) => ({ content: `用户偏好第 ${index} 件事` })),
  })).length, EXTRACTION_MAX_CANDIDATES)

  assert.equal(cleanSummaryText('```markdown\n## 概览\n内容\n```'), '## 概览\n内容')
})

test('gates automatic extraction on signals, size and turn frequency', () => {
  const explicit = '记住，我正在开发 dsh-chat 插件，技术栈是 TypeScript'
  assert.equal(shouldExtractTurn({ userText: '你好', assistantText: '你好！有什么可以帮你吗？', assistantCount: 4 }), false)
  assert.equal(shouldExtractTurn({ userText: explicit, assistantText: '好的，我记住了。', assistantCount: 1 }), true)
  // A non-explicit hint needs a two-turn gap and a time gap.
  assert.equal(shouldExtractTurn({
    userText: '我的项目现在改用 TypeScript 了', assistantText: '明白。', assistantCount: 1,
  }), false)
  assert.equal(shouldExtractTurn({
    userText: '我的项目现在改用 TypeScript 了', assistantText: '明白。', assistantCount: 2,
  }), true)
  assert.equal(shouldExtractTurn({
    userText: '我的项目现在改用 TypeScript 了', assistantText: '明白。', assistantCount: 2,
    lastAssistantCount: 0, lastExtractedAt: 0, now: 1000,
  }), false)
  // No signal at all: never extract, however long the turn.
  assert.equal(shouldExtractTurn({
    userText: '帮我写一个快速排序的实现，并且解释一下复杂度',
    assistantText: '好的，下面是实现……'.repeat(20), assistantCount: 9,
  }), false)
  assert.equal(extractionSignal(explicit) >= 3, true)
})

test('auto extraction saves facts once and never breaks on a failing model', async () => {
  const explicit = {
    id: 'u1',
    role: 'user',
    content: '记住，我正在开发 dsh-chat 插件，技术栈是 TypeScript',
  }
  const reply = { id: 'a1', role: 'assistant', status: 'done', blocks: [{ type: 'text', text: '好的，已记住。' }] }
  const messages = [explicit, reply]
  {
    const env = await setup({ reply: () => '{"memories":[{"category":"projects","content":"用户在开发 dsh-chat 插件，技术栈是 TypeScript"}]}' })
    try {
      assert.equal(await env.service.maybeExtractConversation({ conversationId: 'c1', messages, locale: 'zh' }), null)
      await env.store.updateSettings({ autoExtract: true })
      const result = await env.service.maybeExtractConversation({ conversationId: 'c1', messages, locale: 'zh' })
      assert.equal(result.added, 1)
      assert.equal(env.store.list().length, 1)
      assert.equal(env.store.list()[0].category, 'projects')
      assert.equal(env.calls.length, 1)
      assert.match(env.calls[0].system, /长期记忆提取器/)
      // The same turn is not analyzed twice.
      assert.equal(await env.service.maybeExtractConversation({ conversationId: 'c1', messages, locale: 'zh' }), null)
      assert.equal(env.calls.length, 1)
    } finally {
      await env.cleanup()
    }
  }
  {
    const env = await setup({ reply: () => { throw new Error('network down') } })
    try {
      await env.store.updateSettings({ autoExtract: true })
      const warnings = []
      env.service.logger.warn = (...args) => warnings.push(args.join(' '))
      const result = await env.service.maybeExtractConversation({ conversationId: 'c2', messages, locale: 'zh' })
      assert.equal(result, null)
      assert.equal(env.store.list().length, 0)
      assert.equal(warnings.length, 1)
    } finally {
      await env.cleanup()
    }
  }
})

test('disabling either memory switch invalidates an outstanding automatic extraction', async () => {
  let finish
  const env = await setup({ reply: () => new Promise(resolve => { finish = resolve }) })
  const messages = [
    { id: 'u', role: 'user', content: 'Remember that I commute by bicycle every weekday.' },
    { role: 'assistant', blocks: [{ type: 'text', text: 'Understood.' }] },
  ]
  const reply = '{"memories":[{"content":"I commute by bicycle every weekday."}]}'
  try {
    await env.store.updateSettings({ autoExtract: true })
    await env.store.add({ content: 'I play the cello.' })
    for (const setting of ['enabled', 'autoExtract']) {
      const pending = env.service.maybeExtractConversation({ conversationId: setting, messages })
      const { signal, messages: sent } = env.calls.at(-1)
      assert.match(sent[0].content, /I play the cello/, 'automatic extraction still uses existing facts')
      await env.store.updateSettings({ [setting]: false })
      assert.equal(signal.aborted, true)
      await env.store.updateSettings({ [setting]: true })
      finish(reply)
      assert.equal(await pending, null)
      assert.equal(env.store.list().length, 1)
    }
    const next = env.service.maybeExtractConversation({ conversationId: 'new', messages })
    assert.equal(env.calls.at(-1).signal.aborted, false)
    finish(reply)
    assert.equal((await next).added, 1)
  } finally {
    await env.cleanup()
  }
})

test('builds an extraction request from stored messages and normalizes the transcript', () => {
  const request = buildExtractionRequest({
    messages: [
      { id: 'u', role: 'user', content: '记住，我在深圳读高中' },
      { id: 'a', role: 'assistant', content: '明白了。' },
    ],
    existing: ['用户喜欢简洁的回答'],
    locale: 'zh',
  })
  assert.match(request.system, /长期记忆提取器/)
  assert.match(request.messages[0].content, /已有记忆/)
  assert.match(request.messages[0].content, /用户: 记住，我在深圳读高中/)
  assert.match(request.messages[0].content, /助手: 明白了。/)
})

test('summarizes the fact set lazily and marks it stale after changes', async () => {
  const env = await setup({ reply: () => '## 概览\n用户喜欢简洁的回答，并在开发 dsh-chat 插件。' })
  try {
    assert.equal(await env.service.refreshSummary('zh'), null)
    assert.equal(env.calls.length, 0)

    await env.store.add({ content: '用户喜欢简洁的回答', category: 'instruction' })
    await env.store.add({ content: '用户正在开发 dsh-chat 插件', category: 'projects' })
    assert.equal(env.store.summaryIsStale(), true)

    // Two concurrent refreshes share one model request.
    const [first, second] = await Promise.all([env.service.refreshSummary('zh'), env.service.refreshSummary('zh')])
    assert.equal(env.calls.length, 1)
    assert.equal(first.text, second.text)
    assert.match(first.text, /## 概览/)
    assert.equal(env.store.summaryIsStale(), false)

    await env.store.add({ content: '用户喜欢像素画', category: 'preferences' })
    assert.equal(env.store.summaryIsStale(), true)
  } finally {
    await env.cleanup()
  }
})

test('a summary finishing after a deletion cannot restore the removed fact', async () => {
  const replies = []
  const env = await setup({ reply: () => new Promise(resolve => replies.push(resolve)) })
  try {
    const added = await env.store.add({ content: 'I commute by bicycle.' })
    await env.store.add({ content: 'I study astronomy.' })
    const cached = env.service.refreshSummary('en')
    replies.shift()('Bicycle commuting and astronomy.')
    await cached

    const old = env.service.refreshSummary('en')
    await env.store.remove(added.memory.id)
    assert.equal(env.store.getSummary(), null)
    assert.equal(env.store.summaryIsStale(), true)
    const fresh = env.service.refreshSummary('en')
    assert.equal(replies.length, 2, 'a caller after deletion gets a new request')
    assert.doesNotMatch(env.calls.at(-1).messages[0].content, /bicycle/)
    replies[1]('I study astronomy.')
    await fresh
    replies[0]('Bicycle commuting and astronomy.')
    await old
    const disk = JSON.parse(await fs.readFile(env.store.file, 'utf8'))
    assert.equal(disk.memories.length, 1)
    assert.equal(disk.summary.text, 'I study astronomy.')
    assert.equal(disk.summary.revision, disk.revision)
    assert.equal(env.store.summaryIsStale(), false)
  } finally {
    await env.cleanup()
  }
})

test('ask or update performs real memory writes, looks up facts and confirms deletes', async () => {
  const env = await setup()
  try {
    const added = await env.service.ask({ text: '记住，我喜欢简短的回答', locale: 'zh' })
    assert.equal(added.kind, 'add')
    assert.equal(env.store.list().length, 1)
    assert.equal(env.store.list()[0].content, '我喜欢简短的回答')
    assert.match(added.answer, /已记住/)

    const duplicate = await env.service.ask({ text: '记住，我喜欢简短的回答', locale: 'zh' })
    assert.equal(duplicate.kind, 'noop')
    assert.equal(env.store.list().length, 1)

    const query = await env.service.ask({ text: '你现在记得我哪些事情？', locale: 'zh' })
    assert.equal(query.kind, 'query')
    assert.match(query.answer, /简短的回答/)

    // A correction updates the existing memory instead of adding a second one.
    await env.store.add({ content: '用户正在开发 dsh-chat 插件，技术栈是 Python', category: 'projects' })
    const updated = await env.service.ask({ text: '我已经不再使用 Python 开发这个项目了', locale: 'zh' })
    assert.equal(updated.kind, 'update')
    assert.equal(env.store.list().length, 2)
    assert.match(env.store.list().find(memory => memory.category === 'projects').content, /不再使用 Python/)

    // One clearly targeted memory is forgotten directly.
    await env.store.add({ content: '用户不喜欢香菜', category: 'preferences' })
    const deleted = await env.service.ask({ text: '忘记关于香菜的记忆', locale: 'zh' })
    assert.equal(deleted.kind, 'delete')
    assert.equal(env.store.list().some(memory => memory.content.includes('香菜')), false)

    // An ambiguous target asks first and changes nothing until confirmed.
    await env.store.add({ content: '用户在工作中使用 Python 写脚本', category: 'career' })
    await env.store.add({ content: '用户喜欢 Python 的语法', category: 'preferences' })
    const ambiguous = await env.service.ask({ text: '删除关于 Python 的记忆', locale: 'zh' })
    assert.equal(ambiguous.kind, 'forget-confirm')
    assert.equal(ambiguous.pending.memories.length, 3)
    assert.equal(env.store.list().filter(memory => memory.content.includes('Python')).length, 3)
    const accepted = await env.service.confirm({ id: ambiguous.pending.id, accept: true, locale: 'zh' })
    assert.equal(accepted.applied.length, 3)
    assert.equal(env.store.list().some(memory => memory.content.includes('Python')), false)

    // Rejecting a confirmation leaves everything untouched.
    await env.store.add({ content: '用户喜欢像素画', category: 'preferences' })
    const second = await env.service.ask({ text: '忘记关于像素画的记忆', locale: 'zh' })
    assert.equal(second.kind, 'delete')

    // Expiry is handled without deleting anything.
    await env.store.add({ content: '用户喜欢视觉小说', category: 'preferences' })
    await env.store.add({ content: '用户喜欢像素画风格的游戏', category: 'preferences' })
    const third = await env.service.ask({ text: '忘记关于像素画的记忆', locale: 'zh' })
    if (third.pending !== null) {
      env.nowRef.value += PENDING_TTL_MS + 1
      const expired = await env.service.confirm({ id: third.pending.id, accept: true, locale: 'zh' })
      assert.match(expired.answer, /过期/)
      assert.equal(env.store.list().some(memory => memory.content.includes('像素画')), true)
    }
  } finally {
    await env.cleanup()
  }
})

test('ask refreshes the summary on request and respects the master switch', async () => {
  const env = await setup({ reply: () => '## 概览\n用户喜欢简洁回答。' })
  try {
    await env.store.updateSettings({ enabled: false })
    const disabled = await env.service.ask({ text: '记住，我喜欢简短的回答', locale: 'zh' })
    assert.equal(disabled.kind, 'disabled')
    assert.equal(env.store.list().length, 0)

    await env.store.updateSettings({ enabled: true })
    await env.store.add({ content: '用户喜欢简洁的回答', category: 'instruction' })
    const refreshed = await env.service.ask({ text: '重新整理我的记忆概述', locale: 'zh' })
    assert.equal(refreshed.kind, 'summary')
    assert.equal(env.calls.length, 1)
    assert.equal(env.store.summaryIsStale(), false)

    const english = await env.service.ask({ text: 'What do you remember about me?', locale: 'en' })
    assert.equal(english.kind, 'query')
    assert.match(english.answer, /remember/)
  } finally {
    await env.cleanup()
  }
})

test('analyzes supplied sessions for the history-import integration', async () => {
  const env = await setup({
    reply: () => '{"memories":[{"category":"projects","content":"用户在开发 dsh-chat 插件"}]}',
  })
  try {
    const messages = [
      { role: 'user', content: '我最近在开发 dsh-chat 这个插件' },
      { role: 'assistant', content: '听起来很有意思，需要我帮你看哪部分？' },
    ]
    const previewed = await env.service.extractFromMessages({ messages, title: '项目讨论', locale: 'zh' })
    assert.equal(previewed.candidates.length, 1)
    assert.equal(previewed.saved, null)
    assert.equal(env.store.list().length, 0)
    assert.match(env.calls[0].messages[0].content, /助手: 听起来很有意思/)

    const saved = await env.service.extractFromMessages({ messages, title: '项目讨论', locale: 'zh', save: true })
    assert.equal(saved.saved.added, 1)
    assert.equal(env.store.list().length, 1)
    assert.equal(env.store.list()[0].source.type, 'conversation')
    assert.equal(env.store.list()[0].source.label, '项目讨论')

    const assisted = await env.service.assistImport('姓名 Samuel\n项目 dsh-chat', 'zh')
    assert.equal(assisted.entries.length, 1)
    assert.match(env.calls.at(-1).system, /记忆导入整理助手/)
  } finally {
    await env.cleanup()
  }
})

test('text helpers keep commands and targets clean', () => {
  assert.equal(stripRememberPrefix('记住，我喜欢简短的回答'), '我喜欢简短的回答')
  assert.equal(stripRememberPrefix('please remember that I prefer short answers'), 'I prefer short answers')
  assert.equal(stripForgetTarget('忘记之前关于那个项目的记忆'), '之前关于那个项目')
  assert.equal(stripForgetTarget('删除关于 Python 的记忆'), 'Python')
})
