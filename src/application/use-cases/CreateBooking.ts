import { isValid, parseISO } from 'date-fns';
import { findConflicts } from '@/domain/services/ConflictDetector';
import { createDateRange, type DateRange } from '@/domain/value-objects/DateRange';
import type {
  CreateBookingInput,
  CreateBookingOutcome,
  ValidationError,
  ValidationField,
} from '../dto/BookingDto';
import type { BookingRepository } from '../ports/BookingRepository';
import type { FleetRepository } from '../ports/FleetRepository';
import type { RevenueLedger } from '../ports/RevenueLedger';
import { err, ok, type Result } from '../Result';
import type { FindAlternatives } from './FindAlternatives';

export const DEFAULT_CUSTOMER = 'Walk-in customer';

function invalid(field: ValidationField, message: string): ValidationError {
  return { kind: 'validation', field, message };
}

interface ValidRequest {
  readonly carId: string;
  readonly range: DateRange;
  readonly bufferHours: number;
}

export function validateBookingInput(
  input: CreateBookingInput,
  carExists: (id: string) => boolean,
): Result<ValidRequest, ValidationError> {
  if (!input.carId || !carExists(input.carId)) {
    return err(invalid('carId', 'Select a car from the fleet.'));
  }
  const pickup = parseISO(input.pickup);
  if (!isValid(pickup)) return err(invalid('pickup', 'Enter a valid pickup date and time.'));
  const returnAt = parseISO(input.returnAt);
  if (!isValid(returnAt)) return err(invalid('returnAt', 'Enter a valid return date and time.'));
  if (returnAt <= pickup) return err(invalid('returnAt', 'Return must be after pickup.'));
  if (!Number.isFinite(input.bufferHours) || input.bufferHours < 0) {
    return err(invalid('bufferHours', 'Buffer must be zero or more hours.'));
  }
  return ok({
    carId: input.carId,
    range: createDateRange(pickup, returnAt),
    bufferHours: input.bufferHours,
  });
}

export class CreateBooking {
  constructor(
    private readonly fleet: FleetRepository,
    private readonly bookings: BookingRepository,
    private readonly ledger: RevenueLedger,
    private readonly findAlternatives: FindAlternatives,
  ) {}

  execute(input: CreateBookingInput): Result<CreateBookingOutcome, ValidationError> {
    const validated = validateBookingInput(input, (id) => this.fleet.getCar(id) !== undefined);
    if (!validated.ok) return validated;

    const { carId, range, bufferHours } = validated.value;
    const request = { carId, range };
    const customerName = input.customerName?.trim() || DEFAULT_CUSTOMER;
    const conflicts = findConflicts(request, this.bookings.listAll(), bufferHours);

    if (conflicts.length === 0) {
      const booking = this.bookings.save({ carId, range, customerName, status: 'confirmed' });
      return ok({ status: 'created', booking });
    }

    this.ledger.recordBlocked(request);
    const { alternatives, nextFreeSlot } = this.findAlternatives.execute(request, bufferHours);
    return ok({
      status: 'conflict',
      request,
      bufferHours,
      customerName,
      conflicts,
      alternatives,
      nextFreeSlot,
    });
  }
}
