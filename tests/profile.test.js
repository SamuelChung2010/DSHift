import test from 'node:test'
import assert from 'node:assert/strict'
import { ChatService, accountDisplayName } from '../lib/service.js'

test('accountDisplayName reads only a ready profile name', () => {
  assert.equal(accountDisplayName(null), null)
  assert.equal(accountDisplayName(undefined), null)
  assert.equal(accountDisplayName({ status: 'failed' }), null)
  assert.equal(accountDisplayName({ status: 'ready', value: { name: null } }), null)
  assert.equal(accountDisplayName({ status: 'ready', value: { name: '   ' } }), null)
  assert.equal(accountDisplayName({ status: 'ready', value: { name: ' 烨明 ' } }), '烨明')
  // Contact details are not a display name.
  assert.equal(accountDisplayName({ status: 'ready', value: { name: '', contact: 'a@example.com' } }), null)
})

function createService(get) {
  const ctx = {
    logger: { warn() {} },
    get,
    connection: { fetch: { register() { return async () => {} } } },
  }
  return new ChatService(ctx, {})
}

function account(getProfile, tokenSource = () => 'test-token') {
  return {
    resolveToken: async () => tokenSource(),
    getProfile,
  }
}

test('profile caches one Platform read and passes the UI locale', async () => {
  const calls = []
  const service = createService(name => (name === 'deepseekAccount' ? account(async (metadata) => {
    calls.push(metadata)
    return { status: 'ready', value: { id: 'u1', name: '烨明', contact: null } }
  }) : undefined))

  assert.deepEqual(
    await service.profile({ url: 'http://localhost/api/deepseek-chat/profile?locale=en' }),
    { name: '烨明', signedIn: true, resolved: true },
  )
  assert.equal(calls.length, 1)
  assert.equal(calls[0].locale, 'en')
  assert.equal(typeof calls[0].version, 'string')
  assert.equal(typeof calls[0].timezoneOffsetSeconds, 'number')

  // The second greeting refreshes no Platform profile while the answer is fresh.
  assert.deepEqual(
    await service.profile({ url: 'http://localhost/api/deepseek-chat/profile?locale=zh' }),
    { name: '烨明', signedIn: true, resolved: true },
  )
  assert.equal(calls.length, 1)
})

test('profile reports a signed-out account without reading the profile', async () => {
  let calls = 0
  const service = createService(name => (name === 'deepseekAccount' ? account(async () => {
    calls += 1
    return { status: 'ready', value: { id: 'u1', name: '烨明', contact: null } }
  }, () => undefined) : undefined))

  assert.deepEqual(
    await service.profile({ url: 'http://localhost/profile' }),
    { name: null, signedIn: false, resolved: true },
  )
  assert.equal(calls, 0)
})

test('profile degrades to no name without an account service or after a failed read', async () => {
  const absent = createService(() => undefined)
  assert.deepEqual(
    await absent.profile({ url: 'http://localhost/profile' }),
    { name: null, signedIn: false, resolved: true },
  )

  const failing = createService(name => (name === 'deepseekAccount' ? account(async () => {
    throw new Error('network')
  }) : undefined))
  assert.deepEqual(
    await failing.profile({ url: 'http://localhost/profile?locale=en' }),
    { name: null, signedIn: true, resolved: false },
  )
})

test('a cached name is not served after the account signs out', async () => {
  let token = 'test-token'
  const service = createService(name => (name === 'deepseekAccount' ? account(async () => ({
    status: 'ready', value: { id: 'u1', name: '烨明', contact: null },
  }), () => token) : undefined))

  assert.deepEqual(
    await service.profile({ url: 'http://localhost/profile' }),
    { name: '烨明', signedIn: true, resolved: true },
  )
  token = undefined
  assert.deepEqual(
    await service.profile({ url: 'http://localhost/profile' }),
    { name: null, signedIn: false, resolved: true },
  )
})

test('concurrent profile greetings share one Platform read', async () => {
  let calls = 0
  let release
  const gate = new Promise((resolve) => { release = resolve })
  const service = createService(name => (name === 'deepseekAccount' ? account(async () => {
    calls += 1
    await gate
    return { status: 'ready', value: { id: 'u1', name: '烨明', contact: null } }
  }) : undefined))

  const first = service.profile({ url: 'http://localhost/profile' })
  const second = service.profile({ url: 'http://localhost/profile' })
  release()
  assert.deepEqual(await first, { name: '烨明', signedIn: true, resolved: true })
  assert.deepEqual(await second, { name: '烨明', signedIn: true, resolved: true })
  assert.equal(calls, 1)
})
