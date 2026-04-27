// ─────────────────────────────────────────────────────────────────────────────
// AI Personality (Groq — OpenAI-compatible chat completions)
//   Called after the user selects an album and clicks "What does this say about me?"
//   Sends album title, artist, and genre → receives a personality description.
//
//   Requires: REACT_APP_GROQ_API_KEY in your .env.local file
//   Note: For a public app, proxy this through a backend to keep the key secret.
// ─────────────────────────────────────────────────────────────────────────────

export async function generatePersonality({ title, artist, genre }) {
  const apiKey = process.env.REACT_APP_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Add REACT_APP_GROQ_API_KEY to your .env.local file to use this feature.'
    );
  }

  const genreClause = genre ? ` (${genre})` : '';
  const prompt =
    `Someone just added "${title}" by ${artist}${genreClause} to their music collection. ` +
    `In 2–3 sentences, write a fun, insightful personality description of what this says about them as a person. ` +
    `Be specific to this album and artist. Keep it playful and flattering.`;

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
    throw new Error(err.error?.message || `Groq API error (${response.status})`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
