'use client'

import { useState } from 'react'
import type { AuditResult, ToolAuditResult } from './types'

// ── helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-green-900/30 border-green-800'
  if (score >= 50) return 'bg-amber-900/30 border-amber-800'
  return 'bg-red-900/30 border-red-800'
}

function issueIcon(type: 'critical' | 'warning' | 'info') {
  if (type === 'critical') {
    return (
      <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="8" />
      </svg>
    )
  }
  if (type === 'warning') {
    return (
      <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z" />
      </svg>
    )
  }
  return (
    <svg className="w-4 h-4 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  )
}

// ── component ────────────────────────────────────────────────────────────────

export default function AuditDashboard() {
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<AuditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

  async function runAudit() {
    setScanning(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch('/api/v1/seo-studio/audit/scan', { method: 'POST' })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Audit failed')
        return
      }

      setResults(json.data)
    } catch {
      setError('Network error — could not reach the audit endpoint.')
    } finally {
      setScanning(false)
    }
  }

  const criticalCount = results?.tools.reduce((n, t) => n + t.issues.filter(i => i.type === 'critical').length, 0) ?? 0
  const warningCount = results?.tools.reduce((n, t) => n + t.issues.filter(i => i.type === 'warning').length, 0) ?? 0
  const infoCount = results?.tools.reduce((n, t) => n + t.issues.filter(i => i.type === 'info').length, 0) ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-white">Site Audit</h2>
          <p className="text-sm text-[#a6abb5] mt-1">
            Scan all tool pages for SEO issues (title, meta, headings, structured data).
          </p>
        </div>
        <button
          onClick={runAudit}
          disabled={scanning}
          className="min-h-[44px] px-6 rounded-lg font-medium text-white bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scanning ? 'Scanning...' : 'Run Full Audit'}
        </button>
      </div>

      {/* Scanning state */}
      {scanning && (
        <div className="bg-[#131a23] border border-[#1e2631] rounded-xl p-6">
          <p className="text-sm text-[#a6abb5] mb-3">Scanning all tool pages...</p>
          <div className="h-2 bg-[#0d1117] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <>
          {/* Overall score + summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className={`rounded-xl border p-5 text-center ${scoreBg(results.overallScore)}`}>
              <p className="text-xs uppercase tracking-wider text-[#70767f] mb-1">Overall Score</p>
              <p className={`text-4xl font-bold ${scoreColor(results.overallScore)}`}>
                {results.overallScore}
              </p>
            </div>
            <div className="rounded-xl border border-red-800 bg-red-900/20 p-5 text-center">
              <p className="text-xs uppercase tracking-wider text-[#70767f] mb-1">Critical</p>
              <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
            </div>
            <div className="rounded-xl border border-amber-800 bg-amber-900/20 p-5 text-center">
              <p className="text-xs uppercase tracking-wider text-[#70767f] mb-1">Warnings</p>
              <p className="text-3xl font-bold text-amber-400">{warningCount}</p>
            </div>
            <div className="rounded-xl border border-blue-800 bg-blue-900/20 p-5 text-center">
              <p className="text-xs uppercase tracking-wider text-[#70767f] mb-1">Info</p>
              <p className="text-3xl font-bold text-blue-400">{infoCount}</p>
            </div>
          </div>

          {/* Scanned at */}
          <p className="text-xs text-[#70767f]">
            Scanned {results.tools.length} pages at{' '}
            {new Date(results.scannedAt).toLocaleString()}
          </p>

          {/* Tool list */}
          <div className="space-y-2">
            {results.tools
              .sort((a, b) => a.score - b.score)
              .map((tool) => (
                <ToolCard
                  key={tool.slug}
                  tool={tool}
                  expanded={expandedSlug === tool.slug}
                  onToggle={() => setExpandedSlug(expandedSlug === tool.slug ? null : tool.slug)}
                />
              ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!scanning && !results && !error && (
        <div className="text-center py-16">
          <svg className="w-12 h-12 mx-auto text-[#70767f] mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-[#a6abb5]">Click &ldquo;Run Full Audit&rdquo; to scan all tool pages for SEO issues.</p>
        </div>
      )}
    </div>
  )
}

// ── ToolCard ─────────────────────────────────────────────────────────────────

function ToolCard({
  tool,
  expanded,
  onToggle,
}: {
  tool: ToolAuditResult
  expanded: boolean
  onToggle: () => void
}) {
  const criticals = tool.issues.filter(i => i.type === 'critical').length
  const warnings = tool.issues.filter(i => i.type === 'warning').length

  return (
    <div className="bg-[#131a23] border border-[#1e2631] rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full min-h-[44px] flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#1a2230] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-lg font-bold tabular-nums ${scoreColor(tool.score)}`}>
            {tool.score}
          </span>
          <span className="text-sm text-white truncate">{tool.name}</span>
          <span className="text-xs text-[#70767f] truncate">/tools/{tool.slug}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {criticals > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/40 text-red-400 border border-red-800">
              {criticals} critical
            </span>
          )}
          {warnings > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-800">
              {warnings} warn
            </span>
          )}
          <svg
            className={`w-4 h-4 text-[#70767f] transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {expanded && tool.issues.length > 0 && (
        <div className="border-t border-[#1e2631] px-4 py-3 space-y-2">
          {tool.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              {issueIcon(issue.type)}
              <div className="min-w-0">
                <p className="text-[#a6abb5]">{issue.message}</p>
                {issue.current && (
                  <p className="text-xs text-[#70767f] mt-0.5">
                    Current: <span className="text-[#a6abb5]">{issue.current}</span>
                  </p>
                )}
                {issue.recommended && (
                  <p className="text-xs text-[#70767f] mt-0.5">
                    Recommended: <span className="text-green-400">{issue.recommended}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && tool.issues.length === 0 && (
        <div className="border-t border-[#1e2631] px-4 py-3">
          <p className="text-sm text-green-400">No issues found — all checks passed.</p>
        </div>
      )}
    </div>
  )
}
