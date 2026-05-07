'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import { formatDate, formatPrice, deliveryBadgeClass, paymentBadgeClass } from '@/lib/utils'
import EditOrderModal from '@/components/modals/EditOrderModal'
import InvoiceModal from '@/components/modals/InvoiceModal'

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null)
  const [filterDate, setFilterDate] = useState('')
  const [filterDelivery, setFilterDelivery] = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [search, setSearch] = useState('')

  const fetchOrders = async () => {
    const params = new URLSearchParams()
    if (filterDate) params.set('date', filterDate)
    if (filterDelivery) params.set('delivery', filterDelivery)
    if (filterPayment) params.set('payment', filterPayment)
    if (search) params.set('search', search)
    const res = await fetch(`/api/orders?${params}`)
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [filterDate, filterDelivery, filterPayment, search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this order?')) return
    await fetch(`/api/orders/${id}`, { method: 'DELETE' })
    fetchOrders()
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '28px', color: 'var(--green-dark)', letterSpacing: '2px', marginBottom: '20px' }}>
        📑 All Orders
      </h1>

      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="filters-bar">
          <div className="filter-group">
            <label>Date</label>
            <input type="date" className="form-control" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Delivery Status</label>
            <select className="form-control" value={filterDelivery} onChange={e => setFilterDelivery(e.target.value)}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Payment Status</label>
            <select className="form-control" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="udhaar">Udhaar</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Search</label>
            <input className="form-control" placeholder="Customer name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-secondary" onClick={() => { setFilterDate(''); setFilterDelivery(''); setFilterPayment(''); setSearch('') }}>
            🔄 Clear
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Orders ({orders.length})</span>
        </div>
        {loading ? (
          <div className="empty-state"><div className="empty-icon">⏳</div><h3>Loading...</h3></div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📭</div><h3>No orders found</h3></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Date / Time</th><th>Customer</th><th>Type</th><th>Items</th><th>Total</th><th>Delivery</th><th>Payment</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '18px', color: 'var(--green)' }}>#{order.order_num}</td>
                    <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDate(order.created_at)}</td>
                    <td><div style={{ fontWeight: 700 }}>{order.customer_name}</div>{order.order_ref && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.order_ref}</div>}</td>
                    <td><span style={{ fontSize: '12px', background: 'var(--green-pale)', padding: '2px 8px', borderRadius: '10px', color: 'var(--green-dark)', fontWeight: 600 }}>{order.order_type}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px' }}>{order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</td>
                    <td style={{ fontWeight: 700, color: 'var(--green-dark)', whiteSpace: 'nowrap' }}>{formatPrice(order.total)}</td>
                    <td><span className={deliveryBadgeClass(order.delivery_status)}>{order.delivery_status}</span></td>
                    <td><span className={paymentBadgeClass(order.payment_status)}>{order.payment_status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditOrder(order)}>✏️</button>
                        <button className="btn btn-gold btn-sm" onClick={() => setInvoiceOrder(order)}>🧾</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(order.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editOrder && <EditOrderModal order={editOrder} onClose={() => setEditOrder(null)} onSaved={fetchOrders} />}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </div>
  )
}
