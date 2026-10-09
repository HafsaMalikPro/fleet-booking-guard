import type { FleetCalendar } from '../dto/BookingDto';
import type { BookingRepository } from '../ports/BookingRepository';
import type { FleetRepository } from '../ports/FleetRepository';

export class GetFleetCalendar {
  constructor(
    private readonly fleet: FleetRepository,
    private readonly bookings: BookingRepository,
  ) {}

  execute(from: Date, to: Date): FleetCalendar {
    const active = this.bookings.listByRange(from, to).filter((b) => b.status === 'confirmed');
    const rows = this.fleet.listCars().map((car) => ({
      car,
      bookings: active
        .filter((b) => b.carId === car.id)
        .sort((a, b) => a.range.start.getTime() - b.range.start.getTime()),
    }));
    return { from, to, rows };
  }
}
