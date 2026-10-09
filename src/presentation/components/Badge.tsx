import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'clear' | 'conflict' | 'buffer' | 'neutral' | 'live';

const tones: Record<BadgeTone, string> = {
  clear: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
  conflict: 'bg-brand-500 text-white ring-brand-500',
  buffer: 'bg-brand-50 text-brand-700 ring-brand-200/70',
  neutral: 'bg-neutral-100 text-ink/60 ring-neutral-200/70',
  live: 'bg-emerald-50 text-emerald-600 ring-emerald-100 uppercase tracking-wider text-[10px]',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {tone === 'live' && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
