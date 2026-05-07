'use client'
import { useEffect, useState } from 'react'

interface Props { expiresAt: string | null }

export default function ShutdownBanner({ expiresAt }: Props) {
  const [timeLeft, setTimeLeft] = useState('')
  const [show, setShow] = useState(false)
  const phone = process.env.NEXT_PUBLIC_OWNER_PHONE || ''

  useEffect(() => {
    if (!expiresAt) return
    const check = () => {
      const now = new Date()
      const exp = new Date(expiresAt)
      const diff = exp.getTime() - now.getTime()
      if (diff <= 0 || diff > 24 * 60 * 60 * 1000) { setShow(false); return }
      setShow(true)
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    check()
    const interval = setInterval(check, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (!show) return null

  return (
    <div className="shutdown-banner">
      ⚠️ Your account will shut down in <strong>{timeLeft}</strong> — Contact:{' '}
      <a href={`tel:${phone}`}>{phone}</a>
    </div>
  )
}
