'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ContentPlan, ContentPlanStatus } from './types'
import ContentEditor from './content-editor'

// ── status badge ──────────────────────────────────────────────────────────────

function statusBadge(status: ContentPlanStatus) {
  const map: Record<ContentPlanStatus, string> = {
    planned: 'bg-slate-800 text-slate-400 border border-slate-700',
    generating: 'bg-amber-900/40 text-amber-400 border border-amber-800 animate-pulse',
    draft: 'bg-blue-900/40 text-blue-400 border border-blue-800',
    published: 'bg-green-900/40 text-green-400 border border-green-800',
  }
  return map[status]
}

function statusLabel(status: ContentPlanStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ContentCalendar() {
  const [plans, setPlans] = useState<ContentPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<ContentPlan | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/seo-studio/content/plans')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `Request failed (${res.status})`)
      }
      const data = (await res.json()) as { plans: ContentPlan[] }
      setPlans(data.plans ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  function openNewPost() {
    setEditingPlan(null)
    setShowEditor(true)
  }

  function openPlan(plan: ContentPlan) {
    setEditingPlan(plan)
    setShowEditor(true)
  }

  function handleEditorClose() {
    setShowEditor(false)
    setEditingPlan(null)
  }

  function handleEditorSave() {
    setShowEditor(false)
    setEditingPlan(null)
    fetchPlans()
  }

  // ── editor view ──
  if (showEditor) {
    return (
      <ContentEditor
        plan={editingPlan}
        onSave={handleEditorSave}
        onClose={handleEditorClose}
      />
    )
  }

  // ── calendar/list view ──
  return (
    <section className="w-full space-y-6" aria-label="Content Calendar">
      {/* header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Content Calendar</h2>
        <button
          onClick={openNewPost}
          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </button>
      </div>

      {/* error banner */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {/* loading skeleton */}
      {loading && plans.length === 0 && (
        <div className="space-y-3" aria-busy="true" aria-label="Loading content plans">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-xl bg-[#131a23]" />
          ))}
        </div>
      )}

      {/* empty state */}
      {!loading && plans.length === 0 && !error && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-[#1e2631] bg-[#131a23] py-16 text-center">
          {/* simple illustration */}
          <svg
            className="h-16 w-16 text-[#2a3444]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div>
            <p className="text-base font-medium text-white">No content plans yet</p>
            <p className="mt-1 text-sm text-[#70767f]">
              Create your first post to get started with AI-powered content generation.
            </p>
          </div>
          <button
            onClick={openNewPost}
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] px-5 text-sm font-semibold text-white"
          >
            Create First Post
          </button>
        </div>
      )}

      {/* plan list */}
      {plans.length > 0 && (
        <ul className="space-y-3" role="list">
          {plans.map((plan) => (
            <li key={plan.id}>
              <button
                onClick={() => openPlan(plan)}
                className="w-full rounded-xl border border-[#1e2631] bg-[#131a23] p-4 text-left transition-colors hover:border-[#3D6AF2] hover:bg-[#1a2332]"
                aria-label={`Edit content plan: ${plan.keyword}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{plan.keyword}</p>
                    {plan.topic && (
                      <p className="mt-0.5 truncate text-sm text-[#70767f]">{plan.topic}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(plan.status)}`}
                    >
                      {statusLabel(plan.status)}
                    </span>
                  </div>
                </div>

                {plan.scheduledDate && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-[#70767f]">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(plan.scheduledDate)}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
