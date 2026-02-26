'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'

const MAX_PROMPTS = 3
const COOLDOWN_DAYS = 7
const MIN_UNIQUE_TOOLS = 3
const STORAGE_KEY = 'ht-profile-tools'

/** Track unique tool visits in localStorage (anonymous-safe) */
function getVisitedTools(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function trackToolVisit(toolSlug: string) {
  const tools = getVisitedTools()
  if (!tools.includes(toolSlug)) {
    tools.push(toolSlug)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tools))
  }
}

export function useProfilePrompt() {
  const { user } = useAuth()
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (!user) { setShowPrompt(false); return }

    async function check() {
      // Must have visited enough tools first
      if (getVisitedTools().length < MIN_UNIQUE_TOOLS) return

      const supabase = createClient()
      const { data } = await supabase
        .from('user_profiles')
        .select('profile_completed, prompt_dismiss_count, prompt_last_dismissed')
        .eq('id', user!.id)
        .single()

      if (!data) return

      // Already completed — never show
      if (data.profile_completed) return

      // Exceeded max dismissals — stop prompting permanently
      if (data.prompt_dismiss_count >= MAX_PROMPTS) return

      // Within cooldown period
      if (data.prompt_last_dismissed) {
        const cooldownEnd = new Date(data.prompt_last_dismissed)
        cooldownEnd.setDate(cooldownEnd.getDate() + COOLDOWN_DAYS)
        if (new Date() < cooldownEnd) return
      }

      setShowPrompt(true)
    }

    check()
  }, [user])

  async function dismiss() {
    setShowPrompt(false)
    if (!user) return

    const supabase = createClient()
    // Atomically increment dismiss count and set timestamp in DB
    await supabase.rpc('increment_prompt_dismiss', { user_id: user.id })
  }

  return { showPrompt, dismiss }
}
