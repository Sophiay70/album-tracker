import FavoriteButton from './ui/FavoriteButton';
import OverflowMenu from './ui/OverflowMenu';
import { EditIcon, StarOutlineIcon, TrashIcon } from './ui/Icons';
import StarRating from './StarRating';
import { coverUrlFor, placeholderCoverFor } from '../utils/albumColors';
import { formatDate } from '../utils/albumStats';

// Glass review card: cover thumb, title/artist, favorite heart (always
// visible), the review as a serif quote, genre + date, and a "•••" menu
// with Edit / Re-rate / Delete (hover-revealed on desktop, always on touch).
function ReviewCard({ album, onToggleFavorite, onEdit, onDelete, className = '' }) {
  const art = coverUrlFor(album);

  return (
    <article className={`review-card glass ${className}`.trim()}>
      <div className="review-card-head">
        <div
          className="review-card-thumb"
          style={art ? undefined : { background: placeholderCoverFor(album) }}
        >
          {art && <img src={art} alt="" loading="lazy" decoding="async" width="56" height="56" />}
        </div>
        <div className="review-card-meta">
          <h3 className="review-card-title" title={album.title}>{album.title}</h3>
          <p className="review-card-artist">{album.artist}</p>
        </div>
        <FavoriteButton
          favorite={album.favorite}
          title={album.title}
          onToggle={() => onToggleFavorite(album.id)}
        />
      </div>

      <StarRating rating={album.rating} readOnly size={15} />

      {album.review && <blockquote className="review-card-quote">“{album.review}”</blockquote>}

      <div className="review-card-foot">
        <div className="review-card-tags">
          {album.genre && <span className="pill-tag">{album.genre}</span>}
          {album.dateAdded && (
            <time dateTime={album.dateAdded}>{formatDate(album.dateAdded)}</time>
          )}
        </div>
        <OverflowMenu
          className="review-card-actions"
          label={`Actions for ${album.title}`}
          opensUp
          items={[
            { label: album.review ? 'Edit review' : 'Write review', icon: <EditIcon size={18} />, onSelect: () => onEdit(album, 'review') },
            { label: 'Re-rate', icon: <StarOutlineIcon size={18} />, onSelect: () => onEdit(album, 'rating') },
            { label: 'Delete', icon: <TrashIcon size={18} />, danger: true, onSelect: () => onDelete(album) },
          ]}
        />
      </div>
    </article>
  );
}

export default ReviewCard;
