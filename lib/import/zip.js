/**
 * A small, read-only ZIP reader for DeepSeek chat exports.
 *
 * Only Node built-ins are used. The archive is read through a file handle, so a
 * 130 MB export never sits in memory as a whole: the central directory is read
 * once, and an entry is inflated only when a caller names it. Nothing is ever
 * written to a path derived from an entry name, which is what makes a hostile
 * archive harmless here: a name is only ever a lookup key.
 *
 * Safety limits are enforced before any work happens:
 * - the archive size, entry count, and per-entry uncompressed size are capped;
 * - encrypted entries, unsupported compression methods and ZIP64 records are
 *   refused with a typed error instead of being guessed at;
 * - inflation is capped by `maxOutputLength`, so a lying header cannot expand
 *   into a memory-exhausting stream;
 * - a CRC mismatch is reported as a damaged entry.
 */

import { promises as fs } from 'node:fs'
import { inflateRaw } from 'node:zlib'
import { promisify } from 'node:util'

const inflate = promisify(inflateRaw)

const EOCD_SIGNATURE = 0x06054b50
const CENTRAL_SIGNATURE = 0x02014b50
const LOCAL_SIGNATURE = 0x04034b50
const EOCD_MIN_BYTES = 22
const EOCD_MAX_BYTES = EOCD_MIN_BYTES + 0xffff
const CENTRAL_MIN_BYTES = 46
const LOCAL_BYTES = 30

/** An archive that cannot be read; `code` names the user-facing reason. */
export class ZipError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ZipError'
    this.code = code
  }
}

/** A ZIP entry the caller may request by name. */
export function zipEntryInfo(raw) {
  return {
    name: raw.name,
    /** Uncompressed size declared by the central directory. */
    size: raw.size,
    /** Compressed size declared by the central directory. */
    compressedSize: raw.compressedSize,
    compression: raw.compression,
  }
}

/** CRC-32 table, built once. The polynomial is the standard ZIP one. */
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
  for (let index = 0; index < bytes.length; index += 1) {
    value = CRC_TABLE[(value ^ bytes[index]) & 0xff] ^ (value >>> 8)
  }
  return (value ^ -1) >>> 0
}

function u16(buffer, offset) {
  return buffer.readUInt16LE(offset)
}

/**
 * Read exactly `length` bytes at `position`; a short read is retried so a large
 * entry is never parsed from a partially filled buffer.
 */
async function readExact(handle, buffer, length, position) {
  let done = 0
  while (done < length) {
    const { bytesRead } = await handle.read(buffer, done, length - done, position + done)
    if (bytesRead <= 0) break
    done += bytesRead
  }
  return done
}

function u32(buffer, offset) {
  return buffer.readUInt32LE(offset)
}

/**
 * Parse one central-directory record.
 * @returns `{ entry, next }`, or null when the record names a directory.
 */
function readCentralEntry(directory, offset) {
  if (offset + CENTRAL_MIN_BYTES > directory.length) {
    throw new ZipError('ARCHIVE_DAMAGED', 'the central directory ends mid-record')
  }
  if (u32(directory, offset) !== CENTRAL_SIGNATURE) {
    throw new ZipError('ARCHIVE_DAMAGED', 'the central directory holds an unknown record')
  }
  const flags = u16(directory, offset + 8)
  const compression = u16(directory, offset + 10)
  const crc = u32(directory, offset + 16)
  const compressedSize = u32(directory, offset + 20)
  const size = u32(directory, offset + 24)
  const nameBytes = u16(directory, offset + 28)
  const extraBytes = u16(directory, offset + 30)
  const commentBytes = u16(directory, offset + 32)
  const localOffset = u32(directory, offset + 42)
  if (size === 0xffffffff || compressedSize === 0xffffffff || localOffset === 0xffffffff) {
    throw new ZipError('ARCHIVE_UNSUPPORTED', 'ZIP64 archives are not supported')
  }
  const nameStart = offset + CENTRAL_MIN_BYTES
  const nameEnd = nameStart + nameBytes
  if (nameEnd > directory.length) {
    throw new ZipError('ARCHIVE_DAMAGED', 'the central directory name is truncated')
  }
  const name = directory.toString('utf8', nameStart, nameEnd)
  const next = nameEnd + extraBytes + commentBytes
  if (next > directory.length) {
    throw new ZipError('ARCHIVE_DAMAGED', 'the central directory record is truncated')
  }
  const entry = {
    name,
    flags,
    compression,
    crc,
    compressedSize,
    size,
    localOffset,
  }
  return { entry, next }
}

/**
 * Read one ZIP archive from disk.
 *
 * The returned object keeps the handle open until {@link ZipArchive#close}, so a
 * caller that reads many entries pays one directory parse. Entry names are
 * compared exactly and never resolved against the filesystem.
 */
export class ZipArchive {
  /**
   * @param handle - open file handle.
   * @param fileSize - archive size in bytes.
   * @param entries - parsed central directory keyed by entry name.
   * @param maxEntryBytes - largest entry this archive may inflate.
   */
  constructor(handle, fileSize, entries, maxEntryBytes) {
    this.handle = handle
    this.fileSize = fileSize
    this.entries = entries
    this.maxEntryBytes = maxEntryBytes
    this.closed = false
  }

  /**
   * Open an archive and read its central directory.
   * @param filePath - archive on disk.
   * @param options - limits.
   * @returns the reader.
   * @throws {ZipError} when the file is not a readable ZIP archive or breaks a limit.
   */
  static async open(filePath, { maxArchiveBytes = 1024 * 1024 * 1024, maxEntryBytes = 64 * 1024 * 1024, maxEntries = 20_000 } = {}) {
    const handle = await fs.open(filePath, 'r')
    try {
      const stat = await handle.stat()
      if (stat.size === 0) throw new ZipError('NOT_ZIP', 'the file is empty')
      if (stat.size > maxArchiveBytes) throw new ZipError('ARCHIVE_TOO_LARGE', 'the archive is larger than the import limit')
      const tailLength = Math.min(stat.size, EOCD_MAX_BYTES)
      const tail = Buffer.alloc(tailLength)
      await readExact(handle, tail, tailLength, stat.size - tailLength)
      let eocd = -1
      for (let offset = tailLength - EOCD_MIN_BYTES; offset >= 0; offset -= 1) {
        if (u32(tail, offset) !== EOCD_SIGNATURE) continue
        eocd = offset
        break
      }
      if (eocd < 0) throw new ZipError('NOT_ZIP', 'the file is not a ZIP archive')
      const diskNumber = u16(tail, eocd + 4)
      const directoryDisk = u16(tail, eocd + 6)
      const entriesOnDisk = u16(tail, eocd + 8)
      const totalEntries = u16(tail, eocd + 10)
      const directorySize = u32(tail, eocd + 12)
      const directoryOffset = u32(tail, eocd + 16)
      if (diskNumber !== 0 || directoryDisk !== 0 || entriesOnDisk !== totalEntries) {
        throw new ZipError('ARCHIVE_UNSUPPORTED', 'multi-volume archives are not supported')
      }
      if (totalEntries === 0xffff || directorySize === 0xffffffff || directoryOffset === 0xffffffff) {
        throw new ZipError('ARCHIVE_UNSUPPORTED', 'ZIP64 archives are not supported')
      }
      if (totalEntries > maxEntries) throw new ZipError('ARCHIVE_UNSUPPORTED', 'the archive holds too many files')
      if (directoryOffset + directorySize > stat.size) {
        throw new ZipError('ARCHIVE_DAMAGED', 'the central directory lies outside the archive')
      }
      const directory = Buffer.alloc(directorySize)
      if (directorySize > 0) await readExact(handle, directory, directorySize, directoryOffset)
      const entries = new Map()
      let offset = 0
      for (let index = 0; index < totalEntries; index += 1) {
        const record = readCentralEntry(directory, offset)
        offset = record.next
        const entry = record.entry
        if (entry.name.endsWith('/')) continue
        if (entries.has(entry.name)) {
          throw new ZipError('ARCHIVE_DAMAGED', 'the archive lists one file name twice')
        }
        entries.set(entry.name, entry)
      }
      return new ZipArchive(handle, stat.size, entries, maxEntryBytes)
    } catch (error) {
      await handle.close().catch(() => {})
      throw error
    }
  }

  /** Names of every file entry, in directory order. */
  names() {
    return [...this.entries.keys()]
  }

  /** Whether the archive holds an entry with this exact name. */
  has(name) {
    return this.entries.has(name)
  }

  /** Declared uncompressed size of one entry, or undefined. */
  sizeOf(name) {
    return this.entries.get(name)?.size
  }

  /**
   * Inflate one entry.
   * @param name - exact entry name.
   * @param maxBytes - cap for this read; entries above it are refused before inflation.
   * @returns the bytes, or undefined when the archive has no such entry.
   * @throws {ZipError} when the entry is encrypted, unsupported, oversized or damaged.
   */
  async read(name, maxBytes = this.maxEntryBytes) {
    if (this.closed) throw new ZipError('ARCHIVE_CLOSED', 'the archive is already closed')
    const entry = this.entries.get(name)
    if (entry === undefined) return undefined
    if ((entry.flags & 0x1) === 1) throw new ZipError('ARCHIVE_UNSUPPORTED', 'encrypted entries are not supported')
    if (entry.compression !== 0 && entry.compression !== 8) {
      throw new ZipError('ARCHIVE_UNSUPPORTED', 'unsupported compression method')
    }
    if (entry.size > maxBytes || entry.compressedSize > maxBytes) {
      throw new ZipError('ENTRY_TOO_LARGE', 'the entry is larger than the import limit')
    }
    const header = Buffer.alloc(LOCAL_BYTES)
    await readExact(this.handle, header, LOCAL_BYTES, entry.localOffset)
    if (u32(header, 0) !== LOCAL_SIGNATURE) {
      throw new ZipError('ARCHIVE_DAMAGED', 'the entry header is missing')
    }
    const nameBytes = u16(header, 26)
    const extraBytes = u16(header, 28)
    const dataOffset = entry.localOffset + LOCAL_BYTES + nameBytes + extraBytes
    if (dataOffset + entry.compressedSize > this.fileSize) {
      throw new ZipError('ARCHIVE_DAMAGED', 'the entry data lies outside the archive')
    }
    const raw = Buffer.alloc(entry.compressedSize)
    if (entry.compressedSize > 0) await readExact(this.handle, raw, entry.compressedSize, dataOffset)
    let bytes
    if (entry.compression === 0) {
      bytes = raw
    } else {
      try {
        bytes = await inflate(raw, { maxOutputLength: Math.max(1, maxBytes) })
      } catch (error) {
        if (error?.code === 'ERR_BUFFER_TOO_LARGE') {
          throw new ZipError('ENTRY_TOO_LARGE', 'the entry expands past the import limit')
        }
        throw new ZipError('ARCHIVE_DAMAGED', 'the entry cannot be decompressed')
      }
    }
    if (bytes.length !== entry.size) {
      throw new ZipError('ARCHIVE_DAMAGED', 'the entry size does not match its directory record')
    }
    if (crc32(bytes) !== entry.crc) {
      throw new ZipError('ARCHIVE_DAMAGED', 'the entry checksum does not match')
    }
    return bytes
  }

  /** Close the file handle; later reads fail with `ARCHIVE_CLOSED`. */
  async close() {
    if (this.closed) return
    this.closed = true
    await this.handle.close().catch(() => {})
  }
}
