/**
 * Conversion of one exported DeepSeek conversation into a dsh-chat conversation.
 *
 * The result is a plain draft in the shape the chat store already persists, so
 * the import reuses the native history: no parallel storage, and every existing
 * feature (reading, search, rename, pin, archive, folders, branch switching,
 * continuing, handing off to Agent) works on an imported chat unchanged.
 *
 * What is preserved:
 * - the whole message tree, so edited questions and regenerated answers stay
 *   switchable as sibling versions, with `current_message_id` as the active leaf;
 * - the original title, creation and update time, and pin state;
 * - question text, answers, reasoning (with its reported duration), web-search
 *   steps and their results, opened pages, and attachment metadata with locally
 *   recovered image bytes;
 * - the server's content-warning notice, as a non-answer notice block.
 *
 * What is not invented: an answer that the export records as unfinished stays
 * unfinished, a filtered or timed-out reply keeps the server's template text,
 * and no citation markers are placed inside an answer the export does not
 * position.
 */

import { randomUUID } from 'node:crypto'
import { selectActiveBranch, ExportFormatError } from './format.js'

/** Marker stored on every imported conversation so re-imports are recognised. */
export const SOURCE_KIND = 'deepseek-export'

/** Model id recorded on imported replies: the export never names the model. */
const IMPORTED_MODEL = 'deepseek-flash'

/** Media types restored for attachments; anything else stays metadata only. */
const MIME_BY_EXTENSION = new Map([
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['webp', 'image/webp'],
  ['gif', 'image/gif'],
  ['bmp', 'image/bmp'],
  ['tif', 'image/tiff'],
  ['tiff', 'image/tiff'],
  ['svg', 'image/svg+xml'],
  ['avif', 'image/avif'],
  ['pdf', 'application/pdf'],
])

const MAX_TITLE = 80

function extensionOf(name) {
  const value = typeof name === 'string' ? name : ''
  const dot = value.lastIndexOf('.')
  return dot > 0 && dot < value.length - 1 ? value.slice(dot + 1).toLowerCase() : ''
}

function mimeTypeOf(name) {
  return MIME_BY_EXTENSION.get(extensionOf(name)) ?? 'application/octet-stream'
}

/** The display name of an exported file: its leaf name, without control characters. */
function displayName(name) {
  const value = typeof name === 'string' ? name : ''
  const leaf = value.slice(Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\')) + 1)
  const clean = leaf.replace(/[\u0000-\u001f\u007f]/gu, '').trim()
  return clean === '' ? 'file' : clean.slice(0, 200)
}

/** One display title candidate, normalized the way the store normalizes titles. */
function normalizeTitle(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE) : ''
}

/**
 * Convert the fragments of one reply into stored display blocks.
 *
 * Reasoning becomes `thinking` blocks, whose reported duration is laid out from
 * the reply's own start time. Answers become `text` blocks. A web search and an
 * opened page each become the pair the chat already renders as one process step.
 * The content-warning notice becomes a `notice` block, so it never becomes part
 * of the answer text, the copied text, or the model context.
 *
 * @param message - one export message.
 * @param startedAt - epoch ms the reply started, used for reasoning durations.
 * @returns `{ blocks, elapsedMs, thinking, search }`.
 */
function replyBlocks(message, startedAt) {
  const blocks = []
  let cursor = startedAt
  let toolIndex = 0
  let thinking = false
  let search = false
  const nextToolId = () => {
    toolIndex += 1
    return `t${message.id}-${toolIndex}`
  }
  for (const fragment of message.fragments) {
    if (fragment === undefined || fragment.ignored === true) continue
    switch (fragment.type) {
      case 'THINK': {
        const end = cursor + fragment.elapsedMs
        if (fragment.content.trim() !== '') {
          thinking = true
          blocks.push({
            type: 'thinking',
            thinking: fragment.content,
            signature: '',
            startedAt: cursor,
            endedAt: end,
          })
        }
        cursor = end
        break
      }
      case 'RESPONSE':
        if (fragment.content !== '') blocks.push({ type: 'text', text: fragment.content, citations: [] })
        break
      case 'TEMPLATE_RESPONSE':
        // The server's own wording for a filtered or timed-out reply is what the
        // website showed, so it stays the visible answer.
        if (fragment.content !== '') blocks.push({ type: 'text', text: fragment.content, citations: [] })
        break
      case 'CONTENT_RISK':
        blocks.push({ type: 'notice', kind: 'content_risk', style: fragment.style, text: fragment.content })
        break
      case 'TOOL_SEARCH': {
        if (fragment.status === 'WIP') break
        search = true
        const id = nextToolId()
        blocks.push({
          type: 'server_tool_use',
          id,
          name: 'deepseek_web_search',
          kind: 'search',
          input: { action: 'search', queries: fragment.queries },
        })
        const failed = fragment.status === 'FAILED'
        blocks.push({
          type: 'web_search_tool_result',
          tool_use_id: id,
          kind: 'search',
          content: failed
            ? [{ type: 'web_search_tool_result_error', error_code: 'unavailable' }]
            : fragment.results.map(result => ({
                type: 'web_search_result',
                title: result.title,
                url: result.url,
                snippet: result.snippet,
                site_name: result.siteName === '' ? null : result.siteName,
                site_icon: result.siteIcon === '' ? null : result.siteIcon,
                page_age: result.publishedAt ?? null,
              })),
        })
        break
      }
      case 'TOOL_OPEN': {
        if (fragment.status === 'WIP' || fragment.url === undefined) break
        const id = nextToolId()
        const failed = fragment.status === 'FAILED'
        blocks.push({
          type: 'server_tool_use',
          id,
          name: 'deepseek_read_url',
          kind: 'read_link',
          input: { url: fragment.url },
        })
        blocks.push({
          type: 'web_fetch_tool_result',
          tool_use_id: id,
          kind: 'read_link',
          content: failed
            ? { type: 'web_fetch_tool_result_error', error_code: 'unavailable' }
            : {
                type: 'web_fetch_result',
                url: fragment.url,
                title: fragment.title ?? null,
                published_at: fragment.publishedAt ?? null,
                // The export carries the page address and title only; the body is
                // never part of it, so no body is stored.
                content: {
                  type: 'document',
                  source: { type: 'text', media_type: 'text/plain', data: '' },
                  title: fragment.title ?? null,
                },
              },
        })
        break
      }
      default:
        break
    }
  }
  return { blocks, elapsedMs: cursor - startedAt, thinking, search }
}

/** Stored status of one reply, from the export status. */
function replyStatus(status) {
  // An unfinished reply stays visibly unfinished; the chat shows a muted note and
  // offers to continue it instead of pretending the answer completed.
  if (status === 'INCOMPLETE' || status === 'TIMEOUT') return 'stopped'
  return 'done'
}

/**
 * Convert one exported conversation tree.
 *
 * @param file - validated conversation file from the archive.
 * @param row - the conversation's index row (title, times, pin, message count).
 * @param options - `importedAt` timestamp and `resolveMedia(exportPath)`.
 * @returns `{ draft, stats }`; `draft` is ready for `store.adoptConversations`.
 * @throws {ExportFormatError} when the tree is unusable.
 */
export function convertConversation(file, row, options = {}) {
  const importedAt = typeof options.importedAt === 'number' ? options.importedAt : Date.now()
  const resolveMedia = typeof options.resolveMedia === 'function' ? options.resolveMedia : () => undefined
  const branch = selectActiveBranch(file.messages, file.currentMessageId)
  const lastMessage = branch[branch.length - 1]
  const firstMessage = branch[0]
  const stats = { messages: file.messages.length, files: 0, images: 0, restoredImages: 0, notices: 0 }

  const nodes = {}
  const ordered = [...file.messages].sort((left, right) => left.id - right.id)
  let fallbackTime = file.insertedAt ?? row.insertedAt ?? Date.now()
  for (const message of ordered) {
    const createdAt = message.createdAt ?? fallbackTime
    if (message.createdAt !== undefined) fallbackTime = message.createdAt
    const nodeId = `m${message.id}`
    const parentId = message.parentId === null ? null : `m${message.parentId}`
    if (message.role === 'USER') {
      const parts = []
      const files = []
      for (const fragment of message.fragments) {
        if (fragment === undefined || fragment.ignored === true) continue
        if (fragment.type === 'REQUEST') parts.push(fragment.content)
        if (fragment.type !== 'FILE') continue
        for (const entry of fragment.files) {
          stats.files += 1
          if (entry.isImage) stats.images += 1
          const recovered = entry.exportPath === undefined ? undefined : resolveMedia(entry.exportPath)
          if (recovered !== undefined && entry.isImage) stats.restoredImages += 1
          const name = displayName(entry.name)
          files.push({
            id: entry.id ?? randomUUID(),
            // Imported attachments are not on DeepSeek's file service, so the id
            // is a local marker: it names the stored bytes and is never sent to
            // the API (protocol.js skips local files when building a request).
            fileId: recovered === undefined ? `export:${entry.id ?? name}` : `local:${recovered.media}`,
            name,
            size: recovered?.size ?? entry.size,
            mimeType: mimeTypeOf(name),
            isImage: entry.isImage,
            local: true,
            ...(recovered === undefined ? {} : { media: recovered.media }),
          })
        }
      }
      nodes[nodeId] = {
        parentId,
        message: {
          id: nodeId,
          role: 'user',
          content: parts.join('\n'),
          files,
          createdAt,
        },
      }
      continue
    }
    const built = replyBlocks(message, createdAt)
    for (const block of built.blocks) {
      if (block.type === 'notice') stats.notices += 1
    }
    nodes[nodeId] = {
      parentId,
      message: {
        id: nodeId,
        role: 'assistant',
        createdAt,
        updatedAt: createdAt + built.elapsedMs,
        model: IMPORTED_MODEL,
        thinking: built.thinking,
        search: built.search,
        status: replyStatus(message.status),
        blocks: built.blocks,
        prefix: true,
      },
    }
  }
  if (Object.keys(nodes).length === 0) {
    throw new ExportFormatError('NO_MESSAGES', 'the conversation has no usable message')
  }

  // The active leaf is the message the export says the user last saw; the branch
  // selection already rejected a missing or looped tree, so the node exists.
  const leafId = `m${lastMessage.id}`
  const title = normalizeTitle(file.title) || normalizeTitle(row.title) || titleFromBranch(branch)
  const createdAt = row.insertedAt ?? file.insertedAt ?? firstMessage.createdAt ?? importedAt
  const updatedAt = Math.max(
    createdAt,
    row.updatedAt ?? file.updatedAt ?? lastMessage.createdAt ?? createdAt,
  )
  const pinned = row.pinned === true
  return {
    draft: {
      id: randomUUID(),
      title,
      // A title the export supplied is the user's own title and must not be
      // replaced by the automatic first-line title.
      titleAuto: normalizeTitle(file.title) === '' && normalizeTitle(row.title) === '',
      createdAt,
      updatedAt,
      pinned,
      pinnedAt: pinned ? updatedAt : null,
      archived: false,
      archivedAt: null,
      folderId: null,
      leafId,
      nodes,
      source: { kind: SOURCE_KIND, id: file.id, importedAt },
    },
    stats: {
      ...stats,
      activeMessages: branch.length,
    },
  }
}

/** First line of the first question on the active branch, used when no title exists. */
function titleFromBranch(branch) {
  for (const message of branch) {
    if (message.role !== 'USER') continue
    for (const fragment of message.fragments) {
      if (fragment?.type !== 'REQUEST') continue
      const line = fragment.content.split('\n').map(value => value.trim()).find(Boolean)
      if (line !== undefined) return normalizeTitle(line)
    }
    for (const fragment of message.fragments) {
      if (fragment?.type !== 'FILE' || fragment.files.length === 0) continue
      const name = displayName(fragment.files[0].name)
      if (name !== '') return normalizeTitle(name)
    }
  }
  return ''
}
