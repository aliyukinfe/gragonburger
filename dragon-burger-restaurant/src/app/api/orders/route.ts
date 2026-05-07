import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const delivery = searchParams.get('delivery')
    const payment = searchParams.get('payment')
    const search = searchParams.get('search')

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })

    if (date) {
      query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`)
    } else if (from && to) {
      query = query.gte('created_at', `${from}T00:00:00`).lte('created_at', `${to}T23:59:59`)
    }

    if (delivery) query = query.eq('delivery_status', delivery)
    if (payment) query = query.eq('payment_status', payment)
    if (search) query = query.ilike('customer_name', `%${search}%`)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await req.json()

    // Get next order number
    const { data: seqData } = await supabase.rpc('next_order_num')
    const order_num = seqData || 1

    const id = `ORD${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`

    const order = {
      id,
      order_num,
      customer_name: body.customer_name,
      order_type: body.order_type || 'dine-in',
      order_ref: body.order_ref || null,
      items: body.items || [],
      total: body.total || 0,
      delivery_status: body.delivery_status || 'pending',
      payment_status: body.payment_status || 'unpaid',
      notes: body.notes || null,
      delivery_info: body.delivery_info || null,
    }

    const { data, error } = await supabase.from('orders').insert(order).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
