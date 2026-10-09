import type { Booking } from '../entities/Booking';
import { durationMs, type DateRange } from '../value-objects/DateRange';

/** Share (0–1) of available car-time in `window` covered by confirmed bookings. */
export function utilization(
  bookings: readonly Booking[],
  carCount: number,
  window: DateRange,
): number {
  const capacity = carCount * durationMs(window);
  if (capacity === 0) return 0;
  const booked = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((total, b) => {
      const start = Math.max(b.range.start.getTime(), window.start.getTime());
      const end = Math.min(b.range.end.getTime(), window.end.getTime());
      return total + Math.max(0, end - start);
    }, 0);
  return Math.min(1, booked / capacity);
}

export const FleetMetrics = { utilization };
