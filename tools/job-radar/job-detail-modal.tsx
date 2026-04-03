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
      className={`fixed inset-0 z-50 m-0 p-0 w-full h-full max-w-none max-h-none bg-transparent backdrop:bg-black/65 lg:flex lg:items-center lg:justify-center lg:p-6 ${!job ? 'pointer-events-none hidden' : ''}`}
    >
      {job && (
      <div className="absolute bottom-0 left-0 right-0 lg:static lg:w-full lg:max-w-2xl overflow-y-auto rounded-t-2xl lg:rounded-2xl border border-[#1e2631] bg-[#131a23] shadow-[0_-8px_40px_rgba(0,0,0,0.5)]" style={{ maxHeight: '88vh' }}>
        {/* Header */}
        <div className="sticky top-0 z-[1] flex items-start justify-between gap-4 p-5 bg-[#131a23] border-b border-[#1e2631]">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white mb-1">
              {job.title}
            </h2>
            <p className="text-sm text-[#a6abb5]">
              {job.company} · {COUNTRY_FLAG[job.country]} {job.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-[#a6abb5] hover:bg-[#1e2631] transition-colors shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {job.employment_type && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[rgba(61,106,242,0.15)] text-[#3D6AF2]">
                {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
              </span>
            )}
            {job.work_mode && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[rgba(16,185,129,0.15)] text-[#10B981]">
                {WORK_MODE_LABELS[job.work_mode]}
              </span>
            )}
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#1e2631] text-[#a6abb5]">
              {SOURCE_LABELS[job.source]}
            </span>
          </div>

          {/* Salary */}
          <div className="p-4 rounded-xl bg-[#0d1520] border border-[#1e2631]">
            <p className="text-[10px] font-semibold text-[#70767f] uppercase tracking-widest mb-1.5">
              Compensation
            </p>
            <p className="text-xl font-bold text-white">
              {formatSalaryFull(job)}
            </p>
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
              <p className="text-sm text-[#a6abb5] whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {job.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Skills & Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(61,106,242,0.1)] text-[#3D6AF2]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Posted date */}
          <p className="text-xs text-[#70767f]">
            Posted {new Date(job.posted_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-5 bg-[#131a23] border-t border-[#1e2631]">
          <a
            href={job.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-[#3D6AF2] hover:bg-[#3D79F2] hover:shadow-[0_4px_16px_rgba(61,106,242,0.35)] text-white font-medium text-sm transition-all cursor-pointer"
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
            className="h-12 px-5 rounded-xl border border-[#1e2631] bg-[#1e2631] hover:bg-[#252e3d] text-sm font-medium text-[#a6abb5] transition-colors cursor-pointer"
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
