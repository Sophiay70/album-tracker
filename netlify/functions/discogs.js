// Netlify Function: proxies Discogs release lookups so the personal access
// token never reaches the browser.
//
// Set DISCOGS_TOKEN in Netlify's site environment variables (no REACT_APP_
// prefix — that prefix is what makes Create React App bundle a variable
// into the public client JS, which is exactly what we're avoiding here).

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

    // Discogs doesn't tag what an image actually shows, but the first image
    // is almost always the front cover (the same kind of shot iTunes already
    // gives us). Anything after it is labeled "secondary" and has a real
    // chance of being a photo of the physical disc/label instead — not
    // guaranteed, but a meaningfully better bet than always using the cover.
    const releaseRes = await fetch(`https://api.discogs.com/releases/${match.id}?token=${token}`);
    if (releaseRes.ok) {
      const releaseData = await releaseRes.json();
      const secondary = (releaseData.images || []).find(img => img.type === 'secondary');
      if (secondary) {
        return { statusCode: 200, body: JSON.stringify({ imageUrl: secondary.uri }) };
      }
    }

    const imageUrl = match.cover_image || match.thumb || null;
    return { statusCode: 200, body: JSON.stringify({ imageUrl }) };
  } catch {
    return { statusCode: 200, body: JSON.stringify({ imageUrl: null }) };
  }
};
