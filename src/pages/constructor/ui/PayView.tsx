import { memo } from 'react';

import {
  formatAmount,
  type Invoice,
  markInvoicePaid,
  statusLabel,
} from '../../../entities/invoice';
import styles from './constructor.module.css';

type PayViewProps = {
  invoice: Invoice | null;
  onPaid: () => void;
};

function PayViewComponent({ invoice, onPaid }: PayViewProps) {
  if (!invoice) {
    return (
      <main className={styles.pay}>
        <p className={styles.empty}>Счёт не найден или ссылка повреждена.</p>
        <a href={window.location.pathname}>К конструктору</a>
      </main>
    );
  }

  function pay() {
    if (!invoice) {
      return;
    }
    const result = markInvoicePaid(invoice.id);
    if (!('error' in result)) {
      onPaid();
    }
  }

  return (
    <main className={styles.pay}>
      <p className={styles.kicker}>Оплата по ссылке</p>
      <h1>INV-{invoice.id.toUpperCase()}</h1>
      <p className={styles.receiptAmount}>{formatAmount(invoice.amount, invoice.currency)}</p>
      <p className={styles.receiptDesc}>{invoice.description || 'Без описания'}</p>
      <p className={styles.stamp} data-status={invoice.status}>
        {statusLabel(invoice.status)}
      </p>
      {invoice.status === 'pending' ? (
        <button className={styles.submit} type='button' onClick={pay}>
          Оплатить (демо)
        </button>
      ) : null}
      <a href={window.location.pathname}>Вернуться в конструктор</a>
    </main>
  );
}

export const PayView = memo(PayViewComponent);
