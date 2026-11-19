/**
 * DeepSeek HTTP transport for Chat mode: authentication resolution, SSE
 * streaming, and Files API upload. Secrets never leave the Host.
 */

export class ApiError extends Error {
  constructor(message, { status, code = 'DEEPSEEK_ERROR', kind = 'http', cause } = {}) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.kind = kind
  }
}

/** Normalize a configured API root to `.../v1`. */
export function normalizeBaseURL(value) {
  const fallback = 'https://api.deepseek.com/anthropic/v1'
  let url
  try {
    url = new URL(typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback)
  } catch {
    url = new URL(fallback)
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new ApiError('API 地址必须使用 HTTP(S)。', { code: 'INVALID_BASE_URL' })
  url.pathname = url.pathname.replace(/\/+$/, '')
  if (!/\/v1$/.test(url.pathname)) url.pathname = `${url.pathname}/v1`
  url.search = ''
  url.hash = ''
  return url.toString().replace(/\/$/, '')
}

export function messagesURL(baseURL) {
  return `${normalizeBaseURL(baseURL)}/messages`
}

export function filesURL(baseURL) {
  return `${normalizeBaseURL(baseURL)}/files`
}

function envValue(name) {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}

async function resolveCredential(ctx, ref) {
  const credentials = ctx.get?.('credentials') ?? ctx.credentials
  if (credentials !== undefined && typeof credentials.resolve === 'function') {
    const hit = await credentials.resolve(ref)
    const value = hit?.value
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
  }
  return envValue(ref)
}

async function describeCredential(ctx, ref) {
  const credentials = ctx.get?.('credentials') ?? ctx.credentials
  if (credentials !== undefined && typeof credentials.describe === 'function') {
    try {
      const info = await credentials.describe(ref)
      return info?.configured === true
    } catch {
      return false
    }
  }
  return envValue(ref) !== undefined
}

async function accountToken(ctx, url) {
  const service = ctx.get?.('deepseekAccount') ?? ctx.deepseekAccount
  if (service === undefined || typeof service.resolveToken !== 'function') return undefined
  try {
    const token = await service.resolveToken(url)
    return typeof token === 'string' && token.trim() !== '' ? token.trim() : undefined
  } catch {
    return undefined
  }
}

/** Read-only authentication state for the setup UI. Never includes secrets. */
export async function authSnapshot(ctx, settings) {
  const baseURL = normalizeBaseURL(settings.baseURL)
  const url = messagesURL(baseURL)
  const chatKey = await describeCredential(ctx, 'DEEPSEEK_CHAT_API_KEY')
  const dshKey = await describeCredential(ctx, 'DEEPSEEK_API_KEY')
  const account = (await accountToken(ctx, url)) !== undefined
  const mode = settings.authMode === 'account' || settings.authMode === 'api-key' ? settings.authMode : 'auto'
  let source = null
  if (mode === 'account') {
    if (account) source = 'account'
  } else if (mode === 'api-key') {
    if (chatKey) source = 'chat-key'
    else if (dshKey) source = 'dsh-key'
  } else if (chatKey) source = 'chat-key'
  else if (dshKey) source = 'dsh-key'
  else if (account) source = 'account'
  const credentials = ctx.get?.('credentials') ?? ctx.credentials
  return {
    ready: source !== null,
    mode,
    source,
    chatKeyConfigured: chatKey,
    dshKeyConfigured: dshKey,
    accountSignedIn: account,
    canStoreKey: credentials !== undefined && typeof credentials.set === 'function',
  }
}

/** Resolve the header set for one operation. */
export async function resolveAuth(ctx, settings) {
  const baseURL = normalizeBaseURL(settings.baseURL)
  const url = messagesURL(baseURL)
  const mode = settings.authMode === 'account' || settings.authMode === 'api-key' ? settings.authMode : 'auto'
  const chatKey = mode === 'account' ? undefined : await resolveCredential(ctx, 'DEEPSEEK_CHAT_API_KEY')
  const dshKey = mode === 'account' ? undefined : await resolveCredential(ctx, 'DEEPSEEK_API_KEY')
  if (chatKey !== undefined) {
    return { mode: 'api-key', source: 'chat-key', headers: { 'x-api-key': chatKey } }
  }
  if (dshKey !== undefined) {
    return { mode: 'api-key', source: 'dsh-key', headers: { 'x-api-key': dshKey } }
  }
  if (mode !== 'api-key') {
    const token = await accountToken(ctx, url)
    if (token !== undefined) {
      return { mode: 'account', source: 'account', headers: { 'x-dsh-auth-token': token } }
    }
  }
  throw new ApiError(
    mode === 'account'
      ? '未找到可用的 DeepSeek 账号登录。请在 DSH 设置中登录 DeepSeek 账号，或改用 API Key。'
      : mode === 'api-key'
        ? '未配置 DeepSeek API Key。请在 Chat 设置中填写 API Key，或设置 DEEPSEEK_API_KEY 环境变量。'
        : 'Chat 需要 DeepSeek 账号登录或 API Key。请在 DSH 设置中登录账号，或在 Chat 设置中填写 API Key。',
    { code: 'AUTH_REQUIRED', status: 401 },
  )
}

function hasFileBlocks(body) {
  return Array.isArray(body?.messages) && body.messages.some(message => (
    Array.isArray(message?.content)
      && message.content.some(block => block?.type === 'image' || block?.type === 'document')
  ))
}

async function responseError(response) {
  let text = ''
  try {
    text = await response.text()
  } catch {
    text = ''
  }
  let message = text
  try {
    const parsed = JSON.parse(text)
    if (typeof parsed?.error?.message === 'string') message = parsed.error.message
  } catch {
    // keep raw text
  }
  if (message.length > 700) message = `${message.slice(0, 700)}…`
  const code = response.status === 401 ? 'AUTH' : response.status === 402 ? 'QUOTA' : response.status === 429 ? 'RATE_LIMIT' : 'HTTP_ERROR'
  return new ApiError(message || `DeepSeek 返回 HTTP ${response.status}`, { status: response.status, code })
}

function sseEvents(body, signal) {
  return (async function* generate() {
    if (body === null) throw new ApiError('DeepSeek 返回了空响应。', { code: 'EMPTY_RESPONSE', kind: 'protocol' })
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let dataLines = []
    let eventName = ''
    const flush = function* flushEvent() {
      if (dataLines.length === 0) return
      const data = dataLines.join('\n')
      dataLines = []
      const name = eventName
      eventName = ''
      if (data === '[DONE]') return
      let payload
      try {
        payload = JSON.parse(data)
      } catch {
        if (name === 'error') {
          yield { type: 'error', error: { message: data.slice(0, 500), type: 'api_error' } }
          return
        }
        return
      }
      if (payload?.type === 'error' || (payload?.error && typeof payload.error.message === 'string') || (name === 'error' && payload?.error)) {
        yield {
          type: 'error',
          error: {
            message: typeof payload.error?.message === 'string' ? payload.error.message : data.slice(0, 500),
            type: payload.error?.type ?? 'api_error',
          },
        }
        return
      }
      if (payload !== null && typeof payload === 'object') yield payload
    }
    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let newline
        while ((newline = buffer.indexOf('\n')) >= 0) {
          let line = buffer.slice(0, newline)
          buffer = buffer.slice(newline + 1)
          if (line.endsWith('\r')) line = line.slice(0, -1)
          if (line === '') {
            yield* flush()
            continue
          }
          if (line.startsWith(':')) continue
          const colon = line.indexOf(':')
          const field = colon < 0 ? line : line.slice(0, colon)
          let fieldValue = colon < 0 ? '' : line.slice(colon + 1)
          if (fieldValue.startsWith(' ')) fieldValue = fieldValue.slice(1)
          if (field === 'data') dataLines.push(fieldValue)
          else if (field === 'event') eventName = fieldValue
        }
      }
      buffer += decoder.decode()
      if (buffer.trim() !== '') {
        const line = buffer.endsWith('\r') ? buffer.slice(0, -1) : buffer
        if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
      }
      yield* flush()
    } finally {
      try {
        await reader.cancel()
      } catch {
        // The socket may already be gone.
      }
      if (signal?.aborted) {
        const reason = signal.reason
        if (reason instanceof Error) throw reason
        throw new ApiError('请求已取消。', { code: 'ABORTED', kind: 'aborted' })
      }
    }
  })()
}

/**
 * POST one streaming Messages request and yield parsed events.
 * `fetchImpl` exists for tests; production uses global fetch.
 */
export async function* streamMessage({ baseURL, auth, body, signal, fetchImpl = fetch }) {
  const headers = {
    ...auth.headers,
    'content-type': 'application/json',
    accept: 'text/event-stream',
    ...(hasFileBlocks(body) ? { 'anthropic-beta': 'files-api-2025-04-14' } : {}),
  }
  let response
  try {
    response = await fetchImpl(messagesURL(baseURL), {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...body, stream: true }),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw new ApiError('已停止生成。', { code: 'ABORTED', kind: 'aborted', cause: error })
    throw new ApiError(`无法连接 DeepSeek：${error instanceof Error ? error.message : String(error)}`, { code: 'NETWORK', kind: 'network', cause: error })
  }
  if (!response.ok) throw await responseError(response)
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('text/event-stream')) {
    throw new ApiError('DeepSeek 返回了非流式响应。', { code: 'PROTOCOL', kind: 'protocol', status: response.status })
  }
  yield* sseEvents(response.body, signal)
}

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff'])
const LAYOUT_EXT = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx'])

export function fileExtension(name) {
  const value = typeof name === 'string' ? name : ''
  const dot = value.lastIndexOf('.')
  return dot > 0 ? value.slice(dot + 1).toLowerCase() : ''
}

export function isImageFile(name, mimeType) {
  if (typeof mimeType === 'string' && mimeType.toLowerCase().startsWith('image/')) return true
  return IMAGE_EXT.has(fileExtension(name))
}

export function uploadPurpose(name, mimeType) {
  if (isImageFile(name, mimeType)) return null
  return LAYOUT_EXT.has(fileExtension(name)) ? 'rich_layout_recognition' : 'user_data'
}

/** Upload one file to DeepSeek Files API and return its durable id. */
export async function uploadFile({ baseURL, auth, name, mimeType, bytes, signal, fetchImpl = fetch }) {
  const safeName = typeof name === 'string' && name.trim() !== '' ? name.trim().slice(0, 200) : 'file'
  const purpose = uploadPurpose(safeName, mimeType)
  const form = new FormData()
  if (purpose !== null) form.append('purpose', purpose)
  const blob = new Blob([bytes], { type: typeof mimeType === 'string' && mimeType !== '' ? mimeType : 'application/octet-stream' })
  form.append('file', blob, safeName)
  let response
  try {
    response = await fetchImpl(filesURL(baseURL), {
      method: 'POST',
      headers: {
        ...auth.headers,
        'anthropic-beta': 'files-api-2025-04-14',
      },
      body: form,
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw new ApiError('上传已取消。', { code: 'ABORTED', kind: 'aborted', cause: error })
    throw new ApiError(`无法上传到 DeepSeek：${error instanceof Error ? error.message : String(error)}`, { code: 'NETWORK', kind: 'network', cause: error })
  }
  if (!response.ok) throw await responseError(response)
  let value
  try {
    value = await response.json()
  } catch (error) {
    throw new ApiError('DeepSeek 文件接口返回了无效 JSON。', { code: 'PROTOCOL', kind: 'protocol', cause: error })
  }
  if (typeof value?.id !== 'string' || value.id === '') {
    throw new ApiError('DeepSeek 文件接口未返回 file id。', { code: 'PROTOCOL', kind: 'protocol' })
  }
  return {
    fileId: value.id,
    name: typeof value.filename === 'string' && value.filename !== '' ? value.filename : safeName,
    bytes: typeof value.size_bytes === 'number' ? value.size_bytes : bytes.length,
    mimeType: typeof value.mime_type === 'string' ? value.mime_type : (mimeType || 'application/octet-stream'),
    purpose,
    isImage: purpose === null,
  }
}
