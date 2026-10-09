import { describe, expect, it } from 'vitest';
import { at, makeBooking, makeCar, range } from '../fixtures';
import { buildUseCases } from './fakes';

describe('GetFleetCalendar', () => {
  it('returns every car with its confirmed bookings in the window, ordered by start', () => {
    const cars = [makeCar({ id: 'a' }), makeCar({ id: 'b' })];
    const bookings = [
      makeBooking({ id: 'late', carId: 'a', range: range(50, 60) }),
      makeBooking({ id: 'early', carId: 'a', range: range(10, 20) }),
      makeBooking({ id: 'cancelled', carId: 'a', range: range(30, 40), status: 'cancelled' }),
      makeBooking({ id: 'outside', carId: 'b', range: range(500, 520) }),
    ];
    const { getFleetCalendar } = buildUseCases(cars, bookings);

    const calendar = getFleetCalendar.execute(at(0), at(100));

    expect(calendar.rows.map((r) => r.car.id)).toEqual(['a', 'b']);
    expect(calendar.rows[0]?.bookings.map((b) => b.id)).toEqual(['early', 'late']);
    expect(calendar.rows[1]?.bookings).toEqual([]);
  });
});
