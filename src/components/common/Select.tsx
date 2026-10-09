'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/src/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
  /** Secondary line under the label, e.g. category and plate. */
  description?: string;
  /** Right-aligned detail, e.g. the daily rate. */
  meta?: string;
}

export interface SelectProps {
  id: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}

export function Select({
  id,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  icon,
  invalid = false,
  describedBy,
  className,
}: SelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const optionId = (index: number) => `${listId}-option-${index}`;

  function openList() {
    setActive(Math.max(selectedIndex, 0));
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    const last = options.length - 1;
    const moves: Record<string, () => number> = {
      ArrowDown: () => Math.min(active + 1, last),
      ArrowUp: () => Math.max(active - 1, 0),
      Home: () => 0,
      End: () => last,
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      setActive(move());
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(active);
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault();
      setOpen(false);
    } else if (event.key.length === 1) {
      // Typeahead: jump to the next option starting with the typed letter.
      const key = event.key.toLowerCase();
      const order = options.map((_, i) => (active + 1 + i) % options.length);
      const match = order.find((i) => options[i]?.label.toLowerCase().startsWith(key));
      if (match !== undefined) setActive(match);
    }
  }

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the active option in view while arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`)
      ?.scrollIntoView?.({ block: 'nearest' });
  });

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? optionId(active) : undefined}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={cn(
          'mt-1.5 flex h-11 w-full items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50/70 px-3.5 text-left text-sm text-ink transition-colors hover:border-neutral-300 focus:outline-none focus-visible:border-brand-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/15',
          open && 'border-brand-400 bg-white ring-4 ring-brand-500/15',
          invalid && 'border-brand-500 bg-brand-50/50',
        )}
      >
        {icon && <span className="shrink-0 text-brand-500">{icon}</span>}
        <span className={cn('flex-1 truncate', !selected && 'text-ink/35')}>
          {selected ? selected.label : placeholder}
        </span>
        {selected?.meta && (
          <span className="shrink-0 text-xs font-semibold tabular-nums text-ink/55">
            {selected.meta}
          </span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-ink/45 transition-transform',
            open && 'rotate-180 text-brand-500',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={id}
          tabIndex={-1}
          className="absolute left-0 right-0 z-30 mt-2 max-h-72 animate-fade-in-up overflow-y-auto rounded-2xl border border-neutral-200/80 bg-white p-1.5 shadow-card"
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const isActive = index === active;
            return (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(index)}
                // Keep focus on the trigger so keyboard handling stays in one place.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                  isActive && !isSelected && 'bg-brand-50',
                  isSelected && 'bg-brand-50/80',
                )}
              >
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate text-sm font-semibold',
                      isSelected || isActive ? 'text-brand-700' : 'text-ink',
                    )}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="block truncate text-xs text-ink/50">{option.description}</span>
                  )}
                </span>
                {option.meta && (
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                      isSelected ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-ink/65',
                    )}
                  >
                    {option.meta}
                  </span>
                )}
                <Check
                  className={cn('h-4 w-4 shrink-0 text-brand-500', !isSelected && 'invisible')}
                  aria-hidden="true"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
