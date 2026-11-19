/**
 * Live PDF document-QA probe for the Chat host pipeline. Builds a minimal
 * one-page PDF, uploads it with rich-layout parsing, and asks for a fact.
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
const dir = path.resolve('.tmp/live-pdf')
fs.rmSync(dir, { recursive: true, force: true })
process.env.DSH_HOME = dir

function makePdf() {
  const content = 'BT /F1 18 Tf 72 720 Td (The launch code is ORBIT-42.) Tj ET'
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let body = '%PDF-1.4\n'
  const offsets = [0]
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(body.length)
    body += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`
  }
  const xref = body.length
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let index = 1; index <= objects.length; index += 1) {
    body += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  }
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return new TextEncoder().encode(body)
}

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
const pdf = makePdf()
console.log('PDF_BYTES', pdf.length)
const upload = await service.upload(new Request('http://127.0.0.1/api/deepseek-chat/upload', {
  method: 'POST',
  headers: {
    'content-type': 'application/octet-stream',
    'x-file-name': encodeURIComponent('launch-note.pdf'),
    'x-file-mime': 'application/pdf',
    'content-length': String(pdf.length),
  },
  body: pdf,
}))
console.log('UPLOAD', JSON.stringify(upload))
const response = await service.stream(new Request('http://127.0.0.1/api/deepseek-chat/stream', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    conversationId: conversation.id,
    text: '这份 PDF 里的发射代码是什么？只回答代码。',
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
    if (item.type === 'event' && item.event.type === 'content_block_delta' && item.event.delta.type === 'text_delta') {
      text += item.event.delta.text
    }
    if (item.type === 'done') doneMessage = item.message
    if (item.type === 'error') console.log('ERROR', JSON.stringify(item.error))
  }
}
console.log('TEXT', text)
console.log('STATUS', doneMessage?.status, 'USAGE', JSON.stringify(doneMessage?.usage))
console.log('PDF_QA_OK', text.includes('ORBIT-42'))
await service.dispose()
fs.rmSync(dir, { recursive: true, force: true })
