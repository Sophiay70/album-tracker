// Pulls a few dominant colors out of an album cover, client-side, by drawing
// it onto a tiny canvas and bucketing the pixels. iTunes art is served with
// CORS headers, so this normally works; anything that taints the canvas (or
// fails to load) resolves to null and callers fall back to the brand palette.

const SAMPLE_SIZE = 40;
const STORAGE_KEY = 'vinyl-vault-palettes';
const memoryCache = new Map();
const pending = new Map();

function loadStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

let stored = null;

function getStored(url) {
  if (!stored) stored = loadStored();
  return stored[url];
}

function setStored(url, colors) {
  if (!stored) stored = loadStored();
  stored[url] = colors;
  // keep the cache small: newest 60 covers
  const keys = Object.keys(stored);
  if (keys.length > 60) keys.slice(0, keys.length - 60).forEach(k => delete stored[k]);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // storage full/unavailable — the in-memory cache still works
  }
}

function toHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function saturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function quantize(data) {
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    bucket.r += r; bucket.g += g; bucket.b += b; bucket.n += 1;
    buckets.set(key, bucket);
  }

  const candidates = [...buckets.values()].map(({ r, g, b, n }) => {
    const rgb = [r / n, g / n, b / n];
    const lum = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) / 255;
    // Favor colorful, mid-tone buckets; near-white/near-black ones make muddy blobs.
    const tone = lum < 0.08 || lum > 0.94 ? 0.25 : 1;
    return { rgb, score: n * (0.35 + saturation(...rgb)) * tone };
  }).sort((a, b) => b.score - a.score);

  const picked = [];
  for (const c of candidates) {
    if (picked.every(p => distance(p, c.rgb) > 60)) picked.push(c.rgb);
    if (picked.length === 4) break;
  }
  return picked.map(rgb => toHex(...rgb));
}

function extract(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const colors = quantize(ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data);
        resolve(colors.length >= 2 ? colors : null);
      } catch {
        resolve(null); // tainted canvas (CORS) or no canvas support
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Resolves to an array of 2–4 hex colors, or null if they can't be read.
export function extractPalette(url) {
  if (!url) return Promise.resolve(null);
  if (memoryCache.has(url)) return Promise.resolve(memoryCache.get(url));
  const saved = getStored(url);
  if (saved !== undefined) {
    memoryCache.set(url, saved);
    return Promise.resolve(saved);
  }
  if (pending.has(url)) return pending.get(url);

  const promise = extract(url).then(colors => {
    memoryCache.set(url, colors);
    pending.delete(url);
    // Only persist successes, so a flaky network doesn't stick an album on
    // the fallback palette forever.
    if (colors) setStored(url, colors);
    return colors;
  });
  pending.set(url, promise);
  return promise;
}

export function getCachedPalette(url) {
  if (!url) return null;
  if (memoryCache.has(url)) return memoryCache.get(url);
  const saved = getStored(url);
  return saved === undefined ? null : saved;
}
