// ─────────────────────────────────────────────────────────────────────────────
// AI Personality (Groq — OpenAI-compatible chat completions)
//   Called after the user selects an album and clicks "Reveal its astrology".
//   Sends album title, artist, and genre → receives a personality description.
//
//   Calls our own Netlify Function (netlify/functions/personality.js) instead
//   of Groq directly, so the real API key stays server-side and never ships
//   in the client bundle.
// ─────────────────────────────────────────────────────────────────────────────

export async function generatePersonality({ title, artist, genre }) {
  const response = await fetch('/.netlify/functions/personality', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, artist, genre }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data.result;
}
