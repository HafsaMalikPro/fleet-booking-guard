import { CalendarCheck2, ShieldAlert, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatCurrency } from '@/src/lib/formatCurrency';
import { Badge } from '@/src/components/common/Badge';
import { Card } from '@/src/components/common/Card';

export interface FleetSummaryProps {
  windowLabel: string;
  /** 0–1 */
  utilization: number;
  bookingCount: number;
  blockedCount: number;
  protectedCents: number;
}

function Tile({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200/80 p-3 sm:p-4">
      <p className="flex items-center gap-1.5 truncate text-xs font-medium text-ink/55">
        <span className="text-brand-500" aria-hidden="true">
          {icon}
        </span>
        {label}
      </p>
      {children}
    </div>
  );
}

export function FleetSummary({
  windowLabel,
  utilization,
  bookingCount,
  blockedCount,
  protectedCents,
}: FleetSummaryProps) {
  const percent = Math.round(utilization * 100);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
          </span>
          <h2 className="text-sm font-semibold text-ink">Fleet · {windowLabel}</h2>
        </div>
        <Badge tone="live">Live</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2.5 p-4 sm:gap-4 sm:p-5 md:grid-cols-[1.2fr_repeat(3,1fr)]">
        <div className="col-span-3 flex flex-col justify-center pb-1 md:col-span-1 md:pb-0">
          <p className="text-xs font-medium text-ink/55">Revenue protected</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-ink tabular-nums">
            {formatCurrency(protectedCents)}
          </p>
          <p className="mt-1 text-xs text-ink/50">
            Recovered from blocked requests via smart alternatives
          </p>
        </div>
        <Tile label="Utilization" icon={<TrendingUp className="h-3.5 w-3.5" />}>
          <p className="mt-1 text-2xl font-bold tabular-nums text-ink">{percent}%</p>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100"
            role="meter"
            aria-label="Fleet utilization"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </Tile>
        <Tile label="Bookings" icon={<CalendarCheck2 className="h-3.5 w-3.5" />}>
          <p className="mt-1 text-2xl font-bold tabular-nums text-ink">{bookingCount}</p>
          <p className="mt-1 hidden text-xs text-ink/50 sm:block">confirmed in view</p>
        </Tile>
        <Tile label="Conflicts blocked" icon={<ShieldAlert className="h-3.5 w-3.5" />}>
          <p className="mt-1 text-2xl font-bold tabular-nums text-ink">{blockedCount}</p>
          <p className="mt-1 hidden text-xs text-ink/50 sm:block">double-bookings prevented</p>
        </Tile>
      </div>
    </Card>
  );
}
