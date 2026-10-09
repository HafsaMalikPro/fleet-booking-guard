import { InvalidDateRangeError } from '../errors/DomainError';

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/** A half-open time interval [start, end). */
export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

export function createDateRange(start: Date, end: Date): DateRange {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    throw new InvalidDateRangeError(start, end);
  }
  return { start: new Date(start), end: new Date(end) };
}

/** Half-open overlap: ranges that only touch at an endpoint do not overlap. */
export function overlaps(a: DateRange, b: DateRange): boolean {
  return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();
}

export function extendEnd(range: DateRange, hours: number): DateRange {
  return { start: range.start, end: new Date(range.end.getTime() + hours * MS_PER_HOUR) };
}

export function durationMs(range: DateRange): number {
  return range.end.getTime() - range.start.getTime();
}

/** Whole rental days, rounding any partial day up. */
export function durationDaysCeil(range: DateRange): number {
  return Math.ceil(durationMs(range) / MS_PER_DAY);
}

export function shiftTo(range: DateRange, start: Date): DateRange {
  return { start: new Date(start), end: new Date(start.getTime() + durationMs(range)) };
}
