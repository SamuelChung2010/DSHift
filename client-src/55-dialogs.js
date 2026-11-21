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

function Switch({ checked, onChange, label, disabled = false }) {
  return h('button', {
    type: 'button',
    role: 'switch',
    'aria-checked': checked,
    'aria-label': label,
    disabled,
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

/**
 * Every dialog is a native modal <dialog>. showModal() puts the dialog and its
 * mask in the browser's top layer, above the Chat shell's own stacking contexts,
 * and makes the rest of the page inert — including the shared Chat | Agent
 * switch, which must not show through the mask or receive clicks. The dialog
 * stays inside ChatRoot, so the --dsc-* theme tokens still inherit.
 */
function ModalBackdrop({ children, onDismiss, className = '' }) {
  const ref = React.useRef(null)
  const dismissRef = React.useRef(onDismiss)
  dismissRef.current = onDismiss
  React.useEffect(() => {
    const node = ref.current
    if (node === null) return undefined
    // Keep Escape under React's control: an overlay that is busy must be able
    // to refuse the close, and a dialog that closes natively would leave the
    // store thinking it is still open.
    const cancel = (event) => {
      event.preventDefault()
      dismissRef.current()
    }
    node.addEventListener('cancel', cancel)
    if (typeof node.showModal === 'function') {
      if (!node.open) node.showModal()
    } else {
      // Very old WebViews keep the previous fixed-overlay rendering.
      node.setAttribute('open', '')
    }
    return () => {
      node.removeEventListener('cancel', cancel)
      if (node.open) node.close()
    }
  }, [])
  return h('dialog', {
    ref,
    className: cx('dsc-modal-backdrop', className),
    onMouseDown: (event) => {
      if (event.target === event.currentTarget) dismissRef.current()
    },
  }, children)
}

function SettingsDialog() {
  const t = useT()
  const auth = useChat(state => state.auth)
  const settings = useChat(state => state.settings)
  const sendKey = useChat(state => state.sendKey)
  const bootData = useChat(state => state.bootData)
  const defaultModelId = useChat(state => state.modelConfig?.defaults?.model ?? 'deepseek-flash')
  const models = useChat(state => state.models)
  const [keyInput, setKeyInput] = React.useState('')
  const [prompt, setPrompt] = React.useState(settings.systemPrompt)
  const [savingKey, setSavingKey] = React.useState(false)
  const [savingPrompt, setSavingPrompt] = React.useState(false)
  // General stays the default tab; the Memory tab mounts its own pane only
  // while it is active, so opening settings never calls the memory API.
  const [tab, setTab] = React.useState('general')
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
  return h(ModalBackdrop, { onDismiss: close },
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
      h('div', { className: 'dsc-settings-tabs', role: 'tablist', 'aria-label': t('settingsTabsLabel') },
        [['general', 'settingsGeneralTab'], ['memory', 'settingsMemoryTab']].map(([value, key]) => (
          h('button', {
            key: value,
            type: 'button',
            role: 'tab',
            'aria-selected': tab === value,
            className: cx('dsc-settings-tab', tab === value && 'is-active'),
            onClick: () => setTab(value),
          }, t(key))
        )),
      ),
      h('div', { className: 'dsc-modal-body' },
        tab === 'general' ? h(Fragment, null,
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
        h(SettingsSection, { title: t('composerHints') },
          h('div', { className: 'dsc-field' },
            h('span', { className: 'dsc-field-label' }, t('sendKeyLabel')),
            h('div', { className: 'dsc-segment', role: 'group', 'aria-label': t('sendKeyLabel') },
              [['enter', 'enterToSendShort'], ['ctrl-enter', platformIsMac() ? 'newlineToSendMac' : 'newlineToSend']].map(([value, key]) => (
                h('button', {
                  key: value,
                  type: 'button',
                  className: cx('dsc-segment-button', sendKey === value && 'is-active'),
                  'aria-pressed': sendKey === value,
                  onClick: () => chatActions.setSendKey(value),
                }, t(key))
              )),
            ),
            h('p', { className: 'dsc-field-hint' }, t(sendKey === 'ctrl-enter'
              ? (platformIsMac() ? 'newlineToSendMac' : 'newlineToSend')
              : 'enterToSend')),
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
            h('strong', null, (models.find(model => model.id === defaultModelId) ?? { name: t('modelName') }).name),
          ),
          h('p', { className: 'dsc-field-hint' }, t('aboutText')),
          h('p', { className: 'dsc-field-hint' }, `${t('limitations')}：${t('limitationsText')}`),
        ),
        ) : h(MemorySettingsPane, null),
      ),
    ),
  )
}

/**
 * Inline "new workspace" panel of the handoff dialog. It keeps the task brief
 * and the extra requirement untouched: only a new workspace registration is
 * added, and the dialog's own fields stay mounted above and below it.
 */
function HandoffWorkspaceCreator({ draft }) {
  const t = useT()
  const busy = draft.busy === true
  const name = typeof draft.name === 'string' ? draft.name : ''
  const path = typeof draft.path === 'string' ? draft.path : ''
  const issue = workspaceDraftIssue(draft)
  const canCreate = !busy && issue === ''
  const hint = issue === 'name'
    ? t('handoffWorkspaceNameRequired')
    : issue === 'folderName'
      ? t('handoffWorkspaceNameInvalid')
      : issue === 'path'
        ? t('handoffWorkspacePathRequired')
        : issue === 'absolute'
          ? t('handoffWorkspacePathAbsolute')
          : t('handoffWorkspacePathHint')
  return h('div', {
    className: 'dsc-workspace-creator',
    role: 'group',
    'aria-label': t('handoffWorkspaceCreateTitle'),
  },
    h('div', { className: 'dsc-workspace-creator-head' },
      h(Icon, { name: 'plus', size: 15 }),
      h('strong', null, t('handoffWorkspaceCreateTitle')),
      h('button', {
        type: 'button', className: 'dsc-icon-button dsc-workspace-creator-close',
        title: t('handoffWorkspaceCancel'), 'aria-label': t('handoffWorkspaceCancel'), disabled: busy,
        onClick: () => chatActions.closeHandoffWorkspaceDraft(),
      }, h(Icon, { name: 'close', size: 15 })),
    ),
    h('div', { className: 'dsc-field' },
      h('label', { className: 'dsc-field-label', htmlFor: 'handoff-workspace-name' }, t('handoffWorkspaceName')),
      h('input', {
        id: 'handoff-workspace-name',
        className: 'dsc-input',
        value: name,
        placeholder: t('handoffWorkspaceNamePlaceholder'),
        maxLength: 80,
        disabled: busy,
        onFocus: (event) => event.target.select(),
        onChange: (event) => chatActions.setHandoffWorkspaceDraftName(event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault()
            void chatActions.createHandoffWorkspace()
          }
        },
      }),
    ),
    h('div', { className: 'dsc-field' },
      h('label', { className: 'dsc-field-label', htmlFor: 'handoff-workspace-path' }, t('handoffWorkspaceLocation')),
      h('input', {
        id: 'handoff-workspace-path',
        className: 'dsc-input',
        value: path,
        placeholder: t('handoffWorkspacePathPlaceholder'),
        spellCheck: false,
        disabled: busy,
        onChange: (event) => chatActions.setHandoffWorkspaceDraftPath(event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault()
            void chatActions.createHandoffWorkspace()
          }
        },
      }),
      h('div', { className: 'dsc-workspace-picks' },
        h('button', {
          type: 'button', className: 'dsc-secondary-button', disabled: busy,
          onClick: () => { void chatActions.pickHandoffWorkspaceDirectory('existing') },
        }, t('handoffWorkspacePickExisting')),
        h('button', {
          type: 'button', className: 'dsc-secondary-button', disabled: busy,
          onClick: () => { void chatActions.pickHandoffWorkspaceDirectory('parent') },
        }, t('handoffWorkspacePickParent')),
      ),
      h('p', { className: cx('dsc-field-hint', issue !== '' && 'is-warning') }, hint),
    ),
    draft.error !== ''
      ? h('div', {
          className: 'dsc-notice is-error', role: 'alert',
        }, h(Icon, { name: 'warning', size: 15 }), h('span', null, draft.error))
      : null,
    h('div', { className: 'dsc-workspace-creator-actions' },
      h('button', {
        type: 'button', className: 'dsc-secondary-button', disabled: busy,
        onClick: () => chatActions.closeHandoffWorkspaceDraft(),
      }, t('handoffWorkspaceCancel')),
      h('button', {
        type: 'button', className: 'dsc-primary-button', disabled: !canCreate,
        onClick: () => { void chatActions.createHandoffWorkspace() },
      }, busy ? t('handoffWorkspaceCreating') : t('handoffWorkspaceCreate')),
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
  const createAvailable = useChat(state => state.bootData?.handoff?.workspaceCreate === true)
  const [copied, setCopied] = React.useState(false)
  if (handoff === null) return null
  const close = () => chatActions.closeHandoff()
  const brief = handoff.brief ?? ''
  const draft = handoff.workspaceDraft ?? null
  const selectedWorkspace = workspaces.find(workspace => workspace.id === handoff.workspaceId)
  const suggestion = draft === null && createAvailable
    ? handoffWorkspaceSuggestion({
        title: handoff.title,
        brief,
        workspace: selectedWorkspace,
        fallbackName: t('handoffWorkspaceNameFallback'),
      })
    : null
  const workspaceReady = handoff.workspaceId !== '' || workspaces.length === 0
  const canSend = hostReady && brief.trim() !== '' && !handoff.busy && !handoff.generating
    && draft === null && workspaceReady
  const copy = () => {
    copyToClipboard(brief).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }).catch(() => chatStore.toast(t('copyFailed'), 'error'))
  }
  return h(ModalBackdrop, { onDismiss: close },
    h('div', { className: 'dsc-modal dsc-handoff', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('handoffTitle') },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('handoffTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('handoffSubtitle')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: !draft, disabled: handoff.busy || draft?.busy === true, onClick: close,
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        !hostReady
          ? h('div', { className: 'dsc-notice' }, h(Icon, { name: 'warning', size: 16 }), h('span', null, t('handoffRestart')))
          : [
              h('div', { className: 'dsc-field', key: 'workspace' },
                h('label', { className: 'dsc-field-label', htmlFor: 'handoff-workspace' }, t('handoffWorkspace')),
                h('select', {
                  id: 'handoff-workspace',
                  className: 'dsc-select',
                  value: draft === null ? (handoff.workspaceId ?? '') : NEW_WORKSPACE_OPTION,
                  disabled: handoff.busy || draft?.busy === true,
                  onChange: (event) => {
                    if (event.target.value === NEW_WORKSPACE_OPTION) chatActions.openHandoffWorkspaceDraft()
                    else chatActions.setHandoffWorkspace(event.target.value)
                  },
                }, [
                  workspaces.length === 0 && draft === null
                    ? h('option', { key: 'none', value: '', disabled: true }, t('handoffWorkspaceNone'))
                    : null,
                  ...workspaces.map(workspace => h('option', {
                    key: workspace.id, value: workspace.id,
                  }, workspace.title || workspace.path)),
                  createAvailable
                    ? h('option', { key: NEW_WORKSPACE_OPTION, value: NEW_WORKSPACE_OPTION }, t('handoffNewWorkspace'))
                    : null,
                ]),
                draft !== null
                  ? null
                  : h('p', { className: 'dsc-field-hint' },
                      selectedWorkspace?.path
                        ?? (createAvailable ? t('handoffWorkspaceRequired') : t('handoffWorkspaceEmptyUnavailable'))),
                suggestion !== null
                  ? h('div', { className: 'dsc-workspace-hint' },
                      h('span', null, t('handoffNewProjectHint')),
                      h('button', {
                        type: 'button', className: 'dsc-text-button',
                        onClick: () => chatActions.openHandoffWorkspaceDraft(),
                      }, t('handoffNewProjectAction', { name: suggestion.name })),
                    )
                  : null,
              ),
              draft === null ? null : h(HandoffWorkspaceCreator, { key: 'workspace-creator', draft }),
              h('div', { className: 'dsc-field', key: 'instruction' },
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
              h('div', { className: 'dsc-field', key: 'brief' },
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
            ],
      ),
      h('footer', { className: 'dsc-modal-foot' },
        h('div', { className: 'dsc-modal-foot-note' },
          workspaces.length === 0 && draft === null
            ? (createAvailable ? t('handoffWorkspaceEmpty') : t('handoffWorkspaceEmptyUnavailable'))
            : ''),
        h('button', {
          type: 'button', className: 'dsc-secondary-button', disabled: handoff.busy || draft?.busy === true, onClick: close,
        }, t('cancel')),
        h('button', {
          type: 'button',
          className: 'dsc-primary-button',
          disabled: !canSend,
          onClick: () => { void chatActions.submitHandoff() },
        }, handoff.busy ? t('handoffSending') : t('handoffSend')),
      ),
    ),
  )
}

/**
 * One floating menu for conversation and folder actions. It is anchored at the
 * pointer (right-click or the row's "···"), clamped into the window, and closes
 * on an outside click or Escape.
 */
function ContextMenu() {
  const t = useT()
  const menu = useChat(state => state.menu)
  const conversations = useChat(state => state.conversations)
  const folders = useChat(state => state.folders)
  const ref = React.useRef(null)
  const [position, setPosition] = React.useState(null)
  React.useLayoutEffect(() => {
    if (menu === null) {
      setPosition(null)
      return
    }
    const rect = ref.current?.getBoundingClientRect()
    const width = rect?.width ?? 210
    const height = rect?.height ?? 260
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0
    setPosition({
      left: Math.max(8, Math.min(menu.x, viewportWidth - width - 8)),
      top: Math.max(8, Math.min(menu.y, viewportHeight - height - 8)),
    })
  }, [menu])
  if (menu === null) return null
  let items = []
  if (menu.kind === 'conversation') {
    const conversation = conversations.find(item => item.id === menu.id)
    if (conversation === undefined) return null
    items = [
      {
        key: 'rename',
        icon: 'pencil',
        label: t('rename'),
        onSelect: () => {
          chatStore.set({ menu: null, renamingId: conversation.id })
        },
      },
      {
        key: 'pin',
        icon: 'pin',
        label: conversation.pinned ? t('unpin') : t('pin'),
        onSelect: () => { void chatActions.setPinned(conversation.id, conversation.pinned !== true) },
      },
    ]
    if (folders.length > 0) {
      items.push({
        key: 'move',
        icon: 'folder',
        label: t('moveToFolder'),
        onSelect: () => chatActions.openMoveChat(conversation.id),
      })
    }
    if (conversation.folderId !== null) {
      items.push({
        key: 'unfile',
        icon: 'folderMinus',
        label: t('moveOutOfFolder'),
        onSelect: () => { void chatActions.moveConversationToFolder(conversation.id, null) },
      })
    }
    items.push(
      {
        key: 'archive',
        icon: 'archive',
        label: conversation.archived ? t('unarchive') : t('archive'),
        onSelect: () => { void chatActions.setArchived(conversation.id, conversation.archived !== true) },
      },
      null,
      {
        key: 'delete',
        icon: 'trash',
        label: t('delete'),
        danger: true,
        onSelect: () => {
          chatActions.closeMenu()
          chatActions.requestDeleteConversation(conversation.id, conversation.title)
        },
      },
    )
  } else {
    const folder = folders.find(item => item.id === menu.id)
    if (folder === undefined) return null
    items = [
      {
        key: 'rename',
        icon: 'pencil',
        label: t('renameFolder'),
        onSelect: () => chatActions.requestFolderPrompt('rename', folder),
      },
      {
        key: 'add',
        icon: 'plus',
        label: t('addChatsToFolder'),
        onSelect: () => chatActions.openFolderAdd(folder.id),
      },
      null,
      {
        key: 'delete',
        icon: 'trash',
        label: t('deleteFolder'),
        danger: true,
        onSelect: () => chatActions.requestDeleteFolder(folder),
      },
    ]
  }
  const moveFocus = (event) => {
    const buttons = [...(ref.current?.querySelectorAll('[role="menuitem"]') ?? [])]
    if (buttons.length === 0) return
    const current = buttons.indexOf(document.activeElement)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      buttons[(current + 1 + buttons.length) % buttons.length].focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      buttons[(current - 1 + buttons.length) % buttons.length].focus()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      chatActions.closeMenu()
    }
  }
  return h(React.Fragment, null,
    h('div', {
      className: 'dsc-menu-backdrop',
      onMouseDown: () => chatActions.closeMenu(),
      onContextMenu: (event) => {
        event.preventDefault()
        chatActions.closeMenu()
      },
    }),
    h('div', {
      ref,
      className: 'dsc-menu',
      role: 'menu',
      'aria-label': t('moreActions'),
      style: position === null ? { left: `${menu.x}px`, top: `${menu.y}px` } : position,
      onKeyDown: moveFocus,
      onContextMenu: (event) => event.preventDefault(),
    },
      items.map((item, index) => (item === null
        ? h('div', { key: `separator-${index}`, className: 'dsc-menu-separator', role: 'separator' })
        : h('button', {
            key: item.key,
            type: 'button',
            role: 'menuitem',
            className: cx('dsc-menu-item', item.danger && 'is-danger'),
            autoFocus: index === 0,
            onClick: item.onSelect,
          },
            h(Icon, { name: item.icon, size: 15 }),
            h('span', null, item.label),
          ))),
    ),
  )
}

/** Create or rename a folder. Enter submits, Escape closes via the shell. */
function FolderPromptDialog() {
  const t = useT()
  const prompt = useChat(state => state.folderPrompt)
  const inputRef = React.useRef(null)
  React.useEffect(() => {
    if (prompt === null) return undefined
    const timer = setTimeout(() => inputRef.current?.select(), 30)
    return () => clearTimeout(timer)
  }, [prompt?.mode, prompt?.id])
  if (prompt === null) return null
  const rename = prompt.mode === 'rename'
  const title = rename ? t('folderRenameTitle') : t('folderCreateTitle')
  return h(ModalBackdrop, { onDismiss: () => chatActions.closeFolderPrompt() },
    h('form', {
      className: 'dsc-modal dsc-form-modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': title,
      onSubmit: (event) => {
        event.preventDefault()
        void chatActions.submitFolderPrompt()
      },
    },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, title),
          h('p', { className: 'dsc-modal-sub' }, rename ? t('folderRenameHint') : t('folderCreateHint')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          onClick: () => chatActions.closeFolderPrompt(),
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        h('div', { className: 'dsc-field' },
          h('label', { className: 'dsc-field-label', htmlFor: 'dsc-folder-name-input' }, t('folderNameLabel')),
          h('input', {
            ref: inputRef,
            id: 'dsc-folder-name-input',
            className: 'dsc-input dsc-folder-name-input',
            value: prompt.draft,
            maxLength: 60,
            placeholder: t('folderNamePlaceholder'),
            autoComplete: 'off',
            spellCheck: false,
            onChange: (event) => chatActions.updateFolderPrompt(event.target.value),
          }),
        ),
      ),
      h('footer', { className: 'dsc-modal-foot' },
        h('div', { className: 'dsc-modal-foot-note' }),
        h('button', {
          type: 'button', className: 'dsc-secondary-button', onClick: () => chatActions.closeFolderPrompt(),
        }, t('cancel')),
        h('button', {
          type: 'submit', className: 'dsc-primary-button',
          disabled: prompt.busy || prompt.draft.trim() === '',
        }, rename ? t('save') : t('create')),
      ),
    ),
  )
}

/** Pick a folder (or the unfiled area) for one conversation. */
function MoveChatDialog() {
  const t = useT()
  const move = useChat(state => state.moveChat)
  const folders = useChat(state => state.folders)
  if (move === null) return null
  const options = [{ id: null, name: t('unfiled') }, ...folders.map(folder => ({ id: folder.id, name: folder.name }))]
  return h(ModalBackdrop, { onDismiss: () => chatActions.closeMoveChat() },
    h('div', { className: 'dsc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('moveChatTitle') },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('moveChatTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('moveChatHint')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, onClick: () => chatActions.closeMoveChat(),
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        h('div', { className: 'dsc-dialog-list', role: 'radiogroup', 'aria-label': t('moveChatTitle') },
          options.map(option => h('button', {
            key: option.id ?? 'unfiled',
            type: 'button',
            role: 'radio',
            'aria-checked': move.folderId === option.id,
            className: cx('dsc-choice', move.folderId === option.id && 'is-selected'),
            onClick: () => chatActions.setMoveChatFolder(option.id ?? ''),
          },
            h('span', { className: 'dsc-choice-icon' }, h(Icon, { name: option.id === null ? 'folderMinus' : 'folder', size: 16 })),
            h('span', { className: 'dsc-choice-label' }, option.name),
            move.folderId === option.id ? h(Icon, { name: 'check', size: 15 }) : null,
          )),
        ),
      ),
      h('footer', { className: 'dsc-modal-foot' },
        h('div', { className: 'dsc-modal-foot-note' }),
        h('button', { type: 'button', className: 'dsc-secondary-button', onClick: () => chatActions.closeMoveChat() }, t('cancel')),
        h('button', {
          type: 'button', className: 'dsc-primary-button', disabled: move.busy,
          onClick: () => { void chatActions.submitMoveChat() },
        }, t('moveChatConfirm')),
      ),
    ),
  )
}

/** Move one or more conversations into a folder from the folder's own menu. */
function FolderAddDialog() {
  const t = useT()
  const add = useChat(state => state.folderAdd)
  const conversations = useChat(state => state.conversations)
  if (add === null) return null
  const candidates = conversations
    .filter(conversation => conversation.archived !== true && conversation.folderId !== add.folderId)
    .sort(byActivity)
  return h(ModalBackdrop, { onDismiss: () => chatActions.closeFolderAdd() },
    h('div', { className: 'dsc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('folderAddTitle', { name: add.name }) },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('folderAddTitle', { name: add.name })),
          h('p', { className: 'dsc-modal-sub' }, t('folderAddHint')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, onClick: () => chatActions.closeFolderAdd(),
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        candidates.length === 0
          ? h('div', { className: 'dsc-list-empty' }, t('folderAddEmpty'))
          : h('div', { className: 'dsc-dialog-list' },
              candidates.map(conversation => {
                const selected = add.selected.includes(conversation.id)
                return h('button', {
                  key: conversation.id,
                  type: 'button',
                  role: 'checkbox',
                  'aria-checked': selected,
                  className: cx('dsc-choice', selected && 'is-selected'),
                  onClick: () => chatActions.toggleFolderAddSelection(conversation.id),
                },
                  h('span', { className: 'dsc-choice-check' }, selected ? h(Icon, { name: 'check', size: 14 }) : null),
                  h('span', { className: 'dsc-choice-label' }, conversation.title || t('newChatTitle')),
                  conversation.pinned ? h('span', { className: 'dsc-choice-hint' }, h(Icon, { name: 'pin', size: 12 })) : null,
                )
              }),
            ),
      ),
      h('footer', { className: 'dsc-modal-foot' },
        h('div', { className: 'dsc-modal-foot-note' }, add.selected.length > 0 ? String(add.selected.length) : ''),
        h('button', { type: 'button', className: 'dsc-secondary-button', onClick: () => chatActions.closeFolderAdd() }, t('cancel')),
        h('button', {
          type: 'button', className: 'dsc-primary-button',
          disabled: add.busy || add.selected.length === 0,
          onClick: () => { void chatActions.submitFolderAdd() },
        }, t('folderAddConfirm')),
      ),
    ),
  )
}

/** Archived chats: the only place they are listed, with restore and delete. */
function ArchiveDialog() {
  const t = useT()
  const open = useChat(state => state.archiveOpen)
  const conversations = useChat(state => state.conversations)
  const folders = useChat(state => state.folders)
  if (!open) return null
  const archived = conversations
    .filter(conversation => conversation.archived === true)
    .sort((left, right) => (right.archivedAt ?? right.updatedAt) - (left.archivedAt ?? left.updatedAt))
  const folderName = folderId => folders.find(folder => folder.id === folderId)?.name ?? ''
  return h(ModalBackdrop, { onDismiss: () => chatActions.closeArchive() },
    h('div', { className: 'dsc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('archiveTitle') },
      h('header', { className: 'dsc-modal-head' },
        h('div', null,
          h('h2', null, t('archiveTitle')),
          h('p', { className: 'dsc-modal-sub' }, t('archiveSubtitle')),
        ),
        h('button', {
          type: 'button', className: 'dsc-icon-button', title: t('close'), 'aria-label': t('close'),
          autoFocus: true, onClick: () => chatActions.closeArchive(),
        }, h(Icon, { name: 'close', size: 18 })),
      ),
      h('div', { className: 'dsc-modal-body' },
        archived.length === 0
          ? h('div', { className: 'dsc-list-empty' }, t('archiveEmpty'))
          : h('div', { className: 'dsc-archive-list' },
              archived.map(conversation => h('div', { key: conversation.id, className: 'dsc-archive-item' },
                h('div', { className: 'dsc-archive-item-main' },
                  h('span', { className: 'dsc-archive-item-title' }, conversation.title || t('newChatTitle')),
                  h('span', { className: 'dsc-archive-item-meta' },
                    `${relativeTime(conversation.archivedAt ?? conversation.updatedAt, t)} · ${t('messageCount', { count: conversation.messageCount ?? 0 })}${conversation.folderId === null ? '' : ` · ${folderName(conversation.folderId)}`}`,
                  ),
                ),
                h('div', { className: 'dsc-archive-actions' },
                  h('button', {
                    type: 'button', className: 'dsc-secondary-button is-small-compact',
                    onClick: () => { void chatActions.setArchived(conversation.id, false) },
                  }, t('restore')),
                  h('button', {
                    type: 'button', className: 'dsc-icon-button is-small is-danger', title: t('delete'), 'aria-label': t('delete'),
                    onClick: () => chatActions.requestDeleteConversation(conversation.id, conversation.title),
                  }, h(Icon, { name: 'trash', size: 14 })),
                ),
              )),
            ),
      ),
    ),
  )
}

/** Absolute date for one export row; the export timestamp is ISO-8601 UTC. */
function importDateLabel(timestamp, t) {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp) || timestamp <= 0) return t('importDateUnknown')
  try {
    return new Intl.DateTimeFormat(appCtx?.locale.getSnapshot().active === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(timestamp))
  } catch {
    return new Date(timestamp).toLocaleString()
  }
}

/** Case-insensitive title filter for the preview list. */
function filterImportRows(conversations, filter) {
  const needle = typeof filter === 'string' ? filter.trim().toLowerCase() : ''
  if (needle === '') return conversations
  return conversations.filter(conversation => (
    typeof conversation?.title === 'string' && conversation.title.toLowerCase().includes(needle)
  ))
}

/**
 * Chat-history import from a DeepSeek export ZIP.
 *
 * The dialog walks one state machine owned by the store: pick a file, read the
 * preview, choose conversations, follow the import, read the result. The Host
 * parses everything locally, so the only thing this surface does with the file
 * is hand the bytes over once.
 */
function ImportDialog() {
  const t = useT()
  const open = useChat(state => state.importOpen)
  const view = useChat(state => state.importView)
  const inputRef = React.useRef(null)
  const [drag, setDrag] = React.useState(false)
  if (!open || view === null) return null
  const step = view.step
  const parsing = step === 'parsing'
  const importing = step === 'importing'
  const selected = new Set(view.selected)
  const visible = filterImportRows(view.conversations, view.filter)
  const importableCount = view.conversations.filter(item => item.imported !== true).length
  const close = () => chatActions.closeImport()
  const pick = (file) => {
    if (file !== undefined && file !== null) void chatActions.selectImportFile(file)
  }
  const percent = view.progress.total > 0
    ? Math.min(100, Math.round((view.progress.done / view.progress.total) * 100))
    : 0
  const head = h('header', { className: 'dsc-modal-head' },
    h('div', null,
      h('h2', null, t('importTitle')),
      h('p', { className: 'dsc-modal-sub' }, t('importSubtitle')),
    ),
    h('button', {
      type: 'button',
      className: 'dsc-icon-button',
      title: t('close'),
      'aria-label': t('close'),
      autoFocus: step !== 'preview',
      disabled: importing,
      onClick: close,
    }, h(Icon, { name: 'close', size: 18 })),
  )

  const pickBody = h('div', { className: 'dsc-modal-body dsc-import-pick' },
    h('div', {
      className: cx('dsc-import-drop', drag && 'is-drag', parsing && 'is-busy'),
      role: 'button',
      tabIndex: 0,
      onClick: () => {
        if (!parsing) inputRef.current?.click()
      },
      onKeyDown: (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        if (!parsing) inputRef.current?.click()
      },
      onDragOver: (event) => {
        event.preventDefault()
        if (!parsing) setDrag(true)
      },
      onDragLeave: () => setDrag(false),
      onDrop: (event) => {
        event.preventDefault()
        setDrag(false)
        if (parsing) return
        pick(event.dataTransfer?.files?.[0])
      },
    },
      parsing ? h(Spinner, { size: 22, label: t('importParsing') }) : h('span', { className: 'dsc-import-drop-icon' }, h(Icon, { name: 'archive', size: 24 })),
      parsing
        ? h('div', { className: 'dsc-import-drop-title' }, t('importParsing'))
        : h('div', { className: 'dsc-import-drop-title' }, t('importDropTitle')),
      parsing
        ? h('div', { className: 'dsc-import-drop-hint' }, t('importParsingHint'))
        : h('div', { className: 'dsc-import-drop-hint' }, t('importDropHint')),
    ),
    view.error !== ''
      ? h('div', { className: 'dsc-notice is-error dsc-import-error' },
          h(Icon, { name: 'warning', size: 16 }),
          h('span', null, view.error),
        )
      : null,
  )

  const previewBody = h('div', { className: 'dsc-modal-body dsc-import-preview' },
    h('div', { className: 'dsc-import-summary' },
      h('div', { className: 'dsc-import-summary-main' },
        h('span', { className: 'dsc-import-file-name', title: view.fileName }, view.fileName),
        h('span', { className: 'dsc-import-file-meta' },
          t('importFileMeta', { size: formatSize(view.fileSize), count: view.stats.total }),
        ),
      ),
      h('div', { className: 'dsc-import-summary-side' },
        h('button', {
          type: 'button', className: 'dsc-secondary-button is-small-compact',
          onClick: () => inputRef.current?.click(),
        }, t('importChooseFile')),
      ),
    ),
    importableCount === 0
      ? h('div', { className: 'dsc-list-empty' }, t('importAllImported'))
      : h(React.Fragment, null,
          h('div', { className: 'dsc-import-toolbar' },
            h('button', {
              type: 'button',
              role: 'checkbox',
              'aria-checked': view.selected.length > 0 && view.selected.length >= importableCount,
              className: cx('dsc-import-check-all', view.selected.length > 0 && 'is-on'),
              onClick: () => chatActions.selectAllImport(view.selected.length < importableCount),
            },
              h('span', { className: 'dsc-choice-check' },
                view.selected.length >= importableCount ? h(Icon, { name: 'check', size: 13 }) : null,
              ),
              h('span', null, t('importSelectAll')),
            ),
            h('span', { className: 'dsc-import-count' },
              t('importSelected', { count: view.selected.length, total: importableCount }),
            ),
          ),
          importableCount > 100
            ? h('p', { className: 'dsc-import-hint' }, t('importLargeHint'))
            : null,
          h('div', { className: 'dsc-import-filter' },
            h(Icon, { name: 'search', size: 14 }),
            h('input', {
              className: 'dsc-import-filter-input',
              value: view.filter,
              placeholder: t('importFilter'),
              'aria-label': t('importFilter'),
              onChange: (event) => chatActions.setImportFilter(event.target.value),
            }),
          ),
          h('div', { className: 'dsc-import-list', role: 'group', 'aria-label': t('importTitle') },            visible.length === 0
              ? h('div', { className: 'dsc-list-empty' }, t('importEmpty'))
              : visible.map(conversation => {
                  const imported = conversation.imported === true
                  // An imported conversation is never part of the selection: it
                  // is already in the history, and the badge says so.
                  const on = selected.has(conversation.sourceId)
                  return h('button', {
                    key: conversation.sourceId,
                    type: 'button',
                    role: 'checkbox',
                    'aria-checked': on,
                    disabled: imported,
                    className: cx('dsc-import-item', on && 'is-selected', imported && 'is-imported'),
                    onClick: () => chatActions.toggleImportConversation(conversation.sourceId),
                  },
                    h('span', { className: 'dsc-choice-check' },
                      on ? h(Icon, { name: 'check', size: 13 }) : null,
                    ),
                    h('span', { className: 'dsc-import-item-main' },
                      h('span', { className: 'dsc-import-item-title' }, conversation.title || t('newChatTitle')),
                      h('span', { className: 'dsc-import-item-meta' },
                        `${importDateLabel(conversation.createdAt, t)} · ${t('messageCount', { count: conversation.messageCount })}`,
                      ),
                    ),
                    imported
                      ? h('span', { className: 'dsc-import-badge' }, t('importAlreadyImported'))
                      : null,
                  )
                }),
          ),
        ),
    view.error !== ''
      ? h('div', { className: 'dsc-notice is-error dsc-import-error' },
          h(Icon, { name: 'warning', size: 16 }),
          h('span', null, view.error),
        )
      : null,
  )

  const importingBody = h('div', { className: 'dsc-modal-body dsc-import-progress' },
    h('div', { className: 'dsc-import-progress-head' },
      h('span', { className: 'dsc-import-progress-label' }, t('importImporting')),
      h('span', { className: 'dsc-import-progress-count' },
        t('importProgress', { done: view.progress.done, total: view.progress.total }),
      ),
    ),
    h('div', {
      className: 'dsc-import-bar',
      role: 'progressbar',
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': percent,
      'aria-label': t('importImporting'),
    }, h('div', { className: 'dsc-import-bar-fill', style: { width: `${percent}%` } })),
    h('p', { className: 'dsc-import-hint' }, t('importDoneHint')),
    view.error !== ''
      ? h('div', { className: 'dsc-notice is-error dsc-import-error' },
          h(Icon, { name: 'warning', size: 16 }),
          h('span', null, view.error),
        )
      : null,
  )

  const result = view.result
  const resultBody = h('div', { className: 'dsc-modal-body dsc-import-result' },
    h('div', { className: 'dsc-import-stats' },
      h('div', { className: 'dsc-import-stat is-ok' },
        h('span', { className: 'dsc-import-stat-value' }, String(result?.imported ?? 0)),
        h('span', { className: 'dsc-import-stat-label' }, t('importStatImported')),
      ),
      h('div', { className: 'dsc-import-stat is-skip' },
        h('span', { className: 'dsc-import-stat-value' }, String(result?.skipped ?? 0)),
        h('span', { className: 'dsc-import-stat-label' }, t('importStatSkipped')),
      ),
      h('div', { className: cx('dsc-import-stat', (result?.failed ?? 0) > 0 && 'is-fail') },
        h('span', { className: 'dsc-import-stat-value' }, String(result?.failed ?? 0)),
        h('span', { className: 'dsc-import-stat-label' }, t('importStatFailed')),
      ),
    ),
    h('p', { className: 'dsc-import-hint' }, t('importDoneHint')),
    (result?.skipped ?? 0) > 0 ? h('p', { className: 'dsc-import-hint' }, t('importSkippedHint')) : null,
    result?.media?.restored > 0
      ? h('p', { className: 'dsc-import-hint' }, `${t('importImages', { count: result.media.restored })} · ${t('importMediaNote')}`)
      : null,
    (result?.imported ?? 0) > 0
      ? h('div', { className: 'dsc-import-memory' },
          h('span', { className: 'dsc-import-memory-icon' }, h(Icon, { name: 'brain', size: 18 })),
          h('div', { className: 'dsc-import-memory-copy' },
            h('span', { className: 'dsc-import-memory-title' }, t('importMemoryTitle')),
            h('p', { className: 'dsc-import-memory-hint' }, t('importMemoryBody')),
          ),
          h('button', {
            type: 'button',
            className: 'dsc-secondary-button',
            // Capture the batch before closing: closing clears the import view.
            onClick: () => {
              if (chatActions.openImportMemory(view.selected)) close()
            },
          }, t('importMemoryOpen')),
        )
      : null,
    Array.isArray(result?.failures) && result.failures.length > 0
      ? h('div', { className: 'dsc-import-failures' },
          h('div', { className: 'dsc-import-failures-title' }, t('importFailedList')),
          result.failures.slice(0, 8).map(item => h('div', { key: item.sourceId ?? item.title, className: 'dsc-import-failure' },
            h('span', { className: 'dsc-import-failure-title', title: item.reason ?? '' }, item.title || item.sourceId || '—'),
            h('span', { className: 'dsc-import-failure-reason' }, String(item.code ?? '')),
          )),
        )
      : null,
    view.error !== ''
      ? h('div', { className: 'dsc-notice is-error dsc-import-error' },
          h(Icon, { name: 'warning', size: 16 }),
          h('span', null, view.error),
        )
      : null,
  )

  const footer = step === 'pick'
    ? h('footer', { className: 'dsc-modal-foot' },
        h('div', { className: 'dsc-modal-foot-note' }),
        h('button', { type: 'button', className: 'dsc-secondary-button', onClick: close }, t('importExit')),
        h('button', {
          type: 'button', className: 'dsc-primary-button', disabled: parsing,
          onClick: () => inputRef.current?.click(),
        }, t('importChooseFile')),
      )
    : step === 'preview'
      ? h('footer', { className: 'dsc-modal-foot' },
          h('div', { className: 'dsc-modal-foot-note' },
            t('importSelected', { count: view.selected.length, total: importableCount }),
          ),
          h('button', { type: 'button', className: 'dsc-secondary-button', onClick: close }, t('importExit')),
          h('button', {
            type: 'button',
            className: 'dsc-primary-button',
            disabled: view.selected.length === 0 || view.token === '',
            onClick: () => { void chatActions.startImport() },
          }, t('importStart')),
        )
      : step === 'importing'
        ? h('footer', { className: 'dsc-modal-foot' },
            h('div', { className: 'dsc-modal-foot-note' },
              t('importProgress', { done: view.progress.done, total: view.progress.total }),
            ),
            h('button', {
              type: 'button',
              className: 'dsc-secondary-button',
              disabled: view.cancelling,
              onClick: () => { void chatActions.cancelImport() },
            }, view.cancelling ? t('importCancelling') : t('importCancel')),
          )
        : h('footer', { className: 'dsc-modal-foot' },
            h('div', { className: 'dsc-modal-foot-note' }),
            h('button', {
              type: 'button', className: 'dsc-primary-button', autoFocus: true,
              onClick: close,
            }, t('importClose')),
          )

  return h(ModalBackdrop, { onDismiss: close },
    h('div', { className: 'dsc-modal dsc-import-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('importTitle') },
      // One hidden picker serves both the drop zone and the "choose file" button,
      // so the file dialog can be reopened from the preview step as well.
      h('input', {
        ref: inputRef,
        className: 'dsc-import-input',
        type: 'file',
        accept: '.zip,application/zip,application/x-zip-compressed',
        tabIndex: -1,
        'aria-hidden': 'true',
        onChange: (event) => {
          pick(event.target.files?.[0])
          event.target.value = ''
        },
      }),
      head,
      step === 'pick' || step === 'parsing' ? pickBody : step === 'preview' ? previewBody : importing ? importingBody : resultBody,
      footer,
    ),
  )
}

function ConfirmDialog() {  const t = useT()
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
  return h(ModalBackdrop, { onDismiss: () => chatStore.set({ confirm: null }) },
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
