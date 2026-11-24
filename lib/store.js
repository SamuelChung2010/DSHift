/**
 * Durable chat history for Chat mode. One JSON document under
 * `$DSH_HOME/deepseek-chat`, written atomically and serialized per process.
 *
 * History is a small tree per conversation: every message is a node with a
 * parent, so editing a question or regenerating an answer adds a sibling branch
 * instead of overwriting history. The active branch is a path from the virtual
 * root to `leafId`; `conversation.messages` is that path and is what every
 * request and renderer uses, so a model only ever sees the messages the user
 * currently has on screen. Sibling branches are kept for version switching.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export const STORE_VERSION = 2
export const MAX_SYSTEM_PROMPT = 8000
export const MAX_TITLE = 80
export const MAX_FOLDER_NAME = 60
export const MAX_SEARCH_QUERY = 200
export const SEARCH_LIMIT = 40

const AUTH_MODES = new Set(['auto', 'account', 'api-key'])

/**
 * Where an imported conversation came from. `kind` names the source system and
 * `id` is that system's own stable conversation id, which is what makes a
 * re-import of the same export a no-op instead of a duplicate. `importedAt` is
 * the epoch millisecond of the import that created it. `memoryExtractedAt`
 * records the last long-term-memory analysis of this conversation, so the same
 * imported history is not sent to the model twice by accident.
 */
const SOURCE_KIND_LIMIT = 40
const SOURCE_ID_LIMIT = 200
const LOCAL_FILE_MEDIA = /^[a-f0-9]{64}\.[a-z0-9]{2,5}$/u

function normalizeSource(source) {
  if (source === null || typeof source !== 'object') return null
  const kind = typeof source.kind === 'string' ? source.kind.trim().slice(0, SOURCE_KIND_LIMIT) : ''
  const id = typeof source.id === 'string' ? source.id.trim().slice(0, SOURCE_ID_LIMIT) : ''
  if (kind === '' || id === '') return null
  return {
    kind,
    id,
    importedAt: typeof source.importedAt === 'number' && Number.isFinite(source.importedAt) ? source.importedAt : null,
    memoryExtractedAt: typeof source.memoryExtractedAt === 'number' && Number.isFinite(source.memoryExtractedAt)
      ? source.memoryExtractedAt
      : null,
  }
}

export function defaultSettings() {
  return {
    authMode: 'auto',
    thinking: false,
    search: false,
    systemPrompt: '',
  }
}

function normalizeSettings(input) {
  const base = defaultSettings()
  if (input === null || typeof input !== 'object') return base
  if (AUTH_MODES.has(input.authMode)) base.authMode = input.authMode
  if (typeof input.thinking === 'boolean') base.thinking = input.thinking
  if (typeof input.search === 'boolean') base.search = input.search
  if (typeof input.systemPrompt === 'string') base.systemPrompt = input.systemPrompt.slice(0, MAX_SYSTEM_PROMPT)
  return base
}

function normalizeFolderName(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, MAX_FOLDER_NAME)
}

function normalizeFile(file) {
  if (file === null || typeof file !== 'object') return null
  if (typeof file.fileId !== 'string' || file.fileId === '') return null
  // An imported attachment is not on DeepSeek's file service. `local` marks it so
  // a request never sends its marker as a file id, and `media` names the stored
  // bytes when the import could recover them.
  const local = file.local === true
  const media = typeof file.media === 'string' && LOCAL_FILE_MEDIA.test(file.media) ? file.media : undefined
  return {
    id: typeof file.id === 'string' ? file.id : randomUUID(),
    fileId: file.fileId,
    name: typeof file.name === 'string' ? file.name.slice(0, 200) : 'file',
    size: typeof file.size === 'number' && Number.isFinite(file.size) ? file.size : 0,
    mimeType: typeof file.mimeType === 'string' ? file.mimeType : '',
    isImage: file.isImage === true,
    ...(local ? { local: true } : {}),
    ...(media === undefined ? {} : { media }),
  }
}

function normalizeMessage(message) {
  if (message === null || typeof message !== 'object') return null
  if (message.role !== 'user' && message.role !== 'assistant') return null
  if (message.role === 'user') {
    return {
      id: typeof message.id === 'string' && message.id !== '' ? message.id : randomUUID(),
      role: 'user',
      content: typeof message.content === 'string' ? message.content.slice(0, 100_000) : '',
      files: Array.isArray(message.files) ? message.files.map(normalizeFile).filter(Boolean) : [],
      createdAt: typeof message.createdAt === 'number' ? message.createdAt : Date.now(),
    }
  }
  const status = ['streaming', 'done', 'stopped', 'error'].includes(message.status) ? message.status : 'done'
  const now = Date.now()
  const sourceBlocks = Array.isArray(message.blocks) ? message.blocks : []
  // A reply left streaming by a crash or an abrupt shutdown is presented as
  // stopped. Its open thinking block is closed against the reply's own last
  // write, never against load time: the reasoning duration must stay the same
  // across reloads instead of growing with the wall clock.
  const lastWrite = typeof message.updatedAt === 'number'
    ? message.updatedAt
    : typeof message.createdAt === 'number' ? message.createdAt : now
  const blocks = status === 'streaming'
    ? sourceBlocks.map((block) => {
        if (block?.type !== 'thinking' || typeof block.endedAt === 'number') return block
        const startedAt = typeof block.startedAt === 'number' ? block.startedAt : lastWrite
        return { ...block, endedAt: Math.max(startedAt, lastWrite) }
      })
    : sourceBlocks
  return {
    id: typeof message.id === 'string' && message.id !== '' ? message.id : randomUUID(),
    role: 'assistant',
    createdAt: typeof message.createdAt === 'number' ? message.createdAt : now,
    updatedAt: typeof message.updatedAt === 'number' ? message.updatedAt : now,
    model: typeof message.model === 'string' ? message.model : 'deepseek-flash',
    thinking: message.thinking === true,
    search: message.search === true,
    status: status === 'streaming' ? 'stopped' : status,
    blocks,
    usage: message.usage !== null && typeof message.usage === 'object' ? message.usage : undefined,
    stopReason: typeof message.stopReason === 'string' ? message.stopReason : undefined,
    stopDetails: message.stopDetails !== null && typeof message.stopDetails === 'object' ? message.stopDetails : undefined,
    error: message.error !== null && typeof message.error === 'object' ? message.error : undefined,
    prefix: message.prefix !== false,
    ...(typeof message.continueCount === 'number' && Number.isFinite(message.continueCount) && message.continueCount > 0
      ? { continueCount: Math.floor(message.continueCount) }
      : {}),
  }
}

/** Normalize one stored folder record; an unnamed folder is dropped. */
function normalizeFolder(folder) {
  if (folder === null || typeof folder !== 'object') return null
  const name = normalizeFolderName(folder.name)
  if (name === '') return null
  const createdAt = typeof folder.createdAt === 'number' ? folder.createdAt : Date.now()
  return {
    id: typeof folder.id === 'string' && folder.id !== '' ? folder.id : randomUUID(),
    name,
    collapsed: folder.collapsed === true,
    createdAt,
    updatedAt: typeof folder.updatedAt === 'number' ? folder.updatedAt : createdAt,
  }
}

/** Whether a parent chain is safe to walk (no missing node, no cycle). */
function parentChainIsSound(nodes, id) {
  const seen = new Set([id])
  let current = nodes[id].parentId
  while (current !== null) {
    if (seen.has(current)) return false
    const parent = nodes[current]
    if (parent === undefined) return false
    seen.add(current)
    current = parent.parentId
  }
  return true
}

/** Rebuild children/roots and the active path from the nodes map. */
function rebuildLinks(conversation) {
  const ids = Object.keys(conversation.nodes)
  for (const node of Object.values(conversation.nodes)) node.children = []
  conversation.roots = []
  for (const id of ids) {
    const node = conversation.nodes[id]
    if (node.parentId === null) {
      conversation.roots.push(id)
      continue
    }
    const parent = conversation.nodes[node.parentId]
    if (parent === undefined) {
      node.parentId = null
      conversation.roots.push(id)
    } else {
      parent.children.push(id)
    }
  }
}

/** Follow the most recent child chain to a leaf, used when switching branches. */
function deepestLeafId(conversation, nodeId) {
  let current = nodeId
  const seen = new Set()
  for (;;) {
    if (seen.has(current) || conversation.nodes[current] === undefined) return nodeId
    seen.add(current)
    const node = conversation.nodes[current]
    if (node.children.length === 0) return current
    current = node.children[node.children.length - 1]
  }
}

/** Recompute the active path from `leafId`, walking up to the virtual root. */
function rebuildPath(conversation) {
  const messages = []
  const seen = new Set()
  let current = conversation.leafId
  while (typeof current === 'string' && conversation.nodes[current] !== undefined && !seen.has(current)) {
    seen.add(current)
    const node = conversation.nodes[current]
    messages.push(node.message)
    current = node.parentId
  }
  messages.reverse()
  conversation.messages = messages
}

function makeNode(id, parentId, message) {
  return { id, parentId, children: [], message }
}

/** Convert the pre-tree `messages` array into a single linear branch. */
function nodesFromMessages(messages) {
  const nodes = {}
  let parentId = null
  for (const raw of Array.isArray(messages) ? messages : []) {
    const normalized = normalizeMessage(raw)
    if (normalized === null) continue
    let id = normalized.id
    if (nodes[id] !== undefined) {
      id = randomUUID()
      normalized.id = id
    }
    nodes[id] = makeNode(id, parentId, normalized)
    parentId = id
  }
  return nodes
}

function normalizeConversation(input) {
  if (input === null || typeof input !== 'object') return null
  const now = Date.now()
  const conversation = {
    id: typeof input.id === 'string' && input.id !== '' ? input.id : randomUUID(),
    title: typeof input.title === 'string' ? input.title.slice(0, MAX_TITLE) : '',
    titleAuto: input.titleAuto === true,
    createdAt: typeof input.createdAt === 'number' ? input.createdAt : now,
    updatedAt: typeof input.updatedAt === 'number' ? input.updatedAt : now,
    pinned: input.pinned === true,
    pinnedAt: typeof input.pinnedAt === 'number' ? input.pinnedAt : null,
    archived: input.archived === true,
    archivedAt: typeof input.archivedAt === 'number' ? input.archivedAt : null,
    folderId: typeof input.folderId === 'string' && input.folderId !== '' ? input.folderId : null,
    source: normalizeSource(input.source),
    nodes: {},
    roots: [],
    leafId: null,
    messages: [],
  }
  if (conversation.pinned && conversation.pinnedAt === null) conversation.pinnedAt = conversation.updatedAt
  if (conversation.archived && conversation.archivedAt === null) conversation.archivedAt = conversation.updatedAt

  let nodes = {}
  if (input.nodes !== null && typeof input.nodes === 'object' && !Array.isArray(input.nodes)) {
    for (const [key, raw] of Object.entries(input.nodes)) {
      if (raw === null || typeof raw !== 'object') continue
      const source = raw.message !== null && typeof raw.message === 'object' ? raw.message : raw
      const normalized = normalizeMessage(
        typeof source.id === 'string' && source.id !== '' ? source : { ...source, id: key },
      )
      if (normalized === null) continue
      const id = typeof key === 'string' && key !== '' ? key : normalized.id
      // The map key is the branch identity; keep the message id in step with it
      // so sibling lookups always line up.
      normalized.id = id
      if (nodes[id] !== undefined) continue
      nodes[id] = {
        id,
        parentId: typeof raw.parentId === 'string' && raw.parentId !== '' ? raw.parentId : null,
        children: [],
        message: normalized,
      }
    }
  } else if (Array.isArray(input.messages)) {
    nodes = nodesFromMessages(input.messages)
  }
  // A half-written tree (empty nodes map) still recovers from the legacy array.
  if (Object.keys(nodes).length === 0 && Array.isArray(input.messages)) {
    nodes = nodesFromMessages(input.messages)
  }

  // A saved parent pointer is only trusted when it resolves inside this
  // conversation and its chain does not loop; otherwise the node becomes a root.
  for (const [id, node] of Object.entries(nodes)) {
    if (node.parentId !== null && (nodes[node.parentId] === undefined || !parentChainIsSound(nodes, id))) {
      node.parentId = null
    }
  }
  conversation.nodes = nodes
  rebuildLinks(conversation)

  if (Object.keys(nodes).length === 0) {
    conversation.leafId = null
    conversation.messages = []
    return conversation
  }
  const storedLeaf = typeof input.leafId === 'string' && nodes[input.leafId] !== undefined
    ? input.leafId
    : null
  conversation.leafId = storedLeaf ?? deepestLeafId(conversation, conversation.roots[conversation.roots.length - 1])
  rebuildPath(conversation)
  return conversation
}

function normalizeState(parsed) {
  const folders = []
  const seenFolders = new Set()
  for (const raw of Array.isArray(parsed?.folders) ? parsed.folders : []) {
    const folder = normalizeFolder(raw)
    if (folder === null || seenFolders.has(folder.id)) continue
    seenFolders.add(folder.id)
    folders.push(folder)
  }
  const folderIds = new Set(folders.map(folder => folder.id))
  const conversations = []
  const seenConversations = new Set()
  for (const raw of Array.isArray(parsed?.conversations) ? parsed.conversations : []) {
    const conversation = normalizeConversation(raw)
    if (conversation === null || seenConversations.has(conversation.id)) continue
    seenConversations.add(conversation.id)
    if (conversation.folderId !== null && !folderIds.has(conversation.folderId)) conversation.folderId = null
    conversations.push(conversation)
  }
  return { folders, conversations }
}

/** Visible answer text of an assistant message, used by history search. */
function messageSearchText(message) {
  if (message.role === 'user') return typeof message.content === 'string' ? message.content : ''
  if (!Array.isArray(message.blocks)) return ''
  return message.blocks
    .filter(block => block?.type === 'text' && typeof block.text === 'string')
    .map(block => block.text)
    .join('')
}

/** One-line excerpt around the first match, with ellipses where trimmed. */
function excerptOf(text, needle) {
  const plain = text.replace(/\s+/g, ' ').trim()
  const index = plain.toLowerCase().indexOf(needle)
  if (index < 0) return ''
  const start = Math.max(0, index - 34)
  const end = Math.min(plain.length, index + needle.length + 76)
  return `${start > 0 ? '…' : ''}${plain.slice(start, end)}${end < plain.length ? '…' : ''}`
}

export class ChatStore {
  constructor(directory, { logger = console } = {}) {
    this.directory = directory
    this.file = path.join(directory, 'state.json')
    this.logger = logger
    this.state = {
      version: STORE_VERSION,
      settings: defaultSettings(),
      folders: [],
      conversations: [],
    }
    this.loaded = false
    this.writeChain = Promise.resolve()
  }

  async load() {
    if (this.loaded) return this
    await fs.mkdir(this.directory, { recursive: true })
    let raw
    try {
      raw = await fs.readFile(this.file, 'utf8')
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
      this.loaded = true
      return this
    }
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      // A genuinely unreadable document is quarantined and the plugin starts
      // empty; a failed migration write is handled separately below and never
      // reaches this path.
      const backup = `${this.file}.corrupt-${Date.now()}`
      try {
        await fs.rename(this.file, backup)
      } catch {
        // Leave the unreadable file if it cannot be moved; the next save replaces it.
      }
      this.logger.warn?.('deepseek-chat: unreadable state.json; starting with empty history', error)
      this.state = {
        version: STORE_VERSION,
        settings: defaultSettings(),
        folders: [],
        conversations: [],
      }
      this.loaded = true
      return this
    }

    const sourceVersion = typeof parsed?.version === 'number' ? parsed.version : 1
    let normalized
    try {
      normalized = normalizeState(parsed)
    } catch (error) {
      this.logger.warn?.('deepseek-chat: could not normalize state.json; keeping settings only', error)
      normalized = { folders: [], conversations: [] }
    }
    if (sourceVersion < STORE_VERSION && (normalized.conversations.length > 0 || normalized.folders.length > 0)) {
      // Keep the exact pre-upgrade document next to the state file. The copy is
      // never read by the plugin; it exists so a failed upgrade can be undone by
      // hand without losing a single conversation.
      const backup = `${this.file}.v${sourceVersion}-backup-${Date.now()}`
      try {
        await fs.copyFile(this.file, backup)
        this.logger.info?.(`deepseek-chat: backed up state.json to ${path.basename(backup)} before migrating`)
      } catch (error) {
        this.logger.warn?.('deepseek-chat: could not back up state.json before migrating', error)
      }
    }
    this.state = {
      version: STORE_VERSION,
      settings: normalizeSettings(parsed?.settings),
      folders: normalized.folders,
      conversations: normalized.conversations,
    }
    this.loaded = true
    if (sourceVersion < STORE_VERSION) {
      // Persist the migrated shape, but a failed write must not discard the
      // in-memory history that was just read successfully.
      try {
        await this.save()
      } catch (error) {
        this.logger.warn?.('deepseek-chat: could not persist the migrated state.json', error)
      }
    }
    return this
  }

  getSettings() {
    return { ...this.state.settings }
  }

  async updateSettings(patch) {
    this.state.settings = normalizeSettings({ ...this.state.settings, ...(patch ?? {}) })
    await this.save()
    return this.getSettings()
  }

  summary(conversation) {
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
      messageCount: conversation.messages.length,
      // Present only on an imported conversation; the browser uses it to mark
      // imported chats and a future extractor uses it to find them by source.
      source: conversation.source ?? null,
    }
  }

  listSummaries() {
    return this.state.conversations
      .map(conversation => this.summary(conversation))
      .sort((left, right) => right.updatedAt - left.updatedAt)
  }

  listFolders() {
    return [...this.state.folders]
      .sort((left, right) => left.createdAt - right.createdAt)
      .map(folder => ({ ...folder }))
  }

  getConversation(id) {
    return this.state.conversations.find(conversation => conversation.id === id)
  }

  /** The conversation one source system already contributed, if any. */
  findBySource(kind, id) {
    if (typeof kind !== 'string' || typeof id !== 'string' || kind === '' || id === '') return undefined
    return this.state.conversations.find(conversation => (
      conversation.source?.kind === kind && conversation.source?.id === id
    ))
  }

  /** Every source id already imported from one source system. */
  importedSourceIds(kind) {
    const ids = new Set()
    if (typeof kind !== 'string' || kind === '') return ids
    for (const conversation of this.state.conversations) {
      if (conversation.source?.kind === kind) ids.add(conversation.source.id)
    }
    return ids
  }

  /**
   * Record that long-term memory was extracted from these imported
   * conversations. The marker lives next to the import source so a later run
   * (and a restart) can skip the same history unless it is explicitly redone.
   * Chat messages and ordering are untouched.
   * @returns the conversation ids that were actually marked.
   */
  async markMemoryExtracted(ids, at = Date.now()) {
    const pending = new Set(Array.isArray(ids) ? ids.filter(id => typeof id === 'string' && id !== '') : [])
    if (pending.size === 0) return []
    const marked = []
    for (const conversation of this.state.conversations) {
      if (!pending.has(conversation.id)) continue
      if (conversation.source === null || typeof conversation.source !== 'object') continue
      conversation.source.memoryExtractedAt = at
      marked.push(conversation.id)
    }
    if (marked.length === 0) return []
    await this.save()
    return marked
  }

  /**
   * Copy the current state document next to itself before a bulk change.
   * @param label - short marker placed in the file name.
   * @returns the backup path, or undefined when no document exists yet.
   */
  async backup(label) {
    try {
      await fs.access(this.file)
    } catch {
      return undefined
    }
    const target = `${this.file}.${label}-${Date.now()}`
    await fs.copyFile(this.file, target)
    return target
  }

  /**
   * Merge complete conversation drafts into the history.
   *
   * This is the one entry point an importer uses, so an import never writes a
   * second store: drafts go through the same normalization as a loaded
   * document, an id or source already present is refused instead of replaced,
   * and the whole batch is persisted in one write. When that write fails the
   * added conversations are removed again, so the in-memory history keeps
   * matching the document on disk.
   *
   * @param drafts - conversations in the stored shape.
   * @returns `{ added, rejected }`; `added` holds the new conversation ids.
   */
  async adoptConversations(drafts) {
    const added = []
    const rejected = []
    const folderIds = new Set(this.state.folders.map(folder => folder.id))
    for (const draft of Array.isArray(drafts) ? drafts : []) {
      const source = normalizeSource(draft?.source)
      const conversation = normalizeConversation(draft)
      if (conversation === null || conversation.messages.length === 0) {
        rejected.push({ sourceId: source?.id ?? '', reason: 'empty' })
        continue
      }
      if (conversation.folderId !== null && !folderIds.has(conversation.folderId)) conversation.folderId = null
      if (this.state.conversations.some(item => item.id === conversation.id)) {
        rejected.push({ sourceId: source?.id ?? '', reason: 'duplicate-id' })
        continue
      }
      if (conversation.source !== null && this.findBySource(conversation.source.kind, conversation.source.id) !== undefined) {
        rejected.push({ sourceId: conversation.source.id, reason: 'duplicate-source' })
        continue
      }
      this.state.conversations.push(conversation)
      added.push(conversation)
    }
    if (added.length === 0) return { added: [], rejected }
    try {
      await this.save()
    } catch (error) {
      const ids = new Set(added.map(conversation => conversation.id))
      this.state.conversations = this.state.conversations.filter(conversation => !ids.has(conversation.id))
      throw error
    }
    return { added: added.map(conversation => conversation.id), rejected }
  }

  /** Version metadata for the message's sibling group, when it has one. */
  versionInfo(conversation, messageId) {
    const node = conversation.nodes[messageId]
    if (node === undefined) return null
    const siblings = node.parentId === null
      ? conversation.roots
      : (conversation.nodes[node.parentId]?.children ?? [])
    if (siblings.length < 2) return null
    const index = siblings.indexOf(messageId)
    if (index < 0) return null
    return { index: index + 1, count: siblings.length }
  }

  presentMessage(conversation, message) {
    const version = this.versionInfo(conversation, message.id)
    return version === null ? message : { ...message, version }
  }

  /** The active branch with each message's version position attached. */
  presentPath(conversation) {
    return conversation.messages.map(message => this.presentMessage(conversation, message))
  }

  presentConversation(conversation) {
    return { ...this.summary(conversation), messages: this.presentPath(conversation) }
  }

  async createConversation() {
    const now = Date.now()
    const conversation = {
      id: randomUUID(),
      title: '',
      titleAuto: true,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      pinnedAt: null,
      archived: false,
      archivedAt: null,
      folderId: null,
      nodes: {},
      roots: [],
      leafId: null,
      messages: [],
    }
    this.state.conversations.push(conversation)
    await this.save()
    return conversation
  }

  async renameConversation(id, title) {
    const conversation = this.getConversation(id)
    if (conversation === undefined) return undefined
    const next = typeof title === 'string' ? title.replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE) : ''
    conversation.title = next
    conversation.titleAuto = false
    conversation.updatedAt = Date.now()
    await this.save()
    return conversation
  }

  async deleteConversation(id) {
    const index = this.state.conversations.findIndex(conversation => conversation.id === id)
    if (index < 0) return false
    this.state.conversations.splice(index, 1)
    await this.save()
    return true
  }

  /**
   * Pin or unpin one conversation. Pinning does not count as activity: the
   * pinned section is ordered by `updatedAt` first and `pinnedAt` second, so a
   * pin never reorders the normal history list.
   */
  async setPinned(id, pinned) {
    const conversation = this.getConversation(id)
    if (conversation === undefined) return undefined
    const next = pinned === true
    if (conversation.pinned !== next) {
      conversation.pinned = next
      conversation.pinnedAt = next ? Date.now() : null
      await this.save()
    }
    return conversation
  }

  /** Archive or restore a conversation without touching its messages. */
  async setArchived(id, archived) {
    const conversation = this.getConversation(id)
    if (conversation === undefined) return undefined
    const next = archived === true
    if (conversation.archived !== next) {
      conversation.archived = next
      conversation.archivedAt = next ? Date.now() : null
      await this.save()
    }
    return conversation
  }

  async createFolder(name) {
    const normalized = normalizeFolderName(name)
    if (normalized === '') return undefined
    const now = Date.now()
    const folder = { id: randomUUID(), name: normalized, collapsed: false, createdAt: now, updatedAt: now }
    this.state.folders.push(folder)
    await this.save()
    return folder
  }

  async renameFolder(id, name) {
    const folder = this.state.folders.find(item => item.id === id)
    if (folder === undefined) return undefined
    const normalized = normalizeFolderName(name)
    if (normalized === '') return undefined
    folder.name = normalized
    folder.updatedAt = Date.now()
    await this.save()
    return folder
  }

  /**
   * Delete a folder. Chats inside are moved back to the unfiled area; no
   * history is deleted as a side effect of removing the folder itself.
   */
  async deleteFolder(id) {
    const index = this.state.folders.findIndex(folder => folder.id === id)
    if (index < 0) return undefined
    this.state.folders.splice(index, 1)
    let moved = 0
    for (const conversation of this.state.conversations) {
      if (conversation.folderId !== id) continue
      conversation.folderId = null
      moved += 1
    }
    await this.save()
    return { removed: true, moved }
  }

  async setFolderCollapsed(id, collapsed) {
    const folder = this.state.folders.find(item => item.id === id)
    if (folder === undefined) return undefined
    const next = collapsed === true
    if (folder.collapsed !== next) {
      folder.collapsed = next
      folder.updatedAt = Date.now()
      await this.save()
    }
    return folder
  }

  /** Move one or more conversations into a folder (`null` means unfiled). */
  async moveConversations(ids, folderId) {
    const target = typeof folderId === 'string' && folderId !== '' ? folderId : null
    if (target !== null && !this.state.folders.some(folder => folder.id === target)) return undefined
    let moved = 0
    for (const id of new Set(Array.isArray(ids) ? ids : [])) {
      const conversation = this.getConversation(id)
      if (conversation === undefined) continue
      if (conversation.folderId === target) continue
      conversation.folderId = target
      moved += 1
    }
    if (moved > 0) await this.save()
    return moved
  }

  /** Add one message as a child of `parentId` and make it the active leaf. */
  attachNode(conversation, parentId, message) {
    if (message === null || typeof message !== 'object') return null
    let id = typeof message.id === 'string' && message.id !== '' ? message.id : randomUUID()
    if (conversation.nodes[id] !== undefined) id = randomUUID()
    const stored = message.id === id ? message : { ...message, id }
    const parent = typeof parentId === 'string' ? conversation.nodes[parentId] : undefined
    const node = makeNode(id, parent === undefined ? null : parentId, stored)
    conversation.nodes[id] = node
    if (node.parentId === null) conversation.roots.push(id)
    else parent.children.push(id)
    conversation.leafId = id
    rebuildPath(conversation)
    return node
  }

  applyFirstUserTitle(conversation, message) {
    if (message.role !== 'user') return
    if (conversation.title !== '' || conversation.titleAuto === false) return
    const firstLine = (message.content ?? '').split('\n').map(line => line.trim()).find(Boolean) ?? ''
    const fallback = firstLine || message.files?.[0]?.name || '新对话'
    conversation.title = fallback.replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE)
    conversation.titleAuto = true
  }

  /** Append one message to the active branch (legacy-friendly entry point). */
  async appendMessage(conversationId, message) {
    const conversation = this.getConversation(conversationId)
    if (conversation === undefined) return undefined
    const node = this.attachNode(conversation, conversation.leafId, message)
    if (node === null) return undefined
    conversation.updatedAt = Math.max(conversation.updatedAt, message.createdAt ?? Date.now())
    this.applyFirstUserTitle(conversation, node.message)
    await this.save()
    return conversation
  }

  /** Append a complete user/assistant turn to the active branch. */
  async appendTurn(conversationId, userMessage, assistantMessage) {
    const conversation = this.getConversation(conversationId)
    if (conversation === undefined) return undefined
    const userNode = this.attachNode(conversation, conversation.leafId, userMessage)
    if (userNode === null) return undefined
    const replyNode = this.attachNode(conversation, userNode.id, assistantMessage)
    if (replyNode === null) return undefined
    conversation.updatedAt = Math.max(
      conversation.updatedAt,
      userNode.message.createdAt ?? Date.now(),
      replyNode.message.createdAt ?? Date.now(),
    )
    // Sending a new turn in an archived chat brings it back to the history list;
    // the user is clearly using it again.
    if (conversation.archived === true) {
      conversation.archived = false
      conversation.archivedAt = null
    }
    this.applyFirstUserTitle(conversation, userNode.message)
    await this.save()
    return { conversation, userMessage: userNode.message, assistantMessage: replyNode.message }
  }

  /**
   * Start a new user branch under `parentId` (an edit of a former question);
   * `parentId` is null when the edited message was the first in the chat.
   */
  async createUserBranch(conversationId, message, parentId) {
    const conversation = this.getConversation(conversationId)
    if (conversation === undefined) return undefined
    const node = this.attachNode(conversation, parentId ?? null, message)
    if (node === null) return undefined
    conversation.updatedAt = Math.max(conversation.updatedAt, node.message.createdAt ?? Date.now())
    this.applyFirstUserTitle(conversation, node.message)
    await this.save()
    return { conversation, message: node.message }
  }

  /** Start a new answer branch under a user message (a regeneration). */
  async createAssistantBranch(conversationId, message, parentUserId) {
    const conversation = this.getConversation(conversationId)
    if (conversation === undefined) return undefined
    const node = this.attachNode(conversation, parentUserId, message)
    if (node === null) return undefined
    conversation.updatedAt = Math.max(conversation.updatedAt, node.message.createdAt ?? Date.now())
    await this.save()
    return { conversation, message: node.message }
  }

  async replaceMessage(conversationId, message) {
    const conversation = this.getConversation(conversationId)
    if (conversation === undefined) return undefined
    const node = conversation.nodes[message.id]
    if (node === undefined) return undefined
    node.message = message
    conversation.updatedAt = Math.max(conversation.updatedAt, message.updatedAt ?? message.createdAt ?? Date.now())
    rebuildPath(conversation)
    await this.save()
    return conversation
  }

  /** Apply a server-generated title only while the current title is automatic. */
  async applyAutoTitle(conversationId, title) {
    const conversation = this.getConversation(conversationId)
    if (conversation === undefined) return false
    const normalized = typeof title === 'string' ? title.replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE) : ''
    if (normalized === '' || conversation.titleAuto === false) return false
    conversation.title = normalized
    conversation.titleAuto = false
    conversation.updatedAt = Date.now()
    await this.save()
    return true
  }

  /**
   * Switch to the neighbouring sibling of `messageId` and reopen the deepest
   * branch below it, so the previous edits and answers remain reachable.
   */
  async selectVersion(conversationId, messageId, direction) {
    const conversation = this.getConversation(conversationId)
    if (conversation === undefined) return undefined
    const node = conversation.nodes[messageId]
    if (node === undefined) return undefined
    const siblings = node.parentId === null
      ? conversation.roots
      : (conversation.nodes[node.parentId]?.children ?? [])
    if (siblings.length < 2) return undefined
    const index = siblings.indexOf(messageId)
    if (index < 0) return undefined
    const step = direction < 0 ? -1 : 1
    const selectedId = siblings[(index + step + siblings.length) % siblings.length]
    conversation.leafId = deepestLeafId(conversation, selectedId)
    rebuildPath(conversation)
    await this.save()
    return { conversation, selectedId }
  }

  /** Reopen the branch that contains `messageId` (history-search jump). */
  async focusMessage(conversationId, messageId) {
    const conversation = this.getConversation(conversationId)
    if (conversation === undefined) return undefined
    if (conversation.nodes[messageId] === undefined) return undefined
    conversation.leafId = deepestLeafId(conversation, messageId)
    rebuildPath(conversation)
    await this.save()
    return conversation
  }

  /**
   * Search titles and message bodies across every folder, pinned and archived
   * conversation. The active branch wins ties, so the most useful match is the
   * one the user can jump to directly.
   */
  search(query, { limit = SEARCH_LIMIT } = {}) {
    const raw = typeof query === 'string' ? query.replace(/\s+/g, ' ').trim().slice(0, MAX_SEARCH_QUERY) : ''
    if (raw === '') return { query: '', results: [], total: 0 }
    const needle = raw.toLowerCase()
    const results = []
    for (const conversation of this.state.conversations) {
      const titleMatch = conversation.title.toLowerCase().includes(needle)
      const activeIds = new Set(conversation.messages.map(message => message.id))
      let best = null
      for (const node of Object.values(conversation.nodes)) {
        const text = messageSearchText(node.message)
        if (text === '') continue
        const snippet = excerptOf(text, needle)
        if (snippet === '') continue
        const active = activeIds.has(node.message.id)
        const candidate = {
          messageId: node.message.id,
          role: node.message.role,
          snippet,
          onActivePath: active,
        }
        if (
          best === null
          || (candidate.onActivePath && !best.onActivePath)
          || (candidate.onActivePath === best.onActivePath && candidate.role === 'user' && best.role !== 'user')
        ) {
          best = candidate
        }
      }
      if (!titleMatch && best === null) continue
      results.push({ ...this.summary(conversation), titleMatch, ...(best ?? {}) })
    }
    results.sort((left, right) => (
      Number(right.titleMatch) - Number(left.titleMatch)
      || Number(right.onActivePath === true) - Number(left.onActivePath === true)
      || right.updatedAt - left.updatedAt
    ))
    return { query: raw, results: results.slice(0, limit), total: results.length }
  }

  async save() {
    const write = () => this.writeNow()
    this.writeChain = this.writeChain.then(write, write)
    return this.writeChain
  }

  /** Persist the tree without the derived links and active path. */
  serializable() {
    return {
      version: STORE_VERSION,
      settings: this.state.settings,
      folders: this.state.folders,
      conversations: this.state.conversations.map(conversation => ({
        id: conversation.id,
        title: conversation.title,
        titleAuto: conversation.titleAuto,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        pinned: conversation.pinned === true,
        pinnedAt: conversation.pinnedAt ?? null,
        archived: conversation.archived === true,
        archivedAt: conversation.archivedAt ?? null,
        folderId: conversation.folderId ?? null,
        ...(conversation.source === null || conversation.source === undefined ? {} : { source: conversation.source }),
        leafId: conversation.leafId,
        nodes: Object.fromEntries(
          Object.entries(conversation.nodes).map(([id, node]) => [id, { parentId: node.parentId, message: node.message }]),
        ),
      })),
    }
  }

  async writeNow() {
    const temporary = `${this.file}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`
    const data = `${JSON.stringify(this.serializable())}\n`
    await fs.mkdir(this.directory, { recursive: true })
    await fs.writeFile(temporary, data, 'utf8')
    try {
      await fs.rename(temporary, this.file)
    } catch (error) {
      if (error?.code === 'EEXIST' || error?.code === 'EPERM' || error?.code === 'EACCES') {
        await fs.copyFile(temporary, this.file)
        await fs.rm(temporary, { force: true })
      } else {
        await fs.rm(temporary, { force: true }).catch(() => {})
        throw error
      }
    }
  }

  async flush() {
    await this.writeChain
  }
}
