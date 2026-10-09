import { format } from 'date-fns';

export function formatDateTime(date: Date): string {
  return format(date, 'EEE, MMM d · h:mm a');
}

export function formatShortRange(start: Date, end: Date): string {
  return `${format(start, 'MMM d, h:mm a')} → ${format(end, 'MMM d, h:mm a')}`;
}

/** Value accepted by <input type="datetime-local">. */
export function toDateTimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}
