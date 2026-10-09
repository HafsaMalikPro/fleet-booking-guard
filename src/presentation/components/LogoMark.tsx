/** Simple parallelogram mark (not the real 1Now logo). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M11 4h17l-7 24H4z" fill="#FF7A45" />
      <path d="M17 4h11l-7 24h-4z" fill="#F0612A" opacity="0.55" />
    </svg>
  );
}
