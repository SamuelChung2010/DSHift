function BootView({ error, onRetry }) {
  const t = useT()
  if (error !== '') {
    return h('div', { className: 'dsc-boot' },
      h('div', { className: 'dsc-boot-card' },
        h('span', { className: 'dsc-boot-icon' }, h(Icon, { name: 'warning', size: 22 })),
        h('h2', null, t('loadFailed')),
        h('p', null, error),
        h('button', { type: 'button', className: 'dsc-primary-button', onClick: onRetry }, t('retry')),
      ),
    )
  }
  return h('div', { className: 'dsc-boot' },
    h(Spinner, { size: 24 }),
    h('div', { className: 'dsc-boot-text' }, t('loading')),
  )
}

function Switch({ checked, onChange, label }) {
  return h('button', {
    type: 'button',
    role: 'switch',
    'aria-checked': checked,
    'aria-label': label,
    className: cx('dsc-switch', checked && 'is-on'),
    onClick: () => onChange(!checked),
  }, h('span', { className: 'dsc-switch-thumb' }))
}

function SettingsSection({ title, children }) {
  return h('section', { className: 'dsc-settings-section' },
    h('h3', { className: 'dsc-settings-title' }, title),
    h('div', { className: 'dsc-settings-card' }, children),
  )
}

function SettingsDialog() {
  const t = useT()
  const auth = useChat(state => state.auth)
  const settings = useChat(state => state.settings)
  const bootData = useChat(state => state.bootData)
  const [keyInput, setKeyInput] = React.useState('')
  const [prompt, setPrompt] = React.useState(settings.systemPrompt)
  const [savingKey, setSavingKey] = React.useState(false)
  const [savingPrompt, setSavingPrompt] = React.useState(false)
  React.useEffect(() => {
    setPrompt(settings.systemPrompt)
  }, [settings.systemPrompt])
  const close = () => chatStore.set({ settingsOpen: false })
  const saveKey = async () => {
    const value = keyInput.trim()
    if (value === '') return
    setSavingKey(true)
    try {
      await chatActions.saveKey(value)
      setKeyInput('')
    } catch (error) {
      chatStore.toast(tr('authSaveFailed', { message: error instanceof Error ? error.message : String(error) }), 'error')
    } finally {
      setSavingKey(false)
    }
  }
  const clearKey = async () => {
    setSavingKey(true)
    try {
      await chatActions.clearKey()
    } catch (error) {
      chatStore.toast(tr('authSaveFailed', { message: error instanceof Error ? error.message : String(error) }), 'error')
    } finally {
      setSavingKey(false)
    }
  }
  const savePrompt = async () => {
    setSavingPrompt(true)
    try {
      await chatActions.saveSettings({ systemPrompt: prompt }, { quiet: false })
    } finally {
      setSavingPrompt(false)
    }
  }
  const mode = settings.authMode
  return h('div', {
    className: 'dsc-modal-backdrop',
    onMouseDown: (event) => { if (event.target === event.currentTarget) close() },
  },
    h('div', { className: 'dsc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('settingsTitle') },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('settingsTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('settingsSubtitle')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, onClick: close,
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        h(SettingsSection, { title: t('connection') },
          h('div', { className: cx('dsc-auth-status', auth?.ready ? 'is-ready' : 'is-missing') },
            h('span', { className: 'dsc-auth-dot' }),
            h('div', { className: 'dsc-auth-status-body' },
              h('strong', null, auth?.ready ? t('authReady') : t('authMissing')),
              h('span', null, authSourceLabel(auth, t)),
              h('span', { className: 'dsc-auth-sub' }, auth?.accountSignedIn ? t('authAccountSignedIn') : t('authAccountSignedOut')),
              auth?.dshKeyConfigured ? h('span', { className: 'dsc-auth-sub' }, `${t('authSourceDshKey')} · ${t('apiKeyConfigured')}`) : null,
            ),
          ),
          h('div', { className: 'dsc-field' },
            h('span', { className: 'dsc-field-label' }, t('authMode')),
            h('div', { className: 'dsc-segment', role: 'group', 'aria-label': t('authMode') },
              [['auto', 'authAuto'], ['account', 'authAccount'], ['api-key', 'authApiKey']].map(([value, key]) => (
                h('button', {
                  key: value,
                  type: 'button',
                  className: cx('dsc-segment-button', mode === value && 'is-active'),
                  'aria-pressed': mode === value,
                  onClick: () => { void chatActions.saveSettings({ authMode: value }) },
                }, t(key))
              )),
            ),
          ),
          h('div', { className: 'dsc-field' },
            h('span', { className: 'dsc-field-label' }, t('apiKeyLabel')),
            auth?.chatKeyConfigured
              ? h('div', { className: 'dsc-key-row' },
                  h('span', { className: 'dsc-key-state' }, t('apiKeyConfigured')),
                  h('button', {
                    type: 'button', className: 'dsc-secondary-button', disabled: savingKey,
                    onClick: clearKey,
                  }, t('clear')),
                )
              : h('div', { className: 'dsc-key-row' },
                  h('input', {
                    type: 'password',
                    className: 'dsc-input',
                    value: keyInput,
                    placeholder: t('apiKeyPlaceholder'),
                    autoComplete: 'off',
                    spellCheck: false,
                    disabled: savingKey || auth?.canStoreKey === false,
                    onChange: (event) => setKeyInput(event.target.value),
                    onKeyDown: (event) => { if (event.key === 'Enter') { event.preventDefault(); void saveKey() } },
                  }),
                  h('button', {
                    type: 'button', className: 'dsc-primary-button', disabled: savingKey || keyInput.trim() === '' || auth?.canStoreKey === false,
                    onClick: () => { void saveKey() },
                  }, savingKey ? t('saving') : t('save')),
                ),
            h('p', { className: 'dsc-field-hint' }, t('apiKeyHint')),
          ),
        ),
        h(SettingsSection, { title: t('defaults') },
          h('div', { className: 'dsc-switch-row' },
            h('div', { className: 'dsc-switch-copy' },
              h('strong', null, t('defaultThinking')),
              h('span', null, t('deepThink')),
            ),
            h(Switch, { checked: settings.thinking, onChange: () => chatActions.toggleThinking(), label: t('defaultThinking') }),
          ),
          h('div', { className: 'dsc-switch-row' },
            h('div', { className: 'dsc-switch-copy' },
              h('strong', null, t('defaultSearch')),
              h('span', null, t('webSearch')),
            ),
            h(Switch, { checked: settings.search, onChange: () => chatActions.toggleSearch(), label: t('defaultSearch') }),
          ),
        ),
        h(SettingsSection, { title: t('systemPrompt') },
          h('textarea', {
            className: 'dsc-textarea dsc-prompt',
            value: prompt,
            rows: 4,
            maxLength: 8000,
            placeholder: t('systemPromptPlaceholder'),
            onChange: (event) => setPrompt(event.target.value),
          }),
          h('div', { className: 'dsc-field-actions' },
            h('p', { className: 'dsc-field-hint' }, t('systemPromptHint')),
            h('button', {
              type: 'button', className: 'dsc-secondary-button',
              disabled: savingPrompt || prompt === settings.systemPrompt,
              onClick: () => { void savePrompt() },
            }, savingPrompt ? t('saving') : t('save')),
          ),
        ),
        h(SettingsSection, { title: t('data') },
          h('div', { className: 'dsc-data-row' },
            h('span', { className: 'dsc-field-label' }, t('storagePath')),
            h('code', { className: 'dsc-path' }, bootData?.dataDir ?? ''),
          ),
          h('p', { className: 'dsc-field-hint' }, t('dataNote')),
        ),
        h(SettingsSection, { title: t('about') },
          h('div', { className: 'dsc-about-row' },
            h('span', null, t('modelLabel')),
            h('strong', null, bootData?.model?.name ?? t('modelName')),
          ),
          h('p', { className: 'dsc-field-hint' }, t('aboutText')),
          h('p', { className: 'dsc-field-hint' }, `${t('limitations')}：${t('limitationsText')}`),
        ),
      ),
    ),
  )
}

/**
 * Chat → Agent handoff: draft an editable task brief from this conversation,
 * create a real Agent Session in the chosen Workspace, and switch the shell to
 * Agent mode on that Session.
 */
function HandoffDialog() {
  const t = useT()
  const handoff = useChat(state => state.handoff)
  const workspaces = useChat(state => state.workspaces)
  const hostReady = useChat(state => state.bootData?.handoff !== undefined)
  const [copied, setCopied] = React.useState(false)
  if (handoff === null) return null
  const close = () => chatActions.closeHandoff()
  const brief = handoff.brief ?? ''
  const canSend = hostReady && brief.trim() !== '' && !handoff.busy && !handoff.generating
  const copy = () => {
    copyToClipboard(brief).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }).catch(() => chatStore.toast(t('copyFailed'), 'error'))
  }
  return h('div', {
    className: 'dsc-modal-backdrop',
    onMouseDown: (event) => { if (event.target === event.currentTarget) close() },
  },
    h('div', { className: 'dsc-modal dsc-handoff', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('handoffTitle') },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('handoffTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('handoffSubtitle')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, disabled: handoff.busy, onClick: close,
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        !hostReady
          ? h('div', { className: 'dsc-notice' }, h(Icon, { name: 'warning', size: 16 }), h('span', null, t('handoffRestart')))
          : workspaces.length === 0
            ? h('div', { className: 'dsc-notice' },
                h(Icon, { name: 'warning', size: 16 }),
                h('span', null, t('handoffWorkspaceEmpty')),
                h('button', { type: 'button', className: 'dsc-inline-button', onClick: () => chatActions.setMode('agent') }, t('goToAgentMode')),
              )
            : h('div', { className: 'dsc-field' },
                h('label', { className: 'dsc-field-label', htmlFor: 'handoff-workspace' }, t('handoffWorkspace')),
                h('select', {
                  id: 'handoff-workspace',
                  className: 'dsc-select',
                  value: handoff.workspaceId ?? '',
                  onChange: (event) => chatActions.setHandoffWorkspace(event.target.value),
                }, workspaces.map(workspace => h('option', { key: workspace.id, value: workspace.id }, workspace.title || workspace.path))),
                h('p', { className: 'dsc-field-hint' }, workspaces.find(workspace => workspace.id === handoff.workspaceId)?.path ?? ''),
              ),
        h('div', { className: 'dsc-field' },
          h('label', { className: 'dsc-field-label', htmlFor: 'handoff-extra-input' }, t('handoffExtra')),
          h('input', {
            id: 'handoff-extra-input',
            className: 'dsc-input',
            value: handoff.instruction ?? '',
            placeholder: t('handoffExtraPlaceholder'),
            maxLength: 4000,
            onChange: (event) => chatActions.setHandoffInstruction(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault()
                void chatActions.draftHandoff()
              }
            },
          }),
        ),
        h('div', { className: 'dsc-field' },
          h('div', { className: 'dsc-field-row' },
            h('span', { className: 'dsc-field-label' }, t('handoffEditorLabel')),
            h('div', { className: 'dsc-field-tools' },
              h('button', {
                type: 'button', className: 'dsc-text-button', disabled: handoff.generating,
                onClick: () => { void chatActions.draftHandoff() },
              }, h(Icon, { name: 'refresh', size: 14 }), t('handoffRegenerate')),
              brief.trim() === '' ? null : h('button', {
                type: 'button', className: 'dsc-text-button', onClick: copy,
              }, h(Icon, { name: copied ? 'check' : 'copy', size: 14 }), copied ? t('copied') : t('copyBrief')),
            ),
          ),
          handoff.generating
            ? h('div', { className: 'dsc-handoff-loading' }, h(Spinner, { size: 16 }), t('handoffDrafting'))
            : h('textarea', {
                id: 'handoff-brief',
                className: 'dsc-textarea dsc-handoff-brief',
                value: brief,
                rows: 12,
                spellCheck: false,
                'aria-label': t('handoffEditorLabel'),
                onChange: (event) => chatActions.setHandoffBrief(event.target.value),
              }),
          handoff.warning !== '' && !handoff.generating
            ? h('p', { className: 'dsc-field-hint' }, `${t('handoffLocal')} ${t('handoffShortcut')}`)
            : h('p', { className: 'dsc-field-hint' }, t('handoffShortcut')),
          handoff.error !== ''
            ? h('div', { className: 'dsc-notice is-error' }, h(Icon, { name: 'warning', size: 15 }), h('span', null, handoff.error))
            : null,
        ),
      ),
      h('footer', { className: 'dsc-modal-foot' },
        h('div', { className: 'dsc-modal-foot-note' }, workspaces.length === 0 ? t('handoffWorkspaceEmpty') : ''),
        h('button', {
          type: 'button', className: 'dsc-secondary-button', disabled: handoff.busy, onClick: close,
        }, t('cancel')),
        h('button', {
          type: 'button',
          className: 'dsc-primary-button',
          disabled: !canSend || workspaces.length === 0,
          onClick: () => { void chatActions.submitHandoff() },
        }, handoff.busy ? t('handoffSending') : t('handoffSend')),
      ),
    ),
  )
}

function ConfirmDialog() {
  const t = useT()
  const confirm = useChat(state => state.confirm)
  if (confirm === null) return null
  const run = async () => {
    const action = confirm.onConfirm
    chatStore.set({ confirm: null })
    try {
      await action()
    } catch (error) {
      chatStore.toast(error instanceof Error ? error.message : String(error), 'error')
    }
  }
  return h('div', {
    className: 'dsc-modal-backdrop',
    onMouseDown: (event) => { if (event.target === event.currentTarget) chatStore.set({ confirm: null }) },
  },
    h('div', { className: 'dsc-confirm', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': confirm.title },
      h('h2', null, confirm.title),
      h('p', null, confirm.message),
      h('div', { className: 'dsc-confirm-actions' },
        h('button', {
          type: 'button', className: 'dsc-secondary-button', autoFocus: true,
          onClick: () => chatStore.set({ confirm: null }),
        }, t('cancel')),
        h('button', {
          type: 'button', className: cx('dsc-primary-button', confirm.danger && 'is-danger'),
          onClick: () => { void run() },
        }, confirm.confirmLabel || t('confirm')),
      ),
    ),
  )
}

function Toasts() {
  const toasts = useChat(state => state.toasts)
  if (toasts.length === 0) return null
  return h('div', { className: 'dsc-toasts', role: 'status', 'aria-live': 'polite' },
    toasts.map(toast => h('div', { key: toast.id, className: cx('dsc-toast', `is-${toast.kind}`) },
      h(Icon, { name: toast.kind === 'error' || toast.kind === 'warning' ? 'warning' : 'check', size: 16 }),
      h('span', null, toast.message),
    )),
  )
}
