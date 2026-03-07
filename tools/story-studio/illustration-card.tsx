'use client'

import { useState } from 'react'
import type { Page } from './types'

interface IllustrationCardProps {
  page: Page
  onRegenerate: (sequence: number, prompt: string) => void
  disabled: boolean
}

export default function IllustrationCard({ page, onRegenerate, disabled }: IllustrationCardProps) {
  const [promptExpanded, setPromptExpanded] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState(page.imagePrompt)

  const isPending = page.imageStatus === 'pending'
  const isGenerating = page.imageStatus === 'generating'
  const isDone = page.imageStatus === 'done'
  const isError = page.imageStatus === 'error'

  return (
    <div
      className={`
        relative rounded-xl border p-4 space-y-3 transition-all
        ${isError
          ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
        }
        ${isPending ? 'opacity-50' : ''}
      `}
    >
      {/* Sequence badge */}
      <span className="absolute -top-2.5 -left-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#3D6AF2] text-xs font-bold text-white shadow-sm">
        {page.sequence}
      </span>

      {/* Content area based on status */}
      <div className="min-h-[160px] flex flex-col items-center justify-center">
        {isPending && (
          <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-sm font-medium">Waiting...</span>
            <p className="text-xs text-center text-slate-400 dark:text-slate-500 line-clamp-2">
              {page.sceneDescription}
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center gap-3 text-[#3D6AF2]">
            <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium">Generating...</span>
          </div>
        )}

        {isDone && page.imageUrl && (
          <div className="w-full space-y-2">
            <img
              src={page.imageUrl}
              alt={page.sceneDescription}
              className="w-full rounded-lg object-cover aspect-square"
            />
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
              {page.narrativeText}
            </p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-2 text-red-500 dark:text-red-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span className="text-sm font-medium">Generation failed</span>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              {page.sceneDescription}
            </p>
          </div>
        )}
      </div>

      {/* Edit Prompt expandable */}
      <div>
        <button
          type="button"
          onClick={() => setPromptExpanded(!promptExpanded)}
          className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          aria-expanded={promptExpanded}
        >
          <span>Edit Prompt</span>
          <svg
            className={`h-4 w-4 transition-transform ${promptExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {promptExpanded && (
          <textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            rows={3}
            className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs text-slate-900 outline-none transition-colors resize-y focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 dark:border-slate-700 dark:text-white"
            placeholder="Image generation prompt..."
          />
        )}
      </div>

      {/* Regenerate / Retry button */}
      {(isDone || isError) && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRegenerate(page.sequence, editedPrompt)}
          className={`
            w-full min-h-[44px] rounded-xl px-4 py-2 text-sm font-medium transition-colors
            ${isError
              ? 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 dark:disabled:bg-red-800'
              : 'border border-[#3D6AF2] text-[#3D6AF2] hover:bg-[#3D6AF2]/10 disabled:opacity-50 dark:border-[#3D6AF2] dark:text-[#3D6AF2]'
            }
            disabled:cursor-not-allowed
          `}
        >
          {isError ? 'Retry' : 'Regenerate'}
        </button>
      )}
    </div>
  )
}
