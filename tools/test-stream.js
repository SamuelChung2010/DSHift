// Streaming probe: verify SSE, built-in search, citations, title and safety with the account token.
const fs = require('node:fs');
const text = fs.readFileSync('C:/Users/Zhong/.dsh/.credentials.yaml', 'utf8');
const m = text.match(/deepseek-account-platform\/default:[\s\S]*?token:\s*([^\s]+)/);
if (!m) { console.log('NO_TOKEN_FOUND'); process.exit(0); }
const token = m[1];

(async () => {
  const response = await fetch('https://api.deepseek.com/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'x-dsh-auth-token': token,
      'content-type': 'application/json',
      accept: 'text/event-stream',
    },
    body: JSON.stringify({
      model: 'deepseek-flash',
      max_tokens: 400,
      stream: true,
      thinking: { type: 'disabled' },
      tools: [
        { type: 'deepseek_read_url', name: 'deepseek_read_url' },
        { type: 'deepseek_web_search', name: 'deepseek_web_search' },
      ],
      safety_check: { level: 'high' },
      title: { enabled: true },
      messages: [{ role: 'user', content: '用一句话介绍 DeepSeek V4.1 的最新更新，并给出来源链接。' }],
    }),
  });
  console.log('STATUS', response.status, response.headers.get('content-type'));
  if (!response.ok) {
    console.log(await response.text());
    return;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const counts = {};
  let textOut = '';
  let title = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (raw === '[DONE]') continue;
      let ev;
      try { ev = JSON.parse(raw); } catch { continue; }
      counts[ev.type] = (counts[ev.type] ?? 0) + 1;
      if (ev.type === 'content_block_start') {
        const cb = ev.content_block;
        console.log('START', cb.type, cb.type === 'server_tool_use' ? JSON.stringify(cb.input).slice(0, 120) : '', cb.type === 'web_search_tool_result' ? JSON.stringify(cb.content).slice(0, 200) : '');
      }
      if (ev.type === 'content_block_delta') {
        if (ev.delta.type === 'text_delta') textOut += ev.delta.text;
        if (ev.delta.type === 'citations_delta') console.log('CITATION', JSON.stringify(ev.delta.citation).slice(0, 200));
      }
      if (ev.type === 'message_delta') {
        title = ev.delta.title ?? '';
        console.log('DELTA', JSON.stringify(ev.delta).slice(0, 200), 'usage=', JSON.stringify(ev.usage).slice(0, 200));
      }
    }
  }
  console.log('COUNTS', JSON.stringify(counts));
  console.log('TEXT', textOut.slice(0, 400));
  console.log('TITLE', title);
})();
