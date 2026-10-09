import { describe, expect, it } from 'vitest';
import { DomainError, InvalidDateRangeError } from '@/src/domain/errors/DomainError';
import {
  createDateRange,
  durationDaysCeil,
  extendEnd,
  overlaps,
} from '@/src/domain/value-objects/DateRange';
import { at, range } from '../fixtures';

describe('DateRange', () => {
  it('rejects a range whose end is before its start', () => {
    expect(() => createDateRange(at(5), at(1))).toThrow(InvalidDateRangeError);
  });

  it('rejects a zero-length range as a DomainError', () => {
    expect(() => createDateRange(at(1), at(1))).toThrow(DomainError);
  });

  it('rejects invalid dates', () => {
    expect(() => createDateRange(new Date('nope'), at(1))).toThrow(InvalidDateRangeError);
  });

  it('treats back-to-back ranges as non-overlapping (half-open intervals)', () => {
    expect(overlaps(range(0, 24), range(24, 48))).toBe(false);
    expect(overlaps(range(24, 48), range(0, 24))).toBe(false);
  });

  it('detects partially overlapping ranges', () => {
    expect(overlaps(range(0, 24), range(23, 48))).toBe(true);
  });

  it('detects a range fully contained in another', () => {
    expect(overlaps(range(0, 48), range(10, 12))).toBe(true);
    expect(overlaps(range(10, 12), range(0, 48))).toBe(true);
  });

  it('does not report disjoint ranges as overlapping', () => {
    expect(overlaps(range(0, 10), range(20, 30))).toBe(false);
  });

  it('back-to-back ranges with zero buffer still do not overlap', () => {
    expect(overlaps(extendEnd(range(0, 24), 0), range(24, 48))).toBe(false);
  });

  it('rounds partial days up when computing rental days', () => {
    expect(durationDaysCeil(range(0, 24))).toBe(1);
    expect(durationDaysCeil(range(0, 25))).toBe(2);
    expect(durationDaysCeil(range(0, 1))).toBe(1);
  });
});
