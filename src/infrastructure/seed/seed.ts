import { addDays, addHours, endOfMonth, isAfter, setHours, startOfDay } from 'date-fns';
import type { Booking, BookingStatus } from '@/src/domain/entities/Booking';
import type { Car } from '@/src/domain/entities/Car';
import { createDateRange } from '@/src/domain/value-objects/DateRange';

export const SEED_CARS: readonly Car[] = [
  {
    id: 'car-corolla',
    name: 'Toyota Corolla',
    category: 'Economy',
    plate: '8KDL214',
    dailyRateCents: 4500,
  },
  {
    id: 'car-civic',
    name: 'Honda Civic',
    category: 'Compact',
    plate: '7XRT903',
    dailyRateCents: 5200,
  },
  { id: 'car-rav4', name: 'Toyota RAV4', category: 'SUV', plate: '9BHN551', dailyRateCents: 7800 },
  {
    id: 'car-model3',
    name: 'Tesla Model 3',
    category: 'Electric',
    plate: 'EV42TSL',
    dailyRateCents: 9500,
  },
  {
    id: 'car-cherokee',
    name: 'Jeep Grand Cherokee',
    category: 'SUV',
    plate: '6JPC718',
    dailyRateCents: 11000,
  },
  {
    id: 'car-bmw5',
    name: 'BMW 5 Series',
    category: 'Luxury',
    plate: '5BMW530',
    dailyRateCents: 14900,
  },
  {
    id: 'car-sprinter',
    name: 'Mercedes Sprinter',
    category: 'Van',
    plate: '3VAN288',
    dailyRateCents: 18900,
  },
];

// [carId, day offset from today, pickup hour, duration in hours, customer, status]
type SeedRow = readonly [string, number, number, number, string, BookingStatus?];

const ROWS: readonly SeedRow[] = [
  ['car-corolla', 0, 9, 48, 'Maya Patel'],
  ['car-corolla', 2, 14, 72, 'Jordan Brooks'], // 5h turnaround after Maya
  ['car-corolla', 8, 10, 96, 'Elena Rossi'],
  ['car-corolla', 15, 9, 48, 'Chris Nguyen'],
  ['car-corolla', 22, 12, 120, 'Priya Shah'],
  ['car-civic', 1, 10, 72, 'Liam Carter'],
  ['car-civic', 6, 8, 48, 'Sofia Garcia'],
  ['car-civic', 10, 12, 24, 'Noah Kim', 'cancelled'],
  ['car-civic', 13, 10, 120, 'Ava Thompson'],
  ['car-civic', 24, 9, 72, 'Ethan Wright'],
  ['car-rav4', 0, 12, 120, 'Olivia Martin'],
  ['car-rav4', 5, 17, 48, 'Lucas Silva'], // tight 5h turnaround
  ['car-rav4', 12, 9, 72, 'Mia Johnson'],
  ['car-rav4', 19, 10, 96, 'Henry Adams'],
  ['car-model3', 1, 9, 48, 'Zoe Bennett'],
  ['car-model3', 3, 15, 96, 'Daniel Okafor'], // 6h turnaround
  ['car-model3', 9, 10, 48, 'Grace Liu'],
  ['car-model3', 16, 10, 72, 'Samuel Reed', 'cancelled'],
  ['car-model3', 20, 9, 48, 'Isla Murphy'],
  ['car-model3', 26, 10, 72, 'Leo Fischer'],
  ['car-cherokee', 4, 10, 72, 'Harper Lewis'],
  ['car-cherokee', 14, 9, 96, 'Mateo Cruz'],
  ['car-bmw5', 2, 11, 48, 'Amelia Clark'],
  ['car-bmw5', 11, 10, 72, 'Benjamin Hall'],
  ['car-bmw5', 21, 12, 48, 'Chloe Young'],
  ['car-sprinter', 7, 8, 48, 'Riverside Events Co.'],
];

/**
 * Builds bookings relative to `now`, keeping only those that finish within the current
 * month, so the demo never shows bookings in later months.
 */
export function createSeed(now: Date): { cars: Car[]; bookings: Booking[] } {
  const today = startOfDay(now);
  const monthEnd = endOfMonth(now);
  const bookings = ROWS.map(([carId, day, hour, hours, customerName, status], index) => {
    const start = setHours(addDays(today, day), hour);
    return {
      id: `bk-${String(index + 1).padStart(3, '0')}`,
      carId,
      customerName,
      status: status ?? 'confirmed',
      range: createDateRange(start, addHours(start, hours)),
    } satisfies Booking;
  }).filter((booking) => !isAfter(booking.range.end, monthEnd));
  return { cars: [...SEED_CARS], bookings };
}
