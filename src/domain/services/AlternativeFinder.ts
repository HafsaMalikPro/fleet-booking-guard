import { addDays } from 'date-fns';
import type { Booking } from '../entities/Booking';
import type { BookingRequest } from '../entities/BookingRequest';
import type { Car } from '../entities/Car';
import { durationDaysCeil, extendEnd, shiftTo, type DateRange } from '../value-objects/DateRange';
import type { Money } from '../value-objects/Money';
import { findConflicts } from './ConflictDetector';
import { priceFor } from './RevenueCalculator';

export const NEXT_SLOT_SEARCH_DAYS = 30;

export interface Alternative {
  readonly car: Car;
  readonly days: number;
  readonly totalPrice: Money;
}

export interface AlternativesResult {
  readonly alternatives: Alternative[];
  readonly nextFreeSlot: DateRange | null;
}

function findAlternativeCars(
  request: BookingRequest,
  cars: readonly Car[],
  bookings: readonly Booking[],
  bufferHours: number,
): Alternative[] {
  const days = durationDaysCeil(request.range);
  return cars
    .filter((car) => car.id !== request.carId)
    .filter(
      (car) =>
        findConflicts({ carId: car.id, range: request.range }, bookings, bufferHours).length === 0,
    )
    .map((car) => ({
      car,
      days,
      totalPrice: priceFor(car, { carId: car.id, range: request.range }),
    }))
    .sort((a, b) => a.car.dailyRateCents - b.car.dailyRateCents);
}

/**
 * Earliest start at or after the requested start where the requested duration fits.
 * The earliest feasible start is always either the requested start itself or the moment a
 * blocking booking's buffer ends, so only those candidates need checking.
 */
function findNextFreeSlot(
  request: BookingRequest,
  bookings: readonly Booking[],
  bufferHours: number,
): DateRange | null {
  const from = request.range.start.getTime();
  const limit = addDays(request.range.start, NEXT_SLOT_SEARCH_DAYS).getTime();
  const candidates = bookings
    .filter((b) => b.carId === request.carId && b.status === 'confirmed')
    .map((b) => extendEnd(b.range, bufferHours).end.getTime())
    .filter((time) => time >= from);

  const sorted = [from, ...candidates].sort((a, b) => a - b);
  for (const start of sorted) {
    if (start > limit) break;
    const slot = shiftTo(request.range, new Date(start));
    if (findConflicts({ carId: request.carId, range: slot }, bookings, bufferHours).length === 0) {
      return slot;
    }
  }
  return null;
}

export function find(
  request: BookingRequest,
  cars: readonly Car[],
  bookings: readonly Booking[],
  bufferHours: number,
): AlternativesResult {
  return {
    alternatives: findAlternativeCars(request, cars, bookings, bufferHours),
    nextFreeSlot: findNextFreeSlot(request, bookings, bufferHours),
  };
}

export const AlternativeFinder = { find };
