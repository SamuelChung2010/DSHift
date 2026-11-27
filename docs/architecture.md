# DSHift 架构说明

本文面向维护者，说明 Host / Client 的职责划分、状态与渲染模型、流式协议、导入与记忆管线。用户操作见 [用户指南](user-guide.md)，部署参数见 [配置说明](configuration.md)。

## 总览

DSHift 是一个 DSH 插件包，内部包名保持 `@local/deepseek-chat-mode`（兼容既有安装与数据路径），对外名称是 **DSHift**。

```text
index.js                  Host 插件入口（apply / 路由注册 / 生命周期）
lib/
  api.js                  owner-only HTTP 路由与参数校验
  service.js              DeepSeek Messages / Files API 代理、SSE、标题、记忆注入
  protocol.js             上下文构造、send/edit/regenerate/continue 请求
  store.js                会话节点树、文件夹、置顶、归档、搜索、持久化
  model-config.js         模型目录、能力、推理等级、按会话偏好
  import/                 ZIP 读取、导出转换、图片库、后台导入
  memory*.js              记忆提取、存储、检索、概述与 Ask/Update
client-src/*.js           浏览器端源码（构建时拼接为 client.js）
client.js                 构建产物（勿手改）
cordis.patch.yml          DSH profile 插件行与默认配置
```

`client.js` 由 `tools/build-client.js` 按固定顺序拼接 `client-src/*.js`，再包装成 `window.__ModuleLoader__.load(...)` 工厂。它只 `require('react')`，不复制 React，也不加载 Harness 的 Client 包。

## Host 与 Client 的边界

- **Host**：`index.js` + `lib/`。通过 `ctx.connection.fetch` 注册 owner-only 路由；持有 API Key、调用 DeepSeek、读写本机文件、执行导入和记忆提取。浏览器不直接接触凭证。
- **Client**：`client.js`。通过 `shell.overlay` 渲染全屏 Chat，并在同一个 overlay 注册 root 级的 `deepseek-chat-mode:mode-switch`，作为 Chat / Agent 共享的顶层导航。所有样式使用 `--dsw-*` 主题变量。
- **数据路径**：固定为 `$DSH_HOME/deepseek-chat/`。内部 ID、`state.json` v2 结构、`memory.json`、`model-config.json` 和导入媒体路径都不因改名而改变。

Host 路由：

| 路由 | 职责 |
| --- | --- |
| `/api/deepseek-chat/bootstrap` | 模型目录、能力、认证与插件配置 |
| `/api/deepseek-chat/stream` | send / edit / regenerate / continue 的统一 NDJSON 流 |
| `/api/deepseek-chat/upload` | 文件上传到 DeepSeek Files API |
| `/api/deepseek-chat/model` | 读写按会话的模型/推理等级偏好 |
| `/api/deepseek-chat/workspace` | 创建项目文件夹并注册 Harness 工作区 |
| `/api/deepseek-chat/profile` | 读取已登录账号显示名（Host 缓存 60 秒） |
| `/api/deepseek-chat/import/*` | 上传、预览、启动、状态、取消、丢弃、媒体读取 |
| `/api/deepseek-chat/memory` | 记忆读写、预览、导入、概述、Ask/确认与 AI 整理 |

## 状态管理

### 存储模型

`lib/store.js` 把每个会话保存为一棵消息节点树：

- `nodes` + `leafId`：`messages` 由当前分支推导；编辑和重新生成只新增兄弟节点，不覆盖旧节点。
- 切换版本只改变 `leafId`；`presentPath()` 只把当前分支交给协议层。
- 文件夹、置顶、归档状态保存在同一个 `state.json` 中。
- 数据格式为 **v2**；旧 v1 线性历史在加载时迁移，迁移前保留 `state.json.v1-backup-<时间戳>`。
- 写入采用原子替换；导入前保留 `state.json.import-backup-<时间戳>`。
- 历史搜索在本地线性扫描标题与正文，不引入额外数据库或搜索索引服务。

客户端 store 是一个轻量对象（`client-src/20-store.js`），保存会话摘要、当前消息、流式 holder、草稿、附件、对话框状态等。它没有引入 Zustand/Redux 等外部状态库。

### 精确订阅（Beta 4）

旧实现的 `useChat(selector)` 只做强制重渲染，不比较 selector 结果；任何 store 变更都会让所有订阅组件更新。Beta 4 改为 `useSyncExternalStore`：

- React 18.3.1 提供 `useSyncExternalStore`（Harness Web 客户端内置，无需新依赖）。
- 每个 hook 持有选择器快照缓存：相同 state + 相同 selector + 相同相等函数时直接返回缓存值；否则用 `Object.is` 或 `shallowEqual` 比较新旧选择结果，相等时保留旧引用。
- selector 可以是每次渲染新建的内联闭包；缓存会识别选择结果是否等价。
- `chatStore.set(patch)` 先逐字段比较，无变化时既不替换 state 也不 emit；避免相同草稿、相同 `stopping` 等无意义广播。
- 返回对象/数组的 selector 必须传 `shallowEqual` 或自行 memo，否则会不断产生新引用。

组件边界：

- `Thread` 只订阅 messages / streaming / activeId / loading / error / editingId / focusMessage。
- `UserMessage`、`AssistantMessage`、`Markdown`、`VersionNav` 使用 memo 和稳定 props；未修改消息的对象引用保持不变，因此输入草稿或其它消息的流式更新不会触达历史行。
- `Composer` 只订阅 draft、attachments、streaming、stopping、auth、sendKey、focusRequest 和能力状态；工具菜单只订阅 setting / attachments / model 等低变化字段。
- Header 只订阅“是否有历史”的布尔值，不订阅整个 messages 数组。
- 消息行只在 ≥120 条的长会话中启用 `contain: layout style`（`dsc-thread.is-heavy`），保持短会话原有挂载成本。

性能验收与原始数据见 [长会话性能报告](perf/long-chat-performance.md)。当前指标：500 条密集 Markdown 输入 P95 118.3 → 14.5 ms，普通输入时历史消息/Markdown 重渲染为 0。

### 流式协议

`/api/deepseek-chat/stream` 接受四种模式：

- `send`：追加用户消息与 assistant 占位，开始一轮。
- `edit`：把新提问挂到原提问的父节点下，生成新分支。
- `regenerate`：在同一个提问下新增回答兄弟节点。
- `continue`：以已保存的可见正文作为 assistant 前缀（prefill）请求剩余内容，原地追加；关闭 reasoning，只保留 `deepseek_read_url`。

Host 返回逐行 JSON 事件：`start` 下发本次生效的完整分支，浏览器用它替换乐观渲染的消息，避免旧分支回答混入上下文；随后是 `event`、`title`、`done`、`error`、`aborted`。客户端把文本/思考/工具块折叠进 assistant 消息，并按 `requestAnimationFrame` 合并绘制；`done` 用 Host 的最终消息收尾。

### 模型与偏好

`lib/model-config.js` 是模型目录、能力与偏好的唯一来源。`bootstrap.models` 把目录送到浏览器；`/api/deepseek-chat/model` 读写 `model-config.json`（按会话 id 记录覆盖项 + 新对话默认值）。`stream` 用目录校验 `model`，把偏好中的 effort 与请求值折叠后交给协议层。

协议使用 Anthropic 兼容 Messages API（`https://api.deepseek.com/anthropic/v1`），以及 `deepseek-flash`、`deepseek-v4-pro`、`deepseek_web_search`、`deepseek_read_url`、`safety_check`、`title` 与 Files API。

请求通过 `model` 选择模型；`thinking: { type: "enabled" | "disabled" }` 控制开关；开启时用 `output_config.effort` 传 `low | high | max`。接口接受的 `minimal/medium/xhigh/ultra` 只是别名，Host 会折叠到真实档位。旧 Host 不返回目录时只提供 `deepseek-flash`；缺少 `displayName` 时从模型 `version` 推导原生风格名称。

## Client 渲染

### 入口与模块

- `client-src/20-store.js`：store、`useChat`、动作、引导与持久化偏好。
- `client-src/30-markdown.js`：Markdown 解析、代码/公式占位符保护、引用标记。
- `31-highlight.js`：单遍词法高亮，未知语言按纯文本，字符不丢失。
- `32-math.js`：LaTeX 子集解析与 React 元素渲染；矩阵按最宽行锁列，`bmatrix` 用可拉伸 CSS 边框。
- `33-mermaid.js`：flowchart/graph、sequenceDiagram、pie、classDiagram 的 React SVG 渲染。
- `40-icons.js` / `43-popover.js`：图标、原生菜单几何、视口夹取与键盘导航。
- `45-brand.js` / `47-model.js` / `48-tools.js`：品牌字标、模型座位、工具注册表。
- `50-components.js`：ChatRoot、Thread、消息、Composer、Sidebar、模式切换等。
- `55-dialogs.js` / `58-memory.js`：设置、文件夹、归档、导入、记忆与跨平台导入弹窗。
- `60-style.js`：注入 `.dsc-*` 样式，全部使用主题 token。
- `70-main.js`：`apply(ctx)`、locale 注册、slot 注入与测试 hook。

### 输入框结构

`Composer` 在空白聊天与已有聊天中共用：

- `.dsc-composer` 是唯一的圆角边框、输入面材质与柔和阴影；`.dsc-editor-field` 是透明、无边框的文本编辑器。聚焦时不画任何环，只保留原生光标。
- 内部对齐 Harness：文本区 `4px 8px 0 14px`，顶部 8px 留白，文本与工具行之间 12px，工具行 `2px 8px 6px`；`＋` 为 28px 圆形按钮，发送为 34px 圆形信息蓝按钮（空内容时 40% 透明度）。
- 高度由内容决定，达到 220px 上限后 `overflow-y` 打开；粘贴长文本只影响内部滚动。
- 发送键偏好保存在本机（`sendKey`）；未发送草稿按会话暂存，切换会话时恢复。
- 联网搜索与深度思考是输入框下方的 28px 独立开关，开启时使用柔和强调色、不显示删除图标，位置不随状态变化；模型不支持时按钮禁用并在提示中说明原因。

### 工具注册表

工具不是写死在菜单里的按钮，而是一张定义表（`client-src/48-tools.js`）。`surface` 决定入口：

```js
registerChatTool({
  id: 'image-generation',
  kind: 'action',                 // 或 "toggle"
  surface: 'menu',                // "menu" = ＋ 浮窗，默认；"composer" = 输入框直接按钮
  icon: 'image',
  labelKey: 'toolImageGen',
  hintKey: 'toolImageGenHint',
  run: () => chatActions.openImageGeneration(),
})
```

`chatMenuTools()` 是「＋」浮窗的数据源，`composerToolDefinitions()` 是输入框直接按钮的数据源；没有实现的工具不会注册，也不会出现在任一入口。上传、联网搜索和深度思考各注册一次，菜单里不会重复出现搜索/思考开关。

### 模式切换与几何

`ModeSwitch` 在 `shell.overlay` 中注册，不替换 Harness 的 app root：

- 只在 Chat 空白页或 Agent 空白页显示；隐藏时不渲染元素（外壳 `display: contents`），不留下透明遮挡层。
- 水平居中于当前模式的主内容列：Agent 测量框架中间列的会话头部，Chat 测量 `.dsc-main` 的 `ResizeObserver` 宽度。
- 垂直对齐 Agent 右上角原生工具按钮中心线；优先使用 `[data-conversation-header-corner]` 锚点，否则用 caption 顶部 + 10px + 30px 标题行的一半。
- Chat 打开时隐藏被盖住的原生侧栏开关；macOS 侧栏复用原生 tint / wash 与 0.5px 分隔线。
- Chat 侧栏宽度 264–420px，自动收起断点 1024px；宽度写入本机偏好。

### 渲染安全

- 所有内容以 React 元素输出，不使用 `innerHTML` / `dangerouslySetInnerHTML` / `eval`。
- 链接与图片只允许 http(s)。
- Markdown 先保护代码块、行内代码与公式占位符，再进入块解析；未闭合的 `$` / `$$` 保持纯文本，`latex` / `math` / `tex` 围栏交给公式渲染器。
- 流式输出时已完成块依赖 memo 跳过重渲染；Mermaid 在最后一个块结束后绘制；未闭合公式/围栏保留最小高度，避免跳动。

## 导入管线

`lib/import/` 与聊天界面解耦：

- `zip.js`：Node 内置 `zlib`，文件句柄 + `inflateRaw`；条目名只做键、不落盘；限制归档大小、条目数和单条目解压上限；校验 CRC/声明大小；拒绝 ZIP64、加密、多卷。
- `format.js`：校验导出结构与时间戳，只接受 `export_format_version: 3`。
- `convert.js`：把导出消息树转成 Chat 节点树，处理思考、搜索步骤、来源、图片和分支。
- `media.js`：内容寻址图片库，`imports/media/<sha256>.<ext>`，重复图片只存一份。
- `index.js`：暂存上传、后台任务、分批合并与去重；每 40 个会话写一次历史，失败时回滚内存中未落盘的部分。

流程：`upload` 把请求流写到 `imports/staging/<token>/export.zip` 并返回预览；`start` 返回 job id；浏览器轮询 `status`；`cancel` / `discard` 结束任务并清理暂存。导入任务全局单并发，30 分钟未开始即清理暂存。

去重键为 `conversation.source = { kind: 'deepseek-export', id, importedAt }`；`store.listSummaries()` 每项都带 `source`，`store.findBySource()` / `importedSourceIds()` 供记忆模块筛选。导入图片带 `local: true`，`protocol.js` 构造请求时跳过，避免把无效 file id 发给 DeepSeek。

## 记忆管线

- `lib/memory-text.js`：规范化、内容指纹、词法相似度、分类推断、敏感信息检测。
- `lib/memory-store.js`：`memory.json`、去重/合并、导入、删除墓碑、概述修订号。
- `lib/memory.js`：相关度检索与字符预算、系统提示记忆块、自动提取门控与提示词、概述生成、Ask or Update 规划器、`extractFromMessages` 历史导入接口。

`/api/deepseek-chat/memory` 提供读写、预览、导入、概述刷新、Ask/确认和 AI 整理动作。`stream` 在构造请求时注入相关记忆，并在回复结束后异步触发自动提取；提取失败只记一条警告，不影响聊天。删除记忆留下墓碑，旧聊天之后的自动提取不能把它加回来。导入会话的记忆提取只读取当前分支消息，成功后写入 `source.memoryExtractedAt`；接口契约见 [memory-integration.md](memory-integration.md)。

## 安全边界

- 所有 Host 路由都注册为 owner-only，浏览器不能直接访问本机文件或 API Key。
- API Key 只保存在 Host 进程 / DSH 凭证库；设置页只显示是否已配置。
- 导入 ZIP 不信任条目名、路径、大小或 CRC，解析过程不写任意路径。
- 交接只调用 Harness 原生 `sessionController` 与 `workspaceRegistry`，不复制另一套工作区存储。
- 长期记忆是本地启发式检索，不引入向量数据库或第三方 Embedding 服务。

## 测试与可观测性

- `tests/` 覆盖存储迁移、协议、Host 路由、导入、模型、记忆与流式端到端；`tests/support/export-fixture.js` 现场生成样本，不含真实聊天记录。
- `tools/smoke-client.js` 用最小 React shim 检查组件树；`tools/check-*.js` 检查 CSS、类名、i18n、高亮、公式、Mermaid、上传与记忆客户端。
- `docs/perf/` 保存 Beta 4 性能原始数据；`tools/perf/` 是可选、零依赖的 CDP 基准工具。

## 相关文档

- [用户指南](user-guide.md)
- [配置说明](configuration.md)
- [开发指南](development.md)
- [已知限制](limitations.md)
- [长期记忆集成](memory-integration.md)
- [Beta 4 性能报告](perf/long-chat-performance.md)
