const CHAT_CSS = `
/* ==========================================================================
   DeepSeek Chat mode — shell-coordinated surfaces.

   Placement contract with DeepSeek Harness:
   * the Chat view is a frame-wide layer that starts BELOW the platform chrome
     (--dsh-frame-chrome-top: the Windows caption row / the macOS top strip),
     so the native menu, sidebar toggle and window controls stay usable;
   * the shared Chat | Agent switch lives in that chrome row, centered, and
     never overlaps the native menu or the window buttons;
   * every colour, radius and motion value comes from the Harness theme.
   ========================================================================== */
/* Shared token scope: the Chat surface and the two shell entries (the switch
   and the toast stack) all read the same --dsc-* aliases. */
.dsc-shell,
.dsc-root {
  --dsc-brand: var(--dsw-alias-brand-primary, var(--dsw-static-deepseek-500, #4d6bff));
  --dsc-link: var(--dsw-alias-link, var(--dsw-alias-brand-primary, #4d6bff));
  --dsc-on-brand: var(--dsw-alias-label-on-color, #ffffff);
  --dsc-bg: var(--dsw-alias-bg-base, #ffffff);
  --dsc-layer: var(--dsw-alias-bg-layer-1, #ffffff);
  --dsc-layer2: var(--dsw-alias-bg-layer-2, #f2f3f7);
  --dsc-sidebar: var(--dsw-specific-sidebar-fill, #f7f8fc);
  --dsc-text: var(--dsw-alias-label-primary, #16181d);
  --dsc-muted: var(--dsw-alias-label-secondary, #6b7280);
  --dsc-border: var(--dsw-alias-border-l1, rgba(15, 23, 42, 0.08));
  --dsc-border-strong: var(--dsw-alias-border-l2, rgba(15, 23, 42, 0.14));
  --dsc-border-l3: var(--dsw-alias-border-l3, rgba(15, 23, 42, 0.12));
  --dsc-elevated: var(--dsw-alias-button-elevated-fill, var(--dsc-layer));
  --dsc-elevated-hover: var(--dsw-alias-button-floating-hover, var(--dsc-layer2));
  --dsc-field: color-mix(in srgb, var(--dsc-text) 4%, transparent);
  --dsc-hover: color-mix(in srgb, var(--dsc-text) 5.5%, transparent);
  --dsc-active: color-mix(in srgb, var(--dsc-text) 9%, transparent);
  --dsc-brand-soft: color-mix(in srgb, var(--dsc-link) 11%, transparent);
  --dsc-brand-soft-strong: color-mix(in srgb, var(--dsc-link) 18%, transparent);
  --dsc-user-bubble: color-mix(in srgb, var(--dsc-link) 9%, var(--dsc-layer2));
  --dsc-code-bg: color-mix(in srgb, var(--dsc-text) 4%, var(--dsc-layer2));
  --dsc-error: var(--dsw-alias-state-error-primary, #d33d3d);
  --dsc-warn: var(--dsw-alias-state-warn-primary, #b45309);
  --dsc-success: var(--dsw-alias-state-success-primary, #15803d);
  --dsc-shadow: 0 20px 48px rgba(9, 12, 20, 0.18);
  --dsc-shadow-soft: 0 4px 16px rgba(9, 12, 20, 0.07);
  --dsc-shadow-composer: 0 2px 10px rgba(9, 12, 20, 0.05);
  --dsc-radius: var(--dsw-radius-md, 12px);
  --dsc-font: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif);
  --dsc-mono: var(--ds-font-family-code, 'SF Mono', Consolas, 'Liberation Mono', monospace);
  --dsc-ease: var(--ds-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
  --dsc-fast: var(--ds-transition-duration-fast, 0.1s);
}
/* The shell entries are siblings of the Chat surface, so they carry their own
   root: display:contents keeps them out of the layout while custom
   properties and box-sizing still reach their children. */
.dsc-shell { display: contents; }
.dsc-shell *,
.dsc-shell *::before,
.dsc-shell *::after,
.dsc-root *,
.dsc-root *::before,
.dsc-root *::after { box-sizing: border-box; }
.dsc-shell { font-family: var(--dsc-font); }
.dsc-root {
  /* The band above the Chat surface that the platform chrome occupies. Windows
     publishes its 40px caption row, macOS its 48px top strip; a plain browser
     gets a 44px band of its own so the shared switch always has a home and is
     never covered by the chat surface. Fullscreen hides the native chrome, so
     only the switch band remains. */
  --dsc-top: var(--dsh-frame-chrome-top, var(--dsh-frame-top-clearance, 44px));
  position: fixed;
  top: var(--dsc-top);
  right: 0;
  bottom: 0;
  left: 0;
  /* Above the mode switch so an open dialog backdrop also covers it; the box
     itself starts below the band, so the switch stays clickable. */
  z-index: 30;
  display: flex;
  overflow: hidden;
  background: var(--dsc-bg);
  color: var(--dsc-text);
  font-family: var(--dsc-font);
  font-size: 14px;
  line-height: 1.55;
  pointer-events: auto;
  -webkit-font-smoothing: antialiased;
}
.dsc-root :where(button, input, textarea, select) { font: inherit; color: inherit; }
.dsc-root button { cursor: pointer; }
.dsc-root button:disabled { cursor: default; }
.dsc-root ::selection { background: var(--dsc-brand-soft-strong); }
.dsc-root :focus-visible { outline: 2px solid var(--dsc-brand); outline-offset: 2px; }
.dsc-icon { display: block; flex: none; }
.dsc-spinner {
  display: inline-block;
  border: 2px solid var(--dsc-border-strong);
  border-top-color: var(--dsc-brand);
  border-radius: 999px;
  animation: dsc-spin 0.8s linear infinite;
}
@keyframes dsc-spin { to { transform: rotate(360deg); } }

/* ---------- shared Chat | Agent switch (shell chrome) ----------
   ChatGPT-style asymmetric segmented control:
   * one dark pill track, two text segments inside it;
   * ONE floating chip behind the selected segment, wider (55%) than the other
     segment (45%) and slightly taller than the track's inner area, so the
     selected mode owns a real, larger surface and the other one is plain text;
   * when the mode flips, the chip slides and resizes while the track keeps its
     width and centre, and the labels re-centre inside their own segments.

   Placement: the middle of the native Session header's toolbar line
   (--dsh-frame-chrome-top + the header's 10px top padding + half of its 30px
   title row), refined at runtime from the header's published corner anchor.
   Horizontally the main content column: the published native sidebar width in
   Agent mode, the measured chat column in Chat mode. */
.dsc-modeswitch {
  --dsc-nav-height: 40px;
  --dsc-nav-width: 244px;
  --dsc-nav-selected: 55%;
  position: fixed;
  top: calc(var(--dsh-frame-chrome-top, 0px) + 25px);
  left: var(--dsh-windows-sidebar-width, 0px);
  right: 0;
  width: var(--dsc-nav-width);
  height: var(--dsc-nav-height);
  margin-inline: auto;
  transform: translateY(-50%);
  /* Above the Chat surface (z 30): the switch belongs to both modes and must
     stay clickable while the Chat layer covers the native header behind it. */
  z-index: 40;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 6%, transparent);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 7%, transparent),
    0 1px 2px rgba(9, 12, 20, 0.12);
  color: var(--dsw-alias-label-primary, #16181d);
  font-family: var(--dsw-font-family, -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif);
  font-size: 13.5px;
  line-height: 1;
  -webkit-app-region: no-drag;
  pointer-events: auto;
  user-select: none;
  backdrop-filter: blur(12px);
}
/* The chip: one element that slides and resizes with the active segment. It is
   taller than the segments' hit area (2px rim instead of 4px), which is what
   makes the selected mode read as a fuller, raised surface. */
.dsc-modeswitch-thumb {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  width: calc(var(--dsc-nav-selected) - 4px);
  border-radius: 999px;
  background: var(--dsw-alias-bg-base, #ffffff);
  box-shadow:
    0 1px 2px rgba(9, 12, 20, 0.16),
    0 6px 18px rgba(9, 12, 20, 0.08),
    inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary, #16181d) 9%, transparent);
  transition:
    left 240ms var(--dsc-ease),
    width 240ms var(--dsc-ease),
    background-color 160ms ease,
    box-shadow 160ms ease;
}
/* Dark palette: the header is already dark, so the chip is a lighter surface
   with a soft rim rather than a white card. */
body[data-ds-dark-theme] .dsc-modeswitch-thumb {
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #f2f3f7) 12%, var(--dsw-alias-bg-layer-1, #1b1c1f));
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.42),
    0 8px 22px rgba(0, 0, 0, 0.20),
    inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary, #f2f3f7) 10%, transparent);
}
.dsc-modeswitch[data-active='agent'] .dsc-modeswitch-thumb {
  left: calc(100% - var(--dsc-nav-selected) + 2px);
}
.dsc-modeswitch-item {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.005em;
  white-space: nowrap;
  transition:
    left 240ms var(--dsc-ease),
    width 240ms var(--dsc-ease),
    color 160ms ease;
}
.dsc-modeswitch-item:hover { color: var(--dsw-alias-label-primary, #16181d); }
.dsc-modeswitch[data-active='chat'] .dsc-modeswitch-item.is-chat,
.dsc-modeswitch[data-active='agent'] .dsc-modeswitch-item.is-agent {
  color: var(--dsw-alias-label-primary, #16181d);
  font-weight: 600;
}
/* Segment geometry: the selected one is wider (55%) and the other 45%; the
   total width and centre never change. */
.dsc-modeswitch[data-active='chat'] .dsc-modeswitch-item.is-chat { left: 0; width: var(--dsc-nav-selected); }
.dsc-modeswitch[data-active='chat'] .dsc-modeswitch-item.is-agent { left: var(--dsc-nav-selected); width: calc(100% - var(--dsc-nav-selected)); }
.dsc-modeswitch[data-active='agent'] .dsc-modeswitch-item.is-chat { left: 0; width: calc(100% - var(--dsc-nav-selected)); }
.dsc-modeswitch[data-active='agent'] .dsc-modeswitch-item.is-agent { left: calc(100% - var(--dsc-nav-selected)); width: var(--dsc-nav-selected); }
.dsc-modeswitch-item:active .dsc-modeswitch-label { transform: scale(0.985); }
.dsc-modeswitch-label {
  display: block;
  transition: transform 120ms var(--dsc-ease);
}
.dsc-modeswitch-item:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4d6bff);
  outline-offset: 2px;
}
/* Fullscreen hides the native chrome; the Chat surface keeps only the switch band. */
html[data-fullscreen] .dsc-root { --dsc-top: 44px; }

/* ---------- sidebar ---------- */
/* The Chat column mirrors the native Harness sidebar's anatomy: one brand row,
   the New conversation bar, the search field, then the history list and the
   footer. Its width is a Chat-owned preference (the same 264-420px contract as
   the native handle) because Chat has no workspace rail to follow; the shared
   Chat | Agent switch measures the content column, so it stays centred at any
   sidebar width. */
.dsc-sidebar-column {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  width: var(--dsc-sidebar-width, 280px);
  min-width: 264px;
  /* Never squeeze the chat column below a readable width in a narrow window. */
  max-width: calc(100vw - 460px);
  min-height: 0;
}
.dsc-sidebar-column:not(.is-open) { display: none; }
.dsc-sidebar {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: var(--dsc-sidebar);
  border-right: 1px solid var(--dsc-border);
  overflow: hidden;
}
.dsc-sidebar-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 6px 8px 8px;
}
/* Brand row: centers the lockup on the native sidebar's Windows logo line (a
   40px row with a 1px optical lift, i.e. a 21px center inset) rather than the
   taller Chat header, so the whale + wordmark sit level with the Harness Agent
   brand beside the shared switch. */
.dsc-sidebar-brand {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 2px 0 8px;
  overflow: hidden;
}
.dsc-brand-lockup {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  color: var(--dsc-link);
  overflow: hidden;
}
.dsc-brand-logo { display: block; flex: none; }
.dsc-sidebar-collapse { flex: none; width: 28px; height: 28px; border-radius: 8px; }
/* New conversation: native New Session geometry (38px bar, 12px radius,
   elevated fill) with icon and label centred as one group. */
.dsc-new-chat {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  margin: 4px 2px 10px;
  padding: 0 12px;
  border: 0.5px solid var(--dsc-border-l3);
  border-radius: var(--dsc-radius);
  background: var(--dsc-elevated);
  color: var(--dsc-text);
  font-size: 14px;
  font-weight: 500;
  transition: background var(--dsc-fast) ease, border-color var(--dsc-fast) ease;
}
.dsc-new-chat:hover { background: var(--dsc-elevated-hover); }
.dsc-new-chat .dsc-icon { color: var(--dsc-muted); }
.dsc-search {
  flex: none;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  margin: 0 2px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: var(--dsc-field);
  color: var(--dsc-muted);
  cursor: text;
  transition: background var(--dsc-fast) ease, border-color var(--dsc-fast) ease;
}
.dsc-search:hover { background: color-mix(in srgb, var(--dsc-text) 6%, transparent); }
.dsc-search:focus-within { border-color: var(--dsc-border-strong); background: var(--dsc-layer); }
.dsc-search-input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 13px; color: var(--dsc-text); }
.dsc-search-input::placeholder { color: var(--dsc-muted); }
.dsc-chat-list { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 2px 10px; }
.dsc-chat-group { margin-top: 12px; }
.dsc-chat-group:first-child { margin-top: 2px; }
.dsc-chat-group-label {
  padding: 0 8px 6px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--dsc-muted);
}
.dsc-chat-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 8px;
  margin: 1px 0;
  border-radius: var(--dsc-radius);
  cursor: pointer;
  transition: background var(--dsc-fast) ease;
}
.dsc-chat-item:hover { background: var(--dsc-hover); }
.dsc-chat-item:focus-within { background: var(--dsc-hover); }
.dsc-chat-item.is-active { background: var(--dsc-active); }
.dsc-chat-item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  text-align: left;
}
.dsc-chat-item-main:focus-visible { outline-offset: 0; }
.dsc-chat-item-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13.4px;
  font-weight: 450;
}
.dsc-chat-item.is-active .dsc-chat-item-title { font-weight: 550; }
.dsc-chat-item-time { flex: none; font-size: 11px; color: var(--dsc-muted); }
/* One hover action per row: everything else lives in its "···" menu. */
.dsc-chat-item-more {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: var(--dsc-sidebar);
  color: var(--dsc-muted);
}
.dsc-chat-item-more:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-chat-item:hover .dsc-chat-item-more,
.dsc-chat-item:focus-within .dsc-chat-item-more,
.dsc-chat-item.is-active .dsc-chat-item-more { display: inline-flex; }
.dsc-chat-item:hover .dsc-chat-item-time,
.dsc-chat-item:focus-within .dsc-chat-item-time,
.dsc-chat-item.is-active .dsc-chat-item-time { visibility: hidden; }
.dsc-chat-item-pin { display: inline-flex; flex: none; color: var(--dsc-muted); }
.dsc-chat-item.is-renaming { background: var(--dsc-layer); border: 1px solid var(--dsc-border-strong); }
.dsc-rename-input {
  width: 100%;
  height: 30px;
  padding: 0 2px;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 13px;
}
.dsc-list-empty { padding: 22px 10px; text-align: center; color: var(--dsc-muted); font-size: 12.4px; line-height: 1.6; }
/* ---------- folders ---------- */
.dsc-list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  margin: 10px 2px 0;
  padding: 0 4px 0 8px;
}
.dsc-list-toolbar-label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.01em; color: var(--dsc-muted); }
.dsc-folder-list { margin-top: 2px; }
.dsc-folder { margin-top: 1px; }
.dsc-folder-head {
  position: relative;
  display: flex;
  align-items: center;
  height: 30px;
  padding: 0 4px 0 2px;
  border-radius: var(--dsc-radius);
}
.dsc-folder-head:hover { background: var(--dsc-hover); }
.dsc-folder-toggle {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 4px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-text);
  font-size: 13px;
  font-weight: 550;
  text-align: left;
}
.dsc-folder-chevron { display: inline-flex; flex: none; width: 12px; color: var(--dsc-muted); }
.dsc-folder-icon { display: inline-flex; flex: none; color: var(--dsc-muted); }
.dsc-folder-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsc-folder-count { flex: none; font-size: 11px; color: var(--dsc-muted); }
.dsc-folder-head .dsc-chat-item-more { position: static; transform: none; background: transparent; flex: none; }
.dsc-folder-head:hover .dsc-chat-item-more,
.dsc-folder-head:focus-within .dsc-chat-item-more { display: inline-flex; }
.dsc-folder-items { padding-left: 10px; }
.dsc-folder-empty { padding: 5px 10px 8px 26px; font-size: 11.8px; color: var(--dsc-muted); }
.dsc-foot-count {
  margin-left: auto;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--dsc-field);
  color: var(--dsc-muted);
  font-size: 10.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
/* ---------- history search ---------- */
.dsc-search-clear {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsc-muted);
}
.dsc-search-clear:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-search-state { display: flex; align-items: center; gap: 8px; padding: 18px 10px; font-size: 12.4px; color: var(--dsc-muted); }
.dsc-search-results { display: flex; flex-direction: column; gap: 2px; padding-top: 4px; }
.dsc-search-result {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  padding: 8px 9px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--dsc-text);
  text-align: left;
}
.dsc-search-result:hover { background: var(--dsc-hover); }
.dsc-search-result.is-active { background: var(--dsc-active); }
.dsc-search-result-head { display: flex; align-items: center; gap: 5px; width: 100%; min-width: 0; }
.dsc-search-result-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 550; }
.dsc-search-result-badge { display: inline-flex; flex: none; color: var(--dsc-muted); }
.dsc-search-result-meta { font-size: 11px; color: var(--dsc-muted); }
.dsc-search-result-snippet {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 11.8px;
  line-height: 1.55;
  color: var(--dsc-muted);
  word-break: break-word;
}
.dsc-search-mark { padding: 0 1px; border-radius: 3px; background: var(--dsc-brand-soft-strong); color: inherit; }
/* The foot keeps the native sidebar's spacing-only separation: no extra rule. */
.dsc-sidebar-foot { flex: none; padding-top: 6px; }
.dsc-foot-action {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  height: 36px;
  padding: 0 9px;
  border: 0;
  border-radius: var(--dsc-radius);
  background: transparent;
  font-size: 13px;
  color: var(--dsc-muted);
  text-align: left;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease;
}
.dsc-foot-action:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-auth-dot { width: 7px; height: 7px; border-radius: 999px; margin-left: auto; background: var(--dsc-warn); }
.dsc-auth-dot.is-ready { background: var(--dsc-success); }
.dsc-auth-dot.is-missing { background: var(--dsc-warn); }
/* Right-edge resize affordance: an 8px pointer-capture strip over the column
   border, like the native frame handle. A short accent line appears on hover,
   keyboard focus and while dragging instead of a permanent divider. */
.dsc-sidebar-resizer {
  position: absolute;
  top: 0;
  right: -4px;
  bottom: 0;
  width: 8px;
  z-index: 2;
  cursor: col-resize;
  touch-action: none;
  outline: none;
}
.dsc-sidebar-resizer::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 3px;
  width: 2px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsc-text) 22%, transparent);
  opacity: 0;
  transition: opacity var(--dsc-fast) ease;
}
.dsc-sidebar-resizer:hover::after,
.dsc-sidebar-resizer:focus-visible::after,
.dsc-sidebar-resizer.is-dragging::after { opacity: 1; }
.dsc-sidebar-resizer:focus-visible { outline: 2px solid var(--dsc-brand); outline-offset: -1px; }
.dsc-root[data-resizing] { cursor: col-resize; user-select: none; }
.dsc-root[data-resizing] :where(button, a, textarea, input, label) { cursor: col-resize; }
.dsc-root[data-resizing] .dsc-sidebar-resizer::after { opacity: 1; }

/* ---------- main column ---------- */
.dsc-main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; background: var(--dsc-bg); }
.dsc-main-column { flex: 1; display: flex; flex-direction: column; height: 100%; min-height: 0; }
.dsc-header {
  flex: none;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px 0 16px;
  border: 0;
  background: color-mix(in srgb, var(--dsc-bg) 88%, transparent);
  backdrop-filter: blur(14px);
  z-index: 3;
}
.dsc-header-left { display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1; }
.dsc-header-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 560;
  letter-spacing: -0.005em;
}
.dsc-header-right { display: flex; align-items: center; gap: 6px; flex: none; }
.dsc-header-menu { margin-left: -6px; }
.dsc-handoff-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 11px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 9px;
  background: var(--dsc-layer);
  color: var(--dsc-text);
  font-size: 12.6px;
  font-weight: 550;
  white-space: nowrap;
  transition: background var(--dsc-fast) ease, border-color var(--dsc-fast) ease;
}
.dsc-handoff-button:hover { background: var(--dsc-hover); border-color: var(--dsc-border-strong); }
.dsc-handoff-button:disabled { opacity: 0.42; }
.dsc-auth-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 27px;
  padding: 0 9px;
  border: 1px solid color-mix(in srgb, var(--dsc-warn) 26%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsc-warn) 8%, transparent);
  color: var(--dsc-warn);
  font-size: 11.4px;
  font-weight: 600;
}
.dsc-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--dsc-muted);
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease;
}
.dsc-icon-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-icon-button.is-small { width: 24px; height: 24px; border-radius: 6px; }
.dsc-icon-button.is-danger:hover { color: var(--dsc-error); background: color-mix(in srgb, var(--dsc-error) 9%, transparent); }

/* ---------- thread ---------- */
.dsc-thread {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 26px 20px 10px;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
}
.dsc-thread-inner {
  width: 100%;
  max-width: 788px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 26px;
}
.dsc-thread-loading { display: flex; align-items: center; justify-content: center; }
.dsc-thread-error {
  width: min(460px, 100%);
  margin: 12vh auto 0;
  padding: 20px;
  border: 1px solid var(--dsc-border);
  border-radius: 14px;
  background: var(--dsc-layer);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  box-shadow: var(--dsc-shadow-soft);
}
.dsc-thread-error-icon { color: var(--dsc-warn); display: flex; }
.dsc-thread-error strong { font-size: 14px; }
.dsc-thread-error span { font-size: 12.5px; color: var(--dsc-muted); line-height: 1.55; word-break: break-word; }
.dsc-thread-error .dsc-secondary-button { margin-top: 7px; }
.dsc-thread::-webkit-scrollbar,
.dsc-chat-list::-webkit-scrollbar,
.dsc-modal-body::-webkit-scrollbar,
.dsc-handoff-brief::-webkit-scrollbar,
.dsc-pre::-webkit-scrollbar { width: 10px; height: 10px; }
.dsc-thread::-webkit-scrollbar-thumb,
.dsc-chat-list::-webkit-scrollbar-thumb,
.dsc-modal-body::-webkit-scrollbar-thumb,
.dsc-handoff-brief::-webkit-scrollbar-thumb,
.dsc-pre::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--dsc-text) 16%, transparent);
  border: 3px solid transparent;
  background-clip: content-box;
  border-radius: 999px;
}
.dsc-thread::-webkit-scrollbar-thumb:hover,
.dsc-chat-list::-webkit-scrollbar-thumb:hover,
.dsc-modal-body::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--dsc-text) 28%, transparent); background-clip: content-box; }

/* ---------- empty state ---------- */
/* A blank Chat page is one personalized line and the composer. The thread
   centres the line in the space above the composer (auto margins keep it
   scrollable when the window is short), so the eye lands on the greeting
   instead of on a grid of feature cards. */
.dsc-thread.is-empty { display: flex; flex-direction: column; scrollbar-gutter: auto; }
.dsc-thread.is-empty .dsc-empty { margin-block: auto; }
.dsc-empty {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 4px 5vh;
  text-align: center;
}
.dsc-greeting {
  max-width: 700px;
  margin: 0 auto;
  font-size: clamp(26px, 2.45vw, 32px);
  font-weight: 560;
  letter-spacing: -0.022em;
  line-height: 1.36;
  color: var(--dsc-text);
  text-wrap: balance;
  overflow-wrap: anywhere;
}
.dsc-primary-button {
  height: 36px;
  padding: 0 15px;
  border: 0;
  border-radius: 9px;
  background: var(--dsc-brand);
  color: var(--dsc-on-brand);
  font-size: 12.9px;
  font-weight: 600;
  white-space: nowrap;
  transition: filter var(--dsc-fast) ease;
}
.dsc-primary-button:hover { filter: brightness(1.06); }
.dsc-primary-button:disabled { opacity: 0.45; }
.dsc-primary-button.is-danger { background: var(--dsc-error); }
.dsc-secondary-button {
  height: 36px;
  padding: 0 15px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 9px;
  background: transparent;
  font-size: 12.9px;
  font-weight: 550;
  white-space: nowrap;
  transition: background var(--dsc-fast) ease;
}
.dsc-secondary-button:hover { background: var(--dsc-hover); }
.dsc-secondary-button:disabled { opacity: 0.45; }
.dsc-text-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 7px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 11.9px;
  font-weight: 550;
}
.dsc-text-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-text-button:disabled { opacity: 0.45; }

/* ---------- messages ---------- */
.dsc-msg { display: flex; width: 100%; min-width: 0; }
.dsc-msg-user { justify-content: flex-end; padding-left: 10%; }
.dsc-user-block { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; max-width: 100%; min-width: 0; }
.dsc-user-bubble {
  max-width: 100%;
  padding: 10px 15px;
  border-radius: 18px;
  border-bottom-right-radius: 6px;
  background: var(--dsc-user-bubble);
  font-size: 14.6px;
  line-height: 1.68;
  overflow-wrap: anywhere;
}
.dsc-user-text { white-space: pre-wrap; word-break: break-word; }
.dsc-user-files { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 7px; }
.dsc-user-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  padding-right: 2px;
  opacity: 0;
  transition: opacity var(--dsc-fast) ease;
}
.dsc-msg-user:hover .dsc-user-actions,
.dsc-msg-user:focus-within .dsc-user-actions { opacity: 1; }
/* Inline question editor: the textarea itself stays borderless inside the
   bubble, and the footer lives on the same surface instead of a nested card. */
.dsc-user-bubble.is-editing { width: min(660px, 100%); padding: 9px 13px 7px; }
.dsc-user-edit-input {
  display: block;
  width: 100%;
  min-height: 44px;
  max-height: 260px;
  padding: 2px 1px;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  color: var(--dsc-text);
  font-size: 14.6px;
  line-height: 1.68;
}
.dsc-user-edit-actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; margin-top: 4px; }
.dsc-user-edit-hint { flex: 1; min-width: 0; font-size: 10.9px; line-height: 1.5; color: var(--dsc-muted); }
.dsc-primary-button.is-small { height: 29px; padding: 0 12px; font-size: 12px; }
.dsc-msg-assistant { align-items: flex-start; padding-right: 2%; }
.dsc-msg-body { flex: 1; min-width: 0; }
.dsc-msg-actions-spacer { flex: 1; }
.dsc-version { display: inline-flex; align-items: center; gap: 1px; flex: none; color: var(--dsc-muted); }
.dsc-version-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsc-muted);
}
.dsc-version-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-version-button:disabled { opacity: 0.4; }
.dsc-version-label { min-width: 30px; text-align: center; font-size: 11.2px; font-variant-numeric: tabular-nums; }
.dsc-msg.is-highlighted .dsc-user-bubble,
.dsc-msg.is-highlighted .dsc-msg-body { border-radius: 16px; animation: dsc-flash 1.9s ease; }
@keyframes dsc-flash {
  0% { box-shadow: 0 0 0 3px var(--dsc-brand-soft-strong); }
  72% { box-shadow: 0 0 0 3px var(--dsc-brand-soft-strong); }
  100% { box-shadow: 0 0 0 3px transparent; }
}

/* ---------- attachments ---------- */
.dsc-attach {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 260px;
  min-height: 38px;
  padding: 4px 6px;
  border: 1px solid var(--dsc-border);
  border-radius: 10px;
  background: var(--dsc-layer);
}
.dsc-attach.is-compact { max-width: 220px; min-height: 34px; padding: 3px 6px; background: transparent; }
.dsc-attach.is-error { border-color: color-mix(in srgb, var(--dsc-error) 36%, transparent); }
.dsc-attach-thumb { width: 32px; height: 32px; border-radius: 7px; object-fit: cover; flex: none; background: var(--dsc-layer2); }
.dsc-attach.is-compact .dsc-attach-thumb { width: 28px; height: 28px; }
.dsc-attach-icon {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dsc-brand-soft);
  color: var(--dsc-link);
  flex: none;
}
.dsc-attach-meta { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.dsc-attach-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.3px; font-weight: 550; }
.dsc-attach-size { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10.8px; color: var(--dsc-muted); }
.dsc-attach.is-error .dsc-attach-size { color: var(--dsc-error); }
.dsc-attach-action {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsc-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.dsc-attach-action:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-attach-rail { display: flex; flex-wrap: wrap; gap: 6px; padding: 2px 2px 8px; }

/* ---------- reasoning / process ---------- */
.dsc-process { margin: 0 0 12px; }
.dsc-process-head {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  max-width: 100%;
  min-height: 26px;
  padding: 2px 4px 2px 2px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 12.9px;
  font-weight: 550;
  text-align: left;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease;
}
.dsc-process-head:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-process-icon { color: var(--dsc-link); display: flex; }
.dsc-process-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsc-process-chevron { display: flex; color: var(--dsc-muted); }
.dsc-process-title.is-shimmer {
  background: linear-gradient(90deg, var(--dsc-muted) 0%, var(--dsc-link) 45%, var(--dsc-muted) 90%);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: dsc-shimmer 2.4s linear infinite;
}
@keyframes dsc-shimmer { from { background-position: 120% 0; } to { background-position: -120% 0; } }
.dsc-process-body { padding: 6px 0 4px 4px; }
.dsc-think-block {
  margin: 2px 0 10px;
  padding: 2px 0 2px 12px;
  border-left: 2px solid var(--dsc-border-strong);
  color: var(--dsc-muted);
  font-size: 13.2px;
  line-height: 1.72;
  max-height: 380px;
  overflow-y: auto;
}
.dsc-think-block.is-active { border-left-color: var(--dsc-brand-soft-strong); }
.dsc-think-block .dsc-md { font-size: 13.2px; line-height: 1.72; color: var(--dsc-muted); }
.dsc-step { display: flex; align-items: flex-start; gap: 8px; padding: 4px 0; }
.dsc-step-icon { color: var(--dsc-muted); padding-top: 1px; display: flex; }
.dsc-step-main { min-width: 0; flex: 1; }
.dsc-step-line { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; min-width: 0; font-size: 12.6px; }
.dsc-step-line.is-clickable { cursor: pointer; }
.dsc-step-line.is-clickable:hover .dsc-step-label { color: var(--dsc-link); }
.dsc-step-label { font-weight: 550; color: var(--dsc-text); }
.dsc-step-detail { color: var(--dsc-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 430px; }
.dsc-step-count { padding: 0 6px; border-radius: 999px; background: var(--dsc-brand-soft); color: var(--dsc-link); font-size: 10.8px; font-weight: 600; }
.dsc-step-pending { color: var(--dsc-link); font-size: 11.4px; }
.dsc-step-failed { color: var(--dsc-error); font-size: 11.4px; }
.dsc-step-page {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  margin-top: 3px;
  color: var(--dsc-link);
  font-size: 12px;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsc-step-page:hover { text-decoration: underline; }
.dsc-result-list { display: flex; flex-direction: column; gap: 5px; margin: 5px 0 3px; }
.dsc-result {
  display: block;
  padding: 7px 9px;
  border: 1px solid var(--dsc-border);
  border-radius: 9px;
  background: var(--dsc-layer);
  text-decoration: none;
  color: var(--dsc-text);
}
.dsc-result:hover { border-color: var(--dsc-border-strong); background: var(--dsc-hover); }
.dsc-result-title { display: block; font-size: 12.3px; font-weight: 550; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsc-result-meta { display: block; margin-top: 1px; font-size: 10.8px; color: var(--dsc-muted); }
.dsc-result-snippet {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 2px;
  font-size: 11.8px;
  line-height: 1.55;
  color: var(--dsc-muted);
}
.dsc-result-empty { padding: 5px 0; font-size: 12px; color: var(--dsc-muted); }

/* ---------- markdown ---------- */
.dsc-md { font-size: 15px; line-height: 1.78; word-break: break-word; }
.dsc-md > *:first-child { margin-top: 0; }
.dsc-md > *:last-child { margin-bottom: 0; }
.dsc-paragraph { margin: 0 0 12px; white-space: pre-wrap; }
.dsc-heading { margin: 22px 0 9px; line-height: 1.32; letter-spacing: -0.012em; font-weight: 620; }
h1.dsc-heading { font-size: 22px; }
h2.dsc-heading { font-size: 19px; }
h3.dsc-heading { font-size: 16.5px; }
h4.dsc-heading, h5.dsc-heading, h6.dsc-heading { font-size: 15px; }
.dsc-link { color: var(--dsc-link); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--dsc-link) 32%, transparent); }
.dsc-link:hover { border-bottom-color: var(--dsc-link); }
.dsc-inline-code {
  padding: 1.5px 5px;
  border-radius: 5px;
  background: var(--dsc-code-bg);
  font-family: var(--dsc-mono);
  font-size: 0.875em;
}
.dsc-code {
  margin: 13px 0;
  border: 1px solid var(--dsc-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--dsc-code-bg);
}
.dsc-code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 33px;
  padding: 0 8px 0 12px;
  border-bottom: 1px solid var(--dsc-border);
  background: color-mix(in srgb, var(--dsc-text) 2%, transparent);
}
.dsc-code-lang { font-size: 11.4px; color: var(--dsc-muted); font-weight: 600; text-transform: lowercase; letter-spacing: 0.02em; }
.dsc-code-copy {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 7px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 11.4px;
}
.dsc-code-copy:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-pre { margin: 0; padding: 13px 14px; overflow-x: auto; font-size: 12.7px; line-height: 1.66; }
.dsc-pre code { font-family: var(--dsc-mono); white-space: pre; }
.dsc-quote { margin: 12px 0; padding: 2px 14px; border-left: 3px solid var(--dsc-brand-soft-strong); color: var(--dsc-muted); white-space: pre-wrap; }
.dsc-list { margin: 8px 0 12px; padding-left: 22px; }
.dsc-list li { margin: 3px 0; }
.dsc-list li::marker { color: var(--dsc-muted); }
.dsc-table-wrap { overflow-x: auto; margin: 13px 0; border: 1px solid var(--dsc-border); border-radius: 10px; }
.dsc-table { border-collapse: collapse; width: 100%; font-size: 13px; }
.dsc-table th, .dsc-table td { padding: 7px 11px; border-bottom: 1px solid var(--dsc-border); text-align: left; vertical-align: top; }
.dsc-table th { background: color-mix(in srgb, var(--dsc-text) 3%, transparent); font-weight: 600; }
.dsc-table tr:last-child td { border-bottom: 0; }
.dsc-hr { border: 0; border-top: 1px solid var(--dsc-border); margin: 20px 0; }
.dsc-caret {
  display: inline-block;
  width: 2px;
  height: 15px;
  margin-left: 2px;
  border-radius: 1px;
  background: var(--dsc-brand);
  vertical-align: -2px;
  animation: dsc-blink 1.1s steps(2, start) infinite;
}
@keyframes dsc-blink { 50% { opacity: 0; } }

/* ---------- sources ---------- */
.dsc-sources { margin-top: 16px; }
.dsc-sources-head { display: flex; align-items: center; gap: 5px; margin-bottom: 7px; font-size: 11.9px; font-weight: 600; color: var(--dsc-muted); }
.dsc-source-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
.dsc-source {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 9px;
  border: 1px solid var(--dsc-border);
  border-radius: 10px;
  background: var(--dsc-layer);
  color: var(--dsc-text);
  text-decoration: none;
  min-width: 0;
  transition: border-color var(--dsc-fast) ease, background var(--dsc-fast) ease;
}
.dsc-source:hover { border-color: var(--dsc-border-strong); background: color-mix(in srgb, var(--dsc-layer) 60%, var(--dsc-layer2)); }
.dsc-source-index {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: var(--dsc-brand-soft);
  color: var(--dsc-link);
  font-size: 10.4px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  margin-top: 1px;
}
.dsc-source-body { display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 1px; }
.dsc-source-title {
  font-size: 12px;
  font-weight: 550;
  line-height: 1.42;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.dsc-source-meta { font-size: 10.5px; color: var(--dsc-muted); }
.dsc-source-snippet {
  font-size: 11px;
  color: var(--dsc-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.dsc-source .dsc-icon { color: var(--dsc-muted); margin-top: 2px; }

/* ---------- message actions / notices ---------- */
.dsc-msg-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; margin-top: 7px; opacity: 0; transition: opacity var(--dsc-fast) ease; }
.dsc-msg-assistant:hover .dsc-msg-actions,
.dsc-msg-assistant:focus-within .dsc-msg-actions,
.dsc-msg-actions.is-last { opacity: 1; }
.dsc-msg-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 7px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 11.7px;
}
.dsc-msg-action:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-usage { font-size: 10.8px; color: var(--dsc-muted); margin-left: 6px; }
.dsc-notice {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 8px 0;
  padding: 9px 11px;
  border: 1px solid color-mix(in srgb, var(--dsc-warn) 22%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsc-warn) 7%, transparent);
  color: var(--dsc-warn);
  font-size: 12.7px;
  line-height: 1.55;
}
.dsc-notice.is-error {
  border-color: color-mix(in srgb, var(--dsc-error) 22%, transparent);
  background: color-mix(in srgb, var(--dsc-error) 7%, transparent);
  color: var(--dsc-error);
}
.dsc-notice .dsc-icon { margin-top: 1px; }
.dsc-muted-note { margin: 6px 0; font-size: 12.4px; color: var(--dsc-muted); }
.dsc-inline-button {
  border: 0;
  background: transparent;
  color: var(--dsc-link);
  font-size: inherit;
  font-weight: 600;
  padding: 0 2px;
  text-decoration: underline;
}
.dsc-typing { display: inline-flex; align-items: center; gap: 4px; padding: 8px 0 3px; }
.dsc-typing-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--dsc-brand); opacity: 0.35; animation: dsc-dot 1.2s ease-in-out infinite; }
.dsc-typing-dot:nth-child(2) { animation-delay: 0.15s; }
.dsc-typing-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes dsc-dot { 0%, 80%, 100% { opacity: 0.25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }

/* ---------- composer ---------- */
.dsc-composer-wrap {
  flex: none;
  width: 100%;
  max-width: 836px;
  margin: 0 auto;
  padding: 6px 20px 12px;
  background: linear-gradient(to top, var(--dsc-bg) 74%, transparent);
}
.dsc-auth-banner {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 auto 8px;
  max-width: 788px;
  padding: 8px 12px;
  border: 1px solid color-mix(in srgb, var(--dsc-warn) 22%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsc-warn) 7%, var(--dsc-layer));
  color: var(--dsc-warn);
  font-size: 12.2px;
}
.dsc-auth-banner span { flex: 1; }
.dsc-composer {
  position: relative;
  max-width: 788px;
  margin: 0 auto;
  padding: 10px 12px 8px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 24px;
  background: var(--dsc-layer);
  box-shadow: var(--dsc-shadow-composer);
  transition: border-color var(--dsc-fast) ease, box-shadow var(--dsc-fast) ease;
}
.dsc-composer:focus-within {
  border-color: color-mix(in srgb, var(--dsc-brand) 45%, var(--dsc-border-strong));
  box-shadow: 0 0 0 3px var(--dsc-brand-soft), var(--dsc-shadow-soft);
}
.dsc-composer.is-drag { border-color: var(--dsc-brand); }
.dsc-textarea {
  display: block;
  width: 100%;
  min-height: 42px;
  max-height: 220px;
  padding: 5px 6px 2px;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  font-size: 14.8px;
  line-height: 1.62;
}
.dsc-textarea::placeholder { color: var(--dsc-muted); }
.dsc-composer-tools { display: flex; align-items: center; gap: 3px; margin-top: 2px; }
.dsc-file-input { display: none; }
.dsc-tool-button {
  width: 33px;
  height: 33px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--dsc-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease;
}
.dsc-tool-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-mode-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 29px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 12.3px;
  font-weight: 520;
  white-space: nowrap;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease, border-color var(--dsc-fast) ease;
}
.dsc-mode-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-mode-button.is-active {
  background: var(--dsc-brand-soft);
  border-color: color-mix(in srgb, var(--dsc-brand) 16%, transparent);
  color: var(--dsc-link);
}
.dsc-tool-spacer { flex: 1; }
.dsc-model-pill {
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 8px;
  color: var(--dsc-muted);
  font-size: 11.8px;
  font-weight: 500;
}
.dsc-send-button {
  width: 33px;
  height: 33px;
  border: 0;
  border-radius: 999px;
  background: var(--dsc-brand);
  color: var(--dsc-on-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  transition: filter var(--dsc-fast) ease, opacity var(--dsc-fast) ease;
}
.dsc-send-button:hover { filter: brightness(1.07); }
.dsc-send-button.is-idle { opacity: 0.4; }
.dsc-stop-button {
  width: 33px;
  height: 33px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 999px;
  background: var(--dsc-layer2);
  color: var(--dsc-text);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.dsc-stop-button:hover { background: var(--dsc-hover); }
.dsc-drop-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px dashed var(--dsc-brand);
  border-radius: 22px;
  background: color-mix(in srgb, var(--dsc-brand) 8%, var(--dsc-layer));
  color: var(--dsc-link);
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
}
.dsc-disclaimer { margin-top: 7px; text-align: center; font-size: 10.9px; color: var(--dsc-muted); }

/* ---------- dialogs ---------- */
.dsc-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--dsw-alias-bg-mask-1, color-mix(in srgb, #0b0f19 46%, transparent));
  backdrop-filter: blur(3px);
  animation: dsc-fade var(--ds-transition-duration-fast, 0.1s) ease;
}
@keyframes dsc-fade { from { opacity: 0; } to { opacity: 1; } }
.dsc-modal {
  width: min(620px, 100%);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dsc-border);
  border-radius: 16px;
  background: var(--dsc-layer);
  box-shadow: var(--dsc-shadow);
  overflow: hidden;
  animation: dsc-rise 0.16s ease;
}
@keyframes dsc-rise { from { opacity: 0; transform: translateY(8px) scale(0.995); } to { opacity: 1; transform: none; } }
.dsc-modal.dsc-handoff { width: min(760px, 100%); }
.dsc-modal-head { display: flex; align-items: flex-start; gap: 12px; padding: 18px 20px 14px; border-bottom: 1px solid var(--dsc-border); }
.dsc-modal-head h2 { margin: 0; font-size: 16.5px; font-weight: 620; letter-spacing: -0.01em; }
.dsc-modal-sub { margin: 4px 0 0; font-size: 11.9px; color: var(--dsc-muted); line-height: 1.55; }
.dsc-modal-head .dsc-icon-button { margin-left: auto; }
.dsc-modal-body { overflow-y: auto; padding: 16px 20px 18px; display: flex; flex-direction: column; gap: 16px; }
.dsc-modal-foot { display: flex; align-items: center; gap: 8px; padding: 12px 20px 16px; border-top: 1px solid var(--dsc-border); }
.dsc-modal-foot-note { flex: 1; min-width: 0; font-size: 11.5px; color: var(--dsc-muted); }
.dsc-settings-title { margin: 0 0 7px 2px; font-size: 11.8px; font-weight: 620; color: var(--dsc-muted); }
.dsc-settings-section { display: flex; flex-direction: column; gap: 6px; }
.dsc-settings-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--dsc-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsc-layer2) 30%, transparent);
}
.dsc-auth-status { display: flex; align-items: flex-start; gap: 9px; padding: 9px 10px; border-radius: 10px; background: var(--dsc-layer); border: 1px solid var(--dsc-border); }
.dsc-auth-status .dsc-auth-dot { margin: 5px 0 0; flex: none; }
.dsc-auth-status.is-ready .dsc-auth-dot { background: var(--dsc-success); }
.dsc-auth-status.is-missing .dsc-auth-dot { background: var(--dsc-warn); }
.dsc-auth-status-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.dsc-auth-status-body strong { font-size: 12.8px; }
.dsc-auth-status-body span { font-size: 11.6px; color: var(--dsc-muted); }
.dsc-auth-status-body .dsc-auth-sub { font-size: 11.2px; }
.dsc-field { display: flex; flex-direction: column; gap: 6px; }
.dsc-field-row { display: flex; align-items: center; gap: 8px; }
.dsc-field-tools { margin-left: auto; display: flex; align-items: center; gap: 2px; }
.dsc-field-label { font-size: 11.9px; font-weight: 620; color: var(--dsc-muted); }
.dsc-field-hint { margin: 0; font-size: 11.4px; line-height: 1.6; color: var(--dsc-muted); word-break: break-word; }
.dsc-segment { display: inline-flex; align-self: flex-start; gap: 2px; padding: 2px; border: 1px solid var(--dsc-border); border-radius: 9px; background: var(--dsc-layer2); }
.dsc-segment-button { height: 29px; padding: 0 11px; border: 0; border-radius: 7px; background: transparent; color: var(--dsc-muted); font-size: 12px; font-weight: 550; }
.dsc-segment-button.is-active { background: var(--dsc-layer); color: var(--dsc-text); box-shadow: 0 1px 3px rgba(9, 12, 20, 0.1); }
.dsc-key-row { display: flex; gap: 7px; align-items: center; }
.dsc-input {
  flex: 1;
  min-width: 0;
  height: 35px;
  padding: 0 10px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 9px;
  background: var(--dsc-bg);
  outline: 0;
  font-size: 12.9px;
  transition: border-color var(--dsc-fast) ease, box-shadow var(--dsc-fast) ease;
}
.dsc-input:focus { border-color: var(--dsc-brand); box-shadow: 0 0 0 2px var(--dsc-brand-soft); }
.dsc-select {
  height: 35px;
  padding: 0 30px 0 10px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 9px;
  background: var(--dsc-bg);
  color: var(--dsc-text);
  font-size: 12.9px;
  outline: 0;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--dsc-muted) 50%), linear-gradient(135deg, var(--dsc-muted) 50%, transparent 50%);
  background-position: calc(100% - 16px) 15px, calc(100% - 11px) 15px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}
.dsc-key-state { flex: 1; padding: 8px 10px; border-radius: 9px; background: var(--dsc-layer2); color: var(--dsc-muted); font-size: 12px; }
.dsc-switch-row { display: flex; align-items: center; gap: 12px; }
.dsc-switch-copy { display: flex; flex-direction: column; gap: 1px; flex: 1; }
.dsc-switch-copy strong { font-size: 12.8px; font-weight: 580; }
.dsc-switch-copy span { font-size: 11.4px; color: var(--dsc-muted); }
.dsc-switch {
  width: 40px;
  height: 24px;
  padding: 2px;
  border: 0;
  border-radius: 999px;
  background: var(--dsc-border-strong);
  transition: background var(--dsc-fast) ease;
  flex: none;
}
.dsc-switch.is-on { background: var(--dsc-brand); }
.dsc-switch-thumb { display: block; width: 20px; height: 20px; border-radius: 999px; background: #fff; box-shadow: 0 1px 3px rgba(9, 12, 20, 0.24); transition: transform var(--dsc-fast) ease; }
.dsc-switch.is-on .dsc-switch-thumb { transform: translateX(16px); }
.dsc-prompt { min-height: 92px; border: 1px solid var(--dsc-border-strong); border-radius: 9px; padding: 9px 10px; background: var(--dsc-bg); resize: vertical; }
.dsc-handoff-brief {
  min-height: 220px;
  max-height: 46vh;
  padding: 10px 12px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 10px;
  background: var(--dsc-bg);
  font-size: 12.7px;
  line-height: 1.7;
  resize: vertical;
}
.dsc-handoff-loading {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 220px;
  padding: 14px;
  border: 1px dashed var(--dsc-border-strong);
  border-radius: 10px;
  color: var(--dsc-muted);
  font-size: 12.7px;
}
.dsc-field-actions { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.dsc-data-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dsc-path { max-width: 68%; overflow-x: auto; padding: 5px 7px; border-radius: 6px; background: var(--dsc-layer2); font-size: 11.2px; white-space: nowrap; font-family: var(--dsc-mono); }
.dsc-about-row { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: var(--dsc-muted); }
.dsc-about-row strong { color: var(--dsc-text); font-weight: 580; }
.dsc-confirm { width: min(430px, 100%); padding: 20px; border: 1px solid var(--dsc-border); border-radius: 16px; background: var(--dsc-layer); box-shadow: var(--dsc-shadow); animation: dsc-rise 0.16s ease; }
.dsc-confirm h2 { margin: 0 0 7px; font-size: 15.5px; font-weight: 620; }
.dsc-confirm p { margin: 0; font-size: 12.9px; line-height: 1.62; color: var(--dsc-muted); }
.dsc-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }

/* ---------- popup menu ---------- */
.dsc-menu-backdrop { position: fixed; inset: 0; z-index: 26; background: transparent; }
.dsc-menu {
  position: fixed;
  z-index: 27;
  min-width: 198px;
  padding: 5px;
  border: 1px solid var(--dsc-border);
  border-radius: 11px;
  background: var(--dsc-layer);
  box-shadow: var(--dsc-shadow);
  animation: dsc-rise 0.12s ease;
}
.dsc-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 32px;
  padding: 0 9px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-text);
  font-size: 12.8px;
  text-align: left;
}
.dsc-menu-item:hover { background: var(--dsc-hover); }
.dsc-menu-item .dsc-icon { color: var(--dsc-muted); }
.dsc-menu-item.is-danger { color: var(--dsc-error); }
.dsc-menu-item.is-danger .dsc-icon { color: var(--dsc-error); }
.dsc-menu-separator { height: 1px; margin: 4px 6px; background: var(--dsc-border); }

/* ---------- folder pickers / archive manager ---------- */
.dsc-folder-name { margin-top: 12px; }
.dsc-dialog-list { display: flex; flex-direction: column; gap: 2px; max-height: 48vh; overflow-y: auto; }
.dsc-choice {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 38px;
  padding: 6px 9px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--dsc-text);
  text-align: left;
  font-size: 12.9px;
}
.dsc-choice:hover { background: var(--dsc-hover); }
.dsc-choice.is-selected { border-color: color-mix(in srgb, var(--dsc-brand) 20%, transparent); background: var(--dsc-brand-soft); }
.dsc-choice-icon { display: inline-flex; flex: none; color: var(--dsc-muted); }
.dsc-choice-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsc-choice-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex: none;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 5px;
  color: var(--dsc-link);
}
.dsc-choice.is-selected .dsc-choice-check { border-color: var(--dsc-brand); background: var(--dsc-brand-soft); }
.dsc-choice-hint { display: inline-flex; flex: none; color: var(--dsc-muted); }
.dsc-secondary-button.is-small-compact { height: 29px; padding: 0 10px; font-size: 12px; }
.dsc-archive-list { display: flex; flex-direction: column; gap: 2px; }
.dsc-archive-item { display: flex; align-items: center; gap: 10px; padding: 8px 6px; border-bottom: 1px solid var(--dsc-border); }
.dsc-archive-item:last-child { border-bottom: 0; }
.dsc-archive-item-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.dsc-archive-item-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 550; }
.dsc-archive-item-meta { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11.2px; color: var(--dsc-muted); }
.dsc-archive-actions { display: flex; align-items: center; gap: 4px; flex: none; }

/* ---------- toasts ---------- */
.dsc-toasts { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 40; display: flex; flex-direction: column; gap: 7px; align-items: center; pointer-events: none; width: min(560px, calc(100% - 32px)); }
.dsc-toast { display: flex; align-items: center; gap: 7px; max-width: 100%; padding: 9px 13px; border: 1px solid var(--dsc-border); border-radius: 10px; background: var(--dsc-layer); box-shadow: var(--dsc-shadow-soft); font-size: 12.5px; color: var(--dsc-text); animation: dsc-toast-in 0.16s ease; }
.dsc-toast .dsc-icon { color: var(--dsc-success); flex: none; }
.dsc-toast.is-warning .dsc-icon, .dsc-toast.is-warning { color: var(--dsc-warn); }
.dsc-toast.is-error .dsc-icon, .dsc-toast.is-error { color: var(--dsc-error); }
@keyframes dsc-toast-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* ---------- boot ---------- */
.dsc-boot { flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 24px; }
.dsc-boot-text { font-size: 12.9px; color: var(--dsc-muted); }
.dsc-boot-card { width: min(430px, 100%); padding: 22px; border: 1px solid var(--dsc-border); border-radius: 16px; background: var(--dsc-layer); text-align: center; box-shadow: var(--dsc-shadow-soft); }
.dsc-boot-icon { display: inline-flex; color: var(--dsc-warn); }
.dsc-boot-card h2 { margin: 8px 0 5px; font-size: 16px; }
.dsc-boot-card p { margin: 0 0 14px; font-size: 12.5px; color: var(--dsc-muted); line-height: 1.6; word-break: break-word; }

/* ---------- responsive ---------- */
/* The drawer breakpoint matches the Harness frame's own drawer breakpoint
   (768px), so a narrow window puts both modes in the same posture. */
@media (max-width: 900px) {
  .dsc-header { padding: 0 10px 0 12px; }
  .dsc-thread { padding: 20px 14px 8px; }
  .dsc-composer-wrap { padding: 6px 12px 10px; }
  .dsc-msg-user { padding-left: 6%; }
  .dsc-msg-assistant { padding-right: 0; }
  .dsc-handoff-label { display: none; }
  .dsc-handoff-button { padding: 0 9px; }
}
@media (max-width: 768px) {
  /* Touch has no hover: keep the row menu and message actions reachable, and
     drop the timestamp that the menu button would otherwise cover. */
  .dsc-chat-item-time { display: none; }
  .dsc-chat-item-more,
  .dsc-folder-head .dsc-chat-item-more { display: inline-flex; }
  .dsc-msg-actions,
  .dsc-user-actions { opacity: 1; }
  /* Narrow windows keep the native drawer posture: the Chat sidebar overlays
     the content instead of taking a column, and the resize handle is moot. */
  .dsc-sidebar-column {
    position: fixed;
    inset: var(--dsc-top, 0px) auto 0 0;
    z-index: 12;
    display: flex;
    width: min(300px, 86vw);
    min-width: 0;
    max-width: none;
    box-shadow: var(--dsc-shadow);
    transform: translateX(-101%);
    transition: transform var(--ds-transition-duration-slow, 0.3s) var(--dsc-ease);
  }
  .dsc-sidebar-column.is-open { transform: translateX(0); }
  .dsc-sidebar-column:not(.is-open) { display: flex; }
  .dsc-sidebar { border-right: 0; }
  .dsc-sidebar-resizer { display: none; }
  .dsc-sidebar-backdrop {
    position: fixed;
    inset: var(--dsc-top, 0px) 0 0;
    z-index: 11;
    border: 0;
    padding: 0;
    background: var(--dsw-alias-bg-mask-1, color-mix(in srgb, #0b0f19 38%, transparent));
    backdrop-filter: blur(1px);
  }
}
@media (min-width: 769px) {
  .dsc-sidebar-backdrop { display: none; }
}
@media (max-width: 760px) {
  /* Narrow content column: shrink the whole control, keep both labels. */
  .dsc-modeswitch { --dsc-nav-width: 208px; --dsc-nav-height: 36px; font-size: 12.6px; }
  .dsc-modeswitch-item { font-size: 12.6px; }
  .dsc-source-list { grid-template-columns: 1fr; }
  .dsc-greeting { font-size: clamp(23px, 5.6vw, 28px); }
  .dsc-empty { padding-bottom: 3vh; }
}
@media (max-width: 620px) {
  .dsc-mode-label { display: none; }
  .dsc-mode-button { width: 30px; padding: 0; justify-content: center; }
  .dsc-model-pill { display: none; }
  .dsc-header-title { display: none; }
  .dsc-thread { padding: 16px 12px 8px; }
  .dsc-composer-wrap { padding: 4px 10px 8px; }
  .dsc-user-bubble { font-size: 14.2px; }
  .dsc-user-edit-hint { display: none; }
  .dsc-user-bubble.is-editing { width: 100%; }
  /* Icon-only message actions leave room for copy, regenerate, continue and the
     version switcher on a phone-width content column. */
  .dsc-msg-action { width: 27px; padding: 0; justify-content: center; }
  .dsc-msg-action span { display: none; }
  .dsc-md { font-size: 14.4px; }
  .dsc-modal-backdrop { padding: 10px; }
  .dsc-modal { max-height: 94vh; border-radius: 14px; }
  .dsc-modal-body { padding: 14px 14px 16px; }
  .dsc-modal-head { padding: 14px 14px 12px; }
  .dsc-modal-foot { padding: 10px 14px 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .dsc-root *, .dsc-root *::before, .dsc-root *::after,
  .dsc-modeswitch, .dsc-modeswitch * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`

function injectChatStyles() {
  const style = document.createElement('style')
  style.setAttribute('data-dsh-chat-mode', 'styles')
  style.textContent = CHAT_CSS
  document.head.appendChild(style)
  return () => style.remove()
}
