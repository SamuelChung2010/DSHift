/**
 * Unit coverage for the export conversion, the store merge, and the request
 * building of an imported conversation. No archive and no service is involved,
 * so each rule is asserted directly on the value it produces.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  SUPPORTED_EXPORT_FORMAT_VERSION, readManifest, readSessionFile, readSessionIndex, selectActiveBranch,
  ExportFormatError,
} from '../lib/import/format.js'
import { convertConversation, SOURCE_KIND } from '../lib/import/convert.js'
import { ChatStore } from '../lib/store.js'
import { buildRequestMessages } from '../lib/protocol.js'
import {
  contentRisk, files, indexRow, message, request, response, sessionFile, templateResponse, think,
  timeISO, toolOpen, toolSearch,
} from './support/export-fixture.js'

const BASE = Date.UTC(2026, 0, 1, 0, 0, 0)

async function tempStore() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-convert-'))
  const store = new ChatStore(directory, { logger: { warn() {}, info() {} } })
  await store.load()
  return {
    store,
    async cleanup() {
      await fs.rm(directory, { recursive: true, force: true })
    },
  }
}

function readDocument(document) {
  return readSessionFile(Buffer.from(JSON.stringify(document)))
}

test('the export format is validated instead of trusted', () => {
  assert.deepEqual(readManifest(Buffer.from('{"export_format_version":3}')), { version: SUPPORTED_EXPORT_FORMAT_VERSION })
  assert.throws(() => readManifest(Buffer.from('[]')), error => error instanceof ExportFormatError)
  assert.throws(() => readManifest(Buffer.from('{}')), error => error.code === 'BAD_EXPORT')
  assert.throws(() => readSessionIndex(Buffer.from('{"rows":[]}')), error => error.code === 'MISSING_INDEX')
  assert.throws(() => readSessionIndex(Buffer.from('[]')), error => error.code === 'NO_CONVERSATIONS')
  const rows = readSessionIndex(Buffer.from(JSON.stringify([
    { id: 'a', title: 'A', pinned: true, message_count: 2, inserted_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-02T00:00:00.000Z' },
    { id: 'a', title: 'duplicate' },
    { title: 'no id' },
    'not an object',
  ])))
  assert.equal(rows.length, 1, 'an unusable row is dropped and a duplicate keeps the first')
  assert.equal(rows[0].pinned, true)
  assert.equal(rows[0].messageCount, 2)
  assert.equal(rows[0].updatedAt, Date.UTC(2026, 0, 2))
  assert.throws(() => readSessionFile(Buffer.from('{"messages":[]}')), error => error.code === 'BAD_SESSION')
  assert.throws(() => readSessionFile(Buffer.from('{"id":"x"}')), error => error.code === 'BAD_SESSION')
})

test('the active branch follows current_message_id and falls back to the newest leaf', () => {
  const document = sessionFile({
    id: 's',
    title: 'T',
    currentMessageId: 4,
    messages: [
      message(1, 'USER', [request('a')]),
      message(2, 'ASSISTANT', [response('b')], { parentId: 1 }),
      message(3, 'USER', [request('c')], { parentId: 1 }),
      message(4, 'ASSISTANT', [response('d')], { parentId: 3 }),
    ],
  })
  assert.deepEqual(selectActiveBranch(readDocument(document).messages, 4).map(item => item.id), [1, 3, 4])
  // Without a current id the greatest message id is the leaf.
  assert.deepEqual(selectActiveBranch(readDocument({ ...document, current_message_id: null }).messages, null).map(item => item.id), [1, 3, 4])
  // A current id naming no message falls back to the same leaf.
  assert.deepEqual(selectActiveBranch(readDocument(document).messages, 999).map(item => item.id), [1, 3, 4])
  assert.throws(
    () => selectActiveBranch([message(2, 'ASSISTANT', [], { parentId: 99 })], null),
    error => error.code === 'BAD_SESSION',
  )
  const cycle = [message(1, 'USER', [], { parentId: 2 }), message(2, 'ASSISTANT', [], { parentId: 1 })]
  assert.throws(() => selectActiveBranch(cycle, 1), error => error.code === 'BAD_SESSION')
  assert.throws(() => selectActiveBranch([], null), error => error.code === 'NO_MESSAGES')
})

test('every recoverable fragment becomes a stored block, and nothing else is invented', () => {
  const row = indexRow({ id: 'session-fragments', title: '片段', insertedAt: timeISO(BASE), updatedAt: timeISO(BASE, 100) })
  const document = readDocument(sessionFile({
    id: 'session-fragments',
    title: '片段',
    currentMessageId: 2,
    insertedAt: timeISO(BASE),
    updatedAt: timeISO(BASE, 100),
    messages: [
      message(1, 'USER', [
        files([
          { id: 'doc', name: '报告.pdf', size: 2048, isImage: false },
          { id: 'pic', name: '截图.png', size: 4096, isImage: true, exportPath: 'chat_sessions/x_files/pic.png' },
        ]),
        request('看看这些'),
      ], { at: timeISO(BASE) }),
      message(2, 'ASSISTANT', [
        think('第一步', 2),
        toolSearch(['查询'], [{ url: 'https://a.test', title: 'A', snippet: 'aa', siteName: 'A站' }], { stage: 1 }),
        think('第二步', 3),
        toolOpen(null),
        toolOpen('https://a.test/page', { title: '页面' }),
        toolOpen('https://b.test/broken', { status: 'FAILED' }),
        toolSearch(['失败查询'], [], { status: 'FAILED', stage: 2 }),
        toolSearch(['未完成'], [], { status: 'WIP', stage: 3 }),
        { type: 'READ_LINK', results: [] },
        { type: 'SOMETHING_NEW', payload: 1 },
        response('正文'),
        templateResponse('模板正文'),
        contentRisk('注意甄别'),
      ], { parentId: 1, at: timeISO(BASE, 10) }),
    ],
  }))
  const { draft, stats } = convertConversation(document, row, {
    importedAt: BASE,
    resolveMedia: exportPath => (exportPath === 'chat_sessions/x_files/pic.png' ? { media: `${'a'.repeat(64)}.png`, size: 4096 } : undefined),
  })
  const assistant = draft.nodes.m2.message
  const types = assistant.blocks.map(block => block.type)
  assert.deepEqual(types, [
    'thinking',
    'server_tool_use',
    'web_search_tool_result',
    'thinking',
    'server_tool_use',
    'web_fetch_tool_result',
    'server_tool_use',
    'web_fetch_tool_result',
    'server_tool_use',
    'web_search_tool_result',
    'text',
    'text',
    'notice',
  ])
  // Two searches: one succeeded, one failed; the unfinished search leaves no trace.
  const searches = assistant.blocks.filter(block => block.type === 'web_search_tool_result')
  assert.equal(searches.length, 2)
  assert.equal(searches[0].content[0].type, 'web_search_result')
  assert.equal(searches[1].content[0].type, 'web_search_tool_result_error')
  // A TOOL_OPEN without a url is the exporter's stage marker, not a page.
  const fetches = assistant.blocks.filter(block => block.type === 'web_fetch_tool_result')
  assert.equal(fetches.length, 2)
  assert.equal(fetches[1].content.type, 'web_fetch_tool_result_error')
  // Reasoning time accumulates across the fragments of one reply.
  const thinkingBlocks = assistant.blocks.filter(block => block.type === 'thinking')
  assert.equal(thinkingBlocks[0].startedAt, BASE + 10_000)
  assert.equal(thinkingBlocks[0].endedAt - thinkingBlocks[0].startedAt, 2000)
  assert.equal(thinkingBlocks[1].endedAt - thinkingBlocks[1].startedAt, 3000)
  assert.equal(assistant.thinking, true)
  assert.equal(assistant.search, true)
  const notice = assistant.blocks.find(block => block.type === 'notice')
  assert.equal(notice.text, '注意甄别')
  assert.equal(assistant.blocks.filter(block => block.type === 'text').map(block => block.text).join(''), '正文模板正文')

  const user = draft.nodes.m1.message
  assert.equal(user.content, '看看这些')
  assert.equal(user.files.length, 2)
  assert.equal(user.files[0].isImage, false)
  assert.equal(user.files[0].local, true)
  assert.equal(user.files[0].media, undefined, 'a file whose bytes the export lacks keeps only its metadata')
  assert.equal(user.files[0].mimeType, 'application/pdf')
  assert.equal(user.files[1].media, `${'a'.repeat(64)}.png`)
  assert.match(user.files[1].fileId, /^local:/u)
  assert.equal(stats.restoredImages, 1)
  assert.equal(stats.notices, 1)
})

test('an untitled export is titled from its first question, and roots and times are kept', () => {
  const row = indexRow({ id: 'session-untitled', title: '', insertedAt: timeISO(BASE, 50), updatedAt: timeISO(BASE, 90) })
  const document = readDocument(sessionFile({
    id: 'session-untitled',
    title: '   ',
    currentMessageId: 3,
    insertedAt: timeISO(BASE, 50),
    updatedAt: timeISO(BASE, 90),
    messages: [
      message(1, 'USER', [request('第一行标题\n第二行内容')], { at: timeISO(BASE, 60) }),
      message(2, 'ASSISTANT', [response('旧回答')], { parentId: 1, at: timeISO(BASE, 70) }),
      message(3, 'USER', [request('改写后的第一问')], { parentId: null, at: timeISO(BASE, 80) }),
    ],
  }))
  const { draft } = convertConversation(document, row, { importedAt: BASE })
  assert.equal(draft.title, '改写后的第一问')
  assert.equal(draft.titleAuto, true)
  assert.equal(draft.createdAt, BASE + 50_000, 'the index time wins over the first message time')
  assert.equal(draft.updatedAt, BASE + 90_000)
  assert.equal(draft.source.kind, SOURCE_KIND)
  assert.equal(draft.source.id, 'session-untitled')
  assert.equal(draft.leafId, 'm3')
  assert.deepEqual(Object.keys(draft.nodes).sort(), ['m1', 'm2', 'm3'])
  assert.equal(draft.nodes.m1.parentId, null)
  assert.equal(draft.nodes.m3.parentId, null, 'an edited first question is its own root')
})

test('a specified title is kept and never replaced automatically', () => {
  const row = indexRow({ id: 'session-titled', title: '我的标题', insertedAt: timeISO(BASE), updatedAt: timeISO(BASE) })
  const document = readDocument(sessionFile({
    id: 'session-titled',
    title: '我的标题',
    currentMessageId: 2,
    messages: [
      message(1, 'USER', [request('完全不同的第一句')]),
      message(2, 'ASSISTANT', [templateResponse('该内容无法显示')], { parentId: 1, status: 'CONTENT_FILTER' }),
    ],
  }))
  const { draft } = convertConversation(document, row)
  assert.equal(draft.title, '我的标题')
  assert.equal(draft.titleAuto, false)
  const reply = draft.nodes.m2.message
  assert.equal(reply.status, 'done')
  assert.deepEqual(
    reply.blocks.map(block => [block.type, block.text]),
    [['text', '该内容无法显示']],
    'a filtered reply keeps the server wording and nothing else',
  )
})

test('the store merges imports, refuses duplicates by source, and persists the origin', async () => {
  const { store, cleanup } = await tempStore()
  try {
    const make = (sourceId, title) => {
      const row = indexRow({ id: sourceId, title, insertedAt: timeISO(BASE), updatedAt: timeISO(BASE) })
      const document = readDocument(sessionFile({
        id: sourceId,
        title,
        currentMessageId: 2,
        messages: [
          message(1, 'USER', [request(`${title} 的问题`)]),
          message(2, 'ASSISTANT', [response(`${title} 的回答`)], { parentId: 1 }),
        ],
      }))
      return convertConversation(document, row, { importedAt: BASE }).draft
    }
    const first = await store.adoptConversations([make('a', '会话A'), make('b', '会话B')])
    assert.equal(first.added.length, 2)
    assert.equal(first.rejected.length, 0)
    assert.equal(store.listSummaries().length, 2)
    assert.equal(store.listSummaries()[0].source.kind, SOURCE_KIND)
    assert.equal(store.findBySource(SOURCE_KIND, 'a').title, '会话A')
    assert.deepEqual([...store.importedSourceIds(SOURCE_KIND)].sort(), ['a', 'b'])

    const duplicate = await store.adoptConversations([make('a', '重复的A')])
    assert.equal(duplicate.added.length, 0)
    assert.equal(duplicate.rejected[0].reason, 'duplicate-source')
    assert.equal(store.listSummaries().length, 2)
    assert.ok(store.listSummaries().some(summary => summary.title === '会话A'), 'the first import is kept, not replaced')

    const emptyDraft = { ...make('c', '空会话'), nodes: {}, leafId: null }
    const empty = await store.adoptConversations([emptyDraft])
    assert.equal(empty.added.length, 0)
    assert.equal(empty.rejected[0].reason, 'empty')

    const savedFile = path.join(store.directory, 'state.json')
    const document = JSON.parse(await fs.readFile(savedFile, 'utf8'))
    assert.equal(document.conversations.length, 2)
    assert.equal(document.conversations[0].source.id, 'a')
    assert.equal(document.conversations[0].source.importedAt, BASE)

    const reloaded = new ChatStore(store.directory, { logger: { warn() {}, info() {} } })
    await reloaded.load()
    assert.equal(reloaded.listSummaries().length, 2)
    assert.equal(reloaded.findBySource(SOURCE_KIND, 'b').title, '会话B')
  } finally {
    await cleanup()
  }
})

test('an imported conversation rebuilds requests without its local attachments', async () => {
  const { store, cleanup } = await tempStore()
  try {
    const row = indexRow({ id: 'session-request', title: '继续对话', insertedAt: timeISO(BASE), updatedAt: timeISO(BASE) })
    const document = readDocument(sessionFile({
      id: 'session-request',
      title: '继续对话',
      currentMessageId: 6,
      messages: [
        message(1, 'USER', [request('问题一')]),
        message(2, 'ASSISTANT', [response('回答一')], { parentId: 1 }),
        message(3, 'USER', [files([{ id: 'pic', name: '图.png', isImage: true, exportPath: 'chat_sessions/y_files/pic.png' }])], { parentId: 2 }),
        message(4, 'ASSISTANT', [response('回答二')], { parentId: 3 }),
        message(5, 'USER', [files([{ id: 'doc', name: '报告.pdf', isImage: false }]), request('再问一次')], { parentId: 4 }),
        message(6, 'ASSISTANT', [response('回答三')], { parentId: 5 }),
      ],
    }))
    const { draft } = convertConversation(document, row, {
      importedAt: BASE,
      resolveMedia: () => ({ media: `${'b'.repeat(64)}.png`, size: 10 }),
    })
    const merged = await store.adoptConversations([draft])
    assert.equal(merged.added.length, 1)
    const conversation = store.getConversation(merged.added[0])
    const current = { id: 'next-user', role: 'user', content: '继续', files: [], createdAt: Date.now() }
    const built = buildRequestMessages([...conversation.messages, current], 'next-user', { reminder: '2026-01-01' })
    const serialized = JSON.stringify(built)
    assert.equal(serialized.includes('local:'), false, 'a local attachment marker never reaches the API body')
    assert.equal(serialized.includes('"image"'), false)
    assert.equal(serialized.includes('"document"'), false)
    // The image-only question has no replayable content, so its round is skipped,
    // while the text rounds around it are sent.
    assert.deepEqual(built.map(entry => entry.role), ['user', 'assistant', 'user', 'assistant', 'latest_reminder', 'user'])
    assert.equal(built[0].content, '问题一')
    assert.deepEqual(built[1].content, [{ type: 'text', text: '回答一' }])
    assert.equal(built[2].content, '再问一次')
    assert.deepEqual(built[3].content, [{ type: 'text', text: '回答三' }])
    assert.equal(built[5].content, '继续')
    assert.equal(serialized.includes('图.png'), false, 'the skipped image-only round left no trace')
  } finally {
    await cleanup()
  }
})

test('a conversation written before the import feature still loads unchanged', async () => {
  const { store, cleanup } = await tempStore()
  try {
    await fs.writeFile(path.join(store.directory, 'state.json'), JSON.stringify({
      version: 2,
      settings: { authMode: 'auto', thinking: false, search: false, systemPrompt: '' },
      folders: [],
      conversations: [{
        id: 'legacy',
        title: '旧会话',
        createdAt: BASE,
        updatedAt: BASE,
        leafId: 'u1',
        nodes: {
          u1: { parentId: null, message: { id: 'u1', role: 'user', content: '旧问题', files: [], createdAt: BASE } },
        },
      }],
    }))
    const reloaded = new ChatStore(store.directory, { logger: { warn() {}, info() {} } })
    await reloaded.load()
    const summary = reloaded.listSummaries()[0]
    assert.equal(summary.title, '旧会话')
    assert.equal(summary.source, null, 'a chat without an origin reports none')
    assert.deepEqual(reloaded.getConversation('legacy').messages[0].files, [])
  } finally {
    await cleanup()
  }
})
