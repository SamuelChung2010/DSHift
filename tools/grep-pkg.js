// Search one installed package (ASAR-aware) for a literal term.
// Usage: PKG=<package> TERM=<literal> [MAXB=1048576] [LIMIT=8]
const fs = require('node:fs')
const path = require('node:path')

const scope = path.join(process.env.DSH_INSTALL_DIR, '..', '..', '@deepseek-ai')
const pkg = process.env.PKG
const term = process.env.TERM
const maxBytes = Number(process.env.MAXB || 1024 * 1024)
const limit = Number(process.env.LIMIT || 8)
const SKIP = new Set(['node_modules', '.git', 'lib'])
const files = []

function walk(dir) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(js|mjs|cjs|ts|tsx|css|json|md)$/.test(entry.name)) files.push(full)
  }
}

walk(path.join(scope, pkg))
for (const file of files) {
  let stat
  try { stat = fs.statSync(file) } catch { continue }
  if (stat.size > maxBytes) continue
  let text
  try { text = fs.readFileSync(file, 'utf8') } catch { continue }
  if (!text.includes(term)) continue
  console.log(path.relative(scope, file))
  const lines = text.split(/\r?\n/)
  let shown = 0
  for (let index = 0; index < lines.length && shown < limit; index += 1) {
    if (!lines[index].includes(term)) continue
    shown += 1
    console.log(`  ${index + 1}: ${lines[index].trim().slice(0, 200)}`)
  }
}
