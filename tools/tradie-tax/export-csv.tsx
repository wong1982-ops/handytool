'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { EXPENSE_CATEGORIES } from './tax-data'
import type { ExpenseEntry, TaxCategory } from './types'

const LS_KEY = 'tradie-tax-entries'

function loadLocal(): ExpenseEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function entriesToCsv(entries: ExpenseEntry[]): string {
  const header = 'Date,Description,Amount,Category,Type,GST Inclusive'
  const rows = entries.map((e) => {
    const desc = e.description.replace(/"/g, '""')
    const catInfo = EXPENSE_CATEGORIES[e.category]
    const catLabel = catInfo ? catInfo.label : e.category
    return `${e.date},"${desc}",${e.amount.toFixed(2)},${catLabel},${e.type},${e.gstInclusive ? 'Yes' : 'No'}`
  })
  return [header, ...rows].join('\n')
}

export default function ExportCsv() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<ExpenseEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    if (user) {
      try {
        const res = await fetch('/api/v1/tradie-tax/entries')
        if (res.ok) {
          const json = await res.json()
          const mapped: ExpenseEntry[] = (json.data?.entries || []).map((e: Record<string, unknown>) => ({
            id: e.id as string,
            date: e.date as string,
            description: e.description as string,
            amount: Number(e.amount),
            category: e.category as TaxCategory,
            type: e.entry_type as 'income' | 'expense',
            gstInclusive: e.gst_inclusive as boolean,
          }))
          setEntries(mapped)
          setLoading(false)
          return
        }
      } catch { /* fall through */ }
    }
    setEntries(loadLocal())
    setLoading(false)
  }, [user])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const handleDownload = () => {
    const csv = entriesToCsv(entries)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tradie-tax-export-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const totalIncome = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpenses = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)

  if (loading) {
    return <div className="text-center py-20 text-slate-400 dark:text-[#70767f]">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-xl border border-white/10 bg-[#1e2631] p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">Export Summary</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Entries</p>
            <p className="text-lg font-bold text-white">{entries.length}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Income</p>
            <p className="text-lg font-bold text-green-400 tabular-nums">
              ${totalIncome.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Expenses</p>
            <p className="text-lg font-bold text-red-400 tabular-nums">
              ${totalExpenses.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Preview table */}
      {entries.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#1e2631] overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">Preview (first 10 rows)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Description</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 font-medium">Category</th>
                  <th className="text-left px-4 py-2 font-medium">Type</th>
                  <th className="text-left px-4 py-2 font-medium">GST</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 10).map((entry) => {
                  const info = EXPENSE_CATEGORIES[entry.category] || EXPENSE_CATEGORIES['other-deduction']
                  return (
                    <tr key={entry.id} className="border-b border-white/5">
                      <td className="px-4 py-2 text-slate-300 tabular-nums whitespace-nowrap">{entry.date}</td>
                      <td className="px-4 py-2 text-slate-300 max-w-[200px] truncate">{entry.description}</td>
                      <td className={`px-4 py-2 text-right tabular-nums font-medium ${entry.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        ${entry.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-slate-400">{info.label}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          entry.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-500">{entry.gstInclusive ? 'Yes' : 'No'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {entries.length > 10 && (
            <p className="text-xs text-slate-500 px-4 py-2 text-center">
              ...and {entries.length - 10} more rows
            </p>
          )}
        </div>
      )}

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={entries.length === 0}
        className="w-full min-h-[44px] rounded-xl bg-[#3D6AF2] text-white text-sm font-medium hover:bg-[#3D79F2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Download CSV
      </button>

      {entries.length === 0 && (
        <p className="text-sm text-slate-500 text-center">
          Add some income and expense entries first, then come back here to export them.
        </p>
      )}

      {/* CSV format info */}
      <div className="rounded-xl border border-white/10 bg-[#1e2631] p-4 space-y-2">
        <h3 className="text-sm font-semibold text-white">CSV Columns</h3>
        <p className="text-xs text-slate-400 font-mono">Date, Description, Amount, Category, Type, GST Inclusive</p>
        <p className="text-xs text-slate-500">
          Compatible with Excel, Google Sheets, and most accounting software. Send this to your accountant for easy record-keeping.
        </p>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-500 dark:text-[#70767f] text-center leading-relaxed">
        This tool provides estimates only. Tax obligations may vary. Consult a qualified accountant or visit{' '}
        <a href="https://www.ird.govt.nz" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">ird.govt.nz</a>{' '}
        for official information.
      </p>
    </div>
  )
}
