import { CarFront } from 'lucide-react';
import { Card } from './Card';
import { IconChip } from './IconChip';

export function LoadingCard({ label, className }: { label: string; className?: string }) {
  return (
    <Card className={className} aria-busy="true">
      <div className="space-y-3 p-5" role="status">
        <span className="sr-only">{label}</span>
        <div className="h-5 w-40 rounded-md bg-neutral-100 motion-safe:animate-pulse" />
        <div className="h-4 w-64 rounded-md bg-neutral-100 motion-safe:animate-pulse" />
        <div className="h-24 rounded-xl bg-neutral-100/70 motion-safe:animate-pulse" />
      </div>
    </Card>
  );
}

export function EmptyFleet() {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <IconChip className="h-12 w-12">
        <CarFront className="h-6 w-6" />
      </IconChip>
      <h2 className="text-lg font-bold text-ink">No cars in your fleet yet</h2>
      <p className="max-w-sm text-sm text-ink/60">
        Add a car to start taking bookings. Conflicts and buffers will show up here.
      </p>
    </Card>
  );
}
