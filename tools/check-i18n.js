import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const root = path.resolve('.')
const localeSource = fs.readFileSync(path.join(root, 'client-src/10-locale.js'), 'utf8')
const ctx = {}
vm.createContext(ctx)
vm.runInContext(`${localeSource}\n;globalThis.__dicts = { zh: DICT_ZH, en: DICT_EN }`, ctx)
const zh = ctx.__dicts.zh
const en = ctx.__dicts.en
const keys = new Set()
for (const file of fs.readdirSync(path.join(root, 'client-src'))) {
  if (!file.endsWith('.js')) continue
  const source = fs.readFileSync(path.join(root, 'client-src', file), 'utf8')
  for (const match of source.matchAll(/\b(?:t|tr)\(\s*'([^']+)'/g)) keys.add(match[1])
}
const missingZh = [...keys].filter(key => !(key in zh))
const missingEn = [...keys].filter(key => !(key in en))
const extraZh = Object.keys(zh).filter(key => !keys.has(key))
console.log('USED', keys.size, 'ZH', Object.keys(zh).length, 'EN', Object.keys(en).length)
console.log('MISSING_ZH', missingZh)
console.log('MISSING_EN', missingEn)
console.log('EXTRA_ZH', extraZh)
