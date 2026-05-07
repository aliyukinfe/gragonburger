'use client'
import { Order } from '@/types'
import { formatDate, formatPrice } from '@/lib/utils'

interface Props {
  order: Order
  onClose: () => void
}

export default function InvoiceModal({ order, onClose }: Props) {
  const handlePrint = () => window.print()
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Dragon Burger Restaurant'
  const phone = process.env.NEXT_PUBLIC_OWNER_PHONE || ''

  return (
    <div className="modal-overlay no-print" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box invoice-print-area" style={{ maxWidth: '500px' }}>
        <div className="modal-header no-print">
          <span className="modal-title">🧾 Invoice</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>🖨️ Print</button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="invoice-wrapper">
          <div className="invoice-header">
            <div className="invoice-brand">🐉 {appName}</div>
            {phone && <div className="invoice-sub">📞 {phone}</div>}
            <div className="invoice-num">Invoice #ORD-{String(order.order_num).padStart(4, '0')}</div>
          </div>

          <div className="invoice-meta">
            <div className="invoice-meta-item">
              <div className="invoice-meta-label">Customer</div>
              <div className="invoice-meta-value">{order.customer_name}</div>
            </div>
            <div className="invoice-meta-item">
              <div className="invoice-meta-label">Date</div>
              <div className="invoice-meta-value">{formatDate(order.created_at)}</div>
            </div>
            <div className="invoice-meta-item">
              <div className="invoice-meta-label">Order Type</div>
              <div className="invoice-meta-value" style={{ textTransform: 'capitalize' }}>{order.order_type}</div>
            </div>
            {order.order_ref && (
              <div className="invoice-meta-item">
                <div className="invoice-meta-label">{order.order_type === 'delivery' ? 'Phone' : 'Table #'}</div>
                <div className="invoice-meta-value">{order.order_ref}</div>
              </div>
            )}
            <div className="invoice-meta-item">
              <div className="invoice-meta-label">Payment</div>
              <div className="invoice-meta-value" style={{ textTransform: 'capitalize' }}>{order.payment_status}</div>
            </div>
          </div>

          <table className="invoice-items-table">
            <thead>
              <tr><th>Item</th><th style={{ textAlign: 'center' }}>Qty</th><th style={{ textAlign: 'right' }}>Price</th><th style={{ textAlign: 'right' }}>Total</th></tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td style={{ textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right' }}>{formatPrice(item.price)}</td>
                  <td style={{ textAlign: 'right' }}>{formatPrice(item.price * item.qty)}</td>
                </tr>
              ))}
              <tr className="invoice-total-row">
                <td colSpan={3} style={{ textAlign: 'right', paddingTop: '12px' }}>TOTAL</td>
                <td style={{ textAlign: 'right', paddingTop: '12px', color: 'var(--green-dark)' }}>{formatPrice(order.total)}</td>
              </tr>
            </tbody>
          </table>

          {order.notes && (
            <div style={{ background: 'var(--green-pale)', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
              <strong>Notes:</strong> {order.notes}
            </div>
          )}

          <div className="invoice-footer">
            <p>Thank you for dining with us! 🐉</p>
            <p style={{ marginTop: '4px' }}>{appName}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
