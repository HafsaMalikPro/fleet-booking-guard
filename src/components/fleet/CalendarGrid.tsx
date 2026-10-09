'use client';

import { addDays, addHours, format, isSameDay, isWeekend } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { CalendarRow } from '@/src/application/dto/BookingDto';
import type { Booking } from '@/src/domain/entities/Booking';
import type { DateRange } from '@/src/domain/value-objects/DateRange';
import { cn } from '@/src/lib/cn';
import { formatCurrency } from '@/src/lib/formatCurrency';
import { formatShortRange } from '@/src/lib/formatDate';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';

export interface CalendarGridProps {
  id?: string;
  rows: readonly CalendarRow[];
  from: Date;
  days: number;
  now: Date;
  bufferHours: number;
  /** The request being checked, drawn as a dashed outline. */
  highlight?: { carId: string; range: DateRange } | null;
  /** The booking just created; drawn with a ring and a "New" tag. */
  recentBookingId?: string | null;
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

const CAR_COLUMN = 'grid-cols-[200px_1fr]';
/** Bars narrower than this many hours drop their label; the tooltip still names the customer. */
const MIN_LABEL_HOURS = 18;

/** Position of [start, end) as left/width percentages of the visible window, or null if hidden. */
function place(start: Date, end: Date, from: Date, to: Date) {
  const total = to.getTime() - from.getTime();
  const left = Math.max(start.getTime(), from.getTime()) - from.getTime();
  const right = Math.min(end.getTime(), to.getTime()) - from.getTime();
  if (right <= left) return null;
  return {
    left: `${(left / total) * 100}%`,
    width: `${((right - left) / total) * 100}%`,
    visibleHours: (right - left) / 3_600_000,
    clippedStart: start.getTime() < from.getTime(),
    clippedEnd: end.getTime() > to.getTime(),
  };
}

export function CalendarGrid({
  id,
  rows,
  from,
  days,
  now,
  bufferHours,
  highlight,
  recentBookingId,
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
    <Card id={id} className="scroll-mt-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink">Fleet timeline</h2>
          <p className="text-sm text-muted">
            {format(from, 'MMM d')} – {format(addDays(to, -1), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-xs font-medium text-muted sm:flex">
            <span className="flex items-center gap-1.5 rounded-full bg-neutral-50 px-2.5 py-1 ring-1 ring-inset ring-neutral-200/70">
              <span className="h-2 w-3 rounded-sm bg-brand-500" aria-hidden="true" /> Booking
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-neutral-50 px-2.5 py-1 ring-1 ring-inset ring-neutral-200/70">
              <span className="buffer-stripes h-2 w-3 rounded-sm" aria-hidden="true" />
              Buffer ({bufferHours}h)
            </span>
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              aria-label="Previous week"
              className="w-9 px-0"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onNext}
              disabled={!canGoNext}
              aria-label="Next week"
              className="w-9 px-0"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto" onScroll={() => setTooltip(null)}>
        <div className="min-w-[760px]">
          <div className={cn('grid border-b border-neutral-100', CAR_COLUMN)}>
            <div className="flex items-end px-5 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/80">
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
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] leading-none text-muted',
                    isWeekend(day) && 'bg-neutral-50/80',
                    isSameDay(day, now) && 'bg-brand-50/70 font-semibold text-brand-600',
                  )}
                >
                  <span>{format(day, 'EEE')}</span>
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-ink',
                      isSameDay(day, now) && 'bg-brand-500 text-white',
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
                    'grid border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50/50',
                    CAR_COLUMN,
                    isHighlighted && 'bg-brand-50/60 hover:bg-brand-50/60',
                  )}
                >
                  <div className="flex min-w-0 flex-col justify-center px-5 py-3">
                    <p className="truncate text-sm font-semibold text-ink" title={car.name}>
                      {car.name}
                    </p>
                    <p className="truncate text-xs text-muted">
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
                            isSameDay(day, now) && 'bg-brand-50/50',
                          )}
                        />
                      ))}
                    </div>
                    {nowPosition && (
                      <div
                        className="absolute inset-y-0 z-10 w-px -translate-x-1/2 bg-brand-500"
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
                      const hasBuffer = Boolean(buffer);
                      const isRecent = booking.id === recentBookingId;
                      const label = `${isRecent ? 'New booking: ' : ''}${booking.customerName}, ${car.name}, ${formatShortRange(booking.range.start, booking.range.end)}`;
                      return (
                        <div key={booking.id}>
                          {buffer && (
                            <div
                              className={cn(
                                'buffer-stripes absolute top-1/2 h-8 -translate-y-1/2',
                                !buffer.clippedEnd && 'rounded-r-md',
                              )}
                              style={{ left: buffer.left, width: buffer.width }}
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
                              className={cn(
                                'focus-ring absolute top-1/2 flex h-8 -translate-y-1/2 cursor-default items-center gap-1 overflow-hidden rounded-md bg-brand-500 px-2 text-xs font-medium text-white transition-colors hover:bg-brand-600',
                                block.clippedStart && 'rounded-l-none pl-1.5',
                                isRecent &&
                                  'z-20 bg-ink ring-2 ring-brand-500 ring-offset-2 ring-offset-white hover:bg-ink motion-safe:animate-pop',
                                block.clippedEnd && 'pr-1.5',
                                (block.clippedEnd || hasBuffer) && 'rounded-r-none',
                              )}
                              style={{ left: block.left, width: block.width }}
                            >
                              {block.clippedStart && (
                                <ChevronLeft
                                  className="h-3 w-3 shrink-0 opacity-80"
                                  aria-hidden="true"
                                />
                              )}
                              {isRecent && (
                                <span className="shrink-0 rounded bg-brand-500 px-1 py-px text-[9px] font-bold uppercase tracking-wider">
                                  New
                                </span>
                              )}
                              {block.visibleHours >= MIN_LABEL_HOURS && (
                                <span className="truncate">{booking.customerName}</span>
                              )}
                              {block.clippedEnd && (
                                <ChevronRight
                                  className="ml-auto h-3 w-3 shrink-0 opacity-80"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {outline && (
                      <div
                        className="pointer-events-none absolute top-1/2 h-11 -translate-y-1/2 rounded-lg border-2 border-dashed border-ink/60 bg-ink/[0.03]"
                        style={{ left: outline.left, width: outline.width }}
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
