import type { HTMLAttributes } from 'react';
import { cn } from '@/src/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the soft orange glow on hover. */
  interactive?: boolean;
}

export function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-neutral-200/80 bg-white shadow-card',
        interactive && 'transition-shadow duration-300 hover:border-brand-200 hover:shadow-glow',
        className,
      )}
      {...props}
    />
  );
}
