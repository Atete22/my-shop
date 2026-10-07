'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Product = {
  id: string
  name: string
  description: string | null
  price_cents: number
  image_url: string | null
}

export default function Home() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [userName, setUserName] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)

  const loadCartCount = () => {
    fetch('/api/cart')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCartCount(data.length)
      })
  }

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
    loadCartCount()

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserName(data.user.user_metadata?.full_name ?? data.user.email)
      }
    })
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const addToBag = async (product_id: string) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id }),
    })
    if (res.status === 401) {
      window.location.href = '/login'
      return
    }
    alert('Added to your bag 💎')
    loadCartCount()
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#e8e0d0] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="font-lux text-2xl tracking-wide">
            LUXE <span className="text-[#b08d57]">&amp;</span> CO
          </h1>
          {userName ? (
            <div className="flex items-center gap-4">
              <a href="/checkout" className="text-sm text-[#6b6357] hover:text-[#b08d57]">
                Bag ({cartCount})
              </a>
              <span className="text-sm text-[#6b6357]">
                Welcome, <strong className="text-[#1a1a1a]">{userName}</strong> 💎
              </span>
              <button
                onClick={signOut}
                className="rounded-full border border-[#e8e0d0] px-4 py-2 text-sm text-[#6b6357] transition hover:border-[#b08d57] hover:text-[#b08d57]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="rounded-full border border-[#b08d57] px-5 py-2 text-sm font-medium text-[#b08d57] transition hover:bg-[#b08d57] hover:text-white"
            >
              Login
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#faf7f2] to-[#f3ecdf] py-20 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#b08d57]">Fine Jewelry</p>
        <h2 className="font-lux mx-auto max-w-2xl text-5xl font-semibold leading-tight">
          Timeless Elegance,<br />Crafted for You
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[#6b6357]">
          Hand-selected pieces that turn moments into memories.
        </p>
        <a
          href="#collection"
          className="mt-8 inline-block rounded-full bg-[#1a1a1a] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#b08d57]"
        >
          Explore the Collection
        </a>
      </section>

      {/* Products */}
      <section id="collection" className="mx-auto max-w-6xl px-6 py-16">
        <h3 className="font-lux mb-10 text-center text-3xl font-semibold">The Collection</h3>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-64 overflow-hidden bg-[#f3ecdf]">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">💎</div>
                )}
              </div>
              <div className="p-6 text-center">
                <h4 className="font-lux text-lg font-semibold">{p.name}</h4>
                <p className="mt-1 text-sm text-[#6b6357]">{p.description}</p>
                <p className="mt-3 text-lg font-semibold text-[#b08d57]">
                  ${(p.price_cents / 100).toFixed(2)}
                </p>
                <button
                  onClick={() => addToBag(p.id)}
                  className="mt-4 w-full rounded-full bg-[#1a1a1a] py-3 text-sm font-medium text-white transition hover:bg-[#b08d57]"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8e0d0] bg-white py-8 text-center">
        <p className="font-lux text-lg">
          LUXE <span className="text-[#b08d57]">&amp;</span> CO
        </p>
        <p className="mt-1 text-xs text-[#6b6357]">© 2026 · Crafted with care</p>
      </footer>
    </main>
  )
}