'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isLocalDev, LOCAL_DEV_USER_ID, LOCAL_DEV_EMAIL, LOCAL_DEV_NAME } from '@/lib/local-dev'
import type { User } from '@supabase/supabase-js'

const LOCAL_DEV_USER: User = {
  id: LOCAL_DEV_USER_ID,
  email: LOCAL_DEV_EMAIL,
  app_metadata: {},
  user_metadata: { full_name: LOCAL_DEV_NAME, email: LOCAL_DEV_EMAIL },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User

export function useAuth() {
  const [user, setUser] = useState<User | null>(isLocalDev ? LOCAL_DEV_USER : null)
  const [loading, setLoading] = useState(!isLocalDev)

  useEffect(() => {
    if (isLocalDev) return // Already set above

    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (isLocalDev) return // No-op in local dev
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signOut }
}
