const fs = require('node:fs');
const path = require('node:path');
const pkg = process.env.PKG;
const nm = path.resolve(process.env.DSH_INSTALL_DIR, '..', '..');
const dir = path.join(nm, '@deepseek-ai', pkg);
function walk(d, prefix = '', depth = 0) {
  if (depth > 3) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    console.log(prefix + e.name + (e.isDirectory() ? '/' : ''));
    if (e.isDirectory()) walk(path.join(d, e.name), prefix + '  ', depth + 1);
  }
}
console.log(dir);
walk(dir);
