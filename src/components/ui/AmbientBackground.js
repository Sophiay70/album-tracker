import { useEffect, useRef, useState } from 'react';
import { BRAND_PALETTE, softenForAmbient } from '../../utils/albumColors';
import { usePageVisibilityFlag } from '../../hooks/usePageVisibilityFlag';

const BLOB_COUNT = 5;
const FADE_MS = 650;

function fill(colors) {
  const source = colors && colors.length ? colors.map(softenForAmbient) : BRAND_PALETTE;
  return Array.from({ length: BLOB_COUNT }, (_, i) => source[i % source.length]);
}

// Fixed, heavily blurred color field behind the whole app. When the palette
// changes, a new layer fades in on top of the old one (opacity only, so it
// stays cheap) and the old layer is dropped once it's covered.
function AmbientBackground({ colors }) {
  usePageVisibilityFlag();
  const key = fill(colors).join('|');
  const nextId = useRef(1);
  const [layers, setLayers] = useState(() => [{ id: 0, key }]);

  useEffect(() => {
    setLayers(prev => {
      if (prev[prev.length - 1].key === key) return prev;
      return [...prev.slice(-1), { id: nextId.current++, key }];
    });
  }, [key]);

  useEffect(() => {
    if (layers.length < 2) return undefined;
    const t = setTimeout(() => setLayers(prev => prev.slice(-1)), FADE_MS);
    return () => clearTimeout(t);
  }, [layers]);

  return (
    <div className="ambient" aria-hidden="true">
      {layers.map(layer => (
        <div key={layer.id} className="ambient-layer">
          {layer.key.split('|').map((color, i) => (
            <div key={i} className="blob" style={{ background: color }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default AmbientBackground;
