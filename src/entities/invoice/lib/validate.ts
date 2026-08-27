import { maxFractionDigits } from './format'
import type { CreateInvoiceInput } from '../model/types'

export function validateCreateInput(input: CreateInvoiceInput): string | null {
  const raw = input.amount.trim().replace(',', '.')

  if (!raw) {
    return 'Укажите сумму'
  }

  if (!/^\d+(\.\d+)?$/.test(raw)) {
    return 'Сумма должна быть числом больше нуля'
  }

  const value = Number(raw)

  if (!Number.isFinite(value) || value <= 0) {
    return 'Сумма должна быть больше нуля'
  }

  const [, fraction = ''] = raw.split('.')
  if (fraction.length > maxFractionDigits(input.currency)) {
    return `Для ${input.currency} максимум ${maxFractionDigits(input.currency)} знаков после запятой`
  }

  if (input.description.trim().length > 280) {
    return 'Описание не длиннее 280 символов'
  }

  if (input.ttlMinutes <= 0) {
    return 'Выберите срок жизни ссылки'
  }

  return null
}
