import { useState, useEffect, useRef } from 'react';
import StarRating from './StarRating';

const GENRES = [
  'Rock', 'Pop', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic',
  'R&B', 'Country', 'Folk', 'Metal', 'Indie', 'Other',
];

const LIMITS = { title: 100, artist: 100, review: 500 };

const EMPTY_FORM = { title: '', artist: '', genre: '', rating: 0, review: '', artworkUrl: '' };

// Map iTunes genre names to our predefined list
const GENRE_MAP = {
  'Rock': 'Rock',
  'Pop': 'Pop',
  'Hip-Hop/Rap': 'Hip-Hop',
  'Jazz': 'Jazz',
  'Classical': 'Classical',
  'Electronic': 'Electronic',
  'Dance': 'Electronic',
  'R&B/Soul': 'R&B',
  'Country': 'Country',
  'Folk': 'Folk',
  'Metal': 'Metal',
  'Alternative': 'Indie',
  'Indie Pop': 'Indie',
  'Indie Rock': 'Indie',
};

function mapGenre(itunesGenre) {
  if (!itunesGenre) return '';
  return GENRE_MAP[itunesGenre] || '';
}

function validate(form, albums) {
  const errors = {};
  const title = form.title.trim();
  const artist = form.artist.trim();

  if (!title) {
    errors.title = 'Title is required.';
  } else if (title.length > LIMITS.title) {
    errors.title = `Title must be ${LIMITS.title} characters or fewer.`;
  }

  if (!artist) {
    errors.artist = 'Artist is required.';
  } else if (artist.length > LIMITS.artist) {
    errors.artist = `Artist must be ${LIMITS.artist} characters or fewer.`;
  }

  if (form.review.length > LIMITS.review) {
    errors.review = `Review must be ${LIMITS.review} characters or fewer.`;
  }

  if (!errors.title && !errors.artist) {
    const duplicate = albums.some(
      a =>
        a.title.trim().toLowerCase() === title.toLowerCase() &&
        a.artist.trim().toLowerCase() === artist.toLowerCase()
    );
    if (duplicate) {
      errors.title = 'This album is already in your library.';
    }
  }

  return errors;
}

function AddAlbumForm({ onAdd, albums }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState(false);

  const [searchAlbum, setSearchAlbum] = useState('');
  const [searchArtist, setSearchArtist] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const searchRef = useRef(null);

  // Debounced iTunes search — triggers when either search field changes
  useEffect(() => {
    const album = searchAlbum.trim();
    const artist = searchArtist.trim();

    if (album.length < 2 && artist.length < 2) {
      setResults([]);
      setShowResults(false);
      setSearchError(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(false);
      try {
        let url;
        if (album && artist) {
          url = `https://itunes.apple.com/search?term=${encodeURIComponent(`${artist} ${album}`)}&entity=album&media=music&limit=8&country=us`;
        } else if (artist) {
          url = `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=album&attribute=artistTerm&media=music&limit=8&country=us`;
        } else {
          url = `https://itunes.apple.com/search?term=${encodeURIComponent(album)}&entity=album&attribute=albumTerm&media=music&limit=8&country=us`;
        }
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResults(data.results || []);
        setShowResults(true);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSearchError(true);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 400);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [searchAlbum, searchArtist]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectResult(result) {
    setForm(prev => ({
      ...prev,
      title: result.collectionName,
      artist: result.artistName,
      genre: mapGenre(result.primaryGenreName),
      artworkUrl: result.artworkUrl100?.replace('100x100bb', '600x600bb') || '',
    }));
    setSearchAlbum('');
    setSearchArtist('');
    setShowResults(false);
    setTouched({});
    setSuccess(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
  }

  function handleBlur(e) {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({ title: true, artist: true, review: true });
    const errors = validate(form, albums);
    if (Object.keys(errors).length > 0) return;

    onAdd({
      ...form,
      title: form.title.trim(),
      artist: form.artist.trim(),
      review: form.review.trim(),
    });

    setForm(EMPTY_FORM);
    setTouched({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  function handleClear() {
    setForm(EMPTY_FORM);
    setTouched({});
    setSearchAlbum('');
    setSearchArtist('');
    setResults([]);
    setShowResults(false);
    setSuccess(false);
  }

  const errors = validate(form, albums);
  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([key]) => touched[key])
  );
  const reviewRemaining = LIMITS.review - form.review.length;
  const hasContent = form.title || form.artist || form.genre || form.rating || form.review;

  return (
    <form className="add-album-form" onSubmit={handleSubmit} noValidate>
      <h2>Add Album</h2>

      {success && <p className="form-success">Album added successfully!</p>}

      {/* Search */}
      <div className="search-wrapper" ref={searchRef}>
        <div className="search-input-row">
          <input
            className="search-input"
            type="text"
            placeholder="Album name"
            value={searchAlbum}
            onChange={e => setSearchAlbum(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
          />
          <input
            className="search-input"
            type="text"
            placeholder="Artist"
            value={searchArtist}
            onChange={e => setSearchArtist(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
          />
          {searching && <span className="search-spinner" />}
        </div>
        {searchError && (
          <p className="search-error">Search failed. Check your connection and try again.</p>
        )}
        {showResults && results.length > 0 && (
          <ul className="search-results">
            {results.map(r => (
              <li
                key={r.collectionId}
                className="search-result-item"
                onMouseDown={() => selectResult(r)}
              >
                <img
                  src={r.artworkUrl100}
                  alt={r.collectionName}
                  className="search-result-art"
                />
                <div className="search-result-info">
                  <span className="search-result-title">{r.collectionName}</span>
                  <span className="search-result-artist">{r.artistName}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {showResults && !searching && results.length === 0 && (
          <p className="search-no-results">No results found. You can fill in the details below.</p>
        )}
      </div>

      <div className="form-divider">
        <span>Album details</span>
      </div>

      {/* Selected artwork preview */}
      {form.artworkUrl && (
        <div className="artwork-preview">
          <img src={form.artworkUrl} alt="Album artwork" />
          <button
            type="button"
            className="remove-artwork"
            onClick={() => setForm(prev => ({ ...prev, artworkUrl: '' }))}
            title="Remove artwork"
          >
            ✕
          </button>
        </div>
      )}

      <div className="form-row">
        <div className="field">
          <label className="field-label" htmlFor="title">Album Title *</label>
          <input
            id="title"
            name="title"
            placeholder="e.g. Blonde"
            value={form.title}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={LIMITS.title + 1}
            className={visibleErrors.title ? 'input-error' : ''}
          />
          {visibleErrors.title && (
            <span className="field-error">{visibleErrors.title}</span>
          )}
        </div>
        <div className="field">
          <label className="field-label" htmlFor="artist">Artist *</label>
          <input
            id="artist"
            name="artist"
            placeholder="e.g. Frank Ocean"
            value={form.artist}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={LIMITS.artist + 1}
            className={visibleErrors.artist ? 'input-error' : ''}
          />
          {visibleErrors.artist && (
            <span className="field-error">{visibleErrors.artist}</span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label className="field-label" htmlFor="genre">Genre</label>
          <select id="genre" name="genre" value={form.genre} onChange={handleChange}>
            <option value="">Select genre</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="rating-field">
          <span>Your rating:</span>
          <StarRating
            rating={form.rating}
            onRate={r => setForm(prev => ({ ...prev, rating: r }))}
          />
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="review">Review</label>
        <textarea
          id="review"
          name="review"
          placeholder="Write a review (optional)"
          value={form.review}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={3}
          className={visibleErrors.review ? 'input-error' : ''}
        />
        <div className="review-footer">
          {visibleErrors.review && (
            <span className="field-error">{visibleErrors.review}</span>
          )}
          <span className={`char-count ${reviewRemaining < 50 ? 'char-count-warn' : ''}`}>
            {reviewRemaining} / {LIMITS.review}
          </span>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit">Add Album</button>
        {hasContent && (
          <button type="button" className="clear-btn" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

export default AddAlbumForm;
