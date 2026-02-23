'use client'

import type { ScoreEntry } from './types'

interface ResultsTableProps {
  history: ScoreEntry[]
  unit: string
  best: number
  lowerIsBetter: boolean
  onClear: () => void
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

function getStatus(
  score: number,
  best: number,
  lowerIsBetter: boolean,
): { label: string; className: string } {
  if (score === best) {
    return { label: 'FASTEST', className: 'text-green-400' }
  }

  const ratio = lowerIsBetter ? score / best : best / score
  if (ratio <= 1.1) {
    return { label: 'AVERAGE', className: 'text-amber-400' }
  }

  return { label: 'NORMAL', className: 'text-slate-400' }
}

export function ResultsTable({
  history,
  unit,
  best,
  lowerIsBetter,
  onClear,
}: ResultsTableProps) {
  if (history.length === 0) return null

  const recent = [...history].reverse().slice(0, 10)

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900 dark:text-white font-bold text-lg">
          Recent Results
        </h3>
        <button
          onClick={onClear}
          className="text-xs font-bold uppercase tracking-widest text-[var(--tk-color-primary-500)] hover:opacity-80 transition-opacity min-h-[44px] px-2"
        >
          Clear History
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="text-left text-[10px] uppercase font-bold text-slate-400 tracking-widest px-4 py-3">
                Attempt
              </th>
              <th className="text-left text-[10px] uppercase font-bold text-slate-400 tracking-widest px-4 py-3">
                Score
              </th>
              <th className="text-left text-[10px] uppercase font-bold text-slate-400 tracking-widest px-4 py-3 hidden sm:table-cell">
                Date
              </th>
              <th className="text-right text-[10px] uppercase font-bold text-slate-400 tracking-widest px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {recent.map((entry, idx) => {
              const attemptNum = history.length - idx
              const status = getStatus(entry.score, best, lowerIsBetter)

              return (
                <tr
                  key={`${entry.date}-${idx}`}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                >
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    #{attemptNum}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[var(--tk-color-primary-500)]">
                    {entry.score} {unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                    {getTimeAgo(entry.date)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
