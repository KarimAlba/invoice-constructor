import type { Currency, InvoiceStatus } from '../model/types';

const FRACTION_DIGITS: Record<Currency, number> = {
  USDT: 2,
  RUB: 2,
  BTC: 8,
  ETH: 6,
};

export function maxFractionDigits(currency: Currency): number {
  return FRACTION_DIGITS[currency];
}

export function formatAmount(amount: string, currency: Currency): string {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return `— ${currency}`;
  }

  return `${value.toLocaleString('ru-RU', {
    minimumFractionDigits: currency === 'BTC' || currency === 'ETH' ? 0 : 2,
    maximumFractionDigits: FRACTION_DIGITS[currency],
  })} ${currency}`;
}

export function formatCountdown(expiresAt: number, now = Date.now()): string {
  const diff = expiresAt - now;

  if (diff <= 0) {
    return 'истёк';
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}ч ${String(minutes).padStart(2, '0')}м`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function statusLabel(status: InvoiceStatus): string {
  if (status === 'paid') {
    return 'оплачен';
  }

  if (status === 'expired') {
    return 'истёк';
  }

  return 'ожидает';
}

export function paymentUrl(invoiceId: string): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('pay', invoiceId);
  return url.toString();
}
