import { createClient } from '@supabase/supabase-js'

export function getToken(request: Request) {
  return request.headers.get('Authorization')?.replace('Bearer ', '') ?? null
}

export function createApiClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}