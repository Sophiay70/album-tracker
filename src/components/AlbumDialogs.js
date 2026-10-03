import { useId, useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import StarRating from './StarRating';

const REVIEW_LIMIT = 2000;

// Edit sheet for an album's rating and review. mode 'rating' (Re-rate)
// shows only the stars; mode 'review' shows both.
function EditAlbumSheet({ album, mode, onSave, onClose }) {
  const [rating, setRating] = useState(album.rating || 0);
  const [review, setReview] = useState(album.review || '');
  const reviewId = useId();

  function handleSubmit(e) {
    e.preventDefault();
    const changes = mode === 'rating' ? { rating } : { rating, review: review.trim() };
    onSave(album.id, changes);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={mode === 'rating' ? 'Re-rate' : 'Edit review'}>
      <p className="dialog-subject">
        <strong>{album.title}</strong> · {album.artist}
      </p>
      <form className="dialog-form" onSubmit={handleSubmit}>
        <div className="vv-field">
          <span className="vv-label" aria-hidden="true">Your rating</span>
          <StarRating rating={rating} onRate={setRating} label="Your rating" size={30} />
        </div>
        {mode !== 'rating' && (
          <div className="vv-field">
            <label className="vv-label" htmlFor={reviewId}>Review</label>
            <textarea
              id={reviewId}
              className="vv-input"
              rows={6}
              maxLength={REVIEW_LIMIT}
              value={review}
              placeholder="Write a review (optional)"
              onChange={e => setReview(e.target.value)}
            />
            <span className="char-count">{REVIEW_LIMIT - review.length} / {REVIEW_LIMIT}</span>
          </div>
        )}
        <div className="dialog-actions">
          <Button type="submit">Save</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteAlbumSheet({ album, onDelete, onClose }) {
  return (
    <Modal open onClose={onClose} title="Remove album?">
      <p className="dialog-copy">
        Remove <strong>{album.title}</strong> by {album.artist} from your library? Its rating and review will be deleted too.
      </p>
      <div className="dialog-actions">
        <Button variant="danger" onClick={() => { onDelete(album.id); onClose(); }}>Remove</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
}

// One place to drive the edit / re-rate / delete sheets from any list.
// const { openEdit, openDelete, dialogs } = useAlbumDialogs({ onUpdate, onDelete })
export function useAlbumDialogs({ onUpdate, onDelete }) {
  const [state, setState] = useState(null); // { album, kind: 'review' | 'rating' | 'delete' }
  const close = () => setState(null);

  const dialogs = !state ? null : state.kind === 'delete' ? (
    <DeleteAlbumSheet album={state.album} onDelete={onDelete} onClose={close} />
  ) : (
    <EditAlbumSheet key={state.album.id + state.kind} album={state.album} mode={state.kind} onSave={onUpdate} onClose={close} />
  );

  return {
    openEdit: (album, mode = 'review') => setState({ album, kind: mode }),
    openDelete: (album) => setState({ album, kind: 'delete' }),
    dialogs,
  };
}
