import { useRef, useState } from 'react';
import { STAR_PATH } from './ui/Icons';

function Star({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={STAR_PATH} />
    </svg>
  );
}

// Read-only: a single image announced as "Rated N out of 5".
// Interactive: a radio group — Tab lands on the current rating, arrow keys
// change it, Home/End jump to 1/5.
function StarRating({ rating, onRate, readOnly = false, size, label = 'Rating', className = '' }) {
  const [hovered, setHovered] = useState(null);
  const starRefs = useRef([]);
  const value = Number(rating) || 0;
  const display = hovered ?? value;
  const starSize = size ?? (readOnly ? 16 : 26);

  if (readOnly) {
    // A span (not div) so it can sit inside a button, like the library cards.
    return (
      <span
        className={`star-rating ${className}`.trim()}
        role="img"
        aria-label={value ? `Rated ${value} out of 5` : 'Not rated'}
      >
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={`star readonly ${star <= value ? 'filled' : ''}`}>
            <Star size={starSize} />
          </span>
        ))}
      </span>
    );
  }

  function select(star) {
    onRate(star);
    starRefs.current[star - 1]?.focus();
  }

  function onKeyDown(e) {
    const current = value || 0;
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(5, current + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(1, current - 1);
    else if (e.key === 'Home') next = 1;
    else if (e.key === 'End') next = 5;
    if (next !== null) {
      e.preventDefault();
      select(next);
    }
  }

  return (
    <div
      className={`star-rating is-interactive ${className}`.trim()}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      onPointerLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          ref={el => { starRefs.current[star - 1] = el; }}
          type="button"
          role="radio"
          aria-checked={star === value ? 'true' : 'false'}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          tabIndex={star === (value || 1) ? 0 : -1}
          className={`star ${star <= display ? 'filled' : ''}`}
          onClick={() => select(star)}
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHovered(star); }}
        >
          <Star size={starSize} />
        </button>
      ))}
    </div>
  );
}

export default StarRating;
