import { Car as CarIcon } from 'lucide-react';
import type { CalendarRow } from '@/application/dto/BookingDto';
import { formatCurrency } from '@/lib/formatCurrency';
import { Badge } from './Badge';
import { Card } from './Card';
import { IconChip } from './IconChip';

export function FleetList({ rows }: { rows: readonly CalendarRow[] }) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold tracking-tight text-ink">Fleet</h2>
      <p className="text-sm text-ink/55">{rows.length} cars · bookings in the visible window</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ car, bookings }) => (
          <li
            key={car.id}
            className="flex items-center gap-3 rounded-xl border border-neutral-100 p-3 transition-shadow hover:shadow-glow"
          >
            <IconChip>
              <CarIcon className="h-4 w-4" />
            </IconChip>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{car.name}</p>
              <p className="text-xs text-ink/50">
                {car.category} · {car.plate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums text-ink">
                {formatCurrency(car.dailyRateCents)}
              </p>
              <Badge tone={bookings.length === 0 ? 'clear' : 'neutral'}>
                {bookings.length === 0 ? 'Clear' : `${bookings.length} booked`}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
