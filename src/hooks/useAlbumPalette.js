import { useEffect, useState } from 'react';
import { extractPalette, getCachedPalette } from '../utils/extractPalette';
import { coverUrlFor } from '../utils/albumColors';

// Dominant colors (2–4 hex strings) of an album's cover, or null while
// loading / when there's no readable art.
export function useAlbumPalette(album) {
  const url = coverUrlFor(album);
  const [result, setResult] = useState(() => ({ url, colors: getCachedPalette(url) }));

  useEffect(() => {
    let cancelled = false;
    if (!url) return undefined;
    extractPalette(url).then(colors => {
      if (!cancelled) setResult({ url, colors });
    });
    return () => { cancelled = true; };
  }, [url]);

  return result.url === url ? result.colors : getCachedPalette(url);
}
