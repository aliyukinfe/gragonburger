'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ShutdownBanner from '@/components/ShutdownBanner'
import Header from '@/components/Header'

interface Props {
  children: React.ReactNode
  accountStatus: { is_active: boolean; expires_at: string | null; activated_at: string }
}

export default function DashboardClient({ children, accountStatus }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="app-wrapper">
      <ShutdownBanner expiresAt={accountStatus.expires_at} />
      <Header onLogout={handleLogout} />
      <main className="main-content">{children}</main>
    </div>
  )
}
