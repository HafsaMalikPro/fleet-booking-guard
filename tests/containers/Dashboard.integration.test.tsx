// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AppHeader } from '@/presentation/containers/AppHeader';
import { Dashboard } from '@/presentation/containers/Dashboard';
import { FleetProvider } from '@/presentation/context/FleetProvider';

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
  });
});
