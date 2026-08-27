import { useState } from 'react';

import {
  getInvoice,
  type Invoice,
  type InvoiceStatus,
  listInvoices,
} from '../../../entities/invoice';
import styles from './constructor.module.css';
import { InvoiceForm } from './InvoiceForm';
import { InvoiceList } from './InvoiceList';
import { PayView } from './PayView';

function payIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('pay');
}

function sameSnapshot(previous: Invoice[], next: Invoice[]): boolean {
  if (previous.length !== next.length) {
    return false;
  }

  return previous.every((item, index) => {
    const candidate = next[index];
    return (
      item.id === candidate.id &&
      item.status === candidate.status &&
      item.paidAt === candidate.paidAt &&
      item.expiresAt === candidate.expiresAt
    );
  });
}

export function ConstructorPage() {
  const [items, setItems] = useState<Invoice[]>(() => listInvoices());
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const payId = payIdFromUrl();

  function refresh() {
    setItems(listInvoices());
  }

  function handleTick() {
    setItems((previous) => {
      const next = listInvoices();
      return sameSnapshot(previous, next) ? previous : next;
    });
  }

  function handleCreated(id: string) {
    setItems(listInvoices());
    setSelectedId(id);
    setFilter('all');
  }

  if (payId) {
    return <PayView invoice={getInvoice(payId)} onPaid={refresh} />;
  }

  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;

  return (
    <main className={styles.page}>
      <header className={styles.masthead}>
        <div className={styles.mastheadCopy}>
          <p className={styles.brand}>Ledger slip</p>
          <h1>Конструктор инвойса</h1>
        </div>
        <p className={styles.mastheadIntro}>
          Один экран: выставить счёт, получить ссылку, следить за статусом.
        </p>
      </header>
      <div className={styles.layout}>
        <InvoiceForm onCreated={handleCreated} />
        <div className={styles.side}>
          {selected ? (
            <p className={styles.hint} aria-live='polite'>
              Последний фокус: <strong>INV-{selected.id.toUpperCase()}</strong>
            </p>
          ) : null}
          <InvoiceList
            items={items}
            filter={filter}
            onFilter={setFilter}
            onChange={refresh}
            onTick={handleTick}
          />
        </div>
      </div>
    </main>
  );
}
