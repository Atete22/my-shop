'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type CartItem = {
  id: string
  quantity: number
  products: { name: string; price_cents: number; image_url: string | null }
}

export default function Checkout() {
  const supabase = createClient()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState<{ order_id: string; total_cents: number } | null>(null)

  useEffect(() => {
    fetch('/api/cart')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCart(data)
        setLoading(false)
      })
  }, [])

  const placeOrder = async () => {
    setPlacing(true)
    const res = await fetch('/api/checkout', { method: 'POST' })
    const data = await res.json()
    setPlacing(false)
    if (data.order_id) setDone(data)
    else alert(data.error ?? 'Something went wrong')
  }

  const total = cart.reduce(
    (sum, i) => sum + i.quantity * i.products.price_cents, 0
  )

  if (done)
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
        <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
          <div className="mb-4 text-5xl">💎</div>
          <h1 className="font-lux text-3xl font-semibold">Thank You!</h1>
          <p className="mt-2 text-[#6b6357]">
            Order <strong>#{done.order_id.slice(0, 8).toUpperCase()}</strong> confirmed
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#b08d57]">
            ${(done.total_cents / 100).toFixed(2)}
          </p>
          <p className="mt-3 text-sm text-[#6b6357]">📧 A confirmation email is on its way.</p>
          <a
            href="/"
            className="mt-8 inline-block rounded-full bg-[#1a1a1a] px-8 py-3 text-sm text-white hover:bg-[#b08d57]"
          >
            Back to Shop
          </a>
        </div>
      </main>
    )

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <header className="border-b border-[#e8e0d0] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <a href="/" className="font-lux text-2xl tracking-wide">
            LUXE <span className="text-[#b08d57]">&amp;</span> CO
          </a>
          <span className="text-sm text-[#6b6357]">Your Bag</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-lux mb-8 text-3xl font-semibold">Your Bag</h1>

        {loading ? (
          <p className="text-[#6b6357]">Loading…</p>
        ) : cart.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-4xl">🛍️</p>
            <p className="mt-3 text-[#6b6357]">Your bag is empty.</p>
            <a href="/" className="mt-4 inline-block underline text-[#b08d57]">
              Discover the collection
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((i) => (
                <div key={i.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  {i.products.image_url && (
                    <img src={i.products.image_url} alt={i.products.name} className="h-20 w-20 rounded-xl object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{i.products.name}</p>
                    <p className="text-sm text-[#6b6357]">Qty: {i.quantity}</p>
                  </div>
                  <p className="font-semibold text-[#b08d57]">
                    ${((i.quantity * i.products.price_cents) / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex justify-between text-lg">
                <span>Total</span>
                <strong className="text-[#b08d57]">${(total / 100).toFixed(2)}</strong>
              </div>
              <button
                onClick={placeOrder}
                disabled={placing}
                className="mt-6 w-full rounded-full bg-[#1a1a1a] py-4 font-medium text-white transition hover:bg-[#b08d57] disabled:opacity-50"
              >
                {placing ? 'Placing order…' : 'Place Order 💎'}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}