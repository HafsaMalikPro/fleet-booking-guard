import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function IconChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 ring-1 ring-inset ring-brand-100',
        className,
      )}
    >
      {children}
    </span>
  );
}
