'use client'

import { useState } from 'react'
import type { Editor } from '@tiptap/core'
import type { AIAction } from '../resume-types'
import { useResume } from '../resume-provider'
import { ActionGate } from '@/components/auth/action-gate'

interface AIActionBarProps {
  editor: Editor | null
  module: string
}

export function AIActionBar({ editor, module }: AIActionBarProps) {
  const { state, t } = useResume()
  const [loading, setLoading] = useState<AIAction | null>(null)

  const handleAI = async (action: AIAction) => {
    if (!editor || loading) return

    const content = editor.getText()
    if (!content.trim() && action === 'polish') return

    setLoading(action)
    try {
      const res = await fetch('/api/v1/resume/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          content,
          context: {
            module,
            locale: state.resume.locale,
            jobTitle: state.resume.jobIntention.position || undefined,
          },
        }),
      })

      if (!res.ok) throw new Error('AI request failed')
      const json = await res.json()
      const result = json.data?.result || json.result

      if (action === 'polish') {
        // Replace content
        editor.commands.setContent(result)
      } else {
        // Append content (continue / expand)
        editor.commands.focus('end')
        editor.commands.insertContent(result)
      }
    } catch {
      // AI error — silently fail for now, will add toast in Phase 9
    } finally {
      setLoading(null)
    }
  }

  const buttons: { action: AIAction; label: string; loadingLabel: string; icon: string }[] = [
    { action: 'polish', label: t.ai.polish, loadingLabel: t.ai.polishing, icon: '✨' },
    { action: 'continue', label: t.ai.continue, loadingLabel: t.ai.generating, icon: '➡️' },
    { action: 'expand', label: t.ai.expand, loadingLabel: t.ai.generating, icon: '📝' },
  ]

  return (
    <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
      <ActionGate cost={1}>{() => (
        <div className="flex items-center gap-2">
          {buttons.map(({ action, label, loadingLabel, icon }) => (
            <button
              key={action}
              type="button"
              onClick={() => handleAI(action)}
              disabled={loading !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={label}
            >
              <span aria-hidden="true">{icon}</span>
              {loading === action ? loadingLabel : label}
            </button>
          ))}
        </div>
      )}</ActionGate>
    </div>
  )
}
