/**
 * Markdown renderer for chat answers.
 *
 * It is deliberately small and safe: the parser produces a plain block tree,
 * every string reaches the DOM as a React child (never as HTML), and the three
 * heavyweight pieces live in their own modules:
 * - `highlightCode` (31-highlight.js) tokenizes fenced code,
 * - `LatexInline` / `LatexBlock` (32-math.js) render TeX,
 * - `MermaidDiagram` (33-mermaid.js) draws diagrams.
 *
 * Streaming is handled by keeping block identity stable: a completed block
 * renders the same element on every chunk, so React.memo can skip it while only
 * the growing tail is re-rendered.
 */

/** Zero-width sentinel that carries a citation number inside the answer text. */
const CITATION_MARK = '\u0000dsc-cite:'

function citationMark(index) {
  return `${CITATION_MARK}${index}\u0000`
}

/**
 * Math is extracted before the Markdown pass and carried in these zero-width
 * tokens. The payload is percent-encoded, so a token can never contain a
 * backtick, `$`, `*`, `_`, `|` or a newline and therefore cannot be mistaken
 * for another block or inline construct. Tokens are self-contained: the text
 * can be re-parsed on its own (block quotes do this) without a side table.
 */
const MATH_TOKEN_PREFIX = '\u0000dsc-math:'
const MATH_TOKEN_SOURCE = '\\u0000dsc-math:[bi]:[^\\u0000]*\\u0000'
const MATH_TOKEN_RE = /^\u0000dsc-math:([bi]):([^\u0000]*)\u0000$/
const CODE_TOKEN_PREFIX = '\u0000dsc-'
const CODE_TOKEN_SOURCE = '\\u0000dsc-(?:code|literal):[^\\u0000]*\\u0000'
const CODE_TOKEN_RE = /^\u0000dsc-(code|literal):([^\u0000]*)\u0000$/
const MATH_DISPLAY_MAX_SOURCE = 20000
const MATH_INLINE_PAREN_MAX = 2000

const INLINE_PATTERN = new RegExp([
  MATH_TOKEN_SOURCE, // math extracted by prepareMath()
  CODE_TOKEN_SOURCE, // code span extracted by prepareMath()
  '`[^`\\n]+`', // inline code that prepareMath() left alone
  '\\*\\*[^*\\n]+\\*\\*', // bold
  '__[^_\\n]+__',
  '\\*[^*\\n]+\\*', // italic
  '_[^_\\n]+_',
  '~~[^~\\n]+~~', // strikethrough
  '!\\[[^\\]\\n]*\\]\\([^)\\s]+\\)', // image
  '\\[[^\\]\\n]+\\]\\([^)\\s]+\\)', // link
  '\\$\\$[^$\\n\\u0000]+\\$\\$', // display math kept inline by a sloppy model
  '\\$[^$\\n\\u0000]+\\$', // inline math that prepareMath() left alone
  '\\\\\\([^\\u0000]{1,300}?\\\\\\)', // \( \) inline math that prepareMath() left alone
  '\\u0000dsc-cite:\\d+\\u0000', // citation marker
  'https?:\\/\\/[^\\s<>()]+', // bare URL
].join('|'), 'g')

const CITE_TOKEN = /^\u0000dsc-cite:(\d+)\u0000$/

function encodeTokenText(value) {
  const text = typeof value === 'string' ? value : String(value ?? '')
  // toWellFormed() keeps encodeURIComponent from throwing on a lone surrogate
  // that can still arrive in streamed model output.
  const safe = typeof text.toWellFormed === 'function'
    ? text.toWellFormed()
    : text.replace(/[\uD800-\uDFFF]/g, '\uFFFD')
  return encodeURIComponent(safe).replace(/[^A-Za-z0-9%]/g, char => (
    `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`
  ))
}

function mathToken(display, tex) {
  return `${MATH_TOKEN_PREFIX}${display ? 'b' : 'i'}:${encodeTokenText(tex)}\u0000`
}

function codeToken(kind, text) {
  return `${CODE_TOKEN_PREFIX}${kind}:${encodeTokenText(text)}\u0000`
}

function decodeMathToken(token) {
  const match = typeof token === 'string' ? MATH_TOKEN_RE.exec(token) : null
  if (match === null) return null
  try {
    return { display: match[1] === 'b', tex: decodeURIComponent(match[2]) }
  } catch {
    return null
  }
}

function decodeCodeToken(token) {
  const match = typeof token === 'string' ? CODE_TOKEN_RE.exec(token) : null
  if (match === null) return null
  try {
    return { kind: match[1], text: decodeURIComponent(match[2]) }
  } catch {
    return null
  }
}

/** Recover human-readable source for places that only accept plain text (alt). */
function restoreInlineSource(value) {
  if (typeof value !== 'string' || !value.includes('\u0000')) return value
  return value.replace(
    /\u0000dsc-math:([bi]):([^\u0000]*)\u0000|\u0000dsc-(code|literal):([^\u0000]*)\u0000/g,
    (token, mathKind, mathBody, codeKind, codeBody) => {
      try {
        if (mathKind !== undefined) {
          const tex = decodeURIComponent(mathBody)
          return mathKind === 'b' ? `$$ ${tex} $$` : `$${tex}$`
        }
        return decodeURIComponent(codeBody)
      } catch {
        return token
      }
    },
  )
}

/** Mark inline code spans and whole fenced blocks so math never sees them. */
function findInlineCodeRanges(line, offset, ranges) {
  let index = 0
  while (index < line.length) {
    if (line[index] === '\\') {
      index += 2
      continue
    }
    if (line[index] !== '`') {
      index += 1
      continue
    }
    let run = 1
    while (line[index + run] === '`') run += 1
    let search = index + run
    let close = -1
    while (search < line.length) {
      if (line[search] === '`') {
        let count = 1
        while (line[search + count] === '`') count += 1
        if (count === run) {
          close = search
          break
        }
        search += count
      } else {
        search += 1
      }
    }
    if (close < 0) {
      // A code span that is still streaming open cannot become a <code> node,
      // but its markers must stay literal instead of exposing `$` to math.
      ranges.push({
        kind: 'literal',
        start: offset + index,
        end: offset + line.length,
        contentStart: offset + index,
        contentEnd: offset + line.length,
      })
      break
    }
    ranges.push({
      kind: 'code',
      start: offset + index,
      end: offset + close + run,
      contentStart: offset + index + run,
      contentEnd: offset + close,
    })
    index = close + run
  }
}

function findProtectedRanges(source) {
  const ranges = []
  let lineStart = 0
  let fence = null
  while (lineStart <= source.length) {
    const newline = source.indexOf('\n', lineStart)
    const lineEnd = newline === -1 ? source.length : newline
    const line = source.slice(lineStart, lineEnd)
    if (fence !== null) {
      const close = line.match(/^\s*(`{3,}|~{3,})\s*$/)
      if (close !== null && close[1][0] === fence.char && close[1].length >= fence.length) {
        ranges.push({ kind: 'fence', start: fence.start, end: lineEnd })
        fence = null
      }
    } else {
      const open = line.match(/^\s*(`{3,}|~{3,})/)
      if (open !== null) {
        fence = { char: open[1][0], length: open[1].length, start: lineStart }
      } else {
        findInlineCodeRanges(line, lineStart, ranges)
      }
    }
    if (newline === -1) break
    lineStart = newline + 1
  }
  if (fence !== null) ranges.push({ kind: 'fence', start: fence.start, end: source.length })
  return ranges
}

function mathLineStart(source, index) {
  return source.lastIndexOf('\n', index - 1) + 1
}

function mathLineEnd(source, index) {
  const newline = source.indexOf('\n', index)
  return newline === -1 ? source.length : newline
}

/** Find a complete display run; block rules only apply when it spans lines. */
function readDisplayMath(source, start, open, close, protectedMask) {
  const contentStart = start + open.length
  const limit = Math.min(source.length, contentStart + MATH_DISPLAY_MAX_SOURCE)
  let index = contentStart
  let found = -1
  while (index < limit) {
    if (protectedMask[index] === 1) return null
    if (source.startsWith(close, index)) {
      found = index
      break
    }
    if (source[index] === '\\') {
      index += 2
      continue
    }
    index += 1
  }
  if (found < 0) return null
  const tex = source.slice(contentStart, found).trim()
  if (tex === '') return null
  if (tex.includes('\n')) {
    // A multi-line display formula must own its lines. Without this rule an
    // unclosed "$$" in streamed prose would swallow the rest of the answer.
    const before = source.slice(mathLineStart(source, start), start)
    const closeEnd = found + close.length
    const after = source.slice(closeEnd, mathLineEnd(source, closeEnd))
    if (!/^[ \t]*$/.test(before) || !/^[ \t]*$/.test(after)) return null
  }
  return { tex, end: found + close.length }
}

function readInlineDollar(source, start, protectedMask) {
  const limit = mathLineEnd(source, start)
  let index = start + 1
  while (index < limit) {
    if (protectedMask[index] === 1) return null
    if (source[index] === '\\') {
      index += 2
      continue
    }
    if (source[index] === '$') {
      if (source[index + 1] === '$') return null
      const token = source.slice(start, index + 1)
      if (!looksLikeInlineMath(token, source, start)) return null
      const tex = source.slice(start + 1, index)
      return tex === '' ? null : { tex, end: index + 1 }
    }
    index += 1
  }
  return null
}

function readInlineParen(source, start, protectedMask) {
  const contentStart = start + 2
  const limit = Math.min(source.length, contentStart + MATH_INLINE_PAREN_MAX)
  let index = contentStart
  while (index < limit) {
    if (protectedMask[index] === 1) return null
    if (source[index] === '\\' && source[index + 1] === ')') {
      const tex = source.slice(contentStart, index)
      return tex === '' ? null : { tex, end: index + 2 }
    }
    index += 1
  }
  return null
}

/**
 * Pipeline step zero: replace code spans with inert tokens and pull complete
 * math runs out of the source. Fenced blocks stay in the text for the block
 * parser, but their contents are masked from math. Display math is tried
 * before inline math at the same position, so `$$...$$` can never be read as
 * two `$...$`. Unclosed runs stay literal, which keeps streaming stable.
 */
function prepareMath(source) {
  if (typeof source !== 'string' || source.length === 0) return source
  if (!source.includes('$') && !source.includes('\\(') && !source.includes('\\[')) return source
  const ranges = findProtectedRanges(source)
  const protectedMask = new Uint8Array(source.length)
  for (const range of ranges) {
    protectedMask.fill(1, range.start, Math.min(range.end, source.length))
  }
  const chunks = []
  let copyFrom = 0
  let index = 0
  let rangeIndex = 0
  while (index < source.length) {
    while (rangeIndex < ranges.length && ranges[rangeIndex].end <= index) rangeIndex += 1
    const range = ranges[rangeIndex]
    if (range !== undefined && range.start <= index) {
      if (range.kind === 'fence') {
        // Leave the fenced block untouched: parseMarkdown() turns it into a
        // code block before any inline renderer runs.
        index = range.end
        rangeIndex += 1
        continue
      }
      // Matched code becomes <code>; an unclosed code span stays literal but
      // can no longer expose its `$` to math.
      chunks.push(
        source.slice(copyFrom, range.start),
        codeToken(range.kind, source.slice(range.contentStart, range.contentEnd)),
      )
      index = range.end
      copyFrom = index
      rangeIndex += 1
      continue
    }
    const char = source[index]
    if (char === '\\') {
      const next = source[index + 1]
      if (next === '(') {
        const found = readInlineParen(source, index, protectedMask)
        if (found !== null) {
          chunks.push(source.slice(copyFrom, index), mathToken(false, found.tex))
          index = found.end
          copyFrom = index
          continue
        }
      } else if (next === '[') {
        const found = readDisplayMath(source, index, '\\[', '\\]', protectedMask)
        if (found !== null) {
          chunks.push(source.slice(copyFrom, index), mathToken(true, found.tex))
          index = found.end
          copyFrom = index
          continue
        }
      }
      index += 2
      continue
    }
    if (char === '$') {
      if (source[index + 1] === '$') {
        const found = readDisplayMath(source, index, '$$', '$$', protectedMask)
        if (found !== null) {
          chunks.push(source.slice(copyFrom, index), mathToken(true, found.tex))
          index = found.end
          copyFrom = index
          continue
        }
        // Skip both dollars of an unclosed display delimiter: treating them as
        // two inline openers would pair an opening with an unrelated closer.
        index += 2
        continue
      }
      const found = readInlineDollar(source, index, protectedMask)
      if (found !== null) {
        chunks.push(source.slice(copyFrom, index), mathToken(false, found.tex))
        index = found.end
        copyFrom = index
        continue
      }
      index += 1
      continue
    }
    index += 1
  }
  if (chunks.length === 0) return source
  chunks.push(source.slice(copyFrom))
  return chunks.join('')
}

/** A paragraph made only of display-math tokens becomes real math blocks. */
function displayTokensToBlocks(value) {
  const trimmed = value.trim()
  if (trimmed === '' || !trimmed.includes(MATH_TOKEN_PREFIX)) return null
  const tokens = trimmed.split(/\s+/)
  if (tokens.length === 0) return null
  const blocks = []
  for (const token of tokens) {
    const parsed = decodeMathToken(token)
    if (parsed === null || !parsed.display) return null
    blocks.push({ type: 'math', text: parsed.tex })
  }
  return blocks
}

function lineMathBlocks(line) {
  return displayTokensToBlocks(line)
}

function paragraphMathBlocks(text) {
  return displayTokensToBlocks(text)
}

function safeHref(value) {
  const url = typeof value === 'string' ? value.trim() : ''
  if (url === '') return null
  try {
    const parsed = new URL(url, 'https://example.invalid')
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return url
  } catch {
    return null
  }
}

/** Unescape the few escapes that matter in prose; math has its own rules. */
function unescapeText(value) {
  return value.replace(/\\([$_*[\]()#%&])/g, '$1')
}

/**
 * Whether a `$...$` candidate is really math.
 *
 * Currency is the reason this exists: `$5 and $10` must stay text. A candidate
 * is math when it is tight (no padding), not a plain number, and either uses a
 * TeX control sequence / operator, or is a short ASCII expression embedded in
 * text (`设 $x$ 为`). Anything containing CJK punctuation or prose fails.
 */
function looksLikeInlineMath(token, source, index) {
  if (token.startsWith('$$')) return true
  const body = token.slice(1, -1)
  if (body === '' || body.length > 300) return false
  if (/^\s|\s$/.test(body)) return false
  if (/^[\d.,]+$/.test(body)) return false
  const before = index > 0 ? source[index - 1] : ''
  const after = source[index + token.length] ?? ''
  if (before === '\\') return false
  if (after !== '' && /[\d]/.test(after)) return false
  if (/[A-Za-z0-9]/.test(before)) return false
  if (/[\\^_{}=<>+\-*/!|]/.test(body)) return true
  if (/[α-ωΑ-Ω]/.test(body)) return true
  if (!/^[\sA-Za-z0-9()[\].,:;' ]+$/.test(body)) return false
  return /[A-Za-z]/.test(body)
}

/** Inline rendering: strong/em/code/link/math/citation in one pass. */
function renderInline(text, keyPrefix = 'i', context = {}) {
  const source = typeof text === 'string' ? text : String(text ?? '')
  const nodes = []
  let last = 0
  let match
  // Each recursive call owns its matcher: a shared global regex would have its
  // lastIndex reset by the nested call and re-match the same token forever.
  const pattern = new RegExp(INLINE_PATTERN.source, 'g')
  while ((match = pattern.exec(source)) !== null) {
    if (match.index > last) nodes.push(unescapeText(source.slice(last, match.index)))
    const token = match[0]
    const key = `${keyPrefix}-${match.index}`
    const math = decodeMathToken(token)
    const code = decodeCodeToken(token)
    const citation = token.match(CITE_TOKEN)
    if (math !== null) {
      if (math.display) {
        // A display formula that started and ended inside a paragraph still
        // gets block styling, while a span keeps the surrounding <p> valid.
        nodes.push(h('span', { key, className: 'dsc-math dsc-math-block' }, latexToNodes(math.tex, { display: true })))
      } else {
        nodes.push(h(LatexInline, { key, tex: math.tex }))
      }
    } else if (code !== null) {
      if (code.kind === 'code') nodes.push(h('code', { className: 'dsc-inline-code', key }, code.text))
      else nodes.push(code.text)
    } else if (citation !== null) {
      const index = Number(citation[1])
      const sourceEntry = context.sources?.[index - 1]
      const href = sourceEntry === undefined ? null : safeHref(sourceEntry.url)
      if (href !== null) {
        nodes.push(h('a', {
          key,
          className: 'dsc-cite',
          href,
          target: '_blank',
          rel: 'noreferrer noopener',
          'data-dsc-cite': index,
          title: tr('citationOpen', { index }),
        }, String(index)))
      }
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(h('code', { className: 'dsc-inline-code', key }, token.slice(1, -1)))
    } else if (token.startsWith('\\(')) {
      nodes.push(h(LatexInline, { key, tex: token.slice(2, -2) }))
    } else if (token.startsWith('$')) {
      if (token.startsWith('$$') && token.endsWith('$$') && token.length > 4) {
        // A display formula written inside a paragraph: a span keeps the
        // document valid while the block styles still lay it out on its own.
        nodes.push(h('span', { key, className: 'dsc-math dsc-math-block' }, latexToNodes(token.slice(2, -2), { display: true })))
      } else if (looksLikeInlineMath(token, source, match.index)) {
        nodes.push(h(LatexInline, { key, tex: token.slice(1, -1) }))
      } else {
        nodes.push(token)
      }
    } else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      nodes.push(h('strong', { key }, renderInline(token.slice(2, -2), key, context)))
    } else if ((token.startsWith('*') && token.endsWith('*') && token.length > 2) || (token.startsWith('_') && token.endsWith('_') && token.length > 2)) {
      nodes.push(h('em', { key }, renderInline(token.slice(1, -1), key, context)))
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      nodes.push(h('del', { key }, renderInline(token.slice(2, -2), key, context)))
    } else if (token.startsWith('![')) {
      const image = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
      const src = image ? safeHref(image[2]) : null
      if (image && src !== null) {
        nodes.push(h('img', {
          key,
          className: 'dsc-image',
          src,
          alt: restoreInlineSource(image[1]),
          loading: 'lazy',
          referrerPolicy: 'no-referrer',
        }))
      } else {
        nodes.push(token)
      }
    } else if (token.startsWith('[')) {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      const href = link ? safeHref(link[2]) : null
      if (link && href !== null) {
        nodes.push(h('a', {
          key, href, target: '_blank', rel: 'noreferrer noopener', className: 'dsc-link',
        }, renderInline(link[1], key, context)))
      } else {
        nodes.push(token)
      }
    } else {
      const bare = token.match(/^(https?:\/\/[^\s]+?)([.,;:!?)]*)$/)
      const url = bare ? bare[1] : token
      const tail = bare ? bare[2] : ''
      const href = safeHref(url)
      if (href !== null) {
        nodes.push(h('a', {
          key, href, target: '_blank', rel: 'noreferrer noopener', className: 'dsc-link',
        }, url))
        if (tail) nodes.push(tail)
      } else {
        nodes.push(token)
      }
    }
    last = match.index + token.length
  }
  if (last < source.length) nodes.push(unescapeText(source.slice(last)))
  return nodes
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line)
}

function splitTableRow(line) {
  let value = line.trim()
  if (value.startsWith('|')) value = value.slice(1)
  if (value.endsWith('|')) value = value.slice(0, -1)
  return value.split('|').map(cell => cell.trim())
}

function isBlockStart(line) {
  return /^\s*(```|~~~)/.test(line)
    || /^\s{0,3}#{1,6}\s+/.test(line)
    || /^\s{0,3}>/.test(line)
    || /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)
    || /^\s*([-*+]|\d+[.)])\s+/.test(line)
    || /^\s*\|.*\|\s*$/.test(line)
    || /^\s*\$\$/.test(line)
}

/** Recognise an opening display-math delimiter. */
function displayMathDelimiter(line) {
  const trimmed = line.trim()
  if (!trimmed.startsWith('$$') && !trimmed.startsWith('\\[')) return null
  if (trimmed.startsWith('$$')) return { open: '$$', close: '$$', rest: trimmed.slice(2) }
  return { open: '\\[', close: '\\]', rest: trimmed.slice(2) }
}

function parseMarkdown(source) {
  const prepared = prepareMath(String(source ?? '').replace(/\r\n?/g, '\n'))
  const lines = prepared.split('\n')
  const blocks = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    if (/^\s*$/.test(line)) {
      index += 1
      continue
    }
    const fence = line.match(/^\s*(```+|~~~+)\s*([^\s`]*)/)
    if (fence !== null) {
      const marker = fence[1]
      const lang = fence[2] ?? ''
      index += 1
      const body = []
      while (index < lines.length && !new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`).test(lines[index])) {
        body.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1
      const text = body.join('\n')
      blocks.push(normalizeCodeLang(lang) === 'mermaid'
        ? { type: 'mermaid', text }
        : { type: 'code', lang, text })
      continue
    }
    const tokenMath = lineMathBlocks(line)
    if (tokenMath !== null) {
      blocks.push(...tokenMath)
      index += 1
      continue
    }
    // Display math: `$$ ... $$` or `\[ ... \]`, on one line or across lines.
    const opening = displayMathDelimiter(line)
    if (opening !== null) {
      const single = opening.rest.trimEnd()
      if (single.endsWith(opening.close)) {
        blocks.push({ type: 'math', text: single.slice(0, -opening.close.length).trim() })
        index += 1
        continue
      }
      const body = opening.rest === '' ? [] : [opening.rest]
      index += 1
      let closed = false
      while (index < lines.length) {
        const current = lines[index]
        const trimmed = current.trim()
        if (trimmed === opening.close) {
          closed = true
          index += 1
          break
        }
        if (trimmed.length > opening.close.length && trimmed.endsWith(opening.close)) {
          const before = trimmed.slice(0, -opening.close.length).trimEnd()
          if (before !== '') body.push(before)
          closed = true
          index += 1
          break
        }
        body.push(current)
        index += 1
      }
      const text = body.join('\n').trim()
      if (!closed) {
        // No closer anywhere below: this is the middle of a streamed display
        // formula. Keep the source literal in a block of the same shape so the
        // switch to the finished formula does not collapse the message. The
        // first body entry is opening.rest and is already part of `line`.
        const tail = opening.rest === '' ? body : body.slice(1)
        blocks.push({ type: 'streaming-math', text: [line, ...tail].join('\n') })
        continue
      }
      if (text !== '') blocks.push({ type: 'math', text })
      continue
    }
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/)
    if (heading !== null) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] })
      index += 1
      continue
    }
    if (/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ type: 'hr' })
      index += 1
      continue
    }
    if (/^\s{0,3}>/.test(line)) {
      const body = []
      while (index < lines.length && /^\s{0,3}>/.test(lines[index])) {
        body.push(lines[index].replace(/^\s{0,3}>\s?/, ''))
        index += 1
      }
      blocks.push({ type: 'quote', text: body.join('\n') })
      continue
    }
    const listItem = line.match(/^\s*([-*+]|\d+[.)])\s+(.*)$/)
    if (listItem !== null) {
      const ordered = /^\d/.test(listItem[1])
      const items = []
      while (index < lines.length) {
        const current = lines[index].match(/^\s*([-*+]|\d+[.)])\s+(.*)$/)
        if (current === null || /^\d/.test(current[1]) !== ordered) break
        items.push(current[2])
        index += 1
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }
    if (line.includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const header = splitTableRow(line)
      index += 2
      const rows = []
      while (index < lines.length && lines[index].includes('|') && lines[index].trim() !== '') {
        rows.push(splitTableRow(lines[index]))
        index += 1
      }
      blocks.push({ type: 'table', header, rows })
      continue
    }
    const paragraph = [line]
    index += 1
    while (index < lines.length && lines[index].trim() !== ''
      && lineMathBlocks(lines[index]) === null
      && !isBlockStart(lines[index])) {
      paragraph.push(lines[index])
      index += 1
    }
    const paragraphText = paragraph.join('\n')
    const mathBlocks = paragraphMathBlocks(paragraphText)
    if (mathBlocks !== null) blocks.push(...mathBlocks)
    else blocks.push({ type: 'paragraph', text: paragraphText })
  }
  return blocks
}

/** Token type to CSS class. A static table keeps the class names auditable. */
const TOKEN_CLASS = {
  kw: 'dsc-tok-kw',
  str: 'dsc-tok-str',
  num: 'dsc-tok-num',
  com: 'dsc-tok-com',
  fn: 'dsc-tok-fn',
  type: 'dsc-tok-type',
  op: 'dsc-tok-op',
  attr: 'dsc-tok-attr',
  tag: 'dsc-tok-tag',
  var: 'dsc-tok-var',
  meta: 'dsc-tok-meta',
}

/** Code block with language label, token colouring, copy and internal scroll. */
const CodeBlock = React.memo(function CodeBlock({ lang, text }) {
  const [copied, setCopied] = React.useState(false)
  const canonical = normalizeCodeLang(lang)
  const label = lang.trim() === '' ? 'text' : lang.trim()
  const tokens = React.useMemo(() => highlightCode(text, canonical), [text, canonical])
  return h('div', { className: 'dsc-code' },
    h('div', { className: 'dsc-code-head' },
      h('span', { className: 'dsc-code-lang' }, label),
      h('button', {
        type: 'button',
        className: 'dsc-code-copy',
        title: tr('copy'),
        'aria-label': tr('copy'),
        onClick: () => {
          copyToClipboard(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          }).catch(() => chatStore.toast(tr('copyFailed'), 'error'))
        },
      }, h(Icon, { name: copied ? 'check' : 'copy', size: 14 }), h('span', null, copied ? tr('copied') : tr('copy'))),
    ),
    h('pre', { className: 'dsc-pre' },
      h('code', { className: 'dsc-code-body' }, tokens.map((token, tokenIndex) => {
        const tokenClass = TOKEN_CLASS[token.type]
        return tokenClass === undefined
          ? token.text
          : h('span', { key: tokenIndex, className: tokenClass }, token.text)
      })),
    ),
  )
})

function renderBlocks(blocks, context, keyPrefix = 'b') {
  return blocks.map((block, index) => renderBlock(block, `${keyPrefix}-${index}`, context, index === blocks.length - 1))
}

function renderBlock(block, key, context = {}, isLast = false) {
  if (block.type === 'paragraph') {
    return h('p', { className: 'dsc-paragraph', key }, renderInline(block.text, key, context))
  }
  if (block.type === 'heading') {
    const tag = `h${Math.min(6, Math.max(1, block.level))}`
    return h(tag, { className: 'dsc-heading', key }, renderInline(block.text, key, context))
  }
  if (block.type === 'math') {
    return h(LatexBlock, { key, tex: block.text })
  }
  if (block.type === 'streaming-math') {
    // An incomplete display delimiter is literal until its closer arrives.
    // The same block wrapper and minimum height are used for the finished
    // formula so the streaming swap does not move the whole message.
    return h('div', { className: 'dsc-math dsc-math-block dsc-math-streaming', key },
      h('span', { className: 'dsc-math-fallback' }, block.text))
  }
  if (block.type === 'mermaid') {
    // While the answer is still streaming the diagram is drawn from partial
    // text and would re-layout on every chunk; show the source instead and
    // draw once the block is settled.
    if (context.streaming && isLast) {
      return h('div', { className: 'dsc-diagram is-streaming', key },
        h(CodeBlock, { lang: 'mermaid', text: block.text }),
        h('span', { className: 'dsc-diagram-note' }, tr('streamingDiagram')),
      )
    }
    return h(MermaidDiagram, { key, source: block.text })
  }
  if (block.type === 'code') {
    return h(CodeBlock, { key, lang: block.lang, text: block.text })
  }
  if (block.type === 'quote') {
    const inner = parseMarkdown(block.text)
    return h('blockquote', { className: 'dsc-quote', key },
      inner.length === 0
        ? renderInline(block.text, key, context)
        : renderBlocks(inner, context, `${key}-q`))
  }
  if (block.type === 'hr') {
    return h('hr', { className: 'dsc-hr', key })
  }
  if (block.type === 'list') {
    const tag = block.ordered ? 'ol' : 'ul'
    return h(tag, { className: 'dsc-list', key }, block.items.map((item, itemIndex) => (
      h('li', { key: `${key}-${itemIndex}` }, renderInline(item, `${key}-${itemIndex}`, context))
    )))
  }
  if (block.type === 'table') {
    return h('div', { className: 'dsc-table-wrap', key }, h('table', { className: 'dsc-table' },
      h('thead', null, h('tr', null, block.header.map((cell, cellIndex) => h('th', { key: cellIndex }, renderInline(cell, `${key}-h-${cellIndex}`, context))))),
      h('tbody', null, block.rows.map((row, rowIndex) => h('tr', { key: rowIndex }, row.map((cell, cellIndex) => (
        h('td', { key: cellIndex }, renderInline(cell, `${key}-${rowIndex}-${cellIndex}`, context))
      ))))),
    ))
  }
  return null
}

function Markdown({ text, className = '', streaming = false, sources = [] }) {
  const context = React.useMemo(() => ({ streaming, sources }), [streaming, sources])
  const blocks = React.useMemo(() => parseMarkdown(text), [text])
  return h('div', { className: `dsc-md ${className}`.trim() },
    renderBlocks(blocks, context),
    streaming ? h('span', { className: 'dsc-caret', 'aria-hidden': 'true' }) : null,
  )
}
