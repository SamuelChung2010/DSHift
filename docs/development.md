# 开发指南

本文说明构建、测试、检查、性能基准与本地安装。用户安装见 [README](../README.md)，运行机制见 [架构说明](architecture.md)。

## 环境

- Node.js（开发使用 Node 24；构建与测试脚本只依赖 Node 内置模块）
- Chromium / Chrome（仅性能基准需要）
- 可运行 DSH 的桌面环境；本地开发通常通过 profile 的 `link:` 指向本仓库

本项目没有 npm 运行时依赖，不引入独立运行环境、CSS 框架或状态管理库。`client.js` 是提交到仓库的构建产物。

## 仓库结构

```text
index.js                 Host 插件入口
lib/                     Host：API、协议、存储、导入、记忆
client-src/              Client 源码，按文件名顺序拼接
client.js                client-src → 单文件产物
locale/                  中英文文案
cordis.patch.yml         DSH profile 插件行与默认配置
tests/                   Host 与纯函数测试
tools/                   构建、检查、冒烟、性能基准
docs/                    用户、架构、配置、限制与性能文档
assets/                  README 演示资源
```

## 构建

```sh
node tools/build-client.js   # client-src/*.js -> client.js
```

构建脚本按固定顺序拼接 `client-src/*.js`，拒绝包含 `import` / `export` 的片段，并包装成 `window.__ModuleLoader__.load(...)` 工厂。修改 `client-src/` 后必须重新构建并提交 `client.js`；不要手改生成文件。

## 测试与检查

```sh
node --test tests/*.test.js        # 或逐个执行（受限沙箱里 --test 子进程不可用）
node tools/smoke-client.js         # 无浏览器渲染冒烟
node tools/check-css.js            # 样式括号 / 硬编码颜色
node tools/check-classes.js        # JS 与样式类名一致性
node tools/check-i18n.js           # 中英文键一致性
node tools/check-highlight.js      # 代码高亮字符/分类/性能
node tools/check-math.js           # LaTeX 子集、未知环境与深度保护
node tools/check-markdown-math.js  # 公式解析管线、代码保护、流式与多块公式
node tools/preview-math.js         # 生成 \boxed / \qquad 静态预览页
node tools/check-upload.js         # 上传入口、模式守卫、隐藏 input 与监听器
node tools/check-mermaid.js        # Mermaid 解析、几何与回退
node tools/check-memory-client.js  # 跨平台记忆导出提示词与本地解析器
```

`tools/smoke-client.js` 和 `check-memory-client.js` 使用最小 React shim，不替代浏览器可视化验证；它们捕获引用错误、组件形状错误和关键行为回归。

### 测试覆盖

| 测试 | 覆盖 |
| --- | --- |
| `tests/store.test.js` | v1→v2 迁移与备份、文件夹/置顶/归档、搜索、分支与版本切换、导入会话的记忆分析标记 |
| `tests/protocol.test.js` | 上下文构造与续写前缀 |
| `tests/conversation.test.js` | Host 路由、send/edit/regenerate/continue 端到端、导入会话继续聊天 |
| `tests/workspace.test.js` | 项目文件夹创建、工作区注册与交接 |
| `tests/import.test.js` | 导出预览、导入、去重、重启持久化、取消、损坏会话隔离、路径穿越与解压上限 |
| `tests/import-convert.test.js` | 片段映射、分支选择、来源字段、存储合并与请求构造 |
| `tests/model-config.test.js` / `tests/service-stream.test.js` / `tests/api.test.js` / `tests/profile.test.js` / `tests/host-entry.test.js` | 模型、流式、API、账号显示名与 Host 入口 |
| `tests/memory-*.test.js` | 记忆持久化、检索/预算、提取门控、概述并发、Ask or Update、导入提取、跨平台解析 |
| `tests/client-store.test.js` | selector 缓存、store 去重、监听器、浅比较、IME 与发送键 |

导入测试的样本由 `tests/support/export-fixture.js` 现场生成，不包含任何真实聊天记录。

## 本地安装

在开发 profile 的 `package.json` 中使用 link：

```json
{
  "dependencies": {
    "@local/deepseek-chat-mode": "link:C:/path/to/DSHift"
  }
}
```

或在 DSH 的 Plugins 页面选择仓库目录。Host 端代码改动后需要重启 DSH 或重载插件；浏览器端首次可能提示刷新。

## 性能基准

Beta 4 的性能数据和根因分析见 [docs/perf/long-chat-performance.md](perf/long-chat-performance.md)。可选的零依赖 CDP 基准工具在 [`tools/perf/`](../tools/perf/README.md)，需要本机 Chrome 和隔离的 DSH Web 实例；它不属于 `node --test`。

基准要求：

- 只使用合成会话，不导入真实聊天记录；
- 修复前后使用同一设备、同一浏览器、同一数据和同一口径；
- 延迟必须注明是 P95、测量区间与运行环境，不能把本机结果泛化为所有用户。

## 发布

1. 更新 `package.json` 版本，按需更新 `CHANGELOG.md` 与 README 发布说明；版本号遵循 semver prerelease。
2. 运行全部测试、检查与冒烟；确认 `client.js` 与源码一致。
3. `npm pack` 生成 `.tgz`；解压后压缩为 `.zip`；生成 `SHA256SUMS.txt`、`PACKAGE_CONTENTS.txt` 与验证记录。
4. 在 GitHub Release 发布 tag 与安装包；安装包可以在 DSH Plugins 页面或 `plugin_manager install_bundle` 使用。

发布包只包含 `package.json` 的 `files` 列表：`index.js`、`client.js`、`lib`、`docs`、`cordis.patch.yml`、`locale`、`icon.svg`、`README.md`（以及本次文档重构加入的 `README.en.md` / `CHANGELOG.md` / `assets/demo.gif`）。不要把 `.release/`、测试夹具或真实聊天记录提交进仓库。

## 文档维护

| 文件 | 职责 |
| --- | --- |
| `README.md` / `README.en.md` | 面向新用户的项目主页，保持相同结构与核心内容 |
| `docs/user-guide.md` | 完整使用说明 |
| `docs/architecture.md` | 内部架构、状态、渲染与管线 |
| `docs/configuration.md` | 认证、配置、数据与模型 |
| `docs/limitations.md` | 兼容性、功能边界与测试范围 |
| `docs/memory-integration.md` | 导入会话与记忆提取接口 |
| `docs/perf/` | 性能报告与原始数据 |
| `CHANGELOG.md` | 版本历史与 Release 链接 |

修改文档时检查所有相对链接、图片和安装命令；不要宣传尚未发布的功能，也不要虚构用户数量、性能数据或官方推荐。

## 相关文档

- [用户指南](user-guide.md)
- [架构说明](architecture.md)
- [配置说明](configuration.md)
- [已知限制](limitations.md)
- [返回 README](../README.md)
