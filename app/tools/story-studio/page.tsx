'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCredits } from '@/lib/hooks/use-credits'
import { useStoryBook } from '@/tools/story-studio/use-story-book'
import { WizardProgress } from '@/tools/story-studio/wizard-progress'
import { StoryInputForm } from '@/tools/story-studio/story-input-form'
import StoryReview from '@/tools/story-studio/story-review'
import IllustrationGrid from '@/tools/story-studio/illustration-grid'
import { BookEditor } from '@/tools/story-studio/book-editor'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import type { StoryInput } from '@/tools/story-studio/types'

export default function StoryStudioPage() {
  const { user, loading: authLoading } = useAuth()
  const { balance } = useCredits()
  const {
    book, step, setStep,
    loading, setLoading,
    error, setError,
    abortRef, createBook, updateBook, updatePage, reset,
  } = useStoryBook()

  const handleGenerateStory = useCallback(async (input: StoryInput) => {
    setLoading(true)
    setError(null)

    const newBook = createBook(input)

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch('/api/v1/story/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || `Failed: ${res.status}`)
      }

      const { data } = await res.json()

      updateBook({
        ...data,
        id: newBook.id,
        audience: input.audience,
        format: input.format,
        style: input.style,
        status: 'draft',
        pages: (data.pages || []).map((p: Record<string, unknown>, i: number) => ({
          ...p,
          sequence: i + 1,
          imageStatus: 'pending' as const,
        })),
      })
      setStep('story')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Story generation failed')
    } finally {
      setLoading(false)
    }
  }, [createBook, updateBook, setStep, setLoading, setError, abortRef])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in Required</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center">
          Sign in to create AI-illustrated story books.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <ToolBreadcrumb toolName="Story Studio" toolSlug="story-studio" />

        <div className="mt-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Story Studio
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Turn your story idea into a fully illustrated picture book
          </p>
        </div>

        <WizardProgress currentStep={step} onStepClick={setStep} bookStatus={book?.status} />

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline cursor-pointer">Dismiss</button>
          </div>
        )}

        <div className="mt-6">
          {step === 'input' && (
            <StoryInputForm
              onSubmit={handleGenerateStory}
              loading={loading}
              creditBalance={balance?.total ?? null}
            />
          )}

          {step === 'story' && book && (
            <StoryReview
              book={book}
              onUpdateBook={updateBook}
              onApprove={() => {
                updateBook({ status: 'story-approved' })
                setStep('illustrations')
              }}
              onRegenerate={() => { /* call regenerate-story endpoint */ }}
              onBack={() => setStep('input')}
              loading={loading}
            />
          )}

          {step === 'illustrations' && book && (
            <IllustrationGrid
              book={book}
              onUpdatePage={updatePage}
              onComplete={() => {
                updateBook({ status: 'complete' })
                setStep('editor')
              }}
              onBack={() => setStep('story')}
            />
          )}

          {step === 'editor' && book && (
            <BookEditor
              book={book}
              onUpdateBook={updateBook}
              onUpdatePage={updatePage}
              onReset={reset}
            />
          )}
        </div>
      </div>
    </div>
  )
}
