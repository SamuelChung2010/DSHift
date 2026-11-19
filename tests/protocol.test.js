import test from 'node:test'
import assert from 'node:assert/strict'
import {
  applyEvent, buildContinuationMessages, buildHandoffRequest, buildRequestMessages, canContinueReply,
  conversationSummary, continuationPrefill, createLatestReminder, fallbackHandoffBrief, getReplyText,
  replyIsIncomplete, replySources, settleReply, titleFromUserMessage,
} from '../lib/protocol.js'

function assistant(overrides = {}) {
  return {
    id: 'a1',
    role: 'assistant',
    createdAt: 1,
    updatedAt: 1,
    model: 'deepseek-flash',
    thinking: true,
    search: true,
    status: 'streaming',
    blocks: [],
    prefix: true,
    ...overrides,
  }
}

function user(id, content, files = []) {
  return { id, role: 'user', content, files, createdAt: 1 }
}

function feed(reply, events) {
  const indexes = new Map()
  let now = 1000
  for (const event of events) {
    reply = applyEvent(reply, event, now, indexes)
    now += 100
  }
  return reply
}

test('folds thinking, search results, text, citations, usage and title', () => {
  const reply = feed(assistant(), [
    { type: 'message_start', message: { id: 'm1', model: 'deepseek-flash', usage: { input_tokens: 10, output_tokens: 0 } } },
    { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: '先想一想' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: 'sig' } },
    { type: 'content_block_stop', index: 0 },
    {
      type: 'content_block_start',
      index: 1,
      content_block: {
        type: 'server_tool_use', id: 's1', name: 'deepseek_web_search', kind: 'search',
        input: { action: 'search', queries: ['q1'] },
      },
    },
    {
      type: 'content_block_start',
      index: 2,
      content_block: {
        type: 'web_search_tool_result', tool_use_id: 's1', kind: 'search',
        content: [{
          type: 'web_search_result', title: 'T', url: 'https://e.test', snippet: 'S',
          site_name: 'E', site_icon: null, page_age: null, encrypted_content: 'x'.repeat(1000),
        }],
      },
    },
    { type: 'content_block_start', index: 3, content_block: { type: 'text', text: '' } },
    { type: 'content_block_delta', index: 3, delta: { type: 'text_delta', text: '答案' } },
    {
      type: 'content_block_delta', index: 3,
      delta: { type: 'citations_delta', citation: { type: 'web_search_result_location', url: 'https://e.test', title: 'T', cited_text: '答案', encrypted_index: '' } },
    },
    { type: 'content_block_stop', index: 3 },
    { type: 'message_delta', delta: { stop_reason: 'end_turn', title: '  新标题  ' }, usage: { input_tokens: 10, output_tokens: 3 } },
    { type: 'message_stop' },
  ])
  const settled = settleReply(reply, 'done', 9999)
  assert.equal(settled.status, 'done')
  assert.equal(settled.title, '新标题')
  assert.equal(settled.usage.output_tokens, 3)
  assert.equal(settled.blocks.length, 4)
  assert.equal(settled.blocks[0].type, 'thinking')
  assert.equal(settled.blocks[0].thinking, '先想一想')
  assert.equal(settled.blocks[0].endedAt, 1400)
  assert.equal(settled.blocks[2].content[0].encrypted_content, undefined)
  assert.equal(settled.blocks[3].citations[0].url, 'https://e.test')
  assert.equal(getReplyText(settled), '答案')
  assert.deepEqual(replySources(settled).map(item => item.url), ['https://e.test'])
})

test('refusal drops prose and reasoning but keeps tool blocks', () => {
  const reply = settleReply({
    ...assistant({ stopReason: 'refusal' }),
    blocks: [
      { type: 'thinking', thinking: 'x', signature: 's', startedAt: 1, endedAt: 2 },
      { type: 'text', text: 'prose', citations: [] },
      { type: 'server_tool_use', id: 's', name: 'deepseek_web_search', input: {}, kind: 'search' },
    ],
  }, 'done', 3)
  assert.equal(reply.blocks.length, 1)
  assert.equal(reply.blocks[0].type, 'server_tool_use')
  assert.equal(getReplyText(reply), '')
})

test('builds request messages only from complete usable rounds', () => {
  const firstUser = user('u1', 'first')
  const firstReply = settleReply({ ...assistant({ id: 'a1', thinking: true }), blocks: [
    { type: 'thinking', thinking: 'hidden', signature: 's', startedAt: 1, endedAt: 2 },
    { type: 'text', text: 'one', citations: [] },
    { type: 'web_search_tool_result', tool_use_id: 'x', kind: 'search', content: [] },
    { type: 'text', text: 'two', citations: [] },
    { type: 'server_tool_use', id: 'rl1', name: 'deepseek_read_url', kind: 'read_link', input: { action: 'read_link', url: 'https://e.test' } },
    { type: 'web_fetch_tool_result', tool_use_id: 'rl1', kind: 'read_link', signature: 'sig', content: { type: 'web_fetch_result', url: 'https://e.test', title: 'T', published_at: null, content: { type: 'document', source: { type: 'text', media_type: 'text/plain', data: '' }, title: 'T' } } },
  ] }, 'done', 3)
  const failedUser = user('u2', 'failed question')
  const failed = settleReply({ ...assistant({ id: 'a2' }), blocks: [{ type: 'text', text: '', citations: [] }] }, 'error', 4, { message: 'err' })
  const secondUser = user('u3', '', [{ id: 'f1', fileId: 'file-1', name: 'a.pdf', size: 10, mimeType: 'application/pdf', isImage: false }])
  const secondReply = settleReply({ ...assistant({ id: 'a3' }), blocks: [{ type: 'text', text: 'ok', citations: [] }] }, 'stopped', 5)
  const current = user('u4', 'now')
  const messages = [firstUser, firstReply, failedUser, failed, secondUser, secondReply, current]
  const built = buildRequestMessages(messages, 'u4', { reminder: 'rem' })
  assert.equal(built.length, 6)
  assert.equal(built[0].role, 'user')
  const types = built[1].content.map(block => block.type)
  assert.deepEqual(types, ['text', 'text', 'server_tool_use', 'web_fetch_tool_result'])
  assert.equal(built[1].content.map(block => block.text ?? '').join(''), 'one\n\ntwo')
  assert.equal(built[1].content[3].signature, 'sig')
  assert.equal(built[4].role, 'latest_reminder')
  assert.equal(built[2].content[0].type, 'document')
  assert.equal(built[5].role, 'user')
  assert.equal(built[5].content, 'now')
  // The failed round is not present at all.
  assert.equal(built.some(message => message.content === 'failed question'), false)
})

test('skips a read link whose result has no signature', () => {
  const reply = settleReply({ ...assistant(), blocks: [
    { type: 'server_tool_use', id: 'rl', name: 'deepseek_read_url', kind: 'read_link', input: {} },
    { type: 'web_fetch_tool_result', tool_use_id: 'rl', kind: 'read_link', content: { type: 'web_fetch_result', url: 'https://e.test', title: 'T', published_at: null, content: { type: 'document', source: { type: 'text', media_type: 'text/plain', data: '' }, title: 'T' } } },
    { type: 'text', text: 'answer', citations: [] },
  ] }, 'done', 2)
  const built = buildRequestMessages([user('u1', 'q'), reply, user('u2', 'next')], 'u2')
  assert.equal(built[1].content.length, 1)
  assert.equal(built[1].content[0].type, 'text')
})

test('derives titles and reminders without leaking empty values', () => {
  assert.equal(titleFromUserMessage(user('u', '  \n hello world \n second')), 'hello world')
  assert.equal(titleFromUserMessage(user('u', '', [{ name: 'report.pdf' }])), 'report.pdf')
  assert.equal(titleFromUserMessage(user('u', '   ')), '新对话')
  const reminder = createLatestReminder({ now: new Date('2026-11-19T08:00:00Z'), locale: 'zh', timeZone: 'Asia/Singapore' })
  assert.match(reminder, /^2026-11-19,.*,Web,中文$/)
  assert.equal(conversationSummary({ id: 'c', title: 't', titleAuto: true, createdAt: 1, updatedAt: 2, messages: [1, 2] }).messageCount, 2)
})

test('drafts a handoff brief request from the finished discussion', () => {
  const reply = settleReply({ ...assistant(), blocks: [{ type: 'text', text: '用分段导航实现', citations: [] }] }, 'done', 2)
  const built = buildHandoffRequest([user('u1', '把 Chat 和 Agent 合成一个模式'), reply], { locale: 'zh' })
  assert.equal(typeof built.system, 'string')
  assert.equal(built.messages.length, 1)
  assert.match(built.messages[0].content, /把 Chat 和 Agent 合成一个模式/)
  assert.match(built.messages[0].content, /用分段导航实现/)
  assert.equal(buildHandoffRequest([], { locale: 'zh' }), null)
  const instructed = buildHandoffRequest([user('u1', 'q')], { locale: 'en', instruction: 'only the client' })
  assert.match(instructed.messages[0].content, /only the client/)
  assert.match(instructed.messages[0].content, /### User/)
})

test('falls back to a local handoff brief without a model round', () => {
  const reply = settleReply({ ...assistant(), blocks: [{ type: 'text', text: '已确认方案 A', citations: [] }] }, 'done', 2)
  const brief = fallbackHandoffBrief([
    user('u1', '做一个分段导航', [{ name: 'spec.md' }]),
    reply,
  ], { locale: 'zh' })
  assert.match(brief, /^## 目标/)
  assert.match(brief, /做一个分段导航/)
  assert.match(brief, /spec\.md/)
  assert.match(brief, /已确认方案 A/)
  assert.match(brief, /## 验收标准/)
  const empty = fallbackHandoffBrief([], { locale: 'en' })
  assert.match(empty, /^## Goal/)
})

test('builds a continuation request from the visible answer prefix', () => {
  const stopped = settleReply({ ...assistant({ id: 'a1' }), blocks: [
    { type: 'thinking', thinking: '推理', signature: 's', startedAt: 1, endedAt: 2 },
    { type: 'text', text: 'Hello wor', citations: [] },
  ] }, 'stopped', 5)
  assert.equal(replyIsIncomplete(stopped), true)
  assert.equal(canContinueReply(stopped), true)
  assert.equal(continuationPrefill(stopped), 'Hello wor')
  assert.equal(continuationPrefill({ ...stopped, blocks: [{ type: 'text', text: 'Hello world  \n', citations: [] }] }), 'Hello world')

  const previousReply = settleReply({ ...assistant({ id: 'a0' }), blocks: [{ type: 'text', text: 'earlier answer', citations: [] }] }, 'done', 1)
  const built = buildContinuationMessages(
    [user('u0', 'earlier question'), previousReply, user('u1', 'current question'), stopped],
    'a1',
    { reminder: 'rem' },
  )
  assert.equal(built.length, 5)
  assert.equal(built[0].role, 'user')
  assert.equal(built[1].role, 'assistant')
  assert.equal(built[2].role, 'latest_reminder')
  assert.equal(built[3].role, 'user')
  assert.equal(built[4].role, 'assistant')
  assert.equal(built[4].content[0].type, 'text')
  assert.equal(built[4].content[0].text, 'Hello wor')
  // Reasoning blocks are never replayed as a prefill.
  assert.equal(built[4].content.some(block => block.type === 'thinking'), false)

  // A result without a usable prefix or without a matching question is not continuable.
  assert.equal(canContinueReply({ ...stopped, status: 'done', stopReason: 'end_turn' }), false)
  assert.equal(canContinueReply({ ...stopped, stopReason: 'max_tokens' }), true)
  assert.equal(canContinueReply({ ...stopped, prefix: false }), false)
  assert.equal(canContinueReply({ ...stopped, stopReason: 'refusal' }), false)
  assert.equal(canContinueReply({ ...stopped, blocks: [{ type: 'text', text: '   ', citations: [] }] }), false)
  assert.equal(buildContinuationMessages([stopped], 'a1'), null)
  assert.equal(buildContinuationMessages([user('u1', 'q'), stopped], 'missing'), null)
})
