function Hero({ albums, onGoToLibrary }) {
    const totalAlbums = albums.length;
const favoriteCount = albums.filter(a => a.favorite).length;
const avgRating = totalAlbums === 0 ? 0 : albums.reduce((sum, album) => sum + album.rating, 0) / totalAlbums;

  return (
  <div className="hero">
    {/*Music Notes */}
    <span className="note note-1">♪</span>
<span className="note note-2">♫</span>
<span className="note note-3">♫</span>
<span className="note note-4">♪</span>
<span className="note note-5">♪</span>
<span className="note note-6">♫</span>
<span className="note note-7">♪</span>
    <span className="note note-8">♫</span>
    <span className="note note-9">♪</span>
    <span className="note note-10">♫</span>
    <span className="note note-11">♪</span>
    <span className="note note-12">♫</span>
    <h2>Your Vault</h2>
    <p>Track every album you own, rate it, write a review, and revisit your collection anytime.</p>
    {/*button to library after hero banner*/}
<button className="hero-cta" onClick={onGoToLibrary}>
  Add your records
</button>

    <div className="hero-stats">
      <div className="stat">
        <span className="stat-number">{totalAlbums}</span>
        <span className="stat-label">Albums Logged</span>
      </div>
      <div className="stat">
        <span className="stat-number">{avgRating.toFixed(1)}</span>
        <span className="stat-label">Avg Rating</span>
      </div>
      <div className="stat">
        <span className="stat-number">{favoriteCount}</span>
        <span className="stat-label">Favorites</span>
      </div>
    </div>
  </div>
);
}

export default Hero;