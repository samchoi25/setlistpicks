import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/*
 * Bare modal shell: a portal, a backdrop and a panel — no styling opinions
 * beyond positioning, so whatever goes inside is entirely the caller's.
 *
 * Handles the behaviour every modal needs: Escape and backdrop click close it,
 * the page behind stops scrolling, and focus returns to whatever had it when
 * the modal opened.
 *
 *   <Modal open={open} onClose={() => setOpen(false)} label="Find a festival">
 *     …your UI…
 *   </Modal>
 *
 * `className` / `backdropClassName` are appended to `.modal-panel` /
 * `.modal-backdrop` for per-modal styling.
 */
export default function Modal({
  open = true,
  onClose,
  label,
  className = '',
  backdropClassName = '',
  closeOnBackdrop = true,
  children,
}) {
  const panelRef = useRef(null);
  // Kept in a ref so an inline `onClose={() => …}` doesn't re-run the effect
  // (and bounce focus) on every parent render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current?.(); };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    // Focus the panel itself unless something inside (an autoFocus input)
    // already took it.
    if (!panelRef.current?.contains(document.activeElement)) panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={`modal-backdrop ${backdropClassName}`.trim()}
      onClick={(e) => { if (closeOnBackdrop && e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        ref={panelRef}
        className={`modal-panel ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
