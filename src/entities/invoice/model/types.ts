export const CURRENCIES = ['USDT', 'BTC', 'ETH', 'RUB'] as const
export type Currency = (typeof CURRENCIES)[number]

export const TTL_OPTIONS = [
  { label: '15 минут', minutes: 15 },
  { label: '1 час', minutes: 60 },
  { label: '24 часа', minutes: 1440 },
] as const

export const STATUSES = ['pending', 'paid', 'expired'] as const
export type InvoiceStatus = (typeof STATUSES)[number]

export type Invoice = {
  id: string
  amount: string
  currency: Currency
  description: string
  createdAt: number
  expiresAt: number
  status: InvoiceStatus
  paidAt: number | null
  requestKey: string
}

export type CreateInvoiceInput = {
  amount: string
  currency: Currency
  description: string
  ttlMinutes: number
  requestKey: string
}
