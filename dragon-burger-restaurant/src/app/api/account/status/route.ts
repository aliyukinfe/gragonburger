import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('account_status').select('*').order('created_at', { ascending: false }).limit(1).single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ is_active: true, expires_at: null, activated_at: new Date().toISOString() })
  }
}
