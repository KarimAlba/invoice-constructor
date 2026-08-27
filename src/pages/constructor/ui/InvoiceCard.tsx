import { memo, useEffect, useState } from 'react';

import {
  formatAmount,
  formatCountdown,
  type Invoice,
  markInvoicePaid,
  PaymentQr,
  paymentUrl,
  statusLabel,
} from '../../../entities/invoice';
import styles from './constructor.module.css';

type InvoiceCardProps = {
  invoice: Invoice;
  now: number;
  onChange: () => void;
};

function InvoiceCardComponent({ invoice, now, onChange }: InvoiceCardProps) {
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const link = paymentUrl(invoice.id);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCopied(false);
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setActionError(null);
    } catch {
      setActionError('Не удалось скопировать ссылку');
    }
  }

  function pay() {
    const result = markInvoicePaid(invoice.id);
    if ('error' in result) {
      setActionError(result.error);
      return;
    }
    setActionError(null);
    onChange();
  }

  return (
    <article
      className={styles.receipt}
      data-status={invoice.status}
      aria-labelledby={`invoice-${invoice.id}`}
    >
      <div className={styles.receiptTop}>
        <span className={styles.stamp}>{statusLabel(invoice.status)}</span>
        <span id={`invoice-${invoice.id}`} className={styles.serial}>
          INV-{invoice.id.toUpperCase()}
        </span>
      </div>
      <p className={styles.receiptAmount}>{formatAmount(invoice.amount, invoice.currency)}</p>
      <p className={styles.receiptDesc}>{invoice.description || 'Без описания'}</p>
      <dl className={styles.meta}>
        <div>
          <dt>Ссылка</dt>
          <dd>
            <code>{link}</code>
          </dd>
        </div>
        <div>
          <dt>Таймер</dt>
          <dd>
            {invoice.status === 'pending'
              ? formatCountdown(invoice.expiresAt, now)
              : statusLabel(invoice.status)}
          </dd>
        </div>
      </dl>
      {invoice.status === 'pending' ? (
        <div className={styles.qrBlock}>
          <PaymentQr invoiceId={invoice.id} />
          <p className={styles.qrCaption}>QR для открытия на этом устройстве</p>
        </div>
      ) : null}
      <div className={styles.receiptActions}>
        <button
          className={`${styles.button} ${styles.copy}`}
          type='button'
          onClick={() => void copyLink()}
          aria-live='polite'
        >
          {copied ? 'Скопировано' : 'Копировать ссылку'}
        </button>
        {invoice.status === 'pending' ? (
          <button type='button' className={`${styles.button} ${styles.ghost}`} onClick={pay}>
            Отметить оплаченным
          </button>
        ) : null}
      </div>
      {actionError ? (
        <p className={styles.error} role='alert'>
          {actionError}
        </p>
      ) : null}
    </article>
  );
}

function areCardPropsEqual(previous: InvoiceCardProps, next: InvoiceCardProps) {
  if (previous.onChange !== next.onChange) {
    return false;
  }

  const prevInvoice = previous.invoice;
  const nextInvoice = next.invoice;

  if (
    prevInvoice.id !== nextInvoice.id ||
    prevInvoice.status !== nextInvoice.status ||
    prevInvoice.amount !== nextInvoice.amount ||
    prevInvoice.currency !== nextInvoice.currency ||
    prevInvoice.description !== nextInvoice.description ||
    prevInvoice.expiresAt !== nextInvoice.expiresAt
  ) {
    return false;
  }

  if (nextInvoice.status !== 'pending') {
    return true;
  }

  return previous.now === next.now;
}

export const InvoiceCard = memo(InvoiceCardComponent, areCardPropsEqual);
