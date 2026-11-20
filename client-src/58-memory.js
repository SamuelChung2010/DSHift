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
      h('div', { className: 'dsc-memory-footer-actions' },
        h('button', {
          type: 'button', className: 'dsc-secondary-button',
          onClick: () => chatActions.openImportMemory(),
        }, h(Icon, { name: 'import', size: 15 }), t('memoryExtractFromChats')),
        h('button', {
          type: 'button', className: 'dsc-secondary-button',
          onClick: () => setImportOpen(true),
        }, h(Icon, { name: 'brain', size: 15 }), t('memoryImportOpen')),
      ),
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

/**
 * Optional memory pass over imported chats. Opened from the import result or
 * from the memory settings tab with an explicit batch of conversation ids.
 * Nothing is sent until the user confirms the cost notice; the analysis marks
 * the conversations it covered and returns preview candidates only. Saving
 * reuses the ordinary memory `import` action, so merge/dedupe/tombstones stay
 * in one place and a failure here can never touch the imported chat itself.
 */
function ImportMemoryDialog({ onClose }) {
  const t = useT()
  const batch = useChat(state => state.importMemoryBatch)
  const conversations = useChat(state => state.conversations)
  const rows = React.useMemo(() => {
    const byId = new Map((Array.isArray(conversations) ? conversations : []).map(item => [item.id, item]))
    return (Array.isArray(batch) ? batch : []).map(id => byId.get(id)).filter(item => item !== undefined)
  }, [batch, conversations])
  const [selected, setSelected] = React.useState(() => new Set(
    (Array.isArray(chatStore.state.importMemoryBatch) ? chatStore.state.importMemoryBatch : []).filter((id) => {
      const conversation = (chatStore.state.conversations ?? []).find(item => item.id === id)
      return conversation !== undefined && typeof conversation.source?.memoryExtractedAt !== 'number'
    }),
  ))
  const [reanalyze, setReanalyze] = React.useState(false)
  const [consent, setConsent] = React.useState(false)
  const [step, setStep] = React.useState('pick')
  const [items, setItems] = React.useState([])
  const [meta, setMeta] = React.useState(null)
  const [busy, setBusy] = React.useState('')
  const [error, setError] = React.useState('')
  const alive = React.useRef(true)

  React.useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])

  const close = () => {
    if (typeof onClose === 'function') onClose()
  }

  const dismiss = () => {
    if (busy === '') close()
  }

  const extracted = row => typeof row?.source?.memoryExtractedAt === 'number'
  const isSelectable = row => reanalyze || !extracted(row)
  const selectableRows = rows.filter(isSelectable)
  const selectedRows = rows.filter(row => selected.has(row.id) && isSelectable(row))
  const selectedCount = selectedRows.length

  const toggleRow = (id) => {
    setSelected((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelected(new Set(selectableRows.map(row => row.id)))
  }

  const clearSelection = () => setSelected(new Set())

  const analyze = async () => {
    if (busy !== '' || selectedCount === 0) return
    const ids = selectedRows.map(row => row.id)
    const count = ids.length
    setConsent(false)
    setError('')
    setBusy('analyze')
    try {
      const data = await memoryRequest({
        action: 'extract.imported',
        conversationIds: ids,
        reanalyze,
        consent: true,
        locale: streamLocale(),
      })
      if (!alive.current) return
      chatActions.markImportMemoryAnalyzed(data?.analyzedIds)
      const entries = Array.isArray(data?.entries) ? data.entries : []
      const failed = Array.isArray(data?.failed) ? data.failed : []
      setMeta({ analyzed: data?.analyzed ?? 0, failed: failed.length, count: entries.length })
      if (entries.length === 0) {
        setStep('pick')
        if (failed.length > 0) setError(t('memoryExtractFailed', { message: memoryErrorText(failed[0].reason) }))
        else setError(t('memoryExtractEmpty'))
        if ((data?.analyzed ?? 0) > 0) chatStore.toast(t('memoryExtractDoneEmpty', { count: data.analyzed }), 'info')
        return
      }
      setItems(entries.map(row => memoryImportRow(row, null)))
      setStep('preview')
      if (failed.length > 0) chatStore.toast(t('memoryExtractPartial', { count: failed.length }), 'warning')
    } catch (fetchError) {
      if (alive.current) setError(t('memoryExtractFailed', { message: memoryErrorText(fetchError) }))
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
      const isOn = !item.selected
      const fallback = item.match?.kind === 'duplicate' ? 'merge' : item.match?.kind === 'conflict' ? 'update' : 'auto'
      return { ...item, selected: isOn, mode: isOn ? (item.mode === 'skip' ? fallback : item.mode) : 'skip' }
    }))
  }

  const selectItemMode = (index, mode) => {
    patchItem(index, { mode, selected: mode !== 'skip' })
  }

  const confirmedEntries = () => items
    .filter(item => item.selected && item.mode !== 'skip' && item.content.trim() !== '')
    .map((item) => {
      const entry = { content: item.content.trim(), category: item.category, mode: item.mode }
      const date = memoryImportDate(item.date)
      if (date !== undefined) entry.date = date
      return entry
    })

  const confirmImport = async () => {
    if (busy !== '') return
    const entries = confirmedEntries()
    if (entries.length === 0) {
      chatStore.toast(t('memoryImportNoneSelected'), 'error')
      return
    }
    setBusy('import')
    try {
      const data = await memoryRequest({ action: 'import', platform: 'other', entries })
      if (!alive.current) return
      const result = data?.result ?? {}
      chatStore.toast(t('memoryImportDone', {
        added: result.added ?? 0,
        merged: result.merged ?? 0,
        updated: result.updated ?? 0,
        skipped: result.skipped ?? 0,
      }), 'success')
      close()
    } catch (fetchError) {
      if (alive.current) chatStore.toast(memoryErrorText(fetchError), 'error')
    } finally {
      if (alive.current) setBusy('')
    }
  }

  const pickBody = h(Fragment, null,
    h('p', { className: 'dsc-field-hint' }, t('memoryExtractIntro')),
    h('div', { className: 'dsc-memory-notice' },
      h(Icon, { name: 'warning', size: 16 }),
      h('div', { className: 'dsc-memory-notice-body' },
        h('strong', null, t('memoryExtractCostTitle')),
        h('p', null, t('memoryExtractCostBody', { count: selectedCount })),
      ),
    ),
    h('div', { className: 'dsc-import-toolbar' },
      h('button', {
        type: 'button',
        className: cx('dsc-import-check-all', selectedCount > 0 && 'is-on'),
        onClick: selectedCount > 0 && selectedCount === selectableRows.length ? clearSelection : selectAll,
      }, h('span', { className: 'dsc-choice-check' },
        selectedCount > 0 ? h(Icon, { name: 'check', size: 12 }) : null,
      ), t('memoryExtractSelectAll')),
      h('span', { className: 'dsc-import-count' }, t('memoryExtractSelected', { count: selectedCount })),
    ),
    rows.length === 0
      ? h('p', { className: 'dsc-memory-empty' }, t('memoryExtractNoImports'))
      : h('div', { className: 'dsc-import-list' }, rows.map((row) => {
          const done = extracted(row)
          const disabled = done && !reanalyze
          const isOn = selected.has(row.id) && !disabled
          return h('button', {
            key: row.id,
            type: 'button',
            role: 'checkbox',
            'aria-checked': isOn,
            disabled,
            className: cx('dsc-import-item', isOn && 'is-selected', disabled && 'is-imported'),
            onClick: () => toggleRow(row.id),
          },
            h('span', { className: 'dsc-choice-check' }, isOn ? h(Icon, { name: 'check', size: 13 }) : null),
            h('span', { className: 'dsc-import-item-main' },
              h('span', { className: 'dsc-import-item-title' }, row.title || t('newChatTitle')),
              h('span', { className: 'dsc-import-item-meta' },
                t('messageCount', { count: row.messageCount ?? 0 }),
              ),
            ),
            done ? h('span', { className: 'dsc-import-badge' }, t('memoryExtractAlready')) : null,
          )
        })),
    rows.some(extracted)
      ? h('label', { className: 'dsc-memory-preview-check' },
          h('input', {
            type: 'checkbox',
            checked: reanalyze,
            onChange: event => setReanalyze(event.target.checked),
          }),
          h('span', null, t('memoryExtractReanalyze')),
        )
      : null,
    busy === 'analyze'
      ? h('div', { className: 'dsc-memory-state' },
          h(Icon, { name: 'refresh', size: 16 }),
          t('memoryExtractAnalyzing', { count: selectedCount }),
        )
      : null,
    consent
      ? h('div', { className: 'dsc-memory-consent' },
          h('p', { className: 'dsc-memory-consent-text' }, t('memoryExtractConsent', { count: selectedCount })),
          h('div', { className: 'dsc-memory-consent-actions' },
            h('button', {
              type: 'button', className: 'dsc-secondary-button',
              onClick: () => setConsent(false),
            }, t('cancel')),
            h('button', {
              type: 'button', className: 'dsc-primary-button',
              onClick: () => { void analyze() },
            }, t('memoryExtractConsentConfirm')),
          ),
        )
      : null,
  )

  const previewBody = h(Fragment, null,
    h('p', { className: 'dsc-field-hint' }, t('memoryImportPreviewSubtitle')),
    meta !== null
      ? h('p', { className: 'dsc-field-hint' }, t('memoryExtractAnalyzedNote', { analyzed: meta.analyzed, count: items.length }))
      : null,
    h('p', { className: 'dsc-memory-preview-count' }, t('memoryImportSelectCount', { count: confirmedEntries().length })),
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
        h('button', {
          type: 'button', className: 'dsc-secondary-button', disabled: busy !== '',
          onClick: () => setStep('pick'),
        }, t('memoryImportBack')),
        h('button', {
          type: 'button', className: 'dsc-primary-button',
          disabled: busy !== '' || confirmedEntries().length === 0,
          onClick: () => { void confirmImport() },
        }, busy === 'import' ? t('memoryImportImporting') : t('memoryImportConfirm', { count: confirmedEntries().length })),
      )
    : h(Fragment, null,
        h('span', { className: 'dsc-modal-foot-note' }, t('memoryExtractFooterNote')),
        h('button', {
          type: 'button', className: 'dsc-secondary-button', disabled: busy !== '',
          onClick: dismiss,
        }, t('close')),
        h('button', {
          type: 'button', className: 'dsc-primary-button',
          disabled: busy !== '' || selectedCount === 0 || consent,
          onClick: () => setConsent(true),
        }, busy === 'analyze' ? t('memoryExtractAnalyzingShort') : t('memoryExtractAnalyze')),
      )

  return h(ModalBackdrop, { className: 'dsc-memory-extract', onDismiss: dismiss },
    h('div', {
      className: 'dsc-modal dsc-memory-extract-modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': t('memoryExtractTitle'),
    },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('memoryExtractTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('memoryExtractSubtitle')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, onClick: dismiss,
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        error !== '' ? h('p', { className: 'dsc-field-hint is-warning' }, error) : null,
        step === 'preview' ? previewBody : pickBody,
      ),
      h('div', { className: 'dsc-modal-foot' }, footer),
    ),
  )
}
