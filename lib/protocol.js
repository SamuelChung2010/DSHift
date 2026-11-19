/**
 * Pure protocol helpers for the DeepSeek Chat mode.
 *
 * The chat speaks DeepSeek's Anthropic-compatible Messages API. The complete
 * conversation is reconstructed from this plugin's own persisted history; the
 * helpers below fold streamed events into display/persisted blocks and rebuild
 * a request body from completed turn pairs.
 */

/** Official identity line used by the web/app assistant. */
export const DEFAULT_SYSTEM_PROMPT = '该助手为DeepSeek，由深度求索公司创造。'

/** Model used when the caller does not choose one. */
export const CHAT_MODEL = 'deepseek-flash'

/** Human-facing label of the default model. */
export const CHAT_MODEL_NAME = 'DeepSeek V4.1 Flash'

/** Roles this plugin writes to its own store. */
export const MESSAGE_ROLE = Object.freeze({ user: 'user', assistant: 'assistant' })

/**
 * Thinking parameters for one Messages request.
 *
 * The API separates the switch (`thinking.type`) from the intensity
 * (`output_config.effort`). An explicit type wins over effort, so the effort is
 * only meaningful while thinking is on; sending it with thinking disabled would
 * be ignored but noisy, therefore it is omitted.
 * @param thinking - whether the reply should reason first.
 * @param effort - "low" | "high" | "max" (already validated by the caller).
 */
export function thinkingParams(thinking, effort = 'high') {
  if (!thinking) return { thinking: { type: 'disabled' } }
  // Accept the API's compatibility aliases (minimal/low/high/max/ultra...) but
  // only ever send one of the three real tiers.
  const tier = effort === 'max' || effort === 'ultra'
    ? 'max'
    : effort === 'low' || effort === 'minimal'
      ? 'low'
      : 'high'
  return {
    thinking: { type: 'enabled' },
    output_config: { effort: tier },
  }
}

/** Search tools declared for each request; url reading is always available. */
export function serverTools(search) {
  const tools = [{ type: 'deepseek_read_url', name: 'deepseek_read_url' }]
  if (search) tools.push({ type: 'deepseek_web_search', name: 'deepseek_web_search' })
  return tools
}

/** Trim a server title and keep it within the storage/UI bound. */
export function normalizeTitle(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, 80)
}

/** A display title derived from the first human turn. */
export function titleFromUserMessage(message) {
  const text = typeof message?.content === 'string' ? message.content : ''
  const firstLine = text.split('\n').map(line => line.trim()).find(Boolean) ?? ''
  const fallback = Array.isArray(message?.files) && message.files.length > 0
    ? message.files[0].name
    : ''
  const title = normalizeTitle(firstLine || fallback)
  return title || '新对话'
}

/** Date/weekday/region/platform/language marker understood by the model. */
export function createLatestReminder({ now = new Date(), locale = 'zh', timeZone } = {}) {
  const zone = timeZone || undefined
  let date
  try {
    date = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit', timeZone: zone,
    }).format(now)
  } catch {
    date = now.toISOString().slice(0, 10)
  }
  let weekday
  try {
    weekday = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
      weekday: 'long', timeZone: zone,
    }).format(now)
  } catch {
    weekday = ''
  }
  const language = locale === 'zh' ? '中文' : 'English'
  return [date, weekday, '', 'Web', language].join(',')
}

/** Keep only fields the UI needs; encrypted search payloads are not persisted. */
function sanitizeSearchItem(item) {
  if (item === null || typeof item !== 'object') return null
  if (item.type === 'web_search_tool_result_error') {
    return { type: 'web_search_tool_result_error', error_code: item.error_code ?? 'unavailable' }
  }
  if (item.type !== 'web_search_result') return null
  const result = {
    type: 'web_search_result',
    title: typeof item.title === 'string' ? item.title : '',
    url: typeof item.url === 'string' ? item.url : '',
    snippet: typeof item.snippet === 'string' ? item.snippet : '',
    site_name: typeof item.site_name === 'string' ? item.site_name : null,
    site_icon: typeof item.site_icon === 'string' ? item.site_icon : null,
    page_age: typeof item.page_age === 'string' ? item.page_age : null,
  }
  if (typeof item.image_url === 'string') result.image_url = item.image_url
  return result
}

function sanitizeFetchContent(content) {
  if (content === null || typeof content !== 'object') return content
  if (content.type === 'web_fetch_tool_result_error') {
    return { type: 'web_fetch_tool_result_error', error_code: content.error_code ?? 'unavailable' }
  }
  if (content.type !== 'web_fetch_result') return content
  return {
    type: 'web_fetch_result',
    url: typeof content.url === 'string' ? content.url : '',
    title: typeof content.title === 'string' ? content.title : null,
    published_at: typeof content.published_at === 'string' ? content.published_at : null,
    content: {
      type: 'document',
      source: { type: 'text', media_type: 'text/plain', data: '' },
      title: typeof content.content?.title === 'string' ? content.content.title : null,
    },
  }
}

function sanitizeCitation(citation) {
  if (citation === null || typeof citation !== 'object') return null
  if (citation.type !== 'web_search_result_location') return null
  return {
    type: 'web_search_result_location',
    url: typeof citation.url === 'string' ? citation.url : '',
    title: typeof citation.title === 'string' ? citation.title : null,
    cited_text: typeof citation.cited_text === 'string' ? citation.cited_text : '',
    encrypted_index: typeof citation.encrypted_index === 'string' ? citation.encrypted_index : '',
  }
}

/** System prompt used when Chat drafts an implementation brief for Agent mode. */
export const HANDOFF_SYSTEM_PROMPT = [
  '你是 DeepSeek Harness 的资深软件工程师，负责把一次产品/技术讨论整理成可以直接交给编码 Agent 执行的任务说明。',
  '输出要求：',
  '1. 只输出任务说明本身，不要寒暄、不要复述这份要求、不要用代码块包裹整篇内容。',
  '2. 使用与讨论相同的语言（默认中文）。',
  '3. 用 Markdown 分节，顺序为：目标、背景与已确认的结论、需要修改或新增的内容、实现要点与约束、验收标准。',
  '4. 具体、可执行：写出目录/文件、接口、数据结构、边界条件；不要写“优化一下”这类空话。',
  '5. 只依据讨论中已经确认的信息；尚未确定的地方写成“待确认：…”。',
  '6. 总长度控制在 900 字以内。',
].join('\n')

const HANDOFF_MAX_MESSAGES = 16
const HANDOFF_MAX_CHARS = 3200

/** Flatten a stored conversation into the transcript lines the brief reuses. */
function handoffTranscript(messages, locale) {
  const turns = Array.isArray(messages) ? messages.slice(-HANDOFF_MAX_MESSAGES) : []
  return turns.flatMap((message) => {
    if (message === null || typeof message !== 'object') return []
    if (message.role === 'user') {
      const files = Array.isArray(message.files) && message.files.length > 0
        ? (locale === 'en' ? ` [files: ${message.files.map(file => file.name).join(', ')}]` : ` [附件：${message.files.map(file => file.name).join('、')}]`)
        : ''
      const text = typeof message.content === 'string' ? message.content.trim() : ''
      if (text === '' && files === '') return []
      return [`### ${locale === 'en' ? 'User' : '用户'}\n${text.slice(0, HANDOFF_MAX_CHARS)}${files}`]
    }
    const text = getReplyText(message).trim()
    if (text === '') return []
    return [`### ${locale === 'en' ? 'Assistant' : '助手'}\n${text.slice(0, HANDOFF_MAX_CHARS)}`]
  })
}

/**
 * Build the single Messages-API request that turns one conversation into an
 * Agent-ready brief. `instruction` lets the user steer the draft.
 */
export function buildHandoffRequest(messages, { locale = 'zh', instruction = '' } = {}) {
  const transcript = handoffTranscript(messages, locale)
  if (transcript.length === 0) return null
  const ask = locale === 'en'
    ? 'Write the implementation brief for a coding agent from the discussion below. Do not restate the whole conversation; extract the decisions and turn them into work.'
    : '根据下面的讨论，写出交给编码 Agent 的任务说明。不要复述整段对话，提取已确认的结论并转成可执行的工作。'
  const extra = instruction.trim() === ''
    ? ''
    : (locale === 'en' ? `\n\nExtra requirement from the user: ${instruction.trim()}` : `\n\n用户额外要求：${instruction.trim()}`)
  return {
    system: HANDOFF_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `${ask}${extra}\n\n---\n\n${transcript.join('\n\n')}` }],
  }
}

/** A deterministic brief used when the drafting request cannot run. */
export function fallbackHandoffBrief(messages, { locale = 'zh' } = {}) {
  const list = Array.isArray(messages) ? messages : []
  const lastUser = [...list].reverse().find(message => message?.role === 'user')
  const lastReply = [...list].reverse().find(message => message?.role === 'assistant')
  const request = typeof lastUser?.content === 'string' ? lastUser.content.trim().slice(0, 1500) : ''
  const design = lastReply === undefined ? '' : getReplyText(lastReply).trim().slice(0, 2500)
  const files = Array.isArray(lastUser?.files) && lastUser.files.length > 0
    ? lastUser.files.map(file => file.name).join(locale === 'en' ? ', ' : '、')
    : ''
  if (locale === 'en') {
    return [
      '## Goal',
      request || 'Implement the change discussed in the chat.',
      files === '' ? '' : `\nAttached material: ${files}.`,
      design === '' ? '' : `\n## Context and decisions\n${design}`,
      '\n## Work\n- Read the relevant module before changing it and keep the existing structure.\n- Implement the change described above, including the error paths and empty states.\n- Keep the diff small; do not rewrite unrelated code.',
      '\n## Acceptance\n- The behaviour described above works end to end.\n- Build, lint and the existing tests still pass; report how each was verified.',
    ].filter(Boolean).join('\n')
  }
  return [
    '## 目标',
    request || '实现对话中讨论的改动。',
    files === '' ? '' : `\n相关材料：${files}。`,
    design === '' ? '' : `\n## 背景与已确认的结论\n${design}`,
    '\n## 需要做的事\n- 先读相关模块再动手，沿用现有的结构和风格。\n- 实现上面的改动，包含错误分支与空状态。\n- 改动尽量小，不要重写无关代码。',
    '\n## 验收标准\n- 上面的行为可以完整跑通。\n- 构建、lint 与现有测试仍然通过，并说明验证方式。',
  ].filter(Boolean).join('\n')
}

/** Convert a streamed content-block start into the plugin's stored block shape. */
function sanitizeStartBlock(block, now) {
  if (block === null || typeof block !== 'object') return null
  switch (block.type) {
    case 'text':
      return { type: 'text', text: typeof block.text === 'string' ? block.text : '', citations: [] }
    case 'thinking':
      return {
        type: 'thinking',
        thinking: typeof block.thinking === 'string' ? block.thinking : '',
        signature: typeof block.signature === 'string' ? block.signature : '',
        startedAt: now,
        endedAt: undefined,
      }
    case 'server_tool_use':
      return {
        type: 'server_tool_use',
        id: typeof block.id === 'string' ? block.id : '',
        name: block.name === 'deepseek_read_url' ? 'deepseek_read_url' : 'deepseek_web_search',
        input: block.input !== null && typeof block.input === 'object' ? block.input : {},
        kind: typeof block.kind === 'string' ? block.kind : 'search',
      }
    case 'web_search_tool_result':
      return {
        type: 'web_search_tool_result',
        tool_use_id: typeof block.tool_use_id === 'string' ? block.tool_use_id : '',
        kind: typeof block.kind === 'string' ? block.kind : 'search',
        content: Array.isArray(block.content)
          ? block.content.map(sanitizeSearchItem).filter(Boolean)
          : [],
      }
    case 'web_fetch_tool_result':
      return {
        type: 'web_fetch_tool_result',
        tool_use_id: typeof block.tool_use_id === 'string' ? block.tool_use_id : '',
        kind: typeof block.kind === 'string' ? block.kind : 'deep_search',
        content: sanitizeFetchContent(block.content),
        ...(typeof block.signature === 'string' ? { signature: block.signature } : {}),
      }
    default:
      return null
  }
}

/**
 * Fold one streamed event into an assistant reply.
 * The caller owns `blockIndexes` for one response.
 */
export function applyEvent(reply, event, now = Date.now(), blockIndexes = new Map()) {
  const next = reply.status === 'streaming' ? reply : { ...reply, status: 'streaming' }
  if (event === null || typeof event !== 'object') return next
  switch (event.type) {
    case 'message_start':
      return {
        ...next,
        usage: event.message?.usage ?? next.usage,
        model: typeof event.message?.model === 'string' ? event.message.model : next.model,
      }
    case 'content_block_start': {
      blockIndexes.delete(event.index)
      const block = sanitizeStartBlock(event.content_block, now)
      if (block === null) {
        return event.content_block?.type === 'tool_use' ? { ...next, prefix: false } : next
      }
      blockIndexes.set(event.index, next.blocks.length)
      return { ...next, blocks: [...next.blocks, block] }
    }
    case 'content_block_delta': {
      const index = blockIndexes.get(event.index)
      if (index === undefined) return next
      const block = next.blocks[index]
      const delta = event.delta
      if (block === undefined || delta === null || typeof delta !== 'object') return next
      const blocks = next.blocks.slice()
      if (block.type === 'text' && delta.type === 'text_delta' && typeof delta.text === 'string') {
        blocks[index] = { ...block, text: block.text + delta.text }
      } else if (block.type === 'thinking' && delta.type === 'thinking_delta' && typeof delta.thinking === 'string') {
        blocks[index] = { ...block, thinking: block.thinking + delta.thinking }
      } else if (block.type === 'thinking' && delta.type === 'signature_delta' && typeof delta.signature === 'string') {
        blocks[index] = { ...block, signature: block.signature + delta.signature }
      } else if (block.type === 'text' && delta.type === 'citations_delta') {
        const citation = sanitizeCitation(delta.citation)
        if (citation !== null && !block.citations.some(item => item.url === citation.url)) {
          blocks[index] = { ...block, citations: [...block.citations, citation] }
        }
      }
      return { ...next, blocks }
    }
    case 'content_block_stop': {
      const index = blockIndexes.get(event.index)
      if (index === undefined) return next
      blockIndexes.delete(event.index)
      const block = next.blocks[index]
      if (block?.type === 'thinking' && block.endedAt === undefined) {
        const blocks = next.blocks.slice()
        blocks[index] = { ...block, endedAt: now }
        return { ...next, blocks }
      }
      return next
    }
    case 'message_delta': {
      const delta = event.delta ?? {}
      return {
        ...next,
        stopReason: delta.stop_reason ?? next.stopReason,
        stopDetails: delta.stop_details ?? next.stopDetails,
        usage: event.usage ?? next.usage,
        title: normalizeTitle(delta.title) || next.title,
      }
    }
    case 'message_stop':
      return next
    default:
      return next
  }
}

/** Finish a reply, closing open thinking blocks and dropping refused prose. */
export function settleReply(reply, status, now = Date.now(), error) {
  const refused = reply.stopReason === 'refusal'
  const blocks = reply.blocks.flatMap((block) => {
    if (refused && (block.type === 'text' || block.type === 'thinking')) return []
    if (block.type === 'thinking' && block.endedAt === undefined) {
      return [{ ...block, endedAt: now }]
    }
    return [block]
  })
  return {
    ...reply,
    status,
    ...(error === undefined ? {} : { error }),
    blocks,
    updatedAt: now,
  }
}

/** Visible answer text, excluding reasoning and tool blocks. */
export function getReplyText(reply) {
  if (reply?.stopReason === 'refusal') return ''
  return (reply?.blocks ?? [])
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')
}

/** Whether a completed reply belongs in later requests. */
export function hasUsableReply(reply) {
  return reply?.role === 'assistant'
    && (reply.status === 'done' || reply.status === 'stopped')
    && reply.stopReason !== 'refusal'
    && getReplyText(reply) !== ''
}

function fileBlockParams(files) {
  if (!Array.isArray(files)) return []
  return files.flatMap((file) => {
    if (file === null || typeof file !== 'object' || typeof file.fileId !== 'string' || file.fileId === '') return []
    return [{
      type: file.isImage ? 'image' : 'document',
      source: { type: 'file', file_id: file.fileId },
    }]
  })
}

function toUserParam(message) {
  const files = fileBlockParams(message?.files)
  const text = typeof message?.content === 'string' ? message.content : ''
  if (files.length === 0) return { role: 'user', content: text }
  return {
    role: 'user',
    content: [...files, ...(text === '' ? [] : [{ type: 'text', text }])],
  }
}

function toAssistantParam(reply) {
  const blocks = Array.isArray(reply?.blocks) ? reply.blocks : []
  const unsignedReadLinks = new Set(blocks.flatMap((block) => (
    block.type === 'web_fetch_tool_result'
      && block.kind === 'read_link'
      && block.content?.type === 'web_fetch_result'
      && (typeof block.signature !== 'string' || block.signature.trim() === '')
      ? [block.tool_use_id]
      : []
  )))
  const content = []
  let text = null
  for (const block of blocks) {
    if (block.type === 'text') {
      if (text !== null) {
        text.text += block.text
      } else {
        const previous = content.at(-1)
        text = { type: 'text', text: `${previous?.type === 'text' ? '\n\n' : ''}${block.text}` }
        content.push(text)
      }
      continue
    }
    text = null
    if (
      block.type === 'server_tool_use'
      && block.kind === 'read_link'
      && !unsignedReadLinks.has(block.id)
    ) {
      content.push({
        type: 'server_tool_use',
        id: block.id,
        name: block.name,
        input: block.input,
        kind: block.kind,
      })
    } else if (
      block.type === 'web_fetch_tool_result'
      && block.kind === 'read_link'
      && !unsignedReadLinks.has(block.tool_use_id)
    ) {
      content.push(block)
    }
  }
  return {
    role: 'assistant',
    content: content.filter(block => block.type !== 'text' || block.text !== ''),
  }
}

/** Complete question/answer pairs that may be replayed to the model. */
export function getContextRounds(messages) {
  const rounds = []
  if (!Array.isArray(messages)) return rounds
  for (let index = 0; index + 1 < messages.length; index += 1) {
    const user = messages[index]
    const reply = messages[index + 1]
    if (user?.role !== 'user' || reply?.role !== 'assistant') continue
    if (!hasUsableReply(reply)) continue
    if (
      (typeof user.content !== 'string' || user.content.trim() === '')
      && fileBlockParams(user.files).length === 0
    ) {
      continue
    }
    rounds.push([user, reply])
    index += 1
  }
  return rounds
}

/**
 * Build the Messages API `messages` array.
 * `messages` includes the current user turn; the current turn is the last entry.
 */
export function buildRequestMessages(messages, currentUserId, { reminder } = {}) {
  const index = Array.isArray(messages) ? messages.findIndex(message => message.id === currentUserId) : -1
  const history = index >= 0 ? messages.slice(0, index) : []
  const current = index >= 0 ? messages[index] : null
  const result = []
  for (const [user, reply] of getContextRounds(history)) {
    result.push(toUserParam(user), toAssistantParam(reply))
  }
  if (reminder) result.push({ role: 'latest_reminder', content: reminder })
  if (current) result.push(toUserParam(current))
  return result
}

/** Presentation summary for the sidebar. */
export function conversationSummary(conversation) {
  return {
    id: conversation.id,
    title: conversation.title,
    titleAuto: conversation.titleAuto === true,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messageCount: conversation.messages.length,
  }
}

/** Whether a reply stopped before it could finish, from its own stored state. */
export function replyIsIncomplete(reply) {
  if (reply?.role !== 'assistant') return false
  if (reply.stopReason === 'refusal') return false
  return reply.status === 'stopped' || reply.status === 'error' || reply.stopReason === 'max_tokens'
}

/**
 * The assistant prefill used to resume a cut-off answer, or '' when the reply
 * cannot be continued. The Messages API treats a trailing assistant message as
 * a prefix: the model writes the missing remainder instead of repeating the
 * answer. A trailing tool call has no result to replay, so `prefix === false`
 * marks those replies as not resumable.
 */
export function continuationPrefill(reply) {
  if (reply?.role !== 'assistant') return ''
  if (reply.stopReason === 'refusal' || reply.prefix === false) return ''
  // Anthropic-style prefill must not end with whitespace.
  return getReplyText(reply).replace(/\s+$/, '')
}

/** Whether the reply has visible text that can be resumed in place. */
export function canContinueReply(reply) {
  return replyIsIncomplete(reply) && continuationPrefill(reply) !== ''
}

/**
 * Build the Messages API `messages` array for continuing one stored reply.
 * The conversation keeps the whole answer; only the request uses the visible
 * text as an assistant prefill so the model continues the same sentence
 * instead of producing an unrelated block after it.
 * @param messages - the active path, including the reply being continued.
 * @param assistantId - id of that reply.
 */
export function buildContinuationMessages(messages, assistantId, { reminder } = {}) {
  if (!Array.isArray(messages)) return null
  const index = messages.findIndex(message => message.id === assistantId)
  if (index < 1) return null
  const reply = messages[index]
  const user = messages[index - 1]
  if (user?.role !== 'user') return null
  const prefill = continuationPrefill(reply)
  if (prefill === '') return null
  const built = buildRequestMessages(messages, user.id, { reminder })
  built.push({ role: 'assistant', content: [{ type: 'text', text: prefill }] })
  return built
}


/** All unique cited/search sources of a reply, in reading order. */
export function replySources(reply) {
  const byUrl = new Map()
  for (const block of reply?.blocks ?? []) {
    if (block.type === 'text') {
      for (const citation of block.citations ?? []) {
        if (!citation.url || byUrl.has(citation.url)) continue
        byUrl.set(citation.url, {
          url: citation.url,
          title: citation.title || citation.url,
          snippet: '',
          siteName: '',
        })
      }
    }
    if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const item of block.content) {
        if (item.type !== 'web_search_result' || !item.url || byUrl.has(item.url)) continue
        byUrl.set(item.url, {
          url: item.url,
          title: item.title || item.url,
          snippet: item.snippet || '',
          siteName: item.site_name || '',
        })
      }
    }
    if (block.type === 'web_fetch_tool_result' && block.content?.type === 'web_fetch_result') {
      const url = block.content.url
      if (url && !byUrl.has(url)) {
        byUrl.set(url, {
          url,
          title: block.content.title || url,
          snippet: '',
          siteName: '',
        })
      }
    }
  }
  return [...byUrl.values()]
}
