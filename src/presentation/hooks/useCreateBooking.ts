'use client';

import { useCallback, useState } from 'react';
import type {
  CreateBookingInput,
  CreateBookingOutcome,
  ValidationError,
} from '@/application/dto/BookingDto';
import type { Booking } from '@/domain/entities/Booking';
import type { DateRange } from '@/domain/value-objects/DateRange';
import { useFleet } from '../context/FleetProvider';

type ConflictOutcome = Extract<CreateBookingOutcome, { status: 'conflict' }>;

export type BookingFlowState =
  | { phase: 'idle' }
  | { phase: 'invalid'; error: ValidationError }
  | { phase: 'created'; booking: Booking; viaAlternative: boolean }
  | { phase: 'conflict'; outcome: ConflictOutcome; acceptError: string | null };

export function useCreateBooking() {
  const { services, notifyChanged } = useFleet();
  const [state, setState] = useState<BookingFlowState>({ phase: 'idle' });

  const submit = useCallback(
    (input: CreateBookingInput) => {
      const result = services.createBooking.execute(input);
      if (!result.ok) {
        setState({ phase: 'invalid', error: result.error });
        return;
      }
      if (result.value.status === 'created') {
        setState({ phase: 'created', booking: result.value.booking, viaAlternative: false });
      } else {
        setState({ phase: 'conflict', outcome: result.value, acceptError: null });
      }
      // Blocked requests also change ledger state, so always notify.
      notifyChanged();
    },
    [services, notifyChanged],
  );

  const accept = useCallback(
    (carId: string, range: DateRange) => {
      if (state.phase !== 'conflict') return;
      const { outcome } = state;
      const result = services.acceptAlternative.execute(carId, {
        range,
        bufferHours: outcome.bufferHours,
        customerName: outcome.customerName,
      });
      if (result.ok) {
        setState({ phase: 'created', booking: result.value, viaAlternative: true });
        notifyChanged();
      } else {
        setState({ ...state, acceptError: result.error.message });
      }
    },
    [services, notifyChanged, state],
  );

  const acceptAlternative = useCallback(
    (carId: string) => {
      if (state.phase === 'conflict') accept(carId, state.outcome.request.range);
    },
    [accept, state],
  );

  const bookNextFreeSlot = useCallback(() => {
    if (state.phase === 'conflict' && state.outcome.nextFreeSlot) {
      accept(state.outcome.request.carId, state.outcome.nextFreeSlot);
    }
  }, [accept, state]);

  const reset = useCallback(() => setState({ phase: 'idle' }), []);

  return { state, submit, acceptAlternative, bookNextFreeSlot, reset };
}
