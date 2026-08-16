import { useState, useEffect } from 'react';
import './App.css';
import vinylLogo from './img/VinylVaultlogo.png';
import { useAlbums } from './hooks/useAlbums';
import { useAlbumOfTheYear } from './hooks/useAlbumOfTheYear';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import TabNav from './components/TabNav';
import AddAlbumForm from './components/AddAlbumForm';
import AlbumGrid from './components/AlbumGrid';
import SuggestedAlbums from './components/SuggestedAlbums';
import Hero from './components/Hero';
import AlbumAstrology from './components/AlbumAstrology';
import AlbumOfTheYears from './components/AlbumOfTheYears';

function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [showAddModal, setShowAddModal] = useState(false);
  const { albums, addAlbum, deleteAlbum, toggleFavorite, updateAlbum } = useAlbums();
  const { rankedIds, addToSlot, removeFromSlot, reorder } = useAlbumOfTheYear();

  useBodyScrollLock(showAddModal);

  useEffect(() => {
    if (!showAddModal) return;
    function handleEscape(e) {
      if (e.key === 'Escape') setShowAddModal(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showAddModal]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-logo-frame">
          <img src={vinylLogo} alt="" className="header-logo" />
        </div>
        <div className="header-title">
          <h1>The Vinyl Vault</h1>
        </div>
        <p>A home for the records you love</p>
      </header>
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app-main">
        {activeTab === 'Home' &&(
          <div>
            {<Hero albums={albums} onGoToLibrary={() => setActiveTab('Library')} />}
            <SuggestedAlbums albums={albums} onAdd={addAlbum} />
          </div>
        )}
        {activeTab === 'Library' && (
          <div>
            <div className="section-divider">
              <span>My Record Collection</span>
            </div>
            <AlbumGrid
              albums={albums}
              onDelete={deleteAlbum}
              onToggleFavorite={toggleFavorite}
              onUpdate={updateAlbum}
              onAddClick={() => setShowAddModal(true)}
            />
          </div>
        )}
        {activeTab === 'Album of the Years' && (
          <div>
            <h2 className="tab-title">Album of the Years</h2>
            <p className="tab-description">
              Up to 5 albums you'd never skip a track on. Your personal Album of the Year(s).
            </p>
            <AlbumOfTheYears
              albums={albums}
              onUpdate={updateAlbum}
              rankedIds={rankedIds}
              onAdd={addToSlot}
              onRemove={removeFromSlot}
              onReorder={reorder}
            />
          </div>
        )}
        {activeTab === 'Album Astrology' && (
          <div className="astrology-tab">
            <h2 className="tab-title">Album Astrology</h2>
            <AlbumAstrology albums={albums} />
          </div>
        )}
      </main>

      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="modal-panel">
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowAddModal(false)}
              title="Close"
            >
              ✕
            </button>
            <AddAlbumForm onAdd={addAlbum} albums={albums} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
