import type { DateRange } from '../value-objects/DateRange';

export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  readonly id: string;
  readonly carId: string;
  readonly customerName: string;
  readonly range: DateRange;
  readonly status: BookingStatus;
}
