'use client'

import { useState } from 'react'
import type { VBlogJob, PipelineStep, StepStatus } from './types'
import { PIPELINE_STEPS, STEP_LABELS } from './types'
import { VideoPreview } from './video-preview'

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

function stepColor(status: StepStatus): string {
  switch (status) {
    case 'done': return 'bg-[#10B981]'
    case 'running': return 'bg-[#3D6AF2] animate-pulse'
    case 'failed': return 'bg-[#EF4444]'
    default: return 'bg-[#1e2631]'
  }
}

function stepLabelColor(status: StepStatus): string {
  switch (status) {
    case 'running': return 'text-[#3D6AF2]'
    case 'failed': return 'text-[#EF4444]'
    default: return 'text-[#70767f]'
  }
}

function stepIcon(status: StepStatus): string {
  switch (status) {
    case 'done': return '\u2705'
    case 'running': return '\u23F3'
    case 'failed': return '\u274C'
    default: return '\u26AA'
  }
}

interface JobProgressProps {
  job: VBlogJob
  onRetry: (jobId: string, step: string) => void
}

export function JobProgress({ job, onRetry }: JobProgressProps) {
  const [showPreview, setShowPreview] = useState(false)

  const doneCount = PIPELINE_STEPS.filter((s) => job.steps[s] === 'done').length
  const failedStep = PIPELINE_STEPS.find((s) => job.steps[s] === 'failed')

  return (
    <>
      <div className="bg-[#131a23] rounded-xl p-5 border border-[#1e2631] space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{job.toolName} Demo</p>
            <span className="text-xs text-[#70767f] shrink-0">{relativeTime(job.createdAt)}</span>
          </div>
          <span className="text-xs text-[#70767f] shrink-0">
            Step {doneCount}/{PIPELINE_STEPS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
          {PIPELINE_STEPS.map((step) => (
            <div key={step} className={`flex-1 rounded-full ${stepColor(job.steps[step])}`} />
          ))}
        </div>

        {/* Step icons */}
        <div className="flex justify-between">
          {PIPELINE_STEPS.map((step) => (
            <div key={step} className="flex flex-col items-center gap-1">
              <span className="text-base leading-none" role="img" aria-label={`${STEP_LABELS[step]}: ${job.steps[step]}`}>
                {stepIcon(job.steps[step])}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${stepLabelColor(job.steps[step])}`}>
                {STEP_LABELS[step]}
              </span>
            </div>
          ))}
        </div>

        {/* Error + Retry */}
        {job.status === 'failed' && job.error && (
          <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-[#EF4444] text-sm min-w-0 break-words">{job.error}</span>
            {failedStep && (
              <button
                type="button"
                onClick={() => onRetry(job.id, failedStep)}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-[#EF4444] hover:bg-red-400 text-white text-xs font-semibold min-h-[44px] cursor-pointer whitespace-nowrap transition-colors"
              >
                Retry {STEP_LABELS[failedStep]}
              </button>
            )}
          </div>
        )}

        {/* Complete actions */}
        {job.status === 'complete' && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex-1 bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] px-4 py-2 text-sm cursor-pointer transition-opacity hover:opacity-90"
            >
              Preview
            </button>
            {job.artifacts.masterUrl && (
              <a
                href={job.artifacts.masterUrl}
                download
                className="flex-1 bg-[#10B981] hover:bg-emerald-500 text-white font-semibold rounded-xl min-h-[44px] px-4 py-2 text-sm text-center cursor-pointer transition-colors inline-flex items-center justify-center"
              >
                Download
              </a>
            )}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowPreview(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Video preview"
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#131a23] rounded-xl border border-[#1e2631]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#1e2631]">
              <div>
                <h2 className="text-white font-semibold text-base">{job.toolName} Demo</h2>
                <p className="text-xs text-[#70767f] mt-0.5">
                  {job.scriptStyle === 'feature-walkthrough' ? 'Feature Walkthrough' : 'Problem-Solution'} · {job.voiceType === 'ai' ? 'AI' : 'Clone'} Voice · {Math.floor(job.targetDuration / 60)} min
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-[#70767f] hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer rounded-xl hover:bg-[#1e2631] transition-colors"
                aria-label="Close preview"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <VideoPreview job={job} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
