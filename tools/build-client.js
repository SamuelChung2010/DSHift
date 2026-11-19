import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const parts = [
  '10-locale.js',
  '20-store.js',
  '30-markdown.js',
  '31-highlight.js',
  '32-math.js',
  '33-mermaid.js',
  '40-icons.js',
  '43-popover.js',
  '45-brand.js',
  '47-model.js',
  '48-tools.js',
  '50-components.js',
  '55-dialogs.js',
  '60-style.js',
  '70-main.js',
]
const body = parts.map((name) => {
  const source = readFileSync(path.join(root, 'client-src', name), 'utf8')
  if (/^\s*(import|export)\s/m.test(source)) {
    throw new Error(`${name} contains an import/export statement`)
  }
  return `/* ---- ${name} ---- */\n${source.trimEnd()}`
}).join('\n\n')

const output = `window.__ModuleLoader__.load({
  id: '@local/deepseek-chat-mode',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const Fragment = React.Fragment

${body}

    return { inject: ['slots', 'locale'], apply }
  },
})
`

writeFileSync(path.join(root, 'client.js'), output)
console.log(`client.js written: ${output.length} bytes`)
