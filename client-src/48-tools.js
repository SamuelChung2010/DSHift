/**
 * The composer's "+" tools menu.
 *
 * Every Chat capability that is not a plain setting is defined once, here, as a
 * small descriptor. The menu, the active-tool chips above the input and future
 * entry points all read the same list, so adding a tool (image generation, deep
 * research, document generation, code execution, ...) never means touching the
 * composer or the menu markup again:
 *
 *   registerChatTool({
 *     id: 'image-generation',
 *     kind: 'action',                 // or "toggle" for an on/off capability
 *     icon: 'image',
 *     labelKey: 'toolImageGen',
 *     hintKey: 'toolImageGenHint',
 *     run: () => chatActions.openImageGeneration(),
 *   })
 *
 * Tools that are not implemented yet must NOT be registered: the menu only ever
 * shows entries that do something.
 */

const EXTRA_CHAT_TOOLS = []

/** The tools that already work, in menu order. */
const BUILTIN_CHAT_TOOLS = [
  {
    id: 'upload',
    kind: 'action',
    icon: 'paperclip',
    labelKey: 'uploadFiles',
    hintKey: 'uploadFilesHint',
    order: 10,
    run: () => chatActions.requestFilePicker(),
  },
  {
    id: 'web-search',
    kind: 'toggle',
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

/** Add one tool to the composer menu; returns its unregister function. */
function registerChatTool(definition) {
  if (definition === null || typeof definition !== 'object' || typeof definition.id !== 'string' || definition.id === '') {
    throw new Error('deepseek-chat: a tool needs a stable id')
  }
  if (typeof definition.run !== 'function') throw new Error('deepseek-chat: a tool needs run()')
  const entry = { order: 100, kind: 'action', ...definition }
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

/**
 * Tools that currently render as an active chip in the composer: only stateful
 * tools whose state is on. Plain actions never take permanent space.
 */
function activeChatTools(state) {
  return chatToolDefinitions().filter(tool => tool.kind === 'toggle' && tool.active?.(state) === true)
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
  const active = tool.kind === 'toggle' && tool.active?.(state) === true
  const uploading = tool.id === 'upload' && state.attachments.some(item => item.status === 'uploading')
  const role = tool.kind === 'toggle' ? 'menuitemcheckbox' : 'menuitem'
  const description = enabled
    ? t(tool.hintKey ?? tool.labelKey)
    : t(availability.reasonKey ?? 'toolUnavailable')
  return h('button', {
    type: 'button',
    role,
    className: cx('dsc-popover-item', active && 'is-active', !enabled && 'is-disabled'),
    'aria-checked': tool.kind === 'toggle' ? active : undefined,
    'aria-disabled': enabled ? undefined : 'true',
    'data-tool': tool.id,
    'data-index': index,
    disabled: !enabled,
    title: description,
    onClick: () => {
      if (!enabled) return
      tool.run()
      if (tool.kind === 'action') onClose()
    },
  },
    h('span', { className: 'dsc-popover-item-icon' }, h(Icon, { name: tool.icon, size: 18 })),
    h('span', { className: 'dsc-popover-item-main' },
      h('span', { className: 'dsc-popover-item-title' }, t(tool.labelKey)),
      h('span', { className: cx('dsc-popover-item-desc', !enabled && 'is-warn') }, description),
    ),
    tool.kind === 'toggle'
      ? h('span', { className: cx('dsc-switch', active && 'is-on'), 'aria-hidden': 'true' }, h('span', { className: 'dsc-switch-thumb' }))
      : uploading
        ? h('span', { className: 'dsc-popover-item-state' }, t('toolUploading'))
        : null,
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
  const tools = chatToolDefinitions()
  const toolsState = state
  const anyActive = tools.some(tool => tool.kind === 'toggle' && tool.active?.(toolsState) === true)
  const close = () => setOpen(false)
  return h('div', { className: 'dsc-tools' },
    h('button', {
      ref: triggerRef,
      type: 'button',
      className: cx('dsc-tools-trigger', open && 'is-open', anyActive && 'has-active'),
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
          style: layout.maxHeight === null ? undefined : { maxHeight: `${layout.maxHeight}px` },
          onKeyDown: event => handleMenuKeyDown(event, { container: panelRef.current, onClose: close, trigger: triggerRef }),
        },
        h('div', { className: 'dsc-popover-title' }, t('toolsMenu')),
        tools.map((tool, index) => h(ToolMenuItem, {
          key: tool.id,
          tool,
          index,
          state: toolsState,
          onClose: close,
        })),
        toolsState.settings.search || toolsState.settings.thinking
          ? h('p', {
              className: 'dsc-popover-hint dsc-tools-hint',
            }, toolsState.settings.search && toolsState.settings.thinking
              ? t('deepSearchHint')
              : toolsState.settings.search
                ? t('quickSearchHint')
                : t('pureThinkingHint'))
          : null,
      )
      : null,
  )
}
