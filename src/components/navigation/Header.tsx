import { Logo } from './LogoMark';
import { RevenueBadge } from './RevenueBadge';

export function Header({ revenueCents }: { revenueCents: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Logo className="h-[22px] w-auto sm:h-[26px]" />
          <span className="hidden h-6 w-px bg-neutral-200 sm:block" aria-hidden="true" />
          <span className="hidden text-[15px] font-semibold text-ink/80 sm:inline">
            Fleet Booking Guard
          </span>
        </div>
        <RevenueBadge cents={revenueCents} />
      </div>
    </header>
  );
}
