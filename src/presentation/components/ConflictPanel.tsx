import { AlertTriangle, CalendarCheck, X } from 'lucide-react';
import type { Booking } from '@/domain/entities/Booking';
import type { Alternative } from '@/domain/services/AlternativeFinder';
import type { DateRange } from '@/domain/value-objects/DateRange';
import { formatShortRange } from '@/lib/formatDate';
import { AlternativesList } from './AlternativesList';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { IconChip } from './IconChip';

export interface ConflictPanelProps {
  carName: string;
  conflicts: readonly Booking[];
  alternatives: readonly Alternative[];
  nextFreeSlot: DateRange | null;
  bufferHours: number;
  error?: string | null;
  onSelectAlternative: (carId: string) => void;
  onBookNextSlot: () => void;
  onDismiss: () => void;
}

export function ConflictPanel({
  carName,
  conflicts,
  alternatives,
  nextFreeSlot,
  bufferHours,
  error,
  onSelectAlternative,
  onBookNextSlot,
  onDismiss,
}: ConflictPanelProps) {
  return (
    <Card className="motion-safe:animate-fade-in-up border-brand-200 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <IconChip className="bg-brand-500 text-white ring-brand-500">
          <AlertTriangle className="h-5 w-5" />
        </IconChip>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-ink">Booking blocked</h2>
            <Badge tone="conflict">Conflict</Badge>
            {bufferHours > 0 && <Badge tone="buffer">Buffer applied · {bufferHours}h</Badge>}
          </div>
          <p className="mt-1 text-sm text-ink/60">{carName} is not available for this window.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onDismiss} aria-label="Dismiss conflict">
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink/50">
        Conflicting bookings
      </h3>
      <ul className="mt-2 space-y-1.5">
        {conflicts.map((booking) => (
          <li
            key={booking.id}
            className="flex flex-wrap items-center justify-between gap-x-3 rounded-lg bg-neutral-50 px-3 py-2 text-sm"
          >
            <span className="font-medium text-ink">{booking.customerName}</span>
            <span className="text-ink/60">
              {formatShortRange(booking.range.start, booking.range.end)}
            </span>
          </li>
        ))}
      </ul>

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink/50">
        Smart alternatives <span className="normal-case tracking-normal">· cheapest first</span>
      </h3>
      <div className="mt-2">
        <AlternativesList alternatives={alternatives} onSelect={onSelectAlternative} />
      </div>

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink/50">
        Next free slot on {carName}
      </h3>
      {nextFreeSlot ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 p-3">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <CalendarCheck className="h-4 w-4 text-brand-500" aria-hidden="true" />
            {formatShortRange(nextFreeSlot.start, nextFreeSlot.end)}
          </span>
          <Button size="sm" onClick={onBookNextSlot}>
            Book this slot
          </Button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-ink/60">No free slot in the next 30 days.</p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-brand-700">
          {error}
        </p>
      )}
    </Card>
  );
}
