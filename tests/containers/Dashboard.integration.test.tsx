// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { AppHeader } from '@/src/containers/home/AppHeader';
import { Dashboard } from '@/src/containers/home/Dashboard';
import { FleetProvider } from '@/src/context/FleetProvider';

function renderApp() {
  render(
    <FleetProvider>
      <AppHeader />
      <Dashboard />
    </FleetProvider>,
  );
  return userEvent.setup();
}

describe('Dashboard (integration with the real composition root)', () => {
  it('blocks a conflicting request, accepts the cheapest alternative and protects revenue', async () => {
    const user = renderApp();
    expect(await screen.findByText('Fleet timeline')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /revenue protected: \$0\.00/i })).toBeInTheDocument();

    // Default request: Corolla from tomorrow 10:00 overlaps the seeded booking ending 09:00 + 4h buffer.
    await user.click(screen.getByRole('button', { name: /check & book/i }));
    expect(await screen.findByText('Booking blocked')).toBeInTheDocument();

    const alternatives = screen.getByRole('list', { name: 'Smart alternatives' });
    const [cheapest] = within(alternatives).getAllByRole('button');
    if (!cheapest) throw new Error('expected at least one alternative');
    await user.click(cheapest);

    expect(await screen.findByText('Booking confirmed')).toBeInTheDocument();
    expect(screen.queryByText('Booking blocked')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('status', { name: /revenue protected: \$0\.00/i }),
    ).not.toBeInTheDocument();

    // The new booking is highlighted on the timeline, and the confirmation links to it.
    expect(screen.getByRole('img', { name: /^new booking:/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View on timeline' })).toBeInTheDocument();
  });

  it('pages the timeline forward to show a booking made outside the current window', async () => {
    // Pin the clock early in a month so there is room to page within it.
    vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 9, 9, 15));
    onTestFinished(() => {
      vi.useRealTimers();
    });
    const user = renderApp();
    expect(await screen.findByText('Fleet timeline')).toBeInTheDocument();

    // Book the Sprinter 20 days out: beyond the first 14-day window.
    await user.click(screen.getByLabelText('Car'));
    await user.click(screen.getByRole('option', { name: /mercedes sprinter/i }));
    for (const field of ['Pickup', 'Return'] as const) {
      await user.click(screen.getByLabelText(field));
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowRight>5/}'); // +19 days
      await user.keyboard('{Enter}{Escape}');
    }
    await user.click(screen.getByRole('button', { name: /check & book/i }));

    expect(await screen.findByText('Booking confirmed')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /^new booking:/i })).toBeInTheDocument();
    // The timeline moved off its first window to reach it.
    expect(screen.getByRole('button', { name: 'Previous week' })).toBeEnabled();
    // ...but never past the end of the month: Oct 18 – Oct 31.
    expect(screen.getByText('Oct 18 – Oct 31, 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next week' })).toBeDisabled();
  });
});
