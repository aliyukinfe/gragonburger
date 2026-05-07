'use client'
import { useEffect, useState } from 'react'
import { Order } from '@/types'
import { formatPrice, formatDate, downloadCSV, todayDateStr } from '@/lib/utils'

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const today = todayDateStr()
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)

  const fetchReport = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    const res = await fetch(`/api/orders?from=${fromDate}&to=${toDate}`)
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => { fetchReport() }, [fromDate, toDate])

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const paidRevenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0)
  const unpaidRevenue = orders.filter(o => o.payment_status === 'unpaid').reduce((s, o) => s + o.total, 0)
  const udhaarRevenue = orders.filter(o => o.payment_status === 'udhaar').reduce((s, o) => s + o.total, 0)
  const delivered = orders.filter(o => o.delivery_status === 'delivered').length

  // Top items
  const itemMap: Record<string, { qty: number; revenue: number }> = {}
  orders.forEach(o => o.items.forEach(item => {
    if (!itemMap[item.name]) itemMap[item.name] = { qty: 0, revenue: 0 }
    itemMap[item.name].qty += item.qty
    itemMap[item.name].revenue += item.price * item.qty
  }))
  const topItems = Object.entries(itemMap).sort((a, b) => b[1].qty - a[1].qty).slice(0, 10)

  const handleExportCSV = () => {
    const headers = ['Order#', 'Date', 'Customer', 'Type', 'Items', 'Total', 'Delivery Status', 'Payment Status', 'Notes', 'Delivery Address']
    const rows = orders.map(o => [
      o.order_num,
      formatDate(o.created_at),
      o.customer_name,
      o.order_type,
      o.items.map(i => `${i.qty}x ${i.name}`).join(' | '),
      o.total,
      o.delivery_status,
      o.payment_status,
      o.notes || '',
      o.delivery_info ? o.delivery_info.address : '',
    ])
    const csv = [headers, ...rows].map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
    downloadCSV(csv, `dragon-burger-report-${fromDate}-to-${toDate}.csv`)
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '28px', color: 'var(--green-dark)', letterSpacing: '2px', marginBottom: '20px' }}>
        📊 Reports
      </h1>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="filter-group"><label>From Date</label><input type="date" className="form-control" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
          <div className="filter-group"><label>To Date</label><input type="date" className="form-control" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={fetchReport}>🔍 Generate Report</button>
          <button className="btn btn-gold" onClick={handleExportCSV} disabled={orders.length === 0}>📥 Export CSV</button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-icon">⏳</div><h3>Generating report...</h3></div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card"><div className="icon">📦</div><div className="value">{orders.length}</div><div className="label">Total Orders</div></div>
            <div className="stat-card"><div className="icon">💰</div><div className="value">{formatPrice(totalRevenue)}</div><div className="label">Total Revenue</div></div>
            <div className="stat-card"><div className="icon">✅</div><div className="value">{formatPrice(paidRevenue)}</div><div className="label">Paid</div></div>
            <div className="stat-card"><div className="icon">❌</div><div className="value">{formatPrice(unpaidRevenue)}</div><div className="label">Unpaid</div></div>
            <div className="stat-card"><div className="icon">📒</div><div className="value">{formatPrice(udhaarRevenue)}</div><div className="label">Udhaar</div></div>
            <div className="stat-card"><div className="icon">📦</div><div className="value">{delivered}</div><div className="label">Delivered</div></div>
          </div>

          {topItems.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header"><span className="card-title">🔥 Top Selling Items</span></div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Rank</th><th>Item</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {topItems.map(([name, stats], i) => (
                      <tr key={name}>
                        <td style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '20px', color: i < 3 ? 'var(--gold)' : 'var(--text-muted)' }}>#{i+1}</td>
                        <td style={{ fontWeight: 600 }}>{name}</td>
                        <td><strong>{stats.qty}</strong> pcs</td>
                        <td style={{ fontWeight: 700, color: 'var(--green-dark)' }}>{formatPrice(stats.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {orders.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="card-title">📋 Orders in Range ({orders.length})</span></div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>#</th><th>Date</th><th>Customer</th><th>Type</th><th>Total</th><th>Payment</th></tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '18px', color: 'var(--green)' }}>#{o.order_num}</td>
                        <td style={{ fontSize: '12px' }}>{formatDate(o.created_at)}</td>
                        <td style={{ fontWeight: 600 }}>{o.customer_name}</td>
                        <td>{o.order_type}</td>
                        <td style={{ fontWeight: 700, color: 'var(--green-dark)' }}>{formatPrice(o.total)}</td>
                        <td><span className={`badge badge-${o.payment_status}`}>{o.payment_status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
