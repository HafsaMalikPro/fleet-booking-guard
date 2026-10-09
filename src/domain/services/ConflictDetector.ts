import type { Booking } from '../entities/Booking';
import type { BookingRequest } from '../entities/BookingRequest';
import { extendEnd, overlaps } from '../value-objects/DateRange';

/**
 * A booking conflicts with the request when, on the same car, their ranges overlap once each
 * range is extended by the turnaround buffer after its end. Extending both sides means the
 * buffer is enforced whichever rental comes first (see docs/DECISIONS.md, ADR-004).
 */
export function findConflicts(
  request: BookingRequest,
  bookings: readonly Booking[],
  bufferHours: number,
): Booking[] {
  const requested = extendEnd(request.range, bufferHours);
  return bookings.filter(
    (booking) =>
      booking.carId === request.carId &&
      booking.status === 'confirmed' &&
      overlaps(requested, extendEnd(booking.range, bufferHours)),
  );
}

export const ConflictDetector = { findConflicts };
