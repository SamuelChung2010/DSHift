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
  searchChats: '搜索对话与消息',
  today: '今天',
  yesterday: '昨天',
  earlier: '更早',
  noChats: '还没有对话',
  settings: '设置',
  greeting1Named: 'Ciallo～(∠・ω< )⌒☆，{name}！',
  greeting1Plain: 'Ciallo～(∠・ω< )⌒☆！',
  greeting2Named: '又见面啦，{name}！',
  greeting2Plain: '又见面啦！',
  greeting3Plain: '欸嘿～(๑•̀ㅂ•́)و✧ 今天有什么新计划？',
  greeting4Plain: '准备好探索新点子了吗？',
  greeting5Named: '有什么新鲜事吗，{name}？',
  greeting5Plain: '有什么新鲜事吗？',
  greeting6Plain: '灵感加载完成！✧',
  greeting7Plain: '今天也来创造点有趣的东西吧！',
  greeting8Plain: '欢迎回来！(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
  greeting9Plain: '世界那么大，今天探索哪里？',
  greeting10Plain: '代码、灵感，还是随便聊聊？',
  greeting11Plain: '今天有什么奇思妙想？',
  greeting12Plain: '新的一天，新的可能性！',
  resizeSidebar: '调整侧边栏宽度',
  composerPlaceholder: '给 DeepSeek 发送消息',
  send: '发送',
  stop: '停止生成',
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
  limitationsText: '数学公式为 LaTeX 子集，Mermaid 支持常见图表类型；代码高亮、表格与图片正常渲染，消息分支、编辑提问与回答版本切换均已支持。',
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
  copyFailed: '复制失败',
  searchEmpty: '没有匹配的对话或消息',
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
  handoffWorkspaceEmpty: '还没有工作区。可以在下面直接新建一个。',
  handoffWorkspaceEmptyUnavailable: '还没有工作区。请先在 Agent 模式中打开一个项目目录。',
  handoffNewWorkspace: '＋ 新建工作区…',
  handoffWorkspaceNone: '请选择工作区',
  handoffWorkspaceCreateTitle: '新建工作区',
  handoffWorkspaceName: '工作区名称',
  handoffWorkspaceNamePlaceholder: '例如：Stardew-Mod',
  handoffWorkspaceNameFallback: '新项目',
  handoffWorkspaceLocation: '项目文件夹',
  handoffWorkspacePathPlaceholder: '例如：C:\\Projects\\Stardew-Mod',
  handoffWorkspacePickExisting: '选择已有目录…',
  handoffWorkspacePickParent: '在此新建文件夹…',
  handoffWorkspacePathHint: '文件夹不存在时会自动创建，然后注册为 Harness 工作区。',
  handoffWorkspaceCancel: '取消新建',
  handoffWorkspaceCreate: '创建并选中',
  handoffWorkspaceCreating: '正在创建…',
  handoffWorkspaceCreated: '工作区「{name}」已创建。',
  handoffWorkspaceRegisteredExisting: '已把现有文件夹注册为工作区「{name}」。',
  handoffWorkspaceSelectedExisting: '工作区「{name}」已存在，已选中。',
  handoffWorkspaceNameRequired: '请填写工作区名称。',
  handoffWorkspaceNameInvalid: '这个名称不能用作文件夹名，请换一个。',
  handoffWorkspacePathRequired: '请选择或填写项目文件夹。',
  handoffWorkspacePathAbsolute: '请填写完整的绝对路径（例如 C:\\Projects\\My-App）。',
  handoffWorkspaceFolderFailed: '无法创建项目文件夹：{message}',
  handoffWorkspaceRegisterFailed: '文件夹已创建，但注册工作区失败：{message}',
  handoffWorkspaceUnavailable: '当前 Harness 环境不支持在此新建工作区，请改为选择已有工作区。',
  handoffWorkspacePickerUnavailable: '当前环境没有目录选择器，可以直接填写完整的项目文件夹路径。',
  handoffWorkspacePickFailed: '无法打开目录选择器：{message}',
  handoffWorkspaceRequired: '请先选择或新建一个工作区。',
  handoffNewProjectHint: '对话看起来是一个新项目，当前工作区可能不相关。',
  handoffNewProjectAction: '新建「{name}」',
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
  handoffPromptPartial: 'Agent 会话已创建，但任务说明未送达（{message}）。可以在该会话里重新粘贴。',
  settingsSubtitle: 'Chat 的认证、默认选项与数据位置。',
  emptyResponse: 'DeepSeek 返回了空响应。',
  copyBrief: '复制',
  // Mode / layout
  chatSettings: 'Chat 设置',
  openSettings: '打开设置',
  thinkingProcess: '思考过程',
  switchToAgent: '切换到 Agent',
  switchToChat: '切换到 Chat',
  // ---- conversation organization ----
  pinnedSection: '已置顶',
  foldersSection: '文件夹',
  newFolder: '新建文件夹',
  folderCreateTitle: '新建文件夹',
  folderRenameTitle: '重命名文件夹',
  folderNamePlaceholder: '文件夹名称',
  folderNameLabel: '文件夹名称',
  folderCreateHint: '为一组对话起一个名字，稍后可以随时重命名。',
  folderRenameHint: '只修改文件夹名称，里面的对话保持不变。',
  create: '创建',
  unfiled: '未分类',
  folderEmpty: '文件夹为空',
  moreActions: '更多操作',
  pin: '置顶',
  unpin: '取消置顶',
  archive: '归档',
  unarchive: '取消归档',
  archivedToast: '已归档',
  unarchivedToast: '已取消归档',
  archiveTitle: '已归档对话',
  archiveSubtitle: '归档的对话不会出现在历史列表中，但随时可以恢复，聊天记录也不会被删除。',
  archiveEmpty: '没有归档的对话',
  restore: '恢复',
  archiveManager: '归档管理',
  moveToFolder: '移动到文件夹…',
  moveOutOfFolder: '移出文件夹',
  moveChatTitle: '移动到文件夹',
  moveChatHint: '选择一个文件夹，或移回未分类。',
  moveChatConfirm: '移动',
  addChatsToFolder: '移入聊天…',
  folderAddTitle: '移入「{name}」',
  folderAddHint: '选择要移入此文件夹的对话。',
  folderAddEmpty: '没有可移入的对话',
  folderAddConfirm: '移入',
  chatMoved: '已移动对话',
  chatsMoved: '已移动 {count} 个对话',
  deleteFolderTitle: '删除文件夹',
  deleteFolder: '删除文件夹',
  renameFolder: '重命名文件夹',
  deleteFolderMessage: '删除「{name}」后，其中的 {count} 个对话会移回未分类，聊天记录不会被删除。',
  // ---- search ----
  searchSearching: '搜索中…',
  searchError: '搜索失败：{message}',
  // ---- message versions and editing ----
  edit: '编辑',
  editMessage: '编辑消息',
  editSave: '保存并发送',
  editHint: '保存后创建新的对话分支，原来的回答保留在历史版本中。',
  editEmpty: '消息不能为空',
  regenerate: '重新生成',
  continueGenerating: '继续生成',
  cannotContinue: '这条回答还没有可继续的内容，请重新生成。',
  versionPrev: '上一个版本',
  versionNext: '下一个版本',
  versionLabel: '版本 {index} / {count}',
  // Composer tools menu
  toolsMenu: '工具',
  uploadFiles: '上传图片或文件',
  uploadFilesHint: 'PDF、Word、PPT、图片与文本',
  webSearchHint: '从网络查找最新信息',
  deepThinkHint: '先推理再回答，可调整思考强度',
  toolOn: '已开启',
  toolOff: '已关闭',
  toolUploading: '正在上传',
  toolUnavailable: '当前不可用',
  deepSearchHint: '深度思考搜索：模型会在推理中搜索、打开网页并逐条求证',
  quickSearchHint: '联网搜索：模型先搜索再作答，并附上引用来源',
  pureThinkingHint: '仅深度思考：先推理，不访问网络',
  toolSearchUnavailable: '当前模型不支持联网搜索',
  toolThinkingUnavailable: '当前模型不支持深度思考',
  modelFlashDesc: '快速响应，支持图片理解，适合日常对话',
  modelProDesc: '推理能力更强，不支持图片理解；联网工具建议改用 Flash',
  modelNoVision: '不支持图片',
  // Model selection
  modelSelect: '选择模型',
  switchModel: '切换模型',
  modelMenuTitle: '模型',
  modelCapabilities: '能力',
  modelCapVision: '图片理解',
  modelCapFiles: '文件解析',
  modelCapSearch: '联网搜索',
  modelCapThinking: '深度思考',
  modelUnsupportedImage: '当前模型不支持图片理解，请切换到 DeepSeek V4.1 Flash。',
  modelConfigFailed: '模型设置保存失败：{message}',
  modelUnavailable: '该模型当前不可用，已切换回 DeepSeek V4.1 Flash，请重试。',
  modelAppliedToChat: '仅对当前对话生效',
  modelAppliedToDefault: '新对话默认使用',
  thinkingEffort: '思考强度',
  effortOff: '关闭',
  effortOffHint: '不展示思考过程，直接回答',
  effortLow: '低',
  effortHigh: '高',
  effortMax: '最高',
  effortLowHint: '更快，适合简单问题',
  effortHighHint: '平衡速度与准确度',
  effortMaxHint: '最充分，耗时更长',
  effortNeedsThinking: '开启深度思考后可选择思考强度',
  effortUnsupported: '当前模型不支持思考强度设置',
  // Sources
  sourceSummary: '来源 · {count}',
  sourceDomainFallback: '网页',
  citationOpen: '查看来源 {index}',
  // Composer behaviour
  composerHints: '输入与发送',
  enterToSend: 'Enter 发送，Shift + Enter 换行',
  enterToSendShort: 'Enter 发送',
  newlineToSend: 'Ctrl + Enter 发送，Enter 换行',
  sendKeyLabel: '发送键',
  // Rendering
  mermaidFailed: '图表渲染失败',
  mathFailed: '公式渲染失败',
  streamingDiagram: '生成完成后绘制图表',
  // ---- long-term memory ----
  settingsGeneralTab: '通用',
  settingsMemoryTab: '长期记忆',
  settingsTabsLabel: '设置分区',
  memorySectionTitle: '长期记忆',
  memoryMasterLabel: '启用长期记忆',
  memoryMasterHint: '让 DeepSeek 记住你说过的重要信息，并在之后的对话中使用。',
  memoryAutoExtractLabel: '自动记忆提取',
  memoryAutoExtractHint: '开启后会从对话中自动提取值得记住的信息。',
  memoryPrivacyHint: '开启后会把对话片段发送到 DeepSeek API 处理，可能产生额外用量费用。敏感个人信息不会被自动保存。',
  memoryAutoExtractDisabledHint: '先开启长期记忆，才能启用自动提取。',
  memoryLoading: '正在加载长期记忆…',
  memoryLoadFailed: '长期记忆加载失败',
  memoryOutdatedTitle: '当前插件版本不支持长期记忆',
  memoryOutdatedHint: '请重载插件后再试。',
  memorySummarySection: '记忆概述',
  memorySummaryEmpty: '还没有概述。添加记忆后可以点“重新整理”生成。',
  memorySummaryNever: '尚未生成',
  memorySummaryUpdated: '最后更新：{time}',
  memoryRegenerate: '重新整理',
  memorySummaryRetry: '重试整理',
  memorySummaryBusy: '正在整理…',
  memorySummaryFailed: '整理失败，已保留之前的概述。',
  memorySummaryStaleHint: '记忆有变化，概述待更新。',
  memoryAskPlaceholder: '问点什么，或告诉我需要记住 / 忘记什么',
  memoryAskSubmit: '发送',
  memoryAsking: '正在处理…',
  memoryAskDisabledHint: '长期记忆已关闭，开启后才能提问或修改记忆。',
  memoryAppliedAdded: '已新增 {count} 条',
  memoryAppliedUpdated: '已更新 {count} 条',
  memoryAppliedDeleted: '已删除 {count} 条',
  memoryPendingHint: '确认要删除这些记忆吗？',
  memoryConfirmDelete: '确认删除',
  memoryListSection: '全部记忆',
  memoryLimitHint: '{count} / {max} 条记忆',
  memoryClearAction: '清空所有记忆',
  memoryClearTitle: '清空所有记忆？',
  memoryClearMessage: '所有 {count} 条长期记忆都会被永久删除，此操作无法撤销。',
  memoryClearConfirm: '确认清空',
  memoryClearedToast: '已清空 {count} 条记忆',
  memoryDeletedToast: '已删除这条记忆',
  memoryDeleteTitle: '删除这条记忆？',
  memoryDeleteMessage: '「{preview}」将被永久删除。',
  memoryDeleteConfirm: '确认删除',
  memoryEmpty: '还没有记忆。手动添加一条，或在对话里告诉 DeepSeek 需要记住什么。',
  memoryEmptyFiltered: '这个分类下还没有记忆。',
  memoryFilterAll: '全部',
  memoryAddPlaceholder: '一条需要记住的信息…',
  memoryAddSubmit: '添加',
  memoryAddedToast: '已添加记忆',
  memoryAddDuplicateToast: '这条记忆已经存在',
  memoryAddMergedToast: '已合并到已有记忆',
  memorySavedToast: '已保存',
  memorySourceManual: '手动',
  memorySourceConversation: '来自对话',
  memorySourceAgent: '自动提取',
  memorySourceImport: '导入自 {platform}',
  memorySourceUnknown: '其他来源',
  memoryPlatformChatgpt: 'ChatGPT',
  memoryPlatformClaude: 'Claude',
  memoryPlatformGemini: 'Gemini',
  memoryPlatformOther: '其他或未指定',
  memoryCatInstruction: '指令',
  memoryCatIdentity: '身份',
  memoryCatCareer: '职业',
  memoryCatProjects: '项目',
  memoryCatPreferences: '偏好',
  memoryImportOpen: '从其他 AI 导入记忆',
  memoryImportHint: '把其他 AI 记住的关于你的信息合并进来。',
  memoryImportTitle: '从其他 AI 导入记忆',
  memoryImportSubtitle: '只合并，不会覆盖或清空已有记忆。',
  memoryImportIntro: '将以下提示词发送给 ChatGPT、Claude、Gemini 或其他 AI，让它整理已有记忆，然后复制结果回来。',
  memoryImportPromptLabel: '提示词',
  memoryImportCopyPrompt: '复制提示词',
  memoryImportStep: '第 {current} 步 / 共 {total} 步',
  memoryImportNext: '下一步：粘贴结果',
  memoryImportBack: '上一步',
  memoryImportPlatform: '平台',
  memoryImportPasteLabel: '粘贴 AI 返回的内容',
  memoryImportPastePlaceholder: '把 AI 返回的完整内容粘贴到这里…',
  memoryImportParse: '解析并预览',
  memoryImportParsing: '正在解析…',
  memoryImportRecognized: '已识别 {count} 条记忆。',
  memoryImportSkipped: '跳过 {count} 行',
  memoryImportEmpty: '没有识别到记忆，请检查粘贴的内容。',
  memoryImportFailed: '解析失败：{message}',
  memoryImportAssist: 'AI 帮我整理',
  memoryImportAssisting: '正在整理…',
  memoryImportConsentText: '将把粘贴的内容发送到 DeepSeek API 处理，可能产生费用。确认吗？',
  memoryImportConsentConfirm: '确认并整理',
  memoryImportAssistFailed: 'AI 整理失败：{message}',
  memoryImportAssistTruncated: '内容较长，只整理了前一部分。',
  memoryImportPreviewSubtitle: '确认要导入的内容；导入只合并，不会覆盖或清空已有记忆。',
  memoryImportSelectCount: '已选择 {count} 条',
  memoryImportItemLabel: '第 {index} 条',
  memoryImportCategory: '分类',
  memoryImportMode: '处理方式',
  memoryImportModeSkip: '跳过',
  memoryImportModeMerge: '合并',
  memoryImportModeUpdate: '更新',
  memoryImportBadgeDuplicate: '已存在',
  memoryImportBadgeConflict: '可能重复或冲突',
  memoryImportBadgeSensitive: '可能包含敏感信息',
  memoryImportExisting: '已有：{content}',
  memoryImportMergeNote: '导入只合并，不会覆盖或清空已有记忆。',
  memoryImportConfirm: '导入 {count} 条记忆',
  memoryImportImporting: '正在导入…',
  memoryImportNoneSelected: '请至少选择一条记忆。',
  memoryImportDone: '导入完成：新增 {added}、合并 {merged}、更新 {updated}、跳过 {skipped}',
}

const DICT_EN = {
  appTitle: 'DeepSeek Chat',
  chatMode: 'Chat',
  openChat: 'Chat',
  agentMode: 'Agent',
  agentModeFull: 'Agent mode',
  modeSwitchLabel: 'Switch between Chat and Agent',
  newChat: 'New chat',
  searchChats: 'Search chats and messages',
  today: 'Today',
  yesterday: 'Yesterday',
  earlier: 'Earlier',
  noChats: 'No conversations yet',
  settings: 'Settings',
  greeting1Named: 'Ciallo～(∠・ω< )⌒☆, {name}!',
  greeting1Plain: 'Ciallo～(∠・ω< )⌒☆!',
  greeting2Named: 'Good to see you again, {name}!',
  greeting2Plain: 'Good to see you again!',
  greeting3Plain: 'Hehe～(๑•̀ㅂ•́)و✧ Any new plans today?',
  greeting4Plain: 'Ready to explore some new ideas?',
  greeting5Named: 'Anything new with you, {name}?',
  greeting5Plain: 'Anything new with you?',
  greeting6Plain: 'Inspiration loaded! ✧',
  greeting7Plain: "Let's make something fun today!",
  greeting8Plain: 'Welcome back! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
  greeting9Plain: 'The world is wide — where shall we explore today?',
  greeting10Plain: 'Code, ideas, or just a chat?',
  greeting11Plain: "What's on your mind today?",
  greeting12Plain: 'A new day, new possibilities!',
  resizeSidebar: 'Resize sidebar',
  composerPlaceholder: 'Message DeepSeek',
  send: 'Send',
  stop: 'Stop generating',
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
  limitationsText: 'Math uses a LaTeX subset and Mermaid covers common diagrams; code highlighting, tables and images render, and message branching, prompt editing and answer versions are supported.',
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
  copyFailed: 'Could not copy',
  searchEmpty: 'No matching chats or messages',
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
  handoffWorkspaceEmpty: 'No workspace yet. Create one below.',
  handoffWorkspaceEmptyUnavailable: 'No workspace yet. Open a project directory in Agent mode first.',
  handoffNewWorkspace: '＋ New workspace…',
  handoffWorkspaceNone: 'Select a workspace',
  handoffWorkspaceCreateTitle: 'New workspace',
  handoffWorkspaceName: 'Workspace name',
  handoffWorkspaceNamePlaceholder: 'e.g. Stardew-Mod',
  handoffWorkspaceNameFallback: 'new-project',
  handoffWorkspaceLocation: 'Project folder',
  handoffWorkspacePathPlaceholder: 'e.g. C:\\Projects\\Stardew-Mod',
  handoffWorkspacePickExisting: 'Choose existing folder…',
  handoffWorkspacePickParent: 'Create folder here…',
  handoffWorkspacePathHint: 'A missing folder is created, then registered as a Harness workspace.',
  handoffWorkspaceCancel: 'Cancel new workspace',
  handoffWorkspaceCreate: 'Create and select',
  handoffWorkspaceCreating: 'Creating…',
  handoffWorkspaceCreated: 'Workspace "{name}" created.',
  handoffWorkspaceRegisteredExisting: 'Registered the existing folder as workspace "{name}".',
  handoffWorkspaceSelectedExisting: 'Workspace "{name}" already exists; selected it.',
  handoffWorkspaceNameRequired: 'Enter a workspace name.',
  handoffWorkspaceNameInvalid: 'That name cannot be used as a folder name; choose another.',
  handoffWorkspacePathRequired: 'Choose or enter a project folder.',
  handoffWorkspacePathAbsolute: 'Enter a fully qualified path (e.g. C:\\Projects\\My-App).',
  handoffWorkspaceFolderFailed: 'Could not create the project folder: {message}',
  handoffWorkspaceRegisterFailed: 'The folder was created, but registering the workspace failed: {message}',
  handoffWorkspaceUnavailable: 'This Harness environment cannot create a workspace here. Choose an existing workspace instead.',
  handoffWorkspacePickerUnavailable: 'This environment has no directory picker; type the full project folder path instead.',
  handoffWorkspacePickFailed: 'Could not open the directory picker: {message}',
  handoffWorkspaceRequired: 'Select or create a workspace first.',
  handoffNewProjectHint: 'This conversation looks like a new project; the selected workspace may be unrelated.',
  handoffNewProjectAction: 'New "{name}"',
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
  handoffPromptPartial: 'The Agent session was created, but the brief was not delivered ({message}). Paste it in that session.',
  settingsSubtitle: 'Chat authentication, defaults and data location.',
  emptyResponse: 'DeepSeek returned an empty response.',
  copyBrief: 'Copy',
  chatSettings: 'Chat settings',
  openSettings: 'Open settings',
  thinkingProcess: 'Reasoning',
  switchToAgent: 'Switch to Agent',
  switchToChat: 'Switch to Chat',
  // ---- conversation organization ----
  pinnedSection: 'Pinned',
  foldersSection: 'Folders',
  newFolder: 'New folder',
  folderCreateTitle: 'New folder',
  folderRenameTitle: 'Rename folder',
  folderNamePlaceholder: 'Folder name',
  folderNameLabel: 'Folder name',
  folderCreateHint: 'Name this group of chats. You can rename it later.',
  folderRenameHint: 'Only the folder name changes; its chats stay as they are.',
  create: 'Create',
  unfiled: 'Unfiled',
  folderEmpty: 'This folder is empty',
  moreActions: 'More actions',
  pin: 'Pin',
  unpin: 'Unpin',
  archive: 'Archive',
  unarchive: 'Unarchive',
  archivedToast: 'Chat archived',
  unarchivedToast: 'Chat restored',
  archiveTitle: 'Archived chats',
  archiveSubtitle: 'Archived chats stay out of the history list, can be restored at any time, and are never deleted.',
  archiveEmpty: 'No archived chats',
  restore: 'Restore',
  archiveManager: 'Archived chats',
  moveToFolder: 'Move to folder…',
  moveOutOfFolder: 'Remove from folder',
  moveChatTitle: 'Move to folder',
  moveChatHint: 'Pick a folder, or return the chat to the unfiled list.',
  moveChatConfirm: 'Move',
  addChatsToFolder: 'Add chats…',
  folderAddTitle: 'Add to “{name}”',
  folderAddHint: 'Choose the chats to put in this folder.',
  folderAddEmpty: 'No chats to add',
  folderAddConfirm: 'Add',
  chatMoved: 'Chat moved',
  chatsMoved: 'Moved {count} chats',
  deleteFolderTitle: 'Delete folder',
  deleteFolder: 'Delete folder',
  renameFolder: 'Rename folder',
  deleteFolderMessage: 'Delete “{name}”? Its {count} chats move back to the unfiled list and no history is deleted.',
  // ---- search ----
  searchSearching: 'Searching…',
  searchError: 'Search failed: {message}',
  // ---- message versions and editing ----
  edit: 'Edit',
  editMessage: 'Edit message',
  editSave: 'Save & send',
  editHint: 'Saving creates a new conversation branch; the original answers stay available as versions.',
  editEmpty: 'The message cannot be empty',
  regenerate: 'Regenerate',
  continueGenerating: 'Continue generating',
  cannotContinue: 'This answer has no text to continue from. Try regenerating instead.',
  versionPrev: 'Previous version',
  versionNext: 'Next version',
  versionLabel: 'Version {index} / {count}',
  // Composer tools menu
  toolsMenu: 'Tools',
  uploadFiles: 'Upload images or files',
  uploadFilesHint: 'PDF, Word, PPT, images and text',
  webSearchHint: 'Look up current information on the web',
  deepThinkHint: 'Reason before answering; pick how hard it thinks',
  toolOn: 'On',
  toolOff: 'Off',
  toolUploading: 'Uploading',
  toolUnavailable: 'Unavailable',
  deepSearchHint: 'Deep search: the model searches, opens pages and verifies while reasoning',
  quickSearchHint: 'Web search: search first, then answer with cited sources',
  pureThinkingHint: 'Thinking only: reason first, no network access',
  toolSearchUnavailable: 'This model cannot search the web',
  toolThinkingUnavailable: 'This model cannot think first',
  modelFlashDesc: 'Fast everyday chat, reads images',
  modelProDesc: 'Stronger reasoning, no image input; web tools prefer Flash',
  modelNoVision: 'No image input',
  // Model selection
  modelSelect: 'Select model',
  switchModel: 'Switch model',
  modelMenuTitle: 'Model',
  modelCapabilities: 'Capabilities',
  modelCapVision: 'Images',
  modelCapFiles: 'Files',
  modelCapSearch: 'Web search',
  modelCapThinking: 'Thinking',
  modelUnsupportedImage: 'This model cannot read images. Switch to DeepSeek V4.1 Flash.',
  modelConfigFailed: 'Could not save the model setting: {message}',
  modelUnavailable: 'That model is unavailable. Switched back to DeepSeek V4.1 Flash; please retry.',
  modelAppliedToChat: 'Applies to this conversation',
  modelAppliedToDefault: 'Default for new conversations',
  thinkingEffort: 'Thinking effort',
  effortOff: 'Off',
  effortOffHint: 'Answer directly without showing reasoning',
  effortLow: 'Low',
  effortHigh: 'High',
  effortMax: 'Max',
  effortLowHint: 'Faster, for simple questions',
  effortHighHint: 'Balanced speed and quality',
  effortMaxHint: 'Most thorough, slower',
  effortNeedsThinking: 'Turn on deep thinking to choose an effort',
  effortUnsupported: 'This model has no effort setting',
  // Sources
  sourceSummary: 'Sources · {count}',
  sourceDomainFallback: 'Web',
  citationOpen: 'Open source {index}',
  // Composer behaviour
  composerHints: 'Input and sending',
  enterToSend: 'Enter to send, Shift + Enter for a new line',
  enterToSendShort: 'Enter to send',
  newlineToSend: 'Ctrl + Enter to send, Enter for a new line',
  sendKeyLabel: 'Send key',
  // Rendering
  mermaidFailed: 'Diagram failed to render',
  mathFailed: 'Formula failed to render',
  streamingDiagram: 'Diagram appears when the answer finishes',
  // ---- long-term memory ----
  settingsGeneralTab: 'General',
  settingsMemoryTab: 'Memory',
  settingsTabsLabel: 'Settings sections',
  memorySectionTitle: 'Long-term memory',
  memoryMasterLabel: 'Enable long-term memory',
  memoryMasterHint: 'Let DeepSeek remember important details and use them in later conversations.',
  memoryAutoExtractLabel: 'Auto-extract memories',
  memoryAutoExtractHint: 'When on, useful details are extracted from your conversations automatically.',
  memoryPrivacyHint: 'When on, conversation excerpts are sent to the DeepSeek API, which may incur extra usage charges. Sensitive personal information is not saved automatically.',
  memoryAutoExtractDisabledHint: 'Turn on long-term memory first to enable auto-extraction.',
  memoryLoading: 'Loading long-term memory…',
  memoryLoadFailed: 'Could not load long-term memory',
  memoryOutdatedTitle: 'This plugin version does not support long-term memory',
  memoryOutdatedHint: 'Reload the plugin and try again.',
  memorySummarySection: 'Memory summary',
  memorySummaryEmpty: 'No summary yet. Add memories and choose Regenerate.',
  memorySummaryNever: 'Not generated yet',
  memorySummaryUpdated: 'Last updated {time}',
  memoryRegenerate: 'Regenerate',
  memorySummaryRetry: 'Retry',
  memorySummaryBusy: 'Regenerating…',
  memorySummaryFailed: 'Regeneration failed; the previous summary is kept.',
  memorySummaryStaleHint: 'Memories changed; the summary is out of date.',
  memoryAskPlaceholder: 'Ask something, or tell me what to remember / forget',
  memoryAskSubmit: 'Send',
  memoryAsking: 'Working…',
  memoryAskDisabledHint: 'Long-term memory is off; turn it on to ask or change memories.',
  memoryAppliedAdded: 'Added {count}',
  memoryAppliedUpdated: 'Updated {count}',
  memoryAppliedDeleted: 'Deleted {count}',
  memoryPendingHint: 'Delete these memories?',
  memoryConfirmDelete: 'Delete',
  memoryListSection: 'All memories',
  memoryLimitHint: '{count} / {max} memories',
  memoryClearAction: 'Clear all memories',
  memoryClearTitle: 'Clear all memories?',
  memoryClearMessage: 'All {count} memories will be deleted permanently. This cannot be undone.',
  memoryClearConfirm: 'Clear all',
  memoryClearedToast: 'Cleared {count} memories',
  memoryDeletedToast: 'Memory deleted',
  memoryDeleteTitle: 'Delete this memory?',
  memoryDeleteMessage: '“{preview}” will be deleted permanently.',
  memoryDeleteConfirm: 'Delete',
  memoryEmpty: 'No memories yet. Add one, or tell DeepSeek something to remember in a chat.',
  memoryEmptyFiltered: 'No memories in this category.',
  memoryFilterAll: 'All',
  memoryAddPlaceholder: 'Something to remember…',
  memoryAddSubmit: 'Add',
  memoryAddedToast: 'Memory added',
  memoryAddDuplicateToast: 'That memory already exists',
  memoryAddMergedToast: 'Merged into an existing memory',
  memorySavedToast: 'Saved',
  memorySourceManual: 'Manual',
  memorySourceConversation: 'From a conversation',
  memorySourceAgent: 'Auto-extracted',
  memorySourceImport: 'Imported from {platform}',
  memorySourceUnknown: 'Other source',
  memoryPlatformChatgpt: 'ChatGPT',
  memoryPlatformClaude: 'Claude',
  memoryPlatformGemini: 'Gemini',
  memoryPlatformOther: 'Other / unspecified',
  memoryCatInstruction: 'Instructions',
  memoryCatIdentity: 'Identity',
  memoryCatCareer: 'Career',
  memoryCatProjects: 'Projects',
  memoryCatPreferences: 'Preferences',
  memoryImportOpen: 'Import from another AI',
  memoryImportHint: 'Merge what another AI remembers about you into long-term memory.',
  memoryImportTitle: 'Import memories from another AI',
  memoryImportSubtitle: 'Import only merges; existing memory is never overwritten or cleared.',
  memoryImportIntro: 'Send the prompt below to ChatGPT, Claude, Gemini, or another AI to organize the memories it already has, then paste the result back here.',
  memoryImportPromptLabel: 'Prompt',
  memoryImportCopyPrompt: 'Copy prompt',
  memoryImportStep: 'Step {current} of {total}',
  memoryImportNext: 'Next: paste the result',
  memoryImportBack: 'Back',
  memoryImportPlatform: 'Platform',
  memoryImportPasteLabel: 'Paste the AI response',
  memoryImportPastePlaceholder: 'Paste the full response here…',
  memoryImportParse: 'Parse and preview',
  memoryImportParsing: 'Parsing…',
  memoryImportRecognized: 'Recognized {count} memories.',
  memoryImportSkipped: 'Skipped {count} lines',
  memoryImportEmpty: 'No memories recognized. Check the pasted text.',
  memoryImportFailed: 'Could not parse: {message}',
  memoryImportAssist: 'Let AI structure it',
  memoryImportAssisting: 'Structuring…',
  memoryImportConsentText: 'The pasted text will be sent to the DeepSeek API for processing and may incur charges. Continue?',
  memoryImportConsentConfirm: 'Confirm and structure',
  memoryImportAssistFailed: 'AI structuring failed: {message}',
  memoryImportAssistTruncated: 'The text was long; only part of it was structured.',
  memoryImportPreviewSubtitle: 'Review what will be imported. Import only merges; existing memory is never overwritten or cleared.',
  memoryImportSelectCount: '{count} selected',
  memoryImportItemLabel: 'Record {index}',
  memoryImportCategory: 'Category',
  memoryImportMode: 'Action',
  memoryImportModeSkip: 'Skip',
  memoryImportModeMerge: 'Merge',
  memoryImportModeUpdate: 'Update',
  memoryImportBadgeDuplicate: 'Already exists',
  memoryImportBadgeConflict: 'Possible duplicate or conflict',
  memoryImportBadgeSensitive: 'May contain sensitive info',
  memoryImportExisting: 'Existing: {content}',
  memoryImportMergeNote: 'Import only merges; existing memory is never overwritten or cleared.',
  memoryImportConfirm: 'Import {count} memories',
  memoryImportImporting: 'Importing…',
  memoryImportNoneSelected: 'Select at least one memory.',
  memoryImportDone: 'Import complete: added {added}, merged {merged}, updated {updated}, skipped {skipped}',
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
/** Sidebar geometry contract, shared with the native Harness sidebar drag range. */
const SIDEBAR_MIN = 264
const SIDEBAR_MAX = 420
const SIDEBAR_DEFAULT = 280
/** The chat column never gives up more than this to the sidebar at one window width. */
const CHAT_COLUMN_MIN = 460

/**
 * Clamp one sidebar width into the contract range, also keeping the chat column
 * usable on a narrow window. The stored preference is the user's; this function
 * decides only what fits right now.
 * @param value - requested width in px.
 * @param viewport - window width in px.
 * @returns the width to render and persist.
 */
function clampSidebarWidth(value, viewport) {
  const width = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : SIDEBAR_DEFAULT
  const max = typeof viewport === 'number' && Number.isFinite(viewport) && viewport > 0
    ? Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, viewport - CHAT_COLUMN_MIN))
    : SIDEBAR_MAX
  return Math.min(max, Math.max(SIDEBAR_MIN, width))
}

/**
 * Greeting options for a blank Chat page. A name-capable option also carries a
 * natural no-name variant, so an unavailable account name is omitted as part of
 * the sentence instead of leaving a dangling placeholder behind.
 */
const GREETINGS = [
  { named: 'greeting1Named', plain: 'greeting1Plain' },
  { named: 'greeting2Named', plain: 'greeting2Plain' },
  { plain: 'greeting3Plain' },
  { plain: 'greeting4Plain' },
  { named: 'greeting5Named', plain: 'greeting5Plain' },
  { plain: 'greeting6Plain' },
  { plain: 'greeting7Plain' },
  { plain: 'greeting8Plain' },
  { plain: 'greeting9Plain' },
  { plain: 'greeting10Plain' },
  { plain: 'greeting11Plain' },
  { plain: 'greeting12Plain' },
]

/**
 * Pick the next blank-page greeting, never the one already showing. Uniform
 * among the other options, so a second consecutive repeat is impossible.
 * @param previous - the greeting currently on screen, or an invalid index.
 * @param random - random source in [0, 1); injectable for tests.
 * @returns the chosen greeting index.
 */
function pickGreetingIndex(previous, random = Math.random) {
  const count = GREETINGS.length
  const current = Number.isInteger(previous) && previous >= 0 && previous < count ? previous : -1
  const pool = current >= 0 ? count - 1 : count
  const roll = Math.floor(random() * pool)
  const pick = Math.min(pool - 1, Math.max(0, roll))
  return current >= 0 && pick >= current ? pick + 1 : pick
}

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
    // Model catalog and preferences, filled from the Host bootstrap. The
    // fallback keeps the composer usable while an older Host half answers.
    models: [],
    modelConfig: null,
    modelChoice: { model: 'deepseek-flash', effort: 'high' },
    // Composer send key: "enter" (Enter sends) or "ctrl-enter" (Ctrl/Cmd+Enter
    // sends). A browser preference, stored next to the layout settings.
    sendKey: stored.sendKey === 'ctrl-enter' ? 'ctrl-enter' : 'enter',
    conversations: [],
    folders: [],
    workspaces: [],
    limits: { maxFiles: MAX_FILES, maxUploadBytes: MAX_UPLOAD_MB, maxUserDataBytes: MAX_USER_DATA_MB * 1024 * 1024 },
    activeId: typeof stored.activeId === 'string' ? stored.activeId : null,
    messages: [],
    conversationLoading: false,
    conversationError: '',
    streaming: null,
    stopping: false,
    sending: false,
    draft: '',
    attachments: [],
    toasts: [],
    settingsOpen: false,
    handoff: null,
    confirm: null,
    // The Harness frame auto-collapses its sidebar below 1024px; following the
    // same breakpoint keeps the shared switch's centre identical in both modes.
    sidebarOpen: typeof window !== 'undefined' ? window.innerWidth > 1024 : true,
    // One Chat-owned width preference. It follows the same 264-420px contract
    // and drag handle behaviour as the native sidebar, but Chat remembers it
    // across restarts instead of resetting to the contract default.
    sidebarWidth: clampSidebarWidth(stored.sidebarWidth, typeof window !== 'undefined' ? window.innerWidth : undefined),
    // Last known account display name for the greeting; refreshed from the Host
    // and cached here so a reload paints the personalized line immediately.
    userName: typeof stored.userName === 'string' ? stored.userName : '',
    // One greeting per blank conversation: chosen at launch and re-rolled by
    // "New chat" (never the same one twice in a row).
    greetingIndex: pickGreetingIndex(-1),
    renamingId: null,
    focusRequest: 0,
    filePickRequest: 0,
    // ---- conversation organization (sidebar) ----
    // One floating menu at a time, anchored at the pointer. `kind` selects the
    // item list; `id` is the conversation or folder it acts on.
    menu: null,
    // Create/rename folder prompt, single-chat folder picker, multi-chat folder
    // picker and the archive manager are separate surfaces.
    folderPrompt: null,
    moveChat: null,
    folderAdd: null,
    archiveOpen: false,
    // Inline editor for one historical user message.
    editingId: null,
    editDraft: '',
    // Message to bring into view after loading or switching a version.
    focusMessage: null,
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
    const error = new Error(text || `HTTP ${response.status}`)
    error.status = response.status
    throw error
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
  if (response.body === null) throw new Error(tr('emptyResponse'))
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
    pinned: conversation.pinned === true,
    pinnedAt: conversation.pinnedAt ?? null,
    archived: conversation.archived === true,
    archivedAt: conversation.archivedAt ?? null,
    folderId: conversation.folderId ?? null,
    messageCount: Array.isArray(conversation.messages) ? conversation.messages.length : (conversation.messageCount ?? 0),
  }
}

function sortConversations(list) {
  return [...list].sort((left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0))
}

/** Sidebar ordering: most recently active first, with a stable id tie-break. */
function byActivity(left, right) {
  const delta = (right.updatedAt ?? 0) - (left.updatedAt ?? 0)
  if (delta !== 0) return delta
  return String(left.id).localeCompare(String(right.id))
}

/**
 * Group the summaries for the sidebar: pinned chats first (always, even when
 * they also belong to a folder), then one bucket per folder, then the unfiled
 * chats. Archived chats are left to the archive manager. Every bucket keeps a
 * deterministic order, so a refresh never reshuffles equal timestamps.
 */
function organizeSidebar(conversations, folders) {
  const visible = conversations.filter(conversation => conversation.archived !== true)
  const pinned = visible.filter(conversation => conversation.pinned === true).sort(byActivity)
  const buckets = new Map(folders.map(folder => [folder.id, []]))
  const loose = []
  for (const conversation of visible) {
    if (conversation.pinned === true) continue
    const bucket = conversation.folderId !== null ? buckets.get(conversation.folderId) : undefined
    if (bucket === undefined) loose.push(conversation)
    else bucket.push(conversation)
  }
  loose.sort(byActivity)
  for (const bucket of buckets.values()) bucket.sort(byActivity)
  return {
    pinned,
    folders: folders.map(folder => ({ folder, conversations: buckets.get(folder.id) ?? [] })),
    loose,
    archivedCount: conversations.filter(conversation => conversation.archived === true).length,
  }
}

/** Replace the sidebar snapshot from a Host organization response. */
function applyOrganization(data) {
  const patch = {}
  if (Array.isArray(data?.summaries)) patch.conversations = sortConversations(data.summaries)
  if (Array.isArray(data?.folders)) patch.folders = data.folders
  if (Object.keys(patch).length > 0) chatStore.set(patch)
}

/** Visible answer text of one assistant reply. */
function messageBodyText(message) {
  return (message?.blocks ?? [])
    .filter(block => block?.type === 'text' && typeof block.text === 'string')
    .map(block => block.text)
    .join('')
}

/**
 * Whether an answer can be resumed from its own visible prefix. Refused and
 * tool-terminated answers cannot be continued; an empty answer has nothing to
 * continue from either.
 */
function canContinueReply(message) {
  if (!message || message.role !== 'assistant') return false
  if (message.stopReason === 'refusal' || message.prefix === false) return false
  const incomplete = message.status === 'stopped' || message.status === 'error' || message.stopReason === 'max_tokens'
  return incomplete && messageBodyText(message).trim() !== ''
}

/** Files as the Host stores them: preview URLs never leave this browser. */
function hostFiles(files) {
  return (Array.isArray(files) ? files : []).flatMap((file) => {
    if (!file || typeof file.fileId !== 'string' || file.fileId === '') return []
    return [{
      id: file.id,
      fileId: file.fileId,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      isImage: file.isImage === true,
    }]
  })
}

/** Re-attach local image previews to the authoritative file metadata. */
function withFilePreviews(messages, previousMessages) {
  const previews = new Map()
  for (const message of Array.isArray(previousMessages) ? previousMessages : []) {
    for (const file of message?.files ?? []) {
      if (file?.fileId && file.previewUrl) previews.set(file.fileId, file.previewUrl)
    }
  }
  if (previews.size === 0) return messages
  return messages.map((message) => {
    if (!Array.isArray(message?.files) || message.files.length === 0) return message
    let changed = false
    const files = message.files.map((file) => {
      const previewUrl = file?.fileId ? previews.get(file.fileId) : undefined
      if (!previewUrl || file.previewUrl === previewUrl) return file
      changed = true
      return { ...file, previewUrl }
    })
    return changed ? { ...message, files } : message
  })
}

/** Locale tag for one stream request. */
function streamLocale() {
  return appCtx?.locale.getSnapshot().active === 'zh' ? 'zh' : 'en'
}

/** A fresh assistant placeholder for an optimistic branch. */
function makeReplyPlaceholder(settings, choice = currentModelChoice()) {
  const now = Date.now()
  return {
    id: uid(),
    role: 'assistant',
    createdAt: now,
    updatedAt: now,
    model: choice.model.id,
    effort: choice.effort,
    thinking: settings.thinking === true,
    search: settings.search === true,
    status: 'streaming',
    blocks: [],
    prefix: true,
  }
}

/**
 * Whether the Chat page is a blank new conversation, i.e. whether the shared
 * shell switch may show. The answer comes from the message model and the
 * conversation summaries, never from the DOM:
 * - an in-flight first send counts as started immediately, before the reply;
 * - a loaded conversation with messages is not blank, and neither is a
 *   conversation whose summary already reports messages while its history is
 *   still loading (so switching to an existing conversation never flashes it);
 * - a restored session is not judged blank until bootstrap has reported the
 *   conversation list.
 */
function chatPageIsBlank(state) {
  if (state.sending === true || state.streaming !== null) return false
  if (state.messages.length > 0) return false
  if (state.activeId === null) return true
  const summary = state.conversations.find(item => item.id === state.activeId)
  if (summary !== undefined) return (summary.messageCount ?? 0) === 0
  return state.boot === 'ready'
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

/** Mirror the send guard into the store so the shell switch hides on send. */
function markSendInFlight(value) {
  sendInFlight = value
  if (chatStore.state.sending !== value) chatStore.set({ sending: value })
}

/** Display name accepted for the greeting: trimmed; the account name is shown as-is. */
function greetingUserName(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Resolve one greeting option for the current name. Name-capable options use
 * their personalized form only with a real display name; every other case reads
 * the natural no-name form.
 * @param t - translator bound to the Chat namespace.
 * @param index - greeting index from the store.
 * @param userName - latest account display name, possibly empty.
 * @returns the greeting line.
 */
function greetingText(t, index, userName) {
  const option = GREETINGS[index] ?? GREETINGS[0]
  const name = greetingUserName(userName)
  if (name !== '' && option.named !== undefined) return t(option.named, { name })
  return t(option.plain)
}

let profileFetchedAt = 0
const PROFILE_REFRESH_MS = 60 * 1000

/**
 * Read the account display name. The Chat Host route is preferred (it keeps
 * account access on the Host and caches the answer); an older Host half that
 * does not serve it yet falls back to the account Remote the shell already
 * mounts, so the greeting personalizes without waiting for a Host reload.
 * @param locale - active UI language for the Platform request.
 * @returns `{ name, resolved }`; `resolved: false` means a temporary failure, so
 * the caller keeps the last known name instead of clearing it.
 */
async function readUserProfileName(locale) {
  try {
    const data = await hostJson(`/api/deepseek-chat/profile?locale=${locale}`)
    return { name: greetingUserName(data?.name), resolved: data?.resolved !== false }
  } catch {
    // The running Host half may predate the profile route.
  }
  try {
    const service = appCtx?.get?.('remote.account')
    if (service === undefined || typeof service.getProfile !== 'function') return { name: '', resolved: false }
    const release = globalThis.__DSH_BOOT__?.release
    const version = typeof release?.version === 'string' && release.version !== '' ? release.version : '0.1.0'
    const result = await service.getProfile({
      version,
      locale,
      timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
    })
    if (result?.ok !== true) return { name: '', resolved: false }
    const profile = result.value
    if (profile?.status !== 'ready') return { name: '', resolved: true }
    return { name: greetingUserName(profile.value?.name), resolved: true }
  } catch {
    return { name: '', resolved: false }
  }
}

/**
 * Refresh the personalized greeting from the Host. Personalization is optional:
 * a Host without the profile route, a signed-out account, or an offline
 * Platform keeps the last known name (or the localized fallback) and never
 * interrupts the Chat surface. A resolved empty name clears a stale account
 * name after sign-out or an account switch.
 */
async function refreshUserProfile(force = false) {
  const now = Date.now()
  if (!force && profileFetchedAt !== 0 && now - profileFetchedAt < PROFILE_REFRESH_MS) return
  profileFetchedAt = now
  const locale = (appCtx?.locale.getSnapshot().active ?? '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
  const { name, resolved } = await readUserProfileName(locale)
  if (!resolved) {
    // Retry on the next Chat open rather than waiting out the throttle after a
    // transient failure.
    profileFetchedAt = 0
    return
  }
  if (name !== chatStore.state.userName) {
    chatStore.set({ userName: name })
    writeStored({ userName: name })
  }
}

async function ensureBoot(force = false) {
  if (!force && (chatStore.state.boot === 'ready' || chatStore.state.boot === 'loading')) {
    return bootPromise ?? Promise.resolve()
  }
  if (bootPromise !== null && !force) return bootPromise
  chatStore.set({ boot: 'loading', bootError: '' })
  bootPromise = (async () => {
    void refreshUserProfile()
    try {
      const data = await hostJson('/api/deepseek-chat/bootstrap')
      chatStore.set({
        boot: 'ready',
        bootData: data,
        auth: data.auth,
        settings: data.settings,
        models: Array.isArray(data.models) && data.models.length > 0 ? data.models : chatStore.state.models,
        modelConfig: data.modelConfig ?? chatStore.state.modelConfig,
        conversations: data.conversations ?? [],
        folders: Array.isArray(data.folders) ? data.folders : [],
        workspaces: Array.isArray(data.workspaces) ? data.workspaces : [],
        limits: normalizeLimits(data.limits),
      })
      // A signed-out account has no display name: stop showing the last one.
      if (data.auth?.accountSignedIn === false && chatStore.state.userName !== '') {
        chatStore.set({ userName: '' })
        writeStored({ userName: '' })
      }
      const active = chatStore.state.activeId
      const exists = active !== null && (data.conversations ?? []).some(item => item.id === active)
      if (active !== null && exists) {
        await loadConversation(active, { quiet: true })
      } else if (active !== null) {
        chatStore.set({ activeId: null, messages: [] })
        writeStored({ activeId: null })
      }
      applyModelConfigFor(chatStore.state.activeId)
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

async function loadConversation(id, { quiet = false, focusMessageId = '' } = {}) {
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
  // Keep the text this conversation was leaving behind, then load the target's
  // own draft instead of starting from an empty field.
  stashDraft()
  clearComposer()
  const sequence = ++conversationLoadSequence
  chatStore.set({ activeId: id, conversationLoading: true, conversationError: '', editingId: null, editDraft: '' })
  applyModelConfigFor(id)
  writeStored({ activeId: id })
  try {
    const body = { action: 'get', id }
    if (typeof focusMessageId === 'string' && focusMessageId !== '') body.focusMessageId = focusMessageId
    const data = await hostJson('/api/deepseek-chat/conversation', body)
    if (sequence !== conversationLoadSequence) return
    const patch = {
      messages: Array.isArray(data.conversation?.messages) ? data.conversation.messages : [],
      conversationLoading: false,
      conversationError: '',
      focusMessage: body.focusMessageId ? { id: body.focusMessageId, at: Date.now() } : null,
    }
    if (Array.isArray(data.folders)) patch.folders = data.folders
    chatStore.set(patch)
    restoreDraft(id)
  } catch (error) {
    if (sequence !== conversationLoadSequence) return
    const message = error instanceof Error ? error.message : String(error)
    chatStore.set({ conversationLoading: false, messages: [], conversationError: message })
    if (!quiet) chatStore.toast(message, 'error')
  }
}

function openChat() {
  // Chat is a full view: a native right panel painted above the frame overlay
  // would otherwise cover it. The native service owns this action, so the
  // Agent layout stays consistent when the user switches back.
  try {
    appCtx?.get?.('layout')?.closeRightbar?.()
  } catch {
    // Optional service: the mode still opens without it.
  }
  chatStore.set({ open: true, focusRequest: chatStore.state.focusRequest + 1 })
  writeStored({ open: true })
  void ensureBoot()
  void refreshUserProfile()
}

function closeChat() {
  handoffSequence += 1
  chatStore.set({ open: false, settingsOpen: false, confirm: null, handoff: null })
  writeStored({ open: false })
}

function requestFocus() {
  chatStore.set({ focusRequest: chatStore.state.focusRequest + 1 })
}

/**
 * Set the Chat sidebar width within the shared 264-420px contract, also keeping
 * the chat column usable on a narrow window. The resizer calls this for every
 * drag frame; `saveSidebarWidth` persists the settled preference.
 */
function setSidebarWidth(width) {
  const viewport = typeof window !== 'undefined' ? window.innerWidth : undefined
  const next = clampSidebarWidth(width, viewport)
  if (next !== chatStore.state.sidebarWidth) chatStore.set({ sidebarWidth: next })
}

function saveSidebarWidth() {
  writeStored({ sidebarWidth: chatStore.state.sidebarWidth })
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
  stashDraft()
  clearComposer()
  chatStore.set({
    activeId: null,
    messages: [],
    conversationError: '',
    renamingId: null,
    editingId: null,
    editDraft: '',
    focusMessage: null,
    menu: null,
    greetingIndex: pickGreetingIndex(chatStore.state.greetingIndex),
    focusRequest: chatStore.state.focusRequest + 1,
  })
  applyModelConfigFor(null)
  restoreDraft(null)
  writeStored({ activeId: null })
}

async function createConversation() {
  const data = await hostJson('/api/deepseek-chat/conversation', { action: 'create' })
  const summary = conversationSummary(data.conversation)
  const conversations = Array.isArray(data.summaries)
    ? sortConversations(data.summaries)
    : sortConversations([summary, ...chatStore.state.conversations])
  chatStore.set({
    activeId: data.conversation.id,
    conversations,
    ...(Array.isArray(data.folders) ? { folders: data.folders } : {}),
    messages: [],
    conversationError: '',
    editingId: null,
    editDraft: '',
    focusMessage: null,
  })
  applyModelConfigFor(data.conversation.id)
  writeStored({ activeId: data.conversation.id })
  return data.conversation.id
}

async function renameConversation(id, title) {
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', { action: 'rename', id, title })
    if (Array.isArray(data.summaries)) applyOrganization(data)
    else upsertSummary(conversationSummary(data.conversation))
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
          applyOrganization({
            summaries: data.summaries ?? chatStore.state.conversations.filter(item => item.id !== id),
            folders: data.folders,
          })
          if (chatStore.state.activeId === id) {
            clearComposer()
            forgetDraft(id)
            chatStore.set({
              activeId: null,
              messages: [],
              conversationError: '',
              editingId: null,
              editDraft: '',
              focusMessage: null,
              greetingIndex: pickGreetingIndex(chatStore.state.greetingIndex),
            })
            writeStored({ activeId: null })
          }
        } catch (error) {
          chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
        }
      },
    },
  })
}

// ---------------------------------------------------------------------------
// Conversation organization: pin, archive, folders and the floating menu.
// ---------------------------------------------------------------------------

function openConversationMenu(conversationId, x, y) {
  chatStore.set({ menu: { kind: 'conversation', id: conversationId, x, y } })
}

function openFolderMenu(folderId, x, y) {
  chatStore.set({ menu: { kind: 'folder', id: folderId, x, y } })
}

function closeMenu() {
  if (chatStore.state.menu !== null) chatStore.set({ menu: null })
}

async function setPinned(id, pinned) {
  closeMenu()
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', { action: 'pin', id, pinned })
    applyOrganization(data)
  } catch (error) {
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

async function setArchived(id, archived) {
  closeMenu()
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', { action: 'archive', id, archived })
    applyOrganization(data)
    chatStore.toast(archived ? tr('archivedToast') : tr('unarchivedToast'), 'success')
  } catch (error) {
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

function requestFolderPrompt(mode, folder = null) {
  closeMenu()
  chatStore.set({
    folderPrompt: {
      mode: mode === 'rename' ? 'rename' : 'create',
      id: folder?.id ?? null,
      draft: mode === 'rename' ? (folder?.name ?? '') : '',
      busy: false,
    },
  })
}

function updateFolderPrompt(draft) {
  const prompt = chatStore.state.folderPrompt
  if (prompt === null) return
  chatStore.set({ folderPrompt: { ...prompt, draft } })
}

function closeFolderPrompt() {
  if (chatStore.state.folderPrompt?.busy === true) return
  chatStore.set({ folderPrompt: null })
}

async function submitFolderPrompt() {
  const prompt = chatStore.state.folderPrompt
  if (prompt === null || prompt.busy) return
  const name = typeof prompt.draft === 'string' ? prompt.draft.trim() : ''
  if (name === '') return
  chatStore.set({ folderPrompt: { ...prompt, busy: true } })
  try {
    const data = prompt.mode === 'rename'
      ? await hostJson('/api/deepseek-chat/conversation', { action: 'folder.rename', id: prompt.id, name })
      : await hostJson('/api/deepseek-chat/conversation', { action: 'folder.create', name })
    applyOrganization(data)
    chatStore.set({ folderPrompt: null })
  } catch (error) {
    const current = chatStore.state.folderPrompt
    if (current !== null) chatStore.set({ folderPrompt: { ...current, busy: false } })
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

async function toggleFolder(id) {
  const folder = chatStore.state.folders.find(item => item.id === id)
  if (folder === undefined) return
  const collapsed = folder.collapsed !== true
  chatStore.set({
    folders: chatStore.state.folders.map(item => (item.id === id ? { ...item, collapsed } : item)),
  })
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', { action: 'folder.collapse', id, collapsed })
    if (Array.isArray(data.folders)) chatStore.set({ folders: data.folders })
  } catch (error) {
    chatStore.set({
      folders: chatStore.state.folders.map(item => (item.id === id ? { ...item, collapsed: !collapsed } : item)),
    })
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

function requestDeleteFolder(folder) {
  closeMenu()
  const count = chatStore.state.conversations.filter(item => item.folderId === folder.id).length
  chatStore.set({
    confirm: {
      title: tr('deleteFolderTitle'),
      message: tr('deleteFolderMessage', { name: folder.name, count }),
      confirmLabel: tr('deleteConfirm'),
      danger: true,
      onConfirm: async () => {
        try {
          const data = await hostJson('/api/deepseek-chat/conversation', { action: 'folder.delete', id: folder.id })
          applyOrganization(data)
        } catch (error) {
          chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
        }
      },
    },
  })
}

function openMoveChat(conversationId) {
  closeMenu()
  const conversation = chatStore.state.conversations.find(item => item.id === conversationId)
  if (conversation === undefined) return
  chatStore.set({
    moveChat: { conversationId, folderId: conversation.folderId ?? null, busy: false },
  })
}

function setMoveChatFolder(folderId) {
  const move = chatStore.state.moveChat
  if (move === null) return
  chatStore.set({ moveChat: { ...move, folderId: folderId === '' ? null : folderId } })
}

function closeMoveChat() {
  if (chatStore.state.moveChat?.busy === true) return
  chatStore.set({ moveChat: null })
}

/** One-click move used by the "remove from folder" menu item. */
async function moveConversationToFolder(conversationId, folderId) {
  closeMenu()
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', {
      action: 'move',
      ids: [conversationId],
      folderId: folderId ?? null,
    })
    applyOrganization(data)
    chatStore.toast(tr('chatMoved'), 'success')
  } catch (error) {
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

async function submitMoveChat() {
  const move = chatStore.state.moveChat
  if (move === null || move.busy) return
  chatStore.set({ moveChat: { ...move, busy: true } })
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', {
      action: 'move',
      ids: [move.conversationId],
      folderId: move.folderId,
    })
    applyOrganization(data)
    chatStore.set({ moveChat: null })
    chatStore.toast(tr('chatMoved'), 'success')
  } catch (error) {
    const current = chatStore.state.moveChat
    if (current !== null) chatStore.set({ moveChat: { ...current, busy: false } })
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

function openFolderAdd(folderId) {
  closeMenu()
  const folder = chatStore.state.folders.find(item => item.id === folderId)
  if (folder === undefined) return
  chatStore.set({ folderAdd: { folderId, name: folder.name, selected: [], busy: false } })
}

function toggleFolderAddSelection(conversationId) {
  const add = chatStore.state.folderAdd
  if (add === null) return
  const selected = add.selected.includes(conversationId)
    ? add.selected.filter(id => id !== conversationId)
    : [...add.selected, conversationId]
  chatStore.set({ folderAdd: { ...add, selected } })
}

function closeFolderAdd() {
  if (chatStore.state.folderAdd?.busy === true) return
  chatStore.set({ folderAdd: null })
}

async function submitFolderAdd() {
  const add = chatStore.state.folderAdd
  if (add === null || add.busy || add.selected.length === 0) return
  chatStore.set({ folderAdd: { ...add, busy: true } })
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', {
      action: 'move',
      ids: add.selected,
      folderId: add.folderId,
    })
    applyOrganization(data)
    const count = add.selected.length
    chatStore.set({ folderAdd: null })
    chatStore.toast(tr('chatsMoved', { count }), 'success')
  } catch (error) {
    const current = chatStore.state.folderAdd
    if (current !== null) chatStore.set({ folderAdd: { ...current, busy: false } })
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}

function openArchive() {
  closeMenu()
  chatStore.set({ archiveOpen: true })
}

function closeArchive() {
  chatStore.set({ archiveOpen: false })
}

function searchHistory(query) {
  return hostJson('/api/deepseek-chat/conversation', { action: 'search', query })
}

/** Open a search hit, reopening the branch it lives on when necessary. */
async function openSearchResult(result) {
  if (result === null || typeof result !== 'object' || typeof result.id !== 'string') return
  const target = typeof result.messageId === 'string' ? result.messageId : ''
  if (result.id === chatStore.state.activeId) {
    try {
      const data = await hostJson('/api/deepseek-chat/conversation', {
        action: 'get',
        id: result.id,
        ...(target === '' ? {} : { focusMessageId: target }),
      })
      if (Array.isArray(data.conversation?.messages)) {
        chatStore.set({
          messages: data.conversation.messages,
          conversationLoading: false,
          conversationError: '',
          editingId: null,
          editDraft: '',
          focusMessage: target === '' ? null : { id: target, at: Date.now() },
        })
      }
      if (Array.isArray(data.folders)) chatStore.set({ folders: data.folders })
    } catch (error) {
      chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
    }
    return
  }
  await loadConversation(result.id, { focusMessageId: target })
}

/** Step one sibling version backward or forward and reopen that branch. */
async function selectVersion(messageId, direction) {
  const state = chatStore.state
  if (state.activeId === null) return
  if (state.streaming !== null || sendInFlight) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  closeMenu()
  try {
    const data = await hostJson('/api/deepseek-chat/conversation', {
      action: 'version',
      id: state.activeId,
      messageId,
      direction: direction < 0 ? 'prev' : 'next',
    })
    if (Array.isArray(data.summaries)) applyOrganization(data)
    const messages = data.conversation?.messages
    if (Array.isArray(messages)) {
      chatStore.set({
        messages,
        conversationError: '',
        editingId: null,
        editDraft: '',
        focusMessage: { id: typeof data.selectedId === 'string' ? data.selectedId : messageId, at: Date.now() },
      })
    }
  } catch (error) {
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
  }
}



let settingsSequence = 0
let settingsChain = Promise.resolve()

async function saveSettings(patch, { quiet = true, rollback = null } = {}) {
  const sequence = ++settingsSequence
  const before = rollback ?? chatStore.state.settings
  chatStore.set({ settings: { ...chatStore.state.settings, ...patch } })
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
    if (sequence === settingsSequence) chatStore.set({ settings: before })
    chatStore.toast(tr('settingsSaveFailed', { message: error instanceof Error ? error.message : String(error) }), 'error')
    return false
  }
}

function toggleThinking() {
  const before = chatStore.state.settings
  const next = !before.thinking
  chatStore.set({ settings: { ...before, thinking: next } })
  void saveSettings({ thinking: next }, { rollback: before })
}

function toggleSearch() {
  const before = chatStore.state.settings
  const next = !before.search
  chatStore.set({ settings: { ...before, search: next } })
  void saveSettings({ search: next }, { rollback: before })
}

/* ------------------------------------------------------------------------- */
/* Model preference                                                          */
/* ------------------------------------------------------------------------- */

/**
 * Point the composer at the model configuration of one conversation.
 * `id === null` is the blank new-chat page, which uses the Host defaults.
 * The raw ids are stored; the model menu normalises them against the catalog,
 * so an id this Host no longer serves can never break the composer.
 */
function applyModelConfigFor(id) {
  const config = chatStore.state.modelConfig
  const override = id !== null && config?.conversations?.[id] !== undefined ? config.conversations[id] : null
  const model = override?.model ?? config?.defaults?.model ?? 'deepseek-flash'
  const effort = override?.effort ?? config?.defaults?.effort ?? 'high'
  chatStore.set({ modelChoice: { model, effort } })
}

/**
 * Persist one model/effort change. A blank chat updates the default for new
 * conversations; an open conversation stores its own override. The UI updates
 * first and rolls back when the Host rejects the write.
 */
async function saveModelChoice(patch) {
  const before = chatStore.state.modelChoice
  const conversationId = chatStore.state.activeId
  chatStore.set({ modelChoice: { ...before, ...patch } })
  try {
    const data = await hostJson('/api/deepseek-chat/model', {
      action: 'set',
      ...(conversationId === null ? {} : { conversationId }),
      ...patch,
    })
    if (data?.modelConfig !== undefined) {
      chatStore.set({
        modelConfig: data.modelConfig,
        models: Array.isArray(data.models) && data.models.length > 0 ? data.models : chatStore.state.models,
      })
    }
    return true
  } catch (error) {
    if (error?.status === 404) {
      // An older Host half has no model route; keep the local choice and make
      // no promise about persistence instead of alarming the user.
      return false
    }
    chatStore.set({ modelChoice: before })
    chatStore.toast(tr('modelConfigFailed', {
      message: error instanceof Error ? error.message : String(error),
    }), 'error')
    return false
  }
}

function selectModel(modelId) {
  const model = modelCatalog().find(item => item.id === modelId)
  if (model === undefined) return
  const efforts = modelEfforts(model)
  const current = chatStore.state.modelChoice
  const effort = efforts.includes(current.effort) ? current.effort : (efforts.includes('high') ? 'high' : efforts[0])
  void saveModelChoice({ model: model.id, effort })
}

function selectEffort(effort) {
  const { efforts } = currentModelChoice()
  if (!efforts.includes(effort)) return
  void saveModelChoice({ effort })
}

/**
 * A request that names a model this API no longer serves is recoverable: fall
 * back to the default model so the retry button does the useful thing instead
 * of failing again.
 */
function recoverUnavailableModel(payload) {
  if (payload?.code !== 'INVALID_MODEL') return false
  const fallback = modelCatalog().find(model => model.id === 'deepseek-flash') ?? modelCatalog()[0]
  if (fallback !== undefined) void saveModelChoice({ model: fallback.id, effort: 'high' })
  chatStore.toast(tr('modelUnavailable'), 'warning')
  return true
}

/** Composer send key preference; browser-only, so it never needs the Host. */
function setSendKey(mode) {
  const next = mode === 'ctrl-enter' ? 'ctrl-enter' : 'enter'
  chatStore.set({ sendKey: next })
  writeStored({ sendKey: next })
}

/* ------------------------------------------------------------------------- */
/* Per-conversation drafts                                                   */
/* ------------------------------------------------------------------------- */

/**
 * Unsent text for each conversation, so switching chats or pressing "New chat"
 * does not throw away half-written prompts. Attachments are deliberately not
 * kept: their upload streams are aborted on a switch.
 */
const draftStash = new Map()

function stashDraft() {
  draftStash.set(chatStore.state.activeId ?? '__new__', chatStore.state.draft)
}

function restoreDraft(id) {
  const key = id ?? '__new__'
  if (!draftStash.has(key)) return
  chatStore.set({ draft: draftStash.get(key) ?? '' })
}

function forgetDraft(id) {
  draftStash.delete(id ?? '__new__')
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
  const limits = chatStore.state.limits
  const bytes = LAYOUT_EXT.has(fileExtension(name)) || isImageName(name, '') ? limits.maxUploadBytes : limits.maxUserDataBytes
  return bytes / 1024 / 1024
}

function normalizeLimits(input) {
  const value = input !== null && typeof input === 'object' ? input : {}
  const positive = (candidate, fallback) => (typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0 ? candidate : fallback)
  return {
    maxFiles: Math.floor(positive(value.maxFiles, MAX_FILES)),
    maxUploadBytes: positive(value.maxUploadBytes, MAX_UPLOAD_MB * 1024 * 1024),
    maxUserDataBytes: positive(value.maxUserDataBytes, MAX_USER_DATA_MB * 1024 * 1024),
  }
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
  const maxFiles = chatStore.state.limits.maxFiles
  if (existing + files.length > maxFiles) {
    chatStore.toast(tr('tooManyFiles', { count: maxFiles }), 'warning')
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

/**
 * Consume one NDJSON turn stream.
 *
 * `initialMessages` is the optimistic branch shown immediately; the Host's
 * `start` frame replaces it with the authoritative active path (including new
 * ids, version positions and file metadata). Events are folded into
 * `assistant` and painted on the next animation frame.
 *
 * `restorePreStart` runs when the request failed or was cancelled before the
 * Host acknowledged the turn: the caller decides whether that means putting the
 * draft back in the composer (a fresh send) or restoring the previous branch
 * (an edit or regeneration).
 */
async function runTurnStream({
  conversationId, payload, assistant, initialMessages, userId = null, restorePreStart,
}) {
  const controller = new AbortController()
  const holder = { controller, conversationId, assistantId: assistant.id, userId, startedAt: Date.now() }
  chatStore.set({
    messages: initialMessages,
    streaming: holder,
    stopping: false,
    conversationError: '',
  })
  markSendInFlight(true)
  let current = assistant
  let started = false
  let finished = false
  const indexes = new Map()
  let frame = 0
  const flush = () => {
    frame = 0
    if (!finished) replaceAssistant(current)
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
    if (!finished) {
      finished = true
      replaceAssistant(current)
    }
    const streaming = chatStore.state.streaming
    if (streaming !== null && (streaming.assistantId === current.id || streaming.assistantId === assistant.id)) {
      chatStore.set({ streaming: null, stopping: false })
    }
  }
  const restore = () => {
    if (typeof restorePreStart === 'function') restorePreStart()
    chatStore.set({ streaming: null, stopping: false })
  }
  const applyTitle = (title, titleAuto) => {
    if (typeof title !== 'string' || title === '') return
    const summary = chatStore.state.conversations.find(entry => entry.id === conversationId)
    if (summary) upsertSummary({ ...summary, title, ...(titleAuto === undefined ? {} : { titleAuto }) })
  }
  try {
    await streamChat(payload, {
      signal: controller.signal,
      onItem(item) {
        if (item.type === 'start') {
          started = true
          const hostAssistantId = typeof item.assistantMessageId === 'string' && item.assistantMessageId !== ''
            ? item.assistantMessageId
            : current.id
          current = { ...current, id: hostAssistantId }
          let messages
          if (Array.isArray(item.messages) && item.messages.length > 0) {
            messages = withFilePreviews(item.messages, chatStore.state.messages)
          } else {
            // Older Host halves only send the ids; patch the optimistic branch.
            const hostUserId = typeof item.userMessage?.id === 'string' ? item.userMessage.id : null
            const hostFiles = Array.isArray(item.userMessage?.files) ? item.userMessage.files : null
            messages = chatStore.state.messages.map((message) => {
              if (message.id === assistant.id) return { ...message, id: hostAssistantId }
              if (hostUserId !== null && message.id === userId) {
                return { ...message, id: hostUserId, ...(hostFiles === null ? {} : { files: hostFiles }) }
              }
              return message
            })
          }
          const streaming = chatStore.state.streaming
          chatStore.set({
            messages,
            streaming: streaming === null ? null : {
              ...streaming,
              assistantId: hostAssistantId,
              userId: typeof item.userMessageId === 'string' ? item.userMessageId : streaming.userId,
            },
          })
          applyTitle(item.title)
          return
        }
        if (item.type === 'event') {
          current = applyClientEvent(current, item.event, indexes)
          schedule()
          return
        }
        if (item.type === 'title') {
          applyTitle(item.title, false)
          return
        }
        if (item.type === 'done') {
          if (item.message) current = { ...item.message }
          if (item.conversation) upsertSummary(item.conversation)
          finish()
          return
        }
        if (item.type === 'error') {
          const info = friendlyError(item.error)
          current = item.message
            ? { ...item.message }
            : { ...current, status: 'error', error: item.error ?? { message: info.text }, updatedAt: Date.now() }
          finish()
          const recovered = recoverUnavailableModel(item.error)
          if (!recovered) chatStore.toast(info.text, 'error')
          if (info.action === 'settings') chatStore.set({ settingsOpen: true })
          return
        }
        if (item.type === 'aborted') {
          current = item.message ? { ...item.message } : { ...current, status: 'stopped', updatedAt: Date.now() }
          finish()
        }
      },
    })
    if (chatStore.state.streaming !== null) {
      current = { ...current, status: 'stopped', updatedAt: Date.now() }
      finish()
    }
  } catch (error) {
    if (controller.signal.aborted) {
      if (!started) {
        restore()
        return
      }
      current = { ...current, status: 'stopped', updatedAt: Date.now() }
      finish()
    } else {
      const payloadInfo = error?.payload ?? { message: error instanceof Error ? error.message : String(error) }
      const info = friendlyError(payloadInfo, payloadInfo.message)
      const recovered = recoverUnavailableModel(payloadInfo)
      if (!started) {
        restore()
        if (!recovered) chatStore.toast(info.text, 'error')
        if (info.action === 'settings') chatStore.set({ settingsOpen: true })
        return
      }
      current = { ...current, status: 'error', error: payloadInfo, updatedAt: Date.now() }
      finish()
      if (!recovered) chatStore.toast(info.text, 'error')
      if (info.action === 'settings') chatStore.set({ settingsOpen: true })
    }
  } finally {
    if (!finished) finish()
    markSendInFlight(false)
  }
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
  const choice = currentModelChoice()
  if (!modelCapability(choice.model, 'vision') && readyFiles.some(item => item.isImage)) {
    chatStore.toast(tr('modelUnsupportedImage'), 'warning')
    return
  }
  if (sendInFlight) return
  markSendInFlight(true)

  let conversationId = state.activeId
  try {
    if (conversationId === null) conversationId = await createConversation()
  } catch (error) {
    markSendInFlight(false)
    chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
    return
  }
  if (chatStore.state.streaming !== null) {
    markSendInFlight(false)
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
  const reply = makeReplyPlaceholder(state.settings, choice)
  const previousMessages = chatStore.state.messages
  const messages = [...previousMessages, userMessage, reply]
  chatStore.set({
    draft: '',
    attachments: [],
    editingId: null,
    editDraft: '',
    focusRequest: chatStore.state.focusRequest + 1,
  })
  writeStored({ activeId: conversationId })
  forgetDraft(conversationId)
  forgetDraft(null)
  await runTurnStream({
    conversationId,
    payload: {
      conversationId,
      text,
      files: userMessage.files,
      thinking: reply.thinking,
      search: reply.search,
      model: reply.model,
      effort: reply.effort,
      locale: streamLocale(),
    },
    assistant: reply,
    initialMessages: messages,
    userId: userMessage.id,
    restorePreStart: () => {
      // The Host never created the turn (auth, network or a rejected request):
      // pull the optimistic bubbles back and return text and files to the
      // composer instead of losing them.
      chatStore.set({
        messages: previousMessages,
        draft: text,
        attachments: sentAttachments,
      })
    },
  })
}

/** Open the inline editor for one historical user message. */
function beginEditMessage(message) {
  if (chatStore.state.streaming !== null || sendInFlight) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  if (message?.role !== 'user') return
  closeMenu()
  chatStore.set({ editingId: message.id, editDraft: typeof message.content === 'string' ? message.content : '' })
}

function cancelEditMessage() {
  chatStore.set({ editingId: null, editDraft: '' })
}

/**
 * Save the edited question and resend it. The Host turns it into a sibling
 * branch: everything before the question stays shared, the old answer subtree
 * is preserved as a version, and only the new branch is sent to the model.
 */
async function saveEditedMessage() {
  const state = chatStore.state
  const id = state.editingId
  if (id === null) return
  if (state.streaming !== null || sendInFlight) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  const message = state.messages.find(item => item.id === id)
  if (message === undefined || message.role !== 'user' || state.activeId === null) {
    chatStore.set({ editingId: null, editDraft: '' })
    return
  }
  if (!state.auth?.ready) {
    chatStore.set({ settingsOpen: true })
    chatStore.toast(tr('noAuthBody'), 'warning')
    return
  }
  const text = state.editDraft.trim()
  const files = hostFiles(message.files)
  if (text === '' && files.length === 0) return
  const index = state.messages.findIndex(item => item.id === id)
  if (index < 0) return
  const previousMessages = state.messages
  const conversationId = state.activeId
  const optimisticUser = {
    ...message,
    id: uid(),
    content: text,
    createdAt: Date.now(),
    files: (message.files ?? []).map(file => ({ ...file })),
  }
  const reply = makeReplyPlaceholder(state.settings)
  const messages = [...previousMessages.slice(0, index), optimisticUser, reply]
  chatStore.set({ editingId: null, editDraft: '', focusRequest: state.focusRequest + 1 })
  await runTurnStream({
    conversationId,
    payload: {
      conversationId,
      mode: 'edit',
      targetMessageId: id,
      text,
      files,
      thinking: reply.thinking,
      search: reply.search,
      locale: streamLocale(),
    },
    assistant: reply,
    initialMessages: messages,
    userId: optimisticUser.id,
    restorePreStart: () => chatStore.set({
      messages: previousMessages,
      editingId: id,
      editDraft: text,
    }),
  })
}

/** Regenerate one answer as a new sibling version under the same question. */
async function regenerateMessage(message) {
  const state = chatStore.state
  if (state.streaming !== null || sendInFlight) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  if (state.activeId === null || !state.auth?.ready) {
    if (!state.auth?.ready) chatStore.set({ settingsOpen: true })
    return
  }
  const index = state.messages.findIndex(item => item.id === message?.id)
  if (index < 1) return
  const user = state.messages[index - 1]
  if (user?.role !== 'user' || typeof user.id !== 'string') return
  closeMenu()
  const previousMessages = state.messages
  const reply = makeReplyPlaceholder(state.settings)
  const messages = [...previousMessages.slice(0, index), reply]
  const conversationId = state.activeId
  await runTurnStream({
    conversationId,
    payload: {
      conversationId,
      mode: 'regenerate',
      targetMessageId: message.id,
      thinking: reply.thinking,
      search: reply.search,
      locale: streamLocale(),
    },
    assistant: reply,
    initialMessages: messages,
    userId: user.id,
    restorePreStart: () => chatStore.set({ messages: previousMessages }),
  })
}

/** Resume a cut-off answer from its visible text prefix. */
async function continueMessage(message) {
  const state = chatStore.state
  if (state.streaming !== null || sendInFlight) {
    chatStore.toast(tr('waitStreaming'), 'warning')
    return
  }
  if (state.activeId === null || !state.auth?.ready) {
    if (!state.auth?.ready) chatStore.set({ settingsOpen: true })
    return
  }
  if (!canContinueReply(message)) {
    chatStore.toast(tr('cannotContinue'), 'warning')
    return
  }
  closeMenu()
  const previousMessages = state.messages
  const index = previousMessages.findIndex(item => item.id === message.id)
  const user = index > 0 ? previousMessages[index - 1] : null
  // The continuation is a new request: show the model that will handle it and
  // send that same choice explicitly, so the footer and the Host agree.
  const choice = currentModelChoice()
  const reply = { ...message, status: 'streaming', error: undefined, model: choice.model.id, effort: choice.effort }
  const messages = previousMessages.map(item => (item.id === message.id ? reply : item))
  const conversationId = state.activeId
  await runTurnStream({
    conversationId,
    payload: {
      conversationId,
      mode: 'continue',
      targetMessageId: message.id,
      model: reply.model,
      effort: reply.effort,
      locale: streamLocale(),
    },
    assistant: reply,
    initialMessages: messages,
    userId: user?.role === 'user' ? user.id : null,
    restorePreStart: () => chatStore.set({ messages: previousMessages }),
  })
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

/** The handoff workspace select's sentinel for the inline creation panel. */
const NEW_WORKSPACE_OPTION = '__dsc_new_workspace__'

/** Last path segment, for either separator (paths arrive from the Host as-is). */
function pathBasename(value) {
  const input = typeof value === 'string' ? value.replace(/[\\/]+$/, '') : ''
  if (input === '') return ''
  const index = Math.max(input.lastIndexOf('\\'), input.lastIndexOf('/'))
  return index < 0 ? input : input.slice(index + 1)
}

/** Directory containing `value`; used to propose where a new project folder goes. */
function pathParent(value) {
  const raw = typeof value === 'string' ? value.trim() : ''
  const input = raw.replace(/[\\/]+$/, '')
  if (input === '') return raw === '/' ? '/' : ''
  const index = Math.max(input.lastIndexOf('\\'), input.lastIndexOf('/'))
  if (index < 0) return ''
  if (index === 0) return input.startsWith('/') ? '/' : ''
  const parent = input.slice(0, index)
  return /^[A-Za-z]:$/.test(parent) ? `${parent}\\` : parent
}

/** Join a directory and one child name for display and for the Host request. */
function joinWorkspacePath(parent, name) {
  const raw = typeof parent === 'string' ? parent.trim() : ''
  const leaf = typeof name === 'string' ? name.trim() : ''
  if (raw === '') return leaf
  if (leaf === '') return raw
  const separator = /^[A-Za-z]:$/.test(raw) ? '\\' : raw.includes('\\') && !raw.includes('/') ? '\\' : '/'
  const base = raw.endsWith('/') || raw.endsWith('\\') ? raw : `${raw}${separator}`
  return `${base}${leaf}`
}

/** Whether the Host will accept this as one fixed directory location. */
function isAbsoluteWorkspacePath(value) {
  if (typeof value !== 'string') return false
  if (/^[A-Za-z]:[\\/]/.test(value) || /^\\\\[^\\]/.test(value)) return true
  return value.startsWith('/')
}

/**
 * Turn a conversation title into one folder-friendly workspace name. CJK text
 * is kept; path separators and characters Windows cannot store become dashes.
 * @param title - conversation title, possibly blank.
 * @param fallback - name used when nothing usable remains.
 */
function workspaceNameFromTitle(title, fallback = 'new-project') {
  const value = typeof title === 'string' ? title : ''
  const cleaned = value
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ')
    .replace(/[\s\u3000]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[\s.-]+|[\s.-]+$/g, '')
    .slice(0, 48)
    .replace(/[\s.-]+$/g, '')
  if (cleaned === '' || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i.test(cleaned)) return fallback
  // The Host's placeholder title names no project, so it must not become a folder.
  if (/^(新对话|新会话|new chat|new conversation|conversation)$/i.test(cleaned)) return fallback
  return cleaned
}

function workspaceWords(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(word => word.length >= 2)
}

/** Whether the conversation title shares a meaningful word with a workspace. */
function workspaceRelatesToText(text, workspace) {
  const words = workspaceWords(text)
  if (words.length === 0) return false
  const haystack = ` ${workspaceWords(`${workspace?.title ?? ''} ${workspace?.path ?? ''}`).join(' ')} `
  return words.some(word => haystack.includes(word))
}

/** Words that mark a discussion as starting something new rather than changing one. */
const NEW_PROJECT_INTENT = /(新项目|从零|新建|创建一个|开发一个|做一个|搭建一个|新插件|新游戏|新模组|新模块|模组|\bmod\b|new project|from scratch|new (?:plugin|game|mod|app|tool)|create a new|build a new)/i

/**
 * A soft hint for the handoff workspace field: the conversation reads like a
 * new project while the selected Workspace shares nothing with its title.
 * Never blocks sending; it only offers a prefilled creation shortcut.
 * @returns `{ name }` for the suggested workspace, or null when no hint applies.
 */
function handoffWorkspaceSuggestion({ title, brief, workspace, fallbackName }) {
  if (workspace === null || workspace === undefined) return null
  if (typeof title === 'string' && title.trim() !== '' && workspaceRelatesToText(title, workspace)) return null
  const intent = NEW_PROJECT_INTENT.test(`${title ?? ''}\n${brief ?? ''}`)
    || pathBasename(workspace.path ?? '') === 'default-workspace'
  if (!intent) return null
  return { name: workspaceNameFromTitle(title, fallbackName) }
}

function handoffConversationTitle() {
  const id = chatStore.state.activeId
  const conversation = chatStore.state.conversations.find(item => item.id === id)
  return typeof conversation?.title === 'string' ? conversation.title : ''
}

function handoffSelectedWorkspace() {
  const handoff = chatStore.state.handoff
  if (handoff === null) return undefined
  return chatStore.state.workspaces.find(workspace => workspace.id === handoff.workspaceId)
}

/** Whether the Host half advertises the folder-create + register capability. */
function canCreateHandoffWorkspace() {
  return chatStore.state.bootData?.handoff?.workspaceCreate === true
}

/** Strip the quotes Windows Explorer's "Copy as path" adds. */
function stripPathQuotes(value) {
  let text = typeof value === 'string' ? value.trim() : ''
  if (text.length >= 2 && ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'")))) {
    text = text.slice(1, -1).trim()
  }
  return text
}

/**
 * The single path segment a workspace name becomes when a project folder is
 * derived from it. The display name itself stays as typed; only the folder leaf
 * is cleaned so a name like `Stardew/Mod` cannot silently create nested folders.
 */
function workspaceFolderLeaf(name) {
  const value = typeof name === 'string' ? name.trim() : ''
  const cleaned = value
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.-]+|[\s.-]+$/g, '')
    .slice(0, 120)
    .replace(/[. ]+$/g, '')
  if (cleaned === '') return ''
  return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i.test(cleaned) ? `${cleaned}-` : cleaned
}

/**
 * Why the creation draft cannot be committed yet, if anything is missing.
 * @returns 'name' | 'folderName' | 'path' | 'absolute' | '' for a complete draft.
 */
function workspaceDraftIssue(draft) {
  const name = typeof draft?.name === 'string' ? draft.name.trim() : ''
  const target = stripPathQuotes(draft?.path)
  if (name === '') return 'name'
  // When the name is the new folder's leaf, it must survive path cleaning.
  if (typeof draft?.folderParent === 'string' && draft.folderParent !== ''
    && workspaceFolderLeaf(name) === '') return 'folderName'
  if (target === '') return 'path'
  if (!isAbsoluteWorkspacePath(target)) return 'absolute'
  return ''
}

/**
 * One empty creation draft. With a known Workspace, the folder is proposed next
 * to it so a new project starts where the user already keeps projects.
 */
function initialWorkspaceDraft() {
  const workspace = handoffSelectedWorkspace()
  const suggested = workspaceNameFromTitle(handoffConversationTitle(), tr('handoffWorkspaceNameFallback'))
  const base = workspace?.path ? pathParent(workspace.path) : ''
  return {
    name: suggested,
    folderParent: base,
    path: base === '' ? '' : joinWorkspacePath(base, workspaceFolderLeaf(suggested) || suggested),
    nameEdited: false,
    busy: false,
    error: '',
  }
}

function mergeWorkspaceRow(rows, row) {
  const index = rows.findIndex(item => item.id === row.id)
  if (index < 0) return [row, ...rows]
  const next = rows.slice()
  next[index] = { ...next[index], ...row }
  return next
}

function handoffPatch(patch) {
  const current = chatStore.state.handoff
  if (current === null) return
  chatStore.set({ handoff: { ...current, ...patch } })
}

function patchHandoffWorkspaceDraft(patch) {
  const draft = chatStore.state.handoff?.workspaceDraft
  if (draft === null || draft === undefined) return
  handoffPatch({ workspaceDraft: { ...draft, ...patch } })
}

/** Open the inline creation panel. */
function openHandoffWorkspaceDraft() {
  const handoff = chatStore.state.handoff
  if (handoff === null || handoff.busy === true) return
  if (handoff.workspaceDraft !== null && handoff.workspaceDraft !== undefined) return
  if (!canCreateHandoffWorkspace()) {
    handoffPatch({ error: tr('handoffWorkspaceUnavailable') })
    return
  }
  handoffPatch({ workspaceDraft: initialWorkspaceDraft(), error: '' })
}

function closeHandoffWorkspaceDraft() {
  const draft = chatStore.state.handoff?.workspaceDraft
  if (draft === null || draft === undefined || draft.busy === true) return
  handoffPatch({ workspaceDraft: null })
}

function setHandoffWorkspaceDraftName(name) {
  const draft = chatStore.state.handoff?.workspaceDraft
  if (draft === null || draft === undefined || draft.busy === true) return
  const value = typeof name === 'string' ? name.slice(0, 80) : ''
  handoffPatch({
    workspaceDraft: {
      ...draft,
      name: value,
      nameEdited: true,
      ...(draft.folderParent === ''
        ? {}
        : { path: joinWorkspacePath(draft.folderParent, workspaceFolderLeaf(value)) }),
      error: '',
    },
  })
}

function setHandoffWorkspaceDraftPath(value) {
  const draft = chatStore.state.handoff?.workspaceDraft
  if (draft === null || draft === undefined || draft.busy === true) return
  handoffPatch({
    workspaceDraft: {
      ...draft,
      path: stripPathQuotes(value),
      // A manually pinned path stops following the workspace-name field.
      folderParent: '',
      error: '',
    },
  })
}

function handoffDirectoryPicker() {
  const ui = appCtx?.get?.('uiWorkspace')
  return ui !== undefined && typeof ui.pickDirectory === 'function' ? ui : undefined
}

/**
 * Open the Host's native directory chooser.
 * @param kind - `existing` adopts the picked directory; `parent` uses it as the
 *   place where the named project folder will be created.
 */
async function pickHandoffWorkspaceDirectory(kind) {
  const draft = chatStore.state.handoff?.workspaceDraft
  if (draft === null || draft === undefined || draft.busy === true) return
  const picker = handoffDirectoryPicker()
  if (picker === undefined) {
    patchHandoffWorkspaceDraft({ error: tr('handoffWorkspacePickerUnavailable') })
    return
  }
  patchHandoffWorkspaceDraft({ busy: true, error: '' })
  let picked
  try {
    picked = await picker.pickDirectory()
  } catch (error) {
    patchHandoffWorkspaceDraft({
      busy: false,
      error: tr('handoffWorkspacePickFailed', { message: error instanceof Error ? error.message : String(error) }),
    })
    return
  }
  const current = chatStore.state.handoff?.workspaceDraft
  if (current === null || current === undefined) return
  if (typeof picked !== 'string' || picked.trim() === '') {
    patchHandoffWorkspaceDraft({ busy: false })
    return
  }
  const value = picked.trim()
  if (kind === 'parent') {
    const name = current.name.trim() === ''
      ? workspaceNameFromTitle(handoffConversationTitle(), tr('handoffWorkspaceNameFallback'))
      : current.name
    patchHandoffWorkspaceDraft({
      busy: false,
      name,
      folderParent: value,
      path: joinWorkspacePath(value, workspaceFolderLeaf(name)),
    })
    return
  }
  const name = current.nameEdited === true && current.name.trim() !== ''
    ? current.name
    : pathBasename(value)
  patchHandoffWorkspaceDraft({ busy: false, name, folderParent: '', path: value })
}

function handoffWorkspaceErrorMessage(error) {
  const code = error?.payload?.code
  if (code === 'WORKSPACE_UNAVAILABLE') return tr('handoffWorkspaceUnavailable')
  if (code === 'MKDIR_FAILED' || code === 'NOT_A_DIRECTORY') {
    return tr('handoffWorkspaceFolderFailed', { message: error instanceof Error ? error.message : String(error) })
  }
  // The Host's registration failure already says whether the folder was
  // created; wrapping it again would contradict that.
  if (code === 'WORKSPACE_CREATE_FAILED') return error instanceof Error ? error.message : String(error)
  if (error?.status === 404 || error?.status === 501) return tr('handoffRestart')
  return error instanceof Error ? error.message : String(error)
}

/**
 * Create the selected project folder (when missing) and register it through the
 * Host's native Workspace registry, then select it for the handoff. The task
 * brief, the extra requirement, and the conversation stay untouched.
 */
async function createHandoffWorkspace() {
  const handoff = chatStore.state.handoff
  const draft = handoff?.workspaceDraft
  if (handoff === null || draft === null || draft === undefined || draft.busy === true) return
  const issue = workspaceDraftIssue(draft)
  if (issue !== '') {
    const message = issue === 'name'
      ? tr('handoffWorkspaceNameRequired')
      : issue === 'folderName'
        ? tr('handoffWorkspaceNameInvalid')
        : issue === 'path' ? tr('handoffWorkspacePathRequired') : tr('handoffWorkspacePathAbsolute')
    patchHandoffWorkspaceDraft({ error: message })
    return
  }
  const name = draft.name.trim()
  const target = stripPathQuotes(draft.path)
  patchHandoffWorkspaceDraft({ busy: true, error: '' })
  let result
  try {
    result = await hostJson('/api/deepseek-chat/workspace', { title: name, path: target })
  } catch (error) {
    const latest = chatStore.state.handoff?.workspaceDraft
    if (latest !== null && latest !== undefined) {
      patchHandoffWorkspaceDraft({ busy: false, error: handoffWorkspaceErrorMessage(error) })
    }
    return
  }
  const workspace = result?.workspace
  const id = typeof workspace?.id === 'string' ? workspace.id : ''
  if (id === '') {
    patchHandoffWorkspaceDraft({
      busy: false,
      error: tr('handoffWorkspaceRegisterFailed', { message: 'missing workspace id' }),
    })
    return
  }
  const row = {
    id,
    title: typeof workspace.title === 'string' && workspace.title !== '' ? workspace.title : name,
    path: typeof workspace.path === 'string' && workspace.path !== '' ? workspace.path : target,
  }
  const created = result?.created ?? {}
  stored.workspaceId = row.id
  writeStored({ workspaceId: row.id })
  handoffPatch({ workspaceId: row.id, workspaceDraft: null, error: '' })
  chatStore.set({ workspaces: mergeWorkspaceRow(chatStore.state.workspaces, row) })
  chatStore.toast(
    created.workspace === false
      ? tr('handoffWorkspaceSelectedExisting', { name: row.title })
      : created.directory === false
        ? tr('handoffWorkspaceRegisteredExisting', { name: row.title })
        : tr('handoffWorkspaceCreated', { name: row.title }),
    'success',
  )
  // Keep the dropdown's source of truth (the Host registry) in sync; the local
  // row above already made the new workspace selectable.
  void refreshBootstrapSnapshot()
}

/** Refresh the workspace list without flashing the boot view. */
async function refreshBootstrapSnapshot() {
  try {
    const data = await hostJson('/api/deepseek-chat/bootstrap')
    const current = chatStore.state
    chatStore.set({
      workspaces: Array.isArray(data.workspaces) ? data.workspaces : current.workspaces,
      bootData: { ...(current.bootData ?? {}), ...data },
      limits: normalizeLimits(data.limits),
    })
  } catch {
    // Keep the last known snapshot; the dialog explains what is missing.
  }
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
      title: handoffConversationTitle(),
      workspaceId: defaultWorkspaceId(),
      workspaceDraft: null,
      busy: false,
      error: '',
    },
  })
  await refreshBootstrapSnapshot()
  if (chatStore.state.handoff === null) return
  handoffPatch({ workspaceId: chatStore.state.handoff.workspaceId || defaultWorkspaceId() })
  // With nothing to select, the creation panel is the only way forward — when
  // this Host can create one.
  if (chatStore.state.workspaces.length === 0 && canCreateHandoffWorkspace()) openHandoffWorkspaceDraft()
  await draftHandoff()
}

function closeHandoff() {
  const handoff = chatStore.state.handoff
  if (handoff?.busy === true || handoff?.workspaceDraft?.busy === true) return
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
  if (chatStore.state.handoff?.workspaceDraft?.busy === true) return
  stored.workspaceId = workspaceId
  handoffPatch({ workspaceId, workspaceDraft: null })
  writeStored({ workspaceId })
}

const AGENT_OPEN_ATTEMPTS = 4
const AGENT_OPEN_DELAY_MS = 350

/**
 * Open the created Session through the native workspace navigation. The
 * Session was created on the Host, so the browser's session list can lag one
 * frame behind; retry briefly instead of reporting a false success.
 */
async function openAgentSession(sessionId) {
  const uiWorkspace = appCtx?.get?.('uiWorkspace')
  if (uiWorkspace === undefined || typeof uiWorkspace.openSession !== 'function') return false
  for (let attempt = 0; attempt < AGENT_OPEN_ATTEMPTS; attempt += 1) {
    try {
      uiWorkspace.openSession(sessionId)
      try {
        appCtx?.get?.('layout')?.selectPanel?.(null)
      } catch {
        // Returning to the Conversation is a convenience, not a requirement.
      }
      return true
    } catch (error) {
      if (attempt === AGENT_OPEN_ATTEMPTS - 1) {
        console.error('deepseek-chat: could not open the Agent session', error)
        return false
      }
      await new Promise(resolve => setTimeout(resolve, AGENT_OPEN_DELAY_MS))
    }
  }
  return false
}

async function submitHandoff() {
  const handoff = chatStore.state.handoff
  if (handoff === null || handoff.busy) return
  // A creation draft has not registered its workspace yet; sending would land
  // the task in whichever workspace is still selected behind it.
  if (handoff.workspaceDraft !== null && handoff.workspaceDraft !== undefined) {
    handoffPatch({ error: tr('handoffWorkspaceRequired') })
    return
  }
  const brief = typeof handoff.brief === 'string' ? handoff.brief.trim() : ''
  if (brief === '') {
    handoffPatch({ error: tr('handoffEmpty') })
    return
  }
  const sequence = ++handoffSequence
  handoffPatch({ busy: true, error: '' })
  const conversation = chatStore.state.conversations.find(item => item.id === chatStore.state.activeId)
  let result
  try {
    result = await hostJson('/api/deepseek-chat/handoff/send', {
      prompt: brief,
      ...(handoff.workspaceId === '' ? {} : { workspaceId: handoff.workspaceId }),
      ...(conversation?.title ? { title: conversation.title } : {}),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  } catch (error) {
    if (sequence !== handoffSequence) return
    handoffPatch({
      busy: false,
      error: error?.status === 404 || error?.status === 501
        ? tr('handoffRestart')
        : error instanceof Error ? error.message : String(error),
    })
    return
  }
  const sessionId = typeof result?.sessionId === 'string' ? result.sessionId : ''
  // Open the Session before closing the Chat surface so a navigation failure
  // leaves the dialog (and its copy action) in place instead of stranding it.
  const opened = sessionId === '' ? false : await openAgentSession(sessionId)
  chatStore.set({ handoff: null })
  closeChat()
  if (!opened) {
    chatStore.toast(tr('handoffNoSession'), 'warning')
    return
  }
  if (typeof result?.warning === 'string' && result.warning !== '') {
    chatStore.toast(tr('handoffPromptPartial', { message: result.warning }), 'warning')
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
  // organization
  openConversationMenu,
  openFolderMenu,
  closeMenu,
  setPinned,
  setArchived,
  requestFolderPrompt,
  updateFolderPrompt,
  closeFolderPrompt,
  submitFolderPrompt,
  toggleFolder,
  requestDeleteFolder,
  openMoveChat,
  setMoveChatFolder,
  closeMoveChat,
  submitMoveChat,
  moveConversationToFolder,
  openFolderAdd,
  toggleFolderAddSelection,
  closeFolderAdd,
  submitFolderAdd,
  openArchive,
  closeArchive,
  searchHistory,
  openSearchResult,
  selectVersion,
  // messages
  beginEditMessage,
  cancelEditMessage,
  saveEditedMessage,
  regenerateMessage,
  continueMessage,
  // settings and composer
  saveSettings,
  toggleThinking,
  toggleSearch,
  selectModel,
  selectEffort,
  setSendKey,
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
  setSidebarWidth,
  saveSidebarWidth,
  openHandoff,
  closeHandoff,
  draftHandoff,
  setHandoffBrief,
  setHandoffInstruction,
  setHandoffWorkspace,
  openHandoffWorkspaceDraft,
  closeHandoffWorkspaceDraft,
  setHandoffWorkspaceDraftName,
  setHandoffWorkspaceDraftPath,
  pickHandoffWorkspaceDirectory,
  createHandoffWorkspace,
  submitHandoff,
}

/* ---- 30-markdown.js ---- */
/**
 * Markdown renderer for chat answers.
 *
 * It is deliberately small and safe: the parser produces a plain block tree,
 * every string reaches the DOM as a React child (never as HTML), and the three
 * heavyweight pieces live in their own modules:
 * - `highlightCode` (31-highlight.js) tokenizes fenced code,
 * - `LatexInline` / `LatexBlock` (32-math.js) render TeX,
 * - `MermaidDiagram` (33-mermaid.js) draws diagrams.
 *
 * Streaming is handled by keeping block identity stable: a completed block
 * renders the same element on every chunk, so React.memo can skip it while only
 * the growing tail is re-rendered.
 */

/** Zero-width sentinel that carries a citation number inside the answer text. */
const CITATION_MARK = '\u0000dsc-cite:'

function citationMark(index) {
  return `${CITATION_MARK}${index}\u0000`
}

const INLINE_PATTERN = new RegExp([
  '`[^`\\n]+`', // inline code
  '\\*\\*[^*\\n]+\\*\\*', // bold
  '__[^_\\n]+__',
  '\\*[^*\\n]+\\*', // italic
  '_[^_\\n]+_',
  '~~[^~\\n]+~~', // strikethrough
  '!\\[[^\\]\\n]*\\]\\([^)\\s]+\\)', // image
  '\\[[^\\]\\n]+\\]\\([^)\\s]+\\)', // link
  '\\$\\$[^$\\n]+\\$\\$', // display math kept inline by a sloppy model
  '\\$[^$\\n]+\\$', // inline math
  '\\\\\\([\\s\\S]{1,300}?\\\\\\)', // \( \) inline math
  '\\u0000dsc-cite:\\d+\\u0000', // citation marker
  'https?:\\/\\/[^\\s<>()]+', // bare URL
].join('|'), 'g')

const CITE_TOKEN = /^\u0000dsc-cite:(\d+)\u0000$/

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

/** Unescape the few escapes that matter in prose; math has its own rules. */
function unescapeText(value) {
  return value.replace(/\\([$_*[\]()#%&])/g, '$1')
}

/**
 * Whether a `$...$` candidate is really math.
 *
 * Currency is the reason this exists: `$5 and $10` must stay text. A candidate
 * is math when it is tight (no padding), not a plain number, and either uses a
 * TeX control sequence / operator, or is a short ASCII expression embedded in
 * text (`设 $x$ 为`). Anything containing CJK punctuation or prose fails.
 */
function looksLikeInlineMath(token, source, index) {
  if (token.startsWith('$$')) return true
  const body = token.slice(1, -1)
  if (body === '' || body.length > 300) return false
  if (/^\s|\s$/.test(body)) return false
  if (/^[\d.,]+$/.test(body)) return false
  const before = index > 0 ? source[index - 1] : ''
  const after = source[index + token.length] ?? ''
  if (before === '\\') return false
  if (after !== '' && /[\d]/.test(after)) return false
  if (/[A-Za-z0-9]/.test(before)) return false
  if (/[\\^_{}=<>+\-*/!|]/.test(body)) return true
  if (/[α-ωΑ-Ω]/.test(body)) return true
  if (!/^[\sA-Za-z0-9()[\].,:;' ]+$/.test(body)) return false
  return /[A-Za-z]/.test(body)
}

/** Inline rendering: strong/em/code/link/math/citation in one pass. */
function renderInline(text, keyPrefix = 'i', context = {}) {
  const source = typeof text === 'string' ? text : String(text ?? '')
  const nodes = []
  let last = 0
  let match
  // Each recursive call owns its matcher: a shared global regex would have its
  // lastIndex reset by the nested call and re-match the same token forever.
  const pattern = new RegExp(INLINE_PATTERN.source, 'g')
  while ((match = pattern.exec(source)) !== null) {
    if (match.index > last) nodes.push(unescapeText(source.slice(last, match.index)))
    const token = match[0]
    const key = `${keyPrefix}-${match.index}`
    const citation = token.match(CITE_TOKEN)
    if (citation !== null) {
      const index = Number(citation[1])
      const sourceEntry = context.sources?.[index - 1]
      const href = sourceEntry === undefined ? null : safeHref(sourceEntry.url)
      if (href !== null) {
        nodes.push(h('a', {
          key,
          className: 'dsc-cite',
          href,
          target: '_blank',
          rel: 'noreferrer noopener',
          'data-dsc-cite': index,
          title: tr('citationOpen', { index }),
        }, String(index)))
      }
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(h('code', { className: 'dsc-inline-code', key }, token.slice(1, -1)))
    } else if (token.startsWith('\\(')) {
      nodes.push(h(LatexInline, { key, tex: token.slice(2, -2) }))
    } else if (token.startsWith('$')) {
      if (token.startsWith('$$') && token.endsWith('$$') && token.length > 4) {
        // A display formula written inside a paragraph: a span keeps the
        // document valid while the block styles still lay it out on its own.
        nodes.push(h('span', { key, className: 'dsc-math dsc-math-block' }, latexToNodes(token.slice(2, -2), { display: true })))
      } else if (looksLikeInlineMath(token, source, match.index)) {
        nodes.push(h(LatexInline, { key, tex: token.slice(1, -1) }))
      } else {
        nodes.push(token)
      }
    } else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      nodes.push(h('strong', { key }, renderInline(token.slice(2, -2), key, context)))
    } else if ((token.startsWith('*') && token.endsWith('*') && token.length > 2) || (token.startsWith('_') && token.endsWith('_') && token.length > 2)) {
      nodes.push(h('em', { key }, renderInline(token.slice(1, -1), key, context)))
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      nodes.push(h('del', { key }, renderInline(token.slice(2, -2), key, context)))
    } else if (token.startsWith('![')) {
      const image = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
      const src = image ? safeHref(image[2]) : null
      if (image && src !== null) {
        nodes.push(h('img', {
          key,
          className: 'dsc-image',
          src,
          alt: image[1],
          loading: 'lazy',
          referrerPolicy: 'no-referrer',
        }))
      } else {
        nodes.push(token)
      }
    } else if (token.startsWith('[')) {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      const href = link ? safeHref(link[2]) : null
      if (link && href !== null) {
        nodes.push(h('a', {
          key, href, target: '_blank', rel: 'noreferrer noopener', className: 'dsc-link',
        }, renderInline(link[1], key, context)))
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
  if (last < source.length) nodes.push(unescapeText(source.slice(last)))
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
    || /^\s*\$\$/.test(line)
}

/** Recognise an opening display-math delimiter. */
function displayMathDelimiter(line) {
  const trimmed = line.trim()
  if (!trimmed.startsWith('$$') && !trimmed.startsWith('\\[')) return null
  if (trimmed.startsWith('$$')) return { open: '$$', close: '$$', rest: trimmed.slice(2) }
  return { open: '\\[', close: '\\]', rest: trimmed.slice(2) }
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
      const text = body.join('\n')
      blocks.push(normalizeCodeLang(lang) === 'mermaid'
        ? { type: 'mermaid', text }
        : { type: 'code', lang, text })
      continue
    }
    // Display math: `$$ ... $$` or `\[ ... \]`, on one line or across lines.
    const opening = displayMathDelimiter(line)
    if (opening !== null) {
      const single = opening.rest.trimEnd()
      if (single.endsWith(opening.close)) {
        blocks.push({ type: 'math', text: single.slice(0, -opening.close.length).trim() })
        index += 1
        continue
      }
      const body = opening.rest === '' ? [] : [opening.rest]
      index += 1
      let closed = false
      while (index < lines.length) {
        const current = lines[index]
        const trimmed = current.trim()
        if (trimmed === opening.close) {
          closed = true
          index += 1
          break
        }
        if (trimmed.length > opening.close.length && trimmed.endsWith(opening.close)) {
          const before = trimmed.slice(0, -opening.close.length).trimEnd()
          if (before !== '') body.push(before)
          closed = true
          index += 1
          break
        }
        body.push(current)
        index += 1
      }
      const text = body.join('\n').trim()
      if (!closed) {
        // No closer anywhere below: this was not display math after all (a
        // stray "$$" in prose must not swallow the rest of the answer).
        blocks.push({ type: 'paragraph', text: [line, ...body].join('\n') })
        continue
      }
      if (text !== '') blocks.push({ type: 'math', text })
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

/** Token type to CSS class. A static table keeps the class names auditable. */
const TOKEN_CLASS = {
  kw: 'dsc-tok-kw',
  str: 'dsc-tok-str',
  num: 'dsc-tok-num',
  com: 'dsc-tok-com',
  fn: 'dsc-tok-fn',
  type: 'dsc-tok-type',
  op: 'dsc-tok-op',
  attr: 'dsc-tok-attr',
  tag: 'dsc-tok-tag',
  var: 'dsc-tok-var',
  meta: 'dsc-tok-meta',
}

/** Code block with language label, token colouring, copy and internal scroll. */
const CodeBlock = React.memo(function CodeBlock({ lang, text }) {
  const [copied, setCopied] = React.useState(false)
  const canonical = normalizeCodeLang(lang)
  const label = lang.trim() === '' ? 'text' : lang.trim()
  const tokens = React.useMemo(() => highlightCode(text, canonical), [text, canonical])
  return h('div', { className: 'dsc-code' },
    h('div', { className: 'dsc-code-head' },
      h('span', { className: 'dsc-code-lang' }, label),
      h('button', {
        type: 'button',
        className: 'dsc-code-copy',
        title: tr('copy'),
        'aria-label': tr('copy'),
        onClick: () => {
          copyToClipboard(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          }).catch(() => chatStore.toast(tr('copyFailed'), 'error'))
        },
      }, h(Icon, { name: copied ? 'check' : 'copy', size: 14 }), h('span', null, copied ? tr('copied') : tr('copy'))),
    ),
    h('pre', { className: 'dsc-pre' },
      h('code', { className: 'dsc-code-body' }, tokens.map((token, tokenIndex) => {
        const tokenClass = TOKEN_CLASS[token.type]
        return tokenClass === undefined
          ? token.text
          : h('span', { key: tokenIndex, className: tokenClass }, token.text)
      })),
    ),
  )
})

function renderBlocks(blocks, context, keyPrefix = 'b') {
  return blocks.map((block, index) => renderBlock(block, `${keyPrefix}-${index}`, context, index === blocks.length - 1))
}

function renderBlock(block, key, context = {}, isLast = false) {
  if (block.type === 'paragraph') {
    return h('p', { className: 'dsc-paragraph', key }, renderInline(block.text, key, context))
  }
  if (block.type === 'heading') {
    const tag = `h${Math.min(6, Math.max(1, block.level))}`
    return h(tag, { className: 'dsc-heading', key }, renderInline(block.text, key, context))
  }
  if (block.type === 'math') {
    return h(LatexBlock, { key, tex: block.text })
  }
  if (block.type === 'mermaid') {
    // While the answer is still streaming the diagram is drawn from partial
    // text and would re-layout on every chunk; show the source instead and
    // draw once the block is settled.
    if (context.streaming && isLast) {
      return h('div', { className: 'dsc-diagram is-streaming', key },
        h(CodeBlock, { lang: 'mermaid', text: block.text }),
        h('span', { className: 'dsc-diagram-note' }, tr('streamingDiagram')),
      )
    }
    return h(MermaidDiagram, { key, source: block.text })
  }
  if (block.type === 'code') {
    return h(CodeBlock, { key, lang: block.lang, text: block.text })
  }
  if (block.type === 'quote') {
    const inner = parseMarkdown(block.text)
    return h('blockquote', { className: 'dsc-quote', key },
      inner.length === 0
        ? renderInline(block.text, key, context)
        : renderBlocks(inner, context, `${key}-q`))
  }
  if (block.type === 'hr') {
    return h('hr', { className: 'dsc-hr', key })
  }
  if (block.type === 'list') {
    const tag = block.ordered ? 'ol' : 'ul'
    return h(tag, { className: 'dsc-list', key }, block.items.map((item, itemIndex) => (
      h('li', { key: `${key}-${itemIndex}` }, renderInline(item, `${key}-${itemIndex}`, context))
    )))
  }
  if (block.type === 'table') {
    return h('div', { className: 'dsc-table-wrap', key }, h('table', { className: 'dsc-table' },
      h('thead', null, h('tr', null, block.header.map((cell, cellIndex) => h('th', { key: cellIndex }, renderInline(cell, `${key}-h-${cellIndex}`, context))))),
      h('tbody', null, block.rows.map((row, rowIndex) => h('tr', { key: rowIndex }, row.map((cell, cellIndex) => (
        h('td', { key: cellIndex }, renderInline(cell, `${key}-${rowIndex}-${cellIndex}`, context))
      ))))),
    ))
  }
  return null
}

function Markdown({ text, className = '', streaming = false, sources = [] }) {
  const context = React.useMemo(() => ({ streaming, sources }), [streaming, sources])
  const blocks = React.useMemo(() => parseMarkdown(text), [text])
  return h('div', { className: `dsc-md ${className}`.trim() },
    renderBlocks(blocks, context),
    streaming ? h('span', { className: 'dsc-caret', 'aria-hidden': 'true' }) : null,
  )
}

/* ---- 31-highlight.js ---- */
// Syntax tokenizer for chat code blocks.
//
// highlightCode(source, lang) returns plain { type, text } objects whose
// concatenated text is exactly `source`, so a renderer emits one text node per
// token. The scan is single-pass: at each position the earliest construct
// (comment, string, number, ...) is consumed and gaps stay plain. Nothing here
// builds HTML, evaluates input or touches the DOM.

const HIGHLIGHT_MAX_LENGTH = 400 * 1024
const HIGHLIGHT_MAX_REGEX = 1000
const CODE_OPERATORS = '+-*/%=!<>&|^~?:.,;()[]{}#@'
const CODE_REGEX_PREV_CHARS = '(,=:[!&|?{};'
const CODE_REGEX_WORDS = codeWordSet('return case throw typeof delete void new in of instanceof yield await do else')
const CODE_JSX_WORDS = codeWordSet('return case default else do yield await throw')
const CODE_YAML_CONSTANTS = codeWordSet('true false yes no on off null')
const CODE_NUMBER_RE = /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?)(?:(?:i|f|u)(?:8|16|32|64|128|size)|[uUlL]{1,3}|[fnjm])?/y
const CODE_IDENT_RE = /[\p{L}_$][\p{L}\p{N}_$]*/uy
const CODE_WORD_RE = /[\p{L}_$][\p{L}\p{N}_.$-]*/uy
const CODE_DECORATOR_RE = /@[\w$.]+/y
const CODE_AT_RULE_RE = /@[\w-]+/y
const CODE_CLI_FLAG_RE = /-{1,2}[A-Za-z][\w-]*/y
const CODE_CMDLET_RE = /[A-Za-z][A-Za-z0-9]*-[A-Za-z][A-Za-z0-9]+/y
const CODE_CSS_HASH_RE = /#[\w-]+/y
const CODE_CSS_CUSTOM_RE = /--[\w-]+/y
const CODE_ANCHOR_RE = /[&*!][^\s,[\]{}]*/y
const CODE_TAG_NAME_RE = /[A-Za-z][\w:.-]*/y
const CODE_ATTR_NAME_RE = /[^\s"'=<>`/{}\n]+/y
const CODE_MD_LINK_RE = /\[([^\]\n]{1,200})\]\(([^()\s]{1,500})\)/y

function codeWordSet(source) {
  return new Set(source.trim().split(/\s+/))
}

const javascriptDef = {
  keywords: codeWordSet(`break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return switch throw try typeof var void while with yield async await of static get set from as`),
  literals: codeWordSet('true false null undefined NaN Infinity'),
  types: codeWordSet('Array ArrayBuffer BigInt Boolean DataView Date Error Function Intl JSON Map Math Number Object Promise Proxy RangeError ReferenceError Reflect RegExp Set String Symbol SyntaxError TypeError URIError WeakMap WeakSet'),
  variables: codeWordSet('this super arguments'),
  lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"', "'", '`'],
  flags: { template: true, regex: true, jsx: true, stringKeys: true, keyColon: true, upperType: true, decorators: true },
}

const cppDef = {
  keywords: codeWordSet(`alignas alignof and and_eq asm auto bitand bitor bool break case catch char char8_t char16_t char32_t class compl concept const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept not not_eq nullptr operator or or_eq private protected public register reinterpret_cast requires return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while xor xor_eq`),
  literals: codeWordSet('true false nullptr NULL'),
  types: codeWordSet('bool char char8_t char16_t char32_t double float int long short signed unsigned void wchar_t size_t ssize_t ptrdiff_t int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t string wstring vector map set unordered_map unordered_set pair unique_ptr shared_ptr weak_ptr optional variant'),
  lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'], chars: ["'"],
  prefixes: /(?:u8|u|U|L)/y,
  flags: { preprocessor: true, upperType: true, keyColon: true },
}

const CODE_LANG_DEFS = {
  javascript: javascriptDef,
  typescript: {
    ...javascriptDef,
    keywords: new Set([...javascriptDef.keywords, ...codeWordSet('abstract accessor asserts declare enum global implements infer interface intrinsic is keyof module namespace override private protected public readonly satisfies type unique using')]),
    types: new Set([...javascriptDef.types, ...codeWordSet('any bigint boolean never number object string symbol unknown void')]),
  },
  json: {
    keywords: codeWordSet('true false null'),
    lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'],
    flags: { stringKeys: true },
  },
  css: {
    keywords: codeWordSet('important inherit initial unset revert'),
    blockComments: [['/*', '*/']], strings: ['"', "'"],
    units: /(?:px|em|rem|ex|ch|vh|vw|vmin|vmax|fr|deg|rad|turn|s|ms|%)/y,
    flags: { keyColon: true, hashColor: true, cssCustom: true, atRule: true },
  },
  python: {
    keywords: codeWordSet('and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'),
    literals: codeWordSet('True False None Ellipsis NotImplemented'), types: codeWordSet('bool bytearray bytes complex dict float frozenset int list object range set str tuple type'), variables: codeWordSet('self cls'),
    lineComments: ['#'], strings: ['"', "'"], triple: ['"""', "'''"], prefixes: /[rRbBuUfF]{1,2}/y,
    flags: { stringKeys: true, keyColon: true, decorators: true, upperType: true },
  },
  bash: {
    keywords: codeWordSet('if then else elif fi for while until do done case esac function in select time coproc return exit break continue local export readonly declare unset shift source alias trap wait'),
    literals: codeWordSet('true false'),
    commands: codeWordSet('echo printf read cd pwd ls cp mv rm mkdir rmdir touch cat grep egrep sed awk find xargs sort uniq head tail cut tr wc chmod chown ps kill curl wget git npm pnpm node python python3 pip docker make sudo apt brew systemctl tar gzip unzip ssh scp'),
    lineComments: ['#'], strings: ['"', "'"],
    flags: { dollarVars: true, cliFlags: true, envVars: true },
  },
  powershell: {
    keywords: codeWordSet('begin break catch class continue data define do dynamicparam else elseif end enum exit filter finally for foreach from function hidden if in param process return static switch throw trap try until using var while workflow'),
    lineComments: ['#'], blockComments: [['<#', '#>']], strings: ['"', "'"], escape: '`',
    flags: { dollarVars: true, cliFlags: true, cmdlet: true, doubleEscaped: true },
  },
  sql: {
    keywords: codeWordSet('select from where insert into values update delete set create table alter drop index view join inner left right full outer on as and or not is like between exists in union all distinct group by order having limit offset top asc desc case when then else end begin commit rollback transaction grant revoke primary key foreign references unique check default constraint add column rename procedure function trigger return if while declare cursor fetch next'),
    literals: codeWordSet('true false null'),
    types: codeWordSet('bigint binary bit blob boolean char date datetime decimal double float int integer interval json money nchar numeric nvarchar real smallint text time timestamp tinyint uuid varchar varbinary'),
    lineComments: ['--'], blockComments: [['/*', '*/']], strings: ["'", '"'], escape: '',
    flags: { caseInsensitive: true, doubleEscaped: true },
  },
  java: {
    keywords: codeWordSet('abstract assert break case catch class const continue default do else enum extends final finally for goto if implements import instanceof interface native new package private protected public return static strictfp super switch synchronized this throw throws transient try volatile while var record sealed permits yield'),
    literals: codeWordSet('true false null'), types: codeWordSet('boolean byte char double float int long short void String Object Integer Long Double Float Boolean Character Byte Short List Map Set ArrayList HashMap HashSet Optional Stream'), variables: codeWordSet('this super'),
    lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'], chars: ["'"], triple: ['"""'],
    flags: { decorators: true, upperType: true },
  },
  csharp: {
    keywords: codeWordSet('abstract as base break case catch checked class const continue default delegate do else enum event explicit extern finally fixed for foreach goto if implicit in interface internal is lock namespace new operator out override params private protected public readonly ref return sealed sizeof stackalloc static struct switch this throw try typeof uint ulong unchecked unsafe ushort using virtual void volatile while add async await dynamic get global init partial record remove required set value var when where yield'),
    literals: codeWordSet('true false null'), types: codeWordSet('Boolean Byte Char DateTime Decimal Double Int16 Int32 Int64 Object SByte Single String UInt16 UInt32 UInt64 Void List Dictionary HashSet Task Guid Exception'),
    lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'], chars: ["'"], triple: ['"""'],
    prefixes: /(?:@\$|\$@|@|\$)/y,
    flags: { preprocessor: true, upperType: true },
  },
  cpp: cppDef,
  c: cppDef,
  go: {
    keywords: codeWordSet('break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var'),
    literals: codeWordSet('true false nil iota'),
    types: codeWordSet('bool byte complex64 complex128 error float32 float64 int int8 int16 int32 int64 rune string uint uint8 uint16 uint32 uint64 uintptr any comparable'),
    lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'], chars: ["'"],
    flags: { rawBacktick: true, upperType: true },
  },
  rust: {
    keywords: codeWordSet('as async await break const continue crate dyn else enum extern fn for if impl in let loop match mod move mut pub ref return static struct super trait type unsafe use where while yield'),
    literals: codeWordSet('true false'),
    types: codeWordSet('bool char f32 f64 i8 i16 i32 i64 i128 isize str u8 u16 u32 u64 u128 usize String Vec Option Result Box HashMap'), variables: codeWordSet('self Self super crate'),
    lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'], chars: ["'"],
    flags: { rustLifetimes: true, rustAttributes: true, upperType: true },
  },
  kotlin: {
    keywords: codeWordSet('as break class continue do else false for fun if in interface is null object package return super this throw true try typealias typeof val var when while by catch constructor delegate dynamic field file finally get import init param property receiver set setparam where actual abstract annotation companion const crossinline data enum expect external final infix inline inner internal lateinit noinline open operator out override private protected public reified sealed suspend tailrec vararg'),
    literals: codeWordSet('true false null'), types: codeWordSet('Any Boolean Byte Char Double Float Int Long Nothing Short String Unit Array List Map Set'), variables: codeWordSet('this super it'),
    lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'], chars: ["'"], triple: ['"""'],
    flags: { decorators: true, upperType: true },
  },
  yaml: { scanner: 'yaml' },
  markup: { scanner: 'markup' },
  markdown: { scanner: 'markdown' },
  diff: { scanner: 'diff' },
  text: { plain: true },
  // Diagram fences are detected by the markdown parser; leave their source as is.
  mermaid: { plain: true },
}

const CODE_LANG_ALIASES = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript', ts: 'typescript', tsx: 'typescript', mts: 'typescript', cts: 'typescript',
  py: 'python', python3: 'python', sh: 'bash', shell: 'bash', zsh: 'bash', ps1: 'powershell', pwsh: 'powershell', yml: 'yaml',
  c: 'c', h: 'c', 'c++': 'cpp', cc: 'cpp', hpp: 'cpp', hxx: 'cpp', cs: 'csharp', 'c#': 'csharp', rs: 'rust', golang: 'go', kt: 'kotlin', kts: 'kotlin',
  html: 'markup', htm: 'markup', xml: 'markup', svg: 'markup', vue: 'markup', svelte: 'markup', xhtml: 'markup', jsonc: 'json', json5: 'json', md: 'markdown',
  patch: 'diff', txt: 'text', plain: 'text', plaintext: 'text', none: 'text',
}

/** Canonical language id for a fence info string; unknown languages become 'text'. */
function normalizeCodeLang(lang) {
  if (typeof lang !== 'string') return 'text'
  let id = lang.trim().toLowerCase()
  if (id.startsWith('language-')) id = id.slice('language-'.length)
  id = id.split(/[\s,;]+/)[0] || ''
  id = id.replace(/^[`~{.\[]+/, '').replace(/[`~}\]]+$/, '')
  if (id === '') return 'text'
  if (Object.prototype.hasOwnProperty.call(CODE_LANG_ALIASES, id)) return CODE_LANG_ALIASES[id]
  return Object.prototype.hasOwnProperty.call(CODE_LANG_DEFS, id) ? id : 'text'
}

function codeEndOfLine(source, index) {
  const next = source.indexOf('\n', index)
  return next === -1 ? source.length : next
}

function codeOnlyWhitespace(source, start, end) {
  return !/[^ \t\r]/.test(source.slice(start, end))
}

function codeNextIndex(source, index) {
  while (index < source.length && /\s/.test(source[index])) index += 1
  return index
}

function codeIsKeyString(source, index) {
  const next = codeNextIndex(source, index)
  return source[next] === ':' && source[next + 1] !== ':'
}

function codeIsDigit(ch) {
  return ch >= '0' && ch <= '9'
}

/** Shared sink: turns (type, start, end) spans into ordered tokens with gaps as plain text. */
function codeTokenSink(source, tokens) {
  let plainStart = 0
  const push = (type, start, end) => {
    if (end <= start) return
    if (start > plainStart) tokens.push({ type: '', text: source.slice(plainStart, start) })
    tokens.push({ type, text: source.slice(start, end) })
    plainStart = end
  }
  const finish = () => {
    if (plainStart < source.length) tokens.push({ type: '', text: source.slice(plainStart) })
    return tokens
  }
  return { push, finish }
}

/** Scan a quoted run from its opening delimiter; unterminated runs stop at EOL/EOF. */
function readCodeQuoted(source, start, quote, options) {
  const escape = options.escape === undefined ? '\\' : options.escape
  let index = start + quote.length
  while (index < source.length) {
    const ch = source[index]
    if (escape !== '' && ch === escape) { index += 2; continue }
    if (options.double && ch === quote[0] && source[index + 1] === quote[0]) { index += 2; continue }
    if (quote.length === 1 && ch === '\n' && !options.multiline) return index
    if (source.startsWith(quote, index)) return index + quote.length
    index += 1
  }
  return index
}

/** Skip a `${...}` expression inside a template literal. */
function scanTemplateExpression(source, start) {
  let index = start
  let depth = 1
  while (index < source.length) {
    const ch = source[index]
    if (ch === '\\') index += 2
    else if (ch === "'" || ch === '"') index = readCodeQuoted(source, index, ch, { multiline: false })
    else if (ch === '`') index = scanTemplateLiteral(source, index)
    else if (ch === '{') { depth += 1; index += 1 } else if (ch === '}') {
      depth -= 1
      if (depth === 0) return index + 1
      index += 1
    } else index += 1
  }
  return index
}

function scanTemplateLiteral(source, start) {
  let index = start + 1
  while (index < source.length) {
    const ch = source[index]
    if (ch === '\\') index += 2
    else if (ch === '`') return index + 1
    else if (ch === '$' && source[index + 1] === '{') index = scanTemplateExpression(source, index + 2)
    else index += 1
  }
  return index
}

/** Detect a string/char/template at `index`; returns { type, end } or null. */
function readCodeString(source, index, def) {
  const flags = def.flags || {}
  let quoteStart = index
  let prefix = ''
  if (def.prefixes !== undefined) {
    def.prefixes.lastIndex = index
    const match = def.prefixes.exec(source)
    const after = index + (match === null ? 0 : match[0].length)
    const triple = def.triple !== undefined && def.triple.some(quote => source.startsWith(quote, after))
    if (match !== null && match.index === index && (triple || (def.strings !== undefined && def.strings.includes(source[after])))) {
      prefix = match[0]
      quoteStart = after
    }
  }
  const ch = source[quoteStart]
  if (ch === undefined) return null
  if (flags.rustLifetimes && ch === "'" && prefix === '') {
    const lifetime = /^'[A-Za-z_][A-Za-z0-9_]*/y
    lifetime.lastIndex = quoteStart
    const match = lifetime.exec(source)
    if (match !== null && source[quoteStart + match[0].length] !== "'") return { type: 'var', end: quoteStart + match[0].length }
  }
  if (def.triple !== undefined) {
    for (const quote of def.triple) {
      if (source.startsWith(quote, quoteStart)) {
        return { type: 'str', end: readCodeQuoted(source, quoteStart, quote, { multiline: true, escape: def.escape === undefined ? '\\' : def.escape }) }
      }
    }
  }
  if (flags.template && ch === '`') return { type: 'str', end: scanTemplateLiteral(source, quoteStart) }
  if (flags.rawBacktick && ch === '`') {
    const close = source.indexOf('`', quoteStart + 1)
    return { type: 'str', end: close === -1 ? source.length : close + 1 }
  }
  const quoted = def.strings !== undefined && def.strings.includes(ch)
  const character = def.chars !== undefined && def.chars.includes(ch)
  if (!quoted && !character) return null
  const verbatim = prefix.includes('@')
  return {
    type: 'str',
    end: readCodeQuoted(source, quoteStart, ch, {
      multiline: false,
      escape: verbatim ? '' : (def.escape === undefined ? '\\' : def.escape),
      double: verbatim || Boolean(flags.doubleEscaped),
    }),
  }
}

function readCodeComment(source, index, def) {
  for (const marker of def.lineComments || []) {
    if (source.startsWith(marker, index)) return codeEndOfLine(source, index)
  }
  for (const pair of def.blockComments || []) {
    if (source.startsWith(pair[0], index)) {
      const close = source.indexOf(pair[1], index + pair[0].length)
      return close === -1 ? source.length : close + pair[1].length
    }
  }
  return -1
}

/** Conservative JS regex literal reader: returns -1 when this cannot be a regex. */
function readCodeRegex(source, start) {
  let index = start + 1
  let inClass = false
  while (index < source.length) {
    const ch = source[index]
    if (ch === '\n') return -1
    if (ch === '\\') index += 2
    else {
      if (ch === '[') inClass = true
      else if (ch === ']') inClass = false
      else if (ch === '/' && !inClass) {
        index += 1
        while (index < source.length && /[a-z]/i.test(source[index])) index += 1
        return index
      }
      index += 1
    }
    if (index - start > HIGHLIGHT_MAX_REGEX) return -1
  }
  return -1
}

function readRustAttribute(source, index) {
  let cursor = index + 1
  if (source[cursor] === '!') cursor += 1
  if (source[cursor] !== '[') return -1
  let depth = 0
  while (cursor < source.length) {
    const ch = source[cursor]
    if (ch === '[') depth += 1
    else if (ch === ']') {
      depth -= 1
      if (depth === 0) return cursor + 1
    } else if (ch === '"' || ch === "'") {
      cursor = readCodeQuoted(source, cursor, ch, { multiline: false })
      continue
    }
    cursor += 1
  }
  return source.length
}

/** Read one JSX-ish tag; parts is null when the `<` is a comparison instead. */
function readJsxTag(source, start) {
  let index = start + 1
  const closing = source[index] === '/'
  if (closing) index += 1
  CODE_TAG_NAME_RE.lastIndex = index
  const name = CODE_TAG_NAME_RE.exec(source)
  if (name === null || name.index !== index) return { parts: null, end: start + 1 }
  const parts = [['op', start, start + 1]]
  if (closing) parts.push(['op', start + 1, index])
  parts.push(['tag', index, index + name[0].length])
  index += name[0].length
  let newlines = 0
  while (index < source.length) {
    const ch = source[index]
    if (ch === '\n' && (newlines += 1) > 12) return { parts: null, end: index }
    if (ch === '>') { parts.push(['op', index, index + 1]); return { parts, end: index + 1 } }
    if (ch === '/' && source[index + 1] === '>') { parts.push(['op', index, index + 2]); return { parts, end: index + 2 } }
    if (/\s|=/.test(ch)) { index += 1; continue }
    if (ch === '"' || ch === "'") {
      const end = readCodeQuoted(source, index, ch, { multiline: false })
      parts.push(['str', index, end])
      index = end
      continue
    }
    if (ch === '{') {
      let depth = 0
      while (index < source.length) {
        const inner = source[index]
        if (inner === '"' || inner === "'") { index = readCodeQuoted(source, index, inner, { multiline: false }); continue }
        if (inner === '{') depth += 1
        else if (inner === '}') {
          depth -= 1
          if (depth === 0) { index += 1; break }
        }
        index += 1
      }
      continue
    }
    CODE_ATTR_NAME_RE.lastIndex = index
    const attribute = CODE_ATTR_NAME_RE.exec(source)
    if (attribute === null || attribute.index !== index) { index += 1; continue }
    parts.push(['attr', index, index + attribute[0].length])
    index += attribute[0].length
  }
  return { parts: null, end: source.length }
}

function classifyCodeWord(word, source, end, def, prevChar) {
  const flags = def.flags || {}
  const lookup = flags.caseInsensitive ? word.toLowerCase() : word
  if (def.types !== undefined && def.types.has(lookup)) return 'type'
  if (def.literals !== undefined && def.literals.has(lookup)) return 'num'
  if (def.keywords !== undefined && def.keywords.has(lookup)) return 'kw'
  if (def.variables !== undefined && def.variables.has(word)) return 'var'
  if (def.commands !== undefined && def.commands.has(lookup)) return 'fn'
  if (prevChar === '.') return 'attr'
  const next = codeNextIndex(source, end)
  const nextChar = source[next] || ''
  if (nextChar === '(') return 'fn'
  if (nextChar === ':' && source[next + 1] !== ':' && flags.keyColon) return 'attr'
  if (flags.envVars && nextChar === '=' && /^[A-Z_][A-Z0-9_]*$/.test(word)) return 'var'
  if (flags.upperType && /^[A-Z][a-z]/.test(word)) return 'type'
  return word[0] === '$' ? 'var' : ''
}

/** Shared scanner for the brace-and-semicolon style languages. */
function scanGeneric(source, def) {
  const tokens = []
  const length = source.length
  const flags = def.flags || {}
  const sink = codeTokenSink(source, tokens)
  const push = sink.push
  let index = 0
  let lineStart = 0
  let jsxResume = 0
  let prevChar = ''
  let prevWord = ''
  let prevToken = ''
  const emit = (type, end, token) => {
    push(type, index, end)
    prevChar = source[end - 1] || ''
    prevWord = ''
    prevToken = token || ''
    index = end
  }

  while (index < length) {
    const ch = source[index]
    if (ch === '\n') { index += 1; lineStart = index; continue }
    if (ch === ' ' || ch === '\t' || ch === '\r') { index += 1; continue }

    // Whole-line meta constructs.
    if (ch === '#' && index === 0 && source[1] === '!') { emit('meta', codeEndOfLine(source, index), 'meta'); continue }
    if (flags.preprocessor && ch === '#' && codeOnlyWhitespace(source, lineStart, index)) {
      emit('meta', codeEndOfLine(source, index), 'meta')
      continue
    }
    if (flags.rustAttributes && ch === '#') {
      const end = readRustAttribute(source, index)
      if (end > index) { emit('meta', end, 'meta'); continue }
    }

    const comment = readCodeComment(source, index, def)
    if (comment !== -1) { push('com', index, comment); index = comment; continue }

    const string = readCodeString(source, index, def)
    if (string !== null) {
      emit(flags.stringKeys && codeIsKeyString(source, string.end) ? 'attr' : string.type, string.end, 'string')
      continue
    }

    if (codeIsDigit(ch) || (ch === '.' && codeIsDigit(source[index + 1]))) {
      CODE_NUMBER_RE.lastIndex = index
      const number = CODE_NUMBER_RE.exec(source)
      if (number !== null && number.index === index) {
        let end = index + number[0].length
        if (def.units !== undefined) {
          def.units.lastIndex = end
          const unit = def.units.exec(source)
          if (unit !== null && unit.index === end) end += unit[0].length
        }
        emit('num', end, 'number')
        continue
      }
    }

    if (flags.dollarVars && ch === '$') {
      let end = index + 1
      if (source[end] === '{') {
        end += 1
        let depth = 1
        while (end < length) {
          if (source[end] === '{') depth += 1
          else if (source[end] === '}') {
            depth -= 1
            if (depth === 0) { end += 1; break }
          }
          end += 1
        }
      } else {
        while (end < length && /[\w:?$#@*!-]/.test(source[end])) end += 1
      }
      emit('var', end, 'variable')
      continue
    }

    if (ch === '@' && (flags.decorators || flags.atRule)) {
      const pattern = flags.atRule ? CODE_AT_RULE_RE : CODE_DECORATOR_RE
      pattern.lastIndex = index
      const match = pattern.exec(source)
      if (match !== null && match.index === index) { emit('meta', index + match[0].length, 'meta'); continue }
    }

    if (flags.cliFlags && ch === '-' && /[A-Za-z]/.test(source[index + 1] || '')
      && (index === 0 || /[\s([{|&;]/.test(source[index - 1]))) {
      CODE_CLI_FLAG_RE.lastIndex = index
      const flag = CODE_CLI_FLAG_RE.exec(source)
      if (flag !== null && flag.index === index) { emit('attr', index + flag[0].length, 'flag'); continue }
    }

    if (flags.cssCustom && ch === '-' && source[index + 1] === '-') {
      CODE_CSS_CUSTOM_RE.lastIndex = index
      const custom = CODE_CSS_CUSTOM_RE.exec(source)
      if (custom !== null && custom.index === index) { emit('var', index + custom[0].length, 'variable'); continue }
    }

    if (flags.hashColor && ch === '#') {
      CODE_CSS_HASH_RE.lastIndex = index
      const hash = CODE_CSS_HASH_RE.exec(source)
      if (hash !== null && hash.index === index) {
        emit(/^#[\da-fA-F]{3,8}$/.test(hash[0]) ? 'num' : 'var', index + hash[0].length, 'hash')
        continue
      }
    }

    if (flags.jsx && ch === '<' && index >= jsxResume) {
      const allowed = prevToken === '=>' || CODE_JSX_WORDS.has(prevWord)
        || CODE_REGEX_PREV_CHARS.includes(prevChar) || prevChar === ''
      if (allowed) {
        const tag = readJsxTag(source, index)
        if (tag.parts !== null) {
          for (const part of tag.parts) push(part[0], part[1], part[2])
          prevChar = '>'
          prevWord = ''
          prevToken = '>'
          index = tag.end
          continue
        }
        // A failed tag scan consumed this region without a tag; do not retry
        // inside it, which would make malformed JSX quadratic.
        jsxResume = tag.end
      }
    }

    if (ch === '/' && flags.regex) {
      const allowed = prevChar === '' || prevToken === '=>'
        || CODE_REGEX_WORDS.has(prevWord) || CODE_REGEX_PREV_CHARS.includes(prevChar)
      if (allowed) {
        const end = readCodeRegex(source, index)
        if (end !== -1) { emit('str', end, 'regex'); continue }
      }
    }

    if (flags.cmdlet) {
      CODE_CMDLET_RE.lastIndex = index
      const cmdlet = CODE_CMDLET_RE.exec(source)
      if (cmdlet !== null && cmdlet.index === index && /[\s(]/.test(source[index + cmdlet[0].length] || ' ')) {
        emit('fn', index + cmdlet[0].length, 'cmdlet')
        continue
      }
    }

    CODE_IDENT_RE.lastIndex = index
    const ident = CODE_IDENT_RE.exec(source)
    if (ident !== null && ident.index === index) {
      const word = ident[0]
      const end = index + word.length
      const type = classifyCodeWord(word, source, end, def, prevChar)
      if (type !== '') push(type, index, end)
      prevChar = word[word.length - 1]
      prevWord = flags.caseInsensitive ? word.toLowerCase() : word
      prevToken = word
      index = end
      continue
    }

    if (CODE_OPERATORS.includes(ch)) {
      let end = index + 1
      while (end < length && CODE_OPERATORS.includes(source[end])) end += 1
      emit('op', end, source.slice(index, end))
      continue
    }
    index += 1
  }
  return sink.finish()
}

function scanMarkup(source) {
  const tokens = []
  const length = source.length
  const { push, finish } = codeTokenSink(source, tokens)
  let index = 0

  while (index < length) {
    if (source[index] !== '<') { index += 1; continue }
    let type = ''
    let end = -1
    if (source.startsWith('<!--', index)) {
      const close = source.indexOf('-->', index + 4)
      type = 'com'
      end = close === -1 ? length : close + 3
    } else if (source.startsWith('<![CDATA[', index)) {
      const close = source.indexOf(']]>', index + 9)
      type = 'meta'
      end = close === -1 ? length : close + 3
    } else if (source.startsWith('<!', index) || source.startsWith('<?', index)) {
      const close = source.indexOf('>', index + 2)
      type = 'meta'
      end = close === -1 ? length : close + 1
    }
    if (type !== '') { push(type, index, end); index = end; continue }

    let cursor = index + 1
    const closing = source[cursor] === '/'
    if (closing) cursor += 1
    CODE_TAG_NAME_RE.lastIndex = cursor
    const name = CODE_TAG_NAME_RE.exec(source)
    if (name === null || name.index !== cursor) { index += 1; continue }
    push('op', index, index + 1)
    if (closing) push('op', index + 1, cursor)
    const nameEnd = cursor + name[0].length
    push('tag', cursor, nameEnd)
    let attrs = nameEnd
    while (attrs < length) {
      const ch = source[attrs]
      if (ch === '>') { push('op', attrs, attrs + 1); attrs += 1; break }
      if (ch === '/' && source[attrs + 1] === '>') { push('op', attrs, attrs + 2); attrs += 2; break }
      if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') { attrs += 1; continue }
      if (ch === '=') {
        push('op', attrs, attrs + 1)
        attrs += 1
        while (attrs < length && /\s/.test(source[attrs])) attrs += 1
        if (source[attrs] === '"' || source[attrs] === "'") {
          const valueEnd = readCodeQuoted(source, attrs, source[attrs], { multiline: false })
          push('str', attrs, valueEnd)
          attrs = valueEnd
          continue
        }
        let valueEnd = attrs
        while (valueEnd < length && !/[\s>]/.test(source[valueEnd])
          && !(source[valueEnd] === '/' && source[valueEnd + 1] === '>')) valueEnd += 1
        if (valueEnd > attrs) push('str', attrs, valueEnd)
        attrs = valueEnd
        continue
      }
      if (ch === '"' || ch === "'") {
        const valueEnd = readCodeQuoted(source, attrs, ch, { multiline: false })
        push('str', attrs, valueEnd)
        attrs = valueEnd
        continue
      }
      if (ch === '{') {
        let depth = 0
        while (attrs < length) {
          const inner = source[attrs]
          if (inner === '"' || inner === "'") { attrs = readCodeQuoted(source, attrs, inner, { multiline: false }); continue }
          if (inner === '{') depth += 1
          else if (inner === '}') {
            depth -= 1
            if (depth === 0) { attrs += 1; break }
          }
          attrs += 1
        }
        continue
      }
      CODE_ATTR_NAME_RE.lastIndex = attrs
      const attribute = CODE_ATTR_NAME_RE.exec(source)
      if (attribute !== null && attribute.index === attrs) {
        push('attr', attrs, attrs + attribute[0].length)
        attrs += attribute[0].length
        continue
      }
      attrs += 1
    }
    index = attrs
  }
  return finish()
}

function scanYamlInline(source, start, end, push) {
  let index = start
  while (index < end) {
    const ch = source[index]
    if (ch === ' ' || ch === '\t') { index += 1; continue }
    if (ch === '#') { push('com', index, end); return }
    if (ch === '"' || ch === "'") {
      const close = Math.min(readCodeQuoted(source, index, ch, { multiline: false, double: ch === "'" }), end)
      push('str', index, close)
      index = close
      continue
    }
    if (ch === '&' || ch === '*' || ch === '!') {
      CODE_ANCHOR_RE.lastIndex = index
      const anchor = CODE_ANCHOR_RE.exec(source)
      if (anchor !== null && anchor.index === index && index + anchor[0].length <= end) {
        push('meta', index, index + anchor[0].length)
        index += anchor[0].length
        continue
      }
    }
    if (ch === '~') { push('num', index, index + 1); index += 1; continue }
    if ('[]{},:?'.includes(ch) || (ch === '-' && source[index + 1] === ' ')) {
      push('op', index, index + 1)
      index += 1
      continue
    }
    if (codeIsDigit(ch) || (ch === '.' && codeIsDigit(source[index + 1]))) {
      CODE_NUMBER_RE.lastIndex = index
      const number = CODE_NUMBER_RE.exec(source)
      if (number !== null && number.index === index && number[0] !== '') {
        const numberEnd = index + number[0].length
        if (!/[A-Za-z_$]/.test(source[numberEnd] || '')) { push('num', index, numberEnd); index = numberEnd; continue }
      }
    }
    CODE_WORD_RE.lastIndex = index
    const word = CODE_WORD_RE.exec(source)
    if (word !== null && word.index === index) {
      const wordEnd = index + word[0].length
      if (CODE_YAML_CONSTANTS.has(word[0].toLowerCase()) && (wordEnd === end || /[\s,\]}]]/.test(source[wordEnd] || ''))) {
        push('num', index, wordEnd)
      }
      index = wordEnd
      continue
    }
    index += 1
  }
}

function scanYaml(source) {
  const tokens = []
  const length = source.length
  const { push, finish } = codeTokenSink(source, tokens)
  let index = 0
  let blockIndent = -1

  while (index < length) {
    const lineEnd = codeEndOfLine(source, index)
    const line = source.slice(index, lineEnd)
    if (line.trim() === '') { index = lineEnd + 1; continue }
    const indent = /^[ \t]*/.exec(line)[0].length
    if (blockIndent >= 0) {
      if (indent > blockIndent) { index = lineEnd + 1; continue }
      blockIndent = -1
    }
    if (/^(?:---|\.\.\.)\s*$/.test(line)) { push('meta', index, lineEnd); index = lineEnd + 1; continue }
    let cursor = index
    const list = /^([ \t]*)(-[ \t]+)/.exec(line)
    if (list !== null) {
      const dashStart = index + list[1].length
      push('op', dashStart, dashStart + 1)
      cursor = index + list[0].length
    }
    const key = /^([^\s:#][^:\n]*?):(?=[ \t]|$)/.exec(source.slice(cursor, lineEnd))
    if (key !== null) {
      const keyEnd = cursor + key[1].length
      push('attr', cursor, keyEnd)
      push('op', keyEnd, keyEnd + 1)
      cursor = keyEnd + 1
    }
    scanYamlInline(source, cursor, lineEnd, push)
    if (/[|>][-+]?\s*(?:#.*)?$/.test(source.slice(cursor, lineEnd).trim())) blockIndent = indent
    index = lineEnd + 1
  }
  return finish()
}

function scanMarkdownInline(source, start, end, push) {
  let index = start
  while (index < end) {
    const ch = source[index]
    if (ch === '`') {
      const close = source.indexOf('`', index + 1)
      if (close !== -1 && close < end) { push('str', index, close + 1); index = close + 1 } else index += 1
    } else if (ch === '[') {
      CODE_MD_LINK_RE.lastIndex = index
      const link = CODE_MD_LINK_RE.exec(source)
      if (link !== null && link.index === index && index + link[0].length <= end) {
        const labelEnd = index + 1 + link[1].length
        push('op', index, index + 1)
        push('op', labelEnd, labelEnd + 2)
        const urlEnd = labelEnd + 2 + link[2].length
        push('str', labelEnd + 2, urlEnd)
        push('op', urlEnd, urlEnd + 1)
        index += link[0].length
      } else index += 1
    } else if (ch === '*' || ch === '_' || ch === '~') {
      let next = index + 1
      while (next < end && source[next] === ch) next += 1
      if (next - index <= 3) { push('op', index, next); index = next } else index += 1
    } else index += 1
  }
}

function scanMarkdown(source) {
  const tokens = []
  const length = source.length
  const { push, finish } = codeTokenSink(source, tokens)
  let index = 0
  let fence = ''

  while (index < length) {
    const lineEnd = codeEndOfLine(source, index)
    const line = source.slice(index, lineEnd)
    const fenceMatch = /^([ \t]*)(```+|~~~+)/.exec(line)
    const heading = /^([ \t]{0,3})(#{1,6})([ \t]+)/.exec(line)
    const quote = /^([ \t]*)(>)[ \t]?/.exec(line)
    const list = /^([ \t]*)([-*+]|\d+[.)])([ \t]+)/.exec(line)
    if (fence !== '') {
      if (fenceMatch !== null && fenceMatch[2][0] === fence[0] && fenceMatch[2].length >= fence.length) {
        push('meta', index + fenceMatch[1].length, lineEnd)
        fence = ''
      }
      index = lineEnd + 1
      continue
    }
    if (fenceMatch !== null) {
      push('meta', index + fenceMatch[1].length, lineEnd)
      fence = fenceMatch[2]
    } else if (/^[ \t]{0,3}(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/.test(line)) {
      push('meta', index, lineEnd)
    } else if (heading !== null) {
      const markerStart = index + heading[1].length
      push('meta', markerStart, markerStart + heading[2].length)
      scanMarkdownInline(source, index + heading[0].length, lineEnd, push)
    } else if (quote !== null) {
      const markerStart = index + quote[1].length
      push('op', markerStart, markerStart + 1)
      scanMarkdownInline(source, index + quote[0].length, lineEnd, push)
    } else if (list !== null) {
      const markerStart = index + list[1].length
      push('op', markerStart, markerStart + list[2].length)
      scanMarkdownInline(source, index + list[0].length, lineEnd, push)
    } else scanMarkdownInline(source, index, lineEnd, push)
    index = lineEnd + 1
  }
  return finish()
}

function scanDiff(source) {
  const tokens = []
  const length = source.length
  const { push, finish } = codeTokenSink(source, tokens)
  let index = 0
  while (index < length) {
    const lineEnd = codeEndOfLine(source, index)
    const line = source.slice(index, lineEnd)
    if (line !== '' && (/^(?:diff |index |\+\+\+|---|@@|new file|deleted file|similarity |rename )/.test(line) || /^[+-]/.test(line))) {
      push('meta', index, lineEnd)
    }
    index = lineEnd + 1
  }
  return finish()
}

/** Tokenize `code` for a language id or alias. Never throws. */
function highlightCode(code, lang) {
  const source = typeof code === 'string' ? code : String(code ?? '')
  const id = normalizeCodeLang(lang)
  if (id === 'text') return [{ type: '', text: source }]
  const def = CODE_LANG_DEFS[id]
  if (def === undefined || def.plain === true) return [{ type: '', text: source }]
  try {
    const limit = Math.min(source.length, HIGHLIGHT_MAX_LENGTH)
    const head = limit === source.length ? source : source.slice(0, limit)
    let tokens
    if (def.scanner === 'markup') tokens = scanMarkup(head)
    else if (def.scanner === 'yaml') tokens = scanYaml(head)
    else if (def.scanner === 'markdown') tokens = scanMarkdown(head)
    else if (def.scanner === 'diff') tokens = scanDiff(head)
    else tokens = scanGeneric(head, def)
    if (limit < source.length) tokens.push({ type: '', text: source.slice(limit) })
    return tokens
  } catch {
    return [{ type: '', text: source }]
  }
}

/** Same tokens as highlightCode, split into rows at newlines for diff-style UI. */
function highlightLines(code, lang) {
  const source = typeof code === 'string' ? code : String(code ?? '')
  const rows = [[]]
  let row = rows[0]
  for (const token of highlightCode(source, lang)) {
    const parts = token.text.split('\n')
    for (let index = 0; index < parts.length; index += 1) {
      if (index > 0) { row = []; rows.push(row) }
      if (parts[index] !== '') row.push({ type: token.type, text: parts[index] })
    }
  }
  return rows
}

/* ---- 32-math.js ---- */
// 32-math.js — dependency-free LaTeX math renderer for chat answers.
//
// Concatenated into the plugin bundle, so: no imports or exports and no
// top-level side effects. Output is React elements only; source text is passed
// as children, never as HTML, so model output cannot inject markup.
//
// Pipeline: lexMath() -> parseLatex() (plain AST) -> latexToNodes() (React).
// Unknown commands render as muted text; unbalanced braces and runaway nesting
// degrade to text instead of failing.

const MATH_MAX_SOURCE = 20000
const MATH_MAX_DEPTH = 64

// kind -> class name for a plain math character
const MATH_CHAR_CLASSES = {
  var: 'dsc-math-var', num: 'dsc-math-num', op: 'dsc-math-op',
  delim: 'dsc-math-delim', text: 'dsc-math-text',
}

const MATH_GREEK = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε',
  zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ',
  varkappa: 'ϰ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο', pi: 'π',
  rho: 'ρ', varrho: 'ϱ', sigma: 'σ', varsigma: 'ς', tau: 'τ', upsilon: 'υ',
  phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
}
const MATH_UPPER_GREEK = {
  Alpha: 'Α', Beta: 'Β', Gamma: 'Γ', Delta: 'Δ', Epsilon: 'Ε', Zeta: 'Ζ',
  Eta: 'Η', Theta: 'Θ', Iota: 'Ι', Kappa: 'Κ', Lambda: 'Λ', Mu: 'Μ', Nu: 'Ν',
  Xi: 'Ξ', Omicron: 'Ο', Pi: 'Π', Rho: 'Ρ', Sigma: 'Σ', Tau: 'Τ',
  Upsilon: 'Υ', Phi: 'Φ', Chi: 'Χ', Psi: 'Ψ', Omega: 'Ω',
}
const MATH_SYMBOLS = {
  pm: '±', mp: '∓', times: '×', div: '÷', cdot: '⋅', ast: '∗', star: '⋆', circ: '∘', bullet: '•',
  le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈', equiv: '≡', sim: '∼',
  simeq: '≃', cong: '≅', propto: '∝', to: '→', rightarrow: '→', leftarrow: '←',
  leftrightarrow: '↔', Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔', mapsto: '↦',
  infty: '∞', partial: '∂', nabla: '∇', forall: '∀', exists: '∃', in: '∈', notin: '∉',
  subset: '⊂', subseteq: '⊆', supset: '⊃', supseteq: '⊇', cup: '∪', cap: '∩',
  emptyset: '∅', varnothing: '∅', neg: '¬', lnot: '¬', land: '∧', lor: '∨',
  angle: '∠', perp: '⊥', parallel: '∥', ldots: '…', cdots: '⋯', dots: '…',
  prime: '′', hbar: 'ℏ', ell: 'ℓ', Re: 'ℜ', Im: 'ℑ', aleph: 'ℵ',
}

const MATH_DELIMITER_SYMBOLS = {
  langle: '⟨', rangle: '⟩', lvert: '|', rvert: '|', lVert: '‖', rVert: '‖',
  vert: '|', Vert: '‖', '|': '‖', lfloor: '⌊', rfloor: '⌋', lceil: '⌈',
  rceil: '⌉', lbrace: '{', rbrace: '}', lbrack: '[', rbrack: ']',
  backslash: '\\', uparrow: '↑', downarrow: '↓', updownarrow: '↕',
  Uparrow: '⇑', Downarrow: '⇓', Updownarrow: '⇕',
}

const MATH_ESCAPES = {
  '{': '{', '}': '}', '%': '%', '$': '$', '&': '&', '#': '#', '_': '_',
}

// command name -> em width (negative values pull the following text left)
const MATH_SPACES = {
  ',': 0.1667, ':': 0.2222, ';': 0.2778, '!': -0.1667, ' ': 0.3333,
  quad: 1, qquad: 2,
}

const MATH_FONTS = {
  mathrm: 'rm', mathbf: 'bf', mathit: 'it', mathsf: 'sf',
  mathtt: 'tt', mathcal: 'cal', mathscr: 'cal', mathbb: 'bb',
}

const MATH_ACCENTS = {
  hat: 'hat', widehat: 'hat', bar: 'bar', vec: 'vec', dot: 'dot',
  ddot: 'ddot', tilde: 'tilde', widetilde: 'tilde',
  overline: 'overline', underline: 'underline',
}

const MATH_ACCENT_MARKS = {
  hat: 'ˆ', bar: '¯', vec: '→', dot: '˙', ddot: '¨', tilde: '˜',
}

// Glyphs of large operators and function names; the sets below decide layout.
const MATH_BIG = {
  sum: '∑', prod: '∏', coprod: '∐', bigcup: '⋃', bigcap: '⋂', bigoplus: '⨁',
  int: '∫', iint: '∬', oint: '∮',
  lim: 'lim', max: 'max', min: 'min', sup: 'sup', inf: 'inf',
  log: 'log', ln: 'ln', exp: 'exp', sin: 'sin', cos: 'cos', tan: 'tan',
  arcsin: 'arcsin', det: 'det', gcd: 'gcd',
}
// Limits stack above/below the glyph in display mode.
const MATH_BIG_LIMITS = new Set(['sum', 'prod', 'coprod', 'bigcup', 'bigcap', 'bigoplus', 'lim', 'max', 'min', 'sup', 'inf'])
// Function names stay upright and text-sized instead of using big-operator size.
const MATH_BIG_FUNCTIONS = new Set(['lim', 'max', 'min', 'sup', 'inf', 'log', 'ln', 'exp', 'sin', 'cos', 'tan', 'arcsin', 'det', 'gcd'])

// \big-family prefixes: accepted, rendered as a scaled plain delimiter
const MATH_BIG_DELIMITERS = {
  big: 1.2, Big: 1.5, bigg: 1.9, Bigg: 2.4,
  bigl: 1.2, bigr: 1.2, Bigl: 1.5, Bigr: 1.5,
  biggl: 1.9, biggr: 1.9, Biggl: 2.4, Biggr: 2.4,
  bigm: 1.2, Bigm: 1.5, biggm: 1.9, Biggm: 2.4,
}

// environment name -> delimiter pair (null / empty string means none)
const MATH_ENV_DELIMITERS = {
  matrix: null, aligned: null, align: null, alignat: null,
  gathered: null, gather: null, split: null, array: null,
  pmatrix: { left: '(', right: ')' }, bmatrix: { left: '[', right: ']' },
  Bmatrix: { left: '{', right: '}' }, vmatrix: { left: '|', right: '|' },
  Vmatrix: { left: '‖', right: '‖' }, cases: { left: '{', right: '' },
}
const MATH_IGNORED = new Set([
  'displaystyle', 'textstyle', 'scriptstyle', 'scriptscriptstyle',
  'limits', 'nolimits', 'nonumber', 'notag',
])
// stop sets drive the recursive row parser
const MATH_STOP_GROUP = { close: true }
const MATH_STOP_ARGUMENT = { close: true, align: true, rowbreak: true, right: true, end: true }
const MATH_STOP_ENV = { align: true, rowbreak: true, end: true }
const MATH_STOP_RIGHT = { right: true }
const MATH_STOP_INDEX = { close: true, char: ']' }

// ---------------------------------------------------------------------------
// Lexer: source string -> flat token list
// ---------------------------------------------------------------------------

function lexMath(source) {
  const tokens = []
  let index = 0
  while (index < source.length) {
    const char = source[index]
    if (char === '\\') {
      index += 1
      if (index >= source.length) break
      const next = source[index]
      if (/[A-Za-z]/.test(next)) {
        let name = ''
        while (index < source.length && /[A-Za-z]/.test(source[index])) {
          name += source[index]
          index += 1
        }
        tokens.push({ type: 'command', name })
        continue
      }
      index += 1
      if (next === '\\') {
        tokens.push({ type: 'rowbreak' })
        continue
      }
      tokens.push({ type: 'command', name: next })
      continue
    }
    if (char === '{') {
      tokens.push({ type: 'open' })
      index += 1
      continue
    }
    if (char === '}') {
      tokens.push({ type: 'close' })
      index += 1
      continue
    }
    if (char === '^') {
      tokens.push({ type: 'sup' })
      index += 1
      continue
    }
    if (char === '_') {
      tokens.push({ type: 'sub' })
      index += 1
      continue
    }
    if (char === '&') {
      tokens.push({ type: 'align' })
      index += 1
      continue
    }
    if (char === '~') {
      tokens.push({ type: 'space', size: 0.3333 })
      index += 1
      continue
    }
    if (/\s/.test(char)) {
      tokens.push({ type: 'space', size: 0 })
      index += 1
      continue
    }
    tokens.push({ type: 'char', value: char })
    index += 1
  }
  return tokens
}

function mathClassifyChar(char) {
  if ('0123456789.'.includes(char)) return 'num'
  if (/[A-Za-z]/.test(char)) return 'var'
  if (/[\u0370-\u03ff\u1d00-\u1fff]/.test(char)) return 'var'
  if ('()[]|'.includes(char)) return 'delim'
  if ('+-*/=<>!?,;:\'"%@#$&'.includes(char)) return 'op'
  return 'text'
}

// Reconstruct readable source-ish text for a token; used by the depth guard,
// raw \text arguments and error-tolerant renderings.
function mathCommandText(name) {
  if (MATH_ESCAPES[name] !== undefined) return MATH_ESCAPES[name]
  if (MATH_SPACES[name] !== undefined) return ' '
  return '\\' + name
}

function mathTokenText(token) {
  if (token.type === 'char') return token.value
  if (token.type === 'command') return mathCommandText(token.name)
  if (token.type === 'open') return '{'
  if (token.type === 'close') return '}'
  if (token.type === 'sup') return '^'
  if (token.type === 'sub') return '_'
  if (token.type === 'space') return ' '
  if (token.type === 'align') return '&'
  if (token.type === 'rowbreak') return '\\\\'
  return ''
}

// ---------------------------------------------------------------------------
// Parser: flat tokens -> plain AST
// ---------------------------------------------------------------------------

function mathTokenStops(token, stop) {
  if (stop === undefined || stop === null) return false
  if (token.type === 'close' && stop.close === true) return true
  if (token.type === 'align' && stop.align === true) return true
  if (token.type === 'rowbreak' && stop.rowbreak === true) return true
  if (token.type === 'char' && stop.char !== undefined && token.value === stop.char) return true
  if (token.type === 'command' && stop.right === true && token.name === 'right') return true
  if (token.type === 'command' && stop.end === true && token.name === 'end') return true
  return false
}

function mathSkipSpaces(state) {
  while (state.index < state.tokens.length && state.tokens[state.index].type === 'space') {
    state.index += 1
  }
}

function mathReadLiteralGroup(state) {
  // state.index already points past the opening brace. The source is capped at
  // MATH_MAX_SOURCE, so keeping every character here stays small.
  let level = 1
  let text = ''
  while (state.index < state.tokens.length) {
    const token = state.tokens[state.index]
    if (token.type === 'open') level += 1
    if (token.type === 'close') {
      level -= 1
      if (level === 0) {
        state.index += 1
        break
      }
    }
    text += mathTokenText(token)
    state.index += 1
  }
  return text
}

function mathReadLiteralAtom(state) {
  const token = state.tokens[state.index]
  if (token === undefined) return null
  if (token.type === 'open') {
    state.index += 1
    return { type: 'text', value: mathReadLiteralGroup(state) }
  }
  state.index += 1
  return { type: 'text', value: mathTokenText(token) }
}

function parseMathGroup(state, depth) {
  // state.index points at the opening brace
  state.index += 1
  if (depth > MATH_MAX_DEPTH) return { type: 'text', value: mathReadLiteralGroup(state) }
  const items = parseMathRow(state, depth + 1, MATH_STOP_GROUP)
  const close = state.tokens[state.index]
  if (close !== undefined && close.type === 'close') state.index += 1
  return { type: 'group', items }
}

function parseMathArgument(state, depth) {
  const token = state.tokens[state.index]
  if (token === undefined) return null
  if (mathTokenStops(token, MATH_STOP_ARGUMENT)) return null
  return parseMathAtom(state, depth)
}

// Read a raw {...} argument for \text / \operatorname / environment names.
function mathReadRawGroup(state) {
  const token = state.tokens[state.index]
  if (token === undefined || token.type !== 'open') return ''
  state.index += 1
  let level = 1
  let text = ''
  while (state.index < state.tokens.length) {
    const current = state.tokens[state.index]
    if (current.type === 'open') level += 1
    if (current.type === 'close') {
      level -= 1
      if (level === 0) {
        state.index += 1
        break
      }
    }
    if (current.type === 'rowbreak') text += '\n'
    else if (current.type === 'command') text += mathCommandText(current.name)
    else text += mathTokenText(current)
    state.index += 1
  }
  return text
}

function mathReadRawText(state) {
  const token = state.tokens[state.index]
  if (token === undefined) return ''
  if (token.type === 'open') return mathReadRawGroup(state)
  state.index += 1
  return mathTokenText(token)
}

function mathReadDelimiter(state) {
  mathSkipSpaces(state)
  const token = state.tokens[state.index]
  if (token === undefined) return null
  if (token.type === 'char') {
    state.index += 1
    return token.value === '.' ? null : token.value
  }
  if (token.type === 'command') {
    state.index += 1
    if (MATH_DELIMITER_SYMBOLS[token.name] !== undefined) return MATH_DELIMITER_SYMBOLS[token.name]
    if (MATH_ESCAPES[token.name] !== undefined) return MATH_ESCAPES[token.name]
    // Not a delimiter: keep the command name visible instead of dropping it.
    return mathCommandText(token.name)
  }
  return null
}

function parseMathRow(state, depth, stop) {
  const items = []
  while (state.index < state.tokens.length) {
    const token = state.tokens[state.index]
    if (mathTokenStops(token, stop)) break
    if (token.type === 'space') {
      state.index += 1
      if (token.size > 0) items.push({ type: 'space', size: token.size })
      continue
    }
    if (token.type === 'close') {
      // A stray '}' (unbalanced braces) must stay visible rather than vanish.
      state.index += 1
      mathPushChar(items, '}', 'text')
      continue
    }
    if (token.type === 'align') {
      state.index += 1
      mathPushChar(items, '&', 'op')
      continue
    }
    if (token.type === 'rowbreak') {
      state.index += 1
      items.push({ type: 'rowbreak' })
      continue
    }
    if (token.type === 'sup' || token.type === 'sub') {
      // Script with no preceding atom: attach it to an empty base.
      state.index += 1
      const argument = parseMathArgument(state, depth + 1)
      const base = mathTakeLastAtom(items)
      items.push(mathMakeScripted(base, token.type === 'sub' ? argument : null, token.type === 'sup' ? argument : null))
      continue
    }
    const before = state.index
    const atom = parseMathAtom(state, depth)
    if (atom === null) {
      if (state.index === before) state.index += 1
      continue
    }
    const scripted = parseMathScripts(state, depth, atom)
    if (scripted.type === 'char') mathPushChar(items, scripted.value, scripted.kind)
    else items.push(scripted)
  }
  return items
}

function mathPushChar(items, value, kind) {
  const last = items[items.length - 1]
  if (last !== undefined && last.type === 'run' && last.kind === kind) {
    last.value += value
    return
  }
  items.push({ type: 'run', kind, value })
}

function mathTakeLastAtom(items) {
  if (items.length === 0) return null
  const index = items.length - 1
  const last = items[index]
  if (last.type === 'run') {
    if (last.value.length > 1) {
      items[index] = { type: 'run', kind: last.kind, value: last.value.slice(0, -1) }
      return { type: 'char', value: last.value.slice(-1), kind: last.kind }
    }
    items.pop()
    return { type: 'char', value: last.value, kind: last.kind }
  }
  items.pop()
  return last
}

function mathMakeScripted(base, sub, sup) {
  if (sub === null && sup === null) return base
  if (base !== null && base.type === 'bigop') {
    return { ...base, sub: base.sub || sub, sup: base.sup || sup }
  }
  return { type: 'scripts', base, sub, sup }
}

function parseMathScripts(state, depth, atom) {
  let base = atom
  let sub = null
  let sup = null
  while (state.index < state.tokens.length) {
    const token = state.tokens[state.index]
    if (token.type !== 'sup' && token.type !== 'sub') break
    state.index += 1
    const argument = parseMathArgument(state, depth + 1)
    if (token.type === 'sup' && sup === null) {
      sup = argument
      continue
    }
    if (token.type === 'sub' && sub === null) {
      sub = argument
      continue
    }
    // Repeated x^a^b is invalid LaTeX; keep both scripts by nesting them.
    base = mathMakeScripted(base, sub, sup)
    sub = null
    sup = null
    if (token.type === 'sup') sup = argument
    else sub = argument
  }
  return mathMakeScripted(base, sub, sup)
}

function parseMathAtom(state, depth) {
  if (depth > MATH_MAX_DEPTH) return mathReadLiteralAtom(state)
  const token = state.tokens[state.index]
  if (token === undefined) return null
  if (token.type === 'open') return parseMathGroup(state, depth)
  if (token.type === 'char') {
    state.index += 1
    return { type: 'char', value: token.value, kind: mathClassifyChar(token.value) }
  }
  if (token.type === 'command') {
    state.index += 1
    return parseMathCommand(state, token.name, depth + 1)
  }
  return null
}

function parseMathCommand(state, name, depth) {
  if (MATH_IGNORED.has(name)) return null
  if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
    const num = parseMathArgument(state, depth)
    const den = parseMathArgument(state, depth)
    return { type: 'frac', num, den, style: name === 'dfrac' ? 'display' : name === 'tfrac' ? 'text' : 'auto' }
  }
  if (name === 'binom') {
    const top = parseMathArgument(state, depth)
    const bottom = parseMathArgument(state, depth)
    return { type: 'binom', top, bottom }
  }
  if (name === 'sqrt') {
    let index = null
    mathSkipSpaces(state)
    const next = state.tokens[state.index]
    if (next !== undefined && next.type === 'char' && next.value === '[') {
      state.index += 1
      index = { type: 'group', items: parseMathRow(state, depth + 1, MATH_STOP_INDEX) }
      const close = state.tokens[state.index]
      if (close !== undefined && close.type === 'char' && close.value === ']') state.index += 1
    }
    return { type: 'sqrt', index, body: parseMathArgument(state, depth) }
  }
  if (name === 'left') return parseMathLeftRight(state, depth)
  if (name === 'begin') return parseMathEnvironment(state, depth)
  if (MATH_BIG_DELIMITERS[name] !== undefined) {
    const glyph = mathReadDelimiter(state)
    if (glyph === null) return null
    return { type: 'delimiter', glyph, size: MATH_BIG_DELIMITERS[name] }
  }
  if (MATH_SPACES[name] !== undefined) return { type: 'space', size: MATH_SPACES[name] }
  if (MATH_GREEK[name] !== undefined) return { type: 'char', value: MATH_GREEK[name], kind: 'var' }
  if (MATH_UPPER_GREEK[name] !== undefined) return { type: 'char', value: MATH_UPPER_GREEK[name], kind: 'text' }
  if (MATH_DELIMITER_SYMBOLS[name] !== undefined) return { type: 'char', value: MATH_DELIMITER_SYMBOLS[name], kind: 'delim' }
  if (MATH_SYMBOLS[name] !== undefined) return { type: 'char', value: MATH_SYMBOLS[name], kind: 'op' }
  if (MATH_ESCAPES[name] !== undefined) {
    return { type: 'char', value: MATH_ESCAPES[name], kind: mathClassifyChar(MATH_ESCAPES[name]) }
  }
  if (name === 'text') return { type: 'text', value: mathReadRawText(state) }
  if (name === 'operatorname') {
    // Parsed as math so spacing commands inside it still work; the "op"
    // variant below renders the result upright.
    return { type: 'font', variant: 'op', body: parseMathArgument(state, depth) }
  }
  if (MATH_FONTS[name] !== undefined) {
    return { type: 'font', variant: MATH_FONTS[name], body: parseMathArgument(state, depth) }
  }
  if (MATH_ACCENTS[name] !== undefined) {
    return { type: 'accent', kind: MATH_ACCENTS[name], body: parseMathArgument(state, depth) }
  }
  if (MATH_BIG[name] !== undefined) {
    return {
      type: 'bigop', name, glyph: MATH_BIG[name], sub: null, sup: null,
      limits: MATH_BIG_LIMITS.has(name), large: !MATH_BIG_FUNCTIONS.has(name),
    }
  }
  return { type: 'unknown', name }
}

function parseMathLeftRight(state, depth) {
  const left = mathReadDelimiter(state)
  if (state.tokens[state.index] === undefined) throw new Error('Unmatched \\left')
  const items = parseMathRow(state, depth + 1, MATH_STOP_RIGHT)
  const token = state.tokens[state.index]
  if (token === undefined || token.type !== 'command' || token.name !== 'right') {
    throw new Error('Unmatched \\left')
  }
  state.index += 1
  const right = mathReadDelimiter(state)
  return { type: 'delimited', left, right, items }
}

function parseMathEnvironment(state, depth) {
  mathSkipSpaces(state)
  const envName = state.tokens[state.index] !== undefined && state.tokens[state.index].type === 'open'
    ? mathReadRawGroup(state).trim()
    : ''
  // \begin{array}{cc}: the column spec is accepted and ignored.
  if (envName === 'array' && state.tokens[state.index] !== undefined && state.tokens[state.index].type === 'open') {
    mathReadRawGroup(state)
  }
  const rows = []
  let cells = []
  let guard = 0
  while (state.index < state.tokens.length && guard < 4096) {
    guard += 1
    const token = state.tokens[state.index]
    if (token.type === 'command' && token.name === 'end') break
    const items = parseMathRow(state, depth + 1, MATH_STOP_ENV)
    const next = state.tokens[state.index]
    const hasMore = next !== undefined && !(next.type === 'command' && next.name === 'end')
    if (items.length > 0 || hasMore) cells.push({ type: 'group', items })
    if (!hasMore) break
    if (next.type === 'align') {
      state.index += 1
      continue
    }
    if (next.type === 'rowbreak') {
      state.index += 1
      rows.push(cells)
      cells = []
      continue
    }
    break
  }
  if (cells.length > 0) rows.push(cells)
  if (rows.length === 0) rows.push([])
  const endToken = state.tokens[state.index]
  if (endToken !== undefined && endToken.type === 'command' && endToken.name === 'end') {
    state.index += 1
    mathSkipSpaces(state)
    if (state.tokens[state.index] !== undefined && state.tokens[state.index].type === 'open') mathReadRawGroup(state)
  }
  return { type: 'matrix', env: envName, rows }
}

function parseLatex(source) {
  if (typeof source !== 'string') throw new TypeError('LaTeX source must be a string')
  if (source.length > MATH_MAX_SOURCE) return { type: 'plain', source }
  const state = { tokens: lexMath(source), index: 0 }
  return { type: 'row', items: parseMathRow(state, 0, null), source }
}

// ---------------------------------------------------------------------------
// Renderer: plain AST -> React elements
// ---------------------------------------------------------------------------

function mathCharClass(kind, context) {
  const variant = context.variant
  if (variant === 'rm' || variant === 'bb' || variant === 'sf' || variant === 'tt') {
    if (kind === 'op') return 'dsc-math-op'
    if (kind === 'delim') return 'dsc-math-delim'
    return 'dsc-math-text'
  }
  if (variant === 'op') return 'dsc-math-op'
  if (variant === 'cal') return 'dsc-math-var'
  return MATH_CHAR_CLASSES[kind] || 'dsc-math-text'
}

function mathCharStyle(context) {
  const variant = context.variant
  if (variant === 'bf') return { fontWeight: '700' }
  if (variant === 'sf') return { fontFamily: 'sans-serif' }
  if (variant === 'tt') return { fontFamily: 'monospace' }
  if (variant === 'cal') return { fontStyle: 'italic' }
  return undefined
}

function mathRenderChars(kind, value, context, key) {
  return h('span', { className: mathCharClass(kind, context), key, style: mathCharStyle(context) }, value)
}

function mathRenderItems(items, context, keyPrefix) {
  return items.map((item, index) => renderMathNode(item, context, `${keyPrefix}-${index}`))
}

// Render an argument (group or single atom) as a child array.
function mathRenderContent(value, context, key) {
  if (value === null || value === undefined) return []
  if (value.type === 'group') return mathRenderItems(value.items, context, key)
  return [renderMathNode(value, context, key)]
}

function mathRenderSpace(size, key) {
  if (size < 0) {
    return h('span', {
      className: 'dsc-math-space',
      key,
      style: { display: 'inline-block', width: '0em', marginLeft: `${size.toFixed(4)}em` },
    })
  }
  return h('span', {
    className: 'dsc-math-space',
    key,
    style: { display: 'inline-block', width: `${size.toFixed(4)}em` },
  })
}

function mathRenderFrac(node, context, key) {
  const childContext = node.style === 'display'
    ? { ...context, display: true }
    : node.style === 'text'
      ? { ...context, display: false }
      : context
  return h('span', { className: 'dsc-math-frac', key },
    h('span', { className: 'dsc-math-frac-num' }, mathRenderContent(node.num, childContext, `${key}-n`)),
    h('span', { className: 'dsc-math-frac-den' }, mathRenderContent(node.den, childContext, `${key}-d`)),
  )
}

function mathRenderBinom(node, context, key) {
  // A binomial is a one-column matrix wrapped in taller-than-text parentheses.
  const grid = mathRenderMatrix({ type: 'matrix', env: 'matrix', rows: [[node.top], [node.bottom]] }, context, key)
  const parenStyle = { fontSize: '1.5em', lineHeight: 1 }
  return h('span', { key, style: { display: 'inline-flex', alignItems: 'center' } },
    h('span', { className: 'dsc-math-delim', key: `${key}-l`, style: parenStyle }, '('),
    grid,
    h('span', { className: 'dsc-math-delim', key: `${key}-r`, style: parenStyle }, ')'),
  )
}

function mathRenderSqrt(node, context, key) {
  return h('span', { className: 'dsc-math-sqrt', key },
    node.index === null
      ? null
      // The stylesheet draws the radical with ::before; order puts the index on
      // its left where TeX puts it (the CSS margin tucks it into the radical).
      : h('span', { className: 'dsc-math-sqrt-index', style: { order: -1 } }, mathRenderContent(node.index, context, `${key}-i`)),
    h('span', { className: 'dsc-math-sqrt-body' }, mathRenderContent(node.body, context, `${key}-b`)),
  )
}

function mathRenderBig(node, context, key) {
  const glyph = h('span', {
    className: node.large ? 'dsc-math-big' : 'dsc-math-op',
    key: `${key}-g`,
  }, node.glyph)
  const supContent = node.sup === null ? null : mathRenderContent(node.sup, context, `${key}-p`)
  const subContent = node.sub === null ? null : mathRenderContent(node.sub, context, `${key}-s`)
  if (node.limits && context.display === true && (supContent !== null || subContent !== null)) {
    // The glyph stays in normal flow so the stack's baseline is the operator's
    // baseline: text after \sum still lines up with the operator. The limits are
    // drawn above/below it and the padding reserves their vertical room.
    const limitStyle = {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '0.72em',
      lineHeight: 1.05,
      whiteSpace: 'nowrap',
    }
    const stacked = {
      display: 'inline-block',
      position: 'relative',
      textAlign: 'center',
      lineHeight: 1,
      padding: '0.8em 0.3em',
    }
    return h('span', { key, style: stacked },
      supContent === null ? null : h('span', { className: 'dsc-math-sup', key: `${key}-p`, style: { ...limitStyle, top: 0 } }, supContent),
      glyph,
      subContent === null ? null : h('span', { className: 'dsc-math-sub', key: `${key}-s`, style: { ...limitStyle, bottom: 0 } }, subContent),
    )
  }
  const sup = supContent === null ? null : h('span', { className: 'dsc-math-sup', key: `${key}-p` }, supContent)
  const sub = subContent === null ? null : h('span', { className: 'dsc-math-sub', key: `${key}-s` }, subContent)
  if (sup === null && sub === null) return glyph
  // Inline limits stay to the right, stacked vertically like x_i^2.
  const scriptStyle = sup !== null && sub !== null
    ? {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      lineHeight: '1.02',
      verticalAlign: 'middle',
    }
    : undefined
  return h('span', { key }, glyph, h('span', { className: 'dsc-math-script', style: scriptStyle }, sup, sub))
}

function mathRenderScripted(node, context, key) {
  const base = node.base === null ? null : renderMathNode(node.base, context, `${key}-b`)
  const sup = node.sup === null
    ? null
    : h('span', { className: 'dsc-math-sup', key: `${key}-p` }, mathRenderContent(node.sup, context, `${key}-p`))
  const sub = node.sub === null
    ? null
    : h('span', { className: 'dsc-math-sub', key: `${key}-s` }, mathRenderContent(node.sub, context, `${key}-s`))
  // x_i^2 needs the two scripts stacked; x^2 / x_i can rely on the class rules.
  const stacked = sup !== null && sub !== null
  const scriptStyle = stacked
    ? {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      lineHeight: '1.02',
      verticalAlign: 'middle',
    }
    : undefined
  return h('span', { key }, base, h('span', { className: 'dsc-math-script', style: scriptStyle }, sup, sub))
}

function mathEstimateHeight(value, context) {
  if (value === null || value === undefined) return 1
  if (value.type === 'group') {
    let height = 1
    for (const item of value.items) height = Math.max(height, mathEstimateHeight(item, context))
    return height
  }
  if (value.type === 'frac' || value.type === 'binom') return 2.35
  if (value.type === 'sqrt') return mathEstimateHeight(value.body, context) + 0.2
  if (value.type === 'matrix') return Math.max(1, value.rows.length * 1.15)
  if (value.type === 'scripts') {
    return Math.max(
      1.15,
      mathEstimateHeight(value.base, context),
      mathEstimateHeight(value.sup, context),
      mathEstimateHeight(value.sub, context),
    )
  }
  if (value.type === 'bigop') return context.display && value.limits ? 2.8 : 1.15
  if (value.type === 'delimited') {
    let height = 1
    for (const item of value.items) height = Math.max(height, mathEstimateHeight(item, context))
    return height + 0.15
  }
  if (value.type === 'accent') return mathEstimateHeight(value.body, context) + 0.25
  if (value.type === 'font') return mathEstimateHeight(value.body, context)
  return 1
}

function mathRenderDelimiters(left, right, scale, key) {
  const style = scale > 1.05 ? { fontSize: `${scale.toFixed(2)}em`, lineHeight: 1 } : undefined
  return [
    left === null ? null : h('span', { className: 'dsc-math-delim', key: `${key}-l`, style }, left),
    right === null ? null : h('span', { className: 'dsc-math-delim', key: `${key}-r`, style }, right),
  ]
}

function mathRenderDelimited(node, context, key) {
  const content = mathRenderItems(node.items, context, `${key}-c`)
  const height = Math.max(1, Math.min(3.2, mathEstimateHeight({ type: 'group', items: node.items }, context)))
  const [left, right] = mathRenderDelimiters(node.left, node.right, height, key)
  return h('span', { key, style: { display: 'inline-flex', alignItems: 'center' } },
    left,
    h('span', { className: 'dsc-math-row' }, content),
    right,
  )
}

function mathRenderMatrix(node, context, key) {
  const rows = node.rows.length === 0 ? [[]] : node.rows
  const grid = h('span', { className: 'dsc-math-matrix', key: `${key}-m` },
    rows.map((row, rowIndex) => (
      h('span', { className: 'dsc-math-matrix-row', key: `${key}-r${rowIndex}` },
        row.map((cell, cellIndex) => (
          h('span', { className: 'dsc-math-matrix-cell', key: `${key}-c${rowIndex}-${cellIndex}` },
            mathRenderContent(cell, context, `${key}-c${rowIndex}-${cellIndex}`))
        )),
      )
    )),
  )
  const spec = MATH_ENV_DELIMITERS[node.env] || null
  if (spec === null) return grid
  const scale = Math.max(1, Math.min(3.2, 0.95 + rows.length * 0.45))
  const [left, right] = mathRenderDelimiters(spec.left || null, spec.right || null, scale, key)
  return h('span', { key, style: { display: 'inline-flex', alignItems: 'center' } }, left, grid, right)
}

function mathRenderAccent(node, context, key) {
  const content = mathRenderContent(node.body, context, `${key}-a`)
  if (node.kind === 'overline' || node.kind === 'underline') {
    const overline = node.kind === 'overline'
    const style = {
      display: 'inline-block',
      lineHeight: 1.1,
      paddingTop: overline ? '0.08em' : '0',
      paddingBottom: overline ? '0' : '0.08em',
    }
    if (overline) style.borderTop = '1px solid currentColor'
    else style.borderBottom = '1px solid currentColor'
    return h('span', { key, style }, content)
  }
  const mark = MATH_ACCENT_MARKS[node.kind] || 'ˆ'
  return h('span', {
    key,
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      verticalAlign: 'middle',
      lineHeight: '1.05',
    },
  },
  h('span', { key: `${key}-m`, style: { fontSize: '0.75em', lineHeight: 1, height: '0.5em' } }, mark),
  h('span', { className: 'dsc-math-row', style: { lineHeight: 1.1 } }, content),
  )
}

function renderMathNode(node, context, key) {
  if (node === null || node === undefined) return null
  if (node.type === 'run' || node.type === 'char') return mathRenderChars(node.kind, node.value, context, key)
  if (node.type === 'text') return h('span', { className: 'dsc-math-text', key, style: { whiteSpace: 'pre' } }, node.value)
  if (node.type === 'group') return h('span', { className: 'dsc-math-row', key }, mathRenderItems(node.items, context, key))
  if (node.type === 'space') return mathRenderSpace(node.size, key)
  if (node.type === 'frac') return mathRenderFrac(node, context, key)
  if (node.type === 'binom') return mathRenderBinom(node, context, key)
  if (node.type === 'sqrt') return mathRenderSqrt(node, context, key)
  if (node.type === 'bigop') return mathRenderBig(node, context, key)
  if (node.type === 'scripts') return mathRenderScripted(node, context, key)
  if (node.type === 'delimited') return mathRenderDelimited(node, context, key)
  if (node.type === 'delimiter') {
    return h('span', { className: 'dsc-math-delim', key, style: { fontSize: `${node.size.toFixed(2)}em` } }, node.glyph)
  }
  if (node.type === 'matrix') return mathRenderMatrix(node, context, key)
  if (node.type === 'accent') return mathRenderAccent(node, context, key)
  if (node.type === 'font') {
    return h('span', { className: 'dsc-math-row', key },
      mathRenderContent(node.body, { ...context, variant: node.variant }, key))
  }
  if (node.type === 'unknown') {
    return h('span', { className: 'dsc-math-text', key, style: { opacity: 0.65 } }, '\\' + node.name)
  }
  if (node.type === 'rowbreak') return h('span', { className: 'dsc-math-text', key }, '\\\\')
  return null
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function latexToNodes(source, { display = false } = {}) {
  const text = typeof source === 'string' ? source : source === null || source === undefined ? '' : String(source)
  if (text.trim() === '') return []
  try {
    if (text.length > MATH_MAX_SOURCE) return [h('span', { className: 'dsc-math-text', key: 'm' }, text)]
    const ast = parseLatex(text)
    if (ast.type === 'plain') return [h('span', { className: 'dsc-math-text', key: 'm' }, ast.source)]
    const context = { display: display === true, variant: null }
    return [h('span', { className: 'dsc-math-row', key: 'm' }, mathRenderItems(ast.items, context, 'm'))]
  } catch (error) {
    // Rendering problems must never drop the formula: show its source instead.
    return [h('span', { className: 'dsc-math-error', key: 'm', title: tr('mathFailed') }, text)]
  }
}

function LatexInline({ tex }) {
  const nodes = React.useMemo(() => latexToNodes(tex, { display: false }), [tex])
  return h('span', { className: 'dsc-math dsc-math-inline' }, nodes)
}

function LatexBlock({ tex }) {
  const nodes = React.useMemo(() => latexToNodes(tex, { display: true }), [tex])
  return h('div', { className: 'dsc-math dsc-math-block' }, nodes)
}

/* ---- 33-mermaid.js ---- */
/* Dependency-free Mermaid renderer.
 *
 * parseMermaid(source)  -> plain model data (flowchart / sequence / pie / class)
 * mermaidLayout(source) -> pure geometry { width, height, nodes, edges, texts, ... }
 * MermaidDiagram(...)   -> React elements (inline SVG, no raw HTML, no eval)
 *
 * Everything is linear-time over the source, capped, and safe for untrusted text:
 * labels are truncated, numbers are finite, and SVG text is always escaped by React.
 */
const MERMAID_MAX_SOURCE = 200000
const MERMAID_MAX_NODES = 400
const MERMAID_MAX_EDGES = 800
const MERMAID_MAX_PARTICIPANTS = 40
const MERMAID_MAX_MESSAGES = 200
const MERMAID_MAX_SLICES = 12
const MERMAID_MAX_LABEL = 120
const MERMAID_MAX_LINES = 10
const MERMAID_TEXT_WIDTH = 7.2
const MERMAID_DEFAULT_WIDTH = 720
const MERMAID_PAD = 32
const MERMAID_DIRECTIONS = { TD: 'TD', TB: 'TD', BT: 'BT', LR: 'LR', RL: 'RL' }
const MERMAID_FLOW_IGNORE = /^(?:classDef|class|style|linkStyle|click|link|direction|accTitle|accDescr)\b/i
const MERMAID_CLASS_IGNORE = /^(?:direction|note|hide|show|style|cssClass|click|title|accTitle|accDescr)\b/i
const MERMAID_CLASS_RELATION = /^\s*([A-Za-z_][\w.]*)\s*(?:"[^"]*"\s*)?(<\|--|--\|>|<\|\.\.|\.\.\|>|<--|-->|<\.\.|\.\.>|\*--|--\*|o--|--o|--|\.\.)\s*([A-Za-z_][\w.]*)\s*(?::\s*([\s\S]*))?$/
const MERMAID_FLOW_SHAPES = [
  ['[[', ']]', 'subroutine'], ['((', '))', 'circle'], ['[(', ')]', 'cylinder'],
  ['[/', '/]', 'parallelogram'], ['[\\', '\\]', 'parallelogram'], ['{{', '}}', 'hexagon'],
  ['>', ']', 'asymmetric'], ['[', ']', 'rect'], ['(', ')', 'rounded'], ['{', '}', 'diamond'],
]

// ---------- small value helpers ----------
function mermaidSafeText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  try {
    return String(value)
  } catch {
    return ''
  }
}
function mermaidNum(value, fallback = 0) {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : fallback
}
function mermaidRound(value, fallback = 0) {
  const number = Math.max(-1e7, Math.min(1e7, mermaidNum(value, fallback)))
  return Math.round(number * 100) / 100
}
function mermaidClamp(value, min, max) {
  const number = mermaidNum(value, min)
  return number < min ? min : (number > max ? max : number)
}
function mermaidClip(value, limit = MERMAID_MAX_LABEL) {
  const text = mermaidSafeText(value).replace(/\s+/g, ' ').trim()
  if (text.length <= limit) return text
  return limit <= 1 ? '\u2026' : `${text.slice(0, limit - 1)}\u2026`
}
function mermaidErrorMessage(error) {
  if (error === null || error === undefined) return 'diagram could not be rendered'
  return mermaidClip(typeof error === 'string' ? error : error.message || error, 200) || 'diagram could not be rendered'
}
function mermaidLimitError(message) {
  const error = new Error(message)
  error.mermaidLimit = true
  return error
}
function mermaidDirection(value) {
  return MERMAID_DIRECTIONS[typeof value === 'string' ? value.toUpperCase() : ''] || 'TD'
}
function mermaidLabelLines(raw) {
  let text = mermaidSafeText(raw).trim()
  if (text.length >= 2 && ((text[0] === '"' && text[text.length - 1] === '"') || (text[0] === "'" && text[text.length - 1] === "'"))) text = text.slice(1, -1).trim()
  const lines = []
  for (const piece of text.split(/<\s*br\s*\/?\s*>/i)) {
    const line = mermaidClip(piece, MERMAID_MAX_LABEL)
    if (line !== '') lines.push(line)
    if (lines.length >= MERMAID_MAX_LINES) break
  }
  return lines.length > 0 ? lines : ['']
}
function mermaidNodeSize(lines, minWidth = 90, maxWidth = 260, baseHeight = 40, lineHeight = 18) {
  let chars = 0
  for (const line of lines) chars = Math.max(chars, line.length)
  return { w: mermaidClamp(mermaidRound(chars * MERMAID_TEXT_WIDTH + 24), minWidth, maxWidth), h: mermaidRound(baseHeight + lineHeight * Math.max(0, lines.length - 1)) }
}
function mermaidWrapText(value, width = 34, maxLines = 4) {
  const words = mermaidClip(value, MERMAID_MAX_LABEL).split(' ').filter(word => word !== '')
  const lines = []
  let current = ''
  for (const word of words) {
    if (current === '') current = word
    else if (current.length + word.length + 1 <= width) current += ` ${word}`
    else {
      lines.push(current)
      current = word
      if (lines.length >= maxLines - 1) break
    }
  }
  if (lines.length < maxLines && current !== '') lines.push(current)
  if (lines.length === 0) lines.push('')
  return lines.map(line => mermaidClip(line, width))
}
// Splits on a separator that is outside brackets and double quotes.
function mermaidSplitTopLevel(text, separator) {
  const parts = []
  let buffer = ''
  let depth = 0
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quoted) { buffer += char; quoted = char !== '"'; continue }
    if (char === '"' && depth > 0) { quoted = true; buffer += char; continue }
    if (char === '[' || char === '(' || char === '{') { depth += 1; buffer += char; continue }
    if (char === ']' || char === ')' || char === '}') { depth = depth > 0 ? depth - 1 : 0; buffer += char; continue }
    if (depth === 0 && char === separator) { parts.push(buffer); buffer = ''; continue }
    buffer += char
  }
  parts.push(buffer)
  return parts
}

// ---------- flowchart parser ----------
// Index-based on purpose: slicing the remainder per character would be quadratic.
function mermaidMatchFlowOp(text, start) {
  const char = text[start]
  const second = text[start + 1]
  if (char === '-') {
    if (second === undefined) return null
    if (second === '>') return { op: '->', style: 'solid', arrow: true }
    if (second === '.') {
      let index = start + 1
      while (text[index] === '.') index += 1
      if (text.startsWith('->', index)) return { op: text.slice(start, index + 2), style: 'dotted', arrow: true }
      if (text[index] === '-' && text[index + 1] !== '>') index += 1
      return { op: text.slice(start, index), style: 'dotted', arrow: false }
    }
    if (second === '-') {
      let index = start + 1
      while (text[index] === '-') index += 1
      if (text[index] === '>') return { op: text.slice(start, index + 1), style: 'solid', arrow: true }
      return { op: text.slice(start, index), style: 'solid', arrow: false }
    }
    return null
  }
  if (char === '.') {
    let index = start + 1
    while (text[index] === '.') index += 1
    if (text.startsWith('->', index)) return { op: text.slice(start, index + 2), style: 'dotted', arrow: true }
    return { op: text.slice(start, index), style: 'dotted', arrow: false }
  }
  if (char === '=') {
    let index = start + 1
    while (text[index] === '=') index += 1
    if (index === start + 1) return null
    if (text[index] === '>') return { op: text.slice(start, index + 1), style: 'thick', arrow: true }
    return { op: text.slice(start, index), style: 'thick', arrow: false }
  }
  return null
}
function mermaidScanFlowStatement(text) {
  const parts = []
  let buffer = ''
  let depth = 0
  let quoted = false
  let index = 0
  while (index < text.length) {
    const char = text[index]
    if (quoted) {
      buffer += char
      if (char === '"') quoted = false
      index += 1
      continue
    }
    if (char === '"' && depth > 0) { quoted = true; buffer += char; index += 1; continue }
    if (char === '[' || char === '(' || char === '{') { depth += 1; buffer += char; index += 1; continue }
    if (char === ']' || char === ')' || char === '}') { if (depth > 0) depth -= 1; buffer += char; index += 1; continue }
    if (depth === 0) {
      const operation = mermaidMatchFlowOp(text, index)
      if (operation !== null) {
        parts.push({ type: 'text', value: buffer }, { type: 'op', value: operation.op, style: operation.style, arrow: operation.arrow })
        buffer = ''
        index += operation.op.length
        continue
      }
    }
    buffer += char
    index += 1
  }
  parts.push({ type: 'text', value: buffer })
  return parts
}
function mermaidParseFlowNode(piece) {
  let value = mermaidSafeText(piece).trim()
  if (value === '') return null
  const classMarker = value.indexOf(':::')
  if (classMarker > 0) value = value.slice(0, classMarker).trim()
  if (value === '') return null
  let id = ''
  let index = 0
  while (index < value.length) {
    const char = value[index]
    if ('"\'[(<{])}>| \t'.includes(char)) break
    id += char
    index += 1
  }
  if (id === '') {
    const fallback = mermaidClip(value, 64)
    return fallback === '' ? null : { id: fallback, shape: 'rect', lines: [fallback], explicit: true }
  }
  const rest = value.slice(index).trim()
  let shape = 'rect'
  let label = ''
  for (const entry of MERMAID_FLOW_SHAPES) {
    if (rest.length < entry[0].length + entry[1].length) continue
    if (!rest.startsWith(entry[0]) || !rest.endsWith(entry[1])) continue
    label = rest.slice(entry[0].length, rest.length - entry[1].length)
    shape = entry[2]
    break
  }
  return { id: mermaidClip(id, 64), shape, lines: mermaidLabelLines(label === '' ? id : label), explicit: label !== '' }
}
function mermaidFlowNode(model, spec, group) {
  const existing = model.nodeIndex.get(spec.id)
  if (existing !== undefined) {
    if (spec.explicit === true && existing.explicit !== true) {
      existing.explicit = true
      existing.shape = spec.shape
      existing.lines = spec.lines
    }
    if (group !== null && existing.group === null) existing.group = group.id
    return existing
  }
  if (model.nodes.length >= MERMAID_MAX_NODES) {
    throw mermaidLimitError(`diagram is too large: more than ${MERMAID_MAX_NODES} flowchart nodes`)
  }
  const node = { id: spec.id, shape: spec.shape, lines: spec.lines, explicit: spec.explicit === true, group: group === null ? null : group.id }
  model.nodeIndex.set(spec.id, node)
  model.nodes.push(node)
  return node
}
function mermaidFlowTargets(piece, model, group) {
  const targets = []
  for (const part of mermaidSplitTopLevel(piece, '&')) {
    const spec = mermaidParseFlowNode(part)
    if (spec !== null) targets.push(mermaidFlowNode(model, spec, group))
  }
  return targets
}
function mermaidApplyFlowStatement(statement, model, group) {
  const parts = mermaidScanFlowStatement(statement)
  if (parts.length === 0 || parts[0].type !== 'text') return
  let sources = mermaidFlowTargets(parts[0].value, model, group)
  let index = 1
  while (index < parts.length) {
    const operation = parts[index]
    const targetPart = parts[index + 1]
    if (operation.type !== 'op') { index += 1; continue }
    if (targetPart === undefined || targetPart.type !== 'text') { index += 1; continue }
    let rawTarget = targetPart.value
    let label = ''
    const pipe = /^\s*\|([^|]*)\|/.exec(rawTarget)
    if (pipe !== null) { label = mermaidClip(pipe[1], MERMAID_MAX_LABEL); rawTarget = rawTarget.slice(pipe[0].length) }
    let effective = operation
    let nextIndex = index + 2
    // A -- label --> B: a bare text between a line and an arrow is the edge label.
    const nextOperation = parts[index + 2]
    const afterNext = parts[index + 3]
    const candidate = rawTarget.trim()
    if (pipe === null && operation.arrow === false && nextOperation !== undefined && nextOperation.type === 'op'
      && nextOperation.arrow === true && afterNext !== undefined && afterNext.type === 'text'
      && candidate !== '' && !/[\[\](){}<>"']/.test(candidate)) {
      label = mermaidClip(candidate, MERMAID_MAX_LABEL)
      rawTarget = afterNext.value
      effective = { style: nextOperation.style === 'solid' ? operation.style : nextOperation.style, arrow: true }
      nextIndex = index + 4
    }
    const targets = mermaidFlowTargets(rawTarget, model, group)
    if (sources.length > 0 && targets.length > 0) {
      if (model.edges.length + sources.length * targets.length > MERMAID_MAX_EDGES) {
        throw mermaidLimitError(`diagram is too large: more than ${MERMAID_MAX_EDGES} flowchart edges`)
      }
      for (const from of sources) {
        for (const to of targets) {
          model.edges.push({ from: from.id, to: to.id, label, dashed: effective.style === 'dotted', thick: effective.style === 'thick', arrow: effective.arrow === true })
        }
      }
    }
    if (targets.length > 0) sources = targets
    index = nextIndex
  }
}
function mermaidFlowGroup(model, declaration) {
  const raw = mermaidSafeText(declaration).trim()
  let id = raw === '' ? `group-${model.groups.length + 1}` : raw
  let title = id
  const match = /^([^\s\[\]{}()"']+)([\s\S]*)$/.exec(raw)
  if (match !== null) {
    id = match[1]
    const rest = match[2].trim()
    if (rest.length >= 2 && rest.startsWith('[') && rest.endsWith(']')) title = rest.slice(1, -1)
    else if (rest !== '') title = rest
  }
  let key = id
  let suffix = 1
  while (model.groupIndex.has(key)) { key = `${id}-${suffix}`; suffix += 1 }
  const group = { id: key, title: mermaidClip(mermaidLabelLines(title).join(' '), 80) || 'group', depth: 0, members: [] }
  model.groupIndex.set(key, group)
  return group
}
function mermaidParseFlowchart(lines, headerIndex, direction, headerTail) {
  const model = { kind: 'flowchart', direction, nodes: [], nodeIndex: new Map(), edges: [], groups: [], groupIndex: new Map() }
  const statements = []
  for (const piece of mermaidSplitTopLevel(headerTail || '', ';')) if (piece.trim() !== '') statements.push(piece)
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.trim() === '' || line.trim().startsWith('%%')) continue
    for (const piece of mermaidSplitTopLevel(line, ';')) if (piece.trim() !== '') statements.push(piece)
  }
  const stack = []
  for (const statement of statements) {
    const line = statement.trim()
    if (line === '') continue
    const groupMatch = /^subgraph\b\s*([\s\S]*)$/i.exec(line)
    if (groupMatch !== null) {
      if (model.groups.length < 60) {
        const group = mermaidFlowGroup(model, groupMatch[1])
        group.depth = stack.length
        model.groups.push(group)
        stack.push(group)
      }
      continue
    }
    if (/^end$/i.test(line)) { stack.pop(); continue }
    if (MERMAID_FLOW_IGNORE.test(line)) continue
    mermaidApplyFlowStatement(line, model, stack.length > 0 ? stack[stack.length - 1] : null)
  }
  if (model.nodes.length === 0) return { kind: 'unknown', error: 'flowchart contains no nodes' }
  for (const node of model.nodes) {
    if (node.group === null) continue
    const group = model.groupIndex.get(node.group)
    if (group !== undefined) group.members.push(node.id)
  }
  return model
}

// ---------- sequence parser ----------
function mermaidSequenceParticipant(model, declaration) {
  const value = mermaidSafeText(declaration).trim()
  if (value === '') return null
  let id = value
  let label = value
  const asMatch = /^([\s\S]*?)\s+as\s+([\s\S]+)$/i.exec(value)
  if (asMatch !== null) { id = asMatch[1].trim(); label = asMatch[2].trim() }
  id = mermaidClip(id, 64)
  if (id === '') return null
  const existing = model.participantIndex.get(id)
  if (existing !== undefined) return existing
  if (model.participants.length >= MERMAID_MAX_PARTICIPANTS) {
    throw mermaidLimitError(`diagram is too large: more than ${MERMAID_MAX_PARTICIPANTS} participants`)
  }
  const lines = mermaidLabelLines(label === '' ? id : label)
  const participant = { id, label: lines.join(' '), lines }
  model.participantIndex.set(id, participant)
  model.participants.push(participant)
  return participant
}
function mermaidSequenceMessage(model, line, order) {
  const colon = line.indexOf(':')
  const head = colon >= 0 ? line.slice(0, colon) : line
  const text = colon >= 0 ? mermaidClip(line.slice(colon + 1), MERMAID_MAX_LABEL) : ''
  const arrowMatch = /-{1,2}(?:>>|>|x|\))/.exec(head)
  if (arrowMatch === null) return null
  const token = arrowMatch[0]
  let from = head.slice(0, arrowMatch.index).trim()
  let to = head.slice(arrowMatch.index + token.length).trim()
  if (from.endsWith('+') || from.endsWith('-') || from.endsWith('!')) from = from.slice(0, -1)
  if (to.startsWith('+') || to.startsWith('-') || to.startsWith('!')) to = to.slice(1)
  from = from.trim()
  to = to.trim()
  if (from === '' || to === '') return null
  mermaidSequenceParticipant(model, from)
  mermaidSequenceParticipant(model, to)
  if (model.messages.length >= MERMAID_MAX_MESSAGES) {
    throw mermaidLimitError(`diagram is too large: more than ${MERMAID_MAX_MESSAGES} messages`)
  }
  return {
    type: 'message', from: mermaidClip(from, 64), to: mermaidClip(to, 64), text,
    dashed: token.startsWith('--'), marker: token.endsWith('x') ? 'cross' : 'chevron', order,
  }
}
function mermaidParseSequence(lines, headerIndex) {
  const model = { kind: 'sequence', title: '', autonumber: false, participants: [], participantIndex: new Map(), messages: [], notes: [], frames: [], items: [] }
  const stack = []
  let order = 0
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (line === '' || line.startsWith('%%')) continue
    if (/^autonumber\b/i.test(line)) { model.autonumber = true; continue }
    if (/^title\b/i.test(line)) { model.title = mermaidClip(line.slice(5), MERMAID_MAX_LABEL); continue }
    const participantMatch = /^(?:participant|actor)\s+([\s\S]+)$/i.exec(line)
    if (participantMatch !== null) { mermaidSequenceParticipant(model, participantMatch[1]); continue }
    const noteMatch = /^note\s+(over|left of|right of)\s+([^:]+):\s*([\s\S]*)$/i.exec(line)
    if (noteMatch !== null) {
      const targets = noteMatch[2].split(',').map(piece => mermaidClip(piece, 64)).filter(target => target !== '')
      if (targets.length === 0) continue
      for (const target of targets) mermaidSequenceParticipant(model, target)
      const note = { type: 'note', position: noteMatch[1].toLowerCase(), targets, text: mermaidClip(noteMatch[3], MERMAID_MAX_LABEL), order }
      model.notes.push(note)
      model.items.push(note)
      order += 1
      continue
    }
    const frameMatch = /^(loop|alt|opt|par|rect|critical|break)\b\s*([\s\S]*)$/i.exec(line)
    if (frameMatch !== null) {
      stack.push({ kind: frameMatch[1].toLowerCase(), label: mermaidClip(frameMatch[2], 80), start: order, dividers: [], depth: stack.length })
      continue
    }
    if (/^else\b/i.test(line)) {
      const frame = stack.length > 0 ? stack[stack.length - 1] : null
      if (frame !== null) frame.dividers.push({ label: mermaidClip(line.slice(4), 80), order })
      continue
    }
    if (/^end$/i.test(line)) {
      const frame = stack.pop()
      if (frame !== undefined) frame.end = order
      if (frame !== undefined && frame.end > frame.start) model.frames.push(frame)
      continue
    }
    const message = mermaidSequenceMessage(model, line, order)
    if (message !== null) { model.messages.push(message); model.items.push(message); order += 1 }
  }
  if (model.participants.length === 0) return { kind: 'unknown', error: 'sequence diagram contains no participants' }
  model.frames.sort((left, right) => left.depth - right.depth)
  return model
}

// ---------- pie parser ----------
function mermaidParsePie(lines, headerIndex, headerTail) {
  const model = { kind: 'pie', title: '', showData: false, slices: [], omitted: 0 }
  const header = mermaidSafeText(headerTail)
  const headerTitle = /title\s+([\s\S]+)$/i.exec(header)
  if (headerTitle !== null) model.title = mermaidClip(headerTitle[1], MERMAID_MAX_LABEL)
  if (/\bshowData\b/i.test(header)) model.showData = true
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (line === '' || line.startsWith('%%')) continue
    if (/^title\b/i.test(line)) { model.title = mermaidClip(line.slice(5), MERMAID_MAX_LABEL); continue }
    if (/^showData\b/i.test(line)) { model.showData = true; continue }
    let match = /^"([^"]*)"\s*:\s*(-?\d+(?:\.\d+)?)\s*$/.exec(line)
    if (match === null) match = /^([^:"]+?)\s*:\s*(-?\d+(?:\.\d+)?)\s*$/.exec(line)
    if (match === null) continue
    const value = Number(match[2])
    if (!Number.isFinite(value) || value <= 0) continue
    if (model.slices.length >= MERMAID_MAX_SLICES) { model.omitted += 1; continue }
    model.slices.push({ label: mermaidClip(match[1], 60) || 'slice', value })
  }
  if (model.slices.length === 0) return { kind: 'unknown', error: 'pie chart contains no positive values' }
  return model
}

// ---------- class diagram parser ----------
function mermaidClassNode(model, rawName) {
  const name = mermaidClip(mermaidSafeText(rawName).replace(/:::\w+$/, ''), 64)
  if (name === '') return null
  const existing = model.nodeIndex.get(name)
  if (existing !== undefined) return existing
  if (model.nodes.length >= MERMAID_MAX_NODES) throw mermaidLimitError(`diagram is too large: more than ${MERMAID_MAX_NODES} classes`)
  const node = { id: name, title: name, members: [], explicit: false }
  model.nodeIndex.set(name, node)
  model.nodes.push(node)
  return node
}
function mermaidClassMember(node, rawText) {
  if (node === null) return
  const text = mermaidClip(mermaidSafeText(rawText).replace(/;$/, ''), MERMAID_MAX_LABEL)
  if (text === '' || node.members.length >= 30) return
  node.members.push(text)
}
function mermaidClassRelation(left, right, token, label) {
  const markerLeft = token.startsWith('<') || token.startsWith('*') || token.startsWith('o')
  const markerRight = token.endsWith('>') || token.endsWith('*') || token.endsWith('o')
  const hollow = token.includes('|')
  const diamond = token.includes('*') || token.includes('o')
  let layoutFrom = left
  let layoutTo = right
  let arrowAt = 'to'
  if (hollow) {
    layoutFrom = markerLeft ? left : right
    layoutTo = markerLeft ? right : left
    arrowAt = 'from'
  } else if (markerLeft) {
    arrowAt = 'from'
  }
  return {
    type: 'class-relation', left, right, layoutFrom, layoutTo, arrowAt,
    marker: markerLeft || markerRight ? (hollow ? 'hollow' : (diamond ? 'diamond' : 'chevron')) : 'none',
    dashed: token.includes('..'), label: mermaidClip(label, MERMAID_MAX_LABEL),
  }
}
function mermaidParseClassDiagram(lines, headerIndex) {
  const model = { kind: 'class', direction: 'TD', nodes: [], nodeIndex: new Map(), edges: [] }
  let body = null
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (line === '' || line.startsWith('%%')) continue
    const directionMatch = /^direction\s+(TD|TB|BT|LR|RL)\s*$/i.exec(line)
    if (directionMatch !== null) { model.direction = mermaidDirection(directionMatch[1]); continue }
    if (body !== null) {
      if (line === '}') { body = null; continue }
      if (line.endsWith('}')) { mermaidClassMember(body, line.slice(0, -1).trim()); body = null; continue }
      mermaidClassMember(body, line)
      continue
    }
    if (MERMAID_CLASS_IGNORE.test(line)) continue
    const classMatch = /^class\s+([^\s{}]+)\s*([\s\S]*)$/i.exec(line)
    if (classMatch !== null) {
      const node = mermaidClassNode(model, classMatch[1])
      if (node !== null) node.explicit = true
      const rest = classMatch[2].trim()
      const openIndex = rest.indexOf('{')
      if (openIndex >= 0) {
        const inner = rest.slice(openIndex + 1)
        const closeIndex = inner.lastIndexOf('}')
        const content = closeIndex >= 0 ? inner.slice(0, closeIndex) : inner
        for (const piece of mermaidSplitTopLevel(content, ';')) mermaidClassMember(node, piece.trim())
        if (closeIndex < 0) body = node
      }
      continue
    }
    const relation = MERMAID_CLASS_RELATION.exec(line)
    if (relation !== null) {
      const left = mermaidClassNode(model, relation[1])
      const right = mermaidClassNode(model, relation[3])
      if (left === null || right === null) continue
      if (model.edges.length >= MERMAID_MAX_EDGES) {
        throw mermaidLimitError(`diagram is too large: more than ${MERMAID_MAX_EDGES} class relations`)
      }
      model.edges.push(mermaidClassRelation(left.id, right.id, relation[2], relation[4] || ''))
      continue
    }
    const memberLine = /^([^\s:]+)\s*:\s*([\s\S]+)$/.exec(line)
    if (memberLine !== null) mermaidClassMember(mermaidClassNode(model, memberLine[1]), memberLine[2])
  }
  if (model.nodes.length === 0) return { kind: 'unknown', error: 'class diagram contains no classes' }
  return model
}

// ---------- parse entry point ----------
function parseMermaid(source) {
  const text = typeof source === 'string' ? source : mermaidSafeText(source)
  if (text.trim() === '') return { kind: 'unknown', error: 'diagram source is empty' }
  if (text.length > MERMAID_MAX_SOURCE) return { kind: 'unknown', error: `diagram source is too large (limit ${MERMAID_MAX_SOURCE} characters)` }
  try {
    const lines = text.replace(/\r\n?/g, '\n').split('\n')
    let headerIndex = -1
    let header = ''
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim()
      if (line === '' || line.startsWith('%%')) continue
      header = line
      headerIndex = index
      break
    }
    if (headerIndex < 0) return { kind: 'unknown', error: 'diagram source contains no content' }
    const keywordMatch = /^([A-Za-z][\w-]*)/.exec(header)
    if (keywordMatch === null) return { kind: 'unknown', error: 'diagram header is not recognized' }
    const keyword = keywordMatch[1].toLowerCase()
    if (keyword === 'flowchart' || keyword === 'graph') {
      const headerMatch = /^(?:flowchart|graph)\s*([A-Za-z]{2})?/.exec(header)
      const direction = mermaidDirection(headerMatch === null ? '' : headerMatch[1])
      return mermaidParseFlowchart(lines, headerIndex, direction, header.slice(headerMatch === null ? keyword.length : headerMatch[0].length))
    }
    if (keyword === 'sequencediagram') return mermaidParseSequence(lines, headerIndex)
    if (keyword === 'pie') return mermaidParsePie(lines, headerIndex, header.slice(3))
    if (keyword === 'classdiagram' || keyword === 'classdiagram-v2') return mermaidParseClassDiagram(lines, headerIndex)
    return { kind: 'unknown', error: `unsupported diagram type: ${keyword}` }
  } catch (error) {
    return { kind: 'unknown', error: mermaidErrorMessage(error) }
  }
}

// ---------- shared layered graph engine ----------
function mermaidRankNodes(nodes, edges, indexById) {
  const count = nodes.length
  const adjacency = Array.from({ length: count }, () => [])
  const indegree = new Array(count).fill(0)
  for (const edge of edges) {
    const from = indexById.get(edge.from)
    const to = indexById.get(edge.to)
    if (from === undefined || to === undefined || from === to) continue
    adjacency[from].push(to)
    indegree[to] += 1
  }
  const order = []
  const queue = []
  for (let index = 0; index < count; index += 1) if (indegree[index] === 0) queue.push(index)
  for (let head = 0; head < queue.length; head += 1) {
    const current = queue[head]
    order.push(current)
    for (const next of adjacency[current]) {
      indegree[next] -= 1
      if (indegree[next] === 0) queue.push(next)
    }
  }
  const ordered = new Set(order)
  for (let index = 0; index < count; index += 1) if (!ordered.has(index)) order.push(index)
  const rank = new Array(count).fill(0)
  for (const current of order) {
    const nextRank = rank[current] + 1
    if (nextRank > count) continue
    for (const next of adjacency[current]) if (rank[next] < nextRank) rank[next] = nextRank
  }
  return rank
}
function mermaidLayeredLayout(nodes, edges, direction, sizes) {
  const count = nodes.length
  const indexById = new Map()
  nodes.forEach((node, index) => indexById.set(node.id, index))
  const rank = mermaidRankNodes(nodes, edges, indexById)
  const usedRanks = []
  const seenRanks = new Set()
  for (const value of rank) if (!seenRanks.has(value)) { seenRanks.add(value); usedRanks.push(value) }
  usedRanks.sort((left, right) => left - right)
  const rankToLayer = new Map()
  usedRanks.forEach((value, index) => rankToLayer.set(value, index))
  const layers = usedRanks.map(() => [])
  nodes.forEach((node, index) => layers[rankToLayer.get(rank[index]) || 0].push(index))
  const horizontal = direction === 'LR' || direction === 'RL'
  const reverse = direction === 'BT' || direction === 'RL'
  const primaryGap = horizontal ? 80 : 58
  const crossGap = horizontal ? 30 : 36
  const dims = nodes.map(node => sizes.get(node.id) || { w: 120, h: 40 })
  const layerPrimary = layers.map(layer => layer.reduce((max, index) => Math.max(max, horizontal ? dims[index].w : dims[index].h), 0))
  const layerCross = layers.map((layer) => {
    let total = 0
    layer.forEach((index, position) => { total += (horizontal ? dims[index].h : dims[index].w) + (position > 0 ? crossGap : 0) })
    return total
  })
  let maxCross = 0
  for (const value of layerCross) maxCross = Math.max(maxCross, value)
  const primaryStarts = []
  let primary = 0
  layers.forEach((layer, layerIndex) => {
    if (layerIndex > 0) primary += primaryGap
    primaryStarts.push(primary)
    primary += layerPrimary[layerIndex]
  })
  const contentPrimary = primary
  const positionInLayer = new Array(count).fill(0)
  const crossOffsets = layers.map((layer, layerIndex) => {
    let offset = (maxCross - layerCross[layerIndex]) / 2
    return layer.map((index) => {
      positionInLayer[index] = layer.indexOf(index)
      const current = offset
      offset += (horizontal ? dims[index].h : dims[index].w) + crossGap
      return current
    })
  })
  const placed = nodes.map((node, index) => {
    const dim = dims[index]
    const cross = crossOffsets[rankToLayer.get(rank[index]) || 0][positionInLayer[index]]
    const start = primaryStarts[rankToLayer.get(rank[index]) || 0]
    let x = horizontal ? start : cross
    let y = horizontal ? cross : start
    if (reverse) {
      if (horizontal) x = contentPrimary - start - dim.w
      else y = contentPrimary - start - dim.h
    }
    return {
      id: node.id, shape: node.shape, lines: node.lines, title: node.title, members: node.members, group: node.group,
      explicit: node.explicit, x: mermaidRound(x), y: mermaidRound(y), w: dim.w, h: dim.h,
    }
  })
  return { nodes: placed, contentW: horizontal ? contentPrimary : maxCross, contentH: horizontal ? maxCross : contentPrimary }
}

// ---------- edge / marker geometry ----------
function mermaidHeadPath(kind, x, y, dx, dy) {
  const length = Math.hypot(dx, dy)
  if (!Number.isFinite(length) || length < 0.001) return null
  const ux = dx / length
  const uy = dy / length
  const r = mermaidRound
  if (kind === 'cross') {
    return `M ${r(x - 5)} ${r(y - 5)} L ${r(x + 5)} ${r(y + 5)} M ${r(x + 5)} ${r(y - 5)} L ${r(x - 5)} ${r(y + 5)}`
  }
  if (kind === 'hollow' || kind === 'diamond') {
    const size = 11
    const half = size * (kind === 'hollow' ? 0.62 : 0.42)
    const normalX = -uy * half
    const normalY = ux * half
    if (kind === 'hollow') {
      const baseX = x - ux * size
      const baseY = y - uy * size
      return `M ${r(x)} ${r(y)} L ${r(baseX + normalX)} ${r(baseY + normalY)} L ${r(baseX - normalX)} ${r(baseY - normalY)} Z`
    }
    const midX = x - ux * size * 0.5
    const midY = y - uy * size * 0.5
    const baseX = x - ux * size
    const baseY = y - uy * size
    return `M ${r(x)} ${r(y)} L ${r(midX + normalX)} ${r(midY + normalY)} L ${r(baseX)} ${r(baseY)} L ${r(midX - normalX)} ${r(midY - normalY)} Z`
  }
  const size = 8
  const half = size * 0.62
  const baseX = x - ux * size
  const baseY = y - uy * size
  const normalX = -uy * half
  const normalY = ux * half
  return `M ${r(baseX + normalX)} ${r(baseY + normalY)} L ${r(x)} ${r(y)} L ${r(baseX - normalX)} ${r(baseY - normalY)}`
}
// Marker colours are owned by the stylesheet. A static table keeps the class
// names visible to tools/check-classes.js instead of building them from a
// string prefix.
const MERMAID_MARKER_CLASS = {
  hollow: 'dsc-mermaid-edge-hollow',
  diamond: 'dsc-mermaid-edge-diamond',
  cross: 'dsc-mermaid-edge-cross',
}

function mermaidMarker(kind, x, y, dx, dy) {
  if (kind === 'none') return null
  const d = mermaidHeadPath(kind, x, y, dx, dy)
  if (d === null) return null
  const markerClass = MERMAID_MARKER_CLASS[kind]
  const suffix = markerClass === undefined ? '' : ` ${markerClass}`
  return { d, className: `dsc-mermaid-edge-arrow${suffix}`, fill: 'none' }
}
function mermaidSelfEdgeGeometry(node, markerKind) {
  const startX = node.x + node.w * 0.35
  const endX = node.x + node.w * 0.65
  const top = node.y
  // Keep the loop inside the viewBox: the top layer starts at the pad offset.
  const lift = Math.max(16, Math.min(44, top - 4))
  const d = `M ${mermaidRound(startX)} ${mermaidRound(top)} C ${mermaidRound(startX + 26)} ${mermaidRound(top - lift)} ${mermaidRound(endX + 26)} ${mermaidRound(top - lift)} ${mermaidRound(endX)} ${mermaidRound(top)}`
  return {
    d, marker: mermaidMarker(markerKind, endX, top, 0, 1),
    labelX: mermaidRound((startX + endX) / 2 + 34), labelY: mermaidRound(Math.max(8, top - lift + 12)), labelAnchor: 'start',
  }
}
function mermaidGraphEdgeGeometry(from, to, direction, options) {
  const markerKind = options && options.marker ? options.marker : 'none'
  const dashed = Boolean(options && options.dashed)
  const thick = Boolean(options && options.thick)
  if (from.id === to.id) return { ...mermaidSelfEdgeGeometry(from, markerKind), dashed, thick }
  const horizontal = direction === 'LR' || direction === 'RL'
  const r = mermaidRound
  let sx = 0
  let sy = 0
  let tx = 0
  let ty = 0
  let tangentX = 1
  let tangentY = 0
  let labelX = 0
  let labelY = 0
  let path = ''
  if (horizontal && Math.abs(from.x - to.x) < 1) {
    const down = to.y >= from.y
    sx = from.x + from.w / 2; sy = down ? from.y + from.h : from.y
    tx = to.x + to.w / 2; ty = down ? to.y : to.y + to.h
    const dy = ty - sy
    if (Math.abs(dy) < 1) return null
    path = `M ${r(sx)} ${r(sy)} L ${r(tx)} ${r(ty)}`
    tangentY = dy >= 0 ? 1 : -1
    labelX = (sx + tx) / 2 + 10; labelY = (sy + ty) / 2
  } else if (horizontal) {
    const forward = direction !== 'RL'
    sx = forward ? from.x + from.w : from.x; sy = from.y + from.h / 2
    tx = forward ? to.x : to.x + to.w; ty = to.y + to.h / 2
    const dx = tx - sx
    if (Math.abs(dx) < 1) return null
    const sign = dx >= 0 ? 1 : -1
    const bend = Math.max(18, Math.abs(dx) * 0.45)
    path = `M ${r(sx)} ${r(sy)} C ${r(sx + bend * sign)} ${r(sy)} ${r(tx - bend * sign)} ${r(ty)} ${r(tx)} ${r(ty)}`
    tangentX = sign; tangentY = 0
    labelX = (sx + tx) / 2; labelY = (sy + ty) / 2 - 10
  } else if (Math.abs(from.y - to.y) < 1) {
    const right = to.x >= from.x
    sx = right ? from.x + from.w : from.x; sy = from.y + from.h / 2
    tx = right ? to.x : to.x + to.w; ty = to.y + to.h / 2
    const dx = tx - sx
    if (Math.abs(dx) < 1) return null
    path = `M ${r(sx)} ${r(sy)} L ${r(tx)} ${r(ty)}`
    tangentX = dx >= 0 ? 1 : -1; tangentY = 0
    labelX = (sx + tx) / 2; labelY = (sy + ty) / 2 - 10
  } else {
    const down = direction !== 'BT'
    sx = from.x + from.w / 2; sy = down ? from.y + from.h : from.y
    tx = to.x + to.w / 2; ty = down ? to.y : to.y + to.h
    const dy = ty - sy
    if (Math.abs(dy) < 1) return null
    const sign = dy >= 0 ? 1 : -1
    const bend = Math.max(18, Math.abs(dy) * 0.45)
    path = `M ${r(sx)} ${r(sy)} C ${r(sx)} ${r(sy + bend * sign)} ${r(tx)} ${r(ty - bend * sign)} ${r(tx)} ${r(ty)}`
    tangentX = 0; tangentY = sign
    labelX = (sx + tx) / 2; labelY = (sy + ty) / 2 - 10
  }
  return {
    d: path, marker: mermaidMarker(markerKind, tx, ty, tangentX, tangentY), dashed, thick,
    labelX: r(labelX), labelY: r(labelY), labelAnchor: 'middle',
  }
}

// ---------- centered layout helpers ----------
function mermaidCenterOffsets(placed, clusters, requestedWidth) {
  let minX = 0
  let minY = 0
  let maxX = placed.contentW
  let maxY = placed.contentH
  for (const node of placed.nodes) {
    minX = Math.min(minX, node.x); minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x + node.w); maxY = Math.max(maxY, node.y + node.h)
  }
  for (const cluster of clusters) {
    minX = Math.min(minX, cluster.x); minY = Math.min(minY, cluster.y)
    maxX = Math.max(maxX, cluster.x + cluster.w); maxY = Math.max(maxY, cluster.y + cluster.h)
  }
  const contentW = Math.max(1, maxX - minX)
  const contentH = Math.max(1, maxY - minY)
  const width = Math.max(requestedWidth, contentW + MERMAID_PAD * 2)
  const height = Math.max(120, contentH + MERMAID_PAD * 2)
  return { width, height, offsetX: (width - contentW) / 2 - minX, offsetY: (height - contentH) / 2 - minY }
}
function mermaidPolygonShape(shape) {
  return shape === 'diamond' || shape === 'asymmetric' || shape === 'hexagon' || shape === 'parallelogram'
}
function mermaidPolygonPoints(node) {
  const r = mermaidRound
  const x = node.x
  const y = node.y
  const w = node.w
  const h = node.h
  const cx = x + w / 2
  const cy = y + h / 2
  if (node.shape === 'diamond') return `${r(cx)},${r(y)} ${r(x + w)},${r(cy)} ${r(cx)},${r(y + h)} ${r(x)},${r(cy)}`
  if (node.shape === 'asymmetric') {
    return `${r(x + 10)},${r(y)} ${r(x + w)},${r(cy)} ${r(x + 10)},${r(y + h)} ${r(x)},${r(y + h)} ${r(x)},${r(y)}`
  }
  if (node.shape === 'hexagon') {
    return `${r(x + 12)},${r(y)} ${r(x + w - 12)},${r(y)} ${r(x + w)},${r(cy)} ${r(x + w - 12)},${r(y + h)} ${r(x + 12)},${r(y + h)} ${r(x)},${r(cy)}`
  }
  return `${r(x + 12)},${r(y)} ${r(x + w)},${r(y)} ${r(x + w - 12)},${r(y + h)} ${r(x)},${r(y + h)}`
}

// ---------- flowchart layout ----------
function mermaidLayoutFlowchart(model, requestedWidth) {
  const sizes = new Map()
  for (const node of model.nodes) sizes.set(node.id, mermaidNodeSize(node.lines))
  const placed = mermaidLayeredLayout(model.nodes, model.edges, model.direction, sizes)
  const nodeGeom = new Map()
  for (const node of placed.nodes) nodeGeom.set(node.id, node)
  const clusters = []
  for (const group of model.groups) {
    if (group.members.length === 0) continue
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const id of group.members) {
      const node = nodeGeom.get(id)
      if (node === undefined) continue
      minX = Math.min(minX, node.x); minY = Math.min(minY, node.y)
      maxX = Math.max(maxX, node.x + node.w); maxY = Math.max(maxY, node.y + node.h)
    }
    if (!Number.isFinite(minX)) continue
    clusters.push({ id: group.id, shape: 'rect', className: 'dsc-mermaid-cluster', title: group.title, depth: group.depth, x: minX - 16, y: minY - 26, w: maxX - minX + 32, h: maxY - minY + 40 })
  }
  clusters.sort((left, right) => left.depth - right.depth)
  const offsets = mermaidCenterOffsets(placed, clusters, requestedWidth)
  const nodes = placed.nodes.map((node) => {
    const result = { ...node, x: mermaidRound(node.x + offsets.offsetX), y: mermaidRound(node.y + offsets.offsetY), className: 'dsc-mermaid-node' }
    if (mermaidPolygonShape(node.shape)) result.points = mermaidPolygonPoints(result)
    return result
  })
  const nodeMap = new Map()
  for (const node of nodes) nodeMap.set(node.id, node)
  const clusterShapes = clusters.map(cluster => ({ ...cluster, x: mermaidRound(cluster.x + offsets.offsetX), y: mermaidRound(cluster.y + offsets.offsetY) }))
  const texts = []
  for (const cluster of clusterShapes) {
    if (cluster.title !== '') texts.push({ text: mermaidClip(cluster.title, 80), x: mermaidRound(cluster.x + 10), y: mermaidRound(cluster.y + 15), textAnchor: 'start', className: 'dsc-mermaid-cluster-label' })
  }
  for (const node of nodes) {
    const fitted = Math.max(6, Math.floor((node.w - 18) / MERMAID_TEXT_WIDTH))
    const lines = node.lines.map(line => mermaidClip(line, fitted))
    const startY = node.y + node.h / 2 - ((lines.length - 1) * 18) / 2
    lines.forEach((line, index) => texts.push({ text: line, x: mermaidRound(node.x + node.w / 2), y: mermaidRound(startY + index * 18), textAnchor: 'middle', className: 'dsc-mermaid-node-label' }))
  }
  const edges = []
  for (const edge of model.edges) {
    const from = nodeMap.get(edge.from)
    const to = nodeMap.get(edge.to)
    if (from === undefined || to === undefined) continue
    const geometry = mermaidGraphEdgeGeometry(from, to, model.direction, { marker: edge.arrow ? 'chevron' : 'none', dashed: edge.dashed, thick: edge.thick })
    if (geometry === null) continue
    edges.push({ ...edge, ...geometry })
    if (edge.label !== '') texts.push({ text: mermaidClip(edge.label), x: geometry.labelX, y: geometry.labelY, textAnchor: geometry.labelAnchor, className: 'dsc-mermaid-edge-label' })
  }
  return {
    kind: 'flowchart', direction: model.direction, width: mermaidRound(offsets.width), height: mermaidRound(offsets.height),
    nodes, edges, texts, clusters: clusterShapes, frames: [], notes: [], lifelines: [], legend: [], rules: [],
  }
}

// ---------- class diagram layout ----------
function mermaidClassSize(node) {
  let chars = node.title.length
  for (const member of node.members) chars = Math.max(chars, member.length)
  return { w: mermaidClamp(mermaidRound(chars * MERMAID_TEXT_WIDTH + 30), 130, 300), h: mermaidRound(Math.max(44, 34 + node.members.length * 18)) }
}
function mermaidLayoutClassDiagram(model, requestedWidth) {
  const sizes = new Map()
  for (const node of model.nodes) sizes.set(node.id, mermaidClassSize(node))
  const rankEdges = model.edges.map(edge => ({ from: edge.layoutFrom, to: edge.layoutTo }))
  const placed = mermaidLayeredLayout(model.nodes, rankEdges, model.direction, sizes)
  const offsets = mermaidCenterOffsets(placed, [], requestedWidth)
  const nodes = placed.nodes.map(node => ({
    ...node, x: mermaidRound(node.x + offsets.offsetX), y: mermaidRound(node.y + offsets.offsetY), className: 'dsc-mermaid-node',
  }))
  const nodeMap = new Map()
  for (const node of nodes) nodeMap.set(node.id, node)
  const texts = []
  for (const node of nodes) {
    const fitted = Math.max(8, Math.floor((node.w - 22) / MERMAID_TEXT_WIDTH))
    texts.push({
      text: mermaidClip(node.title, fitted), x: mermaidRound(node.x + node.w / 2), y: mermaidRound(node.y + 19),
      textAnchor: 'middle', className: 'dsc-mermaid-node-label dsc-mermaid-class-title',
    })
    node.members.forEach((member, index) => {
      texts.push({
        text: mermaidClip(member, fitted), x: mermaidRound(node.x + 12), y: mermaidRound(node.y + 40 + index * 18),
        textAnchor: 'start', className: 'dsc-mermaid-node-label dsc-mermaid-class-member',
      })
    })
  }
  const edges = []
  for (const relation of model.edges) {
    const left = nodeMap.get(relation.layoutFrom)
    const right = nodeMap.get(relation.layoutTo)
    if (left === undefined || right === undefined) continue
    const arrowAtFrom = relation.arrowAt === 'from'
    const geometry = mermaidGraphEdgeGeometry(arrowAtFrom ? right : left, arrowAtFrom ? left : right, model.direction, { marker: relation.marker, dashed: relation.dashed })
    if (geometry === null) continue
    edges.push({ ...relation, ...geometry })
    if (relation.label !== '') texts.push({ text: mermaidClip(relation.label), x: geometry.labelX, y: geometry.labelY, textAnchor: geometry.labelAnchor, className: 'dsc-mermaid-edge-label' })
  }
  return {
    kind: 'class', direction: model.direction, width: mermaidRound(offsets.width), height: mermaidRound(offsets.height),
    nodes, edges, texts, clusters: [], frames: [], notes: [], lifelines: [], legend: [], rules: [],
  }
}

// ---------- sequence layout ----------
function mermaidLayoutSequenceDiagram(model, requestedWidth) {
  const pad = 40
  const participants = model.participants
  const count = participants.length
  const boxes = participants.map((participant) => {
    const lines = mermaidLabelLines(participant.label)
    return { lines, ...mermaidNodeSize(lines, 100, 240, 40, 16) }
  })
  let maxBoxWidth = 100
  let maxBoxHeight = 40
  for (const box of boxes) { maxBoxWidth = Math.max(maxBoxWidth, box.w); maxBoxHeight = Math.max(maxBoxHeight, box.h) }
  const columnStep = maxBoxWidth + 34
  const edgePad = Math.max(pad, maxBoxWidth / 2 + 14)
  const titleSpace = model.title === '' ? 0 : 30
  const width = Math.max(requestedWidth, 360, edgePad * 2 + (count - 1) * columnStep)
  const columns = participants.map((participant, index) => (count === 1 ? width / 2 : edgePad + (index * (width - edgePad * 2)) / (count - 1)))
  const columnOf = (id) => {
    for (let index = 0; index < participants.length; index += 1) if (participants[index].id === id) return columns[index]
    return null
  }
  const headerY = pad + titleSpace
  const headerH = maxBoxHeight
  let maxDepth = 0
  for (const frame of model.frames) maxDepth = Math.max(maxDepth, frame.depth + 1)
  const startY = headerY + headerH + 42 + maxDepth * 14
  const yAt = order => startY + order * 54
  const nodes = []
  const texts = []
  const lifelines = []
  if (model.title !== '') texts.push({ text: model.title, x: mermaidRound(width / 2), y: mermaidRound(pad + 10), textAnchor: 'middle', className: 'dsc-mermaid-title' })
  participants.forEach((participant, index) => {
    const box = boxes[index]
    nodes.push({ id: participant.id, shape: 'rect', className: 'dsc-mermaid-node', x: mermaidRound(columns[index] - box.w / 2), y: headerY, w: box.w, h: headerH })
    const labelStart = headerY + headerH / 2 - ((box.lines.length - 1) * 16) / 2
    box.lines.forEach((line, lineIndex) => texts.push({
      text: mermaidClip(line, MERMAID_MAX_LABEL), x: mermaidRound(columns[index]), y: mermaidRound(labelStart + lineIndex * 16),
      textAnchor: 'middle', className: 'dsc-mermaid-node-label',
    }))
  })
  const lastOrder = model.items.length - 1
  const lifelineBottom = lastOrder >= 0 ? yAt(lastOrder) + 44 : headerY + headerH + 66
  const height = Math.max(lifelineBottom + pad, headerY + headerH + 120)
  participants.forEach((participant, index) => lifelines.push({
    d: `M ${mermaidRound(columns[index])} ${mermaidRound(headerY + headerH)} L ${mermaidRound(columns[index])} ${mermaidRound(lifelineBottom)}`,
    className: 'dsc-mermaid-edge dsc-mermaid-lifeline', dash: '4 4',
  }))
  const frames = []
  for (const frame of model.frames) {
    if (frame.end <= frame.start) continue
    // Outer frames get the highest label band so nested frames never poke out.
    const top = yAt(frame.start) - 22 - (maxDepth - frame.depth) * 12
    const bottom = yAt(frame.end - 1) + 26 - frame.depth * 4
    const x = MERMAID_PAD - 10 + frame.depth * 8
    const frameWidth = width - 2 * x
    if (frameWidth <= 40) continue
    const frameY = Math.max(headerY + headerH + 8, top)
    frames.push({
      id: `frame-${frame.kind}-${frame.start}`, shape: 'rect', className: 'dsc-mermaid-frame',
      x: mermaidRound(x), y: mermaidRound(frameY), w: mermaidRound(frameWidth), h: mermaidRound(Math.max(48, bottom - frameY)),
    })
    texts.push({
      text: mermaidClip(frame.label === '' ? frame.kind : `${frame.kind} ${frame.label}`, 100),
      x: mermaidRound(x + 10), y: mermaidRound(frameY + 15), textAnchor: 'start', className: 'dsc-mermaid-frame-label',
    })
    for (const divider of frame.dividers) {
      if (divider.label === '' || divider.order < frame.start || divider.order >= frame.end) continue
      texts.push({ text: `[${mermaidClip(divider.label, 80)}]`, x: mermaidRound(x + 10), y: mermaidRound(yAt(divider.order) - 32), textAnchor: 'start', className: 'dsc-mermaid-frame-label' })
    }
  }
  const notes = []
  for (const note of model.notes) {
    const lines = mermaidWrapText(note.text, 34, 4)
    let chars = 0
    for (const line of lines) chars = Math.max(chars, line.length)
    const noteWidth = mermaidClamp(mermaidRound(chars * MERMAID_TEXT_WIDTH + 26), 120, 300)
    const noteHeight = mermaidRound(16 + lines.length * 18)
    const firstX = columnOf(note.targets[0])
    if (firstX === null) continue
    let x = firstX - noteWidth / 2
    if (note.position === 'left of') x = firstX - 14 - noteWidth
    else if (note.position === 'right of') x = firstX + 14
    else if (note.targets.length > 1) {
      const secondX = columnOf(note.targets[1])
      if (secondX !== null) x = (firstX + secondX) / 2 - noteWidth / 2
    }
    x = mermaidClamp(x, 8, Math.max(8, width - noteWidth - 8))
    const noteY = mermaidClamp(yAt(note.order) - noteHeight / 2, headerY + headerH + 8, Math.max(headerY + headerH + 8, lifelineBottom - noteHeight))
    notes.push({ id: `note-${note.order}`, shape: 'rect', className: 'dsc-mermaid-note', x: mermaidRound(x), y: mermaidRound(noteY), w: noteWidth, h: noteHeight })
    const textStart = noteY + noteHeight / 2 - ((lines.length - 1) * 18) / 2
    lines.forEach((line, index) => texts.push({
      text: line, x: mermaidRound(x + noteWidth / 2), y: mermaidRound(textStart + index * 18),
      textAnchor: 'middle', className: 'dsc-mermaid-note-label',
    }))
  }
  const messages = []
  for (const message of model.messages) {
    const fromX = columnOf(message.from)
    const toX = columnOf(message.to)
    if (fromX === null || toX === null) continue
    const y = mermaidRound(yAt(message.order))
    if (fromX === toX) {
      const edgeX = mermaidRound(fromX + 4)
      messages.push({
        ...message, x: mermaidRound(fromX), y,
        d: `M ${edgeX} ${mermaidRound(y - 6)} C ${mermaidRound(fromX + 44)} ${mermaidRound(y - 30)} ${mermaidRound(fromX + 44)} ${mermaidRound(y + 30)} ${edgeX} ${mermaidRound(y + 6)}`,
        marker: mermaidMarker(message.marker, edgeX, y + 6, -1, 0),
      })
      if (message.text !== '') texts.push({ text: mermaidClip(message.text), x: mermaidRound(fromX + 52), y, textAnchor: 'start', className: 'dsc-mermaid-edge-label' })
    } else {
      messages.push({
        ...message, x: mermaidRound(fromX), y, d: `M ${mermaidRound(fromX)} ${y} L ${mermaidRound(toX)} ${y}`,
        marker: mermaidMarker(message.marker, toX, y, toX >= fromX ? 1 : -1, 0),
      })
      if (message.text !== '') texts.push({ text: mermaidClip(message.text), x: mermaidRound((fromX + toX) / 2), y: mermaidRound(y - 12), textAnchor: 'middle', className: 'dsc-mermaid-edge-label' })
    }
  }
  return {
    kind: 'sequence', direction: 'LR', width: mermaidRound(width), height: mermaidRound(height),
    nodes, edges: messages, messages, participants, texts, clusters: [], frames, notes, lifelines, legend: [], rules: [],
  }
}

// ---------- pie layout ----------
function mermaidLayoutPieChart(model, requestedWidth) {
  const pad = 36
  const slices = model.slices
  let total = 0
  for (const slice of slices) total += slice.value
  if (!Number.isFinite(total) || total <= 0) return null
  const radius = 128
  const rows = slices.map(slice => {
    const percent = (slice.value / total) * 100
    return { slice, percent: Math.round(percent * 10) / 10, label: `${slice.label}  ${slice.value} (${Math.round(percent)}%)` }
  })
  let legendChars = 0
  for (const row of rows) legendChars = Math.max(legendChars, row.label.length)
  const legendWidth = mermaidClamp(mermaidRound(legendChars * MERMAID_TEXT_WIDTH + 54), 150, 340)
  const sideBySide = requestedWidth >= 520
  const titleHeight = model.title === '' ? 0 : 36
  const pieBox = radius * 2
  const contentW = sideBySide ? pieBox + 30 + legendWidth : Math.max(pieBox, legendWidth)
  const contentH = sideBySide ? Math.max(pieBox, rows.length * 26) : pieBox + 30 + rows.length * 26
  const width = Math.max(requestedWidth, contentW + pad * 2)
  const height = contentH + titleHeight + pad * 2
  const contentLeft = (width - contentW) / 2
  const centerX = sideBySide ? contentLeft + radius : width / 2
  const centerY = sideBySide ? pad + titleHeight + contentH / 2 : pad + titleHeight + radius
  const nodes = []
  const legend = []
  const texts = []
  let angle = -Math.PI / 2
  rows.forEach((row, index) => {
    const style = { '--dsc-slice': `var(--dsc-mermaid-c${(index % 8) + 1})` }
    const sweep = (row.slice.value / total) * Math.PI * 2
    const start = angle
    angle += sweep
    if (sweep >= Math.PI * 2 - 1e-6) {
      nodes.push({ id: `slice-${index}`, shape: 'ellipse', className: 'dsc-mermaid-slice', cx: mermaidRound(centerX), cy: mermaidRound(centerY), rx: radius, ry: radius, style, fill: 'var(--dsc-slice, currentColor)' })
    } else {
      const x1 = centerX + radius * Math.cos(start)
      const y1 = centerY + radius * Math.sin(start)
      const x2 = centerX + radius * Math.cos(angle)
      const y2 = centerY + radius * Math.sin(angle)
      const largeArc = sweep > Math.PI ? 1 : 0
      nodes.push({
        id: `slice-${index}`, shape: 'slice', className: 'dsc-mermaid-slice',
        d: `M ${mermaidRound(centerX)} ${mermaidRound(centerY)} L ${mermaidRound(x1)} ${mermaidRound(y1)} A ${radius} ${radius} 0 ${largeArc} 1 ${mermaidRound(x2)} ${mermaidRound(y2)} Z`,
        style, fill: 'var(--dsc-slice, currentColor)',
      })
    }
    const legendX = sideBySide ? contentLeft + pieBox + 30 : width / 2 - legendWidth / 2
    const legendTop = sideBySide ? pad + titleHeight + Math.max(0, (contentH - rows.length * 26) / 2) : pad + titleHeight + pieBox + 30
    const legendY = legendTop + index * 26
    legend.push({
      id: `legend-${index}`, shape: 'rect', className: 'dsc-mermaid-slice dsc-mermaid-legend-swatch',
      x: mermaidRound(legendX), y: mermaidRound(legendY), w: 12, h: 12, rx: 2, style, fill: 'var(--dsc-slice, currentColor)',
    })
    texts.push({ text: mermaidClip(row.label, 80), x: mermaidRound(legendX + 20), y: mermaidRound(legendY + 6), textAnchor: 'start', className: 'dsc-mermaid-legend-label' })
  })
  if (model.title !== '') texts.push({ text: model.title, x: mermaidRound(width / 2), y: mermaidRound(pad + 10), textAnchor: 'middle', className: 'dsc-mermaid-title' })
  return {
    kind: 'pie', direction: '', width: mermaidRound(width), height: mermaidRound(height), nodes, edges: [],
    slices: rows.map(row => ({ label: row.slice.label, value: row.slice.value, percent: row.percent, percentText: `${Math.round(row.percent)}%` })),
    omitted: model.omitted, texts, clusters: [], frames: [], notes: [], lifelines: [], legend, rules: [],
  }
}

// ---------- layout entry point ----------
function mermaidLayout(source, options = {}) {
  const settings = options !== null && typeof options === 'object' ? options : {}
  const requestedWidth = mermaidClamp(mermaidNum(settings.width, MERMAID_DEFAULT_WIDTH), 240, 2400)
  const model = parseMermaid(source)
  if (model === null || model === undefined || model.kind === 'unknown') {
    return { kind: 'unknown', error: (model && model.error) || 'unsupported diagram' }
  }
  try {
    if (model.kind === 'flowchart') return mermaidLayoutFlowchart(model, requestedWidth)
    if (model.kind === 'sequence') return mermaidLayoutSequenceDiagram(model, requestedWidth)
    if (model.kind === 'pie') {
      const layout = mermaidLayoutPieChart(model, requestedWidth)
      return layout === null ? { kind: 'unknown', error: 'pie chart contains no positive values' } : layout
    }
    if (model.kind === 'class') return mermaidLayoutClassDiagram(model, requestedWidth)
    return { kind: 'unknown', error: `unsupported diagram type: ${mermaidClip(model.kind, 40)}` }
  } catch (error) {
    return { kind: 'unknown', error: mermaidErrorMessage(error) }
  }
}

// ---------- React rendering ----------
function mermaidRenderShape(shape, key) {
  const props = { key, className: shape.className || 'dsc-mermaid-node', 'vector-effect': 'non-scaling-stroke' }
  if (shape.style !== undefined) props.style = shape.style
  if (shape.fill !== undefined) props.fill = shape.fill
  if (shape.shape === 'slice') {
    props.d = shape.d
    return h('path', props)
  }
  if (shape.shape === 'ellipse' || shape.shape === 'circle') {
    props.cx = shape.cx === undefined ? mermaidRound(shape.x + shape.w / 2) : shape.cx
    props.cy = shape.cy === undefined ? mermaidRound(shape.y + shape.h / 2) : shape.cy
    props.rx = shape.rx === undefined ? mermaidRound(shape.w / 2) : shape.rx
    props.ry = shape.ry === undefined ? mermaidRound(shape.h / 2) : shape.ry
    return h('ellipse', props)
  }
  if (mermaidPolygonShape(shape.shape) && typeof shape.points === 'string') {
    props.points = shape.points
    return h('polygon', props)
  }
  props.x = shape.x
  props.y = shape.y
  props.width = shape.w
  props.height = shape.h
  props.rx = shape.rx === undefined ? 8 : shape.rx
  return h('rect', props)
}
function MermaidDiagram({ source, title } = {}) {
  const raw = typeof source === 'string' ? source : mermaidSafeText(source)
  const layout = React.useMemo(() => {
    try { return mermaidLayout(raw, { width: MERMAID_DEFAULT_WIDTH }) } catch (error) { return { kind: 'unknown', error: mermaidErrorMessage(error) } }
  }, [raw])
  const caption = typeof title === 'string' ? mermaidClip(title, MERMAID_MAX_LABEL) : ''
  const firstLine = mermaidClip(raw.replace(/\r\n?/g, '\n').split('\n').find(line => line.trim() !== '') || '', MERMAID_MAX_LABEL)
  const ariaLabel = mermaidClip(caption !== '' ? caption : (firstLine || tr('mermaidFailed')), MERMAID_MAX_LABEL)
  if (!layout || layout.kind === 'unknown' || mermaidNum(layout.width) <= 0 || mermaidNum(layout.height) <= 0) {
    const message = layout && typeof layout.error === 'string' ? layout.error : 'render failed'
    return h('figure', { className: 'dsc-mermaid dsc-mermaid-failed' },
      h('div', { className: 'dsc-mermaid-error' },
        h('div', { className: 'dsc-mermaid-error-line' }, h(Icon, { name: 'warning', size: 16 }), h('span', { className: 'dsc-mermaid-error-text' }, `${tr('mermaidFailed')}: ${message}`)),
        h('pre', { className: 'dsc-mermaid-source dsc-pre' }, raw)))
  }
  const children = []
  const addShapes = (list, prefix) => (list || []).forEach((shape, index) => children.push(mermaidRenderShape(shape, `${prefix}-${index}`)))
  addShapes(layout.clusters, 'c')
  addShapes(layout.frames, 'f')
  for (const lifeline of layout.lifelines || []) {
    children.push(h('path', { key: `l-${children.length}`, d: lifeline.d, className: lifeline.className || 'dsc-mermaid-edge dsc-mermaid-lifeline', fill: 'none', strokeDasharray: lifeline.dash || '4 4', 'vector-effect': 'non-scaling-stroke' }))
  }
  addShapes(layout.notes, 'o')
  for (const edge of layout.edges || []) {
    const dashed = edge.dashed === true
    const classes = `dsc-mermaid-edge${dashed ? ' dsc-mermaid-edge-dashed' : ''}${edge.thick === true ? ' dsc-mermaid-edge-thick' : ''}`
    children.push(h('path', { key: `e-${children.length}`, d: edge.d, className: classes, fill: 'none', strokeDasharray: dashed ? '6 4' : undefined, 'vector-effect': 'non-scaling-stroke' }))
    if (edge.marker) {
      children.push(h('path', { key: `m-${children.length}`, d: edge.marker.d, className: edge.marker.className, fill: edge.marker.fill === undefined ? 'none' : edge.marker.fill, 'vector-effect': 'non-scaling-stroke' }))
    }
  }
  addShapes(layout.nodes, 'n')
  addShapes(layout.legend, 'g')
  for (const entry of layout.texts || []) {
    children.push(h('text', { key: `t-${children.length}`, x: entry.x, y: entry.y, className: entry.className || 'dsc-mermaid-node-label', textAnchor: entry.textAnchor || 'middle', dominantBaseline: 'middle', 'vector-effect': 'non-scaling-stroke' }, entry.text))
  }
  return h('figure', { className: 'dsc-mermaid' },
    h('div', { className: 'dsc-mermaid-figure' },
      h('svg', {
        className: 'dsc-mermaid-svg', xmlns: 'http://www.w3.org/2000/svg', width: mermaidRound(layout.width), height: mermaidRound(layout.height),
        viewBox: `0 0 ${mermaidRound(layout.width)} ${mermaidRound(layout.height)}`, role: 'img', 'aria-label': ariaLabel,
        preserveAspectRatio: 'xMidYMid meet', focusable: 'false',
      }, children)),
    caption !== '' ? h('figcaption', { className: 'dsc-mermaid-caption' }, caption) : null)
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
const IconChevronLeft = props => h(IconBase, props, h('path', { d: 'M15 6l-6 6 6 6' }))
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
const IconMore = props => h(IconBase, { ...props, filled: true },
  h('circle', { cx: 5.5, cy: 12, r: 1.5 }),
  h('circle', { cx: 12, cy: 12, r: 1.5 }),
  h('circle', { cx: 18.5, cy: 12, r: 1.5 }),
)
const IconPin = props => h(IconBase, props,
  h('path', { d: 'M14.5 3.8l5.7 5.7-2.4 1.1-3.6 3.6-1 4.2-6.6-6.6 4.2-1 3.6-3.6 1.1-2.4Z' }),
  h('path', { d: 'M10 14l-5.2 5.2' }),
)
const IconFolder = props => h(IconBase, props,
  h('path', { d: 'M3.5 7.2A2.2 2.2 0 0 1 5.7 5h3.1l1.8 2.2h7.7a2.2 2.2 0 0 1 2.2 2.2v7.4a2.2 2.2 0 0 1-2.2 2.2H5.7a2.2 2.2 0 0 1-2.2-2.2V7.2Z' }),
)
const IconFolderPlus = props => h(IconBase, props,
  h('path', { d: 'M3.5 7.2A2.2 2.2 0 0 1 5.7 5h3.1l1.8 2.2h7.7a2.2 2.2 0 0 1 2.2 2.2v7.4a2.2 2.2 0 0 1-2.2 2.2H5.7a2.2 2.2 0 0 1-2.2-2.2V7.2Z' }),
  h('path', { d: 'M12 11.2v5M9.5 13.7h5' }),
)
const IconFolderMinus = props => h(IconBase, props,
  h('path', { d: 'M3.5 7.2A2.2 2.2 0 0 1 5.7 5h3.1l1.8 2.2h7.7a2.2 2.2 0 0 1 2.2 2.2v7.4a2.2 2.2 0 0 1-2.2 2.2H5.7a2.2 2.2 0 0 1-2.2-2.2V7.2Z' }),
  h('path', { d: 'M9.5 13.7h5' }),
)
const IconArchive = props => h(IconBase, props,
  h('rect', { x: 3.5, y: 4.5, width: 17, height: 4.5, rx: 1.4 }),
  h('path', { d: 'M5 9v8.2a2.3 2.3 0 0 0 2.3 2.3h9.4a2.3 2.3 0 0 0 2.3-2.3V9' }),
  h('path', { d: 'M10 13h4' }),
)
const IconArrowDownToLine = props => h(IconBase, props,
  h('path', { d: 'M12 4v11M7 10.5l5 5 5-5' }),
  h('path', { d: 'M5 20h14' }),
)

const ICONS = {
  plus: IconPlus,
  search: IconSearch,
  close: IconClose,
  chevronDown: IconChevronDown,
  chevronRight: IconChevronRight,
  chevronLeft: IconChevronLeft,
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
  more: IconMore,
  pin: IconPin,
  folder: IconFolder,
  folderPlus: IconFolderPlus,
  folderMinus: IconFolderMinus,
  archive: IconArchive,
  continue: IconArrowDownToLine,
}

function Icon({ name, size = 18, className = '' }) {
  const Component = ICONS[name] ?? IconSpark
  return h(Component, { size, className })
}

/* ---- 43-popover.js ---- */
/**
 * Popover plumbing shared by the composer tool menu and the model menu.
 *
 * A composer popover lives next to the input, at the bottom of the window, so
 * the default side is "above the trigger"; when the window is too short the
 * hook flips it below, and either way the panel's height is clamped so it never
 * runs past the viewport edge. Keyboard behaviour is the WAI-ARIA menu pattern:
 * Arrow keys move through the items, Home/End jump, Escape and Tab close.
 */

const POPOVER_GAP = 8
/** Space a flipped panel must leave for the trigger line. */
const POPOVER_PREFERRED = 180

function popoverItemSelector() {
  return '[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"],.dsc-popover-item'
}

/**
 * Close a popover on any pointer press outside its panel and trigger.
 * Runs in the capture phase so a press on another control still closes this
 * one before that control handles the click.
 */
function useOutsideDismiss(open, onClose, panelRef, triggerRef) {
  const closeRef = React.useRef(onClose)
  closeRef.current = onClose
  React.useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      const target = event?.target
      if (!(target instanceof Node)) return
      if (panelRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      closeRef.current()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [open, panelRef, triggerRef])
}

/**
 * Keep a popover on the side with room for it and clamp its height to the
 * viewport. Re-measures on resize and on any layout scroll (the thread above
 * the composer scrolls independently of the window).
 *
 * Composer popovers are aligned to the whole rounded input, not to the small
 * control that opened them: "above" means above the composer's top edge, so a
 * menu never covers the text the user is writing. The extra distance is
 * published as a CSS custom property on the panel.
 *
 * @returns `{ placement, maxHeight, gap }` - "top" opens above the trigger.
 */
function usePopupPlacement(open, triggerRef, panelRef) {
  const [layout, setLayout] = React.useState({ placement: 'top', maxHeight: null, gap: 0 })
  React.useLayoutEffect(() => {
    if (!open) return () => {}
    const update = () => {
      const trigger = triggerRef.current
      const panel = panelRef.current
      if (!trigger || !panel) return
      const rect = trigger.getBoundingClientRect()
      const composer = trigger.closest?.('.dsc-composer')
      const composerTop = composer?.getBoundingClientRect?.().top ?? rect.top
      const gap = Math.max(0, Math.round(rect.top - composerTop))
      const viewport = window.innerHeight || 0
      const natural = panel.offsetHeight || panel.scrollHeight || 0
      const spaceAbove = composerTop - POPOVER_GAP - 8
      const spaceBelow = viewport - rect.bottom - POPOVER_GAP - 8
      const placement = spaceAbove >= Math.min(natural, POPOVER_PREFERRED) || spaceAbove >= spaceBelow
        ? 'top'
        : 'bottom'
      const available = placement === 'top' ? spaceAbove : spaceBelow
      const maxHeight = available > 120 ? Math.min(available, 520) : null
      const nextGap = placement === 'top' ? gap : 0
      setLayout((current) => (
        current.placement === placement && current.maxHeight === maxHeight && current.gap === nextGap
          ? current
          : { placement, maxHeight, gap: nextGap }
      ))
    }
    update()
    window.addEventListener('resize', update)
    // Capture scroll events from the scrolling thread as well as the window.
    window.addEventListener('scroll', update, true)
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null
    if (observer && panelRef.current) observer.observe(panelRef.current)
    const composer = triggerRef.current?.closest?.('.dsc-composer')
    if (observer && composer) observer.observe(composer)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      observer?.disconnect()
    }
  }, [open, panelRef, triggerRef])
  return layout
}

/** Inline style for an open popover: viewport clamp plus composer clearance. */
function popoverStyle(layout) {
  const style = {}
  if (layout.maxHeight !== null) style.maxHeight = `${layout.maxHeight}px`
  if (layout.gap > 0) style['--dsc-popover-gap'] = `${layout.gap}px`
  return style
}

function popoverItems(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return []
  return [...container.querySelectorAll(popoverItemSelector())].filter(item => (
    item.disabled !== true && item.getAttribute?.('aria-disabled') !== 'true'
  ))
}

/** Move keyboard focus to the open panel's first (or last) enabled item. */
function focusMenuItem(container, edge = 'first') {
  const items = popoverItems(container)
  if (items.length === 0) return
  const target = edge === 'last' ? items[items.length - 1] : items[0]
  target.focus?.({ preventScroll: false })
}

/**
 * Key handler for one popover panel.
 * ArrowUp/Down wrap through items, Home/End jump, Escape closes, Tab closes and
 * lets the browser move focus naturally.
 */
function handleMenuKeyDown(event, { container, onClose, trigger }) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    event.preventDefault()
    onClose()
    trigger?.current?.focus?.()
    return
  }
  if (event.key === 'Tab') {
    // Close, but do not prevent default: Tab must keep moving focus.
    onClose()
    return
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') return
  const items = popoverItems(container)
  if (items.length === 0) return
  event.preventDefault()
  const active = document.activeElement
  const index = items.indexOf(active)
  let next
  if (event.key === 'Home') next = items[0]
  else if (event.key === 'End') next = items[items.length - 1]
  else if (event.key === 'ArrowDown') next = items[(index + 1) % items.length]
  else next = items[(index - 1 + items.length) % items.length]
  next.focus?.({ preventScroll: false })
}

/* ---- 45-brand.js ---- */
/**
 * Official DeepSeek brand artwork for the Chat sidebar.
 *
 * The whale and wordmark geometry is the official DeepSeek lockup shipped with
 * DeepSeek Harness, rendered here as local inline SVG because a Client plugin
 * must not load Harness Client packages. Only the theme-provided ink is
 * parameterized; the lockup keeps its official proportions. The "HARNESS"
 * badge of the Harness lockup is intentionally omitted: Chat is the DeepSeek
 * Chat surface, not the Harness Agent surface.
 */
const DEEPSEEK_LOCKUP = {
  viewBox: '0 0 122 24',
  width: 122,
  height: 24,
  paths: [
    'M23.0584 4.95203C22.8129 4.83203 22.7074 5.06103 22.5639 5.17704C22.5149 5.21454 22.4734 5.26354 22.4319 5.30854C22.0734 5.69155 21.6543 5.94306 21.1073 5.91306C20.3073 5.86806 19.6243 6.11957 19.0203 6.73158C18.8918 5.97706 18.4652 5.52655 17.8162 5.23754C17.4767 5.08753 17.1332 4.93703 16.8952 4.61052C16.7292 4.37801 16.6837 4.11901 16.6007 3.8635C16.5477 3.70949 16.4952 3.55199 16.3177 3.52549C16.1252 3.49549 16.0497 3.65699 15.9742 3.792C15.6722 4.34401 15.5552 4.95203 15.5667 5.56805C15.5932 6.95359 16.1782 8.05712 17.3407 8.84215C17.4727 8.93215 17.5067 9.02215 17.4652 9.15366C17.3857 9.42416 17.2917 9.68667 17.2087 9.95718C17.1557 10.1297 17.0767 10.1677 16.8917 10.0922C16.2537 9.82568 15.7027 9.43117 15.2156 8.95465C14.3891 8.15513 13.6416 7.2726 12.7096 6.58158C12.4906 6.42007 12.2716 6.27007 12.045 6.12707C11.094 5.20354 12.1696 4.44502 12.4186 4.35501C12.6791 4.26101 12.5091 3.938 11.6675 3.942C10.826 3.9455 10.056 4.22751 9.07446 4.60302C8.93096 4.65952 8.77995 4.70052 8.62545 4.73452C7.73492 4.56552 6.80989 4.52802 5.84386 4.63702C4.02481 4.83953 2.57177 5.69955 1.50373 7.1676C0.220694 8.93215 -0.0813148 10.9372 0.288196 13.0283C0.676708 15.2323 1.80174 17.0569 3.53029 18.4834C5.32285 19.9625 7.38741 20.6875 9.74298 20.5485C11.1735 20.466 12.7661 20.2745 14.5626 18.7539C15.0156 18.9795 15.4912 19.0695 16.2797 19.137C16.8872 19.1935 17.4722 19.107 17.9252 19.013C18.6347 18.8629 18.5857 18.2059 18.3292 18.0854C16.2497 17.1169 16.7062 17.5109 16.2912 17.1919C17.3477 15.9419 18.9618 13.7198 19.4598 10.6942C19.5088 10.3602 19.5713 9.88968 19.5638 9.61917C19.5598 9.45417 19.5978 9.39016 19.7863 9.37116C20.3073 9.31116 20.8128 9.16866 21.2773 8.91315C22.6249 8.17713 23.1684 6.96809 23.2964 5.51905C23.3154 5.29754 23.2924 5.06853 23.0584 4.95203ZM11.3165 17.9954C9.30097 16.4109 8.32344 15.8894 7.91992 15.9119C7.54241 15.9344 7.61042 16.3664 7.69342 16.6479C7.78042 16.9259 7.89342 17.1174 8.05193 17.3614C8.16143 17.5229 8.23694 17.7629 7.94243 17.9434C7.29341 18.3449 6.16487 17.8084 6.11187 17.7819C4.79833 17.0084 3.7003 15.9874 2.92628 14.5908C2.17875 13.2468 1.74474 11.8047 1.67324 10.2657C1.65424 9.89418 1.76374 9.76267 2.13375 9.69517C2.62077 9.60517 3.12278 9.58617 3.6093 9.65767C5.66636 9.95818 7.41741 10.8777 8.88545 12.3348C9.72348 13.1643 10.3575 14.1558 11.0105 15.1243C11.705 16.1529 12.4521 17.1329 13.4036 17.9364C13.7396 18.2179 14.0076 18.4319 14.2641 18.5899C13.4906 18.6764 12.1996 18.6949 11.3165 17.9964V17.9954ZM12.2826 11.7817C12.2826 11.6167 12.4146 11.4852 12.5806 11.4852C12.6181 11.4852 12.6521 11.4927 12.6826 11.5037C12.7241 11.5187 12.7621 11.5412 12.7921 11.5752C12.8451 11.6277 12.8751 11.7027 12.8751 11.7817C12.8751 11.9467 12.7431 12.0782 12.5771 12.0782C12.4111 12.0782 12.2826 11.9467 12.2826 11.7817ZM15.2831 13.3208C15.0906 13.3998 14.8981 13.4673 14.7131 13.4748C14.4261 13.4898 14.1131 13.3733 13.9431 13.2308C13.6791 13.0093 13.4901 12.8853 13.4111 12.4988C13.3771 12.3338 13.3961 12.0782 13.4261 11.9317C13.4941 11.6162 13.4186 11.4137 13.1961 11.2297C13.0151 11.0797 12.7846 11.0382 12.5316 11.0382C12.4371 11.0382 12.3506 10.9967 12.2861 10.9632C12.1806 10.9107 12.0936 10.7792 12.1766 10.6177C12.2031 10.5652 12.3316 10.4377 12.3616 10.4152C12.7051 10.2197 13.1011 10.2837 13.4676 10.4302C13.8071 10.5692 14.0641 10.8242 14.4336 11.1847C14.8111 11.6202 14.8791 11.7402 15.0941 12.0672C15.2641 12.3228 15.4186 12.5853 15.5247 12.8858C15.5887 13.0733 15.5057 13.2268 15.2831 13.3208Z', // whale
    'M68.416 18.2447H67.0501V16.1272H68.416C69.2619 16.1272 70.1166 15.9163 70.6671 15.3304C71.2181 14.7444 71.426 13.8455 71.426 12.9471C71.426 12.0487 71.2268 11.1498 70.6671 10.5643C70.1083 9.97831 69.2619 9.76744 68.416 9.76744C67.5701 9.76744 66.7154 9.97831 66.1639 10.5643C65.6129 11.1503 65.4049 12.0487 65.4049 12.9471V21.6435H63.009V7.6582H65.4049V8.54883H65.8442C65.8918 8.49393 65.9394 8.44728 65.9875 8.40064C66.5871 7.85353 67.5049 7.6582 68.4072 7.6582C69.8212 7.6582 71.2341 8.00998 72.1607 8.98662C73.0868 9.96325 73.4143 11.4632 73.4143 12.9558C73.4143 14.4485 73.0785 15.9406 72.1607 16.925C71.2424 17.9094 69.8212 18.2457 68.416 18.2457V18.2447Z',
    'M31.9551 8.03497H33.3204V10.1525H31.9551C31.1087 10.1525 30.2545 10.3633 29.7035 10.9493C29.1525 11.5353 28.945 12.4342 28.945 13.3326C28.945 14.231 29.1447 15.1294 29.7035 15.7154C30.2623 16.3014 31.1087 16.5122 31.9551 16.5122C32.8015 16.5122 33.6562 16.3014 34.2072 15.7154C34.7582 15.1294 34.9657 14.231 34.9657 13.3326V4.62842H37.3611V18.6219H34.9657V17.7313H34.5264C34.4783 17.7857 34.4307 17.8329 34.3826 17.8795C33.7835 18.4261 32.8652 18.6219 31.9629 18.6219C30.5494 18.6219 29.136 18.2707 28.2099 17.294C27.2838 16.3174 26.9563 14.817 26.9563 13.3248C26.9563 11.8327 27.2916 10.34 28.2099 9.35561C29.136 8.37898 30.5494 8.03497 31.9551 8.03497Z',
    'M49.3786 13.1431V13.9948H42.9984V12.2996H47.2305C47.1348 11.6825 46.9113 11.1043 46.5119 10.682C45.9371 10.0727 45.0503 9.85409 44.1723 9.85409C43.2943 9.85409 42.4076 10.0727 41.8328 10.682C41.258 11.2913 41.05 12.2213 41.05 13.1435C41.05 14.0658 41.2575 15.003 41.8328 15.6046C42.4076 16.2061 43.2939 16.433 44.1723 16.433C45.0508 16.433 45.9371 16.2143 46.5119 15.6046C46.5916 15.5186 46.6635 15.4248 46.7354 15.331H49.0992C48.8918 16.0657 48.5643 16.7299 48.0691 17.2454C47.111 18.2531 45.6339 18.6205 44.1723 18.6205C42.7108 18.6205 41.2337 18.2609 40.2755 17.2454C39.3174 16.2299 38.9661 14.6828 38.9661 13.1435C38.9661 11.6043 39.3096 10.0494 40.2755 9.04168C41.242 8.03396 42.7108 7.66663 44.1723 7.66663C45.6339 7.66663 47.111 8.02618 48.0691 9.04168C49.0351 10.0572 49.3786 11.6043 49.3786 13.1435V13.1431Z',
    'M61.4045 13.1431V13.9948H55.0243V12.2996H59.2564C59.1602 11.6825 58.9372 11.1043 58.5378 10.682C57.963 10.0727 57.0762 9.85409 56.1982 9.85409C55.3202 9.85409 54.4335 10.0727 53.8587 10.682C53.2839 11.2913 53.0759 12.2213 53.0759 13.1435C53.0759 14.0658 53.2834 15.003 53.8587 15.6046C54.4335 16.2061 55.3202 16.433 56.1982 16.433C57.0762 16.433 57.963 16.2143 58.5378 15.6046C58.6179 15.5186 58.6894 15.4248 58.7608 15.331H61.1251C60.9171 16.0657 60.5897 16.7299 60.0945 17.2454C59.1364 18.2531 57.6593 18.6205 56.1982 18.6205C54.7372 18.6205 53.2596 18.2609 52.3014 17.2454C51.3432 16.2299 50.9919 14.6828 50.9919 13.1435C50.9919 11.6043 51.3355 10.0494 52.3014 9.04168C53.2678 8.03396 54.7367 7.66663 56.1982 7.66663C57.6598 7.66663 59.1364 8.02618 60.0945 9.04168C61.061 10.0572 61.4045 11.6043 61.4045 13.1435V13.1431Z',
    'M80.242 18.6214C81.7035 18.6214 83.1801 18.4105 84.1383 17.809C85.0965 17.2075 85.4482 16.2931 85.4482 15.3869C85.4482 14.4807 85.1042 13.5585 84.1383 12.9647C83.1801 12.371 81.703 12.1518 80.242 12.1518C79.6186 12.1518 79.0438 12.0658 78.6366 11.8394C78.2294 11.6047 78.0778 11.2534 78.0778 10.9017C78.0778 10.5499 78.2216 10.1908 78.6366 9.9639C79.0438 9.72921 79.6749 9.65147 80.2973 9.65147C80.9198 9.65147 81.5509 9.73747 81.9591 9.9639C82.3663 10.1986 82.5179 10.5499 82.5179 10.9017H84.9531C84.9531 9.99499 84.6421 9.07327 83.7719 8.47951C82.9017 7.88576 81.5679 7.66663 80.2424 7.66663C78.9169 7.66663 77.5837 7.8775 76.713 8.47951C75.8427 9.08104 75.5308 9.99499 75.5308 10.9017C75.5308 11.8083 75.8423 12.73 76.713 13.3238C77.5832 13.9176 78.9165 14.1367 80.2424 14.1367C80.929 14.1367 81.688 14.2227 82.1428 14.4491C82.5985 14.676 82.7579 15.0351 82.7579 15.3869C82.7579 15.7387 82.5985 16.0977 82.1428 16.3246C81.688 16.5511 80.9931 16.6371 80.3066 16.6371C79.62 16.6371 78.9169 16.5511 78.4694 16.3246C78.0224 16.0982 77.8543 15.7387 77.8543 15.3869H75.0435C75.0435 16.2935 75.3865 17.2153 76.3534 17.809C77.3194 18.4028 78.7809 18.6214 80.2424 18.6214H80.242Z',
    'M97.4733 13.1431V13.9948H91.0932V12.2996H95.3252C95.23 11.6825 95.006 11.1043 94.6071 10.682C94.0313 10.0727 93.1456 9.85409 92.2666 9.85409C91.3876 9.85409 90.5018 10.0727 89.927 10.682C89.3522 11.2913 89.1452 12.2213 89.1452 13.1435C89.1452 14.0658 89.3522 15.003 89.927 15.6046C90.5018 16.2061 91.3886 16.433 92.2666 16.433C93.1446 16.433 94.0313 16.2143 94.6071 15.6046C94.6863 15.5186 94.7587 15.4248 94.8301 15.331H97.1935C96.9855 16.0657 96.6585 16.7299 96.1639 17.2454C95.2057 18.2531 93.7281 18.6205 92.2666 18.6205C90.805 18.6205 89.3284 18.2609 88.3703 17.2454C87.4121 16.2299 87.0613 14.6828 87.0613 13.1435C87.0613 11.6043 87.4043 10.0494 88.3703 9.04168C89.3367 8.03396 90.806 7.66663 92.2666 7.66663C93.7272 7.66663 95.2057 8.02618 96.1639 9.04168C97.1298 10.0572 97.4729 11.6043 97.4729 13.1435L97.4733 13.1431Z',
    'M109.499 13.1431V13.9948H103.119V12.2996H107.351C107.256 11.6825 107.032 11.1043 106.632 10.682C106.057 10.0727 105.172 9.85409 104.293 9.85409C103.414 9.85409 102.528 10.0727 101.953 10.682C101.378 11.2913 101.17 12.2213 101.17 13.1435C101.17 14.0658 101.378 15.003 101.953 15.6046C102.528 16.2061 103.415 16.433 104.293 16.433C105.171 16.433 106.057 16.2143 106.632 15.6046C106.712 15.5186 106.784 15.4248 106.856 15.331H109.22C109.012 16.0657 108.685 16.7299 108.19 17.2454C107.231 18.2531 105.754 18.6205 104.293 18.6205C102.831 18.6205 101.355 18.2609 100.396 17.2454C99.4382 16.2299 99.0864 14.6828 99.0864 13.1435C99.0864 11.6043 99.4295 10.0494 100.396 9.04168C101.362 8.03396 102.832 7.66663 104.293 7.66663C105.754 7.66663 107.231 8.02618 108.19 9.04168C109.156 10.0572 109.499 11.6043 109.499 13.1435V13.1431Z',
    'M113.5 4.62817H111.104V18.6217H113.5V4.62817Z',
    'M117.589 12.8154L121.517 18.6208H118.554L114.625 12.8154L118.554 8.15088H121.517L117.589 12.8154Z',
  ],
}

/**
 * Render the official whale + "deepseek" lockup.
 * @param height - rendered height in px; the width follows the official ratio.
 */
function DeepSeekLockup({ height = 24, className = '' }) {
  return h('svg', {
    className: `dsc-brand-logo ${className}`.trim(),
    width: Math.round(height * DEEPSEEK_LOCKUP.width / DEEPSEEK_LOCKUP.height * 100) / 100,
    height,
    viewBox: DEEPSEEK_LOCKUP.viewBox,
    fill: 'none',
    role: 'img',
    'aria-label': 'DeepSeek',
    focusable: 'false',
  }, DEEPSEEK_LOCKUP.paths.map((d, index) => h('path', { key: index, d, fill: 'currentColor' })))
}

/* ---- 47-model.js ---- */
/**
 * Model selection for Chat mode.
 *
 * The catalog comes from the Host (`bootstrap.models`), which is the only place
 * that knows which ids the DeepSeek Messages API actually accepts and what each
 * model can do. The browser never guesses a model list: when an older Host does
 * not publish one, only the flash model is offered, because that is the model
 * that Host sends.
 *
 * `chatStore.state.modelChoice` holds the selection for the active
 * conversation; per-conversation overrides and the defaults live on the Host.
 *
 * The composer splits the two decisions into two small popovers: the model
 * picker is a name-only list, and the thinking-effort picker is its own compact
 * control next to it. Neither panel repeats the other's options, so choosing a
 * model never asks the user to read a feature sheet.
 */

/** The single model an older Host always sends. */
const FALLBACK_MODELS = [
  {
    id: 'deepseek-flash',
    name: 'DeepSeek V4.1 Flash',
    shortName: 'V4.1 Flash',
    descriptionKey: 'modelFlashDesc',
    capabilities: { vision: true, documents: true, search: true, thinking: true, efforts: ['low', 'high', 'max'] },
  },
]

const EFFORT_ORDER = ['low', 'high', 'max']
const EFFORT_LABEL = { low: 'effortLow', high: 'effortHigh', max: 'effortMax' }
const EFFORT_HINT = { low: 'effortLowHint', high: 'effortHighHint', max: 'effortMaxHint' }

function modelCatalog() {
  const models = chatStore.state.models
  return Array.isArray(models) && models.length > 0 ? models : FALLBACK_MODELS
}

function modelById(id) {
  const models = modelCatalog()
  return models.find(model => model.id === id) ?? models[0]
}

function modelCapability(model, key) {
  return model?.capabilities?.[key] === true
}

function modelEfforts(model) {
  const efforts = model?.capabilities?.efforts
  const list = Array.isArray(efforts) ? efforts.filter(item => EFFORT_ORDER.includes(item)) : []
  return list.length > 0 ? list : (modelCapability(model, 'thinking') ? EFFORT_ORDER : [])
}

/** The compact name shown on the composer chip and in the model list. */
function modelTriggerLabel(model) {
  return model?.shortName || model?.name || ''
}

/** Full label for a reply footer, including the effort that produced it. */
function modelChipLabel(model, thinking, effort) {
  const name = model?.shortName || model?.name || ''
  if (!thinking) return name
  const labelKey = EFFORT_LABEL[effort]
  return labelKey === undefined ? name : `${name} · ${tr(labelKey)}`
}

/**
 * The model recorded on one reply, for the message footer. Old replies may name
 * a model that is no longer in the catalog, in which case the raw id is the
 * honest label.
 */
function messageModelLabel(message) {
  if (typeof message?.model !== 'string' || message.model === '') return ''
  const model = modelById(message.model)
  const name = model?.shortName || model?.name || message.model
  if (message.thinking !== true) return name
  const labelKey = EFFORT_LABEL[message.effort]
  return labelKey === undefined ? name : `${name} · ${tr(labelKey)}`
}

/**
 * The effective model/effort of the composer. Falls back to the first catalog
 * entry when the stored choice names a model this Host no longer offers.
 */
function currentModelChoice() {
  const choice = chatStore.state.modelChoice ?? {}
  const model = modelById(choice.model)
  const efforts = modelEfforts(model)
  const effort = efforts.includes(choice.effort) ? choice.effort : (efforts.includes('high') ? 'high' : efforts[efforts.length - 1])
  return { model, efforts, effort }
}

/**
 * A model's capability gaps, for the one short note the menu may show. The full
 * description stays in the row's native tooltip; the menu itself only carries
 * the limitation that changes what the user can attach.
 */
function modelNotes(model) {
  const notes = []
  if (model !== undefined && modelCapability(model, 'vision') === false) notes.push(tr('modelNoVision'))
  return notes
}

/**
 * Model menu: the real API models, by name, plus a check on the current one.
 * It opens above the composer, right-aligned to its chip, and is fully operable
 * from the keyboard.
 */
function ModelMenu() {
  const t = useT()
  const models = modelCatalog()
  const choice = currentModelChoice()
  const activeId = useChat(state => state.activeId)
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef(null)
  const panelRef = React.useRef(null)
  const layout = usePopupPlacement(open, triggerRef, panelRef)
  useOutsideDismiss(open, () => setOpen(false), panelRef, triggerRef)
  React.useEffect(() => {
    if (!open) return
    // Focus the selected model row so Arrow keys start from the current choice.
    const panel = panelRef.current
    const selected = panel?.querySelector?.(`[data-model="${choice.model.id}"]`)
    selected?.focus?.({ preventScroll: false })
  }, [open])
  const close = () => setOpen(false)
  const onKeyDown = event => handleMenuKeyDown(event, { container: panelRef.current, onClose: close, trigger: triggerRef })
  const scope = activeId === null ? t('modelAppliedToDefault') : t('modelAppliedToChat')
  return h('div', { className: 'dsc-model-control' },
    h('button', {
      ref: triggerRef,
      type: 'button',
      className: cx('dsc-model-trigger', open && 'is-open'),
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      title: t('modelSelect'),
      onClick: () => setOpen(value => !value),
      onKeyDown: (event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          setOpen(false)
          return
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          setOpen(true)
        }
      },
    },
      h('span', { className: 'dsc-model-name' }, modelTriggerLabel(choice.model)),
      h(Icon, { name: 'chevronDown', size: 12 }),
    ),
    open
      ? h('div', {
          ref: panelRef,
          className: 'dsc-popover dsc-model-menu',
          role: 'menu',
          'aria-label': t('modelSelect'),
          'data-placement': layout.placement,
          style: popoverStyle(layout),
          onKeyDown,
        },
        h('div', { className: 'dsc-model-list' },
          models.map(model => {
            const selected = model.id === choice.model.id
            const notes = modelNotes(model)
            const description = model.descriptionKey === undefined ? '' : t(model.descriptionKey)
            return h('button', {
              key: model.id,
              type: 'button',
              role: 'menuitemradio',
              'aria-checked': selected,
              'aria-label': description === '' ? model.name : `${model.name} — ${description}`,
              title: description,
              'data-model': model.id,
              className: cx('dsc-popover-item dsc-model-option', selected && 'is-selected'),
              onClick: () => { chatActions.selectModel(model.id); close() },
            },
              h('span', { className: 'dsc-popover-item-main' },
                h('span', { className: 'dsc-popover-item-title' }, model.name),
                notes.length > 0
                  ? h('span', { className: 'dsc-model-note' }, notes.join(' · '))
                  : null,
              ),
              selected ? h(Icon, { name: 'check', size: 15 }) : null,
            )
          }),
        ),
        h('p', { className: 'dsc-model-scope' }, scope),
      )
      : null,
  )
}

/**
 * Thinking-effort picker: a separate compact control beside the model chip. It
 * stays visible (showing Off) for every model with a real effort list, so
 * toggling deep thinking never shifts the composer layout. The four states are
 * the API's real tiers plus Off; there is no free-form value.
 */
function EffortMenu() {
  const t = useT()
  const choice = currentModelChoice()
  const thinking = useChat(state => state.settings.thinking)
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef(null)
  const panelRef = React.useRef(null)
  const layout = usePopupPlacement(open, triggerRef, panelRef)
  useOutsideDismiss(open, () => setOpen(false), panelRef, triggerRef)
  React.useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const selected = panel?.querySelector?.(`[data-effort="${thinking ? choice.effort : 'off'}"]`)
    selected?.focus?.({ preventScroll: false })
  }, [open])
  const close = () => setOpen(false)
  const onKeyDown = event => handleMenuKeyDown(event, { container: panelRef.current, onClose: close, trigger: triggerRef })
  const label = thinking ? t(EFFORT_LABEL[choice.effort] ?? 'effortHigh') : t('effortOff')
  const chooseOff = () => {
    if (thinking) chatActions.toggleThinking()
    close()
  }
  const chooseEffort = (effort) => {
    if (!thinking) chatActions.toggleThinking()
    if (effort !== choice.effort) chatActions.selectEffort(effort)
    close()
  }
  return h('div', { className: 'dsc-effort-control' },
    h('button', {
      ref: triggerRef,
      type: 'button',
      className: cx('dsc-effort-trigger', open && 'is-open'),
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      title: `${t('thinkingEffort')}: ${label}`,
      'aria-label': `${t('thinkingEffort')}: ${label}`,
      onClick: () => setOpen(value => !value),
      onKeyDown: (event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          setOpen(false)
          return
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          setOpen(true)
        }
      },
    },
      h(Icon, { name: 'brain', size: 13 }),
      h('span', null, label),
      h(Icon, { name: 'chevronDown', size: 11 }),
    ),
    open
      ? h('div', {
          ref: panelRef,
          className: 'dsc-popover dsc-effort-menu',
          role: 'menu',
          'aria-label': t('thinkingEffort'),
          'data-placement': layout.placement,
          style: popoverStyle(layout),
          onKeyDown,
        },
        h('div', { className: 'dsc-effort-list' },
          h('button', {
            type: 'button',
            role: 'menuitemradio',
            'aria-checked': !thinking,
            'data-effort': 'off',
            title: t('effortOffHint'),
            className: cx('dsc-effort-option', !thinking && 'is-selected'),
            onClick: chooseOff,
          },
            h('span', { className: 'dsc-effort-option-label' }, t('effortOff')),
            !thinking ? h(Icon, { name: 'check', size: 14 }) : null,
          ),
          h('div', { className: 'dsc-popover-sep' }),
          choice.efforts.map(effort => h('button', {
            key: effort,
            type: 'button',
            role: 'menuitemradio',
            'aria-checked': thinking && choice.effort === effort,
            'data-effort': effort,
            title: t(EFFORT_HINT[effort] ?? 'thinkingEffort'),
            className: cx('dsc-effort-option', thinking && choice.effort === effort && 'is-selected'),
            onClick: () => chooseEffort(effort),
          },
            h('span', { className: 'dsc-effort-option-label' }, t(EFFORT_LABEL[effort])),
            thinking && choice.effort === effort ? h(Icon, { name: 'check', size: 14 }) : null,
          )),
        ),
      )
      : null,
  )
}

/* ---- 48-tools.js ---- */
/**
 * Chat capabilities that are not plain model settings.
 *
 * Every capability is defined once, here, as a small descriptor. The "+" menu
 * and the composer's quick toggles both read the same list, so adding a tool
 * (image generation, deep research, document generation, code execution, ...)
 * never means touching the composer or the menu markup again:
 *
 *   registerChatTool({
 *     id: 'image-generation',
 *     kind: 'action',                 // or "toggle" for an on/off capability
 *     surface: 'menu',                // "menu" (the + card) or "composer"
 *     icon: 'image',
 *     labelKey: 'toolImageGen',
 *     hintKey: 'toolImageGenHint',
 *     run: () => chatActions.openImageGeneration(),
 *   })
 *
 * Tools that are not implemented yet must NOT be registered: both entry points
 * only ever show entries that do something.
 *
 * Web search and deep thinking are deliberately composer tools: they are used
 * while writing a message, so they stay one click away instead of hiding in a
 * menu. The + menu is reserved for add-file / action tools.
 */

const EXTRA_CHAT_TOOLS = []

/** The tools that already work, in display order. */
const BUILTIN_CHAT_TOOLS = [
  {
    id: 'upload',
    kind: 'action',
    surface: 'menu',
    icon: 'paperclip',
    labelKey: 'uploadFiles',
    hintKey: 'uploadFilesHint',
    order: 10,
    run: () => chatActions.requestFilePicker(),
  },
  {
    id: 'web-search',
    kind: 'toggle',
    surface: 'composer',
    icon: 'globe',
    labelKey: 'webSearch',
    hintKey: 'webSearchHint',
    order: 20,
    available: () => {
      const { model } = currentModelChoice()
      return modelCapability(model, 'search') ? { enabled: true } : { enabled: false, reasonKey: 'toolSearchUnavailable' }
    },
    active: state => state.settings.search === true,
    run: () => chatActions.toggleSearch(),
  },
  {
    id: 'deep-thinking',
    kind: 'toggle',
    surface: 'composer',
    icon: 'brain',
    labelKey: 'deepThink',
    hintKey: 'deepThinkHint',
    order: 30,
    available: () => {
      const { model } = currentModelChoice()
      return modelCapability(model, 'thinking') ? { enabled: true } : { enabled: false, reasonKey: 'toolThinkingUnavailable' }
    },
    active: state => state.settings.thinking === true,
    run: () => chatActions.toggleThinking(),
  },
]

/** Add one tool to the composer surfaces; returns its unregister function. */
function registerChatTool(definition) {
  if (definition === null || typeof definition !== 'object' || typeof definition.id !== 'string' || definition.id === '') {
    throw new Error('deepseek-chat: a tool needs a stable id')
  }
  if (typeof definition.run !== 'function') throw new Error('deepseek-chat: a tool needs run()')
  const entry = { order: 100, kind: 'action', surface: 'menu', ...definition }
  EXTRA_CHAT_TOOLS.push(entry)
  return () => {
    const index = EXTRA_CHAT_TOOLS.indexOf(entry)
    if (index >= 0) EXTRA_CHAT_TOOLS.splice(index, 1)
  }
}

/** All registered tools in stable display order. */
function chatToolDefinitions() {
  return [...BUILTIN_CHAT_TOOLS, ...EXTRA_CHAT_TOOLS].sort((left, right) => (left.order ?? 100) - (right.order ?? 100))
}

/** Tools shown inside the "+" card. */
function chatMenuTools() {
  return chatToolDefinitions().filter(tool => tool.surface !== 'composer')
}

/** Tools shown as direct buttons on the composer bar. */
function composerToolDefinitions() {
  return chatToolDefinitions().filter(tool => tool.surface === 'composer')
}

/**
 * Toggle tools that are currently on. Kept for plugin integrations that want to
 * mirror the composer state; the composer itself renders the toggle buttons.
 */
function activeChatTools(state) {
  return composerToolDefinitions().filter(tool => tool.kind === 'toggle' && tool.active?.(state) === true)
}

function toolAvailability(tool, state) {
  try {
    const result = tool.available?.(state)
    return result ?? { enabled: true }
  } catch {
    return { enabled: false, reasonKey: 'toolUnavailable' }
  }
}

function ToolMenuItem({ tool, state, index, onClose }) {
  const t = useT()
  const availability = toolAvailability(tool, state)
  const enabled = availability.enabled !== false
  const toggle = tool.kind === 'toggle'
  const active = toggle && tool.active?.(state) === true
  const uploading = tool.id === 'upload' && state.attachments.some(item => item.status === 'uploading')
  const description = enabled
    ? t(tool.hintKey ?? tool.labelKey)
    : t(availability.reasonKey ?? 'toolUnavailable')
  return h('button', {
    type: 'button',
    role: toggle ? 'menuitemcheckbox' : 'menuitem',
    className: cx('dsc-popover-item dsc-tool-item', active && 'is-active', !enabled && 'is-disabled'),
    'aria-checked': toggle ? active : undefined,
    'aria-disabled': enabled ? undefined : 'true',
    'data-tool': tool.id,
    'data-index': index,
    disabled: !enabled,
    title: description,
    onClick: () => {
      if (!enabled) return
      tool.run()
      if (!toggle) onClose()
    },
  },
    h('span', { className: 'dsc-popover-item-icon' }, h(Icon, { name: tool.icon, size: 17 })),
    h('span', { className: 'dsc-popover-item-main' },
      h('span', { className: 'dsc-popover-item-title' }, t(tool.labelKey)),
      h('span', { className: cx('dsc-popover-item-desc', !enabled && 'is-warn') }, description),
    ),
    toggle
      ? h('span', { className: cx('dsc-switch', active && 'is-on'), 'aria-hidden': 'true' }, h('span', { className: 'dsc-switch-thumb' }))
      : uploading
        ? h('span', { className: 'dsc-popover-item-state' }, t('toolUploading'))
        : null,
  )
}

/**
 * One direct on/off button on the composer bar. The button is always rendered,
 * so enabling a tool never moves its neighbour or resizes the editor; only the
 * tint changes. An unsupported capability stays in place, disabled and with the
 * reason available as its tooltip.
 */
function ComposerToolButton({ tool, state }) {
  const t = useT()
  const availability = toolAvailability(tool, state)
  const enabled = availability.enabled !== false
  const toggle = tool.kind === 'toggle'
  const active = enabled && toggle && tool.active?.(state) === true
  const reason = enabled ? t(tool.hintKey ?? tool.labelKey) : t(availability.reasonKey ?? 'toolUnavailable')
  const label = t(tool.labelKey)
  return h('button', {
    type: 'button',
    className: cx('dsc-tool-toggle', active && 'is-on'),
    'aria-pressed': toggle ? active : undefined,
    'aria-label': enabled ? label : `${label}: ${reason}`,
    'aria-disabled': enabled ? undefined : 'true',
    title: reason,
    'data-tool': tool.id,
    disabled: !enabled,
    onClick: () => {
      if (!enabled) return
      tool.run()
    },
  },
    h(Icon, { name: tool.icon, size: 15 }),
    h('span', { className: 'dsc-tool-toggle-label' }, label),
  )
}

function ToolsMenu() {
  const t = useT()
  const state = useChat(snapshot => snapshot)
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef(null)
  const panelRef = React.useRef(null)
  const layout = usePopupPlacement(open, triggerRef, panelRef)
  useOutsideDismiss(open, () => setOpen(false), panelRef, triggerRef)
  React.useEffect(() => {
    if (!open) return
    // Opening the menu hands the keyboard to its first item, so a mouse click
    // and then an arrow key continue in the same place.
    focusMenuItem(panelRef.current, 'first')
  }, [open])
  const tools = chatMenuTools()
  const close = () => setOpen(false)
  return h('div', { className: 'dsc-tools' },
    h('button', {
      ref: triggerRef,
      type: 'button',
      className: cx('dsc-tools-trigger', open && 'is-open'),
      title: t('toolsMenu'),
      'aria-label': t('toolsMenu'),
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      onClick: () => setOpen(value => !value),
      onKeyDown: (event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          setOpen(false)
          return
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          setOpen(true)
        }
      },
    }, h(Icon, { name: 'plus', size: 19 })),
    open
      ? h('div', {
          ref: panelRef,
          className: 'dsc-popover dsc-tools-menu',
          role: 'menu',
          'aria-label': t('toolsMenu'),
          'data-placement': layout.placement,
          style: popoverStyle(layout),
          onKeyDown: event => handleMenuKeyDown(event, { container: panelRef.current, onClose: close, trigger: triggerRef }),
        },
        tools.map((tool, index) => h(ToolMenuItem, {
          key: tool.id,
          tool,
          index,
          state,
          onClose: close,
        })),
      )
      : null,
  )
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

/**
 * Every source of one answer, deduplicated by URL and numbered once.
 *
 * Cited pages come first, in the order the model cited them, so the numbering
 * inside the answer matches the list; search hits the model did not cite follow
 * in tool order. Deduplication is by URL only: a URL keeps the number it got on
 * its first appearance, which is what keeps the in-text citation map stable
 * after a reload (the stored blocks are replayed in the same order).
 *
 * @returns `{ sources, indexByUrl }`; `indexByUrl` maps a URL to its 1-based
 * citation number.
 */
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
  const sources = [...cited.values()]
  for (const source of found.values()) {
    const target = cited.get(source.url)
    if (target !== undefined) {
      // A cited page may also be in the search results: borrow the richer
      // display metadata without changing its number.
      if (target.snippet === '' && source.snippet !== '') target.snippet = source.snippet
      if (target.siteName === '' && source.siteName !== '') target.siteName = source.siteName
      if (source.title && (target.title === '' || target.title === hostnameOf(target.url))) target.title = source.title
      continue
    }
    sources.push(source)
  }
  const indexByUrl = new Map(sources.map((source, index) => [source.url, index + 1]))
  return { sources, indexByUrl }
}

function messageText(message) {
  return (message.blocks ?? [])
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')
}

/**
 * Answer text with citation markers appended where the model cited a source.
 *
 * The API ends a text block at each citation, so the marker belongs at the end
 * of that block. Markers are only added for URLs present in the source list,
 * which keeps the numbering in the answer and in the footer identical.
 */
function answerText(message, indexByUrl) {
  const parts = []
  for (const block of message.blocks ?? []) {
    if (block.type !== 'text') continue
    const marks = new Set()
    for (const citation of block.citations ?? []) {
      const index = indexByUrl.get(citation.url)
      if (index !== undefined) marks.add(index)
    }
    parts.push(block.text + [...marks].map(citationMark).join(''))
  }
  return parts.join('')
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

function SourceRow({ source, index, active }) {
  const t = useT()
  const href = safeHref(source.url)
  if (href === null) return null
  const site = source.siteName || hostnameOf(source.url) || t('sourceDomainFallback')
  return h('li', {
    className: cx('dsc-source', active && 'is-target'),
    'data-source-index': index,
  },
    h('span', { className: 'dsc-source-index' }, String(index)),
    h('a', {
      className: 'dsc-source-link',
      href,
      target: '_blank',
      rel: 'noreferrer noopener',
      title: source.title,
    },
      h('span', { className: 'dsc-source-title' }, source.title),
      h('span', { className: 'dsc-source-meta' }, site),
      source.snippet ? h('span', { className: 'dsc-source-snippet' }, source.snippet) : null,
    ),
    h(Icon, { name: 'external', size: 12 }),
  )
}

/**
 * The answer's sources as one compact footer.
 *
 * Collapsed by default: a single "Sources · 15" line, so fifteen citations no
 * longer push the answer off the page. Expanding shows a numbered, scrollable
 * list; a citation marker in the answer expands the list and highlights its row.
 */
function SourcePanel({ sources, messageId, open, onToggle, activeIndex }) {
  const t = useT()
  const listRef = React.useRef(null)
  React.useEffect(() => {
    if (!open || activeIndex === null) return
    const node = listRef.current?.querySelector?.(`[data-source-index="${activeIndex}"]`)
    node?.scrollIntoView?.({ block: 'nearest' })
  }, [open, activeIndex])
  if (sources.length === 0) return null
  const listId = `dsc-sources-${messageId}`
  return h('div', { className: cx('dsc-sources', open && 'is-open') },
    h('button', {
      type: 'button',
      className: 'dsc-sources-toggle',
      'aria-expanded': open,
      'aria-controls': listId,
      onClick: onToggle,
    },
      h(Icon, { name: 'link', size: 13 }),
      h('span', { className: 'dsc-sources-count' }, t('sourceSummary', { count: sources.length })),
      h(Icon, { name: open ? 'chevronDown' : 'chevronRight', size: 12 }),
    ),
    open
      ? h('ol', { className: 'dsc-source-list', id: listId, ref: listRef },
          sources.map((source, index) => h(SourceRow, {
            key: `${source.url}-${index}`,
            source,
            index: index + 1,
            active: activeIndex === index + 1,
          })),
        )
      : null,
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

/**
 * Compact branch switcher shared by user questions and assistant answers.
 * Only rendered when the sibling group has more than one version, so a normal
 * single-path chat keeps its message actions clean.
 */
function VersionNav({ message }) {
  const t = useT()
  const busy = useChat(state => state.streaming !== null)
  const version = message?.version
  if (!version || !(version.count > 1)) return null
  const index = Math.max(1, Math.min(version.count, version.index ?? 1))
  const step = (direction) => {
    if (busy) return
    void chatActions.selectVersion(message.id, direction)
  }
  return h('span', { className: 'dsc-version', role: 'group', 'aria-label': t('versionLabel', { index, count: version.count }) },
    h('button', {
      type: 'button', className: 'dsc-version-button', title: t('versionPrev'), 'aria-label': t('versionPrev'),
      disabled: busy, onClick: () => step(-1),
    }, h(Icon, { name: 'chevronLeft', size: 13 })),
    h('span', { className: 'dsc-version-label' }, `${index} / ${version.count}`),
    h('button', {
      type: 'button', className: 'dsc-version-button', title: t('versionNext'), 'aria-label': t('versionNext'),
      disabled: busy, onClick: () => step(1),
    }, h(Icon, { name: 'chevronRight', size: 13 })),
  )
}

function AssistantMessage({ message, streaming, isLast, canRegenerate, highlighted }) {
  const t = useT()
  const [copied, setCopied] = React.useState(false)
  const [sourcesOpen, setSourcesOpen] = React.useState(false)
  const [activeSource, setActiveSource] = React.useState(null)
  const text = messageText(message)
  const { sources, indexByUrl } = collectMessageSources(message)
  const answer = answerText(message, indexByUrl)
  const refused = message.stopReason === 'refusal'
  const errorInfo = message.error ? friendlyError(message.error) : null
  const showTyping = streaming && text === '' && (message.blocks ?? []).length === 0
  const liveAnswer = streaming && message.status === 'streaming'
  const canContinue = !streaming && isLast && canContinueReply(message)
  const regenerate = () => {
    if (streaming) return
    void chatActions.regenerateMessage(message)
  }
  const onAnswerClick = (event) => {
    const target = event?.target
    const marker = target instanceof Element ? target.closest('[data-dsc-cite]') : null
    if (marker === null) return
    const index = Number(marker.getAttribute('data-dsc-cite'))
    if (!Number.isInteger(index) || index < 1) return
    setSourcesOpen(true)
    setActiveSource(index)
  }
  return h('div', {
    className: cx('dsc-msg dsc-msg-assistant', highlighted && 'is-highlighted'),
    'data-message-id': message.id,
    onClick: onAnswerClick,
  },
    h('div', { className: 'dsc-msg-body' },
      h(ProcessPanel, { message, streaming }),
      refused
        ? h('div', { className: 'dsc-notice' }, h(Icon, { name: 'warning', size: 16 }), h('span', null, t('refused')))
        : null,
      !refused && answer !== ''
        ? h('div', { className: 'dsc-answer', onClick: onAnswerClick },
            h(Markdown, { text: answer, streaming: liveAnswer, sources }),
          )
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
      sources.length > 0 && !refused
        ? h(SourcePanel, {
            sources,
            messageId: message.id,
            open: sourcesOpen,
            activeIndex: activeSource,
            onToggle: () => {
              if (sourcesOpen) setActiveSource(null)
              setSourcesOpen(!sourcesOpen)
            },
          })
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
            canRegenerate
              ? h('button', {
                  type: 'button', className: 'dsc-msg-action', title: t('regenerate'), 'aria-label': t('regenerate'),
                  onClick: regenerate,
                }, h(Icon, { name: 'refresh', size: 14 }), h('span', null, t('regenerate')))
              : null,
            canContinue
              ? h('button', {
                  type: 'button', className: 'dsc-msg-action', title: t('continueGenerating'), 'aria-label': t('continueGenerating'),
                  onClick: () => { void chatActions.continueMessage(message) },
                }, h(Icon, { name: 'continue', size: 14 }), h('span', null, t('continueGenerating')))
              : null,
            h('span', { className: 'dsc-msg-actions-spacer' }),
            messageModelLabel(message) !== ''
              ? h('span', { className: 'dsc-msg-model', title: t('modelLabel') }, messageModelLabel(message))
              : null,
            h(VersionNav, { message }),
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

/**
 * Inline editor for a historical question. It keeps the bubble's own look: the
 * textarea has no border or background of its own, and the footer sits inside
 * the same rounded surface instead of nesting a second input card.
 */
function UserMessageEditor({ message }) {
  const t = useT()
  const draft = useChat(state => state.editDraft)
  const textareaRef = React.useRef(null)
  const hasFiles = Array.isArray(message.files) && message.files.length > 0
  React.useEffect(() => {
    const node = textareaRef.current
    if (!node) return
    node.focus()
    const end = node.value.length
    try {
      node.setSelectionRange(end, end)
    } catch {
      // Selection gestures are an enhancement; focus is what matters.
    }
  }, [])
  React.useEffect(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, 260)}px`
  }, [draft])
  const save = () => {
    if (draft.trim() === '' && !hasFiles) return
    void chatActions.saveEditedMessage()
  }
  return h('div', { className: 'dsc-msg dsc-msg-user' },
    h('div', { className: 'dsc-user-block' },
      h('div', { className: 'dsc-user-bubble is-editing' },
        hasFiles
          ? h('div', { className: 'dsc-user-files' }, message.files.map(file => h(AttachmentCard, { key: file.id, file, compact: true })))
          : null,
        h('textarea', {
          ref: textareaRef,
          className: 'dsc-user-edit-input',
          value: draft,
          rows: 2,
          placeholder: t('editMessage'),
          'aria-label': t('editMessage'),
          onChange: (event) => chatStore.set({ editDraft: event.target.value }),
          onKeyDown: (event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              chatActions.cancelEditMessage()
              return
            }
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              save()
            }
          },
        }),
        h('div', { className: 'dsc-user-edit-actions' },
          h('span', { className: 'dsc-user-edit-hint' }, t('editHint')),
          h('button', {
            type: 'button', className: 'dsc-text-button',
            onClick: () => chatActions.cancelEditMessage(),
          }, t('cancel')),
          h('button', {
            type: 'button', className: 'dsc-primary-button is-small',
            disabled: draft.trim() === '' && !hasFiles,
            onClick: save,
          }, t('editSave')),
        ),
      ),
    ),
  )
}

function UserMessage({ message, canEdit, highlighted }) {
  const t = useT()
  const [copied, setCopied] = React.useState(false)
  const files = Array.isArray(message.files) ? message.files : []
  const content = typeof message.content === 'string' ? message.content : ''
  return h('div', { className: cx('dsc-msg dsc-msg-user', highlighted && 'is-highlighted'), 'data-message-id': message.id },
    h('div', { className: 'dsc-user-block' },
      h('div', { className: 'dsc-user-bubble' },
        files.length > 0
          ? h('div', { className: 'dsc-user-files' }, files.map(file => h(AttachmentCard, { key: file.id, file, compact: true })))
          : null,
        content !== '' ? h('div', { className: 'dsc-user-text' }, content) : null,
      ),
      h('div', { className: 'dsc-user-actions' },
        content !== ''
          ? h('button', {
              type: 'button', className: 'dsc-msg-action', title: t('copy'), 'aria-label': t('copy'),
              onClick: () => {
                copyToClipboard(content).then(() => {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1600)
                }).catch(() => chatStore.toast(t('copyFailed'), 'error'))
              },
            }, h(Icon, { name: copied ? 'check' : 'copy', size: 13 }), h('span', null, copied ? t('copied') : t('copy')))
          : null,
        canEdit
          ? h('button', {
              type: 'button', className: 'dsc-msg-action', title: t('edit'), 'aria-label': t('edit'),
              onClick: () => chatActions.beginEditMessage(message),
            }, h(Icon, { name: 'pencil', size: 13 }), h('span', null, t('edit')))
          : null,
        h('span', { className: 'dsc-msg-actions-spacer' }),
        h(VersionNav, { message }),
      ),
    ),
  )
}

function EmptyState() {
  const t = useT()
  const userName = useChat(state => state.userName)
  const greetingIndex = useChat(state => state.greetingIndex)
  return h('div', { className: 'dsc-empty' },
    h('h1', { className: 'dsc-greeting' }, greetingText(t, greetingIndex, userName)),
  )
}

function Thread() {
  const messages = useChat(state => state.messages)
  const streaming = useChat(state => state.streaming)
  const activeId = useChat(state => state.activeId)
  const conversationLoading = useChat(state => state.conversationLoading)
  const conversationError = useChat(state => state.conversationError)
  const editingId = useChat(state => state.editingId)
  const focusMessage = useChat(state => state.focusMessage)
  const [highlight, setHighlight] = React.useState(null)
  const ref = React.useRef(null)
  useAutoScroll(ref, [messages, activeId, streaming?.assistantId])
  React.useEffect(() => {
    const node = ref.current
    if (node) node.scrollTop = node.scrollHeight
  }, [activeId])
  // Bring a searched or version-switched message into view and mark it briefly.
  // The frame wait lets the new branch finish painting before measuring.
  React.useEffect(() => {
    if (focusMessage === null || typeof focusMessage.id !== 'string' || focusMessage.id === '') return undefined
    const id = focusMessage.id
    setHighlight(id)
    let frame = 0
    const find = () => {
      const container = ref.current
      if (!container) return
      const selector = `[data-message-id="${id.replace(/["\\]/g, '\\$&')}"]`
      const target = container.querySelector(selector)
      if (target) target.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
    frame = requestAnimationFrame(find)
    const timer = setTimeout(() => setHighlight(null), 2200)
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [focusMessage])
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
  return h('div', { className: cx('dsc-thread', messages.length === 0 && 'is-empty'), ref, 'aria-label': tr('appTitle') },
    messages.length === 0
      ? h(EmptyState, null)
      : h('div', { className: 'dsc-thread-inner' }, messages.map((message, index) => {
          if (message.role === 'user') {
            if (editingId === message.id) return h(UserMessageEditor, { key: message.id, message })
            return h(UserMessage, {
              key: message.id,
              message,
              canEdit: streaming === null,
              highlighted: highlight === message.id,
            })
          }
          return h(AssistantMessage, {
            key: message.id,
            message,
            streaming: streaming?.assistantId === message.id,
            isLast: index === messages.length - 1,
            canRegenerate: streaming === null && index > 0 && messages[index - 1]?.role === 'user',
            highlighted: highlight === message.id,
          })
        })),
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

/** Editor grows with the text up to this height, then scrolls internally. */
const COMPOSER_MAX_HEIGHT = 220

/**
 * Whether one keydown should send the message.
 *
 * Two rules matter here and never change with the preference: an IME composing
 * text owns Enter (it commits a candidate, it must not send), and in the
 * default mode Enter needs no modifier. `ctrl-enter` flips the pair so Enter
 * inserts a newline and Ctrl/Cmd+Enter sends.
 */
function composerKeySends(event, sendKey) {
  if (event === null || typeof event !== 'object' || event.key !== 'Enter') return false
  const native = event.nativeEvent ?? event
  if (native.isComposing === true || event.isComposing === true || event.keyCode === 229) return false
  if (sendKey === 'ctrl-enter') {
    return (event.ctrlKey === true || event.metaKey === true) && event.shiftKey !== true && event.altKey !== true
  }
  return event.shiftKey !== true && event.altKey !== true && event.ctrlKey !== true && event.metaKey !== true
}

function Composer() {
  const t = useT()
  const draft = useChat(state => state.draft)
  const attachments = useChat(state => state.attachments)
  const streaming = useChat(state => state.streaming)
  const stopping = useChat(state => state.stopping)
  const auth = useChat(state => state.auth)
  const sendKey = useChat(state => state.sendKey)
  const toolState = useChat(state => state)
  useChat(state => state.modelChoice)
  const choice = currentModelChoice()
  const tools = composerToolDefinitions()
  const unsupportedImages = !modelCapability(choice.model, 'vision')
    && attachments.some(item => item.isImage && item.status !== 'error')
  const focusRequest = useChat(state => state.focusRequest)
  const filePickRequest = useChat(state => state.filePickRequest)
  const textareaRef = React.useRef(null)
  const fileRef = React.useRef(null)
  const [drag, setDrag] = React.useState(false)
  React.useLayoutEffect(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = 'auto'
    const next = Math.min(node.scrollHeight, COMPOSER_MAX_HEIGHT)
    node.style.height = `${next}px`
    node.style.overflowY = node.scrollHeight > COMPOSER_MAX_HEIGHT ? 'auto' : 'hidden'
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
  const onKeyDown = (event) => {
    if (!composerKeySends(event, sendKey)) return
    event.preventDefault()
    if (isStreaming || !canSend) return
    handleSend()
  }
  return h('div', { className: 'dsc-composer-wrap' },
    h(AuthBanner, null),
    h('div', {
      className: cx('dsc-composer', drag && 'is-drag', unsupportedImages && 'has-warning'),
      onDragEnter: (event) => {
        event.preventDefault()
        if (!drag) setDrag(true)
      },
      onDragOver: (event) => {
        event.preventDefault()
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
      h('div', { className: 'dsc-composer-main' },
        attachments.length > 0
          ? h('div', { className: 'dsc-attach-rail' }, attachments.map(file => (
              h(AttachmentCard, {
                key: file.id, file,
                onRemove: chatActions.removeAttachment,
                onRetry: chatActions.retryAttachment,
              })
            )))
          : null,
        h('div', {
          className: 'dsc-editor',
          onClick: (event) => {
            // Clicking the empty area around the caret line focuses the editor,
            // like any chat composer. Buttons inside keep their own clicks.
            if (event.target === event.currentTarget) textareaRef.current?.focus()
          },
        },
          h('textarea', {
            ref: textareaRef,
            className: 'dsc-editor-field',
            value: draft,
            rows: 1,
            placeholder: t('composerPlaceholder'),
            'aria-label': t('composerPlaceholder'),
            title: t(sendKey === 'ctrl-enter' ? 'newlineToSend' : 'enterToSend'),
            spellCheck: 'false',
            onChange: (event) => chatStore.set({ draft: event.target.value }),
            onPaste: (event) => {
              const files = [...(event.clipboardData?.files ?? [])]
              if (files.length > 0) {
                event.preventDefault()
                onFiles(files)
              }
            },
            onKeyDown,
          }),
        ),
        unsupportedImages
          ? h('div', { className: 'dsc-composer-warning' },
              h(Icon, { name: 'warning', size: 14 }),
              h('span', null, t('modelUnsupportedImage')),
              h('button', {
                type: 'button',
                className: 'dsc-inline-button',
                onClick: () => chatActions.selectModel('deepseek-flash'),
              }, t('switchModel')),
            )
          : null,
      ),
      h('div', { className: 'dsc-composer-bar' },
        h('div', { className: 'dsc-composer-left' },
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
          h(ToolsMenu, null),
          tools.map(tool => h(ComposerToolButton, {
            key: tool.id,
            tool,
            state: toolState,
          })),
        ),
        h('div', { className: 'dsc-composer-right' },
          h(ModelMenu, null),
          choice.efforts.length > 0 ? h(EffortMenu, null) : null,
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
      ),
      drag ? h('div', { className: 'dsc-drop-mask' }, h(Icon, { name: 'paperclip', size: 22 }), t('dropFiles')) : null,
    ),
    h('div', { className: 'dsc-disclaimer' }, t('disclaimer')),
  )
}

/** Pointer position for a floating menu, falling back to the trigger's box. */
function menuPoint(event) {
  const rect = event?.currentTarget?.getBoundingClientRect?.()
  const x = typeof event?.clientX === 'number' && event.clientX > 0
    ? event.clientX
    : (rect !== undefined && rect !== null ? rect.right - 8 : 48)
  const y = typeof event?.clientY === 'number' && event.clientY > 0
    ? event.clientY
    : (rect !== undefined && rect !== null ? rect.bottom + 4 : 96)
  return { x, y }
}

function ConversationItem({ conversation, active, renaming, onOpen, onRename, onMenu }) {
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
  const title = conversation.title || t('newChatTitle')
  return h('div', {
    className: cx('dsc-chat-item', active && 'is-active', conversation.pinned && 'is-pinned'),
    title,
    onContextMenu: (event) => {
      event.preventDefault()
      const point = menuPoint(event)
      chatActions.openConversationMenu(conversation.id, point.x, point.y)
    },
  },
    h('button', {
      type: 'button',
      className: 'dsc-chat-item-main',
      onClick: onOpen,
    },
      conversation.pinned
        ? h('span', { className: 'dsc-chat-item-pin', 'aria-hidden': 'true' }, h(Icon, { name: 'pin', size: 11 }))
        : null,
      h('span', { className: 'dsc-chat-item-title' }, title),
      h('span', { className: 'dsc-chat-item-time' }, relativeTime(conversation.updatedAt, t)),
    ),
    h('button', {
      type: 'button', className: 'dsc-chat-item-more', title: t('moreActions'), 'aria-label': t('moreActions'),
      onClick: (event) => {
        event.stopPropagation()
        const point = menuPoint(event)
        chatActions.openConversationMenu(conversation.id, point.x, point.y)
      },
    }, h(Icon, { name: 'more', size: 15 })),
  )
}

function FolderSection({ folder, conversations, activeId, renamingId, renderItem }) {
  const t = useT()
  const collapsed = folder.collapsed === true
  return h('div', { className: cx('dsc-folder', collapsed && 'is-collapsed') },
    h('div', {
      className: 'dsc-folder-head',
      onContextMenu: (event) => {
        event.preventDefault()
        const point = menuPoint(event)
        chatActions.openFolderMenu(folder.id, point.x, point.y)
      },
    },
      h('button', {
        type: 'button', className: 'dsc-folder-toggle',
        'aria-expanded': !collapsed,
        title: folder.name,
        onClick: () => chatActions.toggleFolder(folder.id),
      },
        h('span', { className: 'dsc-folder-chevron' }, h(Icon, { name: collapsed ? 'chevronRight' : 'chevronDown', size: 12 })),
        h('span', { className: 'dsc-folder-icon' }, h(Icon, { name: 'folder', size: 14 })),
        h('span', { className: 'dsc-folder-name' }, folder.name),
        h('span', { className: 'dsc-folder-count' }, String(conversations.length)),
      ),
      h('button', {
        type: 'button', className: 'dsc-chat-item-more', title: t('moreActions'), 'aria-label': t('moreActions'),
        onClick: (event) => {
          event.stopPropagation()
          const point = menuPoint(event)
          chatActions.openFolderMenu(folder.id, point.x, point.y)
        },
      }, h(Icon, { name: 'more', size: 15 })),
    ),
    collapsed
      ? null
      : h('div', { className: 'dsc-folder-items' },
          conversations.length === 0
            ? h('div', { className: 'dsc-folder-empty' }, t('folderEmpty'))
            : conversations.map(renderItem),
        ),
  )
}

/** Highlight the query inside a search snippet without rendering raw HTML. */
function HighlightedSnippet({ text, query }) {
  const needle = typeof query === 'string' ? query.trim() : ''
  if (needle === '' || typeof text !== 'string') return text
  const lower = text.toLowerCase()
  const target = needle.toLowerCase()
  const parts = []
  let index = 0
  for (;;) {
    const found = lower.indexOf(target, index)
    if (found < 0) break
    if (found > index) parts.push(text.slice(index, found))
    parts.push(h('mark', { key: `mark-${found}`, className: 'dsc-search-mark' }, text.slice(found, found + target.length)))
    index = found + target.length
  }
  if (parts.length === 0) return text
  if (index < text.length) parts.push(text.slice(index))
  return parts
}

function SearchResults({ query, pending, results, error, activeId, onOpen }) {
  const t = useT()
  if (error !== '') {
    return h('div', { className: 'dsc-list-empty' }, t('searchError', { message: error }))
  }
  if (pending) {
    return h('div', { className: 'dsc-search-state' }, h(Spinner, { size: 14 }), t('searchSearching'))
  }
  if (results.length === 0) {
    return h('div', { className: 'dsc-list-empty' }, t('searchEmpty'))
  }
  return h('div', { className: 'dsc-search-results' },
    results.map(result => h('button', {
      key: result.id,
      type: 'button',
      className: cx('dsc-search-result', result.id === activeId && 'is-active'),
      onClick: () => onOpen(result),
    },
      h('span', { className: 'dsc-search-result-head' },
        h('span', { className: 'dsc-search-result-title' }, result.title || t('newChatTitle')),
        result.pinned
          ? h('span', { className: 'dsc-search-result-badge', title: t('pinnedSection') }, h(Icon, { name: 'pin', size: 11 }))
          : null,
        result.archived
          ? h('span', { className: 'dsc-search-result-badge', title: t('archiveTitle') }, h(Icon, { name: 'archive', size: 11 }))
          : null,
      ),
      result.titleMatch && !result.snippet
        ? h('span', { className: 'dsc-search-result-meta' }, relativeTime(result.updatedAt, t))
        : null,
      result.snippet
        ? h('span', { className: 'dsc-search-result-snippet' }, h(HighlightedSnippet, { text: result.snippet, query }))
        : null,
    )),
  )
}

/**
 * The Chat sidebar's right-edge drag handle. It mirrors the native Harness
 * sidebar handle: an 8px pointer-capture strip that reports rAF-throttled dx
 * against the drag-start width, plus arrow-key resizing for keyboard users.
 * The width it writes is the shared 264-420px contract from the store.
 */
function SidebarResizer({ onDraggingChange }) {
  const t = useT()
  const width = useChat(state => state.sidebarWidth)
  const drag = React.useRef(null)
  const [dragging, setDragging] = React.useState(false)
  const setDraggingState = (value) => {
    setDragging(value)
    if (onDraggingChange) onDraggingChange(value)
  }
  const renderedWidth = (element) => {
    const rect = element?.parentElement?.getBoundingClientRect?.()
    return rect !== undefined && rect.width > 0 ? rect.width : width
  }
  // The column can be CSS-clamped on a narrow window; the announced value must
  // describe what is actually rendered, not just the stored preference.
  const effectiveWidth = clampSidebarWidth(width, typeof window !== 'undefined' ? window.innerWidth : undefined)
  const endDrag = (commit) => {
    const state = drag.current
    if (state === null) return
    drag.current = null
    if (state.frame !== 0) cancelAnimationFrame(state.frame)
    try {
      if (state.element.hasPointerCapture?.(state.pointerId)) state.element.releasePointerCapture(state.pointerId)
    } catch {
      // The pointer may already be gone with its capture.
    }
    // A cancelled or unexpectedly lost capture must not treat clientX=0 as a
    // rightward-to-left drag and snap the column to its minimum.
    if (commit) {
      chatActions.setSidebarWidth(state.startWidth + state.latest - state.startX)
      chatActions.saveSidebarWidth()
    }
    setDraggingState(false)
  }
  React.useEffect(() => () => {
    const state = drag.current
    if (state === null) return
    if (state.frame !== 0) cancelAnimationFrame(state.frame)
    if (onDraggingChange) onDraggingChange(false)
  }, [])
  const onPointerDown = (event) => {
    if (event.button !== 0 || drag.current !== null) return
    event.preventDefault()
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // Pointer capture is an enhancement; the move handler still receives events.
    }
    drag.current = {
      element: event.currentTarget,
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: renderedWidth(event.currentTarget),
      latest: event.clientX,
      frame: 0,
    }
    setDraggingState(true)
  }
  const onPointerMove = (event) => {
    const state = drag.current
    if (state === null || state.pointerId !== event.pointerId) return
    state.latest = event.clientX
    if (state.frame !== 0) return
    state.frame = requestAnimationFrame(() => {
      state.frame = 0
      chatActions.setSidebarWidth(state.startWidth + state.latest - state.startX)
    })
  }
  const onPointerUp = (event) => {
    const state = drag.current
    if (state === null || state.pointerId !== event.pointerId) return
    state.latest = event.clientX
    endDrag(true)
  }
  const onPointerCancel = () => {
    // Cancellation has no reliable coordinates; keep the last live width and
    // do not persist a gesture the user did not finish.
    endDrag(false)
  }
  const onKeyDown = (event) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!keys.includes(event.key)) return
    event.preventDefault()
    const step = event.shiftKey ? 32 : 16
    if (event.key === 'Home') chatActions.setSidebarWidth(SIDEBAR_MIN)
    else if (event.key === 'End') chatActions.setSidebarWidth(SIDEBAR_MAX)
    else chatActions.setSidebarWidth(renderedWidth(event.currentTarget) + (event.key === 'ArrowRight' ? step : -step))
    chatActions.saveSidebarWidth()
  }
  return h('div', {
    className: cx('dsc-sidebar-resizer', dragging && 'is-dragging'),
    role: 'separator',
    'aria-orientation': 'vertical',
    'aria-label': t('resizeSidebar'),
    'aria-valuemin': SIDEBAR_MIN,
    'aria-valuemax': SIDEBAR_MAX,
    'aria-valuenow': Math.round(effectiveWidth),
    title: t('resizeSidebar'),
    tabIndex: 0,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onLostPointerCapture: onPointerCancel,
    onKeyDown,
  })
}

function Sidebar() {
  const t = useT()
  const conversations = useChat(state => state.conversations)
  const folders = useChat(state => state.folders)
  const activeId = useChat(state => state.activeId)
  const renamingId = useChat(state => state.renamingId)
  const auth = useChat(state => state.auth)
  const [query, setQuery] = React.useState('')
  const [search, setSearch] = React.useState({ query: '', pending: false, results: [], error: '' })
  const searchSequence = React.useRef(0)
  const searchRef = React.useRef(null)
  React.useEffect(() => {
    const text = query.trim()
    if (text === '') {
      searchSequence.current += 1
      setSearch({ query: '', pending: false, results: [], error: '' })
      return undefined
    }
    const sequence = ++searchSequence.current
    setSearch(previous => ({ ...previous, query: text, pending: true, error: '' }))
    // Local history is small: one short debounce and a Host-side scan is
    // enough, so no separate search index or service is needed.
    const timer = setTimeout(() => {
      chatActions.searchHistory(text).then((data) => {
        if (sequence !== searchSequence.current) return
        setSearch({ query: text, pending: false, results: Array.isArray(data?.results) ? data.results : [], error: '' })
      }).catch((error) => {
        if (sequence !== searchSequence.current) return
        setSearch({ query: text, pending: false, results: [], error: error instanceof Error ? error.message : String(error) })
      })
    }, 220)
    return () => clearTimeout(timer)
  }, [query])
  const closeOnMobile = () => {
    // Same breakpoint as the drawer presentation; between 769-1024px the
    // sidebar is still a column and selecting a conversation must not hide it.
    if (typeof window !== 'undefined' && window.innerWidth <= 768) chatStore.set({ sidebarOpen: false })
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
  const renderConversation = conversation => h(ConversationItem, {
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
  })
  // Archived chats leave the normal list but stay searchable and manageable in
  // the archive dialog. Pinned chats stay pinned even when they also belong to
  // a folder: the pinned section is their only home until they are unpinned.
  const groups = organizeSidebar(conversations, folders)
  const pinned = groups.pinned
  const loose = groups.loose
  const folderItems = new Map(groups.folders.map(entry => [entry.folder.id, entry.conversations]))
  const archivedCount = groups.archivedCount
  const visibleCount = groups.pinned.length + groups.loose.length
    + groups.folders.reduce((total, entry) => total + entry.conversations.length, 0)
  const groupBlock = (key, label, items) => h('div', { className: 'dsc-chat-group', key },
    h('div', { className: 'dsc-chat-group-label' }, label),
    items.map(renderConversation),
  )
  const searching = query.trim() !== ''
  return h('aside', { className: 'dsc-sidebar-inner' },
    h('div', { className: 'dsc-sidebar-brand' },
      h('div', { className: 'dsc-brand-lockup' }, h(DeepSeekLockup, { height: 24 })),
      h('button', {
        type: 'button', className: 'dsc-icon-button dsc-sidebar-collapse', title: t('collapseSidebar'),
        'aria-label': t('collapseSidebar'), onClick: () => chatStore.set({ sidebarOpen: false }),
      }, h(Icon, { name: 'sidebar', size: 16 })),
    ),
    h('button', {
      type: 'button', className: 'dsc-new-chat',
      onClick: () => { void chatActions.newChat(); closeOnMobile() },
    }, h(Icon, { name: 'plus', size: 15 }), h('span', null, t('newChat'))),
    h('div', {
      className: 'dsc-search',
      onMouseDown: (event) => {
        // Keep the whole field clickable while letting the clear button win.
        if (typeof event.target?.closest === 'function' && event.target.closest('button') !== null) return
        searchRef.current?.focus()
      },
    },
      h(Icon, { name: 'search', size: 15 }),
      h('input', {
        ref: searchRef,
        className: 'dsc-search-input',
        value: query,
        placeholder: t('searchChats'),
        'aria-label': t('searchChats'),
        onChange: (event) => setQuery(event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Escape' && query !== '') {
            event.preventDefault()
            setQuery('')
          }
        },
      }),
      searching
        ? h('button', {
            type: 'button', className: 'dsc-search-clear', title: t('clear'), 'aria-label': t('clear'),
            onMouseDown: (event) => event.preventDefault(),
            onClick: () => { setQuery(''); searchRef.current?.focus() },
          }, h(Icon, { name: 'close', size: 12 }))
        : null,
    ),
    h('div', { className: 'dsc-chat-list' },
      searching
        ? h(SearchResults, {
            query: search.query,
            pending: search.pending,
            results: search.results,
            error: search.error,
            activeId,
            onOpen: (result) => {
              void chatActions.openSearchResult(result)
              closeOnMobile()
            },
          })
        : h(React.Fragment, null,
            pinned.length > 0 ? groupBlock('pinned', t('pinnedSection'), pinned) : null,
            h('div', { className: 'dsc-list-toolbar' },
              h('span', { className: 'dsc-list-toolbar-label' }, t('foldersSection')),
              h('button', {
                type: 'button', className: 'dsc-icon-button is-small', title: t('newFolder'),
                'aria-label': t('newFolder'),
                onClick: () => chatActions.requestFolderPrompt('create'),
              }, h(Icon, { name: 'folderPlus', size: 14 })),
            ),
            folders.length > 0
              ? h('div', { className: 'dsc-folder-list' }, folders.map(folder => h(FolderSection, {
                  key: folder.id,
                  folder,
                  conversations: folderItems.get(folder.id) ?? [],
                  activeId,
                  renamingId,
                  renderItem: renderConversation,
                })))
              : null,
            loose.length > 0
              ? (folders.length > 0
                  ? groupBlock('unfiled', t('unfiled'), loose)
                  : groupConversations(loose, t).map(group => groupBlock(group.key, group.label, group.items)))
              : null,
            visibleCount === 0 ? h('div', { className: 'dsc-list-empty' }, t('noChats')) : null,
          ),
    ),
    h('div', { className: 'dsc-sidebar-foot' },
      h('button', {
        type: 'button', className: 'dsc-foot-action',
        title: t('archiveManager'),
        onClick: () => chatActions.openArchive(),
      }, h(Icon, { name: 'archive', size: 16 }), h('span', null, t('archiveManager')),
        archivedCount > 0 ? h('span', { className: 'dsc-foot-count' }, String(archivedCount)) : null,
      ),
      h('button', {
        type: 'button', className: 'dsc-foot-action',
        title: t('chatSettings'),
        onClick: () => chatStore.set({ settingsOpen: true }),
      }, h(Icon, { name: 'settings', size: 16 }), h('span', null, t('settings')),
        h('span', { className: cx('dsc-auth-dot', auth?.ready ? 'is-ready' : 'is-missing'), title: authSourceLabel(auth, t) }),
      ),
    ),
  )
}

function ChatHeader() {
  const t = useT()
  const activeId = useChat(state => state.activeId)
  const conversations = useChat(state => state.conversations)
  const messages = useChat(state => state.messages)
  const auth = useChat(state => state.auth)
  const sidebarOpen = useChat(state => state.sidebarOpen)
  const conversation = conversations.find(item => item.id === activeId)
  const canDraft = messages.length > 0
  const blankHome = activeId === null && messages.length === 0
  const hostHandoff = useChat(state => state.bootData?.handoff?.enabled !== false)
  return h('header', { className: 'dsc-header' },
    h('div', { className: 'dsc-header-left' },
      !sidebarOpen
        ? h('button', {
            type: 'button', className: 'dsc-icon-button dsc-header-menu',
            title: t('expandSidebar'), 'aria-label': t('expandSidebar'),
            onClick: () => chatStore.set({ sidebarOpen: true }),
          }, h(Icon, { name: 'menu', size: 18 }))
        : null,
      // A blank home already carries its greeting; a repeated "New chat" title
      // would only add chrome above it.
      blankHome
        ? null
        : h('div', { className: 'dsc-header-title' }, conversation?.title || t('newChatTitle')),
    ),
    h('div', { className: 'dsc-header-right' },
      auth?.ready === false
        ? h('button', {
            type: 'button', className: 'dsc-auth-pill is-missing', title: t('noAuthTitle'),
            onClick: () => chatStore.set({ settingsOpen: true }),
          }, h(Icon, { name: 'warning', size: 13 }), h('span', null, t('authMissing')))
        : null,
      !sidebarOpen
        ? h('button', {
            type: 'button', className: 'dsc-icon-button',
            title: t('chatSettings'), 'aria-label': t('chatSettings'),
            onClick: () => chatStore.set({ settingsOpen: true }),
          }, h(Icon, { name: 'settings', size: 17 }))
        : null,
      h('button', {
        type: 'button',
        className: 'dsc-handoff-button',
        title: !canDraft ? t('handoffEmpty') : hostHandoff ? t('handoffSubtitle') : t('handoffUnavailable'),
        disabled: !canDraft,
        onClick: () => { void chatActions.openHandoff() },
      }, h(Icon, { name: 'agent', size: 15 }), h('span', { className: 'dsc-handoff-label' }, t('handoff'))),
    ),
  )
}

const AGENT_PAGE_POLL_MS = 400
const AGENT_PAGE_POLL_LIMIT = 25

/**
 * Read the Agent page's native state. `true` means "blank new page, the shell
 * switch belongs here": no Session is presented, or the presented Session is
 * still blank. The list row's `blank` is the Host's own Session-list metadata
 * (set false by the first `turn/start`), so this never inspects the DOM or the
 * conversation title. A global panel replaces the conversation, so it counts as
 * not-blank and the switch stays out of its way.
 * @returns the state, or null while the native session service is unavailable.
 */
function readAgentPageState() {
  // Called during render, so a disposed or half-mounted foreign service must
  // never take the shell entry down with it.
  let snapshot
  try {
    const list = appCtx?.get?.('sessions')?.list
    if (list === undefined || list === null || typeof list.getSnapshot !== 'function') return null
    snapshot = list.getSnapshot()
  } catch {
    return null
  }
  let panel = false
  try {
    const panelInfo = appCtx?.get?.('layout')?.panelInfo
    if (panelInfo !== undefined && typeof panelInfo.getSnapshot === 'function') {
      panel = (panelInfo.getSnapshot()?.activePanelId ?? null) !== null
    }
  } catch {
    panel = false
  }
  const rows = snapshot !== null && typeof snapshot === 'object' && snapshot.byId !== null
    && typeof snapshot.byId === 'object'
    ? Object.values(snapshot.byId)
    : []
  const active = rows.find(row => (row?.retainedBy?.mainView ?? 0) > 0)
  if (active === undefined) {
    // `pending` means the first list pull has not arrived, so an existing
    // conversation may still be about to present itself; staying hidden avoids
    // flashing the switch over it. `ready` with nothing presented is a genuinely
    // new page (workspace hero / new session).
    return { blank: snapshot.phase === 'ready', panel }
  }
  // A running Session has already started its turn: hide immediately on send,
  // without waiting for the first assistant message.
  if (active.running === true) return { blank: false, panel }
  return { blank: active.blank === true, panel }
}

/**
 * The shared Chat | Agent navigation. It is registered in the frame-wide
 * overlay (root scope, outside every column), so it is part of the shell
 * chrome rather than of either view, and it switches the whole application
 * view. The toast stack rides along because messages raised while the Chat
 * surface is closed (`handoffSent`, a background stream failure) must still be
 * visible.
 *
 * VISIBILITY — ChatGPT's blank-page rule: the switch only appears on a new,
 * still-empty page. It hides as soon as the first message starts sending, stays
 * hidden for existing conversations, and returns for a new blank chat/session.
 * The decision uses the native state on the Agent side (`ctx.sessions.list`, the
 * Host's own `blank` metadata) and this plugin's message model on the Chat side
 * (never the DOM), so loading, switching and streaming cannot make it flicker.
 * While hidden it renders no element at all: nothing is left to intercept
 * clicks.
 *
 * PLACEMENT — measured against the live layout, not the window:
 * - Vertical: the native Session header's toolbar line, i.e. the middle of the
 *   title row that carries the header utilities and the far-right corner
 *   control. The stylesheet holds the same value as a constant
 *   (`--dsh-frame-chrome-top + 10px padding + 30px row / 2`); the live anchor
 *   `[data-conversation-header-corner]` (published by the conversation header
 *   for exactly this kind of chrome alignment) refines it when present.
 * - Horizontal: the centre of the main content column. Agent mode uses the
 *   native sidebar width the frame publishes (`--dsh-windows-sidebar-width`);
 *   Chat mode measures its own `.dsc-main`. The window centre is never used.
 *
 * Both modes therefore share one line: the native header sits behind the Chat
 * surface and keeps its geometry, so the switch does not move when the mode
 * flips.
 */
function ModeSwitch() {
  const t = useT()
  const open = useChat(state => state.open)
  const chatBlank = useChat(chatPageIsBlank)
  // Read once during the first render so the pill is already correct on the
  // first paint; the effect below attaches the live subscriptions.
  const [agentPage, setAgentPage] = React.useState(readAgentPageState)
  const ref = React.useRef(null)
  // Follow the native Session list (and the global panel selection). The
  // services are registered by other plugins, so a cold start may need to wait
  // a beat before they exist; the store then pushes every later change.
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined
    let disposed = false
    let timer = 0
    let attempts = 0
    let detach = null
    const update = () => {
      if (disposed) return
      const next = readAgentPageState()
      if (next === null) return
      setAgentPage(previous => (
        previous !== null && previous.blank === next.blank && previous.panel === next.panel
          ? previous
          : next
      ))
    }
    const attach = () => {
      if (disposed) return
      const list = appCtx?.get?.('sessions')?.list
      if (list === undefined || list === null || typeof list.getSnapshot !== 'function') {
        attempts += 1
        if (attempts < AGENT_PAGE_POLL_LIMIT) timer = setTimeout(attach, AGENT_PAGE_POLL_MS)
        return
      }
      update()
      const disposers = []
      if (typeof list.subscribe === 'function') disposers.push(list.subscribe(update))
      const panelInfo = appCtx?.get?.('layout')?.panelInfo
      if (panelInfo !== undefined && typeof panelInfo.subscribe === 'function') disposers.push(panelInfo.subscribe(update))
      detach = () => {
        for (const dispose of disposers) {
          try {
            if (typeof dispose === 'function') dispose()
          } catch {
            // A disposed service owns nothing left to release.
          }
        }
      }
    }
    attach()
    return () => {
      disposed = true
      if (timer !== 0) clearTimeout(timer)
      if (detach !== null) detach()
    }
  }, [])
  // Agent side: unknown state stays hidden (avoids a flash over an existing
  // conversation while the list loads); a blank page shows it.
  const agentBlank = agentPage !== null && agentPage.blank && !agentPage.panel
  const visible = open ? chatBlank : agentBlank
  React.useLayoutEffect(() => {
    if (typeof document === 'undefined') return undefined
    let frame = 0
    const apply = () => {
      frame = 0
      const node = ref.current
      if (node === null) return
      // Horizontal: only the Chat surface needs a measurement; in Agent mode
      // the stylesheet tracks the native sidebar width on its own.
      const main = open ? document.querySelector('.dsc-main') : null
      if (main === null) {
        node.style.removeProperty('left')
        node.style.removeProperty('right')
        node.style.removeProperty('transform')
      } else {
        const rect = main.getBoundingClientRect()
        node.style.left = `${Math.round(rect.left + rect.width / 2)}px`
        node.style.right = 'auto'
        node.style.transform = 'translate(-50%, -50%)'
      }
      // Vertical: the native toolbar line published by the Session header.
      const anchor = document.querySelector('[data-conversation-header-corner]')
      const anchorRect = anchor === null ? null : anchor.getBoundingClientRect()
      if (anchorRect !== null && anchorRect.height > 0) {
        node.style.top = `${Math.round(anchorRect.top + anchorRect.height / 2)}px`
      } else {
        node.style.removeProperty('top')
      }
    }
    const schedule = () => { if (frame === 0) frame = requestAnimationFrame(apply) }
    apply()
    const targets = [document.body]
    const main = open ? document.querySelector('.dsc-main') : null
    if (main !== null) targets.push(main)
    const anchor = document.querySelector('[data-conversation-header-corner]')
    if (anchor !== null) targets.push(anchor)
    let observer
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(schedule)
      for (const target of targets) observer.observe(target)
    }
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('resize', schedule)
      if (observer !== undefined) observer.disconnect()
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [open, visible])
  const item = (mode, label, selected) => h('button', {
    type: 'button',
    'aria-pressed': selected,
    className: cx('dsc-modeswitch-item', mode === 'chat' ? 'is-chat' : 'is-agent'),
    title: mode === 'chat' ? t('switchToChat') : t('switchToAgent'),
    onClick: () => chatActions.setMode(mode),
  }, h('span', { className: 'dsc-modeswitch-label' }, label))
  return h('div', { className: 'dsc-shell' },
    visible
      ? h('div', {
          className: 'dsc-modeswitch',
          role: 'group',
          'aria-label': t('modeSwitchLabel'),
          'data-active': open ? 'chat' : 'agent',
          ref,
        },
          h('span', { className: 'dsc-modeswitch-thumb', 'aria-hidden': 'true' }),
          item('chat', t('chatMode'), open),
          item('agent', t('agentMode'), !open),
        )
      : null,
    h(Toasts, null),
  )
}

const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

function ChatRoot() {
  const t = useT()
  const open = useChat(state => state.open)
  const boot = useChat(state => state.boot)
  const bootError = useChat(state => state.bootError)
  const settingsOpen = useChat(state => state.settingsOpen)
  const confirm = useChat(state => state.confirm)
  const handoff = useChat(state => state.handoff)
  const sidebarOpen = useChat(state => state.sidebarOpen)
  const sidebarWidth = useChat(state => state.sidebarWidth)
  const menu = useChat(state => state.menu)
  const folderPrompt = useChat(state => state.folderPrompt)
  const moveChat = useChat(state => state.moveChat)
  const folderAdd = useChat(state => state.folderAdd)
  const archiveOpen = useChat(state => state.archiveOpen)
  const [resizing, setResizing] = React.useState(false)
  const rootRef = React.useRef(null)
  const sidebarRef = React.useRef(null)
  React.useEffect(() => {
    if (!open) return
    const node = sidebarRef.current
    if (node) node.inert = !sidebarOpen
  }, [open, sidebarOpen])
  // Keep the drawer presentation in step with the breakpoint: a window that
  // crosses it must not leave the fixed drawer covering the whole Chat surface.
  // 1024px is the frame's own sidebar auto-collapse point, so both modes change
  // posture together and the shared switch keeps the same centre.
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia('(max-width: 1024px)')
    const onChange = (event) => chatStore.set({ sidebarOpen: !event.matches })
    if (typeof query.addEventListener === 'function') query.addEventListener('change', onChange)
    return () => {
      if (typeof query.removeEventListener === 'function') query.removeEventListener('change', onChange)
    }
  }, [])
  React.useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (confirm !== null) {
          chatStore.set({ confirm: null })
          return
        }
        if (chatStore.state.handoff !== null) {
          const handoff = chatStore.state.handoff
          // Escape closes the innermost layer: the creation panel first, then
          // the handoff dialog itself.
          if (handoff.workspaceDraft !== null && handoff.workspaceDraft !== undefined) {
            if (handoff.workspaceDraft.busy !== true) chatActions.closeHandoffWorkspaceDraft()
            return
          }
          if (handoff.busy !== true) chatActions.closeHandoff()
          return
        }
        if (settingsOpen) {
          // The import dialog is nested inside settings; Escape closes only it.
          if (memoryImportDialogOpen()) return
          chatStore.set({ settingsOpen: false })
          return
        }
        if (chatStore.state.menu !== null) {
          chatActions.closeMenu()
          return
        }
        if (chatStore.state.folderPrompt !== null) {
          chatActions.closeFolderPrompt()
          return
        }
        if (chatStore.state.moveChat !== null) {
          chatActions.closeMoveChat()
          return
        }
        if (chatStore.state.folderAdd !== null) {
          chatActions.closeFolderAdd()
          return
        }
        if (chatStore.state.archiveOpen === true) {
          chatActions.closeArchive()
          return
        }
        if (chatStore.state.editingId !== null) {
          chatActions.cancelEditMessage()
          return
        }
        // On the narrow drawer presentation Escape dismisses the sidebar, the
        // same gesture as the native drawer.
        if (chatStore.state.sidebarOpen && typeof window !== 'undefined' && window.innerWidth <= 768) {
          chatStore.set({ sidebarOpen: false })
        }
        return
      }
      if (event.key !== 'Tab') return
      // The nested import dialog owns its own native focus cycle.
      if (memoryImportDialogOpen()) return
      const root = rootRef.current
      if (!root) return
      // A dialog traps focus on its own; otherwise the surface and the shared
      // switch form one scope, so Tab never reaches the native Agent UI that
      // stays mounted underneath. An open menu keeps focus among its items.
      const modal = root.querySelector('.dsc-modal, .dsc-confirm, .dsc-menu')
      const scope = modal ?? root
      // The share switch is a fixed-position shell entry; its own buttons are
      // laid out inside it, so they carry an offsetParent while the pill does not.
      const extras = modal === null ? [...document.querySelectorAll('.dsc-modeswitch button')] : []
      const focusables = [...scope.querySelectorAll(FOCUSABLE), ...extras].filter(element => (
        element.offsetParent !== null
        && element.closest('[inert]') === null
        && element.getAttribute('aria-hidden') !== 'true'
      ))
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const current = document.activeElement
      if (current === null || !focusables.includes(current)) {
        event.preventDefault()
        const target = event.shiftKey ? last : first
        target.focus()
        return
      }
      if (event.shiftKey && current === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, settingsOpen, confirm])
  if (!open) return null
  return h('div', {
    className: 'dsc-root', role: 'region', 'aria-label': t('appTitle'), tabIndex: -1,
    ref: rootRef,
    'data-dsc-mode': 'chat',
    'data-resizing': resizing || undefined,
  },
    h('div', {
      className: cx('dsc-sidebar-column', sidebarOpen && 'is-open'),
      'aria-hidden': !sidebarOpen ? 'true' : undefined,
      ref: sidebarRef,
      style: { '--dsc-sidebar-width': `${sidebarWidth}px` },
    },
      h('aside', { className: 'dsc-sidebar' }, h(Sidebar, null)),
      sidebarOpen ? h(SidebarResizer, { onDraggingChange: setResizing }) : null,
    ),
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
    handoff !== null ? h(HandoffDialog, null) : null,
    folderPrompt !== null ? h(FolderPromptDialog, null) : null,
    moveChat !== null ? h(MoveChatDialog, null) : null,
    folderAdd !== null ? h(FolderAddDialog, null) : null,
    archiveOpen ? h(ArchiveDialog, null) : null,
    // The confirmation sits on top of whichever surface raised it (the archive
    // manager, a folder picker or the sidebar menu).
    confirm !== null ? h(ConfirmDialog, null) : null,
    menu !== null ? h(ContextMenu, null) : null,
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

function Switch({ checked, onChange, label, disabled = false }) {
  return h('button', {
    type: 'button',
    role: 'switch',
    'aria-checked': checked,
    'aria-label': label,
    disabled,
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

/**
 * Every dialog is a native modal <dialog>. showModal() puts the dialog and its
 * mask in the browser's top layer, above the Chat shell's own stacking contexts,
 * and makes the rest of the page inert — including the shared Chat | Agent
 * switch, which must not show through the mask or receive clicks. The dialog
 * stays inside ChatRoot, so the --dsc-* theme tokens still inherit.
 */
function ModalBackdrop({ children, onDismiss, className = '' }) {
  const ref = React.useRef(null)
  const dismissRef = React.useRef(onDismiss)
  dismissRef.current = onDismiss
  React.useEffect(() => {
    const node = ref.current
    if (node === null) return undefined
    // Keep Escape under React's control: an overlay that is busy must be able
    // to refuse the close, and a dialog that closes natively would leave the
    // store thinking it is still open.
    const cancel = (event) => {
      event.preventDefault()
      dismissRef.current()
    }
    node.addEventListener('cancel', cancel)
    if (typeof node.showModal === 'function') {
      if (!node.open) node.showModal()
    } else {
      // Very old WebViews keep the previous fixed-overlay rendering.
      node.setAttribute('open', '')
    }
    return () => {
      node.removeEventListener('cancel', cancel)
      if (node.open) node.close()
    }
  }, [])
  return h('dialog', {
    ref,
    className: cx('dsc-modal-backdrop', className),
    onMouseDown: (event) => {
      if (event.target === event.currentTarget) dismissRef.current()
    },
  }, children)
}

function SettingsDialog() {
  const t = useT()
  const auth = useChat(state => state.auth)
  const settings = useChat(state => state.settings)
  const sendKey = useChat(state => state.sendKey)
  const bootData = useChat(state => state.bootData)
  const defaultModelId = useChat(state => state.modelConfig?.defaults?.model ?? 'deepseek-flash')
  const models = useChat(state => state.models)
  const [keyInput, setKeyInput] = React.useState('')
  const [prompt, setPrompt] = React.useState(settings.systemPrompt)
  const [savingKey, setSavingKey] = React.useState(false)
  const [savingPrompt, setSavingPrompt] = React.useState(false)
  // General stays the default tab; the Memory tab mounts its own pane only
  // while it is active, so opening settings never calls the memory API.
  const [tab, setTab] = React.useState('general')
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
  return h(ModalBackdrop, { onDismiss: close },
    h('div', { className: 'dsc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('settingsTitle') },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('settingsTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('settingsSubtitle')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, onClick: close,
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-settings-tabs', role: 'tablist', 'aria-label': t('settingsTabsLabel') },
        [['general', 'settingsGeneralTab'], ['memory', 'settingsMemoryTab']].map(([value, key]) => (
          h('button', {
            key: value,
            type: 'button',
            role: 'tab',
            'aria-selected': tab === value,
            className: cx('dsc-settings-tab', tab === value && 'is-active'),
            onClick: () => setTab(value),
          }, t(key))
        )),
      ),
      h('div', { className: 'dsc-modal-body' },
        tab === 'general' ? h(Fragment, null,
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
        h(SettingsSection, { title: t('composerHints') },
          h('div', { className: 'dsc-field' },
            h('span', { className: 'dsc-field-label' }, t('sendKeyLabel')),
            h('div', { className: 'dsc-segment', role: 'group', 'aria-label': t('sendKeyLabel') },
              [['enter', 'enterToSendShort'], ['ctrl-enter', 'newlineToSend']].map(([value, key]) => (
                h('button', {
                  key: value,
                  type: 'button',
                  className: cx('dsc-segment-button', sendKey === value && 'is-active'),
                  'aria-pressed': sendKey === value,
                  onClick: () => chatActions.setSendKey(value),
                }, t(key))
              )),
            ),
            h('p', { className: 'dsc-field-hint' }, t(sendKey === 'ctrl-enter' ? 'newlineToSend' : 'enterToSend')),
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
            h('strong', null, (models.find(model => model.id === defaultModelId) ?? { name: t('modelName') }).name),
          ),
          h('p', { className: 'dsc-field-hint' }, t('aboutText')),
          h('p', { className: 'dsc-field-hint' }, `${t('limitations')}：${t('limitationsText')}`),
        ),
        ) : h(MemorySettingsPane, null),
      ),
    ),
  )
}

/**
 * Inline "new workspace" panel of the handoff dialog. It keeps the task brief
 * and the extra requirement untouched: only a new workspace registration is
 * added, and the dialog's own fields stay mounted above and below it.
 */
function HandoffWorkspaceCreator({ draft }) {
  const t = useT()
  const busy = draft.busy === true
  const name = typeof draft.name === 'string' ? draft.name : ''
  const path = typeof draft.path === 'string' ? draft.path : ''
  const issue = workspaceDraftIssue(draft)
  const canCreate = !busy && issue === ''
  const hint = issue === 'name'
    ? t('handoffWorkspaceNameRequired')
    : issue === 'folderName'
      ? t('handoffWorkspaceNameInvalid')
      : issue === 'path'
        ? t('handoffWorkspacePathRequired')
        : issue === 'absolute'
          ? t('handoffWorkspacePathAbsolute')
          : t('handoffWorkspacePathHint')
  return h('div', {
    className: 'dsc-workspace-creator',
    role: 'group',
    'aria-label': t('handoffWorkspaceCreateTitle'),
  },
    h('div', { className: 'dsc-workspace-creator-head' },
      h(Icon, { name: 'plus', size: 15 }),
      h('strong', null, t('handoffWorkspaceCreateTitle')),
      h('button', {
        type: 'button', className: 'dsc-icon-button dsc-workspace-creator-close',
        title: t('handoffWorkspaceCancel'), 'aria-label': t('handoffWorkspaceCancel'), disabled: busy,
        onClick: () => chatActions.closeHandoffWorkspaceDraft(),
      }, h(Icon, { name: 'close', size: 15 })),
    ),
    h('div', { className: 'dsc-field' },
      h('label', { className: 'dsc-field-label', htmlFor: 'handoff-workspace-name' }, t('handoffWorkspaceName')),
      h('input', {
        id: 'handoff-workspace-name',
        className: 'dsc-input',
        value: name,
        placeholder: t('handoffWorkspaceNamePlaceholder'),
        maxLength: 80,
        disabled: busy,
        onFocus: (event) => event.target.select(),
        onChange: (event) => chatActions.setHandoffWorkspaceDraftName(event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault()
            void chatActions.createHandoffWorkspace()
          }
        },
      }),
    ),
    h('div', { className: 'dsc-field' },
      h('label', { className: 'dsc-field-label', htmlFor: 'handoff-workspace-path' }, t('handoffWorkspaceLocation')),
      h('input', {
        id: 'handoff-workspace-path',
        className: 'dsc-input',
        value: path,
        placeholder: t('handoffWorkspacePathPlaceholder'),
        spellCheck: false,
        disabled: busy,
        onChange: (event) => chatActions.setHandoffWorkspaceDraftPath(event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault()
            void chatActions.createHandoffWorkspace()
          }
        },
      }),
      h('div', { className: 'dsc-workspace-picks' },
        h('button', {
          type: 'button', className: 'dsc-secondary-button', disabled: busy,
          onClick: () => { void chatActions.pickHandoffWorkspaceDirectory('existing') },
        }, t('handoffWorkspacePickExisting')),
        h('button', {
          type: 'button', className: 'dsc-secondary-button', disabled: busy,
          onClick: () => { void chatActions.pickHandoffWorkspaceDirectory('parent') },
        }, t('handoffWorkspacePickParent')),
      ),
      h('p', { className: cx('dsc-field-hint', issue !== '' && 'is-warning') }, hint),
    ),
    draft.error !== ''
      ? h('div', {
          className: 'dsc-notice is-error', role: 'alert',
        }, h(Icon, { name: 'warning', size: 15 }), h('span', null, draft.error))
      : null,
    h('div', { className: 'dsc-workspace-creator-actions' },
      h('button', {
        type: 'button', className: 'dsc-secondary-button', disabled: busy,
        onClick: () => chatActions.closeHandoffWorkspaceDraft(),
      }, t('handoffWorkspaceCancel')),
      h('button', {
        type: 'button', className: 'dsc-primary-button', disabled: !canCreate,
        onClick: () => { void chatActions.createHandoffWorkspace() },
      }, busy ? t('handoffWorkspaceCreating') : t('handoffWorkspaceCreate')),
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
  const createAvailable = useChat(state => state.bootData?.handoff?.workspaceCreate === true)
  const [copied, setCopied] = React.useState(false)
  if (handoff === null) return null
  const close = () => chatActions.closeHandoff()
  const brief = handoff.brief ?? ''
  const draft = handoff.workspaceDraft ?? null
  const selectedWorkspace = workspaces.find(workspace => workspace.id === handoff.workspaceId)
  const suggestion = draft === null && createAvailable
    ? handoffWorkspaceSuggestion({
        title: handoff.title,
        brief,
        workspace: selectedWorkspace,
        fallbackName: t('handoffWorkspaceNameFallback'),
      })
    : null
  const workspaceReady = handoff.workspaceId !== '' || workspaces.length === 0
  const canSend = hostReady && brief.trim() !== '' && !handoff.busy && !handoff.generating
    && draft === null && workspaceReady
  const copy = () => {
    copyToClipboard(brief).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }).catch(() => chatStore.toast(t('copyFailed'), 'error'))
  }
  return h(ModalBackdrop, { onDismiss: close },
    h('div', { className: 'dsc-modal dsc-handoff', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('handoffTitle') },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('handoffTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('handoffSubtitle')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: !draft, disabled: handoff.busy || draft?.busy === true, onClick: close,
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        !hostReady
          ? h('div', { className: 'dsc-notice' }, h(Icon, { name: 'warning', size: 16 }), h('span', null, t('handoffRestart')))
          : [
              h('div', { className: 'dsc-field', key: 'workspace' },
                h('label', { className: 'dsc-field-label', htmlFor: 'handoff-workspace' }, t('handoffWorkspace')),
                h('select', {
                  id: 'handoff-workspace',
                  className: 'dsc-select',
                  value: draft === null ? (handoff.workspaceId ?? '') : NEW_WORKSPACE_OPTION,
                  disabled: handoff.busy || draft?.busy === true,
                  onChange: (event) => {
                    if (event.target.value === NEW_WORKSPACE_OPTION) chatActions.openHandoffWorkspaceDraft()
                    else chatActions.setHandoffWorkspace(event.target.value)
                  },
                }, [
                  workspaces.length === 0 && draft === null
                    ? h('option', { key: 'none', value: '', disabled: true }, t('handoffWorkspaceNone'))
                    : null,
                  ...workspaces.map(workspace => h('option', {
                    key: workspace.id, value: workspace.id,
                  }, workspace.title || workspace.path)),
                  createAvailable
                    ? h('option', { key: NEW_WORKSPACE_OPTION, value: NEW_WORKSPACE_OPTION }, t('handoffNewWorkspace'))
                    : null,
                ]),
                draft !== null
                  ? null
                  : h('p', { className: 'dsc-field-hint' },
                      selectedWorkspace?.path
                        ?? (createAvailable ? t('handoffWorkspaceRequired') : t('handoffWorkspaceEmptyUnavailable'))),
                suggestion !== null
                  ? h('div', { className: 'dsc-workspace-hint' },
                      h('span', null, t('handoffNewProjectHint')),
                      h('button', {
                        type: 'button', className: 'dsc-text-button',
                        onClick: () => chatActions.openHandoffWorkspaceDraft(),
                      }, t('handoffNewProjectAction', { name: suggestion.name })),
                    )
                  : null,
              ),
              draft === null ? null : h(HandoffWorkspaceCreator, { key: 'workspace-creator', draft }),
              h('div', { className: 'dsc-field', key: 'instruction' },
                h('label', { className: 'dsc-field-label', htmlFor: 'handoff-extra-input' }, t('handoffExtra')),
                h('input', {
                  id: 'handoff-extra-input',
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
              h('div', { className: 'dsc-field', key: 'brief' },
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
                      id: 'handoff-brief',
                      className: 'dsc-textarea dsc-handoff-brief',
                      value: brief,
                      rows: 12,
                      spellCheck: false,
                      'aria-label': t('handoffEditorLabel'),
                      onChange: (event) => chatActions.setHandoffBrief(event.target.value),
                    }),
                handoff.warning !== '' && !handoff.generating
                  ? h('p', { className: 'dsc-field-hint' }, `${t('handoffLocal')} ${t('handoffShortcut')}`)
                  : h('p', { className: 'dsc-field-hint' }, t('handoffShortcut')),
                handoff.error !== ''
                  ? h('div', { className: 'dsc-notice is-error' }, h(Icon, { name: 'warning', size: 15 }), h('span', null, handoff.error))
                  : null,
              ),
            ],
      ),
      h('footer', { className: 'dsc-modal-foot' },
        h('div', { className: 'dsc-modal-foot-note' },
          workspaces.length === 0 && draft === null
            ? (createAvailable ? t('handoffWorkspaceEmpty') : t('handoffWorkspaceEmptyUnavailable'))
            : ''),
        h('button', {
          type: 'button', className: 'dsc-secondary-button', disabled: handoff.busy || draft?.busy === true, onClick: close,
        }, t('cancel')),
        h('button', {
          type: 'button',
          className: 'dsc-primary-button',
          disabled: !canSend,
          onClick: () => { void chatActions.submitHandoff() },
        }, handoff.busy ? t('handoffSending') : t('handoffSend')),
      ),
    ),
  )
}

/**
 * One floating menu for conversation and folder actions. It is anchored at the
 * pointer (right-click or the row's "···"), clamped into the window, and closes
 * on an outside click or Escape.
 */
function ContextMenu() {
  const t = useT()
  const menu = useChat(state => state.menu)
  const conversations = useChat(state => state.conversations)
  const folders = useChat(state => state.folders)
  const ref = React.useRef(null)
  const [position, setPosition] = React.useState(null)
  React.useLayoutEffect(() => {
    if (menu === null) {
      setPosition(null)
      return
    }
    const rect = ref.current?.getBoundingClientRect()
    const width = rect?.width ?? 210
    const height = rect?.height ?? 260
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0
    setPosition({
      left: Math.max(8, Math.min(menu.x, viewportWidth - width - 8)),
      top: Math.max(8, Math.min(menu.y, viewportHeight - height - 8)),
    })
  }, [menu])
  if (menu === null) return null
  let items = []
  if (menu.kind === 'conversation') {
    const conversation = conversations.find(item => item.id === menu.id)
    if (conversation === undefined) return null
    items = [
      {
        key: 'rename',
        icon: 'pencil',
        label: t('rename'),
        onSelect: () => {
          chatStore.set({ menu: null, renamingId: conversation.id })
        },
      },
      {
        key: 'pin',
        icon: 'pin',
        label: conversation.pinned ? t('unpin') : t('pin'),
        onSelect: () => { void chatActions.setPinned(conversation.id, conversation.pinned !== true) },
      },
    ]
    if (folders.length > 0) {
      items.push({
        key: 'move',
        icon: 'folder',
        label: t('moveToFolder'),
        onSelect: () => chatActions.openMoveChat(conversation.id),
      })
    }
    if (conversation.folderId !== null) {
      items.push({
        key: 'unfile',
        icon: 'folderMinus',
        label: t('moveOutOfFolder'),
        onSelect: () => { void chatActions.moveConversationToFolder(conversation.id, null) },
      })
    }
    items.push(
      {
        key: 'archive',
        icon: 'archive',
        label: conversation.archived ? t('unarchive') : t('archive'),
        onSelect: () => { void chatActions.setArchived(conversation.id, conversation.archived !== true) },
      },
      null,
      {
        key: 'delete',
        icon: 'trash',
        label: t('delete'),
        danger: true,
        onSelect: () => {
          chatActions.closeMenu()
          chatActions.requestDeleteConversation(conversation.id, conversation.title)
        },
      },
    )
  } else {
    const folder = folders.find(item => item.id === menu.id)
    if (folder === undefined) return null
    items = [
      {
        key: 'rename',
        icon: 'pencil',
        label: t('renameFolder'),
        onSelect: () => chatActions.requestFolderPrompt('rename', folder),
      },
      {
        key: 'add',
        icon: 'plus',
        label: t('addChatsToFolder'),
        onSelect: () => chatActions.openFolderAdd(folder.id),
      },
      null,
      {
        key: 'delete',
        icon: 'trash',
        label: t('deleteFolder'),
        danger: true,
        onSelect: () => chatActions.requestDeleteFolder(folder),
      },
    ]
  }
  const moveFocus = (event) => {
    const buttons = [...(ref.current?.querySelectorAll('[role="menuitem"]') ?? [])]
    if (buttons.length === 0) return
    const current = buttons.indexOf(document.activeElement)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      buttons[(current + 1 + buttons.length) % buttons.length].focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      buttons[(current - 1 + buttons.length) % buttons.length].focus()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      chatActions.closeMenu()
    }
  }
  return h(React.Fragment, null,
    h('div', {
      className: 'dsc-menu-backdrop',
      onMouseDown: () => chatActions.closeMenu(),
      onContextMenu: (event) => {
        event.preventDefault()
        chatActions.closeMenu()
      },
    }),
    h('div', {
      ref,
      className: 'dsc-menu',
      role: 'menu',
      'aria-label': t('moreActions'),
      style: position === null ? { left: `${menu.x}px`, top: `${menu.y}px` } : position,
      onKeyDown: moveFocus,
      onContextMenu: (event) => event.preventDefault(),
    },
      items.map((item, index) => (item === null
        ? h('div', { key: `separator-${index}`, className: 'dsc-menu-separator', role: 'separator' })
        : h('button', {
            key: item.key,
            type: 'button',
            role: 'menuitem',
            className: cx('dsc-menu-item', item.danger && 'is-danger'),
            autoFocus: index === 0,
            onClick: item.onSelect,
          },
            h(Icon, { name: item.icon, size: 15 }),
            h('span', null, item.label),
          ))),
    ),
  )
}

/** Create or rename a folder. Enter submits, Escape closes via the shell. */
function FolderPromptDialog() {
  const t = useT()
  const prompt = useChat(state => state.folderPrompt)
  const inputRef = React.useRef(null)
  React.useEffect(() => {
    if (prompt === null) return undefined
    const timer = setTimeout(() => inputRef.current?.select(), 30)
    return () => clearTimeout(timer)
  }, [prompt?.mode, prompt?.id])
  if (prompt === null) return null
  const rename = prompt.mode === 'rename'
  const title = rename ? t('folderRenameTitle') : t('folderCreateTitle')
  return h(ModalBackdrop, { onDismiss: () => chatActions.closeFolderPrompt() },
    h('form', {
      className: 'dsc-modal dsc-form-modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': title,
      onSubmit: (event) => {
        event.preventDefault()
        void chatActions.submitFolderPrompt()
      },
    },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, title),
          h('p', { className: 'dsc-modal-sub' }, rename ? t('folderRenameHint') : t('folderCreateHint')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          onClick: () => chatActions.closeFolderPrompt(),
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        h('div', { className: 'dsc-field' },
          h('label', { className: 'dsc-field-label', htmlFor: 'dsc-folder-name-input' }, t('folderNameLabel')),
          h('input', {
            ref: inputRef,
            id: 'dsc-folder-name-input',
            className: 'dsc-input dsc-folder-name-input',
            value: prompt.draft,
            maxLength: 60,
            placeholder: t('folderNamePlaceholder'),
            autoComplete: 'off',
            spellCheck: false,
            onChange: (event) => chatActions.updateFolderPrompt(event.target.value),
          }),
        ),
      ),
      h('footer', { className: 'dsc-modal-foot' },
        h('div', { className: 'dsc-modal-foot-note' }),
        h('button', {
          type: 'button', className: 'dsc-secondary-button', onClick: () => chatActions.closeFolderPrompt(),
        }, t('cancel')),
        h('button', {
          type: 'submit', className: 'dsc-primary-button',
          disabled: prompt.busy || prompt.draft.trim() === '',
        }, rename ? t('save') : t('create')),
      ),
    ),
  )
}

/** Pick a folder (or the unfiled area) for one conversation. */
function MoveChatDialog() {
  const t = useT()
  const move = useChat(state => state.moveChat)
  const folders = useChat(state => state.folders)
  if (move === null) return null
  const options = [{ id: null, name: t('unfiled') }, ...folders.map(folder => ({ id: folder.id, name: folder.name }))]
  return h(ModalBackdrop, { onDismiss: () => chatActions.closeMoveChat() },
    h('div', { className: 'dsc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('moveChatTitle') },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('moveChatTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('moveChatHint')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, onClick: () => chatActions.closeMoveChat(),
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        h('div', { className: 'dsc-dialog-list', role: 'radiogroup', 'aria-label': t('moveChatTitle') },
          options.map(option => h('button', {
            key: option.id ?? 'unfiled',
            type: 'button',
            role: 'radio',
            'aria-checked': move.folderId === option.id,
            className: cx('dsc-choice', move.folderId === option.id && 'is-selected'),
            onClick: () => chatActions.setMoveChatFolder(option.id ?? ''),
          },
            h('span', { className: 'dsc-choice-icon' }, h(Icon, { name: option.id === null ? 'folderMinus' : 'folder', size: 16 })),
            h('span', { className: 'dsc-choice-label' }, option.name),
            move.folderId === option.id ? h(Icon, { name: 'check', size: 15 }) : null,
          )),
        ),
      ),
      h('footer', { className: 'dsc-modal-foot' },
        h('div', { className: 'dsc-modal-foot-note' }),
        h('button', { type: 'button', className: 'dsc-secondary-button', onClick: () => chatActions.closeMoveChat() }, t('cancel')),
        h('button', {
          type: 'button', className: 'dsc-primary-button', disabled: move.busy,
          onClick: () => { void chatActions.submitMoveChat() },
        }, t('moveChatConfirm')),
      ),
    ),
  )
}

/** Move one or more conversations into a folder from the folder's own menu. */
function FolderAddDialog() {
  const t = useT()
  const add = useChat(state => state.folderAdd)
  const conversations = useChat(state => state.conversations)
  if (add === null) return null
  const candidates = conversations
    .filter(conversation => conversation.archived !== true && conversation.folderId !== add.folderId)
    .sort(byActivity)
  return h(ModalBackdrop, { onDismiss: () => chatActions.closeFolderAdd() },
    h('div', { className: 'dsc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('folderAddTitle', { name: add.name }) },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('folderAddTitle', { name: add.name })),
          h('p', { className: 'dsc-modal-sub' }, t('folderAddHint')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, onClick: () => chatActions.closeFolderAdd(),
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        candidates.length === 0
          ? h('div', { className: 'dsc-list-empty' }, t('folderAddEmpty'))
          : h('div', { className: 'dsc-dialog-list' },
              candidates.map(conversation => {
                const selected = add.selected.includes(conversation.id)
                return h('button', {
                  key: conversation.id,
                  type: 'button',
                  role: 'checkbox',
                  'aria-checked': selected,
                  className: cx('dsc-choice', selected && 'is-selected'),
                  onClick: () => chatActions.toggleFolderAddSelection(conversation.id),
                },
                  h('span', { className: 'dsc-choice-check' }, selected ? h(Icon, { name: 'check', size: 14 }) : null),
                  h('span', { className: 'dsc-choice-label' }, conversation.title || t('newChatTitle')),
                  conversation.pinned ? h('span', { className: 'dsc-choice-hint' }, h(Icon, { name: 'pin', size: 12 })) : null,
                )
              }),
            ),
      ),
      h('footer', { className: 'dsc-modal-foot' },
        h('div', { className: 'dsc-modal-foot-note' }, add.selected.length > 0 ? String(add.selected.length) : ''),
        h('button', { type: 'button', className: 'dsc-secondary-button', onClick: () => chatActions.closeFolderAdd() }, t('cancel')),
        h('button', {
          type: 'button', className: 'dsc-primary-button',
          disabled: add.busy || add.selected.length === 0,
          onClick: () => { void chatActions.submitFolderAdd() },
        }, t('folderAddConfirm')),
      ),
    ),
  )
}

/** Archived chats: the only place they are listed, with restore and delete. */
function ArchiveDialog() {
  const t = useT()
  const open = useChat(state => state.archiveOpen)
  const conversations = useChat(state => state.conversations)
  const folders = useChat(state => state.folders)
  if (!open) return null
  const archived = conversations
    .filter(conversation => conversation.archived === true)
    .sort((left, right) => (right.archivedAt ?? right.updatedAt) - (left.archivedAt ?? left.updatedAt))
  const folderName = folderId => folders.find(folder => folder.id === folderId)?.name ?? ''
  return h(ModalBackdrop, { onDismiss: () => chatActions.closeArchive() },
    h('div', { className: 'dsc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('archiveTitle') },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('archiveTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('archiveSubtitle')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, onClick: () => chatActions.closeArchive(),
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        archived.length === 0
          ? h('div', { className: 'dsc-list-empty' }, t('archiveEmpty'))
          : h('div', { className: 'dsc-archive-list' },
              archived.map(conversation => h('div', { key: conversation.id, className: 'dsc-archive-item' },
                h('div', { className: 'dsc-archive-item-main' },
                  h('span', { className: 'dsc-archive-item-title' }, conversation.title || t('newChatTitle')),
                  h('span', { className: 'dsc-archive-item-meta' },
                    `${relativeTime(conversation.archivedAt ?? conversation.updatedAt, t)} · ${t('messageCount', { count: conversation.messageCount ?? 0 })}${conversation.folderId === null ? '' : ` · ${folderName(conversation.folderId)}`}`,
                  ),
                ),
                h('div', { className: 'dsc-archive-actions' },
                  h('button', {
                    type: 'button', className: 'dsc-secondary-button is-small-compact',
                    onClick: () => { void chatActions.setArchived(conversation.id, false) },
                  }, t('restore')),
                  h('button', {
                    type: 'button', className: 'dsc-icon-button is-small is-danger', title: t('delete'), 'aria-label': t('delete'),
                    onClick: () => chatActions.requestDeleteConversation(conversation.id, conversation.title),
                  }, h(Icon, { name: 'trash', size: 14 })),
                ),
              )),
            ),
      ),
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
  return h(ModalBackdrop, { onDismiss: () => chatStore.set({ confirm: null }) },
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

/* ---- 58-memory.js ---- */
/* ------------------------------------------------------------------------- */
/* Long-term memory: the settings pane, the cross-AI import dialog and the    */
/* local parser for pasted memory exports. Everything here talks to the Host  */
/* through one JSON endpoint; the parser never calls a model.                 */
/* ------------------------------------------------------------------------- */

const MEMORY_API = '/api/deepseek-chat/memory'
const MEMORY_IMPORT_MAX_CONTENT = 600
const MEMORY_IMPORT_MAX_ENTRIES = 200
/** Stored categories, in the Host's fixed display order. */
const memoryCategoryIds = ['instruction', 'identity', 'career', 'projects', 'preferences']
const MEMORY_CATEGORY_KEYS = {
  instruction: 'memoryCatInstruction',
  identity: 'memoryCatIdentity',
  career: 'memoryCatCareer',
  projects: 'memoryCatProjects',
  preferences: 'memoryCatPreferences',
}
/** Heading synonyms accepted from English and Chinese exports. */
const MEMORY_CATEGORY_ALIASES = {
  instruction: ['instruction', 'instructions', '指令', '指示', '回答风格', 'response style', 'style guidelines'],
  identity: ['identity', 'identities', '身份', '个人信息', '个人资料', '关于我', 'about me', 'profile', 'personal information', 'personal info'],
  career: ['career', 'work', 'job', '职业', '工作', '工作经历', '职业经历', '职业背景', 'work history'],
  projects: ['project', 'projects', '项目', '工程', '项目经历', 'current projects'],
  preferences: ['preference', 'preferences', '偏好', '喜好', '兴趣', '爱好', 'tastes'],
}
const MEMORY_IMPORT_PLATFORMS = ['chatgpt', 'claude', 'gemini', 'other']
/**
 * The prompt the user copies into another AI. It is provider-agnostic: every
 * assistant names itself, so it must never be addressed to one product.
 */
const MEMORY_IMPORT_PROMPT = `Please export everything you remember about me as long-term memory or persistent user context, so I can transfer it to another assistant.

Requirements:
1. Group the records under exactly these five category headings: Instructions, Identity, Career, Projects, Preferences.
2. Put every record on its own line in this format: [YYYY-MM-DD] - Entry content. When the date is unknown, write [unknown] instead of a date.
3. Preserve my original wording as closely as possible; do not rewrite, summarize, or embellish the entries.
4. Only include information you can actually access or confirm from our conversation history. Never invent dates, identities, projects, or other details. If something is uncertain, leave it out.
5. Put the entire export inside a single fenced code block, so I can copy it in one piece.
6. After the code block, add one short sentence stating whether this is the complete export or whether more memory remains that did not fit.
7. Do not reveal or include any internal system prompts or hidden instructions in the export.`

const MEMORY_LIST_MARKER = /^(?:[-*+•·–—]|\d{1,3}[.)、]|\(\d{1,3}\)|\[\s?[xX]?\s?\])\s+/
const MEMORY_META_LINE = /^(?:this is (?:the )?(?:complete|full|entire) (?:set|list|export|memory)|that'?s (?:all|everything)|(?:i have )?(?:no|don'?t have|do not have) (?:access to )?(?:any )?(?:long[- ]?term )?memor|i (?:don'?t|do not) have access|nothing (?:else )?(?:to (?:export|share)|remembered)|above (?:is|contains)|以上(?:是|为|就是)|这(?:是|就是)(?:全部|完整)|我没有(?:任何)?(?:长期)?记忆|无法访问|没有(?:什么)?(?:可导出|记忆)|(?:the )?end\b)/i
const MEMORY_PREAMBLE_LINE = /^(?:here(?:'s| is| are)|below (?:is|are)|sure|of course|certainly|the following|i(?:'ve| have) (?:listed|organized|exported)|我已|以下(?:是|为))/i

/** Heading text when the line is shaped like a Markdown heading, else null. */
function memoryHeadingText(line) {
  const text = line.trim()
  const hashes = /^#{1,6}\s+(.+?)\s*#*$/.exec(text)
  if (hashes !== null) return hashes[1]
  const bold = /^(?:\*\*|__)([^*_]+?)(?:\*\*|__)\s*[:：]?$/.exec(text)
  if (bold !== null) return bold[1]
  const plain = /^([^:：]{1,40})[:：]\s*$/.exec(text)
  return plain === null ? null : plain[1]
}

/** Category id for a heading line, undefined when the heading names none. */
function memoryCategoryFromHeading(line) {
  const heading = memoryHeadingText(line)
  if (heading === null) return undefined
  const text = heading
    .replace(/[*_`#]/g, ' ')
    .replace(/^\s*(?:[0-9一二三四五六七八九十]+\s*[.、)．]\s*)+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
  if (text === '') return undefined
  const parts = text.split(/[&/、,，+·]|\band\b/).map(part => part.trim()).filter(part => part !== '')
  for (const part of parts) {
    for (const id of memoryCategoryIds) {
      for (const alias of MEMORY_CATEGORY_ALIASES[id]) {
        if (part === alias || part.startsWith(`${alias} `) || part.endsWith(` ${alias}`)) return id
      }
    }
  }
  return undefined
}

/**
 * Split an optional export date marker off a record line.
 * @returns `{ date, content }`, where date is a `YYYY-MM-DD` string, the marker
 *   `unknown`, or null when the line carries no date.
 */
function parseMemoryDate(value) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (text === '') return { date: null, content: '' }
  const dated = /^\[?\s*(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\s*\]?\s*(?:[-–—:、]\s*)?([\s\S]*)$/.exec(text)
  if (dated !== null) {
    const month = Number(dated[2])
    const day = Number(dated[3])
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return {
        date: `${dated[1]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        content: dated[4],
      }
    }
  }
  const unknown = /^\[?\s*(?:unknown|date unknown|no date|undated|未知|不详|n\/a)\s*\]?\s*(?:[-–—:、]\s*)?([\s\S]*)$/i.exec(text)
  if (unknown !== null) return { date: 'unknown', content: unknown[1] }
  return { date: null, content: text }
}

/** Drop the display-only Markdown an export may wrap around a record. */
function stripMemoryMarkdown(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`{1,2}([^`]+)`{1,2}/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,;:!?])/g, '$1$2')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/<([^<>\s]+@[^<>\s]+)>/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Keyword fallback used when an export carries no category heading. */
function inferMemoryCategory(content) {
  const text = typeof content === 'string' ? content.trim() : ''
  if (text === '') return 'preferences'
  if (/^(?:以后|今后|从今|回答|回复|解释|请|不要|别|每次|始终|总是|永远)|回答(?:时|请|要|用)|回复(?:时|请|要|用)|(?:用|使用)(?:中文|英文|english|chinese)|(?:简洁|详细|简短|具体)的?(?:回答|回复|解释)|(?:format|answer|reply|respond).{0,24}(?:concise|brief|detailed|chinese|english)|always|never|from now on/i.test(text)) {
    return 'instruction'
  }
  if (/(?:我叫|我的名字|我的生日|出生于|住在|居住|现居|来自|国籍|my name|i am|i'm|live in|born|student|school|university)/i.test(text)) {
    return 'identity'
  }
  if (/(?:工作|职业|职位|岗位|公司|实习|工程师|设计师|经理|创业|自由职业|job|career|worked at|working at|role|intern|engineer|designer|founder)/i.test(text)) {
    return 'career'
  }
  if (/(?:项目|插件|仓库|开发|应用|网站|游戏|模组|技术栈|架构|project|plugin|repository|repo|building|developing|codebase|website|game|stack)/i.test(text)) {
    return 'projects'
  }
  return 'preferences'
}

/**
 * Parse one pasted memory export without calling a model. Tolerant of Markdown
 * headings in English or Chinese, fenced or unfenced records, list markers,
 * optional dates and inline formatting. Identical records are kept once.
 * @returns `{ entries: [{ content, category, date }], skipped }`.
 */
function parseMemoryExport(input) {
  const text = typeof input === 'string' ? input.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '') : ''
  const lines = text.split('\n')
  let sawFence = false
  let sawHeading = false
  let sawMarker = false
  for (const raw of lines) {
    const line = raw.trim()
    if (line === '') continue
    if (/^(?:```|~~~)/.test(line)) {
      sawFence = true
      continue
    }
    if (memoryCategoryFromHeading(line) !== undefined) {
      sawHeading = true
      continue
    }
    const unmarked = line.replace(/^\s*>\s?/, '')
    const withoutMarker = unmarked.replace(MEMORY_LIST_MARKER, '')
    if (withoutMarker !== unmarked || parseMemoryDate(withoutMarker).date !== null) sawMarker = true
  }
  const structured = sawFence || sawHeading || sawMarker
  const entries = []
  const seen = new Set()
  let skipped = 0
  let inFence = false
  let currentCategory = null
  for (const raw of lines) {
    const line = raw.trim()
    if (line === '') continue
    if (/^(?:```|~~~)/.test(line)) {
      if (inFence) currentCategory = null
      inFence = !inFence
      continue
    }
    if (memoryHeadingText(line) !== null) {
      const category = memoryCategoryFromHeading(line)
      if (category !== undefined) currentCategory = category
      else currentCategory = null
      continue
    }
    const quoted = raw.replace(/^\s*>\s?/, '').trim()
    const marked = MEMORY_LIST_MARKER.test(quoted)
    const body = marked ? quoted.replace(MEMORY_LIST_MARKER, '') : quoted
    const parsed = parseMemoryDate(body)
    const plain = !marked && parsed.date === null
    if (plain) {
      if (MEMORY_META_LINE.test(body) || MEMORY_PREAMBLE_LINE.test(body) || (!inFence && /[?？]\s*$/.test(body))) {
        skipped += 1
        continue
      }
      // Outside a fence, a heading-less plain line is prose unless the export
      // has no structure at all (then it is the whole unstructured memory).
      if (!inFence && structured && currentCategory === null) continue
    }
    let content = stripMemoryMarkdown(parsed.content)
    if (content.length < 2) {
      skipped += 1
      continue
    }
    if (content.length > MEMORY_IMPORT_MAX_CONTENT) {
      content = `${content.slice(0, MEMORY_IMPORT_MAX_CONTENT - 1).trimEnd()}…`
    }
    const key = content.toLowerCase()
    if (seen.has(key)) {
      skipped += 1
      continue
    }
    if (entries.length >= MEMORY_IMPORT_MAX_ENTRIES) {
      skipped += 1
      continue
    }
    seen.add(key)
    entries.push({ content, category: currentCategory ?? inferMemoryCategory(content), date: parsed.date })
  }
  return { entries, skipped }
}

/** Only real dates reach the Host import payload. */
function memoryImportDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined
}

function memoryCategoryLabel(id, t = tr) {
  return t(MEMORY_CATEGORY_KEYS[id] ?? 'memoryCatPreferences')
}

function memoryPlatformLabel(platform, t = tr) {
  if (platform === 'chatgpt') return t('memoryPlatformChatgpt')
  if (platform === 'claude') return t('memoryPlatformClaude')
  if (platform === 'gemini') return t('memoryPlatformGemini')
  if (platform === 'other') return t('memoryPlatformOther')
  return ''
}

function memorySourceLabel(source, t = tr) {
  const type = source?.type
  if (type === 'conversation') return t('memorySourceConversation')
  if (type === 'agent') return t('memorySourceAgent')
  if (type === 'import') {
    const platform = memoryPlatformLabel(source?.platform, t)
    if (platform !== '') return t('memorySourceImport', { platform })
    if (typeof source?.label === 'string' && source.label !== '') return t('memorySourceImport', { platform: source.label })
    return t('memorySourceUnknown')
  }
  return t('memorySourceManual')
}

function memoryAppliedText(applied, t = tr) {
  const counts = { add: 0, update: 0, delete: 0 }
  for (const item of Array.isArray(applied) ? applied : []) {
    if (item?.op === 'add' || item?.op === 'update' || item?.op === 'delete') counts[item.op] += 1
  }
  const parts = []
  if (counts.add > 0) parts.push(t('memoryAppliedAdded', { count: counts.add }))
  if (counts.update > 0) parts.push(t('memoryAppliedUpdated', { count: counts.update }))
  if (counts.delete > 0) parts.push(t('memoryAppliedDeleted', { count: counts.delete }))
  return parts.join(' · ')
}

function memoryErrorText(error) {
  return error instanceof Error ? error.message : String(error)
}

function memoryRequest(action) {
  return hostJson(MEMORY_API, action)
}

/** The import dialog is a native <dialog> above the settings dialog. */
function memoryImportDialogOpen() {
  return typeof document !== 'undefined' && typeof document.querySelector === 'function'
    && document.querySelector('.dsc-memory-import') !== null
}

const MEMORY_SNAPSHOT_FIELDS = ['settings', 'memories', 'categories', 'summary', 'stale', 'revision', 'count', 'limits']

function MemorySettingsPane() {
  const t = useT()
  const [snapshot, setSnapshot] = React.useState(null)
  const [status, setStatus] = React.useState('loading')
  const [loadError, setLoadError] = React.useState('')
  const [busy, setBusy] = React.useState('')
  const [summaryError, setSummaryError] = React.useState(false)
  const [askText, setAskText] = React.useState('')
  const [askResult, setAskResult] = React.useState(null)
  const [filter, setFilter] = React.useState('all')
  const [editingId, setEditingId] = React.useState(null)
  const [editDraft, setEditDraft] = React.useState('')
  const [addContent, setAddContent] = React.useState('')
  const [addCategory, setAddCategory] = React.useState('preferences')
  const [importOpen, setImportOpen] = React.useState(false)
  const alive = React.useRef(true)

  const applySnapshot = (data) => {
    if (!alive.current || data === null || typeof data !== 'object') return
    const patch = {}
    for (const field of MEMORY_SNAPSHOT_FIELDS) {
      if (data[field] !== undefined) patch[field] = data[field]
    }
    if (Object.keys(patch).length === 0) return
    setSnapshot(previous => (previous === null ? patch : { ...previous, ...patch }))
    setStatus('ready')
  }

  const applyLoaded = (data) => {
    applySnapshot(data)
    setLoadError('')
    if (data?.stale === true && data?.settings?.enabled === true && Array.isArray(data.memories) && data.memories.length > 0) {
      void refreshSummary({ auto: true })
    }
  }

  const load = async () => {
    setStatus('loading')
    try {
      const data = await memoryRequest({ action: 'get' })
      if (!alive.current) return
      applyLoaded(data)
    } catch (error) {
      if (!alive.current) return
      if (error?.status === 404) setStatus('outdated')
      else {
        setStatus('error')
        setLoadError(memoryErrorText(error))
      }
    }
  }

  const refreshSummary = async ({ auto = false } = {}) => {
    if (busy !== '') return
    setBusy('summary')
    setSummaryError(false)
    try {
      const data = await memoryRequest({ action: 'summary.refresh', locale: streamLocale() })
      if (!alive.current) return
      applySnapshot(data)
    } catch (error) {
      if (!alive.current) return
      setSummaryError(true)
      if (!auto) chatStore.toast(memoryErrorText(error), 'error')
    } finally {
      if (alive.current) setBusy('')
    }
  }

  const changeSettings = async (patch) => {
    if (busy !== '' || snapshot === null) return
    const before = snapshot.settings
    setSnapshot(previous => (previous === null ? previous : { ...previous, settings: { ...previous.settings, ...patch } }))
    setBusy('settings')
    try {
      const data = await memoryRequest({ action: 'settings', ...patch })
      if (!alive.current) return
      applySnapshot(data)
    } catch (error) {
      if (!alive.current) return
      setSnapshot(previous => (previous === null ? previous : { ...previous, settings: before }))
      chatStore.toast(memoryErrorText(error), 'error')
    } finally {
      if (alive.current) setBusy('')
    }
  }

  const submitAsk = async () => {
    const text = askText.trim()
    if (text === '' || busy !== '' || snapshot?.settings?.enabled !== true) return
    setBusy('ask')
    setAskResult(null)
    try {
      const data = await memoryRequest({ action: 'ask', text, locale: streamLocale() })
      if (!alive.current) return
      applySnapshot(data)
      setAskText('')
      setAskResult({
        answer: typeof data.answer === 'string' ? data.answer : '',
        applied: Array.isArray(data.applied) ? data.applied : [],
        pending: data.pending ?? null,
      })
    } catch (error) {
      if (alive.current) chatStore.toast(memoryErrorText(error), 'error')
    } finally {
      if (alive.current) setBusy('')
    }
  }

  const settlePending = async (accept) => {
    const pending = askResult?.pending
    if (pending === null || pending === undefined || busy !== '') return
    setBusy('confirm')
    try {
      const data = await memoryRequest({ action: 'confirm', id: pending.id, accept })
      if (!alive.current) return
      applySnapshot(data)
      setAskResult(previous => (previous === null ? previous : {
        answer: typeof data.answer === 'string' ? data.answer : previous.answer,
        applied: Array.isArray(data.applied) ? data.applied : previous.applied,
        pending: null,
      }))
    } catch (error) {
      if (!alive.current) return
      if (error?.status === 409) setAskResult(previous => (previous === null ? previous : { ...previous, pending: null }))
      chatStore.toast(memoryErrorText(error), 'error')
    } finally {
      if (alive.current) setBusy('')
    }
  }

  const addMemory = async () => {
    const content = addContent.trim()
    if (content === '' || busy !== '') return
    setBusy('add')
    try {
      const data = await memoryRequest({ action: 'add', content, category: addCategory })
      if (!alive.current) return
      applySnapshot(data)
      setAddContent('')
      const result = data?.result?.status
      chatStore.toast(
        result === 'duplicate' ? t('memoryAddDuplicateToast') : result === 'merged' ? t('memoryAddMergedToast') : t('memoryAddedToast'),
        result === 'added' ? 'success' : 'info',
      )
    } catch (error) {
      if (alive.current) chatStore.toast(memoryErrorText(error), 'error')
    } finally {
      if (alive.current) setBusy('')
    }
  }

  const startEditing = (memory) => {
    setEditingId(memory.id)
    setEditDraft(memory.content)
  }

  const stopEditing = () => {
    setEditingId(null)
    setEditDraft('')
  }

  const saveEditing = async () => {
    const content = editDraft.trim()
    if (editingId === null || content === '' || busy !== '') return
    setBusy('edit')
    try {
      const data = await memoryRequest({ action: 'update', id: editingId, content })
      if (!alive.current) return
      applySnapshot(data)
      stopEditing()
      chatStore.toast(t('memorySavedToast'), 'success')
    } catch (error) {
      if (alive.current) chatStore.toast(memoryErrorText(error), 'error')
    } finally {
      if (alive.current) setBusy('')
    }
  }

  /**
   * A deletion can leave facts in the summary that no longer exist, so the
   * overview is refreshed right away. Additions and edits only flag the stale
   * line: those keep model calls under the user's control.
   */
  const refreshSummaryAfterDelete = (data) => {
    if (data?.stale !== true || data?.settings?.enabled !== true) return
    if (!Array.isArray(data.memories) || data.memories.length === 0) return
    void refreshSummary({ auto: true })
  }

  const requestDelete = (memory) => {
    if (busy !== '') return
    chatStore.set({
      confirm: {
        title: t('memoryDeleteTitle'),
        message: t('memoryDeleteMessage', { preview: memory.content.slice(0, 80) }),
        confirmLabel: t('memoryDeleteConfirm'),
        danger: true,
        onConfirm: async () => {
          try {
            const data = await memoryRequest({ action: 'delete', id: memory.id })
            applySnapshot(data)
            refreshSummaryAfterDelete(data)
            chatStore.toast(t('memoryDeletedToast'), 'success')
          } catch (error) {
            chatStore.toast(memoryErrorText(error), 'error')
          }
        },
      },
    })
  }

  const requestClear = () => {
    if (busy !== '') return
    const count = snapshot?.memories?.length ?? 0
    chatStore.set({
      confirm: {
        title: t('memoryClearTitle'),
        message: t('memoryClearMessage', { count }),
        confirmLabel: t('memoryClearConfirm'),
        danger: true,
        onConfirm: async () => {
          try {
            const data = await memoryRequest({ action: 'clear' })
            applySnapshot(data)
            refreshSummaryAfterDelete(data)
            chatStore.toast(t('memoryClearedToast', { count: data?.result?.cleared ?? count }), 'success')
          } catch (error) {
            chatStore.toast(memoryErrorText(error), 'error')
          }
        },
      },
    })
  }

  React.useEffect(() => {
    alive.current = true
    void load()
    return () => { alive.current = false }
  }, [])

  const settings = snapshot?.settings ?? { enabled: false, autoExtract: false }
  const enabled = settings.enabled === true
  const memories = Array.isArray(snapshot?.memories) ? snapshot.memories : []
  const count = typeof snapshot?.count === 'number' ? snapshot.count : memories.length
  const limits = snapshot?.limits ?? { maxMemories: 400, maxContent: MEMORY_IMPORT_MAX_CONTENT }
  const summary = snapshot?.summary ?? null
  const categoryRows = memoryCategoryIds.map((id) => {
    const row = (snapshot?.categories ?? []).find(item => item.id === id)
    return { id, count: typeof row?.count === 'number' ? row.count : memories.filter(item => item.category === id).length }
  })
  const filtered = filter === 'all' ? memories : memories.filter(item => item.category === filter)
  const appliedText = askResult === null ? '' : memoryAppliedText(askResult.applied, t)

  if (status === 'loading') {
    return h('div', { className: 'dsc-memory-state' }, h(Spinner, { size: 18 }), h('span', null, t('memoryLoading')))
  }
  if (status === 'outdated') {
    return h('div', { className: 'dsc-memory-notice' },
      h(Icon, { name: 'warning', size: 18 }),
      h('div', { className: 'dsc-memory-notice-body' },
        h('strong', null, t('memoryOutdatedTitle')),
        h('p', null, t('memoryOutdatedHint')),
      ),
    )
  }
  if (status === 'error') {
    return h('div', { className: 'dsc-memory-notice' },
      h(Icon, { name: 'warning', size: 18 }),
      h('div', { className: 'dsc-memory-notice-body' },
        h('strong', null, t('memoryLoadFailed')),
        h('p', null, loadError),
      ),
      h('button', { type: 'button', className: 'dsc-secondary-button', onClick: () => { void load() } }, t('retry')),
    )
  }

  const renderRow = (memory) => {
    if (editingId === memory.id) {
      return h('div', { key: memory.id, className: 'dsc-memory-row is-editing' },
        h('textarea', {
          className: 'dsc-memory-input',
          rows: 3,
          maxLength: limits.maxContent ?? MEMORY_IMPORT_MAX_CONTENT,
          value: editDraft,
          'aria-label': t('edit'),
          onChange: event => setEditDraft(event.target.value),
        }),
        h('div', { className: 'dsc-memory-row-foot' },
          h('div', { className: 'dsc-memory-row-actions' },
            h('button', { type: 'button', className: 'dsc-secondary-button', disabled: busy !== '', onClick: stopEditing }, t('cancel')),
            h('button', { type: 'button', className: 'dsc-primary-button is-small', disabled: busy !== '' || editDraft.trim() === '', onClick: () => { void saveEditing() } }, t('save')),
          ),
        ),
      )
    }
    return h('div', { key: memory.id, className: 'dsc-memory-row' },
      h('p', { className: 'dsc-memory-content' }, memory.content),
      h('div', { className: 'dsc-memory-row-foot' },
        h('div', { className: 'dsc-memory-meta' },
          h('span', { className: 'dsc-memory-badge' }, memoryCategoryLabel(memory.category, t)),
          h('span', null, memorySourceLabel(memory.source, t)),
          h('span', null, relativeTime(memory.updatedAt, t)),
        ),
        h('div', { className: 'dsc-memory-row-actions' },
          h('button', {
            type: 'button', className: 'dsc-icon-button is-small', title: t('edit'), 'aria-label': t('edit'),
            onClick: () => startEditing(memory),
          }, h(Icon, { name: 'pencil', size: 14 })),
          h('button', {
            type: 'button', className: 'dsc-icon-button is-small is-danger', title: t('delete'), 'aria-label': t('delete'),
            onClick: () => requestDelete(memory),
          }, h(Icon, { name: 'trash', size: 14 })),
        ),
      ),
    )
  }

  const importDialog = importOpen
    ? h(MemoryImportDialog, {
        onClose: () => setImportOpen(false),
        onImported: data => applySnapshot(data),
      })
    : null

  return h('div', { className: 'dsc-memory-pane' },
    h(SettingsSection, { title: t('memorySectionTitle') },
      h('div', { className: 'dsc-switch-row' },
        h('div', { className: 'dsc-switch-copy' },
          h('strong', null, t('memoryMasterLabel')),
          h('span', null, t('memoryMasterHint')),
        ),
        h(Switch, {
          checked: enabled,
          onChange: next => { void changeSettings({ enabled: next }) },
          label: t('memoryMasterLabel'),
          disabled: busy !== '',
        }),
      ),
      h('div', { className: 'dsc-switch-row' },
        h('div', { className: 'dsc-switch-copy' },
          h('strong', null, t('memoryAutoExtractLabel')),
          h('span', null, t('memoryAutoExtractHint')),
        ),
        h(Switch, {
          checked: settings.autoExtract === true,
          onChange: next => { void changeSettings({ autoExtract: next }) },
          label: t('memoryAutoExtractLabel'),
          disabled: !enabled || busy !== '',
        }),
      ),
      h('p', { className: 'dsc-field-hint is-warning' }, t('memoryPrivacyHint')),
      !enabled ? h('p', { className: 'dsc-field-hint' }, t('memoryAutoExtractDisabledHint')) : null,
    ),
    h(SettingsSection, { title: t('memorySummarySection') },
      h('div', { className: 'dsc-memory-summary' },
        summary !== null
          ? h(Markdown, { text: summary.text, className: 'dsc-memory-summary-text' })
          : h('p', { className: 'dsc-memory-summary-empty' }, t('memorySummaryEmpty')),
        h('div', { className: 'dsc-memory-summary-foot' },
          h('span', { className: 'dsc-memory-summary-meta' }, summary !== null
            ? t('memorySummaryUpdated', { time: relativeTime(summary.updatedAt, t) })
            : t('memorySummaryNever')),
          h('button', {
            type: 'button', className: 'dsc-text-button',
            disabled: busy !== '' || !enabled,
            onClick: () => { void refreshSummary() },
          }, summaryError ? t('memorySummaryRetry') : t('memoryRegenerate')),
        ),
        busy === 'summary' ? h('p', { className: 'dsc-field-hint' }, t('memorySummaryBusy')) : null,
        summaryError ? h('p', { className: 'dsc-field-hint is-warning' }, t('memorySummaryFailed')) : null,
        summary !== null && enabled && snapshot?.stale === true
          ? h('p', { className: 'dsc-field-hint is-warning' }, t('memorySummaryStaleHint'))
          : null,
        h('div', { className: 'dsc-memory-ask' },
          h('textarea', {
            className: 'dsc-memory-input dsc-memory-ask-input',
            rows: 2,
            maxLength: 2000,
            value: askText,
            placeholder: enabled ? t('memoryAskPlaceholder') : t('memoryAskDisabledHint'),
            disabled: !enabled || busy !== '',
            onChange: event => setAskText(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter' && !event.shiftKey && event.nativeEvent?.isComposing !== true) {
                event.preventDefault()
                void submitAsk()
              }
            },
          }),
          h('button', {
            type: 'button', className: 'dsc-primary-button is-small',
            disabled: !enabled || busy !== '' || askText.trim() === '',
            onClick: () => { void submitAsk() },
          }, busy === 'ask' ? t('memoryAsking') : t('memoryAskSubmit')),
        ),
        !enabled ? h('p', { className: 'dsc-field-hint' }, t('memoryAskDisabledHint')) : null,
        askResult !== null ? h('div', { className: 'dsc-memory-ask-result' },
          askResult.answer !== '' ? h('p', { className: 'dsc-memory-answer' }, askResult.answer) : null,
          appliedText !== '' ? h('p', { className: 'dsc-memory-applied' }, appliedText) : null,
          askResult.pending !== null && askResult.pending !== undefined ? h('div', { className: 'dsc-memory-pending' },
            h('p', { className: 'dsc-memory-pending-title' }, t('memoryPendingHint')),
            h('ul', { className: 'dsc-memory-pending-list' },
              askResult.pending.memories.map(memory => h('li', { key: memory.id }, memory.content)),
            ),
            h('div', { className: 'dsc-memory-pending-actions' },
              h('button', {
                type: 'button', className: 'dsc-secondary-button', disabled: busy === 'confirm',
                onClick: () => { void settlePending(false) },
              }, t('cancel')),
              h('button', {
                type: 'button', className: 'dsc-primary-button is-danger', disabled: busy === 'confirm',
                onClick: () => { void settlePending(true) },
              }, t('memoryConfirmDelete')),
            ),
          ) : null,
        ) : null,
      ),
    ),
    h(SettingsSection, { title: t('memoryListSection') },
      h('div', { className: 'dsc-memory-list-head' },
        h('span', { className: 'dsc-memory-limit' }, t('memoryLimitHint', { count, max: limits.maxMemories ?? 400 })),
        h('button', {
          type: 'button', className: 'dsc-text-button',
          disabled: busy !== '' || memories.length === 0,
          onClick: requestClear,
        }, t('memoryClearAction')),
      ),
      h('div', { className: 'dsc-memory-filters' },
        h('button', {
          type: 'button',
          className: cx('dsc-memory-chip', filter === 'all' && 'is-active'),
          'aria-pressed': filter === 'all',
          onClick: () => setFilter('all'),
        }, t('memoryFilterAll'), h('span', { className: 'dsc-memory-chip-count' }, String(count))),
        categoryRows.map(row => h('button', {
          key: row.id,
          type: 'button',
          className: cx('dsc-memory-chip', filter === row.id && 'is-active'),
          'aria-pressed': filter === row.id,
          onClick: () => setFilter(row.id),
        }, memoryCategoryLabel(row.id, t), h('span', { className: 'dsc-memory-chip-count' }, String(row.count)))),
      ),
      h('div', { className: 'dsc-memory-add' },
        h('textarea', {
          className: 'dsc-memory-input',
          rows: 2,
          maxLength: limits.maxContent ?? MEMORY_IMPORT_MAX_CONTENT,
          value: addContent,
          placeholder: t('memoryAddPlaceholder'),
          onChange: event => setAddContent(event.target.value),
        }),
        h('div', { className: 'dsc-memory-add-row' },
          h('select', {
            className: 'dsc-select', value: addCategory, 'aria-label': t('memoryImportCategory'),
            onChange: event => setAddCategory(event.target.value),
          }, memoryCategoryIds.map(id => h('option', { key: id, value: id }, memoryCategoryLabel(id, t)))),
          h('button', {
            type: 'button', className: 'dsc-secondary-button',
            disabled: busy !== '' || addContent.trim() === '',
            onClick: () => { void addMemory() },
          }, t('memoryAddSubmit')),
        ),
      ),
      filtered.length === 0
        ? h('p', { className: 'dsc-memory-empty' }, t(memories.length === 0 ? 'memoryEmpty' : 'memoryEmptyFiltered'))
        : h('div', { className: 'dsc-memory-rows' }, filtered.map(renderRow)),
    ),
    h('div', { className: 'dsc-memory-footer' },
      h('p', { className: 'dsc-field-hint' }, t('memoryImportHint')),
      h('button', {
        type: 'button', className: 'dsc-secondary-button',
        onClick: () => setImportOpen(true),
      }, h(Icon, { name: 'brain', size: 15 }), t('memoryImportOpen')),
    ),
    importDialog,
  )
}

function memoryImportRow(row, date) {
  const match = row?.match ?? null
  const duplicate = match?.kind === 'duplicate'
  return {
    key: uid(),
    content: typeof row?.content === 'string' ? row.content : '',
    category: memoryCategoryIds.includes(row?.category) ? row.category : 'preferences',
    date: typeof date === 'string' ? date : null,
    sensitive: row?.sensitive === true,
    match,
    selected: !duplicate,
    mode: duplicate ? 'skip' : match?.kind === 'conflict' ? 'update' : 'auto',
  }
}

function MemoryImportDialog({ onClose, onImported }) {
  const t = useT()
  const [step, setStep] = React.useState('prompt')
  const [platform, setPlatform] = React.useState('other')
  const [paste, setPaste] = React.useState('')
  const [items, setItems] = React.useState([])
  const [meta, setMeta] = React.useState(null)
  const [busy, setBusy] = React.useState('')
  const [error, setError] = React.useState('')
  const [assistConsent, setAssistConsent] = React.useState(null)
  const alive = React.useRef(true)

  const close = () => {
    if (typeof onClose === 'function') onClose()
  }

  const dismiss = () => {
    if (busy === '') close()
  }

  const copyPrompt = () => {
    copyToClipboard(MEMORY_IMPORT_PROMPT)
      .then(() => chatStore.toast(t('copied'), 'success'))
      .catch(() => chatStore.toast(t('copyFailed'), 'error'))
  }

  const requestPreview = async (entries) => {
    setError('')
    setBusy('parse')
    try {
      const data = await memoryRequest({
        action: 'preview',
        entries: entries.map(entry => ({ content: entry.content, category: entry.category })),
      })
      if (!alive.current) return
      const rows = Array.isArray(data?.entries) ? data.entries : []
      if (rows.length === 0) {
        setError(t('memoryImportEmpty'))
        return
      }
      setItems(rows.map((row, index) => memoryImportRow(row, entries[index]?.date ?? null)))
      setStep('preview')
    } catch (fetchError) {
      if (alive.current) setError(t('memoryImportFailed', { message: memoryErrorText(fetchError) }))
    } finally {
      if (alive.current) setBusy('')
    }
  }

  const parseAndPreview = () => {
    if (busy !== '' || paste.trim() === '') return
    const parsed = parseMemoryExport(paste)
    setMeta({ count: parsed.entries.length, skipped: parsed.skipped })
    if (parsed.entries.length === 0) {
      chatStore.toast(t('memoryImportEmpty'), 'error')
      return
    }
    void requestPreview(parsed.entries)
  }

  const confirmAssist = async () => {
    if (assistConsent === null || busy !== '') return
    const text = assistConsent.text
    setAssistConsent(null)
    setBusy('assist')
    try {
      const data = await memoryRequest({ action: 'assist', text, consent: true, locale: streamLocale() })
      if (!alive.current) return
      const entries = Array.isArray(data?.entries) ? data.entries : []
      if (entries.length === 0) {
        chatStore.toast(t('memoryImportEmpty'), 'error')
        return
      }
      if (data?.truncated === true) chatStore.toast(t('memoryImportAssistTruncated'), 'info')
      await requestPreview(entries)
    } catch (fetchError) {
      if (alive.current) chatStore.toast(t('memoryImportAssistFailed', { message: memoryErrorText(fetchError) }), 'error')
    } finally {
      if (alive.current) setBusy('')
    }
  }

  const patchItem = (index, patch) => {
    setItems(previous => previous.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  const toggleItem = (index) => {
    setItems(previous => previous.map((item, itemIndex) => {
      if (itemIndex !== index) return item
      const selected = !item.selected
      const fallback = item.match?.kind === 'duplicate' ? 'merge' : item.match?.kind === 'conflict' ? 'update' : 'auto'
      return { ...item, selected, mode: selected ? (item.mode === 'skip' ? fallback : item.mode) : 'skip' }
    }))
  }

  const selectItemMode = (index, mode) => {
    patchItem(index, { mode, selected: mode !== 'skip' })
  }

  const selectedEntries = () => items
    .filter(item => item.selected && item.mode !== 'skip' && item.content.trim() !== '')
    .map((item) => {
      const entry = { content: item.content.trim(), category: item.category, mode: item.mode }
      const date = memoryImportDate(item.date)
      if (date !== undefined) entry.date = date
      return entry
    })

  const confirmImport = async () => {
    if (busy !== '') return
    const entries = selectedEntries()
    if (entries.length === 0) {
      chatStore.toast(t('memoryImportNoneSelected'), 'error')
      return
    }
    setBusy('import')
    try {
      const data = await memoryRequest({ action: 'import', platform, entries })
      if (!alive.current) return
      const result = data?.result ?? {}
      chatStore.toast(t('memoryImportDone', {
        added: result.added ?? 0,
        merged: result.merged ?? 0,
        updated: result.updated ?? 0,
        skipped: result.skipped ?? 0,
      }), 'success')
      if (typeof onImported === 'function') onImported(data)
      close()
    } catch (fetchError) {
      if (alive.current) chatStore.toast(memoryErrorText(fetchError), 'error')
    } finally {
      if (alive.current) setBusy('')
    }
  }

  React.useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])

  const stepNote = t('memoryImportStep', { current: step === 'prompt' ? 1 : 2, total: 2 })

  const promptStep = h(Fragment, null,
    h('p', { className: 'dsc-memory-import-intro' }, t('memoryImportIntro')),
    h('div', { className: 'dsc-memory-import-field' },
      h('div', { className: 'dsc-memory-prompt-head' },
        h('span', { className: 'dsc-field-label' }, t('memoryImportPromptLabel')),
        h('button', {
          type: 'button', className: 'dsc-secondary-button is-small-compact',
          onClick: copyPrompt,
        }, h(Icon, { name: 'copy', size: 14 }), t('memoryImportCopyPrompt')),
      ),
      h('pre', { className: 'dsc-memory-prompt' }, MEMORY_IMPORT_PROMPT),
    ),
  )

  const pasteStep = h(Fragment, null,
    h('div', { className: 'dsc-memory-import-field' },
      h('span', { className: 'dsc-field-label' }, t('memoryImportPlatform')),
      h('div', { className: 'dsc-segment', role: 'group', 'aria-label': t('memoryImportPlatform') },
        MEMORY_IMPORT_PLATFORMS.map(value => h('button', {
          key: value,
          type: 'button',
          className: cx('dsc-segment-button', platform === value && 'is-active'),
          'aria-pressed': platform === value,
          onClick: () => setPlatform(value),
        }, memoryPlatformLabel(value, t))),
      ),
    ),
    h('div', { className: 'dsc-memory-import-field' },
      h('span', { className: 'dsc-field-label' }, t('memoryImportPasteLabel')),
      h('textarea', {
        className: 'dsc-memory-input dsc-memory-paste',
        rows: 9,
        value: paste,
        placeholder: t('memoryImportPastePlaceholder'),
        spellCheck: false,
        onChange: event => setPaste(event.target.value),
      }),
    ),
    meta !== null ? h('p', { className: 'dsc-field-hint' }, t('memoryImportRecognized', { count: meta.count })
      + (meta.skipped > 0 ? ` · ${t('memoryImportSkipped', { count: meta.skipped })}` : '')) : null,
    assistConsent !== null ? h('div', { className: 'dsc-memory-consent' },
      h('p', { className: 'dsc-memory-consent-text' }, t('memoryImportConsentText')),
      h('div', { className: 'dsc-memory-consent-actions' },
        h('button', { type: 'button', className: 'dsc-secondary-button', onClick: () => setAssistConsent(null) }, t('cancel')),
        h('button', {
          type: 'button', className: 'dsc-primary-button',
          onClick: () => { void confirmAssist() },
        }, t('memoryImportConsentConfirm')),
      ),
    ) : null,
  )

  const previewStep = h(Fragment, null,
    h('p', { className: 'dsc-field-hint' }, t('memoryImportPreviewSubtitle')),
    meta !== null ? h('p', { className: 'dsc-field-hint' }, t('memoryImportRecognized', { count: meta.count })) : null,
    h('p', { className: 'dsc-memory-preview-count' }, t('memoryImportSelectCount', { count: selectedEntries().length })),
    h('div', { className: 'dsc-memory-preview' },
      items.map((item, index) => h('div', {
        key: item.key,
        className: cx('dsc-memory-preview-row', item.selected && 'is-selected'),
      },
        h('label', { className: 'dsc-memory-preview-check' },
          h('input', { type: 'checkbox', checked: item.selected, onChange: () => toggleItem(index) }),
          h('span', null, t('memoryImportItemLabel', { index: index + 1 })),
        ),
        h('textarea', {
          className: 'dsc-memory-input',
          rows: 2,
          maxLength: MEMORY_IMPORT_MAX_CONTENT,
          value: item.content,
          'aria-label': t('memoryImportItemLabel', { index: index + 1 }),
          onChange: event => patchItem(index, { content: event.target.value }),
        }),
        h('div', { className: 'dsc-memory-preview-controls' },
          h('select', {
            className: 'dsc-select', value: item.category, 'aria-label': t('memoryImportCategory'),
            onChange: event => patchItem(index, { category: event.target.value }),
          }, memoryCategoryIds.map(id => h('option', { key: id, value: id }, memoryCategoryLabel(id, t)))),
          item.match !== null ? h('select', {
            className: 'dsc-select dsc-memory-mode', value: item.mode, 'aria-label': t('memoryImportMode'),
            onChange: event => selectItemMode(index, event.target.value),
          }, [
            ['skip', 'memoryImportModeSkip'],
            ['merge', 'memoryImportModeMerge'],
            ['update', 'memoryImportModeUpdate'],
          ].map(([value, key]) => h('option', { key: value, value }, t(key)))) : null,
        ),
        h('div', { className: 'dsc-memory-preview-badges' },
          item.match?.kind === 'duplicate' ? h('span', { className: 'dsc-memory-badge is-duplicate' }, t('memoryImportBadgeDuplicate')) : null,
          item.match?.kind === 'conflict' ? h('span', { className: 'dsc-memory-badge is-exists' }, t('memoryImportBadgeConflict')) : null,
          item.sensitive ? h('span', { className: 'dsc-memory-badge is-sensitive' }, t('memoryImportBadgeSensitive')) : null,
        ),
        item.match !== null ? h('p', { className: 'dsc-memory-preview-existing' }, t('memoryImportExisting', { content: item.match.content })) : null,
      )),
    ),
  )

  const footer = step === 'preview'
    ? h(Fragment, null,
        h('span', { className: 'dsc-modal-foot-note' }, t('memoryImportMergeNote')),
        h('button', { type: 'button', className: 'dsc-secondary-button', disabled: busy !== '', onClick: () => setStep('paste') }, t('memoryImportBack')),
        h('button', {
          type: 'button', className: 'dsc-primary-button',
          disabled: busy !== '' || selectedEntries().length === 0,
          onClick: () => { void confirmImport() },
        }, busy === 'import' ? t('memoryImportImporting') : t('memoryImportConfirm', { count: selectedEntries().length })),
      )
    : step === 'paste'
      ? h(Fragment, null,
          h('span', { className: 'dsc-modal-foot-note' }, t('memoryImportMergeNote')),
          h('button', { type: 'button', className: 'dsc-secondary-button', onClick: () => setStep('prompt') }, t('memoryImportBack')),
          h('button', {
            type: 'button', className: 'dsc-secondary-button',
            disabled: busy !== '' || paste.trim() === '',
            onClick: () => setAssistConsent({ text: paste }),
          }, busy === 'assist' ? t('memoryImportAssisting') : t('memoryImportAssist')),
          h('button', {
            type: 'button', className: 'dsc-primary-button',
            disabled: busy !== '' || paste.trim() === '',
            onClick: parseAndPreview,
          }, busy === 'parse' ? t('memoryImportParsing') : t('memoryImportParse')),
        )
      : h(Fragment, null,
          h('span', { className: 'dsc-modal-foot-note' }, stepNote),
          h('button', { type: 'button', className: 'dsc-primary-button', onClick: () => setStep('paste') }, t('memoryImportNext')),
        )

  return h(ModalBackdrop, { className: 'dsc-memory-import', onDismiss: dismiss },
    h('div', { className: 'dsc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('memoryImportTitle') },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('memoryImportTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('memoryImportSubtitle')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, onClick: dismiss,
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        error !== '' ? h('p', { className: 'dsc-field-hint is-warning' }, error) : null,
        step === 'prompt' ? promptStep : step === 'paste' ? pasteStep : previewStep,
      ),
      h('div', { className: 'dsc-modal-foot' }, footer),
    ),
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
/* Shared token scope: the Chat surface and the two shell entries (the switch
   and the toast stack) all read the same --dsc-* aliases. */
.dsc-shell,
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
  --dsc-border-l3: var(--dsw-alias-border-l3, rgba(15, 23, 42, 0.12));
  --dsc-elevated: var(--dsw-alias-button-elevated-fill, var(--dsc-layer));
  --dsc-elevated-hover: var(--dsw-alias-button-floating-hover, var(--dsc-layer2));
  --dsc-field: color-mix(in srgb, var(--dsc-text) 4%, transparent);
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
  --dsc-shadow-popover: 0 12px 34px rgba(9, 12, 20, 0.17), 0 2px 7px rgba(9, 12, 20, 0.07);
  --dsc-control-h: 32px;
  --dsc-radius: var(--dsw-radius-md, 12px);
  --dsc-font: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif);
  --dsc-mono: var(--ds-font-family-code, 'SF Mono', Consolas, 'Liberation Mono', monospace);
  --dsc-ease: var(--ds-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
  --dsc-fast: var(--ds-transition-duration-fast, 0.1s);
  /* Syntax colours: one light palette, overridden below for the dark theme.
     They are the only fixed colours in this stylesheet; everything else is
     derived from the Harness theme tokens. */
  --dsc-hl-kw: #8b3fd6;
  --dsc-hl-str: #0f766e;
  --dsc-hl-num: #b45309;
  --dsc-hl-com: #7b8494;
  --dsc-hl-fn: #1d4ed8;
  --dsc-hl-type: #a21caf;
  --dsc-hl-op: #52606d;
  --dsc-hl-attr: #b91c1c;
  --dsc-hl-tag: #0e7490;
  --dsc-hl-var: #9333ea;
  --dsc-hl-meta: #64748b;
  --dsc-math-bg: color-mix(in srgb, var(--dsc-text) 3%, transparent);
  --dsc-mermaid-line: color-mix(in srgb, var(--dsc-text) 38%, transparent);
  --dsc-mermaid-fill: color-mix(in srgb, var(--dsc-link) 8%, var(--dsc-layer));
  --dsc-mermaid-c1: #4f7cff;
  --dsc-mermaid-c2: #19a97b;
  --dsc-mermaid-c3: #f0a02e;
  --dsc-mermaid-c4: #e0567a;
  --dsc-mermaid-c5: #8b5cf6;
  --dsc-mermaid-c6: #0ea5b7;
  --dsc-mermaid-c7: #c2410c;
  --dsc-mermaid-c8: #64748b;
}
/* Dark syntax palette: same hues, lifted for a dark surface. */
body[data-ds-dark-theme] .dsc-root {
  --dsc-hl-kw: #c0a2ff;
  --dsc-hl-str: #6ee7b7;
  --dsc-hl-num: #fbbf24;
  --dsc-hl-com: #8b95a5;
  --dsc-hl-fn: #93c5fd;
  --dsc-hl-type: #f0abfc;
  --dsc-hl-op: #cbd5e1;
  --dsc-hl-attr: #fca5a5;
  --dsc-hl-tag: #67e8f9;
  --dsc-hl-var: #d8b4fe;
  --dsc-hl-meta: #94a3b8;
  --dsc-mermaid-c1: #7da2ff;
  --dsc-mermaid-c2: #4ade9e;
  --dsc-mermaid-c3: #fbbf60;
  --dsc-mermaid-c4: #f38ba8;
  --dsc-mermaid-c5: #b39cff;
  --dsc-mermaid-c6: #4dd4e6;
  --dsc-mermaid-c7: #fb923c;
  --dsc-mermaid-c8: #94a3b8;
}
/* The shell entries are siblings of the Chat surface, so they carry their own
   root: display:contents keeps them out of the layout while custom
   properties and box-sizing still reach their children. */
.dsc-shell { display: contents; }
.dsc-shell *,
.dsc-shell *::before,
.dsc-shell *::after,
.dsc-root *,
.dsc-root *::before,
.dsc-root *::after { box-sizing: border-box; }
.dsc-shell { font-family: var(--dsc-font); }
.dsc-root {
  /* The band above the Chat surface that the platform chrome occupies. Windows
     publishes its 40px caption row, macOS its 48px top strip; a plain browser
     gets a 44px band of its own so the shared switch always has a home and is
     never covered by the chat surface. Fullscreen hides the native chrome, so
     only the switch band remains. */
  --dsc-top: var(--dsh-frame-chrome-top, var(--dsh-frame-top-clearance, 44px));
  position: fixed;
  top: var(--dsc-top);
  right: 0;
  bottom: 0;
  left: 0;
  /* The Chat surface sits below the shared switch (z 40). Dialogs do not use
     this stack at all: they are native modal <dialog> elements in the browser
     top layer, which is why their mask can cover the switch. */
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
.dsc-root :where(button, input, textarea, select) { font: inherit; color: inherit; }
.dsc-root button { cursor: pointer; }
.dsc-root button:disabled { cursor: default; }
.dsc-root ::selection { background: var(--dsc-brand-soft-strong); }
/* Keyboard focus is a thin brand ring on real controls. Text fields never take
   the browser's own outline: their surface (a composer or an input) draws a
   single quiet focus state instead, so the native ring and a component border
   can never stack into a double white frame. */
.dsc-root :where(button, a, [role='button'], [role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox'], [role='switch']):focus-visible {
  outline: 2px solid var(--dsc-brand);
  outline-offset: 2px;
}
.dsc-root :where(input, textarea, select):focus,
.dsc-root :where(input, textarea, select):focus-visible {
  outline: 0;
}
.dsc-icon { display: block; flex: none; }
.dsc-spinner {
  display: inline-block;
  border: 2px solid var(--dsc-border-strong);
  border-top-color: var(--dsc-brand);
  border-radius: 999px;
  animation: dsc-spin 0.8s linear infinite;
}
@keyframes dsc-spin { to { transform: rotate(360deg); } }

/* ---------- shared Chat | Agent switch (shell chrome) ----------
   ChatGPT-style asymmetric segmented control:
   * one dark pill track, two text segments inside it;
   * ONE floating chip behind the selected segment, wider (55%) than the other
     segment (45%) and slightly taller than the track's inner area, so the
     selected mode owns a real, larger surface and the other one is plain text;
   * when the mode flips, the chip slides and resizes while the track keeps its
     width and centre, and the labels re-centre inside their own segments.

   Placement: the middle of the native Session header's toolbar line
   (--dsh-frame-chrome-top + the header's 10px top padding + half of its 30px
   title row), refined at runtime from the header's published corner anchor.
   Horizontally the main content column: the published native sidebar width in
   Agent mode, the measured chat column in Chat mode. */
.dsc-modeswitch {
  --dsc-nav-height: 40px;
  --dsc-nav-width: 244px;
  --dsc-nav-selected: 55%;
  position: fixed;
  top: calc(var(--dsh-frame-chrome-top, 0px) + 25px);
  left: var(--dsh-windows-sidebar-width, 0px);
  right: 0;
  width: var(--dsc-nav-width);
  height: var(--dsc-nav-height);
  margin-inline: auto;
  transform: translateY(-50%);
  /* Above the Chat surface (z 30): the switch belongs to both modes and must
     stay clickable while the Chat layer covers the native header behind it. */
  z-index: 40;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 6%, transparent);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 7%, transparent),
    0 1px 2px rgba(9, 12, 20, 0.12);
  color: var(--dsw-alias-label-primary, #16181d);
  font-family: var(--dsw-font-family, -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif);
  font-size: 13.5px;
  line-height: 1;
  -webkit-app-region: no-drag;
  pointer-events: auto;
  user-select: none;
  backdrop-filter: blur(12px);
}
/* The chip: one element that slides and resizes with the active segment. It is
   taller than the segments' hit area (2px rim instead of 4px), which is what
   makes the selected mode read as a fuller, raised surface. */
.dsc-modeswitch-thumb {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  width: calc(var(--dsc-nav-selected) - 4px);
  border-radius: 999px;
  background: var(--dsw-alias-bg-base, #ffffff);
  box-shadow:
    0 1px 2px rgba(9, 12, 20, 0.16),
    0 6px 18px rgba(9, 12, 20, 0.08),
    inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 9%, transparent);
  transition:
    left 240ms var(--dsc-ease),
    width 240ms var(--dsc-ease),
    background-color 160ms ease,
    box-shadow 160ms ease;
}
/* Dark palette: the header is already dark, so the chip is a lighter surface
   with a soft rim rather than a white card. */
body[data-ds-dark-theme] .dsc-modeswitch-thumb {
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #f2f3f7) 12%, var(--dsw-alias-bg-layer-1, #1b1c1f));
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.42),
    0 8px 22px rgba(0, 0, 0, 0.20),
    inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary, #f2f3f7) 10%, transparent);
}
.dsc-modeswitch[data-active='agent'] .dsc-modeswitch-thumb {
  left: calc(100% - var(--dsc-nav-selected) + 2px);
}
.dsc-modeswitch-item {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.005em;
  white-space: nowrap;
  transition:
    left 240ms var(--dsc-ease),
    width 240ms var(--dsc-ease),
    color 160ms ease;
}
.dsc-modeswitch-item:hover { color: var(--dsw-alias-label-primary, #16181d); }
.dsc-modeswitch[data-active='chat'] .dsc-modeswitch-item.is-chat,
.dsc-modeswitch[data-active='agent'] .dsc-modeswitch-item.is-agent {
  color: var(--dsw-alias-label-primary, #16181d);
  font-weight: 600;
}
/* Segment geometry: the selected one is wider (55%) and the other 45%; the
   total width and centre never change. */
.dsc-modeswitch[data-active='chat'] .dsc-modeswitch-item.is-chat { left: 0; width: var(--dsc-nav-selected); }
.dsc-modeswitch[data-active='chat'] .dsc-modeswitch-item.is-agent { left: var(--dsc-nav-selected); width: calc(100% - var(--dsc-nav-selected)); }
.dsc-modeswitch[data-active='agent'] .dsc-modeswitch-item.is-chat { left: 0; width: calc(100% - var(--dsc-nav-selected)); }
.dsc-modeswitch[data-active='agent'] .dsc-modeswitch-item.is-agent { left: calc(100% - var(--dsc-nav-selected)); width: var(--dsc-nav-selected); }
.dsc-modeswitch-item:active .dsc-modeswitch-label { transform: scale(0.985); }
.dsc-modeswitch-label {
  display: block;
  transition: transform 120ms var(--dsc-ease);
}
.dsc-modeswitch-item:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4d6bff);
  outline-offset: 2px;
}
/* Fullscreen hides the native chrome; the Chat surface keeps only the switch band. */
html[data-fullscreen] .dsc-root { --dsc-top: 44px; }

/* ---------- sidebar ---------- */
/* The Chat column mirrors the native Harness sidebar's anatomy: one brand row,
   the New conversation bar, the search field, then the history list and the
   footer. Its width is a Chat-owned preference (the same 264-420px contract as
   the native handle) because Chat has no workspace rail to follow; the shared
   Chat | Agent switch measures the content column, so it stays centred at any
   sidebar width. */
.dsc-sidebar-column {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  width: var(--dsc-sidebar-width, 280px);
  min-width: 264px;
  /* Never squeeze the chat column below a readable width in a narrow window. */
  max-width: calc(100vw - 460px);
  min-height: 0;
}
.dsc-sidebar-column:not(.is-open) { display: none; }
.dsc-sidebar {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: var(--dsc-sidebar);
  border-right: 1px solid var(--dsc-border);
  overflow: hidden;
}
.dsc-sidebar-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 6px 8px 8px;
}
/* Brand row: centers the lockup on the native sidebar's Windows logo line (a
   40px row with a 1px optical lift, i.e. a 21px center inset) rather than the
   taller Chat header, so the whale + wordmark sit level with the Harness Agent
   brand beside the shared switch. */
.dsc-sidebar-brand {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 2px 0 8px;
  overflow: hidden;
}
.dsc-brand-lockup {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  color: var(--dsc-link);
  overflow: hidden;
}
.dsc-brand-logo { display: block; flex: none; }
.dsc-sidebar-collapse { flex: none; width: 28px; height: 28px; border-radius: 8px; }
/* New conversation: native New Session geometry (38px bar, 12px radius,
   elevated fill) with icon and label centred as one group. */
.dsc-new-chat {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  margin: 4px 2px 10px;
  padding: 0 12px;
  border: 0.5px solid var(--dsc-border-l3);
  border-radius: var(--dsc-radius);
  background: var(--dsc-elevated);
  color: var(--dsc-text);
  font-size: 14px;
  font-weight: 500;
  transition: background var(--dsc-fast) ease, border-color var(--dsc-fast) ease;
}
.dsc-new-chat:hover { background: var(--dsc-elevated-hover); }
.dsc-new-chat .dsc-icon { color: var(--dsc-muted); }
.dsc-search {
  flex: none;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  margin: 0 2px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: var(--dsc-field);
  color: var(--dsc-muted);
  cursor: text;
  transition: background var(--dsc-fast) ease, border-color var(--dsc-fast) ease;
}
.dsc-search:hover { background: color-mix(in srgb, var(--dsc-text) 6%, transparent); }
.dsc-search:focus-within { border-color: var(--dsc-border-strong); background: var(--dsc-layer); }
.dsc-search-input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 13px; color: var(--dsc-text); }
.dsc-search-input::placeholder { color: var(--dsc-muted); }
.dsc-chat-list { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 2px 10px; }
.dsc-chat-group { margin-top: 12px; }
.dsc-chat-group:first-child { margin-top: 2px; }
.dsc-chat-group-label {
  padding: 0 8px 6px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--dsc-muted);
}
.dsc-chat-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 8px;
  margin: 1px 0;
  border-radius: var(--dsc-radius);
  cursor: pointer;
  transition: background var(--dsc-fast) ease;
}
.dsc-chat-item:hover { background: var(--dsc-hover); }
.dsc-chat-item:focus-within { background: var(--dsc-hover); }
.dsc-chat-item.is-active { background: var(--dsc-active); }
.dsc-chat-item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  text-align: left;
}
.dsc-chat-item-main:focus-visible { outline-offset: 0; }
.dsc-chat-item-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13.4px;
  font-weight: 450;
}
.dsc-chat-item.is-active .dsc-chat-item-title { font-weight: 550; }
.dsc-chat-item-time { flex: none; font-size: 11px; color: var(--dsc-muted); }
/* One hover action per row: everything else lives in its "···" menu. */
.dsc-chat-item-more {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: var(--dsc-sidebar);
  color: var(--dsc-muted);
}
.dsc-chat-item-more:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-chat-item:hover .dsc-chat-item-more,
.dsc-chat-item:focus-within .dsc-chat-item-more,
.dsc-chat-item.is-active .dsc-chat-item-more { display: inline-flex; }
.dsc-chat-item:hover .dsc-chat-item-time,
.dsc-chat-item:focus-within .dsc-chat-item-time,
.dsc-chat-item.is-active .dsc-chat-item-time { visibility: hidden; }
.dsc-chat-item-pin { display: inline-flex; flex: none; color: var(--dsc-muted); }
.dsc-chat-item.is-renaming { background: var(--dsc-layer); border: 1px solid var(--dsc-border-strong); }
.dsc-chat-item.is-renaming:focus-within { border-color: color-mix(in srgb, var(--dsc-brand) 42%, var(--dsc-border-strong)); }
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
/* ---------- folders ---------- */
.dsc-list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  margin: 10px 2px 0;
  padding: 0 4px 0 8px;
}
.dsc-list-toolbar-label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.01em; color: var(--dsc-muted); }
.dsc-folder-list { margin-top: 2px; }
.dsc-folder { margin-top: 1px; }
.dsc-folder-head {
  position: relative;
  display: flex;
  align-items: center;
  height: 30px;
  padding: 0 4px 0 2px;
  border-radius: var(--dsc-radius);
}
.dsc-folder-head:hover { background: var(--dsc-hover); }
.dsc-folder-toggle {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 4px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-text);
  font-size: 13px;
  font-weight: 550;
  text-align: left;
}
.dsc-folder-chevron { display: inline-flex; flex: none; width: 12px; color: var(--dsc-muted); }
.dsc-folder-icon { display: inline-flex; flex: none; color: var(--dsc-muted); }
.dsc-folder-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsc-folder-count { flex: none; font-size: 11px; color: var(--dsc-muted); }
.dsc-folder-head .dsc-chat-item-more { position: static; transform: none; background: transparent; flex: none; }
.dsc-folder-head:hover .dsc-chat-item-more,
.dsc-folder-head:focus-within .dsc-chat-item-more { display: inline-flex; }
.dsc-folder-items { padding-left: 10px; }
.dsc-folder-empty { padding: 5px 10px 8px 26px; font-size: 11.8px; color: var(--dsc-muted); }
.dsc-foot-count {
  margin-left: auto;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--dsc-field);
  color: var(--dsc-muted);
  font-size: 10.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
/* ---------- history search ---------- */
.dsc-search-clear {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsc-muted);
}
.dsc-search-clear:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-search-state { display: flex; align-items: center; gap: 8px; padding: 18px 10px; font-size: 12.4px; color: var(--dsc-muted); }
.dsc-search-results { display: flex; flex-direction: column; gap: 2px; padding-top: 4px; }
.dsc-search-result {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  padding: 8px 9px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--dsc-text);
  text-align: left;
}
.dsc-search-result:hover { background: var(--dsc-hover); }
.dsc-search-result.is-active { background: var(--dsc-active); }
.dsc-search-result-head { display: flex; align-items: center; gap: 5px; width: 100%; min-width: 0; }
.dsc-search-result-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 550; }
.dsc-search-result-badge { display: inline-flex; flex: none; color: var(--dsc-muted); }
.dsc-search-result-meta { font-size: 11px; color: var(--dsc-muted); }
.dsc-search-result-snippet {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 11.8px;
  line-height: 1.55;
  color: var(--dsc-muted);
  word-break: break-word;
}
.dsc-search-mark { padding: 0 1px; border-radius: 3px; background: var(--dsc-brand-soft-strong); color: inherit; }
/* The foot keeps the native sidebar's spacing-only separation: no extra rule. */
.dsc-sidebar-foot { flex: none; padding-top: 6px; }
.dsc-foot-action {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  height: 36px;
  padding: 0 9px;
  border: 0;
  border-radius: var(--dsc-radius);
  background: transparent;
  font-size: 13px;
  color: var(--dsc-muted);
  text-align: left;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease;
}
.dsc-foot-action:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-auth-dot { width: 7px; height: 7px; border-radius: 999px; margin-left: auto; background: var(--dsc-warn); }
.dsc-auth-dot.is-ready { background: var(--dsc-success); }
.dsc-auth-dot.is-missing { background: var(--dsc-warn); }
/* Right-edge resize affordance: an 8px pointer-capture strip over the column
   border, like the native frame handle. A short accent line appears on hover,
   keyboard focus and while dragging instead of a permanent divider. */
.dsc-sidebar-resizer {
  position: absolute;
  top: 0;
  right: -4px;
  bottom: 0;
  width: 8px;
  z-index: 2;
  cursor: col-resize;
  touch-action: none;
  outline: none;
}
.dsc-sidebar-resizer::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 3px;
  width: 2px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsc-text) 22%, transparent);
  opacity: 0;
  transition: opacity var(--dsc-fast) ease;
}
.dsc-sidebar-resizer:hover::after,
.dsc-sidebar-resizer:focus-visible::after,
.dsc-sidebar-resizer.is-dragging::after { opacity: 1; }
.dsc-sidebar-resizer:focus-visible { outline: 2px solid var(--dsc-brand); outline-offset: -1px; }
.dsc-root[data-resizing] { cursor: col-resize; user-select: none; }
.dsc-root[data-resizing] :where(button, a, textarea, input, label) { cursor: col-resize; }
.dsc-root[data-resizing] .dsc-sidebar-resizer::after { opacity: 1; }

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
  border: 0;
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
/* A blank Chat page is one personalized line and the composer. The thread
   centres the line in the space above the composer (auto margins keep it
   scrollable when the window is short), so the eye lands on the greeting
   instead of on a grid of feature cards. */
.dsc-thread.is-empty { display: flex; flex-direction: column; scrollbar-gutter: auto; }
.dsc-thread.is-empty .dsc-empty { margin-block: auto; }
.dsc-empty {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 4px 5vh;
  text-align: center;
}
.dsc-greeting {
  max-width: 700px;
  margin: 0 auto;
  font-size: clamp(26px, 2.45vw, 32px);
  font-weight: 560;
  letter-spacing: -0.022em;
  line-height: 1.36;
  color: var(--dsc-text);
  text-wrap: balance;
  overflow-wrap: anywhere;
}
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
.dsc-primary-button:hover:not(:disabled) { filter: brightness(1.06); }
.dsc-primary-button:disabled {
  background: var(--dsc-layer2);
  color: var(--dsc-muted);
  opacity: 0.8;
}
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
.dsc-secondary-button:hover:not(:disabled) { background: var(--dsc-hover); }
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
.dsc-user-block { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; max-width: 100%; min-width: 0; }
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
.dsc-user-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  padding-right: 2px;
  opacity: 0;
  transition: opacity var(--dsc-fast) ease;
}
.dsc-msg-user:hover .dsc-user-actions,
.dsc-msg-user:focus-within .dsc-user-actions { opacity: 1; }
/* Inline question editor: the textarea itself stays borderless inside the
   bubble, and the footer lives on the same surface instead of a nested card. */
.dsc-user-bubble.is-editing { width: min(660px, 100%); padding: 9px 13px 7px; }
.dsc-user-edit-input {
  display: block;
  width: 100%;
  min-height: 44px;
  max-height: 260px;
  padding: 2px 1px;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  color: var(--dsc-text);
  font-size: 14.6px;
  line-height: 1.68;
}
.dsc-user-edit-actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; margin-top: 4px; }
.dsc-user-edit-hint { flex: 1; min-width: 0; font-size: 10.9px; line-height: 1.5; color: var(--dsc-muted); }
.dsc-primary-button.is-small { height: 29px; padding: 0 12px; font-size: 12px; }
.dsc-msg-assistant { align-items: flex-start; padding-right: 2%; }
.dsc-msg-body { flex: 1; min-width: 0; }
.dsc-msg-actions-spacer { flex: 1; }
.dsc-version { display: inline-flex; align-items: center; gap: 1px; flex: none; color: var(--dsc-muted); }
.dsc-version-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsc-muted);
}
.dsc-version-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-version-button:disabled { opacity: 0.4; }
.dsc-version-label { min-width: 30px; text-align: center; font-size: 11.2px; font-variant-numeric: tabular-nums; }
.dsc-msg.is-highlighted .dsc-user-bubble,
.dsc-msg.is-highlighted .dsc-msg-body { border-radius: 16px; animation: dsc-flash 1.9s ease; }
@keyframes dsc-flash {
  0% { box-shadow: 0 0 0 3px var(--dsc-brand-soft-strong); }
  72% { box-shadow: 0 0 0 3px var(--dsc-brand-soft-strong); }
  100% { box-shadow: 0 0 0 3px transparent; }
}

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

/* ---------- reasoning / process ----------
   Reasoning is a quiet, secondary layer: muted text, a thin rail, and a
   collapsed body. The answer below it stays the loudest thing in the message. */
.dsc-process { margin: 0 0 9px; }
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
.dsc-process-body { padding: 4px 0 2px 14px; border-left: 1px solid var(--dsc-border); margin-left: 2px; }
.dsc-think-block {
  margin: 2px 0 10px;
  padding: 2px 0 2px 12px;
  border-left: 2px solid var(--dsc-border-strong);
  color: var(--dsc-muted);
  font-size: 13.2px;
  line-height: 1.72;
  max-height: 320px;
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
.dsc-image {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 12px 0;
  border: 1px solid var(--dsc-border);
  border-radius: 10px;
  background: var(--dsc-layer2);
}
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
.dsc-pre { margin: 0; padding: 13px 14px; max-height: 520px; overflow: auto; font-size: 12.7px; line-height: 1.66; }
.dsc-pre code { font-family: var(--dsc-mono); white-space: pre; }
.dsc-code-body { display: block; }
.dsc-tok-kw { color: var(--dsc-hl-kw); font-weight: 550; }
.dsc-tok-str { color: var(--dsc-hl-str); }
.dsc-tok-num { color: var(--dsc-hl-num); }
.dsc-tok-com { color: var(--dsc-hl-com); font-style: italic; }
.dsc-tok-fn { color: var(--dsc-hl-fn); }
.dsc-tok-type { color: var(--dsc-hl-type); }
.dsc-tok-op { color: var(--dsc-hl-op); }
.dsc-tok-attr { color: var(--dsc-hl-attr); }
.dsc-tok-tag { color: var(--dsc-hl-tag); }
.dsc-tok-var { color: var(--dsc-hl-var); }
.dsc-tok-meta { color: var(--dsc-hl-meta); }
.dsc-answer { margin-top: 2px; }
.dsc-answer .dsc-md { font-size: 15.1px; }
.dsc-diagram { margin: 13px 0; }
.dsc-diagram-note { display: block; margin-top: 4px; font-size: 11px; color: var(--dsc-muted); }
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

/* ---------- sources ----------
   Collapsed by default: one compact line instead of a wall of cards. The
   expanded list is a single numbered column with its own scroll area. */
.dsc-sources { margin-top: 14px; }
.dsc-sources-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 8px;
  margin-left: -2px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 11.9px;
  font-weight: 600;
}
.dsc-sources-toggle:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-sources-count { white-space: nowrap; }
.dsc-source-list {
  list-style: none;
  margin: 6px 0 0;
  padding: 4px;
  max-height: 264px;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--dsc-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsc-layer) 70%, var(--dsc-bg));
}
.dsc-source {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  padding: 7px 8px;
  border-radius: 8px;
  transition: background var(--dsc-fast) ease;
}
.dsc-source:hover { background: var(--dsc-hover); }
.dsc-source.is-target { background: var(--dsc-brand-soft); }
.dsc-source-index {
  width: 17px;
  height: 17px;
  border-radius: 5px;
  background: var(--dsc-brand-soft);
  color: var(--dsc-link);
  font-size: 10.2px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  margin-top: 1px;
}
.dsc-source-link {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
  color: var(--dsc-text);
  text-decoration: none;
}
.dsc-source-title {
  font-size: 12.4px;
  font-weight: 550;
  line-height: 1.42;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsc-source:hover .dsc-source-title { color: var(--dsc-link); }
.dsc-source-meta {
  font-size: 10.6px;
  color: var(--dsc-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsc-source-snippet {
  margin-top: 1px;
  font-size: 11.2px;
  color: var(--dsc-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.dsc-source .dsc-icon { color: var(--dsc-muted); margin-top: 3px; flex: none; }
/* In-text citation marker: small, monochrome, never competes with prose. */
.dsc-cite {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 15px;
  height: 15px;
  margin: 0 1px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--dsc-brand-soft);
  color: var(--dsc-link);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  vertical-align: 0.32em;
}
.dsc-cite:hover { background: var(--dsc-brand-soft-strong); }

/* ---------- math ----------
   A compact TeX renderer (32-math.js) emits typed spans; the Harness page
   already loads the KaTeX font faces, so math text picks them up when present
   and falls back to a serif face otherwise. */
.dsc-math {
  font-family: 'KaTeX_Main', 'Cambria Math', 'Times New Roman', serif;
  font-size: 1.03em;
  line-height: 1.4;
  color: var(--dsc-text);
}
.dsc-math-inline { display: inline; white-space: nowrap; }
.dsc-math-block {
  display: block;
  margin: 12px 0;
  padding: 10px 12px;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 8px;
  background: var(--dsc-math-bg);
  text-align: center;
}
.dsc-math-row { display: inline-flex; align-items: baseline; flex-wrap: wrap; column-gap: 0.12em; row-gap: 0.42em; }
.dsc-math-block .dsc-math-row { justify-content: center; }
/* Tall constructs centre on the math axis instead of hanging from their
   numerator/radical baseline. */
.dsc-math-frac,
.dsc-math-sqrt,
.dsc-math-matrix { align-self: center; }
.dsc-math-var { font-style: italic; font-family: 'KaTeX_Math', 'Cambria Math', 'Times New Roman', serif; }
.dsc-math-num,
.dsc-math-op,
.dsc-math-text { font-style: normal; }
.dsc-math-op { padding: 0 0.14em; }
.dsc-math-text { white-space: pre; }
.dsc-math-big { font-size: 1.45em; line-height: 1; vertical-align: -0.12em; padding: 0 0.05em; }
.dsc-math-delim { font-style: normal; font-family: 'KaTeX_Size1', 'KaTeX_Main', 'Cambria Math', serif; }
.dsc-math-frac {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  margin: 0 0.18em;
  font-size: 0.95em;
  line-height: 1.18;
}
.dsc-math-frac-num { padding: 0 0.22em 2px; border-bottom: 1px solid currentColor; }
.dsc-math-frac-den { padding: 2px 0.22em 0; }
.dsc-math-sqrt { display: inline-flex; align-items: flex-start; vertical-align: middle; margin: 0 0.08em; }
.dsc-math-sqrt::before { content: '√'; font-size: 1.18em; line-height: 1; }
.dsc-math-sqrt-body { padding: 0 0.16em 0 0.06em; border-top: 1px solid currentColor; margin-top: 0.14em; }
.dsc-math-sqrt-index { font-size: 0.6em; line-height: 1; margin-right: -0.28em; margin-top: -0.1em; align-self: flex-start; }
/* A lone script rises or sinks from the wrapper; stacked scripts are laid out
   by the renderer with inline flex styles. */
.dsc-math-script { display: inline-flex; flex-direction: column; align-items: flex-start; vertical-align: middle; font-size: 0.72em; line-height: 1.08; }
.dsc-math-script:has(> .dsc-math-sup:only-child) { vertical-align: 0.42em; }
.dsc-math-script:has(> .dsc-math-sub:only-child) { vertical-align: -0.18em; }
.dsc-math-sup,
.dsc-math-sub { line-height: 1.05; }
.dsc-math-sup { align-self: flex-start; }
.dsc-math-sub { align-self: flex-start; }
.dsc-math-matrix {
  display: inline-grid;
  grid-auto-flow: row;
  grid-auto-columns: auto;
  justify-items: center;
  align-items: baseline;
  column-gap: 0.9em;
  row-gap: 0.22em;
  vertical-align: middle;
  padding: 0 0.28em;
}
.dsc-math-matrix-row { display: contents; }
.dsc-math-matrix-cell { text-align: center; padding: 0 0.08em; }
.dsc-math-space { flex: none; }
.dsc-math-error {
  font-family: var(--dsc-mono);
  font-size: 0.9em;
  color: var(--dsc-warn);
  white-space: pre-wrap;
  word-break: break-word;
}

/* ---------- Mermaid diagrams ----------
   The diagram is a self-contained React SVG (no HTML injection). Colours come
   from theme variables so light and dark share one drawing. */
.dsc-mermaid {
  margin: 14px 0;
  padding: 10px;
  border: 1px solid var(--dsc-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsc-layer) 82%, var(--dsc-bg));
}
.dsc-mermaid-figure { overflow-x: auto; overflow-y: hidden; }
.dsc-mermaid-svg { display: block; width: 100%; height: auto; max-height: 560px; color: var(--dsc-text); }
.dsc-mermaid-caption,
.dsc-mermaid-title {
  margin: 6px 2px 0;
  font-size: 11.4px;
  color: var(--dsc-muted);
  text-align: center;
}
.dsc-mermaid-node {
  fill: var(--dsc-mermaid-fill);
  stroke: var(--dsc-mermaid-line);
  stroke-width: 1.2;
}
.dsc-mermaid-node-label { fill: var(--dsc-text); font-size: 13px; font-family: var(--dsc-font); }
.dsc-mermaid-edge { fill: none; stroke: var(--dsc-mermaid-line); stroke-width: 1.4; }
.dsc-mermaid-edge-label { fill: var(--dsc-muted); font-size: 11.5px; font-family: var(--dsc-font); }
.dsc-mermaid-edge-dashed { stroke-dasharray: 5 4; }
.dsc-mermaid-edge-thick { stroke-width: 2.4; }
.dsc-mermaid-edge-cross { stroke: var(--dsc-error); }
.dsc-mermaid-edge-arrow { fill: var(--dsc-mermaid-line); stroke: none; }
.dsc-mermaid-edge-hollow { fill: var(--dsc-layer); stroke: var(--dsc-mermaid-line); stroke-width: 1.2; }
.dsc-mermaid-edge-diamond { fill: var(--dsc-mermaid-line); stroke: none; }
.dsc-mermaid-cluster {
  fill: color-mix(in srgb, var(--dsc-text) 2.5%, transparent);
  stroke: var(--dsc-border-strong);
  stroke-dasharray: 4 4;
  rx: 12;
}
.dsc-mermaid-cluster-label { fill: var(--dsc-muted); font-size: 11.5px; font-weight: 600; font-family: var(--dsc-font); }
.dsc-mermaid-lifeline { stroke: var(--dsc-border-strong); stroke-dasharray: 3 4; }
.dsc-mermaid-frame { fill: none; stroke: var(--dsc-border-strong); }
.dsc-mermaid-frame-label { fill: var(--dsc-muted); font-size: 10.6px; font-weight: 650; letter-spacing: 0.04em; font-family: var(--dsc-font); }
.dsc-mermaid-note {
  fill: color-mix(in srgb, var(--dsc-warn) 9%, var(--dsc-layer));
  stroke: color-mix(in srgb, var(--dsc-warn) 32%, transparent);
}
.dsc-mermaid-note-label { fill: var(--dsc-text); font-size: 11.5px; font-family: var(--dsc-font); }
.dsc-mermaid-slice { fill: var(--dsc-slice, var(--dsc-mermaid-c1)); stroke: var(--dsc-layer); stroke-width: 1; }
.dsc-mermaid-legend-swatch { fill: var(--dsc-slice, var(--dsc-mermaid-c1)); }
.dsc-mermaid-legend-label { fill: var(--dsc-muted); font-size: 11px; font-family: var(--dsc-font); }
.dsc-mermaid-class-title { fill: var(--dsc-text); font-size: 12.5px; font-weight: 600; font-family: var(--dsc-font); }
.dsc-mermaid-class-member { fill: var(--dsc-muted); font-size: 11.2px; font-family: var(--dsc-mono); }
.dsc-mermaid-caption { text-align: center; }
/* Error fallback keeps the source: a failed diagram is still readable text. */
.dsc-mermaid-failed { border-color: color-mix(in srgb, var(--dsc-warn) 26%, var(--dsc-border)); }
.dsc-mermaid-error { margin: 0 0 8px; padding: 7px 9px; border-radius: 8px; background: color-mix(in srgb, var(--dsc-warn) 8%, transparent); color: var(--dsc-warn); }
.dsc-mermaid-error-line { font-size: 12px; font-weight: 600; }
.dsc-mermaid-error-text { margin-top: 2px; font-size: 11.4px; line-height: 1.5; opacity: 0.85; }
.dsc-mermaid-source { margin: 0; max-height: 260px; overflow: auto; padding: 9px 10px; border-radius: 8px; background: var(--dsc-code-bg); }
.dsc-mermaid-source code { font-family: var(--dsc-mono); font-size: 11.8px; white-space: pre; }

/* ---------- message actions / notices ---------- */
.dsc-msg-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; margin-top: 7px; opacity: 0; transition: opacity var(--dsc-fast) ease; }
.dsc-msg-assistant:hover .dsc-msg-actions,
.dsc-msg-assistant:focus-within .dsc-msg-actions,
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
.dsc-msg-model { font-size: 10.8px; color: var(--dsc-muted); margin-left: 6px; white-space: nowrap; }
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
/* One rounded surface owns the border. The textarea inside is a bare,
   transparent field: a text input must never draw a second rectangle (or a
   browser focus outline) inside this container. Focus feedback is a quiet
   border tone change, with one very light keyboard-only ring; there is no
   white double frame and no glow. */
.dsc-composer {
  position: relative;
  max-width: 788px;
  margin: 0 auto;
  padding: 8px 10px 8px 14px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 24px;
  background: var(--dsc-layer);
  box-shadow: var(--dsc-shadow-composer);
  transition: border-color var(--dsc-fast) ease, box-shadow var(--dsc-fast) ease;
}
.dsc-composer:has(.dsc-editor-field:focus) {
  border-color: color-mix(in srgb, var(--dsc-brand) 34%, var(--dsc-border-strong));
}
.dsc-composer:has(.dsc-editor-field:focus-visible) {
  box-shadow: 0 0 0 1px var(--dsc-brand-soft-strong), var(--dsc-shadow-composer);
}
.dsc-composer.is-drag { border-color: var(--dsc-brand); }
.dsc-composer.has-warning { border-color: color-mix(in srgb, var(--dsc-warn) 42%, var(--dsc-border-strong)); }
.dsc-composer-main { display: flex; flex-direction: column; min-width: 0; }
.dsc-editor { position: relative; display: flex; min-width: 0; }
.dsc-editor-field {
  display: block;
  width: 100%;
  min-height: 30px;
  max-height: 220px;
  margin: 0;
  padding: 6px 2px 4px;
  border: 0 !important;
  border-radius: 0;
  outline: 0 !important;
  box-shadow: none !important;
  appearance: none;
  -webkit-appearance: none;
  resize: none;
  overflow-y: hidden;
  background: transparent;
  color: var(--dsc-text);
  caret-color: var(--dsc-brand);
  font-family: inherit;
  font-size: 15.2px;
  line-height: 1.6;
}
.dsc-editor-field::placeholder { color: var(--dsc-muted); }
.dsc-editor-field:focus,
.dsc-editor-field:focus-visible {
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
}
.dsc-composer-warning {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 2px 2px 2px 0;
  color: var(--dsc-warn);
  font-size: 11.8px;
  line-height: 1.45;
}
.dsc-composer-warning .dsc-inline-button { color: var(--dsc-warn); }
.dsc-composer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 34px;
  margin-top: 2px;
}
.dsc-composer-left { display: flex; align-items: center; gap: 4px; min-width: 0; flex-wrap: nowrap; }
.dsc-composer-right { display: flex; align-items: center; gap: 4px; flex: none; }
/* Direct on/off controls for web search and deep thinking. They are always in
   the same place: only the tint changes, so toggling never resizes the editor
   or moves the model chip. */
.dsc-tool-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: var(--dsc-control-h);
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 12.1px;
  font-weight: 550;
  white-space: nowrap;
  flex: none;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease, border-color var(--dsc-fast) ease;
}
.dsc-tool-toggle:hover:not(:disabled) { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-tool-toggle.is-on {
  border-color: color-mix(in srgb, var(--dsc-link) 16%, transparent);
  background: var(--dsc-brand-soft);
  color: var(--dsc-link);
}
.dsc-tool-toggle.is-on:hover:not(:disabled) { background: var(--dsc-brand-soft-strong); }
.dsc-tool-toggle:disabled { opacity: 0.42; cursor: default; }
.dsc-tool-toggle-label { overflow: hidden; text-overflow: ellipsis; }
.dsc-model-control,
.dsc-effort-control { position: relative; display: flex; }
.dsc-model-trigger,
.dsc-effort-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: var(--dsc-control-h);
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 12.1px;
  font-weight: 550;
  white-space: nowrap;
  flex: none;
}
.dsc-model-trigger { max-width: 170px; }
.dsc-effort-trigger { max-width: 116px; }
.dsc-model-trigger:hover,
.dsc-model-trigger.is-open,
.dsc-effort-trigger:hover,
.dsc-effort-trigger.is-open { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-model-name { overflow: hidden; text-overflow: ellipsis; }
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
.dsc-textarea:focus,
.dsc-textarea:focus-visible { outline: 0; box-shadow: none; }
.dsc-prompt:focus,
.dsc-prompt:focus-visible,
.dsc-handoff-brief:focus,
.dsc-handoff-brief:focus-visible {
  border-color: color-mix(in srgb, var(--dsc-brand) 42%, var(--dsc-border-strong));
  box-shadow: none;
}
.dsc-file-input { display: none; }
.dsc-tools { position: relative; display: flex; flex: none; }
.dsc-tools-trigger {
  position: relative;
  width: 32px;
  height: 32px;
  border: 1px solid var(--dsc-border);
  border-radius: 999px;
  background: transparent;
  color: var(--dsc-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease, border-color var(--dsc-fast) ease;
}
.dsc-tools-trigger:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-tools-trigger.is-open { background: var(--dsc-active); color: var(--dsc-text); }

/* ---------- popovers (tools + model + effort) ----------
   One small floating card anchored to its trigger, opening upward by default.
   The placement hook flips it when the composer sits too low and clamps its
   height to the viewport, so the card never clips against a window edge. */
.dsc-popover {
  position: absolute;
  z-index: 24;
  bottom: calc(100% + 8px + var(--dsc-popover-gap, 0px));
  left: 0;
  padding: 6px;
  border: 1px solid var(--dsc-border);
  border-radius: 14px;
  background: var(--dsc-layer);
  box-shadow: var(--dsc-shadow-popover);
  overflow-y: auto;
  overscroll-behavior: contain;
  animation: dsc-pop 0.12s ease;
}
.dsc-popover[data-placement='bottom'] { bottom: auto; top: calc(100% + 8px); }
.dsc-tools-menu {
  width: 282px;
  max-width: calc(100vw - 32px);
}
.dsc-model-menu {
  left: auto;
  right: 0;
  width: max-content;
  min-width: 216px;
  max-width: min(300px, calc(100vw - 32px));
}
.dsc-effort-menu {
  left: auto;
  right: 0;
  width: max-content;
  min-width: 158px;
  max-width: min(220px, calc(100vw - 32px));
}
@keyframes dsc-pop { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.dsc-popover-sep { height: 1px; margin: 4px 2px; background: var(--dsc-border); }
.dsc-popover-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 9px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--dsc-text);
  text-align: left;
  font-size: 13px;
}
.dsc-popover-item:hover:not(.is-disabled) { background: var(--dsc-hover); }
.dsc-popover-item.is-active { background: color-mix(in srgb, var(--dsc-link) 7%, transparent); }
.dsc-popover-item.is-disabled { cursor: default; color: var(--dsc-muted); }
.dsc-popover-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--dsc-layer2);
  color: var(--dsc-muted);
  flex: none;
}
.dsc-popover-item.is-active .dsc-popover-item-icon { background: var(--dsc-brand-soft); color: var(--dsc-link); }
.dsc-popover-item-main { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
.dsc-popover-item-title { font-size: 12.9px; font-weight: 560; }
.dsc-popover-item-desc { font-size: 11px; line-height: 1.45; color: var(--dsc-muted); }
.dsc-popover-item-desc.is-warn { color: var(--dsc-warn); }
.dsc-popover-item-state { font-size: 10.8px; color: var(--dsc-muted); flex: none; }
.dsc-popover-item .dsc-switch { flex: none; }
.dsc-popover-item .dsc-switch-thumb { width: 16px; height: 16px; }
.dsc-popover-item .dsc-switch.is-on .dsc-switch-thumb { transform: translateX(14px); }
/* The + card: a normal list of actions, never a settings panel. */
.dsc-tool-item { padding: 9px; }
.dsc-tool-item .dsc-popover-item-icon { background: var(--dsc-field); }
/* Model list: names only, with one check and an optional one-line limitation. */
.dsc-model-list { display: flex; flex-direction: column; gap: 2px; padding: 2px; }
.dsc-model-option { align-items: center; }
.dsc-model-option.is-selected { background: var(--dsc-brand-soft); }
.dsc-model-option.is-selected .dsc-popover-item-title { color: var(--dsc-text); }
.dsc-model-option > .dsc-icon { color: var(--dsc-link); flex: none; }
.dsc-model-note { font-size: 10.7px; line-height: 1.4; color: var(--dsc-muted); }
.dsc-model-scope {
  margin: 6px 2px 1px;
  padding: 7px 8px 2px;
  border-top: 1px solid var(--dsc-border);
  font-size: 10.9px;
  line-height: 1.45;
  color: var(--dsc-muted);
}
/* Thinking effort: four discrete rows, Off first, then the API tiers. */
.dsc-effort-list { display: flex; flex-direction: column; gap: 1px; padding: 2px; }
.dsc-effort-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  height: 33px;
  padding: 0 9px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-text);
  font-size: 12.7px;
  font-weight: 540;
  text-align: left;
}
.dsc-effort-option:hover { background: var(--dsc-hover); }
.dsc-effort-option.is-selected { background: var(--dsc-hover); }
.dsc-effort-option .dsc-icon { color: var(--dsc-link); flex: none; }
.dsc-effort-option-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsc-send-button {
  width: var(--dsc-control-h);
  height: var(--dsc-control-h);
  border: 0;
  border-radius: 999px;
  background: var(--dsc-brand);
  color: var(--dsc-on-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  transition: filter var(--dsc-fast) ease, background var(--dsc-fast) ease, color var(--dsc-fast) ease;
}
.dsc-send-button:hover { filter: brightness(1.07); }
.dsc-send-button.is-idle {
  background: var(--dsc-layer2);
  color: var(--dsc-muted);
  opacity: 0.9;
}
.dsc-stop-button {
  width: var(--dsc-control-h);
  height: var(--dsc-control-h);
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
/* Rendered as a native modal <dialog> (top layer), so the Chat shell's own
   stacking context cannot put the mode switch above the mask. These resets keep
   the original full-viewport mask and centered card layout. */
.dsc-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  border: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: inherit;
  background: var(--dsw-alias-bg-mask-1, color-mix(in srgb, #0b0f19 46%, transparent));
  backdrop-filter: blur(3px);
  animation: dsc-fade var(--ds-transition-duration-fast, 0.1s) ease;
}
.dsc-modal-backdrop::backdrop { background: transparent; }
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
/* One compact form layout shared by create/rename prompts: header, a full-width
   field, then right-aligned actions. The width belongs to the dialog, not to
   the intrinsic width of an input. */
.dsc-modal.dsc-form-modal { width: min(420px, 100%); }
.dsc-form-modal .dsc-modal-body { padding: 18px 20px 20px; }
.dsc-form-modal .dsc-field { gap: 8px; }
.dsc-form-modal .dsc-input { height: 38px; font-size: 13.2px; }
.dsc-modal-foot-note:empty { min-height: 1px; }
.dsc-modal-head { display: flex; align-items: flex-start; gap: 12px; padding: 18px 20px 14px; border-bottom: 1px solid var(--dsc-border); }
.dsc-modal-head h2 { margin: 0; font-size: 16.5px; font-weight: 620; letter-spacing: -0.01em; }
.dsc-modal-sub { margin: 4px 0 0; font-size: 11.9px; color: var(--dsc-muted); line-height: 1.55; }
.dsc-modal-head .dsc-icon-button { margin-left: auto; }
.dsc-modal-body { overflow-y: auto; padding: 16px 20px 18px; display: flex; flex-direction: column; gap: 16px; }
.dsc-modal-foot { display: flex; align-items: center; gap: 8px; padding: 12px 20px 16px; border-top: 1px solid var(--dsc-border); }
.dsc-modal-foot-note { flex: 1; min-width: 0; font-size: 11.5px; color: var(--dsc-muted); }
.dsc-settings-title { margin: 0 0 7px 2px; font-size: 11.8px; font-weight: 620; color: var(--dsc-muted); }
.dsc-settings-section { display: flex; flex-direction: column; gap: 6px; }
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
.dsc-field-hint.is-warning { color: var(--dsc-warn); }
.dsc-segment { display: inline-flex; align-self: flex-start; gap: 2px; padding: 2px; border: 1px solid var(--dsc-border); border-radius: 9px; background: var(--dsc-layer2); }
.dsc-segment-button { height: 29px; padding: 0 11px; border: 0; border-radius: 7px; background: transparent; color: var(--dsc-muted); font-size: 12px; font-weight: 550; }
.dsc-segment-button.is-active { background: var(--dsc-layer); color: var(--dsc-text); box-shadow: 0 1px 3px rgba(9, 12, 20, 0.1); }
.dsc-key-row { display: flex; gap: 7px; align-items: center; }
.dsc-input {
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 9px;
  background: var(--dsc-bg);
  color: var(--dsc-text);
  outline: 0;
  font-size: 12.9px;
  transition: border-color var(--dsc-fast) ease, box-shadow var(--dsc-fast) ease;
}
.dsc-input::placeholder { color: var(--dsc-muted); }
.dsc-input:focus,
.dsc-input:focus-visible {
  outline: 0;
  border-color: color-mix(in srgb, var(--dsc-brand) 42%, var(--dsc-border-strong));
  box-shadow: none;
}
.dsc-input:disabled { opacity: 0.58; }
.dsc-select {
  height: 36px;
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
.dsc-select:focus,
.dsc-select:focus-visible {
  outline: 0;
  border-color: color-mix(in srgb, var(--dsc-brand) 42%, var(--dsc-border-strong));
  box-shadow: none;
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
.dsc-workspace-creator {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 12px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 12px;
  background: var(--dsc-layer2);
}
.dsc-workspace-creator-head { display: flex; align-items: center; gap: 7px; }
.dsc-workspace-creator-head strong { font-size: 12.6px; font-weight: 620; }
.dsc-workspace-creator-head .dsc-icon { color: var(--dsc-link); flex: none; }
.dsc-workspace-creator-close { margin-left: auto; width: 26px; height: 26px; }
.dsc-workspace-picks { display: flex; flex-wrap: wrap; gap: 7px; }
.dsc-workspace-picks .dsc-secondary-button { height: 31px; padding: 0 11px; font-size: 12px; }
.dsc-workspace-creator-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 1px; }
.dsc-workspace-creator-actions .dsc-primary-button,
.dsc-workspace-creator-actions .dsc-secondary-button { height: 33px; padding: 0 13px; font-size: 12.4px; }
.dsc-workspace-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 7px 9px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--dsc-warn) 7%, transparent);
}
.dsc-workspace-hint span { font-size: 11.4px; line-height: 1.5; color: var(--dsc-muted); }
.dsc-workspace-hint .dsc-text-button { padding: 0 6px; font-size: 11.8px; }
.dsc-field-actions { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.dsc-data-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dsc-path { max-width: 68%; overflow-x: auto; padding: 5px 7px; border-radius: 6px; background: var(--dsc-layer2); font-size: 11.2px; white-space: nowrap; font-family: var(--dsc-mono); }
.dsc-about-row { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: var(--dsc-muted); }
.dsc-about-row strong { color: var(--dsc-text); font-weight: 580; }
.dsc-confirm { width: min(420px, 100%); padding: 20px; border: 1px solid var(--dsc-border); border-radius: 16px; background: var(--dsc-layer); box-shadow: var(--dsc-shadow); animation: dsc-rise 0.16s ease; }
.dsc-confirm h2 { margin: 0 0 7px; font-size: 16px; font-weight: 620; letter-spacing: -0.01em; }
.dsc-confirm p { margin: 0; font-size: 12.9px; line-height: 1.62; color: var(--dsc-muted); }
.dsc-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }

/* ---------- popup menu ---------- */
.dsc-menu-backdrop { position: fixed; inset: 0; z-index: 26; background: transparent; }
.dsc-menu {
  position: fixed;
  z-index: 27;
  min-width: 198px;
  padding: 5px;
  border: 1px solid var(--dsc-border);
  border-radius: 11px;
  background: var(--dsc-layer);
  box-shadow: var(--dsc-shadow);
  animation: dsc-rise 0.12s ease;
}
.dsc-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 32px;
  padding: 0 9px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-text);
  font-size: 12.8px;
  text-align: left;
}
.dsc-menu-item:hover { background: var(--dsc-hover); }
.dsc-menu-item .dsc-icon { color: var(--dsc-muted); }
.dsc-menu-item.is-danger { color: var(--dsc-error); }
.dsc-menu-item.is-danger .dsc-icon { color: var(--dsc-error); }
.dsc-menu-separator { height: 1px; margin: 4px 6px; background: var(--dsc-border); }

/* ---------- folder pickers / archive manager ---------- */
.dsc-folder-name-input { margin: 0; }
.dsc-dialog-list { display: flex; flex-direction: column; gap: 2px; max-height: 48vh; overflow-y: auto; }
.dsc-choice {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 38px;
  padding: 6px 9px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--dsc-text);
  text-align: left;
  font-size: 12.9px;
}
.dsc-choice:hover { background: var(--dsc-hover); }
.dsc-choice.is-selected { border-color: color-mix(in srgb, var(--dsc-brand) 20%, transparent); background: var(--dsc-brand-soft); }
.dsc-choice-icon { display: inline-flex; flex: none; color: var(--dsc-muted); }
.dsc-choice-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsc-choice-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex: none;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 5px;
  color: var(--dsc-link);
}
.dsc-choice.is-selected .dsc-choice-check { border-color: var(--dsc-brand); background: var(--dsc-brand-soft); }
.dsc-choice-hint { display: inline-flex; flex: none; color: var(--dsc-muted); }
.dsc-secondary-button.is-small-compact { height: 29px; padding: 0 10px; font-size: 12px; }
.dsc-archive-list { display: flex; flex-direction: column; gap: 2px; }
.dsc-archive-item { display: flex; align-items: center; gap: 10px; padding: 8px 6px; border-bottom: 1px solid var(--dsc-border); }
.dsc-archive-item:last-child { border-bottom: 0; }
.dsc-archive-item-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.dsc-archive-item-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 550; }
.dsc-archive-item-meta { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11.2px; color: var(--dsc-muted); }
.dsc-archive-actions { display: flex; align-items: center; gap: 4px; flex: none; }

/* ---------- long-term memory ---------- */
.dsc-settings-tabs { display: flex; gap: 2px; padding: 12px 20px 0; }
.dsc-settings-tab { height: 30px; padding: 0 12px; border: 0; border-radius: 8px; background: transparent; color: var(--dsc-muted); font-size: 12.2px; font-weight: 560; transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease; }
.dsc-settings-tab:hover:not(.is-active) { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-settings-tab.is-active { background: var(--dsc-brand-soft); color: var(--dsc-link); }
.dsc-memory-pane { display: flex; flex-direction: column; gap: 16px; }
.dsc-memory-state { display: flex; align-items: center; justify-content: center; gap: 9px; min-height: 140px; color: var(--dsc-muted); font-size: 12.6px; }
.dsc-memory-notice { display: flex; align-items: flex-start; gap: 10px; padding: 14px; border: 1px solid var(--dsc-border-strong); border-radius: 12px; background: color-mix(in srgb, var(--dsc-warn) 7%, transparent); }
.dsc-memory-notice .dsc-icon { color: var(--dsc-warn); flex: none; margin-top: 1px; }
.dsc-memory-notice-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.dsc-memory-notice-body strong { font-size: 12.8px; }
.dsc-memory-notice-body p { margin: 0; font-size: 11.7px; line-height: 1.6; color: var(--dsc-muted); word-break: break-word; }
.dsc-memory-notice .dsc-secondary-button { flex: none; height: 31px; padding: 0 11px; font-size: 12px; }
.dsc-memory-summary { display: flex; flex-direction: column; gap: 9px; }
.dsc-memory-summary-text { font-size: 12.5px; line-height: 1.68; color: var(--dsc-text); }
.dsc-memory-summary-text .dsc-paragraph { margin: 0 0 7px; }
.dsc-memory-summary-text .dsc-list { margin: 4px 0 8px; padding-left: 19px; }
.dsc-memory-summary-text .dsc-heading,
.dsc-memory-summary-text h1.dsc-heading,
.dsc-memory-summary-text h2.dsc-heading,
.dsc-memory-summary-text h3.dsc-heading { margin: 9px 0 4px; font-size: 13px; }
.dsc-memory-summary-text .dsc-quote { margin: 6px 0; }
.dsc-memory-summary-empty { margin: 0; font-size: 12.2px; line-height: 1.6; color: var(--dsc-muted); }
.dsc-memory-summary-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.dsc-memory-summary-meta { font-size: 11.3px; color: var(--dsc-muted); }
.dsc-memory-ask { display: flex; align-items: flex-end; gap: 8px; padding-top: 2px; }
.dsc-memory-ask-input { flex: 1; width: auto; min-width: 0; }
.dsc-memory-ask .dsc-primary-button { flex: none; }
.dsc-memory-ask-result { display: flex; flex-direction: column; gap: 6px; padding: 10px; border: 1px solid var(--dsc-border); border-radius: 10px; background: var(--dsc-layer); }
.dsc-memory-answer { margin: 0; font-size: 12.5px; line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
.dsc-memory-applied { margin: 0; font-size: 11.5px; color: var(--dsc-success); }
.dsc-memory-pending { display: flex; flex-direction: column; gap: 6px; padding-top: 7px; border-top: 1px solid var(--dsc-border); }
.dsc-memory-pending-title { margin: 0; font-size: 12.2px; font-weight: 580; }
.dsc-memory-pending-list { margin: 0; padding-left: 18px; font-size: 12.1px; line-height: 1.6; color: var(--dsc-muted); word-break: break-word; }
.dsc-memory-pending-actions { display: flex; justify-content: flex-end; gap: 7px; }
.dsc-memory-pending-actions .dsc-primary-button,
.dsc-memory-pending-actions .dsc-secondary-button { height: 31px; padding: 0 12px; font-size: 12.2px; }
.dsc-memory-list-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.dsc-memory-limit { font-size: 11.4px; color: var(--dsc-muted); }
.dsc-memory-filters { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
.dsc-memory-chip { display: inline-flex; align-items: center; gap: 5px; flex: none; height: 27px; padding: 0 9px; border: 1px solid var(--dsc-border); border-radius: 999px; background: transparent; color: var(--dsc-muted); font-size: 11.6px; font-weight: 550; white-space: nowrap; }
.dsc-memory-chip:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-memory-chip.is-active { border-color: color-mix(in srgb, var(--dsc-brand) 24%, transparent); background: var(--dsc-brand-soft); color: var(--dsc-link); }
.dsc-memory-chip-count { font-size: 10.8px; opacity: 0.72; }
.dsc-memory-add { display: flex; flex-direction: column; gap: 7px; }
.dsc-memory-add-row { display: flex; align-items: center; gap: 8px; }
.dsc-memory-add-row .dsc-select { flex: 1; min-width: 0; height: 33px; }
.dsc-memory-add-row .dsc-secondary-button { flex: none; height: 33px; padding: 0 13px; font-size: 12.3px; }
.dsc-memory-rows { display: flex; flex-direction: column; gap: 6px; max-height: 340px; overflow-y: auto; }
.dsc-memory-row { display: flex; flex-direction: column; gap: 6px; padding: 9px 10px; border: 1px solid var(--dsc-border); border-radius: 10px; background: var(--dsc-layer); }
.dsc-memory-content { margin: 0; font-size: 12.4px; line-height: 1.6; word-break: break-word; }
.dsc-memory-row-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.dsc-memory-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; min-width: 0; font-size: 11px; color: var(--dsc-muted); }
.dsc-memory-badge { display: inline-flex; align-items: center; max-width: 100%; padding: 1px 7px; border-radius: 999px; background: var(--dsc-brand-soft); color: var(--dsc-link); font-size: 10.8px; font-weight: 560; }
.dsc-memory-badge.is-duplicate { background: color-mix(in srgb, var(--dsc-warn) 12%, transparent); color: var(--dsc-warn); }
.dsc-memory-badge.is-exists { background: var(--dsc-brand-soft); color: var(--dsc-link); }
.dsc-memory-badge.is-sensitive { background: color-mix(in srgb, var(--dsc-error) 10%, transparent); color: var(--dsc-error); }
.dsc-memory-row-actions { display: flex; align-items: center; gap: 2px; flex: none; }
.dsc-memory-empty { margin: 0; padding: 16px 10px; border: 1px dashed var(--dsc-border-strong); border-radius: 10px; text-align: center; font-size: 12.2px; line-height: 1.6; color: var(--dsc-muted); }
.dsc-memory-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.dsc-memory-footer .dsc-secondary-button { display: inline-flex; align-items: center; gap: 6px; flex: none; }
.dsc-memory-input { width: 100%; min-height: 54px; max-height: 170px; padding: 8px 10px; border: 1px solid var(--dsc-border-strong); border-radius: 9px; background: var(--dsc-bg); color: var(--dsc-text); font-family: var(--dsc-font); font-size: 12.6px; line-height: 1.6; resize: vertical; outline: 0; }
.dsc-memory-input::placeholder { color: var(--dsc-muted); }
.dsc-memory-input:focus,
.dsc-memory-input:focus-visible { border-color: color-mix(in srgb, var(--dsc-brand) 42%, var(--dsc-border-strong)); outline: 0; }
.dsc-memory-input:disabled { opacity: 0.55; }
.dsc-switch:disabled { opacity: 0.45; cursor: default; }
.dsc-memory-import .dsc-modal { width: min(760px, 100%); }
.dsc-memory-import .dsc-modal-foot { flex-wrap: wrap; }
.dsc-memory-import-intro { margin: 0; font-size: 12.4px; line-height: 1.65; color: var(--dsc-muted); }
.dsc-memory-import-field { display: flex; flex-direction: column; gap: 7px; }
.dsc-memory-prompt-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.dsc-memory-prompt-head .dsc-secondary-button { display: inline-flex; align-items: center; gap: 5px; height: 29px; padding: 0 10px; font-size: 12px; }
.dsc-memory-prompt { margin: 0; max-height: 232px; overflow: auto; padding: 10px 12px; border: 1px solid var(--dsc-border); border-radius: 10px; background: var(--dsc-code-bg); font-family: var(--dsc-mono); font-size: 11.3px; line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
.dsc-memory-paste { min-height: 168px; max-height: 300px; font-family: var(--dsc-mono); font-size: 11.8px; }
.dsc-memory-consent { display: flex; flex-direction: column; gap: 8px; padding: 10px; border: 1px solid color-mix(in srgb, var(--dsc-warn) 30%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--dsc-warn) 7%, transparent); }
.dsc-memory-consent-text { margin: 0; font-size: 12px; line-height: 1.6; }
.dsc-memory-consent-actions { display: flex; justify-content: flex-end; gap: 7px; }
.dsc-memory-consent-actions .dsc-primary-button,
.dsc-memory-consent-actions .dsc-secondary-button { height: 31px; padding: 0 12px; font-size: 12.2px; }
.dsc-memory-preview-count { margin: 0; font-size: 11.8px; color: var(--dsc-muted); }
.dsc-memory-preview { display: flex; flex-direction: column; gap: 8px; max-height: 44vh; overflow-y: auto; padding-right: 2px; }
.dsc-memory-preview-row { display: flex; flex-direction: column; gap: 7px; padding: 10px; border: 1px solid var(--dsc-border); border-radius: 10px; background: var(--dsc-layer); }
.dsc-memory-preview-row.is-selected { border-color: color-mix(in srgb, var(--dsc-brand) 22%, var(--dsc-border)); }
.dsc-memory-preview-check { display: flex; align-items: center; gap: 7px; font-size: 11.6px; color: var(--dsc-muted); }
.dsc-memory-preview-check input { width: 14px; height: 14px; accent-color: var(--dsc-brand); }
.dsc-memory-preview-controls { display: flex; gap: 7px; }
.dsc-memory-preview-controls .dsc-select { flex: 1; min-width: 0; height: 32px; }
.dsc-memory-mode { max-width: 42%; }
.dsc-memory-preview-badges { display: flex; flex-wrap: wrap; gap: 5px; }
.dsc-memory-preview-badges:empty { display: none; }
.dsc-memory-preview-existing { margin: 0; font-size: 11.3px; line-height: 1.55; color: var(--dsc-muted); word-break: break-word; }
@media (max-width: 620px) {
  .dsc-settings-tabs { padding: 10px 14px 0; }
  .dsc-memory-ask { flex-direction: column; align-items: stretch; }
  .dsc-memory-ask .dsc-primary-button { align-self: flex-end; }
  .dsc-memory-footer { flex-direction: column; align-items: stretch; }
  .dsc-memory-footer .dsc-secondary-button { justify-content: center; }
  .dsc-memory-row-foot { flex-wrap: wrap; }
  .dsc-memory-preview-controls { flex-wrap: wrap; }
  .dsc-memory-mode { max-width: none; }
}

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
/* The drawer breakpoint matches the Harness frame's own drawer breakpoint
   (768px), so a narrow window puts both modes in the same posture. */
@media (max-width: 900px) {
  .dsc-header { padding: 0 10px 0 12px; }
  .dsc-thread { padding: 20px 14px 8px; }
  .dsc-composer-wrap { padding: 6px 12px 10px; }
  .dsc-msg-user { padding-left: 6%; }
  .dsc-msg-assistant { padding-right: 0; }
  .dsc-handoff-label { display: none; }
  .dsc-handoff-button { padding: 0 9px; }
}
@media (max-width: 768px) {
  /* Touch has no hover: keep the row menu and message actions reachable, and
     drop the timestamp that the menu button would otherwise cover. */
  .dsc-chat-item-time { display: none; }
  .dsc-chat-item-more,
  .dsc-folder-head .dsc-chat-item-more { display: inline-flex; }
  .dsc-msg-actions,
  .dsc-user-actions { opacity: 1; }
  /* Narrow windows keep the native drawer posture: the Chat sidebar overlays
     the content instead of taking a column, and the resize handle is moot. */
  .dsc-sidebar-column {
    position: fixed;
    inset: var(--dsc-top, 0px) auto 0 0;
    z-index: 12;
    display: flex;
    width: min(300px, 86vw);
    min-width: 0;
    max-width: none;
    box-shadow: var(--dsc-shadow);
    transform: translateX(-101%);
    transition: transform var(--ds-transition-duration-slow, 0.3s) var(--dsc-ease);
  }
  .dsc-sidebar-column.is-open { transform: translateX(0); }
  .dsc-sidebar-column:not(.is-open) { display: flex; }
  .dsc-sidebar { border-right: 0; }
  .dsc-sidebar-resizer { display: none; }
  .dsc-sidebar-backdrop {
    position: fixed;
    inset: var(--dsc-top, 0px) 0 0;
    z-index: 11;
    border: 0;
    padding: 0;
    background: var(--dsw-alias-bg-mask-1, color-mix(in srgb, #0b0f19 38%, transparent));
    backdrop-filter: blur(1px);
  }
}
@media (min-width: 769px) {
  .dsc-sidebar-backdrop { display: none; }
}
@media (max-width: 760px) {
  /* Narrow content column: shrink the whole control, keep both labels. */
  .dsc-modeswitch { --dsc-nav-width: 208px; --dsc-nav-height: 36px; font-size: 12.6px; }
  .dsc-modeswitch-item { font-size: 12.6px; }
  .dsc-greeting { font-size: clamp(23px, 5.6vw, 28px); }
  .dsc-empty { padding-bottom: 3vh; }
}
@media (max-width: 620px) {
  .dsc-model-trigger { max-width: 132px; }
  .dsc-effort-trigger { max-width: 84px; }
  .dsc-tool-toggle { width: 30px; padding: 0; justify-content: center; }
  .dsc-tool-toggle-label { display: none; }
  .dsc-header-title { display: none; }
  .dsc-thread { padding: 16px 12px 8px; }
  .dsc-composer-wrap { padding: 4px 10px 8px; }
  .dsc-user-bubble { font-size: 14.2px; }
  .dsc-user-edit-hint { display: none; }
  .dsc-user-bubble.is-editing { width: 100%; }
  /* Icon-only message actions leave room for copy, regenerate, continue and the
     version switcher on a phone-width content column. */
  .dsc-msg-action { width: 27px; padding: 0; justify-content: center; }
  .dsc-msg-action span { display: none; }
  .dsc-md { font-size: 14.4px; }
  .dsc-answer { font-size: 14.5px; }
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
    MemorySettingsPane,
    MemoryImportDialog,
    parseMemoryExport,
    MEMORY_IMPORT_PROMPT,
    memoryCategoryIds,
    memoryCategoryLabel,
    parseMemoryDate,
    HandoffDialog,
    HandoffWorkspaceCreator,
    NEW_WORKSPACE_OPTION,
    handoffWorkspaceSuggestion,
    workspaceNameFromTitle,
    workspaceFolderLeaf,
    workspaceDraftIssue,
    stripPathQuotes,
    pathParent,
    pathBasename,
    joinWorkspacePath,
    isAbsoluteWorkspacePath,
    AssistantMessage,
    UserMessage,
    UserMessageEditor,
    VersionNav,
    SearchResults,
    ContextMenu,
    FolderPromptDialog,
    MoveChatDialog,
    FolderAddDialog,
    ArchiveDialog,
    Composer,
    EmptyState,
    Sidebar,
    SidebarResizer,
    DeepSeekLockup,
    Markdown,
    parseMarkdown,
    renderBlock,
    renderInline,
    thinkingSeconds,
    thinkingDurationMs,
    chatPageIsBlank,
    readAgentPageState,
    clampSidebarWidth,
    greetingUserName,
    greetingText,
    pickGreetingIndex,
    canContinueReply,
    messageBodyText,
    menuPoint,
    organizeSidebar,
    byActivity,
    GREETINGS,
    SIDEBAR_MIN,
    SIDEBAR_MAX,
    SIDEBAR_DEFAULT,
    DICTS: { zh: DICT_ZH, en: DICT_EN },
    // Composer and model/tools surfaces.
    composerKeySends,
    collectMessageSources,
    answerText,
    citationMark,
    SourcePanel,
    SourceRow,
    ToolsMenu,
    ModelMenu,
    EffortMenu,
    chatToolDefinitions,
    chatMenuTools,
    composerToolDefinitions,
    activeChatTools,
    registerChatTool,
    modelCatalog,
    modelById,
    modelCapability,
    modelEfforts,
    modelTriggerLabel,
    modelNotes,
    modelChipLabel,
    currentModelChoice,
    // Rendering helpers, so the checks can exercise them without a browser.
    highlightCode,
    highlightLines,
    normalizeCodeLang,
    parseLatex,
    latexToNodes,
    LatexInline,
    LatexBlock,
    parseMermaid,
    mermaidLayout,
    MermaidDiagram,
  })
}

    return { inject: ['slots', 'locale'], apply }
  },
})
