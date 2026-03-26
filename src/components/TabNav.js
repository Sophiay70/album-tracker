function TabNav({ activeTab, onTabChange }) {
  const tabs = ['Library', 'History', 'Favorites'];
  return (
    <nav className="tab-nav">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}

export default TabNav;
