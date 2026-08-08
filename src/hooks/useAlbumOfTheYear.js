import { useState, useEffect } from 'react';

const STORAGE_KEY = 'album-of-the-year-ranks';
export const MAX_SLOTS = 5;

// Stores just the ranked album IDs, in order — separate from the main
// albums array/localStorage key. Filled slots are always contiguous
// starting at rank 1; removing one shifts the rest up automatically.
export function useAlbumOfTheYear() {
  const [rankedIds, setRankedIds] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rankedIds));
    } catch {
      // Storage unavailable or full — state still works in memory
    }
  }, [rankedIds]);

  function addToSlot(albumId) {
    setRankedIds(prev =>
      prev.includes(albumId) || prev.length >= MAX_SLOTS ? prev : [...prev, albumId]
    );
  }

  function removeFromSlot(albumId) {
    setRankedIds(prev => prev.filter(id => id !== albumId));
  }

  function reorder(fromIndex, toIndex) {
    setRankedIds(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  return { rankedIds, addToSlot, removeFromSlot, reorder };
}
