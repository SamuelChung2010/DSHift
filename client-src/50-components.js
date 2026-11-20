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
