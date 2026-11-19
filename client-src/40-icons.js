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
