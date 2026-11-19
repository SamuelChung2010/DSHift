import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ApiError, authSnapshot, isImageFile, normalizeBaseURL, resolveAuth, streamMessage, uploadFile, uploadPurpose,
} from '../lib/api.js'

function contextWith({ chatKey, dshKey, accountToken } = {}) {
  const values = {
    DEEPSEEK_CHAT_API_KEY: chatKey,
    DEEPSEEK_API_KEY: dshKey,
  }
  return {
    get(name) {
      if (name === 'credentials') {
        return {
          async resolve(ref) {
            const value = values[ref]
            return value ? { value, source: 'stored' } : undefined
          },
          async describe(ref) {
            return { configured: typeof values[ref] === 'string' && values[ref] !== '' }
          },
          async set() {},
          async unset() {},
        }
      }
      if (name === 'deepseekAccount') {
        return { async resolveToken() { return accountToken } }
      }
      return undefined
    },
  }
}

const settings = (patch = {}) => ({ baseURL: 'https://api.deepseek.com/anthropic/v1', authMode: 'auto', ...patch })

test('normalizes API roots and file purposes', () => {
  assert.equal(normalizeBaseURL('https://api.deepseek.com/anthropic'), 'https://api.deepseek.com/anthropic/v1')
  assert.equal(normalizeBaseURL('https://api.deepseek.com/anthropic/v1/'), 'https://api.deepseek.com/anthropic/v1')
  assert.equal(normalizeBaseURL(''), 'https://api.deepseek.com/anthropic/v1')
  assert.equal(isImageFile('a.png', ''), true)
  assert.equal(isImageFile('a.PDF', 'application/pdf'), false)
  assert.equal(uploadPurpose('a.pdf', 'application/pdf'), 'rich_layout_recognition')
  assert.equal(uploadPurpose('a.txt', 'text/plain'), 'user_data')
  assert.equal(uploadPurpose('a.png', 'image/png'), null)
})

test('resolves auth in order: chat key, DSH key, account', async () => {
  const chat = await resolveAuth(contextWith({ chatKey: 'sk-chat', dshKey: 'sk-dsh', accountToken: 'tok' }), settings())
  assert.equal(chat.source, 'chat-key')
  assert.deepEqual(chat.headers, { 'x-api-key': 'sk-chat' })

  const dsh = await resolveAuth(contextWith({ dshKey: 'sk-dsh', accountToken: 'tok' }), settings())
  assert.equal(dsh.source, 'dsh-key')

  const account = await resolveAuth(contextWith({ accountToken: 'tok' }), settings())
  assert.equal(account.source, 'account')
  assert.deepEqual(account.headers, { 'x-dsh-auth-token': 'tok' })

  await assert.rejects(
    resolveAuth(contextWith({}), settings()),
    error => error instanceof ApiError && error.code === 'AUTH_REQUIRED',
  )
})

test('honors explicit auth modes and reports auth state', async () => {
  const accountOnly = await resolveAuth(
    contextWith({ chatKey: 'sk-chat', accountToken: 'tok' }),
    settings({ authMode: 'account' }),
  )
  assert.equal(accountOnly.source, 'account')
  await assert.rejects(
    resolveAuth(contextWith({ chatKey: 'sk-chat' }), settings({ authMode: 'account' })),
    error => error.code === 'AUTH_REQUIRED',
  )
  await assert.rejects(
    resolveAuth(contextWith({ accountToken: 'tok' }), settings({ authMode: 'api-key' })),
    error => error.code === 'AUTH_REQUIRED',
  )
  const snapshot = await authSnapshot(contextWith({ dshKey: 'sk-dsh', accountToken: 'tok' }), settings())
  assert.equal(snapshot.ready, true)
  assert.equal(snapshot.source, 'dsh-key')
  assert.equal(snapshot.accountSignedIn, true)
  assert.equal(snapshot.canStoreKey, true)
})

test('parses SSE split across chunks and sends the Files beta header', async () => {
  const encoder = new TextEncoder()
  const chunks = [
    'event: message_start\ndata: {"type":"message_start","message":{"id":"m","model":"deepseek-flash"}}\n\n',
    ': keep-alive\n\n',
    'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"he',
    'llo"}}\n\n',
    'data: {"type":"message_stop"}\n\n',
  ]
  let captured
  const fetchImpl = async (url, init) => {
    captured = { url, init }
    let index = 0
    return new Response(new ReadableStream({
      pull(controller) {
        if (index >= chunks.length) {
          controller.close()
          return
        }
        controller.enqueue(encoder.encode(chunks[index++]))
      },
    }), { status: 200, headers: { 'content-type': 'text/event-stream' } })
  }
  const events = []
  for await (const event of streamMessage({
    baseURL: 'https://api.deepseek.com/anthropic/v1',
    auth: { headers: { 'x-api-key': 'sk' } },
    body: {
      model: 'deepseek-flash',
      messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'file', file_id: 'f' } }] }],
    },
    fetchImpl,
  })) {
    events.push(event)
  }
  assert.equal(captured.url, 'https://api.deepseek.com/anthropic/v1/messages')
  assert.equal(captured.init.headers['x-api-key'], 'sk')
  assert.equal(captured.init.headers['anthropic-beta'], 'files-api-2025-04-14')
  const body = JSON.parse(captured.init.body)
  assert.equal(body.stream, true)
  assert.deepEqual(events.map(event => event.type), ['message_start', 'content_block_delta', 'message_stop'])
  assert.equal(events[1].delta.text, 'hello')
})

test('maps HTTP errors with status and code', async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ error: { message: 'bad key' } }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  })
  await assert.rejects(
    (async () => {
      for await (const _event of streamMessage({
        baseURL: 'https://api.deepseek.com/anthropic/v1',
        auth: { headers: { 'x-api-key': 'sk' } },
        body: { model: 'deepseek-flash', messages: [] },
        fetchImpl,
      })) { /* consume */ }
    })(),
    error => error instanceof ApiError && error.status === 401 && error.code === 'AUTH' && error.message === 'bad key',
  )
})

test('uploads through Files API with purpose first and maps the response', async () => {
  let captured
  const fetchImpl = async (url, init) => {
    captured = { url, init, entries: [...init.body.entries()] }
    return new Response(JSON.stringify({
      id: 'file-1', filename: 'a.pdf', size_bytes: 12, mime_type: 'application/pdf',
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  const file = await uploadFile({
    baseURL: 'https://api.deepseek.com/anthropic/v1',
    auth: { headers: { 'x-dsh-auth-token': 'tok' } },
    name: 'a.pdf',
    mimeType: 'application/pdf',
    bytes: new Uint8Array([1, 2, 3]),
    fetchImpl,
  })
  assert.equal(captured.url, 'https://api.deepseek.com/anthropic/v1/files')
  assert.equal(captured.init.headers['x-dsh-auth-token'], 'tok')
  assert.equal(captured.init.headers['anthropic-beta'], 'files-api-2025-04-14')
  assert.equal(captured.entries[0][0], 'purpose')
  assert.equal(captured.entries[0][1], 'rich_layout_recognition')
  assert.equal(captured.entries[1][0], 'file')
  assert.equal(captured.entries[1][1].name, 'a.pdf')
  assert.equal(file.fileId, 'file-1')
  assert.equal(file.isImage, false)
  assert.equal(file.bytes, 12)
})
