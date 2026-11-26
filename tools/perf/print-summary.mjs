import fs from 'node:fs'

const file = process.argv[2] ?? '.tmp/perf/results/baseline-before.summary.json'
const d = JSON.parse(fs.readFileSync(file, 'utf8'))
for (const s of d.sizes) {
  console.log(`${s.messages} msgs | seed ${s.seedMs}ms | singleKey ${s.singleKey?.taskDelta}ms | P50 ${s.samples.taskP50} P95 ${s.samples.taskP95} max ${s.samples.taskMax} | renders Thread ${s.singleKey?.counts?.Thread} Asst ${s.singleKey?.counts?.AssistantMessage} User ${s.singleKey?.counts?.UserMessage} MD ${s.singleKey?.counts?.Markdown} renderBlocks ${s.singleKey?.counts?.renderBlocks} parse ${s.singleKey?.counts?.parseMarkdown} | longtasks ${s.longTasks.count}/${s.longTasks.maxMs}ms | heap ${s.heapMB}MB | batch ${s.durationMs}ms`)
}
if (d.complex) {
  const c = d.complex
  console.log(`complex 20 | seed ${c.seedMs} | singleKey ${c.singleKey?.taskDelta} | P95 ${c.samples.taskP95} | renders Asst ${c.singleKey?.counts?.AssistantMessage} MD ${c.singleKey?.counts?.Markdown} renderBlocks ${c.singleKey?.counts?.renderBlocks} parse ${c.singleKey?.counts?.parseMarkdown} | longtasks ${c.longTasks.count}/${c.longTasks.maxMs}`)
}
if (d.dense) {
  for (const s of d.dense) {
    console.log(`dense ${s.messages} | seed ${s.seedMs} | singleKey ${s.singleKey?.taskDelta} | P50 ${s.samples.taskP50} P95 ${s.samples.taskP95} max ${s.samples.taskMax} | renders Asst ${s.singleKey?.counts?.AssistantMessage} MD ${s.singleKey?.counts?.Markdown} renderBlocks ${s.singleKey?.counts?.renderBlocks} | longtasks ${s.longTasks.count}/${s.longTasks.maxMs} | heap ${s.heapMB}`)
  }
}
if (d.streaming) {
  const st = d.streaming
  console.log(`stream300 | P50 ${st.samples.taskP50} P95 ${st.samples.taskP95} max ${st.samples.taskMax} | keys ${st.keys} | counts ${JSON.stringify(st.renderCounts)}`)
}
console.log('errors', JSON.stringify(d.errors))
