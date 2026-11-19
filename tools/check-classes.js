// Report dsc-* classes used in the client sources but missing from the
// stylesheet, plus classes defined in CSS but never used. Every literal dsc-*
// occurrence counts as a use, including class tables and arrays that build
// className through a lookup, not only inline className strings.
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'client-src')
const css = readFileSync(path.join(dir, '60-style.js'), 'utf8')
const defined = new Set([...css.matchAll(/\.(dsc-[a-z0-9-]+)/g)].map(match => match[1]))
const used = new Set()
for (const name of readdirSync(dir)) {
  if (!name.endsWith('.js') || name === '60-style.js') continue
  const source = readFileSync(path.join(dir, name), 'utf8')
  for (const match of source.matchAll(/dsc-[a-z0-9-]+/g)) {
    // A trailing hyphen is a prefix inside a template string, not a class.
    if (match[0].endsWith('-')) continue
    // Custom properties (`--dsc-*`) and data attributes are not classes.
    const before = source.slice(Math.max(0, match.index - 5), match.index)
    if (before.endsWith('--') || before.endsWith('data-')) continue
    used.add(match[0])
  }
}
const missing = [...used].filter(name => !defined.has(name)).sort()
const unused = [...defined].filter(name => !used.has(name)).sort()
console.log('defined', defined.size, 'used', used.size)
console.log('MISSING_IN_CSS', JSON.stringify(missing))
console.log('UNUSED_IN_JS', JSON.stringify(unused))
if (missing.length > 0 || unused.length > 0) process.exitCode = 1
