import { redirect } from 'next/navigation'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Check account status server-side
  let accountStatus = { is_active: true, expires_at: null as string | null, activated_at: '' }
  try {
    const service = createServiceClient()
    const { data } = await service.from('account_status').select('*').order('created_at', { ascending: false }).limit(1).single()
    if (data) accountStatus = data
  } catch {}

  const now = new Date()
  const isExpired = accountStatus.expires_at ? new Date(accountStatus.expires_at) < now : false
  const isLocked = !accountStatus.is_active || isExpired

  if (isLocked) {
    return (
      <div className="locked-screen">
        <div className="locked-card">
          <div className="locked-icon">🔒</div>
          <div className="locked-title">Account Deactivated</div>
          <p className="locked-msg">
            Your Dragon Burger Restaurant account has been deactivated. Please contact the administrator to reactivate.
          </p>
          <a href={`tel:${process.env.NEXT_PUBLIC_OWNER_PHONE}`} className="locked-phone">
            📞 {process.env.NEXT_PUBLIC_OWNER_PHONE}
          </a>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
              Logout
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <DashboardClient accountStatus={accountStatus}>{children}</DashboardClient>
}
