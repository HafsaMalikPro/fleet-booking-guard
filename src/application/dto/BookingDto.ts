import type { Booking } from '@/domain/entities/Booking';
import type { Car } from '@/domain/entities/Car';
import type { Alternative } from '@/domain/services/AlternativeFinder';
import type { DateRange } from '@/domain/value-objects/DateRange';
import type { Money } from '@/domain/value-objects/Money';

/** Raw form input. Dates are `datetime-local` strings (local time). */
export interface CreateBookingInput {
  readonly carId: string;
  readonly pickup: string;
  readonly returnAt: string;
  readonly bufferHours: number;
  readonly customerName?: string;
}

export type ValidationField = 'carId' | 'pickup' | 'returnAt' | 'bufferHours';

export interface ValidationError {
  readonly kind: 'validation';
  readonly field: ValidationField;
  readonly message: string;
}

export interface UnavailableError {
  readonly kind: 'unavailable';
  readonly message: string;
}

export type CreateBookingOutcome =
  | { readonly status: 'created'; readonly booking: Booking }
  | {
      readonly status: 'conflict';
      readonly request: { readonly carId: string; readonly range: DateRange };
      readonly bufferHours: number;
      readonly customerName: string;
      readonly conflicts: Booking[];
      readonly alternatives: Alternative[];
      readonly nextFreeSlot: DateRange | null;
    };

export interface AcceptAlternativeInput {
  readonly range: DateRange;
  readonly bufferHours: number;
  readonly customerName: string;
}

export interface CalendarRow {
  readonly car: Car;
  readonly bookings: Booking[];
}

export interface FleetCalendar {
  readonly from: Date;
  readonly to: Date;
  readonly rows: CalendarRow[];
}

export interface FleetSummary {
  /** 0–1 share of car-time booked in the window. */
  readonly utilization: number;
  readonly bookingCount: number;
  readonly blockedCount: number;
  readonly protectedRevenue: Money;
}
