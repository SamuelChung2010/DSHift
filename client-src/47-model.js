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
