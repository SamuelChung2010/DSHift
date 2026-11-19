# DeepSeek Chat（DSH 插件）

在 DeepSeek Harness 中加入一个原生的 **DeepSeek Chat 模式**，与原生的 **Agent 模式**并列，通过顶部的 `Chat | Agent` 分段控件随时切换。Chat 使用 DeepSeek 官方面向应用开放的 API 能力，界面参考 DeepSeek App / 官方开源 Chat Demo。

## 打开方式

应用顶部（Windows 标题栏 / macOS 顶栏）居中是共享的 **Chat | Agent** 分段控件：

- **Chat**：显示本插件的对话界面（独立历史、独立输入框）。
- **Agent**：显示 Harness 原生 Agent 界面。

两种模式各自的会话、工作区和未发送的输入都会保留；切换不会清空任何一边。

### 显示规则（与 ChatGPT 桌面版一致）

- **只在新建的空白页面显示**：Chat 里还没有消息的新对话，或 Agent 里没有会话 / 仍是空白会话的页面。
- 开始发送第一条消息（无需等 AI 回答）或进入已有会话后**自动隐藏**；切换到其它已有会话保持隐藏。
- 点 Chat 的「新对话」或 Agent 的「新会话」回到空白页时，切换器再次出现。
- 空白判断不使用 DOM：Agent 侧读取 Harness 原生会话列表（`ctx.sessions.list` 的 `blank` / `running`，以及是否有会话被主视图持有），Chat 侧读取消息模型与会话摘要（加载中的会话按摘要的消息数判断，避免闪烁）。
- 隐藏时不渲染任何元素（外壳是 `display: contents`），不会留下透明遮挡层，底层按钮可正常点击。

这个切换器是一个**不对称分段控件**（参考 ChatGPT 桌面版）：一条深色圆角底座里只有选中项拥有独立的圆角浮起背景，选中项占约 55% 宽度、未选中项约 45%，切换时浮起背景滑动并改变宽度，底座总宽与中心保持不变。

定位按**实际布局**计算，而不是窗口坐标：

- 水平：居中于主内容列。Agent 模式使用框架发布的 `--dsh-windows-sidebar-width`（原生侧栏真实宽度，拖拽/收起自动跟随）；Chat 模式测量自己的 `.dsc-main` 列宽（`ResizeObserver`），侧栏宽度变化后切换器自动重新居中。
- 垂直：对齐 Agent 页面右上角原生工具按钮（header utilities / corner）的中心线。默认值来自原生头部的几何（caption 顶部 + 10px 内边距 + 30px 标题行的一半），运行时再用 header 发布的 `[data-conversation-header-corner]` 锚点校正，两种模式共用同一条线，切换不会上下跳动。
- Chat 侧栏宽度由 Chat 自己管理：拖拽右边缘可在 264–420px 之间调整（与原生侧栏拖拽范围一致），窗口过窄时优先保证聊天列可读；宽度写入本机偏好，重启后保留。自动收起断点与框架一致（1024px）。

## 功能

- 空白首页只有一条欢迎语和输入框，不再堆叠功能卡片：12 句不同风格的问候按「新建对话」随机轮换（同一页内保持不变，且不会连续重复）；带用户名的句子会读取当前 DSH / DeepSeek 账号的显示名称，取不到时自然改用不带称呼的版本
- 左侧栏与原生 Agent 侧栏同构：顶部是 DeepSeek 官方蓝色鲸鱼 + `deepseek` 字标，下方依次是新对话、搜索、历史列表与底部设置；右边缘可拖拽调整宽度并记住设置
- 普通聊天、多轮上下文、流式输出、停止生成
- **输入框**：一个统一的圆角容器，编辑器本身没有边框和浏览器焦点方框，整块容器负责焦点反馈；随文本自动增高，超过 220px 后在内部滚动；Enter 发送 / Shift + Enter 换行（可在设置中改为 Ctrl + Enter 发送），中文输入法组合文字时 Enter 只确认候选，不会误发
- **联网搜索 / 深度思考**：输入框下方两个独立的开关按钮，点击直接启用或关闭，不需要进入「＋」菜单；开启时使用柔和强调色，不显示删除图标，位置不随状态变化；模型不支持时按钮禁用并在提示中说明原因
- **「＋」工具菜单**：输入框左下的独立圆角浮窗，向上展开并避开整个输入框，不挤压聊天内容；当前只包含上传图片或文件，键盘方向键 / Home / End / Escape 可完整操作，空间不足时自动翻到另一侧并限制高度
- **深度思考**：展示可折叠的思考过程与固定用时（刷新、切换会话后不再增长）；开启后输入框右侧显示独立的思考强度控件，可选择关闭 / 低 / 高 / 最高
- **联网搜索**：使用 DeepSeek 服务端 `deepseek_web_search`，回答带正文引用编号与折叠的来源列表
- **模型选择**：可在发送前切换 `deepseek-flash` / `deepseek-v4-pro`，菜单只列模型名称，当前项有勾选标记，完整说明通过悬停查看，选择按会话保存；不支持的能力（如 V4 Pro 的图片理解）会禁用并说明原因
- **阅读链接**：始终声明 `deepseek_read_url`，自动阅读用户消息中的链接
- **文件与图片上传**：PDF、Word、PPT 走版面解析；图片直接作为图片输入；文本、代码、表格、电子书走 `user_data`
- **会话管理**
  - 置顶 / 取消置顶：多个置顶会话集中在「已置顶」区域，按最近活动时间排序；普通会话按活动时间分组排序
  - 文件夹：创建、重命名、删除、折叠/展开（折叠状态持久化）、把一条或多条会话移入文件夹、移出文件夹；删除文件夹只把会话移回未分类，不删除聊天记录
  - 归档：归档会话从普通历史列表隐藏，在「归档管理」中查看、恢复或删除
  - 所有重命名 / 置顶 / 移动 / 归档 / 删除操作集中在右键或「···」菜单；删除会话与删除文件夹都有确认
- **历史搜索**：同时搜索会话标题和消息正文，支持中英文关键词；结果显示会话、正文片段、置顶/归档标记，点击打开会话并定位到匹配消息（老分支也会被重新打开）
- **编辑用户消息**：悬停显示「编辑」「复制」；编辑框沿用消息气泡样式（无嵌套边框），Enter 保存并发送、Shift+Enter 换行、Esc 取消。编辑会创建新的对话分支：原来的回答与后续对话保留为版本，模型只接收当前分支的上下文
- **回答版本管理**：每条回答可复制、重新生成，重新生成产生独立版本（`1 / 3` 切换）；用户消息的编辑版本也可切换回来。每个版本各自保存正文、思考块、引用来源、用量与结束原因
- **继续生成**：用户主动停止、网络中断、超时或 `max_tokens` 截断的回答，可从已有正文处继续（以 assistant 前缀续写的方式请求，不做无关拼接）；只对当前最后一条有正文的回答开放
- **内容渲染**：代码高亮（语言标识、一键复制、长代码内部滚动、明暗两套配色）、LaTeX 公式（行内与独立公式块）、Mermaid 图表（失败时保留源代码）、表格、引用块、超链接与图片
- **历史记录**：会话列表、重命名、删除、本地持久化、会话内搜索
- **交给 Agent**：把当前对话整理成可编辑的任务说明，可直接选择或新建 Harness 工作区，然后创建真实的 Agent 会话并把说明作为首条提示，切换到 Agent 继续开发
- 中英文界面、明暗主题、窗口缩放与移动端布局

## 输入框与工具菜单

输入框由 `Composer` 一个组件实现，空白聊天和已有聊天共用：

- `.dsc-composer` 是唯一的圆角边框与阴影；`.dsc-editor-field` 是透明、无边框的文本编辑器。聚焦时容器只做一次轻微的边框颜色变化，键盘导航额外获得 1px 柔和 ring；浏览器默认 outline 在文本控件上被显式关闭，因此不会出现白色双层描边。
- 高度由编辑器内容决定，达到上限后 `overflow-y` 打开；粘贴长文本只影响内部滚动。
- 发送键偏好保存在本机（`sendKey`），设置里有"Enter 发送"和"Ctrl + Enter 发送"两档。
- 未发送的草稿按会话暂存：切换会话或点「新对话」时恢复各自的文本；附件上传会按原有逻辑中止。
- 联网搜索、深度思考和思考强度都显示在输入框附近：前两者是固定位置的直接开关，后者是模型旁的独立档位控件（关闭时显示"关闭"）。

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

`chatMenuTools()` 是「＋」浮窗的数据源，`composerToolDefinitions()` 是输入框直接按钮的数据源；没有实现的工具不会注册，也不会出现在任一入口。上传、联网搜索和深度思考分别注册一次，因此菜单里不会重复出现搜索/思考开关。

## 来源与引用

- 回答正文里的引用是编号胶囊，点击打开原始网页；编号由 `collectMessageSources()` 生成：先按引用顺序给被引页面编号（1..n），再追加未被引用的搜索结果，按 URL 去重、去重不改变已分配的编号，因此刷新历史后编号与链接仍然一一对应。
- 来源默认折叠为一行 `来源 · N`，展开后是单列紧凑列表（编号、标题、域名、可选摘要），列表有最大高度并内部滚动；15 条来源不再占满整页。
- 来源为零时不渲染任何来源组件；思考区、正文、来源三层使用不同的字号与颜色权重。

## 模型与思考强度

模型与参数以 DeepSeek 应用 API 为准（[Messages API](https://api-docs.deepseek.com/zh-cn/api/create-message)、[思考模式](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode)）：

| 模型 | 图片理解 | 文件解析 | 联网搜索 | 深度思考 | 思考强度 |
| --- | --- | --- | --- | --- | --- |
| `deepseek-flash`（V4.1 Flash） | 支持 | 支持 | 支持 | 支持 | low / high / max |
| `deepseek-v4-pro`（V4 Pro） | 不支持 | 支持 | 支持 | 支持 | low / high / max |

> DeepSeek 的联网工具文档建议联网搜索使用 `deepseek-flash`；两个模型都接受服务端搜索工具，界面不因此禁用 V4 Pro 的搜索，但会在模型说明中提示这一差异。

- 请求通过 `model` 选择模型；`thinking: { type: "enabled" | "disabled" }` 控制开关；开启时用 `output_config.effort` 传 `low | high | max`。接口接受的 `minimal/medium/xhigh/ultra` 只是别名，界面不展示它们，Host 端也会折叠到真实档位。
- 模型菜单只展示名称和当前勾选，不把每个模型的长说明、能力标签铺在菜单里；完整说明放在行的 `title` 中，唯一的例外是会影响附件操作的限制（V4 Pro"不支持图片"）以一行小字显示。宽度随内容收缩，不再为大段说明预留固定宽度。
- 思考强度是模型旁的独立控件：关闭、低、高、最高四档，档位来自当前模型的 `capabilities.efforts`，不是自由数值；点击某档会确保深度思考开启并写入该档位，点击"关闭"关闭深度思考。它与左侧的深度思考按钮共享同一个设置，但入口分工清楚。
- 选中的模型记录在每条回复上，消息底部显示"模型 · 强度"；不支持图片的模型会在输入框上方说明原因，并在发送含图片的消息前拒绝。
- 模型目录由 Host 的 `bootstrap.models` 提供，浏览器不猜测模型列表；旧 Host 不返回目录时只提供 `deepseek-flash`（那是旧 Host 唯一会发出的模型）。
- 选择按会话保存（`model-config.json`，键为会话 id），新对话使用全局默认；该文件与会话消息历史分开存储，不改变 `state.json` 的消息格式与版本迁移。

## 内容渲染

`client-src/30-markdown.js` 是 Markdown 入口，另外三个模块各自独立、无外部依赖：

- `31-highlight.js`：单遍扫描的词法高亮，支持 JS/TS、JSON、HTML/XML、CSS、Python、Bash、PowerShell、SQL、Java、C#、C/C++、Go、Rust、YAML、Markdown、diff 等；未知语言按纯文本显示，字符永远不会丢失。
- `32-math.js`：LaTeX 子集渲染（分数、根式、上下标、大型运算符、定界符、矩阵、cases/aligned、重音、希腊字母与常用运算符）；未知命令以灰色原文显示，解析失败时回退为原始公式文本。
- `33-mermaid.js`：flowchart/graph、sequenceDiagram、pie、classDiagram 的 React SVG 渲染；不支持或超出上限时显示错误说明并保留源代码。
- 所有内容都以 React 元素输出，不使用 `innerHTML` / `dangerouslySetInnerHTML` / `eval`；链接与图片只允许 http(s)。
- 流式输出时已完成的块靠 `React.memo` 跳过重渲染，Mermaid 图表在最后一个块生成结束后才绘制，避免每帧重排。

## Chat → Agent 交接

1. 在 Chat 里讨论完需求，点右上角 **交给 Agent**。
2. Host 用 DeepSeek 把对话整理成任务说明（模型不可用时退回本地整理的版本，仍可编辑）。
3. 选择工作区：
   - 直接选择已有工作区；
   - 或者选 **＋ 新建工作区…**，填工作区名称、选项目文件夹。**选择已有目录…** 会把所选目录直接当作项目文件夹；**在此新建文件夹…** 会把所选目录当作上级目录，按名称创建项目文件夹（目录不存在时会自动创建）。也可以直接把完整的绝对路径粘贴到输入框。
   - 创建分成两步且都由 Harness 原生能力完成：先在本地建好文件夹，再通过 Host 的 `ctx.workspaceRegistry.create()` 注册为工作区。成功后自动注册到 Harness 工作区列表并选中，已经写好的任务说明、补充要求和对话上下文都不会丢。
4. 如果对话看起来是一个新项目、而当前工作区与对话标题没有关联，工作区下方会出现一条不阻断操作的提示，可以一键打开带名称建议的新建面板。
5. 确认后创建新的 Agent 会话并把任务说明作为首条提示提交，界面自动切到 Agent 模式并打开该会话。

它走的是 Harness 原生机制：`ctx.sessionController.create()` + `prompt()` 建立会话，浏览器侧用 `ctx.uiWorkspace.openSession()` 切到该会话；新建工作区时用 `ctx.uiWorkspace.pickDirectory()` 打开原生目录选择器，由 Host 的 `/api/deepseek-chat/workspace` 建目录并调用 `ctx.workspaceRegistry.create()` 注册，不复制一套独立的工作区存储。

## 认证

Chat 模式不会把 API Key 写进代码或配置文件，按以下顺序自动选择：

1. Chat 设置中保存的 API Key（保存在 DSH 凭证库，键名 `DEEPSEEK_CHAT_API_KEY`）
2. DSH 凭证库 / 环境变量中的 `DEEPSEEK_API_KEY`
3. DSH 已登录的 DeepSeek 账号令牌（`ctx.deepseekAccount`，走 `x-dsh-auth-token`）

也可以在 Chat 设置中强制选择 **DSH 账号** 或 **API Key**。API Key 只存在 Host 进程内使用，不会发送到浏览器。

## 配置（可选）

Host 行配置位于插件行的 `config` 中，可在 `$DSH_HOME/profiles/<profile>/cordis.patch.yml` 中覆盖：

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `baseURL` | `https://api.deepseek.com/anthropic/v1` | Anthropic 兼容 API 根地址，需包含 `/v1` |
| `maxUploadBytes` | `67108864` | 单个上传文件上限（64 MB） |
| `requestTimeoutMs` | `900000` | 单次生成超时（15 分钟） |
| `heartbeatMs` | `15000` | 流式心跳间隔 |
| `handoffTimeoutMs` | `90000` | 生成任务说明 / 提交给 Agent 的超时 |

## 数据

- 历史：`$DSH_HOME/deepseek-chat/state.json`（原子写入）
- 数据格式为 **v2**：每条会话是一棵消息节点树（`nodes` + `leafId`），`messages` 由当前分支推导；文件夹、置顶、归档状态保存在同一个文件中。旧版 v1 的线性 `messages` 会在加载时自动迁移，迁移前把原文件复制为 `state.json.v1-backup-<时间戳>`，可随时用备份还原
- 编辑、重新生成只会新增兄弟节点，旧消息节点不会被覆盖；切换版本只改变 `leafId`
- 消息版本各自保存 `blocks`（正文、思考、搜索/阅读步骤与引用）、`usage`、`stopReason` 等元数据
- 模型与思考强度偏好：`$DSH_HOME/deepseek-chat/model-config.json`（按会话 id 记录覆盖项 + 新对话默认值）
- 上传文件：由 DeepSeek Files API 托管，插件只保存 `file_id` 和展示元数据；附件会随编辑后的用户消息保留
- 删除会话只删除本地记录和该会话的模型偏好，不删除 DeepSeek 侧已上传的文件
- 联网搜索、深度思考搜索与文件解析使用 DeepSeek 服务，可能产生对应用量费用

## 实现

- Host：`index.js` + `lib/`，通过 `ctx.connection.fetch` 注册 owner-only 路由，代理 DeepSeek Messages / Files API，解析 SSE 并持久化；交接路由调用 Harness 的 `sessionController`；问候用户名走 `/api/deepseek-chat/profile`，只读取已登录账号的显示名称并在 Host 缓存 60 秒，失败时返回空名称而不影响聊天。
- 存储：`lib/store.js` 维护会话节点树、文件夹与组织状态；`presentPath()` 只把当前分支交给协议层，`selectVersion()` / `focusMessage()` 通过切换 `leafId` 重开旧分支；历史搜索在本地线性扫描标题与正文，不引入额外数据库。
- 流式协议：`/api/deepseek-chat/stream` 支持 `send` / `edit` / `regenerate` / `continue` 四种模式。`edit` 把新提问挂到原提问的父节点下，`regenerate` 在同一个提问下新增回答兄弟节点，`continue` 用已保存的可见正文作为 assistant 前缀（prefill）请求剩余内容并原地追加。`start` 帧会下发本次生效的完整分支，浏览器用它替换乐观渲染的消息，避免旧分支回答混入当前上下文。
- 模型：`lib/model-config.js` 是模型目录、能力与偏好的唯一来源，`bootstrap.models` 把目录送到浏览器；`/api/deepseek-chat/model` 读写偏好；`stream` 用目录校验 `model`，把偏好中的 effort 与请求值折叠后交给协议层。
- Client：`client.js` 由 `client-src/*.js` 拼接，通过 `shell.overlay` 渲染全屏 Chat（起点在 `--dsh-frame-chrome-top` 之下，即原生标题栏下方），并在同一 `shell.overlay` 注册 root 级的 `deepseek-chat-mode:mode-switch`，作为两种模式共享的顶层导航。样式全部使用 `--dsw-*` 主题变量；侧栏品牌沿用 DeepSeek 官方鲸鱼与字标矢量，内联在插件中，不加载 Harness Client 包。
- Client 模块：`30-markdown.js`（Markdown 与引用标记）、`31-highlight.js`、`32-math.js`、`33-mermaid.js`、`43-popover.js`（弹出层定位与键盘）、`47-model.js`（模型菜单）、`48-tools.js`（工具注册表与「＋」菜单）。
- 协议：Anthropic 兼容 Messages API（`https://api.deepseek.com/anthropic/v1`），使用 `deepseek-flash`、`deepseek-v4-pro`、`deepseek_web_search`、`deepseek_read_url`、`safety_check`、`title` 与 Files API。
- 继续生成使用 assistant 前缀续写：请求以现有可见正文作为最后一条 assistant 消息，并关闭 reasoning、只保留 `deepseek_read_url`；返回内容追加到同一条回答，不新建分支。

参考文档：

- [Build a Chatbot](https://api-docs.deepseek.com/guides/build_a_chatbot)
- [Messages API](https://api-docs.deepseek.com/zh-cn/api/create-message)
- [Thinking mode](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode)
- [Web Tools](https://api-docs.deepseek.com/guides/web_tools)
- [File Parsing](https://api-docs.deepseek.com/guides/document_parsing)
- [Official chat-demo](https://github.com/deepseek-ai/chat-demo)（MIT）

## 已知限制

- 数学公式是面向聊天的 LaTeX 子集（不是完整 KaTeX）；`\begin{tikzcd}`、自定义宏等高级用法会以原文或灰色命令名显示。
- Mermaid 支持流程图、时序图、饼图与基础类图；思维导图、甘特图等类型会显示错误说明并保留源代码。
- 编辑/重新生成采用线性版本导航（`‹ 1 / 3 ›`）而不是完整的可视化分支树面板；被替换的分支仍保存并可切换回来。
- 「继续生成」依赖 DeepSeek Messages API 的 assistant 前缀续写（prefill）语义；如果账号或服务端拒绝该模式，请改用重新生成。续写不会恢复深度思考，只延续可见正文。
- 历史搜索在本地扫描当前 `state.json` 的全部消息节点，适合本机历史量；没有独立搜索索引服务。
- 文件夹整理通过菜单完成，未实现拖拽排序（避免引入拖拽依赖）。
- 生成过程中需先停止回复，才能切换会话、编辑消息或新建对话。
- `deepseek-v4-pro` 不支持图片理解；含图片的消息会在发送前被拒绝并提示切换模型。
- 宿主端代码（`index.js` / `lib/`）改动后需要重载插件或重启 Harness 才会生效；浏览器端会先显示“需要刷新插件”的提示。
- 联网搜索、文件解析是否可用取决于账号/API Key 与所选模型的服务端能力，可能产生额外用量费用。
- 本插件不是 DeepSeek 官方产品。

## 开发

```sh
node --test tests/*.test.js        # 或逐个执行（受限沙箱里 --test 子进程不可用）
node tools/build-client.js         # client-src/*.js -> client.js
node tools/smoke-client.js         # 无浏览器渲染冒烟（会话分组、搜索、编辑/重生成/续写、输入框、菜单、来源、模型、工作区创建、公式/图表/代码）
node tools/check-css.js            # 样式括号 / 硬编码颜色检查
node tools/check-classes.js        # JS 与样式类名一致性
node tools/check-i18n.js           # 中英文键一致性
node tools/check-highlight.js      # 代码高亮字符不丢失 / 分类 / 性能
node tools/check-math.js           # LaTeX 子集渲染回退与深度保护
node tools/check-mermaid.js        # Mermaid 解析、几何与错误回退
```

测试覆盖：`tests/store.test.js`（v1→v2 迁移与备份、文件夹/置顶/归档、搜索、分支与版本切换）、`tests/protocol.test.js`（上下文构造与续写前缀）、`tests/conversation.test.js`（Host 路由与 send/edit/regenerate/continue 端到端）、`tests/workspace.test.js`（项目文件夹创建、工作区注册与交接）、`tests/model-config.test.js`、`tests/service-stream.test.js`、`tests/api.test.js`、`tests/profile.test.js`、`tests/host-entry.test.js`。

安装：在 DSH 的 Plugins 页面选择本地目录，或由 Agent 使用 `plugin_manager install_bundle` 安装本目录。本机开发时 profile 里用 `link:` 指向本仓库即可。
