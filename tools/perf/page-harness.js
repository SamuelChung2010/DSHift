/* Test-only page harness, injected after the Chat plugin mounted.
 *
 * It builds synthetic conversations with stable object identities, seeds them
 * into the real plugin store, and records per-input render counts and latency.
 * No production code is modified and no real conversation is read.
 */
(() => {
  if (window.__PERF__) return
  const store = window.__DSC__.chatStore
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const paragraphs = [
    'DeepSeek Harness 把会话、工作区和工具调用组织在同一棵界面上，历史消息需要保持稳定的对象引用。',
    'This paragraph is deliberately ordinary prose so the size series measures message count, not exotic Markdown.',
    '渲染隔离的目标是让一次草稿更新只触碰输入框，而不是整条历史。',
    'A long history should still scroll, select and copy without dropping frames.',
  ]

  function makeText(index, heavy, dense) {
    const parts = []
    parts.push(`### 回答 ${index}`)
    parts.push(`${paragraphs[index % paragraphs.length]} 这是第 ${index} 条助手消息，用于长会话渲染基准。`)
    parts.push(`- 要点 ${index}.1：保持历史消息对象引用稳定`)
    parts.push(`- 要点 ${index}.2：避免草稿更新触发历史重渲染`)
    parts.push(`- 要点 ${index}.3：流式输出只更新当前消息`)
    if (dense) {
      // A realistic long answer: several sections, two fenced blocks, tables,
      // inline and display math, citations and block quotes.
      for (let section = 0; section < 3; section += 1) {
        parts.push(`#### ${index}.${section} 详细说明`)
        parts.push(`${paragraphs[(index + section) % paragraphs.length]} ${paragraphs[(index + section + 1) % paragraphs.length]} 这一段模拟真实回答中的长段落，包含 **加粗**、*斜体*、\`行内代码\` 与 [链接](https://example.com/doc/${index}/${section})。`)
        parts.push(`1. 第一步：记录 ${index} 的输入事件`)
        parts.push(`2. 第二步：只更新当前消息 ${section}`)
        parts.push(`3. 第三步：保持历史对象引用不变`)
        parts.push('```ts')
        parts.push(`export function answer${index}_${section}(input: string): number {`)
        parts.push('  const blocks = parseMarkdown(input)')
        parts.push('  return blocks.filter((block) => block.type === "code").length')
        parts.push('}')
        parts.push('```')
        if (section === 1) {
          parts.push('| 阶段 | 修复前 | 目标 |')
          parts.push('| --- | --- | --- |')
          parts.push('| 草稿更新 | 全量重渲染 | 仅输入框 |')
          parts.push('| 流式输出 | 全量重渲染 | 仅当前消息 |')
          parts.push('| 历史渲染 | 每帧重算 | 引用稳定 |')
        }
        parts.push(`公式 ${section}：$\\sum_{i=0}^{${index}} i^2 = \\frac{n(n+1)(2n+1)}{6}$，展示：`)
        parts.push('$$\\int_0^1 \\frac{x^2}{1+x^2} \\, dx = 1 - \\frac{\\pi}{4}$$')
        parts.push('> 引用：历史消息必须完整保留，不能通过截断换取表面性能。')
      }
      parts.push(`来源引用 [${index}](https://example.com/source/${index})，以及 [文档](https://example.com/doc/${index})。`)
      return parts.join('\n\n')
    }
    if (heavy || index % 3 === 0) {
      parts.push('| 指标 | 修复前 | 目标 |')
      parts.push('| --- | --- | --- |')
      parts.push('| 输入延迟 P95 | 待测 | < 50ms |')
      parts.push('| 历史重渲染 | 待测 | 0 |')
    }
    if (heavy || index % 4 === 0) {
      parts.push('```js')
      parts.push(`function renderAnswer${index}(value) {`)
      parts.push('  const blocks = parseMarkdown(value)')
      parts.push('  return blocks.map(block => block.type)')
      parts.push('}')
      parts.push('```')
    }
    if (heavy) {
      parts.push('行内公式 $a^2 + b^2 = c^2$ 与展示公式：')
      parts.push('$$\\int_0^1 x^2 \\, dx = \\frac{1}{3}$$')
      parts.push('> 引用：不要把历史消息截断或隐藏来换取表面性能。')
      parts.push('```mermaid')
      parts.push('graph TD')
      parts.push('  A[输入] --> B{草稿状态}')
      parts.push('  B --> C[输入框]')
      parts.push('  B --> D[历史消息]')
      parts.push('```')
      parts.push(`来源引用 [${index}](https://example.com/source/${index})。`)
    }
    return parts.join('\n\n')
  }

  function makeMessages(count, heavy = false, dense = false) {
    const now = Date.now()
    const messages = []
    for (let index = 0; index < count; index += 1) {
      const pair = Math.floor(index / 2)
      if (index % 2 === 0) {
        messages.push({
          id: `perf-u-${count}-${index}`,
          role: 'user',
          content: `第 ${pair + 1} 个问题：请说明长会话输入性能的瓶颈在哪里？`,
          createdAt: now - (count - index) * 60_000,
          updatedAt: now - (count - index) * 60_000,
          status: 'done',
        })
      } else {
        messages.push({
          id: `perf-a-${count}-${index}`,
          role: 'assistant',
          createdAt: now - (count - index) * 60_000,
          updatedAt: now - (count - index) * 60_000,
          model: 'deepseek-flash',
          effort: 'high',
          status: 'done',
          blocks: [{ type: 'text', text: makeText(pair + 1, heavy, dense) }],
          usage: { input_tokens: 1200 + index, output_tokens: 400 + index },
        })
      }
    }
    return messages
  }

  function seed(count, { heavy = false, dense = false } = {}) {
    const messages = makeMessages(count, heavy, dense)
    const now = Date.now()
    const summary = {
      id: `perf-conversation-${heavy ? 'heavy' : dense ? 'dense' : count}`,
      title: heavy ? '复杂 Markdown 基准会话' : dense ? `密集内容 ${count} 条` : `长会话 ${count} 条`,
      createdAt: now - 3_600_000,
      updatedAt: now,
      messageCount: count,
      pinned: false,
      archived: false,
    }
    window.__PERF_SEED_AT__ = performance.now()
    window.__PERF_SEED_COUNT__ = count
    const applyStartedAt = performance.now()
    store.set({
      boot: 'ready',
      bootError: '',
      auth: { ready: true },
      conversations: [summary],
      activeId: summary.id,
      messages,
      conversationLoading: false,
      conversationError: '',
      streaming: null,
      stopping: false,
      sending: false,
      draft: '',
      attachments: [],
      editingId: null,
      editDraft: '',
      focusMessage: null,
      menu: null,
    })
    window.__PERF_SEED_APPLY_MS__ = performance.now() - applyStartedAt
    return messages.length
  }

  let samples = []
  let longTasks = []
  let loafs = []
  let attached = false

  function snapshotCounts() {
    const counts = window.__DSC_COUNTS__
    return counts ? { ...counts } : null
  }

  function field() {
    return document.querySelector('.dsc-editor-field')
  }

  function onInput(event) {
    const node = field()
    if (!node) return
    const sample = {
      t: event.timeStamp,
      inputType: event.inputType ?? '',
      data: event.data ?? '',
      length: node.value.length,
      before: snapshotCounts(),
      frame: null,
      task: null,
    }
    requestAnimationFrame(() => {
      sample.frame = performance.now()
      setTimeout(() => {
        sample.task = performance.now()
        sample.after = snapshotCounts()
        sample.frameDelta = sample.frame - sample.t
        sample.taskDelta = sample.task - sample.t
        samples.push(sample)
      }, 0)
    })
  }

  function attach() {
    if (attached) return true
    const node = field()
    if (!node) return false
    node.addEventListener('input', onInput, true)
    attached = true
    return true
  }

  if (window.PerformanceObserver) {
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) longTasks.push({ start: entry.startTime, duration: entry.duration })
      }).observe({ entryTypes: ['longtask'] })
    } catch { /* longtask unsupported */ }
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          loafs.push({
            start: entry.startTime,
            duration: entry.duration,
            blockingDuration: entry.blockingDuration,
            renderStart: entry.renderStart,
            styleAndLayoutStart: entry.styleAndLayoutStart,
          })
        }
      }).observe({ entryTypes: ['long-animation-frame'] })
    } catch { /* LoAF unsupported */ }
  }

  async function waitForMessages(count, timeoutMs = 120000) {
    const started = performance.now()
    for (;;) {
      const rendered = document.querySelectorAll('[data-message-id]').length
      if (rendered >= count) return { rendered, waited: performance.now() - started }
      if (performance.now() - started > timeoutMs) throw new Error(`messages did not render: ${rendered}/${count}`)
      await new Promise((resolve) => requestAnimationFrame(resolve))
    }
  }

  window.__PERF__ = {
    seed,
    waitForMessages,
    attach,
    clear() {
      samples = []
      longTasks = []
      loafs = []
      if (window.__DSC_COUNTS__) {
        for (const key of Object.keys(window.__DSC_COUNTS__)) delete window.__DSC_COUNTS__[key]
      }
    },
    resetSamples() { samples = [] },
    resetCounters() {
      if (window.__DSC_COUNTS__) for (const key of Object.keys(window.__DSC_COUNTS__)) delete window.__DSC_COUNTS__[key]
    },
    counts() { return snapshotCounts() },
    bundleId() { return window.__DSC_BUNDLE_ID__ ?? null },
    samples() { return samples },
    longTasks() { return longTasks },
    loafs() { return loafs },
    fieldValue() { return field()?.value ?? null },
    focus() { field()?.focus(); return document.activeElement === field() },
    async typeInPage(text) {
      // Fallback path used only when trusted input is unavailable.
      const node = field()
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
      setter.call(node, node.value + text)
      node.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }))
      await sleep(0)
    },
    async setDraft(text) {
      store.set({ draft: text })
      await sleep(0)
    },
    async stream({ assistantId, conversationId, text, chunkMs = 60, chunkChars = 6 }) {
      const base = store.state.messages
      const holder = {
        controller: new AbortController(),
        conversationId,
        assistantId,
        userId: null,
        startedAt: Date.now(),
      }
      const index = base.findIndex((message) => message.id === assistantId)
      const chunks = []
      for (let offset = 0; offset < text.length; offset += chunkChars) chunks.push(text.slice(offset, offset + chunkChars))
      store.set({ streaming: holder })
      for (const chunk of chunks) {
        const previous = store.state.messages
        const target = previous[index]
        const next = previous.slice()
        next[index] = {
          ...target,
          blocks: [{ type: 'text', text: (target.blocks?.[0]?.text ?? '') + chunk }],
          updatedAt: Date.now(),
        }
        store.set({ messages: next })
        await sleep(chunkMs)
      }
      store.set({ streaming: null })
      return chunks.length
    },
  }
})()
