import { useState } from 'react';
import './App.css';
import { useAlbums } from './hooks/useAlbums';
import { useAlbumOfTheYear } from './hooks/useAlbumOfTheYear';
import AppNav from './components/AppNav';
import AmbientBackground from './components/ui/AmbientBackground';
import Modal from './components/ui/Modal';
import { useAlbumPalette } from './hooks/useAlbumPalette';
import { getFeaturedAlbum } from './utils/albumStats';
import { HOME_PALETTE } from './utils/albumColors';
import AddAlbumForm from './components/AddAlbumForm';
import AlbumGrid from './components/AlbumGrid';
import Home from './components/Home';
import PageHeader from './components/PageHeader';
import AlbumAstrology from './components/AlbumAstrology';
import AlbumOfTheYears from './components/AlbumOfTheYears';

function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [showAddModal, setShowAddModal] = useState(false);
  const { albums, addAlbum, deleteAlbum, toggleFavorite, updateAlbum } = useAlbums();
  const { rankedIds, addToSlot, removeFromSlot, reorder } = useAlbumOfTheYear();

  const [astrologyAlbum, setAstrologyAlbum] = useState(null);
  const featured = getFeaturedAlbum(albums);
  // Ambient background: a fixed warm cream on Home, the selected album's
  // colors on Astrology, and the brand mix everywhere else.
  const astrologyPalette = useAlbumPalette(activeTab === 'Album Astrology' ? astrologyAlbum : null);
  const palette =
    activeTab === 'Home' ? HOME_PALETTE
    : activeTab === 'Album Astrology' ? astrologyPalette
    : null;

  function changeTab(tab) {
    if (tab !== activeTab) window.scrollTo(0, 0);
    setActiveTab(tab);
  }

  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>
      <AmbientBackground colors={palette} />
      <AppNav
        activeTab={activeTab}
        onTabChange={changeTab}
        onAddClick={() => setShowAddModal(true)}
      />
      <main className="app-main" id="main" tabIndex={-1}>
        {activeTab === 'Home' && (
          <Home
            albums={albums}
            featured={featured}
            onAdd={addAlbum}
            onAddClick={() => setShowAddModal(true)}
            onGoToLibrary={() => changeTab('Library')}
            onToggleFavorite={toggleFavorite}
            onUpdate={updateAlbum}
            onDelete={deleteAlbum}
          />
        )}
        {activeTab === 'Library' && (
          <div>
            <PageHeader
              eyebrow="Library"
              title={<>My record <em>collection</em></>}
              description="Every album you've logged. Tap a sleeve to see your review."
            />
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
            <PageHeader
              eyebrow="Your top 5"
              title={<>Album of the <em>Years</em></>}
              description="Up to 5 albums you'd never skip a track on. Your personal Album of the Year(s)."
            />
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
          <div>
            <PageHeader
              eyebrow="Album Astrology"
              title={<>What it says <em>about you</em></>}
              description="Every record has a sign. Pick one of yours and let the stars read your music personality."
            />
            <AlbumAstrology albums={albums} onSelectAlbum={setAstrologyAlbum} />
          </div>
        )}
      </main>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} ariaLabel="Add a record">
        <AddAlbumForm onAdd={addAlbum} albums={albums} />
      </Modal>
    </div>
  );
}

export default App;
