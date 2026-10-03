// Toggle chip (genre filters etc.). Exposes its state with aria-pressed.
function Chip({ pressed = false, className = '', children, ...rest }) {
  return (
    <button
      type="button"
      className={`chip ${className}`.trim()}
      aria-pressed={pressed ? 'true' : 'false'}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Chip;
