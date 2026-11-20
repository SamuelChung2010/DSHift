/**
 * Host side of DeepSeek Chat mode: route handlers, DeepSeek request assembly,
 * streamed reply persistence, uploads, settings, and credential status.
 */

import path from 'node:path'
import os from 'node:os'
import { readFileSync } from 'node:fs'
import { mkdir, readFile, stat } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import {
  ApiError, authSnapshot, isImageFile, resolveAuth, streamMessage, uploadFile, uploadPurpose,
} from './api.js'
import {
  CHAT_MODEL, DEFAULT_SYSTEM_PROMPT, applyEvent, buildContinuationMessages,
  buildHandoffRequest, buildRequestMessages, canContinueReply, createLatestReminder,
  fallbackHandoffBrief, getReplyText, normalizeTitle, serverTools, settleReply, thinkingParams,
} from './protocol.js'
import {
  DEFAULT_MODEL, MODEL_CATALOG, ModelConfigStore, findModel, resolveEffort, resolveModelId,
} from './model-config.js'
import { MemoryStore } from './memory-store.js'
import { MemoryService } from './memory.js'
import { normalizeMemoryContent } from './memory-text.js'
import { ChatStore } from './store.js'
import { ChatImportManager, ImportError } from './import/index.js'

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
}

const NDJSON_HEADERS = {
  'content-type': 'application/x-ndjson; charset=utf-8',
  'cache-control': 'no-store',
  'x-accel-buffering': 'no',
}

const MAX_TEXT = 100_000
const MAX_FILES = 10
const MAX_JSON_BYTES = 1_000_000
/** How many imported conversations one memory-extraction batch may analyze. */
const IMPORT_MEMORY_MAX_SESSIONS = 20
const MAX_USER_DATA_BYTES = 32 * 1024 * 1024
/** How long one successful account-name read stands in for the next greeting. */
const PROFILE_TTL_MS = 60 * 1000

function json(value, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  })
}

function errorPayload(error) {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      code: error.code,
      kind: error.kind,
      status: error.status,
    }
  }
  if (error instanceof ImportError) {
    return {
      message: error.message,
      code: error.code,
      kind: 'import',
      status: error.status,
    }
  }
  return {
    message: error instanceof Error ? error.message : String(error),
    code: 'INTERNAL',
    kind: 'internal',
  }
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

function errorResponse(error) {
  const payload = errorPayload(error)
  const status = error instanceof ApiError
    ? (error.code === 'AUTH_REQUIRED' ? 401 : error.status ?? (error.kind === 'network' ? 502 : 400))
    : error instanceof ImportError ? error.status : 500
  return json({ error: payload }, status)
}

async function readJson(request) {
  const declared = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declared) && declared > MAX_JSON_BYTES) {
    throw new ApiError('请求体过大。', { code: 'PAYLOAD_TOO_LARGE', status: 413 })
  }
  const text = await request.text()
  if (text.length > MAX_JSON_BYTES) {
    throw new ApiError('请求体过大。', { code: 'PAYLOAD_TOO_LARGE', status: 413 })
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError('请求体不是有效 JSON。', { code: 'INVALID_JSON', status: 400 })
  }
}

function sanitizeFiles(input) {
  if (!Array.isArray(input)) return []
  return input.slice(0, MAX_FILES).flatMap((file) => {
    if (file === null || typeof file !== 'object') return []
    const fileId = typeof file.fileId === 'string' ? file.fileId.trim() : ''
    if (fileId === '') return []
    return [{
      id: typeof file.id === 'string' && file.id !== '' ? file.id : randomUUID(),
      fileId,
      name: typeof file.name === 'string' ? file.name.slice(0, 200) : 'file',
      size: typeof file.size === 'number' && Number.isFinite(file.size) ? file.size : 0,
      mimeType: typeof file.mimeType === 'string' ? file.mimeType : '',
      isImage: file.isImage === true,
    }]
  })
}

function sanitizeSettings(input) {
  const patch = {}
  if (input === null || typeof input !== 'object') return patch
  if (input.authMode === 'auto' || input.authMode === 'account' || input.authMode === 'api-key') patch.authMode = input.authMode
  if (typeof input.thinking === 'boolean') patch.thinking = input.thinking
  if (typeof input.search === 'boolean') patch.search = input.search
  if (typeof input.systemPrompt === 'string') patch.systemPrompt = input.systemPrompt.slice(0, 8000)
  return patch
}

function resolveConfig(config) {
  const value = config !== null && typeof config === 'object' ? config : {}
  const positive = (input, fallback) => (typeof input === 'number' && Number.isFinite(input) && input > 0 ? Math.floor(input) : fallback)
  return {
    baseURL: typeof value.baseURL === 'string' && value.baseURL.trim() !== ''
      ? value.baseURL.trim()
      : 'https://api.deepseek.com/anthropic/v1',
    maxUploadBytes: positive(value.maxUploadBytes, 64 * 1024 * 1024),
    requestTimeoutMs: positive(value.requestTimeoutMs, 15 * 60 * 1000),
    heartbeatMs: positive(value.heartbeatMs, 15_000),
    handoffTimeoutMs: positive(value.handoffTimeoutMs, 90_000),
    // The import's own upload cap; everything else keeps the importer defaults.
    importLimits: positive(value.maxImportBytes, 0) > 0
      ? { maxUploadBytes: positive(value.maxImportBytes, 0) }
      : {},
    memoryTimeoutMs: positive(value.memoryTimeoutMs, 60_000),
  }
}

function dataDirectory() {
  const home = process.env.DSH_HOME
  return path.join(home !== undefined && home !== '' ? home : path.join(os.homedir(), '.dsh'), 'deepseek-chat')
}

/** Client identity reported to the Platform account API; a source launch may lack the manifest. */
let cachedAppVersion
function appVersion() {
  if (cachedAppVersion !== undefined) return cachedAppVersion
  cachedAppVersion = '0.1.0'
  const installDir = process.env.DSH_INSTALL_DIR
  if (typeof installDir === 'string' && installDir !== '') {
    try {
      const manifest = JSON.parse(readFileSync(path.join(installDir, 'package.json'), 'utf8'))
      if (typeof manifest?.version === 'string' && manifest.version !== '') cachedAppVersion = manifest.version
    } catch {
      // The fallback still identifies the client; only display personalization depends on it.
    }
  }
  return cachedAppVersion
}

/**
 * The display name of a ready Platform profile, or null when the account has
 * none. Contact details are deliberately not substituted: a greeting handle is
 * a display name, not an email address or phone number.
 */
export function accountDisplayName(profile) {
  if (profile === null || typeof profile !== 'object' || profile.status !== 'ready') return null
  const name = typeof profile.value?.name === 'string' ? profile.value.name.trim() : ''
  return name === '' ? null : name
}

/** Locale tag for one profile read; only the two shipped UI languages reach the Platform. */
function profileLocale(request) {
  try {
    return new URL(request?.url ?? '', 'http://localhost').searchParams.get('locale') === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

export class ChatService {
  constructor(ctx, config) {
    this.ctx = ctx
    this.config = resolveConfig(config)
    this.logger = ctx.logger ?? console
    this.store = new ChatStore(dataDirectory(), { logger: this.logger })
    this.modelConfig = new ModelConfigStore(dataDirectory(), { logger: this.logger })
    // One importer per service: it owns the staged archive uploads, the local
    // media store, and the single running import job.
    this.importer = new ChatImportManager({
      store: this.store,
      directory: dataDirectory(),
      logger: this.logger,
      limits: this.config.importLimits,
    })
    this.memoryStore = new MemoryStore(dataDirectory(), { logger: this.logger })
    this.memory = new MemoryService({
      store: this.memoryStore,
      logger: this.logger,
      generate: args => this.generateMemoryText(args),
      timeouts: {
        extraction: this.config.memoryTimeoutMs,
        summary: this.config.memoryTimeoutMs,
        assist: this.config.memoryTimeoutMs,
      },
    })
    this.readyPromise = null
    this.routes = []
    this.active = new Map()
    this.pending = new Set()
    /** Cancels in-flight memory model work when the plugin unloads. */
    this.memoryAbort = new AbortController()
    this.disposed = false
    this.profileCache = { at: 0, value: { name: null } }
    this.profilePending = null
  }

  ready() {
    if (this.readyPromise === null) {
      this.readyPromise = Promise.all([this.store.load(), this.modelConfig.load(), this.memoryStore.load()])
    }
    return this.readyPromise
  }

  registerRoutes() {
    const register = (route) => {
      const dispose = this.ctx.connection.fetch.register(route)
      this.routes.push(dispose)
    }
    register({
      path: '/api/deepseek-chat/bootstrap',
      methods: ['GET'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.bootstrap()),
    })
    register({
      path: '/api/deepseek-chat/profile',
      methods: ['GET'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.profile(request)),
    })
    register({
      path: '/api/deepseek-chat/conversation',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.conversation(request)),
    })
    register({
      path: '/api/deepseek-chat/upload',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.upload(request)),
    })
    register({
      path: '/api/deepseek-chat/stream',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.stream(request),
    })
    register({
      path: '/api/deepseek-chat/settings',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.updateSettings(request)),
    })
    register({
      path: '/api/deepseek-chat/model',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.modelConfigRoute(request)),
    })
    register({
      path: '/api/deepseek-chat/memory',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.memoryRoute(request)),
    })
    register({
      path: '/api/deepseek-chat/key',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.updateKey(request)),
    })
    register({
      path: '/api/deepseek-chat/workspace',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.createWorkspace(request)),
    })
    register({
      path: '/api/deepseek-chat/handoff',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.handoffBrief(request)),
    })
    register({
      path: '/api/deepseek-chat/handoff/send',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.handoffSend(request)),
    })
    // DeepSeek chat-export import: a staged upload, then a polled background job.
    // The ZIP is read locally by this Host process and never leaves it.
    register({
      path: '/api/deepseek-chat/import/upload',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.importer.ingest(
        request,
        decodeURIComponent(request.headers.get('x-file-name') ?? ''),
      )),
    })
    register({
      path: '/api/deepseek-chat/import/start',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, async () => this.importer.start(await readJson(request))),
    })
    register({
      path: '/api/deepseek-chat/import/status',
      methods: ['GET'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.importStatus(request)),
    })
    register({
      path: '/api/deepseek-chat/import/cancel',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, async () => {
        const body = await readJson(request)
        return this.importer.cancel(typeof body?.job === 'string' ? body.job : '')
      }),
    })
    register({
      path: '/api/deepseek-chat/import/discard',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, async () => {
        const body = await readJson(request)
        const token = typeof body?.token === 'string' ? body.token : ''
        return { discarded: await this.importer.dropStaged(token) }
      }),
    })
    register({
      path: '/api/deepseek-chat/import/media',
      methods: ['GET'],
      requestBody: 'buffered',
      fetch: request => this.importMedia(request),
    })
  }

  /** One import progress poll; `job` names the running or finished job. */
  importStatus(request) {
    let job = ''
    try {
      job = new URL(request.url, 'http://localhost').searchParams.get('job') ?? ''
    } catch {
      job = ''
    }
    const status = this.importer.status(job)
    if (status === null) {
      throw new ImportError('NOT_FOUND', 'the import job is unknown or has expired', { status: 404 })
    }
    return status
  }

  /**
   * Serve one image recovered from an import. The name is a content address, so
   * the response is immutable; an SVG is additionally served with a policy that
   * keeps an opened file from running any script it carries.
   */
  async importMedia(request) {
    try {
      await this.ready()
      let name = ''
      try {
        name = new URL(request.url, 'http://localhost').searchParams.get('f') ?? ''
      } catch {
        name = ''
      }
      const file = await this.importer.mediaFile(name)
      if (file === undefined) {
        return new Response('not found', { status: 404, headers: { 'cache-control': 'no-store' } })
      }
      const bytes = await readFile(file.path)
      return new Response(bytes, {
        status: 200,
        headers: {
          'content-type': file.contentType,
          'content-length': String(bytes.length),
          'cache-control': 'private, max-age=31536000, immutable',
          'x-content-type-options': 'nosniff',
          ...(file.contentType === 'image/svg+xml'
            ? { 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox" }
            : {}),
        },
      })
    } catch (error) {
      this.logger.warn?.('deepseek-chat: imported media could not be served', errorMessage(error))
      return new Response('not found', { status: 404, headers: { 'cache-control': 'no-store' } })
    }
  }

  async guard(_request, handler) {
    try {
      await this.ready()
      if (this.disposed) throw new ApiError('Chat 插件已卸载。', { code: 'DISPOSED', status: 503 })
      const value = await handler()
      return json(value)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'ABORTED') {
        return json({ error: errorPayload(error) }, 499)
      }
      this.logger.warn?.('deepseek-chat: request failed', error instanceof Error ? error.message : error)
      return errorResponse(error)
    }
  }

  async auth() {
    return authSnapshot(this.ctx, { ...this.store.getSettings(), baseURL: this.config.baseURL })
  }

  async bootstrap() {
    const settings = this.store.getSettings()
    const summaries = this.store.listSummaries()
    // Drop model overrides whose conversation was removed outside this route
    // (an older store, or an interrupted delete) before publishing them.
    await this.modelConfig.prune(summaries.map(item => item.id))
    const workspaces = this.listWorkspaces()
    const registry = this.hostService('workspaceRegistry')
    const defaults = this.modelConfig.getDefaults()
    const defaultModel = findModel(defaults.model) ?? findModel(DEFAULT_MODEL)
    return {
      version: 2,
      // `model` is the default-model summary for older clients; `models`
      // carries the full catalog those clients ignore.
      model: { id: defaultModel.id, name: defaultModel.name },
      models: MODEL_CATALOG,
      modelConfig: this.modelConfig.snapshot(),
      settings,
      conversations: summaries,
      folders: this.store.listFolders(),
      auth: await this.auth(),
      workspaces,
      handoff: {
        enabled: this.hostService('sessionController') !== undefined,
        // Creation is a separate Host capability: the browser only offers the
        // inline form when this Host half can create the folder and register it.
        workspaceCreate: registry !== undefined && typeof registry.create === 'function',
      },
      // Chat-history import. Older Host halves omit this block and the browser
      // hides the entry instead of offering a surface that cannot work.
      import: {
        enabled: true,
        maxUploadBytes: this.importer.limits.maxUploadBytes,
      },
      limits: {
        maxFiles: MAX_FILES,
        maxUploadBytes: this.config.maxUploadBytes,
        maxUserDataBytes: MAX_USER_DATA_BYTES,
        maxText: MAX_TEXT,
      },
      dataDir: dataDirectory(),
    }
  }

  /**
   * Read or write the model preference. The browser sends `conversationId: null`
   * to change the default for new conversations, or a conversation id to pin a
   * choice to that one conversation.
   */
  async modelConfigRoute(request) {
    const body = await readJson(request)
    const action = body?.action
    if (action === 'get') {
      return {
        models: MODEL_CATALOG,
        modelConfig: this.modelConfig.snapshot(),
      }
    }
    if (action !== 'set') throw new ApiError('未知的模型操作。', { code: 'INVALID_REQUEST', status: 400 })
    if (typeof body?.model === 'string' && findModel(body.model) === undefined) {
      throw new ApiError(`不支持的模型：${body.model.slice(0, 80)}`, { code: 'INVALID_MODEL', status: 400 })
    }
    // The effort is clamped by the store to the model's real tiers, so an alias
    // or an outdated client value can never reach the request raw.
    const conversationId = typeof body?.conversationId === 'string' && body.conversationId !== ''
      ? body.conversationId
      : null
    if (conversationId !== null && this.store.getConversation(conversationId) === undefined) {
      throw new ApiError('会话不存在。', { code: 'NOT_FOUND', status: 404 })
    }
    const modelConfig = await this.modelConfig.set(conversationId, body)
    return { models: MODEL_CATALOG, modelConfig, conversationId }
  }

  /**
   * The signed-in DeepSeek account's display name for the personalized greeting.
   * Personalization is optional: a signed-out account, an absent account service,
   * or a failed Platform read all answer without an error, and the browser
   * falls back to its localized greeting. `resolved: false` tells the browser
   * that a temporary failure happened, so it keeps the last known name instead
   * of clearing it.
   */
  async profile(request) {
    const auth = await this.auth()
    if (auth.accountSignedIn !== true) return { name: null, signedIn: false, resolved: true }
    const now = Date.now()
    if (now - this.profileCache.at < PROFILE_TTL_MS) return this.profileCache.value
    if (this.profilePending !== null) return this.profilePending
    const pending = this.readProfile(profileLocale(request))
    this.profilePending = pending
    try {
      const value = await pending
      this.profileCache = { at: Date.now(), value }
      return value
    } finally {
      if (this.profilePending === pending) this.profilePending = null
    }
  }

  /**
   * Read the display name from the optional account service exactly once per
   * cache window. Any failure is an absent name, never a Chat error.
   * @param locale - UI language forwarded to the Platform request.
   * @returns `{ name, signedIn, resolved }`; `resolved` is false on a read failure.
   */
  async readProfile(locale) {
    const account = this.hostService('deepseekAccount')
    if (account === undefined || typeof account.getProfile !== 'function') {
      return { name: null, signedIn: false, resolved: true }
    }
    let profile
    try {
      profile = await account.getProfile({
        version: appVersion(),
        locale,
        // Platform wants seconds east of UTC; Date reports minutes west.
        timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
      })
    } catch (error) {
      this.logger.warn?.('deepseek-chat: account profile read failed', error instanceof Error ? error.message : error)
      return { name: null, signedIn: true, resolved: false }
    }
    return { name: accountDisplayName(profile), signedIn: true, resolved: true }
  }

  /** Optional Host service access that keeps this plugin loadable without it. */
  hostService(name) {
    try {
      return this.ctx.get?.(name) ?? this.ctx[name]
    } catch {
      return undefined
    }
  }

  listWorkspaces() {
    const registry = this.hostService('workspaceRegistry')
    if (registry === undefined || typeof registry.list !== 'function') return []
    try {
      return registry.list().map(workspace => ({
        id: workspace.id,
        title: workspace.title,
        path: workspace.path,
      }))
    } catch {
      return []
    }
  }

  /**
   * Whether a request path names one fixed location instead of a spelling
   * resolved against the host process's working directory. Windows rooted,
   * drive-less forms (`\foo`) pass `path.isAbsolute` yet depend on the current
   * drive, so they are refused like relative paths.
   * @param value - caller-supplied directory path.
   * @returns true for a fully qualified POSIX or Windows path.
   */
  isFullyQualifiedPath(value) {
    if (typeof value !== 'string' || value === '' || value.includes('\0')) return false
    if (!path.isAbsolute(value)) return false
    if (process.platform !== 'win32') return true
    return /^[A-Za-z]:[\\/]/.test(value) || /^\\\\[^\\]/.test(value)
  }

  /**
   * Create one local project folder when it does not exist yet, then register
   * that directory through the Host's native Workspace registry. The two steps
   * are separate on purpose: the folder is plain filesystem state, while the
   * registration is what makes Agent mode able to open a Session there.
   * Only the requested directory is created — no file inside it is touched.
   */
  async createWorkspace(request) {
    const body = await readJson(request)
    const requested = typeof body?.path === 'string' ? body.path.trim() : ''
    const title = typeof body?.title === 'string'
      ? body.title.replace(/\s+/g, ' ').trim().slice(0, 80)
      : ''
    if (requested === '') {
      throw new ApiError('缺少项目文件夹路径。', { code: 'INVALID_REQUEST', status: 400 })
    }
    if (requested.length > 4096) {
      throw new ApiError('项目文件夹路径过长。', { code: 'INVALID_REQUEST', status: 400 })
    }
    if (!this.isFullyQualifiedPath(requested)) {
      throw new ApiError('请填写完整的绝对路径（例如 C:\\Projects\\My-App）。', {
        code: 'INVALID_REQUEST', status: 400,
      })
    }
    const registry = this.hostService('workspaceRegistry')
    if (registry === undefined || typeof registry.create !== 'function') {
      throw new ApiError('当前 DSH 版本没有可用的工作区服务，无法注册工作区。', {
        code: 'WORKSPACE_UNAVAILABLE', status: 501,
      })
    }
    const target = path.normalize(requested)
    let info
    try {
      info = await stat(target)
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        throw new ApiError(`无法访问项目文件夹：${errorMessage(error)}`, { code: 'MKDIR_FAILED', status: 400 })
      }
    }
    let existingDirectory = false
    if (info !== undefined) {
      if (!info.isDirectory()) {
        throw new ApiError('该路径已存在，但不是文件夹。', { code: 'NOT_A_DIRECTORY', status: 400 })
      }
      existingDirectory = true
    } else {
      try {
        await mkdir(target, { recursive: true })
      } catch (error) {
        throw new ApiError(`无法创建项目文件夹：${errorMessage(error)}`, { code: 'MKDIR_FAILED', status: 400 })
      }
    }
    // Report whether the registration is new; the native registry returns the
    // existing entity unchanged for a directory it already owns.
    let existing
    try {
      existing = typeof registry.resolveByPath === 'function'
        ? await registry.resolveByPath(target)
        : registry.list().find(workspace => workspace.path === target)
    } catch {
      existing = undefined
    }
    let workspace
    try {
      workspace = await registry.create(target, title === '' ? undefined : title)
    } catch (error) {
      throw new ApiError(
        `${existingDirectory ? '' : '文件夹已创建，但'}无法注册工作区：${errorMessage(error)}`,
        { code: 'WORKSPACE_CREATE_FAILED', status: 502 },
      )
    }
    return {
      workspace: { id: workspace.id, title: workspace.title, path: workspace.path },
      created: { directory: !existingDirectory, workspace: existing === undefined },
    }
  }

  /** Resolve a conversation or fail the request with a clear 404. */
  requireConversation(id) {
    const conversation = typeof id === 'string' && id !== '' ? this.store.getConversation(id) : undefined
    if (conversation === undefined) throw new ApiError('会话不存在。', { code: 'NOT_FOUND', status: 404 })
    return conversation
  }

  /** Sidebar state after any organization change. */
  organizationSnapshot() {
    return { summaries: this.store.listSummaries(), folders: this.store.listFolders() }
  }

  async conversation(request) {
    const body = await readJson(request)
    const action = typeof body?.action === 'string' ? body.action : ''
    const id = typeof body?.id === 'string' ? body.id : ''
    if (action === 'list') {
      return { conversations: this.store.listSummaries(), folders: this.store.listFolders() }
    }
    if (action === 'create') {
      const conversation = await this.store.createConversation()
      return { conversation: this.store.presentConversation(conversation), ...this.organizationSnapshot() }
    }
    if (action === 'get') {
      const conversation = this.requireConversation(id)
      // A history-search hit may live on an older branch; reopening it keeps the
      // message the user searched for on screen instead of jumping to the tip.
      const focusMessageId = typeof body?.focusMessageId === 'string' ? body.focusMessageId : ''
      if (focusMessageId !== '' && !conversation.messages.some(message => message.id === focusMessageId)) {
        const focused = await this.store.focusMessage(id, focusMessageId)
        if (focused === undefined) throw new ApiError('消息不存在。', { code: 'NOT_FOUND', status: 404 })
      }
      return {
        conversation: this.store.presentConversation(conversation),
        folders: this.store.listFolders(),
      }
    }
    if (action === 'rename') {
      if (id === '') throw new ApiError('缺少会话 id。', { code: 'INVALID_REQUEST', status: 400 })
      const title = normalizeTitle(body?.title)
      const conversation = await this.store.renameConversation(id, title)
      if (conversation === undefined) throw new ApiError('会话不存在。', { code: 'NOT_FOUND', status: 404 })
      return { conversation: this.store.presentConversation(conversation), ...this.organizationSnapshot() }
    }
    if (action === 'delete') {
      if (id === '') throw new ApiError('缺少会话 id。', { code: 'INVALID_REQUEST', status: 400 })
      this.active.get(id)?.controller.abort()
      const deleted = await this.store.deleteConversation(id)
      if (!deleted) throw new ApiError('会话不存在。', { code: 'NOT_FOUND', status: 404 })
      // The model preference is keyed by conversation id; drop it with the chat
      // so a later conversation that reuses the id never inherits it.
      await this.modelConfig.remove(id)
      return { deleted: true, ...this.organizationSnapshot() }
    }
    if (action === 'pin') {
      const conversation = await this.store.setPinned(id, body?.pinned === true)
      if (conversation === undefined) throw new ApiError('会话不存在。', { code: 'NOT_FOUND', status: 404 })
      return { conversation: this.store.presentConversation(conversation), ...this.organizationSnapshot() }
    }
    if (action === 'archive') {
      const archived = body?.archived === true
      const conversation = await this.store.setArchived(id, archived)
      if (conversation === undefined) throw new ApiError('会话不存在。', { code: 'NOT_FOUND', status: 404 })
      this.active.get(id)?.controller.abort()
      return { conversation: this.store.presentConversation(conversation), ...this.organizationSnapshot() }
    }
    if (action === 'move') {
      const ids = Array.isArray(body?.ids)
        ? body.ids.filter(item => typeof item === 'string' && item !== '')
        : []
      if (ids.length === 0) throw new ApiError('缺少要移动的会话。', { code: 'INVALID_REQUEST', status: 400 })
      const folderId = typeof body?.folderId === 'string' && body.folderId !== '' ? body.folderId : null
      const moved = await this.store.moveConversations(ids, folderId)
      if (moved === undefined) throw new ApiError('文件夹不存在。', { code: 'NOT_FOUND', status: 404 })
      return { moved, ...this.organizationSnapshot() }
    }
    if (action === 'search') {
      const query = typeof body?.query === 'string' ? body.query : ''
      return this.store.search(query)
    }
    if (action === 'version') {
      if (id === '') throw new ApiError('缺少会话 id。', { code: 'INVALID_REQUEST', status: 400 })
      const messageId = typeof body?.messageId === 'string' ? body.messageId : ''
      const direction = body?.direction === 'prev' ? -1 : body?.direction === 'next' ? 1 : 0
      if (messageId === '' || direction === 0) {
        throw new ApiError('缺少要切换的消息版本。', { code: 'INVALID_REQUEST', status: 400 })
      }
      this.requireConversation(id)
      const result = await this.store.selectVersion(id, messageId, direction)
      if (result === undefined) {
        throw new ApiError('这条消息没有其他版本。', { code: 'NO_VERSIONS', status: 404 })
      }
      return {
        conversation: this.store.presentConversation(result.conversation),
        selectedId: result.selectedId,
        ...this.organizationSnapshot(),
      }
    }
    if (action.startsWith('folder.')) return this.folderAction(action.slice('folder.'.length), body)
    throw new ApiError('未知的会话操作。', { code: 'INVALID_REQUEST', status: 400 })
  }

  async folderAction(action, body) {
    const id = typeof body?.id === 'string' ? body.id : ''
    if (action === 'create') {
      const folder = await this.store.createFolder(body?.name)
      if (folder === undefined) throw new ApiError('文件夹名称不能为空。', { code: 'INVALID_NAME', status: 400 })
      return { folder, ...this.organizationSnapshot() }
    }
    if (action === 'rename') {
      if (!this.store.listFolders().some(folder => folder.id === id)) {
        throw new ApiError('文件夹不存在。', { code: 'NOT_FOUND', status: 404 })
      }
      const folder = await this.store.renameFolder(id, body?.name)
      if (folder === undefined) throw new ApiError('文件夹名称不能为空。', { code: 'INVALID_NAME', status: 400 })
      return { folder, ...this.organizationSnapshot() }
    }
    if (action === 'delete') {
      const removed = await this.store.deleteFolder(id)
      if (removed === undefined) throw new ApiError('文件夹不存在。', { code: 'NOT_FOUND', status: 404 })
      return { moved: removed.moved, ...this.organizationSnapshot() }
    }
    if (action === 'collapse') {
      const folder = await this.store.setFolderCollapsed(id, body?.collapsed === true)
      if (folder === undefined) throw new ApiError('文件夹不存在。', { code: 'NOT_FOUND', status: 404 })
      return { folder, ...this.organizationSnapshot() }
    }
    throw new ApiError('未知的文件夹操作。', { code: 'INVALID_REQUEST', status: 400 })
  }

  async updateSettings(request) {
    const body = await readJson(request)
    const settings = await this.store.updateSettings(sanitizeSettings(body))
    return { settings, auth: await this.auth() }
  }

  /**
   * One non-streaming Host completion for memory work (summary, extraction,
   * import structuring). It uses the same credentials and transport as chat but
   * an independent abort timer, so a client disconnect never cancels it.
   */
  async generateMemoryText({ system, messages, timeoutMs = this.config.memoryTimeoutMs }) {
    const settings = this.store.getSettings()
    const auth = await resolveAuth(this.ctx, { ...settings, baseURL: this.config.baseURL })
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const onUnload = () => controller.abort()
    if (this.memoryAbort.signal.aborted) controller.abort()
    else this.memoryAbort.signal.addEventListener('abort', onUnload, { once: true })
    try {
      let reply = { id: 'memory', role: 'assistant', status: 'streaming', blocks: [], prefix: true }
      const blockIndexes = new Map()
      for await (const event of streamMessage({
        baseURL: this.config.baseURL,
        auth,
        body: {
          model: CHAT_MODEL,
          system,
          messages,
          thinking: { type: 'disabled' },
        },
        signal: controller.signal,
      })) {
        if (event.type === 'error') {
          throw new ApiError(
            typeof event.error?.message === 'string' ? event.error.message : 'DeepSeek 未能完成记忆整理。',
            { code: 'STREAM_ERROR', kind: 'stream' },
          )
        }
        reply = applyEvent(reply, event, Date.now(), blockIndexes)
      }
      return getReplyText(settleReply(reply, 'done', Date.now())).trim()
    } finally {
      clearTimeout(timer)
      this.memoryAbort.signal.removeEventListener('abort', onUnload)
    }
  }

  /** Normalized source metadata for the future history-import integration. */
  memorySessionSource(body) {
    const source = body?.source
    if (source === null || typeof source !== 'object') return undefined
    return {
      type: 'conversation',
      conversationId: typeof source.conversationId === 'string' ? source.conversationId : null,
      label: typeof source.label === 'string' ? source.label : null,
    }
  }

  /**
   * Long-term memory operations. The store is local; only `summary.refresh`,
   * `assist` and `extract.session` call DeepSeek, and each of those is an
   * explicit user action except summary refresh, which is only requested for a
   * stale summary.
   */
  async memoryRoute(request) {
    const body = await readJson(request)
    const action = typeof body?.action === 'string' ? body.action : ''
    const locale = body?.locale === 'en' ? 'en' : 'zh'
    if (action === 'get') return this.memoryStore.snapshot()
    if (action === 'settings') {
      const patch = {}
      if (typeof body?.enabled === 'boolean') patch.enabled = body.enabled
      if (typeof body?.autoExtract === 'boolean') patch.autoExtract = body.autoExtract
      await this.memoryStore.updateSettings(patch)
      return this.memoryStore.snapshot()
    }
    if (action === 'add') {
      const result = await this.memoryStore.add({
        content: body?.content,
        category: body?.category,
        origin: 'manual',
        source: { type: 'manual' },
      })
      if (result.status === 'invalid') throw new ApiError('记忆内容不能为空。', { code: 'INVALID_CONTENT', status: 400 })
      if (result.status === 'limit') {
        throw new ApiError(`记忆数量已达上限（${result.limit} 条）。`, { code: 'MEMORY_LIMIT', status: 409 })
      }
      return { ...this.memoryStore.snapshot(), result }
    }
    if (action === 'update') {
      const id = typeof body?.id === 'string' ? body.id : ''
      if (id === '') throw new ApiError('缺少记忆 id。', { code: 'INVALID_REQUEST', status: 400 })
      const result = await this.memoryStore.update(id, { content: body?.content, category: body?.category })
      if (result.status === 'not-found') throw new ApiError('记忆不存在。', { code: 'NOT_FOUND', status: 404 })
      if (result.status === 'invalid') throw new ApiError('记忆内容不能为空。', { code: 'INVALID_CONTENT', status: 400 })
      return { ...this.memoryStore.snapshot(), result }
    }
    if (action === 'delete') {
      const id = typeof body?.id === 'string' ? body.id : ''
      const deleted = await this.memoryStore.remove(id)
      if (!deleted) throw new ApiError('记忆不存在。', { code: 'NOT_FOUND', status: 404 })
      return { ...this.memoryStore.snapshot(), result: { status: 'deleted', id } }
    }
    if (action === 'clear') {
      const cleared = await this.memoryStore.clear()
      return { ...this.memoryStore.snapshot(), result: { cleared } }
    }
    if (action === 'preview') {
      return this.memoryStore.previewEntries(Array.isArray(body?.entries) ? body.entries : [])
    }
    if (action === 'import') {
      const platform = ['chatgpt', 'claude', 'gemini', 'other'].includes(body?.platform) ? body.platform : null
      const entries = Array.isArray(body?.entries) ? body.entries : []
      // Imported-chat extraction passes a conversation source so the resulting
      // memories are labelled as coming from a conversation instead of from a
      // foreign-AI export. Other callers keep the platform-based behaviour.
      const conversationSource = this.memorySessionSource(body)
      const source = conversationSource ?? { type: 'import', platform }
      const result = await this.memoryStore.absorb(entries, {
        origin: conversationSource === undefined ? 'import' : 'conversation',
        source,
      })
      return { ...this.memoryStore.snapshot(), result }
    }
    if (action === 'summary.refresh') {
      try {
        await this.memory.refreshSummary(locale)
      } catch (error) {
        throw new ApiError(`记忆概述生成失败：${errorMessage(error)}`, { code: 'SUMMARY_FAILED', status: 502 })
      }
      return this.memoryStore.snapshot()
    }
    if (action === 'ask') {
      const result = await this.memory.ask({ text: typeof body?.text === 'string' ? body.text : '', locale })
      return { ...this.memoryStore.snapshot(), ...result }
    }
    if (action === 'confirm') {
      const result = await this.memory.confirm({
        id: typeof body?.id === 'string' ? body.id : '',
        accept: body?.accept === true,
        locale,
      })
      return { ...this.memoryStore.snapshot(), ...result }
    }
    if (action === 'assist') {
      if (body?.consent !== true) {
        throw new ApiError('需要先确认再将文本发送到 DeepSeek API。', { code: 'CONSENT_REQUIRED', status: 400 })
      }
      const text = typeof body?.text === 'string' ? body.text : ''
      if (text.trim() === '') throw new ApiError('没有可整理的内容。', { code: 'INVALID_REQUEST', status: 400 })
      try {
        return await this.memory.assistImport(text, locale)
      } catch (error) {
        if (error instanceof ApiError && error.code === 'AUTH_REQUIRED') {
          throw new ApiError('当前没有可用的 DeepSeek 凭证，无法使用 AI 整理。', {
            code: 'AI_UNAVAILABLE', status: 503,
          })
        }
        throw new ApiError(`AI 整理失败：${errorMessage(error)}`, { code: 'ASSIST_FAILED', status: 502 })
      }
    }
    if (action === 'extract.session') {
      // Reserved interface for the DeepSeek chat-history import branch: analyze
      // a supplied session, then merge only the accepted candidates.
      const messages = Array.isArray(body?.messages) ? body.messages.slice(0, 500) : []
      if (messages.length === 0) throw new ApiError('没有可分析的会话消息。', { code: 'INVALID_REQUEST', status: 400 })
      const result = await this.memory.extractFromMessages({
        messages,
        title: typeof body?.title === 'string' ? body.title : '',
        locale,
        save: body?.save === true,
        source: this.memorySessionSource(body),
      })
      return { ...this.memoryStore.snapshot(), ...result }
    }
    if (action === 'extract.imported') {
      // Analyze conversations that came from a chat-history import. The browser
      // selects them and confirms the extra model calls first; this action only
      // returns preview candidates and never saves a memory on its own. A failed
      // conversation is reported in `failed` and never touches the imported chat.
      if (body?.consent !== true) {
        throw new ApiError('需要先确认再将会话内容发送到 DeepSeek API。', { code: 'CONSENT_REQUIRED', status: 400 })
      }
      const requested = []
      for (const id of Array.isArray(body?.conversationIds) ? body.conversationIds : []) {
        if (typeof id !== 'string' || id === '' || requested.includes(id)) continue
        requested.push(id)
      }
      if (requested.length === 0) throw new ApiError('没有选择要分析的会话。', { code: 'INVALID_REQUEST', status: 400 })
      // The browser enforces the same cap and never sends more, but a second
      // client must still be told exactly which selected chats were left out
      // instead of silently analyzing fewer than the consent promised.
      const ids = requested.slice(0, IMPORT_MEMORY_MAX_SESSIONS)
      const overLimit = requested.slice(IMPORT_MEMORY_MAX_SESSIONS)
      const reanalyze = body?.reanalyze === true
      const analyzed = []
      const skipped = overLimit.map(id => ({ id, reason: 'over-limit' }))
      const failed = []
      const candidates = []
      for (const id of ids) {
        const conversation = this.store.getConversation(id)
        if (conversation === undefined) {
          skipped.push({ id, reason: 'missing' })
          continue
        }
        if (conversation.source === null || typeof conversation.source !== 'object') {
          skipped.push({ id, reason: 'not-imported' })
          continue
        }
        if (!reanalyze && typeof conversation.source.memoryExtractedAt === 'number') {
          skipped.push({ id, reason: 'already-extracted' })
          continue
        }
        try {
          const result = await this.memory.extractFromMessages({
            messages: this.store.presentPath(conversation),
            title: conversation.title,
            locale,
            save: false,
            source: {
              type: 'conversation',
              conversationId: conversation.source.id,
              label: conversation.title,
            },
          })
          analyzed.push(id)
          candidates.push(...result.candidates)
        } catch (error) {
          failed.push({ id, reason: errorMessage(error) })
        }
      }
      // Several conversations often mention the same fact; dedupe inside the
      // batch before the browser shows one row per candidate.
      const unique = []
      const seen = new Set()
      for (const candidate of candidates) {
        const key = normalizeMemoryContent(candidate.content)
        if (key === '' || seen.has(key)) continue
        seen.add(key)
        unique.push({ content: candidate.content, category: candidate.category })
      }
      const preview = this.memoryStore.previewEntries(unique)
      if (analyzed.length > 0) await this.store.markMemoryExtracted(analyzed)
      return {
        analyzed: analyzed.length,
        analyzedIds: analyzed,
        skipped,
        failed,
        entries: preview.entries,
        limits: preview.limits,
      }
    }
    throw new ApiError('未知的记忆操作。', { code: 'INVALID_REQUEST', status: 400 })
  }

  async updateKey(request) {
    const body = await readJson(request)
    const credentials = this.ctx.get?.('credentials') ?? this.ctx.credentials
    if (credentials === undefined || typeof credentials.set !== 'function') {
      throw new ApiError('此 DSH 配置没有凭证存储，无法保存 API Key。请设置 DEEPSEEK_API_KEY 环境变量。', {
        code: 'CREDENTIAL_STORE_UNAVAILABLE', status: 501,
      })
    }
    if (body?.clear === true) {
      await credentials.unset('DEEPSEEK_CHAT_API_KEY')
      return { auth: await this.auth() }
    }
    const key = typeof body?.key === 'string' ? body.key.trim() : ''
    if (key.length < 8 || key.length > 512 || /\s/.test(key)) {
      throw new ApiError('API Key 格式无效。', { code: 'INVALID_KEY', status: 400 })
    }
    await credentials.set('DEEPSEEK_CHAT_API_KEY', key)
    return { auth: await this.auth() }
  }

  /**
   * Draft one Agent-ready task brief from a finished conversation. The reply is
   * advisory: any failure still returns the deterministic local brief.
   */
  async handoffBrief(request) {
    const body = await readJson(request)
    const id = typeof body?.conversationId === 'string' ? body.conversationId : ''
    const conversation = this.store.getConversation(id)
    if (conversation === undefined) throw new ApiError('会话不存在。', { code: 'NOT_FOUND', status: 404 })
    const locale = body?.locale === 'en' ? 'en' : 'zh'
    const instruction = typeof body?.instruction === 'string' ? body.instruction.slice(0, 4000) : ''
    const fallback = () => fallbackHandoffBrief(conversation.messages, { locale })
    const built = buildHandoffRequest(conversation.messages, { locale, instruction })
    if (built === null) return { brief: fallback(), generated: false }
    const settings = this.store.getSettings()
    let auth
    try {
      auth = await resolveAuth(this.ctx, { ...settings, baseURL: this.config.baseURL })
    } catch (error) {
      return { brief: fallback(), generated: false, warning: error instanceof Error ? error.message : String(error) }
    }
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.config.handoffTimeoutMs)
    try {
      let reply = { id: 'handoff', role: 'assistant', status: 'streaming', blocks: [], prefix: true }
      const blockIndexes = new Map()
      for await (const event of streamMessage({
        baseURL: this.config.baseURL,
        auth,
        body: {
          model: CHAT_MODEL,
          system: built.system,
          messages: built.messages,
          thinking: { type: 'disabled' },
        },
        signal: controller.signal,
      })) {
        if (event.type === 'error') {
          throw new ApiError(
            typeof event.error?.message === 'string' ? event.error.message : 'DeepSeek 未能生成任务说明。',
            { code: 'STREAM_ERROR', kind: 'stream' },
          )
        }
        reply = applyEvent(reply, event, Date.now(), blockIndexes)
      }
      const text = getReplyText(settleReply(reply, 'done', Date.now())).trim()
      if (text === '') return { brief: fallback(), generated: false }
      return { brief: text, generated: true }
    } catch (error) {
      this.logger.warn?.('deepseek-chat: handoff draft failed', error instanceof Error ? error.message : error)
      return { brief: fallback(), generated: false, warning: error instanceof Error ? error.message : String(error) }
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * Create one ordinary Agent Session in a Workspace and admit the brief as its
   * first prompt, so Agent mode opens on the task already running.
   */
  async handoffSend(request) {
    const body = await readJson(request)
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
    if (prompt === '') throw new ApiError('任务说明为空。', { code: 'EMPTY_MESSAGE', status: 400 })
    if (prompt.length > 60_000) throw new ApiError('任务说明过长。', { code: 'MESSAGE_TOO_LONG', status: 413 })
    const controller = this.hostService('sessionController')
    if (controller === undefined) {
      throw new ApiError('当前 DSH 版本没有可用的会话服务，无法创建 Agent 会话。', {
        code: 'HANDOFF_UNAVAILABLE', status: 501,
      })
    }
    const workspaceId = typeof body?.workspaceId === 'string' && body.workspaceId !== '' ? body.workspaceId : undefined
    if (workspaceId !== undefined && this.listWorkspaces().every(workspace => workspace.id !== workspaceId)) {
      throw new ApiError('工作区不存在。', { code: 'NOT_FOUND', status: 404 })
    }
    let created
    try {
      created = await controller.create(workspaceId === undefined ? {} : { workspaceId })
    } catch (error) {
      throw new ApiError(`无法创建 Agent 会话：${error instanceof Error ? error.message : String(error)}`, {
        code: 'HANDOFF_CREATE_FAILED', status: 502,
      })
    }
    const sessionId = created?.sessionId
    if (typeof sessionId !== 'string' || sessionId === '') {
      throw new ApiError('会话服务未返回会话 id。', { code: 'HANDOFF_CREATE_FAILED', status: 502 })
    }
    const title = typeof body?.title === 'string' ? body.title.replace(/\s+/g, ' ').trim().slice(0, 80) : ''
    if (title !== '') {
      try {
        await controller.rename({ sessionId, title })
      } catch (error) {
        this.logger.warn?.('deepseek-chat: could not rename the handed-off session', error instanceof Error ? error.message : error)
      }
    }
    const requestId = typeof body?.requestId === 'string' && body.requestId !== '' ? body.requestId : randomUUID()
    const timeZone = typeof body?.timeZone === 'string' && body.timeZone !== '' ? body.timeZone : undefined
    try {
      await controller.prompt({
        requestId,
        sessionId,
        mode: 'queue',
        content: [{ type: 'text', text: prompt }],
        ...(timeZone === undefined ? {} : { clientTimeZone: timeZone }),
      }, AbortSignal.timeout(this.config.handoffTimeoutMs))
    } catch (error) {
      // The Session exists, so report it instead of leaving an orphan: the
      // browser opens it and tells the user to paste the brief again.
      return {
        sessionId,
        workspaceId: workspaceId ?? null,
        warning: error instanceof Error ? error.message : String(error),
      }
    }
    return { sessionId, workspaceId: workspaceId ?? null }
  }

  async upload(request) {
    const declared = Number(request.headers.get('content-length') ?? '0')
    if (Number.isFinite(declared) && declared > this.config.maxUploadBytes) {
      throw new ApiError(`文件超过 ${Math.round(this.config.maxUploadBytes / 1024 / 1024)} MB 上限。`, {
        code: 'FILE_TOO_LARGE', status: 413,
      })
    }
    const name = decodeURIComponent(request.headers.get('x-file-name') ?? '')
    const mimeType = request.headers.get('x-file-mime') ?? ''
    if (name.trim() === '') throw new ApiError('缺少文件名。', { code: 'INVALID_REQUEST', status: 400 })
    const purpose = uploadPurpose(name, mimeType)
    const purposeLimit = purpose === 'user_data' ? 32 * 1024 * 1024 : this.config.maxUploadBytes
    const bytes = new Uint8Array(await request.arrayBuffer())
    if (bytes.length === 0) throw new ApiError('文件为空。', { code: 'INVALID_REQUEST', status: 400 })
    if (bytes.length > purposeLimit) {
      throw new ApiError(`该文件类型最大允许 ${Math.round(purposeLimit / 1024 / 1024)} MB。`, {
        code: 'FILE_TOO_LARGE', status: 413,
      })
    }
    const settings = this.store.getSettings()
    const auth = await resolveAuth(this.ctx, { ...settings, baseURL: this.config.baseURL })
    const file = await uploadFile({
      baseURL: this.config.baseURL,
      auth,
      name,
      mimeType,
      bytes,
      signal: request.signal,
    })
    return {
      file: {
        ...file,
        isImage: isImageFile(name, mimeType) && purpose === null,
      },
    }
  }

  /**
   * One streaming entry point for every turn kind:
   * - `send` appends a new user/assistant turn to the active branch;
   * - `edit` turns an edited question into a new sibling branch and drops the
   *   old replies from the active path (they stay stored as versions);
   * - `regenerate` adds a new sibling answer under the same question;
   * - `continue` resumes the existing answer from its visible-text prefix.
   */
  async stream(request) {
    try {
      await this.ready()
      if (this.disposed) throw new ApiError('Chat 插件已卸载。', { code: 'DISPOSED', status: 503 })
      const body = await readJson(request)
      const conversationId = typeof body?.conversationId === 'string' ? body.conversationId : ''
      const conversation = this.requireConversation(conversationId)
      if (this.active.has(conversationId)) {
        throw new ApiError('此会话正在生成回复。', { code: 'BUSY', status: 409 })
      }
      const mode = ['send', 'edit', 'regenerate', 'continue'].includes(body?.mode) ? body.mode : 'send'
      const targetId = typeof body?.targetMessageId === 'string' ? body.targetMessageId : ''
      const settings = this.store.getSettings()
      const auth = await resolveAuth(this.ctx, { ...settings, baseURL: this.config.baseURL })
      const locale = body?.locale === 'en' ? 'en' : 'zh'
      const reminder = createLatestReminder({ locale })
      // An explicit request model is validated against the real catalog. When a
      // client omits it (older browser half), the conversation preference wins.
      const preference = this.modelConfig.getConversation(conversationId) ?? this.modelConfig.getDefaults()
      const requestedModel = body?.model === undefined || body?.model === null || body?.model === ''
        ? preference.model
        : resolveModelId(body.model)
      if (requestedModel === null) {
        throw new ApiError(`不支持的模型：${String(body?.model).slice(0, 80)}`, { code: 'INVALID_MODEL', status: 400 })
      }
      const model = requestedModel
      const effort = resolveEffort(body?.effort ?? preference.effort, model)
      const now = Date.now()
      let userMessageId = null
      let reply = null
      let requestMessages = null
      let requestTitle = false
      let continuation = false
      let requestText = ''
      let memoryQuery = ''

      if (mode === 'continue') {
        const target = conversation.messages.find(message => message.id === targetId)
        if (target === undefined) throw new ApiError('要继续的消息不存在。', { code: 'NOT_FOUND', status: 404 })
        if (target.role !== 'assistant') {
          throw new ApiError('只能继续助手的回答。', { code: 'INVALID_REQUEST', status: 400 })
        }
        if (conversation.messages.at(-1)?.id !== target.id) {
          throw new ApiError('只能继续最后一条回答。', { code: 'INVALID_REQUEST', status: 400 })
        }
        if (!canContinueReply(target)) {
          throw new ApiError('这条回答没有可继续的正文，请选择重新生成。', { code: 'NOT_CONTINUABLE', status: 409 })
        }
        requestMessages = buildContinuationMessages(conversation.messages, target.id, { reminder })
        if (requestMessages === null) {
          throw new ApiError('这条回答没有可继续的正文，请选择重新生成。', { code: 'NOT_CONTINUABLE', status: 409 })
        }
        continuation = true
        reply = {
          ...target,
          status: 'streaming',
          updatedAt: now,
          error: undefined,
          // A continuation is a fresh request: record the model/effort that
          // actually handles it so the message footer never disagrees with the
          // request after the user switches models mid-conversation.
          model,
          effort,
          continueCount: (target.continueCount ?? 0) + 1,
        }
        // Persist the resumed state before the request starts: a crash or reload
        // then presents it as stopped and keeps whatever text already exists.
        await this.store.replaceMessage(conversationId, reply)
      } else {
        const text = typeof body?.text === 'string' ? body.text.trim() : ''
        requestText = text
        const files = sanitizeFiles(body?.files)
        if (model === 'deepseek-v4-pro' && files.some(file => file.isImage)) {
          throw new ApiError('DeepSeek V4 Pro 不支持图片输入，请改用 DeepSeek V4.1 Flash。', {
            code: 'UNSUPPORTED_INPUT', status: 400,
          })
        }
        // A regeneration reuses the stored question, so it carries no new body.
        if (mode !== 'regenerate') {
          if (text.length > MAX_TEXT) throw new ApiError('消息过长。', { code: 'MESSAGE_TOO_LONG', status: 413 })
          if (text === '' && files.length === 0) throw new ApiError('消息为空。', { code: 'EMPTY_MESSAGE', status: 400 })
        }
        const thinking = body?.thinking === true
        const search = body?.search === true
        requestTitle = mode === 'send'
          && !conversation.messages.some(message => message.role === 'assistant')
          && conversation.titleAuto !== false
        const makeReply = () => ({
          id: randomUUID(),
          role: 'assistant',
          createdAt: now,
          updatedAt: now,
          model,
          effort,
          thinking,
          search,
          status: 'streaming',
          blocks: [],
          prefix: true,
        })
        if (mode === 'edit') {
          const target = conversation.messages.find(message => message.id === targetId)
          if (target === undefined || target.role !== 'user') {
            throw new ApiError('只能编辑当前对话中的用户消息。', { code: 'INVALID_REQUEST', status: 400 })
          }
          // The edited question becomes a sibling of the original one, under the
          // same parent, so everything before it stays shared and the old answer
          // subtree stays stored but off the active path.
          const parentId = conversation.nodes[target.id]?.parentId ?? null
          const userMessage = { id: randomUUID(), role: 'user', content: text, files, createdAt: now }
          const created = await this.store.createUserBranch(conversationId, userMessage, parentId)
          if (created === undefined) throw new ApiError('会话不存在。', { code: 'NOT_FOUND', status: 404 })
          reply = makeReply()
          await this.store.createAssistantBranch(conversationId, reply, userMessage.id)
          userMessageId = userMessage.id
        } else if (mode === 'regenerate') {
          const target = conversation.messages.find(message => message.id === targetId)
          if (target === undefined || target.role !== 'assistant') {
            throw new ApiError('只能重新生成当前对话中的回答。', { code: 'INVALID_REQUEST', status: 400 })
          }
          const parentId = conversation.nodes[target.id]?.parentId ?? null
          const parent = parentId === null ? undefined : conversation.nodes[parentId]
          if (parent === undefined || parent.message.role !== 'user') {
            throw new ApiError('这条回答没有对应的提问，无法重新生成。', { code: 'INVALID_REQUEST', status: 400 })
          }
          reply = makeReply()
          await this.store.createAssistantBranch(conversationId, reply, parentId)
          userMessageId = parentId
        } else {
          const userMessage = { id: randomUUID(), role: 'user', content: text, files, createdAt: now }
          reply = makeReply()
          await this.store.appendTurn(conversationId, userMessage, reply)
          userMessageId = userMessage.id
        }
        requestMessages = buildRequestMessages(conversation.messages, userMessageId, { reminder })
        if (requestMessages === null) {
          throw new ApiError('无法构造请求上下文。', { code: 'INVALID_CONTEXT', status: 500 })
        }
      }
      // Long-term memory participates in every new request (never in a
      // continuation, whose prefill must stay a pure continuation). The
      // retrieval is local, bounded, and skips nothing when memory is off.
      if (!continuation) {
        if (mode === 'regenerate') {
          const parentId = conversation.nodes[targetId]?.parentId ?? null
          const parent = parentId === null ? undefined : conversation.nodes[parentId]
          memoryQuery = typeof parent?.message?.content === 'string' ? parent.message.content : ''
        } else {
          memoryQuery = requestText
        }
      }
      const memoryBlock = continuation ? '' : this.memory.contextFor(memoryQuery, locale).block
      const systemPrompt = settings.systemPrompt.trim() === '' ? DEFAULT_SYSTEM_PROMPT : settings.systemPrompt
      const requestBody = {
        model,
        system: memoryBlock === '' ? systemPrompt : `${systemPrompt}\n\n${memoryBlock}`,
        messages: requestMessages,
        // A resumed answer is a text continuation: reasoning is not replayed and
        // the prefix is only valid for a plain assistant turn.
        ...(continuation
          ? { thinking: { type: 'disabled' } }
          : thinkingParams(reply.thinking, reply.effort ?? effort)),
        tools: serverTools(continuation ? false : reply.search),
        safety_check: { level: 'high' },
        ...(requestTitle ? { title: { enabled: true } } : {}),
      }
      const abortController = new AbortController()
      let timedOut = false
      const timer = setTimeout(() => {
        timedOut = true
        abortController.abort()
      }, this.config.requestTimeoutMs)
      const active = { controller: abortController, timer, reply, conversationId }
      this.active.set(conversationId, active)
      const onAbort = () => abortController.abort()
      if (request.signal.aborted) abortController.abort()
      else request.signal.addEventListener('abort', onAbort, { once: true })

      const stream = new ReadableStream({
        start: (streamController) => {
          const task = this.runStream({
            upstream: streamController,
            signal: abortController.signal,
            conversationId,
            conversation,
            userMessageId,
            reply,
            requestBody,
            auth,
            abort: abortController,
            isTimedOut: () => timedOut,
          }).finally(() => {
            clearTimeout(timer)
            request.signal.removeEventListener('abort', onAbort)
            this.active.delete(conversationId)
            this.pending.delete(task)
            // Auto extraction runs after the reply is finished and outside the
            // response stream, so it can never delay or fail the chat itself.
            if (!continuation && (mode === 'send' || mode === 'edit')) {
              this.queueMemoryExtraction(conversationId, locale)
            }
          })
          this.pending.add(task)
        },
        cancel: () => {
          abortController.abort()
        },
      })
      return new Response(stream, { status: 200, headers: NDJSON_HEADERS })
    } catch (error) {
      this.logger.warn?.('deepseek-chat: stream request failed', error instanceof Error ? error.message : error)
      return errorResponse(error)
    }
  }

  /**
   * Schedule one automatic extraction attempt after a completed turn. The task
   * is tracked so plugin disposal waits for it, but nothing awaits it on the
   * chat path: a failing or slow extraction is invisible to the conversation.
   */
  queueMemoryExtraction(conversationId, locale) {
    try {
      const settings = this.memoryStore.getSettings()
      if (settings.enabled !== true || settings.autoExtract !== true) return
    } catch {
      return
    }
    const run = (async () => {
      // Yield first so the response body can close before any extra request.
      await new Promise(resolve => setTimeout(resolve, 0))
      const conversation = this.store.getConversation(conversationId)
      if (conversation === undefined) return
      await this.memory.maybeExtractConversation({
        conversationId,
        messages: conversation.messages,
        locale,
      })
    })().catch((error) => {
      this.logger.warn?.('deepseek-chat: memory extraction task failed', errorMessage(error))
    }).finally(() => {
      this.pending.delete(run)
    })
    this.pending.add(run)
  }

  async runStream({
    upstream, signal, conversationId, conversation, userMessageId, reply, requestBody, auth,
    abort, isTimedOut,
  }) {
    const encoder = new TextEncoder()
    let closed = false
    const send = (value) => {
      if (closed) return false
      try {
        upstream.enqueue(encoder.encode(`${JSON.stringify(value)}\n`))
        return true
      } catch {
        abort.abort()
        return false
      }
    }
    const heartbeat = setInterval(() => {
      send({ type: 'ping' })
    }, this.config.heartbeatMs)
    const update = (next) => { reply = next }
    const persist = async () => {
      // A mid-flight write carries the write time so a reload can close an open
      // thinking block against it instead of against the reload clock.
      const snapshot = reply.status === 'streaming' ? { ...reply, updatedAt: Date.now() } : reply
      await this.store.replaceMessage(conversationId, snapshot).catch((error) => {
        this.logger.warn?.('deepseek-chat: failed to persist reply', error)
      })
    }
    const latest = () => this.store.getConversation(conversationId) ?? conversation
    const outMessage = () => this.store.presentMessage(latest(), reply)
    let sawStop = false
    const blockIndexes = new Map()
    try {
      send({
        type: 'start',
        conversationId,
        userMessageId,
        assistantMessageId: reply.id,
        title: conversation.title,
        // The authoritative active path after this turn's branch was created.
        // The browser replaces its optimistic messages with it, so an edit or a
        // regeneration never leaves a stale answer in the visible context.
        messages: this.store.presentPath(latest()),
      })
      let titleSent = false
      for await (const event of streamMessage({
        baseURL: this.config.baseURL,
        auth,
        body: requestBody,
        signal,
      })) {
        if (event.type === 'error') {
          throw new ApiError(
            typeof event.error?.message === 'string' ? event.error.message : 'DeepSeek 生成失败，请重试。',
            { code: 'STREAM_ERROR', kind: 'stream', status: 200 },
          )
        }
        if (event.type === 'message_stop') sawStop = true
        if (event.type === 'message_delta' && event.delta?.title) {
          const title = normalizeTitle(event.delta.title)
          if (title !== '' && !titleSent) {
            const changed = await this.store.applyAutoTitle(conversationId, title)
            if (changed) {
              titleSent = true
              send({ type: 'title', title })
            }
          }
        }
        update(applyEvent(reply, event, Date.now(), blockIndexes))
        send({ type: 'event', event })
        if (event.type === 'content_block_stop' || event.type === 'message_delta') {
          void persist()
        }
      }
      if (!sawStop && reply.stopReason === undefined) {
        throw new ApiError('DeepSeek 连接提前结束，请重试。', { code: 'INTERRUPTED', kind: 'interrupted' })
      }
      update(settleReply(reply, 'done', Date.now()))
      await persist()
      send({
        type: 'done',
        message: outMessage(),
        conversation: this.store.summary(latest()),
      })
    } catch (error) {
      if (abort.signal.aborted) {
        if (isTimedOut()) {
          const payload = {
            message: '生成超时，请重试。',
            code: 'TIMEOUT',
            kind: 'timeout',
          }
          update(settleReply(reply, 'error', Date.now(), payload))
          await persist()
          send({ type: 'error', error: payload, message: outMessage() })
        } else {
          update(settleReply(reply, 'stopped', Date.now()))
          await persist()
          send({ type: 'aborted', message: outMessage() })
        }
      } else {
        const payload = errorPayload(error)
        update(settleReply(reply, 'error', Date.now(), payload))
        await persist()
        send({ type: 'error', error: payload, message: outMessage() })
      }
    } finally {
      clearInterval(heartbeat)
      closed = true
      try {
        upstream.close()
      } catch {
        // The consumer may have gone away.
      }
    }
  }

  async dispose() {
    this.disposed = true
    this.importer.dispose()
    this.memoryAbort.abort()
    for (const active of this.active.values()) {
      clearTimeout(active.timer)
      active.controller.abort()
    }
    await Promise.allSettled([...this.pending])
    await this.store.flush().catch(() => {})
    await this.modelConfig.flush().catch(() => {})
    await this.memoryStore.flush().catch(() => {})
    for (const dispose of this.routes.reverse()) {
      try {
        await dispose()
      } catch {
        // Route already removed with its owner.
      }
    }
    this.routes = []
  }
}
