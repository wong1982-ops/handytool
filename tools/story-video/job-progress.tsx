'use client'

import { useState } from 'react'
import {
  PIPELINE_STEPS,
  STEP_LABELS,
  type StoryVideoJob,
  type PipelineStep,
} from '@/tools/story-video/types'

interface JobProgressProps {
  job: StoryVideoJob
  onRetry: (jobId: string, step?: PipelineStep, sceneIndex?: number) => void
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function JobProgress({ job, onRetry }: JobProgressProps) {
  const [failedScene, setFailedScene] = useState<number | null>(null)

  const isComplete = job.status === 'complete'
  const isFailed = job.status === 'failed'

  return (
    <div className={`rounded-xl bg-[#131a23] border p-4 transition-all ${
      isFailed ? 'border-red-500/30' : isComplete ? 'border-emerald-500/30' : 'border-[#1e2631]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white text-sm font-semibold">{job.book_title}</h3>
          <p className="text-[#70767f] text-xs mt-0.5">
            {job.art_style} &middot; {timeAgo(job.created_at)}
          </p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
          isComplete
            ? 'bg-emerald-500/20 text-emerald-400'
            : isFailed
              ? 'bg-red-500/20 text-red-400'
              : 'bg-[#3D6AF2]/20 text-[#3D6AF2]'
        }`}>
          {job.status}
        </span>
      </div>

      {/* 7-Step Progress Bar */}
      <div className="flex items-center gap-1 mb-4">
        {PIPELINE_STEPS.map((step, i) => {
          const stepStatus = job.steps[step]
          return (
            <div key={step} className="flex-1 flex items-center gap-1">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  stepStatus === 'done'
                    ? 'bg-emerald-500'
                    : stepStatus === 'processing'
                      ? 'bg-[#3D6AF2] animate-pulse'
                      : stepStatus === 'failed'
                        ? 'bg-red-500'
                        : 'bg-[#1e2631]'
                }`}
                title={`${STEP_LABELS[step]}: ${stepStatus}`}
              />
              {i < PIPELINE_STEPS.length - 1 && <div className="w-0.5" />}
            </div>
          )
        })}
      </div>

      {/* Step Labels (compact) */}
      <div className="flex justify-between mb-4">
        {PIPELINE_STEPS.map((step) => (
          <span
            key={step}
            className={`text-[10px] ${
              job.steps[step] === 'processing'
                ? 'text-[#3D6AF2] font-semibold'
                : job.steps[step] === 'done'
                  ? 'text-emerald-400'
                  : job.steps[step] === 'failed'
                    ? 'text-red-400'
                    : 'text-[#70767f]'
            }`}
          >
            {STEP_LABELS[step].split(' ')[0]}
          </span>
        ))}
      </div>

      {/* Scene Status Grid */}
      {job.scene_status.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#70767f] mb-2">
            Scenes ({job.scene_status.filter((s) => s.status === 'done').length}/{job.scene_status.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.scene_status.map((scene) => (
              <button
                key={scene.index}
                type="button"
                onClick={() => {
                  if (scene.status === 'failed') setFailedScene(scene.index)
                }}
                className={`w-5 h-5 rounded transition-colors ${
                  scene.status === 'done'
                    ? 'bg-emerald-500'
                    : scene.status === 'generating'
                      ? 'bg-[#3D6AF2] animate-pulse'
                      : scene.status === 'failed'
                        ? 'bg-red-500 cursor-pointer hover:bg-red-400'
                        : 'bg-[#1e2631]'
                }`}
                title={`Scene ${scene.index + 1}: ${scene.status}${scene.error ? ` — ${scene.error}` : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Failed scene retry */}
      {failedScene !== null && (
        <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
          <p className="text-red-400 text-xs">
            Scene {failedScene + 1} failed
            {job.scene_status[failedScene]?.error && (
              <span className="text-[#70767f]"> — {job.scene_status[failedScene].error}</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              onRetry(job.id, 'scenes', failedScene)
              setFailedScene(null)
            }}
            className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer min-h-[44px] px-3"
          >
            Retry Scene
          </button>
        </div>
      )}

      {/* Job-level error */}
      {isFailed && job.error && (
        <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {job.error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {isComplete && job.artifacts.finalVideo && (
          <>
            <a
              href={job.artifacts.finalVideo}
              target="_blank"
              rel="noopener noreferrer"
              className="
                bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold
                rounded-xl min-h-[44px] px-4 py-2 text-sm cursor-pointer
                inline-flex items-center gap-1.5
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              Watch
            </a>
            <a
              href={job.artifacts.finalVideo}
              download
              className="
                border border-[#3D6AF2] text-[#3D6AF2] font-semibold rounded-xl
                min-h-[44px] px-4 py-2 text-sm cursor-pointer
                inline-flex items-center gap-1.5 hover:bg-[#3D6AF2]/10
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </a>
          </>
        )}

        {isFailed && (
          <button
            type="button"
            onClick={() => onRetry(job.id)}
            className="
              bg-red-500 text-white font-semibold rounded-xl
              min-h-[44px] px-4 py-2 text-sm cursor-pointer hover:bg-red-400
            "
          >
            Retry Job
          </button>
        )}
      </div>
    </div>
  )
}
