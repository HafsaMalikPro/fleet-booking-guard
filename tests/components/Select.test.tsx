// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Select } from '@/src/components/common/Select';

const options = [
  { value: 'corolla', label: 'Toyota Corolla', meta: '$45.00/day' },
  { value: 'civic', label: 'Honda Civic', meta: '$52.00/day' },
  { value: 'tesla', label: 'Tesla Model 3', meta: '$95.00/day' },
];

function setup(value = '') {
  const onChange = vi.fn();
  render(
    <Select id="car" value={value} options={options} onChange={onChange} placeholder="Pick" />,
  );
  return { onChange, user: userEvent.setup(), trigger: screen.getByRole('combobox') };
}

describe('Select', () => {
  it('shows the placeholder and opens a listbox of options', async () => {
    const { user, trigger } = setup();
    expect(trigger).toHaveTextContent('Pick');

    await user.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('picks an option with the keyboard and closes', async () => {
    const { onChange, user, trigger } = setup('corolla');
    trigger.focus();

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledWith('tesla');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape without changing the value', async () => {
    const { onChange, user, trigger } = setup('civic');
    await user.click(trigger);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
