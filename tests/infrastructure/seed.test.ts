import { describe, expect, it } from 'vitest';
import { findConflicts } from '@/domain/services/ConflictDetector';
import { createSeed } from '@/infrastructure/seed/seed';
import { InMemoryBookingRepository } from '@/infrastructure/repositories/InMemoryBookingRepository';
import { BASE, at } from '../fixtures';

describe('seed data', () => {
  const { cars, bookings } = createSeed(BASE);

  it('has a realistic fleet and enough bookings', () => {
    expect(cars.length).toBeGreaterThanOrEqual(6);
    expect(bookings.length).toBeGreaterThanOrEqual(20);
    expect(bookings.some((b) => b.status === 'cancelled')).toBe(true);
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
