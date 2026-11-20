import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  DEFAULT_EFFORT, DEFAULT_MODEL, EFFORTS, MODEL_CATALOG, ModelConfigStore,
  findModel, resolveEffort, resolveModelId,
} from '../lib/model-config.js'
import { thinkingParams } from '../lib/protocol.js'

async function tempStore() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-model-'))
  const store = new ModelConfigStore(dir, { logger: { warn() {} } })
  await store.load()
  return { dir, store }
}

test('the catalog offers exactly the models the Messages API accepts', () => {
  assert.deepEqual(MODEL_CATALOG.map(model => model.id), ['deepseek-flash', 'deepseek-v4-pro'])
  assert.equal(findModel('deepseek-flash').capabilities.vision, true)
  assert.equal(findModel('deepseek-flash').displayName, 'DeepSeek-V4.1-Flash')
  assert.equal(findModel('deepseek-v4-pro').displayName, 'DeepSeek-V4-Pro')
  assert.equal(findModel('deepseek-v4-pro').capabilities.vision, false)
  assert.deepEqual(findModel('deepseek-flash').capabilities.efforts, EFFORTS)
  assert.deepEqual(EFFORTS, ['low', 'high', 'max'])
  assert.equal(resolveModelId(undefined), DEFAULT_MODEL)
  assert.equal(resolveModelId('deepseek-v4-pro'), 'deepseek-v4-pro')
  assert.equal(resolveModelId('claude-opus-4'), null, 'unknown ids must not silently map')
  assert.equal(resolveEffort('medium'), 'high', 'middle aliases collapse to the real tier')
  assert.equal(resolveEffort('ultra'), 'max')
  assert.equal(resolveEffort('nonsense'), DEFAULT_EFFORT)
})

test('a selection without a conversation id becomes the default for new chats', async () => {
  const { dir, store } = await tempStore()
  try {
    assert.deepEqual(store.getDefaults(), { model: 'deepseek-flash', effort: 'high' })
    await store.set(null, { model: 'deepseek-v4-pro', effort: 'max' })
    assert.deepEqual(store.getDefaults(), { model: 'deepseek-v4-pro', effort: 'max' })
    // A conversation without an override resolves to the new defaults.
    assert.deepEqual(store.resolve('c1'), { model: 'deepseek-v4-pro', effort: 'max' })
    // The effort is normalised to one of the target model's real tiers.
    await store.set(null, { model: 'deepseek-flash', effort: 'ultra' })
    assert.deepEqual(store.getDefaults(), { model: 'deepseek-flash', effort: 'max' })
    await store.set(null, { model: 'deepseek-flash', effort: 'medium' })
    assert.deepEqual(store.getDefaults(), { model: 'deepseek-flash', effort: 'high' })
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('each conversation keeps its own model and effort across reloads', async () => {
  const { dir, store } = await tempStore()
  try {
    await store.set('c1', { model: 'deepseek-v4-pro', effort: 'low' })
    await store.set('c2', { model: 'deepseek-flash', effort: 'max' })
    assert.deepEqual(store.resolve('c1'), { model: 'deepseek-v4-pro', effort: 'low' })
    assert.deepEqual(store.resolve('c2'), { model: 'deepseek-flash', effort: 'max' })
    assert.deepEqual(store.resolve('c3'), { model: DEFAULT_MODEL, effort: DEFAULT_EFFORT })
    await store.flush()

    const again = new ModelConfigStore(dir, { logger: { warn() {} } })
    await again.load()
    assert.deepEqual(again.resolve('c1'), { model: 'deepseek-v4-pro', effort: 'low' })
    assert.deepEqual(again.resolve('c2'), { model: 'deepseek-flash', effort: 'max' })

    await again.remove('c1')
    assert.deepEqual(again.resolve('c1'), { model: DEFAULT_MODEL, effort: DEFAULT_EFFORT })
    await again.prune(['c2', 'c3'])
    assert.equal(again.getConversation('c2').model, 'deepseek-flash')
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('a corrupt preference file falls back to the defaults instead of breaking chat', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-model-'))
  try {
    await fs.writeFile(path.join(dir, 'model-config.json'), '{not json', 'utf8')
    const store = new ModelConfigStore(dir, { logger: { warn() {} } })
    await store.load()
    assert.deepEqual(store.getDefaults(), { model: DEFAULT_MODEL, effort: DEFAULT_EFFORT })
    await store.set(null, { model: 'deepseek-v4-pro' })
    assert.equal(store.getDefaults().model, 'deepseek-v4-pro')
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('thinking parameters follow the switch and carry the effort only when on', () => {
  assert.deepEqual(thinkingParams(false, 'max'), { thinking: { type: 'disabled' } })
  assert.deepEqual(thinkingParams(true, 'max'), {
    thinking: { type: 'enabled' },
    output_config: { effort: 'max' },
  })
  assert.deepEqual(thinkingParams(true, 'low'), {
    thinking: { type: 'enabled' },
    output_config: { effort: 'low' },
  })
  // Anything outside the real tiers is normalised, never forwarded raw.
  assert.deepEqual(thinkingParams(true, 'ultra'), {
    thinking: { type: 'enabled' },
    output_config: { effort: 'max' },
  })
  assert.deepEqual(thinkingParams(true, 'nonsense'), {
    thinking: { type: 'enabled' },
    output_config: { effort: 'high' },
  })
})
