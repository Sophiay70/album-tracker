// Netlify Function: proxies the Discogs release search so the personal
// access token never reaches the browser.
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

  const query = encodeURIComponent(`${artist || ''} ${title || ''}`.trim());
  const url = `https://api.discogs.com/database/search?q=${query}&type=release&format=vinyl&token=${token}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { statusCode: 200, body: JSON.stringify({ imageUrl: null }) };
    }
    const data = await res.json();
    const match = data.results?.[0];
    const imageUrl = match?.cover_image || match?.thumb || null;
    return { statusCode: 200, body: JSON.stringify({ imageUrl }) };
  } catch {
    return { statusCode: 200, body: JSON.stringify({ imageUrl: null }) };
  }
};
