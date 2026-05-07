'use client'
import { useState } from 'react'
import { Order } from '@/types'

interface Props {
  order: Order
  onClose: () => void
  onSaved: () => void
}

export default function EditOrderModal({ order, onClose, onSaved }: Props) {
  const [deliveryStatus, setDeliveryStatus] = useState(order.delivery_status)
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status)
  const [notes, setNotes] = useState(order.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_status: deliveryStatus, payment_status: paymentStatus, notes }),
    })
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">✏️ Edit Order #{order.order_num}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--green-pale)', borderRadius: '8px' }}>
            <strong>{order.customer_name}</strong> · {order.order_type}
            {order.order_ref && <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}> · {order.order_ref}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Delivery Status</label>
              <select className="form-control" value={deliveryStatus} onChange={e => setDeliveryStatus(e.target.value as any)}>
                <option value="pending">⏳ Pending</option>
                <option value="preparing">👨‍🍳 Preparing</option>
                <option value="ready">✅ Ready</option>
                <option value="delivered">📦 Delivered</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Status</label>
              <select className="form-control" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as any)}>
                <option value="unpaid">❌ Unpaid</option>
                <option value="paid">✅ Paid</option>
                <option value="udhaar">📒 Udhaar</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-control" rows={3} value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
