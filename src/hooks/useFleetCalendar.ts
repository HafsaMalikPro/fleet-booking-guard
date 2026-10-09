'use client';

import { addDays } from 'date-fns';
import { useMemo } from 'react';
import type { FleetCalendar, FleetSummary } from '@/src/application/dto/BookingDto';
import { useFleet } from '@/src/context/FleetProvider';

export type FleetCalendarState =
  | { status: 'loading' }
  | { status: 'empty'; calendar: FleetCalendar }
  | { status: 'ready'; calendar: FleetCalendar };

/** `from` is null until the client has mounted, so server and client markup match. */
export function useFleetCalendar(from: Date | null, days: number): FleetCalendarState {
  const { services, version } = useFleet();
  return useMemo<FleetCalendarState>(() => {
    if (!from) return { status: 'loading' };
    const calendar = services.getFleetCalendar.execute(from, addDays(from, days));
    return { status: calendar.rows.length === 0 ? 'empty' : 'ready', calendar };
    // `version` is a deliberate dependency: repositories are mutable and it signals changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, from, days, version]);
}

export function useRevenueProtected(): number {
  const { services, version } = useFleet();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => services.getRevenueProtected.execute().cents, [services, version]);
}

export function useFleetSummary(from: Date | null, days: number): FleetSummary | null {
  const { services, version } = useFleet();
  return useMemo(
    () => (from ? services.getFleetSummary.execute(from, addDays(from, days)) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [services, from, days, version],
  );
}
