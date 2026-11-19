import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { ChatService } from '../lib/service.js'

/** A Host context with only the Workspace registry the route reads. */
function contextWith(registry) {
  return {
    logger: { warn() {} },
    get(name) {
      return name === 'workspaceRegistry' ? registry : undefined
    },
    connection: {
      fetch: {
        register() { return async () => {} },
      },
    },
  }
}

/** A registry double that mirrors the native create/resolve contract. */
function registryWith({ existing, failCreate } = {}) {
  const calls = []
  return {
    calls,
    async resolveByPath(target) {
      calls.push(['resolveByPath', target])
      return existing
    },
    async create(target, title) {
      calls.push(['create', target, title])
      if (failCreate !== undefined) throw failCreate
      return existing ?? {
        id: 'ws-new',
        path: target,
        title: title ?? path.basename(target),
      }
    },
    list() {
      return existing === undefined ? [] : [existing]
    },
  }
}

function workspaceRequest(body) {
  return new Request('http://127.0.0.1/api/deepseek-chat/workspace', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function temporaryRoot(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'dsc-workspace-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  return root
}

test('creates a missing project folder and registers it through the native registry', async (t) => {
  const root = await temporaryRoot(t)
  const target = path.join(root, 'Stardew-Mod')
  const registry = registryWith()
  const service = new ChatService(contextWith(registry), {})

  const value = await service.createWorkspace(workspaceRequest({ path: target, title: '星露谷物语 Mod' }))

  assert.equal(value.created.directory, true)
  assert.equal(value.created.workspace, true)
  assert.deepEqual(value.workspace, { id: 'ws-new', title: '星露谷物语 Mod', path: target })
  assert.equal((await stat(target)).isDirectory(), true)
  assert.deepEqual(registry.calls, [
    ['resolveByPath', target],
    ['create', target, '星露谷物语 Mod'],
  ])
})

test('uses an existing directory without recreating it', async (t) => {
  const root = await temporaryRoot(t)
  const target = path.join(root, 'existing')
  await mkdir(target)
  const registry = registryWith()
  const service = new ChatService(contextWith(registry), {})

  const value = await service.createWorkspace(workspaceRequest({ path: target }))

  assert.equal(value.created.directory, false)
  assert.equal(value.created.workspace, true)
  assert.equal(value.workspace.title, 'existing')
  assert.equal(registry.calls.find(call => call[0] === 'create')[2], undefined)
})

test('reports an already registered workspace instead of creating a second one', async (t) => {
  const root = await temporaryRoot(t)
  const target = path.join(root, 'owned')
  await mkdir(target)
  const existing = { id: 'ws-owned', path: target, title: '既有工作区' }
  const registry = registryWith({ existing })
  const service = new ChatService(contextWith(registry), {})

  const value = await service.createWorkspace(workspaceRequest({ path: target, title: '新名字' }))

  assert.equal(value.created.workspace, false)
  assert.equal(value.created.directory, false)
  assert.equal(value.workspace.id, 'ws-owned')
  assert.equal(value.workspace.title, '既有工作区')
})

test('rejects a path that names a file', async (t) => {
  const root = await temporaryRoot(t)
  const target = path.join(root, 'occupied.txt')
  await writeFile(target, 'x')
  const service = new ChatService(contextWith(registryWith()), {})

  await assert.rejects(
    service.createWorkspace(workspaceRequest({ path: target })),
    error => error.code === 'NOT_A_DIRECTORY' && error.status === 400,
  )
})

test('rejects relative paths and paths the host cannot fix', async () => {
  const service = new ChatService(contextWith(registryWith()), {})
  await assert.rejects(
    service.createWorkspace(workspaceRequest({ path: 'relative/project' })),
    error => error.code === 'INVALID_REQUEST' && error.status === 400,
  )
  await assert.rejects(
    service.createWorkspace(workspaceRequest({ path: '' })),
    error => error.code === 'INVALID_REQUEST',
  )
  if (process.platform === 'win32') {
    // Rooted but drive-less: realpath would resolve it against the current drive.
    await assert.rejects(
      service.createWorkspace(workspaceRequest({ path: '\\projects\\x' })),
      error => error.code === 'INVALID_REQUEST',
    )
  }
})

test('reports an unavailable registry instead of pretending the workspace exists', async (t) => {
  const root = await temporaryRoot(t)
  const service = new ChatService(contextWith(undefined), {})
  await assert.rejects(
    service.createWorkspace(workspaceRequest({ path: path.join(root, 'x') })),
    error => error.code === 'WORKSPACE_UNAVAILABLE' && error.status === 501,
  )
})

test('keeps the created folder when registration fails and says so', async (t) => {
  const root = await temporaryRoot(t)
  const target = path.join(root, 'orphan')
  const registry = registryWith({ failCreate: new Error('registry offline') })
  const service = new ChatService(contextWith(registry), {})

  await assert.rejects(
    service.createWorkspace(workspaceRequest({ path: target })),
    error => error.code === 'WORKSPACE_CREATE_FAILED'
      && error.status === 502
      && error.message.includes('文件夹已创建'),
  )
  assert.equal((await stat(target)).isDirectory(), true)
})

test('bootstrap advertises workspace creation only when the registry can create', async () => {
  const available = await new ChatService(contextWith(registryWith()), {}).bootstrap()
  assert.equal(available.handoff.workspaceCreate, true)
  const unavailable = await new ChatService(contextWith(undefined), {}).bootstrap()
  assert.equal(unavailable.handoff.workspaceCreate, false)
})

test('creates the Agent session in the confirmed workspace with the brief as its first prompt', async () => {
  const calls = []
  const controller = {
    async create(options) {
      calls.push(['create', options])
      return { sessionId: 'session-1' }
    },
    async rename(request) { calls.push(['rename', request]) },
    async prompt(request) { calls.push(['prompt', request]) },
  }
  const registered = { id: 'ws-new', path: 'D:/Projects/Stardew-Mod', title: 'Stardew-Mod' }
  const ctx = {
    logger: { warn() {} },
    get(name) {
      if (name === 'workspaceRegistry') return registryWith({ existing: registered })
      if (name === 'sessionController') return controller
      return undefined
    },
    connection: { fetch: { register() { return async () => {} } } },
  }
  const service = new ChatService(ctx, {})
  const request = new Request('http://127.0.0.1/api/deepseek-chat/handoff/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      prompt: '## 目标\n实现 Stardew-Mod。',
      workspaceId: 'ws-new',
      title: '星露谷物语 Mod 开发',
      timeZone: 'Asia/Singapore',
    }),
  })

  const value = await service.handoffSend(request)

  assert.equal(value.sessionId, 'session-1')
  assert.equal(value.workspaceId, 'ws-new')
  assert.deepEqual(calls[0], ['create', { workspaceId: 'ws-new' }])
  assert.deepEqual(calls[1], ['rename', { sessionId: 'session-1', title: '星露谷物语 Mod 开发' }])
  assert.equal(calls[2][0], 'prompt')
  assert.equal(calls[2][1].sessionId, 'session-1')
  assert.deepEqual(calls[2][1].content, [{ type: 'text', text: '## 目标\n实现 Stardew-Mod。' }])
})
