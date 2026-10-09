import type { BookingRepository, NewBooking } from '@/application/ports/BookingRepository';
import type { FleetRepository } from '@/application/ports/FleetRepository';
import type { RevenueLedger } from '@/application/ports/RevenueLedger';
import { AcceptAlternative } from '@/application/use-cases/AcceptAlternative';
import { CreateBooking } from '@/application/use-cases/CreateBooking';
import { FindAlternatives } from '@/application/use-cases/FindAlternatives';
import { GetFleetCalendar } from '@/application/use-cases/GetFleetCalendar';
import { GetRevenueProtected } from '@/application/use-cases/GetRevenueProtected';
import type { Booking } from '@/domain/entities/Booking';
import type { BookingRequest } from '@/domain/entities/BookingRequest';
import type { Car } from '@/domain/entities/Car';
import { overlaps } from '@/domain/value-objects/DateRange';

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
