# 长期记忆 × 聊天记录导入：整合接口

`feature/long-term-memory` 提供记忆存储、检索、提取、概述和跨平台导入；
`feature/history-import` 提供 DeepSeek 官方聊天记录 ZIP 解析与导入。两者在
`integration/v0.2.0` 中打通：导入完成后可以选择部分已导入会话，先预览候选，
用户确认后才写入记忆。两边仍然解耦——导入模块不依赖记忆模块，记忆模块不读取 ZIP，
也不在启动时扫描历史。

## 设计边界

- 记忆存储是唯一事实来源：`$DSH_HOME/deepseek-chat/memory.json`。所有写入都经过
  `lib/memory-store.js` 的去重/合并/墓碑逻辑，没有第二套记忆库。
- 会话消息格式不变：整合只读取导入会话的当前分支消息，并在来源元数据里记录分析时间，
  不修改 `state.json` 的消息树、标题或排序。
- 提取是用户主动触发的：没有后台扫描、没有定时任务；只有用户在导入完成页或
  「长期记忆」设置页选中会话并确认费用提示后，才会调用模型。
- 分析（`extract.imported`）与合并（`import`）分离：分析只返回预览候选，不保存；
  用户确认后走原有的记忆合并入口，重复/冲突/敏感标记、去重和墓碑全部复用。

## 已实现流程

1. **导入聊天记录**：解析 ZIP、展示会话列表，不触碰 Memory。
2. **可选入口**：导入完成页显示「从这次导入中提取长期记忆」；关闭后仍可在
   Chat 设置 → 长期记忆 → 「从导入的聊天记录提取」重新打开。
3. **选择会话**：弹窗只列出有 `source` 的导入会话；已分析过的带「已分析」标记并默认
   跳过（可显式勾选「重新分析已提取过的会话」）。默认不勾选任何内容。
4. **费用确认**：弹窗说明每个会话一次额外 API 调用及可能的用量费用，只有点击
   「确认并开始分析」才会发送会话内容。
5. **逐个分析**：Host 按会话逐个调用 `MemoryService.extractFromMessages({ save: false })`，
   限制最多 20 个会话/批；单个会话失败只记录在 `failed`，继续分析其余会话。
6. **预览与确认**：候选先去掉批内完全重复再交给 `previewEntries()`，返回重复/冲突/
   敏感标记；用户在预览里可编辑、改分类、选择跳过/合并/更新，确认后调用 `import`。
7. **避免重复**：分析成功的会话写入 `source.memoryExtractedAt`（持久化在
   `state.json`），之后默认跳过；失败不写标记，可在修复后重试。已删除记忆的墓碑仍会
   阻止旧会话把同一事实重新加回来。
8. **失败隔离**：整个流程不写聊天历史；分析失败只会显示提示，已导入聊天可照常阅读、
   搜索、继续对话。

## Host 内部接口（Node）

```js
// lib/memory.js
const result = await service.memory.extractFromMessages({
  messages,        // 当前分支消息；接受存储消息或 { role, content } 形状
  title: '会话标题',
  locale: 'zh',    // 'zh' | 'en'，影响提示词与结果语言
  save: false,     // false = 只返回候选；true = 立即合并进 Memory
  source: { type: 'conversation', conversationId: '外部会话 id', label: '会话标题' },
  maxMessages: 40, // 单次分析的消息上限（默认 40）
})
// => { candidates: [{ content, category }], saved: null | { added, merged, ... } }
```

```js
// lib/store.js
await store.markMemoryExtracted([conversationId], Date.now())
// 只标记有 source 的导入会话，返回实际写入的 id；聊天消息与 updatedAt 不变。
```

## HTTP 接口（Client / 其他模块）

`POST /api/deepseek-chat/memory`，owner-only，JSON 请求：

```js
// 1) 分析导入会话（不写入；必须显式同意）
{
  action: 'extract.imported',
  conversationIds: ['...'],
  consent: true,
  reanalyze: false,     // true 时忽略已分析标记
  locale: 'zh',
}
// => {
//   analyzed: 1, analyzedIds: ['...'],
//   skipped: [{ id, reason: 'already-extracted' | 'not-imported' | 'missing' }],
//   failed: [{ id, reason }],
//   entries: [{ content, category, sensitive, match }],  // previewEntries 形状
//   limits: { ... },
// }
// 没有 consent: true 时返回 400 CONSENT_REQUIRED，且不会发出任何模型请求。

// 2) 让用户确认候选后合并（不会覆盖已有记忆）
{ action: 'import', platform: 'other', entries: [{ content, category, mode: 'auto' }] }
// => { ...snapshot, result: { added, merged, updated, skipped, invalid, items } }
```

低层接口 `extract.session`（客户端直接提供消息数组）仍然保留，用于不经过会话存储的
调用方；`extract.imported` 只是在它的基础上从 `state.json` 读取当前分支消息。

## 注意事项

- 提取需要调用 DeepSeek API，可能产生额外费用；只在用户明确发起并确认后调用。
- 会话内容属于私人数据：Host 不把消息写入日志；未确认时不会发送。Extraction 在保存
  路径上会过滤敏感信息（证件号、银行卡、联系方式、密码等）。
- 一次最多分析 20 个会话；会话内的消息按现有 `SESSION_EXTRACT_MAX_MESSAGES` 截断。
- 分块提取可能对同一事实给出不同措辞；`import` 的 `auto` 模式会跳过完全重复、合并高度
  相似的内容，其余作为独立记忆保存，不会静默覆盖用户原有记忆。
- 记忆发生实质变化后 `revision` 增加，记忆概述自动标记为过期，下次打开 Memory 页面
  或用户点击「重新整理」时才生成新的概述。
- 本整合没有引入新的第三方依赖，也没有改动 ZIP 解析或记忆检索的内部实现。
