/**
 * Service-role Supabase client for background jobs and internal API routes.
 * Bypasses RLS — use only in server-side code that doesn't have a user session.
 */

import { createClient } from '@supabase/supabase-js'

let _adminClient: ReturnType<typeof createClient> | null = null

export function getAdminSupabase() {
  if (_adminClient) return _adminClient

  // Production: SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL
  // Local dev:  SUPABASE_LOCAL_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_LOCAL_URL
  const prodKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const localKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY

  let url: string
  let key: string

  if (prodKey) {
    url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    key = prodKey
  } else if (localKey) {
    // Local dev: always use local Supabase URL with local service role key
    url = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321'
    key = localKey
  } else {
    throw new Error(
      'Missing Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY (production) or SUPABASE_LOCAL_SERVICE_ROLE_KEY (local dev).',
    )
  }

  _adminClient = createClient(url, key)
  return _adminClient
}
