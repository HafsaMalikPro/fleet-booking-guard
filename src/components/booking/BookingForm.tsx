'use client';

import { ArrowRight, CalendarClock } from 'lucide-react';
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
  /** Called when client-side validation blocks a submit. */
  onInvalid?: () => void;
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

const labelClass = 'text-[13px] font-semibold text-ink/80';
const inputClass =
  'mt-1.5 block h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-3.5 text-sm text-ink transition-colors placeholder:text-ink/35 hover:border-neutral-300 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/15';
const invalidClass = 'border-brand-500 bg-brand-50/50';
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%231B2537' stroke-opacity='.5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")";

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-brand-700">
      {message}
    </p>
  );
}

export function BookingForm({
  cars,
  defaultValues,
  onSubmit,
  onInvalid,
  serverError,
}: BookingFormProps) {
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
    if (Object.keys(validate(values)).length > 0) {
      onInvalid?.();
      return;
    }
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
      <div className="mb-6 flex items-center gap-3">
        <IconChip>
          <CalendarClock className="h-5 w-5" />
        </IconChip>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink">New booking request</h2>
          <p className="text-sm text-ink/55">Checked for overlaps and turnaround time.</p>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={ids.carId} className={labelClass}>
            Car
          </label>
          <select
            id={ids.carId}
            value={values.carId}
            onChange={(e) => update('carId')(e.target.value)}
            aria-invalid={Boolean(errors.carId)}
            aria-describedby={describedBy('carId')}
            className={cn(inputClass, 'appearance-none pr-10', errors.carId && invalidClass)}
            style={{
              backgroundImage: CHEVRON,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.9rem center',
            }}
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

        <div>
          <label htmlFor={ids.pickup} className={labelClass}>
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
          <label htmlFor={ids.returnAt} className={labelClass}>
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

        <div className="grid grid-cols-[120px_1fr] gap-3">
          <div>
            <label htmlFor={ids.bufferHours} className={labelClass}>
              Buffer (hours)
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
          </div>
          <div>
            <label htmlFor={ids.customerName} className={labelClass}>
              Customer <span className="font-normal text-ink/40">(optional)</span>
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
        <FieldError id={`${ids.bufferHours}-error`} message={errors.bufferHours} />

        <Button type="submit" className="mt-2 w-full">
          Check &amp; book
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
    </Card>
  );
}
