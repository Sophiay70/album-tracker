import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { IconButton } from './Button';
import { CloseIcon } from './Icons';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Glass sheet over a dimmed, blurred backdrop; a bottom sheet on mobile.
// Rendered in a portal so a transformed/backdrop-filtered ancestor can't
// trap its position: fixed. Handles Escape, scroll lock, focus in/out/trap.
function Modal({ open, onClose, title, ariaLabel, children, className = '' }) {
  const sheetRef = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const sheet = sheetRef.current;
    // On touch devices, focusing an input would pop the keyboard over the
    // sheet before it has even animated in, so focus the sheet itself.
    const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? true;
    const first = finePointer
      ? sheet?.querySelector('input, select, textarea') || sheet?.querySelector(FOCUSABLE)
      : null;
    (first || sheet)?.focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !sheet) return;
      const els = [...sheet.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
      if (els.length === 0) return;
      const firstEl = els[0];
      const lastEl = els[els.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="sheet-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className={`sheet glass-strong ${className}`.trim()}
      >
        <IconButton label="Close" className="sheet-close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
        {title && <h2 id={titleId} className="sheet-title">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
