import { CalendarRange, CheckCircle2, X } from 'lucide-react';
import { formatShortRange } from '@/src/lib/formatDate';
import type { DateRange } from '@/src/domain/value-objects/DateRange';
import { Badge } from '@/src/components/common/Badge';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';

export interface BookingConfirmationProps {
  carName: string;
  customerName: string;
  range: DateRange;
  viaAlternative: boolean;
  /** Pages the timeline to the new booking and scrolls to it. */
  onViewOnTimeline?: () => void;
  onDismiss: () => void;
}

export function BookingConfirmation({
  carName,
  customerName,
  range,
  viaAlternative,
  onViewOnTimeline,
  onDismiss,
}: BookingConfirmationProps) {
  return (
    <Card className="motion-safe:animate-fade-in-up flex items-start gap-3 border-emerald-200 p-4">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-ink">Booking confirmed</p>
          <Badge tone="clear">Clear</Badge>
          {viaAlternative && <Badge tone="buffer">Revenue protected</Badge>}
        </div>
        <p className="mt-1 text-sm text-ink/65">
          {carName} for {customerName} · {formatShortRange(range.start, range.end)}
        </p>
        {onViewOnTimeline && (
          <button
            type="button"
            onClick={onViewOnTimeline}
            className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-full text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
            View on timeline
          </button>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onDismiss} aria-label="Dismiss confirmation">
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </Card>
  );
}
