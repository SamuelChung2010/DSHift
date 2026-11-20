/**
 * Import of a DeepSeek chat export ZIP into the native Chat history.
 *
 * The flow is deliberately staged, because an export is a large local file and
 * the browser must stay usable while it is handled:
 *
 * 1. `ingest` streams the upload to a staging file inside the plugin's data
 *    directory, reads the manifest and the conversation index, and returns a
 *    preview. Nothing is written to the history yet.
 * 2. `start` runs a background job over the conversations the user selected.
 *    Each conversation file is inflated on its own, converted, and merged; the
 *    history is written in batches, so a large import neither blocks the browser
 *    nor rewrites the whole document once per conversation.
 * 3. `status` is polled by the browser for progress, then for the final result
 *    and the refreshed sidebar.
 *
 * Re-importing is idempotent: every conversation carries a stable source id, and
 * an id the history already holds is skipped instead of duplicated. A
 * conversation that fails is reported and the rest continue; the history
 * document is backed up before the first write.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { ZipArchive, ZipError } from './zip.js'
import {
  ExportFormatError, SUPPORTED_EXPORT_FORMAT_VERSION, readManifest, readSessionFile, readSessionIndex,
} from './format.js'
import { SOURCE_KIND, convertConversation } from './convert.js'
import { ImportMediaStore, isSupportedMediaExtension } from './media.js'

/** An import step that cannot continue; `code` selects the browser explanation. */
export class ImportError extends Error {
  constructor(code, message, { status = 400, cause } = {}) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'ImportError'
    this.code = code
    this.status = status
  }
}

const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u
const MAX_MANIFEST_BYTES = 1024 * 1024
const MAX_INDEX_BYTES = 64 * 1024 * 1024
/** Conversations converted between two history writes. */
const BATCH_CONVERSATIONS = 40
/** Marker placed in the file name of the pre-import state backup. */
const BACKUP_LABEL = 'import-backup'
/** Finished jobs kept for a late poll; older ones are dropped. */
const JOBS_KEPT = 4
const MAX_FAILURES_REPORTED = 40

/** Default deployment limits, each overridable through the plugin config. */
export const IMPORT_LIMITS = {
  /** Largest export ZIP accepted. Exports of a long history reach ~150 MB. */
  maxUploadBytes: 512 * 1024 * 1024,
  /** Largest single JSON entry inflated (one conversation file). */
  maxEntryBytes: 128 * 1024 * 1024,
  /** Largest single image recovered. */
  maxMediaBytes: 32 * 1024 * 1024,
  /** Total image bytes one import may write. */
  maxMediaTotalBytes: 1024 * 1024 * 1024,
  /** How long an uploaded archive waits for the user to start the import. */
  stagingTtlMs: 30 * 60 * 1000,
}

function extensionOf(name) {
  const value = typeof name === 'string' ? name : ''
  const dot = value.lastIndexOf('.')
  return dot > 0 && dot < value.length - 1 ? value.slice(dot + 1).toLowerCase() : ''
}

function errorCode(error) {
  if (error instanceof ImportError) return error.code
  if (error instanceof ZipError) return error.code
  if (error instanceof ExportFormatError) return error.code
  return 'INTERNAL'
}

function describe(error) {
  return error instanceof Error ? error.message : String(error)
}

/** Sort index rows most recently updated first, so the newest chats lead. */
function rankRows(rows) {
  return [...rows].sort((left, right) => (
    (right.updatedAt ?? 0) - (left.updatedAt ?? 0)
    || (right.insertedAt ?? 0) - (left.insertedAt ?? 0)
    || (left.id < right.id ? -1 : 1)
  ))
}

/**
 * Every archive entry one conversation's file fragments name, as `export_path`.
 * Branches are included, so switching versions after the import still finds the
 * images of the other branch.
 */
function mediaEntriesOf(file) {
  const paths = new Set()
  for (const message of file.messages) {
    if (message.role !== 'USER') continue
    for (const fragment of message.fragments) {
      if (fragment?.type !== 'FILE') continue
      for (const entry of fragment.files) {
        if (!entry.isImage || entry.exportPath === undefined) continue
        paths.add(entry.exportPath)
      }
    }
  }
  return paths
}

export class ChatImportManager {
  /**
   * @param options - history store, data directory, logger and limit overrides.
   */
  constructor({ store, directory, logger = console, limits = {} } = {}) {
    this.store = store
    this.directory = directory
    this.logger = logger
    this.limits = { ...IMPORT_LIMITS, ...limits }
    this.stagingDirectory = path.join(directory, 'imports', 'staging')
    this.media = new ImportMediaStore(path.join(directory, 'imports', 'media'))
    /** Staged archives by token; `{ token, path, name, bytes, at }`. */
    this.staged = new Map()
    this.jobs = new Map()
    this.active = null
    this.disposed = false
  }

  /** Remove one staged archive and forget its token. */
  async dropStaged(token) {
    const staged = this.staged.get(token)
    this.staged.delete(token)
    if (staged === undefined) return false
    await fs.rm(staged.directory, { recursive: true, force: true }).catch(() => {})
    return true
  }

  /** Delete staged archives that no longer belong to a live import. */
  async sweepStaging() {
    const now = Date.now()
    for (const [token, staged] of this.staged) {
      if (this.active?.token === token) continue
      if (now - staged.at <= this.limits.stagingTtlMs) continue
      await this.dropStaged(token)
    }
    // A crash can leave a directory whose token was never registered; drop those
    // as well instead of letting an interrupted upload occupy disk forever.
    let entries
    try {
      entries = await fs.readdir(this.stagingDirectory, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || this.staged.has(entry.name) || this.active?.token === entry.name) continue
      const directory = path.join(this.stagingDirectory, entry.name)
      try {
        const info = await fs.stat(directory)
        if (now - info.mtimeMs <= this.limits.stagingTtlMs) continue
      } catch {
        continue
      }
      await fs.rm(directory, { recursive: true, force: true }).catch(() => {})
    }
  }

  /**
   * Stream one uploaded archive to the staging area and read its preview.
   *
   * The request body is written chunk by chunk, so the browser's upload never
   * becomes one big buffer on the Host, and the size cap is enforced as bytes
   * arrive. Running out of space, a truncated body, or a non-ZIP file removes
   * the partial file before the error leaves this method.
   *
   * @param request - the HTTP request carrying the archive.
   * @param name - the file name to report back.
   * @returns the preview.
   */
  async ingest(request, name) {
    if (this.disposed) throw new ImportError('DISPOSED', 'the chat plugin was unloaded', { status: 503 })
    await this.sweepStaging()
    const declared = Number(request.headers.get('content-length') ?? '0')
    const limit = this.limits.maxUploadBytes
    if (Number.isFinite(declared) && declared > limit) {
      throw new ImportError('ARCHIVE_TOO_LARGE', `the archive exceeds the ${limit}-byte import limit`, { status: 413 })
    }
    if (request.body === null || request.body === undefined) {
      throw new ImportError('EMPTY_UPLOAD', 'the request carried no file', { status: 400 })
    }
    const token = randomUUID()
    const directory = path.join(this.stagingDirectory, token)
    const target = path.join(directory, 'export.zip')
    await fs.mkdir(directory, { recursive: true })
    let bytes = 0
    let handle
    try {
      handle = await fs.open(target, 'w')
      for await (const chunk of request.body) {
        bytes += chunk.length
        if (bytes > limit) {
          throw new ImportError('ARCHIVE_TOO_LARGE', `the archive exceeds the ${limit}-byte import limit`, { status: 413 })
        }
        await handle.write(chunk)
      }
      await handle.close()
      handle = undefined
      if (bytes === 0) throw new ImportError('EMPTY_UPLOAD', 'the request carried no file', { status: 400 })
      const preview = await this.readPreview(target, name, bytes)
      const staged = { token, path: target, directory, name, bytes, at: Date.now() }
      this.staged.set(token, staged)
      return { token, ...preview }
    } catch (error) {
      if (handle !== undefined) await handle.close().catch(() => {})
      await fs.rm(directory, { recursive: true, force: true }).catch(() => {})
      if (error instanceof ImportError || error instanceof ZipError || error instanceof ExportFormatError) {
        throw new ImportError(errorCode(error), describe(error), { status: error.status ?? 400, cause: error })
      }
      throw new ImportError('INGEST_FAILED', describe(error), { status: 500, cause: error })
    }
  }

  /**
   * Read the manifest and the conversation index of one archive.
   * @returns `{ file, formatVersion, conversations, stats }`.
   */
  async readPreview(archivePath, name, bytes) {
    const archive = await ZipArchive.open(archivePath, {
      maxArchiveBytes: this.limits.maxUploadBytes,
      maxEntryBytes: this.limits.maxEntryBytes,
    })
    try {
      const manifestBytes = await archive.read('manifest.json', MAX_MANIFEST_BYTES)
      if (manifestBytes === undefined) throw new ImportError('MISSING_MANIFEST', 'the archive has no manifest.json')
      const manifest = readManifest(manifestBytes)
      if (manifest.version !== SUPPORTED_EXPORT_FORMAT_VERSION) {
        throw new ImportError(
          'UNSUPPORTED_VERSION',
          `export format version ${manifest.version} is not supported`,
        )
      }
      const indexBytes = await archive.read('chat_session_index.json', MAX_INDEX_BYTES)
      if (indexBytes === undefined) throw new ImportError('MISSING_INDEX', 'the archive has no conversation index')
      const rows = rankRows(readSessionIndex(indexBytes))
      const imported = this.store.importedSourceIds(SOURCE_KIND)
      const conversations = rows.map((row) => ({
        sourceId: row.id,
        title: row.title,
        messageCount: row.messageCount,
        createdAt: row.insertedAt ?? null,
        updatedAt: row.updatedAt ?? null,
        pinned: row.pinned,
        imported: imported.has(row.id),
      }))
      const already = conversations.filter(conversation => conversation.imported).length
      return {
        file: { name, bytes },
        formatVersion: manifest.version,
        conversations,
        stats: { total: conversations.length, imported: already, importable: conversations.length - already },
      }
    } catch (error) {
      if (error instanceof ImportError || error instanceof ZipError || error instanceof ExportFormatError) {
        throw new ImportError(errorCode(error), describe(error), { status: 400, cause: error })
      }
      throw new ImportError('PREVIEW_FAILED', describe(error), { status: 500, cause: error })
    } finally {
      await archive.close()
    }
  }

  /** One job snapshot, safe to serialize to the browser. */
  snapshot(job) {
    return {
      id: job.id,
      state: job.state,
      total: job.total,
      done: job.done,
      imported: job.imported.length,
      skipped: job.skipped.length,
      failed: job.failures.length,
      startedAt: job.startedAt,
      updatedAt: job.updatedAt,
      media: job.media,
      failures: job.failures.slice(0, MAX_FAILURES_REPORTED),
      skippedItems: job.skipped.slice(0, MAX_FAILURES_REPORTED),
      error: job.error,
      backup: job.backup ?? null,
    }
  }

  /** Final sidebar state, attached to a finished job so one poll refreshes the list. */
  finalPayload(job) {
    return {
      job: this.snapshot(job),
      conversations: this.store.listSummaries(),
      folders: this.store.listFolders(),
    }
  }

  /**
   * Start importing the selected conversations.
   * @param options - `{ token, ids }`.
   * @returns `{ job }`, already running in the background.
   */
  async start({ token, ids } = {}) {
    if (this.disposed) throw new ImportError('DISPOSED', 'the chat plugin was unloaded', { status: 503 })
    if (typeof token !== 'string' || !TOKEN_PATTERN.test(token)) {
      throw new ImportError('INVALID_REQUEST', 'the import token is not valid')
    }
    if (this.active !== null) {
      throw new ImportError('BUSY', 'another import is still running', { status: 409 })
    }
    const staged = this.staged.get(token)
    if (staged === undefined) {
      throw new ImportError('TOKEN_EXPIRED', 'the uploaded archive is no longer available; choose the file again', { status: 410 })
    }
    const wanted = new Set(Array.isArray(ids) ? ids.filter(id => typeof id === 'string' && id !== '') : [])
    if (wanted.size === 0) throw new ImportError('NO_SELECTION', 'no conversation was selected')

    const archive = await ZipArchive.open(staged.path, {
      maxArchiveBytes: this.limits.maxUploadBytes,
      maxEntryBytes: this.limits.maxEntryBytes,
    })
    let rows
    try {
      const indexBytes = await archive.read('chat_session_index.json', MAX_INDEX_BYTES)
      if (indexBytes === undefined) throw new ImportError('MISSING_INDEX', 'the archive has no conversation index')
      rows = rankRows(readSessionIndex(indexBytes)).filter(row => wanted.has(row.id))
    } catch (error) {
      throw new ImportError(errorCode(error), describe(error), { status: 400, cause: error })
    } finally {
      await archive.close()
    }
    if (rows.length === 0) throw new ImportError('NO_SELECTION', 'none of the selected conversations is in the archive')

    const job = {
      id: randomUUID(),
      token,
      state: 'running',
      total: rows.length,
      done: 0,
      imported: [],
      skipped: [],
      failures: [],
      media: { restored: 0, bytes: 0, omitted: 0 },
      startedAt: Date.now(),
      updatedAt: Date.now(),
      error: null,
      backup: null,
      cancelRequested: false,
      rows,
    }
    this.jobs.set(job.id, job)
    this.active = job
    this.trimJobs()
    // The job runs detached: the browser polls `status`, which is what keeps the
    // request short and the progress observable from any render.
    void this.run(job, staged).catch((error) => {
      job.state = 'failed'
      job.error = describe(error)
      job.updatedAt = Date.now()
      this.logger.warn?.('deepseek-chat: import failed', describe(error))
    }).finally(() => {
      if (this.active === job) this.active = null
      job.updatedAt = Date.now()
      void fs.rm(staged.directory, { recursive: true, force: true }).catch(() => {})
      this.staged.delete(job.token)
    })
    return { job: this.snapshot(job) }
  }

  /** Keep only the most recent jobs; older ones are no longer polled. */
  trimJobs() {
    if (this.jobs.size <= JOBS_KEPT) return
    for (const [id, job] of this.jobs) {
      if (this.jobs.size <= JOBS_KEPT) break
      if (job.state === 'running') continue
      this.jobs.delete(id)
    }
  }

  /**
   * Run one import job to completion.
   *
   * Each conversation is handled inside its own try: a malformed tree, a missing
   * entry, or an unexpected conversion failure is recorded and the next
   * conversation continues. Converted conversations are written in batches
   * through the store, so an interrupted import leaves the history exactly as
   * the last completed batch wrote it.
   */
  async run(job, staged) {
    const archive = await ZipArchive.open(staged.path, {
      maxArchiveBytes: this.limits.maxUploadBytes,
      maxEntryBytes: this.limits.maxEntryBytes,
    }).catch(() => null)
    if (archive === null) {
      job.state = 'failed'
      job.error = 'the uploaded archive could not be reopened'
      return
    }
    let batch = []
    const flush = async () => {
      if (batch.length === 0) return
      const drafts = batch
      batch = []
      try {
        const result = await this.store.adoptConversations(drafts.map(entry => entry.draft))
        const accepted = new Set(result.added)
        for (const entry of drafts) {
          if (accepted.has(entry.draft.id)) {
            job.imported.push(entry.result)
          } else {
            job.skipped.push({ sourceId: entry.sourceId, title: entry.title, reason: 'duplicate' })
          }
        }
      } catch (error) {
        // A failed history write ends the job: continuing would only stack more
        // conversations in memory that the document does not hold.
        for (const entry of drafts) {
          job.failures.push({ sourceId: entry.sourceId, title: entry.title, code: 'WRITE_FAILED', reason: describe(error) })
        }
        job.error = `the chat history could not be written: ${describe(error)}`
        job.state = 'failed'
      }
    }
    try {
      try {
        job.backup = await this.store.backup(BACKUP_LABEL)
      } catch (error) {
        // A backup that cannot be made does not make the import unsafe: the store
        // still writes atomically, and the failure is reported in the result.
        job.error = `the previous history could not be backed up: ${describe(error)}`
      }
      for (const row of job.rows) {
        if (job.state === 'failed') break
        if (job.cancelRequested) break
        let entry
        try {
          if (this.store.findBySource(SOURCE_KIND, row.id) !== undefined) {
            job.skipped.push({ sourceId: row.id, title: row.title, reason: 'already-imported' })
            job.done += 1
            job.updatedAt = Date.now()
            continue
          }
          entry = await this.convertRow(archive, row, job)
        } catch (error) {
          job.failures.push({
            sourceId: row.id,
            title: row.title,
            code: errorCode(error),
            reason: describe(error).slice(0, 300),
          })
          job.done += 1
          job.updatedAt = Date.now()
          await this.yieldTurn()
          continue
        }
        job.done += 1
        job.updatedAt = Date.now()
        batch.push(entry)
        if (batch.length >= BATCH_CONVERSATIONS) await flush()
        await this.yieldTurn()
      }
      await flush()
      if (job.state !== 'failed') {
        job.state = job.cancelRequested ? 'cancelled' : 'done'
      }
    } catch (error) {
      job.state = 'failed'
      job.error = describe(error)
      this.logger.warn?.('deepseek-chat: import stopped', describe(error))
    } finally {
      await archive.close()
      job.updatedAt = Date.now()
    }
  }

  /**
   * Convert one selected conversation, recovering the images of its tree first.
   * @returns `{ draft, result, sourceId, title }` for the next history batch.
   */
  async convertRow(archive, row, job) {
    const entryName = `chat_sessions/${row.id}.json`
    const bytes = await archive.read(entryName, this.limits.maxEntryBytes)
    if (bytes === undefined) throw new ImportError('MISSING_ENTRY', 'the archive has no file for this conversation')
    const file = readSessionFile(bytes)
    const recovered = new Map()
    for (const exportPath of mediaEntriesOf(file)) {
      if (job.media.bytes >= this.limits.maxMediaTotalBytes) {
        job.media.omitted += 1
        continue
      }
      const extension = extensionOf(exportPath)
      if (!isSupportedMediaExtension(extension)) {
        job.media.omitted += 1
        continue
      }
      const declared = archive.sizeOf(exportPath)
      if (declared === undefined) {
        job.media.omitted += 1
        continue
      }
      if (declared > this.limits.maxMediaBytes) {
        job.media.omitted += 1
        continue
      }
      let data
      try {
        data = await archive.read(exportPath, this.limits.maxMediaBytes)
      } catch {
        job.media.omitted += 1
        continue
      }
      if (data === undefined) {
        job.media.omitted += 1
        continue
      }
      const saved = await this.media.save(data, extension)
      if (saved === undefined) {
        job.media.omitted += 1
        continue
      }
      job.media.bytes += saved.size
      recovered.set(exportPath, saved)
    }
    const { draft, stats } = convertConversation(file, row, {
      importedAt: Date.now(),
      resolveMedia: exportPath => recovered.get(exportPath),
    })
    job.media.restored += stats.restoredImages
    return {
      draft,
      sourceId: row.id,
      title: draft.title || row.title,
      result: {
        sourceId: row.id,
        conversationId: draft.id,
        title: draft.title || row.title,
        messages: stats.messages,
        images: stats.restoredImages,
      },
    }
  }

  /** Let the event loop run one turn: inflation and JSON parsing are synchronous. */
  async yieldTurn() {
    await new Promise((resolve) => setImmediate(resolve))
  }

  /** Progress of one job, or null when the job is unknown or expired. */
  status(id) {
    if (typeof id !== 'string' || id === '') return null
    const job = this.jobs.get(id)
    if (job === undefined) return null
    return job.state === 'running' ? { job: this.snapshot(job) } : this.finalPayload(job)
  }

  /** Ask one running job to stop after the conversation it is handling. */
  cancel(id) {
    const job = typeof id === 'string' ? this.jobs.get(id) : undefined
    if (job === undefined) throw new ImportError('NOT_FOUND', 'the import job does not exist', { status: 404 })
    if (job.state !== 'running') return { job: this.snapshot(job) }
    job.cancelRequested = true
    job.updatedAt = Date.now()
    return { job: this.snapshot(job) }
  }

  /** Resolve one stored image for the media route. */
  async mediaFile(media) {
    return this.media.resolve(media)
  }

  /** Stop timers and release staged archives; a running job is asked to cancel. */
  dispose() {
    this.disposed = true
    if (this.active !== null) this.active.cancelRequested = true
    this.active = null
    for (const token of [...this.staged.keys()]) {
      void this.dropStaged(token)
    }
  }
}
