import { useEffect, useState } from 'react';

// Reports whether `ref` is on screen. With `once`, it latches true the first
// time the element appears and stops observing (used for the touch-device
// record slide-out). Without it, it tracks visibility continuously (used to
// pause spinning records that have scrolled away).
export function useInView(ref, { once = false, rootMargin = '0px', threshold = 0, enabled = true } = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (once) observer.disconnect();
      } else if (!once) {
        setInView(false);
      }
    }, { rootMargin, threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, once, rootMargin, threshold, enabled]);

  return inView;
}
