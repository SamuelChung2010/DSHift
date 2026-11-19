const INLINE_PATTERN = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|\[[^\]\n]+\]\([^)\s]+\)|https?:\/\/[^\s<>()]+)/g

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

function renderInline(text, keyPrefix = 'i') {
  const source = typeof text === 'string' ? text : String(text ?? '')
  const nodes = []
  let last = 0
  let match
  // Each recursive call owns its matcher: a shared global regex would have its
  // lastIndex reset by the nested call and re-match the same token forever.
  const pattern = new RegExp(INLINE_PATTERN.source, 'g')
  while ((match = pattern.exec(source)) !== null) {
    if (match.index > last) nodes.push(source.slice(last, match.index))
    const token = match[0]
    const key = `${keyPrefix}-${match.index}`
    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(h('code', { className: 'dsc-inline-code', key }, token.slice(1, -1)))
    } else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      nodes.push(h('strong', { key }, renderInline(token.slice(2, -2), key)))
    } else if ((token.startsWith('*') && token.endsWith('*') && token.length > 2) || (token.startsWith('_') && token.endsWith('_') && token.length > 2)) {
      nodes.push(h('em', { key }, renderInline(token.slice(1, -1), key)))
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      nodes.push(h('del', { key }, renderInline(token.slice(2, -2), key)))
    } else if (token.startsWith('[')) {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      const href = link ? safeHref(link[2]) : null
      if (link && href !== null) {
        nodes.push(h('a', {
          key, href, target: '_blank', rel: 'noreferrer noopener', className: 'dsc-link',
        }, renderInline(link[1], key)))
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
  if (last < source.length) nodes.push(source.slice(last))
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
      blocks.push({ type: 'code', lang, text: body.join('\n') })
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

function copyText(text) {
  if (globalThis.navigator?.clipboard?.writeText) {
    return globalThis.navigator.clipboard.writeText(text)
  }
  return Promise.reject(new Error('clipboard unavailable'))
}

function CodeBlock({ lang, text }) {
  const [copied, setCopied] = React.useState(false)
  return h('div', { className: 'dsc-code' },
    h('div', { className: 'dsc-code-head' },
      h('span', { className: 'dsc-code-lang' }, lang || 'text'),
      h('button', {
        type: 'button',
        className: 'dsc-code-copy',
        onClick: () => {
          copyText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          }).catch(() => {})
        },
      }, h(Icon, { name: copied ? 'check' : 'copy', size: 14 }), h('span', null, copied ? tr('copied') : tr('copy'))),
    ),
    h('pre', { className: 'dsc-pre' }, h('code', null, text)),
  )
}

function renderBlock(block, index) {
  const key = `b-${index}`
  if (block.type === 'paragraph') {
    return h('p', { className: 'dsc-paragraph', key }, renderInline(block.text, key))
  }
  if (block.type === 'heading') {
    const tag = `h${Math.min(6, Math.max(1, block.level))}`
    return h(tag, { className: 'dsc-heading', key }, renderInline(block.text, key))
  }
  if (block.type === 'code') {
    return h(CodeBlock, { key, lang: block.lang, text: block.text })
  }
  if (block.type === 'quote') {
    return h('blockquote', { className: 'dsc-quote', key }, renderInline(block.text, key))
  }
  if (block.type === 'hr') {
    return h('hr', { className: 'dsc-hr', key })
  }
  if (block.type === 'list') {
    const tag = block.ordered ? 'ol' : 'ul'
    return h(tag, { className: 'dsc-list', key }, block.items.map((item, itemIndex) => (
      h('li', { key: `${key}-${itemIndex}` }, renderInline(item, `${key}-${itemIndex}`))
    )))
  }
  if (block.type === 'table') {
    return h('div', { className: 'dsc-table-wrap', key }, h('table', { className: 'dsc-table' },
      h('thead', null, h('tr', null, block.header.map((cell, cellIndex) => h('th', { key: cellIndex }, renderInline(cell, `${key}-h-${cellIndex}`))))),
      h('tbody', null, block.rows.map((row, rowIndex) => h('tr', { key: rowIndex }, row.map((cell, cellIndex) => (
        h('td', { key: cellIndex }, renderInline(cell, `${key}-${rowIndex}-${cellIndex}`))
      ))))),
    ))
  }
  return null
}

function Markdown({ text, className = '', streaming = false }) {
  const blocks = React.useMemo(() => parseMarkdown(text), [text])
  return h('div', { className: `dsc-md ${streaming ? 'dsc-md-streaming' : ''} ${className}`.trim() },
    blocks.map(renderBlock),
    streaming ? h('span', { className: 'dsc-caret', 'aria-hidden': 'true' }) : null,
  )
}
