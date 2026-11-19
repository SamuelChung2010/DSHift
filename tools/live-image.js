/** Live image-input probe: upload a PNG and ask for the word rendered in it. */
import fs from 'node:fs'
import path from 'node:path'
import { ChatService } from '../lib/service.js'

const credText = fs.readFileSync('C:/Users/Zhong/.dsh/.credentials.yaml', 'utf8')
const match = credText.match(/deepseek-account-platform\/default:[\s\S]*?token:\s*([^\s]+)/)
if (!match) { console.log('NO_TOKEN'); process.exit(1) }
const token = match[1]
const dir = path.resolve('.tmp/live-image')
fs.rmSync(dir, { recursive: true, force: true })
process.env.DSH_HOME = dir

const ctx = {
  logger: { warn: (...args) => console.warn('WARN', ...args) },
  get(name) {
    if (name === 'credentials') {
      return { async resolve() { return undefined }, async describe() { return { configured: false } }, async set() {}, async unset() {} }
    }
    if (name === 'deepseekAccount') return { async resolveToken() { return token } }
    return undefined
  },
  connection: { fetch: { register() { return async () => {} } } },
}
const service = new ChatService(ctx, { requestTimeoutMs: 240_000 })
service.registerRoutes()
await service.ready()
const conversation = await service.store.createConversation()
const png = fs.readFileSync('.tmp/orbit.png')
console.log('PNG_BYTES', png.length)
const upload = await service.upload(new Request('http://127.0.0.1/api/deepseek-chat/upload', {
  method: 'POST',
  headers: {
    'content-type': 'application/octet-stream',
    'x-file-name': encodeURIComponent('orbit.png'),
    'x-file-mime': 'image/png',
    'content-length': String(png.length),
  },
  body: png,
}))
console.log('UPLOAD', JSON.stringify(upload))
const response = await service.stream(new Request('http://127.0.0.1/api/deepseek-chat/stream', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    conversationId: conversation.id,
    text: '图片里写的是什么？只回答那串字符。',
    files: [upload.file],
    thinking: false,
    search: false,
    locale: 'zh',
  }),
}))
console.log('STREAM', response.status)
const reader = response.body.getReader()
const decoder = new TextDecoder()
let buffer = ''
let text = ''
let doneMessage = null
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
    if (item.type === 'event' && item.event.type === 'content_block_delta' && item.event.delta.type === 'text_delta') text += item.event.delta.text
    if (item.type === 'done') doneMessage = item.message
    if (item.type === 'error') console.log('ERROR', JSON.stringify(item.error))
  }
}
console.log('TEXT', text)
console.log('STATUS', doneMessage?.status, 'USAGE', JSON.stringify(doneMessage?.usage))
console.log('IMAGE_QA_OK', text.includes('ORBIT-42'))
await service.dispose()
fs.rmSync(dir, { recursive: true, force: true })
