import type { FleetRepository } from '@/application/ports/FleetRepository';
import type { Car } from '@/domain/entities/Car';

export class InMemoryFleetRepository implements FleetRepository {
  private readonly cars: Map<string, Car>;

  constructor(cars: readonly Car[]) {
    this.cars = new Map(cars.map((car) => [car.id, car]));
  }

  listCars(): Car[] {
    return [...this.cars.values()];
  }

  getCar(id: string): Car | undefined {
    return this.cars.get(id);
  }
}
