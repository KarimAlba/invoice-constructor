import { memo, useEffect, useState } from 'react';

import {
  formatAmount,
  formatCountdown,
  getInvoice,
  type Invoice,
  markInvoicePaid,
  PaymentQr,
  resolveStatus,
  statusLabel,
} from '../../../entities/invoice';
import styles from './constructor.module.css';

type PayViewProps = {
  invoice: Invoice | null;
  onPaid: () => void;
};

function formatPaidAt(paidAt: number): string {
  return new Date(paidAt).toLocaleString('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function PayViewComponent({ invoice, onPaid }: PayViewProps) {
  const [now, setNow] = useState(() => Date.now());

  const current = invoice ? (getInvoice(invoice.id) ?? invoice) : null;
  const status = current ? resolveStatus(current, now) : null;

  useEffect(() => {
    if (!current || status !== 'pending') {
      return;
    }

    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [current, status]);

  if (!current) {
    return (
      <main className={styles.payShell}>
        <section className={styles.pay} aria-labelledby='missing-invoice-title'>
          <p className={styles.kicker}>Ошибка реестра</p>
          <h1 id='missing-invoice-title'>Счёт не найден</h1>
          <p className={styles.empty}>Счёт не найден или ссылка повреждена.</p>
          <a href={window.location.pathname}>К конструктору</a>
        </section>
      </main>
    );
  }

  function pay() {
    if (!current) {
      return;
    }

    const result = markInvoicePaid(current.id);
    if (!('error' in result)) {
      setNow(Date.now());
      onPaid();
    }
  }

  return (
    <main className={styles.payShell}>
      <article className={styles.pay} aria-labelledby='invoice-payment-title'>
        <p className={styles.kicker}>Оплата по ссылке</p>
        <h1 id='invoice-payment-title'>INV-{current.id.toUpperCase()}</h1>
        <p className={styles.receiptAmount}>{formatAmount(current.amount, current.currency)}</p>
        <p className={styles.receiptDesc}>{current.description || 'Без описания'}</p>
        <p className={styles.stamp} data-status={status}>
          {statusLabel(status!)}
        </p>

        {status === 'pending' ? (
          <>
            <div className={styles.qrBlock}>
              <PaymentQr invoiceId={current.id} size={144} />
              <p className={styles.qrCaption}>QR для открытия на этом устройстве</p>
            </div>
            <p className={styles.payHint}>Осталось времени на оплату</p>
            <p className={styles.payTimer} aria-live='polite'>
              {formatCountdown(current.expiresAt, now)}
            </p>
            <button className={`${styles.button} ${styles.submit}`} type='button' onClick={pay}>
              Оплатить (демо)
            </button>
          </>
        ) : null}

        {status === 'expired' ? (
          <div className={styles.payStateMessage} data-variant='expired'>
            <p>Срок оплаты истёк</p>
            <p>Выставьте новый счёт в конструкторе</p>
          </div>
        ) : null}

        {status === 'paid' ? (
          <div className={styles.payStateMessage} data-variant='success'>
            <p>Счёт уже оплачен</p>
            {current.paidAt ? <p>Оплачен {formatPaidAt(current.paidAt)}</p> : null}
          </div>
        ) : null}

        <a href={window.location.pathname}>Вернуться в конструктор</a>
      </article>
    </main>
  );
}

export const PayView = memo(PayViewComponent);
