// tools/story-studio/use-job-progress.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getStepLabel } from '@/lib/story/queue'

/** Shape of an active job from the `get_user_active_jobs` RPC. */
export interface ActiveJob {
  id: string
  status: 'scheduled' | 'running' | 'failed'
  current_step: string
  total_pages: number
  title: string
  cover_url: string | null
  pages_completed: number
  audio_completed: number
  error_message: string | null
  created_at: string
  updated_at: string
  mode: 'speed' | 'professional' | 'bulk-illustrate' | 'bulk-narrate'
}

/** Computed progress info for display. */
export interface JobProgress {
  job: ActiveJob
  /** 0–100 percentage */
  percent: number
  /** Human-readable label, e.g. "Illustrating page 4 of 12..." */
  label: string
}

/**
 * Step weights for progress calculation.
 * story_bible=5%, story_draft=5%, validate=5%, character_ref=5%, cover=5%,
 * illustrations=50%, tts=20%, save=5%
 */
function computeProgress(job: ActiveJob): { percent: number; label: string } {
  const total = job.total_pages || 12
  let percent = 0
  let label = getStepLabel(job.current_step, undefined, total)

  if (job.mode === 'bulk-illustrate') {
    // Bulk illustrate: character_ref(5%) → cover(10%) → illustrate_page(10-90%) → save(95%) → done(100%)
    switch (job.current_step) {
      case 'character_ref':
        percent = 5
        label = 'Preparing characters…'
        break
      case 'cover':
        percent = 10
        label = 'Generating cover…'
        break
      case 'illustrate_page': {
        const pageDone = job.pages_completed
        const pagePercent = total > 0 ? (pageDone / total) * 80 : 0
        percent = 10 + pagePercent
        label = `Illustrating page ${pageDone + 1} of ${total}…`
        break
      }
      case 'save':
        percent = 95
        label = 'Saving…'
        break
      case 'done':
        percent = 100
        label = 'Illustrations complete!'
        break
      default:
        percent = 2
    }
  } else if (job.mode === 'bulk-narrate') {
    // Bulk narrate: tts_page(5-90%) → save(95%) → done(100%)
    switch (job.current_step) {
      case 'tts_page': {
        const audioDone = job.audio_completed
        const audioPercent = total > 0 ? (audioDone / total) * 85 : 0
        percent = 5 + audioPercent
        label = `Narrating page ${audioDone + 1} of ${total}…`
        break
      }
      case 'save':
        percent = 95
        label = 'Saving…'
        break
      case 'done':
        percent = 100
        label = 'Narration complete!'
        break
      default:
        percent = 2
    }
  } else if (job.mode === 'speed') {
    // Speed: story_bible(15%) → story_draft(50%) → save(90%) → done(100%)
    switch (job.current_step) {
      case 'story_bible':
        percent = 15
        break
      case 'story_draft':
        percent = 50
        break
      case 'save':
        percent = 90
        break
      case 'done':
        percent = 100
        label = 'All done!'
        break
      default:
        percent = 5
    }
  } else {
    // Professional mode: keep existing logic exactly as-is
    switch (job.current_step) {
      case 'story_bible':
        percent = 2
        break
      case 'story_draft':
        percent = 7
        break
      case 'validate':
        percent = 12
        break
      case 'character_ref':
        percent = 17
        break
      case 'cover': {
        const preWeight = 20
        percent = preWeight + 2
        break
      }
      case 'illustrate_page': {
        const preWeight = 20
        const coverWeight = 5
        const illustrationWeight = 50
        const pageDone = job.pages_completed
        const pagePercent = total > 0 ? (pageDone / total) * illustrationWeight : 0
        percent = preWeight + coverWeight + pagePercent
        label = getStepLabel('illustrate_page', pageDone + 1, total)
        break
      }
      case 'tts_page': {
        const preWeight = 20
        const coverWeight = 5
        const illustrationWeight = 50
        const ttsWeight = 20
        const audioDone = job.audio_completed
        const audioPercent = total > 0 ? (audioDone / total) * ttsWeight : 0
        percent = preWeight + coverWeight + illustrationWeight + audioPercent
        label = getStepLabel('tts_page', audioDone + 1, total)
        break
      }
      case 'save':
        percent = 95
        break
      case 'done':
        percent = 100
        label = 'Complete!'
        break
      default:
        percent = 0
    }
  }

  return { percent: Math.min(Math.round(percent), 100), label }
}

/**
 * Hook that tracks active job progress via REST + Supabase Realtime.
 *
 * - On mount: fetches active jobs from REST API
 * - Subscribes to `book_jobs` realtime changes for the user
 * - Exposes jobs with computed progress info
 * - Notifies when a job completes (via `onComplete` callback)
 */
export function useJobProgress(userId: string | null | undefined) {
  const [jobs, setJobs] = useState<ActiveJob[]>([])
  const [loading, setLoading] = useState(true)
  const [completedJobId, setCompletedJobId] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  // Fetch active jobs from REST (API authenticates via cookies — no need to wait for client auth)
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/story/jobs', {
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        const { jobs: activeJobs } = await res.json()
        setJobs(activeJobs ?? [])
      }
    } catch (err) {
      console.error('[useJobProgress] Failed to fetch jobs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch + poll every 60s as fallback (Realtime may not work in dev)
  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 60_000)
    return () => clearInterval(interval)
  }, [fetchJobs])

  // Supabase Realtime subscription
  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`job-progress-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'book_jobs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Record<string, unknown>
          const jobId = updated.id as string
          const status = updated.status as string

          if (status === 'completed') {
            // Remove from active jobs, notify completion
            setJobs(prev => prev.filter(j => j.id !== jobId))
            setCompletedJobId(jobId)
            return
          }

          // Update the job in our local state
          setJobs(prev => {
            const idx = prev.findIndex(j => j.id === jobId)
            const updatedJob: ActiveJob = {
              id: jobId,
              status: status as ActiveJob['status'],
              current_step: updated.current_step as string,
              total_pages: updated.total_pages as number,
              // Re-derive these from state JSONB
              title: (prev[idx]?.title) || 'Generating...',
              cover_url: ((updated.state as Record<string, unknown>)?.coverUrl as string) || prev[idx]?.cover_url || null,
              pages_completed: ((updated.state as Record<string, unknown>)?.pages as unknown[])?.length ?? prev[idx]?.pages_completed ?? 0,
              audio_completed: ((updated.state as Record<string, unknown>)?.audio as unknown[])?.length ?? prev[idx]?.audio_completed ?? 0,
              error_message: updated.error_message as string | null,
              created_at: prev[idx]?.created_at || (updated.created_at as string),
              updated_at: updated.updated_at as string,
              mode: (prev[idx]?.mode) || 'speed',
            }

            // Try to extract title from input concept
            if (updatedJob.title === 'Generating...' && updated.input) {
              const input = updated.input as Record<string, unknown>
              const concept = input.concept as Record<string, unknown> | undefined
              if (concept?.title) {
                updatedJob.title = concept.title as string
              }
            }

            if (idx >= 0) {
              const next = [...prev]
              next[idx] = updatedJob
              return next
            }
            // New job appeared (shouldn't normally happen but handle gracefully)
            return [...prev, updatedJob]
          })
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'book_jobs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const inserted = payload.new as Record<string, unknown>
          const input = inserted.input as Record<string, unknown> | undefined
          const concept = input?.concept as Record<string, unknown> | undefined

          const newJob: ActiveJob = {
            id: inserted.id as string,
            status: inserted.status as ActiveJob['status'],
            current_step: inserted.current_step as string,
            total_pages: inserted.total_pages as number,
            title: (concept?.title as string) || 'Untitled',
            cover_url: null,
            pages_completed: 0,
            audio_completed: 0,
            error_message: null,
            created_at: inserted.created_at as string,
            updated_at: inserted.updated_at as string,
            mode: ((inserted.mode as string) || 'speed') as ActiveJob['mode'],
          }

          setJobs(prev => {
            if (prev.find(j => j.id === newJob.id)) return prev
            return [newJob, ...prev]
          })
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [userId])

  // Clear completion notification
  const clearCompletion = useCallback(() => {
    setCompletedJobId(null)
  }, [])

  // Retry a failed job
  const retryJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/v1/story/jobs/${jobId}/retry`, {
        method: 'POST',
      })
      if (res.ok) {
        // Optimistically update status
        setJobs(prev =>
          prev.map(j =>
            j.id === jobId
              ? { ...j, status: 'running' as const, error_message: null }
              : j,
          ),
        )
      }
    } catch (err) {
      console.error('[useJobProgress] Retry failed:', err)
    }
  }, [])

  // Delete a stuck or failed job
  const deleteJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/v1/story/jobs/${jobId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== jobId))
      }
    } catch (err) {
      console.error('[useJobProgress] Delete failed:', err)
    }
  }, [])

  // Compute progress for each job
  const jobsWithProgress: JobProgress[] = jobs.map(job => {
    const { percent, label } = computeProgress(job)
    return { job, percent, label }
  })

  return {
    jobs: jobsWithProgress,
    loading,
    completedJobId,
    clearCompletion,
    retryJob,
    deleteJob,
    refetch: fetchJobs,
  }
}
