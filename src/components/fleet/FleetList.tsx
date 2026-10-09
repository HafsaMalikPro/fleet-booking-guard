import { addDays, format } from 'date-fns';
import { BatteryCharging, Bus, Car as CarIcon, CarFront, Gem, type LucideIcon } from 'lucide-react';
import type { CalendarRow } from '@/src/application/dto/BookingDto';
import type { Booking } from '@/src/domain/entities/Booking';
import type { CarCategory } from '@/src/domain/entities/Car';
import { utilization } from '@/src/domain/services/FleetMetrics';
import { createDateRange } from '@/src/domain/value-objects/DateRange';
import { cn } from '@/src/lib/cn';
import { formatCurrency } from '@/src/lib/formatCurrency';
import { Card } from '@/src/components/common/Card';
import { IconChip } from '@/src/components/common/IconChip';

export interface FleetListProps {
  rows: readonly CalendarRow[];
  from: Date;
  days: number;
  now: Date;
}

const CATEGORY_ICONS: Record<CarCategory, LucideIcon> = {
  Economy: CarIcon,
  Compact: CarIcon,
  SUV: CarFront,
  Luxury: Gem,
  Electric: BatteryCharging,
  Van: Bus,
};

const COLUMNS = 'md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,1.2fr)_96px]';

type Status = { onRent: true; until: Date } | { onRent: false; next: Date | null };

function statusAt(bookings: readonly Booking[], now: Date): Status {
  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const current = confirmed.find((b) => b.range.start <= now && now < b.range.end);
  if (current) return { onRent: true, until: current.range.end };
  const upcoming = confirmed
    .filter((b) => b.range.start > now)
    .sort((a, b) => a.range.start.getTime() - b.range.start.getTime());
  return { onRent: false, next: upcoming[0]?.range.start ?? null };
}

export function FleetList({ rows, from, days, now }: FleetListProps) {
  const window = createDateRange(from, addDays(from, days));
  const fleet = rows.map((row) => ({
    ...row,
    status: statusAt(row.bookings, now),
    share: utilization(row.bookings, 1, window),
  }));
  const onRent = fleet.filter((car) => car.status.onRent).length;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-neutral-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink">Fleet</h2>
          <p className="text-sm text-muted">
            {rows.length} cars · utilization over the visible window
          </p>
        </div>
        <div className="flex gap-2 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-brand-700 ring-1 ring-inset ring-brand-200/70">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            {onRent} on rent
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-inset ring-emerald-200/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {rows.length - onRent} available
          </span>
        </div>
      </div>

      <div
        className={cn(
          'hidden gap-4 border-b border-neutral-100 bg-neutral-50/60 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/80',
          COLUMNS,
        )}
        aria-hidden="true"
      >
        <span>Vehicle</span>
        <span>Status</span>
        <span>Utilization</span>
        <span className="text-right">Daily rate</span>
      </div>

      <ul className="divide-y divide-neutral-100">
        {fleet.map(({ car, bookings, status, share }) => {
          const Icon = CATEGORY_ICONS[car.category];
          const percent = Math.round(share * 100);
          const booked = bookings.filter((b) => b.status === 'confirmed').length;
          return (
            <li
              key={car.id}
              className={cn(
                'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-5 py-3.5 transition-colors hover:bg-neutral-50/60',
                COLUMNS,
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <IconChip className="h-9 w-9 rounded-lg">
                  <Icon className="h-4 w-4" />
                </IconChip>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink" title={car.name}>
                    {car.name}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    {car.category}
                    <span
                      className="rounded bg-neutral-100 px-1.5 py-px font-mono text-[10px] tracking-wide text-ink/70"
                      aria-label={`Plate ${car.plate}`}
                    >
                      {car.plate}
                    </span>
                  </p>
                </div>
              </div>

              <p className="text-right text-sm font-bold tabular-nums text-ink md:order-last">
                {formatCurrency(car.dailyRateCents)}
                <span className="font-medium text-muted">/day</span>
              </p>

              <div className="text-xs">
                {status.onRent ? (
                  <>
                    <p className="flex items-center gap-1.5 font-semibold text-brand-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
                      On rent
                    </p>
                    <p className="mt-0.5 text-muted">
                      Back {format(status.until, 'EEE d MMM, HH:mm')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="flex items-center gap-1.5 font-semibold text-emerald-700">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                        aria-hidden="true"
                      />
                      Available
                    </p>
                    <p className="mt-0.5 text-muted">
                      {status.next
                        ? `Next out ${format(status.next, 'EEE d MMM')}`
                        : 'No upcoming bookings'}
                    </p>
                  </>
                )}
              </div>

              <div className="col-span-2 md:col-span-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold tabular-nums text-ink">{percent}%</span>
                  <span className="text-muted">
                    {booked} {booked === 1 ? 'booking' : 'bookings'}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100"
                  role="progressbar"
                  aria-label={`${car.name} utilization`}
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
