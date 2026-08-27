import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Invoice } from '../../../entities/invoice';
import { InvoiceList } from './InvoiceList';

const pending: Invoice = {
  id: 'aaa111',
  amount: '10',
  currency: 'USDT',
  description: 'Pending bill',
  createdAt: 1,
  expiresAt: Date.now() + 60_000,
  status: 'pending',
  paidAt: null,
  requestKey: 'a',
};

const paid: Invoice = {
  ...pending,
  id: 'bbb222',
  status: 'paid',
  paidAt: 2,
  requestKey: 'b',
};

describe('InvoiceList', () => {
  it('shows an empty state when there are no invoices', () => {
    render(
      <InvoiceList
        items={[]}
        filter='all'
        onFilter={() => undefined}
        onChange={() => undefined}
        onTick={() => undefined}
      />,
    );

    expect(screen.getByText(/Пока пусто/)).toBeInTheDocument();
  });

  it('filters invoices by status tab', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();

    const { rerender } = render(
      <InvoiceList
        items={[pending, paid]}
        filter='all'
        onFilter={onFilter}
        onChange={() => undefined}
        onTick={() => undefined}
      />,
    );

    expect(screen.getByText('INV-AAA111')).toBeInTheDocument();
    expect(screen.getByText('INV-BBB222')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'оплачены' }));
    expect(onFilter).toHaveBeenCalledWith('paid');

    rerender(
      <InvoiceList
        items={[pending, paid]}
        filter='paid'
        onFilter={onFilter}
        onChange={() => undefined}
        onTick={() => undefined}
      />,
    );

    expect(screen.queryByText('INV-AAA111')).not.toBeInTheDocument();
    expect(screen.getByText('INV-BBB222')).toBeInTheDocument();
  });
});
