'use client';

import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/lib/formatCurrency';

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
      className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white py-1.5 pl-1.5 pr-4 shadow-card"
      role="status"
      aria-label={`Revenue protected: ${formatCurrency(cents)}`}
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">
          Revenue protected
        </p>
        <p
          key={bumps}
          className={`origin-left text-lg font-bold tabular-nums text-ink ${bumps > 0 ? 'motion-safe:animate-pop' : ''}`}
        >
          {formatCurrency(cents)}
        </p>
      </div>
    </div>
  );
}
