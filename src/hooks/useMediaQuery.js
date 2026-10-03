import { useEffect, useState } from 'react';

function matches(query) {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches;
}

export function useMediaQuery(query) {
  const [value, setValue] = useState(() => matches(query));

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setValue(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return value;
}

// True on phones/tablets, where hover effects don't exist.
export function useIsTouch() {
  return !useMediaQuery('(hover: hover) and (pointer: fine)');
}
