/**
 * Popover plumbing shared by the composer tool menu and the model menu.
 *
 * A composer popover lives next to the input, at the bottom of the window, so
 * the default side is "above the trigger"; when the window is too short the
 * hook flips it below, and either way the panel's height is clamped so it never
 * runs past the viewport edge. Keyboard behaviour is the WAI-ARIA menu pattern:
 * Arrow keys move through the items, Home/End jump, Escape and Tab close.
 */

const POPOVER_GAP = 4
/** Space a flipped panel must leave for the trigger line. */
const POPOVER_PREFERRED = 180

function popoverItemSelector() {
  return '[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"]'
}

/**
 * Close a popover on any pointer press outside its panel and trigger.
 * Runs in the capture phase so a press on another control still closes this
 * one before that control handles the click.
 */
function useOutsideDismiss(open, onClose, panelRef, triggerRef) {
  const closeRef = React.useRef(onClose)
  closeRef.current = onClose
  React.useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      const target = event?.target
      if (!(target instanceof Node)) return
      if (panelRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      closeRef.current()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [open, panelRef, triggerRef])
}

/**
 * Keep a popover on the side with room for it and clamp its height to the
 * viewport. Re-measures on resize and on any layout scroll (the thread above
 * the composer scrolls independently of the window).
 *
 * The "+" card uses the native Harness command-menu geometry: it is as wide as
 * the whole composer and opens 4px above its top edge instead of hugging the
 * 28px trigger. The model menu stays anchored to its trigger, right-aligned.
 * The extra distance is published as a CSS custom property on the panel.
 *
 * @returns `{ placement, maxHeight, offset, left, width, right }` - "top" opens above.
 */
function usePopupPlacement(open, triggerRef, panelRef, { alignToComposer = false } = {}) {
  const [layout, setLayout] = React.useState({ placement: 'top', maxHeight: null, offset: 8, left: null, width: null, right: null })
  React.useLayoutEffect(() => {
    if (!open) return () => {}
    const update = () => {
      const trigger = triggerRef.current
      const panel = panelRef.current
      if (!trigger || !panel) return
      const rect = trigger.getBoundingClientRect()
      const composer = alignToComposer ? trigger.closest?.('.dsc-composer') : null
      const composerRect = composer?.getBoundingClientRect?.() ?? null
      const anchorTop = composerRect?.top ?? rect.top
      const anchorBottom = composerRect?.bottom ?? rect.bottom
      const viewport = window.innerHeight || 0
      const viewportWidth = window.innerWidth || 0
      const natural = panel.offsetHeight || panel.scrollHeight || 0
      const spaceAbove = anchorTop - POPOVER_GAP - 8
      const spaceBelow = viewport - anchorBottom - POPOVER_GAP - 8
      const placement = spaceAbove >= Math.min(natural, POPOVER_PREFERRED) || spaceAbove >= spaceBelow
        ? 'top'
        : 'bottom'
      const available = placement === 'top' ? spaceAbove : spaceBelow
      const maxHeight = available > 120 ? Math.min(available, 520) : null
      let offset = 8
      if (alignToComposer && composerRect !== null) {
        offset = placement === 'top'
          ? Math.max(POPOVER_GAP, Math.round(rect.top - composerRect.top) + POPOVER_GAP)
          : Math.max(POPOVER_GAP, Math.round(composerRect.bottom - rect.bottom) + POPOVER_GAP)
      }
      const parentRect = panel.offsetParent?.getBoundingClientRect?.() ?? rect
      let left = null
      let width = null
      let right = null
      if (alignToComposer && composerRect !== null) {
        left = Math.round(composerRect.left - parentRect.left)
        width = Math.round(composerRect.width)
      } else if (!alignToComposer) {
        // Right-aligned to the trigger by CSS, but never allowed to fall past
        // the window's left edge on a phone-sized composer.
        const panelWidth = panel.offsetWidth || Math.min(280, viewportWidth - 24)
        const margin = 12
        const targetLeft = Math.min(
          Math.max(rect.right - panelWidth, margin),
          Math.max(margin, viewportWidth - panelWidth - margin),
        )
        right = Math.round(parentRect.right - targetLeft - panelWidth)
      }
      setLayout((current) => (
        current.placement === placement
        && current.maxHeight === maxHeight
        && current.offset === offset
        && current.left === left
        && current.width === width
        && current.right === right
          ? current
          : { placement, maxHeight, offset, left, width, right }
      ))
    }
    update()
    window.addEventListener('resize', update)
    // Capture scroll events from the scrolling thread as well as the window.
    window.addEventListener('scroll', update, true)
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null
    if (observer && panelRef.current) observer.observe(panelRef.current)
    const composer = triggerRef.current?.closest?.('.dsc-composer')
    if (observer && composer) observer.observe(composer)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      observer?.disconnect()
    }
  }, [open, panelRef, triggerRef, alignToComposer])
  return layout
}

/** Inline style for an open popover: viewport clamp plus composer clearance. */
function popoverStyle(layout) {
  const style = { '--dsc-popover-offset': `${layout.offset ?? 8}px` }
  if (layout.maxHeight !== null) style.maxHeight = `${layout.maxHeight}px`
  if (layout.left !== null) style.left = `${layout.left}px`
  if (layout.width !== null) style.width = `${layout.width}px`
  if (layout.right !== null) style.right = `${layout.right}px`
  return style
}

function popoverItems(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return []
  return [...container.querySelectorAll(popoverItemSelector())].filter(item => (
    item.disabled !== true && item.getAttribute?.('aria-disabled') !== 'true'
  ))
}

/** Move keyboard focus to the open panel's first (or last) enabled item. */
function focusMenuItem(container, edge = 'first') {
  const items = popoverItems(container)
  if (items.length === 0) return
  const target = edge === 'last' ? items[items.length - 1] : items[0]
  target.focus?.({ preventScroll: false })
}

/**
 * Key handler for one popover panel.
 * ArrowUp/Down wrap through items, Home/End jump, Escape closes, Tab closes and
 * lets the browser move focus naturally.
 */
function handleMenuKeyDown(event, { container, onClose, trigger }) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    event.preventDefault()
    onClose()
    trigger?.current?.focus?.()
    return
  }
  if (event.key === 'Tab') {
    // Close, but do not prevent default: Tab must keep moving focus.
    onClose()
    return
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') return
  const items = popoverItems(container)
  if (items.length === 0) return
  event.preventDefault()
  const active = document.activeElement
  const index = items.indexOf(active)
  let next
  if (event.key === 'Home') next = items[0]
  else if (event.key === 'End') next = items[items.length - 1]
  else if (event.key === 'ArrowDown') next = items[(index + 1) % items.length]
  else next = items[(index - 1 + items.length) % items.length]
  next.focus?.({ preventScroll: false })
}
