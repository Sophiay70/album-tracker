import { useEffect } from 'react';

// iOS Safari lets a touch drag scroll-chain past a fixed-position overlay
// straight through to the page behind it, so the modal's backdrop needs an
// explicit body lock rather than relying on the overlay's own positioning.
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [isLocked]);
}
