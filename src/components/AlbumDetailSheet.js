import Modal from './ui/Modal';
import Button from './ui/Button';
import AlbumSleeve from './ui/AlbumSleeve';
import FavoriteButton from './ui/FavoriteButton';
import { EditIcon, StarOutlineIcon, TrashIcon } from './ui/Icons';
import StarRating from './StarRating';
import { formatDate } from '../utils/albumStats';

// Phone replacement for the card flip: everything on the card's back, at a
// readable size, in a bottom sheet.
function AlbumDetailSheet({ album, onClose, onToggleFavorite, onEdit, onDelete }) {
  const date = formatDate(album.dateAdded);

  return (
    <Modal open onClose={onClose} ariaLabel={`${album.title} by ${album.artist}`} className="detail-sheet">
      <div className="detail-sheet-hero sleeve-host">
        <AlbumSleeve album={album} revealed size={300} />
      </div>
      <div className="detail-sheet-head">
        <div className="detail-sheet-meta">
          <h2 className="detail-sheet-title">{album.title}</h2>
          <p className="detail-sheet-artist">{album.artist}</p>
        </div>
        <FavoriteButton favorite={album.favorite} title={album.title} onToggle={() => onToggleFavorite(album.id)} />
      </div>
      <StarRating rating={album.rating} readOnly size={20} />
      {album.review
        ? <blockquote className="detail-sheet-quote">“{album.review}”</blockquote>
        : <p className="album-card-noreview">No review yet.</p>}
      <div className="review-card-tags detail-sheet-tags">
        {album.genre && <span className="pill-tag">{album.genre}</span>}
        <span>{date || 'Unknown date'}</span>
      </div>
      <div className="dialog-actions detail-sheet-actions">
        <Button variant="glass" icon={<EditIcon size={17} />} onClick={() => onEdit(album, 'review')}>
          {album.review ? 'Edit review' : 'Write review'}
        </Button>
        <Button variant="glass" icon={<StarOutlineIcon size={17} />} onClick={() => onEdit(album, 'rating')}>
          Re-rate
        </Button>
        <Button variant="ghost" className="btn-danger-text" icon={<TrashIcon size={17} />} onClick={() => onDelete(album)}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

export default AlbumDetailSheet;
