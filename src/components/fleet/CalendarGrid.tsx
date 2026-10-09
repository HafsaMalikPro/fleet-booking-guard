'use client';

import { addDays, addHours, format, isSameDay, isWeekend } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { CalendarRow } from '@/application/dto/BookingDto';
import type { Booking } from '@/domain/entities/Booking';
import type { DateRange } from '@/domain/value-objects/DateRange';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatShortRange } from '@/lib/formatDate';
import { Button } from './Button';
import { Card } from './Card';

export interface CalendarGridProps {
  rows: readonly CalendarRow[];
  from: Date;
  days: number;
  now: Date;
  bufferHours: number;
  /** The request being checked, drawn as a dashed outline. */
  highlight?: { carId: string; range: DateRange } | null;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

interface Tooltip {
  booking: Booking;
  carName: string;
  x: number;
  y: number;
}

/** Position of [start, end) as left/width percentages of the visible window, or null if hidden. */
function place(start: Date, end: Date, from: Date, to: Date) {
  const total = to.getTime() - from.getTime();
  const left = Math.max(start.getTime(), from.getTime()) - from.getTime();
  const right = Math.min(end.getTime(), to.getTime()) - from.getTime();
  if (right <= left) return null;
  return { left: `${(left / total) * 100}%`, width: `${((right - left) / total) * 100}%` };
}

export function CalendarGrid({
  rows,
  from,
  days,
  now,
  bufferHours,
  highlight,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: CalendarGridProps) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const to = addDays(from, days);
  const dayList = Array.from({ length: days }, (_, i) => addDays(from, i));
  const nowPosition = place(now, addHours(now, 0.01), from, to);

  const showTooltip = (booking: Booking, carName: string, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    setTooltip({ booking, carName, x: rect.left + rect.width / 2, y: rect.top });
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink">Fleet timeline</h2>
          <p className="text-sm text-ink/55">
            {format(from, 'MMM d')} – {format(addDays(to, -1), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-xs font-medium text-ink/60 sm:flex">
            <span className="flex items-center gap-1.5 rounded-full bg-neutral-50 px-2.5 py-1 ring-1 ring-inset ring-neutral-200/70">
              <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" /> Booking
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-neutral-50 px-2.5 py-1 ring-1 ring-inset ring-neutral-200/70">
              <span className="buffer-stripes h-2 w-3 rounded-sm" aria-hidden="true" />
              Buffer ({bufferHours}h)
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onNext}
              disabled={!canGoNext}
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto" onScroll={() => setTooltip(null)}>
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[176px_1fr] border-b border-neutral-100">
            <div className="flex items-end px-5 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/40">
              Car
            </div>
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))` }}
            >
              {dayList.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] leading-none text-ink/45',
                    isWeekend(day) && 'bg-neutral-50/80',
                  )}
                >
                  <span>{format(day, 'EEE')}</span>
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-ink/80',
                      isSameDay(day, now) && 'bg-brand-500 text-white shadow-cta',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ul>
            {rows.map(({ car, bookings }) => {
              const isHighlighted = highlight?.carId === car.id;
              const outline = isHighlighted
                ? place(highlight.range.start, highlight.range.end, from, to)
                : null;
              return (
                <li
                  key={car.id}
                  className={cn(
                    'grid grid-cols-[176px_1fr] border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50/50',
                    isHighlighted && 'bg-brand-50/60 hover:bg-brand-50/60',
                  )}
                >
                  <div className="flex flex-col justify-center px-5 py-3">
                    <p className="truncate text-sm font-semibold text-ink">{car.name}</p>
                    <p className="text-xs text-ink/45">
                      {car.category} · {formatCurrency(car.dailyRateCents)}/day
                    </p>
                  </div>
                  <div className="relative h-[60px]">
                    <div
                      className="absolute inset-0 grid"
                      style={{ gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))` }}
                      aria-hidden="true"
                    >
                      {dayList.map((day) => (
                        <div
                          key={day.toISOString()}
                          className={cn(
                            'border-l border-neutral-100',
                            isWeekend(day) && 'bg-neutral-50/80',
                          )}
                        />
                      ))}
                    </div>
                    {nowPosition && (
                      <div
                        className="absolute inset-y-0 w-0.5 rounded-full bg-brand-500/70"
                        style={{ left: nowPosition.left }}
                        aria-hidden="true"
                      />
                    )}
                    {bookings.map((booking) => {
                      const block = place(booking.range.start, booking.range.end, from, to);
                      const buffer =
                        bufferHours > 0
                          ? place(
                              booking.range.end,
                              addHours(booking.range.end, bufferHours),
                              from,
                              to,
                            )
                          : null;
                      const label = `${booking.customerName}, ${car.name}, ${formatShortRange(booking.range.start, booking.range.end)}`;
                      return (
                        <div key={booking.id}>
                          {buffer && (
                            <div
                              className="buffer-stripes absolute top-3 h-9 rounded-r-lg"
                              style={buffer}
                              aria-hidden="true"
                            />
                          )}
                          {block && (
                            <div
                              tabIndex={0}
                              role="img"
                              aria-label={label}
                              onMouseEnter={(e) => showTooltip(booking, car.name, e.currentTarget)}
                              onFocus={(e) => showTooltip(booking, car.name, e.currentTarget)}
                              onMouseLeave={() => setTooltip(null)}
                              onBlur={() => setTooltip(null)}
                              className="focus-ring absolute top-3 flex h-9 cursor-default items-center overflow-hidden rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 px-2.5 text-xs font-semibold text-white shadow-sm shadow-brand-500/30 ring-1 ring-inset ring-white/20 transition-all hover:from-brand-600 hover:to-brand-500 hover:shadow-md"
                              style={block}
                            >
                              <span className="truncate">{booking.customerName}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {outline && (
                      <div
                        className="pointer-events-none absolute top-1.5 h-12 rounded-xl border-2 border-dashed border-ink/60 bg-ink/[0.03]"
                        style={outline}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 w-64 -translate-x-1/2 -translate-y-full rounded-xl bg-ink px-3 py-2.5 text-xs text-white shadow-xl"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <p className="font-semibold">{tooltip.booking.customerName}</p>
          <p className="text-white/70">{tooltip.carName}</p>
          <p className="mt-1 text-white/90">
            {formatShortRange(tooltip.booking.range.start, tooltip.booking.range.end)}
          </p>
          {bufferHours > 0 && (
            <p className="mt-1 text-brand-300">+ {bufferHours}h turnaround buffer after return</p>
          )}
        </div>
      )}
    </Card>
  );
}
