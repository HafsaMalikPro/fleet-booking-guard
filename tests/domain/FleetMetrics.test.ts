import { describe, expect, it } from 'vitest';
import { utilization } from '@/domain/services/FleetMetrics';
import { makeBooking, range } from '../fixtures';

describe('FleetMetrics.utilization', () => {
  it('is the booked share of total car-time, clipped to the window', () => {
    const bookings = [
      makeBooking({ id: 'a', carId: 'x', range: range(0, 12) }),
      // Only 6 of these 12 hours fall inside the 24h window.
      makeBooking({ id: 'b', carId: 'y', range: range(18, 30) }),
    ];
    // 18 booked hours / (2 cars × 24h) = 0.375
    expect(utilization(bookings, 2, range(0, 24))).toBe(0.375);
  });

  it('ignores cancelled bookings and handles an empty fleet', () => {
    const cancelled = makeBooking({
      id: 'c',
      carId: 'x',
      range: range(0, 24),
      status: 'cancelled',
    });
    expect(utilization([cancelled], 1, range(0, 24))).toBe(0);
    expect(utilization([], 0, range(0, 24))).toBe(0);
  });
});
