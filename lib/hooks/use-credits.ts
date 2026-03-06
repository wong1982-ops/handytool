'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CreditBalance {
  subscription_balance: number
  purchased_balance: number
  total: number
  current_period_end: string | null
}

export function useCredits() {
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/credits/balance')
      if (!res.ok) {
        setBalance(null)
        return
      }
      const json = await res.json()
      setBalance(json.data)
    } catch {
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) fetchBalance()
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) fetchBalance()
        else { setBalance(null); setLoading(false) }
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchBalance])

  return { balance, loading, refetch: fetchBalance }
}
