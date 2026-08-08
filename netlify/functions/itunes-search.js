// Netlify Function: proxies iTunes Search API calls.
//
// The iTunes Search API needs no key and is normally called straight from
// the browser, but on iOS every browser shares Apple's WebKit networking
// stack, and requests were failing intermittently there (likely an
// iCloud Private Relay / shared-IP rate limit on Apple's side) even though
// the same calls worked fine from a desktop browser. Routing through our
// own Netlify function means the phone only ever talks to our own domain —
// the server-to-server call to Apple happens from Netlify's IP instead.

exports.handler = async (event) => {
  const { term, attribute, limit } = event.queryStringParameters || {};
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
