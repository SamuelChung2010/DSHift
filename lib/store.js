/**
 * Durable chat history for Chat mode. One JSON document under
 * `$DSH_HOME/deepseek-chat`, written atomically and serialized per process.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export const STORE_VERSION = 1
export const MAX_SYSTEM_PROMPT = 8000
export const MAX_TITLE = 80

const AUTH_MODES = new Set(['auto', 'account', 'api-key'])

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

function normalizeFile(file) {
  if (file === null || typeof file !== 'object') return null
  if (typeof file.fileId !== 'string' || file.fileId === '') return null
  return {
    id: typeof file.id === 'string' ? file.id : randomUUID(),
    fileId: file.fileId,
    name: typeof file.name === 'string' ? file.name.slice(0, 200) : 'file',
    size: typeof file.size === 'number' && Number.isFinite(file.size) ? file.size : 0,
    mimeType: typeof file.mimeType === 'string' ? file.mimeType : '',
    isImage: file.isImage === true,
  }
}

function normalizeMessage(message) {
  if (message === null || typeof message !== 'object') return null
  if (message.role !== 'user' && message.role !== 'assistant') return null
  if (message.role === 'user') {
    return {
      id: typeof message.id === 'string' ? message.id : randomUUID(),
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
  // stopped, and its open thinking block is closed against the current time.
  const blocks = status === 'streaming'
    ? sourceBlocks.map(block => (
        block?.type === 'thinking' && block.endedAt === undefined
          ? { ...block, endedAt: now }
          : block
      ))
    : sourceBlocks
  return {
    id: typeof message.id === 'string' ? message.id : randomUUID(),
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
  }

}

function normalizeConversation(conversation) {
  if (conversation === null || typeof conversation !== 'object') return null
  const messages = Array.isArray(conversation.messages) ? conversation.messages.map(normalizeMessage).filter(Boolean) : []
  return {
    id: typeof conversation.id === 'string' && conversation.id !== '' ? conversation.id : randomUUID(),
    title: typeof conversation.title === 'string' ? conversation.title.slice(0, MAX_TITLE) : '',
    titleAuto: conversation.titleAuto === true,
    createdAt: typeof conversation.createdAt === 'number' ? conversation.createdAt : Date.now(),
    updatedAt: typeof conversation.updatedAt === 'number' ? conversation.updatedAt : Date.now(),
    messages,
  }
}

export class ChatStore {
  constructor(directory, { logger = console } = {}) {
    this.directory = directory
    this.file = path.join(directory, 'state.json')
    this.logger = logger
    this.state = {
      version: STORE_VERSION,
      settings: defaultSettings(),
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
    try {
      const parsed = JSON.parse(raw)
      this.state = {
        version: STORE_VERSION,
        settings: normalizeSettings(parsed?.settings),
        conversations: Array.isArray(parsed?.conversations)
          ? parsed.conversations.map(normalizeConversation).filter(Boolean)
          : [],
      }
    } catch (error) {
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
        conversations: [],
      }
    }
    this.loaded = true
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

  listSummaries() {
    return this.state.conversations
      .map(conversation => ({
        id: conversation.id,
        title: conversation.title,
        titleAuto: conversation.titleAuto,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messages.length,
      }))
      .sort((left, right) => right.updatedAt - left.updatedAt)
  }

  getConversation(id) {
    return this.state.conversations.find(conversation => conversation.id === id)
  }

  async createConversation() {
    const now = Date.now()
    const conversation = {
      id: randomUUID(),
      title: '',
      titleAuto: true,
      createdAt: now,
      updatedAt: now,
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

  async appendMessage(conversationId, message) {
    const conversation = this.getConversation(conversationId)
    if (conversation === undefined) return undefined
    conversation.messages.push(message)
    conversation.updatedAt = Math.max(conversation.updatedAt, message.createdAt ?? Date.now())
    if (message.role === 'user' && conversation.title === '' && conversation.titleAuto !== false) {
      const firstLine = (message.content ?? '').split('\n').map(line => line.trim()).find(Boolean) ?? ''
      const fallback = firstLine || message.files?.[0]?.name || '新对话'
      conversation.title = fallback.replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE)
      conversation.titleAuto = true
    }
    await this.save()
    return conversation
  }

  async replaceMessage(conversationId, message) {
    const conversation = this.getConversation(conversationId)
    if (conversation === undefined) return undefined
    const index = conversation.messages.findIndex(item => item.id === message.id)
    if (index < 0) {
      conversation.messages.push(message)
    } else {
      conversation.messages[index] = message
    }
    conversation.updatedAt = Math.max(conversation.updatedAt, message.updatedAt ?? message.createdAt ?? Date.now())
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

  async save() {
    this.writeChain = this.writeChain.then(() => this.writeNow())
    return this.writeChain
  }

  async writeNow() {
    const temporary = `${this.file}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`
    const data = `${JSON.stringify(this.state)}\n`
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
