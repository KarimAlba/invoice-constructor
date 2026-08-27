import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createInvoice, getInvoice, listInvoices, markInvoicePaid } from './repository';
import type { Invoice } from './types';

const STORAGE_KEY = 'invoice-constructor.v1';

function seed(items: Invoice[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

describe('invoice repository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('creates a pending invoice from valid input', () => {
    const result = createInvoice({
      amount: '12,50',
      currency: 'USDT',
      description: 'Заказ 1042',
      ttlMinutes: 60,
      requestKey: 'key-1',
    });

    expect(result).toMatchObject({
      amount: '12.50',
      currency: 'USDT',
      description: 'Заказ 1042',
      status: 'pending',
      requestKey: 'key-1',
    });
    expect(listInvoices()).toHaveLength(1);
  });

  it('rejects zero and negative amounts', () => {
    expect(
      createInvoice({
        amount: '0',
        currency: 'USDT',
        description: '',
        ttlMinutes: 60,
        requestKey: 'zero',
      }),
    ).toEqual({ error: 'Сумма должна быть больше нуля' });

    expect(
      createInvoice({
        amount: '-4',
        currency: 'USDT',
        description: '',
        ttlMinutes: 60,
        requestKey: 'neg',
      }),
    ).toEqual({ error: 'Сумма должна быть числом больше нуля' });
    expect(listInvoices()).toHaveLength(0);
  });

  it('returns the same invoice for a repeated requestKey', () => {
    const input = {
      amount: '10',
      currency: 'USDT' as const,
      description: '',
      ttlMinutes: 15,
      requestKey: 'dup',
    };

    const first = createInvoice(input);
    const second = createInvoice(input);

    expect(first).toEqual(second);
    expect(listInvoices()).toHaveLength(1);
  });

  it('marks a pending invoice as paid', () => {
    const created = createInvoice({
      amount: '3',
      currency: 'ETH',
      description: '',
      ttlMinutes: 60,
      requestKey: 'pay',
    });

    if ('error' in created) {
      throw new Error(created.error);
    }

    const paid = markInvoicePaid(created.id);

    expect(paid).toMatchObject({ id: created.id, status: 'paid' });
    expect(getInvoice(created.id)?.status).toBe('paid');
  });

  it('resolves expired invoices when listing', () => {
    seed([
      {
        id: 'exp1',
        amount: '1',
        currency: 'USDT',
        description: '',
        createdAt: 1,
        expiresAt: Date.now() - 1000,
        status: 'pending',
        paidAt: null,
        requestKey: 'old',
      },
    ]);

    expect(listInvoices()[0]?.status).toBe('expired');
    expect(markInvoicePaid('exp1')).toEqual({ error: 'Ссылка уже истекла' });
  });
});
