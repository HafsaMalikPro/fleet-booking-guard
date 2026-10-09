import type { ReactNode } from 'react';
import { cn } from '@/src/lib/cn';

export function IconChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 ring-1 ring-inset ring-brand-100',
        className,
      )}
    >
      {children}
    </span>
  );
}
