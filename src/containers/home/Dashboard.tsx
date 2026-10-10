'use client';

import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  setHours,
  startOfDay,
} from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toDateTimeLocal } from '@/src/lib/formatDate';
import { BookingConfirmation } from '@/src/components/booking/BookingConfirmation';
import { BookingForm, type BookingFormDefaults } from '@/src/components/booking/BookingForm';
import { CalendarGrid } from '@/src/components/fleet/CalendarGrid';
import { ConflictPanel } from '@/src/components/booking/ConflictPanel';
import { FleetList } from '@/src/components/fleet/FleetList';
import { FleetSummary } from '@/src/components/fleet/FleetSummary';
import { EmptyFleet, LoadingCard } from '@/src/components/common/StatusStates';
import { useCreateBooking } from '@/src/hooks/useCreateBooking';
import { useFleetCalendar, useFleetSummary } from '@/src/hooks/useFleetCalendar';

const WINDOW_DAYS = 14;
const STEP_DAYS = 7;
const DEFAULT_BUFFER_HOURS = 4;
const TIMELINE_ID = 'fleet-timeline';

/** Container: wires hooks to presentational components. Holds view state only. */
export function Dashboard() {
  // The clock is read after mount so the prerendered HTML never depends on build time.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const [offset, setOffset] = useState(0);
  // The timeline pages no further than the end of the current month.
  const maxOffset = now
    ? Math.max(0, differenceInCalendarDays(endOfMonth(now), startOfDay(now)) + 1 - WINDOW_DAYS)
    : 0;
  const [bufferHours, setBufferHours] = useState(DEFAULT_BUFFER_HOURS);
  const from = useMemo(() => (now ? addDays(startOfDay(now), offset) : null), [now, offset]);
  const calendarState = useFleetCalendar(from, WINDOW_DAYS);
  const summary = useFleetSummary(from, WINDOW_DAYS);
  const { state, submit, acceptAlternative, bookNextFreeSlot, reset } = useCreateBooking();
  const createdBooking = state.phase === 'created' ? state.booking : null;

  /** Page the timeline to the week that contains `date`, within the bookable horizon. */
  const showOnTimeline = useCallback(
    (date: Date, scroll: boolean) => {
      if (!now) return;
      const days = differenceInCalendarDays(date, startOfDay(now));
      setOffset(Math.min(maxOffset, Math.max(0, Math.floor(days / STEP_DAYS) * STEP_DAYS)));
      if (scroll) {
        document
          .getElementById(TIMELINE_ID)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [now, maxOffset],
  );

  // A new booking should always be visible: jump the timeline to it.
  useEffect(() => {
    if (createdBooking) showOnTimeline(createdBooking.range.start, false);
  }, [createdBooking, showOnTimeline]);

  if (!now || !summary || calendarState.status === 'loading') {
    return (
      <div className="space-y-6">
        <LoadingCard label="Loading fleet summary" />
        <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
          <LoadingCard label="Loading booking form" />
          <LoadingCard label="Loading fleet timeline" />
        </div>
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

  const { from: windowStart } = calendarState.calendar;
  const windowLabel = `${format(windowStart, 'MMM d')} – ${format(addDays(windowStart, WINDOW_DAYS - 1), 'MMM d')}`;

  return (
    <div className="space-y-6">
      <FleetSummary
        windowLabel={windowLabel}
        utilization={summary.utilization}
        bookingCount={summary.bookingCount}
        blockedCount={summary.blockedCount}
        protectedCents={summary.protectedRevenue.cents}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="space-y-4">
          <BookingForm
            cars={cars}
            defaultValues={defaults}
            serverError={state.phase === 'invalid' ? state.error : null}
            maxDate={endOfMonth(now)}
            onInvalid={reset}
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
                onViewOnTimeline={() => showOnTimeline(state.booking.range.start, true)}
                onDismiss={reset}
              />
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <CalendarGrid
            id={TIMELINE_ID}
            rows={rows}
            from={calendarState.calendar.from}
            days={WINDOW_DAYS}
            now={now}
            bufferHours={bufferHours}
            highlight={state.phase === 'conflict' ? state.outcome.request : null}
            recentBookingId={createdBooking?.id ?? null}
            onPrevious={() => setOffset((o) => Math.max(0, o - STEP_DAYS))}
            onNext={() => setOffset((o) => Math.min(maxOffset, o + STEP_DAYS))}
            canGoPrevious={offset > 0}
            canGoNext={offset < maxOffset}
          />
          <FleetList rows={rows} from={calendarState.calendar.from} days={WINDOW_DAYS} now={now} />
        </div>
      </div>
    </div>
  );
}
