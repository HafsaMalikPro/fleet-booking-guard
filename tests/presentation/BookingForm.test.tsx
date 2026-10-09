// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BookingForm, type BookingFormDefaults } from '@/presentation/components/BookingForm';
import { makeCar } from '../fixtures';

const cars = [
  makeCar({ id: 'corolla', name: 'Toyota Corolla', dailyRateCents: 4500 }),
  makeCar({ id: 'tesla', name: 'Tesla Model 3', dailyRateCents: 9500 }),
];

const defaults: BookingFormDefaults = {
  carId: 'corolla',
  pickup: '2030-01-10T10:00',
  returnAt: '2030-01-12T10:00',
  bufferHours: 4,
};

function setup(onSubmit = vi.fn()) {
  render(<BookingForm cars={cars} defaultValues={defaults} onSubmit={onSubmit} />);
  return { onSubmit, user: userEvent.setup() };
}

describe('BookingForm', () => {
  it('shows an inline error next to the return field when return is before pickup', async () => {
    const { onSubmit, user } = setup();

    fireEvent.change(screen.getByLabelText('Return'), { target: { value: '2030-01-09T10:00' } });
    await user.click(screen.getByRole('button', { name: /check & book/i }));

    const returnInput = screen.getByLabelText('Return');
    expect(returnInput).toHaveAttribute('aria-invalid', 'true');
    expect(returnInput).toHaveAccessibleDescription('Return must be after pickup.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears the error once the user fixes the return time', async () => {
    const { user } = setup();
    const returnInput = screen.getByLabelText('Return');

    fireEvent.change(returnInput, { target: { value: '2030-01-09T10:00' } });
    await user.click(screen.getByRole('button', { name: /check & book/i }));
    fireEvent.change(returnInput, { target: { value: '2030-01-11T10:00' } });

    expect(screen.queryByText('Return must be after pickup.')).not.toBeInTheDocument();
  });

  it('calls onSubmit with the selected car, dates, numeric buffer and customer', async () => {
    const { onSubmit, user } = setup();

    await user.selectOptions(screen.getByLabelText('Car'), 'tesla');
    const buffer = screen.getByLabelText('Turnaround buffer (hours)');
    await user.clear(buffer);
    await user.type(buffer, '6');
    await user.type(screen.getByLabelText(/customer/i), 'Alex Morgan');
    await user.click(screen.getByRole('button', { name: /check & book/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      carId: 'tesla',
      pickup: '2030-01-10T10:00',
      returnAt: '2030-01-12T10:00',
      bufferHours: 6,
      customerName: 'Alex Morgan',
    });
  });

  it('rejects a negative buffer', async () => {
    const { onSubmit, user } = setup();
    fireEvent.change(screen.getByLabelText('Turnaround buffer (hours)'), {
      target: { value: '-2' },
    });
    await user.click(screen.getByRole('button', { name: /check & book/i }));
    expect(screen.getByText('Buffer must be zero or more hours.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
