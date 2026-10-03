import { useState, useEffect, useRef } from 'react';
import StarRating from './StarRating';
import AlbumSleeve from './ui/AlbumSleeve';
import FavoriteButton from './ui/FavoriteButton';
import OverflowMenu from './ui/OverflowMenu';
import { IconButton } from './ui/Button';
import { EditIcon, FlipIcon, HeartIcon, StarOutlineIcon, TrashIcon } from './ui/Icons';
import { formatDate } from '../utils/albumStats';

// Flip card: front = album sleeve + title/artist/stars, back = review details.
// The hidden face is `inert` so it can't be tabbed into or read out.
// With `onOpen` (phones), the card is just the front: tapping it calls
// onOpen instead of flipping.
function AlbumCard({ album, onToggleFavorite, onEdit, onDelete, flipSignal, onOpen }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const lastFlipSignal = useRef(flipSignal);
  const frontRef = useRef(null);
  const backBtnRef = useRef(null);
  const focusAfterFlip = useRef(null);

  // "Flip cards" in the toolbar bumps flipSignal to flip every card at
  // once. Compare against the last value actually handled (rather than a
  // simple "first render" flag) so this doesn't misfire under React Strict
  // Mode, which intentionally re-runs effects once on mount in development.
  useEffect(() => {
    if (flipSignal === lastFlipSignal.current) return;
    lastFlipSignal.current = flipSignal;
    setIsFlipped(prev => !prev);
  }, [flipSignal]);

  // Only move focus when the user flipped this card themselves.
  useEffect(() => {
    const target = focusAfterFlip.current;
    focusAfterFlip.current = null;
    if (target === 'back') backBtnRef.current?.focus();
    if (target === 'front') frontRef.current?.focus();
  }, [isFlipped]);

  function flip(toBack) {
    focusAfterFlip.current = toBack ? 'back' : 'front';
    setIsFlipped(toBack);
  }

  const date = formatDate(album.dateAdded);
  const front = (
    <>
      <AlbumSleeve album={album} />
      <span className="album-card-front-text">
        <span className="sleeve-card-title">{album.title}</span>
        <span className="sleeve-card-artist">{album.artist}</span>
        <span className="album-card-front-rating">
          <StarRating rating={album.rating} readOnly />
          {album.favorite && <HeartIcon filled size={15} className="album-card-front-fav" />}
        </span>
      </span>
    </>
  );
  const frontLabel = `${album.title} by ${album.artist}${album.favorite ? ', favorite' : ''}. Show details`;

  if (onOpen) {
    return (
      <button type="button" className="album-tile sleeve-host" aria-label={frontLabel} onClick={onOpen}>
        {front}
      </button>
    );
  }

  return (
    <div className="album-card-flip">
      <div className={`album-card ${isFlipped ? 'is-flipped' : ''}`}>
        <button
          ref={frontRef}
          type="button"
          className="album-card-front sleeve-host"
          aria-label={frontLabel}
          inert={isFlipped ? true : undefined}
          onClick={() => flip(true)}
        >
          {front}
        </button>

        <div className="album-card-back" inert={isFlipped ? undefined : true}>
          <div className="album-card-back-head">
            <div className="album-card-back-meta">
              <h3 className="review-card-title" title={album.title}>{album.title}</h3>
              <p className="review-card-artist">{album.artist}</p>
            </div>
            <IconButton
              ref={backBtnRef}
              label={`Back to cover for ${album.title}`}
              onClick={() => flip(false)}
            >
              <FlipIcon size={18} />
            </IconButton>
          </div>

          {/* Scrolling lives on this inner wrapper rather than .album-card-back
              itself: WebKit fails to honor backface-visibility: hidden on an
              element that also has overflow-y set, which left the front cover
              visibly stacked on top of the flipped card on mobile Safari. */}
          <div className="album-card-back-content">
            <StarRating rating={album.rating} readOnly size={15} />
            {album.review
              ? <blockquote className="album-card-quote">“{album.review}”</blockquote>
              : <p className="album-card-noreview">No review yet.</p>}
          </div>

          <div className="album-card-back-foot">
            <div className="review-card-tags">
              {album.genre && <span className="pill-tag">{album.genre}</span>}
              <span>{date || 'Unknown date'}</span>
            </div>
            <div className="album-card-back-actions">
              <FavoriteButton
                favorite={album.favorite}
                title={album.title}
                onToggle={() => onToggleFavorite(album.id)}
              />
              <OverflowMenu
                label={`Actions for ${album.title}`}
                opensUp
                items={[
                  { label: album.review ? 'Edit review' : 'Write review', icon: <EditIcon size={18} />, onSelect: () => onEdit(album, 'review') },
                  { label: 'Re-rate', icon: <StarOutlineIcon size={18} />, onSelect: () => onEdit(album, 'rating') },
                  { label: 'Delete', icon: <TrashIcon size={18} />, danger: true, onSelect: () => onDelete(album) },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlbumCard;
