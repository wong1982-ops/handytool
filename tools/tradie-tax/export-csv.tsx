'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
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
  const [showSignIn, setShowSignIn] = useState(false)

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
    if (!user) {
      setShowSignIn(true)
      return
    }
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
        {user ? 'Download CSV' : 'Sign in to Download CSV'}
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

      {/* Sign-in modal */}
      {showSignIn && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signin-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSignIn(false) }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4">
            <h2 id="signin-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white text-center">
              Sign in to export your data
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Sign in to download your expense data as a CSV file.
            </p>
            <button
              onClick={async () => {
                try { await signInWithOAuth('google') } catch { /* ignore */ }
              }}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            <button onClick={() => setShowSignIn(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-500 dark:text-[#70767f] text-center leading-relaxed">
        This tool provides estimates only. Tax obligations may vary. Consult a qualified accountant or visit{' '}
        <a href="https://www.ird.govt.nz" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">ird.govt.nz</a>{' '}
        for official information.
      </p>
    </div>
  )
}
