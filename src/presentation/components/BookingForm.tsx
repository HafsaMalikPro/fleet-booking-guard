'use client';

import { CalendarClock } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import type {
  CreateBookingInput,
  ValidationError,
  ValidationField,
} from '@/application/dto/BookingDto';
import type { Car } from '@/domain/entities/Car';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';
import { Button } from './Button';
import { Card } from './Card';
import { IconChip } from './IconChip';

export interface BookingFormDefaults {
  carId: string;
  pickup: string;
  returnAt: string;
  bufferHours: number;
}

export interface BookingFormProps {
  cars: readonly Car[];
  defaultValues: BookingFormDefaults;
  onSubmit: (input: CreateBookingInput) => void;
  /** Validation error returned by the use case, shown next to its field. */
  serverError?: ValidationError | null;
}

type Errors = Partial<Record<ValidationField, string>>;

interface Values {
  carId: string;
  pickup: string;
  returnAt: string;
  bufferHours: string;
  customerName: string;
}

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.carId) errors.carId = 'Select a car.';
  if (!values.pickup) errors.pickup = 'Pickup date and time is required.';
  if (!values.returnAt) errors.returnAt = 'Return date and time is required.';
  if (values.pickup && values.returnAt && new Date(values.returnAt) <= new Date(values.pickup)) {
    errors.returnAt = 'Return must be after pickup.';
  }
  const buffer = Number(values.bufferHours);
  if (values.bufferHours === '' || !Number.isFinite(buffer) || buffer < 0) {
    errors.bufferHours = 'Buffer must be zero or more hours.';
  }
  return errors;
}

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm transition-colors placeholder:text-ink/35 hover:border-brand-200 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40';
const invalidClass = 'border-brand-500 bg-brand-50/40';

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-brand-700">
      {message}
    </p>
  );
}

export function BookingForm({ cars, defaultValues, onSubmit, serverError }: BookingFormProps) {
  const uid = useId();
  const [values, setValues] = useState<Values>({
    ...defaultValues,
    bufferHours: String(defaultValues.bufferHours),
    customerName: '',
  });
  const [attempted, setAttempted] = useState(false);

  const clientErrors = attempted ? validate(values) : {};
  const errors: Errors =
    serverError && Object.keys(clientErrors).length === 0
      ? { [serverError.field]: serverError.message }
      : clientErrors;

  const update = (field: keyof Values) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(validate(values)).length > 0) return;
    onSubmit({
      carId: values.carId,
      pickup: values.pickup,
      returnAt: values.returnAt,
      bufferHours: Number(values.bufferHours),
      customerName: values.customerName.trim() || undefined,
    });
  }

  const ids = {
    carId: `${uid}-car`,
    pickup: `${uid}-pickup`,
    returnAt: `${uid}-return`,
    bufferHours: `${uid}-buffer`,
    customerName: `${uid}-customer`,
  };
  const describedBy = (field: ValidationField) =>
    errors[field] ? `${ids[field]}-error` : undefined;

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <IconChip>
          <CalendarClock className="h-5 w-5" />
        </IconChip>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink">New booking request</h2>
          <p className="text-sm text-ink/55">
            We check every car for overlaps and turnaround time.
          </p>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={ids.carId} className="text-sm font-semibold text-ink">
            Car
          </label>
          <select
            id={ids.carId}
            value={values.carId}
            onChange={(e) => update('carId')(e.target.value)}
            aria-invalid={Boolean(errors.carId)}
            aria-describedby={describedBy('carId')}
            className={cn(inputClass, errors.carId && invalidClass)}
          >
            <option value="">Select a car…</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.name} · {formatCurrency(car.dailyRateCents)}/day
              </option>
            ))}
          </select>
          <FieldError id={`${ids.carId}-error`} message={errors.carId} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div>
            <label htmlFor={ids.pickup} className="text-sm font-semibold text-ink">
              Pickup
            </label>
            <input
              id={ids.pickup}
              type="datetime-local"
              value={values.pickup}
              onChange={(e) => update('pickup')(e.target.value)}
              aria-invalid={Boolean(errors.pickup)}
              aria-describedby={describedBy('pickup')}
              className={cn(inputClass, errors.pickup && invalidClass)}
            />
            <FieldError id={`${ids.pickup}-error`} message={errors.pickup} />
          </div>
          <div>
            <label htmlFor={ids.returnAt} className="text-sm font-semibold text-ink">
              Return
            </label>
            <input
              id={ids.returnAt}
              type="datetime-local"
              value={values.returnAt}
              onChange={(e) => update('returnAt')(e.target.value)}
              aria-invalid={Boolean(errors.returnAt)}
              aria-describedby={describedBy('returnAt')}
              className={cn(inputClass, errors.returnAt && invalidClass)}
            />
            <FieldError id={`${ids.returnAt}-error`} message={errors.returnAt} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div>
            <label htmlFor={ids.bufferHours} className="text-sm font-semibold text-ink">
              Turnaround buffer (hours)
            </label>
            <input
              id={ids.bufferHours}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={values.bufferHours}
              onChange={(e) => update('bufferHours')(e.target.value)}
              aria-invalid={Boolean(errors.bufferHours)}
              aria-describedby={describedBy('bufferHours')}
              className={cn(inputClass, errors.bufferHours && invalidClass)}
            />
            <FieldError id={`${ids.bufferHours}-error`} message={errors.bufferHours} />
          </div>
          <div>
            <label htmlFor={ids.customerName} className="text-sm font-semibold text-ink">
              Customer <span className="font-normal text-ink/45">(optional)</span>
            </label>
            <input
              id={ids.customerName}
              type="text"
              autoComplete="off"
              placeholder="e.g. Alex Morgan"
              value={values.customerName}
              onChange={(e) => update('customerName')(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Check &amp; book
        </Button>
      </form>
    </Card>
  );
}
