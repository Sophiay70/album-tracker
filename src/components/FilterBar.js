function FilterBar({ albums, filters, onFilterChange }) {
  const genres = [...new Set(albums.map(a => a.genre).filter(Boolean))].sort();
  const artists = [...new Set(albums.map(a => a.artist).filter(Boolean))].sort();

  return (
    <div className="filter-bar">
      <select
        value={filters.genre}
        onChange={e => onFilterChange({ ...filters, genre: e.target.value })}
      >
        <option value="">All genres</option>
        {genres.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      <select
        value={filters.artist}
        onChange={e => onFilterChange({ ...filters, artist: e.target.value })}
      >
        <option value="">All artists</option>
        {artists.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      {(filters.genre || filters.artist) && (
        <button
          className="clear-filters"
          onClick={() => onFilterChange({ genre: '', artist: '' })}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default FilterBar;
