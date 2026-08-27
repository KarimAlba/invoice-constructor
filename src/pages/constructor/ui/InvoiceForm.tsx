import { type FormEvent, useMemo, useState } from 'react';

import { createInvoice, CURRENCIES, type Currency, TTL_OPTIONS } from '../../../entities/invoice';
import styles from './constructor.module.css';

type InvoiceFormProps = {
  onCreated: (id: string) => void;
};

function nextRequestKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function InvoiceForm({ onCreated }: InvoiceFormProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USDT');
  const [description, setDescription] = useState('');
  const [ttlMinutes, setTtlMinutes] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [requestKey, setRequestKey] = useState(nextRequestKey);

  const canSubmit = useMemo(() => amount.trim().length > 0 && !busy, [amount, busy]);

  function clearError() {
    if (error) {
      setError(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) {
      return;
    }

    setBusy(true);
    const result = createInvoice({
      amount,
      currency,
      description,
      ttlMinutes,
      requestKey,
    });

    if ('error' in result) {
      setError(result.error);
      setBusy(false);
      return;
    }

    setAmount('');
    setDescription('');
    setRequestKey(nextRequestKey());
    setBusy(false);
    onCreated(result.id);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <header className={styles.formHead}>
        <p className={styles.kicker}>Новый счёт</p>
        <h2>Собрать инвойс</h2>
        <p className={styles.lede}>
          Сумма, валюта и срок жизни ссылки. Повторный клик с тем же ключом не создаст дубль.
        </p>
      </header>

      <label className={styles.field}>
        <span>Сумма</span>
        <div className={styles.amountRow}>
          <input
            inputMode='decimal'
            autoComplete='off'
            name='amount'
            placeholder='0.00'
            value={amount}
            onChange={(event) => {
              clearError();
              setAmount(event.target.value);
            }}
            aria-invalid={Boolean(error)}
          />
          <select
            name='currency'
            value={currency}
            onChange={(event) => {
              clearError();
              setCurrency(event.target.value as Currency);
            }}
          >
            {CURRENCIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </label>

      <label className={styles.field}>
        <span>Описание</span>
        <textarea
          name='description'
          rows={3}
          maxLength={280}
          placeholder='Оплата по договору, заказ #1042'
          value={description}
          onChange={(event) => {
            clearError();
            setDescription(event.target.value);
          }}
        />
        <em>{description.length}/280</em>
      </label>

      <fieldset className={styles.ttl}>
        <legend>Срок жизни ссылки</legend>
        <div className={styles.ttlRow}>
          {TTL_OPTIONS.map((option) => (
            <label key={option.minutes} className={styles.chip}>
              <input
                type='radio'
                name='ttl'
                checked={ttlMinutes === option.minutes}
                onChange={() => {
                  clearError();
                  setTtlMinutes(option.minutes);
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p className={styles.error} role='alert'>
          {error}
        </p>
      ) : null}

      <button className={styles.submit} type='submit' disabled={!canSubmit}>
        {busy ? 'Создаём…' : 'Выставить счёт'}
      </button>
    </form>
  );
}
