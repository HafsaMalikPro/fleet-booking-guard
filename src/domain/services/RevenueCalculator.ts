import type { BookingRequest } from '../entities/BookingRequest';
import type { Car } from '../entities/Car';
import { durationDaysCeil } from '../value-objects/DateRange';
import { addMoney, money, multiplyMoney, ZERO, type Money } from '../value-objects/Money';

export function priceFor(car: Car, request: BookingRequest): Money {
  return multiplyMoney(money(car.dailyRateCents), durationDaysCeil(request.range));
}

/** Sum of (days rounded up × daily rate) for each request. Requests for unknown cars are ignored. */
export function protectedRevenue(
  blockedRequests: readonly BookingRequest[],
  cars: readonly Car[],
): Money {
  const carsById = new Map(cars.map((car) => [car.id, car]));
  return blockedRequests.reduce<Money>((total, request) => {
    const car = carsById.get(request.carId);
    return car ? addMoney(total, priceFor(car, request)) : total;
  }, ZERO);
}

export const RevenueCalculator = { protectedRevenue, priceFor };
