function apply(ctx) {
  setClientContext(ctx)
  ctx.effect(() => ctx.locale.register(CHAT_NS, { zh: DICT_ZH, en: DICT_EN }), 'deepseek-chat-mode: dictionaries')
  ctx.effect(injectChatStyles, 'deepseek-chat-mode: styles')
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'deepseek-chat-mode',
    order: 5,
    locale: CHAT_NS,
  }, ChatRoot))
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'deepseek-chat-mode',
    order: 5,
    locale: CHAT_NS,
  }, ChatToggle))
  if (chatStore.state.open) void ensureBoot()
}

if (typeof globalThis.__DSC_TEST_HOOK__ === 'function') {
  globalThis.__DSC_TEST_HOOK__({
    chatStore,
    chatActions,
    ChatRoot,
    ChatToggle,
    SettingsDialog,
    AssistantMessage,
    Composer,
    Markdown,
    parseMarkdown,
    renderBlock,
    renderInline,
  })
}
