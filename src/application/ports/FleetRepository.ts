import type { Car } from '@/src/domain/entities/Car';

export interface FleetRepository {
  listCars(): Car[];
  getCar(id: string): Car | undefined;
}
