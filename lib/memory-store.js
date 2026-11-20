/**
 * Durable long-term memory for Chat mode. One JSON document under
 * `$DSH_HOME/deepseek-chat`, separate from the conversation history, written
 * atomically and serialized per process.
 *
 * A memory is a single durable fact about the user (a standing instruction, a
 * background fact, a project, a preference). The store owns the facts; the
 * memory summary is only a cache derived from them, invalidated whenever the
 * fact set changes. Deleted memories leave a tombstone so an old conversation
 * cannot silently bring them back through automatic extraction.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import {
  MAX_MEMORY_CHARS, MEMORY_CATEGORY_IDS, inferMemoryCategory, looksSensitive,
  memoryContentKey, memorySimilarity, normalizeMemoryCategory, normalizeMemoryContent,
} from './memory-text.js'

export const MEMORY_VERSION = 1
export const MAX_MEMORIES = 400
export const MAX_IMPORT_ENTRIES = 200
export const MAX_TOMBSTONES = 400
export const MAX_SUMMARY_CHARS = 4000
/** A near-identical wording is merged instead of creating a second entry. */
export const MERGE_SIMILARITY = 0.76
/** A looser overlap is still reported as a possible duplicate by import preview. */
export const MATCH_SIMILARITY = 0.55
/** A tombstone also blocks a re-worded re-extraction of the same fact. */
export const TOMBSTONE_SIMILARITY = 0.8

const SOURCE_TYPES = new Set(['manual', 'conversation', 'import', 'agent'])
const PLATFORMS = new Set(['chatgpt', 'claude', 'gemini', 'other'])

export function defaultMemorySettings() {
  // The memory feature is useful with an empty store, so it starts enabled;
  // automatic extraction spends model calls and is opt-in.
  return { enabled: true, autoExtract: false }
}

function normalizeSettings(input) {
  const base = defaultMemorySettings()
  if (input === null || typeof input !== 'object') return base
  if (typeof input.enabled === 'boolean') base.enabled = input.enabled
  if (typeof input.autoExtract === 'boolean') base.autoExtract = input.autoExtract
  return base
}

function normalizeSource(input) {
  if (input === null || typeof input !== 'object') return { type: 'manual', platform: null, conversationId: null, label: null }
  const type = SOURCE_TYPES.has(input.type) ? input.type : 'manual'
  const platform = PLATFORMS.has(input.platform) ? input.platform : null
  const conversationId = typeof input.conversationId === 'string' && input.conversationId !== ''
    ? input.conversationId.slice(0, 80)
    : null
  const label = typeof input.label === 'string' && input.label.trim() !== ''
    ? input.label.replace(/\s+/g, ' ').trim().slice(0, 80)
    : null
  return { type, platform, conversationId, label }
}

function normalizeMemory(input) {
  if (input === null || typeof input !== 'object') return null
  const content = normalizeMemoryContent(input.content)
  if (content === '') return null
  const category = normalizeMemoryCategory(input.category) ?? inferMemoryCategory(content)
  const createdAt = typeof input.createdAt === 'number' && Number.isFinite(input.createdAt) ? input.createdAt : Date.now()
  return {
    id: typeof input.id === 'string' && input.id !== '' ? input.id : randomUUID(),
    content,
    category,
    createdAt,
    updatedAt: typeof input.updatedAt === 'number' && Number.isFinite(input.updatedAt) ? input.updatedAt : createdAt,
    source: normalizeSource(input.source),
  }
}

function normalizeSummary(input) {
  if (input === null || typeof input !== 'object') return null
  const text = typeof input.text === 'string' ? input.text.trim().slice(0, MAX_SUMMARY_CHARS) : ''
  if (text === '') return null
  return {
    text,
    locale: input.locale === 'en' ? 'en' : 'zh',
    updatedAt: typeof input.updatedAt === 'number' && Number.isFinite(input.updatedAt) ? input.updatedAt : Date.now(),
    revision: typeof input.revision === 'number' && Number.isFinite(input.revision) ? Math.max(0, Math.floor(input.revision)) : 0,
  }
}

function normalizeTombstones(input) {
  const list = []
  const seen = new Set()
  for (const raw of Array.isArray(input) ? input : []) {
    if (raw === null || typeof raw !== 'object') continue
    const content = normalizeMemoryContent(raw.content)
    const key = memoryContentKey(content)
    if (content === '' || key === '' || seen.has(key)) continue
    seen.add(key)
    list.push({
      key,
      content,
      at: typeof raw.at === 'number' && Number.isFinite(raw.at) ? raw.at : Date.now(),
    })
  }
  return list.slice(-MAX_TOMBSTONES)
}

function emptyState() {
  return {
    version: MEMORY_VERSION,
    settings: defaultMemorySettings(),
    revision: 0,
    memories: [],
    summary: null,
    tombstones: [],
  }
}

function normalizeState(parsed) {
  const memoryRecords = []
  const seenIds = new Set()
  const seenKeys = new Set()
  for (const raw of Array.isArray(parsed?.memories) ? parsed.memories : []) {
    const memory = normalizeMemory(raw)
    if (memory === null || seenIds.has(memory.id)) continue
    const key = memoryContentKey(memory.content)
    if (key === '' || seenKeys.has(key)) continue
    seenIds.add(memory.id)
    seenKeys.add(key)
    memoryRecords.push(memory)
  }
  memoryRecords.sort((left, right) => right.updatedAt - left.updatedAt)
  const revision = typeof parsed?.revision === 'number' && Number.isFinite(parsed.revision)
    ? Math.max(0, Math.floor(parsed.revision))
    : 0
  return {
    version: MEMORY_VERSION,
    settings: normalizeSettings(parsed?.settings),
    revision,
    memories: memoryRecords.slice(0, MAX_MEMORIES),
    summary: normalizeSummary(parsed?.summary),
    tombstones: normalizeTombstones(parsed?.tombstones),
  }
}

function copyMemory(memory) {
  return { ...memory, source: { ...memory.source } }
}

/** Whether a candidate is a near copy of a tombstoned (deleted) memory. */
function tombstoneHit(tombstones, content) {
  const key = memoryContentKey(content)
  for (const tombstone of tombstones) {
    if (tombstone.key === key) return tombstone
    if (memorySimilarity(content, tombstone.content) >= TOMBSTONE_SIMILARITY) return tombstone
  }
  return null
}

export class MemoryStore {
  /**
   * @param directory - the Chat data directory (`$DSH_HOME/deepseek-chat`).
   * @param options.logger - logger used for recoverable load/save problems.
   */
  constructor(directory, { logger = console } = {}) {
    this.directory = directory
    this.file = path.join(directory, 'memory.json')
    this.logger = logger
    this.state = emptyState()
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
      // A corrupt memory file must never break chat. Keep the unreadable
      // document for manual recovery and start from an empty memory set.
      const backup = `${this.file}.corrupt-${Date.now()}`
      await fs.rename(this.file, backup).catch(() => {})
      this.logger.warn?.('deepseek-chat: unreadable memory.json; starting with empty memory', error)
      this.state = emptyState()
      this.loaded = true
      return this
    }
    const sourceVersion = typeof parsed?.version === 'number' ? parsed.version : 1
    this.state = normalizeState(parsed)
    this.loaded = true
    if (sourceVersion < MEMORY_VERSION && this.state.memories.length > 0) {
      // Keep the pre-upgrade document next to the live file so a future format
      // change can always be undone by hand.
      const backup = `${this.file}.v${sourceVersion}-backup-${Date.now()}`
      try {
        await fs.copyFile(this.file, backup)
        this.logger.info?.(`deepseek-chat: backed up memory.json to ${path.basename(backup)} before migrating`)
        await this.save()
      } catch (error) {
        this.logger.warn?.('deepseek-chat: could not migrate memory.json', error)
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

  /** Whether the stored summary still describes the current fact set. */
  summaryIsStale() {
    if (this.state.memories.length === 0) return false
    const { summary } = this.state
    return summary === null || summary.revision !== this.state.revision
  }

  status() {
    return {
      enabled: this.state.settings.enabled,
      autoExtract: this.state.settings.autoExtract,
      count: this.state.memories.length,
      revision: this.state.revision,
      summaryUpdatedAt: this.state.summary?.updatedAt ?? null,
      stale: this.summaryIsStale(),
    }
  }

  /** Every active memory, newest first. */
  list() {
    return this.state.memories
      .map(copyMemory)
      .sort((left, right) => right.updatedAt - left.updatedAt)
  }

  categories() {
    const counts = new Map(MEMORY_CATEGORY_IDS.map(id => [id, 0]))
    for (const memory of this.state.memories) {
      counts.set(memory.category, (counts.get(memory.category) ?? 0) + 1)
    }
    return MEMORY_CATEGORY_IDS.map(id => ({ id, count: counts.get(id) ?? 0 }))
  }

  get(id) {
    if (typeof id !== 'string' || id === '') return undefined
    const memory = this.state.memories.find(item => item.id === id)
    return memory === undefined ? undefined : copyMemory(memory)
  }

  /** The best existing match for one candidate content, if any. */
  findMatch(content, { excludeId = null } = {}) {
    const text = normalizeMemoryContent(content)
    if (text === '') return null
    const key = memoryContentKey(text)
    let best = null
    for (const memory of this.state.memories) {
      if (memory.id === excludeId) continue
      if (memoryContentKey(memory.content) === key) {
        return { kind: 'duplicate', memory: copyMemory(memory), score: 1 }
      }
      const score = memorySimilarity(text, memory.content)
      if (score >= MATCH_SIMILARITY && (best === null || score > best.score)) {
        best = { kind: 'conflict', memory: copyMemory(memory), score }
      }
    }
    return best
  }

  snapshot() {
    const summary = this.state.summary === null
      ? null
      : {
          text: this.state.summary.text,
          locale: this.state.summary.locale,
          updatedAt: this.state.summary.updatedAt,
          revision: this.state.summary.revision,
        }
    return {
      settings: this.getSettings(),
      memories: this.list(),
      categories: this.categories(),
      summary,
      stale: this.summaryIsStale(),
      revision: this.state.revision,
      count: this.state.memories.length,
      limits: { maxMemories: MAX_MEMORIES, maxContent: MAX_MEMORY_CHARS, maxImportEntries: MAX_IMPORT_ENTRIES },
    }
  }

  async add({ content, category, source = { type: 'manual' }, origin = 'manual' } = {}) {
    const text = normalizeMemoryContent(content)
    if (text.length < 2) return { status: 'invalid' }
    const normalizedCategory = normalizeMemoryCategory(category) ?? inferMemoryCategory(text)
    if (origin !== 'manual') {
      if (tombstoneHit(this.state.tombstones, text) !== null) return { status: 'skipped' }
      if (looksSensitive(text)) return { status: 'skipped' }
    } else {
      this.forgetTombstone(text)
    }
    const match = this.findMatch(text)
    if (match !== null) {
      if (match.kind === 'duplicate') return { status: 'duplicate', memory: match.memory }
      if (match.score >= MERGE_SIMILARITY) {
        const memory = await this.mergeInto(match.memory.id, { content: text, category: normalizedCategory })
        return memory === undefined ? { status: 'duplicate', memory: match.memory } : { status: 'merged', memory }
      }
    }
    if (this.state.memories.length >= MAX_MEMORIES) {
      return { status: 'limit', limit: MAX_MEMORIES }
    }
    const now = Date.now()
    const memory = {
      id: randomUUID(),
      content: text,
      category: normalizedCategory,
      createdAt: now,
      updatedAt: now,
      source: normalizeSource(source),
    }
    this.state.memories.push(memory)
    this.bumpRevision()
    await this.save()
    return { status: 'added', memory: copyMemory(memory) }
  }

  /** Merge a duplicate fact into one record, keeping the richer wording. */
  async mergeInto(id, { content, category }) {
    const memory = this.state.memories.find(item => item.id === id)
    if (memory === undefined) return undefined
    const text = normalizeMemoryContent(content)
    if (text === '' || memoryContentKey(text) === '') return undefined
    const previous = memory.content
    const keepNew = text.length > previous.length + 4
    memory.content = keepNew ? text : previous
    if (normalizeMemoryCategory(category) !== undefined) memory.category = normalizeMemoryCategory(category)
    memory.updatedAt = Date.now()
    if (memory.content !== previous) this.bumpRevision()
    else memory.updatedAt = Date.now()
    await this.save()
    return copyMemory(memory)
  }

  async update(id, patch) {
    const memory = this.state.memories.find(item => item.id === id)
    if (memory === undefined) return { status: 'not-found' }
    const nextContent = patch?.content === undefined ? memory.content : normalizeMemoryContent(patch.content)
    if (nextContent.length < 2) return { status: 'invalid' }
    const nextCategory = normalizeMemoryCategory(patch?.category) ?? memory.category
    const contentChanged = nextContent !== memory.content
    const categoryChanged = nextCategory !== memory.category
    if (!contentChanged && !categoryChanged) {
      return { status: 'updated', memory: copyMemory(memory), unchanged: true }
    }
    if (contentChanged) {
      const match = this.findMatch(nextContent, { excludeId: memory.id })
      if (match !== null && match.kind === 'duplicate') {
        const merged = await this.mergeInto(match.memory.id, { content: nextContent, category: nextCategory })
        if (merged !== undefined) {
          this.state.memories = this.state.memories.filter(item => item.id !== memory.id)
          await this.save()
          return { status: 'merged', memory: merged }
        }
      } else if (match !== null && match.score >= MERGE_SIMILARITY) {
        const merged = await this.mergeInto(match.memory.id, { content: nextContent, category: nextCategory })
        if (merged !== undefined) {
          this.state.memories = this.state.memories.filter(item => item.id !== memory.id)
          await this.save()
          return { status: 'merged', memory: merged }
        }
      }
    }
    memory.content = nextContent
    memory.category = nextCategory
    memory.updatedAt = Date.now()
    this.bumpRevision()
    await this.save()
    return { status: 'updated', memory: copyMemory(memory) }
  }

  async remove(id) {
    const index = this.state.memories.findIndex(item => item.id === id)
    if (index < 0) return false
    const [removed] = this.state.memories.splice(index, 1)
    this.rememberTombstone(removed.content)
    this.bumpRevision()
    await this.save()
    return true
  }

  /** Remove everything and tombstone it, so old chats cannot restore it. */
  async clear() {
    const count = this.state.memories.length
    for (const memory of this.state.memories) this.rememberTombstone(memory.content)
    this.state.memories = []
    this.state.summary = null
    this.bumpRevision()
    await this.save()
    return count
  }

  rememberTombstone(content) {
    const text = normalizeMemoryContent(content)
    const key = memoryContentKey(text)
    if (text === '' || key === '') return
    this.state.tombstones = this.state.tombstones.filter(item => item.key !== key)
    this.state.tombstones.push({ key, content: text, at: Date.now() })
    if (this.state.tombstones.length > MAX_TOMBSTONES) {
      this.state.tombstones = this.state.tombstones.slice(-MAX_TOMBSTONES)
    }
  }

  forgetTombstone(content) {
    const key = memoryContentKey(content)
    if (key === '') return
    const before = this.state.tombstones.length
    this.state.tombstones = this.state.tombstones.filter(item => item.key !== key)
    if (this.state.tombstones.length !== before) this.bumpRevision()
  }

  bumpRevision() {
    this.state.revision += 1
  }

  /** Match annotations for the import preview; never mutates anything. */
  previewEntries(entries) {
    const list = Array.isArray(entries) ? entries.slice(0, MAX_IMPORT_ENTRIES) : []
    return {
      entries: list.map((entry) => {
        const content = normalizeMemoryContent(entry?.content)
        const category = normalizeMemoryCategory(entry?.category) ?? inferMemoryCategory(content)
        const match = content === '' ? null : this.findMatch(content)
        return {
          content,
          category,
          sensitive: looksSensitive(content),
          match: match === null ? null : {
            kind: match.kind,
            id: match.memory.id,
            content: match.memory.content,
            category: match.memory.category,
            score: Math.round(match.score * 100) / 100,
          },
        }
      }),
      limits: { maxMemories: MAX_MEMORIES, maxContent: MAX_MEMORY_CHARS, maxImportEntries: MAX_IMPORT_ENTRIES },
    }
  }

  /**
   * Merge imported or extracted entries into the memory set. Import never
   * replaces the whole store: each entry is added, merged or skipped on its
   * own, so re-importing the same export adds nothing.
   * @param entries - `{ content, category?, date?, mode? }` records.
   * @param source - source metadata written on newly added memories.
   * @param origin - "import" | "conversation" | "agent"; auto extraction
   *   additionally filters sensitive content and deleted tombstones.
   */
  async absorb(entries, { source = { type: 'import' }, origin = 'import' } = {}) {
    const list = Array.isArray(entries) ? entries.slice(0, MAX_IMPORT_ENTRIES) : []
    const result = { added: 0, merged: 0, updated: 0, skipped: 0, invalid: 0, limit: 0, items: [] }
    let changed = false
    for (const entry of list) {
      const content = normalizeMemoryContent(entry?.content)
      if (content.length < 2) {
        result.invalid += 1
        result.items.push({ content, status: 'invalid' })
        continue
      }
      const mode = ['auto', 'merge', 'update', 'skip', 'add'].includes(entry?.mode) ? entry.mode : 'auto'
      if (mode === 'skip') {
        result.skipped += 1
        result.items.push({ content, status: 'skipped' })
        continue
      }
      if (origin !== 'manual') {
        if (tombstoneHit(this.state.tombstones, content) !== null) {
          result.skipped += 1
          result.items.push({ content, status: 'skipped' })
          continue
        }
        if (origin === 'conversation' && looksSensitive(content)) {
          result.skipped += 1
          result.items.push({ content, status: 'skipped' })
          continue
        }
      }
      const category = normalizeMemoryCategory(entry?.category) ?? inferMemoryCategory(content)
      const match = this.findMatch(content)
      if (mode === 'update' && match !== null) {
        const updated = await this.update(match.memory.id, { content, category })
        if (updated.status === 'updated' || updated.status === 'merged') {
          changed = true
          result.updated += 1
          result.items.push({ content, status: 'updated', memoryId: updated.memory.id })
          continue
        }
      }
      if (match !== null && (mode === 'merge' || (mode === 'auto' && match.score >= MERGE_SIMILARITY))) {
        if (match.kind === 'duplicate' && mode === 'auto') {
          result.skipped += 1
          result.items.push({ content, status: 'skipped', memoryId: match.memory.id })
          continue
        }
        const merged = await this.mergeInto(match.memory.id, { content, category })
        if (merged !== undefined) {
          changed = true
          result.merged += 1
          result.items.push({ content, status: 'merged', memoryId: merged.id })
          continue
        }
      }
      if (match !== null && match.kind === 'duplicate') {
        result.skipped += 1
        result.items.push({ content, status: 'skipped', memoryId: match.memory.id })
        continue
      }
      if (this.state.memories.length >= MAX_MEMORIES) {
        result.limit += 1
        result.items.push({ content, status: 'limit' })
        continue
      }
      const now = Date.now()
      const memory = {
        id: randomUUID(),
        content,
        category,
        createdAt: now,
        updatedAt: now,
        source: normalizeSource(source),
      }
      this.state.memories.push(memory)
      this.bumpRevision()
      changed = true
      result.added += 1
      result.items.push({ content, status: 'added', memoryId: memory.id })
    }
    if (changed) await this.save()
    return result
  }

  getSummary() {
    const summary = this.state.summary
    if (summary === null) return null
    return { ...summary }
  }

  /**
   * Store a generated summary. An empty memory set drops the summary instead;
   * the summary always remembers which fact revision it describes.
   */
  async setSummary(summary) {
    const text = typeof summary?.text === 'string' ? summary.text.trim().slice(0, MAX_SUMMARY_CHARS) : ''
    if (text === '' || this.state.memories.length === 0) {
      this.state.summary = null
    } else {
      this.state.summary = {
        text,
        locale: summary?.locale === 'en' ? 'en' : 'zh',
        updatedAt: Date.now(),
        revision: this.state.revision,
      }
    }
    await this.save()
    return this.getSummary()
  }

  async save() {
    this.writeChain = this.writeChain.then(() => this.writeNow())
    return this.writeChain
  }

  serializable() {
    return {
      version: MEMORY_VERSION,
      settings: this.state.settings,
      revision: this.state.revision,
      summary: this.state.summary,
      memories: this.state.memories,
      tombstones: this.state.tombstones,
    }
  }

  async writeNow() {
    const temporary = `${this.file}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`
    await fs.mkdir(this.directory, { recursive: true })
    await fs.writeFile(temporary, `${JSON.stringify(this.serializable())}\n`, 'utf8')
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
