'use client'

import { useState } from 'react'

interface BulkGenerateActionsProps {
  bookId: string
  pageCount: number
  hasIllustrations: boolean
  hasNarration: boolean
}

type ActionStatus = 'idle' | 'loading' | 'success' | 'error'

export function BulkGenerateActions({
  bookId,
  pageCount,
  hasIllustrations,
  hasNarration,
}: BulkGenerateActionsProps) {
  const [illustrateStatus, setIllustrateStatus] = useState<ActionStatus>('idle')
  const [narrateStatus, setNarrateStatus] = useState<ActionStatus>('idle')
  const [illustrateMessage, setIllustrateMessage] = useState('')
  const [narrateMessage, setNarrateMessage] = useState('')

  async function handleBulkIllustrate() {
    setIllustrateStatus('loading')
    setIllustrateMessage('')
    try {
      const res = await fetch(`/api/v1/story/books/${bookId}/bulk-illustrate`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) {
        setIllustrateStatus('error')
        setIllustrateMessage(json.error || 'Failed to queue illustrations')
        return
      }
      setIllustrateStatus('success')
      setIllustrateMessage(json.data?.message || `Queued ${pageCount} pages for illustration`)
    } catch {
      setIllustrateStatus('error')
      setIllustrateMessage('Network error. Please try again.')
    }
  }

  async function handleBulkNarrate() {
    setNarrateStatus('loading')
    setNarrateMessage('')
    try {
      const res = await fetch(`/api/v1/story/books/${bookId}/bulk-narrate`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) {
        setNarrateStatus('error')
        setNarrateMessage(json.error || 'Failed to queue narration')
        return
      }
      setNarrateStatus('success')
      setNarrateMessage(json.data?.message || `Queued ${pageCount} pages for narration`)
    } catch {
      setNarrateStatus('error')
      setNarrateMessage('Network error. Please try again.')
    }
  }

  const illustrateDisabled = hasIllustrations || illustrateStatus === 'loading' || illustrateStatus === 'success'
  const narrateDisabled = hasNarration || narrateStatus === 'loading' || narrateStatus === 'success'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4 sm:p-5 mb-6">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
        Bulk Generate
      </h3>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Illustrate button */}
        <button
          onClick={handleBulkIllustrate}
          disabled={illustrateDisabled}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-[#3D6AF2] hover:bg-[#3560d8] text-white disabled:hover:bg-[#3D6AF2]"
          style={{ minHeight: '44px' }}
        >
          {illustrateStatus === 'loading' ? (
            <LoadingSpinner />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          )}
          {hasIllustrations ? 'Illustrations Added' : illustrateStatus === 'loading' ? 'Generating...' : 'Generate All Illustrations'}
        </button>

        {/* Narrate button */}
        <button
          onClick={handleBulkNarrate}
          disabled={narrateDisabled}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700 text-white disabled:hover:bg-purple-600"
          style={{ minHeight: '44px' }}
        >
          {narrateStatus === 'loading' ? (
            <LoadingSpinner />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          )}
          {hasNarration ? 'Narration Added' : narrateStatus === 'loading' ? 'Generating...' : 'Generate All Narration'}
        </button>
      </div>

      {/* Status messages */}
      {illustrateMessage && (
        <p className={`mt-3 text-sm ${illustrateStatus === 'error' ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {illustrateMessage}
        </p>
      )}
      {narrateMessage && (
        <p className={`mt-2 text-sm ${narrateStatus === 'error' ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {narrateMessage}
        </p>
      )}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
