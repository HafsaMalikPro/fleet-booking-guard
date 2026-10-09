import type { RevenueLedger } from '@/application/ports/RevenueLedger';
import type { BookingRequest } from '@/domain/entities/BookingRequest';

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
