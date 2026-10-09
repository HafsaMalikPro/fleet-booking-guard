import { cn } from '@/lib/cn';

// Car-roof mark: a rounded roof band over two slanted wheel-arch feet (48×17 grid).
const MARK_PATHS = [
  'M5 7C5 3 8 .5 13 .5h25L42.5 7z',
  'M3 10.5h16.2l-1.6 6.5H.4z',
  'M29.2 10.5h14l3.4 6.5H30.8z',
];

// "1NOW" glyphs on a 20-unit cap height, drawn upright and slanted as a group.
const WORDMARK_PATHS = [
  'M1 4.5 5.5 0H10v20H5V6.8L1 8.8z',
  'M13 0h5l6 11.5V0h5v20h-5l-6-11.5V20h-5z',
  'M38 0h6.5a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H38a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6zm1.5 5a2.5 2.5 0 0 0-2.5 2.5v5a2.5 2.5 0 0 0 2.5 2.5h3.5a2.5 2.5 0 0 0 2.5-2.5v-5A2.5 2.5 0 0 0 43 5z',
  'M53 0h5l1.6 12.5L63.5 0h4.6l3.6 12.5L73.6 0h5l-4 20h-5.4L65.8 8.6 61.8 20h-5.2z',
];

function MarkPaths() {
  return (
    <>
      {MARK_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </>
  );
}

/** The 1Now mark on its own. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 17" className={className} aria-hidden="true" fill="currentColor">
      <MarkPaths />
    </svg>
  );
}

/** Full 1Now lockup: mark + "1NOW" wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 127 22"
      className={cn('text-brand-500', className)}
      role="img"
      aria-label="1Now"
      fill="currentColor"
    >
      <g transform="translate(0 4.8) scale(0.73)">
        <MarkPaths />
      </g>
      <g transform="translate(47 1) skewX(-14)">
        {WORDMARK_PATHS.map((d) => (
          <path key={d} d={d} fillRule="evenodd" />
        ))}
      </g>
    </svg>
  );
}
