import { useState, useEffect, useRef } from 'react';
import StarRating from './StarRating';

// Deterministic hash so each album's vinyl label color stays the same across
// re-renders/reloads instead of flickering to a new color each time.
function hashHue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function AlbumCard({ album, onDelete, onToggleFavorite, onUpdate, flipSignal }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(album.rating);
  const [editReview, setEditReview] = useState(album.review || '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const lastFlipSignal = useRef(flipSignal);

  // "Flip Cards" in the filter bar bumps flipSignal to flip every card at
  // once. Compare against the last value actually handled (rather than a
  // simple "first render" flag) so this doesn't misfire under React Strict
  // Mode, which intentionally re-runs effects once on mount in development.
  useEffect(() => {
    if (flipSignal === lastFlipSignal.current) return;
    lastFlipSignal.current = flipSignal;
    setIsFlipped(prev => !prev);
  }, [flipSignal]);

  function handleSave() {
    onUpdate(album.id, { rating: editRating, review: editReview.trim() });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setEditRating(album.rating);
    setEditReview(album.review || '');
    setIsEditing(false);
  }

  function handleEditClick() {
    setEditRating(album.rating);
    setEditReview(album.review || '');
    setConfirmDelete(false);
    setIsEditing(true);
  }

  function handleFlipToBack() {
    setIsFlipped(true);
  }

  function handleFlipToFront() {
    setIsFlipped(false);
  }

  function handleFrontKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlipToBack();
    }
  }

  function handleBackKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlipToFront();
    }
  }

  const recordColor = `hsl(${hashHue(String(album.id ?? album.title))}, 65%, 72%)`;

  return (
    <div className="album-card-flip">
      <div className={`album-card ${isFlipped ? 'is-flipped' : ''}`}>
        <div
          className="album-card-front"
          role="button"
          tabIndex={0}
          aria-label={`Show details for ${album.title}`}
          onClick={handleFlipToBack}
          onKeyDown={handleFrontKeyDown}
        >
          <div className="album-cover">
            <span
              className="vinyl-disc"
              style={{ '--record-color': recordColor }}
              aria-hidden="true"
            ></span>
            <div className="album-placeholder">
              {album.artworkUrl
                ? <img src={album.artworkUrl} alt={`${album.title} cover`} />
                : <span>♫</span>
              }
            </div>
          </div>
          <h3 className="front-title">{album.title}</h3>
          <StarRating rating={album.rating} readOnly />
        </div>

        <div
          className={`album-card-back ${isEditing ? 'is-editing' : ''}`}
          onClick={!isEditing && !confirmDelete ? handleFlipToFront : undefined}
          role={!isEditing && !confirmDelete ? 'button' : undefined}
          tabIndex={!isEditing && !confirmDelete ? 0 : undefined}
          aria-label={!isEditing && !confirmDelete ? `Back to cover for ${album.title}` : undefined}
          onKeyDown={!isEditing && !confirmDelete ? handleBackKeyDown : undefined}
        >
          <button
            className="flip-back-btn"
            onClick={(e) => { e.stopPropagation(); handleFlipToFront(); }}
            title="Back to cover"
          >
            ↺
          </button>

          {/* Scrolling lives on this inner wrapper rather than .album-card-back
              itself: WebKit fails to honor backface-visibility: hidden on an
              element that also has overflow-y set, which left the front cover
              visibly stacked on top of the flipped card on mobile Safari. */}
          <div className="album-card-back-content">
            <div className="album-card-header">
              <div className="album-info">
                <h3 className="album-title">{album.title}</h3>
                <p className="album-artist">{album.artist}</p>
                {album.genre && <span className="album-genre">{album.genre}</span>}
              </div>
              <div className="album-actions">
                <button
                  className={`fav-btn ${album.favorite ? 'favorited' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(album.id); }}
                  title={album.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  ♥
                </button>
                <button
                  className="edit-btn"
                  onClick={(e) => { e.stopPropagation(); handleEditClick(); }}
                  title="Edit rating and review"
                >
                  ✎
                </button>
                <button
                  className="delete-btn"
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); setIsEditing(false); }}
                  title="Delete album"
                >
                  ✕
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="card-edit-form">
                <label className="card-edit-label">Rating</label>
                <StarRating rating={editRating} onRate={setEditRating} />
                <label className="card-edit-label">Review</label>
                <textarea
                  className="card-edit-textarea"
                  value={editReview}
                  onChange={e => setEditReview(e.target.value)}
                  placeholder="Write a review (optional)"
                  rows={3}
                  maxLength={2000}
                />
                <div className="card-edit-actions">
                  <button className="card-save-btn" onClick={handleSave}>Save</button>
                  <button className="card-cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                </div>
              </div>
            ) : confirmDelete ? (
              <div className="delete-confirm">
                <p>Remove <strong>{album.title}</strong> from your library?</p>
                <div className="delete-confirm-actions">
                  <button className="delete-confirm-btn" onClick={() => onDelete(album.id)}>Remove</button>
                  <button className="card-cancel-btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              album.review && <p className="album-review">"{album.review}"</p>
            )}

            <p className="album-date">
              {album.dateAdded && !isNaN(new Date(album.dateAdded))
                ? new Date(album.dateAdded).toLocaleDateString()
                : 'Unknown date'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlbumCard;
