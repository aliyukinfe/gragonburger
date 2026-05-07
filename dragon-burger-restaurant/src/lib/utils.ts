export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  })
}

export function formatDateOnly(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK')}`
}

export function formatTimeOnly(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function todayDateStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function deliveryBadgeClass(status: string): string {
  switch (status) {
    case 'pending': return 'badge badge-pending'
    case 'preparing': return 'badge badge-preparing'
    case 'ready': return 'badge badge-ready'
    case 'delivered': return 'badge badge-delivered'
    default: return 'badge'
  }
}

export function paymentBadgeClass(status: string): string {
  switch (status) {
    case 'paid': return 'badge badge-paid'
    case 'unpaid': return 'badge badge-unpaid'
    case 'udhaar': return 'badge badge-udhaar'
    default: return 'badge'
  }
}

export function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
