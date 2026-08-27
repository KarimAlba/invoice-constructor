import { type Invoice, type InvoiceStatus, STATUSES } from '../model/types';
import styles from './constructor.module.css';
import { InvoiceCard } from './InvoiceCard';

type InvoiceListProps = {
  items: Invoice[];
  filter: InvoiceStatus | 'all';
  now: number;
  onFilter: (value: InvoiceStatus | 'all') => void;
  onChange: () => void;
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

export function InvoiceList({ items, filter, now, onFilter, onChange }: InvoiceListProps) {
  const visible = items.filter((item) => filter === 'all' || item.status === filter);

  return (
    <section className={styles.list}>
      <div className={styles.listHead}>
        <h2>Выставленные</h2>
        <div className={styles.filters} role='tablist' aria-label='Фильтр по статусу'>
          {FILTERS.map((value) => (
            <button
              key={value}
              type='button'
              role='tab'
              aria-selected={filter === value}
              className={filter === value ? styles.filterActive : styles.filter}
              onClick={() => onFilter(value)}
            >
              {filterLabel(value)}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <p className={styles.empty}>Пока пусто — соберите первый счёт слева.</p>
      ) : (
        <div className={styles.stack}>
          {visible.map((item) => (
            <InvoiceCard key={item.id} invoice={item} now={now} onChange={onChange} />
          ))}
        </div>
      )}
    </section>
  );
}
