import type { BookingRequest } from '@/domain/entities/BookingRequest';

/** Tracks requests blocked by a conflict and those recovered via an alternative. */
export interface RevenueLedger {
  recordBlocked(request: BookingRequest): void;
  recordProtected(request: BookingRequest): void;
  listBlocked(): BookingRequest[];
  listProtected(): BookingRequest[];
}
