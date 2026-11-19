/**
 * Host side of DeepSeek Chat mode: route handlers, DeepSeek request assembly,
 * streamed reply persistence, uploads, settings, and credential status.
 */

import path from 'node:path'
import os from 'node:os'
import { randomUUID } from 'node:crypto'
import {
  ApiError, authSnapshot, isImageFile, resolveAuth, streamMessage, uploadFile, uploadPurpose,
} from './api.js'
import {
  CHAT_MODEL, CHAT_MODEL_NAME, DEFAULT_SYSTEM_PROMPT, applyEvent, buildRequestMessages,
  conversationSummary, createLatestReminder, normalizeTitle, serverTools, settleReply,
  titleFromUserMessage,
} from './protocol.js'
import { ChatStore } from './store.js'

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
  return {
    message: error instanceof Error ? error.message : String(error),
    code: 'INTERNAL',
    kind: 'internal',
  }
}

function errorResponse(error) {
  const payload = errorPayload(error)
  const status = error instanceof ApiError
    ? (error.code === 'AUTH_REQUIRED' ? 401 : error.status ?? (error.kind === 'network' ? 502 : 400))
    : 500
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
  }
}

function dataDirectory() {
  const home = process.env.DSH_HOME
  return path.join(home !== undefined && home !== '' ? home : path.join(os.homedir(), '.dsh'), 'deepseek-chat')
}

export class ChatService {
  constructor(ctx, config) {
    this.ctx = ctx
    this.config = resolveConfig(config)
    this.logger = ctx.logger ?? console
    this.store = new ChatStore(dataDirectory(), { logger: this.logger })
    this.readyPromise = null
    this.routes = []
    this.active = new Map()
    this.pending = new Set()
    this.disposed = false
  }

  ready() {
    if (this.readyPromise === null) this.readyPromise = this.store.load()
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
      path: '/api/deepseek-chat/key',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: request => this.guard(request, () => this.updateKey(request)),
    })
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
    return {
      version: 1,
      model: { id: CHAT_MODEL, name: CHAT_MODEL_NAME },
      settings,
      conversations: this.store.listSummaries(),
      auth: await this.auth(),
      limits: {
        maxFiles: MAX_FILES,
        maxUploadBytes: this.config.maxUploadBytes,
        maxText: MAX_TEXT,
      },
      dataDir: dataDirectory(),
    }
  }

  async conversation(request) {
    const body = await readJson(request)
    const action = body?.action
    if (action === 'list') {
      return { conversations: this.store.listSummaries() }
    }
    if (action === 'create') {
      const conversation = await this.store.createConversation()
      return { conversation }
    }
    if (action === 'get') {
      const id = typeof body?.id === 'string' ? body.id : ''
      const conversation = this.store.getConversation(id)
      if (conversation === undefined) throw new ApiError('会话不存在。', { code: 'NOT_FOUND', status: 404 })
      return { conversation }
    }
    if (action === 'rename') {
      const id = typeof body?.id === 'string' ? body.id : ''
      const title = normalizeTitle(body?.title)
      if (id === '') throw new ApiError('缺少会话 id。', { code: 'INVALID_REQUEST', status: 400 })
      const conversation = await this.store.renameConversation(id, title)
      if (conversation === undefined) throw new ApiError('会话不存在。', { code: 'NOT_FOUND', status: 404 })
      return { conversation, summaries: this.store.listSummaries() }
    }
    if (action === 'delete') {
      const id = typeof body?.id === 'string' ? body.id : ''
      if (id === '') throw new ApiError('缺少会话 id。', { code: 'INVALID_REQUEST', status: 400 })
      this.active.get(id)?.controller.abort()
      const deleted = await this.store.deleteConversation(id)
      if (!deleted) throw new ApiError('会话不存在。', { code: 'NOT_FOUND', status: 404 })
      return { deleted: true, summaries: this.store.listSummaries() }
    }
    throw new ApiError('未知的会话操作。', { code: 'INVALID_REQUEST', status: 400 })
  }

  async updateSettings(request) {
    const body = await readJson(request)
    const settings = await this.store.updateSettings(sanitizeSettings(body))
    return { settings, auth: await this.auth() }
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

  async stream(request) {
    try {
      await this.ready()
      if (this.disposed) throw new ApiError('Chat 插件已卸载。', { code: 'DISPOSED', status: 503 })
      const body = await readJson(request)
      const conversationId = typeof body?.conversationId === 'string' ? body.conversationId : ''
      const conversation = this.store.getConversation(conversationId)
      if (conversation === undefined) throw new ApiError('会话不存在。', { code: 'NOT_FOUND', status: 404 })
      if (this.active.has(conversationId)) {
        throw new ApiError('此会话正在生成回复。', { code: 'BUSY', status: 409 })
      }
      const text = typeof body?.text === 'string' ? body.text.trim() : ''
      const files = sanitizeFiles(body?.files)
      if (text.length > MAX_TEXT) throw new ApiError('消息过长。', { code: 'MESSAGE_TOO_LONG', status: 413 })
      if (text === '' && files.length === 0) throw new ApiError('消息为空。', { code: 'EMPTY_MESSAGE', status: 400 })
      const settings = this.store.getSettings()
      const auth = await resolveAuth(this.ctx, { ...settings, baseURL: this.config.baseURL })
      const thinking = body?.thinking === true
      const search = body?.search === true
      const locale = body?.locale === 'en' ? 'en' : 'zh'
      const firstTurn = !conversation.messages.some(message => message.role === 'assistant')
      const now = Date.now()
      const userMessage = {
        id: randomUUID(),
        role: 'user',
        content: text,
        files,
        createdAt: now,
      }
      const reply = {
        id: randomUUID(),
        role: 'assistant',
        createdAt: now,
        updatedAt: now,
        model: CHAT_MODEL,
        thinking,
        search,
        status: 'streaming',
        blocks: [],
        prefix: true,
      }
      await this.store.appendMessage(conversationId, userMessage)
      await this.store.appendMessage(conversationId, reply)
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
            userMessage,
            reply,
            settings,
            auth,
            thinking,
            search,
            locale,
            requestTitle: firstTurn && conversation.titleAuto !== false,
            abort: abortController,
            isTimedOut: () => timedOut,
          }).finally(() => {
            clearTimeout(timer)
            request.signal.removeEventListener('abort', onAbort)
            this.active.delete(conversationId)
            this.pending.delete(task)
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

  async runStream({
    upstream, signal, conversationId, conversation, userMessage, reply, settings, auth,
    thinking, search, locale, requestTitle, abort, isTimedOut,
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
      await this.store.replaceMessage(conversationId, reply).catch((error) => {
        this.logger.warn?.('deepseek-chat: failed to persist reply', error)
      })
    }
    let sawStop = false
    const blockIndexes = new Map()
    try {
      send({
        type: 'start',
        conversationId,
        userMessage,
        assistantMessageId: reply.id,
        title: conversation.title,
      })
      const messages = buildRequestMessages(conversation.messages, userMessage.id, {
        reminder: createLatestReminder({ locale }),
      })
      const requestBody = {
        model: CHAT_MODEL,
        system: settings.systemPrompt.trim() === '' ? DEFAULT_SYSTEM_PROMPT : settings.systemPrompt,
        messages,
        thinking: { type: thinking ? 'enabled' : 'disabled' },
        tools: serverTools(search),
        safety_check: { level: 'high' },
        ...(requestTitle ? { title: { enabled: true } } : {}),
      }
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
        message: reply,
        conversation: conversationSummary(this.store.getConversation(conversationId) ?? conversation),
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
          send({ type: 'error', error: payload, message: reply })
        } else {
          update(settleReply(reply, 'stopped', Date.now()))
          await persist()
          send({ type: 'aborted', message: reply })
        }
      } else {
        const payload = errorPayload(error)
        update(settleReply(reply, 'error', Date.now(), payload))
        await persist()
        send({ type: 'error', error: payload, message: reply })
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
    for (const active of this.active.values()) {
      clearTimeout(active.timer)
      active.controller.abort()
    }
    await Promise.allSettled([...this.pending])
    await this.store.flush().catch(() => {})
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
