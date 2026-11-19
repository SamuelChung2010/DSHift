import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ChatStore } from '../lib/store.js'

async function tempStore() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-store-'))
  const store = new ChatStore(dir, { logger: { warn() {} } })
  await store.load()
  return { dir, store }
}

test('persists conversations, messages, automatic titles and manual renames', async () => {
  const { dir, store } = await tempStore()
  try {
    const conversation = await store.createConversation()
    assert.equal(store.listSummaries().length, 1)
    await store.appendMessage(conversation.id, {
      id: 'u1', role: 'user', content: '  first line\nsecond', files: [], createdAt: 10,
    })
    assert.equal(store.getConversation(conversation.id).title, 'first line')
    assert.equal(store.getConversation(conversation.id).titleAuto, true)
    await store.appendMessage(conversation.id, {
      id: 'a1', role: 'assistant', createdAt: 11, updatedAt: 12, status: 'done',
      blocks: [{ type: 'text', text: 'answer', citations: [] }],
    })
    await store.applyAutoTitle(conversation.id, 'Server title')
    assert.equal(store.getConversation(conversation.id).title, 'Server title')
    assert.equal(store.getConversation(conversation.id).titleAuto, false)

    await store.renameConversation(conversation.id, '  Manual   name  ')
    assert.equal(store.getConversation(conversation.id).title, 'Manual name')
    await store.applyAutoTitle(conversation.id, 'Ignored title')
    assert.equal(store.getConversation(conversation.id).title, 'Manual name')

    await store.flush()
    const again = new ChatStore(dir, { logger: { warn() {} } })
    await again.load()
    const loaded = again.getConversation(conversation.id)
    assert.equal(loaded.messages.length, 2)
    assert.equal(loaded.messages[1].blocks[0].text, 'answer')
    assert.equal(loaded.title, 'Manual name')
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('reloads a streaming reply as stopped and closes its thinking block', async () => {
  const { dir, store } = await tempStore()
  try {
    const conversation = await store.createConversation()
    await store.appendMessage(conversation.id, {
      id: 'a1', role: 'assistant', createdAt: 1, updatedAt: 1, status: 'streaming',
      blocks: [{ type: 'thinking', thinking: 'partial', signature: '', startedAt: 1 }],
    })
    await store.flush()
    const again = new ChatStore(dir, { logger: { warn() {} } })
    await again.load()
    const message = again.getConversation(conversation.id).messages[0]
    assert.equal(message.status, 'stopped')
    assert.equal(typeof message.blocks[0].endedAt, 'number')
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('normalizes invalid settings and deletes conversations', async () => {
  const { dir, store } = await tempStore()
  try {
    const settings = await store.updateSettings({ authMode: 'nope', thinking: true, search: 'yes', systemPrompt: 42 })
    assert.equal(settings.authMode, 'auto')
    assert.equal(settings.thinking, true)
    assert.equal(settings.search, false)
    assert.equal(settings.systemPrompt, '')
    const conversation = await store.createConversation()
    assert.equal(await store.deleteConversation(conversation.id), true)
    assert.equal(await store.deleteConversation(conversation.id), false)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('recovers from a corrupt state file without throwing', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-corrupt-'))
  try {
    await fs.writeFile(path.join(dir, 'state.json'), '{not json', 'utf8')
    const store = new ChatStore(dir, { logger: { warn() {} } })
    await store.load()
    assert.deepEqual(store.listSummaries(), [])
    const files = await fs.readdir(dir)
    assert.equal(files.some(name => name.startsWith('state.json.corrupt-')), true)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})
