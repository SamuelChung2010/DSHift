/**
 * Live integration probe for the Chat host pipeline. Uses the existing DSH
 * account grant; never prints the token. Writes only under .tmp/live-chat.
 */
import fs from 'node:fs'
import path from 'node:path'
import { ChatService } from '../lib/service.js'

const credText = fs.readFileSync('C:/Users/Zhong/.dsh/.credentials.yaml', 'utf8')
const match = credText.match(/deepseek-account-platform\/default:[\s\S]*?token:\s*([^\s]+)/)
if (!match) {
  console.log('NO_TOKEN')
  process.exit(1)
}
const token = match[1]
const dir = path.resolve('.tmp/live-chat')
fs.rmSync(dir, { recursive: true, force: true })
process.env.DSH_HOME = dir

const registered = []
const ctx = {
  logger: { warn: (...args) => console.warn('WARN', ...args) },
  get(name) {
    if (name === 'credentials') {
      return {
        async resolve() { return undefined },
        async describe() { return { configured: false } },
        async set() {},
        async unset() {},
      }
    }
    if (name === 'deepseekAccount') {
      return { async resolveToken() { return token } }
    }
    return undefined
  },
  connection: {
    fetch: {
      register(route) {
        registered.push(route.path)
        return async () => {}
      },
    },
  },
}

const service = new ChatService(ctx, { requestTimeoutMs: 240_000, heartbeatMs: 10_000 })
service.registerRoutes()
console.log('ROUTES', registered.join(', '))
await service.ready()
const conversation = await service.store.createConversation()
console.log('CONVERSATION', conversation.id)

async function run(label, payload) {
  const request = new Request('http://127.0.0.1/api/deepseek-chat/stream', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const response = await service.stream(request)
  console.log(label, 'HTTP', response.status, response.headers.get('content-type'))
  if (response.status !== 200) {
    console.log(await response.text())
    return null
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let doneMessage = null
  const counts = {}
  let text = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let newline
    while ((newline = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newline)
      buffer = buffer.slice(newline + 1)
      if (line.trim() === '') continue
      const item = JSON.parse(line)
      counts[item.type] = (counts[item.type] ?? 0) + 1
      if (item.type === 'event') {
        const event = item.event
        if (event.type === 'content_block_start') {
          const block = event.content_block
          console.log('  START', block.type, block.type === 'server_tool_use' ? JSON.stringify(block.input).slice(0, 100) : '')
        }
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') text += event.delta.text
        if (event.type === 'message_delta') console.log('  DELTA', JSON.stringify(event.delta).slice(0, 120))
      }
      if (item.type === 'title') console.log('  TITLE', item.title)
      if (item.type === 'done') {
        doneMessage = item.message
        console.log('  DONE status=', item.message.status, 'stop=', item.message.stopReason, 'usage=', JSON.stringify(item.message.usage))
      }
      if (item.type === 'error') console.log('  ERROR', JSON.stringify(item.error))
      if (item.type === 'aborted') console.log('  ABORTED')
    }
  }
  console.log(label, 'COUNTS', JSON.stringify(counts))
  console.log(label, 'TEXT', text.slice(0, 300))
  return doneMessage
}

const first = await run('FIRST', {
  conversationId: conversation.id,
  text: '请用一句话介绍 DeepSeek V4.1 的最新更新，并给出一个来源链接。',
  files: [],
  thinking: true,
  search: true,
  locale: 'zh',
})
console.log('FIRST_OK', first?.status === 'done')

// Upload a small text file through the same host route handler.
const uploadRequest = new Request('http://127.0.0.1/api/deepseek-chat/upload', {
  method: 'POST',
  headers: {
    'content-type': 'application/octet-stream',
    'x-file-name': encodeURIComponent('probe-note.txt'),
    'x-file-mime': 'text/plain',
    'content-length': '54',
  },
  body: new TextEncoder().encode('The launch code is ORBIT-42. The reviewer is Lin.'),
})
const uploadResponse = await service.upload(uploadRequest)
console.log('UPLOAD', JSON.stringify(uploadResponse))
const second = await run('SECOND', {
  conversationId: conversation.id,
  text: '这份文件里的发射代码和审阅人分别是什么？只回答这两个值。',
  files: [uploadResponse.file],
  thinking: false,
  search: false,
  locale: 'zh',
})
console.log('SECOND_OK', second?.status === 'done')

const saved = service.store.getConversation(conversation.id)
console.log('SAVED_MESSAGES', saved.messages.length, 'TITLE', JSON.stringify(saved.title), 'TITLE_AUTO', saved.titleAuto)
console.log('SECOND_TEXT', (saved.messages.at(-1)?.blocks ?? []).filter(b => b.type === 'text').map(b => b.text).join('').slice(0, 300))
await service.dispose()
fs.rmSync(dir, { recursive: true, force: true })
