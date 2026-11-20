# 长期记忆 × 聊天记录导入：整合接口

`feature/long-term-memory` 分支实现了长期记忆的存储、检索、提取、概述和跨平台导入。
DeepSeek 官方聊天记录 ZIP 导入由另一个分支（`feature/history-import`）开发。本文件说明两边
最终整合时可以使用的接口，当前分支**不**读取 ZIP、不修改聊天记录导入功能，也不会在启动时扫描历史。

## 设计边界

- 记忆存储是唯一事实来源：`$DSH_HOME/deepseek-chat/memory.json`。所有写入都经过
  `lib/memory-store.js` 的去重/合并/墓碑逻辑，没有第二套记忆库。
- 会话消息格式不变：历史导入分支只需要把**已解析的消息**交给记忆提取接口，不需要
  修改 `state.json` 或 Chat 的消息树。
- 提取是用户主动触发的：接口本身不扫描、不定时运行；由调用方（导入 UI）在用户选择会话后调用。

## Host 内部接口（Node）

```js
// lib/memory.js
const result = await service.memory.extractFromMessages({
  messages,        // 已解析的会话消息数组
  title: '会话标题',
  locale: 'zh',    // 'zh' | 'en'，影响提示词与结果语言
  save: false,     // false = 只返回候选；true = 立即合并进 Memory
  source: { type: 'conversation', conversationId: '外部会话 id', label: '会话标题' },
  maxMessages: 40, // 单次分析的消息上限（默认 40）
})
// => {
//   candidates: [{ content, category }],   // 已校验、去重、过滤敏感信息的候选
//   saved: null | { added, merged, updated, skipped, invalid, items },
// }
```

`messages` 同时接受两种形状：

- 本插件/DSH 的存储消息：用户 `{ role: 'user', content }`，助手 `{ role: 'assistant', blocks: [{ type: 'text', text }] }`；
- 规范化消息：`{ role: 'user' | 'assistant', content: '...' }`。

`maxMessages` 之前的消息会被截断；需要覆盖整段长会话时，调用方按时间顺序分块调用，
并对候选做一次 `store.previewEntries()` 检查，避免分块之间重复。

## HTTP 接口（Client / 其他模块）

`POST /api/deepseek-chat/memory`，owner-only，JSON 请求：

```js
// 1) 分析（不写入）
{ action: 'extract.session', title, messages, locale, source? }
// => { candidates: [{ content, category }], saved: null, ...snapshot }

// 2) 让用户确认候选后合并（不会覆盖已有记忆）
{ action: 'import', entries: [{ content, category, mode: 'auto' }], platform: 'other' }
// => { ...snapshot, result: { added, merged, updated, skipped, invalid, items } }
```

也可以直接 `save: true` 让 `extract.session` 在分析后立即合并（适合一键导入并且调用方
已经获得用户确认的场景）。两种方式都走同一套去重、合并、墓碑与修订号逻辑。

## 推荐整合流程

1. **导入聊天记录**（`feature/history-import` 现有功能）：解析 ZIP、展示会话列表，不触碰 Memory。
2. **用户选择要提取的会话**：在导入完成页或 Memory 设置页提供“从聊天记录提取记忆”入口，
   必须由用户勾选/确认，默认不分析全部历史。
3. **批量分析**：对每个选中会话调用一次 `extract.session`（`save: false`），限制并发
   （建议 1–2 个并发），把候选聚合去重后展示。
4. **预览与确认**：用 `preview` 动作标注重复/冲突/敏感条目，允许用户勾选与编辑。
5. **合并**：只把用户确认的条目通过 `import` 写入；重复导入同一批不会产生重复记忆；
   已删除的记忆有墓碑，不会被旧会话重新提取回来。
6. 记忆发生实质变化后 `revision` 增加，记忆概述自动标记为过期，下次打开 Memory 页面
   或用户点击「重新整理」时才生成新的概述。

## 注意事项

- 提取需要调用 DeepSeek API，可能产生额外费用；只能在用户明确发起并确认后调用。
- 会话内容属于私人数据：不要写入日志，不要在未确认时发送；Extraction 接口会在
  `save` 时按“对话来源”过滤敏感信息（证件号、银行卡、联系方式、密码等）。
- 分块提取可能对同一事实给出不同措辞；`import` 的 `auto` 模式会跳过完全重复、合并高度
  相似的内容，其余作为独立记忆保存，不会静默覆盖用户原有记忆。
- 本分支不提供 ZIP 解析、不让记忆模块依赖导入模块；两边通过上面的函数/HTTP 动作解耦。
