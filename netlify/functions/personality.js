// Netlify Function: proxies the Groq chat-completions call so the API key
// never reaches the browser.
//
// Set GROQ_API_KEY in Netlify's site environment variables (no REACT_APP_
// prefix — that prefix is what makes Create React App bundle a variable
// into the public client JS, which is exactly what we're avoiding here).

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

  const { title, artist, genre } = payload;
  if (!title || !artist) {
    return { statusCode: 400, body: JSON.stringify({ error: 'title and artist are required.' }) };
  }

  const genreClause = genre ? ` (${genre})` : '';
  const prompt =
    `Someone just added "${title}" by ${artist}${genreClause} to their music collection. ` +
    `In 2–3 sentences, write a fun, insightful personality description of what this says about them as a person. ` +
    `Be specific to this album and artist. Keep it playful and flattering.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: err.error?.message || `Groq API error (${response.status})` }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ result: data.choices[0].message.content }),
    };
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to reach Groq.' }) };
  }
};
