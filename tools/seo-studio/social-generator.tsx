'use client'

import { useState } from 'react'
import { tools } from '@/lib/tools'
import type { SocialContentType, SocialPlatform, SocialPostSet } from './types'

// ── Platform config ───────────────────────────────────────────────────────────

const PLATFORMS: { id: SocialPlatform; label: string; icon: string; maxChars: number }[] = [
  { id: 'twitter',   label: 'Twitter',   icon: '𝕏',  maxChars: 280  },
  { id: 'linkedin',  label: 'LinkedIn',  icon: 'in', maxChars: 500  },
  { id: 'instagram', label: 'Instagram', icon: '📷', maxChars: 2200 },
  { id: 'facebook',  label: 'Facebook',  icon: 'f',  maxChars: 500  },
  { id: 'tiktok',    label: 'TikTok',    icon: '♪',  maxChars: 2200 },
]

const CONTENT_TYPES: { id: SocialContentType; label: string; emoji: string }[] = [
  { id: 'announcement', label: 'Announcement',  emoji: '📢' },
  { id: 'tips',         label: 'Tips & How-to', emoji: '💡' },
  { id: 'engagement',   label: 'Engagement',    emoji: '🔥' },
]

// ── CSV download ──────────────────────────────────────────────────────────────

function downloadCsv(posts: SocialPostSet[], toolSlug: string) {
  const rows = ['Platform,Variant,Content,Hashtags,CharCount']
  for (const set of posts) {
    set.variants.forEach((v, i) => {
      const content = v.content.replace(/"/g, '""')
      const hashtags = v.hashtags.join(' ')
      rows.push(`${set.platform},${i + 1},"${content}","${hashtags}",${v.charCount}`)
    })
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `social-posts-${toolSlug}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SocialGenerator() {
  const [toolSlug, setToolSlug]           = useState('')
  const [contentType, setContentType]     = useState<SocialContentType | null>(null)
  const [customAngle, setCustomAngle]     = useState('')
  const [generating, setGenerating]       = useState(false)
  const [posts, setPosts]                 = useState<SocialPostSet[]>([])
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>('twitter')
  const [error, setError]                 = useState<string | null>(null)
  const [copiedId, setCopiedId]           = useState<string | null>(null)

  // ── Copy handler ─────────────────────────────────────────────────────────────
  async function copyVariant(platform: string, index: number, content: string, hashtags: string[]) {
    const full = content + '\n\n' + hashtags.join(' ')
    await navigator.clipboard.writeText(full)
    setCopiedId(`${platform}-${index}`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── Generate handler ──────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!toolSlug || !contentType) return
    setGenerating(true)
    setError(null)
    setPosts([])

    try {
      const res = await fetch('/api/v1/seo-studio/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug, contentType, customAngle: customAngle.trim() || undefined }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Server error ${res.status}`)
      }

      const json = await res.json()
      const unwrapped = json.data ?? json
      setPosts(unwrapped.posts ?? [])
      setActivePlatform('twitter')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  // ── Active platform data ──────────────────────────────────────────────────────
  const activePlatformConfig = PLATFORMS.find(p => p.id === activePlatform)!
  const activePosts = posts.find(p => p.platform === activePlatform)

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* ── Error banner ── */}
      {error && (
        <div className="rounded-xl bg-red-900/30 text-red-400 text-sm px-4 py-3 mb-4" role="alert">
          {error}
        </div>
      )}

      {/* ── Form card ── */}
      <div className="mx-auto max-w-2xl rounded-xl bg-[#131a23] border border-[#1e2631] p-6">
        <div className="space-y-5">

          {/* Tool select */}
          <div>
            <label htmlFor="tool-select" className="block text-sm font-medium text-[#a6abb5] mb-2">
              Which tool to promote?
            </label>
            <select
              id="tool-select"
              value={toolSlug}
              onChange={e => setToolSlug(e.target.value)}
              className="w-full min-h-[44px] rounded-lg bg-[#0d1520] border border-[#1e2631] text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] focus:border-transparent"
            >
              <option value="">Select a tool…</option>
              {tools.map(tool => {
                const slug = tool.href.replace('/tools/', '')
                return (
                  <option key={slug} value={slug}>
                    {tool.name}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Content type pills */}
          <div>
            <p className="block text-sm font-medium text-[#a6abb5] mb-2">Content type</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Content type">
              {CONTENT_TYPES.map(ct => {
                const isActive = contentType === ct.id
                return (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => setContentType(ct.id)}
                    className={[
                      'min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white'
                        : 'bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:border-[#3D6AF2] hover:text-white',
                    ].join(' ')}
                    aria-pressed={isActive}
                  >
                    {ct.emoji} {ct.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom angle */}
          <div>
            <label htmlFor="custom-angle" className="flex items-center gap-2 text-sm font-medium text-[#a6abb5] mb-2">
              Custom angle
              <span className="text-xs text-[#4b5563] bg-[#1e2631] rounded px-1.5 py-0.5">optional</span>
            </label>
            <input
              id="custom-angle"
              type="text"
              value={customAngle}
              onChange={e => setCustomAngle(e.target.value)}
              placeholder="e.g. focus on speed, compare with alternatives..."
              className="w-full min-h-[44px] rounded-lg bg-[#0d1520] border border-[#1e2631] text-white px-3 py-2 text-sm placeholder:text-[#4b5563] focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] focus:border-transparent"
            />
          </div>

          {/* Generate button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!toolSlug || !contentType || generating}
              className="w-full min-h-[44px] rounded-lg bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white font-semibold text-sm px-4 py-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Generating…
                </span>
              ) : (
                '✨ Generate Posts'
              )}
            </button>

            {/* Credit badge */}
            <p className="text-center text-xs text-[#7C3AED]">1 credit</p>
          </div>
        </div>
      </div>

      {/* ── Empty state ── */}
      {posts.length === 0 && !generating && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {/* Megaphone / broadcast icon */}
          <svg
            className="w-12 h-12 text-[#2a3546] mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 11v2a7 7 0 0 0 7 7h0" />
            <path d="M11 5H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h5l7 4V1L11 5Z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          <h3 className="text-base font-semibold text-white mb-1">
            Generate social content for any tool
          </h3>
          <p className="text-sm text-[#a6abb5] max-w-xs">
            Pick a tool and content type above to create posts for 5 platforms
          </p>
        </div>
      )}

      {/* ── Results ── */}
      {posts.length > 0 && (
        <div className="mx-auto max-w-5xl mt-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[18px] font-bold text-white">Generated Posts</h2>
            <button
              type="button"
              onClick={() => downloadCsv(posts, toolSlug)}
              className="min-h-[44px] px-4 py-2 rounded-lg border border-[#1e2631] bg-[#131a23] text-sm text-[#a6abb5] hover:text-white hover:border-[#3D6AF2] transition-colors"
            >
              ⬇ Download All as CSV
            </button>
          </div>

          {/* Platform tabs */}
          <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Platforms">
            {PLATFORMS.map(platform => {
              const isActive = activePlatform === platform.id
              return (
                <button
                  key={platform.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActivePlatform(platform.id)}
                  className={[
                    'min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5',
                    isActive
                      ? 'bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white'
                      : 'bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:border-[#3D6AF2] hover:text-white',
                  ].join(' ')}
                >
                  <span aria-hidden="true">{platform.icon}</span>
                  {platform.label}
                </button>
              )
            })}
          </div>

          {/* Variant cards */}
          {activePosts ? (
            <div className="space-y-4" role="tabpanel">
              {activePosts.variants.map((variant, idx) => {
                const copyKey = `${activePlatform}-${idx}`
                const isCopied = copiedId === copyKey
                const isOver = variant.charCount > activePlatformConfig.maxChars

                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-[#a6abb5] font-medium">
                        Variant {idx + 1}
                      </span>
                      <span
                        className={[
                          'text-xs font-mono px-2 py-0.5 rounded-full',
                          isOver
                            ? 'bg-red-900/30 text-red-400'
                            : 'bg-green-900/30 text-green-400',
                        ].join(' ')}
                        aria-label={`${variant.charCount} of ${activePlatformConfig.maxChars} characters`}
                      >
                        {variant.charCount}/{activePlatformConfig.maxChars}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-white whitespace-pre-wrap leading-relaxed mb-3">
                      {variant.content}
                    </p>

                    {/* Hashtags */}
                    {variant.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {variant.hashtags.map((tag, ti) => (
                          <span
                            key={ti}
                            className="rounded-full bg-[#1e2631] px-2.5 py-1 text-xs text-[#a6abb5]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Copy button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => copyVariant(activePlatform, idx, variant.content, variant.hashtags)}
                        className={[
                          'min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
                          isCopied
                            ? 'border-green-700 bg-green-900/20 text-green-400'
                            : 'border-[#1e2631] bg-[#0d1520] text-[#a6abb5] hover:text-white hover:border-[#3D6AF2]',
                        ].join(' ')}
                        aria-label={isCopied ? 'Copied!' : `Copy variant ${idx + 1}`}
                      >
                        {isCopied ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-[#a6abb5] text-center py-8">
              No posts generated for this platform.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
