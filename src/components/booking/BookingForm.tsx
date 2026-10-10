'use client';

import { endOfDay, format, startOfDay } from 'date-fns';
import { ArrowRight, CalendarClock, CarFront } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import type {
  CreateBookingInput,
  ValidationError,
  ValidationField,
} from '@/src/application/dto/BookingDto';
import type { Car } from '@/src/domain/entities/Car';
import { cn } from '@/src/lib/cn';
import { formatCurrency } from '@/src/lib/formatCurrency';
import { Button } from '@/src/components/common/Button';
import { DateTimePicker } from '@/src/components/common/DateTimePicker';
import { Card } from '@/src/components/common/Card';
import { Select } from '@/src/components/common/Select';
import { IconChip } from '@/src/components/common/IconChip';

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
  /** Last bookable day; later dates are disabled and rejected. */
  maxDate?: Date;
}

type Errors = Partial<Record<ValidationField, string>>;

interface Values {
  carId: string;
  pickup: string;
  returnAt: string;
  bufferHours: string;
  customerName: string;
}

function validate(values: Values, maxDate?: Date): Errors {
  const errors: Errors = {};
  if (!values.carId) errors.carId = 'Select a car.';
  if (!values.pickup) errors.pickup = 'Pickup date and time is required.';
  if (!values.returnAt) errors.returnAt = 'Return date and time is required.';
  if (values.pickup && values.returnAt && new Date(values.returnAt) <= new Date(values.pickup)) {
    errors.returnAt = 'Return must be after pickup.';
  } else if (values.returnAt && maxDate && new Date(values.returnAt) > endOfDay(maxDate)) {
    errors.returnAt = `Return must be on or before ${format(maxDate, 'MMM d')}.`;
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
  maxDate,
}: BookingFormProps) {
  const uid = useId();
  const [values, setValues] = useState<Values>({
    ...defaultValues,
    bufferHours: String(defaultValues.bufferHours),
    customerName: '',
  });
  const [attempted, setAttempted] = useState(false);

  const clientErrors = attempted ? validate(values, maxDate) : {};
  const errors: Errors =
    serverError && Object.keys(clientErrors).length === 0
      ? { [serverError.field]: serverError.message }
      : clientErrors;

  const update = (field: keyof Values) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(validate(values, maxDate)).length > 0) {
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
  const pickupDate = values.pickup ? new Date(values.pickup) : null;
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
          <Select
            id={ids.carId}
            value={values.carId}
            onChange={update('carId')}
            placeholder="Select a car…"
            icon={<CarFront className="h-4 w-4" aria-hidden="true" />}
            options={cars.map((car) => ({
              value: car.id,
              label: car.name,
              description: `${car.category} · ${car.plate}`,
              meta: `${formatCurrency(car.dailyRateCents)}/day`,
            }))}
            invalid={Boolean(errors.carId)}
            describedBy={describedBy('carId')}
          />
          <FieldError id={`${ids.carId}-error`} message={errors.carId} />
        </div>

        <div>
          <label htmlFor={ids.pickup} className={labelClass}>
            Pickup
          </label>
          <DateTimePicker
            id={ids.pickup}
            value={values.pickup}
            onChange={update('pickup')}
            minDate={startOfDay(new Date())}
            maxDate={maxDate}
            rangeStart={values.pickup}
            rangeEnd={values.returnAt}
            invalid={Boolean(errors.pickup)}
            describedBy={describedBy('pickup')}
          />
          <FieldError id={`${ids.pickup}-error`} message={errors.pickup} />
        </div>

        <div>
          <label htmlFor={ids.returnAt} className={labelClass}>
            Return
          </label>
          <DateTimePicker
            id={ids.returnAt}
            value={values.returnAt}
            onChange={update('returnAt')}
            minDate={pickupDate ?? undefined}
            maxDate={maxDate}
            rangeStart={values.pickup}
            rangeEnd={values.returnAt}
            invalid={Boolean(errors.returnAt)}
            describedBy={describedBy('returnAt')}
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
