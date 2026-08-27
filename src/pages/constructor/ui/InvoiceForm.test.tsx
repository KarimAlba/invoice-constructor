import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listInvoices } from '../../../entities/invoice';
import { InvoiceForm } from './InvoiceForm';

describe('InvoiceForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('keeps submit disabled while amount is empty', () => {
    render(<InvoiceForm onCreated={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Выставить счёт' })).toBeDisabled();
  });

  it('creates an invoice on the happy path', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();

    render(<InvoiceForm onCreated={onCreated} />);

    await user.type(screen.getByPlaceholderText('0.00'), '25.5');
    await user.click(screen.getByRole('button', { name: 'Выставить счёт' }));

    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(listInvoices()).toHaveLength(1);
    expect(listInvoices()[0]?.amount).toBe('25.5');
  });

  it('shows a validation alert for zero amount', async () => {
    const user = userEvent.setup();

    render(<InvoiceForm onCreated={() => undefined} />);

    await user.type(screen.getByPlaceholderText('0.00'), '0');
    await user.click(screen.getByRole('button', { name: 'Выставить счёт' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Сумма должна быть больше нуля');
    expect(listInvoices()).toHaveLength(0);
  });

  it('shows a validation alert for a negative amount', async () => {
    const user = userEvent.setup();

    render(<InvoiceForm onCreated={() => undefined} />);

    await user.type(screen.getByPlaceholderText('0.00'), '-8');
    await user.click(screen.getByRole('button', { name: 'Выставить счёт' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Сумма должна быть числом больше нуля',
    );
  });

  it('does not create a second invoice for a double submit', async () => {
    const user = userEvent.setup();

    render(<InvoiceForm onCreated={() => undefined} />);

    await user.type(screen.getByPlaceholderText('0.00'), '9');
    const form = screen.getByRole('button', { name: 'Выставить счёт' }).closest('form');
    if (!form) {
      throw new Error('form not found');
    }

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(listInvoices()).toHaveLength(1);
  });
});
