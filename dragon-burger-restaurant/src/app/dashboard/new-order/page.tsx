'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, MenuItems, OrderItem } from '@/types'
import { DEFAULT_MENU } from '@/lib/menu-data'
import { formatPrice, formatTimeOnly, deliveryBadgeClass, paymentBadgeClass, todayDateStr } from '@/lib/utils'

export default function NewOrderPage() {
  const [menu, setMenu] = useState<MenuItems>(DEFAULT_MENU)
  const [activeCategory, setActiveCategory] = useState(Object.keys(DEFAULT_MENU)[0])
  const [cart, setCart] = useState<OrderItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [orderType, setOrderType] = useState<'dine-in'|'takeaway'|'delivery'>('dine-in')
  const [orderRef, setOrderRef] = useState('')
  const [deliveryStatus, setDeliveryStatus] = useState('pending')
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [notes, setNotes] = useState('')
  const [deliveryName, setDeliveryName] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [todayOrders, setTodayOrders] = useState<Order[]>([])
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const loadMenu = async () => {
      const res = await fetch('/api/menu')
      const data = await res.json()
      if (data.data) { setMenu(data.data); setActiveCategory(Object.keys(data.data)[0]) }
    }
    loadMenu()
    fetchTodayOrders()
    const supabase = createClient()
    const channel = supabase.channel('new-order-today').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchTodayOrders).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchTodayOrders = async () => {
    const supabase = createClient()
    const today = todayDateStr()
    const { data } = await supabase.from('orders').select('*').gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`).order('created_at', { ascending: false })
    if (data) setTodayOrders(data)
  }

  const addToCart = (item: { name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(c => c.name === item.name)
      if (existing) return prev.map(c => c.name === item.name ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { name: item.name, price: item.price, qty: 1 }]
    })
  }

  const updateQty = (name: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(c => c.name === name ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0)
      return updated
    })
  }

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0)

  const handleSubmit = async () => {
    if (!customerName.trim()) { alert('Customer name required'); return }
    if (cart.length === 0) { alert('Add at least one item'); return }
    if (orderType === 'delivery' && (!deliveryName || !deliveryPhone || !deliveryAddress)) {
      alert('Delivery info is required'); return
    }
    setSubmitting(true)
    const body: any = {
      customer_name: customerName, order_type: orderType, order_ref: orderRef,
      items: cart, total, delivery_status: deliveryStatus, payment_status: paymentStatus, notes,
    }
    if (orderType === 'delivery') body.delivery_info = { name: deliveryName, phone: deliveryPhone, address: deliveryAddress }
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      setCart([]); setCustomerName(''); setOrderRef(''); setNotes('')
      setDeliveryName(''); setDeliveryPhone(''); setDeliveryAddress('')
      setOrderType('dine-in'); setDeliveryStatus('pending'); setPaymentStatus('unpaid')
      setSuccessMsg('✅ Order placed successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
    setSubmitting(false)
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '28px', color: 'var(--green-dark)', letterSpacing: '2px', marginBottom: '20px' }}>
        ➕ New Order
      </h1>
      {successMsg && <div style={{ background: '#d4edda', color: '#155724', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: 700 }}>{successMsg}</div>}

      <div className="two-col">
        {/* ORDER FORM */}
        <div className="form-sticky">
          <div className="card">
            <div className="card-header"><span className="card-title">🧾 Order Details</span></div>

            <div className="form-group">
              <label>Customer Name *</label>
              <input className="form-control" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter customer name" />
            </div>

            <div className="form-group">
              <label>Order Type</label>
              <select className="form-control" value={orderType} onChange={e => setOrderType(e.target.value as any)}>
                <option value="dine-in">🪑 Dine-in</option>
                <option value="takeaway">🥡 Takeaway</option>
                <option value="delivery">🛵 Delivery</option>
              </select>
            </div>

            <div className="form-group">
              <label>{orderType === 'delivery' ? 'Phone Number' : 'Table #'}</label>
              <input className="form-control" value={orderRef} onChange={e => setOrderRef(e.target.value)} placeholder={orderType === 'delivery' ? 'Customer phone' : 'Table number'} />
            </div>

            {orderType === 'delivery' && (
              <div className="delivery-box">
                <div className="delivery-box-title">🛵 Delivery Information</div>
                <div className="form-group"><label>Delivery Person Name *</label><input className="form-control" value={deliveryName} onChange={e => setDeliveryName(e.target.value)} placeholder="Rider name" /></div>
                <div className="form-group"><label>Rider Phone *</label><input className="form-control" value={deliveryPhone} onChange={e => setDeliveryPhone(e.target.value)} placeholder="Rider phone" /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label>Delivery Address *</label><input className="form-control" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Full delivery address" /></div>
              </div>
            )}

            {/* MENU PICKER */}
            <div className="form-group">
              <label>Add Items</label>
              <div className="category-tabs">
                {Object.keys(menu).map(cat => (
                  <button key={cat} className={`cat-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
                ))}
              </div>
              <div className="items-grid">
                {(menu[activeCategory] || []).map((item, i) => (
                  <button key={i} className="item-btn" onClick={() => addToCart(item)}>
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">{formatPrice(item.price)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* CART */}
            {cart.length > 0 && (
              <div className="form-group">
                <label>Cart</label>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.name} className="cart-item">
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => updateQty(item.name, -1)}>−</button>
                        <span className="qty-val">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.name, 1)}>+</button>
                      </div>
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-price">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="cart-total">Total: {formatPrice(total)}</div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Delivery Status</label>
                <select className="form-control" value={deliveryStatus} onChange={e => setDeliveryStatus(e.target.value)}>
                  <option value="pending">⏳ Pending</option>
                  <option value="preparing">👨‍🍳 Preparing</option>
                  <option value="ready">✅ Ready</option>
                  <option value="delivered">📦 Delivered</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Payment Status</label>
                <select className="form-control" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                  <option value="unpaid">❌ Unpaid</option>
                  <option value="paid">✅ Paid</option>
                  <option value="udhaar">📒 Udhaar</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label>Notes</label>
              <textarea className="form-control" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions..." style={{ resize: 'vertical' }} />
            </div>

            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}>
              {submitting ? '⏳ Placing Order...' : '✅ Place Order'}
            </button>
          </div>
        </div>

        {/* TODAY'S ORDERS */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Today's Orders ({todayOrders.length})</span>
          </div>
          {todayOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}><div className="empty-icon">🍔</div><h3>No orders yet</h3></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Delivery</th><th>Payment</th><th>Time</th></tr></thead>
                <tbody>
                  {todayOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '18px', color: 'var(--green)' }}>#{order.order_num}</td>
                      <td><div style={{ fontWeight: 700 }}>{order.customer_name}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.order_type}</div></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</td>
                      <td style={{ fontWeight: 700, color: 'var(--green-dark)' }}>{formatPrice(order.total)}</td>
                      <td><span className={deliveryBadgeClass(order.delivery_status)}>{order.delivery_status}</span></td>
                      <td><span className={paymentBadgeClass(order.payment_status)}>{order.payment_status}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatTimeOnly(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
