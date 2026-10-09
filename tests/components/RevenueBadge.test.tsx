// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RevenueBadge } from '@/src/components/navigation/RevenueBadge';

describe('RevenueBadge', () => {
  it('displays the protected revenue as formatted currency', () => {
    render(<RevenueBadge cents={123456} />);
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Revenue protected: $1,234.56' }),
    ).toBeInTheDocument();
  });

  it('updates when the total increases', () => {
    const { rerender } = render(<RevenueBadge cents={0} />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
    rerender(<RevenueBadge cents={9000} />);
    expect(screen.getByText('$90.00')).toBeInTheDocument();
  });
});
