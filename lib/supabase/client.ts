import { createBrowserClient } from '@supabase/ssr'
import { isLocalDev } from '@/lib/local-dev'

export function createClient() {
  if (isLocalDev) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321'
    const key = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    return createBrowserClient(url, key)
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
