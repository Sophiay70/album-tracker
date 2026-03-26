import { useState } from 'react';
import StarRating from './StarRating';

function AlbumCard({ album, onDelete, onToggleFavorite, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(album.rating);
  const [editReview, setEditReview] = useState(album.review || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  return (
    <div className={`album-card ${isEditing ? 'is-editing' : ''}`}>
      <div className="album-card-header">
        <div className="album-placeholder">
          {album.artworkUrl
            ? <img src={album.artworkUrl} alt={`${album.title} cover`} />
            : <span>♫</span>
          }
        </div>
        <div className="album-info">
          <h3 className="album-title">{album.title}</h3>
          <p className="album-artist">{album.artist}</p>
          {album.genre && <span className="album-genre">{album.genre}</span>}
        </div>
        <div className="album-actions">
          <button
            className={`fav-btn ${album.favorite ? 'favorited' : ''}`}
            onClick={() => onToggleFavorite(album.id)}
            title={album.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            ♥
          </button>
          <button
            className="edit-btn"
            onClick={handleEditClick}
            title="Edit rating and review"
          >
            ✎
          </button>
          <button
            className="delete-btn"
            onClick={() => { setConfirmDelete(true); setIsEditing(false); }}
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
            maxLength={501}
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
        <>
          <StarRating rating={album.rating} readOnly />
          {album.review && <p className="album-review">"{album.review}"</p>}
        </>
      )}

      <p className="album-date">
        {album.dateAdded && !isNaN(new Date(album.dateAdded))
          ? new Date(album.dateAdded).toLocaleDateString()
          : 'Unknown date'}
      </p>
    </div>
  );
}

export default AlbumCard;
