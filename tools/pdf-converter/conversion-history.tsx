'use client'

import type { ConversionRecord } from './use-conversion-history'

interface ConversionHistoryProps {
  records: ConversionRecord[]
  onClear: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    'pdf-to-images': 'PDF to Images',
    'images-to-pdf': 'Images to PDF',
    'merge-pdf': 'Merge PDF',
    'split-pdf': 'Split PDF',
    'compress-pdf': 'Compress PDF',
    'pdf-to-word': 'PDF to Word',
    'word-to-pdf': 'Word to PDF',
    'pdf-to-excel': 'PDF to Excel',
    'watermark': 'Watermark',
    'manage-pages': 'Page Manager',
  }
  return labels[mode] || mode
}

export function ConversionHistory({ records, onClear }: ConversionHistoryProps) {
  if (records.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Recent Conversions</h3>
        </div>
        <button
          onClick={onClear}
          className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">File</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mode</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Size</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((record) => (
              <tr key={record.id} className="bg-white dark:bg-slate-900">
                <td className="px-4 py-3 text-slate-900 dark:text-white font-medium truncate max-w-[200px]">{record.filename}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{getModeLabel(record.mode)}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {formatBytes(record.inputSize)}
                  <span className="mx-1 text-slate-300 dark:text-slate-600">&rarr;</span>
                  {formatBytes(record.outputSize)}
                </td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatRelativeTime(record.timestamp)}</td>
                <td className="px-4 py-3 text-center">
                  {record.status === 'success' ? (
                    <svg className="w-4 h-4 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {records.map((record) => (
          <div
            key={record.id}
            className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{record.filename}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {getModeLabel(record.mode)} &middot; {formatRelativeTime(record.timestamp)}
                </p>
              </div>
              {record.status === 'success' ? (
                <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatBytes(record.inputSize)}
              <span className="mx-1 text-slate-300 dark:text-slate-600">&rarr;</span>
              {formatBytes(record.outputSize)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
