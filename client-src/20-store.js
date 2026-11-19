let appCtx
let tr = key => key

function setClientContext(ctx) {
  appCtx = ctx
  tr = ctx.locale.bind(CHAT_NS)
}

function useT() {
  const [, force] = React.useState(0)
  React.useEffect(() => {
    if (!appCtx) return undefined
    return appCtx.locale.subscribe(() => force(value => value + 1))
  }, [])
  return tr
}

const STORAGE_KEY = 'dsh-deepseek-chat:v1'
const MAX_FILES = 10
const MAX_UPLOAD_MB = 64
const MAX_USER_DATA_MB = 32
const LAYOUT_EXT = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx'])
const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff'])
const ACCEPT_EXT = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff',
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'jsonl', 'yaml', 'yml', 'xml', 'html', 'htm',
  'css', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'go', 'rs', 'rb', 'php',
  'sh', 'bash', 'ps1', 'sql', 'log', 'ini', 'toml', 'conf', 'tex', 'rst', 'epub', 'mobi', 'xls', 'xlsx',
]
const ACCEPT = ACCEPT_EXT.map(ext => `.${ext}`).join(',')
/** Sidebar geometry contract, shared with the native Harness sidebar drag range. */
const SIDEBAR_MIN = 264
const SIDEBAR_MAX = 420
const SIDEBAR_DEFAULT = 280
/** The chat column never gives up more than this to the sidebar at one window width. */
const CHAT_COLUMN_MIN = 460

/**
 * Clamp one sidebar width into the contract range, also keeping the chat column
 * usable on a narrow window. The stored preference is the user's; this function
 * decides only what fits right now.
 * @param value - requested width in px.
 * @param viewport - window width in px.
 * @returns the width to render and persist.
 */
function clampSidebarWidth(value, viewport) {
  const width = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : SIDEBAR_DEFAULT
  const max = typeof viewport === 'number' && Number.isFinite(viewport) && viewport > 0
    ? Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, viewport - CHAT_COLUMN_MIN))
    : SIDEBAR_MAX
  return Math.min(max, Math.max(SIDEBAR_MIN, width))
}

/**
 * Greeting options for a blank Chat page. A name-capable option also carries a
 * natural no-name variant, so an unavailable account name is omitted as part of
 * the sentence instead of leaving a dangling placeholder behind.
 */
const GREETINGS = [
  { named: 'greeting1Named', plain: 'greeting1Plain' },
  { named: 'greeting2Named', plain: 'greeting2Plain' },
  { plain: 'greeting3Plain' },
  { plain: 'greeting4Plain' },
  { named: 'greeting5Named', plain: 'greeting5Plain' },
  { plain: 'greeting6Plain' },
  { plain: 'greeting7Plain' },
  { plain: 'greeting8Plain' },
  { plain: 'greeting9Plain' },
  { plain: 'greeting10Plain' },
  { plain: 'greeting11Plain' },
  { plain: 'greeting12Plain' },
]

/**
 * Pick the next blank-page greeting, never the one already showing. Uniform
 * among the other options, so a second consecutive repeat is impossible.
 * @param previous - the greeting currently on screen, or an invalid index.
 * @param random - random source in [0, 1); injectable for tests.
 * @returns the chosen greeting index.
 */
function pickGreetingIndex(previous, random = Math.random) {
  const count = GREETINGS.length
  const current = Number.isInteger(previous) && previous >= 0 && previous < count ? previous : -1
  const pool = current >= 0 ? count - 1 : count
  const roll = Math.floor(random() * pool)
  const pick = Math.min(pool - 1, Math.max(0, roll))
  return current >= 0 && pick >= current ? pick + 1 : pick
}

function readStored() {
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) ?? '{}')
    return value !== null && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

function writeStored(patch) {
  try {
    const current = readStored()
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }))
  } catch {
    // Storage can be unavailable on a file:// page; the mode still works for this session.
  }
}

const stored = readStored()

const chatStore = {
  state: {
    open: stored.open === true,
    boot: 'idle',
    bootError: '',
    bootData: null,
    auth: null,
    settings: { authMode: 'auto', thinking: false, search: false, systemPrompt: '' },
    // Model catalog and preferences, filled from the Host bootstrap. The
    // fallback keeps the composer usable while an older Host half answers.
    models: [],
    modelConfig: null,
    modelChoice: { model: 'deepseek-flash', effort: 'high' },
    // Composer send key: "enter" (Enter sends) or "ctrl-enter" (Ctrl/Cmd+Enter
    // sends). A browser preference, stored next to the layout settings.
    sendKey: stored.sendKey === 'ctrl-enter' ? 'ctrl-enter' : 'enter',
    conversations: [],
    folders: [],
    workspaces: [],
    limits: { maxFiles: MAX_FILES, maxUploadBytes: MAX_UPLOAD_MB, maxUserDataBytes: MAX_USER_DATA_MB * 1024 * 1024 },
    activeId: typeof stored.activeId === 'string' ? stored.activeId : null,
    messages: [],
    conversationLoading: false,
    conversationError: '',
    streaming: null,
    stopping: false,
    sending: false,
    draft: '',
    attachments: [],
    toasts: [],
    settingsOpen: false,
    handoff: null,
    confirm: null,
    // The Harness frame auto-collapses its sidebar below 1024px; following the
    // same breakpoint keeps the shared switch's centre identical in both modes.
    sidebarOpen: typeof window !== 'undefined' ? window.innerWidth > 1024 : true,
    // One Chat-owned width preference. It follows the same 264-420px contract
    // and drag handle behaviour as the native sidebar, but Chat remembers it
    // across restarts instead of resetting to the contract default.
    sidebarWidth: clampSidebarWidth(stored.sidebarWidth, typeof window !== 'undefined' ? window.innerWidth : undefined),
    // Last known account display name for the greeting; refreshed from the Host
    // and cached here so a reload paints the personalized line immediately.
    userName: typeof stored.userName === 'string' ? stored.userName : '',
    // One greeting per blank conversation: chosen at launch and re-rolled by
    // "New chat" (never the same one twice in a row).
    greetingIndex: pickGreetingIndex(-1),
    renamingId: null,
    focusRequest: 0,
    filePickRequest: 0,
    // ---- conversation organization (sidebar) ----
    // One floating menu at a time, anchored at the pointer. `kind` selects the
    // item list; `id` is the conversation or folder it acts on.
    menu: null,
    // Create/rename folder prompt, single-chat folder picker, multi-chat folder
    // picker and the archive manager are separate surfaces.
    folderPrompt: null,
    moveChat: null,
    folderAdd: null,
    archiveOpen: false,
    // Inline editor for one historical user message.
    editingId: null,
    editDraft: '',
    // Message to bring into view after loading or switching a version.
    focusMessage: null,
  },
  listeners: new Set(),
  subscribe(listener) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  },
  emit() {
    for (const listener of [...this.listeners]) {
      try {
        listener()
      } catch (error) {
        console.error('deepseek-chat: store listener failed', error)
      }
    }
  },
  set(patch) {
    this.state = { ...this.state, ...patch }
    this.emit()
  },
  toast(message, kind = 'info') {
    if (!message) return
    const id = uid()
    this.set({ toasts: [...this.state.toasts, { id, message, kind }] })
    setTimeout(() => {
      this.set({ toasts: this.state.toasts.filter(item => item.id !== id) })
    }, kind === 'error' ? 6500 : 3800)
  },
}

function useChat(selector) {
  const [, force] = React.useState(0)
  React.useEffect(() => chatStore.subscribe(() => force(value => value + 1)), [])
  return selector(chatStore.state)
}

function uid() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
  } catch {
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

function endpoint(path) {
  if (typeof document !== 'undefined' && typeof location !== 'undefined'
    && (location.protocol === 'http:' || location.protocol === 'https:')) {
    // Resolve against the document base so a mounted page keeps its prefix.
    return new URL(path.replace(/^\//, ''), document.baseURI).href
  }
  return path
}

async function hostFetch(path, init = {}) {
  const carrier = globalThis.__DSH_TRANSPORT__?.fetch
  if (typeof carrier === 'function') {
    const url = typeof document !== 'undefined'
      ? new URL(path.replace(/^\//, ''), document.baseURI).href
      : path
    return carrier(url, init)
  }
  return fetch(endpoint(path), init)
}

async function hostJson(path, body) {
  const init = body === undefined
    ? { method: 'GET' }
    : {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
  const response = await hostFetch(path, init)
  const text = await response.text()
  let value
  try {
    value = JSON.parse(text)
  } catch {
    const error = new Error(text || `HTTP ${response.status}`)
    error.status = response.status
    throw error
  }
  if (!response.ok) {
    const error = new Error(value?.error?.message || `HTTP ${response.status}`)
    error.payload = value?.error
    error.status = response.status
    throw error
  }
  return value
}

async function streamChat(payload, { signal, onItem }) {
  const response = await hostFetch('/api/deepseek-chat/stream', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
  if (!response.ok) {
    let text = ''
    try {
      text = await response.text()
    } catch {
      text = ''
    }
    let value
    try {
      value = JSON.parse(text)
    } catch {
      value = null
    }
    const error = new Error(value?.error?.message || text || `HTTP ${response.status}`)
    error.payload = value?.error
    error.status = response.status
    throw error
  }
  if (response.body === null) throw new Error(tr('emptyResponse'))
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let newline
    while ((newline = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newline).trim()
      buffer = buffer.slice(newline + 1)
      if (line === '') continue
      let item
      try {
        item = JSON.parse(line)
      } catch {
        continue
      }
      onItem(item)
    }
  }
  buffer += decoder.decode()
  const tail = buffer.trim()
  if (tail !== '') {
    try {
      onItem(JSON.parse(tail))
    } catch {
      // A partial final line means the connection ended mid-frame; the Host has
      // already settled the reply, and the next bootstrap reload will reconcile it.
    }
  }
}

function friendlyError(payload, fallback) {
  const code = payload?.code
  if (code === 'AUTH' || code === 'AUTH_REQUIRED' || payload?.status === 401) {
    return { text: tr('errorAuth'), action: 'settings' }
  }
  if (code === 'NETWORK') return { text: tr('errorNetwork') }
  if (code === 'RATE_LIMIT' || payload?.status === 429) return { text: tr('errorRate') }
  if (code === 'QUOTA' || payload?.status === 402) return { text: tr('errorQuota') }
  if (code === 'TIMEOUT') return { text: tr('errorTimeout') }
  if (code === 'CONTENT_REFUSED') return { text: tr('refused') }
  if (typeof payload?.status === 'number' && payload.status >= 500) return { text: tr('errorServer') }
  const message = typeof payload?.message === 'string' && payload.message !== ''
    ? payload.message
    : typeof fallback === 'string' ? fallback : 'Unknown error'
  return { text: tr('errorGeneric', { message }) }
}

function conversationSummary(conversation) {
  return {
    id: conversation.id,
    title: conversation.title,
    titleAuto: conversation.titleAuto === true,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    pinned: conversation.pinned === true,
    pinnedAt: conversation.pinnedAt ?? null,
    archived: conversation.archived === true,
    archivedAt: conversation.archivedAt ?? null,
    folderId: conversation.folderId ?? null,
    messageCount: Array.isArray(conversation.messages) ? conversation.messages.length : (conversation.messageCount ?? 0),
  }
}

function sortConversations(list) {
  return [...list].sort((left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0))
}

/** Sidebar ordering: most recently active first, with a stable id tie-break. */
function byActivity(left, right) {
  const delta = (right.updatedAt ?? 0) - (left.updatedAt ?? 0)
  if (delta !== 0) return delta
  return String(left.id).localeCompare(String(right.id))
}

/**
 * Group the summaries for the sidebar: pinned chats first (always, even when
 * they also belong to a folder), then one bucket per folder, then the unfiled
 * chats. Archived chats are left to the archive manager. Every bucket keeps a
 * deterministic order, so a refresh never reshuffles equal timestamps.
 */
function organizeSidebar(conversations, folders) {
  const visible = conversations.filter(conversation => conversation.archived !== true)
  const pinned = visible.filter(conversation => conversation.pinned === true).sort(byActivity)
  const buckets = new Map(folders.map(folder => [folder.id, []]))
  const loose = []
  for (const conversation of visible) {
    if (conversation.pinned === true) continue
    const bucket = conversation.folderId !== null ? buckets.get(conversation.folderId) : undefined
    if (bucket === undefined) loose.push(conversation)
    else bucket.push(conversation)
  }
  loose.sort(byActivity)
  for (const bucket of buckets.values()) bucket.sort(byActivity)
  return {
    pinned,
    folders: folders.map(folder => ({ folder, conversations: buckets.get(folder.id) ?? [] })),
    loose,
    archivedCount: conversations.filter(conversation => conversation.archived === true).length,
  }
}

/** Replace the sidebar snapshot from a Host organization response. */
function applyOrganization(data) {
  const patch = {}
  if (Array.isArray(data?.summaries)) patch.conversations = sortConversations(data.summaries)
  if (Array.isArray(data?.folders)) patch.folders = data.folders
  if (Object.keys(patch).length > 0) chatStore.set(patch)
}

/** Visible answer text of one assistant reply. */
function messageBodyText(message) {
  return (message?.blocks ?? [])
    .filter(block => block?.type === 'text' && typeof block.text === 'string')
    .map(block => block.text)
    .join('')
}

/**
 * Whether an answer can be resumed from its own visible prefix. Refused and
 * tool-terminated answers cannot be continued; an empty answer has nothing to
 * continue from either.
 */
function canContinueReply(message) {
  if (!message || message.role !== 'assistant') return false
  if (message.stopReason === 'refusal' || message.prefix === false) return false
  const incomplete = message.status === 'stopped' || message.status === 'error' || message.stopReason === 'max_tokens'
  return incomplete && messageBodyText(message).trim() !== ''
}

/** Files as the Host stores them: preview URLs never leave this browser. */
function hostFiles(files) {
  return (Array.isArray(files) ? files : []).flatMap((file) => {
    if (!file || typeof file.fileId !== 'string' || file.fileId === '') return []
    return [{
      id: file.id,
      fileId: file.fileId,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      isImage: file.isImage === true,
    }]
  })
}

/** Re-attach local image previews to the authoritative file metadata. */
function withFilePreviews(messages, previousMessages) {
  const previews = new Map()
  for (const message of Array.isArray(previousMessages) ? previousMessages : []) {
    for (const file of message?.files ?? []) {
      if (file?.fileId && file.previewUrl) previews.set(file.fileId, file.previewUrl)
    }
  }
  if (previews.size === 0) return messages
  return messages.map((message) => {
    if (!Array.isArray(message?.files) || message.files.length === 0) return message
    let changed = false
    const files = message.files.map((file) => {
      const previewUrl = file?.fileId ? previews.get(file.fileId) : undefined
      if (!previewUrl || file.previewUrl === previewUrl) return file
      changed = true
      return { ...file, previewUrl }
    })
    return changed ? { ...message, files } : message
  })
}

/** Locale tag for one stream request. */
function streamLocale() {
  return appCtx?.locale.getSnapshot().active === 'zh' ? 'zh' : 'en'
}

/** A fresh assistant placeholder for an optimistic branch. */
function makeReplyPlaceholder(settings, choice = currentModelChoice()) {
  const now = Date.now()
  return {
    id: uid(),
    role: 'assistant',
    createdAt: now,
    updatedAt: now,
    model: choice.model.id,
    effort: choice.effort,
    thinking: settings.thinking === true,
    search: settings.search === true,
    status: 'streaming',
    blocks: [],
    prefix: true,
  }
}

/**
 * Whether the Chat page is a blank new conversation, i.e. whether the shared
 * shell switch may show. The answer comes from the message model and the
 * conversation summaries, never from the DOM:
 * - an in-flight first send counts as started immediately, before the reply;
 * - a loaded conversation with messages is not blank, and neither is a
 *   conversation whose summary already reports messages while its history is
 *   still loading (so switching to an existing conversation never flashes it);
 * - a restored session is not judged blank until bootstrap has reported the
 *   conversation list.
 */
function chatPageIsBlank(state) {
  if (state.sending === true || state.streaming !== null) return false
  if (state.messages.length > 0) return false
  if (state.activeId === null) return true
  const summary = state.conversations.find(item => item.id === state.activeId)
  if (summary !== undefined) return (summary.messageCount ?? 0) === 0
  return state.boot === 'ready'
}

function upsertSummary(summary) {
  if (!summary || typeof summary.id !== 'string') return
  const exists = chatStore.state.conversations.some(item => item.id === summary.id)
  const next = exists
    ? chatStore.state.conversations.map(item => (item.id === summary.id ? { ...item, ...summary } : item))
    : [summary, ...chatStore.state.conversations]
  chatStore.set({ conversations: sortConversations(next) })
}

function replaceAssistant(reply) {
  chatStore.set({
    messages: chatStore.state.messages.map(message => (message.id === reply.id ? reply : message)),
  })
}

function patchUserMessage(id, patch) {
  chatStore.set({
    messages: chatStore.state.messages.map(message => (message.id === id ? { ...message, ...patch } : message)),
  })
}

let bootPromise = null
let sendInFlight = false
let handoffSequence = 0

/** Mirror the send guard into the store so the shell switch hides on send. */
function markSendInFlight(value) {
  sendInFlight = value
  if (chatStore.state.sending !== value) chatStore.set({ sending: value })
}

/** Display name accepted for the greeting: trimmed; the account name is shown as-is. */
function greetingUserName(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Resolve one greeting option for the current name. Name-capable options use
 * their personalized form only with a real display name; every other case reads
 * the natural no-name form.
 * @param t - translator bound to the Chat namespace.
 * @param index - greeting index from the store.
 * @param userName - latest account display name, possibly empty.
 * @returns the greeting line.
 */
function greetingText(t, index, userName) {
  const option = GREETINGS[index] ?? GREETINGS[0]
  const name = greetingUserName(userName)
  if (name !== '' && option.named !== undefined) return t(option.named, { name })
  return t(option.plain)
}

let profileFetchedAt = 0
const PROFILE_REFRESH_MS = 60 * 1000

/**
 * Read the account display name. The Chat Host route is preferred (it keeps
 * account access on the Host and caches the answer); an older Host half that
 * does not serve it yet falls back to the account Remote the shell already
 * mounts, so the greeting personalizes without waiting for a Host reload.
 * @param locale - active UI language for the Platform request.
 * @returns `{ name, resolved }`; `resolved: false` means a temporary failure, so
 * the caller keeps the last known name instead of clearing it.
 */
async function readUserProfileName(locale) {
  try {
    const data = await hostJson(`/api/deepseek-chat/profile?locale=${locale}`)
    return { name: greetingUserName(data?.name), resolved: data?.resolved !== false }
  } catch {
    // The running Host half may predate the profile route.
  }
  try {
    const service = appCtx?.get?.('remote.account')
    if (service === undefined || typeof service.getProfile !== 'function') return { name: '', resolved: false }
    const release = globalThis.__DSH_BOOT__?.release
    const version = typeof release?.version === 'string' && release.version !== '' ? release.version : '0.1.0'
    const result = await service.getProfile({
      version,
      locale,
      timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
    })
    if (result?.ok !== true) return { name: '', resolved: false }
    const profile = result.value
    if (profile?.status !== 'ready') return { name: '', resolved: true }
    return { name: greetingUserName(profile.value?.name), resolved: true }
  } catch {
    return { name: '', resolved: false }
  }
}

/**
 * Refresh the personalized greeting from the Host. Personalization is optional:
 * a Host without the profile route, a signed-out account, or an offline
 * Platform keeps the last known name (or the localized fallback) and never
 * interrupts the Chat surface. A resolved empty name clears a stale account
 * name after sign-out or an account switch.
 */
async function refreshUserProfile(force = false) {
  const now = Date.now()
  if (!force && profileFetchedAt !== 0 && now - profileFetchedAt < PROFILE_REFRESH_MS) return
  profileFetchedAt = now
  const locale = (appCtx?.locale.getSnapshot().active ?? '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
  const { name, resolved } = await readUserProfileName(locale)
  if (!resolved) {
    // Retry on the next Chat open rather than waiting out the throttle after a
    // transient failure.
    profileFetchedAt = 0
    return
  }
  if (name !== chatStore.state.userName) {
    chatStore.set({ userName: name })
    writeStored({ userName: name })
  }
}

async function ensureBoot(force = false) {
  if (!force && (chatStore.state.boot === 'ready' || chatStore.state.boot === 'loading')) {
    return bootPromise ?? Promise.resolve()
  }
  if (bootPromise !== null && !force) return bootPromise
  chatStore.set({ boot: 'loading', bootError: '' })
  bootPromise = (async () => {
    void refreshUserProfile()
    try {
      const data = await hostJson('/api/deepseek-chat/bootstrap')
      chatStore.set({
        boot: 'ready',
        bootData: data,
        auth: data.auth,
        settings: data.settings,
        models: Array.isArray(data.models) && data.models.length > 0 ? data.models : chatStore.state.models,
        modelConfig: data.modelConfig ?? chatStore.state.modelConfig,
        conversations: data.conversations ?? [],
        folders: Array.isArray(data.folders) ? data.folders : [],
        workspaces: Array.isArray(data.workspaces) ? data.workspaces : [],
        limits: normalizeLimits(data.limits),
      })
      // A signed-out account has no display name: stop showing the last one.
      if (data.auth?.accountSignedIn === false && chatStore.state.userName !== '') {
        chatStore.set({ userName: '' })
        writeStored({ userName: '' })
      }
      const active = chatStore.state.activeId
      const exists = active !== null && (data.conversations ?? []).some(item => item.id === active)
      if (active !== null && exists) {
        await loadConversation(active, { quiet: true })
      } else if (active !== null) {
        chatStore.set({ activeId: null, messages: [] })
        writeStored({ activeId: null })
      }
      applyModelConfigFor(chatStore.state.activeId)
      return data
    } catch (error) {
      chatStore.set({ boot: 'error', bootError: error instanceof Error ? error.message : String(error) })
      return null
    } finally {
      bootPromise = null
    }
  })()
  return bootPromise
}

let conversationLoadSequence = 0

async function loadConversation(id, { quiet = false, focusMessageId = '' } = {}) {
  if (chatStore.state.streaming !== null) {
    if (chatStore.state.streaming.conversationId !== id) {
      chatStore.toast(tr('waitStreaming'), 'warning')
      return
    }
    return
  }
  if (sendInFlight) {
    chatStore.toast(tr('sendingWait'), 'warning')
    return
  }
  // Keep the text this conversation was leaving behind, then load the target's
  // own draft instead of starting from an empty field.
  stashDraft()
  clearComposer()
  const sequence = ++conversationLoadSequence
  chatStore.set({ activeId: id, conversationLoading: true, conversationError: '', editingId: null, editDraft: '' })
  applyModelConfigFor(id)
  writeStored({ activeId: id })
  try {
    const body = { action: 'get', id }
    if (typeof focusMessageId === 'string' && focusMessageId !== '') body.focusMessageId = focusMessageId
    const data = await hostJson('/api/deepseek-chat/conversation', body)
    if (sequence !== conversationLoadSequence) return
    const patch = {
      messages: Array.isArray(data.conversation?.messages) ? data.conversation.messages : [],
      conversationLoading: false,
      conversationError: '',
      focusMessage: body.focusMessageId ? { id: body.focusMessageId, at: Date.now() } : null,
    }
    if (Array.isArray(data.folders)) patch.folders = data.folders
    chatStore.set(patch)
    restoreDraft(id)
  } catch (error) {
    if (sequence !== conversationLoadSequence) return
    const message = error instanceof Error ? error.message : String(error)
    chatStore.set({ conversationLoading: false, messages: [], conversationError: message })
    if (!quiet) chatStore.toast(message, 'error')
  }
}

function openChat() {
  // Chat is a full view: a native right panel painted above the frame overlay
  // would otherwise cover it. The native service owns this action, so the
  // Agent layout stays consistent when the user switches back.
  try {
    appCtx?.get?.('layout')?.closeRightbar?.()
  } catch {
    // Optional service: the mode still opens without it.
  }
  chatStore.set({ open: true, focusRequest: chatStore.state.focusRequest + 1 })
  writeStored({ open: true })
  void ensureBoot()
  void refreshUserProfile()
}

function closeChat() {
  handoffSequence += 1
  chatStore.set({ open: false, settingsOpen: false, confirm: null, handoff: null })
  writeStored({ open: false })
}

function requestFocus() {
  chatStore.set({ focusRequest: chatStore.state.focusRequest + 1 })
}

/**
 * Set the Chat sidebar width within the shared 264-420px contract, also keeping
 * the chat column usable on a narrow window. The resizer calls this for every
 * drag frame; `saveSidebarWidth` persists the settled preference.
 */
function setSidebarWidth(width) {
  const viewport = typeof window !== 'undefined' ? window.innerWidth : undefined
  const next = clampSidebarWidth(width, viewport)
  if (next !== chatStore.state.sidebarWidth) chatStore.set({ sidebarWidth: next })
}

function saveSidebarWidth() {
  writeStored({ sidebarWidth: chatStore.state.sidebarWidth })
}

function requestFilePicker() {
  chatStore.set({ filePickRequest: chatStore.state.filePickRequest + 1 })
}

async function newChat() {
  if (chatStore.state.streaming !== null) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  if (sendInFlight) {
    chatStore.toast(tr('sendingWait'), 'warning')
    return
  }
  stashDraft()
  clearComposer()
  chatStore.set({
    activeId: null,
    messages: [],
    conversationError: '',
    renamingId: null,
    editingId: null,
    editDraft: '',
    focusMessage: null,
    menu: null,
    greetingIndex: pickGreetingIndex(chatStore.state.greetingIndex),
    focusRequest: chatStore.state.focusRequest + 1,
  })
  applyModelConfigFor(null)
  restoreDraft(null)
  writeStored({ activeId: null })
}

async function createConversation() {
  const data = await hostJson('/api/deepseek-chat/conversation', { action: 'create' })
  const summary = conversationSummary(data.conversation)
  const conversations = Array.isArray(data.summaries)
    ? sortConversations(data.summaries)
    : sortConversations([summary, ...chatStore.state.conversations])
  chatStore.set({
    activeId: data.conversation.id,
    conversations,
    ...(Array.isArray(data.folders) ? { folders: data.folders } : {}),
    messages: [],
    conversationError: '',
    editingId: null,
    editDraft: '',
    focusMessage: null,
  })
  applyModelConfigFor(data.conversation.id)
  writeStored({ activeId: data.conversation.id })
  return data.conversation.id
}

async function renameConversation(id, title) {
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', { action: 'rename', id, title })
    if (Array.isArray(data.summaries)) applyOrganization(data)
    else upsertSummary(conversationSummary(data.conversation))
    chatStore.set({ renamingId: null })
  } catch (error) {
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

function requestDeleteConversation(id, title) {
  const name = title || tr('newChatTitle')
  chatStore.set({
    confirm: {
      title: tr('deleteChatTitle'),
      message: tr('deleteChatMessage', { title: name }),
      confirmLabel: tr('deleteConfirm'),
      danger: true,
      onConfirm: async () => {
        if (chatStore.state.streaming?.conversationId === id) stopStreaming()
        try {
          const data = await hostJson('/api/deepseek-chat/conversation', { action: 'delete', id })
          applyOrganization({
            summaries: data.summaries ?? chatStore.state.conversations.filter(item => item.id !== id),
            folders: data.folders,
          })
          if (chatStore.state.activeId === id) {
            clearComposer()
            forgetDraft(id)
            chatStore.set({
              activeId: null,
              messages: [],
              conversationError: '',
              editingId: null,
              editDraft: '',
              focusMessage: null,
              greetingIndex: pickGreetingIndex(chatStore.state.greetingIndex),
            })
            writeStored({ activeId: null })
          }
        } catch (error) {
          chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
        }
      },
    },
  })
}

// ---------------------------------------------------------------------------
// Conversation organization: pin, archive, folders and the floating menu.
// ---------------------------------------------------------------------------

function openConversationMenu(conversationId, x, y) {
  chatStore.set({ menu: { kind: 'conversation', id: conversationId, x, y } })
}

function openFolderMenu(folderId, x, y) {
  chatStore.set({ menu: { kind: 'folder', id: folderId, x, y } })
}

function closeMenu() {
  if (chatStore.state.menu !== null) chatStore.set({ menu: null })
}

async function setPinned(id, pinned) {
  closeMenu()
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', { action: 'pin', id, pinned })
    applyOrganization(data)
  } catch (error) {
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

async function setArchived(id, archived) {
  closeMenu()
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', { action: 'archive', id, archived })
    applyOrganization(data)
    chatStore.toast(archived ? tr('archivedToast') : tr('unarchivedToast'), 'success')
  } catch (error) {
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

function requestFolderPrompt(mode, folder = null) {
  closeMenu()
  chatStore.set({
    folderPrompt: {
      mode: mode === 'rename' ? 'rename' : 'create',
      id: folder?.id ?? null,
      draft: mode === 'rename' ? (folder?.name ?? '') : '',
      busy: false,
    },
  })
}

function updateFolderPrompt(draft) {
  const prompt = chatStore.state.folderPrompt
  if (prompt === null) return
  chatStore.set({ folderPrompt: { ...prompt, draft } })
}

function closeFolderPrompt() {
  if (chatStore.state.folderPrompt?.busy === true) return
  chatStore.set({ folderPrompt: null })
}

async function submitFolderPrompt() {
  const prompt = chatStore.state.folderPrompt
  if (prompt === null || prompt.busy) return
  const name = typeof prompt.draft === 'string' ? prompt.draft.trim() : ''
  if (name === '') return
  chatStore.set({ folderPrompt: { ...prompt, busy: true } })
  try {
    const data = prompt.mode === 'rename'
      ? await hostJson('/api/deepseek-chat/conversation', { action: 'folder.rename', id: prompt.id, name })
      : await hostJson('/api/deepseek-chat/conversation', { action: 'folder.create', name })
    applyOrganization(data)
    chatStore.set({ folderPrompt: null })
  } catch (error) {
    const current = chatStore.state.folderPrompt
    if (current !== null) chatStore.set({ folderPrompt: { ...current, busy: false } })
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

async function toggleFolder(id) {
  const folder = chatStore.state.folders.find(item => item.id === id)
  if (folder === undefined) return
  const collapsed = folder.collapsed !== true
  chatStore.set({
    folders: chatStore.state.folders.map(item => (item.id === id ? { ...item, collapsed } : item)),
  })
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', { action: 'folder.collapse', id, collapsed })
    if (Array.isArray(data.folders)) chatStore.set({ folders: data.folders })
  } catch (error) {
    chatStore.set({
      folders: chatStore.state.folders.map(item => (item.id === id ? { ...item, collapsed: !collapsed } : item)),
    })
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

function requestDeleteFolder(folder) {
  closeMenu()
  const count = chatStore.state.conversations.filter(item => item.folderId === folder.id).length
  chatStore.set({
    confirm: {
      title: tr('deleteFolderTitle'),
      message: tr('deleteFolderMessage', { name: folder.name, count }),
      confirmLabel: tr('deleteConfirm'),
      danger: true,
      onConfirm: async () => {
        try {
          const data = await hostJson('/api/deepseek-chat/conversation', { action: 'folder.delete', id: folder.id })
          applyOrganization(data)
        } catch (error) {
          chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
        }
      },
    },
  })
}

function openMoveChat(conversationId) {
  closeMenu()
  const conversation = chatStore.state.conversations.find(item => item.id === conversationId)
  if (conversation === undefined) return
  chatStore.set({
    moveChat: { conversationId, folderId: conversation.folderId ?? null, busy: false },
  })
}

function setMoveChatFolder(folderId) {
  const move = chatStore.state.moveChat
  if (move === null) return
  chatStore.set({ moveChat: { ...move, folderId: folderId === '' ? null : folderId } })
}

function closeMoveChat() {
  if (chatStore.state.moveChat?.busy === true) return
  chatStore.set({ moveChat: null })
}

/** One-click move used by the "remove from folder" menu item. */
async function moveConversationToFolder(conversationId, folderId) {
  closeMenu()
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', {
      action: 'move',
      ids: [conversationId],
      folderId: folderId ?? null,
    })
    applyOrganization(data)
    chatStore.toast(tr('chatMoved'), 'success')
  } catch (error) {
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

async function submitMoveChat() {
  const move = chatStore.state.moveChat
  if (move === null || move.busy) return
  chatStore.set({ moveChat: { ...move, busy: true } })
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', {
      action: 'move',
      ids: [move.conversationId],
      folderId: move.folderId,
    })
    applyOrganization(data)
    chatStore.set({ moveChat: null })
    chatStore.toast(tr('chatMoved'), 'success')
  } catch (error) {
    const current = chatStore.state.moveChat
    if (current !== null) chatStore.set({ moveChat: { ...current, busy: false } })
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

function openFolderAdd(folderId) {
  closeMenu()
  const folder = chatStore.state.folders.find(item => item.id === folderId)
  if (folder === undefined) return
  chatStore.set({ folderAdd: { folderId, name: folder.name, selected: [], busy: false } })
}

function toggleFolderAddSelection(conversationId) {
  const add = chatStore.state.folderAdd
  if (add === null) return
  const selected = add.selected.includes(conversationId)
    ? add.selected.filter(id => id !== conversationId)
    : [...add.selected, conversationId]
  chatStore.set({ folderAdd: { ...add, selected } })
}

function closeFolderAdd() {
  if (chatStore.state.folderAdd?.busy === true) return
  chatStore.set({ folderAdd: null })
}

async function submitFolderAdd() {
  const add = chatStore.state.folderAdd
  if (add === null || add.busy || add.selected.length === 0) return
  chatStore.set({ folderAdd: { ...add, busy: true } })
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', {
      action: 'move',
      ids: add.selected,
      folderId: add.folderId,
    })
    applyOrganization(data)
    const count = add.selected.length
    chatStore.set({ folderAdd: null })
    chatStore.toast(tr('chatsMoved', { count }), 'success')
  } catch (error) {
    const current = chatStore.state.folderAdd
    if (current !== null) chatStore.set({ folderAdd: { ...current, busy: false } })
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

function openArchive() {
  closeMenu()
  chatStore.set({ archiveOpen: true })
}

function closeArchive() {
  chatStore.set({ archiveOpen: false })
}

function searchHistory(query) {
  return hostJson('/api/deepseek-chat/conversation', { action: 'search', query })
}

/** Open a search hit, reopening the branch it lives on when necessary. */
async function openSearchResult(result) {
  if (result === null || typeof result !== 'object' || typeof result.id !== 'string') return
  const target = typeof result.messageId === 'string' ? result.messageId : ''
  if (result.id === chatStore.state.activeId) {
    try {
      const data = await hostJson('/api/deepseek-chat/conversation', {
        action: 'get',
        id: result.id,
        ...(target === '' ? {} : { focusMessageId: target }),
      })
      if (Array.isArray(data.conversation?.messages)) {
        chatStore.set({
          messages: data.conversation.messages,
          conversationLoading: false,
          conversationError: '',
          editingId: null,
          editDraft: '',
          focusMessage: target === '' ? null : { id: target, at: Date.now() },
        })
      }
      if (Array.isArray(data.folders)) chatStore.set({ folders: data.folders })
    } catch (error) {
      chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
    }
    return
  }
  await loadConversation(result.id, { focusMessageId: target })
}

/** Step one sibling version backward or forward and reopen that branch. */
async function selectVersion(messageId, direction) {
  const state = chatStore.state
  if (state.activeId === null) return
  if (state.streaming !== null || sendInFlight) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  closeMenu()
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', {
      action: 'version',
      id: state.activeId,
      messageId,
      direction: direction < 0 ? 'prev' : 'next',
    })
    if (Array.isArray(data.summaries)) applyOrganization(data)
    const messages = data.conversation?.messages
    if (Array.isArray(messages)) {
      chatStore.set({
        messages,
        conversationError: '',
        editingId: null,
        editDraft: '',
        focusMessage: { id: typeof data.selectedId === 'string' ? data.selectedId : messageId, at: Date.now() },
      })
    }
  } catch (error) {
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}



let settingsSequence = 0
let settingsChain = Promise.resolve()

async function saveSettings(patch, { quiet = true, rollback = null } = {}) {
  const sequence = ++settingsSequence
  const before = rollback ?? chatStore.state.settings
  chatStore.set({ settings: { ...chatStore.state.settings, ...patch } })
  const request = settingsChain.then(() => hostJson('/api/deepseek-chat/settings', patch))
  settingsChain = request.catch(() => {})
  try {
    const data = await request
    if (sequence === settingsSequence) {
      chatStore.set({ settings: data.settings, auth: data.auth })
      if (!quiet) chatStore.toast(tr('settingsSaved'), 'success')
    } else {
      chatStore.set({ auth: data.auth })
    }
    return true
  } catch (error) {
    if (sequence === settingsSequence) chatStore.set({ settings: before })
    chatStore.toast(tr('settingsSaveFailed', { message: error instanceof Error ? error.message : String(error) }), 'error')
    return false
  }
}

function toggleThinking() {
  const before = chatStore.state.settings
  const next = !before.thinking
  chatStore.set({ settings: { ...before, thinking: next } })
  void saveSettings({ thinking: next }, { rollback: before })
}

function toggleSearch() {
  const before = chatStore.state.settings
  const next = !before.search
  chatStore.set({ settings: { ...before, search: next } })
  void saveSettings({ search: next }, { rollback: before })
}

/* ------------------------------------------------------------------------- */
/* Model preference                                                          */
/* ------------------------------------------------------------------------- */

/**
 * Point the composer at the model configuration of one conversation.
 * `id === null` is the blank new-chat page, which uses the Host defaults.
 * The raw ids are stored; the model menu normalises them against the catalog,
 * so an id this Host no longer serves can never break the composer.
 */
function applyModelConfigFor(id) {
  const config = chatStore.state.modelConfig
  const override = id !== null && config?.conversations?.[id] !== undefined ? config.conversations[id] : null
  const model = override?.model ?? config?.defaults?.model ?? 'deepseek-flash'
  const effort = override?.effort ?? config?.defaults?.effort ?? 'high'
  chatStore.set({ modelChoice: { model, effort } })
}

/**
 * Persist one model/effort change. A blank chat updates the default for new
 * conversations; an open conversation stores its own override. The UI updates
 * first and rolls back when the Host rejects the write.
 */
async function saveModelChoice(patch) {
  const before = chatStore.state.modelChoice
  const conversationId = chatStore.state.activeId
  chatStore.set({ modelChoice: { ...before, ...patch } })
  try {
    const data = await hostJson('/api/deepseek-chat/model', {
      action: 'set',
      ...(conversationId === null ? {} : { conversationId }),
      ...patch,
    })
    if (data?.modelConfig !== undefined) {
      chatStore.set({
        modelConfig: data.modelConfig,
        models: Array.isArray(data.models) && data.models.length > 0 ? data.models : chatStore.state.models,
      })
    }
    return true
  } catch (error) {
    if (error?.status === 404) {
      // An older Host half has no model route; keep the local choice and make
      // no promise about persistence instead of alarming the user.
      return false
    }
    chatStore.set({ modelChoice: before })
    chatStore.toast(tr('modelConfigFailed', {
      message: error instanceof Error ? error.message : String(error),
    }), 'error')
    return false
  }
}

function selectModel(modelId) {
  const model = modelCatalog().find(item => item.id === modelId)
  if (model === undefined) return
  const efforts = modelEfforts(model)
  const current = chatStore.state.modelChoice
  const effort = efforts.includes(current.effort) ? current.effort : (efforts.includes('high') ? 'high' : efforts[0])
  void saveModelChoice({ model: model.id, effort })
}

function selectEffort(effort) {
  const { efforts } = currentModelChoice()
  if (!efforts.includes(effort)) return
  void saveModelChoice({ effort })
}

/**
 * A request that names a model this API no longer serves is recoverable: fall
 * back to the default model so the retry button does the useful thing instead
 * of failing again.
 */
function recoverUnavailableModel(payload) {
  if (payload?.code !== 'INVALID_MODEL') return false
  const fallback = modelCatalog().find(model => model.id === 'deepseek-flash') ?? modelCatalog()[0]
  if (fallback !== undefined) void saveModelChoice({ model: fallback.id, effort: 'high' })
  chatStore.toast(tr('modelUnavailable'), 'warning')
  return true
}

/** Composer send key preference; browser-only, so it never needs the Host. */
function setSendKey(mode) {
  const next = mode === 'ctrl-enter' ? 'ctrl-enter' : 'enter'
  chatStore.set({ sendKey: next })
  writeStored({ sendKey: next })
}

/* ------------------------------------------------------------------------- */
/* Per-conversation drafts                                                   */
/* ------------------------------------------------------------------------- */

/**
 * Unsent text for each conversation, so switching chats or pressing "New chat"
 * does not throw away half-written prompts. Attachments are deliberately not
 * kept: their upload streams are aborted on a switch.
 */
const draftStash = new Map()

function stashDraft() {
  draftStash.set(chatStore.state.activeId ?? '__new__', chatStore.state.draft)
}

function restoreDraft(id) {
  const key = id ?? '__new__'
  if (!draftStash.has(key)) return
  chatStore.set({ draft: draftStash.get(key) ?? '' })
}

function forgetDraft(id) {
  draftStash.delete(id ?? '__new__')
}

async function saveKey(key) {
  const data = await hostJson('/api/deepseek-chat/key', { key })
  chatStore.set({ auth: data.auth })
  chatStore.toast(tr('keySaved'), 'success')
}

async function clearKey() {
  const data = await hostJson('/api/deepseek-chat/key', { clear: true })
  chatStore.set({ auth: data.auth })
  chatStore.toast(tr('keyCleared'), 'success')
}

function fileExtension(name) {
  const dot = typeof name === 'string' ? name.lastIndexOf('.') : -1
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
}

function isImageName(name, mimeType) {
  return (typeof mimeType === 'string' && mimeType.startsWith('image/')) || IMAGE_EXT.has(fileExtension(name))
}

function formatSize(bytes) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`
}

function formatTime(timestamp) {
  try {
    return new Intl.DateTimeFormat(appCtx?.locale.getSnapshot().active === 'zh' ? 'zh-CN' : 'en-US', {
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(timestamp))
  } catch {
    return ''
  }
}

function attachmentFileLimit(name) {
  const limits = chatStore.state.limits
  const bytes = LAYOUT_EXT.has(fileExtension(name)) || isImageName(name, '') ? limits.maxUploadBytes : limits.maxUserDataBytes
  return bytes / 1024 / 1024
}

function normalizeLimits(input) {
  const value = input !== null && typeof input === 'object' ? input : {}
  const positive = (candidate, fallback) => (typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0 ? candidate : fallback)
  return {
    maxFiles: Math.floor(positive(value.maxFiles, MAX_FILES)),
    maxUploadBytes: positive(value.maxUploadBytes, MAX_UPLOAD_MB * 1024 * 1024),
    maxUserDataBytes: positive(value.maxUserDataBytes, MAX_USER_DATA_MB * 1024 * 1024),
  }
}

let uploadActive = 0
const uploadQueue = []

function pumpUploads() {
  while (uploadActive < 3 && uploadQueue.length > 0) {
    const task = uploadQueue.shift()
    uploadActive += 1
    task().finally(() => {
      uploadActive -= 1
      pumpUploads()
    })
  }
}

function updateAttachment(id, patch) {
  chatStore.set({
    attachments: chatStore.state.attachments.map(item => (item.id === id ? { ...item, ...patch } : item)),
  })
}

async function uploadAttachment(attachment, file, signal) {
  updateAttachment(attachment.id, { status: 'uploading', error: '' })
  try {
    const response = await hostFetch('/api/deepseek-chat/upload', {
      method: 'POST',
      headers: {
        'content-type': 'application/octet-stream',
        'x-file-name': encodeURIComponent(attachment.name),
        'x-file-mime': attachment.mimeType,
      },
      body: file,
      signal,
    })
    const text = await response.text()
    let value
    try {
      value = JSON.parse(text)
    } catch {
      throw new Error(text || `HTTP ${response.status}`)
    }
    if (!response.ok) {
      const error = new Error(value?.error?.message || `HTTP ${response.status}`)
      error.payload = value?.error
      throw error
    }
    updateAttachment(attachment.id, {
      status: 'ready',
      fileId: value.file.fileId,
      name: value.file.name,
      size: value.file.bytes,
      mimeType: value.file.mimeType,
      isImage: value.file.isImage === true,
      purpose: value.file.purpose,
      error: '',
    })
  } catch (error) {
    const code = error?.payload?.code
    updateAttachment(attachment.id, {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    })
    if (code === 'AUTH_REQUIRED' || code === 'AUTH') {
      chatStore.set({ settingsOpen: true })
      chatStore.toast(tr('noAuthBody'), 'warning')
    }
  }
}

function addFiles(fileList) {
  const files = [...fileList]
  const existing = chatStore.state.attachments.length
  const maxFiles = chatStore.state.limits.maxFiles
  if (existing + files.length > maxFiles) {
    chatStore.toast(tr('tooManyFiles', { count: maxFiles }), 'warning')
    return
  }
  const accepted = []
  for (const file of files) {
    if (file.size === 0) {
      chatStore.toast(tr('emptyFile'), 'warning')
      continue
    }
    if (!ACCEPT_EXT.includes(fileExtension(file.name))) {
      chatStore.toast(tr('unsupportedFile'), 'warning')
      continue
    }
    const limit = attachmentFileLimit(file.name)
    if (file.size > limit * 1024 * 1024) {
      chatStore.toast(tr('fileTooLarge', { size: limit }), 'warning')
      continue
    }
    const image = isImageName(file.name, file.type)
    let previewUrl = ''
    if (image && typeof URL.createObjectURL === 'function') {
      try {
        previewUrl = URL.createObjectURL(file)
      } catch {
        previewUrl = ''
      }
    }
    const attachment = {
      id: uid(),
      name: file.name || 'file',
      size: file.size,
      mimeType: file.type || '',
      isImage: image,
      status: 'uploading',
      fileId: '',
      error: '',
      previewUrl,
      file,
      controller: new AbortController(),
    }
    accepted.push(attachment)
  }
  if (accepted.length === 0) return
  chatStore.set({ attachments: [...chatStore.state.attachments, ...accepted] })
  for (const attachment of accepted) {
    const file = attachment.file
    uploadQueue.push(() => uploadAttachment(attachment, file, attachment.controller.signal))
  }
  pumpUploads()
}

function retryAttachment(id) {
  const attachment = chatStore.state.attachments.find(item => item.id === id)
  if (!attachment?.file) return
  if (attachment.controller?.signal.aborted) attachment.controller = new AbortController()
  uploadQueue.push(() => uploadAttachment(attachment, attachment.file, attachment.controller.signal))
  pumpUploads()
}

function removeAttachment(id) {
  const attachment = chatStore.state.attachments.find(item => item.id === id)
  attachment?.controller?.abort()
  if (attachment?.previewUrl && typeof URL.revokeObjectURL === 'function') {
    try {
      URL.revokeObjectURL(attachment.previewUrl)
    } catch {
      // The URL may already be released.
    }
  }
  chatStore.set({ attachments: chatStore.state.attachments.filter(item => item.id !== id) })
}

/** Drop the active draft and abort uploads when the conversation changes. */
function clearComposer() {
  for (const attachment of chatStore.state.attachments) {
    attachment.controller?.abort()
    if (attachment.previewUrl && typeof URL.revokeObjectURL === 'function') {
      try {
        URL.revokeObjectURL(attachment.previewUrl)
      } catch {
        // The URL may already be released.
      }
    }
  }
  chatStore.set({ draft: '', attachments: [] })
}

let pendingFrame = 0

function applyClientEvent(reply, event, indexes) {
  const next = reply.status === 'streaming' ? reply : { ...reply, status: 'streaming' }
  if (event === null || typeof event !== 'object') return next
  if (event.type === 'message_start') {
    return {
      ...next,
      usage: event.message?.usage ?? next.usage,
      model: typeof event.message?.model === 'string' ? event.message.model : next.model,
    }
  }
  if (event.type === 'content_block_start') {
    indexes.delete(event.index)
    const block = event.content_block
    let stored = null
    if (block?.type === 'text') stored = { type: 'text', text: block.text ?? '', citations: [] }
    else if (block?.type === 'thinking') stored = { type: 'thinking', thinking: block.thinking ?? '', signature: '', startedAt: Date.now() }
    else if (block?.type === 'server_tool_use') stored = { type: 'server_tool_use', id: block.id, name: block.name, input: block.input ?? {}, kind: block.kind ?? 'search' }
    else if (block?.type === 'web_search_tool_result') {
      stored = {
        type: 'web_search_tool_result', tool_use_id: block.tool_use_id, kind: block.kind ?? 'search',
        content: Array.isArray(block.content) ? block.content.map(item => ({
          type: item?.type, title: item?.title, url: item?.url, snippet: item?.snippet,
          site_name: item?.site_name ?? null, site_icon: item?.site_icon ?? null, page_age: item?.page_age ?? null,
          error_code: item?.error_code,
        })) : [],
      }
    } else if (block?.type === 'web_fetch_tool_result') {
      stored = {
        type: 'web_fetch_tool_result', tool_use_id: block.tool_use_id, kind: block.kind ?? 'deep_search',
        content: block.content, signature: block.signature,
      }
    }
    if (stored === null) return next
    indexes.set(event.index, next.blocks.length)
    return { ...next, blocks: [...next.blocks, stored] }
  }
  if (event.type === 'content_block_delta') {
    const index = indexes.get(event.index)
    if (index === undefined) return next
    const block = next.blocks[index]
    const delta = event.delta
    if (!block || !delta) return next
    const blocks = next.blocks.slice()
    if (block.type === 'text' && delta.type === 'text_delta') blocks[index] = { ...block, text: block.text + delta.text }
    else if (block.type === 'thinking' && delta.type === 'thinking_delta') blocks[index] = { ...block, thinking: block.thinking + delta.thinking }
    else if (block.type === 'thinking' && delta.type === 'signature_delta') blocks[index] = { ...block, signature: block.signature + delta.signature }
    else if (block.type === 'text' && delta.type === 'citations_delta' && delta.citation) {
      const citation = {
        type: delta.citation.type, url: delta.citation.url, title: delta.citation.title,
        cited_text: delta.citation.cited_text, encrypted_index: delta.citation.encrypted_index,
      }
      if (!block.citations.some(item => item.url === citation.url)) {
        blocks[index] = { ...block, citations: [...block.citations, citation] }
      }
    }
    return { ...next, blocks }
  }
  if (event.type === 'content_block_stop') {
    const index = indexes.get(event.index)
    if (index === undefined) return next
    indexes.delete(event.index)
    const block = next.blocks[index]
    if (block?.type === 'thinking' && block.endedAt === undefined) {
      const blocks = next.blocks.slice()
      blocks[index] = { ...block, endedAt: Date.now() }
      return { ...next, blocks }
    }
    return next
  }
  if (event.type === 'message_delta') {
    return {
      ...next,
      stopReason: event.delta?.stop_reason ?? next.stopReason,
      stopDetails: event.delta?.stop_details ?? next.stopDetails,
      usage: event.usage ?? next.usage,
      title: typeof event.delta?.title === 'string' ? event.delta.title.trim() : next.title,
    }
  }
  return next
}

/**
 * Consume one NDJSON turn stream.
 *
 * `initialMessages` is the optimistic branch shown immediately; the Host's
 * `start` frame replaces it with the authoritative active path (including new
 * ids, version positions and file metadata). Events are folded into
 * `assistant` and painted on the next animation frame.
 *
 * `restorePreStart` runs when the request failed or was cancelled before the
 * Host acknowledged the turn: the caller decides whether that means putting the
 * draft back in the composer (a fresh send) or restoring the previous branch
 * (an edit or regeneration).
 */
async function runTurnStream({
  conversationId, payload, assistant, initialMessages, userId = null, restorePreStart,
}) {
  const controller = new AbortController()
  const holder = { controller, conversationId, assistantId: assistant.id, userId, startedAt: Date.now() }
  chatStore.set({
    messages: initialMessages,
    streaming: holder,
    stopping: false,
    conversationError: '',
  })
  markSendInFlight(true)
  let current = assistant
  let started = false
  let finished = false
  const indexes = new Map()
  let frame = 0
  const flush = () => {
    frame = 0
    if (!finished) replaceAssistant(current)
  }
  const schedule = () => {
    if (frame !== 0) return
    frame = requestAnimationFrame(flush)
  }
  const finish = () => {
    if (frame !== 0) {
      cancelAnimationFrame(frame)
      frame = 0
    }
    if (!finished) {
      finished = true
      replaceAssistant(current)
    }
    const streaming = chatStore.state.streaming
    if (streaming !== null && (streaming.assistantId === current.id || streaming.assistantId === assistant.id)) {
      chatStore.set({ streaming: null, stopping: false })
    }
  }
  const restore = () => {
    if (typeof restorePreStart === 'function') restorePreStart()
    chatStore.set({ streaming: null, stopping: false })
  }
  const applyTitle = (title, titleAuto) => {
    if (typeof title !== 'string' || title === '') return
    const summary = chatStore.state.conversations.find(entry => entry.id === conversationId)
    if (summary) upsertSummary({ ...summary, title, ...(titleAuto === undefined ? {} : { titleAuto }) })
  }
  try {
    await streamChat(payload, {
      signal: controller.signal,
      onItem(item) {
        if (item.type === 'start') {
          started = true
          const hostAssistantId = typeof item.assistantMessageId === 'string' && item.assistantMessageId !== ''
            ? item.assistantMessageId
            : current.id
          current = { ...current, id: hostAssistantId }
          let messages
          if (Array.isArray(item.messages) && item.messages.length > 0) {
            messages = withFilePreviews(item.messages, chatStore.state.messages)
          } else {
            // Older Host halves only send the ids; patch the optimistic branch.
            const hostUserId = typeof item.userMessage?.id === 'string' ? item.userMessage.id : null
            const hostFiles = Array.isArray(item.userMessage?.files) ? item.userMessage.files : null
            messages = chatStore.state.messages.map((message) => {
              if (message.id === assistant.id) return { ...message, id: hostAssistantId }
              if (hostUserId !== null && message.id === userId) {
                return { ...message, id: hostUserId, ...(hostFiles === null ? {} : { files: hostFiles }) }
              }
              return message
            })
          }
          const streaming = chatStore.state.streaming
          chatStore.set({
            messages,
            streaming: streaming === null ? null : {
              ...streaming,
              assistantId: hostAssistantId,
              userId: typeof item.userMessageId === 'string' ? item.userMessageId : streaming.userId,
            },
          })
          applyTitle(item.title)
          return
        }
        if (item.type === 'event') {
          current = applyClientEvent(current, item.event, indexes)
          schedule()
          return
        }
        if (item.type === 'title') {
          applyTitle(item.title, false)
          return
        }
        if (item.type === 'done') {
          if (item.message) current = { ...item.message }
          if (item.conversation) upsertSummary(item.conversation)
          finish()
          return
        }
        if (item.type === 'error') {
          const info = friendlyError(item.error)
          current = item.message
            ? { ...item.message }
            : { ...current, status: 'error', error: item.error ?? { message: info.text }, updatedAt: Date.now() }
          finish()
          const recovered = recoverUnavailableModel(item.error)
          if (!recovered) chatStore.toast(info.text, 'error')
          if (info.action === 'settings') chatStore.set({ settingsOpen: true })
          return
        }
        if (item.type === 'aborted') {
          current = item.message ? { ...item.message } : { ...current, status: 'stopped', updatedAt: Date.now() }
          finish()
        }
      },
    })
    if (chatStore.state.streaming !== null) {
      current = { ...current, status: 'stopped', updatedAt: Date.now() }
      finish()
    }
  } catch (error) {
    if (controller.signal.aborted) {
      if (!started) {
        restore()
        return
      }
      current = { ...current, status: 'stopped', updatedAt: Date.now() }
      finish()
    } else {
      const payloadInfo = error?.payload ?? { message: error instanceof Error ? error.message : String(error) }
      const info = friendlyError(payloadInfo, payloadInfo.message)
      const recovered = recoverUnavailableModel(payloadInfo)
      if (!started) {
        restore()
        if (!recovered) chatStore.toast(info.text, 'error')
        if (info.action === 'settings') chatStore.set({ settingsOpen: true })
        return
      }
      current = { ...current, status: 'error', error: payloadInfo, updatedAt: Date.now() }
      finish()
      if (!recovered) chatStore.toast(info.text, 'error')
      if (info.action === 'settings') chatStore.set({ settingsOpen: true })
    }
  } finally {
    if (!finished) finish()
    markSendInFlight(false)
  }
}

async function sendMessage() {
  const state = chatStore.state
  if (state.streaming !== null) return
  if (state.boot !== 'ready') {
    void ensureBoot()
    return
  }
  if (!state.auth?.ready) {
    chatStore.set({ settingsOpen: true })
    chatStore.toast(tr('noAuthBody'), 'warning')
    return
  }
  const uploading = state.attachments.some(item => item.status === 'uploading')
  if (uploading) {
    chatStore.toast(tr('waitUpload'), 'warning')
    return
  }
  const failed = state.attachments.find(item => item.status === 'error')
  if (failed) {
    chatStore.toast(tr('uploadFailed'), 'warning')
    return
  }
  const text = state.draft.trim()
  const readyFiles = state.attachments.filter(item => item.status === 'ready' && item.fileId)
  const sentAttachments = state.attachments.filter(item => item.status === 'ready' && item.fileId)
  if (text === '' && readyFiles.length === 0) return
  const choice = currentModelChoice()
  if (!modelCapability(choice.model, 'vision') && readyFiles.some(item => item.isImage)) {
    chatStore.toast(tr('modelUnsupportedImage'), 'warning')
    return
  }
  if (sendInFlight) return
  markSendInFlight(true)

  let conversationId = state.activeId
  try {
    if (conversationId === null) conversationId = await createConversation()
  } catch (error) {
    markSendInFlight(false)
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
    return
  }
  if (chatStore.state.streaming !== null) {
    markSendInFlight(false)
    return
  }

  const now = Date.now()
  const userMessage = {
    id: uid(),
    role: 'user',
    content: text,
    files: readyFiles.map(item => ({
      id: item.id,
      fileId: item.fileId,
      name: item.name,
      size: item.size,
      mimeType: item.mimeType,
      isImage: item.isImage,
      previewUrl: item.previewUrl || '',
    })),
    createdAt: now,
  }
  const reply = makeReplyPlaceholder(state.settings, choice)
  const previousMessages = chatStore.state.messages
  const messages = [...previousMessages, userMessage, reply]
  chatStore.set({
    draft: '',
    attachments: [],
    editingId: null,
    editDraft: '',
    focusRequest: chatStore.state.focusRequest + 1,
  })
  writeStored({ activeId: conversationId })
  forgetDraft(conversationId)
  forgetDraft(null)
  await runTurnStream({
    conversationId,
    payload: {
      conversationId,
      text,
      files: userMessage.files,
      thinking: reply.thinking,
      search: reply.search,
      model: reply.model,
      effort: reply.effort,
      locale: streamLocale(),
    },
    assistant: reply,
    initialMessages: messages,
    userId: userMessage.id,
    restorePreStart: () => {
      // The Host never created the turn (auth, network or a rejected request):
      // pull the optimistic bubbles back and return text and files to the
      // composer instead of losing them.
      chatStore.set({
        messages: previousMessages,
        draft: text,
        attachments: sentAttachments,
      })
    },
  })
}

/** Open the inline editor for one historical user message. */
function beginEditMessage(message) {
  if (chatStore.state.streaming !== null || sendInFlight) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  if (message?.role !== 'user') return
  closeMenu()
  chatStore.set({ editingId: message.id, editDraft: typeof message.content === 'string' ? message.content : '' })
}

function cancelEditMessage() {
  chatStore.set({ editingId: null, editDraft: '' })
}

/**
 * Save the edited question and resend it. The Host turns it into a sibling
 * branch: everything before the question stays shared, the old answer subtree
 * is preserved as a version, and only the new branch is sent to the model.
 */
async function saveEditedMessage() {
  const state = chatStore.state
  const id = state.editingId
  if (id === null) return
  if (state.streaming !== null || sendInFlight) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  const message = state.messages.find(item => item.id === id)
  if (message === undefined || message.role !== 'user' || state.activeId === null) {
    chatStore.set({ editingId: null, editDraft: '' })
    return
  }
  if (!state.auth?.ready) {
    chatStore.set({ settingsOpen: true })
    chatStore.toast(tr('noAuthBody'), 'warning')
    return
  }
  const text = state.editDraft.trim()
  const files = hostFiles(message.files)
  if (text === '' && files.length === 0) return
  const index = state.messages.findIndex(item => item.id === id)
  if (index < 0) return
  const previousMessages = state.messages
  const conversationId = state.activeId
  const optimisticUser = {
    ...message,
    id: uid(),
    content: text,
    createdAt: Date.now(),
    files: (message.files ?? []).map(file => ({ ...file })),
  }
  const reply = makeReplyPlaceholder(state.settings)
  const messages = [...previousMessages.slice(0, index), optimisticUser, reply]
  chatStore.set({ editingId: null, editDraft: '', focusRequest: state.focusRequest + 1 })
  await runTurnStream({
    conversationId,
    payload: {
      conversationId,
      mode: 'edit',
      targetMessageId: id,
      text,
      files,
      thinking: reply.thinking,
      search: reply.search,
      locale: streamLocale(),
    },
    assistant: reply,
    initialMessages: messages,
    userId: optimisticUser.id,
    restorePreStart: () => chatStore.set({
      messages: previousMessages,
      editingId: id,
      editDraft: text,
    }),
  })
}

/** Regenerate one answer as a new sibling version under the same question. */
async function regenerateMessage(message) {
  const state = chatStore.state
  if (state.streaming !== null || sendInFlight) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  if (state.activeId === null || !state.auth?.ready) {
    if (!state.auth?.ready) chatStore.set({ settingsOpen: true })
    return
  }
  const index = state.messages.findIndex(item => item.id === message?.id)
  if (index < 1) return
  const user = state.messages[index - 1]
  if (user?.role !== 'user' || typeof user.id !== 'string') return
  closeMenu()
  const previousMessages = state.messages
  const reply = makeReplyPlaceholder(state.settings)
  const messages = [...previousMessages.slice(0, index), reply]
  const conversationId = state.activeId
  await runTurnStream({
    conversationId,
    payload: {
      conversationId,
      mode: 'regenerate',
      targetMessageId: message.id,
      thinking: reply.thinking,
      search: reply.search,
      locale: streamLocale(),
    },
    assistant: reply,
    initialMessages: messages,
    userId: user.id,
    restorePreStart: () => chatStore.set({ messages: previousMessages }),
  })
}

/** Resume a cut-off answer from its visible text prefix. */
async function continueMessage(message) {
  const state = chatStore.state
  if (state.streaming !== null || sendInFlight) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  if (state.activeId === null || !state.auth?.ready) {
    if (!state.auth?.ready) chatStore.set({ settingsOpen: true })
    return
  }
  if (!canContinueReply(message)) {
    chatStore.toast(tr('cannotContinue'), 'warning')
    return
  }
  closeMenu()
  const previousMessages = state.messages
  const index = previousMessages.findIndex(item => item.id === message.id)
  const user = index > 0 ? previousMessages[index - 1] : null
  const reply = { ...message, status: 'streaming', error: undefined }
  const messages = previousMessages.map(item => (item.id === message.id ? reply : item))
  const conversationId = state.activeId
  await runTurnStream({
    conversationId,
    payload: {
      conversationId,
      mode: 'continue',
      targetMessageId: message.id,
      locale: streamLocale(),
    },
    assistant: reply,
    initialMessages: messages,
    userId: user?.role === 'user' ? user.id : null,
    restorePreStart: () => chatStore.set({ messages: previousMessages }),
  })
}

function stopStreaming() {
  const streaming = chatStore.state.streaming
  if (streaming === null) return
  chatStore.set({ stopping: true })
  try {
    streaming.controller.abort()
  } catch {
    // Already aborted.
  }
}

function requestStop() {
  stopStreaming()
}

/** The shared Chat | Agent navigation: one mode slot, two views. */
function setMode(mode) {
  if (mode === 'chat') {
    if (chatStore.state.open) {
      requestFocus()
      return
    }
    openChat()
    return
  }
  if (chatStore.state.open) closeChat()
}

function defaultWorkspaceId() {
  const workspaces = chatStore.state.workspaces
  if (typeof stored.workspaceId === 'string' && workspaces.some(item => item.id === stored.workspaceId)) {
    return stored.workspaceId
  }
  return workspaces[0]?.id ?? ''
}

function handoffPatch(patch) {
  const current = chatStore.state.handoff
  if (current === null) return
  chatStore.set({ handoff: { ...current, ...patch } })
}

/** Refresh the workspace list without flashing the boot view. */
async function refreshBootstrapSnapshot() {
  try {
    const data = await hostJson('/api/deepseek-chat/bootstrap')
    const current = chatStore.state
    chatStore.set({
      workspaces: Array.isArray(data.workspaces) ? data.workspaces : current.workspaces,
      bootData: { ...(current.bootData ?? {}), ...data },
      limits: normalizeLimits(data.limits),
    })
  } catch {
    // Keep the last known snapshot; the dialog explains what is missing.
  }
}

async function openHandoff() {
  if (chatStore.state.handoff !== null) return
  if (chatStore.state.messages.length === 0 || chatStore.state.activeId === null) {
    chatStore.toast(tr('handoffEmpty'), 'warning')
    return
  }
  if (chatStore.state.streaming !== null) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  chatStore.set({
    handoff: {
      generating: true,
      brief: '',
      generated: false,
      warning: '',
      instruction: '',
      workspaceId: defaultWorkspaceId(),
      busy: false,
      error: '',
    },
  })
  await refreshBootstrapSnapshot()
  if (chatStore.state.handoff === null) return
  handoffPatch({ workspaceId: chatStore.state.handoff.workspaceId || defaultWorkspaceId() })
  await draftHandoff()
}

function closeHandoff() {
  if (chatStore.state.handoff?.busy === true) return
  handoffSequence += 1
  chatStore.set({ handoff: null })
}

async function draftHandoff() {
  const handoff = chatStore.state.handoff
  if (handoff === null || chatStore.state.activeId === null) return
  const sequence = ++handoffSequence
  handoffPatch({ generating: true, error: '' })
  try {
    const data = await hostJson('/api/deepseek-chat/handoff', {
      conversationId: chatStore.state.activeId,
      locale: appCtx?.locale.getSnapshot().active === 'zh' ? 'zh' : 'en',
      instruction: handoff.instruction ?? '',
    })
    if (sequence !== handoffSequence) return
    handoffPatch({
      generating: false,
      brief: typeof data.brief === 'string' ? data.brief : '',
      generated: data.generated === true,
      warning: typeof data.warning === 'string' ? data.warning : '',
      error: '',
    })
  } catch (error) {
    if (sequence !== handoffSequence) return
    const status = error?.status
    handoffPatch({
      generating: false,
      error: status === 404 || status === 501
        ? tr('handoffRestart')
        : error instanceof Error ? error.message : String(error),
    })
  }
}

function setHandoffBrief(brief) {
  handoffPatch({ brief })
}

function setHandoffInstruction(instruction) {
  handoffPatch({ instruction })
}

function setHandoffWorkspace(workspaceId) {
  stored.workspaceId = workspaceId
  handoffPatch({ workspaceId })
  writeStored({ workspaceId })
}

const AGENT_OPEN_ATTEMPTS = 4
const AGENT_OPEN_DELAY_MS = 350

/**
 * Open the created Session through the native workspace navigation. The
 * Session was created on the Host, so the browser's session list can lag one
 * frame behind; retry briefly instead of reporting a false success.
 */
async function openAgentSession(sessionId) {
  const uiWorkspace = appCtx?.get?.('uiWorkspace')
  if (uiWorkspace === undefined || typeof uiWorkspace.openSession !== 'function') return false
  for (let attempt = 0; attempt < AGENT_OPEN_ATTEMPTS; attempt += 1) {
    try {
      uiWorkspace.openSession(sessionId)
      try {
        appCtx?.get?.('layout')?.selectPanel?.(null)
      } catch {
        // Returning to the Conversation is a convenience, not a requirement.
      }
      return true
    } catch (error) {
      if (attempt === AGENT_OPEN_ATTEMPTS - 1) {
        console.error('deepseek-chat: could not open the Agent session', error)
        return false
      }
      await new Promise(resolve => setTimeout(resolve, AGENT_OPEN_DELAY_MS))
    }
  }
  return false
}

async function submitHandoff() {
  const handoff = chatStore.state.handoff
  if (handoff === null || handoff.busy) return
  const brief = typeof handoff.brief === 'string' ? handoff.brief.trim() : ''
  if (brief === '') {
    handoffPatch({ error: tr('handoffEmpty') })
    return
  }
  const sequence = ++handoffSequence
  handoffPatch({ busy: true, error: '' })
  const conversation = chatStore.state.conversations.find(item => item.id === chatStore.state.activeId)
  let result
  try {
    result = await hostJson('/api/deepseek-chat/handoff/send', {
      prompt: brief,
      ...(handoff.workspaceId === '' ? {} : { workspaceId: handoff.workspaceId }),
      ...(conversation?.title ? { title: conversation.title } : {}),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  } catch (error) {
    if (sequence !== handoffSequence) return
    handoffPatch({
      busy: false,
      error: error?.status === 404 || error?.status === 501
        ? tr('handoffRestart')
        : error instanceof Error ? error.message : String(error),
    })
    return
  }
  const sessionId = typeof result?.sessionId === 'string' ? result.sessionId : ''
  // Open the Session before closing the Chat surface so a navigation failure
  // leaves the dialog (and its copy action) in place instead of stranding it.
  const opened = sessionId === '' ? false : await openAgentSession(sessionId)
  chatStore.set({ handoff: null })
  closeChat()
  if (!opened) {
    chatStore.toast(tr('handoffNoSession'), 'warning')
    return
  }
  if (typeof result?.warning === 'string' && result.warning !== '') {
    chatStore.toast(tr('handoffPromptPartial', { message: result.warning }), 'warning')
    return
  }
  chatStore.toast(tr('handoffSent'), 'success')
}

const chatActions = {
  openChat,
  closeChat,
  setMode,
  ensureBoot,
  newChat,
  loadConversation,
  renameConversation,
  requestDeleteConversation,
  // organization
  openConversationMenu,
  openFolderMenu,
  closeMenu,
  setPinned,
  setArchived,
  requestFolderPrompt,
  updateFolderPrompt,
  closeFolderPrompt,
  submitFolderPrompt,
  toggleFolder,
  requestDeleteFolder,
  openMoveChat,
  setMoveChatFolder,
  closeMoveChat,
  submitMoveChat,
  moveConversationToFolder,
  openFolderAdd,
  toggleFolderAddSelection,
  closeFolderAdd,
  submitFolderAdd,
  openArchive,
  closeArchive,
  searchHistory,
  openSearchResult,
  selectVersion,
  // messages
  beginEditMessage,
  cancelEditMessage,
  saveEditedMessage,
  regenerateMessage,
  continueMessage,
  // settings and composer
  saveSettings,
  toggleThinking,
  toggleSearch,
  selectModel,
  selectEffort,
  setSendKey,
  saveKey,
  clearKey,
  addFiles,
  retryAttachment,
  removeAttachment,
  sendMessage,
  stopStreaming,
  requestFocus,
  requestFilePicker,
  requestStop,
  setSidebarWidth,
  saveSidebarWidth,
  openHandoff,
  closeHandoff,
  draftHandoff,
  setHandoffBrief,
  setHandoffInstruction,
  setHandoffWorkspace,
  submitHandoff,
}
