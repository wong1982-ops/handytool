'use client'

import { useState, useEffect, useCallback } from 'react'
import { tools } from '@/lib/tools'
import { JobProgress } from './job-progress'
import { TemplateUpload } from './template-upload'
import type { VBlogJob, ScriptStyle, VoiceType } from './types'
import { DURATION_OPTIONS } from './types'

type Tab = 'videos' | 'templates'

export default function VBlogDashboard() {
  const [tab, setTab] = useState<Tab>('videos')
  const [jobs, setJobs] = useState<VBlogJob[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [selectedTool, setSelectedTool] = useState(tools[0]?.href.replace('/tools/', '') ?? '')
  const [scriptStyle, setScriptStyle] = useState<ScriptStyle>('feature-walkthrough')
  const [voiceType, setVoiceType] = useState<VoiceType>('ai')
  const [duration, setDuration] = useState(DURATION_OPTIONS[1].value)

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/vblog/jobs')
      if (!res.ok) throw new Error('Failed to fetch jobs')
      const data = await res.json()
      setJobs(data.data ?? [])
    } catch {
      // silent on poll failures
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 5000)
    return () => clearInterval(interval)
  }, [fetchJobs])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    const tool = tools.find((t) => t.href === `/tools/${selectedTool}`)
    try {
      const res = await fetch('/api/v1/vblog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolSlug: selectedTool,
          toolName: tool?.name ?? selectedTool,
          scriptStyle,
          voiceType,
          targetDuration: duration,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to create video job')
      }
      await fetchJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  const handleRetry = async (jobId: string, step: string) => {
    try {
      await fetch(`/api/v1/vblog/jobs/${jobId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step }),
      })
      await fetchJobs()
    } catch {
      // ignore
    }
  }

  const selectedToolObj = tools.find((t) => t.href === `/tools/${selectedTool}`)

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
        VBlog{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9]">
          Studio
        </span>
      </h1>

      {/* Tab toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('videos')}
          className={`px-5 py-2 rounded-full text-sm font-semibold min-h-[44px] cursor-pointer transition-colors ${
            tab === 'videos'
              ? 'bg-[#3D6AF2] text-white'
              : 'bg-[#131a23] text-[#a6abb5] hover:text-white border border-[#1e2631]'
          }`}
        >
          Videos
        </button>
        <button
          type="button"
          onClick={() => setTab('templates')}
          className={`px-5 py-2 rounded-full text-sm font-semibold min-h-[44px] cursor-pointer transition-colors ${
            tab === 'templates'
              ? 'bg-[#3D6AF2] text-white'
              : 'bg-[#131a23] text-[#a6abb5] hover:text-white border border-[#1e2631]'
          }`}
        >
          Templates
        </button>
      </div>

      {tab === 'videos' && (
        <>
          {/* New Video Form */}
          <div className="bg-[#131a23] rounded-xl border border-[#1e2631] p-4 space-y-4">
            <h2 className="text-sm font-medium text-[#a6abb5]">New Video</h2>

            {/* Tool dropdown */}
            <div>
              <label htmlFor="vblog-tool" className="text-xs text-[#70767f] block mb-1">
                Tool
              </label>
              <select
                id="vblog-tool"
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors cursor-pointer"
              >
                {tools.map((t) => (
                  <option key={t.href} value={t.href.replace('/tools/', '')}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Script Style */}
            <div>
              <label className="text-xs text-[#70767f] block mb-2">Script Style</label>
              <div className="flex gap-3 flex-wrap">
                {(['feature-walkthrough', 'problem-solution'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setScriptStyle(style)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold min-h-[44px] cursor-pointer transition-all ${
                      scriptStyle === style
                        ? 'bg-[#3D6AF2]/20 text-[#3D6AF2] shadow-[0_0_0_2px_#3D6AF2]'
                        : 'bg-[#131a23] text-[#a6abb5] border border-[#1e2631] hover:border-[#3D6AF2]/30'
                    }`}
                  >
                    {style === 'feature-walkthrough' ? 'Feature Walkthrough' : 'Problem-Solution'}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Type */}
            <div>
              <label className="text-xs text-[#70767f] block mb-2">Voice</label>
              <div className="flex gap-3 flex-wrap">
                {(['clone', 'ai'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVoiceType(v)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold min-h-[44px] cursor-pointer transition-all ${
                      voiceType === v
                        ? 'bg-[#3D6AF2]/20 text-[#3D6AF2] shadow-[0_0_0_2px_#3D6AF2]'
                        : 'bg-[#131a23] text-[#a6abb5] border border-[#1e2631] hover:border-[#3D6AF2]/30'
                    }`}
                  >
                    {v === 'clone' ? 'Clone' : 'AI'}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="vblog-duration" className="text-xs text-[#70767f] block mb-1">
                Duration
              </label>
              <select
                id="vblog-duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors cursor-pointer"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !selectedTool}
              className="w-full bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] px-6 py-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {generating ? 'Generating...' : `Generate ${selectedToolObj?.name ?? ''} Video`}
            </button>
          </div>

          {/* Job list */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#3D6AF2] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-12 h-12 mx-auto text-[#70767f] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <p className="text-[#a6abb5] text-sm">No videos yet</p>
                <p className="text-[#70767f] text-xs mt-1">Generate your first marketing video above</p>
              </div>
            ) : (
              jobs.map((job) => (
                <JobProgress key={job.id} job={job} onRetry={handleRetry} />
              ))
            )}
          </div>
        </>
      )}

      {tab === 'templates' && <TemplateUpload />}
    </div>
  )
}
