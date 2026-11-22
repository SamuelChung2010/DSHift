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
  --dsc-shadow-composer: var(--dsw-elevation-soft, 0 4px 18px rgba(9, 12, 20, 0.06));
  --dsc-shadow-popover: var(--dsw-elevation-prominent, 0 16px 40px rgba(9, 12, 20, 0.18));
  --dsc-control-h: 28px;
  /* Native composer / menu aliases. They resolve the exact Harness surface,
     selector and interactive tokens, with the Chat palette as a fallback for
     older Hosts that do not publish them. */
  --dsc-input-major: var(--dsw-specific-input-major, var(--dsc-layer));
  --dsc-menu-surface: var(--dsw-specific-menu, var(--dsc-layer));
  --dsc-menu-backdrop: var(--dsw-menu-backdrop-filter, blur(22px) saturate(1.35));
  --dsc-selector: var(--dsw-specific-selector, color-mix(in srgb, var(--dsc-text) 7%, transparent));
  --dsc-interactive: var(--dsw-alias-interactive-bg-hover, var(--dsc-hover));
  --dsc-interactive-solid: var(--dsw-alias-interactive-bg-hover-solid, var(--dsc-interactive));
  --dsc-tertiary: var(--dsw-alias-label-tertiary, var(--dsc-muted));
  --dsc-caption: var(--dsw-alias-label-caption, var(--dsc-muted));
  --dsc-menu-icon: var(--dsw-alias-menu-icon, var(--dsc-muted));
  --dsc-business: var(--dsw-alias-state-business-primary, var(--dsc-link));
  --dsc-primary-action: var(--dsw-alias-button-info-fill, var(--dsc-link));
  --dsc-primary-action-hover: var(--dsw-alias-button-info-hover, var(--dsc-link));
  --dsc-on-color: var(--dsw-alias-label-on-color, #ffffff);
  --dsc-radius-panel: var(--dsw-radius-panel, 28px);
  --dsc-radius-menu: var(--dsw-radius-lg, 16px);
  --dsc-radius-control: var(--dsw-radius-sm, 8px);
  --dsc-radius-row: var(--dsw-radius-md, 12px);
  --dsc-radius: var(--dsw-radius-md, 12px);
  --dsc-font: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif);
  --dsc-mono: var(--ds-font-family-code, 'SF Mono', Consolas, 'Liberation Mono', monospace);
  --dsc-ease: var(--ds-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
  --dsc-fast: var(--ds-transition-duration-fast, 0.1s);
  /* Syntax colours: one light palette, overridden below for the dark theme.
     They are the only fixed colours in this stylesheet; everything else is
     derived from the Harness theme tokens. */
  --dsc-hl-kw: #8b3fd6;
  --dsc-hl-str: #0f766e;
  --dsc-hl-num: #b45309;
  --dsc-hl-com: #7b8494;
  --dsc-hl-fn: #1d4ed8;
  --dsc-hl-type: #a21caf;
  --dsc-hl-op: #52606d;
  --dsc-hl-attr: #b91c1c;
  --dsc-hl-tag: #0e7490;
  --dsc-hl-var: #9333ea;
  --dsc-hl-meta: #64748b;
  --dsc-math-bg: color-mix(in srgb, var(--dsc-text) 3%, transparent);
  --dsc-mermaid-line: color-mix(in srgb, var(--dsc-text) 38%, transparent);
  --dsc-mermaid-fill: color-mix(in srgb, var(--dsc-link) 8%, var(--dsc-layer));
  --dsc-mermaid-c1: #4f7cff;
  --dsc-mermaid-c2: #19a97b;
  --dsc-mermaid-c3: #f0a02e;
  --dsc-mermaid-c4: #e0567a;
  --dsc-mermaid-c5: #8b5cf6;
  --dsc-mermaid-c6: #0ea5b7;
  --dsc-mermaid-c7: #c2410c;
  --dsc-mermaid-c8: #64748b;
}
/* Dark syntax palette: same hues, lifted for a dark surface. */
body[data-ds-dark-theme] .dsc-root {
  --dsc-hl-kw: #c0a2ff;
  --dsc-hl-str: #6ee7b7;
  --dsc-hl-num: #fbbf24;
  --dsc-hl-com: #8b95a5;
  --dsc-hl-fn: #93c5fd;
  --dsc-hl-type: #f0abfc;
  --dsc-hl-op: #cbd5e1;
  --dsc-hl-attr: #fca5a5;
  --dsc-hl-tag: #67e8f9;
  --dsc-hl-var: #d8b4fe;
  --dsc-hl-meta: #94a3b8;
  --dsc-mermaid-c1: #7da2ff;
  --dsc-mermaid-c2: #4ade9e;
  --dsc-mermaid-c3: #fbbf60;
  --dsc-mermaid-c4: #f38ba8;
  --dsc-mermaid-c5: #b39cff;
  --dsc-mermaid-c6: #4dd4e6;
  --dsc-mermaid-c7: #fb923c;
  --dsc-mermaid-c8: #94a3b8;
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
  /* The Chat surface sits below the shared switch (z 40). Dialogs do not use
     this stack at all: they are native modal <dialog> elements in the browser
     top layer, which is why their mask can cover the switch. */
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
/* macOS: the frame's 48px top strip is native chrome — the traffic lights, the
   native sidebar's tinted header band, and the Agent conversation header. Chat
   is a full-window takeover, so it owns that strip too instead of starting
   below it and leaving a piece of the Agent sidebar visible above its own
   column. The surface starts at the window top; the same strip comes back as
   padding on the two columns, so every Chat row keeps its native line while
   the sidebar material and its wash run from y=0 exactly like the native
   column. The covered native chrome still owns the window-drag rectangles
   (Electron unions them regardless of paint order), so dragging by the strip
   keeps working; only Chat's own controls that share a row with a native drag
   row have to opt out, which the sidebar brand row does below. Windows keeps
   its native caption row untouched. */
html[data-platform='darwin'] .dsc-root { top: 0; }
html[data-platform='darwin'] .dsc-sidebar-inner { padding-top: calc(var(--dsc-top, 44px) + 6px); }
html[data-platform='darwin'] .dsc-main { padding-top: var(--dsc-top, 44px); }
.dsc-root :where(button, input, textarea, select) { font: inherit; color: inherit; }
.dsc-root button { cursor: pointer; }
.dsc-root button:disabled { cursor: default; }
.dsc-root ::selection { background: var(--dsc-brand-soft-strong); }
/* Keyboard focus is a thin brand ring on real controls. Text fields never take
   the browser's own outline: their surface (a composer or an input) draws a
   single quiet focus state instead, so the native ring and a component border
   can never stack into a double white frame. */
.dsc-root :where(button, a, [role='button'], [role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox'], [role='switch']):focus-visible {
  outline: 2px solid var(--dsc-brand);
  outline-offset: 2px;
}
.dsc-root :where(input, textarea, select):focus,
.dsc-root :where(input, textarea, select):focus-visible {
  outline: 0;
}
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

   Placement: the middle of the native Session header's toolbar line, refined
   at runtime from the header's published corner anchor and the active main
   column's measured box. The CSS defaults below only cover the first paint
   before that measurement; neither platform token is required. */
.dsc-modeswitch {
  --dsc-nav-height: 40px;
  --dsc-nav-width: 244px;
  --dsc-nav-selected: 55%;
  position: fixed;
  top: calc(var(--dsh-frame-chrome-top, 0px) + 25px);
  left: 0;
  right: 0;
  width: var(--dsc-nav-width);
  height: var(--dsc-nav-height);
  margin-inline: auto;
  transform: translateY(-50%);
  /* Above the Chat surface (z 30): the switch belongs to both modes and must
     stay clickable while the Chat layer covers the native header behind it. */
  z-index: 40;
  border-radius: 999px;
  /* The track is a true capsule, not the theme's default superellipse. */
  corner-shape: round;
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
  corner-shape: round;
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
/* Windows: the native Windows frame drops the sidebar's right border too
   (AppFrame.module.css "[data-windows-titlebar] .sidebarCol": border-right:
   none): the rounded Chat main panel's own edge and the fill difference mark
   the boundary, while a hairline would run straight past the corner notch that
   panel leaves open at the top. */
html[data-windows-titlebar] .dsc-sidebar { border-right: 0; }
/* macOS: the native sidebar is fully covered by the Chat surface, so its
   top-strip toggle (or the leading-seat opener when it is collapsed) would be a
   second panel control for a different, invisible sidebar. The Chat brand-row
   button owns the visible column; the native control returns with Agent. The
   Windows caption controls are deliberately untouched. */
html[data-platform='darwin']:has(.dsc-root) [data-sidebar-toggle],
html[data-platform='darwin']:has(.dsc-root) [data-sidebar-opener] {
  display: none !important;
}
/* macOS vibrancy sidebar: reuse the frame's own tint and washes. The frame
   composites them over window vibrancy; Chat composites the same layers over
   its opaque surface, which reads as the same material without disturbing the
   native chrome or putting the hidden Agent content behind the glass. The
   separator moves to the opaque column as a hairline, matching AppFrame. */
html[data-platform='darwin'] .dsc-sidebar {
  border-right: 0;
  background-color: var(--dsc-bg);
  background-image:
    linear-gradient(to bottom, var(--dsw-specific-sidebar-wash-top, transparent), var(--dsw-specific-sidebar-wash-top-clear, transparent) 35%, var(--dsw-specific-sidebar-wash-bottom-clear, transparent) 68%, var(--dsw-specific-sidebar-wash-bottom, transparent)),
    linear-gradient(var(--dsw-specific-sidebar-tint, transparent), var(--dsw-specific-sidebar-tint, transparent));
}
html[data-platform='darwin'] .dsc-root:has(.dsc-sidebar-column.is-open) .dsc-main {
  border-left: 0.5px solid var(--dsw-alias-border-l3, var(--dsc-border));
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
/* macOS: the native sidebar's logo row is a window-drag row and sits exactly
   under Chat's brand row. App-region rectangles outrank paint order, so the
   covered Agent row would swallow the collapse control. Opt the Chat row and
   its button out; the strip's window drag still comes from the native rows. */
html[data-platform='darwin'] .dsc-sidebar-brand,
html[data-platform='darwin'] .dsc-sidebar-brand button { -webkit-app-region: no-drag; }
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
.dsc-chat-item.is-renaming:focus-within { border-color: color-mix(in srgb, var(--dsc-brand) 42%, var(--dsc-border-strong)); }
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
/* Windows: the native AppFrame keeps its caption row outside every panel and
   rounds the centre column's top-left corner by --dsh-windows-content-radius
   (AppFrame.module.css "[data-windows-titlebar] .centerCol"), clipping that
   column's content through its own overflow: hidden; the frame paints the
   sidebar fill behind the cutout. Chat is a full-window layer below the same
   caption row, so the Chat main column carries that corner: the native radius
   on the same box, the same clip, and the sidebar fill on the root behind it. */
html[data-windows-titlebar] .dsc-root { background: var(--dsc-sidebar); }
html[data-windows-titlebar] .dsc-main {
  border-top-left-radius: var(--dsh-windows-content-radius, 16px);
  corner-shape: round;
  overflow: hidden;
}
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
  justify-content: center;
  gap: 7px;
  /* Same 40px capsule as the shared Chat | Agent switch. */
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsc-layer);
  color: var(--dsc-text);
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.005em;
  white-space: nowrap;
  flex: none;
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
  background: var(--dsc-primary-action);
  color: var(--dsc-on-color);
  font-size: 12.9px;
  font-weight: 600;
  white-space: nowrap;
  transition: filter var(--dsc-fast) ease;
}
.dsc-primary-button:hover:not(:disabled) { filter: brightness(1.06); }
.dsc-primary-button:disabled {
  background: var(--dsc-layer2);
  color: var(--dsc-muted);
  opacity: 0.8;
}
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
.dsc-secondary-button:hover:not(:disabled) { background: var(--dsc-hover); }
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
.dsc-attach-rail { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 14px 2px; }

/* ---------- reasoning / process ----------
   Reasoning is a quiet, secondary layer: muted text, a thin rail, and a
   collapsed body. The answer below it stays the loudest thing in the message. */
.dsc-process { margin: 0 0 9px; }
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
.dsc-process-body { padding: 4px 0 2px 14px; border-left: 1px solid var(--dsc-border); margin-left: 2px; }
.dsc-think-block {
  margin: 2px 0 10px;
  padding: 2px 0 2px 12px;
  border-left: 2px solid var(--dsc-border-strong);
  color: var(--dsc-muted);
  font-size: 13.2px;
  line-height: 1.72;
  max-height: 320px;
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
.dsc-image {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 12px 0;
  border: 1px solid var(--dsc-border);
  border-radius: 10px;
  background: var(--dsc-layer2);
}
.dsc-inline-code {
  padding: 1.5px 5px;
  border-radius: 5px;
  background: var(--dsc-code-bg);
  font-family: var(--dsc-mono);
  font-size: 0.875em;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
.dsc-code {
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
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
.dsc-pre { box-sizing: border-box; max-width: 100%; margin: 0; padding: 13px 14px; max-height: 520px; overflow: auto; font-size: 12.7px; line-height: 1.66; }
.dsc-pre code { font-family: var(--dsc-mono); white-space: pre; }
.dsc-code-body { display: block; }
.dsc-tok-kw { color: var(--dsc-hl-kw); font-weight: 550; }
.dsc-tok-str { color: var(--dsc-hl-str); }
.dsc-tok-num { color: var(--dsc-hl-num); }
.dsc-tok-com { color: var(--dsc-hl-com); font-style: italic; }
.dsc-tok-fn { color: var(--dsc-hl-fn); }
.dsc-tok-type { color: var(--dsc-hl-type); }
.dsc-tok-op { color: var(--dsc-hl-op); }
.dsc-tok-attr { color: var(--dsc-hl-attr); }
.dsc-tok-tag { color: var(--dsc-hl-tag); }
.dsc-tok-var { color: var(--dsc-hl-var); }
.dsc-tok-meta { color: var(--dsc-hl-meta); }
.dsc-answer { margin-top: 2px; }
.dsc-answer .dsc-md { font-size: 15.1px; }
.dsc-diagram { margin: 13px 0; }
.dsc-diagram-note { display: block; margin-top: 4px; font-size: 11px; color: var(--dsc-muted); }
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

/* ---------- sources ----------
   Collapsed by default: one compact line instead of a wall of cards. The
   expanded list is a single numbered column with its own scroll area. */
.dsc-sources { margin-top: 14px; }
.dsc-sources-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 8px;
  margin-left: -2px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 11.9px;
  font-weight: 600;
}
.dsc-sources-toggle:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-sources-count { white-space: nowrap; }
.dsc-source-list {
  list-style: none;
  margin: 6px 0 0;
  padding: 4px;
  max-height: 264px;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--dsc-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsc-layer) 70%, var(--dsc-bg));
}
.dsc-source {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  padding: 7px 8px;
  border-radius: 8px;
  transition: background var(--dsc-fast) ease;
}
.dsc-source:hover { background: var(--dsc-hover); }
.dsc-source.is-target { background: var(--dsc-brand-soft); }
.dsc-source-index {
  width: 17px;
  height: 17px;
  border-radius: 5px;
  background: var(--dsc-brand-soft);
  color: var(--dsc-link);
  font-size: 10.2px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  margin-top: 1px;
}
.dsc-source-link {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
  color: var(--dsc-text);
  text-decoration: none;
}
.dsc-source-title {
  font-size: 12.4px;
  font-weight: 550;
  line-height: 1.42;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsc-source:hover .dsc-source-title { color: var(--dsc-link); }
.dsc-source-meta {
  font-size: 10.6px;
  color: var(--dsc-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsc-source-snippet {
  margin-top: 1px;
  font-size: 11.2px;
  color: var(--dsc-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.dsc-source .dsc-icon { color: var(--dsc-muted); margin-top: 3px; flex: none; }
/* In-text citation marker: small, monochrome, never competes with prose. */
.dsc-cite {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 15px;
  height: 15px;
  margin: 0 1px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--dsc-brand-soft);
  color: var(--dsc-link);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  vertical-align: 0.32em;
}
.dsc-cite:hover { background: var(--dsc-brand-soft-strong); }

/* ---------- math ----------
   A compact TeX renderer (32-math.js) emits typed spans; the Harness page
   already loads the KaTeX font faces, so math text picks them up when present
   and falls back to a serif face otherwise. */
.dsc-math {
  font-family: 'KaTeX_Main', 'Cambria Math', 'Times New Roman', serif;
  font-size: 1.03em;
  line-height: 1.4;
  color: var(--dsc-text);
}
.dsc-math-inline { display: inline; max-width: 100%; white-space: nowrap; }
.dsc-math-block {
  display: block;
  box-sizing: border-box;
  max-width: 100%;
  min-height: 2.8em;
  margin: 12px 0;
  padding: 10px 12px;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 8px;
  background: var(--dsc-math-bg);
  text-align: center;
}
/* Incomplete streamed display math is shown as source, but reserves the same
   block box so the completed formula does not make the transcript jump. */
.dsc-math-streaming {
  min-height: 3.6em;
  text-align: left;
}
.dsc-math-row { display: inline-flex; align-items: baseline; flex-wrap: wrap; column-gap: 0.12em; row-gap: 0.42em; }
.dsc-math-block .dsc-math-row { justify-content: center; }
/* Tall constructs centre on the math axis instead of hanging from their
   numerator/radical baseline. */
.dsc-math-frac,
.dsc-math-sqrt,
.dsc-math-matrix { align-self: center; }
.dsc-math-var { font-style: italic; font-family: 'KaTeX_Math', 'Cambria Math', 'Times New Roman', serif; }
.dsc-math-num,
.dsc-math-op,
.dsc-math-text { font-style: normal; }
.dsc-math-op { padding: 0 0.14em; }
.dsc-math-text { white-space: pre; }
.dsc-math-big { font-size: 1.45em; line-height: 1; vertical-align: -0.12em; padding: 0 0.05em; }
.dsc-math-delim { font-style: normal; font-family: 'KaTeX_Size1', 'KaTeX_Main', 'Cambria Math', serif; }
.dsc-math-frac {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  margin: 0 0.18em;
  font-size: 0.95em;
  line-height: 1.18;
}
.dsc-math-frac-num { padding: 0 0.22em 2px; border-bottom: 1px solid currentColor; }
.dsc-math-frac-den { padding: 2px 0.22em 0; }
.dsc-math-sqrt { display: inline-flex; align-items: flex-start; vertical-align: middle; margin: 0 0.08em; }
.dsc-math-sqrt::before { content: '√'; font-size: 1.18em; line-height: 1; }
.dsc-math-sqrt-body { padding: 0 0.16em 0 0.06em; border-top: 1px solid currentColor; margin-top: 0.14em; }
.dsc-math-sqrt-index { font-size: 0.6em; line-height: 1; margin-right: -0.28em; margin-top: -0.1em; align-self: flex-start; }
/* A lone script rises or sinks from the wrapper; stacked scripts are laid out
   by the renderer with inline flex styles. */
.dsc-math-script { display: inline-flex; flex-direction: column; align-items: flex-start; vertical-align: middle; font-size: 0.72em; line-height: 1.08; }
.dsc-math-script:has(> .dsc-math-sup:only-child) { vertical-align: 0.42em; }
.dsc-math-script:has(> .dsc-math-sub:only-child) { vertical-align: -0.18em; }
.dsc-math-sup,
.dsc-math-sub { line-height: 1.05; }
.dsc-math-sup { align-self: flex-start; }
.dsc-math-sub { align-self: flex-start; }
.dsc-math-matrix {
  display: inline-grid;
  grid-auto-flow: row;
  grid-auto-columns: auto;
  justify-items: center;
  align-items: baseline;
  column-gap: 0.9em;
  row-gap: 0.22em;
  vertical-align: middle;
  padding: 0 0.28em;
}
/* bmatrix square brackets: a border box stretches to the whole matrix height,
   which one glyph at a fixed font-size cannot do for multi-row matrices. */
.dsc-math-matrix-frame { vertical-align: middle; }
.dsc-math-matrix-bracket {
  display: block;
  align-self: stretch;
  flex: none;
  width: 0.34em;
  min-height: 1.5em;
  border: 1.3px solid currentColor;
}
.dsc-math-matrix-bracket-glyph {
  display: block;
  font-size: 0;
  line-height: 0;
}
.dsc-math-matrix-bracket-left {
  border-right: 0;
  border-radius: 2px 0 0 2px;
  margin-right: 0.14em;
}
.dsc-math-matrix-bracket-right {
  border-left: 0;
  border-radius: 0 2px 2px 0;
  margin-left: 0.14em;
}
.dsc-math-matrix-row { display: contents; }
.dsc-math-matrix-cell { text-align: center; padding: 0 0.08em; }
.dsc-math-space { flex: none; }
.dsc-math-error {
  font-family: var(--dsc-mono);
  font-size: 0.9em;
  color: var(--dsc-warn);
  white-space: pre-wrap;
  word-break: break-word;
}
/* Unsupported TeX stays readable as source instead of vanishing or showing a
   half-rendered equation. The quiet background marks it as unprocessed. */
.dsc-math-fallback {
  display: inline-block;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0.08em 0.38em;
  border-radius: 5px;
  background: color-mix(in srgb, var(--dsc-text) 5%, transparent);
  font-family: var(--dsc-mono);
  font-size: 0.86em;
  font-style: normal;
  line-height: 1.55;
  text-align: left;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* ---------- Mermaid diagrams ----------
   The diagram is a self-contained React SVG (no HTML injection). Colours come
   from theme variables so light and dark share one drawing. */
.dsc-mermaid {
  margin: 14px 0;
  padding: 10px;
  border: 1px solid var(--dsc-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsc-layer) 82%, var(--dsc-bg));
}
.dsc-mermaid-figure { overflow-x: auto; overflow-y: hidden; }
.dsc-mermaid-svg { display: block; width: 100%; height: auto; max-height: 560px; color: var(--dsc-text); }
.dsc-mermaid-caption,
.dsc-mermaid-title {
  margin: 6px 2px 0;
  font-size: 11.4px;
  color: var(--dsc-muted);
  text-align: center;
}
.dsc-mermaid-node {
  fill: var(--dsc-mermaid-fill);
  stroke: var(--dsc-mermaid-line);
  stroke-width: 1.2;
}
.dsc-mermaid-node-label { fill: var(--dsc-text); font-size: 13px; font-family: var(--dsc-font); }
.dsc-mermaid-edge { fill: none; stroke: var(--dsc-mermaid-line); stroke-width: 1.4; }
.dsc-mermaid-edge-label { fill: var(--dsc-muted); font-size: 11.5px; font-family: var(--dsc-font); }
.dsc-mermaid-edge-dashed { stroke-dasharray: 5 4; }
.dsc-mermaid-edge-thick { stroke-width: 2.4; }
.dsc-mermaid-edge-cross { stroke: var(--dsc-error); }
.dsc-mermaid-edge-arrow { fill: var(--dsc-mermaid-line); stroke: none; }
.dsc-mermaid-edge-hollow { fill: var(--dsc-layer); stroke: var(--dsc-mermaid-line); stroke-width: 1.2; }
.dsc-mermaid-edge-diamond { fill: var(--dsc-mermaid-line); stroke: none; }
.dsc-mermaid-cluster {
  fill: color-mix(in srgb, var(--dsc-text) 2.5%, transparent);
  stroke: var(--dsc-border-strong);
  stroke-dasharray: 4 4;
  rx: 12;
}
.dsc-mermaid-cluster-label { fill: var(--dsc-muted); font-size: 11.5px; font-weight: 600; font-family: var(--dsc-font); }
.dsc-mermaid-lifeline { stroke: var(--dsc-border-strong); stroke-dasharray: 3 4; }
.dsc-mermaid-frame { fill: none; stroke: var(--dsc-border-strong); }
.dsc-mermaid-frame-label { fill: var(--dsc-muted); font-size: 10.6px; font-weight: 650; letter-spacing: 0.04em; font-family: var(--dsc-font); }
.dsc-mermaid-note {
  fill: color-mix(in srgb, var(--dsc-warn) 9%, var(--dsc-layer));
  stroke: color-mix(in srgb, var(--dsc-warn) 32%, transparent);
}
.dsc-mermaid-note-label { fill: var(--dsc-text); font-size: 11.5px; font-family: var(--dsc-font); }
.dsc-mermaid-slice { fill: var(--dsc-slice, var(--dsc-mermaid-c1)); stroke: var(--dsc-layer); stroke-width: 1; }
.dsc-mermaid-legend-swatch { fill: var(--dsc-slice, var(--dsc-mermaid-c1)); }
.dsc-mermaid-legend-label { fill: var(--dsc-muted); font-size: 11px; font-family: var(--dsc-font); }
.dsc-mermaid-class-title { fill: var(--dsc-text); font-size: 12.5px; font-weight: 600; font-family: var(--dsc-font); }
.dsc-mermaid-class-member { fill: var(--dsc-muted); font-size: 11.2px; font-family: var(--dsc-mono); }
.dsc-mermaid-caption { text-align: center; }
/* Error fallback keeps the source: a failed diagram is still readable text. */
.dsc-mermaid-failed { border-color: color-mix(in srgb, var(--dsc-warn) 26%, var(--dsc-border)); }
.dsc-mermaid-error { margin: 0 0 8px; padding: 7px 9px; border-radius: 8px; background: color-mix(in srgb, var(--dsc-warn) 8%, transparent); color: var(--dsc-warn); }
.dsc-mermaid-error-line { font-size: 12px; font-weight: 600; }
.dsc-mermaid-error-text { margin-top: 2px; font-size: 11.4px; line-height: 1.5; opacity: 0.85; }
.dsc-mermaid-source { margin: 0; max-height: 260px; overflow: auto; padding: 9px 10px; border-radius: 8px; background: var(--dsc-code-bg); }
.dsc-mermaid-source code { font-family: var(--dsc-mono); font-size: 11.8px; white-space: pre; }

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
.dsc-msg-model { font-size: 10.8px; color: var(--dsc-muted); margin-left: 6px; white-space: nowrap; }
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
/* One native surface owns the border, the fill and the elevation. The editor
   inside is a bare transparent field: no second rectangle, no focus glow. The
   focus state is intentionally quiet — Harness does not paint a ring around
   the composer, so neither does Chat. */
.dsc-composer {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 788px;
  margin: 0 auto;
  padding: 8px 0 0;
  border: 1px solid var(--dsc-border-strong);
  border-radius: var(--dsc-radius-panel);
  background: var(--dsc-input-major);
  box-shadow: var(--dsc-shadow-composer);
  transition: border-color var(--dsc-fast) ease;
}
.dsc-composer.is-drag { border-color: var(--dsc-business); }
.dsc-composer.has-warning { border-color: color-mix(in srgb, var(--dsc-warn) 42%, var(--dsc-border-strong)); }
.dsc-composer-main { display: flex; flex-direction: column; min-width: 0; }
.dsc-editor { position: relative; display: flex; min-width: 0; }
.dsc-editor-field {
  display: block;
  width: 100%;
  min-height: 36px;
  max-height: 220px;
  margin: 0;
  padding: 4px 8px 0 14px;
  border: 0 !important;
  border-radius: 0;
  outline: 0 !important;
  box-shadow: none !important;
  appearance: none;
  -webkit-appearance: none;
  resize: none;
  overflow-y: hidden;
  background: transparent;
  color: var(--dsc-text);
  caret-color: var(--dsc-business);
  font-family: inherit;
  font-size: var(--dsh-content-font-size, 15px);
  line-height: calc(24px + var(--dsh-content-font-delta, 0px));
}
.dsc-editor-field::placeholder { color: var(--dsc-caption); }
.dsc-editor-field:focus,
.dsc-editor-field:focus-visible {
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
}
.dsc-composer-warning {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 2px 14px 4px;
  color: var(--dsc-warn);
  font-size: 11.8px;
  line-height: 1.45;
}
.dsc-composer-warning .dsc-inline-button { color: var(--dsc-warn); }
.dsc-composer-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 8px;
  min-height: 42px;
  padding: 2px 8px 6px;
}
.dsc-composer-left { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1 1 auto; flex-wrap: wrap; }
.dsc-composer-right { display: flex; align-items: center; gap: 8px; flex: none; margin-left: auto; }
/* Direct on/off controls for web search and deep thinking. They sit in the
   native 28px chip row: only the tint changes when on, so toggling never
   resizes the editor or moves the model seat. */
.dsc-tool-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: var(--dsc-control-h);
  padding: 0 8px;
  border: 0;
  border-radius: var(--dsc-radius-control);
  background: transparent;
  color: var(--dsc-muted);
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  white-space: nowrap;
  flex: none;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease;
}
.dsc-tool-toggle:hover:not(:disabled) { background: var(--dsc-interactive); color: var(--dsc-text); }
.dsc-tool-toggle.is-on {
  background: color-mix(in srgb, var(--dsc-business) 12%, transparent);
  color: var(--dsc-business);
}
.dsc-tool-toggle.is-on:hover:not(:disabled) { background: color-mix(in srgb, var(--dsc-business) 18%, transparent); }
.dsc-tool-toggle:disabled { opacity: 0.42; cursor: default; }
.dsc-tool-toggle-label { overflow: hidden; text-overflow: ellipsis; }
/* The model seat is one trigger: API name plus the current effort in the
   caption tone, exactly like the native conversation model seat. */
.dsc-model-control { position: relative; display: flex; min-width: 0; }
.dsc-model-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  max-width: 280px;
  height: var(--dsc-control-h);
  padding: 0 4px 0 8px;
  border: 0;
  border-radius: var(--dsc-radius-control);
  background: transparent;
  color: var(--dsc-muted);
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  white-space: nowrap;
  flex: none;
}
.dsc-model-trigger:hover,
.dsc-model-trigger.is-open { background: var(--dsc-interactive); color: var(--dsc-text); }
.dsc-model-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsc-model-effort { flex: none; color: var(--dsc-caption); }
.dsc-model-effort.is-off { color: var(--dsc-caption); }
.dsc-model-trigger > .dsc-icon { flex: none; color: var(--dsc-caption); }
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
.dsc-textarea:focus,
.dsc-textarea:focus-visible { outline: 0; box-shadow: none; }
.dsc-prompt:focus,
.dsc-prompt:focus-visible,
.dsc-handoff-brief:focus,
.dsc-handoff-brief:focus-visible {
  border-color: color-mix(in srgb, var(--dsc-brand) 42%, var(--dsc-border-strong));
  box-shadow: none;
}
.dsc-file-input { display: none; }
.dsc-tools { position: relative; display: flex; flex: none; }
.dsc-tools-trigger {
  position: relative;
  width: 28px;
  height: 28px;
  aspect-ratio: 1 / 1;
  padding: 0;
  border: 0;
  border-radius: 999px;
  /* Harness opts round controls out of the global superellipse corner shape.
     Without this, the shared theme deforms the 28px square into a squircle. */
  corner-shape: round;
  background: var(--dsc-selector);
  color: var(--dsc-text);
  display: grid;
  place-items: center;
  flex: none;
  transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease;
}
.dsc-tools-trigger:hover { background: var(--dsc-interactive-solid); }
.dsc-tools-trigger.is-open { background: var(--dsc-active); }

/* ---------- composer popovers (tools + model) ----------
   Native Harness menu material: 4px inset rail, 16px panel radius, the
   translucent menu surface with the same backdrop blur, prominent elevation and
   a hairline stroke. Tool rows read like the command menu (left name, right
   description); model rows read like the model seat (label/value cells, then
   lists with a trailing check). */
.dsc-popover {
  position: absolute;
  z-index: 24;
  bottom: calc(100% + var(--dsc-popover-offset, 8px));
  left: 0;
  padding: 4px;
  border: 0;
  border-radius: var(--dsc-radius-menu);
  background: var(--dsc-menu-surface);
  -webkit-backdrop-filter: var(--dsc-menu-backdrop);
  backdrop-filter: var(--dsc-menu-backdrop);
  box-shadow: inset 0 0 0 1px var(--dsc-border), var(--dsc-shadow-popover);
  overflow-y: auto;
  overscroll-behavior: contain;
  animation: dsc-pop 0.12s ease-out;
}
.dsc-popover[data-placement='bottom'] {
  bottom: auto;
  top: calc(100% + var(--dsc-popover-offset, 8px));
}
.dsc-tools-menu {
  left: 0;
  right: auto;
  width: auto;
  max-width: none;
}
.dsc-model-menu {
  left: auto;
  right: 0;
  width: min(280px, calc(100vw - 24px));
  max-width: 360px;
}
@keyframes dsc-pop { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.dsc-menu-section {
  min-height: 23px;
  padding: 5px 8px 2px;
  color: var(--dsc-tertiary);
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  user-select: none;
}
.dsc-tool-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 34px;
  padding: 6px 8px;
  border: 0;
  border-radius: var(--dsc-radius-row);
  background: transparent;
  color: var(--dsc-text);
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  outline: none;
}
.dsc-tool-item:hover:not(:disabled),
.dsc-tool-item:focus-visible { background: var(--dsc-interactive); }
.dsc-root .dsc-tool-item:focus-visible,
.dsc-root .dsc-model-cell:focus-visible,
.dsc-root .dsc-model-option:focus-visible,
.dsc-root .dsc-effort-option:focus-visible { outline: none; }
.dsc-tool-item:disabled { opacity: 0.48; cursor: default; }
.dsc-tool-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex: none;
  color: var(--dsc-menu-icon);
}
.dsc-tool-name {
  flex: none;
  max-width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsc-tool-desc {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsc-tertiary);
  font-size: 12px;
  line-height: 18px;
  text-align: right;
}
.dsc-tool-desc.is-warn { color: var(--dsc-warn); }
.dsc-tool-state {
  flex: none;
  color: var(--dsc-caption);
  font-size: 11px;
  line-height: 16px;
}
.dsc-tool-check { display: inline-flex; flex: none; color: var(--dsc-text); }
/* Root model seat: Model / Reasoning effort cells with the current value and
   a drill chevron, matching the native two-level menu. */
.dsc-model-root { display: flex; flex-direction: column; gap: 0; }
.dsc-model-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 34px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--dsc-radius-row);
  background: transparent;
  color: var(--dsc-text);
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  outline: none;
}
.dsc-model-cell:hover,
.dsc-model-cell:focus-visible { background: var(--dsc-interactive); }
.dsc-model-cell-label { flex: none; white-space: nowrap; }
.dsc-model-cell-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  color: var(--dsc-tertiary);
}
.dsc-model-cell > .dsc-icon { flex: none; width: 12px; height: 12px; color: var(--dsc-menu-icon); }
/* Lists: names or tiers only, a trailing check for the active value. */
.dsc-model-list,
.dsc-effort-list { display: flex; flex-direction: column; gap: 0; }
.dsc-model-option,
.dsc-effort-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 34px;
  padding: 5px 7px;
  border: 0;
  border-radius: var(--dsc-radius-row);
  background: transparent;
  color: var(--dsc-text);
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  outline: none;
}
.dsc-model-option:hover,
.dsc-model-option:focus-visible,
.dsc-effort-option:hover,
.dsc-effort-option:focus-visible { background: var(--dsc-interactive); }
.dsc-model-option-name,
.dsc-effort-option-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsc-model-note {
  flex: none;
  overflow: hidden;
  max-width: 42%;
  color: var(--dsc-tertiary);
  font-size: 11px;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsc-model-check {
  display: inline-grid;
  place-items: center;
  flex: none;
  width: 14px;
  height: 14px;
  color: var(--dsc-text);
}
.dsc-model-check .dsc-icon { width: 14px; height: 14px; }
.dsc-send-button,
.dsc-stop-button {
  width: 34px;
  height: 34px;
  aspect-ratio: 1 / 1;
  padding: 0;
  border: 0;
  border-radius: 999px;
  /* The native 34px primary circle also opts out of the theme's global
     superellipse; border-radius alone would still paint a squircle here. */
  corner-shape: round;
  background: var(--dsc-primary-action);
  color: var(--dsc-on-color);
  display: grid;
  place-items: center;
  flex: none;
  transform: translateY(-2px);
  transition: background var(--dsc-fast) ease, opacity var(--dsc-fast) ease;
}
.dsc-send-button:not(.is-idle):hover { background: var(--dsc-primary-action-hover); }
.dsc-send-button.is-idle { opacity: 0.4; cursor: default; }
.dsc-stop-button:hover { background: var(--dsc-primary-action-hover); }
.dsc-drop-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px dashed var(--dsc-business);
  border-radius: var(--dsc-radius-panel);
  background: color-mix(in srgb, var(--dsc-business) 8%, var(--dsc-input-major));
  color: var(--dsc-business);
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
}
.dsc-disclaimer { margin-top: 7px; text-align: center; font-size: 10.9px; color: var(--dsc-muted); }

/* ---------- dialogs ---------- */
/* Rendered as a native modal <dialog> (top layer), so the Chat shell's own
   stacking context cannot put the mode switch above the mask. These resets keep
   the original full-viewport mask and centered card layout. */
.dsc-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  border: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: inherit;
  background: var(--dsw-alias-bg-mask-1, color-mix(in srgb, #0b0f19 46%, transparent));
  backdrop-filter: blur(3px);
  animation: dsc-fade var(--ds-transition-duration-fast, 0.1s) ease;
}
.dsc-modal-backdrop::backdrop { background: transparent; }
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
/* One compact form layout shared by create/rename prompts: header, a full-width
   field, then right-aligned actions. The width belongs to the dialog, not to
   the intrinsic width of an input. */
.dsc-modal.dsc-form-modal { width: min(420px, 100%); }
.dsc-form-modal .dsc-modal-body { padding: 18px 20px 20px; }
.dsc-form-modal .dsc-field { gap: 8px; }
.dsc-form-modal .dsc-input { height: 38px; font-size: 13.2px; }
.dsc-modal-foot-note:empty { min-height: 1px; }
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
.dsc-field-hint.is-warning { color: var(--dsc-warn); }
.dsc-segment { display: inline-flex; align-self: flex-start; gap: 2px; padding: 2px; border: 1px solid var(--dsc-border); border-radius: 9px; background: var(--dsc-layer2); }
.dsc-segment-button { height: 29px; padding: 0 11px; border: 0; border-radius: 7px; background: transparent; color: var(--dsc-muted); font-size: 12px; font-weight: 550; }
.dsc-segment-button.is-active { background: var(--dsc-layer); color: var(--dsc-text); box-shadow: 0 1px 3px rgba(9, 12, 20, 0.1); }
.dsc-key-row { display: flex; gap: 7px; align-items: center; }
.dsc-input {
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 9px;
  background: var(--dsc-bg);
  color: var(--dsc-text);
  outline: 0;
  font-size: 12.9px;
  transition: border-color var(--dsc-fast) ease, box-shadow var(--dsc-fast) ease;
}
.dsc-input::placeholder { color: var(--dsc-muted); }
.dsc-input:focus,
.dsc-input:focus-visible {
  outline: 0;
  border-color: color-mix(in srgb, var(--dsc-brand) 42%, var(--dsc-border-strong));
  box-shadow: none;
}
.dsc-input:disabled { opacity: 0.58; }
.dsc-select {
  height: 36px;
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
.dsc-select:focus,
.dsc-select:focus-visible {
  outline: 0;
  border-color: color-mix(in srgb, var(--dsc-brand) 42%, var(--dsc-border-strong));
  box-shadow: none;
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
.dsc-switch.is-on { background: var(--dsc-primary-action); }
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
.dsc-workspace-creator {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 12px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 12px;
  background: var(--dsc-layer2);
}
.dsc-workspace-creator-head { display: flex; align-items: center; gap: 7px; }
.dsc-workspace-creator-head strong { font-size: 12.6px; font-weight: 620; }
.dsc-workspace-creator-head .dsc-icon { color: var(--dsc-link); flex: none; }
.dsc-workspace-creator-close { margin-left: auto; width: 26px; height: 26px; }
.dsc-workspace-picks { display: flex; flex-wrap: wrap; gap: 7px; }
.dsc-workspace-picks .dsc-secondary-button { height: 31px; padding: 0 11px; font-size: 12px; }
.dsc-workspace-creator-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 1px; }
.dsc-workspace-creator-actions .dsc-primary-button,
.dsc-workspace-creator-actions .dsc-secondary-button { height: 33px; padding: 0 13px; font-size: 12.4px; }
.dsc-workspace-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 7px 9px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--dsc-warn) 7%, transparent);
}
.dsc-workspace-hint span { font-size: 11.4px; line-height: 1.5; color: var(--dsc-muted); }
.dsc-workspace-hint .dsc-text-button { padding: 0 6px; font-size: 11.8px; }
.dsc-field-actions { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.dsc-data-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dsc-path { max-width: 68%; overflow-x: auto; padding: 5px 7px; border-radius: 6px; background: var(--dsc-layer2); font-size: 11.2px; white-space: nowrap; font-family: var(--dsc-mono); }
.dsc-about-row { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: var(--dsc-muted); }
.dsc-about-row strong { color: var(--dsc-text); font-weight: 580; }
.dsc-confirm { width: min(420px, 100%); padding: 20px; border: 1px solid var(--dsc-border); border-radius: 16px; background: var(--dsc-layer); box-shadow: var(--dsc-shadow); animation: dsc-rise 0.16s ease; }
.dsc-confirm h2 { margin: 0 0 7px; font-size: 16px; font-weight: 620; letter-spacing: -0.01em; }
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
.dsc-folder-name-input { margin: 0; }
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

/* ---------- chat history import ---------- */
.dsc-modal.dsc-import-modal { width: min(680px, 100%); }
.dsc-import-pick { gap: 12px; }
.dsc-import-drop {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 188px;
  padding: 22px;
  border: 1.5px dashed var(--dsc-border-strong);
  border-radius: 14px;
  background: color-mix(in srgb, var(--dsc-layer2) 34%, transparent);
  color: var(--dsc-text);
  text-align: center;
  cursor: pointer;
  transition: border-color var(--dsc-fast) var(--dsc-ease), background var(--dsc-fast) var(--dsc-ease);
}
.dsc-import-drop:hover { border-color: color-mix(in srgb, var(--dsc-brand) 45%, var(--dsc-border-strong)); }
.dsc-import-drop.is-drag { border-color: var(--dsc-brand); background: var(--dsc-brand-soft); }
.dsc-import-drop.is-busy { cursor: progress; }
.dsc-import-drop-icon { display: inline-flex; color: var(--dsc-link); }
.dsc-import-drop-title { font-size: 13.6px; font-weight: 570; }
.dsc-import-drop-hint { font-size: 11.8px; color: var(--dsc-muted); line-height: 1.6; max-width: 380px; }
.dsc-import-input { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); border: 0; }
.dsc-import-error { margin: 0; }
.dsc-import-summary { display: flex; align-items: center; gap: 10px; }
.dsc-import-preview { gap: 12px; }
.dsc-import-summary-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.dsc-import-file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 550; }
.dsc-import-file-meta { font-size: 11.4px; color: var(--dsc-muted); }
.dsc-import-summary-side { flex: none; }
.dsc-import-toolbar { display: flex; align-items: center; gap: 10px; }
.dsc-import-check-all {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--dsc-border);
  border-radius: 9px;
  background: transparent;
  color: var(--dsc-text);
  font-size: 12px;
  font-weight: 550;
}
.dsc-import-check-all:hover { background: var(--dsc-hover); }
.dsc-import-check-all.is-on .dsc-choice-check { border-color: var(--dsc-brand); background: var(--dsc-brand-soft); color: var(--dsc-link); }
.dsc-import-count { margin-left: auto; font-size: 11.5px; color: var(--dsc-muted); }
.dsc-import-filter {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--dsc-border);
  border-radius: 9px;
  background: var(--dsc-field);
  color: var(--dsc-muted);
}
.dsc-import-filter-input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--dsc-text);
  font: inherit;
  font-size: 12.6px;
}
.dsc-import-list { display: flex; flex-direction: column; gap: 2px; max-height: min(46vh, 420px); overflow-y: auto; }
.dsc-import-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 42px;
  padding: 6px 9px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--dsc-text);
  text-align: left;
}
.dsc-import-item:hover { background: var(--dsc-hover); }
.dsc-import-item.is-selected { border-color: color-mix(in srgb, var(--dsc-brand) 20%, transparent); background: var(--dsc-brand-soft); }
.dsc-import-item.is-selected .dsc-choice-check { border-color: var(--dsc-brand); background: var(--dsc-layer); }
.dsc-import-item.is-imported { cursor: default; opacity: 0.62; }
.dsc-import-item.is-imported:hover { background: transparent; }
.dsc-import-item.is-imported .dsc-choice-check { border-style: dashed; }
.dsc-import-item-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.dsc-import-item-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.8px; }
.dsc-import-item-meta { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11.1px; color: var(--dsc-muted); }
.dsc-import-badge {
  flex: none;
  padding: 2px 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsc-success) 12%, transparent);
  color: var(--dsc-success);
  font-size: 10.6px;
  font-weight: 560;
}
.dsc-import-progress { gap: 12px; }
.dsc-import-progress-head { display: flex; align-items: baseline; gap: 10px; }
.dsc-import-progress-label { font-size: 13px; font-weight: 570; }
.dsc-import-progress-count { margin-left: auto; font-size: 12px; color: var(--dsc-muted); font-variant-numeric: tabular-nums; }
.dsc-import-bar { height: 8px; border-radius: 999px; background: var(--dsc-field); overflow: hidden; }
.dsc-import-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dsc-link), color-mix(in srgb, var(--dsc-link) 62%, var(--dsc-brand)));
  transition: width 0.25s var(--dsc-ease);
}
.dsc-import-hint { margin: 0; font-size: 11.6px; color: var(--dsc-muted); line-height: 1.65; }
.dsc-import-result { gap: 12px; }
.dsc-import-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.dsc-import-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 11px 12px;
  border: 1px solid var(--dsc-border);
  border-radius: 11px;
  background: color-mix(in srgb, var(--dsc-layer2) 30%, transparent);
}
.dsc-import-stat-value { font-size: 20px; font-weight: 620; line-height: 1.1; font-variant-numeric: tabular-nums; }
.dsc-import-stat-label { font-size: 11.2px; color: var(--dsc-muted); }
.dsc-import-stat.is-ok .dsc-import-stat-value { color: var(--dsc-success); }
.dsc-import-stat.is-skip .dsc-import-stat-value { color: var(--dsc-muted); }
.dsc-import-stat.is-fail .dsc-import-stat-value { color: var(--dsc-error); }
.dsc-import-failures { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border: 1px solid var(--dsc-border); border-radius: 11px; background: color-mix(in srgb, var(--dsc-error) 5%, transparent); }
.dsc-import-failures-title { font-size: 11.4px; font-weight: 600; color: var(--dsc-muted); }
.dsc-import-failure { display: flex; align-items: baseline; gap: 8px; font-size: 11.6px; }
.dsc-import-failure-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsc-import-failure-reason { flex: none; color: var(--dsc-muted); font-family: var(--dsc-mono); font-size: 10.4px; }
.dsc-import-memory {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid var(--dsc-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsc-layer2) 46%, transparent);
}
.dsc-import-memory-icon { display: inline-flex; flex: none; color: var(--dsc-link); }
.dsc-import-memory-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.dsc-import-memory-title { font-size: 12.8px; font-weight: 570; }
.dsc-import-memory-hint { margin: 0; font-size: 11.4px; line-height: 1.55; color: var(--dsc-muted); }
.dsc-import-memory .dsc-secondary-button { flex: none; }
.dsc-answer-notice { margin: 10px 0 0; }
.dsc-notice.is-warn {
  border-color: color-mix(in srgb, var(--dsc-warn) 24%, transparent);
  background: color-mix(in srgb, var(--dsc-warn) 7%, transparent);
  color: var(--dsc-warn);
}

/* ---------- long-term memory ---------- */
.dsc-settings-tabs { display: flex; gap: 2px; padding: 12px 20px 0; }
.dsc-settings-tab { height: 30px; padding: 0 12px; border: 0; border-radius: 8px; background: transparent; color: var(--dsc-muted); font-size: 12.2px; font-weight: 560; transition: background var(--dsc-fast) ease, color var(--dsc-fast) ease; }
.dsc-settings-tab:hover:not(.is-active) { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-settings-tab.is-active { background: var(--dsc-brand-soft); color: var(--dsc-link); }
.dsc-memory-pane { display: flex; flex-direction: column; gap: 16px; }
.dsc-memory-state { display: flex; align-items: center; justify-content: center; gap: 9px; min-height: 140px; color: var(--dsc-muted); font-size: 12.6px; }
.dsc-memory-notice { display: flex; align-items: flex-start; gap: 10px; padding: 14px; border: 1px solid var(--dsc-border-strong); border-radius: 12px; background: color-mix(in srgb, var(--dsc-warn) 7%, transparent); }
.dsc-memory-notice .dsc-icon { color: var(--dsc-warn); flex: none; margin-top: 1px; }
.dsc-memory-notice-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.dsc-memory-notice-body strong { font-size: 12.8px; }
.dsc-memory-notice-body p { margin: 0; font-size: 11.7px; line-height: 1.6; color: var(--dsc-muted); word-break: break-word; }
.dsc-memory-notice .dsc-secondary-button { flex: none; height: 31px; padding: 0 11px; font-size: 12px; }
.dsc-memory-summary { display: flex; flex-direction: column; gap: 9px; }
.dsc-memory-summary-text { font-size: 12.5px; line-height: 1.68; color: var(--dsc-text); }
.dsc-memory-summary-text .dsc-paragraph { margin: 0 0 7px; }
.dsc-memory-summary-text .dsc-list { margin: 4px 0 8px; padding-left: 19px; }
.dsc-memory-summary-text .dsc-heading,
.dsc-memory-summary-text h1.dsc-heading,
.dsc-memory-summary-text h2.dsc-heading,
.dsc-memory-summary-text h3.dsc-heading { margin: 9px 0 4px; font-size: 13px; }
.dsc-memory-summary-text .dsc-quote { margin: 6px 0; }
.dsc-memory-summary-empty { margin: 0; font-size: 12.2px; line-height: 1.6; color: var(--dsc-muted); }
.dsc-memory-summary-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.dsc-memory-summary-meta { font-size: 11.3px; color: var(--dsc-muted); }
.dsc-memory-ask { display: flex; align-items: flex-end; gap: 8px; padding-top: 2px; }
.dsc-memory-ask-input { flex: 1; width: auto; min-width: 0; }
.dsc-memory-ask .dsc-primary-button { flex: none; }
.dsc-memory-ask-result { display: flex; flex-direction: column; gap: 6px; padding: 10px; border: 1px solid var(--dsc-border); border-radius: 10px; background: var(--dsc-layer); }
.dsc-memory-answer { margin: 0; font-size: 12.5px; line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
.dsc-memory-applied { margin: 0; font-size: 11.5px; color: var(--dsc-success); }
.dsc-memory-pending { display: flex; flex-direction: column; gap: 6px; padding-top: 7px; border-top: 1px solid var(--dsc-border); }
.dsc-memory-pending-title { margin: 0; font-size: 12.2px; font-weight: 580; }
.dsc-memory-pending-list { margin: 0; padding-left: 18px; font-size: 12.1px; line-height: 1.6; color: var(--dsc-muted); word-break: break-word; }
.dsc-memory-pending-actions { display: flex; justify-content: flex-end; gap: 7px; }
.dsc-memory-pending-actions .dsc-primary-button,
.dsc-memory-pending-actions .dsc-secondary-button { height: 31px; padding: 0 12px; font-size: 12.2px; }
.dsc-memory-list-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.dsc-memory-limit { font-size: 11.4px; color: var(--dsc-muted); }
.dsc-memory-filters { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
.dsc-memory-chip { display: inline-flex; align-items: center; gap: 5px; flex: none; height: 27px; padding: 0 9px; border: 1px solid var(--dsc-border); border-radius: 999px; background: transparent; color: var(--dsc-muted); font-size: 11.6px; font-weight: 550; white-space: nowrap; }
.dsc-memory-chip:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-memory-chip.is-active { border-color: color-mix(in srgb, var(--dsc-brand) 24%, transparent); background: var(--dsc-brand-soft); color: var(--dsc-link); }
.dsc-memory-chip-count { font-size: 10.8px; opacity: 0.72; }
.dsc-memory-add { display: flex; flex-direction: column; gap: 7px; }
.dsc-memory-add-row { display: flex; align-items: center; gap: 8px; }
.dsc-memory-add-row .dsc-select { flex: 1; min-width: 0; height: 33px; }
.dsc-memory-add-row .dsc-secondary-button { flex: none; height: 33px; padding: 0 13px; font-size: 12.3px; }
.dsc-memory-rows { display: flex; flex-direction: column; gap: 6px; max-height: 340px; overflow-y: auto; }
.dsc-memory-row { display: flex; flex-direction: column; gap: 6px; padding: 9px 10px; border: 1px solid var(--dsc-border); border-radius: 10px; background: var(--dsc-layer); }
.dsc-memory-content { margin: 0; font-size: 12.4px; line-height: 1.6; word-break: break-word; }
.dsc-memory-row-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.dsc-memory-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; min-width: 0; font-size: 11px; color: var(--dsc-muted); }
.dsc-memory-badge { display: inline-flex; align-items: center; max-width: 100%; padding: 1px 7px; border-radius: 999px; background: var(--dsc-brand-soft); color: var(--dsc-link); font-size: 10.8px; font-weight: 560; }
.dsc-memory-badge.is-duplicate { background: color-mix(in srgb, var(--dsc-warn) 12%, transparent); color: var(--dsc-warn); }
.dsc-memory-badge.is-exists { background: var(--dsc-brand-soft); color: var(--dsc-link); }
.dsc-memory-badge.is-sensitive { background: color-mix(in srgb, var(--dsc-error) 10%, transparent); color: var(--dsc-error); }
.dsc-memory-row-actions { display: flex; align-items: center; gap: 2px; flex: none; }
.dsc-memory-empty { margin: 0; padding: 16px 10px; border: 1px dashed var(--dsc-border-strong); border-radius: 10px; text-align: center; font-size: 12.2px; line-height: 1.6; color: var(--dsc-muted); }
.dsc-memory-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.dsc-memory-footer .dsc-secondary-button { display: inline-flex; align-items: center; gap: 6px; flex: none; }
.dsc-memory-input { width: 100%; min-height: 54px; max-height: 170px; padding: 8px 10px; border: 1px solid var(--dsc-border-strong); border-radius: 9px; background: var(--dsc-bg); color: var(--dsc-text); font-family: var(--dsc-font); font-size: 12.6px; line-height: 1.6; resize: vertical; outline: 0; }
.dsc-memory-input::placeholder { color: var(--dsc-muted); }
.dsc-memory-input:focus,
.dsc-memory-input:focus-visible { border-color: color-mix(in srgb, var(--dsc-brand) 42%, var(--dsc-border-strong)); outline: 0; }
.dsc-memory-input:disabled { opacity: 0.55; }
.dsc-switch:disabled { opacity: 0.45; cursor: default; }
.dsc-memory-import .dsc-modal { width: min(760px, 100%); }
.dsc-memory-import .dsc-modal-foot { flex-wrap: wrap; }
.dsc-memory-extract .dsc-modal { width: min(640px, 100%); }
.dsc-modal.dsc-memory-extract-modal { width: min(640px, 100%); }
.dsc-memory-extract .dsc-modal-foot { flex-wrap: wrap; }
.dsc-memory-footer-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.dsc-memory-import-intro { margin: 0; font-size: 12.4px; line-height: 1.65; color: var(--dsc-muted); }
.dsc-memory-import-field { display: flex; flex-direction: column; gap: 7px; }
.dsc-memory-prompt-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.dsc-memory-prompt-head .dsc-secondary-button { display: inline-flex; align-items: center; gap: 5px; height: 29px; padding: 0 10px; font-size: 12px; }
.dsc-memory-prompt { margin: 0; max-height: 232px; overflow: auto; padding: 10px 12px; border: 1px solid var(--dsc-border); border-radius: 10px; background: var(--dsc-code-bg); font-family: var(--dsc-mono); font-size: 11.3px; line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
.dsc-memory-paste { min-height: 168px; max-height: 300px; font-family: var(--dsc-mono); font-size: 11.8px; }
.dsc-memory-consent { display: flex; flex-direction: column; gap: 8px; padding: 10px; border: 1px solid color-mix(in srgb, var(--dsc-warn) 30%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--dsc-warn) 7%, transparent); }
.dsc-memory-consent-text { margin: 0; font-size: 12px; line-height: 1.6; }
.dsc-memory-consent-actions { display: flex; justify-content: flex-end; gap: 7px; }
.dsc-memory-consent-actions .dsc-primary-button,
.dsc-memory-consent-actions .dsc-secondary-button { height: 31px; padding: 0 12px; font-size: 12.2px; }
.dsc-memory-preview-count { margin: 0; font-size: 11.8px; color: var(--dsc-muted); }
.dsc-memory-preview { display: flex; flex-direction: column; gap: 8px; max-height: 44vh; overflow-y: auto; padding-right: 2px; }
.dsc-memory-preview-row { display: flex; flex-direction: column; gap: 7px; padding: 10px; border: 1px solid var(--dsc-border); border-radius: 10px; background: var(--dsc-layer); }
.dsc-memory-preview-row.is-selected { border-color: color-mix(in srgb, var(--dsc-brand) 22%, var(--dsc-border)); }
.dsc-memory-preview-check { display: flex; align-items: center; gap: 7px; font-size: 11.6px; color: var(--dsc-muted); }
.dsc-memory-preview-check input { width: 14px; height: 14px; accent-color: var(--dsc-brand); }
.dsc-memory-preview-controls { display: flex; gap: 7px; }
.dsc-memory-preview-controls .dsc-select { flex: 1; min-width: 0; height: 32px; }
.dsc-memory-mode { max-width: 42%; }
.dsc-memory-preview-badges { display: flex; flex-wrap: wrap; gap: 5px; }
.dsc-memory-preview-badges:empty { display: none; }
.dsc-memory-preview-existing { margin: 0; font-size: 11.3px; line-height: 1.55; color: var(--dsc-muted); word-break: break-word; }
@media (max-width: 620px) {
  .dsc-settings-tabs { padding: 10px 14px 0; }
  .dsc-memory-ask { flex-direction: column; align-items: stretch; }
  .dsc-memory-ask .dsc-primary-button { align-self: flex-end; }
  .dsc-memory-footer { flex-direction: column; align-items: stretch; }
  .dsc-memory-footer .dsc-secondary-button { justify-content: center; }
  .dsc-memory-footer-actions { justify-content: center; }
  .dsc-import-memory { align-items: flex-start; flex-wrap: wrap; }
  .dsc-import-memory .dsc-secondary-button { width: 100%; justify-content: center; }
  .dsc-memory-row-foot { flex-wrap: wrap; }
  .dsc-memory-preview-controls { flex-wrap: wrap; }
  .dsc-memory-mode { max-width: none; }
}

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
  .dsc-handoff-button { width: 40px; padding: 0; }
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
  /* macOS: the Chat surface now starts at the window top, so the drawer and
     its mask start there too. The inner padding keeps the drawer's own rows on
     the native line, and the mask covers the same strip the native drawer mask
     covers. */
  html[data-platform='darwin'] .dsc-sidebar-column { inset: 0 auto 0 0; }
  html[data-platform='darwin'] .dsc-sidebar-backdrop { inset: 0; }
}
@media (min-width: 769px) {
  .dsc-sidebar-backdrop { display: none; }
}
@media (max-width: 760px) {
  /* Narrow content column: shrink the whole control, keep both labels. */
  .dsc-modeswitch { --dsc-nav-width: 208px; --dsc-nav-height: 36px; font-size: 12.6px; }
  .dsc-modeswitch-item { font-size: 12.6px; }
  .dsc-handoff-button { width: 36px; height: 36px; }
  .dsc-greeting { font-size: clamp(23px, 5.6vw, 28px); }
  .dsc-empty { padding-bottom: 3vh; }
}
@media (max-width: 620px) {
  .dsc-model-trigger { max-width: 188px; }
  .dsc-tool-toggle { width: var(--dsc-control-h); padding: 0; justify-content: center; }
  .dsc-tool-toggle-label { display: none; }
  .dsc-composer-bar { padding: 2px 6px 6px; gap: 6px; }
  .dsc-composer-left { gap: 6px; }
  .dsc-composer-right { gap: 6px; }
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
  .dsc-answer { font-size: 14.5px; }
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
