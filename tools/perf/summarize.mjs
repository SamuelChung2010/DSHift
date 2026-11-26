import fs from 'node:fs'
import path from 'node:path'

const file = process.argv[2]
if (!file) throw new Error('usage: node summarize.mjs <results.json>')
const data = JSON.parse(fs.readFileSync(file, 'utf8'))

function percentile(values, ratio) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))
  return Number(sorted[index].toFixed(1))
}

function stats(samples) {
  const task = samples.map((sample) => sample.taskDelta).filter((value) => typeof value === 'number')
  const frame = samples.map((sample) => sample.frameDelta).filter((value) => typeof value === 'number')
  const values = (key) => samples.map((sample) => sample[key]).filter((value) => typeof value === 'number')
  return {
    n: samples.length,
    taskP50: percentile(task, 0.5),
    taskP95: percentile(task, 0.95),
    taskMax: task.length ? Number(Math.max(...task).toFixed(1)) : null,
    frameP50: percentile(frame, 0.5),
    frameP95: percentile(frame, 0.95),
    frameMax: frame.length ? Number(Math.max(...frame).toFixed(1)) : null,
    inputLengths: values('length').slice(0, 4),
  }
}

function summarize(record) {
  const counts = record.counts ?? {}
  const single = record.singleKey?.samples?.[0]
  return {
    kind: record.kind,
    messages: record.messages,
    focused: record.focused,
    seedMs: record.seedMs,
    mount: record.mount,
    keys: record.keys,
    durationMs: record.durationMs,
    draftLength: record.draftLength,
    samples: stats(record.samples ?? []),
    singleKey: record.singleKey ? {
      counts: record.singleKey.counts,
      taskDelta: single ? Number(single.taskDelta?.toFixed(1)) : null,
      frameDelta: single ? Number(single.frameDelta?.toFixed(1)) : null,
      draftLength: record.singleKey.draftLength,
    } : null,
    renderCounts: {
      Thread: counts.Thread ?? 0,
      AssistantMessage: counts.AssistantMessage ?? 0,
      UserMessage: counts.UserMessage ?? 0,
      Markdown: counts.Markdown ?? 0,
      renderBlocks: counts.renderBlocks ?? 0,
      parseMarkdown: counts.parseMarkdown ?? 0,
      collectMessageSources: counts.collectMessageSources ?? 0,
      answerText: counts.answerText ?? 0,
      Composer: counts.Composer ?? 0,
      Sidebar: counts.Sidebar ?? 0,
      storeSet: counts['store.set'] ?? 0,
      storeEmit: counts['store.emit'] ?? 0,
    },
    longTasks: {
      count: (record.longTasks ?? []).length,
      maxMs: (record.longTasks ?? []).reduce((max, item) => Math.max(max, item.duration), 0),
      totalMs: Number((record.longTasks ?? []).reduce((sum, item) => sum + item.duration, 0).toFixed(1)),
    },
    metrics: record.metrics,
    heapMB: record.heapUsed ? Number((record.heapUsed / 1024 / 1024).toFixed(1)) : null,
  }
}

const out = {
  label: data.label,
  bundleId: data.bundleId,
  browser: data.browser?.Browser,
  capturedAt: data.capturedAt,
  errors: data.errors,
  sizes: (data.sizes ?? []).map(summarize),
  complex: data.complex ? summarize(data.complex) : null,
  dense: (data.dense ?? []).map(summarize),
  streaming: data.streaming ? {
    messages: data.streaming.messages,
    keys: data.streaming.keys,
    samples: stats(data.streaming.samples ?? []),
    renderCounts: data.streaming.counts,
    longTasks: data.streaming.longTasks?.length ?? 0,
    stillStreaming: data.streaming.streamingStillActive,
    draftLength: data.streaming.draftLength,
  } : null,
}
console.log(JSON.stringify(out, null, 2))
if (process.argv[3]) {
  fs.mkdirSync(path.dirname(process.argv[3]), { recursive: true })
  fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 2))
}
