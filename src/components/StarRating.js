import { useState } from 'react';

function StarRating({ rating, onRate, readOnly = false }) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? rating;

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= display ? 'filled' : ''} ${readOnly ? 'readonly' : ''}`}
          onClick={!readOnly ? () => onRate(star) : undefined}
          onMouseEnter={!readOnly ? () => setHovered(star) : undefined}
          onMouseLeave={!readOnly ? () => setHovered(null) : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default StarRating;
