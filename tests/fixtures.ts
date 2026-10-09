import type { Booking } from '@/src/domain/entities/Booking';
import type { Car } from '@/src/domain/entities/Car';
import { createDateRange, type DateRange } from '@/src/domain/value-objects/DateRange';

/** Fixed reference instant so tests never depend on the wall clock. */
export const BASE = new Date('2030-01-07T10:00:00.000Z');

/** A Date `hours` after BASE. */
export function at(hours: number): Date {
  return new Date(BASE.getTime() + hours * 60 * 60 * 1000);
}

export function range(startHours: number, endHours: number): DateRange {
  return createDateRange(at(startHours), at(endHours));
}

export function makeCar(overrides: Partial<Car> & Pick<Car, 'id'>): Car {
  return {
    name: `Car ${overrides.id}`,
    category: 'Economy',
    plate: `PL-${overrides.id}`,
    dailyRateCents: 5000,
    ...overrides,
  };
}

export function makeBooking(
  overrides: Partial<Booking> & Pick<Booking, 'id' | 'carId' | 'range'>,
): Booking {
  return { customerName: 'Test Customer', status: 'confirmed', ...overrides };
}
