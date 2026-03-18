'use client'

import type { Job } from './types'
import { SOURCE_LABELS, EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS } from './types'

interface JobCardProps {
  job: Job
  onClick: (job: Job) => void
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

function formatSalary(job: Job): string {
  if (job.salary_min || job.salary_max) {
    const currency = job.salary_currency ?? 'AUD'
    const min = job.salary_min ? `$${(job.salary_min / 1000).toFixed(0)}k` : ''
    const max = job.salary_max ? `$${(job.salary_max / 1000).toFixed(0)}k` : ''
    if (min && max) return `${min}–${max} ${currency}`
    return `${min || max} ${currency}`
  }
  if (job.hourly_rate_min || job.hourly_rate_max) {
    const currency = job.salary_currency ?? 'AUD'
    const min = job.hourly_rate_min ? `$${job.hourly_rate_min}` : ''
    const max = job.hourly_rate_max ? `$${job.hourly_rate_max}` : ''
    if (min && max) return `${min}–${max}/hr ${currency}`
    return `${min || max}/hr ${currency}`
  }
  return 'Not disclosed'
}

const COUNTRY_FLAG: Record<string, string> = { AU: '\u{1F1E6}\u{1F1FA}', NZ: '\u{1F1F3}\u{1F1FF}' }

export function JobCard({ job, onClick }: JobCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(job)}
      className="w-full text-left p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[var(--tk-color-primary-500)]/50 hover:shadow-md transition-all cursor-pointer group"
      aria-label={`View details for ${job.title} at ${job.company}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-[var(--tk-color-primary-500)] transition-colors line-clamp-2">
          {job.title}
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
          {formatRelativeDate(job.posted_at)}
        </span>
      </div>

      {/* Company + Location */}
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        {job.company} · {COUNTRY_FLAG[job.country]} {job.location}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.employment_type && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
          </span>
        )}
        {job.work_mode && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            {WORK_MODE_LABELS[job.work_mode]}
          </span>
        )}
      </div>

      {/* Salary + Source */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {formatSalary(job)}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {SOURCE_LABELS[job.source]}
        </span>
      </div>
    </button>
  )
}
