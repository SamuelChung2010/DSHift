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
  if (line.endsWith('{') || line.endsWith('}') || line.endsWith(';') || line.endsWith(',') || line.endsWith(':')) continue
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

// Required math rules: \boxed frames, top-level line breaks, and a serif face
// for the formula container (the fallback must never paint formulas as code).
const boxedRule = css.match(/\.dsc-math-boxed\s*\{([^}]*)\}/)
if (boxedRule === null) throw new Error('missing .dsc-math-boxed rule')
for (const declaration of ['display: inline-block', 'border: 1.5px solid currentColor', 'padding: 2px 6px', 'border-radius: 4px']) {
  if (!boxedRule[1].includes(declaration)) throw new Error(`.dsc-math-boxed is missing "${declaration}"`)
}
const rowbreakRule = css.match(/\.dsc-math-rowbreak\s*\{([^}]*)\}/)
if (rowbreakRule === null || !rowbreakRule[1].includes('flex: 0 0 100%')) {
  throw new Error('missing full-width .dsc-math-rowbreak rule')
}
const mathRule = css.match(/\.dsc-math\s*\{([^}]*)\}/)
if (mathRule === null) throw new Error('missing .dsc-math rule')
const mathFont = mathRule[1].match(/font-family:([^;]*);/)
if (mathFont === null
  || !mathFont[1].includes('Times New Roman')
  || !mathFont[1].includes('Cambria Math')
  || !/serif/.test(mathFont[1])) {
  throw new Error(`.dsc-math font stack is not serif math: ${JSON.stringify(mathFont?.[1])}`)
}
console.log('CSS_OK')
