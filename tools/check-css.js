// Lightweight sanity check for the plugin's hand-written CSS string: balanced
// braces, no obviously broken declarations, and theme-token-only colours.
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../client-src/60-style.js', import.meta.url), 'utf8')
const start = source.indexOf('`')
const end = source.lastIndexOf('`')
const rawCss = source.slice(start + 1, end)
const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, '')
console.log('css bytes', rawCss.length, 'without comments', css.length)
const count = value => (css.match(new RegExp(`\\${value}`, 'g')) ?? []).length
const open = count('{')
const close = count('}')
console.log('css bytes', css.length, 'braces', open, close)
if (open !== close) throw new Error(`unbalanced braces: ${open} !== ${close}`)

const offenders = []
let depth = 0
for (const raw of css.split('\n')) {
  const line = raw.trim()
  if (line === '') continue
  depth += (line.match(/\{/g) ?? []).length
  depth -= (line.match(/\}/g) ?? []).length
  if (depth < 0) offenders.push(`depth<0: ${line}`)
  if (/;\s*;/.test(line)) offenders.push(`double semicolon: ${line}`)
  if (line.startsWith('@media') || line.startsWith('@keyframes') || line.startsWith('/*') || line.startsWith('*')) continue
  if (line.endsWith('{') || line.endsWith('}') || line.endsWith(';') || line.endsWith(',')) continue
  offenders.push(`unterminated: ${line}`)
}
if (offenders.length > 0) {
  console.error(offenders.join('\n'))
  throw new Error(`${offenders.length} suspicious CSS lines`)
}

const hardCoded = css.split('\n').filter(line => (
  /#[0-9a-fA-F]{3,8}\b/.test(line)
  && !/var\(--/.test(line)
  && !/--dsc-/.test(line)
))
if (hardCoded.length > 0) {
  console.error(hardCoded.join('\n'))
  throw new Error('hard-coded colours outside a token fallback')
}
console.log('CSS_OK')
