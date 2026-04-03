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
      className="job-card w-full text-left p-5 rounded-xl border border-slate-200 dark:border-[#1e2631] bg-slate-50 dark:bg-[#131a23] hover:border-[rgba(61,106,242,0.55)] hover:shadow-[0_4px_20px_rgba(61,106,242,0.08)] hover:bg-slate-200 dark:hover:bg-[#1e2631] transition-all cursor-pointer group"
      aria-label={`View details for ${job.title} at ${job.company}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-white group-hover:text-[#3D6AF2] transition-colors line-clamp-2">
          {job.title}
        </h3>
        <span className="text-xs text-slate-400 dark:text-[#70767f] whitespace-nowrap shrink-0 mt-0.5">
          {formatRelativeDate(job.posted_at)}
        </span>
      </div>

      {/* Company + Location */}
      <p className="text-xs text-slate-500 dark:text-[#a6abb5] mb-3">
        {job.company} · {COUNTRY_FLAG[job.country]} {job.location}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.employment_type && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(61,106,242,0.15)] text-[#3D6AF2]">
            {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
          </span>
        )}
        {job.work_mode && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(16,185,129,0.15)] text-[#10B981]">
            {WORK_MODE_LABELS[job.work_mode]}
          </span>
        )}
      </div>

      {/* Salary + Source */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          {formatSalary(job)}
        </span>
        <span className="text-xs text-slate-400 dark:text-[#70767f]">
          {SOURCE_LABELS[job.source]}
        </span>
      </div>
    </button>
  )
}
