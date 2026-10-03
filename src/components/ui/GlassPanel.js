import { forwardRef } from 'react';

// The frosted surface. `strong` is the more opaque variant used for the nav
// and featured cards. Don't nest these more than one level deep.
const GlassPanel = forwardRef(function GlassPanel(
  { as: Tag = 'div', strong = false, className = '', children, ...rest },
  ref
) {
  return (
    <Tag ref={ref} className={`${strong ? 'glass-strong' : 'glass'} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
});

export default GlassPanel;
