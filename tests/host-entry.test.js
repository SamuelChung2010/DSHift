import test from 'node:test'
import assert from 'node:assert/strict'
import { apply, inject } from '../index.js'

test('host entry registers owner-only routes and disposes them', async () => {
  assert.deepEqual(inject, ['connection'])
  const paths = []
  const cleanups = []
  const ctx = {
    logger: { warn() {} },
    get() { return undefined },
    connection: {
      fetch: {
        register(route) {
          paths.push(route.path)
          return async () => {}
        },
      },
    },
    effect(callback) {
      cleanups.push(callback())
      return () => {}
    },
  }
  apply(ctx, {})
  assert.deepEqual(paths, [
    '/api/deepseek-chat/bootstrap',
    '/api/deepseek-chat/profile',
    '/api/deepseek-chat/conversation',
    '/api/deepseek-chat/upload',
    '/api/deepseek-chat/stream',
    '/api/deepseek-chat/settings',
    '/api/deepseek-chat/model',
    '/api/deepseek-chat/key',
    '/api/deepseek-chat/workspace',
    '/api/deepseek-chat/handoff',
    '/api/deepseek-chat/handoff/send',
    '/api/deepseek-chat/import/upload',
    '/api/deepseek-chat/import/start',
    '/api/deepseek-chat/import/status',
    '/api/deepseek-chat/import/cancel',
    '/api/deepseek-chat/import/discard',
    '/api/deepseek-chat/import/media',
  ])
  await cleanups[0]()
})
