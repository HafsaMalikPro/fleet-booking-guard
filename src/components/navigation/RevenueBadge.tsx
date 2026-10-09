'use client';

import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/src/lib/formatCurrency';

export function RevenueBadge({ cents }: { cents: number }) {
  const [previous, setPrevious] = useState(cents);
  const [bumps, setBumps] = useState(0);
  // Adjust state during render (React's recommended alternative to an effect) so the pop
  // animation restarts each time the value goes up.
  if (cents !== previous) {
    if (cents > previous) setBumps((n) => n + 1);
    setPrevious(cents);
  }

  return (
    <div
      className="flex items-center gap-2.5 rounded-full border border-brand-200 bg-white py-1 pl-1 pr-4 shadow-glow"
      role="status"
      aria-label={`Revenue protected: ${formatCurrency(cents)}`}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="hidden text-xs font-medium text-ink/55 sm:inline">Revenue protected</span>
      <span
        key={bumps}
        className={`inline-block text-[15px] font-bold tabular-nums text-ink ${bumps > 0 ? 'motion-safe:animate-pop' : ''}`}
      >
        {formatCurrency(cents)}
      </span>
    </div>
  );
}
