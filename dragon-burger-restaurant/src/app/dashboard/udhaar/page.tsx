'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'

interface UdhaarGroup {
  customer: string
  orders: Order[]
  total: number
}

export default function UdhaarPage() {
  const [groups, setGroups] = useState<UdhaarGroup[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUdhaar = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('orders').select('*').eq('payment_status', 'udhaar').order('created_at', { ascending: false })
    if (data) {
      const grouped: Record<string, Order[]> = {}
      data.forEach(o => {
        const key = o.customer_name.trim().toLowerCase()
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(o)
      })
      const result = Object.entries(grouped).map(([, orders]) => ({
        customer: orders[0].customer_name,
        orders,
        total: orders.reduce((s, o) => s + o.total, 0),
      })).sort((a, b) => b.total - a.total)
      setGroups(result)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUdhaar()
    const supabase = createClient()
    const channel = supabase.channel('udhaar').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchUdhaar).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleMarkAllPaid = async (orders: Order[]) => {
    if (!confirm(`Mark all orders for this customer as Paid?`)) return
    await Promise.all(orders.map(o => fetch(`/api/orders/${o.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payment_status: 'paid' }) })))
    fetchUdhaar()
  }

  const grandTotal = groups.reduce((s, g) => s + g.total, 0)

  return (
    <div>
      <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '28px', color: 'var(--green-dark)', letterSpacing: '2px', marginBottom: '8px' }}>
        💳 Udhaar (Credit)
      </h1>

      <div style={{ background: 'linear-gradient(135deg, var(--amber), #c67c18)', color: 'white', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>Total Outstanding Udhaar</div>
          <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '36px', letterSpacing: '2px' }}>{formatPrice(grandTotal)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '28px', fontFamily: 'Bebas Neue, cursive' }}>{groups.length}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Customers</div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-icon">⏳</div><h3>Loading...</h3></div>
      ) : groups.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🎉</div><h3>No Udhaar!</h3><p>All accounts are settled.</p></div>
      ) : (
        <div className="udhaar-grid">
          {groups.map(group => (
            <div key={group.customer} className="udhaar-card">
              <div className="udhaar-card-header">
                <div>
                  <div className="udhaar-customer">{group.customer}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>{group.orders.length} order{group.orders.length !== 1 ? 's' : ''}</div>
                </div>
                <div className="udhaar-amount">{formatPrice(group.total)}</div>
              </div>
              <div className="udhaar-card-body">
                {group.orders.map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                    <div>
                      <span style={{ fontFamily: 'Bebas Neue, cursive', color: 'var(--green)', fontSize: '16px' }}>#{o.order_num}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '11px' }}>{formatDate(o.created_at)}</span>
                    </div>
                    <strong style={{ color: 'var(--green-dark)' }}>{formatPrice(o.total)}</strong>
                  </div>
                ))}
                <div style={{ paddingTop: '10px', textAlign: 'right' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleMarkAllPaid(group.orders)}>
                    ✅ Mark All Paid
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
