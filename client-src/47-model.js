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
 * The composer follows the native Harness model seat instead of showing two
 * unrelated chips: one trigger carries the model name and the current effort,
 * and one menu starts with the native "Model / Reasoning effort" rows that
 * drill into a compact list. The root rows keep the menu calm; the lists carry
 * only names and the single limitation that changes what can be attached.
 */

/** The single model an older Host always sends. */
const FALLBACK_MODELS = [
  {
    id: 'deepseek-flash',
    name: 'DeepSeek V4.1 Flash',
    displayName: 'DeepSeek-V4.1-Flash',
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

/** The native-looking API name, with the friendly catalog name as fallback. */
function modelDisplayName(model) {
  if (typeof model?.displayName === 'string' && model.displayName !== '') return model.displayName
  // The compatibility path for an older Host: its catalog carries the API
  // version (DeepSeek-V4.1-Flash-1017) but not a displayName.
  if (typeof model?.version === 'string') {
    const versionName = model.version.replace(/-[0-9]{3,4}$/, '')
    if (versionName !== '') return versionName
  }
  return model?.name || model?.id || ''
}

/** The compact name used by reply footers, where the version is already known. */
function modelShortName(model) {
  return model?.shortName || model?.name || ''
}

/** The label shown beside the model while thinking is on, or "Off" when it is not. */
function modelEffortLabel(thinking, effort) {
  if (!thinking) return tr('effortOff')
  const labelKey = EFFORT_LABEL[effort]
  return labelKey === undefined ? '' : tr(labelKey)
}

/** Full label for the composer seat. The menu keeps the two values separate. */
function modelTriggerLabel(model) {
  return modelDisplayName(model)
}

/** Full label for a reply footer, including the effort that produced it. */
function modelChipLabel(model, thinking, effort) {
  const name = modelShortName(model)
  if (!thinking) return name
  const effortLabel = modelEffortLabel(true, effort)
  return effortLabel === '' ? name : `${name} · ${effortLabel}`
}

/**
 * The model recorded on one reply, for the message footer. Old replies may name
 * a model that is no longer in the catalog, in which case the raw id is the
 * honest label.
 */
function messageModelLabel(message) {
  if (typeof message?.model !== 'string' || message.model === '') return ''
  const model = modelById(message.model)
  const name = modelShortName(model) || message.model
  if (message.thinking !== true) return name
  const effortLabel = modelEffortLabel(true, message.effort)
  return effortLabel === '' ? name : `${name} · ${effortLabel}`
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
 * Model and effort, in the shape of the native Harness model seat.
 *
 * Closed, the trigger reads `DeepSeek-V4.1-Flash Max` (effort in the caption
 * tone). Open, the root menu mirrors Harness: a "Model" row and a "Reasoning
 * effort" row, each with its current value and a chevron, drilling into a
 * name-only / tier-only list. It opens above the composer, right-aligned to the
 * trigger, and keeps the WAI-ARIA menu keyboard model.
 */
function ModelMenu() {
  const t = useT()
  const models = modelCatalog()
  const choice = currentModelChoice()
  const thinking = useChat(state => state.settings.thinking)
  const [open, setOpen] = React.useState(false)
  const [pane, setPane] = React.useState('root')
  const triggerRef = React.useRef(null)
  const panelRef = React.useRef(null)
  const layout = usePopupPlacement(open, triggerRef, panelRef)
  const close = () => {
    setOpen(false)
    setPane('root')
  }
  const closeAndRestore = () => {
    close()
    setTimeout(() => triggerRef.current?.focus?.(), 0)
  }
  useOutsideDismiss(open, close, panelRef, triggerRef)

  React.useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (pane === 'root') {
      panel?.querySelector?.('.dsc-model-cell')?.focus?.({ preventScroll: false })
      return
    }
    const current = pane === 'effort'
      ? panel?.querySelector?.(`[data-effort="${thinking ? choice.effort : 'off'}"]`)
      : panel?.querySelector?.(`[data-model="${choice.model.id}"]`)
    const fallback = panel?.querySelector?.('.dsc-model-option, .dsc-effort-option')
    ;(current ?? fallback)?.focus?.({ preventScroll: false })
  }, [open, pane])

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      if (pane !== 'root') {
        setPane('root')
        return
      }
      close()
      triggerRef.current?.focus?.()
      return
    }
    if (event.key === 'Tab') {
      // A drilled list backs out on Shift+Tab; Tab itself settles the menu and
      // keeps the browser's focus traversal.
      if (event.shiftKey && pane !== 'root') {
        event.preventDefault()
        setPane('root')
        return
      }
      close()
      return
    }
    if (event.key === 'ArrowLeft' && pane !== 'root') {
      event.preventDefault()
      setPane('root')
      return
    }
    handleMenuKeyDown(event, { container: panelRef.current, onClose: close, trigger: triggerRef })
  }

  const chooseOff = () => {
    if (thinking) chatActions.toggleThinking()
    closeAndRestore()
  }
  const chooseEffort = (effort) => {
    if (!thinking) chatActions.toggleThinking()
    if (effort !== choice.effort) chatActions.selectEffort(effort)
    closeAndRestore()
  }

  const effortLabel = modelEffortLabel(thinking, choice.effort)
  const supportsEffort = choice.efforts.length > 0
  const triggerLabel = effortLabel === '' ? modelDisplayName(choice.model) : `${modelDisplayName(choice.model)} ${effortLabel}`
  return h('div', { className: 'dsc-model-control' },
    h('button', {
      ref: triggerRef,
      type: 'button',
      className: cx('dsc-model-trigger', open && 'is-open'),
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      'aria-label': `${t('modelSelect')}: ${triggerLabel}`,
      title: t('modelSelect'),
      onClick: () => {
        if (open) {
          close()
          return
        }
        setPane('root')
        setOpen(true)
      },
      onKeyDown: (event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          close()
          triggerRef.current?.focus?.()
          return
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          if (!open) {
            setPane('root')
            setOpen(true)
          }
        }
      },
    },
      h('span', { className: 'dsc-model-name' }, modelDisplayName(choice.model)),
      supportsEffort
        ? h('span', { className: cx('dsc-model-effort', !thinking && 'is-off') }, effortLabel)
        : null,
      h(Icon, { name: 'chevronDown', size: 12 }),
    ),
    open
      ? h('div', {
          ref: panelRef,
          className: 'dsc-popover dsc-model-menu',
          role: 'menu',
          'aria-label': pane === 'effort' ? t('thinkingEffort') : t('modelSelect'),
          'data-pane': pane,
          'data-placement': layout.placement,
          style: popoverStyle(layout),
          onKeyDown,
        },
        pane === 'root'
          ? h('div', { className: 'dsc-model-root' },
              h('button', {
                type: 'button',
                role: 'menuitem',
                className: 'dsc-model-cell',
                onClick: () => setPane('model'),
              },
                h('span', { className: 'dsc-model-cell-label' }, t('modelMenuTitle')),
                h('span', { className: 'dsc-model-cell-value' }, modelDisplayName(choice.model)),
                h(Icon, { name: 'chevronRight', size: 12 }),
              ),
              supportsEffort
                ? h('button', {
                    type: 'button',
                    role: 'menuitem',
                    className: 'dsc-model-cell',
                    onClick: () => setPane('effort'),
                  },
                    h('span', { className: 'dsc-model-cell-label' }, t('thinkingEffort')),
                    h('span', { className: 'dsc-model-cell-value' }, effortLabel),
                    h(Icon, { name: 'chevronRight', size: 12 }),
                  )
                : null,
            )
          : pane === 'model'
            ? h('div', { className: 'dsc-model-list' },
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
                    className: 'dsc-model-option',
                    onClick: () => {
                      chatActions.selectModel(model.id)
                      closeAndRestore()
                    },
                  },
                    h('span', { className: 'dsc-model-option-name' }, modelDisplayName(model)),
                    notes.length > 0 ? h('span', { className: 'dsc-model-note' }, notes.join(' · ')) : null,
                    h('span', { className: 'dsc-model-check' }, selected ? h(Icon, { name: 'check', size: 14 }) : null),
                  )
                }),
              )
            : h('div', { className: 'dsc-effort-list' },
                h('button', {
                  type: 'button',
                  role: 'menuitemradio',
                  'aria-checked': !thinking,
                  'data-effort': 'off',
                  title: t('effortOffHint'),
                  className: 'dsc-effort-option',
                  onClick: chooseOff,
                },
                  h('span', { className: 'dsc-effort-option-label' }, t('effortOff')),
                  h('span', { className: 'dsc-model-check' }, !thinking ? h(Icon, { name: 'check', size: 14 }) : null),
                ),
                choice.efforts.map(effort => {
                  const selected = thinking && choice.effort === effort
                  return h('button', {
                    key: effort,
                    type: 'button',
                    role: 'menuitemradio',
                    'aria-checked': selected,
                    'data-effort': effort,
                    title: t(EFFORT_HINT[effort] ?? 'thinkingEffort'),
                    className: 'dsc-effort-option',
                    onClick: () => chooseEffort(effort),
                  },
                    h('span', { className: 'dsc-effort-option-label' }, t(EFFORT_LABEL[effort])),
                    h('span', { className: 'dsc-model-check' }, selected ? h(Icon, { name: 'check', size: 14 }) : null),
                  )
                }),
              ),
      )
      : null,
  )
}
