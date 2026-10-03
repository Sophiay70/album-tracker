import { IconButton } from './Button';
import { HeartIcon } from './Icons';

function FavoriteButton({ favorite, title, onToggle, className = '' }) {
  return (
    <IconButton
      label={title ? `Favorite ${title}` : 'Favorite'}
      aria-pressed={favorite ? 'true' : 'false'}
      className={`fav-toggle ${favorite ? 'is-on' : ''} ${className}`.trim()}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
    >
      <HeartIcon filled={favorite} />
    </IconButton>
  );
}

export default FavoriteButton;
