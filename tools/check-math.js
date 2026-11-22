// Smoke checks for client-src/32-math.js: parse a broad LaTeX sample set,
// render it through a minimal React shim, and verify that visible text is
// preserved and nothing is emitted as raw HTML.
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = fs.readFileSync(path.join(root, 'client-src/32-math.js'), 'utf8')

const context = {}
vm.createContext(context)
vm.runInContext(`
globalThis.h = (type, props, ...children) => ({ type, props: props || {}, children })
globalThis.React = {
  createElement: globalThis.h,
  useState: value => [typeof value === 'function' ? value() : value, () => {}],
  useMemo: factory => factory(),
  useRef: value => ({ current: value }),
  useEffect() {},
  useCallback: factory => factory,
}
globalThis.tr = key => key
globalThis.cx = (...values) => values.filter(Boolean).join(' ')
globalThis.Icon = () => null
`, context)
vm.runInContext(`${source}\n;globalThis.__math = { parseLatex, latexToNodes, LatexInline, LatexBlock }`, context)
const math = context.__math

function fail(message) {
  throw new Error(message)
}

function flatten(node) {
  if (node === null || node === undefined || node === false) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(flatten).join('')
  if (typeof node === 'object' && Array.isArray(node.children)) return node.children.map(flatten).join('')
  return ''
}

function assertSafe(node, name) {
  if (node === null || node === undefined) return
  if (Array.isArray(node)) {
    for (const child of node) assertSafe(child, name)
    return
  }
  if (typeof node !== 'object') return
  if (node.props && Object.prototype.hasOwnProperty.call(node.props, 'dangerouslySetInnerHTML')) {
    fail(`${name}: output contains dangerouslySetInnerHTML`)
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) assertSafe(child, name)
  }
}

const samples = [
  { name: 'fraction', tex: '\\frac{1}{2}', visible: ['1', '2'] },
  { name: 'dfrac', tex: '\\dfrac{a+b}{c}', visible: ['a', 'b', 'c'] },
  { name: 'sqrt', tex: '\\sqrt{x}', visible: ['x'] },
  { name: 'indexed root', tex: '\\sqrt[3]{x}', visible: ['3', 'x'] },
  { name: 'superscript', tex: 'x^2', visible: ['x', '2'] },
  { name: 'subscript', tex: 'x_i', visible: ['x', 'i'] },
  { name: 'combined scripts', tex: 'x_i^2', visible: ['x', 'i', '2'] },
  { name: 'sum', tex: '\\sum_{i=1}^{n} i', visible: ['∑', 'i', '1', 'n'] },
  { name: 'integral', tex: '\\int_0^1 f(x)\\,dx', visible: ['∫', '0', '1', 'd', 'x'] },
  { name: 'matrix', tex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', visible: ['a', 'b', 'c', 'd'] },
  { name: 'bmatrix', tex: '\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}', visible: ['1', '0', '[', ']'] },
  { name: 'aligned', tex: '\\begin{aligned} x &= 1 \\\\ y &= 2 \\end{aligned}', visible: ['x', '1', 'y', '2'] },
  { name: 'cases', tex: '\\begin{cases} 1 & x > 0 \\\\ 0 & x \\le 0 \\end{cases}', visible: ['1', '0', 'x'] },
  { name: 'array', tex: '\\begin{array}{cc} 1 & 2 \\\\ 3 & 4 \\end{array}', visible: ['1', '2', '3', '4'] },
  { name: 'accents', tex: '\\hat{x} \\bar{y} \\vec{v} \\dot{a} \\ddot{b} \\tilde{c} \\overline{d} \\underline{e}', visible: ['x', 'y', 'v', 'a', 'b', 'c', 'd', 'e'] },
  { name: 'left-right', tex: '\\left( \\frac{1}{2} \\right)', visible: ['1', '2'] },
  { name: 'left-right brackets', tex: '\\left[ \\sqrt{x} \\right]', visible: ['x', '[', ']'] },
  { name: 'invisible delimiter', tex: '\\left. x \\right|', visible: ['x', '|'] },
  { name: 'big delimiters', tex: '\\Bigl\\{ x \\Bigr\\}', visible: ['x', '{', '}'] },
  { name: 'big delimiter family', tex: '\\big( \\Big[ \\bigg| \\Bigg\\rangle', visible: ['(', '[', '|', '⟩'] },
  { name: 'inline delimiters', tex: '\\langle x \\rangle', visible: ['x', '⟨', '⟩'] },
  { name: 'greek', tex: '\\alpha + \\beta = \\Gamma', visible: ['α', 'β', 'Γ'] },
  { name: 'greek variants', tex: '\\varepsilon \\varphi \\vartheta \\varrho \\varsigma \\varnothing', visible: ['ε', 'φ', 'ϑ', 'ϱ', 'ς', '∅'] },
  { name: 'relations', tex: 'a \\le b \\ne c \\in D', visible: ['a', 'b', 'c', 'D', '≤', '≠', '∈'] },
  { name: 'text', tex: '\\text{hello world}', visible: ['hello world'] },
  { name: 'operatorname', tex: '\\operatorname{argmax}_{x} f(x)', visible: ['argmax', 'x', 'f'] },
  { name: 'font variants', tex: '\\mathrm{d} \\mathbf{v} \\mathit{x} \\mathsf{S} \\mathtt{T} \\mathcal{L} \\mathbb{R}', visible: ['d', 'v', 'x', 'S', 'T', 'L', 'R'] },
  { name: 'escaped symbols', tex: '\\{ x \\} 50\\%', visible: ['{', '}', '50', '%'] },
  { name: 'spacing', tex: 'a\\quad b\\, c\\; d\\! e', visible: ['a', 'b', 'c', 'd', 'e'] },
  { name: 'escaped space', tex: 'a\\ b', visible: ['a', 'b'] },
  { name: 'binom', tex: '\\binom{n}{k}', visible: ['n', 'k'] },
  { name: 'unknown command', tex: '\\foo x', visible: ['foo', 'x'] },
  { name: 'unbalanced braces', tex: '\\frac{1}{2', visible: ['1', '2'] },
  { name: 'stray closing brace', tex: 'x }', visible: ['x', '}'] },
  { name: 'display style', tex: '\\displaystyle \\sum_{k=0}^{n} k', visible: ['∑', '0', 'n', 'k'] },
  { name: 'empty string', tex: '', visible: [] },
  { name: 'whitespace only', tex: '   ', visible: [] },
]

for (const sample of samples) {
  let ast
  try {
    ast = math.parseLatex(sample.tex)
  } catch (error) {
    fail(`parseLatex threw for ${sample.name}: ${error.message}`)
  }
  if (ast === null || typeof ast !== 'object') fail(`${sample.name}: parseLatex did not return an AST object`)

  let nodes
  try {
    nodes = math.latexToNodes(sample.tex)
  } catch (error) {
    fail(`latexToNodes threw for ${sample.name}: ${error.message}`)
  }
  if (!Array.isArray(nodes)) fail(`${sample.name}: latexToNodes did not return an array`)
  assertSafe(nodes, sample.name)

  const text = flatten(nodes)
  for (const visible of sample.visible) {
    if (!text.includes(visible)) fail(`${sample.name}: missing visible text ${JSON.stringify(visible)} in ${JSON.stringify(text)}`)
  }
}

// Unknown commands must stay visible as text and never break rendering.
const unknown = flatten(math.latexToNodes('\\foo{bar}'))
if (!unknown.includes('foo') || !unknown.includes('bar')) fail(`unknown command lost text: ${JSON.stringify(unknown)}`)
const unknownNodeClass = String(math.latexToNodes('\\foo{bar}')[0]?.props?.className || '')
if (!unknownNodeClass.includes('dsc-math-fallback')) fail(`unknown command did not use the fallback: ${unknownNodeClass}`)

// Unsupported environments also fall back to the complete source, rather than
// being silently rendered as a matrix.
const unknownEnvSource = '\\begin{unknownenv} a & b \\\\ c & d \\end{unknownenv}'
const unknownEnvNodes = math.latexToNodes(unknownEnvSource)
if (flatten(unknownEnvNodes) !== unknownEnvSource) fail('unknown environment lost its source text')
const unknownEnvClass = String(unknownEnvNodes[0]?.props?.className || '')
if (!unknownEnvClass.includes('dsc-math-fallback')) fail(`unknown environment did not use the fallback: ${unknownEnvClass}`)

// A half-streamed bmatrix has no \end yet: never paint a partial grid.
const halfMatrixNodes = math.latexToNodes('\\begin{bmatrix} 1 & 0')
const halfMatrixClass = String(halfMatrixNodes[0]?.props?.className || '')
if (!halfMatrixClass.includes('dsc-math-fallback')) fail(`unclosed bmatrix did not use the fallback: ${halfMatrixClass}`)
if (!flatten(halfMatrixNodes).includes('\\begin{bmatrix}')) fail('unclosed bmatrix lost its source text')

// Common metadata commands are accepted and ignored instead of forcing the
// whole formula into the fallback.
for (const tex of ['x \\tag{1}', '\\begin{aligned} x &= 1 \\\\ y &= 2 \\end{aligned}', '\\begin{array}{cc} a & b \\\\ c & d \\end{array}']) {
  const nodes = math.latexToNodes(tex)
  const classes = String(nodes[0]?.props?.className || '')
  if (classes.includes('dsc-math-fallback')) fail(`supported construct used the fallback: ${tex}`)
}

// Genuinely invalid input renders the error fallback and keeps the source text.
const invalidSource = '\\left( x'
let invalidThrew = false
try {
  math.parseLatex(invalidSource)
} catch (error) {
  invalidThrew = true
}
if (!invalidThrew) fail('parseLatex should reject an unmatched \\left')
const invalidNodes = math.latexToNodes(invalidSource)
if (!Array.isArray(invalidNodes) || invalidNodes.length !== 1) fail('invalid input did not return a single fallback node')
const invalidClass = String(invalidNodes[0].props.className || '')
if (!invalidClass.includes('dsc-math-error')) fail(`invalid input did not use the error fallback: ${invalidClass}`)
if (!flatten(invalidNodes).includes(invalidSource)) fail('invalid input lost its source text')
assertSafe(invalidNodes, 'invalid input')

// Ordinary unbalanced braces must not throw and must keep their content.
for (const tex of ['{x', 'x}', '{{{{x}}', '\\sqrt{x', '\\begin{matrix} a & b']) {
  try {
    math.parseLatex(tex)
    const nodes = math.latexToNodes(tex)
    if (!flatten(nodes).includes('x') && !flatten(nodes).includes('a')) fail(`unbalanced input lost content: ${tex}`)
    assertSafe(nodes, 'unbalanced')
  } catch (error) {
    fail(`unbalanced input threw for ${JSON.stringify(tex)}: ${error.message}`)
  }
}

// Depth guard: 200 nested braces degrade to text instead of overflowing.
const deep = '{'.repeat(200) + 'x' + '}'.repeat(200)
let deepNodes
try {
  math.parseLatex(deep)
  deepNodes = math.latexToNodes(deep)
} catch (error) {
  fail(`depth guard threw: ${error.message}`)
}
if (!flatten(deepNodes).includes('x')) fail('depth guard lost the nested content')
assertSafe(deepNodes, 'deep nesting')

const deeper = '{'.repeat(2000) + 'y' + '}'.repeat(2000)
let deeperNodes
try {
  deeperNodes = math.latexToNodes(deeper)
} catch (error) {
  fail(`deep fallback threw: ${error.message}`)
}
if (!flatten(deeperNodes).includes('y')) fail('deep fallback lost the nested content')

// Very long input falls back to plain text.
const longSource = '\\frac{1}{2}'.repeat(3000)
const longAst = math.parseLatex(longSource)
if (longAst.type !== 'plain') fail(`long input should use the plain fallback, got ${longAst.type}`)
const longNodes = math.latexToNodes(longSource)
if (!Array.isArray(longNodes)) fail('long input did not return an array')
if (!flatten(longNodes).includes('\\frac{1}{2}')) fail('long input lost its source text')
assertSafe(longNodes, 'long input')

// Components wrap the rendered nodes with the documented classes.
const inline = math.LatexInline({ tex: 'x^2' })
if (inline.type !== 'span' || inline.props.className !== 'dsc-math dsc-math-inline') fail('LatexInline wrapper is wrong')
if (!flatten(inline).includes('x')) fail('LatexInline lost content')
const block = math.LatexBlock({ tex: '\\frac{1}{2}' })
if (block.type !== 'div' || block.props.className !== 'dsc-math dsc-math-block') fail('LatexBlock wrapper is wrong')
if (!flatten(block).includes('1') || !flatten(block).includes('2')) fail('LatexBlock lost content')
assertSafe([inline, block], 'components')

console.log('MATH_OK')
