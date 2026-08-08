import { useState, useEffect } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchVinylImage } from '../services/discogs';
import { MAX_SLOTS } from '../hooks/useAlbumOfTheYear';

// A filled slot — visual design is unchanged from the original Hall of Fame
// build: black frame, gold chip, vinyl photo (Discogs/Gemini) or drawn disc.
// Now sortable via @dnd-kit instead of native HTML5 drag-and-drop.
function FilledSlot({ album, rank, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: album.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const artUrl = album.artworkUrl || album.resolvedCoverUrl;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`hof-frame ${isDragging ? 'is-dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="hof-plaque-frame">
        <button
          type="button"
          className="hof-remove-btn"
          onClick={(e) => { e.stopPropagation(); onRemove(album.id); }}
          title="Remove"
        >
          ✕
        </button>
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
              <span className="hof-rank">No. {rank}</span>
              <span className="hof-title">{album.title}</span>
              <span className="hof-artist">{album.artist}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptySlot({ onClick }) {
  return (
    <button type="button" className="add-album-trigger hof-empty-slot" onClick={onClick} title="Add album">
      <span className="add-album-plus" aria-hidden="true">+</span>
    </button>
  );
}

function AlbumOfTheYears({ albums, onUpdate, rankedIds, onAdd, onRemove, onReorder }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const rankedAlbums = rankedIds
    .map(id => albums.find(a => a.id === id))
    .filter(Boolean); // guards against a ranked album having been deleted from the library
  const candidateAlbums = albums.filter(a => !rankedIds.includes(a.id));
  const emptySlotCount = MAX_SLOTS - rankedAlbums.length;
  const rankedAlbumIds = rankedAlbums.map(a => a.id).join(',');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Resolve each ranked album's vinyl photo and cover art once, then cache
  // the result on the album itself — unchanged from the original build.
  useEffect(() => {
    let cancelled = false;

    const needsVinyl = rankedAlbums.filter(a => a.vinylImageUrl === undefined);
    needsVinyl.forEach(album => {
      fetchVinylImage({ title: album.title, artist: album.artist })
        .then(url => {
          if (!cancelled) onUpdate(album.id, { vinylImageUrl: url });
        })
        .catch(() => {
          if (!cancelled) onUpdate(album.id, { vinylImageUrl: null });
        });
    });

    const needsCover = rankedAlbums.filter(a => !a.artworkUrl && a.resolvedCoverUrl === undefined);
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
  }, [rankedAlbumIds]);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = rankedIds.indexOf(active.id);
    const toIndex = rankedIds.indexOf(over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    onReorder(fromIndex, toIndex);
  }

  function handlePick(albumId) {
    onAdd(albumId);
    setPickerOpen(false);
  }

  if (albums.length === 0) {
    return (
      <p className="empty-state">
        Add albums to your library first, then pick your all-time favorites here.
      </p>
    );
  }

  return (
    <div className="hof-section">
      {rankedAlbums.length === 0 && (
        <p className="hof-intro">Pick your all-time top 5</p>
      )}

      <div className="hof-frames">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rankedIds} strategy={rectSortingStrategy}>
            {rankedAlbums.map((album, i) => (
              <FilledSlot key={album.id} album={album} rank={i + 1} onRemove={onRemove} />
            ))}
          </SortableContext>
        </DndContext>
        {Array.from({ length: emptySlotCount }).map((_, i) => (
          <EmptySlot key={`empty-${i}`} onClick={() => setPickerOpen(true)} />
        ))}
      </div>

      {pickerOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setPickerOpen(false); }}
        >
          <div className="modal-panel">
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setPickerOpen(false)}
              title="Close"
            >
              ✕
            </button>
            <div className="add-album-form">
              <h2>Choose an album</h2>
              {candidateAlbums.length === 0 ? (
                <p className="empty-state">All your albums are already ranked.</p>
              ) : (
                <ul className="hof-picker-list">
                  {candidateAlbums.map(a => (
                    <li
                      key={a.id}
                      className="search-result-item"
                      onClick={() => handlePick(a.id)}
                    >
                      {a.artworkUrl && (
                        <img src={a.artworkUrl} alt={a.title} className="search-result-art" />
                      )}
                      <div className="search-result-info">
                        <span className="search-result-title">{a.title}</span>
                        <span className="search-result-artist">{a.artist}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlbumOfTheYears;
