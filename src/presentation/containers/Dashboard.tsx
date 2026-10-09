'use client';

import { addDays, setHours, startOfDay } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { toDateTimeLocal } from '@/lib/formatDate';
import { BookingConfirmation } from '../components/BookingConfirmation';
import { BookingForm, type BookingFormDefaults } from '../components/BookingForm';
import { CalendarGrid } from '../components/CalendarGrid';
import { ConflictPanel } from '../components/ConflictPanel';
import { FleetList } from '../components/FleetList';
import { EmptyFleet, LoadingCard } from '../components/StatusStates';
import { useCreateBooking } from '../hooks/useCreateBooking';
import { useFleetCalendar } from '../hooks/useFleetCalendar';

const WINDOW_DAYS = 14;
const HORIZON_DAYS = 30;
const STEP_DAYS = 7;
const MAX_OFFSET = HORIZON_DAYS - WINDOW_DAYS;
const DEFAULT_BUFFER_HOURS = 4;

/** Container: wires hooks to presentational components. Holds view state only. */
export function Dashboard() {
  // The clock is read after mount so the prerendered HTML never depends on build time.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const [offset, setOffset] = useState(0);
  const [bufferHours, setBufferHours] = useState(DEFAULT_BUFFER_HOURS);
  const from = useMemo(() => (now ? addDays(startOfDay(now), offset) : null), [now, offset]);
  const calendarState = useFleetCalendar(from, WINDOW_DAYS);
  const { state, submit, acceptAlternative, bookNextFreeSlot, reset } = useCreateBooking();

  if (!now || calendarState.status === 'loading') {
    return (
      <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <LoadingCard label="Loading booking form" />
        <LoadingCard label="Loading fleet timeline" />
      </div>
    );
  }
  if (calendarState.status === 'empty') return <EmptyFleet />;

  const { rows } = calendarState.calendar;
  const cars = rows.map((row) => row.car);
  const carName = (id: string) => cars.find((car) => car.id === id)?.name ?? 'Selected car';
  const tomorrowAt10 = setHours(addDays(startOfDay(now), 1), 10);
  const defaults: BookingFormDefaults = {
    carId: cars[0]?.id ?? '',
    pickup: toDateTimeLocal(tomorrowAt10),
    returnAt: toDateTimeLocal(addDays(tomorrowAt10, 2)),
    bufferHours: DEFAULT_BUFFER_HOURS,
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
      <div className="space-y-4">
        <BookingForm
          cars={cars}
          defaultValues={defaults}
          serverError={state.phase === 'invalid' ? state.error : null}
          onSubmit={(input) => {
            setBufferHours(input.bufferHours);
            submit(input);
          }}
        />
        {/* Persistent live region so screen readers announce results as they appear. */}
        <div aria-live="polite" className="space-y-4">
          {state.phase === 'conflict' && (
            <ConflictPanel
              carName={carName(state.outcome.request.carId)}
              conflicts={state.outcome.conflicts}
              alternatives={state.outcome.alternatives}
              nextFreeSlot={state.outcome.nextFreeSlot}
              bufferHours={state.outcome.bufferHours}
              error={state.acceptError}
              onSelectAlternative={acceptAlternative}
              onBookNextSlot={bookNextFreeSlot}
              onDismiss={reset}
            />
          )}
          {state.phase === 'created' && (
            <BookingConfirmation
              carName={carName(state.booking.carId)}
              customerName={state.booking.customerName}
              range={state.booking.range}
              viaAlternative={state.viaAlternative}
              onDismiss={reset}
            />
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-6">
        <CalendarGrid
          rows={rows}
          from={calendarState.calendar.from}
          days={WINDOW_DAYS}
          now={now}
          bufferHours={bufferHours}
          highlight={state.phase === 'conflict' ? state.outcome.request : null}
          onPrevious={() => setOffset((o) => Math.max(0, o - STEP_DAYS))}
          onNext={() => setOffset((o) => Math.min(MAX_OFFSET, o + STEP_DAYS))}
          canGoPrevious={offset > 0}
          canGoNext={offset < MAX_OFFSET}
        />
        <FleetList rows={rows} />
      </div>
    </div>
  );
}
