import { CheckCircle2, X } from 'lucide-react';
import { formatShortRange } from '@/lib/formatDate';
import type { DateRange } from '@/domain/value-objects/DateRange';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

export interface BookingConfirmationProps {
  carName: string;
  customerName: string;
  range: DateRange;
  viaAlternative: boolean;
  onDismiss: () => void;
}

export function BookingConfirmation({
  carName,
  customerName,
  range,
  viaAlternative,
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
      </div>
      <Button variant="ghost" size="sm" onClick={onDismiss} aria-label="Dismiss confirmation">
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </Card>
  );
}
