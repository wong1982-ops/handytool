'use client'

import { useState, useCallback } from 'react'
import type { RegexMatch } from './types'

interface MatchResultsProps {
  matches: RegexMatch[]
  matchCount: number
  groupCount: number
  hasRegex: boolean
  hasInput: boolean
}

export function MatchResults({ matches, matchCount, groupCount, hasRegex, hasInput }: MatchResultsProps) {
  // Empty states
  if (!hasRegex) {
    return (
      <EmptyState icon={<RegexIcon />} message="Enter a regex pattern or select a preset" />
    )
  }
  if (!hasInput) {
    return (
      <EmptyState icon={<TextIcon />} message="Enter test text to see matches" />
    )
  }
  if (matchCount === 0) {
    return (
      <EmptyState icon={<NoMatchIcon />} message="No matches found" />
    )
  }

  const truncated = matchCount > matches.length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Matches
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="px-2 py-0.5 rounded-full bg-[var(--tk-color-primary-500)]/10 text-[var(--tk-color-primary-600)] dark:text-[var(--tk-color-primary-400)] font-semibold">
            {matchCount} match{matchCount !== 1 ? 'es' : ''}
          </span>
          {groupCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
              {groupCount} group{groupCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Match list */}
      <div className="max-h-[400px] overflow-y-auto space-y-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
        {matches.map((match) => (
          <MatchRow key={match.index} match={match} />
        ))}

        {truncated && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium text-center py-2">
            Showing first {matches.length} of {matchCount} matches.
          </p>
        )}
      </div>
    </div>
  )
}

function MatchRow({ match }: { match: RegexMatch }) {
  const [expanded, setExpanded] = useState(false)
  const hasGroups = Object.keys(match.groups).length > 0

  const toggle = useCallback(() => {
    if (hasGroups) setExpanded((prev) => !prev)
  }, [hasGroups])

  return (
    <div className="rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
      <button
        onClick={toggle}
        className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors min-h-[44px] ${
          hasGroups ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'cursor-default'
        }`}
        aria-expanded={hasGroups ? expanded : undefined}
      >
        {/* Index */}
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-6 shrink-0 text-right">
          #{match.index}
        </span>

        {/* Value */}
        <span className="font-mono text-xs text-slate-900 dark:text-white truncate flex-1">
          &ldquo;{match.value}&rdquo;
        </span>

        {/* Position */}
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
          {match.start}-{match.end}
        </span>

        {/* Expand indicator */}
        {hasGroups && (
          <svg
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Groups */}
      {expanded && hasGroups && (
        <div className="px-3 pb-2 pt-0">
          <table className="w-full text-xs">
            <tbody>
              {Object.entries(match.groups).map(([key, val]) => (
                <tr key={key} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-1 pr-3 font-mono font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {key}
                  </td>
                  <td className="py-1 font-mono text-slate-700 dark:text-slate-300 break-all">
                    {val ?? <span className="text-slate-400 italic">undefined</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-600">{icon}</div>
      <p className="text-sm text-slate-400 dark:text-slate-500">{message}</p>
    </div>
  )
}

function RegexIcon() {
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h10M4 14h16M4 18h10" />
    </svg>
  )
}

function TextIcon() {
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function NoMatchIcon() {
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H9" />
    </svg>
  )
}
