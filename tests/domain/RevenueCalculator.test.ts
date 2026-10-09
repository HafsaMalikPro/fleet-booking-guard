import { describe, expect, it } from 'vitest';
import { protectedRevenue } from '@/src/domain/services/RevenueCalculator';
import { makeCar, range } from '../fixtures';

const cars = [
  makeCar({ id: 'a', dailyRateCents: 4599 }),
  makeCar({ id: 'b', dailyRateCents: 12950 }),
];

describe('RevenueCalculator.protectedRevenue', () => {
  it('rounds a partial day up to a whole day', () => {
    expect(protectedRevenue([{ carId: 'a', range: range(0, 26) }], cars).cents).toBe(9198);
  });

  it('keeps exact integer cents', () => {
    const total = protectedRevenue(
      [
        { carId: 'a', range: range(0, 24) },
        { carId: 'a', range: range(0, 24) },
        { carId: 'a', range: range(0, 24) },
      ],
      cars,
    );
    expect(total.cents).toBe(13797);
    expect(Number.isInteger(total.cents)).toBe(true);
  });

  it('sums across multiple requests on different cars', () => {
    const total = protectedRevenue(
      [
        { carId: 'a', range: range(0, 48) },
        { carId: 'b', range: range(0, 72) },
      ],
      cars,
    );
    expect(total.cents).toBe(2 * 4599 + 3 * 12950);
  });

  it('returns zero for no requests and ignores unknown cars', () => {
    expect(protectedRevenue([], cars).cents).toBe(0);
    expect(protectedRevenue([{ carId: 'ghost', range: range(0, 24) }], cars).cents).toBe(0);
  });
});
