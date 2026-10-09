import type { Car } from '@/domain/entities/Car';

export interface FleetRepository {
  listCars(): Car[];
  getCar(id: string): Car | undefined;
}
