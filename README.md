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
- **深度思考**：展示可折叠的思考过程与固定用时（刷新、切换会话后不再增长）
- **联网搜索**：使用 DeepSeek 服务端 `deepseek_web_search`，回答带引用来源
- **阅读链接**：始终声明 `deepseek_read_url`，自动阅读用户消息中的链接
- **文件与图片上传**：PDF、Word、PPT 走版面解析；图片直接作为图片输入；文本、代码、表格、电子书走 `user_data`
- **历史记录**：会话列表、重命名、删除、本地持久化、会话内搜索
- **交给 Agent**：把当前对话整理成可编辑的任务说明，创建真实的 Harness Agent 会话并把说明作为首条提示，然后切换到 Agent 继续开发
- 中英文界面、明暗主题、窗口缩放与移动端布局

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
- 上传文件：由 DeepSeek Files API 托管，插件只保存 `file_id` 和展示元数据
- 删除会话只删除本地记录，不删除 DeepSeek 侧已上传的文件
- 联网搜索、深度思考搜索与文件解析使用 DeepSeek 服务，可能产生对应用量费用

## 实现

- Host：`index.js` + `lib/`，通过 `ctx.connection.fetch` 注册 owner-only 路由，代理 DeepSeek Messages / Files API，解析 SSE 并持久化；交接路由调用 Harness 的 `sessionController`；问候用户名走 `/api/deepseek-chat/profile`，只读取已登录账号的显示名称并在 Host 缓存 60 秒，失败时返回空名称而不影响聊天。
- Client：`client.js`，通过 `shell.overlay` 渲染全屏 Chat（起点在 `--dsh-frame-chrome-top` 之下，即原生标题栏下方），并在同一 `shell.overlay` 注册 root 级的 `deepseek-chat-mode:mode-switch`，作为两种模式共享的顶层导航。样式全部使用 `--dsw-*` 主题变量；侧栏品牌沿用 DeepSeek 官方鲸鱼与字标矢量，内联在插件中，不加载 Harness Client 包。
- 协议：Anthropic 兼容 Messages API（`https://api.deepseek.com/anthropic/v1`），使用 `deepseek-flash`、`deepseek_web_search`、`deepseek_read_url`、`safety_check`、`title` 与 Files API。

参考文档：

- [Build a Chatbot](https://api-docs.deepseek.com/guides/build_a_chatbot)
- [Web Tools](https://api-docs.deepseek.com/guides/web_tools)
- [File Parsing](https://api-docs.deepseek.com/guides/document_parsing)
- [Official chat-demo](https://github.com/deepseek-ai/chat-demo)（MIT）

## 已知限制

- 不支持 Mermaid、KaTeX 数学公式渲染；代码块不做语法高亮。
- 暂不支持重新生成、继续生成、对话分支、编辑已发送消息、对话置顶与文件夹分类（后续版本）。
- 生成过程中需先停止回复，才能切换会话或新建对话。
- 模型固定为 `deepseek-flash`，未提供模型/思考强度选择（服务端未开放对应参数）。
- 宿主端代码（`index.js` / `lib/`）改动后需要重载插件或重启 Harness 才会生效；浏览器端会先显示“需要刷新插件”的提示。
- 联网搜索、文件解析是否可用取决于账号/API Key 与 `deepseek-flash` 的服务端能力，可能产生额外用量费用。
- 本插件不是 DeepSeek 官方产品。

## 开发

```sh
node --test tests/*.test.js        # 或逐个执行（受限沙箱里 --test 子进程不可用）
node tools/build-client.js         # client-src/*.js -> client.js
node tools/smoke-client.js         # 无浏览器渲染冒烟（含首页问候、侧栏宽度）
node tools/check-css.js            # 样式括号 / 硬编码颜色检查
node tools/check-classes.js        # JS 与样式类名一致性
node tools/check-i18n.js           # 中英文键一致性
```

安装：在 DSH 的 Plugins 页面选择本地目录，或由 Agent 使用 `plugin_manager install_bundle` 安装本目录。本机开发时 profile 里用 `link:` 指向本仓库即可。
