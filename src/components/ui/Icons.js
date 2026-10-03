// Small inline SVG icon set. All are decorative (aria-hidden): the button or
// link that holds them is responsible for its own accessible name.

function Svg({ size = 20, children, fill = 'none', strokeWidth = 2, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const STAR_PATH = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z';
export const HEART_PATH = 'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z';

export const PlusIcon = (p) => <Svg strokeWidth={2.4} {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const CloseIcon = (p) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
export const EditIcon = (p) => <Svg {...p}><path d="M4 20h4L19 9l-4-4L4 16z" /></Svg>;
export const TrashIcon = (p) => <Svg {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Svg>;
export const StarOutlineIcon = (p) => <Svg {...p}><path d={STAR_PATH} /></Svg>;
export const SearchIcon = (p) => <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></Svg>;
export const FlipIcon = (p) => <Svg {...p}><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5" /></Svg>;
export const MoreIcon = (p) => (
  <Svg fill="currentColor" stroke="none" {...p}>
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </Svg>
);
export const SparkleIcon = (p) => (
  <Svg fill="currentColor" stroke="none" {...p}>
    <path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z" />
    <path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
  </Svg>
);
export const HeartIcon = ({ filled, ...p }) => (
  <Svg strokeWidth={1.8} {...p}>
    <path d={HEART_PATH} fill={filled ? 'currentColor' : 'none'} />
  </Svg>
);

// Bottom tab bar icons
export const HomeIcon = (p) => <Svg {...p}><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" /></Svg>;
export const LibraryIcon = (p) => <Svg {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.8" fill="currentColor" /></Svg>;
export const TrophyIcon = (p) => <Svg {...p}><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8" /></Svg>;
export const MoonIcon = (p) => <Svg {...p}><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" /><path d="M17 3l.6 1.4L19 5l-1.4.6L17 7l-.6-1.4L15 5l1.4-.6z" /></Svg>;
