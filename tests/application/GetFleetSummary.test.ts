import { describe, expect, it } from 'vitest';
import { GetFleetSummary } from '@/src/application/use-cases/GetFleetSummary';
import { at, makeBooking, makeCar, range } from '../fixtures';
import { FakeBookings, FakeFleet, FakeLedger } from './fakes';

describe('GetFleetSummary', () => {
  it('reports utilization, bookings in the window, blocked requests and protected revenue', () => {
    const fleet = new FakeFleet([makeCar({ id: 'a', dailyRateCents: 5000 }), makeCar({ id: 'b' })]);
    const bookings = new FakeBookings([
      makeBooking({ id: '1', carId: 'a', range: range(0, 24) }),
      makeBooking({ id: '2', carId: 'b', range: range(0, 24), status: 'cancelled' }),
      makeBooking({ id: '3', carId: 'b', range: range(100, 120) }),
    ]);
    const ledger = new FakeLedger();
    ledger.recordBlocked({ carId: 'a', range: range(0, 24) });
    ledger.recordProtected({ carId: 'a', range: range(0, 48) });

    const summary = new GetFleetSummary(fleet, bookings, ledger).execute(at(0), at(48));

    expect(summary).toEqual({
      utilization: 0.25,
      bookingCount: 1,
      blockedCount: 1,
      protectedRevenue: { cents: 10000 },
    });
  });
});
