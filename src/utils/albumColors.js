// Brand mix used for the ambient background whenever there's no album art
// to pull colors from (or the art can't be read).
export const BRAND_PALETTE = ['#8FA886', '#2E4D78', '#E8B04B', '#C97C8F', '#7FA77A'];

// Home keeps a fixed warm-cream field (sampled from Harry's House) rather
// than following the featured album: it reads best behind the dense hero,
// stats and review text. Runs through softenForAmbient like album colors.
export const HOME_PALETTE = ['#c8a577', '#dac6a9', '#a97a53', '#8b422d'];

// Deterministic hash so each album's vinyl label color stays the same across
// re-renders/reloads instead of flickering to a new color each time.
export function hashHue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function pastelFor(album) {
  return `hsl(${hashHue(String(album?.id ?? album?.title ?? ''))}, 65%, 72%)`;
}

// Cover art URL, whichever source the album has.
export function coverUrlFor(album) {
  return album?.artworkUrl || album?.resolvedCoverUrl || '';
}

// Soft gradient stand-in for albums without cover art.
export function placeholderCoverFor(album) {
  const h = hashHue(String(album?.id ?? album?.title ?? ''));
  return `linear-gradient(160deg, hsl(${h}, 38%, 62%) 0%, hsl(${(h + 40) % 360}, 42%, 30%) 100%)`;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]) {
  const ch = v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb([h, s, l]) {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = t => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [hue(h + 1 / 3) * 255, hue(h) * 255, hue(h - 1 / 3) * 255];
}

// Album-art colors tint the page, but never darker than this relative
// luminance: blobs sit behind small sage/ink text (eyebrows, captions) that
// has to stay at or above 4.5:1. Measured luminance, not HSL lightness — a
// 50%-lightness purple is still nearly black to the eye.
const MIN_BLOB_LUMINANCE = 0.5;
const MAX_BLOB_SATURATION = 0.7;

// Lifts lightness only (hue and saturation kept), so a near-black purple
// cover becomes a clear lilac rather than a muddy grey.
export function softenForAmbient(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const [h, s0, l0] = rgbToHsl(hexToRgb(hex));
  const s = Math.min(s0, MAX_BLOB_SATURATION);
  let rgb = hslToRgb([h, s, l0]);
  if (luminance(rgb) < MIN_BLOB_LUMINANCE) {
    let lo = l0, hi = 1;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      if (luminance(hslToRgb([h, s, mid])) < MIN_BLOB_LUMINANCE) lo = mid; else hi = mid;
    }
    rgb = hslToRgb([h, s, hi]);
  }
  return `rgb(${rgb.map(Math.round).join(', ')})`;
}
