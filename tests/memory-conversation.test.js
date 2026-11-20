/**
 * Host integration tests for long-term memory: context injection into real
 * streamed requests, background extraction, and the memory HTTP route. The
 * DeepSeek transport is stubbed, so no network is involved.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ChatService } from '../lib/service.js'

function textEvents(text, { stopReason = 'end_turn' } = {}) {
  return [
    { type: 'message_start', message: { id: 'msg', model: 'deepseek-flash', usage: { input_tokens: 5, output_tokens: 1 } } },
    { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } },
    { type: 'content_block_stop', index: 0 },
    { type: 'message_delta', delta: { stop_reason: stopReason }, usage: { input_tokens: 5, output_tokens: 1 } },
    { type: 'message_stop' },
  ]
}

function sseResponse(events) {
  const body = events.map(event => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join('')
  return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } })
}

function textResponse(text) {
  return sseResponse(textEvents(text))
}

async function withService(run) {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-memory-service-'))
  const previousHome = process.env.DSH_HOME
  process.env.DSH_HOME = home
  const routes = new Map()
  const ctx = {
    logger: { warn() {}, info() {} },
    get(name) {
      if (name === 'credentials') {
        return {
          resolve: async () => ({ value: 'sk-test-key' }),
          describe: async () => ({ configured: true }),
          set: async () => {},
          unset: async () => {},
        }
      }
      return undefined
    },
    connection: {
      fetch: {
        register(route) {
          routes.set(route.path, route)
          return async () => {}
        },
      },
    },
  }
  const service = new ChatService(ctx, { memoryTimeoutMs: 5000 })
  await service.ready()
  service.registerRoutes()
  const originalFetch = globalThis.fetch
  try {
    await run({ service, routes })
  } finally {
    globalThis.fetch = originalFetch
    await service.dispose()
    if (previousHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousHome
    await fs.rm(home, { recursive: true, force: true })
  }
}

async function call(env, routePath, body) {
  const route = env.routes.get(routePath)
  assert.ok(route, `route ${routePath} is registered`)
  const response = await route.fetch(new Request(`http://127.0.0.1${routePath}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }))
  const value = await response.json()
  return { status: response.status, value }
}

async function conversation(env, body) {
  const result = await call(env, '/api/deepseek-chat/conversation', body)
  assert.equal(result.status, 200, JSON.stringify(result.value))
  return result.value
}

async function readStream(env, body) {
  const route = env.routes.get('/api/deepseek-chat/stream')
  const response = await route.fetch(new Request('http://127.0.0.1/api/deepseek-chat/stream', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }))
  assert.equal(response.status, 200, await response.clone().text())
  const items = (await response.text()).split('\n').map(line => line.trim()).filter(Boolean).map(line => JSON.parse(line))
  // The service clears its per-conversation guard just after the socket closes.
  await new Promise(resolve => setTimeout(resolve, 15))
  return items
}

async function waitFor(check, timeout = 3000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (await check()) return true
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  return false
}

test('injects relevant memories into the request and stops when disabled or deleted', async () => {
  await withService(async ({ service, routes }) => {
    const memory = await service.memoryStore.add({
      content: '用户正在开发 dsh-chat 插件，首个 beta 已经发布',
      category: 'projects',
    })
    assert.equal(memory.status, 'added')

    const requests = []
    globalThis.fetch = async (_url, init) => {
      requests.push(JSON.parse(init.body))
      return textResponse('这个项目可以继续做记忆功能。')
    }
    const env = { service, routes }
    const created = await conversation(env, { action: 'create' })
    const id = created.conversation.id

    const first = await readStream(env, {
      conversationId: id,
      text: '我的插件下一步适合加入什么功能？',
      locale: 'zh',
    })
    assert.equal(first.find(item => item.type === 'done') !== undefined, true)
    assert.equal(requests.length, 1)
    assert.match(requests[0].system, /long_term_memory/)
    assert.match(requests[0].system, /dsh-chat 插件/)
    // Memory is reference context in the system prompt, never a fake message.
    assert.equal(requests[0].messages.some(message => String(message.content).includes('beta')), false)

    // Turning the master switch off stops retrieval immediately.
    const disabled = await call(env, '/api/deepseek-chat/memory', { action: 'settings', enabled: false })
    assert.equal(disabled.status, 200)
    assert.equal(disabled.value.settings.enabled, false)
    const second = await conversation(env, { action: 'create' })
    await readStream(env, {
      conversationId: second.conversation.id,
      text: '我的插件下一步适合加入什么功能？',
      locale: 'zh',
    })
    assert.doesNotMatch(requests.at(-1).system, /long_term_memory/)

    // Re-enabling works, and deleting the memory removes it from the next request.
    await call(env, '/api/deepseek-chat/memory', { action: 'settings', enabled: true })
    await call(env, '/api/deepseek-chat/memory', { action: 'delete', id: memory.memory.id })
    const third = await conversation(env, { action: 'create' })
    await readStream(env, {
      conversationId: third.conversation.id,
      text: '我的插件下一步适合加入什么功能？',
      locale: 'zh',
    })
    assert.doesNotMatch(requests.at(-1).system, /long_term_memory/)

    // The stored chat is untouched by the memory system.
    const detail = await conversation(env, { action: 'get', id })
    assert.equal(detail.conversation.messages.length, 2)
  })
})

test('extracts durable facts in the background without delaying the reply', async () => {
  await withService(async ({ service, routes }) => {
    await service.memoryStore.updateSettings({ autoExtract: true })
    const env = { service, routes }
    let extractionCalls = 0
    globalThis.fetch = async (_url, init) => {
      const payload = JSON.parse(init.body)
      if (typeof payload.system === 'string' && payload.system.includes('长期记忆提取器')) {
        extractionCalls += 1
        return textResponse('{"memories":[{"category":"projects","content":"用户在开发 dsh-chat 插件，技术栈是 TypeScript"}]}')
      }
      return textResponse('好的，我记住了。')
    }
    const created = await conversation(env, { action: 'create' })
    const id = created.conversation.id
    const items = await readStream(env, {
      conversationId: id,
      text: '记住，我正在开发 dsh-chat 插件，技术栈是 TypeScript',
      locale: 'zh',
    })
    const done = items.find(item => item.type === 'done')
    assert.equal(done.message.status, 'done')
    assert.equal(done.conversation.messageCount, 2)

    assert.equal(await waitFor(() => service.memoryStore.list().length === 1), true)
    const saved = service.memoryStore.list()[0]
    assert.match(saved.content, /TypeScript/)
    assert.equal(saved.category, 'projects')
    assert.equal(saved.source.type, 'conversation')
    assert.equal(saved.source.conversationId, id)
    // A new fact leaves the derived summary stale without generating it.
    assert.equal(service.memoryStore.summaryIsStale(), true)
    assert.equal(extractionCalls, 1)

    // An ordinary turn carries no durable signal, so no model call is spent.
    const second = await conversation(env, { action: 'create' })
    await readStream(env, { conversationId: second.conversation.id, text: '今天先聊到这里吧，晚安', locale: 'zh' })
    await new Promise(resolve => setTimeout(resolve, 80))
    assert.equal(extractionCalls, 1)
  })
})

test('a failed extraction never fails the chat', async () => {
  await withService(async ({ service, routes }) => {
    await service.memoryStore.updateSettings({ autoExtract: true })
    const env = { service, routes }
    let extractionAttempted = false
    globalThis.fetch = async (_url, init) => {
      const payload = JSON.parse(init.body)
      if (typeof payload.system === 'string' && payload.system.includes('长期记忆提取器')) {
        extractionAttempted = true
        return new Response(JSON.stringify({ error: { message: 'upstream down' } }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      }
      return textResponse('收到。')
    }
    const created = await conversation(env, { action: 'create' })
    const items = await readStream(env, {
      conversationId: created.conversation.id,
      text: '记住，我喜欢简洁的回答，以后都用中文解释代码',
      locale: 'zh',
    })
    assert.equal(items.find(item => item.type === 'done').message.status, 'done')
    assert.equal(await waitFor(() => extractionAttempted), true)
    await new Promise(resolve => setTimeout(resolve, 50))
    assert.equal(service.memoryStore.list().length, 0)
    const detail = await conversation(env, { action: 'get', id: created.conversation.id })
    assert.equal(detail.conversation.messages[1].status, 'done')
  })
})

test('memory routes manage the store, import only merges, and never duplicate imports', async () => {
  await withService(async ({ service, routes }) => {
    const env = { service, routes }
    const snapshot = await call(env, '/api/deepseek-chat/memory', { action: 'get' })
    assert.equal(snapshot.status, 200)
    assert.deepEqual(snapshot.value.settings, { enabled: true, autoExtract: false })
    assert.equal(snapshot.value.count, 0)
    assert.equal(snapshot.value.stale, false)

    const added = await call(env, '/api/deepseek-chat/memory', {
      action: 'add',
      content: '用户喜欢简洁的回答',
      category: 'instruction',
    })
    assert.equal(added.status, 200)
    assert.equal(added.value.result.status, 'added')
    assert.equal(added.value.count, 1)
    assert.equal(added.value.stale, true)
    const memoryId = added.value.result.memory.id

    const duplicate = await call(env, '/api/deepseek-chat/memory', { action: 'add', content: ' 用户喜欢简洁的回答。 ' })
    assert.equal(duplicate.value.result.status, 'duplicate')
    assert.equal(duplicate.value.count, 1)

    const preview = await call(env, '/api/deepseek-chat/memory', {
      action: 'preview',
      entries: [
        { content: '用户喜欢简洁的回答', category: 'instruction' },
        { content: '用户喜欢简洁、直接的回答' },
        { content: '我的手机号是 13800138000' },
      ],
    })
    assert.equal(preview.value.entries.length, 3)
    assert.equal(preview.value.entries[0].match.kind, 'duplicate')
    assert.equal(preview.value.entries[1].match.kind, 'conflict')
    assert.equal(preview.value.entries[2].sensitive, true)

    const imported = await call(env, '/api/deepseek-chat/memory', {
      action: 'import',
      platform: 'claude',
      entries: [
        { content: '[2023-05-01] - 用户叫 Samuel，住在深圳', category: 'identity' },
        { content: '用户喜欢简短的回答', category: 'instruction', mode: 'skip' },
      ],
    })
    assert.equal(imported.status, 200)
    assert.equal(imported.value.result.added, 1)
    assert.equal(imported.value.count, 2)
    const reimported = await call(env, '/api/deepseek-chat/memory', {
      action: 'import',
      platform: 'claude',
      entries: [{ content: '用户叫 Samuel，住在深圳', category: 'identity' }],
    })
    assert.equal(reimported.value.result.added, 0)
    assert.equal(reimported.value.count, 2)

    const updated = await call(env, '/api/deepseek-chat/memory', {
      action: 'update',
      id: memoryId,
      content: '用户希望回答尽量简短',
    })
    assert.equal(updated.value.result.status, 'updated')
    assert.equal(updated.value.memories.find(memory => memory.id === memoryId).content, '用户希望回答尽量简短')

    const settings = await call(env, '/api/deepseek-chat/memory', { action: 'settings', autoExtract: true })
    assert.equal(settings.value.settings.autoExtract, true)

    const remembered = await call(env, '/api/deepseek-chat/memory', {
      action: 'ask',
      text: '记住，我在深圳外国语学校读高二',
      locale: 'zh',
    })
    assert.equal(remembered.value.kind, 'add')
    assert.match(remembered.value.answer, /已记住/)
    assert.equal(remembered.value.count, 3)

    const query = await call(env, '/api/deepseek-chat/memory', {
      action: 'ask',
      text: '你现在记得我哪些事情？',
      locale: 'zh',
    })
    assert.match(query.value.answer, /深圳外国语学校/)

    const forget = await call(env, '/api/deepseek-chat/memory', {
      action: 'ask',
      text: '忘记关于深圳外国语学校的记忆',
      locale: 'zh',
    })
    if (forget.value.pending !== null) {
      const confirmed = await call(env, '/api/deepseek-chat/memory', {
        action: 'confirm',
        id: forget.value.pending.id,
        accept: true,
        locale: 'zh',
      })
      assert.equal(confirmed.value.count, 2)
    } else {
      assert.equal(forget.value.kind, 'delete')
      assert.equal(forget.value.count, 2)
    }

    // An imported memory is retrievable from a brand-new conversation.
    const chatRequests = []
    globalThis.fetch = async (_url, init) => {
      chatRequests.push(JSON.parse(init.body))
      return textResponse('今天深圳多云。')
    }
    const newChat = await conversation(env, { action: 'create' })
    await readStream(env, {
      conversationId: newChat.conversation.id,
      text: '深圳最近天气怎么样',
      locale: 'zh',
    })
    assert.equal(chatRequests.length, 1)
    assert.match(chatRequests[0].system, /long_term_memory/)
    assert.match(chatRequests[0].system, /Samuel/)

    // Deleting an unknown memory is a clear 404, not a silent success.
    const missing = await call(env, '/api/deepseek-chat/memory', { action: 'delete', id: 'missing' })
    assert.equal(missing.status, 404)
    assert.equal(missing.value.error.code, 'NOT_FOUND')

    // AI-assisted structuring requires explicit consent.
    const refused = await call(env, '/api/deepseek-chat/memory', { action: 'assist', text: 'some export' })
    assert.equal(refused.status, 400)
    assert.equal(refused.value.error.code, 'CONSENT_REQUIRED')

    // Summary refresh uses one model call and reports the result.
    globalThis.fetch = async (_url, init) => {
      const payload = JSON.parse(init.body)
      if (typeof payload.system === 'string' && payload.system.includes('记忆概述')) {
        return textResponse('## 概览\n用户偏好简短回答，并在深圳读高中。')
      }
      return new Response(JSON.stringify({ error: { message: 'unexpected request' } }), { status: 500 })
    }
    const summary = await call(env, '/api/deepseek-chat/memory', { action: 'summary.refresh', locale: 'zh' })
    assert.equal(summary.status, 200)
    assert.match(summary.value.summary.text, /## 概览/)
    assert.equal(summary.value.stale, false)

    // A failing summary request is reported as such; the chat is unaffected.
    globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: 'no model' } }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
    const failedSummary = await call(env, '/api/deepseek-chat/memory', { action: 'summary.refresh', locale: 'zh' })
    assert.equal(failedSummary.status, 502)
    assert.equal(failedSummary.value.error.code, 'SUMMARY_FAILED')

    const cleared = await call(env, '/api/deepseek-chat/memory', { action: 'clear' })
    assert.equal(cleared.value.result.cleared, 2)
    assert.equal(cleared.value.count, 0)
    assert.equal(cleared.value.summary, null)
  })
})

test('analyzes a supplied session for the history-import integration', async () => {
  await withService(async ({ service, routes }) => {
    const env = { service, routes }
    globalThis.fetch = async (_url, init) => {
      const payload = JSON.parse(init.body)
      if (typeof payload.system === 'string' && payload.system.includes('长期记忆提取器')) {
        return textResponse('{"memories":[{"category":"projects","content":"用户从二〇二四年开始开发 dsh-chat 插件"}]}')
      }
      return new Response(JSON.stringify({ error: { message: 'unexpected request' } }), { status: 500 })
    }
    const messages = [
      { role: 'user', content: '我最近在开发一个 DSH 插件' },
      { role: 'assistant', content: '听起来不错，需要我帮你看什么？' },
    ]
    const preview = await call(env, '/api/deepseek-chat/memory', {
      action: 'extract.session',
      title: '旧会话',
      messages,
      locale: 'zh',
    })
    assert.equal(preview.status, 200)
    assert.equal(preview.value.candidates.length, 1)
    assert.equal(preview.value.count, 0, 'analysis alone never writes memory')

    const saved = await call(env, '/api/deepseek-chat/memory', {
      action: 'extract.session',
      title: '旧会话',
      messages,
      save: true,
      locale: 'zh',
    })
    assert.equal(saved.value.count, 1)
    assert.equal(saved.value.saved.added, 1)
    assert.equal(service.memoryStore.list()[0].source.label, '旧会话')
  })
})

test('analyzes imported conversations for memory only after consent and only once', async () => {
  await withService(async ({ service, routes }) => {
    const env = { service, routes }
    const { added } = await service.store.adoptConversations([{
      title: '导入的项目会话',
      createdAt: 1,
      updatedAt: 2,
      source: { kind: 'deepseek', id: 'export-conv-1', importedAt: 1 },
      messages: [
        { id: 'u1', role: 'user', content: '我在用 TypeScript 开发 dsh-chat 插件', createdAt: 1 },
        { id: 'a1', role: 'assistant', status: 'done', createdAt: 2, blocks: [{ type: 'text', text: '了解。' }] },
      ],
    }])
    const id = added[0]
    const calls = []
    globalThis.fetch = async (_url, init) => {
      calls.push(JSON.parse(init.body))
      return textResponse('{"memories":[{"category":"projects","content":"用户正在用 TypeScript 开发 dsh-chat 插件"}]}')
    }

    const denied = await call(env, '/api/deepseek-chat/memory', {
      action: 'extract.imported', conversationIds: [id],
    })
    assert.equal(denied.status, 400)
    assert.equal(denied.value.error.code, 'CONSENT_REQUIRED')
    assert.equal(calls.length, 0, 'no model call before explicit consent')

    const first = await call(env, '/api/deepseek-chat/memory', {
      action: 'extract.imported', conversationIds: [id], consent: true, locale: 'zh',
    })
    assert.equal(first.status, 200, JSON.stringify(first.value))
    assert.equal(first.value.analyzed, 1)
    assert.deepEqual(first.value.analyzedIds, [id])
    assert.equal(first.value.entries.length, 1)
    assert.match(first.value.entries[0].content, /TypeScript/)
    assert.equal(first.value.count, undefined, 'analysis returns a preview, not a saved store')
    assert.equal(calls.length, 1)
    assert.equal(typeof service.store.getConversation(id).source.memoryExtractedAt, 'number')

    const detail = await conversation(env, { action: 'get', id })
    assert.equal(detail.conversation.messages.length, 2)
    assert.equal(detail.conversation.messages[0].content, '我在用 TypeScript 开发 dsh-chat 插件')

    const second = await call(env, '/api/deepseek-chat/memory', {
      action: 'extract.imported', conversationIds: [id], consent: true, locale: 'zh',
    })
    assert.equal(second.value.analyzed, 0)
    assert.equal(second.value.skipped[0].reason, 'already-extracted')
    assert.equal(calls.length, 1, 'the same history is not sent twice')

    const expanded = await call(env, '/api/deepseek-chat/memory', {
      action: 'extract.imported', conversationIds: [id], consent: true, reanalyze: true, locale: 'zh',
    })
    assert.equal(expanded.value.analyzed, 1)
    assert.equal(calls.length, 2)

    const confirmed = await call(env, '/api/deepseek-chat/memory', {
      action: 'import',
      platform: 'other',
      entries: expanded.value.entries.map(entry => ({ content: entry.content, category: entry.category })),
    })
    assert.equal(confirmed.value.result.added, 1)
    assert.equal(service.memoryStore.list().length, 1)
  })
})

test('a failed imported-memory extraction leaves the imported chat untouched', async () => {
  await withService(async ({ service, routes }) => {
    const env = { service, routes }
    const { added } = await service.store.adoptConversations([{
      title: '导入的失败会话',
      createdAt: 5,
      updatedAt: 6,
      source: { kind: 'deepseek', id: 'export-conv-2', importedAt: 5 },
      messages: [{ id: 'u1', role: 'user', content: '记住我喜欢简洁的回答', createdAt: 5 }],
    }])
    const id = added[0]
    globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: 'upstream down' } }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
    const result = await call(env, '/api/deepseek-chat/memory', {
      action: 'extract.imported', conversationIds: [id], consent: true, locale: 'zh',
    })
    assert.equal(result.status, 200)
    assert.equal(result.value.analyzed, 0)
    assert.equal(result.value.failed.length, 1)
    assert.equal(result.value.entries.length, 0)
    // No marker is written for a failed analysis, and the chat survives intact.
    assert.equal(service.store.getConversation(id).source.memoryExtractedAt, null)
    const detail = await conversation(env, { action: 'get', id })
    assert.equal(detail.conversation.messages.length, 1)
    assert.equal(detail.conversation.messages[0].content, '记住我喜欢简洁的回答')
    assert.equal(service.memoryStore.list().length, 0)
  })
})
