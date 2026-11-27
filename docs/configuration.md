# 配置、认证与数据

本文说明 DSHift 的认证顺序、Host 配置项、数据文件与模型偏好。日常操作见 [用户指南](user-guide.md)。

## 认证

Chat 模式不会把 API Key 写进代码、`state.json` 或浏览器存储。按以下顺序自动选择：

1. Chat 设置中保存的 API Key（保存在 DSH 凭证库，键名 `DEEPSEEK_CHAT_API_KEY`）
2. DSH 凭证库 / 环境变量中的 `DEEPSEEK_API_KEY`
3. DSH 已登录的 DeepSeek 账号令牌（`ctx.deepseekAccount`，通过 `x-dsh-auth-token` 发送）

在 **Chat 设置 → 认证** 中可以强制选择 **DSH 账号** 或 **API Key**。API Key 只在 Host 进程内使用，不发送到浏览器；设置页只显示是否已配置。

DSHift 请求的是 Anthropic 兼容 Messages API（默认 `https://api.deepseek.com/anthropic/v1`），不是 OpenAI 兼容端点。模型、搜索、思考、文件解析都使用 DeepSeek 服务端能力，可能产生对应费用。

## Host 配置（可选）

插件行配置位于 `cordis.patch.yml` 的 `deepseek-chat-mode` 行，可在 `$DSH_HOME/profiles/<profile>/cordis.patch.yml` 中按 id 覆盖。例如：

```yaml
- id: deepseek-chat-mode
  config:
    requestTimeoutMs: 900000
    maxUploadBytes: 67108864
```

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `baseURL` | `https://api.deepseek.com/anthropic/v1` | Anthropic 兼容 API 根地址，需包含 `/v1` |
| `maxUploadBytes` | `67108864` | 单个上传文件上限（64 MB） |
| `requestTimeoutMs` | `900000` | 单次生成超时（15 分钟） |
| `heartbeatMs` | `15000` | 流式心跳间隔 |
| `handoffTimeoutMs` | `90000` | 生成任务说明 / 提交给 Agent 的超时 |
| `maxImportBytes` | `536870912` | 聊天记录导入 ZIP 上限（512 MB） |
| `memoryTimeoutMs` | `60000` | 记忆提取、概述生成或 AI 整理单次请求的超时 |

Host 端配置改动需要重启 DSH 或重载插件后生效；浏览器端首次可能提示刷新。

## 数据目录

所有插件数据位于 `$DSH_HOME/deepseek-chat/`：

| 路径 | 内容 |
| --- | --- |
| `state.json` | 聊天历史、文件夹、置顶、归档；原子写入 |
| `state.json.v1-backup-*` | v1 → v2 迁移前的备份 |
| `state.json.import-backup-*` | 导入写入前的备份 |
| `model-config.json` | 按会话 id 的模型/推理等级覆盖项 + 新对话默认值 |
| `memory.json` | 长期记忆：开关、条目、来源、概述缓存、修订号、删除墓碑；原子写入 |
| `memory.json.corrupt-*` | 损坏记忆文件的隔离副本 |
| `imports/staging/<token>/export.zip` | 导入暂存；结束或 30 分钟未开始即删除 |
| `imports/media/<sha256>.<ext>` | 导入图片，内容寻址，只增不删 |

### 聊天历史格式（v2）

- 每条会话是一棵消息节点树（`nodes` + `leafId`），`messages` 由当前分支推导。
- 编辑、重新生成只新增兄弟节点，旧消息节点不会被覆盖；切换版本只改变 `leafId`。
- 每个版本各自保存 `blocks`（正文、思考、搜索/阅读步骤与引用）、`usage`、`stopReason` 等元数据。
- 旧版 v1 的线性 `messages` 会在加载时自动迁移，迁移前复制为 `state.json.v1-backup-<时间戳>`；可用备份还原。
- 导入的会话写在同一个 `state.json`，只多一个 `source` 来源字段（含 `memoryExtractedAt`）；导入前保留 `state.json.import-backup-<时间戳>`。

### 长期记忆

`memory.json` 与聊天记录完全分开，不覆盖、不迁移聊天历史。记忆默认开启、自动提取默认关闭；关闭长期记忆后，检索、注入和自动提取全部停止。文件损坏时会隔离为 `memory.json.corrupt-<时间戳>` 并从空记忆启动，聊天不受影响。

### 上传与导入资源

- 上传文件由 DeepSeek Files API 托管；插件只保存 `file_id` 和展示元数据。删除会话不会删除 DeepSeek 侧已上传文件。
- 导入的本地图片不会重新上传到 DeepSeek，因此继续对话时模型看不到这些图片；历史文字与回答照常参与上下文。
- 导入 ZIP 不上传，解析、转换和合并都在本机 Host 进程内完成。

## 模型与推理等级

模型与参数以 DeepSeek 应用 API 为准（[Messages API](https://api-docs.deepseek.com/zh-cn/api/create-message)、[思考模式](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode)）：

| 模型 | 图片理解 | 文件解析 | 联网搜索 | 深度思考 | 推理等级 |
| --- | --- | --- | --- | --- | --- |
| `deepseek-flash`（DeepSeek-V4.1-Flash） | 支持 | 支持 | 支持 | 支持 | low / high / max |
| `deepseek-v4-pro`（DeepSeek-V4-Pro） | 不支持 | 支持 | 支持 | 支持 | low / high / max |

> DeepSeek 的联网工具文档建议联网搜索使用 `deepseek-flash`；两个模型都接受服务端搜索工具，界面不因此禁用 V4 Pro 的搜索，但会在模型限制中提示图片能力差异。

- 请求通过 `model` 选择模型；`thinking: { type: "enabled" | "disabled" }` 控制开关；开启时用 `output_config.effort` 传 `low | high | max`。接口接受的 `minimal/medium/xhigh/ultra` 只是别名，界面不展示，Host 会折叠到真实档位。
- 模型座位的选择按会话保存在 `model-config.json`（键为会话 id），新对话使用全局默认；该文件与 `state.json` 分开。
- 模型目录由 Host 的 `bootstrap.models` 提供，浏览器不猜测列表；旧 Host 不返回目录时只提供 `deepseek-flash`。
- 不支持的能力会禁用并说明原因；`deepseek-v4-pro` 含图片的消息会在发送前被拒绝。
- 联网搜索是否可用取决于账号/API Key 与所选模型的服务端能力，可能产生额外用量费用。

## 隐私与费用

- 聊天历史、长期记忆、导入暂存与图片只保存在本机。导入 ZIP 不上传。
- 对话、联网搜索、文件解析、标题生成和记忆提取会按需调用 DeepSeek API；开启自动记忆提取前会提示可能产生额外调用费用。
- 密码、证件号、银行卡、精确住址、联系方式等敏感个人信息不会被自动保存；敏感信息检测与去重是启发式规则，不能替代用户自行检查。
- DSHift 不是 DeepSeek 官方产品。

## 相关文档

- [用户指南](user-guide.md)
- [架构说明](architecture.md)
- [已知限制](limitations.md)
- [长期记忆集成](memory-integration.md)
- [返回 README](../README.md)
