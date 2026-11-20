/**
 * Host integration tests for the conversation routes and streaming modes.
 * The ChatService is exercised through its registered routes with a fake
 * DeepSeek transport, so persistence, branching and request construction are
 * checked end to end without a network.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ChatService } from '../lib/service.js'

function replyEvents(text, {
  stopReason = 'end_turn', usage = { input_tokens: 5, output_tokens: 2 }, model = 'deepseek-flash',
} = {}) {
  return [
    { type: 'message_start', message: { id: 'msg', model, usage } },
    { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } },
    { type: 'content_block_stop', index: 0 },
    { type: 'message_delta', delta: { stop_reason: stopReason }, usage },
    { type: 'message_stop' },
  ]
}

function sseResponse(events) {
  const body = events.map(event => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join('')
  const encoder = new TextEncoder()
  return new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(body))
      controller.close()
    },
  }), { status: 200, headers: { 'content-type': 'text/event-stream' } })
}

async function setup() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-service-'))
  const previousHome = process.env.DSH_HOME
  process.env.DSH_HOME = dir
  const routes = new Map()
  const ctx = {
    logger: { warn() {}, info() {} },
    get(name) {
      if (name === 'credentials') {
        return {
          async resolve(ref) { return ref === 'DEEPSEEK_CHAT_API_KEY' ? { value: 'sk-test' } : undefined },
          async describe() { return { configured: true } },
          async set() {},
          async unset() {},
        }
      }
      return undefined
    },
    connection: {
      fetch: {
        register(route) {
          routes.set(route.path, route)
          return () => routes.delete(route.path)
        },
      },
    },
  }
  const service = new ChatService(ctx, { baseURL: 'https://api.deepseek.com/anthropic/v1' })
  service.registerRoutes()
  await service.ready()
  const restore = async () => {
    await service.dispose()
    if (previousHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousHome
    await fs.rm(dir, { recursive: true, force: true })
  }
  return { dir, routes, service, restore }
}

async function call(env, routePath, body) {
  const route = env.routes.get(routePath)
  assert.equal(route !== undefined, true, `route ${routePath} is registered`)
  const response = await route.fetch(new Request(`http://127.0.0.1${routePath}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }))
  const value = await response.json()
  return { status: response.status, value }
}

async function readStream(env, body) {
  const response = await env.routes.get('/api/deepseek-chat/stream').fetch(new Request('http://127.0.0.1/api/deepseek-chat/stream', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }))
  assert.equal(response.status, 200, `stream status ${response.status}: ${await response.clone().text()}`)
  const text = await response.text()
  const items = text.split('\n').map(line => line.trim()).filter(Boolean).map(line => JSON.parse(line))
  // The service clears its per-conversation guard just after the socket closes.
  await new Promise(resolve => setTimeout(resolve, 15))
  return items
}

async function conversation(env, body) {
  const result = await call(env, '/api/deepseek-chat/conversation', body)
  assert.equal(result.status, 200, JSON.stringify(result.value))
  return result.value
}

test('edits and regenerations only send the active branch and keep every version', async () => {
  const env = await setup()
  const originalFetch = globalThis.fetch
  const requests = []
  try {
    const created = await conversation(env, { action: 'create' })
    const id = created.conversation.id
    assert.deepEqual(created.conversation.messages, [])
    assert.equal(created.summaries.length, 1)
    assert.equal(created.conversation.pinned, false)

    globalThis.fetch = async (_url, init) => {
      requests.push(JSON.parse(init.body))
      return sseResponse(replyEvents(`answer ${requests.length}`))
    }

    const first = await readStream(env, { conversationId: id, text: 'Q1', locale: 'zh' })
    assert.equal(first[0].type, 'start')
    assert.equal(first[0].messages.length, 2)
    assert.equal(first[0].messages[0].content, 'Q1')
    const done1 = first.find(item => item.type === 'done')
    assert.equal(done1.message.blocks[0].text, 'answer 1')
    assert.equal(done1.conversation.messageCount, 2)
    assert.equal(done1.message.version, undefined)
    assert.equal(requests.at(-1).messages.length, 2)
    assert.equal(requests.at(-1).messages[0].role, 'latest_reminder')
    assert.equal(requests.at(-1).messages[1].role, 'user')

    const second = await readStream(env, { conversationId: id, text: 'Q2', locale: 'zh' })
    assert.equal(second[0].messages.length, 4)
    const done2 = second.find(item => item.type === 'done')
    assert.equal(done2.message.blocks[0].text, 'answer 2')
    // The new request replays the first complete round, then the new question.
    assert.equal(requests.at(-1).messages.length, 4)
    assert.equal(requests.at(-1).messages[0].content, 'Q1')
    assert.equal(requests.at(-1).messages[1].role, 'assistant')
    assert.equal(requests.at(-1).messages[1].content[0].text, 'answer 1')

    const detail = await conversation(env, { action: 'get', id })
    const [q1, a1, q2, a2] = detail.conversation.messages
    assert.equal(q1.content, 'Q1')
    assert.equal(q2.content, 'Q2')

    // Edit the first question: only the edited question and a fresh answer stay
    // on the active path, and the request never contains the old B/C/D turns.
    const edited = await readStream(env, {
      conversationId: id, mode: 'edit', targetMessageId: q1.id, text: 'Q1 edited', locale: 'zh',
    })
    const editedStart = edited[0]
    assert.equal(editedStart.messages.length, 2)
    assert.equal(editedStart.messages[0].content, 'Q1 edited')
    assert.deepEqual(editedStart.messages[0].version, { index: 2, count: 2 })
    assert.equal(editedStart.messages[1].role, 'assistant')
    assert.equal(requests.at(-1).messages.length, 2)
    assert.equal(requests.at(-1).messages[1].content, 'Q1 edited')
    assert.equal(requests.at(-1).messages.some(message => message.role === 'assistant'), false)
    const doneEdit = edited.find(item => item.type === 'done')
    assert.equal(doneEdit.message.blocks[0].text, 'answer 3')

    // Switching the question version back restores the original four-message path.
    const back = await conversation(env, {
      action: 'version', id, messageId: editedStart.messages[0].id, direction: 'prev',
    })
    assert.equal(back.selectedId, q1.id)
    assert.deepEqual(back.conversation.messages.map(message => message.id), [q1.id, a1.id, q2.id, a2.id])
    assert.equal(back.conversation.messages[0].content, 'Q1')
    assert.equal(back.conversation.messages[1].blocks[0].text, 'answer 1')

    // Regenerating a1 creates a sibling answer; the old follow-up subtree is off
    // the active path but still stored.
    const regenerated = await readStream(env, {
      conversationId: id, mode: 'regenerate', targetMessageId: a1.id, locale: 'zh',
    })
    const regenStart = regenerated[0]
    assert.equal(regenStart.messages.length, 2)
    assert.equal(regenStart.messages[0].id, q1.id)
    assert.deepEqual(regenStart.messages[1].version, { index: 2, count: 2 })
    assert.equal(requests.at(-1).messages.length, 2)
    assert.equal(requests.at(-1).messages.some(message => message.role === 'assistant'), false)
    const regenDone = regenerated.find(item => item.type === 'done')
    assert.notEqual(regenDone.message.id, a1.id)
    assert.equal(regenDone.message.blocks[0].text, 'answer 4')

    const previousAnswer = await conversation(env, {
      action: 'version', id, messageId: regenDone.message.id, direction: 'prev',
    })
    assert.equal(previousAnswer.selectedId, a1.id)
    assert.deepEqual(previousAnswer.conversation.messages.map(message => message.id), [q1.id, a1.id, q2.id, a2.id])

    // The regenerated answer keeps its own body and can be reopened by id.
    const focused = await conversation(env, { action: 'get', id, focusMessageId: regenDone.message.id })
    assert.deepEqual(focused.conversation.messages.map(message => message.id), [q1.id, regenDone.message.id])
    assert.equal(focused.conversation.messages[1].blocks[0].text, 'answer 4')

    // Both version switches are persisted.
    await env.service.store.flush()
    const reloaded = env.service.store.getConversation(id)
    assert.equal(Object.keys(reloaded.nodes).length, 7)
    assert.equal(reloaded.nodes[a2.id].message.blocks[0].text, 'answer 2')
  } finally {
    globalThis.fetch = originalFetch
    await env.restore()
  }
})

test('continues a cut-off answer in place with an assistant prefill', async () => {
  const env = await setup()
  const originalFetch = globalThis.fetch
  const requests = []
  try {
    const created = await conversation(env, { action: 'create' })
    const id = created.conversation.id
    // Drop the connection before message_stop: a network interruption.
    globalThis.fetch = async (_url, init) => {
      requests.push(JSON.parse(init.body))
      return sseResponse([
        { type: 'message_start', message: { id: 'm1', model: 'deepseek-flash', usage: { input_tokens: 2, output_tokens: 0 } } },
        { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
        { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: '半截回答' } },
      ])
    }
    const interrupted = await readStream(env, { conversationId: id, text: '写一段', locale: 'zh' })
    const errorItem = interrupted.find(item => item.type === 'error')
    assert.equal(errorItem.message.status, 'error')
    assert.equal(errorItem.message.blocks[0].text, '半截回答')
    const detail = await conversation(env, { action: 'get', id })
    const user = detail.conversation.messages[0]
    const assistant = detail.conversation.messages[1]
    assert.equal(assistant.status, 'error')
    assert.equal(assistant.blocks[0].text, '半截回答')

    // The user switches models before continuing: the request and the message's
    // model label must both follow the new selection.
    await env.service.modelConfig.set(id, { model: 'deepseek-v4-pro', effort: 'high' })
    globalThis.fetch = async (_url, init) => {
      requests.push(JSON.parse(init.body))
      return sseResponse(replyEvents('，接着写完了。', { model: 'deepseek-v4-pro' }))
    }
    const continued = await readStream(env, {
      conversationId: id, mode: 'continue', targetMessageId: assistant.id, locale: 'zh',
    })
    const start = continued[0]
    assert.equal(start.messages.length, 2)
    assert.equal(start.messages[1].id, assistant.id)
    assert.equal(start.messages[1].status, 'streaming')
    assert.equal(start.messages[1].model, 'deepseek-v4-pro')
    const request = requests.at(-1)
    assert.equal(request.model, 'deepseek-v4-pro')
    // The API sees the existing text as an assistant prefix, not a new question.
    assert.equal(request.messages.at(-2).role, 'user')
    assert.equal(request.messages.at(-2).content, '写一段')
    assert.equal(request.messages.at(-1).role, 'assistant')
    assert.equal(request.messages.at(-1).content[0].text, '半截回答')
    assert.equal(request.thinking.type, 'disabled')
    assert.deepEqual(request.tools.map(tool => tool.name), ['deepseek_read_url'])
    assert.equal(request.title, undefined)

    const done = continued.find(item => item.type === 'done')
    assert.equal(done.message.id, assistant.id)
    assert.equal(done.message.status, 'done')
    assert.equal(done.message.model, 'deepseek-v4-pro')
    assert.equal(done.message.blocks.map(block => block.text).join(''), '半截回答，接着写完了。')
    assert.equal(done.message.continueCount, 1)
    assert.equal(done.conversation.messageCount, 2)

    // Continuing never creates a branch: the answer was extended in place.
    const after = await conversation(env, { action: 'get', id })
    assert.deepEqual(after.conversation.messages.map(message => message.id), [user.id, assistant.id])
    assert.equal(after.conversation.messages[1].version, undefined)

    // A reply without text cannot be continued.
    const emptyConversation = await conversation(env, { action: 'create' })
    const rejected = await call(env, '/api/deepseek-chat/stream', {
      conversationId: emptyConversation.conversation.id,
      mode: 'continue',
      targetMessageId: 'missing',
    })
    assert.equal(rejected.status, 404)
    assert.equal(rejected.value.error.code, 'NOT_FOUND')
  } finally {
    globalThis.fetch = originalFetch
    await env.restore()
  }
})

test('organizes conversations into folders, pins and archives them, and searches history', async () => {
  const env = await setup()
  const originalFetch = globalThis.fetch
  let replyIndex = 0
  try {
    globalThis.fetch = async () => {
      replyIndex += 1
      return sseResponse(replyEvents(`answer ${replyIndex}`))
    }
    const first = await conversation(env, { action: 'create' })
    const second = await conversation(env, { action: 'create' })
    const firstId = first.conversation.id
    const secondId = second.conversation.id
    await readStream(env, { conversationId: firstId, text: 'Alpha question', locale: 'zh' })
    await readStream(env, { conversationId: secondId, text: 'Beta question', locale: 'zh' })

    const pinned = await conversation(env, { action: 'pin', id: firstId, pinned: true })
    assert.equal(pinned.conversation.pinned, true)
    assert.equal(typeof pinned.conversation.pinnedAt, 'number')

    const folderResult = await conversation(env, { action: 'folder.create', name: '  工作  ' })
    assert.equal(folderResult.folder.name, '工作')
    const folderId = folderResult.folder.id
    const moved = await conversation(env, { action: 'move', ids: [firstId, secondId], folderId })
    assert.equal(moved.moved, 2)
    assert.equal(moved.summaries.find(item => item.id === firstId).folderId, folderId)

    const collapsed = await conversation(env, { action: 'folder.collapse', id: folderId, collapsed: true })
    assert.equal(collapsed.folder.collapsed, true)

    const archived = await conversation(env, { action: 'archive', id: secondId, archived: true })
    assert.equal(archived.conversation.archived, true)
    assert.equal(archived.summaries.find(item => item.id === secondId).archived, true)

    // Search covers bodies, titles and archived/filed conversations.
    const bodySearch = await conversation(env, { action: 'search', query: 'answer 1' })
    assert.equal(bodySearch.results[0].id, firstId)
    assert.equal(bodySearch.results[0].onActivePath, true)
    assert.match(bodySearch.results[0].snippet, /answer 1/)
    const archivedSearch = await conversation(env, { action: 'search', query: 'Beta' })
    assert.equal(archivedSearch.results.some(result => result.id === secondId && result.archived === true), true)
    const missing = await conversation(env, { action: 'search', query: 'missing-everything' })
    assert.deepEqual(missing.results, [])

    // Deleting a folder moves the chats back to unfiled instead of deleting them.
    const deletedFolder = await conversation(env, { action: 'folder.delete', id: folderId })
    assert.equal(deletedFolder.moved, 2)
    assert.deepEqual(deletedFolder.folders, [])
    const list = await conversation(env, { action: 'list' })
    assert.equal(list.conversations.find(item => item.id === secondId).folderId, null)
    assert.equal(list.conversations.find(item => item.id === secondId).archived, true)
    const firstDetail = await conversation(env, { action: 'get', id: firstId })
    assert.equal(firstDetail.conversation.messages.length, 2)

    // A version switch on a single-version message is a clear 404.
    const noVersions = await call(env, '/api/deepseek-chat/conversation', {
      action: 'version', id: firstId, messageId: firstDetail.conversation.messages[0].id, direction: 'next',
    })
    assert.equal(noVersions.status, 404)
    assert.equal(noVersions.value.error.code, 'NO_VERSIONS')

    // Bootstrap carries the folder list for the sidebar.
    const bootstrap = await call(env, '/api/deepseek-chat/bootstrap')
    assert.equal(bootstrap.status, 200)
    assert.equal(Array.isArray(bootstrap.value.folders), true)
    assert.equal(Array.isArray(bootstrap.value.conversations), true)
  } finally {
    globalThis.fetch = originalFetch
    await env.restore()
  }
})

test('a conversation imported from an export continues like any local chat', async () => {
  const env = await setup()
  const originalFetch = globalThis.fetch
  const requests = []
  try {
    const { added } = await env.service.store.adoptConversations([{
      title: '导入的会话',
      createdAt: 1000,
      updatedAt: 2000,
      source: { kind: 'deepseek-export', id: 'export-1', importedAt: 1500 },
      messages: [
        { id: 'u1', role: 'user', content: '之前的问题', createdAt: 1000 },
        { id: 'a1', role: 'assistant', status: 'done', createdAt: 2000, blocks: [{ type: 'text', text: '之前的回答' }] },
      ],
    }])
    const id = added[0]
    globalThis.fetch = async (_url, init) => {
      requests.push(JSON.parse(init.body))
      return sseResponse(replyEvents('新的回答'))
    }
    const items = await readStream(env, { conversationId: id, text: '接着聊', locale: 'zh' })
    const start = items.find(item => item.type === 'start')
    assert.equal(start.messages.length, 4)
    assert.equal(start.messages[0].content, '之前的问题')
    assert.equal(start.messages[1].blocks[0].text, '之前的回答')
    assert.equal(items.find(item => item.type === 'done').message.status, 'done')
    assert.equal(requests.length, 1)
    assert.match(JSON.stringify(requests[0].messages), /之前的问题/)
    assert.match(JSON.stringify(requests[0].messages), /接着聊/)

    const detail = await conversation(env, { action: 'get', id })
    assert.equal(detail.conversation.source.id, 'export-1')
    assert.equal(detail.conversation.messages.length, 4)
    assert.equal(detail.conversation.messages[2].content, '接着聊')
  } finally {
    globalThis.fetch = originalFetch
    await env.restore()
  }
})
