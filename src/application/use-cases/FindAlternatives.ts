import type { BookingRequest } from '@/src/domain/entities/BookingRequest';
import { find, type AlternativesResult } from '@/src/domain/services/AlternativeFinder';
import type { BookingRepository } from '../ports/BookingRepository';
import type { FleetRepository } from '../ports/FleetRepository';

export class FindAlternatives {
  constructor(
    private readonly fleet: FleetRepository,
    private readonly bookings: BookingRepository,
    private readonly latestEnd?: Date,
  ) {}

  execute(request: BookingRequest, bufferHours: number): AlternativesResult {
    return find(
      request,
      this.fleet.listCars(),
      this.bookings.listAll(),
      bufferHours,
      this.latestEnd,
    );
  }
}
