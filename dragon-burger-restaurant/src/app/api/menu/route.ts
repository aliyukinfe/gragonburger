import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { DEFAULT_MENU } from '@/lib/menu-data'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('menu').select('*').order('updated_at', { ascending: false }).limit(1).single()
    return NextResponse.json({ data: data?.data || DEFAULT_MENU })
  } catch {
    return NextResponse.json({ data: DEFAULT_MENU })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { data: menuData } = await req.json()

    // Delete all existing menu records and insert fresh
    await supabase.from('menu').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    const { data, error } = await supabase.from('menu').insert({ data: menuData }).select().single()
    if (error) throw error
    return NextResponse.json({ data: data.data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
