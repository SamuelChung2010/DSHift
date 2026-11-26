/**
 * End-to-end checks for the Chat Markdown + LaTeX pipeline.
 *
 * The renderer lives in 30-markdown.js (pipeline / protection / blocks),
 * 31-highlight.js (language normalization and code spans) and 32-math.js (TeX
 * subset). This file loads them with a small React shim and exercises the
 * acceptance cases from the Chat formula task: inline math, display math,
 * matrices, aligned equations, \boxed/\qquad, TeX fences, code-protected
 * dollars, graceful fallback, streaming and a many-formula message.
 */
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const context = {}
vm.createContext(context)
context.URL = URL
vm.runInContext(`
globalThis.h = (type, props, ...children) => ({ type, props: props || {}, children })
globalThis.React = {
  createElement: globalThis.h,
  Fragment: Symbol('Fragment'),
  useState: value => [typeof value === 'function' ? value() : value, () => {}],
  useMemo: factory => factory(),
  useRef: value => ({ current: value }),
  useEffect() {},
  useLayoutEffect() {},
  useCallback: factory => factory,
  memo: component => component,
}
globalThis.tr = key => key
globalThis.cx = (...values) => values.filter(Boolean).join(' ')
globalThis.Icon = () => null
globalThis.highlightCode = text => [{ type: 'plain', text }]
globalThis.MermaidDiagram = () => null
globalThis.copyToClipboard = () => Promise.resolve()
`, context)
for (const name of ['32-math.js', '31-highlight.js', '30-markdown.js']) {
  const source = fs.readFileSync(path.join(root, 'client-src', name), 'utf8')
  vm.runInContext(source, context)
}

const { Markdown, parseMarkdown, latexToNodes } = context

function fail(message) {
  throw new Error(message)
}

function flatten(node) {
  if (node === null || node === undefined || node === false) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(flatten).join('')
  if (typeof node !== 'object') return ''
  if (typeof node.type === 'function') return flatten(node.type(node.props || {}))
  return flatten(node.children ?? node.props?.children)
}

function classNames(node) {
  const value = node?.props?.className
  return typeof value === 'string' ? value.split(/\s+/).filter(Boolean) : []
}

function collect(node, name, out = []) {
  if (node === null || node === undefined || node === false) return out
  if (Array.isArray(node)) {
    for (const child of node) collect(child, name, out)
    return out
  }
  if (typeof node !== 'object') return out
  if (typeof node.type === 'function') {
    collect(node.type(node.props || {}), name, out)
    return out
  }
  if (classNames(node).includes(name)) out.push(node)
  collect(node.children ?? node.props?.children, name, out)
  return out
}

function collectType(node, type, out = []) {
  if (node === null || node === undefined || node === false) return out
  if (Array.isArray(node)) {
    for (const child of node) collectType(child, type, out)
    return out
  }
  if (typeof node !== 'object') return out
  if (typeof node.type === 'function') {
    collectType(node.type(node.props || {}), type, out)
    return out
  }
  if (node.type === type) out.push(node)
  collectType(node.children ?? node.props?.children, type, out)
  return out
}

function render(text, options = {}) {
  return Markdown({ text, ...options })
}

function textOf(node) {
  return flatten(node).replace(/\s+/g, ' ').trim()
}

function expectMath(text, inline, block) {
  const tree = render(text)
  const inlineCount = collect(tree, 'dsc-math-inline').length
  const blockCount = collect(tree, 'dsc-math-block').length
  if (inlineCount !== inline) fail(`expected ${inline} inline math, got ${inlineCount}: ${JSON.stringify(text)}`)
  if (blockCount !== block) fail(`expected ${block} block math, got ${blockCount}: ${JSON.stringify(text)}`)
  if (flatten(tree).includes('\u0000')) fail(`placeholder leaked into the DOM: ${JSON.stringify(text)}`)
  return tree
}

function expectNoError(tree, name) {
  if (collect(tree, 'dsc-math-error').length !== 0) fail(`${name} rendered the hard-error fallback`)
}

// ---------------------------------------------------------------------------
// 1. Required formulas
// ---------------------------------------------------------------------------
const euler = expectMath('\\(E=mc^2\\)', 1, 0)
if (!textOf(euler).includes('E=mc2')) fail('E=mc^2 lost its content')
expectNoError(euler, 'E=mc^2')

const quadratic = expectMath('求根公式 $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$。', 1, 0)
if (!textOf(quadratic).includes('±')) fail('quadratic formula lost \\pm')
if (!textOf(quadratic).includes('b2-4ac')) fail('quadratic formula lost the nested radicand')

// The same nested fraction through the \( \) delimiter path.
const parenQuadratic = expectMath('\\(x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\)', 1, 0)
if (!textOf(parenQuadratic).includes('±')) fail('\\( \\) quadratic formula lost \\pm')

const multiInline = expectMath('设 $x = 1$，且 $y = 2$，所以 $x + y = 3$。', 3, 0)
if (!textOf(multiInline).includes('x=1') || !textOf(multiInline).includes('x+y=3')) fail('multiple inline formulas were merged or lost')

const integral = expectMath('\\[ \\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi} \\]', 0, 1)
if (!textOf(integral).includes('∫') || !textOf(integral).includes('∞')) fail('integral lost its symbols')

const limit = expectMath('$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$', 0, 1)
if (!textOf(limit).includes('lim') || !textOf(limit).includes('sin')) fail('limit lost its function names')

const matrix = expectMath(
  '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\cdot \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ax+by \\\\ cx+dy \\end{pmatrix}$$',
  0,
  1,
)
if (!textOf(matrix).includes('⋅')) fail('matrix multiplication lost \\cdot')

const bmatrix = expectMath(
  '$$\\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}$$',
  0,
  1,
)
const bmatrixGrids = collect(bmatrix, 'dsc-math-matrix')
if (bmatrixGrids.length !== 1) fail('bmatrix did not render one grid')
if (bmatrixGrids[0].props.style?.gridTemplateColumns !== 'repeat(3, auto)') fail('bmatrix grid did not pin three columns')
if (collect(bmatrixGrids[0], 'dsc-math-matrix-row', []).length !== 3) fail('bmatrix did not render three rows')
if (collect(bmatrixGrids[0], 'dsc-math-matrix-cell', []).length !== 9) fail('bmatrix did not render nine cells')
if (collect(bmatrix, 'dsc-math-matrix-bracket-left').length !== 1 || collect(bmatrix, 'dsc-math-matrix-bracket-right').length !== 1) {
  fail('bmatrix did not draw both square brackets')
}
if (!textOf(bmatrix).includes('[') || !textOf(bmatrix).includes(']')) fail('bmatrix lost its bracket text')
if (collect(bmatrix, 'dsc-math-fallback').length !== 0 || collect(bmatrix, 'dsc-math-error').length !== 0) fail('bmatrix used a fallback')

// A display delimiter that closes before \end{bmatrix} must not paint a half
// matrix; the complete source is shown in the quiet fallback instead.
const halfBmatrix = render('$$\\begin{bmatrix} 1 & 0 \\\\ 0 & 1$$')
if (collect(halfBmatrix, 'dsc-math-matrix').length !== 0) fail('half bmatrix rendered a matrix')
if (collect(halfBmatrix, 'dsc-math-fallback').length !== 1) fail('half bmatrix did not fall back to source')
if (!textOf(halfBmatrix).includes('\\begin{bmatrix}')) fail('half bmatrix lost its source text')

const maxwell = expectMath(
  '$$\\begin{aligned} \\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} \\\\ '
  + '\\nabla \\cdot \\mathbf{B} &= 0 \\\\ '
  + '\\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\ '
  + '\\nabla \\times \\mathbf{B} &= \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t} \\end{aligned}$$',
  0,
  1,
)
if (!textOf(maxwell).includes('∇') || !textOf(maxwell).includes('∂')) fail('aligned Maxwell equations lost their operators')

// A display block surrounded by prose must remain its own block.
const separated = parseMarkdown('推导如下\n$$x^2$$\n结束')
if (separated.length !== 3 || separated[0].type !== 'paragraph' || separated[1].type !== 'math' || separated[2].type !== 'paragraph') {
  fail(`display math between paragraphs did not split cleanly: ${JSON.stringify(separated)}`)
}

// Two display formulas on one line stay two formulas, not one merged pair.
const sideBySide = expectMath('$$a$$ 与 $$b$$', 0, 2)
if (!textOf(sideBySide).includes('a') || !textOf(sideBySide).includes('b')) fail('side-by-side display math lost a formula')

// Unicode inside \text survives the placeholder encoding.
const unicodeMath = expectMath('\\(\\text{速度} = \\frac{d}{t}\\)', 1, 0)
if (!textOf(unicodeMath).includes('速度')) fail('Unicode inside \\text was lost')

// A display formula can own several lines.
const multiline = expectMath('$$\n\\begin{aligned}\na &= 1 \\\\\nb &= 2\n\\end{aligned}\n$$', 0, 1)
if (!textOf(multiline).includes('a=1')) fail('multiline display formula lost a row')
const table = render('| 项目 | 内容 |\n| --- | --- |\n| 公式 | $x^2$ |\n| 价格 | `$5` |')
if (collect(table, 'dsc-table').length !== 1) fail('a table with math/code did not render')
if (collect(table, 'dsc-math-inline').length !== 1) fail('table math did not render')
if (!textOf(table).includes('$5')) fail('table code lost its dollar text')

// Inline fallback keeps the original command and still uses the quiet class.
const inlineFallback = render('结果 $\\unknownmacro{x}$ 结束')
if (collect(inlineFallback, 'dsc-math-fallback').length !== 1) fail('inline unsupported command did not use the fallback')
if (!textOf(inlineFallback).includes('\\unknownmacro{x}')) fail('inline unsupported command lost its source')

// A multi-line display formula inside a quote still belongs to the quote.
const quoted = render('> $$\n> x^2\n> $$')
if (collect(quoted, 'dsc-quote').length !== 1) fail('quoted display math lost the quote')
if (collect(quoted, 'dsc-math-block').length !== 1) fail('quoted display math did not render')

// ---------------------------------------------------------------------------
// 1b. \boxed, \qquad, top-level line breaks and TeX fences
// ---------------------------------------------------------------------------
// The single-boxed acceptance formula must render as a framed equation, never
// as the grey monospace source fallback.
const boxed = expectMath('$$\\boxed{\\theta_{X1}<\\theta_{Y1}<\\theta_{X2}}$$', 0, 1)
if (collect(boxed, 'dsc-math-boxed').length !== 1) fail('single \\boxed line did not render one frame')
if (collect(boxed, 'dsc-math-fallback').length !== 0 || collect(boxed, 'dsc-math-error').length !== 0) {
  fail('single \\boxed formula used a source fallback')
}
if (textOf(boxed).includes('\\boxed') || textOf(boxed).includes('\\theta')) fail(`single \\boxed kept its source: ${textOf(boxed)}`)
if (!textOf(boxed).includes('θX1<θY1<θX2')) fail(`single \\boxed lost its content: ${textOf(boxed)}`)

// Two lines of framed formulas separated by \qquad: two rows, real 2em gaps,
// and definitely not a code block.
const boxedRows = expectMath(
  '$$\n\\boxed{\\theta_{X1}<\\theta_{Y1}} \\qquad \\boxed{\\theta_{X2}<\\theta_{Y2}} \\\\\n'
  + '\\boxed{\\theta_{Y1}<\\theta_{X2}} \\qquad \\boxed{\\theta_{Y2}<\\theta_{X1}}\n$$',
  0,
  1,
)
if (collect(boxedRows, 'dsc-math-boxed').length !== 4) fail('two-line \\boxed formula did not render four frames')
if (collect(boxedRows, 'dsc-math-rowbreak').length !== 1) fail('top-level \\\\ in display math did not break the line')
if (collect(boxedRows, 'dsc-math-space').length !== 2) fail('two \\qquad gaps did not render as spaces')
for (const space of collect(boxedRows, 'dsc-math-space')) {
  if (space.props.style?.width !== '2.0000em') fail(`\\qquad did not render a 2em space: ${JSON.stringify(space.props.style)}`)
}
if (collect(boxedRows, 'dsc-math-fallback').length !== 0) fail('two-line \\boxed formula used the source fallback')
if (collect(boxedRows, 'dsc-code').length !== 0) fail('two-line \\boxed formula rendered as a code block')
if (textOf(boxedRows).includes('\\boxed') || textOf(boxedRows).includes('\\qquad')) fail('two-line \\boxed formula kept its source')

// A fence tagged latex / math / tex is TeX, not code: the body goes straight to
// the block renderer, including multi-line alignment and wrapped $$ delimiters.
const fencedLatex = render('```latex\n\\boxed{\\theta_{X1}=1}\n```')
if (collect(fencedLatex, 'dsc-code').length !== 0) fail('latex fence rendered as a code block')
if (collect(fencedLatex, 'dsc-math-block').length !== 1) fail('latex fence did not render a math block')
if (collect(fencedLatex, 'dsc-math-boxed').length !== 1) fail('latex fence lost \\boxed')
if (!textOf(fencedLatex).includes('θX1=1')) fail('latex fence lost its formula')

const fencedMath = render('~~~math\n\\begin{aligned}\na &= 1 \\\\\nb &= 2\n\\end{aligned}\n~~~')
if (collect(fencedMath, 'dsc-code').length !== 0) fail('math fence rendered as a code block')
if (collect(fencedMath, 'dsc-math-block').length !== 1) fail('math fence did not render a math block')
if (collect(fencedMath, 'dsc-math-matrix').length !== 1) fail('multiline math fence did not render its rows')
if (collect(fencedMath, 'dsc-math-matrix-cell').length !== 4) fail('multiline math fence lost a cell')

const fencedTex = render('```tex\nE = mc^2\n```')
if (collect(fencedTex, 'dsc-code').length !== 0) fail('tex fence rendered as a code block')
if (collect(fencedTex, 'dsc-math-block').length !== 1) fail('tex fence did not render a math block')

// Language tags are matched without normalizeCodeLang(), which maps unknown
// languages to "text"; the language- prefix and mixed case still count.
const fencedAlias = render('```language-latex\n\\boxed{x}\n```')
if (collect(fencedAlias, 'dsc-code').length !== 0) fail('language-latex fence rendered as a code block')
if (collect(fencedAlias, 'dsc-math-boxed').length !== 1) fail('language-latex fence did not render a frame')
const fencedUpper = render('~~~TeX\nE = mc^2\n~~~')
if (collect(fencedUpper, 'dsc-code').length !== 0) fail('mixed-case TeX fence rendered as a code block')
if (collect(fencedUpper, 'dsc-math-block').length !== 1) fail('mixed-case TeX fence did not render a math block')

const fencedWrapped = render('```latex\n$$\n\\boxed{x}\n$$\n```')
if (collect(fencedWrapped, 'dsc-code').length !== 0) fail('wrapped latex fence rendered as a code block')
if (collect(fencedWrapped, 'dsc-math-boxed').length !== 1) fail('wrapped latex fence kept its $$ delimiters')
if (textOf(fencedWrapped).includes('$$')) fail('wrapped latex fence leaked $$ delimiters')

// While the TeX fence is still open the body stays literal; the completed fence
// swaps to the formula without a code block in between.
const openFence = render('```latex\n\\boxed{x', { streaming: true })
if (collect(openFence, 'dsc-code').length !== 0) fail('streaming latex fence rendered as code')
if (collect(openFence, 'dsc-math-boxed').length !== 0) fail('streaming latex fence painted a half \\boxed')
if (collect(openFence, 'dsc-math-streaming').length !== 1) fail('streaming latex fence lost its stable block')
const closedFence = render('```latex\n\\boxed{x}\n```', { streaming: true })
if (collect(closedFence, 'dsc-code').length !== 0) fail('closed latex fence rendered as code')
if (collect(closedFence, 'dsc-math-boxed').length !== 1) fail('closed latex fence did not render its frame')
if (collect(closedFence, 'dsc-math-streaming').length !== 0) fail('closed latex fence kept the streaming shell')

// Streaming a $$ ... $$ boxed formula: every incomplete prefix stays plain
// source, and the closing $$ swaps the whole run in one step.
const boxedSource = '$$\\boxed{\\theta_{X1}<\\theta_{Y1}<\\theta_{X2}}$$'
for (let end = 1; end < boxedSource.length; end += 1) {
  const prefix = boxedSource.slice(0, end)
  const tree = render(prefix, { streaming: true })
  if (collect(tree, 'dsc-math-boxed').length !== 0) fail(`boxed prefix painted a frame: ${JSON.stringify(prefix)}`)
  if (collect(tree, 'dsc-math-error').length !== 0) fail(`boxed prefix hit the hard error: ${JSON.stringify(prefix)}`)
}
for (const prefix of ['$$', '$$\\boxed', '$$\\boxed{', '$$\\boxed{\\theta_{X1}', '$$\\boxed{\\theta_{X1}<']) {
  const tree = render(prefix, { streaming: true })
  if (!flatten(tree).includes(prefix.slice(2))) fail(`streaming prefix lost its source: ${JSON.stringify(prefix)}`)
}
const boxedStreamClosed = render(boxedSource, { streaming: true })
if (collect(boxedStreamClosed, 'dsc-math-boxed').length !== 1) fail('closed boxed stream did not render its frame')
if (collect(boxedStreamClosed, 'dsc-math-streaming').length !== 0) fail('closed boxed stream kept the streaming shell')
if (collect(boxedStreamClosed, 'dsc-math-fallback').length !== 0) fail('closed boxed stream kept source residue')

// A $$ closer that arrives while \boxed{ is still open must not paint a box
// around the half formula either.
const halfBoxed = render('$$\\boxed{\\theta_{X1}$$', { streaming: true })
if (collect(halfBoxed, 'dsc-math-boxed').length !== 0) fail('half \\boxed painted a frame')
if (collect(halfBoxed, 'dsc-math-streaming').length !== 1) fail('half \\boxed lost its stable block')
if (!textOf(halfBoxed).includes('\\boxed{\\theta_{X1}')) fail('half \\boxed lost its source text')

// The same open-group rule applies to inline math and to display delimiters
// embedded in a paragraph: the source stays literal until the brace arrives.
for (const [label, source] of [
  ['dollar inline', '未闭合 $\\boxed{x$ 结束'],
  ['paren inline', '未闭合 \\(\\boxed{x\\) 结束'],
  ['paragraph display', '前文 $$\\boxed{x$$ 后文'],
]) {
  const tree = render(source, { streaming: true })
  if (collect(tree, 'dsc-math-boxed').length !== 0) fail(`${label}: half \\boxed painted a frame`)
  if (collect(tree, 'dsc-math-inline').length !== 0) fail(`${label}: half \\boxed rendered inline math`)
  if (collect(tree, 'dsc-math-block').length !== 0) fail(`${label}: half \\boxed rendered a math block`)
  if (!textOf(tree).includes('\\boxed{x')) fail(`${label}: half \\boxed lost its source`)
}
const inlineBoxed = expectMath('结果 $\\boxed{x}$ 结束', 1, 0)
if (collect(inlineBoxed, 'dsc-math-boxed').length !== 1) fail('inline \\boxed did not render a frame')
if (!textOf(inlineBoxed).includes('结果') || !textOf(inlineBoxed).includes('结束')) fail('inline \\boxed lost surrounding text')

// ---------------------------------------------------------------------------
// 2. Code protection
// ---------------------------------------------------------------------------
const code = render('```js\nconst price = "$5";\nconst tex = `$x$`;\n```')
if (collect(code, 'dsc-code').length !== 1) fail('fenced code block did not render')
if (collect(code, 'dsc-math-inline').length !== 0) fail('math was parsed inside a fenced code block')
if (!textOf(code).includes('const price = "$5";')) fail('fenced code lost its dollar amount')
if (!textOf(code).includes('const tex = `$x$`;')) fail('fenced code lost its backticks')

const inlineCode = expectMath('价格 `const price = "$5"` 与 `$x$` 不是公式。', 0, 0)
if (!textOf(inlineCode).includes('$5')) fail('inline code lost its dollar amount')
if (!textOf(inlineCode).includes('$x$')) fail('inline code lost a formula-looking snippet')
const exactInlineCode = render('行内代码测试： `const a = "$5";` 结束')
const inlineCodeNodes = collect(exactInlineCode, 'dsc-inline-code')
if (inlineCodeNodes.length !== 1) fail('inline code did not render exactly one <code> element')
if (flatten(inlineCodeNodes[0]) !== 'const a = "$5";') fail(`inline code content is wrong: ${JSON.stringify(flatten(inlineCodeNodes[0]))}`)
if (textOf(exactInlineCode).includes('code:')) fail('inline code leaked the internal code: prefix')

const unclosedCode = render('正在输出 `$x$ +')
if (collect(unclosedCode, 'dsc-math-inline').length !== 0) fail('math was parsed inside unclosed streaming code')

// ---------------------------------------------------------------------------
// 3. Graceful fallback
// ---------------------------------------------------------------------------
const unknownEnv = render('$$\\begin{unknownenv} a & b \\\\ c & d \\end{unknownenv}$$')
if (collect(unknownEnv, 'dsc-math-fallback').length !== 1) fail('unknown environment did not use the fallback')
if (collect(unknownEnv, 'dsc-math-error').length !== 0) fail('unknown environment rendered as a hard error')
if (!textOf(unknownEnv).includes('\\begin{unknownenv}')) fail('unknown environment lost its source text')

const unknownCmd = expectMath('$$\\foo{x} + \\frac{1}{2}$$', 0, 1)
if (collect(unknownCmd, 'dsc-math-fallback').length !== 1) fail('unknown command did not use the fallback')
if (!textOf(unknownCmd).includes('\\foo{x}')) fail('unknown command lost its source text')

const unsupportedNodes = latexToNodes('\\foo{x} + 1')
if (unsupportedNodes.length !== 1) fail('unsupported formula did not return exactly one fallback node')
if (!classNames(unsupportedNodes[0]).includes('dsc-math-fallback')) fail('unsupported formula used the wrong fallback class')

// ---------------------------------------------------------------------------
// 4. Streaming stability
// ---------------------------------------------------------------------------
for (const streamingText of ['正在生成 $x +', '正在生成 $$\\frac{1}{2}', '正在生成 \\[ \\frac{1}{2}']) {
  const tree = render(streamingText, { streaming: true })
  if (collect(tree, 'dsc-math-inline').length !== 0 || collect(tree, 'dsc-math-block').length !== 0) {
    fail(`unclosed formula rendered during streaming: ${JSON.stringify(streamingText)}`)
  }
  if (!textOf(tree).includes('正在生成')) fail(`streaming text was lost: ${JSON.stringify(streamingText)}`)
}
const closedStream = render('正在生成 $x + y$', { streaming: true })
if (collect(closedStream, 'dsc-math-inline').length !== 1) fail('a closed formula did not render after streaming')

// A half-streamed display matrix stays literal in a same-shaped block, then
// switches to the real 2x2 grid once the closer arrives.
const halfStream = render('$$ \\begin{bmatrix} 1 &', { streaming: true })
if (collect(halfStream, 'dsc-math-matrix').length !== 0) fail('half-streamed bmatrix rendered a matrix')
if (collect(halfStream, 'dsc-math-streaming').length !== 1) fail('half-streamed display math did not keep a stable block')
if (collect(halfStream, 'dsc-math-fallback').length !== 1) fail('half-streamed display math did not show source')
if (!textOf(halfStream).includes('\\begin{bmatrix}')) fail('half-streamed display math lost its source')
const halfStreamText = flatten(halfStream)
if (halfStreamText.split('\\begin{bmatrix}').length !== 2) fail('half-streamed display math duplicated its source line')
const fullStream = render('$$ \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$$')
if (collect(fullStream, 'dsc-math-matrix').length !== 1) fail('completed bmatrix did not render after streaming')
if (collect(fullStream, 'dsc-math-streaming').length !== 0) fail('completed bmatrix kept the streaming placeholder')

// ---------------------------------------------------------------------------
// 5. Many complex blocks
// ---------------------------------------------------------------------------
const many = Array.from({ length: 14 }, (_, index) => (
  `$$\\begin{aligned} \\sum_{k=0}^{${index}} k &= \\frac{${index + 1}}{2} \\\\ `
  + `\\int_0^{${index}} x^2\\,dx &= \\sqrt{${index + 1}} \\end{aligned}$$`
)).join('\n')
const manyTree = render(many)
if (collect(manyTree, 'dsc-math-block').length !== 14) fail('a 14-block message did not render all blocks')
if (collect(manyTree, 'dsc-math-fallback').length !== 0) fail('supported blocks used the fallback')
if (collect(manyTree, 'dsc-math-error').length !== 0) fail('supported blocks used the hard error')

// ---------------------------------------------------------------------------
// 6. Currency and general Markdown are not disturbed
// ---------------------------------------------------------------------------
expectMath('价格 $5 和 $10，不是公式。', 0, 0)
expectMath('$5+$10 与 $5,$10 也不是公式。', 0, 0)
const ordinary = render('**粗体** 与 *斜体*、`code`、[链接](https://example.test)')
if (!textOf(ordinary).includes('粗体') || !textOf(ordinary).includes('链接')) fail('ordinary Markdown regressed')
if (collect(ordinary, 'dsc-math-inline').length !== 0) fail('ordinary Markdown produced math')
const image = render('![值 $x$](https://example.test/a.png)')
const images = collect(image, 'dsc-image')
if (images.length !== 1 || !String(images[0].props.alt).includes('$x$')) fail('image alt lost math-looking text')

// The exact acceptance regressions that already passed before the boxed work.
const boldMath = render('**\\(E = mc^2\\)**')
if (collectType(boldMath, 'strong').length !== 1) fail('bold inline math lost its <strong>')
if (collect(boldMath, 'dsc-math-inline').length !== 1) fail('bold inline math lost the formula')
if (collect(boldMath, 'dsc-math-fallback').length !== 0) fail('bold inline math used a fallback')

const textFormula = render('$$\\text{如果 } x > 0$$')
if (collect(textFormula, 'dsc-math-block').length !== 1) fail('\\text formula did not render as a block')
if (collect(textFormula, 'dsc-math-text').length !== 1) fail('\\text did not render one text run')
if (!textOf(textFormula).includes('如果') || !textOf(textFormula).includes('x>0')) fail('\\text formula lost its content')

const jsDollars = render('```js\nconst price = "$100";\nconst tex = "$$x$$";\n```')
if (collect(jsDollars, 'dsc-code').length !== 1) fail('JS code block with $$ stopped rendering as code')
if (collect(jsDollars, 'dsc-math-inline').length !== 0 || collect(jsDollars, 'dsc-math-block').length !== 0) {
  fail('math was parsed inside a JS code block')
}
if (!textOf(jsDollars).includes('const price = "$100";') || !textOf(jsDollars).includes('const tex = "$$x$$";')) {
  fail('JS code block lost a dollar amount')
}

const inlineCodeExact = render('价格 `const a = "$5";` 结束')
if (collect(inlineCodeExact, 'dsc-inline-code').length !== 1) fail('inline code stopped rendering')
if (collect(inlineCodeExact, 'dsc-math-inline').length !== 0) fail('inline code leaked math')
if (!textOf(inlineCodeExact).includes('const a = "$5";')) fail('inline code lost its dollar amount')

console.log('CHAT_MATH_OK')
