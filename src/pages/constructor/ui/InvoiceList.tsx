import { memo, useEffect, useMemo, useState } from 'react';

import { type Invoice, type InvoiceStatus, STATUSES } from '../../../entities/invoice';
import styles from './constructor.module.css';
import { InvoiceCard } from './InvoiceCard';

type InvoiceListProps = {
  items: Invoice[];
  filter: InvoiceStatus | 'all';
  onFilter: (value: InvoiceStatus | 'all') => void;
  onChange: () => void;
  onTick: () => void;
};

const FILTERS: Array<InvoiceStatus | 'all'> = ['all', ...STATUSES];

function filterLabel(value: InvoiceStatus | 'all'): string {
  if (value === 'all') {
    return 'все';
  }
  if (value === 'pending') {
    return 'ожидают';
  }
  if (value === 'paid') {
    return 'оплачены';
  }
  return 'истекли';
}

function InvoiceListComponent({ items, filter, onFilter, onChange, onTick }: InvoiceListProps) {
  const [now, setNow] = useState(() => Date.now());
  const visible = useMemo(
    () => items.filter((item) => filter === 'all' || item.status === filter),
    [filter, items],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
      onTick();
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onTick]);

  return (
    <section className={styles.list} aria-labelledby='invoices-heading'>
      <div className={styles.listHead}>
        <h2 id='invoices-heading'>Выставленные</h2>
        <div className={styles.filters} role='tablist' aria-label='Фильтр по статусу'>
          {FILTERS.map((value) => (
            <button
              key={value}
              type='button'
              role='tab'
              aria-selected={filter === value}
              aria-controls='invoice-results'
              className={filter === value ? styles.filterActive : styles.filter}
              onClick={() => onFilter(value)}
            >
              {filterLabel(value)}
            </button>
          ))}
        </div>
      </div>
      <div id='invoice-results' role='tabpanel' aria-live='polite'>
        {visible.length === 0 ? (
          <p className={styles.empty}>Пока пусто — соберите первый счёт слева.</p>
        ) : (
          <div className={styles.stack}>
            {visible.map((item) => (
              <InvoiceCard key={item.id} invoice={item} now={now} onChange={onChange} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export const InvoiceList = memo(InvoiceListComponent);
