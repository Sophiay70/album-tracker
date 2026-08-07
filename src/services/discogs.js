// Discogs (release search) — looks up a real photo tied to an actual vinyl
// release, used in the Hall of Fame plaques instead of a generic drawn record.
//
// Calls our own Netlify Function (netlify/functions/discogs.js) instead of
// Discogs directly, so the real personal access token stays server-side and
// never ships in the client bundle.

export async function fetchVinylImage({ title, artist }) {
  const params = new URLSearchParams({ title, artist });
  const res = await fetch(`/.netlify/functions/discogs?${params.toString()}`);
  if (!res.ok) return null;

  const data = await res.json().catch(() => ({}));
  return data.imageUrl || null;
}
