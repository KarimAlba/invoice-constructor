import { useState } from 'react'
import {
  formatAmount,
  formatCountdown,
  markInvoicePaid,
  paymentUrl,
  statusLabel,
  type Invoice,
} from '../../../entities/invoice'
import styles from './constructor.module.css'

type InvoiceCardProps = {
  invoice: Invoice
  now: number
  onChange: () => void
}

export function InvoiceCard({ invoice, now, onChange }: InvoiceCardProps) {
  const [copied, setCopied] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const link = paymentUrl(invoice.id)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setActionError('Не удалось скопировать ссылку')
    }
  }

  function pay() {
    const result = markInvoicePaid(invoice.id)
    if ('error' in result) {
      setActionError(result.error)
      return
    }
    setActionError(null)
    onChange()
  }

  return (
    <article className={styles.receipt} data-status={invoice.status}>
      <div className={styles.receiptTop}>
        <span className={styles.stamp}>{statusLabel(invoice.status)}</span>
        <span className={styles.serial}>INV-{invoice.id.toUpperCase()}</span>
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
      <div className={styles.receiptActions}>
        <button type="button" onClick={() => void copyLink()}>
          {copied ? 'Скопировано' : 'Копировать ссылку'}
        </button>
        {invoice.status === 'pending' ? (
          <button type="button" className={styles.ghost} onClick={pay}>
            Отметить оплаченным
          </button>
        ) : null}
      </div>
      {actionError ? (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      ) : null}
    </article>
  )
}
