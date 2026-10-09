import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the soft orange glow on hover. */
  interactive?: boolean;
}

export function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-brand-100 bg-white shadow-card',
        interactive && 'transition-shadow duration-200 hover:shadow-glow',
        className,
      )}
      {...props}
    />
  );
}
