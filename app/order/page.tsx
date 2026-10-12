'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

type OrderItem = {
  quantity: number
  price_cents: number
  products: { name: string }[]
}

type Order = {
  id: string
  total_cents: number
  created_at: string
  order_items: OrderItem[]
}

export default function Orders() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<boolean>(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user
      if (!u) {
        setLoading(false)
        return
      }
      setUser(true)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, total_cents, created_at, order_items(quantity, price_cents, products(name))')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })
      setOrders((ordersData ?? []) as unknown as Order[])
      setLoading(false)
    })
  }, [])

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <header className="border-b border-[#e8e0d0] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-lux text-2xl tracking-wide">
            LUXE <span className="text-[#b08d57]">&amp;</span> CO
          </Link>
          <span className="text-sm text-[#6b6357]">Order History</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-lux mb-8 text-3xl font-semibold">Your Orders</h1>

        {loading ? (
          <p className="text-[#6b6357]">Loading…</p>
        ) : !user ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-[#6b6357]">Please login to view your orders.</p>
            <Link href="/login" className="mt-4 inline-block underline text-[#b08d57]">Login</Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-4xl">💎</p>
            <p className="mt-3 text-[#6b6357]">No orders yet.</p>
            <Link href="/" className="mt-4 inline-block underline text-[#b08d57]">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-[#6b6357]">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <p className="text-lg font-bold text-[#b08d57]">${(o.total_cents / 100).toFixed(2)}</p>
                </div>
                <div className="mt-4 border-t border-[#e8e0d0] pt-3">
                  {(o.order_items ?? []).map((it, idx) => (
                    <div key={idx} className="flex justify-between py-1 text-sm">
                      <span className="text-[#6b6357]">
                        {it.products?.[0]?.name ?? 'Item'} × {it.quantity}
                      </span>
                      <span>${((it.price_cents * it.quantity) / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}