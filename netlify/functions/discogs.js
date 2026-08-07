// Netlify Function: proxies Discogs release lookups so the personal access
// token never reaches the browser.
//
// Set DISCOGS_TOKEN in Netlify's site environment variables (no REACT_APP_
// prefix — that prefix is what makes Create React App bundle a variable
// into the public client JS, which is exactly what we're avoiding here).
//
// Also uses Gemini (gemini-3.6-flash, free tier) to look at a release's
// photos and identify which one actually shows the physical disc, rather
// than guessing by position. Set GEMINI_API_KEY (also no REACT_APP_ prefix)
// to enable this — without it, the function falls back to a positional guess.

const MAX_CANDIDATE_IMAGES = 6;

async function fetchAsBase64(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer.toString('base64');
}

async function pickDiscPhotoIndex(images) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || images.length === 0) return null;

  const candidates = images.slice(0, MAX_CANDIDATE_IMAGES);

  // Gemini's generateContent API only accepts images as inline base64 data,
  // not a plain external URL — download each thumbnail first.
  const encoded = await Promise.all(
    candidates.map(img => fetchAsBase64(img.uri150 || img.uri))
  );

  const parts = [
    {
      text:
        'Each image below is numbered in order. Reply with ONLY the number of the ' +
        'image that shows the physical vinyl record itself (the round disc, ' +
        'visible grooves and label) — not the square album cover, sleeve, or a ' +
        'sticker. If none of the images show the disc, reply with 0. ' +
        'Reply with just the number and nothing else.',
    },
  ];
  candidates.forEach((_, i) => {
    if (!encoded[i]) return;
    parts.push({ text: `Image ${i + 1}:` });
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: encoded[i] } });
  });

  if (parts.length === 1) return null; // no images actually downloaded

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] }),
      }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const index = parseInt(text, 10);
    if (!Number.isInteger(index) || index < 1 || index > candidates.length) return null;
    return candidates[index - 1];
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  const token = process.env.DISCOGS_TOKEN;
  if (!token) {
    return { statusCode: 200, body: JSON.stringify({ imageUrl: null }) };
  }

  const { title, artist } = event.queryStringParameters || {};
  if (!title && !artist) {
    return { statusCode: 400, body: JSON.stringify({ error: 'title or artist is required.' }) };
  }

  try {
    const query = encodeURIComponent(`${artist || ''} ${title || ''}`.trim());
    const searchUrl = `https://api.discogs.com/database/search?q=${query}&type=release&format=vinyl&token=${token}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      return { statusCode: 200, body: JSON.stringify({ imageUrl: null }) };
    }

    const searchData = await searchRes.json();
    const match = searchData.results?.[0];
    if (!match) {
      return { statusCode: 200, body: JSON.stringify({ imageUrl: null }) };
    }

    const releaseRes = await fetch(`https://api.discogs.com/releases/${match.id}?token=${token}`);
    if (releaseRes.ok) {
      const releaseData = await releaseRes.json();
      const images = releaseData.images || [];

      // Best: ask Gemini to identify the actual disc photo among this
      // release's images, regardless of position.
      const confirmed = await pickDiscPhotoIndex(images);
      if (confirmed) {
        return { statusCode: 200, body: JSON.stringify({ imageUrl: confirmed.uri }) };
      }

      // Fallback: the first non-cover image is a reasonable guess even
      // without confirmation (used when GEMINI_API_KEY isn't set, or
      // Gemini didn't find a clear disc shot among the candidates).
      const secondary = images.find(img => img.type === 'secondary');
      if (secondary) {
        return { statusCode: 200, body: JSON.stringify({ imageUrl: secondary.uri }) };
      }
    }

    // Last resort: plain cover art.
    const imageUrl = match.cover_image || match.thumb || null;
    return { statusCode: 200, body: JSON.stringify({ imageUrl }) };
  } catch {
    return { statusCode: 200, body: JSON.stringify({ imageUrl: null }) };
  }
};
