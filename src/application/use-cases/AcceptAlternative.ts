import type { Booking } from '@/src/domain/entities/Booking';
import { findConflicts } from '@/src/domain/services/ConflictDetector';
import type { AcceptAlternativeInput, UnavailableError } from '../dto/BookingDto';
import type { BookingRepository } from '../ports/BookingRepository';
import type { FleetRepository } from '../ports/FleetRepository';
import type { RevenueLedger } from '../ports/RevenueLedger';
import { err, ok, type Result } from '../Result';

/**
 * Books a blocked request onto an alternative car (or the same car at its next free slot)
 * and records it as protected revenue.
 */
export class AcceptAlternative {
  constructor(
    private readonly fleet: FleetRepository,
    private readonly bookings: BookingRepository,
    private readonly ledger: RevenueLedger,
  ) {}

  execute(
    alternativeCarId: string,
    input: AcceptAlternativeInput,
  ): Result<Booking, UnavailableError> {
    if (!this.fleet.getCar(alternativeCarId)) {
      return err({ kind: 'unavailable', message: 'That car is no longer in the fleet.' });
    }
    const request = { carId: alternativeCarId, range: input.range };
    // Re-check: the calendar may have changed since the alternatives were computed.
    if (findConflicts(request, this.bookings.listAll(), input.bufferHours).length > 0) {
      return err({ kind: 'unavailable', message: 'That car was just booked for this window.' });
    }
    const booking = this.bookings.save({
      ...request,
      customerName: input.customerName,
      status: 'confirmed',
    });
    this.ledger.recordProtected(request);
    return ok(booking);
  }
}
