import { protectedRevenue } from '@/src/domain/services/RevenueCalculator';
import type { Money } from '@/src/domain/value-objects/Money';
import type { FleetRepository } from '../ports/FleetRepository';
import type { RevenueLedger } from '../ports/RevenueLedger';

export class GetRevenueProtected {
  constructor(
    private readonly fleet: FleetRepository,
    private readonly ledger: RevenueLedger,
  ) {}

  execute(): Money {
    return protectedRevenue(this.ledger.listProtected(), this.fleet.listCars());
  }
}
