import { useState, useEffect } from 'react';
import { fetchVinylImage } from '../services/discogs';

const MAX_INDUCTEES = 5;

function HallOfFame({ albums, onUpdate }) {
  const [selectedId, setSelectedId] = useState('');

  const inductees = albums.filter(a => a.hallOfFame);
  const candidates = albums.filter(a => !a.hallOfFame);
  const isFull = inductees.length >= MAX_INDUCTEES;
  const inducteeIds = inductees.map(a => a.id).join(',');

  // Resolve each inducted album's vinyl photo and cover art once, then save
  // the result onto the album itself (vinylImageUrl / resolvedCoverUrl).
  // Without this, reloading the page would re-run the Discogs search and
  // Gemini classification from scratch every time — and since neither is
  // perfectly deterministic, that could silently swap in a different photo
  // on every visit. Caching the result makes it permanent instead.
  useEffect(() => {
    let cancelled = false;

    const needsVinyl = albums.filter(a => a.hallOfFame && a.vinylImageUrl === undefined);
    needsVinyl.forEach(album => {
      fetchVinylImage({ title: album.title, artist: album.artist })
        .then(url => {
          if (!cancelled) onUpdate(album.id, { vinylImageUrl: url });
        })
        .catch(() => {
          if (!cancelled) onUpdate(album.id, { vinylImageUrl: null });
        });
    });

    const needsCover = albums.filter(
      a => a.hallOfFame && !a.artworkUrl && a.resolvedCoverUrl === undefined
    );
    needsCover.forEach(album => {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(`${album.artist} ${album.title}`)}&entity=album&media=music&limit=1&country=us`;
      fetch(url)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          const art = data?.results?.[0]?.artworkUrl100 || null;
          if (!cancelled) onUpdate(album.id, { resolvedCoverUrl: art });
        })
        .catch(() => {
          if (!cancelled) onUpdate(album.id, { resolvedCoverUrl: null });
        });
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inducteeIds]);

  function handleInduct() {
    if (!selectedId || isFull) return;
    onUpdate(selectedId, { hallOfFame: true });
    setSelectedId('');
  }

  function handleRetire(id) {
    onUpdate(id, { hallOfFame: false });
  }

  if (albums.length === 0) {
    return (
      <p className="empty-state">
        Add albums to your library first, then induct your all-time favorites here.
      </p>
    );
  }

  return (
    <div className="hof-section">
      <p className="hof-intro">
        Enshrine up to {MAX_INDUCTEES} albums as your all-time favorites — framed like the
        plaques artists get for gold and platinum records.
      </p>

      {isFull ? (
        <p className="hof-full-note">Your Hall of Fame is full — retire one to induct another.</p>
      ) : (
        <div className="hof-picker">
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <option value="">Choose an album...</option>
            {candidates.map(a => (
              <option key={a.id} value={a.id}>{a.title} — {a.artist}</option>
            ))}
          </select>
          <button
            type="button"
            className="personality-btn"
            onClick={handleInduct}
            disabled={!selectedId}
          >
            🏆 Induct
          </button>
        </div>
      )}

      {inductees.length === 0 ? (
        <p className="empty-state">No albums inducted yet.</p>
      ) : (
        <div className="hof-frames">
          {inductees.map((album, i) => {
            const artUrl = album.artworkUrl || album.resolvedCoverUrl;
            return (
              <div key={album.id} className="hof-frame">
                <div className="hof-plaque-frame">
                  <div className="hof-plaque-board">
                    {album.vinylImageUrl
                      ? <img className="hof-record-photo" src={album.vinylImageUrl} alt={`${album.title} vinyl`} />
                      : <span className="hof-record" aria-hidden="true"></span>
                    }
                    <div className="hof-plaque-row">
                      {artUrl
                        ? <img className="hof-chip" src={artUrl} alt={`${album.title} cover`} />
                        : <span className="hof-chip" aria-hidden="true"></span>
                      }
                      <div className="hof-plaque">
                        <span className="hof-rank">No. {i + 1}</span>
                        <span className="hof-title">{album.title}</span>
                        <span className="hof-artist">{album.artist}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="hof-retire-btn"
                  onClick={() => handleRetire(album.id)}
                  title="Retire from Hall of Fame"
                >
                  Retire
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HallOfFame;
