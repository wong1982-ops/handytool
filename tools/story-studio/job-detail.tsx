'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getStepLabel } from '@/lib/story/queue'

/** Full job record returned by GET /api/v1/story/jobs/[id] */
interface JobDetail {
  id: string
  status: 'scheduled' | 'running' | 'failed' | 'completed'
  current_step: string
  total_pages: number
  error_message: string | null
  retry_count: number
  created_at: string
  updated_at: string
  input: {
    concept?: { title?: string; summary?: string }
    plot?: string
  }
  state: Record<string, unknown>
}

/** Visual step for the timeline */
interface TimelineStep {
  key: string
  label: string
  status: 'completed' | 'active' | 'pending' | 'failed'
  thumbnailUrl?: string
}

const STEP_ORDER = ['story_bible', 'story_draft', 'validate', 'character_ref', 'cover', 'illustrate_page', 'tts_page', 'save'] as const

function getStepIndex(step: string): number {
  return STEP_ORDER.indexOf(step as typeof STEP_ORDER[number])
}

function buildTimeline(job: JobDetail): TimelineStep[] {
  const currentIdx = getStepIndex(job.current_step)
  const isCompleted = job.status === 'completed'
  const isFailed = job.status === 'failed'
  const pages = (job.state?.pages as { imageUrl?: string }[]) || []
  const audio = (job.state?.audio as unknown[]) || []
  const totalPages = job.total_pages || 0

  const steps: TimelineStep[] = []

  for (let i = 0; i < STEP_ORDER.length; i++) {
    const step = STEP_ORDER[i]
    let status: TimelineStep['status'] = 'pending'

    if (isCompleted) {
      status = 'completed'
    } else if (i < currentIdx) {
      status = 'completed'
    } else if (i === currentIdx) {
      status = isFailed ? 'failed' : 'active'
    }

    if (step === 'illustrate_page' && totalPages > 0) {
      // Expand illustration pages
      for (let p = 1; p <= totalPages; p++) {
        const pageData = pages[p - 1]
        let pageStatus: TimelineStep['status'] = 'pending'

        if (isCompleted) {
          pageStatus = 'completed'
        } else if (step === job.current_step) {
          // Currently on illustrate_page
          if (p <= pages.length) {
            pageStatus = 'completed'
          } else if (p === pages.length + 1) {
            pageStatus = isFailed ? 'failed' : 'active'
          }
        } else if (i < currentIdx) {
          pageStatus = 'completed'
        }

        steps.push({
          key: `illustrate_page_${p}`,
          label: `Illustrate page ${p}`,
          status: pageStatus,
          thumbnailUrl: pageData?.imageUrl,
        })
      }
    } else if (step === 'tts_page' && totalPages > 0) {
      // Expand TTS pages
      for (let p = 1; p <= totalPages; p++) {
        let ttsStatus: TimelineStep['status'] = 'pending'

        if (isCompleted) {
          ttsStatus = 'completed'
        } else if (step === job.current_step) {
          if (p <= audio.length) {
            ttsStatus = 'completed'
          } else if (p === audio.length + 1) {
            ttsStatus = isFailed ? 'failed' : 'active'
          }
        } else if (i < currentIdx) {
          ttsStatus = 'completed'
        }

        steps.push({
          key: `tts_page_${p}`,
          label: `Narration page ${p}`,
          status: ttsStatus,
        })
      }
    } else {
      let label = getStepLabel(step, undefined, totalPages)
      // Remove trailing "..."
      label = label.replace(/\.{3}$/, '')

      if (step === 'cover') {
        steps.push({
          key: step,
          label,
          status,
          thumbnailUrl: job.state?.coverUrl as string | undefined,
        })
      } else {
        steps.push({ key: step, label, status })
      }
    }
  }

  return steps
}

function formatDuration(start: string, end?: string): string {
  const s = new Date(start).getTime()
  const e = end ? new Date(end).getTime() : Date.now()
  const diff = Math.max(0, e - s)
  const mins = Math.floor(diff / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

interface JobDetailViewProps {
  jobId: string
}

export function JobDetailView({ jobId }: JobDetailViewProps) {
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/story/jobs/${jobId}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Job not found')
          return
        }
        throw new Error(`Failed to load job: ${res.status}`)
      }
      const { job: data } = await res.json()
      setJob(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }, [jobId])

  // Initial fetch
  useEffect(() => {
    fetchJob()
  }, [fetchJob])

  // Realtime subscription for live updates
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`job-detail-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'book_jobs',
          filter: `id=eq.${jobId}`,
        },
        () => {
          // Re-fetch the full job on any update
          fetchJob()
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [jobId, fetchJob])

  const handleRetry = async () => {
    if (retrying) return
    setRetrying(true)
    try {
      const res = await fetch(`/api/v1/story/jobs/${jobId}/retry`, { method: 'POST' })
      if (res.ok) {
        // Will update via realtime subscription
        setJob(prev => prev ? { ...prev, status: 'running', error_message: null } : null)
      }
    } catch {
      // ignore
    } finally {
      setRetrying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-8 h-8 text-[#3D6AF2] animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-4">{error || 'Job not found'}</p>
        <Link
          href="/tools/story-studio/bookshelf"
          className="text-sm text-[#3D6AF2] hover:underline"
        >
          Back to Bookshelf
        </Link>
      </div>
    )
  }

  const timeline = buildTimeline(job)
  const title = job.input?.concept?.title || 'Untitled Book'
  const isCompleted = job.status === 'completed'
  const isFailed = job.status === 'failed'
  const completedCount = timeline.filter(s => s.status === 'completed').length
  const totalCount = timeline.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/tools/story-studio/bookshelf"
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Bookshelf
        </Link>

        <h1
          className="text-xl font-bold text-slate-900 dark:text-white mb-1"
          style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}
        >
          {title}
        </h1>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            isCompleted
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : isFailed
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
          }`}>
            {isCompleted ? 'Completed' : isFailed ? 'Failed' : 'Running'}
          </span>
          <span>Started {formatDuration(job.created_at)} ago</span>
        </div>
      </div>

      {/* Overall progress bar */}
      {!isCompleted ? (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>{completedCount} of {totalCount} steps</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isFailed ? 'bg-red-500' : 'bg-gradient-to-r from-[#3D6AF2] to-purple-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}

      {/* Error + retry */}
      {isFailed && job.error_message && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-400">{job.error_message}</p>
              <p className="text-xs text-red-500/70 mt-1">Retry count: {job.retry_count}/3</p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg
                       bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50
                       text-red-700 dark:text-red-400 text-sm font-medium transition-colors cursor-pointer
                       disabled:opacity-50"
            style={{ minHeight: '40px' }}
          >
            <svg className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            {retrying ? 'Retrying...' : 'Retry Failed Step'}
          </button>
        </div>
      )}

      {/* Completed — link to book */}
      {isCompleted && typeof job.state?.slug === 'string' && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Book Complete!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Your story has been published to your bookshelf.</p>
            </div>
            <Link
              href={`/tools/story-studio/book/${job.state.slug}`}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
              style={{ minHeight: '36px' }}
            >
              Read
            </Link>
          </div>
        </div>
      )}

      {/* Step timeline */}
      <div className="space-y-0">
        {timeline.map((step, i) => {
          const isLast = i === timeline.length - 1

          return (
            <div key={step.key} className="flex gap-3">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.status === 'completed'
                    ? 'bg-emerald-500'
                    : step.status === 'active'
                      ? 'bg-[#3D6AF2] animate-pulse'
                      : step.status === 'failed'
                        ? 'bg-red-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {step.status === 'completed' ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : step.status === 'active' ? (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  ) : step.status === 'failed' ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                  )}
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[20px] ${
                    step.status === 'completed' ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>

              {/* Step content */}
              <div className={`pb-4 flex-1 min-w-0 ${isLast ? '' : ''}`}>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${
                    step.status === 'completed'
                      ? 'text-slate-700 dark:text-slate-300'
                      : step.status === 'active'
                        ? 'text-[#3D6AF2] dark:text-[#93aaff]'
                        : step.status === 'failed'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {step.label}
                  </p>
                </div>

                {/* Thumbnail for illustrations/cover */}
                {step.thumbnailUrl && step.status === 'completed' && (
                  <div className="mt-1.5 w-20 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={step.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
