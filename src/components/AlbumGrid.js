import { useState } from 'react';
import AlbumCard from './AlbumCard';
import FilterBar from './FilterBar';

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
  const [filters, setFilters] = useState({ genre: '', favoritesOnly: false, sortBy: '' });
  const [flipSignal, setFlipSignal] = useState(0);

  const filtered = albums.filter(a => {
    if (filters.genre && a.genre !== filters.genre) return false;
    if (filters.favoritesOnly && !a.favorite) return false;
    return true;
  });
  const visible = sortAlbums(filtered, filters.sortBy);

  const addTile = onAddClick && (
    <button
      type="button"
      className="add-album-trigger"
      onClick={onAddClick}
      aria-label="Add a new album to your library"
    >
      <span className="add-album-plus" aria-hidden="true">+</span>
      <span>Add Album</span>
    </button>
  );

  if (albums.length === 0) {
    return <div className="album-grid">{addTile}</div>;
  }

  return (
    <div>
      <FilterBar
        albums={albums}
        filters={filters}
        onFilterChange={setFilters}
        onFlipAll={() => setFlipSignal(s => s + 1)}
      />
      <div className="album-grid">
        {addTile}
        {visible.length === 0
          ? <p className="empty-state">No albums match your filters.</p>
          : visible.map(album => (
            <AlbumCard
              key={album.id}
              album={album}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onUpdate={onUpdate}
              flipSignal={flipSignal}
            />
          ))
        }
      </div>
    </div>
  );
}

export default AlbumGrid;
