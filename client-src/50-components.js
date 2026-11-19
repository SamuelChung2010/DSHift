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
  return h('div', { className: 'dsc-thread', ref, 'aria-label': tr('appTitle') },
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
    title: conversation.title || t('newChatTitle'),
  },
    h('button', {
      type: 'button',
      className: 'dsc-chat-item-main',
      onClick: onOpen,
    },
      h('span', { className: 'dsc-chat-item-title' }, conversation.title || t('newChatTitle')),
      h('span', { className: 'dsc-chat-item-time' }, relativeTime(conversation.updatedAt, t)),
    ),
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
  const messages = useChat(state => state.messages)
  const auth = useChat(state => state.auth)
  const sidebarOpen = useChat(state => state.sidebarOpen)
  const conversation = conversations.find(item => item.id === activeId)
  const canDraft = messages.length > 0
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
      h('div', { className: 'dsc-header-title' }, conversation?.title || t('newChatTitle')),
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

/**
 * The shared Chat | Agent navigation. It is registered in the frame-wide
 * overlay (root scope, outside every column), so it is part of the shell
 * chrome rather than of either view: it sits in the desktop caption row above
 * the window's drag strip, stays visible in both modes, and switches the whole
 * application view. The toast stack rides along because messages raised while
 * the Chat surface is closed (`handoffSent`, a background stream failure) must
 * still be visible.
 *
 * Horizontally it is centered on the main content column, not on the window:
 * - Agent mode: the stylesheet centers it between the native sidebar's right
 *   edge and the frame's right edge, using the width the frame publishes as
 *   `--dsh-windows-sidebar-width`. That follows a sidebar drag or collapse with
 *   no script and no pixel constants.
 * - Chat mode: the Chat surface is this plugin's own layout, so its main column
 *   is measured directly (and re-measured when the chat sidebar or the window
 *   changes). Either way the sidebar width is never assumed.
 */
function ModeSwitch() {
  const t = useT()
  const open = useChat(state => state.open)
  const ref = React.useRef(null)
  React.useLayoutEffect(() => {
    if (typeof document === 'undefined') return undefined
    let frame = 0
    const apply = () => {
      frame = 0
      const node = ref.current
      if (node === null) return
      const main = open ? document.querySelector('.dsc-main') : null
      if (main === null) {
        // Agent mode: hand the positioning back to the stylesheet.
        node.style.removeProperty('left')
        node.style.removeProperty('right')
        node.style.removeProperty('transform')
        return
      }
      const rect = main.getBoundingClientRect()
      node.style.left = `${Math.round(rect.left + rect.width / 2)}px`
      node.style.right = 'auto'
      node.style.transform = 'translateX(-50%)'
    }
    const schedule = () => { if (frame === 0) frame = requestAnimationFrame(apply) }
    apply()
    const targets = [document.body]
    const main = open ? document.querySelector('.dsc-main') : null
    if (main !== null) targets.push(main)
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
  }, [open])
  const item = (mode, label, selected) => h('button', {
    type: 'button',
    'aria-pressed': selected,
    className: cx('dsc-modeswitch-item', selected && 'is-active'),
    title: mode === 'chat' ? t('switchToChat') : t('switchToAgent'),
    onClick: () => chatActions.setMode(mode),
  }, h('span', { className: 'dsc-modeswitch-label' }, label))
  return h('div', { className: 'dsc-shell' },
    h('div', { className: 'dsc-modeswitch', role: 'group', 'aria-label': t('modeSwitchLabel'), ref },
      item('chat', t('chatMode'), open),
      item('agent', t('agentMode'), !open),
    ),
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
        if (chatStore.state.handoff !== null && chatStore.state.handoff.busy !== true) {
          chatActions.closeHandoff()
          return
        }
        if (settingsOpen) chatStore.set({ settingsOpen: false })
        return
      }
      if (event.key !== 'Tab') return
      const root = rootRef.current
      if (!root) return
      // A dialog traps focus on its own; otherwise the surface and the shared
      // switch form one scope, so Tab never reaches the native Agent UI that
      // stays mounted underneath.
      const modal = root.querySelector('.dsc-modal, .dsc-confirm')
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
  )
}
