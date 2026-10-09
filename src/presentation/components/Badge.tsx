import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'clear' | 'conflict' | 'buffer' | 'neutral';

const tones: Record<BadgeTone, string> = {
  clear: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  conflict: 'bg-brand-500 text-white ring-brand-500',
  buffer: 'bg-brand-50 text-brand-700 ring-brand-200',
  neutral: 'bg-neutral-100 text-ink/70 ring-neutral-200',
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
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
