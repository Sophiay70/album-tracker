import { useState, useEffect } from 'react';
import StarRating from './StarRating';

const GENRES = [
  { label: 'Hip-Hop',    term: 'hip hop' },
  { label: 'Pop',        term: 'pop' },
  { label: 'Rock',       term: 'rock' },
  { label: 'R&B',        term: 'r&b soul' },
  { label: 'Electronic', term: 'electronic' },
  { label: 'Jazz',       term: 'jazz' },
  { label: 'Indie',      term: 'indie' },
  { label: 'Classical',  term: 'classical' },
];

function SuggestedAlbums({ albums, onAdd }) {
  const [activeGenre, setActiveGenre] = useState(GENRES[0]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(false);
    setSuggestions([]);
    setAddingId(null);
    setRating(0);
    setReview('');

    fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(activeGenre.term)}&entity=album&media=music&limit=20&country=us`,
      { signal: controller.signal }
    )
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        const seen = new Set();
        const unique = (data.results || []).filter(r => {
          if (seen.has(r.collectionId)) return false;
          seen.add(r.collectionId);
          return true;
        });
        setSuggestions(unique);
      })
      .catch(err => { if (err.name !== 'AbortError') setError(true); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [activeGenre]);

  function isInLibrary(result) {
    return albums.some(
      a =>
        a.title?.trim().toLowerCase() === result.collectionName.trim().toLowerCase() &&
        a.artist?.trim().toLowerCase() === result.artistName.trim().toLowerCase()
    );
  }

  function handleAdd(result) {
    onAdd({
      title: result.collectionName,
      artist: result.artistName,
      genre: activeGenre.label,
      rating,
      review: review.trim(),
      artworkUrl: result.artworkUrl100?.replace('100x100bb', '600x600bb') || '',
    });
    setAddingId(null);
    setRating(0);
    setReview('');
  }

  function startAdding(id) {
    setAddingId(id);
    setRating(0);
    setReview('');
  }

  function cancelAdding() {
    setAddingId(null);
    setRating(0);
    setReview('');
  }

  return (
    <div className="suggested-section">
      <h2 className="suggested-title">Suggested Albums</h2>

      <div className="genre-pills">
        {GENRES.map(g => (
          <button
            key={g.label}
            className={`genre-pill ${activeGenre.label === g.label ? 'active' : ''}`}
            onClick={() => setActiveGenre(g)}
          >
            {g.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="suggestions-status">
          <span className="search-spinner suggestions-spinner" />
          Loading suggestions...
        </div>
      )}
      {error && (
        <p className="suggestions-status suggestions-error">
          Failed to load suggestions. Check your connection.
        </p>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <div className="suggestions-scroll">
          {suggestions.map(r => {
            const inLibrary = isInLibrary(r);
            const isAdding = addingId === r.collectionId;
            return (
              <div
                key={r.collectionId}
                className={`suggestion-card ${inLibrary ? 'in-library' : ''} ${isAdding ? 'is-adding' : ''}`}
              >
                <img
                  src={r.artworkUrl100?.replace('100x100bb', '300x300bb') || ''}
                  alt={r.collectionName}
                  className="suggestion-art"
                />
                <p className="suggestion-name">{r.collectionName}</p>
                <p className="suggestion-artist">{r.artistName}</p>

                {inLibrary ? (
                  <span className="in-library-badge">✓ In Library</span>
                ) : isAdding ? (
                  <div className="suggestion-add-form">
                    <StarRating rating={rating} onRate={setRating} />
                    <textarea
                      className="suggestion-review-input"
                      placeholder="Write a review (optional)"
                      value={review}
                      onChange={e => setReview(e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <div className="suggestion-add-actions">
                      <button
                        className="suggestion-confirm-btn"
                        onClick={() => handleAdd(r)}
                      >
                        Add to Library
                      </button>
                      <button
                        className="suggestion-cancel-btn"
                        onClick={cancelAdding}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="suggestion-add-btn"
                    onClick={() => startAdding(r.collectionId)}
                  >
                    + Add to Library
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SuggestedAlbums;
