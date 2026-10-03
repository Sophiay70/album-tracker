import { useState } from 'react';
import AlbumCard from './AlbumCard';
import FilterBar, { EMPTY_FILTERS } from './FilterBar';
import { useAlbumDialogs } from './AlbumDialogs';
import AlbumDetailSheet from './AlbumDetailSheet';
import ReviewCard from './ReviewCard';
import { PlusIcon } from './ui/Icons';
import { useMediaQuery } from '../hooks/useMediaQuery';

function sortAlbums(list, sortBy) {
  const sorted = [...list];
  switch (sortBy) {
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'artist-asc':
      return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
    case 'rating-desc':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'rating-asc':
      return sorted.sort((a, b) => a.rating - b.rating);
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    default:
      return sorted;
  }
}

function AlbumGrid({ albums, onDelete, onToggleFavorite, onUpdate, onAddClick }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [flipSignal, setFlipSignal] = useState(0);
  const { openEdit, openDelete, dialogs } = useAlbumDialogs({ onUpdate, onDelete });
  // Phones don't flip cards (a flipped half-width card is too cramped to
  // read): a tap opens a detail sheet, and "Flip cards" becomes a toggle
  // between the cover grid and a full-width list of review cards.
  const isPhone = useMediaQuery('(max-width: 760px)');
  const [showReviews, setShowReviews] = useState(false);
  const [openId, setOpenId] = useState(null);
  const openAlbum = albums.find(a => a.id === openId);

  // Leave the detail sheet before stacking an edit/delete sheet on top.
  const editFromSheet = (album, mode) => { setOpenId(null); openEdit(album, mode); };
  const deleteFromSheet = (album) => { setOpenId(null); openDelete(album); };

  const query = filters.query.trim().toLowerCase();
  const filtered = albums.filter(a => {
    if (filters.genre && a.genre !== filters.genre) return false;
    if (filters.favoritesOnly && !a.favorite) return false;
    if (query && !`${a.title} ${a.artist}`.toLowerCase().includes(query)) return false;
    return true;
  });
  const visible = sortAlbums(filtered, filters.sortBy);

  const addTile = onAddClick && (
    <li className="library-item">
      <button
        type="button"
        className="add-album-trigger library-add-tile"
        onClick={onAddClick}
        aria-label="Add a new album to your library"
      >
        <span className="add-album-plus" aria-hidden="true"><PlusIcon size={28} /></span>
        <span>Add album</span>
      </button>
    </li>
  );

  if (albums.length === 0) {
    return (
      <div className="library-empty">
        <ul className="library-grid">{addTile}</ul>
        <p className="empty-state">Your shelf is empty. Log your first record to start your collection.</p>
      </div>
    );
  }

  return (
    <div>
      <FilterBar
        albums={albums}
        filters={filters}
        onFilterChange={setFilters}
        onFlipAll={isPhone ? () => setShowReviews(v => !v) : () => setFlipSignal(s => s + 1)}
        flipLabel={isPhone ? (showReviews ? 'Show covers' : 'Show reviews') : 'Flip cards'}
        shown={visible.length}
      />
      {isPhone && showReviews ? (
        <div className="review-grid library-review-list">
          {visible.map(album => (
            <ReviewCard
              key={album.id}
              album={album}
              onToggleFavorite={onToggleFavorite}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      ) : (
        <ul className="library-grid">
          {addTile}
          {visible.map(album => (
            <li key={album.id} className="library-item">
              <AlbumCard
                album={album}
                onToggleFavorite={onToggleFavorite}
                onEdit={openEdit}
                onDelete={openDelete}
                flipSignal={flipSignal}
                onOpen={isPhone ? () => setOpenId(album.id) : undefined}
              />
            </li>
          ))}
        </ul>
      )}
      {visible.length === 0 && (
        <p className="empty-state">No albums match your filters.</p>
      )}
      {openAlbum && (
        <AlbumDetailSheet
          album={openAlbum}
          onClose={() => setOpenId(null)}
          onToggleFavorite={onToggleFavorite}
          onEdit={editFromSheet}
          onDelete={deleteFromSheet}
        />
      )}
      {dialogs}
    </div>
  );
}

export default AlbumGrid;
