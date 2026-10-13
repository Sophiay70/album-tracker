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
    `The user just added "${title}" by ${artist}${genreClause} to their library. ` +
    `Write their music-astrology reading: what this album says about them.\n\n` +
    `Rules:\n` +
    `- Exactly 2–3 sentences of plain prose. No heading, title, markdown, emoji or list.\n` +
    `- Speak directly to the user as "you". Call their collection their "library", never a "playlist".\n` +
    `- Mention one concrete detail about this specific album (a track, the sound, the era, its story or its reception).\n` +
    `- Be playful and warm, and include one gentle, affectionate tease (a quirk or habit this album gives away), not just praise.\n` +
    `- Don't use these phrases: "keen eye", "keen ear", "unapologetic", "bold", "in short".\n` +
    `- Don't open with "You" or with the album or artist name; start somewhere unexpected.`;

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
    return complete ? { result: text } : { truncated: true };
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
