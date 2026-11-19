// Report dsc-* classes used in className/class expressions of the client
// sources but missing from the stylesheet, plus classes defined in CSS but
// never used.
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
  const lines = readFileSync(path.join(dir, name), 'utf8').split('\n')
  for (const line of lines) {
    if (!/className|classList|\bcx\(/.test(line)) continue
    for (const match of line.matchAll(/(dsc-[a-z0-9-]+)/g)) used.add(match[1])
  }
}
const missing = [...used].filter(name => !defined.has(name)).sort()
const unused = [...defined].filter(name => !used.has(name)).sort()
console.log('defined', defined.size, 'used', used.size)
console.log('MISSING_IN_CSS', JSON.stringify(missing))
console.log('UNUSED_IN_JS', JSON.stringify(unused))
if (missing.length > 0 || unused.length > 0) process.exitCode = 1
