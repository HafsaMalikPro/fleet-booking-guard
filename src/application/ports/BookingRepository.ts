import type { Booking } from '@/domain/entities/Booking';

export type NewBooking = Omit<Booking, 'id'>;

export interface BookingRepository {
  listAll(): Booking[];
  /** Bookings whose range intersects [from, to). */
  listByRange(from: Date, to: Date): Booking[];
  /** Persists the booking and assigns its id. */
  save(booking: NewBooking): Booking;
}
