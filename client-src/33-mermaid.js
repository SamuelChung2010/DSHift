/* Dependency-free Mermaid renderer.
 *
 * parseMermaid(source)  -> plain model data (flowchart / sequence / pie / class)
 * mermaidLayout(source) -> pure geometry { width, height, nodes, edges, texts, ... }
 * MermaidDiagram(...)   -> React elements (inline SVG, no raw HTML, no eval)
 *
 * Everything is linear-time over the source, capped, and safe for untrusted text:
 * labels are truncated, numbers are finite, and SVG text is always escaped by React.
 */
const MERMAID_MAX_SOURCE = 200000
const MERMAID_MAX_NODES = 400
const MERMAID_MAX_EDGES = 800
const MERMAID_MAX_PARTICIPANTS = 40
const MERMAID_MAX_MESSAGES = 200
const MERMAID_MAX_SLICES = 12
const MERMAID_MAX_LABEL = 120
const MERMAID_MAX_LINES = 10
const MERMAID_TEXT_WIDTH = 7.2
const MERMAID_DEFAULT_WIDTH = 720
const MERMAID_PAD = 32
const MERMAID_DIRECTIONS = { TD: 'TD', TB: 'TD', BT: 'BT', LR: 'LR', RL: 'RL' }
const MERMAID_FLOW_IGNORE = /^(?:classDef|class|style|linkStyle|click|link|direction|accTitle|accDescr)\b/i
const MERMAID_CLASS_IGNORE = /^(?:direction|note|hide|show|style|cssClass|click|title|accTitle|accDescr)\b/i
const MERMAID_CLASS_RELATION = /^\s*([A-Za-z_][\w.]*)\s*(?:"[^"]*"\s*)?(<\|--|--\|>|<\|\.\.|\.\.\|>|<--|-->|<\.\.|\.\.>|\*--|--\*|o--|--o|--|\.\.)\s*([A-Za-z_][\w.]*)\s*(?::\s*([\s\S]*))?$/
const MERMAID_FLOW_SHAPES = [
  ['[[', ']]', 'subroutine'], ['((', '))', 'circle'], ['[(', ')]', 'cylinder'],
  ['[/', '/]', 'parallelogram'], ['[\\', '\\]', 'parallelogram'], ['{{', '}}', 'hexagon'],
  ['>', ']', 'asymmetric'], ['[', ']', 'rect'], ['(', ')', 'rounded'], ['{', '}', 'diamond'],
]

// ---------- small value helpers ----------
function mermaidSafeText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  try {
    return String(value)
  } catch {
    return ''
  }
}
function mermaidNum(value, fallback = 0) {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : fallback
}
function mermaidRound(value, fallback = 0) {
  const number = Math.max(-1e7, Math.min(1e7, mermaidNum(value, fallback)))
  return Math.round(number * 100) / 100
}
function mermaidClamp(value, min, max) {
  const number = mermaidNum(value, min)
  return number < min ? min : (number > max ? max : number)
}
function mermaidClip(value, limit = MERMAID_MAX_LABEL) {
  const text = mermaidSafeText(value).replace(/\s+/g, ' ').trim()
  if (text.length <= limit) return text
  return limit <= 1 ? '\u2026' : `${text.slice(0, limit - 1)}\u2026`
}
function mermaidErrorMessage(error) {
  if (error === null || error === undefined) return 'diagram could not be rendered'
  return mermaidClip(typeof error === 'string' ? error : error.message || error, 200) || 'diagram could not be rendered'
}
function mermaidLimitError(message) {
  const error = new Error(message)
  error.mermaidLimit = true
  return error
}
function mermaidDirection(value) {
  return MERMAID_DIRECTIONS[typeof value === 'string' ? value.toUpperCase() : ''] || 'TD'
}
function mermaidLabelLines(raw) {
  let text = mermaidSafeText(raw).trim()
  if (text.length >= 2 && ((text[0] === '"' && text[text.length - 1] === '"') || (text[0] === "'" && text[text.length - 1] === "'"))) text = text.slice(1, -1).trim()
  const lines = []
  for (const piece of text.split(/<\s*br\s*\/?\s*>/i)) {
    const line = mermaidClip(piece, MERMAID_MAX_LABEL)
    if (line !== '') lines.push(line)
    if (lines.length >= MERMAID_MAX_LINES) break
  }
  return lines.length > 0 ? lines : ['']
}
function mermaidNodeSize(lines, minWidth = 90, maxWidth = 260, baseHeight = 40, lineHeight = 18) {
  let chars = 0
  for (const line of lines) chars = Math.max(chars, line.length)
  return { w: mermaidClamp(mermaidRound(chars * MERMAID_TEXT_WIDTH + 24), minWidth, maxWidth), h: mermaidRound(baseHeight + lineHeight * Math.max(0, lines.length - 1)) }
}
function mermaidWrapText(value, width = 34, maxLines = 4) {
  const words = mermaidClip(value, MERMAID_MAX_LABEL).split(' ').filter(word => word !== '')
  const lines = []
  let current = ''
  for (const word of words) {
    if (current === '') current = word
    else if (current.length + word.length + 1 <= width) current += ` ${word}`
    else {
      lines.push(current)
      current = word
      if (lines.length >= maxLines - 1) break
    }
  }
  if (lines.length < maxLines && current !== '') lines.push(current)
  if (lines.length === 0) lines.push('')
  return lines.map(line => mermaidClip(line, width))
}
// Splits on a separator that is outside brackets and double quotes.
function mermaidSplitTopLevel(text, separator) {
  const parts = []
  let buffer = ''
  let depth = 0
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quoted) { buffer += char; quoted = char !== '"'; continue }
    if (char === '"' && depth > 0) { quoted = true; buffer += char; continue }
    if (char === '[' || char === '(' || char === '{') { depth += 1; buffer += char; continue }
    if (char === ']' || char === ')' || char === '}') { depth = depth > 0 ? depth - 1 : 0; buffer += char; continue }
    if (depth === 0 && char === separator) { parts.push(buffer); buffer = ''; continue }
    buffer += char
  }
  parts.push(buffer)
  return parts
}

// ---------- flowchart parser ----------
// Index-based on purpose: slicing the remainder per character would be quadratic.
function mermaidMatchFlowOp(text, start) {
  const char = text[start]
  const second = text[start + 1]
  if (char === '-') {
    if (second === undefined) return null
    if (second === '>') return { op: '->', style: 'solid', arrow: true }
    if (second === '.') {
      let index = start + 1
      while (text[index] === '.') index += 1
      if (text.startsWith('->', index)) return { op: text.slice(start, index + 2), style: 'dotted', arrow: true }
      if (text[index] === '-' && text[index + 1] !== '>') index += 1
      return { op: text.slice(start, index), style: 'dotted', arrow: false }
    }
    if (second === '-') {
      let index = start + 1
      while (text[index] === '-') index += 1
      if (text[index] === '>') return { op: text.slice(start, index + 1), style: 'solid', arrow: true }
      return { op: text.slice(start, index), style: 'solid', arrow: false }
    }
    return null
  }
  if (char === '.') {
    let index = start + 1
    while (text[index] === '.') index += 1
    if (text.startsWith('->', index)) return { op: text.slice(start, index + 2), style: 'dotted', arrow: true }
    return { op: text.slice(start, index), style: 'dotted', arrow: false }
  }
  if (char === '=') {
    let index = start + 1
    while (text[index] === '=') index += 1
    if (index === start + 1) return null
    if (text[index] === '>') return { op: text.slice(start, index + 1), style: 'thick', arrow: true }
    return { op: text.slice(start, index), style: 'thick', arrow: false }
  }
  return null
}
function mermaidScanFlowStatement(text) {
  const parts = []
  let buffer = ''
  let depth = 0
  let quoted = false
  let index = 0
  while (index < text.length) {
    const char = text[index]
    if (quoted) {
      buffer += char
      if (char === '"') quoted = false
      index += 1
      continue
    }
    if (char === '"' && depth > 0) { quoted = true; buffer += char; index += 1; continue }
    if (char === '[' || char === '(' || char === '{') { depth += 1; buffer += char; index += 1; continue }
    if (char === ']' || char === ')' || char === '}') { if (depth > 0) depth -= 1; buffer += char; index += 1; continue }
    if (depth === 0) {
      const operation = mermaidMatchFlowOp(text, index)
      if (operation !== null) {
        parts.push({ type: 'text', value: buffer }, { type: 'op', value: operation.op, style: operation.style, arrow: operation.arrow })
        buffer = ''
        index += operation.op.length
        continue
      }
    }
    buffer += char
    index += 1
  }
  parts.push({ type: 'text', value: buffer })
  return parts
}
function mermaidParseFlowNode(piece) {
  let value = mermaidSafeText(piece).trim()
  if (value === '') return null
  const classMarker = value.indexOf(':::')
  if (classMarker > 0) value = value.slice(0, classMarker).trim()
  if (value === '') return null
  let id = ''
  let index = 0
  while (index < value.length) {
    const char = value[index]
    if ('"\'[(<{])}>| \t'.includes(char)) break
    id += char
    index += 1
  }
  if (id === '') {
    const fallback = mermaidClip(value, 64)
    return fallback === '' ? null : { id: fallback, shape: 'rect', lines: [fallback], explicit: true }
  }
  const rest = value.slice(index).trim()
  let shape = 'rect'
  let label = ''
  for (const entry of MERMAID_FLOW_SHAPES) {
    if (rest.length < entry[0].length + entry[1].length) continue
    if (!rest.startsWith(entry[0]) || !rest.endsWith(entry[1])) continue
    label = rest.slice(entry[0].length, rest.length - entry[1].length)
    shape = entry[2]
    break
  }
  return { id: mermaidClip(id, 64), shape, lines: mermaidLabelLines(label === '' ? id : label), explicit: label !== '' }
}
function mermaidFlowNode(model, spec, group) {
  const existing = model.nodeIndex.get(spec.id)
  if (existing !== undefined) {
    if (spec.explicit === true && existing.explicit !== true) {
      existing.explicit = true
      existing.shape = spec.shape
      existing.lines = spec.lines
    }
    if (group !== null && existing.group === null) existing.group = group.id
    return existing
  }
  if (model.nodes.length >= MERMAID_MAX_NODES) {
    throw mermaidLimitError(`diagram is too large: more than ${MERMAID_MAX_NODES} flowchart nodes`)
  }
  const node = { id: spec.id, shape: spec.shape, lines: spec.lines, explicit: spec.explicit === true, group: group === null ? null : group.id }
  model.nodeIndex.set(spec.id, node)
  model.nodes.push(node)
  return node
}
function mermaidFlowTargets(piece, model, group) {
  const targets = []
  for (const part of mermaidSplitTopLevel(piece, '&')) {
    const spec = mermaidParseFlowNode(part)
    if (spec !== null) targets.push(mermaidFlowNode(model, spec, group))
  }
  return targets
}
function mermaidApplyFlowStatement(statement, model, group) {
  const parts = mermaidScanFlowStatement(statement)
  if (parts.length === 0 || parts[0].type !== 'text') return
  let sources = mermaidFlowTargets(parts[0].value, model, group)
  let index = 1
  while (index < parts.length) {
    const operation = parts[index]
    const targetPart = parts[index + 1]
    if (operation.type !== 'op') { index += 1; continue }
    if (targetPart === undefined || targetPart.type !== 'text') { index += 1; continue }
    let rawTarget = targetPart.value
    let label = ''
    const pipe = /^\s*\|([^|]*)\|/.exec(rawTarget)
    if (pipe !== null) { label = mermaidClip(pipe[1], MERMAID_MAX_LABEL); rawTarget = rawTarget.slice(pipe[0].length) }
    let effective = operation
    let nextIndex = index + 2
    // A -- label --> B: a bare text between a line and an arrow is the edge label.
    const nextOperation = parts[index + 2]
    const afterNext = parts[index + 3]
    const candidate = rawTarget.trim()
    if (pipe === null && operation.arrow === false && nextOperation !== undefined && nextOperation.type === 'op'
      && nextOperation.arrow === true && afterNext !== undefined && afterNext.type === 'text'
      && candidate !== '' && !/[\[\](){}<>"']/.test(candidate)) {
      label = mermaidClip(candidate, MERMAID_MAX_LABEL)
      rawTarget = afterNext.value
      effective = { style: nextOperation.style === 'solid' ? operation.style : nextOperation.style, arrow: true }
      nextIndex = index + 4
    }
    const targets = mermaidFlowTargets(rawTarget, model, group)
    if (sources.length > 0 && targets.length > 0) {
      if (model.edges.length + sources.length * targets.length > MERMAID_MAX_EDGES) {
        throw mermaidLimitError(`diagram is too large: more than ${MERMAID_MAX_EDGES} flowchart edges`)
      }
      for (const from of sources) {
        for (const to of targets) {
          model.edges.push({ from: from.id, to: to.id, label, dashed: effective.style === 'dotted', thick: effective.style === 'thick', arrow: effective.arrow === true })
        }
      }
    }
    if (targets.length > 0) sources = targets
    index = nextIndex
  }
}
function mermaidFlowGroup(model, declaration) {
  const raw = mermaidSafeText(declaration).trim()
  let id = raw === '' ? `group-${model.groups.length + 1}` : raw
  let title = id
  const match = /^([^\s\[\]{}()"']+)([\s\S]*)$/.exec(raw)
  if (match !== null) {
    id = match[1]
    const rest = match[2].trim()
    if (rest.length >= 2 && rest.startsWith('[') && rest.endsWith(']')) title = rest.slice(1, -1)
    else if (rest !== '') title = rest
  }
  let key = id
  let suffix = 1
  while (model.groupIndex.has(key)) { key = `${id}-${suffix}`; suffix += 1 }
  const group = { id: key, title: mermaidClip(mermaidLabelLines(title).join(' '), 80) || 'group', depth: 0, members: [] }
  model.groupIndex.set(key, group)
  return group
}
function mermaidParseFlowchart(lines, headerIndex, direction, headerTail) {
  const model = { kind: 'flowchart', direction, nodes: [], nodeIndex: new Map(), edges: [], groups: [], groupIndex: new Map() }
  const statements = []
  for (const piece of mermaidSplitTopLevel(headerTail || '', ';')) if (piece.trim() !== '') statements.push(piece)
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.trim() === '' || line.trim().startsWith('%%')) continue
    for (const piece of mermaidSplitTopLevel(line, ';')) if (piece.trim() !== '') statements.push(piece)
  }
  const stack = []
  for (const statement of statements) {
    const line = statement.trim()
    if (line === '') continue
    const groupMatch = /^subgraph\b\s*([\s\S]*)$/i.exec(line)
    if (groupMatch !== null) {
      if (model.groups.length < 60) {
        const group = mermaidFlowGroup(model, groupMatch[1])
        group.depth = stack.length
        model.groups.push(group)
        stack.push(group)
      }
      continue
    }
    if (/^end$/i.test(line)) { stack.pop(); continue }
    if (MERMAID_FLOW_IGNORE.test(line)) continue
    mermaidApplyFlowStatement(line, model, stack.length > 0 ? stack[stack.length - 1] : null)
  }
  if (model.nodes.length === 0) return { kind: 'unknown', error: 'flowchart contains no nodes' }
  for (const node of model.nodes) {
    if (node.group === null) continue
    const group = model.groupIndex.get(node.group)
    if (group !== undefined) group.members.push(node.id)
  }
  return model
}

// ---------- sequence parser ----------
function mermaidSequenceParticipant(model, declaration) {
  const value = mermaidSafeText(declaration).trim()
  if (value === '') return null
  let id = value
  let label = value
  const asMatch = /^([\s\S]*?)\s+as\s+([\s\S]+)$/i.exec(value)
  if (asMatch !== null) { id = asMatch[1].trim(); label = asMatch[2].trim() }
  id = mermaidClip(id, 64)
  if (id === '') return null
  const existing = model.participantIndex.get(id)
  if (existing !== undefined) return existing
  if (model.participants.length >= MERMAID_MAX_PARTICIPANTS) {
    throw mermaidLimitError(`diagram is too large: more than ${MERMAID_MAX_PARTICIPANTS} participants`)
  }
  const lines = mermaidLabelLines(label === '' ? id : label)
  const participant = { id, label: lines.join(' '), lines }
  model.participantIndex.set(id, participant)
  model.participants.push(participant)
  return participant
}
function mermaidSequenceMessage(model, line, order) {
  const colon = line.indexOf(':')
  const head = colon >= 0 ? line.slice(0, colon) : line
  const text = colon >= 0 ? mermaidClip(line.slice(colon + 1), MERMAID_MAX_LABEL) : ''
  const arrowMatch = /-{1,2}(?:>>|>|x|\))/.exec(head)
  if (arrowMatch === null) return null
  const token = arrowMatch[0]
  let from = head.slice(0, arrowMatch.index).trim()
  let to = head.slice(arrowMatch.index + token.length).trim()
  if (from.endsWith('+') || from.endsWith('-') || from.endsWith('!')) from = from.slice(0, -1)
  if (to.startsWith('+') || to.startsWith('-') || to.startsWith('!')) to = to.slice(1)
  from = from.trim()
  to = to.trim()
  if (from === '' || to === '') return null
  mermaidSequenceParticipant(model, from)
  mermaidSequenceParticipant(model, to)
  if (model.messages.length >= MERMAID_MAX_MESSAGES) {
    throw mermaidLimitError(`diagram is too large: more than ${MERMAID_MAX_MESSAGES} messages`)
  }
  return {
    type: 'message', from: mermaidClip(from, 64), to: mermaidClip(to, 64), text,
    dashed: token.startsWith('--'), marker: token.endsWith('x') ? 'cross' : 'chevron', order,
  }
}
function mermaidParseSequence(lines, headerIndex) {
  const model = { kind: 'sequence', title: '', autonumber: false, participants: [], participantIndex: new Map(), messages: [], notes: [], frames: [], items: [] }
  const stack = []
  let order = 0
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (line === '' || line.startsWith('%%')) continue
    if (/^autonumber\b/i.test(line)) { model.autonumber = true; continue }
    if (/^title\b/i.test(line)) { model.title = mermaidClip(line.slice(5), MERMAID_MAX_LABEL); continue }
    const participantMatch = /^(?:participant|actor)\s+([\s\S]+)$/i.exec(line)
    if (participantMatch !== null) { mermaidSequenceParticipant(model, participantMatch[1]); continue }
    const noteMatch = /^note\s+(over|left of|right of)\s+([^:]+):\s*([\s\S]*)$/i.exec(line)
    if (noteMatch !== null) {
      const targets = noteMatch[2].split(',').map(piece => mermaidClip(piece, 64)).filter(target => target !== '')
      if (targets.length === 0) continue
      for (const target of targets) mermaidSequenceParticipant(model, target)
      const note = { type: 'note', position: noteMatch[1].toLowerCase(), targets, text: mermaidClip(noteMatch[3], MERMAID_MAX_LABEL), order }
      model.notes.push(note)
      model.items.push(note)
      order += 1
      continue
    }
    const frameMatch = /^(loop|alt|opt|par|rect|critical|break)\b\s*([\s\S]*)$/i.exec(line)
    if (frameMatch !== null) {
      stack.push({ kind: frameMatch[1].toLowerCase(), label: mermaidClip(frameMatch[2], 80), start: order, dividers: [], depth: stack.length })
      continue
    }
    if (/^else\b/i.test(line)) {
      const frame = stack.length > 0 ? stack[stack.length - 1] : null
      if (frame !== null) frame.dividers.push({ label: mermaidClip(line.slice(4), 80), order })
      continue
    }
    if (/^end$/i.test(line)) {
      const frame = stack.pop()
      if (frame !== undefined) frame.end = order
      if (frame !== undefined && frame.end > frame.start) model.frames.push(frame)
      continue
    }
    const message = mermaidSequenceMessage(model, line, order)
    if (message !== null) { model.messages.push(message); model.items.push(message); order += 1 }
  }
  if (model.participants.length === 0) return { kind: 'unknown', error: 'sequence diagram contains no participants' }
  model.frames.sort((left, right) => left.depth - right.depth)
  return model
}

// ---------- pie parser ----------
function mermaidParsePie(lines, headerIndex, headerTail) {
  const model = { kind: 'pie', title: '', showData: false, slices: [], omitted: 0 }
  const header = mermaidSafeText(headerTail)
  const headerTitle = /title\s+([\s\S]+)$/i.exec(header)
  if (headerTitle !== null) model.title = mermaidClip(headerTitle[1], MERMAID_MAX_LABEL)
  if (/\bshowData\b/i.test(header)) model.showData = true
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (line === '' || line.startsWith('%%')) continue
    if (/^title\b/i.test(line)) { model.title = mermaidClip(line.slice(5), MERMAID_MAX_LABEL); continue }
    if (/^showData\b/i.test(line)) { model.showData = true; continue }
    let match = /^"([^"]*)"\s*:\s*(-?\d+(?:\.\d+)?)\s*$/.exec(line)
    if (match === null) match = /^([^:"]+?)\s*:\s*(-?\d+(?:\.\d+)?)\s*$/.exec(line)
    if (match === null) continue
    const value = Number(match[2])
    if (!Number.isFinite(value) || value <= 0) continue
    if (model.slices.length >= MERMAID_MAX_SLICES) { model.omitted += 1; continue }
    model.slices.push({ label: mermaidClip(match[1], 60) || 'slice', value })
  }
  if (model.slices.length === 0) return { kind: 'unknown', error: 'pie chart contains no positive values' }
  return model
}

// ---------- class diagram parser ----------
function mermaidClassNode(model, rawName) {
  const name = mermaidClip(mermaidSafeText(rawName).replace(/:::\w+$/, ''), 64)
  if (name === '') return null
  const existing = model.nodeIndex.get(name)
  if (existing !== undefined) return existing
  if (model.nodes.length >= MERMAID_MAX_NODES) throw mermaidLimitError(`diagram is too large: more than ${MERMAID_MAX_NODES} classes`)
  const node = { id: name, title: name, members: [], explicit: false }
  model.nodeIndex.set(name, node)
  model.nodes.push(node)
  return node
}
function mermaidClassMember(node, rawText) {
  if (node === null) return
  const text = mermaidClip(mermaidSafeText(rawText).replace(/;$/, ''), MERMAID_MAX_LABEL)
  if (text === '' || node.members.length >= 30) return
  node.members.push(text)
}
function mermaidClassRelation(left, right, token, label) {
  const markerLeft = token.startsWith('<') || token.startsWith('*') || token.startsWith('o')
  const markerRight = token.endsWith('>') || token.endsWith('*') || token.endsWith('o')
  const hollow = token.includes('|')
  const diamond = token.includes('*') || token.includes('o')
  let layoutFrom = left
  let layoutTo = right
  let arrowAt = 'to'
  if (hollow) {
    layoutFrom = markerLeft ? left : right
    layoutTo = markerLeft ? right : left
    arrowAt = 'from'
  } else if (markerLeft) {
    arrowAt = 'from'
  }
  return {
    type: 'class-relation', left, right, layoutFrom, layoutTo, arrowAt,
    marker: markerLeft || markerRight ? (hollow ? 'hollow' : (diamond ? 'diamond' : 'chevron')) : 'none',
    dashed: token.includes('..'), label: mermaidClip(label, MERMAID_MAX_LABEL),
  }
}
function mermaidParseClassDiagram(lines, headerIndex) {
  const model = { kind: 'class', direction: 'TD', nodes: [], nodeIndex: new Map(), edges: [] }
  let body = null
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (line === '' || line.startsWith('%%')) continue
    const directionMatch = /^direction\s+(TD|TB|BT|LR|RL)\s*$/i.exec(line)
    if (directionMatch !== null) { model.direction = mermaidDirection(directionMatch[1]); continue }
    if (body !== null) {
      if (line === '}') { body = null; continue }
      if (line.endsWith('}')) { mermaidClassMember(body, line.slice(0, -1).trim()); body = null; continue }
      mermaidClassMember(body, line)
      continue
    }
    if (MERMAID_CLASS_IGNORE.test(line)) continue
    const classMatch = /^class\s+([^\s{}]+)\s*([\s\S]*)$/i.exec(line)
    if (classMatch !== null) {
      const node = mermaidClassNode(model, classMatch[1])
      if (node !== null) node.explicit = true
      const rest = classMatch[2].trim()
      const openIndex = rest.indexOf('{')
      if (openIndex >= 0) {
        const inner = rest.slice(openIndex + 1)
        const closeIndex = inner.lastIndexOf('}')
        const content = closeIndex >= 0 ? inner.slice(0, closeIndex) : inner
        for (const piece of mermaidSplitTopLevel(content, ';')) mermaidClassMember(node, piece.trim())
        if (closeIndex < 0) body = node
      }
      continue
    }
    const relation = MERMAID_CLASS_RELATION.exec(line)
    if (relation !== null) {
      const left = mermaidClassNode(model, relation[1])
      const right = mermaidClassNode(model, relation[3])
      if (left === null || right === null) continue
      if (model.edges.length >= MERMAID_MAX_EDGES) {
        throw mermaidLimitError(`diagram is too large: more than ${MERMAID_MAX_EDGES} class relations`)
      }
      model.edges.push(mermaidClassRelation(left.id, right.id, relation[2], relation[4] || ''))
      continue
    }
    const memberLine = /^([^\s:]+)\s*:\s*([\s\S]+)$/.exec(line)
    if (memberLine !== null) mermaidClassMember(mermaidClassNode(model, memberLine[1]), memberLine[2])
  }
  if (model.nodes.length === 0) return { kind: 'unknown', error: 'class diagram contains no classes' }
  return model
}

// ---------- parse entry point ----------
function parseMermaid(source) {
  const text = typeof source === 'string' ? source : mermaidSafeText(source)
  if (text.trim() === '') return { kind: 'unknown', error: 'diagram source is empty' }
  if (text.length > MERMAID_MAX_SOURCE) return { kind: 'unknown', error: `diagram source is too large (limit ${MERMAID_MAX_SOURCE} characters)` }
  try {
    const lines = text.replace(/\r\n?/g, '\n').split('\n')
    let headerIndex = -1
    let header = ''
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim()
      if (line === '' || line.startsWith('%%')) continue
      header = line
      headerIndex = index
      break
    }
    if (headerIndex < 0) return { kind: 'unknown', error: 'diagram source contains no content' }
    const keywordMatch = /^([A-Za-z][\w-]*)/.exec(header)
    if (keywordMatch === null) return { kind: 'unknown', error: 'diagram header is not recognized' }
    const keyword = keywordMatch[1].toLowerCase()
    if (keyword === 'flowchart' || keyword === 'graph') {
      const headerMatch = /^(?:flowchart|graph)\s*([A-Za-z]{2})?/.exec(header)
      const direction = mermaidDirection(headerMatch === null ? '' : headerMatch[1])
      return mermaidParseFlowchart(lines, headerIndex, direction, header.slice(headerMatch === null ? keyword.length : headerMatch[0].length))
    }
    if (keyword === 'sequencediagram') return mermaidParseSequence(lines, headerIndex)
    if (keyword === 'pie') return mermaidParsePie(lines, headerIndex, header.slice(3))
    if (keyword === 'classdiagram' || keyword === 'classdiagram-v2') return mermaidParseClassDiagram(lines, headerIndex)
    return { kind: 'unknown', error: `unsupported diagram type: ${keyword}` }
  } catch (error) {
    return { kind: 'unknown', error: mermaidErrorMessage(error) }
  }
}

// ---------- shared layered graph engine ----------
function mermaidRankNodes(nodes, edges, indexById) {
  const count = nodes.length
  const adjacency = Array.from({ length: count }, () => [])
  const indegree = new Array(count).fill(0)
  for (const edge of edges) {
    const from = indexById.get(edge.from)
    const to = indexById.get(edge.to)
    if (from === undefined || to === undefined || from === to) continue
    adjacency[from].push(to)
    indegree[to] += 1
  }
  const order = []
  const queue = []
  for (let index = 0; index < count; index += 1) if (indegree[index] === 0) queue.push(index)
  for (let head = 0; head < queue.length; head += 1) {
    const current = queue[head]
    order.push(current)
    for (const next of adjacency[current]) {
      indegree[next] -= 1
      if (indegree[next] === 0) queue.push(next)
    }
  }
  const ordered = new Set(order)
  for (let index = 0; index < count; index += 1) if (!ordered.has(index)) order.push(index)
  const rank = new Array(count).fill(0)
  for (const current of order) {
    const nextRank = rank[current] + 1
    if (nextRank > count) continue
    for (const next of adjacency[current]) if (rank[next] < nextRank) rank[next] = nextRank
  }
  return rank
}
function mermaidLayeredLayout(nodes, edges, direction, sizes) {
  const count = nodes.length
  const indexById = new Map()
  nodes.forEach((node, index) => indexById.set(node.id, index))
  const rank = mermaidRankNodes(nodes, edges, indexById)
  const usedRanks = []
  const seenRanks = new Set()
  for (const value of rank) if (!seenRanks.has(value)) { seenRanks.add(value); usedRanks.push(value) }
  usedRanks.sort((left, right) => left - right)
  const rankToLayer = new Map()
  usedRanks.forEach((value, index) => rankToLayer.set(value, index))
  const layers = usedRanks.map(() => [])
  nodes.forEach((node, index) => layers[rankToLayer.get(rank[index]) || 0].push(index))
  const horizontal = direction === 'LR' || direction === 'RL'
  const reverse = direction === 'BT' || direction === 'RL'
  const primaryGap = horizontal ? 80 : 58
  const crossGap = horizontal ? 30 : 36
  const dims = nodes.map(node => sizes.get(node.id) || { w: 120, h: 40 })
  const layerPrimary = layers.map(layer => layer.reduce((max, index) => Math.max(max, horizontal ? dims[index].w : dims[index].h), 0))
  const layerCross = layers.map((layer) => {
    let total = 0
    layer.forEach((index, position) => { total += (horizontal ? dims[index].h : dims[index].w) + (position > 0 ? crossGap : 0) })
    return total
  })
  let maxCross = 0
  for (const value of layerCross) maxCross = Math.max(maxCross, value)
  const primaryStarts = []
  let primary = 0
  layers.forEach((layer, layerIndex) => {
    if (layerIndex > 0) primary += primaryGap
    primaryStarts.push(primary)
    primary += layerPrimary[layerIndex]
  })
  const contentPrimary = primary
  const positionInLayer = new Array(count).fill(0)
  const crossOffsets = layers.map((layer, layerIndex) => {
    let offset = (maxCross - layerCross[layerIndex]) / 2
    return layer.map((index) => {
      positionInLayer[index] = layer.indexOf(index)
      const current = offset
      offset += (horizontal ? dims[index].h : dims[index].w) + crossGap
      return current
    })
  })
  const placed = nodes.map((node, index) => {
    const dim = dims[index]
    const cross = crossOffsets[rankToLayer.get(rank[index]) || 0][positionInLayer[index]]
    const start = primaryStarts[rankToLayer.get(rank[index]) || 0]
    let x = horizontal ? start : cross
    let y = horizontal ? cross : start
    if (reverse) {
      if (horizontal) x = contentPrimary - start - dim.w
      else y = contentPrimary - start - dim.h
    }
    return {
      id: node.id, shape: node.shape, lines: node.lines, title: node.title, members: node.members, group: node.group,
      explicit: node.explicit, x: mermaidRound(x), y: mermaidRound(y), w: dim.w, h: dim.h,
    }
  })
  return { nodes: placed, contentW: horizontal ? contentPrimary : maxCross, contentH: horizontal ? maxCross : contentPrimary }
}

// ---------- edge / marker geometry ----------
function mermaidHeadPath(kind, x, y, dx, dy) {
  const length = Math.hypot(dx, dy)
  if (!Number.isFinite(length) || length < 0.001) return null
  const ux = dx / length
  const uy = dy / length
  const r = mermaidRound
  if (kind === 'cross') {
    return `M ${r(x - 5)} ${r(y - 5)} L ${r(x + 5)} ${r(y + 5)} M ${r(x + 5)} ${r(y - 5)} L ${r(x - 5)} ${r(y + 5)}`
  }
  if (kind === 'hollow' || kind === 'diamond') {
    const size = 11
    const half = size * (kind === 'hollow' ? 0.62 : 0.42)
    const normalX = -uy * half
    const normalY = ux * half
    if (kind === 'hollow') {
      const baseX = x - ux * size
      const baseY = y - uy * size
      return `M ${r(x)} ${r(y)} L ${r(baseX + normalX)} ${r(baseY + normalY)} L ${r(baseX - normalX)} ${r(baseY - normalY)} Z`
    }
    const midX = x - ux * size * 0.5
    const midY = y - uy * size * 0.5
    const baseX = x - ux * size
    const baseY = y - uy * size
    return `M ${r(x)} ${r(y)} L ${r(midX + normalX)} ${r(midY + normalY)} L ${r(baseX)} ${r(baseY)} L ${r(midX - normalX)} ${r(midY - normalY)} Z`
  }
  const size = 8
  const half = size * 0.62
  const baseX = x - ux * size
  const baseY = y - uy * size
  const normalX = -uy * half
  const normalY = ux * half
  return `M ${r(baseX + normalX)} ${r(baseY + normalY)} L ${r(x)} ${r(y)} L ${r(baseX - normalX)} ${r(baseY - normalY)}`
}
// Marker colours are owned by the stylesheet. A static table keeps the class
// names visible to tools/check-classes.js instead of building them from a
// string prefix.
const MERMAID_MARKER_CLASS = {
  hollow: 'dsc-mermaid-edge-hollow',
  diamond: 'dsc-mermaid-edge-diamond',
  cross: 'dsc-mermaid-edge-cross',
}

function mermaidMarker(kind, x, y, dx, dy) {
  if (kind === 'none') return null
  const d = mermaidHeadPath(kind, x, y, dx, dy)
  if (d === null) return null
  const markerClass = MERMAID_MARKER_CLASS[kind]
  const suffix = markerClass === undefined ? '' : ` ${markerClass}`
  return { d, className: `dsc-mermaid-edge-arrow${suffix}`, fill: 'none' }
}
function mermaidSelfEdgeGeometry(node, markerKind) {
  const startX = node.x + node.w * 0.35
  const endX = node.x + node.w * 0.65
  const top = node.y
  // Keep the loop inside the viewBox: the top layer starts at the pad offset.
  const lift = Math.max(16, Math.min(44, top - 4))
  const d = `M ${mermaidRound(startX)} ${mermaidRound(top)} C ${mermaidRound(startX + 26)} ${mermaidRound(top - lift)} ${mermaidRound(endX + 26)} ${mermaidRound(top - lift)} ${mermaidRound(endX)} ${mermaidRound(top)}`
  return {
    d, marker: mermaidMarker(markerKind, endX, top, 0, 1),
    labelX: mermaidRound((startX + endX) / 2 + 34), labelY: mermaidRound(Math.max(8, top - lift + 12)), labelAnchor: 'start',
  }
}
function mermaidGraphEdgeGeometry(from, to, direction, options) {
  const markerKind = options && options.marker ? options.marker : 'none'
  const dashed = Boolean(options && options.dashed)
  const thick = Boolean(options && options.thick)
  if (from.id === to.id) return { ...mermaidSelfEdgeGeometry(from, markerKind), dashed, thick }
  const horizontal = direction === 'LR' || direction === 'RL'
  const r = mermaidRound
  let sx = 0
  let sy = 0
  let tx = 0
  let ty = 0
  let tangentX = 1
  let tangentY = 0
  let labelX = 0
  let labelY = 0
  let path = ''
  if (horizontal && Math.abs(from.x - to.x) < 1) {
    const down = to.y >= from.y
    sx = from.x + from.w / 2; sy = down ? from.y + from.h : from.y
    tx = to.x + to.w / 2; ty = down ? to.y : to.y + to.h
    const dy = ty - sy
    if (Math.abs(dy) < 1) return null
    path = `M ${r(sx)} ${r(sy)} L ${r(tx)} ${r(ty)}`
    tangentY = dy >= 0 ? 1 : -1
    labelX = (sx + tx) / 2 + 10; labelY = (sy + ty) / 2
  } else if (horizontal) {
    const forward = direction !== 'RL'
    sx = forward ? from.x + from.w : from.x; sy = from.y + from.h / 2
    tx = forward ? to.x : to.x + to.w; ty = to.y + to.h / 2
    const dx = tx - sx
    if (Math.abs(dx) < 1) return null
    const sign = dx >= 0 ? 1 : -1
    const bend = Math.max(18, Math.abs(dx) * 0.45)
    path = `M ${r(sx)} ${r(sy)} C ${r(sx + bend * sign)} ${r(sy)} ${r(tx - bend * sign)} ${r(ty)} ${r(tx)} ${r(ty)}`
    tangentX = sign; tangentY = 0
    labelX = (sx + tx) / 2; labelY = (sy + ty) / 2 - 10
  } else if (Math.abs(from.y - to.y) < 1) {
    const right = to.x >= from.x
    sx = right ? from.x + from.w : from.x; sy = from.y + from.h / 2
    tx = right ? to.x : to.x + to.w; ty = to.y + to.h / 2
    const dx = tx - sx
    if (Math.abs(dx) < 1) return null
    path = `M ${r(sx)} ${r(sy)} L ${r(tx)} ${r(ty)}`
    tangentX = dx >= 0 ? 1 : -1; tangentY = 0
    labelX = (sx + tx) / 2; labelY = (sy + ty) / 2 - 10
  } else {
    const down = direction !== 'BT'
    sx = from.x + from.w / 2; sy = down ? from.y + from.h : from.y
    tx = to.x + to.w / 2; ty = down ? to.y : to.y + to.h
    const dy = ty - sy
    if (Math.abs(dy) < 1) return null
    const sign = dy >= 0 ? 1 : -1
    const bend = Math.max(18, Math.abs(dy) * 0.45)
    path = `M ${r(sx)} ${r(sy)} C ${r(sx)} ${r(sy + bend * sign)} ${r(tx)} ${r(ty - bend * sign)} ${r(tx)} ${r(ty)}`
    tangentX = 0; tangentY = sign
    labelX = (sx + tx) / 2; labelY = (sy + ty) / 2 - 10
  }
  return {
    d: path, marker: mermaidMarker(markerKind, tx, ty, tangentX, tangentY), dashed, thick,
    labelX: r(labelX), labelY: r(labelY), labelAnchor: 'middle',
  }
}

// ---------- centered layout helpers ----------
function mermaidCenterOffsets(placed, clusters, requestedWidth) {
  let minX = 0
  let minY = 0
  let maxX = placed.contentW
  let maxY = placed.contentH
  for (const node of placed.nodes) {
    minX = Math.min(minX, node.x); minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x + node.w); maxY = Math.max(maxY, node.y + node.h)
  }
  for (const cluster of clusters) {
    minX = Math.min(minX, cluster.x); minY = Math.min(minY, cluster.y)
    maxX = Math.max(maxX, cluster.x + cluster.w); maxY = Math.max(maxY, cluster.y + cluster.h)
  }
  const contentW = Math.max(1, maxX - minX)
  const contentH = Math.max(1, maxY - minY)
  const width = Math.max(requestedWidth, contentW + MERMAID_PAD * 2)
  const height = Math.max(120, contentH + MERMAID_PAD * 2)
  return { width, height, offsetX: (width - contentW) / 2 - minX, offsetY: (height - contentH) / 2 - minY }
}
function mermaidPolygonShape(shape) {
  return shape === 'diamond' || shape === 'asymmetric' || shape === 'hexagon' || shape === 'parallelogram'
}
function mermaidPolygonPoints(node) {
  const r = mermaidRound
  const x = node.x
  const y = node.y
  const w = node.w
  const h = node.h
  const cx = x + w / 2
  const cy = y + h / 2
  if (node.shape === 'diamond') return `${r(cx)},${r(y)} ${r(x + w)},${r(cy)} ${r(cx)},${r(y + h)} ${r(x)},${r(cy)}`
  if (node.shape === 'asymmetric') {
    return `${r(x + 10)},${r(y)} ${r(x + w)},${r(cy)} ${r(x + 10)},${r(y + h)} ${r(x)},${r(y + h)} ${r(x)},${r(y)}`
  }
  if (node.shape === 'hexagon') {
    return `${r(x + 12)},${r(y)} ${r(x + w - 12)},${r(y)} ${r(x + w)},${r(cy)} ${r(x + w - 12)},${r(y + h)} ${r(x + 12)},${r(y + h)} ${r(x)},${r(cy)}`
  }
  return `${r(x + 12)},${r(y)} ${r(x + w)},${r(y)} ${r(x + w - 12)},${r(y + h)} ${r(x)},${r(y + h)}`
}

// ---------- flowchart layout ----------
function mermaidLayoutFlowchart(model, requestedWidth) {
  const sizes = new Map()
  for (const node of model.nodes) sizes.set(node.id, mermaidNodeSize(node.lines))
  const placed = mermaidLayeredLayout(model.nodes, model.edges, model.direction, sizes)
  const nodeGeom = new Map()
  for (const node of placed.nodes) nodeGeom.set(node.id, node)
  const clusters = []
  for (const group of model.groups) {
    if (group.members.length === 0) continue
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const id of group.members) {
      const node = nodeGeom.get(id)
      if (node === undefined) continue
      minX = Math.min(minX, node.x); minY = Math.min(minY, node.y)
      maxX = Math.max(maxX, node.x + node.w); maxY = Math.max(maxY, node.y + node.h)
    }
    if (!Number.isFinite(minX)) continue
    clusters.push({ id: group.id, shape: 'rect', className: 'dsc-mermaid-cluster', title: group.title, depth: group.depth, x: minX - 16, y: minY - 26, w: maxX - minX + 32, h: maxY - minY + 40 })
  }
  clusters.sort((left, right) => left.depth - right.depth)
  const offsets = mermaidCenterOffsets(placed, clusters, requestedWidth)
  const nodes = placed.nodes.map((node) => {
    const result = { ...node, x: mermaidRound(node.x + offsets.offsetX), y: mermaidRound(node.y + offsets.offsetY), className: 'dsc-mermaid-node' }
    if (mermaidPolygonShape(node.shape)) result.points = mermaidPolygonPoints(result)
    return result
  })
  const nodeMap = new Map()
  for (const node of nodes) nodeMap.set(node.id, node)
  const clusterShapes = clusters.map(cluster => ({ ...cluster, x: mermaidRound(cluster.x + offsets.offsetX), y: mermaidRound(cluster.y + offsets.offsetY) }))
  const texts = []
  for (const cluster of clusterShapes) {
    if (cluster.title !== '') texts.push({ text: mermaidClip(cluster.title, 80), x: mermaidRound(cluster.x + 10), y: mermaidRound(cluster.y + 15), textAnchor: 'start', className: 'dsc-mermaid-cluster-label' })
  }
  for (const node of nodes) {
    const fitted = Math.max(6, Math.floor((node.w - 18) / MERMAID_TEXT_WIDTH))
    const lines = node.lines.map(line => mermaidClip(line, fitted))
    const startY = node.y + node.h / 2 - ((lines.length - 1) * 18) / 2
    lines.forEach((line, index) => texts.push({ text: line, x: mermaidRound(node.x + node.w / 2), y: mermaidRound(startY + index * 18), textAnchor: 'middle', className: 'dsc-mermaid-node-label' }))
  }
  const edges = []
  for (const edge of model.edges) {
    const from = nodeMap.get(edge.from)
    const to = nodeMap.get(edge.to)
    if (from === undefined || to === undefined) continue
    const geometry = mermaidGraphEdgeGeometry(from, to, model.direction, { marker: edge.arrow ? 'chevron' : 'none', dashed: edge.dashed, thick: edge.thick })
    if (geometry === null) continue
    edges.push({ ...edge, ...geometry })
    if (edge.label !== '') texts.push({ text: mermaidClip(edge.label), x: geometry.labelX, y: geometry.labelY, textAnchor: geometry.labelAnchor, className: 'dsc-mermaid-edge-label' })
  }
  return {
    kind: 'flowchart', direction: model.direction, width: mermaidRound(offsets.width), height: mermaidRound(offsets.height),
    nodes, edges, texts, clusters: clusterShapes, frames: [], notes: [], lifelines: [], legend: [], rules: [],
  }
}

// ---------- class diagram layout ----------
function mermaidClassSize(node) {
  let chars = node.title.length
  for (const member of node.members) chars = Math.max(chars, member.length)
  return { w: mermaidClamp(mermaidRound(chars * MERMAID_TEXT_WIDTH + 30), 130, 300), h: mermaidRound(Math.max(44, 34 + node.members.length * 18)) }
}
function mermaidLayoutClassDiagram(model, requestedWidth) {
  const sizes = new Map()
  for (const node of model.nodes) sizes.set(node.id, mermaidClassSize(node))
  const rankEdges = model.edges.map(edge => ({ from: edge.layoutFrom, to: edge.layoutTo }))
  const placed = mermaidLayeredLayout(model.nodes, rankEdges, model.direction, sizes)
  const offsets = mermaidCenterOffsets(placed, [], requestedWidth)
  const nodes = placed.nodes.map(node => ({
    ...node, x: mermaidRound(node.x + offsets.offsetX), y: mermaidRound(node.y + offsets.offsetY), className: 'dsc-mermaid-node',
  }))
  const nodeMap = new Map()
  for (const node of nodes) nodeMap.set(node.id, node)
  const texts = []
  for (const node of nodes) {
    const fitted = Math.max(8, Math.floor((node.w - 22) / MERMAID_TEXT_WIDTH))
    texts.push({
      text: mermaidClip(node.title, fitted), x: mermaidRound(node.x + node.w / 2), y: mermaidRound(node.y + 19),
      textAnchor: 'middle', className: 'dsc-mermaid-node-label dsc-mermaid-class-title',
    })
    node.members.forEach((member, index) => {
      texts.push({
        text: mermaidClip(member, fitted), x: mermaidRound(node.x + 12), y: mermaidRound(node.y + 40 + index * 18),
        textAnchor: 'start', className: 'dsc-mermaid-node-label dsc-mermaid-class-member',
      })
    })
  }
  const edges = []
  for (const relation of model.edges) {
    const left = nodeMap.get(relation.layoutFrom)
    const right = nodeMap.get(relation.layoutTo)
    if (left === undefined || right === undefined) continue
    const arrowAtFrom = relation.arrowAt === 'from'
    const geometry = mermaidGraphEdgeGeometry(arrowAtFrom ? right : left, arrowAtFrom ? left : right, model.direction, { marker: relation.marker, dashed: relation.dashed })
    if (geometry === null) continue
    edges.push({ ...relation, ...geometry })
    if (relation.label !== '') texts.push({ text: mermaidClip(relation.label), x: geometry.labelX, y: geometry.labelY, textAnchor: geometry.labelAnchor, className: 'dsc-mermaid-edge-label' })
  }
  return {
    kind: 'class', direction: model.direction, width: mermaidRound(offsets.width), height: mermaidRound(offsets.height),
    nodes, edges, texts, clusters: [], frames: [], notes: [], lifelines: [], legend: [], rules: [],
  }
}

// ---------- sequence layout ----------
function mermaidLayoutSequenceDiagram(model, requestedWidth) {
  const pad = 40
  const participants = model.participants
  const count = participants.length
  const boxes = participants.map((participant) => {
    const lines = mermaidLabelLines(participant.label)
    return { lines, ...mermaidNodeSize(lines, 100, 240, 40, 16) }
  })
  let maxBoxWidth = 100
  let maxBoxHeight = 40
  for (const box of boxes) { maxBoxWidth = Math.max(maxBoxWidth, box.w); maxBoxHeight = Math.max(maxBoxHeight, box.h) }
  const columnStep = maxBoxWidth + 34
  const edgePad = Math.max(pad, maxBoxWidth / 2 + 14)
  const titleSpace = model.title === '' ? 0 : 30
  const width = Math.max(requestedWidth, 360, edgePad * 2 + (count - 1) * columnStep)
  const columns = participants.map((participant, index) => (count === 1 ? width / 2 : edgePad + (index * (width - edgePad * 2)) / (count - 1)))
  const columnOf = (id) => {
    for (let index = 0; index < participants.length; index += 1) if (participants[index].id === id) return columns[index]
    return null
  }
  const headerY = pad + titleSpace
  const headerH = maxBoxHeight
  let maxDepth = 0
  for (const frame of model.frames) maxDepth = Math.max(maxDepth, frame.depth + 1)
  const startY = headerY + headerH + 42 + maxDepth * 14
  const yAt = order => startY + order * 54
  const nodes = []
  const texts = []
  const lifelines = []
  if (model.title !== '') texts.push({ text: model.title, x: mermaidRound(width / 2), y: mermaidRound(pad + 10), textAnchor: 'middle', className: 'dsc-mermaid-title' })
  participants.forEach((participant, index) => {
    const box = boxes[index]
    nodes.push({ id: participant.id, shape: 'rect', className: 'dsc-mermaid-node', x: mermaidRound(columns[index] - box.w / 2), y: headerY, w: box.w, h: headerH })
    const labelStart = headerY + headerH / 2 - ((box.lines.length - 1) * 16) / 2
    box.lines.forEach((line, lineIndex) => texts.push({
      text: mermaidClip(line, MERMAID_MAX_LABEL), x: mermaidRound(columns[index]), y: mermaidRound(labelStart + lineIndex * 16),
      textAnchor: 'middle', className: 'dsc-mermaid-node-label',
    }))
  })
  const lastOrder = model.items.length - 1
  const lifelineBottom = lastOrder >= 0 ? yAt(lastOrder) + 44 : headerY + headerH + 66
  const height = Math.max(lifelineBottom + pad, headerY + headerH + 120)
  participants.forEach((participant, index) => lifelines.push({
    d: `M ${mermaidRound(columns[index])} ${mermaidRound(headerY + headerH)} L ${mermaidRound(columns[index])} ${mermaidRound(lifelineBottom)}`,
    className: 'dsc-mermaid-edge dsc-mermaid-lifeline', dash: '4 4',
  }))
  const frames = []
  for (const frame of model.frames) {
    if (frame.end <= frame.start) continue
    // Outer frames get the highest label band so nested frames never poke out.
    const top = yAt(frame.start) - 22 - (maxDepth - frame.depth) * 12
    const bottom = yAt(frame.end - 1) + 26 - frame.depth * 4
    const x = MERMAID_PAD - 10 + frame.depth * 8
    const frameWidth = width - 2 * x
    if (frameWidth <= 40) continue
    const frameY = Math.max(headerY + headerH + 8, top)
    frames.push({
      id: `frame-${frame.kind}-${frame.start}`, shape: 'rect', className: 'dsc-mermaid-frame',
      x: mermaidRound(x), y: mermaidRound(frameY), w: mermaidRound(frameWidth), h: mermaidRound(Math.max(48, bottom - frameY)),
    })
    texts.push({
      text: mermaidClip(frame.label === '' ? frame.kind : `${frame.kind} ${frame.label}`, 100),
      x: mermaidRound(x + 10), y: mermaidRound(frameY + 15), textAnchor: 'start', className: 'dsc-mermaid-frame-label',
    })
    for (const divider of frame.dividers) {
      if (divider.label === '' || divider.order < frame.start || divider.order >= frame.end) continue
      texts.push({ text: `[${mermaidClip(divider.label, 80)}]`, x: mermaidRound(x + 10), y: mermaidRound(yAt(divider.order) - 32), textAnchor: 'start', className: 'dsc-mermaid-frame-label' })
    }
  }
  const notes = []
  for (const note of model.notes) {
    const lines = mermaidWrapText(note.text, 34, 4)
    let chars = 0
    for (const line of lines) chars = Math.max(chars, line.length)
    const noteWidth = mermaidClamp(mermaidRound(chars * MERMAID_TEXT_WIDTH + 26), 120, 300)
    const noteHeight = mermaidRound(16 + lines.length * 18)
    const firstX = columnOf(note.targets[0])
    if (firstX === null) continue
    let x = firstX - noteWidth / 2
    if (note.position === 'left of') x = firstX - 14 - noteWidth
    else if (note.position === 'right of') x = firstX + 14
    else if (note.targets.length > 1) {
      const secondX = columnOf(note.targets[1])
      if (secondX !== null) x = (firstX + secondX) / 2 - noteWidth / 2
    }
    x = mermaidClamp(x, 8, Math.max(8, width - noteWidth - 8))
    const noteY = mermaidClamp(yAt(note.order) - noteHeight / 2, headerY + headerH + 8, Math.max(headerY + headerH + 8, lifelineBottom - noteHeight))
    notes.push({ id: `note-${note.order}`, shape: 'rect', className: 'dsc-mermaid-note', x: mermaidRound(x), y: mermaidRound(noteY), w: noteWidth, h: noteHeight })
    const textStart = noteY + noteHeight / 2 - ((lines.length - 1) * 18) / 2
    lines.forEach((line, index) => texts.push({
      text: line, x: mermaidRound(x + noteWidth / 2), y: mermaidRound(textStart + index * 18),
      textAnchor: 'middle', className: 'dsc-mermaid-note-label',
    }))
  }
  const messages = []
  for (const message of model.messages) {
    const fromX = columnOf(message.from)
    const toX = columnOf(message.to)
    if (fromX === null || toX === null) continue
    const y = mermaidRound(yAt(message.order))
    if (fromX === toX) {
      const edgeX = mermaidRound(fromX + 4)
      messages.push({
        ...message, x: mermaidRound(fromX), y,
        d: `M ${edgeX} ${mermaidRound(y - 6)} C ${mermaidRound(fromX + 44)} ${mermaidRound(y - 30)} ${mermaidRound(fromX + 44)} ${mermaidRound(y + 30)} ${edgeX} ${mermaidRound(y + 6)}`,
        marker: mermaidMarker(message.marker, edgeX, y + 6, -1, 0),
      })
      if (message.text !== '') texts.push({ text: mermaidClip(message.text), x: mermaidRound(fromX + 52), y, textAnchor: 'start', className: 'dsc-mermaid-edge-label' })
    } else {
      messages.push({
        ...message, x: mermaidRound(fromX), y, d: `M ${mermaidRound(fromX)} ${y} L ${mermaidRound(toX)} ${y}`,
        marker: mermaidMarker(message.marker, toX, y, toX >= fromX ? 1 : -1, 0),
      })
      if (message.text !== '') texts.push({ text: mermaidClip(message.text), x: mermaidRound((fromX + toX) / 2), y: mermaidRound(y - 12), textAnchor: 'middle', className: 'dsc-mermaid-edge-label' })
    }
  }
  return {
    kind: 'sequence', direction: 'LR', width: mermaidRound(width), height: mermaidRound(height),
    nodes, edges: messages, messages, participants, texts, clusters: [], frames, notes, lifelines, legend: [], rules: [],
  }
}

// ---------- pie layout ----------
function mermaidLayoutPieChart(model, requestedWidth) {
  const pad = 36
  const slices = model.slices
  let total = 0
  for (const slice of slices) total += slice.value
  if (!Number.isFinite(total) || total <= 0) return null
  const radius = 128
  const rows = slices.map(slice => {
    const percent = (slice.value / total) * 100
    return { slice, percent: Math.round(percent * 10) / 10, label: `${slice.label}  ${slice.value} (${Math.round(percent)}%)` }
  })
  let legendChars = 0
  for (const row of rows) legendChars = Math.max(legendChars, row.label.length)
  const legendWidth = mermaidClamp(mermaidRound(legendChars * MERMAID_TEXT_WIDTH + 54), 150, 340)
  const sideBySide = requestedWidth >= 520
  const titleHeight = model.title === '' ? 0 : 36
  const pieBox = radius * 2
  const contentW = sideBySide ? pieBox + 30 + legendWidth : Math.max(pieBox, legendWidth)
  const contentH = sideBySide ? Math.max(pieBox, rows.length * 26) : pieBox + 30 + rows.length * 26
  const width = Math.max(requestedWidth, contentW + pad * 2)
  const height = contentH + titleHeight + pad * 2
  const contentLeft = (width - contentW) / 2
  const centerX = sideBySide ? contentLeft + radius : width / 2
  const centerY = sideBySide ? pad + titleHeight + contentH / 2 : pad + titleHeight + radius
  const nodes = []
  const legend = []
  const texts = []
  let angle = -Math.PI / 2
  rows.forEach((row, index) => {
    const style = { '--dsc-slice': `var(--dsc-mermaid-c${(index % 8) + 1})` }
    const sweep = (row.slice.value / total) * Math.PI * 2
    const start = angle
    angle += sweep
    if (sweep >= Math.PI * 2 - 1e-6) {
      nodes.push({ id: `slice-${index}`, shape: 'ellipse', className: 'dsc-mermaid-slice', cx: mermaidRound(centerX), cy: mermaidRound(centerY), rx: radius, ry: radius, style, fill: 'var(--dsc-slice, currentColor)' })
    } else {
      const x1 = centerX + radius * Math.cos(start)
      const y1 = centerY + radius * Math.sin(start)
      const x2 = centerX + radius * Math.cos(angle)
      const y2 = centerY + radius * Math.sin(angle)
      const largeArc = sweep > Math.PI ? 1 : 0
      nodes.push({
        id: `slice-${index}`, shape: 'slice', className: 'dsc-mermaid-slice',
        d: `M ${mermaidRound(centerX)} ${mermaidRound(centerY)} L ${mermaidRound(x1)} ${mermaidRound(y1)} A ${radius} ${radius} 0 ${largeArc} 1 ${mermaidRound(x2)} ${mermaidRound(y2)} Z`,
        style, fill: 'var(--dsc-slice, currentColor)',
      })
    }
    const legendX = sideBySide ? contentLeft + pieBox + 30 : width / 2 - legendWidth / 2
    const legendTop = sideBySide ? pad + titleHeight + Math.max(0, (contentH - rows.length * 26) / 2) : pad + titleHeight + pieBox + 30
    const legendY = legendTop + index * 26
    legend.push({
      id: `legend-${index}`, shape: 'rect', className: 'dsc-mermaid-slice dsc-mermaid-legend-swatch',
      x: mermaidRound(legendX), y: mermaidRound(legendY), w: 12, h: 12, rx: 2, style, fill: 'var(--dsc-slice, currentColor)',
    })
    texts.push({ text: mermaidClip(row.label, 80), x: mermaidRound(legendX + 20), y: mermaidRound(legendY + 6), textAnchor: 'start', className: 'dsc-mermaid-legend-label' })
  })
  if (model.title !== '') texts.push({ text: model.title, x: mermaidRound(width / 2), y: mermaidRound(pad + 10), textAnchor: 'middle', className: 'dsc-mermaid-title' })
  return {
    kind: 'pie', direction: '', width: mermaidRound(width), height: mermaidRound(height), nodes, edges: [],
    slices: rows.map(row => ({ label: row.slice.label, value: row.slice.value, percent: row.percent, percentText: `${Math.round(row.percent)}%` })),
    omitted: model.omitted, texts, clusters: [], frames: [], notes: [], lifelines: [], legend, rules: [],
  }
}

// ---------- layout entry point ----------
function mermaidLayout(source, options = {}) {
  const settings = options !== null && typeof options === 'object' ? options : {}
  const requestedWidth = mermaidClamp(mermaidNum(settings.width, MERMAID_DEFAULT_WIDTH), 240, 2400)
  const model = parseMermaid(source)
  if (model === null || model === undefined || model.kind === 'unknown') {
    return { kind: 'unknown', error: (model && model.error) || 'unsupported diagram' }
  }
  try {
    if (model.kind === 'flowchart') return mermaidLayoutFlowchart(model, requestedWidth)
    if (model.kind === 'sequence') return mermaidLayoutSequenceDiagram(model, requestedWidth)
    if (model.kind === 'pie') {
      const layout = mermaidLayoutPieChart(model, requestedWidth)
      return layout === null ? { kind: 'unknown', error: 'pie chart contains no positive values' } : layout
    }
    if (model.kind === 'class') return mermaidLayoutClassDiagram(model, requestedWidth)
    return { kind: 'unknown', error: `unsupported diagram type: ${mermaidClip(model.kind, 40)}` }
  } catch (error) {
    return { kind: 'unknown', error: mermaidErrorMessage(error) }
  }
}

// ---------- React rendering ----------
function mermaidRenderShape(shape, key) {
  const props = { key, className: shape.className || 'dsc-mermaid-node', 'vector-effect': 'non-scaling-stroke' }
  if (shape.style !== undefined) props.style = shape.style
  if (shape.fill !== undefined) props.fill = shape.fill
  if (shape.shape === 'slice') {
    props.d = shape.d
    return h('path', props)
  }
  if (shape.shape === 'ellipse' || shape.shape === 'circle') {
    props.cx = shape.cx === undefined ? mermaidRound(shape.x + shape.w / 2) : shape.cx
    props.cy = shape.cy === undefined ? mermaidRound(shape.y + shape.h / 2) : shape.cy
    props.rx = shape.rx === undefined ? mermaidRound(shape.w / 2) : shape.rx
    props.ry = shape.ry === undefined ? mermaidRound(shape.h / 2) : shape.ry
    return h('ellipse', props)
  }
  if (mermaidPolygonShape(shape.shape) && typeof shape.points === 'string') {
    props.points = shape.points
    return h('polygon', props)
  }
  props.x = shape.x
  props.y = shape.y
  props.width = shape.w
  props.height = shape.h
  props.rx = shape.rx === undefined ? 8 : shape.rx
  return h('rect', props)
}
function MermaidDiagram({ source, title } = {}) {
  const raw = typeof source === 'string' ? source : mermaidSafeText(source)
  const layout = React.useMemo(() => {
    try { return mermaidLayout(raw, { width: MERMAID_DEFAULT_WIDTH }) } catch (error) { return { kind: 'unknown', error: mermaidErrorMessage(error) } }
  }, [raw])
  const caption = typeof title === 'string' ? mermaidClip(title, MERMAID_MAX_LABEL) : ''
  const firstLine = mermaidClip(raw.replace(/\r\n?/g, '\n').split('\n').find(line => line.trim() !== '') || '', MERMAID_MAX_LABEL)
  const ariaLabel = mermaidClip(caption !== '' ? caption : (firstLine || tr('mermaidFailed')), MERMAID_MAX_LABEL)
  if (!layout || layout.kind === 'unknown' || mermaidNum(layout.width) <= 0 || mermaidNum(layout.height) <= 0) {
    const message = layout && typeof layout.error === 'string' ? layout.error : 'render failed'
    return h('figure', { className: 'dsc-mermaid dsc-mermaid-failed' },
      h('div', { className: 'dsc-mermaid-error' },
        h('div', { className: 'dsc-mermaid-error-line' }, h(Icon, { name: 'warning', size: 16 }), h('span', { className: 'dsc-mermaid-error-text' }, `${tr('mermaidFailed')}: ${message}`)),
        h('pre', { className: 'dsc-mermaid-source dsc-pre' }, raw)))
  }
  const children = []
  const addShapes = (list, prefix) => (list || []).forEach((shape, index) => children.push(mermaidRenderShape(shape, `${prefix}-${index}`)))
  addShapes(layout.clusters, 'c')
  addShapes(layout.frames, 'f')
  for (const lifeline of layout.lifelines || []) {
    children.push(h('path', { key: `l-${children.length}`, d: lifeline.d, className: lifeline.className || 'dsc-mermaid-edge dsc-mermaid-lifeline', fill: 'none', strokeDasharray: lifeline.dash || '4 4', 'vector-effect': 'non-scaling-stroke' }))
  }
  addShapes(layout.notes, 'o')
  for (const edge of layout.edges || []) {
    const dashed = edge.dashed === true
    const classes = `dsc-mermaid-edge${dashed ? ' dsc-mermaid-edge-dashed' : ''}${edge.thick === true ? ' dsc-mermaid-edge-thick' : ''}`
    children.push(h('path', { key: `e-${children.length}`, d: edge.d, className: classes, fill: 'none', strokeDasharray: dashed ? '6 4' : undefined, 'vector-effect': 'non-scaling-stroke' }))
    if (edge.marker) {
      children.push(h('path', { key: `m-${children.length}`, d: edge.marker.d, className: edge.marker.className, fill: edge.marker.fill === undefined ? 'none' : edge.marker.fill, 'vector-effect': 'non-scaling-stroke' }))
    }
  }
  addShapes(layout.nodes, 'n')
  addShapes(layout.legend, 'g')
  for (const entry of layout.texts || []) {
    children.push(h('text', { key: `t-${children.length}`, x: entry.x, y: entry.y, className: entry.className || 'dsc-mermaid-node-label', textAnchor: entry.textAnchor || 'middle', dominantBaseline: 'middle', 'vector-effect': 'non-scaling-stroke' }, entry.text))
  }
  return h('figure', { className: 'dsc-mermaid' },
    h('div', { className: 'dsc-mermaid-figure' },
      h('svg', {
        className: 'dsc-mermaid-svg', xmlns: 'http://www.w3.org/2000/svg', width: mermaidRound(layout.width), height: mermaidRound(layout.height),
        viewBox: `0 0 ${mermaidRound(layout.width)} ${mermaidRound(layout.height)}`, role: 'img', 'aria-label': ariaLabel,
        preserveAspectRatio: 'xMidYMid meet', focusable: 'false',
      }, children)),
    caption !== '' ? h('figcaption', { className: 'dsc-mermaid-caption' }, caption) : null)
}
