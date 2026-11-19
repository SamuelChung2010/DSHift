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
const CAPABILITY_KEYS = [
  { key: 'vision', label: 'modelCapVision' },
  { key: 'documents', label: 'modelCapFiles' },
  { key: 'search', label: 'modelCapSearch' },
  { key: 'thinking', label: 'modelCapThinking' },
]

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

/** Short label for the composer chip; the full name is kept for the menu. */
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
 * Model menu: a compact list of the real API models plus the thinking-effort
 * control for the selected one. It opens above the composer, right-aligned to
 * its chip, and is fully operable from the keyboard.
 */
function ModelMenu() {
  const t = useT()
  const models = modelCatalog()
  const choice = currentModelChoice()
  const thinking = useChat(state => state.settings.thinking)
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
      h('span', { className: 'dsc-model-name' }, modelChipLabel(choice.model, thinking, choice.effort)),
      h(Icon, { name: 'chevronDown', size: 12 }),
    ),
    open
      ? h('div', {
          ref: panelRef,
          className: 'dsc-popover dsc-model-menu',
          role: 'menu',
          'aria-label': t('modelSelect'),
          'data-placement': layout.placement,
          style: layout.maxHeight === null ? undefined : { maxHeight: `${layout.maxHeight}px` },
          onKeyDown,
        },
        h('div', { className: 'dsc-popover-title' }, t('modelMenuTitle')),
        h('div', { className: 'dsc-model-list' },
          models.map(model => {
            const selected = model.id === choice.model.id
            return h('button', {
              key: model.id,
              type: 'button',
              role: 'menuitemradio',
              'aria-checked': selected,
              'data-model': model.id,
              className: cx('dsc-popover-item dsc-model-option', selected && 'is-selected'),
              onClick: () => { chatActions.selectModel(model.id); close() },
            },
              h('span', { className: 'dsc-popover-item-main' },
                h('span', { className: 'dsc-popover-item-title' }, model.name),
                model.descriptionKey !== undefined
                  ? h('span', { className: 'dsc-popover-item-desc' }, t(model.descriptionKey))
                  : null,
              ),
              selected ? h(Icon, { name: 'check', size: 15 }) : null,
            )
          }),
        ),
        h('div', { className: 'dsc-popover-sep' }),
        h('div', { className: 'dsc-effort' },
          h('div', { className: 'dsc-effort-head' },
            h('span', { className: 'dsc-popover-label' }, t('thinkingEffort')),
            h('span', { className: 'dsc-effort-active' }, h(Icon, { name: 'brain', size: 12 }), thinking ? t('toolOn') : t('toolOff')),
          ),
          thinking && choice.efforts.length > 0
            ? h('div', { className: 'dsc-effort-options', role: 'group', 'aria-label': t('thinkingEffort') },
                choice.efforts.map(effort => h('button', {
                  key: effort,
                  type: 'button',
                  role: 'menuitemradio',
                  'aria-checked': choice.effort === effort,
                  className: cx('dsc-effort-option', choice.effort === effort && 'is-selected'),
                  title: t(EFFORT_HINT[effort] ?? 'thinkingEffort'),
                  onClick: () => chatActions.selectEffort(effort),
                }, t(EFFORT_LABEL[effort]))),
              )
            : h('p', { className: 'dsc-popover-hint' },
                thinking ? t('effortUnsupported') : t('effortNeedsThinking')),
          thinking && EFFORT_HINT[choice.effort] !== undefined
            ? h('p', { className: 'dsc-popover-hint' }, t(EFFORT_HINT[choice.effort]))
            : null,
        ),
        h('div', { className: 'dsc-popover-sep' }),
        h('div', { className: 'dsc-model-meta' },
          h('div', { className: 'dsc-model-caps', 'aria-label': t('modelCapabilities') },
            CAPABILITY_KEYS.map(item => h('span', {
              key: item.key,
              className: cx('dsc-model-cap', !modelCapability(choice.model, item.key) && 'is-off'),
              title: `${t(item.label)}：${modelCapability(choice.model, item.key) ? t('toolOn') : t('toolOff')}`,
            },
              h(Icon, { name: modelCapability(choice.model, item.key) ? 'check' : 'close', size: 11 }),
              t(item.label),
            )),
          ),
          h('p', { className: 'dsc-popover-hint' }, scope),
        ),
      )
      : null,
  )
}
