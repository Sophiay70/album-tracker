import { useRef } from 'react';
import { useInView } from '../../hooks/useInView';

// CSS-only vinyl disc: grooves, a colored center label, a spindle hole.
// When `spinning`, it pauses itself while scrolled off-screen.
function Record({ labelColor, spinning = false, className = '', style }) {
  const ref = useRef(null);
  const onScreen = useInView(ref, { enabled: spinning });

  const classes = [
    'record',
    spinning ? 'spin' : '',
    spinning && !onScreen ? 'is-paused' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span
      ref={ref}
      className={classes}
      style={{ ...style, ...(labelColor ? { '--record-label': labelColor } : null) }}
      aria-hidden="true"
    >
      <span className="record-label" />
    </span>
  );
}

export default Record;
