'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'

const STORAGE_KEY = 'ht-profile-prompt'
const MAX_PROMPTS = 3
const COOLDOWN_DAYS = 7
const MIN_UNIQUE_TOOLS = 3

interface PromptState {
  promptCount: number
  lastDismissed: string | null
  uniqueTools: string[]
}

function getState(): PromptState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { promptCount: 0, lastDismissed: null, uniqueTools: [] }
  } catch {
    return { promptCount: 0, lastDismissed: null, uniqueTools: [] }
  }
}

function setState(state: PromptState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function trackToolVisit(toolSlug: string) {
  const state = getState()
  if (!state.uniqueTools.includes(toolSlug)) {
    state.uniqueTools.push(toolSlug)
    setState(state)
  }
}

export function useProfilePrompt() {
  const { user } = useAuth()
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (!user) { setShowPrompt(false); return }

    async function check() {
      const state = getState()
      if (state.promptCount >= MAX_PROMPTS) return
      if (state.lastDismissed) {
        const cooldownEnd = new Date(state.lastDismissed)
        cooldownEnd.setDate(cooldownEnd.getDate() + COOLDOWN_DAYS)
        if (new Date() < cooldownEnd) return
      }
      if (state.uniqueTools.length < MIN_UNIQUE_TOOLS) return

      const supabase = createClient()
      const { data } = await supabase
        .from('user_profiles')
        .select('profile_completed')
        .eq('id', user!.id)
        .single()

      if (data?.profile_completed) return
      setShowPrompt(true)
    }

    check()
  }, [user])

  function dismiss() {
    const state = getState()
    state.promptCount++
    state.lastDismissed = new Date().toISOString()
    setState(state)
    setShowPrompt(false)
  }

  return { showPrompt, dismiss }
}
