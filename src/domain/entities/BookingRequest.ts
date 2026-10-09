import type { DateRange } from '../value-objects/DateRange';

export interface BookingRequest {
  readonly carId: string;
  readonly range: DateRange;
}
