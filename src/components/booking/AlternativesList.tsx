import { ArrowRight, Car as CarIcon } from 'lucide-react';
import type { Alternative } from '@/src/domain/services/AlternativeFinder';
import { formatCurrency } from '@/src/lib/formatCurrency';
import { Badge } from '@/src/components/common/Badge';
import { IconChip } from '@/src/components/common/IconChip';

export interface AlternativesListProps {
  alternatives: readonly Alternative[];
  onSelect: (carId: string) => void;
}

export function AlternativesList({ alternatives, onSelect }: AlternativesListProps) {
  if (alternatives.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-200 p-4 text-sm text-ink/60">
        No other car is free for this window.
      </p>
    );
  }
  // Already ranked by the domain; sorting again keeps the display honest if props change.
  const sorted = [...alternatives].sort((a, b) => a.totalPrice.cents - b.totalPrice.cents);

  return (
    <ul className="space-y-2" aria-label="Smart alternatives">
      {sorted.map((alt, index) => (
        <li key={alt.car.id}>
          <button
            type="button"
            onClick={() => onSelect(alt.car.id)}
            aria-label={`Book ${alt.car.name} for ${formatCurrency(alt.totalPrice.cents)}`}
            className="focus-ring group flex w-full items-center gap-3 rounded-xl border border-neutral-200/80 bg-white p-3 text-left transition-all duration-200 hover:-translate-y-px hover:border-brand-300 hover:shadow-glow"
          >
            <IconChip>
              <CarIcon className="h-4 w-4" />
            </IconChip>
            <span className="min-w-0 flex-1">
              <span
                className="block truncate text-sm font-semibold text-ink"
                data-testid="alt-name"
              >
                {alt.car.name}
              </span>
              <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/55">
                <span className="whitespace-nowrap">
                  {alt.car.category} · {formatCurrency(alt.car.dailyRateCents)}/day
                </span>
                {index === 0 && <Badge tone="buffer">Best price</Badge>}
              </span>
            </span>
            <span className="text-right">
              <span className="block text-sm font-bold tabular-nums text-ink">
                {formatCurrency(alt.totalPrice.cents)}
              </span>
              <span className="block text-xs text-ink/50">
                {alt.days} {alt.days === 1 ? 'day' : 'days'}
              </span>
            </span>
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white"
              aria-hidden="true"
            >
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
