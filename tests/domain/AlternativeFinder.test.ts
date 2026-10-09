import { describe, expect, it } from 'vitest';
import { find } from '@/domain/services/AlternativeFinder';
import { at, makeBooking, makeCar, range } from '../fixtures';

const cars = [
  makeCar({ id: 'requested', dailyRateCents: 9000 }),
  makeCar({ id: 'premium', dailyRateCents: 15000 }),
  makeCar({ id: 'budget', dailyRateCents: 4500 }),
  makeCar({ id: 'busy', dailyRateCents: 3000 }),
  makeCar({ id: 'mid', dailyRateCents: 7000 }),
];

const blockRequested = makeBooking({ id: 'b1', carId: 'requested', range: range(0, 48) });
const blockBusy = makeBooking({ id: 'b2', carId: 'busy', range: range(10, 30) });

describe('AlternativeFinder.find', () => {
  it('returns only free cars, cheapest first, excluding the requested car', () => {
    const { alternatives } = find(
      { carId: 'requested', range: range(12, 36) },
      cars,
      [blockRequested, blockBusy],
      4,
    );
    expect(alternatives.map((a) => a.car.id)).toEqual(['budget', 'mid', 'premium']);
  });

  it('prices each alternative for the whole window with days rounded up', () => {
    const { alternatives } = find(
      { carId: 'requested', range: range(12, 37) },
      cars,
      [blockRequested],
      4,
    );
    const budget = alternatives.find((a) => a.car.id === 'budget');
    expect(budget?.days).toBe(2);
    expect(budget?.totalPrice.cents).toBe(9000);
  });

  it('finds the next free slot right after the blocking booking and its buffer', () => {
    const { nextFreeSlot } = find(
      { carId: 'requested', range: range(12, 36) },
      cars,
      [blockRequested],
      4,
    );
    expect(nextFreeSlot?.start).toEqual(at(52));
    expect(nextFreeSlot?.end).toEqual(at(76));
  });

  it('skips gaps that are too short for the requested duration', () => {
    const second = makeBooking({ id: 'b3', carId: 'requested', range: range(60, 80) });
    // Gap between 52h and 60h minus the 4h buffer is too short for a 24h rental.
    const { nextFreeSlot } = find(
      { carId: 'requested', range: range(12, 36) },
      cars,
      [blockRequested, second],
      4,
    );
    expect(nextFreeSlot?.start).toEqual(at(84));
  });

  it('returns null when the car has no free slot within 30 days', () => {
    const longBlock = makeBooking({ id: 'b4', carId: 'requested', range: range(0, 24 * 40) });
    const { nextFreeSlot } = find(
      { carId: 'requested', range: range(12, 36) },
      cars,
      [longBlock],
      4,
    );
    expect(nextFreeSlot).toBeNull();
  });
});
