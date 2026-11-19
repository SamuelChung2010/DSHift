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

const INLINE_PATTERN = new RegExp([
  '`[^`\\n]+`', // inline code
  '\\*\\*[^*\\n]+\\*\\*', // bold
  '__[^_\\n]+__',
  '\\*[^*\\n]+\\*', // italic
  '_[^_\\n]+_',
  '~~[^~\\n]+~~', // strikethrough
  '!\\[[^\\]\\n]*\\]\\([^)\\s]+\\)', // image
  '\\[[^\\]\\n]+\\]\\([^)\\s]+\\)', // link
  '\\$\\$[^$\\n]+\\$\\$', // display math kept inline by a sloppy model
  '\\$[^$\\n]+\\$', // inline math
  '\\\\\\([\\s\\S]{1,300}?\\\\\\)', // \( \) inline math
  '\\u0000dsc-cite:\\d+\\u0000', // citation marker
  'https?:\\/\\/[^\\s<>()]+', // bare URL
].join('|'), 'g')

const CITE_TOKEN = /^\u0000dsc-cite:(\d+)\u0000$/

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
    const citation = token.match(CITE_TOKEN)
    if (citation !== null) {
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
          alt: image[1],
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
  const lines = String(source ?? '').replace(/\r\n?/g, '\n').split('\n')
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
        // No closer anywhere below: this was not display math after all (a
        // stray "$$" in prose must not swallow the rest of the answer).
        blocks.push({ type: 'paragraph', text: [line, ...body].join('\n') })
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
    while (index < lines.length && lines[index].trim() !== '' && !isBlockStart(lines[index])) {
      paragraph.push(lines[index])
      index += 1
    }
    blocks.push({ type: 'paragraph', text: paragraph.join('\n') })
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
