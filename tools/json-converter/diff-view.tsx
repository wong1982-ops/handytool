'use client'

import { useMemo } from 'react'

interface DiffViewProps {
  leftText: string
  rightText: string
}

interface DiffEntry {
  path: string
  type: 'added' | 'removed' | 'changed' | 'unchanged'
  leftValue?: unknown
  rightValue?: unknown
}

function deepDiff(left: unknown, right: unknown, path = '$'): DiffEntry[] {
  const entries: DiffEntry[] = []

  if (left === right) {
    entries.push({ path, type: 'unchanged', leftValue: left, rightValue: right })
    return entries
  }

  if (left === undefined && right !== undefined) {
    entries.push({ path, type: 'added', rightValue: right })
    return entries
  }

  if (left !== undefined && right === undefined) {
    entries.push({ path, type: 'removed', leftValue: left })
    return entries
  }

  if (left === null || right === null || typeof left !== typeof right) {
    entries.push({ path, type: 'changed', leftValue: left, rightValue: right })
    return entries
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLen = Math.max(left.length, right.length)
    for (let i = 0; i < maxLen; i++) {
      if (i >= left.length) {
        entries.push({ path: `${path}[${i}]`, type: 'added', rightValue: right[i] })
      } else if (i >= right.length) {
        entries.push({ path: `${path}[${i}]`, type: 'removed', leftValue: left[i] })
      } else {
        entries.push(...deepDiff(left[i], right[i], `${path}[${i}]`))
      }
    }
    return entries
  }

  if (typeof left === 'object' && typeof right === 'object' && left !== null && right !== null) {
    const leftObj = left as Record<string, unknown>
    const rightObj = right as Record<string, unknown>
    const allKeys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)])

    for (const key of allKeys) {
      const childPath = `${path}.${key}`
      if (!(key in leftObj)) {
        entries.push({ path: childPath, type: 'added', rightValue: rightObj[key] })
      } else if (!(key in rightObj)) {
        entries.push({ path: childPath, type: 'removed', leftValue: leftObj[key] })
      } else {
        entries.push(...deepDiff(leftObj[key], rightObj[key], childPath))
      }
    }
    return entries
  }

  // Primitive values that differ
  entries.push({ path, type: 'changed', leftValue: left, rightValue: right })
  return entries
}

function formatValue(value: unknown): string {
  if (value === undefined) return ''
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object' && value !== null) {
    try { return JSON.stringify(value, null, 2) } catch { return String(value) }
  }
  return String(value)
}

function lineDiff(leftLines: string[], rightLines: string[]): { left: LineDiff[]; right: LineDiff[] } {
  // Simple LCS-based line diff
  const m = leftLines.length
  const n = rightLines.length

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack
  const leftResult: LineDiff[] = []
  const rightResult: LineDiff[] = []
  let i = m, j = n
  const leftTemp: LineDiff[] = []
  const rightTemp: LineDiff[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      leftTemp.push({ text: leftLines[i - 1], type: 'unchanged' })
      rightTemp.push({ text: rightLines[j - 1], type: 'unchanged' })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      leftTemp.push({ text: '', type: 'padding' })
      rightTemp.push({ text: rightLines[j - 1], type: 'added' })
      j--
    } else {
      leftTemp.push({ text: leftLines[i - 1], type: 'removed' })
      rightTemp.push({ text: '', type: 'padding' })
      i--
    }
  }

  leftTemp.reverse()
  rightTemp.reverse()

  // Post-process: detect changed lines (removed followed by added at same position)
  for (let k = 0; k < leftTemp.length; k++) {
    const l = leftTemp[k]
    const r = rightTemp[k]
    if (l.type === 'removed' && r.type === 'padding') {
      // Check if the next line is the reverse
      if (k + 1 < leftTemp.length && leftTemp[k + 1].type === 'padding' && rightTemp[k + 1].type === 'added') {
        leftResult.push({ text: l.text, type: 'changed' })
        rightResult.push({ text: rightTemp[k + 1].text, type: 'changed' })
        leftResult.push({ text: '', type: 'padding' })
        rightResult.push({ text: '', type: 'padding' })
        k++ // skip next
        continue
      }
    }
    leftResult.push(l)
    rightResult.push(r)
  }

  return { left: leftResult, right: rightResult }
}

interface LineDiff {
  text: string
  type: 'added' | 'removed' | 'changed' | 'unchanged' | 'padding'
}

export function DiffView({ leftText, rightText }: DiffViewProps) {
  const { structuredDiff, textDiff } = useMemo(() => {
    let structured: DiffEntry[] | null = null
    let leftParsed: unknown = undefined
    let rightParsed: unknown = undefined

    try { leftParsed = JSON.parse(leftText) } catch { /* not json */ }
    try { rightParsed = JSON.parse(rightText) } catch { /* not json */ }

    if (leftParsed !== undefined && rightParsed !== undefined) {
      structured = deepDiff(leftParsed, rightParsed)
    }

    // Always compute text diff
    const leftLines = leftText.split('\n')
    const rightLines = rightText.split('\n')
    const text = lineDiff(leftLines, rightLines)

    return { structuredDiff: structured, textDiff: text }
  }, [leftText, rightText])

  const stats = useMemo(() => {
    if (!structuredDiff) {
      const added = textDiff.right.filter(l => l.type === 'added').length
      const removed = textDiff.left.filter(l => l.type === 'removed').length
      const changed = textDiff.left.filter(l => l.type === 'changed').length
      return { added, removed, changed }
    }
    const added = structuredDiff.filter(e => e.type === 'added').length
    const removed = structuredDiff.filter(e => e.type === 'removed').length
    const changed = structuredDiff.filter(e => e.type === 'changed').length
    return { added, removed, changed }
  }, [structuredDiff, textDiff])

  const hasNoDiff = stats.added === 0 && stats.removed === 0 && stats.changed === 0

  if (!leftText.trim() && !rightText.trim()) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm p-8">
        Paste or type content in both panels to compare.
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Summary stats */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        {hasNoDiff ? (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            No differences found
          </span>
        ) : (
          <>
            {stats.added > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {stats.added} added
              </span>
            )}
            {stats.removed > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-500">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {stats.removed} removed
              </span>
            )}
            {stats.changed > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {stats.changed} changed
              </span>
            )}
          </>
        )}
      </div>

      {/* Two-column text diff */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left column */}
        <div className="flex-1 overflow-auto border-r border-slate-200 dark:border-slate-800 font-mono text-[13px] leading-relaxed">
          {textDiff.left.map((line, i) => (
            <div
              key={i}
              className={`px-3 py-0.5 min-h-[24px] whitespace-pre-wrap break-all ${
                line.type === 'removed'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  : line.type === 'changed'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                    : line.type === 'padding'
                      ? 'bg-slate-50 dark:bg-slate-900/50 text-transparent select-none'
                      : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="inline-block w-8 text-right mr-3 text-[11px] text-slate-400 dark:text-slate-600 select-none">
                {line.type !== 'padding' ? i + 1 : ''}
              </span>
              {line.text || '\u00A0'}
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="flex-1 overflow-auto font-mono text-[13px] leading-relaxed">
          {textDiff.right.map((line, i) => (
            <div
              key={i}
              className={`px-3 py-0.5 min-h-[24px] whitespace-pre-wrap break-all ${
                line.type === 'added'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                  : line.type === 'changed'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                    : line.type === 'padding'
                      ? 'bg-slate-50 dark:bg-slate-900/50 text-transparent select-none'
                      : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="inline-block w-8 text-right mr-3 text-[11px] text-slate-400 dark:text-slate-600 select-none">
                {line.type !== 'padding' ? i + 1 : ''}
              </span>
              {line.text || '\u00A0'}
            </div>
          ))}
        </div>
      </div>

      {/* Structured diff (JSON only) */}
      {structuredDiff && structuredDiff.filter(e => e.type !== 'unchanged').length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 max-h-48 overflow-auto shrink-0">
          <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Structural Changes</span>
          </div>
          <div className="font-mono text-[12px]">
            {structuredDiff.filter(e => e.type !== 'unchanged').map((entry, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 px-3 py-1 border-b border-slate-50 dark:border-slate-900 last:border-b-0 ${
                  entry.type === 'added'
                    ? 'bg-emerald-50 dark:bg-emerald-900/10'
                    : entry.type === 'removed'
                      ? 'bg-red-50 dark:bg-red-900/10'
                      : 'bg-amber-50 dark:bg-amber-900/10'
                }`}
              >
                <span className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  entry.type === 'added'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : entry.type === 'removed'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                }`}>
                  {entry.type === 'added' ? '+' : entry.type === 'removed' ? '-' : '~'}
                </span>
                <span className="text-violet-600 dark:text-violet-400 shrink-0">{entry.path}</span>
                {entry.type === 'changed' && (
                  <span className="text-slate-500 dark:text-slate-400 truncate">
                    {formatValue(entry.leftValue)} → {formatValue(entry.rightValue)}
                  </span>
                )}
                {entry.type === 'added' && (
                  <span className="text-emerald-600 dark:text-emerald-400 truncate">{formatValue(entry.rightValue)}</span>
                )}
                {entry.type === 'removed' && (
                  <span className="text-red-600 dark:text-red-400 truncate">{formatValue(entry.leftValue)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
