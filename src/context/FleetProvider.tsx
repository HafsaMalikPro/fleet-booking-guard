'use client';

import { endOfMonth } from 'date-fns';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AcceptAlternative } from '@/src/application/use-cases/AcceptAlternative';
import { CreateBooking } from '@/src/application/use-cases/CreateBooking';
import { FindAlternatives } from '@/src/application/use-cases/FindAlternatives';
import { GetFleetCalendar } from '@/src/application/use-cases/GetFleetCalendar';
import { GetFleetSummary } from '@/src/application/use-cases/GetFleetSummary';
import { GetRevenueProtected } from '@/src/application/use-cases/GetRevenueProtected';
import { InMemoryBookingRepository } from '@/src/infrastructure/repositories/InMemoryBookingRepository';
import { InMemoryFleetRepository } from '@/src/infrastructure/repositories/InMemoryFleetRepository';
import { InMemoryRevenueLedger } from '@/src/infrastructure/repositories/InMemoryRevenueLedger';
import { createSeed } from '@/src/infrastructure/seed/seed';

export interface FleetServices {
  readonly getFleetCalendar: GetFleetCalendar;
  readonly getFleetSummary: GetFleetSummary;
  readonly createBooking: CreateBooking;
  readonly acceptAlternative: AcceptAlternative;
  readonly getRevenueProtected: GetRevenueProtected;
}

interface FleetContextValue {
  readonly services: FleetServices;
  /** Bumped after every mutation so readers re-query the repositories. */
  readonly version: number;
  readonly notifyChanged: () => void;
}

const FleetContext = createContext<FleetContextValue | null>(null);

/** Composition root: the only place that knows about concrete infrastructure. */
export function createFleetServices(now: Date): FleetServices {
  const seed = createSeed(now);
  const fleet = new InMemoryFleetRepository(seed.cars);
  const bookings = new InMemoryBookingRepository(seed.bookings);
  const ledger = new InMemoryRevenueLedger();
  // Bookings are limited to the current month, the same span the timeline shows.
  const latestEnd = endOfMonth(now);
  const findAlternatives = new FindAlternatives(fleet, bookings, latestEnd);
  return {
    getFleetCalendar: new GetFleetCalendar(fleet, bookings),
    getFleetSummary: new GetFleetSummary(fleet, bookings, ledger),
    createBooking: new CreateBooking(fleet, bookings, ledger, findAlternatives, latestEnd),
    acceptAlternative: new AcceptAlternative(fleet, bookings, ledger),
    getRevenueProtected: new GetRevenueProtected(fleet, ledger),
  };
}

export function FleetProvider({ children }: { children: ReactNode }) {
  const [services] = useState(() => createFleetServices(new Date()));
  const [version, setVersion] = useState(0);
  const notifyChanged = useCallback(() => setVersion((v) => v + 1), []);
  const value = useMemo(
    () => ({ services, version, notifyChanged }),
    [services, version, notifyChanged],
  );
  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet(): FleetContextValue {
  const context = useContext(FleetContext);
  if (!context) throw new Error('useFleet must be used inside <FleetProvider>.');
  return context;
}
