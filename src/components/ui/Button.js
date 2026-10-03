import { forwardRef } from 'react';

// variant: primary (sage) | dark | glass | ghost | danger
// size: md | lg
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon, className = '', type = 'button', children, ...rest },
  ref
) {
  const classes = [
    'btn',
    `btn-${variant}`,
    variant === 'glass' ? 'glass' : '',
    size === 'lg' ? 'btn-lg' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
});

// Icon-only round button. `label` is required: it becomes the aria-label.
export const IconButton = forwardRef(function IconButton(
  { label, className = '', type = 'button', children, ...rest },
  ref
) {
  return (
    <button ref={ref} type={type} className={`btn btn-icon ${className}`.trim()} aria-label={label} {...rest}>
      {children}
    </button>
  );
});

export default Button;
