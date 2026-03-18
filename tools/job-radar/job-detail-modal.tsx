'use client'

import { useEffect, useRef } from 'react'
import type { Job } from './types'
import { SOURCE_LABELS, EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS } from './types'

interface JobDetailModalProps {
  job: Job | null
  onClose: () => void
}

const COUNTRY_FLAG: Record<string, string> = { AU: '\u{1F1E6}\u{1F1FA}', NZ: '\u{1F1F3}\u{1F1FF}' }

function formatSalaryFull(job: Job): string {
  if (job.salary_min || job.salary_max) {
    const currency = job.salary_currency ?? 'AUD'
    const min = job.salary_min ? `$${job.salary_min.toLocaleString()}` : ''
    const max = job.salary_max ? `$${job.salary_max.toLocaleString()}` : ''
    if (min && max) return `${min} – ${max} ${currency} per year`
    return `${min || max} ${currency} per year`
  }
  if (job.hourly_rate_min || job.hourly_rate_max) {
    const currency = job.salary_currency ?? 'AUD'
    const min = job.hourly_rate_min ? `$${job.hourly_rate_min}` : ''
    const max = job.hourly_rate_max ? `$${job.hourly_rate_max}` : ''
    if (min && max) return `${min} – ${max} ${currency} per hour`
    return `${min || max} ${currency} per hour`
  }
  return 'Not disclosed'
}

export function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (job) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialog.close()
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [job])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
      className={`fixed inset-0 z-50 m-0 p-0 w-full h-full max-w-none max-h-none bg-transparent backdrop:bg-black/50 lg:flex lg:items-center lg:justify-center ${!job ? 'pointer-events-none hidden' : ''}`}
    >
      {job && (
      <div className="absolute bottom-0 left-0 right-0 lg:static lg:w-full lg:max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-2xl lg:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between gap-4 p-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {job.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {job.company} · {COUNTRY_FLAG[job.country]} {job.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {job.employment_type && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
              </span>
            )}
            {job.work_mode && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                {WORK_MODE_LABELS[job.work_mode]}
              </span>
            )}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {SOURCE_LABELS[job.source]}
            </span>
          </div>

          {/* Salary */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Compensation
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatSalaryFull(job)}
            </p>
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {job.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Skills & Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--tk-color-primary-500)]/10 text-[var(--tk-color-primary-500)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Posted date */}
          <p className="text-xs text-slate-400">
            Posted {new Date(job.posted_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <a
            href={job.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)] text-white font-medium text-sm transition-colors cursor-pointer"
          >
            Apply on {SOURCE_LABELS[job.source]}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(job.source_url)
            }}
            className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Copy job link"
          >
            Share
          </button>
        </div>
      </div>
      )}
    </dialog>
  )
}
