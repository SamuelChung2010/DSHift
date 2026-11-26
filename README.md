# DSHift

在 DeepSeek Harness 中提供 ChatGPT 式的 Chat 界面，可与原生 Agent 模式随时切换，并支持从 ChatGPT / Claude / Gemini 迁移长期记忆。

```sh
dsh plugin add github:SamuelChung2010/DSHift
```

<img width="1440" height="908" alt="dshift-readme" src="https://github.com/user-attachments/assets/cc55c1f0-3ff4-4d73-8c72-31cb8fddb116" />


| 原生 DSH | DSHift |
| --- | --- |
| 仅 Agent 模式 | Chat + Agent 双模式 |
| 无独立 Chat 界面 | 独立 Chat 历史、输入框与搜索 |
| 不支持跨平台记忆迁移 | 从 ChatGPT / Claude / Gemini 导入长期记忆 |
| 上下文需手动搬运 | Chat 对话整理成任务，交给 Agent 工作区 |

---

# dsh-chat（DSH 插件）

dsh-chat 在 DeepSeek Harness 中加入一个原生的 **DeepSeek Chat 模式**，与原生的 **Agent 模式**并列，通过顶部的 `Chat | Agent` 分段控件随时切换。Chat 使用 DeepSeek 官方面向应用开放的 API 能力，界面参考 DeepSeek App / ChatGPT 桌面版


## v0.2.0 Beta 更新

本版本在 0.1.0 Beta 的基础上完成三项功能，并打通「导入 → 记忆」联动：

- **聊天记录导入**：读取 DeepSeek App / 网页版导出的官方 ZIP，在本机解析、预览并选择会话导入。消息、思考过程、搜索步骤、引用来源、分支版本与可恢复图片都会转换到 Chat 历史；重复导入不会产生重复会话，导入的会话可以搜索、管理并继续聊天。
- **长期记忆**：可选的跨会话记忆，支持自动记忆提取、按问题相关度检索、Memory Summary、Ask or Update、手动增删改、从 ChatGPT / Claude / Gemini 导入已有记忆，以及记忆总开关与隐私控制。记忆保存在本机 `memory.json`，与聊天记录分开。
- **原生界面收尾**：输入框、`＋` 菜单和模型座统一到 Harness 原生风格。`＋` 是贴近输入框、近乎等宽的大圆角浮层，左侧图标与名称、右侧简短说明；模型与推理等级合并在同一个双层菜单中；`＋` 与发送按钮保持圆形，联网搜索与深度思考仍是独立按钮。
- **导入后提取记忆**：导入完成页可选择部分导入会话分析长期记忆；默认不勾选、不调用模型，确认费用提示后才逐个分析，候选记忆先预览再合并。已分析的会话会标记并默认跳过，提取失败不影响已导入的聊天。

### Beta 2 修复

- **Windows 主面板对齐**：Chat 主内容区左上角改用框架同款 `--dsh-windows-content-radius`（16px）圆角，并按原生中间列的方式裁切内容、由侧栏底色填充缺口；Windows 下同时去掉 Chat 侧栏右边线，与原生 Windows 布局一致（原先的细线会笔直穿过圆角缺口）。
- **macOS 顶栏与侧栏**：`Chat | Agent` 切换器改为按当前模式的主内容列居中；Chat 打开时隐藏被遮住的原生侧栏开关；侧栏底色、分隔线与抽屉遮罩对齐原生。
- **macOS 拖拽区与可读性**：Chat 侧栏品牌行退出 `-webkit-app-region: drag`，盖在原生拖拽行上的控件仍可点击；对话框主按钮与开关改用原生强调色 token，深色模式不再白底白字；发送快捷键提示在 macOS 显示 Command + Enter。

### Beta 3 修复

- **公式与 Markdown 渲染**：先保护代码块、行内代码与公式占位符，修复行内代码显示成 `code:...`、矩阵/`bmatrix` 布局错位、未支持或未闭合 LaTeX 只画出半截公式，以及流式公式完成后内容跳动的问题。未知环境整条回退为浅底等宽源码；`\boxed{}`、`\qquad`、顶层 `\\` 换行与 `latex` / `math` / `tex` 围栏公式均直接渲染，不丢字、不报错。
- **模式切换时的文件选择器**：修复从 Agent 切回 Chat 时误弹系统文件选择器。上传改为“实时注册 input + 模式门禁”，切换期间加锁；隐藏 input 不再进入 Tab 顺序，拖拽、粘贴与导入上传共用同一道守卫。
- **Harness 原生控件**：`＋`、发送与停止按钮改用原生 16-unit 图形和 28/34px 正圆，补上 `corner-shape: round`，不再被主题的 `superellipse` 压成圆角矩形；`交给 Agent` 按钮调整为 40px 胶囊，与 Chat | Agent 切换器同高、同圆角并保持对齐，窄屏同步缩到 36px。
- **可观测性**：上传路径增加 `[upload]` 诊断日志与原生文件 input 点击栈，便于复现时定位触发来源。

升级说明：

- 聊天历史格式保持 v2 兼容，无需迁移；长期记忆新增 `$DSH_HOME/deepseek-chat/memory.json`。
- Host 端改动需要重启 DSH 或重载插件后生效；浏览器端首次可能提示刷新插件。
- Beta 2 只包含界面修复，无数据格式变化；从 Beta 1 升级无需迁移。
- Beta 3 聚焦渲染、上传与界面修复，无数据格式变化；从 Beta 2 升级无需迁移。
- 本版本仍为 beta；发布说明与验证记录见 GitHub Release `v0.2.0-beta.3`。

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

- 水平：居中于当前模式的主内容列。Agent 模式测量框架中间列的会话头部（它随原生侧栏、右侧面板和响应式抽屉一起变化，Windows 与 macOS 共用同一套逻辑）；Chat 模式测量自己的 `.dsc-main` 列宽（`ResizeObserver`）。侧栏宽度变化后切换器自动重新居中。
- 垂直：对齐 Agent 页面右上角原生工具按钮（header utilities / corner）的中心线。默认值来自原生头部的几何（caption 顶部 + 10px 内边距 + 30px 标题行的一半），运行时再用 header 发布的 `[data-conversation-header-corner]` 锚点校正，两种模式共用同一条线，切换不会上下跳动。

macOS 原生外观适配：Chat 侧栏复用 Harness 的 sidebar tint / wash 与 0.5px 分隔线，和原生侧栏同材质；Chat 打开时原生侧栏的收起按钮（以及侧栏完全收起时的展开按钮）会让位给 Chat 自己的收起按钮，避免同屏出现两个面板图标；两档发送键文案在 macOS 上显示 Command + Enter。
- Chat 侧栏宽度由 Chat 自己管理：拖拽右边缘可在 264–420px 之间调整（与原生侧栏拖拽范围一致），窗口过窄时优先保证聊天列可读；宽度写入本机偏好，重启后保留。自动收起断点与框架一致（1024px）。

## 功能

- 空白首页只有一条欢迎语和输入框，不再堆叠功能卡片：12 句不同风格的问候按「新建对话」随机轮换（同一页内保持不变，且不会连续重复）；带用户名的句子会读取当前 DSH / DeepSeek 账号的显示名称，取不到时自然改用不带称呼的版本
- 左侧栏与原生 Agent 侧栏同构：顶部是 DeepSeek 官方蓝色鲸鱼 + `deepseek` 字标，下方依次是新对话、搜索、历史列表与底部设置；右边缘可拖拽调整宽度并记住设置
- 普通聊天、多轮上下文、流式输出、停止生成
- **输入框**：一个接近 Harness 原生 Agent 输入框的统一圆角容器（28px 面板圆角、原生菜单/输入面材质与描边）；编辑器本身没有边框和浏览器焦点方框，聚焦时保持安静、不点亮外层光环；随文本自动增高，超过 220px 后在内部滚动；Enter 发送 / Shift + Enter 换行（可在设置中改为 Ctrl + Enter 发送），中文输入法组合文字时 Enter 只确认候选，不会误发
- **联网搜索 / 深度思考**：输入框下方两个独立的 28px 开关按钮，点击直接启用或关闭，不需要进入「＋」菜单；开启时使用柔和强调色，不显示删除图标，位置不随状态变化；模型不支持时按钮禁用并在提示中说明原因
- **「＋」工具菜单**：输入框左下的 28px 圆形按钮，点开后向上浮出与输入框**几乎等宽**的大圆角菜单面板，和输入框只隔 4px；行式布局为左侧图标 + 名称、右侧一行简短说明，当前只包含上传图片或文件，键盘方向键 / Home / End / Escape 可完整操作，空间不足时自动翻到另一侧并限制高度
- **深度思考**：展示可折叠的思考过程与固定用时（刷新、切换会话后不再增长）；推理等级与模型一起显示在输入框右侧，在同一个双层菜单中选择 `Off / Low / High / Max`
- **联网搜索**：使用 DeepSeek 服务端 `deepseek_web_search`，回答带正文引用编号与折叠的来源列表
- **模型选择**：可在发送前切换 `deepseek-flash` / `deepseek-v4-pro`；右侧显示类似原生的 `DeepSeek-V4.1-Flash Max`，展开后先是「模型 / 推理等级」两行，再进入只有名称的模型列表或只有档位的等级列表，当前项用右侧勾选标记，选择按会话保存；不支持的能力（如 V4 Pro 的图片理解）会禁用并在行内以一行小字说明原因
- **阅读链接**：始终声明 `deepseek_read_url`，自动阅读用户消息中的链接
- **文件与图片上传**：PDF、Word、PPT 走版面解析；图片直接作为图片输入；文本、代码、表格、电子书走 `user_data`
- **会话管理**
  - 置顶 / 取消置顶：多个置顶会话集中在「已置顶」区域，按最近活动时间排序；普通会话按活动时间分组排序
  - 文件夹：创建、重命名、删除、折叠/展开（折叠状态持久化）、把一条或多条会话移入文件夹、移出文件夹；删除文件夹只把会话移回未分类，不删除聊天记录
  - 归档：归档会话从普通历史列表隐藏，在「归档管理」中查看、恢复或删除
  - 所有重命名 / 置顶 / 移动 / 归档 / 删除操作集中在右键或「···」菜单；删除会话与删除文件夹都有确认
- **历史搜索**：同时搜索会话标题和消息正文，支持中英文关键词；结果显示会话、正文片段、置顶/归档标记，点击打开会话并定位到匹配消息（老分支也会被重新打开）
- **长期记忆**：可选开启的跨会话记忆，能自动或手动保存用户的长期指令、背景、项目与偏好，在新对话中按问题相关度注入；支持记忆概述、Ask or Update 自然语言增删改查，以及从 ChatGPT / Claude / Gemini 等平台导入已有记忆（详见下文）
- **编辑用户消息**：悬停显示「编辑」「复制」；编辑框沿用消息气泡样式（无嵌套边框），Enter 保存并发送、Shift+Enter 换行、Esc 取消。编辑会创建新的对话分支：原来的回答与后续对话保留为版本，模型只接收当前分支的上下文
- **回答版本管理**：每条回答可复制、重新生成，重新生成产生独立版本（`1 / 3` 切换）；用户消息的编辑版本也可切换回来。每个版本各自保存正文、思考块、引用来源、用量与结束原因
- **继续生成**：用户主动停止、网络中断、超时或 `max_tokens` 截断的回答，可从已有正文处继续（以 assistant 前缀续写的方式请求，不做无关拼接）；只对当前最后一条有正文的回答开放
- **内容渲染**：代码高亮（语言标识、一键复制、长代码内部滚动、明暗两套配色）、LaTeX 公式（行内与独立公式块）、Mermaid 图表（失败时保留源代码）、表格、引用块、超链接与图片
- **历史记录**：会话列表、重命名、删除、本地持久化、会话内搜索
- **聊天记录导入**：把 DeepSeek App / 网页版导出的 ZIP 合并进 Chat 历史，保留标题、时间、思考、搜索来源、分支版本与可恢复的图片；全程在本机解析，不上传导出数据
- **导入后提取记忆**：导入完成后可选分析部分导入会话，先预览候选、确认后才写入长期记忆；默认不分析、只发送勾选的会话，已分析过的会话会标记并默认跳过，提取失败不影响已导入的聊天
- **交给 Agent**：把当前对话整理成可编辑的任务说明，可直接选择或新建 Harness 工作区，然后创建真实的 Agent 会话并把说明作为首条提示，切换到 Agent 继续开发
- 中英文界面、明暗主题、窗口缩放与移动端布局

## 输入框与工具菜单

输入框由 `Composer` 一个组件实现，空白聊天和已有聊天共用：

- `.dsc-composer` 是唯一的圆角边框、输入面材质与柔和阴影；`.dsc-editor-field` 是透明、无边框的文本编辑器。聚焦时**不画任何环**（连轻微边框变化都移除），只剩原生光标，复刻 Harness 输入区的安静 focus state。
- 内部结构对齐 Harness：文本区 `4px 8px 0 14px`，顶部 8px 留白，文本与工具行之间 12px，工具行 `2px 8px 6px`；`+` 为 28px 圆形按钮（原生 selector 填充），发送为 34px 圆形信息蓝按钮（空内容时 40% 透明度），两者都使用 `--dsw-*` 原生 token。
- 高度由编辑器内容决定，达到上限后 `overflow-y` 打开；粘贴长文本只影响内部滚动。
- 发送键偏好保存在本机（`sendKey`），设置里有"Enter 发送"和"Ctrl + Enter 发送"两档。
- 未发送的草稿按会话暂存：切换会话或点「新对话」时恢复各自的文本；附件上传会按原有逻辑中止。
- 联网搜索和深度思考是固定位置的直接开关；推理等级属于模型座位，不再占用一个单独的触发器。窄窗口下按钮收为图标、工具行允许换行，不产生横向溢出。

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

## 长期记忆

Chat 设置 → **长期记忆** 是一套与会话历史分开的本地记忆系统。记忆默认开启、自动提取默认关闭，两者都可以随时切换：

- **自动记忆提取**（需主动开启）：一轮对话结束后，Host 先用本地规则判断这轮是否包含值得长期保存的信息（用户明确要求遵守的指令、语言/格式/工具习惯、长期背景、项目与技术栈、重要决定等），只有通过判断的轮次才会调用一次 DeepSeek 提取；普通闲聊、代码问答和短句不会产生额外请求，并且每个会话有轮次与时间节流。开启前会提示：相关内容会发送到 DeepSeek API，可能产生额外调用费用。密码、证件号、银行卡、精确住址、联系方式等敏感个人信息不会被自动保存。
- **跨会话检索**：每次请求都在 Host 端按当前问题做本地词法相关度选择，不引入向量数据库或 Embedding 服务；只有相关的少量记忆会以参考信息加入模型上下文，并限制条数与字符预算。当前用户的新指令优先于历史偏好，记忆被明确标注为参考信息，不能覆盖系统规则。关闭长期记忆后，检索、注入和自动提取全部停止。
- **记忆概述**：把单条记忆整理成自然、分类清晰的概述，显示最后更新时间。概述是派生缓存：只有记忆条目的实质内容变化（修订号增加）才标记过期，打开记忆页或点击「重新整理」时才重新生成，不会每轮聊天都调用模型。
- **Ask or Update**：概述下方的输入框可以用自然语言查询记忆（“你现在记得我哪些事情”）、新增（“记住我喜欢简短的回答”）、更正（“我的项目已经从 Python 改成 TypeScript”）、删除（“忘记关于某个项目的记忆”）和重新整理概述。新增、更新、删除都会真正写入本地存储；删除目标不明确时先列出候选并要求确认，不会误删其他记忆。
- **管理与隐私**：按分类筛选，手动新增、编辑、删除，清空全部记忆（需确认）；每条记忆记录来源（手动 / 来自对话 / 导入自 ChatGPT、Claude、Gemini 等）与更新时间。删除会留下墓碑，旧聊天之后的自动提取不能把它加回来。
- **从其他 AI 导入**：两步式弹窗。第一步复制一段英文、与平台无关的导出提示词发给其他 AI（Instructions / Identity / Career / Projects / Preferences 五类，每条 `[YYYY-MM-DD] - 内容`，未知日期用 `[unknown]`，整个结果放在单个代码块里）；第二步把结果粘贴回来，本地解析、预览、编辑、勾选后合并导入。重复、冲突或可能包含敏感信息的条目会被标记，并允许逐条选择跳过、合并或更新；重复粘贴同一份导出不会产生重复记忆。非结构化文本可以显式同意后交给 DeepSeek 整理，默认不发送。

与 DeepSeek 聊天记录导入（ZIP）的整合已经打通：导入完成页会出现可选的「提取长期记忆」入口，也可以在「长期记忆」页重新打开。弹窗先列出可分析的导入会话（已分析过的带标记、默认跳过），默认不勾选任何会话；勾选后说明每个会话一次额外 API 调用及可能费用，只有再次确认后才逐个调用 `extract.imported`（一次最多 20 个，超出会明确提示而不是静默截断；分析过程中显示进度，可在会话之间停止）。候选记忆沿用 `preview` 的重复/冲突标记（提取阶段已过滤敏感信息），确认后走同一个 `import` 合并入口，来源记为「来自对话」。分析只读取当前分支消息，不修改 `state.json` 的消息树；分析成功的时间写在会话 `source.memoryExtractedAt`，所以同一批历史不会重复发送，除非用户显式勾选「重新分析」（关闭预览不会撤销标记，界面会提示）。详见 [docs/memory-integration.md](docs/memory-integration.md)。

## 来源与引用

- 回答正文里的引用是编号胶囊，点击打开原始网页；编号由 `collectMessageSources()` 生成：先按引用顺序给被引页面编号（1..n），再追加未被引用的搜索结果，按 URL 去重、去重不改变已分配的编号，因此刷新历史后编号与链接仍然一一对应。
- 来源默认折叠为一行 `来源 · N`，展开后是单列紧凑列表（编号、标题、域名、可选摘要），列表有最大高度并内部滚动；15 条来源不再占满整页。
- 来源为零时不渲染任何来源组件；思考区、正文、来源三层使用不同的字号与颜色权重。

## 模型与推理等级

模型与参数以 DeepSeek 应用 API 为准（[Messages API](https://api-docs.deepseek.com/zh-cn/api/create-message)、[思考模式](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode)）：

| 模型 | 图片理解 | 文件解析 | 联网搜索 | 深度思考 | 推理等级 |
| --- | --- | --- | --- | --- | --- |
| `deepseek-flash`（DeepSeek-V4.1-Flash） | 支持 | 支持 | 支持 | 支持 | low / high / max |
| `deepseek-v4-pro`（DeepSeek-V4-Pro） | 不支持 | 支持 | 支持 | 支持 | low / high / max |

> DeepSeek 的联网工具文档建议联网搜索使用 `deepseek-flash`；两个模型都接受服务端搜索工具，界面不因此禁用 V4 Pro 的搜索，但会在模型限制中提示图片能力差异。

- 请求通过 `model` 选择模型；`thinking: { type: "enabled" | "disabled" }` 控制开关；开启时用 `output_config.effort` 传 `low | high | max`。接口接受的 `minimal/medium/xhigh/ultra` 只是别名，界面不展示它们，Host 端也会折叠到真实档位。
- 模型座位是一个触发器：模型 API 名称（如 `DeepSeek-V4.1-Flash`）后接当前推理等级（如 `Max`），等级用 caption 色，和 Harness 原生模型控件一致。点击后先显示「模型 / 推理等级」两行根菜单；根菜单再进入名称列表或 `Off / Low / High / Max` 档位列表。两层都行式布局，当前项只用尾部勾选，不用整行色块。
- 模型菜单不再铺长说明或能力标签；完整说明只放在行的 `title` 里，唯一的例外是会影响附件操作的限制（V4 Pro「不支持图片」）以一行小字显示。
- 推理等级来自当前模型的 `capabilities.efforts`，不是自由数值；点击某档会确保深度思考开启并写入该档位，点击 `Off` 关闭深度思考。它与输入框下方的深度思考按钮共享同一个设置，但入口分工清楚。
- 选中的模型记录在每条回复上，消息底部显示"模型 · 等级"；不支持图片的模型会在输入框上方说明原因，并在发送含图片的消息前拒绝。
- 模型目录由 Host 的 `bootstrap.models` 提供，浏览器不猜测模型列表；旧 Host 不返回目录时只提供 `deepseek-flash`（那是旧 Host 唯一会发出的模型）。旧 Host 的目录缺少 `displayName` 时，界面会从它已有的模型 `version` 推导原生风格名称。
- 选择按会话保存（`model-config.json`，键为会话 id），新对话使用全局默认；该文件与会话消息历史分开存储，不改变 `state.json` 的消息格式与版本迁移。

## 内容渲染

`client-src/30-markdown.js` 是 Markdown 入口，另外三个模块各自独立、无外部依赖。渲染前会先把代码块/行内代码保护起来，再把完整的行内与块级公式替换成自带内容标记的占位符，最后才进入 Markdown 解析；未闭合的 `$` / `$$`（流式输出中间态）保持纯文本，`latex` / `math` / `tex` 围栏则整块交给公式渲染器而不是生成代码块：

- `31-highlight.js`：单遍扫描的词法高亮，支持 JS/TS、JSON、HTML/XML、CSS、Python、Bash、PowerShell、SQL、Java、C#、C/C++、Go、Rust、YAML、Markdown、diff 等；未知语言按纯文本显示，字符永远不会丢失。
- `32-math.js`：LaTeX 子集渲染（分数、根式、上下标、大型运算符、定界符、矩阵、cases/aligned、重音、希腊字母与常用运算符，另有 `\boxed{}` 边框、`\qquad` 2em 间距和顶层 `\\` 换行）；矩阵按最宽行锁定列数布局，`bmatrix` 的方括号用可随矩阵高度拉伸的 CSS 边框绘制；未知命令或未支持/未闭合环境（如自定义宏、`tikzcd`、流式中的半截矩阵）不抛错，整条公式回退为等宽浅底的 `.dsc-math-fallback` 原文；解析失败时回退为原始公式文本。公式容器使用 KaTeX / `Times New Roman` / Cambria Math 的衬线字体栈。
- `33-mermaid.js`：flowchart/graph、sequenceDiagram、pie、classDiagram 的 React SVG 渲染；不支持或超出上限时显示错误说明并保留源代码。
- 所有内容都以 React 元素输出，不使用 `innerHTML` / `dangerouslySetInnerHTML` / `eval`；链接与图片只允许 http(s)。
- 流式输出时已完成的块靠 `React.memo` 跳过重渲染，Mermaid 图表在最后一个块生成结束后才绘制，避免每帧重排；未闭合的块级公式、未闭合的 `\boxed{` 或尚未结束的 TeX 围栏先以同尺寸源码块占位，闭合后整体替换为公式，公式块保留最小高度，块级公式与代码块各自横向滚动。

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

## 导入 DeepSeek 聊天记录

侧边栏底部的 **导入聊天记录** 会把 DeepSeek App / 网页版导出的聊天记录 ZIP 合并进 Chat 历史：

1. 选择或拖入 ZIP（如 `deepseek_data-<导出日期>.zip`）。文件只交给本地 Host 解析；不上传、不调用 DeepSeek API。
2. 预览列出导出中的全部会话：标题、创建时间、消息数。已经导入过的会话标为「已导入」并默认不勾选；可以按标题筛选、全选或逐个勾选。
3. 导入在 Host 后台进行，弹窗显示进度并可随时取消；单个会话出错只进入失败列表，不影响其他会话。
4. 结束后显示成功 / 跳过 / 失败的数量，并自动刷新侧边栏。导入的会话就是普通 Chat 历史：可以阅读、搜索、重命名、置顶、归档、移入文件夹、切换消息版本，也可以在原有上下文上继续对话或「交给 Agent」。

这是合并导入，不是覆盖：每条导入的会话都带稳定来源标识 `source = { kind: 'deepseek-export', id: <导出中的会话 id>, importedAt }`，同一份导出（或另一份包含同一会话的导出）再次导入时，已存在的会话会被跳过而不是新建。写入前会把当前 `state.json` 复制为 `state.json.import-backup-<时间戳>`；历史按批写入，中断或取消时只有已完成的批次留在文件中。

### 支持范围

| 导出内容 | 导入结果 |
| --- | --- |
| 标题、创建 / 更新时间、置顶 | 原样保留（标题为空时用第一条提问补全） |
| 用户提问、AI 回答、Markdown / 代码 / 公式 | 原样保留，沿用现有渲染 |
| 深度思考 `THINK` | 思考块，按导出的 `elapsed_secs` 还原用时 |
| 联网搜索 `TOOL_SEARCH` / 打开网页 `TOOL_OPEN` | 「搜索 / 阅读」步骤 + 搜索结果与来源列表 |
| 内容风险提示 `CONTENT_RISK` | 回答下方的提示条，不进入正文、复制内容或模型上下文 |
| 文件 / 图片 `FILE` | 附件元数据；图片字节从 ZIP 中恢复并保存在本地，可直接显示 |
| 消息分支（编辑提问 / 重新生成） | 完整节点树；`current_message_id` 作为当前分支，其他版本仍可切换 |
| 未完成 / 超时 / 被内容过滤的回答 | 保留原状态与服务器模板文案，不伪造内容 |
| `TOOL_FIND`、`TOOL_IMAGE_SEARCH` 等片段 | 不导入（导出中没有可还原的正文） |

导出的全部真实会话只存在于本机测试环境；仓库内的测试样本全部是合成的导出结构，不含任何真实对话。

### 与长期记忆模块的接口

导入后的会话在存储里与普通会话完全相同，只多一个来源字段，供后续「用户授权后批量提取」使用：

- `conversation.source = { kind, id, importedAt }`：`kind` 固定为 `deepseek-export`，`id` 是导出中的会话 UUID，`importedAt` 是导入时间（毫秒）。普通会话的 `source` 为 `null`。
- `store.listSummaries()` 的每一项都带 `source`，长期记忆模块可以直接筛出 `source.kind === 'deepseek-export'` 的会话。
- `store.findBySource(kind, id)` 与 `store.importedSourceIds(kind)` 用于按来源查找与去重；需要按时间范围或全量导出时，在这两个方法上扩展即可，不必改动导入流程。
- 图片保存在 `$DSH_HOME/deepseek-chat/imports/media/<sha256>.<ext>`（按内容寻址，重复图片只存一份），由 `/api/deepseek-chat/import/media` 只读提供，浏览器经 Host 传输层取回后以 blob URL 显示。导入的附件带 `local: true`，`protocol.js` 在构造请求时会跳过它们，因此继续对话不会把无效的 file id 发给 DeepSeek。

### 安全与限制

- ZIP 由 `lib/import/zip.js` 用 Node 内置 `zlib` 读取：只按名字取需要的条目，从不把条目名当作路径写文件（路径穿越无效）；限制归档大小、条目数量与单条目解压上限，并校验 CRC 与声明大小；ZIP64、加密条目、多卷压缩包会被明确拒绝。
- 解析与转换都在 Host 进程内，按会话逐个进行并让出事件循环；导入任务同时只允许一个，浏览器轮询进度，可随时取消。
- 导入只接受 `export_format_version: 3`（当前 DeepSeek 导出格式）。出现新版本时会明确提示「不支持的导出格式」，不会猜测解析。
- 图片只恢复 PNG / JPEG / WebP / GIF / BMP / AVIF / SVG；导出中缺少字节的附件只保留名称、大小与类型。
- 导入的本地图片不会重新上传到 DeepSeek，因此继续对话时模型看不到这些图片（历史里的文字与回答照常参与上下文）。

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
| `maxImportBytes` | `536870912` | 聊天记录导入 ZIP 上限（512 MB） |
| `memoryTimeoutMs` | `60000` | 记忆提取、概述生成或 AI 整理单次请求的超时 |

## 数据

- 历史：`$DSH_HOME/deepseek-chat/state.json`（原子写入）
- 数据格式为 **v2**：每条会话是一棵消息节点树（`nodes` + `leafId`），`messages` 由当前分支推导；文件夹、置顶、归档状态保存在同一个文件中。旧版 v1 的线性 `messages` 会在加载时自动迁移，迁移前把原文件复制为 `state.json.v1-backup-<时间戳>`，可随时用备份还原
- 编辑、重新生成只会新增兄弟节点，旧消息节点不会被覆盖；切换版本只改变 `leafId`
- 消息版本各自保存 `blocks`（正文、思考、搜索/阅读步骤与引用）、`usage`、`stopReason` 等元数据
- 模型与推理等级偏好：`$DSH_HOME/deepseek-chat/model-config.json`（按会话 id 记录覆盖项 + 新对话默认值）
- 长期记忆：`$DSH_HOME/deepseek-chat/memory.json`（原子写入）——开启状态、记忆条目、来源、概述缓存、修订号与删除墓碑。它与 `state.json` 的聊天记录完全分开，不覆盖、不迁移聊天历史；文件损坏时会隔离为 `memory.json.corrupt-<时间戳>` 并从空记忆启动，聊天不受影响
- 上传文件：由 DeepSeek Files API 托管，插件只保存 `file_id` 和展示元数据；附件会随编辑后的用户消息保留
- 导入的会话写在同一个 `state.json` 里，只多一个 `source` 来源字段（含最近一次记忆提取时间 `memoryExtractedAt`）；导入前备份为 `state.json.import-backup-<时间戳>`
- 导入暂存：`$DSH_HOME/deepseek-chat/imports/staging/<token>/export.zip`，导入结束或 30 分钟未开始即删除
- 导入图片：`$DSH_HOME/deepseek-chat/imports/media/<sha256>.<ext>`（内容寻址，只增不删）
- 删除会话只删除本地记录和该会话的模型偏好，不删除 DeepSeek 侧已上传的文件
- 联网搜索、深度思考搜索与文件解析使用 DeepSeek 服务，可能产生对应用量费用

## 实现

- Host：`index.js` + `lib/`，通过 `ctx.connection.fetch` 注册 owner-only 路由，代理 DeepSeek Messages / Files API，解析 SSE 并持久化；交接路由调用 Harness 的 `sessionController`；问候用户名走 `/api/deepseek-chat/profile`，只读取已登录账号的显示名称并在 Host 缓存 60 秒，失败时返回空名称而不影响聊天。
- 存储：`lib/store.js` 维护会话节点树、文件夹与组织状态；`presentPath()` 只把当前分支交给协议层，`selectVersion()` / `focusMessage()` 通过切换 `leafId` 重开旧分支；历史搜索在本地线性扫描标题与正文，不引入额外数据库。
- 流式协议：`/api/deepseek-chat/stream` 支持 `send` / `edit` / `regenerate` / `continue` 四种模式。`edit` 把新提问挂到原提问的父节点下，`regenerate` 在同一个提问下新增回答兄弟节点，`continue` 用已保存的可见正文作为 assistant 前缀（prefill）请求剩余内容并原地追加。`start` 帧会下发本次生效的完整分支，浏览器用它替换乐观渲染的消息，避免旧分支回答混入当前上下文。
- 模型：`lib/model-config.js` 是模型目录、能力与偏好的唯一来源，`bootstrap.models` 把目录送到浏览器；`/api/deepseek-chat/model` 读写偏好；`stream` 用目录校验 `model`，把偏好中的 effort 与请求值折叠后交给协议层。
- 导入：`lib/import/` 与聊天界面解耦——`zip.js` 只读 ZIP（文件句柄 + `zlib.inflateRaw`，条目名只做键、不落盘）、`format.js` 校验导出结构与时间戳、`convert.js` 把导出消息树转换成 Chat 的节点树（思考、搜索步骤、来源、图片、分支）、`media.js` 是内容寻址的图片库、`index.js` 负责暂存上传、后台任务、分批合并与去重。路由是 `/api/deepseek-chat/import/{upload,start,status,cancel,discard,media}`：`upload` 把请求流写到暂存文件并返回预览，`start` 返回 job id，浏览器轮询 `status`；每 40 个会话写一次历史，写入失败时把这些会话从内存中回滚，保证内存与文件一致。
- 记忆：`lib/memory-text.js`（规范化、内容指纹、词法相似度、分类推断、敏感信息检测）、`lib/memory-store.js`（`memory.json`、去重/合并、导入、删除墓碑、概述修订号）、`lib/memory.js`（相关度检索与字符预算、系统提示记忆块、自动提取的门控与提示词、概述生成、Ask or Update 规划器、`extractFromMessages` 历史导入接口）。Host 的 `/api/deepseek-chat/memory` 提供记忆读写、预览、导入、概述刷新、Ask/确认和 AI 整理动作；`stream` 在构造请求时注入相关记忆，并在回复结束后异步触发自动提取，提取失败只记一条警告，不影响聊天。
- Client：`client.js` 由 `client-src/*.js` 拼接，通过 `shell.overlay` 渲染全屏 Chat（起点在 `--dsh-frame-chrome-top` 之下，即原生标题栏下方），并在同一 `shell.overlay` 注册 root 级的 `deepseek-chat-mode:mode-switch`，作为两种模式共享的顶层导航。样式全部使用 `--dsw-*` 主题变量；侧栏品牌沿用 DeepSeek 官方鲸鱼与字标矢量，内联在插件中，不加载 Harness Client 包。
- Client 模块：`30-markdown.js`（Markdown 与引用标记）、`31-highlight.js`、`32-math.js`、`33-mermaid.js`、`43-popover.js`（原生菜单几何、视口夹取与键盘）、`47-model.js`（模型 + 推理等级双层菜单）、`48-tools.js`（工具注册表与「＋」面板）、`58-memory.js`（长期记忆设置页、记忆概述、Ask or Update、跨平台导入弹窗与本地导出解析器）。
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

- 兼容性：本版本在 **DeepSeek Harness 0.2.2-rc.5** 上验证：Windows Desktop 与 macOS 的本次界面修复均已实机核对；`engines.dsh` 声明为 `>=0.2.2-rc.5`。Web 尚未验证。
- 数学公式是面向聊天的 LaTeX 子集（不是完整 KaTeX）；`\begin{tikzcd}`、自定义宏、`\color` 等高级用法会整条回退为带浅底的等宽源码，不丢字、不报错。
- Mermaid 支持流程图、时序图、饼图与基础类图；思维导图、甘特图等类型会显示错误说明并保留源代码。
- 编辑/重新生成采用线性版本导航（`‹ 1 / 3 ›`）而不是完整的可视化分支树面板；被替换的分支仍保存并可切换回来。
- 「继续生成」依赖 DeepSeek Messages API 的 assistant 前缀续写（prefill）语义；如果账号或服务端拒绝该模式，请改用重新生成。续写不会恢复深度思考，只延续可见正文。
- 历史搜索在本地扫描当前 `state.json` 的全部消息节点，适合本机历史量；没有独立搜索索引服务。
- 导入大量会话会让 `state.json` 变大（几百个会话约几十 MB），每次保存都要重写整份文档；建议只勾选需要的会话（可导入会话超过 100 个时弹窗会提示）。
- 导入是单任务的：同一时间只允许一个导入任务，取消后会保留已写入的批次。
- 导入只恢复导出中确实存在的内容：`TOOL_FIND` / `TOOL_IMAGE_SEARCH` 等没有正文的片段不会进入消息；导出中缺少字节的附件只保留元数据。
- 导入后的记忆提取是用户主动发起的：默认不分析任何会话，每个被分析的会话会产生一次额外 DeepSeek 调用与相应费用。真正发出请求并完成的会话写入 `source.memoryExtractedAt`，下次默认跳过；模型有响应但没有候选时仍算已分析（避免为同一段历史重复付费），没有可分析内容或请求失败的会话不写标记，也不修改已导入的聊天。分析中途停止时，已完成请求的会话保留标记，未开始的保持可分析。
- 文件夹整理通过菜单完成，未实现拖拽排序（避免引入拖拽依赖）。
- 生成过程中需先停止回复，才能切换会话、编辑消息或新建对话。
- `deepseek-v4-pro` 不支持图片理解；含图片的消息会在发送前被拒绝并提示切换模型。
- 宿主端代码（`index.js` / `lib/`）改动后需要重载插件或重启 Harness 才会生效；浏览器端会先显示“需要刷新插件”的提示。
- 长期记忆的跨会话检索使用本地词法匹配（中文按二元字符、英文按单词），没有向量数据库或 Embedding；语义相近但用词完全不同的记忆可能检索不到，适合轻量本机使用。
- 自动提取依赖本地规则判断加每轮最多一次额外模型调用；关闭自动提取后手动记忆、检索与导入仍然可用。
- 记忆概述一次生成一种界面语言的文本；切换界面语言后点击「重新整理」才会按新语言重新生成。
- 跨平台导入优先使用本地解析器，支持常见标题、列表与代码块格式；极端格式可能需要「AI 整理」（需显式同意后才会发送到 DeepSeek）。
- 敏感信息检测与去重都是启发式规则，不能替代用户自己检查；导入前预览会标出可能重复、冲突或敏感的内容。
- 长期记忆只保存在本机 DSH Host 的 `memory.json`，不参与 Harness 原生 Agent 会话存储，也不会同步到其他设备。
- 联网搜索、文件解析是否可用取决于账号/API Key 与所选模型的服务端能力，可能产生额外用量费用。
- 本插件不是 DeepSeek 官方产品。

## 开发

```sh
node --test tests/*.test.js        # 或逐个执行（受限沙箱里 --test 子进程不可用）
node tools/build-client.js         # client-src/*.js -> client.js
node tools/smoke-client.js         # 无浏览器渲染冒烟（会话分组、搜索、编辑/重生成/续写、输入框、菜单、来源、模型、工作区创建、长期记忆、公式/图表/代码）
node tools/check-css.js            # 样式括号 / 硬编码颜色检查
node tools/check-classes.js        # JS 与样式类名一致性
node tools/check-i18n.js           # 中英文键一致性
node tools/check-highlight.js      # 代码高亮字符不丢失 / 分类 / 性能
node tools/check-math.js           # LaTeX 子集渲染、未知环境降级与深度保护
node tools/check-markdown-math.js  # Chat 公式解析管线：代码保护、多公式、流式与 10+ 块级公式
node tools/preview-math.js         # 生成 \boxed / \qquad 公式静态预览页（配合无头浏览器截图）
node tools/check-upload.js         # 上传入口模式守卫、切换锁、隐藏 input 与监听器配对
node tools/check-mermaid.js        # Mermaid 解析、几何与错误回退
node tools/check-memory-client.js  # 跨平台记忆导出提示词与本地解析器
```

测试覆盖：`tests/store.test.js`（v1→v2 迁移与备份、文件夹/置顶/归档、搜索、分支与版本切换、导入会话的记忆分析标记）、`tests/protocol.test.js`（上下文构造与续写前缀）、`tests/conversation.test.js`（Host 路由与 send/edit/regenerate/continue 端到端、导入会话继续聊天）、`tests/workspace.test.js`（项目文件夹创建、工作区注册与交接）、`tests/import.test.js`（导出预览、导入、去重、重启持久化、取消、损坏会话隔离、路径穿越与解压上限）、`tests/import-convert.test.js`（片段映射、分支选择、来源字段、存储合并与请求构造）、`tests/model-config.test.js`、`tests/service-stream.test.js`、`tests/api.test.js`、`tests/profile.test.js`、`tests/host-entry.test.js`、`tests/memory-store.test.js`（记忆持久化、去重/合并、导入幂等、墓碑、概述修订、损坏恢复）、`tests/memory-service.test.js`（检索与预算、提取门控、概述并发、Ask or Update 增删改确认、历史会话提取接口）、`tests/memory-conversation.test.js`（记忆注入真实流式请求、关闭/删除后停止注入、后台提取成功与失败、memory 路由端到端、导入会话的选择性提取/确认/去重/失败隔离/空会话不标记/并发去重）、`tests/memory-import.test.js`（跨平台导出解析器）。导入测试的样本由 `tests/support/export-fixture.js` 现场生成，不包含任何真实聊天记录。

安装：在 DSH 的 Plugins 页面选择本地目录，或由 Agent 使用 `plugin_manager install_bundle` 安装本目录。发布包也可以使用 `.tgz` 直接安装；`.zip` 需先解压，安装目标为解压后的目录（DSH 不接受 `.zip` 文件本身）。本机开发时 profile 里用 `link:` 指向本仓库即可。

## 许可证

DSHift 采用 MIT 许可证授权。
详情请见 [LICENSE](LICENSE)。
