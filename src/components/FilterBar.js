const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Title (A–Z)' },
  { value: 'artist-asc', label: 'Artist (A–Z)' },
  { value: 'rating-desc', label: 'Rating (High to Low)' },
  { value: 'rating-asc', label: 'Rating (Low to High)' },
  { value: 'date-desc', label: 'Date Added (Newest First)' },
];

function FilterBar({ albums, filters, onFilterChange, onFlipAll }) {
  const genres = [...new Set(albums.map(a => a.genre).filter(Boolean))].sort();
  const hasActiveFilters = filters.genre || filters.favoritesOnly || filters.sortBy;

  return (
    <div className="filter-bar">
      <button type="button" className="flip-all-btn" onClick={onFlipAll}>
        ⟲ Flip Cards
      </button>

      <select
        value={filters.genre}
        onChange={e => onFilterChange({ ...filters, genre: e.target.value })}
      >
        <option value="">All genres</option>
        {genres.map(g => <option key={g} value={g}>{g}</option>)}
      </select>

      <button
        type="button"
        className={`filter-toggle ${filters.favoritesOnly ? 'active' : ''}`}
        onClick={() => onFilterChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
      >
        ♥ Favorites only
      </button>

      <select
        value={filters.sortBy}
        onChange={e => onFilterChange({ ...filters, sortBy: e.target.value })}
      >
        <option value="">Sort by...</option>
        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {hasActiveFilters && (
        <button
          className="clear-filters"
          onClick={() => onFilterChange({ genre: '', favoritesOnly: false, sortBy: '' })}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default FilterBar;
