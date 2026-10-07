import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please login first' }, { status: 401 })

  const { data } = await supabase
    .from('cart_items')
    .select('id, quantity, products(name, price_cents, image_url)')
    .eq('user_id', user.id)
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please login first' }, { status: 401 })

  const { product_id } = await request.json()

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + 1 })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('cart_items')
      .insert({ user_id: user.id, product_id, quantity: 1 })
  }
  return NextResponse.json({ ok: true })
}