/**
 * Validation for the DeepSeek chat export (`manifest.json`,
 * `chat_session_index.json`, `chat_sessions/{id}.json`).
 *
 * The export format is versioned by `manifest.json` alone and has drifted at the
 * field level before, so only the fields the importer reads are required and
 * mapped fragment types are validated individually. A fragment type this module
 * does not know is ignored rather than failing the whole conversation, and a
 * malformed fragment of a known type fails only that conversation.
 */

import { ZipError } from './zip.js'

/** The only `manifest.json` format version this importer reads. */
export const SUPPORTED_EXPORT_FORMAT_VERSION = 3

/** An export file whose content is not the shape this importer read. */
export class ExportFormatError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ExportFormatError'
    this.code = code
  }
}

/**
 * Parse an export timestamp: an RFC 3339 string, with 0, 3, 6 or 9 fractional
 * digits. The exporter always writes UTC (`Z`), but an offset is accepted too.
 * @returns epoch milliseconds, or undefined when the text is not a timestamp.
 */
export function parseExportTime(value) {
  if (typeof value !== 'string' || value.trim() === '') return undefined
  const time = Date.parse(value)
  return Number.isSafeInteger(time) && time >= 0 ? time : undefined
}

function decodeJson(bytes) {
  try {
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return undefined
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function text(value) {
  return typeof value === 'string' ? value : ''
}

function optionalText(value) {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

/**
 * Read `manifest.json`.
 * @returns the declared export format version.
 * @throws {ExportFormatError} when the entry is not a manifest of this format.
 */
export function readManifest(bytes) {
  const parsed = decodeJson(bytes)
  if (!isObject(parsed)) throw new ExportFormatError('BAD_EXPORT', 'manifest.json is not a JSON object')
  const version = parsed.export_format_version
  if (typeof version !== 'number' || !Number.isFinite(version)) {
    throw new ExportFormatError('BAD_EXPORT', 'manifest.json declares no export format version')
  }
  return { version }
}

/**
 * Read `chat_session_index.json`, the list of every conversation in the export.
 *
 * The index is what makes a preview possible without parsing hundreds of
 * conversation files: it already carries the title, the message count, the
 * timestamps and the pin flag. Rows this importer cannot use are dropped, so a
 * single damaged row never hides the rest of the export.
 *
 * @returns conversations in index order; duplicates keep their first row.
 */
export function readSessionIndex(bytes) {
  const parsed = decodeJson(bytes)
  if (!Array.isArray(parsed)) throw new ExportFormatError('MISSING_INDEX', 'chat_session_index.json is not a JSON array')
  const rows = []
  const seen = new Set()
  for (const raw of parsed) {
    if (!isObject(raw)) continue
    const id = optionalText(raw.id)
    if (id === undefined || seen.has(id)) continue
    seen.add(id)
    rows.push({
      id,
      title: text(raw.title).trim(),
      pinned: raw.pinned === true,
      messageCount: typeof raw.message_count === 'number' && Number.isFinite(raw.message_count) && raw.message_count >= 0
        ? Math.floor(raw.message_count)
        : 0,
      insertedAt: parseExportTime(raw.inserted_at),
      updatedAt: parseExportTime(raw.updated_at),
    })
  }
  if (rows.length === 0) throw new ExportFormatError('NO_CONVERSATIONS', 'the export lists no conversation')
  return rows
}

/** One mapped fragment; the union of the fragment types this importer reads. */
function readFragment(raw) {
  if (!isObject(raw)) return undefined
  switch (raw.type) {
    case 'REQUEST':
    case 'RESPONSE':
    case 'TEMPLATE_RESPONSE':
      return typeof raw.content === 'string' ? { type: raw.type, content: raw.content } : undefined
    case 'THINK':
      return typeof raw.content === 'string'
        ? {
            type: 'THINK',
            content: raw.content,
            elapsedMs: typeof raw.elapsed_secs === 'number' && Number.isFinite(raw.elapsed_secs) && raw.elapsed_secs > 0
              ? Math.round(raw.elapsed_secs * 1000)
              : 0,
          }
        : undefined
    case 'TOOL_SEARCH':
      return {
        type: 'TOOL_SEARCH',
        status: optionalText(raw.status) ?? 'FINISHED',
        queries: Array.isArray(raw.queries) ? raw.queries.filter(query => typeof query === 'string') : [],
        results: Array.isArray(raw.results) ? raw.results.filter(isObject).map(result => ({
          url: text(result.url),
          title: text(result.title),
          snippet: text(result.snippet),
          siteName: text(result.site_name),
          siteIcon: text(result.site_icon),
          publishedAt: optionalText(result.published_at),
        })).filter(result => result.url !== '') : [],
      }
    case 'TOOL_OPEN':
      return {
        type: 'TOOL_OPEN',
        status: optionalText(raw.status) ?? 'FINISHED',
        url: optionalText(raw.url),
        title: optionalText(raw.title),
        snippet: optionalText(raw.snippet),
        siteName: optionalText(raw.site_name),
        siteIcon: optionalText(raw.site_icon),
        publishedAt: optionalText(raw.published_at),
      }
    case 'CONTENT_RISK':
      return typeof raw.content === 'string' && raw.content.trim() !== ''
        ? { type: 'CONTENT_RISK', content: raw.content, style: text(raw.style) }
        : undefined
    case 'FILE':
      return {
        type: 'FILE',
        files: Array.isArray(raw.files) ? raw.files.filter(isObject).map(file => ({
          id: optionalText(file.id),
          name: typeof file.file_name === 'string' && file.file_name.trim() !== '' ? file.file_name : 'file',
          size: typeof file.file_size === 'number' && Number.isFinite(file.file_size) && file.file_size >= 0
            ? Math.floor(file.file_size)
            : 0,
          isImage: file.is_image === true,
          exportPath: optionalText(file.export_path),
        })) : [],
      }
    case 'TOOL_FIND':
    case 'TOOL_IMAGE_SEARCH':
    case 'READ_LINK':
    case 'PARTIAL_FILE_READ':
    case 'TIP':
    case 'REQUEST_SEARCH':
      // Recognized but not mapped: these carry no text or source this importer
      // can restore into a chat message.
      return { type: raw.type, ignored: true }
    default:
      return { type: typeof raw.type === 'string' ? raw.type : 'UNKNOWN', ignored: true }
  }
}

/**
 * Read one `chat_sessions/{id}.json` file.
 * @returns the conversation with its complete message tree.
 * @throws {ExportFormatError} when the file is not a conversation of this format.
 */
export function readSessionFile(bytes) {
  const parsed = decodeJson(bytes)
  if (!isObject(parsed)) throw new ExportFormatError('BAD_SESSION', 'the conversation file is not a JSON object')
  const id = optionalText(parsed.id)
  if (id === undefined) throw new ExportFormatError('BAD_SESSION', 'the conversation file names no id')
  if (!Array.isArray(parsed.messages)) {
    throw new ExportFormatError('BAD_SESSION', 'the conversation file holds no message list')
  }
  const messages = []
  for (const raw of parsed.messages) {
    if (!isObject(raw)) continue
    const messageId = raw.id
    if (typeof messageId !== 'number' || !Number.isInteger(messageId) || messageId < 0) continue
    if (raw.role !== 'USER' && raw.role !== 'ASSISTANT') continue
    const parentId = typeof raw.parent_id === 'number' && Number.isInteger(raw.parent_id) && raw.parent_id >= 0
      ? raw.parent_id
      : null
    messages.push({
      id: messageId,
      parentId,
      role: raw.role,
      status: optionalText(raw.status) ?? 'FINISHED',
      createdAt: parseExportTime(raw.inserted_at),
      fragments: Array.isArray(raw.fragments) ? raw.fragments.map(readFragment).filter(Boolean) : [],
    })
  }
  const current = parsed.current_message_id
  return {
    id,
    title: typeof parsed.title === 'string' ? parsed.title.trim() : '',
    currentMessageId: typeof current === 'number' && Number.isInteger(current) && current >= 0 ? current : null,
    insertedAt: parseExportTime(parsed.inserted_at),
    updatedAt: parseExportTime(parsed.updated_at),
    messages,
  }
}

/**
 * Select the messages of the active branch, from the root to the current leaf.
 *
 * The export keeps a sibling for every edited question and regenerated answer;
 * `current_message_id` names the message the user last saw, so the path to it is
 * the conversation the website would still show. When that field is absent or
 * names no message, the branch to the greatest message id is used because a
 * child always has a greater id than its parent.
 *
 * @returns messages from root to leaf.
 * @throws {ExportFormatError} for an empty tree, a duplicate id, a missing parent, or a cycle.
 */
export function selectActiveBranch(messages, currentMessageId) {
  const byId = new Map()
  let newest = null
  for (const message of messages) {
    if (byId.has(message.id)) throw new ExportFormatError('BAD_SESSION', 'the conversation repeats one message id')
    byId.set(message.id, message)
    if (newest === null || message.id > newest.id) newest = message
  }
  if (newest === null) throw new ExportFormatError('NO_MESSAGES', 'the conversation has no message')
  const selected = currentMessageId === null ? undefined : byId.get(currentMessageId)
  const chain = []
  let message = selected ?? newest
  for (;;) {
    if (chain.length > byId.size) {
      throw new ExportFormatError('BAD_SESSION', 'the message tree has a parent cycle')
    }
    chain.push(message)
    if (message.parentId === null) return chain.reverse()
    const parent = byId.get(message.parentId)
    if (parent === undefined) {
      throw new ExportFormatError('BAD_SESSION', 'a message names a parent that does not exist')
    }
    message = parent
  }
}

/** Re-export so callers can catch both archive and format failures with one type. */
export { ZipError }
