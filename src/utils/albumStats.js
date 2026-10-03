function time(album) {
  const t = new Date(album?.dateAdded).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function sortByRecent(albums) {
  return [...albums].sort((a, b) => time(b) - time(a));
}

// "Now spinning": the most recently logged favorite, else the most recent album.
export function getFeaturedAlbum(albums) {
  const recent = sortByRecent(albums);
  return recent.find(a => a.favorite) || recent[0] || null;
}

export function averageRating(albums) {
  if (albums.length === 0) return 0;
  return albums.reduce((sum, a) => sum + (Number(a.rating) || 0), 0) / albums.length;
}

function genreStats(albums) {
  const stats = new Map();
  albums.forEach(a => {
    if (!a.genre) return;
    const s = stats.get(a.genre) || { genre: a.genre, count: 0, total: 0 };
    s.count += 1;
    s.total += Number(a.rating) || 0;
    stats.set(a.genre, s);
  });
  return [...stats.values()].map(s => ({ ...s, avg: s.total / s.count }));
}

// Most-logged genre; ties go to the one rated higher.
export function topGenre(albums) {
  const [best] = genreStats(albums).sort((a, b) => b.count - a.count || b.avg - a.avg);
  return best ? best.genre : null;
}

// Genres ordered by average rating (then count), for "based on what you rate highest".
export function genresByRating(albums) {
  return genreStats(albums)
    .sort((a, b) => b.avg - a.avg || b.count - a.count)
    .map(s => s.genre);
}

export function formatDate(iso) {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
