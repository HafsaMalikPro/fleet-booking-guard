import type { RevenueLedger } from '@/src/application/ports/RevenueLedger';
import type { BookingRequest } from '@/src/domain/entities/BookingRequest';

export class InMemoryRevenueLedger implements RevenueLedger {
  private readonly blocked: BookingRequest[] = [];
  private readonly protectedRequests: BookingRequest[] = [];

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
