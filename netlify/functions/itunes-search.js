// Netlify Function: proxies iTunes Search API calls.
//
// The iTunes Search API needs no key and is normally called straight from
// the browser, but on iOS every browser shares Apple's WebKit networking
// stack, and requests were failing intermittently there (likely an
// iCloud Private Relay / shared-IP rate limit on Apple's side) even though
// the same calls worked fine from a desktop browser. Routing through our
// own Netlify function means the phone only ever talks to our own domain —
// the server-to-server call to Apple happens from Netlify's IP instead.

// Artists who release lots of singles (Bad Bunny, Karol G, Young Miko…) fill
// a plain `term` search with "- Single" results, so after the client drops
// singles there's nothing left. For those, `?artist=` resolves the artist
// and returns their whole discography via the lookup endpoint instead.
async function artistAlbums(artist, signal) {
  const search = new URLSearchParams({
    term: artist, entity: 'musicArtist', media: 'music', limit: '1', country: 'us',
  });
  const found = await fetch(`https://itunes.apple.com/search?${search}`, { signal }).then(r => r.ok ? r.json() : null);
  const artistId = found?.results?.[0]?.artistId;
  if (!artistId) return { resultCount: 0, results: [] };

  const lookup = new URLSearchParams({ id: String(artistId), entity: 'album', limit: '200', country: 'us' });
  const data = await fetch(`https://itunes.apple.com/lookup?${lookup}`, { signal }).then(r => r.ok ? r.json() : null);
  if (!data) throw new Error('lookup failed');
  // The first lookup result is the artist itself; keep only the albums.
  const results = (data.results || []).filter(r => r.wrapperType === 'collection');
  return { resultCount: results.length, results };
}

// Also used by personality.js to match library albums to iTunes.
exports.artistAlbums = artistAlbums;

exports.handler = async (event) => {
  const { term, attribute, limit, artist } = event.queryStringParameters || {};
  if (artist) {
    try {
      return { statusCode: 200, body: JSON.stringify(await artistAlbums(artist)) };
    } catch {
      return { statusCode: 502, body: JSON.stringify({ error: 'iTunes lookup failed.' }) };
    }
  }
  if (!term) {
    return { statusCode: 400, body: JSON.stringify({ error: 'term is required.' }) };
  }

  const params = new URLSearchParams({
    term,
    entity: 'album',
    media: 'music',
    limit: limit || '20',
    country: 'us',
  });
  if (attribute) params.set('attribute', attribute);

  try {
    const res = await fetch(`https://itunes.apple.com/search?${params.toString()}`);
    if (!res.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: 'iTunes lookup failed.' }) };
    }
    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'iTunes lookup failed.' }) };
  }
};
