// Line icons drawn as SVG so they look the same on Windows, Android and iOS (no emoji).
const PATHS = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  review: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3',
  quote: 'M4 20c3 0 6-2 6-7V5H4v8h3c0 2-1 4-3 4zM14 20c3 0 6-2 6-7V5h-6v8h3c0 2-1 4-3 4z',
  book: 'M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  flame: 'M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-3-1-6 1-9z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  check: 'M5 12.5l4.5 4.5L19 7',
  lock: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4',
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 2.9 1-6.2L3 9.6l6.2-.9z',
  play: 'M8 5l11 7-11 7z',
  x: 'M6 6l12 12M18 6L6 18',
  shrink: 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7',
  expand: 'M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7',
  snow: 'M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 6h3c0 2.5-1.5 4-3.5 4M7 6H4c0 2.5 1.5 4 3.5 4',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  sprout: 'M12 22V12M12 12C12 7 8 5 3 5c0 5 4 7 9 7zM12 15c0-4 3-6 8-6 0 4-3 6-8 6z',
  gem: 'M6 3h12l4 6-10 12L2 9zM2 9h20M9 3l3 18M15 3l-3 18',
  medal: 'M12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8 3l4 6 4-6',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  chevron: 'M9 6l6 6-6 6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  ear: 'M6 9a6 6 0 0 1 12 0c0 4-4 5-4 9a3 3 0 0 1-6 0M9 9a3 3 0 0 1 6 0',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
};

export default function Icon({ name, size = 18, fill = false, className = '' }) {
  return (
    <svg
      className={`ic ${className}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
