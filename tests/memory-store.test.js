import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { MemoryStore } from '../lib/memory-store.js'

async function tempStore() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-memory-store-'))
  const store = new MemoryStore(dir, { logger: { warn() {}, info() {} } })
  await store.load()
  return { dir, store }
}

test('persists memories, settings and the derived summary across reloads', async () => {
  const { dir, store } = await tempStore()
  try {
    assert.deepEqual(store.getSettings(), { enabled: true, autoExtract: false })
    assert.equal(store.snapshot().count, 0)
    assert.equal(store.snapshot().stale, false)

    const first = await store.add({ content: '  用户喜欢简洁的回答  ', category: 'instruction' })
    assert.equal(first.status, 'added')
    assert.equal(first.memory.content, '用户喜欢简洁的回答')
    const second = await store.add({ content: '用户正在开发 dsh-chat 插件', category: 'projects' })
    assert.equal(second.status, 'added')

    assert.deepEqual(
      store.list().map(memory => memory.content).sort(),
      ['用户正在开发 dsh-chat 插件', '用户喜欢简洁的回答'].sort(),
    )
    const categories = store.categories()
    assert.deepEqual(categories.map(item => item.id), ['instruction', 'identity', 'career', 'projects', 'preferences'])
    assert.equal(categories.find(item => item.id === 'projects').count, 1)

    const revision = store.snapshot().revision
    const updated = await store.update(first.memory.id, { content: '用户希望回答尽量简短', category: 'preferences' })
    assert.equal(updated.status, 'updated')
    assert.equal(store.snapshot().revision, revision + 1)
    assert.equal((await store.update('missing', { content: 'x' })).status, 'not-found')

    await store.updateSettings({ autoExtract: true })
    assert.equal(store.getSettings().autoExtract, true)
    assert.equal((await store.remove(second.memory.id)), true)
    assert.equal((await store.remove('missing')), false)

    await store.flush()
    const again = new MemoryStore(dir, { logger: { warn() {}, info() {} } })
    await again.load()
    assert.equal(again.list().length, 1)
    assert.equal(again.list()[0].content, '用户希望回答尽量简短')
    assert.equal(again.getSettings().autoExtract, true)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('dedupes exact and near-duplicate facts and blocks re-adding deleted ones', async () => {
  const { dir, store } = await tempStore()
  try {
    const added = await store.add({ content: '用户喜欢简洁的回答', category: 'instruction' })
    const duplicate = await store.add({ content: '  用户喜欢简洁的回答！ ', category: 'instruction' })
    assert.equal(duplicate.status, 'duplicate')
    assert.equal(duplicate.memory.id, added.memory.id)
    assert.equal(store.list().length, 1)

    const merged = await store.add({ content: '用户喜欢简洁、直接的回答', category: 'instruction' })
    assert.equal(merged.status, 'merged')
    assert.equal(store.list().length, 1)
    assert.match(store.list()[0].content, /简洁/)

    // A deleted fact leaves a tombstone: automatic extraction and import skip it,
    // while the user adding it again by hand is an explicit decision.
    const project = await store.add({ content: '用户正在开发 dsh-chat 插件', category: 'projects' })
    await store.remove(project.memory.id)
    const autoAgain = await store.add({
      content: '用户正在开发 dsh-chat 插件',
      category: 'projects',
      origin: 'conversation',
    })
    assert.equal(autoAgain.status, 'skipped')
    const importAgain = await store.absorb([{ content: '用户正在开发 dsh-chat 插件' }], { origin: 'import' })
    assert.equal(importAgain.added, 0)
    const manualAgain = await store.add({ content: '用户正在开发 dsh-chat 插件', category: 'projects' })
    assert.equal(manualAgain.status, 'added')

    // Sensitive content is never saved by automatic extraction, but a human can
    // always decide to save it manually.
    const sensitiveAuto = await store.add({
      content: '我的手机号是 13800138000',
      origin: 'conversation',
    })
    assert.equal(sensitiveAuto.status, 'skipped')
    const sensitiveManual = await store.add({ content: '我的手机号是 13800138000' })
    assert.equal(sensitiveManual.status, 'added')
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('imports foreign memory exports in merge mode without duplicating them', async () => {
  const { dir, store } = await tempStore()
  try {
    const entries = [
      { content: '[2024-01-02] - 用户叫 Samuel，住在深圳', category: 'identity' },
      { content: '用户正在开发 dsh-chat 插件', category: 'projects', mode: 'auto' },
      { content: '用户喜欢像素画', category: 'preferences' },
    ]
    const first = await store.absorb(entries, {
      origin: 'import',
      source: { type: 'import', platform: 'claude' },
    })
    assert.equal(first.added, 3)
    assert.equal(store.list().length, 3)
    assert.equal(store.list().find(memory => memory.content.includes('Samuel')).source.platform, 'claude')
    assert.equal(store.list().find(memory => memory.content.includes('Samuel')).content, '用户叫 Samuel，住在深圳')

    const second = await store.absorb(entries, { origin: 'import', source: { type: 'import', platform: 'claude' } })
    assert.equal(second.added, 0)
    assert.equal(store.list().length, 3)

    const preview = store.previewEntries([
      { content: '用户叫 Samuel，住在深圳', category: 'identity' },
      { content: '我不喜欢太长的回答' },
      { content: '我的身份证号是 110101199001011234' },
    ])
    assert.equal(preview.entries[0].match.kind, 'duplicate')
    assert.equal(preview.entries[1].match, null)
    assert.equal(preview.entries[2].sensitive, true)

    const updated = await store.absorb([
      { content: '用户已经搬到广州', category: 'identity', mode: 'update' },
    ], { origin: 'import' })
    assert.equal(updated.added, 1)

    const skipped = await store.absorb([{ content: '用户喜欢像素画', mode: 'skip' }], { origin: 'import' })
    assert.equal(skipped.skipped, 1)
    assert.equal(store.list().length, 4)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('invalidates the cached summary whenever the fact set changes', async () => {
  const { dir, store } = await tempStore()
  try {
    assert.equal(store.summaryIsStale(), false)
    const added = await store.add({ content: '用户喜欢简短的回答' })
    assert.equal(store.summaryIsStale(), true)
    const revision = store.snapshot().revision
    await store.setSummary({ text: '## 概览\n用户偏好简短回答。', locale: 'zh' })
    assert.equal(store.summaryIsStale(), false)
    assert.equal(store.getSummary().revision, revision)
    assert.equal(store.getSummary().text.includes('## 概览'), true)

    await store.update(added.memory.id, { content: '用户喜欢非常简短的回答' })
    assert.equal(store.summaryIsStale(), true)
    await store.clear()
    assert.equal(store.getSummary(), null)
    assert.equal(store.summaryIsStale(), false)
    assert.equal(store.list().length, 0)
    // Clearing tombstones the entries too, so an old conversation cannot
    // resurrect what the user explicitly wiped.
    const restored = await store.absorb([{ content: '用户喜欢非常简短的回答' }], { origin: 'import' })
    assert.equal(restored.added, 0)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('recovers from an unreadable memory file without losing the plugin', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-memory-corrupt-'))
  try {
    await fs.mkdir(path.join(dir), { recursive: true })
    await fs.writeFile(path.join(dir, 'memory.json'), '{not json', 'utf8')
    const warnings = []
    const store = new MemoryStore(dir, { logger: { warn() { warnings.push('warn') }, info() {} } })
    await store.load()
    assert.equal(store.list().length, 0)
    assert.equal(warnings.length, 1)
    const names = await fs.readdir(dir)
    assert.equal(names.some(name => name.startsWith('memory.json.corrupt-')), true)
    // The next write replaces the quarantined document with a valid one.
    await store.add({ content: '用户喜欢简短的回答' })
    await store.flush()
    const parsed = JSON.parse(await fs.readFile(path.join(dir, 'memory.json'), 'utf8'))
    assert.equal(parsed.version, 1)
    assert.equal(parsed.memories.length, 1)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})
