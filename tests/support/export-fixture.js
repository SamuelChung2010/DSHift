/**
 * Synthetic DeepSeek chat-export fixtures.
 *
 * The tests must never embed a real export, so every archive is built from the
 * structures the exporter is documented to write: `manifest.json`,
 * `chat_session_index.json`, `chat_sessions/{id}.json`, and the image files
 * under `chat_sessions/{id}_files/`. The ZIP writer is deliberately tiny — it
 * produces one of the two shapes this importer reads (stored bytes or raw
 * deflate) so a test can also cover a damaged or hostile archive.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { deflateRawSync } from 'node:zlib'
import { createHash } from 'node:crypto'

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let index = 0; index < 256; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    table[index] = value
  }
  return table
})()

function crc32(bytes) {
  let value = -1
  for (let index = 0; index < bytes.length; index += 1) value = CRC_TABLE[(value ^ bytes[index]) & 0xff] ^ (value >>> 8)
  return (value ^ -1) >>> 0
}

/**
 * Build one ZIP archive in memory.
 * @param entries - `{ name, data, deflate?, declaredSize?, crc? }`; the overrides
 *   exist so a test can write an archive that lies about itself.
 * @returns the archive bytes.
 */
export function buildZip(entries) {
  const locals = []
  const centrals = []
  let offset = 0
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8')
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data ?? '', 'utf8')
    const deflate = entry.deflate === true
    const payload = deflate ? deflateRawSync(data) : data
    const checksum = entry.crc ?? crc32(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6)
    local.writeUInt16LE(deflate ? 8 : 0, 8)
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(0, 12)
    local.writeUInt32LE(checksum, 14)
    local.writeUInt32LE(payload.length, 18)
    local.writeUInt32LE(entry.declaredSize ?? data.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)
    locals.push(local, name, payload)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(deflate ? 8 : 0, 10)
    central.writeUInt16LE(0, 12)
    central.writeUInt16LE(0, 14)
    central.writeUInt32LE(checksum, 16)
    central.writeUInt32LE(payload.length, 20)
    central.writeUInt32LE(entry.declaredSize ?? data.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt16LE(0, 30)
    central.writeUInt16LE(0, 32)
    central.writeUInt16LE(0, 34)
    central.writeUInt16LE(0, 36)
    central.writeUInt32LE(0, 38)
    central.writeUInt32LE(offset, 42)
    centrals.push(central, name)
    offset += local.length + name.length + payload.length
  }
  const directory = Buffer.concat(centrals)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(entries.length, 8)
  eocd.writeUInt16LE(entries.length, 10)
  eocd.writeUInt32LE(directory.length, 12)
  eocd.writeUInt32LE(offset, 16)
  eocd.writeUInt16LE(0, 20)
  return Buffer.concat([...locals, directory, eocd])
}

/** ISO timestamp `seconds` after `base`, so a test reads chronologically. */
export function timeISO(base, seconds = 0) {
  return new Date(base + seconds * 1000).toISOString()
}

/** One `REQUEST` fragment. */
export function request(content) {
  return { type: 'REQUEST', content }
}

/** One `RESPONSE` fragment. */
export function response(content) {
  return { type: 'RESPONSE', content }
}

/** One `THINK` fragment with the export's `elapsed_secs` field. */
export function think(content, seconds = 1) {
  return { type: 'THINK', content, elapsed_secs: seconds }
}

/** One `TOOL_SEARCH` fragment. */
export function toolSearch(queries, results, { status = 'FINISHED', stage = 1 } = {}) {
  return {
    type: 'TOOL_SEARCH',
    status,
    stage_id: stage,
    queries,
    results: results.map(result => ({
      url: result.url,
      title: result.title ?? '',
      snippet: result.snippet ?? '',
      site_name: result.siteName ?? '',
      site_icon: result.siteIcon ?? '',
      published_at: result.publishedAt ?? null,
    })),
  }
}

/** One `TOOL_OPEN` fragment; `url` null is the export's stage marker. */
export function toolOpen(url, { status = 'FINISHED', title = null, stage = 1 } = {}) {
  return {
    type: 'TOOL_OPEN',
    status,
    stage_id: stage,
    url,
    title,
    snippet: null,
    site_name: null,
    published_at: null,
    site_icon: null,
  }
}

/** One `FILE` fragment describing user attachments. */
export function files(entries) {
  return {
    type: 'FILE',
    files: entries.map(entry => ({
      id: entry.id,
      file_name: entry.name,
      file_size: entry.size ?? 1024,
      token_usage: 0,
      inserted_at: '2026-01-01T00:00:00.000Z',
      export_path: entry.exportPath ?? null,
      is_image: entry.isImage === true,
      ...(entry.width === undefined ? {} : { width: entry.width, height: entry.height }),
    })),
  }
}

/** One `CONTENT_RISK` fragment, the server warning recorded next to an answer. */
export function contentRisk(content = '该回答可能涉及不确定内容，请注意甄别。') {
  return { type: 'CONTENT_RISK', content, style: 'WARNING' }
}

/** One `TEMPLATE_RESPONSE` fragment. */
export function templateResponse(content) {
  return { type: 'TEMPLATE_RESPONSE', content }
}

/** One export message. */
export function message(id, role, fragments, { parentId = null, status = 'FINISHED', at } = {}) {
  return {
    id,
    parent_id: parentId,
    role,
    status,
    thinking_enabled: true,
    search_enabled: true,
    accumulated_token_usage: 0,
    inserted_at: at ?? '2026-01-01T00:00:00.000Z',
    fragments,
  }
}

/** One `chat_sessions/{id}.json` document. */
export function sessionFile({ id, title, messages, currentMessageId = null, insertedAt, updatedAt }) {
  return {
    id,
    title,
    pinned: false,
    current_message_id: currentMessageId,
    inserted_at: insertedAt ?? '2026-01-01T00:00:00.000Z',
    updated_at: updatedAt ?? insertedAt ?? '2026-01-01T00:00:00.000Z',
    messages,
  }
}

/** One `chat_session_index.json` row. */
export function indexRow({ id, title, messageCount = 0, insertedAt, updatedAt, pinned = false }) {
  return {
    id,
    title,
    pinned,
    message_count: messageCount,
    inserted_at: insertedAt ?? '2026-01-01T00:00:00.000Z',
    updated_at: updatedAt ?? insertedAt ?? '2026-01-01T00:00:00.000Z',
  }
}

/**
 * Build a complete export archive.
 * @param options - `{ sessions, index, manifest, media, extra, deflate }`:
 *   `sessions` are session documents, `index` overrides the generated rows,
 *   `media` adds `{ path, data }` entries, `extra` adds arbitrary entries.
 * @returns the archive bytes.
 */
export function exportZip({
  sessions = [], index, manifest = { export_format_version: 3 }, media = [], extra = [], deflate = true,
}) {
  const rows = index ?? sessions.map(sessionFile => indexRow({
    id: sessionFile.id,
    title: sessionFile.title,
    messageCount: sessionFile.messages.length,
    insertedAt: sessionFile.inserted_at,
    updatedAt: sessionFile.updated_at,
  }))
  const entries = [
    { name: 'manifest.json', data: `${JSON.stringify(manifest)}\n`, deflate },
    { name: 'chat_session_index.json', data: `${JSON.stringify(rows)}\n`, deflate },
    ...sessions.map(sessionDocument => ({
      name: `chat_sessions/${sessionDocument.id}.json`,
      data: `${JSON.stringify(sessionDocument)}\n`,
      deflate,
    })),
    ...media.map(entry => ({ name: entry.path, data: entry.data, deflate })),
    // An extra entry keeps every override, so a test can write a lying header.
    ...extra.map(entry => ({ ...entry, deflate: entry.deflate ?? deflate })),
  ]
  return buildZip(entries)
}

/** A tiny valid PNG (1x1) so a test can prove image bytes survive a round trip. */
export const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
  'base64',
)

/** SHA-256 of some bytes, as the media store names its files. */
export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

/** Write an archive to disk and return its path. */
export async function writeArchive(directory, name, bytes) {
  await fs.mkdir(directory, { recursive: true })
  const file = path.join(directory, name)
  await fs.writeFile(file, bytes)
  return file
}
