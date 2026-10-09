import { describe, expect, it } from 'vitest';
import { findConflicts } from '@/domain/services/ConflictDetector';
import { makeBooking, range } from '../fixtures';

const existing = makeBooking({ id: 'b1', carId: 'car-a', range: range(0, 24) });

describe('ConflictDetector.findConflicts', () => {
  it('detects a booking that overlaps the requested window', () => {
    const conflicts = findConflicts({ carId: 'car-a', range: range(12, 36) }, [existing], 0);
    expect(conflicts).toEqual([existing]);
  });

  it('flags a pickup 2 hours after a return when the buffer is 4 hours', () => {
    const conflicts = findConflicts({ carId: 'car-a', range: range(26, 48) }, [existing], 4);
    expect(conflicts).toHaveLength(1);
  });

  it('allows a pickup 2 hours after a return when the buffer is 0 hours', () => {
    expect(findConflicts({ carId: 'car-a', range: range(26, 48) }, [existing], 0)).toEqual([]);
  });

  it('allows a pickup exactly when the buffer ends', () => {
    expect(findConflicts({ carId: 'car-a', range: range(28, 48) }, [existing], 4)).toEqual([]);
  });

  it('enforces the buffer when the new rental returns shortly before an existing pickup', () => {
    const later = makeBooking({ id: 'b2', carId: 'car-a', range: range(50, 70) });
    expect(findConflicts({ carId: 'car-a', range: range(30, 48) }, [later], 4)).toEqual([later]);
    expect(findConflicts({ carId: 'car-a', range: range(30, 46) }, [later], 4)).toEqual([]);
  });

  it('ignores cancelled bookings', () => {
    const cancelled = { ...existing, status: 'cancelled' as const };
    expect(findConflicts({ carId: 'car-a', range: range(0, 24) }, [cancelled], 4)).toEqual([]);
  });

  it('ignores bookings on other cars', () => {
    expect(findConflicts({ carId: 'car-b', range: range(0, 24) }, [existing], 4)).toEqual([]);
  });
});
