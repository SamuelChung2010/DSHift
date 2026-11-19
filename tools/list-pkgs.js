const fs = require('node:fs');
const path = require('node:path');
const root = process.env.DSH_INSTALL_DIR;
const nm = path.resolve(root, '..', '..');
const scope = path.join(nm, '@deepseek-ai');
for (const d of fs.readdirSync(scope)) console.log(d);
