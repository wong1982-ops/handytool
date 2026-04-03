'use client'

import { useState, useEffect, useRef } from 'react'

export type AIAction = 'rewrite' | 'expand' | 'shorten' | 'fix_grammar' | 'suggest_dialogue'

export type AIHelpField =
  | 'sceneDescription'
  | 'narrativeText'
  | 'dialogue'
  | 'mood'
  | 'imagePrompt'
  | 'imagePromptAttr'

interface AIHelpMenuProps {
  field?: AIHelpField
  onAction: (action: AIAction) => void
  loading?: boolean
}

const ALL_ACTIONS: { action: AIAction; label: string; icon: string }[] = [
  { action: 'rewrite', label: 'Rewrite', icon: '\u{1F504}' },
  { action: 'expand', label: 'Expand', icon: '\u{1F4DD}' },
  { action: 'shorten', label: 'Shorten', icon: '\u{2702}\u{FE0F}' },
  { action: 'fix_grammar', label: 'Fix grammar', icon: '\u{1F4CB}' },
  { action: 'suggest_dialogue', label: 'Suggest dialogue', icon: '\u{1F4AC}' },
]

/** Actions available per field type */
const FIELD_ACTIONS: Record<AIHelpField, AIAction[]> = {
  sceneDescription: ['rewrite', 'expand', 'shorten', 'fix_grammar'],
  narrativeText: ['rewrite', 'expand', 'shorten', 'fix_grammar', 'suggest_dialogue'],
  dialogue: ['rewrite', 'fix_grammar'],
  mood: ['rewrite'],
  imagePrompt: ['rewrite', 'expand', 'shorten'],
  imagePromptAttr: ['rewrite', 'expand', 'shorten'],
}

export function AIHelpMenu({ field, onAction, loading }: AIHelpMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const allowed = field ? FIELD_ACTIONS[field] : ALL_ACTIONS.map(a => a.action)
  const actions = ALL_ACTIONS.filter(a => allowed.includes(a.action))

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium
          text-[#3D6AF2] dark:text-[#93aaff] bg-[#3D6AF2]/10 dark:bg-[#3D6AF2]/15
          hover:bg-[#3D6AF2]/15 hover:bg-[#3D6AF2]/15 rounded-lg
          transition-colors cursor-pointer disabled:opacity-50"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        {loading ? '...' : 'AI'}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && !loading && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-slate-800
          shadow-xl border border-slate-200 dark:border-slate-700 z-30 py-1">
          {actions.map(({ action, label, icon }) => (
            <button
              key={action}
              onClick={() => { onAction(action); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300
                hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              <span className="mr-2">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
