import Hero from './Hero';
import GlassPanel from './ui/GlassPanel';
import AlbumSleeve from './ui/AlbumSleeve';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';
import SuggestedAlbums from './SuggestedAlbums';
import { useAlbumDialogs } from './AlbumDialogs';
import { averageRating, sortByRecent, topGenre } from '../utils/albumStats';

function StatTile({ value, label, serif = false }) {
  return (
    <GlassPanel className="stat-tile">
      <div className={serif ? 'stat-tile-value is-serif' : 'stat-tile-value'}>{value}</div>
      <div className="stat-tile-label">{label}</div>
    </GlassPanel>
  );
}

function SectionHead({ title, id, linkLabel, onLink }) {
  return (
    <div className="section-head">
      <h2 className="section-title" id={id}>{title}</h2>
      {onLink && (
        <button type="button" className="text-link" onClick={onLink}>
          {linkLabel} <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  );
}

function Home({ albums, featured, onAdd, onAddClick, onGoToLibrary, onToggleFavorite, onUpdate, onDelete }) {
  const { openEdit, openDelete, dialogs } = useAlbumDialogs({ onUpdate, onDelete });

  const recent = sortByRecent(albums);
  const reviews = recent.filter(a => a.review && a.review.trim()).slice(0, 4);
  const favoriteCount = albums.filter(a => a.favorite).length;
  const genre = topGenre(albums);

  return (
    <div className="home">
      <Hero featured={featured} onGoToLibrary={onGoToLibrary} onAddClick={onAddClick} />

      <section aria-label="Your stats" className="stat-row">
        <StatTile value={albums.length} label={albums.length === 1 ? 'Album logged' : 'Albums logged'} />
        <StatTile
          value={<>{averageRating(albums).toFixed(1)}<span className="stat-tile-unit"> / 5</span></>}
          label="Average rating"
        />
        <StatTile value={favoriteCount} label={favoriteCount === 0 ? 'Favorites · tap a heart to add' : 'Favorites'} />
        <StatTile value={genre || '—'} label="Your top genre" serif />
      </section>

      <SuggestedAlbums albums={albums} onAdd={onAdd} />

      {recent.length > 0 && (
        <section className="home-section" aria-labelledby="recent-title">
          <SectionHead
            id="recent-title"
            title="Recently spun"
            linkLabel={`See all ${albums.length}`}
            onLink={onGoToLibrary}
          />
          <ul className="sleeve-grid">
            {recent.slice(0, 4).map(album => (
              <li key={album.id} className="sleeve-card sleeve-host">
                <AlbumSleeve album={album} />
                <p className="sleeve-card-title" title={album.title}>{album.title}</p>
                <p className="sleeve-card-artist">{album.artist}</p>
                <StarRating rating={album.rating} readOnly />
              </li>
            ))}
          </ul>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="home-section" aria-labelledby="reviews-title">
          <SectionHead id="reviews-title" title="Your latest reviews" linkLabel="All reviews" onLink={onGoToLibrary} />
          <div className="review-grid">
            {reviews.map(album => (
              <ReviewCard
                key={album.id}
                album={album}
                className="is-clamped"
                onToggleFavorite={onToggleFavorite}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}
          </div>
        </section>
      )}

      {dialogs}
    </div>
  );
}

export default Home;
