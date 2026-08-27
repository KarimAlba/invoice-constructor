import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createInvoice, getInvoice } from '../../../entities/invoice';
import { PayView } from './PayView';

describe('PayView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('shows a missing-invoice empty state', () => {
    render(<PayView invoice={null} onPaid={() => undefined} />);

    expect(screen.getByText('Счёт не найден или ссылка повреждена.')).toBeInTheDocument();
  });

  it('marks the invoice paid from the demo button', async () => {
    const user = userEvent.setup();
    const created = createInvoice({
      amount: '7',
      currency: 'USDT',
      description: 'Pay link',
      ttlMinutes: 60,
      requestKey: 'pay-view',
    });

    if ('error' in created) {
      throw new Error(created.error);
    }

    const onPaid = vi.fn();
    const { rerender } = render(<PayView invoice={created} onPaid={onPaid} />);

    await user.click(screen.getByRole('button', { name: 'Оплатить (демо)' }));

    expect(onPaid).toHaveBeenCalledTimes(1);
    expect(getInvoice(created.id)?.status).toBe('paid');

    rerender(<PayView invoice={getInvoice(created.id)} onPaid={onPaid} />);

    expect(screen.getByText('оплачен')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Оплатить (демо)' })).not.toBeInTheDocument();
  });
});
