# Changelog

DSHift 的版本变更记录。每个版本都对应一个 GitHub Release，安装包、校验和与验证记录见链接。

## v0.2.0-beta.4 — 2026-11-27

[GitHub Release](https://github.com/SamuelChung2010/DSHift/releases/tag/v0.2.0-beta.4)

### 修复与优化

- **长会话输入性能**：`useChat` 改为基于 `useSyncExternalStore` 的选择器精确订阅，无变化的 store patch 不再广播；消息行、Markdown 与 Thread 增加稳定的 memo 边界，输入草稿不再触发历史消息重渲染。Windows 11 / Chrome 158 基准中，300 条会话输入 P95 从 22.2 ms 降到 8.2 ms，500 条从 32.0 ms 降到 16.6 ms，500 条密集 Markdown 从 118.3 ms 降到 14.5 ms；普通输入时历史消息与 Markdown 重渲染为 0，流式期间只更新当前消息。详见 [性能报告](docs/perf/long-chat-performance.md)。
- **公式渲染增强**：支持 `\boxed{}`、`\qquad`、顶层 `\\` 换行以及 `latex` / `math` / `tex` 围栏公式；流式中未闭合的括号或 TeX 围栏保持原文，闭合后再整体渲染，不再画出半截公式。公式字体栈调整为 KaTeX / Times New Roman / Cambria Math。

### 升级说明

- 聊天历史保持 v2 兼容，无需迁移；长期记忆文件格式未变。
- Host 端改动需要重启 DSH 或重载插件；浏览器端首次可能提示刷新。

## v0.2.0-beta.3 — 2026-11-23

[GitHub Release](https://github.com/SamuelChung2010/DSHift/releases/tag/v0.2.0-beta.3)

### 修复

- **公式与 Markdown 渲染**：先保护代码块、行内代码与公式占位符，修复行内代码显示成 `code:...`、矩阵/`bmatrix` 布局错位、未支持或未闭合 LaTeX 只画出半截公式，以及流式公式完成后内容跳动的问题。未知环境整条回退为浅底等宽源码，不丢字、不报错。
- **模式切换时的文件选择器**：修复从 Agent 切回 Chat 时误弹系统文件选择器。上传改为“实时注册 input + 模式门禁”，切换期间加锁；隐藏 input 不再进入 Tab 顺序，拖拽、粘贴与导入上传共用同一道守卫。
- **Harness 原生控件**：`＋`、发送与停止按钮改用原生 16-unit 图形和 28/34px 正圆，补上 `corner-shape: round`，不再被主题的 `superellipse` 压成圆角矩形；`交给 Agent` 按钮调整为 40px 胶囊，与 Chat | Agent 切换器同高、同圆角并保持对齐，窄屏同步缩到 36px。
- **可观测性**：上传路径增加 `[upload]` 诊断日志与原生文件 input 点击栈，便于复现时定位触发来源。

### 升级说明

- 无数据格式变化；从 Beta 2 升级无需迁移。Host 端改动需要重载插件或重启 DSH。

## v0.2.0-beta.2 — 2026-11-21

[GitHub Release](https://github.com/SamuelChung2010/DSHift/releases/tag/v0.2.0-beta.2)

### 修复

- **Windows 主面板对齐**：Chat 主内容区左上角改用框架同款 `--dsh-windows-content-radius`（16px）圆角，并按原生中间列的方式裁切内容、由侧栏底色填充缺口；Windows 下同时去掉 Chat 侧栏右边线，与原生 Windows 布局一致。
- **macOS 顶栏与侧栏**：`Chat | Agent` 切换器改为按当前模式的主内容列居中；Chat 打开时隐藏被遮住的原生侧栏开关；侧栏底色、分隔线与抽屉遮罩对齐原生。
- **macOS 拖拽区与可读性**：Chat 侧栏品牌行退出 `-webkit-app-region: drag`，盖在原生拖拽行上的控件仍可点击；对话框主按钮与开关改用原生强调色 token，深色模式不再白底白字；发送快捷键提示在 macOS 显示 Command + Enter。

### 升级说明

- 只包含界面修复，无数据格式变化；从 Beta 1 升级无需迁移。

## v0.2.0-beta.1 — 2026-11-20

[GitHub Release](https://github.com/SamuelChung2010/DSHift/releases/tag/v0.2.0-beta.1)

### 新增

- **聊天记录导入**：读取 DeepSeek App / 网页版导出的官方 ZIP，在本机解析、预览并选择会话导入。消息、思考过程、搜索步骤、引用来源、分支版本与可恢复图片都会转换到 Chat 历史；重复导入不会产生重复会话，导入的会话可以搜索、管理并继续聊天。
- **长期记忆**：可选的跨会话记忆，支持自动记忆提取、按问题相关度检索、Memory Summary、Ask or Update、手动增删改、从 ChatGPT / Claude / Gemini 导入已有记忆，以及记忆总开关与隐私控制。记忆保存在本机 `memory.json`，与聊天记录分开。
- **原生界面收尾**：输入框、`＋` 菜单和模型座统一到 Harness 原生风格。`＋` 是贴近输入框、近乎等宽的大圆角浮层，左侧图标与名称、右侧简短说明；模型与推理等级合并在同一个双层菜单中；`＋` 与发送按钮保持圆形，联网搜索与深度思考仍是独立按钮。
- **导入后提取记忆**：导入完成页可选择部分导入会话分析长期记忆；默认不勾选、不调用模型，确认费用提示后才逐个分析，候选记忆先预览再合并。已分析的会话会标记并默认跳过，提取失败不影响已导入的聊天。

### 升级说明

- 聊天历史升级为 v2 节点树；旧 v1 历史在加载时自动迁移，迁移前保留 `state.json.v1-backup-*` 备份。
- 长期记忆使用独立的 `$DSH_HOME/deepseek-chat/memory.json`。

## v0.1.0-beta.1 — 2026-11-19

[GitHub Release](https://github.com/SamuelChung2010/DSHift/releases/tag/v0.1.0-beta.1)

首个公开 beta：DSH 中的原生 Chat 模式、独立历史与输入框、流式回答与停止、多轮上下文、模型选择、文件上传、Chat → Agent 交接，以及 Markdown / LaTeX / Mermaid 渲染。本版本面向早期试用，后续版本增加了导入、长期记忆和渲染/性能改进。

## 更早版本

所有历史版本、安装包与校验信息见 [GitHub Releases](https://github.com/SamuelChung2010/DSHift/releases)。
