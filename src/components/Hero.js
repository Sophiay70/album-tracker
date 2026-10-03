import GlassPanel from './ui/GlassPanel';
import Button from './ui/Button';
import AlbumSleeve from './ui/AlbumSleeve';
import Record from './ui/Record';
import StarRating from './StarRating';
import { useAlbumPalette } from '../hooks/useAlbumPalette';
import { greeting } from '../utils/albumStats';
import { pastelFor } from '../utils/albumColors';

function NowSpinning({ album, onAddClick }) {
  const palette = useAlbumPalette(album);

  if (!album) {
    return (
      <GlassPanel strong className="now-spinning now-spinning-empty">
        <p className="eyebrow">Nothing spinning yet</p>
        <div className="now-spinning-empty-record">
          <Record spinning labelColor="var(--amber)" />
        </div>
        <p className="now-spinning-empty-copy">Log your first album and it'll show up here.</p>
        <Button onClick={onAddClick}>Log an album</Button>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel strong as="section" className="now-spinning sleeve-host" aria-label="Now spinning">
      <div className="now-spinning-top">
        <p className="eyebrow now-spinning-live">
          <span className="live-dot" aria-hidden="true" />
          Now spinning
        </p>
        <span className="now-spinning-note">{album.favorite ? 'Latest favorite' : 'Latest log'}</span>
      </div>
      <AlbumSleeve
        album={album}
        className="now-spinning-sleeve"
        spinning
        revealed
        eager
        labelColor={palette?.[1] || palette?.[0] || pastelFor(album)}
      />
      <div className="now-spinning-info">
        <div className="now-spinning-text">
          <p className="now-spinning-title">{album.title}</p>
          <p className="now-spinning-artist">{album.artist}</p>
        </div>
        <StarRating rating={album.rating} readOnly size={18} />
      </div>
    </GlassPanel>
  );
}

function Hero({ featured, onGoToLibrary, onAddClick }) {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-copy">
        <p className="eyebrow">{greeting()}</p>
        <h1 id="home-title" className="home-hero-title">
          Your Vault,<br /><em>spinning.</em>
        </h1>
        <p className="home-hero-lede">
          Rate the albums you love, write reviews, and build a digital shelf of your record collection.
        </p>
        <div className="home-hero-actions">
          <Button variant="dark" size="lg" onClick={onAddClick}>Log an album</Button>
          <Button variant="glass" size="lg" onClick={onGoToLibrary}>Browse library</Button>
        </div>
      </div>
      <NowSpinning album={featured} onAddClick={onAddClick} />
    </section>
  );
}

export default Hero;
