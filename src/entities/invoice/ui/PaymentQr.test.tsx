import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { paymentUrl } from '../lib/format';
import { PaymentQr } from './PaymentQr';

describe('PaymentQr', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('renders svg for valid id', () => {
    render(<PaymentQr invoiceId='abc123' />);

    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('encodes paymentUrl in aria-label', () => {
    const invoiceId = 'abc123';
    const url = paymentUrl(invoiceId);

    render(<PaymentQr invoiceId={invoiceId} />);

    expect(screen.getByRole('img', { name: `QR-код ссылки оплаты: ${url}` })).toBeInTheDocument();
    expect(screen.getByTitle(url)).toBeInTheDocument();
  });
});
