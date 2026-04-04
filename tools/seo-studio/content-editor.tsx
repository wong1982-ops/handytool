'use client'

import { useState, useEffect } from 'react'
import type { ContentPlan, DraftContent } from './types'
import { tools } from '@/lib/tools'

// ── input styles ──────────────────────────────────────────────────────────────

const inputCls =
  'min-h-[44px] w-full rounded-xl border border-[#1e2631] bg-[#131a23] px-4 text-white placeholder-[#70767f] focus:border-[#3D6AF2] focus:outline-none focus:ring-1 focus:ring-[#3D6AF2]'

const labelCls = 'mb-1.5 block text-sm font-medium text-[#a6abb5]'

// ── props ─────────────────────────────────────────────────────────────────────

interface ContentEditorProps {
  plan: ContentPlan | null
  onSave: () => void
  onClose: () => void
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ContentEditor({ plan, onSave, onClose }: ContentEditorProps) {
  const [keyword, setKeyword] = useState('')
  const [topic, setTopic] = useState('')
  const [toolSlug, setToolSlug] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [generating, setGenerating] = useState(false)
  const [draft, setDraft] = useState<DraftContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Initialise form from plan if provided
  useEffect(() => {
    if (plan) {
      setKeyword(plan.keyword ?? '')
      setTopic(plan.topic ?? '')
      setToolSlug(plan.toolSlug ?? '')
      setScheduledDate(plan.scheduledDate ? plan.scheduledDate.slice(0, 10) : '')
      if (plan.draftContent) setDraft(plan.draftContent)
    }
  }, [plan])

  async function handleGenerate() {
    if (!keyword.trim() || generating) return
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/seo-studio/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, topic: topic || undefined, toolSlug: toolSlug || undefined }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `Request failed (${res.status})`)
      }
      const data = (await res.json()) as { draft: DraftContent }
      setDraft(data.draft)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate draft')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSavePlan() {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        keyword,
        topic: topic || null,
        toolSlug: toolSlug || null,
        scheduledDate: scheduledDate || null,
      }
      if (plan?.id) body.id = plan.id
      if (draft) body.draftContent = draft

      const res = await fetch('/api/v1/seo-studio/content/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b?.error ?? `Request failed (${res.status})`)
      }
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save plan')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    if (!draft || publishing) return
    setPublishing(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/seo-studio/content/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          topic: topic || null,
          toolSlug: toolSlug || null,
          scheduledDate: scheduledDate || null,
          draftContent: draft,
          planId: plan?.id ?? null,
        }),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b?.error ?? `Request failed (${res.status})`)
      }
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  const metaLen = draft?.metaDescription?.length ?? 0

  return (
    <div className="w-full space-y-6">
      {/* ── back button ── */}
      <button
        onClick={onClose}
        className="flex min-h-[44px] items-center gap-2 text-sm text-[#a6abb5] transition-colors hover:text-white"
        aria-label="Back to content calendar"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h2 className="text-lg font-semibold text-white">
        {plan ? 'Edit Post' : 'New Post'}
      </h2>

      {/* ── error banner ── */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {/* ── form fields ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Keyword */}
        <div>
          <label htmlFor="ce-keyword" className={labelCls}>
            Keyword <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="ce-keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. best SEO tools 2026"
            required
            className={inputCls}
          />
        </div>

        {/* Topic / angle */}
        <div>
          <label htmlFor="ce-topic" className={labelCls}>Topic / Angle</label>
          <input
            id="ce-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Optional angle or hook"
            className={inputCls}
          />
        </div>

        {/* Target tool */}
        <div>
          <label htmlFor="ce-tool" className={labelCls}>Target Tool</label>
          <select
            id="ce-tool"
            value={toolSlug}
            onChange={(e) => setToolSlug(e.target.value)}
            className={`${inputCls} appearance-none`}
          >
            <option value="">None</option>
            {tools.map((t) => (
              <option key={t.href} value={t.href.replace('/tools/', '')}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule date */}
        <div>
          <label htmlFor="ce-date" className={labelCls}>Schedule Date</label>
          <input
            id="ce-date"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className={`${inputCls} [color-scheme:dark]`}
          />
        </div>
      </div>

      {/* ── generate draft button ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={!keyword.trim() || generating}
          aria-busy={generating}
          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        >
          {generating ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating…
            </>
          ) : (
            'Generate Draft'
          )}
        </button>
        <span className="text-xs text-[#7C3AED]">2 credits</span>
      </div>

      {/* ── draft preview ── */}
      {draft && (
        <div className="space-y-4 rounded-xl border border-[#1e2631] bg-[#0d1117] p-5">
          <h3 className="text-xl font-bold text-white">{draft.title}</h3>

          <div>
            <p className="text-sm text-[#a6abb5]">{draft.metaDescription}</p>
            <p className={`mt-1 text-xs ${metaLen > 160 ? 'text-red-400' : 'text-[#70767f]'}`}>
              {metaLen} / 160 chars
            </p>
          </div>

          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#1e2631] bg-[#131a23] p-4 font-mono text-xs text-[#c8cdd6]">
            {draft.body}
          </pre>

          {draft.suggestedLinks.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#70767f]">
                Suggested Internal Links
              </p>
              <ul className="space-y-1">
                {draft.suggestedLinks.map((link, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <svg className="h-3.5 w-3.5 shrink-0 text-[#3D6AF2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3D79F2] underline-offset-2 hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── actions row ── */}
      <div className="flex flex-wrap items-center gap-3 border-t border-[#1e2631] pt-5">
        <button
          onClick={handleSavePlan}
          disabled={!keyword.trim() || saving}
          aria-busy={saving}
          className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[#1e2631] bg-[#131a23] px-5 text-sm font-semibold text-white transition-colors hover:border-[#3D6AF2] disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : (
            'Save Plan'
          )}
        </button>

        {draft && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            aria-busy={publishing}
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {publishing ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Publishing…
              </>
            ) : (
              'Publish to Blog'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
