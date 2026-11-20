/**
 * Import of a DeepSeek chat export through the real Host service.
 *
 * Every archive here is synthetic: the fixtures reproduce the exporter's
 * documented structure, never a real conversation. The tests drive the actual
 * routes the browser calls, so they cover upload, preview, the background job,
 * polling, deduplication, restart persistence, media serving, cancellation, and
 * the failure paths that must leave the existing history untouched.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ChatService } from '../lib/service.js'
import {
  TINY_PNG, contentRisk, exportZip, files, indexRow, message, request, response,
  sessionFile, sha256, templateResponse, think, timeISO, toolOpen, toolSearch,
} from './support/export-fixture.js'

const BASE = Date.UTC(2026, 0, 1, 8, 0, 0)

/** One isolated Chat service with a temporary DSH home. */
async function withService(run, config = {}) {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-import-'))
  const previousHome = process.env.DSH_HOME
  process.env.DSH_HOME = home
  const routes = new Map()
  const ctx = {
    logger: { warn() {}, info() {} },
    get() {
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
  const service = new ChatService(ctx, config)
  await service.ready()
  service.registerRoutes()
  try {
    await run({ service, routes, home })
  } finally {
    await service.dispose()
    if (previousHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousHome
    await fs.rm(home, { recursive: true, force: true })
  }
}

async function call(routes, routePath, { method = 'POST', body, headers = {}, search = '' } = {}) {
  const route = routes.get(routePath)
  assert.ok(route, `the route ${routePath} must be registered`)
  const request = new Request(`http://localhost${routePath}${search}`, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    ...(body === undefined ? {} : { body: typeof body === 'string' || body instanceof Uint8Array ? body : JSON.stringify(body) }),
  })
  const response = await route.fetch(request)
  const text = await response.text()
  let value
  try {
    value = JSON.parse(text)
  } catch {
    value = undefined
  }
  return { status: response.status, headers: response.headers, text, value, response }
}

/** Call a route whose body must stay unread, such as the media route. */
async function callBinary(routes, routePath, search = '') {
  const route = routes.get(routePath)
  assert.ok(route, `the route ${routePath} must be registered`)
  return route.fetch(new Request(`http://localhost${routePath}${search}`, { method: 'GET' }))
}

async function upload(routes, archive, name = 'deepseek_data.zip') {
  return call(routes, '/api/deepseek-chat/import/upload', {
    headers: {
      'content-type': 'application/zip',
      'x-file-name': encodeURIComponent(name),
      'content-length': String(archive.length),
    },
    body: archive,
  })
}

/** Poll a job until it settles. */
async function settle(routes, jobId, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const { status, value } = await call(routes, '/api/deepseek-chat/import/status', {
      method: 'GET',
      search: `?job=${encodeURIComponent(jobId)}`,
    })
    assert.equal(status, 200, `status must answer: ${JSON.stringify(value)}`)
    if (value.job.state !== 'running') return value
    if (Date.now() > deadline) throw new Error('the import job did not settle in time')
    await new Promise(resolve => setTimeout(resolve, 40))
  }
}

/** The three-conversation export most tests import. */
function standardExport(extra = {}) {
  const mediaPath = 'chat_sessions/aaa-files/0f0e-image.png'
  const plan = sessionFile({
    id: 'session-plan',
    title: '季度目标拆解',
    insertedAt: timeISO(BASE),
    updatedAt: timeISO(BASE, 600),
    currentMessageId: 4,
    messages: [
      message(1, 'USER', [request('帮我把季度目标拆成周计划')], { at: timeISO(BASE) }),
      message(2, 'ASSISTANT', [
        think('先确认目标口径', 2.5),
        toolSearch(['季度目标拆解'], [{ url: 'https://example.com/a', title: '拆解方法', snippet: '从目标到周', siteName: '示例站' }]),
        toolOpen('https://example.com/a', { title: '拆解方法' }),
        response('第一周：完成现状盘点。'),
        contentRisk(),
      ], { parentId: 1, at: timeISO(BASE, 5) }),
      message(3, 'USER', [files([{ id: 'file-image', name: '计划.png', isImage: true, size: TINY_PNG.length, exportPath: mediaPath }]), request('参考这张图再细化第二周')], { parentId: 2, at: timeISO(BASE, 400) }),
      message(4, 'ASSISTANT', [think('按图里的排期细化', 1.2), response('第二周：完成方案评审。')], { parentId: 3, at: timeISO(BASE, 410) }),
    ],
  })
  const branch = sessionFile({
    id: 'session-branch',
    title: '分支测试',
    insertedAt: timeISO(BASE, 1000),
    updatedAt: timeISO(BASE, 2000),
    currentMessageId: 4,
    messages: [
      message(1, 'USER', [request('原始问题')], { at: timeISO(BASE, 1000) }),
      message(2, 'ASSISTANT', [response('原始回答')], { parentId: 1, at: timeISO(BASE, 1010) }),
      message(3, 'USER', [request('改写的问题')], { parentId: 1, at: timeISO(BASE, 1100) }),
      message(4, 'ASSISTANT', [response('改写后的回答')], { parentId: 3, at: timeISO(BASE, 1110) }),
    ],
  })
  const unfinished = sessionFile({
    id: 'session-unfinished',
    title: '未完成的会话',
    insertedAt: timeISO(BASE, 3000),
    updatedAt: timeISO(BASE, 3100),
    currentMessageId: 4,
    messages: [
      message(1, 'USER', [request('一个长问题')], { at: timeISO(BASE, 3000) }),
      message(2, 'ASSISTANT', [think('思考到一半')], { parentId: 1, status: 'INCOMPLETE', at: timeISO(BASE, 3010) }),
      message(3, 'USER', [request('另一个问题')], { parentId: 2, at: timeISO(BASE, 3050) }),
      message(4, 'ASSISTANT', [templateResponse('抱歉，该回答因超时未能完成。')], { parentId: 3, status: 'TIMEOUT', at: timeISO(BASE, 3060) }),
    ],
  })
  return exportZip({
    sessions: [plan, branch, unfinished],
    media: [{ path: mediaPath, data: TINY_PNG }],
    ...extra,
  })
}

test('an export is previewed without touching the history', async () => {
  await withService(async ({ service, routes }) => {
    const { status, value } = await upload(routes, standardExport())
    assert.equal(status, 200, JSON.stringify(value))
    assert.equal(value.formatVersion, 3)
    assert.equal(value.stats.total, 3)
    assert.equal(value.stats.imported, 0)
    assert.equal(value.stats.importable, 3)
    assert.equal(typeof value.token, 'string')
    const titles = value.conversations.map(conversation => conversation.title)
    assert.deepEqual(titles, ['未完成的会话', '分支测试', '季度目标拆解'], 'newest first')
    assert.equal(value.conversations.find(row => row.sourceId === 'session-plan').messageCount, 4)
    assert.equal(service.store.listSummaries().length, 0, 'a preview writes nothing')
  })
})

test('selected conversations are imported with their content, branches and images', async () => {
  await withService(async ({ service, routes, home }) => {
    const { value: preview } = await upload(routes, standardExport())
    const start = await call(routes, '/api/deepseek-chat/import/start', {
      body: { token: preview.token, ids: ['session-plan', 'session-branch', 'session-unfinished'] },
    })
    assert.equal(start.status, 200, start.text)
    const final = await settle(routes, start.value.job.id)
    assert.equal(final.job.state, 'done')
    assert.equal(final.job.imported, 3)
    assert.equal(final.job.failed, 0)
    assert.equal(final.job.skipped, 0)
    assert.equal(final.conversations.length, 3, 'the sidebar is refreshed with the result')

    const summaries = service.store.listSummaries()
    const bySource = new Map(summaries.map(summary => [summary.source.id, summary]))
    assert.deepEqual([...bySource.keys()].sort(), ['session-branch', 'session-plan', 'session-unfinished'])
    assert.equal(bySource.get('session-plan').title, '季度目标拆解')
    assert.equal(bySource.get('session-plan').createdAt, BASE)
    assert.equal(bySource.get('session-plan').updatedAt, BASE + 600_000)
    assert.equal(bySource.get('session-plan').source.kind, 'deepseek-export')
    assert.equal(bySource.get('session-plan').source.importedAt !== null, true)

    const plan = service.store.getConversation(bySource.get('session-plan').id)
    assert.deepEqual(plan.messages.map(item => item.role), ['user', 'assistant', 'user', 'assistant'])
    assert.equal(plan.messages[0].content, '帮我把季度目标拆成周计划')
    assert.equal(plan.messages[0].createdAt, BASE)

    const firstReply = plan.messages[1]
    assert.equal(firstReply.status, 'done')
    assert.equal(firstReply.thinking, true)
    assert.equal(firstReply.search, true)
    const thinking = firstReply.blocks.find(block => block.type === 'thinking')
    assert.equal(thinking.thinking, '先确认目标口径')
    assert.equal(thinking.endedAt - thinking.startedAt, 2500, 'the reported reasoning time is kept')
    const searchBlock = firstReply.blocks.find(block => block.type === 'web_search_tool_result')
    assert.equal(searchBlock.content[0].url, 'https://example.com/a')
    assert.equal(searchBlock.content[0].site_name, '示例站')
    const searchCall = firstReply.blocks.find(block => block.type === 'server_tool_use' && block.kind === 'search')
    assert.equal(searchBlock.tool_use_id, searchCall.id, 'the search step and its results must pair up')
    assert.equal(firstReply.blocks.filter(block => block.type === 'text').map(block => block.text).join(''), '第一周：完成现状盘点。')
    const notice = firstReply.blocks.find(block => block.type === 'notice')
    assert.equal(notice.kind, 'content_risk')

    const imageMessage = plan.messages[2]
    assert.equal(imageMessage.files.length, 1)
    const image = imageMessage.files[0]
    assert.equal(image.isImage, true)
    assert.equal(image.local, true)
    assert.equal(image.name, '计划.png')
    assert.equal(image.size, TINY_PNG.length)
    assert.match(image.media, /^[0-9a-f]{64}\.png$/u)
    assert.equal(image.media, `${sha256(TINY_PNG)}.png`, 'the media name is a content address')
    const stored = path.join(home, 'deepseek-chat', 'imports', 'media', image.media)
    assert.deepEqual(await fs.readFile(stored), TINY_PNG, 'the image bytes are stored locally')

    const media = await callBinary(routes, '/api/deepseek-chat/import/media', `?f=${encodeURIComponent(image.media)}`)
    assert.equal(media.status, 200)
    assert.equal(media.headers.get('content-type'), 'image/png')
    assert.equal(media.headers.get('x-content-type-options'), 'nosniff')
    assert.deepEqual(Buffer.from(await media.arrayBuffer()), TINY_PNG)

    // The branch: the export's current message is the active leaf, and the
    // sibling question stays reachable as a version.
    const branch = service.store.getConversation(bySource.get('session-branch').id)
    const visible = conversation => conversation.messages.map(item => (
      item.role === 'user' ? item.content : item.blocks.filter(block => block.type === 'text').map(block => block.text).join('')
    ))
    assert.deepEqual(visible(branch), ['原始问题', '改写的问题', '改写后的回答'])
    assert.equal(Object.keys(branch.nodes).length, 4, 'the abandoned branch is kept')
    const presented = service.store.presentConversation(branch)
    const edited = presented.messages[1]
    assert.deepEqual(edited.version, { index: 2, count: 2 })
    const switched = await service.store.selectVersion(branch.id, edited.id, -1)
    assert.deepEqual(visible(switched.conversation), ['原始问题', '原始回答'])

    // Unfinished replies stay visibly unfinished and keep the server wording.
    const unfinished = service.store.getConversation(bySource.get('session-unfinished').id)
    assert.equal(unfinished.messages[1].status, 'stopped')
    assert.equal(unfinished.messages[3].status, 'stopped')
    assert.equal(unfinished.messages[3].blocks.find(block => block.type === 'text').text, '抱歉，该回答因超时未能完成。')
  })
})

test('importing the same export twice creates no duplicate chat', async () => {
  await withService(async ({ service, routes, home }) => {
    const archive = standardExport()
    const first = await upload(routes, archive)
    const started = await call(routes, '/api/deepseek-chat/import/start', {
      body: { token: first.value.token, ids: ['session-plan', 'session-branch'] },
    })
    await settle(routes, started.value.job.id)
    assert.equal(service.store.listSummaries().length, 2)

    const second = await upload(routes, archive)
    assert.equal(second.value.stats.imported, 2, 'the preview marks what is already imported')
    assert.equal(second.value.conversations.filter(row => row.imported).length, 2)
    const again = await call(routes, '/api/deepseek-chat/import/start', {
      body: { token: second.value.token, ids: ['session-plan', 'session-branch'] },
    })
    const final = await settle(routes, again.value.job.id)
    assert.equal(final.job.imported, 0)
    assert.equal(final.job.skipped, 2)
    assert.equal(service.store.listSummaries().length, 2, 'no chat was created twice')
    const files = await fs.readdir(path.join(home, 'deepseek-chat'))
    assert.ok(
      files.some(name => name.startsWith('state.json.import-backup-')),
      'the previous history is backed up before the second import writes',
    )
  })
})

test('imported history survives a restart and stays searchable', async () => {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-import-restart-'))
  const previousHome = process.env.DSH_HOME
  process.env.DSH_HOME = home
  const buildContext = (routes) => ({
    logger: { warn() {}, info() {} },
    get() {
      return undefined
    },
    connection: { fetch: { register(route) { routes.set(route.path, route); return async () => {} } } },
    effect(callback) { callback(); return () => {} },
  })
  try {
    const routes = new Map()
    const service = new ChatService(buildContext(routes), {})
    await service.ready()
    service.registerRoutes()
    const { value: preview } = await upload(routes, standardExport())
    const start = await call(routes, '/api/deepseek-chat/import/start', { body: { token: preview.token, ids: ['session-plan'] } })
    await settle(routes, start.value.job.id)
    const id = service.store.listSummaries()[0].id
    await service.dispose()

    const routes2 = new Map()
    const restarted = new ChatService(buildContext(routes2), {})
    await restarted.ready()
    restarted.registerRoutes()
    const summaries = restarted.store.listSummaries()
    assert.equal(summaries.length, 1)
    assert.equal(summaries[0].id, id)
    assert.equal(summaries[0].source.id, 'session-plan')
    const loaded = await call(routes2, '/api/deepseek-chat/conversation', { body: { action: 'get', id } })
    assert.equal(loaded.status, 200)
    assert.equal(loaded.value.conversation.messages.length, 4)
    const found = await call(routes2, '/api/deepseek-chat/conversation', { body: { action: 'search', query: '周计划' } })
    assert.equal(found.value.results.length, 1, 'an imported chat is found by history search')
    const noImage = loaded.value.conversation.messages[2].files[0]
    assert.equal(noImage.media, `${sha256(TINY_PNG)}.png`, 'the media handle survives the restart')
    await restarted.dispose()
    const media = await fs.readFile(path.join(home, 'deepseek-chat', 'imports', 'media', noImage.media))
    assert.deepEqual(media, TINY_PNG)
  } finally {
    if (previousHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousHome
    await fs.rm(home, { recursive: true, force: true })
  }
})

test('a broken conversation does not stop the others, and a broken file changes nothing', async () => {
  await withService(async ({ service, routes }) => {
    const good = sessionFile({
      id: 'session-good',
      title: '正常会话',
      messages: [
        message(1, 'USER', [request('你好')]),
        message(2, 'ASSISTANT', [response('你好，有什么可以帮你？')], { parentId: 1 }),
      ],
    })
    const broken = sessionFile({
      id: 'session-broken',
      title: '损坏会话',
      messages: [
        // The parent id points at a message this file does not contain.
        message(2, 'ASSISTANT', [response('无父节点的回答')], { parentId: 99 }),
      ],
    })
    const { value: preview } = await upload(routes, exportZip({ sessions: [good, broken] }))
    const start = await call(routes, '/api/deepseek-chat/import/start', {
      body: { token: preview.token, ids: ['session-good', 'session-broken'] },
    })
    const final = await settle(routes, start.value.job.id)
    assert.equal(final.job.state, 'done')
    assert.equal(final.job.imported, 1)
    assert.equal(final.job.failed, 1)
    assert.equal(final.job.failures[0].sourceId, 'session-broken')
    assert.equal(final.job.failures[0].code, 'BAD_SESSION')
    assert.equal(service.store.listSummaries().length, 1)

    const before = service.store.listSummaries().length
    const notZip = await upload(routes, Buffer.from('this is not an archive'))
    assert.equal(notZip.status, 400)
    assert.equal(notZip.value.error.code, 'NOT_ZIP')
    assert.equal(service.store.listSummaries().length, before, 'a bad upload leaves the history alone')

    const future = await upload(routes, exportZip({
      sessions: [good],
      manifest: { export_format_version: 99 },
    }))
    assert.equal(future.status, 400)
    assert.equal(future.value.error.code, 'UNSUPPORTED_VERSION')

    const noIndex = await upload(routes, exportZip({ sessions: [good], index: [] }))
    assert.equal(noIndex.status, 400, 'an empty index is not an export')
    assert.equal(noIndex.value.error.code, 'NO_CONVERSATIONS')
    assert.equal(service.store.listSummaries().length, before)

    const { value: secondPreview } = await upload(routes, exportZip({ sessions: [good] }))
    const noSelection = await call(routes, '/api/deepseek-chat/import/start', {
      body: { token: secondPreview.token, ids: ['session-not-in-archive'] },
    })
    assert.equal(noSelection.status, 400)
    assert.equal(noSelection.value.error.code, 'NO_SELECTION')
    assert.equal(service.store.listSummaries().length, before)
  })
})

test('a hostile archive cannot escape the data directory or exhaust memory', async () => {
  await withService(async ({ service, routes, home }) => {
    const traversal = '../../escaped.txt'
    const archive = standardExport({
      extra: [{ name: traversal, data: 'escaped' }],
    })
    const { value: preview } = await upload(routes, archive)
    const start = await call(routes, '/api/deepseek-chat/import/start', { body: { token: preview.token, ids: ['session-plan'] } })
    const final = await settle(routes, start.value.job.id)
    assert.equal(final.job.imported, 1)
    await assert.rejects(fs.access(path.join(home, '..', 'escaped.txt')), 'nothing is written outside the data directory')
    await assert.rejects(fs.access(path.join(home, 'escaped.txt')))
    assert.equal(service.store.listSummaries().length, 1)

    // An entry that declares a huge uncompressed size is refused before inflation.
    const bomb = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-import-bomb-'))
    try {
      const bombArchive = path.join(bomb, 'bomb.zip')
      await fs.writeFile(bombArchive, exportZip({
        sessions: [sessionFile({ id: 'session-bomb', title: '大文件', messages: [message(1, 'USER', [request('x')])] })],
        extra: [{ name: 'chat_sessions/bomb.json', data: Buffer.alloc(4096, 0x20), declaredSize: 200 * 1024 * 1024 }],
      }))
      const { ZipArchive } = await import('../lib/import/zip.js')
      const opened = await ZipArchive.open(bombArchive, { maxEntryBytes: 1024 * 1024 })
      await assert.rejects(opened.read('chat_sessions/bomb.json'), error => error.code === 'ENTRY_TOO_LARGE')
      await opened.close()
    } finally {
      await fs.rm(bomb, { recursive: true, force: true })
    }
  })
})

test('media cannot be fetched outside the media store', async () => {
  await withService(async ({ routes }) => {
    for (const name of ['../state.json', 'state.json', `${'a'.repeat(64)}.png`, 'no-such.png']) {
      const result = await call(routes, '/api/deepseek-chat/import/media', { method: 'GET', search: `?f=${encodeURIComponent(name)}` })
      assert.equal(result.status, 404, `media ${name} must not be served`)
    }
  })
})

test('a cancelled import keeps what it already wrote and reports the stop', async () => {
  await withService(async ({ service, routes }) => {
    // Enough conversations that the cancel lands before the job can finish.
    const sessions = Array.from({ length: 150 }, (_, index) => sessionFile({
      id: `session-${String(index).padStart(3, '0')}`,
      title: `会话 ${index}`,
      insertedAt: timeISO(BASE, index),
      updatedAt: timeISO(BASE, index),
      currentMessageId: 2,
      messages: [
        message(1, 'USER', [request(`问题 ${index}`)], { at: timeISO(BASE, index) }),
        message(2, 'ASSISTANT', [response(`回答 ${index}`)], { parentId: 1, at: timeISO(BASE, index + 1) }),
      ],
    }))
    const { value: preview } = await upload(routes, exportZip({ sessions }))
    assert.equal(preview.stats.total, 150)
    const started = await call(routes, '/api/deepseek-chat/import/start', {
      body: { token: preview.token, ids: preview.conversations.map(row => row.sourceId) },
    })
    const cancelled = await call(routes, '/api/deepseek-chat/import/cancel', { body: { job: started.value.job.id } })
    assert.equal(cancelled.status, 200)
    const final = await settle(routes, started.value.job.id)
    assert.equal(final.job.state, 'cancelled')
    assert.ok(final.job.done < 150, 'the job must stop before the end')
    assert.equal(final.conversations.length, final.job.imported, 'the written history matches the reported count')
    assert.equal(service.store.listSummaries().length, final.job.imported)
    const late = await call(routes, '/api/deepseek-chat/import/cancel', { body: { job: started.value.job.id } })
    assert.equal(late.status, 200, 'cancelling a settled job is not an error')
    assert.equal(late.value.job.state, 'cancelled')
    const unknown = await call(routes, '/api/deepseek-chat/import/status', { method: 'GET', search: '?job=missing' })
    assert.equal(unknown.status, 404)
  })
})

test('the export index controls the preview, and a partial selection imports only itself', async () => {
  await withService(async ({ service, routes }) => {
    const sessions = ['one', 'two', 'three'].map((name, index) => sessionFile({
      id: `session-${name}`,
      title: `会话${name}`,
      insertedAt: timeISO(BASE, index * 10),
      updatedAt: timeISO(BASE, index * 10),
      messages: [
        message(1, 'USER', [request(`问题 ${name}`)], { at: timeISO(BASE, index * 10) }),
        message(2, 'ASSISTANT', [response(`回答 ${name}`)], { parentId: 1, at: timeISO(BASE, index * 10 + 5) }),
      ],
    }))
    const index = sessions.map((document, position) => indexRow({
      id: document.id,
      title: document.title,
      messageCount: document.messages.length,
      insertedAt: document.inserted_at,
      updatedAt: document.updated_at,
      pinned: position === 1,
    }))
    const { value: preview } = await upload(routes, exportZip({ sessions, index }))
    assert.deepEqual(preview.conversations.map(row => row.sourceId), ['session-three', 'session-two', 'session-one'])
    assert.equal(preview.conversations[1].pinned, true)
    const start = await call(routes, '/api/deepseek-chat/import/start', { body: { token: preview.token, ids: ['session-two'] } })
    const final = await settle(routes, start.value.job.id)
    assert.equal(final.job.total, 1)
    assert.equal(final.job.imported, 1)
    const summaries = service.store.listSummaries()
    assert.equal(summaries.length, 1)
    assert.equal(summaries[0].source.id, 'session-two')
    assert.equal(summaries[0].pinned, true, 'the exported pin state is kept')
    // A token is single-use: the staged archive is removed when the job settles.
    const reused = await call(routes, '/api/deepseek-chat/import/start', {
      body: { token: preview.token, ids: ['session-one'] },
    })
    assert.equal(reused.status, 410)
    assert.equal(reused.value.error.code, 'TOKEN_EXPIRED')
    const { value: secondPreview } = await upload(routes, exportZip({ sessions, index }))
    const stray = await call(routes, '/api/deepseek-chat/import/start', {
      body: { token: secondPreview.token, ids: ['session-not-in-archive'] },
    })
    assert.equal(stray.status, 400)
    assert.equal(stray.value.error.code, 'NO_SELECTION')
  })
})

test('the import routes are advertised in the bootstrap and reject unknown tokens', async () => {
  await withService(async ({ routes }) => {
    const boot = await call(routes, '/api/deepseek-chat/bootstrap', { method: 'GET' })
    assert.equal(boot.value.import.enabled, true)
    assert.ok(boot.value.import.maxUploadBytes >= 64 * 1024 * 1024)
    const stale = await call(routes, '/api/deepseek-chat/import/start', {
      body: { token: '00000000-0000-4000-8000-000000000000', ids: ['x'] },
    })
    assert.equal(stale.status, 410)
    assert.equal(stale.value.error.code, 'TOKEN_EXPIRED')
    const malformed = await call(routes, '/api/deepseek-chat/import/start', { body: { token: '../etc', ids: ['x'] } })
    assert.equal(malformed.status, 400)
  })
})
