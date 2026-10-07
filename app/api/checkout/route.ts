import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please login first' }, { status: 401 })

  // 1. Get cart
  const { data: cart } = await supabase
    .from('cart_items')
    .select('product_id, quantity, products(name, price_cents)')
    .eq('user_id', user.id)

  if (!cart || cart.length === 0)
    return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })

  // 2. Calculate total
  const total_cents = cart.reduce(
    (sum, item) => sum + item.quantity * item.products.price_cents, 0
  )

  // 3. Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ user_id: user.id, total_cents })
    .select()
    .single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  // 4. Save order items
  await supabase.from('order_items').insert(
    cart.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_cents: item.products.price_cents,
    }))
  )

  // 5. Send confirmation email via Mailgun
  const itemList = cart
    .map((i) => `<li>${i.products.name} × ${i.quantity} — $${((i.products.price_cents * i.quantity) / 100).toFixed(2)}</li>`)
    .join('')

  try {
    const mailgunRes = await fetch(
      `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${process.env.MAILGUN_API_KEY}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          from: `Luxe & Co <postmaster@${process.env.MAILGUN_DOMAIN}>`,
          to: user.email!,
          subject: `💎 Order Confirmed — Thank You!`,
          html: `
            <div style="font-family:Georgia,serif;max-width:500px;margin:auto;padding:20px;border:1px solid #e8e0d0;border-radius:12px;">
              <h2 style="color:#b08d57;">LUXE &amp; CO</h2>
              <p>Thank you for your purchase!</p>
              <p><strong>Order #${order.id.slice(0, 8).toUpperCase()}</strong></p>
              <ul>${itemList}</ul>
              <p style="font-size:18px;"><strong>Total: $${(total_cents / 100).toFixed(2)}</strong></p>
              <p style="color:#6b6357;">Your pieces will be crafted and shipped with care. 💎</p>
            </div>
          `,
        }),
      }
    )

    if (mailgunRes.ok) {
      console.log('✅ EMAIL SENT OK to', user.email)
    } else {
      const errText = await mailgunRes.text()
      console.error('❌ MAILGUN ERROR for', user.email, ':', errText)
    }
  } catch (e) {
    console.error('❌ EMAIL FETCH FAILED:', e)
  }

  // 6. Clear the cart
  await supabase.from('cart_items').delete().eq('user_id', user.id)

  return NextResponse.json({ order_id: order.id, total_cents })
}