'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { StoryEditor } from '@/tools/story-studio/stories/story-editor'

interface PageData {
  sequence: number
  sceneDescription: string
  narrativeText: string
  dialogue: { speaker: string; line: string }[]
  mood: string
  imagePrompt: string
}

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookId } = use(params)
  const router = useRouter()
  const [bookData, setBookData] = useState<{ title: string; coverImageUrl?: string | null; artStyle?: string; pages: PageData[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/v1/story/books/${bookId}`)
        if (!res.ok) throw new Error('Book not found')
        const { data } = await res.json()
        if (cancelled) return
        const bookJsonb = (data.data as Record<string, unknown>) || {}
        const rawPages = (bookJsonb.pages as Record<string, unknown>[]) ?? []
        const concept = bookJsonb.concept as Record<string, unknown> | undefined
        const tags = concept?.tags as Record<string, unknown> | undefined
        setBookData({
          title: data.title || (bookJsonb.title as string) || 'Untitled',
          coverImageUrl: (bookJsonb.coverImageUrl as string) || null,
          artStyle: (bookJsonb.style as string) || (tags?.style as string) || undefined,
          pages: rawPages.map((p: Record<string, unknown>) => ({
            sequence: p.sequence as number,
            sceneDescription: (p.sceneDescription as string) || '',
            narrativeText: (p.narrativeText as string) || '',
            dialogue: (p.dialogue as { speaker: string; line: string }[]) || [],
            mood: (p.mood as string) || '',
            imagePrompt: (p.imagePrompt as string) || '',
          })),
        })
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load book')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [bookId])

  const handleBack = useCallback(() => {
    router.push('/tools/story-studio')
  }, [router])

  const handleSave = useCallback(async (pages: PageData[]) => {
    await Promise.all(pages.map(page =>
      fetch(`/api/v1/story/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSequence: page.sequence,
          narrativeText: page.narrativeText,
          sceneDescription: page.sceneDescription,
          dialogue: page.dialogue,
          mood: page.mood,
          imagePrompt: page.imagePrompt,
        }),
      })
    ))
  }, [bookId])

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Could not load book</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Back to Stories
        </button>
      </div>
    )
  }

  if (loading || !bookData) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    )
  }

  return (
    <StoryEditor
      bookId={bookId}
      title={bookData.title}
      coverImageUrl={bookData.coverImageUrl}
      artStyle={bookData.artStyle}
      pages={bookData.pages}
      onSave={handleSave}
      onBack={handleBack}
    />
  )
}
