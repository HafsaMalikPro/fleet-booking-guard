import type { BookingRepository, NewBooking } from '@/application/ports/BookingRepository';
import type { Booking } from '@/domain/entities/Booking';
import { overlaps } from '@/domain/value-objects/DateRange';

export class InMemoryBookingRepository implements BookingRepository {
  private readonly bookings = new Map<string, Booking>();
  private sequence = 0;

  constructor(seed: readonly Booking[] = []) {
    seed.forEach((booking) => this.bookings.set(booking.id, booking));
  }

  listAll(): Booking[] {
    return [...this.bookings.values()];
  }

  listByRange(from: Date, to: Date): Booking[] {
    const window = { start: from, end: to };
    return this.listAll().filter((booking) => overlaps(booking.range, window));
  }

  save(booking: NewBooking): Booking {
    this.sequence += 1;
    const created: Booking = { ...booking, id: `bk-new-${this.sequence}` };
    this.bookings.set(created.id, created);
    return created;
  }
}
