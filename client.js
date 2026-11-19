window.__ModuleLoader__.load({
  id: '@local/deepseek-chat-mode',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const Fragment = React.Fragment

/* ---- 10-locale.js ---- */
const CHAT_NS = 'deepseekChatMode'

const DICT_ZH = {
  appTitle: 'DeepSeek Chat',
  chatMode: 'Chat',
  openChat: 'Chat',
  agentMode: 'Agent',
  agentModeFull: 'Agent 模式',
  modeSwitchLabel: '切换 Chat 与 Agent 模式',
  newChat: '新对话',
  searchChats: '搜索对话',
  today: '今天',
  yesterday: '昨天',
  earlier: '更早',
  noChats: '还没有对话',
  settings: '设置',
  greeting: '你好，我是 DeepSeek',
  greetingSubtitle: '可以问我任何问题。我可以深度思考、联网搜索，也可以阅读你上传的文件。',
  suggestionThinkTitle: '深度思考',
  suggestionThink: '用简单的比喻解释量子纠缠',
  suggestionCodeTitle: '编写代码',
  suggestionCode: '用 Python 实现快速排序，并解释思路',
  suggestionSearchTitle: '联网搜索',
  suggestionSearch: '总结今天 AI 领域的重要新闻',
  suggestionFileTitle: '文件问答',
  suggestionFile: '上传一份 PDF，让我总结要点',
  composerPlaceholder: '给 DeepSeek 发送消息',
  send: '发送',
  stop: '停止生成',
  attach: '上传文件',
  deepThink: '深度思考',
  webSearch: '联网搜索',
  disclaimer: '内容由 AI 生成，请仔细甄别',
  thinkingActive: '正在思考…',
  thinkingSearching: '正在搜索…',
  thinkingReading: '正在阅读网页…',
  thinkingDone: '已深度思考（用时 {seconds} 秒）',
  thinkingDoneNoTime: '已深度思考',
  searching: '正在搜索',
  readingPage: '正在阅读网页',
  readingLink: '正在阅读链接',
  searchQueries: '搜索关键词',
  searchResults: '搜索结果',
  sources: '来源',
  sourceCount: '来源 · {count}',
  viewAll: '查看全部',
  showLess: '收起',
  openPage: '打开网页',
  findInPage: '在网页中查找「{pattern}」',
  noSearchResults: '没有找到相关结果',
  searchFailed: '搜索失败',
  readFailed: '网页读取失败',
  copy: '复制',
  copied: '已复制',
  delete: '删除',
  rename: '重命名',
  cancel: '取消',
  confirm: '确认',
  deleteChatTitle: '删除对话',
  deleteChatMessage: '删除后无法恢复。确定删除「{title}」吗？',
  renameChat: '重命名对话',
  chatTitlePlaceholder: '对话名称',
  settingsTitle: 'Chat 设置',
  connection: '连接',
  authMode: '认证方式',
  authAuto: '自动',
  authAccount: 'DSH 账号',
  authApiKey: 'API Key',
  authReady: '已就绪',
  authMissing: '未配置',
  authSourceChatKey: 'Chat API Key',
  authSourceDshKey: 'DSH API Key',
  authSourceAccount: 'DSH DeepSeek 账号',
  authAccountSignedIn: 'DeepSeek 账号已登录',
  authAccountSignedOut: 'DeepSeek 账号未登录',
  apiKeyLabel: 'DeepSeek API Key',
  apiKeyPlaceholder: 'sk-...',
  apiKeyConfigured: '已保存（不会回显）',
  apiKeyHint: 'Key 保存在 DSH 凭证库中，只在 Host 使用。也可以设置 DEEPSEEK_API_KEY 环境变量。',
  save: '保存',
  saving: '保存中…',
  clear: '清除',
  keySaved: 'API Key 已保存',
  keyCleared: 'Chat API Key 已清除',
  authSaveFailed: '保存失败：{message}',
  defaults: '默认选项',
  defaultThinking: '默认开启深度思考',
  defaultSearch: '默认开启联网搜索',
  systemPrompt: '系统提示词',
  systemPromptHint: '留空使用官方身份提示。设置后会在每条请求中作为 system 发送。',
  systemPromptPlaceholder: '可选：自定义系统提示词',
  data: '数据',
  storagePath: '历史存储位置',
  dataNote: '历史仅保存在本机。上传的文件由 DeepSeek Files API 托管。',
  about: '关于',
  aboutText: 'DeepSeek Chat 使用 DeepSeek 官方 Messages / Files API，支持深度思考搜索、联网引用与文件解析。',
  modelLabel: '模型',
  modelName: 'DeepSeek V4.1 Flash',
  limitations: '限制',
  limitationsText: '当前版本暂不支持消息分支、编辑提问、Mermaid 与数学公式渲染。',
  close: '关闭',
  loading: '加载中…',
  loadFailed: '加载失败',
  retry: '重试',
  noAuthTitle: '先连接 DeepSeek',
  noAuthBody: 'Chat 需要 DeepSeek 账号登录，或一个 DeepSeek API Key。',
  configureNow: '去配置',
  uploading: '上传中…',
  uploadFailed: '上传失败',
  uploadRetry: '重试上传',
  remove: '移除',
  dropFiles: '松开以上传文件',
  fileTooLarge: '文件超过 {size} MB',
  unsupportedFile: '不支持的文件类型',
  tooManyFiles: '一次最多上传 {count} 个文件',
  waitUpload: '请等待文件上传完成',
  chatEmptyTitle: '开始新的对话',
  chatEmptyBody: '在下方输入问题，或上传文件。',
  stopped: '已停止生成',
  errorAuth: '认证失败，请检查 API Key 或 DSH 账号登录。',
  errorNetwork: '网络连接失败，请检查网络后重试。',
  errorRate: '请求过于频繁，请稍后再试。',
  errorQuota: '账户余额不足。',
  errorServer: 'DeepSeek 服务暂时不可用，请稍后重试。',
  errorGeneric: '生成失败：{message}',
  errorTimeout: '生成超时，请重试。',
  refused: '抱歉，这个问题暂时无法回答。',
  newChatTitle: '新对话',
  messageCount: '{count} 条消息',
  you: '你',
  assistant: 'DeepSeek',
  openAgent: '返回 Agent 模式',
  modeSwitchHint: 'Chat 历史独立保存，不会出现在 Agent 会话列表中。',
  copyFailed: '复制失败',
  searchEmpty: '没有匹配的对话',
  collapseSidebar: '收起侧边栏',
  expandSidebar: '展开侧边栏',
  closeSettings: '关闭设置',
  deleteConfirm: '删除',
  goToChat: '进入 Chat',
  authSetupTitle: '配置 DeepSeek',
  authSetupBody: '可以使用已登录的 DSH DeepSeek 账号，或在 Chat 设置中保存 API Key。',
  thinkingLabel: '思考',
  reasoning: '思考过程',
  usage: '{input} 输入 · {output} 输出 tokens',
  uploadInProgress: '正在上传 {count} 个文件',
  fileCard: '{name}',
  imageCard: '图片',
  allChats: '全部对话',
  settingsSaved: '设置已保存',
  settingsSaveFailed: '设置保存失败：{message}',
  history: '历史',
  openInNewTab: '在新标签页打开',
  processSteps: '步骤 · {count}',
  processing: '正在处理…',
  configure: '配置',
  searchStep: '搜索',
  openStep: '打开网页',
  readStep: '阅读链接',
  findStep: '页内查找',
  resultCount: '结果 · {count}',
  waitStreaming: '请先停止当前回复',
  sendingWait: '正在发送消息…',
  historyLoadFailed: '无法加载对话历史',
  agentModeShort: 'Agent',
  emptyFile: '文件为空',
  // Chat → Agent handoff
  handoff: '交给 Agent',
  handoffTitle: '交给 Agent',
  handoffSubtitle: '把当前对话整理成任务说明，交给 Harness Agent 继续开发。',
  handoffDrafting: '正在整理任务说明…',
  handoffEditorLabel: '任务说明（可编辑）',
  handoffWorkspace: '工作区',
  handoffWorkspaceEmpty: '还没有工作区。请先在 Agent 模式中打开一个项目目录。',
  handoffExtra: '补充要求（可选）',
  handoffExtraPlaceholder: '例如：只改插件，不要动 Harness 核心。',
  handoffRegenerate: '重新生成',
  handoffSend: '创建 Agent 会话',
  handoffSending: '正在创建…',
  handoffSent: '已创建 Agent 会话，正在切换…',
  handoffCopied: '任务说明已复制',
  handoffEmpty: '这个对话还没有可以交接的内容。',
  handoffUnavailable: '当前环境不支持从 Chat 创建 Agent 会话，可以复制任务说明后手动粘贴。',
  handoffLocal: 'AI 整理失败，已使用本地整理的版本。',
  handoffShortcut: '也可以先复制，稍后自行粘贴到 Agent。',
  handoffRestart: 'Chat 的宿主端代码已更新，需要刷新插件或重启 Harness 后才能创建 Agent 会话。',
  handoffNoSession: '无法打开新建的 Agent 会话，请在 Agent 模式中手动选择。',
  copyBrief: '复制',
  // Mode / layout
  chatSettings: 'Chat 设置',
  openSettings: '打开设置',
  thinkingProcess: '思考过程',
  modelNote: '模型由 DeepSeek Chat 服务端固定',
  switchToAgent: '切换到 Agent',
  switchToChat: '切换到 Chat',
}

const DICT_EN = {
  appTitle: 'DeepSeek Chat',
  chatMode: 'Chat',
  openChat: 'Chat',
  agentMode: 'Agent',
  agentModeFull: 'Agent mode',
  modeSwitchLabel: 'Switch between Chat and Agent',
  newChat: 'New chat',
  searchChats: 'Search chats',
  today: 'Today',
  yesterday: 'Yesterday',
  earlier: 'Earlier',
  noChats: 'No conversations yet',
  settings: 'Settings',
  greeting: "Hi, I'm DeepSeek",
  greetingSubtitle: 'Ask me anything. I can think deeply, search the web, and read files you upload.',
  suggestionThinkTitle: 'Deep thinking',
  suggestionThink: 'Explain quantum entanglement with a simple analogy',
  suggestionCodeTitle: 'Write code',
  suggestionCode: 'Implement quicksort in Python and explain it',
  suggestionSearchTitle: 'Web search',
  suggestionSearch: "Summarize today's important AI news",
  suggestionFileTitle: 'File Q&A',
  suggestionFile: 'Upload a PDF and summarize its key points',
  composerPlaceholder: 'Message DeepSeek',
  send: 'Send',
  stop: 'Stop generating',
  attach: 'Upload files',
  deepThink: 'Deep thinking',
  webSearch: 'Web search',
  disclaimer: 'AI-generated content may be inaccurate. Please verify.',
  thinkingActive: 'Thinking…',
  thinkingSearching: 'Searching…',
  thinkingReading: 'Reading pages…',
  thinkingDone: 'Thought for {seconds}s',
  thinkingDoneNoTime: 'Deep thinking',
  searching: 'Searching',
  readingPage: 'Reading page',
  readingLink: 'Reading link',
  searchQueries: 'Search queries',
  searchResults: 'Search results',
  sources: 'Sources',
  sourceCount: 'Sources · {count}',
  viewAll: 'View all',
  showLess: 'Show less',
  openPage: 'Open page',
  findInPage: 'Find “{pattern}” in page',
  noSearchResults: 'No results found',
  searchFailed: 'Search failed',
  readFailed: 'Could not read page',
  copy: 'Copy',
  copied: 'Copied',
  delete: 'Delete',
  rename: 'Rename',
  cancel: 'Cancel',
  confirm: 'Confirm',
  deleteChatTitle: 'Delete conversation',
  deleteChatMessage: 'This cannot be undone. Delete “{title}”?',
  renameChat: 'Rename conversation',
  chatTitlePlaceholder: 'Conversation title',
  settingsTitle: 'Chat settings',
  connection: 'Connection',
  authMode: 'Authentication',
  authAuto: 'Automatic',
  authAccount: 'DSH account',
  authApiKey: 'API key',
  authReady: 'Ready',
  authMissing: 'Not configured',
  authSourceChatKey: 'Chat API key',
  authSourceDshKey: 'DSH API key',
  authSourceAccount: 'DSH DeepSeek account',
  authAccountSignedIn: 'DeepSeek account signed in',
  authAccountSignedOut: 'DeepSeek account not signed in',
  apiKeyLabel: 'DeepSeek API key',
  apiKeyPlaceholder: 'sk-...',
  apiKeyConfigured: 'Saved (not shown)',
  apiKeyHint: 'The key is stored in the DSH credential store and used only on the Host. You can also set DEEPSEEK_API_KEY.',
  save: 'Save',
  saving: 'Saving…',
  clear: 'Clear',
  keySaved: 'API key saved',
  keyCleared: 'Chat API key cleared',
  authSaveFailed: 'Could not save: {message}',
  defaults: 'Defaults',
  defaultThinking: 'Enable deep thinking by default',
  defaultSearch: 'Enable web search by default',
  systemPrompt: 'System prompt',
  systemPromptHint: 'Leave empty to use the official identity prompt. A custom prompt is sent as the system message on every request.',
  systemPromptPlaceholder: 'Optional custom system prompt',
  data: 'Data',
  storagePath: 'History location',
  dataNote: 'History stays on this machine. Uploaded files are hosted by the DeepSeek Files API.',
  about: 'About',
  aboutText: 'DeepSeek Chat uses the official DeepSeek Messages and Files APIs, including deep-thinking search, cited web results, and document parsing.',
  modelLabel: 'Model',
  modelName: 'DeepSeek V4.1 Flash',
  limitations: 'Limitations',
  limitationsText: 'This version does not yet support message branches, editing prompts, Mermaid diagrams, or math rendering.',
  close: 'Close',
  loading: 'Loading…',
  loadFailed: 'Could not load',
  retry: 'Retry',
  noAuthTitle: 'Connect DeepSeek first',
  noAuthBody: 'Chat needs a signed-in DeepSeek account or a DeepSeek API key.',
  configureNow: 'Configure',
  uploading: 'Uploading…',
  uploadFailed: 'Upload failed',
  uploadRetry: 'Retry upload',
  remove: 'Remove',
  dropFiles: 'Drop to upload',
  fileTooLarge: 'File exceeds {size} MB',
  unsupportedFile: 'Unsupported file type',
  tooManyFiles: 'Up to {count} files at a time',
  waitUpload: 'Wait for uploads to finish',
  chatEmptyTitle: 'Start a new conversation',
  chatEmptyBody: 'Type below, or attach a file.',
  stopped: 'Generation stopped',
  errorAuth: 'Authentication failed. Check your API key or DSH account sign-in.',
  errorNetwork: 'Network request failed. Check your connection and try again.',
  errorRate: 'Too many requests. Please try again shortly.',
  errorQuota: 'Insufficient account balance.',
  errorServer: 'DeepSeek is temporarily unavailable. Please try again.',
  errorGeneric: 'Generation failed: {message}',
  errorTimeout: 'Generation timed out. Please try again.',
  refused: 'Sorry, this request could not be answered.',
  newChatTitle: 'New chat',
  messageCount: '{count} messages',
  you: 'You',
  assistant: 'DeepSeek',
  openAgent: 'Back to Agent mode',
  modeSwitchHint: 'Chat history is independent and does not appear in the Agent session list.',
  copyFailed: 'Could not copy',
  searchEmpty: 'No matching conversations',
  collapseSidebar: 'Collapse sidebar',
  expandSidebar: 'Expand sidebar',
  closeSettings: 'Close settings',
  deleteConfirm: 'Delete',
  goToChat: 'Open Chat',
  authSetupTitle: 'Configure DeepSeek',
  authSetupBody: 'Use your signed-in DSH DeepSeek account, or save an API key in Chat settings.',
  thinkingLabel: 'Thinking',
  reasoning: 'Reasoning',
  usage: '{input} input · {output} output tokens',
  uploadInProgress: 'Uploading {count} files',
  fileCard: '{name}',
  imageCard: 'Image',
  allChats: 'All conversations',
  settingsSaved: 'Settings saved',
  settingsSaveFailed: 'Could not save settings: {message}',
  history: 'History',
  openInNewTab: 'Open in a new tab',
  processSteps: 'Steps · {count}',
  processing: 'Working…',
  configure: 'Configure',
  searchStep: 'Search',
  openStep: 'Open page',
  readStep: 'Read link',
  findStep: 'Find in page',
  resultCount: 'Results · {count}',
  waitStreaming: 'Stop the current reply first',
  sendingWait: 'Sending…',
  historyLoadFailed: 'Could not load conversation',
  agentModeShort: 'Agent',
  emptyFile: 'The file is empty',
  handoff: 'Hand off to Agent',
  handoffTitle: 'Hand off to Agent',
  handoffSubtitle: 'Turn this conversation into a task brief and hand it to a Harness Agent.',
  handoffDrafting: 'Drafting the task brief…',
  handoffEditorLabel: 'Task brief (editable)',
  handoffWorkspace: 'Workspace',
  handoffWorkspaceEmpty: 'No workspace yet. Open a project directory in Agent mode first.',
  handoffExtra: 'Extra requirements (optional)',
  handoffExtraPlaceholder: 'e.g. change only the plugin, not the Harness core.',
  handoffRegenerate: 'Regenerate',
  handoffSend: 'Create Agent session',
  handoffSending: 'Creating…',
  handoffSent: 'Agent session created. Switching…',
  handoffCopied: 'Task brief copied',
  handoffEmpty: 'Nothing in this conversation to hand off yet.',
  handoffUnavailable: 'This environment cannot create Agent sessions from Chat. Copy the brief and paste it in Agent mode.',
  handoffLocal: 'The model draft failed, so a local brief was used.',
  handoffShortcut: 'You can also copy it and paste it in Agent mode yourself.',
  handoffRestart: 'The Chat Host half has changed. Refresh the plugin or restart Harness before creating Agent sessions.',
  handoffNoSession: 'The new Agent session could not be opened. Pick it in Agent mode.',
  copyBrief: 'Copy',
  chatSettings: 'Chat settings',
  openSettings: 'Open settings',
  thinkingProcess: 'Reasoning',
  modelNote: 'The model is fixed by the DeepSeek Chat service',
  switchToAgent: 'Switch to Agent',
  switchToChat: 'Switch to Chat',
}

/* ---- 20-store.js ---- */
let appCtx
let tr = key => key

function setClientContext(ctx) {
  appCtx = ctx
  tr = ctx.locale.bind(CHAT_NS)
}

function useT() {
  const [, force] = React.useState(0)
  React.useEffect(() => {
    if (!appCtx) return undefined
    return appCtx.locale.subscribe(() => force(value => value + 1))
  }, [])
  return tr
}

const STORAGE_KEY = 'dsh-deepseek-chat:v1'
const MAX_FILES = 10
const MAX_UPLOAD_MB = 64
const MAX_USER_DATA_MB = 32
const LAYOUT_EXT = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx'])
const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff'])
const ACCEPT_EXT = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff',
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'jsonl', 'yaml', 'yml', 'xml', 'html', 'htm',
  'css', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'go', 'rs', 'rb', 'php',
  'sh', 'bash', 'ps1', 'sql', 'log', 'ini', 'toml', 'conf', 'tex', 'rst', 'epub', 'mobi', 'xls', 'xlsx',
]
const ACCEPT = ACCEPT_EXT.map(ext => `.${ext}`).join(',')
const SUGGESTIONS = [
  { id: 'think', icon: 'spark', titleKey: 'suggestionThinkTitle', textKey: 'suggestionThink', thinking: true },
  { id: 'code', icon: 'code', titleKey: 'suggestionCodeTitle', textKey: 'suggestionCode' },
  { id: 'search', icon: 'globe', titleKey: 'suggestionSearchTitle', textKey: 'suggestionSearch', search: true },
  { id: 'file', icon: 'file', titleKey: 'suggestionFileTitle', textKey: 'suggestionFile', file: true },
]

function readStored() {
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) ?? '{}')
    return value !== null && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

function writeStored(patch) {
  try {
    const current = readStored()
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }))
  } catch {
    // Storage can be unavailable on a file:// page; the mode still works for this session.
  }
}

const stored = readStored()

const chatStore = {
  state: {
    open: stored.open === true,
    boot: 'idle',
    bootError: '',
    bootData: null,
    auth: null,
    settings: { authMode: 'auto', thinking: false, search: false, systemPrompt: '' },
    conversations: [],
    workspaces: [],
    activeId: typeof stored.activeId === 'string' ? stored.activeId : null,
    messages: [],
    conversationLoading: false,
    conversationError: '',
    streaming: null,
    stopping: false,
    draft: '',
    attachments: [],
    toasts: [],
    settingsOpen: false,
    handoff: null,
    confirm: null,
    sidebarOpen: typeof window !== 'undefined' ? window.innerWidth > 900 : true,
    renamingId: null,
    focusRequest: 0,
    filePickRequest: 0,
  },
  listeners: new Set(),
  subscribe(listener) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  },
  emit() {
    for (const listener of [...this.listeners]) {
      try {
        listener()
      } catch (error) {
        console.error('deepseek-chat: store listener failed', error)
      }
    }
  },
  set(patch) {
    this.state = { ...this.state, ...patch }
    this.emit()
  },
  toast(message, kind = 'info') {
    if (!message) return
    const id = uid()
    this.set({ toasts: [...this.state.toasts, { id, message, kind }] })
    setTimeout(() => {
      this.set({ toasts: this.state.toasts.filter(item => item.id !== id) })
    }, kind === 'error' ? 6500 : 3800)
  },
}

function useChat(selector) {
  const [, force] = React.useState(0)
  React.useEffect(() => chatStore.subscribe(() => force(value => value + 1)), [])
  return selector(chatStore.state)
}

function uid() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
  } catch {
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

function endpoint(path) {
  if (typeof document !== 'undefined' && typeof location !== 'undefined'
    && (location.protocol === 'http:' || location.protocol === 'https:')) {
    // Resolve against the document base so a mounted page keeps its prefix.
    return new URL(path.replace(/^\//, ''), document.baseURI).href
  }
  return path
}

async function hostFetch(path, init = {}) {
  const carrier = globalThis.__DSH_TRANSPORT__?.fetch
  if (typeof carrier === 'function') {
    const url = typeof document !== 'undefined'
      ? new URL(path.replace(/^\//, ''), document.baseURI).href
      : path
    return carrier(url, init)
  }
  return fetch(endpoint(path), init)
}

async function hostJson(path, body) {
  const init = body === undefined
    ? { method: 'GET' }
    : {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
  const response = await hostFetch(path, init)
  const text = await response.text()
  let value
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error(text || `HTTP ${response.status}`)
  }
  if (!response.ok) {
    const error = new Error(value?.error?.message || `HTTP ${response.status}`)
    error.payload = value?.error
    error.status = response.status
    throw error
  }
  return value
}

async function streamChat(payload, { signal, onItem }) {
  const response = await hostFetch('/api/deepseek-chat/stream', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
  if (!response.ok) {
    let text = ''
    try {
      text = await response.text()
    } catch {
      text = ''
    }
    let value
    try {
      value = JSON.parse(text)
    } catch {
      value = null
    }
    const error = new Error(value?.error?.message || text || `HTTP ${response.status}`)
    error.payload = value?.error
    error.status = response.status
    throw error
  }
  if (response.body === null) throw new Error('DeepSeek 返回了空响应')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let newline
    while ((newline = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newline).trim()
      buffer = buffer.slice(newline + 1)
      if (line === '') continue
      let item
      try {
        item = JSON.parse(line)
      } catch {
        continue
      }
      onItem(item)
    }
  }
  buffer += decoder.decode()
  const tail = buffer.trim()
  if (tail !== '') {
    try {
      onItem(JSON.parse(tail))
    } catch {
      // A partial final line means the connection ended mid-frame; the Host has
      // already settled the reply, and the next bootstrap reload will reconcile it.
    }
  }
}

function friendlyError(payload, fallback) {
  const code = payload?.code
  if (code === 'AUTH' || code === 'AUTH_REQUIRED' || payload?.status === 401) {
    return { text: tr('errorAuth'), action: 'settings' }
  }
  if (code === 'NETWORK') return { text: tr('errorNetwork') }
  if (code === 'RATE_LIMIT' || payload?.status === 429) return { text: tr('errorRate') }
  if (code === 'QUOTA' || payload?.status === 402) return { text: tr('errorQuota') }
  if (code === 'TIMEOUT') return { text: tr('errorTimeout') }
  if (code === 'CONTENT_REFUSED') return { text: tr('refused') }
  if (typeof payload?.status === 'number' && payload.status >= 500) return { text: tr('errorServer') }
  const message = typeof payload?.message === 'string' && payload.message !== ''
    ? payload.message
    : typeof fallback === 'string' ? fallback : 'Unknown error'
  return { text: tr('errorGeneric', { message }) }
}

function conversationSummary(conversation) {
  return {
    id: conversation.id,
    title: conversation.title,
    titleAuto: conversation.titleAuto === true,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messageCount: Array.isArray(conversation.messages) ? conversation.messages.length : (conversation.messageCount ?? 0),
  }
}

function sortConversations(list) {
  return [...list].sort((left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0))
}

function upsertSummary(summary) {
  if (!summary || typeof summary.id !== 'string') return
  const exists = chatStore.state.conversations.some(item => item.id === summary.id)
  const next = exists
    ? chatStore.state.conversations.map(item => (item.id === summary.id ? { ...item, ...summary } : item))
    : [summary, ...chatStore.state.conversations]
  chatStore.set({ conversations: sortConversations(next) })
}

function replaceAssistant(reply) {
  chatStore.set({
    messages: chatStore.state.messages.map(message => (message.id === reply.id ? reply : message)),
  })
}

function patchUserMessage(id, patch) {
  chatStore.set({
    messages: chatStore.state.messages.map(message => (message.id === id ? { ...message, ...patch } : message)),
  })
}

let bootPromise = null
let sendInFlight = false
let handoffSequence = 0

async function ensureBoot(force = false) {
  if (!force && (chatStore.state.boot === 'ready' || chatStore.state.boot === 'loading')) {
    return bootPromise ?? Promise.resolve()
  }
  if (bootPromise !== null && !force) return bootPromise
  chatStore.set({ boot: 'loading', bootError: '' })
  bootPromise = (async () => {
    try {
      const data = await hostJson('/api/deepseek-chat/bootstrap')
      chatStore.set({
        boot: 'ready',
        bootData: data,
        auth: data.auth,
        settings: data.settings,
        conversations: data.conversations ?? [],
        workspaces: Array.isArray(data.workspaces) ? data.workspaces : [],
      })
      const active = chatStore.state.activeId
      const exists = active !== null && (data.conversations ?? []).some(item => item.id === active)
      if (active !== null && exists) {
        await loadConversation(active, { quiet: true })
      } else if (active !== null) {
        chatStore.set({ activeId: null, messages: [] })
        writeStored({ activeId: null })
      }
      return data
    } catch (error) {
      chatStore.set({ boot: 'error', bootError: error instanceof Error ? error.message : String(error) })
      return null
    } finally {
      bootPromise = null
    }
  })()
  return bootPromise
}

let conversationLoadSequence = 0

async function loadConversation(id, { quiet = false } = {}) {
  if (chatStore.state.streaming !== null) {
    if (chatStore.state.streaming.conversationId !== id) {
      chatStore.toast(tr('waitStreaming'), 'warning')
      return
    }
    return
  }
  if (sendInFlight) {
    chatStore.toast(tr('sendingWait'), 'warning')
    return
  }
  clearComposer()
  const sequence = ++conversationLoadSequence
  chatStore.set({ activeId: id, conversationLoading: true, conversationError: '' })
  writeStored({ activeId: id })
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', { action: 'get', id })
    if (sequence !== conversationLoadSequence) return
    chatStore.set({
      messages: Array.isArray(data.conversation?.messages) ? data.conversation.messages : [],
      conversationLoading: false,
      conversationError: '',
    })
  } catch (error) {
    if (sequence !== conversationLoadSequence) return
    const message = error instanceof Error ? error.message : String(error)
    chatStore.set({ conversationLoading: false, messages: [], conversationError: message })
    if (!quiet) chatStore.toast(message, 'error')
  }
}

function openChat() {
  chatStore.set({ open: true, focusRequest: chatStore.state.focusRequest + 1 })
  writeStored({ open: true })
  void ensureBoot()
}

function closeChat() {
  handoffSequence += 1
  chatStore.set({ open: false, settingsOpen: false, confirm: null, handoff: null })
  writeStored({ open: false })
}

function requestFocus() {
  chatStore.set({ focusRequest: chatStore.state.focusRequest + 1 })
}

function requestFilePicker() {
  chatStore.set({ filePickRequest: chatStore.state.filePickRequest + 1 })
}

async function newChat() {
  if (chatStore.state.streaming !== null) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  if (sendInFlight) {
    chatStore.toast(tr('sendingWait'), 'warning')
    return
  }
  clearComposer()
  chatStore.set({
    activeId: null,
    messages: [],
    conversationError: '',
    renamingId: null,
    focusRequest: chatStore.state.focusRequest + 1,
  })
  writeStored({ activeId: null })
}

async function createConversation() {
  const data = await hostJson('/api/deepseek-chat/conversation', { action: 'create' })
  const summary = conversationSummary(data.conversation)
  chatStore.set({
    activeId: data.conversation.id,
    conversations: sortConversations([summary, ...chatStore.state.conversations]),
    messages: [],
    conversationError: '',
  })
  writeStored({ activeId: data.conversation.id })
  return data.conversation.id
}

async function renameConversation(id, title) {
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', { action: 'rename', id, title })
    upsertSummary(conversationSummary(data.conversation))
    chatStore.set({ renamingId: null })
  } catch (error) {
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

function requestDeleteConversation(id, title) {
  const name = title || tr('newChatTitle')
  chatStore.set({
    confirm: {
      title: tr('deleteChatTitle'),
      message: tr('deleteChatMessage', { title: name }),
      confirmLabel: tr('deleteConfirm'),
      danger: true,
      onConfirm: async () => {
        if (chatStore.state.streaming?.conversationId === id) stopStreaming()
        try {
          const data = await hostJson('/api/deepseek-chat/conversation', { action: 'delete', id })
          chatStore.set({
            conversations: sortConversations(data.summaries ?? chatStore.state.conversations.filter(item => item.id !== id)),
          })
          if (chatStore.state.activeId === id) {
            clearComposer()
            chatStore.set({ activeId: null, messages: [], conversationError: '' })
            writeStored({ activeId: null })
          }
        } catch (error) {
          chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
        }
      },
    },
  })
}

let settingsSequence = 0
let settingsChain = Promise.resolve()

async function saveSettings(patch, { quiet = true } = {}) {
  const sequence = ++settingsSequence
  const previous = chatStore.state.settings
  chatStore.set({ settings: { ...previous, ...patch } })
  const request = settingsChain.then(() => hostJson('/api/deepseek-chat/settings', patch))
  settingsChain = request.catch(() => {})
  try {
    const data = await request
    if (sequence === settingsSequence) {
      chatStore.set({ settings: data.settings, auth: data.auth })
      if (!quiet) chatStore.toast(tr('settingsSaved'), 'success')
    } else {
      chatStore.set({ auth: data.auth })
    }
    return true
  } catch (error) {
    if (sequence === settingsSequence) chatStore.set({ settings: previous })
    chatStore.toast(tr('settingsSaveFailed', { message: error instanceof Error ? error.message : String(error) }), 'error')
    return false
  }
}

function toggleThinking() {
  const next = !chatStore.state.settings.thinking
  chatStore.set({ settings: { ...chatStore.state.settings, thinking: next } })
  void saveSettings({ thinking: next })
}

function toggleSearch() {
  const next = !chatStore.state.settings.search
  chatStore.set({ settings: { ...chatStore.state.settings, search: next } })
  void saveSettings({ search: next })
}

async function saveKey(key) {
  const data = await hostJson('/api/deepseek-chat/key', { key })
  chatStore.set({ auth: data.auth })
  chatStore.toast(tr('keySaved'), 'success')
}

async function clearKey() {
  const data = await hostJson('/api/deepseek-chat/key', { clear: true })
  chatStore.set({ auth: data.auth })
  chatStore.toast(tr('keyCleared'), 'success')
}

function fileExtension(name) {
  const dot = typeof name === 'string' ? name.lastIndexOf('.') : -1
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
}

function isImageName(name, mimeType) {
  return (typeof mimeType === 'string' && mimeType.startsWith('image/')) || IMAGE_EXT.has(fileExtension(name))
}

function formatSize(bytes) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`
}

function formatTime(timestamp) {
  try {
    return new Intl.DateTimeFormat(appCtx?.locale.getSnapshot().active === 'zh' ? 'zh-CN' : 'en-US', {
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(timestamp))
  } catch {
    return ''
  }
}

function attachmentFileLimit(name) {
  return LAYOUT_EXT.has(fileExtension(name)) || isImageName(name, '') ? MAX_UPLOAD_MB : MAX_USER_DATA_MB
}

let uploadActive = 0
const uploadQueue = []

function pumpUploads() {
  while (uploadActive < 3 && uploadQueue.length > 0) {
    const task = uploadQueue.shift()
    uploadActive += 1
    task().finally(() => {
      uploadActive -= 1
      pumpUploads()
    })
  }
}

function updateAttachment(id, patch) {
  chatStore.set({
    attachments: chatStore.state.attachments.map(item => (item.id === id ? { ...item, ...patch } : item)),
  })
}

async function uploadAttachment(attachment, file, signal) {
  updateAttachment(attachment.id, { status: 'uploading', error: '' })
  try {
    const response = await hostFetch('/api/deepseek-chat/upload', {
      method: 'POST',
      headers: {
        'content-type': 'application/octet-stream',
        'x-file-name': encodeURIComponent(attachment.name),
        'x-file-mime': attachment.mimeType,
      },
      body: file,
      signal,
    })
    const text = await response.text()
    let value
    try {
      value = JSON.parse(text)
    } catch {
      throw new Error(text || `HTTP ${response.status}`)
    }
    if (!response.ok) {
      const error = new Error(value?.error?.message || `HTTP ${response.status}`)
      error.payload = value?.error
      throw error
    }
    updateAttachment(attachment.id, {
      status: 'ready',
      fileId: value.file.fileId,
      name: value.file.name,
      size: value.file.bytes,
      mimeType: value.file.mimeType,
      isImage: value.file.isImage === true,
      purpose: value.file.purpose,
      error: '',
    })
  } catch (error) {
    const code = error?.payload?.code
    updateAttachment(attachment.id, {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    })
    if (code === 'AUTH_REQUIRED' || code === 'AUTH') {
      chatStore.set({ settingsOpen: true })
      chatStore.toast(tr('noAuthBody'), 'warning')
    }
  }
}

function addFiles(fileList) {
  const files = [...fileList]
  const existing = chatStore.state.attachments.length
  if (existing + files.length > MAX_FILES) {
    chatStore.toast(tr('tooManyFiles', { count: MAX_FILES }), 'warning')
    return
  }
  const accepted = []
  for (const file of files) {
    if (file.size === 0) {
      chatStore.toast(tr('emptyFile'), 'warning')
      continue
    }
    if (!ACCEPT_EXT.includes(fileExtension(file.name))) {
      chatStore.toast(tr('unsupportedFile'), 'warning')
      continue
    }
    const limit = attachmentFileLimit(file.name)
    if (file.size > limit * 1024 * 1024) {
      chatStore.toast(tr('fileTooLarge', { size: limit }), 'warning')
      continue
    }
    const image = isImageName(file.name, file.type)
    let previewUrl = ''
    if (image && typeof URL.createObjectURL === 'function') {
      try {
        previewUrl = URL.createObjectURL(file)
      } catch {
        previewUrl = ''
      }
    }
    const attachment = {
      id: uid(),
      name: file.name || 'file',
      size: file.size,
      mimeType: file.type || '',
      isImage: image,
      status: 'uploading',
      fileId: '',
      error: '',
      previewUrl,
      file,
      controller: new AbortController(),
    }
    accepted.push(attachment)
  }
  if (accepted.length === 0) return
  chatStore.set({ attachments: [...chatStore.state.attachments, ...accepted] })
  for (const attachment of accepted) {
    const file = attachment.file
    uploadQueue.push(() => uploadAttachment(attachment, file, attachment.controller.signal))
  }
  pumpUploads()
}

function retryAttachment(id) {
  const attachment = chatStore.state.attachments.find(item => item.id === id)
  if (!attachment?.file) return
  if (attachment.controller?.signal.aborted) attachment.controller = new AbortController()
  uploadQueue.push(() => uploadAttachment(attachment, attachment.file, attachment.controller.signal))
  pumpUploads()
}

function removeAttachment(id) {
  const attachment = chatStore.state.attachments.find(item => item.id === id)
  attachment?.controller?.abort()
  if (attachment?.previewUrl && typeof URL.revokeObjectURL === 'function') {
    try {
      URL.revokeObjectURL(attachment.previewUrl)
    } catch {
      // The URL may already be released.
    }
  }
  chatStore.set({ attachments: chatStore.state.attachments.filter(item => item.id !== id) })
}

/** Drop the active draft and abort uploads when the conversation changes. */
function clearComposer() {
  for (const attachment of chatStore.state.attachments) {
    attachment.controller?.abort()
    if (attachment.previewUrl && typeof URL.revokeObjectURL === 'function') {
      try {
        URL.revokeObjectURL(attachment.previewUrl)
      } catch {
        // The URL may already be released.
      }
    }
  }
  chatStore.set({ draft: '', attachments: [] })
}

let pendingFrame = 0

function applyClientEvent(reply, event, indexes) {
  const next = reply.status === 'streaming' ? reply : { ...reply, status: 'streaming' }
  if (event === null || typeof event !== 'object') return next
  if (event.type === 'message_start') {
    return {
      ...next,
      usage: event.message?.usage ?? next.usage,
      model: typeof event.message?.model === 'string' ? event.message.model : next.model,
    }
  }
  if (event.type === 'content_block_start') {
    indexes.delete(event.index)
    const block = event.content_block
    let stored = null
    if (block?.type === 'text') stored = { type: 'text', text: block.text ?? '', citations: [] }
    else if (block?.type === 'thinking') stored = { type: 'thinking', thinking: block.thinking ?? '', signature: '', startedAt: Date.now() }
    else if (block?.type === 'server_tool_use') stored = { type: 'server_tool_use', id: block.id, name: block.name, input: block.input ?? {}, kind: block.kind ?? 'search' }
    else if (block?.type === 'web_search_tool_result') {
      stored = {
        type: 'web_search_tool_result', tool_use_id: block.tool_use_id, kind: block.kind ?? 'search',
        content: Array.isArray(block.content) ? block.content.map(item => ({
          type: item?.type, title: item?.title, url: item?.url, snippet: item?.snippet,
          site_name: item?.site_name ?? null, site_icon: item?.site_icon ?? null, page_age: item?.page_age ?? null,
          error_code: item?.error_code,
        })) : [],
      }
    } else if (block?.type === 'web_fetch_tool_result') {
      stored = {
        type: 'web_fetch_tool_result', tool_use_id: block.tool_use_id, kind: block.kind ?? 'deep_search',
        content: block.content, signature: block.signature,
      }
    }
    if (stored === null) return next
    indexes.set(event.index, next.blocks.length)
    return { ...next, blocks: [...next.blocks, stored] }
  }
  if (event.type === 'content_block_delta') {
    const index = indexes.get(event.index)
    if (index === undefined) return next
    const block = next.blocks[index]
    const delta = event.delta
    if (!block || !delta) return next
    const blocks = next.blocks.slice()
    if (block.type === 'text' && delta.type === 'text_delta') blocks[index] = { ...block, text: block.text + delta.text }
    else if (block.type === 'thinking' && delta.type === 'thinking_delta') blocks[index] = { ...block, thinking: block.thinking + delta.thinking }
    else if (block.type === 'thinking' && delta.type === 'signature_delta') blocks[index] = { ...block, signature: block.signature + delta.signature }
    else if (block.type === 'text' && delta.type === 'citations_delta' && delta.citation) {
      const citation = {
        type: delta.citation.type, url: delta.citation.url, title: delta.citation.title,
        cited_text: delta.citation.cited_text, encrypted_index: delta.citation.encrypted_index,
      }
      if (!block.citations.some(item => item.url === citation.url)) {
        blocks[index] = { ...block, citations: [...block.citations, citation] }
      }
    }
    return { ...next, blocks }
  }
  if (event.type === 'content_block_stop') {
    const index = indexes.get(event.index)
    if (index === undefined) return next
    indexes.delete(event.index)
    const block = next.blocks[index]
    if (block?.type === 'thinking' && block.endedAt === undefined) {
      const blocks = next.blocks.slice()
      blocks[index] = { ...block, endedAt: Date.now() }
      return { ...next, blocks }
    }
    return next
  }
  if (event.type === 'message_delta') {
    return {
      ...next,
      stopReason: event.delta?.stop_reason ?? next.stopReason,
      stopDetails: event.delta?.stop_details ?? next.stopDetails,
      usage: event.usage ?? next.usage,
      title: typeof event.delta?.title === 'string' ? event.delta.title.trim() : next.title,
    }
  }
  return next
}

async function sendMessage() {
  const state = chatStore.state
  if (state.streaming !== null) return
  if (state.boot !== 'ready') {
    void ensureBoot()
    return
  }
  if (!state.auth?.ready) {
    chatStore.set({ settingsOpen: true })
    chatStore.toast(tr('noAuthBody'), 'warning')
    return
  }
  const uploading = state.attachments.some(item => item.status === 'uploading')
  if (uploading) {
    chatStore.toast(tr('waitUpload'), 'warning')
    return
  }
  const failed = state.attachments.find(item => item.status === 'error')
  if (failed) {
    chatStore.toast(tr('uploadFailed'), 'warning')
    return
  }
  const text = state.draft.trim()
  const readyFiles = state.attachments.filter(item => item.status === 'ready' && item.fileId)
  const sentAttachments = state.attachments.filter(item => item.status === 'ready' && item.fileId)
  if (text === '' && readyFiles.length === 0) return
  if (sendInFlight) return
  sendInFlight = true

  let conversationId = state.activeId
  try {
    if (conversationId === null) conversationId = await createConversation()
  } catch (error) {
    sendInFlight = false
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
    return
  }
  if (chatStore.state.streaming !== null) {
    sendInFlight = false
    return
  }

  const now = Date.now()
  const userMessage = {
    id: uid(),
    role: 'user',
    content: text,
    files: readyFiles.map(item => ({
      id: item.id,
      fileId: item.fileId,
      name: item.name,
      size: item.size,
      mimeType: item.mimeType,
      isImage: item.isImage,
      previewUrl: item.previewUrl || '',
    })),
    createdAt: now,
  }
  const reply = {
    id: uid(),
    role: 'assistant',
    createdAt: now,
    updatedAt: now,
    model: chatStore.state.bootData?.model?.id ?? 'deepseek-flash',
    thinking: state.settings.thinking,
    search: state.settings.search,
    status: 'streaming',
    blocks: [],
    prefix: true,
  }
  const controller = new AbortController()
  const messages = [...chatStore.state.messages, userMessage, reply]
  chatStore.set({
    messages,
    conversationError: '',
    draft: '',
    attachments: [],
    stopping: false,
    streaming: {
      conversationId,
      assistantId: reply.id,
      userId: userMessage.id,
      controller,
      startedAt: now,
    },
    focusRequest: chatStore.state.focusRequest + 1,
  })
  writeStored({ activeId: conversationId })

  let current = reply
  let userCurrent = userMessage
  let started = false
  const indexes = new Map()
  let frame = 0
  const flush = () => {
    frame = 0
    replaceAssistant(current)
  }
  const schedule = () => {
    if (frame !== 0) return
    frame = requestAnimationFrame(flush)
  }
  const finish = () => {
    if (frame !== 0) {
      cancelAnimationFrame(frame)
      frame = 0
    }
    if (chatStore.state.streaming?.assistantId === current.id || chatStore.state.streaming?.userId === userCurrent.id) {
      chatStore.set({ streaming: null, stopping: false })
    }
  }
  try {
    await streamChat({
      conversationId,
      text,
      files: userMessage.files,
      thinking: reply.thinking,
      search: reply.search,
      locale: appCtx?.locale.getSnapshot().active === 'zh' ? 'zh' : 'en',
    }, {
      signal: controller.signal,
      onItem(item) {
        if (item.type === 'start') {
          started = true
          const hostUser = item.userMessage
          const hostAssistantId = item.assistantMessageId
          const previews = userCurrent.files.map(file => file.previewUrl || '')
          const hostFiles = Array.isArray(hostUser.files)
            ? hostUser.files.map((file, index) => ({ ...file, previewUrl: previews[index] || '' }))
            : []
          userCurrent = { ...hostUser, files: hostFiles }
          current = { ...current, id: hostAssistantId }
          if (typeof item.title === 'string' && item.title !== '') {
            const summary = chatStore.state.conversations.find(entry => entry.id === conversationId)
            if (summary) upsertSummary({ ...summary, title: item.title })
          }
          chatStore.set({
            messages: chatStore.state.messages.map(message => {
              if (message.id === userMessage.id) {
                return { ...message, id: hostUser.id, createdAt: hostUser.createdAt, files: hostFiles }
              }
              if (message.id === reply.id) return { ...message, id: hostAssistantId }
              return message
            }),
            streaming: chatStore.state.streaming === null
              ? null
              : { ...chatStore.state.streaming, assistantId: hostAssistantId, userId: hostUser.id },
          })
          return
        }
        if (item.type === 'event') {
          current = applyClientEvent(current, item.event, indexes)
          schedule()
          return
        }
        if (item.type === 'title') {
          if (typeof item.title === 'string' && item.title !== '') {
            const conversation = chatStore.state.conversations.find(entry => entry.id === conversationId)
            if (conversation) upsertSummary({ ...conversation, title: item.title, titleAuto: false })
          }
          return
        }
        if (item.type === 'done') {
          if (item.message) current = { ...item.message }
          replaceAssistant(current)
          if (item.conversation) upsertSummary(item.conversation)
          finish()
          return
        }
        if (item.type === 'error') {
          const info = friendlyError(item.error)
          current = {
            ...current,
            status: 'error',
            error: item.error ?? { message: info.text },
            updatedAt: Date.now(),
          }
          replaceAssistant(current)
          finish()
          chatStore.toast(info.text, 'error')
          if (info.action === 'settings') chatStore.set({ settingsOpen: true })
          return
        }
        if (item.type === 'aborted') {
          if (item.message) current = { ...item.message }
          else current = { ...current, status: 'stopped', updatedAt: Date.now() }
          replaceAssistant(current)
          finish()
        }
      },
    })
    if (chatStore.state.streaming !== null) {
      current = { ...current, status: 'stopped', updatedAt: Date.now() }
      replaceAssistant(current)
      finish()
    }
  } catch (error) {
    if (controller.signal.aborted) {
      if (!started) {
        chatStore.set({
          messages: chatStore.state.messages.filter(message => message.id !== userMessage.id && message.id !== reply.id),
          draft: text,
          attachments: sentAttachments,
          streaming: null,
          stopping: false,
        })
        return
      }
      current = { ...current, status: 'stopped', updatedAt: Date.now() }
      replaceAssistant(current)
    } else {
      const payload = error?.payload ?? { message: error instanceof Error ? error.message : String(error) }
      const info = friendlyError(payload, payload.message)
      if (!started) {
        // The Host never created the turn (auth, network, or a rejected
        // request), so pull the optimistic bubbles back and return the text and
        // uploaded files to the composer instead of losing them on reload.
        chatStore.set({
          messages: chatStore.state.messages.filter(message => message.id !== userMessage.id && message.id !== reply.id),
          draft: text,
          attachments: sentAttachments,
          streaming: null,
          stopping: false,
        })
        chatStore.toast(info.text, 'error')
        if (info.action === 'settings') chatStore.set({ settingsOpen: true })
        return
      }
      current = { ...current, status: 'error', error: payload, updatedAt: Date.now() }
      replaceAssistant(current)
      chatStore.toast(info.text, 'error')
      if (info.action === 'settings') chatStore.set({ settingsOpen: true })
    }
    finish()
  } finally {
    sendInFlight = false
  }
}

function stopStreaming() {
  const streaming = chatStore.state.streaming
  if (streaming === null) return
  chatStore.set({ stopping: true })
  try {
    streaming.controller.abort()
  } catch {
    // Already aborted.
  }
}

function requestStop() {
  stopStreaming()
}

/** The shared Chat | Agent navigation: one mode slot, two views. */
function setMode(mode) {
  if (mode === 'chat') {
    if (chatStore.state.open) {
      requestFocus()
      return
    }
    openChat()
    return
  }
  if (chatStore.state.open) closeChat()
}

function defaultWorkspaceId() {
  const workspaces = chatStore.state.workspaces
  if (typeof stored.workspaceId === 'string' && workspaces.some(item => item.id === stored.workspaceId)) {
    return stored.workspaceId
  }
  return workspaces[0]?.id ?? ''
}

function handoffPatch(patch) {
  const current = chatStore.state.handoff
  if (current === null) return
  chatStore.set({ handoff: { ...current, ...patch } })
}

async function openHandoff() {
  if (chatStore.state.handoff !== null) return
  if (chatStore.state.messages.length === 0 || chatStore.state.activeId === null) {
    chatStore.toast(tr('handoffEmpty'), 'warning')
    return
  }
  if (chatStore.state.streaming !== null) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  chatStore.set({
    handoff: {
      generating: true,
      brief: '',
      generated: false,
      warning: '',
      instruction: '',
      workspaceId: defaultWorkspaceId(),
      busy: false,
      error: '',
    },
  })
  await draftHandoff()
}

function closeHandoff() {
  handoffSequence += 1
  chatStore.set({ handoff: null })
}

async function draftHandoff() {
  const handoff = chatStore.state.handoff
  if (handoff === null || chatStore.state.activeId === null) return
  const sequence = ++handoffSequence
  handoffPatch({ generating: true, error: '' })
  try {
    const data = await hostJson('/api/deepseek-chat/handoff', {
      conversationId: chatStore.state.activeId,
      locale: appCtx?.locale.getSnapshot().active === 'zh' ? 'zh' : 'en',
      instruction: handoff.instruction ?? '',
    })
    if (sequence !== handoffSequence) return
    handoffPatch({
      generating: false,
      brief: typeof data.brief === 'string' ? data.brief : '',
      generated: data.generated === true,
      warning: typeof data.warning === 'string' ? data.warning : '',
      error: '',
    })
  } catch (error) {
    if (sequence !== handoffSequence) return
    const status = error?.status
    handoffPatch({
      generating: false,
      error: status === 404 || status === 501
        ? tr('handoffRestart')
        : error instanceof Error ? error.message : String(error),
    })
  }
}

function setHandoffBrief(brief) {
  handoffPatch({ brief })
}

function setHandoffInstruction(instruction) {
  handoffPatch({ instruction })
}

function setHandoffWorkspace(workspaceId) {
  handoffPatch({ workspaceId })
  writeStored({ workspaceId })
}

/** Open the created Session through the native workspace navigation. */
function openAgentSession(sessionId) {
  try {
    appCtx?.get?.('uiWorkspace')?.openSession?.(sessionId)
    appCtx?.get?.('layout')?.selectPanel?.(null)
    return true
  } catch (error) {
    console.error('deepseek-chat: could not open the Agent session', error)
    return false
  }
}

async function submitHandoff() {
  const handoff = chatStore.state.handoff
  if (handoff === null || handoff.busy) return
  const brief = typeof handoff.brief === 'string' ? handoff.brief.trim() : ''
  if (brief === '') {
    handoffPatch({ error: tr('handoffEmpty') })
    return
  }
  handoffPatch({ busy: true, error: '' })
  let sessionId = ''
  try {
    const data = await hostJson('/api/deepseek-chat/handoff/send', {
      prompt: brief,
      ...(handoff.workspaceId === '' ? {} : { workspaceId: handoff.workspaceId }),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    sessionId = typeof data.sessionId === 'string' ? data.sessionId : ''
  } catch (error) {
    handoffPatch({
      busy: false,
      error: error?.status === 404 || error?.status === 501
        ? tr('handoffRestart')
        : error instanceof Error ? error.message : String(error),
    })
    return
  }
  chatStore.set({ handoff: null })
  closeChat()
  if (sessionId === '' || !openAgentSession(sessionId)) {
    chatStore.toast(tr('handoffNoSession'), 'warning')
    return
  }
  chatStore.toast(tr('handoffSent'), 'success')
}

const chatActions = {
  openChat,
  closeChat,
  setMode,
  ensureBoot,
  newChat,
  loadConversation,
  renameConversation,
  requestDeleteConversation,
  saveSettings,
  toggleThinking,
  toggleSearch,
  saveKey,
  clearKey,
  addFiles,
  retryAttachment,
  removeAttachment,
  sendMessage,
  stopStreaming,
  requestFocus,
  requestFilePicker,
  requestStop,
  openHandoff,
  closeHandoff,
  draftHandoff,
  setHandoffBrief,
  setHandoffInstruction,
  setHandoffWorkspace,
  submitHandoff,
}

/* ---- 30-markdown.js ---- */
const INLINE_PATTERN = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|\[[^\]\n]+\]\([^)\s]+\)|https?:\/\/[^\s<>()]+)/g

function safeHref(value) {
  const url = typeof value === 'string' ? value.trim() : ''
  if (url === '') return null
  try {
    const parsed = new URL(url, 'https://example.invalid')
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return url
  } catch {
    return null
  }
}

function renderInline(text, keyPrefix = 'i') {
  const source = typeof text === 'string' ? text : String(text ?? '')
  const nodes = []
  let last = 0
  let match
  // Each recursive call owns its matcher: a shared global regex would have its
  // lastIndex reset by the nested call and re-match the same token forever.
  const pattern = new RegExp(INLINE_PATTERN.source, 'g')
  while ((match = pattern.exec(source)) !== null) {
    if (match.index > last) nodes.push(source.slice(last, match.index))
    const token = match[0]
    const key = `${keyPrefix}-${match.index}`
    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(h('code', { className: 'dsc-inline-code', key }, token.slice(1, -1)))
    } else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      nodes.push(h('strong', { key }, renderInline(token.slice(2, -2), key)))
    } else if ((token.startsWith('*') && token.endsWith('*') && token.length > 2) || (token.startsWith('_') && token.endsWith('_') && token.length > 2)) {
      nodes.push(h('em', { key }, renderInline(token.slice(1, -1), key)))
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      nodes.push(h('del', { key }, renderInline(token.slice(2, -2), key)))
    } else if (token.startsWith('[')) {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      const href = link ? safeHref(link[2]) : null
      if (link && href !== null) {
        nodes.push(h('a', {
          key, href, target: '_blank', rel: 'noreferrer noopener', className: 'dsc-link',
        }, renderInline(link[1], key)))
      } else {
        nodes.push(token)
      }
    } else {
      const bare = token.match(/^(https?:\/\/[^\s]+?)([.,;:!?)]*)$/)
      const url = bare ? bare[1] : token
      const tail = bare ? bare[2] : ''
      const href = safeHref(url)
      if (href !== null) {
        nodes.push(h('a', {
          key, href, target: '_blank', rel: 'noreferrer noopener', className: 'dsc-link',
        }, url))
        if (tail) nodes.push(tail)
      } else {
        nodes.push(token)
      }
    }
    last = match.index + token.length
  }
  if (last < source.length) nodes.push(source.slice(last))
  return nodes
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line)
}

function splitTableRow(line) {
  let value = line.trim()
  if (value.startsWith('|')) value = value.slice(1)
  if (value.endsWith('|')) value = value.slice(0, -1)
  return value.split('|').map(cell => cell.trim())
}

function isBlockStart(line) {
  return /^\s*(```|~~~)/.test(line)
    || /^\s{0,3}#{1,6}\s+/.test(line)
    || /^\s{0,3}>/.test(line)
    || /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)
    || /^\s*([-*+]|\d+[.)])\s+/.test(line)
    || /^\s*\|.*\|\s*$/.test(line)
}

function parseMarkdown(source) {
  const lines = String(source ?? '').replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    if (/^\s*$/.test(line)) {
      index += 1
      continue
    }
    const fence = line.match(/^\s*(```+|~~~+)\s*([^\s`]*)/)
    if (fence !== null) {
      const marker = fence[1]
      const lang = fence[2] ?? ''
      index += 1
      const body = []
      while (index < lines.length && !new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`).test(lines[index])) {
        body.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1
      blocks.push({ type: 'code', lang, text: body.join('\n') })
      continue
    }
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/)
    if (heading !== null) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] })
      index += 1
      continue
    }
    if (/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ type: 'hr' })
      index += 1
      continue
    }
    if (/^\s{0,3}>/.test(line)) {
      const body = []
      while (index < lines.length && /^\s{0,3}>/.test(lines[index])) {
        body.push(lines[index].replace(/^\s{0,3}>\s?/, ''))
        index += 1
      }
      blocks.push({ type: 'quote', text: body.join('\n') })
      continue
    }
    const listItem = line.match(/^\s*([-*+]|\d+[.)])\s+(.*)$/)
    if (listItem !== null) {
      const ordered = /^\d/.test(listItem[1])
      const items = []
      while (index < lines.length) {
        const current = lines[index].match(/^\s*([-*+]|\d+[.)])\s+(.*)$/)
        if (current === null || /^\d/.test(current[1]) !== ordered) break
        items.push(current[2])
        index += 1
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }
    if (line.includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const header = splitTableRow(line)
      index += 2
      const rows = []
      while (index < lines.length && lines[index].includes('|') && lines[index].trim() !== '') {
        rows.push(splitTableRow(lines[index]))
        index += 1
      }
      blocks.push({ type: 'table', header, rows })
      continue
    }
    const paragraph = [line]
    index += 1
    while (index < lines.length && lines[index].trim() !== '' && !isBlockStart(lines[index])) {
      paragraph.push(lines[index])
      index += 1
    }
    blocks.push({ type: 'paragraph', text: paragraph.join('\n') })
  }
  return blocks
}

function copyText(text) {
  if (globalThis.navigator?.clipboard?.writeText) {
    return globalThis.navigator.clipboard.writeText(text)
  }
  return Promise.reject(new Error('clipboard unavailable'))
}

function CodeBlock({ lang, text }) {
  const [copied, setCopied] = React.useState(false)
  return h('div', { className: 'dsc-code' },
    h('div', { className: 'dsc-code-head' },
      h('span', { className: 'dsc-code-lang' }, lang || 'text'),
      h('button', {
        type: 'button',
        className: 'dsc-code-copy',
        onClick: () => {
          copyText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          }).catch(() => {})
        },
      }, h(Icon, { name: copied ? 'check' : 'copy', size: 14 }), h('span', null, copied ? tr('copied') : tr('copy'))),
    ),
    h('pre', { className: 'dsc-pre' }, h('code', null, text)),
  )
}

function renderBlock(block, index) {
  const key = `b-${index}`
  if (block.type === 'paragraph') {
    return h('p', { className: 'dsc-paragraph', key }, renderInline(block.text, key))
  }
  if (block.type === 'heading') {
    const tag = `h${Math.min(6, Math.max(1, block.level))}`
    return h(tag, { className: 'dsc-heading', key }, renderInline(block.text, key))
  }
  if (block.type === 'code') {
    return h(CodeBlock, { key, lang: block.lang, text: block.text })
  }
  if (block.type === 'quote') {
    return h('blockquote', { className: 'dsc-quote', key }, renderInline(block.text, key))
  }
  if (block.type === 'hr') {
    return h('hr', { className: 'dsc-hr', key })
  }
  if (block.type === 'list') {
    const tag = block.ordered ? 'ol' : 'ul'
    return h(tag, { className: 'dsc-list', key }, block.items.map((item, itemIndex) => (
      h('li', { key: `${key}-${itemIndex}` }, renderInline(item, `${key}-${itemIndex}`))
    )))
  }
  if (block.type === 'table') {
    return h('div', { className: 'dsc-table-wrap', key }, h('table', { className: 'dsc-table' },
      h('thead', null, h('tr', null, block.header.map((cell, cellIndex) => h('th', { key: cellIndex }, renderInline(cell, `${key}-h-${cellIndex}`))))),
      h('tbody', null, block.rows.map((row, rowIndex) => h('tr', { key: rowIndex }, row.map((cell, cellIndex) => (
        h('td', { key: cellIndex }, renderInline(cell, `${key}-${rowIndex}-${cellIndex}`))
      ))))),
    ))
  }
  return null
}

function Markdown({ text, className = '', streaming = false }) {
  const blocks = React.useMemo(() => parseMarkdown(text), [text])
  return h('div', { className: `dsc-md ${streaming ? 'dsc-md-streaming' : ''} ${className}`.trim() },
    blocks.map(renderBlock),
    streaming ? h('span', { className: 'dsc-caret', 'aria-hidden': 'true' }) : null,
  )
}

/* ---- 40-icons.js ---- */
function IconBase({ size = 18, children, filled = false, className = '' }) {
  return h('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: filled ? 'currentColor' : 'none',
    stroke: filled ? 'none' : 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `dsc-icon ${className}`.trim(),
    'aria-hidden': 'true',
    focusable: 'false',
  }, children)
}

const IconPlus = props => h(IconBase, props, h('path', { d: 'M12 5v14M5 12h14' }))
const IconSearch = props => h(IconBase, props,
  h('circle', { cx: 11, cy: 11, r: 6.5 }),
  h('path', { d: 'M16 16l4.2 4.2' }),
)
const IconClose = props => h(IconBase, props, h('path', { d: 'M6 6l12 12M18 6L6 18' }))
const IconChevronDown = props => h(IconBase, props, h('path', { d: 'M6 9l6 6 6-6' }))
const IconChevronRight = props => h(IconBase, props, h('path', { d: 'M9 6l6 6-6 6' }))
const IconArrowUp = props => h(IconBase, props, h('path', { d: 'M12 19V5M6 11l6-6 6 6' }))
const IconStop = props => h(IconBase, { ...props, filled: true }, h('rect', { x: 7, y: 7, width: 10, height: 10, rx: 2.2 }))
const IconPaperclip = props => h(IconBase, props,
  h('path', { d: 'M20 11.5l-8.4 8.4a5 5 0 0 1-7.1-7.1l8.5-8.5a3.4 3.4 0 0 1 4.8 4.8l-8.5 8.5a1.8 1.8 0 0 1-2.5-2.5l7.8-7.8' }),
)
const IconSpark = props => h(IconBase, props,
  h('path', { d: 'M12 3.5l1.8 4.7 4.7 1.8-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-1.8L12 3.5Z' }),
  h('path', { d: 'M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z' }),
)
const IconGlobe = props => h(IconBase, props,
  h('circle', { cx: 12, cy: 12, r: 8.5 }),
  h('path', { d: 'M3.8 9.5h16.4M3.8 14.5h16.4' }),
  h('path', { d: 'M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5Z' }),
)
const IconSettings = props => h(IconBase, props,
  h('circle', { cx: 12, cy: 12, r: 3 }),
  h('path', { d: 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z' }),
)
const IconTrash = props => h(IconBase, props,
  h('path', { d: 'M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7' }),
  h('path', { d: 'M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12' }),
  h('path', { d: 'M10 11v6M14 11v6' }),
)
const IconPencil = props => h(IconBase, props,
  h('path', { d: 'M4 20h4.2L19.5 8.7a2.1 2.1 0 0 0-3-3L5.2 17 4 20Z' }),
  h('path', { d: 'M14.8 6.8l2.9 2.9' }),
)
const IconCopy = props => h(IconBase, props,
  h('rect', { x: 8, y: 8, width: 11, height: 11, rx: 2 }),
  h('path', { d: 'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2' }),
)
const IconCheck = props => h(IconBase, props, h('path', { d: 'M5 12.5l4.3 4.3L19 7' }))
const IconMenu = props => h(IconBase, props, h('path', { d: 'M4 7h16M4 12h16M4 17h16' }))
const IconSidebar = props => h(IconBase, props,
  h('rect', { x: 3.5, y: 4, width: 17, height: 16, rx: 2.5 }),
  h('path', { d: 'M9.5 4v16' }),
)
const IconArrowLeft = props => h(IconBase, props, h('path', { d: 'M19 12H5M11 6l-6 6 6 6' }))
const IconFile = props => h(IconBase, props,
  h('path', { d: 'M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L14 3.5Z' }),
  h('path', { d: 'M14 3.5v5h5M8.5 13h7M8.5 16.5h5' }),
)
const IconImage = props => h(IconBase, props,
  h('rect', { x: 3.5, y: 4.5, width: 17, height: 15, rx: 2.5 }),
  h('circle', { cx: 8.5, cy: 9.5, r: 1.6 }),
  h('path', { d: 'M4.5 17l4.7-4.7 3.3 3.3 2.4-2.4 4.6 4.6' }),
)
const IconWarning = props => h(IconBase, props,
  h('path', { d: 'M12 4.2L21 20H3L12 4.2Z' }),
  h('path', { d: 'M12 9.5v4.5M12 17.2v.2' }),
)
const IconExternal = props => h(IconBase, props,
  h('path', { d: 'M14 4h6v6M20 4l-9 9' }),
  h('path', { d: 'M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10' }),
)
const IconLink = props => h(IconBase, props,
  h('path', { d: 'M10 13.5a4.2 4.2 0 0 0 6 0l2.4-2.4a4.2 4.2 0 1 0-6-6L11 6.5' }),
  h('path', { d: 'M14 10.5a4.2 4.2 0 0 0-6 0L5.6 12.9a4.2 4.2 0 1 0 6 6L13 17.5' }),
)
const IconCode = props => h(IconBase, props, h('path', { d: 'M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5M13 5l-2 14' }))
const IconBrain = props => h(IconBase, props,
  h('path', { d: 'M9.5 5.5a3 3 0 0 0-5 2.2 3 3 0 0 0-1 5.7 3 3 0 0 0 3.4 4.9 3 3 0 0 0 5.6-1.6V7.8a2.3 2.3 0 0 0-3-2.3Z' }),
  h('path', { d: 'M14.5 5.5a3 3 0 0 1 5 2.2 3 3 0 0 1 1 5.7 3 3 0 0 1-3.4 4.9 3 3 0 0 1-5.6-1.6V7.8a2.3 2.3 0 0 1 3-2.3Z' }),
  h('path', { d: 'M8 11h2M14 11h2M8.5 15h2M13.5 15h2' }),
)
const IconRefresh = props => h(IconBase, props,
  h('path', { d: 'M20 11a8 8 0 1 0-2.3 6.2' }),
  h('path', { d: 'M20 5v6h-6' }),
)
const IconChatBubble = props => h(IconBase, props,
  h('path', { d: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.8 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z' }),
  h('path', { d: 'M8.5 10h7M8.5 13h4.5' }),
)
const IconAgent = props => h(IconBase, props,
  h('rect', { x: 3.5, y: 5, width: 17, height: 14, rx: 2.5 }),
  h('path', { d: 'M7 9.5l2.5 2.5L7 14.5M12.5 14.5H17' }),
)

const ICONS = {
  plus: IconPlus,
  search: IconSearch,
  close: IconClose,
  chevronDown: IconChevronDown,
  chevronRight: IconChevronRight,
  arrowUp: IconArrowUp,
  stop: IconStop,
  paperclip: IconPaperclip,
  spark: IconSpark,
  globe: IconGlobe,
  settings: IconSettings,
  trash: IconTrash,
  pencil: IconPencil,
  copy: IconCopy,
  check: IconCheck,
  menu: IconMenu,
  sidebar: IconSidebar,
  arrowLeft: IconArrowLeft,
  file: IconFile,
  image: IconImage,
  warning: IconWarning,
  external: IconExternal,
  link: IconLink,
  code: IconCode,
  brain: IconBrain,
  refresh: IconRefresh,
  chat: IconChatBubble,
  agent: IconAgent,
}

function Icon({ name, size = 18, className = '' }) {
  const Component = ICONS[name] ?? IconSpark
  return h(Component, { size, className })
}

/* ---- 50-components.js ---- */
function cx(...values) {
  return values.filter(Boolean).join(' ')
}

function useAutoScroll(ref, deps) {
  const stick = React.useRef(true)
  React.useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const onScroll = () => {
      stick.current = node.scrollHeight - node.scrollTop - node.clientHeight < 140
    }
    node.addEventListener('scroll', onScroll, { passive: true })
    return () => node.removeEventListener('scroll', onScroll)
  }, [ref])
  React.useEffect(() => {
    const node = ref.current
    if (node && stick.current) node.scrollTop = node.scrollHeight
  }, deps)
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function collectMessageSources(message) {
  const cited = new Map()
  const found = new Map()
  for (const block of message.blocks ?? []) {
    if (block.type === 'text') {
      for (const citation of block.citations ?? []) {
        if (!citation.url || cited.has(citation.url)) continue
        cited.set(citation.url, {
          url: citation.url,
          title: citation.title || hostnameOf(citation.url) || citation.url,
          snippet: '',
          siteName: hostnameOf(citation.url),
        })
      }
    }
    if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const item of block.content) {
        if (item.type !== 'web_search_result' || !item.url || found.has(item.url)) continue
        found.set(item.url, {
          url: item.url,
          title: item.title || hostnameOf(item.url) || item.url,
          snippet: item.snippet || '',
          siteName: item.site_name || hostnameOf(item.url),
        })
      }
    }
    if (block.type === 'web_fetch_tool_result' && block.content?.type === 'web_fetch_result') {
      const url = block.content.url
      if (url && !found.has(url)) {
        found.set(url, {
          url,
          title: block.content.title || hostnameOf(url) || url,
          snippet: '',
          siteName: hostnameOf(url),
        })
      }
    }
  }
  // When the answer cites specific pages, show those as its sources. Search
  // hits remain available in the process timeline above.
  return [...(cited.size > 0 ? cited : found).values()]
}

function messageText(message) {
  return (message.blocks ?? [])
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')
}

/**
 * Reasoning time of one reply, in milliseconds.
 *
 * Only stored timestamps count. `Date.now()` is read for a thinking block that
 * is still open in the live reply, and never for a settled one: a finished
 * answer must keep reporting the same duration across re-renders, conversation
 * switches and reloads. A settled reply whose block lost its `endedAt` falls
 * back to the reply's own last write, not to the current clock.
 */
function thinkingDurationMs(message, live = false) {
  let start = null
  let end = null
  let open = false
  for (const block of message?.blocks ?? []) {
    if (block?.type !== 'thinking') continue
    if (typeof block.startedAt === 'number') start = start === null ? block.startedAt : Math.min(start, block.startedAt)
    if (typeof block.endedAt === 'number') end = end === null ? block.endedAt : Math.max(end, block.endedAt)
    else open = true
  }
  if (start === null) return 0
  if (!open) return Math.max(0, (end ?? start) - start)
  const settled = typeof message.updatedAt === 'number' ? message.updatedAt : null
  const finish = live ? Date.now() : Math.max(end ?? 0, settled ?? start, start)
  return Math.max(0, finish - start)
}

function thinkingSeconds(message, live = false) {
  const ms = thinkingDurationMs(message, live)
  if (ms <= 0) return 0
  return Math.max(1, Math.round(ms / 1000))
}

function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    const fallback = () => {
      try {
        const area = document.createElement('textarea')
        area.value = text
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        document.execCommand('copy')
        area.remove()
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(resolve).catch(fallback)
    else fallback()
  })
}

function relativeTime(timestamp, t) {
  const value = typeof timestamp === 'number' ? timestamp : Date.now()
  const now = new Date()
  const date = new Date(value)
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (value >= startToday) return formatTime(value)
  if (value >= startToday - 86_400_000) return t('yesterday')
  try {
    return new Intl.DateTimeFormat(appCtx?.locale.getSnapshot().active === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short', day: 'numeric',
    }).format(date)
  } catch {
    return date.toLocaleDateString()
  }
}

function groupConversations(list, t) {
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startYesterday = startToday - 86_400_000
  const groups = [
    { key: 'today', label: t('today'), items: [] },
    { key: 'yesterday', label: t('yesterday'), items: [] },
    { key: 'earlier', label: t('earlier'), items: [] },
  ]
  for (const item of list) {
    const updated = typeof item.updatedAt === 'number' ? item.updatedAt : 0
    if (updated >= startToday) groups[0].items.push(item)
    else if (updated >= startYesterday) groups[1].items.push(item)
    else groups[2].items.push(item)
  }
  return groups.filter(group => group.items.length > 0)
}

function authSourceLabel(auth, t) {
  if (!auth) return t('loading')
  if (auth.source === 'chat-key') return t('authSourceChatKey')
  if (auth.source === 'dsh-key') return t('authSourceDshKey')
  if (auth.source === 'account') return t('authSourceAccount')
  return t('authMissing')
}

function fileIconName(file) {
  return file.isImage ? 'image' : 'file'
}

function Spinner({ size = 16, label }) {
  return h('span', {
    className: 'dsc-spinner',
    style: { width: `${size}px`, height: `${size}px` },
    role: 'status',
    'aria-label': label || tr('loading'),
  })
}

function TypingDots() {
  return h('span', { className: 'dsc-typing', 'aria-label': tr('thinkingActive') },
    [0, 1, 2].map(index => h('span', { key: index, className: 'dsc-typing-dot' })),
  )
}

function AttachmentCard({ file, onRemove, onRetry, compact = false }) {
  const t = useT()
  const image = file.isImage && file.previewUrl
  const status = file.status ?? 'ready'
  return h('div', { className: cx('dsc-attach', compact && 'is-compact', status === 'error' && 'is-error') },
    image
      ? h('img', { className: 'dsc-attach-thumb', src: file.previewUrl, alt: file.name })
      : h('span', { className: 'dsc-attach-icon' }, h(Icon, { name: fileIconName(file), size: 18 })),
    h('span', { className: 'dsc-attach-meta' },
      h('span', { className: 'dsc-attach-name', title: file.error || file.name }, file.name),
      h('span', { className: 'dsc-attach-size' },
        status === 'uploading' ? t('uploading')
          : status === 'error' ? (file.error || t('uploadFailed'))
            : formatSize(file.size)),
    ),
    status === 'uploading' ? h(Spinner, { size: 14 }) : null,
    status === 'error' && onRetry
      ? h('button', {
          type: 'button', className: 'dsc-attach-action', title: t('uploadRetry'),
          'aria-label': t('uploadRetry'), onClick: () => onRetry(file.id),
        }, h(Icon, { name: 'refresh', size: 14 }))
      : null,
    onRemove
      ? h('button', {
          type: 'button', className: 'dsc-attach-action', title: t('remove'),
          'aria-label': t('remove'), onClick: () => onRemove(file.id),
        }, h(Icon, { name: 'close', size: 14 }))
      : null,
  )
}

function SourceCard({ source, index }) {
  const href = safeHref(source.url)
  if (href === null) return null
  return h('a', {
    className: 'dsc-source', href, target: '_blank', rel: 'noreferrer noopener',
    title: source.title,
  },
    h('span', { className: 'dsc-source-index' }, String(index + 1)),
    h('span', { className: 'dsc-source-body' },
      h('span', { className: 'dsc-source-title' }, source.title),
      h('span', { className: 'dsc-source-meta' }, source.siteName || hostnameOf(source.url)),
      source.snippet ? h('span', { className: 'dsc-source-snippet' }, source.snippet) : null,
    ),
    h(Icon, { name: 'external', size: 13 }),
  )
}

function SearchResultList({ items }) {
  const t = useT()
  const results = (items ?? []).filter(item => item?.type === 'web_search_result' && item.url)
  const errors = (items ?? []).filter(item => item?.type === 'web_search_tool_result_error')
  if (results.length === 0) {
    return h('div', { className: 'dsc-result-empty' }, errors.length > 0 ? t('searchFailed') : t('noSearchResults'))
  }
  return h('div', { className: 'dsc-result-list' }, results.map((item, index) => {
    const href = safeHref(item.url)
    if (href === null) return null
    return h('a', {
      key: `${item.url}-${index}`, className: 'dsc-result', href, target: '_blank', rel: 'noreferrer noopener',
    },
      h('span', { className: 'dsc-result-title' }, item.title || hostnameOf(item.url)),
      h('span', { className: 'dsc-result-meta' }, item.site_name || hostnameOf(item.url)),
      item.snippet ? h('span', { className: 'dsc-result-snippet' }, item.snippet) : null,
    )
  }))
}

function ToolStep({ block, result, streaming }) {
  const t = useT()
  const [expanded, setExpanded] = React.useState(false)
  const input = block.input ?? {}
  const kind = block.kind ?? 'search'
  const isSearch = kind === 'search' || kind === 'deep_search' || kind === 'image_search' || kind === 'deep_image_search'
  const isReadLink = kind === 'read_link'
  const action = input.action
  const searchItems = result?.type === 'web_search_tool_result' && Array.isArray(result.content) ? result.content : []
  const fetchContent = result?.type === 'web_fetch_tool_result' ? result.content : null
  const failed = fetchContent?.type === 'web_fetch_tool_result_error'
    || searchItems.some(item => item?.type === 'web_search_tool_result_error')
  const icon = isSearch ? 'search' : isReadLink ? 'link' : 'globe'
  let label = isSearch ? t('searchStep') : isReadLink ? t('readStep') : t('openStep')
  let detail = ''
  if (isSearch) {
    const queries = Array.isArray(input.queries) ? input.queries : (input.query ? [input.query] : [])
    detail = queries.join(' · ')
  } else if (action === 'find_in_page') {
    label = t('findStep')
    detail = t('findInPage', { pattern: input.pattern || '' })
  } else {
    detail = input.url || ''
  }
  const resultCount = searchItems.filter(item => item?.type === 'web_search_result').length
  const clickable = resultCount > 0
  const pageUrl = fetchContent?.type === 'web_fetch_result' ? fetchContent.url : (input.url || '')
  const pageTitle = fetchContent?.type === 'web_fetch_result' ? fetchContent.title : ''
  return h('div', { className: cx('dsc-step', failed && 'is-failed') },
    h('span', { className: 'dsc-step-icon' }, h(Icon, { name: icon, size: 14 })),
    h('div', { className: 'dsc-step-main' },
      h('div', {
        className: cx('dsc-step-line', clickable && 'is-clickable'),
        onClick: clickable ? () => setExpanded(value => !value) : undefined,
        role: clickable ? 'button' : undefined,
        tabIndex: clickable ? 0 : undefined,
        onKeyDown: clickable ? (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setExpanded(value => !value)
          }
        } : undefined,
      },
        h('span', { className: 'dsc-step-label' }, label),
        detail ? h('span', { className: 'dsc-step-detail' }, detail) : null,
        resultCount > 0 ? h('span', { className: 'dsc-step-count' }, t('resultCount', { count: resultCount })) : null,
        streaming && result === undefined ? h('span', { className: 'dsc-step-pending' }, t('searching')) : null,
        failed ? h('span', { className: 'dsc-step-failed' }, t('searchFailed')) : null,
        clickable ? h(Icon, { name: expanded ? 'chevronDown' : 'chevronRight', size: 12 }) : null,
      ),
      pageUrl && fetchContent?.type === 'web_fetch_result'
        ? h('a', {
            className: 'dsc-step-page', href: safeHref(pageUrl) ?? undefined, target: '_blank', rel: 'noreferrer noopener',
          }, pageTitle || hostnameOf(pageUrl), h(Icon, { name: 'external', size: 11 }))
        : null,
      expanded ? h(SearchResultList, { items: searchItems }) : null,
    ),
  )
}

function ProcessPanel({ message, streaming }) {
  const t = useT()
  const blocks = message.blocks ?? []
  const thinking = blocks.filter(block => block.type === 'thinking' && block.thinking.trim() !== '')
  const calls = blocks.filter(block => block.type === 'server_tool_use')
  const [open, setOpen] = React.useState(streaming)
  const wasStreaming = React.useRef(streaming)
  React.useEffect(() => {
    if (wasStreaming.current && !streaming) setOpen(false)
    wasStreaming.current = streaming
  }, [streaming])
  if (thinking.length === 0 && calls.length === 0) return null
  const results = new Map()
  for (const block of blocks) {
    if (block.type === 'web_search_tool_result' || block.type === 'web_fetch_tool_result') {
      results.set(block.tool_use_id, block)
    }
  }
  const last = blocks.at(-1)
  let activeLabel = t('thinkingActive')
  if (last?.type === 'server_tool_use') {
    if (last.kind === 'read_link') activeLabel = t('thinkingReading')
    else if (last.kind?.includes('search') || last.input?.action === 'search') activeLabel = t('thinkingSearching')
    else activeLabel = t('thinkingReading')
  } else if (last?.type === 'web_search_tool_result') {
    activeLabel = t('thinkingSearching')
  } else if (last?.type === 'web_fetch_tool_result') {
    activeLabel = t('thinkingReading')
  }
  const seconds = thinkingSeconds(message, streaming)
  const title = thinking.length > 0
    ? (streaming ? activeLabel : (seconds > 0 ? t('thinkingDone', { seconds }) : t('thinkingDoneNoTime')))
    : (streaming ? t('processing') : t('processSteps', { count: calls.length }))
  return h('div', { className: cx('dsc-process', streaming && 'is-streaming') },
    h('button', {
      type: 'button',
      className: 'dsc-process-head',
      'aria-expanded': open,
      onClick: () => setOpen(value => !value),
    },
      h('span', { className: 'dsc-process-icon' }, h(Icon, { name: 'spark', size: 14 })),
      h('span', { className: cx('dsc-process-title', streaming && 'is-shimmer') }, title),
      h('span', { className: 'dsc-process-chevron' }, h(Icon, { name: open ? 'chevronDown' : 'chevronRight', size: 13 })),
    ),
    open ? h('div', { className: 'dsc-process-body' },
      blocks.map((block, index) => {
        if (block.type === 'thinking') {
          if (block.thinking.trim() === '') return null
          const active = streaming && block.endedAt === undefined
          return h('div', { className: cx('dsc-think-block', active && 'is-active'), key: `think-${index}` },
            h(Markdown, { text: block.thinking, streaming: active }),
          )
        }
        if (block.type === 'server_tool_use') {
          return h(ToolStep, {
            key: block.id || `tool-${index}`,
            block,
            result: results.get(block.id),
            streaming,
          })
        }
        return null
      }),
    ) : null,
  )
}

function AssistantMessage({ message, streaming, isLast }) {
  const t = useT()
  const [copied, setCopied] = React.useState(false)
  const text = messageText(message)
  const sources = collectMessageSources(message)
  const refused = message.stopReason === 'refusal'
  const errorInfo = message.error ? friendlyError(message.error) : null
  const showTyping = streaming && text === '' && (message.blocks ?? []).length === 0
  return h('div', { className: 'dsc-msg dsc-msg-assistant' },
    h('div', { className: 'dsc-msg-body' },
      h(ProcessPanel, { message, streaming }),
      refused
        ? h('div', { className: 'dsc-notice' }, h(Icon, { name: 'warning', size: 16 }), h('span', null, t('refused')))
        : null,
      !refused && text !== ''
        ? h(Markdown, { text, streaming: streaming && message.status === 'streaming' })
        : null,
      showTyping ? h(TypingDots, null) : null,
      !streaming && message.status === 'stopped' && !refused
        ? h('div', { className: 'dsc-muted-note' }, t('stopped'))
        : null,
      errorInfo
        ? h('div', { className: 'dsc-notice is-error' },
            h(Icon, { name: 'warning', size: 16 }),
            h('span', { title: message.error?.message || '' }, errorInfo.text),
            errorInfo.action === 'settings'
              ? h('button', {
                  type: 'button', className: 'dsc-inline-button',
                  onClick: () => chatStore.set({ settingsOpen: true }),
                }, t('configure'))
              : null,
          )
        : null,
      sources.length > 0
        ? h('div', { className: 'dsc-sources' },
            h('div', { className: 'dsc-sources-head' }, h(Icon, { name: 'link', size: 13 }), t('sourceCount', { count: sources.length })),
            h('div', { className: 'dsc-source-list' }, sources.map((source, index) => h(SourceCard, { key: source.url, source, index }))),
          )
        : null,
      !streaming
        ? h('div', { className: cx('dsc-msg-actions', isLast && 'is-last') },
            text !== ''
              ? h('button', {
                  type: 'button', className: 'dsc-msg-action', title: t('copy'),
                  'aria-label': t('copy'),
                  onClick: () => {
                    copyToClipboard(text).then(() => {
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1600)
                    }).catch(() => chatStore.toast(t('copyFailed'), 'error'))
                  },
                }, h(Icon, { name: copied ? 'check' : 'copy', size: 14 }), h('span', null, copied ? t('copied') : t('copy')))
              : null,
            message.usage
              ? h('span', { className: 'dsc-usage' }, t('usage', {
                  input: message.usage.input_tokens ?? 0,
                  output: message.usage.output_tokens ?? 0,
                }))
              : null,
          )
        : null,
    ),
  )
}

function UserMessage({ message }) {
  const files = Array.isArray(message.files) ? message.files : []
  return h('div', { className: 'dsc-msg dsc-msg-user' },
    h('div', { className: 'dsc-user-bubble' },
      files.length > 0
        ? h('div', { className: 'dsc-user-files' }, files.map(file => h(AttachmentCard, { key: file.id, file, compact: true })))
        : null,
      message.content !== '' ? h('div', { className: 'dsc-user-text' }, message.content) : null,
    ),
  )
}

function SuggestionCard({ suggestion, onClick }) {
  const t = useT()
  return h('button', { type: 'button', className: 'dsc-suggestion', onClick },
    h('span', { className: 'dsc-suggestion-icon' }, h(Icon, { name: suggestion.icon, size: 17 })),
    h('span', { className: 'dsc-suggestion-body' },
      h('span', { className: 'dsc-suggestion-title' }, t(suggestion.titleKey)),
      h('span', { className: 'dsc-suggestion-text' }, t(suggestion.textKey)),
    ),
  )
}

function EmptyState() {
  const t = useT()
  const auth = useChat(state => state.auth)
  const settings = useChat(state => state.settings)
  const onSuggestion = (suggestion) => {
    if (suggestion.file) {
      chatActions.requestFilePicker()
      return
    }
    chatStore.set({ draft: tr(suggestion.textKey) })
    if (suggestion.thinking && !settings.thinking) chatActions.toggleThinking()
    if (suggestion.search && !settings.search) chatActions.toggleSearch()
    chatActions.requestFocus()
  }
  return h('div', { className: 'dsc-empty' },
    h('h1', { className: 'dsc-empty-title' }, t('greeting')),
    h('p', { className: 'dsc-empty-subtitle' }, t('greetingSubtitle')),
    auth?.ready === false
      ? h('div', { className: 'dsc-setup-card' },
          h('span', { className: 'dsc-setup-icon' }, h(Icon, { name: 'warning', size: 18 })),
          h('div', { className: 'dsc-setup-body' },
            h('strong', null, t('noAuthTitle')),
            h('span', null, t('noAuthBody')),
          ),
          h('button', {
            type: 'button', className: 'dsc-primary-button',
            onClick: () => chatStore.set({ settingsOpen: true }),
          }, t('configureNow')),
        )
      : null,
    h('div', { className: 'dsc-suggestions' }, SUGGESTIONS.map(suggestion => (
      h(SuggestionCard, { key: suggestion.id, suggestion, onClick: () => onSuggestion(suggestion) })
    ))),
    h('div', { className: 'dsc-empty-foot' }, t('modeSwitchHint')),
  )
}

function Thread() {
  const messages = useChat(state => state.messages)
  const streaming = useChat(state => state.streaming)
  const activeId = useChat(state => state.activeId)
  const conversationLoading = useChat(state => state.conversationLoading)
  const conversationError = useChat(state => state.conversationError)
  const ref = React.useRef(null)
  useAutoScroll(ref, [messages, activeId, streaming?.assistantId])
  React.useEffect(() => {
    const node = ref.current
    if (node) node.scrollTop = node.scrollHeight
  }, [activeId])
  if (conversationLoading) {
    return h('div', { className: 'dsc-thread dsc-thread-loading' }, h(Spinner, { size: 22 }))
  }
  if (conversationError !== '') {
    return h('div', { className: 'dsc-thread' },
      h('div', { className: 'dsc-thread-error' },
        h('span', { className: 'dsc-thread-error-icon' }, h(Icon, { name: 'warning', size: 20 })),
        h('strong', null, tr('historyLoadFailed')),
        h('span', null, conversationError),
        h('button', {
          type: 'button', className: 'dsc-secondary-button',
          onClick: () => { if (activeId) void chatActions.loadConversation(activeId) },
        }, tr('retry')),
      ),
    )
  }
  return h('div', { className: 'dsc-thread', ref, role: 'log', 'aria-live': 'polite' },
    messages.length === 0
      ? h(EmptyState, null)
      : h('div', { className: 'dsc-thread-inner' }, messages.map((message, index) => (
          message.role === 'user'
            ? h(UserMessage, { key: message.id, message })
            : h(AssistantMessage, {
                key: message.id,
                message,
                streaming: streaming?.assistantId === message.id,
                isLast: index === messages.length - 1,
              })
        ))),
  )
}

function AuthBanner() {
  const t = useT()
  const auth = useChat(state => state.auth)
  if (auth === null || auth.ready) return null
  return h('div', { className: 'dsc-auth-banner' },
    h(Icon, { name: 'warning', size: 16 }),
    h('span', null, t('noAuthBody')),
    h('button', {
      type: 'button', className: 'dsc-inline-button',
      onClick: () => chatStore.set({ settingsOpen: true }),
    }, t('configure')),
  )
}

function Composer() {
  const t = useT()
  const draft = useChat(state => state.draft)
  const attachments = useChat(state => state.attachments)
  const streaming = useChat(state => state.streaming)
  const stopping = useChat(state => state.stopping)
  const auth = useChat(state => state.auth)
  const settings = useChat(state => state.settings)
  const modelName = useChat(state => state.bootData?.model?.name)
  const focusRequest = useChat(state => state.focusRequest)
  const filePickRequest = useChat(state => state.filePickRequest)
  const textareaRef = React.useRef(null)
  const fileRef = React.useRef(null)
  const [drag, setDrag] = React.useState(false)
  React.useEffect(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, 220)}px`
  }, [draft])
  React.useEffect(() => {
    if (focusRequest === 0) return
    const timer = setTimeout(() => textareaRef.current?.focus(), 30)
    return () => clearTimeout(timer)
  }, [focusRequest])
  React.useEffect(() => {
    if (filePickRequest === 0) return
    fileRef.current?.click()
  }, [filePickRequest])
  const isStreaming = streaming !== null
  const canSend = draft.trim() !== '' || attachments.some(item => item.status === 'ready')
  const onFiles = (files) => {
    if (files && files.length > 0) chatActions.addFiles(files)
  }
  const handleSend = () => {
    if (isStreaming) return
    if (!auth?.ready) {
      chatStore.set({ settingsOpen: true })
      return
    }
    void chatActions.sendMessage()
  }
  return h('div', { className: 'dsc-composer-wrap' },
    h(AuthBanner, null),
    h('div', {
      className: cx('dsc-composer', drag && 'is-drag'),
      onDragOver: (event) => {
        event.preventDefault()
        if (!drag) setDrag(true)
      },
      onDragLeave: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setDrag(false)
      },
      onDrop: (event) => {
        event.preventDefault()
        setDrag(false)
        onFiles(event.dataTransfer?.files)
      },
    },
      attachments.length > 0
        ? h('div', { className: 'dsc-attach-rail' }, attachments.map(file => (
            h(AttachmentCard, {
              key: file.id, file,
              onRemove: chatActions.removeAttachment,
              onRetry: chatActions.retryAttachment,
            })
          )))
        : null,
      h('textarea', {
        ref: textareaRef,
        className: 'dsc-textarea',
        value: draft,
        rows: 1,
        placeholder: t('composerPlaceholder'),
        'aria-label': t('composerPlaceholder'),
        onChange: (event) => chatStore.set({ draft: event.target.value }),
        onPaste: (event) => {
          const files = [...(event.clipboardData?.files ?? [])]
          if (files.length > 0) {
            event.preventDefault()
            onFiles(files)
          }
        },
        onKeyDown: (event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()
            if (!isStreaming && canSend) handleSend()
          }
        },
      }),
      h('div', { className: 'dsc-composer-tools' },
        h('input', {
          ref: fileRef,
          type: 'file',
          className: 'dsc-file-input',
          multiple: true,
          accept: ACCEPT,
          onChange: (event) => {
            onFiles(event.target.files)
            event.target.value = ''
          },
        }),
        h('button', {
          type: 'button', className: 'dsc-tool-button', title: t('attach'), 'aria-label': t('attach'),
          onClick: () => fileRef.current?.click(),
        }, h(Icon, { name: 'paperclip', size: 18 })),
        h('button', {
          type: 'button',
          className: cx('dsc-mode-button', settings.thinking && 'is-active'),
          title: t('deepThink'),
          'aria-label': t('deepThink'),
          'aria-pressed': settings.thinking,
          onClick: chatActions.toggleThinking,
        }, h(Icon, { name: 'brain', size: 16 }), h('span', { className: 'dsc-mode-label' }, t('deepThink'))),
        h('button', {
          type: 'button',
          className: cx('dsc-mode-button', settings.search && 'is-active'),
          title: t('webSearch'),
          'aria-label': t('webSearch'),
          'aria-pressed': settings.search,
          onClick: chatActions.toggleSearch,
        }, h(Icon, { name: 'globe', size: 16 }), h('span', { className: 'dsc-mode-label' }, t('webSearch'))),
        h('span', { className: 'dsc-tool-spacer' }),
        modelName ? h('span', { className: 'dsc-model-pill', title: t('modelNote') }, modelName) : null,
        isStreaming
          ? h('button', {
              type: 'button',
              className: 'dsc-stop-button',
              title: t('stop'),
              'aria-label': t('stop'),
              disabled: stopping,
              onClick: () => chatActions.requestStop(),
            }, h(Icon, { name: 'stop', size: 15 }))
          : h('button', {
              type: 'button',
              className: cx('dsc-send-button', !canSend && 'is-idle'),
              title: t('send'),
              'aria-label': t('send'),
              'aria-disabled': !canSend,
              onClick: handleSend,
            }, h(Icon, { name: 'arrowUp', size: 17 })),
      ),
      drag ? h('div', { className: 'dsc-drop-mask' }, h(Icon, { name: 'paperclip', size: 22 }), t('dropFiles')) : null,
    ),
    h('div', { className: 'dsc-disclaimer' }, t('disclaimer')),
  )
}

function ConversationItem({ conversation, active, renaming, onOpen, onRename, onDelete }) {
  const t = useT()
  const [value, setValue] = React.useState(conversation.title || '')
  const inputRef = React.useRef(null)
  const cancelled = React.useRef(false)
  React.useEffect(() => {
    if (renaming) {
      setValue(conversation.title || '')
      cancelled.current = false
      setTimeout(() => inputRef.current?.select(), 20)
    }
  }, [renaming, conversation.title])
  if (renaming) {
    return h('div', { className: 'dsc-chat-item is-renaming' },
      h('input', {
        ref: inputRef,
        className: 'dsc-rename-input',
        value,
        maxLength: 80,
        placeholder: t('chatTitlePlaceholder'),
        onChange: (event) => setValue(event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            onRename(value)
          }
          if (event.key === 'Escape') {
            event.preventDefault()
            cancelled.current = true
            chatStore.set({ renamingId: null })
          }
        },
        onBlur: () => {
          if (cancelled.current) {
            cancelled.current = false
            return
          }
          onRename(value)
        },
      }),
    )
  }
  return h('div', {
    className: cx('dsc-chat-item', active && 'is-active'),
    role: 'button',
    tabIndex: 0,
    onClick: onOpen,
    onKeyDown: (event) => {
      if (event.target !== event.currentTarget) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onOpen()
      }
    },
    title: conversation.title || t('newChatTitle'),
  },
    h('span', { className: 'dsc-chat-item-title' }, conversation.title || t('newChatTitle')),
    h('span', { className: 'dsc-chat-item-time' }, relativeTime(conversation.updatedAt, t)),
    h('span', { className: 'dsc-chat-item-actions' },
      h('button', {
        type: 'button', className: 'dsc-icon-button is-small', title: t('rename'), 'aria-label': t('rename'),
        onClick: (event) => {
          event.stopPropagation()
          chatStore.set({ renamingId: conversation.id })
        },
      }, h(Icon, { name: 'pencil', size: 13 })),
      h('button', {
        type: 'button', className: 'dsc-icon-button is-small is-danger', title: t('delete'), 'aria-label': t('delete'),
        onClick: (event) => {
          event.stopPropagation()
          chatActions.requestDeleteConversation(conversation.id, conversation.title)
        },
      }, h(Icon, { name: 'trash', size: 13 })),
    ),
  )
}

function Sidebar() {
  const t = useT()
  const conversations = useChat(state => state.conversations)
  const activeId = useChat(state => state.activeId)
  const renamingId = useChat(state => state.renamingId)
  const auth = useChat(state => state.auth)
  const [query, setQuery] = React.useState('')
  const filtered = query.trim() === ''
    ? conversations
    : conversations.filter(item => (item.title || '').toLowerCase().includes(query.trim().toLowerCase()))
  const groups = groupConversations(filtered, t)
  const closeOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) chatStore.set({ sidebarOpen: false })
  }
  const select = (id) => {
    if (id === activeId) {
      chatActions.requestFocus()
      closeOnMobile()
      return
    }
    if (chatStore.state.streaming !== null) {
      chatStore.toast(t('waitStreaming'), 'warning')
      return
    }
    void chatActions.loadConversation(id)
    closeOnMobile()
  }
  return h('aside', { className: 'dsc-sidebar-inner' },
    h('div', { className: 'dsc-sidebar-top' },
      h('div', { className: 'dsc-sidebar-actions' },
        h('button', {
          type: 'button', className: 'dsc-new-chat',
          onClick: () => { void chatActions.newChat(); closeOnMobile() },
        }, h(Icon, { name: 'plus', size: 16 }), h('span', null, t('newChat'))),
        h('button', {
          type: 'button', className: 'dsc-icon-button dsc-sidebar-collapse', title: t('collapseSidebar'),
          'aria-label': t('collapseSidebar'), onClick: () => chatStore.set({ sidebarOpen: false }),
        }, h(Icon, { name: 'sidebar', size: 17 })),
      ),
      h('label', { className: 'dsc-search' },
        h(Icon, { name: 'search', size: 15 }),
        h('input', {
          className: 'dsc-search-input',
          value: query,
          placeholder: t('searchChats'),
          'aria-label': t('searchChats'),
          onChange: (event) => setQuery(event.target.value),
        }),
      ),
    ),
    h('div', { className: 'dsc-chat-list' },
      groups.length === 0
        ? h('div', { className: 'dsc-list-empty' }, query.trim() === '' ? t('noChats') : t('searchEmpty'))
        : groups.map(group => h('div', { className: 'dsc-chat-group', key: group.key },
            h('div', { className: 'dsc-chat-group-label' }, group.label),
            group.items.map(conversation => h(ConversationItem, {
              key: conversation.id,
              conversation,
              active: conversation.id === activeId,
              renaming: renamingId === conversation.id,
              onOpen: () => select(conversation.id),
              onRename: (value) => {
                if (value.trim() === conversation.title) {
                  chatStore.set({ renamingId: null })
                  return
                }
                void chatActions.renameConversation(conversation.id, value)
              },
              onDelete: () => chatActions.requestDeleteConversation(conversation.id, conversation.title),
            })),
          )),
    ),
    h('div', { className: 'dsc-sidebar-foot' },
      h('button', {
        type: 'button', className: 'dsc-foot-action',
        title: t('chatSettings'),
        onClick: () => chatStore.set({ settingsOpen: true }),
      }, h(Icon, { name: 'settings', size: 17 }), h('span', null, t('settings')),
        h('span', { className: cx('dsc-auth-dot', auth?.ready ? 'is-ready' : 'is-missing'), title: authSourceLabel(auth, t) }),
      ),
    ),
  )
}

function ChatHeader() {
  const t = useT()
  const activeId = useChat(state => state.activeId)
  const conversations = useChat(state => state.conversations)
  const auth = useChat(state => state.auth)
  const sidebarOpen = useChat(state => state.sidebarOpen)
  const conversation = conversations.find(item => item.id === activeId)
  const canHandoff = useChat(state => state.bootData?.handoff?.enabled !== false)
  return h('header', { className: 'dsc-header' },
    h('div', { className: 'dsc-header-left' },
      !sidebarOpen
        ? h('button', {
            type: 'button', className: 'dsc-icon-button dsc-header-menu',
            title: t('expandSidebar'), 'aria-label': t('expandSidebar'),
            onClick: () => chatStore.set({ sidebarOpen: true }),
          }, h(Icon, { name: 'menu', size: 18 }))
        : null,
      h('div', { className: 'dsc-header-title' }, conversation?.title || t('newChatTitle')),
    ),
    h('div', { className: 'dsc-header-right' },
      auth?.ready === false
        ? h('button', {
            type: 'button', className: 'dsc-auth-pill is-missing', title: t('noAuthTitle'),
            onClick: () => chatStore.set({ settingsOpen: true }),
          }, h(Icon, { name: 'warning', size: 13 }), h('span', null, t('authMissing')))
        : null,
      h('button', {
        type: 'button',
        className: 'dsc-handoff-button',
        title: canHandoff ? t('handoffSubtitle') : t('handoffUnavailable'),
        disabled: !canHandoff,
        onClick: () => { void chatActions.openHandoff() },
      }, h(Icon, { name: 'agent', size: 15 }), h('span', { className: 'dsc-handoff-label' }, t('handoff'))),
    ),
  )
}

/**
 * The shared Chat | Agent navigation. It is registered in the frame-wide
 * overlay (root scope, outside every column), so it is part of the shell
 * chrome rather than of either view: it sits in the desktop caption row above
 * the window's drag strip, stays visible in both modes, and switches the whole
 * application view.
 */
function ModeSwitch() {
  const t = useT()
  const open = useChat(state => state.open)
  const item = (mode, label, icon, selected) => h('button', {
    type: 'button',
    role: 'tab',
    'aria-selected': selected,
    className: cx('dsc-modeswitch-item', selected && 'is-active'),
    title: mode === 'chat' ? t('switchToChat') : t('switchToAgent'),
    onClick: () => chatActions.setMode(mode),
  }, h(Icon, { name: icon, size: 14 }), h('span', { className: 'dsc-modeswitch-label' }, label))
  return h('div', { className: 'dsc-modeswitch', role: 'tablist', 'aria-label': t('modeSwitchLabel') },
    item('chat', t('chatMode'), 'chat', open),
    item('agent', t('agentMode'), 'agent', !open),
  )
}

function ChatRoot() {
  const t = useT()
  const open = useChat(state => state.open)
  const boot = useChat(state => state.boot)
  const bootError = useChat(state => state.bootError)
  const settingsOpen = useChat(state => state.settingsOpen)
  const confirm = useChat(state => state.confirm)
  const handoff = useChat(state => state.handoff)
  const sidebarOpen = useChat(state => state.sidebarOpen)
  const sidebarRef = React.useRef(null)
  React.useEffect(() => {
    if (!open) return
    const node = sidebarRef.current
    if (node) node.inert = !sidebarOpen
  }, [open, sidebarOpen])
  React.useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (confirm !== null) {
        chatStore.set({ confirm: null })
        return
      }
      if (chatStore.state.handoff !== null) {
        chatActions.closeHandoff()
        return
      }      if (settingsOpen) chatStore.set({ settingsOpen: false })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, settingsOpen, confirm])
  if (!open) return null
  return h('div', {
    className: 'dsc-root', role: 'region', 'aria-label': t('appTitle'), tabIndex: -1,
    'data-dsc-mode': 'chat',
  },
    h('div', {
      className: cx('dsc-sidebar', sidebarOpen && 'is-open'),
      'aria-hidden': !sidebarOpen ? 'true' : undefined,
      ref: sidebarRef,
    }, h(Sidebar, null)),
    sidebarOpen ? h('button', {
      type: 'button', className: 'dsc-sidebar-backdrop', 'aria-label': t('close'),
      onClick: () => chatStore.set({ sidebarOpen: false }),
    }) : null,
    h('main', { className: 'dsc-main' },
      boot === 'ready'
        ? h('div', { className: 'dsc-main-column' }, h(ChatHeader, null), h(Thread, null), h(Composer, null))
        : h(BootView, { error: bootError, onRetry: () => { void chatActions.ensureBoot(true) } }),
    ),
    settingsOpen ? h(SettingsDialog, null) : null,
    confirm !== null ? h(ConfirmDialog, null) : null,
    handoff !== null ? h(HandoffDialog, null) : null,
    h(Toasts, null),
  )
}

/* ---- 55-dialogs.js ---- */
function BootView({ error, onRetry }) {
  const t = useT()
  if (error !== '') {
    return h('div', { className: 'dsc-boot' },
      h('div', { className: 'dsc-boot-card' },
        h('span', { className: 'dsc-boot-icon' }, h(Icon, { name: 'warning', size: 22 })),
        h('h2', null, t('loadFailed')),
        h('p', null, error),
        h('button', { type: 'button', className: 'dsc-primary-button', onClick: onRetry }, t('retry')),
      ),
    )
  }
  return h('div', { className: 'dsc-boot' },
    h(Spinner, { size: 24 }),
    h('div', { className: 'dsc-boot-text' }, t('loading')),
  )
}

function Switch({ checked, onChange, label }) {
  return h('button', {
    type: 'button',
    role: 'switch',
    'aria-checked': checked,
    'aria-label': label,
    className: cx('dsc-switch', checked && 'is-on'),
    onClick: () => onChange(!checked),
  }, h('span', { className: 'dsc-switch-thumb' }))
}

function SettingsSection({ title, children }) {
  return h('section', { className: 'dsc-settings-section' },
    h('h3', { className: 'dsc-settings-title' }, title),
    h('div', { className: 'dsc-settings-card' }, children),
  )
}

function SettingsDialog() {
  const t = useT()
  const auth = useChat(state => state.auth)
  const settings = useChat(state => state.settings)
  const bootData = useChat(state => state.bootData)
  const [keyInput, setKeyInput] = React.useState('')
  const [prompt, setPrompt] = React.useState(settings.systemPrompt)
  const [savingKey, setSavingKey] = React.useState(false)
  const [savingPrompt, setSavingPrompt] = React.useState(false)
  React.useEffect(() => {
    setPrompt(settings.systemPrompt)
  }, [settings.systemPrompt])
  const close = () => chatStore.set({ settingsOpen: false })
  const saveKey = async () => {
    const value = keyInput.trim()
    if (value === '') return
    setSavingKey(true)
    try {
      await chatActions.saveKey(value)
      setKeyInput('')
    } catch (error) {
      chatStore.toast(tr('authSaveFailed', { message: error instanceof Error ? error.message : String(error) }), 'error')
    } finally {
      setSavingKey(false)
    }
  }
  const clearKey = async () => {
    setSavingKey(true)
    try {
      await chatActions.clearKey()
    } catch (error) {
      chatStore.toast(tr('authSaveFailed', { message: error instanceof Error ? error.message : String(error) }), 'error')
    } finally {
      setSavingKey(false)
    }
  }
  const savePrompt = async () => {
    setSavingPrompt(true)
    try {
      await chatActions.saveSettings({ systemPrompt: prompt }, { quiet: false })
    } finally {
      setSavingPrompt(false)
    }
  }
  const mode = settings.authMode
  return h('div', {
    className: 'dsc-modal-backdrop',
    onMouseDown: (event) => { if (event.target === event.currentTarget) close() },
  },
    h('div', { className: 'dsc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('settingsTitle') },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('settingsTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('modeSwitchHint')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, onClick: close,
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        h(SettingsSection, { title: t('connection') },
          h('div', { className: cx('dsc-auth-status', auth?.ready ? 'is-ready' : 'is-missing') },
            h('span', { className: 'dsc-auth-dot' }),
            h('div', { className: 'dsc-auth-status-body' },
              h('strong', null, auth?.ready ? t('authReady') : t('authMissing')),
              h('span', null, authSourceLabel(auth, t)),
              h('span', { className: 'dsc-auth-sub' }, auth?.accountSignedIn ? t('authAccountSignedIn') : t('authAccountSignedOut')),
              auth?.dshKeyConfigured ? h('span', { className: 'dsc-auth-sub' }, `${t('authSourceDshKey')} · ${t('apiKeyConfigured')}`) : null,
            ),
          ),
          h('div', { className: 'dsc-field' },
            h('span', { className: 'dsc-field-label' }, t('authMode')),
            h('div', { className: 'dsc-segment', role: 'group', 'aria-label': t('authMode') },
              [['auto', 'authAuto'], ['account', 'authAccount'], ['api-key', 'authApiKey']].map(([value, key]) => (
                h('button', {
                  key: value,
                  type: 'button',
                  className: cx('dsc-segment-button', mode === value && 'is-active'),
                  'aria-pressed': mode === value,
                  onClick: () => { void chatActions.saveSettings({ authMode: value }) },
                }, t(key))
              )),
            ),
          ),
          h('div', { className: 'dsc-field' },
            h('span', { className: 'dsc-field-label' }, t('apiKeyLabel')),
            auth?.chatKeyConfigured
              ? h('div', { className: 'dsc-key-row' },
                  h('span', { className: 'dsc-key-state' }, t('apiKeyConfigured')),
                  h('button', {
                    type: 'button', className: 'dsc-secondary-button', disabled: savingKey,
                    onClick: clearKey,
                  }, t('clear')),
                )
              : h('div', { className: 'dsc-key-row' },
                  h('input', {
                    type: 'password',
                    className: 'dsc-input',
                    value: keyInput,
                    placeholder: t('apiKeyPlaceholder'),
                    autoComplete: 'off',
                    spellCheck: false,
                    disabled: savingKey || auth?.canStoreKey === false,
                    onChange: (event) => setKeyInput(event.target.value),
                    onKeyDown: (event) => { if (event.key === 'Enter') { event.preventDefault(); void saveKey() } },
                  }),
                  h('button', {
                    type: 'button', className: 'dsc-primary-button', disabled: savingKey || keyInput.trim() === '' || auth?.canStoreKey === false,
                    onClick: () => { void saveKey() },
                  }, savingKey ? t('saving') : t('save')),
                ),
            h('p', { className: 'dsc-field-hint' }, t('apiKeyHint')),
          ),
        ),
        h(SettingsSection, { title: t('defaults') },
          h('div', { className: 'dsc-switch-row' },
            h('div', { className: 'dsc-switch-copy' },
              h('strong', null, t('defaultThinking')),
              h('span', null, t('deepThink')),
            ),
            h(Switch, { checked: settings.thinking, onChange: () => chatActions.toggleThinking(), label: t('defaultThinking') }),
          ),
          h('div', { className: 'dsc-switch-row' },
            h('div', { className: 'dsc-switch-copy' },
              h('strong', null, t('defaultSearch')),
              h('span', null, t('webSearch')),
            ),
            h(Switch, { checked: settings.search, onChange: () => chatActions.toggleSearch(), label: t('defaultSearch') }),
          ),
        ),
        h(SettingsSection, { title: t('systemPrompt') },
          h('textarea', {
            className: 'dsc-textarea dsc-prompt',
            value: prompt,
            rows: 4,
            maxLength: 8000,
            placeholder: t('systemPromptPlaceholder'),
            onChange: (event) => setPrompt(event.target.value),
          }),
          h('div', { className: 'dsc-field-actions' },
            h('p', { className: 'dsc-field-hint' }, t('systemPromptHint')),
            h('button', {
              type: 'button', className: 'dsc-secondary-button',
              disabled: savingPrompt || prompt === settings.systemPrompt,
              onClick: () => { void savePrompt() },
            }, savingPrompt ? t('saving') : t('save')),
          ),
        ),
        h(SettingsSection, { title: t('data') },
          h('div', { className: 'dsc-data-row' },
            h('span', { className: 'dsc-field-label' }, t('storagePath')),
            h('code', { className: 'dsc-path' }, bootData?.dataDir ?? ''),
          ),
          h('p', { className: 'dsc-field-hint' }, t('dataNote')),
        ),
        h(SettingsSection, { title: t('about') },
          h('div', { className: 'dsc-about-row' },
            h('span', null, t('modelLabel')),
            h('strong', null, bootData?.model?.name ?? t('modelName')),
          ),
          h('p', { className: 'dsc-field-hint' }, t('aboutText')),
          h('p', { className: 'dsc-field-hint' }, `${t('limitations')}：${t('limitationsText')}`),
        ),
      ),
    ),
  )
}

/**
 * Chat → Agent handoff: draft an editable task brief from this conversation,
 * create a real Agent Session in the chosen Workspace, and switch the shell to
 * Agent mode on that Session.
 */
function HandoffDialog() {
  const t = useT()
  const handoff = useChat(state => state.handoff)
  const workspaces = useChat(state => state.workspaces)
  const hostReady = useChat(state => state.bootData?.handoff !== undefined)
  const [copied, setCopied] = React.useState(false)
  if (handoff === null) return null
  const close = () => chatActions.closeHandoff()
  const brief = handoff.brief ?? ''
  const canSend = hostReady && brief.trim() !== '' && !handoff.busy && !handoff.generating
  const copy = () => {
    copyToClipboard(brief).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }).catch(() => chatStore.toast(t('copyFailed'), 'error'))
  }
  return h('div', {
    className: 'dsc-modal-backdrop',
    onMouseDown: (event) => { if (event.target === event.currentTarget) close() },
  },
    h('div', { className: 'dsc-modal dsc-handoff', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('handoffTitle') },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('handoffTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('handoffSubtitle')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, onClick: close,
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        !hostReady
          ? h('div', { className: 'dsc-notice' }, h(Icon, { name: 'warning', size: 16 }), h('span', null, t('handoffRestart')))
          : workspaces.length === 0
            ? h('div', { className: 'dsc-notice' }, h(Icon, { name: 'warning', size: 16 }), h('span', null, t('handoffWorkspaceEmpty')))
            : h('div', { className: 'dsc-field' },
                h('span', { className: 'dsc-field-label' }, t('handoffWorkspace')),
                h('select', {
                  className: 'dsc-select',
                  value: handoff.workspaceId ?? '',
                  onChange: (event) => chatActions.setHandoffWorkspace(event.target.value),
                }, workspaces.map(workspace => h('option', { key: workspace.id, value: workspace.id }, workspace.title || workspace.path))),
                h('p', { className: 'dsc-field-hint' }, workspaces.find(workspace => workspace.id === handoff.workspaceId)?.path ?? ''),
              ),
        h('div', { className: 'dsc-field' },
          h('label', { className: 'dsc-field-label', htmlFor: 'dsc-handoff-extra' }, t('handoffExtra')),
          h('input', {
            id: 'dsc-handoff-extra',
            className: 'dsc-input',
            value: handoff.instruction ?? '',
            placeholder: t('handoffExtraPlaceholder'),
            maxLength: 4000,
            onChange: (event) => chatActions.setHandoffInstruction(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault()
                void chatActions.draftHandoff()
              }
            },
          }),
        ),
        h('div', { className: 'dsc-field' },
          h('div', { className: 'dsc-field-row' },
            h('span', { className: 'dsc-field-label' }, t('handoffEditorLabel')),
            h('div', { className: 'dsc-field-tools' },
              h('button', {
                type: 'button', className: 'dsc-text-button', disabled: handoff.generating,
                onClick: () => { void chatActions.draftHandoff() },
              }, h(Icon, { name: 'refresh', size: 14 }), t('handoffRegenerate')),
              brief.trim() === '' ? null : h('button', {
                type: 'button', className: 'dsc-text-button', onClick: copy,
              }, h(Icon, { name: copied ? 'check' : 'copy', size: 14 }), copied ? t('copied') : t('copyBrief')),
            ),
          ),
          handoff.generating
            ? h('div', { className: 'dsc-handoff-loading' }, h(Spinner, { size: 16 }), t('handoffDrafting'))
            : h('textarea', {
                className: 'dsc-textarea dsc-handoff-brief',
                value: brief,
                rows: 12,
                spellCheck: false,
                onChange: (event) => chatActions.setHandoffBrief(event.target.value),
              }),
          handoff.warning !== '' && !handoff.generating
            ? h('p', { className: 'dsc-field-hint' }, `${t('handoffLocal')} ${t('handoffShortcut')}`)
            : h('p', { className: 'dsc-field-hint' }, t('handoffShortcut')),
          handoff.error !== ''
            ? h('div', { className: 'dsc-notice is-error' }, h(Icon, { name: 'warning', size: 15 }), h('span', null, handoff.error))
            : null,
        ),
      ),
      h('footer', { className: 'dsc-modal-foot' },
        h('div', { className: 'dsc-modal-foot-note' }, workspaces.length === 0 ? t('handoffWorkspaceEmpty') : ''),
        h('button', { type: 'button', className: 'dsc-secondary-button', onClick: close }, t('cancel')),
        h('button', {
          type: 'button',
          className: 'dsc-primary-button',
          disabled: !canSend || workspaces.length === 0,
          onClick: () => { void chatActions.submitHandoff() },
        }, handoff.busy ? t('handoffSending') : t('handoffSend')),      ),
    ),
  )
}

function ConfirmDialog() {
  const t = useT()
  const confirm = useChat(state => state.confirm)
  if (confirm === null) return null
  const run = async () => {
    const action = confirm.onConfirm
    chatStore.set({ confirm: null })
    try {
      await action()
    } catch (error) {
      chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
    }
  }
  return h('div', {
    className: 'dsc-modal-backdrop',
    onMouseDown: (event) => { if (event.target === event.currentTarget) chatStore.set({ confirm: null }) },
  },
    h('div', { className: 'dsc-confirm', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': confirm.title },
      h('h2', null, confirm.title),
      h('p', null, confirm.message),
      h('div', { className: 'dsc-confirm-actions' },
        h('button', {
          type: 'button', className: 'dsc-secondary-button', autoFocus: true,
          onClick: () => chatStore.set({ confirm: null }),
        }, t('cancel')),
        h('button', {
          type: 'button', className: cx('dsc-primary-button', confirm.danger && 'is-danger'),
          onClick: () => { void run() },
        }, confirm.confirmLabel || t('confirm')),
      ),
    ),
  )
}

function Toasts() {
  const toasts = useChat(state => state.toasts)
  if (toasts.length === 0) return null
  return h('div', { className: 'dsc-toasts', role: 'status', 'aria-live': 'polite' },
    toasts.map(toast => h('div', { key: toast.id, className: cx('dsc-toast', `is-${toast.kind}`) },
      h(Icon, { name: toast.kind === 'error' || toast.kind === 'warning' ? 'warning' : 'check', size: 16 }),
      h('span', null, toast.message),
    )),
  )
}

/* ---- 60-style.js ---- */
const CHAT_CSS = `
/* ==========================================================================
   DeepSeek Chat mode — shell-coordinated surfaces.

   Placement contract with DeepSeek Harness:
   * the Chat view is a frame-wide layer that starts BELOW the platform chrome
     (--dsh-frame-chrome-top: the Windows caption row / the macOS top strip),
     so the native menu, sidebar toggle and window controls stay usable;
   * the shared Chat | Agent switch lives in that chrome row, centered, and
     never overlaps the native menu or the window buttons;
   * every colour, radius and motion value comes from the Harness theme.
   ========================================================================== */
.dsc-root {
  --dsc-brand: var(--dsw-alias-brand-primary, var(--dsw-static-deepseek-500, #4d6bff));
  --dsc-link: var(--dsw-alias-link, var(--dsw-alias-brand-primary, #4d6bff));
  --dsc-on-brand: var(--dsw-alias-label-on-color, #ffffff);
  --dsc-bg: var(--dsw-alias-bg-base, #ffffff);
  --dsc-layer: var(--dsw-alias-bg-layer-1, #ffffff);
  --dsc-layer2: var(--dsw-alias-bg-layer-2, #f2f3f7);
  --dsc-sidebar: var(--dsw-specific-sidebar-fill, #f7f8fc);
  --dsc-text: var(--dsw-alias-label-primary, #16181d);
  --dsc-muted: var(--dsw-alias-label-secondary, #6b7280);
  --dsc-border: var(--dsw-alias-border-l1, rgba(15, 23, 42, 0.08));
  --dsc-border-strong: var(--dsw-alias-border-l2, rgba(15, 23, 42, 0.14));
  --dsc-hover: color-mix(in srgb, var(--dsc-text) 5.5%, transparent);
  --dsc-active: color-mix(in srgb, var(--dsc-text) 9%, transparent);
  --dsc-brand-soft: color-mix(in srgb, var(--dsc-link) 11%, transparent);
  --dsc-brand-soft-strong: color-mix(in srgb, var(--dsc-link) 18%, transparent);
  --dsc-user-bubble: color-mix(in srgb, var(--dsc-link) 9%, var(--dsc-layer2));
  --dsc-code-bg: color-mix(in srgb, var(--dsc-text) 4%, var(--dsc-layer2));
  --dsc-error: var(--dsw-alias-state-error-primary, #d33d3d);
  --dsc-warn: var(--dsw-alias-state-warn-primary, #b45309);
  --dsc-success: var(--dsw-alias-state-success-primary, #15803d);
  --dsc-shadow: 0 20px 48px rgba(9, 12, 20, 0.18);
  --dsc-shadow-soft: 0 4px 16px rgba(9, 12, 20, 0.07);
  --dsc-shadow-composer: 0 2px 10px rgba(9, 12, 20, 0.05);
  --dsc-radius: var(--dsw-radius-md, 12px);
  --dsc-font: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif);
  --dsc-mono: var(--ds-font-family-code, 'SF Mono', Consolas, 'Liberation Mono', monospace);
  --dsc-ease: var(--ds-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
  --dsc-fast: var(--ds-transition-duration-fast, 0.1s);
  position: fixed;
  top: var(--dsh-frame-chrome-top, 0px);
  right: 0;
  bottom: 0;
  left: 0;
  /* Above the mode switch so an open dialog backdrop also covers it; the box
     itself starts below the caption row, so the switch stays clickable. */
  z-index: 30;
  display: flex;
  overflow: hidden;
  background: var(--dsc-bg);
  color: var(--dsc-text);
  font-family: var(--dsc-font);
  font-size: 14px;
  line-height: 1.55;
  pointer-events: auto;
  -webkit-font-smoothing: antialiased;
}
.dsc-root *,
.dsc-root *::before,
.dsc-root *::after { box-sizing: border-box; }
.dsc-root :where(button, input, textarea, select) { font: inherit; color: inherit; }
.dsc-root button { cursor: pointer; }
.dsc-root button:disabled { cursor: default; }
.dsc-root ::selection { background: var(--dsc-brand-soft-strong); }
.dsc-root :focus-visible { outline: 2px solid var(--dsc-brand); outline-offset: 2px; border-radius: 6px; }
.dsc-icon { display: block; flex: none; }
.dsc-spinner {
  display: inline-block;
  border: 2px solid var(--dsc-border-strong);
  border-top-color: var(--dsc-brand);
  border-radius: 999px;
  animation: dsc-spin 0.8s linear infinite;
}
@keyframes dsc-spin { to { transform: rotate(360deg); } }

/* ---------- shared Chat | Agent switch (shell chrome) ---------- */
.dsc-modeswitch {
  position: fixed;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 34px;
  padding: 3px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(15, 23, 42, 0.1));
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 8%, transparent);
  color: var(--dsw-alias-label-primary, #16181d);
  font-family: var(--dsw-font-family, -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif);
  font-size: 13px;
  line-height: 1;
  -webkit-app-region: no-drag;
  pointer-events: auto;
  user-select: none;
  backdrop-filter: blur(10px);
}
/* Windows Electron reserves a 40px caption row; the switch sits in it. */
html[data-windows-titlebar] .dsc-modeswitch { top: 4px; height: 32px; }
html[data-platform='darwin'] .dsc-modeswitch { top: 9px; }
html[data-windows-titlebar][data-fullscreen] .dsc-modeswitch { top: 8px; }
.dsc-modeswitch-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 13px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 12.8px;
  font-weight: 550;
  transition: background var(--ds-transition-duration-fast, 0.1s) ease, color var(--ds-transition-duration-fast, 0.1s) ease;
}
.dsc-modeswitch-item:hover { color: var(--dsw-alias-label-primary, #16181d); }
.dsc-modeswitch-item.is-active {
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #16181d);
  box-shadow: 0 1px 2px rgba(9, 12, 20, 0.14), 0 0 0 0.5px rgba(9, 12, 20, 0.06);
}
.dsc-modeswitch-label { white-space: nowrap; }

/* ---------- sidebar ---------- */
.dsc-sidebar {
  width: 264px;
  flex: 0 0 264px;
  min-height: 0;
  background: var(--dsc-sidebar);
  border-right: 1px solid var(--dsc-border);
  overflow: hidden;
}
.dsc-sidebar:not(.is-open) { display: none; }
.dsc-sidebar-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 10px 8px 8px;
}
.dsc-sidebar-top { flex: none; display: flex; flex-direction: column; gap: 8px; padding: 0 2px; }
.dsc-sidebar-actions { display: flex; align-items: center; gap: 6px; height: 36px; }
.dsc-new-chat {
  flex: 1;
  min-width: 0;
  height: 36px;
  padding: 0 11px;
  border: 1px solid var(--dsc-border);
  border-radius: 10px;
  background: var(--dsc-layer);
  color: var(--dsc-text);
  font-size: 13.3px;
  font-weight: 560;
  display: flex;
  align-items: center;
  gap: 7px;
  text-align: left;
  transition: background var(--dsc-fast) ease, border-color var(--dsc-fast) ease;
}
.dsc-new-chat:hover { background: color-mix(in srgb, var(--dsc-layer) 60%, var(--dsc-layer2)); border-color: var(--dsc-border-strong); }
.dsc-sidebar-collapse { flex: none; }
.dsc-search {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsc-text) 4%, transparent);
  color: var(--dsc-muted);
  cursor: text;
  transition: background var(--dsc-fast) ease, border-color var(--dsc-fast) ease;
}
.dsc-search:hover { background: color-mix(in srgb, var(--dsc-text) 6%, transparent); }
.dsc-search:focus-within { border-color: var(--dsc-border-strong); background: var(--dsc-layer); }
.dsc-search-input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 12.9px; color: var(--dsc-text); }
.dsc-search-input::placeholder { color: var(--dsc-muted); }
.dsc-chat-list { flex: 1; min-height: 0; overflow-y: auto; padding: 6px 2px 10px; }
.dsc-chat-group { margin-top: 14px; }
.dsc-chat-group:first-child { margin-top: 4px; }
.dsc-chat-group-label {
  padding: 0 8px 5px;
  font-size: 11.4px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--dsc-muted);
}
.dsc-chat-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 8px;
  margin: 1px 0;
  border-radius: 9px;
  cursor: pointer;
  transition: background var(--dsc-fast) ease;
}
.dsc-chat-item:hover { background: var(--dsc-hover); }
.dsc-chat-item.is-active { background: var(--dsc-active); }
.dsc-chat-item-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13.1px;
  font-weight: 455;
}
.dsc-chat-item.is-active .dsc-chat-item-title { font-weight: 550; }
.dsc-chat-item-time { flex: none; font-size: 11px; color: var(--dsc-muted); }
.dsc-chat-item-actions {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  align-items: center;
  gap: 1px;
  padding-left: 14px;
  background: linear-gradient(to right, transparent, var(--dsc-sidebar) 30%);
}
.dsc-chat-item:hover .dsc-chat-item-actions,
.dsc-chat-item.is-active .dsc-chat-item-actions { display: flex; }
.dsc-chat-item:hover .dsc-chat-item-time,
.dsc-chat-item.is-active .dsc-chat-item-time { visibility: hidden; }
.dsc-chat-item.is-renaming { background: var(--dsc-layer); border: 1px solid var(--dsc-border-strong); }
.dsc-rename-input {
  width: 100%;
  height: 30px;
  padding: 0 2px;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 13px;
}
.dsc-list-empty { padding: 22px 10px; text-align: center; color: var(--dsc-muted); font-size: 12.4px; line-height: 1.6; }
.dsc-sidebar-foot {
  flex: none;
  padding-top: 6px;
  border-top: 1px solid var(--dsc-border);
}
.dsc-foot-action {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  height: 34px;
  padding: 0 9px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  font-size: 12.9px;
  color: var(--dsc-muted);
  text-align: left;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease;
}
.dsc-foot-action:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-auth-dot { width: 7px; height: 7px; border-radius: 999px; margin-left: auto; background: var(--dsc-warn); }
.dsc-auth-dot.is-ready { background: var(--dsc-success); }
.dsc-auth-dot.is-missing { background: var(--dsc-warn); }

/* ---------- main column ---------- */
.dsc-main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; background: var(--dsc-bg); }
.dsc-main-column { flex: 1; display: flex; flex-direction: column; height: 100%; min-height: 0; }
.dsc-header {
  flex: none;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px 0 16px;
  border-bottom: 1px solid var(--dsc-border);
  background: color-mix(in srgb, var(--dsc-bg) 88%, transparent);
  backdrop-filter: blur(14px);
  z-index: 3;
}
.dsc-header-left { display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1; }
.dsc-header-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 560;
  letter-spacing: -0.005em;
}
.dsc-header-right { display: flex; align-items: center; gap: 6px; flex: none; }
.dsc-header-menu { margin-left: -6px; }
.dsc-handoff-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 11px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 9px;
  background: var(--dsc-layer);
  color: var(--dsc-text);
  font-size: 12.6px;
  font-weight: 550;
  white-space: nowrap;
  transition: background var(--dsc-fast) ease, border-color var(--dsc-fast) ease;
}
.dsc-handoff-button:hover { background: var(--dsc-hover); border-color: var(--dsc-border-strong); }
.dsc-handoff-button:disabled { opacity: 0.42; }
.dsc-auth-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 27px;
  padding: 0 9px;
  border: 1px solid color-mix(in srgb, var(--dsc-warn) 26%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsc-warn) 8%, transparent);
  color: var(--dsc-warn);
  font-size: 11.4px;
  font-weight: 600;
}
.dsc-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--dsc-muted);
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease;
}
.dsc-icon-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-icon-button.is-small { width: 24px; height: 24px; border-radius: 6px; }
.dsc-icon-button.is-danger:hover { color: var(--dsc-error); background: color-mix(in srgb, var(--dsc-error) 9%, transparent); }

/* ---------- thread ---------- */
.dsc-thread {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 26px 20px 10px;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
}
.dsc-thread-inner {
  width: 100%;
  max-width: 788px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 26px;
}
.dsc-thread-loading { display: flex; align-items: center; justify-content: center; }
.dsc-thread-error {
  width: min(460px, 100%);
  margin: 12vh auto 0;
  padding: 20px;
  border: 1px solid var(--dsc-border);
  border-radius: 14px;
  background: var(--dsc-layer);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  box-shadow: var(--dsc-shadow-soft);
}
.dsc-thread-error-icon { color: var(--dsc-warn); display: flex; }
.dsc-thread-error strong { font-size: 14px; }
.dsc-thread-error span { font-size: 12.5px; color: var(--dsc-muted); line-height: 1.55; word-break: break-word; }
.dsc-thread-error .dsc-secondary-button { margin-top: 7px; }
.dsc-thread::-webkit-scrollbar,
.dsc-chat-list::-webkit-scrollbar,
.dsc-modal-body::-webkit-scrollbar,
.dsc-handoff-brief::-webkit-scrollbar,
.dsc-pre::-webkit-scrollbar { width: 10px; height: 10px; }
.dsc-thread::-webkit-scrollbar-thumb,
.dsc-chat-list::-webkit-scrollbar-thumb,
.dsc-modal-body::-webkit-scrollbar-thumb,
.dsc-handoff-brief::-webkit-scrollbar-thumb,
.dsc-pre::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--dsc-text) 16%, transparent);
  border: 3px solid transparent;
  background-clip: content-box;
  border-radius: 999px;
}
.dsc-thread::-webkit-scrollbar-thumb:hover,
.dsc-chat-list::-webkit-scrollbar-thumb:hover,
.dsc-modal-body::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--dsc-text) 28%, transparent); background-clip: content-box; }

/* ---------- empty state ---------- */
.dsc-empty { width: 100%; max-width: 720px; margin: 0 auto; padding: 11vh 0 20px; text-align: center; }
.dsc-empty-title {
  margin: 0 0 10px;
  font-size: clamp(25px, 2.6vw, 33px);
  font-weight: 600;
  letter-spacing: -0.022em;
  line-height: 1.22;
}
.dsc-empty-subtitle { max-width: 540px; margin: 0 auto; color: var(--dsc-muted); font-size: 14.2px; line-height: 1.72; }
.dsc-suggestions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-top: 30px; text-align: left; }
.dsc-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 13px;
  border: 1px solid var(--dsc-border);
  border-radius: 13px;
  background: var(--dsc-layer);
  text-align: left;
  transition: border-color var(--dsc-fast) ease, background var(--dsc-fast) ease, transform var(--dsc-fast) ease;
}
.dsc-suggestion:hover {
  border-color: var(--dsc-border-strong);
  background: color-mix(in srgb, var(--dsc-layer) 55%, var(--dsc-layer2));
  transform: translateY(-1px);
}
.dsc-suggestion-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dsc-brand-soft);
  color: var(--dsc-link);
  flex: none;
}
.dsc-suggestion-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.dsc-suggestion-title { font-size: 12.7px; font-weight: 600; }
.dsc-suggestion-text { font-size: 12.4px; color: var(--dsc-muted); line-height: 1.5; }
.dsc-empty-foot { margin-top: 26px; font-size: 11.6px; color: var(--dsc-muted); }
.dsc-setup-card {
  display: flex;
  align-items: center;
  gap: 11px;
  max-width: 560px;
  margin: 22px auto 0;
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, var(--dsc-warn) 22%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsc-warn) 7%, var(--dsc-layer));
  text-align: left;
}
.dsc-setup-icon { color: var(--dsc-warn); flex: none; }
.dsc-setup-body { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.dsc-setup-body strong { font-size: 12.9px; }
.dsc-setup-body span { font-size: 11.9px; color: var(--dsc-muted); }
.dsc-primary-button {
  height: 36px;
  padding: 0 15px;
  border: 0;
  border-radius: 9px;
  background: var(--dsc-brand);
  color: var(--dsc-on-brand);
  font-size: 12.9px;
  font-weight: 600;
  white-space: nowrap;
  transition: filter var(--dsc-fast) ease;
}
.dsc-primary-button:hover { filter: brightness(1.06); }
.dsc-primary-button:disabled { opacity: 0.45; }
.dsc-primary-button.is-danger { background: var(--dsc-error); }
.dsc-secondary-button {
  height: 36px;
  padding: 0 15px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 9px;
  background: transparent;
  font-size: 12.9px;
  font-weight: 550;
  white-space: nowrap;
  transition: background var(--dsc-fast) ease;
}
.dsc-secondary-button:hover { background: var(--dsc-hover); }
.dsc-secondary-button:disabled { opacity: 0.45; }
.dsc-text-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 7px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 11.9px;
  font-weight: 550;
}
.dsc-text-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-text-button:disabled { opacity: 0.45; }

/* ---------- messages ---------- */
.dsc-msg { display: flex; width: 100%; min-width: 0; }
.dsc-msg-user { justify-content: flex-end; padding-left: 10%; }
.dsc-user-bubble {
  max-width: 100%;
  padding: 10px 15px;
  border-radius: 18px;
  border-bottom-right-radius: 6px;
  background: var(--dsc-user-bubble);
  font-size: 14.6px;
  line-height: 1.68;
  overflow-wrap: anywhere;
}
.dsc-user-text { white-space: pre-wrap; word-break: break-word; }
.dsc-user-files { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 7px; }
.dsc-msg-assistant { align-items: flex-start; padding-right: 2%; }
.dsc-msg-body { flex: 1; min-width: 0; }

/* ---------- attachments ---------- */
.dsc-attach {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 260px;
  min-height: 38px;
  padding: 4px 6px;
  border: 1px solid var(--dsc-border);
  border-radius: 10px;
  background: var(--dsc-layer);
}
.dsc-attach.is-compact { max-width: 220px; min-height: 34px; padding: 3px 6px; background: transparent; }
.dsc-attach.is-error { border-color: color-mix(in srgb, var(--dsc-error) 36%, transparent); }
.dsc-attach-thumb { width: 32px; height: 32px; border-radius: 7px; object-fit: cover; flex: none; background: var(--dsc-layer2); }
.dsc-attach.is-compact .dsc-attach-thumb { width: 28px; height: 28px; }
.dsc-attach-icon {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dsc-brand-soft);
  color: var(--dsc-link);
  flex: none;
}
.dsc-attach-meta { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.dsc-attach-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.3px; font-weight: 550; }
.dsc-attach-size { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10.8px; color: var(--dsc-muted); }
.dsc-attach.is-error .dsc-attach-size { color: var(--dsc-error); }
.dsc-attach-action {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsc-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.dsc-attach-action:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-attach-rail { display: flex; flex-wrap: wrap; gap: 6px; padding: 2px 2px 8px; }

/* ---------- reasoning / process ---------- */
.dsc-process { margin: 0 0 12px; }
.dsc-process-head {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  max-width: 100%;
  min-height: 26px;
  padding: 2px 4px 2px 2px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 12.9px;
  font-weight: 550;
  text-align: left;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease;
}
.dsc-process-head:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-process-icon { color: var(--dsc-link); display: flex; }
.dsc-process-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsc-process-chevron { display: flex; color: var(--dsc-muted); }
.dsc-process-title.is-shimmer {
  background: linear-gradient(90deg, var(--dsc-muted) 0%, var(--dsc-link) 45%, var(--dsc-muted) 90%);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: dsc-shimmer 2.4s linear infinite;
}
@keyframes dsc-shimmer { from { background-position: 120% 0; } to { background-position: -120% 0; } }
.dsc-process-body { padding: 6px 0 4px 4px; }
.dsc-think-block {
  margin: 2px 0 10px;
  padding: 2px 0 2px 12px;
  border-left: 2px solid var(--dsc-border-strong);
  color: var(--dsc-muted);
  font-size: 13.2px;
  line-height: 1.72;
  max-height: 380px;
  overflow-y: auto;
}
.dsc-think-block.is-active { border-left-color: var(--dsc-brand-soft-strong); }
.dsc-think-block .dsc-md { font-size: 13.2px; line-height: 1.72; color: var(--dsc-muted); }
.dsc-step { display: flex; align-items: flex-start; gap: 8px; padding: 4px 0; }
.dsc-step-icon { color: var(--dsc-muted); padding-top: 1px; display: flex; }
.dsc-step-main { min-width: 0; flex: 1; }
.dsc-step-line { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; min-width: 0; font-size: 12.6px; }
.dsc-step-line.is-clickable { cursor: pointer; }
.dsc-step-line.is-clickable:hover .dsc-step-label { color: var(--dsc-link); }
.dsc-step-label { font-weight: 550; color: var(--dsc-text); }
.dsc-step-detail { color: var(--dsc-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 430px; }
.dsc-step-count { padding: 0 6px; border-radius: 999px; background: var(--dsc-brand-soft); color: var(--dsc-link); font-size: 10.8px; font-weight: 600; }
.dsc-step-pending { color: var(--dsc-link); font-size: 11.4px; }
.dsc-step-failed { color: var(--dsc-error); font-size: 11.4px; }
.dsc-step-page {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  margin-top: 3px;
  color: var(--dsc-link);
  font-size: 12px;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsc-step-page:hover { text-decoration: underline; }
.dsc-result-list { display: flex; flex-direction: column; gap: 5px; margin: 5px 0 3px; }
.dsc-result {
  display: block;
  padding: 7px 9px;
  border: 1px solid var(--dsc-border);
  border-radius: 9px;
  background: var(--dsc-layer);
  text-decoration: none;
  color: var(--dsc-text);
}
.dsc-result:hover { border-color: var(--dsc-border-strong); background: var(--dsc-hover); }
.dsc-result-title { display: block; font-size: 12.3px; font-weight: 550; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsc-result-meta { display: block; margin-top: 1px; font-size: 10.8px; color: var(--dsc-muted); }
.dsc-result-snippet {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 2px;
  font-size: 11.8px;
  line-height: 1.55;
  color: var(--dsc-muted);
}
.dsc-result-empty { padding: 5px 0; font-size: 12px; color: var(--dsc-muted); }

/* ---------- markdown ---------- */
.dsc-md { font-size: 15px; line-height: 1.78; word-break: break-word; }
.dsc-md > *:first-child { margin-top: 0; }
.dsc-md > *:last-child { margin-bottom: 0; }
.dsc-paragraph { margin: 0 0 12px; white-space: pre-wrap; }
.dsc-heading { margin: 22px 0 9px; line-height: 1.32; letter-spacing: -0.012em; font-weight: 620; }
h1.dsc-heading { font-size: 22px; }
h2.dsc-heading { font-size: 19px; }
h3.dsc-heading { font-size: 16.5px; }
h4.dsc-heading, h5.dsc-heading, h6.dsc-heading { font-size: 15px; }
.dsc-link { color: var(--dsc-link); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--dsc-link) 32%, transparent); }
.dsc-link:hover { border-bottom-color: var(--dsc-link); }
.dsc-inline-code {
  padding: 1.5px 5px;
  border-radius: 5px;
  background: var(--dsc-code-bg);
  font-family: var(--dsc-mono);
  font-size: 0.875em;
}
.dsc-code {
  margin: 13px 0;
  border: 1px solid var(--dsc-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--dsc-code-bg);
}
.dsc-code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 33px;
  padding: 0 8px 0 12px;
  border-bottom: 1px solid var(--dsc-border);
  background: color-mix(in srgb, var(--dsc-text) 2%, transparent);
}
.dsc-code-lang { font-size: 11.4px; color: var(--dsc-muted); font-weight: 600; text-transform: lowercase; letter-spacing: 0.02em; }
.dsc-code-copy {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 7px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 11.4px;
}
.dsc-code-copy:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-pre { margin: 0; padding: 13px 14px; overflow-x: auto; font-size: 12.7px; line-height: 1.66; }
.dsc-pre code { font-family: var(--dsc-mono); white-space: pre; }
.dsc-quote { margin: 12px 0; padding: 2px 14px; border-left: 3px solid var(--dsc-brand-soft-strong); color: var(--dsc-muted); white-space: pre-wrap; }
.dsc-list { margin: 8px 0 12px; padding-left: 22px; }
.dsc-list li { margin: 3px 0; }
.dsc-list li::marker { color: var(--dsc-muted); }
.dsc-table-wrap { overflow-x: auto; margin: 13px 0; border: 1px solid var(--dsc-border); border-radius: 10px; }
.dsc-table { border-collapse: collapse; width: 100%; font-size: 13px; }
.dsc-table th, .dsc-table td { padding: 7px 11px; border-bottom: 1px solid var(--dsc-border); text-align: left; vertical-align: top; }
.dsc-table th { background: color-mix(in srgb, var(--dsc-text) 3%, transparent); font-weight: 600; }
.dsc-table tr:last-child td { border-bottom: 0; }
.dsc-hr { border: 0; border-top: 1px solid var(--dsc-border); margin: 20px 0; }
.dsc-caret {
  display: inline-block;
  width: 2px;
  height: 15px;
  margin-left: 2px;
  border-radius: 1px;
  background: var(--dsc-brand);
  vertical-align: -2px;
  animation: dsc-blink 1.1s steps(2, start) infinite;
}
@keyframes dsc-blink { 50% { opacity: 0; } }

/* ---------- sources ---------- */
.dsc-sources { margin-top: 16px; }
.dsc-sources-head { display: flex; align-items: center; gap: 5px; margin-bottom: 7px; font-size: 11.9px; font-weight: 600; color: var(--dsc-muted); }
.dsc-source-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
.dsc-source {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 9px;
  border: 1px solid var(--dsc-border);
  border-radius: 10px;
  background: var(--dsc-layer);
  color: var(--dsc-text);
  text-decoration: none;
  min-width: 0;
  transition: border-color var(--dsc-fast) ease, background var(--dsc-fast) ease;
}
.dsc-source:hover { border-color: var(--dsc-border-strong); background: color-mix(in srgb, var(--dsc-layer) 60%, var(--dsc-layer2)); }
.dsc-source-index {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: var(--dsc-brand-soft);
  color: var(--dsc-link);
  font-size: 10.4px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  margin-top: 1px;
}
.dsc-source-body { display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 1px; }
.dsc-source-title {
  font-size: 12px;
  font-weight: 550;
  line-height: 1.42;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.dsc-source-meta { font-size: 10.5px; color: var(--dsc-muted); }
.dsc-source-snippet {
  font-size: 11px;
  color: var(--dsc-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.dsc-source .dsc-icon { color: var(--dsc-muted); margin-top: 2px; }

/* ---------- message actions / notices ---------- */
.dsc-msg-actions { display: flex; align-items: center; gap: 2px; margin-top: 7px; opacity: 0; transition: opacity var(--dsc-fast) ease; }
.dsc-msg-assistant:hover .dsc-msg-actions,
.dsc-msg-actions.is-last { opacity: 1; }
.dsc-msg-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 7px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 11.7px;
}
.dsc-msg-action:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-usage { font-size: 10.8px; color: var(--dsc-muted); margin-left: 6px; }
.dsc-notice {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 8px 0;
  padding: 9px 11px;
  border: 1px solid color-mix(in srgb, var(--dsc-warn) 22%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsc-warn) 7%, transparent);
  color: var(--dsc-warn);
  font-size: 12.7px;
  line-height: 1.55;
}
.dsc-notice.is-error {
  border-color: color-mix(in srgb, var(--dsc-error) 22%, transparent);
  background: color-mix(in srgb, var(--dsc-error) 7%, transparent);
  color: var(--dsc-error);
}
.dsc-notice .dsc-icon { margin-top: 1px; }
.dsc-muted-note { margin: 6px 0; font-size: 12.4px; color: var(--dsc-muted); }
.dsc-inline-button {
  border: 0;
  background: transparent;
  color: var(--dsc-link);
  font-size: inherit;
  font-weight: 600;
  padding: 0 2px;
  text-decoration: underline;
}
.dsc-typing { display: inline-flex; align-items: center; gap: 4px; padding: 8px 0 3px; }
.dsc-typing-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--dsc-brand); opacity: 0.35; animation: dsc-dot 1.2s ease-in-out infinite; }
.dsc-typing-dot:nth-child(2) { animation-delay: 0.15s; }
.dsc-typing-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes dsc-dot { 0%, 80%, 100% { opacity: 0.25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }

/* ---------- composer ---------- */
.dsc-composer-wrap {
  flex: none;
  width: 100%;
  max-width: 836px;
  margin: 0 auto;
  padding: 6px 20px 12px;
  background: linear-gradient(to top, var(--dsc-bg) 74%, transparent);
}
.dsc-auth-banner {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 auto 8px;
  max-width: 788px;
  padding: 8px 12px;
  border: 1px solid color-mix(in srgb, var(--dsc-warn) 22%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsc-warn) 7%, var(--dsc-layer));
  color: var(--dsc-warn);
  font-size: 12.2px;
}
.dsc-auth-banner span { flex: 1; }
.dsc-composer {
  position: relative;
  max-width: 788px;
  margin: 0 auto;
  padding: 10px 12px 8px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 24px;
  background: var(--dsc-layer);
  box-shadow: var(--dsc-shadow-composer);
  transition: border-color var(--dsc-fast) ease, box-shadow var(--dsc-fast) ease;
}
.dsc-composer:focus-within {
  border-color: color-mix(in srgb, var(--dsc-brand) 45%, var(--dsc-border-strong));
  box-shadow: 0 0 0 3px var(--dsc-brand-soft), var(--dsc-shadow-soft);
}
.dsc-composer.is-drag { border-color: var(--dsc-brand); }
.dsc-textarea {
  display: block;
  width: 100%;
  min-height: 42px;
  max-height: 220px;
  padding: 5px 6px 2px;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  font-size: 14.8px;
  line-height: 1.62;
}
.dsc-textarea::placeholder { color: var(--dsc-muted); }
.dsc-composer-tools { display: flex; align-items: center; gap: 3px; margin-top: 2px; }
.dsc-file-input { display: none; }
.dsc-tool-button {
  width: 33px;
  height: 33px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--dsc-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease;
}
.dsc-tool-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-mode-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 29px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 12.3px;
  font-weight: 520;
  white-space: nowrap;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease, border-color var(--dsc-fast) ease;
}
.dsc-mode-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-mode-button.is-active {
  background: var(--dsc-brand-soft);
  border-color: color-mix(in srgb, var(--dsc-brand) 16%, transparent);
  color: var(--dsc-link);
}
.dsc-tool-spacer { flex: 1; }
.dsc-model-pill {
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 8px;
  color: var(--dsc-muted);
  font-size: 11.8px;
  font-weight: 500;
}
.dsc-send-button {
  width: 33px;
  height: 33px;
  border: 0;
  border-radius: 999px;
  background: var(--dsc-brand);
  color: var(--dsc-on-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  transition: filter var(--dsc-fast) ease, opacity var(--dsc-fast) ease;
}
.dsc-send-button:hover { filter: brightness(1.07); }
.dsc-send-button.is-idle { opacity: 0.4; }
.dsc-stop-button {
  width: 33px;
  height: 33px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 999px;
  background: var(--dsc-layer2);
  color: var(--dsc-text);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.dsc-stop-button:hover { background: var(--dsc-hover); }
.dsc-drop-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px dashed var(--dsc-brand);
  border-radius: 22px;
  background: color-mix(in srgb, var(--dsc-brand) 8%, var(--dsc-layer));
  color: var(--dsc-link);
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
}
.dsc-disclaimer { margin-top: 7px; text-align: center; font-size: 10.9px; color: var(--dsc-muted); }

/* ---------- dialogs ---------- */
.dsc-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--dsw-alias-bg-mask-1, color-mix(in srgb, #0b0f19 46%, transparent));
  backdrop-filter: blur(3px);
  animation: dsc-fade var(--ds-transition-duration-fast, 0.1s) ease;
}
@keyframes dsc-fade { from { opacity: 0; } to { opacity: 1; } }
.dsc-modal {
  width: min(620px, 100%);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dsc-border);
  border-radius: 16px;
  background: var(--dsc-layer);
  box-shadow: var(--dsc-shadow);
  overflow: hidden;
  animation: dsc-rise 0.16s ease;
}
@keyframes dsc-rise { from { opacity: 0; transform: translateY(8px) scale(0.995); } to { opacity: 1; transform: none; } }
.dsc-modal.dsc-handoff { width: min(760px, 100%); }
.dsc-modal-head { display: flex; align-items: flex-start; gap: 12px; padding: 18px 20px 14px; border-bottom: 1px solid var(--dsc-border); }
.dsc-modal-head h2 { margin: 0; font-size: 16.5px; font-weight: 620; letter-spacing: -0.01em; }
.dsc-modal-sub { margin: 4px 0 0; font-size: 11.9px; color: var(--dsc-muted); line-height: 1.55; }
.dsc-modal-head .dsc-icon-button { margin-left: auto; }
.dsc-modal-body { overflow-y: auto; padding: 16px 20px 18px; display: flex; flex-direction: column; gap: 16px; }
.dsc-modal-foot { display: flex; align-items: center; gap: 8px; padding: 12px 20px 16px; border-top: 1px solid var(--dsc-border); }
.dsc-modal-foot-note { flex: 1; min-width: 0; font-size: 11.5px; color: var(--dsc-muted); }
.dsc-settings-title { margin: 0 0 7px 2px; font-size: 11.8px; font-weight: 620; color: var(--dsc-muted); }
.dsc-settings-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--dsc-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsc-layer2) 30%, transparent);
}
.dsc-auth-status { display: flex; align-items: flex-start; gap: 9px; padding: 9px 10px; border-radius: 10px; background: var(--dsc-layer); border: 1px solid var(--dsc-border); }
.dsc-auth-status .dsc-auth-dot { margin: 5px 0 0; flex: none; }
.dsc-auth-status.is-ready .dsc-auth-dot { background: var(--dsc-success); }
.dsc-auth-status.is-missing .dsc-auth-dot { background: var(--dsc-warn); }
.dsc-auth-status-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.dsc-auth-status-body strong { font-size: 12.8px; }
.dsc-auth-status-body span { font-size: 11.6px; color: var(--dsc-muted); }
.dsc-auth-status-body .dsc-auth-sub { font-size: 11.2px; }
.dsc-field { display: flex; flex-direction: column; gap: 6px; }
.dsc-field-row { display: flex; align-items: center; gap: 8px; }
.dsc-field-tools { margin-left: auto; display: flex; align-items: center; gap: 2px; }
.dsc-field-label { font-size: 11.9px; font-weight: 620; color: var(--dsc-muted); }
.dsc-field-hint { margin: 0; font-size: 11.4px; line-height: 1.6; color: var(--dsc-muted); word-break: break-word; }
.dsc-segment { display: inline-flex; align-self: flex-start; gap: 2px; padding: 2px; border: 1px solid var(--dsc-border); border-radius: 9px; background: var(--dsc-layer2); }
.dsc-segment-button { height: 29px; padding: 0 11px; border: 0; border-radius: 7px; background: transparent; color: var(--dsc-muted); font-size: 12px; font-weight: 550; }
.dsc-segment-button.is-active { background: var(--dsc-layer); color: var(--dsc-text); box-shadow: 0 1px 3px rgba(9, 12, 20, 0.1); }
.dsc-key-row { display: flex; gap: 7px; align-items: center; }
.dsc-input {
  flex: 1;
  min-width: 0;
  height: 35px;
  padding: 0 10px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 9px;
  background: var(--dsc-bg);
  outline: 0;
  font-size: 12.9px;
  transition: border-color var(--dsc-fast) ease, box-shadow var(--dsc-fast) ease;
}
.dsc-input:focus { border-color: var(--dsc-brand); box-shadow: 0 0 0 2px var(--dsc-brand-soft); }
.dsc-select {
  height: 35px;
  padding: 0 30px 0 10px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 9px;
  background: var(--dsc-bg);
  color: var(--dsc-text);
  font-size: 12.9px;
  outline: 0;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--dsc-muted) 50%), linear-gradient(135deg, var(--dsc-muted) 50%, transparent 50%);
  background-position: calc(100% - 16px) 15px, calc(100% - 11px) 15px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}
.dsc-key-state { flex: 1; padding: 8px 10px; border-radius: 9px; background: var(--dsc-layer2); color: var(--dsc-muted); font-size: 12px; }
.dsc-switch-row { display: flex; align-items: center; gap: 12px; }
.dsc-switch-copy { display: flex; flex-direction: column; gap: 1px; flex: 1; }
.dsc-switch-copy strong { font-size: 12.8px; font-weight: 580; }
.dsc-switch-copy span { font-size: 11.4px; color: var(--dsc-muted); }
.dsc-switch {
  width: 40px;
  height: 24px;
  padding: 2px;
  border: 0;
  border-radius: 999px;
  background: var(--dsc-border-strong);
  transition: background var(--dsc-fast) ease;
  flex: none;
}
.dsc-switch.is-on { background: var(--dsc-brand); }
.dsc-switch-thumb { display: block; width: 20px; height: 20px; border-radius: 999px; background: #fff; box-shadow: 0 1px 3px rgba(9, 12, 20, 0.24); transition: transform var(--dsc-fast) ease; }
.dsc-switch.is-on .dsc-switch-thumb { transform: translateX(16px); }
.dsc-prompt { min-height: 92px; border: 1px solid var(--dsc-border-strong); border-radius: 9px; padding: 9px 10px; background: var(--dsc-bg); resize: vertical; }
.dsc-handoff-brief {
  min-height: 220px;
  max-height: 46vh;
  padding: 10px 12px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 10px;
  background: var(--dsc-bg);
  font-size: 12.7px;
  line-height: 1.7;
  resize: vertical;
}
.dsc-handoff-loading {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 220px;
  padding: 14px;
  border: 1px dashed var(--dsc-border-strong);
  border-radius: 10px;
  color: var(--dsc-muted);
  font-size: 12.7px;
}
.dsc-field-actions { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.dsc-data-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dsc-path { max-width: 68%; overflow-x: auto; padding: 5px 7px; border-radius: 6px; background: var(--dsc-layer2); font-size: 11.2px; white-space: nowrap; font-family: var(--dsc-mono); }
.dsc-about-row { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: var(--dsc-muted); }
.dsc-about-row strong { color: var(--dsc-text); font-weight: 580; }
.dsc-confirm { width: min(430px, 100%); padding: 20px; border: 1px solid var(--dsc-border); border-radius: 16px; background: var(--dsc-layer); box-shadow: var(--dsc-shadow); animation: dsc-rise 0.16s ease; }
.dsc-confirm h2 { margin: 0 0 7px; font-size: 15.5px; font-weight: 620; }
.dsc-confirm p { margin: 0; font-size: 12.9px; line-height: 1.62; color: var(--dsc-muted); }
.dsc-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }

/* ---------- toasts ---------- */
.dsc-toasts { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 40; display: flex; flex-direction: column; gap: 7px; align-items: center; pointer-events: none; width: min(560px, calc(100% - 32px)); }
.dsc-toast { display: flex; align-items: center; gap: 7px; max-width: 100%; padding: 9px 13px; border: 1px solid var(--dsc-border); border-radius: 10px; background: var(--dsc-layer); box-shadow: var(--dsc-shadow-soft); font-size: 12.5px; color: var(--dsc-text); animation: dsc-toast-in 0.16s ease; }
.dsc-toast .dsc-icon { color: var(--dsc-success); flex: none; }
.dsc-toast.is-warning .dsc-icon, .dsc-toast.is-warning { color: var(--dsc-warn); }
.dsc-toast.is-error .dsc-icon, .dsc-toast.is-error { color: var(--dsc-error); }
@keyframes dsc-toast-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* ---------- boot ---------- */
.dsc-boot { flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 24px; }
.dsc-boot-text { font-size: 12.9px; color: var(--dsc-muted); }
.dsc-boot-card { width: min(430px, 100%); padding: 22px; border: 1px solid var(--dsc-border); border-radius: 16px; background: var(--dsc-layer); text-align: center; box-shadow: var(--dsc-shadow-soft); }
.dsc-boot-icon { display: inline-flex; color: var(--dsc-warn); }
.dsc-boot-card h2 { margin: 8px 0 5px; font-size: 16px; }
.dsc-boot-card p { margin: 0 0 14px; font-size: 12.5px; color: var(--dsc-muted); line-height: 1.6; word-break: break-word; }

/* ---------- responsive ---------- */
@media (max-width: 1100px) {
  .dsc-sidebar { width: 248px; flex-basis: 248px; }
}
@media (max-width: 900px) {
  .dsc-sidebar {
    position: fixed;
    inset: var(--dsh-frame-chrome-top, 0px) auto 0 0;
    z-index: 12;
    width: min(300px, 86vw);
    flex-basis: auto;
    box-shadow: var(--dsc-shadow);
    transform: translateX(-101%);
    transition: transform var(--ds-transition-duration-slow, 0.3s) var(--dsc-ease);
    display: flex;
  }
  .dsc-sidebar.is-open { transform: translateX(0); }
  .dsc-sidebar:not(.is-open) { display: flex; }
  .dsc-sidebar-backdrop {
    position: fixed;
    inset: var(--dsh-frame-chrome-top, 0px) 0 0;
    z-index: 11;
    border: 0;
    padding: 0;
    background: var(--dsw-alias-bg-mask-1, color-mix(in srgb, #0b0f19 38%, transparent));
    backdrop-filter: blur(1px);
  }
  .dsc-header { padding: 0 10px 0 12px; }
  .dsc-thread { padding: 20px 14px 8px; }
  .dsc-composer-wrap { padding: 6px 12px 10px; }
  .dsc-msg-user { padding-left: 6%; }
  .dsc-msg-assistant { padding-right: 0; }
  .dsc-handoff-label { display: none; }
  .dsc-handoff-button { padding: 0 9px; }
}
@media (min-width: 901px) {
  .dsc-sidebar-backdrop { display: none; }
}
@media (max-width: 760px) {
  .dsc-modeswitch-label { display: none; }
  .dsc-modeswitch-item { padding: 0 11px; }
  .dsc-suggestions { grid-template-columns: 1fr; }
  .dsc-source-list { grid-template-columns: 1fr; }
  .dsc-empty { padding-top: 8vh; }
}
@media (max-width: 620px) {
  .dsc-mode-label { display: none; }
  .dsc-mode-button { width: 30px; padding: 0; justify-content: center; }
  .dsc-model-pill { display: none; }
  .dsc-header-title { display: none; }
  .dsc-thread { padding: 16px 12px 8px; }
  .dsc-composer-wrap { padding: 4px 10px 8px; }
  .dsc-user-bubble { font-size: 14.2px; }
  .dsc-md { font-size: 14.4px; }
  .dsc-modal-backdrop { padding: 10px; }
  .dsc-modal { max-height: 94vh; border-radius: 14px; }
  .dsc-modal-body { padding: 14px 14px 16px; }
  .dsc-modal-head { padding: 14px 14px 12px; }
  .dsc-modal-foot { padding: 10px 14px 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .dsc-root *, .dsc-root *::before, .dsc-root *::after,
  .dsc-modeswitch, .dsc-modeswitch * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`

function injectChatStyles() {
  const style = document.createElement('style')
  style.setAttribute('data-dsh-chat-mode', 'styles')
  style.textContent = CHAT_CSS
  document.head.appendChild(style)
  return () => style.remove()
}

/* ---- 70-main.js ---- */
function apply(ctx) {
  setClientContext(ctx)
  ctx.effect(() => ctx.locale.register(CHAT_NS, { zh: DICT_ZH, en: DICT_EN }), 'deepseek-chat-mode: dictionaries')
  ctx.effect(injectChatStyles, 'deepseek-chat-mode: styles')
  // The shared Chat | Agent navigation: a root-scoped entry in the frame-wide
  // overlay, so it lives in the shell chrome and stays reachable from both
  // modes instead of being a floating control inside the Chat view.
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'deepseek-chat-mode:mode-switch',
    order: 1,
    locale: CHAT_NS,
  }, ModeSwitch))
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'deepseek-chat-mode',
    order: 5,
    locale: CHAT_NS,
  }, ChatRoot))
  if (chatStore.state.open) void ensureBoot()
}

if (typeof globalThis.__DSC_TEST_HOOK__ === 'function') {
  globalThis.__DSC_TEST_HOOK__({
    chatStore,
    chatActions,
    ChatRoot,
    ModeSwitch,
    SettingsDialog,
    HandoffDialog,
    AssistantMessage,
    Composer,
    Markdown,
    parseMarkdown,
    renderBlock,
    renderInline,
    thinkingSeconds,
    thinkingDurationMs,
  })
}

    return { inject: ['slots', 'locale'], apply }
  },
})
