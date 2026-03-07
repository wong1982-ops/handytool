'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { StoryBook, Page } from './types'
import IllustrationCard from './illustration-card'

interface IllustrationGridProps {
  book: StoryBook
  onUpdatePage: (sequence: number, updates: Partial<Page>) => void
  onComplete: () => void
  onBack: () => void
}

export default function IllustrationGrid({ book, onUpdatePage, onComplete, onBack }: IllustrationGridProps) {
  const [regenerating, setRegenerating] = useState<number | null>(null)
  const generationStarted = useRef(false)
  const abortRef = useRef(false)

  const doneCount = book.pages.filter(p => p.imageStatus === 'done').length
  const totalCount = book.pages.length
  const allDone = totalCount > 0 && doneCount === totalCount
  const isGenerating = book.pages.some(p => p.imageStatus === 'generating')

  const generateIllustration = useCallback(async (page: Page) => {
    try {
      const res = await fetch('/api/v1/story/illustrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePrompt: page.imagePrompt,
          style: book.style.preset,
          characters: book.characters,
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      return json.data?.imageUrl as string
    } catch {
      return null
    }
  }, [book.style.preset, book.characters])

  // Sequential generation on mount
  useEffect(() => {
    if (generationStarted.current) return
    generationStarted.current = true
    abortRef.current = false

    const pendingPages = book.pages.filter(p => p.imageStatus === 'pending')
    if (pendingPages.length === 0) return

    let cancelled = false

    async function runSequential() {
      for (const page of pendingPages) {
        if (cancelled || abortRef.current) break

        onUpdatePage(page.sequence, { imageStatus: 'generating' })

        const imageUrl = await generateIllustration(page)

        if (cancelled || abortRef.current) break

        if (imageUrl) {
          onUpdatePage(page.sequence, { imageUrl, imageStatus: 'done' })
        } else {
          onUpdatePage(page.sequence, { imageStatus: 'error' })
        }
      }
    }

    runSequential()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRegenerate = useCallback(async (sequence: number, prompt: string) => {
    setRegenerating(sequence)
    onUpdatePage(sequence, { imagePrompt: prompt, imageStatus: 'generating' })

    try {
      const res = await fetch('/api/v1/story/regenerate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePrompt: prompt,
          style: book.style.preset,
          characters: book.characters,
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      const imageUrl = json.data?.imageUrl as string

      if (imageUrl) {
        onUpdatePage(sequence, { imageUrl, imageStatus: 'done' })
      } else {
        onUpdatePage(sequence, { imageStatus: 'error' })
      }
    } catch {
      onUpdatePage(sequence, { imageStatus: 'error' })
    } finally {
      setRegenerating(null)
    }
  }, [book.style.preset, book.characters, onUpdatePage])

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Illustrations
          </h2>
          {!allDone && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Generating illustrations... {doneCount} of {totalCount} pages
            </p>
          )}
          {allDone && (
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              All illustrations complete!
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-48">
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-2 rounded-full bg-[#3D6AF2] transition-all duration-500"
              style={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-slate-400 dark:text-slate-500">
            {doneCount}/{totalCount}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {book.pages.map(page => (
          <IllustrationCard
            key={page.sequence}
            page={page}
            onRegenerate={handleRegenerate}
            disabled={isGenerating || regenerating !== null}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Back to Story
        </button>

        <button
          type="button"
          disabled={!allDone}
          onClick={onComplete}
          className="min-h-[44px] rounded-xl bg-[#3D6AF2] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3D6AF2]/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Approve &amp; Build Book
        </button>
      </div>
    </div>
  )
}
