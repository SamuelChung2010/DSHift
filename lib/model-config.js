/**
 * Chat model catalog and the per-conversation model/effort preference.
 *
 * The Messages API of the DeepSeek app integration accepts exactly two model
 * ids (`deepseek-flash`, `deepseek-v4-pro`) and a thinking effort of
 * low / high / max (`none` means thinking off and is expressed through
 * `thinking.type` instead). The client never hard-codes a different list: the
 * Host publishes this catalog in the bootstrap payload, and the request is
 * validated against it before it reaches DeepSeek.
 *
 * Preferences live in their own file next to the chat history. Per-session
 * message data belongs to the history store; keeping model preferences apart
 * means a conversation's model choice survives independently of message
 * versioning and never rewrites the stored message format.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'

export const MODEL_CONFIG_VERSION = 1

/** Effort ids the API maps to a distinct behaviour, strongest last. */
export const EFFORTS = Object.freeze(['low', 'high', 'max'])
export const DEFAULT_EFFORT = 'high'

/**
 * The API accepts compatibility aliases for effort. Only the three real tiers
 * are ever stored or offered in the UI; an alias is folded on the way in.
 */
const EFFORT_ALIASES = Object.freeze({
  minimal: 'low',
  low: 'low',
  medium: 'high',
  high: 'high',
  xhigh: 'high',
  max: 'max',
  ultra: 'max',
})

/**
 * The real chat models. Capabilities come from the Messages API reference:
 * - `deepseek-flash`: image understanding, document parsing, web tools.
 * - `deepseek-v4-pro`: text reasoning only; images become "[Unsupported Image]".
 * Both support thinking and the web-search server tool, but DeepSeek's web
 * tool guide recommends `deepseek-flash` for the search/read-link tools.
 */
export const MODEL_CATALOG = Object.freeze([
  Object.freeze({
    id: 'deepseek-flash',
    name: 'DeepSeek V4.1 Flash',
    shortName: 'V4.1 Flash',
    version: 'DeepSeek-V4.1-Flash-1017',
    descriptionKey: 'modelFlashDesc',
    capabilities: Object.freeze({
      vision: true,
      documents: true,
      search: true,
      thinking: true,
      efforts: EFFORTS,
    }),
  }),
  Object.freeze({
    id: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    shortName: 'V4 Pro',
    version: 'DeepSeek-V4-Pro-0813',
    descriptionKey: 'modelProDesc',
    capabilities: Object.freeze({
      vision: false,
      documents: true,
      search: true,
      thinking: true,
      efforts: EFFORTS,
    }),
  }),
])

export const DEFAULT_MODEL = MODEL_CATALOG[0].id

/** The catalog entry for one id, or undefined for an unknown id. */
export function findModel(id) {
  return MODEL_CATALOG.find(model => model.id === id)
}

/**
 * Validate a requested model id. An absent id means the default model; an
 * unknown id is a client bug or an API change, so the caller gets a clear 400
 * instead of silently charging a different model.
 */
export function resolveModelId(id) {
  if (id === undefined || id === null || id === '') return DEFAULT_MODEL
  return findModel(id) === undefined ? null : id
}

/** Clamp an effort to what the model actually supports. */
export function resolveEffort(id, modelId = DEFAULT_MODEL) {
  const model = findModel(modelId) ?? findModel(DEFAULT_MODEL)
  const efforts = model.capabilities.efforts
  const effort = typeof id === 'string' ? EFFORT_ALIASES[id] : undefined
  return effort !== undefined && efforts.includes(effort) ? effort : DEFAULT_EFFORT
}

function sanitizePreference(input, { allowModel = true } = {}) {
  const patch = {}
  if (input === null || typeof input !== 'object') return patch
  if (allowModel && typeof input.model === 'string') {
    const id = resolveModelId(input.model)
    if (id !== null) patch.model = id
  }
  if (typeof input.effort === 'string') patch.effort = resolveEffort(input.effort, input.model)
  return patch
}

function emptyState() {
  return {
    version: MODEL_CONFIG_VERSION,
    defaults: { model: DEFAULT_MODEL, effort: DEFAULT_EFFORT },
    conversations: {},
  }
}

function normalizeState(input) {
  const base = emptyState()
  if (input === null || typeof input !== 'object') return base
  const defaults = sanitizePreference(input.defaults)
  base.defaults = {
    model: defaults.model ?? DEFAULT_MODEL,
    effort: resolveEffort(defaults.effort, defaults.model ?? DEFAULT_MODEL),
  }
  if (input.conversations !== null && typeof input.conversations === 'object') {
    for (const [id, value] of Object.entries(input.conversations)) {
      if (typeof id !== 'string' || id === '') continue
      const preference = sanitizePreference(value)
      if (preference.model === undefined && preference.effort === undefined) continue
      base.conversations[id] = {
        ...(preference.model === undefined ? {} : { model: preference.model }),
        ...(preference.effort === undefined ? {} : { effort: resolveEffort(preference.effort, preference.model) }),
      }
    }
  }
  return base
}

export class ModelConfigStore {
  /**
   * @param directory - the Chat data directory (`$DSH_HOME/deepseek-chat`).
   * @param options.logger - logger used for recoverable load/save problems.
   */
  constructor(directory, { logger = console } = {}) {
    this.directory = directory
    this.file = path.join(directory, 'model-config.json')
    this.logger = logger
    this.state = emptyState()
    this.loaded = false
    this.writeChain = Promise.resolve()
  }

  async load() {
    if (this.loaded) return this
    this.loaded = true
    try {
      const raw = await fs.readFile(this.file, 'utf8')
      this.state = normalizeState(JSON.parse(raw))
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        // A corrupt preference file must never break chat: fall back to the
        // defaults and replace the file on the next write.
        this.logger.warn?.('deepseek-chat: unreadable model-config.json; using defaults', error)
        this.state = emptyState()
      }
    }
    return this
  }

  /** The global defaults for a new conversation. */
  getDefaults() {
    return { ...this.state.defaults }
  }

  /** The stored override of one conversation, if any. */
  getConversation(id) {
    if (typeof id !== 'string' || id === '') return undefined
    const value = this.state.conversations[id]
    return value === undefined ? undefined : { ...value }
  }

  /** Effective model/effort for one conversation (override, else defaults). */
  resolve(conversationId) {
    const override = this.getConversation(conversationId) ?? {}
    const model = override.model ?? this.state.defaults.model
    return {
      model,
      effort: resolveEffort(override.effort ?? this.state.defaults.effort, model),
    }
  }

  /** The whole preference document for the browser. */
  snapshot() {
    return {
      defaults: this.getDefaults(),
      conversations: Object.fromEntries(
        Object.entries(this.state.conversations).map(([id, value]) => [id, { ...value }]),
      ),
    }
  }

  /**
   * Save a selection. Without `conversationId` it becomes the default for new
   * conversations; with one it applies only to that conversation.
   */
  async set(conversationId, patch) {
    const preference = sanitizePreference(patch)
    if (conversationId === undefined || conversationId === null || conversationId === '') {
      const model = preference.model ?? this.state.defaults.model
      this.state.defaults = {
        model,
        effort: resolveEffort(preference.effort ?? this.state.defaults.effort, model),
      }
    } else {
      const existing = this.state.conversations[conversationId] ?? {}
      const model = preference.model ?? existing.model ?? this.state.defaults.model
      this.state.conversations[conversationId] = {
        model,
        effort: resolveEffort(preference.effort ?? existing.effort ?? this.state.defaults.effort, model),
      }
    }
    await this.save()
    return this.snapshot()
  }

  /** Forget one conversation's override (used when it is deleted). */
  async remove(conversationId) {
    if (this.state.conversations[conversationId] === undefined) return false
    delete this.state.conversations[conversationId]
    await this.save()
    return true
  }

  /** Drop overrides whose conversation no longer exists. */
  async prune(validIds) {
    const keep = new Set(Array.isArray(validIds) ? validIds : [])
    let changed = false
    for (const id of Object.keys(this.state.conversations)) {
      if (keep.has(id)) continue
      delete this.state.conversations[id]
      changed = true
    }
    if (changed) await this.save()
    return changed
  }

  async save() {
    this.writeChain = this.writeChain.then(() => this.writeNow())
    return this.writeChain
  }

  async writeNow() {
    const temporary = `${this.file}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`
    await fs.mkdir(this.directory, { recursive: true })
    await fs.writeFile(temporary, `${JSON.stringify(this.state)}\n`, 'utf8')
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
