import { useEffect, useRef, useState } from 'react';
import { generatePersonality } from '../services/claudePersonality';
import GlassPanel from './ui/GlassPanel';
import Button from './ui/Button';
import AlbumSleeve from './ui/AlbumSleeve';
import Record from './ui/Record';
import { SparkleIcon } from './ui/Icons';
import { useAlbumPalette } from '../hooks/useAlbumPalette';
import { coverUrlFor, pastelFor, placeholderCoverFor } from '../utils/albumColors';

// `onSelectAlbum` lets the app re-color the ambient background to the
// selected album's palette.
function AlbumAstrology({ albums, onSelectAlbum }) {
  const [selectedId, setSelectedId] = useState('');
  const [personality, setPersonality] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const readingRef = useRef(null);
  const selectedAlbum = albums.find(a => a.id === selectedId);
  const palette = useAlbumPalette(selectedAlbum);

  useEffect(() => {
    onSelectAlbum?.(selectedAlbum || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlbum]);

  // On phones the reading lands below the fold; bring it into view.
  useEffect(() => {
    const el = readingRef.current;
    if (!personality || !el) return;
    // Only when less than half of it is on screen (typically phones).
    const r = el.getBoundingClientRect();
    const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
    if (visible >= r.height / 2) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView?.({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }, [personality]);

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
      <GlassPanel className="astro-empty">
        <Record spinning labelColor="var(--amber)" className="astro-empty-record" />
        <p>Add an album to your library first, then come back to reveal its astrology.</p>
      </GlassPanel>
    );
  }

  return (
    <div className="astro">
      <GlassPanel className="astro-track">
        <p className="eyebrow astro-track-label" id="astro-pick-label">Pick an album</p>
        <ul className="astro-picker" aria-labelledby="astro-pick-label">
          {albums.map(a => {
            const art = coverUrlFor(a);
            const selected = selectedId === a.id;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  className="astro-pick"
                  aria-pressed={selected ? 'true' : 'false'}
                  onClick={() => handleSelect(a.id)}
                >
                  <span
                    className="astro-pick-art"
                    style={art ? undefined : { background: placeholderCoverFor(a) }}
                  >
                    {art
                      ? <img src={art} alt="" loading="lazy" decoding="async" width="120" height="120" />
                      : <span aria-hidden="true">♫</span>}
                  </span>
                  <span className="astro-pick-title">{a.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </GlassPanel>

      <div className="astro-stage">
        <div className="astro-turntable">
          {selectedAlbum ? (
            <>
              <div className="astro-sleeve sleeve-host">
                <AlbumSleeve
                  album={selectedAlbum}
                  spinning
                  revealed
                  eager
                  labelColor={palette?.[1] || palette?.[0] || pastelFor(selectedAlbum)}
                />
              </div>
              <p className="astro-album-title">{selectedAlbum.title}</p>
              <p className="astro-album-artist">{selectedAlbum.artist}</p>
            </>
          ) : (
            <>
              <div className="astro-idle">
                <Record labelColor="var(--amber)" />
              </div>
              <p className="astro-album-artist">Choose a record to put on the platter.</p>
            </>
          )}
        </div>

        <div className="astro-reading-col">
          <Button
            size="lg"
            className="astro-reveal"
            icon={<SparkleIcon size={18} />}
            onClick={handleReveal}
            disabled={!selectedAlbum || loading}
          >
            {loading ? 'Reading the stars…' : personality ? 'Read it again' : 'Reveal its astrology'}
          </Button>

          <div aria-live="polite" aria-busy={loading ? 'true' : 'false'}>
            {loading && (
              <GlassPanel strong className="astro-reading is-loading">
                <p className="eyebrow">Consulting the stars</p>
                <span className="visually-hidden">Generating your reading…</span>
                <div className="astro-skeleton" aria-hidden="true">
                  <span /><span /><span /><span />
                </div>
              </GlassPanel>
            )}

            {error && !loading && (
              <p className="astro-error" role="alert">{error}</p>
            )}

            {personality && !loading && (
              <GlassPanel
                strong
                as="section"
                ref={readingRef}
                className="astro-reading"
                aria-label="Your music personality"
              >
                <p className="eyebrow">Your music personality</p>
                <p className="astro-reading-text">{personality}</p>
              </GlassPanel>
            )}

            {!personality && !loading && !error && (
              <p className="astro-hint">
                {selectedAlbum
                  ? `Ready when you are. Reveal what ${selectedAlbum.title} says about you.`
                  : 'What does your favorite album say about you? Pick one and find out.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlbumAstrology;
