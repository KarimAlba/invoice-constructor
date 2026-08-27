import { useEffect, useMemo, useState } from 'react'
import { getInvoice, listInvoices, type Invoice, type InvoiceStatus } from '../../../entities/invoice'
import { InvoiceForm } from './InvoiceForm'
import { InvoiceList } from './InvoiceList'
import { PayView } from './PayView'
import styles from './constructor.module.css'

function payIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('pay')
}

export function ConstructorPage() {
  const [items, setItems] = useState<Invoice[]>(() => listInvoices())
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all')
  const [now, setNow] = useState(() => Date.now())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const payId = payIdFromUrl()

  function refresh() {
    setItems(listInvoices())
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
      setItems(listInvoices())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  )

  if (payId) {
    return <PayView invoice={getInvoice(payId)} onPaid={refresh} />
  }

  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <p className={styles.brand}>Ledger slip</p>
        <h1>Конструктор инвойса</h1>
        <p>Один экран: выставить счёт, получить ссылку, следить за статусом.</p>
      </header>
      <div className={styles.layout}>
        <InvoiceForm
          onCreated={(id) => {
            refresh()
            setSelectedId(id)
            setFilter('all')
          }}
        />
        <div className={styles.side}>
          {selected ? (
            <p className={styles.hint}>
              Последний фокус: <strong>INV-{selected.id.toUpperCase()}</strong>
            </p>
          ) : null}
          <InvoiceList
            items={items}
            filter={filter}
            now={now}
            onFilter={setFilter}
            onChange={refresh}
          />
        </div>
      </div>
    </div>
  )
}
