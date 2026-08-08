import { useState } from 'react';
import { generatePersonality } from '../services/claudePersonality';

function AlbumAstrology({ albums }) {
  const [selectedId, setSelectedId] = useState('');
  const [personality, setPersonality] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedAlbum = albums.find(a => a.id === selectedId);

  function handleSelect(id) {
    setSelectedId(id);
    setPersonality('');
    setError('');
  }

  async function handleReveal() {
    if (!selectedAlbum) return;
    setPersonality('');
    setError('');
    setLoading(true);
    try {
      const result = await generatePersonality({
        title: selectedAlbum.title,
        artist: selectedAlbum.artist,
        genre: selectedAlbum.genre,
      });
      setPersonality(result);
    } catch (err) {
      setError(err.message || 'Failed to generate a reading. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (albums.length === 0) {
    return (
      <p className="empty-state">
        Add an album to your library first, then come back to reveal its astrology.
      </p>
    );
  }

  return (
    <div className="astrology-section">
      <p className="astrology-intro">
        What does your favorite album say about you? Pick one and find out.
      </p>

      <div className="suggestions-scroll astrology-thumbs">
        {albums.map(a => (
          <button
            key={a.id}
            type="button"
            className={`astrology-thumb ${selectedId === a.id ? 'active' : ''}`}
            onClick={() => handleSelect(a.id)}
          >
            <div className="astrology-thumb-art">
              {a.artworkUrl
                ? <img src={a.artworkUrl} alt={`${a.title} cover`} />
                : <span>♫</span>
              }
            </div>
            <span className="astrology-thumb-title">{a.title}</span>
          </button>
        ))}
      </div>

      <div className="astrology-reveal-wrap">
        <button
          type="button"
          className="personality-btn"
          onClick={handleReveal}
          disabled={!selectedAlbum || loading}
        >
          {loading ? 'Reading the stars...' : '✨ Reveal its astrology'}
        </button>
      </div>

      {selectedAlbum && (
        <div className="astrology-preview">
          <div className="album-cover">
            <span className="vinyl-disc" aria-hidden="true"></span>
            <div className="album-placeholder">
              {selectedAlbum.artworkUrl
                ? <img src={selectedAlbum.artworkUrl} alt={`${selectedAlbum.title} cover`} />
                : <span>♫</span>
              }
            </div>
          </div>
          <p className="astrology-preview-title">{selectedAlbum.title}</p>
          <p className="astrology-preview-artist">{selectedAlbum.artist}</p>
        </div>
      )}

      {error && <p className="personality-error">{error}</p>}

      {personality && (
        <div className="personality-box">
          <span className="personality-label">Your music personality:</span>
          <p>{personality}</p>
        </div>
      )}
    </div>
  );
}

export default AlbumAstrology;
