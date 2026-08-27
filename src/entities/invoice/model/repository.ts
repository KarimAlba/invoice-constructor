import { withResolvedStatus } from '../lib/status'
import { validateCreateInput } from '../lib/validate'
import type { CreateInvoiceInput, Invoice } from './types'

const STORAGE_KEY = 'invoice-constructor.v1'

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().slice(0, 8)
  }

  return Math.random().toString(36).slice(2, 10)
}

function readAll(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as Invoice[]
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
  } catch {
    return []
  }
}

function writeAll(items: Invoice[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function listInvoices(): Invoice[] {
  const items = readAll()
  let dirty = false
  const resolved = items.map((item) => {
    const next = withResolvedStatus(item)
    if (next.status !== item.status) {
      dirty = true
    }
    return next
  })

  if (dirty) {
    writeAll(resolved)
  }

  return [...resolved].sort((a, b) => b.createdAt - a.createdAt)
}

export function getInvoice(id: string): Invoice | null {
  return listInvoices().find((item) => item.id === id) ?? null
}

export function createInvoice(input: CreateInvoiceInput): Invoice | { error: string } {
  const error = validateCreateInput(input)
  if (error) {
    return { error }
  }

  const items = readAll()
  const duplicate = items.find((item) => item.requestKey === input.requestKey)
  if (duplicate) {
    return withResolvedStatus(duplicate)
  }

  const now = Date.now()
  const invoice: Invoice = {
    id: createId(),
    amount: input.amount.trim().replace(',', '.'),
    currency: input.currency,
    description: input.description.trim(),
    createdAt: now,
    expiresAt: now + input.ttlMinutes * 60 * 1000,
    status: 'pending',
    paidAt: null,
    requestKey: input.requestKey,
  }

  writeAll([invoice, ...items])
  return invoice
}

export function markInvoicePaid(id: string): Invoice | { error: string } {
  const items = readAll().map((item) => withResolvedStatus(item))
  const index = items.findIndex((item) => item.id === id)

  if (index === -1) {
    return { error: 'Инвойс не найден' }
  }

  const current = items[index]
  if (current.status === 'expired') {
    return { error: 'Ссылка уже истекла' }
  }

  if (current.status === 'paid') {
    return current
  }

  const paid: Invoice = {
    ...current,
    status: 'paid',
    paidAt: Date.now(),
  }
  items[index] = paid
  writeAll(items)
  return paid
}
