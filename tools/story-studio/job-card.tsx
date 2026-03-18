// tools/story-studio/job-card.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { JobProgress } from './use-job-progress'

interface JobCardProps {
  jobProgress: JobProgress
  onRetry?: (jobId: string) => void
  onRequestDelete?: (jobId: string) => void
}

export function JobCard({ jobProgress, onRetry, onRequestDelete }: JobCardProps) {
  const { job, percent, label } = jobProgress
  const isFailed = job.status === 'failed'

  return (
    <Link
      href={`/tools/story-studio/jobs/${job.id}`}
      className="block relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
      {/* Delete button — top-right corner */}
      {onRequestDelete && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRequestDelete(job.id) }}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full
                     bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30
                     text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
          aria-label="Delete job"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex items-start gap-3">
        {/* Cover thumbnail or spinner placeholder */}
        <div className="w-14 h-[72px] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
          {job.cover_url ? (
            <img src={job.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0 pr-5">
          <h4 className="font-medium text-sm text-slate-900 dark:text-white truncate">{job.title}</h4>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isFailed
                  ? 'bg-red-500'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Status label */}
          <div className="mt-1.5 flex items-center gap-1.5">
            {isFailed ? (
              <>
                <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span className="text-xs text-red-500 truncate">
                  {job.error_message || 'Generation paused'}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {label}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto flex-shrink-0">
                  {percent}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Retry button for failed jobs */}
      {isFailed && onRetry && (
        <button
          onClick={(e) => { e.preventDefault(); onRetry(job.id) }}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                     bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30
                     text-red-600 dark:text-red-400 text-xs font-medium transition-colors cursor-pointer"
          style={{ minHeight: '36px' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Tap to retry
        </button>
      )}
    </Link>
  )
}

interface InProgressSectionProps {
  jobs: JobProgress[]
  onRetry?: (jobId: string) => void
  onDelete?: (jobId: string) => void
}

/**
 * "In Progress" section shown above the bookshelf grid.
 */
export function InProgressSection({ jobs, onRetry, onDelete }: InProgressSectionProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const jobToDelete = deleteConfirm ? jobs.find(jp => jp.job.id === deleteConfirm) : null

  if (jobs.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        In Progress ({jobs.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {jobs.map((jp) => (
          <JobCard
            key={jp.job.id}
            jobProgress={jp}
            onRetry={onRetry}
            onRequestDelete={onDelete ? (id) => setDeleteConfirm(id) : undefined}
          />
        ))}
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Job</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {jobToDelete?.job.title || 'this job'}
              </span>?
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 mb-5">
              This action is permanent and cannot be undone. Any progress will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete?.(deleteConfirm)
                  setDeleteConfirm(null)
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
