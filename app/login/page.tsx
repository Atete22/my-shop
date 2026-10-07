'use client'

import { createClient } from '@/lib/supabase-browser'

export default function Login() {
  const supabase = createClient()

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
      <div className="w-full max-w-sm rounded-3xl bg-white p-10 text-center shadow-xl">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#b08d57]">Welcome</p>
        <h1 className="font-lux mb-8 text-3xl font-semibold">
          LUXE <span className="text-[#b08d57]">&amp;</span> CO
        </h1>
        <button
          onClick={signInWithGoogle}
          className="w-full rounded-full bg-[#1a1a1a] py-3 text-sm font-medium text-white transition hover:bg-[#b08d57]"
        >
          Continue with Google
        </button>
        <p className="mt-6 text-xs text-[#6b6357]">
          Members receive first access to new collections.
        </p>
        <a href="/" className="mt-4 inline-block text-xs text-[#6b6357] underline">← Back to shop</a>
      </div>
    </main>
  )
}