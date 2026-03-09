import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isLocalDev } from '@/lib/local-dev'

export async function createClient() {
  // Local dev: use local Supabase URL + service role key (bypasses RLS)
  if (isLocalDev) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321'
    const key = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    return createServerClient(url, key, {
      db: { schema: 'public' },
      global: {
        fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(30000) }),
      },
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    })
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: 'public',
      },
      global: {
        fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(30000) }),
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}

