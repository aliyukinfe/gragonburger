'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import { formatPrice, formatTimeOnly, deliveryBadgeClass, paymentBadgeClass, todayDateStr } from '@/lib/utils'
import EditOrderModal from '@/components/modals/EditOrderModal'
import InvoiceModal from '@/components/modals/InvoiceModal'

export default function OverviewPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    const supabase = createClient()
    const today = todayDateStr()
    const { data } = await supabase.from('orders')
      .select('*').gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`)
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    const supabase = createClient()
    const channel = supabase.channel('overview-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const pendingOrders = orders.filter(o => ['pending','preparing'].includes(o.delivery_status)).length
  const unpaidOrders = orders.filter(o => o.payment_status === 'unpaid').length
  const udhaarTotal = orders.filter(o => o.payment_status === 'udhaar').reduce((s,o) => s+o.total, 0)

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '28px', color: 'var(--green-dark)', letterSpacing: '2px' }}>
          📋 Today's Overview
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="icon">📦</div><div className="value">{orders.length}</div><div className="label">Total Orders</div></div>
        <div className="stat-card"><div className="icon">💰</div><div className="value">{formatPrice(totalRevenue)}</div><div className="label">Revenue</div></div>
        <div className="stat-card"><div className="icon">⏳</div><div className="value">{pendingOrders}</div><div className="label">Pending Delivery</div></div>
        <div className="stat-card"><div className="icon">❌</div><div className="value">{unpaidOrders}</div><div className="label">Unpaid Orders</div></div>
        <div className="stat-card"><div className="icon">📒</div><div className="value">{formatPrice(udhaarTotal)}</div><div className="label">Total Udhaar</div></div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-icon">⏳</div><h3>Loading orders...</h3></div>
      ) : orders.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🍔</div><h3>No orders today yet</h3><p>Orders will appear here in real-time</p></div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <span className="order-num">#{order.order_num}</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className="order-type-tag">{order.order_type}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{formatTimeOnly(order.created_at)}</span>
                </div>
              </div>
              <div className="order-card-body">
                <div className="order-customer">{order.customer_name}</div>
                {order.order_ref && <div className="order-ref">📍 {order.order_ref}</div>}
                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item-line">
                      <span>{item.qty}x {item.name}</span>
                      <span>{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                {order.notes && <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>📝 {order.notes}</p>}
                <div className="order-total">{formatPrice(order.total)}</div>
              </div>
              <div className="order-card-footer">
                <div className="badges-row">
                  <span className={deliveryBadgeClass(order.delivery_status)}>{order.delivery_status}</span>
                  <span className={paymentBadgeClass(order.payment_status)}>{order.payment_status}</span>
                </div>
                <div className="action-btns">
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditOrder(order)}>✏️ Edit</button>
                  <button className="btn btn-gold btn-sm" onClick={() => setInvoiceOrder(order)}>🧾 Invoice</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editOrder && <EditOrderModal order={editOrder} onClose={() => setEditOrder(null)} onSaved={fetchOrders} />}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </div>
  )
}
