import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const root = path.resolve('.')
const file = path.join(root, 'client-src/33-mermaid.js')
const source = fs.readFileSync(file, 'utf8')

let checks = 0

function assert(condition, message) {
  checks += 1
  if (!condition) throw new Error(`mermaid check failed: ${message}`)
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, `${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`)
}

function assertFinite(value, message) {
  assert(typeof value === 'number' && Number.isFinite(value), `${message} must be a finite number (got ${String(value)})`)
}

function assertFiniteTree(value, label, depth = 0) {
  if (depth > 4) return
  if (typeof value === 'number') {
    assert(Number.isFinite(value), `${label} contains a non-finite number`)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertFiniteTree(item, `${label}[${index}]`, depth + 1))
    return
  }
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) assertFiniteTree(value[key], `${label}.${key}`, depth + 1)
  }
}

function collectText(node, output) {
  if (node === null || node === undefined || typeof node === 'boolean') return
  if (typeof node === 'string' || typeof node === 'number') {
    output.push(String(node))
    return
  }
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, output)
    return
  }
  if (typeof node === 'object') {
    if (node.props !== null && typeof node.props === 'object' && node.props.children !== undefined) {
      collectText(node.props.children, output)
    }
    if (node.children !== undefined) collectText(node.children, output)
  }
}

function walkElements(node, output) {
  if (node === null || node === undefined || typeof node === 'boolean') return output
  if (typeof node === 'string' || typeof node === 'number') return output
  if (Array.isArray(node)) {
    for (const child of node) walkElements(child, output)
    return output
  }
  if (typeof node === 'object' && node.type !== undefined) {
    output.push(node)
    walkElements(node.children, output)
  }
  return output
}

function findElement(node, predicate) {
  for (const element of walkElements(node, [])) if (predicate(element)) return element
  return null
}

function collectClasses(node) {
  const classes = new Set()
  for (const element of walkElements(node, [])) {
    const className = element.props !== undefined ? element.props.className : undefined
    if (typeof className !== 'string') continue
    for (const name of className.split(/\s+/)) if (name !== '') classes.add(name)
  }
  return classes
}

function h(type, props, ...children) {
  return { type, props: props || {}, children }
}

const React = {
  createElement: h,
  useState: value => [typeof value === 'function' ? value() : value, () => {}],
  useMemo: render => render(),
  useRef: value => ({ current: value }),
  useEffect() {},
  useCallback: render => render,
}
const tr = key => key
const cx = (...values) => values.filter(Boolean).join(' ')
const Icon = () => null

// ---- static checks on the module ----

assert(!/^\s*(import|export)\s/m.test(source), 'module must not contain import/export statements')
assert(!source.includes('dangerouslySetInnerHTML'), 'module must not use dangerouslySetInnerHTML')
assert(!/\beval\s*\(/.test(source), 'module must not use eval')
assert(!/new\s+Function\s*\(/.test(source), 'module must not use new Function')
assert(!/\bsetTimeout\s*\(/.test(source), 'module must not start timers')
assert(!/\bsetInterval\s*\(/.test(source), 'module must not start timers')
assert(!/\brequestAnimationFrame\s*\(/.test(source), 'module must not start animations')

const sandbox = { h, React, tr, cx, Icon, console }
vm.createContext(sandbox)
vm.runInContext(
  `(function () {\n${source}\n;globalThis.__mermaid = { parseMermaid, mermaidLayout, MermaidDiagram }\n})()`,
  sandbox,
  { filename: 'client-src/33-mermaid.js' },
)
const api = sandbox.__mermaid
assert(api !== null && typeof api === 'object', 'module must expose its public API')
assertEqual(typeof api.parseMermaid, 'function', 'parseMermaid is exported')
assertEqual(typeof api.mermaidLayout, 'function', 'mermaidLayout is exported')
assertEqual(typeof api.MermaidDiagram, 'function', 'MermaidDiagram is exported')

// ---- 1. flowchart TD: 5 nodes / 6 edges ----

const flowchartSource = `graph TD
  A[Start] --> B[Parse]
  B --> C{Valid?}
  C -->|Yes| D[Render]
  C -->|No| E[Error]
  D --> E
  A --> E`

const flowParsed = api.parseMermaid(flowchartSource)
assertEqual(flowParsed.kind, 'flowchart', 'flowchart TD is parsed as flowchart')
assertEqual(flowParsed.nodes.length, 5, 'flowchart TD node count')
assertEqual(flowParsed.edges.length, 6, 'flowchart TD edge count')

const flow = api.mermaidLayout(flowchartSource, { width: 720 })
assertEqual(flow.kind, 'flowchart', 'flowchart layout kind')
assertEqual(flow.nodes.length, 5, 'flowchart layout node count')
assertEqual(flow.edges.length, 6, 'flowchart layout edge count')
assert(flow.height > 0, 'flowchart layout height is positive')
assert(flow.width > 0, 'flowchart layout width is positive')
assert(flow.texts.length >= 5, 'flowchart layout renders labels')
assert(flow.texts.some(entry => entry.text === 'Yes'), 'edge label is rendered')
assert(flow.nodes.every(node => typeof node.x === 'number' && Number.isFinite(node.x)), 'nodes have finite x')
assert(flow.nodes.every(node => typeof node.y === 'number' && Number.isFinite(node.y)), 'nodes have finite y')
assertFiniteTree(flow, 'flowchart layout')
for (const edge of flow.edges) {
  assert(typeof edge.d === 'string' && edge.d.length > 0, 'flowchart edge has a path')
}

// ---- 2. LR layout: a linear chain is wider than tall ----

const lr = api.mermaidLayout(`flowchart LR
  A --> B --> C --> D`, { width: 720 })
assertEqual(lr.kind, 'flowchart', 'LR diagram kind')
assertEqual(lr.nodes.length, 4, 'LR chain node count')
assertEqual(lr.edges.length, 3, 'LR chain edge count')
assert(lr.width > lr.height, `LR chain should be wider (${lr.width}) than tall (${lr.height})`)
assertFiniteTree(lr, 'LR layout')

// ---- 3. sequenceDiagram: 3 participants / 4 messages ----

const sequenceSource = `sequenceDiagram
  participant A as Alice
  participant B as Bob
  actor C
  A->>B: Hello
  B-->>A: Hi there
  A-xC: Bye
  C-)B: Later
  Note over A: a note`

const sequence = api.mermaidLayout(sequenceSource, { width: 720 })
assertEqual(sequence.kind, 'sequence', 'sequence diagram kind')
assertEqual(sequence.participants.length, 3, 'sequence participant count')
assertEqual(sequence.messages.length, 4, 'sequence message count')
assert(sequence.messages.some(message => message.dashed === true), 'dashed messages are preserved')
assertEqual(sequence.notes.length, 1, 'sequence notes are rendered')
assertFiniteTree(sequence, 'sequence layout')
for (const message of sequence.messages) {
  assert(typeof message.d === 'string' && message.d.length > 0, 'sequence message has a path')
}

const framed = api.mermaidLayout(`sequenceDiagram
  A->>B: one
  loop retry
    A->>B: two
  end`, { width: 720 })
assertEqual(framed.kind, 'sequence', 'framed sequence kind')
assertEqual(framed.frames.length, 1, 'loop block renders a frame')
assert(framed.frames[0].h > 0, 'frame has a positive height')
assertEqual(framed.messages.length, 2, 'loop keeps its messages')

// ---- 4. pie: percentages sum to about 100 ----

const pie = api.mermaidLayout(`pie title Pets
  "Dogs" : 42
  "Cats" : 28
  "Fish" : 30`, { width: 720 })
assertEqual(pie.kind, 'pie', 'pie chart kind')
assertEqual(pie.slices.length, 3, 'pie slice count')
const percentSum = pie.slices.reduce((total, slice) => total + slice.percent, 0)
assert(Math.abs(percentSum - 100) < 0.5, `pie percentages sum to ~100 (got ${percentSum})`)
assertEqual(pie.nodes.length, 3, 'pie node (slice) count')
assertFiniteTree(pie, 'pie layout')
assert(pie.nodes.every(node => node.style && typeof node.style['--dsc-slice'] === 'string'), 'slices expose the --dsc-slice variable')
assert(pie.nodes.every(node => node.style['--dsc-slice'].includes('--dsc-mermaid-c')), 'slices use the theme palette variables')

// ---- 5. classDiagram: basic boxes ----

const klass = api.mermaidLayout(`classDiagram
  class Animal {
    +String name
    +eat()
  }
  class Dog
  class Food
  Animal <|-- Dog : extends
  Dog --> Food : eats`, { width: 720 })
assertEqual(klass.kind, 'class', 'class diagram kind')
assertEqual(klass.nodes.length, 3, 'class diagram box count')
assertEqual(klass.edges.length, 2, 'class diagram relation count')
assert(klass.texts.some(entry => entry.text === '+String name'), 'class member text is preserved')
assertFiniteTree(klass, 'class layout')

// ---- 6. component structure, accessibility and CSS classes ----

const componentTree = api.MermaidDiagram({ source: flowchartSource, title: 'Flow demo' })
assertEqual(componentTree.type, 'figure', 'component renders a figure')
assert(componentTree.props.className.includes('dsc-mermaid'), 'figure uses dsc-mermaid')
const svg = findElement(componentTree, element => element.type === 'svg')
assert(svg !== null, 'component renders an svg')
assertEqual(svg.props.role, 'img', 'svg has role="img"')
assertEqual(svg.props['aria-label'], 'Flow demo', 'svg aria-label uses the title')
assert(/^0 0 \d+(?:\.\d+)? \d+(?:\.\d+)?$/.test(svg.props.viewBox), 'svg has a viewBox')
assert(findElement(componentTree, element => element.props.className === 'dsc-mermaid-figure') !== null, 'drawing sits in a dsc-mermaid-figure wrapper')
assert(findElement(componentTree, element => element.props.className === 'dsc-mermaid-caption') !== null, 'title renders a caption')
assert(findElement(componentTree, element => element.props['vector-effect'] === 'non-scaling-stroke') !== null, 'shapes use non-scaling-stroke')

const flowClasses = collectClasses(componentTree)
for (const name of ['dsc-mermaid', 'dsc-mermaid-figure', 'dsc-mermaid-svg', 'dsc-mermaid-node',
  'dsc-mermaid-node-label', 'dsc-mermaid-edge', 'dsc-mermaid-edge-label', 'dsc-mermaid-edge-arrow']) {
  assert(flowClasses.has(name), `flowchart uses the ${name} class`)
}

const untitledTree = api.MermaidDiagram({ source: flowchartSource })
const untitledSvg = findElement(untitledTree, element => element.type === 'svg')
assert(untitledSvg.props['aria-label'].includes('graph TD'), 'aria-label falls back to the first source line')

const groupedTree = api.MermaidDiagram({ source: `flowchart TD
  subgraph Frontend[Client]
    A[UI] --> B[Store]
  end
  B --> C[API]` })
const groupedClasses = collectClasses(groupedTree)
for (const name of ['dsc-mermaid-cluster', 'dsc-mermaid-cluster-label']) {
  assert(groupedClasses.has(name), `subgraph uses the ${name} class`)
}

const pieTree = api.MermaidDiagram({ source: 'pie title Pets\n  "Dogs" : 3\n  "Cats" : 2' })
const pieClasses = collectClasses(pieTree)
for (const name of ['dsc-mermaid-slice', 'dsc-mermaid-legend-label', 'dsc-mermaid-title']) {
  assert(pieClasses.has(name), `pie chart uses the ${name} class`)
}
const slicePath = findElement(pieTree, element => element.type === 'path' && String(element.props.className).includes('dsc-mermaid-slice'))
assert(slicePath !== null, 'pie chart renders slice paths')
assertEqual(slicePath.props.style['--dsc-slice'], 'var(--dsc-mermaid-c1)', 'pie slices expose the theme palette variable')

const sequenceTree = api.MermaidDiagram({ source: sequenceSource })
const sequenceClasses = collectClasses(sequenceTree)
for (const name of ['dsc-mermaid-lifeline', 'dsc-mermaid-note', 'dsc-mermaid-note-label']) {
  assert(sequenceClasses.has(name), `sequence diagram uses the ${name} class`)
}

const framedTree = api.MermaidDiagram({ source: `sequenceDiagram
  participant A
  participant B
  A->>B: one
  alt retry
    A->>B: two
  else give up
    A->>B: three
  end` })
const framedClasses = collectClasses(framedTree)
for (const name of ['dsc-mermaid-frame', 'dsc-mermaid-frame-label']) {
  assert(framedClasses.has(name), `sequence frame uses the ${name} class`)
}

// ---- 7. unknown + malformed fallbacks preserve the source ----

const mindmap = api.mermaidLayout('mindmap\n  root[Root]\n    child', { width: 720 })
assertEqual(mindmap.kind, 'unknown', 'mindmap is unsupported')
assert(typeof mindmap.error === 'string' && mindmap.error.length > 0, 'mindmap has an error message')
assert(mindmap.error.includes('mindmap'), 'unknown error names the diagram type')

const malformed = api.mermaidLayout(`flowchart TD
  --> -->
  ---`, { width: 720 })
assertEqual(malformed.kind, 'unknown', 'malformed flowchart is rejected')
assert(typeof malformed.error === 'string' && malformed.error.length > 0, 'malformed input has an error message')

for (const bad of ['mindmap\n  root', 'flowchart TD\n  --> -->']) {
  const tree = api.MermaidDiagram({ source: bad, title: 'Broken' })
  const texts = []
  collectText(tree, texts)
  assert(texts.join('\n').includes(bad.trim().split('\n').pop().trim().slice(0, 8)), 'error fallback preserves the source')
  assert(texts.join('\n').includes('mermaidFailed'), 'error fallback uses the mermaidFailed label')
}

// ---- 8. oversized input bails out instead of hanging ----

const bigLines = ['flowchart TD']
for (let index = 0; index < 5000; index += 1) bigLines.push(`N${index}[Node ${index}] --> N${index + 1}`)
const bigStarted = Date.now()
const big = api.mermaidLayout(bigLines.join('\n'), { width: 720 })
const bigElapsed = Date.now() - bigStarted
assertEqual(big.kind, 'unknown', 'oversized flowchart is rejected')
assert(typeof big.error === 'string' && /too large/i.test(big.error), `oversized flowchart reports a too-large error (got ${big.error})`)
assert(bigElapsed < 3000, `oversized flowchart bails out quickly (took ${bigElapsed}ms)`)

const tooLong = api.mermaidLayout(`flowchart TD\nA[${'x'.repeat(200001)}]`, { width: 720 })
assertEqual(tooLong.kind, 'unknown', 'oversized source is rejected')

// ---- 9. MermaidDiagram never throws ----

const weirdInputs = [
  '',
  '   \n\t\n',
  '%% only a comment\n%% another one',
  'flowchart TD\n  A[🌍 世界] --> B{ok?}\n  B -->|✓| C((done))',
  'flowchart TD\n  A[[[ unbalanced ]] --> B((x',
  'sequenceDiagram\n  loop\n',
  'pie',
  'classDiagram\n  class A {\n',
  'graph',
  '\u0000\u0001\u0002',
  'flowchart TD\n  A["quote: \\" <script>alert(1)</script>"] --> B',
]
for (const input of weirdInputs) {
  const tree = api.MermaidDiagram({ source: input, title: 'Weird' })
  assert(tree !== null && typeof tree === 'object', `component returns an element for ${JSON.stringify(input.slice(0, 24))}`)
  const texts = []
  collectText(tree, texts)
  assert(typeof texts.join('') === 'string', 'text collection works for weird input')
  assert(!JSON.stringify(tree).includes('dangerouslySetInnerHTML'), 'component never emits raw HTML')
}

const noSource = api.MermaidDiagram({})
assert(noSource !== null && typeof noSource === 'object', 'component tolerates a missing source')

console.log(`MERMAID_OK (${checks} checks, oversized layout bailed in ${bigElapsed}ms)`)
process.exit(0)
