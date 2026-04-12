'use client'

import { Suspense, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { useStoriesList } from '@/tools/story-studio/use-stories-list'
import { useJobProgress } from '@/tools/story-studio/use-job-progress'
import { StoryList } from '@/tools/story-studio/stories/story-list'
import { InProgressSection } from '@/tools/story-studio/job-card'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { useMobileShell } from '@/lib/hooks/use-mobile-shell'
import { MobileHome } from '@/tools/story-studio/mobile/mobile-home'

export default function StoriesPage() {
  return (
    <Suspense>
      <StoriesContent />
    </Suspense>
  )
}

function StoriesContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const storiesList = useStoriesList()
  const { jobs: activeJobs, retryJob, deleteJob, completedJobId, clearCompletion } = useJobProgress(user?.id)

  const isMobile = useMobileShell()

  if (isMobile) {
    return <MobileHome />
  }

  // When a job completes, open the result
  useEffect(() => {
    if (!completedJobId) return
    let cancelled = false
    async function openCompletedBook() {
      try {
        const res = await fetch(`/api/v1/story/jobs/${completedJobId}`)
        if (!res.ok) return
        const { job } = await res.json()
        if (cancelled) return
        if (job?.book_id) {
          storiesList.refresh()
          const jobMode = job.input?.mode || 'speed'
          if (jobMode === 'professional') {
            router.push(`/tools/story-studio/edit/${job.book_id}`)
          } else {
            router.push('/tools/story-studio/bookshelf')
          }
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) clearCompletion() }
    }
    openCompletedBook()
    return () => { cancelled = true }
  }, [completedJobId, clearCompletion, storiesList, router])

  const handleEdit = useCallback((id: string) => {
    router.push(`/tools/story-studio/edit/${id}`)
  }, [router])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign in to create stories</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Your magical stories await.</p>
        <button
          onClick={() => signInWithOAuth('google')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* In-progress jobs */}
      {activeJobs.length > 0 && (
        <div className="mb-6">
          <InProgressSection jobs={activeJobs} onRetry={retryJob} onDelete={deleteJob} />
        </div>
      )}

      <StoryList
        stories={storiesList.stories}
        loading={storiesList.loading}
        search={storiesList.search}
        onSearchChange={storiesList.setSearch}
        sortBy={storiesList.sortBy}
        onSortChange={storiesList.setSortBy}
        filterSeries={storiesList.filterSeries}
        onFilterSeriesChange={storiesList.setFilterSeries}
        onCreateNew={() => router.push('/tools/story-studio/new')}
        onEdit={handleEdit}
        onDelete={storiesList.deleteStory}
        onToggleShare={storiesList.toggleShare}
        onMarkComplete={storiesList.markComplete}
      />
    </div>
  )
}
