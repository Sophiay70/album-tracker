import { useState, useEffect, useId } from 'react';
import StarRating from './StarRating';
import GlassPanel from './ui/GlassPanel';
import Chip from './ui/Chip';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { PlusIcon } from './ui/Icons';
import { filterAlbumsOnly } from '../utils/itunes';
import { genresByRating } from '../utils/albumStats';

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

const PAGE_SIZE = 10;

// Start on the genre the user rates highest (if it's one we can suggest).
function initialGenre(albums) {
  const best = genresByRating(albums).find(g => GENRES.some(x => x.label === g));
  return GENRES.find(g => g.label === best) || GENRES[0];
}

function art(result, size) {
  return result.artworkUrl100?.replace('100x100bb', `${size}x${size}bb`) || '';
}

function AddSuggestionSheet({ result, onConfirm, onClose }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const reviewId = useId();

  return (
    <Modal open onClose={onClose} title="Add to library">
      <div className="suggest-sheet-album">
        <img src={art(result, 300)} alt="" width="96" height="96" />
        <div>
          <p className="suggest-sheet-title">{result.collectionName}</p>
          <p className="suggest-sheet-artist">{result.artistName}</p>
        </div>
      </div>
      <form
        className="dialog-form"
        onSubmit={(e) => { e.preventDefault(); onConfirm(rating, review); }}
      >
        <div className="vv-field">
          <span className="vv-label" aria-hidden="true">Your rating</span>
          <StarRating rating={rating} onRate={setRating} label="Your rating" size={30} />
        </div>
        <div className="vv-field">
          <label className="vv-label" htmlFor={reviewId}>Review</label>
          <textarea
            id={reviewId}
            className="vv-input"
            placeholder="Write a review (optional)"
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={4}
            maxLength={2000}
          />
        </div>
        <div className="dialog-actions">
          <Button type="submit">Add to library</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

function SuggestedAlbums({ albums, onAdd }) {
  const [activeGenre, setActiveGenre] = useState(() => initialGenre(albums));
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [adding, setAdding] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();
    let settled = false;

    setLoading(true);
    setError(false);
    setSuggestions([]);
    setAdding(null);
    setVisibleCount(PAGE_SIZE);

    fetch(
      `/.netlify/functions/itunes-search?term=${encodeURIComponent(activeGenre.term)}&limit=20`,
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
        setSuggestions(filterAlbumsOnly(unique));
      })
      .catch(err => { if (err.name !== 'AbortError') setError(true); })
      .finally(() => { settled = true; setLoading(false); });

    return () => { if (!settled) controller.abort(); };
  }, [activeGenre]);

  function isInLibrary(result) {
    return albums.some(
      a =>
        a.title?.trim().toLowerCase() === result.collectionName.trim().toLowerCase() &&
        a.artist?.trim().toLowerCase() === result.artistName.trim().toLowerCase()
    );
  }

  function handleAdd(result, rating, review) {
    onAdd({
      title: result.collectionName,
      artist: result.artistName,
      genre: activeGenre.label,
      rating,
      review: review.trim(),
      artworkUrl: art(result, 600),
    });
    setAdding(null);
  }

  const visible = suggestions.slice(0, visibleCount);

  return (
    <GlassPanel as="section" className="crates" aria-labelledby="crates-title">
      <div className="crates-head">
        <h2 className="section-title" id="crates-title">Dig the crates</h2>
        <p className="crates-sub">Suggested albums by genre, based on what you rate highest.</p>
      </div>

      <div className="chip-row" role="group" aria-label="Genre">
        {GENRES.map(g => (
          <Chip
            key={g.label}
            pressed={activeGenre.label === g.label}
            onClick={() => setActiveGenre(g)}
          >
            {g.label}
          </Chip>
        ))}
      </div>

      <div aria-live="polite" className="crates-status-wrap">
        {loading && (
          <p className="crates-status">
            <span className="loading-dot" aria-hidden="true" />
            Loading {activeGenre.label} suggestions…
          </p>
        )}
        {error && (
          <p className="crates-status is-error">
            Couldn't load suggestions. Check your connection and try another genre.
          </p>
        )}
      </div>

      {loading && (
        <ul className="crate-grid" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="crate-item is-skeleton"><div className="crate-cover" /></li>
          ))}
        </ul>
      )}

      {!loading && !error && visible.length > 0 && (
        <ul className="crate-grid">
          {visible.map(r => {
            const inLibrary = isInLibrary(r);
            return (
              <li key={r.collectionId} className="crate-item">
                <div className="crate-cover">
                  <img src={art(r, 300)} alt="" loading="lazy" decoding="async" width="300" height="300" />
                </div>
                <p className="crate-title" title={r.collectionName}>{r.collectionName}</p>
                <p className="crate-artist">{r.artistName}</p>
                {inLibrary ? (
                  <span className="crate-in-library">✓ In library</span>
                ) : (
                  <button
                    type="button"
                    className="crate-add"
                    onClick={() => setAdding(r)}
                    aria-label={`Add ${r.collectionName} by ${r.artistName} to library`}
                  >
                    <PlusIcon size={15} /> Add
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !error && suggestions.length > visibleCount && (
        <div className="crates-more">
          <Button variant="glass" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
            Show more
          </Button>
        </div>
      )}

      {adding && (
        <AddSuggestionSheet
          result={adding}
          onConfirm={(rating, review) => handleAdd(adding, rating, review)}
          onClose={() => setAdding(null)}
        />
      )}
    </GlassPanel>
  );
}

export default SuggestedAlbums;
