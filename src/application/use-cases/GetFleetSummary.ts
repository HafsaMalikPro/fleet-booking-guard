import { utilization } from '@/src/domain/services/FleetMetrics';
import { protectedRevenue } from '@/src/domain/services/RevenueCalculator';
import { createDateRange } from '@/src/domain/value-objects/DateRange';
import type { FleetSummary } from '../dto/BookingDto';
import type { BookingRepository } from '../ports/BookingRepository';
import type { FleetRepository } from '../ports/FleetRepository';
import type { RevenueLedger } from '../ports/RevenueLedger';

export class GetFleetSummary {
  constructor(
    private readonly fleet: FleetRepository,
    private readonly bookings: BookingRepository,
    private readonly ledger: RevenueLedger,
  ) {}

  execute(from: Date, to: Date): FleetSummary {
    const cars = this.fleet.listCars();
    const inWindow = this.bookings.listByRange(from, to).filter((b) => b.status === 'confirmed');
    return {
      utilization: utilization(inWindow, cars.length, createDateRange(from, to)),
      bookingCount: inWindow.length,
      blockedCount: this.ledger.listBlocked().length,
      protectedRevenue: protectedRevenue(this.ledger.listProtected(), cars),
    };
  }
}
