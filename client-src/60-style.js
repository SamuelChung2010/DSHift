const CHAT_CSS = `
.dsc-root {
  --dsc-brand: var(--dsw-static-deepseek-500, #4176e6);
  --dsc-link: var(--dsw-alias-link, var(--dsw-static-deepseek-400, #4d6bfe));
  --dsc-on-brand: var(--dsw-alias-label-on-color, #ffffff);
  --dsc-bg: var(--dsw-alias-bg-base, #ffffff);
  --dsc-layer: var(--dsw-alias-bg-layer-1, #ffffff);
  --dsc-layer2: var(--dsw-alias-bg-layer-2, #f3f4f8);
  --dsc-sidebar: var(--dsw-specific-sidebar-fill, #f7f8fc);
  --dsc-text: var(--dsw-alias-label-primary, #1b1c1f);
  --dsc-muted: var(--dsw-alias-label-secondary, #6b7280);
  --dsc-border: var(--dsw-alias-border-l1, rgba(15, 23, 42, 0.09));
  --dsc-border-strong: var(--dsw-alias-border-l2, rgba(15, 23, 42, 0.16));
  --dsc-hover: color-mix(in srgb, var(--dsc-text) 5%, transparent);
  --dsc-brand-soft: color-mix(in srgb, var(--dsc-link) 10%, transparent);
  --dsc-brand-soft-strong: color-mix(in srgb, var(--dsc-link) 17%, transparent);
  --dsc-error: var(--dsw-alias-state-error-primary, #d33d3d);
  --dsc-warn: var(--dsw-alias-state-warn-primary, #b45309);
  --dsc-success: var(--dsw-alias-state-success-primary, #15803d);
  --dsc-shadow: 0 18px 48px rgba(15, 23, 42, 0.16);
  --dsc-shadow-soft: 0 8px 24px rgba(15, 23, 42, 0.08);
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  overflow: hidden;
  background: var(--dsc-bg);
  color: var(--dsc-text);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.55;
  pointer-events: auto;
  -webkit-font-smoothing: antialiased;
}
.dsc-root *,
.dsc-root *::before,
.dsc-root *::after { box-sizing: border-box; }
.dsc-root :where(button, input, textarea) { font: inherit; color: inherit; }
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

/* Sidebar */
.dsc-sidebar {
  width: 276px;
  flex: 0 0 276px;
  min-height: 0;
  background: var(--dsc-sidebar);
  border-right: 1px solid var(--dsc-border);
}
.dsc-sidebar:not(.is-open) { display: none; }
.dsc-sidebar-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 14px 12px 12px;
}
.dsc-sidebar-top { flex: none; }
.dsc-brand-row { display: flex; align-items: center; gap: 9px; padding: 2px 4px 14px; }
.dsc-brand-mark { display: inline-flex; flex: none; color: var(--dsc-brand); }
.dsc-brand-name { font-size: 15px; font-weight: 650; letter-spacing: -0.01em; }
.dsc-sidebar-collapse { margin-left: auto; }
.dsc-new-chat {
  width: 100%;
  height: 40px;
  border: 0;
  border-radius: 12px;
  background: var(--dsc-brand);
  color: var(--dsc-on-brand);
  font-size: 13.5px;
  font-weight: 650;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  box-shadow: 0 6px 16px color-mix(in srgb, var(--dsc-brand) 26%, transparent);
  transition: filter 0.15s ease, transform 0.15s ease;
}
.dsc-new-chat:hover { filter: brightness(1.06); }
.dsc-new-chat:active { transform: scale(0.99); }
.dsc-search {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  margin: 10px 0 8px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsc-text) 4%, transparent);
  color: var(--dsc-muted);
}
.dsc-search:focus-within { border-color: var(--dsc-border-strong); background: var(--dsc-layer); }
.dsc-search-input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 13px; color: var(--dsc-text); }
.dsc-search-input::placeholder { color: var(--dsc-muted); }
.dsc-chat-list { flex: 1; min-height: 0; overflow-y: auto; padding: 2px 0 10px; scrollbar-width: thin; }
.dsc-chat-group { margin-top: 12px; }
.dsc-chat-group:first-child { margin-top: 2px; }
.dsc-chat-group-label { padding: 0 8px 4px; font-size: 11.5px; font-weight: 600; color: var(--dsc-muted); }
.dsc-chat-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 8px;
  margin: 1px 0;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.13s ease;
}
.dsc-chat-item:hover { background: var(--dsc-hover); }
.dsc-chat-item.is-active { background: var(--dsc-brand-soft); }
.dsc-chat-item-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13.2px;
  font-weight: 500;
}
.dsc-chat-item.is-active .dsc-chat-item-title { color: var(--dsc-link); }
.dsc-chat-item-time { flex: none; font-size: 11px; color: var(--dsc-muted); }
.dsc-chat-item-actions {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  align-items: center;
  gap: 1px;
  padding-left: 12px;
  background: linear-gradient(to right, transparent, var(--dsc-sidebar) 32%);
}
.dsc-chat-item:hover .dsc-chat-item-actions,
.dsc-chat-item.is-active .dsc-chat-item-actions { display: flex; }
.dsc-chat-item:hover .dsc-chat-item-time { visibility: hidden; }
.dsc-chat-item.is-renaming { background: var(--dsc-layer); border: 1px solid var(--dsc-border-strong); }
.dsc-rename-input {
  width: 100%;
  height: 30px;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 13px;
}
.dsc-list-empty { padding: 24px 10px; text-align: center; color: var(--dsc-muted); font-size: 12.5px; }
.dsc-sidebar-foot { flex: none; padding-top: 8px; border-top: 1px solid var(--dsc-border); display: flex; flex-direction: column; gap: 1px; }
.dsc-foot-action {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 36px;
  padding: 0 9px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  font-size: 13px;
  color: var(--dsc-muted);
  text-align: left;
}
.dsc-foot-action:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-auth-dot { width: 7px; height: 7px; border-radius: 999px; margin-left: auto; background: var(--dsc-warn); }
.dsc-auth-dot.is-ready { background: var(--dsc-success); }
.dsc-auth-dot.is-missing { background: var(--dsc-warn); }

/* Main frame */
.dsc-main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; background: var(--dsc-bg); }
.dsc-main-column { flex: 1; display: flex; flex-direction: column; height: 100%; min-height: 0; }
.dsc-header {
  flex: none;
  height: 58px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid var(--dsc-border);
  background: color-mix(in srgb, var(--dsc-bg) 92%, transparent);
  backdrop-filter: blur(12px);
  z-index: 3;
}
.dsc-header-left { display: flex; align-items: center; gap: 4px; min-width: 0; flex: 1; }
.dsc-header-title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14.5px; font-weight: 600; }
.dsc-header-right { display: flex; align-items: center; gap: 6px; flex: none; }
.dsc-model-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--dsc-border);
  border-radius: 999px;
  background: var(--dsc-layer);
  color: var(--dsc-muted);
  font-size: 12.2px;
  font-weight: 550;
  white-space: nowrap;
}
.dsc-model-pill:hover { border-color: var(--dsc-border-strong); color: var(--dsc-text); }
.dsc-model-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--dsc-brand); }
.dsc-agent-button {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 11px;
  border: 1px solid var(--dsc-border);
  border-radius: 9px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 12.5px;
  font-weight: 550;
}
.dsc-agent-button:hover { border-color: var(--dsc-border-strong); color: var(--dsc-text); background: var(--dsc-hover); }
.dsc-agent-label-short { display: none; }
.dsc-header-newchat { display: none; }
.dsc-auth-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 9px;
  border: 1px solid color-mix(in srgb, var(--dsc-warn) 28%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsc-warn) 8%, transparent);
  color: var(--dsc-warn);
  font-size: 11.5px;
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
}
.dsc-icon-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-icon-button.is-small { width: 24px; height: 24px; border-radius: 6px; }
.dsc-icon-button.is-danger:hover { color: var(--dsc-error); background: color-mix(in srgb, var(--dsc-error) 9%, transparent); }
.dsc-header-menu { margin-left: -4px; }

/* Thread */
.dsc-thread {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 28px 24px 12px;
  scrollbar-gutter: stable;
}
.dsc-thread-inner {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
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
.dsc-modal-body::-webkit-scrollbar { width: 10px; height: 10px; }
.dsc-thread::-webkit-scrollbar-thumb,
.dsc-chat-list::-webkit-scrollbar-thumb,
.dsc-modal-body::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--dsc-text) 16%, transparent);
  border: 3px solid transparent;
  background-clip: content-box;
  border-radius: 999px;
}

/* Empty state */
.dsc-empty { width: 100%; max-width: 760px; margin: 0 auto; padding: 9vh 0 20px; text-align: center; }
.dsc-empty-brand { display: flex; justify-content: center; margin-bottom: 18px; }
.dsc-empty-title { margin: 0 0 8px; font-size: clamp(24px, 3.2vw, 31px); font-weight: 650; letter-spacing: -0.02em; line-height: 1.25; }
.dsc-empty-subtitle { max-width: 560px; margin: 0 auto; color: var(--dsc-muted); font-size: 14.5px; line-height: 1.7; }
.dsc-suggestions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 28px; text-align: left; }
.dsc-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--dsc-border);
  border-radius: 14px;
  background: var(--dsc-layer);
  text-align: left;
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.dsc-suggestion:hover {
  border-color: color-mix(in srgb, var(--dsc-brand) 40%, var(--dsc-border));
  box-shadow: var(--dsc-shadow-soft);
  transform: translateY(-1px);
}
.dsc-suggestion-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dsc-brand-soft);
  color: var(--dsc-link);
  flex: none;
}
.dsc-suggestion-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.dsc-suggestion-title { font-size: 12.5px; font-weight: 650; }
.dsc-suggestion-text { font-size: 12.5px; color: var(--dsc-muted); line-height: 1.5; }
.dsc-empty-foot { margin-top: 24px; font-size: 11.5px; color: var(--dsc-muted); }
.dsc-setup-card {
  display: flex;
  align-items: center;
  gap: 11px;
  max-width: 580px;
  margin: 22px auto 0;
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, var(--dsc-warn) 25%, transparent);
  border-radius: 13px;
  background: color-mix(in srgb, var(--dsc-warn) 7%, var(--dsc-layer));
  text-align: left;
}
.dsc-setup-icon { color: var(--dsc-warn); flex: none; }
.dsc-setup-body { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.dsc-setup-body strong { font-size: 13px; }
.dsc-setup-body span { font-size: 12px; color: var(--dsc-muted); }
.dsc-primary-button {
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 9px;
  background: var(--dsc-brand);
  color: var(--dsc-on-brand);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.dsc-primary-button:hover { filter: brightness(1.06); }
.dsc-primary-button:disabled { opacity: 0.45; }
.dsc-primary-button.is-danger { background: var(--dsc-error); }
.dsc-secondary-button {
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 9px;
  background: transparent;
  font-size: 13px;
  font-weight: 550;
  white-space: nowrap;
}
.dsc-secondary-button:hover { background: var(--dsc-hover); }
.dsc-secondary-button:disabled { opacity: 0.45; }

/* Messages */
.dsc-msg { display: flex; width: 100%; min-width: 0; }
.dsc-msg-user { justify-content: flex-end; padding-left: 12%; }
.dsc-user-bubble {
  max-width: 100%;
  padding: 10px 15px;
  border-radius: 18px 18px 5px 18px;
  background: color-mix(in srgb, var(--dsc-brand) 9%, var(--dsc-layer));
  border: 1px solid color-mix(in srgb, var(--dsc-brand) 12%, transparent);
  font-size: 14.5px;
  line-height: 1.65;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}
.dsc-user-text { white-space: pre-wrap; word-break: break-word; }
.dsc-user-files { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 7px; }
.dsc-msg-assistant { align-items: flex-start; gap: 12px; padding-right: 6%; }
.dsc-msg-avatar { flex: none; padding-top: 2px; }
.dsc-msg-body { flex: 1; min-width: 0; }

/* Attachments */
.dsc-attach {
  display: flex;
  align-items: center;
  gap: 7px;
  max-width: 260px;
  min-height: 38px;
  padding: 4px 6px;
  border: 1px solid var(--dsc-border);
  border-radius: 10px;
  background: var(--dsc-layer);
}
.dsc-attach.is-compact { max-width: 220px; min-height: 34px; padding: 3px 6px; background: color-mix(in srgb, var(--dsc-layer) 75%, transparent); }
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
.dsc-attach-meta { display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 0; }
.dsc-attach-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.3px; font-weight: 600; }
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

/* Process / reasoning */
.dsc-process {
  margin: 0 0 12px;
  padding: 2px 11px;
  border: 1px solid var(--dsc-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsc-layer2) 55%, transparent);
}
.dsc-process-head {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  color: var(--dsc-muted);
  font-size: 12.8px;
  font-weight: 550;
  cursor: pointer;
  user-select: none;
}
.dsc-process-icon { color: var(--dsc-link); display: flex; }
.dsc-process-title { flex: 1; min-width: 0; }
.dsc-process-body { padding: 2px 0 10px; }
.dsc-think-block {
  margin: 4px 0 8px;
  padding: 2px 0 2px 11px;
  border-left: 2px solid var(--dsc-border-strong);
  color: var(--dsc-muted);
  font-size: 13px;
  line-height: 1.7;
  max-height: 340px;
  overflow-y: auto;
}
.dsc-think-block .dsc-md { font-size: 13px; line-height: 1.7; color: var(--dsc-muted); }
.dsc-step { display: flex; align-items: flex-start; gap: 8px; padding: 5px 0; }
.dsc-step-icon { color: var(--dsc-muted); padding-top: 1px; display: flex; }
.dsc-step-main { min-width: 0; flex: 1; }
.dsc-step-line { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; min-width: 0; font-size: 12.7px; }
.dsc-step-line.is-clickable { cursor: pointer; }
.dsc-step-label { font-weight: 600; color: var(--dsc-text); }
.dsc-step-detail { color: var(--dsc-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 430px; }
.dsc-step-count { padding: 0 6px; border-radius: 999px; background: var(--dsc-brand-soft); color: var(--dsc-link); font-size: 10.8px; font-weight: 600; }
.dsc-step-pending { color: var(--dsc-link); font-size: 11.5px; }
.dsc-step-failed { color: var(--dsc-error); font-size: 11.5px; }
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
.dsc-result:hover { border-color: color-mix(in srgb, var(--dsc-brand) 38%, var(--dsc-border)); }
.dsc-result-title { display: block; font-size: 12.3px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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

/* Markdown */
.dsc-md { font-size: 14.8px; line-height: 1.76; word-break: break-word; }
.dsc-md > *:first-child { margin-top: 0; }
.dsc-md > *:last-child { margin-bottom: 0; }
.dsc-paragraph { margin: 0 0 12px; white-space: pre-wrap; }
.dsc-heading { margin: 20px 0 8px; line-height: 1.35; letter-spacing: -0.01em; }
h1.dsc-heading { font-size: 22px; }
h2.dsc-heading { font-size: 19px; }
h3.dsc-heading { font-size: 17px; }
h4.dsc-heading, h5.dsc-heading, h6.dsc-heading { font-size: 15px; }
.dsc-link { color: var(--dsc-link); text-decoration: none; }
.dsc-link:hover { text-decoration: underline; }
.dsc-inline-code {
  padding: 1px 5px;
  border: 1px solid var(--dsc-border);
  border-radius: 5px;
  background: var(--dsc-layer2);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 0.89em;
}
.dsc-code { margin: 12px 0; border: 1px solid var(--dsc-border); border-radius: 12px; overflow: hidden; background: color-mix(in srgb, var(--dsc-text) 4%, var(--dsc-layer2)); }
.dsc-code-head { display: flex; align-items: center; justify-content: space-between; height: 32px; padding: 0 10px 0 12px; border-bottom: 1px solid var(--dsc-border); }
.dsc-code-lang { font-size: 11.5px; color: var(--dsc-muted); font-weight: 600; text-transform: lowercase; }
.dsc-code-copy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 7px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 11.5px;
}
.dsc-code-copy:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-pre { margin: 0; padding: 12px 13px; overflow-x: auto; font-size: 12.6px; line-height: 1.65; }
.dsc-pre code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; white-space: pre; }
.dsc-quote { margin: 12px 0; padding: 2px 13px; border-left: 3px solid var(--dsc-brand-soft-strong); color: var(--dsc-muted); white-space: pre-wrap; }
.dsc-list { margin: 8px 0 12px; padding-left: 21px; }
.dsc-list li { margin: 3px 0; }
.dsc-table-wrap { overflow-x: auto; margin: 12px 0; border: 1px solid var(--dsc-border); border-radius: 10px; }
.dsc-table { border-collapse: collapse; width: 100%; font-size: 13px; }
.dsc-table th, .dsc-table td { padding: 7px 10px; border-bottom: 1px solid var(--dsc-border); text-align: left; vertical-align: top; }
.dsc-table th { background: var(--dsc-layer2); font-weight: 600; }
.dsc-table tr:last-child td { border-bottom: 0; }
.dsc-hr { border: 0; border-top: 1px solid var(--dsc-border); margin: 18px 0; }
.dsc-caret {
  display: inline-block;
  width: 7px;
  height: 15px;
  margin-left: 2px;
  border-radius: 1px;
  background: var(--dsc-brand);
  vertical-align: -2px;
  animation: dsc-blink 1s steps(2, start) infinite;
}
@keyframes dsc-blink { 50% { opacity: 0; } }

/* Sources */
.dsc-sources { margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--dsc-border); }
.dsc-sources-head { display: flex; align-items: center; gap: 5px; margin-bottom: 7px; font-size: 12px; font-weight: 600; color: var(--dsc-muted); }
.dsc-source-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
.dsc-source {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 8px 9px;
  border: 1px solid var(--dsc-border);
  border-radius: 10px;
  background: var(--dsc-layer);
  color: var(--dsc-text);
  text-decoration: none;
  min-width: 0;
}
.dsc-source:hover { border-color: color-mix(in srgb, var(--dsc-brand) 38%, var(--dsc-border)); }
.dsc-source-index {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: var(--dsc-brand-soft);
  color: var(--dsc-link);
  font-size: 10.5px;
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
  font-weight: 600;
  line-height: 1.4;
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

/* Message actions / notices */
.dsc-msg-actions { display: flex; align-items: center; gap: 4px; margin-top: 8px; opacity: 0; visibility: hidden; transition: opacity 0.15s ease; }
.dsc-msg-assistant:hover .dsc-msg-actions,
.dsc-msg-actions.is-last { opacity: 1; visibility: visible; }
.dsc-usage { font-size: 10.8px; color: var(--dsc-muted); margin-left: 5px; }
.dsc-notice {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 8px 0;
  padding: 9px 11px;
  border: 1px solid color-mix(in srgb, var(--dsc-warn) 24%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsc-warn) 7%, transparent);
  color: var(--dsc-warn);
  font-size: 12.8px;
  line-height: 1.55;
}
.dsc-notice.is-error {
  border-color: color-mix(in srgb, var(--dsc-error) 24%, transparent);
  background: color-mix(in srgb, var(--dsc-error) 7%, transparent);
  color: var(--dsc-error);
}
.dsc-notice .dsc-icon { margin-top: 1px; }
.dsc-muted-note { margin: 6px 0; font-size: 12.5px; color: var(--dsc-muted); }
.dsc-inline-button {
  border: 0;
  background: transparent;
  color: var(--dsc-link);
  font-size: inherit;
  font-weight: 600;
  padding: 0 2px;
  text-decoration: underline;
}
.dsc-typing { display: inline-flex; align-items: center; gap: 4px; padding: 7px 0 3px; }
.dsc-typing-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--dsc-brand); opacity: 0.35; animation: dsc-dot 1.2s ease-in-out infinite; }
.dsc-typing-dot:nth-child(2) { animation-delay: 0.15s; }
.dsc-typing-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes dsc-dot { 0%, 80%, 100% { opacity: 0.25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }

/* Composer */
.dsc-composer-wrap {
  flex: none;
  width: 100%;
  max-width: 908px;
  margin: 0 auto;
  padding: 8px 24px 14px;
  background: linear-gradient(to top, var(--dsc-bg) 72%, transparent);
}
.dsc-auth-banner {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 auto 8px;
  max-width: 812px;
  padding: 8px 12px;
  border: 1px solid color-mix(in srgb, var(--dsc-warn) 24%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsc-warn) 7%, var(--dsc-layer));
  color: var(--dsc-warn);
  font-size: 12.3px;
}
.dsc-auth-banner span { flex: 1; }
.dsc-composer {
  position: relative;
  max-width: 812px;
  margin: 0 auto;
  padding: 9px 11px 7px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 24px;
  background: var(--dsc-layer);
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.06);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.dsc-composer:focus-within {
  border-color: color-mix(in srgb, var(--dsc-brand) 55%, var(--dsc-border-strong));
  box-shadow: 0 0 0 3px var(--dsc-brand-soft), 0 6px 22px rgba(15, 23, 42, 0.07);
}
.dsc-composer.is-drag { border-color: var(--dsc-brand); }
.dsc-textarea {
  display: block;
  width: 100%;
  min-height: 42px;
  max-height: 200px;
  padding: 5px 5px 2px;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  font-size: 15px;
  line-height: 1.6;
}
.dsc-textarea::placeholder { color: var(--dsc-muted); }
.dsc-composer-tools { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.dsc-file-input { display: none; }
.dsc-tool-button {
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--dsc-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.dsc-tool-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-mode-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--dsc-muted);
  font-size: 12.4px;
  font-weight: 550;
  white-space: nowrap;
}
.dsc-mode-button:hover { background: var(--dsc-hover); color: var(--dsc-text); }
.dsc-mode-button.is-active {
  background: var(--dsc-brand-soft);
  border-color: color-mix(in srgb, var(--dsc-brand) 18%, transparent);
  color: var(--dsc-link);
}
.dsc-tool-spacer { flex: 1; }
.dsc-send-button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: var(--dsc-brand);
  color: var(--dsc-on-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  box-shadow: 0 3px 10px color-mix(in srgb, var(--dsc-brand) 30%, transparent);
}
.dsc-send-button:hover { filter: brightness(1.07); }
.dsc-send-button.is-idle { opacity: 0.42; box-shadow: none; }
.dsc-stop-button {
  width: 34px;
  height: 34px;
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
.dsc-disclaimer { margin-top: 7px; text-align: center; font-size: 11px; color: var(--dsc-muted); }

/* Modal */
.dsc-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(3px);
  animation: dsc-fade 0.15s ease;
}
@keyframes dsc-fade { from { opacity: 0; } to { opacity: 1; } }
.dsc-modal {
  width: min(640px, 100%);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dsc-border);
  border-radius: 18px;
  background: var(--dsc-layer);
  box-shadow: var(--dsc-shadow);
  overflow: hidden;
  animation: dsc-rise 0.18s ease;
}
@keyframes dsc-rise { from { opacity: 0; transform: translateY(8px) scale(0.99); } to { opacity: 1; transform: none; } }
.dsc-modal-head { display: flex; align-items: flex-start; gap: 12px; padding: 18px 20px 14px; border-bottom: 1px solid var(--dsc-border); }
.dsc-modal-head h2 { margin: 0; font-size: 17px; font-weight: 650; letter-spacing: -0.01em; }
.dsc-modal-sub { margin: 3px 0 0; font-size: 11.8px; color: var(--dsc-muted); line-height: 1.5; }
.dsc-modal-head .dsc-icon-button { margin-left: auto; }
.dsc-modal-body { overflow-y: auto; padding: 16px 20px 22px; display: flex; flex-direction: column; gap: 17px; }
.dsc-settings-title { margin: 0 0 7px 2px; font-size: 12px; font-weight: 650; color: var(--dsc-muted); }
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
.dsc-field-label { font-size: 12px; font-weight: 650; color: var(--dsc-muted); }
.dsc-field-hint { margin: 0; font-size: 11.4px; line-height: 1.6; color: var(--dsc-muted); }
.dsc-segment { display: inline-flex; align-self: flex-start; gap: 2px; padding: 2px; border: 1px solid var(--dsc-border); border-radius: 9px; background: var(--dsc-layer2); }
.dsc-segment-button { height: 29px; padding: 0 11px; border: 0; border-radius: 7px; background: transparent; color: var(--dsc-muted); font-size: 12px; font-weight: 550; }
.dsc-segment-button.is-active { background: var(--dsc-layer); color: var(--dsc-text); box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1); }
.dsc-key-row { display: flex; gap: 7px; align-items: center; }
.dsc-input {
  flex: 1;
  min-width: 0;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--dsc-border-strong);
  border-radius: 9px;
  background: var(--dsc-bg);
  outline: 0;
  font-size: 13px;
}
.dsc-input:focus { border-color: var(--dsc-brand); box-shadow: 0 0 0 2px var(--dsc-brand-soft); }
.dsc-key-state { flex: 1; padding: 8px 10px; border-radius: 9px; background: var(--dsc-layer2); color: var(--dsc-muted); font-size: 12px; }
.dsc-switch-row { display: flex; align-items: center; gap: 12px; }
.dsc-switch-copy { display: flex; flex-direction: column; gap: 1px; flex: 1; }
.dsc-switch-copy strong { font-size: 12.8px; font-weight: 600; }
.dsc-switch-copy span { font-size: 11.4px; color: var(--dsc-muted); }
.dsc-switch {
  width: 40px;
  height: 24px;
  padding: 2px;
  border: 0;
  border-radius: 999px;
  background: var(--dsc-border-strong);
  transition: background 0.16s ease;
  flex: none;
}
.dsc-switch.is-on { background: var(--dsc-brand); }
.dsc-switch-thumb { display: block; width: 20px; height: 20px; border-radius: 999px; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.22); transition: transform 0.16s ease; }
.dsc-switch.is-on .dsc-switch-thumb { transform: translateX(16px); }
.dsc-prompt { min-height: 92px; border: 1px solid var(--dsc-border-strong); border-radius: 9px; padding: 9px 10px; background: var(--dsc-bg); resize: vertical; }
.dsc-field-actions { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.dsc-data-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dsc-path { max-width: 68%; overflow-x: auto; padding: 5px 7px; border-radius: 6px; background: var(--dsc-layer2); font-size: 11.2px; white-space: nowrap; }
.dsc-about-row { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: var(--dsc-muted); }
.dsc-about-row strong { color: var(--dsc-text); font-weight: 600; }
.dsc-confirm { width: min(430px, 100%); padding: 20px; border: 1px solid var(--dsc-border); border-radius: 16px; background: var(--dsc-layer); box-shadow: var(--dsc-shadow); animation: dsc-rise 0.18s ease; }
.dsc-confirm h2 { margin: 0 0 7px; font-size: 16px; font-weight: 650; }
.dsc-confirm p { margin: 0; font-size: 13px; line-height: 1.6; color: var(--dsc-muted); }
.dsc-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }

/* Toasts */
.dsc-toasts { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 40; display: flex; flex-direction: column; gap: 7px; align-items: center; pointer-events: none; width: min(560px, calc(100% - 32px)); }
.dsc-toast { display: flex; align-items: center; gap: 7px; max-width: 100%; padding: 9px 13px; border: 1px solid var(--dsc-border); border-radius: 10px; background: var(--dsc-layer); box-shadow: var(--dsc-shadow-soft); font-size: 12.6px; color: var(--dsc-text); animation: dsc-toast-in 0.18s ease; }
.dsc-toast .dsc-icon { color: var(--dsc-success); flex: none; }
.dsc-toast.is-warning .dsc-icon, .dsc-toast.is-warning { color: var(--dsc-warn); }
.dsc-toast.is-error .dsc-icon, .dsc-toast.is-error { color: var(--dsc-error); }
@keyframes dsc-toast-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* Boot */
.dsc-boot { flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; position: relative; padding: 24px; }
.dsc-boot-text { font-size: 13px; color: var(--dsc-muted); }
.dsc-boot-close { position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border: 1px solid var(--dsc-border); border-radius: 9px; background: var(--dsc-layer); color: var(--dsc-muted); display: flex; align-items: center; justify-content: center; }
.dsc-boot-close:hover { color: var(--dsc-text); background: var(--dsc-hover); }
.dsc-boot-card { width: min(430px, 100%); padding: 22px; border: 1px solid var(--dsc-border); border-radius: 16px; background: var(--dsc-layer); text-align: center; box-shadow: var(--dsc-shadow-soft); }
.dsc-boot-icon { display: inline-flex; color: var(--dsc-warn); }
.dsc-boot-card h2 { margin: 8px 0 5px; font-size: 16px; }
.dsc-boot-card p { margin: 0 0 14px; font-size: 12.5px; color: var(--dsc-muted); line-height: 1.6; word-break: break-word; }

/* Sidebar footer slot action */
.dsc-footer-action {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary, inherit);
  font-size: 12.5px;
  cursor: pointer;
}
.dsc-footer-action:hover {
  background: color-mix(in srgb, currentColor 7%, transparent);
  color: var(--dsw-alias-label-primary, inherit);
}

/* Responsive */
@media (max-width: 1100px) {
  .dsc-sidebar { width: 248px; flex-basis: 248px; }
}
@media (max-width: 900px) {
  .dsc-header-newchat { display: inline-flex; }
  .dsc-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 20;
    width: min(300px, 86vw);
    flex-basis: auto;
    box-shadow: var(--dsc-shadow);
    transform: translateX(-102%);
    transition: transform 0.22s ease;
    display: flex;
  }
  .dsc-sidebar.is-open { transform: translateX(0); }
  .dsc-sidebar:not(.is-open) { display: flex; }
  .dsc-sidebar-backdrop {
    position: fixed;
    inset: 0;
    z-index: 19;
    border: 0;
    padding: 0;
    background: rgba(15, 23, 42, 0.35);
    backdrop-filter: blur(1px);
  }
  .dsc-header { padding: 0 14px; }
  .dsc-thread { padding: 22px 16px 10px; }
  .dsc-composer-wrap { padding: 6px 14px 12px; }
  .dsc-msg-user { padding-left: 6%; }
  .dsc-msg-assistant { padding-right: 0; }
}
@media (min-width: 901px) {
  .dsc-sidebar-backdrop { display: none; }
}
@media (max-width: 680px) {
  .dsc-agent-label-full { display: none; }
  .dsc-agent-label-short { display: inline; }
  .dsc-agent-button { padding: 0 9px; }
  .dsc-model-pill { max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
  .dsc-suggestions { grid-template-columns: 1fr; }
  .dsc-source-list { grid-template-columns: 1fr; }
  .dsc-mode-button span { display: none; }
  .dsc-mode-button { width: 32px; padding: 0; justify-content: center; }
  .dsc-auth-pill span { display: none; }
  .dsc-auth-pill { width: 28px; padding: 0; justify-content: center; }
  .dsc-empty { padding-top: 6vh; }
}
@media (max-width: 480px) {
  .dsc-header-title { display: none; }
  .dsc-header-left { flex: none; }
  .dsc-header-right { flex: 1; justify-content: flex-end; }
  .dsc-model-pill { display: none; }
  .dsc-thread { padding: 16px 12px 8px; }
  .dsc-composer-wrap { padding: 4px 10px 10px; }
  .dsc-user-bubble { font-size: 14px; }
  .dsc-md { font-size: 14.2px; }
  .dsc-modal-backdrop { padding: 10px; }
  .dsc-modal { max-height: 94vh; border-radius: 14px; }
  .dsc-modal-body { padding: 14px 14px 18px; }
  .dsc-modal-head { padding: 14px 14px 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .dsc-root *, .dsc-root *::before, .dsc-root *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
`

function injectChatStyles() {
  const style = document.createElement('style')
  style.setAttribute('data-dsh-chat-mode', 'styles')
  style.textContent = CHAT_CSS
  document.head.appendChild(style)
  return () => style.remove()
}
