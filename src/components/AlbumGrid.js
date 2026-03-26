import { useState } from 'react';
import AlbumCard from './AlbumCard';
import FilterBar from './FilterBar';

function AlbumGrid({ albums, onDelete, onToggleFavorite, onUpdate }) {
  const [filters, setFilters] = useState({ genre: '', artist: '' });

  const filtered = albums.filter(a => {
    if (filters.genre && a.genre !== filters.genre) return false;
    if (filters.artist && a.artist !== filters.artist) return false;
    return true;
  });

  if (albums.length === 0) {
    return <p className="empty-state">No albums yet. Add your first album above!</p>;
  }

  return (
    <div>
      <FilterBar albums={albums} filters={filters} onFilterChange={setFilters} />
      {filtered.length === 0 ? (
        <p className="empty-state">No albums match your filters.</p>
      ) : (
        <div className="album-grid">
          {filtered.map(album => (
            <AlbumCard
              key={album.id}
              album={album}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AlbumGrid;
