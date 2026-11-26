/**
 * Test-only instrumentation for the built client bundle.
 *
 * The shipped `client.js` stays free of profiling code. This script reads a
 * built bundle, injects render counters at the component boundaries the long-chat
 * investigation cares about, and writes a separate benchmark bundle. Every run
 * (baseline and fixed) receives exactly the same instrumentation, so render
 * counts are comparable. No runtime dependency is added.
 *
 * Usage: node tools/perf/instrument-client.mjs <input.js> <output.js> <bundleId>
 */
import fs from 'node:fs'
import path from 'node:path'

const [input, output, bundleId = 'bundle'] = process.argv.slice(2)
if (!input || !output) {
  console.error('usage: node tools/perf/instrument-client.mjs <input.js> <output.js> <bundleId>')
  process.exit(1)
}

let source = fs.readFileSync(input, 'utf8')
const anchor = '    const Fragment = React.Fragment\n'
if (!source.includes(anchor)) throw new Error('bundle anchor not found')
source = source.replace(anchor, `${anchor}
    globalThis.__DSC_COUNTS__ = Object.create(null)
    globalThis.__DSC_BUNDLE_ID__ = ${JSON.stringify(bundleId)}
    function __dscCount(name) {
      globalThis.__DSC_COUNTS__[name] = (globalThis.__DSC_COUNTS__[name] || 0) + 1
    }
`)

const targets = [
  ['function Thread(', 'Thread'],
  ['function AssistantMessage(', 'AssistantMessage'],
  ['function UserMessage(', 'UserMessage'],
  ['function UserMessageEditor(', 'UserMessageEditor'],
  ['function Markdown(', 'Markdown'],
  ['function Composer(', 'Composer'],
  ['function Sidebar(', 'Sidebar'],
  ['function EmptyState(', 'EmptyState'],
  ['function VersionNav(', 'VersionNav'],
  ['function renderBlocks(', 'renderBlocks'],
  ['function parseMarkdown(', 'parseMarkdown'],
  ['function collectMessageSources(', 'collectMessageSources'],
  ['function answerText(', 'answerText'],
]

const missing = []
for (const [prefix, name] of targets) {
  const pattern = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\n]*\\{$`, 'm')
  const matches = source.match(new RegExp(pattern.source, 'gm'))
  if (!matches || matches.length !== 1) {
    missing.push(`${name}: ${matches ? matches.length : 0} occurrences`)
    continue
  }
  source = source.replace(pattern, (line) => `${line}\n    __dscCount(${JSON.stringify(name)})`)
}

for (const [needle, name] of [['  emit() {', 'store.emit'], ['  set(patch) {', 'store.set']]) {
  const occurrences = source.split(needle).length - 1
  if (occurrences !== 1) {
    missing.push(`${name}: ${occurrences} occurrences`)
    continue
  }
  source = source.replace(needle, `${needle}\n    __dscCount(${JSON.stringify(name)})`)
}
if (missing.length > 0) {
  throw new Error(`instrumentation anchors not unique:\n${missing.join('\n')}`)
}

fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true })
fs.writeFileSync(output, source)
console.log(`instrumented ${output}: ${fs.statSync(output).size} bytes (${targets.length} counters, id=${bundleId})`)
