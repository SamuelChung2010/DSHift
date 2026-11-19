// Temporary connectivity probe for the DeepSeek API using the existing DSH account grant.
// Never prints the token. Only status codes and small response snippets are shown.
const fs = require('node:fs');

const credPath = 'C:/Users/Zhong/.dsh/.credentials.yaml';
const text = fs.readFileSync(credPath, 'utf8');
const m = text.match(/deepseek-account-platform\/default:[\s\S]*?token:\s*([^\s]+)/);
if (!m) {
  console.log('NO_TOKEN_FOUND');
  process.exit(0);
}
const token = m[1];

async function show(label, response) {
  const body = await response.text();
  console.log(label, 'status=', response.status, 'ctype=', response.headers.get('content-type'));
  console.log(body.slice(0, 700).replace(/\s+/g, ' '));
}

(async () => {
  const base = 'https://api.deepseek.com/anthropic/v1';
  const headers = { 'x-dsh-auth-token': token };

  try {
    const models = await fetch(`${base}/models`, { headers });
    await show('MODELS', models);
  } catch (e) {
    console.log('MODELS ERROR', e.message);
  }

  try {
    const msg = await fetch(`${base}/messages`, {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-flash',
        max_tokens: 24,
        thinking: { type: 'disabled' },
        tools: [{ type: 'deepseek_web_search', name: 'deepseek_web_search' }],
        messages: [{ role: 'user', content: 'What is 2+2? Answer with one number.' }],
      }),
    });
    await show('MESSAGES', msg);
  } catch (e) {
    console.log('MESSAGES ERROR', e.message);
  }

  try {
    const form = new FormData();
    form.append('purpose', 'user_data');
    form.append('file', new Blob(['hello deepseek file api'], { type: 'text/plain' }), 'probe.txt');
    const up = await fetch(`${base}/files`, {
      method: 'POST',
      headers: { ...headers, 'anthropic-beta': 'files-api-2025-04-14' },
      body: form,
    });
    const body = await up.text();
    console.log('FILES status=', up.status, body.slice(0, 400).replace(/\s+/g, ' '));
    try {
      const id = JSON.parse(body).id;
      if (id) {
        const del = await fetch(`${base}/files/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { ...headers, 'anthropic-beta': 'files-api-2025-04-14' },
        });
        console.log('FILE_DELETE status=', del.status);
      }
    } catch {}
  } catch (e) {
    console.log('FILES ERROR', e.message);
  }
})();
