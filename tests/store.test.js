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
    // The close time is the reply's own last write, never the load clock: the
    // reasoning duration must not grow the longer the file sits on disk.
    assert.equal(message.blocks[0].endedAt, 1)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('keeps a persisted thinking duration stable across reloads', async () => {
  const { dir, store } = await tempStore()
  try {
    const conversation = await store.createConversation()
    await store.appendMessage(conversation.id, {
      id: 'a1', role: 'assistant', createdAt: 1, updatedAt: 12_000, status: 'streaming',
      blocks: [{ type: 'thinking', thinking: 'deep', signature: '', startedAt: 1_000 }],
    })
    await store.flush()
    const again = new ChatStore(dir, { logger: { warn() {} } })
    await again.load()
    const message = again.getConversation(conversation.id).messages[0]
    assert.equal(message.status, 'stopped')
    assert.equal(message.blocks[0].endedAt, 12_000)
    assert.equal(message.blocks[0].endedAt - message.blocks[0].startedAt, 11_000)
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

test('migrates a version 1 state file to branches and keeps a restorable backup', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-migrate-'))
  try {
    const legacy = {
      version: 1,
      settings: { authMode: 'auto', thinking: true, search: false, systemPrompt: '' },
      conversations: [{
        id: 'c1',
        title: '旧对话',
        titleAuto: false,
        createdAt: 1,
        updatedAt: 3,
        messages: [
          {
            id: 'u1', role: 'user', content: '保留我', createdAt: 1,
            files: [{ id: 'f1', fileId: 'file-1', name: 'a.pdf', size: 9, mimeType: 'application/pdf', isImage: false }],
          },
          {
            id: 'a1', role: 'assistant', status: 'done', createdAt: 2, updatedAt: 2,
            blocks: [{ type: 'text', text: '旧回答', citations: [{ type: 'web_search_result_location', url: 'https://e.test', title: 'E', cited_text: 'x', encrypted_index: '' }] }],
            usage: { input_tokens: 3, output_tokens: 4 },
          },
        ],
      }],
    }
    await fs.writeFile(path.join(dir, 'state.json'), JSON.stringify(legacy), 'utf8')
    const store = new ChatStore(dir, { logger: { warn() {}, info() {} } })
    await store.load()
    await store.flush()

    const backup = (await fs.readdir(dir)).find(name => /^state\.json\.v1-backup-\d+$/.test(name))
    assert.equal(typeof backup, 'string')
    assert.deepEqual(JSON.parse(await fs.readFile(path.join(dir, backup), 'utf8')), legacy)

    const conversation = store.getConversation('c1')
    assert.deepEqual(conversation.messages.map(message => message.id), ['u1', 'a1'])
    assert.equal(conversation.messages[0].files[0].fileId, 'file-1')
    assert.equal(conversation.messages[1].blocks[0].text, '旧回答')
    assert.equal(conversation.pinned, false)
    assert.equal(conversation.archived, false)
    assert.equal(conversation.folderId, null)
    assert.equal(conversation.nodes.a1.parentId, 'u1')
    assert.equal(conversation.nodes.a1.children.length, 0)

    const saved = JSON.parse(await fs.readFile(path.join(dir, 'state.json'), 'utf8'))
    assert.equal(saved.version, 2)
    assert.equal(saved.conversations[0].leafId, 'a1')
    assert.equal(saved.conversations[0].nodes.a1.parentId, 'u1')
    assert.equal(saved.conversations[0].messages, undefined)

    const again = new ChatStore(dir, { logger: { warn() {} } })
    await again.load()
    assert.equal(again.getConversation('c1').messages.length, 2)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('pins, archives, files into folders and searches titles and bodies after reload', async () => {
  const { dir, store } = await tempStore()
  try {
    const first = await store.createConversation()
    const second = await store.createConversation()
    const third = await store.createConversation()
    await store.appendMessage(first.id, {
      id: 'u1', role: 'user', content: '你好 world searchable', files: [], createdAt: 10,
    })
    await store.appendMessage(first.id, {
      id: 'a1', role: 'assistant', createdAt: 11, updatedAt: 11, status: 'done',
      blocks: [{ type: 'text', text: '回答正文 target 内容', citations: [] }],
    })
    await store.appendMessage(second.id, { id: 'u2', role: 'user', content: '第二个聊天 second', files: [], createdAt: 12 })
    await store.appendMessage(third.id, { id: 'u3', role: 'user', content: '第三个', files: [], createdAt: 13 })
    await store.renameConversation(first.id, '置顶会话')
    await store.setPinned(first.id, true)
    const folder = await store.createFolder('  工作  ')
    assert.equal(folder.name, '工作')
    assert.equal(await store.createFolder('   '), undefined)
    await store.moveConversations([first.id, second.id], folder.id)
    await store.setFolderCollapsed(folder.id, true)
    await store.setArchived(second.id, true)
    await store.flush()

    const again = new ChatStore(dir, { logger: { warn() {} } })
    await again.load()
    const summaries = again.listSummaries()
    const pinned = summaries.find(item => item.id === first.id)
    assert.equal(pinned.pinned, true)
    assert.equal(typeof pinned.pinnedAt, 'number')
    assert.equal(pinned.folderId, folder.id)
    const archived = summaries.find(item => item.id === second.id)
    assert.equal(archived.archived, true)
    assert.equal(typeof archived.archivedAt, 'number')
    assert.equal(archived.folderId, folder.id)
    assert.equal(again.listFolders()[0].collapsed, true)

    // A body match finds the exact message in a pinned conversation.
    const bodyHit = again.search('target')
    assert.equal(bodyHit.results[0].id, first.id)
    assert.equal(bodyHit.results[0].messageId, 'a1')
    assert.equal(bodyHit.results[0].onActivePath, true)
    assert.match(bodyHit.results[0].snippet, /target/)
    // Archived and folder contents are searched too.
    assert.equal(again.search('second').results.some(item => item.id === second.id), true)
    // Titles and Chinese keywords work.
    assert.equal(again.search('置顶').results[0].titleMatch, true)
    assert.equal(again.search('正文').results[0].id, first.id)
    assert.equal(again.search('   ').results.length, 0)

    // Deleting the folder keeps every conversation and returns them to unfiled.
    const removed = await again.deleteFolder(folder.id)
    assert.deepEqual(removed, { removed: true, moved: 2 })
    assert.equal(again.listFolders().length, 0)
    assert.equal(again.getConversation(second.id).folderId, null)
    assert.equal(again.getConversation(second.id).messages.length, 1)
    assert.equal(again.getConversation(first.id).messages.length, 2)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('edits and regenerations add sibling branches without losing any history', async () => {
  const { dir, store } = await tempStore()
  try {
    const conversation = await store.createConversation()
    const done = (id, text, createdAt) => ({
      id, role: 'assistant', createdAt, updatedAt: createdAt, status: 'done', thinking: true,
      blocks: [
        { type: 'thinking', thinking: `think-${id}`, signature: '', startedAt: createdAt, endedAt: createdAt + 1 },
        {
          type: 'text', text,
          citations: [{
            type: 'web_search_result_location', url: `https://e.test/${id}`, title: id,
            cited_text: text, encrypted_index: '',
          }],
        },
      ],
      usage: { input_tokens: createdAt, output_tokens: createdAt + 1 },
    })
    await store.appendTurn(
      conversation.id,
      { id: 'u1', role: 'user', content: 'Q1', files: [], createdAt: 1 },
      done('a1', 'A1', 2),
    )
    await store.appendTurn(
      conversation.id,
      { id: 'u2', role: 'user', content: 'Q2', files: [], createdAt: 3 },
      done('a2', 'A2', 4),
    )
    // Edit the first question: a new root branch next to u1.
    await store.createUserBranch(conversation.id, {
      id: 'u3', role: 'user', content: 'Q1 edited', createdAt: 5,
      files: [{ id: 'f-edit', fileId: 'file-edit', name: 'spec.pdf', size: 42, mimeType: 'application/pdf', isImage: false }],
    }, null)
    await store.createAssistantBranch(conversation.id, done('a3', 'A3', 6), 'u3')
    let current = store.getConversation(conversation.id)
    assert.deepEqual(current.messages.map(message => message.id), ['u3', 'a3'])
    assert.deepEqual(store.versionInfo(current, 'u3'), { index: 2, count: 2 })
    assert.equal(store.versionInfo(current, 'a3'), null)

    // Switching back reopens the old branch all the way to its last turn.
    const switched = await store.selectVersion(conversation.id, 'u3', -1)
    assert.equal(switched.selectedId, 'u1')
    current = store.getConversation(conversation.id)
    assert.deepEqual(current.messages.map(message => message.id), ['u1', 'a1', 'u2', 'a2'])
    assert.deepEqual(store.versionInfo(current, 'u1'), { index: 1, count: 2 })

    // Regenerating a1 adds a sibling answer; the old follow-up stays off-path.
    await store.createAssistantBranch(conversation.id, done('a4', 'A4', 7), 'u1')
    current = store.getConversation(conversation.id)
    assert.deepEqual(current.messages.map(message => message.id), ['u1', 'a4'])
    assert.deepEqual(store.versionInfo(current, 'a4'), { index: 2, count: 2 })
    await store.selectVersion(conversation.id, 'a4', -1)
    current = store.getConversation(conversation.id)
    assert.deepEqual(current.messages.map(message => message.id), ['u1', 'a1', 'u2', 'a2'])

    // Reopening an older branch through a message id used by search.
    await store.focusMessage(conversation.id, 'a3')
    current = store.getConversation(conversation.id)
    assert.deepEqual(current.messages.map(message => message.id), ['u3', 'a3'])

    // Every version keeps its own text and metadata across a reload.
    await store.flush()
    const again = new ChatStore(dir, { logger: { warn() {} } })
    await again.load()
    const reloaded = again.getConversation(conversation.id)
    assert.deepEqual(reloaded.messages.map(message => message.id), ['u3', 'a3'])
    assert.equal(reloaded.nodes.a1.message.blocks[1].text, 'A1')
    assert.equal(reloaded.nodes.a4.message.blocks[1].text, 'A4')
    // Each version keeps its own reasoning, citations, usage and attachments.
    assert.equal(reloaded.nodes.a1.message.blocks[1].citations[0].url, 'https://e.test/a1')
    assert.equal(reloaded.nodes.a1.message.blocks[0].thinking, 'think-a1')
    assert.deepEqual(reloaded.nodes.a4.message.usage, { input_tokens: 7, output_tokens: 8 })
    assert.equal(reloaded.nodes.a4.message.thinking, true)
    assert.equal(reloaded.nodes.u3.message.files[0].fileId, 'file-edit')
    assert.equal(Object.keys(reloaded.nodes).length, 7)
    assert.equal(reloaded.leafId, 'a3')
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})
