import { useState, useEffect } from 'react';

const STORAGE_KEY = 'album-tracker-albums';

export function useAlbums() {
  const [albums, setAlbums] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
    } catch {
      // Storage unavailable or full — state still works in memory
    }
  }, [albums]);

  function addAlbum(albumData) {
    const newAlbum = {
      ...albumData,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
      favorite: false,
    };
    setAlbums(prev => [newAlbum, ...prev]);
  }

  function deleteAlbum(id) {
    setAlbums(prev => prev.filter(a => a.id !== id));
  }

  function toggleFavorite(id) {
    setAlbums(prev =>
      prev.map(a => a.id === id ? { ...a, favorite: !a.favorite } : a)
    );
  }

  function updateAlbum(id, changes) {
    setAlbums(prev =>
      prev.map(a => a.id === id ? { ...a, ...changes } : a)
    );
  }

  return { albums, addAlbum, deleteAlbum, toggleFavorite, updateAlbum };
}
