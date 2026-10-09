import { describe, expect, it } from 'vitest';
import { findConflicts } from '@/src/domain/services/ConflictDetector';
import { createSeed } from '@/src/infrastructure/seed/seed';
import { InMemoryBookingRepository } from '@/src/infrastructure/repositories/InMemoryBookingRepository';
import { BASE, at } from '../fixtures';

describe('seed data', () => {
  const { cars, bookings } = createSeed(BASE);

  it('has a realistic fleet and enough bookings', () => {
    expect(cars.length).toBeGreaterThanOrEqual(6);
    expect(bookings.length).toBeGreaterThanOrEqual(20);
    expect(bookings.some((b) => b.status === 'cancelled')).toBe(true);
  });

  it('keeps every booking inside the current month', () => {
    const october9 = new Date(2026, 9, 9, 15);
    const seeded = createSeed(october9).bookings;
    expect(seeded.length).toBeGreaterThan(0);
    for (const booking of seeded) {
      expect(booking.range.start.getMonth()).toBe(9);
      expect(booking.range.end.getMonth()).toBe(9);
    }
    // The rows that would spill into November are dropped.
    const names = seeded.map((b) => b.customerName);
    for (const name of [
      'Priya Shah',
      'Ethan Wright',
      'Henry Adams',
      'Leo Fischer',
      'Chloe Young',
    ]) {
      expect(names).not.toContain(name);
    }
  });

  it('is internally consistent: no confirmed booking conflicts with another under a 4h buffer', () => {
    for (const booking of bookings.filter((b) => b.status === 'confirmed')) {
      const others = bookings.filter((b) => b.id !== booking.id);
      expect(findConflicts(booking, others, 4)).toEqual([]);
    }
  });
});

describe('InMemoryBookingRepository', () => {
  it('assigns ids on save and filters by range', () => {
    const repo = new InMemoryBookingRepository();
    const saved = repo.save({
      carId: 'x',
      customerName: 'Test',
      status: 'confirmed',
      range: { start: at(0), end: at(10) },
    });
    expect(saved.id).toBeTruthy();
    expect(repo.listByRange(at(5), at(6))).toEqual([saved]);
    expect(repo.listByRange(at(10), at(20))).toEqual([]);
  });
});
