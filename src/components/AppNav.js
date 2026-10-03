import Record from './ui/Record';
import Button, { IconButton } from './ui/Button';
import { PlusIcon, HomeIcon, LibraryIcon, TrophyIcon, MoonIcon } from './ui/Icons';

export const TABS = [
  { id: 'Home', short: 'Home', Icon: HomeIcon },
  { id: 'Library', short: 'Library', Icon: LibraryIcon },
  { id: 'Album of the Years', short: 'Top 5', Icon: TrophyIcon },
  { id: 'Album Astrology', short: 'Astrology', Icon: MoonIcon },
];

// Floating glass pill nav (desktop) + compact top bar and fixed bottom tab
// bar (≤760px). Tabs are buttons because views are switched in state, not
// by URL; the current one carries aria-current="page".
function AppNav({ activeTab, onTabChange, onAddClick }) {
  return (
    <>
      <header className="app-nav glass-strong">
        <button
          type="button"
          className="app-logo"
          onClick={() => onTabChange('Home')}
          aria-label="The Vinyl Vault, home"
        >
          <Record className="app-logo-record" spinning labelColor="var(--amber)" />
          <span className="app-logo-text" aria-hidden="true">The Vinyl Vault</span>
        </button>

        <nav className="app-tabs" aria-label="Main">
          {TABS.map(({ id }) => (
            <button
              key={id}
              type="button"
              className="app-tab"
              aria-current={activeTab === id ? 'page' : undefined}
              onClick={() => onTabChange(id)}
            >
              {id}
            </button>
          ))}
        </nav>

        <Button className="app-add-btn" icon={<PlusIcon size={16} />} onClick={onAddClick}>
          Add record
        </Button>
        <IconButton label="Add record" className="app-add-icon btn-primary" onClick={onAddClick}>
          <PlusIcon />
        </IconButton>
      </header>

      <nav className="bottom-tabs glass-strong" aria-label="Main">
        {TABS.map(({ id, short, Icon }) => (
          <button
            key={id}
            type="button"
            className="bottom-tab"
            aria-current={activeTab === id ? 'page' : undefined}
            aria-label={short === id ? undefined : id}
            onClick={() => onTabChange(id)}
          >
            <Icon size={22} />
            <span aria-hidden={short === id ? undefined : 'true'}>{short}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default AppNav;
