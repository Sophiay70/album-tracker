import { useEffect, useId, useRef, useState } from 'react';
import { IconButton } from './Button';
import { MoreIcon } from './Icons';

// "•••" button that opens a small glass menu. Always visible (≥44px), so it
// works on touch devices where hover-revealed actions don't exist.
// items: [{ label, onSelect, icon?, danger? }]
function OverflowMenu({ label = 'More actions', items, className = '', opensUp = false }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    itemRefs.current[0]?.focus();

    function onPointerDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function close({ restoreFocus = true } = {}) {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }

  function onMenuKeyDown(e) {
    const els = itemRefs.current.filter(Boolean);
    const idx = els.indexOf(document.activeElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      els[(idx + 1) % els.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      els[(idx - 1 + els.length) % els.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      els[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      els[els.length - 1]?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <div
      ref={wrapRef}
      className={`overflow ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <IconButton
        ref={buttonRef}
        label={label}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : 'false'}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(o => !o)}
      >
        <MoreIcon />
      </IconButton>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className={`overflow-menu glass-strong ${opensUp ? 'opens-up' : ''}`.trim()}
          onKeyDown={onMenuKeyDown}
        >
          {items.map((item, i) => (
            <button
              key={item.label}
              ref={el => { itemRefs.current[i] = el; }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={`overflow-item ${item.danger ? 'is-danger' : ''}`.trim()}
              onClick={() => {
                // Let the action move focus itself (e.g. into an edit form).
                close({ restoreFocus: false });
                item.onSelect();
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default OverflowMenu;
