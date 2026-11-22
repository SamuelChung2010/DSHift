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
    run: () => chatActions.openFilePicker('tools-menu'),
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

/**
 * One row in the "+" card. Follows the native Harness command-menu row:
 * icon + name on the left, one quiet description aligned on the right.
 */
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
    className: 'dsc-tool-item',
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
    h('span', { className: 'dsc-tool-icon' }, h(Icon, { name: tool.icon, size: 16 })),
    h('span', { className: 'dsc-tool-name' }, t(tool.labelKey)),
    h('span', { className: cx('dsc-tool-desc', !enabled && 'is-warn') }, description),
    uploading
      ? h('span', { className: 'dsc-tool-state' }, t('toolUploading'))
      : toggle && active
        ? h('span', { className: 'dsc-tool-check' }, h(Icon, { name: 'check', size: 14 }))
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
  // The native command card is the width of the composer and sits just above
  // it, not above the small trigger. The placement hook resolves that geometry
  // from the composer the trigger belongs to.
  const layout = usePopupPlacement(open, triggerRef, panelRef, { alignToComposer: true })
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
      title: t('addFiles'),
      'aria-label': t('addFiles'),
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
    }, h(Icon, { name: 'composerPlus', size: 14 })),
    open
      ? h('div', {
          ref: panelRef,
          className: 'dsc-popover dsc-tools-menu',
          role: 'menu',
          'aria-label': t('addFiles'),
          'data-placement': layout.placement,
          style: popoverStyle(layout),
          onKeyDown: event => handleMenuKeyDown(event, { container: panelRef.current, onClose: close, trigger: triggerRef }),
        },
        h('div', { className: 'dsc-menu-section', role: 'presentation' }, t('fileSection')),
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
