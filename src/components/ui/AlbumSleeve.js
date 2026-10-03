import { useRef } from 'react';
import Record from './Record';
import { useInView } from '../../hooks/useInView';
import { useIsTouch } from '../../hooks/useMediaQuery';
import { coverUrlFor, pastelFor, placeholderCoverFor } from '../../utils/albumColors';

// Square cover with a record tucked behind it, peeking out to the right.
// Desktop: the record slides out when an ancestor `.sleeve-host` is hovered or
// focused (pure CSS). Touch: it slides out once, when the sleeve first scrolls
// into view. `revealed` forces it out (e.g. the selected Astrology album).
// Built from spans so it can sit inside a <button> (library cards).
// `eager` skips lazy-loading for above-the-fold covers.
function AlbumSleeve({
  album,
  labelColor,
  spinning = false,
  revealed = false,
  size = 600,
  className = '',
  imgAlt,
  eager = false,
}) {
  const ref = useRef(null);
  const isTouch = useIsTouch();
  const seen = useInView(ref, { once: true, threshold: 0.6, enabled: isTouch && !revealed });
  const art = coverUrlFor(album);

  const classes = [
    'sleeve-wrap',
    revealed || (isTouch && seen) ? 'is-revealed' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span ref={ref} className={classes}>
      <span className="sleeve-record">
        <Record labelColor={labelColor || pastelFor(album)} spinning={spinning} />
      </span>
      <span className="sleeve" style={art ? undefined : { background: placeholderCoverFor(album) }}>
        {art ? (
          <img
            src={art}
            alt={imgAlt ?? `${album.title} cover`}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            width={size}
            height={size}
          />
        ) : (
          <span className="sleeve-placeholder" aria-hidden="true">♫</span>
        )}
      </span>
    </span>
  );
}

export default AlbumSleeve;
