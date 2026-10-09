// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Alternative } from '@/src/domain/services/AlternativeFinder';
import { money } from '@/src/domain/value-objects/Money';
import { ConflictPanel, type ConflictPanelProps } from '@/src/components/booking/ConflictPanel';
import { makeBooking, makeCar, range } from '../fixtures';

function alternative(id: string, name: string, dailyRateCents: number): Alternative {
  return {
    car: makeCar({ id, name, dailyRateCents }),
    days: 2,
    totalPrice: money(dailyRateCents * 2),
  };
}

function renderPanel(overrides: Partial<ConflictPanelProps> = {}) {
  const props: ConflictPanelProps = {
    carName: 'Tesla Model 3',
    conflicts: [
      makeBooking({ id: 'b1', carId: 'tesla', range: range(0, 24), customerName: 'Zoe Bennett' }),
    ],
    // Deliberately unsorted to prove the panel ranks by price.
    alternatives: [
      alternative('bmw', 'BMW 5 Series', 14900),
      alternative('corolla', 'Toyota Corolla', 4500),
      alternative('rav4', 'Toyota RAV4', 7800),
    ],
    nextFreeSlot: range(28, 52),
    bufferHours: 4,
    onSelectAlternative: vi.fn(),
    onBookNextSlot: vi.fn(),
    onDismiss: vi.fn(),
    ...overrides,
  };
  render(<ConflictPanel {...props} />);
  return props;
}

describe('ConflictPanel', () => {
  it('lists the conflicting bookings and the buffer badge', () => {
    renderPanel();
    expect(screen.getByText('Zoe Bennett')).toBeInTheDocument();
    expect(screen.getByText('Buffer applied · 4h')).toBeInTheDocument();
  });

  it('renders smart alternatives sorted by price, cheapest first', () => {
    renderPanel();
    const list = screen.getByRole('list', { name: 'Smart alternatives' });
    const names = within(list)
      .getAllByTestId('alt-name')
      .map((el) => el.textContent);
    expect(names).toEqual(['Toyota Corolla', 'Toyota RAV4', 'BMW 5 Series']);
    expect(
      within(list).getByRole('button', { name: 'Book Toyota Corolla for $90.00' }),
    ).toBeInTheDocument();
  });

  it('calls onSelectAlternative with the clicked car id', async () => {
    const props = renderPanel();
    await userEvent.setup().click(screen.getByRole('button', { name: /book toyota rav4/i }));
    expect(props.onSelectAlternative).toHaveBeenCalledWith('rav4');
  });

  it('calls onBookNextSlot when the next free slot is booked', async () => {
    const props = renderPanel();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Book this slot' }));
    expect(props.onBookNextSlot).toHaveBeenCalledTimes(1);
  });

  it('explains when there is no free slot and no alternative', () => {
    renderPanel({ nextFreeSlot: null, alternatives: [] });
    expect(screen.getByText('No free slot in the next 30 days.')).toBeInTheDocument();
    expect(screen.getByText('No other car is free for this window.')).toBeInTheDocument();
  });
});
