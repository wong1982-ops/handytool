'use client'

import { useRef, useCallback, useMemo } from 'react'
import type { RegexMatch } from './types'

interface TestInputProps {
  value: string
  onChange: (value: string) => void
  matches: RegexMatch[]
  disabled?: boolean
}

const HIGHLIGHT_COLORS = [
  'rgba(250, 204, 21, 0.4)',  // yellow
  'rgba(34, 211, 238, 0.4)',  // cyan
  'rgba(244, 114, 182, 0.4)', // pink
  'rgba(74, 222, 128, 0.4)',  // green
]

const MAX_HIGHLIGHT_LENGTH = 50000

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br/>')
}

export function TestInput({ value, onChange, matches, disabled }: TestInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  const shouldHighlight = value.length <= MAX_HIGHLIGHT_LENGTH && matches.length > 0

  const highlightHtml = useMemo(() => {
    if (!shouldHighlight) return ''

    // Sort matches by start, skip overlapping
    const sorted = [...matches].sort((a, b) => a.start - b.start)
    const nonOverlapping: RegexMatch[] = []
    let lastEnd = 0
    for (const m of sorted) {
      if (m.start >= lastEnd) {
        nonOverlapping.push(m)
        lastEnd = m.end
      }
    }

    let html = ''
    let cursor = 0

    for (let i = 0; i < nonOverlapping.length; i++) {
      const m = nonOverlapping[i]
      // Unmatched text before this match
      if (cursor < m.start) {
        html += escapeHtml(value.slice(cursor, m.start))
      }
      // Matched text
      const color = HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length]
      html += `<mark style="background:${color};color:inherit;border-radius:2px">${escapeHtml(value.slice(m.start, m.end))}</mark>`
      cursor = m.end
    }

    // Remaining text
    if (cursor < value.length) {
      html += escapeHtml(value.slice(cursor))
    }

    // Ensure trailing newline renders correctly
    html += '<br/>'

    return html
  }, [value, matches, shouldHighlight])

  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        Test String
      </label>

      <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden focus-within:border-[var(--tk-color-primary-500)] focus-within:ring-2 focus-within:ring-[var(--tk-color-primary-500)]/30 transition-colors">
        {/* Highlight layer */}
        {shouldHighlight && (
          <div
            ref={highlightRef}
            className="absolute inset-0 p-3 font-mono text-sm whitespace-pre-wrap break-words overflow-hidden pointer-events-none"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: highlightHtml }}
          />
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          rows={8}
          disabled={disabled}
          placeholder="Enter test text here..."
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className={`relative w-full p-3 font-mono text-sm resize-y focus:outline-none min-h-[120px] ${
            shouldHighlight
              ? 'text-transparent caret-slate-900 dark:caret-white bg-transparent'
              : 'text-slate-900 dark:text-white bg-transparent'
          } placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Test string input"
        />
      </div>

      {/* Warning for large input */}
      {value.length > MAX_HIGHLIGHT_LENGTH && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
          Highlighting disabled for large input ({(value.length / 1000).toFixed(0)}k chars). Matching still works.
        </p>
      )}
    </div>
  )
}
