'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import BookSelector, { type BookOption } from '@/tools/story-video/book-selector'
import SettingsForm from '@/tools/story-video/settings-form'
import JobProgress from '@/tools/story-video/job-progress'
import VideoPlayer from '@/tools/story-video/video-player'
import type {
  ArtStyle,
  DurationPreset,
  PipelineStep,
  StoryVideoJob,
} from '@/tools/story-video/types'

type Tab = 'create' | 'videos'

export default function StoryVideoStudio() {
  const [tab, setTab] = useState<Tab>('create')
  const [books, setBooks] = useState<BookOption[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [jobs, setJobs] = useState<StoryVideoJob[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const selectedBook = books.find((b) => b.id === selectedBookId) ?? null

  // Fetch completed books from story-studio
  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch('/api/v1/story/books')
        if (!res.ok) return
        const json = await res.json()
        // story/books returns { data: [...] }
        const items = json.data ?? json.books ?? []
        const allBooks: BookOption[] = (Array.isArray(items) ? items : [])
          .map((j: Record<string, unknown>) => ({
            id: j.id as string,
            title: (j.title ?? 'Untitled') as string,
            pageCount: (j.pageCount ?? j.page_count ?? 0) as number,
            coverUrl: (j.coverImageUrl ?? j.cover_image_url) as string | undefined,
            status: 'complete' as const,
          }))
        setBooks(allBooks)
      } catch {
        // Silently fail — books list will be empty
      }
    }
    fetchBooks()
  }, [])

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/story-video/jobs')
      if (!res.ok) return
      const json = await res.json()
      const jobList = json.data?.jobs ?? json.jobs ?? json.data ?? []
      setJobs(Array.isArray(jobList) ? jobList : [])
    } catch {
      // Silently fail
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Poll while jobs are active
  useEffect(() => {
    const hasActive = jobs.some(
      (j) => j.status === 'pending' || j.status === 'processing'
    )

    if (hasActive) {
      pollRef.current = setInterval(fetchJobs, 10_000)
    } else if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [jobs, fetchJobs])

  // Generate
  async function handleGenerate(settings: { artStyle: ArtStyle; targetDuration: DurationPreset }) {
    if (!selectedBook) return
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/story-video/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: selectedBook.id,
          artStyle: settings.artStyle,
          targetDuration: settings.targetDuration,
          provider: 'gemini',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Failed to create job' }))
        throw new Error(data.message ?? 'Failed to create job')
      }

      setTab('videos')
      await fetchJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
    } finally {
      setGenerating(false)
    }
  }

  // Retry
  async function handleRetry(jobId: string, step?: PipelineStep, sceneIndex?: number) {
    try {
      await fetch(`/api/v1/story-video/jobs/${jobId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, sceneIndex }),
      })
      await fetchJobs()
    } catch {
      // Silently fail
    }
  }

  // Delete job
  async function handleDelete(jobId: string) {
    try {
      await fetch(`/api/v1/story-video/jobs/${jobId}`, { method: 'DELETE' })
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
    } catch {
      // Silently fail
    }
  }

  const completedJobs = jobs.filter((j) => j.status === 'complete')
  const activeJobs = jobs.filter((j) => j.status !== 'complete')

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Story{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9]">
            Video Generator
          </span>
        </h1>
        <p className="text-sm text-[#a6abb5] mt-2">
          Turn your storybooks into AI-generated cartoon videos with character voices, sound effects, and music.
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        {(['create', 'videos'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer min-h-[44px]
              ${tab === t
                ? 'bg-[#3D6AF2] text-white'
                : 'bg-[#131a23] text-[#a6abb5] border border-[#1e2631] hover:border-[#3D6AF2]/30'}
            `}
          >
            {t === 'create' ? 'Create' : 'My Videos'}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {tab === 'create' && (
        <>
          <BookSelector
            books={books}
            selectedId={selectedBookId}
            onSelect={setSelectedBookId}
          />
          <SettingsForm
            selectedBook={selectedBook ? { id: selectedBook.id, title: selectedBook.title, pageCount: selectedBook.pageCount } : null}
            onGenerate={handleGenerate}
            generating={generating}
          />

          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-[#a6abb5]">In Progress</h2>
              {activeJobs.map((job) => (
                <JobProgress key={job.id} job={job} onRetry={handleRetry} onDelete={handleDelete} />
              ))}
            </section>
          )}
        </>
      )}

      {tab === 'videos' && (
        <>
          {/* All Jobs */}
          {jobs.length === 0 ? (
            <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-8 text-center">
              <p className="text-[#a6abb5] text-sm">No videos yet.</p>
              <p className="text-[#70767f] text-xs mt-1">
                Generate your first story video from the Create tab.
              </p>
            </div>
          ) : (
            <section className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="space-y-3">
                  <JobProgress job={job} onRetry={handleRetry} onDelete={handleDelete} />
                  {job.status === 'complete' && <VideoPlayer job={job} />}
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}
