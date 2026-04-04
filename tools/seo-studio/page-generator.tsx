'use client'

import { useState, useEffect } from 'react'
import type { LandingPage, LandingPageContent } from './types'

// ── Tool list (slugs only, no JSX icons needed) ──────────────────────────────

const TOOL_OPTIONS = [
  { slug: 'ipcheck', name: 'IP Check' },
  { slug: 'myip', name: 'My IP' },
  { slug: 'speedtest', name: 'Speed Test' },
  { slug: 'json-converter', name: 'JSON Converter' },
  { slug: 'swagger-editor', name: 'Swagger Editor' },
  { slug: 'jwt-decoder', name: 'JWT Decoder' },
  { slug: 'regex-tester', name: 'Regex Tester' },
  { slug: 'favicon-generator', name: 'Favicon Generator' },
  { slug: 'color-palette', name: 'Color Palette' },
  { slug: 'id-photo', name: 'ID Photo' },
  { slug: 'pdf-converter', name: 'PDF Converter' },
  { slug: 'image-editor', name: 'Image Editor' },
  { slug: 'svg-converter', name: 'SVG Converter' },
  { slug: 'currency-exchange', name: 'Currency Exchange' },
  { slug: 'ecard-studio', name: 'eCard Studio' },
  { slug: 'human-benchmark', name: 'Human Benchmark' },
  { slug: 'story-studio', name: 'Story Studio' },
  { slug: 'job-radar', name: 'Job Radar' },
  { slug: 'ai-radar', name: 'AI Radar' },
  { slug: 'sketch-to-art', name: 'Sketch to Art' },
  { slug: 'logo-generator', name: 'Logo Generator' },
  { slug: 'font-generator', name: 'Font Generator' },
  { slug: 'music-studio', name: 'Music Studio' },
  { slug: 'mood-board', name: 'Mood Board' },
  { slug: 'vblog', name: 'VBlog' },
  { slug: 'component-lab', name: 'Component Lab' },
  { slug: 'tax-manager', name: 'Tax Manager' },
  { slug: 'story-video', name: 'Story Video' },
  { slug: 'resume', name: 'Resume' },
  { slug: 'openclaw', name: 'OpenClaw' },
  { slug: 'slots', name: 'Slots' },
  { slug: 'local-services', name: 'Local Services' },
  { slug: 'flight-monitor', name: 'Flight Monitor' },
  { slug: 'seo-studio', name: 'SEO Studio' },
]

// ── helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  if (status === 'live') return 'bg-green-900/40 text-green-400 border border-green-800'
  return 'bg-amber-900/40 text-amber-400 border border-amber-800'
}

// ── types for generated content (before save) ────────────────────────────────

interface GeneratedResult {
  toolSlug: string
  keyword: string
  pageType: string
  slug: string
  title: string
  metaDescription: string
  content: LandingPageContent
}

// ── component ────────────────────────────────────────────────────────────────

export default function PageGenerator() {
  const [pages, setPages] = useState<LandingPage[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState<GeneratedResult | null>(null)

  // Form state
  const [toolSlug, setToolSlug] = useState(TOOL_OPTIONS[0].slug)
  const [keyword, setKeyword] = useState('')
  const [pageType, setPageType] = useState<'use-case' | 'free-tool'>('use-case')

  useEffect(() => {
    fetchPages()
  }, [])

  async function fetchPages() {
    try {
      const res = await fetch('/api/v1/seo-studio/pages/list')
      const json = await res.json()
      if (res.ok) setPages(json.data || [])
    } catch {
      // Silently fail — table might not exist yet
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerate() {
    if (!keyword.trim()) return
    setGenerating(true)
    setError(null)
    setGenerated(null)

    try {
      const res = await fetch('/api/v1/seo-studio/pages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug, keyword: keyword.trim(), pageType }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Generation failed')
        return
      }

      setGenerated(json.data)
    } catch {
      setError('Network error — could not reach the server.')
    } finally {
      setGenerating(false)
    }
  }

  function resetForm() {
    setShowForm(false)
    setGenerated(null)
    setKeyword('')
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-white">Landing Pages</h2>
          <p className="text-sm text-[#a6abb5] mt-1">
            Generate SEO-optimized landing pages for your tools.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="min-h-[44px] px-6 rounded-lg font-medium text-white bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] hover:opacity-90 transition-opacity"
          >
            + New Page
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* New page form */}
      {showForm && !generated && (
        <div className="bg-[#131a23] border border-[#1e2631] rounded-xl p-5 space-y-4">
          <h3 className="text-base font-medium text-white">Generate New Landing Page</h3>

          {/* Tool select */}
          <div>
            <label htmlFor="pg-tool" className="block text-sm text-[#a6abb5] mb-1">Target Tool</label>
            <select
              id="pg-tool"
              value={toolSlug}
              onChange={e => setToolSlug(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-lg bg-[#0d1117] border border-[#1e2631] text-white text-sm focus:outline-none focus:border-[#3D6AF2]"
            >
              {TOOL_OPTIONS.map(t => (
                <option key={t.slug} value={t.slug}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Keyword */}
          <div>
            <label htmlFor="pg-kw" className="block text-sm text-[#a6abb5] mb-1">Target Keyword</label>
            <input
              id="pg-kw"
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="e.g. free online pdf converter"
              className="w-full min-h-[44px] px-3 rounded-lg bg-[#0d1117] border border-[#1e2631] text-white text-sm placeholder:text-[#70767f] focus:outline-none focus:border-[#3D6AF2]"
            />
          </div>

          {/* Page type */}
          <fieldset>
            <legend className="text-sm text-[#a6abb5] mb-2">Page Type</legend>
            <div className="flex gap-3">
              {(['use-case', 'free-tool'] as const).map(pt => (
                <label
                  key={pt}
                  className={`flex-1 min-h-[44px] flex items-center justify-center rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                    pageType === pt
                      ? 'border-[#3D6AF2] bg-[#3D6AF2]/10 text-[#3D6AF2]'
                      : 'border-[#1e2631] bg-[#0d1117] text-[#a6abb5] hover:border-[#2a3441]'
                  }`}
                >
                  <input
                    type="radio"
                    name="pageType"
                    value={pt}
                    checked={pageType === pt}
                    onChange={() => setPageType(pt)}
                    className="sr-only"
                  />
                  {pt === 'use-case' ? 'Use Case' : 'Free Tool'}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={generating || !keyword.trim()}
              className="min-h-[44px] px-6 rounded-lg font-medium text-white bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating...' : 'Generate (3 credits)'}
            </button>
            <button
              onClick={resetForm}
              className="min-h-[44px] px-4 rounded-lg text-sm text-[#a6abb5] border border-[#1e2631] hover:bg-[#1a2230] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Generated content preview */}
      {generated && (
        <div className="bg-[#131a23] border border-[#1e2631] rounded-xl overflow-hidden">
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-white">Generated Preview</h3>
              <span className="text-xs text-[#70767f]">/{generated.slug}</span>
            </div>

            {/* Title + meta */}
            <div className="space-y-2">
              <div>
                <p className="text-xs text-[#70767f] uppercase tracking-wider mb-1">Page Title</p>
                <p className="text-sm text-white">{generated.title}</p>
              </div>
              <div>
                <p className="text-xs text-[#70767f] uppercase tracking-wider mb-1">Meta Description</p>
                <p className="text-sm text-[#a6abb5]">{generated.metaDescription}</p>
              </div>
            </div>

            {/* Hero preview */}
            <div className="bg-[#0d1117] rounded-lg p-4 border border-[#1e2631]">
              <p className="text-xs text-[#70767f] uppercase tracking-wider mb-2">Hero Section</p>
              <h4 className="text-lg font-bold text-white">{generated.content.heroHeadline}</h4>
              <p className="text-sm text-[#a6abb5] mt-1">{generated.content.heroSubheadline}</p>
              <span className="inline-block mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-sm font-medium text-white">
                {generated.content.ctaText}
              </span>
            </div>

            {/* Benefits */}
            <div>
              <p className="text-xs text-[#70767f] uppercase tracking-wider mb-2">Benefits</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {generated.content.benefits.map((b, i) => (
                  <div key={i} className="bg-[#0d1117] rounded-lg p-3 border border-[#1e2631]">
                    <p className="text-sm font-medium text-white">{b.title}</p>
                    <p className="text-xs text-[#a6abb5] mt-1">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <p className="text-xs text-[#70767f] uppercase tracking-wider mb-2">FAQ</p>
              <div className="space-y-2">
                {generated.content.faq.map((f, i) => (
                  <div key={i} className="bg-[#0d1117] rounded-lg p-3 border border-[#1e2631]">
                    <p className="text-sm font-medium text-white">{f.question}</p>
                    <p className="text-xs text-[#a6abb5] mt-1">{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-[#1e2631] px-5 py-3 flex gap-3">
            <button
              onClick={resetForm}
              className="min-h-[44px] px-4 rounded-lg text-sm text-[#a6abb5] border border-[#1e2631] hover:bg-[#1a2230] transition-colors"
            >
              Discard
            </button>
            <button
              onClick={() => {
                // For MVP: just copy JSON to clipboard
                navigator.clipboard.writeText(JSON.stringify(generated, null, 2))
                resetForm()
              }}
              className="min-h-[44px] px-6 rounded-lg font-medium text-white bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] hover:opacity-90 transition-opacity"
            >
              Copy JSON
            </button>
          </div>
        </div>
      )}

      {/* Pages list */}
      {!showForm && !generated && (
        <>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#3D6AF2] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : pages.length > 0 ? (
            <div className="bg-[#131a23] border border-[#1e2631] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e2631] text-[#70767f] text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">Slug</th>
                      <th className="text-left px-4 py-3 font-medium">Keyword</th>
                      <th className="text-left px-4 py-3 font-medium">Tool</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map(page => (
                      <tr key={page.id} className="border-b border-[#1e2631] last:border-0 hover:bg-[#1a2230] transition-colors">
                        <td className="px-4 py-3 text-[#3D6AF2] font-mono text-xs">/{page.slug}</td>
                        <td className="px-4 py-3 text-white">{page.keyword}</td>
                        <td className="px-4 py-3 text-[#a6abb5]">{page.toolSlug}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${statusBadge(page.status)}`}>
                            {page.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#70767f] text-xs">
                          {new Date(page.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-12 h-12 mx-auto text-[#70767f] mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-[#a6abb5]">No landing pages yet.</p>
              <p className="text-sm text-[#70767f] mt-1">Click &ldquo;+ New Page&rdquo; to generate your first SEO landing page.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
