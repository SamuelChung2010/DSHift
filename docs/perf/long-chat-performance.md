# 长会话输入卡顿专项：根因、修复与性能验收

分支：`fix/long-chat-performance`（worktree `C:\Users\Zhong\Documents\dsh-chat-perf`）；集成分支最终合入 `main`
基线：`87721ec`（`origin/main`，`develop` 当前稳定维护基线）
状态：数学改动与性能修复已完成、合并，并已发布 `v0.2.0-beta.4`（2026-11-27；GitHub Release）

---

## 0. 结论摘要

在 Windows 11 + Chrome 158（真实 DSH Web UI，合成数据）上：

| 场景 | 修复前 | 修复后 | 结果 |
| --- | --- | --- | --- |
| 300 条普通会话，输入 P95 | 22.2 ms | **8.2 ms** | 达成 < 50 ms |
| 500 条普通会话，输入 P95 | 32.0 ms | **16.6 ms** | 达成 < 50 ms |
| 300 条密集 Markdown 会话，输入 P95 | 69.8 ms | **11.8 ms** | 达成 < 50 ms |
| 500 条密集 Markdown 会话，输入 P95 | 118.3 ms | **14.5 ms** | 达成 < 50 ms |
| 500 条会话，单次普通按键重渲染 | Thread×1、消息×250、Markdown×250 | **Thread×0、消息×0、Markdown×0**，仅 Composer×1 | 达成 |
| 300 条会话，历史 Markdown 重算/按键 | 250 次 `renderBlocks` | **0** | 达成 |
| 300 条会话，流式输出期间输入 P95 | 29.0 ms | **14.3 ms** | 保持响应 |
| 300 条会话，一轮流式消息组件重渲染 | 约 8,607 次 | **约 195 次** | 只更新当前消息 |

- 修复前的用户反馈“约一秒才显示字符”在本机基准中对应 **密集 500 条会话 P95 118 ms、单键最差 104.6 ms**；真实设备/真实回答越长，绝对值还会更高。修复后同一数据为 **P95 14.5 ms**。
- 未引入任何外部依赖；未改存储格式、Host API、模型请求语义、UI 外观；未使用真实聊天记录。
- 只完成了 Windows 实测；macOS 未实测（无设备），见第 8 节。

---

## 1. 环境与测量方法

| 项 | 值 |
| --- | --- |
| OS | Windows 11 Pro 10.0.26300 |
| CPU | Intel Core Ultra 5 228V，8 核 8 线程 |
| RAM | 31.5 GB |
| 浏览器 | Chrome 158.0.8127.88，headless=new，1440×900 |
| Runtime | Node 24.19.0；DSH Web UI（`dsh --profile perf`） |
| 页面 | 真实 `@local/deepseek-chat-mode` 客户端 + 真实 React 18.3.1 |
| 数据 | 纯合成会话，10/50/100/300/500 条；另有 20 条复杂 Markdown 和 300/500 条密集 Markdown |
| 基线 bundle | 从 `87721ec` 源码用 `tools/build-client.js` 重新构建 |
| 修复 bundle | 本分支源码同流程构建 |
| 采样 | CDP `Input.dispatchKeyEvent` 真实按键；每次 8–12 个字符，间隔 90–150 ms |

**延迟定义**：页面 `input` 事件的 `timeStamp` → 更新帧的 `requestAnimationFrame` 回调 → 在帧后调度 `setTimeout(0)` 读取的时间。该定义包含浏览器事件排队、React 提交、样式/布局、绘制以及一次定时器余量，偏保守（比“输入到首帧”多 4–16 ms）。目标 P95 < 50 ms 按此口径比较。

**渲染计数**：对基线/修复使用同一套测试专属 bundle 注入（`tools/perf/instrument-client.mjs`），只统计组件函数调用，不随产品发布。单键计数在按键前重置计数器，按键后等待 900 ms 读取，确保没有其他 store 活动干扰。

**隔离**：用独立 `DSH_HOME`（junction 到已安装依赖，只把 `@local/deepseek-chat-mode` 指向测试 bundle）运行 `dsh --profile <test> --no-open --port 56xxx`；浏览器注入合成消息，只调用客户端 store。没有读取或写入任何真实会话，未改动桌面 profile。

> 说明：headless Chrome 与 Electron 的 GPU/合成路径不完全相同，绝对值不能直接外推到桌面窗口；但基线/修复在同设备、同浏览器、同数据下比较，相对改善有效。macOS 未验证。

---

## 2. 根因（逐项经实测确认）

| # | 问题 | 源码位置（修复前） | 实测证据 |
| --- | --- | --- | --- |
| 1 | `useChat` 只用 `useState` 强制更新，从不比较 selector 结果 | `client-src/20-store.js:231` | 一次 `draft` 写入让全部订阅组件重渲染；500 条会话单键 Thread×1 + 250 条消息 + 250 Markdown |
| 2 | `chatStore.set()` 无条件 `emit()`，相同值也广播 | `client-src/20-store.js:217` | 相同 draft/相同 `stopping` 也触发整树通知 |
| 3 | Composer 订阅完整 store，并额外订阅 `modelChoice` 却忽略返回值 | `client-src/50-components.js:880-881` | 每键连带 Composer 内菜单/工具、整树订阅者更新 |
| 4 | Thread 每次渲染 `messages.map()`，消息组件无 memo | `client-src/50-components.js:815` | 250 条 Assistant + 250 条 User 每键重渲染 |
| 5 | Markdown 每次渲染重新执行 `renderBlocks()` | `client-src/30-markdown.js:821-827` | 500 条密集会话单键 1,000 次 `renderBlocks`（250 条消息 × 4 个块级调用） |
| 6 | VersionNav 每条消息单独订阅 streaming | `client-src/50-components.js:492` | 500 条消息 = 500 个额外订阅；流式期间 17,100 次 VersionNav 渲染 |
| 7 | ChatHeader 订阅整个 `messages` 数组 | `client-src/50-components.js:1557` | 每个流式 chunk 都重渲染标题行 |
| 8 | ToolsMenu 订阅整个 store | `client-src/48-tools.js:195` | 草稿/流式帧都触发菜单重渲染 |
| 9 | 消息行没有布局隔离 | `client-src/60-style.js:925` | 密集 500 条布局树约 **189,566** 个对象；每键多次全量 Layout/PrePaint（PrePaint 单次 32 ms） |

**不是根因、但需保留的现有优化**：`parseMarkdown` 已按 `text` 做 `useMemo`（单键 parse=0）；`CodeBlock` 已有 memo；流式已按 rAF 合并；`useAutoScroll` 只在消息变化时执行。以上均未被破坏。

---

## 3. 修复方案

### 3.1 `useChat`：`useSyncExternalStore` + 选择器快照缓存

- 已确认 Harness Web 端打包的是 **React 18.3.1**（`dsh-web-frontend` 依赖 `react ^18.2.0`，bundle 内版本标记 18.3.1），`useSyncExternalStore` 可用；未新增依赖。
- 新实现（`client-src/20-store.js:259-336`）：
  - `createChatSelectorCache()` 以 `(state, selector, isEqual)` 为键缓存选中值；同一 state 重复读取返回同一引用。
  - 默认 `Object.is`；派生对象/数组必须传 `shallowEqual`，否则缓存会持续产生新引用。
  - `getSnapshot`/`subscribe` 用 `useCallback(..., [])` 保持稳定，避免每次渲染重新订阅。
  - selector 仍可在每次渲染传入内联闭包；缓存会比较新旧选择结果。
- 审计了全部 60+ 个 `useChat` 调用：返回原始值、null 或稳定 store 引用的保持默认；只有 Composer 和 ToolsMenu 的派生对象使用 `shallowEqual`。
- `useT()` 的 locale 订阅保持不变。

### 3.2 Store 写入去重

`chatStore.set(patch)`（`client-src/20-store.js:228`）先逐字段 `Object.is` 比较，未变化直接返回 `false`，既不替换 state，也不 emit。无调用方依赖“相同值也通知”的行为。

### 3.3 输入与历史渲染隔离

- `Thread` 只订阅 `messages/streaming/activeId/loading/error/editingId/focusMessage`，不再受 `draft` 影响。
- `AssistantMessage`、`UserMessage` 包装为 `React.memo`；Thread 传入的消息对象在流式 patch 中只替换当前消息，历史对象引用保持不变，因此 memo 命中。
- `AssistantMessage` 内 `messageText`、`collectMessageSources`、`answerText`、notice 过滤按 `message` 引用缓存。
- `VersionNav` 不再自己订阅 streaming，改由父组件传入 `busy`。
- Header 改为订阅 `messages.length > 0` / blank 布尔值，不再订阅数组。
- Composer 去掉整店订阅；能力状态用 `{settings, modelChoice, models, modelConfig}` 的浅比较选择，工具按钮读取渲染时的实时 `chatStore.state`。
- `ToolsMenu` 只订阅 `toolsMenuState`（settings/attachments/model 等），draft、messages、toasts 不再触发。

### 3.4 Markdown

- `Markdown` 用 `React.memo`；`parseMarkdown` 与 `renderBlocks` 的结果均按 `[text]` / `[blocks, context]` 缓存（`client-src/30-markdown.js:821-839`）。
- 没有引入全局无界缓存：解析/元素缓存的生命周期跟随消息组件，会话卸载即释放；避免“全局渲染缓存随会话增长”的内存风险。
- 流式时仍只对当前消息重新解析/渲染，历史消息完全跳过。

### 3.5 长会话布局隔离（第五阶段）

- 仅当 `messages.length >= 120` 时，Thread 加 `is-heavy` 类；对应 CSS：`.dsc-thread.is-heavy .dsc-msg { contain: layout style; }`（`client-src/60-style.js:936`）。
- 没有使用 `content-visibility`/虚拟列表/截断/隐藏：实测 `content-visibility` 也能把 P95 降到约 25 ms，但 `contain-intrinsic-size` 会估算未渲染行高，滚动高度/滚动条位置可能变化；`contain: layout style` 的 **几何、scrollHeight、行高、搜索跳转全部与修复前一致**（见 5.1），且不裁剪任何内容。
- 短会话不应用 containment，保持原有挂载成本；长会话用一次挂载布局换取后续每次按键的隔离。

### 3.6 兼容性与约束

- 未新增 npm/pip/运行时依赖；未修改 Harness 本体；未改 Chat/Agent 模式切换、Host API、存储格式、模型请求。
- 未改 UI 外观；`contain` 不改变行几何；主题、语言、复制、编辑、版本切换、引用、上传逻辑未动。
- IME：输入框仍是受控 textarea，`draft` 仍在 store 中；`composerKeySends` 的 `isComposing`/`keyCode 229` 规则未变，并新增了单测。

---

## 4. 性能数据

原始数据：`docs/perf/baseline-before.json`、`docs/perf/fixed-after.json`（含逐键样本与计数）。

### 4.1 普通会话（12 键，120 ms 间隔）

| 消息数 | 修复前 P95 | 修复后 P95 | 修复前单键渲染（Asst/User/MD） | 修复后 |
| --- | --- | --- | --- | --- |
| 10 | 9.0 ms | 7.1 ms | 5 / 5 / 5 | 0 / 0 / 0 |
| 50 | 12.0 ms | 7.3 ms | 25 / 25 / 25 | 0 / 0 / 0 |
| 100 | 13.3 ms | 12.0 ms | 50 / 50 / 50 | 0 / 0 / 0 |
| 300 | 22.2 ms | **8.2 ms** | 150 / 150 / 150 | 0 / 0 / 0 |
| 500 | 32.0 ms | **16.6 ms** | 250 / 250 / 250 | 0 / 0 / 0 |

单键 Component 计数（修复后）：Thread=0、Assistant=0、User=0、Markdown=0、`renderBlocks`=0、`parseMarkdown`=0；`Composer`=1、`store.set`=1、`store.emit`=1。

### 4.2 密集 Markdown（代码块、表格、LaTeX、引用、来源；每键 8 字符）

| 消息数 | 修复前 P95 | 修复后 P95 | 修复前单键 `renderBlocks` | 修复后 |
| --- | --- | --- | --- | --- |
| 300 | 69.8 ms | **11.8 ms** | 600 | 0 |
| 500 | 118.3 ms | **14.5 ms** | 1,000 | 0 |

单键延迟：300 条 72.9 → 17.6 ms；500 条 **104.6 → 22.4 ms**。

### 4.3 复杂 Markdown 会话（20 条，含 Mermaid/LaTeX/表格/代码）

| | 修复前 | 修复后 |
| --- | --- | --- |
| 输入 P95 | 11.3 ms | 12.0 ms |
| 单键延迟 | 12.5 ms | 8.5 ms |
| 单键 Assistant/Markdown | 10 / 10 | 0 / 0 |

短会话没有引入 containment，差异在噪声范围内；功能正常（Mermaid/LaTeX/代码高亮检查见第 5 节）。

### 4.4 流式输出期间输入（300 条，56 个流式 chunk + 10 次按键）

| 指标 | 修复前 | 修复后 |
| --- | --- | --- |
| 输入 P95 | 29.0 ms | **14.3 ms** |
| Thread 渲染 | 57 | 45 |
| AssistantMessage | 8,607 | **195** |
| UserMessage | 8,550 | 150（流开始/结束各一次） |
| Markdown | 8,607 | **45** |
| VersionNav | 17,100 | 300（流开始/结束各一次） |
| `collectMessageSources` / `answerText` | 8,607 / 8,607 | **45 / 45** |
| `parseMarkdown` | 47 | **45（仅当前流式消息）** |

### 4.5 初次挂载（公平口径：seed + 等待全部行渲染，单次运行）

| 会话 | 修复前 | 修复后 |
| --- | --- | --- |
| 10 条 | 85.3 ms | 90.5 ms |
| 100 条 | 76.5 ms | 95.5 ms |
| 500 条 | 375 ms | 412 ms |
| 500 条密集 | 2,786 ms | 3,226 ms |

短会话均 < 100 ms，处于同一量级；长会话挂载受 containment 和新增 memo 开销影响约 10–15%，但挂载本就是一次性成本，输入路径收益为 5–8 倍。该表单次运行波动约 ±20%，仅作趋势参考。

### 4.6 合并数学改动后的复核

数学公式改动与性能修复合并成最终发布构建后，用同一脚本复测（Windows 11 / Chrome 158，同一测试口径）：

| 场景 | 合并前修复构建 P95 | 合并后发布构建 P95 |
| --- | --- | --- |
| 300 条普通会话 | 8.2 ms | 9.5 ms |
| 500 条普通会话 | 16.6 ms | 9.1 ms |
| 300 条密集 Markdown | 11.8 ms | 9.5 ms |
| 500 条密集 Markdown | 14.5 ms | 9.0 ms |
| 300 条流式期间输入 | 14.3 ms | 9.0 ms |

单键历史组件计数仍为 0（Thread / AssistantMessage / UserMessage / Markdown / renderBlocks），只有 Composer 重渲染。数学改动没有引入输入性能回退。原始数据：`docs/perf/merged-after.json`。

### 4.7 布局/绘制证据

- 修复前密集 500 条：布局树 **189,566** 个对象；单键触发多次 Layout（每次约 4–5 ms）与 PrePaint（单次约 32 ms）。
- 加入最小 containment 后，同数据按键 P50 从约 53 ms 降到约 14 ms（实验注入）；正式实现仅在 ≥120 行时启用，修复后 P95 14.5 ms。
- 未使用 `content-visibility` 的正式实现理由见 3.5。

---

## 5. 正确性与回归验证

### 5.1 containment 的几何/视觉验证

- 500 条密集会话，注入前后：`scrollHeight` **651,027 → 651,027**；总行高 **638,015 → 638,015**；首行高 73.5、末行高 2,474.6 完全一致。
- 滚动到顶部：首条历史正常显示；`focusMessage` 跳到第 201 条消息，目标行中心与容器中心偏移 **0 px**，目标行正常渲染。
- 视口截图对比：除输入光标闪烁外无可见差异（同一帧几何、无裁剪/重排）。
- 未隐藏、截断、删除任何历史；搜索、定位、复制、编辑、版本切换所依赖的 DOM 完整保留。

### 5.2 自动化测试

`node --test tests/*.test.js`：**125 通过，0 失败**（新增 `tests/client-store.test.js` 9 项）：

- selector 缓存：`draft` 更新不改变 messages/streaming 快照；messages 变化时更新。
- 派生对象在 `shallowEqual` 下保持引用；`Object.is` 下不会错误地“稳定”。
- `chatStore.set` 无变化不 emit、不替换 state；真实变化只 emit 一次。
- 监听器隔离/退订。
- `shallowEqual` 语义。
- 中文/日文 IME：`isComposing`、`keyCode 229` 不发送；commit 文本不触发发送。
- Enter / Ctrl+Enter / Shift / Meta 的既有发送规则。

### 5.3 项目检查

| 检查 | 结果 |
| --- | --- |
| `node tools/smoke-client.js` | SMOKE_OK |
| `node tools/check-css.js` | CSS_OK（803 对括号） |
| `node tools/check-classes.js` | 459 定义 / 459 使用，无缺失/未用 |
| `node tools/check-i18n.js` | 通过 |
| `node tools/check-highlight.js` | HIGHLIGHT_OK，4,100 项检查 |
| `node tools/check-math.js` | MATH_OK |
| `node tools/check-markdown-math.js` | CHAT_MATH_OK |
| `node tools/check-mermaid.js` | MERMAID_OK（335 项） |
| `node tools/check-upload.js` | UPLOAD_OK（16 入口、20 次模式切换） |
| `node tools/check-memory-client.js` | MEMORY_CLIENT_OK |

> `check-memory-client.js` 和 `tools/smoke-client.js` 的 React shim 增加了 `useSyncExternalStore`；`check-memory-client.js` 的 `SettingsDialog` 用例索引随 hook 数量变化同步调整。这只是测试夹具，不影响产品运行。

### 5.4 行为保留

- 会话切换、草稿清空/恢复、附件、粘贴、拖放、快捷键、发送、停止、编辑、重新生成、续写、版本切换、来源引用、搜索定位、主题/语言切换均由既有 125 项测试和上述检查覆盖；未修改对应逻辑。
- 流式开始/结束时，用户行与带版本消息会各重渲染一次（`canEdit/busy` 变化），这是必要的交互状态更新，不是每 chunk 重渲染。

---

## 6. 修改文件

产品源码：

| 文件 | 变更 |
| --- | --- |
| `client-src/20-store.js` | `useChat` 改为 `useSyncExternalStore` + 选择器缓存；新增 `shallowEqual`；`set()` 去重 |
| `client-src/30-markdown.js` | `MemoMarkdown`；缓存 `renderBlocks` 结果 |
| `client-src/48-tools.js` | `toolsMenuState` 精准订阅，移除整店订阅 |
| `client-src/50-components.js` | 消息/Thread/Composer/Header 订阅与 memo 改造；`VersionNav` 改传 `busy`；`is-heavy` 阈值 |
| `client-src/58-memory.js` | 使用 `MemoMarkdown` |
| `client-src/60-style.js` | 长会话 `.dsc-msg` 的 `contain: layout style` |
| `client-src/70-main.js` | 测试 hook 暴露 `useChat/shallowEqual/createChatSelectorCache` |
| `client.js` | 用 `tools/build-client.js` 重新生成 |

测试/工具：

- `tests/client-store.test.js`（新增）
- `tools/smoke-client.js`、`tools/check-memory-client.js`（React shim 适配）
- `tools/perf/`（新增：CDP 基准、数据生成、组件计数注入、profile 创建、汇总脚本；不进入发布包）
- `docs/perf/`（基线/修复数据与本报告）

---

## 7. 残余瓶颈与后续建议

1. **长会话初次挂载**：500 条密集内容挂载仍需约 3.2 s（修复前约 2.8 s），主要成本是约 19 万个 DOM 对象（KaTeX/代码/表格）的一次性创建和布局，不在输入路径。后续可评估：
   - 分帧挂载/分段渲染（先渲染最近 N 条，空闲时补齐），需保持滚动锚点与搜索定位；
   - `content-visibility` + 精确的 `contain-intrinsic-size` 测量缓存（本次因滚动高度风险未采用）；
   - 零依赖虚拟列表是更后面的选项，需先解决搜索/定位/复制/分支切换。
2. **Composer 本身的每键渲染**：受控 textarea 需要同步更新；当前每键约 1–3 ms。`useLayoutEffect` 自动高度仍会强制一次 textarea 布局；可评估 `field-sizing: content`（Chromium 支持，但需为其他浏览器保留回退）。
3. **流式开始/结束的一次性行更新**：`busy/canEdit/canRegenerate` 变化会导致历史行各渲染一次；每轮 2 次而不是每 chunk，当前可接受。若后续追求更极端，可把禁用态下沉到按钮级订阅。
4. **`useT` 的逐消息 locale 订阅**：语言切换会重渲染所有消息；低频操作，未改。
5. **未实测平台**：macOS、真实 Electron 窗口、真实 IME 候选词交互、真实长回答。需要在 macOS 上重跑同一脚本并做 IME 手工验证。

---

## 8. Windows/macOS 验证情况

- **Windows 11**：已完成构建、125 项测试、全部静态检查、上述性能对比与 containment 几何/视觉验证。
- **macOS**：**未实测**（当前环境无 macOS 设备）。`html[data-platform='darwin']` 的布局分支、macOS IME、Electron 合成路径未覆盖；发布前需在 Mac 上复跑 `tools/perf` 并人工验证中文/日文输入法。
- **Electron 桌面窗口**：性能数据来自同一份 Web 客户端 + Chrome 158 headless；未在 Electron 窗口内接 DevTools 实测（运行中的桌面实例未开启调试端口）。绝对值需在 Electron 上复核，但基线/修复的架构差异与浏览器无关。

---

## 9. Git 与 Worktree 状态

- 数学改动：`5701147 feat(chat): render boxed and fenced TeX formulas`（`develop`）。
- 性能修复：`9334a63 fix(chat): keep long histories out of the input render path`（`fix/long-chat-performance`）。
- 集成：`ca80c2b merge: integrate math rendering work into long-chat performance branch`。
- 发布提交：`e8d39de chore(release): prepare dsh-chat v0.2.0 Beta 4`（`main`），tag `v0.2.0-beta.4`。
- GitHub Release：<https://github.com/SamuelChung2010/DSHift/releases/tag/v0.2.0-beta.4>（2026-11-27）。
- Worktree：`C:\Users\Zhong\Documents\dsh-chat-perf` 与 `C:\Users\Zhong\Documents\dsh-chat-main`；`develop` 工作区只留下与本发布无关的 `promo/` 宣传素材，未提交。
- 发布包、校验和与验证记录位于 `.release/v0.2.0-beta.4/`，GitHub Release 使用同一版本。

---

## 10. 是否达到 v0.2.0-beta.4 发布条件

**性能与回归层面：在 Windows/Chrome 基线下达到本轮目标**（300 条 P95 8.2 ms、500 条 16.6 ms、密集 500 条 14.5 ms、流式期间 14.3 ms；合并数学改动后的最终构建复核为 9.5 / 9.1 / 9.0 / 9.0 ms；历史组件每键 0 重渲染；功能测试全绿）。

**已知限制（发布说明中保留）**：
1. macOS 实机复跑与中文/日文 IME 人工验证尚未完成；
2. Electron 窗口内的绝对延迟未单独测量（headless Chrome 数据用于同设备相对比较）；
3. 长会话首次挂载（500 条密集内容）仍约 3 秒，属一次性成本。

经作者确认，以上限制不阻塞 `v0.2.0-beta.4` beta 发布；该版本已于 2026-11-27 发布。后续补 macOS/Electron 验证与长会话挂载优化。

---

## 附录 A：复现

```powershell
# 1. 构建客户端
node tools/build-client.js

# 2. 行为回归
node --test tests/*.test.js
node tools/smoke-client.js
node tools/check-css.js
# ... 其余 check-*.js

# 3. 性能基准（需要 Chrome 与本机 DSH 安装；脚本不新增依赖）
#    按 tools/perf/README.md 创建隔离 profile，启动 dsh web，然后：
node tools/perf/run-suite.mjs "<redacted web url>" baseline .tmp/perf/results/baseline.json
node tools/perf/summarize.mjs .tmp/perf/results/baseline.json .tmp/perf/results/baseline.summary.json
node tools/perf/print-summary.mjs .tmp/perf/results/baseline.summary.json
```

## 附录 B：证据文件

- `docs/perf/baseline-before.json` / `.summary.json`：87721ec 基线
- `docs/perf/fixed-after.json` / `.summary.json`：本分支修复后
- `docs/perf/mount-baseline.json`、`docs/perf/mount-after.json`：挂载对比
- 单键样本包含 `taskDelta`（输入→帧后任务）与组件计数；流式样本包含每个 chunk 的 store 写入与组件计数。
