'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import { formatPrice } from '@/lib/utils'

const TABS = [
  { label: '📋 Overview', path: '/dashboard' },
  { label: '➕ New Order', path: '/dashboard/new-order' },
  { label: '📑 All Orders', path: '/dashboard/orders' },
  { label: '📊 Reports', path: '/dashboard/reports' },
  { label: '💳 Udhaar', path: '/dashboard/udhaar' },
  { label: '🏷️ Menu Editor', path: '/dashboard/menu' },
]

interface Props { onLogout: () => void }

export default function Header({ onLogout }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [stats, setStats] = useState({ orders: 0, revenue: 0, pending: 0, unpaid: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase.from('orders')
        .select('total, delivery_status, payment_status, created_at')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
      if (data) {
        setStats({
          orders: data.length,
          revenue: data.reduce((s, o) => s + o.total, 0),
          pending: data.filter(o => o.delivery_status === 'pending' || o.delivery_status === 'preparing').length,
          unpaid: data.filter(o => o.payment_status === 'unpaid').length,
        })
      }
    }
    fetchStats()
    const supabase = createClient()
    const channel = supabase.channel('header-stats').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <header className="header">
      <div className="header-top">
        <div className="brand">
          <div>
            <div className="brand-name">🐉 Dragon Burger</div>
            <div className="brand-sub">Restaurant Management</div>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-pill"><span className="val">{stats.orders}</span><span className="lbl">Orders Today</span></div>
          <div className="stat-pill"><span className="val">{formatPrice(stats.revenue)}</span><span className="lbl">Revenue</span></div>
          <div className="stat-pill"><span className="val">{stats.pending}</span><span className="lbl">Pending</span></div>
          <div className="stat-pill"><span className="val">{stats.unpaid}</span><span className="lbl">Unpaid</span></div>
        </div>
        <button className="logout-btn" onClick={onLogout}>🚪 Logout</button>
      </div>
      <nav className="nav-tabs">
        {TABS.map(tab => (
          <button
            key={tab.path}
            className={`nav-tab ${pathname === tab.path ? 'active' : ''}`}
            onClick={() => router.push(tab.path)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
