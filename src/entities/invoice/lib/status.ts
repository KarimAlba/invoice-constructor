import type { Invoice, InvoiceStatus } from '../model/types'

export function resolveStatus(invoice: Invoice, now = Date.now()): InvoiceStatus {
  if (invoice.status === 'paid') {
    return 'paid'
  }

  if (now >= invoice.expiresAt) {
    return 'expired'
  }

  return 'pending'
}

export function withResolvedStatus(invoice: Invoice, now = Date.now()): Invoice {
  const status = resolveStatus(invoice, now)

  if (status === invoice.status) {
    return invoice
  }

  return { ...invoice, status }
}
