// Netlify Function: proxies the Groq chat-completions call so the API key
// never reaches the browser.
//
// Set GROQ_API_KEY in Netlify's site environment variables (no REACT_APP_
// prefix — that prefix is what makes Create React App bundle a variable
// into the public client JS, which is exactly what we're avoiding here).

const { artistAlbums } = require('./itunes-search');

// Album facts from iTunes, so the model only states things that are true.
// Readings must never wait on this: the whole lookup gets LOOKUP_TIMEOUT_MS,
// and any failure just means a reading with no track names.
const LOOKUP_TIMEOUT_MS = 2500;
const fold = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

async function itunes(path, params, signal) {
  const res = await fetch(`https://itunes.apple.com/${path}?${new URLSearchParams({ ...params, country: 'us' })}`, { signal });
  if (!res.ok) throw new Error(`iTunes ${res.status}`);
  return (await res.json()).results || [];
}

// Albums added before we saved collection IDs: search the artist's
// discography (a plain artist + title search often returns nothing) and
// accept only an exact title match, never a "close enough" album.
async function findCollectionId({ title, artist }, signal) {
  const { results } = await artistAlbums(artist, signal);
  return results.find(r => fold(r.collectionName) === fold(title))?.collectionId;
}

async function lookupAlbumFacts({ title, artist, itunesCollectionId }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const id = /^\d+$/.test(String(itunesCollectionId || ''))
      ? String(itunesCollectionId)
      : await findCollectionId({ title, artist }, controller.signal);
    if (!id) return null;
    const results = await itunes('lookup', { id, entity: 'song' }, controller.signal);
    const album = results.find(r => r.wrapperType === 'collection');
    const tracks = results
      .filter(r => r.wrapperType === 'track' && r.trackName)
      .sort((a, b) => (a.discNumber - b.discNumber) || (a.trackNumber - b.trackNumber))
      .map(r => r.trackName);
    if (!album || tracks.length === 0) return null;
    const year = album.releaseDate ? new Date(album.releaseDate).getUTCFullYear() : null;
    return { year: Number.isFinite(year) ? year : null, tracks };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function buildPrompt({ title, artist, genre }, facts) {
  const genreClause = genre ? ` (${genre})` : '';
  const data = facts
    ? `Album data (the only facts you may state):\n` +
      (facts.year ? `- Release year: ${facts.year}\n` : '') +
      `- Tracklist:\n${facts.tracks.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}\n\n`
    : '';
  const factRule = facts
    ? `- You may mention a track, the release year, or another fact only if it appears in the album data above, spelled exactly as given. ` +
      `If you name a track, put it in double quotes, and use double quotes for nothing else.\n`
    : `- No tracklist is available, so do not name any track. Write from the album's sound, genre and mood only, and use no double quotes.\n`;

  return (
    `The user just added "${title}" by ${artist}${genreClause} to their library. ` +
    `Write their music-astrology reading: what this album says about them.\n\n` +
    data +
    `Rules:\n` +
    factRule +
    `- Never invent track titles, lyrics, release dates, chart positions or awards.\n` +
    `- Exactly 2–3 sentences of plain prose. No heading, title, markdown, emoji or list.\n` +
    `- Speak directly to the user as "you". Call their collection their "library", never a "playlist".\n` +
    `- Be playful and warm, and include one gentle, affectionate tease (a quirk or habit this album gives away), not just praise. ` +
    `Make the tease specific to this album's mood; don't use grocery stores, late-night snack runs or singing in the shower.\n` +
    `- Don't use these phrases: "keen eye", "keen ear", "unapologetic", "bold", "in short".\n` +
    `- Don't open with "You" or with the album or artist name; start somewhere unexpected.`
  );
}

// Anything the reading puts in double quotes must be a real track (or the
// album title). Catches invented tracks like "Sejodioto".
function quotesAreReal(text, { title }, facts) {
  const allowed = new Set([fold(title), ...(facts?.tracks || []).map(fold)]);
  const quoted = [...text.matchAll(/["“]([^"”]+)["”]/g)].map(m => fold(m[1]).replace(/[.,!?…]+$/, ''));
  return quoted.every(q => allowed.has(q));
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing GROQ_API_KEY.' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { title, artist, genre, itunesCollectionId } = payload;
  if (!title || !artist) {
    return { statusCode: 400, body: JSON.stringify({ error: 'title and artist are required.' }) };
  }

  const facts = await lookupAlbumFacts({ title, artist, itunesCollectionId });
  const prompt = buildPrompt({ title, artist, genre }, facts);

  // gpt-oss is a reasoning model: its hidden reasoning tokens count against
  // max_tokens, so the old 200-token cap often ran out mid-reading
  // (finish_reason "length"). Keep reasoning light, give it real headroom,
  // and only accept a reading the model actually finished.
  async function requestReading() {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        max_tokens: 1024,
        reasoning_effort: 'low',
        temperature: 1,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { status: response.status, error: err.error?.message || `Groq API error (${response.status})` };
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const text = (choice?.message?.content || '').replace(/^#+\s.*\n+/, '').trim();
    const complete = choice?.finish_reason === 'stop' && /[.!?…)"”’]$/.test(text);
    // A reading that names a track we didn't give it gets the same single retry.
    return complete && quotesAreReal(text, { title }, facts) ? { result: text } : { truncated: true };
  }

  try {
    let reading = await requestReading();
    // One automatic retry for a cut-off reading.
    if (reading.truncated) reading = await requestReading();

    if (reading.result) {
      return { statusCode: 200, body: JSON.stringify({ result: reading.result }) };
    }
    if (reading.truncated) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'The stars got a little tongue-tied on this one. Give it another try.' }),
      };
    }
    return { statusCode: reading.status, body: JSON.stringify({ error: reading.error }) };
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to reach Groq.' }) };
  }
};
