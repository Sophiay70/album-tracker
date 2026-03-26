import { useState } from 'react';
import './App.css';
import vinylLogo from './img/VinylVaultlogo.png';
import { useAlbums } from './hooks/useAlbums';
import TabNav from './components/TabNav';
import AddAlbumForm from './components/AddAlbumForm';
import AlbumGrid from './components/AlbumGrid';
import AlbumCard from './components/AlbumCard';
import SuggestedAlbums from './components/SuggestedAlbums';

function App() {
  const [activeTab, setActiveTab] = useState('Library');
  const { albums, addAlbum, deleteAlbum, toggleFavorite, updateAlbum } = useAlbums();

  const favorites = albums.filter(a => a.favorite);
  const history = [...albums].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <img src={vinylLogo} alt="Vinyl Vault logo" className="header-logo" />
          <h1>The Vinyl Vault</h1>
        </div>
        <p>Save, rate, and revisit your music collection</p>
      </header>
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app-main">
        {activeTab === 'Library' && (
          <div>
            <AddAlbumForm onAdd={addAlbum} albums={albums} />
            <SuggestedAlbums albums={albums} onAdd={addAlbum} />
            <div className="section-divider">
              <span>My Reviews</span>
            </div>
            <AlbumGrid
              albums={albums}
              onDelete={deleteAlbum}
              onToggleFavorite={toggleFavorite}
              onUpdate={updateAlbum}
            />
          </div>
        )}
        {activeTab === 'History' && (
          <div>
            <h2 className="tab-title">Listening History</h2>
            {history.length === 0 ? (
              <p className="empty-state">No albums in your history yet.</p>
            ) : (
              <div className="album-grid">
                {history.map(album => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onDelete={deleteAlbum}
                    onToggleFavorite={toggleFavorite}
                    onUpdate={updateAlbum}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'Favorites' && (
          <div>
            <h2 className="tab-title">Favorites</h2>
            {favorites.length === 0 ? (
              <p className="empty-state">No favorites yet. Click ♥ on an album to save it here.</p>
            ) : (
              <div className="album-grid">
                {favorites.map(album => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onDelete={deleteAlbum}
                    onToggleFavorite={toggleFavorite}
                    onUpdate={updateAlbum}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
