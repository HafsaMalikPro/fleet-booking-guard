import { LogoMark } from './LogoMark';
import { RevenueBadge } from './RevenueBadge';

export function Header({ revenueCents }: { revenueCents: number }) {
  return (
    <header className="border-b border-brand-100/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" />
          <span className="text-base font-bold tracking-tight text-ink sm:text-lg">
            Fleet Booking Guard
          </span>
        </div>
        <RevenueBadge cents={revenueCents} />
      </div>
    </header>
  );
}
