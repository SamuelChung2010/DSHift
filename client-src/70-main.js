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
    chatToolDefinitions,
    activeChatTools,
    registerChatTool,
    modelCatalog,
    modelById,
    modelCapability,
    modelEfforts,
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
