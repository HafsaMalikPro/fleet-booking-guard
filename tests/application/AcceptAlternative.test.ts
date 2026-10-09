import { describe, expect, it } from 'vitest';
import { makeBooking, makeCar, range } from '../fixtures';
import { buildUseCases } from './fakes';

const cars = [
  makeCar({ id: 'tesla', dailyRateCents: 12000 }),
  makeCar({ id: 'corolla', dailyRateCents: 4500 }),
];

describe('AcceptAlternative', () => {
  it('creates the booking on the alternative car and increases protected revenue', () => {
    const { acceptAlternative, getRevenueProtected, bookingRepo } = buildUseCases(cars);
    expect(getRevenueProtected.execute().cents).toBe(0);

    const result = acceptAlternative.execute('corolla', {
      range: range(0, 30),
      bufferHours: 4,
      customerName: 'Sam Ortiz',
    });

    expect(result.ok && result.value.carId).toBe('corolla');
    expect(bookingRepo.saved).toHaveLength(1);
    // 30 hours rounds up to 2 days × $45.00
    expect(getRevenueProtected.execute().cents).toBe(9000);
  });

  it('accumulates protected revenue across accepted alternatives', () => {
    const { acceptAlternative, getRevenueProtected } = buildUseCases(cars);
    acceptAlternative.execute('corolla', {
      range: range(0, 24),
      bufferHours: 4,
      customerName: 'A',
    });
    acceptAlternative.execute('tesla', { range: range(0, 24), bufferHours: 4, customerName: 'B' });
    expect(getRevenueProtected.execute().cents).toBe(4500 + 12000);
  });

  it('refuses when the alternative was booked in the meantime, without counting revenue', () => {
    const taken = makeBooking({ id: 'b1', carId: 'corolla', range: range(0, 24) });
    const { acceptAlternative, getRevenueProtected } = buildUseCases(cars, [taken]);

    const result = acceptAlternative.execute('corolla', {
      range: range(10, 20),
      bufferHours: 4,
      customerName: 'Sam',
    });

    expect(result.ok).toBe(false);
    expect(getRevenueProtected.execute().cents).toBe(0);
  });

  it('refuses an unknown car', () => {
    const { acceptAlternative } = buildUseCases(cars);
    const result = acceptAlternative.execute('ghost', {
      range: range(0, 24),
      bufferHours: 0,
      customerName: 'Sam',
    });
    expect(!result.ok && result.error.kind).toBe('unavailable');
  });
});
