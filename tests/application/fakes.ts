import type { BookingRepository, NewBooking } from '@/src/application/ports/BookingRepository';
import type { FleetRepository } from '@/src/application/ports/FleetRepository';
import type { RevenueLedger } from '@/src/application/ports/RevenueLedger';
import { AcceptAlternative } from '@/src/application/use-cases/AcceptAlternative';
import { CreateBooking } from '@/src/application/use-cases/CreateBooking';
import { FindAlternatives } from '@/src/application/use-cases/FindAlternatives';
import { GetFleetCalendar } from '@/src/application/use-cases/GetFleetCalendar';
import { GetRevenueProtected } from '@/src/application/use-cases/GetRevenueProtected';
import type { Booking } from '@/src/domain/entities/Booking';
import type { BookingRequest } from '@/src/domain/entities/BookingRequest';
import type { Car } from '@/src/domain/entities/Car';
import { overlaps } from '@/src/domain/value-objects/DateRange';

export class FakeFleet implements FleetRepository {
  constructor(private readonly cars: Car[]) {}
  listCars(): Car[] {
    return [...this.cars];
  }
  getCar(id: string): Car | undefined {
    return this.cars.find((c) => c.id === id);
  }
}

export class FakeBookings implements BookingRepository {
  readonly saved: Booking[] = [];
  constructor(private readonly items: Booking[] = []) {}
  listAll(): Booking[] {
    return [...this.items];
  }
  listByRange(from: Date, to: Date): Booking[] {
    return this.items.filter((b) => overlaps(b.range, { start: from, end: to }));
  }
  save(booking: NewBooking): Booking {
    const created = { ...booking, id: `new-${this.items.length + 1}` };
    this.items.push(created);
    this.saved.push(created);
    return created;
  }
}

export class FakeLedger implements RevenueLedger {
  readonly blocked: BookingRequest[] = [];
  readonly protectedRequests: BookingRequest[] = [];
  recordBlocked(request: BookingRequest): void {
    this.blocked.push(request);
  }
  recordProtected(request: BookingRequest): void {
    this.protectedRequests.push(request);
  }
  listBlocked(): BookingRequest[] {
    return [...this.blocked];
  }
  listProtected(): BookingRequest[] {
    return [...this.protectedRequests];
  }
}

export function buildUseCases(cars: Car[], bookings: Booking[] = []) {
  const fleet = new FakeFleet(cars);
  const bookingRepo = new FakeBookings(bookings);
  const ledger = new FakeLedger();
  const findAlternatives = new FindAlternatives(fleet, bookingRepo);
  return {
    bookingRepo,
    ledger,
    createBooking: new CreateBooking(fleet, bookingRepo, ledger, findAlternatives),
    acceptAlternative: new AcceptAlternative(fleet, bookingRepo, ledger),
    getRevenueProtected: new GetRevenueProtected(fleet, ledger),
    getFleetCalendar: new GetFleetCalendar(fleet, bookingRepo),
  };
}
