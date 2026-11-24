import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ChatService } from '../lib/service.js'

/** One isolated Chat service with a stubbed DeepSeek HTTP layer. */
async function withService(run) {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-service-'))
  const previousHome = process.env.DSH_HOME
  process.env.DSH_HOME = home
  const routes = new Map()
  const ctx = {
    logger: { warn() {} },
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
    effect(callback) {
      callback()
      return () => {}
    },
  }
  const service = new ChatService(ctx, {})
  await service.ready()
  service.registerRoutes()
  const originalFetch = globalThis.fetch
  const captured = []
  const reply = [
    'event: message_start',
    'data: {"type":"message_start","message":{"id":"m1","model":"deepseek-flash","usage":{"input_tokens":5,"output_tokens":0}}}',
    '',
    'event: content_block_start',
    'data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}',
    '',
    'event: content_block_delta',
    'data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"pong"}}',
    '',
    'event: content_block_stop',
    'data: {"type":"content_block_stop","index":0}',
    '',
    'event: message_delta',
    'data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"input_tokens":5,"output_tokens":1}}',
    '',
    'event: message_stop',
    'data: {"type":"message_stop"}',
    '',
    '',
  ].join('\n')
  globalThis.fetch = async (url, init) => {
    captured.push({ url: String(url), body: JSON.parse(init.body) })
    return new Response(reply, { status: 200, headers: { 'content-type': 'text/event-stream' } })
  }
  try {
    await run({ service, routes, captured })
  } finally {
    globalThis.fetch = originalFetch
    await service.dispose()
    if (previousHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousHome
    await fs.rm(home, { recursive: true, force: true })
  }
}

function requestTurn(routes, conversationId, body, signal) {
  const route = routes.get('/api/deepseek-chat/stream')
  assert.ok(route, 'the stream route must be registered')
  return route.fetch(new Request('http://localhost/api/deepseek-chat/stream', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ conversationId, text: 'take off', files: [], locale: 'en', ...body }),
    signal,
  }))
}

async function send(service, routes, body) {
  const conversation = await service.store.createConversation()
  const response = await requestTurn(routes, conversation.id, body)
  const text = await response.text()
  return { response, text, conversation }
}

test('the selected model and thinking effort reach the Messages request', async () => {
  await withService(async ({ service, routes, captured }) => {
    const { response, text } = await send(service, routes, {
      thinking: true,
      search: true,
      model: 'deepseek-v4-pro',
      effort: 'max',
    })
    assert.equal(response.status, 200)
    assert.match(text, /"type":"done"/, 'the stream must settle normally')
    assert.equal(captured.length, 1)
    const body = captured[0].body
    assert.equal(body.model, 'deepseek-v4-pro')
    assert.deepEqual(body.thinking, { type: 'enabled' })
    assert.deepEqual(body.output_config, { effort: 'max' })
    assert.ok(body.tools.some(tool => tool.type === 'deepseek_web_search'), 'web search must be declared')
    assert.ok(body.tools.some(tool => tool.type === 'deepseek_read_url'), 'url reading stays declared')
    assert.equal(body.safety_check.level, 'high')
    assert.ok(captured[0].url.endsWith('/messages'))
  })
})

test('thinking off sends the disabled switch and no effort', async () => {
  await withService(async ({ service, routes, captured }) => {
    const { response } = await send(service, routes, { thinking: false, search: false })
    assert.equal(response.status, 200)
    const body = captured[0].body
    assert.equal(body.model, 'deepseek-flash', 'the default model is used when the client omits one')
    assert.deepEqual(body.thinking, { type: 'disabled' })
    assert.equal(body.output_config, undefined)
    assert.ok(!body.tools.some(tool => tool.type === 'deepseek_web_search'), 'search stays off')
  })
})

test('an unknown model is rejected before any DeepSeek traffic', async () => {
  await withService(async ({ service, routes, captured }) => {
    const { response, text } = await send(service, routes, { model: 'claude-opus-4', thinking: false })
    assert.equal(response.status, 400)
    assert.match(text, /INVALID_MODEL/)
    assert.equal(captured.length, 0, 'no request may be sent for an unknown model')
  })
})

test('images are refused for a model without image understanding', async () => {
  await withService(async ({ service, routes, captured }) => {
    const { response, text } = await send(service, routes, {
      model: 'deepseek-v4-pro',
      thinking: false,
      files: [{ fileId: 'file-1', name: 'cat.png', isImage: true }],
    })
    assert.equal(response.status, 400)
    assert.match(text, /UNSUPPORTED_INPUT/)
    assert.equal(captured.length, 0)
  })
})

test('concurrent sends reserve only their own conversation before appending history', async () => {
  await withService(async ({ service, routes, captured }) => {
    const first = await service.store.createConversation()
    const other = await service.store.createConversation()
    const upstream = globalThis.fetch
    let finish
    const waitForFinish = new Promise(resolve => { finish = resolve })
    globalThis.fetch = async (...args) => {
      const response = await upstream(...args)
      await waitForFinish
      return response
    }
    try {
      const [one, two, independent] = await Promise.all([
        requestTurn(routes, first.id, { text: 'A' }),
        requestTurn(routes, first.id, { text: 'B' }),
        requestTurn(routes, other.id, { text: 'C' }),
      ])
      assert.deepEqual([one.status, two.status].sort(), [200, 409])
      const busy = one.status === 409 ? one : two
      assert.equal((await busy.json()).error.code, 'BUSY')
      assert.equal(independent.status, 200)
      assert.equal(captured.length, 2)
      assert.equal(first.messages.length, 2)
      assert.equal(other.messages.length, 2)
      finish()
      const accepted = one.status === 200 ? one : two
      await Promise.all([accepted.text(), independent.text()])
      const retry = await requestTurn(routes, first.id, { text: 'after completion' })
      assert.equal(retry.status, 200)
      await retry.text()
    } finally {
      finish()
    }
  })
})

test('canceling or unloading during credential lookup releases the reservation without creating a turn', async () => {
  await withService(async ({ service, routes, captured }) => {
    const conversation = await service.store.createConversation()
    const provider = service.ctx.get('credentials')
    let entered
    service.ctx.get = name => name === 'credentials' ? {
      ...provider,
      resolve: () => { entered(); return new Promise(() => {}) },
    } : undefined
    for (const unload of [false, true]) {
      const started = new Promise(resolve => { entered = resolve })
      const controller = new AbortController()
      const pending = requestTurn(routes, conversation.id, {}, controller.signal)
      await started
      const duplicate = await requestTurn(routes, conversation.id, {})
      assert.equal(duplicate.status, 409)
      if (unload) await service.dispose()
      else controller.abort()
      assert.equal((await pending).status, 499)
      assert.equal(conversation.messages.length, 0)
      assert.equal(service.active.has(conversation.id), false)
      assert.equal(captured.length, 0)
    }
  })
})

test('canceling an open response stops its upstream and permits the next turn', async () => {
  await withService(async ({ service, routes }) => {
    const conversation = await service.store.createConversation()
    const upstream = globalThis.fetch
    let upstreamSignal
    globalThis.fetch = async (_url, { signal }) => {
      upstreamSignal = signal
      return new Promise((_, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true })
      })
    }
    const response = await requestTurn(routes, conversation.id, { text: 'stop this' })
    const reader = response.body.getReader()
    const first = await reader.read()
    assert.equal(JSON.parse(new TextDecoder().decode(first.value)).type, 'start')
    const concurrent = await requestTurn(routes, conversation.id, { text: 'wait' })
    assert.equal(concurrent.status, 409)
    await reader.cancel()
    assert.equal(upstreamSignal.aborted, true)
    await Promise.all([...service.pending])
    assert.equal(conversation.messages.at(-1).status, 'stopped')
    globalThis.fetch = upstream
    const retry = await requestTurn(routes, conversation.id, { text: 'next' })
    assert.equal(retry.status, 200)
    await retry.text()
  })
})

test('image validation uses each outgoing branch and rejects it before changing history', async () => {
  await withService(async ({ service, routes, captured }) => {
    const chat = await service.store.createConversation()
    const sendFlash = async (body) => {
      const response = await requestTurn(routes, chat.id, { model: 'deepseek-flash', ...body })
      assert.equal(response.status, 200)
      await response.text()
    }
    await sendFlash({ text: 'Describe this', files: [{ fileId: 'f1', name: 'cat.png', isImage: true }] })
    await sendFlash({ text: 'What color?' })
    const [imageQuestion, imageReply, followUp, lastReply] = chat.messages
    await service.store.replaceMessage(chat.id, { ...lastReply, stopReason: 'max_tokens' })
    const before = JSON.stringify(service.store.serializable())
    for (const turn of [
      { text: 'Continue the discussion' },
      { mode: 'edit', targetMessageId: followUp.id, text: 'Which color?' },
      { mode: 'regenerate', targetMessageId: imageReply.id },
      { mode: 'continue', targetMessageId: lastReply.id },
    ]) {
      const response = await requestTurn(routes, chat.id, { ...turn, model: 'deepseek-v4-pro' })
      assert.equal(response.status, 400)
      assert.equal((await response.json()).error.code, 'UNSUPPORTED_INPUT')
      assert.equal(JSON.stringify(service.store.serializable()), before)
      assert.equal(captured.length, 2)
    }

    // Editing the first question produces a new branch without the old image.
    const edited = await requestTurn(routes, chat.id, {
      mode: 'edit', targetMessageId: imageQuestion.id, text: 'Text only', model: 'deepseek-v4-pro',
    })
    assert.equal(edited.status, 200)
    await edited.text()
    assert.equal(captured.length, 3)
    assert.deepEqual(captured[2].body.messages.filter(message => message.role === 'user'), [
      { role: 'user', content: 'Text only' },
    ])
    assert.equal(chat.nodes[imageQuestion.id].message.files[0].fileId, 'f1')
  })
})

test('a conversation without an explicit request follows its stored preference', async () => {
  await withService(async ({ service, routes, captured }) => {
    const conversation = await service.store.createConversation()
    await service.modelConfig.set(conversation.id, { model: 'deepseek-v4-pro', effort: 'low' })
    const route = routes.get('/api/deepseek-chat/stream')
    const request = new Request('http://localhost/api/deepseek-chat/stream', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        conversationId: conversation.id, text: 'hi', files: [], thinking: true, locale: 'en',
      }),
    })
    const response = await route.fetch(request)
    await response.text()
    assert.equal(captured[0].body.model, 'deepseek-v4-pro')
    assert.deepEqual(captured[0].body.output_config, { effort: 'low' })
  })
})
