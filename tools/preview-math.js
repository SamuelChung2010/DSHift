/**
 * Visual preview for the Chat Markdown + LaTeX renderer.
 *
 * Loads the real 30-markdown.js / 32-math.js under a small React shim, renders
 * the acceptance samples to a plain virtual tree, serialises that tree to HTML
 * and embeds the real Chat stylesheet (60-style.js). The result is a static
 * page that shows exactly what the plugin would paint; screenshot it with a
 * headless browser (see below).
 *
 * Usage:
 *   node tools/preview-math.js
 *   chrome --headless=new --screenshot=docs/x.png docs/.preview/x.html
 */
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const context = {}
vm.createContext(context)
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
globalThis.normalizeCodeLang = value => String(value || '').trim().toLowerCase()
globalThis.highlightCode = text => [{ type: 'plain', text }]
globalThis.MermaidDiagram = () => null
globalThis.copyToClipboard = () => Promise.resolve()
`, context)
for (const name of ['32-math.js', '30-markdown.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'client-src', name), 'utf8'), context)
}

const { Markdown } = context
const styleSource = fs.readFileSync(path.join(root, 'client-src/60-style.js'), 'utf8')
const chatCss = styleSource.slice(styleSource.indexOf('`') + 1, styleSource.lastIndexOf('`'))

const samples = [
  {
    id: 'boxed-single',
    eyebrow: 'Chat · 公式渲染',
    text: '$$\\boxed{\\theta_{X1}<\\theta_{Y1}<\\theta_{X2}}$$',
    width: 1000,
    height: 440,
  },
  {
    id: 'boxed-qquad',
    eyebrow: 'Chat · 公式渲染',
    text: '$$\n\\boxed{\\theta_{X1}<\\theta_{Y1}} \\qquad \\boxed{\\theta_{X2}<\\theta_{Y2}} \\\\\n'
      + '\\boxed{\\theta_{Y1}<\\theta_{X2}} \\qquad \\boxed{\\theta_{Y2}<\\theta_{X1}}\n$$',
    width: 1000,
    height: 520,
  },
]

const ATTRS = ['className', 'role', 'title', 'aria-hidden', 'alt', 'src']
const VOID_TAGS = new Set(['img', 'br', 'hr', 'input'])

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function styleText(style) {
  if (style === null || typeof style !== 'object') return ''
  return Object.entries(style).map(([name, value]) => {
    if (value === null || value === undefined || value === '') return ''
    const property = name.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)
    return `${property}:${value}`
  }).filter(Boolean).join(';')
}

function renderNode(node, out) {
  if (node === null || node === undefined || node === false || node === true) return
  if (typeof node === 'string' || typeof node === 'number') {
    out.push(escapeHtml(node))
    return
  }
  if (Array.isArray(node)) {
    for (const child of node) renderNode(child, out)
    return
  }
  if (typeof node !== 'object') return
  if (typeof node.type === 'function') {
    renderNode(node.type(node.props || {}), out)
    return
  }
  if (typeof node.type !== 'string') {
    renderNode(node.children ?? node.props?.children, out)
    return
  }
  const attributes = [` class="${escapeHtml(node.props?.className ?? '')}"`.replace('class=""', '')]
  for (const name of ATTRS) {
    const value = node.props?.[name]
    if (value === null || value === undefined || value === '') continue
    if (name === 'className') continue
    attributes.push(` ${name}="${escapeHtml(value)}"`)
  }
  const style = styleText(node.props?.style)
  if (style !== '') attributes.push(` style="${escapeHtml(style)}"`)
  out.push(`<${node.type}${attributes.join('')}>`)
  if (!VOID_TAGS.has(node.type)) {
    renderNode(node.children ?? node.props?.children, out)
    out.push(`</${node.type}>`)
  }
}

function page(sample, body) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${escapeHtml(sample.id)}</title>
<style>${chatCss}
html, body { margin: 0; padding: 0; overflow: hidden; }
body {
  background: #eef0f5;
  color: #16181d;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
}
.preview-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 48px; }
.preview-card {
  box-sizing: border-box;
  width: ${sample.width - 220}px;
  max-width: calc(100vw - 96px);
  padding: 30px 38px 34px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(9, 12, 20, 0.12);
}
.preview-eyebrow {
  margin: 0 0 16px;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7b8494;
}
html body .preview-card .dsc-root {
  position: static;
  inset: auto;
  display: block;
  min-height: 0;
  height: auto;
  overflow: visible;
  background: transparent;
  padding: 0;
  z-index: auto;
}
.preview-card .dsc-md { font-size: 20px; }
.preview-card .dsc-math-block {
  margin: 0;
  min-height: 0;
  padding: 30px;
  background: #f7f8fb;
}
</style>
</head>
<body>
<div class="preview-page">
  <div class="preview-card">
    <p class="preview-eyebrow">${escapeHtml(sample.eyebrow)}</p>
    <div class="dsc-root">
      ${body}
    </div>
  </div>
</div>
</body>
</html>
`
}

const outDir = path.join(root, 'docs', '.preview')
fs.mkdirSync(outDir, { recursive: true })
for (const sample of samples) {
  const tree = Markdown({ text: sample.text })
  const parts = []
  renderNode(tree, parts)
  const body = parts.join('')
  if (body.includes('dsc-math-fallback')) {
    throw new Error(`${sample.id}: preview fell back to raw LaTeX source`)
  }
  const file = path.join(outDir, `${sample.id}.html`)
  fs.writeFileSync(file, page(sample, body))
  const size = `${sample.width}x${sample.height}`
  console.log(`${sample.id}\t${size}\t${file}`)
}
