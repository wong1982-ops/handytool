'use client'

import { createClient } from '@/lib/supabase/client'

export type OAuthProvider = 'google' | 'facebook'

export async function signInWithOAuth(provider: OAuthProvider) {
  const supabase = createClient()
  const scopes: Record<OAuthProvider, string> = {
    google: 'openid email profile',
    facebook: 'email public_profile',
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: scopes[provider],
    },
  })
  if (error) throw error
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
