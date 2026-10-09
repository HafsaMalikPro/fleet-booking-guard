import { format } from 'date-fns';
import { describe, expect, it } from 'vitest';
import type { CreateBookingInput } from '@/src/application/dto/BookingDto';
import { at, makeBooking, makeCar, range } from '../fixtures';
import { buildUseCases } from './fakes';

const local = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

const cars = [
  makeCar({ id: 'tesla', dailyRateCents: 12000 }),
  makeCar({ id: 'corolla', dailyRateCents: 4500 }),
  makeCar({ id: 'rav4', dailyRateCents: 7500 }),
];
const existing = makeBooking({ id: 'b1', carId: 'tesla', range: range(0, 24) });

function input(overrides: Partial<CreateBookingInput> = {}): CreateBookingInput {
  return {
    carId: 'tesla',
    pickup: local(at(48)),
    returnAt: local(at(72)),
    bufferHours: 4,
    customerName: 'Dana Lee',
    ...overrides,
  };
}

describe('CreateBooking', () => {
  it('creates and saves the booking when the car is free', () => {
    const { createBooking, bookingRepo } = buildUseCases(cars, [existing]);

    const result = createBooking.execute(input());

    expect(result.ok && result.value.status).toBe('created');
    expect(bookingRepo.saved).toHaveLength(1);
    expect(bookingRepo.saved[0]).toMatchObject({ carId: 'tesla', customerName: 'Dana Lee' });
  });

  it('blocks a conflicting request and returns ranked alternatives and the next free slot', () => {
    const { createBooking, bookingRepo } = buildUseCases(cars, [existing]);

    const result = createBooking.execute(input({ pickup: local(at(26)), returnAt: local(at(50)) }));

    if (!result.ok || result.value.status !== 'conflict') throw new Error('expected a conflict');
    expect(result.value.conflicts.map((b) => b.id)).toEqual(['b1']);
    expect(result.value.alternatives.map((a) => a.car.id)).toEqual(['corolla', 'rav4']);
    expect(result.value.nextFreeSlot?.start).toEqual(at(28));
    expect(bookingRepo.saved).toHaveLength(0);
  });

  it('records the blocked request for revenue tracking', () => {
    const { createBooking, ledger } = buildUseCases(cars, [existing]);

    createBooking.execute(input({ pickup: local(at(10)), returnAt: local(at(30)) }));

    expect(ledger.blocked).toHaveLength(1);
    expect(ledger.blocked[0]?.carId).toBe('tesla');
  });

  it('returns a validation error on the return field when return is before pickup', () => {
    const { createBooking } = buildUseCases(cars);

    const result = createBooking.execute(input({ pickup: local(at(72)), returnAt: local(at(48)) }));

    expect(result).toEqual({
      ok: false,
      error: { kind: 'validation', field: 'returnAt', message: 'Return must be after pickup.' },
    });
  });

  it.each([
    [{ carId: 'unknown' }, 'carId'],
    [{ pickup: 'not a date' }, 'pickup'],
    [{ returnAt: '' }, 'returnAt'],
    [{ bufferHours: -1 }, 'bufferHours'],
  ] as const)('rejects invalid input %o on the %s field', (overrides, field) => {
    const { createBooking } = buildUseCases(cars);
    const result = createBooking.execute(input(overrides));
    expect(!result.ok && result.error.field).toBe(field);
  });

  it('falls back to a default customer name when none is given', () => {
    const { createBooking, bookingRepo } = buildUseCases(cars);
    createBooking.execute(input({ customerName: '   ' }));
    expect(bookingRepo.saved[0]?.customerName).toBe('Walk-in customer');
  });
});
