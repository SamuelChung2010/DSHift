# DeepSeek Chat（DSH 插件）

在 DeepSeek Harness 中加入一个原生的 **DeepSeek Chat 模式**，与原有 Agent 模式并存、随时切换。Chat 使用 DeepSeek 官方面向应用开放的 API 能力，界面参考 DeepSeek App / 官方开源 Chat Demo。

## 打开方式

- Agent 模式侧边栏底部：点击 **Chat**。
- Chat 模式顶部或侧边栏底部：点击 **Agent 模式** 返回。
- Chat 模式会记住上次状态；刷新页面后仍停留在 Chat 模式。

## 功能

- 普通聊天、多轮上下文、流式输出、停止生成
- **深度思考**：展示可折叠的思考过程与用时；开启联网时自动进入“深度思考搜索”
- **联网搜索**：使用 DeepSeek 服务端 `deepseek_web_search`，回答带引用来源
- **阅读链接**：始终声明 `deepseek_read_url`，自动阅读用户消息中的链接
- **文件与图片上传**：PDF、Word、PPT 走版面解析；图片直接作为图片输入；文本、代码、表格、电子书走 `user_data`
- **历史记录**：会话列表、重命名、删除、本地持久化
- 中英文界面、明暗主题、移动端布局

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

## 数据

- 历史：`$DSH_HOME/deepseek-chat/state.json`（原子写入）
- 上传文件：由 DeepSeek Files API 托管，插件只保存 `file_id` 和展示元数据
- 删除会话只删除本地记录，不删除 DeepSeek 侧已上传的文件
- 联网搜索、深度思考搜索与文件解析使用 DeepSeek 服务，可能产生对应用量费用

## 实现

- Host：`index.js` + `lib/`，通过 `ctx.connection.fetch` 注册 owner-only 路由，代理 DeepSeek Messages / Files API，解析 SSE 并持久化。
- Client：`client.js`，通过 `shell.overlay` 渲染全屏 Chat，通过 `sidebar.footer.action` 提供入口；样式全部使用 `--dsw-alias-*` 主题变量。
- 协议：Anthropic 兼容 Messages API（`https://api.deepseek.com/anthropic/v1`），使用 `deepseek-flash`、`deepseek_web_search`、`deepseek_read_url`、`safety_check`、`title` 与 Files API。

参考文档：

- [Build a Chatbot](https://api-docs.deepseek.com/guides/build_a_chatbot)
- [Web Tools](https://api-docs.deepseek.com/guides/web_tools)
- [File Parsing](https://api-docs.deepseek.com/guides/document_parsing)
- [Official chat-demo](https://github.com/deepseek-ai/chat-demo)（MIT）

## 已知限制

- 不支持 Mermaid、KaTeX 数学公式渲染；代码块不做语法高亮。
- 暂不支持重新生成、继续生成、消息分支切换、编辑提问、导入/导出 DeepSeek 历史（后续版本）。
- 生成过程中需先停止回复，才能切换会话或新建对话。
- 联网搜索、文件解析是否可用取决于账号/API Key 与 `deepseek-flash` 的服务端能力，可能产生额外用量费用。
- 本插件不是 DeepSeek 官方产品。

## 开发

```sh
node --test tests/*.test.js
node tools/build-client.js
```

安装：在 DSH 的 Plugins 页面选择本地目录，或由 Agent 使用 `plugin_manager install_bundle` 安装本目录。安装后刷新页面，侧边栏底部出现 **Chat**。
