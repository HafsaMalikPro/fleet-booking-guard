import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/src/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white shadow-cta hover:bg-brand-600 active:bg-brand-700',
  secondary:
    'border border-brand-300 bg-white text-ink hover:border-brand-500 hover:bg-brand-50/60',
  ghost: 'text-ink/60 hover:bg-neutral-100 hover:text-ink',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-12 px-6 text-[15px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200',
        'focus-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
