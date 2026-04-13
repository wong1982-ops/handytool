import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isLocalDev } from '@/lib/local-dev'

/**
 * Cached dev client — avoids creating a new cookie-based client per request.
 * In dev mode with DEV_USER_ID, all RPCs are SECURITY DEFINER so we don't
 * need user-session auth. Using a cached client eliminates the slow
 * auth.getUser() round-trip that was causing 30s timeouts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _devClient: any = null

function getDevClient() {
  if (_devClient) return _devClient
  // Use service role key to bypass RLS (dev mode only — RPCs and direct queries both work)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  _devClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
  )
  return _devClient
}

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

  // Dev mode with DEV_USER_ID: use cached client (no cookie auth overhead).
  // All RPCs are SECURITY DEFINER — they don't need a user session.
  if (process.env.NODE_ENV === 'development' && process.env.DEV_USER_ID) {
    return getDevClient()
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

