/**
 * Service-role Supabase client for background jobs and internal API routes.
 * Bypasses RLS — use only in server-side code that doesn't have a user session.
 */

import { createClient } from '@supabase/supabase-js'
import { isLocalDev } from '@/lib/local-dev'

let _adminClient: ReturnType<typeof createClient> | null = null

export function getAdminSupabase() {
  if (_adminClient) return _adminClient

  // Local dev (Docker mode):  SUPABASE_LOCAL_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_LOCAL_URL
  // Everything else (prod/cloud dev): SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL
  const prodKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const localKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY

  let url: string
  let key: string

  if (isLocalDev && localKey) {
    // Docker-based local Supabase
    url = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321'
    key = localKey
  } else if (prodKey) {
    // Production or cloud dev (DEV_USER_ID set but not local Docker)
    url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    key = prodKey
  } else if (localKey && process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL) {
    // Fallback: local key WITH local URL explicitly set (don't fall back to 127.0.0.1 in production)
    url = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL
    key = localKey
  } else if (localKey && !process.env.VERCEL) {
    // Only use local key with default URL when NOT on Vercel
    url = 'http://127.0.0.1:54321'
    key = localKey
  } else {
    throw new Error(
      'Missing Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY (production) or SUPABASE_LOCAL_SERVICE_ROLE_KEY (local dev).',
    )
  }

  _adminClient = createClient(url, key)
  return _adminClient
}
