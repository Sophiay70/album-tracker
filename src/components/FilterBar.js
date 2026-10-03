import GlassPanel from './ui/GlassPanel';
import Chip from './ui/Chip';
import Button from './ui/Button';
import { FlipIcon, HeartIcon, SearchIcon } from './ui/Icons';

const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Title (A–Z)' },
  { value: 'artist-asc', label: 'Artist (A–Z)' },
  { value: 'rating-desc', label: 'Rating (High to Low)' },
  { value: 'rating-asc', label: 'Rating (Low to High)' },
  { value: 'date-desc', label: 'Date Added (Newest First)' },
];

export const EMPTY_FILTERS = { query: '', genre: '', favoritesOnly: false, sortBy: '' };

// Glass toolbar above the library grid: search, genre chips, favorites,
// sort, and "Flip cards".
function FilterBar({ albums, filters, onFilterChange, onFlipAll, flipLabel = 'Flip cards', shown }) {
  const genres = [...new Set(albums.map(a => a.genre).filter(Boolean))].sort();
  const hasActiveFilters = filters.query || filters.genre || filters.favoritesOnly || filters.sortBy;
  const set = (changes) => onFilterChange({ ...filters, ...changes });

  return (
    <GlassPanel className="library-toolbar">
      <div className="library-toolbar-row">
        <div className="library-search">
          <label htmlFor="library-search" className="visually-hidden">Search your library</label>
          <SearchIcon size={18} className="library-search-icon" />
          <input
            id="library-search"
            type="search"
            className="vv-input"
            placeholder="Search titles or artists"
            value={filters.query}
            onChange={e => set({ query: e.target.value })}
          />
        </div>

        <div className="library-sort">
          <label htmlFor="library-sort" className="visually-hidden">Sort by</label>
          <select
            id="library-sort"
            className="vv-input"
            value={filters.sortBy}
            onChange={e => set({ sortBy: e.target.value })}
          >
            <option value="">Sort by…</option>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <Button
          variant="ghost"
          className="library-flip"
          icon={<FlipIcon size={17} />}
          onClick={onFlipAll}
        >
          {flipLabel}
        </Button>
      </div>

      <div className="library-toolbar-row library-chips" role="group" aria-label="Filter by genre">
        <Chip pressed={!filters.genre} onClick={() => set({ genre: '' })}>All</Chip>
        {genres.map(g => (
          <Chip key={g} pressed={filters.genre === g} onClick={() => set({ genre: filters.genre === g ? '' : g })}>
            {g}
          </Chip>
        ))}
        <Chip
          className="chip-fav"
          pressed={filters.favoritesOnly}
          onClick={() => set({ favoritesOnly: !filters.favoritesOnly })}
        >
          <HeartIcon size={15} filled={filters.favoritesOnly} /> Favorites
        </Chip>
      </div>

      <div className="library-toolbar-status">
        <p aria-live="polite">
          {hasActiveFilters ? `Showing ${shown} of ${albums.length}` : `${albums.length} ${albums.length === 1 ? 'album' : 'albums'}`}
        </p>
        {hasActiveFilters && (
          <button type="button" className="text-link" onClick={() => onFilterChange(EMPTY_FILTERS)}>
            Clear filters
          </button>
        )}
      </div>
    </GlassPanel>
  );
}

export default FilterBar;
