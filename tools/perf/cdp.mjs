/**
 * Minimal Chrome DevTools Protocol client built on Node's global WebSocket.
 * No third-party dependency is used. The helper is intentionally small: it
 * opens one browser target, attaches a flat session and lets the caller send
 * commands with that session id.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function httpJson(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
  return response.json()
}

export async function launchChrome({ port, userDataDir, headless = true, windowSize = '1440,900', extraArgs = [] }) {
  fs.mkdirSync(userDataDir, { recursive: true })
  const executable = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].find((candidate) => fs.existsSync(candidate))
  if (!executable) throw new Error('No Chromium browser found')
  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${path.resolve(userDataDir)}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    `--window-size=${windowSize}`,
    ...(headless ? ['--headless=new', '--hide-scrollbars'] : []),
    'about:blank',
    ...extraArgs,
  ]
  const child = spawn(executable, args, { stdio: 'ignore', detached: false })
  const versionUrl = `http://127.0.0.1:${port}/json/version`
  let version
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      version = await httpJson(versionUrl)
      break
    } catch {
      await sleep(150)
    }
  }
  if (!version) {
    child.kill()
    throw new Error('Chromium did not expose a DevTools endpoint')
  }
  return { child, executable, version }
}

export class CdpConnection {
  constructor(url) {
    this.url = url
    this.nextId = 1
    this.pending = new Map()
    this.listeners = new Set()
    this.closed = false
  }

  static async open(url) {
    const connection = new CdpConnection(url)
    await connection.connect()
    return connection
  }

  connect() {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url)
      this.socket = socket
      socket.addEventListener('open', () => resolve())
      socket.addEventListener('error', (event) => reject(new Error(`CDP socket error: ${String(event?.message ?? event)}`)))
      socket.addEventListener('message', (event) => this.onMessage(event.data))
      socket.addEventListener('close', () => { this.closed = true })
    })
  }

  onMessage(raw) {
    let message
    try {
      message = JSON.parse(typeof raw === 'string' ? raw : raw.toString())
    } catch {
      return
    }
    if (message.id !== undefined) {
      const waiter = this.pending.get(message.id)
      if (!waiter) return
      this.pending.delete(message.id)
      if (message.error) waiter.reject(new Error(`${waiter.method}: ${message.error.message}`))
      else waiter.resolve(message.result)
      return
    }
    for (const listener of this.listeners) listener(message)
  }

  onEvent(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  send(method, params = {}, sessionId) {
    if (this.closed) return Promise.reject(new Error('CDP connection closed'))
    const id = this.nextId
    this.nextId += 1
    const payload = { id, method, params }
    if (sessionId !== undefined) payload.sessionId = sessionId
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method })
      this.socket.send(JSON.stringify(payload))
    })
  }

  close() {
    this.closed = true
    try { this.socket?.close() } catch { /* already closed */ }
  }
}

/**
 * Attach to a fresh page target. `sessions` keeps the flat-session id.
 */
export async function attachPage(connection) {
  const { targetId } = await connection.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await connection.send('Target.attachToTarget', { targetId, flatten: true })
  const send = (method, params = {}) => connection.send(method, params, sessionId)
  const events = []
  connection.onEvent((message) => {
    if (message.sessionId === sessionId && message.method !== undefined) events.push(message)
  })
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  return { targetId, sessionId, send, events }
}

export async function evaluate(page, expression, { awaitPromise = false, returnByValue = true } = {}) {
  const result = await page.send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue,
    userGesture: true,
  })
  if (result.exceptionDetails) {
    const description = result.exceptionDetails.exception?.description
      ?? result.exceptionDetails.text
      ?? 'evaluation failed'
    throw new Error(description)
  }
  return result.result?.value
}

export async function waitFor(page, expression, { timeoutMs = 30000, intervalMs = 100, label = expression } = {}) {
  const started = Date.now()
  for (;;) {
    try {
      const value = await evaluate(page, expression)
      if (value) return value
    } catch {
      // Page may still be navigating.
    }
    if (Date.now() - started > timeoutMs) throw new Error(`Timed out waiting for ${label}`)
    await sleep(intervalMs)
  }
}

export function findChromePid(child) {
  return child.pid
}

export { sleep }
