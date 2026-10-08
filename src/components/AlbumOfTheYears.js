import { useState, useEffect, useId } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, rectSortingStrategy, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchVinylImage } from '../services/discogs';
import { MAX_SLOTS } from '../hooks/useAlbumOfTheYear';
import Modal from './ui/Modal';
import OverflowMenu from './ui/OverflowMenu';
import { PlusIcon, TrashIcon } from './ui/Icons';
import { coverUrlFor, placeholderCoverFor } from '../utils/albumColors';

// A filled slot: a glossy frame holding the record (Discogs vinyl photo, or
// a drawn metallic disc — gold for No. 1), with the cover chip and a small
// glass plaque. Sortable via @dnd-kit (drag, or keyboard: Space to pick up,
// arrows to move, Space to drop); the "•••" menu offers the same moves for
// anyone who'd rather not drag.
function FilledSlot({ album, rank, total, onRemove, onMove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: album.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const artUrl = coverUrlFor(album);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`hof-frame ${rank === 1 ? 'is-first' : ''} ${isDragging ? 'is-dragging' : ''}`}
      {...attributes}
      aria-label={`No. ${rank}: ${album.title} by ${album.artist}. Drag or press Space to reorder.`}
      {...listeners}
    >
      <div className="hof-plaque-frame">
        <OverflowMenu
          className="hof-menu"
          label={`Options for ${album.title}`}
          items={[
            ...(rank > 1 ? [{ label: 'Move up', onSelect: () => onMove(album.id, -1) }] : []),
            ...(rank < total ? [{ label: 'Move down', onSelect: () => onMove(album.id, 1) }] : []),
            { label: 'Remove from top 5', icon: <TrashIcon size={18} />, danger: true, onSelect: () => onRemove(album.id) },
          ]}
        />
        <div className="hof-plaque-board">
          {album.vinylImageUrl
            ? <img className="hof-record-photo" src={album.vinylImageUrl} alt="" loading="lazy" width="300" height="300" />
            : <span className="hof-record" aria-hidden="true"></span>
          }
          <div className="hof-plaque-row">
            {artUrl
              ? <img className="hof-chip" src={artUrl} alt="" width="44" height="44" loading="lazy" />
              : <span className="hof-chip" style={{ background: placeholderCoverFor(album) }} aria-hidden="true"></span>
            }
            <div className="hof-plaque">
              <span className="hof-rank">No. {rank}</span>
              <span className="hof-title">{album.title}</span>
              <span className="hof-artist">{album.artist}</span>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function EmptySlot({ rank, onClick }) {
  return (
    <li className={`hof-slot ${rank === 1 ? 'is-first' : ''}`}>
      <button type="button" className="hof-empty-slot" onClick={onClick}>
        <span className="hof-empty-rank">No. {rank}</span>
        <span className="add-album-plus" aria-hidden="true"><PlusIcon size={26} /></span>
        <span className="hof-empty-label">Add album</span>
      </button>
    </li>
  );
}

function PickerSheet({ candidates, onPick, onClose }) {
  const [query, setQuery] = useState('');
  const filterId = useId();
  const q = query.trim().toLowerCase();
  const shown = q
    ? candidates.filter(a => `${a.title} ${a.artist}`.toLowerCase().includes(q))
    : candidates;

  return (
    <Modal open onClose={onClose} title="Choose an album">
      {candidates.length === 0 ? (
        <p className="empty-state">All your albums are already ranked.</p>
      ) : (
        <div className="hof-picker">
          {candidates.length > 6 && (
            <>
              <label htmlFor={filterId} className="visually-hidden">Filter your albums</label>
              <input
                id={filterId}
                type="search"
                className="vv-input"
                placeholder="Filter your albums"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </>
          )}
          <ul className="hof-picker-list">
            {shown.map(a => {
              const art = coverUrlFor(a);
              return (
                <li key={a.id}>
                  <button type="button" className="search-result-item" onClick={() => onPick(a.id)}>
                    {art
                      ? <img src={art} alt="" className="search-result-art" width="44" height="44" loading="lazy" />
                      : <span className="search-result-art" style={{ background: placeholderCoverFor(a) }} aria-hidden="true" />}
                    <span className="search-result-info">
                      <span className="search-result-title">{a.title}</span>
                      <span className="search-result-artist">{a.artist}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {shown.length === 0 && <p className="search-no-results">No albums match “{query}”.</p>}
        </div>
      )}
    </Modal>
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

  // Mouse: drag after 5px. Touch: press and hold ~200ms, so an ordinary
  // swipe over the (large, on phones) frames still scrolls the page.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
      const url = `/.netlify/functions/itunes-search?term=${encodeURIComponent(`${album.artist} ${album.title}`)}&limit=1`;
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

  // Menu equivalent of dragging one place left/right. Indices are looked up
  // in rankedIds (like handleDragEnd) since rankedAlbums skips deleted ones.
  function moveAlbum(albumId, direction) {
    const pos = rankedAlbums.findIndex(a => a.id === albumId);
    const neighbor = rankedAlbums[pos + direction];
    if (!neighbor) return;
    onReorder(rankedIds.indexOf(albumId), rankedIds.indexOf(neighbor.id));
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
        <p className="hof-intro">Pick your all-time top 5. Drag frames to reorder them.</p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rankedIds} strategy={rectSortingStrategy}>
          <ol className="hof-frames">
            {rankedAlbums.map((album, i) => (
              <FilledSlot
                key={album.id}
                album={album}
                rank={i + 1}
                total={rankedAlbums.length}
                onRemove={onRemove}
                onMove={moveAlbum}
              />
            ))}
            {Array.from({ length: emptySlotCount }).map((_, i) => (
              <EmptySlot
                key={`empty-${i}`}
                rank={rankedAlbums.length + i + 1}
                onClick={() => setPickerOpen(true)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      {pickerOpen && (
        <PickerSheet
          candidates={candidateAlbums}
          onPick={handlePick}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

export default AlbumOfTheYears;
