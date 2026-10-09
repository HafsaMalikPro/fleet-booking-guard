// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BookingForm, type BookingFormDefaults } from '@/src/components/booking/BookingForm';
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

    // Same day as pickup (Jan 10, 10:00) but an earlier time.
    await user.click(screen.getByLabelText('Return'));
    await user.click(screen.getByRole('button', { name: 'Thursday, January 10, 2030' }));
    await user.click(screen.getByRole('option', { name: '9:00 AM' }));
    await user.click(screen.getByRole('button', { name: /check & book/i }));

    const returnField = screen.getByLabelText('Return');
    expect(returnField).toHaveAttribute('aria-invalid', 'true');
    expect(returnField).toHaveAccessibleDescription('Return must be after pickup.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears the error once the user fixes the return time', async () => {
    const { user } = setup();

    await user.click(screen.getByLabelText('Return'));
    await user.click(screen.getByRole('button', { name: 'Thursday, January 10, 2030' }));
    await user.click(screen.getByRole('option', { name: '9:00 AM' }));
    await user.click(screen.getByRole('button', { name: /check & book/i }));
    expect(screen.getByText('Return must be after pickup.')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Return'));
    await user.click(screen.getByRole('button', { name: 'Friday, January 11, 2030' }));

    expect(screen.queryByText('Return must be after pickup.')).not.toBeInTheDocument();
  });

  it('calls onSubmit with the selected car, dates, numeric buffer and customer', async () => {
    const { onSubmit, user } = setup();

    await user.selectOptions(screen.getByLabelText('Car'), 'tesla');
    const buffer = screen.getByLabelText('Buffer (hours)');
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

  it('submits the date and time picked in the calendar', async () => {
    const { onSubmit, user } = setup();

    await user.click(screen.getByLabelText('Return'));
    await user.click(screen.getByRole('button', { name: 'Tuesday, January 15, 2030' }));
    await user.click(screen.getByRole('option', { name: '2:30 PM' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Return')).toHaveTextContent('Tue, Jan 15, 2030 · 2:30 PM');

    await user.click(screen.getByRole('button', { name: /check & book/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ returnAt: '2030-01-15T14:30' }),
    );
  });

  it('blocks return days before pickup', async () => {
    const { user } = setup();

    await user.click(screen.getByLabelText('Return'));
    const blocked = screen.getByRole('button', { name: 'Wednesday, January 9, 2030' });
    expect(blocked).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Thursday, January 10, 2030' })).not.toHaveAttribute(
      'aria-disabled',
    );

    await user.click(blocked);
    expect(screen.getByLabelText('Return')).toHaveTextContent('Sat, Jan 12, 2030');
  });

  it('supports keyboard navigation and closes on Escape', async () => {
    const { user } = setup();

    await user.click(screen.getByLabelText('Return'));
    await user.click(screen.getByRole('button', { name: 'Saturday, January 12, 2030' }));
    await user.keyboard('{ArrowRight}{Enter}');
    expect(screen.getByLabelText('Return')).toHaveTextContent('Sun, Jan 13, 2030');

    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid', { name: 'February 2030' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Return')).toHaveFocus();
  });

  it('rejects a negative buffer and reports the blocked submit via onInvalid', async () => {
    const onInvalid = vi.fn();
    const onSubmit = vi.fn();
    render(
      <BookingForm
        cars={cars}
        defaultValues={defaults}
        onSubmit={onSubmit}
        onInvalid={onInvalid}
      />,
    );
    const user = userEvent.setup();
    fireEvent.change(screen.getByLabelText('Buffer (hours)'), {
      target: { value: '-2' },
    });
    await user.click(screen.getByRole('button', { name: /check & book/i }));
    expect(screen.getByText('Buffer must be zero or more hours.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalledTimes(1);
  });
});
