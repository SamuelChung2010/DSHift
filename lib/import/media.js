/**
 * Local byte storage for images recovered from an imported chat export.
 *
 * DeepSeek's export carries the image bytes next to each conversation, but the
 * original files live on DeepSeek's file service, which this plugin does not
 * re-upload to (an import must not cost API usage). The bytes are therefore kept
 * in the plugin's own data directory under a content address: the same image is
 * written once no matter how often it is referenced or how many exports include
 * it, and a re-import reuses the existing file.
 *
 * A stored name is `{sha256}.{ext}` and is validated before it is turned into a
 * path, so a request for a media handle can never reach another file.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'

/** Extensions this store accepts; they are all safe to serve as an image. */
const CONTENT_TYPES = new Map([
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['webp', 'image/webp'],
  ['gif', 'image/gif'],
  ['bmp', 'image/bmp'],
  ['avif', 'image/avif'],
  ['svg', 'image/svg+xml'],
])

const MEDIA_NAME = /^([a-f0-9]{64})\.([a-z0-9]{2,5})$/u

const SUPPORTED_EXTENSIONS = new Set(CONTENT_TYPES.keys())

/** Whether one extension can be stored and served. */
export function isSupportedMediaExtension(extension) {
  return SUPPORTED_EXTENSIONS.has(extension)
}

/** Whether one stored media handle is well formed. */
export function isMediaName(value) {
  return typeof value === 'string' && MEDIA_NAME.test(value)
}

export class ImportMediaStore {
  /** @param directory - directory holding the content-addressed files. */
  constructor(directory) {
    this.directory = directory
  }

  /**
   * Store one image.
   * @param bytes - image data.
   * @param extension - lower-case extension without the dot.
   * @returns `{ media, size }`, or undefined when the type is not served.
   */
  async save(bytes, extension) {
    if (!isSupportedMediaExtension(extension)) return undefined
    const digest = createHash('sha256').update(bytes).digest('hex')
    const media = `${digest}.${extension}`
    const target = path.join(this.directory, media)
    try {
      await fs.access(target)
      return { media, size: bytes.length }
    } catch {
      // Not stored yet.
    }
    await fs.mkdir(this.directory, { recursive: true })
    const temporary = `${target}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`
    await fs.writeFile(temporary, bytes)
    try {
      await fs.rename(temporary, target)
    } catch (error) {
      await fs.rm(temporary, { force: true }).catch(() => {})
      // A concurrent import may have written the same address first; reusing it
      // is the point of a content address, so only a missing file is an error.
      if (error?.code !== 'EEXIST' && error?.code !== 'EPERM' && error?.code !== 'EACCES') throw error
    }
    return { media, size: bytes.length }
  }

  /**
   * Resolve one stored media handle.
   * @param media - validated name, `{sha256}.{ext}`.
   * @returns the absolute path and content type, or undefined for an invalid or missing file.
   */
  async resolve(media) {
    if (!isMediaName(media)) return undefined
    const extension = media.slice(media.indexOf('.') + 1)
    const contentType = CONTENT_TYPES.get(extension)
    if (contentType === undefined) return undefined
    const target = path.join(this.directory, media)
    try {
      const info = await fs.stat(target)
      if (!info.isFile()) return undefined
      return { path: target, contentType, size: info.size }
    } catch {
      return undefined
    }
  }
}
