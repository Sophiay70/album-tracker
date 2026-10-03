import { useEffect } from 'react';

// Mirrors document.hidden onto <html data-page-hidden> so CSS can pause the
// drifting blobs and spinning records while the tab is in the background.
export function usePageVisibilityFlag() {
  useEffect(() => {
    const root = document.documentElement;
    function sync() {
      if (document.hidden) root.setAttribute('data-page-hidden', '');
      else root.removeAttribute('data-page-hidden');
    }
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      root.removeAttribute('data-page-hidden');
    };
  }, []);
}
