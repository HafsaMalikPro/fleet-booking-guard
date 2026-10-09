'use client';

import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/src/lib/cn';
import { toDateTimeLocal } from '@/src/lib/formatDate';

export interface DateTimePickerProps {
  id: string;
  /** `yyyy-MM-ddTHH:mm`, the same format as <input type="datetime-local">. */
  value: string;
  onChange: (value: string) => void;
  /** Days before this one can't be picked. */
  minDate?: Date;
  /** Trip span drawn behind the days, so both pickers show the whole rental. */
  rangeStart?: string;
  rangeEnd?: string;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const SLOT_MINUTES = 30;
const TIME_SLOTS = Array.from({ length: (24 * 60) / SLOT_MINUTES }, (_, i) => {
  const minutes = i * SLOT_MINUTES;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});

function parseValue(value: string | undefined): Date | null {
  if (!value) return null;
  const date = parse(value, "yyyy-MM-dd'T'HH:mm", new Date());
  return isValid(date) ? date : null;
}

function monthGrid(month: Date): Date[] {
  const days: Date[] = [];
  const last = endOfWeek(endOfMonth(month));
  for (let day = startOfWeek(startOfMonth(month)); !isAfter(day, last); day = addDays(day, 1)) {
    days.push(day);
  }
  return days;
}

function slotLabel(slot: string) {
  return format(parse(slot, 'HH:mm', new Date()), 'h:mm a');
}

export function DateTimePicker({
  id,
  value,
  onChange,
  minDate,
  rangeStart,
  rangeEnd,
  invalid = false,
  describedBy,
  className,
}: DateTimePickerProps) {
  const dialogId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const timeListRef = useRef<HTMLDivElement>(null);
  const keyboardNav = useRef(false);

  const selected = parseValue(value);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(selected ?? new Date()));
  const [focused, setFocused] = useState<Date>(() => startOfDay(selected ?? new Date()));

  const start = parseValue(rangeStart);
  const end = parseValue(rangeEnd);
  const minDay = minDate ? startOfDay(minDate) : null;
  const time = selected ? format(selected, 'HH:mm') : '10:00';
  const slots = TIME_SLOTS.includes(time) ? TIME_SLOTS : [...TIME_SLOTS, time].sort();

  const isDisabled = (day: Date) => (minDay ? isBefore(day, minDay) : false);

  function openPicker() {
    const preferred = startOfDay(selected ?? new Date());
    const anchor = minDay && isBefore(preferred, minDay) ? minDay : preferred;
    setMonth(startOfMonth(anchor));
    setFocused(anchor);
    keyboardNav.current = true; // move focus onto the selected day
    setOpen(true);
  }

  function close(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function commit(day: Date, slot: string) {
    const [hours = 0, minutes = 0] = slot.split(':').map(Number);
    const next = new Date(day);
    next.setHours(hours, minutes, 0, 0);
    onChange(toDateTimeLocal(next));
  }

  function selectDay(day: Date) {
    if (isDisabled(day)) return;
    setFocused(day);
    if (!isSameMonth(day, month)) setMonth(startOfMonth(day));
    commit(day, time);
  }

  function moveFocus(day: Date) {
    setFocused(day);
    if (!isSameMonth(day, month)) setMonth(startOfMonth(day));
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      PageUp: () => addMonths(focused, -1),
      PageDown: () => addMonths(focused, 1),
      Home: () => startOfWeek(focused),
      End: () => endOfWeek(focused),
    };
    const move = moves[event.key];
    keyboardNav.current = true;
    if (move) {
      event.preventDefault();
      moveFocus(startOfDay(move()));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectDay(focused);
    }
  }

  // Close on outside click, and on Escape wherever focus is.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Keep keyboard focus on the roving day button, even when the month re-renders.
  useEffect(() => {
    if (!open || !keyboardNav.current) return;
    keyboardNav.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus();
  }, [focused, month, open]);

  // Bring the selected time into view when the picker opens.
  useEffect(() => {
    if (!open) return;
    const active = timeListRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    active?.scrollIntoView?.({ block: 'center' });
  }, [open]);

  const days = monthGrid(month);
  const prevDisabled = minDay ? !isAfter(month, startOfMonth(minDay)) : false;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        onClick={() => (open ? close(false) : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={cn(
          'mt-1.5 flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50/70 px-3.5 text-left text-sm text-ink transition-colors hover:border-neutral-300 focus:outline-none focus-visible:border-brand-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/15',
          open && 'border-brand-400 bg-white ring-4 ring-brand-500/15',
          invalid && 'border-brand-500 bg-brand-50/50',
        )}
      >
        <span className={cn('truncate', !selected && 'text-ink/35')}>
          {selected ? format(selected, 'EEE, MMM d, yyyy · h:mm a') : 'Select date and time'}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-modal="false"
          aria-label="Choose date and time"
          className="absolute left-0 right-0 z-30 mt-2 min-w-[300px] animate-fade-in-up rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-card"
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold text-ink" aria-live="polite">
              {format(month, 'MMMM yyyy')}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setMonth((m) => addMonths(m, -1))}
                disabled={prevDisabled}
                aria-label="Previous month"
                className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-brand-50 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setMonth((m) => addMonths(m, 1))}
                aria-label="Next month"
                className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            className="mt-3 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-muted/80"
            aria-hidden="true"
          >
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div
            ref={gridRef}
            role="grid"
            aria-label={format(month, 'MMMM yyyy')}
            onKeyDown={onGridKeyDown}
            className="grid grid-cols-7 gap-y-1"
          >
            {days.map((day) => {
              const isSelected = selected ? isSameDay(day, selected) : false;
              const isStart = start ? isSameDay(day, start) : false;
              const isEnd = end ? isSameDay(day, end) : false;
              const inRange =
                start && end && isAfter(end, start)
                  ? !isBefore(day, startOfDay(start)) && !isAfter(day, startOfDay(end))
                  : false;
              const disabled = isDisabled(day);
              return (
                <div
                  key={day.toISOString()}
                  role="gridcell"
                  className={cn(
                    'flex justify-center',
                    inRange && 'bg-brand-50',
                    inRange && (isStart || day.getDay() === 0) && 'rounded-l-full',
                    inRange && (isEnd || day.getDay() === 6) && 'rounded-r-full',
                  )}
                >
                  <button
                    type="button"
                    tabIndex={isSameDay(day, focused) ? 0 : -1}
                    // aria-disabled keeps blocked days focusable, so arrow keys can cross them.
                    aria-disabled={disabled || undefined}
                    onClick={() => selectDay(day)}
                    aria-label={format(day, 'EEEE, MMMM d, yyyy')}
                    aria-pressed={isSelected}
                    className={cn(
                      'focus-ring relative inline-flex h-9 w-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors',
                      isSameMonth(day, month) ? 'text-ink' : 'text-ink/30',
                      !isSelected && !disabled && 'hover:bg-brand-100/70',
                      inRange && !isSelected && 'text-brand-700',
                      (isStart || isEnd) &&
                        !isSelected &&
                        'font-semibold ring-1 ring-inset ring-brand-300',
                      isSelected && 'bg-brand-500 font-semibold text-white shadow-cta',
                      disabled && 'cursor-not-allowed text-ink/20',
                    )}
                  >
                    {format(day, 'd')}
                    {isToday(day) && !isSelected && (
                      <span
                        className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-500"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t border-neutral-100 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/80">
              Time
            </p>
            <div
              ref={timeListRef}
              role="listbox"
              aria-label="Time"
              className="mt-2 grid max-h-32 grid-cols-4 gap-1.5 overflow-y-auto pr-1"
            >
              {slots.map((slot) => {
                const isActive = slot === time;
                return (
                  <button
                    key={slot}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => commit(selected ?? focused, slot)}
                    className={cn(
                      'focus-ring h-8 whitespace-nowrap rounded-lg text-xs font-medium tabular-nums transition-colors',
                      isActive
                        ? 'bg-brand-500 text-white'
                        : 'bg-neutral-50 text-ink/75 ring-1 ring-inset ring-neutral-200/70 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200',
                    )}
                  >
                    {slotLabel(slot)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => selectDay(startOfDay(new Date()))}
              disabled={isDisabled(startOfDay(new Date()))}
              className="focus-ring rounded-full px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-30"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => close()}
              className="focus-ring inline-flex h-8 items-center rounded-full bg-brand-500 px-4 text-xs font-semibold text-white shadow-cta transition-colors hover:bg-brand-600"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
