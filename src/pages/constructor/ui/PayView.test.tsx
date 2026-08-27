import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createInvoice,
  getInvoice,
  type Invoice,
  markInvoicePaid,
} from '../../../entities/invoice';
import { PayView } from './PayView';

const STORAGE_KEY = 'invoice-constructor.v1';

function seed(items: Invoice[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

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

  it('shows countdown and pay button for pending invoices', () => {
    const created = createInvoice({
      amount: '7',
      currency: 'USDT',
      description: 'Pay link',
      ttlMinutes: 5,
      requestKey: 'pay-view-pending',
    });

    if ('error' in created) {
      throw new Error(created.error);
    }

    render(<PayView invoice={created} onPaid={() => undefined} />);

    expect(screen.getByText('Осталось времени на оплату')).toBeInTheDocument();
    expect(screen.getByText(/\d{2}:\d{2}|^\d+ч \d{2}м$/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Оплатить (демо)' })).toBeInTheDocument();
  });

  it('shows success text without pay button for paid invoices', () => {
    const created = createInvoice({
      amount: '12',
      currency: 'USDT',
      description: 'Paid invoice',
      ttlMinutes: 60,
      requestKey: 'pay-view-paid',
    });

    if ('error' in created) {
      throw new Error(created.error);
    }

    markInvoicePaid(created.id);
    const paid = getInvoice(created.id);

    if (!paid) {
      throw new Error('Paid invoice not found');
    }

    render(<PayView invoice={paid} onPaid={() => undefined} />);

    expect(screen.getByText('Счёт уже оплачен')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Оплатить (демо)' })).not.toBeInTheDocument();
  });

  it('shows expiry message without pay button for expired invoices', () => {
    seed([
      {
        id: 'expired-pay',
        amount: '3',
        currency: 'USDT',
        description: 'Expired invoice',
        createdAt: Date.now() - 60_000,
        expiresAt: Date.now() - 1000,
        status: 'pending',
        paidAt: null,
        requestKey: 'pay-view-expired',
      },
    ]);

    const expired = getInvoice('expired-pay');

    if (!expired) {
      throw new Error('Expired invoice not found');
    }

    render(<PayView invoice={expired} onPaid={() => undefined} />);

    expect(screen.getByText('Срок оплаты истёк')).toBeInTheDocument();
    expect(screen.getByText('Выставьте новый счёт в конструкторе')).toBeInTheDocument();
    expect(screen.getByText('истёк')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Оплатить (демо)' })).not.toBeInTheDocument();
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

    expect(screen.getByText('Счёт уже оплачен')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Оплатить (демо)' })).not.toBeInTheDocument();
  });
});
